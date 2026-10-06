import {checkMcq, checkWritten, MAX_ANSWER_LENGTH} from './originals-marking.js';
import {createTopicWorkspace, topicGroups} from './originals-topics.js';
import {ORIGINALS_SETS, originalSet, originalSetForQuestion} from './originals-sets.js';
import {isAllowedResponsePart} from './originals-progress.js';
import {knownContentRevision, responseContract} from './originals-contracts.js';
export const ORIGINALS_URL = './originals/foundations-01.json';
export const TOPICS = Object.freeze({
  'A.1': 'A.1 Kinematics',
  'A.2': 'A.2 Forces and momentum',
  'A.3': 'A.3 Work, energy and power',
  'B.1': 'B.1 Thermal energy transfers',
  'C.3': 'C.3 Wave phenomena',
  'C.4': 'C.4 Standing waves and resonance',
  'B.2': 'B.2 Greenhouse effect',
  'B.3': 'B.3 Gas laws',
  'B.5': 'B.5 Current and circuits',
  'C.1': 'C.1 Simple harmonic motion',
  'D.1': 'D.1 Gravitational fields',
  'D.2': 'D.2 Electric and magnetic fields',
});
const labels = ['A', 'B', 'C', 'D'];
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const marks = value => Number.isInteger(value) && value > 0;
const fail = message => { throw new Error(`Originals batch: ${message}`); };

function privateField(value) {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, item]) => key.startsWith('source_') ||
    ['provenance', 'originality_note', 'reviewed_blueprint_artifact', 'independent_blueprint_review'].includes(key) || privateField(item));
}

