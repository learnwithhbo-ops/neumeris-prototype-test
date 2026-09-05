(function () {
  "use strict";
  const canonicalExports = {};
  (function (exports) {
    "use strict";
    /**
     * FRA15_CANONICAL_SPEC.ts
     *
     * Architecture-neutral Codex handoff for:
     * FRA-15 - Express One Quantity as a Fraction of Another
     *
     * Owner approval has been given to proceed from storyboard to implementation
     * handoff. This file is an implementation candidate, not proof that the real
     * application has passed route, visual, accessibility, persistence or
     * regression QA.
     *
     * HARD RUNTIME BOUNDARY
     * Ryan audio and Ryan captions may resolve only from:
     *   FRA15_RUNTIME_COPY[utteranceId].text
     *
     * Prompts, visual instructions, author-only pedagogy, route labels, error-family
     * names and QA prose must never be passed to Ryan TTS or caption rendering.
     * Captions derive from the same utterance ID as audio. Every timed visual cue
     * binds to an active utterance ID and an exact phrase in that utterance.
     */
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FRA15 = exports.FRA15_RECOVERY_FINALS = exports.FRA15_REPAIR_PROFILES = exports.FRA15_CONFIRMATION_QUESTIONS = exports.FRA15_FINAL_QUESTIONS = exports.FRA15_QUESTIONS = exports.FRA15_TEACHING_SCENES = exports.FRA15_RUNTIME_COPY = void 0;
    exports.gcd = gcd;
    exports.simplifyFraction = simplifyFraction;
    exports.fractionsAreEquivalent = fractionsAreEquivalent;
    exports.fractionExactlyEquals = fractionExactlyEquals;
    exports.fractionIsSimplest = fractionIsSimplest;
    exports.evaluateFractionResponse = evaluateFractionResponse;
    exports.allFRA15QuestionLikeObjects = allFRA15QuestionLikeObjects;
    exports.getFRA15Question = getFRA15Question;
    exports.classifyFRA15Response = classifyFRA15Response;
    exports.routeFRA15AfterGuided = routeFRA15AfterGuided;
    exports.routeFRA15AfterIndependent = routeFRA15AfterIndependent;
    exports.routeFRA15FinalCheck = routeFRA15FinalCheck;
    exports.validateFRA15CanonicalSpec = validateFRA15CanonicalSpec;
    function defineRuntime(seeds) {
        const registry = {};
        for (const id of Object.keys(seeds)) {
            const [role, communicationGoal, text] = seeds[id];
            registry[id] = {
                audience: "learner",
                spokenBy: "Ryan",
                role,
                communicationGoal,
                text,
                captionSource: "same_as_audio",
            };
        }
        return registry;
    }
    exports.FRA15_RUNTIME_COPY = defineRuntime({
        "HOOK.1": ["explain", "establish_two_measured_quantities", "The blue ribbon is twelve centimetres. The orange ribbon is eight."],
        "HOOK.2": ["explain", "surface_proper_fraction_bias", "A student writes eight twelfths because, they say, a fraction should be smaller than one."],
        "HOOK.3": ["prompt", "ask_which_quantity_controls_numerator", "But the question is blue as a fraction of orange. Which quantity should be on top?"],
        "HOOK.4": ["explain", "resolve_order_and_allow_value_above_one", "Blue is the quantity we're expressing, so we start with twelve eighths. The answer is allowed to be greater than one."],
        "T1.1": ["explain", "read_comparison_phrase_in_order", "Read the phrase in order: blue as a fraction of orange."],
        "T1.2": ["explain", "map_expressed_quantity_to_numerator", "Blue is the quantity being expressed. That becomes the numerator."],
        "T1.3": ["explain", "map_reference_quantity_to_denominator", "Orange is the quantity we are comparing with. That becomes the denominator."],
        "T1.4": ["summary", "state_direct_fraction_before_simplification", "So the direct fraction is twelve eighths."],
        "T2.1": ["transition", "reverse_wording_without_changing_data", "Keep the same two ribbons, but change the question."],
        "T2.2": ["explain", "show_word_order_reverses_fraction_order", "Orange as a fraction of blue starts with orange, so eight goes on top. Blue is the reference, so twelve goes underneath."],
        "T2.3": ["generalise", "separate_values_from_question_direction", "Same quantities. Different question. Different fraction."],
        "T3.1": ["explain", "establish_two_subgroups_and_total", "These counters make one set: seven teal and four gold."],
        "T3.2": ["explain", "use_named_subgroup_as_reference", "If I ask for teal as a fraction of gold, gold is the reference. The fraction is seven fourths."],
        "T3.3": ["explain", "reject_automatic_total_denominator", "The total, eleven, does not belong in the denominator unless the question asks for teal as a fraction of all the counters."],
        "T3.4": ["explain", "contrast_with_whole_set_question", "That second question would be seven elevenths."],
        "T4.1": ["explain", "establish_simplification_example_values", "The green ribbon is fifteen centimetres. The purple ribbon is twenty."],
        "T4.2": ["explain", "build_raw_fraction_before_reducing", "Green as a fraction of purple starts as fifteen twentieths."],
        "T4.3": ["generalise", "sequence_order_before_simplification", "If the question adds 'in simplest form', keep the order and simplify the fraction you already built."],
        "T4.4": ["explain", "show_shared_division", "Divide top and bottom by five: three quarters."],
        "T5.1": ["instruction", "introduce_side_of_one_check", "Before you submit, compare the first quantity with the reference."],
        "T5.2": ["generalise", "connect_relative_size_to_side_of_one", "If the first is smaller, the fraction is below one. If they are equal, it is one. If the first is larger, it is above one."],
        "T5.3": ["warning", "prevent_check_becoming_flip_rule", "That is a check on your order - not a rule for changing it."],
        "HANDOFF.1": ["summary", "name_ordering_move_to_protect", "You have one move to protect: the quantity named first goes over the quantity used as the reference."],
        "HANDOFF.2": ["transition", "hand_control_to_learner", "I'll stay with you for two. Then the support starts to fade."],
        "G1.PRE": ["prompt", "cue_meaning_before_counting", "Read the wording before you count. Which quantity is being expressed, and which is the reference?"],
        "G1.CORRECT": ["acknowledge_correct", "confirm_context_order", "Yes. Teal is being expressed, so nine goes on top. Gold is the reference, so six goes underneath."],
        "G1.INCORRECT.ORDER": ["redirect_incorrect", "correct_reversed_order", "The counts are right, but the order is reversed. Read teal as a fraction of gold."],
        "G1.INCORRECT.TOTAL": ["redirect_incorrect", "correct_total_denominator", "The question compares teal with gold, not teal with all fifteen counters."],
        "G1.INCORRECT.DEFAULT": ["redirect_incorrect", "neutral_guided_retry", "That fraction does not match the wording yet. Identify the expressed group and the reference group again."],
        "G2.PRE": ["prompt", "sequence_comparison_before_simplification", "Build the comparison first. Then simplify the fraction you built."],
        "G2.CORRECT": ["acknowledge_correct", "confirm_order_and_form", "The shorter board stays on top, and fourteen twenty-firsts simplifies to two thirds."],
        "G2.INCORRECT.ORDER": ["redirect_incorrect", "correct_reversed_board_order", "That reverses the two boards. The shorter board must stay on top."],
        "G2.INCORRECT.TOTAL": ["redirect_incorrect", "correct_combined_length_reference", "That uses both lengths as a new total. The longer board alone is the reference."],
        "G2.INCORRECT.FORM": ["redirect_incorrect", "require_simplest_form", "Your order is right. Finish by simplifying fourteen twenty-firsts."],
        "G2.INCORRECT.DEFAULT": ["redirect_incorrect", "neutral_two_step_retry", "Set the shorter board over the longer board, then check whether the result is in simplest form."],
        "F1.HINT": ["instruction", "guide_order_without_values", "The quantity named before 'as a fraction of' goes on top. The quantity after it is the reference."],
        "F1.CORRECT": ["acknowledge_correct", "confirm_file_order", "File A is being expressed over File B. That comparison is correct."],
        "F1.INCORRECT.ORDER": ["redirect_incorrect", "correct_file_reversal", "The two file sizes are reversed. File A is named first, so it belongs on top."],
        "F1.INCORRECT.COMBINE": ["redirect_incorrect", "reject_added_file_sizes", "Do not combine the file sizes. Keep File A over File B."],
        "F1.INCORRECT.DEFAULT": ["redirect_incorrect", "neutral_file_retry", "Read the sentence from File A to File B and rebuild the fraction in that order."],
        "F2.HINT": ["instruction", "guide_named_reference_not_total", "The denominator is the quantity after 'of': orange, not all the counters."],
        "F2.CORRECT": ["acknowledge_correct", "confirm_reference_group", "Blue is being expressed and orange is the reference, so seven fourths answers the question."],
        "F2.INCORRECT.ORDER": ["redirect_incorrect", "correct_reciprocal_choice", "That choice reverses blue and orange. Follow the wording from blue to orange."],
        "F2.INCORRECT.TOTAL": ["redirect_incorrect", "correct_whole_set_choice", "That choice uses all eleven counters. The question names only the orange group as the reference."],
        "F2.INCORRECT.COMBINE": ["redirect_incorrect", "correct_combined_numerator", "That choice combines the two groups. Keep the seven blue counters separate from the four-counter reference."],
        "F2.INCORRECT.DEFAULT": ["redirect_incorrect", "neutral_choice_retry", "Choose the fraction whose numerator is the named first group and whose denominator is the named reference group."],
        "I1.HINT": ["instruction", "guide_order_then_simplify", "Write local time over express time. Simplify after the order is set."],
        "I1.CORRECT": ["acknowledge_correct", "confirm_above_one_context", "The local train takes longer, so three halves is a sensible result above one."],
        "I1.INCORRECT.ORDER": ["redirect_incorrect", "use_side_of_one_to_expose_reversal", "That is below one, but the local train takes longer. Check the order."],
        "I1.INCORRECT.COMBINE": ["redirect_incorrect", "reject_added_times", "Nothing is being added. Keep the two journey times separate."],
        "I1.INCORRECT.FORM": ["redirect_incorrect", "require_simplest_form_after_order", "The comparison is in the right order. Now simplify it fully."],
        "I1.INCORRECT.DEFAULT": ["redirect_incorrect", "neutral_context_retry", "Start with local time over express time, then check the final form."],
        "I2.HINT": ["instruction", "guide_both_directions", "Each statement begins with the quantity that goes on top."],
        "I2.CORRECT": ["acknowledge_correct", "confirm_both_mappings", "Both directions are matched correctly. Changing the wording changes which value is on top."],
        "I2.INCORRECT.SWAPPED": ["redirect_incorrect", "correct_both_mappings_reversed", "Both fractions are attached to the opposite statements. Read each statement from its first quantity to its reference."],
        "I2.INCORRECT.PARTIAL": ["redirect_incorrect", "allow_single_mapping_correction", "One match is not in the requested direction. Check each statement separately before you submit again."],
        "I2.INCORRECT.DEFAULT": ["redirect_incorrect", "neutral_match_retry", "Match each phrase to first quantity over second quantity, then simplify."],
        "FINAL.INTRO": ["transition", "state_no_hint_and_post_lock_contract", "These last five are yours. No hints this time. Do each question first. Once your answer is locked, I'll show the working so you can check the order and the simplification."],
        "M1.CORRECT": ["acknowledge_correct", "acknowledge_direct_order_and_form", "The order and simplest form are both right. Now check the reduction from twenty-one twenty-eighths."],
        "M1.INCORRECT.ORDER": ["redirect_incorrect", "identify_direct_reversal", "That reverses the two quantities. The locked check will restore the wording order."],
        "M1.INCORRECT.FORM": ["redirect_incorrect", "identify_unsimplified_equivalent", "That fraction has the right value, but the question asks for simplest form. Compare it with the check."],
        "M1.INCORRECT.DEFAULT": ["redirect_incorrect", "introduce_direct_worked_check", "That answer does not meet the requested order and form. Compare it with the locked check."],
        "M1.WORK.1": ["worked_check", "place_first_quantity_in_numerator", "Twenty-one is named first, so it is the numerator."],
        "M1.WORK.2": ["worked_check", "place_reference_in_denominator", "Twenty-eight is the reference, so it is the denominator."],
        "M1.WORK.3": ["worked_check", "simplify_by_seven", "Dividing both numbers by seven gives three quarters."],
        "M2.CORRECT": ["acknowledge_correct", "acknowledge_named_reference_group", "You used the purple group as the reference. Now check the two group counts."],
        "M2.INCORRECT.ORDER": ["redirect_incorrect", "identify_reversed_counter_groups", "That reverses yellow and purple. The worked check will follow the exact wording."],
        "M2.INCORRECT.TOTAL": ["redirect_incorrect", "identify_total_denominator", "That uses all fifteen counters. The question names the purple group as the reference."],
        "M2.INCORRECT.DEFAULT": ["redirect_incorrect", "introduce_group_reference_check", "That fraction does not match the named groups. Compare it with the locked check."],
        "M2.WORK.1": ["worked_check", "count_expressed_group", "Six yellow counters are being expressed."],
        "M2.WORK.2": ["worked_check", "count_reference_group", "Nine purple counters form the reference, so the direct fraction is six ninths."],
        "M2.WORK.3": ["worked_check", "state_accepted_equivalent", "Two thirds is an accepted exact equivalent."],
        "M3.CORRECT": ["acknowledge_correct", "acknowledge_valid_above_one_result", "You kept Route A on top even though the result is above one. Now check the simplification."],
        "M3.INCORRECT.ORDER": ["redirect_incorrect", "identify_flip_to_force_proper", "That flips the routes to force a fraction below one. The locked check keeps Route A first."],
        "M3.INCORRECT.FORM": ["redirect_incorrect", "identify_unsimplified_route_fraction", "The route order is right, but the answer is not yet in simplest form."],
        "M3.INCORRECT.DEFAULT": ["redirect_incorrect", "introduce_route_worked_check", "That answer does not match Route A as a fraction of Route B. Use the locked check."],
        "M3.WORK.1": ["worked_check", "build_route_fraction", "Route A is thirty-five kilometres and Route B is twenty, so the fraction starts as thirty-five twentieths."],
        "M3.WORK.2": ["worked_check", "simplify_route_fraction", "Dividing both by five gives seven quarters."],
        "M3.WORK.3": ["worked_check", "connect_longer_route_to_above_one", "Route A is longer, so a result above one is expected."],
        "M4.CORRECT": ["acknowledge_correct", "acknowledge_equal_quantity_case", "Equal capacities give a fraction equal to one. Now check the reference choice."],
        "M4.INCORRECT.TOTAL": ["redirect_incorrect", "identify_combined_capacity", "That uses the combined capacity instead of Tank B. Compare it with the locked check."],
        "M4.INCORRECT.DEFAULT": ["redirect_incorrect", "introduce_equal_case_check", "That fraction does not represent Tank A compared with Tank B. Use the check."],
        "M4.WORK.1": ["worked_check", "build_equal_capacity_fraction", "Tank A is eighteen litres and Tank B is the eighteen-litre reference, so the direct fraction is eighteen eighteenths."],
        "M4.WORK.2": ["worked_check", "state_equal_to_one", "The quantities are equal, so the fraction equals one."],
        "M5.CORRECT": ["acknowledge_correct", "acknowledge_units_order_and_form", "You matched the units, kept the first cable over the second, and simplified correctly."],
        "M5.INCORRECT.UNITS": ["redirect_incorrect", "identify_unaligned_units", "That compares centimetres with metres before the units match. Use the supplied conversion in the check."],
        "M5.INCORRECT.ORDER_UNITS": ["redirect_incorrect", "identify_units_and_order_errors", "The units do not match and the two cables are reversed. Follow the locked check from the conversion onward."],
        "M5.INCORRECT.ORDER": ["redirect_incorrect", "identify_reversal_after_conversion", "The units can be aligned, but the two cables are reversed. The first cable must stay on top."],
        "M5.INCORRECT.FORM": ["redirect_incorrect", "identify_unsimplified_converted_fraction", "The units and order are right. Finish by simplifying the fraction."],
        "M5.INCORRECT.DEFAULT": ["redirect_incorrect", "introduce_unit_alignment_check", "That answer does not match the converted quantities. Compare it with the locked check."],
        "M5.WORK.1": ["worked_check", "apply_supplied_conversion", "The supplied conversion gives two metres as two hundred centimetres."],
        "M5.WORK.2": ["worked_check", "build_common_unit_fraction", "The first cable over the second is one hundred and twenty over two hundred."],
        "M5.WORK.3": ["worked_check", "simplify_common_unit_fraction", "Dividing both by forty gives three fifths."],
        "C-ORDER.CORRECT": ["acknowledge_correct", "confirm_clean_order_evidence", "Yes. The first quantity remains on top, and the simplified fraction is above one."],
        "C-ORDER.INCORRECT": ["redirect_incorrect", "require_fresh_order_check", "The quantities are still not in the requested order. Rebuild the fraction before simplifying."],
        "C-TOTAL.CORRECT": ["acknowledge_correct", "confirm_named_reference_not_total", "Yes. The orange group is the reference, not the whole set."],
        "C-TOTAL.INCORRECT": ["redirect_incorrect", "require_fresh_reference_check", "Use the named comparison group as the denominator. Do not replace it with the total."],
        "C-COMBINE.CORRECT": ["acknowledge_correct", "confirm_quantities_remain_separate", "Yes. The two quantities stay separate in the comparison."],
        "C-COMBINE.INCORRECT": ["redirect_incorrect", "require_fresh_non_combination_check", "Nothing should be added. Keep the first quantity over the reference quantity."],
        "C-SMALL.CORRECT": ["acknowledge_correct", "confirm_valid_fraction_above_one", "Yes. The first quantity is larger, so the fraction is correctly above one."],
        "C-SMALL.INCORRECT": ["redirect_incorrect", "require_above_one_confirmation", "Do not flip the quantities to make the fraction smaller than one."],
        "C-FORM.CORRECT": ["acknowledge_correct", "confirm_requested_simplest_form", "Yes. The order is preserved and the fraction is fully simplified."],
        "C-FORM.INCORRECT": ["redirect_incorrect", "require_simplest_form_confirmation", "Keep the correct order, then reduce the fraction to simplest form."],
        "C-UNITS.CORRECT": ["acknowledge_correct", "confirm_conversion_then_comparison", "Yes. The units match before the first quantity is compared with the second."],
        "C-UNITS.INCORRECT": ["redirect_incorrect", "require_unit_alignment_confirmation", "Use the supplied conversion first, then build the fraction in the requested order."],
        "R-ORDER.1": ["repair", "name_reversed_quantities", "Your two quantities are both here, but their order has flipped."],
        "R-ORDER.2": ["repair", "rebuild_eighteen_over_twelve", "Read it aloud: eighteen as a fraction of twelve. Eighteen is the quantity being expressed, so it goes on top. Twelve is the reference, so it goes underneath."],
        "R-ORDER.3": ["repair", "simplify_rebuilt_order", "That gives eighteen twelfths, which is three halves in simplest form."],
        "R-ORDER.CHECK.CORRECT": ["acknowledge_correct", "confirm_recovered_order", "The wording and the fraction now agree. The order repair is secure."],
        "R-ORDER.CHECK.INCORRECT": ["redirect_incorrect", "continue_order_recovery", "The order is still reversed. Read the new phrase aloud and place the first quantity on top."],
        "R-TOTAL.1": ["repair", "limit_whole_set_use", "The whole set matters only when the question names the whole set."],
        "R-TOTAL.2": ["repair", "restore_named_subgroup_reference", "Here it asks for black counters as a fraction of white counters. White is the denominator. The total is not the reference."],
        "R-TOTAL.CHECK.CORRECT": ["acknowledge_correct", "confirm_recovered_reference_choice", "You used the named group as the denominator and ignored the unrelated total."],
        "R-TOTAL.CHECK.INCORRECT": ["redirect_incorrect", "continue_total_recovery", "The total has entered the fraction again. Use only the two named groups."],
        "R-COMBINE.1": ["repair", "reject_addition_as_comparison", "Nothing is being added. One quantity is being compared with another."],
        "R-COMBINE.2": ["repair", "preserve_original_values", "Keep the two original quantities in the fraction; do not turn them into a new total."],
        "R-COMBINE.CHECK.CORRECT": ["acknowledge_correct", "confirm_recovered_non_combination", "The original quantities remain separate, so the comparison is correct."],
        "R-COMBINE.CHECK.INCORRECT": ["redirect_incorrect", "continue_non_combination_recovery", "A new total has appeared again. Return to the two original quantities."],
        "R-SMALL.1": ["repair", "reject_proper_fraction_requirement", "A fraction does not have to be below one."],
        "R-SMALL.2": ["repair", "connect_larger_first_to_larger_numerator", "If the first quantity is larger than the reference, the numerator should be larger than the denominator."],
        "R-SMALL.3": ["repair", "show_valid_above_one_example", "Fifteen as a fraction of ten is fifteen tenths, or three halves."],
        "R-SMALL.CHECK.CORRECT": ["acknowledge_correct", "confirm_recovered_above_one_reasoning", "You kept the larger first quantity on top. The result is correctly above one."],
        "R-SMALL.CHECK.INCORRECT": ["redirect_incorrect", "continue_above_one_recovery", "The fraction has been flipped to stay below one. Keep the wording order unchanged."],
        "R-FORM.1": ["repair", "separate_order_from_required_form", "Your order is right. The question also asks for simplest form."],
        "R-FORM.2": ["repair", "simplify_without_swapping", "Simplify after the fraction is built; do not swap the quantities."],
        "R-FORM.CHECK.CORRECT": ["acknowledge_correct", "confirm_recovered_form", "The order stayed fixed and the final fraction is in simplest form."],
        "R-FORM.CHECK.INCORRECT": ["redirect_incorrect", "continue_form_recovery", "The comparison is correct, but the fraction still needs to be simplified fully."],
        "R-UNITS.1": ["repair", "pause_until_units_match", "These quantities are not ready to compare yet because the units differ."],
        "R-UNITS.2": ["repair", "use_supplied_conversion_then_order", "Use the conversion given on screen, then build the fraction in the usual order."],
        "R-UNITS.CHECK.CORRECT": ["acknowledge_correct", "confirm_recovered_unit_alignment", "The units now match before the fraction is built. That comparison is correct."],
        "R-UNITS.CHECK.INCORRECT": ["redirect_incorrect", "continue_unit_alignment_recovery", "The units are still mixed. Apply the conversion card before comparing the quantities."],
        "RF1.CORRECT": ["acknowledge_correct", "acknowledge_recovery_direct", "The direct order and simplest form are correct. Check the new values."],
        "RF1.INCORRECT": ["redirect_incorrect", "introduce_recovery_direct_check", "That answer does not match the requested order and simplest form. Use the locked check."],
        "RF1.WORK.1": ["worked_check", "build_recovery_direct_fraction", "Thirty-two is named first, so the fraction starts as thirty-two fifty-sixths."],
        "RF1.WORK.2": ["worked_check", "simplify_recovery_direct_fraction", "Dividing both by eight gives four sevenths."],
        "RF2.CORRECT": ["acknowledge_correct", "acknowledge_recovery_reference", "You used the grey group as the reference. Check the fresh counter counts."],
        "RF2.INCORRECT": ["redirect_incorrect", "introduce_recovery_reference_check", "That fraction does not use the named reference group. Compare it with the locked check."],
        "RF2.WORK.1": ["worked_check", "build_recovery_counter_fraction", "Eight red counters are being expressed over fourteen grey counters."],
        "RF2.WORK.2": ["worked_check", "state_recovery_counter_equivalent", "The direct fraction is eight fourteenths, and four sevenths is an accepted equivalent."],
        "RF3.CORRECT": ["acknowledge_correct", "acknowledge_recovery_above_one", "The larger first distance remains on top. Check the simplification."],
        "RF3.INCORRECT": ["redirect_incorrect", "introduce_recovery_above_one_check", "That answer does not represent the first distance over the reference distance. Use the check."],
        "RF3.WORK.1": ["worked_check", "build_recovery_distance_fraction", "The fraction begins as forty-two thirtieths."],
        "RF3.WORK.2": ["worked_check", "simplify_recovery_distance_fraction", "Dividing both by six gives seven fifths, which is above one."],
        "RF4.CORRECT": ["acknowledge_correct", "acknowledge_recovery_equal_case", "Equal masses give a comparison equal to one. Check the direct fraction."],
        "RF4.INCORRECT": ["redirect_incorrect", "introduce_recovery_equal_check", "That fraction does not compare the first equal mass with the second. Use the check."],
        "RF4.WORK.1": ["worked_check", "build_recovery_equal_fraction", "The direct comparison is twenty-five twenty-fifths."],
        "RF4.WORK.2": ["worked_check", "state_recovery_equal_value", "Equal quantities give a value of one."],
        "RF5.CORRECT": ["acknowledge_correct", "acknowledge_recovery_units", "The supplied conversion, order and simplest form are all correct."],
        "RF5.INCORRECT": ["redirect_incorrect", "introduce_recovery_units_check", "That answer does not match the converted cable lengths. Use the locked check."],
        "RF5.WORK.1": ["worked_check", "apply_recovery_conversion", "The supplied conversion gives one point five metres as one hundred and fifty centimetres."],
        "RF5.WORK.2": ["worked_check", "simplify_recovery_unit_fraction", "Sixty over one hundred and fifty simplifies to two fifths."],
        "COMPLETE.1": ["completion", "summarise_and_close", "You can now turn 'A as a fraction of B' into A over B, decide whether the answer should be below, equal to or above one, and simplify when the question asks. FRA-15 is done."],
    });
    const f = (numerator, denominator) => ({
        numerator,
        denominator,
    });
    const cue = (id, utteranceId, anchorText, authorOnlyAction) => ({
        id,
        utteranceId,
        anchorText,
        authorOnlyAction,
        mustNotOccurBeforeAnchor: true,
    });
    const feedback = (correctUtteranceIds, incorrectDefaultUtteranceIds, incorrectByPattern = []) => ({
        correctUtteranceIds,
        incorrectByPattern,
        incorrectDefaultUtteranceIds,
        playExactlyOneOutcomeBranch: true,
        doNotPlayDefaultAfterSpecific: true,
    });
    const finalPolicy = {
        hintPolicy: "none",
        solutionPolicy: "after_locked_submit",
        scored: true,
        answerLocksOnSubmit: true,
        requiresFreshNoHintConfirmationIfHintUsed: false,
    };
    const confirmationPolicy = {
        hintPolicy: "none",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: false,
    };
    const guidedPolicy = {
        hintPolicy: "guided",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: false,
    };
    const optionalHintPolicy = {
        hintPolicy: "optional",
        solutionPolicy: "after_response",
        scored: true,
        answerLocksOnSubmit: false,
        requiresFreshNoHintConfirmationIfHintUsed: true,
    };
    exports.FRA15_TEACHING_SCENES = [
        {
            id: "HOOK",
            stage: "opening",
            authorOnlyPurpose: "Create an order conflict and expose the belief that every fraction must be below one.",
            visual: {
                kind: "measured_ribbons",
                quantities: [
                    { id: "blue", label: "blue ribbon", value: 12, unit: "cm", semanticRole: "expressed" },
                    { id: "orange", label: "orange ribbon", value: 8, unit: "cm", semanticRole: "reference" },
                ],
                sharedScale: true,
                initialStudentFraction: f(8, 12),
                resolvedFraction: f(12, 8),
                showReferenceBracket: true,
                authorOnlyNotes: [
                    "Ribbon lengths must be proportional on one shared scale.",
                    "The tentative 8/12 is visibly presented as the student's claim, not as accepted mathematics.",
                    "No pizza, chocolate or unrelated generic fraction bar may replace the measured ribbons.",
                ],
            },
            ryanUtteranceIds: ["HOOK.1", "HOOK.2", "HOOK.3", "HOOK.4"],
            timeline: [
                cue("HOOK.CUE.1", "HOOK.1", "twelve centimetres", "Reveal the blue ribbon at 12 cm, then the orange ribbon at 8 cm on the same scale."),
                cue("HOOK.CUE.2", "HOOK.2", "eight twelfths", "Place 8 over 12 beside the student's claim and mark it as tentative."),
                cue("HOOK.CUE.3", "HOOK.3", "blue as a fraction of orange", "Emphasise the exact wording and bracket orange as the reference quantity."),
                cue("HOOK.CUE.4", "HOOK.4", "twelve eighths", "Move 12 into the numerator and 8 into the denominator, then reveal the greater-than-one comparison."),
            ],
            interaction: {
                kind: "continue_after_prediction",
                scored: false,
                visiblePrompt: "Which quantity comes first?",
                controls: ["Show me"],
                answerAffectsMasteryEvidence: false,
            },
            authorOnlyUnderstandingExpected: "The wording, not numerical size or a proper-fraction preference, determines the order.",
        },
        {
            id: "T1",
            stage: "teach",
            authorOnlyPurpose: "Map the expressed quantity to the numerator and the named reference quantity to the denominator.",
            visual: {
                kind: "phrase_to_fraction_mapping",
                phrase: "blue as a fraction of orange",
                expressed: { id: "blue", value: 12, unit: "cm" },
                reference: { id: "orange", value: 8, unit: "cm" },
                fraction: f(12, 8),
                labelsAppearOnlyWhenSpoken: true,
            },
            ryanUtteranceIds: ["T1.1", "T1.2", "T1.3", "T1.4"],
            timeline: [
                cue("T1.CUE.1", "T1.1", "blue as a fraction of orange", "Trace the phrase from blue to orange without moving the numbers yet."),
                cue("T1.CUE.2", "T1.2", "numerator", "Glow blue and move 12 into the top field exactly when the role is named."),
                cue("T1.CUE.3", "T1.3", "denominator", "Bracket orange as the reference and move 8 into the bottom field."),
                cue("T1.CUE.4", "T1.4", "twelve eighths", "Resolve the complete fraction 12/8 and keep both measured ribbons visible."),
            ],
            interaction: { kind: "none" },
            authorOnlyUnderstandingExpected: "The first named quantity is being expressed; the second named quantity is the reference.",
        },
        {
            id: "T2",
            stage: "teach",
            authorOnlyPurpose: "Show that reversing the question reverses the fraction while the quantities remain unchanged.",
            visual: {
                kind: "reversible_phrase_comparison",
                quantities: [
                    { id: "blue", value: 12, unit: "cm" },
                    { id: "orange", value: 8, unit: "cm" },
                ],
                leftPhrase: "blue as a fraction of orange",
                leftFraction: f(12, 8),
                rightPhrase: "orange as a fraction of blue",
                rightFraction: f(8, 12),
                forbiddenTerm: "reciprocal",
            },
            ryanUtteranceIds: ["T2.1", "T2.2", "T2.3"],
            timeline: [
                cue("T2.CUE.1", "T2.1", "change the question", "Swap only the phrase order; keep both ribbon lengths unchanged."),
                cue("T2.CUE.2", "T2.2", "eight goes on top", "Move 8 to the numerator and move the reference bracket to blue before placing 12 underneath."),
                cue("T2.CUE.3", "T2.3", "Different fraction", "Show 12/8 and 8/12 side by side with above-one and below-one sense labels."),
            ],
            interaction: { kind: "none" },
            authorOnlyBoundaryNotes: [
                "Do not introduce reciprocal terminology; FRA-26 owns that concept.",
            ],
        },
        {
            id: "T3",
            stage: "teach",
            authorOnlyPurpose: "Separate the named reference group from the automatic part-over-total habit.",
            visual: {
                kind: "counter_groups",
                groups: [
                    { id: "teal", count: 7, selectedCue: "outline_and_colour" },
                    { id: "gold", count: 4, selectedCue: "outline_and_colour" },
                ],
                total: 11,
                comparisonQuestion: { phrase: "teal as a fraction of gold", fraction: f(7, 4) },
                wholeSetQuestion: { phrase: "teal as a fraction of all counters", fraction: f(7, 11) },
                totalHiddenUntilNamed: true,
            },
            ryanUtteranceIds: ["T3.1", "T3.2", "T3.3", "T3.4"],
            timeline: [
                cue("T3.CUE.1", "T3.1", "seven teal and four gold", "Reveal exactly seven teal counters and four gold counters in two readable groups."),
                cue("T3.CUE.2", "T3.2", "gold is the reference", "Bracket only the four gold counters and resolve 7/4."),
                cue("T3.CUE.3", "T3.3", "total, eleven", "Reveal total = 11 only now; do not let it replace the gold reference."),
                cue("T3.CUE.4", "T3.4", "seven elevenths", "Change the wording to all counters and resolve the distinct 7/11 comparison."),
            ],
            interaction: { kind: "none" },
        },
        {
            id: "T4",
            stage: "teach",
            authorOnlyPurpose: "Sequence comparison order before optional simplest-form work.",
            visual: {
                kind: "measured_ribbons_with_reduction",
                quantities: [
                    { id: "green", value: 15, unit: "cm", semanticRole: "expressed" },
                    { id: "purple", value: 20, unit: "cm", semanticRole: "reference" },
                ],
                rawFraction: f(15, 20),
                simplifyBy: 5,
                simplestFraction: f(3, 4),
                promptQualifierInitiallyHidden: true,
            },
            ryanUtteranceIds: ["T4.1", "T4.2", "T4.3", "T4.4"],
            timeline: [
                cue("T4.CUE.1", "T4.1", "fifteen centimetres", "Reveal proportional 15 cm and 20 cm ribbons on one scale."),
                cue("T4.CUE.2", "T4.2", "fifteen twentieths", "Build 15/20 before any simplifying factor appears."),
                cue("T4.CUE.3", "T4.3", "in simplest form", "Reveal the qualifier only when spoken; keep the fraction order fixed."),
                cue("T4.CUE.4", "T4.4", "top and bottom by five", "Apply division by 5 to both fields simultaneously and resolve 3/4."),
            ],
            interaction: { kind: "none" },
            authorOnlyBoundaryNotes: [
                "FRA-10 owns simplification method. FRA-15 only decides when to apply it after building the comparison.",
            ],
        },
        {
            id: "T5",
            stage: "teach",
            authorOnlyPurpose: "Use the position relative to one as a check without turning it into a flip rule.",
            visual: {
                kind: "side_of_one_triptych",
                panels: [
                    { relation: "first_smaller", fraction: f(4, 10), comparison: "<1" },
                    { relation: "equal", fraction: f(7, 7), comparison: "=1" },
                    { relation: "first_larger", fraction: f(12, 8), comparison: ">1" },
                ],
                appearSequentially: true,
            },
            ryanUtteranceIds: ["T5.1", "T5.2", "T5.3"],
            timeline: [
                cue("T5.CUE.1", "T5.1", "first quantity with the reference", "Show only the first comparison frame and the reference marker."),
                cue("T5.CUE.2", "T5.2", "first is smaller", "Reveal smaller, equal and larger panels in speech order, then reveal each relation to 1."),
                cue("T5.CUE.3", "T5.3", "not a rule for changing it", "Lock the wording order and visually cross out any flip action."),
            ],
            interaction: { kind: "none" },
        },
        {
            id: "HANDOFF",
            stage: "teach",
            authorOnlyPurpose: "Hand responsibility for the ordering decision to the learner.",
            visual: {
                kind: "reusable_prompt_card",
                prompts: [
                    "Which quantity is being expressed?",
                    "Which quantity is the reference?",
                ],
                stageLabelTransition: ["Learn the idea", "Try it with me"],
            },
            ryanUtteranceIds: ["HANDOFF.1", "HANDOFF.2"],
            timeline: [
                cue("HANDOFF.CUE.1", "HANDOFF.1", "quantity named first", "Emphasise first -> numerator and reference -> denominator without showing new values."),
                cue("HANDOFF.CUE.2", "HANDOFF.2", "support starts to fade", "Change the stage label to Try it with me and enable the first response control."),
            ],
            interaction: { kind: "none" },
        },
    ];
    exports.FRA15_QUESTIONS = [
        {
            id: "G1",
            stage: "guided",
            authorOnlyAssessmentIntent: "context_to_fraction_order",
            prompt: "Express the number of teal counters as a fraction of the number of gold counters.",
            source: {
                kind: "two_group_comparison",
                expressed: { id: "teal", count: 9 },
                reference: { id: "gold", count: 6 },
                total: 15,
                rawFraction: f(9, 6),
            },
            visual: {
                kind: "counter_groups_with_role_slots",
                numeratorLabel: "Quantity being expressed",
                denominatorLabel: "Reference quantity",
                showLabelsBeforeSubmit: true,
                counterCountsMustMatchSource: true,
            },
            response: { kind: "fraction_input", submitLabel: "Submit", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(9, 6),
                canonicalFraction: f(3, 2),
                requiredForm: "exact_equivalent",
            },
            policy: guidedPolicy,
            preSubmitUtteranceIds: ["G1.PRE"],
            hintUtteranceIds: [],
            feedback: feedback(["G1.CORRECT"], ["G1.INCORRECT.DEFAULT"], [
                { id: "G1-ORDER", response: f(6, 9), family: "order", classificationRule: "tentative_until_repeat_or_discriminator", utteranceIds: ["G1.INCORRECT.ORDER"] },
                { id: "G1-TOTAL", response: f(9, 15), family: "total", classificationRule: "strong_discriminating_evidence", utteranceIds: ["G1.INCORRECT.TOTAL"] },
            ]),
            workedCheck: null,
            next: "G2",
            freshnessKey: "counters-teal9-gold6-direct",
        },
        {
            id: "G2",
            stage: "guided",
            authorOnlyAssessmentIntent: "order_then_requested_simplest_form",
            prompt: "Express the shorter board as a fraction of the longer board, in simplest form.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "shorter_board", value: 14, unit: "cm" },
                reference: { id: "longer_board", value: 21, unit: "cm" },
                rawFraction: f(14, 21),
            },
            visual: {
                kind: "measured_boards_with_build_then_simplify_slots",
                proportionalLengths: true,
                showRoleSequenceCue: true,
                noSimplifyingFactorBeforeAttempt: true,
            },
            response: { kind: "fraction_input", submitLabel: "Check", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(14, 21),
                canonicalFraction: f(2, 3),
                requiredForm: "simplest",
            },
            policy: guidedPolicy,
            preSubmitUtteranceIds: ["G2.PRE"],
            hintUtteranceIds: [],
            feedback: feedback(["G2.CORRECT"], ["G2.INCORRECT.DEFAULT"], [
                { id: "G2-ORDER", responses: [f(21, 14), f(3, 2)], family: "order", classificationRule: "tentative_until_repeat_or_discriminator", utteranceIds: ["G2.INCORRECT.ORDER"] },
                { id: "G2-TOTAL", response: f(14, 35), family: "total", classificationRule: "strong_discriminating_evidence", utteranceIds: ["G2.INCORRECT.TOTAL"] },
                { id: "G2-FORM", response: f(14, 21), family: "form", classificationRule: "direct_form_evidence", utteranceIds: ["G2.INCORRECT.FORM"] },
            ]),
            workedCheck: null,
            next: "GUIDED_ROUTE_DECISION",
            freshnessKey: "boards14-21-simplest",
        },
        {
            id: "F1",
            stage: "faded",
            authorOnlyAssessmentIntent: "sentence_slots_with_light_structure",
            prompt: "Express File A's size as a fraction of File B's size.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "file_a", value: 16, unit: "MB" },
                reference: { id: "file_b", value: 20, unit: "MB" },
                rawFraction: f(16, 20),
            },
            visual: {
                kind: "file_cards_with_first_reference_slots",
                labels: ["First named quantity", "Reference quantity"],
                showLabelsBeforeSubmit: true,
            },
            response: { kind: "fraction_input", submitLabel: "Submit", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(16, 20),
                canonicalFraction: f(4, 5),
                requiredForm: "exact_equivalent",
            },
            policy: optionalHintPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: ["F1.HINT"],
            feedback: feedback(["F1.CORRECT"], ["F1.INCORRECT.DEFAULT"], [
                { id: "F1-ORDER", response: f(20, 16), family: "order", classificationRule: "tentative_until_repeat_or_discriminator", utteranceIds: ["F1.INCORRECT.ORDER"] },
                { id: "F1-COMBINE-A", response: f(36, 20), family: "combine", classificationRule: "strong_discriminating_evidence", utteranceIds: ["F1.INCORRECT.COMBINE"] },
                { id: "F1-COMBINE-B", response: f(16, 36), family: "total", classificationRule: "strong_discriminating_evidence", utteranceIds: ["F1.INCORRECT.COMBINE"] },
            ]),
            workedCheck: null,
            next: "F2",
            freshnessKey: "files16-20-direct",
        },
        {
            id: "F2",
            stage: "faded",
            authorOnlyAssessmentIntent: "named_reference_vs_total_concept_check",
            prompt: "Express the number of blue counters as a fraction of the number of orange counters.",
            source: {
                kind: "two_group_comparison",
                expressed: { id: "blue", count: 7 },
                reference: { id: "orange", count: 4 },
                total: 11,
                rawFraction: f(7, 4),
            },
            visual: { kind: "counter_groups", counterCountsMustMatchSource: true },
            response: {
                kind: "single_choice",
                submitLabel: "Submit",
                options: [
                    { id: "A", label: "7/4", fraction: f(7, 4) },
                    { id: "B", label: "4/7", fraction: f(4, 7) },
                    { id: "C", label: "7/11", fraction: f(7, 11) },
                    { id: "D", label: "11/4", fraction: f(11, 4) },
                ],
            },
            answer: { kind: "choice", optionId: "A" },
            policy: optionalHintPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: ["F2.HINT"],
            feedback: feedback(["F2.CORRECT"], ["F2.INCORRECT.DEFAULT"], [
                { id: "F2-ORDER", optionId: "B", family: "order", classificationRule: "tentative_until_repeat_or_discriminator", utteranceIds: ["F2.INCORRECT.ORDER"] },
                { id: "F2-TOTAL", optionId: "C", family: "total", classificationRule: "strong_discriminating_evidence", utteranceIds: ["F2.INCORRECT.TOTAL"] },
                { id: "F2-COMBINE", optionId: "D", family: "combine", classificationRule: "strong_discriminating_evidence", utteranceIds: ["F2.INCORRECT.COMBINE"] },
            ]),
            workedCheck: null,
            next: "I1",
            freshnessKey: "counters-blue7-orange4-choice",
        },
        {
            id: "I1",
            stage: "independent",
            authorOnlyAssessmentIntent: "context_above_one_then_simplest_form",
            prompt: "Express the local-train time as a fraction of the express-train time, in simplest form.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "local_train", value: 48, unit: "min" },
                reference: { id: "express_train", value: 32, unit: "min" },
                rawFraction: f(48, 32),
            },
            visual: { kind: "train_time_cards", showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(48, 32),
                canonicalFraction: f(3, 2),
                requiredForm: "simplest",
            },
            policy: optionalHintPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: ["I1.HINT"],
            feedback: feedback(["I1.CORRECT"], ["I1.INCORRECT.DEFAULT"], [
                { id: "I1-ORDER", response: f(2, 3), family: "order", candidateFamilies: ["order", "smallness_bias"], classificationRule: "tentative_until_reason_or_repeat", utteranceIds: ["I1.INCORRECT.ORDER"] },
                { id: "I1-COMBINE", response: f(80, 32), family: "combine", classificationRule: "strong_discriminating_evidence", utteranceIds: ["I1.INCORRECT.COMBINE"] },
                { id: "I1-FORM", response: f(48, 32), family: "form", classificationRule: "direct_form_evidence", utteranceIds: ["I1.INCORRECT.FORM"] },
            ]),
            workedCheck: null,
            next: "I2",
            freshnessKey: "trains48-32-simplest",
        },
        {
            id: "I2",
            stage: "independent",
            authorOnlyAssessmentIntent: "reverse_direction_matching_transfer",
            prompt: "Match each statement to its fraction in simplest form.",
            source: {
                kind: "bidirectional_pair",
                values: { P: 18, Q: 24 },
                mappings: [
                    { phrase: "P as a fraction of Q", answer: f(3, 4) },
                    { phrase: "Q as a fraction of P", answer: f(4, 3) },
                ],
            },
            visual: {
                kind: "matching_cards",
                statements: ["P as a fraction of Q", "Q as a fraction of P"],
                fractionCards: [f(3, 4), f(4, 3), f(7, 12)],
                allowCorrectionBeforeSubmit: true,
            },
            response: { kind: "matching", submitLabel: "Submit" },
            answer: {
                kind: "matching",
                pairs: {
                    "P as a fraction of Q": "3/4",
                    "Q as a fraction of P": "4/3",
                },
            },
            policy: optionalHintPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: ["I2.HINT"],
            feedback: feedback(["I2.CORRECT"], ["I2.INCORRECT.DEFAULT"], [
                { id: "I2-SWAPPED", response: "both_mappings_swapped", family: "order", classificationRule: "strong_order_evidence", utteranceIds: ["I2.INCORRECT.SWAPPED"] },
                { id: "I2-PARTIAL", response: "one_mapping_wrong", family: "unknown", classificationRule: "allow_interface_correction_before_classification", utteranceIds: ["I2.INCORRECT.PARTIAL"] },
            ]),
            workedCheck: null,
            next: "INDEPENDENT_ROUTE_DECISION",
            freshnessKey: "matching-P18-Q24-bidirectional",
        },
    ];
    exports.FRA15_FINAL_QUESTIONS = [
        {
            id: "M1",
            stage: "final",
            authorOnlyAssessmentIntent: "direct_order_plus_requested_form",
            prompt: "Express 21 as a fraction of 28, in simplest form.",
            source: {
                kind: "two_numbers",
                expressed: { value: 21 },
                reference: { value: 28 },
                rawFraction: f(21, 28),
            },
            visual: { kind: "text_only_fraction_input", showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(21, 28),
                canonicalFraction: f(3, 4),
                requiredForm: "simplest",
            },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["M1.CORRECT"], ["M1.INCORRECT.DEFAULT"], [
                { id: "M1-ORDER", response: f(4, 3), family: "order", classificationRule: "tentative_until_repeat_or_discriminator", utteranceIds: ["M1.INCORRECT.ORDER"] },
                { id: "M1-FORM", response: f(21, 28), family: "form", classificationRule: "direct_form_evidence", utteranceIds: ["M1.INCORRECT.FORM"] },
            ]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["M1.WORK.1", "M1.WORK.2", "M1.WORK.3"],
                visibleSteps: [
                    "21 is named first -> numerator.",
                    "28 is the reference -> denominator.",
                    "21/28 ÷ 7/7 = 3/4.",
                ],
                authorOnlyVisualReveal: [
                    "Reveal the role labels only after answerLocked = true.",
                    "Reveal division by 7 on numerator and denominator together.",
                ],
            },
            next: "M2",
            evidenceFamily: "direct_and_form",
            freshnessKey: "final-direct21-28-simplest",
        },
        {
            id: "M2",
            stage: "final",
            authorOnlyAssessmentIntent: "named_reference_not_total",
            prompt: "Express the number of yellow counters as a fraction of the number of purple counters.",
            source: {
                kind: "two_group_comparison",
                expressed: { id: "yellow", count: 6 },
                reference: { id: "purple", count: 9 },
                total: 15,
                rawFraction: f(6, 9),
            },
            visual: {
                kind: "counter_groups",
                counterCountsMustMatchSource: true,
                showTotalBeforeSubmit: false,
                accessibleGroupsExposeCountableItems: true,
            },
            response: { kind: "fraction_input", submitLabel: "Submit answer", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(6, 9),
                canonicalFraction: f(2, 3),
                requiredForm: "exact_equivalent",
            },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["M2.CORRECT"], ["M2.INCORRECT.DEFAULT"], [
                { id: "M2-ORDER", response: f(9, 6), family: "order", classificationRule: "tentative_until_repeat_or_discriminator", utteranceIds: ["M2.INCORRECT.ORDER"] },
                { id: "M2-TOTAL", response: f(6, 15), family: "total", classificationRule: "strong_discriminating_evidence", utteranceIds: ["M2.INCORRECT.TOTAL"] },
            ]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["M2.WORK.1", "M2.WORK.2", "M2.WORK.3"],
                visibleSteps: [
                    "Yellow count = 6.",
                    "Purple reference count = 9.",
                    "Direct answer 6/9; 2/3 accepted as an exact equivalent.",
                ],
                authorOnlyVisualReveal: [
                    "Bracket yellow and purple separately after lock.",
                    "Reveal total 15 only to explain why 6/15 is not the requested comparison.",
                ],
            },
            next: "M3",
            evidenceFamily: "reference_not_total",
            freshnessKey: "final-counters-yellow6-purple9",
        },
        {
            id: "M3",
            stage: "final",
            authorOnlyAssessmentIntent: "preserve_order_above_one_and_simplify",
            prompt: "Route A is 35 km. Route B is 20 km. Express Route A as a fraction of Route B, in simplest form.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "route_a", value: 35, unit: "km" },
                reference: { id: "route_b", value: 20, unit: "km" },
                rawFraction: f(35, 20),
            },
            visual: {
                kind: "route_length_bars",
                proportionalLengths: true,
                showRoleLabelsBeforeSubmit: false,
                sharedScale: true,
            },
            response: { kind: "fraction_input", submitLabel: "Submit answer", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(35, 20),
                canonicalFraction: f(7, 4),
                requiredForm: "simplest",
            },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["M3.CORRECT"], ["M3.INCORRECT.DEFAULT"], [
                { id: "M3-ORDER", response: f(4, 7), family: "order", candidateFamilies: ["order", "smallness_bias"], classificationRule: "tentative_until_reason_or_repeat", utteranceIds: ["M3.INCORRECT.ORDER"] },
                { id: "M3-FORM", response: f(35, 20), family: "form", classificationRule: "direct_form_evidence", utteranceIds: ["M3.INCORRECT.FORM"] },
            ]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["M3.WORK.1", "M3.WORK.2", "M3.WORK.3"],
                visibleSteps: [
                    "Route A over Route B = 35/20.",
                    "35/20 ÷ 5/5 = 7/4.",
                    "Route A is longer, so the answer is above 1.",
                ],
                authorOnlyVisualReveal: [
                    "Keep Route A visibly longer throughout the worked check.",
                    "Do not shrink or reorder the bars during simplification.",
                ],
            },
            next: "M4",
            evidenceFamily: "above_one_reasoning",
            freshnessKey: "final-routes35-20-simplest",
        },
        {
            id: "M4",
            stage: "final",
            authorOnlyAssessmentIntent: "equal_quantities_equal_one",
            prompt: "Tank A and Tank B each hold 18 litres. Express Tank A's capacity as a fraction of Tank B's capacity.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "tank_a", value: 18, unit: "L" },
                reference: { id: "tank_b", value: 18, unit: "L" },
                rawFraction: f(18, 18),
            },
            visual: {
                kind: "equal_capacity_tanks",
                equalFillGeometry: true,
                showRoleLabelsBeforeSubmit: false,
            },
            response: { kind: "fraction_input", submitLabel: "Submit answer", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(18, 18),
                canonicalFraction: f(1, 1),
                requiredForm: "one_of_authored_exact_forms",
                acceptedExactForms: [f(18, 18), f(1, 1)],
            },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["M4.CORRECT"], ["M4.INCORRECT.DEFAULT"], [
                { id: "M4-TOTAL", response: f(18, 36), family: "total", classificationRule: "strong_discriminating_evidence", utteranceIds: ["M4.INCORRECT.TOTAL"] },
            ]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["M4.WORK.1", "M4.WORK.2"],
                visibleSteps: [
                    "Tank A over Tank B = 18/18.",
                    "Equal quantities give a value of 1.",
                ],
                authorOnlyVisualReveal: [
                    "Reveal Tank B as the denominator reference after lock.",
                    "Show 18/18 = 1 without replacing the two equal tank visuals.",
                ],
            },
            next: "M5",
            evidenceFamily: "equal_to_one",
            freshnessKey: "final-tanks18-18-equal",
        },
        {
            id: "M5",
            stage: "final",
            authorOnlyAssessmentIntent: "explicit_unit_alignment_then_order_and_form",
            prompt: "The first cable is 120 cm. The second is 2 m. Use the conversion shown. Express the first as a fraction of the second, in simplest form.",
            source: {
                kind: "explicit_conversion_comparison",
                expressed: { id: "first_cable", value: 120, unit: "cm", comparableValue: 120, comparableUnit: "cm" },
                reference: { id: "second_cable", value: 2, unit: "m", comparableValue: 200, comparableUnit: "cm" },
                suppliedConversion: "2 m = 200 cm",
                rawFraction: f(120, 200),
            },
            visual: {
                kind: "cable_lengths_with_conversion_card",
                sharedComparableScale: true,
                conversionCardVisibleBeforeSubmit: true,
                showFractionRolesBeforeSubmit: false,
            },
            response: { kind: "fraction_input", submitLabel: "Submit answer", editableFields: ["numerator", "denominator"] },
            answer: {
                kind: "fraction",
                rawFraction: f(120, 200),
                canonicalFraction: f(3, 5),
                requiredForm: "simplest",
            },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["M5.CORRECT"], ["M5.INCORRECT.DEFAULT"], [
                { id: "M5-UNITS", response: f(120, 2), family: "units", classificationRule: "strong_discriminating_evidence", utteranceIds: ["M5.INCORRECT.UNITS"] },
                { id: "M5-ORDER-UNITS", response: f(2, 120), family: "units", candidateFamilies: ["units", "order"], classificationRule: "strong_units_plus_order_evidence", utteranceIds: ["M5.INCORRECT.ORDER_UNITS"] },
                { id: "M5-ORDER", response: f(5, 3), family: "order", classificationRule: "tentative_until_repeat_or_discriminator", utteranceIds: ["M5.INCORRECT.ORDER"] },
                { id: "M5-FORM", response: f(120, 200), family: "form", classificationRule: "direct_form_evidence", utteranceIds: ["M5.INCORRECT.FORM"] },
            ]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["M5.WORK.1", "M5.WORK.2", "M5.WORK.3"],
                visibleSteps: [
                    "2 m = 200 cm.",
                    "First cable over second cable = 120/200.",
                    "120/200 ÷ 40/40 = 3/5.",
                ],
                authorOnlyVisualReveal: [
                    "Animate only the supplied conversion; do not teach a general conversion algorithm.",
                    "Build the fraction only after both labels read cm.",
                ],
            },
            next: "FINAL_ROUTE_DECISION",
            evidenceFamily: "explicit_units",
            freshnessKey: "final-cables120cm-2m-simplest",
        },
    ];
    exports.FRA15_CONFIRMATION_QUESTIONS = [
        {
            id: "C-ORDER",
            stage: "confirmation",
            family: "order",
            authorOnlyPurpose: "Fresh no-hint confirmation after supported or ambiguous order evidence.",
            prompt: "B is 20 units and A is 14 units. Express B as a fraction of A, in simplest form.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "B", value: 20, unit: "units" },
                reference: { id: "A", value: 14, unit: "units" },
                rawFraction: f(20, 14),
            },
            visual: { kind: "labelled_length_bars", proportionalLengths: true, showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(20, 14), canonicalFraction: f(10, 7), requiredForm: "simplest" },
            policy: confirmationPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["C-ORDER.CORRECT"], ["C-ORDER.INCORRECT"]),
            workedCheck: null,
            freshnessKey: "confirm-order20-14",
        },
        {
            id: "C-TOTAL",
            stage: "confirmation",
            family: "total",
            authorOnlyPurpose: "Fresh no-hint confirmation that the named subgroup, not the total, is the reference.",
            prompt: "Express 5 green counters as a fraction of 8 orange counters.",
            source: {
                kind: "two_group_comparison",
                expressed: { id: "green", count: 5 },
                reference: { id: "orange", count: 8 },
                total: 13,
                rawFraction: f(5, 8),
            },
            visual: { kind: "counter_groups", counterCountsMustMatchSource: true, showTotalBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(5, 8), canonicalFraction: f(5, 8), requiredForm: "exact_equivalent" },
            policy: confirmationPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["C-TOTAL.CORRECT"], ["C-TOTAL.INCORRECT"]),
            workedCheck: null,
            freshnessKey: "confirm-total-green5-orange8",
        },
        {
            id: "C-COMBINE",
            stage: "confirmation",
            family: "combine",
            authorOnlyPurpose: "Fresh no-hint confirmation that comparison does not add the two quantities.",
            prompt: "One journey takes 11 minutes and another takes 7 minutes. Express 11 minutes as a fraction of 7 minutes.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "first_journey", value: 11, unit: "min" },
                reference: { id: "second_journey", value: 7, unit: "min" },
                rawFraction: f(11, 7),
            },
            visual: { kind: "journey_time_cards", showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(11, 7), canonicalFraction: f(11, 7), requiredForm: "exact_equivalent" },
            policy: confirmationPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["C-COMBINE.CORRECT"], ["C-COMBINE.INCORRECT"]),
            workedCheck: null,
            freshnessKey: "confirm-combine11-7",
        },
        {
            id: "C-SMALL",
            stage: "confirmation",
            family: "smallness_bias",
            authorOnlyPurpose: "Fresh no-hint confirmation that a valid result may be above one.",
            prompt: "A long board is 16 cm and a short board is 10 cm. Express the long board as a fraction of the short board, in simplest form.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "long_board", value: 16, unit: "cm" },
                reference: { id: "short_board", value: 10, unit: "cm" },
                rawFraction: f(16, 10),
            },
            visual: { kind: "measured_boards", proportionalLengths: true, sharedScale: true, showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(16, 10), canonicalFraction: f(8, 5), requiredForm: "simplest" },
            policy: confirmationPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["C-SMALL.CORRECT"], ["C-SMALL.INCORRECT"]),
            workedCheck: null,
            freshnessKey: "confirm-smallness16-10",
        },
        {
            id: "C-FORM",
            stage: "confirmation",
            family: "form",
            authorOnlyPurpose: "Fresh no-hint confirmation of simplest form after correct ordering.",
            prompt: "Express 27 as a fraction of 45, in simplest form.",
            source: {
                kind: "two_numbers",
                expressed: { value: 27 },
                reference: { value: 45 },
                rawFraction: f(27, 45),
            },
            visual: { kind: "text_only_fraction_input", showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(27, 45), canonicalFraction: f(3, 5), requiredForm: "simplest" },
            policy: confirmationPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["C-FORM.CORRECT"], ["C-FORM.INCORRECT"]),
            workedCheck: null,
            freshnessKey: "confirm-form27-45",
        },
        {
            id: "C-UNITS",
            stage: "confirmation",
            family: "units",
            authorOnlyPurpose: "Fresh no-hint confirmation that units align before comparison.",
            prompt: "A strip is 75 cm. A reference strip is 1.5 m. Use 1.5 m = 150 cm. Express the first strip as a fraction of the reference strip, in simplest form.",
            source: {
                kind: "explicit_conversion_comparison",
                expressed: { id: "strip", value: 75, unit: "cm", comparableValue: 75, comparableUnit: "cm" },
                reference: { id: "reference_strip", value: 1.5, unit: "m", comparableValue: 150, comparableUnit: "cm" },
                suppliedConversion: "1.5 m = 150 cm",
                rawFraction: f(75, 150),
            },
            visual: { kind: "measured_strips_with_conversion_card", sharedComparableScale: true, showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(75, 150), canonicalFraction: f(1, 2), requiredForm: "simplest" },
            policy: confirmationPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["C-UNITS.CORRECT"], ["C-UNITS.INCORRECT"]),
            workedCheck: null,
            freshnessKey: "confirm-units75cm-1.5m",
        },
    ];
    exports.FRA15_REPAIR_PROFILES = [
        {
            id: "R-ORDER",
            family: "order",
            authorOnlyPurpose: "Restore first-named quantity over reference quantity without treating numerical size as the ordering rule.",
            triggerRule: "Use after repeated reciprocal placement or a clean discriminating response. One reciprocal alone remains tentative.",
            ryanUtteranceIds: ["R-ORDER.1", "R-ORDER.2", "R-ORDER.3"],
            visual: {
                kind: "drag_values_into_fraction_then_simplify",
                phrase: "18 as a fraction of 12",
                expressedValue: 18,
                referenceValue: 12,
                rawFraction: f(18, 12),
                simplestFraction: f(3, 2),
                simplifyControlHiddenUntilOrderCorrect: true,
            },
            timeline: [
                cue("R-ORDER.CUE.1", "R-ORDER.1", "order has flipped", "Show 18 and 12 in reversed slots, then return both chips to neutral positions."),
                cue("R-ORDER.CUE.2", "R-ORDER.2", "eighteen as a fraction of twelve", "Move 18 to the numerator and 12 to the denominator in phrase order."),
                cue("R-ORDER.CUE.3", "R-ORDER.3", "three halves", "Reveal the simplify control and resolve 18/12 to 3/2."),
            ],
            supportedInteraction: {
                kind: "drag_two_value_chips",
                acceptedPlacement: { numerator: 18, denominator: 12 },
                doNotRevealSimplifyBeforePlacement: true,
            },
            freshCheck: {
                id: "R-ORDER-CHECK",
                stage: "repair_check",
                prompt: "Express 22 as a fraction of 16, in simplest form.",
                source: { kind: "two_numbers", expressed: { value: 22 }, reference: { value: 16 }, rawFraction: f(22, 16) },
                visual: { kind: "text_only_fraction_input", showRoleLabelsBeforeSubmit: false },
                response: { kind: "fraction_input", submitLabel: "Submit answer" },
                answer: { kind: "fraction", rawFraction: f(22, 16), canonicalFraction: f(11, 8), requiredForm: "simplest" },
                policy: confirmationPolicy,
                preSubmitUtteranceIds: [],
                hintUtteranceIds: [],
                feedback: feedback(["R-ORDER.CHECK.CORRECT"], ["R-ORDER.CHECK.INCORRECT"]),
                workedCheck: null,
                freshnessKey: "repair-order22-16",
            },
            returnRule: "If order is correct but the result is not in simplest form, route to R-FORM rather than replaying R-ORDER.",
        },
        {
            id: "R-TOTAL",
            family: "total",
            authorOnlyPurpose: "Stop automatic part-over-whole use when the prompt names another subgroup as the reference.",
            triggerRule: "Use after a clear A/(A+B) response on a named-subgroup item or after repeated total-denominator evidence.",
            ryanUtteranceIds: ["R-TOTAL.1", "R-TOTAL.2"],
            visual: {
                kind: "counter_group_reference_contrast",
                groups: [
                    { id: "black", count: 6 },
                    { id: "white", count: 4 },
                ],
                total: 10,
                rejectedFraction: f(6, 10),
                resolvedFraction: f(6, 4),
                totalLabelAppearsOnlyWhenDiscussed: true,
            },
            timeline: [
                cue("R-TOTAL.CUE.1", "R-TOTAL.1", "whole set", "Outline all ten counters briefly, then fade the whole-set outline."),
                cue("R-TOTAL.CUE.2", "R-TOTAL.2", "White is the denominator", "Bracket only the four white counters and replace 6/10 with 6/4."),
            ],
            supportedInteraction: {
                kind: "choose_reference_group",
                options: ["white_group", "whole_set"],
                acceptedOption: "white_group",
            },
            freshCheck: {
                id: "R-TOTAL-CHECK",
                stage: "repair_check",
                prompt: "Express 4 lime counters as a fraction of 7 navy counters.",
                source: {
                    kind: "two_group_comparison",
                    expressed: { id: "lime", count: 4 },
                    reference: { id: "navy", count: 7 },
                    total: 11,
                    rawFraction: f(4, 7),
                },
                visual: { kind: "counter_groups", counterCountsMustMatchSource: true, showTotalBeforeSubmit: false },
                response: { kind: "fraction_input", submitLabel: "Submit answer" },
                answer: { kind: "fraction", rawFraction: f(4, 7), canonicalFraction: f(4, 7), requiredForm: "exact_equivalent" },
                policy: confirmationPolicy,
                preSubmitUtteranceIds: [],
                hintUtteranceIds: [],
                feedback: feedback(["R-TOTAL.CHECK.CORRECT"], ["R-TOTAL.CHECK.INCORRECT"]),
                workedCheck: null,
                freshnessKey: "repair-total-lime4-navy7",
            },
        },
        {
            id: "R-COMBINE",
            family: "combine",
            authorOnlyPurpose: "Keep the two original quantities separate instead of adding them into a new quantity.",
            triggerRule: "Use after a clear A+B construction or repeated evidence that comparison is being replaced by addition.",
            ryanUtteranceIds: ["R-COMBINE.1", "R-COMBINE.2"],
            visual: {
                kind: "two_quantities_with_rejected_sum",
                expressedValue: 13,
                referenceValue: 8,
                rejectedCombinedValue: 21,
                resolvedFraction: f(13, 8),
                crossOutRejectedSum: true,
            },
            timeline: [
                cue("R-COMBINE.CUE.1", "R-COMBINE.1", "Nothing is being added", "Show 13 and 8 as separate cards and cross out the join operation."),
                cue("R-COMBINE.CUE.2", "R-COMBINE.2", "two original quantities", "Move 13 and 8 directly into numerator and denominator while 21 fades."),
            ],
            supportedInteraction: {
                kind: "select_values_for_fraction",
                candidateValues: [13, 8, 21],
                acceptedPlacement: { numerator: 13, denominator: 8 },
            },
            freshCheck: {
                id: "R-COMBINE-CHECK",
                stage: "repair_check",
                prompt: "One journey takes 17 minutes and another takes 9 minutes. Express 17 minutes as a fraction of 9 minutes.",
                source: {
                    kind: "two_measured_quantities",
                    expressed: { id: "first_journey", value: 17, unit: "min" },
                    reference: { id: "second_journey", value: 9, unit: "min" },
                    rawFraction: f(17, 9),
                },
                visual: { kind: "journey_time_cards", showRoleLabelsBeforeSubmit: false },
                response: { kind: "fraction_input", submitLabel: "Submit answer" },
                answer: { kind: "fraction", rawFraction: f(17, 9), canonicalFraction: f(17, 9), requiredForm: "exact_equivalent" },
                policy: confirmationPolicy,
                preSubmitUtteranceIds: [],
                hintUtteranceIds: [],
                feedback: feedback(["R-COMBINE.CHECK.CORRECT"], ["R-COMBINE.CHECK.INCORRECT"]),
                workedCheck: null,
                freshnessKey: "repair-combine17-9",
            },
        },
        {
            id: "R-SMALL",
            family: "smallness_bias",
            authorOnlyPurpose: "Make a greater-than-one comparison valid and visible without collapsing it into generic order repair.",
            triggerRule: "Use only after reason evidence or a repeated pattern explicitly shows the learner is flipping to keep the fraction proper.",
            ryanUtteranceIds: ["R-SMALL.1", "R-SMALL.2", "R-SMALL.3"],
            visual: {
                kind: "longer_first_bar_comparison",
                expressed: { value: 15, unit: "units" },
                reference: { value: 10, unit: "units" },
                rawFraction: f(15, 10),
                simplestFraction: f(3, 2),
                maintainProportionalLengthDuringSimplification: true,
            },
            timeline: [
                cue("R-SMALL.CUE.1", "R-SMALL.1", "does not have to be below one", "Keep the first bar visibly longer and remove any proper-fraction warning."),
                cue("R-SMALL.CUE.2", "R-SMALL.2", "numerator should be larger", "Map 15 to the numerator and 10 to the denominator without swapping."),
                cue("R-SMALL.CUE.3", "R-SMALL.3", "three halves", "Simplify 15/10 to 3/2 while the visual length relation stays unchanged."),
            ],
            supportedInteraction: {
                kind: "choose_expected_side_of_one_then_build",
                expectedSide: "above_one",
                acceptedFraction: f(15, 10),
            },
            freshCheck: {
                id: "R-SMALL-CHECK",
                stage: "repair_check",
                prompt: "A long route is 20 km and a short route is 12 km. Express the long route as a fraction of the short route, in simplest form.",
                source: {
                    kind: "two_measured_quantities",
                    expressed: { id: "long_route", value: 20, unit: "km" },
                    reference: { id: "short_route", value: 12, unit: "km" },
                    rawFraction: f(20, 12),
                },
                visual: { kind: "route_length_bars", proportionalLengths: true, sharedScale: true, showRoleLabelsBeforeSubmit: false },
                response: { kind: "fraction_input", submitLabel: "Submit answer" },
                answer: { kind: "fraction", rawFraction: f(20, 12), canonicalFraction: f(5, 3), requiredForm: "simplest" },
                policy: confirmationPolicy,
                preSubmitUtteranceIds: [],
                hintUtteranceIds: [],
                feedback: feedback(["R-SMALL.CHECK.CORRECT"], ["R-SMALL.CHECK.INCORRECT"]),
                workedCheck: null,
                freshnessKey: "repair-smallness20-12",
            },
        },
        {
            id: "R-FORM",
            family: "form",
            authorOnlyPurpose: "Preserve a correct comparison order while completing the requested simplest form.",
            triggerRule: "Use when the submitted fraction is mathematically equivalent and correctly ordered but the prompt explicitly requires simplest form.",
            ryanUtteranceIds: ["R-FORM.1", "R-FORM.2"],
            visual: {
                kind: "fixed_order_reduction",
                rawFraction: f(18, 30),
                simplestFraction: f(3, 5),
                quantityOrderLocked: true,
            },
            timeline: [
                cue("R-FORM.CUE.1", "R-FORM.1", "order is right", "Lock 18 above 30 and mark the ordering step complete."),
                cue("R-FORM.CUE.2", "R-FORM.2", "do not swap the quantities", "Apply a shared reduction while blocking any drag or swap action."),
            ],
            supportedInteraction: {
                kind: "choose_shared_divisor",
                rawFraction: f(18, 30),
                acceptedSimplestFraction: f(3, 5),
                orderLocked: true,
            },
            freshCheck: {
                id: "R-FORM-CHECK",
                stage: "repair_check",
                prompt: "Express 24 as a fraction of 36, in simplest form.",
                source: { kind: "two_numbers", expressed: { value: 24 }, reference: { value: 36 }, rawFraction: f(24, 36) },
                visual: { kind: "text_only_fraction_input", showRoleLabelsBeforeSubmit: false },
                response: { kind: "fraction_input", submitLabel: "Submit answer" },
                answer: { kind: "fraction", rawFraction: f(24, 36), canonicalFraction: f(2, 3), requiredForm: "simplest" },
                policy: confirmationPolicy,
                preSubmitUtteranceIds: [],
                hintUtteranceIds: [],
                feedback: feedback(["R-FORM.CHECK.CORRECT"], ["R-FORM.CHECK.INCORRECT"]),
                workedCheck: null,
                freshnessKey: "repair-form24-36",
            },
        },
        {
            id: "R-UNITS",
            family: "units",
            authorOnlyPurpose: "Pause the comparison until an explicitly supplied unit conversion has aligned both quantities.",
            triggerRule: "Use after a fraction is built from mismatched units despite a visible supplied conversion.",
            ryanUtteranceIds: ["R-UNITS.1", "R-UNITS.2"],
            visual: {
                kind: "conversion_then_fraction",
                expressed: { value: 90, unit: "cm", comparableValue: 90, comparableUnit: "cm" },
                reference: { value: 1.5, unit: "m", comparableValue: 150, comparableUnit: "cm" },
                suppliedConversion: "1.5 m = 150 cm",
                rawFraction: f(90, 150),
                simplestFraction: f(3, 5),
                fractionBuilderDisabledUntilUnitsMatch: true,
            },
            timeline: [
                cue("R-UNITS.CUE.1", "R-UNITS.1", "units differ", "Show 90 cm and 1.5 m with the fraction builder disabled."),
                cue("R-UNITS.CUE.2", "R-UNITS.2", "conversion given on screen", "Apply only the supplied conversion, then enable the 90/150 fraction builder."),
            ],
            supportedInteraction: {
                kind: "apply_supplied_conversion_then_build",
                conversionChoice: "1.5 m = 150 cm",
                acceptedFraction: f(90, 150),
            },
            freshCheck: {
                id: "R-UNITS-CHECK",
                stage: "repair_check",
                prompt: "A cable is 80 cm. A reference cable is 1.2 m. Use 1.2 m = 120 cm. Express the first cable as a fraction of the reference cable, in simplest form.",
                source: {
                    kind: "explicit_conversion_comparison",
                    expressed: { id: "first_cable", value: 80, unit: "cm", comparableValue: 80, comparableUnit: "cm" },
                    reference: { id: "reference_cable", value: 1.2, unit: "m", comparableValue: 120, comparableUnit: "cm" },
                    suppliedConversion: "1.2 m = 120 cm",
                    rawFraction: f(80, 120),
                },
                visual: { kind: "cable_lengths_with_conversion_card", sharedComparableScale: true, showRoleLabelsBeforeSubmit: false },
                response: { kind: "fraction_input", submitLabel: "Submit answer" },
                answer: { kind: "fraction", rawFraction: f(80, 120), canonicalFraction: f(2, 3), requiredForm: "simplest" },
                policy: confirmationPolicy,
                preSubmitUtteranceIds: [],
                hintUtteranceIds: [],
                feedback: feedback(["R-UNITS.CHECK.CORRECT"], ["R-UNITS.CHECK.INCORRECT"]),
                workedCheck: null,
                freshnessKey: "repair-units80cm-1.2m",
            },
            authorOnlyBoundaryNotes: [
                "Do not teach a conversion algorithm. Use only the conversion explicitly provided in the item.",
            ],
        },
    ];
    exports.FRA15_RECOVERY_FINALS = [
        {
            id: "RF1",
            stage: "recovery_final",
            evidenceFamily: "direct_and_form",
            authorOnlyPurpose: "Fresh direct order and simplest-form evidence after a 0-2/5 final result.",
            prompt: "Express 32 as a fraction of 56, in simplest form.",
            source: { kind: "two_numbers", expressed: { value: 32 }, reference: { value: 56 }, rawFraction: f(32, 56) },
            visual: { kind: "text_only_fraction_input", showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(32, 56), canonicalFraction: f(4, 7), requiredForm: "simplest" },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["RF1.CORRECT"], ["RF1.INCORRECT"]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["RF1.WORK.1", "RF1.WORK.2"],
                visibleSteps: ["32/56", "32/56 ÷ 8/8 = 4/7"],
                authorOnlyVisualReveal: [],
            },
            freshnessKey: "recovery-direct32-56",
        },
        {
            id: "RF2",
            stage: "recovery_final",
            evidenceFamily: "reference_not_total",
            authorOnlyPurpose: "Fresh named-reference counter evidence after repair.",
            prompt: "Express 8 red counters as a fraction of 14 grey counters.",
            source: {
                kind: "two_group_comparison",
                expressed: { id: "red", count: 8 },
                reference: { id: "grey", count: 14 },
                total: 22,
                rawFraction: f(8, 14),
            },
            visual: { kind: "counter_groups", counterCountsMustMatchSource: true, showTotalBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(8, 14), canonicalFraction: f(4, 7), requiredForm: "exact_equivalent" },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["RF2.CORRECT"], ["RF2.INCORRECT"]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["RF2.WORK.1", "RF2.WORK.2"],
                visibleSteps: ["Red over grey = 8/14", "4/7 is an accepted equivalent"],
                authorOnlyVisualReveal: [],
            },
            freshnessKey: "recovery-counters-red8-grey14",
        },
        {
            id: "RF3",
            stage: "recovery_final",
            evidenceFamily: "above_one_reasoning",
            authorOnlyPurpose: "Fresh greater-than-one comparison and simplest-form evidence.",
            prompt: "A first route is 42 km and a reference route is 30 km. Express the first route as a fraction of the reference route, in simplest form.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "first_route", value: 42, unit: "km" },
                reference: { id: "reference_route", value: 30, unit: "km" },
                rawFraction: f(42, 30),
            },
            visual: { kind: "route_length_bars", proportionalLengths: true, sharedScale: true, showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(42, 30), canonicalFraction: f(7, 5), requiredForm: "simplest" },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["RF3.CORRECT"], ["RF3.INCORRECT"]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["RF3.WORK.1", "RF3.WORK.2"],
                visibleSteps: ["42/30", "42/30 ÷ 6/6 = 7/5 > 1"],
                authorOnlyVisualReveal: [],
            },
            freshnessKey: "recovery-routes42-30",
        },
        {
            id: "RF4",
            stage: "recovery_final",
            evidenceFamily: "equal_to_one",
            authorOnlyPurpose: "Fresh equal-quantity evidence.",
            prompt: "Two parcels each have a mass of 25 kg. Express the first parcel's mass as a fraction of the second parcel's mass.",
            source: {
                kind: "two_measured_quantities",
                expressed: { id: "first_parcel", value: 25, unit: "kg" },
                reference: { id: "second_parcel", value: 25, unit: "kg" },
                rawFraction: f(25, 25),
            },
            visual: { kind: "equal_mass_parcels", equalGeometry: true, showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: {
                kind: "fraction",
                rawFraction: f(25, 25),
                canonicalFraction: f(1, 1),
                requiredForm: "one_of_authored_exact_forms",
                acceptedExactForms: [f(25, 25), f(1, 1)],
            },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["RF4.CORRECT"], ["RF4.INCORRECT"]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["RF4.WORK.1", "RF4.WORK.2"],
                visibleSteps: ["25/25", "Equal quantities give 1"],
                authorOnlyVisualReveal: [],
            },
            freshnessKey: "recovery-parcels25-25",
        },
        {
            id: "RF5",
            stage: "recovery_final",
            evidenceFamily: "explicit_units",
            authorOnlyPurpose: "Fresh explicit-conversion comparison evidence.",
            prompt: "A first cable is 60 cm. A reference cable is 1.5 m. Use 1.5 m = 150 cm. Express the first cable as a fraction of the reference cable, in simplest form.",
            source: {
                kind: "explicit_conversion_comparison",
                expressed: { id: "first_cable", value: 60, unit: "cm", comparableValue: 60, comparableUnit: "cm" },
                reference: { id: "reference_cable", value: 1.5, unit: "m", comparableValue: 150, comparableUnit: "cm" },
                suppliedConversion: "1.5 m = 150 cm",
                rawFraction: f(60, 150),
            },
            visual: { kind: "cable_lengths_with_conversion_card", sharedComparableScale: true, showRoleLabelsBeforeSubmit: false },
            response: { kind: "fraction_input", submitLabel: "Submit answer" },
            answer: { kind: "fraction", rawFraction: f(60, 150), canonicalFraction: f(2, 5), requiredForm: "simplest" },
            policy: finalPolicy,
            preSubmitUtteranceIds: [],
            hintUtteranceIds: [],
            feedback: feedback(["RF5.CORRECT"], ["RF5.INCORRECT"]),
            workedCheck: {
                requiresAnswerLocked: true,
                mustFollowOutcomeFeedback: true,
                ryanUtteranceIds: ["RF5.WORK.1", "RF5.WORK.2"],
                visibleSteps: ["1.5 m = 150 cm", "60/150 = 2/5"],
                authorOnlyVisualReveal: [],
            },
            freshnessKey: "recovery-units60cm-1.5m",
        },
    ];
    exports.FRA15 = {
        id: "FRA15",
        displayId: "FRA-15",
        title: "Express One Quantity as a Fraction of Another",
        contentVersion: 1,
        status: "IMPLEMENTATION_CANDIDATE_AWAITING_IN_APP_QA",
        sourceOfTruth: {
            runtimeCopyRoutingQuestionDataAndValidation: "FRA15_CANONICAL_SPEC.ts",
            visualGeometryAndOwnerApprovedPedagogy: "Revily_FRA15_Storyboard_v1.pdf",
            engineeringIntegrationAndAcceptance: "FRA15_CODEX_IMPLEMENTATION_PROMPT.md",
            startInstruction: "FRA15_START_CODEX_PROMPT.txt",
            precedenceRule: "Use this TypeScript file for exact Ryan runtime copy, caption IDs, question data, outcomes, routes, repairs, recovery finals and validation. Use the PDF for visual layout and owner-facing pedagogical intent. Never transcribe PDF headings, stage directions, QA prose or authoring notes into learner speech.",
            existingEngineeringReference: "The active canonical Revily FRA lesson shell, TTS, captions, evidence, hints, answer locking, persistence, accessibility and test infrastructure already in the repository.",
        },
        runtimeBoundary: {
            legalRyanAudioSource: "FRA15_RUNTIME_COPY[utteranceId].text",
            legalRyanCaptionSource: "the same utterance ID and exact text used for audio",
            forbiddenAutomaticSources: [
                "prompt",
                "authorOnlyPurpose",
                "authorOnlyAssessmentIntent",
                "authorOnlyAction",
                "authorOnlyNotes",
                "authorOnlyBoundaryNotes",
                "timeline",
                "error family labels",
                "route names",
                "QA prose",
                "implementation prompt prose",
                "storyboard headings",
            ],
            noSeparateTranscriptString: true,
            noPermanentTranscriptBar: true,
            cuesRequireActiveUtteranceAndExactAnchor: true,
            removingUtteranceMustRemoveOrRemapCaptionAndCues: true,
            playExactlyOneOutcomeBranchPerResponse: true,
        },
        scope: {
            objective: "Express one quantity as a fraction of another, preserving the correct order and simplifying when requested.",
            studentFacingIdea: "The words decide the order.",
            prerequisites: [
                "FRA-01: fractions as equal parts or quantities.",
                "FRA-02: numerator and denominator roles.",
                "FRA-10: simplest form when requested.",
                "A supplied or already-known unit conversion when quantities are not initially in the same unit.",
            ],
            teaches: [
                "translate 'A as a fraction of B' into A/B",
                "keep the stated order for results below, equal to and above one",
                "use the named reference quantity as denominator rather than an automatic combined total",
                "simplify only after the comparison order is established and only when requested",
                "use an explicit supplied conversion before building the fraction when units differ",
                "use the relation to one as a sense check, never as a reason to flip the fraction",
            ],
            deliberatelyLaterOrExcluded: [
                "FRA-13: finding a fraction of an amount",
                "FRA-14: finding the whole from a fractional part",
                "FRA-16: general comparison and ordering of unlike fractions",
                "ratio notation, proportion or probability bridges",
                "percentage conversion",
                "hidden or surprise unit conversions",
                "fraction operations",
                "algebraic fractions",
                "negative quantities",
                "reciprocal terminology",
            ],
            normalQuantityBounds: { minimum: 1, maximum: 200 },
            excludesGlobalDiagnostic: true,
            excludesRetrievalLayer: true,
        },
        learnerExperience: {
            targetAgeRange: "11-16",
            narrator: "Ryan",
            voiceStyle: [
                "warm",
                "natural UK English",
                "teacher-like",
                "short conversational sentences",
                "restrained encouragement",
            ],
            captionContract: {
                wordTimedFromActualAudio: true,
                exactTextParityWithAudio: true,
                completeSentenceNotShownEarly: true,
                generallyOneOrTwoLines: true,
                neverCoverKeyMathematics: true,
                noBouncingText: true,
            },
            animationContract: {
                speechLed: true,
                mathematicalNotDecorative: true,
                labelsAppearWhenNamed: true,
                replayResetsAudioCaptionAndVisualStateTogether: true,
                reducedMotionUsesEquivalentCompletedStates: true,
            },
        },
        teachingScenes: exports.FRA15_TEACHING_SCENES,
        questions: exports.FRA15_QUESTIONS,
        finalQuestions: exports.FRA15_FINAL_QUESTIONS,
        confirmationQuestions: exports.FRA15_CONFIRMATION_QUESTIONS,
        repairProfiles: exports.FRA15_REPAIR_PROFILES,
        recoveryFinals: exports.FRA15_RECOVERY_FINALS,
        route: {
            start: ["HOOK", "T1", "T2", "T3", "T4", "T5", "HANDOFF", "G1", "G2"],
            guidedDecision: {
                fastEvidence: "G1 and G2 correct first attempt, no hint, no support escalation, correct order, requested form met and no central misconception.",
                fastRoute: ["skip F1", "show F2"],
                standardRoute: ["show F1", "show F2"],
                F2NeverSkipped: true,
                responseSpeedNeverSufficient: true,
            },
            independentSequence: ["I1", "I2"],
            independentDecision: {
                cleanEvidence: "Proceed to the final five.",
                correctAfterHint: "Use one fresh no-hint confirmation from the same concept family before final.",
                isolatedMissThenCorrection: "Use concise feedback and continue only when a fresh discriminating response is clean.",
                repeatedCentralError: "Run the matching repair, then its fresh no-hint repair check.",
            },
            finalIntroUtteranceIds: ["FINAL.INTRO"],
            finalSequence: ["M1", "M2", "M3", "M4", "M5"],
            finalDecision: {
                pass: "4-5/5 first-attempt independent across procedural and reasoning/application families, with no blocking repeated misconception.",
                threeOfFive: "Repair missed family or families, then require two fresh no-hint confirmations. The evidence window is the three original clean successes plus the two fresh clean successes.",
                zeroToTwo: "Repair actual weaknesses, then use RF1-RF5 as a fresh final five. Require at least 4/5 and no blocking repeated misconception.",
                blockingRepeatedFamilies: ["order", "total", "smallness_bias", "units"],
                formHandling: "Treat form separately when comparison order is secure; do not relabel a pure simplest-form miss as conceptual order failure.",
            },
            completionUtteranceIds: ["COMPLETE.1"],
        },
        evidence: {
            recordShape: "FRA15EvidenceRecord",
            guidedSuccessIsMastery: false,
            hintUseIsWrong: false,
            correctWithoutHint: "strong_independent_evidence",
            correctWithHint: "supported_success_requires_fresh_same_family_confirmation",
            repeatedSameItemAfterHintCanCertify: false,
            committedPreWorkingAnswerControlsFinalScore: true,
            classificationDiscipline: [
                "A single reciprocal answer is tentative: it may be order reversal, rushed entry or smallness bias.",
                "Blank or malformed input remains unknown.",
                "Correct raw order plus missing simplest form is form evidence, not order evidence.",
                "A denominator equal to A+B on a named subgroup item is strong total evidence.",
                "A fraction built before an explicit conversion is applied is strong units evidence.",
            ],
        },
        misconceptionFamilies: [
            {
                id: "order",
                learnerVisibleLabel: null,
                authorOnlyMeaning: "The two original quantities are reversed.",
                repairId: "R-ORDER",
                confirmationId: "C-ORDER",
            },
            {
                id: "total",
                learnerVisibleLabel: null,
                authorOnlyMeaning: "A/(A+B) is used when B alone is the named reference.",
                repairId: "R-TOTAL",
                confirmationId: "C-TOTAL",
            },
            {
                id: "combine",
                learnerVisibleLabel: null,
                authorOnlyMeaning: "The two quantities are added into a new value rather than compared.",
                repairId: "R-COMBINE",
                confirmationId: "C-COMBINE",
            },
            {
                id: "smallness_bias",
                learnerVisibleLabel: null,
                authorOnlyMeaning: "A valid result above one is flipped merely to make it proper.",
                repairId: "R-SMALL",
                confirmationId: "C-SMALL",
            },
            {
                id: "form",
                learnerVisibleLabel: null,
                authorOnlyMeaning: "The comparison order is correct but requested simplest form is not met.",
                repairId: "R-FORM",
                confirmationId: "C-FORM",
            },
            {
                id: "units",
                learnerVisibleLabel: null,
                authorOnlyMeaning: "The fraction is formed before an explicit supplied conversion aligns the units.",
                repairId: "R-UNITS",
                confirmationId: "C-UNITS",
            },
            {
                id: "unknown",
                learnerVisibleLabel: null,
                authorOnlyMeaning: "Evidence is ambiguous, malformed or insufficient for a named misconception.",
                repairId: null,
                confirmationId: null,
            },
        ],
        freshness: {
            exactQuestionReuseWithinAttemptForbidden: true,
            cosmeticNumberSwapIsNotFresh: true,
            requiredDifferences: [
                "new quantities",
                "new context or representation where practical",
                "new mathematical signature",
                "not the just-explained example",
            ],
        },
        responsive: {
            targetMobileWidthPx: 390,
            requirements: [
                "Measured bars stack vertically while retaining a shared scale.",
                "Fraction fields remain at least 44 px in each editable dimension.",
                "Choice and matching cards stack without changing the mathematics.",
                "Captions move above or below the dominant mathematical visual and never cover quantities or controls.",
                "Counter groups remain complete and countable.",
            ],
        },
        accessibility: {
            requirements: [
                "Complete keyboard access for fraction inputs, choices, matching, hints and submit.",
                "Visible focus and announced selected and locked states.",
                "Colour is reinforced by labels, outlines, texture or icons.",
                "Spoken content has an accessible text equivalent derived from the same runtime utterance.",
                "Visual descriptions expose the given quantities and relationships without stating the requested fraction.",
                "Counter tasks expose countable group structure because counting is data access rather than the FRA-15 target.",
                "Reduced motion preserves every mathematical state and ordering relation.",
                "Worked checks enter an accessible live region only after answer lock.",
            ],
        },
        persistence: {
            contentVersion: 1,
            persist: [
                "current stage and question",
                "committed response",
                "attempt count",
                "hint opened before submit",
                "support escalation",
                "candidate and confirmed error family",
                "answer-locked state",
                "fresh confirmation status",
                "final committed evidence window",
            ],
            migrationRule: "If an older FRA15 state references an unknown scene, question, utterance or cue version, restart at the nearest safe stage boundary. Never resume with an orphan caption, cue or worked solution.",
        },
        engineeringAcceptance: {
            dataIntegrity: [
                "One source object drives wording values, visual values, expected fraction, accepted forms, hints, feedback and worked check.",
                "Reference quantity is positive.",
                "Counter total equals the sum of the rendered groups.",
                "Supplied conversions produce the comparable values used by the fraction.",
                "requiredFormMet is checked separately from mathematical equivalence.",
            ],
            leakage: [
                "No final question has a hint, role arrow, simplifying factor or answer-revealing narration before submit.",
                "Final working cannot render or announce before answerLocked = true.",
                "Previous worked states clear before the next near-parallel item.",
                "Accessible text never concludes the requested numerator, denominator or simplified fraction.",
            ],
            outcomeParity: [
                "Compute correctness before selecting speech.",
                "Play exactly one of correct, matching specific incorrect, or default incorrect.",
                "Wrong responses never play the correct-response line or an unchanged continuation.",
                "Outcome feedback precedes the post-lock worked check.",
            ],
            runtimeParity: [
                "Audio and caption use the same utterance ID and exact text.",
                "Every cue references an active utterance and an exact phrase in it.",
                "Removing speech removes or remaps its caption and all dependent cues.",
                "No author-only field is sent to TTS or caption rendering.",
                "Consecutive Ryan lines add a new communication function; remove semantic repetition.",
            ],
            routeTests: [
                "Strong route skips F1 but retains F2.",
                "Standard route shows F1 then F2.",
                "Correct with hint triggers a fresh no-hint same-family confirmation.",
                "Repeated errors route to the matching repair and fresh repair check.",
                "4-5/5 finishes only with no blocking repeated misconception.",
                "3/5 requires two fresh clean confirmations.",
                "0-2/5 uses the fresh RF1-RF5 final set and requires at least 4/5.",
            ],
            noGlobalDiagnostic: true,
            noRetrievalLayer: true,
        },
        handoffAuthoringCompletions: [
            {
                issue: "The storyboard gives one generic final correct line and one generic final incorrect line, while the hardened Revily runtime rule requires item-specific and outcome-appropriate branches.",
                completion: "M1-M5 now have distinct correct, specific-incorrect and default-incorrect runtime utterances, followed by their own worked-check utterances after answer lock.",
                pedagogyChanged: false,
            },
            {
                issue: "The storyboard's 3/5 route requires two fresh same-family confirmations, but explicitly authors only C-ORDER and C-TOTAL.",
                completion: "C-COMBINE, C-SMALL, C-FORM and C-UNITS are supplied as deterministic same-family confirmation items using the approved concept boundaries.",
                pedagogyChanged: false,
            },
            {
                issue: "The storyboard requires a fresh five-item final after a 0-2/5 result but does not provide deterministic fallback values.",
                completion: "RF1-RF5 provide one fresh item for each final evidence direction without adding a new concept.",
                pedagogyChanged: false,
            },
            {
                issue: "Some storyboard repair checks repeat another authored item or final signature, conflicting with the storyboard's own freshness rule.",
                completion: "R-ORDER, R-TOTAL and R-UNITS repair checks use new quantities while preserving the approved repair purpose; all changes are explicitly recorded here rather than silently substituted.",
                pedagogyChanged: false,
            },
        ],
    };
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
    function simplifyFraction(value) {
        if (!Number.isInteger(value.numerator) || !Number.isInteger(value.denominator)) {
            throw new Error("FRA15 fractions must use integer numerator and denominator values.");
        }
        if (value.denominator === 0) {
            throw new Error("A fraction denominator cannot be zero.");
        }
        const sign = value.denominator < 0 ? -1 : 1;
        const divisor = gcd(value.numerator, value.denominator) || 1;
        return {
            numerator: (sign * value.numerator) / divisor,
            denominator: (sign * value.denominator) / divisor,
        };
    }
    function fractionsAreEquivalent(a, b) {
        if (a.denominator === 0 || b.denominator === 0)
            return false;
        return a.numerator * b.denominator === b.numerator * a.denominator;
    }
    function fractionExactlyEquals(a, b) {
        return a.numerator === b.numerator && a.denominator === b.denominator;
    }
    function fractionIsSimplest(value) {
        return value.denominator > 0 && gcd(value.numerator, value.denominator) === 1;
    }
    function evaluateFractionResponse(answer, response) {
        const mathematicallyEquivalent = fractionsAreEquivalent(response, answer.canonicalFraction);
        let requiredFormMet = false;
        if (answer.requiredForm === "simplest") {
            requiredFormMet = mathematicallyEquivalent && fractionIsSimplest(response);
        }
        else if (answer.requiredForm === "exact_equivalent") {
            requiredFormMet = mathematicallyEquivalent;
        }
        else {
            requiredFormMet = (answer.acceptedExactForms ?? []).some((accepted) => fractionExactlyEquals(response, accepted));
        }
        return {
            mathematicallyEquivalent,
            requiredFormMet,
            correct: mathematicallyEquivalent && requiredFormMet,
        };
    }
    function repairChecks() {
        return exports.FRA15_REPAIR_PROFILES.map((profile) => profile.freshCheck);
    }
    function allFRA15QuestionLikeObjects() {
        return [
            ...exports.FRA15_QUESTIONS,
            ...exports.FRA15_FINAL_QUESTIONS,
            ...exports.FRA15_CONFIRMATION_QUESTIONS,
            ...repairChecks(),
            ...exports.FRA15_RECOVERY_FINALS,
        ];
    }
    function getFRA15Question(id) {
        return allFRA15QuestionLikeObjects().find((question) => question.id === id);
    }
    function responseMatchesPattern(response, pattern) {
        if (pattern.optionId !== undefined)
            return response === pattern.optionId;
        if (pattern.response === "both_mappings_swapped") {
            return response === "both_mappings_swapped";
        }
        if (pattern.response === "one_mapping_wrong") {
            return response === "one_mapping_wrong";
        }
        if (pattern.response &&
            typeof pattern.response === "object" &&
            "numerator" in pattern.response &&
            response &&
            typeof response === "object" &&
            "numerator" in response) {
            return fractionsAreEquivalent(response, pattern.response);
        }
        if (Array.isArray(pattern.responses)) {
            return pattern.responses.some((candidate) => responseMatchesPattern(response, { response: candidate }));
        }
        return response === pattern.response;
    }
    function matchingResponseIsCorrect(question, response) {
        if (!response || typeof response !== "object" || Array.isArray(response)) {
            return false;
        }
        const expected = question.answer.pairs;
        const actual = response;
        return Object.keys(expected).every((key) => actual[key] === expected[key]);
    }
    function classifyFRA15Response(questionId, response) {
        const question = getFRA15Question(questionId);
        if (!question) {
            throw new Error(`Unknown FRA15 question ${questionId}.`);
        }
        let correct = false;
        if (question.answer?.kind === "fraction") {
            correct = evaluateFractionResponse(question.answer, response).correct;
        }
        else if (question.answer?.kind === "choice") {
            correct = response === question.answer.optionId;
        }
        else if (question.answer?.kind === "matching") {
            correct = matchingResponseIsCorrect(question, response);
        }
        if (correct) {
            return {
                correct: true,
                primaryFamily: null,
                candidateFamilies: [],
                classificationRule: "correct",
                outcomeUtteranceIds: [
                    ...question.feedback.correctUtteranceIds,
                ],
            };
        }
        const pattern = (question.feedback?.incorrectByPattern ?? []).find((candidate) => responseMatchesPattern(response, candidate));
        if (pattern) {
            const primaryFamily = (pattern.family ?? "unknown");
            const candidateFamilies = [
                primaryFamily,
                ...(pattern.candidateFamilies ?? []),
            ].filter((family, index, array) => array.indexOf(family) === index);
            return {
                correct: false,
                primaryFamily,
                candidateFamilies,
                classificationRule: pattern.classificationRule ?? "pattern_match",
                outcomeUtteranceIds: [
                    ...pattern.utteranceIds,
                ],
            };
        }
        return {
            correct: false,
            primaryFamily: "unknown",
            candidateFamilies: ["unknown"],
            classificationRule: "insufficient_or_ambiguous_evidence",
            outcomeUtteranceIds: [
                ...question.feedback.incorrectDefaultUtteranceIds,
            ],
        };
    }
    function routeFRA15AfterGuided(params) {
        if (params.g1FirstAttemptCorrect &&
            params.g2FirstAttemptCorrect &&
            !params.hintOrSupportEscalated &&
            params.orderCorrect &&
            params.requestedFormMet &&
            !params.centralMisconceptionExposed) {
            return "fast_skip_f1_keep_f2";
        }
        return "standard_show_f1_then_f2";
    }
    function routeFRA15AfterIndependent(params) {
        if (params.repeatedConfirmedFamily &&
            params.repeatedConfirmedFamily !== "unknown") {
            return {
                kind: "targeted_repair",
                family: params.repeatedConfirmedFamily,
            };
        }
        if (params.anyHintUsed) {
            return {
                kind: "fresh_confirmation",
                family: params.hintedFamily ?? "unknown",
            };
        }
        if ((params.unresolvedCandidateFamilies ?? []).length > 0) {
            return {
                kind: "collect_discriminating_evidence",
                candidateFamilies: params.unresolvedCandidateFamilies ?? [],
            };
        }
        if (params.bothResolvedCorrectly)
            return { kind: "proceed_to_final" };
        return {
            kind: "collect_discriminating_evidence",
            candidateFamilies: ["unknown"],
        };
    }
    function routeFRA15FinalCheck(params) {
        if (params.correctCount >= 4 &&
            params.firstAttemptIndependentCorrectCount >= 4 &&
            params.distinctEvidenceFamiliesCorrect >= 2 &&
            !params.repeatedBlockingMisconception) {
            return "finish_candidate";
        }
        if (params.correctCount >= 4 && params.repeatedBlockingMisconception) {
            return "repair_blocking_family_then_fresh_confirmation";
        }
        if (params.correctCount === 3) {
            return "repair_missed_families_then_two_confirmations";
        }
        return "repair_then_fresh_final_five";
    }
    const BANNED_RUNTIME_PATTERNS = [
        /strip away the story/i,
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
    ];
    function collectObjects(value, out, seen = new WeakSet()) {
        if (!value || typeof value !== "object")
            return;
        const objectValue = value;
        if (seen.has(objectValue))
            return;
        seen.add(objectValue);
        out.push(value);
        if (Array.isArray(value)) {
            value.forEach((child) => collectObjects(child, out, seen));
            return;
        }
        Object.values(value).forEach((child) => collectObjects(child, out, seen));
    }
    function collectRuntimeReferences(value, referenced, seen = new WeakSet()) {
        if (!value || typeof value !== "object")
            return;
        const objectValue = value;
        if (seen.has(objectValue))
            return;
        seen.add(objectValue);
        if (Array.isArray(value)) {
            value.forEach((child) => collectRuntimeReferences(child, referenced, seen));
            return;
        }
        for (const [key, child] of Object.entries(value)) {
            if (key.toLowerCase().endsWith("utteranceids") &&
                Array.isArray(child) &&
                child.every((entry) => typeof entry === "string")) {
                child.forEach((id) => referenced.add(id));
            }
            if (key === "utteranceId" && typeof child === "string") {
                referenced.add(child);
            }
            collectRuntimeReferences(child, referenced, seen);
        }
    }
    function getQuestionFractionSource(question) {
        return question?.source?.rawFraction ?? null;
    }
    function describeFraction(value) {
        return `${value.numerator}/${value.denominator}`;
    }
    function validateQuestionMathematics(question) {
        const errors = [];
        if (question?.answer?.kind !== "fraction")
            return errors;
        const answer = question.answer;
        const sourceRaw = getQuestionFractionSource(question);
        if (!sourceRaw) {
            errors.push(`${question.id} has a fraction answer but no source.rawFraction.`);
            return errors;
        }
        if (sourceRaw.denominator <= 0) {
            errors.push(`${question.id} reference quantity must be greater than zero.`);
        }
        if (!fractionExactlyEquals(sourceRaw, answer.rawFraction)) {
            errors.push(`${question.id} answer.rawFraction ${describeFraction(answer.rawFraction)} does not match source ${describeFraction(sourceRaw)}.`);
        }
        const simplified = simplifyFraction(sourceRaw);
        if (!fractionExactlyEquals(simplified, answer.canonicalFraction)) {
            errors.push(`${question.id} canonical ${describeFraction(answer.canonicalFraction)} does not simplify from ${describeFraction(sourceRaw)}.`);
        }
        if (answer.requiredForm === "simplest" &&
            !fractionIsSimplest(answer.canonicalFraction)) {
            errors.push(`${question.id} canonical answer is not in simplest form.`);
        }
        if (answer.requiredForm === "one_of_authored_exact_forms") {
            const accepted = answer.acceptedExactForms ?? [];
            if (accepted.length < 2) {
                errors.push(`${question.id} must list its accepted exact forms.`);
            }
            if (!accepted.some((value) => fractionExactlyEquals(value, sourceRaw))) {
                errors.push(`${question.id} accepted forms omit the direct raw fraction.`);
            }
            if (!accepted.some((value) => fractionExactlyEquals(value, answer.canonicalFraction))) {
                errors.push(`${question.id} accepted forms omit the canonical fraction.`);
            }
        }
        const source = question.source;
        if (source.kind === "two_group_comparison") {
            if (source.total !==
                Number(source.expressed.count) + Number(source.reference.count)) {
                errors.push(`${question.id} counter total does not equal both groups.`);
            }
        }
        if (source.kind === "explicit_conversion_comparison") {
            if (!source.suppliedConversion) {
                errors.push(`${question.id} unit item lacks a supplied conversion.`);
            }
            if (source.expressed.comparableUnit !== source.reference.comparableUnit) {
                errors.push(`${question.id} comparable units do not match.`);
            }
            if (sourceRaw.numerator !== source.expressed.comparableValue ||
                sourceRaw.denominator !== source.reference.comparableValue) {
                errors.push(`${question.id} raw fraction does not use the converted comparable values.`);
            }
        }
        return errors;
    }
    function validateFeedbackContract(question) {
        const errors = [];
        if (!question?.policy?.scored)
            return errors;
        const correctIds = question.feedback?.correctUtteranceIds ?? [];
        const defaultIds = question.feedback?.incorrectDefaultUtteranceIds ?? [];
        if (correctIds.length === 0) {
            errors.push(`${question.id} has no correct outcome utterance.`);
        }
        if (defaultIds.length === 0) {
            errors.push(`${question.id} has no default incorrect outcome utterance.`);
        }
        if (JSON.stringify(correctIds) === JSON.stringify(defaultIds)) {
            errors.push(`${question.id} correct and incorrect branches are identical.`);
        }
        if (question.feedback?.playExactlyOneOutcomeBranch !== true) {
            errors.push(`${question.id} must play exactly one outcome branch.`);
        }
        if (question.feedback?.doNotPlayDefaultAfterSpecific !== true) {
            errors.push(`${question.id} must suppress the default branch after a specific incorrect branch.`);
        }
        for (const pattern of question.feedback?.incorrectByPattern ?? []) {
            if (!Array.isArray(pattern.utteranceIds) || pattern.utteranceIds.length === 0) {
                errors.push(`${question.id} pattern ${pattern.id} has no utterance.`);
            }
        }
        return errors;
    }
    function validateFinalQuestion(question) {
        const errors = [];
        if (question.policy?.hintPolicy !== "none") {
            errors.push(`${question.id} final item must have hintPolicy none.`);
        }
        if ((question.hintUtteranceIds ?? []).length !== 0) {
            errors.push(`${question.id} final item exposes a hint utterance.`);
        }
        if ((question.preSubmitUtteranceIds ?? []).length !== 0) {
            errors.push(`${question.id} final item must not narrate answer-bearing values before submit.`);
        }
        if (question.policy?.solutionPolicy !== "after_locked_submit") {
            errors.push(`${question.id} final solution must be after locked submit.`);
        }
        if (question.policy?.answerLocksOnSubmit !== true) {
            errors.push(`${question.id} final answer must lock on submit.`);
        }
        if (question.workedCheck?.requiresAnswerLocked !== true) {
            errors.push(`${question.id} worked check must require answerLocked.`);
        }
        if (question.workedCheck?.mustFollowOutcomeFeedback !== true) {
            errors.push(`${question.id} worked check must follow outcome feedback.`);
        }
        if (question.visual?.showRoleLabelsBeforeSubmit === true) {
            errors.push(`${question.id} leaks role labels before submit.`);
        }
        return errors;
    }
    function visualDemonstrationFraction(profile) {
        return (profile.visual?.rawFraction ??
            profile.visual?.resolvedFraction ??
            profile.visual?.acceptedFraction ??
            null);
    }
    /**
     * Static self-audit for the handoff. Codex must add equivalent repository and
     * end-to-end tests; a clean result here is not a substitute for in-app QA.
     */
    function validateFRA15CanonicalSpec() {
        const errors = [];
        const registry = exports.FRA15_RUNTIME_COPY;
        const entries = Object.entries(registry);
        // 1. Runtime-copy boundary and learner-facing language.
        const seenRuntimeTexts = new Map();
        for (const [id, utterance] of entries) {
            if (utterance.audience !== "learner" || utterance.spokenBy !== "Ryan") {
                errors.push(`${id} is not a learner-facing Ryan utterance.`);
            }
            if (utterance.captionSource !== "same_as_audio") {
                errors.push(`${id} caption source must be same_as_audio.`);
            }
            if (!utterance.text.trim()) {
                errors.push(`${id} has empty runtime text.`);
            }
            for (const pattern of BANNED_RUNTIME_PATTERNS) {
                if (pattern.test(utterance.text)) {
                    errors.push(`${id} contains authoring or implementation language.`);
                }
            }
            const normalised = utterance.text.trim().toLowerCase();
            const previous = seenRuntimeTexts.get(normalised);
            if (previous) {
                errors.push(`${id} duplicates the exact runtime text of ${previous}.`);
            }
            else {
                seenRuntimeTexts.set(normalised, id);
            }
        }
        // 2. Every runtime ID is valid, referenced and never shadowed by captionText.
        const referenced = new Set();
        collectRuntimeReferences(exports.FRA15, referenced);
        for (const id of referenced) {
            if (!registry[id])
                errors.push(`Structured spec references missing runtime ID ${id}.`);
        }
        for (const id of Object.keys(registry)) {
            if (!referenced.has(id))
                errors.push(`Unreferenced runtime utterance ${id}.`);
        }
        const objects = [];
        collectObjects(exports.FRA15, objects);
        for (const object of objects) {
            if (Object.prototype.hasOwnProperty.call(object, "captionText")) {
                errors.push("captionText is forbidden; derive the caption from the active runtime utterance.");
            }
        }
        // 3. Every timed cue is anchored to speech Ryan actually says.
        for (const object of objects) {
            if (typeof object?.utteranceId === "string" &&
                typeof object?.anchorText === "string" &&
                typeof object?.authorOnlyAction === "string") {
                const utterance = registry[object.utteranceId];
                if (!utterance) {
                    errors.push(`${object.id} points to missing utterance ${object.utteranceId}.`);
                }
                else if (!utterance.text
                    .toLowerCase()
                    .includes(String(object.anchorText).toLowerCase())) {
                    errors.push(`${object.id} anchor "${object.anchorText}" is not present in ${object.utteranceId}.`);
                }
                if (object.mustNotOccurBeforeAnchor !== true) {
                    errors.push(`${object.id} must not occur before its speech anchor.`);
                }
            }
        }
        // 4. Question IDs, mathematics and outcome parity.
        const questions = allFRA15QuestionLikeObjects();
        const questionIds = new Set();
        for (const question of questions) {
            if (questionIds.has(question.id)) {
                errors.push(`Duplicate FRA15 question ID ${question.id}.`);
            }
            questionIds.add(question.id);
            errors.push(...validateQuestionMathematics(question));
            errors.push(...validateFeedbackContract(question));
        }
        // 5. Final count, lock contract and item-specific response language.
        if (exports.FRA15_FINAL_QUESTIONS.length !== 5) {
            errors.push("The main final must contain exactly five authored items.");
        }
        if (exports.FRA15_RECOVERY_FINALS.length !== 5) {
            errors.push("The deterministic recovery final must contain exactly five fresh items.");
        }
        for (const question of exports.FRA15_FINAL_QUESTIONS) {
            errors.push(...validateFinalQuestion(question));
        }
        for (const question of exports.FRA15_RECOVERY_FINALS) {
            errors.push(...validateFinalQuestion(question));
        }
        const finalCorrectTexts = [];
        const finalIncorrectTexts = [];
        for (const question of exports.FRA15_FINAL_QUESTIONS) {
            finalCorrectTexts.push(question.feedback.correctUtteranceIds
                .map((id) => registry[id]?.text)
                .join(" ")
                .toLowerCase());
            finalIncorrectTexts.push(question.feedback.incorrectDefaultUtteranceIds
                .map((id) => registry[id]?.text)
                .join(" ")
                .toLowerCase());
        }
        if (new Set(finalCorrectTexts).size !== finalCorrectTexts.length) {
            errors.push("Main final items reuse an identical correct-feedback line.");
        }
        if (new Set(finalIncorrectTexts).size !== finalIncorrectTexts.length) {
            errors.push("Main final items reuse an identical default-incorrect line.");
        }
        // 6. Freshness: no duplicate IDs/keys and no repair check repeats its demonstration value.
        const freshnessKeys = new Set();
        for (const question of questions) {
            if (!question.freshnessKey) {
                errors.push(`${question.id} has no freshnessKey.`);
                continue;
            }
            if (freshnessKeys.has(question.freshnessKey)) {
                errors.push(`Duplicate freshnessKey ${question.freshnessKey}.`);
            }
            freshnessKeys.add(question.freshnessKey);
        }
        for (const profile of exports.FRA15_REPAIR_PROFILES) {
            const demonstration = visualDemonstrationFraction(profile);
            const fresh = profile.freshCheck?.source?.rawFraction;
            if (demonstration && fresh && fractionsAreEquivalent(demonstration, fresh)) {
                errors.push(`${profile.id} fresh check is mathematically equivalent to its just-explained demonstration.`);
            }
        }
        // 7. Route and scope invariants.
        if (exports.FRA15.route.guidedDecision.F2NeverSkipped !== true) {
            errors.push("F2 must remain on both guided routes.");
        }
        if (exports.FRA15.route.guidedDecision.responseSpeedNeverSufficient !== true) {
            errors.push("Response speed must not create the fast route.");
        }
        if (exports.FRA15.scope.excludesGlobalDiagnostic !== true) {
            errors.push("FRA15 must exclude the future global Diagnostic layer.");
        }
        if (exports.FRA15.scope.excludesRetrievalLayer !== true) {
            errors.push("FRA15 must exclude Retrieval and spaced review.");
        }
        if (/CANONICAL\s*\/\s*REFERENCE/i.test(exports.FRA15.status)) {
            errors.push("FRA15 cannot be marked canonical before real implementation QA.");
        }
        // 8. Known mathematical route examples remain exact.
        const expectedCanonical = {
            G1: f(3, 2),
            G2: f(2, 3),
            F1: f(4, 5),
            I1: f(3, 2),
            M1: f(3, 4),
            M2: f(2, 3),
            M3: f(7, 4),
            M4: f(1, 1),
            M5: f(3, 5),
            RF1: f(4, 7),
            RF2: f(4, 7),
            RF3: f(7, 5),
            RF4: f(1, 1),
            RF5: f(2, 5),
        };
        for (const [id, expected] of Object.entries(expectedCanonical)) {
            const question = getFRA15Question(id);
            if (!question || question.answer?.kind !== "fraction") {
                errors.push(`${id} is missing its expected fraction answer.`);
                continue;
            }
            if (!fractionExactlyEquals(question.answer.canonicalFraction, expected)) {
                errors.push(`${id} canonical answer should be ${describeFraction(expected)}.`);
            }
        }
        return errors;
    }
    /**
     * Codex must map this specification onto the existing Revily lesson shell,
     * state, TTS, captions, animation, accessibility, persistence and route
     * registration. Do not create a second FRA15 application or parallel engine.
     */
    
  })(canonicalExports);
  window.RevilyFra15Approved = canonicalExports;
  window.FRA15_RUNTIME_COPY = canonicalExports.FRA15_RUNTIME_COPY;
})();
