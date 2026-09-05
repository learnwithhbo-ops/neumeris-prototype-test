(function () {
  "use strict";
  window.FRA13_RUNTIME_COPY = {
  "HOOK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "prompt",
    "communicationGoal": "present_two_reward_options_without_evaluating_fraction",
    "text": "Two reward cards. This one gives you eight tokens. This one gives you three fifths of twenty.",
    "captionSource": "same_as_audio"
  },
  "HOOK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "prompt",
    "communicationGoal": "invite_unscored_prediction_before_reveal",
    "text": "Which would you take? Pick one before I reveal it.",
    "captionSource": "same_as_audio"
  },
  "HOOK.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "begin_fraction_operator_reveal_after_choice",
    "text": "Let's see what three fifths does to twenty.",
    "captionSource": "same_as_audio"
  },
  "T1.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "establish_the_complete_starting_amount",
    "text": "Start with the whole amount: twenty tokens.",
    "captionSource": "same_as_audio"
  },
  "T1.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "use_denominator_as_number_of_equal_shares_not_group_size",
    "text": "The denominator is five, so I need five equal shares - not groups of five.",
    "captionSource": "same_as_audio"
  },
  "T2.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "calculate_one_equal_share",
    "text": "Twenty divided by five gives four.",
    "captionSource": "same_as_audio"
  },
  "T2.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "connect_one_share_to_unit_fraction",
    "text": "That one group is one fifth of twenty.",
    "captionSource": "same_as_audio"
  },
  "T3.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "use_numerator_as_number_of_equal_shares_taken",
    "text": "Now the numerator is three. It tells me how many of those equal shares I need.",
    "captionSource": "same_as_audio"
  },
  "T3.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "accumulate_three_equal_shares_in_synchronised_count",
    "text": "One group is four. Two groups make eight. Three groups make twelve.",
    "captionSource": "same_as_audio"
  },
  "T3.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "summary",
    "communicationGoal": "state_result_after_visual_count_is_complete",
    "text": "So three fifths of twenty is twelve.",
    "captionSource": "same_as_audio"
  },
  "T4.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "introduce_transfer_example_with_new_fraction_and_amount",
    "text": "Let's do it again with a new amount: five sixths of thirty cones.",
    "captionSource": "same_as_audio"
  },
  "T4.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "find_one_sixth_by_division",
    "text": "Thirty divided by six is five. That finds one sixth.",
    "captionSource": "same_as_audio"
  },
  "T4.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "explain",
    "communicationGoal": "take_five_unit_shares",
    "text": "Five times five is twenty-five. That takes five sixths.",
    "captionSource": "same_as_audio"
  },
  "T4.4": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "generalise",
    "communicationGoal": "condense_visual_meaning_into_reusable_method",
    "text": "So the compact route is: amount divided by the denominator, then multiplied by the numerator.",
    "captionSource": "same_as_audio"
  },
  "HANDOFF.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "summary",
    "communicationGoal": "recap_two_fraction_jobs_before_practice",
    "text": "You've seen the two jobs: split the amount into equal shares, then take the number you need.",
    "captionSource": "same_as_audio"
  },
  "HANDOFF.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "signal_progressive_removal_of_support",
    "text": "I'll stay with you for two. After that, the structure starts to disappear.",
    "captionSource": "same_as_audio"
  },
  "G1.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "cue_unit_fraction_structure_without_stating_quotient",
    "text": "Numerator one means take one share. Denominator four means divide the amount by four.",
    "captionSource": "same_as_audio"
  },
  "G1.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_unit_fraction_calculation_and_unit",
    "text": "That's it. Twenty-eight divided by four is seven, so one quarter is seven tickets.",
    "captionSource": "same_as_audio"
  },
  "G1.INCORRECT.GROUP_COUNT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "separate_number_of_groups_from_items_per_group",
    "text": "Four is the number of groups, not the size of one group.",
    "captionSource": "same_as_audio"
  },
  "G1.INCORRECT.DEFAULT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "rebuild_equal_sharing_question",
    "text": "Make four equal groups. How many tickets land in one group?",
    "captionSource": "same_as_audio"
  },
  "G2.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "cue_one_share_then_numerator_scaling",
    "text": "Find one fifth first. Then use the numerator to take three groups.",
    "captionSource": "same_as_audio"
  },
  "G2.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_both_guided_steps",
    "text": "Exactly. Twenty-five divided by five is five; five times three is fifteen.",
    "captionSource": "same_as_audio"
  },
  "G2.INCORRECT.ONE_SHARE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "continue_after_unit_share",
    "text": "You've found one fifth. The numerator asks for three of those groups.",
    "captionSource": "same_as_audio"
  },
  "G2.INCORRECT.NUMERATOR_ONLY": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "restore_denominator_stage_before_scaling",
    "text": "That multiplies by three but never makes fifths. Divide by five as well.",
    "captionSource": "same_as_audio"
  },
  "G2.INCORRECT.DEFAULT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "return_to_two_distinct_fraction_jobs",
    "text": "Use five to make the equal shares, then use three to choose how many shares to take.",
    "captionSource": "same_as_audio"
  },
  "F1.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "cue_denominator_first_in_faded_workspace",
    "text": "Start with the denominator. The first box is one seventh of thirty-five.",
    "captionSource": "same_as_audio"
  },
  "F1.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "provide_optional_denominator_guidance_without_final_answer",
    "text": "The denominator tells you how many equal shares. Divide thirty-five by seven first.",
    "captionSource": "same_as_audio"
  },
  "F1.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_completed_two_step_workspace",
    "text": "Yes. One seventh is five, and four equal shares make twenty.",
    "captionSource": "same_as_audio"
  },
  "F1.INCORRECT.ONE_SHARE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "continue_from_one_seventh_to_four_sevenths",
    "text": "That is one seventh. Use the numerator to take four shares.",
    "captionSource": "same_as_audio"
  },
  "F1.INCORRECT.DEFAULT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "reset_denominator_then_numerator_sequence",
    "text": "Find one seventh first. Then multiply that share by four.",
    "captionSource": "same_as_audio"
  },
  "F2.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "request_method_selection_by_fraction_roles",
    "text": "Choose the plan that uses both fraction numbers for their correct jobs.",
    "captionSource": "same_as_audio"
  },
  "F2.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "guide_plan_selection_without_naming_option",
    "text": "Find one eighth first, then take five of those equal parts.",
    "captionSource": "same_as_audio"
  },
  "F2.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_divide_by_denominator_then_scale_by_numerator",
    "text": "Forty-eight divided by eight gives one share; then multiply by five.",
    "captionSource": "same_as_audio"
  },
  "F2.INCORRECT.SWAP": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "correct_divide_by_numerator_role_swap",
    "text": "The fraction jobs are reversed in that plan. Divide by eight, not by five.",
    "captionSource": "same_as_audio"
  },
  "F2.INCORRECT.ONE_SHARE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "identify_incomplete_unit_share_plan",
    "text": "That plan finds only one eighth. The numerator still needs five shares.",
    "captionSource": "same_as_audio"
  },
  "F2.INCORRECT.NUMERATOR_ONLY": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "identify_missing_denominator_stage",
    "text": "That plan uses five but never creates eighths. The amount must be divided by eight as well.",
    "captionSource": "same_as_audio"
  },
  "F2.INCORRECT.DEFAULT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "restate_method_roles_neutrally",
    "text": "Use the denominator to find one share, then the numerator to take the shares needed.",
    "captionSource": "same_as_audio"
  },
  "I1.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "request_measure_context_result_and_unit",
    "text": "Work out the amount cut off. Keep the unit.",
    "captionSource": "same_as_audio"
  },
  "I1.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "support_measure_item_without_stating_answer",
    "text": "Use five to find one equal share of forty-five metres. Then take two of those shares.",
    "captionSource": "same_as_audio"
  },
  "I1.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_measure_calculation",
    "text": "Forty-five divided by five is nine; nine times two is eighteen metres.",
    "captionSource": "same_as_audio"
  },
  "I1.INCORRECT.ONE_SHARE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "identify_one_fifth_only",
    "text": "You've found one equal share. What does the numerator ask you to do next?",
    "captionSource": "same_as_audio"
  },
  "I1.INCORRECT.NUMDIV": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "question_divisor_role_without_overclaiming",
    "text": "Which fraction number tells how many equal shares the whole is split into?",
    "captionSource": "same_as_audio"
  },
  "I1.INCORRECT.DEFAULT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "offer_neutral_two_stage_reset",
    "text": "Find one fifth of the cable first, then take two equal shares.",
    "captionSource": "same_as_audio"
  },
  "I2.PRE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "transfer_same_fraction_roles_to_money",
    "text": "The fraction still has the same two jobs. Use pence if that makes the sharing easier.",
    "captionSource": "same_as_audio"
  },
  "I2.HINT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "support_exact_money_partition_without_final_answer",
    "text": "Ten pounds is one thousand pence. Divide by four, then take three parts.",
    "captionSource": "same_as_audio"
  },
  "I2.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_exact_money_result",
    "text": "One quarter is two pounds fifty; three quarters is seven pounds fifty.",
    "captionSource": "same_as_audio"
  },
  "I2.INCORRECT.ONE_SHARE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "identify_one_quarter_only",
    "text": "Two pounds fifty is one quarter. The numerator asks for three quarters.",
    "captionSource": "same_as_audio"
  },
  "I2.INCORRECT.DEFAULT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "reset_money_item_to_share_then_take",
    "text": "Split the voucher into four equal values, then take three of them.",
    "captionSource": "same_as_audio"
  },
  "FINAL.INTRO.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "announce_unsupported_final_set",
    "text": "These last five are yours. No hints this time.",
    "captionSource": "same_as_audio"
  },
  "FINAL.INTRO.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "instruction",
    "communicationGoal": "explain_answer_lock_then_worked_check",
    "text": "Do the calculation first. Once you lock an answer, I'll show the working so you can compare your method.",
    "captionSource": "same_as_audio"
  },
  "M1.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_unit_fraction_final_then_open_check",
    "text": "That's right. Here's the unit-share check.",
    "captionSource": "same_as_audio"
  },
  "M1.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_division_check_after_unit_fraction_miss",
    "text": "That answer doesn't match one seventh. Here's the division check.",
    "captionSource": "same_as_audio"
  },
  "M1.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_unit_share_division_for_m1",
    "text": "Fifty-six divided by seven is eight.",
    "captionSource": "same_as_audio"
  },
  "M1.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "state_unit_fraction_result_for_m1",
    "text": "So one seventh of fifty-six is eight.",
    "captionSource": "same_as_audio"
  },
  "M2.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_non_unit_final_then_open_two_step_check",
    "text": "Correct. Here's the full two-step check.",
    "captionSource": "same_as_audio"
  },
  "M2.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_two_step_check_after_non_unit_miss",
    "text": "That result is off. Compare it with both steps.",
    "captionSource": "same_as_audio"
  },
  "M2.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_one_sixth_for_m2",
    "text": "Forty-two divided by six is seven.",
    "captionSource": "same_as_audio"
  },
  "M2.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_five_sixths_for_m2",
    "text": "Seven times five is thirty-five.",
    "captionSource": "same_as_audio"
  },
  "M3.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_measure_final_and_keep_unit",
    "text": "That's right. The unit stays with the amount.",
    "captionSource": "same_as_audio"
  },
  "M3.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_measure_check_after_miss",
    "text": "Not quite. Follow the equal share, then keep the metre unit.",
    "captionSource": "same_as_audio"
  },
  "M3.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_one_eighth_in_metres",
    "text": "Thirty-two metres divided by eight is four metres.",
    "captionSource": "same_as_audio"
  },
  "M3.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_three_eighths_in_metres",
    "text": "Four metres times three is twelve metres.",
    "captionSource": "same_as_audio"
  },
  "M4.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_money_final_then_open_check",
    "text": "Correct. Here's the money check.",
    "captionSource": "same_as_audio"
  },
  "M4.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_exact_money_check_after_miss",
    "text": "That amount is not five ninths of the fund. Here's the calculation.",
    "captionSource": "same_as_audio"
  },
  "M4.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_one_ninth_of_prize_fund",
    "text": "Thirty-six pounds divided by nine is four pounds.",
    "captionSource": "same_as_audio"
  },
  "M4.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_five_ninths_of_prize_fund",
    "text": "Four pounds times five is twenty pounds.",
    "captionSource": "same_as_audio"
  },
  "M5.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_reasoning_about_where_work_stopped",
    "text": "Yes. Your choice identifies where Sam stopped.",
    "captionSource": "same_as_audio"
  },
  "M5.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_reasoning_comparison_after_miss",
    "text": "That description misses where Sam stopped. Here's the two-step comparison.",
    "captionSource": "same_as_audio"
  },
  "M5.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "identify_eight_as_one_fifth",
    "text": "Forty divided by five is eight, so eight is one fifth.",
    "captionSource": "same_as_audio"
  },
  "M5.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_remaining_numerator_step",
    "text": "Three equal shares make twenty-four, so Sam stopped one step early.",
    "captionSource": "same_as_audio"
  },
  "C-PROC.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_fresh_general_process_without_hint",
    "text": "That two-step result is correct. You can move on independently.",
    "captionSource": "same_as_audio"
  },
  "C-PROC.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "route_fresh_process_miss_to_relevant_support",
    "text": "The fresh check still needs both fraction jobs. Start with one ninth.",
    "captionSource": "same_as_audio"
  },
  "C-MONEY.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_fresh_money_transfer_without_hint",
    "text": "Yes. You handled the fractional pound share independently.",
    "captionSource": "same_as_audio"
  },
  "C-MONEY.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "route_fresh_money_miss_to_exact_share_check",
    "text": "Recheck one quarter of six pounds before taking three quarters.",
    "captionSource": "same_as_audio"
  },
  "C-ONE.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_recovery_from_stopping_after_one_share",
    "text": "Yes. You found one eighth and then took three shares.",
    "captionSource": "same_as_audio"
  },
  "C-ONE.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "identify_unresolved_stop_after_one_share",
    "text": "You still need the numerator step after finding one eighth.",
    "captionSource": "same_as_audio"
  },
  "C-GROUP.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_denominator_as_number_of_equal_groups",
    "text": "Correct. Six equal groups give four in each, then three groups give twelve.",
    "captionSource": "same_as_audio"
  },
  "C-GROUP.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "recheck_group_count_not_group_size",
    "text": "Use six as the number of equal groups, not the number in each group.",
    "captionSource": "same_as_audio"
  },
  "C-NUMDIV.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_divide_by_denominator_recovery",
    "text": "Yes. Eight made the equal shares, and five chose how many to take.",
    "captionSource": "same_as_audio"
  },
  "C-NUMDIV.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "identify_unresolved_fraction_role_swap",
    "text": "The denominator still needs to be the divisor.",
    "captionSource": "same_as_audio"
  },
  "C-OPERATOR.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "confirm_denominator_stage_after_numerator_only_repair",
    "text": "Correct. You created ninths before taking four of them.",
    "captionSource": "same_as_audio"
  },
  "C-OPERATOR.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "identify_missing_denominator_stage_after_repair",
    "text": "The numerator cannot work alone. Make ninths first.",
    "captionSource": "same_as_audio"
  },
  "R-ONE.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "name_incomplete_unit_share_as_first_step",
    "text": "You found one seventh and stopped. That's the first step, not the final amount.",
    "captionSource": "same_as_audio"
  },
  "R-ONE.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "restate_one_seventh_value",
    "text": "Thirty-five divided by seven is five, so five is one seventh.",
    "captionSource": "same_as_audio"
  },
  "R-ONE.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "use_numerator_to_accumulate_four_shares",
    "text": "The numerator is four. Take four equal shares: five, ten, fifteen, twenty.",
    "captionSource": "same_as_audio"
  },
  "R-GROUP.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "contrast_group_count_with_group_size",
    "text": "The denominator tells you how many equal groups, not how many objects go in each group.",
    "captionSource": "same_as_audio"
  },
  "R-GROUP.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "model_five_equal_groups_of_twenty",
    "text": "Fifths means five equal groups. Twenty shared into five groups gives four in each.",
    "captionSource": "same_as_audio"
  },
  "R-GROUP.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "take_two_groups_after_correct_partition",
    "text": "Take two groups: eight.",
    "captionSource": "same_as_audio"
  },
  "R-NUMDIV.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "restore_denominator_as_divisor",
    "text": "The two fraction numbers have different jobs. Divide by the denominator, not the numerator.",
    "captionSource": "same_as_audio"
  },
  "R-NUMDIV.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "find_one_quarter_of_twenty_eight",
    "text": "Twenty-eight divided by four gives seven in one quarter.",
    "captionSource": "same_as_audio"
  },
  "R-NUMDIV.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "take_three_quarters_after_role_reset",
    "text": "Then seven times three gives twenty-one.",
    "captionSource": "same_as_audio"
  },
  "R-OPERATOR.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "name_incomplete_numerator_only_operation",
    "text": "Multiplying by three uses the numerator, but it never makes fifths.",
    "captionSource": "same_as_audio"
  },
  "R-OPERATOR.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "restore_two_stage_fraction_operator",
    "text": "The fraction has to act in two stages: divide twenty-five by five, then multiply the result by three.",
    "captionSource": "same_as_audio"
  },
  "R-OPERATOR.3": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "repair",
    "communicationGoal": "state_intermediate_and_final_values",
    "text": "That gives five, then fifteen.",
    "captionSource": "same_as_audio"
  },
  "RECOVERY.MINI.INTRO": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "introduce_two_fresh_no_hint_recovery_items",
    "text": "Two fresh checks. No hints. Show that the repaired idea now holds.",
    "captionSource": "same_as_audio"
  },
  "RECOVERY.FINAL.INTRO": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "transition",
    "communicationGoal": "introduce_fresh_five_item_recovery_set",
    "text": "Here are five fresh questions. Work independently, then check each solution after you lock it.",
    "captionSource": "same_as_audio"
  },
  "A1.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_alt_unit_fraction_result",
    "text": "That unit fraction is correct. Here is the check.",
    "captionSource": "same_as_audio"
  },
  "A1.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_alt_unit_fraction_check",
    "text": "That does not match one eighth. Compare it with the division.",
    "captionSource": "same_as_audio"
  },
  "A1.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_one_eighth_of_seventy_two",
    "text": "Seventy-two divided by eight is nine.",
    "captionSource": "same_as_audio"
  },
  "A1.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "state_alt_unit_fraction_answer",
    "text": "So one eighth of seventy-two is nine.",
    "captionSource": "same_as_audio"
  },
  "A2.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_alt_non_unit_result",
    "text": "That is right. Check the share and scaling steps.",
    "captionSource": "same_as_audio"
  },
  "A2.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_alt_non_unit_worked_check",
    "text": "That result does not match four ninths. Follow both stages.",
    "captionSource": "same_as_audio"
  },
  "A2.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_one_ninth_of_sixty_three",
    "text": "Sixty-three divided by nine is seven.",
    "captionSource": "same_as_audio"
  },
  "A2.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_four_ninths_of_sixty_three",
    "text": "Seven times four is twenty-eight.",
    "captionSource": "same_as_audio"
  },
  "A3.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_alt_measure_context",
    "text": "Correct. The kilogram unit stays attached.",
    "captionSource": "same_as_audio"
  },
  "A3.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_alt_measure_worked_check",
    "text": "That mass is off. Compare it with one sixth, then five sixths.",
    "captionSource": "same_as_audio"
  },
  "A3.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_one_sixth_of_forty_eight_kg",
    "text": "Forty-eight kilograms divided by six is eight kilograms.",
    "captionSource": "same_as_audio"
  },
  "A3.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_five_sixths_of_forty_eight_kg",
    "text": "Eight kilograms times five is forty kilograms.",
    "captionSource": "same_as_audio"
  },
  "A4.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_alt_money_context",
    "text": "That payout is correct. Here is the exact check.",
    "captionSource": "same_as_audio"
  },
  "A4.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_alt_money_worked_check",
    "text": "That payout does not match seven tenths. Compare both operations.",
    "captionSource": "same_as_audio"
  },
  "A4.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_one_tenth_of_fifty_pounds",
    "text": "Fifty pounds divided by ten is five pounds.",
    "captionSource": "same_as_audio"
  },
  "A4.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "show_seven_tenths_of_fifty_pounds",
    "text": "Five pounds times seven is thirty-five pounds.",
    "captionSource": "same_as_audio"
  },
  "A5.CORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "acknowledge_correct",
    "communicationGoal": "acknowledge_alt_reasoning_about_missing_step",
    "text": "Yes. You identified the missing stage.",
    "captionSource": "same_as_audio"
  },
  "A5.INCORRECT": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "redirect_incorrect",
    "communicationGoal": "introduce_alt_reasoning_check",
    "text": "That is not the missing step. Compare one seventh with four sevenths.",
    "captionSource": "same_as_audio"
  },
  "A5.WORK.1": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "identify_five_as_one_seventh",
    "text": "Dividing thirty-five by seven gives five, so each seventh is worth five.",
    "captionSource": "same_as_audio"
  },
  "A5.WORK.2": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "worked_check",
    "communicationGoal": "identify_multiply_by_four_as_missing_step",
    "text": "Multiply five by four to reach four sevenths, which is twenty.",
    "captionSource": "same_as_audio"
  },
  "COMPLETE": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "completion",
    "communicationGoal": "summarise_mastered_fraction_operator_and_close_lesson",
    "text": "Nice work. You can now use the denominator to find one equal share, then use the numerator to take the number of shares you need. That's FRA-13 done.",
    "captionSource": "same_as_audio"
  },
  "NEEDS_WORK": {
    "audience": "learner",
    "spokenBy": "Ryan",
    "role": "completion",
    "communicationGoal": "close_after_recovery_cap_without_false_mastery",
    "text": "You've made progress, but this idea still needs another short pass. We'll stop here rather than repeat the same questions.",
    "captionSource": "same_as_audio"
  }
};
  window.FRA13_PROBLEMS = {
  "HOOK": {
    "id": "HOOK",
    "numerator": 3,
    "denominator": 5,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 20,
      "scale": 1,
      "unit": {
        "singular": "token",
        "plural": "tokens"
      }
    },
    "derived": {
      "oneShareBaseUnits": 4,
      "resultBaseUnits": 12
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "T4": {
    "id": "T4",
    "numerator": 5,
    "denominator": 6,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 30,
      "scale": 1,
      "unit": {
        "singular": "cone",
        "plural": "cones"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 25
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "G1": {
    "id": "G1",
    "numerator": 1,
    "denominator": 4,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 28,
      "scale": 1,
      "unit": {
        "singular": "ticket",
        "plural": "tickets"
      }
    },
    "derived": {
      "oneShareBaseUnits": 7,
      "resultBaseUnits": 7
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "G2": {
    "id": "G2",
    "numerator": 3,
    "denominator": 5,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 25,
      "scale": 1,
      "unit": {
        "singular": "training bib",
        "plural": "training bibs"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 15
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "F1": {
    "id": "F1",
    "numerator": 4,
    "denominator": 7,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 35,
      "scale": 1,
      "unit": {
        "singular": "item",
        "plural": "items"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 20
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "F2": {
    "id": "F2",
    "numerator": 5,
    "denominator": 8,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 48,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 6,
      "resultBaseUnits": 30
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "I1": {
    "id": "I1",
    "numerator": 2,
    "denominator": 5,
    "quantity": {
      "kind": "measure",
      "amountBaseUnits": 45,
      "scale": 1,
      "unit": {
        "symbol": "m",
        "spokenSingular": "metre",
        "spokenPlural": "metres"
      }
    },
    "derived": {
      "oneShareBaseUnits": 9,
      "resultBaseUnits": 18
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "I2": {
    "id": "I2",
    "numerator": 3,
    "denominator": 4,
    "quantity": {
      "kind": "money",
      "amountBaseUnits": 1000,
      "scale": 100,
      "unit": {
        "currency": "GBP",
        "symbol": "£",
        "minorUnit": "pence"
      }
    },
    "derived": {
      "oneShareBaseUnits": 250,
      "resultBaseUnits": 750
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "M1": {
    "id": "M1",
    "numerator": 1,
    "denominator": 7,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 56,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 8,
      "resultBaseUnits": 8
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "M2": {
    "id": "M2",
    "numerator": 5,
    "denominator": 6,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 42,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 7,
      "resultBaseUnits": 35
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "M3": {
    "id": "M3",
    "numerator": 3,
    "denominator": 8,
    "quantity": {
      "kind": "measure",
      "amountBaseUnits": 32,
      "scale": 1,
      "unit": {
        "symbol": "m",
        "spokenSingular": "metre",
        "spokenPlural": "metres"
      }
    },
    "derived": {
      "oneShareBaseUnits": 4,
      "resultBaseUnits": 12
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "M4": {
    "id": "M4",
    "numerator": 5,
    "denominator": 9,
    "quantity": {
      "kind": "money",
      "amountBaseUnits": 3600,
      "scale": 100,
      "unit": {
        "currency": "GBP",
        "symbol": "£",
        "minorUnit": "pence"
      }
    },
    "derived": {
      "oneShareBaseUnits": 400,
      "resultBaseUnits": 2000
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "M5": {
    "id": "M5",
    "numerator": 3,
    "denominator": 5,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 40,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 8,
      "resultBaseUnits": 24
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "C-PROC": {
    "id": "C-PROC",
    "numerator": 4,
    "denominator": 9,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 45,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 20
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "C-MONEY": {
    "id": "C-MONEY",
    "numerator": 3,
    "denominator": 4,
    "quantity": {
      "kind": "money",
      "amountBaseUnits": 600,
      "scale": 100,
      "unit": {
        "currency": "GBP",
        "symbol": "£",
        "minorUnit": "pence"
      }
    },
    "derived": {
      "oneShareBaseUnits": 150,
      "resultBaseUnits": 450
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "C-ONE": {
    "id": "C-ONE",
    "numerator": 3,
    "denominator": 8,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 40,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 15
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "C-GROUP": {
    "id": "C-GROUP",
    "numerator": 3,
    "denominator": 6,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 24,
      "scale": 1,
      "unit": {
        "singular": "counter",
        "plural": "counters"
      }
    },
    "derived": {
      "oneShareBaseUnits": 4,
      "resultBaseUnits": 12
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "C-NUMDIV": {
    "id": "C-NUMDIV",
    "numerator": 5,
    "denominator": 8,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 32,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 4,
      "resultBaseUnits": 20
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "C-OPERATOR": {
    "id": "C-OPERATOR",
    "numerator": 4,
    "denominator": 9,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 27,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 3,
      "resultBaseUnits": 12
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "R-ONE": {
    "id": "R-ONE",
    "numerator": 4,
    "denominator": 7,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 35,
      "scale": 1,
      "unit": {
        "singular": "counter",
        "plural": "counters"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 20
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "R-GROUP": {
    "id": "R-GROUP",
    "numerator": 2,
    "denominator": 5,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 20,
      "scale": 1,
      "unit": {
        "singular": "token",
        "plural": "tokens"
      }
    },
    "derived": {
      "oneShareBaseUnits": 4,
      "resultBaseUnits": 8
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "R-NUMDIV": {
    "id": "R-NUMDIV",
    "numerator": 3,
    "denominator": 4,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 28,
      "scale": 1,
      "unit": {
        "singular": "counter",
        "plural": "counters"
      }
    },
    "derived": {
      "oneShareBaseUnits": 7,
      "resultBaseUnits": 21
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "R-OPERATOR": {
    "id": "R-OPERATOR",
    "numerator": 3,
    "denominator": 5,
    "quantity": {
      "kind": "count",
      "amountBaseUnits": 25,
      "scale": 1,
      "unit": {
        "singular": "counter",
        "plural": "counters"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 15
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "A1": {
    "id": "A1",
    "numerator": 1,
    "denominator": 8,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 72,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 9,
      "resultBaseUnits": 9
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "A2": {
    "id": "A2",
    "numerator": 4,
    "denominator": 9,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 63,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 7,
      "resultBaseUnits": 28
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "A3": {
    "id": "A3",
    "numerator": 5,
    "denominator": 6,
    "quantity": {
      "kind": "measure",
      "amountBaseUnits": 48,
      "scale": 1,
      "unit": {
        "symbol": "kg",
        "spokenSingular": "kilogram",
        "spokenPlural": "kilograms"
      }
    },
    "derived": {
      "oneShareBaseUnits": 8,
      "resultBaseUnits": 40
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "A4": {
    "id": "A4",
    "numerator": 7,
    "denominator": 10,
    "quantity": {
      "kind": "money",
      "amountBaseUnits": 5000,
      "scale": 100,
      "unit": {
        "currency": "GBP",
        "symbol": "£",
        "minorUnit": "pence"
      }
    },
    "derived": {
      "oneShareBaseUnits": 500,
      "resultBaseUnits": 3500
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  },
  "A5": {
    "id": "A5",
    "numerator": 4,
    "denominator": 7,
    "quantity": {
      "kind": "number",
      "amountBaseUnits": 35,
      "scale": 1,
      "unit": {
        "singular": "unit",
        "plural": "units"
      }
    },
    "derived": {
      "oneShareBaseUnits": 5,
      "resultBaseUnits": 20
    },
    "authorOnlyConstraints": {
      "exactDivision": true,
      "positiveAmount": true,
      "properFraction": true
    }
  }
};
  window.RevilyFra13Approved = {
  "id": "FRA13",
  "displayId": "FRA-13",
  "title": "Find a Fraction of an Amount",
  "status": "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
  "handoffVersion": "v1",
  "sourceOfTruth": {
    "runtimeCopyQuestionDataRoutingAndOutcomeLogic": "FRA13_CANONICAL_SPEC.ts",
    "visualGeometryAndPedagogicalIntent": "Revily_FRA13_Storyboard_v1.pdf",
    "engineeringContract": "FRA13_CODEX_IMPLEMENTATION_PROMPT.md",
    "criticalPrecedenceRule": "The PDF is an owner-facing visual and pedagogy reference. Only FRA13_RUNTIME_COPY is legal Ryan runtime copy. Never transcribe PDF headings, stage directions, pedagogy notes or QA prose into speech.",
    "engineeringReference": "Existing canonical Revily FRA01-FRA12-compatible lesson shell, TTS/caption timeline, evidence, hint, answer-lock, persistence and accessibility infrastructure."
  },
  "scope": {
    "objective": "Find a unit or non-unit fraction of a positive quantity by dividing by the denominator and multiplying by the numerator.",
    "studentFacingIdea": "The denominator makes the equal shares. The numerator tells you how many shares to take.",
    "prerequisites": [
      "FRA-01: understand fractions as equal parts.",
      "FRA-02: identify numerator and denominator roles.",
      "P-N01: recall multiplication and division facts."
    ],
    "teaches": [
      "find a unit fraction of an amount by equal sharing",
      "find a non-unit fraction by taking the required number of equal shares",
      "use discrete quantities, simple measures and money contexts",
      "keep the quantity unit in the final answer",
      "treat a fraction as an operator acting on an amount",
      "use exact integer results in teaching and core practice",
      "handle one controlled money example where a quarter is not a whole pound"
    ],
    "deliberatelyLaterOrExcluded": [
      "FRA-14: find the original whole from a known fractional part",
      "percentage-of-amount methods or fraction-percentage conversion",
      "ratio sharing and proportion as the main method",
      "FRA-23 formal symbolic multiplication of a fraction by an integer",
      "mixed, negative or algebraic fractions",
      "rounding or approximation as the target skill",
      "a general decimal-calculation lesson disguised as money"
    ],
    "acceptEquivalentCompletedOperationOrder": true,
    "modelledOperationOrder": "amount ÷ denominator × numerator",
    "excludesGlobalDiagnostic": true,
    "excludesRetrievalLayer": true
  },
  "runtimeSurfaceContract": {
    "onlySourceForRyanSpeech": "FRA13_RUNTIME_COPY[utteranceId].text",
    "onlySourceForRyanCaptions": "The exact same FRA13_RUNTIME_COPY entry and text used for audio.",
    "captionRule": "No separately authored caption string. Captions derive word timings from the same utterance ID used by audio.",
    "questionPromptSpeechPolicy": "Learner UI prompts, options, hints not attached as Ryan utterance IDs, author-only fields, route labels and QA prose are never automatically spoken or captioned.",
    "hintPolicy": "Only hintUtteranceIds explicitly attached to a question may play when the learner opens Ask for a hint. A hint never plays automatically.",
    "cueRule": "Every mathematical cue binds to an utteranceId plus anchorText that is present in the utterance. Removing speech requires removing or remapping its caption and cues.",
    "outcomeRule": "Correctness is computed before feedback. Exactly one correct, matching error-specific incorrect, or default incorrect branch may play. A wrong answer never plays a correct line.",
    "semanticRepetitionRule": "Consecutive Ryan lines must add a new function. Do not add praise that merely repeats the following worked step."
  },
  "uiCopy": "FRA13_UI_COPY",
  "problemBank": "FRA13_PROBLEMS",
  "teachingScenes": [
    {
      "id": "HOOK",
      "stage": "opening",
      "purpose": "Create a genuine need to evaluate a fraction of an amount.",
      "ryanUtteranceIds": [
        "HOOK.1",
        "HOOK.2"
      ],
      "visual": {
        "kind": "reward_card_choice",
        "cardA": {
          "explicitTokenCount": 8
        },
        "cardB": {
          "problemId": "HOOK",
          "showNeutralTokens": 20,
          "preGroup": false
        },
        "authorOnlyRules": [
          "Show exactly 8 tokens on Card A and exactly 20 neutral tokens on Card B.",
          "Do not group the 20 tokens or show 4-per-group before the learner chooses.",
          "The choice is unscored and receives no correct/incorrect styling."
        ]
      },
      "interaction": {
        "kind": "unscored_choice",
        "options": [
          "card_a",
          "card_b"
        ],
        "evidenceWeight": "none",
        "feedbackPolicy": "no_correctness_message",
        "afterChoiceUtteranceIds": [
          "HOOK.3"
        ],
        "convergeAfterChoice": true
      },
      "timeline": [
        {
          "id": "HOOK-C1",
          "utteranceId": "HOOK.1",
          "anchorText": "eight tokens",
          "authorOnlyAction": "show_card_a_eight_tokens",
          "authorOnlyTarget": "card_a"
        },
        {
          "id": "HOOK-C2",
          "utteranceId": "HOOK.1",
          "anchorText": "three fifths of twenty",
          "authorOnlyAction": "focus_fraction_card_without_grouping",
          "authorOnlyTarget": "card_b"
        },
        {
          "id": "HOOK-C3",
          "utteranceId": "HOOK.2",
          "anchorText": "Pick one",
          "authorOnlyAction": "enable_unscored_card_choice",
          "authorOnlyTarget": "choice_controls"
        },
        {
          "id": "HOOK-C4",
          "utteranceId": "HOOK.3",
          "anchorText": "three fifths",
          "authorOnlyAction": "fade_card_a_and_enlarge_card_b",
          "authorOnlyTarget": "reward_cards"
        }
      ]
    },
    {
      "id": "T1",
      "stage": "teach",
      "purpose": "Use the denominator as the number of equal shares, not the group size.",
      "ryanUtteranceIds": [
        "T1.1",
        "T1.2"
      ],
      "visual": {
        "kind": "equal_group_token_model",
        "problemId": "HOOK",
        "showWholeBoundary": true,
        "showGroupTrays": true,
        "selectedGroupCount": 0,
        "authorOnlyIncorrectContrast": "Brief crossed-out four-groups-of-five ghost only in full-motion mode."
      },
      "timeline": [
        {
          "id": "T1-C1",
          "utteranceId": "T1.1",
          "anchorText": "whole amount",
          "authorOnlyAction": "show_one_complete_set_of_twenty",
          "authorOnlyTarget": "token_set"
        },
        {
          "id": "T1-C2",
          "utteranceId": "T1.2",
          "anchorText": "denominator is five",
          "authorOnlyAction": "glow_denominator_only",
          "authorOnlyTarget": "fraction_denominator"
        },
        {
          "id": "T1-C3",
          "utteranceId": "T1.2",
          "anchorText": "five equal shares",
          "authorOnlyAction": "create_five_equal_trays_and_distribute_four_each",
          "authorOnlyTarget": "group_trays",
          "authorOnlyReducedMotionFallback": "show_final_five_tray_state"
        },
        {
          "id": "T1-C4",
          "utteranceId": "T1.2",
          "anchorText": "not groups of five",
          "authorOnlyAction": "briefly_contrast_and_remove_wrong_grouping",
          "authorOnlyTarget": "wrong_grouping_ghost",
          "authorOnlyReducedMotionFallback": "omit_ghost_and_keep_correct_state"
        }
      ]
    },
    {
      "id": "T2",
      "stage": "teach",
      "purpose": "Find one unit fraction by division.",
      "ryanUtteranceIds": [
        "T2.1",
        "T2.2"
      ],
      "visual": {
        "kind": "equal_group_token_model",
        "problemId": "HOOK",
        "showGroupTrays": true,
        "selectedGroupCount": 1,
        "showEquationAfterSpeech": true
      },
      "timeline": [
        {
          "id": "T2-C1",
          "utteranceId": "T2.1",
          "anchorText": "Twenty divided by five",
          "authorOnlyAction": "show_division_expression_without_answer",
          "authorOnlyTarget": "equation"
        },
        {
          "id": "T2-C2",
          "utteranceId": "T2.1",
          "anchorText": "four",
          "authorOnlyAction": "reveal_quotient_and_focus_one_tray",
          "authorOnlyTarget": "one_share"
        },
        {
          "id": "T2-C3",
          "utteranceId": "T2.2",
          "anchorText": "one fifth of twenty",
          "authorOnlyAction": "reveal_unit_fraction_statement",
          "authorOnlyTarget": "unit_fraction_label"
        }
      ]
    },
    {
      "id": "T3",
      "stage": "teach",
      "purpose": "Use the numerator to take the required number of equal shares.",
      "ryanUtteranceIds": [
        "T3.1",
        "T3.2",
        "T3.3"
      ],
      "visual": {
        "kind": "equal_group_token_model",
        "problemId": "HOOK",
        "showGroupTrays": true,
        "selectedGroupCount": 3,
        "runningTotals": [
          4,
          8,
          12
        ]
      },
      "timeline": [
        {
          "id": "T3-C1",
          "utteranceId": "T3.1",
          "anchorText": "numerator is three",
          "authorOnlyAction": "glow_numerator_only",
          "authorOnlyTarget": "fraction_numerator"
        },
        {
          "id": "T3-C2",
          "utteranceId": "T3.2",
          "anchorText": "One group is four",
          "authorOnlyAction": "select_first_tray_and_show_total_four",
          "authorOnlyTarget": "group_trays"
        },
        {
          "id": "T3-C3",
          "utteranceId": "T3.2",
          "anchorText": "Two groups make eight",
          "authorOnlyAction": "select_second_tray_and_update_total_eight",
          "authorOnlyTarget": "group_trays"
        },
        {
          "id": "T3-C4",
          "utteranceId": "T3.2",
          "anchorText": "Three groups make twelve",
          "authorOnlyAction": "select_third_tray_and_update_total_twelve",
          "authorOnlyTarget": "group_trays"
        },
        {
          "id": "T3-C5",
          "utteranceId": "T3.3",
          "anchorText": "is twelve",
          "authorOnlyAction": "reveal_complete_fraction_of_amount_statement",
          "authorOnlyTarget": "result_statement"
        }
      ]
    },
    {
      "id": "T4",
      "stage": "teach",
      "purpose": "Transfer the visual model, then condense it into the reusable method.",
      "ryanUtteranceIds": [
        "T4.1",
        "T4.2",
        "T4.3",
        "T4.4"
      ],
      "visual": {
        "kind": "equal_group_cone_racks",
        "problemId": "T4",
        "rackCount": 6,
        "conesPerRack": 5,
        "selectedRackCount": 5,
        "thenCondenseToEquation": true
      },
      "timeline": [
        {
          "id": "T4-C1",
          "utteranceId": "T4.1",
          "anchorText": "thirty cones",
          "authorOnlyAction": "show_exactly_thirty_cones",
          "authorOnlyTarget": "cone_set"
        },
        {
          "id": "T4-C2",
          "utteranceId": "T4.2",
          "anchorText": "divided by six",
          "authorOnlyAction": "arrange_six_equal_racks",
          "authorOnlyTarget": "cone_racks"
        },
        {
          "id": "T4-C3",
          "utteranceId": "T4.2",
          "anchorText": "is five",
          "authorOnlyAction": "reveal_five_per_rack_and_one_sixth",
          "authorOnlyTarget": "one_share"
        },
        {
          "id": "T4-C4",
          "utteranceId": "T4.3",
          "anchorText": "Five times five",
          "authorOnlyAction": "select_five_racks",
          "authorOnlyTarget": "cone_racks"
        },
        {
          "id": "T4-C5",
          "utteranceId": "T4.3",
          "anchorText": "twenty-five",
          "authorOnlyAction": "reveal_result_with_cone_unit",
          "authorOnlyTarget": "result"
        },
        {
          "id": "T4-C6",
          "utteranceId": "T4.4",
          "anchorText": "amount divided by the denominator",
          "authorOnlyAction": "condense_visual_to_first_operation",
          "authorOnlyTarget": "compact_method"
        },
        {
          "id": "T4-C7",
          "utteranceId": "T4.4",
          "anchorText": "multiplied by the numerator",
          "authorOnlyAction": "reveal_second_operation",
          "authorOnlyTarget": "compact_method"
        }
      ]
    },
    {
      "id": "HANDOFF",
      "stage": "teach",
      "purpose": "Hand responsibility to the learner and explain fading support.",
      "ryanUtteranceIds": [
        "HANDOFF.1",
        "HANDOFF.2"
      ],
      "visual": {
        "kind": "stage_transition",
        "fromLabel": "Learn the idea",
        "toLabel": "Try it with me"
      },
      "timeline": [
        {
          "id": "HANDOFF-C1",
          "utteranceId": "HANDOFF.1",
          "anchorText": "split the amount into equal shares",
          "authorOnlyAction": "show_denominator_step_icon",
          "authorOnlyTarget": "method_summary"
        },
        {
          "id": "HANDOFF-C2",
          "utteranceId": "HANDOFF.1",
          "anchorText": "take the number you need",
          "authorOnlyAction": "show_numerator_step_icon",
          "authorOnlyTarget": "method_summary"
        },
        {
          "id": "HANDOFF-C3",
          "utteranceId": "HANDOFF.2",
          "anchorText": "stay with you for two",
          "authorOnlyAction": "change_stage_label_to_guided",
          "authorOnlyTarget": "stage_header"
        }
      ]
    }
  ],
  "questions": [
    {
      "id": "G1",
      "stage": "guided",
      "assessmentIntent": "unit_fraction_by_equal_sharing",
      "problemId": "G1",
      "learnerUi": {
        "title": "Find a unit fraction",
        "prompt": "Find 1/4 of 28 tickets.",
        "question": "How many tickets are in one equal group?",
        "input": {
          "kind": "integer",
          "suffix": "tickets",
          "submitLabel": "Check answer"
        }
      },
      "visual": {
        "kind": "guided_equal_groups",
        "problemId": "G1",
        "groupCount": 4,
        "itemsPerGroup": 7,
        "showAllGroups": true,
        "focusGroupCount": 1,
        "authorOnlyAccessibleDescription": "Twenty-eight ticket symbols are arranged into four equal outlined groups. A numeric answer field asks for the size of one group."
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 7
      },
      "policy": {
        "hintPolicy": "built_in_guidance",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": false,
        "maxAttemptsBeforeRepair": 2
      },
      "ryanBeforeSubmitUtteranceIds": [
        "G1.PRE"
      ],
      "feedback": {
        "correctUtteranceIds": [
          "G1.CORRECT"
        ],
        "incorrectBySignal": {
          "denominator_as_answer": [
            "G1.INCORRECT.GROUP_COUNT"
          ]
        },
        "incorrectDefaultUtteranceIds": [
          "G1.INCORRECT.DEFAULT"
        ],
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterSignal": true
      },
      "evidence": {
        "firstAttemptComponents": [
          "final"
        ],
        "centralFamilies": [
          "wrong_grouping"
        ],
        "supportCountsAsIndependent": false
      }
    },
    {
      "id": "G2",
      "stage": "guided",
      "assessmentIntent": "unit_to_non_unit_two_step",
      "problemId": "G2",
      "learnerUi": {
        "title": "Build the two steps",
        "prompt": "Find 3/5 of 25 training bibs.",
        "stepA": "Step A - find one fifth",
        "stepB": "Step B - take three groups",
        "submitLabel": "Check answer"
      },
      "visual": {
        "kind": "guided_two_step_groups",
        "problemId": "G2",
        "groupCount": 5,
        "itemsPerGroup": 5,
        "selectedGroupCount": 3,
        "showGroupStructure": true,
        "doNotShowFinalBeforeSubmit": true,
        "authorOnlyAccessibleDescription": "Twenty-five training-bib symbols are organised into five equal group outlines. Two numeric step fields are available; the final value is not announced."
      },
      "response": {
        "kind": "two_step_integer",
        "fields": [
          {
            "id": "oneShare",
            "expression": "25 ÷ 5",
            "answerBaseUnits": 5
          },
          {
            "id": "final",
            "expression": "oneShare × 3",
            "answerBaseUnits": 15
          }
        ]
      },
      "policy": {
        "hintPolicy": "built_in_guidance",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": false,
        "maxAttemptsBeforeRepair": 2
      },
      "ryanBeforeSubmitUtteranceIds": [
        "G2.PRE"
      ],
      "feedback": {
        "correctUtteranceIds": [
          "G2.CORRECT"
        ],
        "incorrectBySignal": {
          "final_equals_one_share": [
            "G2.INCORRECT.ONE_SHARE"
          ],
          "final_equals_amount_times_numerator": [
            "G2.INCORRECT.NUMERATOR_ONLY"
          ]
        },
        "incorrectDefaultUtteranceIds": [
          "G2.INCORRECT.DEFAULT"
        ],
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterSignal": true
      },
      "evidence": {
        "firstAttemptComponents": [
          "oneShare",
          "final"
        ],
        "centralFamilies": [
          "stops_after_one_share",
          "numerator_only"
        ],
        "supportCountsAsIndependent": false
      }
    },
    {
      "id": "F1",
      "stage": "faded",
      "assessmentIntent": "complete_two_step_structure",
      "problemId": "F1",
      "learnerUi": {
        "title": "Complete the method",
        "prompt": "Find 4/7 of 35.",
        "stepA": "One equal share",
        "stepB": "Four shares",
        "hintButtonLabel": "Ask for a hint",
        "submitLabel": "Check answer"
      },
      "visual": {
        "kind": "faded_two_step_workspace",
        "problemId": "F1",
        "showGroupedAnswerVisual": false,
        "editableFields": [
          "oneShare",
          "final"
        ]
      },
      "response": {
        "kind": "two_step_integer",
        "fields": [
          {
            "id": "oneShare",
            "expression": "35 ÷ 7",
            "answerBaseUnits": 5
          },
          {
            "id": "final",
            "expression": "oneShare × 4",
            "answerBaseUnits": 20
          }
        ]
      },
      "policy": {
        "hintPolicy": "optional_collapsed",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": false,
        "maxAttemptsBeforeRepair": 2,
        "requiresFreshNoHintConfirmationIfHintUsed": true
      },
      "ryanBeforeSubmitUtteranceIds": [
        "F1.PRE"
      ],
      "hintUtteranceIds": [
        "F1.HINT"
      ],
      "feedback": {
        "correctUtteranceIds": [
          "F1.CORRECT"
        ],
        "incorrectBySignal": {
          "final_equals_one_share": [
            "F1.INCORRECT.ONE_SHARE"
          ]
        },
        "incorrectDefaultUtteranceIds": [
          "F1.INCORRECT.DEFAULT"
        ],
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterSignal": true
      },
      "routeAfter": "F2"
    },
    {
      "id": "F2",
      "stage": "faded",
      "assessmentIntent": "select_correct_operation_plan",
      "problemId": "F2",
      "learnerUi": {
        "title": "Choose the correct plan",
        "prompt": "Which plan correctly finds 5/8 of 48?",
        "hintButtonLabel": "Ask for a hint",
        "submitLabel": "Check answer",
        "options": [
          {
            "id": "A",
            "label": "48 ÷ 8 × 5"
          },
          {
            "id": "B",
            "label": "48 ÷ 5 × 8"
          },
          {
            "id": "C",
            "label": "48 ÷ 8"
          },
          {
            "id": "D",
            "label": "48 × 5"
          }
        ]
      },
      "visual": {
        "kind": "operation_plan_choices",
        "problemId": "F2",
        "showGrouping": false
      },
      "response": {
        "kind": "single_choice",
        "answer": "A"
      },
      "policy": {
        "hintPolicy": "optional_collapsed",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": false,
        "maxAttemptsBeforeRepair": 2,
        "requiresFreshNoHintConfirmationIfHintUsed": true
      },
      "ryanBeforeSubmitUtteranceIds": [
        "F2.PRE"
      ],
      "hintUtteranceIds": [
        "F2.HINT"
      ],
      "feedback": {
        "correctUtteranceIds": [
          "F2.CORRECT"
        ],
        "incorrectByOption": {
          "B": [
            "F2.INCORRECT.SWAP"
          ],
          "C": [
            "F2.INCORRECT.ONE_SHARE"
          ],
          "D": [
            "F2.INCORRECT.NUMERATOR_ONLY"
          ]
        },
        "incorrectDefaultUtteranceIds": [
          "F2.INCORRECT.DEFAULT"
        ],
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterSignal": true
      }
    },
    {
      "id": "I1",
      "stage": "independent",
      "assessmentIntent": "measure_context_transfer",
      "problemId": "I1",
      "learnerUi": {
        "title": "Work out the amount",
        "context": "A cable reel holds 45 m of cable. A technician cuts off 2/5 of it. How many metres are cut off?",
        "input": {
          "kind": "decimal_or_integer",
          "suffix": "m",
          "submitLabel": "Check answer"
        },
        "hintButtonLabel": "Ask for a hint"
      },
      "visual": {
        "kind": "cable_reel",
        "problemId": "I1",
        "showAmountLabel": true,
        "showFractionLabel": true,
        "showGroups": false,
        "showOneShareValue": false,
        "authorOnlyAccessibleDescription": "A cable reel is labelled 45 metres. The prompt asks for two fifths of the cable. A numeric input with metres is available."
      },
      "response": {
        "kind": "quantity",
        "answerBaseUnits": 18,
        "scale": 1,
        "unit": "m",
        "fixedUnitSuffixPreferred": true
      },
      "policy": {
        "hintPolicy": "optional_collapsed",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": false,
        "maxAttemptsBeforeRepair": 2,
        "requiresFreshNoHintConfirmationIfHintUsed": true
      },
      "ryanBeforeSubmitUtteranceIds": [
        "I1.PRE"
      ],
      "hintUtteranceIds": [
        "I1.HINT"
      ],
      "feedback": {
        "correctUtteranceIds": [
          "I1.CORRECT"
        ],
        "incorrectBySignal": {
          "answer_equals_one_share": [
            "I1.INCORRECT.ONE_SHARE"
          ],
          "answer_equals_amount_divided_by_numerator": [
            "I1.INCORRECT.NUMDIV"
          ]
        },
        "incorrectDefaultUtteranceIds": [
          "I1.INCORRECT.DEFAULT"
        ],
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterSignal": true
      }
    },
    {
      "id": "I2",
      "stage": "independent",
      "assessmentIntent": "money_fraction_with_non_whole_pound_unit_share",
      "problemId": "I2",
      "learnerUi": {
        "title": "Money transfer",
        "context": "A £10 game voucher is split into four equal parts. You spend 3/4 of its value. How much do you spend?",
        "input": {
          "kind": "money",
          "currencyPrefix": "£",
          "submitLabel": "Check answer"
        },
        "hintButtonLabel": "Ask for a hint"
      },
      "visual": {
        "kind": "game_voucher",
        "problemId": "I2",
        "showAmountLabel": true,
        "showFractionLabel": true,
        "showPartValues": false,
        "authorOnlyAccessibleDescription": "A ten-pound game voucher is shown. The prompt asks for three quarters of its value. A pounds-and-pence input is available."
      },
      "response": {
        "kind": "money",
        "answerBaseUnits": 750,
        "scale": 100,
        "currency": "GBP",
        "acceptedForms": [
          "£7.50",
          "7.50",
          "750p",
          "750 p"
        ]
      },
      "policy": {
        "hintPolicy": "optional_collapsed",
        "solutionPolicy": "after_response",
        "scored": true,
        "answerLocksOnSubmit": false,
        "maxAttemptsBeforeRepair": 2,
        "requiresFreshNoHintConfirmationIfHintUsed": true
      },
      "ryanBeforeSubmitUtteranceIds": [
        "I2.PRE"
      ],
      "hintUtteranceIds": [
        "I2.HINT"
      ],
      "feedback": {
        "correctUtteranceIds": [
          "I2.CORRECT"
        ],
        "incorrectBySignal": {
          "answer_equals_one_share": [
            "I2.INCORRECT.ONE_SHARE"
          ]
        },
        "incorrectDefaultUtteranceIds": [
          "I2.INCORRECT.DEFAULT"
        ],
        "playExactlyOneOutcomeBranch": true,
        "doNotPlayDefaultAfterSignal": true
      }
    },
    {
      "id": "M1",
      "stage": "final",
      "assessmentIntent": "independent_unit_fraction_procedure",
      "problemId": "M1",
      "learnerUi": {
        "prompt": "Find 1/7 of 56.",
        "input": {
          "kind": "integer",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "M1",
        "showOperations": false,
        "showGroups": false,
        "authorOnlyAccessibleDescription": "The expression one seventh of fifty-six is shown with a numeric answer field."
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 8
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "allowChangeBeforeSubmit": true
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correctUtteranceIds": [
          "M1.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "M1.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "M1.WORK.1",
          "M1.WORK.2"
        ],
        "visibleSteps": [
          "56 ÷ 7 = 8",
          "1/7 of 56 = 8",
          "Answer: 8"
        ],
        "requiresAnswerLocked": true,
        "cues": [
          {
            "id": "M1-W1",
            "utteranceId": "M1.WORK.1",
            "anchorText": "divided by seven",
            "authorOnlyAction": "reveal_division_step",
            "authorOnlyTarget": "worked_panel"
          },
          {
            "id": "M1-W2",
            "utteranceId": "M1.WORK.2",
            "anchorText": "is eight",
            "authorOnlyAction": "reveal_answer_line",
            "authorOnlyTarget": "worked_panel"
          }
        ]
      },
      "errorSignals": {
        "7": "possible_denominator_as_answer_only_do_not_classify_from_one_item"
      }
    },
    {
      "id": "M2",
      "stage": "final",
      "assessmentIntent": "independent_non_unit_procedure",
      "problemId": "M2",
      "learnerUi": {
        "prompt": "Find 5/6 of 42.",
        "input": {
          "kind": "integer",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "M2",
        "showOperations": false,
        "showGroups": false,
        "authorOnlyAccessibleDescription": "The expression five sixths of forty-two is shown with a numeric answer field."
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 35
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "allowChangeBeforeSubmit": true
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correctUtteranceIds": [
          "M2.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "M2.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "M2.WORK.1",
          "M2.WORK.2"
        ],
        "visibleSteps": [
          "42 ÷ 6 = 7",
          "7 × 5 = 35",
          "Answer: 35"
        ],
        "requiresAnswerLocked": true,
        "cues": [
          {
            "id": "M2-W1",
            "utteranceId": "M2.WORK.1",
            "anchorText": "divided by six",
            "authorOnlyAction": "reveal_one_share_step",
            "authorOnlyTarget": "worked_panel"
          },
          {
            "id": "M2-W2",
            "utteranceId": "M2.WORK.2",
            "anchorText": "times five",
            "authorOnlyAction": "reveal_scaling_step",
            "authorOnlyTarget": "worked_panel"
          }
        ]
      },
      "errorSignals": {
        "7": "stops_after_one_share",
        "210": "numerator_only_denominator_ignored"
      }
    },
    {
      "id": "M3",
      "stage": "final",
      "assessmentIntent": "measure_application",
      "problemId": "M3",
      "learnerUi": {
        "context": "A roll contains 32 m of ribbon. 3/8 is used. How many metres are used?",
        "input": {
          "kind": "quantity",
          "suffix": "m",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "ribbon_roll",
        "problemId": "M3",
        "showAmountLabel": true,
        "showFractionLabel": true,
        "showOperations": false,
        "authorOnlyAccessibleDescription": "A ribbon roll is labelled 32 metres. The prompt asks how many metres are three eighths of the roll. A numeric field with metres is available."
      },
      "response": {
        "kind": "quantity",
        "answerBaseUnits": 12,
        "scale": 1,
        "unit": "m",
        "fixedUnitSuffixPreferred": true,
        "missingUnitPromptOnceIfFreeText": true
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "allowChangeBeforeSubmit": true
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correctUtteranceIds": [
          "M3.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "M3.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "M3.WORK.1",
          "M3.WORK.2"
        ],
        "visibleSteps": [
          "32 m ÷ 8 = 4 m",
          "4 m × 3 = 12 m",
          "Answer: 12 m"
        ],
        "requiresAnswerLocked": true,
        "cues": [
          {
            "id": "M3-W1",
            "utteranceId": "M3.WORK.1",
            "anchorText": "four metres",
            "authorOnlyAction": "reveal_one_share_with_unit",
            "authorOnlyTarget": "worked_panel"
          },
          {
            "id": "M3-W2",
            "utteranceId": "M3.WORK.2",
            "anchorText": "twelve metres",
            "authorOnlyAction": "reveal_result_with_unit",
            "authorOnlyTarget": "worked_panel"
          }
        ]
      },
      "errorSignals": {
        "4": "stops_after_one_share"
      }
    },
    {
      "id": "M4",
      "stage": "final",
      "assessmentIntent": "money_application",
      "problemId": "M4",
      "learnerUi": {
        "context": "Five ninths of a £36 prize fund is paid out. How much is paid out?",
        "input": {
          "kind": "money",
          "currencyPrefix": "£",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "prize_fund_card",
        "problemId": "M4",
        "showAmountLabel": true,
        "showFractionLabel": true,
        "showOperations": false,
        "authorOnlyAccessibleDescription": "A prize fund is labelled thirty-six pounds. The prompt asks for five ninths of the fund. A pounds input is available."
      },
      "response": {
        "kind": "money",
        "answerBaseUnits": 2000,
        "scale": 100,
        "currency": "GBP",
        "acceptedForms": [
          "£20",
          "£20.00",
          "20",
          "20.00",
          "2000p"
        ]
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "allowChangeBeforeSubmit": true
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correctUtteranceIds": [
          "M4.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "M4.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "M4.WORK.1",
          "M4.WORK.2"
        ],
        "visibleSteps": [
          "£36 ÷ 9 = £4",
          "£4 × 5 = £20",
          "Answer: £20"
        ],
        "requiresAnswerLocked": true,
        "cues": [
          {
            "id": "M4-W1",
            "utteranceId": "M4.WORK.1",
            "anchorText": "four pounds",
            "authorOnlyAction": "reveal_one_share_money",
            "authorOnlyTarget": "worked_panel"
          },
          {
            "id": "M4-W2",
            "utteranceId": "M4.WORK.2",
            "anchorText": "twenty pounds",
            "authorOnlyAction": "reveal_final_money",
            "authorOnlyTarget": "worked_panel"
          }
        ]
      },
      "errorSignals": {
        "400": "stops_after_one_share",
        "18000": "numerator_only_denominator_ignored"
      }
    },
    {
      "id": "M5",
      "stage": "final",
      "assessmentIntent": "reasoning_recognise_one_share_stop",
      "problemId": "M5",
      "learnerUi": {
        "prompt": "Sam wants 3/5 of 40. What has he found when he stops at 8?",
        "studentWork": "Sam writes: 40 ÷ 5 = 8, then stops.",
        "options": [
          {
            "id": "A",
            "label": "The whole amount"
          },
          {
            "id": "B",
            "label": "One fifth of 40"
          },
          {
            "id": "C",
            "label": "Three fifths of 40"
          },
          {
            "id": "D",
            "label": "Five thirds of 40"
          }
        ],
        "submitLabel": "Lock answer"
      },
      "visual": {
        "kind": "reasoning_work_sample",
        "problemId": "M5",
        "showFinalAnswer": false,
        "authorOnlyAccessibleDescription": "Sam's work shows forty divided by five equals eight, followed by four answer choices describing what eight represents."
      },
      "response": {
        "kind": "single_choice",
        "answer": "B"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true,
        "allowChangeBeforeSubmit": true
      },
      "ryanBeforeSubmitUtteranceIds": [],
      "feedback": {
        "correctUtteranceIds": [
          "M5.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "M5.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "M5.WORK.1",
          "M5.WORK.2"
        ],
        "visibleSteps": [
          "40 ÷ 5 = 8 = one fifth",
          "8 × 3 = 24 = three fifths",
          "Answer: B"
        ],
        "requiresAnswerLocked": true,
        "cues": [
          {
            "id": "M5-W1",
            "utteranceId": "M5.WORK.1",
            "anchorText": "one fifth",
            "authorOnlyAction": "label_eight_as_one_share",
            "authorOnlyTarget": "worked_panel"
          },
          {
            "id": "M5-W2",
            "utteranceId": "M5.WORK.2",
            "anchorText": "twenty-four",
            "authorOnlyAction": "reveal_remaining_numerator_step",
            "authorOnlyTarget": "worked_panel"
          }
        ]
      }
    }
  ],
  "confirmations": [
    {
      "id": "C-PROC",
      "stage": "confirmation",
      "assessmentIntent": "fresh_general_two_step_confirmation",
      "problemId": "C-PROC",
      "learnerUi": {
        "prompt": "Find 4/9 of 45.",
        "input": {
          "kind": "integer",
          "submitLabel": "Check answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "C-PROC",
        "showOperations": false
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 20
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "none_before_outcome",
        "scored": true,
        "answerLocksOnSubmit": false
      },
      "feedback": {
        "correctUtteranceIds": [
          "C-PROC.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "C-PROC.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "freshnessFamily": "general_process"
    },
    {
      "id": "C-MONEY",
      "stage": "confirmation",
      "assessmentIntent": "fresh_money_confirmation",
      "problemId": "C-MONEY",
      "learnerUi": {
        "prompt": "Find 3/4 of £6.",
        "input": {
          "kind": "money",
          "currencyPrefix": "£",
          "submitLabel": "Check answer"
        }
      },
      "visual": {
        "kind": "money_expression",
        "problemId": "C-MONEY",
        "showOperations": false
      },
      "response": {
        "kind": "money",
        "answerBaseUnits": 450,
        "scale": 100,
        "currency": "GBP",
        "acceptedForms": [
          "£4.50",
          "4.50",
          "450p"
        ]
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "none_before_outcome",
        "scored": true,
        "answerLocksOnSubmit": false
      },
      "feedback": {
        "correctUtteranceIds": [
          "C-MONEY.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "C-MONEY.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "freshnessFamily": "money"
    },
    {
      "id": "C-ONE",
      "stage": "confirmation",
      "assessmentIntent": "confirm_after_stop_at_one_share_repair",
      "problemId": "C-ONE",
      "learnerUi": {
        "prompt": "Find 3/8 of 40.",
        "input": {
          "kind": "integer",
          "submitLabel": "Check answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "C-ONE",
        "showOperations": false
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 15
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "none_before_outcome",
        "scored": true,
        "answerLocksOnSubmit": false
      },
      "feedback": {
        "correctUtteranceIds": [
          "C-ONE.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "C-ONE.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "freshnessFamily": "stops_after_one_share"
    },
    {
      "id": "C-GROUP",
      "stage": "confirmation",
      "assessmentIntent": "confirm_after_wrong_grouping_repair",
      "problemId": "C-GROUP",
      "learnerUi": {
        "prompt": "Find 3/6 of 24 counters.",
        "input": {
          "kind": "integer",
          "suffix": "counters",
          "submitLabel": "Check answer"
        }
      },
      "visual": {
        "kind": "ungrouped_counter_set",
        "problemId": "C-GROUP",
        "showOperations": false,
        "showGroupLabels": false
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 12
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "none_before_outcome",
        "scored": true,
        "answerLocksOnSubmit": false
      },
      "feedback": {
        "correctUtteranceIds": [
          "C-GROUP.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "C-GROUP.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "freshnessFamily": "wrong_grouping"
    },
    {
      "id": "C-NUMDIV",
      "stage": "confirmation",
      "assessmentIntent": "confirm_after_divide_by_numerator_repair",
      "problemId": "C-NUMDIV",
      "learnerUi": {
        "prompt": "Find 5/8 of 32.",
        "input": {
          "kind": "integer",
          "submitLabel": "Check answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "C-NUMDIV",
        "showOperations": false
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 20
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "none_before_outcome",
        "scored": true,
        "answerLocksOnSubmit": false
      },
      "feedback": {
        "correctUtteranceIds": [
          "C-NUMDIV.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "C-NUMDIV.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "freshnessFamily": "divide_by_numerator"
    },
    {
      "id": "C-OPERATOR",
      "stage": "confirmation",
      "assessmentIntent": "confirm_after_numerator_only_repair",
      "problemId": "C-OPERATOR",
      "learnerUi": {
        "prompt": "Find 4/9 of 27.",
        "input": {
          "kind": "integer",
          "submitLabel": "Check answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "C-OPERATOR",
        "showOperations": false
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 12
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "none_before_outcome",
        "scored": true,
        "answerLocksOnSubmit": false
      },
      "feedback": {
        "correctUtteranceIds": [
          "C-OPERATOR.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "C-OPERATOR.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "freshnessFamily": "numerator_only"
    }
  ],
  "repairs": [
    {
      "id": "R-ONE",
      "stage": "repair",
      "errorFamily": "stops_after_one_share",
      "problemId": "R-ONE",
      "ryanUtteranceIds": [
        "R-ONE.1",
        "R-ONE.2",
        "R-ONE.3"
      ],
      "visual": {
        "kind": "equal_share_accumulation",
        "problemId": "R-ONE",
        "groupCount": 7,
        "itemsPerGroup": 5,
        "selectedGroupCount": 4,
        "runningTotals": [
          5,
          10,
          15,
          20
        ]
      },
      "freshCheckId": "C-ONE",
      "oneCyclePerAttempt": true,
      "timeline": [
        {
          "id": "R1-C1",
          "utteranceId": "R-ONE.2",
          "anchorText": "one seventh",
          "authorOnlyAction": "focus_one_group",
          "authorOnlyTarget": "repair_model"
        },
        {
          "id": "R1-C2",
          "utteranceId": "R-ONE.3",
          "anchorText": "five, ten, fifteen, twenty",
          "authorOnlyAction": "select_four_groups_in_sequence",
          "authorOnlyTarget": "repair_model"
        }
      ]
    },
    {
      "id": "R-GROUP",
      "stage": "repair",
      "errorFamily": "wrong_grouping",
      "problemId": "R-GROUP",
      "ryanUtteranceIds": [
        "R-GROUP.1",
        "R-GROUP.2",
        "R-GROUP.3"
      ],
      "visual": {
        "kind": "wrong_vs_right_grouping",
        "problemId": "R-GROUP",
        "wrongLayout": {
          "groupCount": 4,
          "itemsPerGroup": 5
        },
        "rightLayout": {
          "groupCount": 5,
          "itemsPerGroup": 4
        },
        "selectedGroupCount": 2
      },
      "freshCheckId": "C-GROUP",
      "oneCyclePerAttempt": true,
      "timeline": [
        {
          "id": "RG-C1",
          "utteranceId": "R-GROUP.1",
          "anchorText": "how many equal groups",
          "authorOnlyAction": "emphasise_group_count",
          "authorOnlyTarget": "right_layout"
        },
        {
          "id": "RG-C2",
          "utteranceId": "R-GROUP.2",
          "anchorText": "five equal groups",
          "authorOnlyAction": "replace_wrong_layout_with_right_layout",
          "authorOnlyTarget": "group_compare"
        },
        {
          "id": "RG-C3",
          "utteranceId": "R-GROUP.3",
          "anchorText": "eight",
          "authorOnlyAction": "select_two_groups_and_reveal_total",
          "authorOnlyTarget": "right_layout"
        }
      ]
    },
    {
      "id": "R-NUMDIV",
      "stage": "repair",
      "errorFamily": "divide_by_numerator",
      "problemId": "R-NUMDIV",
      "ryanUtteranceIds": [
        "R-NUMDIV.1",
        "R-NUMDIV.2",
        "R-NUMDIV.3"
      ],
      "visual": {
        "kind": "fraction_role_arrows",
        "problemId": "R-NUMDIV",
        "denominatorTarget": "division",
        "numeratorTarget": "multiplication"
      },
      "freshCheckId": "C-NUMDIV",
      "oneCyclePerAttempt": true,
      "timeline": [
        {
          "id": "RN-C1",
          "utteranceId": "R-NUMDIV.1",
          "anchorText": "denominator",
          "authorOnlyAction": "connect_denominator_to_division",
          "authorOnlyTarget": "role_arrows"
        },
        {
          "id": "RN-C2",
          "utteranceId": "R-NUMDIV.2",
          "anchorText": "seven in one quarter",
          "authorOnlyAction": "reveal_one_share",
          "authorOnlyTarget": "equation"
        },
        {
          "id": "RN-C3",
          "utteranceId": "R-NUMDIV.3",
          "anchorText": "twenty-one",
          "authorOnlyAction": "reveal_final_result",
          "authorOnlyTarget": "equation"
        }
      ]
    },
    {
      "id": "R-OPERATOR",
      "stage": "repair",
      "errorFamily": "numerator_only",
      "problemId": "R-OPERATOR",
      "ryanUtteranceIds": [
        "R-OPERATOR.1",
        "R-OPERATOR.2",
        "R-OPERATOR.3"
      ],
      "visual": {
        "kind": "incomplete_vs_complete_operator",
        "problemId": "R-OPERATOR",
        "wrongExpression": "25 × 3 = 75",
        "rightExpression": "25 ÷ 5 = 5; 5 × 3 = 15",
        "acceptCompletedAlternateOrder": "25 × 3 ÷ 5 = 15"
      },
      "freshCheckId": "C-OPERATOR",
      "oneCyclePerAttempt": true,
      "timeline": [
        {
          "id": "RO-C1",
          "utteranceId": "R-OPERATOR.1",
          "anchorText": "never makes fifths",
          "authorOnlyAction": "cross_out_incomplete_expression",
          "authorOnlyTarget": "wrong_expression"
        },
        {
          "id": "RO-C2",
          "utteranceId": "R-OPERATOR.2",
          "anchorText": "divide twenty-five by five",
          "authorOnlyAction": "reveal_denominator_stage",
          "authorOnlyTarget": "right_expression"
        },
        {
          "id": "RO-C3",
          "utteranceId": "R-OPERATOR.3",
          "anchorText": "fifteen",
          "authorOnlyAction": "reveal_final_result",
          "authorOnlyTarget": "right_expression"
        }
      ]
    }
  ],
  "alternateFinals": [
    {
      "id": "A1",
      "stage": "recovery_final",
      "assessmentIntent": "alternate_unit_fraction",
      "problemId": "A1",
      "learnerUi": {
        "prompt": "Find 1/8 of 72.",
        "input": {
          "kind": "integer",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "A1",
        "showOperations": false
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 9
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true
      },
      "feedback": {
        "correctUtteranceIds": [
          "A1.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "A1.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "A1.WORK.1",
          "A1.WORK.2"
        ],
        "visibleSteps": [
          "72 ÷ 8 = 9",
          "1/8 of 72 = 9"
        ],
        "requiresAnswerLocked": true
      }
    },
    {
      "id": "A2",
      "stage": "recovery_final",
      "assessmentIntent": "alternate_non_unit_procedure",
      "problemId": "A2",
      "learnerUi": {
        "prompt": "Find 4/9 of 63.",
        "input": {
          "kind": "integer",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "fraction_of_amount_expression",
        "problemId": "A2",
        "showOperations": false
      },
      "response": {
        "kind": "integer",
        "answerBaseUnits": 28
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true
      },
      "feedback": {
        "correctUtteranceIds": [
          "A2.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "A2.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "A2.WORK.1",
          "A2.WORK.2"
        ],
        "visibleSteps": [
          "63 ÷ 9 = 7",
          "7 × 4 = 28"
        ],
        "requiresAnswerLocked": true
      }
    },
    {
      "id": "A3",
      "stage": "recovery_final",
      "assessmentIntent": "alternate_measure_application",
      "problemId": "A3",
      "learnerUi": {
        "context": "Five sixths of a 48 kg bag is used. How many kilograms are used?",
        "input": {
          "kind": "quantity",
          "suffix": "kg",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "bag_context",
        "problemId": "A3",
        "showOperations": false
      },
      "response": {
        "kind": "quantity",
        "answerBaseUnits": 40,
        "scale": 1,
        "unit": "kg",
        "fixedUnitSuffixPreferred": true
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true
      },
      "feedback": {
        "correctUtteranceIds": [
          "A3.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "A3.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "A3.WORK.1",
          "A3.WORK.2"
        ],
        "visibleSteps": [
          "48 kg ÷ 6 = 8 kg",
          "8 kg × 5 = 40 kg"
        ],
        "requiresAnswerLocked": true
      }
    },
    {
      "id": "A4",
      "stage": "recovery_final",
      "assessmentIntent": "alternate_money_application",
      "problemId": "A4",
      "learnerUi": {
        "context": "Seven tenths of a £50 fund is paid out. How much is paid out?",
        "input": {
          "kind": "money",
          "currencyPrefix": "£",
          "submitLabel": "Lock answer"
        }
      },
      "visual": {
        "kind": "fund_context",
        "problemId": "A4",
        "showOperations": false
      },
      "response": {
        "kind": "money",
        "answerBaseUnits": 3500,
        "scale": 100,
        "currency": "GBP",
        "acceptedForms": [
          "£35",
          "£35.00",
          "35",
          "3500p"
        ]
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true
      },
      "feedback": {
        "correctUtteranceIds": [
          "A4.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "A4.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "A4.WORK.1",
          "A4.WORK.2"
        ],
        "visibleSteps": [
          "£50 ÷ 10 = £5",
          "£5 × 7 = £35"
        ],
        "requiresAnswerLocked": true
      }
    },
    {
      "id": "A5",
      "stage": "recovery_final",
      "assessmentIntent": "alternate_reasoning_missing_numerator_step",
      "problemId": "A5",
      "learnerUi": {
        "prompt": "For 4/7 of 35, a learner finds 5. What step is still needed?",
        "options": [
          {
            "id": "A",
            "label": "Multiply 5 by 4"
          },
          {
            "id": "B",
            "label": "Divide 5 by 4"
          },
          {
            "id": "C",
            "label": "Stop, because 5 is the final answer"
          },
          {
            "id": "D",
            "label": "Multiply 35 by 7"
          }
        ],
        "submitLabel": "Lock answer"
      },
      "visual": {
        "kind": "reasoning_work_sample",
        "problemId": "A5",
        "showFinalAnswer": false
      },
      "response": {
        "kind": "single_choice",
        "answer": "A"
      },
      "policy": {
        "hintPolicy": "none",
        "solutionPolicy": "after_locked_submit",
        "scored": true,
        "answerLocksOnSubmit": true
      },
      "feedback": {
        "correctUtteranceIds": [
          "A5.CORRECT"
        ],
        "incorrectDefaultUtteranceIds": [
          "A5.INCORRECT"
        ],
        "playExactlyOneOutcomeBranch": true
      },
      "workedCheck": {
        "ryanUtteranceIds": [
          "A5.WORK.1",
          "A5.WORK.2"
        ],
        "visibleSteps": [
          "35 ÷ 7 = 5 = one seventh",
          "5 × 4 = 20 = four sevenths"
        ],
        "requiresAnswerLocked": true
      }
    }
  ],
  "misconceptions": [
    {
      "id": "M-ONE",
      "errorFamily": "stops_after_one_share",
      "meaning": "Learner returns amount divided by denominator on a non-unit item and does not use the numerator.",
      "strongSignals": [
        "numeric answer equals oneShareBaseUnits on a non-unit item",
        "selected operation stops after amount ÷ denominator"
      ],
      "immediateNeutralOrTargetedFeedback": "You have found one equal share. What does the numerator ask you to do next?",
      "classificationThreshold": "One structurally clear signal may create a hypothesis; named repair after repetition or second miss.",
      "repairId": "R-ONE"
    },
    {
      "id": "M-GROUP",
      "errorFamily": "wrong_grouping",
      "meaning": "Learner treats denominator as items per group instead of number of equal groups.",
      "strongSignals": [
        "observable visual grouping has denominator items in each group",
        "repeated answer pattern consistent with wrong group layout"
      ],
      "immediateNeutralOrTargetedFeedback": "The denominator tells how many equal groups, not how many objects go in each.",
      "classificationThreshold": "Visual behaviour or repeated matching numeric evidence.",
      "repairId": "R-GROUP"
    },
    {
      "id": "M-NUMDIV",
      "errorFamily": "divide_by_numerator",
      "meaning": "Learner divides by numerator or swaps fraction jobs.",
      "strongSignals": [
        "selected F2 option B",
        "answer equals amount ÷ numerator where exact"
      ],
      "immediateNeutralOrTargetedFeedback": "Which fraction number tells how many equal shares the whole is split into?",
      "classificationThreshold": "Confirm on a fresh item unless the plan selection is explicit.",
      "repairId": "R-NUMDIV"
    },
    {
      "id": "M-OP",
      "errorFamily": "numerator_only",
      "meaning": "Learner multiplies by numerator but never creates denominator-sized shares.",
      "strongSignals": [
        "answer equals amount × numerator",
        "selected F2 option D",
        "written working stops after × numerator"
      ],
      "immediateNeutralOrTargetedFeedback": "The numerator tells how many shares to take, but the denominator must create the shares first.",
      "classificationThreshold": "Repeated numerator-only behaviour or explicit plan choice.",
      "repairId": "R-OPERATOR"
    },
    {
      "id": "M-ARITH",
      "errorFamily": "arithmetic_slip",
      "meaning": "The two-operation structure is correct but one fact is wrong.",
      "strongSignals": [
        "captured working uses correct operations but one quotient/product is incorrect"
      ],
      "immediateNeutralOrTargetedFeedback": "Your plan is right. Recheck that multiplication or division fact.",
      "classificationThreshold": "Never classify as a fraction misconception from one arithmetic slip.",
      "repairId": null
    },
    {
      "id": "M-UNIT",
      "errorFamily": "unit_omission",
      "meaning": "Correct number but unit omitted or changed.",
      "strongSignals": [
        "numeric value correct while required unit is absent or different"
      ],
      "immediateNeutralOrTargetedFeedback": "Keep the unit from the amount in your final answer.",
      "classificationThreshold": "Prompt once; treat as presentation evidence rather than central concept failure.",
      "repairId": null
    }
  ],
  "routing": {
    "strongGuidedDecision": {
      "requiredQuestionIds": [
        "G1",
        "G2"
      ],
      "allRequiredComponentsFirstAttemptCorrect": true,
      "noSupportEscalation": true,
      "noCentralErrorHypothesis": true,
      "responseSpeedIgnored": true,
      "onStrong": "skip_F1_keep_F2",
      "onNotStrong": "show_F1_then_F2"
    },
    "independentGate": {
      "requiredQuestionIds": [
        "I1",
        "I2"
      ],
      "minimumFreshNoHintNonUnitSuccess": 1,
      "hintSuccessRequiresFreshConfirmation": true,
      "unresolvedBlockingMisconceptionPreventsFinal": true,
      "confirmationMap": {
        "general": "C-PROC",
        "money": "C-MONEY",
        "stops_after_one_share": "C-ONE",
        "wrong_grouping": "C-GROUP",
        "divide_by_numerator": "C-NUMDIV",
        "numerator_only": "C-OPERATOR"
      }
    },
    "finalIntroUtteranceIds": [
      "FINAL.INTRO.1",
      "FINAL.INTRO.2"
    ],
    "primaryFinalIds": [
      "M1",
      "M2",
      "M3",
      "M4",
      "M5"
    ],
    "mastery": {
      "minimumCorrect": 4,
      "total": 5,
      "requiresAtLeastOneDirectCalculation": true,
      "requiresAtLeastOneContextOrReasoningItem": true,
      "blockingMisconceptionMayAppearAtMostOnce": true,
      "useCommittedPreWorkingAnswersOnly": true
    },
    "finalRoutes": {
      "3": "targeted_repair_then_two_fresh_no_hint_items_both_required",
      "4-5": "finish_if_family_coverage_and_no_repeated_blocking_misconception",
      "0-2": "targeted_repairs_then_fresh_five_item_alternate_final_require_4_of_5"
    },
    "miniCheckIntroUtteranceIds": [
      "RECOVERY.MINI.INTRO"
    ],
    "alternateFinalIntroUtteranceIds": [
      "RECOVERY.FINAL.INTRO"
    ],
    "alternateFinalIds": [
      "A1",
      "A2",
      "A3",
      "A4",
      "A5"
    ],
    "repairCycleCapPerFamily": 1,
    "completionUtteranceIds": [
      "COMPLETE"
    ],
    "needsWorkUtteranceIds": [
      "NEEDS_WORK"
    ],
    "noGlobalDiagnostic": true,
    "noRetrievalScheduling": true
  },
  "engineeringAcceptance": {
    "dataIntegrity": [
      "One problem object drives numerator, denominator, amount, unit, one-share value, result, visual grouping, accepted answer and worked check.",
      "All core and recovery problems use positive exact quantities and non-zero denominators.",
      "Money is stored in integer pence and formatted only at the UI boundary.",
      "Completed amount × numerator ÷ denominator working is accepted when mathematically valid; the modelled route remains divide by denominator first.",
      "For proper fractions, resultBaseUnits does not exceed amountBaseUnits."
    ],
    "runtimeCopyBoundary": [
      "Only FRA13_RUNTIME_COPY.text may enter Ryan TTS or Ryan captions.",
      "No authorOnly field, assessment intent, route label, QA sentence, prompt, option or analytics identifier is automatically voiced.",
      "No captionText property exists anywhere in the canonical spec.",
      "Every runtime utterance is referenced by a scene, question, repair, recovery route or completion route."
    ],
    "outcomeBranching": [
      "Every scored question computes correctness first and plays exactly one outcome branch.",
      "Error-specific feedback suppresses default incorrect feedback.",
      "The unscored hook has no false right/wrong message and converges only after the learner chooses.",
      "Final worked checks appear only after answerLocked is true."
    ],
    "routeTests": [
      "Strong route: G1 and both G2 components first-attempt correct, no escalation -> skip F1, keep F2.",
      "Standard route: any guided miss/escalation -> F1 then F2.",
      "Hint-assisted I1/I2 success -> fresh no-hint same-family confirmation before final.",
      "Repeated stop-after-one-share -> R-ONE -> C-ONE.",
      "Repeated wrong grouping -> R-GROUP -> C-GROUP.",
      "Confirmed divide-by-numerator -> R-NUMDIV -> C-NUMDIV.",
      "Repeated numerator-only -> R-OPERATOR -> C-OPERATOR.",
      "4-5/5 final finishes only with required family coverage and no repeated blocking misconception.",
      "3/5 final -> targeted repair plus two fresh no-hint items, both correct.",
      "0-2/5 final -> targeted repair plus alternate A1-A5, requiring 4/5.",
      "Repair cycle cap prevents infinite loops; unresolved difficulty ends needs-work rather than false completion."
    ],
    "leakageTests": [
      "Hook does not arrange twenty tokens into fifths before the choice.",
      "G1/G2 may show authored support but Ryan does not state the quotient or final before response.",
      "F1/F2 hints guide roles without stating 20 or option A directly.",
      "I1/I2 do not reveal one-share values before submit.",
      "M1-M5 and A1-A5 have no hint, no operation overlay and no worked panel before answer lock.",
      "Accessible descriptions name the task and controls without giving group size, quotient or answer."
    ],
    "visualTests": [
      "HOOK card A has exactly 8 tokens; card B has exactly 20 neutral tokens.",
      "T1 uses 5 groups of 4; T3 highlights exactly 3 groups.",
      "T4 uses 30 cones, 6 racks of 5, and selects 5 racks.",
      "G1 uses 28 tickets as 4 groups of 7.",
      "G2 uses 25 bibs as 5 groups of 5.",
      "I1 is a cable reel, I2 a game voucher, M3 a ribbon roll, M4 a prize fund; do not substitute generic bars for these contexts.",
      "All equal groups are geometrically equal; selected state uses colour plus outline/texture."
    ],
    "responsiveAccessibility": [
      "Inspect desktop and approximately 390 px mobile.",
      "Five trays may wrap 3+2 and six trays 3+3 without changing order or equality.",
      "Two-step equations stack vertically on mobile.",
      "Keyboard order is prompt -> answer controls -> hint if present -> submit -> worked check.",
      "Touch targets are at least 44 px; focus is visible.",
      "Reduced motion preserves each mathematical state in the same logical order.",
      "Currency is announced as pounds and pence; fixed unit suffixes remain semantically attached to inputs."
    ],
    "regression": [
      "Reuse the existing canonical Revily FRA lesson engine; do not create a FRA13-specific parallel engine.",
      "Do not change FRA01-FRA12 lesson content or FRA14+ lesson content.",
      "Do not add global Diagnostic, Retrieval or spaced-review behaviour.",
      "Any shared-engine change is minimal, backwards-compatible and listed in the final implementation report.",
      "Do not assume unmerged changes from parallel Codex tasks are present."
    ]
  }
};
  window.RevilyFra13V1 = { runtimeCopy: window.FRA13_RUNTIME_COPY, problems: window.FRA13_PROBLEMS, spec: window.RevilyFra13Approved };
})();
