import {ASSESSMENT_REVISION, knownContentRevision, responseContract, responsePartAllowed} from './originals-contracts.js';
export const PROGRESS_SCHEMA = 'neumeris-originals-progress-v1';
export const PROGRESS_BATCH = 'physics-foundations-01';
export const PROGRESS_KEY = 'neumeris.originals.progress.v1';
const questionIds = batch => Object.freeze(Array.from({length: 12}, (_, i) => `neo-${batch}-q${String(i + 1).padStart(2, '0')}`));
export const PROGRESS_BATCHES = Object.freeze({
  'physics-foundations-01': Object.freeze({key: PROGRESS_KEY, question_ids: questionIds('physics-foundations-01')}),
  'physics-foundations-02': Object.freeze({key: `${PROGRESS_KEY}.physics-foundations-02`, question_ids: questionIds('physics-foundations-02')}),
  'physics-foundations-03': Object.freeze({key: `${PROGRESS_KEY}.physics-foundations-03`, question_ids: questionIds('physics-foundations-03')}),
});
export const QUESTION_IDS = PROGRESS_BATCHES[PROGRESS_BATCH].question_ids;
const ids = new Set(Object.values(PROGRESS_BATCHES).flatMap(batch => batch.question_ids));
export function progressBatch(batchId = PROGRESS_BATCH) {
  if (!Object.hasOwn(PROGRESS_BATCHES, batchId)) throw new Error('Unknown Originals collection.');
  return PROGRESS_BATCHES[batchId];
}
const partNames = new Set(['mcq', 'a', 'b', 'c', 'd']);
const allowedPart = (id, part) => responsePartAllowed(id, part) || responsePartAllowed(id, part, ASSESSMENT_REVISION);
export const isAllowedResponsePart = (id, part, revision = null) => ids.has(id) && responsePartAllowed(id, part, revision);
const statuses = new Set(['checked', 'needs_review', 'self_reviewed']);
const clone = value => JSON.parse(JSON.stringify(value));
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const timestamp = value => Number.isSafeInteger(value) && value >= 0 && value <= 4102444800000;
const emptyRecord = id => ({question_id: id, parts: {}, reset_at: 0, updated_at: 0});
const exactKeys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));

export function browserStorage(name = 'localStorage') {
  try { return globalThis[name] || null; } catch { return null; }
}

export function validateRecord(record) {
  if (!plain(record) || !ids.has(record.question_id) || !plain(record.parts) || !timestamp(record.reset_at) || !timestamp(record.updated_at) || !exactKeys(record, ['question_id', 'parts', 'reset_at', 'updated_at'])) throw new Error('Invalid progress record.');
  for (const [part, answer] of Object.entries(record.parts)) {
    if (!partNames.has(part) || !allowedPart(record.question_id, part) || !plain(answer) || !exactKeys(answer, ['value', 'updated_at', 'result']) || typeof answer.value !== 'string' || answer.value.length > 10000 || !timestamp(answer.updated_at) || answer.updated_at <= record.reset_at || record.updated_at < answer.updated_at) throw new Error('Invalid saved answer.');
    if (part === 'mcq' && !['', 'A', 'B', 'C', 'D'].includes(answer.value)) throw new Error('Invalid saved option.');
    if (answer.result !== null) {
      const r = answer.result;
      if (!plain(r) || !exactKeys(r, ['score', 'max_marks', 'status', 'feedback', 'answer_value', 'updated_at']) || !Number.isFinite(r.score) || !Number.isFinite(r.max_marks) || r.max_marks < 0 || r.max_marks > 20 || r.score < 0 || r.score > r.max_marks || !statuses.has(r.status) || typeof r.feedback !== 'string' || r.feedback.length > 2000 || r.answer_value !== answer.value || !timestamp(r.updated_at) || r.updated_at < answer.updated_at || r.updated_at > record.updated_at) throw new Error('Invalid saved check result.');
    }
  }
  if (record.updated_at < record.reset_at) throw new Error('Invalid reset timestamp.');
  return record;
}

