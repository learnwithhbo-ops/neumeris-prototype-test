(function () {
  "use strict";

  const LESSON_ID = "FRA-22";
  const source = window.RevilyFra22Source;
  const CONTENT_VERSION = source?.FRA22_CONTENT_VERSION || "fra22-unlike-denominator-subtraction-v1";
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");
  const runtimeCopy = source?.FRA22_RUNTIME_COPY || {};
  const approved = source?.FRA22;

  const repairByFamily = {
    DIRECT: prefix("R-DIRECT"),
    SCALE: prefix("R-SCALE"),
    COMMON: prefix("R-COMMON"),
    ORDER: prefix("R-ORDER"),
    DEN_KEEP: prefix("R-DEN-KEEP")
  };

  const supportedByFamily = Object.fromEntries(Object.values(source?.FRA22_REPAIRS || {}).map((repair) => [repair.errorFamily, prefix(repair.supportedQuestionId)]));
  const freshPreferencesByFamily = Object.fromEntries(Object.values(source?.FRA22_REPAIRS || {}).map((repair) => [repair.errorFamily, repair.freshQuestionPreference.map(prefix)]));

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA-22 runtime utterance: ${id}`);
    return entry;
  }

  function textFor(id) {
    return runtimeEntry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function approvedQuestion(id) {
    return source.getQuestion(unprefix(id));
  }

  function optionLabel(question, optionId) {
    return question.options?.find((option) => option.id === optionId)?.visibleText || optionId;
  }

  function fieldLabel(id) {
    return ({
      leftEquivalentNumerator: "First equivalent numerator",
      rightEquivalentNumerator: "Second equivalent numerator",
      resultNumerator: "Difference numerator"
    })[id] || id;
  }

  function responseFor(question) {
    const kind = question.response.kind;
    if (kind === "single_choice") {
      const labels = (question.options || []).map((option) => option.visibleText);
      return {
        type: "single_choice",
        options: labels,
        optionIds: Object.fromEntries((question.options || []).map((option) => [option.visibleText, option.id])),
        keyboard_submit: true
      };
    }
    if (kind === "integer_fields") {
      const ids = question.response.fieldOrder || Object.keys(question.answer.fields || {});
      return {
        type: "two_step_integer",
        fields: ids.map((id) => ({ id, label: fieldLabel(id), suffix: question.answer.fixedDenominator ? ` / ${question.answer.fixedDenominator}` : "" })),
        fixedDenominator: question.answer.fixedDenominator,
        keyboard_submit: true
      };
    }
    if (kind === "fraction_input") {
      return {
        type: "fraction",
        accept_equivalent_notation: question.answer.acceptEquivalent !== false,
        partLabel: "Numerator",
        wholeLabel: "Denominator",
        unitLabel: question.response.unitLabel || null,
        keyboard_submit: true
      };
    }
    if (kind === "integer_field") {
      const denominator = Number(question.visual.fixedDenominator || question.visual.targetDenominator || question.answer.fixedDenominator || 0);
      return {
        type: "integer",
        presentation: denominator ? "fraction_builder" : "plain",
        editableField: "numerator",
        fixedDenominator: denominator || undefined,
        input_label: question.id === "R-SCALE-S" ? "Equivalent numerator" : "Difference numerator",
        keyboard_submit: true
      };
    }
    if (kind === "compound") {
      return {
        type: "choice_and_integer",
        options: [...(question.visual.orderChoices || [])],
        choiceLabel: "Keep the subtraction in its original order",
        valueLabel: "Result numerator",
        suffix: question.visual.fixedResultDenominator ? ` / ${question.visual.fixedResultDenominator}` : "",
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA-22 response kind ${kind}`);
  }

  function answerFor(question) {
    const answer = question.answer;
    if (answer.kind === "option") return optionLabel(question, answer.optionId);
    if (answer.kind === "fraction_value") return { n: String(answer.value.numerator), d: String(answer.value.denominator) };
    if (answer.kind === "integer") return String(answer.value);
    if (answer.kind === "fields") return Object.fromEntries(Object.entries(answer.fields).map(([id, value]) => [id, String(value)]));
    if (answer.kind === "compound") return { choice: String(answer.fields.selectedOrder), whole: String(answer.fields.resultNumerator) };
    return null;
  }

  function defaultErrorFamily(question) {
    if (question.family === "SELECT") return "UNKNOWN";
    if (question.family === "MISSING") return "SCALE";
    if (["DIRECT", "CONTEXT"].includes(question.family)) return "UNKNOWN";
    return question.family === "STEP" ? "COMMON" : "UNKNOWN";
  }

  function beforeSubmitIds(question) {
    return [...(question.ryanBeforeSubmitUtteranceIds || [])];
  }

  function convertQuestion(question) {
    const visibleSteps = [...(question.workedCheck?.visibleSteps || [])];
    const beforeIds = beforeSubmitIds(question);
    const correctIds = [...(question.feedback?.correctUtteranceIds || question.workedCheck?.ryanCorrectUtteranceIds || [])];
    const incorrectIds = [...(question.workedCheck?.ryanIncorrectUtteranceIds || [])];
    const hintText = question.hint?.visibleText || "";
    const model = {
      context: "fra22",
      questionId: question.id,
      visual: question.visual,
      math: question.math || null,
      accessibleDescription: question.accessibleDescription,
      workedSteps: visibleSteps,
      canonicalSignature: question.canonicalSignature,
      freshnessSignature: source.getQuestionFreshnessSignature(question)
    };
    return {
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: question.authorOnlyAssessmentIntent,
      assessmentIntent: question.authorOnlyAssessmentIntent,
      evidenceFamily: question.family,
      prompt: question.prompt,
      supportingVisibleText: [...(question.supportingVisibleText || [])],
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy.hintPolicy === "optional" ? "optional" : "none",
        hintStartsCollapsed: question.policy.hintStartsCollapsed,
        solutionPolicy: question.policy.solutionPolicy,
        scored: question.policy.scored,
        answerLocksOnSubmit: question.policy.answerLocksOnSubmit,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy.requiresFreshNoHintConfirmationIfHintUsed,
        countsAsIndependentEvidence: question.policy.countsAsIndependentEvidence,
        countsAsFreshEvidence: question.policy.countsAsFreshEvidence,
        acceptExactEquivalentValue: question.policy.acceptExactEquivalentValue,
        canonicalSignature: question.canonicalSignature,
        freshnessSignature: model.freshnessSignature
      },
      attempt_policy: { submit_label: question.response.submitLabel || "Check answer" },
      model,
      visual: { primitive: "fra22_context", action: "focus", description: question.accessibleDescription },
      scripts: {
        before_submit: textsFor(beforeIds),
        hint: hintText,
        on_correct_reaction: correctIds.length ? textFor(correctIds[0]) : "",
        on_incorrect_reaction: incorrectIds.length ? textFor(incorrectIds[0]) : "",
        on_incorrect_attempt_1: "",
        on_incorrect_attempt_2: "",
        worked_explanation: visibleSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: visibleSteps,
        worked_narration: []
      },
      mathematical_support: hintText ? { hint_1: hintText } : {},
      runtimeOutcome: { correctUtteranceIds: correctIds, incorrectUtteranceIds: incorrectIds },
      runtimeUtteranceIds: [...new Set([...beforeIds, ...correctIds, ...incorrectIds])],
      primaryErrorFamily: defaultErrorFamily(question),
      errorFamily: defaultErrorFamily(question),
      errorClassification: { fallback: defaultErrorFamily(question), requiresRepeatedEvidence: true },
      recovery_item_ref: null,
      canonicalQuestion: question
    };
  }

  function convertRepair(repair) {
    return {
      id: prefix(repair.errorFamily === "DEN_KEEP" ? "R-DEN-KEEP" : `R-${repair.errorFamily}`),
      canonicalQuestionId: repair.errorFamily === "DEN_KEEP" ? "R-DEN-KEEP" : `R-${repair.errorFamily}`,
      stage: "repair",
      target: `Repair ${repair.errorFamily}`,
      assessmentIntent: `repair_${repair.errorFamily.toLowerCase()}`,
      evidenceFamily: repair.errorFamily,
      prompt: "Repair this subtraction structure",
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: {
        context: "fra22",
        questionId: repair.errorFamily === "DEN_KEEP" ? "R-DEN-KEEP" : `R-${repair.errorFamily}`,
        repair,
        visual: { kind: "fra22_repair", family: repair.errorFamily },
        accessibleDescription: `A targeted repair for ${repair.errorFamily.toLowerCase().replace(/_/g, " ")} subtraction evidence.`
      },
      visual: { primitive: "fra22_context", action: "repair", description: `A targeted ${repair.errorFamily} repair.` },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds],
      supportedInteractionId: prefix(repair.supportedQuestionId),
      freshCheckPreferences: repair.freshQuestionPreference.map(prefix),
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily }
    };
  }

  function sceneCues(scene) {
    return scene.timelineCueIds.map((id) => {
      const cue = source.FRA22_TIMELINE_CUES.find((candidate) => candidate.id === id);
      return {
        id: cue.id,
        utteranceId: cue.utteranceId,
        cue: cue.anchorText,
        anchorText: cue.anchorText,
        action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        accessibleLabel: cue.reducedMotionState
      };
    });
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: scene.authorOnlyPurpose,
      scene: {
        display_title: scene.id === "HOOK" ? "Subtracting unlike fractions" : scene.id === "HANDOFF" ? "Your subtraction route" : "Make the pieces match",
        initial_state: scene.authorOnlyPurpose,
        objects: [scene.visualKind],
        model: { context: "fra22", sceneId: scene.id, mode: "teaching", scene }
      },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      learner_action: scene.interaction ? { button: scene.interaction.label } : undefined,
      pause_after_narration: false,
      next_step: nextId
    };
  }

  function buildQuestions() {
    return [
      ...source.FRA22_QUESTIONS.map(convertQuestion),
      ...Object.values(source.FRA22_REPAIRS).map(convertRepair)
    ];
  }

  function normaliseSubmission(question, response) {
    const canonical = question.canonicalQuestion || approvedQuestion(question.id);
    if (canonical.answer.kind === "option") return question.response.optionIds?.[String(response)] || String(response || "");
    if (canonical.answer.kind === "fraction_value") return { numerator: Number(response?.n), denominator: Number(response?.d) };
    if (canonical.answer.kind === "integer") return Number(response);
    if (canonical.answer.kind === "fields") return Object.fromEntries(Object.keys(canonical.answer.fields).map((id) => [id, Number(response?.[id])]));
    if (canonical.answer.kind === "compound") return { selectedOrder: response?.choice, resultNumerator: Number(response?.whole) };
    return response;
  }

  function structuredSubmission(question, response) {
    const canonical = question.canonicalQuestion || approvedQuestion(question.id);
    const submission = normaliseSubmission(question, response);
    if (canonical.answer.kind === "option") return { selectedOptionId: submission };
    if (canonical.answer.kind === "fields") {
      const denominator = Number(canonical.answer.fixedDenominator || canonical.response.fixedDenominator || 0);
      return {
        selectedCommonDenominator: canonical.id === "G1" ? Number(submission) : undefined,
        leftEquivalentNumerator: submission.leftEquivalentNumerator,
        leftEquivalentDenominator: denominator || undefined,
        rightEquivalentNumerator: submission.rightEquivalentNumerator,
        rightEquivalentDenominator: denominator || undefined,
        resultNumerator: submission.resultNumerator,
        resultDenominator: denominator || undefined
      };
    }
    if (canonical.answer.kind === "fraction_value") return { resultNumerator: submission.numerator, resultDenominator: submission.denominator };
    if (canonical.answer.kind === "compound") return { leftEquivalentNumerator: 14, leftEquivalentDenominator: 20, rightEquivalentNumerator: 5, rightEquivalentDenominator: 20, resultNumerator: submission.resultNumerator, resultDenominator: 20 };
    return {};
  }

  function evaluateResponse(question, response) {
    const canonical = question.canonicalQuestion || approvedQuestion(question.id);
    const submission = normaliseSubmission(question, response);
    const correct = source.evaluateQuestionAnswer(canonical.id, submission);
    const classification = correct
      ? { family: "UNKNOWN", confidence: "unknown", reason: "The response is correct." }
      : source.classifyStructuredWorking(canonical.id, structuredSubmission(question, response));
    return { correct, errorFamily: classification.family, errorConfidence: classification.confidence, reason: classification.reason, submission };
  }

  function g2Outcome(question, response, correct) {
    if (correct) return ["G2.CORRECT"];
    const submitted = normaliseSubmission(question, response);
    if (submitted.leftEquivalentNumerator !== 12) return ["G2.INCORRECT.LEFT"];
    if (submitted.rightEquivalentNumerator !== 5) return ["G2.INCORRECT.RIGHT"];
    if (submitted.resultNumerator === 17) return ["G2.INCORRECT.ADD"];
    if (submitted.resultNumerator < 0) return ["G2.INCORRECT.ORDER"];
    return [];
  }

  function selectOutcomeUtteranceIds(question, response, correct, attempts) {
    const canonical = question.canonicalQuestion || approvedQuestion(question.id);
    if (canonical.id === "G1") {
      if (correct) return ["G1.CORRECT"];
      const optionId = question.response.optionIds?.[String(response)];
      const specific = canonical.feedback?.incorrectUtteranceByOptionId?.[optionId] || [];
      return attempts > 1 ? [...(canonical.feedback?.firstMissEscalationUtteranceIds || [])] : [...specific];
    }
    if (canonical.id === "G2") return g2Outcome(question, response, correct);
    if (canonical.stage === "final") return correct ? ["FINAL.CORRECT"] : ["FINAL.INCORRECT"];
    const evaluation = evaluateResponse(question, response);
    if (!correct && evaluation.errorFamily === "ARITHMETIC") return ["ARITHMETIC.CUE"];
    return [];
  }

  const visibleByFamily = {
    DIRECT: "The response subtracts counts before the fractions use the same-sized parts.",
    SCALE: "At least one rewrite changes the fraction's value. Use the same factor on its numerator and denominator.",
    COMMON: "The chosen denominator is not shared by both starting denominators.",
    ORDER: "The converted numerators were subtracted in reverse. Keep the original order.",
    DEN_KEEP: "The common denominator names the fixed piece size, so it must stay unchanged.",
    ARITHMETIC: "The fraction structure is sound; recheck the subtraction fact.",
    UNKNOWN: "Compare each equivalent rewrite, the subtraction order, and the unchanged common denominator with the locked working."
  };

  function visibleFeedback(question, response, correct, attempts) {
    const ids = selectOutcomeUtteranceIds(question, response, correct, attempts || 1);
    if (ids.length) return textFor(ids[0]);
    if (correct) return "The exact difference matches the common-denominator working shown below.";
    const evaluation = evaluateResponse(question, response);
    return visibleByFamily[evaluation.errorFamily] || visibleByFamily.UNKNOWN;
  }

  function isBlockingFamily(family) {
    return ["DIRECT", "SCALE", "COMMON", "ORDER", "DEN_KEEP"].includes(family);
  }

  function requiresImmediateRepair(question, response, attempts) {
    const evaluation = evaluateResponse(question, response);
    return isBlockingFamily(evaluation.errorFamily) && (evaluation.errorConfidence === "high" || attempts > 1);
  }

  function evidenceRecord(questionId, state, responseStore) {
    const fullId = prefix(unprefix(questionId));
    const question = approvedQuestion(questionId);
    const saved = responseStore?.[fullId];
    const recorded = state.evidence.errorFamily[fullId];
    const candidate = state.evidence.candidateErrorFamily[fullId];
    return {
      questionId: question.id,
      stage: question.stage,
      firstAttemptCorrect: state.evidence.firstAttemptCorrect[fullId] === true,
      attempts: Number(state.attempts[fullId] || 0),
      hintOpenedBeforeSubmit: state.evidence.hintOpenedBeforeSubmit[fullId] === true,
      supportEscalated: state.evidence.supportEscalated[fullId] === true,
      answerLocked: state.evidence.answerLocked[fullId] === true,
      countsAsIndependentEvidence: question.policy.countsAsIndependentEvidence === true,
      countsAsFreshEvidence: state.evidence.countsAsFreshEvidence?.[fullId] === true,
      canonicalSignature: question.canonicalSignature,
      errorFamily: saved?.correct ? undefined : ((recorded === "support_needed" ? candidate : recorded) || candidate || undefined),
      errorConfidence: state.evidence.errorConfidence?.[fullId] || "unknown",
      freshConfirmationPassed: state.evidence.freshConfirmationPassed[fullId] === true,
      contentVersion: CONTENT_VERSION
    };
  }

  function selectFreshCheckId(family, state, exclusions) {
    const seenIds = new Set([...(exclusions || []), ...(state.seenConfirmations || [])].map(unprefix));
    const seenSignatures = new Set(Object.values(state.evidence.freshnessSignature || {}).filter(Boolean));
    const familyCandidates = source.FRA22_QUESTIONS
      .filter((question) => question.recoveryEligible && (
        family === "CONTEXT" ? question.family === "CONTEXT"
          : family === "SELECT" ? question.family === "SELECT"
            : family === "DIRECT" ? question.family === "DIRECT"
              : false
      ))
      .map((question) => prefix(question.id));
    const candidates = [...familyCandidates, ...(freshPreferencesByFamily[family] || []), ...Object.values(freshPreferencesByFamily).flat()];
    return candidates.find((id) => {
      const raw = unprefix(id);
      return !seenIds.has(raw) && !seenSignatures.has(source.getQuestionFreshnessSignature(raw));
    }) || null;
  }

  function apply(spec) {
    if (!approved || !source) throw new Error("FRA-22 approved runtime source was not loaded.");
    const issues = source.validateFRA22Spec();
    if (issues.length) throw new Error(`FRA-22 canonical source failed validation: ${issues.join("; ")}`);
    const questions = buildQuestions();
    const byRawId = (id) => questions.find((question) => question.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = "Subtract two positive fractions whose denominators are unlike and neither denominator divides the other, using exact equivalent fractions and the original subtraction order.";
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-02", "FRA-18", "FRA-21"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questions;

    const nextScene = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "T5", T5: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = approved.teachingScenes.map((scene) => teachingStep(scene, nextScene[scene.id]));
    const nextQuestion = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(["G1", "G2", "F1", "F2", "I1", "I2"].map((id) => {
      const item = byRawId(id);
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: item.scripts.before_submit,
        visual_before_answer: item.prompt,
        correct_next: nextQuestion[id],
        recovery_ref: null
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Approved FRA22 adaptive route only.", between_question_transition: "" };
    spec.lesson.exit = {
      intro_script: [textFor("FINAL.INTRO")],
      primary_question_refs: ["M1", "M2", "M3", "M4", "M5"].map(prefix),
      confirmation_question_refs: source.FRA22_QUESTIONS.filter((question) => question.recoveryEligible).map((question) => prefix(question.id)),
      mastery_policy: {
        profile: "fra22_five_item",
        secureMinimum: 4,
        totalItems: 5,
        requireDirectProcedure: true,
        requireReasoningOrApplication: true,
        blockRepeatedCentralMisconception: true,
        nearSecureRecoveryCount: 2,
        insecureRecoveryCount: 3
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra22_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-DIRECT"),
        [prefix("F2")]: prefix("C-METHOD"),
        [prefix("I1")]: prefix("C-DIRECT"),
        [prefix("I2")]: prefix("C-CONTEXT")
      },
      repair_by_error_family: repairByFamily,
      repair_supported_by_error_family: supportedByFamily,
      fresh_checks_by_error_family: Object.fromEntries(Object.entries(freshPreferencesByFamily).map(([family, ids]) => [family, ids]))
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: [textFor("COMPLETE.1")], buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building this subtraction method", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
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
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra22_context", same_whole: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra22_context", "fraction_input", "integer_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "fra22-owner-approved-v1",
      engine_profile: "fra22",
      runtime_applied: true,
      owner_review_status: "implementation_candidate_ready_for_review",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn - support nearby", independent: "Now you take over", repair: "Targeted repair", exit: "Final check", completion: "Lesson complete" },
      route_contract: approved.route,
      freshness_contract: "ordered-subtraction signature, not screen ID",
      capabilities: { exact_fraction_equivalence: true, live_ryan_word_boundaries: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, targeted_repairs: true, supported_repair_interactions: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra22Canonical = {
    CONTENT_VERSION,
    apply,
    approvedQuestion,
    buildQuestions,
    evidenceRecord,
    evaluateResponse,
    freshPreferencesByFamily,
    isBlockingFamily,
    normaliseSubmission,
    prefix,
    repairByFamily,
    requiresImmediateRepair,
    runtimeCopy,
    selectFreshCheckId,
    selectOutcomeUtteranceIds,
    source,
    supportedByFamily,
    textFor,
    unprefix,
    visibleFeedback
  };
})();
