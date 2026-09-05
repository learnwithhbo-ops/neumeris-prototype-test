var RevilyFra24ApprovedSpec = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // FRA24_CANONICAL_SPEC.ts
  var FRA24_CANONICAL_SPEC_exports = {};
  __export(FRA24_CANONICAL_SPEC_exports, {
    FRA24: () => FRA24,
    FRA24_ALL_QUESTIONS: () => FRA24_ALL_QUESTIONS,
    FRA24_CONFIRMATIONS: () => FRA24_CONFIRMATIONS,
    FRA24_CONFIRMATION_MAP: () => FRA24_CONFIRMATION_MAP,
    FRA24_CUES: () => FRA24_CUES,
    FRA24_QUESTIONS: () => FRA24_QUESTIONS,
    FRA24_RECOVERY_BY_FAMILY: () => FRA24_RECOVERY_BY_FAMILY,
    FRA24_RECOVERY_ITEMS: () => FRA24_RECOVERY_ITEMS,
    FRA24_REPAIRS: () => FRA24_REPAIRS,
    FRA24_REPAIR_ITEMS: () => FRA24_REPAIR_ITEMS,
    FRA24_ROUTE: () => FRA24_ROUTE,
    FRA24_RUNTIME_COPY: () => FRA24_RUNTIME_COPY,
    FRA24_SOURCE_COMPLETION_NOTES: () => FRA24_SOURCE_COMPLETION_NOTES,
    FRA24_TEACHING_SCENES: () => FRA24_TEACHING_SCENES,
    areEquivalentFractions: () => areEquivalentFractions,
    assertFRA24CanonicalSpec: () => assertFRA24CanonicalSpec,
    evaluateFRA24Final: () => evaluateFRA24Final,
    gcd: () => gcd,
    markFRA24Response: () => markFRA24Response,
    rawProductFromQuestion: () => rawProductFromQuestion,
    reduceFraction: () => reduceFraction,
    requiredFRA24ConfirmationIds: () => requiredFRA24ConfirmationIds,
    runFRA24StaticAssertions: () => runFRA24StaticAssertions,
    selectFRA24RecoveryItemIds: () => selectFRA24RecoveryItemIds,
    shouldSkipFRA24F1: () => shouldSkipFRA24F1,
    validateFRA24CanonicalSpec: () => validateFRA24CanonicalSpec
  });
  var FRA24_RUNTIME_COPY = {
    "HOOK.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "prompt",
      "communicationGoal": "state_first_fractional_condition",
      "text": "This map is three quarters unlocked.",
      "captionSource": "same_as_audio"
    },
    "HOOK.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "prompt",
      "communicationGoal": "state_second_fractional_condition",
      "text": "Only two thirds of the unlocked area has been scanned.",
      "captionSource": "same_as_audio"
    },
    "HOOK.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "prompt",
      "communicationGoal": "invite_unscored_size_prediction",
      "text": "Quick prediction: does the scanned part cover less than half, exactly half, or more than half of the whole map?",
      "captionSource": "same_as_audio"
    },
    "HOOK.FEEDBACK.EXACT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "acknowledge_prediction_without_repeating_answer",
      "text": "That prediction fits. Let's reveal why.",
      "captionSource": "same_as_audio"
    },
    "HOOK.FEEDBACK.LESS": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "correct_underestimate_without_praise",
      "text": "The scanned part is larger than your prediction. Let's reveal why.",
      "captionSource": "same_as_audio"
    },
    "HOOK.FEEDBACK.MORE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "correct_overestimate_without_praise",
      "text": "The scanned part is smaller than your prediction. Let's reveal why.",
      "captionSource": "same_as_audio"
    },
    "HOOK.FEEDBACK.SHOW": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "transition",
      "communicationGoal": "continue_after_show_me",
      "text": "Let's reveal it.",
      "captionSource": "same_as_audio"
    },
    "HOOK.REVEAL.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "form_two_dimensional_partition",
      "text": "Now split the map both ways.",
      "captionSource": "same_as_audio"
    },
    "HOOK.REVEAL.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "count_overlap_cells_after_reveal",
      "text": "Three unlocked columns and two scanned rows overlap in six cells.",
      "captionSource": "same_as_audio"
    },
    "HOOK.REVEAL.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "count_reference_whole_cells",
      "text": "The full grid has twelve equal cells.",
      "captionSource": "same_as_audio"
    },
    "HOOK.REVEAL.4": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "state_raw_and_simplified_overlap_fraction",
      "text": "So the scanned part is six twelfths: exactly one half.",
      "captionSource": "same_as_audio"
    },
    "HOOK.REVEAL.5": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "generalise",
      "communicationGoal": "name_fraction_of_fraction_as_overlap",
      "text": "That overlap is a fraction of a fraction.",
      "captionSource": "same_as_audio"
    },
    "T1.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "focus_attention_on_joint_selection",
      "text": "Keep your eye on the overlap.",
      "captionSource": "same_as_audio"
    },
    "T1.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "connect_first_fraction_to_columns",
      "text": "Three quarters chooses three of the four columns.",
      "captionSource": "same_as_audio"
    },
    "T1.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "connect_second_fraction_to_rows_within_first",
      "text": "Two thirds of that part chooses two of the three rows.",
      "captionSource": "same_as_audio"
    },
    "T1.4": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "generalise",
      "communicationGoal": "define_product_as_cells_meeting_both_conditions",
      "text": "The cells that satisfy both choices are the product.",
      "captionSource": "same_as_audio"
    },
    "T2.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "transition",
      "communicationGoal": "move_from_grid_to_symbolic_counts",
      "text": "Now connect the picture to the numbers.",
      "captionSource": "same_as_audio"
    },
    "T2.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "derive_numerator_product_from_overlap",
      "text": "The overlap count is three times two, so the numerator is six.",
      "captionSource": "same_as_audio"
    },
    "T2.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "derive_denominator_product_from_reference_grid",
      "text": "The whole grid count is four times three, so the denominator is twelve.",
      "captionSource": "same_as_audio"
    },
    "T2.4": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "summary",
      "communicationGoal": "assemble_raw_fraction_product",
      "text": "That gives three quarters times two thirds equals six twelfths.",
      "captionSource": "same_as_audio"
    },
    "T2.5": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "generalise",
      "communicationGoal": "place_simplification_after_multiplication",
      "text": "If simplest form is requested, simplify after multiplying: six twelfths is one half.",
      "captionSource": "same_as_audio"
    },
    "T3.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "transition",
      "communicationGoal": "fade_area_model_after_meaning",
      "text": "The picture can step back now.",
      "captionSource": "same_as_audio"
    },
    "T3.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "present_direct_symbolic_example",
      "text": "Multiply four fifths by three sevenths.",
      "captionSource": "same_as_audio"
    },
    "T3.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "multiply_numerators",
      "text": "Four times three gives twelve on top.",
      "captionSource": "same_as_audio"
    },
    "T3.4": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "multiply_denominators",
      "text": "Five times seven gives thirty-five on the bottom.",
      "captionSource": "same_as_audio"
    },
    "T3.5": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "summary",
      "communicationGoal": "state_direct_product",
      "text": "The product is twelve thirty-fifths.",
      "captionSource": "same_as_audio"
    },
    "T3.6": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "generalise",
      "communicationGoal": "distinguish_multiplication_from_common_denominator_operations",
      "text": "Unlike addition and subtraction, the denominators do not need to match.",
      "captionSource": "same_as_audio"
    },
    "T4.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "generalise",
      "communicationGoal": "preserve_rule_with_simple_improper_factor",
      "text": "One factor can be greater than one. The rule still stays the same.",
      "captionSource": "same_as_audio"
    },
    "T4.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "present_improper_factor_example",
      "text": "Five fourths times three sevenths.",
      "captionSource": "same_as_audio"
    },
    "T4.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "explain",
      "communicationGoal": "calculate_both_row_products",
      "text": "Five times three is fifteen. Four times seven is twenty-eight.",
      "captionSource": "same_as_audio"
    },
    "T4.4": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "summary",
      "communicationGoal": "state_improper_factor_product",
      "text": "So the product is fifteen twenty-eighths.",
      "captionSource": "same_as_audio"
    },
    "T4.5": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "generalise",
      "communicationGoal": "protect_no_mixed_conversion_boundary",
      "text": "Do not turn five fourths into a mixed number here. The fraction already works.",
      "captionSource": "same_as_audio"
    },
    "HANDOFF.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "transition",
      "communicationGoal": "acknowledge_completed_concept_demonstration",
      "text": "You've seen why the rule works.",
      "captionSource": "same_as_audio"
    },
    "HANDOFF.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "transition",
      "communicationGoal": "hand_control_to_learner",
      "text": "I'll stay with you for two products. Then the supports start to fade.",
      "captionSource": "same_as_audio"
    },
    "G1.PRE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "prompt_visual_overlap_and_whole_counts_without_leaking",
      "text": "Count the overlap for the top, and every equal cell in the whole for the bottom.",
      "captionSource": "same_as_audio"
    },
    "G1.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_visual_products",
      "text": "Yes. Three selected columns times two selected rows gives six; five columns times three rows gives fifteen.",
      "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.ADD": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "redirect_additive_pairing",
      "text": "Both number pairs need multiplication, not addition. Check the overlap for the top, then the full grid for the bottom.",
      "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.CROSS": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "redirect_crosswise_pairing",
      "text": "The overlap uses selected columns times selected rows. The whole uses all columns times all rows.",
      "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.KEEP": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "redirect_one_denominator_kept",
      "text": "Both grid directions shape the new denominator. Count every equal cell in the whole.",
      "captionSource": "same_as_audio"
    },
    "G1.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "request_two_separate_counts_neutrally",
      "text": "Check two counts separately: selected columns times selected rows, then all columns times all rows.",
      "captionSource": "same_as_audio"
    },
    "G2.PRE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "prompt_symbolic_row_pairing",
      "text": "Keep the numerators together and the denominators together.",
      "captionSource": "same_as_audio"
    },
    "G2.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_symbolic_products",
      "text": "Four times two is eight, and seven times three is twenty-one.",
      "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.CROSS": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "restore_row_pairing",
      "text": "The blue row uses the two numerators. The teal row uses the two denominators.",
      "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.COMMON": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "remove_unnecessary_common_denominator",
      "text": "You can multiply these denominators as they are.",
      "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.ADD": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "replace_addition_with_multiplication",
      "text": "Use multiplication across each row, not addition.",
      "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.KEEP": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "include_both_denominators",
      "text": "Both denominators belong in the bottom product.",
      "captionSource": "same_as_audio"
    },
    "G2.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "request_neutral_row_rebuild",
      "text": "Rebuild the top product and the bottom product separately.",
      "captionSource": "same_as_audio"
    },
    "F1.PRE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "focus_missing_denominator_only",
      "text": "Keep the twenty fixed. Find the missing bottom product.",
      "captionSource": "same_as_audio"
    },
    "F1.HINT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "name_denominator_factors_without_giving_product",
      "text": "The missing bottom number comes from the two denominators: nine times seven.",
      "captionSource": "same_as_audio"
    },
    "F1.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_missing_denominator",
      "text": "Nine times seven gives sixty-three, so the product is twenty over sixty-three.",
      "captionSource": "same_as_audio"
    },
    "F1.INCORRECT.ADD": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "redirect_bottom_sum",
      "text": "The missing field is the denominator product, not a sum.",
      "captionSource": "same_as_audio"
    },
    "F1.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "request_denominator_recheck",
      "text": "Recheck the two denominators. Only the bottom result changes.",
      "captionSource": "same_as_audio"
    },
    "F2.HINT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "guide_direct_row_method_without_option_letter",
      "text": "The top row uses the two numerators. The bottom row uses the two denominators.",
      "captionSource": "same_as_audio"
    },
    "F2.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_direct_method_choice",
      "text": "Right. Two times three gives six; five times seven gives thirty-five.",
      "captionSource": "same_as_audio"
    },
    "F2.INCORRECT.A": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_additive_method_choice",
      "text": "That line adds the visible numbers. A fraction of a fraction needs multiplication in both rows.",
      "captionSource": "same_as_audio"
    },
    "F2.INCORRECT.C": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_crosswise_method_choice",
      "text": "That line crosses the rows. Keep numerator with numerator and denominator with denominator.",
      "captionSource": "same_as_audio"
    },
    "F2.INCORRECT.D": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_unnecessary_common_denominator_method",
      "text": "A common denominator is unnecessary here. Multiply the two original fractions directly.",
      "captionSource": "same_as_audio"
    },
    "F2.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "request_direct_method_reselection",
      "text": "Choose the line that multiplies the two numerators and the two denominators.",
      "captionSource": "same_as_audio"
    },
    "I1.PRE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "protect_context_translation_without_solving",
      "text": "Work it out before you open the hint. The visual only shows the two given fractions.",
      "captionSource": "same_as_audio"
    },
    "I1.HINT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "translate_nested_video_context_into_product",
      "text": "Both edited and captioned means three sevenths of four fifths. Multiply the two fractions.",
      "captionSource": "same_as_audio"
    },
    "I1.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_context_product",
      "text": "Twelve thirty-fifths of the full video is both edited and captioned.",
      "captionSource": "same_as_audio"
    },
    "I1.INCORRECT.ADD": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_context_addition",
      "text": "That result combines the fractions instead of taking a fraction of the edited part. Multiply both rows.",
      "captionSource": "same_as_audio"
    },
    "I1.INCORRECT.CROSS": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "restore_context_row_pairing",
      "text": "Keep numerator with numerator and denominator with denominator.",
      "captionSource": "same_as_audio"
    },
    "I1.INCORRECT.KEEP": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "include_both_context_denominators",
      "text": "The denominator must include both fifths and sevenths.",
      "captionSource": "same_as_audio"
    },
    "I1.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "request_context_product_rebuild",
      "text": "Use the two video fractions as one product.",
      "captionSource": "same_as_audio"
    },
    "I2.PRE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "prompt_same_rule_with_improper_factor",
      "text": "The larger numerator does not need a different method.",
      "captionSource": "same_as_audio"
    },
    "I2.HINT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "name_row_products_without_final_fraction",
      "text": "Use five times three on top and four times seven on the bottom.",
      "captionSource": "same_as_audio"
    },
    "I2.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_improper_factor_product",
      "text": "Fifteen twenty-eighths. The improper factor did not change the rule.",
      "captionSource": "same_as_audio"
    },
    "I2.INCORRECT.INVALID": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "validate_improper_factor",
      "text": "Five fourths is a valid fraction. Use the same top-row and bottom-row products.",
      "captionSource": "same_as_audio"
    },
    "I2.INCORRECT.CONVERT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "remove_unnecessary_mixed_conversion",
      "text": "You do not need to convert five fourths before multiplying.",
      "captionSource": "same_as_audio"
    },
    "I2.INCORRECT.ROW": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "restore_row_products",
      "text": "Multiply the two numerators together and the two denominators together.",
      "captionSource": "same_as_audio"
    },
    "I2.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "request_same_rule_recheck",
      "text": "Use the same multiplication rule as before.",
      "captionSource": "same_as_audio"
    },
    "FINAL.INTRO.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "transition",
      "communicationGoal": "announce_five_unsupported_items",
      "text": "These last five are yours. No hints this time.",
      "captionSource": "same_as_audio"
    },
    "FINAL.INTRO.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "instruction",
      "communicationGoal": "explain_answer_lock_and_post_lock_working",
      "text": "Do the multiplication first. Once you submit, your answer locks and I'll show you the working.",
      "captionSource": "same_as_audio"
    },
    "M1.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_direct_final_then_open_check",
      "text": "Good - that's right. Here's the multiplication check.",
      "captionSource": "same_as_audio"
    },
    "M1.INCORRECT.ADD": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "flag_additive_final_then_open_check",
      "text": "Not quite. Both rows need multiplication. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M1.INCORRECT.CROSS": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "flag_crosswise_final_then_open_check",
      "text": "Not quite. The number rows were crossed. Here's the correct pairing.",
      "captionSource": "same_as_audio"
    },
    "M1.INCORRECT.KEEP": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "flag_kept_denominator_final_then_open_check",
      "text": "Not quite. The denominator needs both bottom numbers. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M1.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_direct_worked_check_after_other_miss",
      "text": "Not quite. Here's the multiplication - compare it with what you did.",
      "captionSource": "same_as_audio"
    },
    "M2.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_visual_final_then_open_check",
      "text": "Good - you read both grid counts correctly. Here's the visual check.",
      "captionSource": "same_as_audio"
    },
    "M2.INCORRECT.OVERLAP": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "correct_overlap_count_after_lock",
      "text": "Not quite. The overlap sets the numerator. Here's the full grid check.",
      "captionSource": "same_as_audio"
    },
    "M2.INCORRECT.WHOLE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "correct_whole_cell_count_after_lock",
      "text": "Not quite. The denominator must count every equal cell. Here's the visual check.",
      "captionSource": "same_as_audio"
    },
    "M2.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_visual_worked_check_after_other_miss",
      "text": "Not quite. The fraction must match both the overlap and the whole grid. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M3.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_missing_denominator_final",
      "text": "Good - you kept the denominator structure. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M3.INCORRECT.KEEP": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "correct_missing_denominator_after_lock",
      "text": "Not quite. Both denominators belong in the missing bottom product. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M3.INCORRECT.INVALID": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "validate_improper_factor_after_lock",
      "text": "Not quite. Four thirds is valid here, and the same rule applies. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M3.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_missing_field_worked_check",
      "text": "Not quite. Here's the denominator multiplication - compare it with your answer.",
      "captionSource": "same_as_audio"
    },
    "M4.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_reasoning_final",
      "text": "Good - option B keeps both number rows intact. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M4.INCORRECT.A": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_additive_claim_after_lock",
      "text": "Not quite. Adding the visible numbers describes a different operation. Here's the product check.",
      "captionSource": "same_as_audio"
    },
    "M4.INCORRECT.C": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_crosswise_claim_after_lock",
      "text": "Not quite. Crosswise pairing does not match the fraction rows. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M4.INCORRECT.D": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_kept_denominator_claim_after_lock",
      "text": "Not quite. Keeping the first denominator ignores the second partition. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M4.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_reasoning_worked_check",
      "text": "Not quite. Here's the direct product so you can compare the methods.",
      "captionSource": "same_as_audio"
    },
    "M5.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_context_and_simplest_form_final",
      "text": "Good - you multiplied first and finished the requested simplest form. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M5.FORM": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "recognise_correct_product_but_incomplete_form",
      "text": "The product is correct, but the answer is not yet in simplest form. Here's the final step.",
      "captionSource": "same_as_audio"
    },
    "M5.INCORRECT.ADD": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_additive_context_final",
      "text": "Not quite. This is a fraction of the edited part, so both rows multiply. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M5.INCORRECT.CROSS": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_crosswise_context_final",
      "text": "Not quite. Keep the two number rows intact. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M5.INCORRECT.KEEP": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "reject_kept_denominator_context_final",
      "text": "Not quite. Both denominators shape the raw product. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "M5.INCORRECT.DEFAULT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_context_form_worked_check",
      "text": "Not quite. Here's the multiplication and simplification - compare it with what you did.",
      "captionSource": "same_as_audio"
    },
    "CONFIRM.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_fresh_no_hint_evidence",
      "text": "That fresh answer is correct without the hint. You can move on independently.",
      "captionSource": "same_as_audio"
    },
    "CONFIRM.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "route_failed_confirmation_to_matching_repair",
      "text": "The fresh check still needs attention. Let's repair the exact step that broke down.",
      "captionSource": "same_as_audio"
    },
    "R-ADD.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "separate_multiplication_from_joining",
      "text": "The fractions are not being joined. One fraction is acting on the other.",
      "captionSource": "same_as_audio"
    },
    "R-ADD.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "multiply_selected_counts_in_overlap",
      "text": "In two thirds of three quarters, the overlap uses two times three.",
      "captionSource": "same_as_audio"
    },
    "R-ADD.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "multiply_reference_whole_counts",
      "text": "The whole grid uses three times four.",
      "captionSource": "same_as_audio"
    },
    "R-ADD.4": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "contrast_product_with_additive_answer",
      "text": "So the product is six twelfths, not five sevenths.",
      "captionSource": "same_as_audio"
    },
    "R-CROSS.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "preserve_rows",
      "text": "Keep each row together.",
      "captionSource": "same_as_audio"
    },
    "R-CROSS.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "pair_numerators",
      "text": "The two numerators make the new numerator.",
      "captionSource": "same_as_audio"
    },
    "R-CROSS.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "pair_denominators",
      "text": "The two denominators make the new denominator.",
      "captionSource": "same_as_audio"
    },
    "R-CROSS.4": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "reject_crosswise_pairing",
      "text": "Crosswise products do not describe the overlap grid.",
      "captionSource": "same_as_audio"
    },
    "R-KEEP.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "redefine_denominator_as_new_equal_cells",
      "text": "The bottom number must describe the new equal cells.",
      "captionSource": "same_as_audio"
    },
    "R-KEEP.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "combine_column_and_row_partitions",
      "text": "Four columns cut one way and five rows cut the other way.",
      "captionSource": "same_as_audio"
    },
    "R-KEEP.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "state_full_grid_denominator",
      "text": "That makes twenty equal cells in the reference whole, so the denominator is twenty.",
      "captionSource": "same_as_audio"
    },
    "R-COMMON.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "place_common_denominator_in_correct_operation_family",
      "text": "Matching denominators is useful for adding or subtracting fractions.",
      "captionSource": "same_as_audio"
    },
    "R-COMMON.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "use_current_denominators_as_grid_dimensions",
      "text": "Here, the different denominators become the row and column counts.",
      "captionSource": "same_as_audio"
    },
    "R-COMMON.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "directly_multiply_original_fractions",
      "text": "You don't need to rewrite the fractions first. Multiply them as they are.",
      "captionSource": "same_as_audio"
    },
    "R-IMPROPER.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "validate_improper_fraction",
      "text": "Five fourths is still a valid fraction.",
      "captionSource": "same_as_audio"
    },
    "R-IMPROPER.2": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "preserve_pairing_with_larger_numerator",
      "text": "The numerator being larger does not change which numbers multiply together.",
      "captionSource": "same_as_audio"
    },
    "R-IMPROPER.3": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "restate_product_rule",
      "text": "Multiply top with top and bottom with bottom.",
      "captionSource": "same_as_audio"
    },
    "R-FORM.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "repair",
      "communicationGoal": "separate_correct_product_from_required_form",
      "text": "The product is correct. The question also asks for simplest form.",
      "captionSource": "same_as_audio"
    },
    "R-ARITH.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "separate_arithmetic_slip_from_fraction_structure",
      "text": "Your structure is right. Recheck the whole-number multiplication fact.",
      "captionSource": "same_as_audio"
    },
    "R-UNKNOWN.1": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "request_observable_method_evidence",
      "text": "Show the two products you used.",
      "captionSource": "same_as_audio"
    },
    "REPAIR.CHECK.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_repair_fresh_check",
      "text": "That fresh check is secure. Return to the lesson.",
      "captionSource": "same_as_audio"
    },
    "REPAIR.CHECK.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "continue_same_family_support",
      "text": "That same step is still breaking down. Stay with this repair for one more example.",
      "captionSource": "same_as_audio"
    },
    "A-DIRECT.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_direct_recovery",
      "text": "That direct product is secure. Here's the multiplication check.",
      "captionSource": "same_as_audio"
    },
    "A-DIRECT.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_direct_recovery_check",
      "text": "That direct product is not secure yet. Compare both number rows.",
      "captionSource": "same_as_audio"
    },
    "A-VIS.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_visual_recovery",
      "text": "You read the overlap and the whole correctly. Here's the grid check.",
      "captionSource": "same_as_audio"
    },
    "A-VIS.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_visual_recovery_check",
      "text": "The grid fraction is not secure yet. Compare the overlap with the full set of cells.",
      "captionSource": "same_as_audio"
    },
    "A-METHOD.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_method_recovery",
      "text": "That method keeps the two number rows intact. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "A-METHOD.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_method_recovery_check",
      "text": "That method does not match fraction multiplication. Compare the row pairings.",
      "captionSource": "same_as_audio"
    },
    "A-IMPROPER.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_improper_recovery",
      "text": "The improper factor used the same rule. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "A-IMPROPER.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_improper_recovery_check",
      "text": "The improper factor still uses the same rule. Compare both products.",
      "captionSource": "same_as_audio"
    },
    "A-CONTEXT.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_context_recovery",
      "text": "You translated the nested context correctly. Here's the product check.",
      "captionSource": "same_as_audio"
    },
    "A-CONTEXT.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_context_recovery_check",
      "text": "The checked part is a fraction of the completed part. Here's the product check.",
      "captionSource": "same_as_audio"
    },
    "A-FORM.CORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "acknowledge_correct",
      "communicationGoal": "confirm_form_recovery",
      "text": "The product and its simplest form are both correct. Here's the check.",
      "captionSource": "same_as_audio"
    },
    "A-FORM.FORM": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "finish_form_recovery",
      "text": "The product is equivalent, but it still needs its simplest form. Here's the final step.",
      "captionSource": "same_as_audio"
    },
    "A-FORM.INCORRECT": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "redirect_incorrect",
      "communicationGoal": "open_form_recovery_check",
      "text": "That value is not the product. Here's the multiplication and simplification.",
      "captionSource": "same_as_audio"
    },
    "COMPLETE": {
      "audience": "learner",
      "spokenBy": "Ryan",
      "role": "completion",
      "communicationGoal": "summarise_mastered_product_structure_and_close",
      "text": "Good work. You can now read a fraction of a fraction, multiply the numerators and denominators, and recognise that no common denominator is needed. That's FRA-24 done.",
      "captionSource": "same_as_audio"
    }
  };
  var FRA24_CUES = [
    {
      "id": "HOOK-C1",
      "utteranceId": "HOOK.1",
      "anchor": "three quarters",
      "action": "Form four equal columns; fill exactly three with the first-state fill.",
      "reducedMotionAction": "Show the same four-column, three-selected state immediately."
    },
    {
      "id": "HOOK-C2",
      "utteranceId": "HOOK.2",
      "anchor": "two thirds",
      "action": "Emphasise the written second fraction only; do not form rows yet.",
      "reducedMotionAction": "Emphasise the written second fraction without motion."
    },
    {
      "id": "HOOK-C3",
      "utteranceId": "HOOK.REVEAL.1",
      "anchor": "split the map both ways",
      "action": "Form exactly three equal horizontal rows across the existing four columns.",
      "reducedMotionAction": "Replace with the completed 4-by-3 grid."
    },
    {
      "id": "HOOK-C4",
      "utteranceId": "HOOK.REVEAL.2",
      "anchor": "overlap in six cells",
      "action": "Apply the second-state hatch to exactly two rows and glow the six overlap cells.",
      "reducedMotionAction": "Show the two selected rows and six overlap cells with pattern and border."
    },
    {
      "id": "HOOK-C5",
      "utteranceId": "HOOK.REVEAL.3",
      "anchor": "twelve equal cells",
      "action": "Outline all twelve reference-whole cells and reveal the count twelve.",
      "reducedMotionAction": "Show the all-cells outline and count."
    },
    {
      "id": "HOOK-C6",
      "utteranceId": "HOOK.REVEAL.4",
      "anchor": "six twelfths",
      "action": "Assemble 6/12, then reveal the arrow to 1/2 only on the words exactly one half.",
      "reducedMotionAction": "Reveal 6/12 first and 1/2 second at the same speech anchors."
    },
    {
      "id": "T1-C1",
      "utteranceId": "T1.2",
      "anchor": "three of the four columns",
      "action": "Label 3 of 4 columns and reinforce exactly the selected columns.",
      "reducedMotionAction": "Show the labelled column state."
    },
    {
      "id": "T1-C2",
      "utteranceId": "T1.3",
      "anchor": "two of the three rows",
      "action": "Label 2 of 3 rows and reinforce exactly the selected rows.",
      "reducedMotionAction": "Show the labelled row state."
    },
    {
      "id": "T1-C3",
      "utteranceId": "T1.4",
      "anchor": "are the product",
      "action": "Fade non-overlap states slightly and reveal PRODUCT = overlap.",
      "reducedMotionAction": "Apply the final emphasis state without motion."
    },
    {
      "id": "T2-C1",
      "utteranceId": "T2.2",
      "anchor": "three times two",
      "action": "Pulse the selected column count and selected row count, then reveal 6 above the result line.",
      "reducedMotionAction": "Highlight both factors and show 6."
    },
    {
      "id": "T2-C2",
      "utteranceId": "T2.3",
      "anchor": "four times three",
      "action": "Pulse the total columns and rows, then reveal 12 below the result line.",
      "reducedMotionAction": "Highlight both denominator factors and show 12."
    },
    {
      "id": "T2-C3",
      "utteranceId": "T2.4",
      "anchor": "equals six twelfths",
      "action": "Assemble the full equation only after both products exist.",
      "reducedMotionAction": "Show the completed equation."
    },
    {
      "id": "T2-C4",
      "utteranceId": "T2.5",
      "anchor": "six twelfths is one half",
      "action": "Reveal the post-product simplification arrow and 1/2.",
      "reducedMotionAction": "Show the simplification state at the same anchor."
    },
    {
      "id": "T3-C1",
      "utteranceId": "T3.3",
      "anchor": "twelve on top",
      "action": "Join the numerator row and reveal 12.",
      "reducedMotionAction": "Highlight the numerator row and show 12."
    },
    {
      "id": "T3-C2",
      "utteranceId": "T3.4",
      "anchor": "thirty-five on the bottom",
      "action": "Join the denominator row and reveal 35.",
      "reducedMotionAction": "Highlight the denominator row and show 35."
    },
    {
      "id": "T3-C3",
      "utteranceId": "T3.6",
      "anchor": "do not need to match",
      "action": "Reveal a muted no-common-denominator-needed badge.",
      "reducedMotionAction": "Show the badge."
    },
    {
      "id": "T4-C1",
      "utteranceId": "T4.1",
      "anchor": "greater than one",
      "action": "Extend the width one quarter beyond the reference whole while keeping the reference-whole boundary visible.",
      "reducedMotionAction": "Show the completed extended-width state."
    },
    {
      "id": "T4-C2",
      "utteranceId": "T4.3",
      "anchor": "fifteen",
      "action": "Reveal the numerator product 15.",
      "reducedMotionAction": "Show 15 at the same anchor."
    },
    {
      "id": "T4-C3",
      "utteranceId": "T4.3",
      "anchor": "twenty-eight",
      "action": "Reveal the denominator product 28 tied to the 4-by-7 reference whole.",
      "reducedMotionAction": "Show 28 at the same anchor."
    },
    {
      "id": "G1-C1",
      "utteranceId": "G1.PRE",
      "anchor": "overlap",
      "action": "Outline the overlap region without counting or labelling its total.",
      "reducedMotionAction": "Show the overlap outline only."
    },
    {
      "id": "G1-C2",
      "utteranceId": "G1.PRE",
      "anchor": "every equal cell in the whole",
      "action": "Outline the complete reference grid without revealing its count.",
      "reducedMotionAction": "Show the complete-grid outline only."
    },
    {
      "id": "G2-C1",
      "utteranceId": "G2.PRE",
      "anchor": "numerators together",
      "action": "Reinforce the horizontal numerator row; never draw diagonal arrows.",
      "reducedMotionAction": "Highlight the numerator row."
    },
    {
      "id": "G2-C2",
      "utteranceId": "G2.PRE",
      "anchor": "denominators together",
      "action": "Reinforce the horizontal denominator row; never draw diagonal arrows.",
      "reducedMotionAction": "Highlight the denominator row."
    },
    {
      "id": "F1-C1",
      "utteranceId": "F1.PRE",
      "anchor": "twenty fixed",
      "action": "Lock and visually fix the result numerator 20; focus only the denominator field.",
      "reducedMotionAction": "Show the fixed numerator and focused denominator field."
    },
    {
      "id": "I1-C1",
      "utteranceId": "I1.PRE",
      "anchor": "two given fractions",
      "action": "Keep only the two video-status fraction cards visible; no product grid or multiplication facts.",
      "reducedMotionAction": "Preserve the same static cards."
    },
    {
      "id": "I2-C1",
      "utteranceId": "I2.PRE",
      "anchor": "larger numerator",
      "action": "Briefly reinforce the 5 in 5/4 without converting or classifying the fraction.",
      "reducedMotionAction": "Use a non-moving focus ring on 5."
    }
  ];
  var FRA24_TEACHING_SCENES = {
    "HOOK": {
      "stage": "opening",
      "purpose": "Create a prediction and reveal a fraction-of-a-fraction overlap.",
      "runtimeUtteranceIds": [
        "HOOK.1",
        "HOOK.2",
        "HOOK.3",
        "HOOK.FEEDBACK.EXACT",
        "HOOK.FEEDBACK.LESS",
        "HOOK.FEEDBACK.MORE",
        "HOOK.FEEDBACK.SHOW",
        "HOOK.REVEAL.1",
        "HOOK.REVEAL.2",
        "HOOK.REVEAL.3",
        "HOOK.REVEAL.4",
        "HOOK.REVEAL.5"
      ],
      "cueIds": [
        "HOOK-C1",
        "HOOK-C2",
        "HOOK-C3",
        "HOOK-C4",
        "HOOK-C5",
        "HOOK-C6"
      ],
      "interaction": {
        "kind": "unscored_choice",
        "options": [
          "less_than_half",
          "exactly_half",
          "more_than_half",
          "show_me"
        ],
        "correctOptionId": "exactly_half",
        "countsTowardEvidence": false
      },
      "visual": {
        "kind": "map_overlap_grid",
        "firstFraction": {
          "numerator": 3,
          "denominator": 4
        },
        "secondFraction": {
          "numerator": 2,
          "denominator": 3
        },
        "firstOrientation": "columns",
        "secondOrientation": "rows",
        "revealProductAfterChoice": true
      }
    },
    "T1": {
      "stage": "teach",
      "purpose": "Define the product as the overlap of two fractional selections.",
      "runtimeUtteranceIds": [
        "T1.1",
        "T1.2",
        "T1.3",
        "T1.4"
      ],
      "cueIds": [
        "T1-C1",
        "T1-C2",
        "T1-C3"
      ],
      "visual": {
        "kind": "map_overlap_grid",
        "firstFraction": {
          "numerator": 3,
          "denominator": 4
        },
        "secondFraction": {
          "numerator": 2,
          "denominator": 3
        },
        "showNumericProduct": false,
        "showLabelsAtAnchors": true
      }
    },
    "T2": {
      "stage": "teach",
      "purpose": "Derive numerator and denominator products from the grid.",
      "runtimeUtteranceIds": [
        "T2.1",
        "T2.2",
        "T2.3",
        "T2.4",
        "T2.5"
      ],
      "cueIds": [
        "T2-C1",
        "T2-C2",
        "T2-C3",
        "T2-C4"
      ],
      "visual": {
        "kind": "grid_to_symbolic_product",
        "firstFraction": {
          "numerator": 3,
          "denominator": 4
        },
        "secondFraction": {
          "numerator": 2,
          "denominator": 3
        },
        "simplifyOnlyAfterRawProduct": true
      }
    },
    "T3": {
      "stage": "teach",
      "purpose": "Condense the model into the direct two-row procedure.",
      "runtimeUtteranceIds": [
        "T3.1",
        "T3.2",
        "T3.3",
        "T3.4",
        "T3.5",
        "T3.6"
      ],
      "cueIds": [
        "T3-C1",
        "T3-C2",
        "T3-C3"
      ],
      "visual": {
        "kind": "symbolic_row_product",
        "firstFraction": {
          "numerator": 4,
          "denominator": 5
        },
        "secondFraction": {
          "numerator": 3,
          "denominator": 7
        },
        "useHorizontalRails": true,
        "forbidDiagonalArrows": true
      }
    },
    "T4": {
      "stage": "teach",
      "purpose": "Show that a simple improper factor does not change the rule.",
      "runtimeUtteranceIds": [
        "T4.1",
        "T4.2",
        "T4.3",
        "T4.4",
        "T4.5"
      ],
      "cueIds": [
        "T4-C1",
        "T4-C2",
        "T4-C3"
      ],
      "visual": {
        "kind": "improper_width_area_model",
        "firstFraction": {
          "numerator": 5,
          "denominator": 4
        },
        "secondFraction": {
          "numerator": 3,
          "denominator": 7
        },
        "referenceWholeColumns": 4,
        "visibleColumns": 5,
        "rows": 7,
        "referenceWholeDenominatorUsesOnlyReferenceWhole": true
      }
    },
    "HANDOFF": {
      "stage": "teach",
      "purpose": "Hand responsibility to the learner without a generic worksheet announcement.",
      "runtimeUtteranceIds": [
        "HANDOFF.1",
        "HANDOFF.2"
      ],
      "cueIds": [],
      "visual": {
        "stageLabelFrom": "Learn the idea",
        "stageLabelTo": "Try it with me"
      }
    }
  };
  var FRA24_QUESTIONS = {
    "G1": {
      "id": "G1",
      "stage": "guided",
      "assessmentIntent": "VIS_overlap_to_product",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 5
        },
        "second": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "learnerUi": {
        "stageLabel": "Try it with me",
        "title": "Use the overlap",
        "prompt": "Write the exact product shown by the grid."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": false,
        "allowRetryAfterFeedback": true,
        "workedCheckReveal": "after_resolution"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "area_product_grid",
        "firstOrientation": "columns",
        "secondOrientation": "rows",
        "showCountsBeforeSubmit": false,
        "selectionUsesPatternAndBorder": true
      },
      "support": {
        "hintPolicy": "built_in_guidance",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [
          "G1.PRE"
        ],
        "outcomeUtteranceIds": {
          "correct": "G1.CORRECT",
          "incorrectBySignal": {
            "add": "G1.INCORRECT.ADD",
            "cross": "G1.INCORRECT.CROSS",
            "keep_denominator": "G1.INCORRECT.KEEP",
            "default": "G1.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "area_fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "acceptExactEquivalent": true,
        "rawDisplayProduct": "6/15",
        "noPreSubmitOverlapCount": true
      }
    },
    "G2": {
      "id": "G2",
      "stage": "guided",
      "assessmentIntent": "DIRECT_STEP_row_pairing",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 7
        },
        "second": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "learnerUi": {
        "stageLabel": "Try it with me",
        "title": "Build the two products",
        "prompt": "Multiply across the top and across the bottom."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": false,
        "allowRetryAfterFeedback": true,
        "workedCheckReveal": "after_resolution"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_row_product",
        "showHorizontalRowRails": true,
        "forbidDiagonalArrows": true
      },
      "support": {
        "hintPolicy": "built_in_guidance",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [
          "G2.PRE"
        ],
        "outcomeUtteranceIds": {
          "correct": "G2.CORRECT",
          "incorrectBySignal": {
            "cross": "G2.INCORRECT.CROSS",
            "common_denominator_needed": "G2.INCORRECT.COMMON",
            "add": "G2.INCORRECT.ADD",
            "keep_denominator": "G2.INCORRECT.KEEP",
            "default": "G2.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "acceptExactEquivalent": true,
        "rawDisplayProduct": "8/21"
      }
    },
    "F1": {
      "id": "F1",
      "stage": "faded",
      "assessmentIntent": "MISSING_denominator_product",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 9
        },
        "second": {
          "numerator": 5,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Your turn - support nearby",
        "title": "Complete the missing denominator",
        "prompt": "Keep the result numerator fixed at 20. Type the missing denominator."
      },
      "response": {
        "kind": "integer_input",
        "lockOnSubmit": false,
        "allowRetryAfterFeedback": true,
        "workedCheckReveal": "after_resolution"
      },
      "answerPolicy": {
        "kind": "missing_denominator"
      },
      "visual": {
        "kind": "missing_fraction_field",
        "fixedNumeratorDerivedFromFactors": true,
        "editableField": "denominator"
      },
      "support": {
        "hintPolicy": "optional_collapsed",
        "hintUtteranceId": "F1.HINT"
      },
      "runtime": {
        "preUtteranceIds": [
          "F1.PRE"
        ],
        "outcomeUtteranceIds": {
          "correct": "F1.CORRECT",
          "incorrectBySignal": {
            "add": "F1.INCORRECT.ADD",
            "default": "F1.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "missing_denominator_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "conditionalOnStrongRoute": true,
        "expectedField": 63
      }
    },
    "F2": {
      "id": "F2",
      "stage": "faded",
      "assessmentIntent": "ERROR_REASON_direct_method",
      "factors": {
        "first": {
          "numerator": 2,
          "denominator": 5
        },
        "second": {
          "numerator": 3,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Your turn",
        "title": "Which line gives the product directly?",
        "prompt": "Choose the direct FRA-24 multiplication method.",
        "options": [
          {
            "id": "A",
            "method": "add_rows",
            "text": "Add the top numbers and add the bottom numbers."
          },
          {
            "id": "B",
            "method": "multiply_rows",
            "text": "Multiply numerator by numerator and denominator by denominator."
          },
          {
            "id": "C",
            "method": "crosswise",
            "text": "Multiply the numbers crosswise."
          },
          {
            "id": "D",
            "method": "common_denominator_first",
            "text": "First change both fractions to denominator 35."
          }
        ]
      },
      "response": {
        "kind": "single_choice",
        "lockOnSubmit": false,
        "allowRetryAfterFeedback": true,
        "workedCheckReveal": "after_resolution"
      },
      "answerPolicy": {
        "kind": "choice_B"
      },
      "visual": {
        "kind": "method_choice_fraction_product",
        "renderMethodEquationsFromFactors": true
      },
      "support": {
        "hintPolicy": "optional_collapsed",
        "hintUtteranceId": "F2.HINT"
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "F2.CORRECT",
          "incorrectBySignal": {
            "option_A": "F2.INCORRECT.A",
            "option_C": "F2.INCORRECT.C",
            "option_D": "F2.INCORRECT.D",
            "default": "F2.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "method_choice_direct_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "retainedOnFastRoute": true,
        "optionDMayPreserveValueButIsNotDirectMethod": true,
        "noPreAnswerRyanSpeech": true
      }
    },
    "I1": {
      "id": "I1",
      "stage": "independent",
      "assessmentIntent": "CONTEXT_fraction_of_fraction",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 5
        },
        "second": {
          "numerator": 3,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Now you take over",
        "title": "Edited and captioned",
        "prompt": "What fraction of the full video is both edited and captioned?",
        "context": {
          "kind": "nested_video_status",
          "firstSuffix": "of the full video is edited.",
          "secondHeading": "Within the edited part",
          "secondSuffix": "has captions."
        }
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": false,
        "allowRetryAfterFeedback": true,
        "workedCheckReveal": "after_resolution"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "nested_context_cards",
        "context": "video",
        "forbidPreSubmitProductGrid": true,
        "accessibleDescriptionTemplate": "A video status card states {firstFraction} edited; a second card states {secondFraction} of the edited part has captions."
      },
      "support": {
        "hintPolicy": "optional_collapsed",
        "hintUtteranceId": "I1.HINT"
      },
      "runtime": {
        "preUtteranceIds": [
          "I1.PRE"
        ],
        "outcomeUtteranceIds": {
          "correct": "I1.CORRECT",
          "incorrectBySignal": {
            "add": "I1.INCORRECT.ADD",
            "cross": "I1.INCORRECT.CROSS",
            "keep_denominator": "I1.INCORRECT.KEEP",
            "default": "I1.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "confirmationIdAfterHint": "C-CONTEXT",
        "acceptExactEquivalent": true,
        "rawDisplayProduct": "12/35"
      }
    },
    "I2": {
      "id": "I2",
      "stage": "independent",
      "assessmentIntent": "DIRECT_IMPROPER_factor",
      "factors": {
        "first": {
          "numerator": 5,
          "denominator": 4
        },
        "second": {
          "numerator": 3,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Now you take over",
        "title": "Multiply with an improper factor",
        "prompt": "Leave the answer as one fraction."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": false,
        "allowRetryAfterFeedback": true,
        "workedCheckReveal": "after_resolution"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product",
        "preserveImproperFactorAsWritten": true,
        "forbidMixedConversion": true
      },
      "support": {
        "hintPolicy": "optional_collapsed",
        "hintUtteranceId": "I2.HINT"
      },
      "runtime": {
        "preUtteranceIds": [
          "I2.PRE"
        ],
        "outcomeUtteranceIds": {
          "correct": "I2.CORRECT",
          "incorrectBySignal": {
            "improper_invalid": "I2.INCORRECT.INVALID",
            "mixed_conversion": "I2.INCORRECT.CONVERT",
            "row_error": "I2.INCORRECT.ROW",
            "default": "I2.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "confirmationIdAfterHint": "C-IMP",
        "acceptExactEquivalent": true,
        "rawDisplayProduct": "15/28"
      }
    },
    "M1": {
      "id": "M1",
      "stage": "final",
      "assessmentIntent": "DIRECT_exact_product",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 7
        },
        "second": {
          "numerator": 4,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Final check",
        "title": "Before submit",
        "prompt": "Calculate the exact product."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product",
        "showSupportBeforeSubmit": false
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "M1.CORRECT",
          "incorrectBySignal": {
            "add": "M1.INCORRECT.ADD",
            "cross": "M1.INCORRECT.CROSS",
            "keep_denominator": "M1.INCORRECT.KEEP",
            "default": "M1.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "acceptExactEquivalent": true,
        "rawDisplayProduct": "12/35"
      }
    },
    "M2": {
      "id": "M2",
      "stage": "final",
      "assessmentIntent": "VIS_area_product",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 4
        },
        "second": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "learnerUi": {
        "stageLabel": "Final check",
        "title": "Before submit",
        "prompt": "Write the exact product represented by the overlap."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "area_product_grid",
        "firstOrientation": "columns",
        "secondOrientation": "rows",
        "showCountsBeforeSubmit": false,
        "accessibleDescriptionMustNotTotalOverlap": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "M2.CORRECT",
          "incorrectBySignal": {
            "overlap_error": "M2.INCORRECT.OVERLAP",
            "whole_error": "M2.INCORRECT.WHOLE",
            "default": "M2.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "area_fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "acceptExactEquivalent": true,
        "simplestFormRequired": false,
        "rawDisplayProduct": "6/12"
      }
    },
    "M3": {
      "id": "M3",
      "stage": "final",
      "assessmentIntent": "MISSING_IMPROPER_denominator",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 3
        },
        "second": {
          "numerator": 5,
          "denominator": 8
        }
      },
      "learnerUi": {
        "stageLabel": "Final check",
        "title": "Before submit",
        "prompt": "Type the missing denominator. The result numerator is fixed at 20."
      },
      "response": {
        "kind": "integer_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "missing_denominator"
      },
      "visual": {
        "kind": "missing_fraction_field",
        "fixedNumeratorDerivedFromFactors": true,
        "editableField": "denominator",
        "preserveImproperFactorAsWritten": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "M3.CORRECT",
          "incorrectBySignal": {
            "keep_denominator": "M3.INCORRECT.KEEP",
            "improper_invalid": "M3.INCORRECT.INVALID",
            "default": "M3.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "missing_denominator_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "expectedField": 24
      }
    },
    "M4": {
      "id": "M4",
      "stage": "final",
      "assessmentIntent": "ERROR_REASON_add_method",
      "factors": {
        "first": {
          "numerator": 2,
          "denominator": 5
        },
        "second": {
          "numerator": 3,
          "denominator": 4
        }
      },
      "learnerUi": {
        "stageLabel": "Final check",
        "title": "Before submit",
        "prompt": "A student says they added the top numbers and the bottom numbers. Which response is correct?",
        "options": [
          {
            "id": "A",
            "method": "accept_addition",
            "text": "The student is correct."
          },
          {
            "id": "B",
            "method": "multiply_rows",
            "text": "Multiply top with top and bottom with bottom."
          },
          {
            "id": "C",
            "method": "crosswise",
            "text": "Multiply crosswise."
          },
          {
            "id": "D",
            "method": "keep_first_denominator",
            "text": "Multiply the numerators but keep the first denominator."
          }
        ]
      },
      "response": {
        "kind": "single_choice",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "choice_B"
      },
      "visual": {
        "kind": "method_critique",
        "renderCandidateFractionsFromFactors": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "M4.CORRECT",
          "incorrectBySignal": {
            "option_A": "M4.INCORRECT.A",
            "option_C": "M4.INCORRECT.C",
            "option_D": "M4.INCORRECT.D",
            "default": "M4.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "method_choice_direct_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "correctOption": "B",
        "rawDisplayProduct": "6/20"
      }
    },
    "M5": {
      "id": "M5",
      "stage": "final",
      "assessmentIntent": "CONTEXT_FORM_simplest_after_product",
      "factors": {
        "first": {
          "numerator": 5,
          "denominator": 6
        },
        "second": {
          "numerator": 3,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Final check",
        "title": "Before submit",
        "prompt": "What fraction of the full video is both edited and captioned? Give your answer in simplest form.",
        "context": {
          "kind": "nested_video_status",
          "firstSuffix": "of the full video is edited.",
          "secondSuffix": "of the edited section has captions."
        }
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_simplest"
      },
      "visual": {
        "kind": "nested_context_cards",
        "context": "video",
        "forbidPreSubmitProductGrid": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "M5.CORRECT",
          "incorrectBySignal": {
            "form": "M5.FORM",
            "add": "M5.INCORRECT.ADD",
            "cross": "M5.INCORRECT.CROSS",
            "keep_denominator": "M5.INCORRECT.KEEP",
            "default": "M5.INCORRECT.DEFAULT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product_then_simplify",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "requiredReducedProduct": "1/2",
        "rawDisplayProduct": "15/30",
        "crossCancellationMustNotBeShown": true
      }
    }
  };
  var FRA24_CONFIRMATIONS = {
    "C-VIS": {
      "id": "C-VIS",
      "stage": "confirmation",
      "assessmentIntent": "VIS_no_hint_confirmation",
      "factors": {
        "first": {
          "numerator": 2,
          "denominator": 5
        },
        "second": {
          "numerator": 3,
          "denominator": 4
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh check",
        "title": "No hint this time",
        "prompt": "Write the exact product represented by the overlap."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "area_product_grid",
        "firstOrientation": "columns",
        "secondOrientation": "rows",
        "showCountsBeforeSubmit": false
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "CONFIRM.CORRECT",
          "incorrectBySignal": {
            "default": "CONFIRM.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "area_fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "rawDisplayProduct": "6/20"
      }
    },
    "C-DIR": {
      "id": "C-DIR",
      "stage": "confirmation",
      "assessmentIntent": "DIRECT_no_hint_confirmation",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 9
        },
        "second": {
          "numerator": 5,
          "denominator": 8
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh check",
        "title": "No hint this time",
        "prompt": "Calculate the exact product."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "CONFIRM.CORRECT",
          "incorrectBySignal": {
            "default": "CONFIRM.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "rawDisplayProduct": "20/72"
      }
    },
    "C-IMP": {
      "id": "C-IMP",
      "stage": "confirmation",
      "assessmentIntent": "IMPROPER_no_hint_confirmation",
      "factors": {
        "first": {
          "numerator": 7,
          "denominator": 5
        },
        "second": {
          "numerator": 2,
          "denominator": 9
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh check",
        "title": "No hint this time",
        "prompt": "Multiply and leave the answer as one fraction."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product",
        "preserveImproperFactorAsWritten": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "CONFIRM.CORRECT",
          "incorrectBySignal": {
            "default": "CONFIRM.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "rawDisplayProduct": "14/45"
      }
    },
    "C-METHOD": {
      "id": "C-METHOD",
      "stage": "confirmation",
      "assessmentIntent": "METHOD_no_hint_confirmation",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 8
        },
        "second": {
          "numerator": 4,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh check",
        "title": "No hint this time",
        "prompt": "Choose the valid direct multiplication line.",
        "options": [
          {
            "id": "A",
            "method": "add_rows",
            "text": "Add across both rows."
          },
          {
            "id": "B",
            "method": "multiply_rows",
            "text": "Multiply across both rows."
          },
          {
            "id": "C",
            "method": "crosswise",
            "text": "Multiply crosswise."
          }
        ]
      },
      "response": {
        "kind": "single_choice",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "choice_B"
      },
      "visual": {
        "kind": "method_choice_fraction_product",
        "renderMethodEquationsFromFactors": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "CONFIRM.CORRECT",
          "incorrectBySignal": {
            "default": "CONFIRM.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "method_choice_direct_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "rawDisplayProduct": "12/56"
      }
    },
    "C-CONTEXT": {
      "id": "C-CONTEXT",
      "stage": "confirmation",
      "assessmentIntent": "CONTEXT_no_hint_confirmation",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 4
        },
        "second": {
          "numerator": 2,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh check",
        "title": "No hint this time",
        "prompt": "Three quarters of a report is complete. Two fifths of the completed part has been checked. What fraction of the full report is both complete and checked?",
        "context": {
          "kind": "nested_report_status"
        }
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "nested_context_cards",
        "context": "report",
        "forbidPreSubmitProductGrid": true,
        "accessibleDescriptionTemplate": "A report card states {firstFraction} complete; a second card states {secondFraction} of the completed part has been checked."
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "CONFIRM.CORRECT",
          "incorrectBySignal": {
            "default": "CONFIRM.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "rawDisplayProduct": "6/20",
        "addedToResolveStoryboardContextConfirmationReference": true
      }
    }
  };
  var FRA24_REPAIR_ITEMS = {
    "RA-SUP": {
      "id": "RA-SUP",
      "stage": "repair",
      "assessmentIntent": "ADD_supported_overlap",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 5
        },
        "second": {
          "numerator": 2,
          "denominator": 4
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Choose the overlap count and the total-cell count."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "area_product_grid",
        "firstOrientation": "columns",
        "secondOrientation": "rows",
        "showCountsBeforeSubmit": false,
        "supportedCountSelection": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "area_fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RA-FRESH": {
      "id": "RA-FRESH",
      "stage": "repair",
      "assessmentIntent": "ADD_fresh_independent",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 7
        },
        "second": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Calculate the exact product with no grid and no hint."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RC-SUP": {
      "id": "RC-SUP",
      "stage": "repair",
      "assessmentIntent": "CROSS_supported_row_cards",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 8
        },
        "second": {
          "numerator": 2,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Tap the two numerator cards, then the two denominator cards."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "row_pairing_cards",
        "forbidDiagonalArrows": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RC-FRESH": {
      "id": "RC-FRESH",
      "stage": "repair",
      "assessmentIntent": "CROSS_fresh_independent",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 8
        },
        "second": {
          "numerator": 5,
          "denominator": 6
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Calculate the exact product with no pairing cue."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RK-SUP": {
      "id": "RK-SUP",
      "stage": "repair",
      "assessmentIntent": "KEEP_supported_denominator",
      "factors": {
        "first": {
          "numerator": 2,
          "denominator": 3
        },
        "second": {
          "numerator": 4,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Type only the denominator of the product."
      },
      "response": {
        "kind": "integer_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "missing_denominator"
      },
      "visual": {
        "kind": "missing_fraction_field",
        "fixedNumeratorDerivedFromFactors": true,
        "editableField": "denominator"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "missing_denominator_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RK-FRESH": {
      "id": "RK-FRESH",
      "stage": "repair",
      "assessmentIntent": "KEEP_fresh_independent",
      "factors": {
        "first": {
          "numerator": 5,
          "denominator": 6
        },
        "second": {
          "numerator": 2,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Calculate the exact product."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RCO-SUP": {
      "id": "RCO-SUP",
      "stage": "repair",
      "assessmentIntent": "COMMON_supported_method",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 7
        },
        "second": {
          "numerator": 2,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Choose the shortest valid direct method.",
        "options": [
          {
            "id": "A",
            "method": "common_denominator_first",
            "text": "Rewrite both fractions with a common denominator, then multiply."
          },
          {
            "id": "B",
            "method": "multiply_rows",
            "text": "Multiply numerator by numerator and denominator by denominator."
          },
          {
            "id": "C",
            "method": "add_rows",
            "text": "Add the numerators and add the denominators."
          }
        ]
      },
      "response": {
        "kind": "single_choice",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "choice_B"
      },
      "visual": {
        "kind": "method_choice_fraction_product",
        "options": [
          "common_denominator_first",
          "multiply_rows",
          "add_rows"
        ]
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "method_choice_direct_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RCO-FRESH": {
      "id": "RCO-FRESH",
      "stage": "repair",
      "assessmentIntent": "COMMON_fresh_independent",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 9
        },
        "second": {
          "numerator": 3,
          "denominator": 8
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Multiply the fractions as they are."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RIMP-SUP": {
      "id": "RIMP-SUP",
      "stage": "repair",
      "assessmentIntent": "IMPROPER_supported_same_rule",
      "factors": {
        "first": {
          "numerator": 5,
          "denominator": 4
        },
        "second": {
          "numerator": 2,
          "denominator": 7
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Multiply and leave the answer as one fraction."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product",
        "preserveImproperFactorAsWritten": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RIMP-FRESH": {
      "id": "RIMP-FRESH",
      "stage": "repair",
      "assessmentIntent": "IMPROPER_fresh_independent",
      "factors": {
        "first": {
          "numerator": 7,
          "denominator": 5
        },
        "second": {
          "numerator": 3,
          "denominator": 8
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Calculate the exact product."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product",
        "preserveImproperFactorAsWritten": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    },
    "RFORM-SUP": {
      "id": "RFORM-SUP",
      "stage": "repair",
      "assessmentIntent": "FORM_supported_after_product",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 5
        },
        "second": {
          "numerator": 5,
          "denominator": 8
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Multiply first, then give the answer in simplest form."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_simplest"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product_then_simplify",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": true
      }
    },
    "RFORM-FRESH": {
      "id": "RFORM-FRESH",
      "stage": "repair",
      "assessmentIntent": "FORM_fresh_independent",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 4
        },
        "second": {
          "numerator": 2,
          "denominator": 9
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Give the product in simplest form."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_simplest"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product_then_simplify",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": true
      }
    },
    "RARITH-FRESH": {
      "id": "RARITH-FRESH",
      "stage": "repair",
      "assessmentIntent": "ARITHMETIC_fresh_fact_light",
      "factors": {
        "first": {
          "numerator": 2,
          "denominator": 3
        },
        "second": {
          "numerator": 2,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Repair check",
        "title": "Try a fresh example",
        "prompt": "Calculate the exact product."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "REPAIR.CHECK.CORRECT",
          "incorrectBySignal": {
            "default": "REPAIR.CHECK.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "freshRelativeToRepairExplanation": true,
        "simplestFormRequired": false
      }
    }
  };
  var FRA24_REPAIRS = {
    "R-ADD": {
      "title": "A fraction of a fraction is not addition",
      "errorFamily": "add",
      "trigger": "Repeated additive signature, explicit add-the-tops-and-bottoms method, or recurrence in final evidence.",
      "runtimeUtteranceIds": [
        "R-ADD.1",
        "R-ADD.2",
        "R-ADD.3",
        "R-ADD.4"
      ],
      "supportedInteractionId": "RA-SUP",
      "freshCheckId": "RA-FRESH",
      "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-CROSS": {
      "title": "Keep the two number rows intact",
      "errorFamily": "cross",
      "trigger": "Repeated exact crosswise signature or explicit crosswise work.",
      "runtimeUtteranceIds": [
        "R-CROSS.1",
        "R-CROSS.2",
        "R-CROSS.3",
        "R-CROSS.4"
      ],
      "supportedInteractionId": "RC-SUP",
      "freshCheckId": "RC-FRESH",
      "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-KEEP": {
      "title": "Both denominators shape the new whole grid",
      "errorFamily": "keep_denominator",
      "trigger": "Repeated correct numerator product paired with one original denominator, or explicit claim that one denominator stays.",
      "runtimeUtteranceIds": [
        "R-KEEP.1",
        "R-KEEP.2",
        "R-KEEP.3"
      ],
      "supportedInteractionId": "RK-SUP",
      "freshCheckId": "RK-FRESH",
      "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-COMMON": {
      "title": "A common denominator is not needed",
      "errorFamily": "common_denominator_needed",
      "trigger": "The learner explicitly says denominators must match or repeatedly rewrites before every product in a way that blocks direct multiplication.",
      "runtimeUtteranceIds": [
        "R-COMMON.1",
        "R-COMMON.2",
        "R-COMMON.3"
      ],
      "supportedInteractionId": "RCO-SUP",
      "freshCheckId": "RCO-FRESH",
      "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-IMPROPER": {
      "title": "A larger numerator does not change the rule",
      "errorFamily": "improper_invalid",
      "trigger": "Repeated refusal to use a valid improper factor or explicit claim that the numerator cannot exceed the denominator.",
      "runtimeUtteranceIds": [
        "R-IMPROPER.1",
        "R-IMPROPER.2",
        "R-IMPROPER.3"
      ],
      "supportedInteractionId": "RIMP-SUP",
      "freshCheckId": "RIMP-FRESH",
      "checkpointPolicy": "Return to the stored route checkpoint after the fresh check succeeds."
    },
    "R-FORM": {
      "title": "Finish the requested answer form after multiplying",
      "errorFamily": "form",
      "trigger": "A mathematically equivalent product is repeatedly left unsimplified on an item that explicitly requires simplest form.",
      "runtimeUtteranceIds": [
        "R-FORM.1"
      ],
      "supportedInteractionId": "RFORM-SUP",
      "freshCheckId": "RFORM-FRESH",
      "checkpointPolicy": "Use brief FRA-10-compatible support without teaching cancellation before multiplication."
    },
    "ARITHMETIC": {
      "title": "Arithmetic-only handling",
      "errorFamily": "arithmetic_slip",
      "trigger": "Correct row structure with one multiplication-fact slip.",
      "runtimeUtteranceIds": [
        "R-ARITH.1"
      ],
      "supportedInteractionId": null,
      "freshCheckId": "RARITH-FRESH",
      "checkpointPolicy": "Do not classify one isolated fact slip as a fraction-product misconception."
    },
    "UNKNOWN": {
      "title": "Gather visible method evidence",
      "errorFamily": "unknown",
      "trigger": "Blank, malformed, or ambiguous response without a unique mathematical signature.",
      "runtimeUtteranceIds": [
        "R-UNKNOWN.1"
      ],
      "supportedInteractionId": null,
      "freshCheckId": "C-METHOD",
      "checkpointPolicy": "Do not infer hidden thinking; use one discriminating fresh item."
    }
  };
  var FRA24_RECOVERY_ITEMS = {
    "A-DIRECT": {
      "id": "A-DIRECT",
      "stage": "recovery_final",
      "assessmentIntent": "DIRECT_recovery",
      "factors": {
        "first": {
          "numerator": 5,
          "denominator": 8
        },
        "second": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh final",
        "title": "Recovery check",
        "prompt": "Calculate the exact product."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "A-DIRECT.CORRECT",
          "incorrectBySignal": {
            "default": "A-DIRECT.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "mustBeUnseenInCurrentAttempt": true
      }
    },
    "A-VIS": {
      "id": "A-VIS",
      "stage": "recovery_final",
      "assessmentIntent": "VIS_recovery",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 5
        },
        "second": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh final",
        "title": "Recovery check",
        "prompt": "Write the exact product represented by the overlap."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "area_product_grid",
        "firstOrientation": "columns",
        "secondOrientation": "rows",
        "showCountsBeforeSubmit": false
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "A-VIS.CORRECT",
          "incorrectBySignal": {
            "default": "A-VIS.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "area_fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "mustBeUnseenInCurrentAttempt": true
      }
    },
    "A-METHOD": {
      "id": "A-METHOD",
      "stage": "recovery_final",
      "assessmentIntent": "METHOD_recovery",
      "factors": {
        "first": {
          "numerator": 3,
          "denominator": 7
        },
        "second": {
          "numerator": 4,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh final",
        "title": "Recovery check",
        "prompt": "Choose the valid direct multiplication line.",
        "options": [
          {
            "id": "A",
            "method": "add_rows",
            "text": "3/7 \xD7 4/5 = 7/12"
          },
          {
            "id": "B",
            "method": "multiply_rows",
            "text": "3/7 \xD7 4/5 = 12/35"
          },
          {
            "id": "C",
            "method": "crosswise",
            "text": "3/7 \xD7 4/5 = 15/28"
          }
        ]
      },
      "response": {
        "kind": "single_choice",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "choice_B"
      },
      "visual": {
        "kind": "method_choice_fraction_product",
        "options": [
          "add_rows",
          "multiply_rows",
          "crosswise"
        ]
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "A-METHOD.CORRECT",
          "incorrectBySignal": {
            "default": "A-METHOD.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "method_choice_direct_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "mustBeUnseenInCurrentAttempt": true
      }
    },
    "A-IMPROPER": {
      "id": "A-IMPROPER",
      "stage": "recovery_final",
      "assessmentIntent": "IMPROPER_recovery",
      "factors": {
        "first": {
          "numerator": 6,
          "denominator": 5
        },
        "second": {
          "numerator": 3,
          "denominator": 8
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh final",
        "title": "Recovery check",
        "prompt": "Multiply and leave the answer as one fraction."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "symbolic_fraction_product",
        "preserveImproperFactorAsWritten": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "A-IMPROPER.CORRECT",
          "incorrectBySignal": {
            "default": "A-IMPROPER.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "mustBeUnseenInCurrentAttempt": true
      }
    },
    "A-CONTEXT": {
      "id": "A-CONTEXT",
      "stage": "recovery_final",
      "assessmentIntent": "CONTEXT_recovery",
      "factors": {
        "first": {
          "numerator": 2,
          "denominator": 3
        },
        "second": {
          "numerator": 3,
          "denominator": 5
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh final",
        "title": "Recovery check",
        "prompt": "Two thirds of a project is complete. Three fifths of the completed part has been checked. What fraction of the full project is both complete and checked?"
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_equivalent"
      },
      "visual": {
        "kind": "nested_context_cards",
        "context": "project",
        "forbidPreSubmitProductGrid": true
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "A-CONTEXT.CORRECT",
          "incorrectBySignal": {
            "default": "A-CONTEXT.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "mustBeUnseenInCurrentAttempt": true
      }
    },
    "A-FORM": {
      "id": "A-FORM",
      "stage": "recovery_final",
      "assessmentIntent": "FORM_recovery",
      "factors": {
        "first": {
          "numerator": 4,
          "denominator": 5
        },
        "second": {
          "numerator": 5,
          "denominator": 6
        }
      },
      "learnerUi": {
        "stageLabel": "Fresh final",
        "title": "Recovery check",
        "prompt": "Give the product in simplest form."
      },
      "response": {
        "kind": "fraction_input",
        "lockOnSubmit": true,
        "allowRetryAfterFeedback": false,
        "workedCheckReveal": "after_lock"
      },
      "answerPolicy": {
        "kind": "fraction_simplest"
      },
      "visual": {
        "kind": "symbolic_fraction_product"
      },
      "support": {
        "hintPolicy": "none",
        "hintUtteranceId": null
      },
      "runtime": {
        "preUtteranceIds": [],
        "outcomeUtteranceIds": {
          "correct": "A-FORM.CORRECT",
          "incorrectBySignal": {
            "form": "A-FORM.FORM",
            "default": "A-FORM.INCORRECT"
          }
        }
      },
      "workedCheck": {
        "kind": "fraction_product_then_simplify",
        "deriveAllNumbersFromFactors": true
      },
      "authorOnly": {
        "mustBeUnseenInCurrentAttempt": true
      }
    }
  };
  var FRA24_CONFIRMATION_MAP = {
    "F1": "C-DIR",
    "F2": "C-METHOD",
    "I1": "C-CONTEXT",
    "I2": "C-IMP"
  };
  var FRA24_RECOVERY_BY_FAMILY = {
    "add": [
      "A-METHOD",
      "A-DIRECT"
    ],
    "cross": [
      "A-METHOD",
      "A-DIRECT"
    ],
    "keep_denominator": [
      "A-VIS",
      "A-DIRECT"
    ],
    "common_denominator_needed": [
      "A-METHOD",
      "A-DIRECT"
    ],
    "improper_invalid": [
      "A-IMPROPER",
      "A-DIRECT"
    ],
    "form": [
      "A-FORM",
      "A-CONTEXT"
    ],
    "arithmetic_slip": [
      "A-DIRECT",
      "A-VIS"
    ],
    "unknown": [
      "A-METHOD",
      "A-VIS"
    ]
  };
  var FRA24_ROUTE = {
    "primaryOrder": [
      "HOOK",
      "T1",
      "T2",
      "T3",
      "T4",
      "HANDOFF",
      "G1",
      "G2",
      "F1?",
      "F2",
      "I1",
      "I2",
      "M1",
      "M2",
      "M3",
      "M4",
      "M5"
    ],
    "strongRoute": {
      "gateAfter": [
        "G1",
        "G2"
      ],
      "skip": "F1",
      "retain": "F2",
      "criteria": [
        "both first-attempt correct",
        "no support escalation",
        "no unresolved central error",
        "response time alone never qualifies"
      ]
    },
    "hintConfirmationMap": {
      "F1": "C-DIR",
      "F2": "C-METHOD",
      "I1": "C-CONTEXT",
      "I2": "C-IMP"
    },
    "final": {
      "questionIds": [
        "M1",
        "M2",
        "M3",
        "M4",
        "M5"
      ],
      "masteryThreshold": 4,
      "breadthRequirement": "At least one of M2, M4, or M5 correct and direct procedure secure.",
      "finish": "4-5/5 with breadth and no repeated blocking misconception",
      "middle": "3/5 or otherwise blocked 4-5/5 -> targeted repair plus fresh 2-item no-hint mini-check requiring 2/2",
      "low": "0-2/5 -> targeted repair plus fresh 3-item final requiring 3/3"
    },
    "finalIntroUtteranceIds": [
      "FINAL.INTRO.1",
      "FINAL.INTRO.2"
    ],
    "completionUtteranceId": "COMPLETE",
    "withinLessonOnly": true,
    "forbidDiagnostic": true,
    "forbidRetrieval": true
  };
  var FRA24_ALL_QUESTIONS = {
    ...FRA24_QUESTIONS,
    ...FRA24_CONFIRMATIONS,
    ...FRA24_REPAIR_ITEMS,
    ...FRA24_RECOVERY_ITEMS
  };
  var FRA24_SOURCE_COMPLETION_NOTES = [
    {
      id: "SC-1",
      status: "implementation_completion",
      note: "The storyboard requires fresh same-family no-hint confirmation after hint-assisted success. It names C-CONTEXT in the route trace but does not fully author every context and direct-transfer confirmation. C-CONTEXT and C-DIR provide deterministic fresh values inside the approved FRA-24 envelope."
    },
    {
      id: "SC-2",
      status: "implementation_completion",
      note: "The storyboard authors R-IMPROPER plus brief form and arithmetic support principles without assigning every executable interaction. The canonical repair items complete the approved explain, supported interaction, fresh independent check pattern without widening the lesson."
    },
    {
      id: "SC-3",
      status: "implementation_completion",
      note: "The storyboard fixes a fresh two-item recovery after 3/5 and a fresh three-item final after 0-2/5, but it does not enumerate every recovery value. A-DIRECT through A-FORM make those routes deterministic, history-aware and testable."
    },
    {
      id: "SC-4",
      status: "source_preservation_note",
      note: "The approved storyboard deliberately reuses some factor or product values across teaching, independent and final surfaces. Implementation must clear prior worked overlays before every scored item and use unseen recovery substitutions where the learner's history would otherwise leak an answer."
    },
    {
      id: "SC-5",
      status: "boundary",
      note: "No Diagnostic placement, Retrieval schedule, cross-cancellation lesson, fraction division, mixed-number multiplication, negative fraction or algebraic-fraction behaviour is authored in this handoff."
    }
  ];
  var FRA24 = {
    id: "FRA24",
    displayId: "FRA-24",
    title: "Multiply Two Fractions",
    status: "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
    handoffVersion: "v1",
    contentVersion: "fra24-canonical-handoff-v1",
    sourceOfTruth: {
      runtimeCopyQuestionDataRoutingAndValidation: "FRA24_CANONICAL_SPEC.ts",
      visualGeometryLayoutAndOwnerPedagogy: "Revily_FRA-24_Storyboard_v1.pdf",
      engineeringIntegrationAndAcceptance: "FRA24_CODEX_IMPLEMENTATION_PROMPT.md",
      launchInstruction: "FRA24_START_CODEX_PROMPT.txt",
      criticalPrecedenceRule: "Ryan speech and Ryan captions may resolve only FRA24_RUNTIME_COPY[utteranceId].text. The PDF is the approved visual and owner-facing pedagogy reference. Never transcribe PDF headings, stage directions, route prose or QA language into Ryan speech.",
      engineeringReference: "Existing canonical Revily FRA01-FRA23-compatible lesson shell, Ryan TTS/caption timeline, evidence, hint, answer-lock, persistence, accessibility and test infrastructure."
    },
    scope: {
      objective: "Multiply two positive fractions by multiplying numerators and denominators, with conceptual area and scaling support.",
      studentFacingIdea: "A fraction of a fraction becomes an overlap.",
      prerequisites: [
        "FRA-02: numerator and denominator roles.",
        "FRA-23: multiplying a fraction by an integer or repeated scaling.",
        "P-N01: basic multiplication facts.",
        "FRA-10 supports designated simplest-form outputs; it is not the target here."
      ],
      teaches: [
        "interpret 'of' as multiplication in fraction-of-a-fraction situations",
        "use an area grid to connect selected columns, selected rows and overlap",
        "multiply numerator by numerator and denominator by denominator",
        "multiply proper fractions and simple improper factors",
        "recognise that a common denominator is not required",
        "simplify after multiplying only when the item explicitly requests simplest form"
      ],
      excludes: [
        "FRA-25 simplify or cancel before multiplication",
        "reciprocals and fraction division",
        "mixed-number multiplication or conversion as part of the method",
        "negative or algebraic fractions",
        "decimals, percentages, multi-step mixed operations",
        "global Diagnostic, Retrieval, placement or scheduling"
      ],
      pilotEnvelope: {
        positiveFactorsOnly: true,
        denominatorMin: 2,
        denominatorMax: 12,
        properAndSimpleImproperFactors: true,
        acceptExactEquivalentUnlessSimplestRequested: true
      }
    },
    sourceCompletionNotes: FRA24_SOURCE_COMPLETION_NOTES,
    implementationClarifications: [
      "The unscored hook uses distinct exact, underestimate, overestimate and show-me branches before the common reveal. A wrong prediction never plays the correct-response line.",
      "Final feedback is item-specific rather than one repeated generic line, while preserving the storyboard's correct/incorrect style and post-lock worked checks.",
      "The storyboard route trace names a C-CONTEXT confirmation but its summary table omits the exact item. C-CONTEXT is therefore authored here as a fresh report context with 3/4 then 2/5, answer 6/20, so Codex does not invent it.",
      "Recovery items are fully authored here because the storyboard specifies fresh two- and three-item recovery routes but not every exact value.",
      "Correct independent early cancellation is mathematically accepted when the final value is correct, but Ryan never teaches, praises or demonstrates it in FRA24."
    ],
    teachingScenes: FRA24_TEACHING_SCENES,
    cues: FRA24_CUES,
    questions: FRA24_QUESTIONS,
    confirmations: FRA24_CONFIRMATIONS,
    repairs: FRA24_REPAIRS,
    repairItems: FRA24_REPAIR_ITEMS,
    recoveryItems: FRA24_RECOVERY_ITEMS,
    route: FRA24_ROUTE,
    evidenceFields: [
      "firstAttemptCorrect",
      "attempts",
      "hintOpenedBeforeSubmit",
      "supportEscalated",
      "supportLevel",
      "answerLocked",
      "errorFamilyHypothesis",
      "methodEvidence",
      "freshConfirmationPassed",
      "mathematicallyEquivalentButFormIncomplete"
    ],
    accessibility: {
      spokenContentHasTextEquivalent: true,
      captionsUseExactRuntimeUtterance: true,
      noPermanentTranscriptBar: true,
      keyboardNavigation: true,
      minimumTouchTargetCssPixels: 44,
      colourNeverSoleCue: true,
      areaSelectionUsesPatternAndBorder: true,
      reducedMotionPreservesMathematicalStates: true,
      accessibleDescriptionsMustNotComputeScoredAnswer: true,
      finalWorkedCheckEntersAccessibilityTreeOnlyAfterLock: true
    },
    responsive: {
      desktopAndMobileRequired: true,
      mobileAuditWidthCssPixels: 390,
      oneDominantMathVisualAtATime: true,
      finalBeforeAfterPanelsStackOnMobile: true,
      optionsStackOnMobile: true,
      fractionInputsRemainLegible: true
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
  function reduceFraction(value) {
    if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
      throw new Error("Fraction values must be integers.");
    }
    if (value.denominator === 0) {
      throw new Error("A denominator cannot be zero.");
    }
    const sign = value.denominator < 0 ? -1 : 1;
    const numerator = value.numerator * sign;
    const denominator = value.denominator * sign;
    const divisor = gcd(numerator, denominator);
    return { numerator: numerator / divisor, denominator: denominator / divisor };
  }
  function rawProductFromQuestion(question) {
    return {
      numerator: question.factors.first.numerator * question.factors.second.numerator,
      denominator: question.factors.first.denominator * question.factors.second.denominator
    };
  }
  function areEquivalentFractions(a, b) {
    if (a.denominator === 0 || b.denominator === 0) return false;
    return a.numerator * b.denominator === b.numerator * a.denominator;
  }
  function classifyFractionMismatch(question, submitted, methodEvidence) {
    if (!("factors" in question)) return "unknown";
    const { first, second } = question.factors;
    const raw = rawProductFromQuestion(question);
    if (methodEvidence === "common_denominator_first") return "common_denominator_needed";
    if (methodEvidence === "cannot_multiply_improper") return "improper_invalid";
    if (methodEvidence === "convert_improper_first") return "mixed_conversion";
    if (methodEvidence === "row_structure_correct") return "arithmetic_slip";
    const additive = {
      numerator: first.numerator + second.numerator,
      denominator: first.denominator + second.denominator
    };
    if (submitted.numerator === additive.numerator && submitted.denominator === additive.denominator) {
      return "add";
    }
    const crosswise = {
      numerator: first.numerator * second.denominator,
      denominator: first.denominator * second.numerator
    };
    if (submitted.numerator === crosswise.numerator && submitted.denominator === crosswise.denominator) {
      return "cross";
    }
    if (submitted.numerator === raw.numerator && (submitted.denominator === first.denominator || submitted.denominator === second.denominator)) {
      return "keep_denominator";
    }
    return "unknown";
  }
  function markFRA24Response(questionId, submission) {
    const question = FRA24_ALL_QUESTIONS[questionId];
    const answerKind = question.answerPolicy.kind;
    if (answerKind === "choice_B") {
      if (submission.kind !== "choice") {
        return { correct: false, mathematicallyEquivalent: false, formComplete: false, errorFamily: "unknown", outcomeSignal: "default" };
      }
      const correct = submission.optionId === "B";
      const optionFamily = {
        A: "add",
        C: "cross",
        D: questionId === "F2" ? "common_denominator_needed" : "keep_denominator"
      };
      return {
        correct,
        mathematicallyEquivalent: correct,
        formComplete: correct,
        errorFamily: correct ? null : optionFamily[submission.optionId] ?? "unknown",
        outcomeSignal: correct ? "correct" : `option_${submission.optionId}`
      };
    }
    if (answerKind === "missing_denominator") {
      if (submission.kind !== "integer") {
        return { correct: false, mathematicallyEquivalent: false, formComplete: false, errorFamily: "unknown", outcomeSignal: "default" };
      }
      const expected = rawProductFromQuestion(question).denominator;
      const correct = submission.value === expected;
      let family2 = null;
      if (!correct) {
        const firstDenominator = question.factors.first.denominator;
        const secondDenominator = question.factors.second.denominator;
        if (submission.value === firstDenominator || submission.value === secondDenominator) family2 = "keep_denominator";
        else if (submission.value === firstDenominator + secondDenominator) family2 = "add";
        else if (submission.methodEvidence === "cannot_multiply_improper") family2 = "improper_invalid";
        else family2 = "unknown";
      }
      return {
        correct,
        mathematicallyEquivalent: correct,
        formComplete: correct,
        errorFamily: family2,
        outcomeSignal: correct ? "correct" : family2 ?? "default"
      };
    }
    if (submission.kind !== "fraction") {
      return { correct: false, mathematicallyEquivalent: false, formComplete: false, errorFamily: "unknown", outcomeSignal: "default" };
    }
    const candidate = { numerator: submission.numerator, denominator: submission.denominator };
    const raw = rawProductFromQuestion(question);
    const equivalent = areEquivalentFractions(candidate, raw);
    if (equivalent) {
      if (answerKind === "fraction_simplest") {
        const reduced = reduceFraction(raw);
        const candidateReduced = reduceFraction(candidate);
        const formComplete = candidate.numerator === candidateReduced.numerator && candidate.denominator === candidateReduced.denominator && candidateReduced.numerator === reduced.numerator && candidateReduced.denominator === reduced.denominator;
        return {
          correct: formComplete,
          mathematicallyEquivalent: true,
          formComplete,
          errorFamily: formComplete ? null : "form",
          outcomeSignal: formComplete ? "correct" : "form"
        };
      }
      return { correct: true, mathematicallyEquivalent: true, formComplete: true, errorFamily: null, outcomeSignal: "correct" };
    }
    const family = classifyFractionMismatch(question, candidate, submission.methodEvidence);
    return {
      correct: false,
      mathematicallyEquivalent: false,
      formComplete: false,
      errorFamily: family,
      outcomeSignal: family
    };
  }
  var CENTRAL_ERRORS = /* @__PURE__ */ new Set([
    "add",
    "cross",
    "keep_denominator",
    "common_denominator_needed",
    "improper_invalid"
  ]);
  function shouldSkipFRA24F1(records) {
    const guided = ["G1", "G2"].map((id) => records.find((record) => record.questionId === id));
    return guided.every(
      (record) => record !== void 0 && record.firstAttemptCorrect && !record.hintOpenedBeforeSubmit && !record.supportEscalated && (!record.errorFamilyHypothesis || !CENTRAL_ERRORS.has(record.errorFamilyHypothesis))
    );
  }
  function requiredFRA24ConfirmationIds(records) {
    const required = /* @__PURE__ */ new Set();
    for (const record of records) {
      if (!record.hintOpenedBeforeSubmit || record.freshConfirmationPassed) continue;
      const mapped = FRA24_CONFIRMATION_MAP[record.questionId];
      if (mapped) required.add(mapped);
    }
    return [...required];
  }
  function evaluateFRA24Final(records) {
    const finalIds = FRA24_ROUTE.final.questionIds;
    const finalRecords = finalIds.map((id) => records.find((record) => record.questionId === id));
    const correctIds = new Set(
      finalRecords.filter((record) => Boolean(record?.firstAttemptCorrect)).map((record) => record.questionId)
    );
    const correctCount = correctIds.size;
    const directProcedureSecure = correctIds.has("M1") || correctIds.has("M3");
    const breadthSecure = correctIds.has("M2") || correctIds.has("M4") || correctIds.has("M5");
    const counts = /* @__PURE__ */ new Map();
    for (const record of finalRecords) {
      const family = record?.errorFamilyHypothesis;
      if (!family || !CENTRAL_ERRORS.has(family)) continue;
      counts.set(family, (counts.get(family) ?? 0) + 1);
    }
    const repeatedBlockingFamily = [...counts.entries()].find(([, count]) => count >= 2)?.[0] ?? null;
    if (correctCount >= 4 && directProcedureSecure && breadthSecure && repeatedBlockingFamily === null) {
      return { route: "finish_candidate", correctCount, directProcedureSecure, breadthSecure, repeatedBlockingFamily };
    }
    if (correctCount >= 3) {
      return { route: "repair_then_two_item_check", correctCount, directProcedureSecure, breadthSecure, repeatedBlockingFamily };
    }
    return { route: "repair_then_three_item_final", correctCount, directProcedureSecure, breadthSecure, repeatedBlockingFamily };
  }
  function rotateFRA24RecoveryOrder(items, seed) {
    if (items.length === 0) return [];
    const normalized = Math.abs(Math.trunc(seed)) % items.length;
    return [...items.slice(normalized), ...items.slice(0, normalized)];
  }
  function selectFRA24RecoveryItemIds(route, missedFamilies, seenItemIds = [], seed = 0) {
    if (route === "finish_candidate") return [];
    const targetCount = route === "repair_then_two_item_check" ? 2 : 3;
    const seen = new Set(seenItemIds);
    const selected = [];
    const add = (id) => {
      if (!seen.has(id) && !selected.includes(id) && selected.length < targetCount) selected.push(id);
    };
    for (const family of rotateFRA24RecoveryOrder(missedFamilies, seed)) {
      const candidates = FRA24_RECOVERY_BY_FAMILY[family] ?? FRA24_RECOVERY_BY_FAMILY.unknown;
      for (const id of rotateFRA24RecoveryOrder(candidates, seed + selected.length)) {
        add(id);
      }
      if (selected.length >= targetCount) break;
    }
    const breadthOrder = [
      "A-DIRECT",
      "A-VIS",
      "A-CONTEXT",
      "A-METHOD",
      "A-IMPROPER",
      "A-FORM"
    ];
    for (const id of rotateFRA24RecoveryOrder(breadthOrder, seed)) add(id);
    if (targetCount === 3) {
      const directIds = ["A-DIRECT", "A-IMPROPER"];
      const transferIds = ["A-VIS", "A-CONTEXT", "A-METHOD", "A-FORM"];
      const hasAny = (ids) => selected.some((id) => ids.includes(id));
      const findReplacement = (ids) => rotateFRA24RecoveryOrder(ids, seed).find((id) => !seen.has(id) && !selected.includes(id));
      if (!hasAny(directIds)) {
        const replacement = findReplacement(directIds);
        if (replacement && selected.length > 0) selected[selected.length - 1] = replacement;
      }
      if (!hasAny(transferIds)) {
        const replacement = findReplacement(transferIds);
        if (replacement && selected.length > 0) selected[selected.length - 1] = replacement;
      }
    }
    return selected.slice(0, targetCount);
  }
  function collectRuntimeIdsFromQuestion(question) {
    const ids = [...question.runtime.preUtteranceIds];
    if (question.support.hintUtteranceId) ids.push(question.support.hintUtteranceId);
    const outcome = question.runtime.outcomeUtteranceIds;
    if (outcome.correct) ids.push(outcome.correct);
    ids.push(...Object.values(outcome.incorrectBySignal).filter((value) => typeof value === "string"));
    return ids;
  }
  function validateFRA24CanonicalSpec() {
    const errors = [];
    const runtimeEntries = Object.entries(FRA24_RUNTIME_COPY);
    const seenTexts = /* @__PURE__ */ new Map();
    const bannedRuntimeTerms = [
      "assessment intent",
      "author-only",
      "quality gate",
      "diagnostic layer",
      "retrieval layer",
      "implementation prompt",
      "error family",
      "support escalation",
      "route rule"
    ];
    for (const [id, utterance] of runtimeEntries) {
      if (utterance.audience !== "learner" || utterance.spokenBy !== "Ryan") errors.push(`${id}: invalid runtime audience or speaker.`);
      if (utterance.captionSource !== "same_as_audio") errors.push(`${id}: caption must use the exact audio source.`);
      if (!utterance.text.trim()) errors.push(`${id}: empty runtime text.`);
      const duplicate = seenTexts.get(utterance.text);
      if (duplicate) errors.push(`${id}: duplicates exact runtime text from ${duplicate}.`);
      else seenTexts.set(utterance.text, id);
      const lower = utterance.text.toLowerCase();
      for (const term of bannedRuntimeTerms) {
        if (lower.includes(term)) errors.push(`${id}: learner runtime copy contains banned authoring phrase '${term}'.`);
      }
    }
    const usedRuntimeIds = /* @__PURE__ */ new Set();
    for (const scene of Object.values(FRA24_TEACHING_SCENES)) {
      scene.runtimeUtteranceIds.forEach((id) => usedRuntimeIds.add(id));
    }
    for (const question of Object.values(FRA24_ALL_QUESTIONS)) {
      collectRuntimeIdsFromQuestion(question).forEach((id) => usedRuntimeIds.add(id));
    }
    for (const repair of Object.values(FRA24_REPAIRS)) {
      repair.runtimeUtteranceIds.forEach((id) => usedRuntimeIds.add(id));
    }
    FRA24_ROUTE.finalIntroUtteranceIds.forEach((id) => usedRuntimeIds.add(id));
    usedRuntimeIds.add(FRA24_ROUTE.completionUtteranceId);
    for (const id of runtimeEntries.map(([id2]) => id2)) {
      if (!usedRuntimeIds.has(id)) errors.push(`${id}: runtime utterance is not referenced by a scene, question, repair or completion route.`);
    }
    for (const id of usedRuntimeIds) {
      if (!(id in FRA24_RUNTIME_COPY)) errors.push(`${id}: referenced runtime utterance does not exist.`);
    }
    const cueIds = /* @__PURE__ */ new Set();
    for (const cue of FRA24_CUES) {
      if (cueIds.has(cue.id)) errors.push(`${cue.id}: duplicate cue ID.`);
      cueIds.add(cue.id);
      const utterance = FRA24_RUNTIME_COPY[cue.utteranceId];
      if (!utterance) errors.push(`${cue.id}: missing utterance ${cue.utteranceId}.`);
      else if (!utterance.text.toLowerCase().includes(cue.anchor.toLowerCase())) {
        errors.push(`${cue.id}: anchor '${cue.anchor}' is not present in ${cue.utteranceId}.`);
      }
    }
    for (const [sceneId, scene] of Object.entries(FRA24_TEACHING_SCENES)) {
      for (const cueId of scene.cueIds) {
        if (!cueIds.has(cueId)) errors.push(`${sceneId}: references missing cue ${cueId}.`);
      }
    }
    const allQuestions = Object.values(FRA24_ALL_QUESTIONS);
    const questionIds = /* @__PURE__ */ new Set();
    for (const question of allQuestions) {
      if (questionIds.has(question.id)) errors.push(`${question.id}: duplicate question ID.`);
      questionIds.add(question.id);
      const raw = rawProductFromQuestion(question);
      const { first, second } = question.factors;
      if (first.denominator <= 0 || second.denominator <= 0) errors.push(`${question.id}: denominator must be positive.`);
      if (first.numerator <= 0 || second.numerator <= 0) errors.push(`${question.id}: factors must be positive in FRA24.`);
      if (first.denominator > 12 || second.denominator > 12) errors.push(`${question.id}: denominator exceeds FRA24 pilot envelope.`);
      if (raw.denominator !== first.denominator * second.denominator || raw.numerator !== first.numerator * second.numerator) {
        errors.push(`${question.id}: raw product derivation failed.`);
      }
      if (question.response.lockOnSubmit && question.response.workedCheckReveal !== "after_lock") {
        errors.push(`${question.id}: locked response must reveal working only after lock.`);
      }
      if ((question.stage === "final" || question.stage === "confirmation" || question.stage === "recovery_final") && question.support.hintPolicy !== "none") {
        errors.push(`${question.id}: final/confirmation/recovery item must not expose a hint.`);
      }
      if (question.stage === "final" && (!question.response.lockOnSubmit || question.response.allowRetryAfterFeedback)) {
        errors.push(`${question.id}: final item must lock and disallow answer changes after submit.`);
      }
      if (question.visual.kind === "area_product_grid" && question.visual.showCountsBeforeSubmit !== false) {
        errors.push(`${question.id}: scored area grid must not reveal counts before submit.`);
      }
      const correctId = question.runtime.outcomeUtteranceIds.correct;
      const incorrectIds = Object.values(question.runtime.outcomeUtteranceIds.incorrectBySignal).filter((value) => typeof value === "string");
      if (!correctId) errors.push(`${question.id}: missing correct outcome utterance.`);
      if (correctId && incorrectIds.includes(correctId)) errors.push(`${question.id}: correct and incorrect outcome branches share one utterance.`);
      for (const id of collectRuntimeIdsFromQuestion(question)) {
        if (!(id in FRA24_RUNTIME_COPY)) errors.push(`${question.id}: missing runtime utterance ${id}.`);
      }
    }
    for (const question of allQuestions) {
      if (question.response.kind !== "single_choice") continue;
      const options = "options" in question.learnerUi ? question.learnerUi.options : void 0;
      if (!Array.isArray(options) || options.length < 2) {
        errors.push(`${question.id}: single-choice item must define learner-visible option text in learnerUi.options.`);
        continue;
      }
      const optionIds = /* @__PURE__ */ new Set();
      for (const option of options) {
        if (!option.id || !option.text?.trim()) errors.push(`${question.id}: every choice needs a non-empty ID and learner-visible text.`);
        if (optionIds.has(option.id)) errors.push(`${question.id}: duplicate option ID ${option.id}.`);
        optionIds.add(option.id);
      }
      if (question.answerPolicy.kind === "choice_B" && !optionIds.has("B")) {
        errors.push(`${question.id}: choice_B answer policy requires learner option B.`);
      }
    }
    if (FRA24_SOURCE_COMPLETION_NOTES.length !== 5) errors.push("FRA24 source-completion disclosure set must contain SC-1 through SC-5.");
    if (Object.keys(FRA24_CONFIRMATIONS).length < 4) errors.push("FRA24 must provide fresh no-hint confirmation coverage.");
    if (Object.keys(FRA24_RECOVERY_ITEMS).length < 6) errors.push("FRA24 must provide enough unseen recovery breadth for two- and three-item routes.");
    if (Object.keys(FRA24_QUESTIONS).filter((id) => id.startsWith("M")).length !== 5) errors.push("Primary final must contain exactly M1-M5.");
    if (FRA24_ROUTE.final.masteryThreshold !== 4) errors.push("FRA24 primary mastery threshold must be 4/5.");
    if (FRA24_ROUTE.strongRoute.skip !== "F1" || FRA24_ROUTE.strongRoute.retain !== "F2") errors.push("Strong route must skip F1 and retain F2.");
    if (FRA24_QUESTIONS.F2.runtime.preUtteranceIds.length !== 0) errors.push("F2 must have no pre-answer Ryan speech.");
    if (FRA24_QUESTIONS.M5.answerPolicy.kind !== "fraction_simplest") errors.push("M5 must require simplest form.");
    const m5Reduced = reduceFraction(rawProductFromQuestion(FRA24_QUESTIONS.M5));
    if (m5Reduced.numerator !== 1 || m5Reduced.denominator !== 2) errors.push("M5 must reduce to 1/2.");
    const m2Raw = rawProductFromQuestion(FRA24_QUESTIONS.M2);
    if (m2Raw.numerator !== 6 || m2Raw.denominator !== 12) errors.push("M2 authored raw grid product must be 6/12.");
    if (rawProductFromQuestion(FRA24_QUESTIONS.F1).denominator !== 63) errors.push("F1 missing denominator must be 63.");
    if (rawProductFromQuestion(FRA24_QUESTIONS.M3).denominator !== 24) errors.push("M3 missing denominator must be 24.");
    if (FRA24_CONFIRMATION_MAP.I1 !== "C-CONTEXT") errors.push("I1 hint success must map to C-CONTEXT.");
    if (JSON.stringify({ FRA24_TEACHING_SCENES, FRA24_ALL_QUESTIONS, FRA24_REPAIRS }).includes("captionText")) {
      errors.push("A second captionText source exists outside runtime copy.");
    }
    const hook = FRA24_TEACHING_SCENES.HOOK.visual;
    if (hook.firstFraction.numerator !== 3 || hook.firstFraction.denominator !== 4 || hook.secondFraction.numerator !== 2 || hook.secondFraction.denominator !== 3) {
      errors.push("Hook factors must remain 3/4 and 2/3.");
    }
    const t4 = FRA24_TEACHING_SCENES.T4.visual;
    if (t4.referenceWholeColumns !== 4 || t4.visibleColumns !== 5 || t4.rows !== 7 || !t4.referenceWholeDenominatorUsesOnlyReferenceWhole) {
      errors.push("T4 improper area model must preserve a 4-by-7 reference whole with one extra quarter-width column.");
    }
    const recoveryIds = new Set(Object.keys(FRA24_RECOVERY_ITEMS));
    const recoveryFamilySets = [
      ["add"],
      ["cross"],
      ["keep_denominator"],
      ["common_denominator_needed"],
      ["improper_invalid"],
      ["form"],
      ["unknown"],
      ["add", "keep_denominator"]
    ];
    for (let seed = 0; seed < 2e3; seed += 1) {
      const families = recoveryFamilySets[seed % recoveryFamilySets.length];
      for (const route of ["repair_then_two_item_check", "repair_then_three_item_final"]) {
        const selected = selectFRA24RecoveryItemIds(route, families, [], seed);
        const repeat = selectFRA24RecoveryItemIds(route, families, [], seed);
        const expectedCount = route === "repair_then_two_item_check" ? 2 : 3;
        if (selected.length !== expectedCount) {
          errors.push(`Recovery selector seed ${seed} returned ${selected.length}; expected ${expectedCount}.`);
          break;
        }
        if (JSON.stringify(selected) !== JSON.stringify(repeat)) {
          errors.push(`Recovery selector seed ${seed} is not deterministic.`);
          break;
        }
        if (new Set(selected).size !== selected.length) {
          errors.push(`Recovery selector seed ${seed} returned duplicate item IDs.`);
          break;
        }
        if (selected.some((id) => !recoveryIds.has(id))) {
          errors.push(`Recovery selector seed ${seed} returned an unknown item ID.`);
          break;
        }
        const seenProbe = selected[0] ? [selected[0]] : [];
        const afterSeen = selectFRA24RecoveryItemIds(route, families, seenProbe, seed);
        if (afterSeen.some((id) => seenProbe.includes(id))) {
          errors.push(`Recovery selector seed ${seed} reused a seen item.`);
          break;
        }
        if (route === "repair_then_three_item_final") {
          const intents = selected.map((id) => FRA24_RECOVERY_ITEMS[id].assessmentIntent);
          const direct = intents.some((intent) => intent.startsWith("DIRECT") || intent.startsWith("IMPROPER"));
          const transfer = intents.some(
            (intent) => intent.startsWith("VIS") || intent.startsWith("CONTEXT") || intent.startsWith("METHOD") || intent.startsWith("FORM")
          );
          if (!direct || !transfer) {
            errors.push(`Recovery selector seed ${seed} failed direct-plus-transfer coverage.`);
            break;
          }
        }
      }
      if (errors.some((error) => error.startsWith("Recovery selector seed"))) break;
    }
    return errors;
  }
  function assertFRA24CanonicalSpec() {
    const errors = validateFRA24CanonicalSpec();
    if (errors.length > 0) {
      throw new Error(`FRA24 canonical validation failed:
${errors.map((error) => `- ${error}`).join("\n")}`);
    }
  }
  function runFRA24StaticAssertions() {
    const failures = [];
    const expect = (condition, message) => {
      if (!condition) failures.push(message);
    };
    expect(
      shouldSkipFRA24F1([
        { questionId: "G1", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "G2", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false }
      ]),
      "Clean guided evidence should skip F1."
    );
    expect(
      !shouldSkipFRA24F1([
        { questionId: "G1", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "G2", firstAttemptCorrect: false, attempts: 2, hintOpenedBeforeSubmit: false, errorFamilyHypothesis: "cross" }
      ]),
      "A guided miss should retain F1."
    );
    expect(
      requiredFRA24ConfirmationIds([
        { questionId: "I1", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: true }
      ]).includes("C-CONTEXT"),
      "I1 hint use should require C-CONTEXT."
    );
    expect(
      evaluateFRA24Final([
        { questionId: "M1", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M2", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M3", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M4", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M5", firstAttemptCorrect: false, attempts: 1, hintOpenedBeforeSubmit: false, errorFamilyHypothesis: "form" }
      ]).route === "finish_candidate",
      "4/5 with direct and breadth evidence should finish when no blocker repeats."
    );
    expect(
      evaluateFRA24Final([
        { questionId: "M1", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M2", firstAttemptCorrect: false, attempts: 1, hintOpenedBeforeSubmit: false, errorFamilyHypothesis: "keep_denominator" },
        { questionId: "M3", firstAttemptCorrect: false, attempts: 1, hintOpenedBeforeSubmit: false, errorFamilyHypothesis: "keep_denominator" },
        { questionId: "M4", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M5", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false }
      ]).route === "repair_then_two_item_check",
      "3/5 with a repeated blocker should route to repair and a two-item check."
    );
    expect(
      evaluateFRA24Final([
        { questionId: "M1", firstAttemptCorrect: true, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M2", firstAttemptCorrect: false, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M3", firstAttemptCorrect: false, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M4", firstAttemptCorrect: false, attempts: 1, hintOpenedBeforeSubmit: false },
        { questionId: "M5", firstAttemptCorrect: false, attempts: 1, hintOpenedBeforeSubmit: false }
      ]).route === "repair_then_three_item_final",
      "0-2/5 should route to repair and a three-item final."
    );
    const m5Unsimplified = markFRA24Response("M5", { kind: "fraction", numerator: 15, denominator: 30 });
    expect(!m5Unsimplified.correct && m5Unsimplified.mathematicallyEquivalent && m5Unsimplified.errorFamily === "form", "M5 15/30 must be classified as a form issue, not a multiplication misconception.");
    const m2Equivalent = markFRA24Response("M2", { kind: "fraction", numerator: 1, denominator: 2 });
    expect(m2Equivalent.correct, "M2 must accept the exact equivalent 1/2 because simplest form is not required.");
    const cross = markFRA24Response("M1", { kind: "fraction", numerator: 15, denominator: 28 });
    expect(!cross.correct && cross.errorFamily === "cross", "M1 exact crosswise signature should classify as cross.");
    expect(selectFRA24RecoveryItemIds("repair_then_two_item_check", ["form"], []).length === 2, "Two-item recovery selector must return two items.");
    expect(selectFRA24RecoveryItemIds("repair_then_three_item_final", ["keep_denominator"], []).length === 3, "Three-item recovery selector must return three items.");
    return failures;
  }
  return __toCommonJS(FRA24_CANONICAL_SPEC_exports);
})();
window.RevilyFra24ApprovedSpec = RevilyFra24ApprovedSpec;
