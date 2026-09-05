/* eslint-disable @next/next/no-assign-module-variable, @typescript-eslint/no-unused-expressions -- mechanically transpiled owner-approved canonical data */
(function () {
  "use strict";
  const exports = {};
  const module = { exports };
"use strict";
/**
 * FRA11_CANONICAL_SPEC.ts — owner-approved implementation handoff v1
 *
 * FRA-11 — Convert Improper Fractions to Mixed Numbers
 *
 * This file deliberately separates:
 *   1. exact learner-facing Ryan runtime copy;
 *   2. visible learner UI copy that is not automatically Ryan speech;
 *   3. author-only mathematics, visual, routing, evidence and QA metadata.
 *
 * HARD RUNTIME RULE
 * -----------------
 * Ryan may speak only FRA11_RUNTIME_COPY[utteranceId].text.
 * The Ryan caption must use the exact same utterance ID and exact same text.
 * Question prompts, options, button labels, worked-check text, route labels,
 * visual directions, pedagogy notes and QA prose are never automatically sent
 * to Ryan TTS or Ryan captions.
 *
 * Every speech-led visual cue references an utterance ID plus anchor text that
 * occurs inside that exact utterance. Removing or changing speech must remove
 * or remap its caption and cues; no orphan caption or highlight may remain.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRA11 = exports.FRA11_REPAIRS = exports.FRA11_QUESTIONS = exports.FRA11_TIMELINES = exports.FRA11_LEARNER_UI_COPY = exports.FRA11_RUNTIME_COPY = void 0;
exports.gcd = gcd;
exports.solveImproperFraction = solveImproperFraction;
exports.classifyMixedNumberResponse = classifyMixedNumberResponse;
exports.shouldSkipF1 = shouldSkipF1;
exports.routeFinalCheck = routeFinalCheck;
exports.validateFRA11CanonicalSpec = validateFRA11CanonicalSpec;
exports.assertFRA11CanonicalSpec = assertFRA11CanonicalSpec;
exports.FRA11_RUNTIME_COPY = {
    "HOOK.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "establish_quarter_metre_unit_and_total_tiles",
        "text": "Each blue tile is a quarter of a metre long. Thirteen tiles make this border.",
        "captionSource": "same_as_audio"
    },
    "HOOK.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "name_improper_fraction_as_correct_but_awkward",
        "text": "So the length is thirteen quarters of a metre. Correct — but awkward to picture.",
        "captionSource": "same_as_audio"
    },
    "HOOK.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "begin_regrouping_into_complete_metres",
        "text": "Let’s regroup the quarters into complete metres.",
        "captionSource": "same_as_audio"
    },
    "HOOK.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "count_three_complete_metres_and_one_leftover_quarter",
        "text": "Four quarters make one metre. Another four make two. Another four make three. One quarter is left.",
        "captionSource": "same_as_audio"
    },
    "HOOK.5": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "state_equivalent_mixed_number_form",
        "text": "Same length, clearer form: three and one quarter metres.",
        "captionSource": "same_as_audio"
    },
    "T1.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "connect_denominator_to_parts_per_whole",
        "text": "The denominator tells us how many parts make one whole. Here, five fifths make a whole.",
        "captionSource": "same_as_audio"
    },
    "T1.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "prioritise_complete_whole_grouping",
        "text": "Start with fourteen fifths. Fill complete wholes first.",
        "captionSource": "same_as_audio"
    },
    "T1.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "group_fourteen_fifths_into_two_wholes_and_four_leftovers",
        "text": "Five fifths make one. Another five fifths make two. Four fifths remain.",
        "captionSource": "same_as_audio"
    },
    "T1.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "name_fourteen_fifths_as_mixed_number",
        "text": "So fourteen fifths is two and four fifths.",
        "captionSource": "same_as_audio"
    },
    "T2.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "connect_visual_grouping_to_division_record",
        "text": "Drawing the pieces shows the idea. Division records the same grouping.",
        "captionSource": "same_as_audio"
    },
    "T2.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_division_with_remainder",
        "text": "Fourteen divided by five is two remainder four.",
        "captionSource": "same_as_audio"
    },
    "T2.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "map_quotient_to_whole_number",
        "text": "The quotient, two, is the number of full wholes.",
        "captionSource": "same_as_audio"
    },
    "T2.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "map_remainder_to_fractional_numerator",
        "text": "The remainder, four, is the leftover numerator.",
        "captionSource": "same_as_audio"
    },
    "T2.5": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "preserve_original_denominator",
        "text": "The denominator stays five because the leftover pieces are still fifths.",
        "captionSource": "same_as_audio"
    },
    "T3.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "remove_full_picture_and_move_to_symbolic_method",
        "text": "Now use the same move without a full picture.",
        "captionSource": "same_as_audio"
    },
    "T3.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "divide_numerator_by_denominator",
        "text": "Divide the numerator by the denominator: twenty-three divided by six is three remainder five.",
        "captionSource": "same_as_audio"
    },
    "T3.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "place_quotient_remainder_and_original_denominator",
        "text": "Write the quotient in front. Put the remainder over the original denominator.",
        "captionSource": "same_as_audio"
    },
    "T3.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "name_twenty_three_sixths_as_mixed_number",
        "text": "So twenty-three sixths is three and five sixths.",
        "captionSource": "same_as_audio"
    },
    "T4.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "introduce_remainder_validity_check",
        "text": "One quick check stops off-by-one answers.",
        "captionSource": "same_as_audio"
    },
    "T4.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "state_remainder_must_be_smaller_than_denominator",
        "text": "The remainder must be smaller than the denominator. If it is big enough for another whole, you have not finished grouping.",
        "captionSource": "same_as_audio"
    },
    "T4.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "regroup_invalid_three_remainder_seven",
        "text": "Three remainder seven cannot be the finished result for nineteen divided by four. Four of those seven quarters make another whole.",
        "captionSource": "same_as_audio"
    },
    "T4.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_valid_four_remainder_three_result",
        "text": "That leaves four remainder three, so nineteen quarters is four and three quarters.",
        "captionSource": "same_as_audio"
    },
    "T5.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "introduce_zero_remainder_case",
        "text": "Sometimes the division leaves nothing.",
        "captionSource": "same_as_audio"
    },
    "T5.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_exact_division",
        "text": "Eighteen divided by six is exactly three, remainder zero.",
        "captionSource": "same_as_audio"
    },
    "T5.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "require_whole_number_only_when_remainder_zero",
        "text": "When the remainder is zero, write the whole number only.",
        "captionSource": "same_as_audio"
    },
    "T5.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "name_eighteen_sixths_as_three",
        "text": "Eighteen sixths is three.",
        "captionSource": "same_as_audio"
    },
    "HANDOFF.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "link_visual_and_division_models",
        "text": "You’ve seen the picture and the division tell the same story.",
        "captionSource": "same_as_audio"
    },
    "HANDOFF.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "set_guided_then_faded_expectation",
        "text": "I’ll stay with you for two conversions. Then the support will start to fade.",
        "captionSource": "same_as_audio"
    },
    "G1.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "prompt_complete_groups_and_leftovers_without_leaking_counts",
        "text": "Each whole needs four quarters. Count the complete groups, then count what is left.",
        "captionSource": "same_as_audio"
    },
    "G1.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "confirm_two_wholes_and_three_quarters",
        "text": "Yes. Two complete groups of four quarters, with three quarters left. Eleven quarters is two and three quarters.",
        "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.GROUP": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "reject_partial_group_as_whole",
        "text": "That last group is not complete. A whole needs all four quarters.",
        "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.LEFTOVER": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "redirect_to_leftover_pieces",
        "text": "You found the full wholes. Now count the pieces that did not fit into a complete group.",
        "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.DENOM": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "preserve_quarter_denominator",
        "text": "Those leftover pieces are still quarters, so the denominator stays four.",
        "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.FIELDS": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "restore_whole_and_fraction_field_roles",
        "text": "The whole number goes in front. The leftover count goes on top of the fraction.",
        "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.DEFAULT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "request_neutral_group_recheck",
        "text": "Check the groups once more.",
        "captionSource": "same_as_audio"
    },
    "G2.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "prompt_group_count_and_leftover_without_leaking_values",
        "text": "Find how many full groups of five fit into seventeen, then the leftover.",
        "captionSource": "same_as_audio"
    },
    "F1.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "remove_grouping_picture_and_retain_division_structure",
        "text": "No full picture this time. Use the division structure.",
        "captionSource": "same_as_audio"
    },
    "F1.HINT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "guide_largest_multiple_and_gap",
        "text": "Find the largest multiple of seven that does not pass twenty-six. The gap is the remainder.",
        "captionSource": "same_as_audio"
    },
    "F2.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "signal_possible_whole_number_result_without_leaking_it",
        "text": "This one may finish with no fractional part.",
        "captionSource": "same_as_audio"
    },
    "F2.HINT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "guide_exact_group_count_and_zero_leftover",
        "text": "How many complete groups of six are in twenty-four? Is anything left?",
        "captionSource": "same_as_audio"
    },
    "INDEPENDENT.INTRO": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "hand_control_to_learner_and_explain_optional_hint",
        "text": "Now you take over. The hint is there only if you decide you need it.",
        "captionSource": "same_as_audio"
    },
    "I1.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "request_direct_conversion_and_remind_hint_is_optional",
        "text": "Convert the fraction. The hint is there only if you decide you need it.",
        "captionSource": "same_as_audio"
    },
    "I1.HINT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "guide_largest_multiple_and_remainder_for_twenty_nine_eighths",
        "text": "Find the largest multiple of eight below twenty-nine. The gap to twenty-nine is the remainder.",
        "captionSource": "same_as_audio"
    },
    "I2.PRE": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "request_error_analysis_without_revealing_correct_option",
        "text": "Read the student’s division, then decide which correction is mathematically sound.",
        "captionSource": "same_as_audio"
    },
    "I2.HINT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "redirect_attention_to_unchanged_part_size",
        "text": "The denominator names the piece size. Did the pieces stop being fifths?",
        "captionSource": "same_as_audio"
    },
    "FINAL.INTRO": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "establish_five_unsupported_final_items_and_post_lock_working",
        "text": "These last five are yours. No hints this time. Do the question first, then I’ll show you the working so you can check your thinking.",
        "captionSource": "same_as_audio"
    },
    "FINAL.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "acknowledge_then_open_post_lock_working",
        "text": "That’s right. Here’s the working so you can check.",
        "captionSource": "same_as_audio"
    },
    "FINAL.INCORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "redirect_then_open_post_lock_working",
        "text": "Not quite. Here’s the working — compare it with what you did.",
        "captionSource": "same_as_audio"
    },
    "COMPLETION": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "completion",
        "communicationGoal": "summarise_mastered_conversion_and_zero_remainder_case",
        "text": "Nice work. You can regroup an improper fraction into full wholes and a leftover fraction, and you know what to do when nothing is left. That’s FRA-11 done.",
        "captionSource": "same_as_audio"
    },
    "R-GROUP.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "restate_complete_group_requirement",
        "text": "A full whole needs a complete group of five fifths.",
        "captionSource": "same_as_audio"
    },
    "R-GROUP.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "show_three_complete_groups_and_two_leftovers",
        "text": "Three complete groups use fifteen fifths. The two pieces left cannot make another whole.",
        "captionSource": "same_as_audio"
    },
    "R-GROUP.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "name_seventeen_fifths_as_three_and_two_fifths",
        "text": "So seventeen fifths is three and two fifths.",
        "captionSource": "same_as_audio"
    },
    "R-LEFTOVER.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "separate_full_wholes_from_remaining_quantity",
        "text": "The quotient tells us the full wholes. It does not describe everything if pieces are left.",
        "captionSource": "same_as_audio"
    },
    "R-LEFTOVER.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "identify_one_fifth_left_after_twenty_five",
        "text": "Five complete groups use twenty-five fifths. One fifth remains.",
        "captionSource": "same_as_audio"
    },
    "R-LEFTOVER.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "use_actual_leftover_as_new_numerator",
        "text": "That one leftover piece becomes the new numerator — not the original twenty-six.",
        "captionSource": "same_as_audio"
    },
    "R-LEFTOVER.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "name_twenty_six_fifths_as_five_and_one_fifth",
        "text": "So twenty-six fifths is five and one fifth.",
        "captionSource": "same_as_audio"
    },
    "R-DENOM.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "preserve_sevenths_as_part_size",
        "text": "The leftover four pieces are sevenths. The denominator never changed.",
        "captionSource": "same_as_audio"
    },
    "R-DENOM.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "separate_quotient_from_part_size",
        "text": "The quotient two is a number of wholes, not a part size.",
        "captionSource": "same_as_audio"
    },
    "R-DENOM.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "name_eighteen_sevenths_as_two_and_four_sevenths",
        "text": "So eighteen sevenths is two and four sevenths.",
        "captionSource": "same_as_audio"
    },
    "R-FIELDS.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "acknowledge_right_numbers_in_wrong_roles",
        "text": "You have the right division numbers but put them into the wrong jobs.",
        "captionSource": "same_as_audio"
    },
    "R-FIELDS.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "place_quotient_as_whole_number",
        "text": "The quotient belongs in front as the whole number.",
        "captionSource": "same_as_audio"
    },
    "R-FIELDS.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "place_remainder_over_original_denominator",
        "text": "The remainder belongs on top of the fraction. The original denominator stays underneath.",
        "captionSource": "same_as_audio"
    },
    "R-ZERO.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "show_four_complete_wholes_from_thirty_two_eighths",
        "text": "Thirty-two eighths make four complete wholes.",
        "captionSource": "same_as_audio"
    },
    "R-ZERO.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "remove_fractional_part_when_nothing_left",
        "text": "There is no leftover piece, so there is no fractional part to write.",
        "captionSource": "same_as_audio"
    }
};
exports.FRA11_LEARNER_UI_COPY = {
    "surfacePolicy": {
        "questionPromptsAutoSpokenByRyan": false,
        "optionsAutoSpokenByRyan": false,
        "buttonLabelsAutoSpokenByRyan": false,
        "visibleFeedbackAutoSpokenByRyan": false,
        "hints": "Visible only after the learner opens Ask for a hint. The exact hint may also play as Ryan only when an explicit hint utterance ID is attached.",
        "screenReaderPolicy": "Semantic UI may be read by assistive technology without creating a Ryan audio/caption timeline."
    },
    "stageLabels": {
        "teach": "Learn the idea",
        "guided": "Try it with me",
        "faded": "Your turn",
        "independent": "Now you take over",
        "final": "Final check",
        "repair": "Let’s fix this part"
    },
    "controls": {
        "showRegrouping": "Show the regrouping",
        "checkAnswer": "Check answer",
        "askForHint": "Ask for a hint",
        "lockAnswer": "Lock answer",
        "continue": "Continue",
        "replay": "Replay"
    },
    "questionPrompts": {
        "G1": "Write 11/4 as a mixed number.",
        "G2": "Convert 17/5 to a mixed number.",
        "F1": "Convert 26/7 to a mixed number.",
        "F2": "Convert 24/6. If there is no remainder, enter a whole number.",
        "I1": "Write 29/8 as a mixed number.",
        "I2": "A student writes 21/5 = 4 1/4. Which response correctly fixes the conversion?",
        "C1": "Convert 34/9 to a mixed number.",
        "C2": "Convert 16/3 to a mixed number. Keep the original part size.",
        "M1": "Convert 31/6 to a mixed number.",
        "M2": "Write the shown fifth-sized pieces as a mixed number.",
        "M3": "Convert 40/8. Enter a whole number if the remainder is zero.",
        "M4": "Which complete line is correct?",
        "M5": "A student writes 23/5 = 4 3/4. What is the correct conversion?",
        "RG-C": "Convert 23/7 to a mixed number.",
        "RL-C": "Convert 19/6 to a mixed number.",
        "RD-C": "Convert 24/5 to a mixed number. Keep the original denominator.",
        "RF-C": "Convert 29/6 to a mixed number and place each value in its correct field.",
        "RZ-C": "Convert 42/7. Use the standard final form.",
        "MINI-1": "Convert 37/8 to a mixed number.",
        "MINI-2": "Convert 28/9 to a mixed number."
    },
    "options": {
        "I2": [
            {
                "id": "A",
                "text": "4 1/5 — the quotient is 4, the remainder is 1, and the parts are still fifths."
            },
            {
                "id": "B",
                "text": "5 1/4 — swap the quotient and the denominator."
            },
            {
                "id": "C",
                "text": "4 5/1 — turn the leftover fraction upside down."
            },
            {
                "id": "D",
                "text": "4 1/4 — the student’s answer is already correct."
            }
        ],
        "M4": [
            {
                "id": "A",
                "text": "27 ÷ 7 = 3 r6, so 27/7 = 3 6/7."
            },
            {
                "id": "B",
                "text": "27 ÷ 7 = 4 r1, so 27/7 = 4 1/7."
            },
            {
                "id": "C",
                "text": "27 ÷ 7 = 3 r6, so 27/7 = 3 6/3."
            },
            {
                "id": "D",
                "text": "27 ÷ 7 = 3 r7, so 27/7 = 3 7/7."
            }
        ],
        "M5": [
            {
                "id": "A",
                "text": "5 3/5"
            },
            {
                "id": "B",
                "text": "4 3/5"
            },
            {
                "id": "C",
                "text": "4 5/3"
            },
            {
                "id": "D",
                "text": "3 4/5"
            }
        ]
    },
    "visibleFeedback": {
        "G2_CORRECT": "Exactly. Seventeen divided by five is three remainder two, so seventeen fifths is three and two fifths.",
        "G2_QUOTIENT_HIGH": "Three groups use fifteen fifths. Four groups would need twenty.",
        "G2_REMAINDER_WRONG": "After fifteen fifths are grouped, how many of the seventeen are left?",
        "G2_DENOM_CHANGED": "The leftover pieces are fifths. Keep the denominator five.",
        "ARITH_NEUTRAL": "Check how many complete groups fit before the total is passed.",
        "F2_VALUE_CORRECT_FORM": "That has the same value, but the standard final form is the whole number 4.",
        "M3_ZERO_OVER_DENOM_FORM": "That has the same value, but the standard final form is the whole number 5.",
        "M3_WHOLE_PLUS_ONE_FORM": "The value is equivalent, but the requested standard final form is the whole number 5.",
        "R_GROUP_IMMEDIATE": "A whole needs a complete group of denominator-sized parts.",
        "R_LEFTOVER_IMMEDIATE": "Count what remains after the complete groups.",
        "R_DENOM_IMMEDIATE": "The leftover pieces are still the original part size.",
        "R_FIELDS_IMMEDIATE": "Quotient goes in front; remainder goes on top.",
        "R_ZERO_IMMEDIATE": "Nothing left means no fractional part."
    },
    "workedChecks": {
        "M1": [
            "31 ÷ 6 = 5 remainder 1.",
            "Quotient 5 becomes the whole number.",
            "Remainder 1 stays over denominator 6.",
            "31/6 = 5 1/6."
        ],
        "M2": [
            "Two complete groups of five pieces use ten fifth-sized pieces.",
            "Four fifth-sized pieces remain.",
            "The amount is 2 4/5."
        ],
        "M3": [
            "40 ÷ 8 = 5 remainder 0.",
            "Nothing is left, so no fractional part is written.",
            "40/8 = 5."
        ],
        "M4": [
            "Three groups of seven use 21.",
            "Six remain, and 6 is smaller than 7.",
            "The leftover pieces are sevenths.",
            "27/7 = 3 6/7."
        ],
        "M5": [
            "23 ÷ 5 = 4 remainder 3.",
            "The quotient is 4.",
            "The remainder is 3.",
            "The pieces remain fifths, so 23/5 = 4 3/5."
        ]
    },
    "accessibleDescriptions": {
        "HOOK": "A border made from equal blue tiles. Each tile is labelled as one quarter of a metre. The learner can explore each tile before regrouping.",
        "G1": "Eleven equal quarter-sized pieces are shown. No complete-group or leftover count is announced before submission.",
        "M2": "A collection of equal fifth-sized pieces. Each piece can be reached individually. The total and final grouping are not announced before submission.",
        "T4": "An invalid division result is shown first, followed by a regrouping state in which another complete group is formed.",
        "generalRule": "Descriptions expose the visible pieces, labels and controls but never state the quotient, remainder or final mixed number for a scored item."
    }
};
exports.FRA11_TIMELINES = {
    "HOOK": [
        {
            "cueId": "HOOK.CUE.QUARTER_UNIT",
            "utteranceId": "HOOK.1",
            "anchorText": "quarter of a metre",
            "action": "Reveal a bracket labelled ¼ m over exactly one blue tile.",
            "reducedMotionAction": "Show the bracket and label in the final visible state."
        },
        {
            "cueId": "HOOK.CUE.THIRTEEN",
            "utteranceId": "HOOK.1",
            "anchorText": "Thirteen tiles",
            "action": "Bring all thirteen equal tiles into the border, without grouping labels.",
            "reducedMotionAction": "Reveal all thirteen equal tiles at once."
        },
        {
            "cueId": "HOOK.CUE.IMPROPER",
            "utteranceId": "HOOK.2",
            "anchorText": "thirteen quarters",
            "action": "Reveal 13/4 m beside the ungrouped border.",
            "reducedMotionAction": "Reveal 13/4 m beside the ungrouped border."
        },
        {
            "cueId": "HOOK.CUE.REGROUP",
            "utteranceId": "HOOK.3",
            "anchorText": "complete metres",
            "action": "Prepare three empty whole-metre outlines, each sized for four quarter-metre tiles.",
            "reducedMotionAction": "Show the three whole-metre outlines."
        },
        {
            "cueId": "HOOK.CUE.GROUP_ONE",
            "utteranceId": "HOOK.4",
            "anchorText": "Four quarters make one metre",
            "action": "Move the first four tiles into the first whole-metre outline.",
            "reducedMotionAction": "Switch the first four tiles to the grouped-one state."
        },
        {
            "cueId": "HOOK.CUE.GROUP_TWO",
            "utteranceId": "HOOK.4",
            "anchorText": "Another four make two",
            "action": "Move the next four tiles into the second whole-metre outline.",
            "reducedMotionAction": "Switch the next four tiles to the grouped-two state."
        },
        {
            "cueId": "HOOK.CUE.GROUP_THREE",
            "utteranceId": "HOOK.4",
            "anchorText": "Another four make three",
            "action": "Move the next four tiles into the third whole-metre outline.",
            "reducedMotionAction": "Switch the next four tiles to the grouped-three state."
        },
        {
            "cueId": "HOOK.CUE.LEFTOVER",
            "utteranceId": "HOOK.4",
            "anchorText": "One quarter is left",
            "action": "Pulse only the thirteenth tile once and add a non-colour remainder outline.",
            "reducedMotionAction": "Apply the remainder outline to only the thirteenth tile."
        },
        {
            "cueId": "HOOK.CUE.MIXED_REVEAL",
            "utteranceId": "HOOK.5",
            "anchorText": "three and one quarter",
            "action": "Reveal 13/4 = 3 1/4 after the grouping is complete.",
            "reducedMotionAction": "Reveal 13/4 = 3 1/4 after the grouping is complete."
        }
    ],
    "T1": [
        {
            "cueId": "T1.CUE.PARTS_PER_WHOLE",
            "utteranceId": "T1.1",
            "anchorText": "five fifths make a whole",
            "action": "Outline a five-piece whole and reinforce the five equal fifth-sized pieces.",
            "reducedMotionAction": "Show the five-piece whole outline."
        },
        {
            "cueId": "T1.CUE.FIRST_WHOLE",
            "utteranceId": "T1.3",
            "anchorText": "Five fifths make one",
            "action": "Group the first five pieces into one whole.",
            "reducedMotionAction": "Switch the first five pieces to the first-whole state."
        },
        {
            "cueId": "T1.CUE.SECOND_WHOLE",
            "utteranceId": "T1.3",
            "anchorText": "Another five fifths make two",
            "action": "Group the next five pieces into a second identical whole.",
            "reducedMotionAction": "Switch the next five pieces to the second-whole state."
        },
        {
            "cueId": "T1.CUE.REMAINDER",
            "utteranceId": "T1.3",
            "anchorText": "Four fifths remain",
            "action": "Leave four pieces separate and add a remainder bracket.",
            "reducedMotionAction": "Show the four pieces with a remainder bracket."
        },
        {
            "cueId": "T1.CUE.RESULT",
            "utteranceId": "T1.4",
            "anchorText": "two and four fifths",
            "action": "Reveal 14/5 = 2 4/5 only after both wholes and the remainder are visible.",
            "reducedMotionAction": "Reveal 14/5 = 2 4/5."
        }
    ],
    "T2": [
        {
            "cueId": "T2.CUE.DIVISION",
            "utteranceId": "T2.2",
            "anchorText": "two remainder four",
            "action": "Reveal 14 ÷ 5 = 2 remainder 4.",
            "reducedMotionAction": "Reveal 14 ÷ 5 = 2 remainder 4."
        },
        {
            "cueId": "T2.CUE.QUOTIENT",
            "utteranceId": "T2.3",
            "anchorText": "quotient",
            "action": "Reveal the quotient label and connect 2 to the mixed-number whole field.",
            "reducedMotionAction": "Show the quotient label and connector."
        },
        {
            "cueId": "T2.CUE.REMAINDER",
            "utteranceId": "T2.4",
            "anchorText": "remainder",
            "action": "Reveal the remainder label and connect 4 to the fractional numerator.",
            "reducedMotionAction": "Show the remainder label and connector."
        },
        {
            "cueId": "T2.CUE.DENOMINATOR",
            "utteranceId": "T2.5",
            "anchorText": "denominator stays five",
            "action": "Reveal the original-denominator label and connect divisor 5 to the fractional denominator.",
            "reducedMotionAction": "Show the denominator label and connector."
        }
    ],
    "T3": [
        {
            "cueId": "T3.CUE.DIVIDE",
            "utteranceId": "T3.2",
            "anchorText": "twenty-three divided by six",
            "action": "Reveal 23 ÷ 6 = 3 remainder 5.",
            "reducedMotionAction": "Reveal 23 ÷ 6 = 3 remainder 5."
        },
        {
            "cueId": "T3.CUE.QUOTIENT_FIELD",
            "utteranceId": "T3.3",
            "anchorText": "quotient in front",
            "action": "Place 3 in the whole-number field.",
            "reducedMotionAction": "Show 3 in the whole-number field."
        },
        {
            "cueId": "T3.CUE.FRACTION_FIELD",
            "utteranceId": "T3.3",
            "anchorText": "remainder over the original denominator",
            "action": "Place 5 over the unchanged denominator 6.",
            "reducedMotionAction": "Show 5/6 beside the whole number."
        },
        {
            "cueId": "T3.CUE.RESULT",
            "utteranceId": "T3.4",
            "anchorText": "three and five sixths",
            "action": "Reveal 23/6 = 3 5/6.",
            "reducedMotionAction": "Reveal 23/6 = 3 5/6."
        }
    ],
    "T4": [
        {
            "cueId": "T4.CUE.INVALID",
            "utteranceId": "T4.3",
            "anchorText": "Three remainder seven",
            "action": "Show 19 ÷ 4 = 3 r7 under a clear NOT FINISHED label.",
            "reducedMotionAction": "Show the invalid state with a NOT FINISHED label."
        },
        {
            "cueId": "T4.CUE.REGROUP",
            "utteranceId": "T4.3",
            "anchorText": "Four of those seven quarters make another whole",
            "action": "Regroup four of the seven leftover quarters into one additional complete whole.",
            "reducedMotionAction": "Switch four leftovers into an additional whole."
        },
        {
            "cueId": "T4.CUE.VALID",
            "utteranceId": "T4.4",
            "anchorText": "four remainder three",
            "action": "Replace the invalid statement with 19 ÷ 4 = 4 r3 and show 3 < 4.",
            "reducedMotionAction": "Show the valid statement and 3 < 4."
        },
        {
            "cueId": "T4.CUE.RESULT",
            "utteranceId": "T4.4",
            "anchorText": "four and three quarters",
            "action": "Reveal 19/4 = 4 3/4.",
            "reducedMotionAction": "Reveal 19/4 = 4 3/4."
        }
    ],
    "T5": [
        {
            "cueId": "T5.CUE.EXACT_GROUPS",
            "utteranceId": "T5.2",
            "anchorText": "exactly three",
            "action": "Show exactly three complete groups of six sixth-sized pieces and no remainder group.",
            "reducedMotionAction": "Show the three complete groups and an empty remainder state."
        },
        {
            "cueId": "T5.CUE.ZERO",
            "utteranceId": "T5.2",
            "anchorText": "remainder zero",
            "action": "Reveal 18 ÷ 6 = 3 remainder 0.",
            "reducedMotionAction": "Reveal 18 ÷ 6 = 3 remainder 0."
        },
        {
            "cueId": "T5.CUE.WHOLE_ONLY",
            "utteranceId": "T5.3",
            "anchorText": "whole number only",
            "action": "Remove the fractional input slot and leave one whole-number result field.",
            "reducedMotionAction": "Switch to the whole-number-only result state."
        },
        {
            "cueId": "T5.CUE.RESULT",
            "utteranceId": "T5.4",
            "anchorText": "Eighteen sixths is three",
            "action": "Reveal 18/6 = 3.",
            "reducedMotionAction": "Reveal 18/6 = 3."
        }
    ],
    "R-GROUP": [
        {
            "cueId": "R-GROUP.CUE.COMPLETE",
            "utteranceId": "R-GROUP.1",
            "anchorText": "complete group of five fifths",
            "action": "Outline one complete group of five fifth-sized pieces.",
            "reducedMotionAction": "Show the complete five-piece outline."
        },
        {
            "cueId": "R-GROUP.CUE.THREE_WHOLES",
            "utteranceId": "R-GROUP.2",
            "anchorText": "Three complete groups",
            "action": "Box exactly three complete five-piece groups.",
            "reducedMotionAction": "Show exactly three boxed groups."
        },
        {
            "cueId": "R-GROUP.CUE.TWO_LEFT",
            "utteranceId": "R-GROUP.2",
            "anchorText": "two pieces left",
            "action": "Leave exactly two fifth-sized pieces outside the whole boxes.",
            "reducedMotionAction": "Show exactly two unboxed pieces."
        }
    ],
    "R-LEFTOVER": [
        {
            "cueId": "R-LEFTOVER.CUE.FADE_GROUPS",
            "utteranceId": "R-LEFTOVER.2",
            "anchorText": "twenty-five fifths",
            "action": "Fade the five complete groups while retaining their outlines.",
            "reducedMotionAction": "Dim the complete groups."
        },
        {
            "cueId": "R-LEFTOVER.CUE.ONE_LEFT",
            "utteranceId": "R-LEFTOVER.2",
            "anchorText": "One fifth remains",
            "action": "Keep exactly one fifth-sized piece active.",
            "reducedMotionAction": "Outline exactly one remaining piece."
        },
        {
            "cueId": "R-LEFTOVER.CUE.NUMERATOR",
            "utteranceId": "R-LEFTOVER.3",
            "anchorText": "new numerator",
            "action": "Move the visible leftover count 1 into the fractional numerator field.",
            "reducedMotionAction": "Show 1 in the fractional numerator field."
        }
    ],
    "R-DENOM": [
        {
            "cueId": "R-DENOM.CUE.PART_SIZE",
            "utteranceId": "R-DENOM.1",
            "anchorText": "sevenths",
            "action": "Reinforce the seventh-sized piece legend and the unchanged denominator 7.",
            "reducedMotionAction": "Outline the seventh-sized legend and denominator 7."
        },
        {
            "cueId": "R-DENOM.CUE.QUOTIENT",
            "utteranceId": "R-DENOM.2",
            "anchorText": "number of wholes",
            "action": "Connect quotient 2 to the whole-number field, not the denominator.",
            "reducedMotionAction": "Show the quotient-to-whole connector."
        }
    ],
    "R-FIELDS": [
        {
            "cueId": "R-FIELDS.CUE.QUOTIENT",
            "utteranceId": "R-FIELDS.2",
            "anchorText": "in front",
            "action": "Place the quotient into the whole-number field.",
            "reducedMotionAction": "Show the quotient in the whole-number field."
        },
        {
            "cueId": "R-FIELDS.CUE.REMAINDER",
            "utteranceId": "R-FIELDS.3",
            "anchorText": "on top of the fraction",
            "action": "Place the remainder into the fractional numerator.",
            "reducedMotionAction": "Show the remainder in the fractional numerator."
        },
        {
            "cueId": "R-FIELDS.CUE.DENOM",
            "utteranceId": "R-FIELDS.3",
            "anchorText": "denominator stays underneath",
            "action": "Keep the original denominator fixed underneath.",
            "reducedMotionAction": "Show the fixed original denominator."
        }
    ],
    "R-ZERO": [
        {
            "cueId": "R-ZERO.CUE.FOUR_WHOLES",
            "utteranceId": "R-ZERO.1",
            "anchorText": "four complete wholes",
            "action": "Show exactly four complete groups of eight eighth-sized pieces.",
            "reducedMotionAction": "Show exactly four complete groups."
        },
        {
            "cueId": "R-ZERO.CUE.NO_FRACTION",
            "utteranceId": "R-ZERO.2",
            "anchorText": "no fractional part",
            "action": "Remove the empty fractional slot and retain the whole number 4.",
            "reducedMotionAction": "Switch to the whole-number-only state."
        }
    ]
};
exports.FRA11_QUESTIONS = [
    {
        "id": "HOOK",
        "stage": "opening",
        "assessmentIntent": "Create the need for a clearer equivalent form",
        "evidenceFamily": "concept_need",
        "promptKey": null,
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 13,
            "denominator": 4,
            "quotient": 3,
            "remainder": 1
        },
        "response": {
            "kind": "none",
            "scored": false
        },
        "expected": {
            "whole": 3,
            "fractionNumerator": 1,
            "fractionDenominator": 4,
            "display": "3 1/4"
        },
        "visual": {
            "kind": "contextual_equal_pieces",
            "context": "quarter_metre_border_tiles",
            "unitLabel": "¼ m",
            "totalPieces": 13,
            "partsPerWhole": 4,
            "groupingAfterReveal": [
                4,
                4,
                4,
                1
            ],
            "preRevealGroupLabelsHidden": true
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [
            "HOOK.1",
            "HOOK.2",
            "HOOK.3",
            "HOOK.4",
            "HOOK.5"
        ],
        "outcomes": {},
        "workedCheck": {
            "revealWhen": "not_scored",
            "visibleSteps": [
                "13 quarter-metre tiles regroup as 4 + 4 + 4 + 1.",
                "13/4 m = 3 1/4 m."
            ]
        },
        "routes": {
            "next": "T1"
        }
    },
    {
        "id": "G1",
        "stage": "guided",
        "assessmentIntent": "Translate complete visual groups and leftovers into mixed-number fields",
        "evidenceFamily": "visual_grouping",
        "promptKey": "G1",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 11,
            "denominator": 4,
            "quotient": 2,
            "remainder": 3
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 4,
            "answerLock": true
        },
        "expected": {
            "whole": 2,
            "fractionNumerator": 3,
            "fractionDenominator": 4,
            "display": "2 3/4"
        },
        "visual": {
            "kind": "equal_pieces",
            "partName": "quarter-sized piece",
            "totalPieces": 11,
            "partsPerWhole": 4,
            "preSubmitGroupLabelsHidden": true,
            "postSubmitGrouping": [
                4,
                4,
                3
            ],
            "equalGeometryRequired": true
        },
        "hint": {
            "policy": "built_in_guided_cue",
            "startsCollapsed": false,
            "utteranceId": null,
            "visibleTextKey": null
        },
        "spokenBeforeUtteranceIds": [
            "G1.PRE"
        ],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "G1.CORRECT"
                ],
                "errorFamily": null
            },
            "knownIncorrect": [
                {
                    "signal": "whole_part_too_high_or_partial_group",
                    "runtimeUtteranceIds": [
                        "G1.INCORRECT.GROUP"
                    ],
                    "errorFamily": "R-GROUP"
                },
                {
                    "signal": "remainder_ignored",
                    "runtimeUtteranceIds": [
                        "G1.INCORRECT.LEFTOVER"
                    ],
                    "errorFamily": "R-LEFTOVER"
                },
                {
                    "signal": "denominator_changed",
                    "runtimeUtteranceIds": [
                        "G1.INCORRECT.DENOM"
                    ],
                    "errorFamily": "R-DENOM"
                },
                {
                    "signal": "whole_and_remainder_fields_swapped",
                    "runtimeUtteranceIds": [
                        "G1.INCORRECT.FIELDS"
                    ],
                    "errorFamily": "R-FIELDS"
                }
            ],
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "G1.INCORRECT.DEFAULT"
                ],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "Two complete groups of four use 8 quarter-sized pieces.",
                "Three quarter-sized pieces remain.",
                "11/4 = 2 3/4."
            ]
        },
        "routes": {
            "correct": "G2",
            "repeatedError": "matching_repair_then_fresh_check"
        }
    },
    {
        "id": "G2",
        "stage": "guided",
        "assessmentIntent": "Use quotient and remainder, then place them into the mixed-number roles",
        "evidenceFamily": "symbolic_bridge",
        "promptKey": "G2",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 17,
            "denominator": 5,
            "quotient": 3,
            "remainder": 2
        },
        "response": {
            "kind": "division_then_mixed",
            "editableFields": [
                "quotient",
                "remainder",
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 5,
            "linkedFromSingleMathObject": true,
            "answerLock": true
        },
        "expected": {
            "quotient": 3,
            "remainder": 2,
            "whole": 3,
            "fractionNumerator": 2,
            "fractionDenominator": 5,
            "display": "3 2/5"
        },
        "visual": {
            "kind": "linked_division_and_mixed_fields",
            "showFraction": "17/5",
            "showDivisor": 5,
            "groupingOverlayBeforeSubmit": false,
            "equalGeometryRequired": false
        },
        "hint": {
            "policy": "built_in_structure",
            "startsCollapsed": false,
            "utteranceId": null,
            "visibleTextKey": null
        },
        "spokenBeforeUtteranceIds": [
            "G2.PRE"
        ],
        "outcomes": {
            "correct": {
                "visibleFeedbackKey": "G2_CORRECT",
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "knownIncorrect": [
                {
                    "signal": "quotient_too_high",
                    "visibleFeedbackKey": "G2_QUOTIENT_HIGH",
                    "runtimeUtteranceIds": [],
                    "errorFamily": "R-GROUP"
                },
                {
                    "signal": "remainder_wrong",
                    "visibleFeedbackKey": "G2_REMAINDER_WRONG",
                    "runtimeUtteranceIds": [],
                    "errorFamily": "R-LEFTOVER"
                },
                {
                    "signal": "denominator_changed",
                    "visibleFeedbackKey": "G2_DENOM_CHANGED",
                    "runtimeUtteranceIds": [],
                    "errorFamily": "R-DENOM"
                }
            ],
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "17 ÷ 5 = 3 remainder 2.",
                "The quotient 3 is the whole-number part.",
                "The remainder 2 stays over denominator 5.",
                "17/5 = 3 2/5."
            ]
        },
        "routes": {
            "correct": "guided_gate",
            "repeatedError": "matching_repair_then_fresh_check"
        }
    },
    {
        "id": "F1",
        "stage": "faded",
        "assessmentIntent": "Complete an ordinary non-exact conversion with only the division structure retained",
        "evidenceFamily": "direct_conversion",
        "promptKey": "F1",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 26,
            "denominator": 7,
            "quotient": 3,
            "remainder": 5
        },
        "response": {
            "kind": "division_then_mixed",
            "editableFields": [
                "quotient",
                "remainder",
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 7,
            "linkedFromSingleMathObject": true,
            "answerLock": true
        },
        "expected": {
            "quotient": 3,
            "remainder": 5,
            "whole": 3,
            "fractionNumerator": 5,
            "fractionDenominator": 7,
            "display": "3 5/7"
        },
        "visual": {
            "kind": "division_structure_only",
            "showGroupingPicture": false,
            "fixedDenominator": 7
        },
        "hint": {
            "policy": "optional",
            "startsCollapsed": true,
            "utteranceId": "F1.HINT",
            "confirmationId": "C1",
            "countsAsWrong": false
        },
        "spokenBeforeUtteranceIds": [
            "F1.PRE"
        ],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "26 ÷ 7 = 3 remainder 5.",
                "26/7 = 3 5/7."
            ]
        },
        "routes": {
            "correctNoHint": "F2",
            "correctAfterHint": "F2_then_confirmation_before_final",
            "repeatedError": "matching_repair_then_fresh_check"
        }
    },
    {
        "id": "F2",
        "stage": "faded",
        "assessmentIntent": "Recognise that zero remainder produces a whole number in standard final form",
        "evidenceFamily": "exact_whole",
        "promptKey": "F2",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 24,
            "denominator": 6,
            "quotient": 4,
            "remainder": 0
        },
        "response": {
            "kind": "whole_number",
            "editableFields": [
                "whole"
            ],
            "acceptAlternativeStructuredInputForFormFeedback": true,
            "answerLock": true
        },
        "expected": {
            "whole": 4,
            "remainder": 0,
            "display": "4",
            "canonicalForm": "whole_number_only"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showMixedFractionSlots": false,
            "accessibleInputLabel": "whole-number answer field"
        },
        "hint": {
            "policy": "optional",
            "startsCollapsed": true,
            "utteranceId": "F2.HINT",
            "confirmationId": "RZ-C",
            "countsAsWrong": false
        },
        "spokenBeforeUtteranceIds": [
            "F2.PRE"
        ],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "valueCorrectNoncanonical": {
                "visibleFeedbackKey": "F2_VALUE_CORRECT_FORM",
                "runtimeUtteranceIds": [],
                "errorFamily": null,
                "evidence": "supported_form_issue"
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "R_ZERO_IMMEDIATE",
                "runtimeUtteranceIds": [],
                "errorFamily": "R-ZERO"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "24 ÷ 6 = 4 remainder 0.",
                "Nothing is left, so 24/6 = 4."
            ]
        },
        "routes": {
            "correctNoHint": "I1",
            "correctAfterHint": "I1_then_confirmation_before_final",
            "repeatedError": "R-ZERO_then_RZ-C"
        }
    },
    {
        "id": "I1",
        "stage": "independent",
        "assessmentIntent": "Demonstrate direct symbolic conversion without a displayed method",
        "evidenceFamily": "direct_conversion",
        "promptKey": "I1",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 29,
            "denominator": 8,
            "quotient": 3,
            "remainder": 5
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 8,
            "answerLock": true
        },
        "expected": {
            "whole": 3,
            "fractionNumerator": 5,
            "fractionDenominator": 8,
            "display": "3 5/8"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": {
            "policy": "optional",
            "startsCollapsed": true,
            "utteranceId": "I1.HINT",
            "confirmationId": "C1",
            "countsAsWrong": false
        },
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "29 ÷ 8 = 3 remainder 5.",
                "29/8 = 3 5/8."
            ]
        },
        "routes": {
            "correctNoHint": "I2",
            "correctAfterHint": "I2_then_C1",
            "repeatedError": "matching_repair_then_fresh_check"
        }
    },
    {
        "id": "I2",
        "stage": "independent",
        "assessmentIntent": "Correct a denominator-change error while preserving quotient and remainder roles",
        "evidenceFamily": "error_analysis",
        "promptKey": "I2",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 21,
            "denominator": 5,
            "quotient": 4,
            "remainder": 1
        },
        "response": {
            "kind": "multiple_choice",
            "optionsKey": "I2",
            "answerLock": true
        },
        "expected": {
            "optionId": "A",
            "whole": 4,
            "fractionNumerator": 1,
            "fractionDenominator": 5,
            "display": "4 1/5"
        },
        "visual": {
            "kind": "student_claim_and_options",
            "studentClaim": "21/5 = 4 1/4",
            "optionsKey": "I2"
        },
        "hint": {
            "policy": "optional",
            "startsCollapsed": true,
            "utteranceId": "I2.HINT",
            "confirmationId": "C2",
            "countsAsWrong": false
        },
        "spokenBeforeUtteranceIds": [
            "I2.PRE"
        ],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "knownIncorrect": [
                {
                    "optionId": "B",
                    "visibleFeedbackKey": "R_FIELDS_IMMEDIATE",
                    "runtimeUtteranceIds": [],
                    "errorFamily": "R-FIELDS"
                },
                {
                    "optionId": "C",
                    "visibleFeedbackKey": "R_DENOM_IMMEDIATE",
                    "runtimeUtteranceIds": [],
                    "errorFamily": "R-DENOM"
                },
                {
                    "optionId": "D",
                    "visibleFeedbackKey": "R_DENOM_IMMEDIATE",
                    "runtimeUtteranceIds": [],
                    "errorFamily": "R-DENOM"
                }
            ],
            "defaultIncorrect": {
                "visibleFeedbackKey": "R_DENOM_IMMEDIATE",
                "runtimeUtteranceIds": [],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "21 ÷ 5 = 4 remainder 1.",
                "The quotient is 4 and the remainder is 1.",
                "The pieces are still fifths, so 21/5 = 4 1/5."
            ]
        },
        "routes": {
            "correctNoHint": "independent_gate",
            "correctAfterHint": "C2_before_final",
            "repeatedError": "R-DENOM_then_RD-C"
        }
    },
    {
        "id": "C1",
        "stage": "confirmation",
        "assessmentIntent": "Confirm direct conversion independently after supported success",
        "evidenceFamily": "direct_conversion",
        "promptKey": "C1",
        "copyAuthority": "authored_confirmation_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 34,
            "denominator": 9,
            "quotient": 3,
            "remainder": 7
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 9,
            "answerLock": true
        },
        "expected": {
            "whole": 3,
            "fractionNumerator": 7,
            "fractionDenominator": 9,
            "display": "3 7/9"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "34 ÷ 9 = 3 remainder 7.",
                "34/9 = 3 7/9."
            ]
        },
        "routes": {
            "correct": "final_intro",
            "incorrect": "matching_repair_then_fresh_check"
        }
    },
    {
        "id": "C2",
        "stage": "confirmation",
        "assessmentIntent": "Confirm denominator preservation independently after supported error analysis",
        "evidenceFamily": "denominator_reasoning",
        "promptKey": "C2",
        "copyAuthority": "authored_confirmation_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 16,
            "denominator": 3,
            "quotient": 5,
            "remainder": 1
        },
        "response": {
            "kind": "mixed_number_full_fraction",
            "editableFields": [
                "whole",
                "fractionNumerator",
                "fractionDenominator"
            ],
            "answerLock": true
        },
        "expected": {
            "whole": 5,
            "fractionNumerator": 1,
            "fractionDenominator": 3,
            "display": "5 1/3"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "R_DENOM_IMMEDIATE",
                "runtimeUtteranceIds": [],
                "errorFamily": "R-DENOM"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "16 ÷ 3 = 5 remainder 1.",
                "The leftover piece is still a third.",
                "16/3 = 5 1/3."
            ]
        },
        "routes": {
            "correct": "final_intro",
            "incorrect": "R-DENOM_then_RD-C"
        }
    },
    {
        "id": "M1",
        "stage": "final",
        "assessmentIntent": "Fresh unsupported direct procedural conversion",
        "evidenceFamily": "direct_conversion",
        "promptKey": "M1",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 31,
            "denominator": 6,
            "quotient": 5,
            "remainder": 1
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 6,
            "answerLock": true
        },
        "expected": {
            "whole": 5,
            "fractionNumerator": 1,
            "fractionDenominator": 6,
            "display": "5 1/6"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "FINAL.CORRECT"
                ],
                "errorFamily": null
            },
            "knownIncorrect": [
                {
                    "signal": "whole_part_six",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-GROUP"
                },
                {
                    "signal": "quotient_only_five",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-LEFTOVER"
                },
                {
                    "signal": "denominator_changed",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-DENOM"
                }
            ],
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleStepsKey": "M1"
        },
        "routes": {
            "next": "M2"
        }
    },
    {
        "id": "M2",
        "stage": "final",
        "assessmentIntent": "Fresh unsupported visual regrouping without a stated numerator",
        "evidenceFamily": "visual_grouping",
        "promptKey": "M2",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 14,
            "denominator": 5,
            "quotient": 2,
            "remainder": 4
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 5,
            "answerLock": true
        },
        "expected": {
            "whole": 2,
            "fractionNumerator": 4,
            "fractionDenominator": 5,
            "display": "2 4/5"
        },
        "visual": {
            "kind": "equal_pieces",
            "partName": "fifth-sized piece",
            "totalPieces": 14,
            "partsPerWhole": 5,
            "preSubmitGroupLabelsHidden": true,
            "preSubmitTotalAnnouncementForbidden": true,
            "postSubmitGrouping": [
                5,
                5,
                4
            ],
            "eachPieceKeyboardFocusable": true,
            "pieceAccessibleName": "fifth-sized piece",
            "equalGeometryRequired": true
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "FINAL.CORRECT"
                ],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleStepsKey": "M2"
        },
        "routes": {
            "next": "M3"
        }
    },
    {
        "id": "M3",
        "stage": "final",
        "assessmentIntent": "Fresh unsupported exact whole-number case",
        "evidenceFamily": "exact_whole",
        "promptKey": "M3",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 40,
            "denominator": 8,
            "quotient": 5,
            "remainder": 0
        },
        "response": {
            "kind": "whole_number",
            "editableFields": [
                "whole"
            ],
            "acceptAlternativeStructuredInputForFormFeedback": true,
            "answerLock": true
        },
        "expected": {
            "whole": 5,
            "remainder": 0,
            "display": "5",
            "canonicalForm": "whole_number_only"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showMixedFractionSlots": false,
            "accessibleInputLabel": "whole-number answer field"
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "FINAL.CORRECT"
                ],
                "errorFamily": null
            },
            "valueCorrectZeroFraction": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "visibleFeedbackKey": "M3_ZERO_OVER_DENOM_FORM",
                "errorFamily": null,
                "evidence": "form_issue_not_mastery"
            },
            "valueCorrectWholePlusOne": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "visibleFeedbackKey": "M3_WHOLE_PLUS_ONE_FORM",
                "errorFamily": null,
                "evidence": "form_issue_not_mastery"
            },
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "errorFamily": "R-ZERO"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleStepsKey": "M3"
        },
        "routes": {
            "next": "M4"
        }
    },
    {
        "id": "M4",
        "stage": "final",
        "assessmentIntent": "Match a valid quotient-remainder line to a correctly formed mixed number",
        "evidenceFamily": "reasoning_match",
        "promptKey": "M4",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 27,
            "denominator": 7,
            "quotient": 3,
            "remainder": 6
        },
        "response": {
            "kind": "multiple_choice",
            "optionsKey": "M4",
            "answerLock": true
        },
        "expected": {
            "optionId": "A",
            "whole": 3,
            "fractionNumerator": 6,
            "fractionDenominator": 7,
            "display": "3 6/7"
        },
        "visual": {
            "kind": "division_line_options",
            "optionsKey": "M4"
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "FINAL.CORRECT"
                ],
                "errorFamily": null
            },
            "knownIncorrect": [
                {
                    "optionId": "B",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-GROUP"
                },
                {
                    "optionId": "C",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-DENOM"
                },
                {
                    "optionId": "D",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-GROUP"
                }
            ],
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleStepsKey": "M4"
        },
        "routes": {
            "next": "M5"
        }
    },
    {
        "id": "M5",
        "stage": "final",
        "assessmentIntent": "Correct a denominator-change misconception in a fresh claim",
        "evidenceFamily": "error_analysis",
        "promptKey": "M5",
        "copyAuthority": "storyboard_exact_or_direct_template",
        "math": {
            "numerator": 23,
            "denominator": 5,
            "quotient": 4,
            "remainder": 3
        },
        "response": {
            "kind": "multiple_choice",
            "optionsKey": "M5",
            "answerLock": true
        },
        "expected": {
            "optionId": "B",
            "whole": 4,
            "fractionNumerator": 3,
            "fractionDenominator": 5,
            "display": "4 3/5"
        },
        "visual": {
            "kind": "student_claim_and_options",
            "studentClaim": "23/5 = 4 3/4",
            "optionsKey": "M5"
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "FINAL.CORRECT"
                ],
                "errorFamily": null
            },
            "knownIncorrect": [
                {
                    "optionId": "A",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-GROUP"
                },
                {
                    "optionId": "C",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-DENOM"
                },
                {
                    "optionId": "D",
                    "runtimeUtteranceIds": [
                        "FINAL.INCORRECT"
                    ],
                    "errorFamily": "R-FIELDS"
                }
            ],
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleStepsKey": "M5"
        },
        "routes": {
            "next": "final_routing"
        }
    },
    {
        "id": "RG-C",
        "stage": "repair_check",
        "assessmentIntent": "Confirm complete-group count after R-GROUP",
        "evidenceFamily": "visual_grouping",
        "promptKey": "RG-C",
        "copyAuthority": "authored_repair_check_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 23,
            "denominator": 7,
            "quotient": 3,
            "remainder": 2
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 7,
            "answerLock": true
        },
        "expected": {
            "whole": 3,
            "fractionNumerator": 2,
            "fractionDenominator": 7,
            "display": "3 2/7"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": "R-GROUP"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "23 ÷ 7 = 3 remainder 2.",
                "23/7 = 3 2/7."
            ]
        },
        "routes": {
            "correct": "return_to_preserved_checkpoint",
            "incorrect": "repeat_targeted_support_once_then_new_fresh_check"
        }
    },
    {
        "id": "RL-C",
        "stage": "repair_check",
        "assessmentIntent": "Confirm leftover count after R-LEFTOVER",
        "evidenceFamily": "leftover_reasoning",
        "promptKey": "RL-C",
        "copyAuthority": "authored_repair_check_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 19,
            "denominator": 6,
            "quotient": 3,
            "remainder": 1
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 6,
            "answerLock": true
        },
        "expected": {
            "whole": 3,
            "fractionNumerator": 1,
            "fractionDenominator": 6,
            "display": "3 1/6"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": "R-LEFTOVER"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "19 ÷ 6 = 3 remainder 1.",
                "19/6 = 3 1/6."
            ]
        },
        "routes": {
            "correct": "return_to_preserved_checkpoint",
            "incorrect": "repeat_targeted_support_once_then_new_fresh_check"
        }
    },
    {
        "id": "RD-C",
        "stage": "repair_check",
        "assessmentIntent": "Confirm original denominator is preserved",
        "evidenceFamily": "denominator_reasoning",
        "promptKey": "RD-C",
        "copyAuthority": "authored_repair_check_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 24,
            "denominator": 5,
            "quotient": 4,
            "remainder": 4
        },
        "response": {
            "kind": "mixed_number_full_fraction",
            "editableFields": [
                "whole",
                "fractionNumerator",
                "fractionDenominator"
            ],
            "answerLock": true
        },
        "expected": {
            "whole": 4,
            "fractionNumerator": 4,
            "fractionDenominator": 5,
            "display": "4 4/5"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": "R-DENOM"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "24 ÷ 5 = 4 remainder 4.",
                "24/5 = 4 4/5."
            ]
        },
        "routes": {
            "correct": "return_to_preserved_checkpoint",
            "incorrect": "repeat_targeted_support_once_then_new_fresh_check"
        }
    },
    {
        "id": "RF-C",
        "stage": "repair_check",
        "assessmentIntent": "Confirm quotient and remainder field roles",
        "evidenceFamily": "field_roles",
        "promptKey": "RF-C",
        "copyAuthority": "authored_repair_check_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 29,
            "denominator": 6,
            "quotient": 4,
            "remainder": 5
        },
        "response": {
            "kind": "mixed_number_full_fraction",
            "editableFields": [
                "whole",
                "fractionNumerator",
                "fractionDenominator"
            ],
            "answerLock": true
        },
        "expected": {
            "whole": 4,
            "fractionNumerator": 5,
            "fractionDenominator": 6,
            "display": "4 5/6"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": "R-FIELDS"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "29 ÷ 6 = 4 remainder 5.",
                "29/6 = 4 5/6."
            ]
        },
        "routes": {
            "correct": "return_to_preserved_checkpoint",
            "incorrect": "repeat_targeted_support_once_then_new_fresh_check"
        }
    },
    {
        "id": "RZ-C",
        "stage": "repair_check",
        "assessmentIntent": "Confirm whole-number-only form after zero remainder",
        "evidenceFamily": "exact_whole",
        "promptKey": "RZ-C",
        "copyAuthority": "authored_repair_check_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 42,
            "denominator": 7,
            "quotient": 6,
            "remainder": 0
        },
        "response": {
            "kind": "whole_number",
            "editableFields": [
                "whole"
            ],
            "acceptAlternativeStructuredInputForFormFeedback": true,
            "answerLock": true
        },
        "expected": {
            "whole": 6,
            "remainder": 0,
            "display": "6",
            "canonicalForm": "whole_number_only"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "visibleFeedbackKey": "ARITH_NEUTRAL",
                "runtimeUtteranceIds": [],
                "errorFamily": "R-ZERO"
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "42 ÷ 7 = 6 remainder 0.",
                "42/7 = 6."
            ]
        },
        "routes": {
            "correct": "return_to_preserved_checkpoint",
            "incorrect": "repeat_targeted_support_once_then_new_fresh_check"
        }
    },
    {
        "id": "MINI-1",
        "stage": "recovery_final",
        "assessmentIntent": "Fresh direct recovery evidence",
        "evidenceFamily": "direct_conversion",
        "promptKey": "MINI-1",
        "copyAuthority": "authored_recovery_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 37,
            "denominator": 8,
            "quotient": 4,
            "remainder": 5
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 8,
            "answerLock": true
        },
        "expected": {
            "whole": 4,
            "fractionNumerator": 5,
            "fractionDenominator": 8,
            "display": "4 5/8"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "FINAL.CORRECT"
                ],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "37 ÷ 8 = 4 remainder 5.",
                "37/8 = 4 5/8."
            ]
        },
        "routes": {
            "next": "recovery_sequence"
        }
    },
    {
        "id": "MINI-2",
        "stage": "recovery_final",
        "assessmentIntent": "Fresh reasoning recovery evidence",
        "evidenceFamily": "reasoning_confirmation",
        "promptKey": "MINI-2",
        "copyAuthority": "authored_recovery_bank_with_canonical_direct_prompt_template",
        "math": {
            "numerator": 28,
            "denominator": 9,
            "quotient": 3,
            "remainder": 1
        },
        "response": {
            "kind": "mixed_number_fixed_denominator",
            "editableFields": [
                "whole",
                "fractionNumerator"
            ],
            "fixedDenominator": 9,
            "answerLock": true
        },
        "expected": {
            "whole": 3,
            "fractionNumerator": 1,
            "fractionDenominator": 9,
            "display": "3 1/9"
        },
        "visual": {
            "kind": "symbolic_fraction",
            "showDivisionBeforeSubmit": false,
            "showGroupingBeforeSubmit": false
        },
        "hint": null,
        "spokenBeforeUtteranceIds": [],
        "outcomes": {
            "correct": {
                "runtimeUtteranceIds": [
                    "FINAL.CORRECT"
                ],
                "errorFamily": null
            },
            "defaultIncorrect": {
                "runtimeUtteranceIds": [
                    "FINAL.INCORRECT"
                ],
                "errorFamily": null
            }
        },
        "workedCheck": {
            "revealWhen": "answerLocked",
            "visibleSteps": [
                "28 ÷ 9 = 3 remainder 1.",
                "The leftover piece is still a ninth.",
                "28/9 = 3 1/9."
            ]
        },
        "routes": {
            "next": "recovery_sequence"
        }
    }
];
exports.FRA11_REPAIRS = {
    "R-GROUP": {
        "title": "Only complete groups become wholes",
        "trigger": "Repeated off-by-one whole count, a partial final group counted as whole, or remainder at least denominator.",
        "runtimeUtteranceIds": [
            "R-GROUP.1",
            "R-GROUP.2",
            "R-GROUP.3"
        ],
        "supportedInteraction": "Learner boxes three complete groups of five in 17 fifths; the last two cannot be boxed as a whole.",
        "freshCheckId": "RG-C",
        "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-LEFTOVER": {
        "title": "The remainder is what is actually left",
        "trigger": "Repeated quotient-only answers or reuse of the original numerator as the leftover numerator.",
        "runtimeUtteranceIds": [
            "R-LEFTOVER.1",
            "R-LEFTOVER.2",
            "R-LEFTOVER.3",
            "R-LEFTOVER.4"
        ],
        "supportedInteraction": "Fade the twenty-five grouped fifths, keep one fifth active, and let the learner place 1 in the fractional numerator.",
        "freshCheckId": "RL-C",
        "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-DENOM": {
        "title": "The part size stays fixed",
        "trigger": "Repeated denominator replacement, remainder placed over quotient, or equivalent denominator-change evidence across items.",
        "runtimeUtteranceIds": [
            "R-DENOM.1",
            "R-DENOM.2",
            "R-DENOM.3"
        ],
        "supportedInteraction": "Connect quotient 2 to the whole-number field and keep denominator 7 under the leftover 4.",
        "freshCheckId": "RD-C",
        "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-FIELDS": {
        "title": "Put each value in its job",
        "trigger": "Repeated quotient/remainder role swap that is not explained by an input-focus slip.",
        "runtimeUtteranceIds": [
            "R-FIELDS.1",
            "R-FIELDS.2",
            "R-FIELDS.3"
        ],
        "supportedInteraction": "Place quotient in front, remainder on top, and original denominator underneath.",
        "freshCheckId": "RF-C",
        "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-ZERO": {
        "title": "Nothing left means no fractional part",
        "trigger": "Repeated invented remainder, numerically wrong exact-division result, or persistent noncanonical fractional form after feedback.",
        "runtimeUtteranceIds": [
            "R-ZERO.1",
            "R-ZERO.2"
        ],
        "supportedInteraction": "Show four complete groups of eight with no remainder group, then switch to a whole-number-only answer state.",
        "freshCheckId": "RZ-C",
        "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "ARITH": {
        "title": "Arithmetic-only handling",
        "trigger": "Correct mixed-number structure with one division-fact slip.",
        "runtimeUtteranceIds": [],
        "visibleFeedbackKey": "ARITH_NEUTRAL",
        "supportedInteraction": "Reveal a small grouping model for that item only if the same fact remains inaccessible.",
        "freshCheckId": "Select a new item with a different division fact.",
        "checkpointPolicy": "Do not classify one arithmetic slip as a conversion misconception and do not restart the lesson."
    }
};
/**
 * Architecture-neutral lesson object. Codex must map this onto the existing
 * Revily lesson infrastructure rather than building a parallel lesson engine.
 */
exports.FRA11 = {
    "id": "FRA11",
    "displayId": "FRA-11",
    "title": "Convert Improper Fractions to Mixed Numbers",
    "status": "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
    "handoffVersion": "v1",
    "contentVersion": "fra11-canonical-handoff-v1",
    "sourceOfTruth": {
        "runtimeCopyQuestionDataRoutingAndValidation": "FRA11_CANONICAL_SPEC.ts",
        "visualGeometryLayoutAndOwnerPedagogy": "Revily_FRA-11_Storyboard_v1.pdf",
        "engineeringIntegrationAndAcceptance": "FRA11_CODEX_IMPLEMENTATION_PROMPT.md",
        "launchInstruction": "FRA11_START_CODEX_PROMPT.txt",
        "criticalPrecedenceRule": "Ryan speech, Ryan captions, outcome branches, question values, expected answers, routes and cue anchors come from this TypeScript file. The PDF remains the visual and owner-facing pedagogy reference. Never transcribe PDF headings, notes, stage directions or QA prose into Ryan speech.",
        "engineeringReference": "Existing canonical Revily FRA lesson shell, TTS/caption timeline, evidence, hints, answer locking, persistence, accessibility and equal-piece renderers."
    },
    "scope": {
        "objective": "Convert a positive improper fraction to an equivalent mixed number by division and remainder.",
        "studentFacingIdea": "Build every complete whole first. The leftover parts stay the same size.",
        "prerequisites": [
            "FRA-02 numerator and denominator roles",
            "FRA-06 proper, improper and mixed-form recognition",
            "Whole-number division facts with remainder"
        ],
        "teaches": [
            "Regroup an improper fraction into complete wholes and leftover fractional parts.",
            "Connect visual grouping to whole-number division with a remainder.",
            "Use the quotient as the whole-number part.",
            "Use the remainder as the fractional numerator.",
            "Keep the original denominator because the part size has not changed.",
            "Use a whole number only when the remainder is zero."
        ],
        "excluded": [
            "FRA-12 mixed number to improper fraction",
            "Mixed-number operations",
            "Negative improper fractions or mixed numbers",
            "General simplification as the target",
            "Decimal or percentage conversion",
            "Comparing or ordering mixed numbers",
            "Algebraic fractions",
            "Global Diagnostic",
            "Retrieval or spaced review"
        ],
        "pilotLimits": {
            "positiveValuesOnly": true,
            "denominatorMin": 2,
            "denominatorMax": 12,
            "numeratorMax": 60,
            "nonZeroRemaindersAlreadyCoprimeToDenominator": true
        },
        "fra10Required": false
    },
    "mentalModel": [
        "Read the part size: the denominator tells how many parts make one whole.",
        "Build complete wholes using denominator-sized groups.",
        "Count leftovers: the remainder cannot fill another whole.",
        "Write the mixed number: quotient in front, remainder over the original denominator."
    ],
    "mathematicalInvariant": "The amount and part size do not change. Only the way the same quantity is named changes.",
    "runtimeSurfaceContract": {
        "onlySourceForRyanSpeech": "FRA11_RUNTIME_COPY",
        "onlySourceForRyanCaptions": "The exact text of the same FRA11_RUNTIME_COPY entry used for audio.",
        "captionRule": "No separately authored caption string. Word timing is derived from the active utterance text.",
        "questionPromptSpeechPolicy": "Visible prompts, options and button labels are not automatically voiced by Ryan. Semantic UI remains available to assistive technology.",
        "hintPolicy": "A hint starts collapsed. It is not marked wrong. Where a hint utterance ID exists, the exact hint may play only after the learner opens the hint.",
        "workedCheckSpeechPolicy": "Final worked-check steps are visible and accessible after answer lock. They are not Ryan speech unless a future owner-approved runtime utterance ID is explicitly added.",
        "authorOnlyPolicy": "Stage directions, visual instructions, route labels, communicationGoal fields, QA prose and implementation notes never enter learner runtime copy.",
        "cuePolicy": "Every cue uses utteranceId plus anchorText contained in that utterance. Audio, caption and cue state are restored together on replay, resume and refresh."
    },
    "route": {
        "orderedTeaching": [
            "HOOK",
            "T1",
            "T2",
            "T3",
            "T4",
            "T5",
            "HANDOFF"
        ],
        "guided": [
            "G1",
            "G2"
        ],
        "strongGuidedGate": {
            "allRequired": [
                "G1 first-attempt correct",
                "G2 first-attempt correct",
                "no support escalation",
                "no central misconception signal"
            ],
            "trueRoute": [
                "skip F1",
                "F2"
            ],
            "falseRoute": [
                "F1",
                "F2"
            ],
            "speedMayNotQualify": true
        },
        "independent": [
            "I1",
            "I2"
        ],
        "independentEntryNarrationPolicy": {
            "normalEntryUtteranceIds": [
                "INDEPENDENT.INTRO"
            ],
            "resumeDirectlyAtI1UtteranceIds": [
                "I1.PRE"
            ],
            "neverPlayConsecutively": [
                [
                    "INDEPENDENT.INTRO",
                    "I1.PRE"
                ]
            ],
            "reason": "Both lines perform the same hint-availability function; normal entry uses the stage handoff, while direct resume uses the item line."
        },
        "hintConfirmationMap": {
            "F1": "C1",
            "F2": "RZ-C",
            "I1": "C1",
            "I2": "C2"
        },
        "supportedSuccessRule": "Correct after a hint is supported success, not mastery evidence. Require one fresh no-hint same-family confirmation before final.",
        "repeatedMissRule": "Run the matching repair, then its authored fresh check. Return to the preserved checkpoint; never restart the whole lesson.",
        "final": [
            "M1",
            "M2",
            "M3",
            "M4",
            "M5"
        ],
        "finalRouting": {
            "4_or_5_correct": "Finish only if direct procedural evidence and at least one visual/reasoning/error-analysis family are present and no blocking misconception repeats.",
            "3_correct": "Repair the missed family, then give a fresh two-item mini-check; require 2/2.",
            "0_to_2_correct": "Repair actual weaknesses, then give a fresh three-item final; require 3/3 and no repeated blocker."
        },
        "masteryEvidence": [
            "At least 4/5 first-attempt independent in the primary final set, or successful authored recovery.",
            "Accepted evidence includes direct procedural conversion and at least one visual, reasoning or error-analysis family.",
            "No blocking FRA-11 misconception appears twice in the accepted evidence set.",
            "Supported responses do not count as mastery evidence."
        ],
        "completionUtteranceId": "COMPLETION"
    },
    "misconceptions": {
        "R-GROUP": {
            "meaning": "Off-by-one grouping or a partial final group counted as a whole.",
            "possibleEvidence": [
                "whole part too high",
                "remainder at least denominator",
                "partial final group counted as whole"
            ],
            "immediateFeedbackKey": "R_GROUP_IMMEDIATE",
            "classificationThreshold": "One miss may be arithmetic; repeat or paired structural evidence triggers repair."
        },
        "R-LEFTOVER": {
            "meaning": "Remainder ignored or original numerator reused.",
            "possibleEvidence": [
                "only quotient entered",
                "original numerator copied into fractional numerator"
            ],
            "immediateFeedbackKey": "R_LEFTOVER_IMMEDIATE",
            "classificationThreshold": "Trigger when leftover is omitted or misidentified twice."
        },
        "R-DENOM": {
            "meaning": "Original denominator changed.",
            "possibleEvidence": [
                "remainder placed over quotient",
                "denominator replaced"
            ],
            "immediateFeedbackKey": "R_DENOM_IMMEDIATE",
            "classificationThreshold": "One option press may be ambiguous; require repeat or matching direct evidence."
        },
        "R-FIELDS": {
            "meaning": "Quotient and remainder roles swapped.",
            "possibleEvidence": [
                "quotient entered as fractional numerator",
                "remainder placed in front"
            ],
            "immediateFeedbackKey": "R_FIELDS_IMMEDIATE",
            "classificationThreshold": "Trigger after repeated role structure, not a focus slip."
        },
        "R-ZERO": {
            "meaning": "Exact whole mishandled.",
            "possibleEvidence": [
                "invented remainder",
                "unnecessary fractional part retained as final form"
            ],
            "immediateFeedbackKey": "R_ZERO_IMMEDIATE",
            "classificationThreshold": "Usually form feedback; repair only if repeated or value is wrong."
        },
        "ARITH": {
            "meaning": "Whole-number division slip with otherwise correct structure.",
            "possibleEvidence": [
                "correct field roles but incorrect quotient or remainder arithmetic"
            ],
            "immediateFeedbackKey": "ARITH_NEUTRAL",
            "classificationThreshold": "Never label one arithmetic slip as a conversion misconception."
        }
    },
    "repairs": "FRA11_REPAIRS",
    "recoveryPolicy": {
        "authoredRecoveryItems": [
            "MINI-1",
            "MINI-2"
        ],
        "freshPool": [
            "C1",
            "C2",
            "RG-C",
            "RL-C",
            "RD-C",
            "RF-C",
            "RZ-C",
            "MINI-1",
            "MINI-2"
        ],
        "twoItemMiniCheck": {
            "count": 2,
            "selection": "Choose two unseen items that cover the repaired family and a second FRA-11 evidence family. Prefer MINI-1 and MINI-2 when both remain unseen.",
            "passRule": "2/2, no blocking misconception."
        },
        "threeItemFreshFinal": {
            "count": 3,
            "sourceGapResolution": "The storyboard specifies a fresh three-item final but names only MINI-1 and MINI-2 as generic recovery items. Do not silently reuse a seen item. Select three unseen authored items from the fresh pool, targeted to the missed families. If fewer than three suitable unseen authored items remain, deterministically generate only the missing item count under the published generator constraints.",
            "generatorConstraints": {
                "denominatorMin": 2,
                "denominatorMax": 12,
                "numeratorMax": 60,
                "positiveImproperOnly": true,
                "remainderRule": "0 <= remainder < denominator",
                "nonZeroRemainderCoprimeToDenominator": true,
                "excludePreviouslySeenNumeratorDenominatorPairs": true,
                "excludeDuplicateRepresentationsWithinRecovery": true
            },
            "passRule": "3/3, direct procedure plus at least one non-direct family, and no repeated blocker."
        }
    },
    "responseFormPolicy": {
        "nonZeroRemainder": "Canonical answer is quotient plus remainder over the original denominator. All authored non-zero remainders are already coprime.",
        "zeroRemainder": "Canonical answer is the whole number only.",
        "explicitExactWholeEquivalentHandling": "Forms such as 4 0/6 or 4 8/8 may be value-equivalent, but are not canonical final form. Give concise form feedback, do not classify one occurrence as a blocking misconception, and do not count it as clean mastery evidence.",
        "otherEquivalentNoncanonicalMixedForms": "The storyboard does not define a general policy. Reuse an existing owner-approved global exact-rational form policy only if it preserves this lesson boundary; otherwise report the conflict before broadening acceptance."
    },
    "questionData": "FRA11_QUESTIONS",
    "timelineData": "FRA11_TIMELINES",
    "learnerUiCopy": "FRA11_LEARNER_UI_COPY",
    "responsive": {
        "desktopAndMobileInspectionRequired": true,
        "mobileReferenceWidthPx": 390,
        "oneDominantMathModelAtATime": true,
        "pieceWrappingRule": "Grouped pieces may wrap by complete whole, but counts, part size and grouping membership must not change.",
        "inputRule": "Mixed-number fields remain legible and keyboard reachable; fixed denominator cannot become editable accidentally.",
        "captionPlacement": "Move captions above or below the active mathematics rather than covering it.",
        "touchTargetMinimumPxWherePractical": 44
    },
    "accessibility": {
        "keyboardPath": true,
        "visibleFocus": true,
        "nonColourStateCues": true,
        "semanticAnswerLockAnnouncement": true,
        "accessibleVisualDescriptionsDoNotSolveScoredItems": true,
        "m2PieceExploration": "Each piece announces only 'fifth-sized piece'; the total and final grouping are not announced before submit.",
        "reducedMotion": "Replace movement with equivalent state changes while preserving exact mathematical states.",
        "captions": "Word-for-word from active Ryan audio; no permanent transcript bar.",
        "screenReaderSpeechBoundary": "Assistive technology may read semantic UI; this does not turn visible strings into Ryan narration."
    },
    "evidenceSchema": [
        "firstAttemptCorrect",
        "attempts",
        "hintOpenedBeforeSubmit",
        "supportLevel",
        "errorFamily",
        "answerLocked",
        "evidenceFamily",
        "responseFormClassification"
    ],
    "qaContracts": {
        "runtimeCopyBoundary": [
            "Only FRA11_RUNTIME_COPY text reaches Ryan TTS or Ryan captions.",
            "No separate caption copy exists.",
            "Question prompts, options, buttons, visible working and author-only fields are never automatically spoken.",
            "A user-opened hint plays only its explicit hint utterance ID."
        ],
        "audioCaptionCueParity": [
            "Audio, captions and visual cues resolve the same utterance ID.",
            "Every anchor phrase occurs in the exact utterance.",
            "Removing or changing an utterance without remapping cues fails validation.",
            "Pause, replay, skip, resume and refresh restore matching audio, caption word position and mathematical cue state.",
            "No orphan caption, highlight or stale cue survives a route skip or content-version migration."
        ],
        "outcomeBranching": [
            "Compute correctness before selecting feedback.",
            "Play exactly one correct, matching error-specific incorrect or default incorrect branch.",
            "A wrong response never plays correct feedback.",
            "Correct and incorrect branches are distinct.",
            "Final working remains hidden until answerLocked is true."
        ],
        "semanticRepetition": [
            "Do not add generic praise before or after canonical feedback.",
            "INDEPENDENT.INTRO and I1.PRE are never played consecutively.",
            "The shared final acknowledgement is followed by item-specific visible working, not another paraphrase of the answer.",
            "No exact duplicate sentence exists in FRA11_RUNTIME_COPY."
        ],
        "mathematics": [
            "For every authored fraction, numerator = denominator × quotient + remainder.",
            "0 <= remainder < denominator.",
            "Every non-zero authored remainder is coprime to its denominator.",
            "Every complete visual whole contains exactly denominator equal pieces.",
            "Hook is exactly 13 quarter-metre tiles grouped 4 + 4 + 4 + 1.",
            "M2 is exactly 14 fifth-sized pieces with no pre-submit total or grouping labels."
        ],
        "route": [
            "Strong guided route skips F1 but retains F2.",
            "Hint-assisted success triggers the mapped fresh no-hint confirmation.",
            "Repeated errors trigger matching repair and fresh check.",
            "Recovery returns to the preserved checkpoint.",
            "4–5/5, 3/5 and 0–2/5 final routes follow the authored thresholds."
        ],
        "regression": [
            "FRA01–FRA10 lesson content remains unchanged.",
            "FRA12+ lesson content remains unchanged.",
            "Any shared-engine change is minimal, backwards-compatible and reported.",
            "No Diagnostic or Retrieval layer is added."
        ]
    }
};
function gcd(a, b) {
    let x = Math.abs(Math.trunc(a));
    let y = Math.abs(Math.trunc(b));
    while (y !== 0) {
        const next = x % y;
        x = y;
        y = next;
    }
    return x;
}
function solveImproperFraction(numerator, denominator) {
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
        throw new Error("FRA11 accepts integer numerator and denominator values.");
    }
    if (numerator <= 0 || denominator <= 0 || numerator < denominator) {
        throw new Error("FRA11 solveImproperFraction requires a positive improper fraction.");
    }
    const whole = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;
    return { whole, remainder, denominator };
}
/**
 * Classifies only the response-form behaviour explicitly supported by FRA-11.
 * General acceptance of noncanonical equivalent mixed forms is intentionally
 * not invented here.
 */
function classifyMixedNumberResponse(params) {
    const solution = solveImproperFraction(params.numerator, params.denominator);
    const responseNumerator = params.response.fractionNumerator;
    const responseDenominator = params.response.fractionDenominator;
    if (solution.remainder === 0) {
        if (params.response.whole === solution.whole &&
            responseNumerator === undefined &&
            responseDenominator === undefined) {
            return "canonical_correct";
        }
        if (Number.isInteger(responseNumerator) &&
            Number.isInteger(responseDenominator) &&
            responseDenominator > 0) {
            const left = (params.response.whole * responseDenominator +
                responseNumerator) *
                params.denominator;
            const right = params.numerator * responseDenominator;
            if (left === right) {
                return "value_correct_noncanonical_exact_whole";
            }
        }
        return "incorrect";
    }
    if (params.response.whole === solution.whole &&
        responseNumerator === solution.remainder &&
        responseDenominator === params.denominator) {
        return "canonical_correct";
    }
    if (Number.isInteger(responseNumerator) &&
        Number.isInteger(responseDenominator) &&
        responseDenominator > 0) {
        const left = (params.response.whole * responseDenominator +
            responseNumerator) *
            params.denominator;
        const right = params.numerator * responseDenominator;
        if (left === right) {
            return "value_correct_noncanonical_policy_unresolved";
        }
    }
    return "incorrect";
}
function shouldSkipF1(params) {
    return (params.g1FirstAttemptCorrect &&
        params.g2FirstAttemptCorrect &&
        !params.supportEscalated &&
        !params.centralMisconceptionObserved);
}
function routeFinalCheck(params) {
    if (params.correctCount >= 4 &&
        params.hasDirectProceduralEvidence &&
        params.hasVisualReasoningOrErrorAnalysisEvidence &&
        !params.repeatedBlockingMisconception) {
        return "finish_candidate";
    }
    if (params.correctCount === 3) {
        return "targeted_repair_then_two_item_check";
    }
    return "targeted_repair_then_fresh_three_item_final";
}
const BANNED_RUNTIME_PATTERNS = [
    /author[- ]only/i,
    /implementation/i,
    /codex/i,
    /runtime copy/i,
    /assessment intent/i,
    /route label/i,
    /render(?:er|ing)?/i,
    /timeline cue/i,
    /stage label/i,
    /scored item/i,
    /pedagog(?:y|ical)/i,
    /strip away the story/i,
    /show the screen/i,
    /animate the/i,
    /highlight the/i,
];
function collectObjectValues(value, out) {
    if (Array.isArray(value)) {
        value.forEach((item) => collectObjectValues(item, out));
        return;
    }
    if (!value || typeof value !== "object")
        return;
    out.push(value);
    Object.values(value).forEach((child) => collectObjectValues(child, out));
}
function collectRuntimeIds(value, out) {
    if (Array.isArray(value)) {
        value.forEach((item) => collectRuntimeIds(item, out));
        return;
    }
    if (!value || typeof value !== "object")
        return;
    for (const [key, child] of Object.entries(value)) {
        if ((key === "utteranceId" || key.endsWith("UtteranceId")) &&
            typeof child === "string") {
            out.push(child);
        }
        if (key.endsWith("UtteranceIds") &&
            Array.isArray(child) &&
            child.every((id) => typeof id === "string")) {
            out.push(...child);
        }
        collectRuntimeIds(child, out);
    }
}
function hasKeyRecursively(value, forbiddenKey) {
    if (Array.isArray(value)) {
        return value.some((item) => hasKeyRecursively(item, forbiddenKey));
    }
    if (!value || typeof value !== "object")
        return false;
    for (const [key, child] of Object.entries(value)) {
        if (key === forbiddenKey)
            return true;
        if (hasKeyRecursively(child, forbiddenKey))
            return true;
    }
    return false;
}
/**
 * Canonical self-audit. Codex must add equivalent repository tests and run
 * this function against the exact file that is integrated.
 */
function validateFRA11CanonicalSpec() {
    const errors = [];
    const registry = exports.FRA11_RUNTIME_COPY;
    const runtimeEntries = Object.entries(registry);
    const runtimeTexts = new Map();
    for (const [id, utterance] of runtimeEntries) {
        if (!utterance.text.trim()) {
            errors.push(`${id}: runtime text is empty.`);
        }
        if (utterance.captionSource !== "same_as_audio") {
            errors.push(`${id}: captions must derive from the exact audio text.`);
        }
        if (utterance.audience !== "learner" || utterance.spokenBy !== "Ryan") {
            errors.push(`${id}: invalid learner/Ryan runtime boundary.`);
        }
        const priorId = runtimeTexts.get(utterance.text);
        if (priorId) {
            errors.push(`${id}: exact duplicate runtime sentence also used by ${priorId}.`);
        }
        else {
            runtimeTexts.set(utterance.text, id);
        }
        for (const pattern of BANNED_RUNTIME_PATTERNS) {
            if (pattern.test(utterance.text)) {
                errors.push(`${id}: authoring or implementation language leaked into runtime text.`);
            }
        }
    }
    const cueIds = new Set();
    for (const [timelineId, cues] of Object.entries(exports.FRA11_TIMELINES)) {
        for (const cue of cues) {
            if (cueIds.has(cue.cueId)) {
                errors.push(`${timelineId}: duplicate cue ID ${cue.cueId}.`);
            }
            cueIds.add(cue.cueId);
            const utterance = registry[cue.utteranceId];
            if (!utterance) {
                errors.push(`${cue.cueId}: missing utterance ${cue.utteranceId}.`);
                continue;
            }
            if (!utterance.text.includes(cue.anchorText)) {
                errors.push(`${cue.cueId}: anchor text is not present in ${cue.utteranceId}.`);
            }
        }
    }
    const referencedRuntimeIds = [];
    collectRuntimeIds(exports.FRA11_QUESTIONS, referencedRuntimeIds);
    collectRuntimeIds(exports.FRA11_REPAIRS, referencedRuntimeIds);
    collectRuntimeIds(exports.FRA11_TIMELINES, referencedRuntimeIds);
    for (const id of referencedRuntimeIds) {
        if (!registry[id]) {
            errors.push(`Referenced runtime utterance does not exist: ${id}.`);
        }
    }
    const questionIds = new Set();
    const questionMap = new Map();
    for (const rawQuestion of exports.FRA11_QUESTIONS) {
        const question = rawQuestion;
        if (questionIds.has(question.id)) {
            errors.push(`Duplicate question ID: ${question.id}.`);
        }
        questionIds.add(question.id);
        questionMap.set(question.id, question);
        if (question.math) {
            const { numerator, denominator, quotient, remainder } = question.math;
            if (denominator < 2 || denominator > 12) {
                errors.push(`${question.id}: denominator outside FRA11 limits.`);
            }
            if (numerator > 60 || numerator < denominator) {
                errors.push(`${question.id}: numerator outside positive improper limits.`);
            }
            if (numerator !== denominator * quotient + remainder) {
                errors.push(`${question.id}: n = d × q + r failed.`);
            }
            if (remainder < 0 || remainder >= denominator) {
                errors.push(`${question.id}: remainder is outside 0 <= r < d.`);
            }
            if (remainder !== 0 && gcd(remainder, denominator) !== 1) {
                errors.push(`${question.id}: non-zero remainder is not coprime to denominator.`);
            }
            const expected = question.expected;
            if (typeof expected.whole === "number" &&
                expected.whole !== quotient) {
                errors.push(`${question.id}: expected whole does not equal quotient.`);
            }
            if (typeof expected.fractionNumerator === "number" &&
                expected.fractionNumerator !== remainder) {
                errors.push(`${question.id}: expected fractional numerator does not equal remainder.`);
            }
            if (typeof expected.fractionDenominator === "number" &&
                expected.fractionDenominator !== denominator) {
                errors.push(`${question.id}: expected fractional denominator changed.`);
            }
        }
        if (question.stage === "final") {
            if (question.hint !== null) {
                errors.push(`${question.id}: final items must not have hints.`);
            }
            const worked = question.workedCheck;
            if (worked.revealWhen !== "answerLocked") {
                errors.push(`${question.id}: final working must reveal only after answer lock.`);
            }
            const outcomes = question.outcomes;
            const correct = outcomes.correct;
            const incorrect = outcomes.defaultIncorrect;
            const correctIds = Array.isArray(correct?.runtimeUtteranceIds)
                ? correct?.runtimeUtteranceIds
                : [];
            const incorrectIds = Array.isArray(incorrect?.runtimeUtteranceIds)
                ? incorrect?.runtimeUtteranceIds
                : [];
            if (correctIds.length > 0 &&
                incorrectIds.length > 0 &&
                correctIds.join("|") === incorrectIds.join("|")) {
                errors.push(`${question.id}: correct and incorrect branches are identical.`);
            }
        }
        if (question.hint && question.hint.policy === "optional") {
            const confirmationId = question.hint
                .confirmationId;
            if (typeof confirmationId !== "string" ||
                !questionIds.has(confirmationId) && !exports.FRA11_QUESTIONS.some((q) => q.id === confirmationId)) {
                errors.push(`${question.id}: optional hint lacks a valid fresh confirmation.`);
            }
        }
    }
    const finalIds = exports.FRA11_QUESTIONS.filter((q) => q.stage === "final").map((q) => q.id);
    if (finalIds.join(",") !== "M1,M2,M3,M4,M5") {
        errors.push("Primary final must contain exactly M1–M5 in order.");
    }
    const hook = questionMap.get("HOOK");
    const hookVisual = hook?.visual;
    if (hookVisual?.totalPieces !== 13 ||
        hookVisual?.partsPerWhole !== 4 ||
        JSON.stringify(hookVisual?.groupingAfterReveal) !== "[4,4,4,1]") {
        errors.push("HOOK must show exactly 13 quarter-metre tiles grouped 4+4+4+1.");
    }
    const m2 = questionMap.get("M2");
    const m2Visual = m2?.visual;
    if (m2Visual?.totalPieces !== 14 ||
        m2Visual?.partsPerWhole !== 5 ||
        m2Visual?.preSubmitGroupLabelsHidden !== true ||
        m2Visual?.preSubmitTotalAnnouncementForbidden !== true) {
        errors.push("M2 must contain 14 fifth-sized pieces with no pre-submit grouping or total announcement.");
    }
    const routeConfig = exports.FRA11.route;
    if (routeConfig.strongGuidedGate.trueRoute[0] !== "skip F1" ||
        !routeConfig.strongGuidedGate.trueRoute.includes("F2")) {
        errors.push("Strong guided route must skip F1 and retain F2.");
    }
    if (routeConfig.independentEntryNarrationPolicy.neverPlayConsecutively.length !== 1) {
        errors.push("Independent intro repetition guard is missing.");
    }
    for (const [sourceId, confirmationId] of Object.entries(routeConfig.hintConfirmationMap)) {
        if (!questionMap.has(sourceId) || !questionMap.has(confirmationId)) {
            errors.push(`Hint confirmation route is invalid: ${sourceId} -> ${confirmationId}.`);
        }
    }
    const recovery = exports.FRA11.recoveryPolicy.threeItemFreshFinal;
    if (recovery.count !== 3 ||
        !recovery.generatorConstraints.excludePreviouslySeenNumeratorDenominatorPairs) {
        errors.push("Fresh three-item recovery policy is incomplete.");
    }
    if (hasKeyRecursively(exports.FRA11_RUNTIME_COPY, "captionText")) {
        errors.push("A separate captionText field exists in runtime copy.");
    }
    const allObjects = [];
    collectObjectValues(exports.FRA11_RUNTIME_COPY, allObjects);
    if (allObjects.length === 0) {
        errors.push("Runtime registry traversal failed.");
    }
    return errors;
}
function assertFRA11CanonicalSpec() {
    const errors = validateFRA11CanonicalSpec();
    if (errors.length > 0) {
        throw new Error(`FRA11 canonical specification failed validation:\n${errors
            .map((error) => `- ${error}`)
            .join("\n")}`);
    }
}

  window.RevilyFra11Approved = module.exports;
  window.FRA11_RUNTIME_COPY = module.exports.FRA11_RUNTIME_COPY;
})();
