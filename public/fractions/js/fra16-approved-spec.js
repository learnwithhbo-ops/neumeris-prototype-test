var RevilyFra16Approved = (() => {
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
  // Local authoring source reference omitted from deployment snapshot.
  var FRA16_CANONICAL_SPEC_exports = {};
  __export(FRA16_CANONICAL_SPEC_exports, {
    FRA16: () => FRA16,
    FRA16_RUNTIME_COPY: () => FRA16_RUNTIME_COPY,
    assertFRA16CanonicalSpec: () => assertFRA16CanonicalSpec,
    compareFractions: () => compareFractions,
    equivalentNumerator: () => equivalentNumerator,
    fractionKey: () => fractionKey,
    gcd: () => gcd,
    getAllQuestionLikeSpecs: () => getAllQuestionLikeSpecs,
    getHookResponseSequence: () => getHookResponseSequence,
    getOutcomeUtteranceIds: () => getOutcomeUtteranceIds,
    getQuestionById: () => getQuestionById,
    lcm: () => lcm,
    lcmMany: () => lcmMany,
    orderFractionIds: () => orderFractionIds,
    relationToHalf: () => relationToHalf,
    routeAfterGuided: () => routeAfterGuided,
    routeFinalCheck: () => routeFinalCheck,
    validateFRA16CanonicalSpec: () => validateFRA16CanonicalSpec
  });
  var FRA16_RUNTIME_COPY = {
    "HOOK.PRE.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "prompt",
      communicationGoal: "establish_blue_and_orange_progress_fractions",
      text: "Blue has finished five of eight stages. Orange has finished two of three.",
      captionSource: "same_as_audio"
    },
    "HOOK.PRE.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "prompt",
      communicationGoal: "surface_conflict_between_completed_counts_and_stage_sizes",
      text: "Blue has cleared more stages, but Orange's stages are larger.",
      captionSource: "same_as_audio"
    },
    "HOOK.PRE.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "prompt",
      communicationGoal: "state_that_raw_numerator_and_denominator_cues_conflict",
      text: "The top numbers and the bottom numbers point in different directions.",
      captionSource: "same_as_audio"
    },
    "HOOK.PRE.4": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "prompt",
      communicationGoal: "invite_unscored_prediction_before_fair_comparison",
      text: "Which progress is actually greater? Make a prediction, then we'll make the comparison fair.",
      captionSource: "same_as_audio"
    },
    "HOOK.FEEDBACK.BLUE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "acknowledge_blue_count_reasoning_without_calling_it_correct",
      text: "Blue has more completed stages, but each stage is smaller. Let's compare equal-sized parts.",
      captionSource: "same_as_audio"
    },
    "HOOK.FEEDBACK.ORANGE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_orange_prediction_then_require_exact_proof",
      text: "Orange is the stronger prediction. Now let's prove it with equal-sized parts.",
      captionSource: "same_as_audio"
    },
    "HOOK.FEEDBACK.SAME": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_equality_prediction_without_skipping_the_method",
      text: "They look close, but the two progress bars do not finish at the same value. Let's make the comparison fair.",
      captionSource: "same_as_audio"
    },
    "HOOK.FEEDBACK.NOT_SURE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "transition",
      communicationGoal: "validate_uncertainty_when_part_sizes_differ",
      text: "Not sure is sensible when the pieces differ. Let's create a fair comparison.",
      captionSource: "same_as_audio"
    },
    "T1.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "reject_numerator_only_comparison",
      text: "Five eighths and two thirds cannot be compared just by looking at five and two.",
      captionSource: "same_as_audio"
    },
    "T1.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "establish_same_whole_and_same_sized_parts_requirement",
      text: "The denominators tell us the pieces are different sizes. A fair comparison needs the same whole and the same-sized parts.",
      captionSource: "same_as_audio"
    },
    "T2.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "introduce_twenty_four_as_common_denominator",
      text: "Both eight and three fit exactly into twenty-four. Twenty-four is a common denominator.",
      captionSource: "same_as_audio"
    },
    "T2.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "rewrite_five_eighths_as_fifteen_twenty_fourths",
      text: "Each eighth splits into three twenty-fourths, so five eighths becomes fifteen twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "T2.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "rewrite_two_thirds_as_sixteen_twenty_fourths",
      text: "Each third splits into eight twenty-fourths, so two thirds becomes sixteen twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "T2.4": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "generalise",
      communicationGoal: "compare_matched_parts_and_name_result",
      text: "Now the pieces match. Sixteen twenty-fourths is greater than fifteen twenty-fourths, so two thirds is greater than five eighths.",
      captionSource: "same_as_audio"
    },
    "T3.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "introduce_exact_benchmark_route",
      text: "Sometimes a benchmark settles the comparison faster.",
      captionSource: "same_as_audio"
    },
    "T3.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "place_four_ninths_below_half_and_five_eighths_above_half",
      text: "Four ninths is below one half. Five eighths is above one half.",
      captionSource: "same_as_audio"
    },
    "T3.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "generalise",
      communicationGoal: "use_opposite_sides_of_half_to_settle_order",
      text: "One fraction is below half and the other is above, so five eighths is greater. No common denominator is needed.",
      captionSource: "same_as_audio"
    },
    "T4.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "extend_fair_comparison_to_three_fraction_ordering",
      text: "Ordering three fractions uses the same idea. Put them into one common unit, then sort those numerators.",
      captionSource: "same_as_audio"
    },
    "T4.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "select_twenty_fourths_for_three_denominators",
      text: "Twelfths, eighths and quarters all fit into twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "T4.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "order_seven_twelfths_five_eighths_three_quarters",
      text: "Fourteen, fifteen, eighteen. So least to greatest: seven twelfths, five eighths, three quarters.",
      captionSource: "same_as_audio"
    },
    "T4.GUARD.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "make_learner_read_order_direction",
      text: "Read the direction before you move the cards.",
      captionSource: "same_as_audio"
    },
    "T4.GUARD.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "generalise",
      communicationGoal: "distinguish_ascending_and_descending_sequences",
      text: "Least to greatest means smaller values go left. Greatest to least reverses the same values.",
      captionSource: "same_as_audio"
    },
    "T5.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "extend_method_to_simple_fractions_above_one",
      text: "The method does not stop at one. Seven sixths and nine eighths are both more than a whole.",
      captionSource: "same_as_audio"
    },
    "T5.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "explain",
      communicationGoal: "rewrite_above_one_pair_in_twenty_fourths",
      text: "In twenty-fourths they are twenty-eight twenty-fourths and twenty-seven twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "T5.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "generalise",
      communicationGoal: "name_one_twenty_fourth_difference",
      text: "Seven sixths is greater by one twenty-fourth.",
      captionSource: "same_as_audio"
    },
    "HANDOFF.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "transition",
      communicationGoal: "summarise_two_exact_routes",
      text: "You have two exact routes now: a useful benchmark when it settles the comparison, or equivalent fractions when the parts need matching.",
      captionSource: "same_as_audio"
    },
    "HANDOFF.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "transition",
      communicationGoal: "hand_control_to_learner_after_two_guided_items",
      text: "I'll stay with you for two. Then you choose the route yourself.",
      captionSource: "same_as_audio"
    },
    "G1.PRE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "supply_common_denominator_without_supplying_equivalent_numerators",
      text: "I will give you the common denominator this time: twelve. Keep each value fixed.",
      captionSource: "same_as_audio"
    },
    "G1.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_correct_equivalents_and_symbol",
      text: "Exactly. Nine twelfths is less than ten twelfths, so three quarters is less than five sixths.",
      captionSource: "same_as_audio"
    },
    "G1.INCORRECT.ONE_FIELD": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "correct_one_field_only_scaling",
      text: "You changed the part size but not the number of parts. Use the same scale factor on top and bottom.",
      captionSource: "same_as_audio"
    },
    "G1.INCORRECT.SYMBOL": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "correct_symbol_after_valid_equivalent_forms",
      text: "Your fractions now use the same-sized pieces. Compare nine with ten, then make the symbol face the larger value.",
      captionSource: "same_as_audio"
    },
    "G1.INCORRECT.FACTOR": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "correct_inconsistent_multiplier",
      text: "Check the multiplier on each number. Each new fraction must keep its original value.",
      captionSource: "same_as_audio"
    },
    "G1.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "neutral_guided_retry_without_claiming_hidden_reasoning",
      text: "One part of the comparison does not match. Check both equivalent fractions, then check the symbol.",
      captionSource: "same_as_audio"
    },
    "G2.PRE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "ask_for_half_benchmark_classification",
      text: "Use one half as the checkpoint. Decide where each fraction sits.",
      captionSource: "same_as_audio"
    },
    "G2.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_opposite_sides_of_half_and_symbol",
      text: "Yes. Three sevenths is below one half and five ninths is above, so three sevenths is less.",
      captionSource: "same_as_audio"
    },
    "G2.INCORRECT.CLASSIFICATION": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "recheck_each_fraction_against_half",
      text: "The fractions sit on opposite sides of one half. Check each one before choosing the symbol.",
      captionSource: "same_as_audio"
    },
    "G2.INCORRECT.SYMBOL": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "correct_symbol_after_valid_half_classification",
      text: "Your half checks are right. The open side must face five ninths, the larger value.",
      captionSource: "same_as_audio"
    },
    "G2.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "neutral_benchmark_retry",
      text: "Check twice each numerator against its denominator, then compare the two sides of one half.",
      captionSource: "same_as_audio"
    },
    "F1.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fourteen_and_fifteen_thirty_fifths",
      text: "Correct. Fourteen thirty-fifths is less than fifteen thirty-fifths.",
      captionSource: "same_as_audio"
    },
    "F1.INCORRECT.EQUIV": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "restore_matching_scale_factors_in_faded_item",
      text: "Use the denominator multiplier on the numerator as well, so each fraction keeps its value.",
      captionSource: "same_as_audio"
    },
    "F1.INCORRECT.SYMBOL": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "correct_symbol_after_fourteen_and_fifteen",
      text: "Your equivalent forms are correct. Compare fourteen with fifteen, then choose the matching symbol.",
      captionSource: "same_as_audio"
    },
    "F1.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "neutral_faded_pair_retry",
      text: "That comparison is not complete yet. Check both thirty-fifths and the direction of the symbol.",
      captionSource: "same_as_audio"
    },
    "F2.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_benchmark_sort_around_half",
      text: "That order is right: three tenths, one half, then seven twelfths.",
      captionSource: "same_as_audio"
    },
    "F2.INCORRECT.REVERSED": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "correct_reversed_sort_direction",
      text: "Those values are in greatest-to-least order. The question asks for least to greatest.",
      captionSource: "same_as_audio"
    },
    "F2.INCORRECT.BENCHMARK": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "restore_half_as_middle_anchor",
      text: "Use one half as the middle anchor. One fraction belongs below it and one belongs above it.",
      captionSource: "same_as_audio"
    },
    "F2.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "neutral_sort_retry",
      text: "That sequence is not least to greatest. Place each card relative to one half, then check the order.",
      captionSource: "same_as_audio"
    },
    "INDEPENDENT.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "transition",
      communicationGoal: "hand_method_choice_to_learner",
      text: "Now you choose the exact route. You can use a benchmark, shared structure or equivalent fractions.",
      captionSource: "same_as_audio"
    },
    "INDEPENDENT.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "frame_optional_hint_as_nudge_not_answer",
      text: "Try it without help first. The hint is there if you need a nudge, not the answer.",
      captionSource: "same_as_audio"
    },
    "I1.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fourteen_eighteenths_less_than_fifteen_eighteenths",
      text: "Correct. Fourteen eighteenths is less than fifteen eighteenths.",
      captionSource: "same_as_audio"
    },
    "I1.INCORRECT.GREATER": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_greater_selection_without_overclassifying",
      text: "That comparison is not correct. Put both fractions into equal-sized parts before choosing greater or less.",
      captionSource: "same_as_audio"
    },
    "I1.INCORRECT.EQUAL": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_false_equality_and_request_exact_check",
      text: "These fractions do not have the same value. Use a common denominator to separate them.",
      captionSource: "same_as_audio"
    },
    "I1.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "neutral_independent_pair_retry",
      text: "That symbol does not match the two values. Show a fair comparison, then try again.",
      captionSource: "same_as_audio"
    },
    "I2.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_independent_three_fraction_order",
      text: "Yes. Seven tenths is least, then four fifths, then five sixths.",
      captionSource: "same_as_audio"
    },
    "I2.INCORRECT.REVERSED": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "correct_reverse_of_valid_order",
      text: "You have the values in reverse. Read the direction: least to greatest.",
      captionSource: "same_as_audio"
    },
    "I2.INCORRECT.NUM_ORDER": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_observable_numerator_sorted_sequence",
      text: "That sequence follows the top numbers, not the fraction sizes. Compare equal-sized parts.",
      captionSource: "same_as_audio"
    },
    "I2.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "neutral_independent_sort_retry",
      text: "Those cards are not in least-to-greatest order. Choose one exact method and compare all three values.",
      captionSource: "same_as_audio"
    },
    "C-PAIR.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fresh_no_hint_pair_after_supported_success",
      text: "Yes. Five eighths is less than seven tenths.",
      captionSource: "same_as_audio"
    },
    "C-PAIR.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "request_fair_comparison_on_confirmation_pair",
      text: "That fresh comparison is not correct. Use equal-sized parts and check both values again.",
      captionSource: "same_as_audio"
    },
    "C-SORT.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fresh_no_hint_common_denominator_sort",
      text: "That sequence is correct: three fifths, seven tenths, five sixths.",
      captionSource: "same_as_audio"
    },
    "C-SORT.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "recheck_fresh_sort_with_common_unit",
      text: "That order is not secure yet. Put all three fractions into one common unit.",
      captionSource: "same_as_audio"
    },
    "C-BENCH.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fresh_no_hint_benchmark_sort",
      text: "Correct. Five twelfths is below one half, and four sevenths is above it.",
      captionSource: "same_as_audio"
    },
    "C-BENCH.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "recheck_each_side_of_half_on_confirmation_sort",
      text: "Check which side of one half contains each outside fraction, then rebuild the sequence.",
      captionSource: "same_as_audio"
    },
    "FINAL.INTRO": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "transition",
      communicationGoal: "introduce_five_unsupported_final_items",
      text: "These last five are yours. No hints this time. Do the question first, then I'll show you the working so you can check your thinking.",
      captionSource: "same_as_audio"
    },
    "M1.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_direct_pair_then_introduce_fifty_sixths_check",
      text: "That's correct. Now check the comparison in fifty-sixths.",
      captionSource: "same_as_audio"
    },
    "M1.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "introduce_fifty_sixths_check_after_wrong_symbol",
      text: "That symbol is not correct. The worked check will put both fractions into fifty-sixths.",
      captionSource: "same_as_audio"
    },
    "M1.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_four_sevenths_in_fifty_sixths",
      text: "Four sevenths is thirty-two fifty-sixths.",
      captionSource: "same_as_audio"
    },
    "M1.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_five_eighths_in_fifty_sixths",
      text: "Five eighths is thirty-five fifty-sixths.",
      captionSource: "same_as_audio"
    },
    "M1.WORK.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "compare_thirty_two_and_thirty_five",
      text: "Thirty-two is less than thirty-five, so four sevenths is less than five eighths.",
      captionSource: "same_as_audio"
    },
    "M2.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_equal_symbol_then_show_shared_value",
      text: "The equal sign is right. Now check the shared value.",
      captionSource: "same_as_audio"
    },
    "M2.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "introduce_shared_value_after_non_equal_symbol",
      text: "That symbol does not match the bars. The worked check will show the value both fractions share.",
      captionSource: "same_as_audio"
    },
    "M2.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_six_eighths_as_three_quarters",
      text: "Six eighths is three quarters.",
      captionSource: "same_as_audio"
    },
    "M2.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_nine_twelfths_as_three_quarters",
      text: "Nine twelfths is also three quarters.",
      captionSource: "same_as_audio"
    },
    "M2.WORK.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "conclude_equality_from_shared_value",
      text: "Both fractions are equal.",
      captionSource: "same_as_audio"
    },
    "M3.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_ascending_order_then_introduce_sixtieths",
      text: "That is the correct least-to-greatest order. Now check the common unit.",
      captionSource: "same_as_audio"
    },
    "M3.INCORRECT.REVERSED": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "identify_reversed_sequence_before_worked_check",
      text: "That sequence is greatest to least, not least to greatest. Now compare the values in sixtieths.",
      captionSource: "same_as_audio"
    },
    "M3.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "introduce_three_value_sixtieths_check_after_wrong_order",
      text: "That order is not correct. The worked check will rewrite all three fractions in sixtieths.",
      captionSource: "same_as_audio"
    },
    "M3.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_two_fifths_in_sixtieths",
      text: "Two fifths is twenty-four sixtieths.",
      captionSource: "same_as_audio"
    },
    "M3.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_seven_twelfths_in_sixtieths",
      text: "Seven twelfths is thirty-five sixtieths.",
      captionSource: "same_as_audio"
    },
    "M3.WORK.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_three_quarters_in_sixtieths",
      text: "Three quarters is forty-five sixtieths.",
      captionSource: "same_as_audio"
    },
    "M3.WORK.4": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "state_correct_ascending_sequence",
      text: "So the order is two fifths, seven twelfths, three quarters.",
      captionSource: "same_as_audio"
    },
    "M4.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_valid_half_benchmark_reasoning",
      text: "That reasoning is exact. Now check the two sides of one half.",
      captionSource: "same_as_audio"
    },
    "M4.INCORRECT.DEN": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_denominator_only_reasoning",
      text: "The denominator alone does not decide the size. Now check each fraction against one half.",
      captionSource: "same_as_audio"
    },
    "M4.INCORRECT.ADD": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_additive_non_comparison_rule",
      text: "Adding the numerator and denominator does not compare fractions. Use one half instead.",
      captionSource: "same_as_audio"
    },
    "M4.INCORRECT.CANNOT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_claim_that_unlike_fractions_cannot_be_compared",
      text: "Different denominators can be compared exactly. One half settles this pair.",
      captionSource: "same_as_audio"
    },
    "M4.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "introduce_half_check_after_unclassified_wrong_choice",
      text: "That explanation is not valid. The worked check will compare both fractions with one half.",
      captionSource: "same_as_audio"
    },
    "M4.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "place_four_ninths_below_half",
      text: "Four ninths is below one half.",
      captionSource: "same_as_audio"
    },
    "M4.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "place_five_eighths_above_half_and_conclude",
      text: "Five eighths is above one half, so it is greater than four ninths.",
      captionSource: "same_as_audio"
    },
    "M5.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_correct_above_one_error_analysis",
      text: "That correction is right. Now check both fractions in twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "M5.INCORRECT.DEN": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_denominator_only_above_one_claim",
      text: "The denominators do not decide the order. Match the parts in twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "M5.INCORRECT.EQUAL": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_equal_distance_above_one_pattern",
      text: "Being one more than the denominator does not make the values equal. Compare equal-sized parts.",
      captionSource: "same_as_audio"
    },
    "M5.INCORRECT.CANNOT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "reject_claim_that_fractions_above_one_cannot_be_compared",
      text: "Fractions above one can still be compared exactly. Keep them as fractions and match the parts.",
      captionSource: "same_as_audio"
    },
    "M5.INCORRECT.DEFAULT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "introduce_twenty_fourths_check_after_other_wrong_choice",
      text: "That correction is not valid. The worked check will use twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "M5.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_seven_sixths_as_twenty_eight_twenty_fourths",
      text: "Seven sixths is twenty-eight twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "M5.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_nine_eighths_as_twenty_seven_twenty_fourths",
      text: "Nine eighths is twenty-seven twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "M5.WORK.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "compare_twenty_eight_and_twenty_seven",
      text: "Twenty-eight is greater than twenty-seven, so seven sixths is greater than nine eighths.",
      captionSource: "same_as_audio"
    },
    "R-NUM.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "reject_raw_numerator_comparison_when_part_sizes_differ",
      text: "Seven is larger than three, but the pieces are not the same size.",
      captionSource: "same_as_audio"
    },
    "R-NUM.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "rewrite_seven_twelfths_and_three_fifths_in_sixtieths",
      text: "Rewrite both fractions in sixtieths. Seven twelfths is thirty-five sixtieths, and three fifths is thirty-six sixtieths.",
      captionSource: "same_as_audio"
    },
    "R-NUM.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "restore_fair_numerator_comparison",
      text: "Now the numerator comparison is fair.",
      captionSource: "same_as_audio"
    },
    "RN-S.PRE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "request_supported_numerator_repair_comparison",
      text: "Complete both fractions in forty-fifths, then choose the symbol.",
      captionSource: "same_as_audio"
    },
    "RN-S.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_supported_numerator_repair",
      text: "Yes. Thirty-six forty-fifths is greater than thirty-five forty-fifths.",
      captionSource: "same_as_audio"
    },
    "RN-S.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_supported_numerator_repair",
      text: "Keep each original value fixed, then compare the two forty-fifth numerators.",
      captionSource: "same_as_audio"
    },
    "RN-C.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fresh_numerator_recheck",
      text: "That comparison is secure. Twenty twenty-eighths is less than twenty-one twenty-eighths.",
      captionSource: "same_as_audio"
    },
    "RN-C.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_numerator_recheck",
      text: "The raw numerators still do not use the same-sized parts. Compare the fractions in twenty-eighths.",
      captionSource: "same_as_audio"
    },
    "R-DEN.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "restate_denominator_as_equal_piece_count",
      text: "The denominator tells how many equal pieces make the whole.",
      captionSource: "same_as_audio"
    },
    "R-DEN.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "explain_inverse_relation_between_piece_count_and_piece_size",
      text: "More pieces in the whole means each piece is smaller. It does not automatically mean more of the whole.",
      captionSource: "same_as_audio"
    },
    "R-DEN.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "redirect_unlike_structure_to_exact_route",
      text: "When both numbers differ, use a benchmark or make the parts match.",
      captionSource: "same_as_audio"
    },
    "RD-S.PRE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "request_supported_denominator_repair_with_half",
      text: "Use one half to place each fraction, then choose the symbol.",
      captionSource: "same_as_audio"
    },
    "RD-S.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_supported_denominator_repair",
      text: "Correct. Three eighths is below half, while four sevenths is above half.",
      captionSource: "same_as_audio"
    },
    "RD-S.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_supported_denominator_repair",
      text: "Ignore which denominator is larger. Check each fraction against one half.",
      captionSource: "same_as_audio"
    },
    "RD-C.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fresh_denominator_recheck",
      text: "That is right. Fifteen thirty-sixths is less than sixteen thirty-sixths.",
      captionSource: "same_as_audio"
    },
    "RD-C.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_denominator_recheck",
      text: "The denominator alone cannot settle this pair. Compare them in thirty-sixths.",
      captionSource: "same_as_audio"
    },
    "R-EQUIV.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "state_value_preservation_requirement_for_common_denominators",
      text: "A common denominator only helps if each new fraction keeps its original value.",
      captionSource: "same_as_audio"
    },
    "R-EQUIV.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "require_same_factor_on_numerator_and_denominator",
      text: "Whatever factor changes the denominator must also change the numerator.",
      captionSource: "same_as_audio"
    },
    "R-EQUIV.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "sequence_equivalence_before_numerator_comparison",
      text: "Then, and only then, compare the new numerators.",
      captionSource: "same_as_audio"
    },
    "R-EQUIV.EQUALITY": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "connect_consistent_equivalence_to_unlike_denominator_equality",
      text: "Different-looking fractions can still be equal when both are valid forms of the same value.",
      captionSource: "same_as_audio"
    },
    "RE-S.PRE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "request_supported_equivalence_repair",
      text: "Rewrite both fractions in twentieths. Use the same factor on each top and bottom.",
      captionSource: "same_as_audio"
    },
    "RE-S.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_supported_equivalence_repair",
      text: "Good. Eight twentieths is less than fifteen twentieths, and both rewrites preserve the original values.",
      captionSource: "same_as_audio"
    },
    "RE-S.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_supported_equivalence_repair",
      text: "Check the multiplier on each fraction. The top and bottom of one fraction must use the same factor.",
      captionSource: "same_as_audio"
    },
    "RE-C.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fresh_equivalence_recheck",
      text: "Yes. Twenty-eight fortieths is greater than twenty-five fortieths.",
      captionSource: "same_as_audio"
    },
    "RE-C.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_equivalence_recheck",
      text: "Make both fractions into fortieths without changing either value.",
      captionSource: "same_as_audio"
    },
    "R-SYMBOL.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "separate_correct_size_decision_from_written_direction",
      text: "You found the larger value. Now make the symbol match it.",
      captionSource: "same_as_audio"
    },
    "R-SYMBOL.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "explain_comparison_symbol_orientation",
      text: "The open side faces the larger fraction, and the point faces the smaller one.",
      captionSource: "same_as_audio"
    },
    "R-SYMBOL.3": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "repair",
      communicationGoal: "connect_order_direction_to_card_position",
      text: "For least to greatest, smaller values go left. Greatest to least reverses the sequence.",
      captionSource: "same_as_audio"
    },
    "RS-S.PRE": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "instruction",
      communicationGoal: "request_supported_symbol_repair",
      text: "The equivalent forms are shown. Choose the symbol that matches their sizes.",
      captionSource: "same_as_audio"
    },
    "RS-S.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_supported_symbol_repair",
      text: "Right. Sixteen twentieths is greater than fifteen twentieths, so the open side faces four fifths.",
      captionSource: "same_as_audio"
    },
    "RS-S.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_supported_symbol_repair",
      text: "Your number comparison and the symbol disagree. Point the symbol toward the smaller value.",
      captionSource: "same_as_audio"
    },
    "RS-C.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "confirm_fresh_symbol_and_order_recheck",
      text: "That sequence runs correctly from least to greatest.",
      captionSource: "same_as_audio"
    },
    "RS-C.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_symbol_and_order_recheck",
      text: "Check the requested direction, then place the smallest fraction on the left.",
      captionSource: "same_as_audio"
    },
    "RF1.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_fresh_recovery_pair_one",
      text: "That comparison is correct. The thirty-sixth-sized parts confirm it.",
      captionSource: "same_as_audio"
    },
    "RF1.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_recovery_pair_one",
      text: "That symbol does not match the values. Rewrite both fractions in thirty-sixths.",
      captionSource: "same_as_audio"
    },
    "RF1.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_five_ninths_and_seven_twelfths_in_thirty_sixths",
      text: "Five ninths is twenty thirty-sixths, and seven twelfths is twenty-one thirty-sixths.",
      captionSource: "same_as_audio"
    },
    "RF1.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "conclude_recovery_pair_one",
      text: "Twenty is less than twenty-one, so five ninths is less than seven twelfths.",
      captionSource: "same_as_audio"
    },
    "RF2.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_fresh_recovery_pair_two",
      text: "That is right. The equivalent numerators confirm the direction.",
      captionSource: "same_as_audio"
    },
    "RF2.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_recovery_pair_two",
      text: "Recheck the pair with equal-sized eighteenth parts.",
      captionSource: "same_as_audio"
    },
    "RF2.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_eight_ninths_and_five_sixths_in_eighteenths",
      text: "Eight ninths is sixteen eighteenths, and five sixths is fifteen eighteenths.",
      captionSource: "same_as_audio"
    },
    "RF2.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "conclude_recovery_pair_two",
      text: "Sixteen is greater than fifteen, so eight ninths is greater than five sixths.",
      captionSource: "same_as_audio"
    },
    "RF3.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_fresh_recovery_sort",
      text: "That order is correct. The three values rise from left to right.",
      captionSource: "same_as_audio"
    },
    "RF3.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_recovery_sort",
      text: "The sequence is not least to greatest. Use twenty-fourths to check every card.",
      captionSource: "same_as_audio"
    },
    "RF3.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "rewrite_recovery_sort_in_twenty_fourths",
      text: "Three eighths is nine twenty-fourths, seven twelfths is fourteen twenty-fourths, and five sixths is twenty twenty-fourths.",
      captionSource: "same_as_audio"
    },
    "RF3.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "conclude_recovery_sort",
      text: "Nine, fourteen, twenty gives three eighths, seven twelfths, five sixths.",
      captionSource: "same_as_audio"
    },
    "RF-EQ.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_fresh_recovery_equality",
      text: "Correct. Both fractions are equal to two thirds.",
      captionSource: "same_as_audio"
    },
    "RF-EQ.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_recovery_equality",
      text: "Different denominators do not rule out equality. Simplify or scale one fraction to compare the values.",
      captionSource: "same_as_audio"
    },
    "RF-EQ.WORK": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "show_ten_fifteenths_equals_two_thirds",
      text: "Ten fifteenths simplifies to two thirds, so the correct symbol is equals.",
      captionSource: "same_as_audio"
    },
    "RF-B.CORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "acknowledge_correct",
      communicationGoal: "acknowledge_fresh_recovery_benchmark",
      text: "Yes. One half separates the two values exactly.",
      captionSource: "same_as_audio"
    },
    "RF-B.INCORRECT": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "redirect_incorrect",
      communicationGoal: "redirect_fresh_recovery_benchmark",
      text: "Use one half before choosing the symbol. The fractions lie on opposite sides.",
      captionSource: "same_as_audio"
    },
    "RF-B.WORK.1": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "place_four_ninths_and_seven_twelfths_around_half",
      text: "Four ninths is below one half, while seven twelfths is above one half.",
      captionSource: "same_as_audio"
    },
    "RF-B.WORK.2": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "worked_check",
      communicationGoal: "conclude_fresh_recovery_benchmark",
      text: "So four ninths is less than seven twelfths.",
      captionSource: "same_as_audio"
    },
    "COMPLETION": {
      audience: "learner",
      spokenBy: "Ryan",
      role: "completion",
      communicationGoal: "summarise_fra16_current_session_completion",
      text: "Nice work. You can now compare and order fractions even when the denominators differ, using equivalent fractions or a useful benchmark. That is FRA-16 done.",
      captionSource: "same_as_audio"
    }
  };
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
    if (a === 0 || b === 0) return 0;
    return Math.abs(a / gcd(a, b) * b);
  }
  function lcmMany(values) {
    return values.reduce((current, value) => lcm(current, value), 1);
  }
  function compareFractions(left, right) {
    const leftProduct = left.numerator * right.denominator;
    const rightProduct = right.numerator * left.denominator;
    if (leftProduct < rightProduct) return "<";
    if (leftProduct > rightProduct) return ">";
    return "=";
  }
  function relationToHalf(value) {
    const doubledNumerator = value.numerator * 2;
    if (doubledNumerator < value.denominator) return "below_half";
    if (doubledNumerator > value.denominator) return "above_half";
    return "exactly_half";
  }
  function equivalentNumerator(value, commonDenominator) {
    if (commonDenominator % value.denominator !== 0) {
      throw new Error(
        `${commonDenominator} is not a valid common denominator for ${value.denominator}.`
      );
    }
    return value.numerator * (commonDenominator / value.denominator);
  }
  function fractionKey(value) {
    return `${value.numerator}/${value.denominator}`;
  }
  function orderFractionIds(fractions, direction) {
    const ordered = [...fractions].sort((a, b) => {
      const left = a.value.numerator * b.value.denominator;
      const right = b.value.numerator * a.value.denominator;
      return left - right;
    });
    if (direction === "greatest_to_least") ordered.reverse();
    return ordered.map((item) => item.id);
  }
  var FRA16 = {
    id: "FRA16",
    displayId: "FRA-16",
    title: "Compare and Order Fractions with Different Denominators",
    status: "OWNER_APPROVED_HANDOFF_V1_IMPLEMENTATION_CANDIDATE",
    handoffVersion: "v1",
    contentVersion: "fra16-runtime-v1",
    sourceOfTruth: {
      runtimeCopyQuestionDataRoutingAndOutcomeLogic: "FRA16_CANONICAL_SPEC.ts",
      visualGeometryAndOwnerFacingPedagogy: "Revily_FRA16_Storyboard_v1.pdf",
      engineeringIntegrationAndAcceptance: "FRA16_CODEX_IMPLEMENTATION_PROMPT.md",
      engineeringReference: "Existing canonical Revily FRA01-FRA15 lesson engine and compatible fraction-bar, comparison, ordering, TTS, caption, answer-lock, evidence, hint and persistence primitives.",
      criticalPrecedenceRule: "The PDF is the approved visual and pedagogical reference. This TypeScript file is the runtime-copy, question-data, outcome-branching and routing authority. If wording differs, Ryan speech and captions must use FRA16_RUNTIME_COPY only. Never transcribe owner notes, stage directions or QA prose into learner runtime copy."
    },
    scope: {
      objective: "Compare and order positive fractions with different denominators using equivalence, benchmarks or another valid exact method.",
      studentFacingIdea: "Make the comparison fair.",
      prerequisites: [
        "FRA04: compare fractions with a shared structure.",
        "FRA05: locate fractions on a number line.",
        "FRA07: recognise equivalent fractions.",
        "FRA08: generate equivalent fractions."
      ],
      supportingButNotUniversallyBlocking: [
        "P-N05: efficient common denominators."
      ],
      teaches: [
        "compare two positive fractions with different denominators exactly",
        "choose an efficient exact route: shared structure, a useful benchmark or a common denominator",
        "use 0, one half and 1 as exact benchmarks only when they settle the comparison",
        "rewrite fractions with a valid common denominator while preserving each value",
        "write less than, greater than or equals symbols consistently with the size decision",
        "order three positive fractions least to greatest or greatest to least",
        "recognise equality across different written denominators",
        "compare proper fractions and simple fractions above one without converting to decimals or mixed numbers",
        "reject numerator-only, denominator-only and inconsistent-equivalence reasoning"
      ],
      deliberatelyLaterOrExcluded: [
        "FRA04 remains the first teaching of same-denominator and same-numerator comparison.",
        "FRA05 remains the first teaching of fraction number lines.",
        "FRA07 and FRA08 remain the standalone equivalence lessons.",
        "Decimal conversion is not the required method.",
        "No fraction addition, subtraction, multiplication or division.",
        "No negative-fraction lists or mixed negative values.",
        "No mixed-number conversion or simplification as the lesson target.",
        "No memorised cross-product shortcut is introduced as the teaching method.",
        "No arithmetic-heavy common-denominator sets.",
        "No global Diagnostic layer.",
        "No Retrieval or spaced-review scheduling."
      ],
      authoredEnvelope: {
        positiveFractionsOnly: true,
        startingDenominatorsNormally: "2-12",
        laterDenominatorMaximum: 20,
        lcmMaximum: 60,
        arithmeticMustRemainSecondary: true,
        simpleFractionsAboveOneAllowed: true
      }
    },
    runtimeSurfaceContract: {
      onlySourceForRyanSpeech: "FRA16_RUNTIME_COPY",
      onlySourceForRyanCaptions: "The exact text of the same FRA16_RUNTIME_COPY entry used for audio.",
      captionRule: "No separately authored caption string is permitted. Captions are word-timed from the active utterance text and remain one or two lines without a permanent transcript bar.",
      questionPromptSpeechPolicy: "Question prompts, options, button labels, hints and author-only notes are visible/semantic UI but are not automatically spoken by Ryan. Ryan speaks only utterance IDs explicitly attached to the runtime state.",
      hintSpeechPolicy: "Hints are learner-facing UI text. They are not automatic Ryan narration. An assistive read-aloud may read the exact hint without creating a Ryan caption timeline.",
      cueRule: "Every speech-led visual cue references one existing utterance ID and an exact anchor phrase contained in that utterance. Removing or changing speech must remove or remap its cues.",
      outcomeRule: "Correctness is computed before feedback selection. Exactly one branch plays: correct, matching error-specific incorrect, or default incorrect. A wrong response must never play a correct line.",
      finalRule: "Final answers lock before correctness feedback or worked checks. Route decisions use the original committed pre-working response.",
      authorOnlyNeverSpoken: [
        "communicationGoal",
        "authorOnlyPurpose",
        "authorOnlyAssessmentIntent",
        "authorOnlyAction",
        "authorOnlyNotes",
        "authorOnlyImplementationNotes",
        "route labels",
        "error-family codes",
        "QA language",
        "source-of-truth prose"
      ]
    },
    teachingScenes: [
      {
        id: "HOOK",
        stage: "opening",
        authorOnlyPurpose: "Create a genuine conflict between completed-count and part-size cues before any method is revealed.",
        ryanUtteranceIds: [
          "HOOK.PRE.1",
          "HOOK.PRE.2",
          "HOOK.PRE.3",
          "HOOK.PRE.4"
        ],
        visual: {
          kind: "progress_bars",
          fractionIds: ["blue", "orange"],
          sameWholeLength: true,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two equal-length game-progress bars. The Blue bar is divided into eight equal stages with five completed. The Orange bar is divided into three equal stages with two completed.",
          authorOnlyNotes: [
            "Exactly 5 of 8 Blue stages and 2 of 3 Orange stages are complete.",
            "The completed state uses fill plus a solid inner line or check cue, not colour alone.",
            "Do not reveal a winner before the learner chooses a prediction or Not sure."
          ]
        },
        timeline: [
          {
            id: "HOOK.CUE.BLUE",
            utteranceId: "HOOK.PRE.1",
            anchorText: "five of eight stages",
            authorOnlyAction: "Reveal the Blue bar and light exactly five of eight stages one-by-one.",
            mustNotOccurBeforeAnchor: true,
            reducedMotionState: "Reveal the completed 5-of-8 state at once."
          },
          {
            id: "HOOK.CUE.ORANGE",
            utteranceId: "HOOK.PRE.1",
            anchorText: "two of three",
            authorOnlyAction: "Reveal the Orange bar and light exactly two of three stages one-by-one.",
            mustNotOccurBeforeAnchor: true,
            reducedMotionState: "Reveal the completed 2-of-3 state at once."
          },
          {
            id: "HOOK.CUE.STAGE_SIZE",
            utteranceId: "HOOK.PRE.2",
            anchorText: "stages are larger",
            authorOnlyAction: "Momentarily outline one Orange third beside one Blue eighth at true relative widths.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "HOOK.CUE.CHOICES",
            utteranceId: "HOOK.PRE.4",
            anchorText: "Make a prediction",
            authorOnlyAction: "Enable Blue, Orange, Same and Not sure choices.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        interaction: {
          scored: false,
          prompt: "Who is further through the same game?",
          options: [
            { id: "blue", label: "Blue" },
            { id: "orange", label: "Orange" },
            { id: "same", label: "Same" },
            { id: "not_sure", label: "Not sure" }
          ],
          feedbackByOption: {
            blue: {
              outcome: "incorrect",
              ryanUtteranceIds: ["HOOK.FEEDBACK.BLUE"],
              then: "T1"
            },
            orange: {
              outcome: "correct",
              ryanUtteranceIds: ["HOOK.FEEDBACK.ORANGE"],
              then: "T1"
            },
            same: {
              outcome: "incorrect",
              ryanUtteranceIds: ["HOOK.FEEDBACK.SAME"],
              then: "T1"
            },
            not_sure: {
              outcome: "neutral",
              ryanUtteranceIds: ["HOOK.FEEDBACK.NOT_SURE"],
              then: "T1"
            }
          },
          convergeOnlyAfterBranchFeedback: true,
          answerAffectsMasteryEvidence: false
        },
        authorOnlyUnderstandingExpected: "Raw numerator and denominator cues conflict, so a fair exact comparison is needed.",
        authorOnlyBoundaryNotes: [
          "The hook is curiosity evidence only and never enters mastery scoring.",
          "Do not introduce cross multiplication or decimal conversion."
        ]
      },
      {
        id: "T1",
        stage: "teach",
        authorOnlyPurpose: "Establish that unlike denominators represent different part sizes and raw numerator comparison is unfair.",
        ryanUtteranceIds: ["T1.1", "T1.2"],
        visual: {
          kind: "fraction_bars",
          fractionIds: ["five_eighths", "two_thirds"],
          sameWholeLength: true,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two equal-length bars: one split into eight equal parts with five selected, and one split into three equal parts with two selected.",
          authorOnlyNotes: [
            "One eighth and one third must display at their true relative widths.",
            "The full whole outlines align exactly."
          ]
        },
        timeline: [
          {
            id: "T1.CUE.NUMERATORS",
            utteranceId: "T1.1",
            anchorText: "five and two",
            authorOnlyAction: "Glow only the numerators 5 and 2, then fade them to show they are insufficient alone.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T1.CUE.PART_SIZE",
            utteranceId: "T1.2",
            anchorText: "different sizes",
            authorOnlyAction: "Lift out one eighth and one third at true relative widths.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T1.CUE.SAME_WHOLE",
            utteranceId: "T1.2",
            anchorText: "same whole",
            authorOnlyAction: "Align and emphasise the identical whole boundaries.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        authorOnlyUnderstandingExpected: "A fair comparison requires the same whole and same-sized parts, or another exact route that settles the order.",
        authorOnlyBoundaryNotes: [
          "Do not compare the numbers 5 and 2 as if they counted the same unit."
        ]
      },
      {
        id: "T2",
        stage: "teach",
        authorOnlyPurpose: "Demonstrate exact value-preserving conversion to a common denominator and compare matched parts.",
        ryanUtteranceIds: ["T2.1", "T2.2", "T2.3", "T2.4"],
        visual: {
          kind: "equivalent_fraction_bars",
          fractionIds: ["five_eighths", "two_thirds"],
          sameWholeLength: true,
          commonDenominator: 24,
          showEquivalentFormsBeforeSubmit: true,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two equal-length bars show five eighths and two thirds. Each bar will be repartitioned into twenty-four equal parts without changing its filled endpoint.",
          authorOnlyNotes: [
            "5/8 becomes 15/24 using x3 on top and bottom.",
            "2/3 becomes 16/24 using x8 on top and bottom.",
            "The total bar length and filled endpoint never move while subdivisions appear."
          ]
        },
        timeline: [
          {
            id: "T2.CUE.COMMON_DENOMINATOR",
            utteranceId: "T2.1",
            anchorText: "common denominator",
            authorOnlyAction: "Reveal 24 as the shared unit for both rows.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T2.CUE.EIGHTHS",
            utteranceId: "T2.2",
            anchorText: "splits into three",
            authorOnlyAction: "Split every eighth into three equal twenty-fourths while preserving the 5/8 endpoint; reveal 15/24.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T2.CUE.THIRDS",
            utteranceId: "T2.3",
            anchorText: "splits into eight",
            authorOnlyAction: "Split every third into eight equal twenty-fourths while preserving the 2/3 endpoint; reveal 16/24.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T2.CUE.RESULT",
            utteranceId: "T2.4",
            anchorText: "Sixteen twenty-fourths is greater",
            authorOnlyAction: "Glow 15 and 16, then reveal 15/24 < 16/24 and the original-fraction conclusion.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        authorOnlyUnderstandingExpected: "Equivalent fractions preserve each value; once part sizes match, the numerators give a fair comparison.",
        authorOnlyBoundaryNotes: [
          "Equivalence is used, not retaught as a standalone skill.",
          "Do not introduce the cross-product shortcut."
        ]
      },
      {
        id: "T3",
        stage: "teach",
        authorOnlyPurpose: "Demonstrate a useful exact benchmark route when opposite sides of one half settle the comparison.",
        ryanUtteranceIds: ["T3.1", "T3.2", "T3.3"],
        visual: {
          kind: "benchmark_bars",
          fractionIds: ["four_ninths", "five_eighths"],
          sameWholeLength: true,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: true,
          benchmark: { numerator: 1, denominator: 2 },
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two equal-length bars show four ninths and five eighths. A one-half marker is introduced during the explanation.",
          authorOnlyNotes: [
            "4/9 stops visibly before one half.",
            "5/8 extends visibly beyond one half.",
            "The doubling check appears only after the visual meaning."
          ]
        },
        timeline: [
          {
            id: "T3.CUE.HALF",
            utteranceId: "T3.2",
            anchorText: "one half",
            authorOnlyAction: "Reveal the one-half marker on both equal-length bars.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T3.CUE.BELOW",
            utteranceId: "T3.2",
            anchorText: "below one half",
            authorOnlyAction: "Show the 4/9 endpoint before the half marker and label below.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T3.CUE.ABOVE",
            utteranceId: "T3.2",
            anchorText: "above one half",
            authorOnlyAction: "Show the 5/8 endpoint past the half marker and label above.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T3.CUE.CONCLUDE",
            utteranceId: "T3.3",
            anchorText: "five eighths is greater",
            authorOnlyAction: "Reveal 4/9 < 1/2 < 5/8 and then 5/8 > 4/9.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        authorOnlyUnderstandingExpected: "A benchmark is efficient only when it settles the comparison exactly.",
        authorOnlyBoundaryNotes: [
          "If both fractions lie on the same side of half, route to another exact method."
        ]
      },
      {
        id: "T4",
        stage: "teach",
        authorOnlyPurpose: "Extend common-unit comparison to ordering three fractions and protect the requested direction.",
        ryanUtteranceIds: [
          "T4.1",
          "T4.2",
          "T4.3",
          "T4.GUARD.1",
          "T4.GUARD.2"
        ],
        visual: {
          kind: "common_unit_order_track",
          fractionIds: ["seven_twelfths", "five_eighths", "three_quarters"],
          sameWholeLength: true,
          commonDenominator: 24,
          showEquivalentFormsBeforeSubmit: true,
          showBenchmarkBeforeSubmit: false,
          direction: "least_to_greatest",
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Three equal-length rows represent seven twelfths, five eighths and three quarters, each rewritten as a number of twenty-fourths.",
          authorOnlyNotes: [
            "Equivalent numerators are 14, 15 and 18.",
            "Only the filled endpoint changes; every whole has identical length.",
            "Ordering cards also support keyboard and move-left/move-right controls."
          ]
        },
        timeline: [
          {
            id: "T4.CUE.COMMON_UNIT",
            utteranceId: "T4.1",
            anchorText: "one common unit",
            authorOnlyAction: "Align the three identical whole tracks and reserve one shared twenty-fourth grid.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T4.CUE.TWENTY_FOURTHS",
            utteranceId: "T4.2",
            anchorText: "twenty-fourths",
            authorOnlyAction: "Reveal 14/24, 15/24 and 18/24 beside their original fractions.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T4.CUE.ORDER",
            utteranceId: "T4.3",
            anchorText: "least to greatest",
            authorOnlyAction: "Move the cards into 7/12 < 5/8 < 3/4 only as the order is spoken.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T4.CUE.DIRECTION",
            utteranceId: "T4.GUARD.2",
            anchorText: "smaller values go left",
            authorOnlyAction: "Highlight the LEAST and GREATEST endpoints and reverse a duplicate row for greatest-to-least demonstration.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        authorOnlyUnderstandingExpected: "All fractions in a list can be compared with one shared unit, then arranged in the requested direction.",
        authorOnlyBoundaryNotes: [
          "The lesson orders at most a small, arithmetic-light set here."
        ]
      },
      {
        id: "T5",
        stage: "teach",
        authorOnlyPurpose: "Show that the exact method remains valid for simple fractions above one without mixed-number conversion.",
        ryanUtteranceIds: ["T5.1", "T5.2", "T5.3"],
        visual: {
          kind: "above_one_fraction_bars",
          fractionIds: ["seven_sixths", "nine_eighths"],
          sameWholeLength: true,
          commonDenominator: 24,
          showEquivalentFormsBeforeSubmit: true,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          extendsBeyondOne: true,
          accessibleDescriptionBeforeSubmit: "Two multi-whole fraction models show seven sixths and nine eighths. Each whole keeps the same physical length and part size continues beyond one.",
          authorOnlyNotes: [
            "7/6 = 28/24 and 9/8 = 27/24.",
            "Do not name the forms as improper or convert to mixed numbers."
          ]
        },
        timeline: [
          {
            id: "T5.CUE.ABOVE_ONE",
            utteranceId: "T5.1",
            anchorText: "more than a whole",
            authorOnlyAction: "Extend each consistent partition beyond the first whole without changing part size.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T5.CUE.REWRITE",
            utteranceId: "T5.2",
            anchorText: "twenty-eight twenty-fourths",
            authorOnlyAction: "Reveal 28/24 under 7/6 and 27/24 under 9/8.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "T5.CUE.DIFFERENCE",
            utteranceId: "T5.3",
            anchorText: "one twenty-fourth",
            authorOnlyAction: "Highlight the single twenty-fourth difference and reveal 7/6 > 9/8.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        authorOnlyUnderstandingExpected: "The same exact comparison method works above one; conversion to another form is unnecessary.",
        authorOnlyBoundaryNotes: [
          "Comparison is the target. No classification, mixed-number conversion or operations."
        ]
      },
      {
        id: "HANDOFF",
        stage: "teach",
        authorOnlyPurpose: "Hand method choice to the learner and signal two guided items before support fades.",
        ryanUtteranceIds: ["HANDOFF.1", "HANDOFF.2"],
        visual: {
          kind: "symbolic_pair",
          fractionIds: ["benchmark_route", "equivalence_route"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "A stage indicator moves from Learn the idea to Try it with me, then previews Your turn.",
          authorOnlyNotes: [
            "This is a transition visual, not a scored mathematical item.",
            "No generic Question 1 label."
          ]
        },
        timeline: [
          {
            id: "HANDOFF.CUE.ROUTES",
            utteranceId: "HANDOFF.1",
            anchorText: "two exact routes",
            authorOnlyAction: "Show compact benchmark and common-denominator route icons without solving a new item.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "HANDOFF.CUE.STAGE",
            utteranceId: "HANDOFF.2",
            anchorText: "stay with you for two",
            authorOnlyAction: "Move the active stage label to Try it with me and preview support fading toward Your turn.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        authorOnlyUnderstandingExpected: "The learner can choose between an exact benchmark and matched-part route when appropriate.",
        authorOnlyBoundaryNotes: [
          "Guided success is learning evidence, not independent mastery evidence."
        ]
      }
    ],
    questions: [
      {
        id: "G1",
        stage: "guided",
        family: "equivalence_bridge",
        authorOnlyAssessmentIntent: "Use a supplied common denominator, preserve both values, then select the comparison symbol.",
        prompt: "Rewrite each fraction in twelfths, then complete the comparison.",
        fractions: [
          { id: "left", value: { numerator: 3, denominator: 4 }, display: "3/4" },
          { id: "right", value: { numerator: 5, denominator: 6 }, display: "5/6" }
        ],
        visual: {
          kind: "equivalent_fraction_bars",
          fractionIds: ["left", "right"],
          sameWholeLength: true,
          commonDenominator: 12,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "The fractions three quarters and five sixths are shown with empty numerator fields over a supplied denominator of twelve, followed by a comparison-symbol control.",
          authorOnlyNotes: [
            "The 12-part grids may remain faint until a response is committed.",
            "The transformation to 9/12 and 10/12 appears only after correct commitment or authored support escalation."
          ]
        },
        response: {
          kind: "equivalent_comparison",
          commonDenominator: 12,
          editableEquivalentNumerators: [true, true],
          comparisonOptions: ["<", ">", "="],
          submitLabel: "Check answer"
        },
        answer: {
          kind: "equivalent_comparison",
          commonDenominator: 12,
          rewrittenNumerators: [9, 10],
          symbol: "<"
        },
        policy: {
          hintPolicy: "guided",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: ["G1.PRE"],
        feedback: {
          correctUtteranceIds: ["G1.CORRECT"],
          incorrectDefaultUtteranceIds: ["G1.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            only_denominator_changed: ["G1.INCORRECT.ONE_FIELD"],
            equivalent_forms_correct_symbol_wrong: ["G1.INCORRECT.SYMBOL"],
            different_factors_or_inconsistent_rewrite: ["G1.INCORRECT.FACTOR"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "one denominator is changed without its numerator",
            family: "inconsistent_equivalence",
            classificationRule: "single_full_inconsistent_rewrite",
            feedbackUtteranceIds: ["G1.INCORRECT.ONE_FIELD"]
          },
          {
            observed: "9/12 and 10/12 entered but the symbol is > or =",
            family: "symbol_or_order_direction",
            classificationRule: "isolated_slip_then_discriminate",
            feedbackUtteranceIds: ["G1.INCORRECT.SYMBOL"]
          },
          {
            observed: "different scale factors are used within one fraction",
            family: "inconsistent_equivalence",
            classificationRule: "single_full_inconsistent_rewrite",
            feedbackUtteranceIds: ["G1.INCORRECT.FACTOR"]
          }
        ],
        next: "G2",
        authorOnlyImplementationNotes: [
          "Record each entered numerator and symbol separately.",
          "Blank or malformed fields receive neutral validation and no misconception label.",
          "A wrong symbol after correct rewrites is not an equivalence error."
        ]
      },
      {
        id: "G2",
        stage: "guided",
        family: "benchmark",
        authorOnlyAssessmentIntent: "Classify each fraction against one half and use opposite sides of the benchmark to compare exactly.",
        prompt: "Use one half as the checkpoint, then choose the comparison symbol.",
        fractions: [
          { id: "left", value: { numerator: 3, denominator: 7 }, display: "3/7" },
          { id: "right", value: { numerator: 5, denominator: 9 }, display: "5/9" }
        ],
        visual: {
          kind: "benchmark_bars",
          fractionIds: ["left", "right"],
          sameWholeLength: true,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: true,
          benchmark: { numerator: 1, denominator: 2 },
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Three sevenths and five ninths are shown with separate controls for below, exactly at or above one half, followed by a comparison-symbol control.",
          authorOnlyNotes: [
            "Do not animate either fraction to its benchmark category before the learner chooses.",
            "The one-half marker is part of the task, not a worked answer."
          ]
        },
        response: {
          kind: "benchmark_then_symbol",
          relationOptions: ["below_half", "exactly_half", "above_half"],
          comparisonOptions: ["<", ">", "="],
          submitLabel: "Check answer"
        },
        answer: {
          kind: "benchmark_comparison",
          relations: ["below_half", "above_half"],
          symbol: "<"
        },
        policy: {
          hintPolicy: "guided",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: ["G2.PRE"],
        feedback: {
          correctUtteranceIds: ["G2.CORRECT"],
          incorrectDefaultUtteranceIds: ["G2.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            benchmark_category_wrong: ["G2.INCORRECT.CLASSIFICATION"],
            categories_correct_symbol_wrong: ["G2.INCORRECT.SYMBOL"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "one or both half classifications are incorrect",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator",
            feedbackUtteranceIds: ["G2.INCORRECT.CLASSIFICATION"]
          },
          {
            observed: "both half classifications are correct but the symbol is > or =",
            family: "symbol_or_order_direction",
            classificationRule: "isolated_slip_then_discriminate",
            feedbackUtteranceIds: ["G2.INCORRECT.SYMBOL"]
          }
        ],
        next: "GUIDED_GATE",
        authorOnlyImplementationNotes: [
          "A repeated benchmark-classification miss may route to R-DEN if denominator-only reasoning is explicit, otherwise use a fresh discriminator.",
          "Do not claim the learner used a hidden method."
        ]
      },
      {
        id: "F1",
        stage: "faded",
        family: "equivalence_bridge",
        authorOnlyAssessmentIntent: "Complete equivalent forms using a supplied common denominator with optional strategy support.",
        prompt: "Compare two fifths and three sevenths using thirty-fifths.",
        fractions: [
          { id: "left", value: { numerator: 2, denominator: 5 }, display: "2/5" },
          { id: "right", value: { numerator: 3, denominator: 7 }, display: "3/7" }
        ],
        visual: {
          kind: "equivalent_fraction_bars",
          fractionIds: ["left", "right"],
          sameWholeLength: true,
          commonDenominator: 35,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two fifths and three sevenths are shown with blank equivalent numerators over a fixed denominator of thirty-five and a comparison-symbol control.",
          authorOnlyNotes: [
            "F1 is omitted only on the authored strong guided route.",
            "No multiplier labels appear unless the learner opens the hint or support escalates."
          ]
        },
        response: {
          kind: "equivalent_comparison",
          commonDenominator: 35,
          editableEquivalentNumerators: [true, true],
          comparisonOptions: ["<", ">", "="],
          submitLabel: "Check answer"
        },
        answer: {
          kind: "equivalent_comparison",
          commonDenominator: 35,
          rewrittenNumerators: [14, 15],
          symbol: "<"
        },
        hint: "Five to thirty-five is times seven; seven to thirty-five is times five. Use the same factor on each numerator.",
        policy: {
          hintPolicy: "optional",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          requiresFreshNoHintConfirmationIfHintUsed: true,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["F1.CORRECT"],
          incorrectDefaultUtteranceIds: ["F1.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            inconsistent_equivalence: ["F1.INCORRECT.EQUIV"],
            equivalent_forms_correct_symbol_wrong: ["F1.INCORRECT.SYMBOL"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "14 and 15 are not produced with consistent factors",
            family: "inconsistent_equivalence",
            classificationRule: "single_full_inconsistent_rewrite",
            feedbackUtteranceIds: ["F1.INCORRECT.EQUIV"]
          },
          {
            observed: "14/35 and 15/35 are correct but symbol is wrong",
            family: "symbol_or_order_direction",
            classificationRule: "isolated_slip_then_discriminate",
            feedbackUtteranceIds: ["F1.INCORRECT.SYMBOL"]
          },
          {
            observed: "correct after opening the hint",
            family: "supported_success",
            classificationRule: "support_usage_only"
          }
        ],
        next: "F2",
        authorOnlyImplementationNotes: [
          "Hint starts collapsed and opening it is support, not a wrong answer.",
          "The fresh confirmation for supported pair-comparison success is C-PAIR."
        ]
      },
      {
        id: "F2",
        stage: "faded",
        family: "sort",
        authorOnlyAssessmentIntent: "Order three fractions around one half; retained on every route because it is a distinct evidence family.",
        prompt: "Order the fractions least to greatest.",
        fractions: [
          { id: "seven_twelfths", value: { numerator: 7, denominator: 12 }, display: "7/12" },
          { id: "three_tenths", value: { numerator: 3, denominator: 10 }, display: "3/10" },
          { id: "one_half", value: { numerator: 1, denominator: 2 }, display: "1/2" }
        ],
        visual: {
          kind: "order_cards",
          fractionIds: ["seven_twelfths", "three_tenths", "one_half"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          direction: "least_to_greatest",
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Three movable fraction cards show seven twelfths, three tenths and one half. The row is labelled least on the left and greatest on the right.",
          authorOnlyNotes: [
            "Do not pre-place one half in the middle.",
            "Support drag, keyboard reorder and move-left/move-right buttons."
          ]
        },
        response: {
          kind: "order_cards",
          direction: "least_to_greatest",
          submitLabel: "Check answer",
          allowDrag: true,
          allowKeyboardReorder: true,
          allowMoveButtons: true
        },
        answer: {
          kind: "order",
          direction: "least_to_greatest",
          orderedFractionIds: ["three_tenths", "one_half", "seven_twelfths"]
        },
        hint: "Use one half as the middle anchor.",
        policy: {
          hintPolicy: "optional",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          requiresFreshNoHintConfirmationIfHintUsed: true,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["F2.CORRECT"],
          incorrectDefaultUtteranceIds: ["F2.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            exact_reverse_order: ["F2.INCORRECT.REVERSED"],
            one_half_not_used_as_middle_anchor: ["F2.INCORRECT.BENCHMARK"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "the exact reverse order is submitted",
            family: "symbol_or_order_direction",
            classificationRule: "isolated_slip_then_discriminate",
            feedbackUtteranceIds: ["F2.INCORRECT.REVERSED"]
          },
          {
            observed: "one half is placed at an endpoint or values are sorted by raw numerators",
            family: "numerator_only",
            classificationRule: "repeat_or_explicit_reasoning",
            feedbackUtteranceIds: ["F2.INCORRECT.BENCHMARK"]
          },
          {
            observed: "correct after opening the hint",
            family: "supported_success",
            classificationRule: "support_usage_only"
          }
        ],
        next: "I1",
        authorOnlyImplementationNotes: [
          "F2 is always shown, including on the fast route.",
          "Hint-assisted success uses C-BENCH or C-SORT according to the support actually used."
        ]
      },
      {
        id: "I1",
        stage: "independent",
        family: "direct",
        authorOnlyAssessmentIntent: "Choose an exact method independently to compare a fresh unlike-denominator pair.",
        prompt: "Complete the comparison.",
        fractions: [
          { id: "left", value: { numerator: 7, denominator: 9 }, display: "7/9" },
          { id: "right", value: { numerator: 5, denominator: 6 }, display: "5/6" }
        ],
        visual: {
          kind: "symbolic_pair",
          fractionIds: ["left", "right"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "The fractions seven ninths and five sixths appear with a blank comparison-symbol control between them.",
          authorOnlyNotes: [
            "No method, benchmark marker or equivalent form appears before submission.",
            "Previous solved examples are not visible beside the item."
          ]
        },
        response: {
          kind: "comparison_symbol",
          options: ["<", ">", "="],
          submitLabel: "Check answer"
        },
        answer: { kind: "comparison", symbol: "<" },
        hint: "A common denominator of eighteen lets you compare equal-sized pieces.",
        policy: {
          hintPolicy: "optional",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          requiresFreshNoHintConfirmationIfHintUsed: true,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: ["INDEPENDENT.1", "INDEPENDENT.2"],
        feedback: {
          correctUtteranceIds: ["I1.CORRECT"],
          incorrectDefaultUtteranceIds: ["I1.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            selected_greater_than: ["I1.INCORRECT.GREATER"],
            selected_equals: ["I1.INCORRECT.EQUAL"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "selected > and prior or explicit evidence says 7 is larger than 5",
            family: "numerator_only",
            classificationRule: "repeat_or_explicit_reasoning",
            feedbackUtteranceIds: ["I1.INCORRECT.GREATER"]
          },
          {
            observed: "selected = without a valid equality explanation",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator",
            feedbackUtteranceIds: ["I1.INCORRECT.EQUAL"]
          },
          {
            observed: "correct after opening the hint",
            family: "supported_success",
            classificationRule: "support_usage_only"
          }
        ],
        next: "I2",
        authorOnlyImplementationNotes: [
          "If hint is opened, use C-PAIR before final entry.",
          "Do not infer numerator-only thinking from one unexplained > response."
        ]
      },
      {
        id: "I2",
        stage: "independent",
        family: "sort",
        authorOnlyAssessmentIntent: "Order a fresh three-fraction set with no visible scaffold and optional route hint.",
        prompt: "Order the fractions least to greatest.",
        fractions: [
          { id: "four_fifths", value: { numerator: 4, denominator: 5 }, display: "4/5" },
          { id: "seven_tenths", value: { numerator: 7, denominator: 10 }, display: "7/10" },
          { id: "five_sixths", value: { numerator: 5, denominator: 6 }, display: "5/6" }
        ],
        visual: {
          kind: "order_cards",
          fractionIds: ["four_fifths", "seven_tenths", "five_sixths"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          direction: "least_to_greatest",
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Three movable fraction cards show four fifths, seven tenths and five sixths. The requested direction is least to greatest.",
          authorOnlyNotes: [
            "No common denominator or benchmark is displayed before submission.",
            "The initial card order must not accidentally match the answer."
          ]
        },
        response: {
          kind: "order_cards",
          direction: "least_to_greatest",
          submitLabel: "Check answer",
          allowDrag: true,
          allowKeyboardReorder: true,
          allowMoveButtons: true
        },
        answer: {
          kind: "order",
          direction: "least_to_greatest",
          orderedFractionIds: ["seven_tenths", "four_fifths", "five_sixths"]
        },
        hint: "Thirty is a common denominator for ten, five and six.",
        policy: {
          hintPolicy: "optional",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          requiresFreshNoHintConfirmationIfHintUsed: true,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["I2.CORRECT"],
          incorrectDefaultUtteranceIds: ["I2.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            exact_reverse_order: ["I2.INCORRECT.REVERSED"],
            sorted_by_raw_numerators: ["I2.INCORRECT.NUM_ORDER"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "the exact reverse order is submitted",
            family: "symbol_or_order_direction",
            classificationRule: "isolated_slip_then_discriminate",
            feedbackUtteranceIds: ["I2.INCORRECT.REVERSED"]
          },
          {
            observed: "cards are ordered by numerators 4, 5, 7 or another raw-number rule",
            family: "numerator_only",
            classificationRule: "repeat_or_explicit_reasoning",
            feedbackUtteranceIds: ["I2.INCORRECT.NUM_ORDER"]
          },
          {
            observed: "correct after opening the hint",
            family: "supported_success",
            classificationRule: "support_usage_only"
          }
        ],
        next: "INDEPENDENT_GATE",
        authorOnlyImplementationNotes: [
          "Hint-assisted success uses C-SORT before final entry.",
          "Supported success is learning evidence but never completes the gate by itself."
        ]
      },
      {
        id: "M1",
        stage: "final",
        family: "direct",
        authorOnlyAssessmentIntent: "Fresh unsupported exact comparison of a proper-fraction pair.",
        prompt: "Complete the comparison.",
        fractions: [
          { id: "left", value: { numerator: 4, denominator: 7 }, display: "4/7" },
          { id: "right", value: { numerator: 5, denominator: 8 }, display: "5/8" }
        ],
        visual: {
          kind: "symbolic_pair",
          fractionIds: ["left", "right"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "The fractions four sevenths and five eighths appear with less-than, greater-than and equals choices.",
          authorOnlyNotes: [
            "Do not show 56, 32 or 35 before answer lock.",
            "No hint control is present."
          ]
        },
        response: {
          kind: "comparison_symbol",
          options: ["<", ">", "="],
          submitLabel: "Submit answer"
        },
        answer: { kind: "comparison", symbol: "<" },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_locked_submit",
          scored: true,
          answerLocksOnSubmit: true,
          firstAttemptOnlyForMastery: true,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: ["FINAL.INTRO"],
        feedback: {
          correctUtteranceIds: ["M1.CORRECT"],
          incorrectDefaultUtteranceIds: ["M1.INCORRECT.DEFAULT"],
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        workedCheck: {
          ryanUtteranceIds: ["M1.WORK.1", "M1.WORK.2", "M1.WORK.3"],
          visibleSteps: [
            "4/7 = 32/56",
            "5/8 = 35/56",
            "32 < 35, so 4/7 < 5/8."
          ],
          authorOnlyVisualReveal: [
            "Reveal two identical 56-part bars only after the answer locks.",
            "Highlight 32 and 35 after both equivalent fractions are visible."
          ],
          requiresAnswerLocked: true,
          mustFollowOutcomeFeedback: true
        },
        errorSignals: [
          {
            observed: "selected > after repeated or explicitly stated larger-numerator reasoning",
            family: "numerator_only",
            classificationRule: "repeat_or_explicit_reasoning"
          },
          {
            observed: "one unexplained incorrect symbol",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator"
          }
        ],
        next: "M2",
        authorOnlyImplementationNotes: [
          "The committed answer is immutable once submitted.",
          "Outcome feedback plays before the worked check; the worked check never changes the recorded first attempt."
        ]
      },
      {
        id: "M2",
        stage: "final",
        family: "visual",
        authorOnlyAssessmentIntent: "Recognise equality across different denominators using aligned visual wholes.",
        prompt: "Choose less than, greater than or equals.",
        fractions: [
          { id: "left", value: { numerator: 6, denominator: 8 }, display: "6/8" },
          { id: "right", value: { numerator: 9, denominator: 12 }, display: "9/12" }
        ],
        visual: {
          kind: "visual_equal_bars",
          fractionIds: ["left", "right"],
          sameWholeLength: true,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two equal-length bars are shown. One is divided into eight equal parts with six selected. The other is divided into twelve equal parts with nine selected.",
          authorOnlyNotes: [
            "Pre-submit accessibility text must not state that the selected endpoints align.",
            "Do not draw a shared 3/4 endpoint line until answer lock."
          ]
        },
        response: {
          kind: "comparison_symbol",
          options: ["<", ">", "="],
          submitLabel: "Submit answer"
        },
        answer: { kind: "comparison", symbol: "=" },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_locked_submit",
          scored: true,
          answerLocksOnSubmit: true,
          firstAttemptOnlyForMastery: true,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["M2.CORRECT"],
          incorrectDefaultUtteranceIds: ["M2.INCORRECT.DEFAULT"],
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        workedCheck: {
          ryanUtteranceIds: ["M2.WORK.1", "M2.WORK.2", "M2.WORK.3"],
          visibleSteps: [
            "6/8 = 3/4",
            "9/12 = 3/4",
            "6/8 = 9/12."
          ],
          authorOnlyVisualReveal: [
            "Reveal a common 3/4 endpoint line after lock.",
            "Show both simplification paths or equivalent overlays without changing the original bars."
          ],
          requiresAnswerLocked: true,
          mustFollowOutcomeFeedback: true
        },
        errorSignals: [
          {
            observed: "selected < or > because the denominators differ, with repeated or explicit no-equality reasoning",
            family: "equality_rejected",
            classificationRule: "repeat_or_explicit_reasoning"
          },
          {
            observed: "one unexplained non-equality choice",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator"
          }
        ],
        next: "M3",
        authorOnlyImplementationNotes: [
          "The visual and symbolic answer are driven by the same fraction values.",
          "Equality refusal routes through the R-EQUIV equality support path, then RF-EQ or another fresh equal pair."
        ]
      },
      {
        id: "M3",
        stage: "final",
        family: "sort",
        authorOnlyAssessmentIntent: "Order three fresh fractions least to greatest without pre-submit support.",
        prompt: "Order the fractions least to greatest.",
        fractions: [
          { id: "seven_twelfths", value: { numerator: 7, denominator: 12 }, display: "7/12" },
          { id: "three_quarters", value: { numerator: 3, denominator: 4 }, display: "3/4" },
          { id: "two_fifths", value: { numerator: 2, denominator: 5 }, display: "2/5" }
        ],
        visual: {
          kind: "order_cards",
          fractionIds: ["seven_twelfths", "three_quarters", "two_fifths"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          direction: "least_to_greatest",
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Three movable cards show seven twelfths, three quarters and two fifths. The requested direction is least to greatest.",
          authorOnlyNotes: [
            "Initial card order is 7/12, 3/4, 2/5, not the answer order.",
            "No 60-part grid is rendered before lock."
          ]
        },
        response: {
          kind: "order_cards",
          direction: "least_to_greatest",
          submitLabel: "Submit order",
          allowDrag: true,
          allowKeyboardReorder: true,
          allowMoveButtons: true
        },
        answer: {
          kind: "order",
          direction: "least_to_greatest",
          orderedFractionIds: ["two_fifths", "seven_twelfths", "three_quarters"]
        },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_locked_submit",
          scored: true,
          answerLocksOnSubmit: true,
          firstAttemptOnlyForMastery: true,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["M3.CORRECT"],
          incorrectDefaultUtteranceIds: ["M3.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            exact_reverse_order: ["M3.INCORRECT.REVERSED"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        workedCheck: {
          ryanUtteranceIds: [
            "M3.WORK.1",
            "M3.WORK.2",
            "M3.WORK.3",
            "M3.WORK.4"
          ],
          visibleSteps: [
            "2/5 = 24/60",
            "7/12 = 35/60",
            "3/4 = 45/60",
            "2/5 < 7/12 < 3/4."
          ],
          authorOnlyVisualReveal: [
            "Reveal three equal-length 60-part tracks after lock.",
            "Move cards into the accepted order only after all equivalent forms are visible."
          ],
          requiresAnswerLocked: true,
          mustFollowOutcomeFeedback: true
        },
        errorSignals: [
          {
            observed: "exact reverse sequence submitted",
            family: "symbol_or_order_direction",
            classificationRule: "isolated_slip_then_discriminate",
            feedbackUtteranceIds: ["M3.INCORRECT.REVERSED"]
          },
          {
            observed: "cards sorted by raw numerators 2, 3, 7 or another repeated raw-number rule",
            family: "numerator_only",
            classificationRule: "repeat_or_explicit_reasoning"
          },
          {
            observed: "other unexplained wrong sequence",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator"
          }
        ],
        next: "M4",
        authorOnlyImplementationNotes: [
          "Separate reverse-direction evidence from incorrect value-order evidence.",
          "The exact value comparator, not display-string order, validates the submitted sequence."
        ]
      },
      {
        id: "M4",
        stage: "final",
        family: "reason",
        authorOnlyAssessmentIntent: "Select a valid exact benchmark explanation and reject denominator-only, additive and cannot-compare claims.",
        prompt: "Which statement is correct?",
        fractions: [
          { id: "left", value: { numerator: 4, denominator: 9 }, display: "4/9" },
          { id: "right", value: { numerator: 5, denominator: 8 }, display: "5/8" }
        ],
        visual: {
          kind: "reasoning_pair",
          fractionIds: ["left", "right"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "The fractions four ninths and five eighths are followed by four reasoning statements labelled A to D.",
          authorOnlyNotes: [
            "No half marker appears before answer lock.",
            "Options remain text-first and keyboard selectable."
          ]
        },
        response: {
          kind: "single_choice",
          options: [
            { id: "A", label: "4/9 is greater because 9 is greater than 8." },
            { id: "B", label: "5/8 is greater because 4/9 is below half and 5/8 is above half." },
            { id: "C", label: "They are equal because 4 + 9 = 5 + 8." },
            { id: "D", label: "Fractions cannot be compared unless denominators match." }
          ],
          submitLabel: "Submit answer"
        },
        answer: { kind: "choice", optionId: "B" },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_locked_submit",
          scored: true,
          answerLocksOnSubmit: true,
          firstAttemptOnlyForMastery: true,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["M4.CORRECT"],
          incorrectDefaultUtteranceIds: ["M4.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            A: ["M4.INCORRECT.DEN"],
            C: ["M4.INCORRECT.ADD"],
            D: ["M4.INCORRECT.CANNOT"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        workedCheck: {
          ryanUtteranceIds: ["M4.WORK.1", "M4.WORK.2"],
          visibleSteps: [
            "4/9 < 1/2",
            "5/8 > 1/2",
            "4/9 < 1/2 < 5/8, so 5/8 > 4/9."
          ],
          authorOnlyVisualReveal: [
            "Reveal one-half markers on two equal-length bars after lock.",
            "Show 4/9 ending before half and 5/8 ending after half."
          ],
          requiresAnswerLocked: true,
          mustFollowOutcomeFeedback: true
        },
        errorSignals: [
          {
            observed: "selected A",
            family: "denominator_only",
            classificationRule: "repeat_or_explicit_reasoning",
            feedbackUtteranceIds: ["M4.INCORRECT.DEN"]
          },
          {
            observed: "selected C",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator",
            feedbackUtteranceIds: ["M4.INCORRECT.ADD"]
          },
          {
            observed: "selected D",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator",
            feedbackUtteranceIds: ["M4.INCORRECT.CANNOT"]
          }
        ],
        next: "M5",
        authorOnlyImplementationNotes: [
          "Known wrong options play only their item-specific feedback, then the common worked check.",
          "Option A is strong denominator-only evidence because the reasoning is explicit."
        ]
      },
      {
        id: "M5",
        stage: "final",
        family: "error",
        authorOnlyAssessmentIntent: "Correct an invalid denominator-only comparison above one while preserving fraction form and symbol direction.",
        prompt: "Correct the comparison.",
        fractions: [
          { id: "left", value: { numerator: 7, denominator: 6 }, display: "7/6" },
          { id: "right", value: { numerator: 9, denominator: 8 }, display: "9/8" }
        ],
        visual: {
          kind: "reasoning_pair",
          fractionIds: ["left", "right"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          extendsBeyondOne: true,
          accessibleDescriptionBeforeSubmit: "A student has written seven sixths is less than nine eighths and says that six is less than eight, so seven sixths is smaller. Four correction choices are shown.",
          authorOnlyNotes: [
            "Do not show twenty-fourths before lock.",
            "The fractions remain 7/6 and 9/8; no mixed-number labels appear."
          ]
        },
        response: {
          kind: "single_choice",
          options: [
            { id: "A", label: "The student is correct." },
            { id: "B", label: "7/6 > 9/8 because 28/24 > 27/24." },
            { id: "C", label: "They are equal because each numerator is one more than its denominator." },
            { id: "D", label: "Fractions above one cannot be compared." }
          ],
          submitLabel: "Submit answer"
        },
        answer: { kind: "choice", optionId: "B" },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_locked_submit",
          scored: true,
          answerLocksOnSubmit: true,
          firstAttemptOnlyForMastery: true,
          supportedSuccessCountsForMastery: false
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["M5.CORRECT"],
          incorrectDefaultUtteranceIds: ["M5.INCORRECT.DEFAULT"],
          incorrectByObservedResponse: {
            A: ["M5.INCORRECT.DEN"],
            C: ["M5.INCORRECT.EQUAL"],
            D: ["M5.INCORRECT.CANNOT"]
          },
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        workedCheck: {
          ryanUtteranceIds: ["M5.WORK.1", "M5.WORK.2", "M5.WORK.3"],
          visibleSteps: [
            "7/6 = 28/24",
            "9/8 = 27/24",
            "28 > 27, so 7/6 > 9/8."
          ],
          authorOnlyVisualReveal: [
            "Reveal consistent twenty-fourth subdivisions after lock.",
            "Highlight the single twenty-fourth difference without converting either fraction to a mixed number."
          ],
          requiresAnswerLocked: true,
          mustFollowOutcomeFeedback: true
        },
        errorSignals: [
          {
            observed: "selected A",
            family: "denominator_only",
            classificationRule: "repeat_or_explicit_reasoning",
            feedbackUtteranceIds: ["M5.INCORRECT.DEN"]
          },
          {
            observed: "selected C",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator",
            feedbackUtteranceIds: ["M5.INCORRECT.EQUAL"]
          },
          {
            observed: "selected D",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator",
            feedbackUtteranceIds: ["M5.INCORRECT.CANNOT"]
          }
        ],
        next: "FINAL_GATE",
        authorOnlyImplementationNotes: [
          "M5 supplies reasoning/application evidence and the above-one boundary check.",
          "No implementation-generated praise may be inserted around the canonical feedback or worked check."
        ]
      }
    ],
    confirmations: [
      {
        id: "C-PAIR",
        stage: "confirmation",
        family: "direct",
        authorOnlyAssessmentIntent: "Fresh no-hint pair comparison after supported pair-comparison success.",
        prompt: "Complete the comparison.",
        fractions: [
          { id: "left", value: { numerator: 5, denominator: 8 }, display: "5/8" },
          { id: "right", value: { numerator: 7, denominator: 10 }, display: "7/10" }
        ],
        visual: {
          kind: "symbolic_pair",
          fractionIds: ["left", "right"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "The fractions five eighths and seven tenths appear with a comparison-symbol control.",
          authorOnlyNotes: [
            "No hint is available.",
            "This item is unseen and not a restatement of the supported item."
          ]
        },
        response: {
          kind: "comparison_symbol",
          options: ["<", ">", "="],
          submitLabel: "Check answer"
        },
        answer: { kind: "comparison", symbol: "<" },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false,
          freshNoHintCanConfirmSupportedSuccess: true
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["C-PAIR.CORRECT"],
          incorrectDefaultUtteranceIds: ["C-PAIR.INCORRECT"],
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "wrong symbol on fresh no-hint pair",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator"
          }
        ],
        next: "RESUME_AFTER_CONFIRMATION",
        authorOnlyImplementationNotes: [
          "A correct first attempt converts the earlier supported family into confirmed independent evidence.",
          "A miss routes to the matching observed-error repair rather than another random confirmation."
        ]
      },
      {
        id: "C-SORT",
        stage: "confirmation",
        family: "sort",
        authorOnlyAssessmentIntent: "Fresh no-hint common-denominator sort after supported sort success.",
        prompt: "Order the fractions least to greatest.",
        fractions: [
          { id: "three_fifths", value: { numerator: 3, denominator: 5 }, display: "3/5" },
          { id: "seven_tenths", value: { numerator: 7, denominator: 10 }, display: "7/10" },
          { id: "five_sixths", value: { numerator: 5, denominator: 6 }, display: "5/6" }
        ],
        visual: {
          kind: "order_cards",
          fractionIds: ["three_fifths", "seven_tenths", "five_sixths"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          direction: "least_to_greatest",
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Three movable cards show three fifths, seven tenths and five sixths. The requested direction is least to greatest.",
          authorOnlyNotes: [
            "No common denominator is displayed before submission.",
            "Support keyboard reorder and move controls."
          ]
        },
        response: {
          kind: "order_cards",
          direction: "least_to_greatest",
          submitLabel: "Check answer",
          allowDrag: true,
          allowKeyboardReorder: true,
          allowMoveButtons: true
        },
        answer: {
          kind: "order",
          direction: "least_to_greatest",
          orderedFractionIds: ["three_fifths", "seven_tenths", "five_sixths"]
        },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false,
          freshNoHintCanConfirmSupportedSuccess: true
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["C-SORT.CORRECT"],
          incorrectDefaultUtteranceIds: ["C-SORT.INCORRECT"],
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "fresh no-hint sort is wrong",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator"
          }
        ],
        next: "RESUME_AFTER_CONFIRMATION",
        authorOnlyImplementationNotes: [
          "Use this after a hint that supplied a common-denominator route for ordering.",
          "Do not use if the prior support was specifically the one-half anchor; use C-BENCH instead."
        ]
      },
      {
        id: "C-BENCH",
        stage: "confirmation",
        family: "benchmark",
        authorOnlyAssessmentIntent: "Fresh no-hint sort around one half after benchmark-supported success.",
        prompt: "Order the fractions least to greatest.",
        fractions: [
          { id: "five_twelfths", value: { numerator: 5, denominator: 12 }, display: "5/12" },
          { id: "one_half", value: { numerator: 1, denominator: 2 }, display: "1/2" },
          { id: "four_sevenths", value: { numerator: 4, denominator: 7 }, display: "4/7" }
        ],
        visual: {
          kind: "order_cards",
          fractionIds: ["five_twelfths", "one_half", "four_sevenths"],
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          direction: "least_to_greatest",
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Three movable cards show five twelfths, one half and four sevenths. The requested direction is least to greatest.",
          authorOnlyNotes: [
            "One half is visible as a fraction card, not pre-positioned as an answer.",
            "No hint is available."
          ]
        },
        response: {
          kind: "order_cards",
          direction: "least_to_greatest",
          submitLabel: "Check answer",
          allowDrag: true,
          allowKeyboardReorder: true,
          allowMoveButtons: true
        },
        answer: {
          kind: "order",
          direction: "least_to_greatest",
          orderedFractionIds: ["five_twelfths", "one_half", "four_sevenths"]
        },
        policy: {
          hintPolicy: "none",
          solutionPolicy: "after_response",
          scored: true,
          answerLocksOnSubmit: false,
          firstAttemptOnlyForMastery: false,
          supportedSuccessCountsForMastery: false,
          freshNoHintCanConfirmSupportedSuccess: true
        },
        ryanBeforeSubmitUtteranceIds: [],
        feedback: {
          correctUtteranceIds: ["C-BENCH.CORRECT"],
          incorrectDefaultUtteranceIds: ["C-BENCH.INCORRECT"],
          playExactlyOneOutcomeBranch: true,
          doNotPlayDefaultAfterErrorSpecific: true
        },
        errorSignals: [
          {
            observed: "fresh no-hint benchmark sort is wrong",
            family: "unknown",
            classificationRule: "unknown_requires_fresh_discriminator"
          }
        ],
        next: "RESUME_AFTER_CONFIRMATION",
        authorOnlyImplementationNotes: [
          "Use after F2 support that explicitly supplied one half as an anchor.",
          "A correct first attempt is required before final entry."
        ]
      }
    ],
    repairs: [
      {
        id: "R-NUM",
        errorFamily: "numerator_only",
        authorOnlyTrigger: "Explicit numerator-only reasoning or repeated matching evidence across pair and ordering structures.",
        ryanUtteranceIds: ["R-NUM.1", "R-NUM.2", "R-NUM.3"],
        visual: {
          kind: "equivalent_fraction_bars",
          fractionIds: ["seven_twelfths", "three_fifths"],
          sameWholeLength: true,
          commonDenominator: 60,
          showEquivalentFormsBeforeSubmit: true,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Seven twelfths and three fifths are rewritten as thirty-five sixtieths and thirty-six sixtieths on equal-length bars.",
          authorOnlyNotes: [
            "The repair explanation is not scored.",
            "The first numerator 7 is larger than 3, but 7/12 is smaller than 3/5."
          ]
        },
        timeline: [
          {
            id: "R-NUM.CUE.RAW",
            utteranceId: "R-NUM.1",
            anchorText: "not the same size",
            authorOnlyAction: "Show 7 and 3 briefly, then reveal differently sized twelfth and fifth pieces.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-NUM.CUE.REWRITE",
            utteranceId: "R-NUM.2",
            anchorText: "thirty-five sixtieths",
            authorOnlyAction: "Repartition both identical wholes into sixtieths and reveal 35/60 and 36/60 without moving endpoints.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-NUM.CUE.FAIR",
            utteranceId: "R-NUM.3",
            anchorText: "comparison is fair",
            authorOnlyAction: "Highlight 35 and 36 and reveal 7/12 < 3/5.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        supportedQuestion: {
          id: "RN-S",
          stage: "repair",
          family: "equivalence_bridge",
          authorOnlyAssessmentIntent: "Supported practice replacing raw numerator comparison with equal-sized forty-fifth parts.",
          prompt: "Compare four fifths and seven ninths using forty-fifths.",
          fractions: [
            { id: "left", value: { numerator: 4, denominator: 5 }, display: "4/5" },
            { id: "right", value: { numerator: 7, denominator: 9 }, display: "7/9" }
          ],
          visual: {
            kind: "equivalent_fraction_bars",
            fractionIds: ["left", "right"],
            sameWholeLength: true,
            commonDenominator: 45,
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "Four fifths and seven ninths are shown with blank equivalent numerators over forty-five and a comparison-symbol control.",
            authorOnlyNotes: [
              "This interaction is supported and does not count as independent recovery evidence."
            ]
          },
          response: {
            kind: "equivalent_comparison",
            commonDenominator: 45,
            editableEquivalentNumerators: [true, true],
            comparisonOptions: ["<", ">", "="],
            submitLabel: "Check answer"
          },
          answer: {
            kind: "equivalent_comparison",
            commonDenominator: 45,
            rewrittenNumerators: [36, 35],
            symbol: ">"
          },
          policy: {
            hintPolicy: "guided",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: ["RN-S.PRE"],
          feedback: {
            correctUtteranceIds: ["RN-S.CORRECT"],
            incorrectDefaultUtteranceIds: ["RN-S.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RN-C",
          authorOnlyImplementationNotes: [
            "Reveal x9 and x5 only as guided support after the learner begins."
          ]
        },
        freshCheck: {
          id: "RN-C",
          stage: "repair",
          family: "direct",
          authorOnlyAssessmentIntent: "Fresh no-hint numerator-only recovery check.",
          prompt: "Complete the comparison.",
          fractions: [
            { id: "left", value: { numerator: 5, denominator: 7 }, display: "5/7" },
            { id: "right", value: { numerator: 3, denominator: 4 }, display: "3/4" }
          ],
          visual: {
            kind: "symbolic_pair",
            fractionIds: ["left", "right"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "The fractions five sevenths and three quarters appear with a comparison-symbol control.",
            authorOnlyNotes: ["No hint or equivalent form appears before submission."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Check answer"
          },
          answer: { kind: "comparison", symbol: "<" },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false,
            freshNoHintCanConfirmSupportedSuccess: true
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RN-C.CORRECT"],
            incorrectDefaultUtteranceIds: ["RN-C.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RETURN_TO_INTERRUPTED_ROUTE",
          authorOnlyImplementationNotes: [
            "Resume only after a correct no-hint response.",
            "Do not reuse 7/12 versus 3/5 or RN-S as recovery evidence."
          ]
        },
        returnRule: "Return to the point of interruption only after RN-C is correct without hint or support."
      },
      {
        id: "R-DEN",
        errorFamily: "denominator_only",
        authorOnlyTrigger: "Explicit denominator-only reasoning or repeated selection based on partition count.",
        ryanUtteranceIds: ["R-DEN.1", "R-DEN.2", "R-DEN.3"],
        visual: {
          kind: "fraction_bars",
          fractionIds: ["three_fifths", "three_eighths"],
          sameWholeLength: true,
          showEquivalentFormsBeforeSubmit: false,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two equal-length bars show three fifths and three eighths. Each has three selected parts, but the fifth-sized parts are wider than the eighth-sized parts.",
          authorOnlyNotes: [
            "The model makes the inverse relationship between partition count and piece size visually explicit."
          ]
        },
        timeline: [
          {
            id: "R-DEN.CUE.WHOLE",
            utteranceId: "R-DEN.1",
            anchorText: "equal pieces make the whole",
            authorOnlyAction: "Outline both identical wholes and label their 5-part and 8-part structures.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-DEN.CUE.PIECE_SIZE",
            utteranceId: "R-DEN.2",
            anchorText: "each piece is smaller",
            authorOnlyAction: "Lift one fifth and one eighth at true relative widths.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-DEN.CUE.ROUTES",
            utteranceId: "R-DEN.3",
            anchorText: "use a benchmark",
            authorOnlyAction: "Reveal compact benchmark and matched-part route cues without solving a new item.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        supportedQuestion: {
          id: "RD-S",
          stage: "repair",
          family: "benchmark",
          authorOnlyAssessmentIntent: "Supported denominator-only repair using opposite sides of one half.",
          prompt: "Use one half to compare three eighths and four sevenths.",
          fractions: [
            { id: "left", value: { numerator: 3, denominator: 8 }, display: "3/8" },
            { id: "right", value: { numerator: 4, denominator: 7 }, display: "4/7" }
          ],
          visual: {
            kind: "benchmark_bars",
            fractionIds: ["left", "right"],
            sameWholeLength: true,
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: true,
            benchmark: { numerator: 1, denominator: 2 },
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "Three eighths and four sevenths are shown with a one-half checkpoint and controls for classifying each fraction before choosing a symbol.",
            authorOnlyNotes: ["The half checkpoint is guided support."]
          },
          response: {
            kind: "benchmark_then_symbol",
            relationOptions: ["below_half", "exactly_half", "above_half"],
            comparisonOptions: ["<", ">", "="],
            submitLabel: "Check answer"
          },
          answer: {
            kind: "benchmark_comparison",
            relations: ["below_half", "above_half"],
            symbol: "<"
          },
          policy: {
            hintPolicy: "guided",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: ["RD-S.PRE"],
          feedback: {
            correctUtteranceIds: ["RD-S.CORRECT"],
            incorrectDefaultUtteranceIds: ["RD-S.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RD-C",
          authorOnlyImplementationNotes: [
            "Do not present the denominator values as direct size cues."
          ]
        },
        freshCheck: {
          id: "RD-C",
          stage: "repair",
          family: "direct",
          authorOnlyAssessmentIntent: "Fresh no-hint denominator-only recovery check.",
          prompt: "Complete the comparison.",
          fractions: [
            { id: "left", value: { numerator: 5, denominator: 12 }, display: "5/12" },
            { id: "right", value: { numerator: 4, denominator: 9 }, display: "4/9" }
          ],
          visual: {
            kind: "symbolic_pair",
            fractionIds: ["left", "right"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "The fractions five twelfths and four ninths appear with a comparison-symbol control.",
            authorOnlyNotes: ["No hint appears before submission."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Check answer"
          },
          answer: { kind: "comparison", symbol: "<" },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false,
            freshNoHintCanConfirmSupportedSuccess: true
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RD-C.CORRECT"],
            incorrectDefaultUtteranceIds: ["RD-C.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RETURN_TO_INTERRUPTED_ROUTE",
          authorOnlyImplementationNotes: [
            "A clean recovery resumes the lesson; do not replay T1-T5."
          ]
        },
        returnRule: "One explicit denominator-only claim followed by a clean RD-C recovery is sufficient to resume."
      },
      {
        id: "R-EQUIV",
        errorFamily: "inconsistent_equivalence",
        authorOnlyTrigger: "One full inconsistent rewrite, repeated one-field scaling, or equality rejection caused by invalid scaling.",
        ryanUtteranceIds: ["R-EQUIV.1", "R-EQUIV.2", "R-EQUIV.3"],
        equalityExtensionUtteranceIds: ["R-EQUIV.EQUALITY"],
        visual: {
          kind: "equivalent_fraction_bars",
          fractionIds: ["two_thirds", "three_fifths"],
          sameWholeLength: true,
          commonDenominator: 15,
          showEquivalentFormsBeforeSubmit: true,
          showBenchmarkBeforeSubmit: false,
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Two thirds is rewritten as ten fifteenths using a factor of five on top and bottom. Three fifths is rewritten as nine fifteenths using a factor of three on top and bottom.",
          authorOnlyNotes: [
            "Every endpoint remains fixed while the partitions change.",
            "The equality extension is played only when the learner rejects valid equality."
          ]
        },
        timeline: [
          {
            id: "R-EQUIV.CUE.VALUE",
            utteranceId: "R-EQUIV.1",
            anchorText: "keeps its original value",
            authorOnlyAction: "Freeze the original bar endpoints before adding fifteenth subdivisions.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-EQUIV.CUE.FACTOR",
            utteranceId: "R-EQUIV.2",
            anchorText: "also change the numerator",
            authorOnlyAction: "Show x5 on both numbers of 2/3 and x3 on both numbers of 3/5.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-EQUIV.CUE.COMPARE",
            utteranceId: "R-EQUIV.3",
            anchorText: "compare the new numerators",
            authorOnlyAction: "Reveal 10/15 > 9/15 only after both valid rewrites are complete.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        supportedQuestion: {
          id: "RE-S",
          stage: "repair",
          family: "equivalence_bridge",
          authorOnlyAssessmentIntent: "Supported practice applying one consistent factor to each fraction.",
          prompt: "Rewrite two fifths and three quarters in twentieths, then compare.",
          fractions: [
            { id: "left", value: { numerator: 2, denominator: 5 }, display: "2/5" },
            { id: "right", value: { numerator: 3, denominator: 4 }, display: "3/4" }
          ],
          visual: {
            kind: "equivalent_fraction_bars",
            fractionIds: ["left", "right"],
            sameWholeLength: true,
            commonDenominator: 20,
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "Two fifths and three quarters are shown with blank equivalent numerators over twenty and a comparison-symbol control.",
            authorOnlyNotes: ["This is supported practice, not the recovery gate."]
          },
          response: {
            kind: "equivalent_comparison",
            commonDenominator: 20,
            editableEquivalentNumerators: [true, true],
            comparisonOptions: ["<", ">", "="],
            submitLabel: "Check answer"
          },
          answer: {
            kind: "equivalent_comparison",
            commonDenominator: 20,
            rewrittenNumerators: [8, 15],
            symbol: "<"
          },
          policy: {
            hintPolicy: "guided",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: ["RE-S.PRE"],
          feedback: {
            correctUtteranceIds: ["RE-S.CORRECT"],
            incorrectDefaultUtteranceIds: ["RE-S.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RE-C",
          authorOnlyImplementationNotes: [
            "Highlight the matching top-and-bottom factor, not only the resulting numerator."
          ]
        },
        freshCheck: {
          id: "RE-C",
          stage: "repair",
          family: "direct",
          authorOnlyAssessmentIntent: "Fresh no-hint equivalence recovery check.",
          prompt: "Complete the comparison.",
          fractions: [
            { id: "left", value: { numerator: 7, denominator: 10 }, display: "7/10" },
            { id: "right", value: { numerator: 5, denominator: 8 }, display: "5/8" }
          ],
          visual: {
            kind: "symbolic_pair",
            fractionIds: ["left", "right"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "The fractions seven tenths and five eighths appear with a comparison-symbol control.",
            authorOnlyNotes: ["No hint or common denominator appears before submission."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Check answer"
          },
          answer: { kind: "comparison", symbol: ">" },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false,
            freshNoHintCanConfirmSupportedSuccess: true
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RE-C.CORRECT"],
            incorrectDefaultUtteranceIds: ["RE-C.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RETURN_TO_INTERRUPTED_ROUTE",
          authorOnlyImplementationNotes: [
            "If equality was the trigger, follow the repair with an additional fresh equality discriminator such as RF-EQ before resuming."
          ]
        },
        returnRule: "Resume after RE-C is correct without support; equality-triggered repair also requires a fresh equal-pair check."
      },
      {
        id: "R-SYMBOL",
        errorFamily: "symbol_or_order_direction",
        authorOnlyTrigger: "Repeated symbol reversal or a correct value ranking written in the opposite requested order.",
        ryanUtteranceIds: ["R-SYMBOL.1", "R-SYMBOL.2", "R-SYMBOL.3"],
        visual: {
          kind: "common_unit_order_track",
          fractionIds: ["five_sixths", "seven_ninths"],
          sameWholeLength: true,
          commonDenominator: 18,
          showEquivalentFormsBeforeSubmit: true,
          showBenchmarkBeforeSubmit: false,
          direction: "least_to_greatest",
          selectedStateUsesNonColourCue: true,
          accessibleDescriptionBeforeSubmit: "Five sixths is shown as fifteen eighteenths and seven ninths as fourteen eighteenths, with the greater-than symbol oriented toward five sixths and a separate least-to-greatest direction row.",
          authorOnlyNotes: [
            "Use a wide/open side plus labels and shape, not a colour-only cue."
          ]
        },
        timeline: [
          {
            id: "R-SYMBOL.CUE.MATCH",
            utteranceId: "R-SYMBOL.1",
            anchorText: "make the symbol match",
            authorOnlyAction: "Hold the correct size comparison and animate only the symbol rotating into the valid orientation.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-SYMBOL.CUE.OPEN",
            utteranceId: "R-SYMBOL.2",
            anchorText: "open side faces the larger fraction",
            authorOnlyAction: "Highlight the open side beside 15/18 and the point beside 14/18.",
            mustNotOccurBeforeAnchor: true
          },
          {
            id: "R-SYMBOL.CUE.ORDER",
            utteranceId: "R-SYMBOL.3",
            anchorText: "smaller values go left",
            authorOnlyAction: "Show least-to-greatest and greatest-to-least rows using the same card values in reverse order.",
            mustNotOccurBeforeAnchor: true
          }
        ],
        supportedQuestion: {
          id: "RS-S",
          stage: "repair",
          family: "direct",
          authorOnlyAssessmentIntent: "Supported symbol-orientation repair with equivalent forms already visible.",
          prompt: "Choose the correct symbol between four fifths and three quarters.",
          fractions: [
            { id: "left", value: { numerator: 4, denominator: 5 }, display: "4/5" },
            { id: "right", value: { numerator: 3, denominator: 4 }, display: "3/4" }
          ],
          visual: {
            kind: "equivalent_fraction_bars",
            fractionIds: ["left", "right"],
            sameWholeLength: true,
            commonDenominator: 20,
            showEquivalentFormsBeforeSubmit: true,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "Four fifths is shown as sixteen twentieths and three quarters as fifteen twentieths, with a comparison-symbol control.",
            authorOnlyNotes: ["The equivalent forms are deliberately supplied; only the symbol is assessed."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Check answer"
          },
          answer: { kind: "comparison", symbol: ">" },
          policy: {
            hintPolicy: "guided",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: ["RS-S.PRE"],
          feedback: {
            correctUtteranceIds: ["RS-S.CORRECT"],
            incorrectDefaultUtteranceIds: ["RS-S.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RS-C",
          authorOnlyImplementationNotes: [
            "Do not require the learner to re-solve equivalence during this focused repair."
          ]
        },
        freshCheck: {
          id: "RS-C",
          stage: "repair",
          family: "sort",
          authorOnlyAssessmentIntent: "Fresh no-hint direction recovery using a three-fraction order.",
          prompt: "Order the fractions least to greatest.",
          fractions: [
            { id: "five_eighths", value: { numerator: 5, denominator: 8 }, display: "5/8" },
            { id: "two_thirds", value: { numerator: 2, denominator: 3 }, display: "2/3" },
            { id: "three_quarters", value: { numerator: 3, denominator: 4 }, display: "3/4" }
          ],
          visual: {
            kind: "order_cards",
            fractionIds: ["five_eighths", "two_thirds", "three_quarters"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            direction: "least_to_greatest",
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "Three movable fraction cards show five eighths, two thirds and three quarters. The requested direction is least to greatest.",
            authorOnlyNotes: ["No hint is available."]
          },
          response: {
            kind: "order_cards",
            direction: "least_to_greatest",
            submitLabel: "Check answer",
            allowDrag: true,
            allowKeyboardReorder: true,
            allowMoveButtons: true
          },
          answer: {
            kind: "order",
            direction: "least_to_greatest",
            orderedFractionIds: ["five_eighths", "two_thirds", "three_quarters"]
          },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_response",
            scored: true,
            answerLocksOnSubmit: false,
            firstAttemptOnlyForMastery: false,
            supportedSuccessCountsForMastery: false,
            freshNoHintCanConfirmSupportedSuccess: true
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RS-C.CORRECT"],
            incorrectDefaultUtteranceIds: ["RS-C.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          errorSignals: [],
          next: "RETURN_TO_INTERRUPTED_ROUTE",
          authorOnlyImplementationNotes: [
            "A repeated equality refusal does not use this branch; route to R-EQUIV equality support."
          ]
        },
        returnRule: "Resume only after the learner records the correct direction on the fresh RS-C check."
      }
    ],
    recoveryProfiles: [
      {
        id: "RF1",
        family: "direct_pair_a",
        authorOnlyPurpose: "Fresh unsupported pair suitable for two-item or three-item recovery checks.",
        constraints: [
          "unseen in the current attempt",
          "positive fractions",
          "common denominator at most 60",
          "no hint",
          "worked check after answer lock"
        ],
        deterministicFallback: {
          id: "RF1",
          stage: "recovery",
          family: "direct",
          authorOnlyAssessmentIntent: "Fresh recovery pair comparison.",
          prompt: "Complete the comparison.",
          fractions: [
            { id: "left", value: { numerator: 5, denominator: 9 }, display: "5/9" },
            { id: "right", value: { numerator: 7, denominator: 12 }, display: "7/12" }
          ],
          visual: {
            kind: "symbolic_pair",
            fractionIds: ["left", "right"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "The fractions five ninths and seven twelfths appear with a comparison-symbol control.",
            authorOnlyNotes: ["No denominator or equivalent form is suggested before submit."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Submit answer"
          },
          answer: { kind: "comparison", symbol: "<" },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_locked_submit",
            scored: true,
            answerLocksOnSubmit: true,
            firstAttemptOnlyForMastery: true,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RF1.CORRECT"],
            incorrectDefaultUtteranceIds: ["RF1.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          workedCheck: {
            ryanUtteranceIds: ["RF1.WORK.1", "RF1.WORK.2"],
            visibleSteps: [
              "5/9 = 20/36",
              "7/12 = 21/36",
              "5/9 < 7/12."
            ],
            authorOnlyVisualReveal: [
              "Reveal two identical 36-part tracks after lock."
            ],
            requiresAnswerLocked: true,
            mustFollowOutcomeFeedback: true
          },
          errorSignals: [],
          next: "RECOVERY_GATE",
          authorOnlyImplementationNotes: [
            "This fallback is exact and arithmetic-light."
          ]
        }
      },
      {
        id: "RF2",
        family: "direct_pair_b",
        authorOnlyPurpose: "Second fresh unsupported pair with the opposite comparison direction.",
        constraints: [
          "unseen in the current attempt",
          "positive fractions",
          "no hint",
          "worked check after answer lock"
        ],
        deterministicFallback: {
          id: "RF2",
          stage: "recovery",
          family: "direct",
          authorOnlyAssessmentIntent: "Fresh recovery pair requiring a greater-than result.",
          prompt: "Complete the comparison.",
          fractions: [
            { id: "left", value: { numerator: 8, denominator: 9 }, display: "8/9" },
            { id: "right", value: { numerator: 5, denominator: 6 }, display: "5/6" }
          ],
          visual: {
            kind: "symbolic_pair",
            fractionIds: ["left", "right"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "The fractions eight ninths and five sixths appear with a comparison-symbol control.",
            authorOnlyNotes: ["No method is visible before submission."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Submit answer"
          },
          answer: { kind: "comparison", symbol: ">" },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_locked_submit",
            scored: true,
            answerLocksOnSubmit: true,
            firstAttemptOnlyForMastery: true,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RF2.CORRECT"],
            incorrectDefaultUtteranceIds: ["RF2.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          workedCheck: {
            ryanUtteranceIds: ["RF2.WORK.1", "RF2.WORK.2"],
            visibleSteps: [
              "8/9 = 16/18",
              "5/6 = 15/18",
              "8/9 > 5/6."
            ],
            authorOnlyVisualReveal: [
              "Reveal two identical 18-part tracks after lock."
            ],
            requiresAnswerLocked: true,
            mustFollowOutcomeFeedback: true
          },
          errorSignals: [],
          next: "RECOVERY_GATE",
          authorOnlyImplementationNotes: [
            "Use with a recovery set that needs direction variety."
          ]
        }
      },
      {
        id: "RF3",
        family: "sort",
        authorOnlyPurpose: "Fresh unsupported three-fraction ordering item for recovery evidence breadth.",
        constraints: [
          "unseen in the current attempt",
          "positive fractions",
          "three values",
          "no hint",
          "worked check after answer lock"
        ],
        deterministicFallback: {
          id: "RF3",
          stage: "recovery",
          family: "sort",
          authorOnlyAssessmentIntent: "Fresh recovery ordering item least to greatest.",
          prompt: "Order the fractions least to greatest.",
          fractions: [
            { id: "three_eighths", value: { numerator: 3, denominator: 8 }, display: "3/8" },
            { id: "seven_twelfths", value: { numerator: 7, denominator: 12 }, display: "7/12" },
            { id: "five_sixths", value: { numerator: 5, denominator: 6 }, display: "5/6" }
          ],
          visual: {
            kind: "order_cards",
            fractionIds: ["three_eighths", "seven_twelfths", "five_sixths"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            direction: "least_to_greatest",
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "Three movable cards show three eighths, seven twelfths and five sixths. The requested direction is least to greatest.",
            authorOnlyNotes: [
              "Support drag, keyboard reorder and move-left/move-right controls."
            ]
          },
          response: {
            kind: "order_cards",
            direction: "least_to_greatest",
            submitLabel: "Submit order",
            allowDrag: true,
            allowKeyboardReorder: true,
            allowMoveButtons: true
          },
          answer: {
            kind: "order",
            direction: "least_to_greatest",
            orderedFractionIds: ["three_eighths", "seven_twelfths", "five_sixths"]
          },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_locked_submit",
            scored: true,
            answerLocksOnSubmit: true,
            firstAttemptOnlyForMastery: true,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RF3.CORRECT"],
            incorrectDefaultUtteranceIds: ["RF3.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          workedCheck: {
            ryanUtteranceIds: ["RF3.WORK.1", "RF3.WORK.2"],
            visibleSteps: [
              "3/8 = 9/24",
              "7/12 = 14/24",
              "5/6 = 20/24",
              "3/8 < 7/12 < 5/6."
            ],
            authorOnlyVisualReveal: [
              "Reveal three identical 24-part tracks after lock."
            ],
            requiresAnswerLocked: true,
            mustFollowOutcomeFeedback: true
          },
          errorSignals: [],
          next: "RECOVERY_GATE",
          authorOnlyImplementationNotes: [
            "The submitted card order is locked before any tracks appear."
          ]
        }
      },
      {
        id: "RF-EQ",
        family: "equality",
        authorOnlyPurpose: "Fresh equality discriminator following equality rejection or equivalence repair.",
        constraints: [
          "unseen in the current attempt",
          "different denominators",
          "equal exact values",
          "no hint"
        ],
        deterministicFallback: {
          id: "RF-EQ",
          stage: "recovery",
          family: "visual",
          authorOnlyAssessmentIntent: "Fresh unsupported equality comparison.",
          prompt: "Complete the comparison.",
          fractions: [
            { id: "left", value: { numerator: 10, denominator: 15 }, display: "10/15" },
            { id: "right", value: { numerator: 2, denominator: 3 }, display: "2/3" }
          ],
          visual: {
            kind: "symbolic_pair",
            fractionIds: ["left", "right"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "The fractions ten fifteenths and two thirds appear with a comparison-symbol control.",
            authorOnlyNotes: ["Do not show the simplification before lock."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Submit answer"
          },
          answer: { kind: "comparison", symbol: "=" },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_locked_submit",
            scored: true,
            answerLocksOnSubmit: true,
            firstAttemptOnlyForMastery: true,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RF-EQ.CORRECT"],
            incorrectDefaultUtteranceIds: ["RF-EQ.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          workedCheck: {
            ryanUtteranceIds: ["RF-EQ.WORK"],
            visibleSteps: ["10/15 = 2/3", "10/15 = 2/3."],
            authorOnlyVisualReveal: [
              "Reveal a value-preserving simplification or aligned endpoint after lock."
            ],
            requiresAnswerLocked: true,
            mustFollowOutcomeFeedback: true
          },
          errorSignals: [],
          next: "RECOVERY_GATE",
          authorOnlyImplementationNotes: [
            "Use this after equality-specific R-EQUIV support."
          ]
        }
      },
      {
        id: "RF-B",
        family: "benchmark",
        authorOnlyPurpose: "Fresh unsupported benchmark comparison for recovery evidence breadth.",
        constraints: [
          "unseen in the current attempt",
          "fractions lie on opposite sides of one half",
          "no hint"
        ],
        deterministicFallback: {
          id: "RF-B",
          stage: "recovery",
          family: "benchmark",
          authorOnlyAssessmentIntent: "Fresh unsupported comparison settled exactly by one half.",
          prompt: "Complete the comparison.",
          fractions: [
            { id: "left", value: { numerator: 4, denominator: 9 }, display: "4/9" },
            { id: "right", value: { numerator: 7, denominator: 12 }, display: "7/12" }
          ],
          visual: {
            kind: "symbolic_pair",
            fractionIds: ["left", "right"],
            showEquivalentFormsBeforeSubmit: false,
            showBenchmarkBeforeSubmit: false,
            selectedStateUsesNonColourCue: true,
            accessibleDescriptionBeforeSubmit: "The fractions four ninths and seven twelfths appear with a comparison-symbol control.",
            authorOnlyNotes: ["The one-half marker is not shown before lock."]
          },
          response: {
            kind: "comparison_symbol",
            options: ["<", ">", "="],
            submitLabel: "Submit answer"
          },
          answer: { kind: "comparison", symbol: "<" },
          policy: {
            hintPolicy: "none",
            solutionPolicy: "after_locked_submit",
            scored: true,
            answerLocksOnSubmit: true,
            firstAttemptOnlyForMastery: true,
            supportedSuccessCountsForMastery: false
          },
          ryanBeforeSubmitUtteranceIds: [],
          feedback: {
            correctUtteranceIds: ["RF-B.CORRECT"],
            incorrectDefaultUtteranceIds: ["RF-B.INCORRECT"],
            playExactlyOneOutcomeBranch: true,
            doNotPlayDefaultAfterErrorSpecific: true
          },
          workedCheck: {
            ryanUtteranceIds: ["RF-B.WORK.1", "RF-B.WORK.2"],
            visibleSteps: [
              "4/9 < 1/2",
              "7/12 > 1/2",
              "4/9 < 7/12."
            ],
            authorOnlyVisualReveal: [
              "Reveal one-half markers and opposite-side endpoints after lock."
            ],
            requiresAnswerLocked: true,
            mustFollowOutcomeFeedback: true
          },
          errorSignals: [],
          next: "RECOVERY_GATE",
          authorOnlyImplementationNotes: [
            "This item may satisfy reasoning breadth in a recovery set."
          ]
        }
      }
    ],
    routing: {
      coreSequence: [
        "HOOK",
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "HANDOFF",
        "G1",
        "G2",
        "GUIDED_GATE",
        "F1_OR_SKIP",
        "F2",
        "I1",
        "I2",
        "INDEPENDENT_GATE",
        "M1",
        "M2",
        "M3",
        "M4",
        "M5",
        "FINAL_GATE"
      ],
      guidedGate: {
        strongEvidenceRequires: [
          "G1 first-attempt correct",
          "G2 first-attempt correct",
          "no hint or support reveal",
          "no support escalation",
          "no unresolved central misconception"
        ],
        strongRoute: ["skip F1", "show F2"],
        standardRoute: ["show F1", "show F2"],
        forbiddenSignals: [
          "response speed",
          "confidence click",
          "voice tone",
          "hook prediction"
        ],
        rationale: "F1 repeats the equivalence-to-comparison bridge; F2 is retained because three-fraction ordering is a distinct family."
      },
      independentGate: {
        cleanEvidenceRequires: [
          "correct without hint",
          "no unresolved repeated error",
          "no support escalation on the accepted response"
        ],
        hintAssistedRoutes: {
          pair_comparison: "C-PAIR",
          common_denominator_sort: "C-SORT",
          benchmark_sort: "C-BENCH"
        },
        repeatedErrorRoutes: {
          numerator_only: "R-NUM",
          denominator_only: "R-DEN",
          inconsistent_equivalence: "R-EQUIV",
          equality_rejected: "R-EQUIV plus equality extension and RF-EQ",
          symbol_or_order_direction: "R-SYMBOL",
          fact_slip: "Brief number-fact correction plus a fresh fact-light item; do not classify as a concept error from one slip.",
          unknown: "Use a fresh discriminating item. Never invent hidden reasoning."
        },
        supportedSuccessRule: "A correct response after opening a hint is supported success and must be followed by one fresh no-hint item from the same family before final entry."
      },
      finalGate: {
        primaryFinalIds: ["M1", "M2", "M3", "M4", "M5"],
        scoreUses: "Committed first-attempt responses before any worked check is revealed.",
        routes: {
          four_or_five_correct: "Finish only if procedural and reasoning/application breadth is present and no blocking misconception repeats.",
          three_correct: "Repair the missed family, then give a fresh two-item mini-check. Require two of two independently.",
          zero_to_two_correct: "Repair the actual weaknesses, then give a fresh three-item final. Require three of three independently and no repeated blocker."
        },
        recoveryPoolIds: ["RF1", "RF2", "RF3", "RF-EQ", "RF-B"],
        recoverySelectionRules: [
          "Every recovery item is unseen in the current attempt.",
          "Choose items that test the repaired family and preserve evidence breadth.",
          "Do not repeat the just-explained or supported repair item.",
          "Do not count supported responses toward the final gate."
        ]
      },
      completion: {
        ryanUtteranceIds: ["COMPLETION"],
        currentSessionOnly: true,
        doesNotChooseGlobalPlacement: true,
        doesNotScheduleRetrieval: true
      }
    },
    mastery: {
      primaryRule: "At least 4 of 5 first-attempt independent final responses, including direct procedure and at least one visual, reasoning or error-analysis family, with no blocking FRA16 misconception twice.",
      primaryEvidenceFamilies: {
        M1: "direct procedure",
        M2: "visual equality",
        M3: "multi-fraction order",
        M4: "benchmark reasoning",
        M5: "error analysis above one"
      },
      recoveryRules: {
        after_three_of_five: "Targeted repair followed by two fresh unsupported items; require 2/2.",
        after_zero_to_two_of_five: "Targeted repair followed by three fresh unsupported items; require 3/3 and no repeated blocker."
      },
      supportedResponsesDoNotCount: true,
      guidedResponsesDoNotCertifyCompletion: true,
      workedChecksNeverCountAsAttempts: true,
      repeatedBlockingFamilies: [
        "numerator_only",
        "denominator_only",
        "inconsistent_equivalence",
        "symbol_or_order_direction",
        "equality_rejected"
      ]
    },
    evidenceContract: {
      record: [
        "questionId",
        "firstAttemptCorrect",
        "attempts",
        "hintOpenedBeforeSubmit",
        "supportEscalated",
        "answerLocked",
        "committed response",
        "observable wrong response",
        "possible error family",
        "confirmed error family",
        "fresh confirmation result",
        "whether the response counts as independent evidence"
      ],
      inferenceSafeguards: [
        "Record observable behaviour before assigning a family.",
        "Do not say the learner thought something unless they explicitly state it.",
        "One unexplained wrong answer is normally ambiguous.",
        "A complete inconsistent equivalent rewrite is strong equivalence evidence.",
        "An explicit denominator-only or numerator-only explanation is strong evidence.",
        "A correct method with one multiplication slip is not automatically a concept error."
      ]
    },
    engineeringAcceptance: {
      runtimeCopyBoundary: [
        "Only FRA16_RUNTIME_COPY[id].text reaches Ryan TTS or Ryan captions.",
        "No captionText field or separately authored Ryan caption string exists.",
        "Question prompts, options, hints, stage labels, route codes and author-only prose are never automatically voiced.",
        "Every runtime utterance has a stable ID, learner audience, Ryan speaker, role, communication goal and same-as-audio caption source."
      ],
      audioCaptionCueParity: [
        "Audio, captions and visual cues resolve the same utterance ID.",
        "Every cue anchor is an exact phrase contained in its utterance.",
        "Pause, replay, skip, resume and refresh restore matching utterance, caption position and mathematical visual state.",
        "Removing or changing an utterance without remapping its cues fails validation.",
        "No orphan highlight, stale caption or cue attached to unsaid text remains."
      ],
      outcomeBranching: [
        "The hook plays distinct Blue, Orange, Same and Not sure first responses before convergence.",
        "Every scored item computes correctness before selecting feedback.",
        "Exactly one outcome branch plays: correct, matching error-specific incorrect, or default incorrect.",
        "Wrong responses never play correct-response lines.",
        "Final correct and incorrect feedback is item-specific; no repeated generic line replaces it."
      ],
      semanticRepetition: [
        "No exact duplicate Ryan sentence exists in FRA16_RUNTIME_COPY.",
        "Read every route aloud; each consecutive line must add a new function.",
        "Do not add generated praise before or after canonical feedback.",
        "Worked checks carry the mathematical explanation after outcome feedback; outcome feedback must not redundantly restate the entire solution."
      ],
      dataIntegrity: [
        "One question object drives wording, fractions, visual geometry, answer, hint, feedback, working and accessible description.",
        "Every denominator is a positive integer.",
        "Every authored common denominator divides each source denominator and is at most 60.",
        "Every equivalent numerator is derived with the same factor used on its denominator.",
        "Ordered answers are validated by exact rational value and requested direction.",
        "Equivalent forms are recognised as equal where appropriate.",
        "No final worked check renders unless answerLocked is true."
      ],
      leakage: [
        "Scored Ryan narration never names the deciding equivalent numerator, benchmark result, symbol or order before submit.",
        "Hints start collapsed and do not state the final symbol or sequence.",
        "Final items have no hint, no working and no answer-revealing animation before lock.",
        "Accessible descriptions expose the given structure but not the mathematical conclusion.",
        "No solved duplicate remains visible beside a scored item."
      ],
      mathematicalVisualQA: [
        "All compared whole bars have identical whole length.",
        "Segment counts, selected counts, labels and equivalent forms match the underlying fraction data.",
        "5/8 becomes 15/24 and 2/3 becomes 16/24 without moving either endpoint.",
        "4/9 lies below one half and 5/8 lies above one half.",
        "7/12, 5/8 and 3/4 become 14/24, 15/24 and 18/24.",
        "7/6 and 9/8 become 28/24 and 27/24 while remaining in fraction form.",
        "M1 uses 32/56 and 35/56.",
        "M2 renders 6 of 8 and 9 of 12 with identical whole lengths and no pre-lock equality cue.",
        "M3 uses 24/60, 35/60 and 45/60.",
        "All comparison symbols and least/greatest labels are correct."
      ],
      routeTests: [
        "Strong guided route skips F1 but retains F2.",
        "Standard guided route includes F1 then F2.",
        "Hint-assisted pair success inserts C-PAIR.",
        "Hint-assisted common-denominator sort inserts C-SORT.",
        "Hint-assisted benchmark sort inserts C-BENCH.",
        "Confirmed numerator-only evidence routes R-NUM to RN-S then RN-C.",
        "Confirmed denominator-only evidence routes R-DEN to RD-S then RD-C.",
        "Inconsistent equivalence routes R-EQUIV to RE-S then RE-C.",
        "Repeated symbol/order reversal routes R-SYMBOL to RS-S then RS-C.",
        "Equality rejection receives the R-EQUIV equality extension plus a fresh equality check.",
        "4-5/5, 3/5 and 0-2/5 final routes behave exactly as authored.",
        "Recovery items are fresh, unsupported and selected from the approved pool."
      ],
      responsiveAccessibility: [
        "Manually inspect desktop and approximately 390px mobile layouts.",
        "The central mathematical relation remains dominant.",
        "On mobile, fraction cards stack or wrap without changing their mathematical order or values.",
        "Captions move above or below the maths and never cover fractions, bars, symbols or controls.",
        "Drag ordering has keyboard reorder and move-left/move-right alternatives.",
        "Touch targets are at least the project minimum and controls have visible focus.",
        "Selected and completed states use outline, shape, text or texture as well as colour.",
        "Reduced motion presents the same exact before/after mathematical states.",
        "Screen-reader descriptions give equivalent task information without solving scored items.",
        "Feedback and newly revealed working are announced without unpredictable focus movement."
      ],
      persistence: [
        "Persist FRA16 contentVersion with the lesson state.",
        "If an incompatible prior FRA16 placeholder or draft state exists, migrate or reset only FRA16 state safely.",
        "Resume restores scene/question ID, committed response, answer lock, active utterance, caption position, cue state, evidence and route decision.",
        "Never preserve stale draft narration or cue indices as an invisible fallback."
      ],
      regression: [
        "FRA01-FRA15 lesson content and routes remain unchanged.",
        "FRA17+ lesson content remains unchanged.",
        "Any shared fraction-bar, ordering, TTS, caption or answer-lock change is minimal, backwards-compatible and listed in the completion report.",
        "No global Diagnostic layer is added.",
        "No Retrieval or spaced-review layer is added.",
        "No parallel FRA16 app or lesson engine is created."
      ],
      manualRouteQA: [
        "hook Blue choice",
        "hook Orange choice",
        "hook Same choice",
        "hook Not sure choice",
        "strong route",
        "standard route",
        "pair hint then C-PAIR",
        "sort hint then C-SORT",
        "benchmark hint then C-BENCH",
        "R-NUM route and return",
        "R-DEN route and return",
        "R-EQUIV route and equality extension",
        "R-SYMBOL route and return",
        "every M1-M5 correct branch",
        "every known M1-M5 incorrect branch",
        "3/5 recovery route",
        "0-2/5 recovery route",
        "refresh/resume during narration, feedback and locked worked check",
        "desktop and 390px mobile",
        "keyboard-only and reduced-motion use"
      ]
    },
    canonicalStatusRule: "This package is an implementation candidate. Mark FRA16 CANONICAL / REFERENCE only after repository implementation, automated tests, manual route QA, owner review and all regression checks pass. Do not claim real-student calibration unless it has occurred."
  };
  function routeAfterGuided(params) {
    if (params.g1FirstAttemptCorrect && params.g2FirstAttemptCorrect && !params.supportEscalated && !params.unresolvedCentralMisconception) {
      return "fast_skip_f1_keep_f2";
    }
    return "standard_f1_then_f2";
  }
  function routeFinalCheck(params) {
    if (params.correctCount >= 4 && params.hasProceduralEvidence && params.hasReasoningOrApplicationEvidence && !params.repeatedBlockingMisconception) {
      return "finish_candidate";
    }
    if (params.correctCount === 3) {
      return "targeted_repair_then_fresh_two_item_check";
    }
    return "targeted_repair_then_fresh_three_item_final";
  }
  function getHookResponseSequence(optionId) {
    const hook = FRA16.teachingScenes.find(
      (scene) => scene.id === "HOOK"
    );
    if (!hook) throw new Error("FRA16 HOOK scene is missing.");
    const branch = hook.interaction.feedbackByOption[optionId];
    if (!branch) throw new Error(`Unknown FRA16 hook option ${optionId}.`);
    return [...branch.ryanUtteranceIds];
  }
  function getAllQuestionLikeSpecs() {
    const core = [...FRA16.questions];
    const confirmations = [...FRA16.confirmations];
    const repairQuestions = FRA16.repairs.flatMap((repair) => [
      repair.supportedQuestion,
      repair.freshCheck
    ]);
    const recovery = FRA16.recoveryProfiles.map(
      (profile) => profile.deterministicFallback
    );
    return [
      ...core,
      ...confirmations,
      ...repairQuestions,
      ...recovery
    ];
  }
  function getQuestionById(id) {
    return getAllQuestionLikeSpecs().find((question) => question.id === id);
  }
  function getOutcomeUtteranceIds(params) {
    const question = getQuestionById(params.questionId);
    if (!question) throw new Error(`Unknown FRA16 question ${params.questionId}.`);
    if (params.isCorrect) {
      return [...question.feedback.correctUtteranceIds];
    }
    if (params.observedResponseKey && question.feedback.incorrectByObservedResponse?.[params.observedResponseKey]) {
      return [
        ...question.feedback.incorrectByObservedResponse[params.observedResponseKey]
      ];
    }
    return [...question.feedback.incorrectDefaultUtteranceIds];
  }
  var BANNED_RUNTIME_PATTERNS = [
    /author[- ]only/i,
    /implementation/i,
    /codex/i,
    /runtime copy/i,
    /assessment intent/i,
    /route label/i,
    /timeline cue/i,
    /scored item/i,
    /pedagog(?:y|ical)/i,
    /diagnostic layer/i,
    /retrieval layer/i,
    /strip away the story/i
  ];
  function collectObjects(value, out) {
    if (Array.isArray(value)) {
      value.forEach((item) => collectObjects(item, out));
      return;
    }
    if (!value || typeof value !== "object") return;
    out.push(value);
    Object.values(value).forEach(
      (child) => collectObjects(child, out)
    );
  }
  function collectRuntimeIdArrays(value, path, out) {
    if (Array.isArray(value)) {
      value.forEach(
        (item, index) => collectRuntimeIdArrays(item, `${path}[${index}]`, out)
      );
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key;
      if (key.toLowerCase().includes("utteranceids") && Array.isArray(child) && child.every((item) => typeof item === "string")) {
        out.push({ path: childPath, ids: child });
      }
      collectRuntimeIdArrays(child, childPath, out);
    }
  }
  function validateFractionValue(value, path, errors) {
    if (!Number.isInteger(value.numerator) || value.numerator <= 0) {
      errors.push(`${path} numerator must be a positive integer.`);
    }
    if (!Number.isInteger(value.denominator) || value.denominator <= 0) {
      errors.push(`${path} denominator must be a positive integer.`);
    }
    if (value.denominator > FRA16.scope.authoredEnvelope.laterDenominatorMaximum) {
      errors.push(
        `${path} denominator ${value.denominator} exceeds the authored maximum.`
      );
    }
  }
  function validateQuestionMath(question) {
    const errors = [];
    const fractionsById = new Map(
      question.fractions.map((item) => [item.id, item.value])
    );
    question.fractions.forEach(
      (item, index) => validateFractionValue(item.value, `${question.id}.fractions[${index}]`, errors)
    );
    const fractionIds = question.fractions.map((item) => item.id);
    const visualIds = [...question.visual.fractionIds];
    if (visualIds.length !== fractionIds.length || visualIds.some((id) => !fractionsById.has(id))) {
      errors.push(`${question.id} visual fraction IDs do not match its data.`);
    }
    if (question.visual.commonDenominator !== void 0) {
      const common = question.visual.commonDenominator;
      if (!Number.isInteger(common) || common <= 0 || common > 60) {
        errors.push(`${question.id} has an invalid visual common denominator.`);
      }
      for (const item of question.fractions) {
        if (common % item.value.denominator !== 0) {
          errors.push(
            `${question.id} common denominator ${common} is not divisible by ${item.value.denominator}.`
          );
        }
      }
    }
    const answer = question.answer;
    if (answer.kind === "comparison") {
      if (question.fractions.length !== 2) {
        errors.push(`${question.id} comparison answer requires exactly two fractions.`);
      } else {
        const expected = compareFractions(
          question.fractions[0].value,
          question.fractions[1].value
        );
        if (answer.symbol !== expected) {
          errors.push(
            `${question.id} answer ${answer.symbol} does not match exact comparison ${expected}.`
          );
        }
      }
    }
    if (answer.kind === "equivalent_comparison") {
      if (question.fractions.length !== 2) {
        errors.push(
          `${question.id} equivalent comparison requires exactly two fractions.`
        );
      } else {
        if (!Number.isInteger(answer.commonDenominator) || answer.commonDenominator <= 0 || answer.commonDenominator > 60) {
          errors.push(`${question.id} answer common denominator is invalid.`);
        }
        question.fractions.forEach((item, index) => {
          if (answer.commonDenominator % item.value.denominator !== 0) {
            errors.push(
              `${question.id} answer common denominator is not valid for ${item.display}.`
            );
            return;
          }
          const expectedNumerator = equivalentNumerator(
            item.value,
            answer.commonDenominator
          );
          if (answer.rewrittenNumerators[index] !== expectedNumerator) {
            errors.push(
              `${question.id} rewritten numerator ${answer.rewrittenNumerators[index]} should be ${expectedNumerator}.`
            );
          }
        });
        const expectedSymbol = compareFractions(
          question.fractions[0].value,
          question.fractions[1].value
        );
        if (answer.symbol !== expectedSymbol) {
          errors.push(`${question.id} equivalent-comparison symbol is incorrect.`);
        }
      }
    }
    if (answer.kind === "benchmark_comparison") {
      if (question.fractions.length !== 2) {
        errors.push(
          `${question.id} benchmark comparison requires exactly two fractions.`
        );
      } else {
        const expectedRelations = question.fractions.map(
          (item) => relationToHalf(item.value)
        );
        if (answer.relations[0] !== expectedRelations[0] || answer.relations[1] !== expectedRelations[1]) {
          errors.push(`${question.id} half-benchmark classification is incorrect.`);
        }
        const expectedSymbol = compareFractions(
          question.fractions[0].value,
          question.fractions[1].value
        );
        if (answer.symbol !== expectedSymbol) {
          errors.push(`${question.id} benchmark-comparison symbol is incorrect.`);
        }
      }
    }
    if (answer.kind === "order") {
      const expected = orderFractionIds(
        question.fractions,
        answer.direction
      );
      if (expected.length !== answer.orderedFractionIds.length || expected.some((id, index) => id !== answer.orderedFractionIds[index])) {
        errors.push(
          `${question.id} order ${answer.orderedFractionIds.join(",")} should be ${expected.join(",")}.`
        );
      }
    }
    if (answer.kind === "choice") {
      if (question.response.kind !== "single_choice") {
        errors.push(`${question.id} choice answer requires a single-choice response.`);
      } else if (!question.response.options.some((option) => option.id === answer.optionId)) {
        errors.push(`${question.id} answer option ${answer.optionId} is missing.`);
      }
      const knownChoiceAnswers = { M4: "B", M5: "B" };
      if (knownChoiceAnswers[question.id] && answer.optionId !== knownChoiceAnswers[question.id]) {
        errors.push(`${question.id} authored reasoning answer must be B.`);
      }
    }
    if (question.policy.hintPolicy === "none" && question.hint !== void 0) {
      errors.push(`${question.id} has hint text despite hintPolicy none.`);
    }
    if (question.policy.hintPolicy === "optional" && !question.hint) {
      errors.push(`${question.id} optional hint policy requires authored hint text.`);
    }
    if (question.stage === "final" || question.stage === "recovery") {
      if (question.policy.hintPolicy !== "none") {
        errors.push(`${question.id} final/recovery item must have no hint.`);
      }
      if (question.policy.solutionPolicy !== "after_locked_submit") {
        errors.push(`${question.id} final/recovery solution must wait for lock.`);
      }
      if (!question.policy.answerLocksOnSubmit) {
        errors.push(`${question.id} final/recovery answer must lock on submit.`);
      }
      if (!question.workedCheck?.requiresAnswerLocked) {
        errors.push(`${question.id} final/recovery worked check must require lock.`);
      }
    }
    const correctText = question.feedback.correctUtteranceIds.map((id) => FRA16_RUNTIME_COPY[id]?.text).join(" ");
    const incorrectText = question.feedback.incorrectDefaultUtteranceIds.map((id) => FRA16_RUNTIME_COPY[id]?.text).join(" ");
    if (!correctText || !incorrectText) {
      errors.push(`${question.id} is missing outcome feedback text.`);
    } else if (correctText === incorrectText) {
      errors.push(`${question.id} correct and incorrect feedback are identical.`);
    }
    if (!question.feedback.playExactlyOneOutcomeBranch) {
      errors.push(`${question.id} must play exactly one outcome branch.`);
    }
    return errors;
  }
  function validateFRA16CanonicalSpec() {
    const errors = [];
    const registry = FRA16_RUNTIME_COPY;
    const seenRuntimeTexts = /* @__PURE__ */ new Map();
    for (const [id, utterance] of Object.entries(registry)) {
      if (utterance.audience !== "learner") {
        errors.push(`${id} is not marked learner-facing.`);
      }
      if (utterance.spokenBy !== "Ryan") {
        errors.push(`${id} must be spoken by Ryan.`);
      }
      if (utterance.captionSource !== "same_as_audio") {
        errors.push(`${id} captionSource must be same_as_audio.`);
      }
      const text = utterance.text.trim();
      if (!text) errors.push(`${id} has empty runtime text.`);
      for (const pattern of BANNED_RUNTIME_PATTERNS) {
        if (pattern.test(text)) {
          errors.push(`${id} contains banned authoring/engineering language.`);
        }
      }
      const normalized = text.toLowerCase().replace(/\s+/g, " ");
      const previous = seenRuntimeTexts.get(normalized);
      if (previous) {
        errors.push(`${id} duplicates the exact runtime sentence in ${previous}.`);
      } else {
        seenRuntimeTexts.set(normalized, id);
      }
    }
    const arrays = [];
    collectRuntimeIdArrays(FRA16, "FRA16", arrays);
    const referencedIds = /* @__PURE__ */ new Set();
    for (const { path, ids } of arrays) {
      for (const id of ids) {
        referencedIds.add(id);
        if (!registry[id]) errors.push(`${path} references missing utterance ${id}.`);
      }
    }
    for (const scene of FRA16.teachingScenes) {
      for (const cue of scene.timeline ?? []) {
        referencedIds.add(cue.utteranceId);
      }
    }
    for (const repair of FRA16.repairs) {
      for (const cue of repair.timeline ?? []) referencedIds.add(cue.utteranceId);
    }
    for (const id of Object.keys(registry)) {
      if (!referencedIds.has(id)) {
        errors.push(`Unreferenced runtime utterance ${id}.`);
      }
    }
    const allObjects = [];
    collectObjects(FRA16, allObjects);
    for (const object of allObjects) {
      if (Object.prototype.hasOwnProperty.call(object, "captionText")) {
        errors.push(
          "captionText is forbidden; derive captions from runtime utterance text."
        );
      }
    }
    const cueOwners = [
      ...FRA16.teachingScenes,
      ...FRA16.repairs
    ];
    const cueIds = /* @__PURE__ */ new Set();
    for (const owner of cueOwners) {
      for (const cue of owner.timeline ?? []) {
        if (cueIds.has(cue.id)) errors.push(`Duplicate cue ID ${cue.id}.`);
        cueIds.add(cue.id);
        const utterance = registry[cue.utteranceId];
        if (!utterance) {
          errors.push(`${cue.id} points to missing utterance ${cue.utteranceId}.`);
          continue;
        }
        if (!utterance.text.toLowerCase().includes(cue.anchorText.toLowerCase())) {
          errors.push(
            `${cue.id} anchor "${cue.anchorText}" is not present in ${cue.utteranceId}.`
          );
        }
        if (cue.mustNotOccurBeforeAnchor !== true) {
          errors.push(`${cue.id} must be speech-led.`);
        }
      }
    }
    const hook = FRA16.teachingScenes.find(
      (scene) => scene.id === "HOOK"
    );
    if (!hook?.interaction) {
      errors.push("FRA16 HOOK interaction is missing.");
    } else {
      const branches = hook.interaction.feedbackByOption;
      const expectedOutcomes = {
        blue: "incorrect",
        orange: "correct",
        same: "incorrect",
        not_sure: "neutral"
      };
      const firstTexts = [];
      for (const [optionId, expectedOutcome] of Object.entries(expectedOutcomes)) {
        const branch = branches[optionId];
        if (!branch) {
          errors.push(`HOOK branch ${optionId} is missing.`);
          continue;
        }
        if (branch.outcome !== expectedOutcome) {
          errors.push(
            `HOOK ${optionId} outcome must be ${expectedOutcome}, not ${branch.outcome}.`
          );
        }
        const text = branch.ryanUtteranceIds.map((id) => registry[id]?.text).join(" ");
        if (!text) errors.push(`HOOK ${optionId} has no feedback text.`);
        firstTexts.push(text);
      }
      if (new Set(firstTexts).size !== firstTexts.length) {
        errors.push("HOOK first-response feedback must be distinct by option.");
      }
      if (hook.interaction.convergeOnlyAfterBranchFeedback !== true) {
        errors.push("HOOK may converge only after branch-specific feedback.");
      }
      if (hook.interaction.answerAffectsMasteryEvidence !== false) {
        errors.push("HOOK prediction must not affect mastery evidence.");
      }
    }
    const allQuestions = getAllQuestionLikeSpecs();
    const questionIds = /* @__PURE__ */ new Set();
    for (const question of allQuestions) {
      if (questionIds.has(question.id)) {
        errors.push(`Duplicate question ID ${question.id}.`);
      }
      questionIds.add(question.id);
      errors.push(...validateQuestionMath(question));
    }
    const coreFinals = FRA16.questions.filter(
      (question) => question.stage === "final"
    );
    const finalIds = coreFinals.map((question) => question.id);
    const expectedFinalIds = ["M1", "M2", "M3", "M4", "M5"];
    if (finalIds.length !== expectedFinalIds.length || finalIds.some((id, index) => id !== expectedFinalIds[index])) {
      errors.push("Primary final must be exactly M1-M5 in order.");
    }
    const finalFeedbackTexts = [];
    for (const question of coreFinals) {
      for (const branch of [
        question.feedback.correctUtteranceIds,
        question.feedback.incorrectDefaultUtteranceIds
      ]) {
        finalFeedbackTexts.push(
          branch.map((id) => registry[id]?.text).join(" ").toLowerCase()
        );
      }
    }
    if (new Set(finalFeedbackTexts).size !== finalFeedbackTexts.length) {
      errors.push("Primary final items reuse identical outcome feedback.");
    }
    const coreSignatures = new Set(
      FRA16.questions.map(
        (question) => question.fractions.map((item) => fractionKey(item.value)).sort().join("|")
      )
    );
    const recoveryIds = /* @__PURE__ */ new Set();
    for (const profile of FRA16.recoveryProfiles) {
      const question = profile.deterministicFallback;
      if (recoveryIds.has(question.id)) {
        errors.push(`Duplicate recovery question ${question.id}.`);
      }
      recoveryIds.add(question.id);
      const signature = question.fractions.map((item) => fractionKey(item.value)).sort().join("|");
      if (coreSignatures.has(signature)) {
        errors.push(`${question.id} duplicates a core-route fraction set.`);
      }
    }
    const expectedRecoveryIds = ["RF1", "RF2", "RF3", "RF-EQ", "RF-B"];
    if (expectedRecoveryIds.some((id) => !recoveryIds.has(id)) || recoveryIds.size !== expectedRecoveryIds.length) {
      errors.push("Recovery pool must contain RF1, RF2, RF3, RF-EQ and RF-B.");
    }
    const keyChecks = [
      ["T2 5/8 -> 15/24", equivalentNumerator({ numerator: 5, denominator: 8 }, 24) === 15],
      ["T2 2/3 -> 16/24", equivalentNumerator({ numerator: 2, denominator: 3 }, 24) === 16],
      ["T4 7/12 -> 14/24", equivalentNumerator({ numerator: 7, denominator: 12 }, 24) === 14],
      ["T4 5/8 -> 15/24", equivalentNumerator({ numerator: 5, denominator: 8 }, 24) === 15],
      ["T4 3/4 -> 18/24", equivalentNumerator({ numerator: 3, denominator: 4 }, 24) === 18],
      ["T5 7/6 -> 28/24", equivalentNumerator({ numerator: 7, denominator: 6 }, 24) === 28],
      ["T5 9/8 -> 27/24", equivalentNumerator({ numerator: 9, denominator: 8 }, 24) === 27],
      ["M1 exact order", compareFractions({ numerator: 4, denominator: 7 }, { numerator: 5, denominator: 8 }) === "<"],
      ["M2 equality", compareFractions({ numerator: 6, denominator: 8 }, { numerator: 9, denominator: 12 }) === "="],
      ["M4 half split", relationToHalf({ numerator: 4, denominator: 9 }) === "below_half" && relationToHalf({ numerator: 5, denominator: 8 }) === "above_half"],
      ["M5 above-one order", compareFractions({ numerator: 7, denominator: 6 }, { numerator: 9, denominator: 8 }) === ">"]
    ];
    for (const [label, passes] of keyChecks) {
      if (!passes) errors.push(`Key arithmetic invariant failed: ${label}.`);
    }
    if (routeAfterGuided({
      g1FirstAttemptCorrect: true,
      g2FirstAttemptCorrect: true,
      supportEscalated: false,
      unresolvedCentralMisconception: false
    }) !== "fast_skip_f1_keep_f2") {
      errors.push("Strong guided route helper is incorrect.");
    }
    if (routeAfterGuided({
      g1FirstAttemptCorrect: true,
      g2FirstAttemptCorrect: false,
      supportEscalated: false,
      unresolvedCentralMisconception: false
    }) !== "standard_f1_then_f2") {
      errors.push("Standard guided route helper is incorrect.");
    }
    if (routeFinalCheck({
      correctCount: 4,
      hasProceduralEvidence: true,
      hasReasoningOrApplicationEvidence: true,
      repeatedBlockingMisconception: false
    }) !== "finish_candidate") {
      errors.push("4/5 final route helper is incorrect.");
    }
    if (routeFinalCheck({
      correctCount: 3,
      hasProceduralEvidence: true,
      hasReasoningOrApplicationEvidence: true,
      repeatedBlockingMisconception: false
    }) !== "targeted_repair_then_fresh_two_item_check") {
      errors.push("3/5 final route helper is incorrect.");
    }
    if (routeFinalCheck({
      correctCount: 2,
      hasProceduralEvidence: true,
      hasReasoningOrApplicationEvidence: true,
      repeatedBlockingMisconception: false
    }) !== "targeted_repair_then_fresh_three_item_final") {
      errors.push("0-2/5 final route helper is incorrect.");
    }
    return errors;
  }
  function assertFRA16CanonicalSpec() {
    const errors = validateFRA16CanonicalSpec();
    if (errors.length > 0) {
      throw new Error(`FRA16 canonical spec failed validation:
- ${errors.join("\n- ")}`);
    }
  }
  return __toCommonJS(FRA16_CANONICAL_SPEC_exports);
})();

window.FRA16_RUNTIME_COPY = RevilyFra16Approved.FRA16_RUNTIME_COPY;
window.RevilyFra16V1 = {
  spec: RevilyFra16Approved.FRA16,
  runtimeCopy: RevilyFra16Approved.FRA16_RUNTIME_COPY,
  assertCanonicalSpec: RevilyFra16Approved.assertFRA16CanonicalSpec,
  compareFractions: RevilyFra16Approved.compareFractions,
  equivalentNumerator: RevilyFra16Approved.equivalentNumerator,
  getAllQuestionLikeSpecs: RevilyFra16Approved.getAllQuestionLikeSpecs,
  getHookResponseSequence: RevilyFra16Approved.getHookResponseSequence,
  getOutcomeUtteranceIds: RevilyFra16Approved.getOutcomeUtteranceIds,
  getQuestionById: RevilyFra16Approved.getQuestionById,
  lcm: RevilyFra16Approved.lcm,
  lcmMany: RevilyFra16Approved.lcmMany,
  orderFractionIds: RevilyFra16Approved.orderFractionIds,
  relationToHalf: RevilyFra16Approved.relationToHalf,
  routeAfterGuided: RevilyFra16Approved.routeAfterGuided,
  routeFinalCheck: RevilyFra16Approved.routeFinalCheck,
  validateCanonicalSpec: RevilyFra16Approved.validateFRA16CanonicalSpec
};
