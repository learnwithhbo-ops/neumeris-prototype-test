/**
 * Bounded practice checking for the independently reviewed Foundations pilot.
 * These are explicit rubric rules, not an essay grader. Missing recognition does
 * not prove an answer wrong; unverified points are reported separately.
 * No network requests, AI, dynamic code execution or persistent state are used.
 */
export const MAX_ANSWER_LENGTH = 4000;
export const MARKING_VERSION = 'physics-foundations-practice-v5';
export const PRACTICE_NOTICE = 'Automatic practice estimate from saved rubric rules. Unverified points may still be correct. Arbitrary explanations, method marks and follow-through are not fully interpreted.';

import {originalSet, originalSetForQuestion} from './originals-sets.js';
import {ASSESSMENT_REVISION} from './originals-contracts.js';
import {ASSESSMENT_MARKING} from './originals-assessment-marking-data.js';
const superscripts = {'⁻':'-', '⁺':'+', '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9'};
const normalize = text => text.replace(/10([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, exponent) => `10^${[...exponent].map(c => superscripts[c]).join('')}`).replace(/([a-zA-Z0-9)])²/g, '$1^2').normalize('NFKC').toLowerCase().replace(/[−–]/g, '-').replace(/[‘’]/g, "'").replace(/λ/g, 'lambda')
  .replace(/([+-]?(?:\d+\.?\d*|\.\d+))\s*[x×*]\s*10\s*\^\s*([+-]?\d+)/g, '$1e$2').replace(/\s+/g, ' ').trim();
// Recognition is intentionally withheld for denied, hypothetical or uncertain
// assertions. This is broader than a keyword-negation window: an answer may
// quote a correct relationship only to reject it elsewhere in the sentence.
const negative = /\b(?:not|never|no|none|nowhere|neither|nor|cannot|can't|doesn't|isn't|aren't|don't|won't|wouldn't|didn't|hasn't|haven't|couldn't|shouldn't|dont|doesnt|isnt|arent|cant|wont|didnt|fail(?:s|ed|ing)?|incorrect(?:ly)?|wrong|false|untrue|impossible|absent|without|unable|avoid(?:s|ed|ing)?|deny|denies|denied|reject(?:s|ed|ing)?)\b/;
const tentative = /\b(?:maybe|perhaps|either|guess|possibly|unsure|if|unless|would|could|might|may|should|hypothetically|assuming|unlikely|rarely|hardly)\b|\bnot\s+sure\b|\?/;
const numberPattern = '([+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?)';

function assertQuestion(question, type) {
  const batchId = originalSetForQuestion(question?.id), set = batchId && originalSet(batchId);
  if (!set || !Number.isInteger(question.number) || question.number < 1 + set.offset || question.number > 12 + set.offset ||
      question.id !== `${set.prefix}${String(question.number - set.offset).padStart(2, '0')}` || question.question_type !== type ||
      question.number % 2 !== (type === 'mcq' ? 1 : 0)) {
    throw new TypeError('Practice checking supports only the reviewed Foundations pilot and the requested question type.');
  }
}

/** MCQ checking is exact against the saved, independently checked answer. */
export function checkMcq(question, option) {
  assertQuestion(question, 'mcq');
  const labels = question.options?.map(item => item.label);
  if (question.marks !== 1 || !Array.isArray(labels) || labels.join('') !== 'ABCD' || !labels.includes(question.answer?.correct_option)) {
    throw new TypeError('A complete checked MCQ answer is required.');
  }
  if (option === null || option === undefined || option === '') {
    return {version: MARKING_VERSION, status: 'unanswered', attempted: false, selected_option: null, correct: null, estimated_awarded: 0, max_marks: 1, needs_review: false, criteria: [], notice: 'Choose an option before checking.'};
  }
  if (typeof option !== 'string' || !labels.includes(option.trim().toUpperCase())) throw new TypeError('Choose one saved MCQ option.');
  const selected = option.trim().toUpperCase(), correct = selected === question.answer.correct_option;
  return {version: MARKING_VERSION, status: 'checked', attempted: true, selected_option: selected, correct, estimated_awarded: correct ? 1 : 0, max_marks: 1, needs_review: false, criteria: [], notice: 'Option checked against the saved answer.'};
}

const lengthUnits = '(cm|m|centimet(?:er|re)s?|met(?:er|re)s?)';
const forceUnits = '(kn|n|kilonewtons?|newtons?)(?!\\s*(?:s\\b|[·*]\\s*s\\b|seconds?\\b))';
const impulseUnits = '(n\\s*[·*]?\\s*s|newton[ -]?seconds?|kg\\s*m\\s*(?:/\\s*s|s\\s*\\^?\\s*-1))';
const powerUnits = '(kw|w|kilowatts?|watts?)';
const temperatureUnits = '(°\\s*c|deg(?:rees?)?\\s*c|celsius|c|k|kelvin)';

