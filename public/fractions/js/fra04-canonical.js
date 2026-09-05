(function () {
  "use strict";

  const FRA04_ID = "FRA-04";
  const SYMBOLS = Object.freeze(["<", ">", "="]);

  function pair(leftNumerator, leftDenominator, rightNumerator, rightDenominator, answer, extras) {
    return Object.assign({
      context: "fraction_comparison",
      left: { numerator: leftNumerator, denominator: leftDenominator },
      right: { numerator: rightNumerator, denominator: rightDenominator },
      answer,
      sameWholeSize: true,
      showVisualInitially: true,
      visualKind: "aligned_fraction_bars"
    }, extras || {});
  }

  function symbolResponse() {
    return { type: "comparison_symbol", options: [...SYMBOLS], keyboard_submit: true };
  }

  function choiceResponse(options) {
    return { type: "single_choice", options, keyboard_submit: true };
  }

  function question(id, stage, intent, prompt, comparisonModel, response, answer, extras) {
    const overrides = extras || {};
    return Object.assign({
      id: `${FRA04_ID}-${id}`,
      stage,
      target: overrides.target || prompt,
      assessmentIntent: intent,
      evidenceFamily: overrides.evidenceFamily || intent,
      prompt,
      model: comparisonModel,
      response,
      answer: { value: String(answer) },
      policy: Object.assign({
        hintPolicy: "none",
        solutionPolicy: "after_response",
        scored: true
      }, overrides.policy || {}),
      visual: Object.assign({
        primitive: "fra04_context",
        action: "focus",
        description: prompt
      }, overrides.visual || {}),
      scripts: Object.assign({}, overrides.scripts || {}),
      mathematical_support: Object.assign({}, overrides.mathematical_support || {}),
      errorClassification: Object.assign({}, overrides.errorClassification || {}),
      misconceptionChecks: overrides.misconceptionChecks || [],
      recovery_item_ref: overrides.recovery_item_ref || null,
      primaryErrorFamily: overrides.primaryErrorFamily || "unknown"
    }, overrides.fields || {});
  }

  function comparisonQuestion(id, stage, intent, prompt, comparisonModel, answer, extras) {
    return question(id, stage, intent, prompt, comparisonModel, symbolResponse(), answer, extras);
  }

  function buildQuestions() {
    const questions = [];

    questions.push(question(
      "HOOK-CHOICE", "opening", "opening_choice", "Which would you choose?",
      pair(3, 4, 3, 8, ">", { teachingVariant: "hook", material: "chocolate" }),
      choiceResponse(["Three quarters", "Three eighths"]), "Three quarters",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true },
        scripts: {
          engagement_response_by_value: {
            "Three quarters": [
              "Three quarters is the greater amount.",
              "Both fractions count three pieces, but quarters are larger than eighths, so three quarters is more."
            ],
            "Three eighths": [
              "You chose three eighths.",
              "Both fractions count three pieces, but eighths are smaller than quarters. Three quarters is the greater amount."
            ]
          }
        },
        primaryErrorFamily: "unknown",
        evidenceFamily: "opening_choice"
      }
    ));

    questions.push(comparisonQuestion(
      "G1", "guided", "same_denominator_comparison", "Complete: 3/8 ? 6/8",
      pair(3, 8, 6, 8, "<", { structure: "same_denominator" }), "<",
      {
        policy: { hintPolicy: "guided" },
        scripts: {
          before_submit: "Same denominator. The pieces are the same size. Which side has more of those pieces?",
          on_correct_math: "Exactly. Both are eighths, so every piece is the same size. Six eighths is more pieces than three eighths.",
          on_incorrect_attempt_1: "The denominators already match. Look at the number of eighth-sized pieces.",
          on_incorrect_attempt_2: "Both fractions are made of the same-sized pieces. Once the denominator matches, compare how many of those pieces you have."
        },
        mathematical_support: { hint_1: "The denominators already match. Look at the number of eighth-sized pieces." },
        errorClassification: { symbolDirectionRequiresMagnitudeEvidence: true, choiceFamilies: { ">": "same_denominator", "=": "same_denominator" }, fallback: "unknown" },
        recovery_item_ref: `${FRA04_ID}-R-SAME-DENOM`,
        primaryErrorFamily: "same_denominator",
        evidenceFamily: "same_denominator"
      }
    ));

    questions.push(comparisonQuestion(
      "G2", "guided", "same_numerator_comparison", "Complete: 2/3 ? 2/7",
      pair(2, 3, 2, 7, ">", { structure: "same_numerator" }), ">",
      {
        policy: { hintPolicy: "guided" },
        scripts: {
          before_submit: "Same numerator this time. You have two pieces on each side. Which pieces are larger?",
          on_correct_math: "Yes. Both have two pieces, but thirds are larger than sevenths. So two thirds is greater.",
          on_incorrect_attempt_1: "The 7 is larger, but it means the whole was cut into more pieces. More equal pieces means each piece is smaller. Compare the size of two thirds with two sevenths.",
          on_incorrect_attempt_2: "The numerator is the same, so both fractions count the same number of pieces. The denominator tells how small those pieces are."
        },
        mathematical_support: { hint_1: "The 7 is larger, but it means the whole was cut into more pieces. More equal pieces means each piece is smaller. Compare the size of two thirds with two sevenths." },
        errorClassification: { symbolDirectionRequiresMagnitudeEvidence: true, choiceFamilies: { "<": "same_numerator", "=": "same_numerator" }, fallback: "unknown" },
        recovery_item_ref: `${FRA04_ID}-R-SAME-NUM`,
        primaryErrorFamily: "same_numerator",
        evidenceFamily: "same_numerator"
      }
    ));

    questions.push(comparisonQuestion(
      "F1", "faded", "same_denominator_symbolic", "Complete: 4/11 ? 7/11",
      pair(4, 11, 7, 11, "<", { structure: "same_denominator", showVisualInitially: false }), "<",
      {
        policy: { hintPolicy: "optional" },
        scripts: {
          before_submit: "This time there is no picture. Use the structure you already know.",
          on_incorrect_attempt_2: "Both fractions are made of the same-sized pieces. Once the denominator matches, compare how many of those pieces you have."
        },
        mathematical_support: { hint_1: "The denominators match, so the parts are the same size. Compare how many parts you have." },
        errorClassification: { choiceFamilies: { ">": "same_denominator", "=": "same_denominator" }, fallback: "unknown" },
        recovery_item_ref: `${FRA04_ID}-R-SAME-DENOM`,
        primaryErrorFamily: "same_denominator",
        evidenceFamily: "same_denominator"
      }
    ));

    const f2Options = [
      "A. 5/6, because sixths are larger pieces than ninths.",
      "B. 5/9, because 9 is the larger denominator.",
      "C. They are equal because both numerators are 5."
    ];
    questions.push(question(
      "F2", "faded", "same_numerator_reasoning", "Which is greater: 5/6 or 5/9?",
      pair(5, 6, 5, 9, ">", { structure: "same_numerator", visualKind: "reasoning_mcq", showVisualInitially: false }),
      choiceResponse(f2Options), f2Options[0],
      {
        policy: { hintPolicy: "optional" },
        mathematical_support: { hint_1: "The numerators match. Imagine one whole cut into six equal pieces and the same whole cut into nine." },
        scripts: { on_incorrect_attempt_2: "The numerator is the same, so both fractions count the same number of pieces. The denominator tells how small those pieces are." },
        errorClassification: {
          choiceFamilies: { [f2Options[1]]: "same_numerator", [f2Options[2]]: "equality_ignored" },
          fallback: "unknown"
        },
        recovery_item_ref: `${FRA04_ID}-R-SAME-NUM`,
        primaryErrorFamily: "same_numerator",
        evidenceFamily: "same_numerator_reasoning"
      }
    ));

    questions.push(comparisonQuestion(
      "I1", "independent", "independent_same_denominator", "Complete: 7/12 ? 3/12",
      pair(7, 12, 3, 12, ">", { structure: "same_denominator", showVisualInitially: false }), ">",
      {
        policy: { hintPolicy: "optional", requiresFreshNoHintConfirmationIfHintUsed: true },
        mathematical_support: { hint_1: "Same denominator means the pieces are the same size. Compare the number of pieces." },
        scripts: { on_incorrect_attempt_2: "Both fractions are made of the same-sized pieces. Once the denominator matches, compare how many of those pieces you have." },
        errorClassification: { choiceFamilies: { "<": "same_denominator", "=": "same_denominator" }, fallback: "unknown" },
        recovery_item_ref: `${FRA04_ID}-R-SAME-DENOM`,
        primaryErrorFamily: "same_denominator",
        evidenceFamily: "same_denominator"
      }
    ));

    questions.push(comparisonQuestion(
      "I2", "independent", "independent_same_numerator", "Complete: 4/5 ? 4/9",
      pair(4, 5, 4, 9, ">", { structure: "same_numerator", showVisualInitially: false }), ">",
      {
        policy: { hintPolicy: "optional", requiresFreshNoHintConfirmationIfHintUsed: true },
        mathematical_support: { hint_1: "Same numerator means the same number of pieces. Which denominator makes each piece bigger?" },
        scripts: { on_incorrect_attempt_2: "The numerator is the same, so both fractions count the same number of pieces. The denominator tells how small those pieces are." },
        errorClassification: { choiceFamilies: { "<": "same_numerator", "=": "same_numerator" }, fallback: "unknown" },
        recovery_item_ref: `${FRA04_ID}-R-SAME-NUM`,
        primaryErrorFamily: "same_numerator",
        evidenceFamily: "same_numerator"
      }
    ));

    function finalSymbol(id, intent, prompt, comparisonModel, answer, worked, family, reactions) {
      return comparisonQuestion(id, "final", intent, prompt, comparisonModel, answer, {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: {
          on_correct_reaction: reactions.correct,
          on_incorrect_reaction: reactions.incorrect,
          worked_explanation: worked
        },
        errorClassification: answer === "="
          ? { choiceFamilies: { "<": "equality_ignored", ">": "equality_ignored" }, fallback: "unknown" }
          : { choiceFamilies: Object.fromEntries(SYMBOLS.filter((symbol) => symbol !== answer).map((symbol) => [symbol, family])), fallback: "unknown" },
        primaryErrorFamily: family,
        evidenceFamily: family
      });
    }

    questions.push(finalSymbol(
      "M1", "final_same_denominator", "Complete: 7/10 ? 9/10",
      pair(7, 10, 9, 10, "<", { structure: "same_denominator", showVisualInitially: false }), "<",
      "Both fractions are tenths, so the pieces are the same size. Nine tenths contains more of those pieces than seven tenths.",
      "same_denominator",
      {
        correct: "You compared the tenths correctly. Here’s the working.",
        incorrect: "Recheck the number of tenths on each side. Here’s the working."
      }
    ));
    questions.push(finalSymbol(
      "M2", "final_same_numerator", "Complete: 3/4 ? 3/11",
      pair(3, 4, 3, 11, ">", { structure: "same_numerator", showVisualInitially: false }), ">",
      "Both count three parts. Quarters are larger than elevenths because the same whole is split into fewer equal pieces. Therefore 3/4 > 3/11.",
      "same_numerator",
      {
        correct: "You compared the quarters and elevenths correctly. Here’s the working.",
        incorrect: "Recheck which pieces are larger: quarters or elevenths. Here’s the working."
      }
    ));
    questions.push(finalSymbol(
      "M3", "final_equality", "Complete: 6/13 ? 12/26",
      pair(6, 13, 12, 26, "=", { structure: "equality", visualKind: "equality_pair", showVisualInitially: true }), "=",
      "Six thirteenths and twelve twenty-sixths cover the same amount of an equal whole. Each thirteenth has been split into two twenty-sixths, so 6/13 = 12/26.",
      "equality_ignored",
      {
        correct: "You recognised that the two fractions are equal. Here’s the working.",
        incorrect: "These fractions name the same amount. Here’s the working."
      }
    ));

    const m4Options = [
      "A. The student is right: the larger denominator always makes the larger fraction.",
      "B. The student is wrong: with the same numerator, twelfths are smaller pieces than eighths, so 5/12 < 5/8.",
      "C. They are equal because both numerators are 5.",
      "D. You cannot compare fractions unless the denominators are the same."
    ];
    questions.push(question(
      "M4", "final", "final_denominator_misconception_reasoning",
      "A student says: “5/12 is greater than 5/8 because 12 is greater than 8.” Which response is correct?",
      pair(5, 12, 5, 8, "<", { structure: "same_numerator", visualKind: "reasoning_mcq", showVisualInitially: false }),
      choiceResponse(m4Options), m4Options[1],
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: {
          on_correct_reaction: "You corrected the denominator mistake. Here’s the working.",
          on_incorrect_reaction: "Recheck what a larger denominator does to the piece size. Here’s the working.",
          worked_explanation: "The numerator is the same, so compare piece size. An eighth of a whole is larger than a twelfth. Five eighths is therefore greater than five twelfths."
        },
        errorClassification: {
          choiceFamilies: {
            [m4Options[0]]: "same_numerator",
            [m4Options[2]]: "equality_ignored",
            [m4Options[3]]: "unknown"
          },
          fallback: "unknown"
        },
        primaryErrorFamily: "same_numerator",
        evidenceFamily: "same_numerator_reasoning"
      }
    ));

    function reteach(id, family, prompt, comparisonModel, narration, freshId) {
      return question(id, "repair", `repair_${family}`, prompt, comparisonModel,
        { type: "continue" }, "continue",
        {
          policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: false, reteachOnly: true },
          scripts: { reteach: narration },
          fields: { errorFamily: family, freshCheckId: `${FRA04_ID}-${freshId}` },
          primaryErrorFamily: family,
          evidenceFamily: `repair_${family}`
        });
    }

    questions.push(reteach(
      "R-SAME-DENOM", "same_denominator", "Compare the count of same-sized pieces.",
      pair(2, 9, 6, 9, "<", { structure: "same_denominator", teachingVariant: "repair_same_denominator" }),
      ["Both fractions are made of the same-sized pieces. Once the denominator matches, compare how many of those pieces you have."],
      "C-SAME-DENOM-1"
    ));
    questions.push(reteach(
      "R-SAME-NUM", "same_numerator", "Compare the size of each piece.",
      pair(3, 5, 3, 10, ">", { structure: "same_numerator", teachingVariant: "repair_same_numerator" }),
      ["The numerator is the same, so both fractions count the same number of pieces. The denominator tells how small those pieces are."],
      "C-SAME-NUM-1"
    ));
    questions.push(reteach(
      "R-SYMBOL", "symbol_direction", "Make the symbol face the larger value.",
      pair(7, 9, 4, 9, ">", { structure: "same_denominator", teachingVariant: "repair_symbol", visualKind: "comparison_symbol" }),
      ["You found the larger fraction. Now make the symbol face it: the open side faces the larger value; the point faces the smaller value."],
      "C-SYMBOL-1"
    ));
    questions.push(reteach(
      "R-EQUALITY", "equality_ignored", "Use equals when neither fraction is larger.",
      pair(5, 12, 5, 12, "=", { structure: "equality", teachingVariant: "repair_equality", visualKind: "equality_pair" }),
      ["Comparison has three possible outcomes. If the fractions are exactly the same value, neither side is bigger. Use equals."],
      "C-EQUALITY-1"
    ));

    function confirmation(id, family, prompt, comparisonModel, answer, worked, reactions) {
      return comparisonQuestion(id, "confirmation", `fresh_${family}`, prompt, comparisonModel, answer, {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit", scored: true, freshConfirmation: true },
        scripts: {
          on_correct_reaction: reactions.correct,
          on_incorrect_reaction: reactions.incorrect,
          worked_explanation: worked
        },
        errorClassification: answer === "="
          ? { choiceFamilies: { "<": "equality_ignored", ">": "equality_ignored" }, fallback: "unknown" }
          : { choiceFamilies: Object.fromEntries(SYMBOLS.filter((symbol) => symbol !== answer).map((symbol) => [symbol, family])), fallback: "unknown" },
        fields: { errorFamily: family },
        primaryErrorFamily: family,
        evidenceFamily: `fresh_${family}`
      });
    }

    questions.push(confirmation("C-SAME-DENOM-1", "same_denominator", "Complete: 5/12 ? 8/12", pair(5, 12, 8, 12, "<", { structure: "same_denominator", showVisualInitially: false }), "<", "Both are twelfths. Five of the same-sized pieces is less than eight, so 5/12 < 8/12.", { correct: "You compared the twelfths correctly. Here’s the working.", incorrect: "Recheck how many twelfths are on each side. Here’s the working." }));
    questions.push(confirmation("C-SAME-DENOM-2", "same_denominator", "Complete: 9/14 ? 5/14", pair(9, 14, 5, 14, ">", { structure: "same_denominator", showVisualInitially: false }), ">", "Both are fourteenths. Nine of the same-sized pieces is more than five, so 9/14 > 5/14.", { correct: "You compared the fourteenths correctly. Here’s the working.", incorrect: "Recheck how many fourteenths are on each side. Here’s the working." }));
    questions.push(confirmation("C-SAME-NUM-1", "same_numerator", "Complete: 4/6 ? 4/11", pair(4, 6, 4, 11, ">", { structure: "same_numerator", showVisualInitially: false }), ">", "Both fractions count four pieces. Sixths are larger pieces than elevenths, so 4/6 > 4/11.", { correct: "You compared the sixths and elevenths correctly. Here’s the working.", incorrect: "Recheck which pieces are larger: sixths or elevenths. Here’s the working." }));
    questions.push(confirmation("C-SAME-NUM-2", "same_numerator", "Complete: 6/7 ? 6/11", pair(6, 7, 6, 11, ">", { structure: "same_numerator", showVisualInitially: false }), ">", "Both fractions count six pieces. Sevenths are larger pieces than elevenths, so 6/7 > 6/11.", { correct: "You compared the sevenths and elevenths correctly. Here’s the working.", incorrect: "Recheck which pieces are larger: sevenths or elevenths. Here’s the working." }));
    questions.push(confirmation("C-SYMBOL-1", "symbol_direction", "Complete: 2/7 ? 5/7", pair(2, 7, 5, 7, "<", { structure: "same_denominator", showVisualInitially: false }), "<", "Five sevenths is larger. The open side faces 5/7 and the point faces 2/7, so 2/7 < 5/7.", { correct: "The symbol now faces five sevenths, the larger fraction. Here’s the working.", incorrect: "Recheck which way the symbol should face between two sevenths and five sevenths. Here’s the working." }));
    questions.push(confirmation("C-SYMBOL-2", "symbol_direction", "Complete: 8/9 ? 3/9", pair(8, 9, 3, 9, ">", { structure: "same_denominator", showVisualInitially: false }), ">", "Eight ninths is larger. The open side faces 8/9 and the point faces 3/9, so 8/9 > 3/9.", { correct: "The symbol now faces eight ninths, the larger fraction. Here’s the working.", incorrect: "Recheck which way the symbol should face between eight ninths and three ninths. Here’s the working." }));
    questions.push(confirmation("C-EQUALITY-1", "equality_ignored", "Complete: 7/15 ? 7/15", pair(7, 15, 7, 15, "=", { structure: "equality", showVisualInitially: false }), "=", "The fractions are identical, so neither is larger. Use equals.", { correct: "You recognised equality between the two fifteenths fractions. Here’s the working.", incorrect: "Neither fifteenths fraction is larger. Here’s the working." }));
    questions.push(confirmation("C-EQUALITY-2", "equality_ignored", "Complete: 8/17 ? 8/17", pair(8, 17, 8, 17, "=", { structure: "equality", showVisualInitially: false }), "=", "The fractions are identical, so neither is larger. Use equals.", { correct: "You recognised equality between the two seventeenths fractions. Here’s the working.", incorrect: "Neither seventeenths fraction is larger. Here’s the working." }));

    return questions;
  }

  function teachingStep(id, title, narration, sceneModel, cues, nextId, questionRef) {
    return {
      id,
      purpose: title,
      scene: {
        display_title: title,
        initial_state: title,
        variant: "fra04_context",
        model: sceneModel
      },
      narration: { script: narration.join(" "), sync_cues: cues || [] },
      animation_timeline: [{ action: "focus", duration_ms: 850 }],
      learner_interaction: { question_ref: questionRef || null, auto_focus: Boolean(questionRef) },
      next_step: nextId,
      branching: { continue: { next_step: nextId } }
    };
  }

  function apply(spec) {
    if (!spec || spec.identity?.id !== FRA04_ID || spec.canonical_lesson?.version === "FRA04-1.1") return spec;

    const questions = buildQuestions();
    const byId = (id) => questions.find((item) => item.id === `${FRA04_ID}-${id}`);
    spec.question_bank = questions;
    spec.diagnostic = {
      enabled: false,
      question_refs: [],
      scope_note: "The future curriculum diagnostic layer is deliberately outside FRA-04."
    };

    spec.identity.status = "canonical_reference_lesson";
    spec.identity.estimated_minutes = { min: 10, max: 22 };
    spec.experience_contract.target_session_minutes = { min: 10, max: 22 };
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
        opening_delay_ms: 1500
      },
      success_reaction_policy: { mode: "engine_select_from_authored_profile" }
    });

    spec.visual_language = Object.assign({}, spec.visual_language, {
      primary_visual_contract: { primitive: "fra04_context" },
      fraction_bar_contract: {
        same_whole_width: true,
        same_denominator_piece_width: true,
        same_numerator_selected_count: true
      },
      canonical_palette: {
        selected: "warm cocoa with inset texture",
        unselected: "cream with visible outline",
        shared_structure: "teal rule line",
        comparison: "ink plus labelled symbol anatomy"
      }
    });

    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, {
      visual_primitives: [
        "fra04_context", "comparison_symbol", "single_choice", "caption_layer",
        "progress_indicator", "optional_hint", "post_submit_working"
      ]
    });

    const hook = teachingStep(
      "HOOK", "Same three pieces — but are they the same amount?",
      ["Both bars have three pieces selected. If I let you choose, would you rather have three quarters of a chocolate bar or three eighths?"],
      pair(3, 4, 3, 8, ">", { teachingVariant: "hook", material: "chocolate", revealSymbol: false }),
      [
        { cue: "three pieces selected", action: "focus_selected_count", accessibleLabel: "Two identical-size chocolate bars. The first has three of four pieces selected; the second has three of eight pieces selected." },
        { cue: "three quarters", action: "focus_left" },
        { cue: "three eighths", action: "focus_right" }
      ],
      "HOOK-CHOICE"
    );
    const hookChoice = teachingStep(
      "HOOK-CHOICE", "Which would you choose?", [],
      pair(3, 4, 3, 8, ">", { teachingVariant: "hook", material: "chocolate", revealSymbol: false }),
      [], "T1", `${FRA04_ID}-HOOK-CHOICE`
    );
    const t1 = teachingStep(
      "T1", "Same denominator: compare the count",
      [
        "Now look at two fractions with the same denominator: three sevenths and five sevenths. Both wholes are split into sevenths, so the pieces are the same size.",
        "Five of the same-sized pieces is more than three, so five sevenths is greater than three sevenths."
      ],
      pair(5, 7, 3, 7, ">", { structure: "same_denominator", teachingVariant: "same_denominator" }),
      [
        { cue: "same denominator", action: "focus_denominators" },
        { cue: "pieces are the same size", action: "focus_piece_width" },
        { cue: "Five of the same-sized pieces", action: "focus_selected_count" }
      ],
      "T2"
    );
    const t2 = teachingStep(
      "T2", "Same numerator: compare piece size",
      [
        "Here the numerator is the same: two thirds and two sevenths. We have two pieces in both fractions. So the question is: which pieces are bigger?",
        "Thirds are bigger pieces than sevenths. So two thirds is greater than two sevenths."
      ],
      pair(2, 3, 2, 7, ">", { structure: "same_numerator", teachingVariant: "same_numerator" }),
      [
        { cue: "numerator is the same", action: "focus_numerators" },
        { cue: "which pieces are bigger", action: "focus_piece_width" },
        { cue: "Thirds are bigger pieces", action: "focus_left_piece" }
      ],
      "T3"
    );
    const t3 = teachingStep(
      "T3", "Make the symbol face the larger value",
      ["The symbol should match the direction of the comparison. The open side faces the larger fraction; the point faces the smaller one."],
      pair(5, 8, 3, 8, ">", { structure: "same_denominator", visualKind: "comparison_symbol", teachingVariant: "symbol_anatomy", reverseExample: true }),
      [
        { cue: "open side", action: "focus_open_side" },
        { cue: "point", action: "focus_point" }
      ],
      "T4"
    );
    const t4 = teachingStep(
      "T4", "Equality is a real outcome",
      ["Sometimes there is nothing to choose between them. If both fractions are exactly the same value, use equals."],
      pair(4, 9, 4, 9, "=", { structure: "equality", visualKind: "equality_pair", teachingVariant: "equality" }),
      [{ cue: "exactly the same value", action: "align_equal_bars" }, { cue: "equals", action: "reveal_equals" }],
      "HANDOFF"
    );
    const handoff = teachingStep(
      "HANDOFF", "Two useful patterns",
      ["Two useful patterns: same denominator means same-size pieces; same numerator means same number of pieces. I’ll stay with you for two, then you take over."],
      pair(3, 8, 5, 8, "<", { teachingVariant: "handoff", structure: "summary" }),
      [{ cue: "same denominator", action: "show_same_denominator_rule" }, { cue: "same numerator", action: "show_same_numerator_rule" }],
      "G1"
    );

    spec.lesson.teaching_steps = [hook, hookChoice, t1, t2, t3, t4, handoff];
    spec.lesson.transfer_steps = {
      G1: {
        stage: "guided", question_ref: `${FRA04_ID}-G1`, support_level: "high",
        pre_question_script: byId("G1").scripts.before_submit,
        visual_before_answer: "Two equal-width wholes divided into eighths, showing 3/8 and 6/8.",
        correct_next: "G2", recovery_ref: `${FRA04_ID}-R-SAME-DENOM`
      },
      G2: {
        stage: "guided", question_ref: `${FRA04_ID}-G2`, support_level: "high",
        pre_question_script: byId("G2").scripts.before_submit,
        visual_before_answer: "Two equal-width wholes showing two thirds and two sevenths.",
        correct_next: "F1", recovery_ref: `${FRA04_ID}-R-SAME-NUM`
      },
      F1: {
        stage: "faded", question_ref: `${FRA04_ID}-F1`, support_level: "reduced",
        pre_question_script: byId("F1").scripts.before_submit,
        visual_before_answer: "A symbolic comparison with no fraction bars initially.",
        correct_next: "F2", recovery_ref: `${FRA04_ID}-R-SAME-DENOM`
      },
      F2: {
        stage: "faded", question_ref: `${FRA04_ID}-F2`, support_level: "reduced",
        pre_question_script: "",
        visual_before_answer: "A same-numerator reasoning choice with no answer revealed.",
        correct_next: "I1", recovery_ref: `${FRA04_ID}-R-SAME-NUM`
      },
      I1: {
        stage: "independent_transfer", question_ref: `${FRA04_ID}-I1`, support_level: "none",
        pre_question_script: "Now you take over. If you want a clue, tap Ask for a hint. If not, leave it closed and trust the structure.",
        visual_before_answer: "A symbolic same-denominator comparison with no bar initially.",
        correct_next: "I2", recovery_ref: `${FRA04_ID}-R-SAME-DENOM`
      },
      I2: {
        stage: "independent_transfer", question_ref: `${FRA04_ID}-I2`, support_level: "none",
        pre_question_script: "",
        visual_before_answer: "A symbolic same-numerator comparison with no bar initially.",
        correct_next: "M1", recovery_ref: `${FRA04_ID}-R-SAME-NUM`
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
      "C-SAME-DENOM-1", "C-SAME-DENOM-2", "C-SAME-NUM-1", "C-SAME-NUM-2",
      "C-SYMBOL-1", "C-SYMBOL-2", "C-EQUALITY-1", "C-EQUALITY-2"
    ].map((id) => `${FRA04_ID}-${id}`);

    spec.lesson.exit = {
      intro_script: "These last four are yours. No hints this time. Do the comparison first, then I’ll show you the working so you can check your thinking.",
      primary_question_refs: ["M1", "M2", "M3", "M4"].map((id) => `${FRA04_ID}-${id}`),
      confirmation_question_refs: confirmationIds,
      repair_by_primary: {
        [`${FRA04_ID}-M1`]: `${FRA04_ID}-R-SAME-DENOM`,
        [`${FRA04_ID}-M2`]: `${FRA04_ID}-R-SAME-NUM`,
        [`${FRA04_ID}-M3`]: `${FRA04_ID}-R-EQUALITY`,
        [`${FRA04_ID}-M4`]: `${FRA04_ID}-R-SAME-NUM`
      },
      post_repair_retest_refs: confirmationIds,
      mastery_policy: {
        secureMinimum: 3,
        requireMoreThanOneEvidenceFamily: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: ["same_denominator", "same_numerator"],
        twoCorrectRequiredFreshSuccesses: 2,
        zeroOrOneCorrectRequiredFreshSuccesses: 4
      },
      mastery_logic: {
        "3_or_4_correct_of_4": "SECURE only with no repeated central misconception.",
        "2_correct_of_4": "Targeted repair, then a fresh two-item mini-check.",
        "0_or_1_correct_of_4": "Repair actual weaknesses, then use fresh final items."
      }
    };

    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: {
        G2: {
          type: "guided_strong",
          questionRefs: [`${FRA04_ID}-G1`, `${FRA04_ID}-G2`],
          next: "F2",
          otherwise: "F1"
        }
      },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      repair_by_error_family: {
        same_denominator: `${FRA04_ID}-R-SAME-DENOM`,
        same_numerator: `${FRA04_ID}-R-SAME-NUM`,
        symbol_direction: `${FRA04_ID}-R-SYMBOL`,
        equality_ignored: `${FRA04_ID}-R-EQUALITY`
      },
      fresh_checks_by_error_family: {
        same_denominator: [`${FRA04_ID}-C-SAME-DENOM-1`, `${FRA04_ID}-C-SAME-DENOM-2`],
        same_numerator: [`${FRA04_ID}-C-SAME-NUM-1`, `${FRA04_ID}-C-SAME-NUM-2`],
        symbol_direction: [`${FRA04_ID}-C-SYMBOL-1`, `${FRA04_ID}-C-SYMBOL-2`],
        equality_ignored: [`${FRA04_ID}-C-EQUALITY-1`, `${FRA04_ID}-C-EQUALITY-2`],
        unknown: [`${FRA04_ID}-C-SAME-DENOM-2`, `${FRA04_ID}-C-SAME-NUM-2`]
      },
      no_hint_confirmation_by_question: {
        [`${FRA04_ID}-I1`]: `${FRA04_ID}-C-SAME-DENOM-1`,
        [`${FRA04_ID}-I2`]: `${FRA04_ID}-C-SAME-NUM-1`
      },
      feedback_by_error_family: {
        same_denominator: "The denominators match; compare how many same-sized parts.",
        same_numerator: "More equal pieces means each piece is smaller.",
        symbol_direction: "Make the open side face the larger value.",
        equality_ignored: "Neither is larger. Check whether they are equal.",
        support_needed: "Use the shared structure to decide which value is larger.",
        unknown: "Use the shared structure to decide which value is larger."
      }
    };

    spec.completion = {
      secure: {
        title: "FRA-04 complete",
        ryan_script: "You can compare fractions when they share a denominator or a numerator, and you know what the comparison symbols mean. That’s FRA-04 done.",
        buttons: ["Back to Fractions", "Start again"]
      },
      needs_work: {
        title: "Keep building the comparison structure",
        ryan_script: "Compare the count when denominators match, and compare piece size when numerators match, then try FRA-04 again.",
        buttons: ["Try FRA-04 again", "Back to Fractions"]
      }
    };

    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: "FRA04-1.1",
      storyboard_version: "1.0",
      engine_profile: "fra04",
      runtime_applied: true,
      source_of_truth: "Revily_FRA04_Storyboard_v1.pdf with FRA04_CANONICAL_SPEC.ts as the structured companion",
      objective: "Compare fractions with the same denominator or the same numerator using the meaning of the parts.",
      core_mental_model: [
        "Same denominator means same-size pieces",
        "Same numerator means the same number of pieces",
        "The open side faces the larger value",
        "Use equals when both values are equal"
      ],
      phase_labels: {
        teaching: "Learn the idea",
        guided: "Try it with me",
        faded: "Less help",
        independent: "Now you take over",
        repair: "Quick repair",
        exit: "Final check",
        completion: "Complete"
      },
      capabilities: {
        comparison_symbol_control: true,
        aligned_equal_wholes: true,
        optional_hints: true,
        hint_evidence: true,
        final_working_after_locked_submit: true,
        four_item_final: true,
        targeted_repairs: true,
        fresh_confirmations: true
      },
      out_of_scope: [
        "global diagnostic engine",
        "cross-lesson retrieval practice",
        "general unlike-denominator comparison",
        "decimal conversion",
        "negative fractions"
      ]
    };

    return spec;
  }

  window.RevilyFra04Canonical = { apply, buildQuestions, pair };
})();
