(function () {
  "use strict";
  const FRA10_RUNTIME_COPY = {
  "HOOK.PRE.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "prompt",
    "communicationGoal": "introduce_two_equivalent_simplification_attempts",
    "text": "Two students simplify twelve eighteenths. One writes six ninths. The other writes two thirds.",
    "captionSource": "same_as_audio"
  },
  "HOOK.PRE.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "prompt",
    "communicationGoal": "create_the_stopping_decision_conflict",
    "text": "Both answers keep the same value. But only one is finished. Why?",
    "captionSource": "same_as_audio"
  },
  "HOOK.CHECK.6_9": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "show_why_six_ninths_is_not_finished",
    "text": "Six and nine still share a factor of three.",
    "captionSource": "same_as_audio"
  },
  "HOOK.CHECK.2_3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "show_why_two_thirds_is_finished",
    "text": "Two and three share nothing except one.",
    "captionSource": "same_as_audio"
  },
  "HOOK.DEFINITION": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "define_the_simplest_form_end_condition",
    "text": "Simplest form means there is no common factor left to remove.",
    "captionSource": "same_as_audio"
  },
  "T1.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "identify_a_common_factor_in_six_ninths",
    "text": "Look at six ninths. The numerator and denominator are both divisible by three.",
    "captionSource": "same_as_audio"
  },
  "T1.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "divide_both_fraction_parts_by_the_same_factor",
    "text": "Divide both by three. Six becomes two. Nine becomes three.",
    "captionSource": "same_as_audio"
  },
  "T1.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "connect_common_factor_removal_to_value_preservation",
    "text": "The amount has not changed. We have removed a common factor from the numbers.",
    "captionSource": "same_as_audio"
  },
  "T1.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "verify_the_final_hcf_one_condition",
    "text": "Two thirds has no common factor greater than one, so it is in simplest form.",
    "captionSource": "same_as_audio"
  },
  "T2.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "reject_number_size_as_the_definition",
    "text": "Small numbers do not automatically mean simplest.",
    "captionSource": "same_as_audio"
  },
  "T2.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "show_a_small_looking_fraction_that_still_simplifies",
    "text": "Six tenths still has a common factor of two, so it can become three fifths.",
    "captionSource": "same_as_audio"
  },
  "T2.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "show_a_larger_looking_fraction_already_in_simplest_form",
    "text": "Seven twelfths uses larger numbers, but seven and twelve have no common factor greater than one. It is already simplest.",
    "captionSource": "same_as_audio"
  },
  "T2.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "state_the_mathematical_stopping_rule",
    "text": "Do not stop because the numbers look small. Stop because no common factor is left.",
    "captionSource": "same_as_audio"
  },
  "T3.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "introduce_hcf_as_an_optional_efficient_route",
    "text": "If you can spot the highest common factor, you can finish in one step.",
    "captionSource": "same_as_audio"
  },
  "T3.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "identify_twelve_as_the_hcf_of_twenty_four_and_thirty_six",
    "text": "The HCF of twenty-four and thirty-six is twelve.",
    "captionSource": "same_as_audio"
  },
  "T3.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "perform_the_one_step_hcf_simplification",
    "text": "Divide the numerator and denominator by twelve: twenty-four becomes two, and thirty-six becomes three.",
    "captionSource": "same_as_audio"
  },
  "T3.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "confirm_the_unique_simplest_endpoint",
    "text": "Two and three share only one, so two thirds is the final simplest form.",
    "captionSource": "same_as_audio"
  },
  "T4.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "allow_valid_multi_step_routes",
    "text": "You do not have to use the HCF in the first step.",
    "captionSource": "same_as_audio"
  },
  "T4.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "compare_multi_step_and_hcf_routes_for_sixty_eighty_fourths",
    "text": "Sixty eighty-fourths can divide by two, then by six. Or it can divide by twelve straight away.",
    "captionSource": "same_as_audio"
  },
  "T4.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "show_route_convergence_on_five_sevenths",
    "text": "Both routes finish at five sevenths.",
    "captionSource": "same_as_audio"
  },
  "T4.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "make_the_final_common_factor_check_non_optional",
    "text": "The important part is the final check: five and seven have no common factor greater than one.",
    "captionSource": "same_as_audio"
  },
  "T5.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "extend_the_rule_to_positive_improper_fractions",
    "text": "The same rule works when the numerator is larger.",
    "captionSource": "same_as_audio"
  },
  "T5.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "simplify_forty_two_thirtieths_to_seven_fifths",
    "text": "Forty-two thirtieths divides by six to make seven fifths.",
    "captionSource": "same_as_audio"
  },
  "T5.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "protect_the_fra11_mixed_number_boundary",
    "text": "Seven fifths is still greater than one, and that is fine. FRA-10 does not turn it into a mixed number.",
    "captionSource": "same_as_audio"
  },
  "T5.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "show_an_improper_fraction_that_is_already_simplest",
    "text": "A fraction may also be already simplest. Eleven sevenths needs no change.",
    "captionSource": "same_as_audio"
  },
  "HANDOFF.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "summarise_the_finish_condition_before_guided_practice",
    "text": "You know what finished means now: the value is unchanged, and no common factor greater than one is left.",
    "captionSource": "same_as_audio"
  },
  "HANDOFF.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "hand_control_to_the_learner_in_two_stages",
    "text": "I will stay with you for two. Then I will start taking the factor support away.",
    "captionSource": "same_as_audio"
  },
  "G1.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "ask_for_an_hcf_supported_simplification",
    "text": "The HCF is six. Divide the numerator and denominator by six.",
    "captionSource": "same_as_audio"
  },
  "G1.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_both_divisions_and_the_final_factor_check",
    "text": "Eighteen divided by six is three, and thirty divided by six is five. Three and five share only one, so you are finished.",
    "captionSource": "same_as_audio"
  },
  "G2.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "ask_for_a_learner_chosen_factor_route_and_stop_check",
    "text": "Choose a factor that divides both exactly. After each step, decide whether another common factor is left.",
    "captionSource": "same_as_audio"
  },
  "F1.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "guide_the_learner_to_the_largest_shared_factor_without_stating_the_answer",
    "text": "Find the largest factor that appears in both rows.",
    "captionSource": "same_as_audio"
  },
  "F2.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "focus_the_already_simplest_choice_on_common_factors",
    "text": "Do not pick the smallest-looking one. Check for a factor both numbers share.",
    "captionSource": "same_as_audio"
  },
  "F2.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "offer_a_factor_check_sequence_without_naming_the_correct_option",
    "text": "Try two, three, five, then seven. A fraction is simplest only if none divides both.",
    "captionSource": "same_as_audio"
  },
  "I1.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "request_independent_route_choice_and_complete_simplification",
    "text": "Simplify this all the way. You choose the route.",
    "captionSource": "same_as_audio"
  },
  "I1.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "guide_common_factor_search_and_final_recheck_without_revealing_the_factor",
    "text": "Find a number that divides fifty-four and ninety exactly. You may use more than one step, but check again at the end.",
    "captionSource": "same_as_audio"
  },
  "I2.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "ask_for_both_equivalence_and_finish_checks",
    "text": "Check both ideas: did the value stay the same, and is the answer finished?",
    "captionSource": "same_as_audio"
  },
  "I2.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "focus_the_stopping_check_on_sixteen_and_twenty_four",
    "text": "Look for a common factor of sixteen and twenty-four.",
    "captionSource": "same_as_audio"
  },
  "FINAL.INTRO.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "announce_five_unsupported_final_items",
    "text": "These last five are yours. No hints this time.",
    "captionSource": "same_as_audio"
  },
  "FINAL.INTRO.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check_intro",
    "communicationGoal": "state_answer_lock_then_working_sequence",
    "text": "Do the question first. Once your answer is locked, I will show you a short check so you can compare your route.",
    "captionSource": "same_as_audio"
  },
  "M1.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_then_introduce_one_efficient_route",
    "text": "That is right. Here is one efficient route.",
    "captionSource": "same_as_audio"
  },
  "M1.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_the_worked_route_after_a_miss",
    "text": "Not quite. Here is the working - compare it with what you did.",
    "captionSource": "same_as_audio"
  },
  "M2.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_the_continue_simplifying_decision",
    "text": "Yes - you noticed the first answer was not finished. Here is the last step.",
    "captionSource": "same_as_audio"
  },
  "M2.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "redirect_to_the_remaining_common_factor",
    "text": "Not quite. Check whether 12 and 20 still share a factor.",
    "captionSource": "same_as_audio"
  },
  "M3.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_definition_based_reasoning",
    "text": "Correct. The factor check is what matters.",
    "captionSource": "same_as_audio"
  },
  "M3.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "reject_size_based_reasoning_before_the_worked_check",
    "text": "Not quite. Size alone does not decide simplest form.",
    "captionSource": "same_as_audio"
  },
  "M4.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_simplified_improper_form_without_conversion",
    "text": "That is right. The improper form is already the requested form.",
    "captionSource": "same_as_audio"
  },
  "M4.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "restore_the_simplify_only_boundary",
    "text": "Not quite. Simplify the fraction; do not change it into a mixed number.",
    "captionSource": "same_as_audio"
  },
  "M5.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_context_to_simplest_fraction_transfer",
    "text": "Exactly. Here is how the context becomes the simplest fraction.",
    "captionSource": "same_as_audio"
  },
  "M5.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "rebuild_the_context_fraction_then_simplify",
    "text": "Not quite. Build 18/30 first, then simplify it all the way.",
    "captionSource": "same_as_audio"
  },
  "R-EARLY.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "name_the_valid_but_unfinished_state",
    "text": "Your fraction is equivalent, but the simplification is not finished.",
    "captionSource": "same_as_audio"
  },
  "R-EARLY.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "identify_the_remaining_factor_four",
    "text": "In eight twelfths, both numbers still divide by four.",
    "captionSource": "same_as_audio"
  },
  "R-EARLY.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "complete_the_second_simplification_step",
    "text": "Divide again: eight twelfths becomes two thirds.",
    "captionSource": "same_as_audio"
  },
  "R-EARLY.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "verify_the_finished_state_after_repair",
    "text": "Now two and three share only one, so this time the answer is finished.",
    "captionSource": "same_as_audio"
  },
  "R-BOTH.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "identify_the_value_change_after_one_side_moves",
    "text": "You changed one part of the fraction, so the value changed.",
    "captionSource": "same_as_audio"
  },
  "R-BOTH.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "restate_same_factor_on_both_parts",
    "text": "A simplification step divides the numerator and denominator by the same factor.",
    "captionSource": "same_as_audio"
  },
  "R-BOTH.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "model_both_exact_divisions",
    "text": "Eighteen divided by six is three, and thirty divided by six is five.",
    "captionSource": "same_as_audio"
  },
  "R-BOTH.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "connect_same_factor_to_same_value_and_simplest_form",
    "text": "That makes three fifths - the same value in simplest form.",
    "captionSource": "same_as_audio"
  },
  "R-COMMON.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "require_exact_divisibility_on_both_numbers",
    "text": "A simplification factor has to work on both numbers exactly.",
    "captionSource": "same_as_audio"
  },
  "R-COMMON.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "reject_eight_as_not_common_to_twenty_four_and_thirty_six",
    "text": "Eight divides twenty-four, but it does not divide thirty-six exactly, so eight is not a common factor here.",
    "captionSource": "same_as_audio"
  },
  "R-COMMON.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "accept_twelve_and_form_two_thirds",
    "text": "Twelve divides both. Using twelve gives two thirds.",
    "captionSource": "same_as_audio"
  },
  "R-COMMON.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "reconnect_factor_validity_to_the_stop_rule",
    "text": "If no number greater than one divides both, the fraction is already simplest.",
    "captionSource": "same_as_audio"
  },
  "R-SMALL.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "reject_small_appearance_as_evidence",
    "text": "Small-looking numbers can still share a factor.",
    "captionSource": "same_as_audio"
  },
  "R-SMALL.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "show_six_tenths_is_not_simplest",
    "text": "Six tenths is not simplest because six and ten both divide by two.",
    "captionSource": "same_as_audio"
  },
  "R-SMALL.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "show_eleven_eighteenths_is_simplest_despite_larger_numbers",
    "text": "Eleven eighteenths uses a larger denominator, but eleven and eighteen share only one.",
    "captionSource": "same_as_audio"
  },
  "R-SMALL.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "restore_the_common_factor_test",
    "text": "Use the common-factor test, not the size of the numbers.",
    "captionSource": "same_as_audio"
  },
  "R-VALUE.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "identify_different_divisors_as_the_value_change",
    "text": "Both numbers became smaller, but they did not change by the same factor.",
    "captionSource": "same_as_audio"
  },
  "R-VALUE.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "show_twenty_four_thirty_sixths_to_four_ninths_is_not_equivalent",
    "text": "Dividing the top by six and the bottom by four turns twenty-four thirty-sixths into four ninths. That is a different amount.",
    "captionSource": "same_as_audio"
  },
  "R-VALUE.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "replace_different_divisors_with_one_common_factor",
    "text": "Use one factor on both parts. Twenty-four and thirty-six can both divide by twelve, giving two thirds.",
    "captionSource": "same_as_audio"
  },
  "COMPLETION": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "completion",
    "communicationGoal": "close_the_current_session_skill",
    "text": "Good work. You can now simplify a fraction all the way and know when there is no common factor left. That is FRA-10 done.",
    "captionSource": "same_as_audio"
  }
};
  const FRA10_LEARNER_UI_COPY = {
  "COMMON.CHECK_ANSWER": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Check answer",
    "speechPolicy": "never_automatic_ryan",
    "source": "shared_engine"
  },
  "COMMON.SUBMIT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Submit",
    "speechPolicy": "never_automatic_ryan",
    "source": "shared_engine"
  },
  "COMMON.ASK_HINT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Ask for a hint",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "COMMON.FINISHED": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Finished",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "COMMON.DIVIDE_AGAIN": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Divide again",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "COMMON.SIMPLIFY_ALL_WAY": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Simplify all the way - then decide whether you are finished.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "HOOK.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Which answer is fully simplified?",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "HOOK.OPTION.A": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "A is finished",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "HOOK.OPTION.B": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "B is finished",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "HOOK.OPTION.BOTH": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Both are finished",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "HOOK.STATUS.CORRECT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "B is the finished answer.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "HOOK.STATUS.INCORRECT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "That choice is not fully simplified.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "G1.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Write 18/30 in simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "G1.HCF_BADGE": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "HCF = 6",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "G2.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Simplify 36/60 all the way.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "G2.FACTOR_PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Divide top and bottom by",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "G2.CORRECT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "3/5 is the finished simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "F1.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Use the factor cards to write 28/42 in simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F1.FACTORS_28": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Factors of 28: 1, 2, 4, 7, 14, 28.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F1.FACTORS_42": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Factors of 42: 1, 2, 3, 6, 7, 14, 21, 42.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Which fraction is already in simplest form?",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.OPTION.A": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "9/15",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.OPTION.B": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "10/21",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.OPTION.C": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "14/35",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.OPTION.D": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "16/24",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.CORRECT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "10 and 21 share no factor greater than 1.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "F2.WRONG.A": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "9 and 15 both divide by 3.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.WRONG.C": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "14 and 35 both divide by 7.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "F2.WRONG.D": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "16 and 24 both divide by 8.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "I1.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Write 54/90 in simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "I2.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Maya writes 32/48 = 16/24 and says: ‘That is simplest because the numbers are smaller.’ Which response to Maya is best?",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "I2.OPTION.A": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "She is correct; smaller numbers always mean simplest.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "I2.OPTION.B": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The step is valid, but 16 and 24 still share 8. The simplest form is 2/3.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "I2.OPTION.C": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The fraction changed value, so the first step is invalid.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "I2.OPTION.D": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Divide 16 and 24 by different numbers to make them smaller.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "C-DIR.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Write 45/75 in simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "C-STOP.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "18/27 has become 6/9. Write the final simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M1.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Write 42/56 in simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M1.WORK.1": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "42 ÷ 14 = 3",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M1.WORK.2": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "56 ÷ 14 = 4",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M1.WORK.3": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "So 42/56 = 3/4. The only common factor of 3 and 4 is 1, so the answer is finished.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M2.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "A learner has reached 12/20 from 72/120. Complete the simplification.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M2.WORK.1": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The first step kept the same value, but 12 and 20 still share 4.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M2.WORK.2": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "12 ÷ 4 = 3",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M2.WORK.3": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "20 ÷ 4 = 5",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M2.WORK.4": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The final simplest form is 3/5.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Which statement about 14/25 is correct?",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.OPTION.A": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Already simplest: only common factor is 1.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.OPTION.B": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Not simplest because 25 is larger.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.OPTION.C": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Divide both by 2.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.OPTION.D": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Divide top by 7 and bottom by 5.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.WORK.1": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Factors of 14: 1, 2, 7, 14.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.WORK.2": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Factors of 25: 1, 5, 25.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M3.WORK.3": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The only factor in both lists is 1. Therefore 14/25 is already in simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M4.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Write 84/60 in simplest form. Leave it improper.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M4.BADGE": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Leave as an improper fraction",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M4.WORK.1": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "84 ÷ 12 = 7",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M4.WORK.2": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "60 ÷ 12 = 5",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M4.WORK.3": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "So 84/60 = 7/5. Seven and five share only 1. No mixed-number conversion is required.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M5.PROMPT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "A school sold 18 of 30 raffle tickets online. Write the fraction in simplest form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M5.VISUAL_LABEL": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "18 online tickets out of 30 total",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M5.WORK.1": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The context gives 18/30.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M5.WORK.2": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "18 ÷ 6 = 3",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M5.WORK.3": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "30 ÷ 6 = 5",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FINAL.M5.WORK.4": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "So the fraction sold online is 3/5.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FB.STOP_EARLY": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The value is still right. Check whether top and bottom share another factor.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FB.ONE_SIDE": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Simplification moves both parts together. Use the same factor on top and bottom.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FB.NON_COMMON": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "That factor does not divide both numbers exactly. Choose a common factor.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FB.SMALLER_NUMBERS": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Number size is not the test. Look for a factor both numbers share.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FB.VALUE_CHANGE": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Those changes do not use the same factor, so the fraction value has moved.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FB.ARITHMETIC_SLIP": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Your method is right. Recheck that whole-number division.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "FB.NEUTRAL_RECHECK": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Recheck the fraction, the factor used on both numbers, and whether another common factor remains.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "FB.CORRECT_SIMPLEST": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "The fraction is equivalent to the original and has no common factor greater than 1.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "FB.CORRECT_REASONING": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "That reasoning uses the common-factor test and reaches the finished form.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "REPAIR.EARLY.ACTION": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Select ‘divide again’, enter 4, then check the new fraction.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "REPAIR.COMMON.ACTION": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Choose a factor that divides both 24 and 36 exactly.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "REPAIR.SMALL.ACTION": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "Sort each fraction into ‘can simplify’ or ‘already simplest’, then select the shared factor where one exists.",
    "speechPolicy": "never_automatic_ryan",
    "source": "storyboard_exact"
  },
  "RECOVERY.CORRECT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "That fresh check is correct.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  },
  "RECOVERY.INCORRECT": {
    "audience": "learner",
    "modality": "visual_text",
    "text": "That fresh check is not correct yet. Use the worked check after the answer locks.",
    "speechPolicy": "never_automatic_ryan",
    "source": "handoff_completion"
  }
};
  const FRA10 = {
  "id": "FRA10",
  "displayId": "FRA-10",
  "title": "Write a Fraction in Simplest Form",
  "handoffVersion": "v1",
  "contentVersion": "fra10-simplest-form-handoff-v1",
  "status": "OWNER_APPROVED_FOR_CODEX_HANDOFF_IMPLEMENTATION_CANDIDATE",
  "sourceOfTruth": {
    "exactRyanRuntimeCopy": "FRA10_CANONICAL_SPEC.ts#FRA10_RUNTIME_COPY",
    "learnerVisibleUiCopy": "FRA10_CANONICAL_SPEC.ts#FRA10_LEARNER_UI_COPY",
    "structuredLessonDataAndRoutes": "FRA10_CANONICAL_SPEC.ts#FRA10",
    "visualGeometryAndPedagogicalIntent": "Revily_FRA-10_Storyboard_v1.pdf",
    "engineeringContract": "FRA10_CODEX_IMPLEMENTATION_PROMPT.md",
    "criticalPrecedenceRule": "Ryan speech and captions come only from FRA10_RUNTIME_COPY. The PDF remains the visual and pedagogical reference. Authoring prose, assessment intents, route labels and implementation notes in either file are never learner narration.",
    "existingInfrastructure": "Use the existing canonical Revily FRA lesson shell, TTS, word-timed captions, cue timeline, fraction input, answer lock, hint, evidence, persistence, accessibility and test infrastructure."
  },
  "scope": {
    "exactObjective": "Write a fraction in lowest terms by dividing numerator and denominator by common factors until their highest common factor is one.",
    "studentFacingIdea": "Same value. No common factor left.",
    "prerequisites": [
      "FRA-09: divide numerator and denominator by a stated exact factor.",
      "Exact positive whole-number division.",
      "Common-factor and HCF knowledge as an external Number capability."
    ],
    "teaches": [
      "choose or verify a common factor instead of receiving one automatically",
      "divide numerator and denominator by the same exact factor",
      "preserve the fraction value through every valid step",
      "simplify in one HCF step or through several valid common-factor steps",
      "check again after each step",
      "stop only when no common factor greater than 1 remains",
      "recognise a fraction that is already in simplest form",
      "simplify positive proper and positive improper fractions",
      "accept the unique simplest fractional form while treating an equivalent unsimplified form as not finished"
    ],
    "deliberatelyLaterOrExcluded": [
      "FRA-11 and FRA-12 mixed-number conversion",
      "FRA-25 simplify-before-multiplying strategy",
      "simplification after another fraction operation as the main target",
      "decimal or percentage conversion",
      "negative fractions",
      "algebraic fractions",
      "prime-factor decomposition or HCF algorithms as the lesson target",
      "global Diagnostic placement",
      "Retrieval, spaced review or future-session scheduling"
    ],
    "authoringEnvelope": {
      "positiveFractionsOnly": true,
      "numeratorNormallyAtMost": 150,
      "denominatorNormallyAtMost": 150,
      "finalItemHcfAtMost": 30,
      "denominatorMustBePositive": true,
      "simplestAnswerMustHaveGcd": 1
    }
  },
  "runtimeSurfaceContract": {
    "onlySourceForRyanSpeech": "FRA10_RUNTIME_COPY",
    "onlySourceForRyanCaptions": "The exact text of the same FRA10_RUNTIME_COPY entry used for audio.",
    "captionRule": "No captionText field is allowed. Captions are derived from the active utterance ID and its audio word timings.",
    "learnerUiRule": "FRA10_LEARNER_UI_COPY and visible question fields are UI/semantic text only. They never become automatic Ryan narration.",
    "hintRule": "Hints start collapsed. A hint utterance may play only after the learner explicitly opens that hint. Opening is support usage, not a wrong answer.",
    "visualCueRule": "Every speech-led cue references an existing utterance ID and an exact anchor phrase contained in that utterance.",
    "removalRule": "Removing or rewriting an utterance must remove or remap its caption and every attached visual cue in the same change.",
    "outcomeRule": "Correctness is computed before feedback. Exactly one correct, matching error-specific incorrect, or default incorrect branch is selected. A wrong response never plays the correct-response line.",
    "repetitionRule": "Each consecutive Ryan line adds a new function. Do not add praise that merely repeats the following explanation."
  },
  "sourceCompletionNotes": [
    {
      "id": "SC-01",
      "issue": "R-COMMON says to show three factor cards, while the storyboard drawing names only 8 and 12.",
      "completion": "Use factor cards 8, 18 and 12. Eight works only on 24, eighteen works only on 36, and twelve works on both.",
      "learnerFacingStatus": "handoff_completion"
    },
    {
      "id": "SC-02",
      "issue": "R-BOTH names 28/42 as the fresh recheck, but standard-route learners may already have seen 28/42 in F1.",
      "completion": "Use 28/42 only when F1 was skipped. If 28/42 is already in the attempt history, use 35/49 -> 5/7.",
      "learnerFacingStatus": "route_freshness_completion"
    },
    {
      "id": "SC-03",
      "issue": "R-SMALL specifies a two-fraction supported sort but does not name the two fractions.",
      "completion": "Use 9/14 as already simplest and 14/21 as simplifiable by 7.",
      "learnerFacingStatus": "handoff_completion"
    },
    {
      "id": "SC-04",
      "issue": "The arithmetic-slip branch requires a fresh fraction but does not name one.",
      "completion": "Use 40/56 -> 5/7 for the fresh arithmetic confirmation.",
      "learnerFacingStatus": "handoff_completion"
    },
    {
      "id": "SC-05",
      "issue": "Final recovery counts and family targeting are fixed, but exact unseen recovery items are not listed in the storyboard.",
      "completion": "Use the deterministic recovery bank in this file. Never generate or improvise learner-facing recovery mathematics at runtime.",
      "learnerFacingStatus": "handoff_completion"
    }
  ],
  "teachingScenes": [
    {
      "id": "HOOK",
      "stage": "opening",
      "authorOnlyPurpose": "Create a genuine conflict between equivalent and fully simplified forms.",
      "visual": {
        "kind": "simplification_conflict_cards",
        "sourceFraction": {
          "numerator": 12,
          "denominator": 18
        },
        "answerCards": [
          {
            "id": "A",
            "fraction": {
              "numerator": 6,
              "denominator": 9
            }
          },
          {
            "id": "B",
            "fraction": {
              "numerator": 2,
              "denominator": 3
            }
          }
        ],
        "showFactorOverlapInitially": false,
        "showFinishedBadgeInitially": false,
        "authorOnlyGeometry": "Two equal-size answer cards. Use the same whole/value reference. Do not imply that 6/9 has a different value."
      },
      "ryanUtteranceIds": [
        "HOOK.PRE.1",
        "HOOK.PRE.2"
      ],
      "interaction": {
        "scored": false,
        "promptUiId": "HOOK.PROMPT",
        "options": [
          {
            "id": "A",
            "uiId": "HOOK.OPTION.A"
          },
          {
            "id": "B",
            "uiId": "HOOK.OPTION.B"
          },
          {
            "id": "BOTH",
            "uiId": "HOOK.OPTION.BOTH"
          }
        ],
        "feedbackByOption": {
          "A": {
            "outcome": "incorrect",
            "statusUiId": "HOOK.STATUS.INCORRECT",
            "ryanUtteranceIds": [
              "HOOK.CHECK.6_9"
            ],
            "thenUtteranceIds": [
              "HOOK.CHECK.2_3",
              "HOOK.DEFINITION"
            ]
          },
          "B": {
            "outcome": "correct",
            "statusUiId": "HOOK.STATUS.CORRECT",
            "ryanUtteranceIds": [
              "HOOK.CHECK.2_3"
            ],
            "thenUtteranceIds": [
              "HOOK.CHECK.6_9",
              "HOOK.DEFINITION"
            ]
          },
          "BOTH": {
            "outcome": "incorrect",
            "statusUiId": "HOOK.STATUS.INCORRECT",
            "ryanUtteranceIds": [
              "HOOK.CHECK.6_9"
            ],
            "thenUtteranceIds": [
              "HOOK.CHECK.2_3",
              "HOOK.DEFINITION"
            ]
          }
        },
        "convergeOnlyAfterBranchFeedback": true,
        "answerAffectsMasteryEvidence": false
      },
      "timeline": [
        {
          "id": "HOOK.CUE.1",
          "utteranceId": "HOOK.PRE.1",
          "anchorText": "twelve eighteenths",
          "authorOnlyAction": "Show 12/18 centred, then reveal answer card A as 6/9 and answer card B as 2/3 in the order spoken.",
          "reducedMotionState": "Show the three fractions in their completed positions with the active spoken object outlined.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "HOOK.CUE.2",
          "utteranceId": "HOOK.PRE.2",
          "anchorText": "only one is finished",
          "authorOnlyAction": "Reveal the three response controls. Do not show factors, ticks or a finished badge.",
          "reducedMotionState": "Response controls appear as one state change after the anchor phrase.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "HOOK.CUE.3",
          "utteranceId": "HOOK.CHECK.6_9",
          "anchorText": "factor of three",
          "authorOnlyAction": "Highlight the shared factor 3 on 6 and 9; mark 6/9 as equivalent but not finished.",
          "reducedMotionState": "Show a static shared-factor brace labelled 3 beside 6/9.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "HOOK.CUE.4",
          "utteranceId": "HOOK.CHECK.2_3",
          "anchorText": "nothing except one",
          "authorOnlyAction": "Show a shared-factor check containing only 1 beside 2/3; mark B as finished.",
          "reducedMotionState": "Show a static HCF = 1 badge beside 2/3.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "HOOK.CUE.5",
          "utteranceId": "HOOK.DEFINITION",
          "anchorText": "Simplest form",
          "authorOnlyAction": "Reveal the definition label: same value; no common factor greater than 1 remains.",
          "reducedMotionState": "Definition label appears in its final position.",
          "mustNotOccurBeforeAnchor": true
        }
      ]
    },
    {
      "id": "T1",
      "stage": "teach",
      "authorOnlyPurpose": "Define simplest form by removing a common factor and checking the endpoint.",
      "visual": {
        "kind": "grouped_fraction_bar_with_factor_check",
        "sourceFraction": {
          "numerator": 6,
          "denominator": 9
        },
        "factor": 3,
        "resultFraction": {
          "numerator": 2,
          "denominator": 3
        },
        "exactPartCount": 9,
        "selectedPartCount": 6,
        "groupSize": 3,
        "resultHcf": 1
      },
      "ryanUtteranceIds": [
        "T1.1",
        "T1.2",
        "T1.3",
        "T1.4"
      ],
      "timeline": [
        {
          "id": "T1.CUE.1",
          "utteranceId": "T1.1",
          "anchorText": "divisible by three",
          "authorOnlyAction": "Group the nine equal parts into three equal groups and highlight the common factor 3 on numerator and denominator.",
          "reducedMotionState": "Show completed grouping brackets and factor-3 labels without travel motion.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T1.CUE.2",
          "utteranceId": "T1.2",
          "anchorText": "Six becomes two",
          "authorOnlyAction": "Change the numerator from 6 to 2.",
          "reducedMotionState": "Swap 6 for 2 at the anchor phrase.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T1.CUE.3",
          "utteranceId": "T1.2",
          "anchorText": "Nine becomes three",
          "authorOnlyAction": "Change the denominator from 9 to 3.",
          "reducedMotionState": "Swap 9 for 3 at the anchor phrase.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T1.CUE.4",
          "utteranceId": "T1.4",
          "anchorText": "in simplest form",
          "authorOnlyAction": "Reveal HCF = 1 and the SIMPLEST FORM label only after the check is spoken.",
          "reducedMotionState": "Show the final HCF and simplest-form badges.",
          "mustNotOccurBeforeAnchor": true
        }
      ]
    },
    {
      "id": "T2",
      "stage": "teach",
      "authorOnlyPurpose": "Displace the smaller-numbers misconception with the common-factor test.",
      "visual": {
        "kind": "paired_factor_list_comparison",
        "left": {
          "label": "Looks small - not finished",
          "sourceFraction": {
            "numerator": 6,
            "denominator": 10
          },
          "numeratorFactors": [
            1,
            2,
            3,
            6
          ],
          "denominatorFactors": [
            1,
            2,
            5,
            10
          ],
          "sharedFactors": [
            1,
            2
          ],
          "resultFraction": {
            "numerator": 3,
            "denominator": 5
          }
        },
        "right": {
          "label": "Larger numbers - already simplest",
          "sourceFraction": {
            "numerator": 7,
            "denominator": 12
          },
          "numeratorFactors": [
            1,
            7
          ],
          "denominatorFactors": [
            1,
            2,
            3,
            4,
            6,
            12
          ],
          "sharedFactors": [
            1
          ]
        }
      },
      "ryanUtteranceIds": [
        "T2.1",
        "T2.2",
        "T2.3",
        "T2.4"
      ],
      "timeline": [
        {
          "id": "T2.CUE.1",
          "utteranceId": "T2.2",
          "anchorText": "common factor of two",
          "authorOnlyAction": "Highlight 2 in both the factor list for 6 and the factor list for 10.",
          "reducedMotionState": "Show both 2s outlined with a shared-factor connector.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T2.CUE.2",
          "utteranceId": "T2.2",
          "anchorText": "three fifths",
          "authorOnlyAction": "Reveal 6/10 -> 3/5 and mark the new HCF as 1.",
          "reducedMotionState": "Show the completed equation and HCF = 1 badge.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T2.CUE.3",
          "utteranceId": "T2.3",
          "anchorText": "no common factor greater than one",
          "authorOnlyAction": "Reveal the factor lists for 7 and 12 and connect only the factor 1.",
          "reducedMotionState": "Show the completed factor lists with only 1 linked.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T2.CUE.4",
          "utteranceId": "T2.4",
          "anchorText": "Stop because",
          "authorOnlyAction": "Place the canonical stopping rule beneath both examples.",
          "reducedMotionState": "Show the rule as a static callout.",
          "mustNotOccurBeforeAnchor": true
        }
      ]
    },
    {
      "id": "T3",
      "stage": "teach",
      "authorOnlyPurpose": "Show the HCF as an efficient but non-compulsory one-step route.",
      "visual": {
        "kind": "one_step_hcf_route",
        "sourceFraction": {
          "numerator": 24,
          "denominator": 36
        },
        "hcf": 12,
        "resultFraction": {
          "numerator": 2,
          "denominator": 3
        },
        "showHcfFindingAlgorithm": false
      },
      "ryanUtteranceIds": [
        "T3.1",
        "T3.2",
        "T3.3",
        "T3.4"
      ],
      "timeline": [
        {
          "id": "T3.CUE.1",
          "utteranceId": "T3.1",
          "anchorText": "highest common factor",
          "authorOnlyAction": "Reveal an empty HCF badge beside 24/36.",
          "reducedMotionState": "Show the HCF badge outline.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T3.CUE.2",
          "utteranceId": "T3.2",
          "anchorText": "is twelve",
          "authorOnlyAction": "Fill the badge with HCF = 12.",
          "reducedMotionState": "Set the badge text to HCF = 12.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T3.CUE.3",
          "utteranceId": "T3.3",
          "anchorText": "twenty-four becomes two",
          "authorOnlyAction": "Change the numerator 24 to 2 and show 24 ÷ 12 = 2.",
          "reducedMotionState": "Show 2 and its exact division statement.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T3.CUE.4",
          "utteranceId": "T3.3",
          "anchorText": "thirty-six becomes three",
          "authorOnlyAction": "Change the denominator 36 to 3 and show 36 ÷ 12 = 3.",
          "reducedMotionState": "Show 3 and its exact division statement.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T3.CUE.5",
          "utteranceId": "T3.4",
          "anchorText": "final simplest form",
          "authorOnlyAction": "Mark 2/3 as the final form and show HCF(2,3) = 1.",
          "reducedMotionState": "Show the completed result and final check.",
          "mustNotOccurBeforeAnchor": true
        }
      ]
    },
    {
      "id": "T4",
      "stage": "teach",
      "authorOnlyPurpose": "Accept multiple exact routes while requiring the same final simplest form.",
      "visual": {
        "kind": "branching_factor_routes",
        "sourceFraction": {
          "numerator": 60,
          "denominator": 84
        },
        "routes": [
          {
            "id": "multi_step",
            "steps": [
              {
                "before": {
                  "numerator": 60,
                  "denominator": 84
                },
                "factor": 2,
                "after": {
                  "numerator": 30,
                  "denominator": 42
                }
              },
              {
                "before": {
                  "numerator": 30,
                  "denominator": 42
                },
                "factor": 6,
                "after": {
                  "numerator": 5,
                  "denominator": 7
                }
              }
            ]
          },
          {
            "id": "hcf_step",
            "steps": [
              {
                "before": {
                  "numerator": 60,
                  "denominator": 84
                },
                "factor": 12,
                "after": {
                  "numerator": 5,
                  "denominator": 7
                }
              }
            ]
          }
        ],
        "resultFraction": {
          "numerator": 5,
          "denominator": 7
        }
      },
      "ryanUtteranceIds": [
        "T4.1",
        "T4.2",
        "T4.3",
        "T4.4"
      ],
      "timeline": [
        {
          "id": "T4.CUE.1",
          "utteranceId": "T4.2",
          "anchorText": "divide by two",
          "authorOnlyAction": "Open the multi-step route and show 60/84 -> 30/42 using factor 2.",
          "reducedMotionState": "Show the first completed multi-step node.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T4.CUE.2",
          "utteranceId": "T4.2",
          "anchorText": "then by six",
          "authorOnlyAction": "Complete 30/42 -> 5/7 using factor 6.",
          "reducedMotionState": "Show the second completed multi-step node.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T4.CUE.3",
          "utteranceId": "T4.2",
          "anchorText": "divide by twelve",
          "authorOnlyAction": "Open the HCF route and show 60/84 -> 5/7 using factor 12.",
          "reducedMotionState": "Show the completed one-step route.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T4.CUE.4",
          "utteranceId": "T4.3",
          "anchorText": "five sevenths",
          "authorOnlyAction": "Connect both routes to one 5/7 endpoint.",
          "reducedMotionState": "Show both route arrows ending at the same 5/7 card.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T4.CUE.5",
          "utteranceId": "T4.4",
          "anchorText": "no common factor greater than one",
          "authorOnlyAction": "Reveal the final common-factor check for 5 and 7.",
          "reducedMotionState": "Show HCF(5,7) = 1.",
          "mustNotOccurBeforeAnchor": true
        }
      ]
    },
    {
      "id": "T5",
      "stage": "teach",
      "authorOnlyPurpose": "Apply the same simplification rule to improper fractions without mixed-number conversion.",
      "visual": {
        "kind": "improper_fraction_boundary_pair",
        "needsSimplifying": {
          "sourceFraction": {
            "numerator": 42,
            "denominator": 30
          },
          "factor": 6,
          "resultFraction": {
            "numerator": 7,
            "denominator": 5
          },
          "leaveImproper": true
        },
        "alreadySimplest": {
          "fraction": {
            "numerator": 11,
            "denominator": 7
          },
          "numeratorFactors": [
            1,
            11
          ],
          "denominatorFactors": [
            1,
            7
          ]
        }
      },
      "ryanUtteranceIds": [
        "T5.1",
        "T5.2",
        "T5.3",
        "T5.4"
      ],
      "timeline": [
        {
          "id": "T5.CUE.1",
          "utteranceId": "T5.1",
          "anchorText": "numerator is larger",
          "authorOnlyAction": "Show 42/30 with the numerator visibly larger than the denominator.",
          "reducedMotionState": "Show the complete 42/30 card.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T5.CUE.2",
          "utteranceId": "T5.2",
          "anchorText": "seven fifths",
          "authorOnlyAction": "Show 42/30 ÷ 6 = 7/5.",
          "reducedMotionState": "Show the completed equation.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T5.CUE.3",
          "utteranceId": "T5.3",
          "anchorText": "does not turn it into a mixed number",
          "authorOnlyAction": "Show the boundary badge ‘leave as improper’; do not render a mixed number.",
          "reducedMotionState": "Show the static boundary badge.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "T5.CUE.4",
          "utteranceId": "T5.4",
          "anchorText": "needs no change",
          "authorOnlyAction": "Reveal 11/7 with factor lists showing only 1 is shared.",
          "reducedMotionState": "Show the completed factor check beside 11/7.",
          "mustNotOccurBeforeAnchor": true
        }
      ]
    },
    {
      "id": "HANDOFF",
      "stage": "teach",
      "authorOnlyPurpose": "Transition from demonstration to two guided items without generic worksheet language.",
      "visual": {
        "kind": "stage_transition",
        "fromLabel": "Learn the idea",
        "toLabel": "Try it with me",
        "persistentUiId": "COMMON.SIMPLIFY_ALL_WAY"
      },
      "ryanUtteranceIds": [
        "HANDOFF.1",
        "HANDOFF.2"
      ],
      "timeline": [
        {
          "id": "HANDOFF.CUE.1",
          "utteranceId": "HANDOFF.2",
          "anchorText": "stay with you for two",
          "authorOnlyAction": "Change the stage label from ‘Learn the idea’ to ‘Try it with me’.",
          "reducedMotionState": "Swap the stage-label text without motion.",
          "mustNotOccurBeforeAnchor": true
        }
      ]
    }
  ],
  "questions": [
    {
      "id": "G1",
      "stage": "guided",
      "authorOnlyAssessmentIntent": "Apply a shown HCF to both fraction parts and verify the simplest endpoint.",
      "evidenceFamily": "procedural",
      "promptUiId": "G1.PROMPT",
      "sourceFraction": {
        "numerator": 18,
        "denominator": 30
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 5
      },
      "visual": {
        "kind": "fraction_input_with_hcf_badge",
        "hcfUiId": "G1.HCF_BADGE",
        "shownFactor": 6,
        "editableNumerator": true,
        "editableDenominator": true,
        "showWorkedDivisionBeforeSubmit": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "policy": {
        "hintPolicy": "guided",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [
        "G1.PRE"
      ],
      "feedback": {
        "correct": {
          "uiIds": [
            "FB.CORRECT_SIMPLEST"
          ],
          "ryanUtteranceIds": [
            "G1.CORRECT"
          ],
          "next": "G2"
        },
        "incorrectDefault": {
          "uiIds": [
            "FB.NEUTRAL_RECHECK"
          ],
          "ryanUtteranceIds": [],
          "next": "RETRY_G1_ONCE_THEN_CLASSIFY"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "methodEvidence.changedOnlyOneSide === true",
          "family": "one_side",
          "uiIds": [
            "FB.ONE_SIDE"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_after_direct_cue"
        },
        {
          "detectedBy": "same shown factor 6 is applied to both fields but one quotient is incorrect",
          "family": "arithmetic_slip",
          "uiIds": [
            "FB.ARITHMETIC_SLIP"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "never_classify_conceptually_from_one_slip"
        },
        {
          "detectedBy": "response is equivalent to 18/30 but gcd(response.numerator,response.denominator) > 1",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_or_explicit_unfinished_claim"
        },
        {
          "detectedBy": "response is not equivalent to 18/30",
          "family": "value_change",
          "uiIds": [
            "FB.VALUE_CHANGE"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_or_visible_systematic_method"
        }
      ],
      "authorOnlyAccessibility": "Announce the displayed fraction, the visible HCF = 6 badge and two labelled fraction-entry fields. Do not announce the quotients before submit."
    },
    {
      "id": "G2",
      "stage": "guided",
      "authorOnlyAssessmentIntent": "Choose exact common factors, preserve value and make a genuine stopping decision.",
      "evidenceFamily": "procedural_and_stopping",
      "promptUiId": "G2.PROMPT",
      "sourceFraction": {
        "numerator": 36,
        "denominator": 60
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 5
      },
      "visual": {
        "kind": "factor_route_builder",
        "factorPromptUiId": "G2.FACTOR_PROMPT",
        "validFirstFactorsAuthorOnly": [
          2,
          3,
          4,
          6,
          12
        ],
        "showValidFactorListBeforeChoice": false,
        "stateButtons": {
          "finishedUiId": "COMMON.FINISHED",
          "divideAgainUiId": "COMMON.DIVIDE_AGAIN"
        },
        "engineComputesBothQuotientsAfterValidFactor": true,
        "showFinalFactorCheckOnlyAfterFinishedChoice": true
      },
      "response": {
        "kind": "factor_route_builder",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "acceptedRoutes": {
        "rule": "At every step choose an integer factor greater than 1 that divides the current numerator and denominator exactly. The system divides both by that factor. Finish only at gcd = 1.",
        "examples": [
          [
            {
              "before": {
                "numerator": 36,
                "denominator": 60
              },
              "factor": 12,
              "after": {
                "numerator": 3,
                "denominator": 5
              }
            }
          ],
          [
            {
              "before": {
                "numerator": 36,
                "denominator": 60
              },
              "factor": 2,
              "after": {
                "numerator": 18,
                "denominator": 30
              }
            },
            {
              "before": {
                "numerator": 18,
                "denominator": 30
              },
              "factor": 6,
              "after": {
                "numerator": 3,
                "denominator": 5
              }
            }
          ],
          [
            {
              "before": {
                "numerator": 36,
                "denominator": 60
              },
              "factor": 3,
              "after": {
                "numerator": 12,
                "denominator": 20
              }
            },
            {
              "before": {
                "numerator": 12,
                "denominator": 20
              },
              "factor": 4,
              "after": {
                "numerator": 3,
                "denominator": 5
              }
            }
          ],
          [
            {
              "before": {
                "numerator": 36,
                "denominator": 60
              },
              "factor": 4,
              "after": {
                "numerator": 9,
                "denominator": 15
              }
            },
            {
              "before": {
                "numerator": 9,
                "denominator": 15
              },
              "factor": 3,
              "after": {
                "numerator": 3,
                "denominator": 5
              }
            }
          ],
          [
            {
              "before": {
                "numerator": 36,
                "denominator": 60
              },
              "factor": 6,
              "after": {
                "numerator": 6,
                "denominator": 10
              }
            },
            {
              "before": {
                "numerator": 6,
                "denominator": 10
              },
              "factor": 2,
              "after": {
                "numerator": 3,
                "denominator": 5
              }
            }
          ]
        ],
        "knownStopEarlyStates": [
          {
            "numerator": 18,
            "denominator": 30
          },
          {
            "numerator": 12,
            "denominator": 20
          },
          {
            "numerator": 9,
            "denominator": 15
          },
          {
            "numerator": 6,
            "denominator": 10
          }
        ]
      },
      "policy": {
        "hintPolicy": "guided",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [
        "G2.PRE"
      ],
      "feedback": {
        "correct": {
          "uiIds": [
            "G2.CORRECT"
          ],
          "ryanUtteranceIds": [],
          "next": "GUIDED_GATE"
        },
        "incorrectDefault": {
          "uiIds": [
            "FB.NEUTRAL_RECHECK"
          ],
          "ryanUtteranceIds": [],
          "next": "RETRY_CURRENT_STATE"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "chosen factor does not divide current numerator and denominator exactly",
          "family": "non_common",
          "uiIds": [
            "FB.NON_COMMON"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repair_on_second_invalid_factor_choice"
        },
        {
          "detectedBy": "learner chooses Finished while gcd(current numerator,current denominator) > 1",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_or_explicit_smaller_numbers_reasoning"
        }
      ],
      "authorOnlyAccessibility": "Announce the current fraction, factor-entry control and Finished/Divide again controls. Do not announce valid factors or the HCF."
    },
    {
      "id": "F1",
      "stage": "faded",
      "authorOnlyAssessmentIntent": "Use visible factor rows to choose a shared factor and reach the unique simplest form.",
      "evidenceFamily": "procedural",
      "promptUiId": "F1.PROMPT",
      "sourceFraction": {
        "numerator": 28,
        "denominator": 42
      },
      "expectedFraction": {
        "numerator": 2,
        "denominator": 3
      },
      "visual": {
        "kind": "factor_rows_plus_fraction_input",
        "factorRowsUiIds": [
          "F1.FACTORS_28",
          "F1.FACTORS_42"
        ],
        "numeratorFactors": [
          1,
          2,
          4,
          7,
          14,
          28
        ],
        "denominatorFactors": [
          1,
          2,
          3,
          6,
          7,
          14,
          21,
          42
        ],
        "sharedFactors": [
          1,
          2,
          7,
          14
        ],
        "highestCommonFactor": 14,
        "prehighlightSharedFactors": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "hint": {
        "startsCollapsed": true,
        "buttonUiId": "COMMON.ASK_HINT",
        "ryanUtteranceIds": [
          "F1.HINT"
        ],
        "openCountsAsWrong": false,
        "requiresFreshNoHintConfirmationIfCorrect": false
      },
      "policy": {
        "hintPolicy": "optional",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [
            "FB.CORRECT_SIMPLEST"
          ],
          "ryanUtteranceIds": [],
          "next": "F2"
        },
        "incorrectDefault": {
          "uiIds": [
            "FB.NEUTRAL_RECHECK"
          ],
          "ryanUtteranceIds": [],
          "next": "RETRY_F1_OR_ROUTE_REPAIR"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "equivalent response has gcd > 1",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_or_explicit_unfinished_claim"
        },
        {
          "detectedBy": "one input field changes while the other remains 28 or 42",
          "family": "one_side",
          "uiIds": [
            "FB.ONE_SIDE"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_after_direct_cue"
        }
      ],
      "conditionalRoute": "Shown only on the standard route. Strong guided evidence skips F1."
    },
    {
      "id": "F2",
      "stage": "faded",
      "authorOnlyAssessmentIntent": "Recognise the end condition without performing a supplied procedure.",
      "evidenceFamily": "reasoning",
      "promptUiId": "F2.PROMPT",
      "visual": {
        "kind": "four_fraction_choice_cards",
        "fractions": [
          {
            "optionId": "A",
            "fraction": {
              "numerator": 9,
              "denominator": 15
            },
            "uiId": "F2.OPTION.A"
          },
          {
            "optionId": "B",
            "fraction": {
              "numerator": 10,
              "denominator": 21
            },
            "uiId": "F2.OPTION.B"
          },
          {
            "optionId": "C",
            "fraction": {
              "numerator": 14,
              "denominator": 35
            },
            "uiId": "F2.OPTION.C"
          },
          {
            "optionId": "D",
            "fraction": {
              "numerator": 16,
              "denominator": 24
            },
            "uiId": "F2.OPTION.D"
          }
        ],
        "prehighlightFactors": false
      },
      "response": {
        "kind": "single_choice",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "answerOptionId": "B",
      "hint": {
        "startsCollapsed": true,
        "buttonUiId": "COMMON.ASK_HINT",
        "ryanUtteranceIds": [
          "F2.HINT"
        ],
        "openCountsAsWrong": false,
        "requiresFreshNoHintConfirmationIfCorrect": false
      },
      "policy": {
        "hintPolicy": "optional",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [
        "F2.PRE"
      ],
      "feedback": {
        "correct": {
          "uiIds": [
            "F2.CORRECT"
          ],
          "ryanUtteranceIds": [],
          "next": "I1"
        },
        "incorrectDefault": {
          "uiIds": [
            "FB.SMALLER_NUMBERS"
          ],
          "ryanUtteranceIds": [],
          "next": "RETRY_F2_OR_ROUTE_REPAIR"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "selected A",
          "family": "stop_early",
          "uiIds": [
            "F2.WRONG.A"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "one_item_feedback_only_unless_pattern_repeats"
        },
        {
          "detectedBy": "selected C",
          "family": "stop_early",
          "uiIds": [
            "F2.WRONG.C"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "one_item_feedback_only_unless_pattern_repeats"
        },
        {
          "detectedBy": "selected D",
          "family": "stop_early",
          "uiIds": [
            "F2.WRONG.D"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "one_item_feedback_only_unless_pattern_repeats"
        }
      ],
      "conditionalRoute": "Always shown, including on the fast route."
    },
    {
      "id": "I1",
      "stage": "independent",
      "authorOnlyAssessmentIntent": "Independent procedural transfer with learner-selected route and no visible factor support.",
      "evidenceFamily": "procedural",
      "promptUiId": "I1.PROMPT",
      "sourceFraction": {
        "numerator": 54,
        "denominator": 90
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 5
      },
      "visual": {
        "kind": "plain_fraction_input",
        "showHcf": false,
        "showFactorLists": false,
        "showAnimationBeforeSubmit": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "hint": {
        "startsCollapsed": true,
        "buttonUiId": "COMMON.ASK_HINT",
        "ryanUtteranceIds": [
          "I1.HINT"
        ],
        "openCountsAsWrong": false,
        "requiresFreshNoHintConfirmationIfCorrect": true,
        "confirmationId": "C-DIR"
      },
      "knownEquivalentButUnfinishedResponses": [
        {
          "numerator": 27,
          "denominator": 45
        },
        {
          "numerator": 9,
          "denominator": 15
        },
        {
          "numerator": 6,
          "denominator": 10
        }
      ],
      "policy": {
        "hintPolicy": "optional",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "requiresFreshNoHintConfirmationIfHintUsed": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [
        "I1.PRE"
      ],
      "feedback": {
        "correct": {
          "uiIds": [
            "FB.CORRECT_SIMPLEST"
          ],
          "ryanUtteranceIds": [],
          "next": "I2_OR_C_DIR_IF_HINT_USED"
        },
        "incorrectDefault": {
          "uiIds": [
            "FB.NEUTRAL_RECHECK"
          ],
          "ryanUtteranceIds": [],
          "next": "RETRY_ONCE_OR_MATCH_REPAIR"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "response is equivalent to 54/90 but gcd > 1",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_or_explicit_unfinished_claim"
        },
        {
          "detectedBy": "method changes one fraction field only",
          "family": "one_side",
          "uiIds": [
            "FB.ONE_SIDE"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_after_direct_cue"
        },
        {
          "detectedBy": "method uses different divisors or a non-equivalent result",
          "family": "value_change",
          "uiIds": [
            "FB.VALUE_CHANGE"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "repeat_or_visible_systematic_method"
        }
      ],
      "authorOnlyAccessibility": "Announce only the fraction, prompt, two fraction-entry fields and collapsed hint control. Do not expose common factors or the answer."
    },
    {
      "id": "I2",
      "stage": "independent",
      "authorOnlyAssessmentIntent": "Distinguish a valid equivalent step from a finished simplest form and reject size-based reasoning.",
      "evidenceFamily": "reasoning_and_stopping",
      "promptUiId": "I2.PROMPT",
      "visual": {
        "kind": "reasoning_choice_with_equation",
        "equation": {
          "source": {
            "numerator": 32,
            "denominator": 48
          },
          "intermediate": {
            "numerator": 16,
            "denominator": 24
          }
        },
        "optionUiIds": [
          "I2.OPTION.A",
          "I2.OPTION.B",
          "I2.OPTION.C",
          "I2.OPTION.D"
        ],
        "prehighlightCommonFactor": false
      },
      "response": {
        "kind": "single_choice",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "answerOptionId": "B",
      "hint": {
        "startsCollapsed": true,
        "buttonUiId": "COMMON.ASK_HINT",
        "ryanUtteranceIds": [
          "I2.HINT"
        ],
        "openCountsAsWrong": false,
        "requiresFreshNoHintConfirmationIfCorrect": true,
        "confirmationId": "C-STOP"
      },
      "policy": {
        "hintPolicy": "optional",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "requiresFreshNoHintConfirmationIfHintUsed": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [
        "I2.PRE"
      ],
      "feedback": {
        "correct": {
          "uiIds": [
            "FB.CORRECT_REASONING"
          ],
          "ryanUtteranceIds": [],
          "next": "INDEPENDENT_GATE_OR_C_STOP_IF_HINT_USED"
        },
        "incorrectDefault": {
          "uiIds": [
            "FB.NEUTRAL_RECHECK"
          ],
          "ryanUtteranceIds": [],
          "next": "RETRY_ONCE_OR_MATCH_REPAIR"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "selected A",
          "family": "smaller_numbers",
          "uiIds": [
            "FB.SMALLER_NUMBERS"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "explicit_size_reasoning_can_trigger_repair"
        },
        {
          "detectedBy": "selected C",
          "family": "unknown",
          "uiIds": [
            "FB.NEUTRAL_RECHECK"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "fresh_discriminator_before_classification"
        },
        {
          "detectedBy": "selected D",
          "family": "value_change",
          "uiIds": [
            "FB.VALUE_CHANGE"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "explicit_different_divisors_reasoning_can_trigger_repair"
        }
      ],
      "authorOnlyAccessibility": "Read the full equation and each option. Do not announce that 8 is common before the learner opens the hint or submits."
    },
    {
      "id": "C-DIR",
      "stage": "confirmation",
      "authorOnlyAssessmentIntent": "Fresh no-hint confirmation after supported success on direct simplification.",
      "evidenceFamily": "procedural",
      "promptUiId": "C-DIR.PROMPT",
      "sourceFraction": {
        "numerator": 45,
        "denominator": 75
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 5
      },
      "visual": {
        "kind": "plain_fraction_input",
        "showSupport": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [
            "RECOVERY.CORRECT"
          ],
          "ryanUtteranceIds": [],
          "next": "RESUME_AFTER_DIRECT_CONFIRMATION"
        },
        "incorrectDefault": {
          "uiIds": [
            "RECOVERY.INCORRECT"
          ],
          "ryanUtteranceIds": [],
          "next": "MATCHING_REPAIR"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      }
    },
    {
      "id": "C-STOP",
      "stage": "confirmation",
      "authorOnlyAssessmentIntent": "Fresh no-hint confirmation after supported success on the stopping decision.",
      "evidenceFamily": "stopping",
      "promptUiId": "C-STOP.PROMPT",
      "sourceFraction": {
        "numerator": 18,
        "denominator": 27
      },
      "shownIntermediateFraction": {
        "numerator": 6,
        "denominator": 9
      },
      "expectedFraction": {
        "numerator": 2,
        "denominator": 3
      },
      "visual": {
        "kind": "intermediate_then_final_fraction_input",
        "showSourceAndIntermediate": true,
        "showRemainingFactorBeforeSubmit": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.CHECK_ANSWER"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [
            "RECOVERY.CORRECT"
          ],
          "ryanUtteranceIds": [],
          "next": "RESUME_AFTER_STOP_CONFIRMATION"
        },
        "incorrectDefault": {
          "uiIds": [
            "RECOVERY.INCORRECT"
          ],
          "ryanUtteranceIds": [],
          "next": "R-EARLY"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      }
    },
    {
      "id": "M1",
      "stage": "final",
      "authorOnlyAssessmentIntent": "Fresh unsupported direct simplification with a one-step efficient route available after lock.",
      "evidenceFamily": "procedural",
      "promptUiId": "FINAL.M1.PROMPT",
      "sourceFraction": {
        "numerator": 42,
        "denominator": 56
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 4
      },
      "visual": {
        "kind": "plain_fraction_input",
        "showSupport": false,
        "showHcfBeforeSubmit": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.SUBMIT"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M1.CORRECT"
          ],
          "next": "M1_WORKED_CHECK"
        },
        "incorrectDefault": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M1.INCORRECT"
          ],
          "next": "M1_WORKED_CHECK"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "response equivalent to 42/56 but not in simplest form",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "record_form_error_from_locked_response"
        }
      ],
      "workedCheck": {
        "requiresAnswerLocked": true,
        "mustFollowOutcomeFeedback": true,
        "uiIds": [
          "FINAL.M1.WORK.1",
          "FINAL.M1.WORK.2",
          "FINAL.M1.WORK.3"
        ],
        "ryanUtteranceIds": [],
        "authorOnlyReveal": "Show factor 14, both exact divisions, 3/4, then the common-factor-only-1 check."
      }
    },
    {
      "id": "M2",
      "stage": "final",
      "authorOnlyAssessmentIntent": "Fresh unsupported evidence that a valid intermediate form is not necessarily finished.",
      "evidenceFamily": "stopping",
      "promptUiId": "FINAL.M2.PROMPT",
      "sourceFraction": {
        "numerator": 72,
        "denominator": 120
      },
      "shownIntermediateFraction": {
        "numerator": 12,
        "denominator": 20
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 5
      },
      "visual": {
        "kind": "shown_intermediate_plus_fraction_input",
        "showSourceFraction": true,
        "showIntermediateFraction": true,
        "showRemainingFactorBeforeSubmit": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.SUBMIT"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M2.CORRECT"
          ],
          "next": "M2_WORKED_CHECK"
        },
        "incorrectDefault": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M2.INCORRECT"
          ],
          "next": "M2_WORKED_CHECK"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "submitted 12/20 or another equivalent unsimplified form",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "record_form_error_from_locked_response"
        }
      ],
      "workedCheck": {
        "requiresAnswerLocked": true,
        "mustFollowOutcomeFeedback": true,
        "uiIds": [
          "FINAL.M2.WORK.1",
          "FINAL.M2.WORK.2",
          "FINAL.M2.WORK.3",
          "FINAL.M2.WORK.4"
        ],
        "ryanUtteranceIds": [],
        "authorOnlyReveal": "Highlight the common factor 4 on 12 and 20, then reveal both divisions and 3/5."
      }
    },
    {
      "id": "M3",
      "stage": "final",
      "authorOnlyAssessmentIntent": "Fresh unsupported reasoning evidence for recognising an already-simplified fraction.",
      "evidenceFamily": "reasoning",
      "promptUiId": "FINAL.M3.PROMPT",
      "sourceFraction": {
        "numerator": 14,
        "denominator": 25
      },
      "expectedFraction": {
        "numerator": 14,
        "denominator": 25
      },
      "visual": {
        "kind": "statement_choice_with_fraction",
        "optionUiIds": [
          "FINAL.M3.OPTION.A",
          "FINAL.M3.OPTION.B",
          "FINAL.M3.OPTION.C",
          "FINAL.M3.OPTION.D"
        ],
        "showFactorListsBeforeSubmit": false
      },
      "response": {
        "kind": "single_choice",
        "submitUiId": "COMMON.SUBMIT"
      },
      "answerOptionId": "A",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M3.CORRECT"
          ],
          "next": "M3_WORKED_CHECK"
        },
        "incorrectDefault": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M3.INCORRECT"
          ],
          "next": "M3_WORKED_CHECK"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "selected B",
          "family": "smaller_numbers",
          "uiIds": [
            "FB.SMALLER_NUMBERS"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "explicit_size_reasoning_can_count_as_discriminating_evidence"
        },
        {
          "detectedBy": "selected C",
          "family": "non_common",
          "uiIds": [
            "FB.NON_COMMON"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "factor_2_does_not_divide_25"
        },
        {
          "detectedBy": "selected D",
          "family": "value_change",
          "uiIds": [
            "FB.VALUE_CHANGE"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "explicit_different_divisors_reasoning"
        }
      ],
      "workedCheck": {
        "requiresAnswerLocked": true,
        "mustFollowOutcomeFeedback": true,
        "uiIds": [
          "FINAL.M3.WORK.1",
          "FINAL.M3.WORK.2",
          "FINAL.M3.WORK.3"
        ],
        "ryanUtteranceIds": [],
        "authorOnlyReveal": "Reveal the two factor lists, connect only 1, and then show the already-simplest conclusion."
      }
    },
    {
      "id": "M4",
      "stage": "final",
      "authorOnlyAssessmentIntent": "Fresh unsupported simplification of a positive improper fraction while preserving the FRA-11 boundary.",
      "evidenceFamily": "procedural_and_boundary",
      "promptUiId": "FINAL.M4.PROMPT",
      "sourceFraction": {
        "numerator": 84,
        "denominator": 60
      },
      "expectedFraction": {
        "numerator": 7,
        "denominator": 5
      },
      "visual": {
        "kind": "plain_fraction_input_with_boundary_badge",
        "boundaryBadgeUiId": "FINAL.M4.BADGE",
        "renderMixedNumberControl": false
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.SUBMIT"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M4.CORRECT"
          ],
          "next": "M4_WORKED_CHECK"
        },
        "incorrectDefault": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M4.INCORRECT"
          ],
          "next": "M4_WORKED_CHECK"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "response is a mixed number representation",
          "family": "unknown",
          "uiIds": [
            "FINAL.M4.BADGE"
          ],
          "ryanUtteranceIds": [
            "M4.INCORRECT"
          ],
          "classificationRule": "boundary_feedback_not_a_simplification_misconception_by_itself"
        },
        {
          "detectedBy": "response equivalent to 84/60 but gcd > 1",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "record_form_error_from_locked_response"
        }
      ],
      "workedCheck": {
        "requiresAnswerLocked": true,
        "mustFollowOutcomeFeedback": true,
        "uiIds": [
          "FINAL.M4.WORK.1",
          "FINAL.M4.WORK.2",
          "FINAL.M4.WORK.3"
        ],
        "ryanUtteranceIds": [],
        "authorOnlyReveal": "Show factor 12, exact divisions, 7/5 and the no-mixed-number boundary."
      }
    },
    {
      "id": "M5",
      "stage": "final",
      "authorOnlyAssessmentIntent": "Fresh unsupported application: form the context fraction and then simplify it.",
      "evidenceFamily": "application",
      "promptUiId": "FINAL.M5.PROMPT",
      "sourceFraction": {
        "numerator": 18,
        "denominator": 30
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 5
      },
      "visual": {
        "kind": "ticket_set",
        "totalTicketCount": 30,
        "selectedTicketCount": 18,
        "selectedMeaning": "sold online",
        "visualLabelUiId": "FINAL.M5.VISUAL_LABEL",
        "selectedStateUsesColorAndOutline": true,
        "showFractionBeforeSubmit": false,
        "exactGeometry": "Render exactly 30 equal-size ticket tiles in a readable grid; exactly 18 use the selected online state."
      },
      "response": {
        "kind": "fraction_input",
        "submitUiId": "COMMON.SUBMIT"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correct": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M5.CORRECT"
          ],
          "next": "M5_WORKED_CHECK"
        },
        "incorrectDefault": {
          "uiIds": [],
          "ryanUtteranceIds": [
            "M5.INCORRECT"
          ],
          "next": "M5_WORKED_CHECK"
        },
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterErrorSpecific": true
      },
      "errorSignals": [
        {
          "detectedBy": "submitted 18/30 or another equivalent unsimplified form",
          "family": "stop_early",
          "uiIds": [
            "FB.STOP_EARLY"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "record_form_error_from_locked_response"
        },
        {
          "detectedBy": "submitted 12/30 or 12/18",
          "family": "unknown",
          "uiIds": [
            "FB.NEUTRAL_RECHECK"
          ],
          "ryanUtteranceIds": [],
          "classificationRule": "context_selection_error_requires_fresh_discriminator"
        }
      ],
      "workedCheck": {
        "requiresAnswerLocked": true,
        "mustFollowOutcomeFeedback": true,
        "uiIds": [
          "FINAL.M5.WORK.1",
          "FINAL.M5.WORK.2",
          "FINAL.M5.WORK.3",
          "FINAL.M5.WORK.4"
        ],
        "ryanUtteranceIds": [],
        "authorOnlyReveal": "First reveal 18/30 from the context, then factor 6, exact divisions and 3/5."
      },
      "authorOnlyAccessibility": "The prompt already states 18 of 30. The semantic visual may announce 30 equal ticket tiles with 18 marked online; this does not solve the simplification step."
    }
  ],
  "finalIntroUtteranceIds": [
    "FINAL.INTRO.1",
    "FINAL.INTRO.2"
  ],
  "misconceptions": [
    {
      "family": "stop_early",
      "observable": "Equivalent but unsimplified response, such as 6/9 for 12/18, or an explicit claim that 16/24 is finished.",
      "immediateUiId": "FB.STOP_EARLY",
      "repairId": "R-EARLY",
      "repairTrigger": "Repeat, or an explicit explanation that smaller numbers alone prove the answer is finished.",
      "classificationGuard": "One unsimplified response may be an isolated stopping slip; use repeat or discriminating evidence.",
      "severity": "blocking"
    },
    {
      "family": "one_side",
      "observable": "Only the numerator or only the denominator is divided.",
      "immediateUiId": "FB.ONE_SIDE",
      "repairId": "R-BOTH",
      "repairTrigger": "Repeat after one direct both-fields cue.",
      "classificationGuard": "Confirm from the visible method or unchanged field; do not infer one-side thinking from an arbitrary wrong fraction.",
      "severity": "blocking"
    },
    {
      "family": "non_common",
      "observable": "A chosen factor does not divide both current numbers exactly.",
      "immediateUiId": "FB.NON_COMMON",
      "repairId": "R-COMMON",
      "repairTrigger": "Second invalid-factor choice.",
      "classificationGuard": "A single mistyped factor receives precise feedback but does not yet prove a persistent misconception.",
      "severity": "blocking"
    },
    {
      "family": "smaller_numbers",
      "observable": "Calls 6/10 simplest because its numbers look small or rejects 7/12 because 12 looks large.",
      "immediateUiId": "FB.SMALLER_NUMBERS",
      "repairId": "R-SMALL",
      "repairTrigger": "Two discriminating responses or one explicit size-based explanation.",
      "classificationGuard": "Prefer an explicit reasoning choice or paired examples over guessing from one wrong fraction.",
      "severity": "blocking"
    },
    {
      "family": "value_change",
      "observable": "Uses different divisors, subtracts a factor, or produces a non-equivalent fraction through a systematic method.",
      "immediateUiId": "FB.VALUE_CHANGE",
      "repairId": "R-VALUE",
      "repairTrigger": "Repeat or a visible systematic method.",
      "classificationGuard": "If one correct common factor was selected but a quotient fact is wrong, classify arithmetic slip instead.",
      "severity": "blocking"
    },
    {
      "family": "arithmetic_slip",
      "observable": "The same valid factor is used on both numbers, but one whole-number division fact is wrong.",
      "immediateUiId": "FB.ARITHMETIC_SLIP",
      "repairId": "R-ARITHMETIC-CHECK",
      "repairTrigger": "Never run a conceptual repair from one slip; use a short calculation check and one fresh fraction.",
      "classificationGuard": "Method evidence must show a valid common factor and otherwise consistent simplification structure.",
      "severity": "non_blocking_unless_repeated"
    }
  ],
  "repairs": [
    {
      "id": "R-EARLY",
      "stage": "repair",
      "family": "stop_early",
      "authorOnlyPurpose": "Separate a valid equivalent intermediate form from the required finished form.",
      "visual": {
        "kind": "three_state_simplification_chain",
        "states": [
          {
            "fraction": {
              "numerator": 16,
              "denominator": 24
            },
            "label": "valid, but unfinished"
          },
          {
            "fraction": {
              "numerator": 8,
              "denominator": 12
            },
            "label": "still share 4"
          },
          {
            "fraction": {
              "numerator": 2,
              "denominator": 3
            },
            "label": "finished"
          }
        ]
      },
      "ryanUtteranceIds": [
        "R-EARLY.1",
        "R-EARLY.2",
        "R-EARLY.3",
        "R-EARLY.4"
      ],
      "timeline": [
        {
          "id": "R-EARLY.CUE.1",
          "utteranceId": "R-EARLY.1",
          "anchorText": "not finished",
          "authorOnlyAction": "Mark 8/12 as equivalent to the original but leave the finished badge hidden.",
          "reducedMotionState": "Show 8/12 with a ‘valid, not finished’ label.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-EARLY.CUE.2",
          "utteranceId": "R-EARLY.2",
          "anchorText": "divide by four",
          "authorOnlyAction": "Highlight factor 4 on 8 and 12.",
          "reducedMotionState": "Show a factor-4 connector beside 8/12.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-EARLY.CUE.3",
          "utteranceId": "R-EARLY.3",
          "anchorText": "two thirds",
          "authorOnlyAction": "Change 8/12 to 2/3 only after the learner completes the supported step.",
          "reducedMotionState": "Show the completed 8/12 ÷ 4 = 2/3 state.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-EARLY.CUE.4",
          "utteranceId": "R-EARLY.4",
          "anchorText": "answer is finished",
          "authorOnlyAction": "Reveal HCF(2,3) = 1 and the finished badge.",
          "reducedMotionState": "Show the final factor check and badge.",
          "mustNotOccurBeforeAnchor": true
        }
      ],
      "supportedInteraction": {
        "promptUiId": "REPAIR.EARLY.ACTION",
        "responseKind": "factor_choice_then_fraction",
        "expectedChoice": "divide_again",
        "expectedFactor": 4,
        "systemChangesBothNumbersTogether": true,
        "ifFinishedChosenAgain": "Point once to the common-factor check, then require the factor-4 step. Do not replay the full lesson."
      },
      "freshCheckCandidates": [
        {
          "id": "R-EARLY-CHECK-1",
          "sourceFraction": {
            "numerator": 21,
            "denominator": 35
          },
          "expectedFraction": {
            "numerator": 3,
            "denominator": 5
          },
          "prompt": "Write 21/35 in simplest form.",
          "useWhen": "always unless this exact math signature was already shown"
        },
        {
          "id": "R-EARLY-CHECK-2",
          "sourceFraction": {
            "numerator": 45,
            "denominator": 105
          },
          "expectedFraction": {
            "numerator": 3,
            "denominator": 7
          },
          "prompt": "Write 45/105 in simplest form.",
          "useWhen": "fallback if R-EARLY-CHECK-1 is already in attempt history"
        }
      ],
      "resumeAfterFreshPass": "return_to_the_interrupted_route"
    },
    {
      "id": "R-BOTH",
      "stage": "repair",
      "family": "one_side",
      "authorOnlyPurpose": "Restore same-factor movement of numerator and denominator and protect value preservation.",
      "visual": {
        "kind": "invalid_vs_valid_same_factor",
        "invalid": {
          "sourceFraction": {
            "numerator": 18,
            "denominator": 30
          },
          "resultFraction": {
            "numerator": 3,
            "denominator": 30
          },
          "label": "different value"
        },
        "valid": {
          "sourceFraction": {
            "numerator": 18,
            "denominator": 30
          },
          "factor": 6,
          "resultFraction": {
            "numerator": 3,
            "denominator": 5
          },
          "label": "same value"
        }
      },
      "ryanUtteranceIds": [
        "R-BOTH.1",
        "R-BOTH.2",
        "R-BOTH.3",
        "R-BOTH.4"
      ],
      "timeline": [
        {
          "id": "R-BOTH.CUE.1",
          "utteranceId": "R-BOTH.1",
          "anchorText": "one part",
          "authorOnlyAction": "Show 18/30 -> 3/30 and mark the unchanged denominator.",
          "reducedMotionState": "Show the invalid equation with the unchanged 30 outlined.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-BOTH.CUE.2",
          "utteranceId": "R-BOTH.2",
          "anchorText": "same factor",
          "authorOnlyAction": "Connect one factor-6 chip to both numerator and denominator.",
          "reducedMotionState": "Show one factor-6 connector branching to both numbers.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-BOTH.CUE.3",
          "utteranceId": "R-BOTH.3",
          "anchorText": "three, and thirty divided by six is five",
          "authorOnlyAction": "Reveal 18 ÷ 6 = 3 and 30 ÷ 6 = 5 in spoken order.",
          "reducedMotionState": "Show both completed division statements.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-BOTH.CUE.4",
          "utteranceId": "R-BOTH.4",
          "anchorText": "three fifths",
          "authorOnlyAction": "Reveal 3/5 with same-value and simplest-form labels.",
          "reducedMotionState": "Show the completed valid equation and labels.",
          "mustNotOccurBeforeAnchor": true
        }
      ],
      "supportedInteraction": {
        "responseKind": "factor_choice_then_fraction",
        "sourceFraction": {
          "numerator": 18,
          "denominator": 30
        },
        "expectedFactor": 6,
        "numeratorFieldAndDenominatorFieldBothRequired": true,
        "rejectOneFieldSubmission": true
      },
      "freshCheckCandidates": [
        {
          "id": "R-BOTH-CHECK-PDF",
          "sourceFraction": {
            "numerator": 28,
            "denominator": 42
          },
          "expectedFraction": {
            "numerator": 2,
            "denominator": 3
          },
          "prompt": "Write 28/42 in simplest form.",
          "useWhen": "F1 was skipped and 28/42 is not in attempt history"
        },
        {
          "id": "R-BOTH-CHECK-FRESH",
          "sourceFraction": {
            "numerator": 35,
            "denominator": 49
          },
          "expectedFraction": {
            "numerator": 5,
            "denominator": 7
          },
          "prompt": "Write 35/49 in simplest form.",
          "useWhen": "28/42 has already been shown or F1 was completed"
        }
      ],
      "resumeAfterFreshPass": "return_to_the_interrupted_route"
    },
    {
      "id": "R-COMMON",
      "stage": "repair",
      "family": "non_common",
      "authorOnlyPurpose": "Require a factor to divide numerator and denominator exactly before a new fraction is formed.",
      "visual": {
        "kind": "try_factor_on_both_numbers",
        "sourceFraction": {
          "numerator": 24,
          "denominator": 36
        },
        "factorCards": [
          {
            "factor": 8,
            "numeratorResult": 3,
            "denominatorResult": null,
            "validity": "works_on_numerator_only"
          },
          {
            "factor": 18,
            "numeratorResult": null,
            "denominatorResult": 2,
            "validity": "works_on_denominator_only"
          },
          {
            "factor": 12,
            "numeratorResult": 2,
            "denominatorResult": 3,
            "validity": "common_factor"
          }
        ],
        "acceptedResult": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "ryanUtteranceIds": [
        "R-COMMON.1",
        "R-COMMON.2",
        "R-COMMON.3",
        "R-COMMON.4"
      ],
      "timeline": [
        {
          "id": "R-COMMON.CUE.1",
          "utteranceId": "R-COMMON.1",
          "anchorText": "both numbers exactly",
          "authorOnlyAction": "Show the factor cards and two exact-division check slots.",
          "reducedMotionState": "Show all cards and empty check slots.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-COMMON.CUE.2",
          "utteranceId": "R-COMMON.2",
          "anchorText": "does not divide thirty-six exactly",
          "authorOnlyAction": "Show 24 ÷ 8 = 3 and reject the 36 ÷ 8 slot as non-integer before forming any fraction.",
          "reducedMotionState": "Show the valid numerator quotient and an invalid denominator marker.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-COMMON.CUE.3",
          "utteranceId": "R-COMMON.3",
          "anchorText": "Using twelve gives two thirds",
          "authorOnlyAction": "Show both exact divisions by 12 and form 2/3.",
          "reducedMotionState": "Show 24 ÷ 12 = 2, 36 ÷ 12 = 3 and 2/3.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-COMMON.CUE.4",
          "utteranceId": "R-COMMON.4",
          "anchorText": "already simplest",
          "authorOnlyAction": "Reveal the no-factor-greater-than-1 stop check.",
          "reducedMotionState": "Show HCF = 1 beside the accepted result.",
          "mustNotOccurBeforeAnchor": true
        }
      ],
      "supportedInteraction": {
        "promptUiId": "REPAIR.COMMON.ACTION",
        "responseKind": "factor_choice_then_fraction",
        "correctFactor": 12,
        "rejectBeforeFormingFraction": [
          8,
          18
        ]
      },
      "freshCheck": {
        "id": "R-COMMON-CHECK",
        "responseKind": "factor_choice_then_fraction",
        "sourceFraction": {
          "numerator": 45,
          "denominator": 60
        },
        "factorOptions": [
          4,
          6,
          10,
          15
        ],
        "correctFactor": 15,
        "expectedFraction": {
          "numerator": 3,
          "denominator": 4
        },
        "prompt": "Which factor can divide both 45 and 60 exactly: 4, 6, 10 or 15? Then write the simplified fraction."
      },
      "resumeAfterFreshPass": "return_to_the_interrupted_route"
    },
    {
      "id": "R-SMALL",
      "stage": "repair",
      "family": "smaller_numbers",
      "authorOnlyPurpose": "Replace number-size appearance with the common-factor test.",
      "visual": {
        "kind": "small_not_simple_vs_larger_simple",
        "left": {
          "fraction": {
            "numerator": 6,
            "denominator": 10
          },
          "sharedFactor": 2,
          "classification": "can_simplify"
        },
        "right": {
          "fraction": {
            "numerator": 11,
            "denominator": 18
          },
          "sharedFactor": 1,
          "classification": "already_simplest"
        }
      },
      "ryanUtteranceIds": [
        "R-SMALL.1",
        "R-SMALL.2",
        "R-SMALL.3",
        "R-SMALL.4"
      ],
      "timeline": [
        {
          "id": "R-SMALL.CUE.1",
          "utteranceId": "R-SMALL.1",
          "anchorText": "share a factor",
          "authorOnlyAction": "Show the two comparison cards without revealing classifications.",
          "reducedMotionState": "Show both cards in their final positions.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-SMALL.CUE.2",
          "utteranceId": "R-SMALL.2",
          "anchorText": "divide by two",
          "authorOnlyAction": "Highlight factor 2 on 6 and 10 and mark 6/10 as can simplify.",
          "reducedMotionState": "Show a factor-2 connector and the classification label.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-SMALL.CUE.3",
          "utteranceId": "R-SMALL.3",
          "anchorText": "share only one",
          "authorOnlyAction": "Show factor checks for 11 and 18 linked only at 1.",
          "reducedMotionState": "Show the completed factor check and already-simplest label.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-SMALL.CUE.4",
          "utteranceId": "R-SMALL.4",
          "anchorText": "common-factor test",
          "authorOnlyAction": "Place the canonical test between the two cards.",
          "reducedMotionState": "Show the test as a static callout.",
          "mustNotOccurBeforeAnchor": true
        }
      ],
      "supportedInteraction": {
        "promptUiId": "REPAIR.SMALL.ACTION",
        "responseKind": "sort_then_factor",
        "items": [
          {
            "fraction": {
              "numerator": 9,
              "denominator": 14
            },
            "correctBucket": "already_simplest",
            "sharedFactorsGreaterThanOne": []
          },
          {
            "fraction": {
              "numerator": 14,
              "denominator": 21
            },
            "correctBucket": "can_simplify",
            "sharedFactorsGreaterThanOne": [
              7
            ],
            "expectedSelectedFactor": 7
          }
        ]
      },
      "freshCheck": {
        "id": "R-SMALL-CHECK",
        "responseKind": "single_choice",
        "prompt": "Which fraction is already simplest: 12/25, 9/21 or 10/16?",
        "options": [
          {
            "id": "A",
            "fraction": {
              "numerator": 12,
              "denominator": 25
            }
          },
          {
            "id": "B",
            "fraction": {
              "numerator": 9,
              "denominator": 21
            }
          },
          {
            "id": "C",
            "fraction": {
              "numerator": 10,
              "denominator": 16
            }
          }
        ],
        "correctOptionId": "A"
      },
      "resumeAfterFreshPass": "return_to_the_interrupted_route"
    },
    {
      "id": "R-VALUE",
      "stage": "repair",
      "family": "value_change",
      "authorOnlyPurpose": "Show that making both numbers smaller is irrelevant if different operations change the value.",
      "visual": {
        "kind": "different_factors_vs_same_factor",
        "invalid": {
          "sourceFraction": {
            "numerator": 24,
            "denominator": 36
          },
          "numeratorDivisor": 6,
          "denominatorDivisor": 4,
          "resultFraction": {
            "numerator": 4,
            "denominator": 9
          },
          "equivalent": false
        },
        "valid": {
          "sourceFraction": {
            "numerator": 24,
            "denominator": 36
          },
          "factor": 12,
          "resultFraction": {
            "numerator": 2,
            "denominator": 3
          },
          "equivalent": true
        }
      },
      "ryanUtteranceIds": [
        "R-VALUE.1",
        "R-VALUE.2",
        "R-VALUE.3"
      ],
      "timeline": [
        {
          "id": "R-VALUE.CUE.1",
          "utteranceId": "R-VALUE.1",
          "anchorText": "same factor",
          "authorOnlyAction": "Show top ÷ 6 and bottom ÷ 4 as two different operations.",
          "reducedMotionState": "Show both divisor labels simultaneously.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-VALUE.CUE.2",
          "utteranceId": "R-VALUE.2",
          "anchorText": "four ninths",
          "authorOnlyAction": "Form 4/9 and mark the value as changed.",
          "reducedMotionState": "Show 4/9 with a different-value label.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-VALUE.CUE.3",
          "utteranceId": "R-VALUE.3",
          "anchorText": "both divide by twelve",
          "authorOnlyAction": "Replace the two divisors with one factor-12 connector.",
          "reducedMotionState": "Show one factor-12 connector to both numbers.",
          "mustNotOccurBeforeAnchor": true
        },
        {
          "id": "R-VALUE.CUE.4",
          "utteranceId": "R-VALUE.3",
          "anchorText": "two thirds",
          "authorOnlyAction": "Reveal 2/3 and mark the value as preserved.",
          "reducedMotionState": "Show the completed valid equation and same-value label.",
          "mustNotOccurBeforeAnchor": true
        }
      ],
      "supportedInteraction": {
        "responseKind": "single_choice",
        "sourceFraction": {
          "numerator": 30,
          "denominator": 45
        },
        "options": [
          {
            "id": "A",
            "label": "Divide both by 5 to make 6/9.",
            "valid": true,
            "nextRequiredFraction": {
              "numerator": 2,
              "denominator": 3
            }
          },
          {
            "id": "B",
            "label": "Divide the top by 5 and the bottom by 3.",
            "valid": false
          },
          {
            "id": "C",
            "label": "Subtract 5 from both numbers.",
            "valid": false
          },
          {
            "id": "D",
            "label": "Divide both by 6.",
            "valid": false
          }
        ],
        "correctOptionId": "A",
        "thenRequireFinalFraction": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "freshCheck": {
        "id": "R-VALUE-CHECK",
        "sourceFraction": {
          "numerator": 42,
          "denominator": 63
        },
        "responseKind": "single_choice",
        "options": [
          {
            "id": "A",
            "label": "Divide both by 7 to make 6/9, then continue to 2/3.",
            "valid": true
          },
          {
            "id": "B",
            "label": "Divide the top by 7 and the bottom by 9.",
            "valid": false
          },
          {
            "id": "C",
            "label": "Subtract 7 from both numbers.",
            "valid": false
          },
          {
            "id": "D",
            "label": "Divide both by 8.",
            "valid": false
          }
        ],
        "correctOptionId": "A",
        "expectedFraction": {
          "numerator": 2,
          "denominator": 3
        }
      },
      "resumeAfterFreshPass": "return_to_the_interrupted_route"
    },
    {
      "id": "R-ARITHMETIC-CHECK",
      "stage": "repair",
      "family": "arithmetic_slip",
      "authorOnlyPurpose": "Check the isolated whole-number division without reclassifying the learner conceptually.",
      "ryanUtteranceIds": [],
      "visibleFeedbackUiIds": [
        "FB.ARITHMETIC_SLIP"
      ],
      "supportedInteraction": {
        "kind": "whole_number_division_check",
        "reuseChosenCommonFactor": true,
        "doNotReplayConceptRepair": true
      },
      "freshCheck": {
        "id": "R-ARITHMETIC-CHECK-1",
        "sourceFraction": {
          "numerator": 40,
          "denominator": 56
        },
        "expectedFraction": {
          "numerator": 5,
          "denominator": 7
        },
        "prompt": "Write 40/56 in simplest form."
      },
      "resumeAfterFreshPass": "return_to_the_interrupted_route"
    }
  ],
  "recoveryBank": [
    {
      "id": "RF-DIRECT-1",
      "stage": "recovery",
      "familyTags": [
        "procedural",
        "stop_early",
        "one_side"
      ],
      "sourceFraction": {
        "numerator": 63,
        "denominator": 81
      },
      "expectedFraction": {
        "numerator": 7,
        "denominator": 9
      },
      "prompt": "Write 63/81 in simplest form.",
      "responseKind": "fraction_input",
      "evidenceFamily": "procedural",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "63 ÷ 9 = 7",
        "81 ÷ 9 = 9",
        "7 and 9 share only 1."
      ]
    },
    {
      "id": "RF-DIRECT-2",
      "stage": "recovery",
      "familyTags": [
        "procedural",
        "one_side",
        "arithmetic_slip"
      ],
      "sourceFraction": {
        "numerator": 50,
        "denominator": 70
      },
      "expectedFraction": {
        "numerator": 5,
        "denominator": 7
      },
      "prompt": "Write 50/70 in simplest form.",
      "responseKind": "fraction_input",
      "evidenceFamily": "procedural",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "50 ÷ 10 = 5",
        "70 ÷ 10 = 7",
        "5 and 7 share only 1."
      ]
    },
    {
      "id": "RF-CONTINUE-1",
      "stage": "recovery",
      "familyTags": [
        "stopping",
        "stop_early"
      ],
      "sourceFraction": {
        "numerator": 84,
        "denominator": 126
      },
      "shownIntermediateFraction": {
        "numerator": 14,
        "denominator": 21
      },
      "expectedFraction": {
        "numerator": 2,
        "denominator": 3
      },
      "prompt": "84/126 has become 14/21. Write the final simplest form.",
      "responseKind": "fraction_input",
      "evidenceFamily": "stopping",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "14 and 21 share 7.",
        "14 ÷ 7 = 2",
        "21 ÷ 7 = 3"
      ]
    },
    {
      "id": "RF-SIMPLE-1",
      "stage": "recovery",
      "familyTags": [
        "reasoning",
        "smaller_numbers",
        "stop_early"
      ],
      "prompt": "Which fraction is already in simplest form?",
      "responseKind": "single_choice",
      "options": [
        {
          "id": "A",
          "fraction": {
            "numerator": 13,
            "denominator": 24
          }
        },
        {
          "id": "B",
          "fraction": {
            "numerator": 15,
            "denominator": 25
          }
        },
        {
          "id": "C",
          "fraction": {
            "numerator": 21,
            "denominator": 28
          }
        },
        {
          "id": "D",
          "fraction": {
            "numerator": 16,
            "denominator": 28
          }
        }
      ],
      "answerOptionId": "A",
      "expectedFraction": {
        "numerator": 13,
        "denominator": 24
      },
      "evidenceFamily": "reasoning",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "13 and 24 share only 1.",
        "15/25, 21/28 and 16/28 each have a common factor greater than 1."
      ]
    },
    {
      "id": "RF-IMPROPER-1",
      "stage": "recovery",
      "familyTags": [
        "procedural",
        "boundary"
      ],
      "sourceFraction": {
        "numerator": 90,
        "denominator": 54
      },
      "expectedFraction": {
        "numerator": 5,
        "denominator": 3
      },
      "prompt": "Write 90/54 in simplest form. Leave it improper.",
      "responseKind": "fraction_input",
      "evidenceFamily": "procedural_and_boundary",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "90 ÷ 18 = 5",
        "54 ÷ 18 = 3",
        "Leave the answer as 5/3."
      ]
    },
    {
      "id": "RF-CONTEXT-1",
      "stage": "recovery",
      "familyTags": [
        "application",
        "stop_early"
      ],
      "sourceFraction": {
        "numerator": 24,
        "denominator": 40
      },
      "expectedFraction": {
        "numerator": 3,
        "denominator": 5
      },
      "prompt": "A learner completed 24 of 40 practice questions. Write the fraction completed in simplest form.",
      "responseKind": "fraction_input",
      "evidenceFamily": "application",
      "visual": {
        "kind": "question_tile_set",
        "totalCount": 40,
        "selectedCount": 24,
        "selectedMeaning": "completed"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "The context gives 24/40.",
        "24 ÷ 8 = 3",
        "40 ÷ 8 = 5"
      ]
    },
    {
      "id": "RF-VALUE-1",
      "stage": "recovery",
      "familyTags": [
        "value_change",
        "reasoning"
      ],
      "sourceFraction": {
        "numerator": 36,
        "denominator": 54
      },
      "expectedFraction": {
        "numerator": 2,
        "denominator": 3
      },
      "prompt": "Choose the valid first step for 36/54, then write the final simplest form.",
      "responseKind": "single_choice_then_fraction",
      "options": [
        {
          "id": "A",
          "label": "Divide both by 6 to make 6/9.",
          "valid": true
        },
        {
          "id": "B",
          "label": "Divide the top by 6 and the bottom by 9.",
          "valid": false
        },
        {
          "id": "C",
          "label": "Subtract 6 from both numbers.",
          "valid": false
        },
        {
          "id": "D",
          "label": "Divide both by 8.",
          "valid": false
        }
      ],
      "answerOptionId": "A",
      "evidenceFamily": "reasoning_and_procedural",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "36/54 ÷ 6 = 6/9.",
        "6/9 ÷ 3 = 2/3."
      ]
    },
    {
      "id": "RF-FACTOR-1",
      "stage": "recovery",
      "familyTags": [
        "non_common",
        "procedural"
      ],
      "sourceFraction": {
        "numerator": 56,
        "denominator": 84
      },
      "expectedFraction": {
        "numerator": 2,
        "denominator": 3
      },
      "prompt": "Which factor divides both 56 and 84 exactly: 5, 7, 9 or 12? Then finish the simplification.",
      "responseKind": "factor_choice_then_fraction",
      "factorOptions": [
        5,
        7,
        9,
        12
      ],
      "correctFactor": 7,
      "evidenceFamily": "procedural",
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "simplestFormRequired": true,
        "allowEquivalentButUnsimplifiedAsCorrect": false
      },
      "feedback": {
        "correctUiIds": [
          "RECOVERY.CORRECT"
        ],
        "incorrectUiIds": [
          "RECOVERY.INCORRECT"
        ],
        "correctRyanUtteranceIds": [],
        "incorrectRyanUtteranceIds": [],
        "playExactlyOneOutcomeBranch": true
      },
      "workedSteps": [
        "56 ÷ 7 = 8",
        "84 ÷ 7 = 12",
        "8/12 ÷ 4 = 2/3"
      ]
    }
  ],
  "flow": {
    "fixedTeachingSequence": [
      "HOOK",
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "HANDOFF"
    ],
    "guidedSequence": [
      "G1",
      "G2"
    ],
    "guidedGate": {
      "strongEvidenceRequires": [
        "G1 first-attempt correct",
        "G2 first-attempt correct",
        "no hint or support escalation",
        "no invalid factor",
        "no one-side change",
        "no finished claim while a common factor remains",
        "no unresolved central misconception"
      ],
      "strongRoute": [
        "skip F1",
        "show F2"
      ],
      "standardRoute": [
        "show F1",
        "show F2"
      ],
      "responseSpeedIsNeverEvidence": true
    },
    "independentSequence": [
      "I1",
      "I2"
    ],
    "independentGate": {
      "cleanNoHint": "proceed_to_final",
      "correctAfterHint": "insert the named fresh no-hint same-family confirmation before final",
      "repeatedCentralError": "run matching repair, require fresh independent pass, then resume",
      "isolatedArithmeticSlip": "run the short arithmetic check and one fresh fraction; do not run a conceptual repair"
    },
    "finalSequence": [
      "M1",
      "M2",
      "M3",
      "M4",
      "M5"
    ],
    "finalPolicy": {
      "noHints": true,
      "answerLocksBeforeFeedback": true,
      "computeCorrectnessFromCommittedAnswer": true,
      "playExactlyOneOutcomeBranch": true,
      "revealWorkedCheckAfterOutcomeFeedback": true,
      "routeFromOriginalLockedAnswer": true,
      "clearWorkedCheckBeforeNextItem": true
    },
    "finalRouting": {
      "fourOrFiveCorrect": "finish only if at least one procedural and one reasoning/application family are independently correct and no blocking misconception repeats; otherwise repair the blocker and require one fresh confirmation",
      "threeCorrect": "repair the missed family or families, then require a fresh two-item mini-check at 2/2 independent",
      "zeroToTwoCorrect": "repair actual weaknesses, then require a fresh three-item final at 3/3 independent; otherwise mark another pass needed"
    },
    "completionUtteranceIds": [
      "COMPLETION"
    ],
    "noDiagnostic": true,
    "noRetrieval": true
  },
  "evidenceContract": {
    "recordFields": [
      "questionId",
      "firstAttemptCorrect",
      "attempts",
      "hintOpenedBeforeSubmit",
      "supportEscalated",
      "errorFamily",
      "answerLocked",
      "submittedFraction",
      "selectedOptionId",
      "selectedFactor",
      "factorHistory",
      "responseMathSignature",
      "freshConfirmationPassed",
      "countsAsIndependentEvidence"
    ],
    "supportedSuccess": "A correct answer after hint use is supported success and does not count as clean independent evidence until the named fresh no-hint confirmation is passed.",
    "retryRule": "A correct retry does not erase the first-attempt result or prior support use.",
    "classificationRule": "Do not infer a misconception from one ambiguous wrong fraction. Use response form, method evidence and repeated or discriminating evidence.",
    "finalEvidenceRule": "Use only committed pre-working final responses. Post-lock worked checks never change the score."
  },
  "engineeringAcceptance": {
    "dataIntegrity": [
      "One question object drives wording, fraction values, valid factors, intermediate states, canonical answer, hints, feedback and worked check.",
      "Every denominator is a positive integer.",
      "Every accepted factor is an integer greater than 1 that divides the current numerator and denominator exactly.",
      "Every valid intermediate fraction is cross-product equivalent to its source.",
      "Every accepted final fraction has gcd(numerator, denominator) = 1.",
      "Factor-route builders accept any exact common-factor chain ending at the unique simplest form; they do not require the HCF first.",
      "The authored positive-number envelope and final HCF cap are preserved."
    ],
    "runtimeCopyBoundary": [
      "Only FRA10_RUNTIME_COPY text may reach Ryan TTS or Ryan captions.",
      "FRA10_LEARNER_UI_COPY, prompts, options, worked steps, authorOnly fields, stage labels and QA prose never become automatic Ryan speech.",
      "No separately authored captionText field exists.",
      "Hints play only after explicit learner request.",
      "Removing speech removes or remaps its caption and visual cues."
    ],
    "outcomeBranching": [
      "Correctness is computed before selecting feedback.",
      "Exactly one correct, error-specific incorrect or default incorrect branch plays.",
      "A wrong response never receives the correct response line, even when both routes later show the same worked check.",
      "Final M1-M5 outcome lines remain item-specific and are not replaced by one generic phrase."
    ],
    "leakageAndSupport": [
      "No common factor or HCF is narrated on independent or final items before submit.",
      "Hints start closed and never state the final answer.",
      "Equivalent unsimplified answers receive form-specific feedback and are not accepted.",
      "Final worked checks are impossible to reveal until answerLocked = true.",
      "Previous worked states clear before the next scored item.",
      "Accessible descriptions provide the visible task structure without supplying a factor or final result."
    ],
    "routeTests": [
      "Strong guided evidence skips F1 but never F2.",
      "Correct-with-hint inserts the named fresh no-hint confirmation.",
      "Repeated errors call the matching repair family.",
      "Repair checks use unseen math signatures.",
      "Final routing is 4-5 finish/conditional repair, 3 repair plus fresh 2, 0-2 repair plus fresh 3.",
      "No route creates global Diagnostic, prerequisite dispatch, Retrieval or future scheduling."
    ],
    "visualAndMathematicalQa": [
      "Every fraction bar has exact equal geometry.",
      "Grouping 6/9 into thirds produces exactly 2/3.",
      "Factor chips, factor lists and division statements match the visible numbers.",
      "All shown division results are exact.",
      "Improper answers remain improper where requested.",
      "M5 shows exactly 30 ticket tiles with exactly 18 selected.",
      "Speech, caption timing and the active visual state match on every cue.",
      "Captions never cover the active fraction, factor controls or worked check."
    ],
    "responsiveAndAccessibility": [
      "Desktop and approximately 390 px mobile are visually inspected.",
      "The central fraction remains dominant; factor lists wrap without changing mathematical order.",
      "Route cards stack vertically; fraction numerator and denominator inputs remain clearly separated.",
      "Interactive controls have at least 44 px touch targets on mobile.",
      "Keyboard focus is visible and every interaction is keyboard operable.",
      "Selected states use border, texture or iconography as well as colour.",
      "Reduced motion presents the same exact mathematical before/after states.",
      "No permanent narration or transcript bar appears.",
      "Audio, captions and visual cue state survive pause, replay, refresh and resume without drift."
    ],
    "regressionAndParallelSafety": [
      "FRA01-FRA09 and FRA11+ learner content remains unchanged.",
      "Any shared-engine change is minimal, backward-compatible and listed in the implementation report.",
      "Do not assume changes from another unmerged FRA task are present.",
      "Use the existing FRA10 route, registry entry, topic-card position, navigation, progress and persistence plumbing."
    ]
  }
};
  const exports = { FRA10 };
  const RECOVERY_FAMILY_PREFERENCE = {
  "stop_early": [
    "RF-CONTINUE-1",
    "RF-DIRECT-1",
    "RF-CONTEXT-1"
  ],
  "one_side": [
    "RF-DIRECT-2",
    "RF-DIRECT-1"
  ],
  "non_common": [
    "RF-FACTOR-1",
    "RF-DIRECT-1"
  ],
  "smaller_numbers": [
    "RF-SIMPLE-1",
    "RF-CONTINUE-1"
  ],
  "value_change": [
    "RF-VALUE-1",
    "RF-DIRECT-2"
  ],
  "arithmetic_slip": [
    "RF-DIRECT-2",
    "RF-DIRECT-1"
  ],
  "boundary": [
    "RF-IMPROPER-1"
  ],
  "application": [
    "RF-CONTEXT-1"
  ]
};
  function gcd(a, b) {
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
        throw new Error("Fraction values must be integers.");
    }
    if (value.denominator === 0) {
        throw new Error("Fraction denominator must not be zero.");
    }
    const sign = value.denominator < 0 ? -1 : 1;
    const divisor = gcd(value.numerator, value.denominator) || 1;
    return {
        numerator: (sign * value.numerator) / divisor,
        denominator: (sign * value.denominator) / divisor,
    };
}
  function fractionsEquivalent(a, b) {
    if (a.denominator === 0 || b.denominator === 0)
        return false;
    return a.numerator * b.denominator === b.numerator * a.denominator;
}
  function isSimplestForm(value) {
    return value.denominator > 0 && gcd(value.numerator, value.denominator) === 1;
}
  function simplifyFraction(value) {
    return normalizeFraction(value);
}
  function commonFactorsGreaterThanOne(a, b) {
    const limit = Math.min(Math.abs(Math.trunc(a)), Math.abs(Math.trunc(b)));
    const factors = [];
    for (let candidate = 2; candidate <= limit; candidate += 1) {
        if (a % candidate === 0 && b % candidate === 0)
            factors.push(candidate);
    }
    return factors;
}
  function rawFractionSignature(value) {
    return `${value.numerator}/${value.denominator}`;
}
  function canonicalFractionSignature(value) {
    const normalized = normalizeFraction(value);
    return `${normalized.numerator}/${normalized.denominator}`;
}
  function evaluateFractionResponse(params) {
    const { source, response, methodEvidence } = params;
    if (!Number.isInteger(response.numerator) ||
        !Number.isInteger(response.denominator) ||
        response.denominator <= 0) {
        return {
            correct: false,
            family: "unknown",
            countsAsSimplestForm: false,
            reason: "Response is not a positive-denominator integer fraction.",
        };
    }
    const equivalent = fractionsEquivalent(source, response);
    if (equivalent && isSimplestForm(response)) {
        return {
            correct: true,
            family: null,
            normalizedResponse: normalizeFraction(response),
            countsAsSimplestForm: true,
        };
    }
    if (equivalent) {
        return {
            correct: false,
            family: "stop_early",
            normalizedResponse: normalizeFraction(response),
            countsAsSimplestForm: false,
            reason: "Response is equivalent but not in simplest form.",
        };
    }
    if (methodEvidence?.changedOnlyOneSide) {
        return {
            correct: false,
            family: "one_side",
            normalizedResponse: response,
            countsAsSimplestForm: false,
            reason: "Only one fraction field changed.",
        };
    }
    if (methodEvidence?.exactCommonFactorChosen === true &&
        methodEvidence?.quotientArithmeticConsistent === false &&
        !methodEvidence?.usedDifferentDivisors &&
        !methodEvidence?.subtractedInsteadOfDivided) {
        return {
            correct: false,
            family: "arithmetic_slip",
            normalizedResponse: response,
            countsAsSimplestForm: false,
            reason: "The method uses one valid common factor, but a quotient is wrong.",
        };
    }
    if (methodEvidence?.usedDifferentDivisors || methodEvidence?.subtractedInsteadOfDivided) {
        return {
            correct: false,
            family: "value_change",
            normalizedResponse: response,
            countsAsSimplestForm: false,
            reason: "The method changes the numerator and denominator inconsistently.",
        };
    }
    return {
        correct: false,
        family: "unknown",
        normalizedResponse: response,
        countsAsSimplestForm: false,
        reason: "The response is not equivalent; method evidence is insufficient for a stronger classification.",
    };
}
  function evaluateFactorStep(params) {
    const { current, factor, proposedAfter, numeratorDivisor, denominatorDivisor } = params;
    if (!Number.isInteger(factor) || factor <= 1) {
        return {
            valid: false,
            family: "non_common",
            reason: "A simplification factor must be an integer greater than 1.",
        };
    }
    if (current.numerator % factor !== 0 || current.denominator % factor !== 0) {
        return {
            valid: false,
            family: "non_common",
            reason: "The factor does not divide both current numbers exactly.",
        };
    }
    if (numeratorDivisor !== undefined &&
        denominatorDivisor !== undefined &&
        numeratorDivisor !== denominatorDivisor) {
        return {
            valid: false,
            family: "value_change",
            reason: "Different divisors were used on the numerator and denominator.",
        };
    }
    const expectedAfter = {
        numerator: current.numerator / factor,
        denominator: current.denominator / factor,
    };
    if (proposedAfter) {
        const numeratorCorrect = proposedAfter.numerator === expectedAfter.numerator;
        const denominatorCorrect = proposedAfter.denominator === expectedAfter.denominator;
        if ((proposedAfter.numerator === current.numerator && denominatorCorrect) ||
            (proposedAfter.denominator === current.denominator && numeratorCorrect)) {
            return {
                valid: false,
                family: "one_side",
                reason: "Only one fraction part changed.",
            };
        }
        if (!numeratorCorrect || !denominatorCorrect) {
            return {
                valid: false,
                family: "arithmetic_slip",
                reason: "A valid common factor was chosen, but one or both quotients are incorrect.",
            };
        }
    }
    return {
        valid: true,
        family: null,
        step: {
            before: current,
            factor,
            after: expectedAfter,
        },
        finished: isSimplestForm(expectedAfter),
    };
}
  function routeGuidedGate(params) {
    const strong = params.g1FirstAttemptCorrect &&
        params.g2FirstAttemptCorrect &&
        !params.hintOrSupportEscalated &&
        !params.invalidFactorObserved &&
        !params.oneSideObserved &&
        !params.stopEarlyObserved &&
        !params.unresolvedCentralMisconception;
    return strong ? "fast_skip_f1_keep_f2" : "standard_f1_then_f2";
}
  function routeIndependentGate(params) {
    if (params.unresolvedOrRepeatedCentralError) {
        return "matching_repair_then_fresh_check";
    }
    if (params.bothCorrect && params.anyHintUsed) {
        return "fresh_no_hint_confirmation";
    }
    if (params.bothCorrect) {
        return "proceed_to_final";
    }
    return "matching_repair_then_fresh_check";
}
  function routeFinalCheck(params) {
    if (params.correctCount >= 4 &&
        params.proceduralFamilyCorrect &&
        params.reasoningOrApplicationFamilyCorrect &&
        !params.repeatedBlockingMisconception) {
        return "finish_candidate";
    }
    if (params.correctCount >= 4) {
        return "repair_blocker_then_one_fresh_confirmation";
    }
    if (params.correctCount === 3) {
        return "targeted_repair_then_two_item_check";
    }
    return "targeted_repair_then_three_item_final";
}
  function shouldTriggerRepair(params) {
    switch (params.family) {
        case "stop_early":
            return params.occurrences >= 2 || params.explicitReasoningSignal === true;
        case "one_side":
            return params.occurrences >= 2 && params.directCueAlreadyGiven === true;
        case "non_common":
            return params.occurrences >= 2;
        case "smaller_numbers":
            return params.occurrences >= 2 || params.explicitReasoningSignal === true;
        case "value_change":
            return params.occurrences >= 2 || params.visibleSystematicMethod === true;
        case "arithmetic_slip":
            return false;
        default:
            return params.occurrences >= 2;
    }
}
  function getHookResponseSequence(optionId) {
    const hook = exports.FRA10.teachingScenes.find((scene) => scene.id === "HOOK");
    const branch = hook.interaction.feedbackByOption[optionId];
    return [
        ...branch.ryanUtteranceIds,
        ...branch.thenUtteranceIds,
    ];
}
  function selectFreshRepairCheck(params) {
    const repair = exports.FRA10.repairs.find((entry) => entry.id === params.repairId);
    if (!repair)
        return null;
    const candidates = repair.freshCheckCandidates
        ? [...repair.freshCheckCandidates]
        : repair.freshCheck
            ? [repair.freshCheck]
            : [];
    for (const candidate of candidates) {
        const source = candidate.sourceFraction;
        if (!source)
            return candidate;
        if (!params.usedRawFractionSignatures.has(rawFractionSignature(source))) {
            return candidate;
        }
    }
    return null;
}
  function selectRecoveryItems(params) {
    const bank = exports.FRA10.recoveryBank;
    const byId = new Map(bank.map((item) => [item.id, item]));
    const selected = [];
    const selectedIds = new Set();
    const isAvailable = (item) => {
        if (!item || selectedIds.has(item.id) || params.usedItemIds?.has(item.id))
            return false;
        if (item.sourceFraction) {
            const signature = rawFractionSignature(item.sourceFraction);
            if (params.usedRawFractionSignatures.has(signature))
                return false;
        }
        return true;
    };
    const add = (item) => {
        if (!isAvailable(item) || selected.length >= params.requiredCount)
            return;
        selected.push(item);
        selectedIds.add(item.id);
    };
    for (const family of params.missedFamilies) {
        for (const id of RECOVERY_FAMILY_PREFERENCE[family] ?? []) {
            add(byId.get(id));
            if (selected.length >= params.requiredCount)
                return selected;
        }
    }
    if (params.requiredCount >= 2) {
        const hasProcedural = selected.some((item) => String(item.evidenceFamily).includes("procedural"));
        const hasReasoningOrApplication = selected.some((item) => /reasoning|application/.test(String(item.evidenceFamily)));
        if (!hasProcedural) {
            add(bank.find((item) => isAvailable(item) && /procedural/.test(String(item.evidenceFamily))));
        }
        if (!hasReasoningOrApplication) {
            add(bank.find((item) => isAvailable(item) &&
                /reasoning|application/.test(String(item.evidenceFamily))));
        }
    }
    for (const item of bank)
        add(item);
    return selected;
}
  window.RevilyFra10Approved = {
    FRA10_RUNTIME_COPY,
    FRA10_LEARNER_UI_COPY,
    FRA10,
    gcd,
    normalizeFraction,
    fractionsEquivalent,
    isSimplestForm,
    simplifyFraction,
    commonFactorsGreaterThanOne,
    rawFractionSignature,
    canonicalFractionSignature,
    evaluateFractionResponse,
    evaluateFactorStep,
    routeGuidedGate,
    routeIndependentGate,
    routeFinalCheck,
    shouldTriggerRepair,
    getHookResponseSequence,
    selectFreshRepairCheck,
    selectRecoveryItems
  };
})();
