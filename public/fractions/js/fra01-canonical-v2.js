(function () {
  "use strict";

  const FRA01_ID = "FRA-01";

  function fractionResponse(presentation) {
    return {
      type: "fraction",
      presentation: presentation || "fraction",
      accept_equivalent_notation: false,
      keyboard_submit: true,
      partLabel: "Part asked about",
      wholeLabel: "Equal parts in the whole"
    };
  }

  function fractionAnswer(numerator, denominator) {
    return { value: `${numerator}/${denominator}` };
  }

  function model(context, totalParts, selectedParts, selectedMeaning, extras) {
    return Object.assign({
      context,
      totalParts,
      selectedParts,
      selectedMeaning,
      targetMeaning: selectedMeaning,
      unequalParts: false,
      equalParts: true
    }, extras || {});
  }

  function question(id, stage, intent, prompt, questionModel, response, answer, extras) {
    const overrides = extras || {};
    return Object.assign({
      id: `${FRA01_ID}-${id}`,
      stage,
      target: overrides.target || prompt,
      assessmentIntent: intent,
      prompt,
      model: questionModel,
      response,
      answer,
      policy: Object.assign({
        hintPolicy: "none",
        solutionPolicy: "after_response",
        scored: true
      }, overrides.policy || {}),
      visual: Object.assign({
        primitive: "fra01_context",
        action: "focus",
        description: prompt
      }, overrides.visual || {}),
      scripts: Object.assign({}, overrides.scripts || {}),
      mathematical_support: Object.assign({}, overrides.mathematical_support || {}),
      misconceptionChecks: overrides.misconceptionChecks || [],
      recovery_item_ref: overrides.recovery_item_ref || null,
      primaryErrorFamily: overrides.primaryErrorFamily || "unknown"
    }, overrides.fields || {});
  }

  function choiceModel(label, context, totalParts, selectedParts, selectedMeaning, extras) {
    return Object.assign(model(context, totalParts, selectedParts, selectedMeaning, extras), { label });
  }

  function buildQuestions() {
    const questions = [];

    questions.push(question(
      "HOOK", "opening", "engagement_equal_share", "Fair split?", 
      model("chocolate_bar", 2, 0, "share", { unequalParts: true, equalParts: false, teachingVariant: "hook" }),
      { type: "yes_no", display_options: ["Yes", "No"], keyboard_submit: true },
      { value: "No" },
      {
        target: "Notice that two unequal pieces cannot be halves",
        policy: { scored: false, engagementOnly: true, hintPolicy: "none", solutionPolicy: "after_response" },
        scripts: {
          engagement_correct_feedback: "Right — the pieces are different sizes, so they cannot both be halves.",
          engagement_incorrect_feedback: "It may look fair because there are two pieces, but their sizes are different. Halves must be equal.",
          engagement_detail: "Watch the cut move so the two shares become equal.",
          engagement_correct_response: [
            "You spotted it. Two pieces are not enough — halves have to be equal.",
            "Let’s fix it.",
            "Now the two pieces are equal. Each piece is one half of the whole."
          ],
          engagement_incorrect_response: [
            "Not quite. There are two pieces, but one is much bigger than the other.",
            "Halves have to be equal.",
            "Let’s fix it.",
            "Now the two pieces are equal. Each piece is one half of the whole."
          ]
        },
        visual: {
          action: "compare",
          syncCues: [
            { cue: "Let’s fix it", action: "fix_split" },
            { cue: "Now the two pieces are equal", action: "equal_halves", accessibleLabel: "One chocolate bar split into two equal pieces." },
            { cue: "one half of the whole", action: "reveal_fraction", accessibleLabel: "One chocolate bar split into two equal pieces. Each piece is labelled one half." }
          ]
        },
        primaryErrorFamily: "equal_parts"
      }
    ));

    questions.push(question(
      "G1", "guided", "equal_parts_validity", "Which cake is split fairly into sixths?",
      model("cake_options", 6, 0, "piece", { optionCount: 2 }),
      {
        type: "single_choice",
        options: ["Cake A", "Cake B"],
        optionModels: [
          choiceModel("Cake A", "cake", 6, 0, "piece", { equalParts: true }),
          choiceModel("Cake B", "cake", 6, 0, "piece", { unequalParts: true, equalParts: false, unequalGeometry: "obvious" })
        ],
        keyboard_submit: true
      },
      { value: "Cake A" },
      {
        target: "Check equal parts before counting selected parts",
        policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: true },
        scripts: {
          before_submit: "Look at the size of the pieces. Which cake has been split fairly into six equal parts?",
          on_correct_math: "Cake A is split into six equal slices, so it is split fairly into sixths.",
          on_incorrect_attempt_1: "Both cakes have six pieces. Look at their sizes — are all six pieces equal?",
          on_incorrect_attempt_2: "Cake A has six equal slices. Cake B has six pieces, but their sizes are clearly unequal."
        },
        misconceptionChecks: ["equal_parts"],
        recovery_item_ref: `${FRA01_ID}-R-EQUAL`,
        primaryErrorFamily: "equal_parts"
      }
    ));

    questions.push(question(
      "G2", "guided", "guided_visual_to_fraction", "What fraction of the cake has blue icing?",
      model("cake", 6, 2, "icing", { feedbackFocus: "whole_then_selected" }),
      fractionResponse("guided_builder"),
      fractionAnswer(2, 6),
      {
        target: "Build selected parts out of all equal parts",
        policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: true },
        scripts: {
          before_submit: "Now read the picture. I won’t say the counts for you.",
          on_correct_math: "Yes — two out of six equal slices. That’s two sixths.",
          whole_count: "Start with the whole cake. Count every equal slice.",
          selected_count: "Now count only the slices the question asked about."
        },
        misconceptionChecks: ["whole_not_identified", "target_part", "order_reversal"],
        recovery_item_ref: `${FRA01_ID}-R-ORDER`,
        primaryErrorFamily: "order_reversal"
      }
    ));

    questions.push(question(
      "F1", "faded", "visual_to_fraction", "What fraction of this board is painted blue?",
      model("board", 7, 3, "painted"),
      fractionResponse(),
      fractionAnswer(3, 7),
      {
        policy: { hintPolicy: "optional", solutionPolicy: "after_response", scored: true },
        scripts: {
          before_submit: "This time, you do the counting.",
          on_correct_math: "Yes — three out of seven equal board sections are painted blue."
        },
        mathematical_support: { hint_1: "Start with the whole board. How many equal sections make the whole?" },
        misconceptionChecks: ["order_reversal", "whole_not_identified", "target_part"],
        recovery_item_ref: `${FRA01_ID}-R-ORDER`,
        primaryErrorFamily: "order_reversal"
      }
    ));

    questions.push(question(
      "F2", "faded", "whole_set_to_fraction", "What fraction of the tokens are highlighted?",
      model("token_set", 8, 5, "highlighted", { wholeBoundary: true }),
      fractionResponse(),
      fractionAnswer(5, 8),
      {
        policy: { hintPolicy: "optional", solutionPolicy: "after_response", scored: true },
        scripts: {
          before_submit: "Different kind of whole this time. Read the picture.",
          on_correct_math: "Exactly — five highlighted out of eight in the whole group."
        },
        mathematical_support: { hint_1: "The outline shows the whole group. Count everything inside it before you count the highlighted tokens." },
        misconceptionChecks: ["whole_not_identified", "order_reversal"],
        recovery_item_ref: `${FRA01_ID}-R-WHOLE`,
        primaryErrorFamily: "whole_not_identified"
      }
    ));

    questions.push(question(
      "I1", "independent", "remaining_fraction_in_context", "The faded squares have been eaten. What fraction of the whole bar is left?",
      model("chocolate_bar", 10, 7, "left", { unselectedMeaning: "eaten" }),
      fractionResponse(),
      fractionAnswer(7, 10),
      {
        policy: { hintPolicy: "optional", solutionPolicy: "after_response", scored: true, requiresFreshNoHintConfirmationIfHintUsed: true },
        scripts: { on_correct_math: "Yes — seven of the ten equal chocolate squares are left." },
        mathematical_support: { hint_1: "First decide what the question wants you to count: the part left, or the part eaten?" },
        misconceptionChecks: ["target_part", "whole_not_identified", "order_reversal"],
        recovery_item_ref: `${FRA01_ID}-R-CONTEXT`,
        primaryErrorFamily: "target_part"
      }
    ));

    questions.push(question(
      "I2", "independent", "reject_invalid_fraction_model", "Which picture genuinely shows four sevenths of one whole?",
      model("strip_options", 7, 4, "selected", { optionCount: 3 }),
      {
        type: "single_choice",
        options: ["A", "B", "C"],
        optionModels: [
          choiceModel("A", "strip", 7, 4, "selected"),
          choiceModel("B", "strip", 7, 4, "selected", { unequalParts: true, equalParts: false, unequalGeometry: "obvious" }),
          choiceModel("C", "strip", 4, 4, "selected")
        ],
        keyboard_submit: true
      },
      { value: "A" },
      {
        policy: { hintPolicy: "optional", solutionPolicy: "after_response", scored: true, requiresFreshNoHintConfirmationIfHintUsed: true },
        scripts: {
          before_submit: "Choose the one you trust.",
          on_correct_math: "Exactly. Picture A has seven equal parts, with four selected.",
          option_B: "The counts match, but check the sizes. Sevenths must be equal.",
          option_C: "Those parts are equal, but the whole is split into four parts, not seven."
        },
        mathematical_support: { hint_1: "Check two things: does the whole have seven parts, and are all seven parts equal?" },
        misconceptionChecks: ["equal_parts", "whole_not_identified"],
        recovery_item_ref: `${FRA01_ID}-R-EQUAL`,
        primaryErrorFamily: "equal_parts"
      }
    ));

    questions.push(question(
      "M1", "final", "final_visual_to_fraction", "What fraction of this plank is painted blue?",
      model("plank", 9, 4, "painted"),
      fractionResponse(),
      fractionAnswer(4, 9),
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit", scored: true },
        scripts: {
          worked_explanation: "1. Count the equal sections in the whole plank: 9. 2. Count the painted sections: 4. 3. So the painted fraction is 4/9.",
          worked_steps: ["Count the equal sections in the whole plank: 9.", "Count the painted sections: 4.", "So the painted fraction is 4/9."],
          post_submit_correct: "That matches the plank. Check the three steps on screen.",
          post_submit_incorrect: "Your answer is saved. Compare it with the three steps on screen."
        },
        misconceptionChecks: ["order_reversal", "whole_not_identified", "target_part"],
        primaryErrorFamily: "order_reversal"
      }
    ));

    questions.push(question(
      "M2", "final", "final_whole_set", "What fraction of the whole group is highlighted?",
      model("token_set", 11, 6, "highlighted", { wholeBoundary: true }),
      fractionResponse(),
      fractionAnswer(6, 11),
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit", scored: true },
        scripts: {
          before_submit: "Your turn.",
          worked_explanation: "1. The whole group contains 11 tokens. 2. 6 of those tokens are highlighted. 3. So the highlighted fraction is 6/11.",
          worked_steps: ["The whole group contains 11 tokens.", "6 of those tokens are highlighted.", "So the highlighted fraction is 6/11."],
          post_submit_correct: "That matches the whole group. Check the three steps on screen.",
          post_submit_incorrect: "Your answer is saved. Use the three steps on screen to check your counts."
        },
        misconceptionChecks: ["whole_not_identified", "order_reversal"],
        primaryErrorFamily: "whole_not_identified"
      }
    ));

    questions.push(question(
      "M3", "final", "final_equal_parts_reasoning", "Which cake is split fairly into sixths?",
      model("cake_options", 6, 0, "piece", { optionCount: 2 }),
      {
        type: "single_choice",
        options: ["Cake A", "Cake B"],
        optionModels: [
          choiceModel("Cake A", "cake", 6, 0, "piece"),
          choiceModel("Cake B", "cake", 6, 0, "piece", { unequalParts: true, equalParts: false, unequalGeometry: "obvious" })
        ],
        keyboard_submit: true
      },
      { value: "Cake A" },
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit", scored: true },
        scripts: {
          worked_explanation: "1. Sixths means the whole must be split into 6 equal parts. 2. Cake A has 6 equal slices. Cake B has 6 pieces, but their sizes are clearly unequal. 3. So Cake A is split fairly into sixths.",
          worked_steps: ["Sixths means the whole must be split into 6 equal parts.", "Cake A has 6 equal slices. Cake B has 6 pieces, but their sizes are clearly unequal.", "So Cake A is split fairly into sixths."],
          post_submit_correct: "Cake A is split fairly. Check the three steps on screen.",
          post_submit_incorrect: "Your choice is saved. Compare both cuts with the three steps on screen."
        },
        misconceptionChecks: ["equal_parts"],
        primaryErrorFamily: "equal_parts"
      }
    ));

    const reteach = (id, family, prompt, repairModel, narration, freshId) => question(
      id, "repair", `repair_${family}`, prompt, repairModel,
      { type: "continue" }, { value: "continue" },
      {
        target: prompt,
        policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: false, reteachOnly: true },
        scripts: { reteach: narration },
        fields: { errorFamily: family, freshCheckId: `${FRA01_ID}-${freshId}` },
        primaryErrorFamily: family
      }
    );

    questions.push(reteach(
      "R-EQUAL", "equal_parts", "Two pieces are not automatically two halves.",
      model("equal_parts_repair", 2, 0, "share", { unequalParts: true, equalParts: false, unequalGeometry: "obvious" }),
      [
        "The piece count fooled us. Two pieces are not automatically halves.",
        "Half means one of two equal parts of the whole.",
        "Look at the top bar: one piece is tiny and the other is much larger. That cannot be halves.",
        "Now move the cut to the centre. Two equal pieces — now halves make sense."
      ],
      "C-EQUAL-1"
    ));

    questions.push(reteach(
      "R-WHOLE", "whole_not_identified", "Find the whole before the fraction.",
      model("token_set", 9, 4, "highlighted", { wholeBoundary: true, teachingVariant: "repair_whole" }),
      [
        "Start by finding the whole.",
        "Everything inside this outline belongs to the whole group — highlighted or not.",
        "Now count the part the question actually asks about."
      ],
      "C-WHOLE-1"
    ));

    questions.push(reteach(
      "R-CONTEXT", "target_part", "Answer the part that was asked for.",
      model("chocolate_bar", 9, 5, "left", { unselectedMeaning: "eaten", teachingVariant: "repair_context" }),
      [
        "You counted a real part of the picture — just not the part the question asked for.",
        "The whole started with nine equal squares.",
        "Four are eaten, so five are left. If the question asks what is left, we read five out of nine."
      ],
      "C-CONTEXT-1"
    ));

    questions.push(reteach(
      "R-ORDER", "order_reversal", "Say it before you type it.",
      model("board", 7, 3, "painted", { teachingVariant: "repair_order" }),
      ["Say what the picture means before you type anything: three out of seven equal parts."],
      "C-ORDER-1"
    ));

    const confirmation = (id, family, prompt, confirmationModel, response, answer, worked) => question(
      id, "confirmation", `fresh_${family}`, prompt, confirmationModel, response, answer,
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit", scored: true, freshConfirmation: true },
        scripts: { worked_explanation: worked },
        fields: { errorFamily: family },
        primaryErrorFamily: family
      }
    );

    questions.push(confirmation(
      "C-EQUAL-1", "equal_parts", "Which strip can correctly show fourths?",
      model("strip_options", 4, 1, "selected", { optionCount: 2 }),
      { type: "single_choice", options: ["Strip A", "Strip B"], optionModels: [
        choiceModel("Strip A", "strip", 4, 1, "selected"),
        choiceModel("Strip B", "strip", 4, 1, "selected", { unequalParts: true, equalParts: false, unequalGeometry: "obvious" })
      ], keyboard_submit: true },
      { value: "Strip A" },
      "Strip A has four equal parts. Strip B has four pieces, but their widths are unequal."
    ));
    questions.push(confirmation(
      "C-EQUAL-2", "equal_parts", "Which brownie tray can correctly show thirds?",
      model("strip_options", 3, 1, "selected", { optionCount: 2 }),
      { type: "single_choice", options: ["Tray A", "Tray B"], optionModels: [
        choiceModel("Tray A", "brownie_tray", 3, 1, "icing"),
        choiceModel("Tray B", "brownie_tray", 3, 1, "icing", { unequalParts: true, equalParts: false, unequalGeometry: "obvious" })
      ], keyboard_submit: true },
      { value: "Tray A" },
      "Tray A is split into three equal pieces, so thirds make sense."
    ));
    questions.push(confirmation(
      "C-WHOLE-1", "whole_not_identified", "What fraction of the whole group is highlighted?",
      model("token_set", 9, 4, "highlighted", { wholeBoundary: true }),
      fractionResponse(), fractionAnswer(4, 9),
      "The whole group has 9 tokens. 4 are highlighted, so the fraction is 4/9."
    ));
    questions.push(confirmation(
      "C-WHOLE-2", "whole_not_identified", "What fraction of the whole group is highlighted?",
      model("token_set", 10, 7, "highlighted", { wholeBoundary: true, layout: "staggered" }),
      fractionResponse(), fractionAnswer(7, 10),
      "The whole group has 10 tokens. 7 are highlighted, so the fraction is 7/10."
    ));
    questions.push(confirmation(
      "C-CONTEXT-1", "target_part", "Three squares have been used. What fraction of the whole bar remains?",
      model("chocolate_bar", 8, 5, "left", { unselectedMeaning: "used" }),
      fractionResponse(), fractionAnswer(5, 8),
      "The whole has 8 equal squares. 3 are used, so 5 remain. The remaining fraction is 5/8."
    ));
    questions.push(confirmation(
      "C-CONTEXT-2", "target_part", "Four pieces have been eaten. What fraction of the whole bar is left?",
      model("chocolate_bar", 12, 8, "left", { unselectedMeaning: "eaten" }),
      fractionResponse(), fractionAnswer(8, 12),
      "The whole has 12 equal pieces. 4 are eaten, so 8 are left. The fraction left is 8/12."
    ));
    questions.push(confirmation(
      "C-ORDER-1", "order_reversal", "What fraction of this brownie tray has icing?",
      model("brownie_tray", 6, 2, "icing"),
      fractionResponse(), fractionAnswer(2, 6),
      "Say it as two out of six equal pieces. The fraction is 2/6."
    ));
    questions.push(confirmation(
      "C-ORDER-2", "order_reversal", "What fraction of these tiles is painted blue?",
      model("tiles", 8, 5, "painted", { compact: true, wholeBoundary: true }),
      fractionResponse(), fractionAnswer(5, 8),
      "Say it as five out of eight equal parts. The fraction is 5/8."
    ));

    for (const item of questions) {
      if (item.policy.scored && item.response.type === "fraction") item.model.accessiblePartSequence = true;
    }
    questions.find(item => item.id === `${FRA01_ID}-R-EQUAL`).visual.syncCues = [
      { cue: "Now move the cut to the centre", action: "repair_equal_cut" },
      { cue: "Two equal pieces", action: "repair_equal_labels", accessibleLabel: "The top bar has a tiny piece and a much larger piece. The lower bar now has two equal halves." }
    ];
    questions.find(item => item.id === `${FRA01_ID}-R-ORDER`).visual.syncCues = [
      { cue: "three out of seven equal parts", action: "reveal_fraction", accessibleLabel: "One board has seven equal sections with three painted. The written fraction is three sevenths." }
    ];
    return questions;
  }

  function teachingStep(id, title, narration, sceneModel, action, cues, nextId) {
    return {
      id,
      purpose: title,
      scene: {
        display_title: title,
        initial_state: title,
        variant: "fra01_context",
        model: sceneModel
      },
      narration: { script: narration.join(" "), sync_cues: cues || [] },
      animation_timeline: [{ action: action || "focus", duration_ms: 850 }],
      learner_interaction: { question_ref: null, auto_focus: false },
      next_step: nextId,
      branching: { continue: { next_step: nextId } }
    };
  }

  function apply(spec) {
    if (!spec || spec.identity?.id !== FRA01_ID || spec.canonical_lesson?.storyboard_version === "2.0") return spec;

    const questions = buildQuestions();
    spec.question_bank = questions;
    spec.diagnostic = Object.assign({}, spec.diagnostic, {
      enabled: false,
      question_refs: [],
      scope_note: "Future curriculum diagnostic layer is deliberately outside FRA-01."
    });

    spec.identity.status = "canonical_reference_lesson";
    spec.identity.estimated_minutes = { min: 8, max: 18 };
    spec.experience_contract.target_session_minutes = { min: 8, max: 18 };
    spec.experience_contract.completion_header_controls = true;
    spec.experience_contract.deduplicate_exit_repairs = true;
    spec.experience_contract.sequential_locked_working = true;
    spec.experience_contract.global_ui_copy = Object.assign({}, spec.experience_contract.global_ui_copy, {
      submit: "Check answer"
    });

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
        word_alignment: "provider_boundaries"
      },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.voice_and_script.runtime_narration_lines = [
      "That matches. Check the working on screen.",
      "Your answer is saved. Compare it with the working on screen.",
      "Count isn’t enough. Check whether the parts are genuinely equal.",
      "Say what the picture means before you type it: the part asked about, out of all the equal parts in the whole.",
      "Start with the whole. Count everything that belongs to it.",
      "You counted a real part of the picture, but check which part the question asks about.",
      "Start with the whole, check the parts are equal, then count the part asked about."
    ];

    spec.visual_language = Object.assign({}, spec.visual_language, {
      primary_visual_contract: { primitive: "fra01_context" },
      fraction_bar_contract: null,
      canonical_palette: {
        selected: "blue plus texture/outline",
        unselected: "context-neutral",
        whole_boundary: "visible outline or dotted group boundary"
      }
    });

    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, {
      visual_primitives: [
        "fra01_context", "fraction_input", "single_choice", "yes_no",
        "caption_layer", "progress_indicator", "optional_hint", "post_submit_working"
      ]
    });

    const hookIntro = teachingStep(
      "HOOK-INTRO",
      "One bar. Two very different pieces.",
      ["Suppose you and a friend split this chocolate bar. I take the big piece, you get the small one, and I tell you we each got one half. Would you buy that?"],
      model("chocolate_bar", 2, 0, "share", { unequalParts: true, equalParts: false, teachingVariant: "hook" }),
      "show_unequal_split",
      [
        { cue: "split this chocolate bar", action: "show_unequal_split" },
        { cue: "big piece", action: "separate_pieces" }
      ],
      "HOOK"
    );

    const t1 = teachingStep(
      "T1", "Start with the whole",
      [
        "One thing always comes first: what is the whole? Here, the whole is the entire chocolate bar.",
        "Now split that whole into four equal parts.",
        "Each piece is one fourth of the whole."
      ],
      model("chocolate_bar", 4, 1, "selected", { teachingVariant: "teach_whole" }),
      "focus_whole",
      [
        { cue: "the whole", action: "focus_whole" },
        { cue: "four equal parts", action: "partition_four", accessibleLabel: "One whole chocolate bar split into four equal parts." },
        { cue: "equal parts", action: "equal_guide" },
        { cue: "one fourth", action: "reveal_fraction", accessibleLabel: "One whole chocolate bar split into four equal parts. One piece is selected and labelled one fourth." }
      ],
      "T2"
    );

    const t2 = teachingStep(
      "T2", "From one equal part to several",
      [
        "Fractions can describe more than one equal part too.",
        "This brownie tray is one whole, cut into five equal pieces.",
        "Watch as I add icing to one… two… three of them.",
        "That’s three out of five equal parts. We write it as three fifths."
      ],
      model("brownie_tray", 5, 3, "icing", { teachingVariant: "teach_several" }),
      "show_whole",
      [
        { cue: "five equal pieces", action: "partition_five", accessibleLabel: "One brownie tray cut into five equal pieces." },
        { cue: "add icing to one", action: "ice_one" },
        { cue: "two", action: "ice_two" },
        { cue: "three of them", action: "ice_three", accessibleLabel: "One brownie tray cut into five equal pieces, with icing on three pieces." },
        { cue: "three fifths", action: "reveal_fraction", accessibleLabel: "One brownie tray cut into five equal pieces, with icing on three pieces and a three-fifths label." }
      ],
      "T3"
    );

    const t3 = teachingStep(
      "T3", "A whole can be a whole group",
      [
        "The whole doesn’t have to be one solid object. It can be a whole group.",
        "Here, the whole is all eight tokens.",
        "Three are highlighted, so three eighths of the group are highlighted."
      ],
      model("token_set", 8, 3, "highlighted", { wholeBoundary: true, teachingVariant: "teach_set" }),
      "show_group",
      [
        { cue: "whole group", action: "show_boundary" },
        { cue: "all eight tokens", action: "show_boundary", accessibleLabel: "A whole group containing eight game tokens inside one boundary." },
        { cue: "Three are highlighted", action: "highlight_three", accessibleLabel: "A whole group of eight game tokens, with three highlighted." },
        { cue: "three eighths", action: "reveal_fraction", accessibleLabel: "A whole group of eight game tokens, with three highlighted and labelled three eighths." }
      ],
      "T4"
    );

    const t4 = teachingStep(
      "T4", "Now you take over",
      ["That’s the idea: whole first, equal parts, then the part we care about. I’ll stay with you for the first couple. Then I’ll start taking the help away."],
      model("handoff", 4, 0, "none", { teachingVariant: "handoff" }),
      "handoff",
      [
        { cue: "whole first", action: "handoff_whole" },
        { cue: "equal parts", action: "handoff_equal" },
        { cue: "part we care about", action: "handoff_target" }
      ],
      "G1"
    );

    const hookQuestionStep = {
      id: "HOOK",
      purpose: "Decide whether unequal pieces are a fair half split",
      scene: { display_title: "Would you call that half?", initial_state: "Unequal chocolate split", variant: "fra01_context" },
      narration: { script: "", sync_cues: [] },
      animation_timeline: [{ action: "compare", duration_ms: 900 }],
      learner_interaction: { question_ref: `${FRA01_ID}-HOOK`, auto_focus: true },
      next_step: "T1",
      branching: { continue: { next_step: "T1" } }
    };

    spec.lesson.teaching_steps = [hookIntro, hookQuestionStep, t1, t2, t3, t4];
    spec.lesson.transfer_steps = {
      G1: {
        stage: "guided",
        question_ref: `${FRA01_ID}-G1`,
        support_level: "high",
        pre_question_script: questions.find((item) => item.id === `${FRA01_ID}-G1`).scripts.before_submit,
        visual_before_answer: "Two actual cakes: Cake A has six equal slices; Cake B has six obviously unequal pieces.",
        correct_next: "G2",
        recovery_ref: `${FRA01_ID}-R-EQUAL`
      },
      G2: {
        stage: "guided",
        question_ref: `${FRA01_ID}-G2`,
        support_level: "high",
        pre_question_script: questions.find((item) => item.id === `${FRA01_ID}-G2`).scripts.before_submit,
        visual_before_answer: "A round cake with six equal slices and blue icing on exactly two complete slices.",
        correct_next: "F1",
        recovery_ref: `${FRA01_ID}-R-ORDER`
      },
      F1: {
        stage: "faded",
        question_ref: `${FRA01_ID}-F1`,
        support_level: "reduced",
        pre_question_script: questions.find((item) => item.id === `${FRA01_ID}-F1`).scripts.before_submit,
        visual_before_answer: "A wooden board with seven equal sections and three painted blue.",
        correct_next: "F2",
        recovery_ref: `${FRA01_ID}-R-ORDER`
      },
      F2: {
        stage: "faded",
        question_ref: `${FRA01_ID}-F2`,
        support_level: "reduced",
        pre_question_script: questions.find((item) => item.id === `${FRA01_ID}-F2`).scripts.before_submit,
        visual_before_answer: "Eight game tokens inside the whole-group boundary; five are highlighted.",
        correct_next: "I1",
        recovery_ref: `${FRA01_ID}-R-WHOLE`
      },
      I1: {
        stage: "independent_transfer",
        question_ref: `${FRA01_ID}-I1`,
        support_level: "none",
        pre_question_script: "Now you take over. If you want a clue, tap Ask for a hint. If you don’t need it, leave it closed and trust yourself.",
        visual_before_answer: "A ten-square chocolate bar: seven solid squares left and three faded crossed squares eaten.",
        correct_next: "I2",
        recovery_ref: `${FRA01_ID}-R-CONTEXT`
      },
      I2: {
        stage: "independent_transfer",
        question_ref: `${FRA01_ID}-I2`,
        support_level: "none",
        pre_question_script: questions.find((item) => item.id === `${FRA01_ID}-I2`).scripts.before_submit,
        visual_before_answer: "Three strip choices: one valid four-sevenths model, one unequal model, and one four-part model.",
        correct_next: "M1",
        recovery_ref: `${FRA01_ID}-R-EQUAL`
      }
    };

    spec.lesson.practice = {
      intro_script: "",
      question_order: [],
      question_count: 0,
      feedback_policy: "Only evidence-driven fresh confirmations are inserted.",
      between_question_transition: "No quota-based repeated practice."
    };

    spec.lesson.exit = Object.assign({}, spec.lesson.exit, {
      intro_script: "These last three are yours. No hints this time. Do the question first, then I’ll show you the working so you can check your thinking.",
      primary_question_refs: [`${FRA01_ID}-M1`, `${FRA01_ID}-M2`, `${FRA01_ID}-M3`],
      confirmation_question_refs: [
        `${FRA01_ID}-C-EQUAL-1`, `${FRA01_ID}-C-EQUAL-2`,
        `${FRA01_ID}-C-WHOLE-1`, `${FRA01_ID}-C-WHOLE-2`,
        `${FRA01_ID}-C-CONTEXT-1`, `${FRA01_ID}-C-CONTEXT-2`,
        `${FRA01_ID}-C-ORDER-1`, `${FRA01_ID}-C-ORDER-2`
      ],
      confirmation_by_primary: {
        [`${FRA01_ID}-M1`]: `${FRA01_ID}-C-ORDER-1`,
        [`${FRA01_ID}-M2`]: `${FRA01_ID}-C-WHOLE-1`,
        [`${FRA01_ID}-M3`]: `${FRA01_ID}-C-EQUAL-1`
      },
      repair_by_primary: {
        [`${FRA01_ID}-M1`]: `${FRA01_ID}-R-ORDER`,
        [`${FRA01_ID}-M2`]: `${FRA01_ID}-R-WHOLE`,
        [`${FRA01_ID}-M3`]: `${FRA01_ID}-R-EQUAL`
      },
      post_repair_retest_refs: [
        `${FRA01_ID}-C-ORDER-1`, `${FRA01_ID}-C-ORDER-2`,
        `${FRA01_ID}-C-WHOLE-1`, `${FRA01_ID}-C-WHOLE-2`,
        `${FRA01_ID}-C-EQUAL-1`, `${FRA01_ID}-C-EQUAL-2`,
        `${FRA01_ID}-C-CONTEXT-1`, `${FRA01_ID}-C-CONTEXT-2`
      ],
      mastery_logic: {
        "3_correct_of_3": "SECURE",
        "2_correct_of_3": "One fresh targeted confirmation; wrong routes to targeted repair and fresh recheck.",
        "0_or_1_correct_of_3": "Repair actual weaknesses, then use fresh final items without replaying unrelated practice."
      }
    });

    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: {
        G2: { type: "guided_strong", next: "F2" },
        I2: { type: "pending_no_hint_confirmations", next: "M1" }
      },
      repair_by_error_family: {
        equal_parts: `${FRA01_ID}-R-EQUAL`,
        whole_not_identified: `${FRA01_ID}-R-WHOLE`,
        target_part: `${FRA01_ID}-R-CONTEXT`,
        order_reversal: `${FRA01_ID}-R-ORDER`,
        unknown: `${FRA01_ID}-R-WHOLE`
      },
      fresh_checks_by_error_family: {
        equal_parts: [`${FRA01_ID}-C-EQUAL-1`, `${FRA01_ID}-C-EQUAL-2`],
        whole_not_identified: [`${FRA01_ID}-C-WHOLE-1`, `${FRA01_ID}-C-WHOLE-2`],
        target_part: [`${FRA01_ID}-C-CONTEXT-1`, `${FRA01_ID}-C-CONTEXT-2`],
        order_reversal: [`${FRA01_ID}-C-ORDER-1`, `${FRA01_ID}-C-ORDER-2`],
        unknown: [`${FRA01_ID}-C-WHOLE-1`, `${FRA01_ID}-C-ORDER-1`]
      },
      no_hint_confirmation_by_question: {
        [`${FRA01_ID}-I1`]: `${FRA01_ID}-C-CONTEXT-1`,
        [`${FRA01_ID}-I2`]: `${FRA01_ID}-C-EQUAL-1`
      }
    };

    spec.completion = {
      secure: {
        title: "FRA-01 complete",
        ryan_script: "Nice work. You’ve got the key idea: a fraction describes equal parts of a whole, and you can read that idea in different situations. That’s FRA-01 done.",
        buttons: ["Back to Fractions", "Start again"]
      },
      needs_work: {
        title: "Keep building the idea",
        ryan_script: "The key idea still needs one more look: find the whole, check the parts are equal, then count the part the question asks about.",
        buttons: ["Try FRA-01 again", "Back to Fractions"]
      }
    };

    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: "3.1",
      storyboard_version: "2.0",
      runtime_applied: true,
      source_of_truth: "Revily_FRA01_Storyboard_v2.pdf with FRA01_CANONICAL_SPEC.ts as the structured companion",
      objective: "Interpret a fraction as a number of equal parts of one whole or quantity.",
      core_mental_model: ["Define the whole", "Split/count equal parts", "Focus on the part asked about", "Read/write the fraction"],
      capabilities: {
        engagement_only_questions: true,
        optional_hints: true,
        hint_evidence: true,
        guided_fraction_builder: true,
        final_working_after_locked_submit: true,
        targeted_repairs: true,
        fresh_confirmations: true
      },
      out_of_scope: ["global diagnostic engine", "cross-lesson retrieval practice", "formal numerator and denominator teaching"]
    };

    return spec;
  }

  window.RevilyFra01CanonicalV2 = { apply, buildQuestions };
})();