export function validateSnapshot(snapshot, expectedBatchId, expectedRevision) {
  if (!plain(snapshot) || snapshot.schema !== PROGRESS_SCHEMA || !Object.hasOwn(PROGRESS_BATCHES, snapshot.batch_id) || (expectedBatchId !== undefined && snapshot.batch_id !== expectedBatchId) || !knownContentRevision(snapshot.content_revision ?? null) || (expectedRevision !== undefined && (snapshot.content_revision ?? null) !== expectedRevision) || !plain(snapshot.records) || !exactKeys(snapshot, ['schema', 'batch_id', 'content_revision', 'records']) || Object.keys(snapshot.records).length > 12) throw new Error('This file is not a valid Physics Foundations progress export for this set and edition.');
  const batchIds = new Set(progressBatch(snapshot.batch_id).question_ids);
  for (const [id, record] of Object.entries(snapshot.records)) {
    if (!batchIds.has(id) || record.question_id !== id) throw new Error('Progress identity does not match this set.');
    validateRecord(record);
    if (Object.keys(record.parts).some(part => !responsePartAllowed(id, part, snapshot.content_revision ?? null))) throw new Error('Saved part does not belong to this content edition.');
    if (snapshot.content_revision && Object.entries(record.parts).some(([part, answer]) => answer.result && answer.result.max_marks !== responseContract(id, snapshot.content_revision)[part])) throw new Error('Saved marks do not match the reviewed part maximum.');
  }
  return snapshot;
}

/** Merge individual answer events, including reset tombstones; missing rows never erase answers. */
export function mergeRecords(left, right) {
  validateRecord(left); validateRecord(right);
  if (left.question_id !== right.question_id) throw new Error('Cannot merge different questions.');
  const merged = {question_id: left.question_id, parts: {}, reset_at: Math.max(left.reset_at, right.reset_at), updated_at: Math.max(left.updated_at, right.updated_at)};
  for (const part of new Set([...Object.keys(left.parts), ...Object.keys(right.parts)])) {
    const a = left.parts[part], b = right.parts[part];
    const chosen = !a ? b : !b ? a : (b.updated_at > a.updated_at || (b.updated_at === a.updated_at && (b.result?.updated_at || 0) >= (a.result?.updated_at || 0))) ? b : a;
    if (chosen.updated_at > merged.reset_at) merged.parts[part] = clone(chosen);
  }
  return merged;
}

/** Device storage is convenience storage, never evidence of official examination marks. */
export class ProgressStore {
  constructor({storage = browserStorage(), batchId = PROGRESS_BATCH, contentRevision = null, key = `${progressBatch(batchId).key}${contentRevision ? `.${contentRevision}` : ''}`, now = () => Date.now(), onChange = () => {}} = {}) {
    if (!knownContentRevision(contentRevision)) throw new Error('Unknown content edition.');
    this.contentRevision = contentRevision;
    this.batchId = batchId; this.questionIds = progressBatch(batchId).question_ids; this.ids = new Set(this.questionIds);
    this.storage = storage; this.key = key; this.now = now; this.onChange = onChange;
    this.records = {}; this.lastTimestamp = 0;
    this.status = {persistence: storage ? 'saved' : 'memory-only', message: storage ? 'Answers are saved on this device.' : 'Device storage is unavailable. Export your answers before closing this page.'};
    try {
      const saved = storage?.getItem(key);
      if (saved) this.records = clone(validateSnapshot(JSON.parse(saved), this.batchId, this.contentRevision).records);
    } catch {
      this.status = {persistence: 'memory-only', message: 'Saved answers could not be read. Export your current answers before closing this page.'};
    }
    this.lastTimestamp = Math.max(0, ...Object.values(this.records).map(record => record.updated_at));
  }

  _time() { this.lastTimestamp = Math.max(1, this.now(), this.lastTimestamp + 1); return this.lastTimestamp; }
  _save() {
    try {
      if (!this.storage) throw new Error('No storage');
      this.storage.setItem(this.key, this.exportJSON());
      this.status = {persistence: 'saved', message: 'Answers are saved on this device.'};
    } catch {
      this.status = {persistence: 'memory-only', message: 'Answers are available in this tab, but could not be saved on this device. Export before closing.'};
    }
    this.onChange(this.snapshot(), {...this.status});
    return {...this.status};
  }

