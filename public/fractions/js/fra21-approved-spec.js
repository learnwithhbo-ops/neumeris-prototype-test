(function () {
  "use strict";
  const exports = {};
"use strict";
/**
 * FRA21_CANONICAL_SPEC.ts - implementation handoff v1
 *
 * FRA-21 - Subtract Fractions Where One Denominator Is a Multiple of the Other
 *
 * This architecture-neutral specification converts the owner-approved
 * storyboard into implementation-ready lesson data while preserving a hard
 * boundary between:
 *   1. exact learner-facing Ryan runtime copy;
 *   2. visible learner UI copy that is never automatically voiced;
 *   3. author-only pedagogy, routing, animation and QA instructions.
 *
 * HARD RUNTIME-COPY RULE
 * Ryan audio and Ryan captions may resolve only from
 * FRA21_RUNTIME_COPY[utteranceId].text. No other prose in this file, the PDF,
 * implementation prompt or repository may be sent to TTS or used as Ryan
 * captions unless it is first added to the runtime registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRA21 = exports.FRA21_RECOVERY_BANK = exports.FRA21_REPAIRS = exports.FRA21_CONFIRMATIONS = exports.FRA21_CORE_QUESTIONS = exports.FRA21_TEACHING_SCENES = exports.FRA21_LEARNER_UI_COPY = exports.FRA21_RUNTIME_COPY = void 0;
exports.simplifyFraction = simplifyFraction;
exports.fractionsEqual = fractionsEqual;
exports.subtractWhenOneDenominatorIsMultiple = subtractWhenOneDenominatorIsMultiple;
exports.getFRA21Question = getFRA21Question;
exports.evaluateFRA21Question = evaluateFRA21Question;
exports.routeFRA21GuidedGate = routeFRA21GuidedGate;
exports.requiredConfirmationForSupportedQuestion = requiredConfirmationForSupportedQuestion;
exports.selectRepairFamily = selectRepairFamily;
exports.routeFRA21Final = routeFRA21Final;
exports.selectFRA21RecoveryItems = selectFRA21RecoveryItems;
exports.selectFRA21EarlyRepairRecheck = selectFRA21EarlyRepairRecheck;
exports.validateFRA21CanonicalSpec = validateFRA21CanonicalSpec;
exports.FRA21_RUNTIME_COPY = {
    "HOOK.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "establish_battery_starting_amount",
        "text": "The battery shows seven eighths left.",
        "captionSource": "same_as_audio"
    },
    "HOOK.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "introduce_fractional_amount_removed",
        "text": "A background update uses one quarter of a full charge. How much will still be left?",
        "captionSource": "same_as_audio"
    },
    "HOOK.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "create_need_to_match_piece_sizes",
        "text": "Here is the problem: the display counts eighths, but the amount used is written in quarters. Those pieces do not match yet.",
        "captionSource": "same_as_audio"
    },
    "T1.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_subtraction_order_meaning",
        "text": "Subtraction removes the second amount from the first.",
        "captionSource": "same_as_audio"
    },
    "T1.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "contrast_eighth_and_quarter_piece_sizes",
        "text": "But an eighth-sized cell and a quarter-sized cell are not the same size.",
        "captionSource": "same_as_audio"
    },
    "T1.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "require_common_piece_size_before_subtraction",
        "text": "Before we subtract, both amounts need to count the same kind of piece.",
        "captionSource": "same_as_audio"
    },
    "T2.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "identify_ready_denominator",
        "text": "Eight is a multiple of four, so eighths are already the ready-sized pieces.",
        "captionSource": "same_as_audio"
    },
    "T2.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "protect_fraction_already_at_ready_denominator",
        "text": "The seven eighths stays exactly as it is.",
        "captionSource": "same_as_audio"
    },
    "T2.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "scale_numerator_and_denominator_by_same_factor",
        "text": "Four becomes eight by multiplying by two. Use the same factor on the numerator: one becomes two.",
        "captionSource": "same_as_audio"
    },
    "T2.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_equivalent_fraction_result",
        "text": "One quarter is two eighths.",
        "captionSource": "same_as_audio"
    },
    "T3.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "authorise_subtraction_after_matching",
        "text": "Now the pieces match, so subtraction can happen.",
        "captionSource": "same_as_audio"
    },
    "T3.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "remove_second_fraction_in_common_units",
        "text": "Start with seven eighths and remove two eighths.",
        "captionSource": "same_as_audio"
    },
    "T3.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "subtract_numerators_and_retain_denominator",
        "text": "Seven minus two is five. The denominator stays eight because the piece size has not changed.",
        "captionSource": "same_as_audio"
    },
    "T4.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "generalise",
        "communicationGoal": "prevent_position_based_conversion_habit",
        "text": "Sometimes the fraction that needs changing comes first.",
        "captionSource": "same_as_audio"
    },
    "T4.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "convert_first_fraction_to_ready_denominator",
        "text": "Three quarters minus five eighths. Eight is a multiple of four, so three quarters becomes six eighths.",
        "captionSource": "same_as_audio"
    },
    "T4.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "instruction",
        "communicationGoal": "preserve_original_subtraction_order",
        "text": "Keep the order: six eighths minus five eighths.",
        "captionSource": "same_as_audio"
    },
    "T4.4": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "explain",
        "communicationGoal": "state_positive_difference",
        "text": "That leaves one eighth.",
        "captionSource": "same_as_audio"
    },
    "HANDOFF.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "summarise_three_part_method",
        "text": "You have seen the full move: match the pieces, change one fraction, then subtract in the order shown.",
        "captionSource": "same_as_audio"
    },
    "HANDOFF.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "hand_control_to_learner",
        "text": "I will stay with you for two. After that, the support starts to fade.",
        "captionSource": "same_as_audio"
    },
    "G1.PROMPT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "guide_ready_denominator_and_missing_fields",
        "text": "Ten is already the denominator both fractions can use. Complete the missing values.",
        "captionSource": "same_as_audio"
    },
    "G2.PROMPT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "guide_context_conversion_and_removal",
        "text": "The board is measured in twelfths. Work out how many twelfths one third covers, then remove that amount.",
        "captionSource": "same_as_audio"
    },
    "F1.PROMPT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "fade_to_target_denominator_only",
        "text": "The target denominator is nine. You decide the conversion and subtraction.",
        "captionSource": "same_as_audio"
    },
    "F2.PROMPT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "test_which_fraction_needs_renaming",
        "text": "Twelve is already a multiple of six. Which fraction needs a new name?",
        "captionSource": "same_as_audio"
    },
    "I1.PROMPT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "invite_independent_symbolic_solution",
        "text": "Work it through, then submit your fraction.",
        "captionSource": "same_as_audio"
    },
    "I2.PROMPT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "prompt",
        "communicationGoal": "invite_independent_context_solution",
        "text": "Find the remaining fraction of the full tank.",
        "captionSource": "same_as_audio"
    },
    "FINAL.INTRO": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "transition",
        "communicationGoal": "introduce_five_unsupported_final_items",
        "text": "These last five are yours. No hints this time. Do the question first. Once your answer is locked, I will show you the working so you can check it.",
        "captionSource": "same_as_audio"
    },
    "FINAL.CORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "acknowledge_correct",
        "communicationGoal": "acknowledge_then_open_item_specific_check",
        "text": "That is right. Here is the working so you can check the conversion and subtraction.",
        "captionSource": "same_as_audio"
    },
    "FINAL.INCORRECT": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "redirect_incorrect",
        "communicationGoal": "redirect_to_first_step_comparison",
        "text": "Not quite. Here is the working - compare the first step with yours.",
        "captionSource": "same_as_audio"
    },
    "R-BOTH.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "identify_ready_denominator_for_one_change_method",
        "text": "Ten is already the denominator both fractions can use.",
        "captionSource": "same_as_audio"
    },
    "R-BOTH.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "protect_fraction_already_in_ready_units",
        "text": "Seven tenths already has the right-sized pieces, so leave it alone.",
        "captionSource": "same_as_audio"
    },
    "R-BOTH.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "rename_only_non_ready_fraction",
        "text": "Only two fifths needs a new name: four tenths.",
        "captionSource": "same_as_audio"
    },
    "R-SCALE.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "identify_denominator_only_scaling",
        "text": "The denominator changed, but the numerator stayed behind.",
        "captionSource": "same_as_audio"
    },
    "R-SCALE.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "require_same_scale_factor_on_both_fields",
        "text": "Four becomes eight with times two. The numerator must use that same times two.",
        "captionSource": "same_as_audio"
    },
    "R-SCALE.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "contrast_correct_and_incorrect_equivalent_fractions",
        "text": "One quarter is two eighths, not one eighth.",
        "captionSource": "same_as_audio"
    },
    "R-EARLY.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "identify_subtract_before_convert_error",
        "text": "The subtraction started before the pieces matched.",
        "captionSource": "same_as_audio"
    },
    "R-EARLY.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "rename_before_subtraction",
        "text": "First rename one quarter as two eighths.",
        "captionSource": "same_as_audio"
    },
    "R-EARLY.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "subtract_after_piece_sizes_match",
        "text": "Then seven eighths minus two eighths leaves five eighths.",
        "captionSource": "same_as_audio"
    },
    "R-ORDER.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "identify_order_change_after_correct_conversion",
        "text": "The conversion is right, but the subtraction order changed.",
        "captionSource": "same_as_audio"
    },
    "R-ORDER.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "preserve_first_amount_as_start",
        "text": "Three quarters is the starting amount, so it becomes six eighths first.",
        "captionSource": "same_as_audio"
    },
    "R-ORDER.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "state_ordered_common_denominator_line",
        "text": "Keep the order shown: six eighths minus five eighths.",
        "captionSource": "same_as_audio"
    },
    "R-DENOM.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "recognise_common_unit_already_established",
        "text": "The pieces are already matched as tenths.",
        "captionSource": "same_as_audio"
    },
    "R-DENOM.2": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "change_count_not_piece_size",
        "text": "Seven minus four changes how many tenths remain.",
        "captionSource": "same_as_audio"
    },
    "R-DENOM.3": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "repair",
        "communicationGoal": "retain_common_denominator",
        "text": "It does not change the size of a tenth, so the denominator stays ten.",
        "captionSource": "same_as_audio"
    },
    "COMPLETE.1": {
        "audience": "learner",
        "spokenBy": "Ryan",
        "role": "completion",
        "communicationGoal": "complete_current_lesson_attempt",
        "text": "Good work. You can now spot the ready denominator, change just one fraction, and subtract in order. That is FRA-21 done.",
        "captionSource": "same_as_audio"
    }
};
exports.FRA21_LEARNER_UI_COPY = {
    "STAGE.LEARN": {
        "audience": "learner",
        "surface": "stage_label",
        "text": "Learn the idea",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "STAGE.GUIDED": {
        "audience": "learner",
        "surface": "stage_label",
        "text": "Try it with me",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "STAGE.FADED": {
        "audience": "learner",
        "surface": "stage_label",
        "text": "Your turn - support nearby",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "STAGE.TURN": {
        "audience": "learner",
        "surface": "stage_label",
        "text": "Your turn",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "STAGE.INDEPENDENT": {
        "audience": "learner",
        "surface": "stage_label",
        "text": "Now you take over",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "STAGE.FINAL": {
        "audience": "learner",
        "surface": "stage_label",
        "text": "Final check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "BUTTON.MATCH": {
        "audience": "learner",
        "surface": "button",
        "text": "Match the pieces",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "BUTTON.CHECK": {
        "audience": "learner",
        "surface": "button",
        "text": "Check answer",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "BUTTON.CHECK_THREE": {
        "audience": "learner",
        "surface": "button",
        "text": "Check the three boxes",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "BUTTON.SUBMIT": {
        "audience": "learner",
        "surface": "button",
        "text": "Submit",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "BUTTON.HINT": {
        "audience": "learner",
        "surface": "button",
        "text": "Ask for a hint",
        "speechPolicy": "never_automatic_ryan",
        "origin": "shared_engine"
    },
    "LABEL.READY_DENOMINATOR": {
        "audience": "learner",
        "surface": "visual_label",
        "text": "READY DENOMINATOR",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "LABEL.LEAVE_ALONE": {
        "audience": "learner",
        "surface": "visual_label",
        "text": "LEAVE THIS FRACTION ALONE",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "LABEL.SAME_FACTOR": {
        "audience": "learner",
        "surface": "visual_label",
        "text": "same factor on top and bottom",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "LABEL.NOT_SAME_SIZE": {
        "audience": "learner",
        "surface": "visual_label",
        "text": "not the same size",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "LABEL.MATCH_PIECES": {
        "audience": "learner",
        "surface": "visual_label",
        "text": "Match the pieces",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "LABEL.LOCKED_ANSWER": {
        "audience": "learner",
        "surface": "status_label",
        "text": "LOCKED ANSWER",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "LABEL.BOTH_NUMERATORS": {
        "audience": "learner",
        "surface": "instruction",
        "text": "Both numerator boxes are required.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "HOOK.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "The pieces do not match - yet",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "HOOK.QUESTION": {
        "audience": "learner",
        "surface": "prompt",
        "text": "How much charge will remain?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "HOOK.CONTEXT.START": {
        "audience": "learner",
        "surface": "context_label",
        "text": "battery display: seven eighths",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "HOOK.CONTEXT.MISMATCH": {
        "audience": "learner",
        "surface": "context_label",
        "text": "The display counts eighths. The update is written in quarters.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "HOOK.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A battery display has eight equal cells with seven shown as remaining. A separate quarter-sized piece represents the update amount. The two shown piece widths differ.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Subtraction needs the same kind of piece",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A one-eighth cell and a one-quarter piece are aligned to compare their widths. The quarter piece is wider.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "One denominator is already ready",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Seven eighths is framed as unchanged. One quarter is subdivided into two equal eighth-sized parts using the same factor on numerator and denominator.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T3.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Subtract the matched numerators and keep the piece size",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T3.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Seven eighth-sized cells are shown, two are removed, and five eighth-sized cells remain. The denominator eight stays fixed.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T4.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "The fraction that changes can come first",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "T4.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Three quarters is subdivided into six eighths, then five eighths is removed in the original order, leaving one eighth.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Complete the common-denominator working",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 4/5 - 1/10.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G1.INSTRUCTION": {
        "audience": "learner",
        "surface": "instruction",
        "text": "Rename 4/5 in tenths, then complete all three numerator boxes.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G1.FIELD.CONVERTED": {
        "audience": "learner",
        "surface": "field_label",
        "text": "Converted numerator for four fifths in tenths",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G1.FIELD.FIRST": {
        "audience": "learner",
        "surface": "field_label",
        "text": "First numerator in the subtraction line",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G1.FIELD.RESULT": {
        "audience": "learner",
        "surface": "field_label",
        "text": "Result numerator over ten",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "An equation asks for the numerator of four fifths when written over ten, then the first numerator and result numerator in a subtraction with both denominators fixed at ten.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. Four fifths is eight tenths, so eight tenths minus one tenth is seven tenths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G1.ERROR.SCALE": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Five became ten, so the numerator needs the same times two.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G1.ERROR.ARITHMETIC": {
        "audience": "learner",
        "surface": "feedback",
        "text": "The conversion is right. Recalculate eight minus one.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G1.ERROR.DEFAULT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Check the conversion first, then subtract the numerators in the original order.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "How much timber remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G2.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A timber strip is 11/12 metre long. A piece 1/3 metre long is cut off. What length remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G2.FIELD.RESULT": {
        "audience": "learner",
        "surface": "field_label",
        "text": "Remaining numerator over twelve metres",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A timber strip is aligned to a one-metre guide divided into twelve equal sections. A bracket marks the one-third cut without naming its value in twelfths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "G2.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. One third is four twelfths, leaving seven twelfths of a metre.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G2.ERROR.CONVERT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Use the twelve equal sections to work out how many twelfths one third covers.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G2.ERROR.ARITHMETIC": {
        "audience": "learner",
        "surface": "feedback",
        "text": "The one-third conversion is right. Recalculate eleven minus four.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "G2.ERROR.DEFAULT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Match the cut length to twelfths before subtracting.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Complete the subtraction",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 7/9 - 1/3. Use ninths for both fractions.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "The subtraction seven ninths minus one third is shown with a blank fraction result and denominator nine fixed. No converted numerator is displayed.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F1.HINT": {
        "audience": "learner",
        "surface": "hint",
        "text": "Ask what multiplies 3 to make 9, then use the same factor on 1.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. One third is three ninths, so seven ninths minus three ninths is four ninths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F1.ERROR.EARLY": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Match the denominator first. Then subtract the numerators.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F1.ERROR.DENOM": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Once both fractions are ninths, the result must still be in ninths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F1.ERROR.DEFAULT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Rename one third in ninths, then subtract.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Which first line is valid?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "For 5/6 - 7/12, choose the correct first line.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.OPTION.A": {
        "audience": "learner",
        "surface": "option",
        "text": "10/12 - 7/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.OPTION.B": {
        "audience": "learner",
        "surface": "option",
        "text": "5/12 - 7/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.OPTION.C": {
        "audience": "learner",
        "surface": "option",
        "text": "10/12 - 14/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.OPTION.D": {
        "audience": "learner",
        "surface": "option",
        "text": "5/6 - 7/6",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Four symbolic first-line choices are listed for five sixths minus seven twelfths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F2.HINT": {
        "audience": "learner",
        "surface": "hint",
        "text": "Twelve is already the ready denominator. Leave the fraction already in twelfths alone.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F2.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. Five sixths becomes ten twelfths, while seven twelfths stays unchanged.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "F2.ERROR.B": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Six became twelve, but five did not use the same times two.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.ERROR.C": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Seven twelfths was already ready; leave it alone.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.ERROR.D": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Sixths cannot name seven twelfths without changing the value.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "F2.ERROR.DEFAULT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Choose the line that changes exactly one fraction without changing its value.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Work out the subtraction",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "11/15 - 1/5 = ?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Eleven fifteenths minus one fifth is shown with an empty numerator and denominator result. No conversion line is visible.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I1.HINT": {
        "audience": "learner",
        "surface": "hint",
        "text": "Fifteen already works for both fractions. Rename one fifth in fifteenths, then subtract.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. One fifth is three fifteenths, leaving eight fifteenths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I1.ERROR.EARLY": {
        "audience": "learner",
        "surface": "feedback",
        "text": "One fifth must be renamed in fifteenths before the numerators are subtracted.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I1.ERROR.SCALE": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Five became fifteen, so one needs the same times three.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I1.ERROR.DENOM": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Once both fractions are fifteenths, the denominator remains fifteen.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I1.ERROR.DEFAULT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Use fifteenths for both fractions, then subtract in the order shown.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "How much water remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I2.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A tank held 3/4 of its full capacity. Then 5/8 of the full capacity was used. What fraction of the full tank remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A tank marker shows a starting level of three quarters. A separate label states that five eighths of the full capacity was used. No eighths grid is shown before submission.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I2.HINT": {
        "audience": "learner",
        "surface": "hint",
        "text": "The amount used is already in eighths. Rename three quarters in eighths before subtracting.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "I2.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. Three quarters is six eighths, and six eighths minus five eighths is one eighth.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I2.ERROR.ORDER": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Keep the original order: the starting three quarters comes first.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I2.ERROR.SCALE": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Four became eight, so three must become six.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I2.ERROR.DENOM": {
        "audience": "learner",
        "surface": "feedback",
        "text": "After the conversion, the result still counts eighths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "I2.ERROR.DEFAULT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Rename the starting amount in eighths, then remove five eighths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-DIRECT.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-DIRECT.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 17/24 - 1/6.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "C-DIRECT.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh fraction subtraction is shown with no hint and no worked line.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-DIRECT.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Confirmed. One sixth is four twenty-fourths, leaving thirteen twenty-fourths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-DIRECT.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "The support has not been confirmed yet. Match one sixth to twenty-fourths before subtracting.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-DIRECT.WORK.1": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "1/6 = 4/24",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-DIRECT.WORK.2": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "17/24 - 4/24 = 13/24",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-FIRST.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-FIRST.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 3/5 - 1/10.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "C-FIRST.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh subtraction is shown where the first fraction needs renaming. No hint or worked line is visible.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-FIRST.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Confirmed. Three fifths is six tenths, leaving five tenths, which is one half.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-FIRST.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "The support has not been confirmed yet. Rename three fifths in tenths and keep it first.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-FIRST.WORK.1": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "3/5 = 6/10",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-FIRST.WORK.2": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "6/10 - 1/10 = 5/10 = 1/2",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-ARITH.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Numerator check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-ARITH.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete 14/20 - 3/20 = ?/20.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-ARITH.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Two fractions already have denominator twenty. Only the result numerator is empty.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-ARITH.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "The numerator subtraction is secure: fourteen minus three is eleven.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-ARITH.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Recalculate fourteen minus three. The denominator remains twenty.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "C-ARITH.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "14/20 - 3/20 = 11/20",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "FINAL.INSTRUCTION": {
        "audience": "learner",
        "surface": "instruction",
        "text": "No hints. Submit first; working appears after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "FINAL.ACCESS.LOCK": {
        "audience": "learner",
        "surface": "accessible_status",
        "text": "The submitted answer is locked and cannot be edited.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "M1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Direct subtraction",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 17/20 - 1/5.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Seventeen twentieths minus one fifth is shown with an empty fraction result. No conversion or answer cue is visible.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M1.WORK.1": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "1/5 = 4/20",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M1.WORK.2": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "17/20 - 4/20 = 13/20",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M1.WORK.3": {
        "audience": "learner",
        "surface": "worked_explanation",
        "text": "Seventeen minus four is thirteen. The denominator stays twenty because every piece is still one twentieth.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Complete the common-denominator working",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M2.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete the working for 5/6 - 7/12.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "The line has denominator twelve throughout. The converted first numerator and the result numerator are empty. Both fields are required.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M2.WORK.1": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "5/6 = 10/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M2.WORK.2": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "10/12 - 7/12 = 3/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M2.WORK.3": {
        "audience": "learner",
        "surface": "worked_explanation",
        "text": "Ten minus seven is three, so the required common-denominator working ends at three twelfths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M3.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Interpret aligned visual models",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M3.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "The top bar shows 5/6. The lower bar shows the amount removed: 1/3. What fraction remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M3.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "The top bar has six equal parts with five shown as the starting amount. The lower bar has three equal parts with one shown as the amount removed. It is not subdivided into sixths before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M3.WORK.1": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "1/3 = 2/6",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M3.WORK.2": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "5/6 - 2/6 = 3/6",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M3.WORK.3": {
        "audience": "learner",
        "surface": "worked_explanation",
        "text": "Three sixths remains. One half is an exact equivalent value.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M4.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Context transfer",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M4.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A fuel tank was 9/10 full. A journey used 1/5 of the tank's full capacity. What fraction of the full tank remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M4.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A tank marker shows a starting level of nine tenths and a separate label states that one fifth of full capacity was used. No conversion is displayed before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M4.WORK.1": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "1/5 = 2/10",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M4.WORK.2": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "9/10 - 2/10 = 7/10",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M4.WORK.3": {
        "audience": "learner",
        "surface": "worked_explanation",
        "text": "Seven tenths of the full tank remains.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Challenge a denominator error",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.STATEMENT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A student writes: 7/10 - 2/5 = 5/5.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "\"I subtracted the top numbers and the bottom numbers.\" Which response is correct?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.OPTION.A": {
        "audience": "learner",
        "surface": "option",
        "text": "Correct - subtract both parts of each fraction.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.OPTION.B": {
        "audience": "learner",
        "surface": "option",
        "text": "Not correct - 2/5 is 4/10, so the answer is 3/10.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.OPTION.C": {
        "audience": "learner",
        "surface": "option",
        "text": "Not correct - change 7/10 into fifths, then write 5/5.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.OPTION.D": {
        "audience": "learner",
        "surface": "option",
        "text": "Correct - denominators always get smaller in subtraction.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A student claim and four response choices are shown. No option is preselected and no conversion is displayed.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.WORK.1": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "2/5 = 4/10",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.WORK.2": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "7/10 - 4/10 = 3/10",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "M5.WORK.3": {
        "audience": "learner",
        "surface": "worked_explanation",
        "text": "The denominator stays ten because the result still counts tenths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "FEEDBACK.UNKNOWN": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Show me the first step you chose.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "FEEDBACK.ARITHMETIC": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Your fraction method is right. Recalculate this numerator difference.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-BOTH.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Leave the ready fraction alone",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.SUPPORTED.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "For 9/12 - 1/3, choose the valid setup and complete the conversion.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-BOTH.OPTION.A": {
        "audience": "learner",
        "surface": "option",
        "text": "Leave 9/12 unchanged and convert 1/3 to ?/12.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.OPTION.B": {
        "audience": "learner",
        "surface": "option",
        "text": "Convert both fractions to twenty-fourths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.OPTION.C": {
        "audience": "learner",
        "surface": "option",
        "text": "Leave 1/3 unchanged and convert 9/12 to thirds.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.SUPPORTED.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A choice asks which fraction to leave unchanged in nine twelfths minus one third, followed by one missing numerator over twelve.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.SUPPORTED.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Yes. Nine twelfths is already ready, and one third is four twelfths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.SUPPORTED.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "One denominator is already ready. Protect that fraction and rename only the other one.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.RECHECK.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 13/15 - 2/5.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-BOTH.RECHECK.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Confirmed. Two fifths is six fifteenths, leaving seven fifteenths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.RECHECK.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Leave thirteen fifteenths unchanged and rename only two fifths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-BOTH.RECHECK.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "13/15 - 6/15 = 7/15",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Use the same factor on both fields",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.SUPPORTED.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete 2/3 = ?/12. Select the scale factor and enter the numerator.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-SCALE.OPTION.X2": {
        "audience": "learner",
        "surface": "option",
        "text": "times 2",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.OPTION.X3": {
        "audience": "learner",
        "surface": "option",
        "text": "times 3",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.OPTION.X4": {
        "audience": "learner",
        "surface": "option",
        "text": "times 4",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.SUPPORTED.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "The denominator changes from three to twelve. A factor choice and one numerator field are provided.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.SUPPORTED.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Yes. Three times four is twelve, and two times four is eight.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.SUPPORTED.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Use one factor on both numerator and denominator.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.RECHECK.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete 3/5 = ?/15.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-SCALE.RECHECK.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Confirmed. Five times three is fifteen, so three times three is nine.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.RECHECK.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Use the same times three on the numerator.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-SCALE.RECHECK.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "3/5 = 9/15",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Convert before subtracting",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.SUPPORTED.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Put the four steps for 5/6 - 1/3 in the correct order.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-EARLY.STEP.READY": {
        "audience": "learner",
        "surface": "step_card",
        "text": "Choose 6 as the ready denominator.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.STEP.RENAME": {
        "audience": "learner",
        "surface": "step_card",
        "text": "Rename 1/3 as 2/6.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.STEP.SUBTRACT": {
        "audience": "learner",
        "surface": "step_card",
        "text": "Subtract 5 - 2.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.STEP.KEEP": {
        "audience": "learner",
        "surface": "step_card",
        "text": "Keep denominator 6.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.SUPPORTED.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Four step cards describe choosing the ready denominator, renaming, subtracting and keeping the denominator.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.SUPPORTED.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "That order matches the pieces before the subtraction starts.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.SUPPORTED.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "The rename step must happen before the numerator subtraction.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.RECHECK.A.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 11/15 - 1/5.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-EARLY.RECHECK.B.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 19/24 - 1/6.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.RECHECK.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Confirmed. The denominators were matched before the numerators were subtracted.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.RECHECK.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Rename the smaller-denominator fraction before subtracting.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.RECHECK.A.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "11/15 - 3/15 = 8/15",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-EARLY.RECHECK.B.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "19/24 - 4/24 = 15/24 = 5/8",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Keep the first amount as the starting amount",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.SUPPORTED.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "For 7/10 - 3/5, choose the valid common-denominator line.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-ORDER.OPTION.A": {
        "audience": "learner",
        "surface": "option",
        "text": "7/10 - 6/10",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.OPTION.B": {
        "audience": "learner",
        "surface": "option",
        "text": "6/10 - 7/10",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.OPTION.C": {
        "audience": "learner",
        "surface": "option",
        "text": "7/5 - 3/5",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.SUPPORTED.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Three possible common-denominator lines are listed for seven tenths minus three fifths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.SUPPORTED.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Yes. Seven tenths stays first, and three fifths becomes six tenths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.SUPPORTED.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "The first amount must stay first after conversion.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.RECHECK.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 11/12 - 3/4.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-ORDER.RECHECK.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Confirmed. Three quarters is nine twelfths, so the ordered difference is two twelfths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.RECHECK.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Keep eleven twelfths as the starting amount.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-ORDER.RECHECK.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "11/12 - 9/12 = 2/12 = 1/6",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-DENOM.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Keep the common denominator",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-DENOM.SUPPORTED.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete 8/9 - 3/9 = ?/9.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-DENOM.SUPPORTED.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "Both fractions already have denominator nine. Only the result numerator is editable.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-DENOM.SUPPORTED.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Yes. Eight minus three is five, and the result remains in ninths.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-DENOM.SUPPORTED.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Only the count of ninths changes. Leave the denominator at nine.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-DENOM.RECHECK.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete 13/15 - 6/15 = ?/15.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "storyboard_exact"
    },
    "R-DENOM.RECHECK.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Confirmed. Thirteen minus six is seven, and the denominator remains fifteen.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-DENOM.RECHECK.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Subtract the numerators and keep fifteen.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "R-DENOM.RECHECK.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "13/15 - 6/15 = 7/15",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 19/24 - 1/6.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "19/24 - 4/24 = 15/24 = 5/8",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-2.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 17/18 - 2/9.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-2.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-2.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DIRECT-2.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "17/18 - 4/18 = 13/18",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 4/5 - 3/10.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "8/10 - 3/10 = 5/10 = 1/2",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-2.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Work out 5/6 - 1/12.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-2.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-2.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-FIRST-2.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "10/12 - 1/12 = 9/12 = 3/4",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-STEP-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-STEP-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete ?/12 - 4/12 = ?/12 for 7/12 - 1/3.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-STEP-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-STEP-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-STEP-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-STEP-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "7/12 - 4/12 = 3/12 = 1/4",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Choose the valid first line for 7/9 - 2/3.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "7/9 - 6/9 = 1/9",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.OPTION.A": {
        "audience": "learner",
        "surface": "option",
        "text": "7/9 - 6/9",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.OPTION.B": {
        "audience": "learner",
        "surface": "option",
        "text": "7/9 - 2/9",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.OPTION.C": {
        "audience": "learner",
        "surface": "option",
        "text": "7/9 - 8/9",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-METHOD-1.OPTION.D": {
        "audience": "learner",
        "surface": "option",
        "text": "7/3 - 2/3",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-VIS-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-VIS-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A bar shows 11/14. Another bar shows 1/7 removed. What fraction remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-VIS-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-VIS-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-VIS-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-VIS-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "11/14 - 2/14 = 9/14",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A cable is 13/15 metre long. A piece 1/5 metre long is removed. What length remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "13/15 - 3/15 = 10/15 = 2/3 metre",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-2.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-2.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A tank was 3/4 full. Then 1/8 of full capacity was used. What fraction remains?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-2.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-2.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-2.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-CONTEXT-2.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "6/8 - 1/8 = 5/8",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "A student writes 13/18 - 1/3 = 12/15. Which correction is valid?",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "1/3 = 6/18, so 13/18 - 6/18 = 7/18",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.OPTION.A": {
        "audience": "learner",
        "surface": "option",
        "text": "Subtract the numerators and denominators to get 12/15.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.OPTION.B": {
        "audience": "learner",
        "surface": "option",
        "text": "Rename 1/3 as 6/18, then subtract to get 7/18.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.OPTION.C": {
        "audience": "learner",
        "surface": "option",
        "text": "Rename 13/18 as thirds, then subtract 12/15.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ERROR-1.OPTION.D": {
        "audience": "learner",
        "surface": "option",
        "text": "Change both fractions to fifteenths and keep 12/15.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DENOM-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DENOM-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Complete 8/9 - 6/9 = ?/9.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DENOM-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DENOM-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DENOM-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-DENOM-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "8/9 - 6/9 = 2/9",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.TITLE": {
        "audience": "learner",
        "surface": "title",
        "text": "Fresh recovery check",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.PROMPT": {
        "audience": "learner",
        "surface": "prompt",
        "text": "Choose the valid common-denominator line for 11/12 - 2/3.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.ACCESS": {
        "audience": "learner",
        "surface": "accessible_description",
        "text": "A fresh unseen FRA-21 item is shown with no hint and no worked solution before submit.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.CORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Correct. The fresh item confirms this part of the method.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.INCORRECT": {
        "audience": "learner",
        "surface": "feedback",
        "text": "Not yet. Compare the common-denominator step after your answer is locked.",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.WORK": {
        "audience": "learner",
        "surface": "worked_step",
        "text": "11/12 - 8/12 = 3/12 = 1/4",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.OPTION.A": {
        "audience": "learner",
        "surface": "option",
        "text": "11/12 - 8/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.OPTION.B": {
        "audience": "learner",
        "surface": "option",
        "text": "8/12 - 11/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.OPTION.C": {
        "audience": "learner",
        "surface": "option",
        "text": "11/3 - 2/3",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    },
    "RM-ORDER-1.OPTION.D": {
        "audience": "learner",
        "surface": "option",
        "text": "11/12 - 2/12",
        "speechPolicy": "never_automatic_ryan",
        "origin": "implementation_completion"
    }
};
exports.FRA21_TEACHING_SCENES = [
    {
        "id": "HOOK",
        "studentFacing": {
            "stageLabelUiId": "STAGE.LEARN",
            "titleUiId": "HOOK.TITLE",
            "promptUiIds": [
                "HOOK.QUESTION",
                "HOOK.CONTEXT.START",
                "HOOK.CONTEXT.MISMATCH"
            ],
            "ryanUtteranceIds": [
                "HOOK.1",
                "HOOK.2",
                "HOOK.3"
            ],
            "interaction": {
                "kind": "unscored_reveal_button",
                "buttonUiId": "BUTTON.MATCH",
                "recordsMasteryEvidence": false
            },
            "accessibleDescriptionUiId": "HOOK.ACCESS"
        },
        "authorOnly": {
            "purpose": "Create a genuine need to match unlike piece sizes before subtracting.",
            "boundary": "Unscored teaching interaction only; no learner answer is requested."
        },
        "timeline": [
            {
                "id": "HOOK.C1",
                "utteranceId": "HOOK.1",
                "anchorText": "seven eighths left",
                "authorOnlyAction": "Fill exactly seven of eight battery cells and label the display 7/8.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show seven of eight cells filled in the completed static state."
            },
            {
                "id": "HOOK.C2",
                "utteranceId": "HOOK.2",
                "anchorText": "one quarter",
                "authorOnlyAction": "Reveal a separate quarter-sized update piece beside the battery.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the quarter piece beside the battery without motion."
            },
            {
                "id": "HOOK.C3",
                "utteranceId": "HOOK.3",
                "anchorText": "counts eighths",
                "authorOnlyAction": "Highlight denominator 8 on the display.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Apply a static outline to denominator 8."
            },
            {
                "id": "HOOK.C4",
                "utteranceId": "HOOK.3",
                "anchorText": "written in quarters",
                "authorOnlyAction": "Highlight denominator 4 on the update amount.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Apply a static outline to denominator 4."
            },
            {
                "id": "HOOK.C5",
                "utteranceId": "HOOK.3",
                "anchorText": "do not match yet",
                "authorOnlyAction": "Detach one eighth cell and one quarter piece and align their widths with a mismatch marker.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the two unequal widths aligned with a non-colour mismatch marker."
            }
        ]
    },
    {
        "id": "T1",
        "studentFacing": {
            "stageLabelUiId": "STAGE.LEARN",
            "titleUiId": "T1.TITLE",
            "ryanUtteranceIds": [
                "T1.1",
                "T1.2",
                "T1.3"
            ],
            "accessibleDescriptionUiId": "T1.ACCESS"
        },
        "authorOnly": {
            "purpose": "Establish that subtraction requires equal-sized units before any procedure.",
            "boundary": "No conversion result appears yet."
        },
        "timeline": [
            {
                "id": "T1.C1",
                "utteranceId": "T1.1",
                "anchorText": "second amount",
                "authorOnlyAction": "Point a removal arrow from the 1/4 amount away from the 7/8 display.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the removal arrow in its final position."
            },
            {
                "id": "T1.C2",
                "utteranceId": "T1.2",
                "anchorText": "not the same size",
                "authorOnlyAction": "Align one eighth cell and one quarter piece for direct width comparison.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show both pieces aligned with distinct widths."
            },
            {
                "id": "T1.C3",
                "utteranceId": "T1.3",
                "anchorText": "same kind of piece",
                "authorOnlyAction": "Dim both bars except denominator labels and show a common-piece placeholder.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show denominators highlighted and a static common-piece placeholder."
            }
        ]
    },
    {
        "id": "T2",
        "studentFacing": {
            "stageLabelUiId": "STAGE.LEARN",
            "titleUiId": "T2.TITLE",
            "visibleLabelUiIds": [
                "LABEL.READY_DENOMINATOR",
                "LABEL.LEAVE_ALONE",
                "LABEL.SAME_FACTOR"
            ],
            "ryanUtteranceIds": [
                "T2.1",
                "T2.2",
                "T2.3",
                "T2.4"
            ],
            "accessibleDescriptionUiId": "T2.ACCESS"
        },
        "authorOnly": {
            "purpose": "Identify the ready denominator and rename only the required fraction.",
            "boundary": "Do not introduce LCM as a learner method."
        },
        "timeline": [
            {
                "id": "T2.C1",
                "utteranceId": "T2.1",
                "anchorText": "ready-sized pieces",
                "authorOnlyAction": "Reveal READY DENOMINATOR beside 8.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the READY DENOMINATOR label beside 8."
            },
            {
                "id": "T2.C2",
                "utteranceId": "T2.2",
                "anchorText": "stays exactly as it is",
                "authorOnlyAction": "Frame 7/8 with the leave-it-alone state.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 7/8 inside a persistent lock frame."
            },
            {
                "id": "T2.C3",
                "utteranceId": "T2.3",
                "anchorText": "multiplying by two",
                "authorOnlyAction": "Reveal the denominator times-two arrow from 4 to 8.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the denominator arrow and x2 label."
            },
            {
                "id": "T2.C4",
                "utteranceId": "T2.3",
                "anchorText": "same factor on the numerator",
                "authorOnlyAction": "Reveal the numerator times-two arrow from 1 to 2.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show both aligned x2 arrows."
            },
            {
                "id": "T2.C5",
                "utteranceId": "T2.4",
                "anchorText": "two eighths",
                "authorOnlyAction": "Subdivide the quarter into two eighths and reveal 1/4 = 2/8.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the completed two-of-eight subdivision and equation."
            }
        ]
    },
    {
        "id": "T3",
        "studentFacing": {
            "stageLabelUiId": "STAGE.LEARN",
            "titleUiId": "T3.TITLE",
            "ryanUtteranceIds": [
                "T3.1",
                "T3.2",
                "T3.3"
            ],
            "accessibleDescriptionUiId": "T3.ACCESS"
        },
        "authorOnly": {
            "purpose": "Subtract matched numerators and retain the common denominator as piece size.",
            "boundary": "Do not simplify 5/8 or introduce another form."
        },
        "timeline": [
            {
                "id": "T3.C1",
                "utteranceId": "T3.1",
                "anchorText": "pieces match",
                "authorOnlyAction": "Align the 7/8 and 2/8 models on an eight-cell grid.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show both amounts on aligned eight-cell grids."
            },
            {
                "id": "T3.C2",
                "utteranceId": "T3.2",
                "anchorText": "remove two eighths",
                "authorOnlyAction": "Cross out or slide away exactly two eighth-sized cells.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Mark exactly two cells as removed using cross marks."
            },
            {
                "id": "T3.C3",
                "utteranceId": "T3.3",
                "anchorText": "Seven minus two is five",
                "authorOnlyAction": "Reveal numerator arithmetic 7 - 2 = 5 and leave five cells.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show five remaining cells and the numerator arithmetic."
            },
            {
                "id": "T3.C4",
                "utteranceId": "T3.3",
                "anchorText": "denominator stays eight",
                "authorOnlyAction": "Hold denominator 8 fixed while the numerator changes.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show denominator 8 locked and visually unchanged."
            }
        ]
    },
    {
        "id": "T4",
        "studentFacing": {
            "stageLabelUiId": "STAGE.LEARN",
            "titleUiId": "T4.TITLE",
            "ryanUtteranceIds": [
                "T4.1",
                "T4.2",
                "T4.3",
                "T4.4"
            ],
            "accessibleDescriptionUiId": "T4.ACCESS"
        },
        "authorOnly": {
            "purpose": "Prevent the habit that the second fraction always changes and preserve subtraction order.",
            "boundary": "Use positive-result values only."
        },
        "timeline": [
            {
                "id": "T4.C1",
                "utteranceId": "T4.1",
                "anchorText": "comes first",
                "authorOnlyAction": "Highlight the first fraction 3/4 as the fraction requiring change.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Outline 3/4 with a first-fraction marker."
            },
            {
                "id": "T4.C2",
                "utteranceId": "T4.2",
                "anchorText": "becomes six eighths",
                "authorOnlyAction": "Subdivide 3/4 into 6/8 and reveal the equation.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 3/4 = 6/8 as a static equivalent state."
            },
            {
                "id": "T4.C3",
                "utteranceId": "T4.3",
                "anchorText": "Keep the order",
                "authorOnlyAction": "Lock the line as 6/8 - 5/8 without swapping operands.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 6/8 first and 5/8 second with order arrows."
            },
            {
                "id": "T4.C4",
                "utteranceId": "T4.4",
                "anchorText": "one eighth",
                "authorOnlyAction": "Reveal 1/8 as the positive result.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the completed result 1/8."
            }
        ]
    },
    {
        "id": "HANDOFF",
        "studentFacing": {
            "stageLabelUiId": "STAGE.LEARN",
            "ryanUtteranceIds": [
                "HANDOFF.1",
                "HANDOFF.2"
            ]
        },
        "authorOnly": {
            "purpose": "Move from demonstration to two guided items.",
            "boundary": "Stage labels and evidence fields remain author-only."
        },
        "timeline": []
    }
];
exports.FRA21_CORE_QUESTIONS = [
    {
        "id": "G1",
        "stage": "guided",
        "family": [
            "STEP"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.GUIDED",
            "titleUiId": "G1.TITLE",
            "promptUiIds": [
                "G1.PROMPT",
                "G1.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": [
                "G1.PROMPT"
            ]
        },
        "authorOnly": {
            "assessmentIntent": "STEP - identify denominator ten as ready, scale both fields of the first fraction, then subtract in order.",
            "routeNotes": [
                "Guided success contributes evidence but cannot establish independent mastery."
            ],
            "leakageNotes": [
                "No numerator result is prefilled; Ryan states only the ready denominator, not the missing numerators."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 4,
                "denominator": 5
            },
            "second": {
                "numerator": 1,
                "denominator": 10
            },
            "readyDenominator": 10,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 8,
                "denominator": 10
            },
            "convertedSecond": {
                "numerator": 1,
                "denominator": 10
            },
            "resultAtReadyDenominator": {
                "numerator": 7,
                "denominator": 10
            },
            "simplifiedResult": {
                "numerator": 7,
                "denominator": 10
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_missing_numerators",
            "fieldUiIds": [
                "G1.FIELD.CONVERTED",
                "G1.FIELD.FIRST",
                "G1.FIELD.RESULT"
            ],
            "fixedDenominator": 10,
            "accessibleDescriptionUiId": "G1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "integer_fields",
            "fieldIds": [
                "convertedNumerator",
                "firstNumerator",
                "resultNumerator"
            ]
        },
        "answer": {
            "kind": "integer_fields",
            "expected": {
                "convertedNumerator": 8,
                "firstNumerator": 8,
                "resultNumerator": 7
            }
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "built_in",
            "solutionPolicy": "after_outcome_when_authored",
            "eligibleForIndependentMastery": false,
            "firstAttemptIsAuthoritative": false,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": false
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "G1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "G1.ERROR.DEFAULT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [
                {
                    "id": "G1.SCALE",
                    "family": "SCALE",
                    "uiIds": [
                        "G1.ERROR.SCALE"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "G1_SCALE_DENOMINATOR_ONLY"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong_if_visible_fields"
                },
                {
                    "id": "G1.ARITHMETIC",
                    "family": "ARITHMETIC",
                    "uiIds": [
                        "G1.ERROR.ARITHMETIC"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "G1_CONVERSION_CORRECT_RESULT_WRONG"
                    },
                    "requiresRepeatBeforeRepair": false,
                    "classificationConfidence": "strong"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": null
    },
    {
        "id": "G2",
        "stage": "guided",
        "family": [
            "CONTEXT",
            "VIS"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.GUIDED",
            "titleUiId": "G2.TITLE",
            "promptUiIds": [
                "G2.PROMPT"
            ],
            "ryanBeforeSubmitUtteranceIds": [
                "G2.PROMPT"
            ]
        },
        "authorOnly": {
            "assessmentIntent": "CONTEXT + VIS - map one third of a metre onto a twelve-section measurement and subtract.",
            "routeNotes": [
                "The structural cut bracket may support recounting but must not state four before one supported recount."
            ],
            "leakageNotes": [
                "The accessible description gives the visible twelve-part structure but not the converted count or answer."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 11,
                "denominator": 12
            },
            "second": {
                "numerator": 1,
                "denominator": 3
            },
            "readyDenominator": 12,
            "scaleFirst": 1,
            "scaleSecond": 4,
            "convertedFirst": {
                "numerator": 11,
                "denominator": 12
            },
            "convertedSecond": {
                "numerator": 4,
                "denominator": 12
            },
            "resultAtReadyDenominator": {
                "numerator": 7,
                "denominator": 12
            },
            "simplifiedResult": {
                "numerator": 7,
                "denominator": 12
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "timber_strip",
            "wholeGuidePartitions": 12,
            "startingSelectedPartitions": 11,
            "cutBracketSourceFraction": {
                "numerator": 1,
                "denominator": 3
            },
            "cutBracketConvertedCountHiddenBeforeFirstSupport": true,
            "fixedResultDenominator": 12,
            "accessibleDescriptionUiId": "G2.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "integer_fields",
            "fieldIds": [
                "resultNumerator"
            ],
            "fieldUiIds": [
                "G2.FIELD.RESULT"
            ]
        },
        "answer": {
            "kind": "integer_fields",
            "expected": {
                "resultNumerator": 7
            }
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "built_in",
            "solutionPolicy": "after_outcome_when_authored",
            "eligibleForIndependentMastery": false,
            "firstAttemptIsAuthoritative": false,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": false
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "G2.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "G2.ERROR.DEFAULT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [
                {
                    "id": "G2.CONVERT",
                    "family": "SCALE",
                    "uiIds": [
                        "G2.ERROR.CONVERT"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "G2_NOT_SEVEN_AND_NOT_ARITHMETIC_ONLY"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                },
                {
                    "id": "G2.ARITHMETIC",
                    "family": "ARITHMETIC",
                    "uiIds": [
                        "G2.ERROR.ARITHMETIC"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "G2_CONVERSION_EVIDENCE_CORRECT_ARITHMETIC_WRONG"
                    },
                    "requiresRepeatBeforeRepair": false,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": null
    },
    {
        "id": "F1",
        "stage": "faded",
        "family": [
            "DIRECT"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FADED",
            "titleUiId": "F1.TITLE",
            "promptUiIds": [
                "F1.PROMPT"
            ],
            "hintUiId": "F1.HINT",
            "ryanBeforeSubmitUtteranceIds": [
                "F1.PROMPT"
            ]
        },
        "authorOnly": {
            "assessmentIntent": "DIRECT scaffold - use a visible target denominator but no converted numerator.",
            "routeNotes": [
                "Strong guided evidence skips this item; standard route retains it. Hint use maps to C-DIRECT."
            ],
            "leakageNotes": [
                "The hint starts closed and names only the multiplier relation, not the final result."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 7,
                "denominator": 9
            },
            "second": {
                "numerator": 1,
                "denominator": 3
            },
            "readyDenominator": 9,
            "scaleFirst": 1,
            "scaleSecond": 3,
            "convertedFirst": {
                "numerator": 7,
                "denominator": 9
            },
            "convertedSecond": {
                "numerator": 3,
                "denominator": 9
            },
            "resultAtReadyDenominator": {
                "numerator": 4,
                "denominator": 9
            },
            "simplifiedResult": {
                "numerator": 4,
                "denominator": 9
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_fraction_result",
            "targetDenominatorVisible": 9,
            "accessibleDescriptionUiId": "F1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 4,
                "denominator": 9
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "optional_collapsed",
            "solutionPolicy": "after_outcome_when_authored",
            "eligibleForIndependentMastery": false,
            "firstAttemptIsAuthoritative": false,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": false
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "F1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "F1.ERROR.DEFAULT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [
                {
                    "id": "F1.EARLY",
                    "family": "EARLY",
                    "uiIds": [
                        "F1.ERROR.EARLY"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 6,
                            "denominator": 9
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "F1.DENOM",
                    "family": "DENOM",
                    "uiIds": [
                        "F1.ERROR.DENOM"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "F1_WRONG_DENOMINATOR"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": null
    },
    {
        "id": "F2",
        "stage": "faded",
        "family": [
            "ERROR",
            "STEP"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.TURN",
            "titleUiId": "F2.TITLE",
            "promptUiIds": [
                "F2.PROMPT"
            ],
            "hintUiId": "F2.HINT",
            "ryanBeforeSubmitUtteranceIds": [
                "F2.PROMPT"
            ]
        },
        "authorOnly": {
            "assessmentIntent": "ERROR + STEP - choose the valid one-change common-denominator line.",
            "routeNotes": [
                "This item remains on both fast and standard routes. Hint use maps to C-FIRST."
            ],
            "leakageNotes": [
                "No option is preselected; Ryan asks only which fraction needs a new name."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 5,
                "denominator": 6
            },
            "second": {
                "numerator": 7,
                "denominator": 12
            },
            "readyDenominator": 12,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 10,
                "denominator": 12
            },
            "convertedSecond": {
                "numerator": 7,
                "denominator": 12
            },
            "resultAtReadyDenominator": {
                "numerator": 3,
                "denominator": 12
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 4
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "multiple_choice_symbolic_lines",
            "optionUiIds": [
                "F2.OPTION.A",
                "F2.OPTION.B",
                "F2.OPTION.C",
                "F2.OPTION.D"
            ],
            "accessibleDescriptionUiId": "F2.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "single_choice",
            "optionIds": [
                "A",
                "B",
                "C",
                "D"
            ]
        },
        "answer": {
            "kind": "single_choice",
            "correctOptionId": "A"
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "optional_collapsed",
            "solutionPolicy": "after_outcome_when_authored",
            "eligibleForIndependentMastery": false,
            "firstAttemptIsAuthoritative": false,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": false
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "F2.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "F2.ERROR.DEFAULT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [
                {
                    "id": "F2.B",
                    "family": "SCALE",
                    "uiIds": [
                        "F2.ERROR.B"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "optionId": "B"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "F2.C",
                    "family": "BOTH",
                    "uiIds": [
                        "F2.ERROR.C"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "optionId": "C"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "F2.D",
                    "family": "BOTH",
                    "uiIds": [
                        "F2.ERROR.D"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "optionId": "D"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": null
    },
    {
        "id": "I1",
        "stage": "independent",
        "family": [
            "DIRECT"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.INDEPENDENT",
            "titleUiId": "I1.TITLE",
            "promptUiIds": [
                "I1.PROMPT"
            ],
            "hintUiId": "I1.HINT",
            "ryanBeforeSubmitUtteranceIds": [
                "I1.PROMPT"
            ]
        },
        "authorOnly": {
            "assessmentIntent": "DIRECT - independently identify that only the second fraction changes.",
            "routeNotes": [
                "Correct after hint is supported success and inserts C-DIRECT before final."
            ],
            "leakageNotes": [
                "No method line, conversion animation or prior solved item remains visible."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 11,
                "denominator": 15
            },
            "second": {
                "numerator": 1,
                "denominator": 5
            },
            "readyDenominator": 15,
            "scaleFirst": 1,
            "scaleSecond": 3,
            "convertedFirst": {
                "numerator": 11,
                "denominator": 15
            },
            "convertedSecond": {
                "numerator": 3,
                "denominator": 15
            },
            "resultAtReadyDenominator": {
                "numerator": 8,
                "denominator": 15
            },
            "simplifiedResult": {
                "numerator": 8,
                "denominator": 15
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_fraction_result",
            "workedLineVisibleBeforeSubmit": false,
            "accessibleDescriptionUiId": "I1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 8,
                "denominator": 15
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "optional_collapsed",
            "solutionPolicy": "after_outcome_when_authored",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": false
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "I1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "I1.ERROR.DEFAULT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [
                {
                    "id": "I1.EARLY",
                    "family": "EARLY",
                    "uiIds": [
                        "I1.ERROR.EARLY"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 10,
                            "denominator": 15
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "I1.SCALE",
                    "family": "SCALE",
                    "uiIds": [
                        "I1.ERROR.SCALE"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 10,
                            "denominator": 10
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                },
                {
                    "id": "I1.DENOM",
                    "family": "DENOM",
                    "uiIds": [
                        "I1.ERROR.DENOM"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "I1_VALUE_WRONG_DENOMINATOR"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": null
    },
    {
        "id": "I2",
        "stage": "independent",
        "family": [
            "CONTEXT",
            "FIRST_CHANGES"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.INDEPENDENT",
            "titleUiId": "I2.TITLE",
            "promptUiIds": [
                "I2.PROMPT"
            ],
            "hintUiId": "I2.HINT",
            "ryanBeforeSubmitUtteranceIds": [
                "I2.PROMPT"
            ]
        },
        "authorOnly": {
            "assessmentIntent": "CONTEXT + FIRST_CHANGES - preserve subtraction order when the first fraction needs conversion.",
            "routeNotes": [
                "Correct after hint is supported success and inserts C-FIRST before final."
            ],
            "leakageNotes": [
                "The eight-part overlay appears only after answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 3,
                "denominator": 4
            },
            "second": {
                "numerator": 5,
                "denominator": 8
            },
            "readyDenominator": 8,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 6,
                "denominator": 8
            },
            "convertedSecond": {
                "numerator": 5,
                "denominator": 8
            },
            "resultAtReadyDenominator": {
                "numerator": 1,
                "denominator": 8
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 8
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "tank",
            "startingLevelFraction": {
                "numerator": 3,
                "denominator": 4
            },
            "usedFractionOfFullCapacity": {
                "numerator": 5,
                "denominator": 8
            },
            "eighthGridVisibleBeforeSubmit": false,
            "eighthGridVisibleAfterLock": true,
            "accessibleDescriptionUiId": "I2.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 1,
                "denominator": 8
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "optional_collapsed",
            "solutionPolicy": "after_outcome_when_authored",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": false
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "I2.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "I2.ERROR.DEFAULT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [
                {
                    "id": "I2.ORDER",
                    "family": "ORDER",
                    "uiIds": [
                        "I2.ERROR.ORDER"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "I2_ORDER_OR_LARGER_MINUS_SMALLER"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                },
                {
                    "id": "I2.SCALE",
                    "family": "SCALE",
                    "uiIds": [
                        "I2.ERROR.SCALE"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 2,
                            "denominator": 8
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                },
                {
                    "id": "I2.DENOM",
                    "family": "DENOM",
                    "uiIds": [
                        "I2.ERROR.DENOM"
                    ],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "I2_CORRECT_NUMERATOR_WRONG_DENOMINATOR"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": null
    },
    {
        "id": "M1",
        "stage": "final",
        "family": [
            "DIRECT",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "M1.TITLE",
            "promptUiIds": [
                "M1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "DIRECT final evidence.",
            "routeNotes": [
                "First committed pre-working response is the evidence record."
            ],
            "leakageNotes": [
                "No hint, factor or conversion is shown before submit."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 17,
                "denominator": 20
            },
            "second": {
                "numerator": 1,
                "denominator": 5
            },
            "readyDenominator": 20,
            "scaleFirst": 1,
            "scaleSecond": 4,
            "convertedFirst": {
                "numerator": 17,
                "denominator": 20
            },
            "convertedSecond": {
                "numerator": 4,
                "denominator": 20
            },
            "resultAtReadyDenominator": {
                "numerator": 13,
                "denominator": 20
            },
            "simplifiedResult": {
                "numerator": 13,
                "denominator": 20
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_fraction_result",
            "accessibleDescriptionUiId": "M1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 13,
                "denominator": 20
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.CORRECT"
                ]
            },
            "incorrectDefault": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.INCORRECT"
                ]
            },
            "errorSpecific": [
                {
                    "id": "M1.BOTH_FIELDS",
                    "family": "DENOM",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 16,
                            "denominator": 15
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "M1.NO_CONVERSION",
                    "family": "EARLY",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 16,
                            "denominator": 20
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "M1.REVERSED_ARITHMETIC",
                    "family": "ORDER",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 3,
                            "denominator": 20
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "M1.WORK.1",
                "M1.WORK.2",
                "M1.WORK.3"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "M2",
        "stage": "final",
        "family": [
            "STEP",
            "MISSING",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "M2.TITLE",
            "promptUiIds": [
                "M2.PROMPT",
                "LABEL.BOTH_NUMERATORS",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "STEP + MISSING final evidence; the common-denominator fields themselves are assessed.",
            "routeNotes": [
                "Equivalent value-only answer one quarter is not accepted because the required fields are 10 and 3."
            ],
            "leakageNotes": [
                "Both fields are empty before submit; no simplified value is shown."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 5,
                "denominator": 6
            },
            "second": {
                "numerator": 7,
                "denominator": 12
            },
            "readyDenominator": 12,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 10,
                "denominator": 12
            },
            "convertedSecond": {
                "numerator": 7,
                "denominator": 12
            },
            "resultAtReadyDenominator": {
                "numerator": 3,
                "denominator": 12
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 4
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_missing_numerators",
            "fixedDenominator": 12,
            "accessibleDescriptionUiId": "M2.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "integer_fields",
            "fieldIds": [
                "convertedFirstNumerator",
                "resultNumerator"
            ]
        },
        "answer": {
            "kind": "integer_fields",
            "expected": {
                "convertedFirstNumerator": 10,
                "resultNumerator": 3
            }
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.CORRECT"
                ]
            },
            "incorrectDefault": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.INCORRECT"
                ]
            },
            "errorSpecific": [
                {
                    "id": "M2.SCALE",
                    "family": "SCALE",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "M2_FIRST_FIELD_UNSCALED"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "M2.ARITHMETIC",
                    "family": "ARITHMETIC",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "M2_CONVERSION_CORRECT_RESULT_WRONG"
                    },
                    "requiresRepeatBeforeRepair": false,
                    "classificationConfidence": "strong"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "M2.WORK.1",
                "M2.WORK.2",
                "M2.WORK.3"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "M3",
        "stage": "final",
        "family": [
            "VIS",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "M3.TITLE",
            "promptUiIds": [
                "M3.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "VIS final evidence - interpret unlike aligned models without a pre-submit subdivision.",
            "routeNotes": [
                "Accept three sixths and every exact equivalent value such as one half."
            ],
            "leakageNotes": [
                "The lower thirds bar subdivides into sixths only after answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 5,
                "denominator": 6
            },
            "second": {
                "numerator": 1,
                "denominator": 3
            },
            "readyDenominator": 6,
            "scaleFirst": 1,
            "scaleSecond": 2,
            "convertedFirst": {
                "numerator": 5,
                "denominator": 6
            },
            "convertedSecond": {
                "numerator": 2,
                "denominator": 6
            },
            "resultAtReadyDenominator": {
                "numerator": 3,
                "denominator": 6
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 2
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "aligned_fraction_bars",
            "topPartitions": 6,
            "topSelected": 5,
            "lowerPartitionsBeforeSubmit": 3,
            "lowerSelectedBeforeSubmit": 1,
            "lowerPartitionsAfterLock": 6,
            "lowerSelectedAfterLock": 2,
            "accessibleDescriptionUiId": "M3.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 3,
                "denominator": 6
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.CORRECT"
                ]
            },
            "incorrectDefault": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.INCORRECT"
                ]
            },
            "errorSpecific": [
                {
                    "id": "M3.EARLY",
                    "family": "EARLY",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 4,
                            "denominator": 6
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "M3.DENOM",
                    "family": "DENOM",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 4,
                            "denominator": 3
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "M3.WORK.1",
                "M3.WORK.2",
                "M3.WORK.3"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "M4",
        "stage": "final",
        "family": [
            "CONTEXT",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "M4.TITLE",
            "promptUiIds": [
                "M4.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "CONTEXT final evidence with both amounts expressed as fractions of full capacity.",
            "routeNotes": [
                "Context wording and visual both use full-capacity fractions."
            ],
            "leakageNotes": [
                "No tenths conversion is visible before submit."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 9,
                "denominator": 10
            },
            "second": {
                "numerator": 1,
                "denominator": 5
            },
            "readyDenominator": 10,
            "scaleFirst": 1,
            "scaleSecond": 2,
            "convertedFirst": {
                "numerator": 9,
                "denominator": 10
            },
            "convertedSecond": {
                "numerator": 2,
                "denominator": 10
            },
            "resultAtReadyDenominator": {
                "numerator": 7,
                "denominator": 10
            },
            "simplifiedResult": {
                "numerator": 7,
                "denominator": 10
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "fuel_tank",
            "startingLevelFraction": {
                "numerator": 9,
                "denominator": 10
            },
            "usedFractionOfFullCapacity": {
                "numerator": 1,
                "denominator": 5
            },
            "conversionVisibleBeforeSubmit": false,
            "accessibleDescriptionUiId": "M4.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 7,
                "denominator": 10
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.CORRECT"
                ]
            },
            "incorrectDefault": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.INCORRECT"
                ]
            },
            "errorSpecific": [
                {
                    "id": "M4.EARLY",
                    "family": "EARLY",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "fractionEquals": {
                            "numerator": 8,
                            "denominator": 10
                        }
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "strong"
                },
                {
                    "id": "M4.DENOM",
                    "family": "DENOM",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "predicateId": "M4_CORRECT_NUMERATOR_WRONG_DENOMINATOR"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "M4.WORK.1",
                "M4.WORK.2",
                "M4.WORK.3"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "M5",
        "stage": "final",
        "family": [
            "ERROR",
            "REASON",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "M5.TITLE",
            "promptUiIds": [
                "M5.STATEMENT",
                "M5.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "ERROR + REASON final evidence - reject subtracting denominators.",
            "routeNotes": [
                "One isolated option press is candidate evidence only; repeat or explicit reasoning is required for repair classification."
            ],
            "leakageNotes": [
                "No option is preselected and no correction is shown before submit."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 7,
                "denominator": 10
            },
            "second": {
                "numerator": 2,
                "denominator": 5
            },
            "readyDenominator": 10,
            "scaleFirst": 1,
            "scaleSecond": 2,
            "convertedFirst": {
                "numerator": 7,
                "denominator": 10
            },
            "convertedSecond": {
                "numerator": 4,
                "denominator": 10
            },
            "resultAtReadyDenominator": {
                "numerator": 3,
                "denominator": 10
            },
            "simplifiedResult": {
                "numerator": 3,
                "denominator": 10
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "multiple_choice_error_analysis",
            "optionUiIds": [
                "M5.OPTION.A",
                "M5.OPTION.B",
                "M5.OPTION.C",
                "M5.OPTION.D"
            ],
            "accessibleDescriptionUiId": "M5.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "single_choice",
            "optionIds": [
                "A",
                "B",
                "C",
                "D"
            ]
        },
        "answer": {
            "kind": "single_choice",
            "correctOptionId": "B"
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.CORRECT"
                ]
            },
            "incorrectDefault": {
                "uiIds": [],
                "ryanUtteranceIds": [
                    "FINAL.INCORRECT"
                ]
            },
            "errorSpecific": [
                {
                    "id": "M5.A",
                    "family": "DENOM",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "optionId": "A"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                },
                {
                    "id": "M5.C",
                    "family": "BOTH",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "optionId": "C"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                },
                {
                    "id": "M5.D",
                    "family": "DENOM",
                    "uiIds": [],
                    "ryanUtteranceIds": [],
                    "match": {
                        "optionId": "D"
                    },
                    "requiresRepeatBeforeRepair": true,
                    "classificationConfidence": "candidate"
                }
            ],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "M5.WORK.1",
                "M5.WORK.2",
                "M5.WORK.3"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    }
];
exports.FRA21_CONFIRMATIONS = [
    {
        "id": "C-DIRECT",
        "stage": "confirmation",
        "family": [
            "DIRECT",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.TURN",
            "titleUiId": "C-DIRECT.TITLE",
            "promptUiIds": [
                "C-DIRECT.PROMPT"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Fresh no-hint confirmation for direct/second-fraction conversion support.",
            "routeNotes": [
                "Used after F1 or I1 hint-supported success."
            ],
            "leakageNotes": [
                "No hint, no solved line and no reused numbers from the supported item."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 17,
                "denominator": 24
            },
            "second": {
                "numerator": 1,
                "denominator": 6
            },
            "readyDenominator": 24,
            "scaleFirst": 1,
            "scaleSecond": 4,
            "convertedFirst": {
                "numerator": 17,
                "denominator": 24
            },
            "convertedSecond": {
                "numerator": 4,
                "denominator": 24
            },
            "resultAtReadyDenominator": {
                "numerator": 13,
                "denominator": 24
            },
            "simplifiedResult": {
                "numerator": 13,
                "denominator": 24
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_fraction_result",
            "workedLineVisibleBeforeSubmit": false,
            "accessibleDescriptionUiId": "C-DIRECT.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 13,
                "denominator": 24
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "C-DIRECT.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "C-DIRECT.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "C-DIRECT.WORK.1",
                "C-DIRECT.WORK.2"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "C-FIRST",
        "stage": "confirmation",
        "family": [
            "FIRST_CHANGES",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.TURN",
            "titleUiId": "C-FIRST.TITLE",
            "promptUiIds": [
                "C-FIRST.PROMPT"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Fresh no-hint confirmation where the first fraction changes.",
            "routeNotes": [
                "Used after F2 or I2 hint-supported success."
            ],
            "leakageNotes": [
                "No hint or common-denominator line appears before submit."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 3,
                "denominator": 5
            },
            "second": {
                "numerator": 1,
                "denominator": 10
            },
            "readyDenominator": 10,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 6,
                "denominator": 10
            },
            "convertedSecond": {
                "numerator": 1,
                "denominator": 10
            },
            "resultAtReadyDenominator": {
                "numerator": 5,
                "denominator": 10
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 2
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_fraction_result",
            "workedLineVisibleBeforeSubmit": false,
            "accessibleDescriptionUiId": "C-FIRST.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 1,
                "denominator": 2
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "C-FIRST.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "C-FIRST.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "C-FIRST.WORK.1",
                "C-FIRST.WORK.2"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "C-ARITHMETIC",
        "stage": "confirmation",
        "family": [
            "ARITHMETIC"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.TURN",
            "titleUiId": "C-ARITH.TITLE",
            "promptUiIds": [
                "C-ARITH.PROMPT"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Short fact check for an isolated numerator-subtraction slip after structure is correct.",
            "routeNotes": [
                "Passing resolves arithmetic uncertainty only; it does not independently certify the full FRA21 skill."
            ],
            "leakageNotes": [
                "Denominators already match; the item does not reteach equivalence."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 14,
                "denominator": 20
            },
            "second": {
                "numerator": 3,
                "denominator": 20
            },
            "readyDenominator": 20,
            "scaleFirst": 1,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 14,
                "denominator": 20
            },
            "convertedSecond": {
                "numerator": 3,
                "denominator": 20
            },
            "resultAtReadyDenominator": {
                "numerator": 11,
                "denominator": 20
            },
            "simplifiedResult": {
                "numerator": 11,
                "denominator": 20
            },
            "positiveResult": true,
            "oneConversionOnly": false
        },
        "visual": {
            "kind": "matched_denominator_numerator_field",
            "fixedDenominator": 20,
            "accessibleDescriptionUiId": "C-ARITH.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "integer_fields",
            "fieldIds": [
                "resultNumerator"
            ]
        },
        "answer": {
            "kind": "integer_fields",
            "expected": {
                "resultNumerator": 11
            }
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": false,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "C-ARITH.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "C-ARITH.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "C-ARITH.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    }
];
exports.FRA21_REPAIRS = [
    {
        "id": "R-BOTH",
        "errorFamily": "BOTH",
        "studentFacing": {
            "titleUiId": "R-BOTH.TITLE",
            "ryanUtteranceIds": [
                "R-BOTH.1",
                "R-BOTH.2",
                "R-BOTH.3"
            ]
        },
        "authorOnly": {
            "trigger": "Repeated unnecessary change of the already-ready fraction, or failure of a form-sensitive one-conversion step after cue.",
            "classificationCaution": "A mathematically valid both-change value route is not automatically false on a value-only item."
        },
        "timeline": [
            {
                "id": "R-BOTH.C1",
                "utteranceId": "R-BOTH.1",
                "anchorText": "already the denominator",
                "authorOnlyAction": "Highlight denominator 10 as ready.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show denominator 10 highlighted."
            },
            {
                "id": "R-BOTH.C2",
                "utteranceId": "R-BOTH.2",
                "anchorText": "leave it alone",
                "authorOnlyAction": "Lock 7/10 in place.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 7/10 in a locked frame."
            },
            {
                "id": "R-BOTH.C3",
                "utteranceId": "R-BOTH.3",
                "anchorText": "four tenths",
                "authorOnlyAction": "Convert only 2/5 to 4/10.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show only the second fraction changing to 4/10."
            }
        ],
        "supportedInteraction": {
            "id": "R-BOTH-S",
            "stage": "repair_supported",
            "family": [
                "BOTH"
            ],
            "studentFacing": {
                "stageLabelUiId": "STAGE.TURN",
                "titleUiId": "R-BOTH.TITLE",
                "promptUiIds": [
                    "R-BOTH.SUPPORTED.PROMPT"
                ],
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Supported one-conversion method choice after R-BOTH reteach.",
                "routeNotes": [
                    "Success is supported; the fresh recheck is still required."
                ],
                "leakageNotes": [
                    "Only one numerator field is editable and no final result is requested."
                ]
            },
            "math": {
                "kind": "fraction_subtraction",
                "operation": "subtract",
                "first": {
                    "numerator": 9,
                    "denominator": 12
                },
                "second": {
                    "numerator": 1,
                    "denominator": 3
                },
                "readyDenominator": 12,
                "scaleFirst": 1,
                "scaleSecond": 4,
                "convertedFirst": {
                    "numerator": 9,
                    "denominator": 12
                },
                "convertedSecond": {
                    "numerator": 4,
                    "denominator": 12
                },
                "resultAtReadyDenominator": {
                    "numerator": 5,
                    "denominator": 12
                },
                "simplifiedResult": {
                    "numerator": 5,
                    "denominator": 12
                },
                "positiveResult": true,
                "oneConversionOnly": true
            },
            "visual": {
                "kind": "choice_plus_missing_numerator",
                "optionUiIds": [
                    "R-BOTH.OPTION.A",
                    "R-BOTH.OPTION.B",
                    "R-BOTH.OPTION.C"
                ],
                "fixedDenominator": 12,
                "accessibleDescriptionUiId": "R-BOTH.SUPPORTED.ACCESS",
                "deriveAllNumbersFromMath": true
            },
            "response": {
                "kind": "composite",
                "optionIds": [
                    "A",
                    "B",
                    "C"
                ],
                "fieldIds": [
                    "convertedSecondNumerator"
                ]
            },
            "answer": {
                "kind": "composite",
                "correctOptionId": "A",
                "expectedFields": {
                    "convertedSecondNumerator": 4
                }
            },
            "policy": {
                "scored": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_outcome_when_authored",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": false,
                "supportedSuccessCountsAsIndependent": false,
                "workingRequiresAnswerLocked": false
            },
            "feedback": {
                "correct": {
                    "uiIds": [
                        "R-BOTH.SUPPORTED.CORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "incorrectDefault": {
                    "uiIds": [
                        "R-BOTH.SUPPORTED.INCORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "errorSpecific": [],
                "computeCorrectnessBeforeFeedback": true,
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterErrorSpecific": true
            },
            "workedCheck": null
        },
        "freshRechecks": [
            {
                "id": "R-BOTH-RC",
                "stage": "repair_recheck",
                "family": [
                    "DIRECT",
                    "BOTH"
                ],
                "studentFacing": {
                    "stageLabelUiId": "STAGE.TURN",
                    "titleUiId": "R-BOTH.TITLE",
                    "promptUiIds": [
                        "R-BOTH.RECHECK.PROMPT"
                    ],
                    "ryanBeforeSubmitUtteranceIds": []
                },
                "authorOnly": {
                    "assessmentIntent": "Fresh independent recheck after R-BOTH.",
                    "routeNotes": [
                        "No change-both prompt or hint."
                    ],
                    "leakageNotes": [
                        "The already-ready fraction is not visually locked for the learner."
                    ]
                },
                "math": {
                    "kind": "fraction_subtraction",
                    "operation": "subtract",
                    "first": {
                        "numerator": 13,
                        "denominator": 15
                    },
                    "second": {
                        "numerator": 2,
                        "denominator": 5
                    },
                    "readyDenominator": 15,
                    "scaleFirst": 1,
                    "scaleSecond": 3,
                    "convertedFirst": {
                        "numerator": 13,
                        "denominator": 15
                    },
                    "convertedSecond": {
                        "numerator": 6,
                        "denominator": 15
                    },
                    "resultAtReadyDenominator": {
                        "numerator": 7,
                        "denominator": 15
                    },
                    "simplifiedResult": {
                        "numerator": 7,
                        "denominator": 15
                    },
                    "positiveResult": true,
                    "oneConversionOnly": true
                },
                "visual": {
                    "kind": "symbolic_fraction_result",
                    "workedLineVisibleBeforeSubmit": false,
                    "accessibleDescriptionUiId": "C-DIRECT.ACCESS",
                    "deriveAllNumbersFromMath": true
                },
                "response": {
                    "kind": "fraction",
                    "numeratorField": "numerator",
                    "denominatorField": "denominator"
                },
                "answer": {
                    "kind": "fraction_value",
                    "canonical": {
                        "numerator": 7,
                        "denominator": 15
                    },
                    "acceptExactEquivalent": true
                },
                "policy": {
                    "scored": true,
                    "answerLocksOnSubmit": true,
                    "hintPolicy": "none",
                    "solutionPolicy": "after_locked_submit",
                    "eligibleForIndependentMastery": true,
                    "firstAttemptIsAuthoritative": false,
                    "supportedSuccessCountsAsIndependent": false,
                    "workingRequiresAnswerLocked": true
                },
                "feedback": {
                    "correct": {
                        "uiIds": [
                            "R-BOTH.RECHECK.CORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "incorrectDefault": {
                        "uiIds": [
                            "R-BOTH.RECHECK.INCORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "errorSpecific": [],
                    "computeCorrectnessBeforeFeedback": true,
                    "playExactlyOneOutcomeBranch": true,
                    "doNotPlayDefaultAfterErrorSpecific": true
                },
                "workedCheck": {
                    "visibleStepUiIds": [
                        "R-BOTH.RECHECK.WORK"
                    ],
                    "requiresAnswerLocked": true,
                    "mustFollowOutcomeFeedback": true
                }
            }
        ]
    },
    {
        "id": "R-SCALE",
        "errorFamily": "SCALE",
        "studentFacing": {
            "titleUiId": "R-SCALE.TITLE",
            "ryanUtteranceIds": [
                "R-SCALE.1",
                "R-SCALE.2",
                "R-SCALE.3"
            ]
        },
        "authorOnly": {
            "trigger": "Repeated or explicit one-sided scaling / different-factor equivalence error.",
            "classificationCaution": "A single multiplication slip with a valid same-factor plan uses the arithmetic check instead."
        },
        "timeline": [
            {
                "id": "R-SCALE.C1",
                "utteranceId": "R-SCALE.1",
                "anchorText": "stayed behind",
                "authorOnlyAction": "Show the incorrect 1/8 state with the numerator unscaled.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 1/8 crossed as the one-sided change."
            },
            {
                "id": "R-SCALE.C2",
                "utteranceId": "R-SCALE.2",
                "anchorText": "same times two",
                "authorOnlyAction": "Reveal paired times-two arrows on numerator and denominator.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show aligned times-two arrows on both fields."
            },
            {
                "id": "R-SCALE.C3",
                "utteranceId": "R-SCALE.3",
                "anchorText": "two eighths",
                "authorOnlyAction": "Replace 1/8 with 2/8.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 2/8 as the completed equivalent fraction."
            }
        ],
        "supportedInteraction": {
            "id": "R-SCALE-S",
            "stage": "repair_supported",
            "family": [
                "SCALE"
            ],
            "studentFacing": {
                "stageLabelUiId": "STAGE.TURN",
                "titleUiId": "R-SCALE.TITLE",
                "promptUiIds": [
                    "R-SCALE.SUPPORTED.PROMPT"
                ],
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Supported same-factor equivalence interaction.",
                "routeNotes": [
                    "A second miss may reveal aligned times-four arrows."
                ],
                "leakageNotes": [
                    "The target numerator remains empty before response."
                ]
            },
            "math": {
                "kind": "equivalence",
                "source": {
                    "numerator": 2,
                    "denominator": 3
                },
                "targetDenominator": 12,
                "scaleFactor": 4,
                "target": {
                    "numerator": 8,
                    "denominator": 12
                }
            },
            "visual": {
                "kind": "factor_choice_and_numerator",
                "optionUiIds": [
                    "R-SCALE.OPTION.X2",
                    "R-SCALE.OPTION.X3",
                    "R-SCALE.OPTION.X4"
                ],
                "accessibleDescriptionUiId": "R-SCALE.SUPPORTED.ACCESS",
                "deriveAllNumbersFromMath": true
            },
            "response": {
                "kind": "composite",
                "optionIds": [
                    "X2",
                    "X3",
                    "X4"
                ],
                "fieldIds": [
                    "targetNumerator"
                ]
            },
            "answer": {
                "kind": "composite",
                "correctOptionId": "X4",
                "expectedFields": {
                    "targetNumerator": 8
                }
            },
            "policy": {
                "scored": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_outcome_when_authored",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": false,
                "supportedSuccessCountsAsIndependent": false,
                "workingRequiresAnswerLocked": false
            },
            "feedback": {
                "correct": {
                    "uiIds": [
                        "R-SCALE.SUPPORTED.CORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "incorrectDefault": {
                    "uiIds": [
                        "R-SCALE.SUPPORTED.INCORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "errorSpecific": [],
                "computeCorrectnessBeforeFeedback": true,
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterErrorSpecific": true
            },
            "workedCheck": null
        },
        "freshRechecks": [
            {
                "id": "R-SCALE-RC",
                "stage": "repair_recheck",
                "family": [
                    "SCALE"
                ],
                "studentFacing": {
                    "stageLabelUiId": "STAGE.TURN",
                    "titleUiId": "R-SCALE.TITLE",
                    "promptUiIds": [
                        "R-SCALE.RECHECK.PROMPT"
                    ],
                    "ryanBeforeSubmitUtteranceIds": []
                },
                "authorOnly": {
                    "assessmentIntent": "Fresh independent equivalence recheck after R-SCALE.",
                    "routeNotes": [
                        "No subdivision or factor choice before submit."
                    ],
                    "leakageNotes": [
                        "The numerator remains empty and the factor is not stated."
                    ]
                },
                "math": {
                    "kind": "equivalence",
                    "source": {
                        "numerator": 3,
                        "denominator": 5
                    },
                    "targetDenominator": 15,
                    "scaleFactor": 3,
                    "target": {
                        "numerator": 9,
                        "denominator": 15
                    }
                },
                "visual": {
                    "kind": "missing_numerator_equivalence",
                    "fixedDenominator": 15,
                    "workedLineVisibleBeforeSubmit": false,
                    "accessibleDescriptionUiId": "C-DIRECT.ACCESS",
                    "deriveAllNumbersFromMath": true
                },
                "response": {
                    "kind": "integer_fields",
                    "fieldIds": [
                        "targetNumerator"
                    ]
                },
                "answer": {
                    "kind": "integer_fields",
                    "expected": {
                        "targetNumerator": 9
                    }
                },
                "policy": {
                    "scored": true,
                    "answerLocksOnSubmit": true,
                    "hintPolicy": "none",
                    "solutionPolicy": "after_locked_submit",
                    "eligibleForIndependentMastery": true,
                    "firstAttemptIsAuthoritative": false,
                    "supportedSuccessCountsAsIndependent": false,
                    "workingRequiresAnswerLocked": true
                },
                "feedback": {
                    "correct": {
                        "uiIds": [
                            "R-SCALE.RECHECK.CORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "incorrectDefault": {
                        "uiIds": [
                            "R-SCALE.RECHECK.INCORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "errorSpecific": [],
                    "computeCorrectnessBeforeFeedback": true,
                    "playExactlyOneOutcomeBranch": true,
                    "doNotPlayDefaultAfterErrorSpecific": true
                },
                "workedCheck": {
                    "visibleStepUiIds": [
                        "R-SCALE.RECHECK.WORK"
                    ],
                    "requiresAnswerLocked": true,
                    "mustFollowOutcomeFeedback": true
                }
            }
        ]
    },
    {
        "id": "R-EARLY",
        "errorFamily": "EARLY",
        "studentFacing": {
            "titleUiId": "R-EARLY.TITLE",
            "ryanUtteranceIds": [
                "R-EARLY.1",
                "R-EARLY.2",
                "R-EARLY.3"
            ]
        },
        "authorOnly": {
            "trigger": "Second subtract-before-convert pattern or explicit attempt to subtract unlike numerators first.",
            "classificationCaution": "Use a fresh discriminating item when the wrong value does not reveal order of operations."
        },
        "timeline": [
            {
                "id": "R-EARLY.C1",
                "utteranceId": "R-EARLY.1",
                "anchorText": "before the pieces matched",
                "authorOnlyAction": "Freeze a wrong subtraction attempt while eighth and quarter pieces remain unequal.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the wrong attempt paused beside unequal piece widths."
            },
            {
                "id": "R-EARLY.C2",
                "utteranceId": "R-EARLY.2",
                "anchorText": "First rename",
                "authorOnlyAction": "Move the rename card before the subtraction card and show 1/4 = 2/8.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the ordered rename step followed by the subtraction step."
            },
            {
                "id": "R-EARLY.C3",
                "utteranceId": "R-EARLY.3",
                "anchorText": "leaves five eighths",
                "authorOnlyAction": "Complete 7/8 - 2/8 = 5/8.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the completed ordered working."
            }
        ],
        "supportedInteraction": {
            "id": "R-EARLY-S",
            "stage": "repair_supported",
            "family": [
                "EARLY"
            ],
            "studentFacing": {
                "stageLabelUiId": "STAGE.TURN",
                "titleUiId": "R-EARLY.TITLE",
                "promptUiIds": [
                    "R-EARLY.SUPPORTED.PROMPT"
                ],
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Supported sequencing interaction after R-EARLY.",
                "routeNotes": [
                    "Fresh no-hint recheck follows even after success."
                ],
                "leakageNotes": [
                    "No final difference is shown before the cards are ordered."
                ]
            },
            "math": {
                "kind": "fraction_subtraction",
                "operation": "subtract",
                "first": {
                    "numerator": 5,
                    "denominator": 6
                },
                "second": {
                    "numerator": 1,
                    "denominator": 3
                },
                "readyDenominator": 6,
                "scaleFirst": 1,
                "scaleSecond": 2,
                "convertedFirst": {
                    "numerator": 5,
                    "denominator": 6
                },
                "convertedSecond": {
                    "numerator": 2,
                    "denominator": 6
                },
                "resultAtReadyDenominator": {
                    "numerator": 3,
                    "denominator": 6
                },
                "simplifiedResult": {
                    "numerator": 1,
                    "denominator": 2
                },
                "positiveResult": true,
                "oneConversionOnly": true
            },
            "visual": {
                "kind": "ordered_step_cards",
                "stepUiIds": [
                    "R-EARLY.STEP.READY",
                    "R-EARLY.STEP.RENAME",
                    "R-EARLY.STEP.SUBTRACT",
                    "R-EARLY.STEP.KEEP"
                ],
                "accessibleDescriptionUiId": "R-EARLY.SUPPORTED.ACCESS",
                "deriveAllNumbersFromMath": true
            },
            "response": {
                "kind": "ordered_steps",
                "stepIds": [
                    "READY",
                    "RENAME",
                    "SUBTRACT",
                    "KEEP"
                ]
            },
            "answer": {
                "kind": "ordered_steps",
                "correctOrder": [
                    "READY",
                    "RENAME",
                    "SUBTRACT",
                    "KEEP"
                ]
            },
            "policy": {
                "scored": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_outcome_when_authored",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": false,
                "supportedSuccessCountsAsIndependent": false,
                "workingRequiresAnswerLocked": false
            },
            "feedback": {
                "correct": {
                    "uiIds": [
                        "R-EARLY.SUPPORTED.CORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "incorrectDefault": {
                    "uiIds": [
                        "R-EARLY.SUPPORTED.INCORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "errorSpecific": [],
                "computeCorrectnessBeforeFeedback": true,
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterErrorSpecific": true
            },
            "workedCheck": null
        },
        "freshRechecks": [
            {
                "id": "R-EARLY-RC-A",
                "stage": "repair_recheck",
                "family": [
                    "DIRECT",
                    "EARLY"
                ],
                "studentFacing": {
                    "stageLabelUiId": "STAGE.TURN",
                    "titleUiId": "R-EARLY.TITLE",
                    "promptUiIds": [
                        "R-EARLY.RECHECK.A.PROMPT"
                    ],
                    "ryanBeforeSubmitUtteranceIds": []
                },
                "authorOnly": {
                    "assessmentIntent": "Storyboard-named fresh check, used only when the 11/15 - 1/5 signature is unseen.",
                    "routeNotes": [
                        "Select this only if I1 has not already been shown in the current attempt."
                    ],
                    "leakageNotes": [
                        "No step cards or hint."
                    ]
                },
                "math": {
                    "kind": "fraction_subtraction",
                    "operation": "subtract",
                    "first": {
                        "numerator": 11,
                        "denominator": 15
                    },
                    "second": {
                        "numerator": 1,
                        "denominator": 5
                    },
                    "readyDenominator": 15,
                    "scaleFirst": 1,
                    "scaleSecond": 3,
                    "convertedFirst": {
                        "numerator": 11,
                        "denominator": 15
                    },
                    "convertedSecond": {
                        "numerator": 3,
                        "denominator": 15
                    },
                    "resultAtReadyDenominator": {
                        "numerator": 8,
                        "denominator": 15
                    },
                    "simplifiedResult": {
                        "numerator": 8,
                        "denominator": 15
                    },
                    "positiveResult": true,
                    "oneConversionOnly": true
                },
                "visual": {
                    "kind": "symbolic_fraction_result",
                    "workedLineVisibleBeforeSubmit": false,
                    "accessibleDescriptionUiId": "C-DIRECT.ACCESS",
                    "deriveAllNumbersFromMath": true
                },
                "response": {
                    "kind": "fraction",
                    "numeratorField": "numerator",
                    "denominatorField": "denominator"
                },
                "answer": {
                    "kind": "fraction_value",
                    "canonical": {
                        "numerator": 8,
                        "denominator": 15
                    },
                    "acceptExactEquivalent": true
                },
                "policy": {
                    "scored": true,
                    "answerLocksOnSubmit": true,
                    "hintPolicy": "none",
                    "solutionPolicy": "after_locked_submit",
                    "eligibleForIndependentMastery": true,
                    "firstAttemptIsAuthoritative": false,
                    "supportedSuccessCountsAsIndependent": false,
                    "workingRequiresAnswerLocked": true
                },
                "feedback": {
                    "correct": {
                        "uiIds": [
                            "R-EARLY.RECHECK.CORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "incorrectDefault": {
                        "uiIds": [
                            "R-EARLY.RECHECK.INCORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "errorSpecific": [],
                    "computeCorrectnessBeforeFeedback": true,
                    "playExactlyOneOutcomeBranch": true,
                    "doNotPlayDefaultAfterErrorSpecific": true
                },
                "workedCheck": {
                    "visibleStepUiIds": [
                        "R-EARLY.RECHECK.A.WORK"
                    ],
                    "requiresAnswerLocked": true,
                    "mustFollowOutcomeFeedback": true
                }
            },
            {
                "id": "R-EARLY-RC-B",
                "stage": "repair_recheck",
                "family": [
                    "DIRECT",
                    "EARLY"
                ],
                "studentFacing": {
                    "stageLabelUiId": "STAGE.TURN",
                    "titleUiId": "R-EARLY.TITLE",
                    "promptUiIds": [
                        "R-EARLY.RECHECK.B.PROMPT"
                    ],
                    "ryanBeforeSubmitUtteranceIds": []
                },
                "authorOnly": {
                    "assessmentIntent": "Freshness-safe alternate when I1 has already used the storyboard-named values.",
                    "routeNotes": [
                        "Select this if the 11/15 - 1/5 signature is already in seen history."
                    ],
                    "leakageNotes": [
                        "No step cards or hint."
                    ]
                },
                "math": {
                    "kind": "fraction_subtraction",
                    "operation": "subtract",
                    "first": {
                        "numerator": 19,
                        "denominator": 24
                    },
                    "second": {
                        "numerator": 1,
                        "denominator": 6
                    },
                    "readyDenominator": 24,
                    "scaleFirst": 1,
                    "scaleSecond": 4,
                    "convertedFirst": {
                        "numerator": 19,
                        "denominator": 24
                    },
                    "convertedSecond": {
                        "numerator": 4,
                        "denominator": 24
                    },
                    "resultAtReadyDenominator": {
                        "numerator": 15,
                        "denominator": 24
                    },
                    "simplifiedResult": {
                        "numerator": 5,
                        "denominator": 8
                    },
                    "positiveResult": true,
                    "oneConversionOnly": true
                },
                "visual": {
                    "kind": "symbolic_fraction_result",
                    "workedLineVisibleBeforeSubmit": false,
                    "accessibleDescriptionUiId": "C-DIRECT.ACCESS",
                    "deriveAllNumbersFromMath": true
                },
                "response": {
                    "kind": "fraction",
                    "numeratorField": "numerator",
                    "denominatorField": "denominator"
                },
                "answer": {
                    "kind": "fraction_value",
                    "canonical": {
                        "numerator": 5,
                        "denominator": 8
                    },
                    "acceptExactEquivalent": true
                },
                "policy": {
                    "scored": true,
                    "answerLocksOnSubmit": true,
                    "hintPolicy": "none",
                    "solutionPolicy": "after_locked_submit",
                    "eligibleForIndependentMastery": true,
                    "firstAttemptIsAuthoritative": false,
                    "supportedSuccessCountsAsIndependent": false,
                    "workingRequiresAnswerLocked": true
                },
                "feedback": {
                    "correct": {
                        "uiIds": [
                            "R-EARLY.RECHECK.CORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "incorrectDefault": {
                        "uiIds": [
                            "R-EARLY.RECHECK.INCORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "errorSpecific": [],
                    "computeCorrectnessBeforeFeedback": true,
                    "playExactlyOneOutcomeBranch": true,
                    "doNotPlayDefaultAfterErrorSpecific": true
                },
                "workedCheck": {
                    "visibleStepUiIds": [
                        "R-EARLY.RECHECK.B.WORK"
                    ],
                    "requiresAnswerLocked": true,
                    "mustFollowOutcomeFeedback": true
                }
            }
        ]
    },
    {
        "id": "R-ORDER",
        "errorFamily": "ORDER",
        "studentFacing": {
            "titleUiId": "R-ORDER.TITLE",
            "ryanUtteranceIds": [
                "R-ORDER.1",
                "R-ORDER.2",
                "R-ORDER.3"
            ]
        },
        "authorOnly": {
            "trigger": "Repeated operand reversal or explicit larger-minus-smaller rule.",
            "classificationCaution": "All core values have positive results; this branch teaches order, not negative fractions."
        },
        "timeline": [
            {
                "id": "R-ORDER.C1",
                "utteranceId": "R-ORDER.1",
                "anchorText": "order changed",
                "authorOnlyAction": "Show the correct conversion beside the incorrectly swapped line.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show correct conversion and cross the swapped line."
            },
            {
                "id": "R-ORDER.C2",
                "utteranceId": "R-ORDER.2",
                "anchorText": "starting amount",
                "authorOnlyAction": "Frame 3/4 and its 6/8 equivalent as the first amount.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show the first amount in a persistent start frame."
            },
            {
                "id": "R-ORDER.C3",
                "utteranceId": "R-ORDER.3",
                "anchorText": "Keep the order shown",
                "authorOnlyAction": "Lock 6/8 - 5/8 and prevent a swap animation.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 6/8 first and 5/8 second with fixed order markers."
            }
        ],
        "supportedInteraction": {
            "id": "R-ORDER-S",
            "stage": "repair_supported",
            "family": [
                "ORDER"
            ],
            "studentFacing": {
                "stageLabelUiId": "STAGE.TURN",
                "titleUiId": "R-ORDER.TITLE",
                "promptUiIds": [
                    "R-ORDER.SUPPORTED.PROMPT"
                ],
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Supported order choice after R-ORDER.",
                "routeNotes": [
                    "Success requires the fresh independent recheck."
                ],
                "leakageNotes": [
                    "No final result is visible before selection."
                ]
            },
            "math": {
                "kind": "fraction_subtraction",
                "operation": "subtract",
                "first": {
                    "numerator": 7,
                    "denominator": 10
                },
                "second": {
                    "numerator": 3,
                    "denominator": 5
                },
                "readyDenominator": 10,
                "scaleFirst": 1,
                "scaleSecond": 2,
                "convertedFirst": {
                    "numerator": 7,
                    "denominator": 10
                },
                "convertedSecond": {
                    "numerator": 6,
                    "denominator": 10
                },
                "resultAtReadyDenominator": {
                    "numerator": 1,
                    "denominator": 10
                },
                "simplifiedResult": {
                    "numerator": 1,
                    "denominator": 10
                },
                "positiveResult": true,
                "oneConversionOnly": true
            },
            "visual": {
                "kind": "multiple_choice_symbolic_lines",
                "optionUiIds": [
                    "R-ORDER.OPTION.A",
                    "R-ORDER.OPTION.B",
                    "R-ORDER.OPTION.C"
                ],
                "accessibleDescriptionUiId": "R-ORDER.SUPPORTED.ACCESS",
                "deriveAllNumbersFromMath": true
            },
            "response": {
                "kind": "single_choice",
                "optionIds": [
                    "A",
                    "B",
                    "C"
                ]
            },
            "answer": {
                "kind": "single_choice",
                "correctOptionId": "A"
            },
            "policy": {
                "scored": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_outcome_when_authored",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": false,
                "supportedSuccessCountsAsIndependent": false,
                "workingRequiresAnswerLocked": false
            },
            "feedback": {
                "correct": {
                    "uiIds": [
                        "R-ORDER.SUPPORTED.CORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "incorrectDefault": {
                    "uiIds": [
                        "R-ORDER.SUPPORTED.INCORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "errorSpecific": [],
                "computeCorrectnessBeforeFeedback": true,
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterErrorSpecific": true
            },
            "workedCheck": null
        },
        "freshRechecks": [
            {
                "id": "R-ORDER-RC",
                "stage": "repair_recheck",
                "family": [
                    "DIRECT",
                    "ORDER"
                ],
                "studentFacing": {
                    "stageLabelUiId": "STAGE.TURN",
                    "titleUiId": "R-ORDER.TITLE",
                    "promptUiIds": [
                        "R-ORDER.RECHECK.PROMPT"
                    ],
                    "ryanBeforeSubmitUtteranceIds": []
                },
                "authorOnly": {
                    "assessmentIntent": "Fresh independent order recheck after R-ORDER.",
                    "routeNotes": [
                        "Accept 2/12 and exact equivalents such as 1/6."
                    ],
                    "leakageNotes": [
                        "No order cue or hint before submit."
                    ]
                },
                "math": {
                    "kind": "fraction_subtraction",
                    "operation": "subtract",
                    "first": {
                        "numerator": 11,
                        "denominator": 12
                    },
                    "second": {
                        "numerator": 3,
                        "denominator": 4
                    },
                    "readyDenominator": 12,
                    "scaleFirst": 1,
                    "scaleSecond": 3,
                    "convertedFirst": {
                        "numerator": 11,
                        "denominator": 12
                    },
                    "convertedSecond": {
                        "numerator": 9,
                        "denominator": 12
                    },
                    "resultAtReadyDenominator": {
                        "numerator": 2,
                        "denominator": 12
                    },
                    "simplifiedResult": {
                        "numerator": 1,
                        "denominator": 6
                    },
                    "positiveResult": true,
                    "oneConversionOnly": true
                },
                "visual": {
                    "kind": "symbolic_fraction_result",
                    "workedLineVisibleBeforeSubmit": false,
                    "accessibleDescriptionUiId": "C-DIRECT.ACCESS",
                    "deriveAllNumbersFromMath": true
                },
                "response": {
                    "kind": "fraction",
                    "numeratorField": "numerator",
                    "denominatorField": "denominator"
                },
                "answer": {
                    "kind": "fraction_value",
                    "canonical": {
                        "numerator": 1,
                        "denominator": 6
                    },
                    "acceptExactEquivalent": true
                },
                "policy": {
                    "scored": true,
                    "answerLocksOnSubmit": true,
                    "hintPolicy": "none",
                    "solutionPolicy": "after_locked_submit",
                    "eligibleForIndependentMastery": true,
                    "firstAttemptIsAuthoritative": false,
                    "supportedSuccessCountsAsIndependent": false,
                    "workingRequiresAnswerLocked": true
                },
                "feedback": {
                    "correct": {
                        "uiIds": [
                            "R-ORDER.RECHECK.CORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "incorrectDefault": {
                        "uiIds": [
                            "R-ORDER.RECHECK.INCORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "errorSpecific": [],
                    "computeCorrectnessBeforeFeedback": true,
                    "playExactlyOneOutcomeBranch": true,
                    "doNotPlayDefaultAfterErrorSpecific": true
                },
                "workedCheck": {
                    "visibleStepUiIds": [
                        "R-ORDER.RECHECK.WORK"
                    ],
                    "requiresAnswerLocked": true,
                    "mustFollowOutcomeFeedback": true
                }
            }
        ]
    },
    {
        "id": "R-DENOM",
        "errorFamily": "DENOM",
        "studentFacing": {
            "titleUiId": "R-DENOM.TITLE",
            "ryanUtteranceIds": [
                "R-DENOM.1",
                "R-DENOM.2",
                "R-DENOM.3"
            ]
        },
        "authorOnly": {
            "trigger": "Repeated denominator change after denominators already match.",
            "classificationCaution": "Do not reteach equivalence here; begin after the common unit is established."
        },
        "timeline": [
            {
                "id": "R-DENOM.C1",
                "utteranceId": "R-DENOM.1",
                "anchorText": "matched as tenths",
                "authorOnlyAction": "Align 7/10 and 4/10 on a tenths grid.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show both fractions on the same tenths grid."
            },
            {
                "id": "R-DENOM.C2",
                "utteranceId": "R-DENOM.2",
                "anchorText": "how many tenths remain",
                "authorOnlyAction": "Animate or mark 7 - 4 = 3 above the numerators.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 7 - 4 = 3 while denominators stay fixed."
            },
            {
                "id": "R-DENOM.C3",
                "utteranceId": "R-DENOM.3",
                "anchorText": "denominator stays ten",
                "authorOnlyAction": "Lock denominator 10 and cross out 3/5 and 3/0 alternatives.",
                "mustNotOccurBeforeAnchor": true,
                "reducedMotionEquivalent": "Show 3/10 with denominator 10 locked and invalid alternatives crossed."
            }
        ],
        "supportedInteraction": {
            "id": "R-DENOM-S",
            "stage": "repair_supported",
            "family": [
                "DENOM"
            ],
            "studentFacing": {
                "stageLabelUiId": "STAGE.TURN",
                "titleUiId": "R-DENOM.TITLE",
                "promptUiIds": [
                    "R-DENOM.SUPPORTED.PROMPT"
                ],
                "ryanBeforeSubmitUtteranceIds": []
            },
            "authorOnly": {
                "assessmentIntent": "Supported denominator-retention interaction.",
                "routeNotes": [
                    "Only the numerator is editable."
                ],
                "leakageNotes": [
                    "The denominator remains fixed and cannot be changed."
                ]
            },
            "math": {
                "kind": "fraction_subtraction",
                "operation": "subtract",
                "first": {
                    "numerator": 8,
                    "denominator": 9
                },
                "second": {
                    "numerator": 3,
                    "denominator": 9
                },
                "readyDenominator": 9,
                "scaleFirst": 1,
                "scaleSecond": 1,
                "convertedFirst": {
                    "numerator": 8,
                    "denominator": 9
                },
                "convertedSecond": {
                    "numerator": 3,
                    "denominator": 9
                },
                "resultAtReadyDenominator": {
                    "numerator": 5,
                    "denominator": 9
                },
                "simplifiedResult": {
                    "numerator": 5,
                    "denominator": 9
                },
                "positiveResult": true,
                "oneConversionOnly": false
            },
            "visual": {
                "kind": "matched_denominator_numerator_field",
                "fixedDenominator": 9,
                "accessibleDescriptionUiId": "R-DENOM.SUPPORTED.ACCESS",
                "deriveAllNumbersFromMath": true
            },
            "response": {
                "kind": "integer_fields",
                "fieldIds": [
                    "resultNumerator"
                ]
            },
            "answer": {
                "kind": "integer_fields",
                "expected": {
                    "resultNumerator": 5
                }
            },
            "policy": {
                "scored": true,
                "answerLocksOnSubmit": true,
                "hintPolicy": "none",
                "solutionPolicy": "after_outcome_when_authored",
                "eligibleForIndependentMastery": false,
                "firstAttemptIsAuthoritative": false,
                "supportedSuccessCountsAsIndependent": false,
                "workingRequiresAnswerLocked": false
            },
            "feedback": {
                "correct": {
                    "uiIds": [
                        "R-DENOM.SUPPORTED.CORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "incorrectDefault": {
                    "uiIds": [
                        "R-DENOM.SUPPORTED.INCORRECT"
                    ],
                    "ryanUtteranceIds": []
                },
                "errorSpecific": [],
                "computeCorrectnessBeforeFeedback": true,
                "playExactlyOneOutcomeBranch": true,
                "doNotPlayDefaultAfterErrorSpecific": true
            },
            "workedCheck": null
        },
        "freshRechecks": [
            {
                "id": "R-DENOM-RC",
                "stage": "repair_recheck",
                "family": [
                    "DENOM"
                ],
                "studentFacing": {
                    "stageLabelUiId": "STAGE.TURN",
                    "titleUiId": "R-DENOM.TITLE",
                    "promptUiIds": [
                        "R-DENOM.RECHECK.PROMPT"
                    ],
                    "ryanBeforeSubmitUtteranceIds": []
                },
                "authorOnly": {
                    "assessmentIntent": "Fresh independent denominator-retention recheck.",
                    "routeNotes": [
                        "No visual or hint."
                    ],
                    "leakageNotes": [
                        "Only the result numerator is editable."
                    ]
                },
                "math": {
                    "kind": "fraction_subtraction",
                    "operation": "subtract",
                    "first": {
                        "numerator": 13,
                        "denominator": 15
                    },
                    "second": {
                        "numerator": 6,
                        "denominator": 15
                    },
                    "readyDenominator": 15,
                    "scaleFirst": 1,
                    "scaleSecond": 1,
                    "convertedFirst": {
                        "numerator": 13,
                        "denominator": 15
                    },
                    "convertedSecond": {
                        "numerator": 6,
                        "denominator": 15
                    },
                    "resultAtReadyDenominator": {
                        "numerator": 7,
                        "denominator": 15
                    },
                    "simplifiedResult": {
                        "numerator": 7,
                        "denominator": 15
                    },
                    "positiveResult": true,
                    "oneConversionOnly": false
                },
                "visual": {
                    "kind": "matched_denominator_numerator_field",
                    "fixedDenominator": 15,
                    "workedLineVisibleBeforeSubmit": false,
                    "accessibleDescriptionUiId": "C-ARITH.ACCESS",
                    "deriveAllNumbersFromMath": true
                },
                "response": {
                    "kind": "integer_fields",
                    "fieldIds": [
                        "resultNumerator"
                    ]
                },
                "answer": {
                    "kind": "integer_fields",
                    "expected": {
                        "resultNumerator": 7
                    }
                },
                "policy": {
                    "scored": true,
                    "answerLocksOnSubmit": true,
                    "hintPolicy": "none",
                    "solutionPolicy": "after_locked_submit",
                    "eligibleForIndependentMastery": true,
                    "firstAttemptIsAuthoritative": false,
                    "supportedSuccessCountsAsIndependent": false,
                    "workingRequiresAnswerLocked": true
                },
                "feedback": {
                    "correct": {
                        "uiIds": [
                            "R-DENOM.RECHECK.CORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "incorrectDefault": {
                        "uiIds": [
                            "R-DENOM.RECHECK.INCORRECT"
                        ],
                        "ryanUtteranceIds": []
                    },
                    "errorSpecific": [],
                    "computeCorrectnessBeforeFeedback": true,
                    "playExactlyOneOutcomeBranch": true,
                    "doNotPlayDefaultAfterErrorSpecific": true
                },
                "workedCheck": {
                    "visibleStepUiIds": [
                        "R-DENOM.RECHECK.WORK"
                    ],
                    "requiresAnswerLocked": true,
                    "mustFollowOutcomeFeedback": true
                }
            }
        ]
    }
];
exports.FRA21_RECOVERY_BANK = [
    {
        "id": "RM-DIRECT-1",
        "stage": "recovery",
        "family": [
            "DIRECT",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-DIRECT-1.TITLE",
            "promptUiIds": [
                "RM-DIRECT-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families DIRECT, PROCEDURAL.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 19,
                "denominator": 24
            },
            "second": {
                "numerator": 1,
                "denominator": 6
            },
            "readyDenominator": 24,
            "scaleFirst": 1,
            "scaleSecond": 4,
            "convertedFirst": {
                "numerator": 19,
                "denominator": 24
            },
            "convertedSecond": {
                "numerator": 4,
                "denominator": 24
            },
            "resultAtReadyDenominator": {
                "numerator": 15,
                "denominator": 24
            },
            "simplifiedResult": {
                "numerator": 5,
                "denominator": 8
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_or_context_fraction_result",
            "accessibleDescriptionUiId": "RM-DIRECT-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 5,
                "denominator": 8
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-DIRECT-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-DIRECT-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-DIRECT-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-DIRECT-2",
        "stage": "recovery",
        "family": [
            "DIRECT",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-DIRECT-2.TITLE",
            "promptUiIds": [
                "RM-DIRECT-2.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families DIRECT, PROCEDURAL.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 17,
                "denominator": 18
            },
            "second": {
                "numerator": 2,
                "denominator": 9
            },
            "readyDenominator": 18,
            "scaleFirst": 1,
            "scaleSecond": 2,
            "convertedFirst": {
                "numerator": 17,
                "denominator": 18
            },
            "convertedSecond": {
                "numerator": 4,
                "denominator": 18
            },
            "resultAtReadyDenominator": {
                "numerator": 13,
                "denominator": 18
            },
            "simplifiedResult": {
                "numerator": 13,
                "denominator": 18
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_or_context_fraction_result",
            "accessibleDescriptionUiId": "RM-DIRECT-2.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 13,
                "denominator": 18
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-DIRECT-2.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-DIRECT-2.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-DIRECT-2.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-FIRST-1",
        "stage": "recovery",
        "family": [
            "FIRST_CHANGES",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-FIRST-1.TITLE",
            "promptUiIds": [
                "RM-FIRST-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families FIRST_CHANGES, PROCEDURAL.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 4,
                "denominator": 5
            },
            "second": {
                "numerator": 3,
                "denominator": 10
            },
            "readyDenominator": 10,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 8,
                "denominator": 10
            },
            "convertedSecond": {
                "numerator": 3,
                "denominator": 10
            },
            "resultAtReadyDenominator": {
                "numerator": 5,
                "denominator": 10
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 2
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_or_context_fraction_result",
            "accessibleDescriptionUiId": "RM-FIRST-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 1,
                "denominator": 2
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-FIRST-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-FIRST-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-FIRST-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-FIRST-2",
        "stage": "recovery",
        "family": [
            "FIRST_CHANGES",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-FIRST-2.TITLE",
            "promptUiIds": [
                "RM-FIRST-2.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families FIRST_CHANGES, PROCEDURAL.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 5,
                "denominator": 6
            },
            "second": {
                "numerator": 1,
                "denominator": 12
            },
            "readyDenominator": 12,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 10,
                "denominator": 12
            },
            "convertedSecond": {
                "numerator": 1,
                "denominator": 12
            },
            "resultAtReadyDenominator": {
                "numerator": 9,
                "denominator": 12
            },
            "simplifiedResult": {
                "numerator": 3,
                "denominator": 4
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_or_context_fraction_result",
            "accessibleDescriptionUiId": "RM-FIRST-2.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 3,
                "denominator": 4
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-FIRST-2.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-FIRST-2.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-FIRST-2.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-STEP-1",
        "stage": "recovery",
        "family": [
            "STEP",
            "MISSING",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-STEP-1.TITLE",
            "promptUiIds": [
                "RM-STEP-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families STEP, MISSING, PROCEDURAL.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 7,
                "denominator": 12
            },
            "second": {
                "numerator": 1,
                "denominator": 3
            },
            "readyDenominator": 12,
            "scaleFirst": 1,
            "scaleSecond": 4,
            "convertedFirst": {
                "numerator": 7,
                "denominator": 12
            },
            "convertedSecond": {
                "numerator": 4,
                "denominator": 12
            },
            "resultAtReadyDenominator": {
                "numerator": 3,
                "denominator": 12
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 4
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "form_sensitive_common_denominator_fields",
            "fixedDenominator": 12,
            "accessibleDescriptionUiId": "RM-STEP-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "integer_fields",
            "fieldIds": [
                "convertedFirstNumerator",
                "resultNumerator"
            ]
        },
        "answer": {
            "kind": "integer_fields",
            "expected": {
                "convertedFirstNumerator": 7,
                "resultNumerator": 3
            }
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-STEP-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-STEP-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-STEP-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-METHOD-1",
        "stage": "recovery",
        "family": [
            "ERROR",
            "STEP",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-METHOD-1.TITLE",
            "promptUiIds": [
                "RM-METHOD-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families ERROR, STEP, REASONING_APPLICATION.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 7,
                "denominator": 9
            },
            "second": {
                "numerator": 2,
                "denominator": 3
            },
            "readyDenominator": 9,
            "scaleFirst": 1,
            "scaleSecond": 3,
            "convertedFirst": {
                "numerator": 7,
                "denominator": 9
            },
            "convertedSecond": {
                "numerator": 6,
                "denominator": 9
            },
            "resultAtReadyDenominator": {
                "numerator": 1,
                "denominator": 9
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 9
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "multiple_choice_symbolic_lines",
            "optionUiIds": [
                "RM-METHOD-1.OPTION.A",
                "RM-METHOD-1.OPTION.B",
                "RM-METHOD-1.OPTION.C",
                "RM-METHOD-1.OPTION.D"
            ],
            "accessibleDescriptionUiId": "RM-METHOD-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "single_choice",
            "optionIds": [
                "A",
                "B",
                "C",
                "D"
            ]
        },
        "answer": {
            "kind": "single_choice",
            "correctOptionId": "A"
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-METHOD-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-METHOD-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-METHOD-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-VIS-1",
        "stage": "recovery",
        "family": [
            "VIS",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-VIS-1.TITLE",
            "promptUiIds": [
                "RM-VIS-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families VIS, REASONING_APPLICATION.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 11,
                "denominator": 14
            },
            "second": {
                "numerator": 1,
                "denominator": 7
            },
            "readyDenominator": 14,
            "scaleFirst": 1,
            "scaleSecond": 2,
            "convertedFirst": {
                "numerator": 11,
                "denominator": 14
            },
            "convertedSecond": {
                "numerator": 2,
                "denominator": 14
            },
            "resultAtReadyDenominator": {
                "numerator": 9,
                "denominator": 14
            },
            "simplifiedResult": {
                "numerator": 9,
                "denominator": 14
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_or_context_fraction_result",
            "accessibleDescriptionUiId": "RM-VIS-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 9,
                "denominator": 14
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-VIS-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-VIS-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-VIS-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-CONTEXT-1",
        "stage": "recovery",
        "family": [
            "CONTEXT",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-CONTEXT-1.TITLE",
            "promptUiIds": [
                "RM-CONTEXT-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families CONTEXT, REASONING_APPLICATION.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 13,
                "denominator": 15
            },
            "second": {
                "numerator": 1,
                "denominator": 5
            },
            "readyDenominator": 15,
            "scaleFirst": 1,
            "scaleSecond": 3,
            "convertedFirst": {
                "numerator": 13,
                "denominator": 15
            },
            "convertedSecond": {
                "numerator": 3,
                "denominator": 15
            },
            "resultAtReadyDenominator": {
                "numerator": 10,
                "denominator": 15
            },
            "simplifiedResult": {
                "numerator": 2,
                "denominator": 3
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_or_context_fraction_result",
            "accessibleDescriptionUiId": "RM-CONTEXT-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 2,
                "denominator": 3
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-CONTEXT-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-CONTEXT-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-CONTEXT-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-CONTEXT-2",
        "stage": "recovery",
        "family": [
            "CONTEXT",
            "FIRST_CHANGES",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-CONTEXT-2.TITLE",
            "promptUiIds": [
                "RM-CONTEXT-2.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families CONTEXT, FIRST_CHANGES, REASONING_APPLICATION.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 3,
                "denominator": 4
            },
            "second": {
                "numerator": 1,
                "denominator": 8
            },
            "readyDenominator": 8,
            "scaleFirst": 2,
            "scaleSecond": 1,
            "convertedFirst": {
                "numerator": 6,
                "denominator": 8
            },
            "convertedSecond": {
                "numerator": 1,
                "denominator": 8
            },
            "resultAtReadyDenominator": {
                "numerator": 5,
                "denominator": 8
            },
            "simplifiedResult": {
                "numerator": 5,
                "denominator": 8
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "symbolic_or_context_fraction_result",
            "accessibleDescriptionUiId": "RM-CONTEXT-2.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "fraction",
            "numeratorField": "numerator",
            "denominatorField": "denominator"
        },
        "answer": {
            "kind": "fraction_value",
            "canonical": {
                "numerator": 5,
                "denominator": 8
            },
            "acceptExactEquivalent": true
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-CONTEXT-2.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-CONTEXT-2.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-CONTEXT-2.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-ERROR-1",
        "stage": "recovery",
        "family": [
            "ERROR",
            "REASON",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-ERROR-1.TITLE",
            "promptUiIds": [
                "RM-ERROR-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families ERROR, REASON, REASONING_APPLICATION.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 13,
                "denominator": 18
            },
            "second": {
                "numerator": 1,
                "denominator": 3
            },
            "readyDenominator": 18,
            "scaleFirst": 1,
            "scaleSecond": 6,
            "convertedFirst": {
                "numerator": 13,
                "denominator": 18
            },
            "convertedSecond": {
                "numerator": 6,
                "denominator": 18
            },
            "resultAtReadyDenominator": {
                "numerator": 7,
                "denominator": 18
            },
            "simplifiedResult": {
                "numerator": 7,
                "denominator": 18
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "multiple_choice_error_analysis",
            "optionUiIds": [
                "RM-ERROR-1.OPTION.A",
                "RM-ERROR-1.OPTION.B",
                "RM-ERROR-1.OPTION.C",
                "RM-ERROR-1.OPTION.D"
            ],
            "accessibleDescriptionUiId": "RM-ERROR-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "single_choice",
            "optionIds": [
                "A",
                "B",
                "C",
                "D"
            ]
        },
        "answer": {
            "kind": "single_choice",
            "correctOptionId": "B"
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-ERROR-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-ERROR-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-ERROR-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-DENOM-1",
        "stage": "recovery",
        "family": [
            "DENOM",
            "PROCEDURAL"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-DENOM-1.TITLE",
            "promptUiIds": [
                "RM-DENOM-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families DENOM, PROCEDURAL.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 8,
                "denominator": 9
            },
            "second": {
                "numerator": 2,
                "denominator": 3
            },
            "readyDenominator": 9,
            "scaleFirst": 1,
            "scaleSecond": 3,
            "convertedFirst": {
                "numerator": 8,
                "denominator": 9
            },
            "convertedSecond": {
                "numerator": 6,
                "denominator": 9
            },
            "resultAtReadyDenominator": {
                "numerator": 2,
                "denominator": 9
            },
            "simplifiedResult": {
                "numerator": 2,
                "denominator": 9
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "form_sensitive_common_denominator_fields",
            "fixedDenominator": 9,
            "accessibleDescriptionUiId": "RM-DENOM-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "integer_fields",
            "fieldIds": [
                "resultNumerator"
            ]
        },
        "answer": {
            "kind": "integer_fields",
            "expected": {
                "resultNumerator": 2
            }
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-DENOM-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-DENOM-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-DENOM-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    },
    {
        "id": "RM-ORDER-1",
        "stage": "recovery",
        "family": [
            "ORDER",
            "REASONING_APPLICATION"
        ],
        "studentFacing": {
            "stageLabelUiId": "STAGE.FINAL",
            "titleUiId": "RM-ORDER-1.TITLE",
            "promptUiIds": [
                "RM-ORDER-1.PROMPT",
                "FINAL.INSTRUCTION"
            ],
            "ryanBeforeSubmitUtteranceIds": []
        },
        "authorOnly": {
            "assessmentIntent": "Deterministic authored recovery item for families ORDER, REASONING_APPLICATION.",
            "routeNotes": [
                "Select only when unseen in current attempt; never generate recovery mathematics at runtime."
            ],
            "leakageNotes": [
                "No hint or working before answer lock."
            ]
        },
        "math": {
            "kind": "fraction_subtraction",
            "operation": "subtract",
            "first": {
                "numerator": 11,
                "denominator": 12
            },
            "second": {
                "numerator": 2,
                "denominator": 3
            },
            "readyDenominator": 12,
            "scaleFirst": 1,
            "scaleSecond": 4,
            "convertedFirst": {
                "numerator": 11,
                "denominator": 12
            },
            "convertedSecond": {
                "numerator": 8,
                "denominator": 12
            },
            "resultAtReadyDenominator": {
                "numerator": 3,
                "denominator": 12
            },
            "simplifiedResult": {
                "numerator": 1,
                "denominator": 4
            },
            "positiveResult": true,
            "oneConversionOnly": true
        },
        "visual": {
            "kind": "multiple_choice_symbolic_lines",
            "optionUiIds": [
                "RM-ORDER-1.OPTION.A",
                "RM-ORDER-1.OPTION.B",
                "RM-ORDER-1.OPTION.C",
                "RM-ORDER-1.OPTION.D"
            ],
            "accessibleDescriptionUiId": "RM-ORDER-1.ACCESS",
            "deriveAllNumbersFromMath": true
        },
        "response": {
            "kind": "single_choice",
            "optionIds": [
                "A",
                "B",
                "C",
                "D"
            ]
        },
        "answer": {
            "kind": "single_choice",
            "correctOptionId": "A"
        },
        "policy": {
            "scored": true,
            "answerLocksOnSubmit": true,
            "hintPolicy": "none",
            "solutionPolicy": "after_locked_submit",
            "eligibleForIndependentMastery": true,
            "firstAttemptIsAuthoritative": true,
            "supportedSuccessCountsAsIndependent": false,
            "workingRequiresAnswerLocked": true
        },
        "feedback": {
            "correct": {
                "uiIds": [
                    "RM-ORDER-1.CORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "incorrectDefault": {
                "uiIds": [
                    "RM-ORDER-1.INCORRECT"
                ],
                "ryanUtteranceIds": []
            },
            "errorSpecific": [],
            "computeCorrectnessBeforeFeedback": true,
            "playExactlyOneOutcomeBranch": true,
            "doNotPlayDefaultAfterErrorSpecific": true
        },
        "workedCheck": {
            "visibleStepUiIds": [
                "RM-ORDER-1.WORK"
            ],
            "requiresAnswerLocked": true,
            "mustFollowOutcomeFeedback": true
        }
    }
];
const BANNED_RUNTIME_PATTERNS = [
    /\bcodex\b/i,
    /\bauthor(?:ing)?[- ]only\b/i,
    /\bassessment intent\b/i,
    /\broute label\b/i,
    /\bdiagnostic(?: layer)?\b/i,
    /\bretrieval(?: layer)?\b/i,
    /\bimplementation\b/i,
    /\bquality assurance\b/i,
    /\bqa\b/i,
    /\bblocking misconception\b/i,
    /\bscored item\b/i,
    /\bruntime copy\b/i,
    /strip away the story/i,
];
const BLOCKING_FAMILIES = new Set(["BOTH", "SCALE", "EARLY", "ORDER", "DENOM"]);
exports.FRA21 = {
    id: "FRA21",
    displayId: "FRA-21",
    title: "Subtract Fractions Where One Denominator Is a Multiple of the Other",
    status: "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
    contentVersion: "FRA21-HANDOFF-V1",
    sourceOfTruth: {
        runtimeCopyQuestionsRoutesAndOutcomes: "FRA21_CANONICAL_SPEC.ts",
        visualGeometryAndOwnerApprovedPedagogy: "Revily_FRA-21_Storyboard_v1.pdf",
        engineeringIntegrationAndQA: "FRA21_CODEX_IMPLEMENTATION_PROMPT.md",
        startInstruction: "FRA21_START_CODEX_PROMPT.txt",
        precedenceRule: "Ryan may speak only FRA21_RUNTIME_COPY[utteranceId].text. The PDF remains the approved visual and pedagogical reference; its headings, route notes, QA language and authoring directions must never be transcribed into Ryan speech or captions.",
        engineeringReference: "The existing canonical Revily FRA lesson shell, TTS/caption/cue system, fraction inputs, exact fraction validation, evidence routing, hints, answer locking, persistence, accessibility and responsive visual primitives.",
    },
    approval: {
        ownerApprovedForCodexHandoff: true,
        productionRepositoryImplementationPerformed: false,
        projectWideCanonicalStatusGranted: false,
    },
    scope: {
        objective: "Subtract positive fractions when one denominator is a multiple of the other by changing only the required fraction.",
        studentFacingIdea: "Match the piece size. Change one fraction. Then subtract.",
        prerequisites: [
            "FRA-08: generate equivalent fractions using the same factor on numerator and denominator.",
            "FRA-20: subtract fractions once denominators already match.",
            "P-N05: recognise multiples so the ready denominator can be identified.",
            "Whole-number multiplication and subtraction facts used by the authored values.",
        ],
        teaches: [
            "identify the denominator that is already a multiple of the other",
            "leave the fraction already written in ready-sized pieces unchanged",
            "rename exactly one fraction with the same integer factor on numerator and denominator",
            "preserve the original subtraction order",
            "subtract the matched numerators",
            "retain the common denominator as the unchanged piece size",
            "apply the method in symbolic, visual, missing-step, context and error-analysis items",
        ],
        deliberatelyLaterOrExcluded: [
            "FRA-22: subtraction where both denominators need changing or general unlike-denominator subtraction",
            "FRA-C02: mixed-number subtraction and exchange",
            "FRA-10 simplification as the stated objective",
            "negative fraction results",
            "algebraic fractions",
            "decimal or percentage conversion",
            "LCM as the learner method",
            "global Diagnostic placement",
            "Retrieval, spaced review or future-session scheduling",
            "runtime LLM-authored questions, hints, feedback or repairs",
        ],
        numericalEnvelope: {
            smallerDenominatorMin: 2,
            smallerDenominatorMax: 10,
            scaleFactorMin: 2,
            scaleFactorMax: 6,
            largerDenominatorMax: 30,
            requirePositiveResult: true,
            requireExactlyOneStartingDenominatorToDivideTheOther: true,
        },
    },
    mentalModel: [
        "Spot the ready denominator.",
        "Leave the fraction already in that piece size alone.",
        "Rename the other fraction using the same factor on top and bottom.",
        "Subtract in the original order.",
        "Keep the common denominator because the piece size has not changed.",
    ],
    sharedLearnerUi: {
        buttonUiIds: ["BUTTON.CHECK", "BUTTON.CHECK_THREE", "BUTTON.SUBMIT", "BUTTON.HINT"],
        teachingVisualLabelUiIds: ["LABEL.NOT_SAME_SIZE", "LABEL.MATCH_PIECES"],
        lockedAnswerStatusUiIds: ["LABEL.LOCKED_ANSWER", "FINAL.ACCESS.LOCK"],
        neutralFeedbackUiId: "FEEDBACK.UNKNOWN",
        arithmeticFeedbackUiId: "FEEDBACK.ARITHMETIC",
    },
    runtimeCopyRegistry: exports.FRA21_RUNTIME_COPY,
    learnerUiRegistry: exports.FRA21_LEARNER_UI_COPY,
    teachingScenes: exports.FRA21_TEACHING_SCENES,
    questions: exports.FRA21_CORE_QUESTIONS,
    confirmations: exports.FRA21_CONFIRMATIONS,
    repairs: exports.FRA21_REPAIRS,
    recoveryBank: exports.FRA21_RECOVERY_BANK,
    finalCheck: {
        introUtteranceIds: ["FINAL.INTRO"],
        itemIds: ["M1", "M2", "M3", "M4", "M5"],
        noHintsBeforeSubmit: true,
        answerLockBeforeWorking: true,
        completionUtteranceIds: ["COMPLETE.1"],
    },
    routing: {
        finalIntroUtteranceIds: ["FINAL.INTRO"],
        completionUtteranceIds: ["COMPLETE.1"],
        sequence: [
            "HOOK",
            "T1",
            "T2",
            "T3",
            "T4",
            "HANDOFF",
            "G1",
            "G2",
            "GUIDED_GATE",
            "OPTIONAL_F1",
            "F2",
            "I1",
            "I2",
            "CONFIRM_OR_REPAIR_IF_NEEDED",
            "M1",
            "M2",
            "M3",
            "M4",
            "M5",
            "FINAL_ROUTE",
        ],
        strongGuidedGate: "G1 and G2 first-attempt correct, no hint/support escalation and no unresolved central error; skip F1 but retain F2.",
        hintConfirmationMap: {
            F1: "C-DIRECT",
            I1: "C-DIRECT",
            F2: "C-FIRST",
            I2: "C-FIRST",
            arithmeticSlip: "C-ARITHMETIC",
        },
        finalRules: {
            qualifyingFinish: "4-5/5 independently correct, procedural plus reasoning/application coverage, and no blocking family repeated.",
            threeOfFive: "Targeted repair, then two unseen no-hint recovery items; require 2/2.",
            zeroToTwoOfFive: "Targeted repair, then three unseen no-hint recovery items; require 3/3 or mark another pass needed.",
        },
    },
    evidenceContract: {
        fields: [
            "questionId",
            "stage",
            "attempts",
            "firstAttemptCorrect",
            "hintOpenedBeforeSubmit",
            "supportEscalated",
            "answerLocked",
            "errorFamily",
            "classificationConfidence",
            "freshConfirmationPassed",
            "assessmentFamilies",
            "contentVersion",
        ],
        rules: [
            "Hint opening is support usage, not a wrong answer.",
            "Correct after hint is supported success and needs a fresh no-hint same-family confirmation.",
            "One ambiguous wrong response does not prove a misconception.",
            "Repeated or explicit blocking evidence triggers the matching repair and a fresh check.",
            "Guided success alone cannot finish the lesson.",
            "Final evidence uses the first committed pre-working response.",
        ],
    },
    sourceCompletionNotes: [
        {
            id: "SC-01",
            note: "The storyboard supplies most error-specific feedback but not a complete correct/default branch for every non-final scored item. This handoff adds minimal non-spoken learner UI feedback so every response has an honest mutually exclusive branch. No new Ryan speech was added.",
        },
        {
            id: "SC-02",
            note: "The storyboard fixes the 3/5 and 0-2/5 recovery counts but does not enumerate all unseen recovery items. FRA21_RECOVERY_BANK supplies twelve deterministic authored items. Runtime generation or improvisation is prohibited.",
        },
        {
            id: "SC-03",
            note: "R-EARLY names 11/15 - 1/5 as a fresh recheck even though I1 uses the same signature. Use R-EARLY-RC-A only when unseen; otherwise use the authored alternate R-EARLY-RC-B.",
        },
        {
            id: "SC-04",
            note: "The implementation data makes G2 a single result-numerator field over fixed denominator 12 and keeps M2 form-sensitive to the two requested numerator fields. These choices match the storyboard mockups and prevent equivalent-value answers from bypassing the assessed step.",
        },
        {
            id: "SC-05",
            note: "Hint confirmation mapping is explicit: F1/I1 use C-DIRECT, F2/I2 use C-FIRST, and an isolated correct-structure arithmetic slip uses C-ARITHMETIC. Each confirmation is no-hint and unseen within the attempt.",
        },
    ],
    implementationBoundaries: {
        withinLessonAdaptivityOnly: true,
        diagnosticLayer: false,
        retrievalLayer: false,
        runtimeQuestionGeneration: false,
        permanentTranscriptBar: false,
        authorOnlyCopyMayReachTts: false,
        captionsDeriveFromSameRuntimeText: true,
        finalWorkingRequiresAnswerLock: true,
    },
};
function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const t = x % y;
        x = y;
        y = t;
    }
    return x;
}
function simplifyFraction(value) {
    if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
        throw new Error("Fraction fields must be integers.");
    }
    if (value.denominator === 0)
        throw new Error("Denominator cannot be zero.");
    const sign = value.denominator < 0 ? -1 : 1;
    const g = gcd(value.numerator, value.denominator);
    return { numerator: sign * value.numerator / g, denominator: Math.abs(value.denominator) / g };
}
function fractionsEqual(a, b) {
    if (a.denominator === 0 || b.denominator === 0)
        return false;
    return a.numerator * b.denominator === b.numerator * a.denominator;
}
function subtractWhenOneDenominatorIsMultiple(first, second) {
    if (first.denominator <= 0 || second.denominator <= 0) {
        throw new Error("FRA21 uses positive denominators.");
    }
    let readyDenominator;
    if (first.denominator % second.denominator === 0)
        readyDenominator = first.denominator;
    else if (second.denominator % first.denominator === 0)
        readyDenominator = second.denominator;
    else
        throw new Error("FRA21 requires one starting denominator to divide the other exactly.");
    const scaleFirst = readyDenominator / first.denominator;
    const scaleSecond = readyDenominator / second.denominator;
    const convertedFirst = { numerator: first.numerator * scaleFirst, denominator: readyDenominator };
    const convertedSecond = { numerator: second.numerator * scaleSecond, denominator: readyDenominator };
    const resultAtReadyDenominator = {
        numerator: convertedFirst.numerator - convertedSecond.numerator,
        denominator: readyDenominator,
    };
    if (resultAtReadyDenominator.numerator <= 0) {
        throw new Error("Core FRA21 authored items require a positive difference.");
    }
    return {
        readyDenominator,
        convertedFirst,
        convertedSecond,
        resultAtReadyDenominator,
        simplifiedResult: simplifyFraction(resultAtReadyDenominator),
        scaleFirst,
        scaleSecond,
    };
}
function allQuestions() {
    const repairItems = [];
    for (const repair of exports.FRA21_REPAIRS) {
        repairItems.push(repair.supportedInteraction);
        for (const recheck of repair.freshRechecks)
            repairItems.push(recheck);
    }
    return [
        ...exports.FRA21_CORE_QUESTIONS,
        ...exports.FRA21_CONFIRMATIONS,
        ...repairItems,
        ...exports.FRA21_RECOVERY_BANK,
    ];
}
function getFRA21Question(questionId) {
    const found = allQuestions().find((item) => item.id === questionId);
    if (!found)
        throw new Error(`Unknown FRA21 question ID: ${questionId}`);
    return found;
}
function recordEquals(actual, expected) {
    const expectedKeys = Object.keys(expected);
    if (Object.keys(actual).length !== expectedKeys.length)
        return false;
    return expectedKeys.every((key) => Number.isFinite(actual[key]) && actual[key] === expected[key]);
}
function answerMatches(answer, response) {
    switch (answer.kind) {
        case "integer_fields":
            return response.kind === "integer_fields" && recordEquals(response.values, answer.expected);
        case "fraction_value":
            if (response.kind !== "fraction")
                return false;
            if (answer.requiredDenominator !== undefined && response.value.denominator !== answer.requiredDenominator) {
                return false;
            }
            return answer.acceptExactEquivalent
                ? fractionsEqual(response.value, answer.canonical)
                : response.value.numerator === answer.canonical.numerator &&
                    response.value.denominator === answer.canonical.denominator;
        case "single_choice":
            return response.kind === "single_choice" && response.optionId === answer.correctOptionId;
        case "composite":
            if (response.kind !== "composite")
                return false;
            if (answer.correctOptionId !== undefined && response.optionId !== answer.correctOptionId)
                return false;
            if (answer.expectedFields !== undefined)
                return recordEquals(response.values ?? {}, answer.expectedFields);
            return true;
        case "ordered_steps":
            return (response.kind === "ordered_steps" &&
                response.order.length === answer.correctOrder.length &&
                response.order.every((value, index) => value === answer.correctOrder[index]));
    }
}
function fractionResponseEquals(response, expected) {
    return response.kind === "fraction" &&
        response.value.numerator === expected.numerator &&
        response.value.denominator === expected.denominator;
}
function matchesPredicate(predicateId, response) {
    if (predicateId === "G1_SCALE_DENOMINATOR_ONLY" && response.kind === "integer_fields") {
        return response.values.convertedNumerator === 4 || response.values.firstNumerator === 4;
    }
    if (predicateId === "G1_CONVERSION_CORRECT_RESULT_WRONG" && response.kind === "integer_fields") {
        return response.values.convertedNumerator === 8 && response.values.firstNumerator === 8 && response.values.resultNumerator !== 7;
    }
    if (predicateId === "G2_NOT_SEVEN_AND_NOT_ARITHMETIC_ONLY" && response.kind === "integer_fields") {
        return response.values.resultNumerator !== 7;
    }
    if (predicateId === "G2_CONVERSION_EVIDENCE_CORRECT_ARITHMETIC_WRONG")
        return false;
    if (predicateId === "F1_WRONG_DENOMINATOR" && response.kind === "fraction") {
        return response.value.denominator !== 9;
    }
    if (predicateId === "I1_VALUE_WRONG_DENOMINATOR" && response.kind === "fraction") {
        return response.value.numerator === 8 && response.value.denominator !== 15;
    }
    if (predicateId === "I2_ORDER_OR_LARGER_MINUS_SMALLER" && response.kind === "fraction") {
        return response.value.numerator === 2 || response.value.numerator < 0;
    }
    if (predicateId === "I2_CORRECT_NUMERATOR_WRONG_DENOMINATOR" && response.kind === "fraction") {
        return response.value.numerator === 1 && response.value.denominator !== 8;
    }
    if (predicateId === "M2_FIRST_FIELD_UNSCALED" && response.kind === "integer_fields") {
        return response.values.convertedFirstNumerator === 5;
    }
    if (predicateId === "M2_CONVERSION_CORRECT_RESULT_WRONG" && response.kind === "integer_fields") {
        return response.values.convertedFirstNumerator === 10 && response.values.resultNumerator !== 3;
    }
    if (predicateId === "M4_CORRECT_NUMERATOR_WRONG_DENOMINATOR" && response.kind === "fraction") {
        return response.value.numerator === 7 && response.value.denominator !== 10;
    }
    return false;
}
function signalMatches(signal, response) {
    const match = signal.match;
    if (!match)
        return false;
    if (typeof match.optionId === "string") {
        return response.kind === "single_choice" && response.optionId === match.optionId;
    }
    if (match.fractionEquals && typeof match.fractionEquals === "object") {
        return fractionResponseEquals(response, match.fractionEquals);
    }
    if (typeof match.predicateId === "string")
        return matchesPredicate(match.predicateId, response);
    return false;
}
function evaluateFRA21Question(questionId, response) {
    const question = getFRA21Question(questionId);
    const correct = answerMatches(question.answer, response);
    if (correct) {
        return {
            questionId,
            correct: true,
            answerLocked: true,
            feedbackUiIds: question.feedback.correct.uiIds,
            ryanUtteranceIds: question.feedback.correct.ryanUtteranceIds,
        };
    }
    const signal = question.feedback.errorSpecific.find((candidate) => signalMatches(candidate, response));
    if (signal) {
        return {
            questionId,
            correct: false,
            answerLocked: true,
            matchedErrorFamily: String(signal.family),
            feedbackUiIds: signal.uiIds ?? [],
            ryanUtteranceIds: signal.ryanUtteranceIds ?? [],
        };
    }
    return {
        questionId,
        correct: false,
        answerLocked: true,
        matchedErrorFamily: "UNKNOWN",
        feedbackUiIds: question.feedback.incorrectDefault.uiIds,
        ryanUtteranceIds: question.feedback.incorrectDefault.ryanUtteranceIds,
    };
}
function routeFRA21GuidedGate(records) {
    const g1 = records.find((record) => record.questionId === "G1");
    const g2 = records.find((record) => record.questionId === "G2");
    const clean = [g1, g2].every((record) => record?.firstAttemptCorrect === true &&
        record.hintOpenedBeforeSubmit === false &&
        record.supportEscalated === false &&
        !record.errorFamily);
    return clean ? "fast_skip_f1_keep_f2" : "standard_f1_then_f2";
}
function requiredConfirmationForSupportedQuestion(questionId) {
    if (questionId === "F1" || questionId === "I1")
        return "C-DIRECT";
    if (questionId === "F2" || questionId === "I2")
        return "C-FIRST";
    if (questionId === "C-ARITHMETIC")
        return "C-ARITHMETIC";
    return null;
}
function selectRepairFamily(records) {
    const counts = new Map();
    for (const record of records) {
        if (!record.errorFamily || !BLOCKING_FAMILIES.has(record.errorFamily))
            continue;
        const weight = record.classificationConfidence === "explicit" ? 2 : 1;
        counts.set(record.errorFamily, (counts.get(record.errorFamily) ?? 0) + weight);
    }
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const [family, score] = ranked[0] ?? [];
    return family && score >= 2 ? family : null;
}
function routeFRA21Final(input) {
    if (input.independentlyCorrectCount >= 4) {
        if (input.proceduralFamilyCorrect &&
            input.reasoningOrApplicationFamilyCorrect &&
            !input.repeatedBlockingMisconception) {
            return "finish_candidate";
        }
        return "repair_blocker_then_confirmation";
    }
    if (input.independentlyCorrectCount === 3)
        return "repair_then_two_item_minicheck";
    return "repair_then_three_item_final";
}
function hashSeed(seed, text) {
    let h = seed >>> 0;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}
function seededRank(seed, id) {
    let x = hashSeed(seed, id) || 0x9e3779b9;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
}
function selectFRA21RecoveryItems(input) {
    const seen = new Set(input.seenQuestionIds);
    const preferred = new Set(input.preferredFamilies);
    const available = exports.FRA21_RECOVERY_BANK.filter((item) => !seen.has(item.id));
    if (available.length < input.count)
        throw new Error("Not enough unseen FRA21 recovery items.");
    const sorted = [...available].sort((a, b) => {
        const aMatch = a.family.some((family) => preferred.has(family)) ? 1 : 0;
        const bMatch = b.family.some((family) => preferred.has(family)) ? 1 : 0;
        if (aMatch !== bMatch)
            return bMatch - aMatch;
        return seededRank(input.seed, a.id) - seededRank(input.seed, b.id);
    });
    const selected = [];
    const procedural = sorted.find((item) => item.family.includes("PROCEDURAL"));
    const reasoning = sorted.find((item) => item.family.includes("REASONING_APPLICATION"));
    if (procedural)
        selected.push(procedural);
    if (reasoning && !selected.some((item) => item.id === reasoning.id))
        selected.push(reasoning);
    for (const item of sorted) {
        if (selected.length >= input.count)
            break;
        if (!selected.some((chosen) => chosen.id === item.id))
            selected.push(item);
    }
    return selected.slice(0, input.count).map((item) => item.id);
}
function selectFRA21EarlyRepairRecheck(seenQuestionIds) {
    const seen = new Set(seenQuestionIds);
    return seen.has("I1") || seen.has("R-EARLY-RC-A") ? "R-EARLY-RC-B" : "R-EARLY-RC-A";
}
function collectObjects(value, out) {
    if (!value || typeof value !== "object")
        return;
    out.push(value);
    if (Array.isArray(value)) {
        for (const item of value)
            collectObjects(item, out);
        return;
    }
    for (const child of Object.values(value))
        collectObjects(child, out);
}
function collectIdReferences(value, path, runtime, ui) {
    if (!value || typeof value !== "object")
        return;
    if (Array.isArray(value)) {
        value.forEach((item, index) => collectIdReferences(item, `${path}[${index}]`, runtime, ui));
        return;
    }
    for (const [key, child] of Object.entries(value)) {
        const childPath = `${path}.${key}`;
        const normalizedKey = key.toLowerCase();
        if (normalizedKey.endsWith("utteranceid") && typeof child === "string")
            runtime.push({ path: childPath, id: child });
        if (normalizedKey.endsWith("utteranceids") && Array.isArray(child)) {
            child.forEach((id, index) => {
                if (typeof id === "string")
                    runtime.push({ path: `${childPath}[${index}]`, id });
            });
        }
        if (normalizedKey.endsWith("uiid") && typeof child === "string")
            ui.push({ path: childPath, id: child });
        if (normalizedKey.endsWith("uiids") && Array.isArray(child)) {
            child.forEach((id, index) => {
                if (typeof id === "string")
                    ui.push({ path: `${childPath}[${index}]`, id });
            });
        }
        collectIdReferences(child, childPath, runtime, ui);
    }
}
function mathSignature(math) {
    if (math.kind !== "fraction_subtraction")
        return null;
    const first = math.first;
    const second = math.second;
    return `${first.numerator}/${first.denominator}-${second.numerator}/${second.denominator}`;
}
/**
 * Static self-audit for the handoff. Codex must reproduce equivalent tests in
 * the actual repository and still complete browser/audio/mobile QA.
 */
function validateFRA21CanonicalSpec() {
    const errors = [];
    const runtimeRegistry = exports.FRA21_RUNTIME_COPY;
    const uiRegistry = exports.FRA21_LEARNER_UI_COPY;
    // 1. Runtime registry purity, learner-only speech and exact duplicate check.
    const seenRuntimeText = new Map();
    for (const [id, utterance] of Object.entries(runtimeRegistry)) {
        if (utterance.audience !== "learner" || utterance.spokenBy !== "Ryan") {
            errors.push(`${id}: runtime utterance must be learner-facing Ryan speech.`);
        }
        if (utterance.captionSource !== "same_as_audio") {
            errors.push(`${id}: caption must derive from the same audio text.`);
        }
        const normalized = utterance.text.trim().replace(/\s+/g, " ").toLowerCase();
        if (!normalized)
            errors.push(`${id}: runtime text is empty.`);
        const duplicate = seenRuntimeText.get(normalized);
        if (duplicate)
            errors.push(`${id}: exact duplicate runtime sentence already used by ${duplicate}.`);
        else
            seenRuntimeText.set(normalized, id);
        for (const pattern of BANNED_RUNTIME_PATTERNS) {
            if (pattern.test(utterance.text))
                errors.push(`${id}: banned authoring/engineering language appears in Ryan copy.`);
        }
    }
    // 2. Runtime/UI reference integrity and full runtime usage.
    const runtimeRefs = [];
    const uiRefs = [];
    collectIdReferences(exports.FRA21, "FRA21", runtimeRefs, uiRefs);
    const referencedRuntime = new Set();
    for (const ref of runtimeRefs) {
        referencedRuntime.add(ref.id);
        if (!runtimeRegistry[ref.id])
            errors.push(`${ref.path}: missing runtime utterance ${ref.id}.`);
    }
    for (const [id] of Object.entries(runtimeRegistry)) {
        if (!referencedRuntime.has(id))
            errors.push(`${id}: runtime utterance is not referenced.`);
    }
    const referencedUi = new Set();
    for (const ref of uiRefs) {
        referencedUi.add(ref.id);
        if (!uiRegistry[ref.id])
            errors.push(`${ref.path}: missing learner UI copy ${ref.id}.`);
    }
    for (const [id, copy] of Object.entries(uiRegistry)) {
        if (copy.speechPolicy !== "never_automatic_ryan")
            errors.push(`${id}: learner UI copy is not protected from automatic Ryan speech.`);
        if (!referencedUi.has(id))
            errors.push(`${id}: learner UI copy is not referenced by the canonical contract.`);
    }
    // 3. A second speech/caption string is forbidden.
    const objects = [];
    collectObjects(exports.FRA21, objects);
    for (const object of objects) {
        if (!object || typeof object !== "object")
            continue;
        const record = object;
        for (const forbidden of ["captionText", "spokenText", "ryanText", "transcriptText"]) {
            if (Object.prototype.hasOwnProperty.call(record, forbidden))
                errors.push(`Forbidden duplicate speech field found: ${forbidden}.`);
        }
    }
    // 4. Cue-to-utterance and anchor parity, including reduced motion.
    const cueContainers = [
        ...exports.FRA21_TEACHING_SCENES,
        ...exports.FRA21_REPAIRS,
    ];
    for (const container of cueContainers) {
        for (const cue of container.timeline ?? []) {
            const utterance = runtimeRegistry[cue.utteranceId];
            if (!utterance) {
                errors.push(`${cue.id}: missing utterance ${cue.utteranceId}.`);
                continue;
            }
            if (!utterance.text.toLowerCase().includes(String(cue.anchorText).toLowerCase())) {
                errors.push(`${cue.id}: anchor text is absent from ${cue.utteranceId}.`);
            }
            if (cue.mustNotOccurBeforeAnchor !== true)
                errors.push(`${cue.id}: cue may fire before spoken anchor.`);
            if (!String(cue.reducedMotionEquivalent ?? "").trim())
                errors.push(`${cue.id}: reduced-motion equivalent is missing.`);
        }
    }
    // 5. Semantic repetition: adjacent authored lines must add distinct communication goals.
    for (const scene of exports.FRA21_TEACHING_SCENES) {
        const ids = scene.studentFacing.ryanUtteranceIds ?? [];
        for (let index = 1; index < ids.length; index += 1) {
            const previous = runtimeRegistry[ids[index - 1]];
            const current = runtimeRegistry[ids[index]];
            if (previous && current && previous.communicationGoal === current.communicationGoal) {
                errors.push(`${scene.id}: adjacent Ryan lines repeat communication goal ${current.communicationGoal}.`);
            }
        }
    }
    // 6. Every scored item has honest mutually exclusive outcomes.
    const questions = allQuestions();
    const ids = new Set();
    for (const item of questions) {
        if (ids.has(item.id))
            errors.push(`Duplicate question ID: ${item.id}.`);
        ids.add(item.id);
        if (item.policy.hintPolicy === "optional_collapsed" && !item.studentFacing.hintUiId) {
            errors.push(`${item.id}: optional collapsed hint policy lacks a learner hint UI reference.`);
        }
        if (item.policy.hintPolicy === "none" && item.studentFacing.hintUiId) {
            errors.push(`${item.id}: no-hint policy incorrectly exposes a hint UI reference.`);
        }
        if (!item.feedback.computeCorrectnessBeforeFeedback)
            errors.push(`${item.id}: correctness is not computed before feedback.`);
        if (!item.feedback.playExactlyOneOutcomeBranch)
            errors.push(`${item.id}: does not require exactly one outcome branch.`);
        if (!item.feedback.doNotPlayDefaultAfterErrorSpecific)
            errors.push(`${item.id}: may stack default after error-specific feedback.`);
        const correctSurface = [...item.feedback.correct.uiIds, ...item.feedback.correct.ryanUtteranceIds].join("|");
        const incorrectSurface = [...item.feedback.incorrectDefault.uiIds, ...item.feedback.incorrectDefault.ryanUtteranceIds].join("|");
        if (!correctSurface)
            errors.push(`${item.id}: correct branch is empty.`);
        if (!incorrectSurface)
            errors.push(`${item.id}: incorrect branch is empty.`);
        if (correctSurface && correctSurface === incorrectSurface)
            errors.push(`${item.id}: correct and incorrect surfaces are identical.`);
    }
    // 7. Final items: exactly five, no hints, lock before working.
    const finals = exports.FRA21_CORE_QUESTIONS.filter((item) => item.stage === "final");
    if (finals.length !== 5)
        errors.push(`Expected five final items; found ${finals.length}.`);
    for (const item of finals) {
        if (item.policy.hintPolicy !== "none")
            errors.push(`${item.id}: final hint must be none.`);
        if (!item.policy.answerLocksOnSubmit || !item.policy.workingRequiresAnswerLocked)
            errors.push(`${item.id}: final answer-lock contract failed.`);
        if (!item.workedCheck?.requiresAnswerLocked)
            errors.push(`${item.id}: final worked check can appear before lock.`);
        if (!item.feedback.correct.ryanUtteranceIds.includes("FINAL.CORRECT"))
            errors.push(`${item.id}: final correct branch lacks canonical Ryan line.`);
        if (!item.feedback.incorrectDefault.ryanUtteranceIds.includes("FINAL.INCORRECT"))
            errors.push(`${item.id}: final incorrect branch lacks canonical Ryan line.`);
    }
    // 8. Mathematical invariants for every authored subtraction item.
    for (const item of questions) {
        if (item.math.kind !== "fraction_subtraction")
            continue;
        const first = item.math.first;
        const second = item.math.second;
        let computed;
        try {
            computed = subtractWhenOneDenominatorIsMultiple(first, second);
        }
        catch (error) {
            errors.push(`${item.id}: invalid FRA21 subtraction math: ${String(error)}.`);
            continue;
        }
        if (computed.readyDenominator !== item.math.readyDenominator)
            errors.push(`${item.id}: ready denominator mismatch.`);
        const authoredResult = item.math.resultAtReadyDenominator;
        if (!fractionsEqual(computed.resultAtReadyDenominator, authoredResult))
            errors.push(`${item.id}: authored result does not match computed subtraction.`);
        if (item.stage !== "repair_supported" && first.denominator !== second.denominator) {
            const smaller = Math.min(first.denominator, second.denominator);
            const larger = Math.max(first.denominator, second.denominator);
            const factor = larger / smaller;
            if (!Number.isInteger(factor) || factor < 2 || factor > 6 || larger > 30) {
                errors.push(`${item.id}: authored denominator envelope is outside FRA21 limits.`);
            }
        }
        if (item.answer.kind === "fraction_value" && !fractionsEqual(item.answer.canonical, computed.simplifiedResult)) {
            errors.push(`${item.id}: canonical accepted fraction is not equal to computed result.`);
        }
    }
    // 9. Key item-specific contracts.
    if (evaluateFRA21Question("G1", { kind: "integer_fields", values: { convertedNumerator: 8, firstNumerator: 8, resultNumerator: 7 } }).correct !== true) {
        errors.push("G1 exact answer evaluation failed.");
    }
    if (evaluateFRA21Question("M2", { kind: "integer_fields", values: { convertedFirstNumerator: 10, resultNumerator: 3 } }).correct !== true) {
        errors.push("M2 form-sensitive answer evaluation failed.");
    }
    if (evaluateFRA21Question("M2", { kind: "fraction", value: { numerator: 1, denominator: 4 } }).correct !== false) {
        errors.push("M2 incorrectly accepts a value-only equivalent response.");
    }
    if (evaluateFRA21Question("M3", { kind: "fraction", value: { numerator: 1, denominator: 2 } }).correct !== true) {
        errors.push("M3 should accept exact equivalent one half.");
    }
    if (evaluateFRA21Question("M5", { kind: "single_choice", optionId: "B" }).correct !== true) {
        errors.push("M5 correct option evaluation failed.");
    }
    // 10. Route helper checks.
    const cleanGuided = [
        { questionId: "G1", stage: "guided", firstAttemptCorrect: true, correct: true, attempts: 1, hintOpenedBeforeSubmit: false, supportEscalated: false, answerLocked: true, assessmentFamilies: ["STEP"] },
        { questionId: "G2", stage: "guided", firstAttemptCorrect: true, correct: true, attempts: 1, hintOpenedBeforeSubmit: false, supportEscalated: false, answerLocked: true, assessmentFamilies: ["CONTEXT"] },
    ];
    if (routeFRA21GuidedGate(cleanGuided) !== "fast_skip_f1_keep_f2")
        errors.push("Strong guided gate failed.");
    if (routeFRA21GuidedGate([{ ...cleanGuided[0], firstAttemptCorrect: false }, cleanGuided[1]]) !== "standard_f1_then_f2")
        errors.push("Standard guided gate failed.");
    if (routeFRA21Final({ independentlyCorrectCount: 4, proceduralFamilyCorrect: true, reasoningOrApplicationFamilyCorrect: true, repeatedBlockingMisconception: false }) !== "finish_candidate")
        errors.push("4/5 final route failed.");
    if (routeFRA21Final({ independentlyCorrectCount: 3, proceduralFamilyCorrect: true, reasoningOrApplicationFamilyCorrect: true, repeatedBlockingMisconception: false }) !== "repair_then_two_item_minicheck")
        errors.push("3/5 final route failed.");
    if (routeFRA21Final({ independentlyCorrectCount: 2, proceduralFamilyCorrect: true, reasoningOrApplicationFamilyCorrect: true, repeatedBlockingMisconception: false }) !== "repair_then_three_item_final")
        errors.push("0-2/5 final route failed.");
    // 11. Recovery bank uniqueness, freshness signatures and 1,000-seed selector audit.
    const recoveryIds = new Set();
    const recoverySignatures = new Set();
    const coreSignatures = new Set(exports.FRA21_CORE_QUESTIONS
        .map((item) => mathSignature(item.math))
        .filter((value) => Boolean(value)));
    for (const item of exports.FRA21_RECOVERY_BANK) {
        if (recoveryIds.has(item.id))
            errors.push(`Duplicate recovery ID ${item.id}.`);
        recoveryIds.add(item.id);
        const signature = mathSignature(item.math);
        if (signature) {
            if (recoverySignatures.has(signature))
                errors.push(`Duplicate recovery math signature ${signature}.`);
            recoverySignatures.add(signature);
            if (coreSignatures.has(signature))
                errors.push(`Recovery item ${item.id} repeats a core question signature.`);
        }
    }
    for (let seed = 0; seed < 1000; seed += 1) {
        for (const count of [2, 3]) {
            const selected = selectFRA21RecoveryItems({ count, preferredFamilies: [seed % 2 === 0 ? "DIRECT" : "CONTEXT"], seenQuestionIds: [], seed });
            if (selected.length !== count || new Set(selected).size !== count) {
                errors.push(`Recovery selector failed at seed ${seed} count ${count}.`);
                break;
            }
        }
    }
    // 12. Freshness-safe early repair choice.
    if (selectFRA21EarlyRepairRecheck([]) !== "R-EARLY-RC-A")
        errors.push("Fresh R-EARLY primary recheck selection failed.");
    if (selectFRA21EarlyRepairRecheck(["I1"]) !== "R-EARLY-RC-B")
        errors.push("R-EARLY alternate freshness selection failed.");
    // 13. Source completions are explicit and finite.
    if (exports.FRA21.sourceCompletionNotes.length !== 5)
        errors.push("Expected five explicit source-completion notes.");
    if (exports.FRA21.implementationBoundaries.diagnosticLayer !== false || exports.FRA21.implementationBoundaries.retrievalLayer !== false) {
        errors.push("Diagnostic/Retrieval boundary is not preserved.");
    }
    return errors;
}
/**
 * Map this specification onto the existing Revily FRA lesson engine. Do not
 * create a standalone FRA21 page, a second lesson engine or lesson-specific
 * clones of shared TTS/caption/evidence/persistence infrastructure.
 */

  window.RevilyFra21V1 = Object.freeze({
    spec: exports.FRA21,
    runtimeCopy: exports.FRA21_RUNTIME_COPY,
    learnerUiCopy: exports.FRA21_LEARNER_UI_COPY,
    teachingScenes: exports.FRA21_TEACHING_SCENES,
    coreQuestions: exports.FRA21_CORE_QUESTIONS,
    confirmations: exports.FRA21_CONFIRMATIONS,
    repairs: exports.FRA21_REPAIRS,
    recoveryBank: exports.FRA21_RECOVERY_BANK,
    validateCanonicalSpec: exports.validateFRA21CanonicalSpec,
    evaluateQuestion: exports.evaluateFRA21Question,
    getQuestionById: exports.getFRA21Question,
    routeGuidedGate: exports.routeFRA21GuidedGate,
    requiredConfirmation: exports.requiredConfirmationForSupportedQuestion,
    selectRepairFamily: exports.selectRepairFamily,
    routeFinal: exports.routeFRA21Final,
    selectRecoveryItems: exports.selectFRA21RecoveryItems,
    selectEarlyRepairRecheck: exports.selectFRA21EarlyRepairRecheck,
    fractionsEqual: exports.fractionsEqual,
    simplifyFraction: exports.simplifyFraction,
    subtract: exports.subtractWhenOneDenominatorIsMultiple
  });
})();
