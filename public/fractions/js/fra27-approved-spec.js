// Generated from src/lessons/fractions/FRA-27/LessonSpec.ts. Do not edit by hand.
(function () {
  "use strict";
  const exports = {};
  /**
   * LessonSpec.ts - owner-approved implementation handoff v1
   *
   * FRA-27 - Divide a Fraction by an Integer
   *
   * This is an architecture-neutral canonical lesson source for Codex. It
   * deliberately separates:
   *   1. exact learner-facing Ryan runtime copy;
   *   2. visible learner UI copy;
   *   3. author-only pedagogy, visual, routing and QA directions.
   *
   * HARD COPY BOUNDARY
   * Ryan audio and Ryan captions may resolve only from
   * FRA27_RUNTIME_COPY[id].text. Every entry in that registry is exact speech
   * explicitly authored for Ryan in the approved storyboard. FRA27_UI_COPY is
   * learner-visible semantic UI only and must never be sent to TTS or used as a
   * Ryan caption. Author-only prose must never enter either learner channel.
   *
   * Audio, captions and mathematical cues must resolve the same runtime
   * utterance ID. Removing speech requires removing or remapping its caption and
   * visual cues so no orphan highlights remain.
   *
   * The approved storyboard remains the visual/pedagogical reference. This file
   * is authoritative for exact runtime copy, visible UI copy, item data, outcome
   * branching, routing, fixed recovery banks and implementation acceptance
   * contracts.
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.assertFRA27LessonSpec = exports.validateFRA27LessonSpec = exports.FRA27_LESSON_SPEC = exports.FRA27 = exports.FRA27_MISCONCEPTIONS = exports.FRA27_TEACHING_SCENES = exports.FRA27_SPEECH_CUES = exports.FRA27_MINI_CHECK_BANKS = exports.FRA27_REPAIRS = exports.FRA27_QUESTIONS = exports.FRA27_PROBLEMS = exports.FRA27_UI_COPY = exports.FRA27_RUNTIME_COPY = void 0;
  exports.gcd = gcd;
  exports.normalizeFraction = normalizeFraction;
  exports.areEquivalentFractions = areEquivalentFractions;
  exports.reciprocalOfInteger = reciprocalOfInteger;
  exports.divideFractionByInteger = divideFractionByInteger;
  exports.rawReciprocalProduct = rawReciprocalProduct;
  exports.directShareResult = directShareResult;
  exports.checkFRA27Response = checkFRA27Response;
  exports.shouldSkipF1 = shouldSkipF1;
  exports.needsFreshConfirmation = needsFreshConfirmation;
  exports.confirmationQuestionFor = confirmationQuestionFor;
  exports.repairForFamily = repairForFamily;
  exports.repeatedBlockingFamily = repeatedBlockingFamily;
  exports.evaluatePrimaryFinalRoute = evaluatePrimaryFinalRoute;
  exports.evaluateRecoveryCompletion = evaluateRecoveryCompletion;
  exports.createInitialFRA27AttemptState = createInitialFRA27AttemptState;
  exports.migrateFRA27AttemptState = migrateFRA27AttemptState;
  exports.findLikelyAdjacentSemanticRepetition = findLikelyAdjacentSemanticRepetition;
  exports.validateFRA27CanonicalSpec = validateFRA27CanonicalSpec;
  exports.assertFRA27CanonicalSpec = assertFRA27CanonicalSpec;
  exports.getFRA27Inventory = getFRA27Inventory;
  function gcd(a, b) {
      let x = Math.abs(Math.trunc(a));
      let y = Math.abs(Math.trunc(b));
      while (y !== 0) {
          const r = x % y;
          x = y;
          y = r;
      }
      return x;
  }
  function normalizeFraction(value) {
      if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
          throw new Error("Fractions must contain integer fields.");
      }
      if (value.denominator === 0)
          throw new Error("A denominator cannot be zero.");
      const sign = value.denominator < 0 ? -1 : 1;
      const n = value.numerator * sign;
      const d = value.denominator * sign;
      const factor = gcd(n, d) || 1;
      return { numerator: n / factor, denominator: d / factor };
  }
  function areEquivalentFractions(a, b) {
      if (a.denominator === 0 || b.denominator === 0)
          return false;
      return a.numerator * b.denominator === b.numerator * a.denominator;
  }
  function reciprocalOfInteger(value) {
      if (!Number.isInteger(value) || value <= 0) {
          throw new Error("FRA-27 integer divisors must be positive integers.");
      }
      return { numerator: 1, denominator: value };
  }
  function divideFractionByInteger(dividend, divisor) {
      if (!Number.isInteger(divisor) || divisor <= 0) {
          throw new Error("FRA-27 divisor must be a positive integer.");
      }
      return normalizeFraction({
          numerator: dividend.numerator,
          denominator: dividend.denominator * divisor,
      });
  }
  function rawReciprocalProduct(dividend, divisor) {
      return {
          numerator: dividend.numerator,
          denominator: dividend.denominator * divisor,
      };
  }
  function directShareResult(dividend, divisor) {
      if (dividend.numerator % divisor !== 0)
          return null;
      return {
          numerator: dividend.numerator / divisor,
          denominator: dividend.denominator,
      };
  }
  exports.FRA27_RUNTIME_COPY = {
      "HOOK.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "prompt",
          "communicationGoal": "establish_fractional_length_and_equal_share_need",
          "text": "This light strip is three quarters of a metre long. Two shelves need equal lengths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "HOOK.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "invite_unscored_cut_prediction_at_available_marks",
          "text": "The only marks you can use are the quarter-metre marks. Place the cut where you think it goes.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "HOOK.REVEAL": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "show_why_existing_quarter_marks_cannot_make_equal_halves",
          "text": "Neither quarter mark makes equal pieces. Three quarters cannot split into two equal groups of whole quarters. We need smaller parts.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T1.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "subdivide_each_quarter_into_two_equal_eighths",
          "text": "Split each quarter into two equal pieces.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T1.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "name_the_six_new_eighth_metre_pieces",
          "text": "Now the strip is six eighth-metre pieces.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T1.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "share_six_eighths_equally_between_two_shelves",
          "text": "Six eighths shares evenly: three eighths for one shelf and three eighths for the other.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T1.4": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "generalise",
          "communicationGoal": "state_the_equal_sharing_result",
          "text": "So three quarters divided by two is three eighths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T2.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "connect_division_by_two_to_one_of_two_equal_shares",
          "text": "Dividing by two means finding one of two equal shares - one half of the amount.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T2.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "connect_integer_divisor_to_its_reciprocal_while_locking_dividend",
          "text": "The reciprocal of 2 is one half, so keep three quarters and multiply by one half.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T2.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "worked_check",
          "communicationGoal": "multiply_numerators_and_denominators_for_three_quarters_times_one_half",
          "text": "Three times one is three. Four times two is eight. The answer is three eighths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T2.4": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "generalise",
          "communicationGoal": "protect_dividend_and_change_only_integer_divisor_to_reciprocal",
          "text": "Only the divisor changes into its reciprocal. Do not flip the amount being shared.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T3.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "introduce_direct_share_when_numerator_divides_exactly",
          "text": "Sometimes the fraction pieces already share exactly.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T3.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "share_eight_ninth_sized_pieces_among_four_groups",
          "text": "Eight ninth-sized pieces shared among four groups gives two ninths in each group.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T3.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "generalise",
          "communicationGoal": "state_conditional_direct_numerator_route",
          "text": "When the numerator divides exactly, you can divide the numerator and keep the denominator.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T3.4": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "generalise",
          "communicationGoal": "retain_reciprocal_route_as_always_valid",
          "text": "The reciprocal route still works every time.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T4.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "explain",
          "communicationGoal": "extend_same_method_to_improper_dividend",
          "text": "The starting fraction can be greater than one. The rule does not change.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T4.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "worked_check",
          "communicationGoal": "calculate_five_thirds_divided_by_four_by_reciprocal",
          "text": "Five thirds divided by four is five thirds times one quarter, which is five twelfths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "T4.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "generalise",
          "communicationGoal": "exclude_mixed_number_conversion_requirement",
          "text": "There is no need to change five thirds into a mixed number.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "HANDOFF.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "transition",
          "communicationGoal": "summarise_two_connected_methods_before_guided_practice",
          "text": "You have two connected routes now.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "HANDOFF.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "summary",
          "communicationGoal": "state_when_direct_share_is_available_and_reciprocal_is_valid",
          "text": "If the numerator shares exactly, divide it. Otherwise, or whenever you prefer, multiply by the integer's reciprocal.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "HANDOFF.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "transition",
          "communicationGoal": "move_from_teaching_to_two_guided_items",
          "text": "I'll stay with you for two. Then you take over.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G1.PROMPT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "guide_equal_distribution_of_six_sevenths",
          "text": "Keep each tile as one seventh. Share all six equally among the three trays. Now write the fraction in one tray.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G1.CORRECT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "acknowledge_correct",
          "communicationGoal": "confirm_two_sevenths_per_tray",
          "text": "Yes. Two seventh-sized tiles in each tray means two sevenths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G1.WRONG.COUNT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "separate_starting_amount_from_one_share",
          "text": "Six sevenths is the amount before sharing. Count one tray.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G1.WRONG.UNEQUAL": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "require_equal_tile_counts_in_all_trays",
          "text": "Every tray must receive the same number of tiles.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G2.PROMPT.RECIPROCAL": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "ask_for_reciprocal_of_integer_four",
          "text": "Only the divisor changes. What is the reciprocal of four?",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G2.PROMPT.MULTIPLY": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "retain_dividend_and_complete_fraction_product",
          "text": "Good. Keep five sixths in place. Now multiply the fractions.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G2.CORRECT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "acknowledge_correct",
          "communicationGoal": "confirm_five_twenty_fourths",
          "text": "That gives five twenty-fourths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G2.WRONG.NO_RECIPROCAL": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "distinguish_four_over_one_from_one_quarter",
          "text": "Four over one is the divisor itself, not its reciprocal. Swap its positions.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "G2.WRONG.FLIP": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "keep_five_sixths_unchanged",
          "text": "Keep five sixths unchanged. The reciprocal belongs to the divisor.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F1.PROMPT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "prompt_direct_share_of_ten_elevenths_among_five_groups",
          "text": "Share the ten eleventh-sized pieces among five groups. Fill the missing numerator.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F1.HINT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "guide_missing_numerator_without_giving_it",
          "text": "The denominator stays eleven because each piece is still one eleventh. How many pieces reach one group?",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F2.PROMPT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "ask_for_valid_symbolic_equal_share_line",
          "text": "Choose the line that makes one of three equal shares.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F2.HINT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "locate_reciprocal_on_integer_divisor",
          "text": "The reciprocal belongs to the divisor, three.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F2.CORRECT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "acknowledge_correct",
          "communicationGoal": "confirm_dividend_fixed_and_divisor_reciprocal",
          "text": "Right. Seven eighths stays in place, and three becomes one third.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F2.WRONG.MULTIPLY": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "contrast_three_copies_with_one_of_three_shares",
          "text": "That makes three copies, not one of three shares.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F2.WRONG.FLIP": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "protect_dividend_from_inversion",
          "text": "The amount being shared is seven eighths. Do not turn it upside down.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "F2.WRONG.SUBTRACT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "reject_subtraction_interpretation",
          "text": "Division here means equal sharing, not subtraction.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "INDEPENDENT.INTRO": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "transition",
          "communicationGoal": "remove_automatic_support_and_keep_optional_hint_collapsed",
          "text": "I'll stop building the steps now. You can ask for a hint, but try the question first.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "I1.PROMPT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "prompt_contextual_equal_share_of_dye",
          "text": "Three jars share the dye equally. Write the amount in one jar.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "I1.HINT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "connect_one_jar_to_one_third_of_starting_fraction",
          "text": "One jar receives one third of the seven tenths litre.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "I1.CORRECT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "acknowledge_correct",
          "communicationGoal": "confirm_seven_thirtieths_litre",
          "text": "Exactly. One third of seven tenths is seven thirtieths of a litre.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "I2.PROMPT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "prompt_reasoning_with_improper_dividend_without_conversion",
          "text": "The starting fraction is greater than one. Choose the explanation that shares it correctly.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "I2.HINT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "instruction",
          "communicationGoal": "reframe_improper_fraction_as_fifteen_eighth_sized_pieces",
          "text": "Think of fifteen eighth-sized pieces shared among five groups.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "I2.CORRECT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "acknowledge_correct",
          "communicationGoal": "confirm_three_eighths_per_group",
          "text": "Yes. Three eighths in each group.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "CONFIRM.INTRO": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "transition",
          "communicationGoal": "explain_fresh_no_hint_confirmation_after_support",
          "text": "You used support on that idea. Here is a fresh one with no hint.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "FINAL.INTRO": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "transition",
          "communicationGoal": "introduce_five_unsupported_final_items_and_post_lock_working",
          "text": "These last five are yours. No hints this time. Do the question first, then I'll show you the working so you can check your thinking.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "FINAL.CORRECT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "acknowledge_correct",
          "communicationGoal": "open_post_lock_worked_check_after_correct_final",
          "text": "Good - that's right. Here's the working so you can check.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "FINAL.INCORRECT": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "redirect_incorrect",
          "communicationGoal": "open_post_lock_worked_check_after_incorrect_final",
          "text": "Not quite. Here's the working - compare it with what you did.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.DEN.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "use_size_check_to_reject_denominator_division",
          "text": "Your answer made each share larger than the starting amount. That cannot happen here.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.DEN.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "restate_division_by_two_as_two_equal_shares",
          "text": "Dividing by two means make two equal shares of the three eighths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.DEN.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "subdivide_eighths_into_sixteenths_and_identify_one_share",
          "text": "Split each eighth into two sixteenths. Each share gets three sixteenths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.NUM.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "show_non_divisible_numerator_is_not_impossible",
          "text": "Five does not divide by four as a whole number, but the calculation is still exact.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.NUM.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "reject_rounding_or_dropping_and_take_one_quarter",
          "text": "Do not round or drop a piece. Take one quarter of the amount.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.NUM.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "state_five_sixths_times_one_quarter",
          "text": "Five sixths times one quarter is five twenty-fourths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.MULT.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "contrast_multiplying_by_three_with_equal_sharing",
          "text": "Multiplying by three makes three copies of four fifths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.MULT.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "replace_three_copies_with_one_third",
          "text": "The question asks for one of three equal shares, so use one third.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.MULT.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "state_four_fifths_times_one_third",
          "text": "Four fifths divided by three is four fifths times one third: four fifteenths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.FLIP.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "lock_five_eighths_as_dividend",
          "text": "The amount being shared is five eighths, so five eighths stays in place.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.FLIP.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "write_two_over_one_and_take_its_reciprocal",
          "text": "Write the divisor 2 as two over one, then take its reciprocal: one half.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.FLIP.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "state_five_eighths_times_one_half",
          "text": "Five eighths times one half is five sixteenths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.SUB.1": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "reject_take_away_interpretation",
          "text": "The question is not asking how much remains after taking away two.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.SUB.2": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "restate_three_quarters_as_amount_for_two_equal_shares",
          "text": "It asks for two equal shares of the three quarters.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "R.SUB.3": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "repair",
          "communicationGoal": "state_one_half_of_three_quarters",
          "text": "One share is one half of three quarters, which is three eighths.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      },
      "COMPLETE": {
          "audience": "learner",
          "spokenBy": "Ryan",
          "role": "completion",
          "communicationGoal": "summarise_equal_sharing_and_reciprocal_methods",
          "text": "Nice work. You can now divide a fraction by a whole number by making equal shares, or by multiplying by the integer's reciprocal. That's FRA-27 done.",
          "captionSource": "same_as_audio",
          "provenance": "storyboard_exact"
      }
  };
  /**
   * Learner-visible semantic UI copy added only where the storyboard specifies
   * an outcome/route behaviour without exact Ryan wording. These strings are
   * deliberately not audio and deliberately not captions.
   */
  exports.FRA27_UI_COPY = {
      "F1.CORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "acknowledge_correct",
          "text": "Right. Each group receives two eleventh-sized pieces, so one share is two elevenths.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "F1.INCORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "redirect_incorrect",
          "text": "Count the pieces in one group, not all ten.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "I1.INCORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "redirect_incorrect",
          "text": "That is not one of three equal shares. Keep seven tenths fixed and take one third of it.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "CONFIRM.CORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "acknowledge_correct",
          "text": "That fresh check is correct without a hint.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "CONFIRM.INCORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "redirect_incorrect",
          "text": "The fresh check still shows the same method issue. Let's repair it directly.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "REPAIR.SUPPORTED.PROMPT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "instruction",
          "text": "Use the model to complete the equal share, then write the fraction.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "REPAIR.SUPPORTED.CORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "acknowledge_correct",
          "text": "That repair step is correct. Now clear it and try a fresh one.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "REPAIR.SUPPORTED.INCORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "redirect_incorrect",
          "text": "Not yet. Use the picture to make every share equal.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "REPAIR.FRESH.PROMPT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "instruction",
          "text": "Now try a fresh one without a hint.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "REPAIR.FRESH.CORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "acknowledge_correct",
          "text": "That fresh check is correct. Return to the lesson.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "REPAIR.FRESH.INCORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "redirect_incorrect",
          "text": "The same issue is still showing. We'll pause this attempt and give you a clear restart option.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "RECOVERY.MINI.INTRO": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "transition",
          "text": "You are close. We'll repair the missed idea, then you'll do two fresh checks with no hints.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "RECOVERY.ALT.INTRO": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "transition",
          "text": "Let's rebuild the parts that caused trouble. Then you'll do three fresh questions with no hints.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "RECOVERY.CORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "acknowledge_correct",
          "text": "That recovery answer is correct. Move to the next one.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "RECOVERY.INCORRECT": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "redirect_incorrect",
          "text": "That one is not secure yet. Compare your answer with the working.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      },
      "RESTART": {
          "audience": "learner",
          "delivery": "visible_ui_only",
          "role": "completion",
          "text": "You haven't secured this one yet. Start the lesson again when you're ready.",
          "sourceProvenance": "handoff_concretisation_visible_ui_only"
      }
  };
  exports.FRA27_PROBLEMS = {
      "P-HOOK-T1": {
          "id": "P-HOOK-T1",
          "dividend": {
              "numerator": 3,
              "denominator": 4
          },
          "integerDivisor": 2,
          "context": "three-quarter-metre light strip shared into two shelf lengths",
          "unit": "metre",
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-T3": {
          "id": "P-T3",
          "dividend": {
              "numerator": 8,
              "denominator": 9
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-T4": {
          "id": "P-T4",
          "dividend": {
              "numerator": 5,
              "denominator": 3
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-G1": {
          "id": "P-G1",
          "dividend": {
              "numerator": 6,
              "denominator": 7
          },
          "integerDivisor": 3,
          "context": "six seventh-sized tiles shared among three trays",
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-G2": {
          "id": "P-G2",
          "dividend": {
              "numerator": 5,
              "denominator": 6
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-F1": {
          "id": "P-F1",
          "dividend": {
              "numerator": 10,
              "denominator": 11
          },
          "integerDivisor": 5,
          "context": "ten eleventh-sized pieces shared among five groups",
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-F2": {
          "id": "P-F2",
          "dividend": {
              "numerator": 7,
              "denominator": 8
          },
          "integerDivisor": 3,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": "approved-f2-m4-representation-transfer"
      },
      "P-I1": {
          "id": "P-I1",
          "dividend": {
              "numerator": 7,
              "denominator": 10
          },
          "integerDivisor": 3,
          "context": "dye shared equally among three sample jars",
          "unit": "litre",
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-I2": {
          "id": "P-I2",
          "dividend": {
              "numerator": 15,
              "denominator": 8
          },
          "integerDivisor": 5,
          "context": null,
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-C-RECIP": {
          "id": "P-C-RECIP",
          "dividend": {
              "numerator": 5,
              "denominator": 8
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-C-DIRECT": {
          "id": "P-C-DIRECT",
          "dividend": {
              "numerator": 18,
              "denominator": 7
          },
          "integerDivisor": 6,
          "context": null,
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-C-METHOD": {
          "id": "P-C-METHOD",
          "dividend": {
              "numerator": 2,
              "denominator": 9
          },
          "integerDivisor": 5,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-M1": {
          "id": "P-M1",
          "dividend": {
              "numerator": 7,
              "denominator": 12
          },
          "integerDivisor": 5,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-M2": {
          "id": "P-M2",
          "dividend": {
              "numerator": 12,
              "denominator": 5
          },
          "integerDivisor": 4,
          "context": "twelve fifth-sized tiles shared among four boxes",
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-M3": {
          "id": "P-M3",
          "dividend": {
              "numerator": 5,
              "denominator": 9
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-M4": {
          "id": "P-M4",
          "dividend": {
              "numerator": 7,
              "denominator": 8
          },
          "integerDivisor": 3,
          "context": "clay shared equally among three models",
          "unit": "kilogram",
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": "approved-f2-m4-representation-transfer"
      },
      "P-M5": {
          "id": "P-M5",
          "dividend": {
              "numerator": 4,
              "denominator": 7
          },
          "integerDivisor": 3,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-DEN": {
          "id": "P-R-DEN",
          "dividend": {
              "numerator": 3,
              "denominator": 8
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-DEN-FRESH": {
          "id": "P-R-DEN-FRESH",
          "dividend": {
              "numerator": 5,
              "denominator": 7
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-NUM": {
          "id": "P-R-NUM",
          "dividend": {
              "numerator": 5,
              "denominator": 6
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-NUM-FRESH": {
          "id": "P-R-NUM-FRESH",
          "dividend": {
              "numerator": 7,
              "denominator": 9
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-MULT": {
          "id": "P-R-MULT",
          "dividend": {
              "numerator": 4,
              "denominator": 5
          },
          "integerDivisor": 3,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-MULT-FRESH": {
          "id": "P-R-MULT-FRESH",
          "dividend": {
              "numerator": 3,
              "denominator": 7
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-FLIP": {
          "id": "P-R-FLIP",
          "dividend": {
              "numerator": 5,
              "denominator": 8
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-FLIP-FRESH": {
          "id": "P-R-FLIP-FRESH",
          "dividend": {
              "numerator": 7,
              "denominator": 11
          },
          "integerDivisor": 3,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-SUB": {
          "id": "P-R-SUB",
          "dividend": {
              "numerator": 3,
              "denominator": 4
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-R-SUB-FRESH": {
          "id": "P-R-SUB-FRESH",
          "dividend": {
              "numerator": 5,
              "denominator": 6
          },
          "integerDivisor": 3,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "storyboard_exact",
          "allowedNumericReuseGroup": null
      },
      "P-A1": {
          "id": "P-A1",
          "dividend": {
              "numerator": 9,
              "denominator": 10
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-A2": {
          "id": "P-A2",
          "dividend": {
              "numerator": 20,
              "denominator": 7
          },
          "integerDivisor": 5,
          "context": null,
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-A3": {
          "id": "P-A3",
          "dividend": {
              "numerator": 11,
              "denominator": 12
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-DEN-1": {
          "id": "P-MC-DEN-1",
          "dividend": {
              "numerator": 9,
              "denominator": 11
          },
          "integerDivisor": 3,
          "context": null,
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-DEN-2": {
          "id": "P-MC-DEN-2",
          "dividend": {
              "numerator": 5,
              "denominator": 8
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-NUM-1": {
          "id": "P-MC-NUM-1",
          "dividend": {
              "numerator": 11,
              "denominator": 12
          },
          "integerDivisor": 5,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-NUM-2": {
          "id": "P-MC-NUM-2",
          "dividend": {
              "numerator": 7,
              "denominator": 10
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-MULT-1": {
          "id": "P-MC-MULT-1",
          "dividend": {
              "numerator": 5,
              "denominator": 9
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-MULT-2": {
          "id": "P-MC-MULT-2",
          "dividend": {
              "numerator": 7,
              "denominator": 12
          },
          "integerDivisor": 3,
          "context": "liquid shared among three containers",
          "unit": "litre",
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-FLIP-1": {
          "id": "P-MC-FLIP-1",
          "dividend": {
              "numerator": 8,
              "denominator": 11
          },
          "integerDivisor": 3,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-FLIP-2": {
          "id": "P-MC-FLIP-2",
          "dividend": {
              "numerator": 3,
              "denominator": 10
          },
          "integerDivisor": 4,
          "context": null,
          "unit": null,
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-SUB-1": {
          "id": "P-MC-SUB-1",
          "dividend": {
              "numerator": 4,
              "denominator": 7
          },
          "integerDivisor": 2,
          "context": null,
          "unit": null,
          "directShareEmphasised": true,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      },
      "P-MC-SUB-2": {
          "id": "P-MC-SUB-2",
          "dividend": {
              "numerator": 11,
              "denominator": 12
          },
          "integerDivisor": 3,
          "context": "ribbon shared into three equal lengths",
          "unit": "metre",
          "directShareEmphasised": false,
          "sourceProvenance": "implementation_completion_recovery_bank",
          "allowedNumericReuseGroup": null
      }
  };
  exports.FRA27_QUESTIONS = {
      "G1": {
          "id": "G1",
          "stage": "guided",
          "assessmentFamily": "VISUAL",
          "problemId": "P-G1",
          "visibleUi": {
              "stageLabel": "Try it with me",
              "title": "Share 6/7 equally among 3 trays",
              "body": "Drag all six seventh-sized tiles so every tray has the same amount. After the equal distribution, write the fraction in one tray.",
              "submitLabel": "Check share"
          },
          "accessibleDescription": "Six identical seventh-sized tiles and three empty trays are shown. Move every tile into a tray so all trays contain equal amounts. A fraction input has denominator 7 fixed.",
          "spokenPromptUtteranceIds": [
              "G1.PROMPT"
          ],
          "responseSpec": {
              "kind": "drag_share_then_fraction",
              "trayCount": 3,
              "totalTiles": 6,
              "fixedDenominator": 7,
              "expectedTrayCounts": [
                  2,
                  2,
                  2
              ]
          },
          "hintPolicy": "built_in_guidance",
          "outcomes": {
              "correctUtteranceId": "G1.CORRECT",
              "incorrectDefaultUtteranceId": "G1.WRONG.COUNT",
              "incorrectBySignal": {
                  "unequal_tray_counts": "G1.WRONG.UNEQUAL",
                  "used_total_amount": "G1.WRONG.COUNT"
              }
          },
          "options": [],
          "visual": {
              "kind": "tile_share_trays",
              "tileCount": 6,
              "trayCount": 3,
              "tileUnitFraction": {
                  "numerator": 1,
                  "denominator": 7
              },
              "selectedStateUsesNonColourCue": true
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": true,
              "answerLockPolicy": "lock_on_correct_or_route"
          },
          "authorOnly": {
              "assessmentIntent": "Equal distribution while preserving seventh-sized pieces.",
              "strongRouteComponent": true,
              "answerLeakageGuard": "Do not pre-place any tile or state how many belong in a tray."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "G2": {
          "id": "G2",
          "stage": "guided",
          "assessmentFamily": "STEP",
          "problemId": "P-G2",
          "visibleUi": {
              "stageLabel": "Try it with me",
              "title": "Complete 5/6 divided by 4",
              "body": "Step 1: choose the reciprocal of the divisor. Step 2: multiply the fractions.",
              "submitLabel": "Check route"
          },
          "accessibleDescription": "The fraction five sixths divided by 4 is shown. Four reciprocal choices are available: one fourth, four over one, six fifths, and one sixth. A second fraction input is used for the product after a reciprocal is selected.",
          "spokenPromptUtteranceIds": [
              "G2.PROMPT.RECIPROCAL",
              "G2.PROMPT.MULTIPLY"
          ],
          "responseSpec": {
              "kind": "reciprocal_and_product",
              "expectedReciprocal": {
                  "numerator": 1,
                  "denominator": 4
              }
          },
          "hintPolicy": "built_in_guidance",
          "outcomes": {
              "correctUtteranceId": "G2.CORRECT",
              "incorrectDefaultUtteranceId": "G2.WRONG.FLIP",
              "incorrectBySignal": {
                  "reciprocal_is_divisor": "G2.WRONG.NO_RECIPROCAL",
                  "reciprocal_of_dividend": "G2.WRONG.FLIP"
              }
          },
          "options": [
              {
                  "id": "A",
                  "visibleLabel": "1/4",
                  "value": {
                      "numerator": 1,
                      "denominator": 4
                  }
              },
              {
                  "id": "B",
                  "visibleLabel": "4/1",
                  "value": {
                      "numerator": 4,
                      "denominator": 1
                  },
                  "errorFamily": "MULTIPLY"
              },
              {
                  "id": "C",
                  "visibleLabel": "6/5",
                  "value": {
                      "numerator": 6,
                      "denominator": 5
                  },
                  "errorFamily": "FLIP_DIVIDEND"
              },
              {
                  "id": "D",
                  "visibleLabel": "1/6",
                  "value": {
                      "numerator": 1,
                      "denominator": 6
                  },
                  "errorFamily": "FLIP_DIVIDEND"
              }
          ],
          "visual": {
              "kind": "locked_dividend_reciprocal_builder",
              "lockDividend": true,
              "showProductOnlyAfterReciprocalAccepted": true
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": true,
              "answerLockPolicy": "lock_on_correct_or_route"
          },
          "authorOnly": {
              "assessmentIntent": "Generate integer reciprocal while preserving the dividend, then multiply.",
              "strongRouteComponent": true,
              "answerLeakageGuard": "Do not rotate the 4 or show 1/4 before the learner selects."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "F1": {
          "id": "F1",
          "stage": "faded",
          "assessmentFamily": "DIRECT",
          "problemId": "P-F1",
          "visibleUi": {
              "stageLabel": "Your turn - support nearby",
              "title": "Complete the direct share",
              "body": "Ten eleventh-sized pieces are shared among five equal groups. Fill the numerator for one share.",
              "submitLabel": "Check answer"
          },
          "accessibleDescription": "Ten identical eleventh-sized pieces and five empty group containers are shown. The response fraction has denominator 11 fixed and an empty numerator.",
          "spokenPromptUtteranceIds": [
              "F1.PROMPT"
          ],
          "responseSpec": {
              "kind": "missing_numerator",
              "fixedDenominator": 11,
              "expectedNumerator": 2
          },
          "hintPolicy": {
              "kind": "optional_collapsed",
              "utteranceId": "F1.HINT"
          },
          "outcomes": {
              "correctUiCopyId": "F1.CORRECT",
              "incorrectDefaultUiCopyId": "F1.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "direct_share_groups",
              "pieceCount": 10,
              "groupCount": 5,
              "preDistribution": "none"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": true,
              "answerLockPolicy": "lock_on_correct_or_route"
          },
          "authorOnly": {
              "assessmentIntent": "Conditional direct numerator sharing with denominator fixed.",
              "fastRouteSkippable": true,
              "answerLeakageGuard": "No pieces are pre-distributed."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "F2": {
          "id": "F2",
          "stage": "faded",
          "assessmentFamily": "REASON",
          "problemId": "P-F2",
          "visibleUi": {
              "stageLabel": "Your turn",
              "title": "Which line makes one of three equal shares?",
              "body": "Choose the valid calculation for 7/8 divided by 3.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "The expression seven eighths divided by 3 is shown with four complete calculation choices. No choice is highlighted.",
          "spokenPromptUtteranceIds": [
              "F2.PROMPT"
          ],
          "responseSpec": {
              "kind": "choice",
              "correctOptionId": "A"
          },
          "hintPolicy": {
              "kind": "optional_collapsed",
              "utteranceId": "F2.HINT"
          },
          "outcomes": {
              "correctUtteranceId": "F2.CORRECT",
              "incorrectDefaultUtteranceId": "F2.WRONG.MULTIPLY",
              "incorrectByOption": {
                  "B": "F2.WRONG.MULTIPLY",
                  "C": "F2.WRONG.FLIP",
                  "D": "F2.WRONG.SUBTRACT"
              }
          },
          "options": [
              {
                  "id": "A",
                  "visibleLabel": "7/8 x 1/3 = 7/24"
              },
              {
                  "id": "B",
                  "visibleLabel": "7/8 x 3/1 = 21/8",
                  "errorFamily": "MULTIPLY"
              },
              {
                  "id": "C",
                  "visibleLabel": "8/7 x 1/3 = 8/21",
                  "errorFamily": "FLIP_DIVIDEND"
              },
              {
                  "id": "D",
                  "visibleLabel": "(7 - 3)/8 = 4/8",
                  "errorFamily": "SUBTRACT"
              }
          ],
          "visual": {
              "kind": "method_choice_cards",
              "stackOnMobile": true
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": true,
              "answerLockPolicy": "lock_on_correct_or_route"
          },
          "authorOnly": {
              "assessmentIntent": "Reject multiplication, flipped-dividend and subtraction routes.",
              "fastRouteMandatory": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "I1": {
          "id": "I1",
          "stage": "independent",
          "assessmentFamily": "CONTEXT",
          "problemId": "P-I1",
          "visibleUi": {
              "stageLabel": "Now you take over",
              "title": "How much dye goes in one jar?",
              "body": "A 7/10-litre bottle of dye is poured equally into 3 sample jars. Write the exact amount in one jar.",
              "submitLabel": "Check answer"
          },
          "accessibleDescription": "A bottle labelled seven tenths of a litre and three empty sample jars are shown. Enter the exact fraction of a litre in one jar. The jars are not filled before submission.",
          "spokenPromptUtteranceIds": [
              "INDEPENDENT.INTRO",
              "I1.PROMPT"
          ],
          "responseSpec": {
              "kind": "fraction",
              "unitDisplayedByUi": "L",
              "acceptEquivalent": true
          },
          "hintPolicy": {
              "kind": "optional_collapsed",
              "utteranceId": "I1.HINT"
          },
          "outcomes": {
              "correctUtteranceId": "I1.CORRECT",
              "incorrectDefaultUiCopyId": "I1.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "container_share_context",
              "sourceAmountLabel": "7/10 L",
              "destinationCount": 3,
              "preDistribution": "none"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": true,
              "answerLockPolicy": "lock_on_correct_or_route"
          },
          "authorOnly": {
              "assessmentIntent": "Context-to-symbol transfer for a non-divisible numerator.",
              "answerLeakageGuard": "Accessible text may state the starting amount and three jars, not the resulting share."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "I2": {
          "id": "I2",
          "stage": "independent",
          "assessmentFamily": "REASON",
          "problemId": "P-I2",
          "visibleUi": {
              "stageLabel": "Now you take over",
              "title": "Which explanation is correct?",
              "body": "The starting fraction is greater than one. No mixed-number conversion is needed.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "The expression fifteen eighths divided by 5 is shown with four reasoning choices. No mixed-number representation or answer cue is shown.",
          "spokenPromptUtteranceIds": [
              "I2.PROMPT"
          ],
          "responseSpec": {
              "kind": "choice",
              "correctOptionId": "A"
          },
          "hintPolicy": {
              "kind": "optional_collapsed",
              "utteranceId": "I2.HINT"
          },
          "outcomes": {
              "correctUtteranceId": "I2.CORRECT",
              "incorrectDefaultUtteranceId": "F2.WRONG.MULTIPLY",
              "incorrectByOption": {
                  "B": "R.DEN.1",
                  "C": "F2.WRONG.MULTIPLY",
                  "D": "F2.WRONG.FLIP"
              }
          },
          "options": [
              {
                  "id": "A",
                  "visibleLabel": "Share fifteen eighth-sized pieces: 15 divided by 5 is 3, so one share is 3/8."
              },
              {
                  "id": "B",
                  "visibleLabel": "Divide the denominator by 5, so the answer is 15/(8 divided by 5).",
                  "errorFamily": "DENOM_DIV"
              },
              {
                  "id": "C",
                  "visibleLabel": "Multiply by 5, so the answer is 75/8.",
                  "errorFamily": "MULTIPLY"
              },
              {
                  "id": "D",
                  "visibleLabel": "Flip 15/8 first, so the answer starts with 8/15.",
                  "errorFamily": "FLIP_DIVIDEND"
              }
          ],
          "visual": {
              "kind": "reasoning_choice_cards",
              "showImproperFractionOnly": true
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": true,
              "answerLockPolicy": "lock_on_correct_or_route"
          },
          "authorOnly": {
              "assessmentIntent": "Reason about an improper dividend without mixed-number conversion."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "C-RECIP": {
          "id": "C-RECIP",
          "stage": "confirmation",
          "assessmentFamily": "DIRECT",
          "problemId": "P-C-RECIP",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Fresh no-hint check",
              "body": "Calculate 5/8 divided by 4.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 5/8 divided by 4. Enter an exact fraction. No hint or worked step is shown.",
          "spokenPromptUtteranceIds": [
              "CONFIRM.INTRO"
          ],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "CONFIRM.CORRECT",
              "incorrectDefaultUiCopyId": "CONFIRM.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_or_method_confirmation"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh no-hint same-family confirmation after supported success.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "C-DIRECT": {
          "id": "C-DIRECT",
          "stage": "confirmation",
          "assessmentFamily": "DIRECT",
          "problemId": "P-C-DIRECT",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Fresh no-hint check",
              "body": "Calculate 18/7 divided by 6.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 18/7 divided by 6. Enter an exact fraction. No hint or worked step is shown.",
          "spokenPromptUtteranceIds": [
              "CONFIRM.INTRO"
          ],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "CONFIRM.CORRECT",
              "incorrectDefaultUiCopyId": "CONFIRM.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_or_method_confirmation"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh no-hint same-family confirmation after supported success.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "C-METHOD": {
          "id": "C-METHOD",
          "stage": "confirmation",
          "assessmentFamily": "REASON",
          "problemId": "P-C-METHOD",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Fresh no-hint method check",
              "body": "Choose the valid line for 2/9 divided by 5.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "The expression two ninths divided by 5 is shown with four complete method choices. No choice is highlighted.",
          "spokenPromptUtteranceIds": [
              "CONFIRM.INTRO"
          ],
          "responseSpec": {
              "kind": "choice",
              "correctOptionId": "A"
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "CONFIRM.CORRECT",
              "incorrectDefaultUiCopyId": "CONFIRM.INCORRECT"
          },
          "options": [
              {
                  "id": "A",
                  "visibleLabel": "2/9 x 1/5 = 2/45"
              },
              {
                  "id": "B",
                  "visibleLabel": "2/9 x 5 = 10/9",
                  "errorFamily": "MULTIPLY"
              },
              {
                  "id": "C",
                  "visibleLabel": "9/2 x 1/5 = 9/10",
                  "errorFamily": "FLIP_DIVIDEND"
              },
              {
                  "id": "D",
                  "visibleLabel": "(2 - 5)/9",
                  "errorFamily": "SUBTRACT"
              }
          ],
          "visual": {
              "kind": "symbolic_or_method_confirmation"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh no-hint same-family confirmation after supported success.",
              "mustBeUnseen": true,
              "handoffConcretisation": "The storyboard authors the problem and correct method but not every distractor. Options B-D are fixed implementation handoff completions, not generated runtime content."
          },
          "sourceProvenance": "storyboard_exact_with_handoff_concretised_options"
      },
      "M1": {
          "id": "M1",
          "stage": "final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-M1",
          "visibleUi": {
              "stageLabel": "Final check",
              "title": "Calculate",
              "body": "7/12 divided by 5",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "The expression seven twelfths divided by 5 is shown with an empty fraction input. No hint, reciprocal cue, or working is visible.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUtteranceId": "FINAL.CORRECT",
              "incorrectDefaultUtteranceId": "FINAL.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_fraction_division"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "7/12 x 1/5 = 7/60",
                  "Dividing by 5 means multiplying by 1/5."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "DIRECT",
              "unseenUnsupported": true,
              "answerLeakageGuard": "No hint, reciprocal cue, distribution, highlighted option, or worked line before submit."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "M2": {
          "id": "M2",
          "stage": "final",
          "assessmentFamily": "VISUAL",
          "problemId": "P-M2",
          "visibleUi": {
              "stageLabel": "Final check",
              "title": "Write one share",
              "body": "12 fifth-sized tiles are shared equally among 4 boxes. Write one share.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Twelve identical fifth-sized tiles and four empty boxes are shown. Enter the fraction in one box after equal sharing. No tiles are distributed before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUtteranceId": "FINAL.CORRECT",
              "incorrectDefaultUtteranceId": "FINAL.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "tile_share_boxes",
              "tileCount": 12,
              "boxCount": 4,
              "preDistribution": "none"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "12/5 divided by 4 = 3/5",
                  "Twelve fifth-sized pieces share 3 to each box. 12/20 is also exact."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "VISUAL",
              "unseenUnsupported": true,
              "answerLeakageGuard": "No hint, reciprocal cue, distribution, highlighted option, or worked line before submit."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "M3": {
          "id": "M3",
          "stage": "final",
          "assessmentFamily": "STEP",
          "problemId": "P-M3",
          "visibleUi": {
              "stageLabel": "Final check",
              "title": "Complete both missing parts",
              "body": "5/9 divided by 2 = 5/9 x ?/?; then write the product.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "The expression five ninths divided by 2 is rewritten with five ninths fixed, an empty reciprocal fraction, and an empty product fraction. No cue identifies the reciprocal.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "reciprocal_and_product",
              "expectedReciprocal": {
                  "numerator": 1,
                  "denominator": 2
              }
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUtteranceId": "FINAL.CORRECT",
              "incorrectDefaultUtteranceId": "FINAL.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "reciprocal_and_product_fields",
              "lockDividend": true
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "The reciprocal of 2 is 1/2.",
                  "5/9 x 1/2 = 5/18",
                  "Keep 5/9 fixed; only the divisor becomes reciprocal."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "STEP",
              "unseenUnsupported": true,
              "answerLeakageGuard": "No hint, reciprocal cue, distribution, highlighted option, or worked line before submit."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "M4": {
          "id": "M4",
          "stage": "final",
          "assessmentFamily": "CONTEXT",
          "problemId": "P-M4",
          "visibleUi": {
              "stageLabel": "Final check",
              "title": "How much clay goes into one model?",
              "body": "A 7/8 kg block of clay is shared equally among 3 models. Write the exact mass in one model.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "A clay block labelled seven eighths of a kilogram and three empty model positions are shown. Enter the fraction of a kilogram in one model. The clay is not divided before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true,
              "unitDisplayedByUi": "kg"
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUtteranceId": "FINAL.CORRECT",
              "incorrectDefaultUtteranceId": "FINAL.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mass_share_context",
              "destinationCount": 3,
              "preDistribution": "none"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "7/8 x 1/3 = 7/24",
                  "One model gets one third of the starting clay: 7/24 kg."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "CONTEXT",
              "unseenUnsupported": true,
              "answerLeakageGuard": "No hint, reciprocal cue, distribution, highlighted option, or worked line before submit."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "M5": {
          "id": "M5",
          "stage": "final",
          "assessmentFamily": "ERROR",
          "problemId": "P-M5",
          "visibleUi": {
              "stageLabel": "Final check",
              "title": "Which correction is right?",
              "body": "A student flips 4/7 while calculating 4/7 divided by 3. Choose the correct response.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "A student method shows four sevenths divided by 3 rewritten as seven fourths times one third. Four correction choices are shown. No choice is highlighted.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "choice",
              "correctOptionId": "B"
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUtteranceId": "FINAL.CORRECT",
              "incorrectDefaultUtteranceId": "FINAL.INCORRECT"
          },
          "options": [
              {
                  "id": "A",
                  "visibleLabel": "The student is correct.",
                  "errorFamily": "FLIP_DIVIDEND"
              },
              {
                  "id": "B",
                  "visibleLabel": "Keep 4/7; use 1/3. The answer is 4/21."
              },
              {
                  "id": "C",
                  "visibleLabel": "Multiply by 3. The answer is 12/7.",
                  "errorFamily": "MULTIPLY"
              },
              {
                  "id": "D",
                  "visibleLabel": "Subtract 3 from the numerator. The answer is 1/7.",
                  "errorFamily": "SUBTRACT"
              }
          ],
          "visual": {
              "kind": "error_analysis_method_card",
              "studentMethodShowsFlippedDividend": true
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Keep the amount being shared unchanged.",
                  "4/7 x 1/3 = 4/21",
                  "The divisor 3 becomes 1/3. The dividend 4/7 does not flip.",
                  "Correct option: B"
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "ERROR",
              "unseenUnsupported": true,
              "answerLeakageGuard": "No hint, reciprocal cue, distribution, highlighted option, or worked line before submit."
          },
          "sourceProvenance": "storyboard_exact"
      },
      "R-DEN-FRESH": {
          "id": "R-DEN-FRESH",
          "stage": "repair",
          "assessmentFamily": "DIRECT",
          "problemId": "P-R-DEN-FRESH",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Try a new one without a hint",
              "body": "Calculate 5/7 divided by 2.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 5/7 divided by 2. Enter an exact fraction. No hint or worked example remains on screen.",
          "spokenPromptUtteranceIds": [
              "REPAIR.FRESH.PROMPT"
          ],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "REPAIR.FRESH.CORRECT",
              "incorrectDefaultUiCopyId": "REPAIR.FRESH.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_fraction_division"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh parallel evidence after misconception-specific repair.",
              "mustClearRepairVisualBeforeDisplay": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "R-NUM-FRESH": {
          "id": "R-NUM-FRESH",
          "stage": "repair",
          "assessmentFamily": "DIRECT",
          "problemId": "P-R-NUM-FRESH",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Try a new one without a hint",
              "body": "Calculate 7/9 divided by 2.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 7/9 divided by 2. Enter an exact fraction. No hint or worked example remains on screen.",
          "spokenPromptUtteranceIds": [
              "REPAIR.FRESH.PROMPT"
          ],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "REPAIR.FRESH.CORRECT",
              "incorrectDefaultUiCopyId": "REPAIR.FRESH.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_fraction_division"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh parallel evidence after misconception-specific repair.",
              "mustClearRepairVisualBeforeDisplay": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "R-MULT-FRESH": {
          "id": "R-MULT-FRESH",
          "stage": "repair",
          "assessmentFamily": "DIRECT",
          "problemId": "P-R-MULT-FRESH",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Try a new one without a hint",
              "body": "Calculate 3/7 divided by 4.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 3/7 divided by 4. Enter an exact fraction. No hint or worked example remains on screen.",
          "spokenPromptUtteranceIds": [
              "REPAIR.FRESH.PROMPT"
          ],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "REPAIR.FRESH.CORRECT",
              "incorrectDefaultUiCopyId": "REPAIR.FRESH.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_fraction_division"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh parallel evidence after misconception-specific repair.",
              "mustClearRepairVisualBeforeDisplay": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "R-FLIP-FRESH": {
          "id": "R-FLIP-FRESH",
          "stage": "repair",
          "assessmentFamily": "DIRECT",
          "problemId": "P-R-FLIP-FRESH",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Try a new one without a hint",
              "body": "Calculate 7/11 divided by 3.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 7/11 divided by 3. Enter an exact fraction. No hint or worked example remains on screen.",
          "spokenPromptUtteranceIds": [
              "REPAIR.FRESH.PROMPT"
          ],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "REPAIR.FRESH.CORRECT",
              "incorrectDefaultUiCopyId": "REPAIR.FRESH.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_fraction_division"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh parallel evidence after misconception-specific repair.",
              "mustClearRepairVisualBeforeDisplay": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "R-SUB-FRESH": {
          "id": "R-SUB-FRESH",
          "stage": "repair",
          "assessmentFamily": "DIRECT",
          "problemId": "P-R-SUB-FRESH",
          "visibleUi": {
              "stageLabel": "Fresh check",
              "title": "Try a new one without a hint",
              "body": "Calculate 5/6 divided by 3.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 5/6 divided by 3. Enter an exact fraction. No hint or worked example remains on screen.",
          "spokenPromptUtteranceIds": [
              "REPAIR.FRESH.PROMPT"
          ],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "REPAIR.FRESH.CORRECT",
              "incorrectDefaultUiCopyId": "REPAIR.FRESH.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "symbolic_fraction_division"
          },
          "postSubmitWorking": null,
          "scoring": {
              "contributesToMastery": false,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh parallel evidence after misconception-specific repair.",
              "mustClearRepairVisualBeforeDisplay": true
          },
          "sourceProvenance": "storyboard_exact"
      },
      "A1": {
          "id": "A1",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-A1",
          "visibleUi": {
              "stageLabel": "Recovery check",
              "title": "Calculate",
              "body": "9/10 divided by 4",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "The expression nine tenths divided by 4 is shown with an empty fraction input and no hint.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "recovery_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "9/10 x 1/4 = 9/40"
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh alternate final item.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "A2": {
          "id": "A2",
          "stage": "recovery_final",
          "assessmentFamily": "VISUAL",
          "problemId": "P-A2",
          "visibleUi": {
              "stageLabel": "Recovery check",
              "title": "Write one share",
              "body": "20 seventh-sized pieces are shared equally among 5 groups. Write one share.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Twenty identical seventh-sized pieces and five empty groups are shown. Enter the exact fraction in one group. No pieces are distributed before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "recovery_visual"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "20/7 divided by 5 = 4/7",
                  "Twenty seventh-sized pieces share 4 to each group."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh alternate final item.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "A3": {
          "id": "A3",
          "stage": "recovery_final",
          "assessmentFamily": "ERROR",
          "problemId": "P-A3",
          "visibleUi": {
              "stageLabel": "Recovery check",
              "title": "Which method is correct?",
              "body": "Choose the valid rewrite for 11/12 divided by 4.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "The expression eleven twelfths divided by 4 is shown with four complete method choices. No choice is highlighted.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "choice",
              "correctOptionId": "B"
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [
              {
                  "id": "A",
                  "visibleLabel": "12/11 x 1/4",
                  "errorFamily": "FLIP_DIVIDEND"
              },
              {
                  "id": "B",
                  "visibleLabel": "11/12 x 1/4 = 11/48"
              },
              {
                  "id": "C",
                  "visibleLabel": "11/12 x 4 = 44/12",
                  "errorFamily": "MULTIPLY"
              },
              {
                  "id": "D",
                  "visibleLabel": "(11 - 4)/12 = 7/12",
                  "errorFamily": "SUBTRACT"
              }
          ],
          "visual": {
              "kind": "recovery_error"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Keep 11/12 fixed.",
                  "4 becomes 1/4.",
                  "11/12 x 1/4 = 11/48"
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh alternate final item.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-DEN-1": {
          "id": "MC-DEN-1",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-MC-DEN-1",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Calculate 9/11 divided by 3.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 9/11 divided by 3. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-DEN-2": {
          "id": "MC-DEN-2",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-MC-DEN-2",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Calculate 5/8 divided by 2.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 5/8 divided by 2. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-NUM-1": {
          "id": "MC-NUM-1",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-MC-NUM-1",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Calculate 11/12 divided by 5.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 11/12 divided by 5. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-NUM-2": {
          "id": "MC-NUM-2",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-MC-NUM-2",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Calculate 7/10 divided by 4.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 7/10 divided by 4. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-MULT-1": {
          "id": "MC-MULT-1",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-MC-MULT-1",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Calculate 5/9 divided by 4.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 5/9 divided by 4. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-MULT-2": {
          "id": "MC-MULT-2",
          "stage": "recovery_final",
          "assessmentFamily": "CONTEXT",
          "problemId": "P-MC-MULT-2",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "A 7/12-litre amount is shared equally among 3 containers. Write one share.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "A 7/12-litre amount is shared equally among 3 containers. Write one share. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_context"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-FLIP-1": {
          "id": "MC-FLIP-1",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-MC-FLIP-1",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Calculate 8/11 divided by 3.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 8/11 divided by 3. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-FLIP-2": {
          "id": "MC-FLIP-2",
          "stage": "recovery_final",
          "assessmentFamily": "REASON",
          "problemId": "P-MC-FLIP-2",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Choose the valid line for 3/10 divided by 4.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Choose the valid line for 3/10 divided by 4. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "choice",
              "correctOptionId": "A"
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [
              {
                  "id": "A",
                  "visibleLabel": "3/10 x 1/4 = 3/40"
              },
              {
                  "id": "B",
                  "visibleLabel": "10/3 x 1/4",
                  "errorFamily": "FLIP_DIVIDEND"
              },
              {
                  "id": "C",
                  "visibleLabel": "3/10 x 4",
                  "errorFamily": "MULTIPLY"
              },
              {
                  "id": "D",
                  "visibleLabel": "(3 - 4)/10",
                  "errorFamily": "SUBTRACT"
              }
          ],
          "visual": {
              "kind": "mini_check_reason"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-SUB-1": {
          "id": "MC-SUB-1",
          "stage": "recovery_final",
          "assessmentFamily": "DIRECT",
          "problemId": "P-MC-SUB-1",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "Calculate 4/7 divided by 2.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "Calculate 4/7 divided by 2. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_direct"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      },
      "MC-SUB-2": {
          "id": "MC-SUB-2",
          "stage": "recovery_final",
          "assessmentFamily": "CONTEXT",
          "problemId": "P-MC-SUB-2",
          "visibleUi": {
              "stageLabel": "Mini-check",
              "title": "Fresh no-hint check",
              "body": "An 11/12-metre ribbon is shared into 3 equal lengths. Write one length.",
              "submitLabel": "Submit"
          },
          "accessibleDescription": "An 11/12-metre ribbon is shared into 3 equal lengths. Write one length. No hint or working is visible before submission.",
          "spokenPromptUtteranceIds": [],
          "responseSpec": {
              "kind": "fraction",
              "acceptEquivalent": true
          },
          "hintPolicy": "none",
          "outcomes": {
              "correctUiCopyId": "RECOVERY.CORRECT",
              "incorrectDefaultUiCopyId": "RECOVERY.INCORRECT"
          },
          "options": [],
          "visual": {
              "kind": "mini_check_context"
          },
          "postSubmitWorking": {
              "revealCondition": "answer_locked",
              "visibleLines": [
                  "Use the integer reciprocal or an exact direct share."
              ],
              "spokenUtteranceIds": []
          },
          "scoring": {
              "contributesToMastery": true,
              "firstAttemptEvidence": true,
              "allowRetry": false,
              "answerLockPolicy": "lock_on_submit"
          },
          "authorOnly": {
              "assessmentIntent": "Fresh two-item mini-check after targeted repair.",
              "mustBeUnseen": true
          },
          "sourceProvenance": "implementation_completion_recovery_bank"
      }
  };
  exports.FRA27_REPAIRS = {
      "R-DEN": {
          "id": "R-DEN",
          "errorFamily": "DENOM_DIV",
          "triggerRule": "explicit denominator-division method or repeated aligned evidence after a size cue",
          "teachingProblemId": "P-R-DEN",
          "speechUtteranceIds": [
              "R.DEN.1",
              "R.DEN.2",
              "R.DEN.3"
          ],
          "visual": {
              "kind": "split_each_eighth_into_two_sixteenths",
              "startParts": 8,
              "selectedParts": 3,
              "resultParts": 16,
              "oneShareSelectedParts": 3
          },
          "supportedInteraction": {
              "problemId": "P-R-DEN",
              "responseSpec": {
                  "kind": "drag_share_then_fraction",
                  "trayCount": 2,
                  "totalTiles": 6,
                  "expectedTrayCounts": [
                      3,
                      3
                  ]
              },
              "promptUiCopyId": "REPAIR.SUPPORTED.PROMPT"
          },
          "freshCheckQuestionId": "R-DEN-FRESH"
      },
      "R-NUM": {
          "id": "R-NUM",
          "errorFamily": "NUM_NONEXACT",
          "triggerRule": "repeated or explicit rounding, dropping, decimal numerator, or impossible claim when numerator is not divisible",
          "teachingProblemId": "P-R-NUM",
          "speechUtteranceIds": [
              "R.NUM.1",
              "R.NUM.2",
              "R.NUM.3"
          ],
          "visual": {
              "kind": "split_each_sixth_into_four_twenty_fourths",
              "startSelectedSixths": 5,
              "subdivisionFactor": 4,
              "oneShareTwentyFourths": 5
          },
          "supportedInteraction": {
              "problemId": "P-R-NUM",
              "responseSpec": {
                  "kind": "reciprocal_and_product",
                  "expectedReciprocal": {
                      "numerator": 1,
                      "denominator": 4
                  }
              },
              "promptUiCopyId": "REPAIR.SUPPORTED.PROMPT"
          },
          "freshCheckQuestionId": "R-NUM-FRESH"
      },
      "R-MULT": {
          "id": "R-MULT",
          "errorFamily": "MULTIPLY",
          "triggerRule": "one explicit multiplication-by-divisor line or repeated multiply response",
          "teachingProblemId": "P-R-MULT",
          "speechUtteranceIds": [
              "R.MULT.1",
              "R.MULT.2",
              "R.MULT.3"
          ],
          "visual": {
              "kind": "contrast_three_copies_with_one_of_three_shares",
              "wrongCopies": 3,
              "rightShareFraction": {
                  "numerator": 4,
                  "denominator": 15
              }
          },
          "supportedInteraction": {
              "problemId": "P-R-MULT",
              "responseSpec": {
                  "kind": "method_animation_choice",
                  "correctChoice": "share_into_groups"
              },
              "promptUiCopyId": "REPAIR.SUPPORTED.PROMPT"
          },
          "freshCheckQuestionId": "R-MULT-FRESH"
      },
      "R-FLIP": {
          "id": "R-FLIP",
          "errorFamily": "FLIP_DIVIDEND",
          "triggerRule": "explicitly inverted dividend or repeated aligned response",
          "teachingProblemId": "P-R-FLIP",
          "speechUtteranceIds": [
              "R.FLIP.1",
              "R.FLIP.2",
              "R.FLIP.3"
          ],
          "visual": {
              "kind": "locked_dividend_only_divisor_rotates",
              "lockedFraction": {
                  "numerator": 5,
                  "denominator": 8
              },
              "divisorAsFraction": {
                  "numerator": 2,
                  "denominator": 1
              },
              "reciprocal": {
                  "numerator": 1,
                  "denominator": 2
              }
          },
          "supportedInteraction": {
              "problemId": "P-R-FLIP",
              "responseSpec": {
                  "kind": "reciprocal_and_product",
                  "expectedReciprocal": {
                      "numerator": 1,
                      "denominator": 2
                  }
              },
              "promptUiCopyId": "REPAIR.SUPPORTED.PROMPT"
          },
          "freshCheckQuestionId": "R-FLIP-FRESH"
      },
      "R-SUB": {
          "id": "R-SUB",
          "errorFamily": "SUBTRACT",
          "triggerRule": "repeated after operation cue or explicit take-away explanation",
          "teachingProblemId": "P-R-SUB",
          "speechUtteranceIds": [
              "R.SUB.1",
              "R.SUB.2",
              "R.SUB.3"
          ],
          "visual": {
              "kind": "contrast_take_away_with_two_equal_shares",
              "sourceFraction": {
                  "numerator": 3,
                  "denominator": 4
              },
              "shareCount": 2,
              "resultFraction": {
                  "numerator": 3,
                  "denominator": 8
              }
          },
          "supportedInteraction": {
              "problemId": "P-R-SUB",
              "responseSpec": {
                  "kind": "operation_meaning_choice",
                  "correctChoice": "make_equal_shares"
              },
              "promptUiCopyId": "REPAIR.SUPPORTED.PROMPT"
          },
          "freshCheckQuestionId": "R-SUB-FRESH"
      }
  };
  exports.FRA27_MINI_CHECK_BANKS = {
      "DENOM_DIV": [
          "MC-DEN-1",
          "MC-DEN-2"
      ],
      "NUM_NONEXACT": [
          "MC-NUM-1",
          "MC-NUM-2"
      ],
      "MULTIPLY": [
          "MC-MULT-1",
          "MC-MULT-2"
      ],
      "FLIP_DIVIDEND": [
          "MC-FLIP-1",
          "MC-FLIP-2"
      ],
      "SUBTRACT": [
          "MC-SUB-1",
          "MC-SUB-2"
      ],
      "UNKNOWN": [
          "MC-MULT-1",
          "MC-FLIP-2"
      ],
      "ARITHMETIC": [
          "MC-DEN-1",
          "MC-NUM-2"
      ]
  };
  exports.FRA27_SPEECH_CUES = [
      {
          "id": "CUE-HOOK-1",
          "sceneId": "HOOK",
          "utteranceId": "HOOK.1",
          "anchorText": "three quarters of a metre long",
          "action": "Reveal a 0-to-3/4 metre strip with quarter marks.",
          "reducedMotionEquivalent": "Show the complete marked strip immediately at the anchored phrase."
      },
      {
          "id": "CUE-HOOK-2",
          "sceneId": "HOOK",
          "utteranceId": "HOOK.1",
          "anchorText": "Two shelves need equal lengths",
          "action": "Reveal two empty shelf-length target cards.",
          "reducedMotionEquivalent": "Show both target cards without motion."
      },
      {
          "id": "CUE-HOOK-3",
          "sceneId": "HOOK",
          "utteranceId": "HOOK.2",
          "anchorText": "quarter-metre marks",
          "action": "Emphasise only the 1/4 and 1/2 cut marks.",
          "reducedMotionEquivalent": "Apply static outlines to the two legal marks."
      },
      {
          "id": "CUE-HOOK-4",
          "sceneId": "HOOK",
          "utteranceId": "HOOK.2",
          "anchorText": "Place the cut",
          "action": "Enable the cut-handle interaction.",
          "reducedMotionEquivalent": "Move keyboard focus to the cut-position controls."
      },
      {
          "id": "CUE-HOOK-5",
          "sceneId": "HOOK",
          "utteranceId": "HOOK.REVEAL",
          "anchorText": "Neither quarter mark makes equal pieces",
          "action": "Show both attempted cuts with visibly unequal resulting lengths.",
          "reducedMotionEquivalent": "Show the two unequal end states side by side."
      },
      {
          "id": "CUE-HOOK-6",
          "sceneId": "HOOK",
          "utteranceId": "HOOK.REVEAL",
          "anchorText": "We need smaller parts",
          "action": "Pulse the three quarter sections once.",
          "reducedMotionEquivalent": "Apply a static subdivision-needed badge to each quarter."
      },
      {
          "id": "CUE-T1-1",
          "sceneId": "T1",
          "utteranceId": "T1.1",
          "anchorText": "Split each quarter",
          "action": "Bisect each of the three quarter sections into two equal eighths.",
          "reducedMotionEquivalent": "Replace the three-quarter state with six equal eighths."
      },
      {
          "id": "CUE-T1-2",
          "sceneId": "T1",
          "utteranceId": "T1.2",
          "anchorText": "six eighth-metre pieces",
          "action": "Reveal the label \"6 equal eighth-metre pieces\".",
          "reducedMotionEquivalent": "Show the label with the six-part state."
      },
      {
          "id": "CUE-T1-3A",
          "sceneId": "T1",
          "utteranceId": "T1.3",
          "anchorText": "three eighths for one shelf",
          "action": "Move three eighth pieces to Shelf A.",
          "reducedMotionEquivalent": "Show Shelf A containing three pieces."
      },
      {
          "id": "CUE-T1-3B",
          "sceneId": "T1",
          "utteranceId": "T1.3",
          "anchorText": "three eighths for the other",
          "action": "Move the remaining three pieces to Shelf B.",
          "reducedMotionEquivalent": "Show Shelf B containing three pieces."
      },
      {
          "id": "CUE-T1-4",
          "sceneId": "T1",
          "utteranceId": "T1.4",
          "anchorText": "three quarters divided by two",
          "action": "Reveal 3/4 divided by 2 equals 3/8 after sharing is complete.",
          "reducedMotionEquivalent": "Show the complete equation."
      },
      {
          "id": "CUE-T2-1",
          "sceneId": "T2",
          "utteranceId": "T2.1",
          "anchorText": "one of two equal shares",
          "action": "Highlight one of the two equal share panels.",
          "reducedMotionEquivalent": "Apply a static outline to one share panel."
      },
      {
          "id": "CUE-T2-2A",
          "sceneId": "T2",
          "utteranceId": "T2.2",
          "anchorText": "keep three quarters",
          "action": "Add a lock outline around 3/4.",
          "reducedMotionEquivalent": "Show a persistent lock icon and outline around 3/4."
      },
      {
          "id": "CUE-T2-2B",
          "sceneId": "T2",
          "utteranceId": "T2.2",
          "anchorText": "reciprocal of 2",
          "action": "Write 2 as 2/1 and transform it to 1/2.",
          "reducedMotionEquivalent": "Step through static states 2, 2/1, 1/2."
      },
      {
          "id": "CUE-T2-2C",
          "sceneId": "T2",
          "utteranceId": "T2.2",
          "anchorText": "multiply by one half",
          "action": "Reveal the multiplication sign and 1/2 beside locked 3/4.",
          "reducedMotionEquivalent": "Show the complete multiplication setup."
      },
      {
          "id": "CUE-T2-3A",
          "sceneId": "T2",
          "utteranceId": "T2.3",
          "anchorText": "Three times one is three",
          "action": "Highlight the numerator multiplication and reveal numerator 3.",
          "reducedMotionEquivalent": "Show numerator working 3 x 1 = 3."
      },
      {
          "id": "CUE-T2-3B",
          "sceneId": "T2",
          "utteranceId": "T2.3",
          "anchorText": "Four times two is eight",
          "action": "Highlight the denominator multiplication and reveal denominator 8.",
          "reducedMotionEquivalent": "Show denominator working 4 x 2 = 8."
      },
      {
          "id": "CUE-T2-3C",
          "sceneId": "T2",
          "utteranceId": "T2.3",
          "anchorText": "three eighths",
          "action": "Resolve the result fraction 3/8.",
          "reducedMotionEquivalent": "Show final 3/8."
      },
      {
          "id": "CUE-T2-4A",
          "sceneId": "T2",
          "utteranceId": "T2.4",
          "anchorText": "Only the divisor changes",
          "action": "Highlight the divisor-to-reciprocal card only.",
          "reducedMotionEquivalent": "Apply a static outline to the divisor card."
      },
      {
          "id": "CUE-T2-4B",
          "sceneId": "T2",
          "utteranceId": "T2.4",
          "anchorText": "Do not flip the amount",
          "action": "Reinforce the dividend lock and suppress any rotation on 3/4.",
          "reducedMotionEquivalent": "Show a lock icon on 3/4."
      },
      {
          "id": "CUE-T3-1",
          "sceneId": "T3",
          "utteranceId": "T3.1",
          "anchorText": "already share exactly",
          "action": "Reveal eight ninth-sized pieces above four empty groups.",
          "reducedMotionEquivalent": "Show all pieces and empty groups."
      },
      {
          "id": "CUE-T3-2",
          "sceneId": "T3",
          "utteranceId": "T3.2",
          "anchorText": "two ninths in each group",
          "action": "Distribute the eight pieces two to each of four groups.",
          "reducedMotionEquivalent": "Show four groups with two pieces each."
      },
      {
          "id": "CUE-T3-3",
          "sceneId": "T3",
          "utteranceId": "T3.3",
          "anchorText": "divide the numerator",
          "action": "Reveal 8 divided by 4 over 9, then 2/9.",
          "reducedMotionEquivalent": "Show the direct-share equation in two static steps."
      },
      {
          "id": "CUE-T3-4",
          "sceneId": "T3",
          "utteranceId": "T3.4",
          "anchorText": "works every time",
          "action": "Reveal a small parallel 8/9 x 1/4 = 8/36 equivalence check.",
          "reducedMotionEquivalent": "Show the reciprocal route as a static secondary check."
      },
      {
          "id": "CUE-T4-1",
          "sceneId": "T4",
          "utteranceId": "T4.1",
          "anchorText": "greater than one",
          "action": "Reveal 5/3 without converting it to a mixed number.",
          "reducedMotionEquivalent": "Show 5/3 with an \"improper dividend allowed\" label."
      },
      {
          "id": "CUE-T4-2A",
          "sceneId": "T4",
          "utteranceId": "T4.2",
          "anchorText": "Five thirds divided by four",
          "action": "Lock 5/3 in position.",
          "reducedMotionEquivalent": "Show a lock outline around 5/3."
      },
      {
          "id": "CUE-T4-2B",
          "sceneId": "T4",
          "utteranceId": "T4.2",
          "anchorText": "times one quarter",
          "action": "Transform divisor 4 into 1/4 and reveal multiplication.",
          "reducedMotionEquivalent": "Show 5/3 x 1/4."
      },
      {
          "id": "CUE-T4-2C",
          "sceneId": "T4",
          "utteranceId": "T4.2",
          "anchorText": "five twelfths",
          "action": "Reveal 5/12.",
          "reducedMotionEquivalent": "Show the result 5/12."
      },
      {
          "id": "CUE-R-DEN-1",
          "sceneId": "R-DEN",
          "utteranceId": "R.DEN.1",
          "anchorText": "made each share larger",
          "action": "Show 3/4 as the wrong growing result beside 3/8.",
          "reducedMotionEquivalent": "Show a static size comparison with the wrong result marked larger."
      },
      {
          "id": "CUE-R-DEN-2",
          "sceneId": "R-DEN",
          "utteranceId": "R.DEN.2",
          "anchorText": "two equal shares",
          "action": "Reveal two empty share trays.",
          "reducedMotionEquivalent": "Show two trays."
      },
      {
          "id": "CUE-R-DEN-3",
          "sceneId": "R-DEN",
          "utteranceId": "R.DEN.3",
          "anchorText": "two sixteenths",
          "action": "Split every eighth into two sixteenths.",
          "reducedMotionEquivalent": "Show the sixteen-part state."
      },
      {
          "id": "CUE-R-NUM-1",
          "sceneId": "R-NUM",
          "utteranceId": "R.NUM.1",
          "anchorText": "still exact",
          "action": "Keep an exact fraction badge visible and suppress decimal rounding.",
          "reducedMotionEquivalent": "Show an \"exact fraction\" badge."
      },
      {
          "id": "CUE-R-NUM-2",
          "sceneId": "R-NUM",
          "utteranceId": "R.NUM.2",
          "anchorText": "one quarter of the amount",
          "action": "Highlight reciprocal 1/4.",
          "reducedMotionEquivalent": "Show 1/4 as the selected share factor."
      },
      {
          "id": "CUE-R-NUM-3",
          "sceneId": "R-NUM",
          "utteranceId": "R.NUM.3",
          "anchorText": "five twenty-fourths",
          "action": "Reveal 5/24 after subdivision.",
          "reducedMotionEquivalent": "Show 5/24."
      },
      {
          "id": "CUE-R-MULT-1",
          "sceneId": "R-MULT",
          "utteranceId": "R.MULT.1",
          "anchorText": "three copies",
          "action": "Show three separate copies of 4/5 in the wrong panel.",
          "reducedMotionEquivalent": "Show three copies as static cards."
      },
      {
          "id": "CUE-R-MULT-2",
          "sceneId": "R-MULT",
          "utteranceId": "R.MULT.2",
          "anchorText": "one of three equal shares",
          "action": "Switch emphasis to a single share of a three-way split.",
          "reducedMotionEquivalent": "Show one outlined share among three."
      },
      {
          "id": "CUE-R-MULT-3",
          "sceneId": "R-MULT",
          "utteranceId": "R.MULT.3",
          "anchorText": "four fifteenths",
          "action": "Reveal 4/5 x 1/3 = 4/15.",
          "reducedMotionEquivalent": "Show the complete equation."
      },
      {
          "id": "CUE-R-FLIP-1",
          "sceneId": "R-FLIP",
          "utteranceId": "R.FLIP.1",
          "anchorText": "five eighths stays in place",
          "action": "Lock 5/8.",
          "reducedMotionEquivalent": "Show a lock outline around 5/8."
      },
      {
          "id": "CUE-R-FLIP-2",
          "sceneId": "R-FLIP",
          "utteranceId": "R.FLIP.2",
          "anchorText": "two over one",
          "action": "Write 2/1 beside the locked dividend.",
          "reducedMotionEquivalent": "Show 2/1."
      },
      {
          "id": "CUE-R-FLIP-3",
          "sceneId": "R-FLIP",
          "utteranceId": "R.FLIP.2",
          "anchorText": "one half",
          "action": "Transform only 2/1 to 1/2.",
          "reducedMotionEquivalent": "Show 1/2 with the dividend unchanged."
      },
      {
          "id": "CUE-R-FLIP-4",
          "sceneId": "R-FLIP",
          "utteranceId": "R.FLIP.3",
          "anchorText": "five sixteenths",
          "action": "Reveal 5/16.",
          "reducedMotionEquivalent": "Show 5/16."
      },
      {
          "id": "CUE-R-SUB-1",
          "sceneId": "R-SUB",
          "utteranceId": "R.SUB.1",
          "anchorText": "not asking how much remains",
          "action": "Strike through the take-away card.",
          "reducedMotionEquivalent": "Show the take-away card disabled."
      },
      {
          "id": "CUE-R-SUB-2",
          "sceneId": "R-SUB",
          "utteranceId": "R.SUB.2",
          "anchorText": "two equal shares",
          "action": "Reveal two equal share containers.",
          "reducedMotionEquivalent": "Show two containers."
      },
      {
          "id": "CUE-R-SUB-3",
          "sceneId": "R-SUB",
          "utteranceId": "R.SUB.3",
          "anchorText": "three eighths",
          "action": "Show six eighths split three-and-three and reveal 3/8.",
          "reducedMotionEquivalent": "Show the final equal-share state and 3/8."
      }
  ];
  exports.FRA27_TEACHING_SCENES = [
      {
          "id": "HOOK",
          "stage": "opening",
          "utteranceIds": [
              "HOOK.1",
              "HOOK.2",
              "HOOK.REVEAL"
          ],
          "cueIds": [
              "CUE-HOOK-1",
              "CUE-HOOK-2",
              "CUE-HOOK-3",
              "CUE-HOOK-4",
              "CUE-HOOK-5",
              "CUE-HOOK-6"
          ],
          "interaction": {
              "kind": "unscored_cut_choice",
              "choices": [
                  "after_one_quarter",
                  "after_two_quarters"
              ],
              "bothRouteTo": "HOOK.REVEAL"
          },
          "authorOnlyPurpose": "Create the need to subdivide before stating a rule."
      },
      {
          "id": "T1",
          "stage": "teach",
          "utteranceIds": [
              "T1.1",
              "T1.2",
              "T1.3",
              "T1.4"
          ],
          "cueIds": [
              "CUE-T1-1",
              "CUE-T1-2",
              "CUE-T1-3A",
              "CUE-T1-3B",
              "CUE-T1-4"
          ],
          "authorOnlyPurpose": "Physically subdivide and share 3/4 into two equal 3/8 lengths."
      },
      {
          "id": "T2",
          "stage": "teach",
          "utteranceIds": [
              "T2.1",
              "T2.2",
              "T2.3",
              "T2.4"
          ],
          "cueIds": [
              "CUE-T2-1",
              "CUE-T2-2A",
              "CUE-T2-2B",
              "CUE-T2-2C",
              "CUE-T2-3A",
              "CUE-T2-3B",
              "CUE-T2-3C",
              "CUE-T2-4A",
              "CUE-T2-4B"
          ],
          "authorOnlyPurpose": "Connect equal sharing to multiplying by the integer reciprocal while locking the dividend."
      },
      {
          "id": "T3",
          "stage": "teach",
          "utteranceIds": [
              "T3.1",
              "T3.2",
              "T3.3",
              "T3.4"
          ],
          "cueIds": [
              "CUE-T3-1",
              "CUE-T3-2",
              "CUE-T3-3",
              "CUE-T3-4"
          ],
          "authorOnlyPurpose": "Introduce direct numerator sharing only when exact."
      },
      {
          "id": "T4",
          "stage": "teach",
          "utteranceIds": [
              "T4.1",
              "T4.2",
              "T4.3"
          ],
          "cueIds": [
              "CUE-T4-1",
              "CUE-T4-2A",
              "CUE-T4-2B",
              "CUE-T4-2C"
          ],
          "authorOnlyPurpose": "Extend the same reciprocal route to an improper dividend without mixed-number conversion."
      },
      {
          "id": "HANDOFF",
          "stage": "teach",
          "utteranceIds": [
              "HANDOFF.1",
              "HANDOFF.2",
              "HANDOFF.3"
          ],
          "cueIds": [],
          "authorOnlyPurpose": "Hand responsibility to the learner after summarising the two connected methods."
      }
  ];
  exports.FRA27_MISCONCEPTIONS = {
      "DENOM_DIV": {
          "name": "Divides the denominator",
          "possibleEvidence": "3/8 divided by 2 becomes 3/4, or a visible denominator-divide step.",
          "immediateFeedbackUtteranceId": "R.DEN.1",
          "repairId": "R-DEN",
          "blocking": true,
          "classificationRule": "Explicit method is strong evidence; otherwise require repeat after a size cue."
      },
      "NUM_NONEXACT": {
          "name": "Treats a non-divisible numerator as impossible or rounds/drops pieces",
          "possibleEvidence": "5/6 divided by 4 becomes 1/6, a decimal numerator over 6, or impossible.",
          "immediateFeedbackUtteranceId": "R.NUM.1",
          "repairId": "R-NUM",
          "blocking": true,
          "classificationRule": "Repeat, explicit rounding/drop, or final recurrence."
      },
      "MULTIPLY": {
          "name": "Multiplies by the integer divisor",
          "possibleEvidence": "7/8 divided by 3 becomes 21/8 or the method uses times 3.",
          "immediateFeedbackUtteranceId": "F2.WRONG.MULTIPLY",
          "repairId": "R-MULT",
          "blocking": true,
          "classificationRule": "One explicit multiplication line is strong evidence."
      },
      "FLIP_DIVIDEND": {
          "name": "Flips the dividend",
          "possibleEvidence": "5/9 divided by 3 starts with 9/5 times 1/3.",
          "immediateFeedbackUtteranceId": "F2.WRONG.FLIP",
          "repairId": "R-FLIP",
          "blocking": true,
          "classificationRule": "Explicit flip or repeated aligned response."
      },
      "SUBTRACT": {
          "name": "Treats equal sharing as subtraction",
          "possibleEvidence": "7/10 divided by 2 becomes 5/10 or 7/8, or the learner states take away.",
          "immediateFeedbackUtteranceId": "F2.WRONG.SUBTRACT",
          "repairId": "R-SUB",
          "blocking": true,
          "classificationRule": "Repeat after operation cue or explicit take-away explanation."
      },
      "ARITHMETIC": {
          "name": "Arithmetic slip after a sound route",
          "possibleEvidence": "Correct reciprocal or direct-share structure with one multiplication/division fact wrong.",
          "immediateFeedbackUtteranceId": "G1.WRONG.COUNT",
          "repairId": null,
          "blocking": false,
          "classificationRule": "Do not classify conceptually from one slip."
      },
      "UNKNOWN": {
          "name": "Ambiguous or malformed response",
          "possibleEvidence": "Blank, malformed, or a wrong fraction consistent with several methods.",
          "immediateFeedbackUiCopyId": "CONFIRM.INCORRECT",
          "repairId": null,
          "blocking": false,
          "classificationRule": "Use a fresh discriminating item before naming a cause."
      }
  };
  exports.FRA27 = {
      id: "FRA27",
      displayId: "FRA-27",
      title: "Divide a Fraction by an Integer",
      status: "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1",
      handoffVersion: "v1",
      contentVersion: "fra27-divide-fraction-by-integer-v1",
      sourceOfTruth: {
          runtimeCopyQuestionDataRoutingAndOutcomeLogic: "src/lessons/fractions/FRA-27/LessonSpec.ts",
          visualGeometryAndPedagogicalIntent: "Revily_FRA-27_Storyboard_v1.pdf",
          engineeringContract: "codex-prompts/FRA-27/CodexPrompt.md",
          criticalPrecedenceRule: "The PDF is the approved visual and pedagogical reference. Only exact entries in FRA27_RUNTIME_COPY are legal Ryan audio/caption copy. FRA27_UI_COPY is visible UI only. Never transcribe PDF headings, stage directions, pedagogy notes, route labels, assessment intents or QA prose into speech.",
          engineeringReference: "Existing canonical Revily FRA lesson shell, TTS/caption timeline, fraction display/input, tile sharing, answer locking, hint evidence, persistence, responsive and accessibility infrastructure.",
      },
      curriculumContract: {
          objective: "Divide a positive fraction by a positive integer using equal sharing or multiplication by the reciprocal of the integer.",
          studentFacingIdea: "Dividing by a whole number means finding one of that many equal shares.",
          prerequisites: [
              "FRA-23: Multiply a Fraction by an Integer.",
              "FRA-24: Multiply Two Fractions.",
              "FRA-26: Understand Reciprocals.",
              "Secure small-number division facts.",
          ],
          teaches: [
              "proper and improper fraction dividends",
              "positive integer divisors only",
              "equal-sharing visuals and exact fractional results",
              "the direct-share route when the numerator divides exactly",
              "the always-valid reciprocal route a/b divided by n equals a/b times 1/n",
              "exact equivalent answers unless a form is explicitly fixed",
          ],
          deliberatelyExcluded: [
              "FRA-28 division by a fraction",
              "mixed-number division",
              "negative values",
              "zero divisors",
              "decimal or percentage conversion",
              "algebraic fractions",
              "simplification as the main lesson target",
              "global Diagnostic, Retrieval or spaced-review behaviour",
          ],
          authoredPilotBounds: {
              startingDenominatorMin: 2,
              startingDenominatorMax: 12,
              integerDivisorMin: 2,
              integerDivisorMax: 10,
          },
      },
      designCompletionNotes: {
          preservedExactlyFromStoryboard: [
              "hook, teaching sequence, core questions G1-M5, hint behaviour, five repair families, mastery thresholds and within-lesson routes",
              "all exact storyboard Ryan lines identified as storyboard_exact",
              "the approved F2/M4 numerical reuse as a representation-transfer item",
          ],
          implementationCompletionsRequiredBecauseStoryboardWasNotMachineComplete: [
              "fixed two-item mini-check banks for each missed family",
              "one fixed three-item alternate final set",
              "minimal visible UI-only outcome lines where the PDF specified behaviour but not exact Ryan wording; these can never enter audio or captions",
              "architecture-neutral evidence, validation, answer checking and persistence helpers",
          ],
          noPedagogicalExpansion: [
              "no Diagnostic",
              "no Retrieval",
              "no fraction divisor",
              "no mixed-number conversion",
              "no global next-skill selection",
          ],
      },
      engineContracts: {
          narrator: "Ryan",
          runtimeCopySource: "FRA27_RUNTIME_COPY[utteranceId].text; no fallback to UI copy",
          captionSource: "the same utterance ID and exact text as audio",
          captions: {
              permanentTranscriptBar: false,
              wordTimed: true,
              maximumTypicalLines: 2,
              mustNotCoverMaths: true,
          },
          animation: {
              speechAnchored: true,
              cueAnchorMustOccurInUtterance: true,
              reducedMotionMustReachEquivalentState: true,
              orphanCuePolicy: "validation_error",
          },
          finalWorking: {
              revealBeforeSubmit: false,
              revealCondition: "answer_locked",
              committedAnswerRemainsVisible: true,
          },
          hintEvidence: {
              startsCollapsed: true,
              openingHintCountsAsWrong: false,
              correctAfterHintRequiresFreshNoHintConfirmation: true,
          },
      },
      route: {
          orderedCoreNodes: [
              "HOOK",
              "T1",
              "T2",
              "T3",
              "T4",
              "HANDOFF",
              "G1",
              "G2",
              "DECISION_A",
              "F1_CONDITIONAL",
              "F2",
              "I1",
              "I2",
              "DECISION_B",
              "M1",
              "M2",
              "M3",
              "M4",
              "M5",
              "FINAL_ROUTE",
          ],
          strongRoute: "G1 and both G2 components first-attempt correct, no hint, no escalation and no central error: skip F1 but keep F2.",
          standardRoute: "Any guided miss or escalation: show F1 then F2.",
          supportedRoute: "Correct after a hint: matching fresh no-hint confirmation before final entry.",
          repairRoute: "Repeated aligned or explicit central error: matching repair, supported interaction and fresh no-hint check.",
          primaryFinalQuestionIds: ["M1", "M2", "M3", "M4", "M5"],
          alternateFinalQuestionIds: ["A1", "A2", "A3"],
      },
      mastery: {
          primaryThreshold: 4,
          primaryTotal: 5,
          breadthRequirement: "At least one direct/procedural item and at least one VISUAL, CONTEXT, REASON or ERROR item must be correct.",
          blockerRule: "No blocking FRA-27 misconception may appear twice in accepted evidence.",
          scoreThreeRoute: "targeted repair plus a fresh two-item same-family mini-check; require 2/2 independently",
          scoreZeroToTwoRoute: "repair actual weaknesses plus the fresh A1-A3 alternate final; require 3/3 independently",
          supportedEvidenceRule: "Supported responses do not count until independently confirmed.",
      },
      responsive: {
          targetMobileWidthPx: 390,
          dominantMathsVisual: true,
          optionCardsFullWidthOnMobile: true,
          trayWrapAllowedWithoutChangingCounts: true,
          finalBeforeAfterPanelsStackVertically: true,
          fractionInputsRemainStackedAndTappable: true,
      },
      accessibility: {
          keyboardOperable: true,
          dragAlternativeRequired: "move-to-tray controls",
          selectedStateNotColourOnly: true,
          visibleFocusRequired: true,
          reducedMotionEquivalentStatesRequired: true,
          scoredDescriptionsMustNotStateShareOrResult: true,
          reciprocalTransformationAnnouncedAsStateChange: true,
      },
      questions: exports.FRA27_QUESTIONS,
      problems: exports.FRA27_PROBLEMS,
      repairs: exports.FRA27_REPAIRS,
      miniCheckBanks: exports.FRA27_MINI_CHECK_BANKS,
      runtimeCopy: exports.FRA27_RUNTIME_COPY,
      visibleUiCopy: exports.FRA27_UI_COPY,
      speechCues: exports.FRA27_SPEECH_CUES,
      teachingScenes: exports.FRA27_TEACHING_SCENES,
      misconceptions: exports.FRA27_MISCONCEPTIONS,
  };
  /** Modern repository-facing name used by the FRA-17+ handoff pattern. */
  exports.FRA27_LESSON_SPEC = exports.FRA27;
  function expectedFractionForProblem(problemId) {
      const problem = exports.FRA27_PROBLEMS[problemId];
      if (!problem)
          throw new Error(`Unknown FRA-27 problem: ${problemId}`);
      return divideFractionByInteger(problem.dividend, problem.integerDivisor);
  }
  function optionById(question, optionId) {
      return question.options.find((option) => option.id === optionId);
  }
  function feedbackRefForId(id) {
      if (exports.FRA27_RUNTIME_COPY[id]) {
          return { channel: "ryan_audio_caption", id };
      }
      if (exports.FRA27_UI_COPY[id]) {
          return { channel: "visible_ui_only", id };
      }
      throw new Error(`Unknown FRA-27 feedback copy ID: ${id}`);
  }
  function feedbackFor(question, correct, errorFamily, optionId) {
      const outcomes = question.outcomes;
      if (correct) {
          return feedbackRefForId(outcomes.correctUtteranceId ?? outcomes.correctUiCopyId ?? "FINAL.CORRECT");
      }
      const defaultIncorrectId = outcomes.incorrectDefaultUtteranceId ??
          outcomes.incorrectDefaultUiCopyId ??
          "FINAL.INCORRECT";
      // Final and recovery items always use their authored outcome line first,
      // then reveal the worked check after answer lock. Error-family routing happens
      // after the committed answer; it must not replace the final outcome line.
      if (question.stage === "final" || question.stage === "recovery_final") {
          return feedbackRefForId(defaultIncorrectId);
      }
      if (optionId && outcomes.incorrectByOption?.[optionId]) {
          return feedbackRefForId(outcomes.incorrectByOption[optionId]);
      }
      // UNKNOWN and one-off ARITHMETIC responses receive the question's neutral
      // default. Do not pretend to know the learner's thinking.
      if (errorFamily && errorFamily !== "UNKNOWN" && errorFamily !== "ARITHMETIC") {
          const misconception = exports.FRA27_MISCONCEPTIONS[errorFamily];
          const misconceptionCopyId = misconception?.immediateFeedbackUtteranceId ??
              misconception?.immediateFeedbackUiCopyId;
          if (misconceptionCopyId)
              return feedbackRefForId(misconceptionCopyId);
      }
      return feedbackRefForId(defaultIncorrectId);
  }
  function classifyFractionMismatch(problem, response) {
      if (response.denominator === 0)
          return "UNKNOWN";
      const expected = expectedFractionForProblem(problem.id);
      if (areEquivalentFractions(response, expected))
          return "UNKNOWN";
      const multiply = normalizeFraction({
          numerator: problem.dividend.numerator * problem.integerDivisor,
          denominator: problem.dividend.denominator,
      });
      if (areEquivalentFractions(response, multiply))
          return "MULTIPLY";
      if (problem.dividend.denominator % problem.integerDivisor === 0) {
          const denomDivide = normalizeFraction({
              numerator: problem.dividend.numerator,
              denominator: problem.dividend.denominator / problem.integerDivisor,
          });
          if (areEquivalentFractions(response, denomDivide))
              return "DENOM_DIV";
      }
      if (problem.dividend.numerator % problem.integerDivisor !== 0) {
          const dropped = {
              numerator: Math.floor(problem.dividend.numerator / problem.integerDivisor),
              denominator: problem.dividend.denominator,
          };
          if (dropped.numerator > 0 && areEquivalentFractions(response, dropped)) {
              return "NUM_NONEXACT";
          }
      }
      const flippedDividend = normalizeFraction({
          numerator: problem.dividend.denominator,
          denominator: problem.dividend.numerator * problem.integerDivisor,
      });
      if (areEquivalentFractions(response, flippedDividend))
          return "FLIP_DIVIDEND";
      const subtractNumerator = {
          numerator: problem.dividend.numerator - problem.integerDivisor,
          denominator: problem.dividend.denominator,
      };
      if (subtractNumerator.numerator > 0 && areEquivalentFractions(response, subtractNumerator)) {
          return "SUBTRACT";
      }
      if (response.denominator === problem.dividend.denominator * problem.integerDivisor ||
          response.denominator === expected.denominator) {
          return "ARITHMETIC";
      }
      return "UNKNOWN";
  }
  function checkFRA27Response(questionId, response) {
      const question = exports.FRA27_QUESTIONS[questionId];
      if (!question)
          throw new Error(`Unknown FRA-27 question: ${questionId}`);
      const problem = exports.FRA27_PROBLEMS[question.problemId];
      if (!problem)
          throw new Error(`Question ${questionId} references an unknown problem.`);
      const specKind = String(question.responseSpec.kind ?? "");
      if (specKind === "choice") {
          if (response.kind !== "choice") {
              return {
                  correct: false,
                  errorFamily: "UNKNOWN",
                  feedback: feedbackFor(question, false, "UNKNOWN"),
              };
          }
          const correctOptionId = String(question.responseSpec.correctOptionId ?? "");
          const correct = response.optionId === correctOptionId;
          const option = optionById(question, response.optionId);
          const errorFamily = correct
              ? null
              : (option?.errorFamily ?? "UNKNOWN");
          return {
              correct,
              errorFamily,
              feedback: feedbackFor(question, correct, errorFamily, response.optionId),
          };
      }
      if (specKind === "missing_numerator") {
          if (response.kind !== "missing_numerator") {
              return {
                  correct: false,
                  errorFamily: "UNKNOWN",
                  feedback: feedbackFor(question, false, "UNKNOWN"),
              };
          }
          const expectedNumerator = Number(question.responseSpec.expectedNumerator);
          const correct = response.numerator === expectedNumerator;
          return {
              correct,
              errorFamily: correct ? null : "UNKNOWN",
              feedback: feedbackFor(question, correct, correct ? null : "UNKNOWN"),
          };
      }
      if (specKind === "drag_share_then_fraction") {
          if (response.kind !== "drag_share_then_fraction") {
              return {
                  correct: false,
                  errorFamily: "UNKNOWN",
                  feedback: feedbackFor(question, false, "UNKNOWN"),
              };
          }
          const expectedCounts = question.responseSpec.expectedTrayCounts ?? [];
          const distributionCorrect = response.trayCounts.length === expectedCounts.length &&
              response.trayCounts.every((count, index) => count === expectedCounts[index]);
          const expected = expectedFractionForProblem(problem.id);
          const fractionCorrect = areEquivalentFractions(response.fraction, expected);
          const correct = distributionCorrect && fractionCorrect;
          const signal = !distributionCorrect ? "unequal_tray_counts" : "used_total_amount";
          const outcomes = question.outcomes;
          return {
              correct,
              errorFamily: correct ? null : "UNKNOWN",
              feedback: feedbackRefForId(correct
                  ? outcomes.correctUtteranceId ?? "G1.CORRECT"
                  : outcomes.incorrectBySignal?.[signal] ??
                      outcomes.incorrectDefaultUtteranceId ??
                      "G1.WRONG.COUNT"),
              componentCorrect: { distribution: distributionCorrect, fraction: fractionCorrect },
              normalizedFraction: fractionCorrect ? normalizeFraction(response.fraction) : undefined,
          };
      }
      if (specKind === "reciprocal_and_product") {
          if (response.kind !== "reciprocal_and_product") {
              return {
                  correct: false,
                  errorFamily: "UNKNOWN",
                  feedback: feedbackFor(question, false, "UNKNOWN"),
              };
          }
          const expectedReciprocal = reciprocalOfInteger(problem.integerDivisor);
          const reciprocalCorrect = areEquivalentFractions(response.reciprocal, expectedReciprocal);
          const expectedProduct = expectedFractionForProblem(problem.id);
          const productCorrect = areEquivalentFractions(response.product, expectedProduct);
          const correct = reciprocalCorrect && productCorrect;
          let errorFamily = null;
          if (!correct) {
              if (areEquivalentFractions(response.reciprocal, {
                  numerator: problem.integerDivisor,
                  denominator: 1,
              })) {
                  errorFamily = "MULTIPLY";
              }
              else if (areEquivalentFractions(response.reciprocal, {
                  numerator: problem.dividend.denominator,
                  denominator: problem.dividend.numerator,
              })) {
                  errorFamily = "FLIP_DIVIDEND";
              }
              else if (!productCorrect) {
                  errorFamily = classifyFractionMismatch(problem, response.product);
              }
              else {
                  errorFamily = "UNKNOWN";
              }
          }
          return {
              correct,
              errorFamily,
              feedback: feedbackFor(question, correct, errorFamily),
              componentCorrect: { reciprocal: reciprocalCorrect, product: productCorrect },
              normalizedFraction: productCorrect ? normalizeFraction(response.product) : undefined,
          };
      }
      if (specKind === "fraction") {
          if (response.kind !== "fraction") {
              return {
                  correct: false,
                  errorFamily: "UNKNOWN",
                  feedback: feedbackFor(question, false, "UNKNOWN"),
              };
          }
          if (response.denominator === 0) {
              return {
                  correct: false,
                  errorFamily: "UNKNOWN",
                  feedback: feedbackFor(question, false, "UNKNOWN"),
              };
          }
          const expected = expectedFractionForProblem(problem.id);
          const correct = areEquivalentFractions(response, expected);
          const errorFamily = correct ? null : classifyFractionMismatch(problem, response);
          return {
              correct,
              errorFamily,
              feedback: feedbackFor(question, correct, errorFamily),
              normalizedFraction: correct ? normalizeFraction(response) : undefined,
          };
      }
      if (specKind === "method_animation_choice") {
          const correct = response.kind === "method_animation_choice" && response.choice === "share_into_groups";
          return {
              correct,
              errorFamily: correct ? null : "MULTIPLY",
              feedback: feedbackRefForId(correct ? "REPAIR.SUPPORTED.CORRECT" : "REPAIR.SUPPORTED.INCORRECT"),
          };
      }
      if (specKind === "operation_meaning_choice") {
          const correct = response.kind === "operation_meaning_choice" && response.choice === "make_equal_shares";
          return {
              correct,
              errorFamily: correct ? null : "SUBTRACT",
              feedback: feedbackRefForId(correct ? "REPAIR.SUPPORTED.CORRECT" : "REPAIR.SUPPORTED.INCORRECT"),
          };
      }
      return {
          correct: false,
          errorFamily: "UNKNOWN",
          feedback: feedbackFor(question, false, "UNKNOWN"),
      };
  }
  function shouldSkipF1(g1, g2) {
      if (!g1 || !g2)
          return false;
      const g2Components = g2.componentFirstAttemptCorrect ?? {};
      const bothG2ComponentsCorrect = g2Components.reciprocal === true &&
          g2Components.product === true &&
          g2.firstAttemptCorrect;
      return (g1.firstAttemptCorrect &&
          bothG2ComponentsCorrect &&
          !g1.hintOpenedBeforeSubmit &&
          !g2.hintOpenedBeforeSubmit &&
          !g1.supportEscalated &&
          !g2.supportEscalated &&
          !g1.errorFamilyHypothesis &&
          !g2.errorFamilyHypothesis);
  }
  function needsFreshConfirmation(record) {
      if (record.freshConfirmationPassed)
          return false;
      return record.hintOpenedBeforeSubmit || record.supportLevel === "hint";
  }
  function confirmationQuestionFor(sourceQuestionId) {
      const map = {
          F1: "C-DIRECT",
          F2: "C-METHOD",
          I1: "C-RECIP",
          I2: "C-DIRECT",
          G1: "C-DIRECT",
          G2: "C-RECIP",
      };
      return map[sourceQuestionId] ?? "C-RECIP";
  }
  function repairForFamily(family) {
      const misconception = exports.FRA27_MISCONCEPTIONS[family];
      return misconception?.repairId ?? null;
  }
  function repeatedBlockingFamily(evidence) {
      const counts = {};
      for (const record of evidence) {
          const family = record.errorFamilyHypothesis;
          if (!family)
              continue;
          const misconception = exports.FRA27_MISCONCEPTIONS[family];
          if (!misconception?.blocking)
              continue;
          counts[family] = (counts[family] ?? 0) + 1;
          if ((counts[family] ?? 0) >= 2)
              return family;
      }
      return null;
  }
  function evaluatePrimaryFinalRoute(evidence) {
      const finalIds = new Set(["M1", "M2", "M3", "M4", "M5"]);
      const byFinalId = new Map();
      for (const record of evidence) {
          if (finalIds.has(record.questionId))
              byFinalId.set(record.questionId, record);
      }
      const records = ["M1", "M2", "M3", "M4", "M5"]
          .map((id) => byFinalId.get(id))
          .filter((record) => Boolean(record));
      if (records.length !== 5)
          return { kind: "restart_without_completion" };
      const correct = records.filter((record) => record.firstAttemptCorrect).length;
      const blocker = repeatedBlockingFamily(records);
      const correctFamilies = new Set(records
          .filter((record) => record.firstAttemptCorrect)
          .map((record) => exports.FRA27_QUESTIONS[record.questionId]?.assessmentFamily)
          .filter((value) => Boolean(value)));
      const hasProcedural = correctFamilies.has("DIRECT") || correctFamilies.has("STEP");
      const hasTransfer = correctFamilies.has("VISUAL") ||
          correctFamilies.has("CONTEXT") ||
          correctFamilies.has("REASON") ||
          correctFamilies.has("ERROR");
      if (correct >= 4 && !blocker && hasProcedural && hasTransfer) {
          return { kind: "finish_candidate" };
      }
      const missedFamilies = records
          .filter((record) => !record.firstAttemptCorrect)
          .map((record) => record.errorFamilyHypothesis ?? "UNKNOWN");
      const principalFamily = blocker ?? missedFamilies[0] ?? "UNKNOWN";
      if (correct === 3) {
          return {
              kind: "repair_then_two_item_mini_check",
              family: principalFamily,
              questionIds: exports.FRA27_MINI_CHECK_BANKS[principalFamily],
          };
      }
      return {
          kind: "repair_then_alternate_three",
          families: Array.from(new Set(missedFamilies)),
          questionIds: ["A1", "A2", "A3"],
      };
  }
  function evaluateRecoveryCompletion(questionIds, evidence) {
      const byId = new Map(evidence.map((record) => [record.questionId, record]));
      const allCorrect = questionIds.every((id) => byId.get(id)?.firstAttemptCorrect === true);
      const relevant = questionIds
          .map((id) => byId.get(id))
          .filter((record) => Boolean(record));
      return allCorrect && !repeatedBlockingFamily(relevant)
          ? "finish_candidate"
          : "restart_without_completion";
  }
  function createInitialFRA27AttemptState() {
      return {
          contentVersion: "fra27-divide-fraction-by-integer-v1",
          currentNodeId: "HOOK",
          evidence: {},
          errorCounts: {},
          repairsCompleted: [],
          confirmationsCompleted: [],
          activeFinalSet: "primary",
          completed: false,
          completionCandidate: false,
      };
  }
  function isRecord(value) {
      return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function migrateFRA27AttemptState(raw) {
      const base = createInitialFRA27AttemptState();
      if (!isRecord(raw))
          return base;
      if (raw.contentVersion !== base.contentVersion)
          return base;
      const evidence = isRecord(raw.evidence)
          ? raw.evidence
          : {};
      const finalSet = raw.activeFinalSet;
      return {
          ...base,
          currentNodeId: typeof raw.currentNodeId === "string" ? raw.currentNodeId : base.currentNodeId,
          evidence,
          errorCounts: isRecord(raw.errorCounts)
              ? raw.errorCounts
              : {},
          repairsCompleted: Array.isArray(raw.repairsCompleted)
              ? raw.repairsCompleted.filter((value) => typeof value === "string")
              : [],
          confirmationsCompleted: Array.isArray(raw.confirmationsCompleted)
              ? raw.confirmationsCompleted.filter((value) => typeof value === "string")
              : [],
          activeFinalSet: finalSet === "alternate" || finalSet === "mini_check" || finalSet === "primary"
              ? finalSet
              : "primary",
          completed: raw.completed === true,
          completionCandidate: raw.completionCandidate === true,
      };
  }
  function collectKnownCopyIds(value, registry, output) {
      if (typeof value === "string") {
          if (registry[value])
              output.add(value);
          return;
      }
      if (Array.isArray(value)) {
          for (const item of value)
              collectKnownCopyIds(item, registry, output);
          return;
      }
      if (!isRecord(value))
          return;
      for (const nested of Object.values(value)) {
          collectKnownCopyIds(nested, registry, output);
      }
  }
  function collectReferencedUtteranceIds() {
      const ids = new Set();
      for (const scene of exports.FRA27_TEACHING_SCENES) {
          collectKnownCopyIds(scene, exports.FRA27_RUNTIME_COPY, ids);
      }
      for (const cue of exports.FRA27_SPEECH_CUES) {
          collectKnownCopyIds(cue, exports.FRA27_RUNTIME_COPY, ids);
      }
      for (const question of Object.values(exports.FRA27_QUESTIONS)) {
          collectKnownCopyIds(question.spokenPromptUtteranceIds, exports.FRA27_RUNTIME_COPY, ids);
          collectKnownCopyIds(question.hintPolicy, exports.FRA27_RUNTIME_COPY, ids);
          collectKnownCopyIds(question.outcomes, exports.FRA27_RUNTIME_COPY, ids);
          collectKnownCopyIds(question.postSubmitWorking, exports.FRA27_RUNTIME_COPY, ids);
      }
      for (const repair of Object.values(exports.FRA27_REPAIRS)) {
          collectKnownCopyIds(repair, exports.FRA27_RUNTIME_COPY, ids);
      }
      collectKnownCopyIds(exports.FRA27_MISCONCEPTIONS, exports.FRA27_RUNTIME_COPY, ids);
      ["COMPLETE", "FINAL.INTRO"].forEach((id) => ids.add(id));
      return ids;
  }
  function collectReferencedUiCopyIds() {
      const ids = new Set();
      for (const question of Object.values(exports.FRA27_QUESTIONS)) {
          collectKnownCopyIds(question, exports.FRA27_UI_COPY, ids);
      }
      for (const repair of Object.values(exports.FRA27_REPAIRS)) {
          collectKnownCopyIds(repair, exports.FRA27_UI_COPY, ids);
      }
      collectKnownCopyIds(exports.FRA27_MISCONCEPTIONS, exports.FRA27_UI_COPY, ids);
      [
          "REPAIR.SUPPORTED.CORRECT",
          "REPAIR.SUPPORTED.INCORRECT",
          "RECOVERY.MINI.INTRO",
          "RECOVERY.ALT.INTRO",
          "RESTART",
      ].forEach((id) => ids.add(id));
      return ids;
  }
  function normalizedWords(text) {
      const words = text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 2);
      return new Set(words);
  }
  function jaccard(a, b) {
      const union = new Set([...a, ...b]);
      if (union.size === 0)
          return 0;
      let intersection = 0;
      for (const value of a)
          if (b.has(value))
              intersection += 1;
      return intersection / union.size;
  }
  function findLikelyAdjacentSemanticRepetition() {
      const issues = [];
      for (const scene of exports.FRA27_TEACHING_SCENES) {
          const ids = scene.utteranceIds;
          for (let i = 1; i < ids.length; i += 1) {
              const previous = exports.FRA27_RUNTIME_COPY[ids[i - 1]];
              const current = exports.FRA27_RUNTIME_COPY[ids[i]];
              if (!previous || !current)
                  continue;
              const similarity = jaccard(normalizedWords(previous.text), normalizedWords(current.text));
              if (similarity >= 0.82) {
                  issues.push(`${scene.id}: ${ids[i - 1]} and ${ids[i]} are highly similar (${similarity.toFixed(2)}).`);
              }
          }
      }
      return issues;
  }
  function validateFRA27CanonicalSpec() {
      const errors = [];
      const runtimeEntries = Object.entries(exports.FRA27_RUNTIME_COPY);
      const seenTexts = new Map();
      const bannedAuthoringTerms = [
          "assessment intent",
          "support escalation",
          "answerlocked",
          "storyboard page",
          "codex",
          "implementation note",
          "quality assurance",
          "diagnostic layer",
          "retrieval layer",
      ];
      for (const [id, utterance] of runtimeEntries) {
          if (!utterance.text.trim())
              errors.push(`${id}: empty runtime text.`);
          if (utterance.provenance !== "storyboard_exact") {
              errors.push(`${id}: non-storyboard text entered FRA27_RUNTIME_COPY.`);
          }
          if (utterance.captionSource !== "same_as_audio") {
              errors.push(`${id}: caption source is not same_as_audio.`);
          }
          const key = utterance.text.trim().toLowerCase();
          const earlier = seenTexts.get(key);
          if (earlier)
              errors.push(`${id}: exact duplicate runtime text already used by ${earlier}.`);
          else
              seenTexts.set(key, id);
          const lower = utterance.text.toLowerCase();
          for (const term of bannedAuthoringTerms) {
              if (lower.includes(term))
                  errors.push(`${id}: banned authoring/QA term leaked into runtime copy: ${term}.`);
          }
      }
      for (const [id, copy] of Object.entries(exports.FRA27_UI_COPY)) {
          if (!copy.text.trim())
              errors.push(`${id}: empty visible UI copy.`);
          if (copy.delivery !== "visible_ui_only") {
              errors.push(`${id}: UI copy is not marked visible_ui_only.`);
          }
          if (exports.FRA27_RUNTIME_COPY[id]) {
              errors.push(`${id}: copy ID exists in both runtime and UI registries.`);
          }
      }
      const referenced = collectReferencedUtteranceIds();
      for (const id of referenced) {
          if (!exports.FRA27_RUNTIME_COPY[id])
              errors.push(`Referenced runtime utterance does not exist: ${id}.`);
      }
      for (const id of Object.keys(exports.FRA27_RUNTIME_COPY)) {
          if (!referenced.has(id))
              errors.push(`Runtime utterance is orphaned and never referenced: ${id}.`);
      }
      const referencedUiCopy = collectReferencedUiCopyIds();
      for (const id of referencedUiCopy) {
          if (!exports.FRA27_UI_COPY[id])
              errors.push(`Referenced visible UI copy does not exist: ${id}.`);
      }
      for (const id of Object.keys(exports.FRA27_UI_COPY)) {
          if (!referencedUiCopy.has(id))
              errors.push(`Visible UI copy is orphaned and never referenced: ${id}.`);
      }
      const cueIds = new Set();
      for (const cue of exports.FRA27_SPEECH_CUES) {
          if (cueIds.has(cue.id))
              errors.push(`Duplicate cue ID: ${cue.id}.`);
          cueIds.add(cue.id);
          const utterance = exports.FRA27_RUNTIME_COPY[cue.utteranceId];
          if (!utterance)
              continue;
          if (!utterance.text.toLowerCase().includes(cue.anchorText.toLowerCase())) {
              errors.push(`${cue.id}: anchor text is not present in ${cue.utteranceId}.`);
          }
          if (!cue.reducedMotionEquivalent.trim()) {
              errors.push(`${cue.id}: missing reduced-motion equivalent.`);
          }
      }
      for (const scene of exports.FRA27_TEACHING_SCENES) {
          for (const cueId of scene.cueIds) {
              if (!cueIds.has(cueId))
                  errors.push(`${scene.id}: references missing cue ${cueId}.`);
          }
      }
      const questionIds = new Set();
      for (const question of Object.values(exports.FRA27_QUESTIONS)) {
          if (questionIds.has(question.id))
              errors.push(`Duplicate question ID: ${question.id}.`);
          questionIds.add(question.id);
          if (!exports.FRA27_PROBLEMS[question.problemId]) {
              errors.push(`${question.id}: missing problem ${question.problemId}.`);
              continue;
          }
          const outcomes = question.outcomes;
          const correctCopyId = outcomes.correctUtteranceId ?? outcomes.correctUiCopyId;
          const incorrectCopyId = outcomes.incorrectDefaultUtteranceId ?? outcomes.incorrectDefaultUiCopyId;
          if (!correctCopyId || !incorrectCopyId) {
              errors.push(`${question.id}: missing distinct correct/default incorrect outcome copy IDs.`);
          }
          else if (correctCopyId === incorrectCopyId) {
              errors.push(`${question.id}: correct and incorrect outcome copy IDs are identical.`);
          }
          const isFinal = question.stage === "final" || question.stage === "recovery_final";
          if (isFinal) {
              if (question.hintPolicy !== "none")
                  errors.push(`${question.id}: final/recovery item exposes a hint.`);
              if (question.scoring.answerLockPolicy !== "lock_on_submit") {
                  errors.push(`${question.id}: final/recovery item does not lock on submit.`);
              }
              if (!question.postSubmitWorking)
                  errors.push(`${question.id}: final/recovery item lacks post-lock working.`);
              if (question.postSubmitWorking?.revealCondition !== "answer_locked") {
                  errors.push(`${question.id}: final/recovery working is not gated by answer_locked.`);
              }
          }
          if (question.accessibleDescription.trim().length < 20) {
              errors.push(`${question.id}: accessible description is too weak.`);
          }
      }
      for (const problem of Object.values(exports.FRA27_PROBLEMS)) {
          if (!Number.isInteger(problem.dividend.numerator) || problem.dividend.numerator <= 0) {
              errors.push(`${problem.id}: dividend numerator must be a positive integer.`);
          }
          if (!Number.isInteger(problem.dividend.denominator) || problem.dividend.denominator < 2 || problem.dividend.denominator > 12) {
              errors.push(`${problem.id}: starting denominator must be in the authored 2-12 range.`);
          }
          if (!Number.isInteger(problem.integerDivisor) || problem.integerDivisor < 2 || problem.integerDivisor > 10) {
              errors.push(`${problem.id}: integer divisor must be in the authored 2-10 range.`);
          }
          const expected = divideFractionByInteger(problem.dividend, problem.integerDivisor);
          if (expected.numerator <= 0 || expected.denominator <= 0) {
              errors.push(`${problem.id}: result must be a positive exact fraction.`);
          }
          if (problem.directShareEmphasised && problem.dividend.numerator % problem.integerDivisor !== 0) {
              errors.push(`${problem.id}: direct-share emphasis is invalid because the numerator does not divide exactly.`);
          }
      }
      const byNumericKey = new Map();
      for (const problem of Object.values(exports.FRA27_PROBLEMS)) {
          const key = `${problem.dividend.numerator}/${problem.dividend.denominator}÷${problem.integerDivisor}`;
          const list = byNumericKey.get(key) ?? [];
          list.push(problem);
          byNumericKey.set(key, list);
      }
      for (const [key, list] of byNumericKey) {
          if (list.length < 2)
              continue;
          const groups = new Set(list.map((item) => item.allowedNumericReuseGroup).filter(Boolean));
          const allApproved = groups.size === 1 && list.every((item) => item.allowedNumericReuseGroup);
          // Teaching/repair repeats are allowed by design. Core/final repeats require an explicit group.
          const coreOrFinalIds = new Set(Object.values(exports.FRA27_QUESTIONS).map((item) => item.problemId));
          const relevant = list.filter((item) => coreOrFinalIds.has(item.id));
          if (relevant.length > 1 && !allApproved) {
              errors.push(`Unapproved repeated numeric problem ${key}: ${relevant.map((item) => item.id).join(", ")}.`);
          }
      }
      for (const [repairId, repair] of Object.entries(exports.FRA27_REPAIRS)) {
          if (!exports.FRA27_PROBLEMS[repair.teachingProblemId])
              errors.push(`${repairId}: missing teaching problem.`);
          if (!exports.FRA27_QUESTIONS[repair.freshCheckQuestionId])
              errors.push(`${repairId}: missing fresh check question.`);
          const freshProblem = exports.FRA27_PROBLEMS[exports.FRA27_QUESTIONS[repair.freshCheckQuestionId]?.problemId];
          const teachingProblem = exports.FRA27_PROBLEMS[repair.teachingProblemId];
          if (freshProblem && teachingProblem &&
              freshProblem.dividend.numerator === teachingProblem.dividend.numerator &&
              freshProblem.dividend.denominator === teachingProblem.dividend.denominator &&
              freshProblem.integerDivisor === teachingProblem.integerDivisor) {
              errors.push(`${repairId}: fresh check repeats the worked repair example.`);
          }
      }
      if (exports.FRA27.mastery.primaryThreshold !== 4 || exports.FRA27.mastery.primaryTotal !== 5) {
          errors.push("Primary mastery threshold must remain 4/5.");
      }
      if (exports.FRA27.contentVersion !== "fra27-divide-fraction-by-integer-v1") {
          errors.push("FRA-27 content version is inconsistent.");
      }
      if (exports.FRA27.engineContracts.runtimeCopySource.includes("FRA27_UI_COPY")) {
          errors.push("Runtime copy source must never fall back to FRA27_UI_COPY.");
      }
      if (exports.FRA27.route.primaryFinalQuestionIds.length !== 5) {
          errors.push("Primary final must contain exactly five authored items.");
      }
      if (exports.FRA27.route.alternateFinalQuestionIds.length !== 3) {
          errors.push("Alternate recovery final must contain exactly three authored items.");
      }
      if (exports.FRA27.engineContracts.captions.permanentTranscriptBar !== false) {
          errors.push("Permanent transcript bar must remain disabled.");
      }
      if (exports.FRA27.responsive.targetMobileWidthPx !== 390) {
          errors.push("Responsive QA target must remain approximately 390 px.");
      }
      errors.push(...findLikelyAdjacentSemanticRepetition());
      return errors;
  }
  function assertFRA27CanonicalSpec() {
      const errors = validateFRA27CanonicalSpec();
      if (errors.length > 0) {
          throw new Error(`FRA-27 canonical spec failed validation:\n- ${errors.join("\n- ")}`);
      }
  }
  function getFRA27Inventory() {
      const primaryIds = new Set(["G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"]);
      const confirmationIds = new Set(["C-RECIP", "C-DIRECT", "C-METHOD"]);
      const repairFreshIds = new Set(["R-DEN-FRESH", "R-NUM-FRESH", "R-MULT-FRESH", "R-FLIP-FRESH", "R-SUB-FRESH"]);
      const alternateIds = new Set(["A1", "A2", "A3"]);
      const miniIds = new Set(Object.values(exports.FRA27_MINI_CHECK_BANKS).flat());
      return {
          runtimeUtterances: Object.keys(exports.FRA27_RUNTIME_COPY).length,
          storyboardExactUtterances: Object.keys(exports.FRA27_RUNTIME_COPY).length,
          visibleUiOnlyCopyEntries: Object.keys(exports.FRA27_UI_COPY).length,
          divisionProblems: Object.keys(exports.FRA27_PROBLEMS).length,
          teachingScenes: exports.FRA27_TEACHING_SCENES.length,
          speechAnchoredCues: exports.FRA27_SPEECH_CUES.length,
          primaryCoreQuestions: Object.keys(exports.FRA27_QUESTIONS).filter((id) => primaryIds.has(id)).length,
          confirmationQuestions: Object.keys(exports.FRA27_QUESTIONS).filter((id) => confirmationIds.has(id)).length,
          repairFreshChecks: Object.keys(exports.FRA27_QUESTIONS).filter((id) => repairFreshIds.has(id)).length,
          repairBranches: Object.keys(exports.FRA27_REPAIRS).length,
          alternateFinalQuestions: Object.keys(exports.FRA27_QUESTIONS).filter((id) => alternateIds.has(id)).length,
          miniCheckQuestions: Object.keys(exports.FRA27_QUESTIONS).filter((id) => miniIds.has(id)).length,
          totalQuestionSpecs: Object.keys(exports.FRA27_QUESTIONS).length,
          misconceptionFamilies: Object.keys(exports.FRA27_MISCONCEPTIONS).length,
      };
  }
  /** Modern repository-facing validation aliases. */
  exports.validateFRA27LessonSpec = validateFRA27CanonicalSpec;
  exports.assertFRA27LessonSpec = assertFRA27CanonicalSpec;
  exports.default = exports.FRA27_LESSON_SPEC;
  
  window.FRA27_RUNTIME_COPY = exports.FRA27_RUNTIME_COPY;
  window.FRA27_UI_COPY = exports.FRA27_UI_COPY;
  window.RevilyFra27V1 = exports;
})();