function valuesWithUnits(text, units) {
  // A metre in m/s or m² is not a length unit. Do not accept a prefix of a
  // different compound or powered unit; unfamiliar notation stays unverified.
  const pattern = new RegExp(`(?<![a-z0-9.])${numberPattern}\\s*${units}(?![a-z0-9/·*^]|\\s*(?:[/·*^]|[-+]\\d))`, 'g');
  return [...text.matchAll(pattern)].map(match => ({value: Number(match[1]), unit: match[2].replace(/\s+/g, ''), index: match.index, end: match.index + match[0].length})).filter(item => Number.isFinite(item.value));
}

function terminalQuantity(text, units, {direction = false} = {}) {
  const values = valuesWithUnits(text, units);
  if (!values.length) return null;
  const last = values.at(-1), suffix = text.slice(last.end).trim();
  // A recognised intermediate is insufficient. After the final quantity only
  // punctuation and the explicitly supported direction are allowed. This also
  // rejects spoken compound units ("W per kg") and later unitless answers.
  const allowedTail = direction ? /^(?:away from (?:the )?cushion)?\s*[.!]*$/ : /^[.!]*$/;
  return allowedTail.test(suffix) ? last : null;
}

function resultRule(units, convert, expected, tolerance, {direction = false} = {}) {
  return text => {
    if (/\bor\b/.test(text)) return false;
    const last = terminalQuantity(text, units, {direction});
    if (!last) return false;
    const converted = convert(last.value, last.unit);
    if (direction) {
      const away = /\baway from (?:the )?cushion\b/.test(text);
      const toward = /\b(?:towards?|into) (?:the )?cushion\b/.test(text);
      if (toward) return false;
      if (converted > 0 && !away) return false;
      return Math.abs(Math.abs(converted) - Math.abs(expected)) <= tolerance;
    }
    return Math.abs(converted - expected) <= tolerance;
  };
}

const lengthResult = (expected, tolerance = 0.005) => resultRule(lengthUnits, (value, unit) => /^c/.test(unit) ? value / 100 : value, expected, tolerance);
const neverAutomatic = () => false;
const celsiusValue = (value, unit) => /^(k|kelvin)$/.test(unit) ? value - 273.15 : value;
const temperatureResult = text => {
  const ordinary = resultRule(temperatureUnits, celsiusValue, 31.1, 0.15);
  if (ordinary(text)) return true;
  // The saved answer gives a rounded result followed by its unrounded value.
  // Accept only that complete terminal form, with two compatible temperatures,
  // correct units and a genuine rounding relationship. Extra prose, alternative
  // answers or a contradictory parenthesized value remain unverified.
  if (/\bor\b/.test(text)) return false;
  const annotation = text.match(new RegExp(`(?<![a-z0-9.])([+-]?(?:\\d+\\.?\\d*|\\.\\d+))\\s*${temperatureUnits}\\s*\\(\\s*${numberPattern}\\s*${temperatureUnits}\\s+before rounding\\s*\\)\\s*[.!]*$`));
  if (!annotation) return false;
  const [, roundedText, roundedUnit, exactText, exactUnit] = annotation;
  // Kelvin and Celsius rounding take place on different scales; mixed-unit
  // annotations are outside this explicitly supported form.
  const kelvin = unit => /^(k|kelvin)$/.test(unit.replace(/\s+/g, ''));
  if (kelvin(roundedUnit) !== kelvin(exactUnit)) return false;
  const rounded = Number(roundedText), exact = Number(exactText);
  const precision = (roundedText.split('.')[1] || '').length;
  const scale = 10 ** precision;
  return Number.isFinite(exact) && Math.abs(celsiusValue(rounded, roundedUnit) - 31.1) <= 0.15 &&
    Math.abs(celsiusValue(exact, exactUnit) - 31.1) <= 0.15 &&
    Math.abs(Math.round(exact * scale) / scale - rounded) < 1e-9;
};
const efficiencyResult = text => {
  if (/\bor\b/.test(text)) return false;
  const percentage = terminalQuantity(text, '(%|percent|per\\s+cent)');
  if (percentage) return Math.abs(percentage.value - 64) <= 0.5;
  if (/%|\b(?:percent|percentage|per cent)\b/.test(text)) return false;
  // Only a genuinely dimensionless final ratio is eligible. A word describing
  // a different unit or a later answer cannot be ignored after the number.
  const finalRatio = text.match(new RegExp(`${numberPattern}\\s*[.!]*$`));
  if (!finalRatio) return false;
  if (/\b(?:j|joules?|w|watts?|m|metres?|meters?|n|newtons?|s|seconds?|kg|kilograms?|k|kelvin|celsius)\b/.test(text)) return false;
  const previous = text.slice(0, finalRatio.index);
  if (/\b(?:power|force|distance|displacement|temperature|impulse)\b/.test(previous)) return false;
  return Math.abs(Number(finalRatio[1]) - 0.64) <= 0.005;
};