/** This guard checks the approved delivery contract; it does not approve content. */
export function validateBatch(batch) {
  if (!batch || batch.schema !== 'neumeris-originals-batch-v1' || !Object.hasOwn(ORIGINALS_SETS, batch.batch_id)) fail('unsupported collection');
  const set = originalSet(batch.batch_id);
  if (!knownContentRevision(batch.content_revision ?? null)) fail('unknown content edition');
  if (batch.publication_status !== 'approved') fail('not approved for student practice');
  if (!nonempty(batch.title) || batch.collection !== 'Neumeris Originals') fail('missing collection title');
  if (privateField(batch)) fail('private authoring references must not ship');
  if (!Array.isArray(batch.questions) || batch.questions.length !== 12) fail('expected the complete 12-question pilot');
  const seen = new Set(), topicCounts = new Map(), formatCounts = {mcq: 0, written: 0};
  for (const q of batch.questions) {
    if (!q || !Number.isInteger(q.number) || q.number < 1 + set.offset || q.number > 12 + set.offset || q.id !== `${set.prefix}${String(q.number - set.offset).padStart(2, '0')}` || seen.has(q.id)) fail('invalid or repeated question identity');
    seen.add(q.id);
    if ((q.content_revision ?? null) !== (batch.content_revision ?? null)) fail(`${q.id}: question edition does not match its set`);
    if (q.level !== 'SL' || !['mcq', 'written'].includes(q.question_type) || !marks(q.marks) || q.number % 2 !== (q.question_type === 'mcq' ? 1 : 0)) fail(`${q.id}: invalid level, format or marks`);
    if (!Array.isArray(q.topic_ids) || q.topic_ids.length !== 1 || !set.topics.includes(q.topic_ids[0])) fail(`${q.id}: invalid pilot topic`);
    topicCounts.set(q.topic_ids[0], (topicCounts.get(q.topic_ids[0]) || 0) + 1);
    formatCounts[q.question_type]++;
    if (!nonempty(q.prompt) || !nonempty(q.hint) || !Array.isArray(q.notes) || q.notes.length < 2 || !q.notes.every(nonempty) || !q.answer || !nonempty(q.answer.explanation)) fail(`${q.id}: incomplete question or support`);
    if (q.diagram && (!/^assets\/[a-z0-9][a-z0-9_-]*\.svg$/.test(q.diagram.file) || !nonempty(q.diagram.alt))) fail(`${q.id}: unsafe or undescribed diagram`);
    if (q.question_type === 'mcq') {
      if (q.marks !== 1 || !Array.isArray(q.options) || q.options.length !== 4 || !q.options.every((o, i) => o && o.label === labels[i] && nonempty(o.text)) || !labels.includes(q.answer.correct_option)) fail(`${q.id}: incomplete MCQ options or answer`);
      if (q.parts?.length || q.answer.parts?.length) fail(`${q.id}: mixed MCQ/written structure`);
    } else {
      if (!Array.isArray(q.parts) || !q.parts.length || !Array.isArray(q.answer.parts) || q.parts.length !== q.answer.parts.length) fail(`${q.id}: incomplete structured answer`);
      if (!Array.isArray(q.part_hints) || q.part_hints.length !== q.parts.length || !q.part_hints.every((h, i) => h?.label === q.parts[i].label && nonempty(h.hint))) fail(`${q.id}: missing or mismatched part hints`);
      const partLabels = new Set();
      let total = 0;
      for (const [i, p] of q.parts.entries()) {
        const a = q.answer.parts[i];
        if (!p || !isAllowedResponsePart(q.id, p.label, batch.content_revision ?? null) || partLabels.has(p.label) || !nonempty(p.text) || !marks(p.marks)) fail(`${q.id}: invalid structured part`);
        partLabels.add(p.label); total += p.marks;
        if (!a || a.label !== p.label || !nonempty(a.answer) || !nonempty(a.working) || !Array.isArray(a.marking_points) || !a.marking_points.length || !a.marking_points.every(point => point && nonempty(point.text) && marks(point.marks)) || a.marking_points.reduce((sum, point) => sum + point.marks, 0) !== p.marks) fail(`${q.id}: incomplete answer or mark scheme for (${p.label})`);
      }
      if (total !== q.marks) fail(`${q.id}: part marks do not total question marks`);
      if (q.options?.length || q.answer.correct_option) fail(`${q.id}: mixed written/MCQ structure`);
    }
    if (batch.content_revision) {
      const contract = responseContract(q.id, batch.content_revision);
      const delivered = q.question_type === 'mcq' ? {mcq: q.marks} : Object.fromEntries(q.parts.map(p => [p.label, p.marks]));
      if (JSON.stringify(contract) !== JSON.stringify(delivered)) fail(`${q.id}: delivery differs from the reviewed edition contract`);
    }
  }
  if (formatCounts.mcq !== 6 || formatCounts.written !== 6 || set.topics.some(topic => topicCounts.get(topic) !== 2)) fail('pilot topic/format accounting differs from the approved plan');
  return batch;
}

export async function loadBatch(fetcher = globalThis.fetch, batchId = 'physics-foundations-01') {
  const response = await fetcher(originalSet(batchId).url, {headers: {Accept: 'application/json'}});
  if (!response.ok) throw new Error(`Originals could not load (${response.status})`);
  const batch = validateBatch(await response.json());
  if (batch.batch_id !== batchId) throw new Error('The server returned a different question set.');
  return batch;
}

