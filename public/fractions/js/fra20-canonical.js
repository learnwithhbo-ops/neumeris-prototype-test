(function () {
  "use strict";

  const LESSON_ID = "FRA-20";
  const CONTENT_VERSION = "fra20-handoff-v1-runtime-1";
  const source = window.RevilyFra20V1;
  const approved = source?.approved;
  const runtimeCopy = source?.runtimeCopy || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = {
    DEN_CHANGE: prefix("R-DEN"),
    ADD: prefix("R-ADD"),
    ORDER: prefix("R-ORDER"),
    RENAME: prefix("R-RENAME"),
    VIS: prefix("R-VIS"),
    ARITH: prefix("R-ARITH"),
    UNKNOWN: prefix("R-UNKNOWN"),
    COPY: prefix("R-UNKNOWN")
  };
  const freshChecksByFamily = {
    DEN_CHANGE: [prefix("R-DEN-C")],
    ADD: [prefix("R-ADD-C")],
    ORDER: [prefix("R-ORD-C")],
    RENAME: [prefix("R-REN-C")],
    VIS: [prefix("R-VIS-C")],
    ARITH: [prefix("R-ARITH-C")],
    UNKNOWN: [prefix("R-UNKNOWN-C")],
    COPY: [prefix("R-UNKNOWN-C")]
  };

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA20 runtime utterance: ${id}`);
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

  function optionLabel(question, optionId) {
    return question.options?.find((option) => option.id === optionId)?.text || optionId;
  }

  function optionId(question, response) {
    return question.options?.find((option) => option.text === response)?.id || String(response || "");
  }

  function cuesForQuestion(question) {
    const ids = new Set([
      ...(question.preUtteranceIds || []),
      ...(question.feedback?.correct?.runtimeUtteranceIds || []),
      ...(question.feedback?.incorrectDefault?.runtimeUtteranceIds || []),
      ...Object.values(question.feedback?.incorrectByErrorFamily || {}).flatMap((branch) => branch.runtimeUtteranceIds || []),
      ...Object.values(question.feedback?.incorrectByOptionId || {}).flatMap((branch) => branch.runtimeUtteranceIds || [])
    ]);
    if (question.id === "HOOK") ids.add("H-U04");
    return approved.timelineCues.filter((cue) => ids.has(cue.utteranceId)).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      target: cue.targetIds,
      accessibleLabel: question.accessibleDescriptionBeforeSubmit
    }));
  }

  function responseFor(question) {
    const lockedDenominator = question.policy?.answerFormPolicy === "locked_denominator";
    if (question.responseKind === "section_tap") {
      return {
        type: "fra20_cell_tap_integer",
        fixedDenominator: question.math.denominator,
        totalCells: question.visual.denominator,
        selectedCells: question.math.differenceNumerator,
        input_label: "Remaining selected sections",
        keyboard_submit: true
      };
    }
    if (question.responseKind === "fraction_input" && lockedDenominator) {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: "numerator",
        fixedDenominator: question.math.denominator,
        input_label: "Remaining numerator",
        keyboard_submit: true
      };
    }
    if (question.responseKind === "fraction_input") {
      return {
        type: "fraction",
        accept_equivalent_notation: question.policy?.answerFormPolicy === "equivalent_value_allowed",
        partLabel: "Numerator",
        wholeLabel: "Denominator",
        keyboard_submit: true
      };
    }
    if (question.responseKind === "integer_input") {
      return { type: "integer", input_label: "Missing numerator", keyboard_submit: true };
    }
    if (["multiple_choice", "model_choice", "unscored_choice"].includes(question.responseKind)) {
      const options = (question.options || []).map((option) => option.text);
      const optionModels = question.responseKind === "model_choice"
        ? (question.options || []).map((option) => {
            const model = question.visual?.optionModels?.find((candidate) => candidate.id === option.id);
            return model && model.denominator > 0
              ? { totalParts: model.denominator, selectedParts: model.selected, shape: "strip" }
              : null;
          })
        : [];
      return {
        type: "single_choice",
        options,
        optionIds: Object.fromEntries((question.options || []).map((option) => [option.text, option.id])),
        optionModels,
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA20 response kind ${question.responseKind}`);
  }

  function answerFor(question) {
    const expected = question.expectedAnswer;
    if (expected.kind === "option") return optionLabel(question, expected.optionId);
    if (expected.kind === "unscored_choice") return optionLabel(question, expected.preferredOptionId);
    if (expected.kind === "integer") return String(expected.value);
    if (question.policy?.answerFormPolicy === "locked_denominator" || question.responseKind === "section_tap") return String(expected.value.numerator);
    return { n: String(expected.value.numerator), d: String(expected.value.denominator) };
  }

  function defaultErrorFamily(question) {
    if (question.family === "VIS") return "VIS";
    if (question.family === "ORDER") return "ORDER";
    if (question.family === "DENOMINATOR_REASON") return "DEN_CHANGE";
    return "ARITH";
  }

  function runtimeOutcome(question) {
    return {
      correctUtteranceIds: [...(question.feedback?.correct?.runtimeUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(question.feedback?.incorrectDefault?.runtimeUtteranceIds || [])],
      errorSpecificUtteranceIdsByFamily: Object.fromEntries(Object.entries(question.feedback?.incorrectByErrorFamily || {}).map(([family, branch]) => [family, [...(branch.runtimeUtteranceIds || [])]])),
      optionSpecificUtteranceIdsById: Object.fromEntries(Object.entries(question.feedback?.incorrectByOptionId || {}).map(([id, branch]) => [id, [...(branch.runtimeUtteranceIds || [])]]))
    };
  }

  function workedSteps(question) {
    return (question.workedCheckKeys || []).map((key) => approved.uiCopy.workedChecks[key]).filter(Boolean);
  }

  function convertQuestion(question) {
    const outcome = runtimeOutcome(question);
    const steps = workedSteps(question);
    const prompt = approved.uiCopy.prompts[question.promptKey] || question.promptKey;
    const hint = question.hintKey ? approved.uiCopy.hints[question.hintKey] || "" : "";
    const result = question.expectedAnswer?.kind === "fraction" ? question.expectedAnswer.value : { numerator: question.math?.differenceNumerator || 0, denominator: question.math?.denominator || 1 };
    const runtimeUtteranceIds = [...new Set([
      ...(question.preUtteranceIds || []),
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectDefaultUtteranceIds,
      ...Object.values(outcome.errorSpecificUtteranceIdsByFamily).flat(),
      ...Object.values(outcome.optionSpecificUtteranceIdsById).flat()
    ])];
    return {
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: question.assessmentIntent,
      assessmentIntent: question.assessmentIntent,
      evidenceFamily: question.family,
      prompt,
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy === "optional" ? "optional" : "none",
        solutionPolicy: question.policy?.solutionPolicy === "after_answer_lock" ? "after_locked_submit" : "after_response",
        scored: question.policy?.scored === true,
        engagementOnly: question.policy?.scored !== true,
        answerLocksOnSubmit: question.policy?.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.requiresFreshNoHintConfirmationIfHintUsed === true,
        maxAttemptsBeforeRepair: 2,
        countsAsIndependentEvidence: question.policy?.countsAsIndependentEvidence === true,
        answerFormPolicy: question.policy?.answerFormPolicy
      },
      attempt_policy: { submit_label: question.responseKind === "unscored_choice" ? "Show what happened" : "Check answer" },
      model: {
        context: "fra20",
        questionId: question.id,
        totalParts: Math.max(1, Number(question.visual?.denominator || result.denominator || 1)),
        selectedParts: Math.max(0, Number(question.visual?.resultSelected ?? result.numerator ?? 0)),
        visual: question.visual,
        math: question.math,
        accessibleDescription: question.accessibleDescriptionBeforeSubmit,
        workedSteps: steps
      },
      visual: { primitive: "fra20_context", action: "focus", description: prompt, syncCues: cuesForQuestion(question) },
      scripts: {
        before_submit: question.stage === "repair" ? [] : textsFor(question.preUtteranceIds || []),
        hint,
        on_correct_reaction: textsFor(outcome.correctUtteranceIds)[0] || "",
        on_correct_math: "",
        on_incorrect_reaction: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_1: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_2: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        worked_explanation: steps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: steps,
        ...(question.id === "HOOK" ? {
          engagement_response_by_value: {
            [optionLabel(question, "NO")]: [textFor("H-F-C01"), textFor("H-U04")],
            [optionLabel(question, "YES")]: [textFor("H-F-W01"), textFor("H-U04")]
          },
          engagement_visible_by_id: {
            NO: approved.uiCopy.visibleFeedback.HOOK_CORRECT,
            YES: approved.uiCopy.visibleFeedback.HOOK_INCORRECT
          }
        } : {})
      },
      mathematical_support: hint ? { hint_1: hint } : {},
      runtimeOutcome: outcome,
      runtimeUtteranceIds,
      primaryErrorFamily: defaultErrorFamily(question),
      errorFamily: defaultErrorFamily(question),
      errorClassification: { fallback: defaultErrorFamily(question), requiresRepeatedEvidence: true },
      recovery_item_ref: repairByFamily[defaultErrorFamily(question)] || repairByFamily.UNKNOWN,
      canonicalQuestion: question
    };
  }

  function convertRepair(id, repair) {
    const visual = approved.questions.find((question) => question.id === repair.supportedQuestionId)?.visual || { kind: "symbolic", denominator: 12 };
    return {
      id: prefix(id),
      canonicalQuestionId: id,
      stage: "repair",
      target: `Repair ${repair.errorFamily}`,
      assessmentIntent: `repair_${repair.errorFamily.toLowerCase()}`,
      evidenceFamily: repair.errorFamily,
      prompt: "Review the same-denominator structure.",
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: { context: "fra20", questionId: id, totalParts: Math.max(1, Number(visual.denominator) || 1), selectedParts: Number(visual.resultSelected || 0), visual, accessibleDescription: `Targeted ${repair.errorFamily.toLowerCase()} repair.`, workedSteps: [] },
      visual: { primitive: "fra20_context", action: "repair", description: repair.successRequirement, syncCues: approved.timelineCues.filter((cue) => (repair.runtimeUtteranceIds || []).includes(cue.utteranceId)).map((cue) => ({ id: cue.id, utteranceId: cue.utteranceId, cue: cue.anchorText, anchorText: cue.anchorText, action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"), target: cue.targetIds })) },
      scripts: { reteach: textsFor(repair.runtimeUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.runtimeUtteranceIds],
      supportedInteractionId: repair.supportedQuestionId ? prefix(repair.supportedQuestionId) : null,
      freshCheckId: prefix(repair.freshCheckQuestionId),
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily }
    };
  }

  function buildQuestions() {
    return [
      ...approved.allQuestions.map(convertQuestion),
      ...Object.entries(approved.repairs).map(([id, repair]) => convertRepair(id, repair))
    ];
  }

  function toCanonicalResponse(question, response) {
    const canonical = question.canonicalQuestion;
    if (canonical.responseKind === "unscored_choice") return { kind: "unscored_choice", optionId: optionId(canonical, response) };
    if (["multiple_choice", "model_choice"].includes(canonical.responseKind)) return { kind: "option", optionId: optionId(canonical, response) };
    if (canonical.responseKind === "integer_input") return { kind: "integer", value: Number(response) };
    if (canonical.responseKind === "section_tap") return { kind: "section_tap", selectedCount: Number(response?.numerator), denominator: canonical.math.denominator };
    if (question.response.type === "integer") return { kind: "fraction", numerator: Number(response), denominator: canonical.math.denominator };
    if (canonical.responseKind === "fraction_input") return { kind: "fraction", numerator: Number(response?.n), denominator: Number(response?.d) };
    return { kind: "blank" };
  }

  function fractionsEquivalent(left, right) {
    return Boolean(left && right && left.denominator > 0 && right.denominator > 0 && left.numerator * right.denominator === right.numerator * left.denominator);
  }

  function evaluateResponse(question, response) {
    const canonical = question.canonicalQuestion;
    const converted = toCanonicalResponse(question, response);
    const base = { questionId: canonical.id, scored: canonical.policy.scored, correct: false, mathematicallyCorrect: false, formCorrect: false, errorFamily: "UNKNOWN", signal: "blank_or_malformed" };
    if (canonical.expectedAnswer.kind === "unscored_choice") {
      const correct = converted.kind === "unscored_choice" && converted.optionId === canonical.expectedAnswer.preferredOptionId;
      return Object.assign(base, { correct, mathematicallyCorrect: correct, formCorrect: true, errorFamily: correct ? null : canonical.options.find((option) => option.id === converted.optionId)?.errorFamilyIfChosen || "UNKNOWN", signal: correct ? "unscored_preferred_choice" : "unscored_other_choice", selectedOptionId: converted.optionId });
    }
    if (canonical.expectedAnswer.kind === "option") {
      const correct = converted.kind === "option" && converted.optionId === canonical.expectedAnswer.optionId;
      return Object.assign(base, { correct, mathematicallyCorrect: correct, formCorrect: correct, errorFamily: correct ? null : canonical.options.find((option) => option.id === converted.optionId)?.errorFamilyIfChosen || "UNKNOWN", signal: correct ? "correct" : "incorrect_option", selectedOptionId: converted.optionId });
    }
    if (canonical.expectedAnswer.kind === "integer") {
      const value = converted.kind === "integer" ? converted.value : Number.NaN;
      const correct = Number.isInteger(value) && value === canonical.expectedAnswer.value;
      let family = null;
      if (!correct) family = [canonical.math?.removeNumerator, canonical.math?.differenceNumerator].includes(value) ? "COPY" : "ARITH";
      return Object.assign(base, { correct, mathematicallyCorrect: correct, formCorrect: correct, errorFamily: family, signal: correct ? "correct" : family === "COPY" ? "copied_source_amount" : "arithmetic_or_visual_slip", submittedInteger: value });
    }
    const submitted = converted.kind === "fraction"
      ? { numerator: converted.numerator, denominator: converted.denominator }
      : converted.kind === "section_tap"
        ? { numerator: converted.selectedCount, denominator: converted.denominator }
        : null;
    const expected = canonical.expectedAnswer.value;
    if (!submitted || !Number.isInteger(submitted.numerator) || !Number.isInteger(submitted.denominator)) return base;
    if (submitted.denominator <= 0) return Object.assign(base, { errorFamily: "DEN_CHANGE", signal: "denominator_changed", submittedFraction: submitted });
    const exact = submitted.numerator === expected.numerator && submitted.denominator === expected.denominator;
    const equivalent = fractionsEquivalent(submitted, expected);
    const originalForm = submitted.denominator === expected.denominator;
    if (equivalent) {
      if (exact || originalForm) return Object.assign(base, { correct: true, mathematicallyCorrect: true, formCorrect: true, errorFamily: null, signal: "correct", submittedFraction: submitted });
      if (canonical.policy.answerFormPolicy === "equivalent_value_allowed") return Object.assign(base, { correct: true, mathematicallyCorrect: true, formCorrect: false, errorFamily: "RENAME", signal: "correct_equivalent_value", submittedFraction: submitted });
      return Object.assign(base, { mathematicallyCorrect: true, formCorrect: false, errorFamily: "RENAME", signal: "value_correct_wrong_requested_form", submittedFraction: submitted });
    }
    const math = canonical.math;
    if (submitted.denominator === math.denominator && submitted.numerator === math.startNumerator + math.removeNumerator) return Object.assign(base, { formCorrect: true, errorFamily: "ADD", signal: "addition_instead_of_subtraction", submittedFraction: submitted });
    if (submitted.denominator === math.denominator && [math.startNumerator, math.removeNumerator].includes(submitted.numerator)) return Object.assign(base, { formCorrect: true, errorFamily: "COPY", signal: "copied_source_amount", submittedFraction: submitted });
    if (submitted.denominator !== math.denominator) return Object.assign(base, { errorFamily: "DEN_CHANGE", signal: "denominator_changed", submittedFraction: submitted });
    const errorFamily = canonical.family === "VIS" || converted.kind === "section_tap" ? "VIS" : "ARITH";
    return Object.assign(base, { formCorrect: true, errorFamily, signal: "arithmetic_or_visual_slip", submittedFraction: submitted });
  }

  function outcomeBranch(question, evaluation) {
    const canonical = question.canonicalQuestion;
    if (evaluation.correct) return canonical.feedback.correct;
    if (evaluation.selectedOptionId && canonical.feedback.incorrectByOptionId?.[evaluation.selectedOptionId]) return canonical.feedback.incorrectByOptionId[evaluation.selectedOptionId];
    if (evaluation.errorFamily && canonical.feedback.incorrectByErrorFamily?.[evaluation.errorFamily]) return canonical.feedback.incorrectByErrorFamily[evaluation.errorFamily];
    return canonical.feedback.incorrectDefault;
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const evaluation = evaluateResponse(question, response);
    if (Boolean(correct) !== evaluation.correct) evaluation.correct = Boolean(correct);
    return [...(outcomeBranch(question, evaluation)?.runtimeUtteranceIds || [])];
  }

  function visibleFeedback(question, response, correct) {
    const evaluation = evaluateResponse(question, response);
    if (Boolean(correct) !== evaluation.correct) evaluation.correct = Boolean(correct);
    const key = outcomeBranch(question, evaluation)?.visibleFeedbackKey || (correct ? "FINAL_CORRECT" : "DEFAULT_INCORRECT");
    return approved.uiCopy.visibleFeedback[key] || approved.uiCopy.visibleFeedback.DEFAULT_INCORRECT;
  }

  function classifyErrorFamily(question, response) {
    return evaluateResponse(question, response).errorFamily || "UNKNOWN";
  }

  function requiresRepeatedEvidence(question, response) {
    return !["ARITH", "UNKNOWN", "RENAME"].includes(classifyErrorFamily(question, response));
  }

  function shouldSkipF1(evidence) {
    return evidence?.g1?.firstAttemptCorrect === true
      && evidence?.g2?.firstAttemptCorrect === true
      && !evidence.g1.hintOpenedBeforeSubmit
      && !evidence.g2.hintOpenedBeforeSubmit
      && !evidence.g1.supportEscalated
      && !evidence.g2.supportEscalated
      && !evidence.unresolvedCentralMisconception;
  }

  function evaluateFinalEvidence(records, repeatedCentralMisconception) {
    const correct = (records || []).filter((record) => record.firstAttemptCorrect && record.countsAsIndependentEvidence);
    const directEvidenceSecure = correct.some((record) => unprefix(record.questionId) === "M1" || record.family === "DIRECT");
    const applicationOrReasoningEvidenceSecure = correct.some((record) => ["CONTEXT", "VIS", "MISSING", "ERROR_REASON", "DENOMINATOR_REASON", "ORDER"].includes(record.family));
    const distinctFamiliesCorrect = new Set(correct.map((record) => record.family).filter(Boolean)).size;
    const correctCount = correct.length;
    const breadthQualifies = distinctFamiliesCorrect >= 2 && applicationOrReasoningEvidenceSecure;
    const masterySatisfied = correctCount >= 3 && directEvidenceSecure && breadthQualifies && !repeatedCentralMisconception;
    return { correctCount, directEvidenceSecure, applicationOrReasoningEvidenceSecure, distinctFamiliesCorrect, repeatedCentralMisconception: Boolean(repeatedCentralMisconception), breadthQualifies, masterySatisfied };
  }

  function routeFinal(records, repeatedCentralMisconception) {
    const value = evaluateFinalEvidence(records, repeatedCentralMisconception);
    if (value.masterySatisfied) return "finish_candidate";
    if (value.correctCount >= 3 && !value.directEvidenceSecure && value.breadthQualifies && !value.repeatedCentralMisconception) return "fresh_direct_confirmation";
    if (value.correctCount <= 1) return "targeted_repair_then_fresh_four_item_final";
    return "targeted_repair_then_two_item_check";
  }

  function createSeededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(values, random) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function selectRecoveryItems(params) {
    const count = Number(params.count);
    const requiredFamilies = [...new Set(params.requiredFamilies || [])];
    if (!Number.isInteger(count) || count <= 0 || requiredFamilies.length > count) throw new Error("Invalid FRA20 recovery selection request.");
    const seenKeys = new Set(params.seenKeys || []);
    const excludedIds = new Set((params.excludedQuestionIds || []).map(unprefix));
    const available = approved.recoveryItems.filter((item) => !seenKeys.has(item.canonicalSeenKey) && !excludedIds.has(item.id));
    const random = createSeededRandom(Number(params.seed) || 0);
    const selected = [];
    const selectedIds = new Set();
    for (const family of shuffled(requiredFamilies, random)) {
      const candidate = shuffled(available.filter((item) => item.family === family && !selectedIds.has(item.id)), random)[0];
      if (!candidate) throw new Error(`No fresh FRA20 recovery item is available for required family ${family}.`);
      selected.push(candidate);
      selectedIds.add(candidate.id);
    }
    for (const item of shuffled(available.filter((item) => !selectedIds.has(item.id)), random)) {
      if (selected.length >= count) break;
      selected.push(item);
      selectedIds.add(item.id);
    }
    if (selected.length !== count) throw new Error(`Only ${selected.length} fresh FRA20 recovery items were available; ${count} were requested.`);
    return selected.map((item) => item.id);
  }

  function selectRecoveryQuestionIds(count, seed, exclusions) {
    const requiredFamilies = count === 2 ? ["DIRECT", "CONTEXT"] : ["DIRECT", "CONTEXT", "ERROR_REASON"];
    return selectRecoveryItems({ seed, count, requiredFamilies, excludedQuestionIds: exclusions }).map(prefix);
  }

  function validateQuestionModel(question) {
    const issues = [];
    const canonical = question?.canonicalQuestion;
    if (!canonical?.math) return issues;
    if (!Number.isInteger(canonical.math.denominator) || canonical.math.denominator <= 1) issues.push("denominator must be greater than one");
    if (!(canonical.math.startNumerator > canonical.math.removeNumerator && canonical.math.startNumerator < canonical.math.denominator)) issues.push("fraction subtraction must remain positive and proper");
    if (canonical.math.differenceNumerator !== canonical.math.startNumerator - canonical.math.removeNumerator) issues.push("difference numerator is inconsistent");
    return issues;
  }

  function validateRuntimeContract() {
    const issues = [];
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      if (!String(entry?.text || "").trim()) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
    });
    approved.timelineCues.forEach((cue) => {
      const entry = runtimeCopy[cue.utteranceId];
      if (!entry) issues.push(`${cue.id} points to missing ${cue.utteranceId}`);
      else if (!entry.text.includes(cue.anchorText)) issues.push(`${cue.id} has an invalid anchor`);
    });
    approved.allQuestions.forEach((question) => {
      const ids = [
        ...(question.preUtteranceIds || []),
        ...(question.feedback?.correct?.runtimeUtteranceIds || []),
        ...(question.feedback?.incorrectDefault?.runtimeUtteranceIds || []),
        ...Object.values(question.feedback?.incorrectByErrorFamily || {}).flatMap((branch) => branch.runtimeUtteranceIds || []),
        ...Object.values(question.feedback?.incorrectByOptionId || {}).flatMap((branch) => branch.runtimeUtteranceIds || [])
      ];
      ids.forEach((id) => { if (!runtimeCopy[id]) issues.push(`${question.id} points to missing ${id}`); });
    });
    return issues;
  }

  function teachingVisual(sceneId) {
    if (sceneId === "HOOK") return { kind: "tank", denominator: 11, startSelected: 9, removedSelected: 4, resultSelected: 5, finalStateHiddenBeforeSubmit: true };
    if (sceneId === "T1") return { kind: "direction", denominator: 11, startSelected: 9, removedSelected: 4, resultSelected: 5 };
    if (sceneId === "T2") return { kind: "tank_countback", denominator: 11, startSelected: 9, removedSelected: 4, resultSelected: 5 };
    if (sceneId === "T3") return { kind: "compact_method", denominator: 12, startSelected: 7, removedSelected: 2, resultSelected: 5 };
    return { kind: "handoff", denominator: 11, startSelected: 9, removedSelected: 4, resultSelected: 5 };
  }

  function sceneCues(sceneId) {
    return approved.timelineCues.filter((cue) => cue.sceneId === sceneId).map((cue) => ({ id: cue.id, utteranceId: cue.utteranceId, cue: cue.anchorText, anchorText: cue.anchorText, action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"), target: cue.targetIds }));
  }

  function teachingStep(scene, nextId) {
    const visual = teachingVisual(scene.sceneId);
    const cues = sceneCues(scene.sceneId);
    return {
      id: scene.sceneId,
      purpose: scene.purpose,
      scene: { display_title: approved.uiCopy.stageLabels.learn, initial_state: scene.purpose, objects: [visual.kind], model: { context: "fra20", sceneId: scene.sceneId, visual } },
      narration: { script: textsFor(scene.utteranceIds), utterance_ids: [...scene.utteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      next_step: nextId
    };
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA20 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA20 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const byRawId = (id) => questionBank.find((question) => question.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.lesson.title, status: approved.lesson.status, version: CONTENT_VERSION, estimated_minutes: { min: 18, max: 24 } });
    spec.learning_objective = approved.lesson.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const hook = approved.teachingSequence.find((scene) => scene.sceneId === "HOOK");
    const hookQuestion = byRawId("HOOK");
    const hookChoice = {
      id: "HOOK-CHOICE",
      purpose: hook.purpose,
      scene: { display_title: approved.uiCopy.stageLabels.learn, initial_state: hookQuestion.prompt, objects: ["tank"], model: { context: "fra20", sceneId: "HOOK-CHOICE", visual: hookQuestion.model.visual } },
      narration: { script: [], utterance_ids: [], sync_cues: [] },
      animation_timeline: [],
      learner_interaction: { question_ref: hookQuestion.id },
      next_step: "T1"
    };
    const nextByScene = { T1: "T2", T2: "T3", T3: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = [teachingStep(hook, "HOOK-CHOICE"), hookChoice, ...approved.teachingSequence.filter((scene) => scene.sceneId !== "HOOK").map((scene) => teachingStep(scene, nextByScene[scene.sceneId]))];

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
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Approved adaptive route only.", between_question_transition: "" };

    const confirmationIds = approved.allQuestions.filter((question) => ["confirmation", "repair", "repair_check", "recovery_final"].includes(question.stage)).map((question) => prefix(question.id));
    spec.lesson.exit = {
      intro_script: [textFor("FINAL-U01")],
      primary_question_refs: ["M1", "M2", "M3", "M4"].map(prefix),
      confirmation_question_refs: confirmationIds,
      mastery_policy: {
        profile: "fra20_four_item",
        secureMinimum: 3,
        totalItems: 4,
        requireM1: true,
        requireBreadth: true,
        repeatedCentralFamilies: ["DEN_CHANGE", "ADD", "ORDER", "RENAME", "VIS"],
        nearSecureRecoveryCount: 2,
        insecureRecoveryCount: 4,
        repairCycleCapPerFamily: 1
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra20_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: Object.fromEntries(Object.entries(approved.lesson.route.hintConfirmationMap).map(([id, confirmation]) => [prefix(id), prefix(confirmation)])),
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: freshChecksByFamily
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: [textFor("COMP-U01")], buttons: ["Back to Fractions", "Start again"] },
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
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra20_context", same_whole: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra20_context", "fraction_input", "integer_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "fra20-owner-approved-v1",
      engine_profile: "fra20",
      runtime_applied: true,
      owner_review_status: "implementation_candidate_ready_for_review",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.lesson.sourceOfTruth,
      phase_labels: { teaching: approved.uiCopy.stageLabels.learn, guided: approved.uiCopy.stageLabels.guided, faded: approved.uiCopy.stageLabels.faded, independent: approved.uiCopy.stageLabels.independent, repair: "Targeted support", exit: approved.uiCopy.stageLabels.final, completion: "Lesson complete" },
      route_contract: approved.lesson.route,
      capabilities: { exact_fraction_form: true, equivalent_value_evidence: true, live_ryan_word_boundaries: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, targeted_repairs: true, supported_repair_interactions: true, fresh_confirmations: true, deterministic_recovery_pool: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra20Canonical = {
    apply,
    buildQuestions,
    classifyErrorFamily,
    evaluateFinalEvidence,
    evaluateResponse,
    freshChecksByFamily,
    repairByFamily,
    requiresRepeatedEvidence,
    routeFinal,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    selectRecoveryItems,
    selectRecoveryQuestionIds,
    shouldSkipF1,
    textFor,
    validateQuestionModel,
    validateRuntimeContract,
    visibleFeedback
  };
})();
