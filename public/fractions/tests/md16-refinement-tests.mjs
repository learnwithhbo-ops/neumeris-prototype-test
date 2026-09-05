import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const relative = 'CUR-N02_Multiply_Divide_Fractions_v1_0/skills/MD-16_COMPLETE_v1.2.yaml';
const spec = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'CUR-N02_Multiply_Divide_Fractions_v1_0/MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml'), 'utf8'));
const storage = new Map();
const localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)) };
const window = { location: { search: '' }, localStorage, crypto: { randomUUID: () => `md16-${storage.size}` }, setTimeout, clearTimeout };
window.window = window;
const context = vm.createContext({
  window, localStorage, console, URLSearchParams, setTimeout, clearTimeout,
  document: { hidden: false, addEventListener() {}, removeEventListener() {}, body: { contains: () => false } }
});
const load = file => vm.runInContext(fs.readFileSync(path.join(root, 'fractions/js', file), 'utf8'), context, { filename: file });
for (const file of ['validators.js', 'lesson-model.js', 'topics.js', 'multi-step-visuals.js', 'operation-structure-visuals.js', 'visual-primitives.js', 'skill-loader.js']) load(file);
window.RevilyNarrationSync = { NarrationSync: class { stop() {} } };
load('lesson-engine.js');
load('source-aligned-engine-profile.js');

const model = window.RevilyLessonModel.buildLessonModel(spec);
const visuals = window.RevilyOperationVisuals;
const multi = window.RevilyMultiStepVisuals;
const validate = window.RevilyValidators.validate;
const question = short => model.getQuestion(`MD-16-${short}`);
const clone = value => JSON.parse(JSON.stringify(value));

assert.equal(window.RevilySkillLoader.inspectSkill(spec, manifest.skills.find(entry => entry.id === 'MD-16'), manifest).length, 0);
assert.equal(spec.spec_intent.source_material.sha256, '0c2527136af119d4fa68a8c65b32df2cd72826661ee676e40d94de82ff92fcb9');
assert.equal(spec.spec_intent.refinement.version, 'MD16-source-aligned-1');
assert.equal(spec.spec_intent.refinement.source_review, 'complete');
assert.match(spec.spec_intent.refinement.note, /All 20 authoritative source pages/);
assert.match(spec.spec_intent.refinement.note, /Entry, Diagnostic and delayed Retrieval remain excluded/);
assert.match(spec.spec_intent.refinement.note, /ribbon prompts omit the joining assumption/);
assert.equal(spec.diagnostic.enabled, false);
assert.equal(spec.question_bank.length, 21);
assert.equal(spec.lesson.teaching_steps.length, 7);
assert.equal(model.nodes.length, 26);
assert.equal(model.exitIds.length, 4);
assert.equal(model.confirmationIds.length, 0);
assert.equal(spec.lesson.practice.question_order.length, 10);

const expected = {
  G01: 24, G02: 32, P01: 6, P02: 40, P03: 24, P04: 15, P05: 4, P06: 6,
  X01: 8, X02: 56, X03: 15, X04: 27, E01: 60, E02: 18, E03: 16
};
for (const [short, answer] of Object.entries(expected)) {
  const item = question(short);
  assert.deepEqual(item.answer.value, answer, short);
  assert.equal(validate(item, answer), true, `${short} accepts its source answer`);
  assert.equal(validate(item, String(Number(answer) + 1000)), false, `${short} rejects an unrelated answer`);
}
assert.equal(question('C01').answer.value, 'Only the water used is poured into the 2/3-litre bottles.');
assert.equal(question('C02').answer.value, '(48 × 3/4) ÷ 2/3');
assert.equal(question('P07').answer.value, '(24 × 7/8) ÷ 3/4');
assert.equal(question('X05').answer.value, '(60 × 7/10) ÷ 3/5');
assert.match(question('P03').response_feedback['36'], /reconstructed whole/);
assert.match(question('P04').response_feedback['6'], /total liquid/);
assert.match(question('E01').response_feedback['45'], /intermediate volume/);
for (const short of ['P06', 'X03']) assert.match(question(short).prompt, /joined end to end without overlap/, `${short} states the assumption needed by its source answer`);
for (const [short, suffix] of Object.entries({ G01: 'kg', G02: 'bags', P01: 'teams', P02: 'portions', P04: 'bottles', P05: 'portions', P06: 'lengths', X01: 'boxes', X02: 'containers', X03: 'lengths', X04: 'students', E01: 'bottles', E03: 'cups' })) {
  assert.equal(question(short).response.suffix, suffix, `${short} uses the requested answer unit, not the intermediate unit`);
}

