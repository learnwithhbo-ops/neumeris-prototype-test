(function () {
  "use strict";

  const LESSON_ID = "FRA-21";
  const CONTENT_VERSION = "FRA21-HANDOFF-V1";
  const source = window.RevilyFra21V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const learnerUi = source?.learnerUiCopy || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = Object.freeze({
    BOTH: prefix("R-BOTH"),
    SCALE: prefix("R-SCALE"),
    EARLY: prefix("R-EARLY"),
    ORDER: prefix("R-ORDER"),
    DENOM: prefix("R-DENOM")
  });

  function uiEntry(id) {
    const entry = learnerUi[id];
    if (!entry) throw new Error(`Missing FRA21 learner UI copy: ${id}`);
    return entry;
  }

  function uiText(id) {
    return uiEntry(id).text;
  }

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA21 runtime utterance: ${id}`);
    return entry;
  }

  function textFor(id) {
    return runtimeEntry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function questionId(question) {
    return question?.canonicalQuestionId || unprefix(question?.id);
  }

  function optionLabels(question) {
    return (question.visual?.optionUiIds || []).map(uiText);
  }

  function optionLabelById(question, optionId) {
    const index = (question.response?.optionIds || []).indexOf(optionId);
    return index >= 0 ? optionLabels(question)[index] : optionId;
  }

  function fieldLabel(question, fieldId, index) {
    const authored = question.visual?.fieldUiIds?.[index] || question.response?.fieldUiIds?.[index];
    if (authored) return uiText(authored);
    const labels = {
      convertedNumerator: "Converted numerator",
      firstNumerator: "First numerator in tenths",
      resultNumerator: "Result numerator",
      convertedFirstNumerator: "Converted first numerator",
      convertedSecondNumerator: "Converted second numerator",
      targetNumerator: "Equivalent numerator"
    };
    return labels[fieldId] || fieldId.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
  }

  function responseFor(question) {
    const response = question.response || {};
    if (response.kind === "integer_fields") {
      return {
        type: "two_step_integer",
        fields: response.fieldIds.map((id, index) => ({ id, label: fieldLabel(question, id, index) })),
        keyboard_submit: true
      };
    }
    if (response.kind === "fraction") {
      return {
        type: "fraction",
        accept_equivalent_notation: question.answer?.acceptExactEquivalent !== false,
        partLabel: "Numerator",
        wholeLabel: "Denominator",
        keyboard_submit: true
      };
    }
    if (response.kind === "single_choice") {
      const labels = optionLabels(question);
      return {
        type: "single_choice",
        options: labels,
        optionIds: Object.fromEntries(labels.map((label, index) => [label, response.optionIds[index]])),
        keyboard_submit: true
      };
    }
    if (response.kind === "composite") {
      const labels = optionLabels(question);
      const fieldId = response.fieldIds[0];
      return {
        type: "choice_and_integer",
        options: labels,
        optionIds: Object.fromEntries(labels.map((label, index) => [label, response.optionIds[index]])),
        choiceLabel: "Choose the valid move, then complete the numerator",
        valueLabel: fieldLabel(question, fieldId, 0),
        canonicalFieldId: fieldId,
        keyboard_submit: true
      };
    }
    if (response.kind === "ordered_steps") {
      const labels = (question.visual?.stepUiIds || []).map(uiText);
      return {
        type: "fra16_order_cards",
        direction: "first_to_last",
        cards: response.stepIds.map((id, index) => ({ id, label: labels[index] })),
        labels: Object.fromEntries(response.stepIds.map((id, index) => [id, labels[index]])),
        allowDrag: true,
        allowKeyboardReorder: true,
        allowMoveButtons: true,
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA21 response kind ${response.kind}`);
  }

  function answerFor(question) {
    const answer = question.answer;
    if (answer.kind === "integer_fields") {
      return Object.fromEntries(Object.entries(answer.expected).map(([key, value]) => [key, String(value)]));
    }
    if (answer.kind === "fraction_value") {
      return { n: String(answer.canonical.numerator), d: String(answer.canonical.denominator) };
    }
    if (answer.kind === "single_choice") return optionLabelById(question, answer.correctOptionId);
    if (answer.kind === "composite") {
      const value = Object.values(answer.expectedFields || {})[0];
      return { choice: optionLabelById(question, answer.correctOptionId), whole: String(value) };
    }
    if (answer.kind === "ordered_steps") return [...answer.correctOrder];
    throw new Error(`${question.id}: unsupported FRA21 answer kind ${answer.kind}`);
  }

  function runtimeOutcome(question) {
    const correct = question.feedback?.correct || {};
    const incorrect = question.feedback?.incorrectDefault || {};
    const errorSpecific = question.feedback?.errorSpecific || [];
    return {
      correctUiIds: [...(correct.uiIds || [])],
      correctUtteranceIds: [...(correct.ryanUtteranceIds || [])],
      incorrectUiIds: [...(incorrect.uiIds || [])],
      incorrectUtteranceIds: [...(incorrect.ryanUtteranceIds || [])],
      errorSpecific: errorSpecific.map((entry) => ({
        family: entry.family,
        uiIds: [...(entry.uiIds || [])],
        utteranceIds: [...(entry.ryanUtteranceIds || [])]
      }))
    };
  }

  function defaultErrorFamily(question) {
    if (question.id.includes("ORDER")) return "ORDER";
    if (question.id.includes("DENOM")) return "DENOM";
    if (question.id.includes("SCALE")) return "SCALE";
    if (question.id.includes("EARLY")) return "EARLY";
    if (question.id.includes("BOTH")) return "BOTH";
    return "UNKNOWN";
  }

  function convertQuestion(question, overrides) {
    const prompt = (question.studentFacing?.promptUiIds || []).map(uiText).join(" ");
    const title = question.studentFacing?.titleUiId ? uiText(question.studentFacing.titleUiId) : prompt;
    const accessible = question.visual?.accessibleDescriptionUiId ? uiText(question.visual.accessibleDescriptionUiId) : prompt;
    const hint = question.studentFacing?.hintUiId ? uiText(question.studentFacing.hintUiId) : "";
    const workedSteps = (question.workedCheck?.visibleStepUiIds || []).map(uiText);
    const outcome = runtimeOutcome(question);
    const allUtteranceIds = [
      ...(question.studentFacing?.ryanBeforeSubmitUtteranceIds || []),
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectUtteranceIds,
      ...outcome.errorSpecific.flatMap((entry) => entry.utteranceIds)
    ];
    const resultFraction = question.math?.resultAtReadyDenominator || question.math?.simplifiedResult || question.answer?.canonical || { numerator: 0, denominator: question.math?.readyDenominator || 1 };
    return Object.assign({
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: title,
      assessmentIntent: question.authorOnly?.assessmentIntent,
      evidenceFamily: [...(question.family || [])],
      prompt,
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy === "optional_collapsed" ? "optional" : "none",
        solutionPolicy: question.policy?.solutionPolicy || "after_response",
        scored: question.policy?.scored === true,
        answerLocksOnSubmit: question.policy?.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.hintPolicy === "optional_collapsed",
        countsAsIndependentEvidence: question.policy?.eligibleForIndependentMastery === true,
        maxAttemptsBeforeRepair: 2
      },
      attempt_policy: { submit_label: uiText("BUTTON.CHECK") },
      speechPolicy: { autoSpeakLearnerUi: false, captionsUseExactRyanUtterance: true },
      model: {
        context: "fra21",
        questionId: question.id,
        title,
        math: question.math,
        visual: question.visual,
        canonicalQuestion: question,
        totalParts: Number(resultFraction.denominator || 1),
        selectedParts: Math.max(0, Number(resultFraction.numerator || 0)),
        accessibleDescription: accessible,
        workedSteps
      },
      visual: { primitive: "fra21_context", action: "focus", description: prompt },
      scripts: {
        before_submit: textsFor(question.studentFacing?.ryanBeforeSubmitUtteranceIds || []),
        hint,
        on_correct_reaction: textsFor(outcome.correctUtteranceIds)[0] || "",
        on_incorrect_reaction: textsFor(outcome.incorrectUtteranceIds)[0] || "",
        on_incorrect_attempt_1: textsFor(outcome.incorrectUtteranceIds)[0] || "",
        on_incorrect_attempt_2: textsFor(outcome.incorrectUtteranceIds)[0] || "",
        worked_explanation: workedSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: workedSteps,
        worked_narration: []
      },
      mathematical_support: hint ? { hint_1: hint } : {},
      runtimeOutcome: outcome,
      runtimeUtteranceIds: [...new Set(allUtteranceIds)],
      primaryErrorFamily: defaultErrorFamily(question),
      errorFamily: defaultErrorFamily(question),
      errorClassification: { fallback: defaultErrorFamily(question), requiresRepeatedEvidence: true },
      recovery_item_ref: repairByFamily[defaultErrorFamily(question)] || null,
      canonicalQuestion: question
    }, overrides || {});
  }

  function convertRepair(repair) {
    const title = uiText(repair.studentFacing.titleUiId);
    const syncCues = (repair.timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      accessibleLabel: cue.reducedMotionEquivalent
    }));
    return {
      id: prefix(repair.id),
      canonicalQuestionId: repair.id,
      stage: "repair",
      target: title,
      assessmentIntent: repair.authorOnly?.purpose,
      evidenceFamily: [repair.errorFamily],
      prompt: title,
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      speechPolicy: { autoSpeakLearnerUi: false, captionsUseExactRyanUtterance: true },
      model: {
        context: "fra21",
        questionId: repair.id,
        title,
        repair,
        visual: repair.supportedInteraction?.visual,
        math: repair.supportedInteraction?.math,
        totalParts: Number(repair.supportedInteraction?.math?.readyDenominator || repair.supportedInteraction?.math?.targetDenominator || 1),
        selectedParts: Number(repair.supportedInteraction?.math?.resultAtReadyDenominator?.numerator || repair.supportedInteraction?.math?.target?.numerator || 0),
        accessibleDescription: title,
        workedSteps: []
      },
      visual: { primitive: "fra21_context", action: "repair", description: title, syncCues },
      scripts: { reteach: textsFor(repair.studentFacing.ryanUtteranceIds || []), worked_explanation: "" },
      runtimeUtteranceIds: [...(repair.studentFacing.ryanUtteranceIds || [])],
      supportedInteractionId: prefix(repair.supportedInteraction.id),
      freshCheckIds: repair.freshRechecks.map((question) => prefix(question.id)),
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily }
    };
  }

  function allCanonicalQuestions() {
    return [
      ...approved.questions,
      ...approved.confirmations,
      ...approved.repairs.flatMap((repair) => [repair.supportedInteraction, ...repair.freshRechecks]),
      ...approved.recoveryBank
    ];
  }

  function buildQuestions() {
    const converted = allCanonicalQuestions().map((question) => convertQuestion(question));
    approved.repairs.forEach((repair) => {
      const supported = converted.find((question) => question.id === prefix(repair.supportedInteraction.id));
      if (supported) {
        supported.fra21SupportedRepair = true;
        supported.fra21RepairId = prefix(repair.id);
        supported.fra21FreshCheckIds = repair.freshRechecks.map((question) => prefix(question.id));
      }
    });
    return [...converted, ...approved.repairs.map(convertRepair)];
  }

  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      accessibleLabel: uiText(scene.studentFacing.accessibleDescriptionUiId || "HOOK.ACCESS")
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    const title = scene.studentFacing.titleUiId ? uiText(scene.studentFacing.titleUiId) : uiText("STAGE.LEARN");
    return {
      id: scene.id,
      purpose: scene.authorOnly?.purpose,
      scene: {
        display_title: title,
        initial_state: title,
        objects: [scene.id],
        model: { context: "fra21", sceneId: scene.id, scene, visual: { kind: scene.id.toLowerCase() } }
      },
      narration: { script: textsFor(scene.studentFacing.ryanUtteranceIds || []), utterance_ids: [...(scene.studentFacing.ryanUtteranceIds || [])], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      next_step: nextId
    };
  }

  function canonicalResponse(question, response) {
    const kind = question.canonicalQuestion?.response?.kind;
    if (kind === "fraction") {
      return { kind: "fraction", value: { numerator: Number(response?.n), denominator: Number(response?.d) } };
    }
    if (kind === "integer_fields") {
      return { kind: "integer_fields", values: Object.fromEntries(Object.entries(response || {}).map(([key, value]) => [key, Number(value)])) };
    }
    if (kind === "single_choice") {
      return { kind: "single_choice", optionId: question.response.optionIds?.[String(response)] || String(response) };
    }
    if (kind === "composite") {
      return {
        kind: "composite",
        optionId: question.response.optionIds?.[String(response?.choice)] || String(response?.choice || ""),
        values: { [question.response.canonicalFieldId]: Number(response?.whole) }
      };
    }
    if (kind === "ordered_steps") return { kind: "ordered_steps", order: Array.isArray(response) ? response.map(String) : [] };
    return response;
  }

  function evaluateResponse(question, response) {
    return source.evaluateQuestion(questionId(question), canonicalResponse(question, response));
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const evaluation = evaluateResponse(question, response);
    if (evaluation.correct !== Boolean(correct)) return [];
    return [...(evaluation.ryanUtteranceIds || [])];
  }

  function visibleFeedback(question, response, correct) {
    const evaluation = evaluateResponse(question, response);
    const uiIds = evaluation.feedbackUiIds || [];
    if (uiIds.length) return uiIds.map(uiText).join(" ");
    const utterance = (evaluation.ryanUtteranceIds || []).map(textFor).find(Boolean);
    return utterance || (correct ? uiText("FEEDBACK.ARITHMETIC") : uiText("FEEDBACK.UNKNOWN"));
  }

  function classifyErrorFamily(question, response) {
    const evaluation = evaluateResponse(question, response);
    return evaluation.correct ? null : (evaluation.matchedErrorFamily || "UNKNOWN");
  }

  function requiresRepeatedEvidence(question, response) {
    const canonical = question.canonicalQuestion;
    const evaluation = evaluateResponse(question, response);
    if (evaluation.correct || !evaluation.matchedErrorFamily) return false;
    const signal = canonical.feedback.errorSpecific.find((entry) => entry.family === evaluation.matchedErrorFamily);
    return signal?.requiresRepeatBeforeRepair === true;
  }

  function shouldSkipF1(records) {
    return source.routeGuidedGate(records) === "fast_skip_f1_keep_f2";
  }

  function selectFreshCheckId(family, seenQuestionIds) {
    const repair = approved.repairs.find((entry) => entry.errorFamily === family);
    if (!repair) return family === "ARITHMETIC" ? prefix("C-ARITHMETIC") : null;
    if (family === "EARLY") return prefix(source.selectEarlyRepairRecheck((seenQuestionIds || []).map(unprefix)));
    return prefix(repair.freshRechecks[0].id);
  }

  function routeFinal(records, repeatedBlockingMisconception) {
    const correct = records.filter((record) => record.firstAttemptCorrect && record.countsAsIndependentEvidence);
    return source.routeFinal({
      independentlyCorrectCount: correct.length,
      proceduralFamilyCorrect: correct.some((record) => record.assessmentFamilies.includes("PROCEDURAL")),
      reasoningOrApplicationFamilyCorrect: correct.some((record) => record.assessmentFamilies.includes("REASONING_APPLICATION")),
      repeatedBlockingMisconception: Boolean(repeatedBlockingMisconception)
    });
  }

  function selectRecoveryQuestionIds(count, preferredFamilies, seenQuestionIds, seed) {
    return source.selectRecoveryItems({
      count,
      preferredFamilies,
      seenQuestionIds: (seenQuestionIds || []).map(unprefix),
      seed: Number(seed) >>> 0
    }).map(prefix);
  }

  function validateRuntimeContract() {
    const issues = [...(source.validateCanonicalSpec?.() || [])];
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      if (!String(entry?.text || "").trim()) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
    });
    approved.teachingScenes.flatMap((scene) => scene.timeline || []).forEach((cue) => {
      const utterance = runtimeCopy[cue.utteranceId];
      if (!utterance) issues.push(`${cue.id} points to missing ${cue.utteranceId}`);
      else if (!utterance.text.toLowerCase().includes(cue.anchorText.toLowerCase())) issues.push(`${cue.id} has an invalid anchor`);
    });
    return issues;
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA21 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA21 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const byRawId = (id) => questionBank.find((question) => question.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-08", "FRA-20", "P-N05"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const nextByScene = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = approved.teachingScenes.map((scene) => teachingStep(scene, nextByScene[scene.id]));
    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const nextByQuestion = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const item = byRawId(id);
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: item.scripts.before_submit,
        visual_before_answer: item.prompt,
        correct_next: nextByQuestion[id],
        recovery_ref: item.recovery_item_ref
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Owner-approved evidence route only.", between_question_transition: "" };

    const confirmationIds = [
      ...approved.confirmations.map((question) => prefix(question.id)),
      ...approved.repairs.flatMap((repair) => repair.freshRechecks.map((question) => prefix(question.id))),
      ...approved.recoveryBank.map((question) => prefix(question.id))
    ];
    spec.lesson.exit = {
      intro_script: textsFor(approved.finalCheck.introUtteranceIds),
      use_question_before_submit_narration: true,
      primary_question_refs: approved.finalCheck.itemIds.map(prefix),
      confirmation_question_refs: confirmationIds,
      mastery_policy: {
        profile: "fra21_five_item",
        secureMinimum: 4,
        totalItems: 5,
        requireProcedural: true,
        requireReasoningOrApplication: true,
        repeatedBlockingFamilies: ["BOTH", "SCALE", "EARLY", "ORDER", "DENOM"],
        repairCycleCapPerFamily: 1
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra21_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-DIRECT"),
        [prefix("I1")]: prefix("C-DIRECT"),
        [prefix("F2")]: prefix("C-FIRST"),
        [prefix("I2")]: prefix("C-FIRST")
      },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: {
        BOTH: [prefix("R-BOTH-RC")],
        SCALE: [prefix("R-SCALE-RC")],
        EARLY: [prefix("R-EARLY-RC-A"), prefix("R-EARLY-RC-B")],
        ORDER: [prefix("R-ORDER-RC")],
        DENOM: [prefix("R-DENOM-RC")],
        ARITHMETIC: [prefix("C-ARITHMETIC")],
        UNKNOWN: [prefix("C-ARITHMETIC")]
      }
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.finalCheck.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "One more pass will help", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)" },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra21_context", same_whole: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra21_context", "fraction_input", "integer_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: uiText("BUTTON.CHECK") }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "Revily_FRA-21_Storyboard_v1.pdf",
      engine_profile: "fra21",
      runtime_applied: true,
      owner_review_status: "owner_approved_implementation_handoff_v1",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      learner_ui_copy: learnerUi,
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: uiText("STAGE.LEARN"), guided: uiText("STAGE.GUIDED"), faded: uiText("STAGE.FADED"), independent: uiText("STAGE.INDEPENDENT"), repair: "Targeted support", exit: uiText("STAGE.FINAL"), completion: "Lesson complete" },
      route_contract: approved.routing,
      capabilities: { exact_fraction_value: true, form_sensitive_fields: true, live_ryan_word_boundaries: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, targeted_repairs: true, supported_repair_interactions: true, deterministic_unseen_recovery: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra21Canonical = {
    apply,
    buildQuestions,
    canonicalResponse,
    classifyErrorFamily,
    evaluateResponse,
    repairByFamily,
    requiresRepeatedEvidence,
    routeFinal,
    runtimeCopy,
    selectFreshCheckId,
    selectOutcomeUtteranceIds,
    selectRecoveryQuestionIds,
    shouldSkipF1,
    textFor,
    uiText,
    validateRuntimeContract,
    visibleFeedback
  };
})();
