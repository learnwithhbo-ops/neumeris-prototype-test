(function () {
  const exports = {};
"use strict";
/**
 * FRA26_CANONICAL_SPEC.ts
 *
 * Owner-approved Revily V2 implementation handoff for FRA-26.
 * Lesson: Understand Reciprocals.
 *
 * SOURCE PRECEDENCE
 * 1. This TypeScript file is the runtime source of truth for Ryan speech,
 *    learner UI copy, question data, routes, outcomes, evidence and QA.
 * 2. Revily_FRA-26_Storyboard_v1.pdf is the visual-geometry and pedagogical
 *    reference.
 * 3. FRA26_CODEX_IMPLEMENTATION_PROMPT.md is the engineering/integration
 *    contract.
 *
 * HARD RUNTIME-COPY RULE
 * Ryan may speak only FRA26_RUNTIME_COPY[utteranceId].text. Ryan captions must
 * resolve from the same utterance ID and exact text. Learner UI strings,
 * author-only directions, assessment labels, route names and QA prose must
 * never be automatically voiced or captioned as Ryan.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRA26_CANONICAL_SPEC = exports.FRA26 = exports.FRA26_QUESTIONS = exports.FRA26_TEACHING_SCENES = exports.FRA26_LEARNER_UI_COPY = exports.FRA26_RUNTIME_COPY = void 0;
exports.gcdPositive = gcdPositive;
exports.normalizeFraction = normalizeFraction;
exports.areEquivalentFractions = areEquivalentFractions;
exports.reciprocalOfSource = reciprocalOfSource;
exports.productIsExactlyOne = productIsExactlyOne;
exports.acceptsReciprocalAnswer = acceptsReciprocalAnswer;
exports.classifyFractionResponse = classifyFractionResponse;
exports.selectGuidedRoute = selectGuidedRoute;
exports.selectPrimaryFinalRoute = selectPrimaryFinalRoute;
exports.validateFRA26CanonicalSpec = validateFRA26CanonicalSpec;
/**
 * Exact Ryan speech. No other field in this file is a Ryan TTS/caption source.
 */
exports.FRA26_RUNTIME_COPY = {
    "HOOK.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "show_initial_scale_change",
        text: "This title card started twenty-five units wide. A three-fifths scale shrinks it to fifteen.",
        captionSource: "same_as_audio",
    },
    "HOOK.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "prompt",
        communicationGoal: "ask_for_restoring_multiplier_prediction",
        text: "Now I need one multiplier that takes it exactly back to twenty-five. Which would you try: three fifths again, or five thirds?",
        captionSource: "same_as_audio",
    },
    "HOOK.REVEAL.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "reveal_both_scale_outcomes",
        text: "Three fifths again would shrink it to nine. Five thirds restores the starting width.",
        captionSource: "same_as_audio",
    },
    "HOOK.REVEAL.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "connect_undoing_multipliers_to_one",
        text: "The two multipliers undo each other because together they make a scale factor of one.",
        captionSource: "same_as_audio",
    },
    "T1.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "remove_context_and_focus_on_factors",
        text: "Look at the factors without the card now.",
        captionSource: "same_as_audio",
    },
    "T1.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "build_equal_numerator_and_denominator_products",
        text: "Three times five gives fifteen on top. Five times three gives fifteen underneath.",
        captionSource: "same_as_audio",
    },
    "T1.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "state_product_equals_one",
        text: "Fifteen fifteenths is one.",
        captionSource: "same_as_audio",
    },
    "T1.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "define",
        communicationGoal: "define_reciprocal_pair",
        text: "Two non-zero numbers that multiply to one are called reciprocals.",
        captionSource: "same_as_audio",
    },
    "T1.5": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "name_three_fifths_and_five_thirds_as_pair",
        text: "So three fifths and five thirds are a reciprocal pair.",
        captionSource: "same_as_audio",
    },
    "T2.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "state_same_values_opposite_positions",
        text: "For a non-zero fraction, the reciprocal uses the same two numbers in the opposite positions.",
        captionSource: "same_as_audio",
    },
    "T2.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "demonstrate_four_sevenths_to_seven_fourths",
        text: "In four sevenths, 4 moves underneath and 7 moves on top. The reciprocal is seven fourths.",
        captionSource: "same_as_audio",
    },
    "T2.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "prioritise_product_definition_over_movement",
        text: "That movement is not the reason. The product check is the reason.",
        captionSource: "same_as_audio",
    },
    "T2.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "verify_four_sevenths_pair",
        text: "Four sevenths times seven fourths is twenty-eight over twenty-eight, which is one.",
        captionSource: "same_as_audio",
    },
    "T3.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "extend_reciprocals_to_integers",
        text: "Whole numbers have the same idea.",
        captionSource: "same_as_audio",
    },
    "T3.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "show_hidden_denominator_one",
        text: "Six can be written as six over one.",
        captionSource: "same_as_audio",
    },
    "T3.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "generate_integer_reciprocal",
        text: "Reverse those positions and the reciprocal is one sixth.",
        captionSource: "same_as_audio",
    },
    "T3.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "connect_unit_fraction_back_to_integer",
        text: "The reciprocal of one sixth is six.",
        captionSource: "same_as_audio",
    },
    "T3.5": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "identify_one_as_self_reciprocal",
        text: "One is its own reciprocal, because one times one is one.",
        captionSource: "same_as_audio",
    },
    "T4.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "introduce_zero_exception",
        text: "Zero is the exception.",
        captionSource: "same_as_audio",
    },
    "T4.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "state_product_one_requirement_for_zero",
        text: "A reciprocal has to multiply with the original number to make one.",
        captionSource: "same_as_audio",
    },
    "T4.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "show_zero_products_cannot_make_one",
        text: "Zero times any number is still zero, so no partner can make one.",
        captionSource: "same_as_audio",
    },
    "T4.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "explain",
        communicationGoal: "conclude_zero_has_no_reciprocal",
        text: "Zero has no reciprocal. One over zero is not a valid fraction.",
        captionSource: "same_as_audio",
    },
    "HANDOFF.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "hand_control_to_learner_with_definition",
        text: "You have seen the pattern. Now use the product-of-one idea, not just the movement.",
        captionSource: "same_as_audio",
    },
    "HANDOFF.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "preview_two_guided_questions_and_fading_support",
        text: "I will stay with you for two questions. Then the support will start to fade.",
        captionSource: "same_as_audio",
    },
    "G1.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_missing_factor_product_one",
        text: "Choose the factor that makes the product exactly one.",
        captionSource: "same_as_audio",
    },
    "G1.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_two_sevenths_reciprocal_pair",
        text: "Yes. Two sevenths and seven halves multiply to one.",
        captionSource: "same_as_audio",
    },
    "G2.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_integer_over_one_then_reciprocal",
        text: "Write 8 over 1 first. Then build the reciprocal.",
        captionSource: "same_as_audio",
    },
    "G2.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_eight_and_one_eighth_product",
        text: "That works. Eight times one eighth is one.",
        captionSource: "same_as_audio",
    },
    "F1.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_direct_reciprocal_with_product_invariant",
        text: "Use the same two numbers. Build the partner that makes a product of one.",
        captionSource: "same_as_audio",
    },
    "F2.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_matching_reciprocal_pairs",
        text: "Match each number to the partner that makes a product of one.",
        captionSource: "same_as_audio",
    },
    "INDEPENDENT.INTRO.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "hand_over_with_optional_hint_closed",
        text: "Now you take over. The hint stays closed unless you ask for it.",
        captionSource: "same_as_audio",
    },
    "INDEPENDENT.INTRO.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "remind_product_one_check",
        text: "Use the product-of-one check when you need to test your answer.",
        captionSource: "same_as_audio",
    },
    "I1.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_improper_fraction_missing_partner",
        text: "Make the missing factor the partner that brings the product to one.",
        captionSource: "same_as_audio",
    },
    "I2.PRE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "prompt_definition_based_reasoning",
        text: "Choose the statement that makes sense when the original and its reciprocal multiply to one.",
        captionSource: "same_as_audio",
    },
    "FINAL.INTRO.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "transition",
        communicationGoal: "introduce_four_unsupported_items",
        text: "These last four are yours. No hints this time.",
        captionSource: "same_as_audio",
    },
    "FINAL.INTRO.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "instruction",
        communicationGoal: "state_answer_lock_then_worked_check",
        text: "Answer first. After you lock each response, I will show the product check or explanation so you can compare your thinking.",
        captionSource: "same_as_audio",
    },
    "M1.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "introduce_m1_product_check",
        text: "That is right. Here is the product check.",
        captionSource: "same_as_audio",
    },
    "M1.INCORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "introduce_m1_position_check_after_miss",
        text: "Not quite. Here is the product check; compare the two positions.",
        captionSource: "same_as_audio",
    },
    "M2.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "introduce_m2_hidden_denominator_check",
        text: "Yes. Here is how the hidden denominator of one gives the reciprocal.",
        captionSource: "same_as_audio",
    },
    "M2.INCORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "introduce_m2_integer_fraction_check_after_miss",
        text: "Not quite. Here is the integer written as a fraction, then reversed.",
        captionSource: "same_as_audio",
    },
    "M3.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_missing_factor_product_one",
        text: "Exactly. The missing factor makes the product one.",
        captionSource: "same_as_audio",
    },
    "M3.INCORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "introduce_missing_factor_check_after_miss",
        text: "Not quite. Watch which factor completes the product.",
        captionSource: "same_as_audio",
    },
    "M4.CORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "acknowledge_correct",
        communicationGoal: "confirm_zero_reasoning",
        text: "That is the sound reason. Here is the zero check.",
        captionSource: "same_as_audio",
    },
    "M4.INCORRECT": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "redirect_incorrect",
        communicationGoal: "introduce_defining_product_check_after_miss",
        text: "Not quite. The defining product settles this one.",
        captionSource: "same_as_audio",
    },
    "R-REVERSE.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "name_incomplete_position_change",
        text: "The two positions have not both changed.",
        captionSource: "same_as_audio",
    },
    "R-REVERSE.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "state_same_numbers_exchange_places",
        text: "A reciprocal keeps the same two non-zero numbers, but they exchange places.",
        captionSource: "same_as_audio",
    },
    "R-REVERSE.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "model_four_ninths_position_exchange",
        text: "For four ninths, 4 moves underneath and 9 moves on top.",
        captionSource: "same_as_audio",
    },
    "R-REVERSE.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "verify_four_ninths_reciprocal",
        text: "The check is four ninths times nine fourths equals one.",
        captionSource: "same_as_audio",
    },
    "R-INTEGER.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "reveal_hidden_denominator_one",
        text: "Eight is not missing a denominator. It has a hidden denominator of one.",
        captionSource: "same_as_audio",
    },
    "R-INTEGER.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "write_eight_over_one",
        text: "Write eight as eight over one.",
        captionSource: "same_as_audio",
    },
    "R-INTEGER.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "exchange_eight_over_one_to_one_eighth",
        text: "Now exchange the positions: one eighth.",
        captionSource: "same_as_audio",
    },
    "R-INTEGER.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "verify_integer_reciprocal_product",
        text: "Eight times one eighth is one.",
        captionSource: "same_as_audio",
    },
    "R-ZERO.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "separate_zero_from_reciprocal_pattern",
        text: "Zero cannot join the reciprocal pattern.",
        captionSource: "same_as_audio",
    },
    "R-ZERO.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "state_zero_product_invariant",
        text: "Whatever number you multiply by zero, the product stays zero.",
        captionSource: "same_as_audio",
    },
    "R-ZERO.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "show_no_factor_makes_zero_product_one",
        text: "So there is no number that makes zero times something equal one.",
        captionSource: "same_as_audio",
    },
    "R-ZERO.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "conclude_zero_has_no_reciprocal",
        text: "Zero has no reciprocal.",
        captionSource: "same_as_audio",
    },
    "R-SIGN-VALUE.1": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "contrast_opposite_and_reciprocal",
        text: "Changing a sign makes an opposite. A reciprocal has a different job: it makes a product of one.",
        captionSource: "same_as_audio",
    },
    "R-SIGN-VALUE.2": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "preserve_source_values",
        text: "Keep the same two positive numbers.",
        captionSource: "same_as_audio",
    },
    "R-SIGN-VALUE.3": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "model_five_sixths_reciprocal",
        text: "For five sixths, the reciprocal is six fifths.",
        captionSource: "same_as_audio",
    },
    "R-SIGN-VALUE.4": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "verify_five_sixths_reciprocal",
        text: "Five sixths times six fifths is one.",
        captionSource: "same_as_audio",
    },
    "R-SIGN-VALUE.5": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "repair",
        communicationGoal: "forbid_unprompted_value_change",
        text: "Do not change either value unless a separate simplification instruction allows an equivalent form.",
        captionSource: "same_as_audio",
    },
    "COMPLETE": {
        audience: "learner",
        spokenBy: "Ryan",
        role: "completion",
        communicationGoal: "summarise_fra26_completion",
        text: "Good work. You can find a reciprocal, check that the product is one, and explain why zero has none. That is FRA-26 done.",
        captionSource: "same_as_audio",
    },
};
/**
 * Learner-facing visual text. This registry is semantic UI only. It is never a
 * Ryan TTS/caption source unless an explicit accessibility read-aloud feature
 * independently reads visible UI.
 */