const contexts = new Set(), structures = new Set();
for (const node of model.nodes) {
  const item = node.question;
  const authored = visuals.modelFor(node.visual, { question: item });
  assert.ok(authored, `${node.id} has an explicit visual model`);
  contexts.add(authored.context);
  if (authored.kind === 'multi_step') structures.add(authored.structure);
  const initial = visuals.renderMarkup(node.visual, { question: item });
  const description = visuals.accessibleDescription(node.visual, { question: item });
  assert.doesNotMatch(initial, /undefined|NaN/);
  assert.doesNotMatch(description, /undefined|NaN/);
  if (!item) continue;
  assert.match(initial, /data-revealed="false"/);
  assert.doesNotMatch(initial, /os-working|Compare your working/);
  assert.match(description, /(not shown|no answer is shown)/i, `${item.id} accessible text withholds its result`);
  assert.notEqual(item.scripts.on_correct_reaction, item.scripts.on_incorrect_attempt_1);
  assert.ok(item.response_feedback && Object.keys(item.response_feedback).length >= 2, `${item.id} has answer-specific feedback`);
  const supported = visuals.renderMarkup(node.visual, { question: item, feedback: 'support', workingRevealed: 1 });
  assert.match(supported, /Compare your working/);
  assert.equal((supported.match(/<li>/g) || []).length, 1, `${item.id} reveals one working line at a time`);
  const completed = visuals.renderMarkup(node.visual, { question: item, feedback: 'support', workingRevealed: item.working.length });
  assert.equal((completed.match(/<li>/g) || []).length, item.working.length);
  assert.doesNotMatch(completed, /undefined|NaN/);
}
assert.ok(contexts.size >= 16, `expected broad visual context variation, saw ${contexts.size}`);
assert.deepEqual([...structures].sort(), ['fraction_then_fraction', 'fraction_then_group', 'reconstruct_then_fraction', 'reconstruct_then_group', 'repeat_then_group']);
assert.match(visuals.renderMarkup(model.getNode('T01').visual), /data-ms-phase="given"/);
assert.match(visuals.renderMarkup(model.getNode('T03').visual), /data-ms-phase="intermediate"/);
assert.match(visuals.renderMarkup(model.getNode('T05').visual), /data-ms-phase="result"/);
assert.match(visuals.accessibleDescription(model.getNode('T03').visual), /intermediate quantity is 36 litres/);
assert.match(visuals.accessibleDescription(question('P03').visual), /result is not shown/);
assert.match(visuals.renderMarkup(question('P01').visual), /os-ms-people/);
assert.match(visuals.renderMarkup(question('P06').visual), /os-ms-ribbon/);
assert.match(visuals.renderMarkup(question('X01').visual), /os-ms-books/);
assert.match(visuals.renderMarkup(question('P05').visual), /os-ms-sack/);
assert.match(visuals.renderMarkup(question('E01').visual), /os-ms-liquid/);
assert.match(visuals.renderMarkup(question('G01').visual, { question: question('G01'), feedback: 'support', workingRevealed: 1 }), /data-ms-phase="first_relation"/);
assert.match(visuals.renderMarkup(question('P03').visual, { question: question('P03'), feedback: 'support', workingRevealed: 1 }), /data-ms-phase="first_relation"/);
assert.match(visuals.renderMarkup(question('P03').visual, { question: question('P03'), feedback: 'support', workingRevealed: 2 }), /data-ms-phase="intermediate"/);
assert.doesNotMatch(visuals.renderMarkup(question('P04').visual), /8 ×/i, 'unprompted contexts do not preselect the first operation');

