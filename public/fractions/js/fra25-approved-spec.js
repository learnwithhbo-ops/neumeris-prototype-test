/* Generated from the owner-approved FRA-25 LessonSpec.ts. Do not edit by hand. */
/* eslint-disable @next/next/no-assign-module-variable, @typescript-eslint/no-unused-vars */
(function () {
  "use strict";
  const exports = {};
  const module = { exports };
/**
 * FRA-25 — Simplify Before Multiplying Fractions
 * Owner-approved implementation handoff v1
 *
 * This architecture-neutral specification translates the approved FRA-25
 * storyboard into structured lesson data. It intentionally separates:
 *   1. exact learner-facing Ryan runtime copy;
 *   2. visible learner UI copy that is not automatically voiced;
 *   3. author-only mathematics, pedagogy, routing, animation and QA notes.
 *
 * HARD RUNTIME-COPY RULE
 * Ryan audio and Ryan captions may resolve only from
 * FRA25_RUNTIME_COPY[utteranceId].text. No other prose in this file, the PDF,
 * the Codex prompt or the repository may be sent to TTS or used as Ryan
 * captions unless it is first added to that registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRA25_STATIC_VALIDATION_ERRORS = exports.FRA25_LESSON_SPEC = exports.FRA25_MISCONCEPTION_MAP = exports.FRA25_OUTCOME_BINDINGS = exports.FRA25_REPLACEMENT_FINALS = exports.FRA25_REPAIRS = exports.FRA25_ALL_CORE_QUESTIONS = exports.FRA25_FINAL_QUESTIONS = exports.FRA25_CONFIRMATION_QUESTIONS = exports.FRA25_PRIMARY_QUESTIONS = exports.FRA25_SOURCE_CORRECTIONS = exports.FRA25_TEACHING_SCENES = exports.fractionsEquivalent = exports.fractionsEqual = exports.multiplyProduct = exports.reduceFraction = exports.FRA25_RUNTIME_COPY = void 0;
exports.shouldSkipF1 = shouldSkipF1;
exports.confirmationNeededAfterPractice = confirmationNeededAfterPractice;
exports.canProceedToFinal = canProceedToFinal;
exports.evaluatePrimaryFinal = evaluatePrimaryFinal;
exports.recoveryRoutePasses = recoveryRoutePasses;
exports.validateFRA25LessonSpec = validateFRA25LessonSpec;
exports.runFRA25StaticAssertions = runFRA25StaticAssertions;
/** Sole source for Ryan audio and word-timed captions. */
exports.FRA25_RUNTIME_COPY = {
    "HOOK.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "hook",
        communicationGoal: "establish_same_start_for_two_valid_routes",
        text: "Both routes start with eighteen thirty-fifths times fourteen twenty-sevenths.",
        captionSource: "same_as_audio",
    },
    "HOOK.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "hook",
        communicationGoal: "show_multiply_first_arithmetic_growth",
        text: "This route multiplies first. It creates two hundred and fifty-two over nine hundred and forty-five, then has to simplify that large fraction.",
        captionSource: "same_as_audio",
    },
    "HOOK.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "hook",
        communicationGoal: "show_two_value_preserving_reductions",
        text: "This route removes shared factors first. Eighteen and twenty-seven divide by nine. Fourteen and thirty-five divide by seven.",
        captionSource: "same_as_audio",
    },
    "HOOK.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "compare_same_answer_with_smaller_arithmetic",
        text: "Now the product is two fifths times two thirds: four fifteenths. Same answer. Less arithmetic.",
        captionSource: "same_as_audio",
    },
    "T1.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "expand_fraction_product_into_four_factor_positions",
        text: "FRA-24 already gave you the multiplication structure. Four ninths times three tenths becomes four times three over nine times ten.",
        captionSource: "same_as_audio",
    },
    "T1.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "name_two_numerator_and_two_denominator_factors",
        text: "That means the product has two numerator factors and two denominator factors.",
        captionSource: "same_as_audio",
    },
    "T1.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "define_valid_cross_cancellation_pair",
        text: "A cancellation pair must take one factor from the top and one factor from the bottom.",
        captionSource: "same_as_audio",
    },
    "T2.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "identify_shared_factor_two",
        text: "Four and ten share a factor of two.",
        captionSource: "same_as_audio",
    },
    "T2.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "apply_same_exact_divisor_to_both_values",
        text: "Divide both numbers by the same two: four becomes two, and ten becomes five.",
        captionSource: "same_as_audio",
    },
    "T2.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "reject_magic_eraser_model",
        text: "Nothing has disappeared. We have replaced the pair four over ten with the equivalent pair two over five inside the product.",
        captionSource: "same_as_audio",
    },
    "T2.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "state_value_preservation_invariant",
        text: "That shared division keeps the product value unchanged.",
        captionSource: "same_as_audio",
    },
    "T3.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_second_factor_check",
        text: "Now check the remaining factors.",
        captionSource: "same_as_audio",
    },
    "T3.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "show_second_shared_division",
        text: "Three and nine share three, so divide both by three: three becomes one and nine becomes three.",
        captionSource: "same_as_audio",
    },
    "T3.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "read_remaining_factors",
        text: "The numbers left are two times one over three times five.",
        captionSource: "same_as_audio",
    },
    "T3.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "finish_product_and_check_simplest_form",
        text: "Multiply those smaller numbers. The answer is two fifteenths, and it is already in simplest form.",
        captionSource: "same_as_audio",
    },
    "T4.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "remove_false_single_route_requirement",
        text: "You do not have to cancel in one special order.",
        captionSource: "same_as_audio",
    },
    "T4.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "show_within_factor_first_route",
        text: "With twelve eighteenths times five fourteenths, one route simplifies twelve eighteenths first, then cancels two with fourteen.",
        captionSource: "same_as_audio",
    },
    "T4.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "show_cross_cancel_first_route",
        text: "Another route cancels twelve with fourteen first, then simplifies six with eighteen.",
        captionSource: "same_as_audio",
    },
    "T4.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "state_route_invariance",
        text: "Both routes divide numerator and denominator factors by shared factors, so both finish at five twenty-firsts.",
        captionSource: "same_as_audio",
    },
    "T5.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "state_complete_factor_boundary",
        text: "Cancellation works with complete factors joined by multiplication.",
        captionSource: "same_as_audio",
    },
    "T5.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "protect_term_inside_sum",
        text: "A number inside three plus five is only one term of a sum. It is not a factor of the whole numerator, so it cannot be cancelled on its own.",
        captionSource: "same_as_audio",
    },
    "T5.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "generalise",
        communicationGoal: "normalise_correct_no_cancellation_decision",
        text: "And if no numerator factor shares a factor greater than one with any denominator factor, multiply as written.",
        captionSource: "same_as_audio",
    },
    "HANDOFF.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "handoff",
        communicationGoal: "summarise_valid_cancellation_invariant",
        text: "You know what makes a cancellation valid: one numerator factor, one denominator factor, and the same divisor on both.",
        captionSource: "same_as_audio",
    },
    "HANDOFF.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "handoff",
        communicationGoal: "transfer_responsibility",
        text: "I will stay with you for two examples. Then the support starts to fade.",
        captionSource: "same_as_audio",
    },
    "G1.BEFORE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "ask_for_pair_and_shared_factor_before_rewrite",
        text: "Choose one numerator-denominator pair. Tell me the shared factor before you change either number.",
        captionSource: "same_as_audio",
    },
    "G1.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_two_shared_divisions_then_finish",
        text: "Yes. Both cancellations used one shared division. Now multiply the smaller factors: four fifths.",
        captionSource: "same_as_audio",
    },
    "G1.SHARED_REDIRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "require_matched_quotient_change",
        text: "That pair has only changed on one side. Divide fourteen by the same seven.",
        captionSource: "same_as_audio",
    },
    "G2.BEFORE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "check_all_cross_pairs_for_shared_factor",
        text: "Check every numerator against every denominator. Is there a shared factor greater than one?",
        captionSource: "same_as_audio",
    },
    "G2.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_no_cancel_boundary_and_product",
        text: "Right. None of the cross pairs shares a factor greater than one, so the efficient choice is to multiply: thirty-five seventy-seconds.",
        captionSource: "same_as_audio",
    },
    "F2.BEFORE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "preserve_pair_validity_reasoning_before_explanation",
        text: "Choose first. I will explain the pair after your answer is locked.",
        captionSource: "same_as_audio",
    },
    "INDEPENDENT.TRANSITION": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "handoff",
        communicationGoal: "introduce_collapsed_optional_hint",
        text: "Now you take over. A hint is there if you need it, but it stays closed unless you ask.",
        captionSource: "same_as_audio",
    },
    "I1.BEFORE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "keep_hint_learner_controlled",
        text: "Use the hint only if you decide you need it.",
        captionSource: "same_as_audio",
    },
    "HINT.CONFIRMATION": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "handoff",
        communicationGoal: "explain_fresh_no_hint_confirmation",
        text: "Using a hint is still useful learning. I will check the same idea once more without help before the final.",
        captionSource: "same_as_audio",
    },
    "FINAL.INTRO": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "handoff",
        communicationGoal: "introduce_five_unsupported_final_items",
        text: "These last five are yours. No hints this time. Do the question first, then I will show you the working so you can check your thinking.",
        captionSource: "same_as_audio",
    },
    "FINAL.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "acknowledge_correct_before_worked_check",
        text: "That is right. Here is the working so you can check.",
        captionSource: "same_as_audio",
    },
    "FINAL.INCORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "redirect_incorrect_before_worked_check",
        text: "Not quite. Here is the working - compare it with what you did.",
        captionSource: "same_as_audio",
    },
    "R-PAIR.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "reject_same_side_cancellation",
        text: "These two numbers are both numerator factors, so cancelling them would change the numerator without matching the denominator.",
        captionSource: "same_as_audio",
    },
    "R-PAIR.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "restate_valid_cross_line_pair",
        text: "A valid pair crosses the fraction line: one numerator factor and one denominator factor.",
        captionSource: "same_as_audio",
    },
    "R-PAIR.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "model_valid_pair_then_finish",
        text: "Here, cancel six with fourteen by two. Then multiply the factors left.",
        captionSource: "same_as_audio",
    },
    "R-SHARED.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "identify_one_sided_change",
        text: "You found a useful pair, but only one side changed.",
        captionSource: "same_as_audio",
    },
    "R-SHARED.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "require_same_divisor_on_both_numbers",
        text: "Cancellation is one shared division. If seven and fourteen cancel by seven, divide both by seven.",
        captionSource: "same_as_audio",
    },
    "R-SHARED.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "connect_matched_quotients_to_value_preservation",
        text: "Seven becomes one. Fourteen becomes two. That matched change is what preserves the product.",
        captionSource: "same_as_audio",
    },
    "R-TERM.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "locate_term_inside_sum",
        text: "The five is inside three plus five.",
        captionSource: "same_as_audio",
    },
    "R-TERM.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "distinguish_term_from_factor",
        text: "That means it is one term of a sum, not a factor multiplying the whole numerator.",
        captionSource: "same_as_audio",
    },
    "R-TERM.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "protect_complete_bracket_factor",
        text: "Treat the bracket as one complete piece. Evaluate it first: three plus five is eight.",
        captionSource: "same_as_audio",
    },
    "R-TERM.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "resume_valid_factor_cancellation",
        text: "Now the product is eight twelfths times nine tenths, and valid factor cancellations can begin.",
        captionSource: "same_as_audio",
    },
    "R-NONE.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "state_when_cancellation_is_useful",
        text: "Cancellation is useful only when a numerator factor and a denominator factor share a factor greater than one.",
        captionSource: "same_as_audio",
    },
    "R-NONE.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "check_all_cross_pairs",
        text: "Check five and seven against eight and nine. None of those pairs has a shared factor greater than one.",
        captionSource: "same_as_audio",
    },
    "R-NONE.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "choose_multiply_as_written",
        text: "So the correct next step is to multiply as written.",
        captionSource: "same_as_audio",
    },
    "R-FINISH.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "acknowledge_correct_reduction",
        text: "You have made the factors smaller correctly.",
        captionSource: "same_as_audio",
    },
    "R-FINISH.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "require_remaining_multiplication",
        text: "Now finish the product. Multiply the numerator factors left, then the denominator factors left.",
        captionSource: "same_as_audio",
    },
    "R-FINISH.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "require_final_simplest_form_check",
        text: "After that, check whether the final fraction is in simplest form.",
        captionSource: "same_as_audio",
    },
    "ARITHMETIC.REDIRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "protect_secure_structure_from_overclassification",
        text: "Your structure is right. Recheck that exact number fact.",
        captionSource: "same_as_audio",
    },
    "UNKNOWN.REDIRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "request_discriminating_visible_method",
        text: "Show the pair you used and the divisor.",
        captionSource: "same_as_audio",
    },
    "COMPLETE.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "completion",
        communicationGoal: "summarise_skill_and_complete_current_lesson",
        text: "Good work. You can now simplify fraction products before multiplying, while keeping the value unchanged. That is FRA-25 done.",
        captionSource: "same_as_audio",
    },
};
const fraction = (numerator, denominator) => ({ numerator, denominator });
const product = (a, b, c, d) => ({
    left: fraction(a, b),
    right: fraction(c, d),
});
const gcd = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0)
        [x, y] = [y, x % y];
    return x;
};
const reduceFraction = (value) => {
    if (value.denominator === 0)
        return value;
    const sign = value.denominator < 0 ? -1 : 1;
    const divisor = gcd(value.numerator, value.denominator) || 1;
    return {
        numerator: sign * (value.numerator / divisor),
        denominator: sign * (value.denominator / divisor),
    };
};
exports.reduceFraction = reduceFraction;
const multiplyProduct = (value) => (0, exports.reduceFraction)(fraction(value.left.numerator * value.right.numerator, value.left.denominator * value.right.denominator));
exports.multiplyProduct = multiplyProduct;
const fractionsEqual = (a, b) => a.numerator === b.numerator && a.denominator === b.denominator;
exports.fractionsEqual = fractionsEqual;
const fractionsEquivalent = (a, b) => a.denominator !== 0 && b.denominator !== 0 && a.numerator * b.denominator === b.numerator * a.denominator;
exports.fractionsEquivalent = fractionsEquivalent;
const finalPolicy = {
    scored: true,
    firstAttemptIsAuthoritative: true,
    eligibleForIndependentMastery: true,
    answerLocksOnSubmit: true,
    hintPolicy: "none",
    solutionPolicy: "after_locked_submit",
    requiresFreshNoHintConfirmationIfHintUsed: false,
    playExactlyOneOutcomeBranch: true,
    doNotPlayDefaultAfterErrorSpecific: true,
};
const independentPolicy = {
    scored: true,
    firstAttemptIsAuthoritative: true,
    eligibleForIndependentMastery: true,
    answerLocksOnSubmit: true,
    hintPolicy: "optional",
    solutionPolicy: "after_response",
    requiresFreshNoHintConfirmationIfHintUsed: true,
    playExactlyOneOutcomeBranch: true,
    doNotPlayDefaultAfterErrorSpecific: true,
};
const fadedPolicy = {
    scored: true,
    firstAttemptIsAuthoritative: true,
    eligibleForIndependentMastery: false,
    answerLocksOnSubmit: true,
    hintPolicy: "optional",
    solutionPolicy: "after_response",
    requiresFreshNoHintConfirmationIfHintUsed: true,
    playExactlyOneOutcomeBranch: true,
    doNotPlayDefaultAfterErrorSpecific: true,
};
const guidedPolicy = {
    scored: true,
    firstAttemptIsAuthoritative: true,
    eligibleForIndependentMastery: false,
    answerLocksOnSubmit: false,
    hintPolicy: "guided",
    solutionPolicy: "after_response",
    requiresFreshNoHintConfirmationIfHintUsed: false,
    playExactlyOneOutcomeBranch: true,
    doNotPlayDefaultAfterErrorSpecific: true,
};
const confirmationPolicy = {
    ...finalPolicy,
    solutionPolicy: "after_locked_submit",
};
const HOOK_PRODUCT = {
    factors: product(18, 35, 14, 27),
    expectedFinal: fraction(4, 15),
    approvedCancellationRoutes: [
        {
            id: "hook_route_simplify_first",
            steps: [
                {
                    id: "hook_18_27_by_9",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 9,
                    numeratorBefore: 18,
                    denominatorBefore: 27,
                    numeratorAfter: 2,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Cross-cancel 18 and 27 by their shared factor 9.",
                },
                {
                    id: "hook_14_35_by_7",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 7,
                    numeratorBefore: 14,
                    denominatorBefore: 35,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Cross-cancel 14 and 35 by their shared factor 7.",
                },
            ],
            reducedProduct: { left: fraction(2, 5), right: fraction(2, 3) },
            final: fraction(4, 15),
        },
    ],
    noUsefulCancellation: false,
};
const TEACH_PRODUCT = {
    factors: product(4, 9, 3, 10),
    expectedFinal: fraction(2, 15),
    approvedCancellationRoutes: [
        {
            id: "teach_two_cross_pairs",
            steps: [
                {
                    id: "teach_4_10_by_2",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 2,
                    numeratorBefore: 4,
                    denominatorBefore: 10,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "First shared division shown in T2.",
                },
                {
                    id: "teach_3_9_by_3",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 3,
                    numeratorBefore: 3,
                    denominatorBefore: 9,
                    numeratorAfter: 1,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Second shared division shown in T3.",
                },
            ],
            reducedProduct: { left: fraction(2, 3), right: fraction(1, 5) },
            final: fraction(2, 15),
        },
    ],
    noUsefulCancellation: false,
};
const ROUTE_PRODUCT = {
    factors: product(12, 18, 5, 14),
    expectedFinal: fraction(5, 21),
    approvedCancellationRoutes: [
        {
            id: "within_factor_then_cross",
            steps: [
                {
                    id: "route_a_12_18_by_6",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 6,
                    numeratorBefore: 12,
                    denominatorBefore: 18,
                    numeratorAfter: 2,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Known FRA-10 simplification inside the left factor.",
                },
                {
                    id: "route_a_2_14_by_2",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 2,
                    numeratorBefore: 2,
                    denominatorBefore: 14,
                    numeratorAfter: 1,
                    denominatorAfter: 7,
                    authorOnlyRationale: "Then cross-cancel the new numerator factor 2 with 14.",
                },
            ],
            reducedProduct: { left: fraction(1, 3), right: fraction(5, 7) },
            final: fraction(5, 21),
        },
        {
            id: "cross_then_within_factor",
            steps: [
                {
                    id: "route_b_12_14_by_2",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 2,
                    numeratorBefore: 12,
                    denominatorBefore: 14,
                    numeratorAfter: 6,
                    denominatorAfter: 7,
                    authorOnlyRationale: "Cross-cancel 12 with 14 first.",
                },
                {
                    id: "route_b_6_18_by_6",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 6,
                    numeratorBefore: 6,
                    denominatorBefore: 18,
                    numeratorAfter: 1,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Then simplify 6/18 within the left factor.",
                },
            ],
            reducedProduct: { left: fraction(1, 3), right: fraction(5, 7) },
            final: fraction(5, 21),
        },
    ],
    noUsefulCancellation: false,
};
const NO_CANCEL_PRODUCT = {
    factors: product(5, 8, 7, 9),
    expectedFinal: fraction(35, 72),
    approvedCancellationRoutes: [],
    noUsefulCancellation: true,
};
const TERM_PRODUCT = {
    factors: product(8, 12, 9, 10),
    expectedFinal: fraction(3, 5),
    approvedCancellationRoutes: [
        {
            id: "evaluate_bracket_then_cancel",
            steps: [
                {
                    id: "term_8_10_by_2",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 2,
                    numeratorBefore: 8,
                    denominatorBefore: 10,
                    numeratorAfter: 4,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Only after (3+5) is evaluated as the complete factor 8.",
                },
                {
                    id: "term_9_12_by_3",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 3,
                    numeratorBefore: 9,
                    denominatorBefore: 12,
                    numeratorAfter: 3,
                    denominatorAfter: 4,
                    authorOnlyRationale: "Second valid complete-factor cancellation.",
                },
            ],
            reducedProduct: { left: fraction(4, 4), right: fraction(3, 5) },
            final: fraction(3, 5),
        },
    ],
    noUsefulCancellation: false,
    containsAdditiveTerm: true,
    authorOnlyNotes: [
        "The learner-visible original expression is (3 + 5)/12 × 9/10.",
        "The 5 inside the bracket is not a complete factor and may not be cancelled alone.",
    ],
};
exports.FRA25_TEACHING_SCENES = [
    {
        id: "HOOK",
        stage: "hook",
        purpose: "Create a genuine efficiency conflict between multiply-first and simplify-first routes.",
        utteranceIds: ["HOOK.1", "HOOK.2", "HOOK.3", "HOOK.4"],
        visual: {
            kind: "two_route_product",
            math: HOOK_PRODUCT,
            visibleExpression: "18/35 × 14/27",
            beforeSubmitState: [
                "Both route cards begin with the same product.",
                "Multiply-first route shows 252/945 then 4/15.",
                "Simplify-first route shows ÷9 and ÷7 reductions, then 2/5 × 2/3 = 4/15.",
            ],
            accessibleDescriptionBeforeSubmit: "Two side-by-side calculation routes begin with eighteen thirty-fifths times fourteen twenty-sevenths. One multiplies to a large fraction before simplifying; the other divides cross numerator-denominator pairs first. Both finish at four fifteenths.",
            authorOnlyNotes: [
                "The non-scored preference choice does not award evidence.",
                "Do not describe one route as wrong; both are mathematically valid.",
            ],
        },
        timedVisualEvents: [
            {
                id: "HOOK.CUE.START",
                utteranceId: "HOOK.1",
                anchorText: "Both routes start",
                authorOnlyAction: "Reveal the same 18/35 × 14/27 expression at the top of both route cards.",
                targetIds: ["hook-route-a-start", "hook-route-b-start"],
                reducedMotionEquivalent: "Both start expressions appear simultaneously without movement.",
            },
            {
                id: "HOOK.CUE.MULTIPLY",
                utteranceId: "HOOK.2",
                anchorText: "two hundred and fifty-two",
                authorOnlyAction: "Reveal 18×14=252, 35×27=945, then 252/945.",
                targetIds: ["hook-route-a-numerator", "hook-route-a-denominator", "hook-route-a-product"],
                reducedMotionEquivalent: "Reveal each complete mathematical state at the phrase anchor.",
            },
            {
                id: "HOOK.CUE.DIVIDE9",
                utteranceId: "HOOK.3",
                anchorText: "divide by nine",
                authorOnlyAction: "Show matched cancellation marks and quotient labels 18→2 and 27→3.",
                targetIds: ["hook-18", "hook-27", "hook-q2", "hook-q3"],
                reducedMotionEquivalent: "Show original values, divisor 9 and both quotients together.",
            },
            {
                id: "HOOK.CUE.DIVIDE7",
                utteranceId: "HOOK.3",
                anchorText: "divide by seven",
                authorOnlyAction: "Show matched cancellation marks and quotient labels 14→2 and 35→5.",
                targetIds: ["hook-14", "hook-35", "hook-q2b", "hook-q5"],
                reducedMotionEquivalent: "Show original values, divisor 7 and both quotients together.",
            },
            {
                id: "HOOK.CUE.FINISH",
                utteranceId: "HOOK.4",
                anchorText: "four fifteenths",
                authorOnlyAction: "Align both 4/15 answers and connect them with a same-start/same-finish marker.",
                targetIds: ["hook-route-a-final", "hook-route-b-final"],
                reducedMotionEquivalent: "Both final answers receive the same non-motion emphasis.",
            },
        ],
        interaction: "non_scored_preference",
        understandingAfterScene: "Simplifying first can preserve the same product while reducing the arithmetic.",
    },
    {
        id: "T1",
        stage: "teach",
        purpose: "Expose the four factor positions and establish the top-to-bottom pair rule.",
        utteranceIds: ["T1.1", "T1.2", "T1.3"],
        visual: {
            kind: "four_factor_grid",
            math: TEACH_PRODUCT,
            visibleExpression: "4/9 × 3/10 = (4 × 3)/(9 × 10)",
            beforeSubmitState: [
                "The compact product appears before any cancellation marks.",
                "4 and 3 occupy the numerator row; 9 and 10 occupy the denominator row.",
                "Only after the rule is spoken do 4 and 10 receive matching outlines.",
            ],
            accessibleDescriptionBeforeSubmit: "Four ninths times three tenths is displayed as four times three above nine times ten. Four and three are numerator factors; nine and ten are denominator factors.",
            authorOnlyNotes: ["Do not preview a same-side cancellation as plausible."],
        },
        timedVisualEvents: [
            {
                id: "T1.CUE.EXPAND",
                utteranceId: "T1.1",
                anchorText: "four times three over nine times ten",
                authorOnlyAction: "Transform the compact product into a two-row four-factor grid.",
                targetIds: ["t1-n1", "t1-n2", "t1-d1", "t1-d2"],
                reducedMotionEquivalent: "Replace the compact product with the complete factor grid.",
            },
            {
                id: "T1.CUE.NUMERATORS",
                utteranceId: "T1.2",
                anchorText: "two numerator factors",
                authorOnlyAction: "Emphasise the entire numerator row, not one isolated number.",
                targetIds: ["t1-numerator-row"],
                reducedMotionEquivalent: "Apply a static outline and label to the numerator row.",
            },
            {
                id: "T1.CUE.DENOMINATORS",
                utteranceId: "T1.2",
                anchorText: "two denominator factors",
                authorOnlyAction: "Emphasise the entire denominator row.",
                targetIds: ["t1-denominator-row"],
                reducedMotionEquivalent: "Apply a static outline and label to the denominator row.",
            },
            {
                id: "T1.CUE.PAIR",
                utteranceId: "T1.3",
                anchorText: "one factor from the top and one factor from the bottom",
                authorOnlyAction: "Connect 4 and 10 as a possible pair using a non-colour matching cue.",
                targetIds: ["t1-n1", "t1-d2", "t1-pair-connector"],
                reducedMotionEquivalent: "Reveal a static connector and matching pair labels.",
            },
        ],
        interaction: "none",
        understandingAfterScene: "A valid cancellation pair contains one numerator factor and one denominator factor.",
    },
    {
        id: "T2",
        stage: "teach",
        purpose: "Show cancellation as one shared exact division, not erasure.",
        utteranceIds: ["T2.1", "T2.2", "T2.3", "T2.4"],
        visual: {
            kind: "shared_division_rewrite",
            math: TEACH_PRODUCT,
            visibleExpression: "4/9 × 3/10 → 2/9 × 3/5",
            beforeSubmitState: [
                "4 and 10 remain visible with strike marks.",
                "The central divisor 2 appears before quotient labels 2 and 5.",
                "Both old values and both quotients remain readable in the completed state.",
            ],
            accessibleDescriptionBeforeSubmit: "Four and ten are the selected cross numerator-denominator pair. Both are divided by two, producing two and five while the other factors remain nine and three.",
            authorOnlyNotes: ["Never animate values disappearing without showing the same divisor and both quotients."],
        },
        timedVisualEvents: [
            {
                id: "T2.CUE.SHARED",
                utteranceId: "T2.1",
                anchorText: "share a factor of two",
                authorOnlyAction: "Reveal the shared-factor tile 2 between 4 and 10.",
                targetIds: ["t2-divisor-2"],
                reducedMotionEquivalent: "Show a static divisor tile and both pair outlines.",
            },
            {
                id: "T2.CUE.QUOTIENTS",
                utteranceId: "T2.2",
                anchorText: "four becomes two, and ten becomes five",
                authorOnlyAction: "Reveal 4÷2=2 and 10÷2=5 in speech order.",
                targetIds: ["t2-q2", "t2-q5"],
                reducedMotionEquivalent: "Show the two exact division equations in the final state.",
            },
            {
                id: "T2.CUE.EQUIVALENT_PAIR",
                utteranceId: "T2.3",
                anchorText: "equivalent pair two over five",
                authorOnlyAction: "Group old pair 4/10 and replacement pair 2/5 with an equivalence connector.",
                targetIds: ["t2-old-pair", "t2-new-pair"],
                reducedMotionEquivalent: "Show the grouped old and new pair with an equals marker.",
            },
        ],
        interaction: "none",
        understandingAfterScene: "Both members of a valid pair are divided by the same exact factor, preserving value.",
    },
    {
        id: "T3",
        stage: "teach",
        purpose: "Repeat the check, multiply remaining factors and finish in simplest form.",
        utteranceIds: ["T3.1", "T3.2", "T3.3", "T3.4"],
        visual: {
            kind: "remaining_factor_check",
            math: TEACH_PRODUCT,
            visibleExpression: "4/9 × 3/10 → 2/9 × 3/5 → 2/3 × 1/5 → 2/15",
            beforeSubmitState: [
                "The current 2/9 × 3/5 state appears first.",
                "3 and 9 divide by the same 3, becoming 1 and 3.",
                "The remaining factors then multiply to 2/15.",
            ],
            accessibleDescriptionBeforeSubmit: "After the first reduction, two ninths times three fifths remains. Three and nine divide by three, leaving two thirds times one fifth, which multiplies to two fifteenths.",
            authorOnlyNotes: ["The final simplest-form check is visible only after multiplication."],
        },
        timedVisualEvents: [
            {
                id: "T3.CUE.SECOND_PAIR",
                utteranceId: "T3.2",
                anchorText: "Three and nine share three",
                authorOnlyAction: "Connect numerator 3 with denominator 9 and reveal divisor 3.",
                targetIds: ["t3-n3", "t3-d9", "t3-divisor-3"],
                reducedMotionEquivalent: "Reveal static pair outlines and divisor 3.",
            },
            {
                id: "T3.CUE.SECOND_QUOTIENTS",
                utteranceId: "T3.2",
                anchorText: "three becomes one and nine becomes three",
                authorOnlyAction: "Reveal quotient labels 1 and 3 in spoken order.",
                targetIds: ["t3-q1", "t3-q3"],
                reducedMotionEquivalent: "Show both exact division equations.",
            },
            {
                id: "T3.CUE.LEFTOVERS",
                utteranceId: "T3.3",
                anchorText: "two times one over three times five",
                authorOnlyAction: "Recompose the remaining factors as (2×1)/(3×5).",
                targetIds: ["t3-leftover-product"],
                reducedMotionEquivalent: "Replace reduced factor grid with the complete leftover product.",
            },
            {
                id: "T3.CUE.FINAL",
                utteranceId: "T3.4",
                anchorText: "two fifteenths",
                authorOnlyAction: "Reveal 2/15 and a concise simplest-form check.",
                targetIds: ["t3-final"],
                reducedMotionEquivalent: "Show 2/15 and the final check without motion.",
            },
        ],
        interaction: "none",
        understandingAfterScene: "Cancellation makes factors smaller but does not replace the final multiplication and simplification check.",
    },
    {
        id: "T4",
        stage: "teach",
        purpose: "Show that valid cancellation order can vary while the invariant remains fixed.",
        utteranceIds: ["T4.1", "T4.2", "T4.3", "T4.4"],
        visual: {
            kind: "parallel_valid_routes",
            math: ROUTE_PRODUCT,
            visibleExpression: "12/18 × 5/14",
            beforeSubmitState: [
                "Route A simplifies 12/18 by 6, then cancels 2 with 14 by 2.",
                "Route B cancels 12 with 14 by 2, then simplifies 6/18 by 6.",
                "Both routes finish at 1/3 × 5/7 = 5/21.",
            ],
            accessibleDescriptionBeforeSubmit: "Two valid routes are shown for twelve eighteenths times five fourteenths. One simplifies the left fraction first; the other cross-cancels first. Both leave one third times five sevenths and finish at five twenty-firsts.",
            authorOnlyNotes: ["Do not imply that left-to-right order is required."],
        },
        timedVisualEvents: [
            {
                id: "T4.CUE.ROUTE_A",
                utteranceId: "T4.2",
                anchorText: "simplifies twelve eighteenths first",
                authorOnlyAction: "Build Route A one exact shared division at a time.",
                targetIds: ["t4-route-a"],
                reducedMotionEquivalent: "Reveal Route A as successive complete states.",
            },
            {
                id: "T4.CUE.ROUTE_B",
                utteranceId: "T4.3",
                anchorText: "cancels twelve with fourteen first",
                authorOnlyAction: "Build Route B one exact shared division at a time.",
                targetIds: ["t4-route-b"],
                reducedMotionEquivalent: "Reveal Route B as successive complete states.",
            },
            {
                id: "T4.CUE.SAME_FINISH",
                utteranceId: "T4.4",
                anchorText: "both finish at five twenty-firsts",
                authorOnlyAction: "Align the two 5/21 results and display the invariant statement.",
                targetIds: ["t4-route-a-final", "t4-route-b-final"],
                reducedMotionEquivalent: "Apply the same static completion marker to both results.",
            },
        ],
        interaction: "none",
        understandingAfterScene: "Any route is valid when every reduction uses a shared exact division across numerator and denominator factors.",
    },
    {
        id: "T5",
        stage: "teach",
        purpose: "Protect complete factors from term cancellation and establish the correct no-cancel boundary.",
        utteranceIds: ["T5.1", "T5.2", "T5.3"],
        visual: {
            kind: "term_vs_factor_contrast",
            math: TERM_PRODUCT,
            visibleExpression: "(3 + 5)/12 × 9/10   contrasted with   5/8 × 7/9",
            beforeSubmitState: [
                "The bracket (3+5) is outlined as one complete numerator factor.",
                "The individual 5 is labelled as a term and its attempted cancellation with 10 is rejected.",
                "The four cross pairs in 5/8 × 7/9 are checked and all share only 1.",
            ],
            accessibleDescriptionBeforeSubmit: "The first product has a numerator factor written as three plus five in brackets; the five alone is only one term. The second product, five eighths times seven ninths, has no cross numerator-denominator pair with a shared factor greater than one.",
            authorOnlyNotes: ["This is a numeric boundary check, not an algebraic-fractions lesson."],
        },
        timedVisualEvents: [
            {
                id: "T5.CUE.COMPLETE_FACTORS",
                utteranceId: "T5.1",
                anchorText: "complete factors joined by multiplication",
                authorOnlyAction: "Outline complete factors and multiplication joins; do not isolate additive terms as draggable factors.",
                targetIds: ["t5-complete-factor-bracket", "t5-multiplication-join"],
                reducedMotionEquivalent: "Show static complete-factor boundaries.",
            },
            {
                id: "T5.CUE.TERM",
                utteranceId: "T5.2",
                anchorText: "only one term of a sum",
                authorOnlyAction: "Label the 5 as TERM and cross out only the proposed illegal cancellation mark.",
                targetIds: ["t5-term-5", "t5-invalid-cancel"],
                reducedMotionEquivalent: "Show a static TERM label and invalid marker.",
            },
            {
                id: "T5.CUE.NO_CANCEL",
                utteranceId: "T5.3",
                anchorText: "multiply as written",
                authorOnlyAction: "Complete the four cross-pair checks, then reveal 35/72.",
                targetIds: ["t5-no-cancel-grid", "t5-no-cancel-final"],
                reducedMotionEquivalent: "Show all four shared-factor-1 results and final product.",
            },
        ],
        interaction: "none",
        understandingAfterScene: "Only complete multiplicative factors may cancel, and sometimes no cancellation is available.",
    },
    {
        id: "HANDOFF",
        stage: "teach",
        purpose: "Summarise the invariant and move from demonstration to learner control.",
        utteranceIds: ["HANDOFF.1", "HANDOFF.2"],
        visual: {
            kind: "four_factor_grid",
            visibleExpression: "one numerator factor ↔ one denominator factor; same divisor on both",
            beforeSubmitState: [
                "A compact three-part invariant card appears.",
                "The stage label changes from Learn the idea to Try it with me.",
            ],
            accessibleDescriptionBeforeSubmit: "A summary states that a valid cancellation uses one numerator factor, one denominator factor and the same divisor on both.",
            authorOnlyNotes: ["Guided success is evidence but cannot complete the lesson."],
        },
        timedVisualEvents: [],
        interaction: "none",
        understandingAfterScene: "The learner is ready to select valid pairs, use shared divisors and finish products.",
    },
];
exports.FRA25_SOURCE_CORRECTIONS = [
    {
        id: "F2_PAIR_VALIDITY_CORRECTION",
        source: "Revily_FRA-25_Storyboard_v1.pdf page 18",
        issue: "The storyboard labels 'Divide 8 and 14 by 2' as valid in 8/21 × 14/15, but 8 and 14 are both numerator factors. That would change the product and contradict the lesson's own top-to-bottom invariant.",
        implementationResolution: "Keep the expression 8/21 × 14/15 and assessment intent, but use the unique valid first cancellation: divide numerator factor 14 and denominator factor 21 by 7.",
        ownerReviewStatus: "Safety correction applied in the handoff rather than silently implementing invalid mathematics. The discrepancy is also called out in the validation report and Codex prompt.",
    },
];
const G1_PRODUCT = {
    factors: product(6, 7, 14, 15),
    expectedFinal: fraction(4, 5),
    approvedCancellationRoutes: [
        {
            id: "g1_route",
            steps: [
                {
                    id: "g1_14_7_by_7",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 7,
                    numeratorBefore: 14,
                    denominatorBefore: 7,
                    numeratorAfter: 2,
                    denominatorAfter: 1,
                    authorOnlyRationale: "Guided top-to-bottom cancellation.",
                },
                {
                    id: "g1_6_15_by_3",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 3,
                    numeratorBefore: 6,
                    denominatorBefore: 15,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Second guided cancellation.",
                },
            ],
            reducedProduct: { left: fraction(2, 1), right: fraction(2, 5) },
            final: fraction(4, 5),
        },
    ],
    noUsefulCancellation: false,
};
const F1_PRODUCT = {
    factors: product(7, 12, 8, 15),
    expectedFinal: fraction(14, 45),
    approvedCancellationRoutes: [
        {
            id: "f1_route",
            steps: [
                {
                    id: "f1_8_12_by_4",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 4,
                    numeratorBefore: 8,
                    denominatorBefore: 12,
                    numeratorAfter: 2,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Only useful pre-multiplication cancellation.",
                },
            ],
            reducedProduct: { left: fraction(7, 3), right: fraction(2, 15) },
            final: fraction(14, 45),
        },
    ],
    noUsefulCancellation: false,
};
const F2_PRODUCT = {
    factors: product(8, 21, 14, 15),
    expectedFinal: fraction(16, 45),
    approvedCancellationRoutes: [
        {
            id: "f2_corrected_route",
            steps: [
                {
                    id: "f2_14_21_by_7",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 7,
                    numeratorBefore: 14,
                    denominatorBefore: 21,
                    numeratorAfter: 2,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Unique valid first cancellation after correcting the source contradiction.",
                },
            ],
            reducedProduct: { left: fraction(8, 3), right: fraction(2, 15) },
            final: fraction(16, 45),
        },
    ],
    noUsefulCancellation: false,
    authorOnlyNotes: ["See FRA25_SOURCE_CORRECTIONS.F2_PAIR_VALIDITY_CORRECTION."],
};
const I1_PRODUCT = {
    factors: product(12, 25, 15, 16),
    expectedFinal: fraction(9, 20),
    approvedCancellationRoutes: [
        {
            id: "i1_route",
            steps: [
                {
                    id: "i1_12_16_by_4",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 4,
                    numeratorBefore: 12,
                    denominatorBefore: 16,
                    numeratorAfter: 3,
                    denominatorAfter: 4,
                    authorOnlyRationale: "First independent pair.",
                },
                {
                    id: "i1_15_25_by_5",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 5,
                    numeratorBefore: 15,
                    denominatorBefore: 25,
                    numeratorAfter: 3,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Second independent pair.",
                },
            ],
            reducedProduct: { left: fraction(3, 5), right: fraction(3, 4) },
            final: fraction(9, 20),
        },
    ],
    noUsefulCancellation: false,
};
const I2_PRODUCT = {
    factors: product(6, 7, 15, 14),
    expectedFinal: fraction(45, 49),
    approvedCancellationRoutes: [
        {
            id: "i2_valid_route",
            steps: [
                {
                    id: "i2_6_14_by_2",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 2,
                    numeratorBefore: 6,
                    denominatorBefore: 14,
                    numeratorAfter: 3,
                    denominatorAfter: 7,
                    authorOnlyRationale: "Valid contrast to the student's illegal same-side 6-and-15 cancellation.",
                },
            ],
            reducedProduct: { left: fraction(3, 7), right: fraction(15, 7) },
            final: fraction(45, 49),
        },
    ],
    noUsefulCancellation: false,
};
const C_DIRECT_PRODUCT = {
    factors: product(10, 21, 14, 25),
    expectedFinal: fraction(4, 15),
    approvedCancellationRoutes: [
        {
            id: "c_direct_route",
            steps: [
                {
                    id: "c_direct_10_25_by_5",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 5,
                    numeratorBefore: 10,
                    denominatorBefore: 25,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Fresh direct confirmation pair one.",
                },
                {
                    id: "c_direct_14_21_by_7",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 7,
                    numeratorBefore: 14,
                    denominatorBefore: 21,
                    numeratorAfter: 2,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Fresh direct confirmation pair two.",
                },
            ],
            reducedProduct: { left: fraction(2, 3), right: fraction(2, 5) },
            final: fraction(4, 15),
        },
    ],
    noUsefulCancellation: false,
};
const C_PAIR_PRODUCT = {
    factors: product(8, 27, 9, 14),
    expectedFinal: fraction(4, 21),
    approvedCancellationRoutes: [
        {
            id: "c_pair_route",
            steps: [
                {
                    id: "c_pair_8_14_by_2",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 2,
                    numeratorBefore: 8,
                    denominatorBefore: 14,
                    numeratorAfter: 4,
                    denominatorAfter: 7,
                    authorOnlyRationale: "One valid pair for the pair-validity confirmation.",
                },
                {
                    id: "c_pair_9_27_by_9",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 9,
                    numeratorBefore: 9,
                    denominatorBefore: 27,
                    numeratorAfter: 1,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Second valid pair for the pair-validity confirmation.",
                },
            ],
            reducedProduct: { left: fraction(4, 3), right: fraction(1, 7) },
            final: fraction(4, 21),
        },
    ],
    noUsefulCancellation: false,
};
const M1_PRODUCT = {
    factors: product(14, 15, 9, 28),
    expectedFinal: fraction(3, 10),
    approvedCancellationRoutes: [
        {
            id: "m1_route",
            steps: [
                {
                    id: "m1_14_28_by_14",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 14,
                    numeratorBefore: 14,
                    denominatorBefore: 28,
                    numeratorAfter: 1,
                    denominatorAfter: 2,
                    authorOnlyRationale: "Final DIRECT cancellation one.",
                },
                {
                    id: "m1_9_15_by_3",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 3,
                    numeratorBefore: 9,
                    denominatorBefore: 15,
                    numeratorAfter: 3,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Final DIRECT cancellation two.",
                },
            ],
            reducedProduct: { left: fraction(1, 5), right: fraction(3, 2) },
            final: fraction(3, 10),
        },
    ],
    noUsefulCancellation: false,
};
const M2_PRODUCT = {
    factors: product(12, 35, 14, 27),
    expectedFinal: fraction(8, 45),
    expectedReducedProduct: { left: fraction(4, 5), right: fraction(2, 9) },
    approvedCancellationRoutes: [
        {
            id: "m2_prescribed_route",
            steps: [
                {
                    id: "m2_12_27_by_3",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 3,
                    numeratorBefore: 12,
                    denominatorBefore: 27,
                    numeratorAfter: 4,
                    denominatorAfter: 9,
                    authorOnlyRationale: "Prescribed first shared division.",
                },
                {
                    id: "m2_14_35_by_7",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 7,
                    numeratorBefore: 14,
                    denominatorBefore: 35,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Prescribed second shared division.",
                },
            ],
            reducedProduct: { left: fraction(4, 5), right: fraction(2, 9) },
            final: fraction(8, 45),
        },
    ],
    noUsefulCancellation: false,
};
const genericSignals = [
    {
        family: "PAIR",
        observableEvidence: "Visible method cancels two numerator factors or two denominator factors.",
        immediateUtteranceIds: [],
        requiresRepeatBeforeStableClassification: true,
        repairId: "R-PAIR",
    },
    {
        family: "SHARED",
        observableEvidence: "Visible method changes only one member of a valid pair or uses different divisors.",
        immediateUtteranceIds: [],
        requiresRepeatBeforeStableClassification: true,
        repairId: "R-SHARED",
    },
    {
        family: "FINISH",
        observableEvidence: "Visible method stops at a reduced product or leaves the final product unsimplified.",
        immediateUtteranceIds: [],
        requiresRepeatBeforeStableClassification: true,
        repairId: "R-FINISH",
    },
    {
        family: "ARITHMETIC",
        observableEvidence: "Structure and pair choices are valid but one exact division or multiplication fact is wrong.",
        immediateUtteranceIds: ["ARITHMETIC.REDIRECT"],
        requiresRepeatBeforeStableClassification: false,
    },
    {
        family: "UNKNOWN",
        observableEvidence: "Wrong or malformed response without a discriminating visible method.",
        immediateUtteranceIds: ["UNKNOWN.REDIRECT"],
        requiresRepeatBeforeStableClassification: true,
    },
];
const finalWorkedCheck = (steps, answer) => ({
    requiresAnswerLocked: true,
    outcomeUtteranceIds: {
        correct: ["FINAL.CORRECT"],
        incorrect: ["FINAL.INCORRECT"],
    },
    visibleSteps: steps,
    finalAnswer: answer,
});
exports.FRA25_PRIMARY_QUESTIONS = [
    {
        id: "G1",
        stage: "guided",
        family: "DIRECT",
        studentFacing: {
            stageLabel: "Try it with me",
            title: "Make the numbers smaller before multiplying",
            prompt: "Simplify 6/7 × 14/15 before multiplying. Give the final fraction.",
            ryanBeforeSubmitUtteranceIds: ["G1.BEFORE"],
            visibleFeedback: {
                correct: "Both cancellations used one shared division. The remaining factors multiply to 4/5.",
                incorrectDefault: "Show one numerator-denominator pair and the shared factor you used.",
            },
        },
        authorOnly: {
            assessmentIntent: "Guided execution of two useful cancellation pairs followed by the final product.",
            routeNotes: [
                "Guided success does not count as mastery.",
                "One-sided change gets the authored SHARED cue; repeat triggers R-SHARED.",
            ],
            leakageNotes: ["Do not highlight either useful pair before the learner selects it."],
            sourcePage: 14,
        },
        visual: {
            kind: "product_fraction_input",
            math: G1_PRODUCT,
            visibleExpression: "6/7 × 14/15",
            beforeSubmitState: ["Four factor positions are visible.", "Final fraction fields are empty."],
            afterSubmitState: ["Show the learner's committed route and final fraction."],
            accessibleDescriptionBeforeSubmit: "The product six sevenths times fourteen fifteenths is shown. No cancellation pair or divisor is named.",
            authorOnlyNotes: ["Accessible description must not reveal 7, 3 or the final answer as useful divisors/results."],
        },
        response: {
            kind: "pair_and_divisor",
            submitLabel: "Check answer",
            acceptedFractions: [fraction(4, 5)],
            acceptsAnyApprovedCancellationRoute: true,
        },
        answer: {
            finalFraction: fraction(4, 5),
            validPairs: [
                { numeratorSlot: "right_numerator", denominatorSlot: "left_denominator", divisor: 7 },
                { numeratorSlot: "left_numerator", denominatorSlot: "right_denominator", divisor: 3 },
            ],
        },
        policy: guidedPolicy,
        observableErrorSignals: genericSignals,
        routeTags: ["guided_gate", "strong_route_evidence_if_first_attempt_clean"],
    },
    {
        id: "G2",
        stage: "guided",
        family: "NO_CANCEL",
        studentFacing: {
            stageLabel: "Try it with me",
            title: "Should anything cancel?",
            prompt: "For 5/8 × 7/9, choose the valid next step.",
            ryanBeforeSubmitUtteranceIds: ["G2.BEFORE"],
            visibleFeedback: {
                correct: "No cross pair shares a factor greater than one. Multiply as written to get 35/72.",
                incorrectDefault: "Check one numerator against one denominator at a time.",
                byChoiceId: {
                    A: "Being beside another number does not make a shared factor.",
                    B: "Being odd does not make a pair cancellable.",
                    D: "Those are both denominator factors, so they cannot cancel each other.",
                },
            },
        },
        authorOnly: {
            assessmentIntent: "Guided recognition that no cancellation is sometimes the efficient correct choice.",
            routeNotes: ["Repeat invented cancellation triggers R-NONE; denominator-denominator choice may trigger R-PAIR."],
            leakageNotes: ["Ryan asks whether a shared factor exists but does not answer the check."],
            sourcePage: 15,
        },
        visual: {
            kind: "no_cancel_mcq",
            math: NO_CANCEL_PRODUCT,
            visibleExpression: "5/8 × 7/9",
            beforeSubmitState: ["No pair is preselected.", "Four answer cards are visible."],
            afterSubmitState: ["After response, show the four cross-pair gcd checks and 35/72."],
            accessibleDescriptionBeforeSubmit: "The product five eighths times seven ninths and four possible next-step statements are shown. No shared-factor conclusion is supplied.",
            authorOnlyNotes: ["Selection state must use more than colour."],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Check answer",
            choices: [
                { id: "A", text: "Cancel 5 with 8 because they are beside each other." },
                { id: "B", text: "Cancel 7 with 9 because both are odd." },
                { id: "C", text: "No cancellation is available; multiply as written." },
                { id: "D", text: "Cancel 8 with 9 because both are denominators." },
            ],
            acceptedChoiceIds: ["C"],
        },
        answer: { choiceIds: ["C"], finalFraction: fraction(35, 72) },
        policy: guidedPolicy,
        observableErrorSignals: [
            {
                family: "NONE",
                observableEvidence: "Selects A or B and repeats an invented cancellation after a neutral cue.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-NONE",
            },
            {
                family: "PAIR",
                observableEvidence: "Selects denominator-with-denominator option D.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-PAIR",
            },
        ],
        routeTags: ["guided_gate", "no_cancel_boundary"],
    },
    {
        id: "F1",
        stage: "faded",
        family: "DIRECT",
        studentFacing: {
            stageLabel: "Your turn - some support remains",
            title: "Simplify before multiplying",
            prompt: "Calculate 7/12 × 8/15. Give the answer in simplest form.",
            hint: "Look for one numerator and one denominator that share a factor. Start by checking 8 and 12.",
            ryanBeforeSubmitUtteranceIds: [],
            visibleFeedback: {
                correct: "8 and 12 can both divide by 4. The smaller product gives 14/45.",
                incorrectDefault: "Check the pair you changed and make sure both values used the same divisor.",
            },
        },
        authorOnly: {
            assessmentIntent: "Standard-route direct transfer with optional structural hint.",
            routeNotes: [
                "Skip on the strong route.",
                "Correct with hint schedules C-DIRECT before final.",
            ],
            leakageNotes: ["No cancellation marks or divisor appear until hint opens or answer is submitted."],
            sourcePage: 17,
        },
        visual: {
            kind: "product_fraction_input",
            math: F1_PRODUCT,
            visibleExpression: "7/12 × 8/15",
            beforeSubmitState: ["Only final numerator and denominator fields are editable.", "Hint starts collapsed."],
            afterSubmitState: ["Show 8÷4=2 and 12÷4=3, then 7/3 × 2/15 = 14/45."],
            accessibleDescriptionBeforeSubmit: "The product seven twelfths times eight fifteenths is shown with empty final fraction fields. No useful pair is identified.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "fraction_input",
            submitLabel: "Check answer",
            editableFields: ["final_numerator", "final_denominator"],
            acceptedFractions: [fraction(14, 45)],
        },
        answer: { finalFraction: fraction(14, 45) },
        policy: fadedPolicy,
        observableErrorSignals: genericSignals,
        routeTags: ["standard_route_only", "hint_direct_confirmation_to_C-DIRECT"],
    },
    {
        id: "F2",
        stage: "faded",
        family: "PAIR_VALIDITY",
        studentFacing: {
            stageLabel: "Your turn",
            title: "Which cancellation is valid?",
            prompt: "For 8/21 × 14/15, choose a valid first cancellation.",
            hint: "A valid pair is on opposite sides of the product and uses one exact divisor.",
            ryanBeforeSubmitUtteranceIds: ["F2.BEFORE"],
            visibleFeedback: {
                correct: "14 is a numerator factor and 21 is a denominator factor. Both divide exactly by 7.",
                incorrectDefault: "Check whether the two values are on opposite sides and share the stated divisor.",
                byChoiceId: {
                    B: "8 and 21 are on opposite sides, but 21 does not divide exactly by 4.",
                    C: "21 and 15 are both denominator factors, so they cannot cancel each other.",
                    D: "14 and 15 are on opposite sides, but 15 does not divide exactly by 7.",
                },
            },
        },
        authorOnly: {
            assessmentIntent: "Pair-validity reasoning retained on both strong and standard routes.",
            routeNotes: [
                "This item contains the documented page-18 mathematical correction.",
                "Correct with hint schedules C-PAIR before final.",
            ],
            leakageNotes: ["Do not outline 14 and 21 before submit."],
            sourcePage: 18,
        },
        visual: {
            kind: "pair_validity_mcq",
            math: F2_PRODUCT,
            visibleExpression: "8/21 × 14/15",
            beforeSubmitState: ["Four proposed cancellation statements are visible.", "No pair is highlighted automatically."],
            afterSubmitState: ["After response, connect 14 and 21 and show ÷7 on both."],
            accessibleDescriptionBeforeSubmit: "The product eight twenty-firsts times fourteen fifteenths and four proposed cancellation steps are shown. No proposal is marked as correct.",
            authorOnlyNotes: ["The PDF's same-side 8-and-14 answer is not implemented; see source correction."],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Check answer",
            choices: [
                { id: "A", text: "Divide 14 and 21 by 7." },
                { id: "B", text: "Divide 8 and 21 by 4." },
                { id: "C", text: "Divide 21 and 15 by 3." },
                { id: "D", text: "Divide 14 and 15 by 7." },
            ],
            acceptedChoiceIds: ["A"],
        },
        answer: {
            choiceIds: ["A"],
            finalFraction: fraction(16, 45),
            validPairs: [{ numeratorSlot: "right_numerator", denominatorSlot: "left_denominator", divisor: 7 }],
        },
        policy: fadedPolicy,
        observableErrorSignals: [
            {
                family: "PAIR",
                observableEvidence: "Selects same-side denominator pair C.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-PAIR",
            },
            {
                family: "SHARED",
                observableEvidence: "Selects an opposite-side pair with a divisor that is not exact for both values.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-SHARED",
            },
        ],
        routeTags: ["retained_on_fast_route", "hint_pair_confirmation_to_C-PAIR"],
    },
    {
        id: "I1",
        stage: "independent",
        family: "DIRECT",
        studentFacing: {
            stageLabel: "Now you take over",
            title: "Simplify before multiplying",
            prompt: "Calculate 12/25 × 15/16. Give the answer in simplest form.",
            hint: "Check 12 against 16, then 15 against 25. Use the same divisor on each pair.",
            ryanBeforeSubmitUtteranceIds: ["I1.BEFORE"],
            visibleFeedback: {
                correct: "The two valid shared divisions leave 3/5 × 3/4, so the product is 9/20.",
                incorrectDefault: "Show the pair and divisor used at each reduction.",
            },
        },
        authorOnly: {
            assessmentIntent: "Independent direct product with two possible cancellations.",
            routeNotes: ["Hint-supported success requires C-DIRECT before final."],
            leakageNotes: ["No pair, divisor or quotient is visible before submit unless the learner opens the hint."],
            sourcePage: 20,
        },
        visual: {
            kind: "product_fraction_input",
            math: I1_PRODUCT,
            visibleExpression: "12/25 × 15/16",
            beforeSubmitState: ["Final fraction fields are empty.", "Ask for a hint is collapsed."],
            afterSubmitState: ["Show 12&16 ÷4, 15&25 ÷5, then 3/5 × 3/4 = 9/20."],
            accessibleDescriptionBeforeSubmit: "The product twelve twenty-fifths times fifteen sixteenths is shown with empty answer fields. No useful pair or divisor is identified.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "fraction_input",
            submitLabel: "Check answer",
            editableFields: ["final_numerator", "final_denominator"],
            acceptedFractions: [fraction(9, 20)],
            acceptsAnyApprovedCancellationRoute: true,
        },
        answer: { finalFraction: fraction(9, 20) },
        policy: independentPolicy,
        observableErrorSignals: genericSignals,
        routeTags: ["independent_direct", "hint_to_C-DIRECT"],
    },
    {
        id: "I2",
        stage: "independent",
        family: "ERROR",
        studentFacing: {
            stageLabel: "Now you take over",
            title: "Is the cancellation valid?",
            prompt: "A student cancels 6 and 15 in 6/7 × 15/14. Choose the correct response.",
            hint: "Trace each number to the top or bottom of the combined product.",
            ryanBeforeSubmitUtteranceIds: [],
            visibleFeedback: {
                correct: "6 and 15 are both numerator factors. A valid pair contains one numerator and one denominator factor.",
                incorrectDefault: "Locate both selected numbers in the combined numerator-denominator structure.",
            },
        },
        authorOnly: {
            assessmentIntent: "Independent error analysis of illegal same-side cancellation.",
            routeNotes: ["Hint-supported success requires C-PAIR before final; repeated same-side choice triggers R-PAIR."],
            leakageNotes: ["The corrected 6-and-14 pair is not highlighted before submit."],
            sourcePage: 21,
        },
        visual: {
            kind: "pair_validity_mcq",
            math: I2_PRODUCT,
            visibleExpression: "6/7 × 15/14",
            beforeSubmitState: [
                "A student's proposed strike through 6 and 15 is shown as the object to evaluate.",
                "No corrected pair is displayed.",
            ],
            afterSubmitState: ["After response, show the top-row relationship and then the valid 6-and-14 ÷2 route to 45/49."],
            accessibleDescriptionBeforeSubmit: "The product six sevenths times fifteen fourteenths is shown with a student's proposed cancellation between 6 and 15. Both numbers occupy numerator positions; no validity conclusion is stated.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Check answer",
            choices: [
                { id: "A", text: "The step is valid because 6 and 15 share 3." },
                { id: "B", text: "The step is not valid: 6 and 15 are both numerator factors." },
                { id: "C", text: "The step is not valid because cancellation only works with even numbers." },
                { id: "D", text: "The step is valid, but the denominator should also be multiplied by 3." },
            ],
            acceptedChoiceIds: ["B"],
        },
        answer: { choiceIds: ["B"], finalFraction: fraction(45, 49) },
        policy: independentPolicy,
        observableErrorSignals: [
            {
                family: "PAIR",
                observableEvidence: "Accepts the 6-and-15 same-side cancellation.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-PAIR",
            },
            {
                family: "UNKNOWN",
                observableEvidence: "Rejects for an unrelated reason without recognising the factor positions.",
                immediateUtteranceIds: ["UNKNOWN.REDIRECT"],
                requiresRepeatBeforeStableClassification: true,
            },
        ],
        routeTags: ["independent_error", "hint_to_C-PAIR"],
    },
];
const M4_TERM_SIGNALS = [
    {
        family: "TERM",
        observableEvidence: "Accepts cancellation of the 5 inside (3+5) with 10.",
        immediateUtteranceIds: [],
        requiresRepeatBeforeStableClassification: false,
        repairId: "R-TERM",
    },
    {
        family: "UNKNOWN",
        observableEvidence: "Rejects the step for an unrelated property such as oddness.",
        immediateUtteranceIds: ["UNKNOWN.REDIRECT"],
        requiresRepeatBeforeStableClassification: true,
    },
];
exports.FRA25_CONFIRMATION_QUESTIONS = [
    {
        id: "C-DIRECT",
        stage: "confirmation",
        family: "DIRECT",
        studentFacing: {
            stageLabel: "One more without help",
            title: "Simplify before multiplying",
            prompt: "Calculate 10/21 × 14/25. Give the answer in simplest form.",
            ryanBeforeSubmitUtteranceIds: [],
            visibleFeedback: {
                correct: "The fresh no-hint direct check is correct: 4/15.",
                incorrectDefault: "Compare the pairs and divisors in your committed method with the worked check.",
            },
        },
        authorOnly: {
            assessmentIntent: "Fresh unsupported DIRECT confirmation after hint-supported direct practice.",
            routeNotes: ["Only first-attempt no-hint success confirms the supported direct evidence."],
            leakageNotes: ["No pair or divisor is pre-highlighted."],
            sourcePage: 20,
        },
        visual: {
            kind: "product_fraction_input",
            math: C_DIRECT_PRODUCT,
            visibleExpression: "10/21 × 14/25",
            beforeSubmitState: ["No hint control.", "No cancellation marks."],
            afterSubmitState: ["Show 10&25 ÷5, 14&21 ÷7, then 2/3 × 2/5 = 4/15."],
            accessibleDescriptionBeforeSubmit: "The product ten twenty-firsts times fourteen twenty-fifths is shown with empty final fraction fields. No useful pair is named.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "fraction_input",
            submitLabel: "Check answer",
            editableFields: ["final_numerator", "final_denominator"],
            acceptedFractions: [fraction(4, 15)],
            acceptsAnyApprovedCancellationRoute: true,
        },
        answer: { finalFraction: fraction(4, 15) },
        policy: confirmationPolicy,
        observableErrorSignals: genericSignals,
        workedCheck: finalWorkedCheck([
            "10 and 25 divide by 5, leaving 2 and 5.",
            "14 and 21 divide by 7, leaving 2 and 3.",
            "2/3 × 2/5 = 4/15.",
        ], "4/15"),
        routeTags: ["fresh_no_hint_confirmation", "confirms_DIRECT_only"],
    },
    {
        id: "C-PAIR",
        stage: "confirmation",
        family: "PAIR_VALIDITY",
        studentFacing: {
            stageLabel: "One more without help",
            title: "Choose a valid cancellation pair",
            prompt: "For 8/27 × 9/14, choose one valid pair and its shared divisor.",
            ryanBeforeSubmitUtteranceIds: [],
            visibleFeedback: {
                correct: "The selected pair crosses the fraction line and uses an exact shared divisor.",
                incorrectDefault: "Check that the pair contains one numerator factor and one denominator factor, and that both divide exactly.",
            },
        },
        authorOnly: {
            assessmentIntent: "Fresh unsupported PAIR_VALIDITY confirmation after hint-supported pair reasoning.",
            routeNotes: ["Accept either 8 with 14 by 2 or 9 with 27 by 9."],
            leakageNotes: ["No valid pair is highlighted before submit."],
            sourcePage: 22,
        },
        visual: {
            kind: "four_factor_grid",
            math: C_PAIR_PRODUCT,
            visibleExpression: "8/27 × 9/14",
            beforeSubmitState: ["Four factors are individually selectable.", "A divisor selector remains blank."],
            afterSubmitState: ["Show the selected valid pair and exact quotient changes."],
            accessibleDescriptionBeforeSubmit: "The four factors in eight twenty-sevenths times nine fourteenths are individually selectable. No valid pair or divisor is identified.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "pair_and_divisor",
            submitLabel: "Check answer",
            acceptsAnyApprovedCancellationRoute: true,
        },
        answer: {
            validPairs: [
                { numeratorSlot: "left_numerator", denominatorSlot: "right_denominator", divisor: 2 },
                { numeratorSlot: "right_numerator", denominatorSlot: "left_denominator", divisor: 9 },
            ],
            finalFraction: fraction(4, 21),
        },
        policy: confirmationPolicy,
        observableErrorSignals: genericSignals,
        workedCheck: finalWorkedCheck([
            "One valid pair is 8 and 14, both divided by 2.",
            "Another valid pair is 9 and 27, both divided by 9.",
            "Using both leaves 4/3 × 1/7 = 4/21.",
        ], "Valid pair: 8 & 14 by 2, or 9 & 27 by 9"),
        routeTags: ["fresh_no_hint_confirmation", "confirms_PAIR_VALIDITY_only"],
    },
];
exports.FRA25_FINAL_QUESTIONS = [
    {
        id: "M1",
        stage: "final",
        family: "DIRECT",
        studentFacing: {
            stageLabel: "Final check",
            title: "Simplify before multiplying",
            prompt: "Calculate 14/15 × 9/28. Give the answer in simplest form.",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "DIRECT: independently choose and execute two reductions, then finish the product.",
            routeNotes: ["Same-side route evidence maps to R-PAIR; one-sided division to R-SHARED; repeated unfinished product to R-FINISH."],
            leakageNotes: ["No pair, divisor, quotient, hint or working before answer lock."],
            sourcePage: 24,
        },
        visual: {
            kind: "product_fraction_input",
            math: M1_PRODUCT,
            visibleExpression: "14/15 × 9/28",
            beforeSubmitState: ["Empty final fraction fields.", "No cancellation marks or hint control."],
            afterSubmitState: ["14&28 ÷14; 9&15 ÷3; 1/5 × 3/2 = 3/10."],
            accessibleDescriptionBeforeSubmit: "The product fourteen fifteenths times nine twenty-eighths is shown with empty answer fields. No useful pair is identified.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "fraction_input",
            submitLabel: "Submit",
            editableFields: ["final_numerator", "final_denominator"],
            acceptedFractions: [fraction(3, 10)],
            acceptsAnyApprovedCancellationRoute: true,
        },
        answer: { finalFraction: fraction(3, 10) },
        policy: finalPolicy,
        observableErrorSignals: genericSignals,
        workedCheck: finalWorkedCheck([
            "14 and 28 divide by 14, leaving 1 and 2.",
            "9 and 15 divide by 3, leaving 3 and 5.",
            "1/5 × 3/2 = 3/10.",
        ], "3/10"),
        routeTags: ["primary_final", "procedural_evidence"],
    },
    {
        id: "M2",
        stage: "final",
        family: "STEP",
        studentFacing: {
            stageLabel: "Final check",
            title: "Complete the reduced product",
            prompt: "For 12/35 × 14/27, divide 12 and 27 by 3, and divide 14 and 35 by 7. Enter the reduced product, then the final fraction.",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "STEP: apply two prescribed shared divisions to the correct fields, then multiply.",
            routeNotes: ["The reduced-product fields are form-sensitive because the divisors are explicitly prescribed."],
            leakageNotes: ["The prompt states divisors but must not show quotients or final values before submit."],
            sourcePage: 25,
        },
        visual: {
            kind: "reduced_product_input",
            math: M2_PRODUCT,
            visibleExpression: "12/35 × 14/27",
            beforeSubmitState: [
                "The two prescribed shared divisions are written in words.",
                "Four reduced-factor fields and the final fraction fields are empty.",
            ],
            afterSubmitState: ["12÷3=4; 27÷3=9; 14÷7=2; 35÷7=5; 4/5 × 2/9 = 8/45."],
            accessibleDescriptionBeforeSubmit: "The product twelve thirty-fifths times fourteen twenty-sevenths is shown. The instruction states that 12 and 27 divide by 3 and 14 and 35 divide by 7. The quotient and final fields are empty.",
            authorOnlyNotes: ["The accessibility text may repeat supplied divisors but may not calculate quotients."],
        },
        response: {
            kind: "reduced_product_and_fraction_input",
            submitLabel: "Submit",
            editableFields: [
                "left_reduced_numerator",
                "left_reduced_denominator",
                "right_reduced_numerator",
                "right_reduced_denominator",
                "final_numerator",
                "final_denominator",
            ],
            acceptedReducedProducts: [{ left: fraction(4, 5), right: fraction(2, 9) }],
            acceptedFractions: [fraction(8, 45)],
        },
        answer: {
            reducedProduct: { left: fraction(4, 5), right: fraction(2, 9) },
            finalFraction: fraction(8, 45),
        },
        policy: finalPolicy,
        observableErrorSignals: genericSignals,
        workedCheck: finalWorkedCheck([
            "12 ÷ 3 = 4 and 27 ÷ 3 = 9.",
            "14 ÷ 7 = 2 and 35 ÷ 7 = 5.",
            "The reduced product is 4/5 × 2/9.",
            "4 × 2 over 5 × 9 = 8/45.",
        ], "Reduced product 4/5 × 2/9; final 8/45"),
        routeTags: ["primary_final", "procedural_step_evidence"],
    },
    {
        id: "M3",
        stage: "final",
        family: "REASON",
        studentFacing: {
            stageLabel: "Final check",
            title: "Recognise when no cancellation is available",
            prompt: "For 5/8 × 7/9, choose the valid next step.",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "REASON: independently recognise the no-cancellation boundary.",
            routeNotes: ["Invented cancellation may map to R-NONE; denominator-denominator choice may map to R-PAIR."],
            leakageNotes: ["No gcd check or pair highlight before answer lock."],
            sourcePage: 26,
        },
        visual: {
            kind: "no_cancel_mcq",
            math: NO_CANCEL_PRODUCT,
            visibleExpression: "5/8 × 7/9",
            beforeSubmitState: ["Four next-step choices are visible.", "No choice is preselected."],
            afterSubmitState: ["Check each numerator against each denominator, then reveal 35/72."],
            accessibleDescriptionBeforeSubmit: "The product five eighths times seven ninths and four possible next-step statements are shown. No conclusion about shared factors is provided.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Submit",
            choices: [
                { id: "A", text: "Cancel 5 with 8." },
                { id: "B", text: "Cancel 7 with 9." },
                { id: "C", text: "Cancel 8 with 9." },
                { id: "D", text: "No cancellation is valid; multiply to 35/72." },
            ],
            acceptedChoiceIds: ["D"],
        },
        answer: { choiceIds: ["D"], finalFraction: fraction(35, 72) },
        policy: finalPolicy,
        observableErrorSignals: [
            {
                family: "NONE",
                observableEvidence: "Selects invented cross cancellation A or B.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-NONE",
            },
            {
                family: "PAIR",
                observableEvidence: "Selects denominator-with-denominator cancellation C.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-PAIR",
            },
        ],
        workedCheck: finalWorkedCheck([
            "5 shares no factor greater than 1 with 8 or 9.",
            "7 shares no factor greater than 1 with 8 or 9.",
            "Multiply as written: 5 × 7 over 8 × 9 = 35/72.",
        ], "Option D; 35/72"),
        routeTags: ["primary_final", "reasoning_evidence"],
    },
    {
        id: "M4",
        stage: "final",
        family: "ERROR",
        studentFacing: {
            stageLabel: "Final check",
            title: "Reject cancellation inside an addition",
            prompt: "A student cancels the 5 in (3 + 5)/12 × 9/10. Is the step valid?",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "ERROR: distinguish complete multiplicative factors from terms joined by addition.",
            routeNotes: ["One explicit acceptance of the term cancellation is strong R-TERM evidence."],
            leakageNotes: ["Do not outline the entire bracket as the answer before submit."],
            sourcePage: 27,
        },
        visual: {
            kind: "term_vs_factor_contrast",
            math: TERM_PRODUCT,
            visibleExpression: "(3 + 5)/12 × 9/10",
            beforeSubmitState: ["The student's proposed strike through the 5 and 10 is visible as the claim under review."],
            afterSubmitState: ["Outline (3+5) as the complete factor, evaluate to 8, then show valid reductions and 3/5."],
            accessibleDescriptionBeforeSubmit: "The expression open bracket three plus five close bracket over twelve times nine tenths is shown with a student's proposed cancellation of the five inside the bracket against ten. No validity conclusion is supplied.",
            authorOnlyNotes: ["This remains a numeric factor-boundary check, not an algebraic-fractions lesson."],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Submit",
            choices: [
                { id: "A", text: "Valid: cancel the 5 in (3 + 5) with 10." },
                { id: "B", text: "Not valid: 5 is a term inside a sum, not a complete factor." },
                { id: "C", text: "Valid: any equal-looking number may be cancelled." },
                { id: "D", text: "Not valid only because 5 is odd." },
            ],
            acceptedChoiceIds: ["B"],
        },
        answer: { choiceIds: ["B"], finalFraction: fraction(3, 5) },
        policy: finalPolicy,
        observableErrorSignals: M4_TERM_SIGNALS,
        workedCheck: finalWorkedCheck([
            "The numerator is the complete factor (3 + 5); the 5 alone is one term.",
            "Evaluate the bracket: 8/12 × 9/10.",
            "Cancel 8 and 10 by 2, and 9 and 12 by 3.",
            "4/4 × 3/5 = 3/5.",
        ], "Option B; product 3/5"),
        routeTags: ["primary_final", "error_analysis_evidence", "blocking_TERM_check"],
    },
    {
        id: "M5",
        stage: "final",
        family: "MATCH",
        studentFacing: {
            stageLabel: "Final check",
            title: "Compare two valid routes",
            prompt: "Which statement about 12/18 × 5/14 is correct?",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "MATCH/REASON: recognise route flexibility while preserving the shared-division invariant.",
            routeNotes: ["Selecting only one route may show rigidity; confirm before assigning a misconception."],
            leakageNotes: ["Do not mark either route valid before submit."],
            sourcePage: 28,
        },
        visual: {
            kind: "route_comparison_mcq",
            math: ROUTE_PRODUCT,
            visibleExpression: "12/18 × 5/14",
            beforeSubmitState: [
                "Route 1: simplify 12/18 to 2/3, then cancel 2 with 14.",
                "Route 2: cancel 12 with 14 first, then simplify 6/18.",
                "Four statements are visible; no route has a correctness marker.",
            ],
            afterSubmitState: ["Complete both routes to 1/3 × 5/7 = 5/21."],
            accessibleDescriptionBeforeSubmit: "Two described routes for twelve eighteenths times five fourteenths are shown. One simplifies the left fraction first; the other cross-cancels first. Four statements ask which routes preserve the product.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Submit",
            choices: [
                { id: "A", text: "Route 1 only is valid." },
                { id: "B", text: "Route 2 only is valid." },
                { id: "C", text: "Both routes preserve the product and give 5/21." },
                { id: "D", text: "Neither route is valid because cancellation must be left to right." },
            ],
            acceptedChoiceIds: ["C"],
        },
        answer: { choiceIds: ["C"], finalFraction: fraction(5, 21) },
        policy: finalPolicy,
        observableErrorSignals: [
            {
                family: "UNKNOWN",
                observableEvidence: "Selects only one valid route; may be route rigidity rather than a core cancellation misconception.",
                immediateUtteranceIds: ["UNKNOWN.REDIRECT"],
                requiresRepeatBeforeStableClassification: true,
            },
            {
                family: "NONE",
                observableEvidence: "Rejects both valid routes because of a compulsory-order rule.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
            },
        ],
        workedCheck: finalWorkedCheck([
            "Route 1: 12/18 becomes 2/3, then 2 and 14 divide by 2, leaving 1/3 × 5/7.",
            "Route 2: 12 and 14 divide by 2, then 6/18 simplifies by 6, also leaving 1/3 × 5/7.",
            "Both routes give 5/21.",
        ], "Option C; 5/21"),
        routeTags: ["primary_final", "reasoning_route_evidence"],
    },
];
exports.FRA25_ALL_CORE_QUESTIONS = [
    ...exports.FRA25_PRIMARY_QUESTIONS,
    ...exports.FRA25_CONFIRMATION_QUESTIONS,
    ...exports.FRA25_FINAL_QUESTIONS,
];
const R_SHARED_CHECK_PRODUCT = {
    factors: product(8, 9, 15, 20),
    expectedFinal: fraction(2, 3),
    approvedCancellationRoutes: [
        {
            id: "r_shared_check_route",
            steps: [
                {
                    id: "r_shared_check_8_20_by_4",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 4,
                    numeratorBefore: 8,
                    denominatorBefore: 20,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Fresh same-divisor quotient check.",
                },
                {
                    id: "r_shared_check_15_9_by_3",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 3,
                    numeratorBefore: 15,
                    denominatorBefore: 9,
                    numeratorAfter: 5,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Remaining valid cancellation for the worked check.",
                },
            ],
            reducedProduct: { left: fraction(2, 3), right: fraction(5, 5) },
            final: fraction(2, 3),
        },
    ],
    noUsefulCancellation: false,
};
const R_TERM_CHECK_PRODUCT = {
    factors: product(12, 15, 7, 10),
    expectedFinal: fraction(14, 25),
    approvedCancellationRoutes: [
        {
            id: "r_term_check_route",
            steps: [
                {
                    id: "r_term_check_12_10_by_2",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 2,
                    numeratorBefore: 12,
                    denominatorBefore: 10,
                    numeratorAfter: 6,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Valid only after (4+8) is evaluated to complete factor 12.",
                },
                {
                    id: "r_term_check_6_15_by_3",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 3,
                    numeratorBefore: 6,
                    denominatorBefore: 15,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Known within-factor simplification after evaluation.",
                },
            ],
            reducedProduct: { left: fraction(2, 5), right: fraction(7, 5) },
            final: fraction(14, 25),
        },
    ],
    noUsefulCancellation: false,
    containsAdditiveTerm: true,
    authorOnlyNotes: ["Original learner-visible expression is (4 + 8)/15 × 7/10."],
};
const R_FINISH_CHECK_PRODUCT = {
    factors: product(8, 15, 9, 16),
    expectedFinal: fraction(3, 10),
    expectedReducedProduct: { left: fraction(2, 5), right: fraction(3, 4) },
    approvedCancellationRoutes: [
        {
            id: "r_finish_check_route",
            steps: [
                {
                    id: "r_finish_8_16_by_4",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 4,
                    numeratorBefore: 8,
                    denominatorBefore: 16,
                    numeratorAfter: 2,
                    denominatorAfter: 4,
                    authorOnlyRationale: "Given reduced product first pair.",
                },
                {
                    id: "r_finish_9_15_by_3",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 3,
                    numeratorBefore: 9,
                    denominatorBefore: 15,
                    numeratorAfter: 3,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Given reduced product second pair.",
                },
            ],
            reducedProduct: { left: fraction(2, 5), right: fraction(3, 4) },
            final: fraction(3, 10),
        },
    ],
    noUsefulCancellation: false,
};
const R_NONE_PRODUCTS = {
    A: {
        factors: product(7, 10, 9, 11),
        expectedFinal: fraction(63, 110),
        approvedCancellationRoutes: [],
        noUsefulCancellation: true,
    },
    B: {
        factors: product(8, 15, 9, 12),
        expectedFinal: fraction(2, 5),
        approvedCancellationRoutes: [],
        noUsefulCancellation: false,
    },
    C: {
        factors: product(6, 13, 26, 21),
        expectedFinal: fraction(4, 7),
        approvedCancellationRoutes: [],
        noUsefulCancellation: false,
    },
};
const repairQuestionPolicy = {
    scored: false,
    firstAttemptIsAuthoritative: false,
    eligibleForIndependentMastery: false,
    answerLocksOnSubmit: false,
    hintPolicy: "guided",
    solutionPolicy: "after_response",
    requiresFreshNoHintConfirmationIfHintUsed: false,
    playExactlyOneOutcomeBranch: true,
    doNotPlayDefaultAfterErrorSpecific: true,
};
const recoveryCheckPolicy = {
    ...finalPolicy,
    eligibleForIndependentMastery: true,
};
exports.FRA25_REPAIRS = [
    {
        id: "R-PAIR",
        family: "PAIR",
        authorOnlyTrigger: "Explicit same-side cancellation rule, or repeated cancellation of numerator with numerator / denominator with denominator across two structures.",
        teachingUtteranceIds: ["R-PAIR.1", "R-PAIR.2", "R-PAIR.3"],
        visual: {
            kind: "repair_pair_tray",
            math: I2_PRODUCT,
            visibleExpression: "6/7 × 15/14",
            beforeSubmitState: [
                "6 and 15 are shown together on the numerator row with an invalid same-side marker.",
                "6 and 14 are then connected across the fraction line with divisor 2.",
            ],
            afterSubmitState: ["3/7 × 15/7 = 45/49."],
            accessibleDescriptionBeforeSubmit: "The repair contrasts an invalid pair of two numerator factors, 6 and 15, with a valid numerator-denominator pair, 6 and 14, which both divide by 2.",
            authorOnlyNotes: ["Same-side drag attempts snap back without scoring penalty."],
        },
        supportedInteraction: {
            id: "R-PAIR-SUPPORTED",
            stage: "repair",
            family: "PAIR_VALIDITY",
            studentFacing: {
                stageLabel: "Repair",
                title: "Build a valid cancellation pair",
                prompt: "Drag one numerator factor and one denominator factor into the pair tray, then choose the shared divisor.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Supported pair construction immediately after R-PAIR teaching.",
                routeNotes: ["This interaction never counts as mastery."],
                leakageNotes: ["The target tray labels positions, not the exact answer pair."],
                sourcePage: 31,
            },
            visual: {
                kind: "repair_pair_tray",
                math: I2_PRODUCT,
                visibleExpression: "6/7 × 15/14",
                beforeSubmitState: ["Four draggable factor chips; numerator and denominator tray regions."],
                afterSubmitState: ["Valid pair 6 and 14 with divisor 2; quotients 3 and 7."],
                accessibleDescriptionBeforeSubmit: "Four factor controls are grouped by numerator and denominator position. The task asks for one factor from each group and a shared divisor.",
                authorOnlyNotes: [],
            },
            response: {
                kind: "drag_pair_then_divisor",
                submitLabel: "Check pair",
                acceptsAnyApprovedCancellationRoute: true,
            },
            answer: {
                validPairs: [{ numeratorSlot: "left_numerator", denominatorSlot: "right_denominator", divisor: 2 }],
            },
            policy: repairQuestionPolicy,
            observableErrorSignals: genericSignals,
            routeTags: ["supported_repair", "does_not_count_as_mastery"],
        },
        freshIndependentRecheck: {
            id: "R-PAIR-RECHECK",
            stage: "confirmation",
            family: "PAIR_VALIDITY",
            studentFacing: {
                stageLabel: "Check the repair",
                title: "Choose a valid pair",
                prompt: "Which pair can cancel in 10/21 × 14/25? Choose a pair and divisor.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Fresh unsupported pair-validity evidence after R-PAIR.",
                routeNotes: ["Accept 10&25 by5 or 14&21 by7."],
                leakageNotes: ["No pair is highlighted before submit."],
                sourcePage: 31,
            },
            visual: {
                kind: "four_factor_grid",
                math: C_DIRECT_PRODUCT,
                visibleExpression: "10/21 × 14/25",
                beforeSubmitState: ["Four selectable factors and blank divisor control."],
                afterSubmitState: ["Show both valid pair options after answer lock."],
                accessibleDescriptionBeforeSubmit: "The four factors in ten twenty-firsts times fourteen twenty-fifths are selectable. No valid pair is identified.",
                authorOnlyNotes: [],
            },
            response: { kind: "pair_and_divisor", submitLabel: "Submit", acceptsAnyApprovedCancellationRoute: true },
            answer: {
                validPairs: [
                    { numeratorSlot: "left_numerator", denominatorSlot: "right_denominator", divisor: 5 },
                    { numeratorSlot: "right_numerator", denominatorSlot: "left_denominator", divisor: 7 },
                ],
                finalFraction: fraction(4, 15),
            },
            policy: recoveryCheckPolicy,
            observableErrorSignals: genericSignals,
            workedCheck: finalWorkedCheck(["10 and 25 divide by 5.", "14 and 21 divide by 7.", "Either is a valid first pair."], "10 & 25 by 5, or 14 & 21 by 7"),
            routeTags: ["fresh_repair_recheck", "PAIR_recovery_evidence"],
        },
        resumeRule: "Correct unsupported recheck resumes at the next unsatisfied stage. Another same-side choice remains in R-PAIR with fresh values. A valid pair with one-sided quotient changes routes to R-SHARED.",
    },
    {
        id: "R-SHARED",
        family: "SHARED",
        authorOnlyTrigger: "Repeated one-sided change after a direct cue, or a visible systematic method using different divisors on the two members of one pair.",
        teachingUtteranceIds: ["R-SHARED.1", "R-SHARED.2", "R-SHARED.3"],
        visual: {
            kind: "repair_shared_divisor",
            math: G1_PRODUCT,
            visibleExpression: "6/7 × 14/15",
            beforeSubmitState: ["The pair 7 and 14 is selected with divisor 7 fixed between them."],
            afterSubmitState: ["7÷7=1 and 14÷7=2 appear together."],
            accessibleDescriptionBeforeSubmit: "Seven and fourteen are the selected numerator-denominator pair. A shared divisor of seven is shown, with two quotient fields.",
            authorOnlyNotes: ["Do not classify a lone arithmetic quotient slip as R-SHARED."],
        },
        supportedInteraction: {
            id: "R-SHARED-SUPPORTED",
            stage: "repair",
            family: "STEP",
            studentFacing: {
                stageLabel: "Repair",
                title: "Use the same divisor on both",
                prompt: "7 and 14 divide by 7. Enter both new values.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Supported matched-quotient interaction.",
                routeNotes: ["Next stays disabled until both fields are complete."],
                leakageNotes: ["The divisor is intentionally supplied; quotients remain learner work."],
                sourcePage: 32,
            },
            visual: {
                kind: "repair_shared_divisor",
                math: G1_PRODUCT,
                visibleExpression: "7 ÷ 7 = ?   and   14 ÷ 7 = ?",
                beforeSubmitState: ["Divisor 7 is fixed; two quotient fields are empty."],
                afterSubmitState: ["Quotients 1 and 2 are shown as one matched change."],
                accessibleDescriptionBeforeSubmit: "Two exact division statements share the fixed divisor seven. The quotient fields for seven divided by seven and fourteen divided by seven are empty.",
                authorOnlyNotes: [],
            },
            response: { kind: "quotient_pair", submitLabel: "Check values", editableFields: ["quotient_1", "quotient_2"] },
            answer: { quotientPair: [1, 2] },
            policy: repairQuestionPolicy,
            observableErrorSignals: genericSignals,
            routeTags: ["supported_repair", "does_not_count_as_mastery"],
        },
        freshIndependentRecheck: {
            id: "R-SHARED-RECHECK",
            stage: "confirmation",
            family: "STEP",
            studentFacing: {
                stageLabel: "Check the repair",
                title: "Complete both quotient changes",
                prompt: "In 8/9 × 15/20, cancel 8 and 20 by 4. Enter both new values.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Fresh unsupported same-divisor quotient evidence.",
                routeNotes: ["Expected quotient pair is 2 and 5."],
                leakageNotes: ["The divisor is part of the question; quotients are not displayed before lock."],
                sourcePage: 32,
            },
            visual: {
                kind: "repair_shared_divisor",
                math: R_SHARED_CHECK_PRODUCT,
                visibleExpression: "8/9 × 15/20; cancel 8 and 20 by 4",
                beforeSubmitState: ["Two empty quotient fields beside 8 and 20."],
                afterSubmitState: ["8÷4=2 and 20÷4=5; remaining product may then finish at 2/3."],
                accessibleDescriptionBeforeSubmit: "The selected pair is 8 and 20 with supplied divisor 4. Two quotient fields are empty.",
                authorOnlyNotes: [],
            },
            response: { kind: "quotient_pair", submitLabel: "Submit", editableFields: ["quotient_8", "quotient_20"] },
            answer: { quotientPair: [2, 5], finalFraction: fraction(2, 3) },
            policy: recoveryCheckPolicy,
            observableErrorSignals: genericSignals,
            workedCheck: finalWorkedCheck(["8 ÷ 4 = 2.", "20 ÷ 4 = 5."], "2 and 5"),
            routeTags: ["fresh_repair_recheck", "SHARED_recovery_evidence"],
        },
        resumeRule: "Correct unsupported quotient pair resumes at the next unsatisfied stage. A wrong factor choice with matched exact changes receives factor-choice feedback rather than replaying R-SHARED.",
    },
    {
        id: "R-TERM",
        family: "TERM",
        authorOnlyTrigger: "An explicit visible cancellation of one term inside an addition/subtraction with a denominator factor, or repeated acceptance of that move.",
        teachingUtteranceIds: ["R-TERM.1", "R-TERM.2", "R-TERM.3", "R-TERM.4"],
        visual: {
            kind: "repair_complete_factor",
            math: TERM_PRODUCT,
            visibleExpression: "(3 + 5)/12 × 9/10",
            beforeSubmitState: ["The 5 is labelled TERM; the whole bracket is labelled COMPLETE FACTOR."],
            afterSubmitState: ["Bracket evaluates to 8; valid complete-factor cancellation begins."],
            accessibleDescriptionBeforeSubmit: "The number five is shown inside the bracketed sum three plus five. The entire bracket is marked as the complete numerator factor.",
            authorOnlyNotes: ["Do not expand into algebraic cancellation rules."],
        },
        supportedInteraction: {
            id: "R-TERM-SUPPORTED",
            stage: "repair",
            family: "FACTOR_BOUNDARY",
            studentFacing: {
                stageLabel: "Repair",
                title: "Select the complete numerator factor",
                prompt: "Tap the complete numerator factor in (3 + 5)/12 × 9/10.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Supported recognition of the bracket as one complete factor.",
                routeNotes: ["Individual terms are not draggable to the denominator."],
                leakageNotes: ["The prompt does not name the answer object beyond complete factor."],
                sourcePage: 33,
            },
            visual: {
                kind: "repair_complete_factor",
                math: TERM_PRODUCT,
                visibleExpression: "(3 + 5)/12 × 9/10",
                beforeSubmitState: ["Selectable targets include 3, 5, (3+5), 9 and 10."],
                afterSubmitState: ["The entire bracket receives one outline and evaluates to 8."],
                accessibleDescriptionBeforeSubmit: "Five selectable expression regions are available, including the whole bracketed sum three plus five.",
                authorOnlyNotes: [],
            },
            response: {
                kind: "factor_selection",
                submitLabel: "Check selection",
                choices: [
                    { id: "TERM_3", text: "3" },
                    { id: "TERM_5", text: "5" },
                    { id: "BRACKET", text: "(3 + 5)" },
                    { id: "FACTOR_9", text: "9" },
                    { id: "FACTOR_10", text: "10" },
                ],
                acceptedChoiceIds: ["BRACKET"],
            },
            answer: { choiceIds: ["BRACKET"] },
            policy: repairQuestionPolicy,
            observableErrorSignals: M4_TERM_SIGNALS,
            routeTags: ["supported_repair", "does_not_count_as_mastery"],
        },
        freshIndependentRecheck: {
            id: "R-TERM-RECHECK",
            stage: "confirmation",
            family: "ERROR",
            studentFacing: {
                stageLabel: "Check the repair",
                title: "Is the term cancellation valid?",
                prompt: "Is cancelling the 4 in (4 + 8)/15 with 10 valid?",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Fresh unsupported complete-factor boundary evidence.",
                routeNotes: ["Correct response is No; the complete numerator factor is the entire bracket."],
                leakageNotes: ["Do not outline the bracket before submit."],
                sourcePage: 33,
            },
            visual: {
                kind: "term_vs_factor_contrast",
                math: R_TERM_CHECK_PRODUCT,
                visibleExpression: "(4 + 8)/15 × 7/10",
                beforeSubmitState: ["The proposed strike through 4 and 10 is shown as the claim under review."],
                afterSubmitState: ["Evaluate bracket to 12; show valid factor route and final 14/25."],
                accessibleDescriptionBeforeSubmit: "The expression open bracket four plus eight close bracket over fifteen times seven tenths is shown with a proposed cancellation of four against ten. No validity conclusion is supplied.",
                authorOnlyNotes: [],
            },
            response: {
                kind: "single_choice",
                submitLabel: "Submit",
                choices: [
                    { id: "YES", text: "Yes. 4 and 10 share 2." },
                    { id: "NO", text: "No. The complete numerator factor is the whole bracket." },
                ],
                acceptedChoiceIds: ["NO"],
            },
            answer: { choiceIds: ["NO"], finalFraction: fraction(14, 25) },
            policy: recoveryCheckPolicy,
            observableErrorSignals: M4_TERM_SIGNALS,
            workedCheck: finalWorkedCheck(["4 is one term inside (4 + 8), so it cannot cancel alone.", "Evaluate the bracket to 12/15 × 7/10.", "The product simplifies to 14/25."], "No; final product 14/25"),
            routeTags: ["fresh_repair_recheck", "TERM_recovery_evidence"],
        },
        resumeRule: "Correct unsupported recheck resumes at the next unsatisfied stage. Another explicit term cancellation remains in R-TERM with a fresh numeric bracket.",
    },
    {
        id: "R-NONE",
        family: "NONE",
        authorOnlyTrigger: "Repeated invented cancellation after a neutral cross-pair check, or an explicit rule that every fraction product must cancel.",
        teachingUtteranceIds: ["R-NONE.1", "R-NONE.2", "R-NONE.3"],
        visual: {
            kind: "repair_cross_pair_grid",
            math: NO_CANCEL_PRODUCT,
            visibleExpression: "5/8 × 7/9",
            beforeSubmitState: ["Four cross-pair checks: 5&8, 5&9, 7&8, 7&9."],
            afterSubmitState: ["Each shared-factor result is 1, then 35/72 appears."],
            accessibleDescriptionBeforeSubmit: "All four numerator-denominator pairings are shown for five eighths times seven ninths. Each pair is checked for a factor greater than one.",
            authorOnlyNotes: ["Do not frame no cancellation as failure."],
        },
        supportedInteraction: {
            id: "R-NONE-SUPPORTED",
            stage: "repair",
            family: "NO_CANCEL",
            studentFacing: {
                stageLabel: "Repair",
                title: "Check the four cross pairs",
                prompt: "For each pair in 5/8 × 7/9, choose whether it shares a factor greater than one.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Supported exhaustive pair check that unlocks multiply-as-written only after four No responses.",
                routeNotes: ["Does not count as mastery."],
                leakageNotes: ["The result remains learner work until all four checks are committed."],
                sourcePage: 34,
            },
            visual: {
                kind: "repair_cross_pair_grid",
                math: NO_CANCEL_PRODUCT,
                visibleExpression: "5/8 × 7/9",
                beforeSubmitState: ["Four yes/no pair tiles are unanswered."],
                afterSubmitState: ["All four tiles show shared factor 1; multiply button unlocks."],
                accessibleDescriptionBeforeSubmit: "Four yes-or-no controls correspond to pairs 5 and 8, 5 and 9, 7 and 8, and 7 and 9.",
                authorOnlyNotes: [],
            },
            response: {
                kind: "single_choice",
                submitLabel: "Check pairs",
                choices: [
                    { id: "ALL_NO", text: "No pair shares a factor greater than one." },
                    { id: "SOME_YES", text: "At least one pair shares a factor greater than one." },
                ],
                acceptedChoiceIds: ["ALL_NO"],
            },
            answer: { choiceIds: ["ALL_NO"], finalFraction: fraction(35, 72) },
            policy: repairQuestionPolicy,
            observableErrorSignals: [
                {
                    family: "NONE",
                    observableEvidence: "Claims at least one cross pair must cancel.",
                    immediateUtteranceIds: [],
                    requiresRepeatBeforeStableClassification: true,
                    repairId: "R-NONE",
                },
            ],
            routeTags: ["supported_repair", "does_not_count_as_mastery"],
        },
        freshIndependentRecheck: {
            id: "R-NONE-RECHECK",
            stage: "confirmation",
            family: "REASON",
            studentFacing: {
                stageLabel: "Check the repair",
                title: "Which product has no cancellation?",
                prompt: "Choose the product with no valid pre-multiplication cancellation.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Fresh unsupported discrimination of a no-cancel product among cancellable products.",
                routeNotes: ["Correct option A."],
                leakageNotes: ["No pair checks appear until answer lock."],
                sourcePage: 34,
            },
            visual: {
                kind: "no_cancel_mcq",
                visibleExpression: "A 7/10 × 9/11   B 8/15 × 9/12   C 6/13 × 26/21",
                beforeSubmitState: ["Three product cards; no cancellation marks."],
                afterSubmitState: ["A has no cross shared factor >1; B and C each show at least one valid pair."],
                accessibleDescriptionBeforeSubmit: "Three fraction products are listed as choices: seven tenths times nine elevenths, eight fifteenths times nine twelfths, and six thirteenths times twenty-six twenty-firsts.",
                authorOnlyNotes: ["The visual must not pre-group shared-factor pairs."],
            },
            response: {
                kind: "single_choice",
                submitLabel: "Submit",
                choices: [
                    { id: "A", text: "7/10 × 9/11" },
                    { id: "B", text: "8/15 × 9/12" },
                    { id: "C", text: "6/13 × 26/21" },
                ],
                acceptedChoiceIds: ["A"],
            },
            answer: { choiceIds: ["A"], finalFraction: fraction(63, 110) },
            policy: recoveryCheckPolicy,
            observableErrorSignals: [
                {
                    family: "NONE",
                    observableEvidence: "Chooses a product that contains a valid cancellation instead of the no-cancel product.",
                    immediateUtteranceIds: [],
                    requiresRepeatBeforeStableClassification: true,
                    repairId: "R-NONE",
                },
            ],
            workedCheck: finalWorkedCheck(["In A, every cross numerator-denominator pair shares only 1.", "B and C each contain at least one valid shared-factor pair."], "Option A"),
            routeTags: ["fresh_repair_recheck", "NONE_recovery_evidence"],
        },
        resumeRule: "Correct unsupported discrimination resumes at the next unsatisfied stage. A repeated always-cancel response remains in R-NONE with new products.",
    },
    {
        id: "R-FINISH",
        family: "FINISH",
        authorOnlyTrigger: "Repeated stopping at a reduced product after a prompt, or recurrence in final evidence; also final answer left equivalent but not in simplest form when simplest form is required.",
        teachingUtteranceIds: ["R-FINISH.1", "R-FINISH.2", "R-FINISH.3"],
        visual: {
            kind: "repair_finish_trays",
            math: C_DIRECT_PRODUCT,
            visibleExpression: "10/21 × 14/25 → 2/3 × 2/5",
            beforeSubmitState: ["The correctly reduced product 2/3 × 2/5 is visible."],
            afterSubmitState: ["Top factors enter numerator tray; bottom factors enter denominator tray; 4/15 appears."],
            accessibleDescriptionBeforeSubmit: "The product has already been reduced to two thirds times two fifths. The final numerator and denominator multiplication have not been completed.",
            authorOnlyNotes: ["Separate unfinished product from a lone multiplication fact slip."],
        },
        supportedInteraction: {
            id: "R-FINISH-SUPPORTED",
            stage: "repair",
            family: "DIRECT",
            studentFacing: {
                stageLabel: "Repair",
                title: "Finish the reduced product",
                prompt: "Move the remaining top factors into the numerator tray and the remaining bottom factors into the denominator tray, then complete the final fraction.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Supported completion of the already-correct reduction.",
                routeNotes: ["Does not count as mastery."],
                leakageNotes: ["The final result is not filled automatically."],
                sourcePage: 35,
            },
            visual: {
                kind: "repair_finish_trays",
                math: C_DIRECT_PRODUCT,
                visibleExpression: "2/3 × 2/5",
                beforeSubmitState: ["Draggable factors 2,3,2,5 and empty numerator/denominator trays."],
                afterSubmitState: ["2×2 over 3×5 = 4/15."],
                accessibleDescriptionBeforeSubmit: "The reduced factors are two over three times two over five. Controls allow the two top factors and two bottom factors to be placed into numerator and denominator multiplication trays.",
                authorOnlyNotes: [],
            },
            response: {
                kind: "factor_trays_then_fraction",
                submitLabel: "Check answer",
                editableFields: ["final_numerator", "final_denominator"],
                acceptedFractions: [fraction(4, 15)],
            },
            answer: { finalFraction: fraction(4, 15) },
            policy: repairQuestionPolicy,
            observableErrorSignals: genericSignals,
            routeTags: ["supported_repair", "does_not_count_as_mastery"],
        },
        freshIndependentRecheck: {
            id: "R-FINISH-RECHECK",
            stage: "confirmation",
            family: "DIRECT",
            studentFacing: {
                stageLabel: "Check the repair",
                title: "Finish and simplify",
                prompt: "After cancelling 8/15 × 9/16 to 2/5 × 3/4, calculate the final answer in simplest form.",
                ryanBeforeSubmitUtteranceIds: [],
            },
            authorOnly: {
                assessmentIntent: "Fresh unsupported finish-and-simplify evidence.",
                routeNotes: ["6/20 is value-correct but does not satisfy the required simplest form; expected 3/10."],
                leakageNotes: ["The reduced product is intentionally supplied; the multiplication and simplification are not."],
                sourcePage: 35,
            },
            visual: {
                kind: "product_fraction_input",
                math: R_FINISH_CHECK_PRODUCT,
                visibleExpression: "2/5 × 3/4",
                beforeSubmitState: ["Reduced product is supplied; final fraction fields empty."],
                afterSubmitState: ["2×3 over 5×4 = 6/20; simplify to 3/10."],
                accessibleDescriptionBeforeSubmit: "The reduced product two fifths times three fourths is shown with empty final fraction fields. The instruction requests simplest form.",
                authorOnlyNotes: [],
            },
            response: {
                kind: "fraction_input",
                submitLabel: "Submit",
                editableFields: ["final_numerator", "final_denominator"],
                acceptedFractions: [fraction(3, 10)],
            },
            answer: { finalFraction: fraction(3, 10) },
            policy: recoveryCheckPolicy,
            observableErrorSignals: genericSignals,
            workedCheck: finalWorkedCheck(["2 × 3 over 5 × 4 = 6/20.", "6/20 divides by 2 to give 3/10."], "3/10"),
            routeTags: ["fresh_repair_recheck", "FINISH_recovery_evidence"],
        },
        resumeRule: "Correct simplest-form recheck resumes at the next unsatisfied stage. An isolated wrong product fact receives arithmetic feedback; a repeated stop at 6/20 remains in R-FINISH.",
    },
];
const RM1_PRODUCT = {
    factors: product(18, 25, 10, 27),
    expectedFinal: fraction(4, 15),
    approvedCancellationRoutes: [
        {
            id: "rm1_route",
            steps: [
                {
                    id: "rm1_18_27_by_9",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 9,
                    numeratorBefore: 18,
                    denominatorBefore: 27,
                    numeratorAfter: 2,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Fresh recovery direct pair one.",
                },
                {
                    id: "rm1_10_25_by_5",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 5,
                    numeratorBefore: 10,
                    denominatorBefore: 25,
                    numeratorAfter: 2,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Fresh recovery direct pair two.",
                },
            ],
            reducedProduct: { left: fraction(2, 5), right: fraction(2, 3) },
            final: fraction(4, 15),
        },
    ],
    noUsefulCancellation: false,
};
const RM2_PRODUCT = {
    factors: product(15, 28, 14, 25),
    expectedFinal: fraction(3, 10),
    expectedReducedProduct: { left: fraction(3, 2), right: fraction(1, 5) },
    approvedCancellationRoutes: [
        {
            id: "rm2_prescribed_route",
            steps: [
                {
                    id: "rm2_15_25_by_5",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 5,
                    numeratorBefore: 15,
                    denominatorBefore: 25,
                    numeratorAfter: 3,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Prescribed shared division one.",
                },
                {
                    id: "rm2_14_28_by_14",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 14,
                    numeratorBefore: 14,
                    denominatorBefore: 28,
                    numeratorAfter: 1,
                    denominatorAfter: 2,
                    authorOnlyRationale: "Prescribed shared division two.",
                },
            ],
            reducedProduct: { left: fraction(3, 2), right: fraction(1, 5) },
            final: fraction(3, 10),
        },
    ],
    noUsefulCancellation: false,
};
const RM3_PRODUCT = {
    factors: product(7, 12, 5, 11),
    expectedFinal: fraction(35, 132),
    approvedCancellationRoutes: [],
    noUsefulCancellation: true,
};
const RM4_PRODUCT = {
    factors: product(9, 16, 8, 15),
    expectedFinal: fraction(3, 10),
    approvedCancellationRoutes: [
        {
            id: "rm4_evaluate_then_cancel",
            steps: [
                {
                    id: "rm4_8_16_by_8",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 8,
                    numeratorBefore: 8,
                    denominatorBefore: 16,
                    numeratorAfter: 1,
                    denominatorAfter: 2,
                    authorOnlyRationale: "Valid only after (2+7) is treated as complete factor 9.",
                },
                {
                    id: "rm4_9_15_by_3",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 3,
                    numeratorBefore: 9,
                    denominatorBefore: 15,
                    numeratorAfter: 3,
                    denominatorAfter: 5,
                    authorOnlyRationale: "Second complete-factor cancellation.",
                },
            ],
            reducedProduct: { left: fraction(3, 2), right: fraction(1, 5) },
            final: fraction(3, 10),
        },
    ],
    noUsefulCancellation: false,
    containsAdditiveTerm: true,
    authorOnlyNotes: ["Original learner-visible expression is (2 + 7)/16 × 8/15."],
};
const RM5_PRODUCT = {
    factors: product(18, 24, 7, 21),
    expectedFinal: fraction(1, 4),
    approvedCancellationRoutes: [
        {
            id: "rm5_within_then_cross",
            steps: [
                {
                    id: "rm5_a_18_24_by_6",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 6,
                    numeratorBefore: 18,
                    denominatorBefore: 24,
                    numeratorAfter: 3,
                    denominatorAfter: 4,
                    authorOnlyRationale: "Simplify the left factor first.",
                },
                {
                    id: "rm5_a_7_21_by_7",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 7,
                    numeratorBefore: 7,
                    denominatorBefore: 21,
                    numeratorAfter: 1,
                    denominatorAfter: 3,
                    authorOnlyRationale: "Then simplify the right factor.",
                },
                {
                    id: "rm5_a_3_3_by_3",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 3,
                    numeratorBefore: 3,
                    denominatorBefore: 3,
                    numeratorAfter: 1,
                    denominatorAfter: 1,
                    authorOnlyRationale: "Complete remaining cross cancellation.",
                },
            ],
            reducedProduct: { left: fraction(1, 4), right: fraction(1, 1) },
            final: fraction(1, 4),
        },
        {
            id: "rm5_cross_then_within",
            steps: [
                {
                    id: "rm5_b_18_21_by_3",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 3,
                    numeratorBefore: 18,
                    denominatorBefore: 21,
                    numeratorAfter: 6,
                    denominatorAfter: 7,
                    authorOnlyRationale: "Cross-cancel first.",
                },
                {
                    id: "rm5_b_7_7_by_7",
                    numeratorSlot: "right_numerator",
                    denominatorSlot: "right_denominator",
                    divisor: 7,
                    numeratorBefore: 7,
                    denominatorBefore: 7,
                    numeratorAfter: 1,
                    denominatorAfter: 1,
                    authorOnlyRationale: "Cancel remaining 7/7 factor pair.",
                },
                {
                    id: "rm5_b_6_24_by_6",
                    numeratorSlot: "left_numerator",
                    denominatorSlot: "left_denominator",
                    divisor: 6,
                    numeratorBefore: 6,
                    denominatorBefore: 24,
                    numeratorAfter: 1,
                    denominatorAfter: 4,
                    authorOnlyRationale: "Finish within the left factor.",
                },
            ],
            reducedProduct: { left: fraction(1, 4), right: fraction(1, 1) },
            final: fraction(1, 4),
        },
    ],
    noUsefulCancellation: false,
};
exports.FRA25_REPLACEMENT_FINALS = [
    {
        id: "RM1-DIRECT",
        stage: "recovery_final",
        family: "DIRECT",
        studentFacing: {
            stageLabel: "Fresh final check",
            title: "Simplify before multiplying",
            prompt: "Calculate 18/25 × 10/27. Give the answer in simplest form.",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "Replacement DIRECT evidence; not a replay of M1.",
            routeNotes: ["May replace a failed DIRECT evidence slot after targeted repair."],
            leakageNotes: ["No hints or pair highlights before lock."],
            sourcePage: 29,
        },
        visual: {
            kind: "product_fraction_input",
            math: RM1_PRODUCT,
            visibleExpression: "18/25 × 10/27",
            beforeSubmitState: ["Empty final fraction fields; no hints."],
            afterSubmitState: ["18&27 ÷9; 10&25 ÷5; 2/5 × 2/3 = 4/15."],
            accessibleDescriptionBeforeSubmit: "The product eighteen twenty-fifths times ten twenty-sevenths is shown with empty answer fields. No useful pair is identified.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "fraction_input",
            submitLabel: "Submit",
            editableFields: ["final_numerator", "final_denominator"],
            acceptedFractions: [fraction(4, 15)],
            acceptsAnyApprovedCancellationRoute: true,
        },
        answer: { finalFraction: fraction(4, 15) },
        policy: finalPolicy,
        observableErrorSignals: genericSignals,
        workedCheck: finalWorkedCheck(["18 and 27 divide by 9.", "10 and 25 divide by 5.", "2/5 × 2/3 = 4/15."], "4/15"),
        routeTags: ["replacement_final", "DIRECT_slot"],
    },
    {
        id: "RM2-STEP",
        stage: "recovery_final",
        family: "STEP",
        studentFacing: {
            stageLabel: "Fresh final check",
            title: "Complete the stated reductions",
            prompt: "For 15/28 × 14/25, divide 15 and 25 by 5, and divide 14 and 28 by 14. Enter the reduced product and final fraction.",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "Replacement STEP evidence with new values and prescribed divisors.",
            routeNotes: ["May replace a failed STEP evidence slot."],
            leakageNotes: ["The supplied divisors do not reveal the quotients."],
            sourcePage: 29,
        },
        visual: {
            kind: "reduced_product_input",
            math: RM2_PRODUCT,
            visibleExpression: "15/28 × 14/25",
            beforeSubmitState: ["Prescribed divisions visible; quotient and final fields empty."],
            afterSubmitState: ["15÷5=3, 25÷5=5, 14÷14=1, 28÷14=2; 3/2 × 1/5 = 3/10."],
            accessibleDescriptionBeforeSubmit: "The product fifteen twenty-eighths times fourteen twenty-fifths is shown. The instruction supplies divisors five and fourteen but not the quotients.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "reduced_product_and_fraction_input",
            submitLabel: "Submit",
            editableFields: [
                "left_reduced_numerator",
                "left_reduced_denominator",
                "right_reduced_numerator",
                "right_reduced_denominator",
                "final_numerator",
                "final_denominator",
            ],
            acceptedReducedProducts: [{ left: fraction(3, 2), right: fraction(1, 5) }],
            acceptedFractions: [fraction(3, 10)],
        },
        answer: {
            reducedProduct: { left: fraction(3, 2), right: fraction(1, 5) },
            finalFraction: fraction(3, 10),
        },
        policy: finalPolicy,
        observableErrorSignals: genericSignals,
        workedCheck: finalWorkedCheck(["15÷5=3 and 25÷5=5.", "14÷14=1 and 28÷14=2.", "3/2 × 1/5 = 3/10."], "Reduced product 3/2 × 1/5; final 3/10"),
        routeTags: ["replacement_final", "STEP_slot"],
    },
    {
        id: "RM3-REASON",
        stage: "recovery_final",
        family: "REASON",
        studentFacing: {
            stageLabel: "Fresh final check",
            title: "Decide whether to cancel",
            prompt: "For 7/12 × 5/11, choose the valid next step.",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "Replacement REASON evidence for the no-cancel boundary.",
            routeNotes: ["Correct choice is multiply as written to 35/132."],
            leakageNotes: ["No cross-pair conclusions before lock."],
            sourcePage: 29,
        },
        visual: {
            kind: "no_cancel_mcq",
            math: RM3_PRODUCT,
            visibleExpression: "7/12 × 5/11",
            beforeSubmitState: ["Four next-step choices; no preselection."],
            afterSubmitState: ["Four cross-pair checks, then 35/132."],
            accessibleDescriptionBeforeSubmit: "The product seven twelfths times five elevenths and four possible next steps are shown. No shared-factor result is supplied.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Submit",
            choices: [
                { id: "A", text: "Cancel 7 with 12." },
                { id: "B", text: "Cancel 5 with 11." },
                { id: "C", text: "Cancel 12 with 11." },
                { id: "D", text: "No cancellation is valid; multiply to 35/132." },
            ],
            acceptedChoiceIds: ["D"],
        },
        answer: { choiceIds: ["D"], finalFraction: fraction(35, 132) },
        policy: finalPolicy,
        observableErrorSignals: [
            {
                family: "NONE",
                observableEvidence: "Invents a cancellation in a product with no useful cross pair.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-NONE",
            },
            {
                family: "PAIR",
                observableEvidence: "Selects denominator-with-denominator option C.",
                immediateUtteranceIds: [],
                requiresRepeatBeforeStableClassification: true,
                repairId: "R-PAIR",
            },
        ],
        workedCheck: finalWorkedCheck(["No numerator-denominator pair shares a factor greater than one.", "Multiply as written: 7×5 over 12×11 = 35/132."], "Option D; 35/132"),
        routeTags: ["replacement_final", "REASON_slot"],
    },
    {
        id: "RM4-ERROR",
        stage: "recovery_final",
        family: "ERROR",
        studentFacing: {
            stageLabel: "Fresh final check",
            title: "Protect the complete factor",
            prompt: "A student cancels the 2 in (2 + 7)/16 with 8. Is the step valid?",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "Replacement ERROR evidence for the factor-versus-term boundary.",
            routeNotes: ["Correct response protects the whole bracket and may then finish at 3/10."],
            leakageNotes: ["Do not outline the bracket before lock."],
            sourcePage: 29,
        },
        visual: {
            kind: "term_vs_factor_contrast",
            math: RM4_PRODUCT,
            visibleExpression: "(2 + 7)/16 × 8/15",
            beforeSubmitState: ["Proposed strike through 2 and 8 shown as the claim under review."],
            afterSubmitState: ["Evaluate bracket to 9; valid reductions give 3/10."],
            accessibleDescriptionBeforeSubmit: "The expression open bracket two plus seven close bracket over sixteen times eight fifteenths is shown with a proposed cancellation of two against eight. No conclusion is supplied.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Submit",
            choices: [
                { id: "A", text: "Valid, because 2 and 8 share 2." },
                { id: "B", text: "Not valid, because 2 is a term inside a sum rather than the complete factor." },
                { id: "C", text: "Valid, because the smaller number may always cancel." },
                { id: "D", text: "Not valid only because 2 is even." },
            ],
            acceptedChoiceIds: ["B"],
        },
        answer: { choiceIds: ["B"], finalFraction: fraction(3, 10) },
        policy: finalPolicy,
        observableErrorSignals: M4_TERM_SIGNALS,
        workedCheck: finalWorkedCheck(["2 is one term in (2+7), not the whole numerator factor.", "Evaluate the bracket to 9/16 × 8/15.", "Valid complete-factor reductions give 3/10."], "Option B; 3/10"),
        routeTags: ["replacement_final", "ERROR_slot"],
    },
    {
        id: "RM5-MATCH",
        stage: "recovery_final",
        family: "MATCH",
        studentFacing: {
            stageLabel: "Fresh final check",
            title: "Compare valid routes",
            prompt: "Which statement about 18/24 × 7/21 is correct?",
            ryanBeforeSubmitUtteranceIds: [],
        },
        authorOnly: {
            assessmentIntent: "Replacement MATCH evidence using new values and two valid orders.",
            routeNotes: ["Both described routes preserve the product and finish at 1/4."],
            leakageNotes: ["No route receives a correctness marker before lock."],
            sourcePage: 29,
        },
        visual: {
            kind: "route_comparison_mcq",
            math: RM5_PRODUCT,
            visibleExpression: "18/24 × 7/21",
            beforeSubmitState: [
                "Route A simplifies 18/24 then 7/21.",
                "Route B cancels 18 with 21 first, then finishes the remaining reductions.",
            ],
            afterSubmitState: ["Both routes finish at 1/4."],
            accessibleDescriptionBeforeSubmit: "Two different reduction orders are described for eighteen twenty-fourths times seven twenty-firsts. Four statements ask which routes preserve the product.",
            authorOnlyNotes: [],
        },
        response: {
            kind: "single_choice",
            submitLabel: "Submit",
            choices: [
                { id: "A", text: "Only Route A is valid." },
                { id: "B", text: "Only Route B is valid." },
                { id: "C", text: "Both routes are valid and give 1/4." },
                { id: "D", text: "Neither route is valid because cancellation must start on the left." },
            ],
            acceptedChoiceIds: ["C"],
        },
        answer: { choiceIds: ["C"], finalFraction: fraction(1, 4) },
        policy: finalPolicy,
        observableErrorSignals: [
            {
                family: "UNKNOWN",
                observableEvidence: "Accepts only one valid route; confirm route-flexibility reasoning.",
                immediateUtteranceIds: ["UNKNOWN.REDIRECT"],
                requiresRepeatBeforeStableClassification: true,
            },
        ],
        workedCheck: finalWorkedCheck(["Route A and Route B use only exact shared divisions across numerator and denominator factors.", "Both reduce to 1/4."], "Option C; 1/4"),
        routeTags: ["replacement_final", "MATCH_slot"],
    },
];
const blockingFamilies = ["PAIR", "SHARED", "TERM", "NONE", "FINISH"];
function shouldSkipF1(params) {
    return (params.g1.firstAttemptCorrect &&
        params.g2.firstAttemptCorrect &&
        !params.g1.hintOpenedBeforeSubmit &&
        !params.g2.hintOpenedBeforeSubmit &&
        !params.g1.supportEscalated &&
        !params.g2.supportEscalated &&
        !params.unresolvedCentralErrors.some((family) => blockingFamilies.includes(family)));
}
function confirmationNeededAfterPractice(records) {
    const ids = new Set();
    for (const record of records) {
        if (!record.hintOpenedBeforeSubmit || !record.firstAttemptCorrect)
            continue;
        if (record.family === "DIRECT")
            ids.add("C-DIRECT");
        if (["PAIR_VALIDITY", "ERROR"].includes(record.family))
            ids.add("C-PAIR");
    }
    return [...ids];
}
function canProceedToFinal(params) {
    if (params.unresolvedCentralErrors.some((family) => blockingFamilies.includes(family)))
        return false;
    const requiredConfirmations = confirmationNeededAfterPractice(params.independent);
    return requiredConfirmations.every((id) => params.confirmations.some((record) => record.questionId === id && record.firstAttemptCorrect && !record.hintOpenedBeforeSubmit));
}
const familyToReplacementId = {
    DIRECT: "RM1-DIRECT",
    STEP: "RM2-STEP",
    REASON: "RM3-REASON",
    ERROR: "RM4-ERROR",
    MATCH: "RM5-MATCH",
    PAIR_VALIDITY: "RM5-MATCH",
    NO_CANCEL: "RM3-REASON",
    FACTOR_BOUNDARY: "RM4-ERROR",
};
const errorToRepairId = {
    PAIR: "R-PAIR",
    SHARED: "R-SHARED",
    TERM: "R-TERM",
    NONE: "R-NONE",
    FINISH: "R-FINISH",
};
const unique = (values) => [...new Set(values)];
function evaluatePrimaryFinal(records) {
    const finalIds = new Set(exports.FRA25_FINAL_QUESTIONS.map((question) => question.id));
    const committed = records.filter((record) => finalIds.has(record.questionId));
    const correctCount = committed.filter((record) => record.firstAttemptCorrect).length;
    const repeatedErrors = new Map();
    for (const record of committed) {
        for (const family of record.observedErrorFamilies) {
            repeatedErrors.set(family, (repeatedErrors.get(family) ?? 0) + 1);
        }
    }
    const blockers = [...repeatedErrors.entries()]
        .filter(([family, count]) => blockingFamilies.includes(family) && count >= 2)
        .map(([family]) => family);
    const proceduralSecure = committed.some((record) => record.firstAttemptCorrect && ["DIRECT", "STEP"].includes(record.family));
    const reasoningSecure = committed.some((record) => record.firstAttemptCorrect && ["REASON", "ERROR", "MATCH"].includes(record.family));
    if (correctCount >= 4 && proceduralSecure && reasoningSecure && blockers.length === 0) {
        return {
            action: "finish",
            correctCount,
            blockingFamilies: [],
            repairIds: [],
            recoveryQuestionIds: [],
            authorOnlyReason: "At least 4/5 first-attempt independent with procedural and reasoning/error breadth and no repeated blocker.",
        };
    }
    const missed = committed.filter((record) => !record.firstAttemptCorrect);
    const repairIds = unique(missed
        .flatMap((record) => record.observedErrorFamilies)
        .map((family) => errorToRepairId[family])
        .filter((id) => Boolean(id)));
    const replacements = unique(missed.map((record) => familyToReplacementId[record.family]));
    if (correctCount === 3) {
        const twoItems = unique([
            ...replacements,
            reasoningSecure ? "RM1-DIRECT" : "RM4-ERROR",
            proceduralSecure ? "RM3-REASON" : "RM1-DIRECT",
        ]).slice(0, 2);
        return {
            action: "repair_then_two_item_check",
            correctCount,
            blockingFamilies: blockers,
            repairIds,
            recoveryQuestionIds: twoItems,
            authorOnlyReason: "Exactly 3/5: repair the observable missed family, then require 2/2 on fresh no-hint evidence.",
        };
    }
    const threeItems = unique([
        ...replacements,
        "RM1-DIRECT",
        "RM3-REASON",
        "RM4-ERROR",
        "RM2-STEP",
        "RM5-MATCH",
    ]).slice(0, 3);
    return {
        action: "repair_then_three_item_final",
        correctCount,
        blockingFamilies: blockers,
        repairIds,
        recoveryQuestionIds: threeItems,
        authorOnlyReason: "0-2/5 or insufficient breadth: repair actual weaknesses, then require 3/3 on a fresh three-item final.",
    };
}
function recoveryRoutePasses(params) {
    return params.requiredQuestionIds.every((id) => params.records.some((record) => record.questionId === id &&
        record.firstAttemptCorrect &&
        !record.hintOpenedBeforeSubmit &&
        record.answerLocked));
}
exports.FRA25_OUTCOME_BINDINGS = {
    G1: {
        correct: ["G1.CORRECT"],
        incorrectByFamily: { SHARED: ["G1.SHARED_REDIRECT"] },
        rule: "Compute correctness and observable family first; play exactly one matching branch.",
    },
    G2: {
        correct: ["G2.CORRECT"],
        incorrectByFamily: {},
        rule: "Visible targeted feedback may appear without being Ryan speech unless a runtime ID is explicitly added.",
    },
    FINAL: {
        correct: ["FINAL.CORRECT"],
        incorrectByFamily: { DEFAULT: ["FINAL.INCORRECT"] },
        rule: "Play exactly one outcome line after answer lock and before the worked check.",
    },
};
exports.FRA25_MISCONCEPTION_MAP = [
    {
        family: "PAIR",
        possibleEvidence: "Cancels 6 with 15 in 6/7 × 15/14, or cancels denominator with denominator.",
        immediateVisibleFeedback: "Those numbers are on the same side. A valid pair uses one numerator and one denominator.",
        stableRepairThreshold: "Explicit same-side rule or repeat across two structures; one isolated ambiguous answer is insufficient.",
        repairId: "R-PAIR",
    },
    {
        family: "SHARED",
        possibleEvidence: "Changes 14 to 2 but leaves 7 unchanged, or applies different divisors to one pair.",
        immediateVisibleFeedback: "A cancellation is one shared division. Use the same factor on both numbers.",
        stableRepairThreshold: "Repeat after direct cue, or a visible systematic one-sided method.",
        repairId: "R-SHARED",
    },
    {
        family: "TERM",
        possibleEvidence: "Cancels 5 inside (3+5) with 10.",
        immediateVisibleFeedback: "The 5 is one term of a sum, not a complete factor.",
        stableRepairThreshold: "One explicit written term-cancellation line is strong evidence; otherwise use a fresh confirmation.",
        repairId: "R-TERM",
    },
    {
        family: "NONE",
        possibleEvidence: "Invents a cancellation in 5/8 × 7/9 or states that something must cancel.",
        immediateVisibleFeedback: "No cross pair shares a factor greater than one. Multiply as written.",
        stableRepairThreshold: "Repeat or explicit always-cancel rule.",
        repairId: "R-NONE",
    },
    {
        family: "FINISH",
        possibleEvidence: "Stops at reduced factors or leaves the final product unsimplified.",
        immediateVisibleFeedback: "The efficient start is not the final answer. Multiply the factors left, then check simplest form.",
        stableRepairThreshold: "Repeat after prompt or recurrence in final evidence.",
        repairId: "R-FINISH",
    },
    {
        family: "ARITHMETIC",
        possibleEvidence: "Correct structure with one wrong quotient or product fact.",
        immediateVisibleFeedback: "Your structure is right. Recheck that exact number fact.",
        stableRepairThreshold: "Do not classify as a cancellation misconception from one arithmetic slip.",
    },
    {
        family: "UNKNOWN",
        possibleEvidence: "Blank, malformed or unexplained wrong fraction.",
        immediateVisibleFeedback: "Show the pair you used and the divisor.",
        stableRepairThreshold: "Use a fresh discriminating item; never claim hidden reasoning from an ambiguous response.",
    },
];
exports.FRA25_LESSON_SPEC = {
    id: "FRA-25",
    strand: "Fractions",
    phase: "Number",
    title: "Simplify Before Multiplying Fractions",
    status: "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
    contentVersion: "FRA25-HANDOFF-V1",
    ageRange: "11-16",
    estimatedMinutes: {
        strongRoute: 10,
        standardRoute: 12,
        repairRoutes: "evidence-dependent",
    },
    sourceOfTruth: {
        structuredRuntimeQuestionsRoutesAndValidation: "src/lessons/fractions/FRA-25/LessonSpec.ts",
        visualGeometryAndOwnerApprovedPedagogy: "Revily_FRA-25_Storyboard_v1.pdf",
        engineeringIntegrationAndQA: "codex-prompts/FRA-25/CodexPrompt.md",
        startInstruction: "codex-prompts/FRA-25/StartPrompt.md",
        precedence: "LessonSpec.ts controls exact Ryan runtime copy, captions, question data, answers, outcome branches, routes, repairs, confirmations, recovery and validators. The PDF controls approved visual composition and pedagogical intent except for the documented F2 mathematical correction. CodexPrompt.md controls repository integration and QA. If another material conflict appears, stop and report it rather than silently redesigning the lesson.",
    },
    curriculumBoundary: {
        objective: "Use common factors to cancel across a fraction product before multiplying, while preserving the product's value.",
        studentFacingIdea: "Divide a numerator factor and a denominator factor by the same number before you multiply.",
        prerequisites: [
            "FRA-10: write a fraction in simplest form.",
            "FRA-24: multiply two fractions.",
            "Common-factor and exact-division knowledge.",
        ],
        teaches: [
            "positive products of two fractions",
            "cross-cancellation between one numerator factor and one denominator factor",
            "known FRA-10 simplification within one factor before multiplying",
            "recognition of one, two or no useful cancellations",
            "any valid cancellation order that preserves the product",
            "multiplication of remaining factors and final simplest-form check",
            "DIRECT, STEP, REASON, ERROR and MATCH evidence families",
        ],
        deliberatelyExcludes: [
            "re-teaching the basic FRA-24 multiply-straight-across rule as the target",
            "reciprocals or fraction division, owned by FRA-26 and later lessons",
            "mixed-number multiplication or division as the main target",
            "cancelling terms joined by addition or subtraction",
            "negative fractions, zero denominators or algebraic fractions",
            "prime-factorisation or HCF algorithms as new lesson targets",
            "approximation, decimals or percentage conversion",
            "cancelling numerator with numerator or denominator with denominator",
            "global Diagnostic, dosage, Retrieval, spaced review or cross-skill placement",
        ],
    },
    runtimeCopyContract: {
        audioResolver: "FRA25_RUNTIME_COPY[utteranceId].text",
        captionResolver: "the same utterance ID and exact text",
        noPermanentTranscriptBar: true,
        wordTimedOnCanvasCaptions: true,
        authoringCopyNeverSpoken: true,
        questionPromptsHintsChoicesAndWorkingAreSemanticUIByDefault: true,
        removedSpeechMustRemoveOrRemapCaptionAndCue: true,
        noShellGeneratedPraiseAroundCanonicalCopy: true,
        semanticRepetitionAuditRequired: true,
    },
    entryCheck: {
        enabled: false,
        reason: "This package implements only the current within-lesson FRA-25 experience.",
    },
    retrieval: {
        enabled: false,
        reason: "Delayed retrieval and scheduling are separate future systems.",
    },
    sourceCorrections: exports.FRA25_SOURCE_CORRECTIONS,
    teachingScenes: exports.FRA25_TEACHING_SCENES,
    stageTransitionUtteranceIds: {
        independent: ["INDEPENDENT.TRANSITION"],
        hintConfirmation: ["HINT.CONFIRMATION"],
        finalIntro: ["FINAL.INTRO"],
        completion: ["COMPLETE.1"],
    },
    outcomeBindings: exports.FRA25_OUTCOME_BINDINGS,
    primaryQuestions: exports.FRA25_PRIMARY_QUESTIONS,
    confirmationQuestions: exports.FRA25_CONFIRMATION_QUESTIONS,
    finalQuestions: exports.FRA25_FINAL_QUESTIONS,
    repairs: exports.FRA25_REPAIRS,
    replacementFinals: exports.FRA25_REPLACEMENT_FINALS,
    misconceptionMap: exports.FRA25_MISCONCEPTION_MAP,
    route: {
        orderedStages: [
            "HOOK",
            "T1",
            "T2",
            "T3",
            "T4",
            "T5",
            "HANDOFF",
            "G1",
            "G2",
            "F1_CONDITIONAL",
            "F2_REQUIRED",
            "I1",
            "I2",
            "CONFIRMATIONS_IF_NEEDED",
            "M1",
            "M2",
            "M3",
            "M4",
            "M5",
            "FINAL_ROUTING",
            "COMPLETE",
        ],
        strongGate: "Skip F1 only when G1 and G2 are both first-attempt correct, no hint/support escalation occurred and no central error remains. F2 is never skipped.",
        independentGate: "Hint-supported DIRECT success requires C-DIRECT. Hint-supported PAIR_VALIDITY/ERROR success requires C-PAIR. Repeated central errors require matching repair plus fresh independent recheck.",
        finalRule: "4-5/5 can finish only with procedural and reasoning/error breadth and no repeated blocking misconception. 3/5 requires targeted repair then 2/2 fresh mini-check. 0-2/5 requires repair then 3/3 fresh final with no repeated blocker.",
        completion: "Use the existing generic lesson-completion/pathway mechanism. Never hard-code FRA-26 or infer the next skill from the FRA number.",
    },
    persistence: {
        contentVersion: "FRA25-HANDOFF-V1",
        migrationRule: "On version mismatch, preserve only repository-approved durable shell metadata. Clear stale lesson scene IDs, answer-lock state, active audio, caption token timing, speech-led cue progress, transient hints, repair stack and route cursor before restarting or offering the repository's normal start-again flow.",
        resumeRule: "A same-version resume must restore committed responses, evidence, current route, hint use and answer-lock state without replaying stale audio or orphaning captions/highlights.",
    },
    engineeringAcceptance: {
        dataIntegrity: [
            "One question object drives wording, factors, visible expression, expected answer, hints, feedback and worked check.",
            "Every cancellation step uses one numerator slot and one denominator slot, the same positive integer divisor and exact quotients.",
            "Every final answer is mathematically equivalent to the original product and in simplest form where requested.",
            "The page-18 F2 source contradiction is corrected exactly as documented and is not reintroduced from the PDF.",
            "Duplicate question IDs, missing utterances and invalid cue anchors fail validation.",
        ],
        outcomeParity: [
            "Correctness is computed before selecting feedback.",
            "Exactly one branch plays: correct, matching error-specific incorrect or default incorrect.",
            "A wrong response never plays the correct line or continues through an unchanged correct route.",
            "Visible feedback may remain silent semantic UI unless an explicit runtime utterance ID is attached.",
        ],
        leakage: [
            "No scored pre-submit Ryan line names a useful pair, divisor, quotient or final answer.",
            "Optional hints start collapsed and guide without stating the final fraction.",
            "Final hints are absent and final working is impossible before answerLocked is true.",
            "Accessible descriptions expose the given expression and controls but do not identify the correct pair or conclusion.",
            "No solved previous item remains beside a new scored item.",
        ],
        narrationCaptionCue: [
            "TTS receives only FRA25_RUNTIME_COPY text.",
            "Caption text equals the active utterance text and uses the same timing source.",
            "Every mathematical visual event references an existing utterance and exact anchor phrase.",
            "Pause, replay, resume and reduced motion preserve audio-caption-cue parity.",
            "No transcript bar, ghost caption, orphan highlight or stale persisted cue remains.",
            "An auditory semantic-repetition review confirms every consecutive line adds a new function.",
        ],
        visualMathematics: [
            "Every product shows exact factors from its data object.",
            "Cancellation connectors always cross numerator to denominator; same-side examples are visibly marked invalid only when the learner is evaluating that error.",
            "Old values, divisor and both quotients remain visible in shared-division teaching states.",
            "Term-boundary visuals protect the complete bracket and never present one term as a draggable factor.",
            "No-cancel grids check all four cross pairs accurately.",
            "Final post-lock working exactly matches the committed question data.",
        ],
        responsiveAccessibility: [
            "At approximately 390 px, one dominant product or route comparison remains legible; choices stack and fraction fields keep clear dimensions.",
            "Keyboard operation covers pair selection, divisor choice, fraction input, hint, submit, repair drag alternatives and replay.",
            "All touch targets meet the repository standard, normally at least 44 CSS px.",
            "Selection and cancellation states use outline, labels, icons or patterns as well as colour.",
            "Reduced motion replaces movement with mathematically identical state changes.",
            "Screen-reader descriptions do not leak the assessed pair, divisor or result.",
        ],
        regression: [
            "FRA-01 through FRA-24 lesson content remains unchanged.",
            "FRA-26 and later lesson content remains unchanged.",
            "Shared changes, if genuinely necessary, are minimal, backwards-compatible and listed in the implementation report.",
            "No parallel lesson shell, Diagnostic layer, Retrieval layer or hard-coded next-lesson route is added.",
            "Build, type-check, lint, automated tests, active route, refresh, resume and start-again all pass.",
        ],
    },
    postImplementationStatus: "FRA-25 IMPLEMENTATION CANDIDATE / READY FOR OWNER REVIEW. Do not mark canonical/reference until repository implementation, browser QA and owner review pass.",
};
function collectRuntimeUtteranceIds(value, output, registryIds, visited = new Set()) {
    if (value === null || value === undefined)
        return;
    if (typeof value === "string") {
        if (registryIds.has(value))
            output.push(value);
        return;
    }
    if (typeof value !== "object")
        return;
    if (visited.has(value))
        return;
    visited.add(value);
    if (Array.isArray(value)) {
        for (const item of value)
            collectRuntimeUtteranceIds(item, output, registryIds, visited);
        return;
    }
    for (const nested of Object.values(value)) {
        collectRuntimeUtteranceIds(nested, output, registryIds, visited);
    }
}
function validateProductMath(math, context) {
    const errors = [];
    const allValues = [
        math.factors.left.numerator,
        math.factors.left.denominator,
        math.factors.right.numerator,
        math.factors.right.denominator,
    ];
    if (!allValues.every((value) => Number.isInteger(value) && value > 0)) {
        errors.push(`${context}: all authored factors must be positive integers.`);
    }
    if (math.factors.left.denominator === 0 || math.factors.right.denominator === 0) {
        errors.push(`${context}: denominator cannot be zero.`);
    }
    const directFinal = (0, exports.multiplyProduct)(math.factors);
    if (!(0, exports.fractionsEqual)(directFinal, math.expectedFinal)) {
        errors.push(`${context}: expected final ${math.expectedFinal.numerator}/${math.expectedFinal.denominator} does not equal reduced direct product ${directFinal.numerator}/${directFinal.denominator}.`);
    }
    if (gcd(math.expectedFinal.numerator, math.expectedFinal.denominator) !== 1) {
        errors.push(`${context}: expected final must be in simplest form.`);
    }
    const crossGcds = [
        gcd(math.factors.left.numerator, math.factors.left.denominator),
        gcd(math.factors.left.numerator, math.factors.right.denominator),
        gcd(math.factors.right.numerator, math.factors.left.denominator),
        gcd(math.factors.right.numerator, math.factors.right.denominator),
    ];
    if (math.noUsefulCancellation && crossGcds.some((value) => value > 1)) {
        errors.push(`${context}: marked noUsefulCancellation but a numerator-denominator pair shares a factor > 1.`);
    }
    for (const route of math.approvedCancellationRoutes) {
        const current = {
            left_numerator: math.factors.left.numerator,
            left_denominator: math.factors.left.denominator,
            right_numerator: math.factors.right.numerator,
            right_denominator: math.factors.right.denominator,
        };
        for (const step of route.steps) {
            const nSlot = step.numeratorSlot;
            const dSlot = step.denominatorSlot;
            if (!nSlot.endsWith("numerator") || !dSlot.endsWith("denominator")) {
                errors.push(`${context}/${route.id}/${step.id}: pair must cross numerator to denominator.`);
            }
            if (current[nSlot] !== step.numeratorBefore || current[dSlot] !== step.denominatorBefore) {
                errors.push(`${context}/${route.id}/${step.id}: before-values do not match the current route state.`);
            }
            if (!Number.isInteger(step.divisor) || step.divisor <= 1) {
                errors.push(`${context}/${route.id}/${step.id}: divisor must be an integer greater than 1.`);
            }
            if (step.numeratorBefore % step.divisor !== 0 || step.denominatorBefore % step.divisor !== 0) {
                errors.push(`${context}/${route.id}/${step.id}: divisor is not exact for both values.`);
            }
            if (step.numeratorAfter !== step.numeratorBefore / step.divisor ||
                step.denominatorAfter !== step.denominatorBefore / step.divisor) {
                errors.push(`${context}/${route.id}/${step.id}: quotient values do not match the shared division.`);
            }
            current[nSlot] = step.numeratorAfter;
            current[dSlot] = step.denominatorAfter;
        }
        const stateReducedProduct = {
            left: fraction(current.left_numerator, current.left_denominator),
            right: fraction(current.right_numerator, current.right_denominator),
        };
        if (!(0, exports.fractionsEqual)(stateReducedProduct.left, route.reducedProduct.left) ||
            !(0, exports.fractionsEqual)(stateReducedProduct.right, route.reducedProduct.right)) {
            errors.push(`${context}/${route.id}: reduced product does not match the simulated route state.`);
        }
        const routeFinal = (0, exports.multiplyProduct)({ left: route.reducedProduct.left, right: route.reducedProduct.right });
        if (!(0, exports.fractionsEqual)(routeFinal, route.final) || !(0, exports.fractionsEqual)(route.final, math.expectedFinal)) {
            errors.push(`${context}/${route.id}: route final does not preserve the original product.`);
        }
    }
    return errors;
}
function allQuestions() {
    return [
        ...exports.FRA25_PRIMARY_QUESTIONS,
        ...exports.FRA25_CONFIRMATION_QUESTIONS,
        ...exports.FRA25_FINAL_QUESTIONS,
        ...exports.FRA25_REPAIRS.flatMap((repair) => [repair.supportedInteraction, repair.freshIndependentRecheck]),
        ...exports.FRA25_REPLACEMENT_FINALS,
    ];
}
function validateFRA25LessonSpec() {
    const errors = [];
    const registry = exports.FRA25_RUNTIME_COPY;
    if (exports.FRA25_LESSON_SPEC.id !== "FRA-25")
        errors.push("Skill id must be FRA-25.");
    if (exports.FRA25_LESSON_SPEC.title !== "Simplify Before Multiplying Fractions") {
        errors.push("Lesson title mismatch.");
    }
    if (exports.FRA25_LESSON_SPEC.entryCheck.enabled)
        errors.push("Global Diagnostic must remain disabled.");
    if (exports.FRA25_LESSON_SPEC.retrieval.enabled)
        errors.push("Retrieval must remain disabled.");
    if (exports.FRA25_SOURCE_CORRECTIONS.length !== 1 || exports.FRA25_SOURCE_CORRECTIONS[0].id !== "F2_PAIR_VALIDITY_CORRECTION") {
        errors.push("The documented F2 mathematical correction must remain explicit.");
    }
    const runtimeTexts = new Map();
    const bannedRuntimePatterns = [
        /assessment intent/i,
        /author-only/i,
        /storyboard/i,
        /implementation/i,
        /support escalation/i,
        /diagnostic layer/i,
        /retrieval layer/i,
        /quality gate/i,
        /animation sequence/i,
    ];
    for (const [id, utterance] of Object.entries(registry)) {
        if (utterance.audience !== "learner" || utterance.spokenBy !== "Ryan") {
            errors.push(`${id}: runtime utterance must be learner-facing Ryan copy.`);
        }
        if (utterance.captionSource !== "same_as_audio") {
            errors.push(`${id}: captionSource must be same_as_audio.`);
        }
        const normalised = utterance.text.trim().replace(/\s+/g, " ").toLowerCase();
        const duplicate = runtimeTexts.get(normalised);
        if (duplicate)
            errors.push(`${id}: exact duplicate runtime text also appears in ${duplicate}.`);
        runtimeTexts.set(normalised, id);
        for (const pattern of bannedRuntimePatterns) {
            if (pattern.test(utterance.text))
                errors.push(`${id}: authoring/engineering language leaked into runtime copy.`);
        }
    }
    const seenQuestionIds = new Set();
    for (const question of allQuestions()) {
        if (seenQuestionIds.has(question.id))
            errors.push(`Duplicate question id: ${question.id}.`);
        seenQuestionIds.add(question.id);
        if (!question.studentFacing.prompt.trim())
            errors.push(`${question.id}: prompt is empty.`);
        if (!question.visual.accessibleDescriptionBeforeSubmit.trim()) {
            errors.push(`${question.id}: missing accessible pre-submit description.`);
        }
        if (question.visual.math) {
            errors.push(...validateProductMath(question.visual.math, question.id));
            if (question.answer.finalFraction &&
                !(0, exports.fractionsEqual)(question.answer.finalFraction, question.visual.math.expectedFinal)) {
                errors.push(`${question.id}: final answer does not match its math object.`);
            }
        }
        if (question.response.choices && question.answer.choiceIds) {
            const choiceIds = new Set(question.response.choices.map((choice) => choice.id));
            for (const answerId of question.answer.choiceIds) {
                if (!choiceIds.has(answerId))
                    errors.push(`${question.id}: answer choice ${answerId} does not exist.`);
            }
        }
        if (question.stage === "final" || question.stage === "recovery_final") {
            if (question.policy.hintPolicy !== "none")
                errors.push(`${question.id}: final item exposes a hint.`);
            if (!question.policy.answerLocksOnSubmit)
                errors.push(`${question.id}: final answer must lock on submit.`);
            if (question.policy.solutionPolicy !== "after_locked_submit") {
                errors.push(`${question.id}: final working must be after locked submit.`);
            }
            if (!question.workedCheck?.requiresAnswerLocked) {
                errors.push(`${question.id}: final item lacks answer-locked worked check.`);
            }
        }
        if (question.stage === "confirmation" && question.policy.hintPolicy !== "none") {
            errors.push(`${question.id}: fresh confirmation must have no hint.`);
        }
    }
    if (exports.FRA25_FINAL_QUESTIONS.length !== 5)
        errors.push("Primary final must contain exactly five items.");
    const primaryFinalFamilies = new Set(exports.FRA25_FINAL_QUESTIONS.map((question) => question.family));
    for (const family of ["DIRECT", "STEP", "REASON", "ERROR", "MATCH"]) {
        if (!primaryFinalFamilies.has(family))
            errors.push(`Primary final missing ${family} family.`);
    }
    if (exports.FRA25_REPAIRS.length !== 5)
        errors.push("Exactly five targeted repair branches are required.");
    if (exports.FRA25_REPLACEMENT_FINALS.length !== 5)
        errors.push("Exactly five deterministic replacement finals are required.");
    for (const scene of exports.FRA25_TEACHING_SCENES) {
        if (scene.visual.math)
            errors.push(...validateProductMath(scene.visual.math, `scene ${scene.id}`));
        for (const cue of scene.timedVisualEvents) {
            const utterance = registry[cue.utteranceId];
            if (!utterance) {
                errors.push(`${cue.id}: missing utterance ${cue.utteranceId}.`);
            }
            else if (!utterance.text.includes(cue.anchorText)) {
                errors.push(`${cue.id}: anchor text is absent from ${cue.utteranceId}.`);
            }
        }
    }
    const referencedRuntimeIds = [];
    collectRuntimeUtteranceIds(exports.FRA25_LESSON_SPEC, referencedRuntimeIds, new Set(Object.keys(registry)));
    for (const id of referencedRuntimeIds) {
        if (!registry[id])
            errors.push(`Referenced runtime utterance does not exist: ${id}.`);
    }
    const referencedSet = new Set(referencedRuntimeIds);
    for (const id of Object.keys(registry)) {
        if (!referencedSet.has(id))
            errors.push(`Runtime utterance is not referenced by the lesson: ${id}.`);
    }
    const serialised = JSON.stringify(exports.FRA25_LESSON_SPEC);
    if (/captionText/i.test(serialised))
        errors.push("Separate captionText field is forbidden.");
    if (!serialised.includes("F2_PAIR_VALIDITY_CORRECTION")) {
        errors.push("F2 source correction is missing from the exported lesson object.");
    }
    const f2 = exports.FRA25_PRIMARY_QUESTIONS.find((question) => question.id === "F2");
    if (!f2 || !f2.answer.choiceIds?.includes("A")) {
        errors.push("F2 corrected answer must be option A in the handoff question data.");
    }
    const f2ChoiceA = f2?.response.choices?.find((choice) => choice.id === "A")?.text ?? "";
    if (!/14 and 21 by 7/.test(f2ChoiceA)) {
        errors.push("F2 option A must implement the corrected 14-and-21 divide-by-7 pair.");
    }
    return errors;
}
function makeEvidence(params) {
    return {
        questionId: params.questionId,
        stage: params.stage ?? "guided",
        family: params.family,
        firstAttemptCorrect: params.firstAttemptCorrect ?? false,
        attempts: params.attempts ?? 1,
        hintOpenedBeforeSubmit: params.hintOpenedBeforeSubmit ?? false,
        supportEscalated: params.supportEscalated ?? false,
        answerLocked: params.answerLocked ?? true,
        committedResponse: params.committedResponse,
        observedErrorFamilies: params.observedErrorFamilies ?? [],
    };
}
function runFRA25StaticAssertions() {
    const errors = [...validateFRA25LessonSpec()];
    const strongGate = shouldSkipF1({
        g1: makeEvidence({ questionId: "G1", family: "DIRECT", firstAttemptCorrect: true }),
        g2: makeEvidence({ questionId: "G2", family: "NO_CANCEL", firstAttemptCorrect: true }),
        unresolvedCentralErrors: [],
    });
    if (!strongGate)
        errors.push("Strong clean guided evidence should skip F1.");
    const blockedGate = shouldSkipF1({
        g1: makeEvidence({ questionId: "G1", family: "DIRECT", firstAttemptCorrect: true, supportEscalated: true }),
        g2: makeEvidence({ questionId: "G2", family: "NO_CANCEL", firstAttemptCorrect: true }),
        unresolvedCentralErrors: [],
    });
    if (blockedGate)
        errors.push("Support-escalated guided evidence must not skip F1.");
    const confirmations = confirmationNeededAfterPractice([
        makeEvidence({
            questionId: "I1",
            stage: "independent",
            family: "DIRECT",
            firstAttemptCorrect: true,
            hintOpenedBeforeSubmit: true,
        }),
        makeEvidence({
            questionId: "I2",
            stage: "independent",
            family: "ERROR",
            firstAttemptCorrect: true,
            hintOpenedBeforeSubmit: true,
        }),
    ]);
    if (!confirmations.includes("C-DIRECT") || !confirmations.includes("C-PAIR")) {
        errors.push("Hint-supported direct and pair/error evidence must schedule same-family confirmations.");
    }
    const secureDecision = evaluatePrimaryFinal([
        makeEvidence({ questionId: "M1", stage: "final", family: "DIRECT", firstAttemptCorrect: true }),
        makeEvidence({ questionId: "M2", stage: "final", family: "STEP", firstAttemptCorrect: true }),
        makeEvidence({ questionId: "M3", stage: "final", family: "REASON", firstAttemptCorrect: true }),
        makeEvidence({ questionId: "M4", stage: "final", family: "ERROR", firstAttemptCorrect: true }),
        makeEvidence({ questionId: "M5", stage: "final", family: "MATCH", firstAttemptCorrect: false }),
    ]);
    if (secureDecision.action !== "finish")
        errors.push("4/5 with breadth and no blocker should finish.");
    const threeDecision = evaluatePrimaryFinal([
        makeEvidence({ questionId: "M1", stage: "final", family: "DIRECT", firstAttemptCorrect: true }),
        makeEvidence({ questionId: "M2", stage: "final", family: "STEP", firstAttemptCorrect: true }),
        makeEvidence({ questionId: "M3", stage: "final", family: "REASON", firstAttemptCorrect: true }),
        makeEvidence({
            questionId: "M4",
            stage: "final",
            family: "ERROR",
            firstAttemptCorrect: false,
            observedErrorFamilies: ["TERM"],
        }),
        makeEvidence({ questionId: "M5", stage: "final", family: "MATCH", firstAttemptCorrect: false }),
    ]);
    if (threeDecision.action !== "repair_then_two_item_check" || threeDecision.recoveryQuestionIds.length !== 2) {
        errors.push("3/5 must route to targeted repair plus a two-item fresh check.");
    }
    const lowDecision = evaluatePrimaryFinal([
        makeEvidence({
            questionId: "M1",
            stage: "final",
            family: "DIRECT",
            firstAttemptCorrect: false,
            observedErrorFamilies: ["PAIR"],
        }),
        makeEvidence({
            questionId: "M2",
            stage: "final",
            family: "STEP",
            firstAttemptCorrect: false,
            observedErrorFamilies: ["SHARED"],
        }),
        makeEvidence({ questionId: "M3", stage: "final", family: "REASON", firstAttemptCorrect: true }),
        makeEvidence({
            questionId: "M4",
            stage: "final",
            family: "ERROR",
            firstAttemptCorrect: false,
            observedErrorFamilies: ["TERM"],
        }),
        makeEvidence({ questionId: "M5", stage: "final", family: "MATCH", firstAttemptCorrect: false }),
    ]);
    if (lowDecision.action !== "repair_then_three_item_final" || lowDecision.recoveryQuestionIds.length !== 3) {
        errors.push("0-2/5 must route to repair plus a fresh three-item final.");
    }
    return errors;
}
exports.FRA25_STATIC_VALIDATION_ERRORS = runFRA25StaticAssertions();

  window.RevilyFra25Approved = module.exports;
})();
