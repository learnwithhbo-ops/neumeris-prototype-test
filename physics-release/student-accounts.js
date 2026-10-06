import {ProgressStore, PROGRESS_BATCHES, PROGRESS_SCHEMA, browserStorage, validateRecord, validateSnapshot} from './originals-progress.js';
import {ASSESSMENT_REVISION} from './originals-contracts.js';

const SESSION_KEY = 'neumeris.originals.auth.session.v1';
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const userView = user => user && uuid(user.id) ? {id: user.id, email: typeof user.email === 'string' ? user.email : ''} : null;

export function validateAccountConfig(config = {}) {
  if (config.enabled !== true) return {enabled: false};
  let url;
  try { url = new URL(config.url); } catch { throw new Error('Student accounts need a valid provider URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) throw new Error('Student accounts need a secure provider URL.');
  const key = config.publishable_key;
  if (typeof key !== 'string' || !key || key.startsWith('sb_secret_')) throw new Error('Use only a public publishable key for student accounts.');
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    try {
      const body = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (body.role !== 'anon') throw new Error('Not anonymous');
    } catch { throw new Error('Use a publishable key or legacy anon key, never a service-role key.'); }
  }
  if (config.enabled_batches !== undefined && (!Array.isArray(config.enabled_batches) || !config.enabled_batches.length || new Set(config.enabled_batches).size !== config.enabled_batches.length || config.enabled_batches.some(id => !Object.hasOwn(PROGRESS_BATCHES, id)))) throw new Error('Student accounts need known, distinct enabled sets.');
  return {enabled: true, url: url.origin, publishable_key: key, ...(config.enabled_batches ? {enabled_batches: [...config.enabled_batches]} : {})};
}

function sessionFrom(value, now) {
  if (!value || typeof value.access_token !== 'string' || !value.access_token || typeof value.refresh_token !== 'string' || !value.refresh_token || !userView(value.user)) throw new Error('The account provider returned an invalid session.');
  const expires = Number.isFinite(value.expires_at) ? value.expires_at * 1000 : now + Number(value.expires_in) * 1000;
  if (!Number.isFinite(expires) || expires <= 0) throw new Error('The account provider returned an invalid expiry.');
  return {access_token: value.access_token, refresh_token: value.refresh_token, expires_at: Math.floor(expires / 1000), user: userView(value.user)};
}

/** Optional provider-backed accounts. No password or locally invented login is stored. */
export class StudentAccounts {
  constructor({config = {}, deviceStore = new ProgressStore(), storage = browserStorage(), sessionStorage = browserStorage('sessionStorage'), fetcher = (...args) => globalThis.fetch(...args), now = () => Date.now(), onChange = () => {}, debounceMs = 800} = {}) {
    this.config = validateAccountConfig(config); this.deviceStore = deviceStore; this.storage = storage; this.sessionStorage = sessionStorage;
    this.batchId = deviceStore.batchId;
    // The installed pilot database supports Sets 1 and 2. A new set remains
    // device-only until its staged migration and live checks are completed.
    const enabledBatches = this.config.enabled_batches || ['physics-foundations-01', 'physics-foundations-02'];
    if (this.config.enabled && (!enabledBatches.includes(this.batchId) || deviceStore.contentRevision)) this.config = {enabled: false};
    this.fetcher = fetcher; this.now = now; this.onChange = onChange; this.debounceMs = debounceMs;
    this.session = null; this.accountStore = null; this.activeUser = null; this.generation = 0; this.revision = 0;
    this.credentialEpoch = 0; this.disposed = false;
    this.syncStatus = this.config.enabled ? 'signed-out' : 'disabled'; this.message = this.config.enabled ? 'Sign in to save progress across devices.' : 'Accounts are not configured. Answers are saved on this device.';
    this.lastSyncedAt = null; this._timer = null; this._sync = null; this._refresh = null; this._suppress = false;
    this.cacheWarning = '';
  }

  get currentStore() { return this.accountStore || this.deviceStore; }
  state() { return {enabled: this.config.enabled, authenticated: Boolean(this.session && this.activeUser && this.session.user.id === this.activeUser.id), user: this.activeUser, mode: this.accountStore ? 'account' : 'device', sync_status: this.syncStatus, message: `${this.message}${this.cacheWarning && !this.message.includes(this.cacheWarning) ? ` ${this.cacheWarning}` : ''}`, last_synced_at: this.lastSyncedAt, storage: {...this.currentStore.status}}; }
  _emit() { if (!this.disposed) this.onChange(this.state()); }
  _credentialCurrent(epoch) { return !this.disposed && this.credentialEpoch === epoch; }
  _cancelled() { return {...this.state(), cancelled: true}; }
  _remember() {
    try { this.sessionStorage?.setItem(SESSION_KEY, JSON.stringify(this.session)); } catch { /* Still authenticated in memory for this tab. */ }
  }
  _forget() { try { this.sessionStorage?.removeItem(SESSION_KEY); return true; } catch { return false; } }
  _clearUserCaches(userId) {
    if (!uuid(userId)) return true;
    let cleared = true;
    const suppress = this._suppress; this._suppress = true;
    try {
      if (this.accountStore && this.activeUser?.id === userId) {
        this.accountStore.clear();
        if (this.accountStore.status.message.includes('could not remove')) cleared = false;
      }
      // Sign-out/account switching is a privacy action across all known sets,
      // whereas resetting answers is deliberately limited to the open set.
      for (const key of new Set([...Object.values(PROGRESS_BATCHES).flatMap(batch => [batch.key, `${batch.key}.${ASSESSMENT_REVISION}`]), this.deviceStore.key])) {
        try { this.storage?.removeItem(`${key}.user.${userId}`); } catch { cleared = false; }
      }
    } finally { this._suppress = suppress; }
    if (!cleared) this.cacheWarning = 'This browser could not clear cached account data. Clear site data before leaving a shared device.';
    return cleared;
  }
  _requireEnabled() {
    if (this.disposed) throw new Error('This student account view is closed.');
    if (!this.config.enabled) throw new Error('Student accounts are not configured yet. Device progress is available.');
  }

  async _request(path, {method = 'GET', body, token, authError = false} = {}) {
    let response;
    try {
      response = await this.fetcher(`${this.config.url}${path}`, {method, cache: 'no-store', headers: {apikey: this.config.publishable_key, Accept: 'application/json', ...(body === undefined ? {} : {'Content-Type': 'application/json'}), ...(token ? {Authorization: `Bearer ${token}`} : {})}, ...(body === undefined ? {} : {body: JSON.stringify(body)})});
    } catch { throw new Error('The account service could not be reached. Your answers remain on this device.'); }
    if (!response.ok) {
      const error = new Error(response.status === 429 ? 'Too many account requests. Please try again later.' : authError ? 'The account request was not accepted. Check your credentials and email confirmation.' : response.status === 401 ? 'Your session has expired. Sign in again to sync saved answers.' : 'Progress could not sync. Your answers remain on this device.');
      error.status = response.status; throw error;
    }
    if (response.status === 204 || response.headers?.get?.('content-length') === '0') return null;
    try { return await response.json(); } catch { return null; }
  }

  _activate(session) {
    const sameUser = this.accountStore && this.activeUser?.id === session.user.id;
    let previousUserId = this.activeUser?.id || this.session?.user?.id;
    if (!previousUserId) { try { previousUserId = JSON.parse(this.sessionStorage?.getItem(SESSION_KEY) || 'null')?.user?.id; } catch { /* Invalid session is not an identity. */ } }
    const cacheCleared = previousUserId === session.user.id || this._clearUserCaches(previousUserId);
    clearTimeout(this._timer); this._timer = null;
    this.session = session; this.activeUser = userView(session.user); this.generation++; this.revision = 0;
    if (!sameUser) this.accountStore = new ProgressStore({storage: this.storage, batchId: this.batchId, key: `${this.deviceStore.key}.user.${this.activeUser.id}`, now: this.now, onChange: () => {
      if (this._suppress) return;
      this.revision++; this.syncStatus = 'pending'; this.message = 'Answers saved locally; waiting to sync.'; this._emit(); this._schedule();
    }});
    this._remember(); this.syncStatus = 'pending'; this.message = cacheCleared ? 'Loading your account progress…' : 'Loading your account progress. This browser could not clear the previous account cache; clear site data before leaving a shared device.'; this._emit();
  }

  async initialize() {
    if (this.disposed) return this._cancelled();
    if (!this.config.enabled) return this.state();
    const epoch = ++this.credentialEpoch;
    let saved, parsedSession = false;
    try { saved = JSON.parse(this.sessionStorage?.getItem(SESSION_KEY) || 'null'); } catch { this._forget(); return this.state(); }
    if (!saved) return this.state();
    try {
      // Cached identity is not shown until the provider verifies the saved session.
      this.session = sessionFrom(saved, this.now());
      parsedSession = true;
      await this.ensureSession();
      if (!this._credentialCurrent(epoch)) return this._cancelled();
      const verified = userView(await this._request('/auth/v1/user', {token: this.session.access_token}));
      if (!this._credentialCurrent(epoch)) return this._cancelled();
      if (!verified || verified.id !== this.session.user.id) { const error = new Error('Your session could not be verified. Sign in again.'); error.status = 401; throw error; }
      this._activate({...this.session, user: verified});
      await this.sync();
      if (!this._credentialCurrent(epoch)) return this._cancelled();
    } catch (error) {
      if (!this._credentialCurrent(epoch)) return this._cancelled();
      if (!this.activeUser || [400, 401, 403].includes(error.status)) {
        const clearCaches = !parsedSession || [400, 401, 403].includes(error.status);
        const cleared = clearCaches ? this._clearUserCaches(saved?.user?.id) : true;
        this.session = null; this._forget(); this.accountStore = null; this.activeUser = null;
        if (!cleared) error.message += ' This browser could not clear cached account data. Clear site data before leaving a shared device.';
      }
      this.syncStatus = 'error'; this.message = error.message; this._emit();
    }
    return this.state();
  }

  async signIn(email, password) {
    this._requireEnabled();
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) throw new Error('Enter your email and password.');
    const epoch = ++this.credentialEpoch;
    try {
      const data = await this._request('/auth/v1/token?grant_type=password', {method: 'POST', body: {email: email.trim(), password}, authError: true});
      if (!this._credentialCurrent(epoch)) return this._cancelled();
      this._activate(sessionFrom(data, this.now()));
      await this.sync();
      return this._credentialCurrent(epoch) ? this.state() : this._cancelled();
    } catch (error) {
      if (!this._credentialCurrent(epoch)) return this._cancelled();
      throw error;
    }
  }

  async signUp(email, password) {
    this._requireEnabled();
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || password.length < 8) throw new Error('Enter an email and a password with at least eight characters.');
    const epoch = ++this.credentialEpoch;
    try {
      await this._request('/auth/v1/signup', {method: 'POST', body: {email: email.trim(), password}, authError: true});
      if (!this._credentialCurrent(epoch)) return this._cancelled();
      return {confirmation_required: true, message: 'Check your email to confirm the account, then sign in here.'};
    } catch (error) {
      if (!this._credentialCurrent(epoch)) return this._cancelled();
      throw error;
    }
  }

  async ensureSession() {
    if (!this.session) throw new Error('Sign in to sync your account progress.');
    if (this.session.expires_at * 1000 > this.now() + 60000) return this.session;
    if (this._refresh?.generation === this.generation) return this._refresh.promise;
    const generation = this.generation, current = this.session;
    const refresh = {generation, promise: null}; this._refresh = refresh;
    refresh.promise = (async () => {
      try {
        const refreshed = sessionFrom(await this._request('/auth/v1/token?grant_type=refresh_token', {method: 'POST', body: {refresh_token: current.refresh_token}, authError: true}), this.now());
        if (generation !== this.generation) throw new Error('The account changed while refreshing.');
        if (refreshed.user.id !== current.user.id) throw new Error('The refreshed account identity did not match.');
        this.session = refreshed; this._remember(); return this.session;
      } catch (error) {
        if (generation === this.generation && [400, 401, 403].includes(error.status)) {
          const cleared = this._clearUserCaches(current.user.id);
          this.session = null; this._forget(); this.accountStore = null; this.activeUser = null; this.generation++;
          this.lastSyncedAt = null; this.syncStatus = 'signed-out'; this.message = 'Your session is no longer valid. Sign in again.';
          if (!cleared) this.message += ' This browser could not clear cached account data. Clear site data before leaving a shared device.';
          this._emit();
        }
        throw error;
      } finally { if (this._refresh === refresh) this._refresh = null; }
    })();
    return refresh.promise;
  }

  _schedule() {
    clearTimeout(this._timer);
    if (!this.session) return;
    this._timer = setTimeout(() => { this._timer = null; void this.sync().catch(() => {}); }, this.debounceMs);
    this._timer?.unref?.();
  }

  async _remoteRecords(token, userId) {
    const rows = await this._request(`/rest/v1/originals_progress?select=question_id,document&user_id=eq.${encodeURIComponent(userId)}&question_id=like.neo-${this.batchId}-q*&limit=12`, {token});
    if (!Array.isArray(rows) || rows.length > 12) throw new Error('The saved progress response was invalid.');
    const records = {};
    for (const row of rows) {
      if (row?.document?.question_id !== row.question_id || Object.hasOwn(records, row.question_id)) throw new Error('The saved progress identity was invalid.');
      records[row.question_id] = validateRecord(row.document);
    }
    return validateSnapshot({schema: PROGRESS_SCHEMA, batch_id: this.batchId, records}, this.batchId);
  }

  async sync() {
    this._requireEnabled();
    if (this._sync?.generation === this.generation) return this._sync.promise;
    clearTimeout(this._timer); this._timer = null;
    const generation = this.generation, store = this.accountStore, userId = this.activeUser?.id;
    if (!store || !this.session) throw new Error('Sign in to sync your account progress.');
    const sync = {generation, promise: null}; this._sync = sync;
    sync.promise = (async () => {
      try {
        const session = await this.ensureSession();
        const remote = await this._remoteRecords(session.access_token, userId);
        if (generation !== this.generation) return this.state();
        this._suppress = true; try { store.merge(remote); } finally { this._suppress = false; }
        const sentRevision = this.revision, records = Object.values(store.snapshot().records);
        if (records.length) await this._request('/rest/v1/rpc/save_originals_progress', {method: 'POST', token: session.access_token, body: {p_records: records}});
        const saved = await this._remoteRecords(session.access_token, userId);
        if (generation !== this.generation) return this.state();
        this._suppress = true; try { store.merge(saved); } finally { this._suppress = false; }
        this.lastSyncedAt = new Date(this.now()).toISOString();
        this.syncStatus = this.revision === sentRevision ? 'synced' : 'pending';
        this.message = this.syncStatus === 'synced' ? 'Your account progress is synced.' : 'New answers are saved locally; waiting to sync.';
        this._emit(); if (this.syncStatus === 'pending') this._schedule();
        return this.state();
      } catch (error) {
        if (generation === this.generation) { this.syncStatus = error.status ? 'error' : 'offline'; this.message = error.message; this._emit(); }
        throw error;
      } finally { if (this._sync === sync) this._sync = null; }
    })();
    return sync.promise;
  }

  /** Explicitly chosen migration; device answers never cross into an account automatically. */
  async importDeviceProgress() {
    if (!this.accountStore || !this.session) throw new Error('Sign in before importing device answers.');
    this.accountStore.merge(this.deviceStore.snapshot()); return this.sync();
  }

  async reset(questionId = null) {
    this.currentStore.reset(questionId);
    return this.session ? this.sync() : this.state();
  }

  async signOut() {
    const token = this.session?.access_token;
    const userId = this.activeUser?.id || this.session?.user?.id;
    const hadUnsynced = this.accountStore && ['pending', 'offline', 'error'].includes(this.syncStatus) && Object.keys(this.accountStore.snapshot().records).length > 0;
    const epoch = ++this.credentialEpoch, generation = ++this.generation;
    clearTimeout(this._timer); this._timer = null;
    const cacheCleared = this._clearUserCaches(userId);
    this.session = null; const forgot = this._forget();
    this.accountStore = null; this.activeUser = null;
    this.lastSyncedAt = null; this.syncStatus = this.config.enabled ? 'signed-out' : 'disabled';
    this.message = !forgot || !cacheCleared ? 'Signed out in this tab. This browser could not clear all cached account data. Clear site data before leaving a shared device.' : `Signed out on this device. Previously synced answers remain online.${hadUnsynced ? ' Unsynced changes were cleared from this device.' : ''} Any unsynced answers from any set are removed at sign-out.`; this._emit();
    if (token) {
      try { await this._request('/auth/v1/logout?scope=local', {method: 'POST', token}); } catch {
        if (this._credentialCurrent(epoch) && this.generation === generation) { this.message += ' The service could not be contacted to revoke the session.'; this._emit(); }
      }
    }
    return this._credentialCurrent(epoch) && this.generation === generation ? this.state() : this._cancelled();
  }

  dispose() {
    this.disposed = true; this.credentialEpoch++; this.generation++;
    clearTimeout(this._timer); this._timer = null;
    // Keep the saved tab session for another mounted view, but stop this instance's callbacks.
    this.session = null; this.activeUser = null;
  }
}
