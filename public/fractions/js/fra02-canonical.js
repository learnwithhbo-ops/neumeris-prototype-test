(function () {
  "use strict";

  const FRA02_ID = "FRA-02";

  const FINAL_SUCCESS_REACTIONS = Object.freeze({
    M1: "That’s it. Here’s the working so you can check your thinking.",
    M2: "You read that one well. Let’s compare it with the working.",
    M3: "Nicely done. Here’s the working for a quick check.",
    M4: "You kept the two roles clear. Let’s look at the working.",
    "C-SWAP-1": "That second look paid off. Here’s the working to confirm it.",
    "C-SWAP-2": "You kept the roles straight this time. Let’s check the working.",
    "C-TARGET-1": "There you go. Let’s compare that with the working.",
    "C-TARGET-2": "That’s a stronger answer. Here’s the working beside it.",
    "C-DENOM-1": "You found the whole’s structure. Let’s check the working.",
    "C-DENOM-2": "Much better. Here’s the working for comparison.",
    "C-FIELD-1": "You changed exactly the part you needed. Let’s confirm it with the working.",
    "C-FIELD-2": "That came together well. Here’s the working to check."
  });
  const FINAL_INCORRECT_REACTION = "Not quite. Here’s the working — compare it with what you did.";

  function model(context, totalParts, selectedParts, selectedMeaning, extras) {
    return Object.assign({
      context,
      totalParts,
      selectedParts,
      selectedMeaning,
      targetMeaning: selectedMeaning,
      equalParts: true,
      unequalParts: false
    }, extras || {});
  }

  function integerResponse(extras) {
    return Object.assign({
      type: "integer",
      keyboard_submit: true,
      input_label: "Your answer"
    }, extras || {});
  }

  function fractionResponse(extras) {
    return Object.assign({
      type: "fraction",
      presentation: "fraction",
      accept_equivalent_notation: false,
      keyboard_submit: true,
      partLabel: "Top fraction field",
      wholeLabel: "Bottom fraction field"
    }, extras || {});
  }

  function choiceResponse(options) {
    return { type: "single_choice", options, keyboard_submit: true };
  }

  function question(id, stage, intent, prompt, questionModel, response, answer, extras) {
    const overrides = extras || {};
    return Object.assign({
      id: `${FRA02_ID}-${id}`,
      stage,
      target: overrides.target || prompt,
      assessmentIntent: intent,
      evidenceFamily: overrides.evidenceFamily || intent,
      prompt,
      model: questionModel,
      response,
      answer: { value: String(answer) },
      policy: Object.assign({
        hintPolicy: "none",
        solutionPolicy: "after_response",
        scored: true
      }, overrides.policy || {}),
      visual: Object.assign({
        primitive: "fra02_context",
        action: "focus",
        description: prompt
      }, overrides.visual || {}),
      scripts: Object.assign({}, overrides.scripts || {}),
      mathematical_support: Object.assign({}, overrides.mathematical_support || {}),
      errorClassification: Object.assign({}, overrides.errorClassification || {}),
      misconceptionChecks: overrides.misconceptionChecks || [],
      recovery_item_ref: overrides.recovery_item_ref || null,
      primaryErrorFamily: overrides.primaryErrorFamily || "support_needed"
    }, overrides.fields || {});
  }

  function buildQuestions() {
    const questions = [];

    questions.push(question(
      "G1", "guided", "identify_numerator_by_role", "Which number counts the selected parts?",
      model("fraction_symbol", 9, 4, "selected", { fraction: { numerator: 4, denominator: 9 }, showPartModel: true, hintFocus: "selected" }),
      choiceResponse(["4", "9"]), "4",
      {
        policy: { hintPolicy: "guided" },
        scripts: {
          before_submit: "Look at the fraction and the model. Choose the number that counts the selected parts.",
          on_correct_reaction: "Yes — you chose the number connected to the selected parts.",
          on_correct_math: "4 counts the selected parts. That makes 4 the numerator.",
          on_incorrect_attempt_1: "Look at the selected parts. Which number matches that count?",
          on_incorrect_attempt_2: "The numerator counts the selected parts. Count those parts, then choose the matching number."
        },
        errorClassification: { choiceFamilies: { "9": "swap_roles" }, fallback: "support_needed" },
        recovery_item_ref: `${FRA02_ID}-R-SWAP`,
        primaryErrorFamily: "swap_roles",
        evidenceFamily: "numerator_role"
      }
    ));

    questions.push(question(
      "G2", "guided", "identify_denominator_from_whole", "Which number belongs in the denominator?",
      model("chocolate_partition", 8, 3, "selected", {
        fixedNumerator: 3,
        hintFocus: "whole",
        editableFields: ["denominator"]
      }),
      integerResponse({
        presentation: "fraction_builder",
        editableField: "denominator",
        fixedNumerator: 3,
        input_label: "Missing denominator"
      }), "8",
      {
        policy: { hintPolicy: "guided" },
        scripts: {
          before_submit: "I won’t say the count. Find how many equal pieces make the whole.",
          on_correct_reaction: "Good — you checked the complete whole.",
          on_correct_math: "8 equal pieces make the whole, so 8 belongs in the denominator.",
          on_incorrect_attempt_1: "Look at the whole. Count every equal piece.",
          on_incorrect_attempt_2: "Find how many equal pieces make the whole, then enter that number in the bottom field."
        },
        errorClassification: { integerFamilies: { "3": "denominator_as_selected" }, fallback: "support_needed" },
        recovery_item_ref: `${FRA02_ID}-R-DENOM`,
        primaryErrorFamily: "denominator_as_selected",
        evidenceFamily: "denominator_role"
      }
    ));

    questions.push(question(
      "F1", "faded", "missing_numerator_only", "Complete the fraction",
      model("board", 9, 5, "painted", {
        fixedDenominator: 9,
        editableFields: ["numerator"]
      }),
      integerResponse({
        presentation: "fraction_builder",
        editableField: "numerator",
        fixedDenominator: 9,
        input_label: "Missing top number"
      }), "5",
      {
        policy: { hintPolicy: "optional" },
        scripts: {
          on_correct_reaction: "Exactly — you changed only the missing top number.",
          on_correct_math: "5 painted sections give the missing top number.",
          on_incorrect_attempt_2: "The bottom 9 stays fixed. Count only the painted sections for the top field."
        },
        mathematical_support: {
          hint_1: "The 9 already tells you the whole has nine equal parts. Count the selected parts for the missing top number."
        },
        errorClassification: { integerFamilies: { "9": "changed_fixed_field", "4": "target_part" }, fallback: "support_needed" },
        recovery_item_ref: `${FRA02_ID}-R-FIELD`,
        primaryErrorFamily: "changed_fixed_field",
        evidenceFamily: "numerator_role"
      }
    ));

    const f2Options = [
      "A. The whole is split into 12 equal parts.",
      "B. 12 parts are selected.",
      "C. There are 12 unselected parts.",
      "D. The numerator must also be 12."
    ];
    questions.push(question(
      "F2", "faded", "interpret_denominator_meaning", "What does the denominator tell you?",
      model("fraction_symbol", 12, 5, "selected", { fraction: { numerator: 5, denominator: 12 } }),
      choiceResponse(f2Options), f2Options[0],
      {
        policy: { hintPolicy: "optional" },
        fields: { questionDetail: "What does the 12 tell you?" },
        scripts: {
          on_correct_reaction: "That’s the right interpretation of the denominator.",
          on_correct_math: "The denominator tells how the whole has been divided into equal parts.",
          on_incorrect_attempt_2: "The denominator belongs to the whole and its equal-part structure."
        },
        mathematical_support: {
          hint_1: "Think about the whole. The denominator tells how that whole has been divided."
        },
        errorClassification: {
          choiceFamilies: {
            [f2Options[1]]: "denominator_as_selected",
            [f2Options[2]]: "target_part",
            [f2Options[3]]: "swap_roles"
          },
          fallback: "support_needed"
        },
        recovery_item_ref: `${FRA02_ID}-R-DENOM`,
        primaryErrorFamily: "denominator_as_selected",
        evidenceFamily: "denominator_meaning"
      }
    ));

    questions.push(question(
      "I1", "independent", "construct_fraction_from_context",
      "Four sections are painted. The whole board has ten equal sections. Build the fraction.",
      model("board", 10, 4, "painted", { editableFields: ["numerator", "denominator"] }),
      fractionResponse(), "4/10",
      {
        policy: { hintPolicy: "optional", requiresFreshNoHintConfirmationIfHintUsed: true },
        scripts: {
          on_correct_reaction: "Nice work — you built the fraction from both counts.",
          on_correct_math: "4 painted sections is the top number; 10 equal sections in the whole is the bottom number.",
          on_incorrect_attempt_2: "Count the painted sections for the top field, then count every equal section in the whole for the bottom field."
        },
        mathematical_support: {
          hint_1: "Which number counts the painted sections, and which number tells how many equal sections make the whole?"
        },
        errorClassification: {
          swappedFraction: true,
          numeratorFamilies: { "6": "target_part" },
          denominatorFamilies: { "4": "denominator_as_selected" },
          fallback: "support_needed"
        },
        recovery_item_ref: `${FRA02_ID}-R-SWAP`,
        primaryErrorFamily: "swap_roles",
        evidenceFamily: "construct_fraction"
      }
    ));

    const i2Options = [
      "A. 11 is the numerator and 6 is the denominator.",
      "B. 6 is the numerator because it is smaller.",
      "C. 11 is the denominator because there are eleven parts.",
      "D. The names swap when the fraction is greater than one."
    ];
    questions.push(question(
      "I2", "independent", "roles_when_top_is_larger", "Which labels are correct?",
      model("fraction_symbol", 6, 11, "counted", {
        allowMultipleWholes: true,
        fraction: { numerator: 11, denominator: 6 }
      }),
      choiceResponse(i2Options), i2Options[0],
      {
        policy: { hintPolicy: "optional", requiresFreshNoHintConfirmationIfHintUsed: true },
        scripts: {
          on_correct_reaction: "Exactly — the size of the numbers did not change their roles.",
          on_correct_math: "11 is the numerator and 6 is the denominator. The roles do not swap.",
          on_incorrect_attempt_2: "The names stay tied to the same positions and roles, even when the top number is bigger."
        },
        mathematical_support: {
          hint_1: "The names are tied to their roles, not to which number is bigger."
        },
        errorClassification: {
          choiceFamilies: {
            [i2Options[1]]: "swap_roles",
            [i2Options[2]]: "denominator_as_selected",
            [i2Options[3]]: "swap_roles"
          },
          fallback: "support_needed"
        },
        recovery_item_ref: `${FRA02_ID}-R-SWAP`,
        primaryErrorFamily: "swap_roles",
        evidenceFamily: "role_invariance"
      }
    ));

    questions.push(question(
      "M1", "final", "final_direct_numerator", "What is the numerator?",
      model("fraction_symbol", 17, 8, "counted", { fraction: { numerator: 8, denominator: 17 } }),
      integerResponse({ input_label: "Type the numerator" }), "8",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: {
          on_correct_reaction: FINAL_SUCCESS_REACTIONS.M1,
          on_incorrect_reaction: FINAL_INCORRECT_REACTION,
          worked_explanation: "The numerator is the top number. In 8/17, that number is 8."
        },
        errorClassification: { integerFamilies: { "17": "swap_roles" }, fallback: "support_needed" },
        primaryErrorFamily: "swap_roles",
        evidenceFamily: "direct_numerator"
      }
    ));

    questions.push(question(
      "M2", "final", "final_denominator_from_visual", "What is the denominator?",
      model("plank", 14, 5, "painted"),
      integerResponse({ input_label: "Type the denominator" }), "14",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: {
          on_correct_reaction: FINAL_SUCCESS_REACTIONS.M2,
          on_incorrect_reaction: FINAL_INCORRECT_REACTION,
          worked_explanation: "The whole is split into 14 equal parts, so 14 is the denominator."
        },
        errorClassification: { integerFamilies: { "5": "denominator_as_selected", "9": "target_part" }, fallback: "support_needed" },
        primaryErrorFamily: "denominator_as_selected",
        evidenceFamily: "denominator_from_visual"
      }
    ));

    questions.push(question(
      "M3", "final", "final_construct_from_words",
      "The whole group has 13 tokens. 10 are selected. Write the fraction.",
      model("token_set", 13, 10, "selected", { wholeBoundary: true }),
      fractionResponse(), "10/13",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: {
          on_correct_reaction: FINAL_SUCCESS_REACTIONS.M3,
          on_incorrect_reaction: FINAL_INCORRECT_REACTION,
          worked_explanation: "10 selected parts gives the numerator; 13 in the whole gives the denominator: 10/13."
        },
        errorClassification: {
          swappedFraction: true,
          numeratorFamilies: { "3": "target_part" },
          denominatorFamilies: { "10": "denominator_as_selected" },
          fallback: "support_needed"
        },
        primaryErrorFamily: "swap_roles",
        evidenceFamily: "construct_from_words"
      }
    ));

    const m4Options = [
      "A. Correct — the larger number is always the denominator.",
      "B. Not correct — 9 is the numerator; 4 is the denominator.",
      "C. Correct — the number of counted parts is always the denominator.",
      "D. The fraction has no numerator or denominator because 9 > 4."
    ];
    questions.push(question(
      "M4", "final", "final_role_swap_reasoning", "Which statement is correct?",
      model("fraction_symbol", 4, 9, "counted", {
        allowMultipleWholes: true,
        fraction: { numerator: 9, denominator: 4 }
      }),
      choiceResponse(m4Options), m4Options[1],
      {
        fields: { questionDetail: "A student says: “9 is the denominator because nine parts are being counted.”" },
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: {
          on_correct_reaction: FINAL_SUCCESS_REACTIONS.M4,
          on_incorrect_reaction: FINAL_INCORRECT_REACTION,
          worked_explanation: "9 is on top and counts nine fourths, so it is the numerator. 4 tells the part size — fourths — so it is the denominator."
        },
        errorClassification: {
          choiceFamilies: {
            [m4Options[0]]: "swap_roles",
            [m4Options[2]]: "denominator_as_selected",
            [m4Options[3]]: "swap_roles"
          },
          fallback: "support_needed"
        },
        primaryErrorFamily: "swap_roles",
        evidenceFamily: "role_swap_reasoning"
      }
    ));

    function reteach(id, family, prompt, repairModel, narration, freshId) {
      return question(id, "repair", `repair_${family}`, prompt, repairModel,
        { type: "continue" }, "continue",
        {
          policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: false, reteachOnly: true },
          scripts: { reteach: narration },
          fields: { errorFamily: family, freshCheckId: `${FRA02_ID}-${freshId}` },
          primaryErrorFamily: family
        });
    }

    questions.push(reteach(
      "R-SWAP", "swap_roles", "The numerator and denominator roles are reversed.",
      model("fraction_role_diagram", 8, 3, "selected", { fraction: { numerator: 3, denominator: 8 }, teachingVariant: "repair_swap" }),
      [
        "The numerator and denominator roles are reversed in your answer. Read the fraction as three eighths.",
        "Three tells how many eighth-sized parts we’re counting — that’s the numerator.",
        "Eight tells how many equal parts make one whole — that’s the denominator."
      ],
      "C-SWAP-1"
    ));

    questions.push(reteach(
      "R-TARGET", "target_part", "Count the part the question asks about.",
      model("token_set", 8, 3, "highlighted", { wholeBoundary: true, teachingVariant: "repair_target" }),
      [
        "You counted a real part of the picture — just not the part the question asked about.",
        "The numerator follows the part we are talking about. If the question asks for the highlighted part, count the highlighted parts."
      ],
      "C-TARGET-1"
    ));

    questions.push(reteach(
      "R-DENOM", "denominator_as_selected", "The denominator belongs to the whole.",
      model("fraction_role_diagram", 9, 4, "selected", { fraction: { numerator: 4, denominator: 9 }, teachingVariant: "repair_denominator" }),
      [
        "The denominator is not ‘how many are coloured’. It belongs to the whole.",
        "Look at the whole first: it is split into nine equal parts. That makes 9 the denominator.",
        "Four are selected — that 4 belongs in the numerator."
      ],
      "C-DENOM-1"
    ));

    questions.push(reteach(
      "R-FIELD", "changed_fixed_field", "Only change the number the question asks for.",
      model("fraction_symbol", 11, 0, "selected", {
        fixedDenominator: 11,
        editableFields: ["numerator"],
        teachingVariant: "repair_field"
      }),
      [
        "One number is already fixed, so leave it alone.",
        "If the question gives the denominator and asks for the numerator, only fill the top field.",
        "Keep the whole’s partition exactly as it is."
      ],
      "C-FIELD-1"
    ));

    function confirmation(id, family, prompt, confirmationModel, response, answer, worked, extras) {
      return question(id, "confirmation", `fresh_${family}`, prompt, confirmationModel, response, answer,
        Object.assign({
          policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit", scored: true, freshConfirmation: true },
          scripts: {
            on_correct_reaction: FINAL_SUCCESS_REACTIONS[id],
            on_incorrect_reaction: FINAL_INCORRECT_REACTION,
            worked_explanation: worked
          },
          fields: { errorFamily: family },
          primaryErrorFamily: family,
          evidenceFamily: `fresh_${family}`
        }, extras || {}));
    }

    questions.push(confirmation(
      "C-SWAP-1", "swap_roles", "Build the fraction for the selected parts.",
      model("fraction_role_diagram", 10, 7, "selected", {
        fraction: { numerator: 7, denominator: 10 },
        layout: "offset",
        hideFractionUntilFeedback: true,
        hideRolesUntilFeedback: true
      }),
      fractionResponse(), "7/10",
      "7 counts the selected parts, so it is the numerator. 10 equal parts make the whole, so it is the denominator."
    ));
    questions.push(confirmation(
      "C-SWAP-2", "swap_roles", "Which labels are correct?",
      model("fraction_symbol", 8, 13, "counted", { allowMultipleWholes: true, fraction: { numerator: 13, denominator: 8 } }),
      choiceResponse(["13 is the numerator; 8 is the denominator.", "8 is the numerator; 13 is the denominator."]),
      "13 is the numerator; 8 is the denominator.",
      "13 is the top count, so it is the numerator. 8 defines eighth-sized parts, so it is the denominator."
    ));
    questions.push(confirmation(
      "C-TARGET-1", "target_part", "What is the numerator of the painted fraction?",
      model("board", 9, 4, "painted"), integerResponse(), "4",
      "The question asks about the 4 painted sections, so 4 is the numerator."
    ));
    questions.push(confirmation(
      "C-TARGET-2", "target_part", "What is the numerator of the highlighted fraction?",
      model("token_set", 10, 6, "highlighted", { wholeBoundary: true }), integerResponse(), "6",
      "6 tokens are highlighted, so 6 is the numerator."
    ));
    questions.push(confirmation(
      "C-DENOM-1", "denominator_as_selected", "What is the denominator?",
      model("cake", 12, 5, "iced"), integerResponse(), "12",
      "The whole cake has 12 equal slices, so 12 is the denominator."
    ));
    questions.push(confirmation(
      "C-DENOM-2", "denominator_as_selected", "What is the denominator?",
      model("plank", 11, 3, "painted"), integerResponse(), "11",
      "The whole plank has 11 equal sections, so 11 is the denominator."
    ));
    questions.push(confirmation(
      "C-FIELD-1", "changed_fixed_field", "Complete the fraction",
      model("board", 7, 3, "painted", { fixedDenominator: 7, editableFields: ["numerator"] }),
      integerResponse({ presentation: "fraction_builder", editableField: "numerator", fixedDenominator: 7, input_label: "Missing top number" }),
      "3", "The bottom 7 stays fixed. 3 painted parts gives the missing top number."
    ));
    questions.push(confirmation(
      "C-FIELD-2", "changed_fixed_field", "Complete the fraction",
      model("chocolate_partition", 6, 2, "selected", { fixedNumerator: 2, editableFields: ["denominator"] }),
      integerResponse({ presentation: "fraction_builder", editableField: "denominator", fixedNumerator: 2, input_label: "Missing bottom number" }),
      "6", "The top 2 stays fixed. 6 equal pieces make the whole, so 6 is the missing bottom number."
    ));

    // Counting items expose individual parts, not a printed answer count.
    for (const item of questions) {
      if (!item.policy.reteachOnly && item.model.context !== "fraction_symbol") {
        item.model.hideCountLabels = true;
        item.model.accessiblePartSequence = true;
      }
    }
    return questions;
  }

  function teachingStep(id, title, narration, sceneModel, cues, nextId) {
    return {
      id,
      purpose: title,
      scene: {
        display_title: title,
        initial_state: title,
        variant: "fra02_context",
        model: sceneModel
      },
      narration: { script: narration.join(" "), sync_cues: cues || [] },
      animation_timeline: [{ action: "focus", duration_ms: 850 }],
      learner_interaction: { question_ref: null, auto_focus: false },
      next_step: nextId,
      branching: { continue: { next_step: nextId } }
    };
  }

  function apply(spec) {
    if (!spec || spec.identity?.id !== FRA02_ID || spec.canonical_lesson?.storyboard_version === "1.0") return spec;

    const questions = buildQuestions();
    const byId = (id) => questions.find((item) => item.id === `${FRA02_ID}-${id}`);

    spec.question_bank = questions;
    spec.diagnostic = {
      enabled: false,
      question_refs: [],
      scope_note: "The future curriculum diagnostic layer is deliberately outside FRA-02."
    };

    spec.identity.status = "canonical_reference_lesson";
    spec.identity.estimated_minutes = { min: 9, max: 20 };
    spec.experience_contract.target_session_minutes = { min: 9, max: 20 };
    spec.experience_contract.global_ui_copy = Object.assign({}, spec.experience_contract.global_ui_copy, { submit: "Check answer" });

    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      opening_mode: "authored_scene_only",
      caption_presentation: {
        mode: "on_canvas_progressive",
        reveal: "word_by_word",
        max_typical_lines: 2,
        permanent_transcript_bar: false,
        accessible_text_equivalent: true
      },
      narration_playback: {
        mode: "authored_audio_then_browser_speech",
        provider: "Microsoft Edge Neural TTS",
        voice_id: "en-GB-RyanNeural",
        voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
        require_ryan_voice: true,
        word_alignment: "provider_boundaries",
        opening_delay_ms: 0,
        beat_gap_ms: 60,
        advance_delay_ms: 280,
        locked_working_mode: "reaction_only"
      },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.experience_contract.sequential_locked_working = true;
    spec.experience_contract.completion_header_controls = true;
    spec.experience_contract.deduplicate_exit_repairs = true;

    spec.visual_language = Object.assign({}, spec.visual_language, {
      primary_visual_contract: { primitive: "fra02_context" },
      fraction_bar_contract: null,
      canonical_palette: {
        numerator: "blue plus solid outline",
        denominator: "teal plus dashed whole boundary",
        selected: "blue plus inset mark or texture",
        whole_boundary: "visible outline"
      }
    });

    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, {
      visual_primitives: [
        "fra02_context", "fraction_input", "integer_input", "single_choice",
        "caption_layer", "progress_indicator", "optional_hint", "post_submit_working",
        "fixed_fraction_field"
      ]
    });

    const hook = teachingStep(
      "HOOK", "Same numbers. Different roles.",
      [
        "Five of these twelve cinema seats are booked. You already know that means five twelfths.",
        "Now watch what happens if I swap the two numbers.",
        "Twelve fifths is still a fraction — but it does not tell this picture. Same two numbers. Different positions. Different roles."
      ],
      model("cinema_seats", 12, 5, "booked", { wholeBoundary: true, fraction: { numerator: 5, denominator: 12 }, teachingVariant: "hook" }),
      [
        { cue: "Five of these twelve cinema seats are booked", action: "book_five", accessibleLabel: "A whole group of twelve cinema seats, with five visibly marked as booked." },
        { cue: "means five twelfths", action: "show_five_twelfths" },
        { cue: "swap the two numbers", action: "swap_numbers" },
        { cue: "does not tell this picture", action: "mark_mismatch" }
      ],
      "T1"
    );

    const t1 = teachingStep(
      "T1", "The top number has a role",
      [
        "Look back at five twelfths. The top number is 5. It counts the seats we’re talking about.",
        "That top number has a name: the numerator.",
        "So here, 5 is the numerator because five seats are booked."
      ],
      model("fraction_role_diagram", 12, 5, "booked", { fraction: { numerator: 5, denominator: 12 }, teachingVariant: "numerator" }),
      [
        { cue: "top number is 5", action: "focus_numerator" },
        { cue: "counts the seats", action: "pulse_selected" },
        { cue: "numerator", action: "show_numerator" }
      ],
      "T2"
    );

    const t2 = teachingStep(
      "T2", "The bottom number defines the parts",
      [
        "Now look at the bottom number: 12. It tells us how many equal parts make the whole group.",
        "That bottom number is called the denominator.",
        "So in five twelfths, 12 is the denominator. It tells us we are working in twelfths."
      ],
      model("fraction_role_diagram", 12, 5, "booked", { fraction: { numerator: 5, denominator: 12 }, teachingVariant: "denominator" }),
      [
        { cue: "whole group", action: "focus_whole" },
        { cue: "bottom number: 12", action: "focus_denominator" },
        { cue: "denominator", action: "show_denominator" }
      ],
      "T3"
    );

    const t3 = teachingStep(
      "T3", "Put the two roles together",
      [
        "Let’s put the two roles together.",
        "The numerator tells how many parts we’re counting. The denominator tells how many equal parts make one whole.",
        "Three eighths means three of eight equal parts."
      ],
      model("chocolate_partition", 8, 3, "selected", { fraction: { numerator: 3, denominator: 8 }, teachingVariant: "both_roles" }),
      [
        { cue: "numerator tells", action: "map_numerator" },
        { cue: "denominator tells", action: "map_denominator" },
        { cue: "Three eighths", action: "show_both_roles" }
      ],
      "T4"
    );

    const t4 = teachingStep(
      "T4", "The roles stay the same",
      [
        "One more thing before you take over. Sometimes the top number is bigger than the bottom number. The roles still stay the same.",
        "In eleven sixths, 11 is still the numerator. It tells us we have eleven sixth-sized parts.",
        "6 is still the denominator. Each whole is split into six equal parts."
      ],
      model("multi_whole_sixths", 6, 11, "counted", { allowMultipleWholes: true, fraction: { numerator: 11, denominator: 6 }, teachingVariant: "top_larger" }),
      [
        { cue: "top number is bigger", action: "show_eleven_sixths" },
        { cue: "11 is still the numerator", action: "map_numerator" },
        { cue: "6 is still the denominator", action: "map_denominator" }
      ],
      "HANDOFF"
    );

    const handoff = teachingStep(
      "HANDOFF", "Now you take over",
      [
        "You know the two names now — but I care more about whether their roles make sense.",
        "I’ll stay with you for two. Then I’ll start taking the help away."
      ],
      model("handoff", 8, 3, "selected", { teachingVariant: "handoff" }),
      [
        { cue: "two names", action: "show_role_names" },
        { cue: "roles make sense", action: "show_role_meanings" }
      ],
      "G1"
    );

    spec.lesson.teaching_steps = [hook, t1, t2, t3, t4, handoff];
    spec.lesson.transfer_steps = {
      G1: {
        stage: "guided",
        question_ref: `${FRA02_ID}-G1`,
        support_level: "high",
        pre_question_script: byId("G1").scripts.before_submit,
        visual_before_answer: "The fraction 4/9 with exactly four selected parts in a nine-part model.",
        correct_next: "G2",
        recovery_ref: `${FRA02_ID}-R-SWAP`
      },
      G2: {
        stage: "guided",
        question_ref: `${FRA02_ID}-G2`,
        support_level: "high",
        pre_question_script: byId("G2").scripts.before_submit,
        visual_before_answer: "Eight equal chocolate pieces, exactly three selected, with 3 fixed over one editable bottom field.",
        correct_next: "F1",
        recovery_ref: `${FRA02_ID}-R-DENOM`
      },
      F1: {
        stage: "faded",
        question_ref: `${FRA02_ID}-F1`,
        support_level: "reduced",
        pre_question_script: "Now it’s your turn. Try this one on your own. If you get stuck, ask me for a hint. I’ll be here. Go ahead.",
        visual_before_answer: "A board with nine equal sections and exactly five painted; the bottom 9 is fixed.",
        correct_next: "F2",
        recovery_ref: `${FRA02_ID}-R-FIELD`
      },
      F2: {
        stage: "faded",
        question_ref: `${FRA02_ID}-F2`,
        support_level: "reduced",
        pre_question_script: "This one is yours. Use what the denominator means. If you want a clue, ask me for a hint. Go ahead.",
        visual_before_answer: "The written fraction 5/12 without a completed role label.",
        correct_next: "I1",
        recovery_ref: `${FRA02_ID}-R-DENOM`
      },
      I1: {
        stage: "independent_transfer",
        question_ref: `${FRA02_ID}-I1`,
        support_level: "none",
        pre_question_script: "Now you take over. Build this fraction on your own. If you need a hint, ask me. I’ll be here. Go ahead.",
        visual_before_answer: "One board with ten equal sections and exactly four painted; both fraction fields are editable.",
        correct_next: "I2",
        recovery_ref: `${FRA02_ID}-R-SWAP`
      },
      I2: {
        stage: "independent_transfer",
        question_ref: `${FRA02_ID}-I2`,
        support_level: "none",
        pre_question_script: "One more on your own. The hint is there if you need it. Take your time, then go ahead.",
        visual_before_answer: "The written fraction 11/6 without classification or conversion.",
        correct_next: "M1",
        recovery_ref: `${FRA02_ID}-R-SWAP`
      }
    };

    spec.lesson.practice = {
      intro_script: "",
      question_order: [],
      question_count: 0,
      feedback_policy: "Only evidence-driven fresh confirmations are inserted.",
      between_question_transition: "No quota-based repeated practice."
    };

    const confirmationIds = [
      "C-SWAP-1", "C-SWAP-2", "C-TARGET-1", "C-TARGET-2",
      "C-DENOM-1", "C-DENOM-2", "C-FIELD-1", "C-FIELD-2"
    ].map((id) => `${FRA02_ID}-${id}`);

    spec.lesson.exit = {
      intro_script: "These last four are yours. No hints this time. Do the question first, then I’ll show you the working so you can check your thinking.",
      primary_question_refs: ["M1", "M2", "M3", "M4"].map((id) => `${FRA02_ID}-${id}`),
      confirmation_question_refs: confirmationIds,
      repair_by_primary: {
        [`${FRA02_ID}-M1`]: `${FRA02_ID}-R-SWAP`,
        [`${FRA02_ID}-M2`]: `${FRA02_ID}-R-DENOM`,
        [`${FRA02_ID}-M3`]: `${FRA02_ID}-R-SWAP`,
        [`${FRA02_ID}-M4`]: `${FRA02_ID}-R-SWAP`
      },
      post_repair_retest_refs: confirmationIds,
      mastery_policy: {
        secureMinimum: 3,
        requireMoreThanOneEvidenceFamily: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: ["swap_roles", "denominator_as_selected"],
        twoCorrectRequiredFreshSuccesses: 2,
        zeroOrOneCorrectRequiredFreshSuccesses: 4
      },
      mastery_logic: {
        "3_or_4_correct_of_4": "SECURE only across more than one family and with no repeated central misconception.",
        "2_correct_of_4": "Targeted repair, then a fresh two-item mini-check.",
        "0_or_1_correct_of_4": "Repair actual weaknesses, then use fresh final items."
      }
    };

    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: {
        G2: {
          type: "guided_strong",
          questionRefs: [`${FRA02_ID}-G1`, `${FRA02_ID}-G2`],
          next: "F2",
          otherwise: "F1"
        }
      },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      repair_by_error_family: {
        swap_roles: `${FRA02_ID}-R-SWAP`,
        target_part: `${FRA02_ID}-R-TARGET`,
        denominator_as_selected: `${FRA02_ID}-R-DENOM`,
        changed_fixed_field: `${FRA02_ID}-R-FIELD`
      },
      fresh_checks_by_error_family: {
        swap_roles: [`${FRA02_ID}-C-SWAP-1`, `${FRA02_ID}-C-SWAP-2`],
        target_part: [`${FRA02_ID}-C-TARGET-1`, `${FRA02_ID}-C-TARGET-2`],
        denominator_as_selected: [`${FRA02_ID}-C-DENOM-1`, `${FRA02_ID}-C-DENOM-2`],
        changed_fixed_field: [`${FRA02_ID}-C-FIELD-1`, `${FRA02_ID}-C-FIELD-2`]
      },
      no_hint_confirmation_by_question: {
        [`${FRA02_ID}-I1`]: `${FRA02_ID}-C-SWAP-1`,
        [`${FRA02_ID}-I2`]: `${FRA02_ID}-C-SWAP-2`
      },
      feedback_by_error_family: {
        swap_roles: "The numerator and denominator roles are reversed. Use the selected-part count for the numerator and the whole’s equal-part structure for the denominator.",
        target_part: "The numerator follows the part the question asks about. Count that part, not a different part of the picture.",
        denominator_as_selected: "The denominator belongs to the whole. Count every equal part that makes one whole.",
        changed_fixed_field: "One number is already fixed. Change only the field the question asks for.",
        support_needed: "Identify the role being asked about, then reconnect that role to the visual.",
        unknown: "Identify the role being asked about, then reconnect that role to the visual."
      }
    };

    spec.completion = {
      secure: {
        title: "FRA-02 complete",
        ryan_script: "Nice work. You can now tell which number is the numerator, which is the denominator, and what each one is doing. That’s FRA-02 done.",
        buttons: ["Back to Fractions", "Start again"]
      },
      needs_work: {
        title: "Keep building the two roles",
        ryan_script: "Use the selected-part count for the numerator and the equal-part structure of the whole for the denominator, then try FRA-02 again.",
        buttons: ["Try FRA-02 again", "Back to Fractions"]
      }
    };

    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: "FRA02-1.0",
      storyboard_version: "1.0",
      engine_profile: "fra02",
      runtime_applied: true,
      source_of_truth: "Revily_FRA02_Storyboard_v1.pdf with FRA02_CANONICAL_SPEC.ts as the structured companion",
      objective: "Identify, name and interpret the numerator and denominator in a written or represented fraction.",
      core_mental_model: ["Read the fraction", "Find the role", "Connect the number to meaning", "Use the role correctly"],
      phase_labels: {
        teaching: "Learn the idea",
        guided: "Try it with me",
        faded: "Your turn",
        independent: "Now you take over",
        repair: "Quick repair",
        exit: "Final check",
        completion: "Complete"
      },
      capabilities: {
        optional_hints: true,
        hint_evidence: true,
        fixed_fraction_field: true,
        final_working_after_locked_submit: true,
        four_item_final: true,
        targeted_repairs: true,
        fresh_confirmations: true
      },
      out_of_scope: ["global diagnostic engine", "cross-lesson retrieval practice", "classification or conversion of top-greater-than-bottom fractions"]
    };

    return spec;
  }

  window.RevilyFra02Canonical = { apply, buildQuestions };
})();