const rational = value => window.RevilyValidators.parseRational(value);
const same = (left, right) => window.RevilyValidators.sameRational(left, right);
for (const short of Object.keys(expected)) {
  const item = question(short), authored = item.visual.model;
  if (authored.kind !== 'multi_step') continue;
  const exact = multi.exactResult(authored);
  const selected = authored.answer_scope === 'intermediate' ? exact.intermediate : exact.result;
  assert.equal(same(selected, rational(item.answer.value)), true, `${short} visual conserves the authored answer`);
}
assert.equal(multi.exactResult({ kind: 'multi_step', structure: 'fraction_then_group', given: 48, first_fraction: { n: 3, d: 4 }, group_size: { n: 2, d: 3 } }).result.n, 54);
assert.equal(multi.exactResult({ kind: 'multi_step', structure: 'reconstruct_then_fraction', given: 27, known_fraction: { n: 3, d: 4 }, target_fraction: { n: 2, d: 3 } }).result.n, 24);
assert.equal(multi.exactResult({ kind: 'multi_step', structure: 'repeat_then_group', copies: 8, item_size: { n: 3, d: 4 }, group_size: { n: 2, d: 5 } }).result.n, 15);
assert.equal(multi.exactResult({ kind: 'multi_step', structure: 'fraction_then_fraction', given: 54, first_fraction: { n: 2, d: 3 }, second_fraction: { n: 3, d: 4 } }).result.n, 27);
assert.equal(multi.exactResult({ kind: 'multi_step', structure: 'reconstruct_then_group', given: 28, known_fraction: { n: 4, d: 7 }, group_size: { n: 7, d: 8 } }).result.n, 56);
assert.throws(() => multi.exactResult({ kind: 'multi_step', structure: 'fraction_then_group', given: 10, first_fraction: { n: 1, d: 2 }, group_size: { n: 0, d: 3 } }), /cannot be zero/);

function engine() {
  const lesson = new window.RevilyLessonEngine.LessonEngine({ querySelector: () => null }, spec, {}, {});
  lesson.elements = { canvas: { setAttribute() {}, removeAttribute() {}, querySelector() { return null; }, innerHTML: '' }, primary: {}, ryan: null };
  lesson.lockInputs = () => {};
  lesson.refocusInput = () => {};
  lesson.stopNarration = () => {};
  lesson.showFeedback = (...args) => { lesson.feedback = args; };
  lesson.startNarration = (lines, done) => { lesson.narrated = lines; lesson.narrationCallback = done; };
  lesson.readResponse = () => lesson.testResponse;
  lesson.state = lesson.freshState();
  return lesson;
}

for (const node of model.nodes.filter(node => node.question && !node.exit)) {
  const item = node.question;
  const wrong = item.response.type === 'single_choice'
    ? item.response.options.find(option => option !== item.answer.value)
    : '99999';
  for (const wrongCount of [0, 1, 2]) {
    const lesson = engine();
    lesson.testResponse = wrong;
    for (let attempt = 0; attempt < wrongCount; attempt++) {
      lesson.submitAnswer(node);
      assert.equal(lesson.state.resolved[item.id], undefined, `${item.id} remains correctable`);
    }
    lesson.testResponse = clone(item.answer.value);
    lesson.submitAnswer(node);
    assert.equal(lesson.state.resolved[item.id], wrongCount ? 'correct_after_support' : 'correct');
  }
}

for (let mask = 0; mask < 16; mask++) {
  const lesson = engine();
  model.exitIds.forEach((questionId, index) => {
    const node = model.nodes.find(candidate => candidate.questionId === questionId);
    lesson.testResponse = mask & (1 << index)
      ? (node.question.response.type === 'single_choice' ? node.question.response.options.find(option => option !== node.question.answer.value) : '99999')
      : clone(node.question.answer.value);
    lesson.submitAnswer(node);
  });
  assert.equal(lesson.state.masteryState, mask ? 'LEARNING' : 'READY_FOR_RETRIEVAL');
  assert.equal(lesson.state.exit.confirmationId, null);
}

assert.equal(fs.readFileSync(path.join(root, relative), 'utf8'), fs.readFileSync(path.join(root, 'revily-site/public', relative), 'utf8'));
assert.equal(fs.readFileSync(path.join(root, 'fractions/js/multi-step-visuals.js'), 'utf8'), fs.readFileSync(path.join(root, 'revily-site/public/fractions/js/multi-step-visuals.js'), 'utf8'));
console.log('MD-16: all 20 source pages, five multi-step structures, 16+ distinct contexts, source answers, progressive corrections and all 16 mastery outcomes passed.');