export function parseRoute(hash = '') {
  const query = new URLSearchParams(hash.replace(/^#/, '').split('?')[1] || '');
  const topic = Object.hasOwn(TOPICS, query.get('topic')) ? query.get('topic') : 'all';
  const format = ['mcq', 'written'].includes(query.get('format')) ? query.get('format') : 'all';
  const question = originalSetForQuestion(query.get('question')) ? query.get('question') : null;
  return {topic, format, question};
}

export function routeSet(hash = '') {
  const route = parseRoute(hash);
  const query = new URLSearchParams(hash.replace(/^#/, '').split('?')[1] || '');
  return originalSetForQuestion(route.question) || (Object.hasOwn(ORIGINALS_SETS, query.get('set')) ? query.get('set') : 'physics-foundations-01');
}

export function filterQuestions(questions, {topic = 'all', format = 'all'} = {}) {
  return questions.filter(q => (topic === 'all' || q.topic_ids.includes(topic)) && (format === 'all' || q.question_type === format));
}

export function questionLink(id) { return `#originals?question=${encodeURIComponent(id)}`; }
// Authored exam prompts may carry the same trailing mark annotation as metadata.
export function displayPrompt(value, expectedMarks) { return value.replace(new RegExp(`\\s*\\[${expectedMarks}\\]\\s*$`), ''); }

function node(document, tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
}
function text(document, value) { return node(document, 'p', 'original-question-text', value); }
function help(document, title, content) {
  const detail = node(document, 'details', 'original-help');
  detail.append(node(document, 'summary', '', title));
  const body = node(document, 'div', 'original-help-content');
  body.append(...content); detail.append(body);
  return detail;
}

export function questionCard(document, q, progress = {}) {
  const getAttempt = () => progress.get?.(q.id) || {parts: {}};
  const controls = [];
  const feedbacks = [];
  const saveAnswer = (label, value) => { progress.saveAnswer?.(q.id, label, value); progress.onChange?.(); };
  const saveResult = (label, result) => { progress.saveResult?.(q.id, label, result); progress.onChange?.(); };
  const card = node(document, 'article', 'original-question');
  card.id = q.id; card.tabIndex = -1; card.setAttribute('aria-labelledby', `${q.id}-title`);
  const header = node(document, 'header', 'original-question-header');
  const identity = node(document, 'div');
  const heading = node(document, 'h2'); heading.id = `${q.id}-title`;
  const link = node(document, 'a', '', `Question ${q.number}`); link.href = questionLink(q.id);
  link.setAttribute('aria-label', `Link to question ${q.number}`); heading.append(link);
  identity.append(heading, node(document, 'p', 'original-question-topic', `${q.topic_ids.map(id => TOPICS[id]).join(' · ')} · SL · ${q.question_type === 'mcq' ? 'Multiple choice' : 'Written question'}`));
  header.append(identity, node(document, 'span', 'original-question-marks', `[${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}]`));
  card.append(header, text(document, displayPrompt(q.prompt, q.marks)));
  if (q.diagram) {
    const figure = node(document, 'figure', 'original-question-diagram');
    const image = node(document, 'img'); image.src = `./originals/${originalSet(originalSetForQuestion(q.id)).assetDirectory}${q.diagram.file}`; image.alt = q.diagram.alt; image.loading = 'lazy'; image.decoding = 'async';
    image.addEventListener('error', () => {
      const warning = node(document, 'p', '', 'The diagram could not load. Please refresh before attempting this question.'); warning.setAttribute('role', 'alert'); figure.replaceChildren(warning);
    }, {once: true});
    figure.append(image); card.append(figure);
  }
  if (q.question_type === 'mcq') {
    const options = node(document, 'fieldset', 'original-options');
    options.append(node(document, 'legend', '', 'Your answer'));
    const radios = [];
    for (const option of q.options) {
      const row = node(document, 'label', 'original-option');
      const input = node(document, 'input'); input.type = 'radio'; input.name = `${q.id}-choice`; input.value = option.label;
      input.setAttribute('aria-label', `${option.label}. ${option.text}`);
      row.append(input, node(document, 'span', 'original-option-label', option.label), node(document, 'span', 'original-option-text', option.text)); options.append(row); radios.push(input);
      input.addEventListener('change', () => { if (input.checked) { saveAnswer('mcq', input.value); feedback.textContent = ''; } });
    }
    const button = node(document, 'button', 'originals-reset', 'Mark answer'); button.type = 'button';
    const feedback = node(document, 'p', 'original-response-feedback'); feedback.setAttribute('role', 'status');
    button.addEventListener('click', () => {
      const choice = radios.find(r => r.checked)?.value;
      if (!choice) { feedback.textContent = 'Select an option first.'; return; }
      const result = checkMcq(q, choice);
      const score = result.estimated_awarded ?? result.score ?? (choice === q.answer.correct_option ? 1 : 0);
      feedback.textContent = score === 1 ? 'Correct — 1 / 1 mark.' : 'Not yet — 0 / 1 mark. Compare your choice with the answer and key notes.';
      saveResult('mcq', {score, max_marks: 1, status: 'checked', feedback: feedback.textContent});
    });
    controls.push(() => { const value = getAttempt().parts.mcq?.value || ''; for (const radio of radios) { const checked = radio.value === value; if (radio.checked !== checked) radio.checked = checked; } });
    feedbacks.push(() => { feedback.textContent = getAttempt().parts.mcq?.result?.feedback || ''; });
    card.append(options);
    card.append(button, feedback);
  } else {
    const parts = node(document, 'div', 'original-parts');
    for (const part of q.parts) {
      const section = node(document, 'section', 'original-part-section');
      const row = node(document, 'div', 'original-part'); row.append(node(document, 'span', 'original-part-label', `(${part.label})`), text(document, displayPrompt(part.text, part.marks)), node(document, 'span', 'original-part-marks', `[${part.marks}]`)); section.append(row);
      const label = node(document, 'label', 'original-response-label', `Your answer for part (${part.label})`);
      const input = node(document, 'textarea', 'original-response'); input.id = `${q.id}-response-${part.label}`; input.rows = 4; input.maxLength = MAX_ANSWER_LENGTH; label.htmlFor = input.id;
      const guidance = node(document, 'p', 'original-response-guidance', 'Include your reasoning, calculation and units where needed.'); guidance.id = `${input.id}-guidance`; input.setAttribute('aria-describedby', guidance.id);
      const feedback = node(document, 'div', 'original-response-feedback'); feedback.setAttribute('role', 'status');
      const feedbackMessage = result => {
        const unverified = (result.criteria || []).filter(criterion => criterion.status !== 'recognized').length;
        return `Automatic practice marks: ${result.estimated_awarded} / ${result.max_marks} marks matched.${unverified ? ` ${unverified} marking ${unverified === 1 ? 'point is' : 'points are'} unverified; unverified does not mean wrong.` : ' All saved marking points matched; this remains a practice estimate.'}`;
      };
      const renderFeedback = (result, message = feedbackMessage(result)) => {
        feedback.replaceChildren(text(document, message));
        const points = node(document, 'ul');
        for (const criterion of result.criteria || []) points.append(node(document, 'li', '', `${criterion.status === 'recognized' ? 'Matched' : 'Not verified'}: ${criterion.rubric} ${criterion.reason}`));
        feedback.append(points, text(document, 'Marks are calculated automatically from saved rubric rules, without AI calls. The checker does not fully interpret arbitrary explanations, calculation methods or follow-through.'));
      };
      input.addEventListener('input', () => { saveAnswer(part.label, input.value); feedback.replaceChildren(); });
      const button = node(document, 'button', 'originals-reset', `Mark part (${part.label})`); button.type = 'button';
      button.addEventListener('click', () => {
        if (!input.value.trim()) { feedback.replaceChildren(text(document, 'Write an answer first.')); return; }
        const result = checkWritten(q, part.label, input.value);
        const message = feedbackMessage(result);
        renderFeedback(result, message);
        saveResult(part.label, {score: result.estimated_awarded, max_marks: result.max_marks, status: result.needs_review ? 'needs_review' : 'checked', feedback: message});
      });
      section.append(label, input, guidance, button, feedback);
      section.append(help(document, `Hint for part (${part.label})`, [text(document, q.part_hints.find(h => h.label === part.label).hint)]));
      controls.push(() => { const value = getAttempt().parts[part.label]?.value || ''; if (input.value !== value) input.value = value; });
      feedbacks.push(() => {
        const savedPart = getAttempt().parts[part.label], saved = savedPart?.result?.feedback;
        if (saved && feedback.children[0]?.textContent === saved) return;
        if (saved?.startsWith('Automatic practice marks:') && savedPart.result.status !== 'self_reviewed') {
          const result = checkWritten(q, part.label, savedPart.value);
          // Rebuild explanatory criteria on reload only for the exact same
          // score. A future checker revision must not silently rewrite history.
          if (result.estimated_awarded === savedPart.result.score && result.max_marks === savedPart.result.max_marks) { renderFeedback(result, saved); return; }
        }
        feedback.replaceChildren(...(saved ? [text(document, saved)] : []));
      });
      parts.append(section);
    }
    card.append(parts);
  }
  const support = node(document, 'div', 'original-question-support');
  const notes = node(document, 'ul'); for (const note of q.notes) notes.append(node(document, 'li', '', note));
  const answer = [];
  if (q.question_type === 'mcq') answer.push(node(document, 'p', 'original-answer-label', `Correct option: ${q.answer.correct_option}`));
  answer.push(text(document, q.answer.explanation));
  if (q.question_type === 'written') for (const part of q.answer.parts) {
    answer.push(node(document, 'h3', '', `(${part.label}) ${part.answer}`), text(document, part.working));
    const points = node(document, 'ul', 'original-marking-points');
    for (const point of part.marking_points) points.append(node(document, 'li', '', `${point.text} [${point.marks}]`));
    answer.push(points);
  }
  answer.push(node(document, 'h3', 'original-key-notes-heading', 'Key notes'), notes);
  if (q.question_type === 'mcq') support.append(help(document, 'Hint', [text(document, q.hint)]));
  support.append(help(document, 'Answer and key notes', answer));
  card.append(support);
  card.restoreAttempt = () => { for (const restore of [...controls, ...feedbacks]) restore(); };
  card.restoreAttempt(); return card;
}

export function mountOriginals(host, {
  document = host.ownerDocument, fetcher = globalThis.fetch, storage,
  getHash = () => globalThis.location?.hash || '#originals',
  replaceHash = hash => globalThis.history?.replaceState(null, '', hash),
} = {}) {
  let loading, batches, questions, view, workspace, generation = 0;
  const state = (title, message, retry = false) => {
    host.replaceChildren();
    const box = node(document, 'div', 'originals-state');
    box.append(node(document, 'h2', '', title), node(document, 'p', '', message));
    box.setAttribute('role', retry ? 'alert' : 'status');
    if (retry) { const button = node(document, 'button', 'originals-reset', 'Try again'); button.type = 'button'; button.addEventListener('click', () => void show()); box.append(button); }
    host.append(box);
  };
  function render() {
    workspace?.dispose(); view = undefined; host.replaceChildren();
    workspace = createTopicWorkspace(document, batches, {storage, onRestore: () => { for (const card of view?.cards.values() || []) card.restoreAttempt(); }});
    const groups = topicGroups(batches);
    const controls = node(document, 'div', 'originals-filters'); controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Filter original questions');
    function select(id, title, options) {
      const wrapper = node(document, 'div', 'originals-filter'), label = node(document, 'label', '', title), input = node(document, 'select');
      label.htmlFor = id; input.id = id;
      for (const [value, name] of options) { const option = node(document, 'option', '', name); option.value = value; input.append(option); }
      wrapper.append(label, input); controls.append(wrapper); return input;
    }
    const topic = select('originals-topic', 'Syllabus subtopic', [['all', 'All available subtopics'], ...groups.map(g => [g.id, `${TOPICS[g.id]} · ${g.questions.length} questions`])]);
    const format = select('originals-format', 'Question type', [['all', 'All question types'], ['mcq', 'Multiple choice'], ['written', 'Written questions']]);
    const reset = node(document, 'button', 'originals-reset', 'Reset filters'); reset.type = 'button'; controls.append(reset);
    const count = node(document, 'p', 'originals-count'); count.setAttribute('role', 'status'); count.setAttribute('aria-live', 'polite'); count.setAttribute('aria-atomic', 'true');
    const list = node(document, 'div', 'originals-list');
    const cards = new Map(), sections = new Map();
    for (const group of groups) {
      const section = node(document, 'section', 'originals-topic-group'); section.setAttribute('aria-labelledby', `originals-heading-${group.id}`);
      const heading = node(document, 'h2', 'originals-topic-heading', TOPICS[group.id]); heading.id = `originals-heading-${group.id}`;
      const note = node(document, 'p', 'originals-topic-count');
      const body = node(document, 'div', 'originals-topic-questions');
      for (const q of group.questions) { const card = questionCard(document, q, workspace.progress); cards.set(q.id, card); body.append(card); }
      section.append(heading, note, body); sections.set(group.id, {section, note, questions: group.questions}); list.append(section);
    }
    const empty = node(document, 'div', 'originals-state'); empty.hidden = true;
    empty.append(node(document, 'h2', '', 'No questions match these filters'), node(document, 'p', '', 'Choose another subtopic or question type.'));
    const quality = node(document, 'div', 'originals-quality');
    quality.append(node(document, 'p', '', 'Written for the current IB Physics syllabus, using exam-style command terms, mark allocations and restrained diagrams.'));
    quality.append(node(document, 'p', 'originals-quality-review', 'Each question has passed independent AI reviews of its physics, answers, mark allocations, command terms, originality and diagrams.'));
    host.append(quality, workspace.element, controls, count, list, empty);
    view = {topic, format, count, cards, sections, empty};
    const change = () => {
      const params = new URLSearchParams();
      if (topic.value !== 'all') params.set('topic', topic.value);
      if (format.value !== 'all') params.set('format', format.value);
      replaceHash(`#originals${params.size ? `?${params}` : ''}`); apply({topic: topic.value, format: format.value});
    };
    topic.addEventListener('change', change); format.addEventListener('change', change);
    reset.addEventListener('click', () => { topic.value = 'all'; format.value = 'all'; change(); });
  }
  function apply(route) {
    // An exact question link takes precedence over contradictory filter parameters.
    const target = questions.find(q => q.id === route.question);
    if (target) { route.topic = target.topic_ids[0]; route.format = 'all'; }
    view.topic.value = route.topic; view.format.value = route.format;
    const found = filterQuestions(questions, route), ids = new Set(found.map(q => q.id));
    for (const [id, card] of view.cards) card.hidden = !ids.has(id);
    for (const group of view.sections.values()) {
      const visible = group.questions.filter(q => ids.has(q.id)); group.section.hidden = !visible.length;
      group.note.textContent = `${visible.length} ${visible.length === 1 ? 'question' : 'questions'} · Standard level`;
    }
    view.count.textContent = `${found.length} of ${questions.length} questions · ${route.topic === 'all' ? `${view.sections.size} available subtopics` : TOPICS[route.topic]} · SL`;
    view.empty.hidden = found.length > 0;
    if (target && ids.has(target.id)) { const card = view.cards.get(target.id); card.focus({preventScroll: true}); card.scrollIntoView({block: 'start', behavior: 'instant'}); }
  }
  async function show({hash = getHash()} = {}) {
    const ticket = ++generation;
    if (!batches) {
      host.setAttribute('aria-busy', 'true'); state('Opening Neumeris Originals…', 'Loading original physics questions by topic.');
      // Validate all reviewed deliveries before displaying the complete topic collection.
      const request = loading ??= Promise.all(Object.keys(ORIGINALS_SETS).map(id => loadBatch(fetcher, id)));
      try { const loaded = await request; if (ticket !== generation) return false; batches = loaded; questions = batches.flatMap(b => b.questions); loading = undefined; }
      catch { if (ticket !== generation) return false; loading = undefined; host.setAttribute('aria-busy', 'false'); state('Unable to open this collection', 'The questions could not load. Please try again.', true); return false; }
    }
    host.setAttribute('aria-busy', 'false'); if (!view) render(); else workspace.reload();
    const route = parseRoute(hash);
    if (getHash().split('?')[0] !== '#originals') route.question = null;
    apply(route); return true;
  }
  return {show, dispose: () => { generation++; workspace?.dispose(); }};
}

let mounted;
export async function show(options) {
  mounted ??= mountOriginals(globalThis.document.getElementById('originals-content'));
  return mounted.show(options);
}
