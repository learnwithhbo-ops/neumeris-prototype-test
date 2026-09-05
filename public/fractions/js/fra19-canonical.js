(function () {
  "use strict";

  const LESSON_ID = "FRA-19";
  const CONTENT_VERSION = "fra19-simplified-storyboard-v1-handoff-1";
  const source = window.RevilyFra19V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = {
    DIRECT_ADD: prefix("R-DIRECT"),
    ONE_SIDE_SCALE: prefix("R-SCALE"),
    WRONG_FACTOR: prefix("R-SCALE"),
    INVALID_COMMON_DENOMINATOR: prefix("R-COMMON"),
    ADD_COMMON_DENOMINATORS: prefix("R-KEEP")
  };
  const freshByFamily = {
    DIRECT_ADD: [prefix("R-DIRECT-RECHECK")],
    ONE_SIDE_SCALE: [prefix("R-SCALE-RECHECK")],
    WRONG_FACTOR: [prefix("R-SCALE-RECHECK")],
    INVALID_COMMON_DENOMINATOR: [prefix("R-COMMON-RECHECK")],
    ADD_COMMON_DENOMINATORS: [prefix("R-KEEP-RECHECK")],
    DIRECT: [prefix("C-DIRECT")],
    METHOD: [prefix("C-METHOD")],
    COMMON: [prefix("C-COMMON")],
    UNKNOWN: [prefix("C-DIRECT"), prefix("C-METHOD"), prefix("C-COMMON")]
  };
  const noHintConfirmationByQuestion = {
    [prefix("F1")]: prefix("C-DIRECT"),
    [prefix("F2")]: prefix("C-METHOD"),
    [prefix("I1")]: prefix("C-DIRECT"),
    [prefix("I2")]: prefix("C-METHOD")
  };

  function entry(id) {
    const value = runtimeCopy[id];
    if (!value) throw new Error(`Missing FRA-19 runtime utterance: ${id}`);
    return value;
  }

  function textFor(id) {
    return entry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function optionLabel(question, optionId) {
    return question.options?.find((option) => option.id === optionId)?.label || optionId;
  }

  function responseFor(question) {
    const response = question.response || {};
    if (response.kind === "fraction_input") {
      return {
        type: "fraction",
        input_label: question.answer?.unit ? `Answer in ${question.answer.unit}` : "Your exact fraction",
        suffix: question.answer?.unit || null,
        accept_equivalent_notation: question.answer?.acceptAnyExactEquivalent !== false,
        keyboard_submit: true
      };
    }
    if (response.kind === "staged_common_denominator_builder") {
      return {
        type: "fra19_staged_fields",
        editableFields: [...(response.editableFields || [])],
        fixedFields: { ...(response.fixedFields || {}) },
        options: (question.options || []).map((option) => option.label),
        keyboard_submit: true
      };
    }
    if (response.kind === "single_choice" || response.kind === "non_scored_choice") {
      return {
        type: "single_choice",
        options: (question.options || []).map((option) => option.label),
        optionIds: Object.fromEntries((question.options || []).map((option) => [option.label, option.id])),
        keyboard_submit: true
      };
    }
    if (response.kind === "integer_input") {
      const fixed = response.fixedFields || {};
      const presentation = Number.isInteger(fixed.resultDenominator) || Number.isInteger(fixed.targetDenominator)
        ? "fraction_builder"
        : undefined;
      return {
        type: "integer",
        input_label: "Missing numerator",
        presentation,
        editableField: "numerator",
        fixedDenominator: fixed.resultDenominator || fixed.targetDenominator,
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA-19 response kind ${response.kind}`);
  }

  function answerFor(question) {
    const answer = question.answer || {};
    if (answer.kind === "fraction") return `${answer.canonical.numerator}/${answer.canonical.denominator}`;
    if (answer.kind === "staged") {
      return {
        commonDenominator: String(answer.commonDenominator),
        leftEquivalentNumerator: String(answer.leftEquivalentNumerator),
        rightEquivalentNumerator: String(answer.rightEquivalentNumerator),
        resultNumerator: String(answer.resultNumerator)
      };
    }
    if (answer.kind === "choice") return optionLabel(question, answer.optionId);
    if (answer.kind === "integer") return String(answer.value);
    return "continue";
  }

  function workedExplanation(question) {
    const worked = question.workedCheck || {};
    return [...(worked.steps || []), worked.finalStatement].filter(Boolean).map((line, index) => `${index + 1}. ${line}`).join("\n");
  }

  function defaultFamily(question) {
    if (question.family === "COMMON") return "INVALID_COMMON_DENOMINATOR";
    if (question.family === "EQUIVALENCE") return "WRONG_FACTOR";
    if (question.family === "SAME_DENOMINATOR_REPAIR") return "ADD_COMMON_DENOMINATORS";
    return "UNKNOWN";
  }

  function runtimeOutcome(question) {
    return {
      correctUtteranceIds: [...(question.ryanOutcomeUtteranceIds?.correct || [])],
      incorrectUtteranceIds: [...(question.ryanOutcomeUtteranceIds?.incorrect || [])]
    };
  }

  function convertQuestion(question, overrides) {
    const outcome = runtimeOutcome(question);
    const feedback = question.learnerUiFeedback || {};
    const correctLine = textsFor(outcome.correctUtteranceIds)[0] || "";
    const incorrectLine = textsFor(outcome.incorrectUtteranceIds)[0] || "";
    const runtimeUtteranceIds = [
      ...(question.ryanBeforeSubmitUtteranceIds || []),
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectUtteranceIds
    ];
    return Object.assign({
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: question.authorOnlyAssessmentIntent || question.title,
      assessmentIntent: question.authorOnlyAssessmentIntent || question.family,
      evidenceFamily: question.family,
      prompt: question.prompt,
      questionDetail: question.studentWork || "",
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy === "optional" ? "optional" : "none",
        solutionPolicy: question.policy?.solutionPolicy || "after_response",
        scored: question.stage !== "opening",
        engagementOnly: question.stage === "opening",
        answerLocksOnSubmit: question.policy?.answerLocksOnSubmit !== false,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.supportedSuccessRequiresFreshConfirmation === true,
        maxAttemptsBeforeRepair: 2
      },
      attempt_policy: { submit_label: question.response?.submitLabel || "Check answer" },
      model: {
        context: "fra19",
        questionId: question.id,
        visual: question.visual,
        math: question.math,
        workedSteps: [...(question.workedCheck?.steps || [])],
        workedFinal: question.workedCheck?.finalStatement || "",
        canonicalQuestion: question
      },
      visual: { primitive: "fra19_context", action: "focus", description: question.prompt },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds || []),
        hint: question.hintText || "",
        on_correct_reaction: correctLine,
        on_incorrect_reaction: incorrectLine,
        on_incorrect_attempt_1: "",
        on_incorrect_attempt_2: "",
        worked_explanation: workedExplanation(question),
        worked_steps: [...(question.workedCheck?.steps || [])],
        worked_narration: []
      },
      mathematical_support: question.hintText ? { hint_1: question.hintText } : {},
      visibleFeedback: {
        correct: feedback.correct || "Your answer is mathematically valid.",
        incorrectDefault: feedback.incorrectDefault || "Compare your answer with the locked working.",
        errorSpecific: { ...(feedback.errorSpecific || {}) }
      },
      runtimeOutcome: outcome,
      runtimeUtteranceIds,
      primaryErrorFamily: defaultFamily(question),
      errorClassification: { fallback: defaultFamily(question) },
      recovery_item_ref: repairByFamily[defaultFamily(question)] || null,
      canonicalQuestion: question
    }, overrides || {});
  }

  function cueFor(event, scene) {
    return {
      id: event.id,
      utteranceId: event.utteranceId,
      cue: event.anchorText,
      anchorText: event.anchorText,
      action: event.action,
      targetIds: [...(event.targetIds || [])],
      reducedMotionEquivalent: event.reducedMotionEquivalent,
      accessibleLabel: scene.visual?.accessibleDescriptionBeforeSubmit || scene.authorOnlyPurpose
    };
  }

  function sceneStep(scene, nextId) {
    return {
      id: scene.id,
      stage: "teaching",
      purpose: scene.authorOnlyPurpose,
      scene: {
        display_title: scene.title,
        model: { context: "fra19", sceneId: scene.id, visual: scene.visual, timedVisualEvents: scene.timedVisualEvents },
        initial_state: scene.visual?.accessibleDescriptionBeforeSubmit || scene.authorOnlyPurpose
      },
      narration: {
        script: textsFor(scene.utteranceIds),
        sync_cues: (scene.timedVisualEvents || []).map((event) => cueFor(event, scene))
      },
      animation_timeline: (scene.timedVisualEvents || []).map((event) => cueFor(event, scene)),
      learner_interaction: { question_ref: null },
      next_step: nextId
    };
  }

  function hookQuestion() {
    const scene = source.teachingScenes.find((item) => item.id === "HOOK");
    const options = scene.interaction.options;
    return {
      id: prefix("HOOK-CHOICE"), canonicalQuestionId: "HOOK-CHOICE", stage: "opening",
      target: "Notice whether the selected pieces match", assessmentIntent: "unscored_hook_response", evidenceFamily: "opening",
      prompt: scene.interaction.prompt,
      response: { type: "single_choice", options: options.map((option) => option.label), optionIds: Object.fromEntries(options.map((option) => [option.label, option.id])), keyboard_submit: true },
      answer: { value: options.find((option) => option.id === "NOT_YET")?.label || "Not yet" },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Continue" },
      model: { context: "fra19", questionId: "HOOK-CHOICE", visual: scene.visual, canonicalQuestion: scene },
      visual: { primitive: "fra19_context", action: "focus", description: scene.interaction.prompt },
      scripts: {
        engagement_visible_by_value: {
          Yes: "The selected sections are visibly different widths, so they are not matching pieces yet.",
          "Not yet": "Right: the rails match in length, but the selected pieces do not match in width."
        },
        engagement_response_by_value: {}, worked_explanation: ""
      },
      runtimeUtteranceIds: [], primaryErrorFamily: "UNKNOWN", errorClassification: { fallback: "UNKNOWN" }
    };
  }

  function convertRepair(repair) {
    const sceneQuestion = {
      id: prefix(repair.id), canonicalQuestionId: repair.id, stage: "repair", target: repair.scene.title,
      assessmentIntent: `repair_${repair.targets.join("_").toLowerCase()}`, evidenceFamily: repair.targets[0], prompt: repair.scene.title,
      response: { type: "continue" }, answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: { context: "fra19", questionId: repair.id, visual: repair.scene.visual, timedVisualEvents: repair.scene.timedVisualEvents, canonicalRepair: repair },
      visual: { primitive: "fra19_context", action: "repair", description: repair.scene.title },
      scripts: { reteach: textsFor(repair.scene.utteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.scene.utteranceIds],
      supportedInteractionId: prefix(repair.supportedInteraction.id),
      freshCheckId: prefix(repair.freshIndependentRecheck.id),
      primaryErrorFamily: repair.targets[0], errorClassification: { fallback: repair.targets[0] }
    };
    sceneQuestion.visual.syncCues = (repair.scene.timedVisualEvents || []).map((event) => cueFor(event, repair.scene));
    return [
      sceneQuestion,
      convertQuestion(repair.supportedInteraction, { supportedRepair: true, freshCheckId: prefix(repair.freshIndependentRecheck.id), recovery_item_ref: null }),
      convertQuestion(repair.freshIndependentRecheck, { freshRepairCheck: true, recovery_item_ref: null })
    ];
  }

  function choiceId(question, response) {
    return question.response?.optionIds?.[String(response)] || question.canonicalQuestion?.options?.find((option) => option.label === response)?.id || null;
  }

  function exactInteger(value) {
    return /^-?\d+$/.test(String(value ?? "")) ? Number(value) : null;
  }

  function fractionResult(question, response) {
    const answer = question.canonicalQuestion?.answer;
    const n = exactInteger(response?.n);
    const d = exactInteger(response?.d);
    if (!answer || answer.kind !== "fraction" || n === null || d === null || n <= 0 || d <= 0) return { correct: false, valueCorrect: false, formCorrect: false };
    const canonical = answer.canonical;
    const valueCorrect = n * canonical.denominator === d * canonical.numerator;
    const formCorrect = answer.formRequirement === "original_denominator"
      ? n === canonical.numerator && d === canonical.denominator
      : answer.formRequirement === "improper_fraction"
        ? n >= d
        : answer.acceptAnyExactEquivalent || (n === canonical.numerator && d === canonical.denominator);
    return { correct: valueCorrect && formCorrect, valueCorrect, formCorrect };
  }

  function classifyErrorFamily(question, response) {
    const authored = question.canonicalQuestion || {};
    const option = authored.options?.find((item) => item.id === choiceId(question, response));
    if (option?.authorOnlyErrorSignal) return option.authorOnlyErrorSignal;
    if (question.response?.type === "fra19_staged_fields") {
      const math = authored.math || {};
      const common = exactInteger(response?.commonDenominator ?? authored.response?.fixedFields?.commonDenominator);
      const leftN = exactInteger(response?.leftEquivalentNumerator);
      const rightN = exactInteger(response?.rightEquivalentNumerator);
      const resultN = exactInteger(response?.resultNumerator);
      if (!Number.isInteger(common) || common <= 0) return "MALFORMED";
      if (common % math.left.denominator !== 0 || common % math.right.denominator !== 0) return "INVALID_COMMON_DENOMINATOR";
      const leftExpected = math.left.numerator * (common / math.left.denominator);
      const rightExpected = math.right.numerator * (common / math.right.denominator);
      if (leftN === math.left.numerator || rightN === math.right.numerator) return "ONE_SIDE_SCALE";
      if (leftN !== leftExpected || rightN !== rightExpected) return "WRONG_FACTOR";
      if (resultN === math.left.numerator + math.right.numerator) return "DIRECT_ADD";
      if (resultN !== leftExpected + rightExpected) return "ARITHMETIC";
      return "UNKNOWN";
    }
    if (question.response?.type === "fraction") {
      const math = authored.math;
      const n = exactInteger(response?.n);
      const d = exactInteger(response?.d);
      if (n === null || d === null || d === 0) return "MALFORMED";
      if (math?.kind === "unlike_addition") {
        if (n === math.left.numerator + math.right.numerator && d === math.left.denominator + math.right.denominator) return "DIRECT_ADD";
        if (n === math.canonicalRawSum.numerator && d === math.preferredCommonDenominator * 2) return "ADD_COMMON_DENOMINATORS";
        if (d % math.left.denominator !== 0 || d % math.right.denominator !== 0) return "INVALID_COMMON_DENOMINATOR";
      }
    }
    if (authored.math?.kind === "common_denominator_choice") return "INVALID_COMMON_DENOMINATOR";
    if (authored.math?.kind === "equivalence") return "WRONG_FACTOR";
    if (authored.math?.kind === "same_denominator_repair") return "ADD_COMMON_DENOMINATORS";
    return defaultFamily(authored);
  }

  function evaluateResponse(question, response) {
    const authored = question.canonicalQuestion || {};
    let result = { correct: false, valueCorrect: false, formCorrect: false };
    if (authored.answer?.kind === "fraction") result = fractionResult(question, response);
    else if (authored.answer?.kind === "staged") {
      const keys = ["commonDenominator", "leftEquivalentNumerator", "rightEquivalentNumerator", "resultNumerator"];
      const correct = keys.every((key) => exactInteger(response?.[key]) === authored.answer[key]);
      result = { correct, valueCorrect: correct, formCorrect: correct };
    } else if (authored.answer?.kind === "choice") {
      const correct = choiceId(question, response) === authored.answer.optionId;
      result = { correct, valueCorrect: correct, formCorrect: correct };
    } else if (authored.answer?.kind === "integer") {
      const correct = exactInteger(response) === authored.answer.value;
      result = { correct, valueCorrect: correct, formCorrect: correct };
    } else if (question.policy?.engagementOnly) {
      result = { correct: choiceId(question, response) === "NOT_YET", valueCorrect: true, formCorrect: true };
    }
    const family = result.correct ? null : classifyErrorFamily(question, response);
    return {
      ...result,
      errorFamily: family,
      visibleFeedback: visibleFeedback(question, response, result.correct, family),
      runtimeUtteranceIds: result.correct ? [...(question.runtimeOutcome?.correctUtteranceIds || [])] : [...(question.runtimeOutcome?.incorrectUtteranceIds || [])]
    };
  }

  function visibleFeedback(question, response, correct, knownFamily) {
    if (correct) return question.visibleFeedback?.correct || "Your answer is mathematically valid.";
    const family = knownFamily || classifyErrorFamily(question, response);
    return question.visibleFeedback?.errorSpecific?.[family]
      || question.visibleFeedback?.incorrectDefault
      || "Compare your answer with the locked working.";
  }

  function selectOutcomeUtteranceIds(question, response) {
    return evaluateResponse(question, response).runtimeUtteranceIds;
  }

  function requiresRepeatedEvidence(question, response) {
    const family = classifyErrorFamily(question, response);
    if (["MALFORMED", "ARITHMETIC", "UNKNOWN"].includes(family)) return false;
    const option = question.canonicalQuestion?.options?.find((item) => item.id === choiceId(question, response));
    if (option?.authorOnlyErrorSignal) return false;
    return ["DIRECT_ADD", "INVALID_COMMON_DENOMINATOR", "ADD_COMMON_DENOMINATORS"].includes(family);
  }

  function shouldSkipF1(evidence) {
    const clean = (item) => item?.firstAttemptCorrect === true
      && item?.allComponentsCorrect === true
      && item?.hintOpenedBeforeSubmit !== true
      && item?.supportEscalated !== true;
    return clean(evidence?.g1) && clean(evidence?.g2) && !(evidence?.centralErrorSignals || []).some((family) => ["DIRECT_ADD", "ONE_SIDE_SCALE", "WRONG_FACTOR", "INVALID_COMMON_DENOMINATOR", "ADD_COMMON_DENOMINATORS"].includes(family));
  }

  function evaluateFinalEvidence(records) {
    const score = records.filter((record) => record.correct).length;
    const directProcedure = records.some((record) => ["M1", "M2"].includes(unprefix(record.questionId)) && record.correct);
    const contextOrReasoning = records.some((record) => ["M3", "M4", "M5"].includes(unprefix(record.questionId)) && record.correct);
    const counts = {};
    records.filter((record) => !record.correct && record.errorFamily).forEach((record) => { counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1; });
    const repeatedBlockingFamilies = Object.keys(counts).filter((family) => counts[family] >= 2 && !["ARITHMETIC", "MALFORMED", "UNKNOWN"].includes(family));
    return { score, directProcedure, contextOrReasoning, repeatedBlockingFamilies, masterySatisfied: score >= 4 && directProcedure && contextOrReasoning && repeatedBlockingFamilies.length === 0 };
  }

  const recoveryPriorityByFamily = {
    STAGED: ["REC-DIRECT-A", "REC-DIRECT-B", "REC-DIRECT-C"], DIRECT: ["REC-DIRECT-A", "REC-DIRECT-B", "REC-DIRECT-C"],
    FORM: ["REC-FORM-A", "REC-DIRECT-B"], CONTEXT: ["REC-CONTEXT-A", "REC-DIRECT-C"], METHOD: ["REC-REASON-A", "REC-DIRECT-B"],
    ERROR: ["REC-ERROR-A", "REC-DIRECT-A"], REASON: ["REC-REASON-A", "REC-CONTEXT-A"], COMMON: ["REC-COMMON-A", "REC-DIRECT-C"],
    EQUIVALENCE: ["REC-EQUIV-A", "REC-DIRECT-B"], SAME_DENOMINATOR_REPAIR: ["REC-KEEP-A", "REC-DIRECT-C"]
  };
  const recoveryPriorityByError = {
    DIRECT_ADD: ["REC-ERROR-A", "REC-DIRECT-A"], ONE_SIDE_SCALE: ["REC-EQUIV-A", "REC-DIRECT-B"], WRONG_FACTOR: ["REC-EQUIV-A", "REC-DIRECT-C"],
    INVALID_COMMON_DENOMINATOR: ["REC-COMMON-A", "REC-DIRECT-A"], ADD_COMMON_DENOMINATORS: ["REC-KEEP-A", "REC-DIRECT-C"],
    ARITHMETIC: ["REC-DIRECT-C", "REC-CONTEXT-A"], UNKNOWN: ["REC-DIRECT-B", "REC-REASON-A"]
  };

  function selectRecoveryQuestionIds(profileId, missedFamilies, activeErrorFamilies, seenQuestionIds) {
    const profile = source.recoveryProfiles.find((item) => item.id === profileId);
    if (!profile) return [];
    const seen = new Set((seenQuestionIds || []).map(unprefix));
    const ordered = [];
    const add = (ids) => (ids || []).forEach((id) => { if (!ordered.includes(id)) ordered.push(id); });
    (activeErrorFamilies || []).forEach((family) => add(recoveryPriorityByError[family]));
    (missedFamilies || []).forEach((family) => add(recoveryPriorityByFamily[family]));
    add(profile.deterministicFallbackItemIds);
    add(source.recoveryQuestions.map((item) => item.id));
    const selected = [];
    const usedFamilies = new Set();
    for (const id of ordered) {
      if (seen.has(id)) continue;
      const item = source.recoveryQuestions.find((candidate) => candidate.id === id);
      if (!item) continue;
      if (selected.length && usedFamilies.has(item.family)) {
        const distinctRemains = ordered.some((laterId) => {
          const later = source.recoveryQuestions.find((candidate) => candidate.id === laterId);
          return later && !seen.has(laterId) && !selected.includes(laterId) && !usedFamilies.has(later.family);
        });
        if (distinctRemains) continue;
      }
      selected.push(id);
      usedFamilies.add(item.family);
      if (selected.length === profile.itemCount) break;
    }
    return selected.map(prefix);
  }

  function validateRuntimeContract() {
    const errors = [];
    if (!approved || approved.id !== LESSON_ID) errors.push("Approved FRA-19 spec is missing.");
    if (Object.keys(runtimeCopy).length !== 54) errors.push("FRA-19 must contain exactly 54 runtime utterances.");
    Object.entries(runtimeCopy).forEach(([id, value]) => {
      if (value.captionSource !== "same_as_audio") errors.push(`${id}: caption source must match audio.`);
    });
    source.teachingScenes.forEach((scene) => (scene.timedVisualEvents || []).forEach((event) => {
      if (!runtimeCopy[event.utteranceId]) errors.push(`${event.id}: missing utterance ${event.utteranceId}.`);
      else if (!runtimeCopy[event.utteranceId].text.toLowerCase().includes(event.anchorText.toLowerCase())) errors.push(`${event.id}: anchor is not present in its utterance.`);
    }));
    return errors;
  }

  function apply(baseSpec) {
    if (!approved) throw new Error("FRA-19 approved source has not loaded.");
    const runtimeErrors = validateRuntimeContract();
    if (runtimeErrors.length) throw new Error(runtimeErrors.join("\n"));
    const spec = structuredClone(baseSpec);
    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, cluster: approved.strand });
    spec.diagnostic = { enabled: false, question_refs: [] };
    spec.retrieval_practice = { enabled: false, question_refs: [] };

    const converted = new Map(source.allQuestions.map((question) => [question.id, convertQuestion(question)]));
    const repairQuestions = source.repairs.flatMap(convertRepair);
    const hook = hookQuestion();
    const teachingSteps = [];
    source.teachingScenes.forEach((scene, index) => {
      const nextScene = source.teachingScenes[index + 1]?.id;
      const next = scene.id === "HOOK" ? "HOOK-CHOICE" : (nextScene || "G1");
      teachingSteps.push(sceneStep(scene, next));
      if (scene.id === "HOOK") {
        teachingSteps.push({
          id: "HOOK-CHOICE", stage: "teaching", purpose: "Let the learner commit to the visible mismatch without scoring it.",
          scene: { display_title: scene.title, model: { context: "fra19", sceneId: "HOOK-CHOICE", visual: scene.visual }, initial_state: scene.visual.accessibleDescriptionBeforeSubmit },
          narration: { script: [], sync_cues: [] }, learner_interaction: { question_ref: hook.id }, next_step: "T1"
        });
      }
    });
    teachingSteps.push({
      id: "INDEPENDENT-TRANSITION", stage: "teaching", purpose: "Hand all decisions to the learner.",
      scene: { display_title: "Now you make the decisions", model: { context: "fra19", sceneId: "INDEPENDENT-TRANSITION", visual: { kind: "stage_transition" } }, initial_state: "The full method is shown without worked values." },
      narration: { script: textsFor(approved.sectionTransitions.independentUtteranceIds), sync_cues: [] }, learner_interaction: { question_ref: null }, next_step: "I1"
    });
    teachingSteps.push({
      id: "FINAL-INTRO", stage: "teaching", purpose: "Open the uninterrupted five-item final check.",
      scene: { display_title: "Final check", model: { context: "fra19", sceneId: "FINAL-INTRO", visual: { kind: "stage_transition" } }, initial_state: "Five unanswered final-check cards are shown." },
      narration: { script: textsFor(approved.sectionTransitions.finalUtteranceIds), sync_cues: [] }, learner_interaction: { question_ref: null }, next_step: "M1"
    });

    const transferSteps = {
      G1: { stage: "guided", question_ref: prefix("G1"), support_level: "high", pre_question_script: textsFor(source.primaryQuestions.find((q) => q.id === "G1").ryanBeforeSubmitUtteranceIds), correct_next: "G2" },
      G2: { stage: "guided", question_ref: prefix("G2"), support_level: "high", pre_question_script: textsFor(source.primaryQuestions.find((q) => q.id === "G2").ryanBeforeSubmitUtteranceIds), correct_next: "F1" },
      F1: { stage: "faded", question_ref: prefix("F1"), support_level: "reduced", pre_question_script: "", correct_next: "F2" },
      F2: { stage: "faded", question_ref: prefix("F2"), support_level: "reduced", pre_question_script: "", correct_next: "INDEPENDENT-TRANSITION" },
      I1: { stage: "independent", question_ref: prefix("I1"), support_level: "none", pre_question_script: "", correct_next: "I2" },
      I2: { stage: "independent", question_ref: prefix("I2"), support_level: "none", pre_question_script: "", correct_next: "FINAL-INTRO" }
    };
    const finalRefs = source.finalQuestions.map((question) => prefix(question.id));
    spec.lesson = {
      teaching_steps: teachingSteps,
      transfer_steps: transferSteps,
      practice: { question_order: [], intro_script: "" },
      exit: {
        intro_script: "", primary_question_refs: finalRefs, confirmation_question_refs: [],
        mastery_policy: { profile: "fra19_five_item", secureThreshold: 4, repairCycleCapPerFamily: 1 },
        use_question_before_submit_narration: false
      },
      adaptive_pathway: {
        no_hint_gate_after: { nodeId: "I2", returnId: "FINAL-INTRO", introUtteranceIds: [] },
        no_hint_confirmation_by_question: noHintConfirmationByQuestion,
        repair_by_error_family: repairByFamily,
        fresh_checks_by_error_family: freshByFamily,
        feedback_by_error_family: Object.fromEntries(source.misconceptions.map((item) => [item.code, item.immediateUiFeedback])),
        recovery_profiles: source.recoveryProfiles
      }
    };
    const ordinaryQuestions = [
      ...source.primaryQuestions,
      ...source.finalQuestions,
      ...source.recoveryQuestions
    ].map((question) => converted.get(question.id));
    spec.question_bank = [hook, ...ordinaryQuestions, ...repairQuestions];
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.adaptiveRoute.finalGate.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Another pass is needed", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan", voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)", locale: "en-GB", opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra19_context", equal_whole_length: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra19_context", "fraction_input", "fra19_staged_fields", "single_choice", "integer_input", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: false, version: CONTENT_VERSION, content_version: CONTENT_VERSION,
      storyboard_version: "fra19-owner-approved-v1", engine_profile: "fra19", runtime_applied: true,
      owner_review_status: approved.status, runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, value]) => [value.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Less support", independent: "Your turn", repair: "Quick repair", exit: "Final check", completion: "Lesson complete" },
      route_contract: approved.adaptiveRoute,
      capabilities: { exact_fraction_equivalence: true, staged_answers: true, larger_valid_common_denominators: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, five_item_final: true, targeted_repairs: true, deterministic_recovery_only: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra19Canonical = {
    CONTENT_VERSION, apply, classifyErrorFamily, evaluateFinalEvidence, evaluateResponse, freshByFamily,
    repairByFamily, requiresRepeatedEvidence, runtimeCopy, selectOutcomeUtteranceIds, selectRecoveryQuestionIds,
    shouldSkipF1, textFor, validateRuntimeContract, visibleFeedback
  };
})();
