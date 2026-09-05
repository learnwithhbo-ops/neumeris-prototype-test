(function () {
  "use strict";
  const module = { exports: {} };
  const exports = module.exports;
"use strict";
/**
 * FRA28_CANONICAL_SPEC.ts — owner-approved implementation handoff v1
 *
 * FRA-28 — Divide by a Fraction
 *
 * This architecture-neutral specification converts the approved storyboard
 * into implementation-ready lesson data while maintaining a hard boundary
 * between:
 *   1. exact learner-facing Ryan runtime copy;
 *   2. visible learner UI that is not automatically voiced;
 *   3. author-only pedagogy, routing, animation and QA directions.
 *
 * HARD RUNTIME-COPY RULE
 * Ryan audio and Ryan captions may resolve only from
 * FRA28_RUNTIME_COPY[utteranceId].text. No other prose in this file, the PDF,
 * implementation prompt, repository or generated UI may be sent to Ryan TTS
 * or used as a Ryan caption unless it is first added to that registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRA28 = exports.FRA28_SYNC_CUES = exports.FRA28_RUNTIME_COPY = void 0;
exports.normaliseFraction = normaliseFraction;
exports.equivalentFractions = equivalentFractions;
exports.quotientOf = quotientOf;
exports.chooseFRA28GuidedRoute = chooseFRA28GuidedRoute;
exports.confirmationAfterHint = confirmationAfterHint;
exports.decideFRA28FinalRoute = decideFRA28FinalRoute;
exports.selectFRA28RecoveryItems = selectFRA28RecoveryItems;
exports.validateFRA28CanonicalSpec = validateFRA28CanonicalSpec;
exports.FRA28_RUNTIME_COPY = {
    "HOOK.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "hook",
        "communicationGoal": "name_light_strip_dividend",
        "text": "This light strip is three quarters of a metre long.",
        "captionSource": "same_as_audio"
    },
    "HOOK.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "hook",
        "communicationGoal": "name_test_section_divisor",
        "text": "Each test section is one eighth of a metre.",
        "captionSource": "same_as_audio"
    },
    "HOOK.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "ask_measurement_division_question",
        "text": "How many one-eighth-metre sections fit into the strip?",
        "captionSource": "same_as_audio"
    },
    "HOOK.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "count_repeated_divisor_units",
        "text": "Watch the measure repeat: one, two, three, four, five, six.",
        "captionSource": "same_as_audio"
    },
    "HOOK.5": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "challenge_division_always_makes_smaller",
        "text": "Three quarters is less than one metre, but the answer is six. Dividing by a small fraction can make the result bigger.",
        "captionSource": "same_as_audio"
    },
    "T1.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "define_division_as_measurement",
        "text": "Division is asking how many groups of the divisor fit into the dividend.",
        "captionSource": "same_as_audio"
    },
    "T1.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "identify_dividend_and_divisor_in_context",
        "text": "Here, the dividend is three quarters of a metre. The divisor is one eighth of a metre - the size of one section.",
        "captionSource": "same_as_audio"
    },
    "T1.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "repeat_divisor_unit_across_dividend",
        "text": "Step the one-eighth measure across the strip: one, two, three, four, five, six.",
        "captionSource": "same_as_audio"
    },
    "T1.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_measurement_quotient",
        "text": "So three quarters divided by one eighth equals six.",
        "captionSource": "same_as_audio"
    },
    "T1.5": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "connect_unit_fraction_division_to_reciprocal_multiplication",
        "text": "The reciprocal of one eighth is eight over one. Multiplying by eight counts those one-eighth units.",
        "captionSource": "same_as_audio"
    },
    "T2.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "move_from_unit_to_non_unit_divisor",
        "text": "A divisor can be more than one small part.",
        "captionSource": "same_as_audio"
    },
    "T2.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "express_dividend_in_common_small_units_for_model_only",
        "text": "Five sixths is the same length as ten twelfths. Each group here is five twelfths.",
        "captionSource": "same_as_audio"
    },
    "T2.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "bundle_small_units_into_divisor_sized_groups",
        "text": "One group uses five twelfths. A second group uses the other five. Two groups fit.",
        "captionSource": "same_as_audio"
    },
    "T2.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "form_divisor_reciprocal",
        "text": "Five twelfths becomes twelve fifths.",
        "captionSource": "same_as_audio"
    },
    "T2.5": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "interpret_reciprocal_factors",
        "text": "Multiplying by twelve counts twelfths; dividing by five bundles them into groups of five.",
        "captionSource": "same_as_audio"
    },
    "T2.6": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_non_unit_divisor_quotient",
        "text": "So five sixths divided by five twelfths equals two.",
        "captionSource": "same_as_audio"
    },
    "T3.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "move_from_model_to_symbolic_structure",
        "text": "Now take away the measuring grid and keep the same structure.",
        "captionSource": "same_as_audio"
    },
    "T3.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "keep_dividend_unchanged",
        "text": "The amount being divided stays two thirds.",
        "captionSource": "same_as_audio"
    },
    "T3.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "change_division_to_multiplication",
        "text": "The division sign changes to multiplication.",
        "captionSource": "same_as_audio"
    },
    "T3.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "replace_divisor_with_reciprocal",
        "text": "The divisor, four fifths, is replaced by its reciprocal, five fourths.",
        "captionSource": "same_as_audio"
    },
    "T3.5": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "state_operand_selection_rule",
        "text": "Only the divisor turns over.",
        "captionSource": "same_as_audio"
    },
    "T3.6": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "multiply_and_simplify_exactly",
        "text": "Two thirds times five fourths is ten twelfths, which equals five sixths.",
        "captionSource": "same_as_audio"
    },
    "T3.7": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "sense_check_result_below_one",
        "text": "That answer is below one because two thirds is smaller than one full four-fifths group.",
        "captionSource": "same_as_audio"
    },
    "T4.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "introduce_integer_dividend",
        "text": "An integer can be the dividend too.",
        "captionSource": "same_as_audio"
    },
    "T4.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "interpret_integer_divided_by_fraction_as_measurement",
        "text": "Three divided by two fifths asks how many two-fifths groups fit into three.",
        "captionSource": "same_as_audio"
    },
    "T4.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "write_integer_as_fraction_and_keep_it",
        "text": "Write three as three over one. Keep it.",
        "captionSource": "same_as_audio"
    },
    "T4.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "replace_fraction_divisor_with_reciprocal",
        "text": "Replace two fifths with its reciprocal, five halves.",
        "captionSource": "same_as_audio"
    },
    "T4.5": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "multiply_integer_fraction_by_reciprocal",
        "text": "Three over one times five halves is fifteen halves.",
        "captionSource": "same_as_audio"
    },
    "T4.6": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "sense_check_result_above_dividend",
        "text": "Since each group is smaller than one, a result larger than three makes sense.",
        "captionSource": "same_as_audio"
    },
    "T4.7": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "boundary",
        "communicationGoal": "keep_exact_improper_fraction_form",
        "text": "That is an exact fraction. We leave it in fraction form here.",
        "captionSource": "same_as_audio"
    },
    "HANDOFF.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "summarise_concept_before_practice",
        "text": "You've seen why the divisor's reciprocal counts the groups.",
        "captionSource": "same_as_audio"
    },
    "HANDOFF.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "hand_control_to_learner",
        "text": "I'll stay with you for two questions. Then I'll start taking the support away.",
        "captionSource": "same_as_audio"
    },
    "G1.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "prompt_guided_measurement_count",
        "text": "Use the one-sixth measure. How many copies fit?",
        "captionSource": "same_as_audio"
    },
    "G1.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_guided_measurement_interpretation",
        "text": "Yes. Five one-sixth units fit, so five sixths divided by one sixth is five.",
        "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.FULL_METRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "distinguish_strip_from_full_metre",
        "text": "The full metre has six sixths, but this strip stops at five sixths.",
        "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.GROUP_SIZE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "distinguish_group_size_from_group_count",
        "text": "One sixth is the group size. Count how many of those groups fit.",
        "captionSource": "same_as_audio"
    },
    "G2.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "identify_divisor_and_use_its_reciprocal",
        "text": "Find the divisor first. Replace only that fraction with its reciprocal.",
        "captionSource": "same_as_audio"
    },
    "G2.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_divisor_only_reciprocal",
        "text": "Exactly. The divisor two thirds becomes three halves, while four fifths stays.",
        "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.DIVIDEND": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "stop_flipping_dividend",
        "text": "You turned the dividend. Keep four fifths.",
        "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.UNCHANGED": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "require_reciprocal_of_divisor",
        "text": "That leaves the divisor unchanged. Use its reciprocal.",
        "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.ARITHMETIC": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "separate_method_from_arithmetic_slip",
        "text": "Your rewrite is right. Recheck the fraction multiplication.",
        "captionSource": "same_as_audio"
    },
    "F1.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "invite_faded_rewrite_with_optional_hint",
        "text": "Complete the rewrite, then calculate. The hint is there only if you need it.",
        "captionSource": "same_as_audio"
    },
    "F2.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "choose_correct_operand_transformation",
        "text": "Choose the line that keeps the amount and changes only the divisor.",
        "captionSource": "same_as_audio"
    },
    "I1.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "set_independent_integer_dividend_task",
        "text": "This one is yours. Give an exact fraction.",
        "captionSource": "same_as_audio"
    },
    "I2.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "set_independent_context_translation_task",
        "text": "Read the context, decide what is being divided by what, then calculate.",
        "captionSource": "same_as_audio"
    },
    "FINAL.INTRO": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "introduce_unsupported_final_check",
        "text": "These last five are yours. No hints this time. Do the question first, then I'll show you the working so you can check your thinking.",
        "captionSource": "same_as_audio"
    },
    "M1.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_integer_divisor_reciprocal",
        "text": "Right. The divisor's reciprocal is five fourths.",
        "captionSource": "same_as_audio"
    },
    "M2.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_below_one_magnitude",
        "text": "Yes. A result below one fits the size comparison.",
        "captionSource": "same_as_audio"
    },
    "M3.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_missing_reciprocal",
        "text": "Right. You used fifteen fourteenths, the reciprocal of the divisor.",
        "captionSource": "same_as_audio"
    },
    "M4.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_only_divisor_changes",
        "text": "Exactly. Only the divisor is replaced by its reciprocal.",
        "captionSource": "same_as_audio"
    },
    "M5.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_context_measurement_count",
        "text": "Yes. Four equal section-lengths fit.",
        "captionSource": "same_as_audio"
    },
    "R-DIVIDEND.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "reidentify_dividend_as_amount",
        "text": "The first fraction is the amount you have. Leave it unchanged.",
        "captionSource": "same_as_audio"
    },
    "R-DIVIDEND.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "reidentify_divisor_as_group_size",
        "text": "The second fraction is the divisor - the size of each group. That is the one replaced by its reciprocal.",
        "captionSource": "same_as_audio"
    },
    "R-DIVIDEND.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "model_keep_first_replace_second",
        "text": "Four sevenths stays four sevenths. Two thirds becomes three halves.",
        "captionSource": "same_as_audio"
    },
    "R-DIVIDEND.INTERACTION": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "redirect_reciprocal_arrow_to_divisor",
        "text": "That is the amount, not the divisor.",
        "captionSource": "same_as_audio"
    },
    "R-BOTH.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "name_both_flip_error_without_praise",
        "text": "You used the reciprocal idea, but you applied it to both fractions.",
        "captionSource": "same_as_audio"
    },
    "R-BOTH.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "explain_why_both_flip_changes_problem",
        "text": "Turning both changes the amount and the group size.",
        "captionSource": "same_as_audio"
    },
    "R-BOTH.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "model_divisor_only_reciprocal",
        "text": "Keep three fifths. Replace only two sevenths with seven halves.",
        "captionSource": "same_as_audio"
    },
    "R-UNCHANGED.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "contrast_division_with_multiplying_by_same_divisor",
        "text": "Multiplying by the divisor unchanged answers a different question.",
        "captionSource": "same_as_audio"
    },
    "R-UNCHANGED.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "show_unchanged_divisor_product_does_not_count_groups",
        "text": "Three quarters times one eighth makes a tiny part. It does not count how many one-eighth groups fit.",
        "captionSource": "same_as_audio"
    },
    "R-UNCHANGED.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "use_reciprocal_to_count_unit_groups",
        "text": "Use eight over one. That turns one-eighth-sized groups into units.",
        "captionSource": "same_as_audio"
    },
    "R-SEPARATE.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "reject_separate_numerator_denominator_division",
        "text": "The numerator and denominator are not two separate whole-number division questions.",
        "captionSource": "same_as_audio"
    },
    "R-SEPARATE.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "treat_each_fraction_as_one_value",
        "text": "The fraction is one value, and the divisor is one value.",
        "captionSource": "same_as_audio"
    },
    "R-SEPARATE.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "replace_whole_divisor_then_multiply",
        "text": "Replace the whole divisor four fifths with five fourths, then multiply: two thirds times five fourths equals five sixths.",
        "captionSource": "same_as_audio"
    },
    "R-POSSIBLE.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "reject_impossible_claim_for_smaller_dividend",
        "text": "Smaller divided by larger is not impossible.",
        "captionSource": "same_as_audio"
    },
    "R-POSSIBLE.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "interpret_quotient_as_part_of_one_group",
        "text": "It means the amount contains less than one full group.",
        "captionSource": "same_as_audio"
    },
    "R-POSSIBLE.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "state_supported_below_one_example",
        "text": "Two thirds is four fifths of a five-sixths group, so the quotient is four fifths.",
        "captionSource": "same_as_audio"
    },
    "R-RECIPROCAL.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "refresh_reciprocal_form",
        "text": "A reciprocal swaps numerator and denominator.",
        "captionSource": "same_as_audio"
    },
    "COMPLETE.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "completion",
        "communicationGoal": "complete_lesson_and_state_scope",
        "text": "Nice work. You can divide an integer or a fraction by a positive fraction, and you know why only the divisor uses its reciprocal. That's FRA-28 done.",
        "captionSource": "same_as_audio"
    }
};
exports.FRA28_SYNC_CUES = [
    {
        "id": "HOOK.C1",
        "sceneId": "HOOK",
        "utteranceId": "HOOK.1",
        "anchorText": "three quarters of a metre",
        "authorOnlyAction": "Render a simple light strip with exactly 6 of 8 equal eighths active.",
        "target": "hook.lightStrip",
        "reducedMotionEquivalent": "Reveal the complete 6-of-8 state without movement."
    },
    {
        "id": "HOOK.C2",
        "sceneId": "HOOK",
        "utteranceId": "HOOK.2",
        "anchorText": "one eighth of a metre",
        "authorOnlyAction": "Reveal one amber 1/8-metre measure tile below the strip.",
        "target": "hook.measureTile",
        "reducedMotionEquivalent": "Crossfade the tile into place."
    },
    {
        "id": "HOOK.C3",
        "sceneId": "HOOK",
        "utteranceId": "HOOK.3",
        "anchorText": "fit into the strip",
        "authorOnlyAction": "Reveal the optional non-scored prediction choices.",
        "target": "hook.predictionChoices",
        "reducedMotionEquivalent": "Reveal choices immediately."
    },
    {
        "id": "HOOK.C4",
        "sceneId": "HOOK",
        "utteranceId": "HOOK.4",
        "anchorText": "one, two, three, four, five, six",
        "authorOnlyAction": "Move the measure tile across six equal eighths, one step per spoken count.",
        "target": "hook.measureSequence",
        "reducedMotionEquivalent": "Reveal six numbered positions in order with no travel animation.",
        "params": {
            "steps": 6
        }
    },
    {
        "id": "HOOK.C5",
        "sceneId": "HOOK",
        "utteranceId": "HOOK.5",
        "anchorText": "answer is six",
        "authorOnlyAction": "Reveal 3/4 ÷ 1/8 = 6 and six group brackets.",
        "target": "hook.equationResult",
        "reducedMotionEquivalent": "Reveal the final equation and brackets together."
    },
    {
        "id": "T1.C1",
        "sceneId": "T1",
        "utteranceId": "T1.1",
        "anchorText": "groups of the divisor fit into the dividend",
        "authorOnlyAction": "Show DIVIDEND and DIVISOR labels as empty anchors beside the model.",
        "target": "t1.roleLabels",
        "reducedMotionEquivalent": "Reveal both label anchors."
    },
    {
        "id": "T1.C2",
        "sceneId": "T1",
        "utteranceId": "T1.2",
        "anchorText": "dividend is three quarters",
        "authorOnlyAction": "Connect DIVIDEND to the full active 3/4 strip.",
        "target": "t1.dividendLabel",
        "reducedMotionEquivalent": "Reveal connector and label."
    },
    {
        "id": "T1.C3",
        "sceneId": "T1",
        "utteranceId": "T1.2",
        "anchorText": "divisor is one eighth",
        "authorOnlyAction": "Connect DIVISOR to the single 1/8 measure tile.",
        "target": "t1.divisorLabel",
        "reducedMotionEquivalent": "Reveal connector and label."
    },
    {
        "id": "T1.C4",
        "sceneId": "T1",
        "utteranceId": "T1.3",
        "anchorText": "one, two, three, four, five, six",
        "authorOnlyAction": "Step the 1/8 tile across all six active sections.",
        "target": "t1.measureSequence",
        "reducedMotionEquivalent": "Reveal six fixed positions in order.",
        "params": {
            "steps": 6
        }
    },
    {
        "id": "T1.C5",
        "sceneId": "T1",
        "utteranceId": "T1.4",
        "anchorText": "equals six",
        "authorOnlyAction": "Reveal the quotient 6 after the sixth measure lands.",
        "target": "t1.quotient",
        "reducedMotionEquivalent": "Reveal 6 immediately after the full sequence."
    },
    {
        "id": "T1.C6",
        "sceneId": "T1",
        "utteranceId": "T1.5",
        "anchorText": "eight over one",
        "authorOnlyAction": "Crossfade the divisor card 1/8 to its reciprocal 8/1.",
        "target": "t1.reciprocalCard",
        "reducedMotionEquivalent": "Crossfade with no spin."
    },
    {
        "id": "T1.C7",
        "sceneId": "T1",
        "utteranceId": "T1.5",
        "anchorText": "counts those one-eighth units",
        "authorOnlyAction": "Reveal 3/4 × 8/1 = 6 below the measurement equation.",
        "target": "t1.reciprocalEquation",
        "reducedMotionEquivalent": "Reveal the complete multiplication line."
    },
    {
        "id": "T2.C1",
        "sceneId": "T2",
        "utteranceId": "T2.1",
        "anchorText": "more than one small part",
        "authorOnlyAction": "Reveal a divisor bracket spanning five twelfths.",
        "target": "t2.divisorGroup",
        "reducedMotionEquivalent": "Reveal the bracket in its final position."
    },
    {
        "id": "T2.C2",
        "sceneId": "T2",
        "utteranceId": "T2.2",
        "anchorText": "ten twelfths",
        "authorOnlyAction": "Partition the 5/6 amount into exactly 10 of 12 equal twelfths.",
        "target": "t2.twelfthsModel",
        "reducedMotionEquivalent": "Replace the sixths view with the final twelfths view."
    },
    {
        "id": "T2.C3",
        "sceneId": "T2",
        "utteranceId": "T2.3",
        "anchorText": "One group uses five twelfths",
        "authorOnlyAction": "Bracket the first five active twelfths as group one.",
        "target": "t2.groupOne",
        "reducedMotionEquivalent": "Reveal group-one bracket."
    },
    {
        "id": "T2.C4",
        "sceneId": "T2",
        "utteranceId": "T2.3",
        "anchorText": "A second group uses the other five",
        "authorOnlyAction": "Bracket the next five active twelfths as group two.",
        "target": "t2.groupTwo",
        "reducedMotionEquivalent": "Reveal group-two bracket."
    },
    {
        "id": "T2.C5",
        "sceneId": "T2",
        "utteranceId": "T2.4",
        "anchorText": "twelve fifths",
        "authorOnlyAction": "Replace the divisor 5/12 with reciprocal 12/5.",
        "target": "t2.reciprocal",
        "reducedMotionEquivalent": "Crossfade 5/12 to 12/5."
    },
    {
        "id": "T2.C6",
        "sceneId": "T2",
        "utteranceId": "T2.5",
        "anchorText": "Multiplying by twelve counts twelfths",
        "authorOnlyAction": "Highlight the ×12 part of the reciprocal.",
        "target": "t2.multiplyTwelve",
        "reducedMotionEquivalent": "Reveal the ×12 explanation card."
    },
    {
        "id": "T2.C7",
        "sceneId": "T2",
        "utteranceId": "T2.5",
        "anchorText": "dividing by five bundles them",
        "authorOnlyAction": "Highlight the ÷5 part and the two five-twelfth brackets.",
        "target": "t2.divideFive",
        "reducedMotionEquivalent": "Reveal the ÷5 explanation card and brackets."
    },
    {
        "id": "T2.C8",
        "sceneId": "T2",
        "utteranceId": "T2.6",
        "anchorText": "equals two",
        "authorOnlyAction": "Reveal the quotient 2.",
        "target": "t2.quotient",
        "reducedMotionEquivalent": "Reveal 2."
    },
    {
        "id": "T3.C1",
        "sceneId": "T3",
        "utteranceId": "T3.1",
        "anchorText": "take away the measuring grid",
        "authorOnlyAction": "Remove the grid while retaining the symbolic division.",
        "target": "t3.grid",
        "reducedMotionEquivalent": "Swap directly to the symbolic view."
    },
    {
        "id": "T3.C2",
        "sceneId": "T3",
        "utteranceId": "T3.2",
        "anchorText": "stays two thirds",
        "authorOnlyAction": "Apply a brief lock badge to 2/3.",
        "target": "t3.dividend",
        "reducedMotionEquivalent": "Reveal a static lock badge."
    },
    {
        "id": "T3.C3",
        "sceneId": "T3",
        "utteranceId": "T3.3",
        "anchorText": "changes to multiplication",
        "authorOnlyAction": "Crossfade ÷ to ×.",
        "target": "t3.operation",
        "reducedMotionEquivalent": "Replace the glyph without motion."
    },
    {
        "id": "T3.C4",
        "sceneId": "T3",
        "utteranceId": "T3.4",
        "anchorText": "five fourths",
        "authorOnlyAction": "Swap the numerator and denominator of the divisor only.",
        "target": "t3.divisor",
        "reducedMotionEquivalent": "Crossfade 4/5 to 5/4 without spinning."
    },
    {
        "id": "T3.C5",
        "sceneId": "T3",
        "utteranceId": "T3.5",
        "anchorText": "Only the divisor",
        "authorOnlyAction": "Highlight the unchanged dividend and changed divisor simultaneously.",
        "target": "t3.operandContrast",
        "reducedMotionEquivalent": "Apply static outlines."
    },
    {
        "id": "T3.C6",
        "sceneId": "T3",
        "utteranceId": "T3.6",
        "anchorText": "ten twelfths",
        "authorOnlyAction": "Reveal the raw product 10/12.",
        "target": "t3.rawProduct",
        "reducedMotionEquivalent": "Reveal 10/12."
    },
    {
        "id": "T3.C7",
        "sceneId": "T3",
        "utteranceId": "T3.6",
        "anchorText": "five sixths",
        "authorOnlyAction": "Reveal exact equivalent 5/6 after 10/12.",
        "target": "t3.simplifiedProduct",
        "reducedMotionEquivalent": "Reveal 5/6 after 10/12."
    },
    {
        "id": "T3.C8",
        "sceneId": "T3",
        "utteranceId": "T3.7",
        "anchorText": "below one",
        "authorOnlyAction": "Place the result on a simple 0-to-1 magnitude strip below 1.",
        "target": "t3.magnitude",
        "reducedMotionEquivalent": "Reveal the final position."
    },
    {
        "id": "T4.C1",
        "sceneId": "T4",
        "utteranceId": "T4.1",
        "anchorText": "integer can be the dividend",
        "authorOnlyAction": "Reveal 3 ÷ 2/5.",
        "target": "t4.expression",
        "reducedMotionEquivalent": "Reveal the expression."
    },
    {
        "id": "T4.C2",
        "sceneId": "T4",
        "utteranceId": "T4.3",
        "anchorText": "three over one",
        "authorOnlyAction": "Rewrite 3 as 3/1 and lock it.",
        "target": "t4.integerAsFraction",
        "reducedMotionEquivalent": "Reveal 3/1 with a static lock."
    },
    {
        "id": "T4.C3",
        "sceneId": "T4",
        "utteranceId": "T4.4",
        "anchorText": "five halves",
        "authorOnlyAction": "Crossfade 2/5 to 5/2.",
        "target": "t4.reciprocal",
        "reducedMotionEquivalent": "Crossfade without rotation."
    },
    {
        "id": "T4.C4",
        "sceneId": "T4",
        "utteranceId": "T4.5",
        "anchorText": "fifteen halves",
        "authorOnlyAction": "Reveal 3/1 × 5/2 = 15/2.",
        "target": "t4.product",
        "reducedMotionEquivalent": "Reveal the full product line."
    },
    {
        "id": "T4.C5",
        "sceneId": "T4",
        "utteranceId": "T4.6",
        "anchorText": "larger than three",
        "authorOnlyAction": "Show a restrained more-than-three magnitude marker.",
        "target": "t4.magnitude",
        "reducedMotionEquivalent": "Reveal the marker."
    },
    {
        "id": "T4.C6",
        "sceneId": "T4",
        "utteranceId": "T4.7",
        "anchorText": "leave it in fraction form",
        "authorOnlyAction": "Keep 15/2 visible; do not convert it.",
        "target": "t4.exactForm",
        "reducedMotionEquivalent": "Keep the same final state."
    },
    {
        "id": "HANDOFF.C1",
        "sceneId": "HANDOFF",
        "utteranceId": "HANDOFF.2",
        "anchorText": "stay with you for two questions",
        "authorOnlyAction": "Change stage label from Learn the idea to Try it with me.",
        "target": "lesson.stageLabel",
        "reducedMotionEquivalent": "Replace the stage label."
    },
    {
        "id": "G1.C1",
        "sceneId": "G1",
        "utteranceId": "G1.PRE",
        "anchorText": "one-sixth measure",
        "authorOnlyAction": "Focus the single 1/6 measure tile, not the full metre.",
        "target": "g1.measureTile",
        "reducedMotionEquivalent": "Apply a static focus outline."
    },
    {
        "id": "G1.C2",
        "sceneId": "G1",
        "utteranceId": "G1.INCORRECT.FULL_METRE",
        "anchorText": "strip stops at five sixths",
        "authorOnlyAction": "Outline exactly the five active sixths.",
        "target": "g1.activeStrip",
        "reducedMotionEquivalent": "Reveal a static outline."
    },
    {
        "id": "G1.C3",
        "sceneId": "G1",
        "utteranceId": "G1.INCORRECT.GROUP_SIZE",
        "anchorText": "group size",
        "authorOnlyAction": "Outline the 1/6 tile, then leave the remaining count unsolved.",
        "target": "g1.groupSize",
        "reducedMotionEquivalent": "Reveal a static outline only."
    },
    {
        "id": "G2.C1",
        "sceneId": "G2",
        "utteranceId": "G2.PRE",
        "anchorText": "divisor first",
        "authorOnlyAction": "Highlight 2/3 as the divisor.",
        "target": "g2.divisor",
        "reducedMotionEquivalent": "Apply a static outline."
    },
    {
        "id": "G2.C2",
        "sceneId": "G2",
        "utteranceId": "G2.CORRECT",
        "anchorText": "becomes three halves",
        "authorOnlyAction": "Lock 3/2 as the chosen reciprocal.",
        "target": "g2.reciprocalChoice",
        "reducedMotionEquivalent": "Reveal the selected state."
    },
    {
        "id": "G2.C3",
        "sceneId": "G2",
        "utteranceId": "G2.CORRECT",
        "anchorText": "four fifths stays",
        "authorOnlyAction": "Keep 4/5 fixed with a lock icon.",
        "target": "g2.dividend",
        "reducedMotionEquivalent": "Reveal the lock icon."
    },
    {
        "id": "R-DIVIDEND.C1",
        "sceneId": "R-DIVIDEND",
        "utteranceId": "R-DIVIDEND.1",
        "anchorText": "first fraction is the amount",
        "authorOnlyAction": "Highlight the first fraction as AMOUNT.",
        "target": "repairDividend.amount",
        "reducedMotionEquivalent": "Apply a static labelled outline."
    },
    {
        "id": "R-DIVIDEND.C2",
        "sceneId": "R-DIVIDEND",
        "utteranceId": "R-DIVIDEND.2",
        "anchorText": "second fraction is the divisor",
        "authorOnlyAction": "Highlight the second fraction as GROUP SIZE.",
        "target": "repairDividend.divisor",
        "reducedMotionEquivalent": "Apply a static labelled outline."
    },
    {
        "id": "R-DIVIDEND.C3",
        "sceneId": "R-DIVIDEND",
        "utteranceId": "R-DIVIDEND.3",
        "anchorText": "stays four sevenths",
        "authorOnlyAction": "Show 4/7 unchanged in the correct rewrite.",
        "target": "repairDividend.keepFirst",
        "reducedMotionEquivalent": "Reveal the correct rewrite."
    },
    {
        "id": "R-DIVIDEND.C4",
        "sceneId": "R-DIVIDEND",
        "utteranceId": "R-DIVIDEND.3",
        "anchorText": "becomes three halves",
        "authorOnlyAction": "Crossfade 2/3 to 3/2.",
        "target": "repairDividend.reciprocal",
        "reducedMotionEquivalent": "Crossfade without rotation."
    },
    {
        "id": "R-BOTH.C1",
        "sceneId": "R-BOTH",
        "utteranceId": "R-BOTH.2",
        "anchorText": "changes the amount and the group size",
        "authorOnlyAction": "Contrast the wrong both-flipped line with the correct divisor-only line.",
        "target": "repairBoth.contrast",
        "reducedMotionEquivalent": "Reveal both static lines."
    },
    {
        "id": "R-BOTH.C2",
        "sceneId": "R-BOTH",
        "utteranceId": "R-BOTH.3",
        "anchorText": "Keep three fifths",
        "authorOnlyAction": "Lock 3/5.",
        "target": "repairBoth.dividend",
        "reducedMotionEquivalent": "Reveal a static lock."
    },
    {
        "id": "R-BOTH.C3",
        "sceneId": "R-BOTH",
        "utteranceId": "R-BOTH.3",
        "anchorText": "seven halves",
        "authorOnlyAction": "Replace 2/7 with 7/2.",
        "target": "repairBoth.divisor",
        "reducedMotionEquivalent": "Crossfade 2/7 to 7/2."
    },
    {
        "id": "R-UNCHANGED.C1",
        "sceneId": "R-UNCHANGED",
        "utteranceId": "R-UNCHANGED.2",
        "anchorText": "makes a tiny part",
        "authorOnlyAction": "Reveal the incorrect 3/4 × 1/8 = 3/32 line as a contrast only.",
        "target": "repairUnchanged.wrongLine",
        "reducedMotionEquivalent": "Reveal the static contrast line."
    },
    {
        "id": "R-UNCHANGED.C2",
        "sceneId": "R-UNCHANGED",
        "utteranceId": "R-UNCHANGED.3",
        "anchorText": "eight over one",
        "authorOnlyAction": "Crossfade 1/8 to 8/1.",
        "target": "repairUnchanged.reciprocal",
        "reducedMotionEquivalent": "Crossfade without rotation."
    },
    {
        "id": "R-UNCHANGED.C3",
        "sceneId": "R-UNCHANGED",
        "utteranceId": "R-UNCHANGED.3",
        "anchorText": "into units",
        "authorOnlyAction": "Reveal six 1/8 group brackets and the quotient 6.",
        "target": "repairUnchanged.groups",
        "reducedMotionEquivalent": "Reveal the completed groups."
    },
    {
        "id": "R-SEPARATE.C1",
        "sceneId": "R-SEPARATE",
        "utteranceId": "R-SEPARATE.1",
        "anchorText": "not two separate whole-number division questions",
        "authorOnlyAction": "Fade the unsafe 2 ÷ 4 and 3 ÷ 5 split.",
        "target": "repairSeparate.unsafeSplit",
        "reducedMotionEquivalent": "Reduce emphasis on the unsafe split."
    },
    {
        "id": "R-SEPARATE.C2",
        "sceneId": "R-SEPARATE",
        "utteranceId": "R-SEPARATE.2",
        "anchorText": "one value",
        "authorOnlyAction": "Place a single outline around each whole fraction card.",
        "target": "repairSeparate.wholeCards",
        "reducedMotionEquivalent": "Reveal static outlines."
    },
    {
        "id": "R-SEPARATE.C3",
        "sceneId": "R-SEPARATE",
        "utteranceId": "R-SEPARATE.3",
        "anchorText": "five fourths",
        "authorOnlyAction": "Replace the whole 4/5 card with 5/4.",
        "target": "repairSeparate.reciprocal",
        "reducedMotionEquivalent": "Crossfade the whole card."
    },
    {
        "id": "R-POSSIBLE.C1",
        "sceneId": "R-POSSIBLE",
        "utteranceId": "R-POSSIBLE.2",
        "anchorText": "less than one full group",
        "authorOnlyAction": "Show the 2/3 amount spanning 4/5 of a 5/6 group.",
        "target": "repairPossible.partOfGroup",
        "reducedMotionEquivalent": "Reveal the completed comparison state."
    },
    {
        "id": "R-POSSIBLE.C2",
        "sceneId": "R-POSSIBLE",
        "utteranceId": "R-POSSIBLE.3",
        "anchorText": "quotient is four fifths",
        "authorOnlyAction": "Reveal 4/5 only after the group-fraction comparison is visible.",
        "target": "repairPossible.quotient",
        "reducedMotionEquivalent": "Reveal 4/5."
    },
    {
        "id": "R-RECIPROCAL.C1",
        "sceneId": "R-RECIPROCAL",
        "utteranceId": "R-RECIPROCAL.1",
        "anchorText": "swaps numerator and denominator",
        "authorOnlyAction": "Crossfade a divisor card a/b to b/a.",
        "target": "repairReciprocal.card",
        "reducedMotionEquivalent": "Crossfade the two states."
    }
];
exports.FRA28 = {
    "id": "FRA28",
    "displayId": "FRA-28",
    "title": "Divide by a Fraction",
    "status": "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
    "contentVersion": "FRA28-HANDOFF-V1",
    "sourceOfTruth": {
        "runtimeCopyQuestionsRoutesOutcomesAndValidation": "FRA28_CANONICAL_SPEC.ts",
        "visualGeometryScreenChoreographyAndPedagogy": "Revily_FRA28_Storyboard_v1.pdf",
        "engineeringIntegrationAndQA": "FRA28_CODEX_IMPLEMENTATION_PROMPT.md",
        "startInstruction": "FRA28_START_CODEX_PROMPT.txt",
        "precedenceRule": "Ryan may speak only FRA28_RUNTIME_COPY[utteranceId].text. The PDF remains the approved visual/pedagogical source, but headings, route labels, authoring prose and QA notes are never Ryan speech or captions.",
        "engineeringReference": "The existing canonical Revily FRA shell, TTS/caption/cue timeline, fraction inputs, exact-equivalence marker, measurement/bar primitives, evidence routing, hints, answer locking, persistence, accessibility and tests."
    },
    "scope": {
        "objective": "Divide a positive integer or fraction by a non-zero positive fraction by multiplying by the divisor’s reciprocal.",
        "studentFacingIdea": "Division asks how many divisor-sized groups fit. Only the divisor uses its reciprocal.",
        "prerequisites": [
            "FRA-24 Multiply Two Fractions",
            "FRA-26 Understand Reciprocals",
            "FRA-27 Divide a Fraction by an Integer",
            "Secure multiplication and division facts"
        ],
        "teaches": [
            "integer divided by a positive fraction",
            "fraction divided by a positive fraction",
            "measurement/grouping meaning of division by a fraction",
            "keep the dividend unchanged",
            "replace only the divisor with its reciprocal",
            "multiply exactly",
            "accept proper, improper or integer positive quotients",
            "sense-check whether a quotient should be below or above 1"
        ],
        "deliberatelyLaterOrExcluded": [
            "FRA-C04 divide mixed numbers",
            "FRA-C06 mixed and multi-step fraction problems",
            "negative fractions or signed answers",
            "zero as a divisor",
            "decimal approximation or recurring decimals",
            "cross-cancellation as the lesson target",
            "automatic mixed-number conversion",
            "hidden simplest-form requirements",
            "global Diagnostic placement",
            "Retrieval or spaced-review scheduling"
        ],
        "numericalEnvelope": {
            "sourceValueMin": 1,
            "sourceValueTypicalMax": 12,
            "laterValueMax": 20,
            "positiveValuesOnly": true,
            "nonZeroPositiveDivisor": true,
            "exactAnswersOnly": true,
            "acceptEquivalentFractions": true,
            "requireSimplestFormOnlyWhenExplicit": true
        }
    },
    "mentalModel": [
        "Read the division: identify the amount and the size of one group.",
        "Locate the divisor: it is the second quantity and the group size.",
        "Keep the dividend and replace only the divisor with its reciprocal.",
        "Multiply exactly and sense-check the magnitude."
    ],
    "scenes": [
        {
            "id": "HOOK",
            "purpose": "Create the measurement need and challenge division-always-makes-smaller.",
            "utteranceIds": [
                "HOOK.1",
                "HOOK.2",
                "HOOK.3",
                "HOOK.4",
                "HOOK.5"
            ],
            "studentFacing": {
                "stageLabel": "Learn the idea",
                "title": "How many test sections fit?",
                "predictionOptions": [
                    "fewer than 3",
                    "3 to 5",
                    "more than 5"
                ],
                "predictionIsScored": false,
                "buttons": [
                    "I see it",
                    "Show again"
                ]
            },
            "authorOnly": {
                "visual": "3/4-metre light strip rendered as exactly 6 active eighths of an 8-part metre; one 1/8-metre measure tile; six measurement brackets after reveal.",
                "masteryEvidence": false
            }
        },
        {
            "id": "T1",
            "purpose": "Define dividend, divisor and measurement division; connect unit-fraction division to reciprocal multiplication.",
            "utteranceIds": [
                "T1.1",
                "T1.2",
                "T1.3",
                "T1.4",
                "T1.5"
            ],
            "studentFacing": {
                "stageLabel": "Learn the idea",
                "title": "How many one-eighth groups fit?"
            },
            "authorOnly": {
                "visual": "Reuse the exact light-strip geometry; labels appear only when spoken; reciprocal card appears only on “reciprocal”."
            }
        },
        {
            "id": "T2",
            "purpose": "Explain a non-unit divisor as count small units then bundle them.",
            "utteranceIds": [
                "T2.1",
                "T2.2",
                "T2.3",
                "T2.4",
                "T2.5",
                "T2.6"
            ],
            "studentFacing": {
                "stageLabel": "Learn the idea",
                "title": "How many 5/12 groups fit?"
            },
            "authorOnly": {
                "visual": "Represent 5/6 as 10 of 12 active twelfths with two non-overlapping 5/12 brackets. This visual is explanatory only and must not turn the lesson into equivalence/common-denominator instruction."
            }
        },
        {
            "id": "T3",
            "purpose": "Generalise the symbolic method: keep dividend, change operation, replace divisor with reciprocal.",
            "utteranceIds": [
                "T3.1",
                "T3.2",
                "T3.3",
                "T3.4",
                "T3.5",
                "T3.6",
                "T3.7"
            ],
            "studentFacing": {
                "stageLabel": "Learn the idea",
                "title": "Only the divisor uses its reciprocal"
            },
            "authorOnly": {
                "visual": "2/3 ÷ 4/5 transforms to 2/3 × 5/4; 2/3 receives a lock badge; no decorative spin."
            }
        },
        {
            "id": "T4",
            "purpose": "Transfer to an integer dividend and preserve exact improper fraction form.",
            "utteranceIds": [
                "T4.1",
                "T4.2",
                "T4.3",
                "T4.4",
                "T4.5",
                "T4.6",
                "T4.7"
            ],
            "studentFacing": {
                "stageLabel": "Learn the idea",
                "title": "An integer can be the amount"
            },
            "authorOnly": {
                "visual": "3 ÷ 2/5 -> 3/1 × 5/2 = 15/2. Do not convert to a mixed number."
            }
        },
        {
            "id": "HANDOFF",
            "purpose": "Move from demonstration to learner control.",
            "utteranceIds": [
                "HANDOFF.1",
                "HANDOFF.2"
            ],
            "studentFacing": {
                "stageLabelChange": [
                    "Learn the idea",
                    "Try it with me"
                ]
            },
            "authorOnly": {
                "guidedGate": "G1 and G2 both first-attempt correct with no escalation -> skip F1, keep F2."
            }
        },
        {
            "id": "FINAL-INTRO",
            "purpose": "Introduce five unsupported final items.",
            "utteranceIds": [
                "FINAL.INTRO"
            ],
            "studentFacing": {
                "stageLabel": "Final check"
            },
            "authorOnly": {
                "preSubmit": "No hint, reciprocal, working, answer-revealing narration or group-count bracket."
            }
        },
        {
            "id": "COMPLETE",
            "purpose": "State current-session completion only.",
            "utteranceIds": [
                "COMPLETE.1"
            ],
            "studentFacing": {
                "stageLabel": "Complete"
            },
            "authorOnly": {
                "scope": "No diagnostic placement or retrieval scheduling."
            }
        }
    ],
    "speechLedCues": exports.FRA28_SYNC_CUES,
    "questions": [
        {
            "id": "G1",
            "stage": "guided",
            "assessmentFamily": "measurement_unit_divisor",
            "studentFacing": {
                "stageLabel": "Try it with me",
                "title": "How many one-sixth-metre units fit?",
                "prompt": "How many one-sixth-metre units fit in the strip?",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": [
                    "G1.PRE"
                ]
            },
            "authorOnly": {
                "assessmentIntent": "VIS - interpret division as repeated measurement rather than a memorised symbol change.",
                "routeNotes": [
                    "Always continue to G2. One miss alone does not classify a stable central misconception."
                ],
                "leakageNotes": [
                    "Do not number the active sixths before submission. The separate 1/6 tile may be shown."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 5,
                    "denominator": 6
                },
                "divisor": {
                    "numerator": 1,
                    "denominator": 6
                },
                "reciprocalOfDivisor": {
                    "numerator": 6,
                    "denominator": 1
                },
                "rawProduct": {
                    "numerator": 30,
                    "denominator": 6
                },
                "quotient": {
                    "numerator": 5,
                    "denominator": 1
                }
            },
            "visual": {
                "kind": "measurement_strip",
                "totalEqualParts": 6,
                "activeParts": 5,
                "divisorUnitParts": 1,
                "context": "light_strip",
                "unit": "m",
                "preSubmitShowsGroupCount": false,
                "accessibleDescriptionPreSubmit": "A strip is five sixths of a metre long. One separate measure tile is one sixth of a metre."
            },
            "response": {
                "kind": "integer",
                "fieldId": "groupCount",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "integer",
                "value": 5,
                "acceptEquivalentFraction": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "guided_after_committed_miss",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [
                        "G1.CORRECT"
                    ],
                    "visibleText": "Five one-sixth-metre units fit."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Use the one-sixth measure and count only the copies that fit inside the shown strip."
                },
                "byErrorFamily": {
                    "FULL_WHOLE_COUNT": {
                        "utteranceIds": [
                            "G1.INCORRECT.FULL_METRE"
                        ],
                        "visibleText": "The full metre would contain six sixths, but the shown strip contains only five."
                    },
                    "GROUP_SIZE_AS_QUOTIENT": {
                        "utteranceIds": [
                            "G1.INCORRECT.GROUP_SIZE"
                        ],
                        "visibleText": "One sixth is the size of each group, not the number of groups."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "The strip contains five one-sixth lengths.",
                    "5/6 ÷ 1/6 = 5."
                ],
                "visualReveal": [
                    "Step the 1/6 tile across exactly five active sections."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "numeric",
                    "value": 6,
                    "errorFamily": "FULL_WHOLE_COUNT",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "numeric",
                    "value": 1,
                    "errorFamily": "GROUP_SIZE_AS_QUOTIENT",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "G2",
            "stage": "guided",
            "assessmentFamily": "divisor_only_reciprocal",
            "studentFacing": {
                "stageLabel": "Try it with me",
                "title": "Complete the division",
                "prompt": "Which reciprocal should replace the divisor? Then calculate.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": [
                    "G2.PRE"
                ],
                "options": [
                    {
                        "id": "A",
                        "label": "3/2"
                    },
                    {
                        "id": "B",
                        "label": "5/4"
                    },
                    {
                        "id": "C",
                        "label": "2/3"
                    }
                ]
            },
            "authorOnly": {
                "assessmentIntent": "STEP - identify the divisor, choose its reciprocal and complete multiplication.",
                "routeNotes": [
                    "G1 and G2 both first-attempt correct with no escalation opens the fast route: skip F1 and retain F2."
                ],
                "leakageNotes": [
                    "Do not preselect or highlight 3/2 before submission."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 4,
                    "denominator": 5
                },
                "divisor": {
                    "numerator": 2,
                    "denominator": 3
                },
                "reciprocalOfDivisor": {
                    "numerator": 3,
                    "denominator": 2
                },
                "rawProduct": {
                    "numerator": 12,
                    "denominator": 10
                },
                "quotient": {
                    "numerator": 6,
                    "denominator": 5
                }
            },
            "visual": {
                "kind": "symbolic_rewrite",
                "showDividendLockAfterChoice": true,
                "showReciprocalBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is four fifths divided by two thirds. Three reciprocal choices are shown."
            },
            "response": {
                "kind": "choice_then_fraction",
                "choiceFieldId": "reciprocalChoice",
                "fractionFieldId": "quotient",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "choice_and_fraction",
                "optionId": "A",
                "quotient": {
                    "numerator": 6,
                    "denominator": 5
                },
                "acceptEquivalentQuotient": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "guided_after_committed_miss",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [
                        "G2.CORRECT"
                    ],
                    "visibleText": "The divisor 2/3 becomes 3/2, while 4/5 stays. The quotient is 6/5."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Keep the first fraction and replace only the divisor with its reciprocal."
                },
                "byErrorFamily": {
                    "FLIP_DIVIDEND": {
                        "utteranceIds": [
                            "G2.INCORRECT.DIVIDEND"
                        ],
                        "visibleText": "You selected 5/4, the reciprocal of the dividend. Keep 4/5."
                    },
                    "NO_RECIPROCAL": {
                        "utteranceIds": [
                            "G2.INCORRECT.UNCHANGED"
                        ],
                        "visibleText": "2/3 leaves the divisor unchanged. Use 3/2."
                    },
                    "ARITHMETIC_SLIP": {
                        "utteranceIds": [
                            "G2.INCORRECT.ARITHMETIC"
                        ],
                        "visibleText": "The rewrite is correct. Recheck the multiplication."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "4/5 ÷ 2/3 = 4/5 × 3/2.",
                    "4/5 × 3/2 = 12/10 = 6/5."
                ],
                "visualReveal": [
                    "Lock 4/5, crossfade ÷ to × and replace 2/3 with 3/2."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "choice",
                    "optionId": "B",
                    "errorFamily": "FLIP_DIVIDEND",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "choice",
                    "optionId": "C",
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                },
                {
                    "kind": "structure",
                    "structure": "correct_reciprocal_wrong_product",
                    "errorFamily": "ARITHMETIC_SLIP",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "F1",
            "stage": "faded",
            "assessmentFamily": "missing_reciprocal_and_quotient",
            "studentFacing": {
                "stageLabel": "Your turn - support nearby",
                "title": "Complete the rewrite and calculate",
                "prompt": "Complete 5/6 ÷ 3/4 = 5/6 × ? = ?.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": [
                    "F1.PRE"
                ],
                "hint": "The divisor is the second fraction. Swap its numerator and denominator; leave five sixths unchanged."
            },
            "authorOnly": {
                "assessmentIntent": "MISSING - complete a divisor reciprocal and exact quotient with support fading.",
                "routeNotes": [
                    "Shown only on the standard route. Hint use is support; later clean I1/I2 can still supply independent evidence."
                ],
                "leakageNotes": [
                    "The reciprocal and quotient fields remain blank until the learner submits."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 5,
                    "denominator": 6
                },
                "divisor": {
                    "numerator": 3,
                    "denominator": 4
                },
                "reciprocalOfDivisor": {
                    "numerator": 4,
                    "denominator": 3
                },
                "rawProduct": {
                    "numerator": 20,
                    "denominator": 18
                },
                "quotient": {
                    "numerator": 10,
                    "denominator": 9
                }
            },
            "visual": {
                "kind": "symbolic_missing_values",
                "fixedDividend": {
                    "numerator": 5,
                    "denominator": 6
                },
                "fixedDivisor": {
                    "numerator": 3,
                    "denominator": 4
                },
                "showAnswerBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is five sixths divided by three quarters. The first fraction is repeated in the multiplication line; the reciprocal and quotient fields are blank."
            },
            "response": {
                "kind": "reciprocal_and_fraction",
                "reciprocalFieldIds": [
                    "reciprocalNumerator",
                    "reciprocalDenominator"
                ],
                "quotientFieldIds": [
                    "quotientNumerator",
                    "quotientDenominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "reciprocal_and_quotient",
                "reciprocal": {
                    "numerator": 4,
                    "denominator": 3
                },
                "quotient": {
                    "numerator": 10,
                    "denominator": 9
                },
                "acceptEquivalentQuotient": true,
                "requireSimplestForm": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "optional_collapsed",
                "solutionPolicy": "after_committed_response",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. 3/4 becomes 4/3, and 5/6 × 4/3 = 20/18 = 10/9."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Check that the dividend stayed 5/6 and the divisor became 4/3."
                },
                "byErrorFamily": {
                    "FLIP_DIVIDEND": {
                        "utteranceIds": [],
                        "visibleText": "The first fraction changed. Keep 5/6."
                    },
                    "NO_RECIPROCAL": {
                        "utteranceIds": [],
                        "visibleText": "The divisor is still 3/4. Replace it with 4/3."
                    },
                    "ARITHMETIC_SLIP": {
                        "utteranceIds": [],
                        "visibleText": "The reciprocal is right. Recheck the fraction multiplication."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "5/6 ÷ 3/4 = 5/6 × 4/3.",
                    "5/6 × 4/3 = 20/18 = 10/9."
                ],
                "visualReveal": [
                    "Lock 5/6; reveal 4/3; reveal the raw product before the exact simplified result."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "structure",
                    "structure": "first_fraction_inverted",
                    "errorFamily": "FLIP_DIVIDEND",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "structure",
                    "structure": "second_fraction_unchanged",
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                },
                {
                    "kind": "structure",
                    "structure": "correct_rewrite_wrong_product",
                    "errorFamily": "ARITHMETIC_SLIP",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "F2",
            "stage": "faded",
            "assessmentFamily": "operand_selection_reasoning",
            "studentFacing": {
                "stageLabel": "Your turn",
                "title": "Which line rewrites the division correctly?",
                "prompt": "Choose the correct rewrite for 4 ÷ 2/3.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": [
                    "F2.PRE"
                ],
                "hint": "The amount being divided stays. Use the reciprocal of the divisor.",
                "options": [
                    {
                        "id": "A",
                        "label": "4 × 3/2"
                    },
                    {
                        "id": "B",
                        "label": "1/4 × 3/2"
                    },
                    {
                        "id": "C",
                        "label": "4 × 2/3"
                    },
                    {
                        "id": "D",
                        "label": "1/4 × 2/3"
                    }
                ]
            },
            "authorOnly": {
                "assessmentIntent": "REASON / METHOD - preserve an integer dividend and change only the divisor.",
                "routeNotes": [
                    "Retained on both strong and standard routes because integer dividend operand selection is a distinct reasoning direction."
                ],
                "leakageNotes": [
                    "No option is preselected or visually privileged."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 4,
                    "denominator": 1
                },
                "divisor": {
                    "numerator": 2,
                    "denominator": 3
                },
                "reciprocalOfDivisor": {
                    "numerator": 3,
                    "denominator": 2
                },
                "rawProduct": {
                    "numerator": 12,
                    "denominator": 2
                },
                "quotient": {
                    "numerator": 6,
                    "denominator": 1
                }
            },
            "visual": {
                "kind": "method_choice",
                "showWorkedLineBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is four divided by two thirds. Four symbolic rewrite choices are listed."
            },
            "response": {
                "kind": "single_choice",
                "fieldId": "methodChoice",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "choice",
                "optionId": "A"
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "optional_collapsed",
                "solutionPolicy": "after_committed_response",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. Keep 4 and replace 2/3 with 3/2."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. The amount 4 must stay, and only the divisor uses its reciprocal."
                },
                "byErrorFamily": {
                    "FLIP_DIVIDEND": {
                        "utteranceIds": [],
                        "visibleText": "The amount changed to one quarter. Keep 4."
                    },
                    "NO_RECIPROCAL": {
                        "utteranceIds": [],
                        "visibleText": "The divisor stayed 2/3. Use 3/2."
                    },
                    "FLIP_BOTH": {
                        "utteranceIds": [],
                        "visibleText": "Both the amount and divisor changed. Only the divisor should change."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "4 ÷ 2/3 = 4 × 3/2.",
                    "4 × 3/2 = 6."
                ],
                "visualReveal": [
                    "Outline the unchanged 4 and the reciprocal 3/2."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "choice",
                    "optionId": "B",
                    "errorFamily": "FLIP_DIVIDEND",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "choice",
                    "optionId": "C",
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                },
                {
                    "kind": "choice",
                    "optionId": "D",
                    "errorFamily": "FLIP_BOTH",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "I1",
            "stage": "independent",
            "assessmentFamily": "integer_dividend_direct",
            "studentFacing": {
                "stageLabel": "Now you take over",
                "title": "Calculate 5 ÷ 4/7",
                "prompt": "Calculate 5 ÷ 4/7. Give an exact fraction.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": [
                    "I1.PRE"
                ],
                "hint": "Write 5 as 5/1. Keep it, and use the reciprocal of 4/7."
            },
            "authorOnly": {
                "assessmentIntent": "DIRECT - independently divide an integer by a positive fraction and leave an exact improper fraction.",
                "routeNotes": [
                    "If correct after opening the hint, require C-INT before final."
                ],
                "leakageNotes": [
                    "Do not show 5/1, 7/4 or a multiplication sign before submission."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 5,
                    "denominator": 1
                },
                "divisor": {
                    "numerator": 4,
                    "denominator": 7
                },
                "reciprocalOfDivisor": {
                    "numerator": 7,
                    "denominator": 4
                },
                "rawProduct": {
                    "numerator": 35,
                    "denominator": 4
                },
                "quotient": {
                    "numerator": 35,
                    "denominator": 4
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is five divided by four sevenths. One fraction answer field is empty."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 35,
                    "denominator": 4
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "optional_collapsed",
                "solutionPolicy": "after_committed_response",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": true
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. 5 stays 5/1 and 4/7 becomes 7/4, giving 35/4."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Keep 5 as 5/1 and use the reciprocal of 4/7."
                },
                "byErrorFamily": {
                    "NO_RECIPROCAL": {
                        "utteranceIds": [],
                        "visibleText": "20/7 comes from multiplying by 4/7 unchanged. Use 7/4."
                    },
                    "FLIP_DIVIDEND": {
                        "utteranceIds": [],
                        "visibleText": "7/20 changes the dividend. Keep 5 as 5/1."
                    },
                    "ARITHMETIC_SLIP": {
                        "utteranceIds": [],
                        "visibleText": "Your rewrite is sound. Recheck the multiplication."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "5 = 5/1.",
                    "5/1 ÷ 4/7 = 5/1 × 7/4 = 35/4."
                ],
                "visualReveal": [
                    "Reveal 5/1, then 7/4, then the exact quotient."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "fraction",
                    "value": {
                        "numerator": 20,
                        "denominator": 7
                    },
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                },
                {
                    "kind": "fraction",
                    "value": {
                        "numerator": 7,
                        "denominator": 20
                    },
                    "errorFamily": "FLIP_DIVIDEND",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "I2",
            "stage": "independent",
            "assessmentFamily": "context_measurement_translation",
            "studentFacing": {
                "stageLabel": "Now you take over",
                "title": "How many sample-pot amounts?",
                "prompt": "How many sample-pot amounts are in the container?",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": [
                    "I2.PRE"
                ],
                "context": "A paint container holds 9/10 litre. Each sample pot holds 3/20 litre.",
                "hint": "Use amount ÷ size of one pot: 9/10 ÷ 3/20. Replace the pot-size fraction with its reciprocal."
            },
            "authorOnly": {
                "assessmentIntent": "CONTEXT - identify amount ÷ group size, then calculate without a pre-counted group model.",
                "routeNotes": [
                    "If correct after opening the hint, require C-CTX before final."
                ],
                "leakageNotes": [
                    "The context visual shows one pot only; it must not tile or bracket six pots before submission."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 9,
                    "denominator": 10
                },
                "divisor": {
                    "numerator": 3,
                    "denominator": 20
                },
                "reciprocalOfDivisor": {
                    "numerator": 20,
                    "denominator": 3
                },
                "rawProduct": {
                    "numerator": 180,
                    "denominator": 30
                },
                "quotient": {
                    "numerator": 6,
                    "denominator": 1
                }
            },
            "visual": {
                "kind": "paint_container_and_sample_pot",
                "containerAmount": {
                    "numerator": 9,
                    "denominator": 10
                },
                "potAmount": {
                    "numerator": 3,
                    "denominator": 20
                },
                "unit": "L",
                "preSubmitShowsGroupCount": false,
                "accessibleDescriptionPreSubmit": "A paint container is labelled nine tenths of a litre. One separate sample pot is labelled three twentieths of a litre. No repeated pots are shown."
            },
            "response": {
                "kind": "integer_with_unit",
                "fieldId": "potCount",
                "unitLabel": "pots",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "integer",
                "value": 6,
                "acceptEquivalentFraction": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "optional_collapsed",
                "solutionPolicy": "after_committed_response",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": true
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. 9/10 ÷ 3/20 = 9/10 × 20/3 = 6."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Use total paint amount ÷ one pot amount."
                },
                "byErrorFamily": {
                    "REVERSED_CONTEXT_ORDER": {
                        "utteranceIds": [],
                        "visibleText": "The question asks how many pots fit in the total. Use 9/10 ÷ 3/20, not the reverse."
                    },
                    "NO_RECIPROCAL": {
                        "utteranceIds": [],
                        "visibleText": "The pot-size fraction must be replaced by 20/3."
                    },
                    "ARITHMETIC_SLIP": {
                        "utteranceIds": [],
                        "visibleText": "The division setup is right. Recheck the multiplication."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "Amount ÷ one pot = 9/10 ÷ 3/20.",
                    "9/10 × 20/3 = 180/30 = 6 pots."
                ],
                "visualReveal": [
                    "Repeat the 3/20 pot outline six times only after the answer is locked."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "structure",
                    "structure": "divisor_divided_by_dividend",
                    "errorFamily": "REVERSED_CONTEXT_ORDER",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "structure",
                    "structure": "divisor_unchanged",
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                }
            ]
        },
        {
            "id": "M1",
            "stage": "final",
            "assessmentFamily": "final_direct_integer",
            "studentFacing": {
                "stageLabel": "Final check",
                "title": "Calculate 3 ÷ 4/5",
                "prompt": "Calculate 3 ÷ 4/5. Give an exact fraction.",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "DIRECT - integer dividend, exact improper quotient, no mixed-number conversion.",
                "routeNotes": [
                    "Primary final slot 1 maps to recovery item RC1 if replacement evidence is needed."
                ],
                "leakageNotes": [
                    "No 3/1, reciprocal, multiplication line or worked check before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 3,
                    "denominator": 1
                },
                "divisor": {
                    "numerator": 4,
                    "denominator": 5
                },
                "reciprocalOfDivisor": {
                    "numerator": 5,
                    "denominator": 4
                },
                "rawProduct": {
                    "numerator": 15,
                    "denominator": 4
                },
                "quotient": {
                    "numerator": 15,
                    "denominator": 4
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is three divided by four fifths. The fraction answer field is empty."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 15,
                    "denominator": 4
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [
                        "M1.CORRECT"
                    ],
                    "visibleText": "Correct. The reciprocal of 4/5 is 5/4."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Keep 3 as 3/1 and compare your reciprocal of 4/5 with the worked check."
                },
                "byErrorFamily": {
                    "FLIP_DIVIDEND": {
                        "utteranceIds": [],
                        "visibleText": "The amount 3 must stay 3/1."
                    },
                    "NO_RECIPROCAL": {
                        "utteranceIds": [],
                        "visibleText": "The divisor 4/5 must become 5/4."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "3 = 3/1.",
                    "3/1 ÷ 4/5 = 3/1 × 5/4 = 15/4."
                ],
                "visualReveal": [
                    "Reveal the locked 3/1 and changed 5/4 after outcome feedback."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "structure",
                    "structure": "dividend_inverted",
                    "errorFamily": "FLIP_DIVIDEND",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "structure",
                    "structure": "divisor_unchanged",
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                }
            ]
        },
        {
            "id": "M2",
            "stage": "final",
            "assessmentFamily": "final_below_one_reasoning",
            "studentFacing": {
                "stageLabel": "Final check",
                "title": "Calculate 2/3 ÷ 5/6",
                "prompt": "Calculate 2/3 ÷ 5/6.",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "REASON + DIRECT - calculate a valid quotient below one and reject the impossible claim.",
                "routeNotes": [
                    "Primary final slot 2 maps to recovery item RC2."
                ],
                "leakageNotes": [
                    "Do not show a below-one range marker before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 2,
                    "denominator": 3
                },
                "divisor": {
                    "numerator": 5,
                    "denominator": 6
                },
                "reciprocalOfDivisor": {
                    "numerator": 6,
                    "denominator": 5
                },
                "rawProduct": {
                    "numerator": 12,
                    "denominator": 15
                },
                "quotient": {
                    "numerator": 4,
                    "denominator": 5
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showMagnitudeCueBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is two thirds divided by five sixths. The fraction answer field is empty."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 4,
                    "denominator": 5
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [
                        "M2.CORRECT"
                    ],
                    "visibleText": "Correct. The quotient 4/5 is below one, which fits the size comparison."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. A quotient is possible here; compare the reciprocal and the size of your result with the check."
                },
                "byErrorFamily": {
                    "SMALLER_IMPOSSIBLE": {
                        "utteranceIds": [],
                        "visibleText": "A smaller amount can be part of one larger group. The answer should lie between 0 and 1."
                    },
                    "FLIP_BOTH": {
                        "utteranceIds": [],
                        "visibleText": "Keep 2/3. Only 5/6 becomes 6/5."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "2/3 ÷ 5/6 = 2/3 × 6/5.",
                    "12/15 = 4/5.",
                    "Because 2/3 is smaller than 5/6, the quotient is between 0 and 1."
                ],
                "visualReveal": [
                    "Place 4/5 on a 0-to-1 magnitude strip only after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "special",
                    "value": "impossible",
                    "errorFamily": "SMALLER_IMPOSSIBLE",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "numeric",
                    "value": 0,
                    "errorFamily": "SMALLER_IMPOSSIBLE",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "structure",
                    "structure": "both_fractions_inverted",
                    "errorFamily": "FLIP_BOTH",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "M3",
            "stage": "final",
            "assessmentFamily": "final_missing_reciprocal",
            "studentFacing": {
                "stageLabel": "Final check",
                "title": "Complete both missing fractions",
                "prompt": "Complete 7/12 ÷ 14/15 = 7/12 × ? and give the final answer.",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "MISSING / STEP - preserve the dividend, provide the divisor reciprocal and exact quotient.",
                "routeNotes": [
                    "Primary final slot 3 maps to recovery item RC3."
                ],
                "leakageNotes": [
                    "The missing reciprocal remains blank before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 7,
                    "denominator": 12
                },
                "divisor": {
                    "numerator": 14,
                    "denominator": 15
                },
                "reciprocalOfDivisor": {
                    "numerator": 15,
                    "denominator": 14
                },
                "rawProduct": {
                    "numerator": 105,
                    "denominator": 168
                },
                "quotient": {
                    "numerator": 5,
                    "denominator": 8
                }
            },
            "visual": {
                "kind": "symbolic_missing_values",
                "fixedDividend": {
                    "numerator": 7,
                    "denominator": 12
                },
                "fixedDivisor": {
                    "numerator": 14,
                    "denominator": 15
                },
                "showAnswerBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is seven twelfths divided by fourteen fifteenths. The multiplication line keeps seven twelfths; the reciprocal and final answer fields are blank."
            },
            "response": {
                "kind": "reciprocal_and_fraction",
                "reciprocalFieldIds": [
                    "reciprocalNumerator",
                    "reciprocalDenominator"
                ],
                "quotientFieldIds": [
                    "quotientNumerator",
                    "quotientDenominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "reciprocal_and_quotient",
                "reciprocal": {
                    "numerator": 15,
                    "denominator": 14
                },
                "quotient": {
                    "numerator": 5,
                    "denominator": 8
                },
                "acceptEquivalentQuotient": true,
                "requireSimplestForm": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [
                        "M3.CORRECT"
                    ],
                    "visibleText": "Correct. 14/15 becomes 15/14, and the quotient is 5/8."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Check that 14/15 became 15/14 while 7/12 stayed unchanged."
                },
                "byErrorFamily": {
                    "RECIPROCAL_FORM": {
                        "utteranceIds": [],
                        "visibleText": "Swap both numbers in 14/15 to form 15/14."
                    },
                    "FLIP_DIVIDEND": {
                        "utteranceIds": [],
                        "visibleText": "The first fraction must remain 7/12."
                    },
                    "ARITHMETIC_SLIP": {
                        "utteranceIds": [],
                        "visibleText": "The reciprocal is right. Recheck 7/12 × 15/14."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "14/15 becomes 15/14.",
                    "7/12 × 15/14 = 105/168 = 5/8."
                ],
                "visualReveal": [
                    "Reveal the reciprocal first, then raw product, then exact equivalent result."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "structure",
                    "structure": "invalid_reciprocal_same_numerator_or_denominator",
                    "errorFamily": "RECIPROCAL_FORM",
                    "requiresRepeatBeforeClassification": true
                },
                {
                    "kind": "structure",
                    "structure": "first_fraction_inverted",
                    "errorFamily": "FLIP_DIVIDEND",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "structure",
                    "structure": "correct_reciprocal_wrong_product",
                    "errorFamily": "ARITHMETIC_SLIP",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "M4",
            "stage": "final",
            "assessmentFamily": "final_error_reasoning",
            "studentFacing": {
                "stageLabel": "Final check",
                "title": "Which response is correct?",
                "prompt": "A student writes: 3/5 ÷ 2/7 = 5/3 × 7/2. Which response is correct?",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": [],
                "options": [
                    {
                        "id": "A",
                        "label": "Correct - both fractions flip."
                    },
                    {
                        "id": "B",
                        "label": "Not correct - keep 3/5 and use 7/2, giving 21/10."
                    },
                    {
                        "id": "C",
                        "label": "Not correct - multiply 3/5 by 2/7."
                    },
                    {
                        "id": "D",
                        "label": "The division is impossible."
                    }
                ]
            },
            "authorOnly": {
                "assessmentIntent": "ERROR / REASON - distinguish reciprocal knowledge from correct operand selection.",
                "routeNotes": [
                    "Primary final slot 4 maps to recovery item RC4."
                ],
                "leakageNotes": [
                    "No option receives stronger styling before selection."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 3,
                    "denominator": 5
                },
                "divisor": {
                    "numerator": 2,
                    "denominator": 7
                },
                "reciprocalOfDivisor": {
                    "numerator": 7,
                    "denominator": 2
                },
                "rawProduct": {
                    "numerator": 21,
                    "denominator": 10
                },
                "quotient": {
                    "numerator": 21,
                    "denominator": 10
                }
            },
            "visual": {
                "kind": "student_error_choice",
                "showCorrectRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "A student has rewritten three fifths divided by two sevenths as five thirds times seven halves. Four response choices are shown."
            },
            "response": {
                "kind": "single_choice",
                "fieldId": "reasonChoice",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "choice",
                "optionId": "B"
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [
                        "M4.CORRECT"
                    ],
                    "visibleText": "Correct. Keep 3/5 and replace only 2/7 with 7/2."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. The first fraction must stay 3/5; only 2/7 becomes 7/2."
                },
                "byErrorFamily": {
                    "FLIP_BOTH": {
                        "utteranceIds": [],
                        "visibleText": "Both fractions were flipped. Only the divisor should change."
                    },
                    "NO_RECIPROCAL": {
                        "utteranceIds": [],
                        "visibleText": "Multiplying by 2/7 unchanged does not rewrite the division."
                    },
                    "SMALLER_IMPOSSIBLE": {
                        "utteranceIds": [],
                        "visibleText": "This division is valid; the dividend and divisor are both positive."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "Keep 3/5.",
                    "Replace 2/7 with 7/2.",
                    "3/5 × 7/2 = 21/10."
                ],
                "visualReveal": [
                    "Cross out the changed 5/3 and reveal the correct 3/5 × 7/2 line."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "choice",
                    "optionId": "A",
                    "errorFamily": "FLIP_BOTH",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "choice",
                    "optionId": "C",
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                },
                {
                    "kind": "choice",
                    "optionId": "D",
                    "errorFamily": "SMALLER_IMPOSSIBLE",
                    "requiresRepeatBeforeClassification": false
                }
            ]
        },
        {
            "id": "M5",
            "stage": "final",
            "assessmentFamily": "final_context_measurement",
            "studentFacing": {
                "stageLabel": "Final check",
                "title": "How many test-section lengths fit?",
                "prompt": "How many test-section lengths fit in the wire?",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": [],
                "context": "A wire is 5/6 m long. Each test section is 5/24 m."
            },
            "authorOnly": {
                "assessmentIntent": "CONTEXT / VIS - translate wire length ÷ one section length without a pre-submit count model.",
                "routeNotes": [
                    "Primary final slot 5 maps to recovery item RC5."
                ],
                "leakageNotes": [
                    "Show one section guide only before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 5,
                    "denominator": 6
                },
                "divisor": {
                    "numerator": 5,
                    "denominator": 24
                },
                "reciprocalOfDivisor": {
                    "numerator": 24,
                    "denominator": 5
                },
                "rawProduct": {
                    "numerator": 120,
                    "denominator": 30
                },
                "quotient": {
                    "numerator": 4,
                    "denominator": 1
                }
            },
            "visual": {
                "kind": "wire_and_single_section",
                "wireLength": {
                    "numerator": 5,
                    "denominator": 6
                },
                "sectionLength": {
                    "numerator": 5,
                    "denominator": 24
                },
                "unit": "m",
                "preSubmitShowsGroupCount": false,
                "accessibleDescriptionPreSubmit": "One wire is labelled five sixths of a metre. One separate test-section guide is labelled five twenty-fourths of a metre. No repeated sections are shown."
            },
            "response": {
                "kind": "integer_with_unit",
                "fieldId": "sectionCount",
                "unitLabel": "sections",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "integer",
                "value": 4,
                "acceptEquivalentFraction": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [
                        "M5.CORRECT"
                    ],
                    "visibleText": "Correct. Four section-lengths fit."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Use wire length ÷ one section length, then compare with the worked check."
                },
                "byErrorFamily": {
                    "REVERSED_CONTEXT_ORDER": {
                        "utteranceIds": [],
                        "visibleText": "Use total wire ÷ one section, not one section ÷ total wire."
                    },
                    "NO_RECIPROCAL": {
                        "utteranceIds": [],
                        "visibleText": "The section-size divisor 5/24 must become 24/5."
                    }
                },
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "5/6 ÷ 5/24 = 5/6 × 24/5.",
                    "120/30 = 4 sections."
                ],
                "visualReveal": [
                    "Partition the wire into four equal 5/24 spans only after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": [
                {
                    "kind": "structure",
                    "structure": "divisor_divided_by_dividend",
                    "errorFamily": "REVERSED_CONTEXT_ORDER",
                    "requiresRepeatBeforeClassification": false
                },
                {
                    "kind": "structure",
                    "structure": "divisor_unchanged",
                    "errorFamily": "NO_RECIPROCAL",
                    "requiresRepeatBeforeClassification": true
                }
            ]
        }
    ],
    "confirmations": [
        {
            "id": "C-INT",
            "stage": "confirmation",
            "assessmentFamily": "confirm_integer_dividend_no_hint",
            "studentFacing": {
                "stageLabel": "Independent confirmation",
                "title": "Calculate 2 ÷ 3/4",
                "prompt": "Calculate 2 ÷ 3/4. Give an exact fraction.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh no-hint same-family confirmation after I1 support.",
                "routeNotes": [
                    "Required only when I1 was correct after opening its hint."
                ],
                "leakageNotes": [
                    "No hint, reciprocal or multiplication line before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 2,
                    "denominator": 1
                },
                "divisor": {
                    "numerator": 3,
                    "denominator": 4
                },
                "reciprocalOfDivisor": {
                    "numerator": 4,
                    "denominator": 3
                },
                "rawProduct": {
                    "numerator": 8,
                    "denominator": 3
                },
                "quotient": {
                    "numerator": 8,
                    "denominator": 3
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is two divided by three quarters. The fraction answer field is empty."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 8,
                    "denominator": 3
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. 2/1 × 4/3 = 8/3."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Keep 2 as 2/1 and replace 3/4 with 4/3."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "2 = 2/1.",
                    "2/1 ÷ 3/4 = 2/1 × 4/3 = 8/3."
                ],
                "visualReveal": [
                    "Reveal the rewrite after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "C-CTX",
            "stage": "confirmation",
            "assessmentFamily": "confirm_context_measurement_no_hint",
            "studentFacing": {
                "stageLabel": "Independent confirmation",
                "title": "How many unit-lengths?",
                "prompt": "A cable is 7/8 m long. One test unit is 1/16 m. How many unit-lengths fit?",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh no-hint context confirmation after I2 support.",
                "routeNotes": [
                    "Required only when I2 was correct after opening its hint."
                ],
                "leakageNotes": [
                    "Show one unit guide only before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 7,
                    "denominator": 8
                },
                "divisor": {
                    "numerator": 1,
                    "denominator": 16
                },
                "reciprocalOfDivisor": {
                    "numerator": 16,
                    "denominator": 1
                },
                "rawProduct": {
                    "numerator": 112,
                    "denominator": 8
                },
                "quotient": {
                    "numerator": 14,
                    "denominator": 1
                }
            },
            "visual": {
                "kind": "cable_and_single_unit",
                "cableLength": {
                    "numerator": 7,
                    "denominator": 8
                },
                "unitLength": {
                    "numerator": 1,
                    "denominator": 16
                },
                "unit": "m",
                "preSubmitShowsGroupCount": false,
                "accessibleDescriptionPreSubmit": "One cable is labelled seven eighths of a metre. One separate test-unit guide is labelled one sixteenth of a metre. No repeated units are shown."
            },
            "response": {
                "kind": "integer",
                "fieldId": "unitCount",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "integer",
                "value": 14,
                "acceptEquivalentFraction": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. 7/8 × 16/1 = 14."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Use cable length ÷ one test-unit length."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "7/8 ÷ 1/16 = 7/8 × 16/1.",
                    "112/8 = 14."
                ],
                "visualReveal": [
                    "Reveal fourteen unit spans only after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        }
    ],
    "repairChecks": [
        {
            "id": "R-DIVIDEND-CHECK",
            "stage": "repair_check",
            "assessmentFamily": "repair_dividend_operand",
            "studentFacing": {
                "stageLabel": "Fresh check",
                "title": "Keep the amount, change the divisor",
                "prompt": "Choose the correct rewrite and calculate 5/8 ÷ 3/4.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh independent check after R-DIVIDEND.",
                "routeNotes": [
                    "Resume at the next authored stage only after this no-hint check passes."
                ],
                "leakageNotes": [
                    "No reciprocal shown before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 5,
                    "denominator": 8
                },
                "divisor": {
                    "numerator": 3,
                    "denominator": 4
                },
                "reciprocalOfDivisor": {
                    "numerator": 4,
                    "denominator": 3
                },
                "rawProduct": {
                    "numerator": 20,
                    "denominator": 24
                },
                "quotient": {
                    "numerator": 5,
                    "denominator": 6
                }
            },
            "visual": {
                "kind": "symbolic_rewrite",
                "showRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is five eighths divided by three quarters. The rewrite and answer controls are empty."
            },
            "response": {
                "kind": "reciprocal_and_fraction",
                "reciprocalFieldIds": [
                    "reciprocalNumerator",
                    "reciprocalDenominator"
                ],
                "quotientFieldIds": [
                    "quotientNumerator",
                    "quotientDenominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "reciprocal_and_quotient",
                "reciprocal": {
                    "numerator": 4,
                    "denominator": 3
                },
                "quotient": {
                    "numerator": 5,
                    "denominator": 6
                },
                "acceptEquivalentQuotient": true,
                "requireSimplestForm": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. Keep 5/8 and use 4/3, giving 5/6."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Keep 5/8 unchanged and replace only 3/4."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "5/8 ÷ 3/4 = 5/8 × 4/3 = 20/24 = 5/6."
                ],
                "visualReveal": [
                    "Reveal the correct rewrite after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "R-BOTH-CHECK",
            "stage": "repair_check",
            "assessmentFamily": "repair_flip_both",
            "studentFacing": {
                "stageLabel": "Fresh check",
                "title": "Only the divisor changes",
                "prompt": "Rewrite and calculate 7/9 ÷ 5/6.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh independent check after R-BOTH.",
                "routeNotes": [
                    "Resume only after a no-hint pass."
                ],
                "leakageNotes": [
                    "No reciprocal shown before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 7,
                    "denominator": 9
                },
                "divisor": {
                    "numerator": 5,
                    "denominator": 6
                },
                "reciprocalOfDivisor": {
                    "numerator": 6,
                    "denominator": 5
                },
                "rawProduct": {
                    "numerator": 42,
                    "denominator": 45
                },
                "quotient": {
                    "numerator": 14,
                    "denominator": 15
                }
            },
            "visual": {
                "kind": "symbolic_rewrite",
                "showRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is seven ninths divided by five sixths. The rewrite and answer controls are empty."
            },
            "response": {
                "kind": "reciprocal_and_fraction",
                "reciprocalFieldIds": [
                    "reciprocalNumerator",
                    "reciprocalDenominator"
                ],
                "quotientFieldIds": [
                    "quotientNumerator",
                    "quotientDenominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "reciprocal_and_quotient",
                "reciprocal": {
                    "numerator": 6,
                    "denominator": 5
                },
                "quotient": {
                    "numerator": 14,
                    "denominator": 15
                },
                "acceptEquivalentQuotient": true,
                "requireSimplestForm": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. Keep 7/9 and use 6/5, giving 14/15."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Leave 7/9 unchanged and replace only 5/6."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "7/9 ÷ 5/6 = 7/9 × 6/5 = 42/45 = 14/15."
                ],
                "visualReveal": [
                    "Reveal the correct rewrite after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "R-UNCHANGED-CHECK",
            "stage": "repair_check",
            "assessmentFamily": "repair_no_reciprocal",
            "studentFacing": {
                "stageLabel": "Fresh check",
                "title": "Use the divisor reciprocal",
                "prompt": "Calculate 5/6 ÷ 1/3. Give an exact fraction.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh independent check after R-UNCHANGED.",
                "routeNotes": [
                    "Resume only after a no-hint pass."
                ],
                "leakageNotes": [
                    "No 3/1 shown before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 5,
                    "denominator": 6
                },
                "divisor": {
                    "numerator": 1,
                    "denominator": 3
                },
                "reciprocalOfDivisor": {
                    "numerator": 3,
                    "denominator": 1
                },
                "rawProduct": {
                    "numerator": 15,
                    "denominator": 6
                },
                "quotient": {
                    "numerator": 5,
                    "denominator": 2
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is five sixths divided by one third. The fraction answer field is empty."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 5,
                    "denominator": 2
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. 1/3 becomes 3/1, so the quotient is 5/2."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Replace 1/3 with 3/1 before multiplying."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "5/6 ÷ 1/3 = 5/6 × 3/1 = 15/6 = 5/2."
                ],
                "visualReveal": [
                    "Reveal the reciprocal and product after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "R-SEPARATE-CHECK",
            "stage": "repair_check",
            "assessmentFamily": "repair_fraction_as_one_value",
            "studentFacing": {
                "stageLabel": "Fresh check",
                "title": "Treat each fraction as one value",
                "prompt": "Calculate 3/4 ÷ 2/5 using reciprocal multiplication.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh independent check after R-SEPARATE.",
                "routeNotes": [
                    "Resume only after a no-hint pass."
                ],
                "leakageNotes": [
                    "No numerator-only or denominator-only controls."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 3,
                    "denominator": 4
                },
                "divisor": {
                    "numerator": 2,
                    "denominator": 5
                },
                "reciprocalOfDivisor": {
                    "numerator": 5,
                    "denominator": 2
                },
                "rawProduct": {
                    "numerator": 15,
                    "denominator": 8
                },
                "quotient": {
                    "numerator": 15,
                    "denominator": 8
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showRewriteBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "The expression is three quarters divided by two fifths. One fraction answer field is empty."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 15,
                    "denominator": 8
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. Replace the whole divisor 2/5 with 5/2, giving 15/8."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Treat 2/5 as one divisor and replace the whole fraction with 5/2."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8."
                ],
                "visualReveal": [
                    "Outline each whole fraction card, then reveal the rewrite."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "R-POSSIBLE-CHECK",
            "stage": "repair_check",
            "assessmentFamily": "repair_below_one_possible",
            "studentFacing": {
                "stageLabel": "Fresh check",
                "title": "Predict the range, then calculate",
                "prompt": "For 3/8 ÷ 1/2, choose the sensible range and calculate.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh independent check after R-POSSIBLE.",
                "routeNotes": [
                    "Resume only after both range and exact quotient are correct."
                ],
                "leakageNotes": [
                    "The range choice does not reveal the exact answer."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 3,
                    "denominator": 8
                },
                "divisor": {
                    "numerator": 1,
                    "denominator": 2
                },
                "reciprocalOfDivisor": {
                    "numerator": 2,
                    "denominator": 1
                },
                "rawProduct": {
                    "numerator": 6,
                    "denominator": 8
                },
                "quotient": {
                    "numerator": 3,
                    "denominator": 4
                }
            },
            "visual": {
                "kind": "range_then_fraction",
                "rangeOptions": [
                    "0_to_1",
                    "exactly_1",
                    "above_1"
                ],
                "showCalculationFieldsAfterRangeChoice": true,
                "accessibleDescriptionPreSubmit": "The expression is three eighths divided by one half. Three range choices and a fraction answer field are present."
            },
            "response": {
                "kind": "range_and_fraction",
                "rangeFieldId": "range",
                "fractionFieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "range_and_fraction",
                "rangeId": "0_to_1",
                "quotient": {
                    "numerator": 3,
                    "denominator": 4
                },
                "acceptEquivalentQuotient": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. The quotient is 3/4, between 0 and 1."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Three eighths is less than one full one-half group, so the quotient should be between 0 and 1."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "3/8 ÷ 1/2 = 3/8 × 2/1 = 6/8 = 3/4."
                ],
                "visualReveal": [
                    "Reveal 3/4 on a 0-to-1 strip after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "R-RECIPROCAL-CHECK",
            "stage": "repair_check",
            "assessmentFamily": "repair_reciprocal_form",
            "studentFacing": {
                "stageLabel": "Fresh check",
                "title": "Write the reciprocal",
                "prompt": "Write the reciprocal of 7/11.",
                "submitLabel": "Check answer",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh no-hint reciprocal-form confirmation.",
                "routeNotes": [
                    "Use after a repeated reciprocal-form error, then return to the interrupted FRA-28 item family."
                ],
                "leakageNotes": [
                    "Do not animate the swap before submit."
                ]
            },
            "math": {
                "kind": "reciprocal_only",
                "source": {
                    "numerator": 7,
                    "denominator": 11
                },
                "reciprocal": {
                    "numerator": 11,
                    "denominator": 7
                }
            },
            "visual": {
                "kind": "fraction_card",
                "showSwapAnimationBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "A fraction card shows seven elevenths. The reciprocal answer field is empty."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 11,
                    "denominator": 7
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. The reciprocal of 7/11 is 11/7."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Swap the numerator and denominator."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "7/11 becomes 11/7."
                ],
                "visualReveal": [
                    "Crossfade 7/11 to 11/7 after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        }
    ],
    "repairs": [
        {
            "id": "R-DIVIDEND",
            "errorFamilies": [
                "FLIP_DIVIDEND"
            ],
            "narrationUtteranceIds": [
                "R-DIVIDEND.1",
                "R-DIVIDEND.2",
                "R-DIVIDEND.3"
            ],
            "studentFacing": {
                "title": "Keep the amount unchanged",
                "supportedInteraction": "Drag one reciprocal arrow onto the second fraction only.",
                "interactionErrorUtteranceIds": [
                    "R-DIVIDEND.INTERACTION"
                ]
            },
            "authorOnly": {
                "visual": "Contrast 4/7 ÷ 2/3 -> 7/4 × 3/2 with the correct 4/7 × 3/2.",
                "trigger": "One visible dividend flip is strong evidence, or a repeated ambiguous first-fraction change."
            },
            "freshCheckQuestionId": "R-DIVIDEND-CHECK"
        },
        {
            "id": "R-BOTH",
            "errorFamilies": [
                "FLIP_BOTH"
            ],
            "narrationUtteranceIds": [
                "R-BOTH.1",
                "R-BOTH.2",
                "R-BOTH.3"
            ],
            "studentFacing": {
                "title": "Only the divisor changes",
                "supportedInteraction": "Place “replace with reciprocal” under GROUP SIZE, not AMOUNT."
            },
            "authorOnly": {
                "visual": "Contrast 3/5 ÷ 2/7 -> 5/3 × 7/2 with 3/5 × 7/2.",
                "trigger": "One explicit both-flip rewrite is strong evidence."
            },
            "freshCheckQuestionId": "R-BOTH-CHECK"
        },
        {
            "id": "R-UNCHANGED",
            "errorFamilies": [
                "NO_RECIPROCAL"
            ],
            "narrationUtteranceIds": [
                "R-UNCHANGED.1",
                "R-UNCHANGED.2",
                "R-UNCHANGED.3"
            ],
            "studentFacing": {
                "title": "Division needs the divisor reciprocal",
                "supportedInteraction": "Tap the divisor card so 1/8 crossfades to 8/1 before the product field unlocks."
            },
            "authorOnly": {
                "visual": "Contrast 3/4 × 1/8 = 3/32 with 3/4 × 8/1 = 6 and six group brackets.",
                "trigger": "Repeat after one concise cue, unless the unchanged divisor is explicitly shown as the chosen method."
            },
            "freshCheckQuestionId": "R-UNCHANGED-CHECK"
        },
        {
            "id": "R-SEPARATE",
            "errorFamilies": [
                "SEPARATE_DIVIDE"
            ],
            "narrationUtteranceIds": [
                "R-SEPARATE.1",
                "R-SEPARATE.2",
                "R-SEPARATE.3"
            ],
            "studentFacing": {
                "title": "Treat each fraction as one value",
                "supportedInteraction": "Select the whole 4/5 divisor card, then choose its reciprocal 5/4."
            },
            "authorOnly": {
                "visual": "Fade the unsafe 2 ÷ 4 and 3 ÷ 5 split; outline each whole fraction card.",
                "trigger": "Visible separate numerator/denominator division or a repeat after neutral feedback."
            },
            "freshCheckQuestionId": "R-SEPARATE-CHECK"
        },
        {
            "id": "R-POSSIBLE",
            "errorFamilies": [
                "SMALLER_IMPOSSIBLE"
            ],
            "narrationUtteranceIds": [
                "R-POSSIBLE.1",
                "R-POSSIBLE.2",
                "R-POSSIBLE.3"
            ],
            "studentFacing": {
                "title": "A quotient can be between zero and one",
                "supportedInteraction": "Choose the sensible range first: 0-1, exactly 1 or above 1."
            },
            "authorOnly": {
                "visual": "Show 2/3 as 4/5 of one 5/6 divisor group.",
                "trigger": "Explicit impossible/zero claim or repeat after a range cue."
            },
            "freshCheckQuestionId": "R-POSSIBLE-CHECK"
        },
        {
            "id": "R-RECIPROCAL",
            "errorFamilies": [
                "RECIPROCAL_FORM"
            ],
            "narrationUtteranceIds": [
                "R-RECIPROCAL.1"
            ],
            "studentFacing": {
                "title": "Swap the numerator and denominator",
                "supportedInteraction": "Crossfade one divisor card from a/b to b/a."
            },
            "authorOnly": {
                "visual": "Use a clean whole-fraction card; do not split numerator and denominator into separate tasks.",
                "trigger": "One cue, then a fresh reciprocal check; repeated form error runs this refresher."
            },
            "freshCheckQuestionId": "R-RECIPROCAL-CHECK"
        }
    ],
    "recoveryBank": [
        {
            "id": "RC1",
            "stage": "replacement_final",
            "assessmentFamily": "recovery_direct_integer",
            "studentFacing": {
                "stageLabel": "Recovery check",
                "title": "Recovery item 1",
                "prompt": "Calculate 4 ÷ 5/6. Give an exact fraction.",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh replacement for M1.",
                "routeNotes": [
                    "Used only as fresh replacement evidence; never repeat the failed primary item."
                ],
                "leakageNotes": [
                    "No hint or working before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 4,
                    "denominator": 1
                },
                "divisor": {
                    "numerator": 5,
                    "denominator": 6
                },
                "reciprocalOfDivisor": {
                    "numerator": 6,
                    "denominator": 5
                },
                "rawProduct": {
                    "numerator": 24,
                    "denominator": 5
                },
                "quotient": {
                    "numerator": 24,
                    "denominator": 5
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showWorkingBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "Calculate 4 ÷ 5/6. Give an exact fraction."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 24,
                    "denominator": 5
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. The exact answer is 24/5."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Compare your unchanged dividend and reciprocal of the divisor with the worked check."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "4/1 ÷ 5/6 = 4/1 × 6/5.",
                    "The exact quotient is 24/5."
                ],
                "visualReveal": [
                    "Reveal the reciprocal rewrite and exact quotient after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "RC2",
            "stage": "replacement_final",
            "assessmentFamily": "recovery_below_one",
            "studentFacing": {
                "stageLabel": "Recovery check",
                "title": "Recovery item 2",
                "prompt": "Calculate 3/8 ÷ 9/10.",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh replacement for M2.",
                "routeNotes": [
                    "Used only as fresh replacement evidence; never repeat the failed primary item."
                ],
                "leakageNotes": [
                    "No hint or working before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 3,
                    "denominator": 8
                },
                "divisor": {
                    "numerator": 9,
                    "denominator": 10
                },
                "reciprocalOfDivisor": {
                    "numerator": 10,
                    "denominator": 9
                },
                "rawProduct": {
                    "numerator": 30,
                    "denominator": 72
                },
                "quotient": {
                    "numerator": 5,
                    "denominator": 12
                }
            },
            "visual": {
                "kind": "symbolic_expression",
                "showWorkingBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "Calculate 3/8 ÷ 9/10."
            },
            "response": {
                "kind": "fraction",
                "fieldIds": [
                    "numerator",
                    "denominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "fraction",
                "value": {
                    "numerator": 5,
                    "denominator": 12
                },
                "acceptEquivalentFractions": true,
                "acceptIntegerAsDenominatorOne": true,
                "requireSimplestForm": false,
                "acceptMixedNumber": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. The exact answer is 5/12."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Compare your unchanged dividend and reciprocal of the divisor with the worked check."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "3/8 ÷ 9/10 = 3/8 × 10/9.",
                    "The exact quotient is 5/12."
                ],
                "visualReveal": [
                    "Reveal the reciprocal rewrite and exact quotient after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "RC3",
            "stage": "replacement_final",
            "assessmentFamily": "recovery_missing_reciprocal",
            "studentFacing": {
                "stageLabel": "Recovery check",
                "title": "Recovery item 3",
                "prompt": "Complete 7/9 ÷ 1/3 = 7/9 × ? and give the quotient.",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Fresh replacement for M3.",
                "routeNotes": [
                    "Used only as fresh replacement evidence; never repeat the failed primary item."
                ],
                "leakageNotes": [
                    "No hint or working before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 7,
                    "denominator": 9
                },
                "divisor": {
                    "numerator": 1,
                    "denominator": 3
                },
                "reciprocalOfDivisor": {
                    "numerator": 3,
                    "denominator": 1
                },
                "rawProduct": {
                    "numerator": 21,
                    "denominator": 9
                },
                "quotient": {
                    "numerator": 7,
                    "denominator": 3
                }
            },
            "visual": {
                "kind": "symbolic_missing_values",
                "showWorkingBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "Complete 7/9 ÷ 1/3 = 7/9 × ? and give the quotient."
            },
            "response": {
                "kind": "reciprocal_and_fraction",
                "reciprocalFieldIds": [
                    "reciprocalNumerator",
                    "reciprocalDenominator"
                ],
                "quotientFieldIds": [
                    "quotientNumerator",
                    "quotientDenominator"
                ],
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "reciprocal_and_quotient",
                "reciprocal": {
                    "numerator": 3,
                    "denominator": 1
                },
                "quotient": {
                    "numerator": 7,
                    "denominator": 3
                },
                "acceptEquivalentQuotient": true,
                "requireSimplestForm": false
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. The exact answer is 7/3."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Compare your unchanged dividend and reciprocal of the divisor with the worked check."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "7/9 ÷ 1/3 = 7/9 × 3/1.",
                    "The exact quotient is 7/3."
                ],
                "visualReveal": [
                    "Reveal the reciprocal rewrite and exact quotient after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "RC4",
            "stage": "replacement_final",
            "assessmentFamily": "recovery_method_choice",
            "studentFacing": {
                "stageLabel": "Recovery check",
                "title": "Recovery item 4",
                "prompt": "Choose the correct rewrite for 5/8 ÷ 3/7, then calculate.",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": [],
                "options": [
                    {
                        "id": "A",
                        "label": "5/8 × 7/3"
                    },
                    {
                        "id": "B",
                        "label": "8/5 × 7/3"
                    },
                    {
                        "id": "C",
                        "label": "5/8 × 3/7"
                    },
                    {
                        "id": "D",
                        "label": "8/5 × 3/7"
                    }
                ]
            },
            "authorOnly": {
                "assessmentIntent": "Fresh replacement for M4.",
                "routeNotes": [
                    "Used only as fresh replacement evidence; never repeat the failed primary item."
                ],
                "leakageNotes": [
                    "No hint or working before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 5,
                    "denominator": 8
                },
                "divisor": {
                    "numerator": 3,
                    "denominator": 7
                },
                "reciprocalOfDivisor": {
                    "numerator": 7,
                    "denominator": 3
                },
                "rawProduct": {
                    "numerator": 35,
                    "denominator": 24
                },
                "quotient": {
                    "numerator": 35,
                    "denominator": 24
                }
            },
            "visual": {
                "kind": "method_choice",
                "showWorkingBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "Choose the correct rewrite for 5/8 ÷ 3/7, then calculate."
            },
            "response": {
                "kind": "choice_then_fraction",
                "choiceFieldId": "methodChoice",
                "fractionFieldId": "quotient",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "choice_and_fraction",
                "optionId": "A",
                "quotient": {
                    "numerator": 35,
                    "denominator": 24
                },
                "acceptEquivalentQuotient": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. The exact answer is 35/24."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Compare your unchanged dividend and reciprocal of the divisor with the worked check."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "5/8 ÷ 3/7 = 5/8 × 7/3.",
                    "The exact quotient is 35/24."
                ],
                "visualReveal": [
                    "Reveal the reciprocal rewrite and exact quotient after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        },
        {
            "id": "RC5",
            "stage": "replacement_final",
            "assessmentFamily": "recovery_context",
            "studentFacing": {
                "stageLabel": "Recovery check",
                "title": "Recovery item 5",
                "prompt": "A bag holds 2/3 kg. Each portion is 1/12 kg. How many portions are there?",
                "submitLabel": "Submit",
                "ryanBeforeSubmitUtteranceIds": [],
                "context": "A bag holds 2/3 kg. Each portion is 1/12 kg."
            },
            "authorOnly": {
                "assessmentIntent": "Fresh replacement for M5.",
                "routeNotes": [
                    "Used only as fresh replacement evidence; never repeat the failed primary item."
                ],
                "leakageNotes": [
                    "No hint or working before submit."
                ]
            },
            "math": {
                "kind": "division_by_positive_fraction",
                "dividend": {
                    "numerator": 2,
                    "denominator": 3
                },
                "divisor": {
                    "numerator": 1,
                    "denominator": 12
                },
                "reciprocalOfDivisor": {
                    "numerator": 12,
                    "denominator": 1
                },
                "rawProduct": {
                    "numerator": 24,
                    "denominator": 3
                },
                "quotient": {
                    "numerator": 8,
                    "denominator": 1
                }
            },
            "visual": {
                "kind": "bag_and_single_portion",
                "showWorkingBeforeSubmit": false,
                "accessibleDescriptionPreSubmit": "A bag holds 2/3 kg. Each portion is 1/12 kg. The portion-count field is empty."
            },
            "response": {
                "kind": "integer_with_unit",
                "fieldId": "portionCount",
                "unitLabel": "portions",
                "keyboardSubmit": true
            },
            "answer": {
                "kind": "integer",
                "value": 8,
                "acceptEquivalentFraction": true
            },
            "policy": {
                "scored": true,
                "commitResponseBeforeOutcome": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_locked_submit",
                "eligibleForIndependentMastery": true,
                "firstAttemptIsAuthoritative": true,
                "requiresFreshNoHintConfirmationIfHintUsed": false
            },
            "feedback": {
                "correct": {
                    "utteranceIds": [],
                    "visibleText": "Correct. The exact answer is 8."
                },
                "incorrectDefault": {
                    "utteranceIds": [],
                    "visibleText": "Not quite. Compare your unchanged dividend and reciprocal of the divisor with the worked check."
                },
                "byErrorFamily": {},
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterSpecific": true
            },
            "workedCheck": {
                "visibleSteps": [
                    "2/3 ÷ 1/12 = 2/3 × 12/1.",
                    "The exact quotient is 8."
                ],
                "visualReveal": [
                    "Reveal the reciprocal rewrite and exact quotient after lock."
                ],
                "requiresAnswerLocked": true,
                "mustFollowOutcomeFeedback": true
            },
            "likelyErrorSignals": []
        }
    ],
    "routing": {
        "guidedGate": {
            "strongEvidence": [
                "G1 first-attempt correct",
                "G2 first-attempt correct",
                "no hint/support escalation",
                "no central misconception",
                "not a duplicate submission"
            ],
            "strongRoute": [
                "G1",
                "G2",
                "F2",
                "I1",
                "I2"
            ],
            "standardRoute": [
                "G1",
                "G2",
                "F1",
                "F2",
                "I1",
                "I2"
            ],
            "speedNeverControlsRoute": true
        },
        "hintConfirmations": {
            "I1": "C-INT",
            "I2": "C-CTX"
        },
        "errorToRepair": {
            "FLIP_DIVIDEND": "R-DIVIDEND",
            "FLIP_BOTH": "R-BOTH",
            "NO_RECIPROCAL": "R-UNCHANGED",
            "SEPARATE_DIVIDE": "R-SEPARATE",
            "SMALLER_IMPOSSIBLE": "R-POSSIBLE",
            "RECIPROCAL_FORM": "R-RECIPROCAL"
        },
        "final": {
            "primaryIds": [
                "M1",
                "M2",
                "M3",
                "M4",
                "M5"
            ],
            "finish": {
                "correctMin": 4,
                "correctMax": 5,
                "requiresProceduralEvidence": true,
                "requiresReasoningOrApplicationEvidence": true,
                "repeatedBlockingMisconceptionAllowed": false
            },
            "threeOfFive": {
                "route": "repair_then_fresh_two_item_mini_check",
                "requiredRecoveryScore": "2/2"
            },
            "zeroToTwoOfFive": {
                "route": "repair_then_fresh_three_item_final",
                "requiredRecoveryScore": "3/3"
            },
            "primaryToRecovery": {
                "M1": "RC1",
                "M2": "RC2",
                "M3": "RC3",
                "M4": "RC4",
                "M5": "RC5"
            },
            "workingUsesCommittedPreRevealAnswerOnly": true,
            "supportedAnswersCountTowardPrimaryGate": false
        }
    },
    "misconceptions": [
        {
            "family": "FLIP_DIVIDEND",
            "evidence": "First fraction visibly inverted, such as 5 ÷ 4/7 -> 7/20.",
            "immediateVisibleFeedback": "The amount being divided changed. Keep the dividend exactly as it is.",
            "repairThreshold": "One visible first-fraction flip or a repeat."
        },
        {
            "family": "FLIP_BOTH",
            "evidence": "Both fractions are inverted, such as 3/5 ÷ 2/7 -> 5/3 × 7/2.",
            "immediateVisibleFeedback": "Only the divisor is replaced by its reciprocal.",
            "repairThreshold": "One explicit both-flip rewrite is strong evidence."
        },
        {
            "family": "NO_RECIPROCAL",
            "evidence": "Multiplies by the divisor unchanged, such as 5 × 4/7.",
            "immediateVisibleFeedback": "That uses the divisor unchanged. Division needs its reciprocal.",
            "repairThreshold": "Repeat after one cue, unless the method is explicitly shown."
        },
        {
            "family": "SEPARATE_DIVIDE",
            "evidence": "Treats numerator and denominator as separate whole-number divisions.",
            "immediateVisibleFeedback": "The fraction is one value, not two separate whole-number questions.",
            "repairThreshold": "Visible method or repeat."
        },
        {
            "family": "SMALLER_IMPOSSIBLE",
            "evidence": "Claims smaller ÷ larger is zero or impossible.",
            "immediateVisibleFeedback": "A smaller amount can be part of one larger group. The result should be between 0 and 1.",
            "repairThreshold": "Explicit claim or repeat."
        },
        {
            "family": "RECIPROCAL_FORM",
            "evidence": "Correctly selects the divisor but forms an invalid reciprocal such as 4/5 -> 5/5.",
            "immediateVisibleFeedback": "A reciprocal swaps numerator and denominator.",
            "repairThreshold": "One cue, fresh check; repeat runs R-RECIPROCAL."
        },
        {
            "family": "ARITHMETIC_SLIP",
            "evidence": "Correct rewrite followed by one multiplication/equivalence error.",
            "immediateVisibleFeedback": "Your method is sound. Recheck that number fact.",
            "repairThreshold": "Do not classify conceptually from one isolated slip."
        },
        {
            "family": "AMBIGUOUS",
            "evidence": "A final fraction could arise from several hidden methods.",
            "immediateVisibleFeedback": "Use a neutral prompt and a fresh discriminating item.",
            "repairThreshold": "Classify only after visible structure, repeated pattern or response to feedback."
        }
    ],
    "evidenceRecord": {
        "fields": [
            "questionId",
            "stage",
            "firstAttemptCorrect",
            "attempts",
            "hintOpenedBeforeSubmit",
            "supportEscalated",
            "submittedResponse",
            "answerLocked",
            "errorFamilyWhenSupported",
            "assessmentFamily",
            "freshConfirmationPassed",
            "countsAsIndependentEvidence",
            "finalSlot",
            "contentVersion"
        ],
        "classificationCaution": "Do not infer a misconception from one ambiguous numeric answer. Use visible rewrite, exact known wrong value, repeated pattern and response to feedback."
    },
    "persistence": {
        "contentVersion": "FRA28-HANDOFF-V1",
        "persist": [
            "current phase/scene/question",
            "route decisions",
            "submitted and locked answers",
            "first-attempt evidence",
            "attempt counts",
            "hint-opened state",
            "pending confirmation or repair",
            "final evidence slots and recovery items",
            "active utterance ID",
            "audio position",
            "caption timing",
            "speech-led cue state"
        ],
        "migration": "On incompatible FRA28 state, preserve safe lesson-entry progress where possible, then reset to a coherent authored boundary. Never resume into a missing utterance, stale caption, orphan cue, revealed unanswered working or hint-assisted evidence marked independent."
    },
    "accessibilityAndResponsive": {
        "mobileWidthPx": 390,
        "rules": [
            "Keep the central fraction/measurement model dominant.",
            "Stack transformation lines vertically on mobile.",
            "Place the divisor tile below the strip when necessary.",
            "Keep fraction fields large and labels non-overlapping.",
            "Captions move above or below mathematics and remain 1-2 lines where possible.",
            "Keyboard order follows the visual task.",
            "Selected/locked/correct/incorrect states use shape, border or icon as well as colour.",
            "Pre-submit accessible descriptions state given quantities but never the group count, reciprocal or correct option.",
            "Reduced motion uses crossfades/immediate state reveals with identical mathematics.",
            "No permanent transcript bar."
        ]
    },
    "qa": {
        "runtimeCopyBoundary": [
            "Only FRA28_RUNTIME_COPY text reaches Ryan TTS.",
            "Ryan captions resolve from the same utterance ID and exact text.",
            "Visible prompts, hints, options, feedback and working are not automatically voiced.",
            "No author-only direction, route label or QA prose enters runtime copy."
        ],
        "outcomeParity": [
            "Compute correctness before selecting feedback.",
            "Play exactly one correct, matching error-specific incorrect or default incorrect branch.",
            "A wrong response never plays a correct line.",
            "Correct and incorrect visible feedback are distinct.",
            "Do not add generic praise or a paraphrase after canonical feedback."
        ],
        "captionCueParity": [
            "Every cue references an existing utterance and an exact anchor phrase.",
            "Removing speech removes/remaps its caption and all cues.",
            "Replay/resume restores matching audio, caption and visual state.",
            "No orphan highlight remains."
        ],
        "mathChecks": [
            "Every divisor is a non-zero positive fraction.",
            "The stored reciprocal is the divisor with numerator and denominator swapped.",
            "Every quotient equals dividend × reciprocal exactly.",
            "Equivalent exact fractions are accepted; mixed numbers are not.",
            "No hidden simplest-form requirement.",
            "All measurement diagrams use exact equal sections and context units."
        ],
        "leakageChecks": [
            "G1 does not number the five fitting units before submit.",
            "G2/F1/M3 do not reveal the reciprocal before submit.",
            "I2/M5/C-CTX show one group-size object only before submit.",
            "Final and recovery items have no hint and no working before lock.",
            "Previous worked checks clear before the next scored item."
        ],
        "routeTests": [
            "Strong route skips F1 and keeps F2.",
            "Standard route includes F1 then F2.",
            "I1/I2 hint success routes to C-INT/C-CTX.",
            "Each repeated central error reaches its matching repair and fresh check.",
            "4-5/5, 3/5 and 0-2/5 routes match the authored rules.",
            "Response speed never controls routing."
        ],
        "semanticRepetition": [
            "Within each scene/branch, every Ryan line has a distinct communication goal.",
            "Correct feedback is not followed by another Ryan line restating the same result.",
            "Worked checks are visible unless an exact separate Ryan line was authored.",
            "No implementation-generated praise is inserted."
        ],
        "regression": [
            "FRA01-FRA27 lesson content remains unchanged.",
            "No later composite fraction lesson content is added.",
            "Shared changes are minimal and backwards-compatible.",
            "No Diagnostic layer is added.",
            "No Retrieval or spaced-review layer is added."
        ]
    },
    "conversionNotes": [
        "The approved storyboard is the source for all runtime speech included here. Final incorrect responses did not have exact item-specific Ryan lines, so they remain distinct visible feedback followed by post-lock working; no new Ryan speech was invented.",
        "The complete-script page expanded the G2 prompt to “with its reciprocal”; this canonical registry uses that fuller approved wording and binds cues to it.",
        "The storyboard specified a repeated reciprocal-form refresher but not exact fresh values. R-RECIPROCAL-CHECK instantiates 7/11 -> 11/7 as a minimal within-scope confirmation; it does not reteach the whole FRA-26 lesson.",
        "Recovery item formats are instantiated to preserve the five authored recovery values while replacing the corresponding failed evidence family.",
        "The storyboard file is copied into the handoff package as Revily_FRA28_Storyboard_v1.pdf without changing its content."
    ]
};
function normaliseFraction(value) {
    if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
        throw new Error("Fraction values must be integers.");
    }
    if (value.denominator === 0)
        throw new Error("Denominator cannot be zero.");
    const sign = value.denominator < 0 ? -1 : 1;
    let a = Math.abs(value.numerator);
    let b = Math.abs(value.denominator);
    while (b !== 0) {
        const next = a % b;
        a = b;
        b = next;
    }
    const gcd = a || 1;
    return {
        numerator: (value.numerator * sign) / gcd,
        denominator: Math.abs(value.denominator) / gcd,
    };
}
function equivalentFractions(a, b) {
    if (a.denominator === 0 || b.denominator === 0)
        return false;
    return a.numerator * b.denominator === b.numerator * a.denominator;
}
function quotientOf(dividend, divisor) {
    if (divisor.numerator === 0)
        throw new Error("Cannot divide by zero.");
    return normaliseFraction({
        numerator: dividend.numerator * divisor.denominator,
        denominator: dividend.denominator * divisor.numerator,
    });
}
function chooseFRA28GuidedRoute(input) {
    return input.g1FirstAttemptCorrect &&
        input.g2FirstAttemptCorrect &&
        !input.supportEscalated &&
        !input.centralMisconceptionObserved &&
        !input.duplicateSubmission
        ? "fast_skip_f1_keep_f2"
        : "standard_f1_then_f2";
}
function confirmationAfterHint(questionId, hintOpenedBeforeSubmit, answerCorrect) {
    if (!hintOpenedBeforeSubmit || !answerCorrect)
        return null;
    if (questionId === "I1")
        return "C-INT";
    if (questionId === "I2")
        return "C-CTX";
    return null;
}
function decideFRA28FinalRoute(input) {
    if (!Number.isInteger(input.correctCount) || input.correctCount < 0 || input.correctCount > 5) {
        throw new Error("FRA28 final correctCount must be an integer from 0 to 5.");
    }
    if (input.correctCount >= 4 &&
        input.correctCount <= 5 &&
        !input.repeatedBlockingMisconception &&
        input.hasProceduralEvidence &&
        input.hasReasoningOrApplicationEvidence) {
        return "finish";
    }
    if (input.correctCount === 3 || input.correctCount >= 4) {
        return "repair_then_two_item_mini_check";
    }
    return "repair_then_three_item_final";
}
const PRIMARY_TO_RECOVERY = {
    M1: "RC1",
    M2: "RC2",
    M3: "RC3",
    M4: "RC4",
    M5: "RC5",
};
function selectFRA28RecoveryItems(failedPrimaryIds, requiredCount) {
    const mapped = [];
    for (const primaryId of ["M1", "M2", "M3", "M4", "M5"]) {
        if (!failedPrimaryIds.includes(primaryId))
            continue;
        const recoveryId = PRIMARY_TO_RECOVERY[primaryId];
        if (recoveryId && !mapped.includes(recoveryId))
            mapped.push(recoveryId);
    }
    for (const fallback of ["RC1", "RC2", "RC3", "RC4", "RC5"]) {
        if (mapped.length >= requiredCount)
            break;
        if (!mapped.includes(fallback))
            mapped.push(fallback);
    }
    return mapped.slice(0, requiredCount);
}
const BANNED_RUNTIME_PATTERNS = [
    /assessment intent/i,
    /author[- ]only/i,
    /support escalation/i,
    /error family/i,
    /route label/i,
    /quality assurance|\bQA\b/i,
    /implementation/i,
    /Codex/i,
    /answerLocked/i,
    /diagnostic layer/i,
    /retrieval layer/i,
    /student-facing field/i,
    /runtime copy/i,
    /caption source/i,
];
function collectRuntimeReferences(value, refs) {
    if (Array.isArray(value)) {
        for (const child of value)
            collectRuntimeReferences(child, refs);
        return;
    }
    if (!value || typeof value !== "object")
        return;
    for (const [key, child] of Object.entries(value)) {
        if (key === "utteranceId" && typeof child === "string")
            refs.add(child);
        if (key.toLowerCase().endsWith("utteranceids") && Array.isArray(child)) {
            for (const id of child)
                if (typeof id === "string")
                    refs.add(id);
        }
        collectRuntimeReferences(child, refs);
    }
}
function collectObjects(value, objects) {
    if (Array.isArray(value)) {
        for (const child of value)
            collectObjects(child, objects);
        return;
    }
    if (!value || typeof value !== "object")
        return;
    const object = value;
    objects.push(object);
    for (const child of Object.values(object))
        collectObjects(child, objects);
}
function allFRA28Questions() {
    return [
        ...exports.FRA28.questions,
        ...exports.FRA28.confirmations,
        ...exports.FRA28.repairChecks,
        ...exports.FRA28.recoveryBank,
    ];
}
function validateMathObject(question, errors) {
    const math = question.math;
    if (!math || typeof math !== "object") {
        errors.push(`${question.id}: missing math object.`);
        return;
    }
    if (math.kind === "reciprocal_only") {
        if (math.source.numerator !== math.reciprocal.denominator ||
            math.source.denominator !== math.reciprocal.numerator) {
            errors.push(`${question.id}: reciprocal-only check is inconsistent.`);
        }
        return;
    }
    if (math.kind !== "division_by_positive_fraction") {
        errors.push(`${question.id}: unknown math kind ${String(math.kind)}.`);
        return;
    }
    const dividend = math.dividend;
    const divisor = math.divisor;
    const reciprocal = math.reciprocalOfDivisor;
    const quotient = math.quotient;
    for (const [label, value] of Object.entries({ dividend, divisor, reciprocal, quotient })) {
        if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
            errors.push(`${question.id}: ${label} must use integer numerator and denominator.`);
        }
        if (value.denominator <= 0)
            errors.push(`${question.id}: ${label} denominator must be positive.`);
    }
    if (dividend.numerator <= 0 || divisor.numerator <= 0) {
        errors.push(`${question.id}: dividend and divisor must be positive.`);
    }
    if (reciprocal.numerator !== divisor.denominator ||
        reciprocal.denominator !== divisor.numerator) {
        errors.push(`${question.id}: stored reciprocal is not the divisor swapped.`);
    }
    const expected = quotientOf(dividend, divisor);
    if (!equivalentFractions(expected, quotient)) {
        errors.push(`${question.id}: quotient does not equal dividend × reciprocal.`);
    }
    const answer = question.answer;
    if (answer?.kind === "fraction" && !equivalentFractions(answer.value, quotient)) {
        errors.push(`${question.id}: fraction answer does not match quotient.`);
    }
    if (answer?.kind === "integer") {
        if (quotient.denominator !== 1 || quotient.numerator !== answer.value) {
            errors.push(`${question.id}: integer answer does not match quotient.`);
        }
    }
    if (answer?.kind === "reciprocal_and_quotient") {
        if (!equivalentFractions(answer.reciprocal, reciprocal)) {
            errors.push(`${question.id}: structured reciprocal answer is inconsistent.`);
        }
        if (!equivalentFractions(answer.quotient, quotient)) {
            errors.push(`${question.id}: structured quotient answer is inconsistent.`);
        }
    }
    if (answer?.kind === "choice_and_fraction") {
        if (!equivalentFractions(answer.quotient, quotient)) {
            errors.push(`${question.id}: choice-and-fraction quotient is inconsistent.`);
        }
    }
    if (answer?.kind === "range_and_fraction") {
        if (!equivalentFractions(answer.quotient, quotient)) {
            errors.push(`${question.id}: range-and-fraction quotient is inconsistent.`);
        }
    }
}
/**
 * Static self-audit for the handoff. Codex must reproduce equivalent tests in
 * the real Revily repository and still complete browser/audio/mobile QA.
 */
function validateFRA28CanonicalSpec() {
    const errors = [];
    const registry = exports.FRA28_RUNTIME_COPY;
    const runtimeEntries = Object.entries(registry);
    // 1. Runtime registry purity, exact duplicates and communication function.
    const seenText = new Map();
    const seenCommunicationGoals = new Map();
    for (const [id, utterance] of runtimeEntries) {
        if (utterance.audience !== "learner")
            errors.push(`${id}: runtime audience must be learner.`);
        if (utterance.spokenBy !== "Ryan")
            errors.push(`${id}: runtime speaker must be Ryan.`);
        if (utterance.captionSource !== "same_as_audio")
            errors.push(`${id}: captionSource must be same_as_audio.`);
        const communicationGoal = utterance.communicationGoal.trim();
        if (!communicationGoal) {
            errors.push(`${id}: communicationGoal is empty.`);
        }
        else {
            const previousGoal = seenCommunicationGoals.get(communicationGoal);
            if (previousGoal) {
                errors.push(`${id}: communicationGoal duplicates ${previousGoal}; review semantic repetition.`);
            }
            else {
                seenCommunicationGoals.set(communicationGoal, id);
            }
        }
        const normalised = utterance.text.trim().replace(/\s+/g, " ").toLowerCase();
        if (!normalised)
            errors.push(`${id}: runtime text is empty.`);
        const previous = seenText.get(normalised);
        if (previous)
            errors.push(`${id}: exact duplicate runtime text already used by ${previous}.`);
        else
            seenText.set(normalised, id);
        for (const pattern of BANNED_RUNTIME_PATTERNS) {
            if (pattern.test(utterance.text)) {
                errors.push(`${id}: runtime text contains authoring/engineering language (${pattern}).`);
            }
        }
    }
    // 2. Runtime references, cue anchors and no orphan utterances.
    const referenced = new Set();
    collectRuntimeReferences(exports.FRA28, referenced);
    collectRuntimeReferences(exports.FRA28_SYNC_CUES, referenced);
    for (const id of referenced) {
        if (!registry[id])
            errors.push(`Unknown runtime utterance reference: ${id}.`);
    }
    for (const cue of exports.FRA28_SYNC_CUES) {
        const utterance = registry[cue.utteranceId];
        if (!utterance)
            continue;
        if (!utterance.text.includes(cue.anchorText)) {
            errors.push(`${cue.id}: anchorText is not present in ${cue.utteranceId}.`);
        }
    }
    for (const [id] of runtimeEntries) {
        if (!referenced.has(id))
            errors.push(`${id}: runtime utterance is not intentionally referenced.`);
    }
    // 3. No independently authored caption copy.
    const objects = [];
    collectObjects(exports.FRA28, objects);
    for (const object of objects) {
        if (Object.prototype.hasOwnProperty.call(object, "captionText")) {
            errors.push("A separate captionText field exists; captions must derive from runtime copy.");
        }
    }
    // 4. Unique IDs and exact mathematics.
    const questions = allFRA28Questions();
    const questionIds = new Set();
    for (const question of questions) {
        if (questionIds.has(question.id))
            errors.push(`Duplicate question ID ${question.id}.`);
        questionIds.add(question.id);
        validateMathObject(question, errors);
        if (!question.policy?.commitResponseBeforeOutcome) {
            errors.push(`${question.id}: response must commit before outcome selection.`);
        }
        if (!question.policy?.answerLocksOnSubmit) {
            errors.push(`${question.id}: answer must lock on submit.`);
        }
        if (!question.feedback?.playExactlyOneOutcomeBranch) {
            errors.push(`${question.id}: outcome policy must play exactly one branch.`);
        }
        if (!question.feedback?.doNotPlayDefaultAfterSpecific) {
            errors.push(`${question.id}: default feedback must not follow error-specific feedback.`);
        }
        const correctText = question.feedback?.correct?.visibleText;
        const incorrectText = question.feedback?.incorrectDefault?.visibleText;
        if (!correctText || !incorrectText || correctText === incorrectText) {
            errors.push(`${question.id}: correct and incorrect visible outcomes must be distinct.`);
        }
        // FRA28 uses one concise Ryan outcome line at most. Any worked explanation
        // is a separate post-lock visible check unless an exact line was authored.
        const outcomeBranches = [
            question.feedback?.correct,
            question.feedback?.incorrectDefault,
            ...Object.values(question.feedback?.byErrorFamily ?? {}),
        ].filter(Boolean);
        const correctOutcomeIds = new Set(question.feedback?.correct?.utteranceIds ?? []);
        for (const branch of outcomeBranches) {
            const ids = branch.utteranceIds ?? [];
            if (ids.length > 1) {
                errors.push(`${question.id}: one outcome branch contains repeated Ryan lines.`);
            }
        }
        const incorrectBranches = [
            question.feedback?.incorrectDefault,
            ...Object.values(question.feedback?.byErrorFamily ?? {}),
        ].filter(Boolean);
        for (const branch of incorrectBranches) {
            for (const id of branch.utteranceIds ?? []) {
                if (correctOutcomeIds.has(id)) {
                    errors.push(`${question.id}: the same Ryan line is used for correct and incorrect outcomes.`);
                }
            }
        }
        if (!question.workedCheck?.requiresAnswerLocked) {
            errors.push(`${question.id}: worked check must require answer lock.`);
        }
        if (!question.workedCheck?.mustFollowOutcomeFeedback) {
            errors.push(`${question.id}: worked check must follow outcome feedback.`);
        }
        const isFinalLike = ["final", "replacement_final", "confirmation", "repair_check"].includes(question.stage);
        if (isFinalLike && question.policy.hintPolicy !== "none") {
            errors.push(`${question.id}: final/confirmation/recovery item must have no hint.`);
        }
        if (["final", "replacement_final"].includes(question.stage) && question.policy.solutionPolicy !== "after_locked_submit") {
            errors.push(`${question.id}: final/recovery working must be after locked submit.`);
        }
        if (question.id === "I1" && exports.FRA28.routing.hintConfirmations.I1 !== "C-INT") {
            errors.push("I1 hint confirmation mapping is wrong.");
        }
        if (question.id === "I2" && exports.FRA28.routing.hintConfirmations.I2 !== "C-CTX") {
            errors.push("I2 hint confirmation mapping is wrong.");
        }
    }
    // 5. Unique scene, cue and repair IDs; repair references resolve.
    for (const [label, values] of [
        ["scene", exports.FRA28.scenes],
        ["cue", exports.FRA28_SYNC_CUES],
        ["repair", exports.FRA28.repairs],
    ]) {
        const ids = new Set();
        for (const value of values) {
            if (ids.has(value.id))
                errors.push(`Duplicate ${label} ID ${value.id}.`);
            ids.add(value.id);
        }
    }
    for (const repair of exports.FRA28.repairs) {
        if (!questionIds.has(repair.freshCheckQuestionId)) {
            errors.push(`${repair.id}: fresh check ${repair.freshCheckQuestionId} is missing.`);
        }
    }
    // 6. Exhaustive route-helper and deterministic recovery assertions.
    const bools = [false, true];
    for (const g1FirstAttemptCorrect of bools) {
        for (const g2FirstAttemptCorrect of bools) {
            for (const supportEscalated of bools) {
                for (const centralMisconceptionObserved of bools) {
                    for (const duplicateSubmission of bools) {
                        const actual = chooseFRA28GuidedRoute({
                            g1FirstAttemptCorrect,
                            g2FirstAttemptCorrect,
                            supportEscalated,
                            centralMisconceptionObserved,
                            duplicateSubmission,
                        });
                        const expected = g1FirstAttemptCorrect &&
                            g2FirstAttemptCorrect &&
                            !supportEscalated &&
                            !centralMisconceptionObserved &&
                            !duplicateSubmission
                            ? "fast_skip_f1_keep_f2"
                            : "standard_f1_then_f2";
                        if (actual !== expected)
                            errors.push("Guided-route truth-table assertion failed.");
                    }
                }
            }
        }
    }
    for (const questionId of ["I1", "I2", "OTHER"]) {
        for (const hintOpened of bools) {
            for (const answerCorrect of bools) {
                const actual = confirmationAfterHint(questionId, hintOpened, answerCorrect);
                const expected = !hintOpened || !answerCorrect
                    ? null
                    : questionId === "I1"
                        ? "C-INT"
                        : questionId === "I2"
                            ? "C-CTX"
                            : null;
                if (actual !== expected)
                    errors.push(`Hint-confirmation assertion failed for ${questionId}.`);
            }
        }
    }
    for (let correctCount = 0; correctCount <= 5; correctCount += 1) {
        for (const repeatedBlockingMisconception of bools) {
            for (const hasProceduralEvidence of bools) {
                for (const hasReasoningOrApplicationEvidence of bools) {
                    const actual = decideFRA28FinalRoute({
                        correctCount,
                        repeatedBlockingMisconception,
                        hasProceduralEvidence,
                        hasReasoningOrApplicationEvidence,
                    });
                    const canFinish = correctCount >= 4 &&
                        !repeatedBlockingMisconception &&
                        hasProceduralEvidence &&
                        hasReasoningOrApplicationEvidence;
                    const expected = canFinish
                        ? "finish"
                        : correctCount >= 3
                            ? "repair_then_two_item_mini_check"
                            : "repair_then_three_item_final";
                    if (actual !== expected)
                        errors.push(`Final-route truth-table assertion failed at ${correctCount}/5.`);
                }
            }
        }
    }
    const primaryIds = ["M1", "M2", "M3", "M4", "M5"];
    const validRecoveryIds = new Set(["RC1", "RC2", "RC3", "RC4", "RC5"]);
    for (let mask = 0; mask < 1 << primaryIds.length; mask += 1) {
        const failed = primaryIds.filter((_, index) => Boolean(mask & (1 << index)));
        for (const requiredCount of [2, 3]) {
            const first = selectFRA28RecoveryItems(failed, requiredCount);
            const second = selectFRA28RecoveryItems(failed, requiredCount);
            if (first.join(",") !== second.join(","))
                errors.push("Recovery selection is not deterministic.");
            if (first.length !== requiredCount)
                errors.push("Recovery selection returned the wrong item count.");
            if (new Set(first).size !== first.length)
                errors.push("Recovery selection contains duplicate items.");
            if (first.some((id) => !validRecoveryIds.has(id)))
                errors.push("Recovery selection contains an unknown item.");
            const mappedFailed = failed.map((id) => PRIMARY_TO_RECOVERY[id]);
            const expectedPrefix = mappedFailed.slice(0, requiredCount);
            if (first.slice(0, expectedPrefix.length).join(",") !== expectedPrefix.join(",")) {
                errors.push("Recovery selection does not prioritise failed evidence slots.");
            }
        }
    }
    // 7. Authored route inventory.
    const expectedCoreIds = ["G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"];
    for (const id of expectedCoreIds) {
        if (!exports.FRA28.questions.some((q) => q.id === id))
            errors.push(`Missing core question ${id}.`);
    }
    for (const id of ["M1", "M2", "M3", "M4", "M5"]) {
        const q = exports.FRA28.questions.find((item) => item.id === id);
        if (!q || q.policy.hintPolicy !== "none")
            errors.push(`${id}: final item must have no hint.`);
    }
    if (exports.FRA28.routing.guidedGate.strongRoute.includes("F1"))
        errors.push("Strong route must skip F1.");
    if (!exports.FRA28.routing.guidedGate.strongRoute.includes("F2"))
        errors.push("Strong route must retain F2.");
    return errors;
}

  window.FRA28_RUNTIME_COPY = module.exports.FRA28_RUNTIME_COPY;
  window.RevilyFra28Approved = module.exports.FRA28;
  window.RevilyFra28Source = module.exports;
})();
