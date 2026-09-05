/* Owner-authorised FRA22 v1 canonical source. Generated from .codex-fra22-handoff/FRA22_CANONICAL_SPEC.ts. */
(function () {
  "use strict";
  const module = { exports: {} };
  const exports = module.exports;
"use strict";
/**
 * FRA22_CANONICAL_SPEC.ts
 *
 * Architecture-neutral Codex implementation handoff for:
 * FRA-22 — Subtract Fractions with Different Denominators
 *
 * Owner-approved visual and pedagogical source:
 *   Revily_FRA-22_Storyboard_v1.pdf
 *
 * Engineering contract:
 *   FRA22_CODEX_IMPLEMENTATION_PROMPT.md
 *
 * HARD RUNTIME-COPY RULE
 * ----------------------
 * Ryan audio and Ryan captions may resolve only:
 *
 *   FRA22_RUNTIME_COPY[utteranceId].text
 *
 * The audio and caption must use the same utterance ID and exact text. Nothing
 * else in this file is speakable unless an explicit runtime utterance ID is
 * attached to the active state. Question prompts, options, hints, stage labels,
 * author notes, route names, assessment intents, QA prose and implementation
 * directions must never be sent to Ryan TTS or Ryan caption rendering.
 *
 * This file is not production UI code. Codex must map it onto the existing
 * Revily lesson shell, store, TTS/caption system, cue timeline, evidence model,
 * hint system, answer-lock mechanism, persistence and responsive components.
 * Do not create a parallel FRA application or duplicate the shared engine.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRA22 = exports.FRA22_SOURCE_COMPLETIONS = exports.FRA22_REPAIRS = exports.FRA22_QUESTIONS = exports.FRA22_VISIBLE_UI_COPY = exports.FRA22_TIMELINE_CUES = exports.FRA22_RUNTIME_COPY = exports.FRA22_MATH = exports.FRA22_CONTENT_VERSION = void 0;
exports.gcd = gcd;
exports.lcm = lcm;
exports.simplifyFraction = simplifyFraction;
exports.fractionsEquivalent = fractionsEquivalent;
exports.fractionKey = fractionKey;
exports.createSubtractionMath = createSubtractionMath;
exports.getQuestion = getQuestion;
exports.getQuestionFreshnessSignature = getQuestionFreshnessSignature;
exports.isQuestionFreshForJourney = isQuestionFreshForJourney;
exports.evaluateFractionAnswer = evaluateFractionAnswer;
exports.evaluateQuestionAnswer = evaluateQuestionAnswer;
exports.classifyStructuredWorking = classifyStructuredWorking;
exports.shouldSkipF1 = shouldSkipF1;
exports.confirmationsRequiredAfterIndependent = confirmationsRequiredAfterIndependent;
exports.decideFinalRoute = decideFinalRoute;
exports.selectUnusedRecoveryQuestions = selectUnusedRecoveryQuestions;
exports.validateFRA22Spec = validateFRA22Spec;
exports.FRA22_CONTENT_VERSION = "fra22-unlike-denominator-subtraction-v1";
function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const remainder = x % y;
        x = y;
        y = remainder;
    }
    return x;
}
function lcm(a, b) {
    if (a === 0 || b === 0)
        return 0;
    return Math.abs((a / gcd(a, b)) * b);
}
function simplifyFraction(value) {
    if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
        throw new Error("Fractions must use integer numerator and denominator values.");
    }
    if (value.denominator === 0) {
        throw new Error("A fraction denominator cannot be zero.");
    }
    const sign = value.denominator < 0 ? -1 : 1;
    const numerator = value.numerator * sign;
    const denominator = Math.abs(value.denominator);
    const factor = gcd(numerator, denominator);
    return {
        numerator: numerator / factor,
        denominator: denominator / factor,
    };
}
function fractionsEquivalent(left, right) {
    if (left.denominator === 0 || right.denominator === 0)
        return false;
    return left.numerator * right.denominator === right.numerator * left.denominator;
}
function fractionKey(value) {
    return `${value.numerator}/${value.denominator}`;
}
function createSubtractionMath(left, right, commonDenominator) {
    if (!Number.isInteger(left.numerator) ||
        !Number.isInteger(left.denominator) ||
        !Number.isInteger(right.numerator) ||
        !Number.isInteger(right.denominator) ||
        !Number.isInteger(commonDenominator)) {
        throw new Error("FRA22 authored values must be integers.");
    }
    if (left.denominator <= 0 ||
        right.denominator <= 0 ||
        commonDenominator <= 0) {
        throw new Error("FRA22 denominators must be positive.");
    }
    if (commonDenominator % left.denominator !== 0 ||
        commonDenominator % right.denominator !== 0) {
        throw new Error(`${commonDenominator} is not a valid common denominator for ${fractionKey(left)} and ${fractionKey(right)}.`);
    }
    const leftScaleFactor = commonDenominator / left.denominator;
    const rightScaleFactor = commonDenominator / right.denominator;
    const leftEquivalent = {
        numerator: left.numerator * leftScaleFactor,
        denominator: commonDenominator,
    };
    const rightEquivalent = {
        numerator: right.numerator * rightScaleFactor,
        denominator: commonDenominator,
    };
    const rawDifference = {
        numerator: leftEquivalent.numerator - rightEquivalent.numerator,
        denominator: commonDenominator,
    };
    if (rawDifference.numerator <= 0) {
        throw new Error(`FRA22 pilot items require a positive difference: ${fractionKey(left)} - ${fractionKey(right)}.`);
    }
    return {
        left,
        right,
        commonDenominator,
        leftScaleFactor,
        rightScaleFactor,
        leftEquivalent,
        rightEquivalent,
        rawDifference,
        simplestEquivalent: simplifyFraction(rawDifference),
        canonicalExpression: `${fractionKey(left)} - ${fractionKey(right)}`,
        canonicalWorking: [
            `${fractionKey(left)} = ${fractionKey(leftEquivalent)}`,
            `${fractionKey(right)} = ${fractionKey(rightEquivalent)}`,
            `${fractionKey(leftEquivalent)} - ${fractionKey(rightEquivalent)} = ${fractionKey(rawDifference)}`,
        ],
    };
}
exports.FRA22_MATH = {
    HOOK_12: createSubtractionMath({ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 4 }, 12),
    HOOK_24: createSubtractionMath({ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 4 }, 24),
    G1: createSubtractionMath({ numerator: 5, denominator: 8 }, { numerator: 1, denominator: 6 }, 24),
    G2: createSubtractionMath({ numerator: 3, denominator: 5 }, { numerator: 1, denominator: 4 }, 20),
    F1: createSubtractionMath({ numerator: 7, denominator: 9 }, { numerator: 1, denominator: 6 }, 18),
    F2: createSubtractionMath({ numerator: 7, denominator: 8 }, { numerator: 2, denominator: 3 }, 24),
    I1: createSubtractionMath({ numerator: 5, denominator: 6 }, { numerator: 2, denominator: 5 }, 30),
    I2: createSubtractionMath({ numerator: 7, denominator: 8 }, { numerator: 1, denominator: 6 }, 24),
    C_DIRECT: createSubtractionMath({ numerator: 3, denominator: 4 }, { numerator: 2, denominator: 5 }, 20),
    C_CONTEXT: createSubtractionMath({ numerator: 4, denominator: 5 }, { numerator: 1, denominator: 6 }, 30),
    C_METHOD: createSubtractionMath({ numerator: 5, denominator: 8 }, { numerator: 1, denominator: 3 }, 24),
    M1: createSubtractionMath({ numerator: 4, denominator: 5 }, { numerator: 1, denominator: 6 }, 30),
    M2: createSubtractionMath({ numerator: 5, denominator: 6 }, { numerator: 1, denominator: 9 }, 18),
    M3: createSubtractionMath({ numerator: 7, denominator: 10 }, { numerator: 1, denominator: 6 }, 30),
    M4: createSubtractionMath({ numerator: 7, denominator: 8 }, { numerator: 1, denominator: 3 }, 24),
    M5: createSubtractionMath({ numerator: 7, denominator: 10 }, { numerator: 1, denominator: 4 }, 20),
    R_DIRECT_EXAMPLE: createSubtractionMath({ numerator: 2, denominator: 3 }, { numerator: 1, denominator: 4 }, 12),
    R_DIRECT_SUPPORTED: createSubtractionMath({ numerator: 3, denominator: 4 }, { numerator: 1, denominator: 6 }, 12),
    R_DIRECT_FRESH: createSubtractionMath({ numerator: 4, denominator: 5 }, { numerator: 1, denominator: 6 }, 30),
    R_SCALE_FRESH: createSubtractionMath({ numerator: 3, denominator: 8 }, { numerator: 1, denominator: 6 }, 24),
    R_COMMON_SUPPORTED: createSubtractionMath({ numerator: 7, denominator: 10 }, { numerator: 1, denominator: 6 }, 30),
    R_COMMON_FRESH: createSubtractionMath({ numerator: 5, denominator: 9 }, { numerator: 1, denominator: 6 }, 18),
    R_ORDER_SUPPORTED: createSubtractionMath({ numerator: 7, denominator: 10 }, { numerator: 1, denominator: 4 }, 20),
    R_ORDER_FRESH: createSubtractionMath({ numerator: 3, denominator: 4 }, { numerator: 2, denominator: 5 }, 20),
    R_DEN_KEEP_FRESH: createSubtractionMath({ numerator: 4, denominator: 5 }, { numerator: 1, denominator: 3 }, 15),
};
exports.FRA22_RUNTIME_COPY = {
    "HOOK.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "establish_battery_start_state",
        text: "This battery starts at five sixths charge.",
        captionSource: "same_as_audio",
    },
    "HOOK.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "prompt",
        communicationGoal: "create_subtraction_need_from_battery_use",
        text: "A render uses one quarter of a full battery. What fraction should be left?",
        captionSource: "same_as_audio",
    },
    "HOOK.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "expose_impossible_direct_rule",
        text: "Those fractions use different-sized chunks. If I subtract top and bottom, I get four halves - two whole batteries.",
        captionSource: "same_as_audio",
    },
    "HOOK.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "state_need_to_match_piece_size",
        text: "Removing charge cannot leave more than we started with. Before we subtract, the chunks have to match.",
        captionSource: "same_as_audio",
    },
    "T1.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "identify_sixth_piece_size",
        text: "Look at the sixths. Each piece is one sixth of the battery.",
        captionSource: "same_as_audio",
    },
    "T1.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "identify_quarter_piece_size",
        text: "Now look at the quarters. Each piece is one quarter of the same battery.",
        captionSource: "same_as_audio",
    },
    "T1.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "reject_subtraction_of_unlike_piece_counts",
        text: "Five minus one would mix counts of different-sized pieces. We need one shared piece size first.",
        captionSource: "same_as_audio",
    },
    "T2.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "activate_common_multiple_prerequisite",
        text: "Use the common-multiple skill you already know.",
        captionSource: "same_as_audio",
    },
    "T2.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "find_first_shared_multiple",
        text: "Six, twelve, eighteen... and four, eight, twelve... meet at twelve.",
        captionSource: "same_as_audio",
    },
    "T2.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "name_valid_efficient_common_denominator",
        text: "Twelve is a valid common denominator, and it is the quickest one here.",
        captionSource: "same_as_audio",
    },
    "T3.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "rename_five_sixths_as_twelfths",
        text: "Rename five sixths as twelfths. Each sixth splits into two equal pieces, so five sixths becomes ten twelfths.",
        captionSource: "same_as_audio",
    },
    "T3.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "rename_one_quarter_as_twelfths",
        text: "Rename one quarter in the same way. Each quarter splits into three equal pieces, so one quarter becomes three twelfths.",
        captionSource: "same_as_audio",
    },
    "T3.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "state_equivalent_scaling_invariant",
        text: "Each rewrite uses the same factor on the top and bottom.",
        captionSource: "same_as_audio",
    },
    "T4.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "preserve_original_subtraction_order",
        text: "Now the pieces match, so subtract the counts in the original order.",
        captionSource: "same_as_audio",
    },
    "T4.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "calculate_seven_twelfths",
        text: "Ten twelfths minus three twelfths leaves seven twelfths.",
        captionSource: "same_as_audio",
    },
    "T4.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "keep_common_denominator_as_piece_size",
        text: "The denominator stays twelve because the piece size is still twelfths.",
        captionSource: "same_as_audio",
    },
    "T5.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "prompt",
        communicationGoal: "consider_non_lowest_common_denominator",
        text: "Could we use twenty-fourths instead? Yes.",
        captionSource: "same_as_audio",
    },
    "T5.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "rename_both_fractions_as_twenty_fourths",
        text: "Five sixths is twenty twenty-fourths, and one quarter is six twenty-fourths.",
        captionSource: "same_as_audio",
    },
    "T5.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "show_equivalent_difference_route",
        text: "Twenty minus six leaves fourteen twenty-fourths - the same exact amount as seven twelfths.",
        captionSource: "same_as_audio",
    },
    "T5.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "state_lcd_efficiency_not_requirement",
        text: "The lowest common denominator is often quicker, but it is not compulsory.",
        captionSource: "same_as_audio",
    },
    "HANDOFF.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "compress_repeatable_method",
        text: "You have the route now: match the parts, rename both fractions, then subtract in order.",
        captionSource: "same_as_audio",
    },
    "HANDOFF.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "announce_two_guided_questions_then_fade",
        text: "I will stay with you for two questions. After that, the support starts to fade.",
        captionSource: "same_as_audio",
    },
    "G1.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "guide_common_denominator_choice_without_revealing_answer",
        text: "Check which choice is a multiple of both eight and six.",
        captionSource: "same_as_audio",
    },
    "G1.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_twenty_four_valid_for_eighths_and_sixths",
        text: "Yes. Twenty-four can be split into eighths and sixths exactly.",
        captionSource: "same_as_audio",
    },
    "G1.INCORRECT.12": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "explain_why_twelve_fails_eighths",
        text: "Twelve works for sixths, but eight does not divide into twelve.",
        captionSource: "same_as_audio",
    },
    "G1.INCORRECT.18": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "explain_why_eighteen_fails_eighths",
        text: "Eighteen works for sixths, but not for eighths.",
        captionSource: "same_as_audio",
    },
    "G1.INCORRECT.30": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "explain_why_thirty_fails_eighths",
        text: "Thirty works for sixths, but not for eighths.",
        captionSource: "same_as_audio",
    },
    "G1.ESCALATE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_continued_multiple_lists",
        text: "Continue the eight-times and six-times lists until they meet.",
        captionSource: "same_as_audio",
    },
    "G2.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "guide_equivalent_scaling_and_ordered_subtraction",
        text: "Use the same factor on top and bottom for each fraction. Then subtract the new numerators in the order shown.",
        captionSource: "same_as_audio",
    },
    "G2.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_all_three_guided_fields",
        text: "Good. Three fifths is twelve twentieths, one quarter is five twentieths, and twelve minus five leaves seven twentieths.",
        captionSource: "same_as_audio",
    },
    "G2.INCORRECT.LEFT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "repair_left_scale_field_only",
        text: "Check the factor from five to twenty. Use that same factor on three.",
        captionSource: "same_as_audio",
    },
    "G2.INCORRECT.RIGHT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "repair_right_scale_field_only",
        text: "Check the factor from four to twenty. Use that same factor on one.",
        captionSource: "same_as_audio",
    },
    "G2.INCORRECT.ADD": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "redirect_addition_result",
        text: "The equivalent fractions are right, but this is subtraction. Use twelve minus five.",
        captionSource: "same_as_audio",
    },
    "G2.INCORRECT.ORDER": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "restore_original_numerator_order",
        text: "Keep the original order: twelve minus five.",
        captionSource: "same_as_audio",
    },
    "G2.INCORRECT.DEN": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "keep_twentieths_denominator",
        text: "The pieces are already twentieths. Keep twenty.",
        captionSource: "same_as_audio",
    },
    "INDEPENDENT.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "hand_over_independent_control_and_explain_optional_hint",
        text: "Now you take over. Work it out first; the hint is there only if you decide you need it.",
        captionSource: "same_as_audio",
    },
    "I1.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "request_independent_exact_difference",
        text: "Calculate it. The hint is there only if you decide you need it.",
        captionSource: "same_as_audio",
    },
    "FINAL.INTRO": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "introduce_five_unsupported_final_items",
        text: "These last five are yours. No hints this time. Do each question first, then I will show you the working so you can check your thinking.",
        captionSource: "same_as_audio",
    },
    "FINAL.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "acknowledge_correct_then_reveal_working",
        text: "Good - that is right. Here is the working so you can check.",
        captionSource: "same_as_audio",
    },
    "FINAL.INCORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "acknowledge_incorrect_then_reveal_working",
        text: "Not quite. Here is the working - compare it with what you did.",
        captionSource: "same_as_audio",
    },
    "R-DIRECT.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "reject_subtraction_of_unlike_piece_counts",
        text: "Those two numerators are counting different-sized pieces, so subtracting them now does not describe the picture.",
        captionSource: "same_as_audio",
    },
    "R-DIRECT.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "require_common_denominator_before_subtraction",
        text: "Rename both fractions with one common denominator first.",
        captionSource: "same_as_audio",
    },
    "R-DIRECT.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "model_two_thirds_minus_one_quarter",
        text: "For two thirds minus one quarter, twelfths make the pieces match: eight twelfths minus three twelfths is five twelfths.",
        captionSource: "same_as_audio",
    },
    "R-SCALE.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "reject_one_field_fraction_change",
        text: "Changing only one number does not make an equivalent fraction.",
        captionSource: "same_as_audio",
    },
    "R-SCALE.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "apply_times_four_to_both_fields",
        text: "Five to twenty is times four, so three must also be times four: three fifths is twelve twentieths.",
        captionSource: "same_as_audio",
    },
    "R-SCALE.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "state_same_factor_invariant",
        text: "Use one factor on both the numerator and denominator, every time.",
        captionSource: "same_as_audio",
    },
    "R-COMMON.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "define_valid_common_denominator",
        text: "A common denominator must be a multiple of both starting denominators.",
        captionSource: "same_as_audio",
    },
    "R-COMMON.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "show_eighteen_fails_quarters",
        text: "Eighteen fits sixths, but quarters do not fit exactly into eighteen.",
        captionSource: "same_as_audio",
    },
    "R-COMMON.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "continue_search_until_both_fit",
        text: "Keep searching until both fractions can use the same denominator.",
        captionSource: "same_as_audio",
    },
    "R-ORDER.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "state_subtraction_direction",
        text: "Subtraction has a direction. Keep the order the question gives.",
        captionSource: "same_as_audio",
    },
    "R-ORDER.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "map_start_minus_removed_to_converted_numerators",
        text: "Start amount minus removed amount means the first converted numerator minus the second.",
        captionSource: "same_as_audio",
    },
    "R-ORDER.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "reject_order_swap_for_convenience",
        text: "Do not swap them just to make the numbers feel easier.",
        captionSource: "same_as_audio",
    },
    "R-DEN-KEEP.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "fix_common_part_size_after_conversion",
        text: "Once the denominators match, the part size is fixed.",
        captionSource: "same_as_audio",
    },
    "R-DEN-KEEP.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "model_fifteen_eighteenths_minus_four_eighteenths",
        text: "Fifteen eighteenths minus four eighteenths leaves eleven eighteenths.",
        captionSource: "same_as_audio",
    },
    "R-DEN-KEEP.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "state_subtract_numerators_keep_denominator",
        text: "Subtract the numerators. Keep the common denominator.",
        captionSource: "same_as_audio",
    },
    "ARITHMETIC.CUE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "preserve_correct_structure_and_recheck_number_fact",
        text: "Your fraction structure is right. Recheck the subtraction fact.",
        captionSource: "same_as_audio",
    },
    "COMPLETE.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "completion",
        communicationGoal: "summarise_fra22_current_session_completion",
        text: "Nice work. You can now make unlike fractions use the same-sized parts, then subtract in the right order. That is FRA-22 done.",
        captionSource: "same_as_audio",
    },
};
exports.FRA22_TIMELINE_CUES = [
    {
        id: "HOOK.CUE.START",
        utteranceId: "HOOK.1",
        anchorText: "five sixths",
        authorOnlyAction: "Light exactly five of six equal battery cells.",
        reducedMotionState: "Show a static six-cell battery with exactly five cells selected.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "HOOK.CUE.REMOVE",
        utteranceId: "HOOK.2",
        anchorText: "one quarter",
        authorOnlyAction: "Reveal a gold bracket marking one quarter of the full battery width.",
        reducedMotionState: "Show the quarter-width bracket in its final position.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "HOOK.CUE.WRONG",
        utteranceId: "HOOK.3",
        anchorText: "four halves",
        authorOnlyAction: "Reveal (5 - 1) / (6 - 4) = 4/2 and then two whole-battery outlines.",
        reducedMotionState: "Show the full wrong equation and two-battery result as a static state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "HOOK.CUE.CROSS",
        utteranceId: "HOOK.4",
        anchorText: "cannot",
        authorOnlyAction: "Place a red cross on the impossible larger result; keep the original start state visible.",
        reducedMotionState: "Show the crossed wrong result without motion.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T1.CUE.SIXTHS",
        utteranceId: "T1.1",
        anchorText: "sixths",
        authorOnlyAction: "Glow only the six equal partition cells of the first battery bar.",
        reducedMotionState: "Emphasise all six cells with a static outline.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T1.CUE.QUARTERS",
        utteranceId: "T1.2",
        anchorText: "quarters",
        authorOnlyAction: "Glow only the four equal partition cells of the second battery bar.",
        reducedMotionState: "Emphasise all four cells with a static outline.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T1.CUE.SHARED",
        utteranceId: "T1.3",
        anchorText: "shared piece size",
        authorOnlyAction: "Show a shared-piece-size target between two equal-length bars; reveal no denominator value yet.",
        reducedMotionState: "Show the shared-piece-size target as a static label.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T2.CUE.MULTIPLES",
        utteranceId: "T2.2",
        anchorText: "Six, twelve, eighteen",
        authorOnlyAction: "Reveal 6, 12 and 18 on the multiples-of-six track in spoken order.",
        reducedMotionState: "Show the three named nodes simultaneously after the anchor.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T2.CUE.MEET",
        utteranceId: "T2.2",
        anchorText: "meet at twelve",
        authorOnlyAction: "Highlight 12 on both tracks and connect the aligned nodes.",
        reducedMotionState: "Show both 12 nodes highlighted and connected.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T2.CUE.LABEL",
        utteranceId: "T2.3",
        anchorText: "common denominator",
        authorOnlyAction: "Reveal the COMMON DENOMINATOR label beside 12.",
        reducedMotionState: "Show the label and highlighted 12 as one static state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T3.CUE.SIXTHS_SPLIT",
        utteranceId: "T3.1",
        anchorText: "splits into two",
        authorOnlyAction: "Subdivide each sixth into two equal twelfths and update 5/6 to 10/12 from the same data object.",
        reducedMotionState: "Replace the six-part state with the mathematically equivalent twelve-part state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T3.CUE.QUARTERS_SPLIT",
        utteranceId: "T3.2",
        anchorText: "splits into three",
        authorOnlyAction: "Subdivide each quarter into three equal twelfths and update 1/4 to 3/12 from the same data object.",
        reducedMotionState: "Replace the four-part state with the mathematically equivalent twelve-part state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T3.CUE.FACTORS",
        utteranceId: "T3.3",
        anchorText: "same factor",
        authorOnlyAction: "Emphasise x2 on both fields of 5/6 and x3 on both fields of 1/4.",
        reducedMotionState: "Show both paired factors with a static linked highlight.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T4.CUE.ORDER",
        utteranceId: "T4.1",
        anchorText: "original order",
        authorOnlyAction: "Place a start marker under 10/12 and a direction arrow toward the removed 3/12.",
        reducedMotionState: "Show the start marker and direction arrow already in place.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T4.CUE.REMOVE",
        utteranceId: "T4.2",
        anchorText: "minus three",
        authorOnlyAction: "Hatch and dim exactly three of the ten selected twelfth-sized cells.",
        reducedMotionState: "Show three removed cells hatched and the seven remaining cells selected.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T4.CUE.RESULT",
        utteranceId: "T4.2",
        anchorText: "seven twelfths",
        authorOnlyAction: "Change only the numerator 10 to 7; keep denominator 12 fixed.",
        reducedMotionState: "Show the final 7/12 state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T4.CUE.DENOMINATOR",
        utteranceId: "T4.3",
        anchorText: "stays twelve",
        authorOnlyAction: "Hold the denominator 12 stationary and label it as the unchanged piece size.",
        reducedMotionState: "Show 12 with a static keep-piece-size annotation.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T5.CUE.ALTERNATE",
        utteranceId: "T5.1",
        anchorText: "twenty-fourths",
        authorOnlyAction: "Reveal the alternate twenty-fourths route beside, not on top of, the twelfths route.",
        reducedMotionState: "Show the two routes side by side.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "T5.CUE.SAME_AMOUNT",
        utteranceId: "T5.3",
        anchorText: "same exact amount",
        authorOnlyAction: "Link 14/24 and 7/12 with a same-amount connector; do not call 24 the required denominator.",
        reducedMotionState: "Show a static equivalence connector between 14/24 and 7/12.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "R-DIRECT.CUE.MATCH",
        utteranceId: "R-DIRECT.3",
        anchorText: "twelfths make the pieces match",
        authorOnlyAction: "Transform the 2/3 and 1/4 bars into aligned twelfths, then show 8/12 - 3/12 = 5/12.",
        reducedMotionState: "Show the aligned twelfths and completed equation in a static state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "R-SCALE.CUE.FACTOR",
        utteranceId: "R-SCALE.2",
        anchorText: "times four",
        authorOnlyAction: "Link the x4 denominator factor to the same x4 numerator factor and replace 3/20 with 12/20.",
        reducedMotionState: "Show x4 on both fields and the corrected 12/20 state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "R-COMMON.CUE.FAIL",
        utteranceId: "R-COMMON.2",
        anchorText: "do not fit exactly",
        authorOnlyAction: "Mark 18 as fitting sixths but not quarters; keep valid 12 and 24 nodes available.",
        reducedMotionState: "Show 18 with a one-sided fit indicator and 12/24 as valid shared nodes.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "R-ORDER.CUE.DIRECTION",
        utteranceId: "R-ORDER.2",
        anchorText: "first converted numerator minus the second",
        authorOnlyAction: "Show 14/20 - 5/20 with a start-to-removed direction arrow and 14 - 5 beneath.",
        reducedMotionState: "Show the complete ordered subtraction state.",
        mustNotOccurBeforeAnchor: true,
    },
    {
        id: "R-DEN-KEEP.CUE.FIXED",
        utteranceId: "R-DEN-KEEP.1",
        anchorText: "part size is fixed",
        authorOnlyAction: "Lock both denominator 18 labels while the numerator count changes from 15 to 11.",
        reducedMotionState: "Show the fixed 18 denominators and final 11/18 state.",
        mustNotOccurBeforeAnchor: true,
    },
];
const POLICY_GUIDED = {
    hintPolicy: "guided",
    hintStartsCollapsed: false,
    solutionPolicy: "after_resolved_response",
    scored: true,
    answerLocksOnSubmit: false,
    requiresFreshNoHintConfirmationIfHintUsed: false,
    countsAsIndependentEvidence: false,
    countsAsFreshEvidence: false,
    acceptExactEquivalentValue: false,
    formSensitive: true,
};
const POLICY_FADED_OPTIONAL_FORM = {
    hintPolicy: "optional",
    hintStartsCollapsed: true,
    solutionPolicy: "after_resolved_response",
    scored: true,
    answerLocksOnSubmit: true,
    requiresFreshNoHintConfirmationIfHintUsed: true,
    countsAsIndependentEvidence: true,
    countsAsFreshEvidence: false,
    acceptExactEquivalentValue: false,
    formSensitive: true,
};
const POLICY_FADED_OPTIONAL_SELECT = {
    ...POLICY_FADED_OPTIONAL_FORM,
    formSensitive: false,
};
const POLICY_INDEPENDENT_VALUE = {
    hintPolicy: "optional",
    hintStartsCollapsed: true,
    solutionPolicy: "after_resolved_response",
    scored: true,
    answerLocksOnSubmit: true,
    requiresFreshNoHintConfirmationIfHintUsed: true,
    countsAsIndependentEvidence: true,
    countsAsFreshEvidence: false,
    acceptExactEquivalentValue: true,
    formSensitive: false,
};
const POLICY_CONFIRMATION_VALUE = {
    hintPolicy: "none",
    hintStartsCollapsed: true,
    solutionPolicy: "after_resolved_response",
    scored: true,
    answerLocksOnSubmit: true,
    requiresFreshNoHintConfirmationIfHintUsed: false,
    countsAsIndependentEvidence: true,
    countsAsFreshEvidence: true,
    acceptExactEquivalentValue: true,
    formSensitive: false,
};
const POLICY_CONFIRMATION_SELECT = {
    ...POLICY_CONFIRMATION_VALUE,
    acceptExactEquivalentValue: false,
};
const POLICY_FINAL_VALUE = {
    hintPolicy: "none",
    hintStartsCollapsed: true,
    solutionPolicy: "after_locked_submit",
    scored: true,
    answerLocksOnSubmit: true,
    requiresFreshNoHintConfirmationIfHintUsed: false,
    countsAsIndependentEvidence: true,
    countsAsFreshEvidence: true,
    acceptExactEquivalentValue: true,
    formSensitive: false,
};
const POLICY_FINAL_FORM = {
    ...POLICY_FINAL_VALUE,
    acceptExactEquivalentValue: false,
    formSensitive: true,
};
const POLICY_FINAL_SELECT = {
    ...POLICY_FINAL_VALUE,
    acceptExactEquivalentValue: false,
};
const POLICY_REPAIR_SUPPORTED = {
    hintPolicy: "guided",
    hintStartsCollapsed: false,
    solutionPolicy: "after_resolved_response",
    scored: true,
    answerLocksOnSubmit: false,
    requiresFreshNoHintConfirmationIfHintUsed: false,
    countsAsIndependentEvidence: false,
    countsAsFreshEvidence: false,
    acceptExactEquivalentValue: false,
    formSensitive: true,
};
const POLICY_REPAIR_FRESH = {
    ...POLICY_CONFIRMATION_VALUE,
};
exports.FRA22_VISIBLE_UI_COPY = {
    stageLabels: {
        opening: "Learn the idea",
        guided: "Try it with me",
        fadedSupport: "Your turn - support nearby",
        faded: "Your turn",
        independent: "Now you take over",
        final: "Final check",
    },
    controls: {
        showHook: "Show me how the pieces match",
        askForHint: "Ask for a hint",
        checkAnswer: "Check answer",
        submit: "Submit",
        next: "Next",
    },
    runtimeBoundary: "These visible UI strings are not automatically Ryan speech. Only linked FRA22_RUNTIME_COPY utterance IDs are speakable.",
};
exports.FRA22_QUESTIONS = [
    {
        id: "G1",
        stage: "guided",
        family: "STEP",
        authorOnlyAssessmentIntent: "guided_common_denominator_choice",
        sourcePages: [14, 15],
        boundaryRole: "target_skill",
        stageLabel: "Try it with me",
        prompt: "Choose a common denominator",
        supportingVisibleText: [
            "5/8 - 1/6",
            "Which denominator can both fractions use?",
        ],
        math: exports.FRA22_MATH.G1,
        visual: {
            kind: "symbolic_common_denominator_choice",
            showMultipleListsBeforeSubmit: false,
            showConversionFactorsBeforeSubmit: false,
        },
        response: {
            kind: "single_choice",
            submitLabel: "Check answer",
            retryAllowedAfterFeedback: true,
        },
        options: [
            {
                id: "12",
                visibleText: "12",
                isCorrect: false,
                explicitErrorFamily: "COMMON",
                classificationConfidence: "provisional",
                authorOnlyRationale: "Works for sixths but not eighths; one choice alone may be a fact slip.",
            },
            {
                id: "18",
                visibleText: "18",
                isCorrect: false,
                explicitErrorFamily: "COMMON",
                classificationConfidence: "provisional",
                authorOnlyRationale: "Works for sixths but not eighths.",
            },
            {
                id: "24",
                visibleText: "24",
                isCorrect: true,
            },
            {
                id: "30",
                visibleText: "30",
                isCorrect: false,
                explicitErrorFamily: "COMMON",
                classificationConfidence: "provisional",
                authorOnlyRationale: "Works for sixths but not eighths.",
            },
        ],
        answer: { kind: "option", optionId: "24" },
        ryanBeforeSubmitUtteranceIds: ["G1.PRE"],
        feedback: {
            correctUtteranceIds: ["G1.CORRECT"],
            incorrectUtteranceByOptionId: {
                "12": ["G1.INCORRECT.12"],
                "18": ["G1.INCORRECT.18"],
                "30": ["G1.INCORRECT.30"],
            },
            firstMissEscalationUtteranceIds: ["G1.ESCALATE"],
            repeatedMissRoute: "R-COMMON",
            playExactlyOneOutcomeBranch: true,
            doNotAutoSelectCorrectOption: true,
        },
        accessibleDescription: "The expression five eighths minus one sixth is shown with answer choices 12, 18, 24 and 30. No multiple list or conversion is shown before submission.",
        policy: POLICY_GUIDED,
        canonicalSignature: "G1|5/8-1/6|choose-common-denominator|12,18,24,30",
        recoveryEligible: false,
        authorOnlyNotes: [
            "A single wrong denominator choice is provisional evidence; repeat or explicit working is required before classifying COMMON for repair.",
        ],
    },
    {
        id: "G2",
        stage: "guided",
        family: "STEP",
        authorOnlyAssessmentIntent: "guided_equivalent_scaling_and_ordered_subtraction",
        sourcePages: [16, 17],
        boundaryRole: "target_skill",
        stageLabel: "Try it with me",
        prompt: "Complete the common-denominator working",
        supportingVisibleText: ["Use denominator 20."],
        math: exports.FRA22_MATH.G2,
        visual: {
            kind: "form_sensitive_fraction_working",
            fixedDenominator: 20,
            editableFields: [
                "leftEquivalentNumerator",
                "rightEquivalentNumerator",
                "resultNumerator",
            ],
            doNotAutoFillUnansweredFields: true,
        },
        response: {
            kind: "integer_fields",
            submitLabel: "Check answer",
            fieldOrder: [
                "leftEquivalentNumerator",
                "rightEquivalentNumerator",
                "resultNumerator",
            ],
            fixedDenominator: 20,
        },
        answer: {
            kind: "fields",
            fields: {
                leftEquivalentNumerator: 12,
                rightEquivalentNumerator: 5,
                resultNumerator: 7,
            },
            fixedDenominator: 20,
        },
        ryanBeforeSubmitUtteranceIds: ["G2.PRE"],
        feedback: {
            correctUtteranceIds: ["G2.CORRECT"],
            leftRewriteWrongUtteranceIds: ["G2.INCORRECT.LEFT"],
            rightRewriteWrongUtteranceIds: ["G2.INCORRECT.RIGHT"],
            resultIs17UtteranceIds: ["G2.INCORRECT.ADD"],
            reversedOrNegativeResultUtteranceIds: ["G2.INCORRECT.ORDER"],
            changedDenominatorUtteranceIds: ["G2.INCORRECT.DEN"],
            focusOnlyFailedField: true,
            playExactlyOneOutcomeBranch: true,
            repeatedOrderRoute: "R-ORDER",
            repeatedDenominatorRoute: "R-DEN-KEEP",
        },
        workedCheck: {
            visibleSteps: exports.FRA22_MATH.G2.canonicalWorking,
        },
        accessibleDescription: "A form-sensitive working layout shows three fifths equals a missing numerator over 20, one quarter equals a missing numerator over 20, and a missing result numerator over 20. Only the three numerator fields are editable.",
        policy: POLICY_GUIDED,
        canonicalSignature: "G2|3/5-1/4|cd20|fields12,5,7",
        recoveryEligible: false,
    },
    {
        id: "F1",
        stage: "faded",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "faded_complete_three_form_sensitive_fields",
        sourcePages: [18],
        boundaryRole: "target_skill",
        stageLabel: "Your turn - support nearby",
        prompt: "Complete the subtraction",
        supportingVisibleText: ["7/9 - 1/6", "Use denominator 18."],
        math: exports.FRA22_MATH.F1,
        visual: {
            kind: "form_sensitive_fraction_working",
            fixedDenominator: 18,
            editableFields: [
                "leftEquivalentNumerator",
                "rightEquivalentNumerator",
                "resultNumerator",
            ],
        },
        response: {
            kind: "integer_fields",
            submitLabel: "Check answer",
            fixedDenominator: 18,
        },
        answer: {
            kind: "fields",
            fields: {
                leftEquivalentNumerator: 14,
                rightEquivalentNumerator: 3,
                resultNumerator: 11,
            },
            fixedDenominator: 18,
        },
        hint: {
            visibleText: "Nine times two and six times three make eighteen. Use those factors on the numerators too.",
            startsCollapsed: true,
            spokenByRyan: false,
        },
        workedCheck: {
            visibleSteps: exports.FRA22_MATH.F1.canonicalWorking,
        },
        accessibleDescription: "The expression seven ninths minus one sixth is shown with denominator 18 fixed in both equivalent fractions and the result. Three numerator fields are blank. The hint is closed.",
        policy: POLICY_FADED_OPTIONAL_FORM,
        canonicalSignature: "F1|7/9-1/6|cd18|fields14,3,11",
        recoveryEligible: false,
        authorOnlyNotes: ["Skip only when G1 and G2 both satisfy the authored strong-evidence gate."],
    },
    {
        id: "F2",
        stage: "faded",
        family: "SELECT",
        authorOnlyAssessmentIntent: "method_selection_preserve_equivalence_order_and_denominator",
        sourcePages: [19],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Which working is valid?",
        supportingVisibleText: [
            "7/8 - 2/3",
            "Choose the line that uses one denominator throughout and keeps both fractions equivalent.",
        ],
        math: exports.FRA22_MATH.F2,
        visual: {
            kind: "symbolic_method_choice",
            showWorkedConversionBeforeSubmit: false,
        },
        response: {
            kind: "single_choice",
            submitLabel: "Check answer",
        },
        options: [
            {
                id: "A",
                visibleText: "(7 - 2) / (8 - 3) = 5/5",
                isCorrect: false,
                explicitErrorFamily: "DIRECT",
                classificationConfidence: "high",
            },
            {
                id: "B",
                visibleText: "21/24 - 16/24 = 5/24",
                isCorrect: true,
            },
            {
                id: "C",
                visibleText: "21/24 - 2/24 = 19/24",
                isCorrect: false,
                explicitErrorFamily: "SCALE",
                classificationConfidence: "high",
            },
            {
                id: "D",
                visibleText: "7/24 - 16/24 = -9/24",
                isCorrect: false,
                explicitErrorFamily: "SCALE",
                classificationConfidence: "high",
                authorOnlyRationale: "The first fraction was not renamed equivalently; the negative result is downstream.",
            },
        ],
        answer: { kind: "option", optionId: "B" },
        hint: {
            visibleText: "Eight and three both divide into twenty-four. Check that each numerator changed by the matching factor.",
            startsCollapsed: true,
            spokenByRyan: false,
        },
        workedCheck: {
            visibleSteps: exports.FRA22_MATH.F2.canonicalWorking,
        },
        accessibleDescription: "The expression seven eighths minus two thirds is shown with four complete candidate working lines labelled A to D. The hint is closed and no option is selected.",
        policy: POLICY_FADED_OPTIONAL_SELECT,
        canonicalSignature: "F2|7/8-2/3|method-choice|B",
        normalPilotEnvelopeException: {
            approvedByStoryboard: true,
            reason: "The approved F2 item uses denominator pair 8 and 3 with common denominator 24, so the right scale factor is 8. The storyboard's envelope says normally at most 6 rather than imposing an absolute cap.",
        },
        recoveryEligible: false,
        authorOnlyNotes: ["Always retained, including on the fast route."],
    },
    {
        id: "I1",
        stage: "independent",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "independent_exact_value_without_displayed_method",
        sourcePages: [21],
        boundaryRole: "target_skill",
        stageLabel: "Now you take over",
        prompt: "Calculate the exact difference",
        supportingVisibleText: ["5/6 - 2/5", "Write one exact fraction."],
        math: exports.FRA22_MATH.I1,
        visual: {
            kind: "symbolic_fraction_expression",
            showCommonDenominatorBeforeSubmit: false,
            showConversionFactorsBeforeSubmit: false,
        },
        response: {
            kind: "fraction_input",
            submitLabel: "Check answer",
            numeratorAndDenominatorFields: true,
        },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.I1.rawDifference,
            acceptEquivalent: true,
        },
        hint: {
            visibleText: "Find a denominator that both six and five divide into. Rename both fractions before subtracting.",
            startsCollapsed: true,
            spokenByRyan: false,
        },
        ryanBeforeSubmitUtteranceIds: ["I1.PRE"],
        workedCheck: {
            visibleSteps: exports.FRA22_MATH.I1.canonicalWorking,
        },
        accessibleDescription: "The expression five sixths minus two fifths is shown above an empty fraction input. No common denominator, conversion factor or result is displayed. The hint is closed.",
        policy: POLICY_INDEPENDENT_VALUE,
        canonicalSignature: "I1|5/6-2/5|fraction-value|13/30",
        recoveryEligible: false,
    },
    {
        id: "I2",
        stage: "independent",
        family: "CONTEXT",
        authorOnlyAssessmentIntent: "independent_same_whole_context_transfer",
        sourcePages: [22],
        boundaryRole: "target_skill",
        stageLabel: "Now you take over",
        prompt: "How much coolant remains?",
        supportingVisibleText: [
            "A one-litre coolant tank is 7/8 full. A test drains 1/6 of the tank's full capacity. What fraction of the tank remains?",
        ],
        math: exports.FRA22_MATH.I2,
        visual: {
            kind: "coolant_tank_context",
            wholeCapacityLitres: 1,
            startFraction: { numerator: 7, denominator: 8 },
            drainedFractionOfFullCapacity: { numerator: 1, denominator: 6 },
            showTwentyFourthPartitionBeforeSubmit: false,
            showResultBeforeSubmit: false,
        },
        response: {
            kind: "fraction_input",
            submitLabel: "Check answer",
        },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.I2.rawDifference,
            acceptEquivalent: true,
        },
        hint: {
            visibleText: "Treat the full tank as the same whole. Rename seven eighths and one sixth with one common denominator.",
            startsCollapsed: true,
            spokenByRyan: false,
        },
        workedCheck: {
            visibleSteps: exports.FRA22_MATH.I2.canonicalWorking,
        },
        accessibleDescription: "A one-litre coolant tank is labelled seven eighths full. A separate test label states that one sixth of the tank's full capacity is drained. An empty fraction input is shown. No common denominator or result is given.",
        policy: POLICY_INDEPENDENT_VALUE,
        canonicalSignature: "I2|coolant|7/8-1/6|fraction-value|17/24",
        recoveryEligible: false,
    },
    {
        id: "C-DIRECT",
        stage: "confirmation",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "fresh_no_hint_confirmation_after_direct_support",
        sourcePages: [23],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Calculate 3/4 - 2/5.",
        math: exports.FRA22_MATH.C_DIRECT,
        visual: {
            kind: "symbolic_fraction_expression",
            showMethodBeforeSubmit: false,
        },
        response: { kind: "fraction_input", submitLabel: "Check answer" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.C_DIRECT.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.C_DIRECT.canonicalWorking },
        accessibleDescription: "The expression three quarters minus two fifths is shown with an empty fraction input and no hint.",
        policy: POLICY_CONFIRMATION_VALUE,
        canonicalSignature: "C-DIRECT|3/4-2/5|fraction-value|7/20",
        recoveryEligible: true,
        recoveryFamilies: ["DIRECT", "ORDER"],
    },
    {
        id: "C-CONTEXT",
        stage: "confirmation",
        family: "CONTEXT",
        authorOnlyAssessmentIntent: "fresh_no_hint_confirmation_after_context_support",
        sourcePages: [23],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "A reservoir is 4/5 full. Then 1/6 of its full capacity is used. What fraction remains?",
        math: exports.FRA22_MATH.C_CONTEXT,
        visual: {
            kind: "reservoir_context",
            startFraction: { numerator: 4, denominator: 5 },
            usedFractionOfFullCapacity: { numerator: 1, denominator: 6 },
            showCommonDenominatorBeforeSubmit: false,
        },
        response: { kind: "fraction_input", submitLabel: "Check answer" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.C_CONTEXT.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.C_CONTEXT.canonicalWorking },
        accessibleDescription: "A reservoir is labelled four fifths full and a usage label states one sixth of full capacity. An empty fraction input is shown with no hint or solution.",
        policy: POLICY_CONFIRMATION_VALUE,
        canonicalSignature: "C-CONTEXT|reservoir|4/5-1/6|19/30",
        recoveryEligible: true,
        recoveryFamilies: ["DIRECT", "COMMON"],
        authorOnlyNotes: [
            "The storyboard's table line-breaks the ID as C-CONTEX / T; this specification normalises it to C-CONTEXT.",
        ],
    },
    {
        id: "C-METHOD",
        stage: "confirmation",
        family: "SELECT",
        authorOnlyAssessmentIntent: "fresh_no_hint_method_confirmation_after_f2_support",
        sourcePages: [23],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Select the valid line for 5/8 - 1/3.",
        math: exports.FRA22_MATH.C_METHOD,
        visual: {
            kind: "symbolic_method_choice",
            showMethodBeforeSelectionOnlyThroughOptions: true,
        },
        response: { kind: "single_choice", submitLabel: "Check answer" },
        options: [
            {
                id: "A",
                visibleText: "(5 - 1) / (8 - 3) = 4/5",
                isCorrect: false,
                explicitErrorFamily: "DIRECT",
                classificationConfidence: "high",
            },
            {
                id: "B",
                visibleText: "15/24 - 8/24 = 7/24",
                isCorrect: true,
            },
            {
                id: "C",
                visibleText: "15/24 - 1/24 = 14/24",
                isCorrect: false,
                explicitErrorFamily: "SCALE",
                classificationConfidence: "high",
            },
            {
                id: "D",
                visibleText: "8/24 - 15/24 = -7/24",
                isCorrect: false,
                explicitErrorFamily: "ORDER",
                classificationConfidence: "high",
            },
        ],
        answer: { kind: "option", optionId: "B" },
        workedCheck: { visibleSteps: exports.FRA22_MATH.C_METHOD.canonicalWorking },
        accessibleDescription: "The expression five eighths minus one third is shown with four candidate working lines. No hint is available and no option is selected.",
        policy: POLICY_CONFIRMATION_SELECT,
        canonicalSignature: "C-METHOD|5/8-1/3|method-choice|B",
        normalPilotEnvelopeException: {
            approvedByStoryboard: true,
            reason: "The approved C-METHOD item uses denominator pair 8 and 3 with common denominator 24, so the right scale factor is 8. Keep this authored item; do not generalise the exception.",
        },
        recoveryEligible: true,
        recoveryFamilies: ["DIRECT", "SCALE", "ORDER", "DEN_KEEP"],
        authorOnlyNotes: [
            "The storyboard names the correct line but not the distractors. These distractors are the deterministic F2/M5 structural templates applied to the authored values; see source-completion SC-01.",
        ],
    },
    {
        id: "M1",
        stage: "final",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "unsupported_direct_coprime_subtraction",
        sourcePages: [25],
        boundaryRole: "target_skill",
        stageLabel: "Final check",
        prompt: "Calculate the exact difference",
        supportingVisibleText: ["4/5 - 1/6"],
        math: exports.FRA22_MATH.M1,
        visual: {
            kind: "symbolic_fraction_expression",
            showMethodBeforeSubmit: false,
        },
        response: { kind: "fraction_input", submitLabel: "Submit" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.M1.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: {
            visibleSteps: exports.FRA22_MATH.M1.canonicalWorking,
            ryanCorrectUtteranceIds: ["FINAL.CORRECT"],
            ryanIncorrectUtteranceIds: ["FINAL.INCORRECT"],
        },
        accessibleDescription: "The final-check expression four fifths minus one sixth is shown above an empty fraction input. No hint, common denominator, conversion or working is present before submission.",
        policy: POLICY_FINAL_VALUE,
        canonicalSignature: "M1|4/5-1/6|fraction-value|19/30",
        recoveryEligible: false,
    },
    {
        id: "M2",
        stage: "final",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "unsupported_direct_shared_factor_pair",
        sourcePages: [26],
        boundaryRole: "target_skill",
        stageLabel: "Final check",
        prompt: "Calculate the exact difference",
        supportingVisibleText: ["5/6 - 1/9"],
        math: exports.FRA22_MATH.M2,
        visual: {
            kind: "symbolic_fraction_expression",
            showMultipleListBeforeSubmit: false,
            showMethodBeforeSubmit: false,
        },
        response: { kind: "fraction_input", submitLabel: "Submit" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.M2.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: {
            visibleSteps: exports.FRA22_MATH.M2.canonicalWorking,
            ryanCorrectUtteranceIds: ["FINAL.CORRECT"],
            ryanIncorrectUtteranceIds: ["FINAL.INCORRECT"],
        },
        accessibleDescription: "The final-check expression five sixths minus one ninth is shown above an empty fraction input. No hint, multiple list or working is present before submission.",
        policy: POLICY_FINAL_VALUE,
        canonicalSignature: "M2|5/6-1/9|fraction-value|13/18",
        recoveryEligible: false,
    },
    {
        id: "M3",
        stage: "final",
        family: "MISSING",
        authorOnlyAssessmentIntent: "unsupported_form_sensitive_equivalent_and_difference_fields",
        sourcePages: [27],
        boundaryRole: "target_skill",
        stageLabel: "Final check",
        prompt: "Complete both missing numerators",
        supportingVisibleText: ["7/10 = ?/30", "1/6 = 5/30", "difference = ?/30"],
        math: exports.FRA22_MATH.M3,
        visual: {
            kind: "form_sensitive_fraction_working",
            fixedDenominator: 30,
            fixedRightEquivalentNumerator: 5,
            editableFields: ["leftEquivalentNumerator", "resultNumerator"],
            showMultipliersBeforeSubmit: false,
        },
        response: {
            kind: "integer_fields",
            submitLabel: "Submit",
            fieldOrder: ["leftEquivalentNumerator", "resultNumerator"],
        },
        answer: {
            kind: "fields",
            fields: { leftEquivalentNumerator: 21, resultNumerator: 16 },
            fixedDenominator: 30,
        },
        workedCheck: {
            visibleSteps: [
                "10 x 3 = 30",
                "7 x 3 = 21",
                "6 x 5 = 30",
                "1 x 5 = 5",
                "21/30 - 5/30 = 16/30",
            ],
            ryanCorrectUtteranceIds: ["FINAL.CORRECT"],
            ryanIncorrectUtteranceIds: ["FINAL.INCORRECT"],
        },
        accessibleDescription: "The final-check layout supplies denominator 30. Seven tenths has a blank equivalent numerator; one sixth is already shown as five thirtieths; the difference numerator is blank. No multipliers or working are shown before submission.",
        policy: POLICY_FINAL_FORM,
        canonicalSignature: "M3|7/10-1/6|cd30|fields21,16",
        recoveryEligible: false,
    },
    {
        id: "M4",
        stage: "final",
        family: "CONTEXT",
        authorOnlyAssessmentIntent: "unsupported_cable_context_application",
        sourcePages: [28],
        boundaryRole: "target_skill",
        stageLabel: "Final check",
        prompt: "How much cable remains?",
        supportingVisibleText: [
            "A one-metre cable reel has 7/8 metre left. A repair uses 1/3 metre. What fraction of a metre remains?",
        ],
        math: exports.FRA22_MATH.M4,
        visual: {
            kind: "cable_reel_context",
            wholeLengthMetres: 1,
            startLengthFraction: { numerator: 7, denominator: 8 },
            usedLengthFraction: { numerator: 1, denominator: 3 },
            showTwentyFourthPartitionBeforeSubmit: false,
            showResultBeforeSubmit: false,
        },
        response: { kind: "fraction_input", submitLabel: "Submit", unitLabel: "metre" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.M4.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: {
            visibleSteps: [
                "7/8 = 21/24",
                "1/3 = 8/24",
                "21/24 - 8/24 = 13/24",
                "13/24 metre remains",
            ],
            ryanCorrectUtteranceIds: ["FINAL.CORRECT"],
            ryanIncorrectUtteranceIds: ["FINAL.INCORRECT"],
        },
        accessibleDescription: "A one-metre cable reel is labelled seven eighths metre left, and a repair uses one third metre. An empty fraction input is shown. The cable is not divided into twenty-fourths and no result is shown before submission.",
        policy: POLICY_FINAL_VALUE,
        canonicalSignature: "M4|cable|7/8-1/3|13/24m",
        normalPilotEnvelopeException: {
            approvedByStoryboard: true,
            reason: "The approved M4 cable item uses denominator pair 8 and 3 with common denominator 24, so the right scale factor is 8. This is a named storyboard exception to the normal envelope.",
        },
        recoveryEligible: false,
    },
    {
        id: "M5",
        stage: "final",
        family: "ERROR",
        authorOnlyAssessmentIntent: "unsupported_error_analysis_direct_order_denominator",
        sourcePages: [29],
        boundaryRole: "target_skill",
        stageLabel: "Final check",
        prompt: "Which line is mathematically valid?",
        supportingVisibleText: ["7/10 - 1/4"],
        math: exports.FRA22_MATH.M5,
        visual: { kind: "symbolic_method_choice", showWorkedCheckBeforeSubmit: false },
        response: { kind: "single_choice", submitLabel: "Submit" },
        options: [
            {
                id: "A",
                visibleText: "(7 - 1)/(10 - 4) = 6/6",
                isCorrect: false,
                explicitErrorFamily: "DIRECT",
                classificationConfidence: "high",
            },
            {
                id: "B",
                visibleText: "14/20 - 5/20 = 9/20",
                isCorrect: true,
            },
            {
                id: "C",
                visibleText: "5/20 - 14/20 = 9/20",
                isCorrect: false,
                explicitErrorFamily: "ORDER",
                classificationConfidence: "high",
            },
            {
                id: "D",
                visibleText: "14/20 - 5/20 = 9/40",
                isCorrect: false,
                explicitErrorFamily: "DEN_KEEP",
                classificationConfidence: "high",
            },
        ],
        answer: { kind: "option", optionId: "B" },
        workedCheck: {
            visibleSteps: [
                "7/10 = 14/20",
                "1/4 = 5/20",
                "Keep the original order: 14 - 5 = 9",
                "Keep the common denominator: 9/20",
            ],
            ryanCorrectUtteranceIds: ["FINAL.CORRECT"],
            ryanIncorrectUtteranceIds: ["FINAL.INCORRECT"],
        },
        accessibleDescription: "The final-check expression seven tenths minus one quarter is shown with four complete candidate working lines labelled A to D. No option is selected and no correctness or worked check is visible before submission.",
        policy: POLICY_FINAL_SELECT,
        canonicalSignature: "M5|7/10-1/4|method-choice|B",
        recoveryEligible: false,
    },
    {
        id: "R-DIRECT-S",
        stage: "repair",
        family: "LOCAL_REPAIR",
        authorOnlyAssessmentIntent: "supported_repair_after_direct_unlike_numerator_subtraction",
        sourcePages: [31],
        boundaryRole: "target_skill",
        stageLabel: "Try it with me",
        prompt: "Complete 3/4 - 1/6 using denominator 12.",
        math: exports.FRA22_MATH.R_DIRECT_SUPPORTED,
        visual: {
            kind: "form_sensitive_fraction_working",
            fixedDenominator: 12,
            editableFields: [
                "leftEquivalentNumerator",
                "rightEquivalentNumerator",
                "resultNumerator",
            ],
        },
        response: { kind: "integer_fields", submitLabel: "Check answer" },
        answer: {
            kind: "fields",
            fields: {
                leftEquivalentNumerator: 9,
                rightEquivalentNumerator: 2,
                resultNumerator: 7,
            },
            fixedDenominator: 12,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.R_DIRECT_SUPPORTED.canonicalWorking },
        accessibleDescription: "A supported repair layout shows three quarters minus one sixth with denominator 12 fixed and three numerator fields blank.",
        policy: POLICY_REPAIR_SUPPORTED,
        canonicalSignature: "R-DIRECT-S|3/4-1/6|cd12|fields9,2,7",
        recoveryEligible: false,
    },
    {
        id: "R-DIRECT-F",
        stage: "confirmation",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "fresh_no_hint_check_after_direct_repair",
        sourcePages: [31],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Calculate 4/5 - 1/6.",
        math: exports.FRA22_MATH.R_DIRECT_FRESH,
        visual: { kind: "symbolic_fraction_expression", showMethodBeforeSubmit: false },
        response: { kind: "fraction_input", submitLabel: "Check answer" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.R_DIRECT_FRESH.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.R_DIRECT_FRESH.canonicalWorking },
        accessibleDescription: "The expression four fifths minus one sixth is shown with an empty fraction input and no hint.",
        policy: POLICY_REPAIR_FRESH,
        canonicalSignature: "R-DIRECT-F|4/5-1/6|fraction-value|19/30",
        recoveryEligible: true,
        recoveryFamilies: ["DIRECT"],
        authorOnlyNotes: [
            "This duplicates M1 mathematically. The unused-signature selector must not serve it after M1 has been seen.",
        ],
    },
    {
        id: "R-SCALE-S",
        stage: "repair",
        family: "LOCAL_REPAIR",
        authorOnlyAssessmentIntent: "supported_equivalent_fraction_scaling_repair",
        sourcePages: [32],
        boundaryRole: "local_repair",
        stageLabel: "Try it with me",
        prompt: "Complete 5/8 = ?/24.",
        visual: {
            kind: "equivalent_fraction_field",
            sourceFraction: { numerator: 5, denominator: 8 },
            targetDenominator: 24,
            editableFields: ["targetNumerator"],
        },
        response: { kind: "integer_field", submitLabel: "Check answer" },
        answer: { kind: "integer", value: 15 },
        workedCheck: { visibleSteps: ["8 x 3 = 24", "5 x 3 = 15", "5/8 = 15/24"] },
        accessibleDescription: "A supported equivalent-fraction repair shows five eighths equals a blank numerator over 24. Only the numerator is editable.",
        policy: POLICY_REPAIR_SUPPORTED,
        canonicalSignature: "R-SCALE-S|5/8=?/24|15",
        recoveryEligible: false,
    },
    {
        id: "R-SCALE-F",
        stage: "confirmation",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "fresh_no_hint_check_after_scaling_repair",
        sourcePages: [32],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Calculate 3/8 - 1/6.",
        math: exports.FRA22_MATH.R_SCALE_FRESH,
        visual: { kind: "symbolic_fraction_expression", showMethodBeforeSubmit: false },
        response: { kind: "fraction_input", submitLabel: "Check answer" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.R_SCALE_FRESH.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.R_SCALE_FRESH.canonicalWorking },
        accessibleDescription: "The expression three eighths minus one sixth is shown with an empty fraction input and no hint.",
        policy: POLICY_REPAIR_FRESH,
        canonicalSignature: "R-SCALE-F|3/8-1/6|fraction-value|5/24",
        recoveryEligible: true,
        recoveryFamilies: ["SCALE", "DIRECT"],
    },
    {
        id: "R-COMMON-S",
        stage: "repair",
        family: "LOCAL_REPAIR",
        authorOnlyAssessmentIntent: "supported_common_denominator_choice_repair",
        sourcePages: [33],
        boundaryRole: "target_skill",
        stageLabel: "Try it with me",
        prompt: "For 7/10 - 1/6, choose the valid denominator.",
        math: exports.FRA22_MATH.R_COMMON_SUPPORTED,
        visual: { kind: "symbolic_common_denominator_choice" },
        response: { kind: "single_choice", submitLabel: "Check answer" },
        options: [
            { id: "20", visibleText: "20", isCorrect: false },
            { id: "30", visibleText: "30", isCorrect: true },
            { id: "40", visibleText: "40", isCorrect: false },
        ],
        answer: { kind: "option", optionId: "30" },
        accessibleDescription: "The expression seven tenths minus one sixth is shown with denominator choices 20, 30 and 40. No option is preselected.",
        policy: POLICY_REPAIR_SUPPORTED,
        canonicalSignature: "R-COMMON-S|7/10-1/6|choose-cd|20,30,40",
        recoveryEligible: false,
    },
    {
        id: "R-COMMON-F",
        stage: "confirmation",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "fresh_no_hint_check_after_common_denominator_repair",
        sourcePages: [33],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Calculate 5/9 - 1/6.",
        math: exports.FRA22_MATH.R_COMMON_FRESH,
        visual: { kind: "symbolic_fraction_expression", showMethodBeforeSubmit: false },
        response: { kind: "fraction_input", submitLabel: "Check answer" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.R_COMMON_FRESH.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.R_COMMON_FRESH.canonicalWorking },
        accessibleDescription: "The expression five ninths minus one sixth is shown with an empty fraction input and no hint.",
        policy: POLICY_REPAIR_FRESH,
        canonicalSignature: "R-COMMON-F|5/9-1/6|fraction-value|7/18",
        recoveryEligible: true,
        recoveryFamilies: ["COMMON", "DIRECT"],
    },
    {
        id: "R-ORDER-S",
        stage: "repair",
        family: "LOCAL_REPAIR",
        authorOnlyAssessmentIntent: "supported_original_order_repair",
        sourcePages: [34],
        boundaryRole: "target_skill",
        stageLabel: "Try it with me",
        prompt: "For 7/10 - 1/4 = 14/20 - 5/20, select the numerator order and enter the result.",
        math: exports.FRA22_MATH.R_ORDER_SUPPORTED,
        visual: {
            kind: "ordered_subtraction_builder",
            fixedEquivalentFractions: ["14/20", "5/20"],
            orderChoices: ["14 - 5", "5 - 14"],
            fixedResultDenominator: 20,
        },
        response: {
            kind: "compound",
            fields: ["selectedOrder", "resultNumerator"],
            submitLabel: "Check answer",
        },
        answer: {
            kind: "compound",
            fields: { selectedOrder: "14 - 5", resultNumerator: 9 },
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.R_ORDER_SUPPORTED.canonicalWorking },
        accessibleDescription: "A supported repair shows fourteen twentieths minus five twentieths. The learner chooses between fourteen minus five and five minus fourteen, then fills a numerator over fixed denominator 20.",
        policy: POLICY_REPAIR_SUPPORTED,
        canonicalSignature: "R-ORDER-S|14/20-5/20|order14-5|9/20",
        recoveryEligible: false,
    },
    {
        id: "R-ORDER-F",
        stage: "confirmation",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "fresh_no_hint_check_after_order_repair",
        sourcePages: [34],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Calculate 3/4 - 2/5.",
        math: exports.FRA22_MATH.R_ORDER_FRESH,
        visual: { kind: "symbolic_fraction_expression", showMethodBeforeSubmit: false },
        response: { kind: "fraction_input", submitLabel: "Check answer" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.R_ORDER_FRESH.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.R_ORDER_FRESH.canonicalWorking },
        accessibleDescription: "The expression three quarters minus two fifths is shown with an empty fraction input and no hint.",
        policy: POLICY_REPAIR_FRESH,
        canonicalSignature: "R-ORDER-F|3/4-2/5|fraction-value|7/20",
        recoveryEligible: true,
        recoveryFamilies: ["ORDER", "DIRECT"],
        authorOnlyNotes: [
            "This duplicates C-DIRECT mathematically. The unused-signature selector must not serve both in one journey.",
        ],
    },
    {
        id: "R-DEN-KEEP-S",
        stage: "repair",
        family: "LOCAL_REPAIR",
        authorOnlyAssessmentIntent: "supported_keep_common_denominator_repair",
        sourcePages: [35],
        boundaryRole: "local_repair",
        stageLabel: "Try it with me",
        prompt: "Complete 13/24 - 5/24.",
        visual: {
            kind: "same_denominator_numerator_only",
            expression: "13/24 - 5/24",
            fixedDenominator: 24,
            editableFields: ["resultNumerator"],
        },
        response: { kind: "integer_field", submitLabel: "Check answer" },
        answer: { kind: "integer", value: 8 },
        workedCheck: { visibleSteps: ["13 - 5 = 8", "Keep denominator 24", "8/24"] },
        accessibleDescription: "A supported repair shows thirteen twenty-fourths minus five twenty-fourths with only the result numerator editable over fixed denominator 24.",
        policy: POLICY_REPAIR_SUPPORTED,
        canonicalSignature: "R-DEN-KEEP-S|13/24-5/24|numerator8",
        recoveryEligible: false,
    },
    {
        id: "R-DEN-KEEP-F",
        stage: "confirmation",
        family: "DIRECT",
        authorOnlyAssessmentIntent: "fresh_no_hint_check_after_denominator_keep_repair",
        sourcePages: [35],
        boundaryRole: "target_skill",
        stageLabel: "Your turn",
        prompt: "Calculate 4/5 - 1/3.",
        math: exports.FRA22_MATH.R_DEN_KEEP_FRESH,
        visual: { kind: "symbolic_fraction_expression", showMethodBeforeSubmit: false },
        response: { kind: "fraction_input", submitLabel: "Check answer" },
        answer: {
            kind: "fraction_value",
            value: exports.FRA22_MATH.R_DEN_KEEP_FRESH.rawDifference,
            acceptEquivalent: true,
        },
        workedCheck: { visibleSteps: exports.FRA22_MATH.R_DEN_KEEP_FRESH.canonicalWorking },
        accessibleDescription: "The expression four fifths minus one third is shown with an empty fraction input and no hint.",
        policy: POLICY_REPAIR_FRESH,
        canonicalSignature: "R-DEN-KEEP-F|4/5-1/3|fraction-value|7/15",
        recoveryEligible: true,
        recoveryFamilies: ["DEN_KEEP", "DIRECT"],
    },
];
exports.FRA22_REPAIRS = {
    "R-DIRECT": {
        errorFamily: "DIRECT",
        sourcePages: [31],
        ryanUtteranceIds: ["R-DIRECT.1", "R-DIRECT.2", "R-DIRECT.3"],
        exampleMath: exports.FRA22_MATH.R_DIRECT_EXAMPLE,
        supportedQuestionId: "R-DIRECT-S",
        freshQuestionPreference: ["R-DIRECT-F", "C-DIRECT", "R-SCALE-F"],
        triggerRule: "Run after an explicit direct unlike-numerator rule or repeated DIRECT evidence; one unexplained wrong value remains UNKNOWN.",
    },
    "R-SCALE": {
        errorFamily: "SCALE",
        sourcePages: [32],
        ryanUtteranceIds: ["R-SCALE.1", "R-SCALE.2", "R-SCALE.3"],
        supportedQuestionId: "R-SCALE-S",
        freshQuestionPreference: ["R-SCALE-F", "C-METHOD"],
        triggerRule: "One fully visible inconsistent equivalent rewrite is strong evidence; otherwise confirm before repair.",
    },
    "R-COMMON": {
        errorFamily: "COMMON",
        sourcePages: [33],
        ryanUtteranceIds: ["R-COMMON.1", "R-COMMON.2", "R-COMMON.3"],
        supportedQuestionId: "R-COMMON-S",
        freshQuestionPreference: ["R-COMMON-F", "C-METHOD", "C-CONTEXT"],
        triggerRule: "Run after an explicitly invalid common denominator or repeated denominator-choice evidence; one fact slip is not enough.",
    },
    "R-ORDER": {
        errorFamily: "ORDER",
        sourcePages: [34],
        ryanUtteranceIds: ["R-ORDER.1", "R-ORDER.2", "R-ORDER.3"],
        supportedQuestionId: "R-ORDER-S",
        freshQuestionPreference: ["R-ORDER-F", "C-METHOD", "C-DIRECT"],
        triggerRule: "One explicit reversed working line is enough; a bare final value remains ambiguous.",
    },
    "R-DEN-KEEP": {
        errorFamily: "DEN_KEEP",
        sourcePages: [35],
        ryanUtteranceIds: ["R-DEN-KEEP.1", "R-DEN-KEEP.2", "R-DEN-KEEP.3"],
        supportedQuestionId: "R-DEN-KEEP-S",
        freshQuestionPreference: ["R-DEN-KEEP-F", "C-METHOD", "R-SCALE-F"],
        triggerRule: "Run after one clear denominator-change line or repeated evidence; one unexplained wrong fraction remains UNKNOWN.",
    },
};
exports.FRA22_SOURCE_COMPLETIONS = [
    {
        id: "SC-01",
        sourceGap: "The storyboard specifies C-METHOD's prompt and correct working line but does not enumerate its distractors.",
        implementationCompletion: "Use the already-authored F2/M5 structural misconception templates with the C-METHOD values: direct top-and-bottom subtraction, one-fraction-not-renamed, and reversed order. The exact options are declared in FRA22_QUESTIONS. Codex must not generate alternatives.",
        learnerFacingNovelty: "No new concept or route is added; only deterministic option text required to render the authored selection item is completed.",
    },
    {
        id: "SC-02",
        sourceGap: "The final 3/5 and 0-2/5 routes prescribe fresh two- and three-item checks without naming a separate recovery bank.",
        implementationCompletion: "Recovery may draw only from the storyboard-authored confirmation and repair fresh-check items marked recoveryEligible. The selector must reject any question ID or ordered-subtraction mathematical signature already seen in the journey. If the authored pool cannot satisfy freshness and family coverage, stop and report the gap rather than generate a new item.",
        learnerFacingNovelty: "No new question content is introduced.",
    },
    {
        id: "SC-03",
        sourceGap: "The storyboard gives one generic correct line and one generic incorrect line for all five final items, while each worked check is visual text rather than additional Ryan speech.",
        implementationCompletion: "Reuse FINAL.CORRECT or FINAL.INCORRECT exactly once after lock, then reveal the item-specific visibleSteps. Do not invent spoken worked-check lines.",
        learnerFacingNovelty: "None; this preserves the exact approved speech boundary.",
    },
    {
        id: "SC-04",
        sourceGap: "The pilot authoring envelope says scale factors are normally at most 6, but the approved F2, C-METHOD and M4 denominator-pair 8-and-3 items require a scale factor of 8 to reach twenty-fourths.",
        implementationCompletion: "Preserve those three authored items as explicit exceptions because 'normally' is a soft envelope. No other question may exceed a scale factor of 6 without a new owner-approved source change and a declared exception.",
        learnerFacingNovelty: "None; this resolves an internal authoring-envelope inconsistency without changing any approved learner-facing value.",
    },
    {
        id: "SC-05",
        sourceGap: "The storyboard-authored R-DIRECT fresh check repeats final M1 as 4/5 - 1/6, and R-ORDER-F repeats C-DIRECT as 3/4 - 2/5.",
        implementationCompletion: "Track ordered-subtraction freshness independently from question IDs. A repeated value-set may remain in the fixed route, but it must set countsAsFreshEvidence to false, cannot satisfy mastery and cannot be selected as a recovery item after the same mathematics has appeared.",
        learnerFacingNovelty: "None; the learner-facing screens remain as authored. This completion prevents repeated mathematics from being misreported as fresh evidence.",
    },
];
exports.FRA22 = {
    id: "FRA22",
    displayId: "FRA-22",
    title: "Subtract Fractions with Different Denominators",
    status: "OWNER_AUTHORISED_CODEX_HANDOFF_V1",
    handoffVersion: "v1",
    contentVersion: exports.FRA22_CONTENT_VERSION,
    sourceOfTruth: {
        runtimeCopyQuestionDataRoutingAndOutcomeLogic: "FRA22_CANONICAL_SPEC.ts",
        visualGeometryAndOwnerFacingPedagogy: "Revily_FRA-22_Storyboard_v1.pdf",
        engineeringIntegrationAndAcceptance: "FRA22_CODEX_IMPLEMENTATION_PROMPT.md",
        packageGuide: "FRA22_START_CODEX_PROMPT.txt",
        criticalPrecedenceRule: "Only FRA22_RUNTIME_COPY text is legal Ryan speech and caption copy. The PDF controls approved visual geometry and pedagogical intent. This TypeScript file controls runtime wording, question data, outcome branches, cue bindings and within-lesson routing. PDF headings, notes, labels, QA prose and stage directions are never Ryan speech.",
        projectWideRule: "Learner-facing runtime copy, visible learner UI and author-only implementation directions stay separate. One canonical utterance timeline drives audio, captions and bound mathematical cues.",
    },
    curriculum: {
        objective: "Subtract two positive fractions with different denominators by creating exact equivalent fractions with a valid common denominator, then subtracting the numerators in order.",
        studentFacingCoreIdea: "Make both fractions use the same-sized parts. Then subtract the numerators in the original order.",
        prerequisites: [
            "FRA-08: equivalent fractions",
            "FRA-20: subtract fractions with the same denominator",
            "P-N05: common multiples",
        ],
        supportingPrerequisites: [
            "P-N06: least common multiple",
            "FRA-10 only when a prompt explicitly requires simplest form",
        ],
        includes: [
            "shared-factor and coprime denominator pairs",
            "positive exact differences",
            "any valid common denominator when the prompt asks only for the value",
            "renaming both fractions with the same factor on numerator and denominator",
            "symbolic, step, selection, error, reasoning and context families",
            "exact equivalent answers unless the authored field or form is explicit",
        ],
        excludes: [
            "FRA-20 matched-denominator subtraction as the target",
            "FRA-21 one-denominator-multiple subtraction as the target",
            "negative-fraction answers",
            "mixed-number subtraction as the target",
            "addition or multi-operation fraction problems",
            "mandatory simplification unless explicitly requested",
            "requiring the least common denominator when another valid denominator works",
            "Diagnostic placement",
            "Retrieval scheduling",
        ],
        pilotEnvelope: {
            maximumStartingDenominatorNormally: 10,
            maximumCommonDenominatorNormally: 30,
            maximumScaleFactorNormally: 6,
            requirePositiveDifference: true,
            simplestFormByDefault: false,
        },
        hardBoundaryTest: "For every target-skill subtraction item, the starting denominators differ and neither starting denominator divides the other. Same denominators belong to FRA-20; one-denominator-multiple cases belong to FRA-21. Local repair items may temporarily isolate prerequisite or keep-denominator behaviour and are marked boundaryRole local_repair.",
    },
    presentation: {
        narrator: "Ryan",
        targetAge: "11-16",
        captionPolicy: {
            permanentTranscriptBar: false,
            exactTextSource: "FRA22_RUNTIME_COPY[id].text",
            wordTimed: true,
            fullSentenceVisibleBeforeSpeech: false,
            normalMaximumLines: 2,
            neverCoverActiveMathematics: true,
            pauseReplayKeepsAudioCaptionCueParity: true,
        },
        responsive: {
            mobileReviewWidthPx: 390,
            oneDominantModelAtATime: true,
            finalBeforeAfterPanelsStackVertically: true,
            fractionFieldsOwnDimensions: true,
            optionsStackWhenNeeded: true,
        },
        accessibility: {
            keyboardOperable: true,
            visibleFocus: true,
            adequateTouchTargets: true,
            colourNeverSoleCue: true,
            removedStatesUseHatchOrOutline: true,
            reducedMotionUsesEquivalentStates: true,
            accessibleDescriptionsMustNotSolveScoredItems: true,
            spokenContentHasTextEquivalent: true,
        },
    },
    teachingScenes: [
        {
            id: "HOOK",
            stage: "opening",
            sourcePages: [7],
            authorOnlyPurpose: "Create a contradiction from direct top-and-bottom subtraction.",
            ryanUtteranceIds: ["HOOK.1", "HOOK.2", "HOOK.3", "HOOK.4"],
            timelineCueIds: [
                "HOOK.CUE.START",
                "HOOK.CUE.REMOVE",
                "HOOK.CUE.WRONG",
                "HOOK.CUE.CROSS",
            ],
            visualKind: "battery_sixths_with_quarter_capacity_use",
            interaction: { kind: "continue_button", label: "Show me how the pieces match" },
            scored: false,
        },
        {
            id: "T1",
            stage: "teach",
            sourcePages: [8],
            authorOnlyPurpose: "Make the different piece sizes perceptually explicit.",
            ryanUtteranceIds: ["T1.1", "T1.2", "T1.3"],
            timelineCueIds: ["T1.CUE.SIXTHS", "T1.CUE.QUARTERS", "T1.CUE.SHARED"],
            visualKind: "equal_length_battery_bars_partitioned_into_sixths_and_quarters",
        },
        {
            id: "T2",
            stage: "teach",
            sourcePages: [9],
            authorOnlyPurpose: "Apply common multiples to choose a valid denominator.",
            ryanUtteranceIds: ["T2.1", "T2.2", "T2.3"],
            timelineCueIds: ["T2.CUE.MULTIPLES", "T2.CUE.MEET", "T2.CUE.LABEL"],
            visualKind: "aligned_multiple_tracks_for_six_and_four",
        },
        {
            id: "T3",
            stage: "teach",
            sourcePages: [10],
            authorOnlyPurpose: "Rename both fractions without changing either value.",
            ryanUtteranceIds: ["T3.1", "T3.2", "T3.3"],
            timelineCueIds: ["T3.CUE.SIXTHS_SPLIT", "T3.CUE.QUARTERS_SPLIT", "T3.CUE.FACTORS"],
            visualKind: "speech_led_subdivision_to_twelfths",
            math: exports.FRA22_MATH.HOOK_12,
        },
        {
            id: "T4",
            stage: "teach",
            sourcePages: [11],
            authorOnlyPurpose: "Subtract converted numerators in order and keep the piece size.",
            ryanUtteranceIds: ["T4.1", "T4.2", "T4.3"],
            timelineCueIds: ["T4.CUE.ORDER", "T4.CUE.REMOVE", "T4.CUE.RESULT", "T4.CUE.DENOMINATOR"],
            visualKind: "battery_twelfths_remove_three_from_ten",
            math: exports.FRA22_MATH.HOOK_12,
        },
        {
            id: "T5",
            stage: "teach",
            sourcePages: [12],
            authorOnlyPurpose: "Show that a larger valid common denominator is exact but less efficient.",
            ryanUtteranceIds: ["T5.1", "T5.2", "T5.3", "T5.4"],
            timelineCueIds: ["T5.CUE.ALTERNATE", "T5.CUE.SAME_AMOUNT"],
            visualKind: "side_by_side_twelfths_and_twenty_fourths_routes",
            primaryMath: exports.FRA22_MATH.HOOK_12,
            alternateMath: exports.FRA22_MATH.HOOK_24,
        },
        {
            id: "HANDOFF",
            stage: "teach",
            sourcePages: [13],
            authorOnlyPurpose: "Hand responsibility to the learner and state the support fade.",
            ryanUtteranceIds: ["HANDOFF.1", "HANDOFF.2"],
            timelineCueIds: [],
            visualKind: "stage_label_transition",
        },
    ],
    questions: exports.FRA22_QUESTIONS,
    repairs: exports.FRA22_REPAIRS,
    route: {
        initial: ["HOOK", "T1", "T2", "T3", "T4", "T5", "HANDOFF", "G1", "G2"],
        strongGuidedGate: "G1 and G2 are both first-attempt correct, with no hint, factor reveal, support escalation or visible central misconception.",
        strongRoute: ["G1", "G2", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"],
        standardRoute: ["G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"],
        fastRouteRule: "Skip F1 only. F2 remains on every route.",
        independentSupportRule: "A correct answer after opening a hint is supported success and requires one unused no-hint same-family confirmation before final.",
        repeatedErrorRule: "Repeated or explicit high-confidence DIRECT, SCALE, COMMON, ORDER or DEN_KEEP evidence routes to the matching repair, supported interaction and unused fresh no-hint check.",
        arithmeticRule: "One visible arithmetic slip with correct structure receives ARITHMETIC.CUE and a nearby unused no-hint check; it does not trigger a concept reset.",
        finalSequence: ["M1", "M2", "M3", "M4", "M5"],
        freshnessRule: "Before each final or recovery item, compare its ordered-subtraction freshness signature with every previously submitted item. A repeated value-set may still be shown if the storyboard fixes the route, but it must set countsAsFreshEvidence to false and cannot help satisfy mastery.",
        finalMastery: "At least 4/5 committed first attempts, including direct procedure and at least one context, selection, reasoning or error-analysis item, with no blocking misconception appearing twice.",
        finalRoutes: {
            qualifyingFourOrFive: "complete",
            threeOrHighScoreMissingRequiredEvidence: "targeted repair then fresh two-item mini-check; require 2/2 without hints",
            zeroToTwo: "repair actual weaknesses then fresh three-item final; require 3/3 and no repeated blocker",
        },
        completionUtteranceIds: ["COMPLETE.1"],
        withinLessonOnly: true,
        diagnosticImplemented: false,
        retrievalImplemented: false,
    },
    sourceCompletions: exports.FRA22_SOURCE_COMPLETIONS,
    qa: {
        runtimeCopyLeakage: true,
        audioCaptionCueParity: true,
        distinctCorrectIncorrectOutcomes: true,
        semanticRepetitionAudit: true,
        singleSourceQuestionMath: true,
        finalWorkingAfterLockOnly: true,
        hintSuccessRequiresFreshConfirmation: true,
        routeAwareMathematicalFreshness: true,
        strongRouteSkipsOnlyF1: true,
        exactContextVisuals: true,
        desktopAnd390MobileVisualInspection: true,
        keyboardScreenReaderReducedMotionReview: true,
        diagnosticOutOfScope: true,
        retrievalOutOfScope: true,
    },
};
function getQuestion(questionId) {
    const question = exports.FRA22_QUESTIONS.find((candidate) => candidate.id === questionId);
    if (!question)
        throw new Error(`Unknown FRA22 question ID: ${questionId}`);
    return question;
}
/**
 * Freshness is mathematical, not merely an ID check. Two screens that use the
 * same ordered subtraction values are not fresh evidence even when their stage,
 * representation or question ID differs. This deliberately catches the source
 * duplicates R-DIRECT-F/M1 and C-DIRECT/R-ORDER-F.
 */
function getQuestionFreshnessSignature(questionOrId) {
    const question = typeof questionOrId === "string" ? getQuestion(questionOrId) : questionOrId;
    if (question.math) {
        return [
            "ordered-subtraction",
            fractionKey(question.math.left),
            fractionKey(question.math.right),
        ].join("|");
    }
    return `non-subtraction|${question.canonicalSignature}`;
}
function isQuestionFreshForJourney(questionOrId, seenFreshnessSignatures) {
    return !new Set(seenFreshnessSignatures).has(getQuestionFreshnessSignature(questionOrId));
}
function evaluateFractionAnswer(submitted, expected, acceptEquivalent) {
    if (!Number.isInteger(submitted.numerator) ||
        !Number.isInteger(submitted.denominator) ||
        submitted.denominator === 0) {
        return false;
    }
    if (acceptEquivalent)
        return fractionsEquivalent(submitted, expected);
    return (submitted.numerator === expected.numerator &&
        submitted.denominator === expected.denominator);
}
function evaluateQuestionAnswer(questionId, submission) {
    const question = getQuestion(questionId);
    const answer = question.answer;
    if (answer.kind === "fraction_value") {
        if (typeof submission !== "object" ||
            submission === null ||
            !("numerator" in submission) ||
            !("denominator" in submission)) {
            return false;
        }
        return evaluateFractionAnswer(submission, answer.value, answer.acceptEquivalent);
    }
    if (answer.kind === "integer") {
        return typeof submission === "number" && submission === answer.value;
    }
    if (answer.kind === "option") {
        return typeof submission === "string" && submission === answer.optionId;
    }
    if (answer.kind === "fields" || answer.kind === "compound") {
        if (typeof submission !== "object" || submission === null)
            return false;
        for (const [field, expectedValue] of Object.entries(answer.fields)) {
            if (submission[field] !== expectedValue) {
                return false;
            }
        }
        return true;
    }
    return false;
}
function classifyStructuredWorking(questionId, submission) {
    const question = getQuestion(questionId);
    const math = question.math;
    if (submission.selectedOptionId && question.options) {
        const option = question.options.find((candidate) => candidate.id === submission.selectedOptionId);
        if (!option) {
            return { family: "UNKNOWN", confidence: "unknown", reason: "Unknown option ID." };
        }
        if (option.isCorrect) {
            return { family: "UNKNOWN", confidence: "unknown", reason: "The selected method is correct." };
        }
        if (option.explicitErrorFamily) {
            return {
                family: option.explicitErrorFamily,
                confidence: option.classificationConfidence ?? "provisional",
                reason: "The selected complete working line explicitly exposes this structure.",
            };
        }
    }
    if (!math) {
        return {
            family: "UNKNOWN",
            confidence: "unknown",
            reason: "This local repair item does not expose enough subtraction structure for classification.",
        };
    }
    if (submission.selectedCommonDenominator !== undefined &&
        (submission.selectedCommonDenominator % math.left.denominator !== 0 ||
            submission.selectedCommonDenominator % math.right.denominator !== 0)) {
        return {
            family: "COMMON",
            confidence: "high",
            reason: "The chosen denominator explicitly fails at least one starting denominator.",
        };
    }
    const leftDen = submission.leftEquivalentDenominator;
    const rightDen = submission.rightEquivalentDenominator;
    const leftNum = submission.leftEquivalentNumerator;
    const rightNum = submission.rightEquivalentNumerator;
    const resultNum = submission.resultNumerator;
    const resultDen = submission.resultDenominator;
    if (leftDen !== undefined &&
        rightDen !== undefined &&
        leftDen !== rightDen) {
        return {
            family: "COMMON",
            confidence: "high",
            reason: "The converted denominators still differ.",
        };
    }
    if (leftNum !== undefined &&
        leftDen !== undefined &&
        !fractionsEquivalent({ numerator: leftNum, denominator: leftDen }, math.left)) {
        return {
            family: "SCALE",
            confidence: "high",
            reason: "The visible left rewrite is not equivalent to the original fraction.",
        };
    }
    if (rightNum !== undefined &&
        rightDen !== undefined &&
        !fractionsEquivalent({ numerator: rightNum, denominator: rightDen }, math.right)) {
        return {
            family: "SCALE",
            confidence: "high",
            reason: "The visible right rewrite is not equivalent to the original fraction.",
        };
    }
    if (resultNum !== undefined &&
        resultDen !== undefined &&
        resultNum === math.left.numerator - math.right.numerator &&
        resultDen === math.left.denominator - math.right.denominator) {
        return {
            family: "DIRECT",
            confidence: "high",
            reason: "The visible result subtracts the original numerator and denominator fields directly.",
        };
    }
    if (leftNum === math.leftEquivalent.numerator &&
        rightNum === math.rightEquivalent.numerator &&
        resultNum === rightNum - leftNum) {
        return {
            family: "ORDER",
            confidence: "high",
            reason: "The visible converted numerators were subtracted in reverse order.",
        };
    }
    if (leftNum === math.leftEquivalent.numerator &&
        rightNum === math.rightEquivalent.numerator &&
        resultDen !== undefined &&
        resultDen !== math.commonDenominator) {
        return {
            family: "DEN_KEEP",
            confidence: "high",
            reason: "The converted denominators match, but the result denominator changed.",
        };
    }
    if (leftNum === math.leftEquivalent.numerator &&
        rightNum === math.rightEquivalent.numerator &&
        resultDen === math.commonDenominator &&
        resultNum !== undefined &&
        resultNum !== math.rawDifference.numerator) {
        return {
            family: "ARITHMETIC",
            confidence: "high",
            reason: "Both equivalent rewrites and the denominator are correct; only the visible subtraction fact differs.",
        };
    }
    return {
        family: "UNKNOWN",
        confidence: "unknown",
        reason: "The response does not expose one unambiguous misconception. Use neutral feedback or a fresh discriminator.",
    };
}
function shouldSkipF1(g1, g2) {
    return [g1, g2].every((record) => record.firstAttemptCorrect &&
        record.attempts === 1 &&
        !record.hintOpenedBeforeSubmit &&
        !record.supportEscalated &&
        !record.errorFamily);
}
function confirmationsRequiredAfterIndependent(records) {
    const required = [];
    for (const record of records) {
        if (!record.hintOpenedBeforeSubmit || !record.firstAttemptCorrect)
            continue;
        if (record.questionId === "I1")
            required.push("C-DIRECT");
        if (record.questionId === "I2")
            required.push("C-CONTEXT");
        if (record.questionId === "F2")
            required.push("C-METHOD");
    }
    return [...new Set(required)];
}
const BLOCKING_FAMILIES = [
    "DIRECT",
    "SCALE",
    "COMMON",
    "ORDER",
    "DEN_KEEP",
];
function repeatedBlockingFamilies(records) {
    const counts = new Map();
    for (const record of records) {
        if (!record.errorFamily || !BLOCKING_FAMILIES.includes(record.errorFamily))
            continue;
        counts.set(record.errorFamily, (counts.get(record.errorFamily) ?? 0) + 1);
    }
    return [...counts.entries()]
        .filter(([, count]) => count >= 2)
        .map(([family]) => family);
}
function decideFinalRoute(finalRecords) {
    const primaryIds = new Set(["M1", "M2", "M3", "M4", "M5"]);
    const records = finalRecords.filter((record) => primaryIds.has(record.questionId));
    const qualifyingCorrect = records.filter((record) => record.firstAttemptCorrect &&
        !record.hintOpenedBeforeSubmit &&
        record.countsAsIndependentEvidence &&
        record.countsAsFreshEvidence);
    const correctIds = new Set(qualifyingCorrect.map((record) => record.questionId));
    const correctCount = qualifyingCorrect.length;
    const hasDirectProcedure = correctIds.has("M1") || correctIds.has("M2");
    const hasReasoningOrApplication = correctIds.has("M4") || correctIds.has("M5");
    const repeatedBlockers = repeatedBlockingFamilies(records);
    const missedFamilies = [...new Set(records
            .filter((record) => !record.firstAttemptCorrect)
            .map((record) => record.errorFamily)
            .filter((family) => Boolean(family && BLOCKING_FAMILIES.includes(family))))];
    if (correctCount >= 4 &&
        hasDirectProcedure &&
        hasReasoningOrApplication &&
        repeatedBlockers.length === 0) {
        return {
            kind: "complete",
            qualifyingCorrectCount: correctCount,
            repairFamilies: [],
            requiredFreshCount: 0,
            reason: "At least four committed first attempts are correct, direct procedure and reasoning/application evidence are present, and no blocking misconception repeats.",
        };
    }
    const repairFamilies = repeatedBlockers.length > 0 ? repeatedBlockers : missedFamilies;
    if (correctCount >= 3) {
        return {
            kind: "targeted_repair_then_two_item_check",
            qualifyingCorrectCount: correctCount,
            repairFamilies,
            requiredFreshCount: 2,
            reason: "The learner has three correct final responses, or a higher score that fails the family/repeated-blocker gate. Repair the actual missed family and require a fresh 2/2 mini-check.",
        };
    }
    return {
        kind: "targeted_repair_then_three_item_final",
        qualifyingCorrectCount: correctCount,
        repairFamilies,
        requiredFreshCount: 3,
        reason: "The learner has zero to two qualifying final responses. Repair actual weaknesses and require a fresh 3/3 final with no repeated blocker.",
    };
}
function selectUnusedRecoveryQuestions(requiredCount, targetFamilies, seenQuestionIds, seenFreshnessSignatures) {
    const seenIds = new Set(seenQuestionIds);
    const seenSignatures = new Set(seenFreshnessSignatures);
    const candidates = exports.FRA22_QUESTIONS.filter((question) => question.recoveryEligible &&
        !seenIds.has(question.id) &&
        !seenSignatures.has(getQuestionFreshnessSignature(question)));
    const selected = [];
    const add = (question) => {
        if (selected.some((item) => item.id === question.id))
            return;
        const signature = getQuestionFreshnessSignature(question);
        if (selected.some((item) => getQuestionFreshnessSignature(item) === signature))
            return;
        selected.push(question);
    };
    for (const family of targetFamilies) {
        const candidate = candidates.find((question) => question.recoveryFamilies?.includes(family));
        if (candidate)
            add(candidate);
        if (selected.length >= requiredCount)
            break;
    }
    const familyPriority = [
        "CONTEXT",
        "SELECT",
        "DIRECT",
    ];
    for (const family of familyPriority) {
        for (const candidate of candidates.filter((question) => question.family === family)) {
            add(candidate);
            if (selected.length >= requiredCount)
                break;
        }
        if (selected.length >= requiredCount)
            break;
    }
    for (const candidate of candidates) {
        add(candidate);
        if (selected.length >= requiredCount)
            break;
    }
    if (selected.length < requiredCount) {
        return {
            questionIds: selected.map((question) => question.id),
            complete: false,
            reason: "The storyboard-authored unused pool cannot satisfy the required fresh count without repeating a seen ID or ordered-subtraction signature. Do not generate a new learner item; report the source gap for owner authoring.",
        };
    }
    return {
        questionIds: selected.slice(0, requiredCount).map((question) => question.id),
        complete: true,
        reason: "Selected only storyboard-authored, recovery-eligible questions with unseen IDs and unseen ordered-subtraction signatures.",
    };
}
function validateMath(math, boundaryRole, label, normalPilotEnvelopeException) {
    const errors = [];
    if (math.left.denominator <= 0 || math.right.denominator <= 0) {
        errors.push(`${label}: starting denominators must be positive.`);
    }
    if (math.commonDenominator % math.left.denominator !== 0 ||
        math.commonDenominator % math.right.denominator !== 0) {
        errors.push(`${label}: common denominator must divide both starting denominators exactly.`);
    }
    if (!fractionsEquivalent(math.left, math.leftEquivalent)) {
        errors.push(`${label}: left equivalent fraction is not equivalent.`);
    }
    if (!fractionsEquivalent(math.right, math.rightEquivalent)) {
        errors.push(`${label}: right equivalent fraction is not equivalent.`);
    }
    if (math.rawDifference.numerator !==
        math.leftEquivalent.numerator - math.rightEquivalent.numerator) {
        errors.push(`${label}: result numerator does not equal left minus right in order.`);
    }
    if (math.rawDifference.denominator !== math.commonDenominator) {
        errors.push(`${label}: result denominator must keep the common denominator.`);
    }
    if (math.rawDifference.numerator <= 0) {
        errors.push(`${label}: pilot difference must be positive.`);
    }
    if (boundaryRole === "target_skill") {
        if (math.left.denominator === math.right.denominator) {
            errors.push(`${label}: target-skill item has matched starting denominators and belongs to FRA-20.`);
        }
        if (math.left.denominator % math.right.denominator === 0 ||
            math.right.denominator % math.left.denominator === 0) {
            errors.push(`${label}: target-skill item has a one-denominator-multiple pair and belongs to FRA-21.`);
        }
        if (math.left.denominator > 10 || math.right.denominator > 10) {
            errors.push(`${label}: starting denominator exceeds the normal pilot envelope of 10.`);
        }
        if (math.commonDenominator > 30) {
            errors.push(`${label}: common denominator exceeds the normal pilot envelope of 30.`);
        }
        if (math.leftScaleFactor > 6 || math.rightScaleFactor > 6) {
            if (!normalPilotEnvelopeException?.approvedByStoryboard) {
                errors.push(`${label}: scale factor exceeds the normal pilot envelope of 6 without an explicit storyboard exception.`);
            }
        }
        else if (normalPilotEnvelopeException) {
            errors.push(`${label}: declares a pilot-envelope exception even though both scale factors are at most 6.`);
        }
    }
    return errors;
}
function validateFRA22Spec() {
    const errors = [];
    const registry = exports.FRA22_RUNTIME_COPY;
    // 1. Runtime-copy boundary and caption/audio parity.
    const bannedRuntimeFragments = [
        "author-only",
        "assessment intent",
        "codex",
        "implementation",
        "storyboard",
        "diagnostic",
        "retrieval",
        "skip f1",
        "qa",
    ];
    for (const [id, utterance] of Object.entries(registry)) {
        if (utterance.audience !== "learner" || utterance.spokenBy !== "Ryan") {
            errors.push(`${id}: runtime utterance must be learner-facing Ryan speech.`);
        }
        if (utterance.captionSource !== "same_as_audio") {
            errors.push(`${id}: caption source must be the exact audio text.`);
        }
        const lower = utterance.text.toLowerCase();
        for (const fragment of bannedRuntimeFragments) {
            if (lower.includes(fragment)) {
                errors.push(`${id}: runtime copy leaks authoring/implementation language: ${fragment}.`);
            }
        }
    }
    // 2. Every cue binds to one legal utterance and a real spoken anchor.
    const cueIds = new Set();
    for (const cue of exports.FRA22_TIMELINE_CUES) {
        if (cueIds.has(cue.id))
            errors.push(`Duplicate cue ID: ${cue.id}.`);
        cueIds.add(cue.id);
        const utterance = registry[cue.utteranceId];
        if (!utterance) {
            errors.push(`${cue.id}: missing runtime utterance ${cue.utteranceId}.`);
            continue;
        }
        if (!utterance.text.toLowerCase().includes(cue.anchorText.toLowerCase())) {
            errors.push(`${cue.id}: anchor text is not contained in ${cue.utteranceId}.`);
        }
    }
    // 3. Scene utterance/cue references exist.
    for (const scene of exports.FRA22.teachingScenes) {
        for (const id of scene.ryanUtteranceIds) {
            if (!registry[id])
                errors.push(`${scene.id}: unknown Ryan utterance ${id}.`);
        }
        for (const id of scene.timelineCueIds) {
            if (!cueIds.has(id))
                errors.push(`${scene.id}: unknown cue ${id}.`);
        }
    }
    // 4. Question IDs, runtime references, answer/options and mathematics.
    const questionIds = new Set();
    const finalSignatures = new Set();
    for (const question of exports.FRA22_QUESTIONS) {
        if (questionIds.has(question.id))
            errors.push(`Duplicate question ID: ${question.id}.`);
        questionIds.add(question.id);
        for (const id of question.ryanBeforeSubmitUtteranceIds ?? []) {
            if (!registry[id])
                errors.push(`${question.id}: unknown pre-submit utterance ${id}.`);
        }
        for (const id of question.workedCheck?.ryanCorrectUtteranceIds ?? []) {
            if (!registry[id])
                errors.push(`${question.id}: unknown correct utterance ${id}.`);
        }
        for (const id of question.workedCheck?.ryanIncorrectUtteranceIds ?? []) {
            if (!registry[id])
                errors.push(`${question.id}: unknown incorrect utterance ${id}.`);
        }
        if (question.math) {
            errors.push(...validateMath(question.math, question.boundaryRole, question.id, question.normalPilotEnvelopeException));
        }
        if (question.options) {
            const optionIds = new Set();
            let correctCount = 0;
            for (const option of question.options) {
                if (optionIds.has(option.id))
                    errors.push(`${question.id}: duplicate option ID ${option.id}.`);
                optionIds.add(option.id);
                if (option.isCorrect)
                    correctCount += 1;
            }
            if (correctCount !== 1) {
                errors.push(`${question.id}: exactly one option must be correct; found ${correctCount}.`);
            }
            if (question.answer.kind !== "option") {
                errors.push(`${question.id}: option question must use an option answer.`);
            }
            else {
                const expectedOptionId = question.answer.optionId;
                if (!question.options.some((option) => option.id === expectedOptionId && option.isCorrect)) {
                    errors.push(`${question.id}: answer option is not the sole correct option.`);
                }
            }
        }
        if (question.stage === "final") {
            if (question.policy.hintPolicy !== "none") {
                errors.push(`${question.id}: final item must not expose a hint.`);
            }
            if (question.hint)
                errors.push(`${question.id}: final item contains a hint object.`);
            if (!question.policy.answerLocksOnSubmit) {
                errors.push(`${question.id}: final answer must lock on submit.`);
            }
            if (question.policy.solutionPolicy !== "after_locked_submit") {
                errors.push(`${question.id}: final working must be after locked submit.`);
            }
            if (!question.workedCheck) {
                errors.push(`${question.id}: final item requires a post-lock worked check.`);
            }
            if (finalSignatures.has(question.canonicalSignature)) {
                errors.push(`${question.id}: duplicate final canonical signature.`);
            }
            finalSignatures.add(question.canonicalSignature);
        }
        if (question.hint && !question.policy.hintStartsCollapsed) {
            errors.push(`${question.id}: optional hint must start collapsed.`);
        }
        if (question.hint &&
            question.answer.kind === "fraction_value" &&
            question.hint.visibleText.includes(fractionKey(question.answer.value))) {
            errors.push(`${question.id}: hint states the exact final answer.`);
        }
    }
    // 5. Repair mappings resolve to real supported and fresh questions.
    for (const [repairId, repair] of Object.entries(exports.FRA22_REPAIRS)) {
        if (!questionIds.has(repair.supportedQuestionId)) {
            errors.push(`${repairId}: missing supported question ${repair.supportedQuestionId}.`);
        }
        for (const id of repair.freshQuestionPreference) {
            if (!questionIds.has(id))
                errors.push(`${repairId}: missing fresh question ${id}.`);
        }
        for (const id of repair.ryanUtteranceIds) {
            if (!registry[id])
                errors.push(`${repairId}: missing Ryan utterance ${id}.`);
        }
    }
    // 6. Fast route and final route are structurally preserved.
    if (exports.FRA22.route.strongRoute.includes("F1")) {
        errors.push("Strong route must skip F1.");
    }
    if (!exports.FRA22.route.strongRoute.includes("F2")) {
        errors.push("Strong route must retain F2.");
    }
    const finalSequence = exports.FRA22.route.finalSequence;
    if (finalSequence.join(",") !== "M1,M2,M3,M4,M5") {
        errors.push("Primary final sequence must be M1 through M5 in order.");
    }
    // 7. Recovery uses only authored unused items; test a representative low-score pool.
    const recovery = selectUnusedRecoveryQuestions(3, ["DIRECT", "ORDER"], ["M1", "M2", "M3", "M4", "M5"], exports.FRA22_QUESTIONS.filter((q) => q.stage === "final").map((q) => getQuestionFreshnessSignature(q)));
    if (!recovery.complete || recovery.questionIds.length !== 3) {
        errors.push(`Recovery pool failed representative selection: ${recovery.reason}`);
    }
    // 8. Mathematical freshness is route-aware rather than ID-only.
    if (getQuestionFreshnessSignature("R-DIRECT-F") !==
        getQuestionFreshnessSignature("M1")) {
        errors.push("Freshness helper failed to recognise R-DIRECT-F and M1 as the same ordered subtraction.");
    }
    if (getQuestionFreshnessSignature("C-DIRECT") !==
        getQuestionFreshnessSignature("R-ORDER-F")) {
        errors.push("Freshness helper failed to recognise C-DIRECT and R-ORDER-F as the same ordered subtraction.");
    }
    const duplicateAwareRecovery = selectUnusedRecoveryQuestions(2, ["DIRECT", "ORDER"], ["M1", "C-DIRECT"], [
        getQuestionFreshnessSignature("M1"),
        getQuestionFreshnessSignature("C-DIRECT"),
    ]);
    if (duplicateAwareRecovery.questionIds.includes("R-DIRECT-F") ||
        duplicateAwareRecovery.questionIds.includes("R-ORDER-F")) {
        errors.push("Recovery selector reused a mathematically seen subtraction under a different question ID.");
    }
    // 9. Scope protection.
    if (exports.FRA22.route.diagnosticImplemented || exports.FRA22.route.retrievalImplemented) {
        errors.push("FRA22 handoff must not implement Diagnostic or Retrieval.");
    }
    return errors;
}
/**
 * Codex integration reminder:
 * Map this specification onto the existing Revily shell, store, persistence,
 * Ryan TTS/caption layer, mathematical cue system, fraction input, evidence,
 * hint, answer-lock and routing infrastructure. Do not create a second FRA22
 * application or duplicate generic engine behaviour.
 */

  window.RevilyFra22Source = module.exports;
  window.FRA22_RUNTIME_COPY = module.exports.FRA22_RUNTIME_COPY;
})();
