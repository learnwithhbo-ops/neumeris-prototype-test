(function () {
  "use strict";

  const LESSON_ID = "FRA-18";
  const CONTENT_VERSION = "fra18-simplified-storyboard-v1-handoff-1";
  const source = window.RevilyFra18V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = {
    "BOTH-CHANGE": prefix("R-ONE"),
    "READY-OPERAND": prefix("R-ONE"),
    "DEN-ONLY": prefix("R-EQUIV"),
    "WRONG-FACTOR": prefix("R-EQUIV"),
    "OLD-NUM": prefix("R-NEW-NUM"),
    "DEN-ADD": prefix("R-DENOM")
  };
  const noHintConfirmationByQuestion = {
    [prefix("F1")]: prefix("C1"),
    [prefix("F2")]: prefix("C2"),
    [prefix("I1")]: prefix("C1"),
    [prefix("I2")]: prefix("C2")
  };

  function entry(id) {
    const value = runtimeCopy[id];
    if (!value) throw new Error(`Missing FRA-18 runtime utterance: ${id}`);
    return value;
  }

  function textFor(id) {
    return entry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function optionLabel(question, optionId) {
    return question.response?.options?.find((option) => option.id === optionId)?.text || optionId;
  }

  function responseFor(question) {
    const response = question.response || {};
    if (response.kind === "fraction") {
      return {
        type: "fraction",
        input_label: "Your exact fraction",
        accept_equivalent_notation: true,
        keyboard_submit: true
      };
    }
    if (response.kind === "choice" || response.kind === "decision") {
      return {
        type: "single_choice",
        options: (response.options || []).map((option) => option.text),
        optionIds: Object.fromEntries((response.options || []).map((option) => [option.text, option.id])),
        keyboard_submit: true
      };
    }
    if (response.kind === "fields" || response.kind === "select_then_fields") {
      return {
        type: response.kind === "fields" ? "fra18_fields" : "fra18_select_then_fields",
        editableFields: [...(response.requiredFields || [])],
        correctOperand: response.correctOperand || null,
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA-18 response kind ${response.kind}`);
  }

  function answerFor(question) {
    const response = question.response || {};
    if (response.kind === "fraction") {
      const value = response.acceptedFraction;
      return { n: String(value.numerator), d: String(value.denominator) };
    }
    if (response.kind === "choice") return optionLabel(question, response.correctOptionId);
    if (response.kind === "decision") return optionLabel(question, "WAIT");
    return Object.fromEntries(Object.entries(response.correctFields || {}).map(([key, value]) => [key, String(value)]));
  }

  function cueFor(event, owner) {
    return {
      id: event.id,
      utteranceId: event.utteranceId,
      cue: event.anchorText,
      anchorText: event.anchorText,
      action: event.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      targetIds: [],
      accessibleLabel: owner.accessibleDescription || owner.accessibility?.preSubmitDescription || event.reducedMotionEquivalent,
      reducedMotionEquivalent: event.reducedMotionEquivalent,
      requiresAnswerLocked: event.requiresAnswerLocked === true
    };
  }

  function runtimeOutcome(question) {
    return {
      correctUtteranceIds: [...(question.feedback?.correct?.ryanUtteranceIds || [])],
      incorrectUtteranceIds: [...(question.feedback?.incorrectDefault?.ryanUtteranceIds || [])]
    };
  }

  function convertQuestion(question, overrides) {
    const outcome = runtimeOutcome(question);
    const runtimeUtteranceIds = [
      ...(question.ryanBeforeSubmitUtteranceIds || []),
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectUtteranceIds
    ];
    const finalLike = ["final", "recovery_mini", "recovery_final"].includes(question.stage);
    const hintText = question.hint?.uiText || "";
    const cues = (question.timeline || []).map((event) => cueFor(event, question));
    return Object.assign({
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: (question.assessmentIntents || []).join(" + ") || question.representation,
      assessmentIntent: [...(question.assessmentIntents || [])],
      evidenceFamily: [...(question.assessmentIntents || [])],
      prompt: question.prompt,
      questionDetail: question.representation || "",
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: hintText ? "optional" : "none",
        solutionPolicy: finalLike || question.workedCheck?.requiresAnswerLocked ? "after_locked_submit" : "after_response",
        scored: question.scored === true,
        engagementOnly: question.scored !== true,
        answerLocksOnSubmit: finalLike,
        requiresFreshNoHintConfirmationIfHintUsed: ["F1", "F2", "I1", "I2"].includes(question.id),
        maxAttemptsBeforeRepair: 2,
        countsAsIndependentEvidence: ["independent", "final", "recovery_mini", "recovery_final", "repair_recheck", "confirmation"].includes(question.stage)
      },
      attempt_policy: { submit_label: question.scored ? "Check answer" : "Continue" },
      model: {
        context: "fra18",
        questionId: question.id,
        visual: question.visualSpec || {},
        math: question.math || null,
        equivalence: question.equivalence || null,
        workedSteps: [...(question.workedCheck?.uiSteps || [])],
        canonicalQuestion: question,
        accessibleDescription: question.accessibility?.preSubmitDescription || ""
      },
      visual: { primitive: "fra18_context", action: "focus", description: question.prompt, syncCues: cues },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds || []),
        hint: "",
        on_correct_reaction: textsFor(outcome.correctUtteranceIds)[0] || "",
        on_incorrect_reaction: textsFor(outcome.incorrectUtteranceIds)[0] || "",
        on_incorrect_attempt_1: "",
        on_incorrect_attempt_2: "",
        worked_explanation: (question.workedCheck?.uiSteps || []).map((line, index) => `${index + 1}. ${line}`).join("\n"),
        worked_steps: [...(question.workedCheck?.uiSteps || [])],
        worked_narration: []
      },
      mathematical_support: hintText ? { hint_1: hintText } : {},
      visibleFeedback: {
        correct: question.feedback?.correct?.uiText || "That matches the one-conversion method.",
        incorrectDefault: question.feedback?.incorrectDefault?.uiText || "Check which denominator already fits both fractions."
      },
      runtimeOutcome: outcome,
      runtimeUtteranceIds,
      primaryErrorFamily: "UNKNOWN",
      errorClassification: { fallback: "UNKNOWN" },
      recovery_item_ref: null,
      canonicalQuestion: question
    }, overrides || {});
  }

  function sceneStep(scene, nextId) {
    const cues = (scene.timeline || []).map((event) => cueFor(event, scene));
    return {
      id: scene.id,
      stage: "teaching",
      purpose: scene.purpose,
      scene: {
        display_title: scene.id === "HOOK" ? "One battery, two part sizes" : scene.id === "HANDOFF" ? "The three-step method" : `Learn the idea ${scene.id.replace("T", "")}`,
        model: { context: "fra18", sceneId: scene.id, visual: scene.visual, timeline: scene.timeline },
        initial_state: scene.accessibleDescription
      },
      narration: { script: textsFor(scene.ryanUtteranceIds), sync_cues: cues },
      animation_timeline: cues,
      learner_interaction: { question_ref: null },
      next_step: nextId
    };
  }

  function convertRepair(repair) {
    const supported = source.questions.find((question) => question.id === repair.supportedQuestionId);
    const freshId = repair.id === "R-DENOM" ? "R4-CHECK" : repair.freshRecheckQuestionId;
    return {
      id: prefix(repair.id),
      canonicalQuestionId: repair.id,
      stage: "repair",
      target: repair.name,
      assessmentIntent: [...repair.errorFamilies],
      evidenceFamily: [...repair.errorFamilies],
      prompt: repair.name,
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: {
        context: "fra18",
        questionId: repair.id,
        repair,
        visual: supported?.visualSpec || {},
        math: supported?.math || null,
        accessibleDescription: repair.name
      },
      visual: { primitive: "fra18_context", action: "repair", description: repair.name, syncCues: [] },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds],
      supportedInteractionId: prefix(repair.supportedQuestionId),
      freshCheckId: prefix(freshId),
      alternateFreshCheckId: repair.alternateFreshRecheckQuestionId ? prefix(repair.alternateFreshRecheckQuestionId) : null,
      primaryErrorFamily: repair.errorFamilies[0],
      errorClassification: { fallback: repair.errorFamilies[0] },
      canonicalRepair: repair
    };
  }

  function exactInteger(value) {
    return /^-?\d+$/.test(String(value ?? "")) ? Number(value) : null;
  }

  function choiceId(question, response) {
    return question.response?.optionIds?.[String(response)]
      || question.canonicalQuestion?.response?.options?.find((option) => option.text === response)?.id
      || null;
  }

  function fractionEqual(left, right) {
    return Boolean(left && right && left.denominator && right.denominator && left.numerator * right.denominator === right.numerator * left.denominator);
  }

  function evaluateFields(authored, values, selectedOperand) {
    const response = authored.response || {};
    if (response.correctOperand && selectedOperand !== response.correctOperand) {
      return { valid: true, correct: false, errorFamily: "READY-OPERAND", possibleErrorFamilies: ["READY-OPERAND"] };
    }
    const required = response.requiredFields || [];
    if (required.some((field) => exactInteger(values?.[field]) === null)) {
      return { valid: false, correct: false, errorFamily: null, possibleErrorFamilies: [] };
    }
    const actual = Object.fromEntries(required.map((field) => [field, exactInteger(values[field])]));
    if (required.every((field) => actual[field] === response.correctFields?.[field])) {
      return { valid: true, correct: true, errorFamily: null, possibleErrorFamilies: [] };
    }
    const conversion = authored.math;
    const equivalence = authored.equivalence;
    const originalChangingNumerator = conversion
      ? (conversion.changingOperand === "left" ? conversion.left.numerator : conversion.right.numerator)
      : equivalence?.source?.numerator;
    if (required.includes("convertedNumerator") && actual.convertedNumerator !== response.correctFields.convertedNumerator) {
      if (actual.convertedNumerator === originalChangingNumerator) return { valid: true, correct: false, errorFamily: "DEN-ONLY", possibleErrorFamilies: ["DEN-ONLY"] };
      return { valid: true, correct: false, errorFamily: "WRONG-FACTOR", possibleErrorFamilies: ["WRONG-FACTOR", "ARITHMETIC"] };
    }
    if (conversion && required.includes("sumNumerator") && actual.sumNumerator !== response.correctFields.sumNumerator) {
      const oldChanging = conversion.changingOperand === "left" ? conversion.left.numerator : conversion.right.numerator;
      if (actual.sumNumerator === oldChanging + conversion.readyNumerator && (!required.includes("convertedNumerator") || actual.convertedNumerator === response.correctFields.convertedNumerator)) {
        return { valid: true, correct: false, errorFamily: "OLD-NUM", possibleErrorFamilies: ["OLD-NUM"] };
      }
      return { valid: true, correct: false, errorFamily: "ARITHMETIC", possibleErrorFamilies: ["ARITHMETIC"] };
    }
    if (required.includes("finalDenominator") && actual.finalDenominator !== response.correctFields.finalDenominator) {
      if (conversion && [conversion.left.denominator + conversion.right.denominator, 2 * conversion.targetDenominator].includes(actual.finalDenominator)) {
        return { valid: true, correct: false, errorFamily: "DEN-ADD", possibleErrorFamilies: ["DEN-ADD"] };
      }
      return { valid: true, correct: false, errorFamily: "UNKNOWN", possibleErrorFamilies: ["DEN-ADD", "ARITHMETIC"] };
    }
    return { valid: true, correct: false, errorFamily: "UNKNOWN", possibleErrorFamilies: ["UNKNOWN"] };
  }

  function evaluateResponse(question, response) {
    const authored = question.canonicalQuestion || {};
    const kind = authored.response?.kind;
    let result;
    if (kind === "decision") {
      const selected = choiceId(question, response);
      const valid = authored.response.options.some((option) => option.id === selected);
      result = { valid, correct: valid && selected === "WAIT", valueCorrect: valid, formCorrect: valid, errorFamily: null, possibleErrorFamilies: [] };
    } else if (kind === "choice") {
      const selected = choiceId(question, response);
      const option = authored.response.options.find((candidate) => candidate.id === selected);
      const correct = Boolean(option && selected === authored.response.correctOptionId);
      result = { valid: Boolean(option), correct, valueCorrect: correct, formCorrect: correct, errorFamily: correct ? null : (option?.errorFamily || "UNKNOWN"), possibleErrorFamilies: correct ? [] : [option?.errorFamily || "UNKNOWN"] };
    } else if (kind === "fraction") {
      const submitted = { numerator: exactInteger(response?.n), denominator: exactInteger(response?.d) };
      const valid = submitted.numerator !== null && submitted.denominator !== null && submitted.denominator !== 0;
      const accepted = authored.response.acceptedFraction;
      const correct = valid && fractionEqual(submitted, accepted);
      const matched = valid ? (authored.response.commonWrongAnswers || []).find((wrong) => fractionEqual(submitted, wrong.fraction)) : null;
      let possibleErrorFamilies = matched ? [matched.errorFamily] : ["UNKNOWN"];
      let family = matched?.errorFamily || "UNKNOWN";
      if (!correct && valid && !matched && authored.math && submitted.denominator === authored.math.targetDenominator) {
        const oldChanging = authored.math.changingOperand === "left" ? authored.math.left.numerator : authored.math.right.numerator;
        if (submitted.numerator === oldChanging + authored.math.readyNumerator) {
          family = "UNKNOWN";
          possibleErrorFamilies = ["DEN-ONLY", "OLD-NUM"];
        }
      }
      result = { valid, correct, valueCorrect: correct, formCorrect: correct, errorFamily: correct || !valid ? null : family, possibleErrorFamilies: correct || !valid ? [] : possibleErrorFamilies };
    } else if (kind === "fields" || kind === "select_then_fields") {
      result = evaluateFields(authored, response || {}, response?.selectedOperand);
      result.valueCorrect = result.correct;
      result.formCorrect = result.correct;
    } else {
      result = { valid: false, correct: false, valueCorrect: false, formCorrect: false, errorFamily: null, possibleErrorFamilies: [] };
    }
    const visible = visibleFeedback(question, response, result.correct, result.errorFamily, result.valid);
    return {
      ...result,
      visibleFeedback: visible,
      runtimeUtteranceIds: result.correct ? [...(question.runtimeOutcome?.correctUtteranceIds || [])] : [...(question.runtimeOutcome?.incorrectUtteranceIds || [])]
    };
  }

  function visibleFeedback(question, response, correct, knownFamily, valid) {
    if (question.policy?.engagementOnly) {
      return choiceId(question, response) === "ADD"
        ? question.canonicalQuestion.feedback.correct.uiText
        : question.canonicalQuestion.feedback.incorrectDefault.uiText;
    }
    if (correct) return question.visibleFeedback?.correct || "That matches the one-conversion method.";
    if (valid === false) return "Complete every required answer field before checking.";
    const family = knownFamily || classifyErrorFamily(question, response);
    return source.misconceptions.find((item) => item.code === family)?.immediateUiFeedback
      || question.visibleFeedback?.incorrectDefault
      || "Check which denominator already fits both fractions.";
  }

  function classifyErrorFamily(question, response) {
    return evaluateResponse(question, response).errorFamily || "UNKNOWN";
  }

  function selectOutcomeUtteranceIds(question, response) {
    return evaluateResponse(question, response).runtimeUtteranceIds;
  }

  function isStructuralEvidence(question, evaluation) {
    if (!evaluation?.errorFamily || ["UNKNOWN", "ARITHMETIC"].includes(evaluation.errorFamily)) return false;
    if (question.response?.type === "fra18_select_then_fields" && evaluation.errorFamily === "READY-OPERAND") return false;
    return ["fra18_fields", "fra18_select_then_fields", "single_choice"].includes(question.response?.type);
  }

  function shouldSkipF1(records) {
    const clean = (record) => record?.firstAttemptCorrect === true
      && record?.hintOpenedBeforeSubmit !== true
      && record?.supportEscalated !== true
      && !(record?.errorFamilies || []).length;
    return clean(records?.g1) && clean(records?.g2);
  }

  function getRequiredHintConfirmation(questionId, laterCleanIndependentFamilies) {
    const id = unprefix(questionId);
    if (id === "I1") return prefix("C1");
    if (id === "I2") return prefix("C2");
    if (["F1", "F2"].includes(id) && !(laterCleanIndependentFamilies || []).includes("ONE_CONVERSION")) return prefix(id === "F1" ? "C1" : "C2");
    return null;
  }

  function selectDiscriminator(possibleFamilies) {
    const families = new Set(possibleFamilies || []);
    if (families.has("OLD-NUM")) return prefix("D-NEW-NUM");
    if (families.has("DEN-ONLY") || families.has("WRONG-FACTOR")) return prefix("D-EQUIV");
    if (families.has("BOTH-CHANGE") || families.has("READY-OPERAND")) return prefix("D-ONE");
    if (families.has("DEN-ADD")) return prefix("D-DENOM");
    return null;
  }

  function selectMiniCheck(missedIds, errorFamilies) {
    const preferred = [];
    const missed = new Set((missedIds || []).map(unprefix));
    const families = new Set(errorFamilies || []);
    if (families.has("BOTH-CHANGE") || families.has("READY-OPERAND") || missed.has("M5")) preferred.push("MC-ONE");
    if (families.has("DEN-ONLY") || families.has("WRONG-FACTOR") || missed.has("M3")) preferred.push("MC-EQUIV");
    if (families.has("OLD-NUM") || missed.has("M3")) preferred.push("MC-NEW-NUM");
    if (families.has("DEN-ADD") || missed.has("M1") || missed.has("M5")) preferred.push("MC-DENOM");
    if (missed.has("M4")) preferred.push("MC-CONTEXT");
    approved.adaptiveRouting.miniCheckCandidates.forEach((id) => { if (!preferred.includes(id)) preferred.push(id); });
    return preferred.slice(0, 2).map(prefix);
  }

  function selectDenomRepairCheck(seenQuestionIds) {
    const seen = new Set((seenQuestionIds || []).map(unprefix));
    if (!seen.has("F1") && !seen.has("R4-CHECK")) return prefix("R4-CHECK");
    if (!seen.has("R4-CHECK-ALT")) return prefix("R4-CHECK-ALT");
    return null;
  }

  function evaluateFinalEvidence(records) {
    const primary = new Set(approved.adaptiveRouting.primaryFinalSequence);
    const committed = (records || []).filter((record) => primary.has(unprefix(record.questionId)) && record.supported !== true);
    const correct = committed.filter((record) => record.correctFirstAttempt === true);
    const score = correct.length;
    const correctIds = correct.map((record) => unprefix(record.questionId));
    const procedural = correctIds.some((id) => ["M1", "M2", "M3"].includes(id));
    const reasoningApplication = correctIds.some((id) => ["M4", "M5"].includes(id));
    const counts = {};
    committed.flatMap((record) => record.errorFamilies || []).forEach((family) => { counts[family] = (counts[family] || 0) + 1; });
    const repeatedBlockingFamilies = Object.keys(counts).filter((family) => !["ARITHMETIC", "UNKNOWN"].includes(family) && counts[family] >= 2);
    return { score, procedural, reasoningApplication, repeatedBlockingFamilies, masterySatisfied: score >= 4 && procedural && reasoningApplication && repeatedBlockingFamilies.length === 0 };
  }

  function routeFinal(records) {
    const evaluation = evaluateFinalEvidence(records);
    if (evaluation.masterySatisfied) return { kind: "finish", evaluation };
    const missed = (records || []).filter((record) => record.correctFirstAttempt !== true).map((record) => record.questionId);
    const families = (records || []).flatMap((record) => record.errorFamilies || []);
    const repairIds = [...new Set(families.map((family) => repairByFamily[family]).filter(Boolean))];
    if (evaluation.score >= 3) return { kind: "repair_then_mini_check", evaluation, repairIds, recoveryIds: selectMiniCheck(missed, families), requiredCorrect: 2 };
    return { kind: "repair_then_alternate_final", evaluation, repairIds, recoveryIds: approved.adaptiveRouting.alternateFinalSequence.map(prefix), requiredCorrect: 4 };
  }

  function validateRuntimeContract() {
    const errors = [];
    if (!approved || approved.id !== LESSON_ID) errors.push("Approved FRA-18 spec is missing.");
    if (Object.keys(runtimeCopy).length !== 49) errors.push("FRA-18 must contain exactly 49 runtime utterances.");
    Object.entries(runtimeCopy).forEach(([id, value]) => {
      if (value.spokenBy !== "Ryan") errors.push(`${id}: runtime speaker must be Ryan.`);
      if (value.captionSource !== "same_as_audio") errors.push(`${id}: caption source must match audio.`);
    });
    source.teachingScenes.forEach((scene) => (scene.timeline || []).forEach((event) => {
      if (!runtimeCopy[event.utteranceId]) errors.push(`${event.id}: missing utterance ${event.utteranceId}.`);
      else if (!runtimeCopy[event.utteranceId].text.toLowerCase().includes(event.anchorText.toLowerCase())) errors.push(`${event.id}: anchor is not present in its utterance.`);
    }));
    source.questions.forEach((question) => (question.timeline || []).forEach((event) => {
      if (!runtimeCopy[event.utteranceId]) errors.push(`${event.id}: missing utterance ${event.utteranceId}.`);
      else if (!runtimeCopy[event.utteranceId].text.toLowerCase().includes(event.anchorText.toLowerCase())) errors.push(`${event.id}: anchor is not present in its utterance.`);
    }));
    return errors;
  }

  function apply(baseSpec) {
    if (!approved) throw new Error("FRA-18 approved source has not loaded.");
    const runtimeErrors = validateRuntimeContract();
    if (runtimeErrors.length) throw new Error(runtimeErrors.join("\n"));
    const spec = structuredClone(baseSpec);
    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, cluster: approved.strand });
    spec.diagnostic = { enabled: false, question_refs: [] };
    spec.retrieval_practice = { enabled: false, question_refs: [] };

    const converted = new Map(source.questions.map((question) => [question.id, convertQuestion(question)]));
    const teachingSteps = [];
    source.teachingScenes.forEach((scene, index) => {
      const nextScene = source.teachingScenes[index + 1]?.id;
      const next = scene.id === "HOOK" ? "HOOK-CHOICE" : (nextScene || "G1");
      teachingSteps.push(sceneStep(scene, next));
      if (scene.id === "HOOK") {
        teachingSteps.push({
          id: "HOOK-CHOICE",
          stage: "teaching",
          purpose: "Record the learner's unscored part-size prediction.",
          scene: { display_title: "Can the counts be added yet?", model: { context: "fra18", sceneId: "HOOK-CHOICE", visual: scene.visual }, initial_state: scene.accessibleDescription },
          narration: { script: [], sync_cues: [] },
          learner_interaction: { question_ref: prefix("HOOK") },
          next_step: "T1"
        });
      }
    });
    teachingSteps.push({
      id: "FINAL-INTRO",
      stage: "teaching",
      purpose: "Open the uninterrupted five-item final check.",
      scene: { display_title: "Final check", model: { context: "fra18", sceneId: "FINAL-INTRO", visual: { context: "Five unanswered final cards." } }, initial_state: "Five final-check positions are shown. No answers or working are visible." },
      narration: { script: textsFor(approved.finalIntroUtteranceIds), sync_cues: [] },
      learner_interaction: { question_ref: null },
      next_step: "M1"
    });

    spec.lesson = {
      teaching_steps: teachingSteps,
      transfer_steps: {
        G1: { stage: "guided", question_ref: prefix("G1"), support_level: "high", pre_question_script: textsFor(source.questions.find((question) => question.id === "G1").ryanBeforeSubmitUtteranceIds), correct_next: "G2" },
        G2: { stage: "guided", question_ref: prefix("G2"), support_level: "high", pre_question_script: textsFor(source.questions.find((question) => question.id === "G2").ryanBeforeSubmitUtteranceIds), correct_next: "F1" },
        F1: { stage: "faded", question_ref: prefix("F1"), support_level: "reduced", pre_question_script: textsFor(source.questions.find((question) => question.id === "F1").ryanBeforeSubmitUtteranceIds), correct_next: "F2" },
        F2: { stage: "faded", question_ref: prefix("F2"), support_level: "reduced", pre_question_script: textsFor(source.questions.find((question) => question.id === "F2").ryanBeforeSubmitUtteranceIds), correct_next: "I1" },
        I1: { stage: "independent", question_ref: prefix("I1"), support_level: "none", pre_question_script: textsFor(source.questions.find((question) => question.id === "I1").ryanBeforeSubmitUtteranceIds), correct_next: "I2" },
        I2: { stage: "independent", question_ref: prefix("I2"), support_level: "none", pre_question_script: textsFor(source.questions.find((question) => question.id === "I2").ryanBeforeSubmitUtteranceIds), correct_next: "FINAL-INTRO" }
      },
      practice: { question_order: [], intro_script: "" },
      exit: {
        intro_script: "",
        primary_question_refs: approved.adaptiveRouting.primaryFinalSequence.map(prefix),
        confirmation_question_refs: [],
        mastery_policy: { profile: "fra18_five_item", secureThreshold: 4, nearSecureThreshold: 3 },
        use_question_before_submit_narration: false
      },
      adaptive_pathway: {
        no_hint_gate_after: { nodeId: "I2", returnId: "FINAL-INTRO", introUtteranceIds: [] },
        no_hint_confirmation_by_question: noHintConfirmationByQuestion,
        repair_by_error_family: repairByFamily,
        feedback_by_error_family: Object.fromEntries(source.misconceptions.map((item) => [item.code, item.immediateUiFeedback]))
      }
    };

    spec.question_bank = [...converted.values(), ...source.repairs.map(convertRepair)];
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Another pass is needed", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra18_context", equal_whole_geometry: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra18_context", "fraction_input", "fra18_fields", "fra18_select_then_fields", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: false,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "fra18-owner-approved-v1",
      engine_profile: "fra18",
      runtime_applied: true,
      owner_review_status: approved.status,
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, value]) => [value.text, id])),
      source_of_truth: approved.sourceOfTruth,
      route_contract: approved.adaptiveRouting,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Less support", independent: "Your turn", repair: "Quick repair", exit: "Final check", completion: "Lesson complete" },
      capabilities: { exact_fraction_equivalence: true, one_conversion_fields: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, five_item_final: true, targeted_repairs: true, deterministic_recovery_only: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra18Canonical = {
    CONTENT_VERSION,
    apply,
    classifyErrorFamily,
    evaluateFinalEvidence,
    evaluateResponse,
    getRequiredHintConfirmation,
    isStructuralEvidence,
    noHintConfirmationByQuestion,
    repairByFamily,
    routeFinal,
    runtimeCopy,
    selectDenomRepairCheck,
    selectDiscriminator,
    selectMiniCheck,
    selectOutcomeUtteranceIds,
    shouldSkipF1,
    textFor,
    validateRuntimeContract,
    visibleFeedback
  };
})();
