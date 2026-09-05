(function () {
  "use strict";

  const LESSON_ID = "FRA-08";
  const CONTENT_VERSION = "fra08-equivalent-fractions-v1";
  const source = window.RevilyFra08V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const sceneTitles = {
    HOOK: "Keep the progress fixed",
    T1: "The whole and the value stay fixed",
    T2: "Scale both fraction numbers",
    T3: "Find the hidden factor",
    T4: "Build the whole fraction",
    T5: "Check both numbers changed together",
    HANDOFF: "Your equivalent-fraction plan"
  };

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA08 runtime utterance: ${id}`);
    return entry;
  }

  const textFor = (id) => runtimeEntry(id).text;
  const textsFor = (ids) => (ids || []).map(textFor);

  function toModel(visual, extra) {
    return Object.assign({ context: "fra08_equivalent_fraction" }, visual || {}, extra || {});
  }

  function optionsFor(question) {
    return question.visual?.options || [];
  }

  function responseFor(question) {
    const response = question.response || {};
    if (response.kind === "fraction_input") {
      return {
        type: "fraction",
        accept_equivalent_notation: false,
        input_label: "Equivalent fraction",
        partLabel: "Numerator",
        wholeLabel: "Denominator"
      };
    }
    if (response.kind === "factor_then_integer") {
      return {
        type: "factor_then_integer",
        factorOptions: [...response.factorOptions],
        revealSecondStageOnlyAfterCorrectFactor: response.revealSecondStageOnlyAfterCorrectFactor === true,
        editableField: response.missingField,
        input_label: response.missingField === "numerator" ? "Missing numerator" : "Missing denominator"
      };
    }
    if (response.kind === "single_choice") {
      return {
        type: "single_choice",
        options: optionsFor(question).map((option) => option.label),
        optionIds: optionsFor(question).map((option) => option.id),
        keyboard_submit: true
      };
    }
    const visual = question.visual || {};
    const equation = visual.kind === "fraction_equation";
    return {
      type: "integer",
      presentation: equation ? "fraction_builder" : "integer_input",
      editableField: response.missingField,
      fixedNumerator: equation ? (visual.right?.numerator === "missing" ? null : visual.right?.numerator) : null,
      fixedDenominator: equation ? (visual.right?.denominator === "missing" ? null : visual.right?.denominator) : null,
      input_label: response.missingField === "numerator" ? "Missing numerator" : response.missingField === "denominator" ? "Missing denominator" : "Number of marked parts"
    };
  }

  function answerFor(question) {
    const answer = question.answer || {};
    if (answer.kind === "fraction") return `${answer.value.numerator}/${answer.value.denominator}`;
    if (answer.kind === "choice") return optionsFor(question).find((option) => option.id === answer.optionId)?.label || answer.optionId;
    if (answer.kind === "factor_then_integer") return { factor: String(answer.factor), value: String(answer.value) };
    return String(answer.value);
  }

  function responseKeyForSignal(question, signal) {
    const observed = signal?.observed || {};
    if (observed.kind === "integer") return [String(observed.value)];
    if (observed.kind === "factor") return [`factor:${observed.value}`];
    if (observed.kind === "fraction") return [`${observed.value.numerator}/${observed.value.denominator}`];
    if (observed.kind === "choice") {
      const label = optionsFor(question).find((option) => option.id === observed.optionId)?.label;
      return label ? [label] : [String(observed.optionId)];
    }
    if (observed.kind === "predicate") return [`predicate:${observed.description}`];
    return [];
  }

  function classificationFor(question) {
    const result = {
      choiceFamilies: {}, integerFamilies: {}, fractionFamilies: {}, factorFamilies: {}, predicates: [],
      repeatedResponseKeys: {}, fallback: "unknown", requiresRepeatedEvidence: false
    };
    (question.errorSignals || []).forEach((signal) => {
      const keys = responseKeyForSignal(question, signal);
      keys.forEach((key) => {
        if (key.startsWith("predicate:")) result.predicates.push({ description: key.slice(10), family: signal.family });
        else if (key.startsWith("factor:")) result.factorFamilies[key.slice(7)] = signal.family;
        else if (question.response.kind === "single_choice") result.choiceFamilies[key] = signal.family;
        else if (question.response.kind === "fraction_input") result.fractionFamilies[key] = signal.family;
        else result.integerFamilies[key] = signal.family;
      });
      if (signal.classificationRule === "repeat_or_paired_evidence" || signal.classificationRule === "arithmetic_only_unless_repeated") {
        keys.forEach((key) => { result.repeatedResponseKeys[key] = true; });
      }
    });
    return result;
  }

  function outcomeMetadata(question) {
    const specific = {};
    (question.errorSignals || []).forEach((signal) => responseKeyForSignal(question, signal).forEach((key) => {
      specific[key] = [...(signal.feedbackUtteranceIds || [])];
    }));
    return {
      correctUtteranceIds: [...(question.feedback?.correctUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(question.feedback?.incorrectDefaultUtteranceIds || [])],
      errorSpecificUtteranceIdsByResponse: specific,
      workedCheckUtteranceIds: [...(question.workedCheck?.ryanUtteranceIds || [])]
    };
  }

  function finalEvidenceFamily(id) {
    const families = {
      M1: "procedural_full_build", RF1: "procedural_full_build",
      M2: "hidden_scale_up", RF2: "hidden_scale_up",
      M3: "reverse_scale_down", RF3: "reverse_scale_down",
      M4: "reasoning_error_analysis", RF4: "reasoning_error_analysis",
      M5: "visual_or_context_transfer", RF5: "visual_or_context_transfer"
    };
    return families[unprefix(id)] || "equivalence_generation";
  }

  function primaryFamily(question) {
    return question.errorSignals?.[0]?.family || (question.scale?.operation === "divide" ? "direction" : "one_denominator");
  }

  function convertQuestion(question, overrides) {
    const outcome = outcomeMetadata(question);
    const responseFeedback = {};
    Object.entries(outcome.errorSpecificUtteranceIdsByResponse).forEach(([key, ids]) => {
      responseFeedback[key] = textsFor(ids)[0] || "";
    });
    const policy = question.policy || {};
    return Object.assign({
      id: prefix(question.id),
      stage: question.stage === "final" || question.stage === "recovery_final" ? "exit" : question.stage,
      target: finalEvidenceFamily(question.id).replace(/_/g, " "),
      assessmentIntent: question.authorOnlyAssessmentIntent,
      evidenceFamily: finalEvidenceFamily(question.id),
      prompt: question.learnerPrompt,
      model: toModel(question.visual, {
        operation: question.scale?.operation,
        factor: question.scale?.factor,
        canonicalSignature: question.canonicalSignature,
        answer: question.answer
      }),
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: policy.hintPolicy || "none",
        solutionPolicy: policy.solutionPolicy || "after_resolved_response",
        scored: policy.scored !== false,
        answerLocksOnSubmit: policy.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: policy.requiresFreshNoHintConfirmationIfHintUsed === true,
        countsAsIndependentEvidence: policy.countsAsIndependentEvidence === true,
        countsAsFreshEvidence: policy.countsAsFreshEvidence === true,
        formSensitive: policy.formSensitive === true,
        canonicalSignature: question.canonicalSignature
      },
      attempt_policy: { submit_label: question.response?.submitLabel || "Check answer" },
      visual: { primitive: "fra08_context", action: "focus", description: question.learnerPrompt },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: textsFor(outcome.correctUtteranceIds)[0] || "",
        on_correct_math: "",
        on_incorrect_reaction: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_1: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_2: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        worked_explanation: (question.workedCheck?.visibleSteps || []).join(" | "),
        worked_narration: textsFor(outcome.workedCheckUtteranceIds),
        response_feedback: responseFeedback
      },
      runtimeOutcome: outcome,
      mathematical_support: question.hint ? { hint_1: question.hint.learnerVisibleText } : {},
      errorClassification: classificationFor(question),
      primaryErrorFamily: primaryFamily(question),
      canonicalQuestion: question
    }, overrides || {});
  }

  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: `fra08_${cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`
    }));
  }

  function teachingStep(scene, nextId) {
    const title = sceneTitles[scene.id] || "Equivalent fractions";
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: title,
      scene: {
        display_title: title,
        initial_state: title,
        objects: [scene.visual.kind],
        model: toModel(scene.visual, { sceneId: scene.id })
      },
      narration: {
        script: textsFor(scene.ryanUtteranceIds),
        utterance_ids: [...scene.ryanUtteranceIds],
        sync_cues: cues
      },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 650 })),
      next_step: nextId
    };
  }

  function buildHookQuestion() {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    return {
      id: prefix("HOOK-CHOICE"),
      stage: "opening",
      target: "Predict the fixed progress endpoint",
      assessmentIntent: "unscored endpoint prediction",
      evidenceFamily: "opening_prediction",
      prompt: hook.interaction.learnerPrompt,
      model: toModel(hook.visual, { sceneId: "HOOK-CHOICE", revealLitBlocks: 6 }),
      response: { type: "single_choice", options: hook.interaction.optionValues.map(String), keyboard_submit: true },
      answer: { value: "6" },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Reveal the tracker" },
      visual: { primitive: "fra08_context", action: "focus", description: hook.interaction.learnerPrompt },
      scripts: {
        engagement_label: "Compare the endpoints",
        engagement_correct_feedback: "",
        engagement_incorrect_feedback: "",
        engagement_detail: "",
        engagement_correct_response: textsFor(hook.interaction.commonRevealUtteranceIds),
        engagement_incorrect_response: textsFor(hook.interaction.commonRevealUtteranceIds)
      },
      runtimeOutcome: { correctUtteranceIds: [], incorrectDefaultUtteranceIds: [], commonRevealUtteranceIds: [...hook.interaction.commonRevealUtteranceIds] },
      primaryErrorFamily: "unknown",
      errorClassification: { fallback: "unknown" }
    };
  }

  function buildQuestions() {
    const all = [
      ...approved.questions,
      ...approved.confirmationQuestions,
      ...approved.repairQuestions,
      ...approved.recoveryQuestions
    ];
    const repairsBySupported = Object.fromEntries(approved.repairs.map((repair) => [repair.supportedQuestionId, repair]));
    return [buildHookQuestion(), ...all.map((question) => {
      const repair = repairsBySupported[question.id];
      const converted = convertQuestion(question, repair ? {
        stage: "repair",
        scripts: Object.assign({}, convertQuestion(question).scripts, { reteach: textsFor(repair.ryanUtteranceIds) }),
        repairId: prefix(repair.id),
        freshCheckId: prefix(repair.freshConfirmationQuestionId),
        primaryErrorFamily: repair.family
      } : null);
      return converted;
    })];
  }

  function responseKey(response) {
    if (response && typeof response === "object" && "factor" in response) return response.value === null || response.value === undefined || response.value === "" ? `factor:${response.factor}` : `factor-value:${response.factor}:${response.value}`;
    if (response && typeof response === "object" && "n" in response && "d" in response) return `${response.n}/${response.d}`;
    return String(response ?? "");
  }

  function predicateKey(question, response) {
    const raw = question?.canonicalQuestion;
    if (!raw) return null;
    if (raw.response.kind === "factor_then_integer" && response && typeof response === "object") {
      if (Number(response.factor) === Number(raw.answer.factor) && Number(response.value) !== Number(raw.answer.value)) return "predicate:correct factor, wrong denominator value";
    }
    if (raw.response.kind === "fraction_input" && response && typeof response === "object") {
      const sourceFraction = raw.visual?.source;
      if (sourceFraction) {
        const numeratorFactor = Number(response.n) / Number(sourceFraction.numerator);
        const denominatorFactor = Number(response.d) / Number(sourceFraction.denominator);
        if (Number.isInteger(numeratorFactor) && Number.isInteger(denominatorFactor) && numeratorFactor !== denominatorFactor) {
          return Object.keys(question.runtimeOutcome?.errorSpecificUtteranceIdsByResponse || {}).find((key) => key.startsWith("predicate:")) || null;
        }
      }
    }
    if (raw.response.kind === "integer_input" && raw.id === "M5" && Number(response) !== Number(raw.answer.value)) {
      return "predicate:integer other than 8 with a coherent but incorrect denominator factor";
    }
    return null;
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const outcome = question?.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    const key = responseKey(response);
    const predicate = predicateKey(question, response);
    return [...(outcome.errorSpecificUtteranceIdsByResponse?.[key]
      || outcome.errorSpecificUtteranceIdsByResponse?.[predicate]
      || (response && typeof response === "object" && "factor" in response ? outcome.errorSpecificUtteranceIdsByResponse?.[`factor:${response.factor}`] : null)
      || outcome.incorrectDefaultUtteranceIds
      || [])];
  }

  function selectRecoveryQuestionIds(missedFinalQuestionIds, desiredCount) {
    if (desiredCount === 5) return ["RF1", "RF2", "RF3", "RF4", "RF5"].map(prefix);
    const mapping = { M1: "RF1", M2: "RF2", M3: "RF3", M4: "RF4", M5: "RF5" };
    const selected = [];
    missedFinalQuestionIds.map(unprefix).forEach((id) => {
      const candidate = mapping[id];
      if (candidate && !selected.includes(candidate) && selected.length < 2) selected.push(candidate);
    });
    ["RF4", "RF5", "RF1", "RF2", "RF3"].forEach((candidate) => {
      if (selected.length < 2 && !selected.includes(candidate)) selected.push(candidate);
    });
    return selected.map(prefix);
  }

  function evaluateFinalEvidence(records, primaryFinalWindow) {
    const correct = records.filter((record) => record.independent && !record.hintUsed && record.firstAttemptCorrect);
    const procedural = new Set(["procedural_full_build", "hidden_scale_up", "reverse_scale_down"]);
    const application = new Set(["reasoning_error_analysis", "visual_or_context_transfer"]);
    const blockers = new Set(["one_numerator", "one_denominator", "mixed_factors", "additive", "direction"]);
    const counts = {};
    records.forEach((record) => { if (blockers.has(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1; });
    const repeatedBlockingFamilies = Object.keys(counts).filter((family) => counts[family] >= 2);
    const coverageSatisfied = correct.some((record) => procedural.has(record.family)) && correct.some((record) => application.has(record.family));
    const primaryApplicationGateSatisfied = !primaryFinalWindow || correct.some((record) => [prefix("M4"), prefix("M5"), "M4", "M5"].includes(record.questionId));
    return {
      correctCount: correct.length,
      totalCount: records.length,
      coverageSatisfied,
      primaryApplicationGateSatisfied,
      repeatedBlockingFamilies,
      masterySatisfied: records.length === 5 && correct.length >= 4 && coverageSatisfied && primaryApplicationGateSatisfied && !repeatedBlockingFamilies.length
    };
  }

  function validateRuntimeContract() {
    const issues = [];
    const textOwners = new Map();
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      const text = String(entry?.text || "");
      if (!text.trim()) issues.push(`${id} has no text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} caption source is not same_as_audio`);
      if (textOwners.has(text)) issues.push(`${id} duplicates ${textOwners.get(text)}`);
      textOwners.set(text, id);
    });
    approved.teachingScenes.forEach((scene) => (scene.timeline || []).forEach((cue) => {
      if (!runtimeCopy[cue.utteranceId]) issues.push(`${cue.id} has a missing utterance`);
      else if (!runtimeCopy[cue.utteranceId].text.includes(cue.anchorText)) issues.push(`${cue.id} has an invalid anchor`);
    }));
    return issues;
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA08 canonical source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA08 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-07", "P-N01"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const hookChoice = {
      id: "HOOK-CHOICE",
      purpose: "Predict the unchanged endpoint",
      scene: { display_title: "Keep the progress fixed", initial_state: "Choose how many redesigned blocks reach the same endpoint.", objects: ["progress_tracker"], model: toModel(hook.visual, { sceneId: "HOOK-CHOICE" }) },
      narration: { script: [], utterance_ids: [], sync_cues: [] },
      animation_timeline: [],
      learner_interaction: { question_ref: prefix("HOOK-CHOICE") },
      next_step: "T1"
    };
    const sceneNext = { T1: "T2", T2: "T3", T3: "T4", T4: "T5", T5: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = [teachingStep(hook, "HOOK-CHOICE"), hookChoice, ...approved.teachingScenes.filter((scene) => scene.id !== "HOOK").map((scene) => teachingStep(scene, sceneNext[scene.id]))];

    spec.lesson.transfer_steps = Object.fromEntries(["G1", "G2", "F1", "F2", "I1", "I2"].map((id) => {
      const item = question(id);
      const next = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" }[id];
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: item.scripts.before_submit,
        visual_before_answer: item.prompt,
        correct_next: next
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Canonical adaptive route only.", between_question_transition: "" };

    const primaryIds = ["M1", "M2", "M3", "M4", "M5"].map(prefix);
    const recoveryIds = ["RF1", "RF2", "RF3", "RF4", "RF5"].map(prefix);
    const confirmationIds = ["C-UP", "C-DOWN", "C-FULL", "C-CONTEXT"].map(prefix);
    const repairByFamily = Object.fromEntries(approved.repairs.map((repair) => [repair.family, prefix(repair.supportedQuestionId)]));
    const freshByFamily = Object.fromEntries(approved.repairs.map((repair) => [repair.family, [prefix(repair.freshConfirmationQuestionId)]]));
    spec.lesson.exit = {
      intro_script: textsFor(approved.route.final.introUtteranceIds),
      primary_question_refs: primaryIds,
      confirmation_question_refs: [...confirmationIds, ...approved.repairQuestions.filter((item) => item.id.endsWith("-FRESH")).map((item) => prefix(item.id)), ...recoveryIds],
      post_repair_retest_refs: recoveryIds,
      mastery_policy: {
        profile: "fra08_five_item",
        secureMinimum: 4,
        totalItems: 5,
        requireCoverage: true,
        requirePrimaryM4OrM5: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: [...approved.route.final.blockingFamilies],
        scoreThreeRecoveryCount: 2,
        scoreZeroToTwoRecoveryCount: 5
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-UP"),
        [prefix("F2")]: prefix("C-DOWN"),
        [prefix("I1")]: prefix("C-FULL"),
        [prefix("I2")]: prefix("C-CONTEXT")
      },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: Object.assign(freshByFamily, { unknown: recoveryIds, fact: freshByFamily.fact || [prefix("R-FACT-FRESH")] }),
      feedback_by_error_family: {}
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: [textFor(approved.route.final.completionUtteranceId)], buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building the same-factor idea", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra08_context", equal_width_wholes: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra08_context", "fraction_input", "integer_input", "single_choice", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "1.0-fra08-owner-authorised",
      engine_profile: "fra08",
      runtime_applied: true,
      owner_review_status: "owner_authorised_handoff",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Build the idea", guided: "Try it with me", faded: "Less help", independent: "Now you take over", repair: "Targeted repair", exit: "Final check", completion: "Complete" },
      route_contract: approved.route,
      capabilities: { staged_factor_input: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, five_item_final: true, targeted_repairs: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra08Canonical = {
    apply,
    buildQuestions,
    evaluateFinalEvidence,
    predicateKey,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    selectRecoveryQuestionIds,
    textFor,
    toModel,
    validateRuntimeContract
  };
})();
