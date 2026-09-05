import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalPath = join(appRoot, "js", "fra02-canonical.js");
const visualsPath = join(appRoot, "js", "fra02-visuals.js");
const manifestPath = join(appRoot, "fra02-narration-manifest.json");

const context = vm.createContext({ window: {} });
new vm.Script(await readFile(canonicalPath, "utf8"), { filename: canonicalPath }).runInContext(context);
new vm.Script(await readFile(visualsPath, "utf8"), { filename: visualsPath }).runInContext(context);

const spec = {
  identity: { id: "FRA-02" },
  experience_contract: { global_ui_copy: {} },
  voice_and_script: {},
  visual_language: {},
  engine_capability_requirements: {},
  lesson: {}
};
context.window.RevilyFra02Canonical.apply(spec);

const question = (id) => spec.question_bank.find((item) => item.id === `FRA-02-${id}`);
const g1 = question("G1");
assert.equal(g1.prompt, "Which number counts the selected parts?");
assert.doesNotMatch(g1.scripts.before_submit, /numerator/i);
assert.match(g1.scripts.on_correct_math, /numerator/i);

const learnerSuccessIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
const reactions = learnerSuccessIds.map((id) => question(id).scripts.on_correct_reaction);
assert.ok(reactions.every(Boolean));
assert.equal(new Set(reactions).size, reactions.length);
assert.ok(reactions.every((line) => !/^Wonderful\b/i.test(line)));

let renderedFeedback;
let narratedFeedback;
const engineContext = vm.createContext({
  window: {
    RevilyLessonModel: { buildLessonModel: () => ({}), normalisePhase: (value) => value },
    RevilyValidators: { serialiseResponse: (value) => value, validate: () => true },
    RevilyVisuals: { escapeHtml: String, mathMarkup: String, modelChoiceMarkup: String, render: () => {} },
    RevilyNarrationSync: { NarrationSync: class {} },
    location: { search: "" }
  },
  document: {},
  URLSearchParams,
  URL,
  Date,
  Math,
  console,
  setTimeout,
  clearTimeout
});
const enginePath = join(appRoot, "js", "lesson-engine.js");
new vm.Script(await readFile(enginePath, "utf8"), { filename: enginePath }).runInContext(engineContext);
const engine = Object.create(engineContext.window.RevilyLessonEngine.LessonEngine.prototype);
engine.spec = spec;
engine.state = {
  attempts: { [g1.id]: 1 },
  resolved: {},
  feedback: {},
  evidence: { hintOpenedBeforeSubmit: {}, pendingNoHintConfirmations: [], freshConfirmationPassed: {} },
  practiceStreak: 0
};
engine.elements = { canvas: {}, primary: { textContent: "", disabled: true } };
engine.selectReaction = () => null;
engine.persist = () => {};
engine.lockInputs = () => {};
engine.showFeedback = (_kind, primary, detail) => { renderedFeedback = { primary, detail }; };
engine.startNarration = (lines) => { narratedFeedback = lines; };
engine.workedSummary = () => "";
engine.advance = () => {};
engine.handleCorrect({ question: g1, questionId: g1.id, phase: "guided", visual: {}, recovery: false });
assert.equal(renderedFeedback.primary, g1.scripts.on_correct_reaction);
assert.deepEqual([...narratedFeedback], [g1.scripts.on_correct_reaction, g1.scripts.on_correct_math]);

for (const id of ["F1", "F2", "I1", "I2"]) {
  assert.match(spec.lesson.transfer_steps[id].pre_question_script, /hint/i);
}

const fresh = question("C-SWAP-1");
const initialMarkup = context.window.RevilyFra02Visuals.renderMarkup({}, { question: fresh, feedback: "initial" });
assert.doesNotMatch(initialMarkup, /fra02-fraction/);
assert.doesNotMatch(initialMarkup, /NUMERATOR|DENOMINATOR/);
const revealedMarkup = context.window.RevilyFra02Visuals.renderMarkup({}, { question: fresh, feedback: "correct" });
assert.match(revealedMarkup, /fra02-numerator[^>]*>7</);
assert.match(revealedMarkup, /fra02-denominator[^>]*>10</);
assert.doesNotMatch(context.window.RevilyFra02Visuals.accessibleDescription(fresh.model), /7 over 10|numerator|denominator/i);

const flatten = (value) => Array.isArray(value) ? value.flat(Infinity) : [value];
const learnerText = [
  ...spec.lesson.teaching_steps.flatMap((step) => [step.scene?.display_title, step.narration?.script]),
  ...Object.values(spec.lesson.transfer_steps).map((step) => step.pre_question_script),
  ...spec.question_bank.flatMap((item) => [item.prompt, item.questionDetail, ...flatten(Object.values(item.scripts || {})), ...flatten(Object.values(item.mathematical_support || {}))]),
  spec.completion.secure.title,
  spec.completion.secure.ryan_script,
  spec.completion.needs_work.title,
  spec.completion.needs_work.ryan_script,
  context.window.RevilyFra02Visuals.renderMarkup({ scene: { model: { context: "handoff", teachingVariant: "handoff" } } }, {})
].flat(Infinity).filter(Boolean).join(" ");
assert.doesNotMatch(learnerText, /\bjobs?\b/i);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
assert.equal(manifest.voice, "en-GB-RyanNeural");
assert.equal(manifest.tracks.length, 155);
const trackTexts = new Set(manifest.tracks.map((track) => track.text));
const speechBeats = (value) => String(value || "").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
const requiredNarration = [
  ...spec.lesson.teaching_steps.map((step) => step.narration?.script),
  ...Object.values(spec.lesson.transfer_steps).map((step) => step.pre_question_script),
  spec.lesson.exit.intro_script,
  ...Object.values(spec.lesson.adaptive_pathway.feedback_by_error_family),
  spec.completion.secure.ryan_script,
  spec.completion.needs_work.ryan_script,
  ...spec.question_bank.flatMap((item) => [...flatten(Object.values(item.scripts || {})), ...flatten(Object.values(item.mathematical_support || {}))])
].flat(Infinity).filter(Boolean).flatMap(speechBeats).map((line) => line.trim());
requiredNarration.forEach((line) => assert.ok(trackTexts.has(line), `Missing Ryan track: ${line}`));

for (const track of manifest.tracks) {
  assert.doesNotMatch(track.text, /\bjobs?\b/i);
  assert.ok(track.words?.length, `Missing word alignment: ${track.text}`);
  const audioPath = join(appRoot, "audio", track.file);
  assert.ok((await stat(audioPath)).size > 128, `Missing audio: ${track.file}`);
  const header = new Uint8Array((await readFile(audioPath)).subarray(0, 3));
  assert.ok(String.fromCharCode(...header) === "ID3" || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0), `Invalid MP3: ${track.file}`);
}

console.log("FRA02 revision QA passed: terminology, handoffs, reactions, answer concealment, and 155 aligned Ryan tracks.");
