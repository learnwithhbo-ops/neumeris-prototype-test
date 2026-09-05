(function () {
  "use strict";

  const LESSON_ID = "FRA-07";
  const CONTENT_VERSION = "fra07-recognise-equivalent-fractions-v1";
  const source = window.RevilyFra07V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const uiCopy = source?.learnerUiCopy || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA07 runtime utterance: ${id}`);
    return entry;
  }

  function uiEntry(id) {
    const entry = uiCopy[id];
    if (!entry) throw new Error(`Missing FRA07 learner UI copy: ${id}`);
    return entry;
  }

  const textFor = (id) => runtimeEntry(id).text;
  const textsFor = (ids) => (ids || []).map(textFor);
  const uiTextFor = (id) => uiEntry(id).text;

  function toModel(value, extra) {
    return Object.assign({ context: "fra07", canonical: value || null }, value || {}, extra || {});
  }

  function optionEntries(question) {
    return Object.entries(question.response?.optionCopyIds || {}).map(([id, copyId]) => ({
      id,
      label: uiTextFor(copyId)
    }));
  }

  function responseFor(question) {
    if (question.response?.kind === "sort") {
      const pairs = question.visual?.pairs || [];
      return {
        type: "classification_sort",
        cards: pairs.map((pair) => ({
          id: pair.id,
          label: `${pair.left.numerator}/${pair.left.denominator} and ${pair.right.numerator}/${pair.right.denominator}`
        })),
        destinations: ["Equivalent", "Not equivalent"],
        keyboard_submit: true
      };
    }
    const entries = optionEntries(question);
    return {
      type: "single_choice",
      options: entries.map((entry) => entry.label),
      optionIds: Object.fromEntries(entries.map((entry) => [entry.label, entry.id])),
      keyboard_submit: true
    };
  }

  function answerFor(question) {
    if (question.answer?.kind === "sort") {
      const result = {};
      (question.answer.equivalent || []).forEach((id) => { result[id] = "Equivalent"; });
      (question.answer.notEquivalent || []).forEach((id) => { result[id] = "Not equivalent"; });
      return result;
    }
    const entry = optionEntries(question).find((option) => option.id === question.answer?.optionId);
    return entry?.label || question.answer?.optionId;
  }

  function optionIdForResponse(question, response) {
    if (question.response?.kind === "sort") return null;
    const entries = optionEntries(question);
    return entries.find((entry) => entry.label === String(response))?.id || String(response || "");
  }

  function signalForResponse(question, response) {
    if (question.response?.kind === "sort") {
      if (response?.D === "Equivalent") return { key: "placed_D_equivalent", family: "one_side" };
      if (response?.B === "Equivalent") return { key: "placed_B_equivalent", family: "inconsistent_factor" };
      return null;
    }
    const optionId = optionIdForResponse(question, response);
    const directKey = `selected_${optionId}`;
    if (question.feedback?.incorrectBySignal?.[directKey]) {
      const signal = (question.errorSignals || []).find((item) => {
        const selected = String(item.observed || "").match(/selected ([A-Z](?: or [A-Z])*)/i)?.[1] || "";
        return selected.split(/\s+or\s+/i).includes(optionId);
      });
      return { key: directKey, family: signal?.family || question.primaryErrorFamily || "unknown", signal };
    }
    const signal = (question.errorSignals || []).find((item) => {
      const selected = String(item.observed || "").match(/selected ([A-Z](?: or [A-Z])*)/i)?.[1] || "";
      return selected.split(/\s+or\s+/i).includes(optionId);
    });
    if (!signal) return null;
    const familyKey = question.feedback?.incorrectBySignal?.[signal.family] ? signal.family : null;
    return { key: familyKey, family: signal.family, signal };
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const canonical = question?.canonicalQuestion;
    if (!canonical) return [];
    if (correct) return [...(canonical.feedback?.correctUtteranceIds || [])];
    const signal = signalForResponse(canonical, response);
    const specificId = signal?.key ? canonical.feedback?.incorrectBySignal?.[signal.key] : signal?.signal?.feedbackUtteranceId;
    return [specificId || canonical.feedback?.incorrectDefaultUtteranceIds?.[0]].filter(Boolean);
  }

  function classifyErrorFamily(question, response) {
    const canonical = question?.canonicalQuestion;
    if (!canonical) return question?.primaryErrorFamily || "unknown";
    const signal = signalForResponse(canonical, response);
    if (signal?.family) return signal.family;
    if (canonical.id === "D-VIS") return "partition_count";
    if (canonical.id === "D-SYM") return "inconsistent_factor";
    return "unknown";
  }

  function requiresRepeatedEvidence(question, response) {
    const canonical = question?.canonicalQuestion;
    const signal = canonical ? signalForResponse(canonical, response)?.signal : null;
    return String(signal?.classificationRule || "").startsWith("repeat_");
  }

  function evaluateResponse(question, response) {
    const canonical = question?.canonicalQuestion;
    if (!canonical) return { correct: false, errorFamily: "unknown", utteranceIds: [] };
    const correct = canonical.answer?.kind === "sort"
      ? window.RevilyValidators?.sameStructured?.(response, answerFor(canonical)) === true
      : optionIdForResponse(canonical, response) === canonical.answer?.optionId;
    const signal = correct ? null : signalForResponse(canonical, response);
    return {
      correct,
      optionId: optionIdForResponse(canonical, response),
      errorFamily: correct ? null : classifyErrorFamily(question, response),
      classificationRule: signal?.signal?.classificationRule || (canonical.stage === "discriminator" ? "discriminator_confirmation" : "unclassified"),
      utteranceIds: selectOutcomeUtteranceIds(question, response, correct)
    };
  }

  function visibleFeedback(question, response) {
    const evaluation = evaluateResponse(question, response);
    return evaluation.utteranceIds.map(textFor).join(" ");
  }

  function defaultErrorFamily(question) {
    const id = question.id;
    if (["G1", "F1", "I1", "M1", "M3", "RM1", "RM3", "D-VIS"].includes(id)) return "partition_count";
    if (["F2", "M4", "RM4", "RA-S", "RA-F"].includes(id)) return "additive";
    if (["RO-S", "RO-F"].includes(id)) return "one_side";
    if (["G2", "I2", "M2", "RM2", "RF-S", "RF-F", "D-SYM"].includes(id)) return "inconsistent_factor";
    return "unknown";
  }

  function finalFamily(questionId) {
    return approved.route.final.primaryQuestionIds.includes(unprefix(questionId))
      ? ({ M1: "visual_judgment", M2: "symbolic_match", M3: "cross_model_match", M4: "additive_reasoning" })[unprefix(questionId)]
      : ({ RM1: "visual_judgment", RM2: "symbolic_match", RM3: "cross_model_match", RM4: "additive_reasoning" })[unprefix(questionId)];
  }

  function convertQuestion(question, overrides) {
    const options = optionEntries(question);
    const prompt = uiTextFor(question.promptCopyId);
    const hint = question.hint ? uiTextFor(question.hint.copyId) : "";
    const visibleSteps = (question.workedCheck?.visibleStepCopyIds || []).map(uiTextFor);
    const responseFeedback = {};
    options.forEach((entry) => {
      const ids = selectOutcomeUtteranceIds({ canonicalQuestion: question }, entry.label, entry.id === question.answer?.optionId);
      if (ids.length) responseFeedback[entry.label] = textFor(ids[0]);
    });
    return Object.assign({
      id: prefix(question.id),
      stage: ["final", "recovery_final"].includes(question.stage) ? "exit" : question.stage,
      target: question.families.join(" "),
      assessmentIntent: question.authorOnlyAssessmentIntent,
      evidenceFamily: finalFamily(question.id) || question.families[0],
      prompt,
      model: toModel(question.visual, {
        questionId: question.id,
        canonicalSignature: question.canonicalSignature
      }),
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy.hintPolicy,
        solutionPolicy: question.policy.solutionPolicy,
        scored: question.policy.scored,
        answerLocksOnSubmit: question.policy.answerLocksOnSubmit,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy.requiresFreshNoHintConfirmationIfHintUsed,
        countsAsIndependentEvidence: question.policy.countsAsIndependentEvidence,
        countsAsFreshEvidence: question.policy.countsAsFreshEvidence,
        canonicalSignature: question.canonicalSignature
      },
      attempt_policy: { submit_label: uiTextFor(question.response.submitLabelCopyId) },
      visual: { primitive: "fra07_context", action: "focus", description: uiTextFor(question.accessibleDescriptionCopyId) },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: textFor(question.feedback.correctUtteranceIds[0]),
        on_correct_math: "",
        on_incorrect_reaction: textFor(question.feedback.incorrectDefaultUtteranceIds[0]),
        on_incorrect_attempt_1: textFor(question.feedback.incorrectDefaultUtteranceIds[0]),
        on_incorrect_attempt_2: textFor(question.feedback.incorrectDefaultUtteranceIds[0]),
        worked_explanation: visibleSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_narration: textsFor(question.workedCheck?.ryanUtteranceIds),
        response_feedback: responseFeedback
      },
      mathematical_support: hint ? { hint_1: hint } : {},
      errorClassification: { fallback: "unknown", requiresRepeatedEvidence: false },
      primaryErrorFamily: defaultErrorFamily(question),
      canonicalQuestion: question
    }, overrides || {});
  }

  function buildHookQuestion() {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const options = Object.entries(hook.interaction.optionCopyIds).map(([id, copyId]) => ({ id, label: uiTextFor(copyId) }));
    const responseByValue = Object.fromEntries(options.map((option) => [
      option.label,
      textsFor([
        ...hook.interaction.feedbackByOption[option.id].ryanUtteranceIds,
        ...hook.interaction.commonRevealUtteranceIds
      ])
    ]));
    return {
      id: prefix("HOOK-CHOICE"),
      stage: "opening",
      target: "Unscored same-progress prediction",
      assessmentIntent: "unscored same-progress prediction",
      prompt: uiTextFor(hook.interaction.promptCopyId),
      model: toModel(hook.visual, { sceneId: "HOOK-CHOICE" }),
      response: { type: "single_choice", options: options.map((option) => option.label), optionIds: Object.fromEntries(options.map((option) => [option.label, option.id])), keyboard_submit: true },
      answer: { value: options.find((option) => option.id === hook.interaction.answerOptionId).label },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: uiTextFor("BUTTON.CONTINUE") },
      visual: { primitive: "fra07_context", action: "focus", description: uiTextFor(hook.interaction.promptCopyId) },
      scripts: { engagement_response_by_value: responseByValue, engagement_label: "Your prediction" },
      primaryErrorFamily: "unknown",
      errorClassification: { fallback: "unknown" },
      canonicalHook: hook
    };
  }

  function buildRepairQuestion(repair) {
    return {
      id: prefix(repair.id),
      stage: "repair",
      target: repair.family,
      assessmentIntent: `targeted ${repair.family} repair`,
      prompt: uiTextFor("STAGE.LEARN"),
      model: toModel({ kind: "repair_example", repair }, { repairId: repair.id }),
      response: { type: "single_choice", options: [] },
      answer: { value: "" },
      policy: { reteachOnly: true, hintPolicy: "none", solutionPolicy: "none", scored: false },
      visual: { primitive: "fra07_context", action: "repair", description: "A supported repair example for the current misconception." },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds) },
      supportedInteractionId: prefix(repair.supportedQuestionId),
      freshCheckId: prefix(repair.freshConfirmationQuestionId),
      primaryErrorFamily: repair.family,
      canonicalRepair: repair
    };
  }

  function buildQuestions() {
    return [
      buildHookQuestion(),
      ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.repairs.map(buildRepairQuestion)
    ];
  }

  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: `fra07_${cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      accessibleLabel: cue.reducedMotionState
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: scene.authorOnlyPurpose,
      scene: {
        display_title: scene.id === "HOOK" ? approved.title : uiTextFor(scene.id === "HANDOFF" ? "STAGE.GUIDED" : "STAGE.LEARN"),
        initial_state: scene.authorOnlyPurpose,
        objects: [scene.visual.kind],
        model: toModel(scene.visual, { sceneId: scene.id, canonicalScene: scene })
      },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 520 })),
      next_step: nextId
    };
  }

  function evidenceRecord(id, engine) {
    const questionId = prefix(id);
    const recorded = engine.state.evidence.errorFamily[questionId];
    return {
      questionId: id,
      stage: engine.model.getQuestion(questionId)?.canonicalQuestion?.stage,
      families: engine.model.getQuestion(questionId)?.canonicalQuestion?.families || [],
      firstAttemptCorrect: engine.state.evidence.firstAttemptCorrect[questionId] === true,
      attempts: engine.state.attempts[questionId] || 0,
      hintOpenedBeforeSubmit: engine.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
      supportEscalated: engine.state.evidence.supportEscalated[questionId] === true,
      answerLocked: engine.state.evidence.answerLocked[questionId] === true,
      countsAsIndependentEvidence: engine.model.getQuestion(questionId)?.policy?.countsAsIndependentEvidence === true,
      canonicalSignature: engine.model.getQuestion(questionId)?.policy?.canonicalSignature || "",
      errorFamily: recorded === "support_needed" ? engine.state.evidence.candidateErrorFamily[questionId] : recorded
    };
  }

  function shouldSkipF1(engine) {
    const records = [evidenceRecord("G1", engine), evidenceRecord("G2", engine)];
    return records.every((record) => record.firstAttemptCorrect && record.attempts === 1 && !record.hintOpenedBeforeSubmit && !record.supportEscalated && !["partition_count", "additive", "one_side", "inconsistent_factor"].includes(record.errorFamily));
  }

  function evaluateFinalEvidence(records) {
    const valid = records.filter((record) => record.independent && !record.hintUsed);
    const correct = valid.filter((record) => record.firstAttemptCorrect);
    const counts = {};
    records.forEach((record) => {
      if (["partition_count", "additive", "one_side", "inconsistent_factor"].includes(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1;
    });
    const repeatedBlockingFamilies = Object.entries(counts).filter(([, count]) => count >= 2).map(([family]) => family);
    const distinctFamiliesCorrect = new Set(correct.map((record) => record.family)).size;
    const masterySatisfied = correct.length >= 3 && distinctFamiliesCorrect >= 2 && repeatedBlockingFamilies.length === 0;
    return {
      correctCount: correct.length,
      totalCount: records.length,
      distinctFamiliesCorrect,
      repeatedBlockingFamilies,
      masterySatisfied,
      route: masterySatisfied ? "finish" : correct.length >= 2 ? "repair_then_fresh_two" : "repair_then_fresh_four",
      reasons: [correct.length < 3 ? "fewer_than_three_correct" : null, distinctFamiliesCorrect < 2 ? "insufficient_family_breadth" : null, repeatedBlockingFamilies.length ? "repeated_central_misconception" : null].filter(Boolean)
    };
  }

  function selectRecoveryQuestionIds(missedQuestionIds, desiredCount) {
    const familyById = { M1: "RM1", M2: "RM2", M3: "RM3", M4: "RM4" };
    if (desiredCount === 4) return ["RM1", "RM2", "RM3", "RM4"].map(prefix);
    const selected = [];
    missedQuestionIds.map(unprefix).forEach((id) => {
      const recovery = familyById[id];
      if (recovery && !selected.includes(recovery)) selected.push(recovery);
    });
    ["RM4", "RM2", "RM1", "RM3"].forEach((id) => { if (selected.length < 2 && !selected.includes(id)) selected.push(id); });
    return selected.slice(0, 2).map(prefix);
  }

  function validateRuntimeContract() {
    const errors = [];
    const runtimeTexts = new Set(Object.values(runtimeCopy).map((entry) => entry.text));
    const allQuestions = buildQuestions();
    allQuestions.forEach((question) => {
      Object.entries(question.scripts || {}).forEach(([key, value]) => {
        if (["worked_explanation", "response_feedback", "engagement_label"].includes(key)) return;
        const lines = Array.isArray(value) ? value.flat(Infinity) : typeof value === "object" ? Object.values(value).flat(Infinity) : [value];
        lines.filter(Boolean).forEach((line) => {
          if (!runtimeTexts.has(line)) errors.push(`${question.id}.${key} escaped FRA07_RUNTIME_COPY.`);
        });
      });
    });
    approved.teachingScenes.forEach((scene) => sceneCues(scene).forEach((cue) => {
      if (!runtimeCopy[cue.utteranceId]) errors.push(`${cue.id} references a missing utterance.`);
      else if (!runtimeCopy[cue.utteranceId].text.includes(cue.anchorText)) errors.push(`${cue.id} has a non-exact anchor.`);
    }));
    if (approved.contentVersion !== CONTENT_VERSION) errors.push("Unexpected FRA07 content version.");
    return errors;
  }

  function apply(spec) {
    if (!approved) throw new Error("FRA07 approved specification did not load.");
    const questionBank = buildQuestions();
    spec.identity = Object.assign({}, spec.identity, { status: "owner_authorised_handoff_v1" });
    spec.curriculum = Object.assign({}, spec.curriculum, { learning_objective: approved.scope.objective, success_criteria: approved.scope.teaches });
    spec.concept_model = Object.assign({}, spec.concept_model, { core_idea: approved.scope.studentFacingIdea, worked_model: approved.scope.teaches.join(" ") });
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02", "FRA-03"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const scenes = approved.teachingScenes;
    const hook = scenes.find((scene) => scene.id === "HOOK");
    spec.lesson.teaching_steps = [
      teachingStep(hook, "HOOK-CHOICE"),
      {
        id: "HOOK-CHOICE",
        purpose: "Unscored prediction",
        scene: { display_title: approved.title, initial_state: uiTextFor(hook.interaction.promptCopyId), objects: [hook.visual.kind], model: toModel(hook.visual, { sceneId: "HOOK-CHOICE" }) },
        narration: { script: [], utterance_ids: [], sync_cues: [] },
        animation_timeline: [],
        learner_interaction: { question_ref: prefix("HOOK-CHOICE") },
        next_step: "T1"
      },
      ...scenes.filter((scene) => scene.id !== "HOOK").map((scene, index, remaining) => teachingStep(scene, remaining[index + 1]?.id || "G1"))
    ];

    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const nextById = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const question = questionBank.find((item) => item.id === prefix(id));
      return [id, {
        stage: question.canonicalQuestion.stage === "independent" ? "independent_transfer" : question.canonicalQuestion.stage,
        question_ref: question.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: id === "I1" ? [textFor(approved.route.independentIntroUtteranceId), ...question.scripts.before_submit] : question.scripts.before_submit,
        visual_before_answer: question.prompt,
        correct_next: nextById[id]
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Canonical evidence routing only.", between_question_transition: "" };
    spec.lesson.exit = {
      intro_script: textsFor(approved.route.finalIntroUtteranceIds),
      primary_question_refs: approved.route.final.primaryQuestionIds.map(prefix),
      use_question_before_submit_narration: true,
      confirmation_question_refs: approved.questions.filter((question) => ["confirmation", "discriminator", "repair_fresh", "recovery_final"].includes(question.stage)).map((question) => prefix(question.id)),
      repair_by_primary: { [prefix("M1")]: prefix("R-PARTITION"), [prefix("M2")]: prefix("R-FACTOR"), [prefix("M3")]: prefix("R-PARTITION"), [prefix("M4")]: prefix("R-ADD") },
      post_repair_retest_refs: approved.route.final.recoveryQuestionIds.map(prefix),
      mastery_policy: {
        profile: "fra07_four_item",
        secureMinimum: 3,
        requireMoreThanOneEvidenceFamily: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: ["partition_count", "additive", "one_side", "inconsistent_factor"],
        twoCorrectRequiredFreshSuccesses: 2,
        zeroOrOneCorrectRequiredFreshSuccesses: 4
      }
    };
    const repairMap = Object.fromEntries(approved.repairs.map((repair) => [repair.family, prefix(repair.id)]));
    const freshMap = Object.fromEntries(approved.repairs.map((repair) => [repair.family, [prefix(repair.freshConfirmationQuestionId)]]));
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: Object.fromEntries(Object.entries(approved.route.hintConfirmations).map(([id, confirmation]) => [prefix(id), prefix(confirmation)])),
      repair_by_error_family: repairMap,
      repair_supported_by_error_family: Object.fromEntries(approved.repairs.map((repair) => [repair.family, prefix(repair.supportedQuestionId)])),
      fresh_checks_by_error_family: Object.assign(freshMap, { unknown: [prefix("D-VIS"), prefix("D-SYM")] }),
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textFor(approved.route.completionUtteranceId), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building equivalent-fraction recognition", ryan_script: "", buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "authored_audio_then_browser_speech", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra07_context", complete_pairs_only: true, no_blank_fraction_fields: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { input_types: ["single_choice", "classification_sort"], visual_primitives: ["fra07_context", "single_choice", "classification_sort", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: uiTextFor("BUTTON.CHECK") }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "FRA07-owner-authorised-v1",
      engine_profile: "fra07",
      runtime_applied: true,
      owner_review_status: "owner_authorised_handoff",
      runtime_copy: runtimeCopy,
      learner_ui_copy: uiCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_hierarchy: approved.sourceOfTruth,
      route_contract: approved.route,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Less help", independent: "Now you take over", repair: "Targeted repair", exit: "Final check", completion: "Complete" },
      capabilities: { complete_fraction_recognition: true, supplied_number_line_points: true, classification_sort: true, optional_visible_only_hints: true, hint_evidence: true, final_working_after_locked_submit: true, four_item_final: true, targeted_repairs: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra07Canonical = {
    apply,
    buildQuestions,
    classifyErrorFamily,
    evaluateFinalEvidence,
    evaluateResponse,
    evidenceRecord,
    finalFamily,
    prefix,
    requiresRepeatedEvidence,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    selectRecoveryQuestionIds,
    shouldSkipF1,
    textFor,
    toModel,
    uiCopy,
    uiTextFor,
    unprefix,
    validateRuntimeContract,
    visibleFeedback
  };
})();
