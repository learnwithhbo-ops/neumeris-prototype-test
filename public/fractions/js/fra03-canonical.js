(function () {
  "use strict";

  const FRA03_ID = "FRA-03";
  const FINAL_CORRECT = "Wonderful — that’s right. Here’s the working so you can check.";
  const FINAL_INCORRECT = "Not quite. Here’s the working — compare it with what you did.";
  const FORBIDDEN_RYAN_LANGUAGE = /(?:\banimate\b|\bdisplay the fraction\b|\bhighlight this\b|\bmove to the next scene\b|\bstrip away the story\b|\bstoryboard\b|\bimplementation\b|\bdeveloper\b)/i;

  function model(context, totalParts, selectedParts, extras) {
    return Object.assign({ context, totalParts, selectedParts, equalParts: true, unequalParts: false }, extras || {});
  }

  function area(totalParts, selectedParts, extras) {
    return model("area_model", totalParts, selectedParts, extras);
  }

  function set(totalParts, selectedParts, extras) {
    return model("set_model", totalParts, selectedParts, Object.assign({ wholeBoundary: true }, extras || {}));
  }

  function numberLine(intervals, markedInterval, extras) {
    return model("number_line", intervals, markedInterval, Object.assign({ equalIntervals: intervals, markedInterval, start: 0, end: 1 }, extras || {}));
  }

  function fractionResponse() {
    return {
      type: "fraction",
      presentation: "fraction",
      accept_equivalent_notation: false,
      keyboard_submit: true,
      partLabel: "Selected parts",
      wholeLabel: "Equal parts in the whole"
    };
  }

  function choiceResponse(options, optionModels) {
    return { type: "single_choice", options, optionModels: optionModels || [], keyboard_submit: true };
  }

  function multipleChoiceResponse(options, optionModels) {
    return { type: "multiple_choice", options, optionModels, keyboard_submit: true };
  }

  function setBuilderResponse(totalTokens) {
    return { type: "set_builder", totalTokens, keyboard_submit: true };
  }

  function question(id, stage, intent, prompt, questionModel, response, answer, extras) {
    const overrides = extras || {};
    return Object.assign({
      id: `${FRA03_ID}-${id}`,
      stage,
      target: overrides.target || prompt,
      assessmentIntent: intent,
      evidenceFamily: overrides.evidenceFamily || intent,
      prompt,
      model: questionModel,
      response,
      answer: { value: answer },
      policy: Object.assign({ hintPolicy: "none", solutionPolicy: "after_response", scored: true }, overrides.policy || {}),
      visual: Object.assign({ primitive: "fra03_context", action: "focus", description: prompt }, overrides.visual || {}),
      scripts: Object.assign({}, overrides.scripts || {}),
      mathematical_support: Object.assign({}, overrides.mathematical_support || {}),
      errorClassification: Object.assign({}, overrides.errorClassification || {}),
      recovery_item_ref: overrides.recovery_item_ref || null,
      primaryErrorFamily: overrides.primaryErrorFamily || "support_needed"
    }, overrides.fields || {});
  }

  function finalScripts(worked, workedSteps) {
    return {
      on_correct_reaction: FINAL_CORRECT,
      on_incorrect_reaction: FINAL_INCORRECT,
      worked_explanation: worked,
      ...(Array.isArray(workedSteps) ? { worked_steps: workedSteps } : {})
    };
  }

  function buildQuestions() {
    const questions = [];

    questions.push(question(
      "HOOK-CHOICE", "opening", "opening_same_fraction_notice", "Did your fraction change?",
      model("game_progress_compare", 5, 3, {
        fraction: { numerator: 3, denominator: 5 },
        variants: [area(5, 3, { progressTiles: true }), set(5, 3, { challengeBadges: true }), numberLine(5, 3, { routeStyle: true })]
      }),
      choiceResponse(["YES", "NO", "NOT SURE"]), "NO",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true },
        scripts: {
          engagement_label: "Notice what stayed fixed",
          engagement_correct_feedback: "Exactly — the display changed, but the fraction stayed three fifths.",
          engagement_incorrect_feedback: "The pictures changed, but three selected parts out of five stayed fixed, so the fraction did not change.",
          engagement_detail: "Three selected parts out of five equal parts stayed fixed in every display.",
          engagement_feedback: "The display changed. The fraction did not.",
          engagement_response: "The display changed. The fraction did not."
        },
        fields: { revealAllOnResponse: true }
      }
    ));

    questions.push(question(
      "G1", "guided", "area_model_validity_and_whole", "Which progress panel correctly shows 2/5?",
      model("model_choice_prompt", 5, 2, { fraction: { numerator: 2, denominator: 5 } }),
      choiceResponse(["A", "B", "C"], [
        area(5, 2, { label: "A", progressTiles: true }),
        area(5, 2, { label: "B", progressTiles: true, equalParts: false, unequalParts: true, geometry: [1.8, 0.55, 1.2, 0.65, 0.8] }),
        area(6, 2, { label: "C", progressTiles: true })
      ]), "A",
      {
        policy: { hintPolicy: "guided" },
        scripts: {
          before_submit: "Five equal parts. Two selected. Which picture keeps both parts of the fraction?",
          on_correct_math: "Exactly. Five equal parts, with two selected. That area model really does show two fifths.",
          on_incorrect_attempt_1: "Check the whole, then check whether every part has the same area.",
          on_incorrect_attempt_2: "Keep two selected and keep the whole split into five equal parts.",
          response_feedback: {
            B: "The count looks right. Check whether the five pieces are actually equal.",
            C: "You kept the 2, but what happened to the 5?"
          }
        },
        errorClassification: { choiceFamilies: { B: "equal_area", C: "same_fraction" }, fallback: "unknown" },
        recovery_item_ref: `${FRA03_ID}-R-AREA`,
        primaryErrorFamily: "equal_area",
        evidenceFamily: "area_model"
      }
    ));

    const g2Options = ["4/6", "4/7", "5/6", "6/4"];
    questions.push(question(
      "G2", "guided", "number_line_interval_read", "What fraction is marked?",
      numberLine(6, 4, { assessmentVisual: true }),
      choiceResponse(g2Options), "4/6",
      {
        policy: { hintPolicy: "guided" },
        scripts: {
          before_submit: "Count the equal spaces from zero to one. Do not count the tick marks.",
          on_correct_math: "Yes — four of the six equal intervals from zero to one. That is four sixths.",
          on_incorrect_attempt_1: "Count the spaces you travel from zero, not the boundary marks.",
          on_incorrect_attempt_2: "The line has six equal spaces. The point is four spaces from zero, so the marked fraction is four sixths.",
          response_feedback: {
            "4/7": "Those marks are the boundaries. The denominator comes from the equal spaces between them.",
            "5/6": "Zero is the starting boundary, not the first sixth. Count the spaces you travel."
          }
        },
        errorClassification: { choiceFamilies: { "4/7": "interval_count", "5/6": "interval_count", "6/4": "same_fraction" }, fallback: "unknown" },
        recovery_item_ref: `${FRA03_ID}-R-INTERVAL`,
        primaryErrorFamily: "interval_count",
        evidenceFamily: "number_line"
      }
    ));

    questions.push(question(
      "F1", "faded", "set_model_to_symbol", "What fraction of the challenge cards is complete?",
      set(9, 5, { challengeCards: true, assessmentVisual: true }),
      fractionResponse(), "5/9",
      {
        policy: { hintPolicy: "optional" },
        scripts: {
          before_submit: "This time, you do the reading.",
          on_correct_math: "Five complete cards out of the whole group of nine gives five ninths.",
          on_incorrect_attempt_2: "Keep all nine cards in the whole, then count the completed cards for the top number."
        },
        mathematical_support: { hint_1: "Count everything in the whole group first. Then count the completed cards." },
        errorClassification: { swappedFraction: true, denominatorFamilies: { "5": "whole_not_defined" }, fallback: "whole_not_defined" },
        recovery_item_ref: `${FRA03_ID}-R-WHOLE`,
        primaryErrorFamily: "whole_not_defined",
        evidenceFamily: "set_model"
      }
    ));

    questions.push(question(
      "F2", "faded", "area_to_set_translation", "This area model shows 4/7. Which set shows the same fraction?",
      model("translation_prompt", 7, 4, { fraction: { numerator: 4, denominator: 7 }, sourceModel: area(7, 4) }),
      choiceResponse(["A", "B", "C"], [
        set(7, 4, { label: "A", challengeBadges: true }),
        set(7, 3, { label: "B", challengeBadges: true }),
        set(6, 4, { label: "C", challengeBadges: true })
      ]), "A",
      {
        policy: { hintPolicy: "optional" },
        scripts: {
          before_submit: "Keep the fraction fixed while the model changes.",
          on_correct_math: "Seven objects make the whole set and four are selected, so the set keeps four sevenths.",
          on_incorrect_attempt_2: "Keep both parts of four sevenths fixed: four selected objects in a whole set of seven.",
          response_feedback: {
            B: "The whole still has seven objects. Check whether the selected count stayed at four.",
            C: "You kept four selected, but the whole no longer has seven objects."
          }
        },
        mathematical_support: { hint_1: "Keep both numbers fixed: the whole set still needs seven objects, with four selected." },
        errorClassification: { choiceFamilies: { B: "same_fraction", C: "same_fraction" }, fallback: "same_fraction" },
        recovery_item_ref: `${FRA03_ID}-R-SAME-FRACTION`,
        primaryErrorFamily: "same_fraction",
        evidenceFamily: "cross_model"
      }
    ));

    questions.push(question(
      "I1", "independent", "cross_model_matching", "Select every picture that shows 3/7.",
      model("model_choice_prompt", 7, 3, { fraction: { numerator: 3, denominator: 7 }, multiple: true }),
      multipleChoiceResponse(["A", "B", "C", "D", "E"], [
        area(7, 3, { label: "A" }),
        set(7, 3, { label: "B", challengeBadges: true }),
        numberLine(7, 3, { label: "C" }),
        area(7, 3, { label: "D", equalParts: false, unequalParts: true, geometry: [1.7, 0.55, 1.25, 0.6, 1.45, 0.75, 0.7] }),
        numberLine(6, 3, { label: "E" })
      ]), ["A", "B", "C"],
      {
        policy: { hintPolicy: "optional", requiresFreshNoHintConfirmationIfHintUsed: true },
        scripts: {
          on_correct_math: "The area, set and number-line models all keep the same three-out-of-seven relationship.",
          on_incorrect_attempt_2: "Check every model for one clear whole, seven equal parts and three selected or travelled parts.",
          response_feedback: {
            "A|B|C|D": "The counts in D look right, but its regions are not equal.",
            "A|B|C|E": "Count the intervals on E. It does not have seven equal spaces.",
            "A|C": "Check whether the complete set model also keeps all seven objects visible."
          }
        },
        mathematical_support: { hint_1: "Check the whole, the seven equal parts, and the three selected or travelled parts." },
        errorClassification: {
          choiceSetFamilies: {
            "A|B|C|D": "equal_area",
            "A|B|C|E": "interval_count",
            "A|C": "whole_not_defined",
            D: "equal_area",
            E: "interval_count"
          },
          fallback: "same_fraction"
        },
        recovery_item_ref: `${FRA03_ID}-R-SAME-FRACTION`,
        primaryErrorFamily: "same_fraction",
        evidenceFamily: "cross_model"
      }
    ));

    questions.push(question(
      "I2", "independent", "symbol_to_set_model", "Build a set model for 5/8.",
      model("set_builder_target", 8, 5, { fraction: { numerator: 5, denominator: 8 }, wholeBoundary: true }),
      setBuilderResponse(8), "5",
      {
        policy: { hintPolicy: "optional", requiresFreshNoHintConfirmationIfHintUsed: true },
        scripts: {
          before_submit: "Select exactly the part of this eight-object whole that should represent five eighths.",
          on_correct_math: "Five of the eight objects are selected, so your set model shows five eighths.",
          on_incorrect_attempt_2: "Keep all eight objects in the whole set and select exactly five of them."
        },
        mathematical_support: { hint_1: "The 8 fixes the whole set. Now select the number shown on top." },
        errorClassification: { countFamilies: { "8": "same_fraction" }, fallback: "same_fraction" },
        recovery_item_ref: `${FRA03_ID}-R-SAME-FRACTION`,
        primaryErrorFamily: "same_fraction",
        evidenceFamily: "set_model"
      }
    ));

    questions.push(question(
      "M1", "final", "final_area_read", "What fraction is shown?",
      area(10, 7, { assessmentVisual: true }), fractionResponse(), "7/10",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: finalScripts(
          "The whole has 10 equal parts. 7 are selected. So the model shows 7/10.",
          ["The whole has 10 equal parts.", "7 are selected.", "So the model shows 7/10."]
        ),
        primaryErrorFamily: "equal_area",
        evidenceFamily: "area_model"
      }
    ));

    questions.push(question(
      "M2", "final", "final_set_read", "What fraction of the whole group is highlighted?",
      set(12, 5, { assessmentVisual: true }), fractionResponse(), "5/12",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: finalScripts(
          "There are 12 objects in the whole set and 5 are highlighted. The representation is 5/12.",
          ["There are 12 objects in the whole set.", "5 are highlighted.", "The representation is 5/12."]
        ),
        primaryErrorFamily: "whole_not_defined",
        evidenceFamily: "set_model"
      }
    ));

    const m3Options = ["5/8", "5/9", "6/8", "8/5"];
    questions.push(question(
      "M3", "final", "final_number_line_read", "Which fraction is marked?",
      numberLine(8, 5, { assessmentVisual: true }), choiceResponse(m3Options), "5/8",
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: finalScripts(
          "From 0 to 1 there are 8 equal intervals. The marker is 5 intervals from 0. So the point is 5/8.",
          ["From 0 to 1 there are 8 equal intervals.", "The marker is 5 intervals from 0.", "So the point is 5/8."]
        ),
        errorClassification: { choiceFamilies: { "5/9": "interval_count", "6/8": "interval_count", "8/5": "same_fraction" }, fallback: "unknown" },
        primaryErrorFamily: "interval_count",
        evidenceFamily: "number_line"
      }
    ));

    const m4Options = [
      "A. All three are 3/6.",
      "B. Area and set are 3/6; the number line is 3/5.",
      "C. Only the number line is 3/6.",
      "D. None can represent a fraction."
    ];
    questions.push(question(
      "M4", "final", "final_cross_model_error_analysis", "A student says all three show 3/6. Which response is correct?",
      model("cross_model", 6, 3, {
        variants: [area(6, 3), set(6, 3), numberLine(5, 3)],
        renderOptionsOnCanvas: true,
        assessmentVisual: true
      }),
      choiceResponse(m4Options), m4Options[1],
      {
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit" },
        scripts: finalScripts(
          "The area and set models each show three of six equal parts. The number line has five equal intervals and is marked after three, so it shows 3/5.",
          [
            "The area model shows three of six equal regions.",
            "The set model shows three of six objects.",
            "The number line has five equal intervals and is marked after three, so it shows 3/5."
          ]
        ),
        errorClassification: {
          choiceFamilies: {
            [m4Options[0]]: "interval_count",
            [m4Options[2]]: "same_fraction",
            [m4Options[3]]: "whole_not_defined"
          },
          fallback: "unknown"
        },
        primaryErrorFamily: "interval_count",
        evidenceFamily: "cross_model"
      }
    ));

    function reteach(id, family, prompt, repairModel, narrationLine, freshId) {
      return question(id, "repair", `repair_${family}`, prompt, repairModel, { type: "continue" }, "continue", {
        policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: false, reteachOnly: true },
        scripts: { reteach: narrationLine },
        fields: { errorFamily: family, freshCheckId: `${FRA03_ID}-${freshId}` },
        primaryErrorFamily: family
      });
    }

    questions.push(reteach(
      "R-AREA", "equal_area", "Equal counts still need equal areas.",
      model("area_repair", 5, 2, {
        variants: [
          area(5, 2, { equalParts: false, unequalParts: true, geometry: [1.8, 0.55, 1.3, 0.65, 0.7], label: "Not fifths" }),
          area(5, 2, { label: "Valid fifths" })
        ]
      }),
      "The count looked right, but the sizes were not. In an area model, the whole must be split into equal regions before those regions can represent fifths, eighths, or any other equal parts.",
      "C-AREA-1"
    ));

    questions.push(reteach(
      "R-WHOLE", "whole_not_defined", "Keep the complete group visible.",
      model("whole_repair", 5, 2, {
        fraction: { numerator: 2, denominator: 5 },
        variants: [set(5, 2, { label: "Whole kept" }), set(2, 2, { label: "Wrong whole", croppedWhole: true })]
      }),
      "In a set model, the whole is the complete group. The selected objects are only part of that group. If the unselected objects disappear, you can lose the denominator.",
      "C-WHOLE-1"
    ));

    questions.push(reteach(
      "R-INTERVAL", "interval_count", "Count the spaces between the marks.",
      numberLine(4, 3, { fraction: { numerator: 3, denominator: 4 }, teachingVariant: "repair" }),
      "The tick marks show where the parts start and end. The spaces between them are the equal parts. Count the spaces from zero to one.",
      "C-INTERVAL-1"
    ));

    questions.push(reteach(
      "R-SAME-FRACTION", "same_fraction", "Keep the target fraction fixed.",
      model("same_fraction_repair", 7, 4, {
        fraction: { numerator: 4, denominator: 7 },
        variants: [area(7, 4), set(7, 4), numberLine(7, 4)]
      }),
      "You changed the model and accidentally changed the fraction too. If the target is four sevenths, every valid model still has to represent four out of seven equal parts, objects or intervals.",
      "C-SAME-1"
    ));

    function confirmation(id, family, prompt, confirmationModel, response, answer, worked, extras) {
      return question(id, "confirmation", `fresh_${family}`, prompt, confirmationModel, response, answer, Object.assign({
        policy: { hintPolicy: "none", solutionPolicy: "after_locked_submit", scored: true, freshConfirmation: true },
        scripts: finalScripts(worked),
        fields: { errorFamily: family },
        primaryErrorFamily: family,
        evidenceFamily: `fresh_${family}`
      }, extras || {}));
    }

    questions.push(confirmation(
      "C-AREA-1", "equal_area", "Which one can correctly show 2/5?", model("model_choice_prompt", 5, 2),
      choiceResponse(["A", "B"], [area(5, 2, { label: "A" }), area(5, 2, { label: "B", equalParts: false, unequalParts: true, geometry: [0.5, 1.65, 0.7, 1.45, 0.85] })]),
      "A", "A has five equal regions with two selected, so it can show 2/5."
    ));
    questions.push(confirmation(
      "C-AREA-2", "equal_area", "Which picture can correctly show 3/6?", model("model_choice_prompt", 6, 3),
      choiceResponse(["A", "B"], [area(6, 3, { label: "A", equalParts: false, unequalParts: true, geometry: [1.5, 0.6, 1.35, 0.65, 1.2, 0.7] }), area(6, 3, { label: "B" })]),
      "B", "B has six equal regions with three selected, so it can show 3/6."
    ));

    questions.push(confirmation(
      "C-WHOLE-1", "whole_not_defined", "Which model defines the whole correctly for 3/8?",
      model("model_choice_prompt", 8, 3, { fraction: { numerator: 3, denominator: 8 } }),
      choiceResponse(["A", "B"], [set(8, 3, { label: "A" }), set(3, 3, { label: "B", croppedWhole: true })]),
      "A", "A keeps all eight objects visible inside the whole-set boundary and selects three, so it shows 3/8."
    ));
    questions.push(confirmation(
      "C-WHOLE-2", "whole_not_defined", "Which model keeps the whole group fixed for 2/9?",
      model("model_choice_prompt", 9, 2, { fraction: { numerator: 2, denominator: 9 } }),
      choiceResponse(["A", "B"], [set(2, 2, { label: "A", croppedWhole: true }), set(9, 2, { label: "B" })]),
      "B", "B shows all nine objects in the whole group with two selected, so it shows 2/9."
    ));

    questions.push(confirmation(
      "C-INTERVAL-1", "interval_count", "What fraction is marked?", numberLine(7, 5, { assessmentVisual: true }),
      fractionResponse(), "5/7", "The line has seven equal intervals and the point is five intervals from zero, so it shows 5/7."
    ));
    questions.push(confirmation(
      "C-INTERVAL-2", "interval_count", "What fraction is marked?", numberLine(9, 4, { assessmentVisual: true }),
      fractionResponse(), "4/9", "The line has nine equal intervals and the point is four intervals from zero, so it shows 4/9."
    ));

    questions.push(confirmation(
      "C-SAME-1", "same_fraction", "Which set keeps the fraction 5/9?",
      model("model_choice_prompt", 9, 5, { fraction: { numerator: 5, denominator: 9 } }),
      choiceResponse(["A", "B", "C"], [set(9, 5, { label: "A" }), set(8, 5, { label: "B" }), set(9, 4, { label: "C" })]),
      "A", "A keeps five selected objects in a whole set of nine, so it preserves 5/9."
    ));
    questions.push(confirmation(
      "C-SAME-2", "same_fraction", "Which area model keeps the fraction 4/7?",
      model("model_choice_prompt", 7, 4, { fraction: { numerator: 4, denominator: 7 } }),
      choiceResponse(["A", "B", "C"], [area(7, 3, { label: "A" }), area(6, 4, { label: "B" }), area(7, 4, { label: "C" })]),
      "C", "C keeps four selected regions in a whole divided into seven equal regions, so it preserves 4/7."
    ));

    questions.push(confirmation(
      "C-MATCH", "same_fraction", "Select every picture that shows 2/5.",
      model("model_choice_prompt", 5, 2, { fraction: { numerator: 2, denominator: 5 }, multiple: true }),
      multipleChoiceResponse(["A", "B", "C", "D"], [area(5, 2, { label: "A" }), set(5, 2, { label: "B" }), numberLine(5, 2, { label: "C" }), numberLine(6, 2, { label: "D" })]),
      ["A", "B", "C"], "A, B and C each keep two selected or travelled parts out of five equal parts.",
      { evidenceFamily: "fresh_cross_model" }
    ));

    questions.push(confirmation(
      "C-BUILD", "same_fraction", "Build a set model for 3/7.",
      model("set_builder_target", 7, 3, { fraction: { numerator: 3, denominator: 7 }, wholeBoundary: true }),
      setBuilderResponse(7), "3", "Three of the seven objects are selected, so the set model shows 3/7.",
      { evidenceFamily: "fresh_set_model" }
    ));

    return questions;
  }

  function buildNarration(sceneId, lines, eventSpecs) {
    const beats = (lines || []).map((text, index) => ({ id: `${sceneId}-B${index + 1}`, text }));
    const beatById = new Map(beats.map((beat) => [beat.id, beat]));
    const syncCues = (eventSpecs || []).map((event, index) => {
      const beatId = `${sceneId}-B${event.beat}`;
      const beat = beatById.get(beatId);
      if (!beat) throw new Error(`${sceneId} visual event ${index + 1} references missing narration beat ${beatId}`);
      if (!beat.text.toLowerCase().includes(String(event.cue || "").toLowerCase())) throw new Error(`${sceneId} visual event ${index + 1} has a cue that is not present in ${beatId}`);
      return {
        id: event.id || `${sceneId}-V${index + 1}`,
        beatId,
        cue: event.cue,
        action: event.action,
        ...(event.accessibleLabel ? { accessibleLabel: event.accessibleLabel } : {})
      };
    });
    return { beats, script: beats.map((beat) => beat.text).join(" "), sync_cues: syncCues };
  }

  function teachingStep(id, title, lines, sceneModel, events, nextId) {
    return {
      id,
      purpose: title,
      scene: { display_title: title, initial_state: title, variant: "fra03_context", model: sceneModel },
      narration: buildNarration(id, lines, events),
      animation_timeline: [{ action: "focus", duration_ms: 850 }],
      learner_interaction: { question_ref: null, auto_focus: false },
      next_step: nextId,
      branching: { continue: { next_step: nextId } }
    };
  }

  function narrationLinesFromQuestion(question) {
    const scripts = question?.scripts || {};
    return [
      scripts.before_submit,
      scripts.on_correct_math,
      scripts.on_incorrect_attempt_1,
      scripts.on_incorrect_attempt_2,
      scripts.on_correct_reaction,
      scripts.on_incorrect_reaction,
      scripts.worked_explanation,
      scripts.engagement_response,
      scripts.reteach,
      ...Object.values(scripts.response_feedback || {}),
      question?.mathematical_support?.hint_1,
      question?.mathematical_support?.hint_2
    ].flat().filter((value) => typeof value === "string" && value.trim());
  }

  function validateAreaGeometry(candidate, label, issues) {
    if (candidate?.context !== "area_model") return;
    const geometry = Array.isArray(candidate.geometry) ? candidate.geometry : Array.from({ length: candidate.totalParts }, () => 1);
    if (geometry.length !== candidate.totalParts || geometry.some((value) => !(Number(value) > 0))) {
      issues.push(`${label} area geometry does not match its part count`);
      return;
    }
    const first = Number(geometry[0]);
    const allEqual = geometry.every((value) => Math.abs(Number(value) - first) < 1e-9);
    if (candidate.unequalParts && allEqual) issues.push(`${label} invalid area model is not visibly unequal`);
    if (!candidate.unequalParts && candidate.equalParts !== false && !allEqual) issues.push(`${label} equal area model has unequal geometry`);
  }

  function validateNumberLine(candidate, label, issues) {
    if (candidate?.context !== "number_line") return;
    if (candidate.equalIntervals !== candidate.totalParts) issues.push(`${label} line denominator does not equal its interval count`);
    if (!Number.isInteger(candidate.markedInterval) || candidate.markedInterval < 0 || candidate.markedInterval > candidate.equalIntervals) issues.push(`${label} number-line marker is outside the line`);
    if (candidate.fraction && (candidate.fraction.denominator !== candidate.equalIntervals || candidate.fraction.numerator !== candidate.markedInterval)) issues.push(`${label} number-line fraction does not match its geometry`);
  }

  function walkModels(candidate, label, visitor) {
    if (!candidate || typeof candidate !== "object") return;
    visitor(candidate, label);
    (candidate.variants || []).forEach((variant, index) => walkModels(variant, `${label} variant ${index + 1}`, visitor));
    if (candidate.sourceModel) walkModels(candidate.sourceModel, `${label} source`, visitor);
  }

  function validateCanonical(spec) {
    const issues = [];
    const beatIds = new Set();
    (spec.lesson?.teaching_steps || []).forEach((step) => {
      const beats = step.narration?.beats || [];
      beats.forEach((beat) => {
        if (!beat.id || beatIds.has(beat.id)) issues.push(`${step.id} has a missing or duplicate narration beat ID`);
        beatIds.add(beat.id);
        if (!beat.text?.trim()) issues.push(`${beat.id || step.id} has empty Ryan text`);
        if (FORBIDDEN_RYAN_LANGUAGE.test(beat.text || "")) issues.push(`${beat.id || step.id} contains implementation language`);
      });
      if (step.narration?.script !== beats.map((beat) => beat.text).join(" ")) issues.push(`${step.id} caption/TTS text is not derived from its active beats`);
      (step.narration?.sync_cues || []).forEach((event) => {
        const beat = beats.find((item) => item.id === event.beatId);
        if (!beat) issues.push(`${event.id || step.id} is an orphan visual event`);
        else if (!beat.text.toLowerCase().includes(String(event.cue || "").toLowerCase())) issues.push(`${event.id || step.id} is not bound to active Ryan text`);
      });
      walkModels(step.scene?.model, step.id, (candidate, label) => {
        validateAreaGeometry(candidate, label, issues);
        validateNumberLine(candidate, label, issues);
      });
    });

    (spec.question_bank || []).forEach((item) => {
      walkModels(item.model, item.id, (candidate, label) => {
        validateAreaGeometry(candidate, label, issues);
        validateNumberLine(candidate, label, issues);
      });
      (item.response?.optionModels || []).forEach((candidate, index) => walkModels(candidate, `${item.id} option ${index + 1}`, (nested, label) => {
        validateAreaGeometry(nested, label, issues);
        validateNumberLine(nested, label, issues);
      }));
      narrationLinesFromQuestion(item).forEach((line) => {
        if (FORBIDDEN_RYAN_LANGUAGE.test(line)) issues.push(`${item.id} Ryan text contains implementation language`);
      });
      if (item.stage === "final" && (item.policy?.hintPolicy !== "none" || item.policy?.solutionPolicy !== "after_locked_submit")) issues.push(`${item.id} final support leaks before answer lock`);
    });

    const f2 = spec.question_bank?.find((item) => item.id === `${FRA03_ID}-F2`);
    const correctF2 = f2?.response?.optionModels?.[f2.response.options.indexOf(f2.answer.value)];
    if (f2?.model?.fraction?.numerator !== 4 || f2?.model?.fraction?.denominator !== 7 || correctF2?.selectedParts !== 4 || correctF2?.totalParts !== 7) issues.push("FRA-03-F2 does not preserve 4/7 during translation");
    const i1 = spec.question_bank?.find((item) => item.id === `${FRA03_ID}-I1`);
    const correctI1 = (i1?.answer?.value || []).map((value) => i1.response.options.indexOf(value)).map((index) => i1.response.optionModels[index]);
    if (correctI1.some((candidate) => candidate?.selectedParts !== 3 || candidate?.totalParts !== 7)) issues.push("FRA-03-I1 correct models do not all preserve 3/7");
    return issues;
  }

  function apply(spec) {
    if (!spec || spec.identity?.id !== FRA03_ID || spec.canonical_lesson?.version === "FRA03-2.0") return spec;

    const questions = buildQuestions();
    const byId = (id) => questions.find((item) => item.id === `${FRA03_ID}-${id}`);
    spec.question_bank = questions;
    spec.diagnostic = { enabled: false, question_refs: [], scope_note: "A curriculum diagnostic layer is deliberately outside FRA-03." };
    spec.identity.status = "canonical_reference_lesson";
    spec.identity.estimated_minutes = { min: 10, max: 22 };
    spec.experience_contract.target_session_minutes = { min: 10, max: 22 };
    spec.experience_contract.global_ui_copy = Object.assign({}, spec.experience_contract.global_ui_copy, { submit: "Check answer" });
    spec.experience_contract.sequential_locked_working = true;
    spec.experience_contract.deduplicate_exit_repairs = true;
    spec.experience_contract.completion_header_controls = true;

    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      opening_mode: "authored_scene_only",
      caption_presentation: {
        mode: "on_canvas_progressive",
        reveal: "word_by_word",
        max_typical_lines: 2,
        permanent_transcript_bar: false,
        accessible_text_equivalent: true,
        source: "active_ryan_audio_text"
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

    spec.visual_language = Object.assign({}, spec.visual_language, {
      primary_visual_contract: { primitive: "fra03_context" },
      fraction_bar_contract: null,
      canonical_palette: {
        selected: "blue fill plus inset check",
        unselected: "warm neutral fill plus visible outline",
        whole_boundary: "teal dashed outline",
        number_line_mark: "blue point plus vertical stem"
      }
    });

    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, {
      visual_primitives: ["fra03_context", "fraction_input", "single_choice", "multiple_choice", "set_builder", "caption_layer", "progress_indicator", "optional_hint", "post_submit_working"]
    });

    const hook = teachingStep(
      "HOOK", "Your progress changed shape",
      [
        "You’ve finished three of five challenges in a game. That’s three fifths complete.",
        "But your game does not have to show that progress in only one way. Watch the screen change.",
        "Three filled progress tiles. Then three completed challenge badges. Then a marker three stages along the route.",
        "Different pictures. Same progress: three fifths."
      ],
      model("game_progress_transform", 5, 3, {
        fraction: { numerator: 3, denominator: 5 },
        variants: [area(5, 3, { progressTiles: true }), set(5, 3, { challengeBadges: true }), numberLine(5, 3, { routeStyle: true })]
      }),
      [
        { beat: 1, cue: "three of five challenges", action: "fill_progress", accessibleLabel: "A game progress panel has five equal tiles. The first three tiles fill." },
        { beat: 1, cue: "three fifths complete", action: "show_fraction", accessibleLabel: "The first three of five equal progress tiles are filled, and the progress is labelled three fifths complete." },
        { beat: 2, cue: "screen change", action: "prepare_transform" },
        { beat: 3, cue: "Three filled progress tiles", action: "show_progress" },
        { beat: 3, cue: "three completed challenge badges", action: "show_badges", accessibleLabel: "The same canvas now shows five challenge badges, with the first three complete." },
        { beat: 3, cue: "marker three stages along the route", action: "show_route", accessibleLabel: "The same canvas is now a zero-to-one route with five equal intervals and a marker three intervals from zero." },
        { beat: 4, cue: "Different pictures", action: "show_comparison", accessibleLabel: "Three views of the same game progress are compared: an equal-tile panel, a bounded badge set and a zero-to-one route. Each has the same pattern of selected and unselected parts." }
      ],
      "HOOK-ASK"
    );

    const hookAsk = {
      id: "HOOK-ASK",
      purpose: "Notice what stayed fixed",
      scene: {
        display_title: "Did your fraction change?",
        initial_state: "The progress panel, badge set and route are briefly compared.",
        variant: "fra03_context",
        model: byId("HOOK-CHOICE").model
      },
      narration: buildNarration("HOOK-ASK", [], []),
      animation_timeline: [{ action: "focus", duration_ms: 600 }],
      learner_interaction: { question_ref: `${FRA03_ID}-HOOK-CHOICE`, auto_focus: true },
      next_step: "T1",
      branching: { continue: { next_step: "T1" } }
    };

    const t1 = teachingStep(
      "T1", "Area model",
      ["Let’s slow down the first version. This progress panel is one whole area split into five equal tiles. Three are filled. That area model shows three fifths."],
      area(5, 3, { fraction: { numerator: 3, denominator: 5 }, progressTiles: true, teachingVariant: "progress_area" }),
      [
        { beat: 1, cue: "one whole area", action: "focus_whole", accessibleLabel: "One complete rectangular progress panel is outlined as the whole area." },
        { beat: 1, cue: "five equal tiles", action: "show_partitions", accessibleLabel: "The whole panel is now split into five equal tiles. None is selected yet." },
        { beat: 1, cue: "Three are filled", action: "select_three", accessibleLabel: "Tile states in reading order: filled; filled; filled; unfilled; unfilled." },
        { beat: 1, cue: "three fifths", action: "show_fraction", accessibleLabel: "Tile states in reading order: filled; filled; filled; unfilled; unfilled. The fraction three fifths is now shown." }
      ],
      "T2"
    );

    const t2 = teachingStep(
      "T2", "Set model",
      ["Now look at the five challenge badges. The whole is the complete group of five badges. Three are complete, so three fifths of the set is complete."],
      set(5, 3, { fraction: { numerator: 3, denominator: 5 }, challengeBadges: true, teachingVariant: "badge_set" }),
      [
        { beat: 1, cue: "five challenge badges", action: "show_badges", accessibleLabel: "Five challenge badges are visible. None is marked complete yet." },
        { beat: 1, cue: "complete group", action: "focus_whole", accessibleLabel: "One boundary now emphasises all five challenge badges as the whole group." },
        { beat: 1, cue: "Three are complete", action: "select_three", accessibleLabel: "Badge states in reading order: complete; complete; complete; incomplete; incomplete." },
        { beat: 1, cue: "three fifths", action: "show_fraction", accessibleLabel: "Badge states in reading order: complete; complete; complete; incomplete; incomplete. The fraction three fifths is now shown." }
      ],
      "T3"
    );

    const t3 = teachingStep(
      "T3", "Number-line model",
      ["Now look at the route. From zero to one, it is split into five equal spaces. The marker is three spaces from zero, so the point shows three fifths."],
      numberLine(5, 3, { fraction: { numerator: 3, denominator: 5 }, routeStyle: true, teachingVariant: "route" }),
      [
        { beat: 1, cue: "zero to one", action: "show_endpoints", accessibleLabel: "A number line runs from zero to one. The marker begins at zero." },
        { beat: 1, cue: "five equal spaces", action: "band_intervals", accessibleLabel: "The line from zero to one is divided into five equal spaces. The marker remains at zero." },
        { beat: 1, cue: "three spaces from zero", action: "move_marker", accessibleLabel: "Interval states from zero: travelled; travelled; travelled; not travelled; not travelled. The marker is at the boundary where the travelled sequence ends." },
        { beat: 1, cue: "three fifths", action: "show_fraction", accessibleLabel: "Interval states from zero: travelled; travelled; travelled; not travelled; not travelled. The marker and the fraction three fifths are now shown together." }
      ],
      "T4"
    );

    const t4 = teachingStep(
      "T4", "Keep four sevenths fixed",
      [
        "That was three fifths. Let’s make sure the idea works for a new fraction. Keep four sevenths fixed while the model changes.",
        "Seven equal parts in the area. Seven objects in the whole set. Seven equal intervals on the line. Four is the selected count or the distance from zero. Different model; still four sevenths."
      ],
      model("cross_model", 7, 4, {
        fraction: { numerator: 4, denominator: 7 },
        variants: [area(7, 4), set(7, 4), numberLine(7, 4)],
        teachingVariant: "cross_sequence"
      }),
      [
        { beat: 1, cue: "four sevenths", action: "show_target_fraction" },
        { beat: 2, cue: "Seven equal parts in the area", action: "show_area" },
        { beat: 2, cue: "Seven objects in the whole set", action: "show_set" },
        { beat: 2, cue: "Seven equal intervals on the line", action: "show_number_line" },
        { beat: 2, cue: "still four sevenths", action: "show_all_models" }
      ],
      "HANDOFF"
    );

    const handoff = teachingStep(
      "HANDOFF", "Try it with me",
      [
        "You’ve seen one fraction move through three visual languages: area, set and number line.",
        "I’ll stay with you for two questions. Then you’ll start translating between the models yourself."
      ],
      model("handoff", 7, 4, { teachingVariant: "handoff" }),
      [
        { beat: 1, cue: "three visual languages", action: "show_model_names" },
        { beat: 2, cue: "two questions", action: "show_handoff" }
      ],
      "G1"
    );

    spec.lesson.teaching_steps = [hook, hookAsk, t1, t2, t3, t4, handoff];
    spec.lesson.transfer_steps = {
      G1: {
        stage: "guided", question_ref: `${FRA03_ID}-G1`, support_level: "high",
        pre_question_script: byId("G1").scripts.before_submit,
        visual_before_answer: "Three progress panels to compare for two fifths.",
        correct_next: "G2", recovery_ref: `${FRA03_ID}-R-AREA`
      },
      G2: {
        stage: "guided", question_ref: `${FRA03_ID}-G2`, support_level: "high",
        pre_question_script: byId("G2").scripts.before_submit,
        visual_before_answer: "A zero-to-one number line split into six equal intervals with one marked boundary.",
        correct_next: "F1", recovery_ref: `${FRA03_ID}-R-INTERVAL`
      },
      F1: {
        stage: "faded", question_ref: `${FRA03_ID}-F1`, support_level: "reduced",
        pre_question_script: byId("F1").scripts.before_submit,
        visual_before_answer: "A bounded whole group of nine challenge cards with completed cards visibly marked.",
        correct_next: "F2", recovery_ref: `${FRA03_ID}-R-WHOLE`
      },
      F2: {
        stage: "faded", question_ref: `${FRA03_ID}-F2`, support_level: "reduced",
        pre_question_script: byId("F2").scripts.before_submit,
        visual_before_answer: "An area model for four sevenths and three candidate set models.",
        correct_next: "I1", recovery_ref: `${FRA03_ID}-R-SAME-FRACTION`
      },
      I1: {
        stage: "independent_transfer", question_ref: `${FRA03_ID}-I1`, support_level: "none",
        pre_question_script: "Now you translate the models yourself. If you want a clue, tap Ask for a hint. If you do not need it, leave it closed.",
        visual_before_answer: "Five candidate area, set and number-line models for three sevenths.",
        correct_next: "I2", recovery_ref: `${FRA03_ID}-R-SAME-FRACTION`
      },
      I2: {
        stage: "independent_transfer", question_ref: `${FRA03_ID}-I2`, support_level: "none",
        pre_question_script: byId("I2").scripts.before_submit,
        visual_before_answer: "The written fraction five eighths above a bounded set builder with eight objects.",
        correct_next: "M1", recovery_ref: `${FRA03_ID}-R-SAME-FRACTION`
      }
    };

    spec.lesson.practice = {
      intro_script: "", question_order: [], question_count: 0,
      feedback_policy: "Only evidence-driven fresh confirmations are inserted.",
      between_question_transition: "No quota-based repeated practice."
    };

    const confirmationIds = [
      "C-AREA-1", "C-AREA-2", "C-WHOLE-1", "C-WHOLE-2",
      "C-INTERVAL-1", "C-INTERVAL-2", "C-SAME-1", "C-SAME-2",
      "C-MATCH", "C-BUILD"
    ].map((id) => `${FRA03_ID}-${id}`);

    spec.lesson.exit = {
      intro_script: "These last four are yours. No hints this time. Do the question first, then I’ll show you the working so you can check your thinking.",
      primary_question_refs: ["M1", "M2", "M3", "M4"].map((id) => `${FRA03_ID}-${id}`),
      confirmation_question_refs: confirmationIds,
      repair_by_primary: {
        [`${FRA03_ID}-M1`]: `${FRA03_ID}-R-AREA`,
        [`${FRA03_ID}-M2`]: `${FRA03_ID}-R-WHOLE`,
        [`${FRA03_ID}-M3`]: `${FRA03_ID}-R-INTERVAL`,
        [`${FRA03_ID}-M4`]: `${FRA03_ID}-R-SAME-FRACTION`
      },
      post_repair_retest_refs: confirmationIds,
      mastery_policy: {
        secureMinimum: 3,
        requireMoreThanOneEvidenceFamily: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: ["equal_area", "whole_not_defined", "interval_count", "same_fraction"],
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
        G2: { type: "guided_strong", questionRefs: [`${FRA03_ID}-G1`, `${FRA03_ID}-G2`], next: "F2", otherwise: "F1" }
      },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      repair_by_error_family: {
        equal_area: `${FRA03_ID}-R-AREA`,
        whole_not_defined: `${FRA03_ID}-R-WHOLE`,
        interval_count: `${FRA03_ID}-R-INTERVAL`,
        same_fraction: `${FRA03_ID}-R-SAME-FRACTION`
      },
      fresh_checks_by_error_family: {
        equal_area: [`${FRA03_ID}-C-AREA-1`, `${FRA03_ID}-C-AREA-2`],
        whole_not_defined: [`${FRA03_ID}-C-WHOLE-1`, `${FRA03_ID}-C-WHOLE-2`],
        interval_count: [`${FRA03_ID}-C-INTERVAL-1`, `${FRA03_ID}-C-INTERVAL-2`],
        same_fraction: [`${FRA03_ID}-C-SAME-1`, `${FRA03_ID}-C-SAME-2`],
        unknown: [`${FRA03_ID}-C-WHOLE-1`, `${FRA03_ID}-C-INTERVAL-1`]
      },
      no_hint_confirmation_by_question: {
        [`${FRA03_ID}-I1`]: `${FRA03_ID}-C-MATCH`,
        [`${FRA03_ID}-I2`]: `${FRA03_ID}-C-BUILD`
      },
      feedback_by_error_family: {
        equal_area: "The counts look right. Check whether the parts are equal.",
        whole_not_defined: "Show me the whole group first. Keep every object that belongs to it visible.",
        interval_count: "Count the spaces between the marks, not the marks themselves.",
        same_fraction: "The model changed. Check that both numbers in the target fraction stayed fixed.",
        support_needed: "Find the whole, identify the equal parts, then count the selected amount.",
        unknown: "Find the whole, identify the equal parts, then count the selected amount."
      }
    };

    spec.completion = {
      secure: {
        title: "Representations connected",
        ryan_script: "Nice work. You can recognise the same fraction when the picture changes — area, set or number line. That’s FRA-03 done.",
        buttons: ["Back to Fractions", "Start again"]
      },
      needs_work: {
        title: "Keep connecting the models",
        ryan_script: "Find the whole, count the equal parts or intervals, then count what is selected before you try FRA-03 again.",
        buttons: ["Try FRA-03 again", "Back to Fractions"]
      }
    };

    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: "FRA03-2.0",
      storyboard_version: "2.0",
      engine_profile: "fra03",
      runtime_applied: true,
      source_of_truth: "Revily_FRA03_Storyboard_v2.pdf with FRA03_CANONICAL_SPEC.ts as the structured companion and FRA03_CODEX_IMPLEMENTATION_PROMPT.md as the QA contract",
      objective: "Represent the same fraction using area models, sets and number lines, and match a representation to its fraction.",
      core_mental_model: ["Find the whole", "Read the fraction", "Identify the equal parts in this model", "Keep the same fraction as the picture changes"],
      phase_labels: {
        teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn", independent: "Now you take over",
        repair: "Quick repair", exit: "Final check", completion: "Complete"
      },
      capabilities: {
        continuous_game_progress_hook: true,
        stable_narration_beats: true,
        orphan_event_validation: true,
        optional_hints: true,
        hint_evidence: true,
        multiple_model_selection: true,
        interactive_set_builder: true,
        final_working_after_locked_submit: true,
        four_item_final: true,
        targeted_repairs: true,
        fresh_confirmations: true
      },
      out_of_scope: ["global diagnostic engine", "cross-lesson retrieval practice", "equivalence transformations", "number-line estimation", "fraction operations"]
    };

    const issues = validateCanonical(spec);
    if (issues.length) throw new Error(`FRA-03 v2 canonical validation failed: ${issues.join("; ")}`);
    return spec;
  }

  window.RevilyFra03Canonical = { apply, buildNarration, buildQuestions, validateCanonical };
})();
