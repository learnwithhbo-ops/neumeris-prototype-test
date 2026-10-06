import {ProgressStore, browserStorage, progressBatch} from './originals-progress.js';

/** Presentation groups only. Physical batch IDs and response editions stay unchanged. */
export function topicGroups(batches) {
  const groups = new Map();
  for (const batch of batches) for (const question of batch.questions) {
    const id = question.topic_ids[0];
    if (!groups.has(id)) groups.set(id, {id, questions: []});
    groups.get(id).questions.push(question);
  }
  return [...groups.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', {numeric: true}))
    .map(group => ({...group, questions: group.questions.sort((a, b) => a.number - b.number)}));
}

/** Device-only adapter for the current reviewed content. No account activation or migration. */
export class TopicProgress {
  constructor(batches, {storage = browserStorage(), onChange = () => {}} = {}) {
    this.storage = storage; this.batches = batches; this.stores = new Map(); this.owners = new Map();
    for (const batch of batches) {
      if (this.stores.has(batch.batch_id)) throw new Error('Duplicate answer archive.');
      const store = new ProgressStore({storage, batchId: batch.batch_id, contentRevision: batch.content_revision ?? null, onChange});
      // Preserve unreadable saved bytes instead of overwriting them with an empty attempt.
      if (store.status.persistence !== 'saved') store.storage = null;
      this.stores.set(batch.batch_id, store);
      for (const q of batch.questions) {
        if (this.owners.has(q.id) || !store.ids.has(q.id)) throw new Error('Invalid topical question identity.');
        this.owners.set(q.id, store);
      }
    }
  }
  store(id) { const store = this.owners.get(id); if (!store) throw new Error('Unknown topical question.'); return store; }
  get(id) { return this.store(id).get(id); }
  saveAnswer(id, part, value) { return this.store(id).setAnswer(id, part, value); }
  saveResult(id, part, value) { return this.store(id).setResult(id, part, value); }
  warnings() { return [...this.stores.values()].filter(s => s.status.persistence !== 'saved').map(s => s.status.message); }
  reload() {
    for (const store of this.stores.values()) {
      store.reload(); if (store.status.persistence !== 'saved') store.storage = null;
    }
  }
  resetTopic(topic) {
    const questions = this.batches.flatMap(b => b.questions).filter(q => topic === 'all' || q.topic_ids.includes(topic));
    if (!questions.length) throw new Error('Choose an available syllabus subtopic.');
    // Refresh before resetting so another question in the same archive is not reverted.
    this.reload();
    const affected = [...new Set(questions.map(q => this.store(q.id)))];
    if (affected.some(s => s.status.persistence !== 'saved')) throw new Error('Answers could not be refreshed safely. Reset was not started; back up your answers first.');
    for (const q of questions) {
      const store = this.store(q.id); store.reset(q.id);
      if (store.status.persistence !== 'saved') throw new Error('Reset could not finish saving. Some selected answers may have been reset; other topics and earlier answers are preserved.');
    }
    return questions.length;
  }
  // One download contains standard per-batch exports; each remains independently valid.
  exportJSON() { return JSON.stringify({schema: 'neumeris-originals-answer-backup-v1', exports: [...this.stores.values()].map(s => s.snapshot())}, null, 2); }
  earlierAnswers() {
    return this.batches.flatMap(b => {
      if (!b.content_revision) return [];
      try { const raw = this.storage?.getItem(progressBatch(b.batch_id).key); return raw ? [{batch_id: b.batch_id, raw}] : []; }
      catch { return []; }
    });
  }
}

const node = (document, tag, className, text) => { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; };

export function createTopicWorkspace(document, batches, {storage, onRestore = () => {}, management = false, topics = {}} = {}) {
  const element = node(document, 'section', management ? 'originals-student dashboard-answer-controls' : 'originals-autosave');
  element.setAttribute('aria-label', management ? 'Answer management by topic' : 'Automatic answer saving');
  const status = node(document, 'p', 'originals-save-state'); status.setAttribute('role', 'status');
  let disposed = false;
  const progress = new TopicProgress(batches, {storage, onChange: () => refresh()});
  function refresh() {
    if (disposed) return;
    const warnings = progress.warnings();
    status.textContent = warnings.length ? `${[...new Set(warnings)].join(' ')} Backups are available in My dashboard.` : 'Answers save automatically on this device.';
  }
  function download(json, filename) {
    try {
      const url = URL.createObjectURL(new Blob([json], {type: 'application/json'}));
      const link = node(document, 'a'); link.href = url; link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { status.textContent = 'The backup could not be downloaded. Your current answers remain available here.'; }
  }
  if (!management) {
    const link = node(document, 'a', 'n-link', 'My dashboard ↗'); link.href = '#dashboard'; element.append(status, link);
  } else {
    const label = node(document, 'label', 'original-response-label', 'Reset scope');
    const select = node(document, 'select', 'originals-topic-reset'); select.id = 'dashboard-reset-topic'; label.htmlFor = select.id;
    const all = node(document, 'option', '', 'All IB Physics original questions'); all.value = 'all'; select.append(all);
    for (const group of topicGroups(batches)) { const option = node(document, 'option', '', `${topics[group.id] || group.id} · ${group.questions.length} questions`); option.value = group.id; select.append(option); }
    select.value = 'all';
    const actions = node(document, 'div', 'originals-progress-actions');
    const reset = node(document, 'button', 'originals-reset', 'Reset answers'); reset.type = 'button';
    const backup = node(document, 'button', 'originals-reset', 'Download answer backup'); backup.type = 'button';
    const confirm = node(document, 'div', 'originals-reset-confirm'); confirm.hidden = true;
    const prompt = node(document, 'p', '');
    const accept = node(document, 'button', 'originals-reset', 'Confirm reset'); accept.type = 'button';
    const cancel = node(document, 'button', 'originals-reset', 'Keep answers'); cancel.type = 'button';
    let pendingTopic;
    reset.addEventListener('click', () => {
      pendingTopic = select.value;
      prompt.textContent = `Reset answers and recorded checks for ${pendingTopic === 'all' ? 'all IB Physics original questions' : topics[pendingTopic] || pendingTopic}? Earlier editions are preserved.`;
      confirm.hidden = false;
    });
    select.addEventListener('change', () => { confirm.hidden = true; pendingTopic = undefined; });
    cancel.addEventListener('click', () => { confirm.hidden = true; pendingTopic = undefined; });
    accept.addEventListener('click', () => {
      if (confirm.hidden || !pendingTopic) return;
      const scope = pendingTopic; confirm.hidden = true; pendingTopic = undefined;
      try { const count = progress.resetTopic(scope); onRestore(); refresh(); status.textContent = `${count} questions reset. ${scope === 'all' ? 'Earlier editions are preserved.' : 'Other topics and earlier editions are preserved.'}${progress.warnings().length ? ` ${progress.warnings().join(' ')}` : ''}`; }
      catch (error) { onRestore(); refresh(); status.textContent = error.message; }
    });
    backup.addEventListener('click', () => { progress.reload(); download(progress.exportJSON(), 'neumeris-physics-originals-answers.json'); });
    actions.append(backup, reset); confirm.append(prompt, accept, cancel);
    element.append(status, label, select, actions, confirm);
    const earlier = progress.earlierAnswers();
    if (earlier.length) {
      const recovery = node(document, 'button', 'originals-reset', 'Download earlier answers'); recovery.type = 'button';
      recovery.addEventListener('click', () => download(JSON.stringify({schema: 'neumeris-originals-earlier-answer-backup-v1', archives: progress.earlierAnswers()}, null, 2), 'neumeris-physics-earlier-answers.json'));
      element.append(node(document, 'p', 'original-response-guidance', 'Earlier attempts are preserved separately because the questions were revised.'), recovery);
    }
    element.append(node(document, 'p', 'original-response-guidance', 'This revised edition currently saves on this device. Account saving requires the separate account upgrade.'));
  }
  refresh();
  return {element, progress, refresh, reload: () => { progress.reload(); onRestore(); refresh(); }, dispose: () => { disposed = true; }};
}