exports.FRA26_LEARNER_UI_COPY = {
    "STAGE.LEARN": { audience: "learner", modality: "visual_text", text: "Learn the idea", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "STAGE.GUIDED": { audience: "learner", modality: "visual_text", text: "Try it with me", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "STAGE.FADED": { audience: "learner", modality: "visual_text", text: "Your turn — support nearby", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "STAGE.INDEPENDENT": { audience: "learner", modality: "visual_text", text: "Now you take over", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "STAGE.FINAL": { audience: "learner", modality: "visual_text", text: "Final check", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "BUTTON.SHOW": { audience: "learner", modality: "visual_text", text: "Show what happens", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "BUTTON.HINT": { audience: "learner", modality: "visual_text", text: "Ask for a hint", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "BUTTON.CHECK": { audience: "learner", modality: "visual_text", text: "Check answer", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "BUTTON.SUBMIT": { audience: "learner", modality: "visual_text", text: "Submit", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "BUTTON.NEXT": { audience: "learner", modality: "visual_text", text: "Next", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "STATUS.ANSWER_LOCKED": { audience: "learner", modality: "visual_text", text: "Submitted answer is fixed.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "HOOK.PROMPT": { audience: "learner", modality: "visual_text", text: "Which second multiplier takes the card back to its starting width?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "HOOK.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "A title card starts at 25 units wide and is scaled by three fifths to 15 units. Choose either three fifths or five thirds as the second multiplier.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "HOOK.OPTION.REPEAT": { audience: "learner", modality: "visual_text", text: "× 3/5", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "HOOK.OPTION.RESTORE": { audience: "learner", modality: "visual_text", text: "× 5/3", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "HOOK.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "That choice restores the starting width.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "HOOK.FEEDBACK.INCORRECT": { audience: "learner", modality: "visual_text", text: "That choice shrinks the card again.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "HOOK.WORK.REPEAT": { audience: "learner", modality: "visual_text", text: "15 × 3/5 = 9", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "HOOK.WORK.RESTORE": { audience: "learner", modality: "visual_text", text: "15 × 5/3 = 25", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.PROMPT": { audience: "learner", modality: "visual_text", text: "Choose the missing factor so 2/7 × ? = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The equation is two sevenths multiplied by a missing fraction equals one. Four answer cards are available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "G1.OPTION.A": { audience: "learner", modality: "visual_text", text: "7/2", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.OPTION.B": { audience: "learner", modality: "visual_text", text: "2/7", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.OPTION.C": { audience: "learner", modality: "visual_text", text: "7/9", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.OPTION.D": { audience: "learner", modality: "visual_text", text: "1/7", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.FEEDBACK.SAME": { audience: "learner", modality: "visual_text", text: "Using the same factor again does not undo it. Check which numbers need to exchange places.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.FEEDBACK.LOST": { audience: "learner", modality: "visual_text", text: "The 2 has disappeared. A reciprocal keeps both original numbers.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.FEEDBACK.WRONG_SOURCE": { audience: "learner", modality: "visual_text", text: "That is the reciprocal of 7, not of two sevenths.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G1.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Multiply the two factors and check whether the product is exactly one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "G2.PROMPT": { audience: "learner", modality: "visual_text", text: "What is the reciprocal of 8?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G2.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Eight is shown as eight over one beside an empty fraction input. Enter the reciprocal fraction.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "G2.HINT": { audience: "learner", modality: "visual_text", text: "Keep 8 and 1, but exchange their numerator and denominator positions.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "G2.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "8 × 1/8 = 8/8 = 1.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "G2.FEEDBACK.UNCHANGED": { audience: "learner", modality: "visual_text", text: "That is the original number. Exchange the numerator and denominator positions.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "G2.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Start from 8/1 and keep both numbers in the reciprocal.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "F1.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 5/9.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F1.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Five ninths is shown above an empty fraction input. Enter its reciprocal.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "F1.HINT": { audience: "learner", modality: "visual_text", text: "A reciprocal uses the same two numbers in the opposite positions.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F1.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "Yes. Five ninths and nine fifths make one when multiplied.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F1.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Keep both source numbers and test your fraction by multiplying to one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "F2.PROMPT": { audience: "learner", modality: "visual_text", text: "Match each number to its reciprocal.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Match three left cards, four elevenths, seven, and one sixth, to three right cards, six, eleven fourths, and one seventh.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "F2.LEFT.A": { audience: "learner", modality: "visual_text", text: "4/11", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.LEFT.B": { audience: "learner", modality: "visual_text", text: "7", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.LEFT.C": { audience: "learner", modality: "visual_text", text: "1/6", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.RIGHT.A": { audience: "learner", modality: "visual_text", text: "6", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.RIGHT.B": { audience: "learner", modality: "visual_text", text: "11/4", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.RIGHT.C": { audience: "learner", modality: "visual_text", text: "1/7", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.HINT": { audience: "learner", modality: "visual_text", text: "For a whole number, reveal the denominator 1. A unit fraction reverses to a whole number.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "F2.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "All three pairs make a product of one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "F2.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Check one pair at a time by multiplying the two partners.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "I1.PROMPT": { audience: "learner", modality: "visual_text", text: "Fill the missing fraction so 13/5 × ? = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I1.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The equation is thirteen fifths multiplied by an empty fraction equals one. Enter numerator and denominator.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "I1.HINT": { audience: "learner", modality: "visual_text", text: "The missing factor must use 13 and 5 in the opposite positions.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I1.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "Exactly. Thirteen fifths and five thirteenths multiply to one.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I1.FEEDBACK.UNCHANGED": { audience: "learner", modality: "visual_text", text: "The missing factor is still the original fraction. A reciprocal exchanges both positions.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "I1.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Keep both original numbers and check whether the product becomes one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "I2.PROMPT": { audience: "learner", modality: "visual_text", text: "Which statement is true?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Choose one of four statements about reciprocals, including statements about one, zero, sign, and the integer nine.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "I2.OPTION.A": { audience: "learner", modality: "visual_text", text: "1 is its own reciprocal.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.OPTION.B": { audience: "learner", modality: "visual_text", text: "Every number, including 0, has a reciprocal.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.OPTION.C": { audience: "learner", modality: "visual_text", text: "Reciprocal means change the sign.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.OPTION.D": { audience: "learner", modality: "visual_text", text: "The reciprocal of 9 is 9.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.HINT": { audience: "learner", modality: "visual_text", text: "Test each claim using number × reciprocal = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "1 × 1 = 1, so 1 is its own reciprocal.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "I2.FEEDBACK.ZERO": { audience: "learner", modality: "visual_text", text: "Zero cannot make a product of one.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.FEEDBACK.SIGN": { audience: "learner", modality: "visual_text", text: "Changing sign gives an opposite, not a reciprocal.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "I2.FEEDBACK.INTEGER": { audience: "learner", modality: "visual_text", text: "Nine times nine is not one; write nine over one.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-FRACTION.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 8/3.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-FRACTION.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Eight thirds is shown with an empty fraction input. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "C-INTEGER.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 11.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-INTEGER.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The integer eleven is shown with an empty fraction input. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "C-PRODUCT.PROMPT": { audience: "learner", modality: "visual_text", text: "Which factor completes 12 × ? = 1?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-PRODUCT.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The equation is twelve multiplied by an empty fraction equals one. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "C-ZERO.PROMPT": { audience: "learner", modality: "visual_text", text: "Which number has no reciprocal?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-ZERO.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Choose among zero, one, four, and one eighth. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "C-ZERO.OPTION.ZERO": { audience: "learner", modality: "visual_text", text: "0", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-ZERO.OPTION.ONE": { audience: "learner", modality: "visual_text", text: "1", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-ZERO.OPTION.FOUR": { audience: "learner", modality: "visual_text", text: "4", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "C-ZERO.OPTION.EIGHTH": { audience: "learner", modality: "visual_text", text: "1/8", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "CONFIRM.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "Confirmed without a hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "CONFIRM.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Recheck the original number and the product-of-one definition.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "M1.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 7/12.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M1.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Seven twelfths is shown above an empty numerator and denominator input. No hint or working is available before submit.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "M1.WORK.1": { audience: "learner", modality: "visual_text", text: "The same two numbers exchange positions: 7/12 → 12/7.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M1.WORK.2": { audience: "learner", modality: "visual_text", text: "7/12 × 12/7 = 84/84 = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M2.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 15.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M2.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The integer fifteen is shown above an empty fraction input. No hint or working is available before submit.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "M2.WORK.1": { audience: "learner", modality: "visual_text", text: "15 = 15/1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M2.WORK.2": { audience: "learner", modality: "visual_text", text: "Exchange positions: 15/1 → 1/15. The product is 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M3.PROMPT": { audience: "learner", modality: "visual_text", text: "Complete 9/4 × ? = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M3.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The equation is nine fourths multiplied by an empty fraction equals one. No hint or working is available before submit.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "M3.WORK.1": { audience: "learner", modality: "visual_text", text: "The missing factor is 4/9.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M3.WORK.2": { audience: "learner", modality: "visual_text", text: "9/4 × 4/9 = 36/36 = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M4.PROMPT": { audience: "learner", modality: "visual_text", text: "A student says: “The reciprocal of 0 is 1/0 because whole numbers go over 1 and then reverse.” Which response is correct?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M4.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "A claim about the reciprocal of zero is shown with four written response choices. No hint or working is available before submit.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "M4.OPTION.A": { audience: "learner", modality: "visual_text", text: "Correct; 0 × 1/0 = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M4.OPTION.B": { audience: "learner", modality: "visual_text", text: "Not correct; zero times any number is zero.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M4.OPTION.C": { audience: "learner", modality: "visual_text", text: "Not correct; the reciprocal of zero is 0.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M4.OPTION.D": { audience: "learner", modality: "visual_text", text: "Correct; every number has a reciprocal.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M4.WORK.1": { audience: "learner", modality: "visual_text", text: "0 × any number = 0, never 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "M4.WORK.2": { audience: "learner", modality: "visual_text", text: "Zero has no reciprocal, and 1/0 is not a valid fraction.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-REVERSE.SUPPORTED.PROMPT": { audience: "learner", modality: "visual_text", text: "Place 4 and 9 into the reciprocal of 4/9.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-REVERSE.SUPPORTED.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Four ninths remains visible as the source. Move number tiles 4 and 9 into empty reciprocal numerator and denominator slots.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-REVERSE.CHECK.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 8/13.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-REVERSE.CHECK.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Eight thirteenths is shown with an empty fraction input. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-REVERSE.CHECK.WORK": { audience: "learner", modality: "visual_text", text: "8/13 × 13/8 = 104/104 = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-INTEGER.SUPPORTED.PROMPT": { audience: "learner", modality: "visual_text", text: "First write 8 as a fraction. Then build its reciprocal.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-INTEGER.SUPPORTED.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The integer eight is shown with one empty denominator slot. After eight over one is built, empty reciprocal slots appear.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-INTEGER.CHECK.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 12.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-INTEGER.CHECK.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The integer twelve is shown with an empty fraction input. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-ZERO.SUPPORTED.PROMPT": { audience: "learner", modality: "visual_text", text: "Which statement can finish 0 × ? = 1?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-ZERO.SUPPORTED.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The impossible equation zero multiplied by a missing value equals one is shown with three statement choices.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-ZERO.OPTION.A": { audience: "learner", modality: "visual_text", text: "Use 1/0.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-ZERO.OPTION.B": { audience: "learner", modality: "visual_text", text: "Use 0.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-ZERO.OPTION.C": { audience: "learner", modality: "visual_text", text: "No reciprocal exists.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-ZERO.CHECK.PROMPT": { audience: "learner", modality: "visual_text", text: "Which number has no reciprocal: 0, 1, 4, or 1/8?", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-ZERO.CHECK.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Choose among zero, one, four, and one eighth. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-SIGN-VALUE.SUPPORTED.PROMPT": { audience: "learner", modality: "visual_text", text: "Choose the card that makes 5/6 × ? = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-SIGN-VALUE.SUPPORTED.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Five sixths is multiplied by a missing factor. Choose from an unchanged fraction, a sign-change distractor, and six fifths.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-SIGN-VALUE.OPTION.A": { audience: "learner", modality: "visual_text", text: "5/6", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-SIGN-VALUE.OPTION.B": { audience: "learner", modality: "visual_text", text: "−5/6", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "R-SIGN-VALUE.OPTION.C": { audience: "learner", modality: "visual_text", text: "6/5", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-SIGN-VALUE.CHECK.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 2/11.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "R-SIGN-VALUE.CHECK.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Two elevenths is shown with an empty fraction input. No hint is available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "REPAIR.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "That completes the repair step. Now try the fresh check.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "REPAIR.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Use the defining product of one and try the repair step again.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "REPAIR.CHECK.CORRECT": { audience: "learner", modality: "visual_text", text: "The fresh check is correct.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "REPAIR.CHECK.DEFAULT": { audience: "learner", modality: "visual_text", text: "The fresh check is not secure yet.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-DIRECT.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 3/14.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-DIRECT.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Three fourteenths is shown with an empty fraction input. This is a fresh recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-INTEGER.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 17.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-INTEGER.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The integer seventeen is shown with an empty fraction input. This is a fresh recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MISSING.PROMPT": { audience: "learner", modality: "visual_text", text: "Complete 11/6 × ? = 1.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MISSING.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The equation is eleven sixths multiplied by an empty fraction equals one. This is a fresh recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-REASON.PROMPT": { audience: "learner", modality: "visual_text", text: "Why does zero have no reciprocal?", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-REASON.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Choose the reason that explains why zero has no reciprocal. This is a fresh recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-REASON.OPTION.A": { audience: "learner", modality: "visual_text", text: "Zero times any number stays zero, so it cannot make one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-REASON.OPTION.B": { audience: "learner", modality: "visual_text", text: "Zero is already its own reciprocal.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-REASON.OPTION.C": { audience: "learner", modality: "visual_text", text: "The reciprocal of zero is one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MATCH.PROMPT": { audience: "learner", modality: "visual_text", text: "Match 3/10 and 5 to their reciprocals.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MATCH.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Match three tenths and five to ten thirds and one fifth. This is a fresh recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MATCH.LEFT.A": { audience: "learner", modality: "visual_text", text: "3/10", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MATCH.LEFT.B": { audience: "learner", modality: "visual_text", text: "5", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MATCH.RIGHT.A": { audience: "learner", modality: "visual_text", text: "10/3", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RM-MATCH.RIGHT.B": { audience: "learner", modality: "visual_text", text: "1/5", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RF1.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 5/14.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "RF1.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Five fourteenths is shown with an empty fraction input. This is a fresh final-recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RF2.PROMPT": { audience: "learner", modality: "visual_text", text: "Write the reciprocal of 18.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "RF2.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The integer eighteen is shown with an empty fraction input. This is a fresh final-recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RF3.PROMPT": { audience: "learner", modality: "visual_text", text: "Complete 7/3 × ? = 1.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "RF3.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "The equation is seven thirds multiplied by an empty fraction equals one. This is a fresh final-recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RF4.PROMPT": { audience: "learner", modality: "visual_text", text: "Choose the statement that explains why 0 has no reciprocal.", speechPolicy: "never_automatic_ryan", source: "storyboard_exact" },
    "RF4.ACCESSIBLE": { audience: "learner", modality: "visual_text", text: "Choose one of three statements about zero and the product-one definition. This is a fresh final-recovery item with no hint.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RECOVERY.FEEDBACK.CORRECT": { audience: "learner", modality: "visual_text", text: "Correct. The worked check is now available.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RECOVERY.FEEDBACK.DEFAULT": { audience: "learner", modality: "visual_text", text: "Not correct. Compare your response with the worked check.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RECOVERY.WORK.RECIPROCAL": { audience: "learner", modality: "visual_text", text: "Keep the same two non-zero values, exchange their positions, and verify that the product is one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RECOVERY.WORK.INTEGER": { audience: "learner", modality: "visual_text", text: "Write the integer over one, exchange the positions, and verify the product is one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
    "RECOVERY.WORK.ZERO": { audience: "learner", modality: "visual_text", text: "Zero times every number is zero, so no partner can make a product of one.", speechPolicy: "never_automatic_ryan", source: "handoff_completion" },
};
exports.FRA26_TEACHING_SCENES = {
    HOOK: {
        id: "HOOK",
        stage: "opening",
        authorOnlyTeachingPurpose: "Create the need for an inverse multiplier before naming a reciprocal.",
        ryanUtteranceIds: ["HOOK.1", "HOOK.2", "HOOK.REVEAL.1", "HOOK.REVEAL.2"],
        visual: {
            kind: "scale_card_restoration",
            startingWidthUnits: 25,
            firstScale: { numerator: 3, denominator: 5 },
            firstResultWidthUnits: 15,
            choices: [
                { id: "repeat", scale: { numerator: 3, denominator: 5 }, resultWidthUnits: 9 },
                { id: "restore", scale: { numerator: 5, denominator: 3 }, resultWidthUnits: 25 },
            ],
            revealChoiceOutcomesOnlyAfterPrediction: true,
            showTermReciprocalBeforeReveal: false,
            accessibleDescriptionCopyId: "HOOK.ACCESSIBLE",
        },
        timeline: [
            { id: "HOOK.CUE.1", utteranceId: "HOOK.1", anchorText: "twenty-five units", authorOnlyAction: "Outline the full 25-unit card.", reducedMotionState: "Show the outlined 25-unit start card.", mustNotOccurBeforeAnchor: true },
            { id: "HOOK.CUE.2", utteranceId: "HOOK.1", anchorText: "three-fifths scale", authorOnlyAction: "Place ×3/5 above the scale arrow.", reducedMotionState: "Show ×3/5 between the 25-unit and 15-unit states.", mustNotOccurBeforeAnchor: true },
            { id: "HOOK.CUE.3", utteranceId: "HOOK.1", anchorText: "fifteen", authorOnlyAction: "Replace the start card with the exact 15-unit state.", reducedMotionState: "Show the 15-unit result card.", mustNotOccurBeforeAnchor: true },
            { id: "HOOK.CUE.4", utteranceId: "HOOK.REVEAL.1", anchorText: "nine", authorOnlyAction: "Reveal the repeated ×3/5 path ending at 9 units.", reducedMotionState: "Show 15 × 3/5 = 9.", mustNotOccurBeforeAnchor: true },
            { id: "HOOK.CUE.5", utteranceId: "HOOK.REVEAL.1", anchorText: "starting width", authorOnlyAction: "Reveal the ×5/3 path ending at the restored 25-unit card.", reducedMotionState: "Show 15 × 5/3 = 25.", mustNotOccurBeforeAnchor: true },
            { id: "HOOK.CUE.6", utteranceId: "HOOK.REVEAL.2", anchorText: "scale factor of one", authorOnlyAction: "Show 3/5 × 5/3 = 1 beneath the restored card.", reducedMotionState: "Show the exact product-one equation.", mustNotOccurBeforeAnchor: true },
        ],
        authorOnlyUnderstandingExpected: "The learner has experienced a multiplier and a restoring partner whose combined scale factor is one, without yet receiving the formal term.",
    },
    T1: {
        id: "T1",
        stage: "teach",
        authorOnlyTeachingPurpose: "Define reciprocals through the product-of-one meaning.",
        ryanUtteranceIds: ["T1.1", "T1.2", "T1.3", "T1.4", "T1.5"],
        visual: {
            kind: "fraction_product_build",
            factors: [
                { numerator: 3, denominator: 5 },
                { numerator: 5, denominator: 3 },
            ],
            numeratorProduct: 15,
            denominatorProduct: 15,
            result: 1,
            labels: ["RECIPROCAL PAIR"],
            contextCardRemoved: true,
        },
        timeline: [
            { id: "T1.CUE.1", utteranceId: "T1.1", anchorText: "without the card", authorOnlyAction: "Fade the title-card context and keep only 3/5 × 5/3.", reducedMotionState: "Show the product without the context card.", mustNotOccurBeforeAnchor: true },
            { id: "T1.CUE.2", utteranceId: "T1.2", anchorText: "Three times five", authorOnlyAction: "Highlight 3 × 5 and build numerator product 15.", reducedMotionState: "Show 3 × 5 = 15 above the fraction bar.", mustNotOccurBeforeAnchor: true },
            { id: "T1.CUE.3", utteranceId: "T1.2", anchorText: "Five times three", authorOnlyAction: "Highlight 5 × 3 and build denominator product 15.", reducedMotionState: "Show 5 × 3 = 15 below the fraction bar.", mustNotOccurBeforeAnchor: true },
            { id: "T1.CUE.4", utteranceId: "T1.3", anchorText: "one", authorOnlyAction: "Compress 15/15 to 1.", reducedMotionState: "Show 15/15 = 1.", mustNotOccurBeforeAnchor: true },
            { id: "T1.CUE.5", utteranceId: "T1.4", anchorText: "reciprocals", authorOnlyAction: "Reveal the term RECIPROCALS.", reducedMotionState: "Show the RECIPROCALS label.", mustNotOccurBeforeAnchor: true },
            { id: "T1.CUE.6", utteranceId: "T1.5", anchorText: "reciprocal pair", authorOnlyAction: "Bracket 3/5 and 5/3 and reveal RECIPROCAL PAIR.", reducedMotionState: "Show both factors joined by the RECIPROCAL PAIR label.", mustNotOccurBeforeAnchor: true },
        ],
        authorOnlyUnderstandingExpected: "Reciprocal names a pair of non-zero numbers whose product is one.",
    },
    T2: {
        id: "T2",
        stage: "teach",
        authorOnlyTeachingPurpose: "Generate a fraction reciprocal while keeping the product-one definition primary.",
        ryanUtteranceIds: ["T2.1", "T2.2", "T2.3", "T2.4"],
        visual: {
            kind: "reciprocal_position_exchange",
            source: { numerator: 4, denominator: 7 },
            reciprocal: { numerator: 7, denominator: 4 },
            product: { numerator: 28, denominator: 28, result: 1 },
            useCurvedNumberPaths: true,
            arrowsFadeAfterSettlement: true,
            noDivisionSymbol: true,
        },
        timeline: [
            { id: "T2.CUE.1", utteranceId: "T2.1", anchorText: "same two numbers", authorOnlyAction: "Highlight 4 and 7 without moving them yet.", reducedMotionState: "Outline the two source values.", mustNotOccurBeforeAnchor: true },
            { id: "T2.CUE.2", utteranceId: "T2.2", anchorText: "4 moves underneath", authorOnlyAction: "Move 4 along a curved path to the reciprocal denominator.", reducedMotionState: "Show 4 in the reciprocal denominator with a labelled start/end arrow.", mustNotOccurBeforeAnchor: true },
            { id: "T2.CUE.3", utteranceId: "T2.2", anchorText: "7 moves on top", authorOnlyAction: "Move 7 along the opposite path to the reciprocal numerator.", reducedMotionState: "Show 7 in the reciprocal numerator with a labelled start/end arrow.", mustNotOccurBeforeAnchor: true },
            { id: "T2.CUE.4", utteranceId: "T2.2", anchorText: "seven fourths", authorOnlyAction: "Settle 7/4 and fade the crossing arrows.", reducedMotionState: "Show ORIGINAL 4/7 and RECIPROCAL 7/4 side by side.", mustNotOccurBeforeAnchor: true },
            { id: "T2.CUE.5", utteranceId: "T2.3", anchorText: "product check", authorOnlyAction: "Reveal the PRODUCT CHECK region; do not solve it yet.", reducedMotionState: "Show 4/7 × 7/4 with the result area hidden.", mustNotOccurBeforeAnchor: true },
            { id: "T2.CUE.6", utteranceId: "T2.4", anchorText: "twenty-eight over twenty-eight", authorOnlyAction: "Build 28/28 from the exact numerator and denominator products.", reducedMotionState: "Show 4/7 × 7/4 = 28/28.", mustNotOccurBeforeAnchor: true },
            { id: "T2.CUE.7", utteranceId: "T2.4", anchorText: "one", authorOnlyAction: "Reveal = 1.", reducedMotionState: "Show the complete product-one equation.", mustNotOccurBeforeAnchor: true },
        ],
        authorOnlyUnderstandingExpected: "For positive non-zero a/b, b/a is the reciprocal because a/b × b/a = 1; the movement is a consequence, not the definition.",
    },
    T3: {
        id: "T3",
        stage: "teach",
        authorOnlyTeachingPurpose: "Transfer reciprocal structure to integers, unit fractions and one.",
        ryanUtteranceIds: ["T3.1", "T3.2", "T3.3", "T3.4", "T3.5"],
        visual: {
            kind: "integer_unit_fraction_reciprocal_cards",
            integer: 6,
            hiddenFraction: { numerator: 6, denominator: 1 },
            reciprocal: { numerator: 1, denominator: 6 },
            unitFractionReturnsInteger: true,
            selfReciprocal: { integer: 1, fraction: { numerator: 1, denominator: 1 } },
        },
        timeline: [
            { id: "T3.CUE.1", utteranceId: "T3.1", anchorText: "Whole numbers", authorOnlyAction: "Show 6 alone.", reducedMotionState: "Show the integer card 6.", mustNotOccurBeforeAnchor: true },
            { id: "T3.CUE.2", utteranceId: "T3.2", anchorText: "six over one", authorOnlyAction: "Reveal the fraction bar and denominator 1 so 6 = 6/1.", reducedMotionState: "Show 6 = 6/1.", mustNotOccurBeforeAnchor: true },
            { id: "T3.CUE.3", utteranceId: "T3.3", anchorText: "Reverse those positions", authorOnlyAction: "Exchange 6 and 1 to form 1/6.", reducedMotionState: "Show 6/1 ↔ 1/6.", mustNotOccurBeforeAnchor: true },
            { id: "T3.CUE.4", utteranceId: "T3.4", anchorText: "one sixth is six", authorOnlyAction: "Show 1/6 ↔ 6.", reducedMotionState: "Show the unit fraction and integer reciprocal pair.", mustNotOccurBeforeAnchor: true },
            { id: "T3.CUE.5", utteranceId: "T3.5", anchorText: "its own reciprocal", authorOnlyAction: "Reveal 1 ↔ 1 and 1 × 1 = 1.", reducedMotionState: "Show the self-reciprocal pair and product.", mustNotOccurBeforeAnchor: true },
        ],
        authorOnlyUnderstandingExpected: "An integer n is n/1, so its reciprocal is 1/n; the reciprocal of 1/n is n, and 1 is self-reciprocal.",
    },
    T4: {
        id: "T4",
        stage: "teach",
        authorOnlyTeachingPurpose: "Establish zero as the only exception in the pilot domain.",
        ryanUtteranceIds: ["T4.1", "T4.2", "T4.3", "T4.4"],
        visual: {
            kind: "zero_product_impossibility",
            targetEquation: "0 × ? = 1",
            trials: ["0 × 1 = 0", "0 × 5 = 0", "0 × 1/2 = 0"],
            invalidFraction: { numerator: 1, denominator: 0, crossedOut: true },
            finalLabel: "NO RECIPROCAL",
            neverTreatOneOverZeroAsAnswer: true,
        },
        timeline: [
            { id: "T4.CUE.1", utteranceId: "T4.1", anchorText: "Zero", authorOnlyAction: "Show 0 × ? = 1 without any answer card.", reducedMotionState: "Show the impossible target equation.", mustNotOccurBeforeAnchor: true },
            { id: "T4.CUE.2", utteranceId: "T4.2", anchorText: "make one", authorOnlyAction: "Keep the target 1 visually highlighted.", reducedMotionState: "Emphasise the target product 1.", mustNotOccurBeforeAnchor: true },
            { id: "T4.CUE.3", utteranceId: "T4.3", anchorText: "still zero", authorOnlyAction: "Try the three example factors one at a time; each product remains 0.", reducedMotionState: "Show all three zero-product examples with the unmet target beside them.", mustNotOccurBeforeAnchor: true },
            { id: "T4.CUE.4", utteranceId: "T4.4", anchorText: "no reciprocal", authorOnlyAction: "Reveal NO RECIPROCAL.", reducedMotionState: "Show the NO RECIPROCAL label.", mustNotOccurBeforeAnchor: true },
            { id: "T4.CUE.5", utteranceId: "T4.4", anchorText: "One over zero", authorOnlyAction: "Show 1/0 crossed out as invalid, never as a selectable answer.", reducedMotionState: "Show crossed-out 1/0 after the verbal explanation.", mustNotOccurBeforeAnchor: true },
        ],
        authorOnlyUnderstandingExpected: "Zero has no reciprocal because zero times every number is zero; 1/0 is invalid and never belongs in valid fraction data.",
    },
};
const FRA26_POLICY = {
    unscoredChoice: {
        hintPolicy: "none",
        solutionPolicy: "after_response",
        scored: false,
        answerLocksOnSubmit: true,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: false,
        supportedSuccessCountsAsMastery: false,
    },
    guidedChoice: {
        hintPolicy: "guided",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: false,
        supportedSuccessCountsAsMastery: false,
    },
    guidedFraction: {
        hintPolicy: "guided",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: true,
        supportedSuccessCountsAsMastery: false,
    },
    fadedFraction: {
        hintPolicy: "optional",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: true,
        allowEquivalentReciprocal: true,
        supportedSuccessCountsAsMastery: false,
    },
    fadedMatch: {
        hintPolicy: "optional",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: true,
        allowEquivalentReciprocal: false,
        supportedSuccessCountsAsMastery: false,
    },
    independentFraction: {
        hintPolicy: "optional",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: true,
        allowEquivalentReciprocal: true,
        supportedSuccessCountsAsMastery: false,
    },
    independentChoice: {
        hintPolicy: "optional",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: true,
        allowEquivalentReciprocal: false,
        supportedSuccessCountsAsMastery: false,
    },
    confirmationFraction: {
        hintPolicy: "none",
        solutionPolicy: "after_locked_submit",
        scored: true,
        answerLocksOnSubmit: true,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: true,
        supportedSuccessCountsAsMastery: false,
    },
    confirmationChoice: {
        hintPolicy: "none",
        solutionPolicy: "after_locked_submit",
        scored: true,
        answerLocksOnSubmit: true,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: false,
        supportedSuccessCountsAsMastery: false,
    },
    finalFraction: {
        hintPolicy: "none",
        solutionPolicy: "after_locked_submit",
        scored: true,
        answerLocksOnSubmit: true,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: true,
        supportedSuccessCountsAsMastery: false,
    },
    finalChoice: {
        hintPolicy: "none",
        solutionPolicy: "after_locked_submit",
        scored: true,
        answerLocksOnSubmit: true,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: false,
        supportedSuccessCountsAsMastery: false,
    },
    repairGuided: {
        hintPolicy: "guided",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: true,
        supportedSuccessCountsAsMastery: false,
    },
    recoveryFinal: {
        hintPolicy: "none",
        solutionPolicy: "after_locked_submit",
        scored: true,
        answerLocksOnSubmit: true,
        requiresFreshNoHintConfirmationIfHintUsed: false,
        allowEquivalentReciprocal: true,
        supportedSuccessCountsAsMastery: false,
    },
};
exports.FRA26_QUESTIONS = {
    HOOK: {
        id: "HOOK",
        stage: "opening",
        families: ["REASON"],
        authorOnlyAssessmentIntent: "unscored_prediction_to_create_need_for_inverse_multiplier",
        promptCopyId: "HOOK.PROMPT",
        accessibleDescriptionCopyId: "HOOK.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["HOOK.1", "HOOK.2"],
        visual: {
            kind: "scale_card_restoration",
            startWidth: 25,
            firstMultiplier: { numerator: 3, denominator: 5 },
            currentWidth: 15,
            doNotRevealChoiceOutcomesBeforeResponse: true,
        },
        response: {
            kind: "non_scored_choice",
            submitLabelCopyId: "BUTTON.SHOW",
            options: [
                { id: "repeat", copyId: "HOOK.OPTION.REPEAT", value: { numerator: 3, denominator: 5 } },
                { id: "restore", copyId: "HOOK.OPTION.RESTORE", value: { numerator: 5, denominator: 3 } },
            ],
        },
        answer: { optionId: "restore", scored: false },
        policy: FRA26_POLICY.unscoredChoice,
        feedback: {
            correctCopyIds: ["HOOK.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["HOOK.FEEDBACK.INCORRECT"],
            byResponse: [
                { matcher: "selected repeat", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["HOOK.FEEDBACK.INCORRECT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["HOOK.WORK.REPEAT", "HOOK.WORK.RESTORE"],
            visual: {
                repeatPath: { calculation: "15 × 3/5", result: 9 },
                restorePath: { calculation: "15 × 5/3", result: 25 },
            },
        },
        route: {
            afterAnyPrediction: ["HOOK.REVEAL.1", "HOOK.REVEAL.2", "T1"],
            evidenceContribution: "none",
        },
    },
    G1: {
        id: "G1",
        stage: "guided",
        families: ["MISSING"],
        authorOnlyAssessmentIntent: "complete_fraction_product_to_one_with_choice_distractors",
        promptCopyId: "G1.PROMPT",
        accessibleDescriptionCopyId: "G1.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["G1.PRE"],
        visual: {
            kind: "missing_fraction_factor_equation",
            knownFactor: { numerator: 2, denominator: 7 },
            targetProduct: 1,
            noAutomaticProductAnimationBeforeResponse: true,
        },
        response: {
            kind: "single_choice",
            options: [
                { id: "A", copyId: "G1.OPTION.A", value: { numerator: 7, denominator: 2 } },
                { id: "B", copyId: "G1.OPTION.B", value: { numerator: 2, denominator: 7 } },
                { id: "C", copyId: "G1.OPTION.C", value: { numerator: 7, denominator: 9 } },
                { id: "D", copyId: "G1.OPTION.D", value: { numerator: 1, denominator: 7 } },
            ],
        },
        answer: { optionId: "A", fraction: { numerator: 7, denominator: 2 } },
        policy: FRA26_POLICY.guidedChoice,
        feedback: {
            correctRyanUtteranceIds: ["G1.CORRECT"],
            incorrectDefaultCopyIds: ["G1.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "selected B", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["G1.FEEDBACK.SAME"] },
                { matcher: "selected C", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["G1.FEEDBACK.LOST"] },
                { matcher: "selected D", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["G1.FEEDBACK.WRONG_SOURCE"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: {
            firstCorrect: "G2",
            firstMiss: "retry_with_matching_visible_feedback",
            repeatedAlignedMiss: "R-REVERSE",
            guidedEvidenceOnly: true,
        },
    },
    G2: {
        id: "G2",
        stage: "guided",
        families: ["DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "transfer_reciprocal_structure_to_an_integer_with_hidden_denominator_cue",
        promptCopyId: "G2.PROMPT",
        accessibleDescriptionCopyId: "G2.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["G2.PRE"],
        visual: {
            kind: "integer_to_fraction_then_reciprocal",
            integer: 8,
            shownStructure: { numerator: 8, denominator: 1 },
            reciprocalInput: "fraction",
            doNotPrepopulateReciprocalFields: true,
        },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.CHECK" },
        answer: { kind: "reciprocal", source: { kind: "integer", value: 8 }, exact: { numerator: 1, denominator: 8 } },
        policy: FRA26_POLICY.guidedFraction,
        hint: { copyId: "G2.HINT" },
        feedback: {
            correctRyanUtteranceIds: ["G2.CORRECT"],
            incorrectDefaultCopyIds: ["G2.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "submitted 8 or 8/1 or equivalent", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", copyIds: ["G2.FEEDBACK.UNCHANGED"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: {
            firstCorrect: "GUIDED_ROUTE_DECISION",
            firstMiss: "retry_with_hidden_denominator_structure",
            repeatedAlignedMiss: "R-INTEGER",
            guidedEvidenceOnly: true,
        },
    },
    F1: {
        id: "F1",
        stage: "faded",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "standard_route_direct_fraction_reciprocal_with_optional_hint",
        promptCopyId: "F1.PROMPT",
        accessibleDescriptionCopyId: "F1.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["F1.PRE"],
        visual: {
            kind: "direct_reciprocal_fraction_input",
            source: { numerator: 5, denominator: 9 },
            crossingAnimationBeforeSubmit: false,
            emptyNumeratorAndDenominator: true,
        },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.CHECK" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 5, denominator: 9 } }, exact: { numerator: 9, denominator: 5 } },
        policy: FRA26_POLICY.fadedFraction,
        hint: { copyId: "F1.HINT" },
        feedback: {
            correctCopyIds: ["F1.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["F1.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "unchanged or one position unchanged or one source value missing", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["F1.FEEDBACK.DEFAULT"] },
                { matcher: "same source values but arithmetic product slip only", family: "arithmetic_slip", classificationRule: "arithmetic_only", copyIds: ["F1.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: {
            correctWithoutHint: "F2",
            correctAfterHint: "mark_supported_then_continue_to_F2_and_require_confirmation_before_final",
            repeatedAlignedMiss: "R-REVERSE",
            skippedOnStrongRoute: true,
        },
    },
    F2: {
        id: "F2",
        stage: "faded",
        families: ["MATCH", "DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "coordinate_proper_fraction_integer_and_unit_fraction_reciprocal_pairs",
        promptCopyId: "F2.PROMPT",
        accessibleDescriptionCopyId: "F2.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["F2.PRE"],
        visual: {
            kind: "reciprocal_pair_matching",
            leftCards: [
                { id: "L1", value: { numerator: 4, denominator: 11 } },
                { id: "L2", value: 7 },
                { id: "L3", value: { numerator: 1, denominator: 6 } },
            ],
            rightCards: [
                { id: "R1", value: 6 },
                { id: "R2", value: { numerator: 11, denominator: 4 } },
                { id: "R3", value: { numerator: 1, denominator: 7 } },
            ],
            desktopInteraction: "drag_or_select",
            mobileAndKeyboardInteraction: "select_source_then_select_target",
        },
        response: {
            kind: "matching",
            submitLabelCopyId: "BUTTON.CHECK",
            options: [
                { id: "L1", copyId: "F2.LEFT.A", value: { numerator: 4, denominator: 11 } },
                { id: "L2", copyId: "F2.LEFT.B", value: 7 },
                { id: "L3", copyId: "F2.LEFT.C", value: { numerator: 1, denominator: 6 } },
                { id: "R1", copyId: "F2.RIGHT.A", value: 6 },
                { id: "R2", copyId: "F2.RIGHT.B", value: { numerator: 11, denominator: 4 } },
                { id: "R3", copyId: "F2.RIGHT.C", value: { numerator: 1, denominator: 7 } },
            ],
        },
        answer: { pairs: [["L1", "R2"], ["L2", "R3"], ["L3", "R1"]] },
        policy: FRA26_POLICY.fadedMatch,
        hint: { copyId: "F2.HINT" },
        feedback: {
            correctCopyIds: ["F2.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["F2.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "fraction pair unchanged or source value lost", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["F2.FEEDBACK.DEFAULT"] },
                { matcher: "integer 7 paired with 7 or 7/1", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", copyIds: ["F2.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: {
            alwaysRetained: true,
            correctWithoutHint: "I1",
            correctAfterHint: "mark_supported_and_require_matching_or_integer_confirmation_before_final",
            repeatedAlignedMiss: "matching_repair_by_family",
        },
    },
    I1: {
        id: "I1",
        stage: "independent",
        families: ["MISSING"],
        authorOnlyAssessmentIntent: "unsupported_improper_fraction_missing_reciprocal_factor",
        promptCopyId: "I1.PROMPT",
        accessibleDescriptionCopyId: "I1.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["I1.PRE"],
        visual: {
            kind: "missing_fraction_factor_equation",
            knownFactor: { numerator: 13, denominator: 5 },
            targetProduct: 1,
            teachingLabelsCleared: true,
            noAutomaticNumberCrossing: true,
        },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.CHECK" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 13, denominator: 5 } }, exact: { numerator: 5, denominator: 13 } },
        policy: FRA26_POLICY.independentFraction,
        hint: { copyId: "I1.HINT" },
        feedback: {
            correctCopyIds: ["I1.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["I1.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "submitted 13/5 or only one source value moved or one source value lost", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["I1.FEEDBACK.UNCHANGED"] },
                { matcher: "submitted reciprocal is correct but visible product arithmetic is wrong", family: "arithmetic_slip", classificationRule: "arithmetic_only", copyIds: ["I1.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: {
            correctWithoutHint: "I2",
            correctAfterHint: "C-FRACTION_before_final",
            repeatedAlignedMiss: "R-REVERSE",
        },
    },
    I2: {
        id: "I2",
        stage: "independent",
        families: ["REASON", "ERROR", "ZERO_EXCEPTION", "INTEGER"],
        authorOnlyAssessmentIntent: "test_product_one_definition_across_one_zero_sign_and_integer_claims",
        promptCopyId: "I2.PROMPT",
        accessibleDescriptionCopyId: "I2.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["I2.PRE"],
        visual: { kind: "statement_choice", showWorkedProductsBeforeSubmit: false },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.CHECK",
            options: [
                { id: "A", copyId: "I2.OPTION.A", value: "one_self_reciprocal" },
                { id: "B", copyId: "I2.OPTION.B", value: "zero_has_reciprocal" },
                { id: "C", copyId: "I2.OPTION.C", value: "sign_change" },
                { id: "D", copyId: "I2.OPTION.D", value: "integer_unchanged" },
            ],
        },
        answer: { optionId: "A" },
        policy: FRA26_POLICY.independentChoice,
        hint: { copyId: "I2.HINT" },
        feedback: {
            correctCopyIds: ["I2.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["CONFIRM.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "selected B", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", copyIds: ["I2.FEEDBACK.ZERO"] },
                { matcher: "selected C", family: "sign_opposite", classificationRule: "immediate_if_explicit", copyIds: ["I2.FEEDBACK.SIGN"] },
                { matcher: "selected D", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", copyIds: ["I2.FEEDBACK.INTEGER"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: {
            correctWithoutHint: "INDEPENDENT_ROUTE_DECISION",
            correctAfterHint: "C-ZERO_or_C-INTEGER_before_final_based_on_supported_claim",
            repeatedAlignedMiss: "matching_repair_by_family",
        },
    },
    "C-FRACTION": {
        id: "C-FRACTION",
        stage: "confirmation",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "fresh_no_hint_fraction_confirmation_after_supported_success",
        promptCopyId: "C-FRACTION.PROMPT",
        accessibleDescriptionCopyId: "C-FRACTION.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "direct_reciprocal_fraction_input", source: { numerator: 8, denominator: 3 }, noHint: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 8, denominator: 3 } }, exact: { numerator: 3, denominator: 8 } },
        policy: FRA26_POLICY.confirmationFraction,
        feedback: {
            correctCopyIds: ["CONFIRM.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["CONFIRM.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["CONFIRM.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["RECOVERY.WORK.RECIPROCAL"],
            visual: { equation: "8/3 × 3/8 = 24/24 = 1" },
        },
        route: { correct: "resume_pending_sequence_or_final", incorrect: "R-REVERSE" },
    },
    "C-INTEGER": {
        id: "C-INTEGER",
        stage: "confirmation",
        families: ["DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "fresh_no_hint_integer_confirmation_after_supported_success",
        promptCopyId: "C-INTEGER.PROMPT",
        accessibleDescriptionCopyId: "C-INTEGER.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "integer_reciprocal_fraction_input", integer: 11, doNotShowElevenOverOneBeforeSubmit: true, noHint: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "integer", value: 11 }, exact: { numerator: 1, denominator: 11 } },
        policy: FRA26_POLICY.confirmationFraction,
        feedback: {
            correctCopyIds: ["CONFIRM.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["CONFIRM.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "submitted 11 or 11/1 or equivalent", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", copyIds: ["CONFIRM.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["RECOVERY.WORK.INTEGER"],
            visual: { steps: ["11 = 11/1", "reciprocal = 1/11", "11 × 1/11 = 1"] },
        },
        route: { correct: "resume_pending_sequence_or_final", incorrect: "R-INTEGER" },
    },
    "C-PRODUCT": {
        id: "C-PRODUCT",
        stage: "confirmation",
        families: ["MISSING", "INTEGER"],
        authorOnlyAssessmentIntent: "fresh_no_hint_product_confirmation_after_supported_success",
        promptCopyId: "C-PRODUCT.PROMPT",
        accessibleDescriptionCopyId: "C-PRODUCT.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "integer_missing_fraction_factor", integer: 12, targetProduct: 1, noHint: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "integer", value: 12 }, exact: { numerator: 1, denominator: 12 } },
        policy: FRA26_POLICY.confirmationFraction,
        feedback: {
            correctCopyIds: ["CONFIRM.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["CONFIRM.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "submitted 12 or 12/1 or equivalent", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", copyIds: ["CONFIRM.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["RECOVERY.WORK.INTEGER"],
            visual: { equation: "12 × 1/12 = 1" },
        },
        route: { correct: "resume_pending_sequence_or_final", incorrect: "R-INTEGER" },
    },
    "C-ZERO": {
        id: "C-ZERO",
        stage: "confirmation",
        families: ["REASON", "ZERO_EXCEPTION"],
        authorOnlyAssessmentIntent: "fresh_no_hint_zero_exception_confirmation_after_supported_success",
        promptCopyId: "C-ZERO.PROMPT",
        accessibleDescriptionCopyId: "C-ZERO.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "number_choice", doNotShowProductReasonBeforeSubmit: true, noHint: true },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.SUBMIT",
            options: [
                { id: "ZERO", copyId: "C-ZERO.OPTION.ZERO", value: 0 },
                { id: "ONE", copyId: "C-ZERO.OPTION.ONE", value: 1 },
                { id: "FOUR", copyId: "C-ZERO.OPTION.FOUR", value: 4 },
                { id: "EIGHTH", copyId: "C-ZERO.OPTION.EIGHTH", value: { numerator: 1, denominator: 8 } },
            ],
        },
        answer: { optionId: "ZERO", value: 0 },
        policy: FRA26_POLICY.confirmationChoice,
        feedback: {
            correctCopyIds: ["CONFIRM.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["CONFIRM.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "selected non-zero option", family: "zero_has_reciprocal", classificationRule: "repeat_or_paired_evidence", copyIds: ["CONFIRM.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["RECOVERY.WORK.ZERO"],
            visual: { equation: "0 × any number = 0, never 1" },
        },
        route: { correct: "resume_pending_sequence_or_final", incorrect: "R-ZERO" },
    },
    M1: {
        id: "M1",
        stage: "final",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "fresh_unsupported_direct_reciprocal_of_proper_fraction",
        promptCopyId: "M1.PROMPT",
        accessibleDescriptionCopyId: "M1.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: {
            kind: "final_direct_reciprocal",
            source: { numerator: 7, denominator: 12 },
            beforeSubmit: { emptyFractionInput: true, showWorking: false, showCrossingAnimation: false },
            afterSubmit: { preserveCommittedAnswer: true },
        },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 7, denominator: 12 } }, exact: { numerator: 12, denominator: 7 } },
        policy: FRA26_POLICY.finalFraction,
        feedback: {
            correctRyanUtteranceIds: ["M1.CORRECT"],
            incorrectDefaultRyanUtteranceIds: ["M1.INCORRECT"],
            byResponse: [
                { matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", ryanUtteranceIds: ["M1.INCORRECT"] },
                { matcher: "same two values with a changed sign", family: "sign_opposite", classificationRule: "immediate_if_explicit", ryanUtteranceIds: ["M1.INCORRECT"] },
                { matcher: "source values altered without equivalent value", family: "value_changed", classificationRule: "repeat_or_paired_evidence", ryanUtteranceIds: ["M1.INCORRECT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["M1.WORK.1", "M1.WORK.2"],
            visual: { source: { numerator: 7, denominator: 12 }, reciprocal: { numerator: 12, denominator: 7 }, product: { numerator: 84, denominator: 84, result: 1 } },
        },
        route: { afterLockAndWorking: "M2", evidenceSource: "committed_pre_working_answer" },
    },
    M2: {
        id: "M2",
        stage: "final",
        families: ["DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "fresh_unsupported_reciprocal_of_integer",
        promptCopyId: "M2.PROMPT",
        accessibleDescriptionCopyId: "M2.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: {
            kind: "final_integer_reciprocal",
            integer: 15,
            beforeSubmit: { doNotShowFifteenOverOne: true, emptyFractionInput: true, showWorking: false },
            afterSubmit: { preserveCommittedAnswer: true },
        },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "integer", value: 15 }, exact: { numerator: 1, denominator: 15 } },
        policy: FRA26_POLICY.finalFraction,
        feedback: {
            correctRyanUtteranceIds: ["M2.CORRECT"],
            incorrectDefaultRyanUtteranceIds: ["M2.INCORRECT"],
            byResponse: [
                { matcher: "submitted 15 or 15/1 or equivalent", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", ryanUtteranceIds: ["M2.INCORRECT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["M2.WORK.1", "M2.WORK.2"],
            visual: { steps: [{ from: 15, to: { numerator: 15, denominator: 1 } }, { exchange: true, to: { numerator: 1, denominator: 15 } }], product: 1 },
        },
        route: { afterLockAndWorking: "M3", evidenceSource: "committed_pre_working_answer" },
    },
    M3: {
        id: "M3",
        stage: "final",
        families: ["MISSING"],
        authorOnlyAssessmentIntent: "fresh_unsupported_missing_reciprocal_factor",
        promptCopyId: "M3.PROMPT",
        accessibleDescriptionCopyId: "M3.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: {
            kind: "final_missing_fraction_factor",
            knownFactor: { numerator: 9, denominator: 4 },
            targetProduct: 1,
            beforeSubmit: { emptyFractionInput: true, showWorking: false, showCrossingAnimation: false },
            afterSubmit: { preserveCommittedAnswer: true },
        },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 9, denominator: 4 } }, exact: { numerator: 4, denominator: 9 } },
        policy: FRA26_POLICY.finalFraction,
        feedback: {
            correctRyanUtteranceIds: ["M3.CORRECT"],
            incorrectDefaultRyanUtteranceIds: ["M3.INCORRECT"],
            byResponse: [
                { matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", ryanUtteranceIds: ["M3.INCORRECT"] },
                { matcher: "correct reciprocal but product arithmetic slip only", family: "arithmetic_slip", classificationRule: "arithmetic_only", ryanUtteranceIds: ["M3.INCORRECT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["M3.WORK.1", "M3.WORK.2"],
            visual: { equation: "9/4 × 4/9 = 36/36 = 1" },
        },
        route: { afterLockAndWorking: "M4", evidenceSource: "committed_pre_working_answer" },
    },
    M4: {
        id: "M4",
        stage: "final",
        families: ["ERROR", "REASON", "ZERO_EXCEPTION"],
        authorOnlyAssessmentIntent: "fresh_unsupported_zero_exception_error_reasoning",
        promptCopyId: "M4.PROMPT",
        accessibleDescriptionCopyId: "M4.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: {
            kind: "final_claim_evaluation",
            claimIncludesInvalidFractionAsTextOnly: "1/0",
            neverRenderInvalidFractionAsValidAnswerObject: true,
            showProductReasonBeforeSubmit: false,
            afterSubmit: { preserveCommittedAnswer: true },
        },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.SUBMIT",
            options: [
                { id: "A", copyId: "M4.OPTION.A", value: "invalid_product_claim" },
                { id: "B", copyId: "M4.OPTION.B", value: "zero_product_reason" },
                { id: "C", copyId: "M4.OPTION.C", value: "zero_self_reciprocal_claim" },
                { id: "D", copyId: "M4.OPTION.D", value: "every_number_claim" },
            ],
        },
        answer: { optionId: "B" },
        policy: FRA26_POLICY.finalChoice,
        feedback: {
            correctRyanUtteranceIds: ["M4.CORRECT"],
            incorrectDefaultRyanUtteranceIds: ["M4.INCORRECT"],
            byResponse: [
                { matcher: "selected A", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", ryanUtteranceIds: ["M4.INCORRECT"] },
                { matcher: "selected C", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", ryanUtteranceIds: ["M4.INCORRECT"] },
                { matcher: "selected D", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", ryanUtteranceIds: ["M4.INCORRECT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: {
            revealOnlyWhenAnswerLocked: true,
            copyIds: ["M4.WORK.1", "M4.WORK.2"],
            visual: { target: "0 × ? = 1", invariant: "0 × any number = 0", invalidFractionCrossedOut: "1/0", conclusion: "NO RECIPROCAL" },
        },
        route: { afterLockAndWorking: "FINAL_ROUTE_DECISION", evidenceSource: "committed_pre_working_answer" },
    },
    "R-REVERSE-SUPPORTED": {
        id: "R-REVERSE-SUPPORTED",
        stage: "repair",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "supported_reconstruction_of_both_exchanged_positions",
        promptCopyId: "R-REVERSE.SUPPORTED.PROMPT",
        accessibleDescriptionCopyId: "R-REVERSE.SUPPORTED.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["R-REVERSE.1", "R-REVERSE.2", "R-REVERSE.3", "R-REVERSE.4"],
        visual: {
            kind: "two_tile_reciprocal_builder",
            source: { numerator: 4, denominator: 9 },
            numberTiles: [4, 9],
            reciprocalSlots: ["numerator", "denominator"],
            sourceRemainsVisible: true,
            neverAutoPlaceFinalTiles: true,
        },
        response: { kind: "matching", submitLabelCopyId: "BUTTON.CHECK" },
        answer: { reciprocal: { numerator: 9, denominator: 4 }, placements: { numerator: 9, denominator: 4 } },
        policy: FRA26_POLICY.repairGuided,
        feedback: {
            correctCopyIds: ["REPAIR.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "one tile unchanged or duplicated or omitted", family: "reverse_incomplete", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: { correct: "R-REVERSE-CHECK", incorrect: "retry_supported_once_then_needs_more_work_if_still_insecure" },
    },
    "R-REVERSE-CHECK": {
        id: "R-REVERSE-CHECK",
        stage: "recovery",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "fresh_independent_check_after_reverse_repair",
        promptCopyId: "R-REVERSE.CHECK.PROMPT",
        accessibleDescriptionCopyId: "R-REVERSE.CHECK.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "direct_reciprocal_fraction_input", source: { numerator: 8, denominator: 13 }, noHint: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 8, denominator: 13 } }, exact: { numerator: 13, denominator: 8 } },
        policy: FRA26_POLICY.confirmationFraction,
        feedback: {
            correctCopyIds: ["REPAIR.CHECK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.CHECK.DEFAULT"],
            byResponse: [
                { matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.CHECK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["R-REVERSE.CHECK.WORK"], visual: { equation: "8/13 × 13/8 = 104/104 = 1" } },
        route: { correct: "resume_pending_sequence", incorrect: "remain_in_R-REVERSE_or_needs_more_work_at_retry_cap" },
    },
    "R-INTEGER-SUPPORTED": {
        id: "R-INTEGER-SUPPORTED",
        stage: "repair",
        families: ["DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "supported_hidden_denominator_then_integer_reciprocal_construction",
        promptCopyId: "R-INTEGER.SUPPORTED.PROMPT",
        accessibleDescriptionCopyId: "R-INTEGER.SUPPORTED.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["R-INTEGER.1", "R-INTEGER.2"],
        visual: {
            kind: "staged_integer_reciprocal_builder",
            integer: 8,
            firstStage: { numeratorFixed: 8, denominatorSlot: true, expected: 1 },
            secondStageAppearsAfterFirstStage: true,
            afterFirstStageRyanUtteranceIds: ["R-INTEGER.3", "R-INTEGER.4"],
            secondStage: { emptyReciprocalFraction: true },
            neverRevealOneEighthBeforeLearnerCompletesFirstStage: true,
        },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.CHECK" },
        answer: { staged: [{ numerator: 8, denominator: 1 }, { numerator: 1, denominator: 8 }] },
        policy: FRA26_POLICY.repairGuided,
        feedback: {
            correctCopyIds: ["REPAIR.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "reciprocal remains 8 or 8/1", family: "integer_unchanged", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: { correct: "R-INTEGER-CHECK", incorrect: "retry_supported_once_then_needs_more_work_if_still_insecure" },
    },
    "R-INTEGER-CHECK": {
        id: "R-INTEGER-CHECK",
        stage: "recovery",
        families: ["DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "fresh_independent_check_after_integer_repair",
        promptCopyId: "R-INTEGER.CHECK.PROMPT",
        accessibleDescriptionCopyId: "R-INTEGER.CHECK.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "integer_reciprocal_fraction_input", integer: 12, doNotShowTwelveOverOneBeforeSubmit: true, noHint: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "integer", value: 12 }, exact: { numerator: 1, denominator: 12 } },
        policy: FRA26_POLICY.confirmationFraction,
        feedback: {
            correctCopyIds: ["REPAIR.CHECK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.CHECK.DEFAULT"],
            byResponse: [
                { matcher: "submitted 12 or 12/1", family: "integer_unchanged", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.CHECK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.INTEGER"], visual: { steps: ["12 = 12/1", "reciprocal = 1/12", "12 × 1/12 = 1"] } },
        route: { correct: "resume_pending_sequence", incorrect: "remain_in_R-INTEGER_or_needs_more_work_at_retry_cap" },
    },
    "R-ZERO-SUPPORTED": {
        id: "R-ZERO-SUPPORTED",
        stage: "repair",
        families: ["REASON", "ZERO_EXCEPTION"],
        authorOnlyAssessmentIntent: "supported_selection_of_no_reciprocal_after_zero_product_trials",
        promptCopyId: "R-ZERO.SUPPORTED.PROMPT",
        accessibleDescriptionCopyId: "R-ZERO.SUPPORTED.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["R-ZERO.1", "R-ZERO.2", "R-ZERO.3", "R-ZERO.4"],
        visual: {
            kind: "zero_impossible_product_choice",
            equation: "0 × ? = 1",
            triedProducts: ["0 × 1 = 0", "0 × 6 = 0", "0 × 3/4 = 0"],
            neverOfferOneOverZeroAsValidFractionData: true,
        },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.CHECK",
            options: [
                { id: "A", copyId: "R-ZERO.OPTION.A", value: "invalid_one_over_zero" },
                { id: "B", copyId: "R-ZERO.OPTION.B", value: 0 },
                { id: "C", copyId: "R-ZERO.OPTION.C", value: "no_reciprocal" },
            ],
        },
        answer: { optionId: "C" },
        policy: { ...FRA26_POLICY.repairGuided, allowEquivalentReciprocal: false },
        feedback: {
            correctCopyIds: ["REPAIR.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "selected A", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.FEEDBACK.DEFAULT"] },
                { matcher: "selected B", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: { correct: "R-ZERO-CHECK", incorrect: "retry_supported_once_then_needs_more_work_if_still_insecure" },
    },
    "R-ZERO-CHECK": {
        id: "R-ZERO-CHECK",
        stage: "recovery",
        families: ["REASON", "ZERO_EXCEPTION"],
        authorOnlyAssessmentIntent: "fresh_independent_check_after_zero_repair",
        promptCopyId: "R-ZERO.CHECK.PROMPT",
        accessibleDescriptionCopyId: "R-ZERO.CHECK.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "number_choice", doNotShowProductReasonBeforeSubmit: true, noHint: true },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.SUBMIT",
            options: [
                { id: "ZERO", copyId: "C-ZERO.OPTION.ZERO", value: 0 },
                { id: "ONE", copyId: "C-ZERO.OPTION.ONE", value: 1 },
                { id: "FOUR", copyId: "C-ZERO.OPTION.FOUR", value: 4 },
                { id: "EIGHTH", copyId: "C-ZERO.OPTION.EIGHTH", value: { numerator: 1, denominator: 8 } },
            ],
        },
        answer: { optionId: "ZERO", value: 0 },
        policy: FRA26_POLICY.confirmationChoice,
        feedback: {
            correctCopyIds: ["REPAIR.CHECK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.CHECK.DEFAULT"],
            byResponse: [
                { matcher: "selected any non-zero option", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.CHECK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.ZERO"], visual: { equation: "0 × any number = 0" } },
        route: { correct: "resume_pending_sequence", incorrect: "remain_in_R-ZERO_or_needs_more_work_at_retry_cap" },
    },
    "R-SIGN-VALUE-SUPPORTED": {
        id: "R-SIGN-VALUE-SUPPORTED",
        stage: "repair",
        families: ["MISSING", "REASON"],
        authorOnlyAssessmentIntent: "contrast_reciprocal_with_opposite_sign_or_invalid_value_rewrite",
        promptCopyId: "R-SIGN-VALUE.SUPPORTED.PROMPT",
        accessibleDescriptionCopyId: "R-SIGN-VALUE.SUPPORTED.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: ["R-SIGN-VALUE.1", "R-SIGN-VALUE.2", "R-SIGN-VALUE.3", "R-SIGN-VALUE.4", "R-SIGN-VALUE.5"],
        visual: {
            kind: "reciprocal_vs_opposite_choice",
            equation: "5/6 × ? = 1",
            noNegativeReciprocalProcedure: true,
            preservePositiveSourceValues: [5, 6],
        },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.CHECK",
            options: [
                { id: "A", copyId: "R-SIGN-VALUE.OPTION.A", value: { numerator: 5, denominator: 6 } },
                { id: "B", copyId: "R-SIGN-VALUE.OPTION.B", value: { numerator: -5, denominator: 6 } },
                { id: "C", copyId: "R-SIGN-VALUE.OPTION.C", value: { numerator: 6, denominator: 5 } },
            ],
        },
        answer: { optionId: "C", fraction: { numerator: 6, denominator: 5 } },
        policy: { ...FRA26_POLICY.repairGuided, allowEquivalentReciprocal: false },
        feedback: {
            correctCopyIds: ["REPAIR.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "selected A", family: "reverse_incomplete", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.FEEDBACK.DEFAULT"] },
                { matcher: "selected B", family: "sign_opposite", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        route: { correct: "R-SIGN-VALUE-CHECK", incorrect: "retry_supported_once_then_needs_more_work_if_still_insecure" },
    },
    "R-SIGN-VALUE-CHECK": {
        id: "R-SIGN-VALUE-CHECK",
        stage: "recovery",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "fresh_independent_check_after_sign_or_value_repair",
        promptCopyId: "R-SIGN-VALUE.CHECK.PROMPT",
        accessibleDescriptionCopyId: "R-SIGN-VALUE.CHECK.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "direct_reciprocal_fraction_input", source: { numerator: 2, denominator: 11 }, noHint: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 2, denominator: 11 } }, exact: { numerator: 11, denominator: 2 } },
        policy: FRA26_POLICY.confirmationFraction,
        feedback: {
            correctCopyIds: ["REPAIR.CHECK.CORRECT"],
            incorrectDefaultCopyIds: ["REPAIR.CHECK.DEFAULT"],
            byResponse: [
                { matcher: "negative sign introduced", family: "sign_opposite", classificationRule: "immediate_if_explicit", copyIds: ["REPAIR.CHECK.DEFAULT"] },
                { matcher: "source values altered without equivalence", family: "value_changed", classificationRule: "repeat_or_paired_evidence", copyIds: ["REPAIR.CHECK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.RECIPROCAL"], visual: { equation: "2/11 × 11/2 = 22/22 = 1" } },
        route: { correct: "resume_pending_sequence", incorrect: "remain_in_R-SIGN-VALUE_or_needs_more_work_at_retry_cap" },
    },
    "RM-DIRECT": {
        id: "RM-DIRECT",
        stage: "recovery",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "fresh_direct_item_for_two_item_mini_check",
        promptCopyId: "RM-DIRECT.PROMPT",
        accessibleDescriptionCopyId: "RM-DIRECT.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "direct_reciprocal_fraction_input", source: { numerator: 3, denominator: 14 }, noHint: true, unseenInPrimaryFinal: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 3, denominator: 14 } }, exact: { numerator: 14, denominator: 3 } },
        policy: FRA26_POLICY.recoveryFinal,
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.RECIPROCAL"], visual: { equation: "3/14 × 14/3 = 42/42 = 1" } },
        route: { afterLockAndWorking: "continue_selected_mini_check" },
    },
    "RM-INTEGER": {
        id: "RM-INTEGER",
        stage: "recovery",
        families: ["DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "fresh_integer_item_for_two_item_mini_check",
        promptCopyId: "RM-INTEGER.PROMPT",
        accessibleDescriptionCopyId: "RM-INTEGER.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "integer_reciprocal_fraction_input", integer: 17, noHint: true, unseenInPrimaryFinal: true, doNotRevealSeventeenOverOneBeforeSubmit: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "integer", value: 17 }, exact: { numerator: 1, denominator: 17 } },
        policy: FRA26_POLICY.recoveryFinal,
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "submitted 17 or 17/1", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.INTEGER"], visual: { steps: ["17 = 17/1", "reciprocal = 1/17", "17 × 1/17 = 1"] } },
        route: { afterLockAndWorking: "continue_selected_mini_check" },
    },
    "RM-MISSING": {
        id: "RM-MISSING",
        stage: "recovery",
        families: ["MISSING"],
        authorOnlyAssessmentIntent: "fresh_missing_factor_item_for_two_item_mini_check",
        promptCopyId: "RM-MISSING.PROMPT",
        accessibleDescriptionCopyId: "RM-MISSING.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "missing_fraction_factor_equation", knownFactor: { numerator: 11, denominator: 6 }, targetProduct: 1, noHint: true, unseenInPrimaryFinal: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 11, denominator: 6 } }, exact: { numerator: 6, denominator: 11 } },
        policy: FRA26_POLICY.recoveryFinal,
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.RECIPROCAL"], visual: { equation: "11/6 × 6/11 = 66/66 = 1" } },
        route: { afterLockAndWorking: "continue_selected_mini_check" },
    },
    "RM-REASON": {
        id: "RM-REASON",
        stage: "recovery",
        families: ["REASON", "ZERO_EXCEPTION"],
        authorOnlyAssessmentIntent: "fresh_zero_reason_item_for_two_item_mini_check",
        promptCopyId: "RM-REASON.PROMPT",
        accessibleDescriptionCopyId: "RM-REASON.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "zero_reason_choice", doNotRevealProductReasonBeforeSubmit: true, unseenInPrimaryFinal: true },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.SUBMIT",
            options: [
                { id: "A", copyId: "RM-REASON.OPTION.A", value: "correct_zero_product_reason" },
                { id: "B", copyId: "RM-REASON.OPTION.B", value: "zero_self_reciprocal" },
                { id: "C", copyId: "RM-REASON.OPTION.C", value: "zero_reciprocal_one" },
            ],
        },
        answer: { optionId: "A" },
        policy: { ...FRA26_POLICY.recoveryFinal, allowEquivalentReciprocal: false },
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "selected B or C", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.ZERO"], visual: { equation: "0 × any number = 0" } },
        route: { afterLockAndWorking: "continue_selected_mini_check" },
    },
    "RM-MATCH": {
        id: "RM-MATCH",
        stage: "recovery",
        families: ["MATCH", "DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "fresh_match_item_for_two_item_mini_check",
        promptCopyId: "RM-MATCH.PROMPT",
        accessibleDescriptionCopyId: "RM-MATCH.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: {
            kind: "reciprocal_pair_matching",
            leftCards: [{ id: "L1", value: { numerator: 3, denominator: 10 } }, { id: "L2", value: 5 }],
            rightCards: [{ id: "R1", value: { numerator: 10, denominator: 3 } }, { id: "R2", value: { numerator: 1, denominator: 5 } }],
            noHint: true,
            unseenInPrimaryFinal: true,
        },
        response: {
            kind: "matching",
            submitLabelCopyId: "BUTTON.SUBMIT",
            options: [
                { id: "L1", copyId: "RM-MATCH.LEFT.A", value: { numerator: 3, denominator: 10 } },
                { id: "L2", copyId: "RM-MATCH.LEFT.B", value: 5 },
                { id: "R1", copyId: "RM-MATCH.RIGHT.A", value: { numerator: 10, denominator: 3 } },
                { id: "R2", copyId: "RM-MATCH.RIGHT.B", value: { numerator: 1, denominator: 5 } },
            ],
        },
        answer: { pairs: [["L1", "R1"], ["L2", "R2"]] },
        policy: { ...FRA26_POLICY.recoveryFinal, allowEquivalentReciprocal: false },
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [
                { matcher: "integer unchanged or fraction pair not reversed", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] },
            ],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.RECIPROCAL", "RECOVERY.WORK.INTEGER"], visual: { products: ["3/10 × 10/3 = 1", "5 × 1/5 = 1"] } },
        route: { afterLockAndWorking: "continue_selected_mini_check" },
    },
    RF1: {
        id: "RF1",
        stage: "recovery",
        families: ["DIRECT"],
        authorOnlyAssessmentIntent: "fresh_four_item_recovery_direct_fraction",
        promptCopyId: "RF1.PROMPT",
        accessibleDescriptionCopyId: "RF1.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "direct_reciprocal_fraction_input", source: { numerator: 5, denominator: 14 }, noHint: true, unseenInPrimaryFinal: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 5, denominator: 14 } }, exact: { numerator: 14, denominator: 5 } },
        policy: FRA26_POLICY.recoveryFinal,
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [{ matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] }],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.RECIPROCAL"], visual: { equation: "5/14 × 14/5 = 70/70 = 1" } },
        route: { afterLockAndWorking: "RF2" },
    },
    RF2: {
        id: "RF2",
        stage: "recovery",
        families: ["DIRECT", "INTEGER"],
        authorOnlyAssessmentIntent: "fresh_four_item_recovery_integer",
        promptCopyId: "RF2.PROMPT",
        accessibleDescriptionCopyId: "RF2.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "integer_reciprocal_fraction_input", integer: 18, noHint: true, unseenInPrimaryFinal: true, doNotRevealEighteenOverOneBeforeSubmit: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "integer", value: 18 }, exact: { numerator: 1, denominator: 18 } },
        policy: FRA26_POLICY.recoveryFinal,
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [{ matcher: "submitted 18 or 18/1", family: "integer_unchanged", classificationRule: "repeat_or_paired_evidence", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] }],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.INTEGER"], visual: { steps: ["18 = 18/1", "reciprocal = 1/18", "18 × 1/18 = 1"] } },
        route: { afterLockAndWorking: "RF3" },
    },
    RF3: {
        id: "RF3",
        stage: "recovery",
        families: ["MISSING"],
        authorOnlyAssessmentIntent: "fresh_four_item_recovery_missing_factor",
        promptCopyId: "RF3.PROMPT",
        accessibleDescriptionCopyId: "RF3.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "missing_fraction_factor_equation", knownFactor: { numerator: 7, denominator: 3 }, targetProduct: 1, noHint: true, unseenInPrimaryFinal: true },
        response: { kind: "fraction_input", submitLabelCopyId: "BUTTON.SUBMIT" },
        answer: { kind: "reciprocal", source: { kind: "fraction", value: { numerator: 7, denominator: 3 } }, exact: { numerator: 3, denominator: 7 } },
        policy: FRA26_POLICY.recoveryFinal,
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [{ matcher: "unchanged or incomplete reversal", family: "reverse_incomplete", classificationRule: "repeat_or_paired_evidence", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] }],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.RECIPROCAL"], visual: { equation: "7/3 × 3/7 = 21/21 = 1" } },
        route: { afterLockAndWorking: "RF4" },
    },
    RF4: {
        id: "RF4",
        stage: "recovery",
        families: ["REASON", "ZERO_EXCEPTION"],
        authorOnlyAssessmentIntent: "fresh_four_item_recovery_zero_reason",
        promptCopyId: "RF4.PROMPT",
        accessibleDescriptionCopyId: "RF4.ACCESSIBLE",
        ryanBeforeSubmitUtteranceIds: [],
        visual: { kind: "zero_reason_choice", doNotRevealProductReasonBeforeSubmit: true, noHint: true, unseenInPrimaryFinal: true },
        response: {
            kind: "single_choice",
            submitLabelCopyId: "BUTTON.SUBMIT",
            options: [
                { id: "A", copyId: "RM-REASON.OPTION.A", value: "correct_zero_product_reason" },
                { id: "B", copyId: "RM-REASON.OPTION.B", value: "zero_self_reciprocal" },
                { id: "C", copyId: "RM-REASON.OPTION.C", value: "zero_reciprocal_one" },
            ],
        },
        answer: { optionId: "A" },
        policy: { ...FRA26_POLICY.recoveryFinal, allowEquivalentReciprocal: false },
        feedback: {
            correctCopyIds: ["RECOVERY.FEEDBACK.CORRECT"],
            incorrectDefaultCopyIds: ["RECOVERY.FEEDBACK.DEFAULT"],
            byResponse: [{ matcher: "selected B or C", family: "zero_has_reciprocal", classificationRule: "immediate_if_explicit", copyIds: ["RECOVERY.FEEDBACK.DEFAULT"] }],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterSpecificBranch: true,
        },
        workedCheck: { revealOnlyWhenAnswerLocked: true, copyIds: ["RECOVERY.WORK.ZERO"], visual: { equation: "0 × any number = 0" } },
        route: { afterLockAndWorking: "RECOVERY_FINAL_ROUTE_DECISION" },
    },
};
exports.FRA26 = {
    id: "FRA26",
    displayId: "FRA-26",
    title: "Understand Reciprocals",
    status: "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
    contentVersion: "fra26-handoff-v1-runtime-copy-1",
    sourceOfTruth: {
        runtimeCopyQuestionDataRoutesAndOutcomes: "FRA26_CANONICAL_SPEC.ts",
        visualGeometryAndOwnerPedagogy: "Revily_FRA-26_Storyboard_v1.pdf",
        engineeringIntegrationAndQA: "FRA26_CODEX_IMPLEMENTATION_PROMPT.md",
        launchInstruction: "FRA26_START_CODEX_PROMPT.txt",
        engineeringReference: "Existing canonical Revily FRA01-FRA25 lesson engine and compatible shared fraction, matching, TTS, caption, cue, answer-lock, evidence and persistence primitives.",
        precedence: [
            "FRA26_CANONICAL_SPEC.ts controls exact Ryan speech, learner UI copy, values, answers, branches, routes and runtime validation.",
            "The storyboard PDF controls approved visual geometry, choreography and pedagogical intent where this specification delegates rendering detail.",
            "The implementation prompt controls repository inspection, integration, testing and rollout procedure.",
        ],
        criticalRuntimeRule: "Ryan audio and Ryan captions may resolve only FRA26_RUNTIME_COPY[utteranceId].text. Visible UI, hints, author-only notes, route labels, QA prose and storyboard directions are never automatically spoken or captioned.",
    },
    curriculumContract: {
        exactObjective: "Identify and generate the reciprocal of a non-zero integer or fraction and recognise that their product is one.",
        studentFacingIdea: "A reciprocal is the partner that multiplies with a number to make one.",
        requiredPrerequisites: [
            "FRA-02: numerator and denominator roles.",
            "FRA-24: multiply two positive fractions.",
            "Multiplication facts for small positive integers.",
        ],
        teaches: [
            "Reciprocal as the multiplicative partner that makes a product of one.",
            "Positive integers, proper fractions and improper fractions.",
            "Generate a reciprocal by exchanging numerator and denominator positions while retaining the same values.",
            "Write positive integer n as n/1 before generating 1/n.",
            "Recognise unit-fraction reciprocals and that 1 is self-reciprocal.",
            "Recognise and explain that zero has no reciprocal.",
            "Verify reciprocal pairs by multiplication using FRA-24 knowledge.",
        ],
        deliberatelyLaterOrExcluded: [
            "FRA-27 fraction divided by an integer.",
            "FRA-28 division by a fraction.",
            "Keep-change-flip, invert-and-multiply, sharing division and measurement division procedures.",
            "Negative reciprocals, algebraic reciprocals and mixed-number reciprocals as target content.",
            "Cross-cancellation as a target skill; FRA-25 owns that method.",
            "Simplification as a lesson target.",
            "Any valid fraction with denominator zero.",
        ],
        cataloguePosition: {
            prerequisite: "FRA-24 Multiply Two Fractions",
            current: "FRA-26 Understand Reciprocals",
            laterUse: ["FRA-27 Divide a Fraction by an Integer", "FRA-28 Divide by a Fraction"],
            note: "FRA-25 is adjacent in catalogue order but is not a required prerequisite.",
        },
        pilotLimits: {
            positiveValuesOnly: true,
            minimumPositiveValue: 1,
            maximumValue: 20,
            coreFractionsCoprime: true,
            zeroExcludedFromReciprocalGeneration: true,
            zeroAllowedOnlyInExceptionReasoning: true,
        },
        acceptedForms: [
            "For positive fraction a/b, accept any exact fraction mathematically equivalent to b/a.",
            "For positive integer n, accept 1/n and any exact equivalent fraction.",
            "For unit fraction 1/n, accept integer n or n/1.",
            "For 1, accept 1 or 1/1.",
            "Never accept a zero denominator.",
        ],
    },
    runtimeCopy: exports.FRA26_RUNTIME_COPY,
    learnerUiCopy: exports.FRA26_LEARNER_UI_COPY,
    teachingScenes: exports.FRA26_TEACHING_SCENES,
    questions: exports.FRA26_QUESTIONS,
    stageOrder: [
        "HOOK",
        "T1",
        "T2",
        "T3",
        "T4",
        "HANDOFF",
        "G1",
        "G2",
        "GUIDED_ROUTE_DECISION",
        "F1_CONDITIONAL",
        "F2",
        "INDEPENDENT_INTRO",
        "I1",
        "I2",
        "INDEPENDENT_ROUTE_DECISION",
        "FINAL_INTRO",
        "M1",
        "M2",
        "M3",
        "M4",
        "FINAL_ROUTE_DECISION",
    ],
    authoredTransitions: {
        handoffUtteranceIds: ["HANDOFF.1", "HANDOFF.2"],
        independentIntroUtteranceIds: ["INDEPENDENT.INTRO.1", "INDEPENDENT.INTRO.2"],
        finalIntroUtteranceIds: ["FINAL.INTRO.1", "FINAL.INTRO.2"],
        completionUtteranceIds: ["COMPLETE"],
    },
    routing: {
        guidedDecision: {
            inputs: ["G1", "G2"],
            strongEvidenceRule: "Both guided items first-attempt correct, no hint/support escalation and no unresolved central misconception.",
            strongRoute: ["skip F1", "show F2"],
            standardRoute: ["show F1", "show F2"],
            forbiddenShortcutBasis: ["response speed alone", "one correct item", "correct answer after escalated support"],
            reasonF2AlwaysRemains: "F2 transfers the same concept across a proper fraction, an integer and a unit fraction in one coordinated task.",
        },
        independentDecision: {
            cleanRule: "I1 and I2 correct without hints and no unresolved/repeated central error.",
            cleanNext: "FINAL_INTRO",
            hintUsed: {
                action: "Give one unused fresh no-hint confirmation from the same family before final.",
                poolByFamily: {
                    DIRECT: ["C-FRACTION", "C-INTEGER"],
                    MISSING: ["C-FRACTION", "C-PRODUCT"],
                    INTEGER: ["C-INTEGER", "C-PRODUCT"],
                    REASON: ["C-ZERO"],
                    ZERO_EXCEPTION: ["C-ZERO"],
                    MATCH: ["C-FRACTION", "C-INTEGER"],
                    ERROR: ["C-ZERO"],
                },
                exactItemMustNotRepeat: true,
            },
            repeatedMiss: "Run the matching repair branch, then its fresh independent check before resuming.",
            guidedSuccessCannotFinishLesson: true,
        },
        repairEntryByErrorFamily: {
            reverse_incomplete: "R-REVERSE",
            integer_unchanged: "R-INTEGER",
            sign_opposite: "R-SIGN-VALUE",
            zero_has_reciprocal: "R-ZERO",
            value_changed: "R-SIGN-VALUE",
            arithmetic_slip: "ARITHMETIC_CUE_ONLY_NO_CONCEPT_REPAIR_FROM_ONE_SLIP",
            support_needed: "MATCH_CURRENT_FAMILY_CONFIRMATION",
            unknown: "NEUTRAL_RECHECK_BEFORE_CLASSIFICATION",
        },
        repairRetryCap: {
            supportedInteractionAttempts: 2,
            freshCheckAttempts: 1,
            afterCap: "needs_more_work",
            neverReplayWholeLessonForOneFamily: true,
        },
        finalDecision: {
            primaryFinalIds: ["M1", "M2", "M3", "M4"],
            evidenceSource: "committed first answer before worked check",
            completeRule: {
                score: "3-4/4",
                familyCoverageMinimum: 2,
                repeatedCentralMisconceptionAllowed: false,
                next: "complete",
            },
            twoCorrectRule: {
                score: "2/4",
                action: "Repair the missed family or families, then administer a fresh two-item mini-check.",
                miniCheckSelection: {
                    firstItem: "one fresh DIRECT, INTEGER or MISSING item from the missed family",
                    secondItem: "one fresh REASON or MATCH item that is not a replay",
                    candidateIds: ["RM-DIRECT", "RM-INTEGER", "RM-MISSING", "RM-REASON", "RM-MATCH"],
                },
                pass: "2/2, no hint, no repeated central misconception",
                fail: "needs_more_work after matching feedback/repair; do not award completion from corrected post-working answers",
            },
            zeroOrOneCorrectRule: {
                score: "0-1/4",
                action: "Repair actual weaknesses, then administer the fresh four-item recovery final.",
                recoveryFinalIds: ["RF1", "RF2", "RF3", "RF4"],
                pass: "3-4/4, at least two families, no repeated central misconception",
                fail: "needs_more_work",
            },
        },
    },
    masteryEvidence: {
        primaryOrRecoveryThreshold: "At least 3/4 first-attempt independent correct in the primary final or authored four-item recovery final.",
        miniCheckThreshold: "2/2 after a primary final score of 2/4.",
        minimumDistinctFamilies: 2,
        supportedResponsesCount: false,
        postRevealCorrectionsCountAsFirstAttempt: false,
        repeatedCentralMisconceptionBlocksCompletion: true,
        recoveryItemsMustBeFresh: true,
        lessonScopeOnly: "Completion applies only to the current FRA-26 lesson attempt.",
    },
    misconceptionMap: [
        {
            id: "R-REVERSE",
            errorFamily: "reverse_incomplete",
            observable: ["Leaves 4/9 unchanged", "gives 4/4 or 9/9", "loses one original number", "moves only one position"],
            immediateFeedback: "A reciprocal keeps both original numbers and exchanges their positions.",
            classificationThreshold: "Repeat after a direct cue or explicit one-position reasoning.",
            repairQuestionIds: ["R-REVERSE-SUPPORTED", "R-REVERSE-CHECK"],
        },
        {
            id: "R-INTEGER",
            errorFamily: "integer_unchanged",
            observable: ["Reciprocal of 8 entered as 8", "reciprocal of 8 entered as 8/1", "claims an integer keeps itself"],
            immediateFeedback: "Write the integer over 1, then exchange the two positions.",
            classificationThreshold: "Repeat on a fresh integer or explicit unchanged claim.",
            repairQuestionIds: ["R-INTEGER-SUPPORTED", "R-INTEGER-CHECK"],
        },
        {
            id: "R-SIGN",
            errorFamily: "sign_opposite",
            observable: ["Uses a negative sign as the reciprocal of a positive number", "states reciprocal means opposite"],
            immediateFeedback: "Changing sign makes an opposite, not the multiplier that makes 1.",
            classificationThreshold: "Explicit reasoning is enough; otherwise confirm with a discriminating item.",
            repairQuestionIds: ["R-SIGN-VALUE-SUPPORTED", "R-SIGN-VALUE-CHECK"],
        },
        {
            id: "R-ZERO",
            errorFamily: "zero_has_reciprocal",
            observable: ["Enters 0 as reciprocal of 0", "constructs 1/0", "claims every number has a reciprocal"],
            immediateFeedback: "Zero has no reciprocal because zero times any number stays zero.",
            classificationThreshold: "An explicit 1/0 construction is strong evidence; an isolated choice miss may require confirmation.",
            repairQuestionIds: ["R-ZERO-SUPPORTED", "R-ZERO-CHECK"],
        },
        {
            id: "R-VALUE",
            errorFamily: "value_changed",
            observable: ["Changes 4/9 to 9/2", "changes a source value after reversing", "uses an invalid simplification"],
            immediateFeedback: "Keep the same two values. Only their positions change; preserve the product of one.",
            classificationThreshold: "Repeat or visible systematic value change. Accept mathematically equivalent reciprocal forms.",
            repairQuestionIds: ["R-SIGN-VALUE-SUPPORTED", "R-SIGN-VALUE-CHECK"],
        },
        {
            id: "ARITHMETIC",
            errorFamily: "arithmetic_slip",
            observable: ["Reciprocal pair is correct but a multiplication fact in the product check is wrong"],
            immediateFeedback: "Your reciprocal pair is right. Recheck the multiplication.",
            classificationThreshold: "Never infer a reciprocal misconception from one isolated arithmetic slip.",
            repairQuestionIds: [],
        },
    ],
    repairs: {
        "R-REVERSE": {
            ryanUtteranceIds: ["R-REVERSE.1", "R-REVERSE.2", "R-REVERSE.3", "R-REVERSE.4"],
            supportedQuestionId: "R-REVERSE-SUPPORTED",
            freshCheckQuestionId: "R-REVERSE-CHECK",
            values: { teaching: { numerator: 4, denominator: 9 }, fresh: { numerator: 8, denominator: 13 } },
        },
        "R-INTEGER": {
            ryanUtteranceIds: ["R-INTEGER.1", "R-INTEGER.2", "R-INTEGER.3", "R-INTEGER.4"],
            supportedQuestionId: "R-INTEGER-SUPPORTED",
            freshCheckQuestionId: "R-INTEGER-CHECK",
            values: { teachingInteger: 8, freshInteger: 12 },
        },
        "R-ZERO": {
            ryanUtteranceIds: ["R-ZERO.1", "R-ZERO.2", "R-ZERO.3", "R-ZERO.4"],
            supportedQuestionId: "R-ZERO-SUPPORTED",
            freshCheckQuestionId: "R-ZERO-CHECK",
            validDenominatorZeroEverCreated: false,
        },
        "R-SIGN-VALUE": {
            ryanUtteranceIds: ["R-SIGN-VALUE.1", "R-SIGN-VALUE.2", "R-SIGN-VALUE.3", "R-SIGN-VALUE.4", "R-SIGN-VALUE.5"],
            supportedQuestionId: "R-SIGN-VALUE-SUPPORTED",
            freshCheckQuestionId: "R-SIGN-VALUE-CHECK",
            values: { teaching: { numerator: 5, denominator: 6 }, fresh: { numerator: 2, denominator: 11 } },
        },
    },
    evidenceRecordContract: {
        requiredFields: [
            "questionId",
            "stage",
            "family",
            "firstAttemptCorrect",
            "attempts",
            "hintOpenedBeforeSubmit",
            "supportEscalated",
            "answerLocked",
            "countsAsIndependentEvidence",
        ],
        optionalDiagnosticFieldsWithinLessonOnly: ["errorFamily", "responseMathSignature", "freshConfirmationPassed"],
        doNotCreateGlobalLearnerDiagnosis: true,
        hintOpeningIsNotWrongAnswer: true,
        correctAfterHintIsSupported: true,
    },
    answerEvaluation: {
        exactRationalArithmeticOnly: true,
        floatingPointComparisonForbidden: true,
        denominatorMustBePositiveAndNonZero: true,
        equivalentReciprocalAcceptedForFractionInput: true,
        integerAcceptedForUnitFractionReciprocal: true,
        oneAcceptedAsOneOrOneOverOne: true,
        zeroReciprocalAlwaysRejected: true,
        productDefinition: "For source a/b and candidate c/d, reciprocal correctness requires a/b × c/d = 1 exactly.",
    },
    runtimeCopyContract: {
        ryanSource: "FRA26_RUNTIME_COPY",
        captionSource: "same utterance ID and exact text",
        learnerUiSource: "FRA26_LEARNER_UI_COPY",
        learnerUiAutomaticRyanSpeech: false,
        noPermanentTranscriptBar: true,
        wordTimedCaptionsWhenAvailable: true,
        deterministicUtteranceFallbackAllowed: true,
        pauseReplayResumeMustRestoreParity: true,
        removingSpeechMustRemoveOrRemapCaptionsAndCues: true,
        forbiddenRyanSources: [
            "question prompts",
            "multiple-choice options",
            "button labels",
            "hints unless separately authored as Ryan",
            "stage labels",
            "assessment intents",
            "communication goals",
            "visual directions",
            "timeline actions",
            "error-family names",
            "route labels",
            "QA prose",
            "PDF headings and authoring notes",
        ],
    },
    outcomeBranchContract: {
        calculateCorrectnessBeforeFeedback: true,
        playExactlyOneOutcomeBranch: true,
        correctAndIncorrectFeedbackMustDiffer: true,
        wrongResponseMustNeverPlayCorrectLine: true,
        specificIncorrectSuppressesDefaultIncorrect: true,
        hookUsesDistinctVisibleOutcomeFeedbackBeforeSharedReveal: true,
        noExtraGenericPraiseAroundCanonicalOutcomeCopy: true,
        semanticRepetitionAuditRequired: true,
    },
    visualContract: {
        hookExactWidths: [25, 15, 9, 25],
        hookCalculations: ["25 × 3/5 = 15", "15 × 3/5 = 9", "15 × 5/3 = 25"],
        productOneChecksExact: true,
        numberCrossingConnectsActualSourceValues: true,
        integerShowsNOverOneBeforeOneOverNInTeaching: true,
        finalItemsShowNoCrossingOrProductBeforeSubmit: true,
        zeroNeverRenderedAsValidDenominator: true,
        oneDominantMathVisualAtATime: true,
        contextAndVisualMustAgree: true,
    },
    responsiveContract: {
        referenceMobileWidthPx: 390,
        equationAndInputMayStackVertically: true,
        minimumFractionFieldTapWidthPx: 56,
        clearFractionBarSpacing: true,
        matchingModes: ["drag", "tap-source-then-target", "keyboard-source-then-target"],
        finalBeforeAfterViewsStackOnMobile: true,
        numberCrossingReducedToLabelledStartEndStatesWhenSpaceRequires: true,
        mathematicsMustNotChangeWithLayout: true,
    },
    accessibilityContract: {
        keyboardReachAllInteractiveControls: true,
        visibleFocusRequired: true,
        selectionNotColourOnly: true,
        fractionsAnnouncedNaturally: true,
        scoredAccessibleDescriptionsExposeVisibleStructureNotInference: true,
        reducedMotionPreservesExactMathematicalStates: true,
        crossedOutOneOverZeroAnnouncedOnlyAfterTeachingAnchor: true,
        touchTargetsMeetProjectStandard: true,
    },
    persistenceContract: {
        contentVersionKey: "fra26-handoff-v1-runtime-copy-1",
        persist: [
            "current stage and item",
            "committed response",
            "attempt count",
            "hint-opened state",
            "support escalation",
            "error-family evidence",
            "answer-lock state",
            "worked-check reveal state",
            "selected guided route",
            "pending fresh confirmation",
            "repair and recovery progress",
        ],
        resumeMustRestoreAudioCaptionCueMathParity: true,
        oldOrPlaceholderFRA26StateRequiresSafeMigrationOrReset: true,
        noDiagnosticOrRetrievalStateAdded: true,
    },
    qa: {
        dataIntegrityChecks: [
            "One question object drives prompt, source values, diagram, expected answer, hint, feedback, accessible description and worked check.",
            "All valid denominators are greater than zero.",
            "Reciprocal answers exactly satisfy the product-one definition.",
            "Core authored positive values stay within 1-20.",
            "Final working cannot render until answerLocked is true.",
            "No spoken line stores a second numerical truth separate from question data.",
        ],
        leakageChecks: [
            "No scored Ryan line states the missing reciprocal before submit.",
            "Teaching labels and solved products clear before scored items.",
            "Hints start closed and never place final numbers into answer fields.",
            "Accessible text does not infer the answer.",
            "No previous worked solution remains beside a new scored item.",
        ],
        routeTests: [
            "Strong guided route skips F1 and retains F2.",
            "Standard guided route shows F1 then F2.",
            "Correct after hint triggers an unused same-family no-hint confirmation.",
            "Repeated reverse, integer, zero, sign and value errors reach their matching repair and fresh check.",
            "M1-M4 lock each answer before the worked check.",
            "3-4/4, 2/4 and 0-1/4 routes behave as authored.",
            "Recovery items are never primary-final replays.",
            "A wrong response never plays a correct outcome line.",
        ],
        visualChecks: [
            "Hook widths and calculations are exactly 25 → 15 → 9/25.",
            "T1 shows 3/5 × 5/3 = 15/15 = 1.",
            "T2 shows 4/7 ↔ 7/4 and 28/28 = 1.",
            "T3 reveals 6/1 before 1/6 and shows 1 as self-reciprocal.",
            "T4 never treats 1/0 as valid.",
            "G1, G2, F1, F2, I1, I2 and M1-M4 use the exact authored values.",
            "Desktop and approximately 390 px mobile layouts are manually inspected.",
        ],
        parityChecks: [
            "Ryan audio, captions and mathematical cues use one utterance ID timeline.",
            "Every cue anchor phrase exists in its utterance.",
            "Pause, replay, skip, resume and refresh preserve matching states.",
            "No orphan caption, ghost highlight or stale animation remains after copy changes.",
        ],
        regression: [
            "FRA01-FRA25 lesson content remains unchanged except for minimal backwards-compatible shared primitive changes required by FRA26.",
            "FRA27+ lesson content remains unchanged.",
            "No Diagnostic layer is added.",
            "No Retrieval, interleaving or spaced-review layer is added.",
            "No parallel lesson engine, TTS system, evidence store or persistence model is created.",
        ],
    },
    conversionNotes: [
        "The user instruction to proceed is treated as approval to create the implementation handoff; the supplied PDF remains the visual/pedagogical reference.",
        "Page 37 of the storyboard gives abbreviated repair leads. The full exact Ryan repair scripts on pages 32-35 are retained in FRA26_RUNTIME_COPY because those pages explicitly label them EXACT RYAN SCRIPT.",
        "The hook did not author separate Ryan correct/incorrect prediction lines. The handoff adds distinct visible UI outcome feedback, then plays the shared exact Ryan reveal; no invented Ryan speech is introduced.",
        "Question prompts, options, hints, visible feedback and post-lock worked checks are learner-facing UI but are never automatically spoken as Ryan.",
        "Core items use coprime values. The evaluator nevertheless accepts exact equivalent reciprocal fractions so future valid non-simplest source values do not become falsely wrong.",
        "The two-item mini-check values are handoff completions because the storyboard specifies the family-selection rule but only gives an example structure. They preserve the approved domain, family balance and freshness requirement.",
        "No learner-facing line is copied from author-only route, QA or pedagogy prose.",
    ],
};
exports.FRA26_CANONICAL_SPEC = exports.FRA26;
function gcdPositive(a, b) {
    let x = Math.abs(Math.trunc(a));
    let y = Math.abs(Math.trunc(b));
    while (y !== 0) {
        const remainder = x % y;
        x = y;
        y = remainder;
    }
    return x;
}
function normalizeFraction(value) {
    if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
        throw new Error("FRA26 fractions must use integer numerators and denominators.");
    }
    if (value.denominator === 0) {
        throw new Error("FRA26 valid fraction data cannot use denominator zero.");
    }
    const sign = value.denominator < 0 ? -1 : 1;
    const numerator = value.numerator * sign;
    const denominator = value.denominator * sign;
    const divisor = gcdPositive(numerator, denominator) || 1;
    return { numerator: numerator / divisor, denominator: denominator / divisor };
}
function areEquivalentFractions(a, b) {
    if (a.denominator === 0 || b.denominator === 0)
        return false;
    return a.numerator * b.denominator === b.numerator * a.denominator;
}
function reciprocalOfSource(source) {
    if (source.kind === "zero_exception" || source.value === 0)
        return null;
    if (source.kind === "integer") {
        return normalizeFraction({ numerator: 1, denominator: source.value });
    }
    if (source.value.numerator === 0 || source.value.denominator === 0)
        return null;
    return normalizeFraction({ numerator: source.value.denominator, denominator: source.value.numerator });
}
function productIsExactlyOne(source, candidate) {
    if (candidate.denominator === 0)
        return false;
    if (source.kind === "zero_exception" || source.value === 0)
        return false;
    const original = source.kind === "integer"
        ? { numerator: source.value, denominator: 1 }
        : source.value;
    if (original.denominator === 0)
        return false;
    return original.numerator * candidate.numerator === original.denominator * candidate.denominator;
}
function acceptsReciprocalAnswer(source, candidate) {
    if (source.kind === "zero_exception" || source.value === 0)
        return false;
    const candidateFraction = typeof candidate === "number"
        ? { numerator: candidate, denominator: 1 }
        : candidate;
    if (!Number.isInteger(candidateFraction.numerator) || !Number.isInteger(candidateFraction.denominator))
        return false;
    if (candidateFraction.denominator === 0)
        return false;
    const expected = reciprocalOfSource(source);
    return expected !== null && areEquivalentFractions(candidateFraction, expected);
}
function classifyFractionResponse(source, candidate) {
    if (candidate.denominator === 0)
        return "zero_has_reciprocal";
    if (source.kind === "zero_exception" || source.value === 0)
        return "zero_has_reciprocal";
    if (acceptsReciprocalAnswer(source, candidate))
        return undefined;
    if (candidate.numerator < 0 || candidate.denominator < 0)
        return "sign_opposite";
    const original = source.kind === "integer"
        ? { numerator: source.value, denominator: 1 }
        : source.value;
    if (source.kind === "integer" && areEquivalentFractions(candidate, original)) {
        return "integer_unchanged";
    }
    if (areEquivalentFractions(candidate, original)) {
        return "reverse_incomplete";
    }
    const originalValues = [Math.abs(original.numerator), Math.abs(original.denominator)].sort((a, b) => a - b);
    const candidateValues = [Math.abs(candidate.numerator), Math.abs(candidate.denominator)].sort((a, b) => a - b);
    if (originalValues[0] !== candidateValues[0] || originalValues[1] !== candidateValues[1]) {
        return "value_changed";
    }
    return "reverse_incomplete";
}
function selectGuidedRoute(evidence) {
    const g1 = evidence.find((record) => record.questionId === "G1");
    const g2 = evidence.find((record) => record.questionId === "G2");
    const clean = [g1, g2].every((record) => Boolean(record)
        && record.firstAttemptCorrect
        && !record.hintOpenedBeforeSubmit
        && !record.supportEscalated
        && !record.errorFamily);
    return clean ? "fast_skip_f1_keep_f2" : "standard_f1_then_f2";
}
function selectPrimaryFinalRoute(params) {
    if (params.correctCount >= 3
        && params.correctCount <= 4
        && params.distinctFamiliesCorrect >= 2
        && !params.repeatedCentralMisconception) {
        return "complete";
    }
    if (params.correctCount === 2)
        return "repair_then_two_item_mini_check";
    return "repair_then_four_item_recovery_final";
}
function validateFRA26CanonicalSpec() {
    const errors = [];
    const runtimeEntries = Object.entries(exports.FRA26_RUNTIME_COPY);
    const uiEntries = Object.entries(exports.FRA26_LEARNER_UI_COPY);
    const questionEntries = Object.entries(exports.FRA26_QUESTIONS);
    const scenes = Object.values(exports.FRA26_TEACHING_SCENES);
    const cues = scenes.flatMap((scene) => scene.timeline);
    for (const [id, utterance] of runtimeEntries) {
        if (!utterance.text.trim())
            errors.push(`${id}: Ryan text is empty.`);
        if (utterance.captionSource !== "same_as_audio")
            errors.push(`${id}: caption source is not same_as_audio.`);
        if (utterance.audience !== "learner" || utterance.spokenBy !== "Ryan")
            errors.push(`${id}: runtime utterance audience/speaker is invalid.`);
        const forbidden = ["authorOnly", "assessment intent", "route label", "quality gate", "implementation prompt", "QA prose"];
        for (const phrase of forbidden) {
            if (utterance.text.toLowerCase().includes(phrase.toLowerCase())) {
                errors.push(`${id}: authoring/QA phrase leaked into Ryan text: ${phrase}.`);
            }
        }
    }
    for (const [id, copy] of uiEntries) {
        if (!copy.text.trim())
            errors.push(`${id}: learner UI text is empty.`);
        if (copy.speechPolicy !== "never_automatic_ryan")
            errors.push(`${id}: UI copy may be automatically voiced as Ryan.`);
    }
    for (const cue of cues) {
        const utterance = exports.FRA26_RUNTIME_COPY[cue.utteranceId];
        if (!utterance) {
            errors.push(`${cue.id}: missing utterance ${String(cue.utteranceId)}.`);
            continue;
        }
        if (!utterance.text.includes(cue.anchorText)) {
            errors.push(`${cue.id}: anchor text is not an exact substring of ${String(cue.utteranceId)}.`);
        }
        if (!cue.mustNotOccurBeforeAnchor)
            errors.push(`${cue.id}: cue may occur before its speech anchor.`);
    }
    const questionIds = new Set();
    for (const [key, question] of questionEntries) {
        if (questionIds.has(question.id))
            errors.push(`${question.id}: duplicate question ID.`);
        questionIds.add(question.id);
        if (key !== question.id)
            errors.push(`${key}: object key and question.id differ.`);
        if (question.policy.supportedSuccessCountsAsMastery !== false)
            errors.push(`${key}: supported success may count as mastery.`);
        const answer = question.answer;
        if (answer.exact) {
            if (answer.exact.denominator === 0)
                errors.push(`${key}: valid answer denominator is zero.`);
            if (answer.source && !acceptsReciprocalAnswer(answer.source, answer.exact)) {
                errors.push(`${key}: exact answer does not satisfy reciprocal product one.`);
            }
        }
        if (answer.reciprocal && answer.reciprocal.denominator === 0) {
            errors.push(`${key}: repair reciprocal denominator is zero.`);
        }
        if (["final", "recovery", "confirmation"].includes(question.stage) && question.policy.hintPolicy === "none") {
            if (question.policy.solutionPolicy !== "after_locked_submit") {
                errors.push(`${key}: unsupported item does not use after_locked_submit.`);
            }
            if (!question.policy.answerLocksOnSubmit) {
                errors.push(`${key}: unsupported item does not lock the answer.`);
            }
        }
        if (question.stage === "final" && !question.workedCheck) {
            errors.push(`${key}: final item has no post-lock worked check.`);
        }
        if (question.workedCheck && !question.workedCheck.revealOnlyWhenAnswerLocked) {
            errors.push(`${key}: worked check may reveal before answer lock.`);
        }
    }
    if (selectGuidedRoute([
        { questionId: "G1", firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false },
        { questionId: "G2", firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false },
    ]) !== "fast_skip_f1_keep_f2") {
        errors.push("Strong guided route does not skip F1 while retaining F2.");
    }
    if (selectGuidedRoute([
        { questionId: "G1", firstAttemptCorrect: true, hintOpenedBeforeSubmit: false, supportEscalated: false },
        { questionId: "G2", firstAttemptCorrect: false, hintOpenedBeforeSubmit: false, supportEscalated: true, errorFamily: "integer_unchanged" },
    ]) !== "standard_f1_then_f2") {
        errors.push("Standard guided route is not selected after supported/missed evidence.");
    }
    if (25 * 3 / 5 !== 15 || 15 * 3 / 5 !== 9 || 15 * 5 / 3 !== 25) {
        errors.push("Hook arithmetic is inconsistent.");
    }
    if (!productIsExactlyOne({ kind: "fraction", value: { numerator: 3, denominator: 5 } }, { numerator: 5, denominator: 3 })) {
        errors.push("Hook reciprocal pair does not multiply to one.");
    }
    const finalPairs = [
        ["M1.CORRECT", "M1.INCORRECT"],
        ["M2.CORRECT", "M2.INCORRECT"],
        ["M3.CORRECT", "M3.INCORRECT"],
        ["M4.CORRECT", "M4.INCORRECT"],
    ];
    for (const [correctId, incorrectId] of finalPairs) {
        if (exports.FRA26_RUNTIME_COPY[correctId].text === exports.FRA26_RUNTIME_COPY[incorrectId].text) {
            errors.push(`${correctId}/${incorrectId}: correct and incorrect outcomes are identical.`);
        }
    }
    if (exports.FRA26.routing.guidedDecision.strongRoute.includes("show F1")) {
        errors.push("Strong route incorrectly contains F1.");
    }
    if (!exports.FRA26.routing.guidedDecision.strongRoute.includes("show F2")) {
        errors.push("Strong route incorrectly removes F2.");
    }
    const valueBoundsToCheck = [
        25, 15, 9,
        3, 5, 4, 7, 6, 1,
        2, 7, 8, 5, 9, 4, 11, 7, 6, 13, 5,
        8, 3, 11, 12, 7, 12, 15, 9, 4,
        8, 13, 12, 2, 11, 3, 14, 17, 11, 6, 5, 14, 18, 7, 3,
    ];
    for (const value of valueBoundsToCheck.filter((v) => v !== 25)) {
        if (value < 1 || value > 20)
            errors.push(`Authored pilot value ${value} is outside 1-20.`);
    }
    const result = {
        ok: errors.length === 0,
        errors,
        checkedRuntimeUtterances: runtimeEntries.length,
        checkedUiStrings: uiEntries.length,
        checkedQuestions: questionEntries.length,
        checkedTimelineCues: cues.length,
    };
    if (!result.ok) {
        throw new Error(`FRA26 canonical validation failed:\n${errors.join("\n")}`);
    }
    return result;
}

  window.RevilyFra26Approved = Object.freeze(exports);
})();