function heatCapacityExplanation(text) {
  const waterCapacity = /\bwater\b.{0,65}\b(?:has|have|is)\b.{0,25}\b(?:larger|greater|higher)\b.{0,30}\b(?:total heat capacity|heat capacity|mc)\b/.test(text) ||
    /\b(?:total heat capacity|heat capacity|mc)\b.{0,25}\b(?:of|for) (?:the )?water\b.{0,20}\b(?:is|being)\b.{0,12}\b(?:larger|greater|higher)\b/.test(text);
  const connector = text.match(/\b(?:so|therefore|hence|because|causes?|means|produces?|results?|giving)\b/);
  if (!connector) return false;
  const effect = text.slice(connector.index + connector[0].length).trim();
  // Bind the smaller change to the water in the causal effect clause. Merely
  // finding "water", "capacity" and "smaller change" elsewhere is insufficient.
  const energyEffect = '^(?:the )?(?:same|equal)\\s+(?:transferred\\s+)?(?:amount of\\s+)?(?:energy|heat)(?: transfer)?\\s+(?:causes?|produces?|gives)\\s+(?:a )?(?:smaller|less|lower)\\s+(?:temperature change|change in temperature|temperature rise)';
  const waterChange = new RegExp(`${energyEffect}\\s+(?:in|of|for) (?:the )?water[.!]*$`).test(effect) ||
    /^(?:the )?water(?:'s)?\s+temperature\s+(?:changes|rises|increases)\s+less\s+for (?:the )?(?:same|equal) (?:energy|heat)[.!]*$/.test(effect) ||
    /^(?:the )?water\s+(?:has|undergoes|experiences|shows)\s+(?:a )?(?:smaller|less|lower)\s+(?:temperature change|change in temperature|temperature rise)\s+for (?:the )?(?:same|equal) (?:energy|heat)[.!]*$/.test(effect);
  // The subject may be inherited from the water-capacity clause only for this
  // complete, unambiguous causal statement, with no different body introduced.
  const inheritedWater = new RegExp(`${energyEffect}[.!]*$`).test(effect);
  const sameEnergy = /\b(?:same|equal)\b.{0,20}\b(?:energy|heat)\b/.test(text);
  const contradiction = /\bwater\b.{0,45}\b(?:smaller|lower|less)\b.{0,20}\b(?:heat capacity|mc)\b/.test(text) || /\bwater\b.{0,50}\b(?:larger|greater|bigger)\b.{0,20}\b(?:temperature change|temperature rise)\b/.test(text);
  // Specific heat capacity by itself does not establish the assessed mc link.
  const wrongBody = /\bmetal\b.{0,35}\b(?:smaller|less|lower)\b.{0,25}\b(?:temperature change|change in temperature|temperature rise)\b/.test(text) ||
    /\bmetal(?:'s)? temperature\b.{0,18}\b(?:changes|rises|increases)\b.{0,12}\bless\b/.test(text);
  return waterCapacity && (waterChange || inheritedWater) && sameEnergy && !contradiction && !wrongBody && !/\bspecific heat capacity\b/.test(text);
}

function phaseExplanation(text) {
  if (/\bconstructive\b|\bin phase\b/.test(text)) return false;
  return /\bpath difference\b/.test(text) &&
    /\bhalf[- ]integer\b|\b1\.5\s*(?:wavelengths?|lambda)\b|\bodd\b.{0,12}\bhalf\b|\bthree half\b|\b3\s*lambda\s*\/\s*2\b/.test(text) &&
    /\bantiphase\b|\bout of phase\b|\bdestructive interference\b/.test(text) &&
    /\b(?:is|are|arrive|causes?|produces?|results?|means)\b/.test(text);
}

function cancellationExplanation(text) {
  if (/\bconstructive\b|\bin phase\b/.test(text)) return false;
  const equality = /\b(?:equal|same)\b.{0,18}\bamplitudes?\b|\bamplitudes?\b.{0,18}\b(?:equal|same)\b/.test(text);
  return equality && /\b(?:cancel|cancels|cancelling|canceling|cancellation)\b|\b(?:add|sum)\b.{0,18}\bzero\b/.test(text) &&
    /\b(?:cancel|cancels|are|have|has|add|sum)\b/.test(text);
}

function resonanceRelationship(text) {
  const matching = /\bdriv(?:ing|en) frequency\b.{0,45}\b(?:equals?|matches?|close|same|near)\b.{0,25}\bnatural frequency\b/.test(text) ||
    /\bnatural frequency\b.{0,45}\b(?:equals?|matches?|close|same|near)\b.{0,25}\bdriv(?:ing|en) frequency\b/.test(text);
  const contrary = /\b(?:driving|natural) frequency\b.{0,30}\b(?:different|far|unrelated)\b/.test(text);
  return matching && /\bresonan(?:ce|t)\b/.test(text) && !contrary;
}

function resonanceEnergy(text) {
  const transfer = /\benergy\b.{0,30}\b(?:transfer(?:red)?|suppl(?:y|ied)|absorb(?:ed)?)\b|\b(?:transfer(?:red)?|suppl(?:y|ied)|absorb(?:ed)?)\b.{0,30}\benergy\b/.test(text);
  const efficiency = /\befficient(?:ly)?\b|\beffective(?:ly)?\b|\bfavourable phase\b/.test(text);
  const repeated = /\brepeated\b|\b(?:each|every) cycle\b|\bcycles\b/.test(text);
  const weakLoss = /\b(?:weak|light|low|little|limited|small)\b.{0,15}\b(?:damping|dissipation|energy loss(?:es)?)\b/.test(text);
  const amplitude = /\b(?:large|larger|high|higher)\b.{0,25}\bamplitude\b|\bamplitude\b.{0,25}\b(?:grows|builds|increases|large)\b/.test(text);
  const contrary = /\binefficient(?:ly)?\b|\b(?:high|strong|large) damping\b/.test(text);
  return transfer && efficiency && repeated && weakLoss && amplitude && !contrary;
}

function lowerMaximum(text) {
  const contrary = /\b(?:maximum|max|peak) amplitude\s+(?:increases?|rises?|(?:becomes?|is|gets?|remains?|stays?)\s+(?:larger|higher|constant|unchanged))\b/.test(text);
  return !contrary && responseClauses(text).some(clause => /^(?:the )?(?:maximum|max|peak) amplitude\s+(?:decreases?|falls?|(?:becomes?|is|gets?)\s+(?:lower|smaller|reduced))[.!]*$/.test(clause));
}

function broaderPeak(text) {
  const contrary = /\bpeak\s+(?:narrows?|(?:becomes?|is|gets?|remains?|stays?)\s+(?:narrower|sharper|unchanged))\b|\bwidth of (?:the )?(?:resonance )?peak\s+(?:decreases?|(?:is|remains?|stays?)\s+(?:smaller|constant|unchanged))\b/.test(text);
  return !contrary && responseClauses(text).some(clause => /^(?:the )?(?:resonance )?peak\s+(?:widens?|broadens?|(?:becomes?|is|gets?)\s+(?:broader|wider|less sharp(?:ly peaked)?))[.!]*$/.test(clause) ||
    /^(?:the )?(?:width|breadth) of (?:the )?(?:resonance )?peak\s+(?:increases?|(?:becomes?|is|gets?)\s+(?:larger|greater|wider))[.!]*$/.test(clause));
}

function responseClauses(text) {
  // Only complete supported state assertions count. Extra qualifications such
  // as "decreases by zero" cannot be silently dropped by substring matching.
  return text.split(/\band\b|[,;]|(?<!\d)\.(?!\d)|(?<=decreases)\s+(?=(?:the )?(?:resonance )?peak\b)/).map(clause => clause.trim()).filter(Boolean);
}

function constructiveStatement(text) {
  // This is a "state" part: a concise saved category is sufficient, but an
  // arbitrary sentence mentioning it is not evidence of an affirmative answer.
  return /^(?:(?:it is |the interference is )?constructive interference|the waves interfere constructively)[.!]*$/.test(text);
}

// One entry per actual printed part. Method marks remain unverified rather than
// being inferred from a final numerical answer. Exact rubric text acts as a
// conservative revision guard when the reviewed content changes later.
// Set 2 checks numerical results and a deliberately small grammar of explicit
// calculations. Correct unfamiliar working remains unverified, never inferred
// from formula keywords. Method patterns also require the correct final result.
const speedUnits = '(m\\s*(?:/\\s*s|s\\s*\\^?\\s*-1)|met(?:er|re)s? per seconds?)';
const set2LengthUnits = '(nm|[μµu]m|mm|cm|m)';
const scaledLength = unit => ({nm:1e-9, 'μm':1e-6, 'µm':1e-6, um:1e-6, mm:1e-3, cm:1e-2, m:1})[unit];
const metres = (expected, tolerance) => resultRule(set2LengthUnits, (value, unit) => value * scaledLength(unit), expected, tolerance);
const speed = (expected, tolerance = 0.015) => resultRule(speedUnits, value => value, expected, tolerance);
const rightward = rule => text => rule(text.replace(/\s+to (?:the )?right[.!]*$/, ''));
const math = text => text.replace(/\s+/g, '').replace(/[×·]/g, '*').replace(/⁄/g, '/').replace(/−/g, '-');
const calculation = (result, patterns) => text => result(text) && patterns.some(pattern => new RegExp(`(?:^|=|;|,(?:so|thus|hence|therefore))${pattern.source}`).test(math(text)));
const speed14 = speed(2.4), time14 = resultRule('(s|seconds?)', value => value, 3, 0.015);
const momentum16 = rightward(resultRule(impulseUnits, value => value, 1.08, 0.025));
const speed16 = rightward(speed(1.2));
const energy18 = resultRule('(j|joules?)', value => value, 1.764, 0.04), speed18 = speed(6.85857, 0.055);
const temperature20 = text => [2416.6667, 2420, 2400].some(expected => resultRule('(k|kelvin)', value => value, expected, 1)(text));
const ratio20 = text => {
  if (/\bor\b|%|\b(?:percent|percentage|per cent)\b/.test(text)) return false;
  const terminal = text.match(new RegExp(`(?<![a-z0-9.])${numberPattern}\\s*[.!]*$`));
  return Boolean(terminal && Math.abs(Number(terminal[1]) - 1.5) <= 0.005);
};
const fringe22 = metres(0.003, 5e-6), wavelength22 = metres(6e-7, 5e-9);
const fringeSubstitution = [/lambda=(?:sd\/d=)?\(3\.0?e-3\)\(0\.40?e-3\)\/2\.0?=/, /lambda=(?:sd\/d=)?\(?3\.0?e-3\)?\*\(?0\.40?e-3\)?\/2\.0?=/];
const wavelength24 = metres(0.36, 0.005), frequency24 = resultRule('(hz|hertz)', value => value, 150, 0.5);

// Set 3 retains exact rubric guards. Only explicit correct substitutions and
// final quantities are recognised; a formula name alone never earns a method.
const set3Calculation = (result, patterns) => text => result(text) && patterns.some(pattern => new RegExp(`(?:^|=|;)${pattern.source}`).test(math(text)));
const irradiance26 = resultRule('(w\\s*(?:/\\s*m\\s*\\^?\\s*2|m\\s*\\^?\\s*-2))', value => value, 130, 0.5);
const power26 = resultRule(powerUnits, (value, unit) => /^k/.test(unit) ? value * 1000 : value, 3518.5838, 25);
const pressure = (expected, tolerance) => resultRule('(kpa|pa|kilopascals?|pascals?)', (value, unit) => /^k/.test(unit) ? value * 1000 : value, expected, tolerance);
const pressure28a = pressure(828, 1), pressure28b = pressure(1242, 5);
const voltage30 = resultRule('(kv|v|kilovolts?|volts?)', (value, unit) => /^k/.test(unit) ? value * 1000 : value, 6, 0.02);
const power30 = resultRule(powerUnits, (value, unit) => /^k/.test(unit) ? value * 1000 : value, 12, 0.05);
const period32 = resultRule('(s|seconds?)', value => value, 0.314159, 0.005), frequency32 = resultRule('(hz|hertz)', value => value, 1.59155, 0.015);
const gravity = (expected, tolerance) => resultRule('(n\\s*(?:/\\s*kg|kg\\s*\\^?\\s*-1)|m\\s*(?:/\\s*s\\s*\\^?\\s*2|s\\s*\\^?\\s*-2))', value => value, expected, tolerance);
const gravity34a = gravity(6.67, 0.05), gravity34b = gravity(1.6675, 0.04);
const field36 = resultRule('(v\\s*(?:/\\s*m|m\\s*\\^?\\s*-1)|n\\s*(?:/\\s*c|c\\s*\\^?\\s*-1))', value => value, 30000, 100);
const forceMagnitude36 = text => resultRule(forceUnits, (value, unit) => /^k/.test(unit) ? value * 1000 : value, 0.06, 0.0005)(text.replace(/,?\s+towards? (?:the )?(?:negative|positive) plate[.!]*$/, ''));
const force36 = text => !/\btowards? (?:the )?positive plate\b/.test(text) && /\btowards? (?:the )?negative plate[.!]*$/.test(text) && forceMagnitude36(text);

const RULES = new Map([
  ['2:a', [
    ['Uses signed areas under the velocity–time graph, with negative area below the axis.', neverAutomatic],
    ['Obtains 0 m from 6 + 1.5 − 1.5 − 6.', lengthResult(0, 0.0001)],
  ]],
  ['2:b', [
    ['Adds the magnitudes of the positive and negative areas, including the two reversal triangles.', neverAutomatic],
    ['Obtains 15 m.', lengthResult(15, 0.05)],
  ]],
  ['4:a', [
    ['Uses J = m(v − u) with a negative rebound velocity.', neverAutomatic],
    ['Obtains −3.2 N s, or 3.2 N s away from the cushion.', resultRule(impulseUnits, value => value, -3.2, 0.025, {direction: true})],
  ]],
  ['4:b', [
    ['Uses F = J/Δt with the impulse from part (a); allow consistent follow-through.', neverAutomatic],
    ['Obtains −40 N, or 40 N away from the cushion.', resultRule(forceUnits, (value, unit) => /^k/.test(unit) ? value * 1000 : value, -40, 0.5, {direction: true})],
  ]],
  ['6:a', [
    ['Uses useful energy divided by input energy.', neverAutomatic],
    ['Obtains 0.64 or 64%.', efficiencyResult],
  ]],
  ['6:b', [
    ['Obtains 400 W using 3200 J divided by 8.0 s.', resultRule(powerUnits, (value, unit) => /^k/.test(unit) ? value * 1000 : value, 400, 2)],
  ]],
  ['8:a', [
    ['Sets heat lost by metal equal to heat gained by water with correct masses and temperature differences.', neverAutomatic],
    ['Solves to obtain 31°C; accept 31.1°C.', temperatureResult],
  ]],
  ['8:b', [
    ['Relates the water’s larger mc to its smaller temperature change for the same energy transfer.', heatCapacityExplanation],
  ]],
  ['10:a', [
    ['Obtains 0.90 m.', lengthResult(0.90)],
  ]],
  ['10:b', [
    ['Identifies the half-integer wavelength path difference as producing antiphase/destructive interference.', phaseExplanation],
    ['Uses equal amplitudes and superposition to explain complete cancellation.', cancellationExplanation],
  ]],
  ['10:c', [
    ['States constructive interference.', constructiveStatement],
  ]],
  ['12:a', [
    ['Identifies resonance when the driving frequency is close to the natural frequency.', resonanceRelationship],
    ['Explains efficient repeated energy transfer and limited dissipation as the reason for the large amplitude.', resonanceEnergy],
  ]],
  ['12:b', [
    ['States that the maximum amplitude decreases.', lowerMaximum],
    ['States that the resonance peak broadens (the response becomes less sharply peaked).', broaderPeak],
  ]],
  ['14:a', [
    ['Uses v² = u² + 2as with u = 0 and the stated acceleration and displacement.', calculation(speed14, [/v\^?2=0\+2\*0\.80?\*3\.6=/, /v=(?:sqrt|√)\(2\*0\.80?\*3\.6\)/])],
    ['Obtains 2.4 m s⁻¹.', speed14],
  ]],
  ['14:b', [
    ['Uses t = (v − u)/a or t = √(2s/a).', calculation(time14, [/t=(?:\(v-u\)\/a=)?2\.4\/0\.80?=/, /t=(?:sqrt|√)\(2\*3\.6\/0\.80?\)/])],
    ['Obtains 3.0 s; accept consistent follow-through from part (a).', time14],
  ]],
  ['16:a', [['Obtains +1.08 kg m s⁻¹ (or 1.1 kg m s⁻¹ to the right).', momentum16]]],
  ['16:b', [
    ['Uses conservation of momentum with the combined mass 0.90 kg.', calculation(speed16, [/v=1\.08\/(?:0\.90?|\(0\.60?\+0\.30?\))=/, /\(0\.60?\+0\.30?\)v=1\.08/])],
    ['Obtains +1.2 m s⁻¹, or 1.2 m s⁻¹ to the right; accept consistent follow-through from part (a).', speed16],
  ]],
  ['18:a', [
    ['Uses ΔEₚ = mgΔh with the stated data.', calculation(energy18, [/0\.075\*9\.8\*2\.4=/])],
    ['Obtains 1.8 J (accept 1.764 J or 1.76 J).', energy18],
  ]],
  ['18:b', [
    ['Equates initial kinetic energy to the potential-energy increase.', calculation(speed18, [/(?:1\/2|0\.5)mu\^?2=mgh/, /u=(?:sqrt|√)\(2\*9\.8\*2\.4\)/])],
    ['Obtains 6.9 m s⁻¹ (accept 6.86 m s⁻¹); accept consistent follow-through using part (a).', speed18],
  ]],
  ['20:a', [
    ['Uses TR = b/λR with the peak wavelength in metres.', calculation(temperature20, [/tr=(?:b\/lambdar=)?\(?2\.90?e-3\)?\/\(?1\.20?e-6\)?=/])],
    ['Obtains 2.42 × 10³ K (accept 2.4 × 10³ K).', temperature20],
  ]],
  ['20:b', [
    ['Uses the inverse wavelength relationship TS/TR = λR/λS.', calculation(ratio20, [/ts\/tr=lambdar\/lambdas=/, /ts\/tr=(?:lambdar\/lambdas=)?1\.20?\/0\.80?=/])],
    ['Obtains 1.5, a dimensionless ratio.', ratio20],
  ]],
  ['22:a', [['Divides 15.0 mm by five and obtains 3.0 mm.', fringe22]]],
  ['22:b', [
    // Normalization cannot distinguish upper-case D from lower-case d. The
    // numerical substitution must establish the correct screen-distance divisor.
    ['Uses λ = sd/D.', calculation(wavelength22, fringeSubstitution)],
    ['Uses compatible length units for the fringe and slit separations.', calculation(wavelength22, fringeSubstitution)],
    ['Obtains 6.0 × 10⁻⁷ m (or 600 nm); accept consistent follow-through from part (a).', wavelength22],
  ]],
  ['24:a', [['Obtains 0.36 m from twice the adjacent-node separation.', wavelength24]]],
  ['24:b', [
    ['Uses f = v/λ with the inferred wavelength.', calculation(frequency24, [/f=54\/0\.36=/])],
    ['Obtains 150 Hz; accept consistent follow-through from part (a).', frequency24],
  ]],
  ['26:a', [
    ['Uses (1 − albedo)S/4 for a spherical target.', set3Calculation(irradiance26, [/\(1-0\.35\)\*?800\/4=/])],
    ['Obtains 130 W m⁻².', irradiance26],
  ]],
  ['26:b', [
    ['Uses albedo × S × πr² for the scattered power.', set3Calculation(power26, [/0\.35\*800\*(?:pi|π)(?:\*(?:2\.0?\^2|\(2\.0?\)\^2)|\(2\.0?\)\^2)=/, /0\.35\*800\*(?:pi|π)\*2\.0?\*2\.0?=/])],
    ['Obtains 3.52 × 10³ W (accept 3.5 × 10³ W).', power26],
  ]],
  ['28:a', [
    ['Uses p = NkBT/V with the stated particle count, constant and volume.', set3Calculation(pressure28a, [/(?:2\.00?e22\*1\.38e-23\*300|\(2\.00?e22\)\*?\(1\.38e-23\)\*?\(300\)|\(2\.00?e22\*1\.38e-23\*300\))\/0\.100?=/])],
    ['Obtains 828 Pa.', pressure28a],
  ]],
  ['28:b', [
    ['Uses p₂/p₁ = T₂/T₁ for fixed N and V.', set3Calculation(pressure28b, [/828\*450\/300=/])],
    ['Obtains 1242 Pa (accept 1.24 × 10³ Pa); consistent follow-through from (a).', pressure28b],
  ]],
  ['30:a', [
    ['Uses Vterminal = ε − Ir.', set3Calculation(voltage30, [/9\.0?-(?:2\.0?\*1\.5|\(2\.0?\)\*?\(1\.5\))=/])],
    ['Obtains 6.0 V.', voltage30],
  ]],
  ['30:b', [
    ['Uses Pexternal = IVterminal or I²Rexternal with Rexternal = 3.0 Ω.', set3Calculation(power30, [/2\.0?\*6\.0?=/, /2\.0?\^2\*3\.0?=/])],
    ['Obtains 12 W; consistent follow-through from (a).', power30],
  ]],
  ['32:a', [
    ['Uses T = 2π√(m/k) with the stated values.', set3Calculation(period32, [/2\*?(?:pi|π)\*?(?:sqrt|√)\(0\.20?\/80\)=/])],
    ['Obtains 0.314 s (accept 0.31 s).', period32],
  ]],
  ['32:b', [
    ['Uses T₂/T₁ = √(0.80/0.20) = 2 or direct mass-spring period calculation.', set3Calculation(frequency32, [/t2\/t1=(?:sqrt|√)\(0\.80?\/0\.20?\)=2(?=[,;]|$|\.(?!\d))/, /1\/\(2\*0\.314\)=/, /1\/\[2\*?(?:pi|π)\*?(?:sqrt|√)\(0\.80?\/80\)\]=/])],
    ['Obtains 1.59 Hz (accept 1.6 Hz); consistent follow-through from (a).', frequency32],
  ]],
  ['34:a', [
    ['Uses g = GM/R² with the correct squared radius.', set3Calculation(gravity34a, [/(?:6\.67e-11\*4\.0?e23|\(6\.67e-11\)\*?\(4\.0?e23\)|\(6\.67e-11\*4\.0?e23\))\/\(2\.0?e6\)\^2=/])],
    ['Obtains 6.67 N kg⁻¹ (accept 6.7 N kg⁻¹).', gravity34a],
  ]],
  ['34:b', [
    ['Uses r = R + h = 4.0 × 10⁶ m and inverse-square scaling or GM/r².', set3Calculation(gravity34b, [/6\.67\/4=/, /(?:6\.67e-11\*4\.0?e23|\(6\.67e-11\)\*?\(4\.0?e23\)|\(6\.67e-11\*4\.0?e23\))\/\(4\.0?e6\)\^2=/])],
    ['Obtains 1.67 N kg⁻¹ (accept 1.7 N kg⁻¹); consistent follow-through from (a).', gravity34b],
  ]],
  ['36:a', [
    ['Uses E = V/d with d = 0.015 m.', set3Calculation(field36, [/450\/0\.015=/])],
    ['Obtains 3.0 × 10⁴ V m⁻¹.', field36],
  ]],
  ['36:b', [
    ['Uses F = qE with q = 2.0 × 10⁻⁶ C.', set3Calculation(forceMagnitude36, [/(?:2\.0?e-6\*3\.0?e4|\(2\.0?e-6\)\*?\(3\.0?e4\))=/])],
    ['Obtains 0.060 N toward the negative plate; consistent follow-through from (a).', force36],
  ]],
]);

const responseForm = text => normalize(text).replace(/[.!]+$/, '').trim();
function assessmentContextMatches(question, saved) {
  return saved && JSON.stringify(saved.context) === JSON.stringify({number: question.number, prompt: question.prompt, parts: question.parts, answer: question.answer}) && JSON.stringify(saved.diagram) === JSON.stringify(question.diagram ?? null);
}
function completeAssessmentForm(part, text) {
  return responseForm(text) === responseForm(`${part.working} ${part.answer}`);
}
function assessmentPartial(number, label, index, text) {
  // Explicit mappings, rather than awarding points from answer keywords.
  if (number === 4 && label === 'b' && index === 0) return RULES.get('4:b')[1][1](text);
  if (number === 6 && label === 'c' && index === 0) return resultRule('(kj|j|kilojoules?|joules?)', (v,u) => /^k/.test(u) ? v*1000 : v, 1800, 20)(text);
  if (number === 18 && label === 'a' && index === 0) return energy18(text);
  if (number === 20 && label === 'b' && index === 1) return ratio20(text);
  if (number === 26 && label === 'a' && index === 1) {
    const match = text.match(/^(?:albedo\s*=\s*)?([0-9]+(?:\.[0-9]+)?)\s*[.!]*$/);
    return Boolean(match && Math.abs(Number(match[1]) - 0.35) <= 0.002);
  }
  if (number === 26 && label === 'b' && index === 2) return irradiance26(text);
  if (number === 30 && label === 'b' && index === 0) return power30(text);
  if (number === 32 && label === 'b' && index === 1) return resultRule('(s|seconds?)', v=>v, 0.628318, 0.006)(text);
  if (number === 32 && label === 'b' && index === 2) return frequency32(text);
  if (number === 34 && label === 'b' && index === 1) return gravity34b(text);
  if (number === 36 && label === 'b' && index === 1) return forceMagnitude36(text);
  return false;
}
function assessmentRules(question, part) {
  const saved = ASSESSMENT_MARKING[question.id];
  if (!assessmentContextMatches(question, saved)) return null;
  const legacyPart = question.number === 28 && part.label === 'c' ? 'b' : part.label;
  const legacy = RULES.get(`${question.number}:${legacyPart}`) || [];
  return part.marking_points.map((point, index) => [point.text, text => {
    if (completeAssessmentForm(part, text)) return true;
    if (responseForm(text) === responseForm(part.answer)) return saved.answer_only_criteria[part.label].includes(index);
    const prior = legacy.find(rule => rule[0] === point.text);
    return Boolean(prior?.[1](text) || assessmentPartial(question.number, part.label, index, text));
  }]);
}

/** Returns only supported rubric recognition, never a claim of complete grading. */
export function checkWritten(question, partLabel, text) {
  assertQuestion(question, 'written');
  if (typeof text !== 'string') throw new TypeError('Write an answer as text.');
  if (text.length > MAX_ANSWER_LENGTH) throw new RangeError(`Keep the answer within ${MAX_ANSWER_LENGTH} characters.`);
  const promptPart = question.parts?.find(part => part.label === partLabel);
  const answerPart = question.answer?.parts?.find(part => part.label === partLabel);
  if (!promptPart || !answerPart || !Array.isArray(answerPart.marking_points)) throw new TypeError('Choose an existing written question part.');
  const revised = question.content_revision === ASSESSMENT_REVISION;
  const rules = revised ? assessmentRules(question, answerPart) : !question.content_revision ? RULES.get(`${question.number}:${partLabel}`) : null;
  const value = normalize(text), attempted = value.length > 0;
  const points = answerPart.marking_points;
  const compatible = rules?.length === points.length && points.every((point, index) => point.text === rules[index][0] && point.marks === 1) &&
    points.reduce((sum, point) => sum + point.marks, 0) === promptPart.marks;
  const copiedPrompt = value === normalize(question.prompt) || value === normalize(promptPart.text) || value === normalize(`${question.prompt} ${promptPart.text}`);
  // A complete exact approved response can contain a necessary negation (e.g.
  // "No, the period is unchanged"). Arbitrary negations still fail closed.
  const exactApproved = revised && compatible && (completeAssessmentForm(answerPart, value) || responseForm(value) === responseForm(answerPart.answer));
  const blocked = copiedPrompt || (!exactApproved && (negative.test(value) || tentative.test(value)));
  const criteria = points.map((point, index) => {
    const recognized = Boolean(attempted && compatible && !blocked && rules[index][1](value));
    let reason = recognized ? 'Matched a saved rubric rule.' : 'Not automatically verified; this point may still be correct.';
    if (!attempted) reason = 'No answer entered.';
    else if (!compatible) reason = 'This rubric revision needs review before automatic checking.';
    else if (copiedPrompt) reason = 'The question text does not establish an answer.';
    else if (blocked) reason = 'Negation or uncertainty is outside the supported automatic rules.';
    else if (rules[index][1] === neverAutomatic) reason = 'Method or follow-through mark: the automatic checker cannot verify this working.';
    return {index, rubric: point.text, marks: point.marks, status: recognized ? 'recognized' : 'not_yet_verified', reason};
  });
  return {
    version: MARKING_VERSION, status: attempted ? 'estimated' : 'unanswered', attempted,
    estimated_awarded: criteria.filter(criterion => criterion.status === 'recognized').reduce((sum, criterion) => sum + criterion.marks, 0),
    // Even a fully recognised phrasing remains a practice estimate, rather
    // than certified interpretation of arbitrary student prose.
    max_marks: promptPart.marks, needs_review: attempted,
    criteria, notice: PRACTICE_NOTICE,
  };
}
