import {ProgressStore, browserStorage, progressBatch, validateSnapshot} from './originals-progress.js';
import {StudentAccounts} from './student-accounts.js';

function node(document, tag, className, value) {
  const item = document.createElement(tag); if (className) item.className = className;
  if (value !== undefined) item.textContent = value; return item;
}

export function summarizeProgress(batch, store) {
  let attempted = 0, complete = 0, checked = 0, review = 0, recognized = 0;
  for (const q of batch.questions) {
    const parts = store.get(q.id).parts;
    const labels = q.question_type === 'mcq' ? ['mcq'] : q.parts.map(p => p.label);
    if (labels.some(label => parts[label]?.value?.trim())) attempted++;
    if (labels.every(label => parts[label]?.value?.trim())) complete++;
    for (const label of labels) if (parts[label]?.result) {
      checked++; recognized += parts[label].result.score;
      if (parts[label].result.status === 'needs_review') review++;
    }
  }
  return {attempted, complete, checked_parts: checked, needs_review: review, recorded_marks: recognized};
}

/** Account setup stays private; students see their save state and useful actions. */
export function createStudentWorkspace(document, batch, {onRestore = () => {}, storage, configFetcher = globalThis.fetch, management = false} = {}) {
  const element = node(document, 'section', management ? 'originals-student dashboard-answer-controls' : 'originals-autosave'); element.setAttribute('aria-label', management ? 'Answer management' : 'Automatic answer saving');
  const heading = node(document, 'h2', '', 'Answers and account');
  const summary = node(document, 'p', 'originals-progress-count'); summary.setAttribute('role', 'status');
  const status = node(document, 'p', 'originals-save-state'); status.setAttribute('role', 'status');
  const actions = node(document, 'div', 'originals-progress-actions');
  const backup = node(document, 'button', 'originals-reset', 'Download answers'); backup.type = 'button';
  const reset = node(document, 'button', 'originals-reset', 'Reset answers'); reset.type = 'button';
  const confirm = node(document, 'div', 'originals-reset-confirm'); confirm.hidden = true;
  const doReset = node(document, 'button', 'originals-reset', 'Confirm reset'); doReset.type = 'button';
  const cancelReset = node(document, 'button', 'originals-reset', 'Keep answers'); cancelReset.type = 'button';
  confirm.append(node(document, 'p', '', `Reset all answers and recorded checks in ${batch.title}?`), doReset, cancelReset);
  actions.append(backup, reset);
  const account = node(document, 'details', 'originals-account'); account.append(node(document, 'summary', '', 'Save across devices'));
  const accountBody = node(document, 'div', 'originals-account-body'); account.append(accountBody);
  if (management) element.append(heading, status, actions, confirm, account);
  else { const dashboard = node(document, 'a', 'n-link', 'My dashboard ↗'); dashboard.href = '#dashboard'; element.append(status, dashboard); }
  let accounts, lastStore, accountMode, accountEmail, generation = 0, disposed = false;
  const deviceStore = new ProgressStore({batchId: batch.batch_id, contentRevision: batch.content_revision ?? null, ...(storage === undefined ? {} : {storage}), onChange: () => refresh()});
  if (batch.content_revision) {
    try {
      // Read-only history: never migrate an earlier answer into a changed task.
      const previous = (storage === undefined ? browserStorage() : storage)?.getItem(progressBatch(batch.batch_id).key);
      const history = previous && validateSnapshot(JSON.parse(previous), batch.batch_id, null);
      if (history && Object.values(history.records).some(r => Object.keys(r.parts).length)) {
        const notice = node(document, 'p', 'original-response-guidance', 'These questions have been revised. Earlier answers are preserved separately; start a fresh attempt here.');
        const oldBackup = node(document, 'button', 'originals-reset', 'Download earlier answers'); oldBackup.type = 'button';
        oldBackup.addEventListener('click', () => download(previous, `neumeris-${batch.batch_id}-earlier-answers.json`));
        if (management) { element.append(notice); actions.append(oldBackup); }
      }
    } catch { /* Keep unreadable historical storage untouched. */ }
  }
  const currentStore = () => accounts?.currentStore || deviceStore;
  function refresh() {
    if (disposed) return;
    const store = currentStore();
    const state = accounts?.state() || {enabled: false, authenticated: false, mode: 'device'};
    const counts = summarizeProgress(batch, store);
    summary.textContent = `${counts.attempted} of ${batch.questions.length} questions started · ${counts.complete} with every part answered · ${counts.checked_parts} parts checked${counts.needs_review ? ` · ${counts.needs_review} need review` : ''}`;
    status.textContent = store.status.persistence !== 'saved' ? store.status.message : state.enabled && state.message ? state.message : 'Answers save automatically on this device.';
    if (store !== lastStore || (state.authenticated && state.sync_status === 'synced')) { lastStore = store; onRestore(); }
    if (accountMode !== `${state.enabled}:${state.authenticated}` || accountEmail !== state.user?.email) {
      accountMode = `${state.enabled}:${state.authenticated}`; accountEmail = state.user?.email; renderAccount(state);
    }
  }
  async function run(action, {restore = false, output} = {}) {
    let failure;
    try { const result = await action(); if (!disposed && !result?.cancelled) { if (output && result?.message) output.textContent = result.message; if (restore) onRestore(); } }
    catch (error) { failure = error.message || 'This action could not finish. Your answers remain on this device.'; }
    refresh();
    if (!disposed && failure) (output || status).textContent = failure;
  }
  function renderAccount(state) {
    accountBody.replaceChildren();
    if (!state.enabled) {
      accountBody.append(node(document, 'p', '', batch.content_revision ? 'This revised edition saves answers on this device. Account saving for the revised questions is being prepared; download a backup to keep your work.' : 'Student sign-in is not available yet. Your answers are saved on this device, and you can download a backup.'));
      return;
    }
    if (state.authenticated) {
      accountBody.append(node(document, 'p', '', `Signed in as ${state.user.email}`));
      for (const [title, action, restore] of [
        ['Sync saved answers', () => accounts.sync(), true],
        ['Add this device’s answers to my account', () => accounts.importDeviceProgress(), true],
        ['Sign out', () => accounts.signOut(), true],
      ]) {
        const button = node(document, 'button', 'originals-reset', title); button.type = 'button'; button.addEventListener('click', () => void run(action, {restore})); accountBody.append(button);
      }
      accountBody.append(node(document, 'p', 'original-response-guidance', 'Previously synced progress stays online. Sync or download pending answers in each set first; signing out clears cached account answers for all sets from this device.'));
      return;
    }
    const emailLabel = node(document, 'label', 'original-response-label', 'Email');
    const email = node(document, 'input', 'original-account-input'); email.type = 'email'; email.id = 'originals-account-email'; email.autocomplete = 'username'; emailLabel.htmlFor = email.id;
    const passwordLabel = node(document, 'label', 'original-response-label', 'Password');
    const password = node(document, 'input', 'original-account-input'); password.type = 'password'; password.id = 'originals-account-password'; password.autocomplete = 'current-password'; passwordLabel.htmlFor = password.id;
    const feedback = node(document, 'p'); feedback.setAttribute('role', 'status');
    accountBody.append(emailLabel, email, passwordLabel, password);
    for (const [title, method] of [['Sign in', 'signIn'], ['Create account', 'signUp']]) {
      const button = node(document, 'button', 'originals-reset', title); button.type = 'button';
      button.addEventListener('click', async () => {
        if (!email.value.trim() || !password.value) { feedback.textContent = 'Enter your email and password.'; return; }
        button.disabled = true;
        await run(() => accounts[method](email.value, password.value), {restore: true, output: feedback});
        password.value = ''; button.disabled = false;
        if (accounts.state().authenticated && document.defaultView) document.defaultView.location.hash = '#dashboard';
      });
      accountBody.append(button);
    }
    accountBody.append(feedback, node(document, 'p', 'original-response-guidance', 'Account creation requires email confirmation. Passwords are handled by the account service and are not stored with your answers.'));
  }
  reset.addEventListener('click', () => { confirm.hidden = false; });
  cancelReset.addEventListener('click', () => { confirm.hidden = true; });
  doReset.addEventListener('click', () => {
    confirm.hidden = true;
    void run(async () => { if (accounts) { const pending = accounts.reset(); onRestore(); await pending; } else deviceStore.reset(); }, {restore: true});
  });
  function download(json, filename) {
    try {
      const blob = new Blob([json], {type: 'application/json'}), url = URL.createObjectURL(blob);
      const link = node(document, 'a'); link.href = url; link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { status.textContent = 'The answers could not be downloaded. Your current answers remain available here.'; }
  }
  backup.addEventListener('click', () => download(currentStore().exportJSON(), `neumeris-${batch.batch_id}${batch.content_revision ? `-${batch.content_revision}` : ''}-answers.json`));
  const progress = {
    get: id => currentStore().get(id),
    saveAnswer: (id, label, value) => currentStore().setAnswer(id, label, value),
    saveResult: (id, label, result) => currentStore().setResult(id, label, result),
    onChange: refresh,
  };
  refresh();
  if (document.defaultView && configFetcher) {
    const revision = ++generation;
    void (async () => {
      try {
        const response = await configFetcher('./student-accounts-config.json', {cache: 'no-store'});
        if (!response.ok) throw new Error('Unavailable account configuration');
        const config = await response.json(); if (revision !== generation) return;
        accounts = new StudentAccounts({config, deviceStore, onChange: refresh});
        refresh(); const result = await accounts.initialize(); if (revision !== generation || result?.cancelled) return; onRestore(); refresh();
      } catch { if (revision === generation) status.textContent = 'Saved on this device. Account sign-in is currently unavailable.'; }
    })();
  }
  return {element, progress, refresh, reload: () => { if (currentStore() === deviceStore) deviceStore.reload(); onRestore(); refresh(); }, dispose: () => { disposed = true; generation++; accounts?.dispose(); }};
}
