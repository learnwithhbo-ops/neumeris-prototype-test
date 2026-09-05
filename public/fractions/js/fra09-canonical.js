(function () {
  "use strict";

  const FRA09_ID = "FRA-09";
  const CONTENT_VERSION = "fra09-canonical-handoff-v1";
  const approved = window.RevilyFra09Approved;
  const runtimeCopy = window.FRA09_RUNTIME_COPY || {};
  const prefixed = (id) => `${FRA09_ID}-${id}`;
  const textFor = (id) => {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA09 runtime utterance: ${id}`);
    return entry.text;
  };
  const textsFor = (ids) => (ids || []).map(textFor);

  function collectObjects(value, output) {
    if (Array.isArray(value)) return value.forEach((item) => collectObjects(item, output));
    if (!value || typeof value !== "object") return;
    output.push(value);
    Object.values(value).forEach((item) => collectObjects(item, output));
  }

  function validateRuntimeContract(registry, lessonSpec) {
    const selectedRegistry = registry || runtimeCopy;
    const selectedSpec = lessonSpec || approved;
    const issues = [];
    Object.entries(selectedRegistry).forEach(([id, entry]) => {
      if (!String(entry?.text || "").trim()) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
    });
    const objects = [];
    collectObjects(selectedSpec, objects);
    objects.forEach((object) => {
      if (Object.prototype.hasOwnProperty.call(object, "captionText")) issues.push("captionText is forbidden");
      Object.entries(object).forEach(([key, value]) => {
        if (key.endsWith("UtteranceIds") && Array.isArray(value)) value.forEach((id) => {
          if (!selectedRegistry[id]) issues.push(`Missing runtime utterance ${id}`);
        });
      });
      if (object.utteranceId && object.anchorText) {
        const entry = selectedRegistry[object.utteranceId];
        if (!entry) issues.push(`Cue points to missing utterance ${object.utteranceId}`);
        else if (!entry.text.toLowerCase().includes(String(object.anchorText).toLowerCase())) {
          issues.push(`Cue anchor is absent from ${object.utteranceId}`);
        }
      }
    });
    return issues;
  }

  function toModel(visual, accessibleDescription) {
    return Object.assign({}, visual || {}, {
      context: "fra09_given_factor",
      accessibleDescription: accessibleDescription || "Use the stated factor on both numbers for one exact division step."
    });
  }

  function optionLabel(question, id) {
    return (question.learnerUI?.options || []).find((option) => option.id === id)?.label || String(id);
  }

  function responseFor(question) {
    if (question.response.kind === "fraction_pair") {
      return { type: "fraction", accept_equivalent_notation: false, partLabel: "New numerator", wholeLabel: "New denominator" };
    }
    if (question.response.kind === "integer") {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: question.response.editableField,
        fixedNumerator: question.response.fixedNumerator,
        fixedDenominator: question.response.fixedDenominator,
        input_label: question.response.editableField === "numerator" ? "Complete the numerator" : "Complete the denominator"
      };
    }
    return { type: "single_choice", options: (question.learnerUI?.options || []).map((option) => option.label), keyboard_submit: true };
  }

  function answerFor(question) {
    if (question.response.kind === "fraction_pair") return `${question.answer.numerator}/${question.answer.denominator}`;
    if (question.response.kind === "single_choice") return optionLabel(question, question.answer);
    return String(question.answer);
  }

  function visibleWorkedSteps(question) {
    const visual = question.visual || {};
    const original = visual.originalFraction;
    const factor = visual.givenFactor ?? visual.proposedFactor;
    const result = visual.resultFraction;
    if (original && result && factor) {
      return `1. Check that ${factor} divides both ${original.numerator} and ${original.denominator} exactly. 2. ${original.numerator} divided by ${factor} is ${result.numerator}, and ${original.denominator} divided by ${factor} is ${result.denominator}. 3. The requested one-step result is ${result.numerator}/${result.denominator}.`;
    }
    if (original && factor && visual.kind === "factor_validity_card") {
      const works = original.numerator % factor === 0 && original.denominator % factor === 0;
      return `1. Check ${original.numerator} divided by ${factor}. 2. Check ${original.denominator} divided by ${factor}. 3. ${factor} ${works ? "does" : "does not"} divide both numbers exactly.`;
    }
    const correctOption = optionLabel(question, question.answer);
    if (question.learnerUI?.options?.length) return `1. Apply the stated factor to both numbers. 2. Compare both quotients with the options. 3. The line that follows the requested single step is ${correctOption}`;
    return original && factor ? `1. Check the supplied factor on both original numbers. 2. Divide both numbers by ${factor}. 3. Stop after that one requested step.` : "";
  }

  function errorFeedback(question) {
    return Object.fromEntries(Object.entries(question.feedback?.errorSpecificUtteranceIds || {}).map(([family, ids]) => [family, textsFor(ids)[0] || ""]));
  }

  function convertQuestion(question, overrides) {
    const optionIdByLabel = Object.fromEntries((question.learnerUI?.options || []).map((option) => [option.label, option.id]));
    const correctIds = [...(question.feedback?.correctUtteranceIds || [])];
    const defaultIds = [...(question.feedback?.incorrectDefaultUtteranceIds || [])];
    const workedIds = [...(question.workedCheck?.ryanUtteranceIds || [])];
    return Object.assign({
      id: prefixed(question.id),
      stage: question.stage === "final" || question.stage.startsWith("recovery_") ? "exit" : question.stage,
      target: question.learnerUI?.stageLabel || question.family,
      prompt: question.learnerUI?.prompt,
      questionDetail: question.learnerUI?.supportingInstruction || "",
      assessmentIntent: question.authorOnly?.assessmentIntent,
      evidenceFamily: question.family,
      model: toModel(question.visual, question.learnerUI?.accessibleDescription),
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy || "none",
        solutionPolicy: question.policy?.solutionPolicy || "after_response",
        scored: question.policy?.scored !== false,
        answerLocksOnSubmit: question.policy?.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.requiresFreshNoHintConfirmationIfHintUsed === true
      },
      attempt_policy: { submit_label: question.learnerUI?.submitLabel || question.response?.submitLabel || "Check answer" },
      visual: { primitive: "fra09_context", action: "focus", description: question.learnerUI?.accessibleDescription || question.learnerUI?.prompt },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: textsFor(correctIds)[0] || "",
        on_correct_math: "",
        on_incorrect_reaction: textsFor(defaultIds)[0] || "",
        on_incorrect_attempt_1: textsFor(defaultIds)[0] || "",
        on_incorrect_attempt_2: textsFor(defaultIds)[0] || "",
        error_family_feedback: errorFeedback(question),
        response_feedback: {},
        worked_explanation: visibleWorkedSteps(question),
        worked_narration: textsFor(workedIds)
      },
      runtimeOutcome: {
        correctUtteranceIds: correctIds,
        errorSpecificUtteranceIds: Object.fromEntries(Object.entries(question.feedback?.errorSpecificUtteranceIds || {}).map(([family, ids]) => [family, [...ids]])),
        incorrectDefaultUtteranceIds: defaultIds,
        workedCheckUtteranceIds: workedIds
      },
      mathematical_support: question.learnerUI?.hint?.text ? { hint_1: question.learnerUI.hint.text } : {},
      runtimeQuestionId: question.id,
      runtimeQuestionData: question,
      optionIdByLabel,
      errorClassification: { kind: "fra09", fallback: "UNKNOWN" },
      primaryErrorFamily: "UNKNOWN"
    }, overrides || {});
  }

  function fractionRepairQuestion(repair, id, prompt, answer, feedback, stage) {
    const original = repair.visual?.originalFraction || repair.freshRecheck?.originalFraction;
    const factor = repair.visual?.givenFactor || repair.visual?.factor || repair.freshRecheck?.givenFactor;
    return {
      id,
      stage,
      family: "DIRECT",
      learnerUI: { stageLabel: stage === "repair" ? "Quick repair" : "Fresh check", prompt, accessibleDescription: prompt },
      visual: Object.assign({}, repair.visual, { kind: stage === "repair" ? repair.visual.kind : "fraction_transform", originalFraction: original, givenFactor: factor, resultFraction: answer }),
      response: { kind: "fraction_pair", submitLabel: "Check answer" },
      answer,
      evaluation: { kind: "exact_given_factor_fraction", formSensitive: true, allowEquivalentAlternative: false },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: true, answerLocksOnSubmit: false },
      ryanBeforeSubmitUtteranceIds: [],
      feedback
    };
  }

  function convertRepair(repair) {
    const interaction = repair.supportedInteraction;
    const repairModel = Object.assign({}, repair.visual, { supportedPrompt: interaction.prompt });
    const factorCheck = interaction.prompt.match(/Can\s+(\d+)\s+simplify\s+(\d+)\/(\d+)\s+exactly/i);
    if (factorCheck) {
      repairModel.supportedFactor = Number(factorCheck[1]);
      repairModel.supportedOriginalFraction = { numerator: Number(factorCheck[2]), denominator: Number(factorCheck[3]) };
    }
    let response;
    let answer;
    if (typeof interaction.answer === "number") {
      response = { type: "integer", input_label: "Your answer" };
      answer = String(interaction.answer);
    } else if (interaction.answer && typeof interaction.answer === "object") {
      response = { type: "fraction", accept_equivalent_notation: false, partLabel: "Numerator factor", wholeLabel: "Denominator factor" };
      answer = `${interaction.answer.numeratorFactor}/${interaction.answer.denominatorFactor}`;
    } else {
      response = { type: "single_choice", options: [...(interaction.options || ["yes", "no"])], keyboard_submit: true };
      answer = String(interaction.answer);
    }
    const correctIds = [...interaction.feedback.correctUtteranceIds];
    const incorrectIds = [...interaction.feedback.incorrectDefaultUtteranceIds];
    return {
      id: prefixed(repair.id), stage: "repair", target: "Targeted repair", prompt: interaction.prompt,
      assessmentIntent: `repair_${repair.errorFamily}`, evidenceFamily: repair.errorFamily,
      model: toModel(repairModel, interaction.prompt), response, answer: { value: answer },
      policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: false, repairInteraction: true },
      attempt_policy: { submit_label: "Check answer" },
      visual: { primitive: "fra09_context", action: "repair", description: interaction.prompt },
      scripts: {
        reteach: textsFor(repair.ryanUtteranceIds),
        on_correct_reaction: textsFor(correctIds)[0] || "",
        on_incorrect_reaction: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_1: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_2: textsFor(incorrectIds)[0] || "",
        error_family_feedback: {}, response_feedback: {}, worked_explanation: "", worked_narration: []
      },
      runtimeOutcome: { correctUtteranceIds: correctIds, errorSpecificUtteranceIds: {}, incorrectDefaultUtteranceIds: incorrectIds, workedCheckUtteranceIds: [] },
      errorClassification: { fallback: repair.errorFamily }, primaryErrorFamily: repair.errorFamily,
      freshCheckId: prefixed(`${repair.id}-RECHECK`)
    };
  }

  function convertRepairRecheck(repair) {
    const item = repair.freshRecheck;
    let question;
    if (item.answer && typeof item.answer === "object") {
      const promptMatch = item.prompt.match(/Simplify\s+(\d+)\/(\d+)\s+by (?:a factor of\s+)?(\d+)/i);
      const originalFraction = promptMatch ? { numerator: Number(promptMatch[1]), denominator: Number(promptMatch[2]) } : repair.visual.originalFraction;
      const givenFactor = promptMatch ? Number(promptMatch[3]) : repair.visual.givenFactor;
      question = fractionRepairQuestion(repair, `${repair.id}-RECHECK`, item.prompt, item.answer, item.feedback, "confirmation");
      question.visual = { kind: "fraction_transform", originalFraction, givenFactor, resultFraction: item.answer, showWorkingBeforeSubmit: false };
    } else {
      const proposed = item.prompt.match(/Can\s+(\d+)\s+simplify\s+(\d+)\/(\d+)/i);
      question = {
        id: `${repair.id}-RECHECK`, stage: "confirmation", family: repair.errorFamily,
        learnerUI: { stageLabel: "Fresh check", prompt: item.prompt, options: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }], accessibleDescription: item.prompt },
        visual: { kind: "factor_validity_card", originalFraction: { numerator: Number(proposed?.[2]), denominator: Number(proposed?.[3]) }, proposedFactor: Number(proposed?.[1]), showDivisionResultsBeforeSubmit: false },
        response: { kind: "single_choice", submitLabel: "Check answer" }, answer: item.answer,
        evaluation: { kind: "single_choice", errorFamilyByOption: { [item.answer === "yes" ? "no" : "yes"]: repair.errorFamily } },
        policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: true, answerLocksOnSubmit: false },
        ryanBeforeSubmitUtteranceIds: [], feedback: item.feedback
      };
    }
    return convertQuestion(question, { runtimeQuestionId: null, runtimeQuestionData: null, primaryErrorFamily: repair.errorFamily });
  }

  function sceneCues(scene) {
    return (scene.timelineCues || []).map((cue, index) => ({
      id: `${scene.id}.CUE.${index + 1}`,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: `${scene.id}_${cue.target}`,
      accessibleLabel: scene.learnerUI?.title || scene.learnerUI?.stageLabelTo || "Fraction model"
    }));
  }

  function teachingStep(scene, nextId) {
    const title = scene.learnerUI?.title || `${scene.learnerUI?.stageLabelFrom || "Learn the idea"} to ${scene.learnerUI?.stageLabelTo || "Try it"}`;
    const cues = sceneCues(scene);
    return {
      id: scene.id, purpose: title,
      scene: { display_title: title, initial_state: title, objects: [scene.visual.kind], model: toModel(scene.visual, title) },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 650 })),
      learner_action: scene.interaction || null,
      next_step: nextId
    };
  }

  function normaliseRuntimeResponse(question, response) {
    if (response && typeof response === "object" && "n" in response && "d" in response) {
      return { numerator: Number(response.n), denominator: Number(response.d) };
    }
    if (question.response?.type === "integer") return Number(response);
    return question.optionIdByLabel?.[String(response)] || response;
  }

  function evaluateResponse(question, response) {
    if (question.runtimeQuestionId) {
      return window.RevilyFra09Canonical.evaluateQuestionResponse(question.runtimeQuestionId, normaliseRuntimeResponse(question, response));
    }
    if (question.response?.type === "fraction") {
      const submitted = normaliseRuntimeResponse(question, response);
      const original = question.model?.originalFraction;
      const factor = question.model?.givenFactor;
      if (original && factor) return window.RevilyFra09Canonical.classifyDirectFractionResponse({ original, factor, submitted });
    }
    return { correct: false, errorFamily: question.primaryErrorFamily || "UNKNOWN" };
  }

  function validateQuestionModel(question) {
    const issues = [];
    const model = question?.model;
    if (!model || model.context !== "fra09_given_factor") return ["FRA09 model context is missing"];
    const original = model.originalFraction;
    if (original && (!Number.isInteger(original.numerator) || !Number.isInteger(original.denominator) || original.numerator <= 0 || original.denominator <= 0)) {
      issues.push("original fraction must contain positive integers");
    }
    const factor = model.givenFactor ?? model.proposedFactor ?? model.factor;
    if (factor !== undefined && (!Number.isInteger(factor) || factor < 2 || factor > 10)) issues.push("supplied factor must be an integer from 2 to 10");
    if (original && model.resultFraction && factor && model.kind !== "factor_validity_card") {
      if (original.numerator / factor !== model.resultFraction.numerator || original.denominator / factor !== model.resultFraction.denominator) {
        issues.push("result fraction must be the exact one-step quotient pair");
      }
    }
    return issues;
  }

  function buildQuestions() {
    return [
      ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.repairs.map((repair) => convertRepair(repair)),
      ...approved.repairs.map((repair) => convertRepairRecheck(repair))
    ];
  }

  function chooseMiniChecks(missedQuestionIds, questionBank) {
    const pools = approved.adaptiveRoute.twoOfFourRecovery.miniCheckPoolByFamily;
    const selected = [];
    missedQuestionIds.forEach((questionId) => {
      const family = questionBank.find((question) => question.id === questionId)?.evidenceFamily;
      const candidate = (pools[family] || []).map(prefixed).find((id) => !selected.includes(id));
      if (candidate && selected.length < 2) selected.push(candidate);
    });
    Object.values(pools).flat().map(prefixed).forEach((candidate) => {
      if (selected.length < 2 && !selected.includes(candidate)) selected.push(candidate);
    });
    ["MC-DIRECT", "MC-MISSING", "MC-FACTOR", "MC-ERROR", "MC-FORM"].forEach((id) => {
      const candidate = prefixed(id);
      if (selected.length < 2 && !selected.includes(candidate)) selected.push(candidate);
    });
    return selected.slice(0, 2);
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA09 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA09 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const repairByFamily = Object.fromEntries(Object.entries(approved.adaptiveRoute.repairMap).map(([family, id]) => [family, prefixed(id)]));
    const repairRecheckByFamily = Object.fromEntries(approved.repairs.map((repair) => [repair.errorFamily, prefixed(`${repair.id}-RECHECK`)]));

    spec.identity = Object.assign({}, spec.identity, { id: FRA09_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;
    const nextScene = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = approved.teachingScenes.map((scene) => teachingStep(scene, nextScene[scene.id]));
    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const transferNext = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const question = questionBank.find((item) => item.id === prefixed(id));
      const intro = id === "I1"
        ? [...textsFor(approved.runtimeTransitions.beforeIndependentPracticeUtteranceIds), ...question.scripts.before_submit]
        : question.scripts.before_submit;
      return [id, {
        stage: question.stage === "independent" ? "independent_transfer" : question.stage,
        question_ref: question.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: intro,
        visual_before_answer: question.prompt,
        correct_next: transferNext[id],
        recovery_ref: null
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Only mapped confirmations and repairs are used.", between_question_transition: "" };
    spec.lesson.exit = {
      intro_script: textsFor(approved.runtimeTransitions.beforeFinalCheckUtteranceIds),
      primary_question_refs: approved.adaptiveRoute.finalCoreIds.map(prefixed),
      confirmation_question_refs: approved.questions.filter((question) => ["confirmation", "recovery_mini_check", "recovery_final"].includes(question.stage)).map((question) => prefixed(question.id)),
      repair_by_primary: {}, post_repair_retest_refs: [],
      mastery_policy: {
        secureMinimum: approved.adaptiveRoute.finalMasteryRule.minimumCorrect,
        requireMoreThanOneEvidenceFamily: approved.adaptiveRoute.finalMasteryRule.minimumDistinctFamiliesCorrect > 1,
        blockRepeatedCentralMisconception: !approved.adaptiveRoute.finalMasteryRule.repeatedCentralMisconceptionAllowed,
        repeatedCentralFamilies: Object.keys(approved.adaptiveRoute.repairMap),
        twoCorrectRequiredFreshSuccesses: 2,
        zeroOrOneCorrectRequiredFreshSuccesses: 4
      },
      fra09_recovery: {
        miniCheckSize: 2,
        bothMiniChecksFirstAttempt: true,
        miniCheckPoolByFamily: Object.fromEntries(Object.entries(approved.adaptiveRoute.twoOfFourRecovery.miniCheckPoolByFamily).map(([family, ids]) => [family, ids.map(prefixed)])),
        freshFinalIds: approved.adaptiveRoute.zeroOrOneRecovery.freshFinalIds.map(prefixed),
        chooseMiniChecks: true,
        applySameMasteryRule: true
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "guided_strong", questionRefs: [prefixed("G1"), prefixed("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1", introUtteranceIds: approved.runtimeTransitions.afterHintSupportedSuccessUtteranceIds },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: Object.fromEntries(Object.keys(repairByFamily).map((family) => [family, [repairRecheckByFamily[family]].filter(Boolean)])),
      no_hint_confirmation_by_question: Object.fromEntries(Object.entries(approved.adaptiveRoute.hintConfirmationMap).map(([id, confirmation]) => [prefixed(id), prefixed(confirmation)])),
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.runtimeTransitions.onLessonCompletionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building this one-step method", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan", voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)", locale: "en-GB", opening_mode: "authored_scene_only",
      success_reaction_policy: { mode: "question_specific_only" },
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "authored_audio_then_browser_speech", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra09_context", one_step_only: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra09_context", "fraction_input", "integer_input", "single_choice", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: approved.handoffVersion,
      engine_profile: "fra09",
      exact_runtime_copy: true,
      runtime_applied: true,
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn - support nearby", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      learner_boundary: approved.scope.deliberatelyLaterOrExcluded,
      migration: { resetIncompatibleState: true, preserveSoundPreference: true, archivePreviousAttempt: true },
      capabilities: { exact_given_factor_step: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, targeted_repairs: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra09Adapter = { apply, buildQuestions, chooseMiniChecks, evaluateResponse, runtimeCopy, textFor, validateQuestionModel, validateRuntimeContract };
})();