  get(questionId) {
    if (!this.ids.has(questionId)) throw new Error('Unknown Originals question for this set.');
    return clone(this.records[questionId] || emptyRecord(questionId));
  }

  setAnswer(questionId, part, value) {
    const record = this.get(questionId);
    if (!partNames.has(part) || !responsePartAllowed(questionId, part, this.contentRevision) || typeof value !== 'string' || value.length > 10000 || (part === 'mcq' && !['', 'A', 'B', 'C', 'D'].includes(value))) throw new Error('Invalid answer.');
    if (record.parts[part]?.value === value) return this.get(questionId);
    const time = this._time();
    record.parts[part] = {value, updated_at: time, result: null}; record.updated_at = time;
    this.records[questionId] = validateRecord(record); this._save(); return this.get(questionId);
  }

  setResult(questionId, part, result) {
    const record = this.get(questionId), answer = record.parts[part];
    if (!answer || !answer.value.trim()) throw new Error('Enter an answer before checking it.');
    if (this.contentRevision && result.max_marks !== responseContract(questionId, this.contentRevision)[part]) throw new Error('Saved marks do not match the reviewed part maximum.');
    const time = this._time();
    answer.result = {score: result.score, max_marks: result.max_marks, status: result.status, feedback: result.feedback || '', answer_value: answer.value, updated_at: time};
    record.updated_at = time;
    validateRecord(record); this.records[questionId] = record; this._save(); return this.get(questionId);
  }

  snapshot() { return {schema: PROGRESS_SCHEMA, batch_id: this.batchId, ...(this.contentRevision ? {content_revision: this.contentRevision} : {}), records: clone(this.records)}; }
  exportJSON() { return JSON.stringify(this.snapshot(), null, 2); }

  reload() {
    if (!this.storage || this.status.persistence !== 'saved') return;
    try {
      const json = this.storage.getItem(this.key);
      this.records = json ? clone(validateSnapshot(JSON.parse(json), this.batchId, this.contentRevision).records) : {};
      this.lastTimestamp = Math.max(this.lastTimestamp, ...Object.values(this.records).map(record => record.updated_at));
    } catch { this.status = {persistence: 'memory-only', message: 'Saved answers could not be refreshed. Your current answers remain in this tab.'}; }
  }

  importJSON(json) {
    if (typeof json !== 'string' || json.length > 250000) throw new Error('Progress import is too large.');
    let snapshot;
    try { snapshot = validateSnapshot(JSON.parse(json), this.batchId, this.contentRevision); } catch { throw new Error('This file is not a valid Physics Foundations progress export for this set and edition.'); }
    return this.merge(snapshot);
  }

  merge(snapshot) {
    validateSnapshot(snapshot, this.batchId, this.contentRevision);
    for (const [id, record] of Object.entries(snapshot.records)) this.records[id] = mergeRecords(this.records[id] || emptyRecord(id), record);
    this.lastTimestamp = Math.max(this.lastTimestamp, ...Object.values(this.records).map(record => record.updated_at));
    this._save(); return this.snapshot();
  }

  reset(questionId = null) {
    if (questionId !== null && !this.ids.has(questionId)) throw new Error('Unknown Originals question for this set.');
    const time = this._time();
    for (const id of questionId ? [questionId] : this.questionIds) this.records[id] = {question_id: id, parts: {}, reset_at: time, updated_at: time};
    this._save(); return this.snapshot();
  }

  /** Privacy action on sign-out, distinct from a syncable reset of account answers. */
  clear() {
    this.records = {}; this.lastTimestamp = 0;
    try { this.storage?.removeItem(this.key); } catch {
      this.status = {persistence: 'memory-only', message: 'This browser could not remove cached answers. Clear site data before leaving a shared device.'};
    }
    this.onChange(this.snapshot(), {...this.status});
  }
}
