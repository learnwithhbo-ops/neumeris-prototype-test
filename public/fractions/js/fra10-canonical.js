(function () {
  "use strict";

  const LESSON_ID = "FRA-10";
  const source = window.RevilyFra10Approved;
  const approved = source?.FRA10;
  const runtimeCopy = source?.FRA10_RUNTIME_COPY || {};
  const uiCopy = source?.FRA10_LEARNER_UI_COPY || {};
  const CONTENT_VERSION = approved?.contentVersion || "fra10-simplest-form-handoff-v1";
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");
  const uiText = (id) => uiCopy[id]?.text || "";
  const textFor = (id) => {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA10 runtime utterance: ${id}`);
    return entry.text;
  };
  const textsFor = (ids) => (ids || []).map(textFor);

  function fractionString(value) {
    return value ? `${value.numerator}/${value.denominator}` : "";
  }

  function optionRecords(item) {
    if (item.visual?.optionUiIds) {
      return item.visual.optionUiIds.map((uiId) => ({ id: uiId.match(/\.OPTION\.([A-Z])$/)?.[1] || uiId, label: uiText(uiId) }));
    }
    if (item.visual?.fractions) {
      return item.visual.fractions.map((entry) => {
        const id = entry.id || entry.optionId;
        return { id, label: uiText(entry.uiId || `F2.OPTION.${id}`) || fractionString(entry.fraction) };
      });
    }
    return (item.options || item.supportedInteraction?.options || []).map((entry) => ({
      id: entry.id,
      label: entry.label || fractionString(entry.fraction) || String(entry.id)
    }));
  }

  function responseFor(item) {
    const kind = item.response?.kind || item.responseKind;
    if (kind === "fraction_input") {
      return { type: "fraction", accept_equivalent_notation: false, partLabel: "Numerator", wholeLabel: "Denominator" };
    }
    if (kind === "single_choice") {
      const options = optionRecords(item);
      return { type: "single_choice", options: options.map((option) => option.label), optionIds: options.map((option) => option.id), keyboard_submit: true };
    }
    if (kind === "factor_route_builder") {
      return { type: "factor_route_builder", sourceFraction: item.sourceFraction, finishedUi: uiText("COMMON.FINISHED"), divideAgainUi: uiText("COMMON.DIVIDE_AGAIN") };
    }
    if (kind === "factor_choice_then_fraction") {
      const interaction = item.supportedInteraction || item;
      const expectedFactor = interaction.correctFactor || interaction.expectedFactor || item.correctFactor;
      const options = [
        ...(item.factorOptions || []),
        ...(item.visual?.factorCards?.map((card) => card.factor) || []),
        ...(interaction.rejectBeforeFormingFraction || []),
        ...(expectedFactor ? [expectedFactor] : [])
      ];
      return {
        type: "factor_choice_then_fraction",
        factorOptions: [...new Set(options.map(Number))],
        decisionRequired: Boolean(item.supportedInteraction?.expectedChoice),
        decisionOptions: [uiText("COMMON.FINISHED"), uiText("COMMON.DIVIDE_AGAIN")]
      };
    }
    if (kind === "single_choice_then_fraction") {
      const options = optionRecords(item);
      return { type: "choice_then_fraction", options: options.map((option) => option.label), optionIds: options.map((option) => option.id) };
    }
    if (kind === "sort_then_factor") {
      const items = (item.supportedInteraction?.items || item.items || []).map((entry, index) => ({
        ...entry,
        id: entry.id || `sort-${index + 1}`,
        expectedFactor: entry.expectedSelectedFactor || entry.sharedFactor || 1
      }));
      return { type: "sort_then_factor", items };
    }
    if (kind === "whole_number_division_check" || item.supportedInteraction?.kind === "whole_number_division_check") {
      return { type: "arithmetic_check", checks: [{ label: "24 ÷ 6", answer: 4 }, { label: "36 ÷ 6", answer: 6 }] };
    }
    return { type: "fraction", accept_equivalent_notation: false };
  }

  function answerFor(item, response) {
    const kind = response.type;
    if (kind === "single_choice") {
      const correctId = item.answerOptionId || item.correctOptionId || item.supportedInteraction?.correctOptionId;
      const options = optionRecords(item);
      return options.find((option) => option.id === correctId)?.label || correctId;
    }
    if (kind === "factor_route_builder") return fractionString(item.expectedFraction);
    if (kind === "factor_choice_then_fraction") {
      const interaction = item.supportedInteraction || item;
      return {
        decision: interaction.expectedChoice ? uiText("COMMON.DIVIDE_AGAIN") : null,
        factor: String(interaction.expectedFactor || interaction.correctFactor || item.correctFactor || ""),
        n: String(item.expectedFraction?.numerator || interaction.thenRequireFinalFraction?.numerator || item.visual?.acceptedResult?.numerator || ""),
        d: String(item.expectedFraction?.denominator || interaction.thenRequireFinalFraction?.denominator || item.visual?.acceptedResult?.denominator || "")
      };
    }
    if (kind === "choice_then_fraction") {
      const correctId = item.correctOptionId || item.answerOptionId;
      const options = optionRecords(item);
      const expected = item.expectedFraction || item.supportedInteraction?.thenRequireFinalFraction;
      return { choice: options.find((option) => option.id === correctId)?.label || correctId, n: String(expected?.numerator || ""), d: String(expected?.denominator || "") };
    }
    if (kind === "sort_then_factor") return item.supportedInteraction?.items || [];
    if (kind === "arithmetic_check") return response.checks.map((check) => String(check.answer));
    return fractionString(item.expectedFraction);
  }

  function errorUiByFamily(item) {
    const output = {};
    (item.errorSignals || []).forEach((signal) => {
      const text = (signal.uiIds || []).map(uiText).filter(Boolean).join(" ");
      if (text) output[signal.family] = text;
    });
    return output;
  }

  function convertQuestion(item, overrides) {
    const response = responseFor(item);
    const correctIds = item.feedback?.correct?.ryanUtteranceIds || item.feedback?.correctRyanUtteranceIds || [];
    const incorrectIds = item.feedback?.incorrectDefault?.ryanUtteranceIds || item.feedback?.incorrectRyanUtteranceIds || [];
    const workedIds = item.workedCheck?.ryanUtteranceIds || [];
    const prompt = item.promptUiId ? uiText(item.promptUiId) : item.prompt;
    const workedUi = (item.workedCheck?.uiIds || []).map(uiText).filter(Boolean);
    const optionIds = response.optionIds || [];
    const policy = item.policy || {};
    return Object.assign({
      id: prefix(item.id),
      stage: item.stage === "final" || item.stage === "recovery" ? "exit" : item.stage,
      target: item.stage === "final" ? "Final check" : item.stage === "recovery" ? "Fresh recovery" : item.authorOnlyAssessmentIntent || "Simplest form",
      assessmentIntent: item.authorOnlyAssessmentIntent || item.authorOnlyPurpose || `fra10_${item.id}`,
      evidenceFamily: item.evidenceFamily || "procedural",
      prompt,
      model: Object.assign({}, item.visual || {}, {
        context: "fra10_simplest_form",
        kind: item.visual?.kind || (item.shownIntermediateFraction ? "shown_intermediate_plus_fraction_input" : "plain_fraction_input"),
        sourceFraction: item.sourceFraction,
        expectedFraction: item.expectedFraction,
        shownIntermediateFraction: item.shownIntermediateFraction,
        workedUi,
        answerOptionId: item.answerOptionId,
        accessibleDescription: prompt
      }),
      response,
      answer: { value: answerFor(item, response) },
      policy: {
        hintPolicy: policy.hintPolicy || "none",
        solutionPolicy: policy.solutionPolicy || "after_response",
        scored: policy.scored !== false,
        answerLocksOnSubmit: policy.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: policy.requiresFreshNoHintConfirmationIfHintUsed === true,
        countsAsIndependentEvidence: ["independent", "final", "recovery"].includes(item.stage),
        countsAsFreshEvidence: ["confirmation", "recovery"].includes(item.stage),
        formSensitive: true,
        canonicalSignature: item.sourceFraction ? source.rawFractionSignature(item.sourceFraction) : item.id
      },
      attempt_policy: { submit_label: uiText(item.response?.submitUiId) || (item.stage === "final" ? uiText("COMMON.SUBMIT") : uiText("COMMON.CHECK_ANSWER")) || "Check answer" },
      visual: {
        primitive: "fra10_context",
        action: "focus",
        description: prompt,
        syncCues: item.timeline ? sceneCues(item) : []
      },
      scripts: {
        before_submit: textsFor(item.ryanBeforeSubmitUtteranceIds),
        hint: textsFor(item.hint?.ryanUtteranceIds),
        on_correct_reaction: textsFor(correctIds)[0] || "",
        on_correct_math: "",
        on_incorrect_reaction: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_1: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_2: textsFor(incorrectIds)[0] || "",
        worked_explanation: "",
        worked_narration: textsFor(workedIds)
      },
      visibleFeedback: {
        correct: (item.feedback?.correct?.uiIds || item.feedback?.correctUiIds || []).map(uiText).filter(Boolean).join(" "),
        incorrect: (item.feedback?.incorrectDefault?.uiIds || item.feedback?.incorrectUiIds || []).map(uiText).filter(Boolean).join(" "),
        byFamily: errorUiByFamily(item)
      },
      runtimeOutcome: {
        correctUtteranceIds: [...correctIds],
        incorrectDefaultUtteranceIds: [...incorrectIds],
        workedCheckUtteranceIds: [...workedIds]
      },
      mathematical_support: item.hint?.ryanUtteranceIds?.length ? { hint_1: textsFor(item.hint.ryanUtteranceIds).join(" ") } : {},
      optionIds,
      canonicalQuestion: item,
      errorClassification: { kind: "fra10", fallback: "unknown" },
      primaryErrorFamily: item.errorSignals?.[0]?.family || "unknown"
    }, overrides || {});
  }

  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      accessibleLabel: scene.authorOnlyPurpose || "Simplest-form visual"
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    const titleById = {
      HOOK: "Same value. One is finished.",
      T1: "No shared factor is left",
      T2: "Small numbers are not the test",
      T3: "Use the HCF for one efficient step",
      T4: "Different valid routes, one final form",
      T5: "Improper fractions use the same rule",
      HANDOFF: "Choose the factor and decide when to stop"
    };
    return {
      id: scene.id,
      purpose: titleById[scene.id],
      scene: { display_title: titleById[scene.id], initial_state: titleById[scene.id], objects: [scene.visual.kind], model: Object.assign({ sceneId: scene.id }, scene.visual) },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 600 })),
      next_step: nextId
    };
  }

  function buildHookQuestion() {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const options = hook.interaction.options.map((option) => ({ id: option.id, label: uiText(option.uiId) }));
    return {
      id: prefix("HOOK-CHOICE"), stage: "opening", target: "Opening idea", prompt: uiText(hook.interaction.promptUiId),
      assessmentIntent: "engage_with_equivalent_but_unfinished_fraction_forms",
      model: Object.assign({ context: "fra10_simplest_form", kind: hook.visual.kind, sceneId: "HOOK-CHOICE", accessibleDescription: "Three equivalent fractions are shown. Choose which response is fully simplified." }, hook.visual),
      response: { type: "single_choice", options: options.map((option) => option.label), optionIds: options.map((option) => option.id), keyboard_submit: true },
      answer: { value: options.find((option) => option.id === "B").label },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: uiText("COMMON.CHECK_ANSWER") },
      visual: { primitive: "fra10_context", action: "focus", description: uiText(hook.interaction.promptUiId), syncCues: sceneCues(hook) },
      scripts: {
        engagement_response_by_value: Object.fromEntries(options.map((option) => [option.label, textsFor(source.getHookResponseSequence(option.id))])),
        engagement_visible_by_value: Object.fromEntries(options.map((option) => [option.label, uiText(hook.interaction.feedbackByOption[option.id].statusUiId)])),
        engagement_label: "Your choice"
      },
      optionIds: options.map((option) => option.id), canonicalQuestion: { id: "HOOK-CHOICE", answerOptionId: "B" },
      errorClassification: { kind: "fra10", fallback: "unknown" }, primaryErrorFamily: "unknown"
    };
  }

  function convertRepair(repair) {
    const sourceFraction = repair.supportedInteraction.sourceFraction
      || repair.visual?.sourceFraction
      || repair.visual?.states?.[1]?.fraction
      || repair.visual?.invalid?.sourceFraction;
    const expectedFraction = repair.supportedInteraction.thenRequireFinalFraction
      || repair.visual?.acceptedResult
      || repair.visual?.states?.[repair.visual?.states?.length - 1]?.fraction
      || repair.visual?.valid?.resultFraction;
    const item = Object.assign({ id: repair.id, stage: "repair", policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: false } }, repair, {
      response: { kind: repair.supportedInteraction.responseKind || repair.supportedInteraction.kind },
      sourceFraction,
      expectedFraction,
      prompt: uiText(repair.supportedInteraction.promptUiId) || "Complete the supported repair."
    });
    const converted = convertQuestion(item, {
      stage: "repair",
      target: "Targeted repair",
      primaryErrorFamily: repair.family,
      errorClassification: { kind: "fra10", fallback: repair.family },
      repairFamily: repair.family,
      policy: { hintPolicy: "guided", solutionPolicy: "after_response", scored: false, answerLocksOnSubmit: false, repairInteraction: true, formSensitive: true },
      scripts: {
        reteach: textsFor(repair.ryanUtteranceIds),
        before_submit: [], hint: [], on_correct_reaction: "", on_correct_math: "", on_incorrect_reaction: "", on_incorrect_attempt_1: "", on_incorrect_attempt_2: "", worked_explanation: "", worked_narration: []
      },
      visibleFeedback: { correct: uiText("RECOVERY.CORRECT"), incorrect: uiText("RECOVERY.INCORRECT"), byFamily: { [repair.family]: uiText(`FB.${repair.family.toUpperCase()}`) } }
    });
    converted.model = Object.assign({}, repair.visual || {}, converted.model, { kind: repair.visual?.kind || "arithmetic_check", repairId: repair.id, supportedInteraction: repair.supportedInteraction });
    converted.visual.syncCues = sceneCues(repair);
    return converted;
  }

  function freshItemsForRepair(repair) {
    return repair.freshCheckCandidates ? [...repair.freshCheckCandidates] : repair.freshCheck ? [repair.freshCheck] : [];
  }

  function convertFresh(item, family) {
    const enriched = Object.assign({
      stage: "confirmation",
      response: { kind: item.responseKind || "fraction_input" },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: true, answerLocksOnSubmit: true },
      feedback: { correct: { uiIds: ["RECOVERY.CORRECT"], ryanUtteranceIds: [] }, incorrectDefault: { uiIds: ["RECOVERY.INCORRECT"], ryanUtteranceIds: [] } },
      evidenceFamily: family
    }, item);
    const converted = convertQuestion(enriched, { primaryErrorFamily: family, errorClassification: { kind: "fra10", fallback: family } });
    converted.model = Object.assign({}, converted.model, { kind: item.shownIntermediateFraction ? "shown_intermediate_plus_fraction_input" : item.visual?.kind || "plain_fraction_input" });
    return converted;
  }

  function convertRecovery(item) {
    const enriched = Object.assign({}, item, {
      response: { kind: item.responseKind },
      feedback: { correct: { uiIds: item.feedback.correctUiIds, ryanUtteranceIds: item.feedback.correctRyanUtteranceIds }, incorrectDefault: { uiIds: item.feedback.incorrectUiIds, ryanUtteranceIds: item.feedback.incorrectRyanUtteranceIds } },
      workedCheck: { uiIds: [], ryanUtteranceIds: [], requiresAnswerLocked: true }
    });
    const converted = convertQuestion(enriched, { primaryErrorFamily: item.familyTags?.[0] || "unknown", errorClassification: { kind: "fra10", fallback: item.familyTags?.[0] || "unknown" } });
    converted.model = Object.assign({}, converted.model, { kind: item.visual?.kind || (item.shownIntermediateFraction ? "shown_intermediate_plus_fraction_input" : "plain_fraction_input"), workedUi: item.workedSteps || [] });
    return converted;
  }

  function buildQuestions() {
    const repairs = approved.repairs.map(convertRepair);
    const fresh = approved.repairs.flatMap((repair) => freshItemsForRepair(repair).map((item) => convertFresh(item, repair.family)));
    return [buildHookQuestion(), ...approved.questions.map((item) => convertQuestion(item)), ...repairs, ...fresh, ...approved.recoveryBank.map(convertRecovery)];
  }

  function optionId(question, response) {
    const index = (question.response.options || []).findIndex((option) => String(option) === String(response));
    return question.response.optionIds?.[index] || response;
  }

  function responseFraction(response) {
    if (!response || typeof response !== "object" || !("n" in response) || !("d" in response)) return null;
    return { numerator: Number(response.n), denominator: Number(response.d) };
  }

  function evaluateResponse(question, response) {
    const item = question?.canonicalQuestion || {};
    const type = question?.response?.type;
    if (type === "single_choice") {
      const selected = optionId(question, response);
      const correctId = item.answerOptionId || item.correctOptionId || item.supportedInteraction?.correctOptionId;
      const signal = (item.errorSignals || []).find((entry) => entry.detectedBy === `selected ${selected}`);
      return { correct: selected === correctId, errorFamily: signal?.family || (selected === correctId ? null : question.primaryErrorFamily || "unknown"), selectedOptionId: selected };
    }
    if (type === "factor_route_builder") {
      const current = response?.current ? { numerator: Number(response.current.n), denominator: Number(response.current.d) } : null;
      if (!response?.finished || !current) return { correct: false, errorFamily: "stop_early" };
      const result = source.evaluateFractionResponse({ source: item.sourceFraction, response: current });
      return { correct: result.correct, errorFamily: result.family, factorHistory: response.history?.map((step) => Number(step.factor)) || [] };
    }
    if (type === "factor_choice_then_fraction") {
      const expectedFactor = Number(item.supportedInteraction?.expectedFactor || item.supportedInteraction?.correctFactor || item.correctFactor);
      const expectedDecision = item.supportedInteraction?.expectedChoice ? uiText("COMMON.DIVIDE_AGAIN") : null;
      const submitted = responseFraction(response);
      const sourceFraction = item.sourceFraction || item.supportedInteraction?.sourceFraction || item.visual?.sourceFraction || item.freshCheck?.sourceFraction;
      const factorCorrect = Number(response?.factor) === expectedFactor;
      if (!factorCorrect) return { correct: false, errorFamily: "non_common", selectedFactor: Number(response?.factor) };
      if (expectedDecision && response?.decision !== expectedDecision) return { correct: false, errorFamily: "stop_early" };
      if (!submitted || !sourceFraction) return { correct: false, errorFamily: question.primaryErrorFamily || "unknown" };
      const result = source.evaluateFractionResponse({ source: sourceFraction, response: submitted });
      return { correct: result.correct, errorFamily: result.family, selectedFactor: expectedFactor };
    }
    if (type === "choice_then_fraction") {
      const selected = optionId({ response: { options: question.response.options, optionIds: question.response.optionIds } }, response?.choice);
      const expectedId = item.answerOptionId || item.correctOptionId || item.supportedInteraction?.correctOptionId;
      if (selected !== expectedId) return { correct: false, errorFamily: "value_change", selectedOptionId: selected };
      const submitted = responseFraction(response);
      const sourceFraction = item.sourceFraction || item.supportedInteraction?.sourceFraction;
      if (!submitted || !sourceFraction) return { correct: false, errorFamily: "unknown" };
      const result = source.evaluateFractionResponse({ source: sourceFraction, response: submitted });
      return { correct: result.correct, errorFamily: result.family, selectedOptionId: selected };
    }
    if (type === "sort_then_factor") {
      const items = question.response.items || [];
      const correct = items.every((entry) => response?.sort?.[entry.id] === entry.correctBucket && Number(response?.factors?.[entry.id]) === Number(entry.expectedFactor));
      return { correct, errorFamily: correct ? null : "smaller_numbers" };
    }
    if (type === "arithmetic_check") {
      const correct = question.response.checks.every((check, index) => Number(response?.values?.[index]) === Number(check.answer));
      return { correct, errorFamily: correct ? null : "arithmetic_slip" };
    }
    const submitted = responseFraction(response);
    if (!submitted || !item.sourceFraction) return { correct: false, errorFamily: "unknown" };
    const changedOnlyOneSide = (submitted.numerator === item.sourceFraction.numerator) !== (submitted.denominator === item.sourceFraction.denominator);
    const result = source.evaluateFractionResponse({ source: item.sourceFraction, response: submitted, methodEvidence: { changedOnlyOneSide } });
    return { correct: result.correct, errorFamily: result.family };
  }

  function outcomeUtteranceIds(question, correct) {
    return correct ? [...(question.runtimeOutcome?.correctUtteranceIds || [])] : [...(question.runtimeOutcome?.incorrectDefaultUtteranceIds || [])];
  }

  function visibleFeedback(question, response, family, correct) {
    if (correct) {
      if (question.visibleFeedback?.correct) return question.visibleFeedback.correct;
      if (["confirmation", "recovery", "repair"].includes(question.stage)) return uiText("RECOVERY.CORRECT");
      return question.scripts?.on_correct_reaction || "";
    }
    const selected = question.response?.type === "single_choice" ? optionId(question, response) : null;
    const selectedSignal = (question.canonicalQuestion?.errorSignals || []).find((signal) => signal.detectedBy === `selected ${selected}`);
    const selectedFeedback = (selectedSignal?.uiIds || []).map(uiText).filter(Boolean).join(" ");
    return selectedFeedback
      || question.visibleFeedback?.byFamily?.[family]
      || question.visibleFeedback?.incorrect
      || question.scripts?.on_incorrect_reaction
      || uiText("FB.NEUTRAL_RECHECK");
  }

  function validateQuestionModel(question) {
    const issues = [];
    const item = question?.canonicalQuestion || {};
    const fractions = [
      item.sourceFraction,
      item.expectedFraction,
      item.shownIntermediateFraction,
      item.visual?.sourceFraction,
      item.visual?.acceptedResult
    ].filter(Boolean);
    fractions.forEach((fraction, index) => {
      if (!Number.isInteger(fraction.numerator) || fraction.numerator <= 0) issues.push(`fraction ${index + 1} numerator must be a positive integer`);
      if (!Number.isInteger(fraction.denominator) || fraction.denominator <= 0) issues.push(`fraction ${index + 1} denominator must be a positive integer`);
    });
    if (question?.response?.type === "fraction" && question.response.accept_equivalent_notation !== false) {
      issues.push("FRA10 fraction inputs must require a fully simplified canonical form");
    }
    if (item.id === "M5" && (item.visual?.kind === "ticket_set" || item.visual?.kind === "question_tile_set")
      && (Number(item.visual.totalTicketCount || item.visual.totalCount) !== 30 || Number(item.visual.selectedTicketCount || item.visual.selectedCount) !== 18)) {
      issues.push("FRA10 final context must show exactly 18 of 30 tickets");
    }
    return issues;
  }

  function shouldRepairNow(question, response, family, attempts, state) {
    const selected = question.response?.type === "single_choice" ? optionId(question, response) : null;
    const explicitReasoningSignal = (question.id === prefix("I2") && selected === "A") || (question.id === prefix("M3") && selected === "B");
    const visibleSystematicMethod = question.id === prefix("I2") && selected === "D";
    const occurrences = Object.values(state.evidence?.candidateErrorFamily || {}).filter((value) => value === family).length;
    return source.shouldTriggerRepair({ family, occurrences: Math.max(attempts, occurrences), explicitReasoningSignal, directCueAlreadyGiven: attempts > 1, visibleSystematicMethod });
  }

  function usedRawSignatures(engine) {
    const used = new Set();
    Object.keys(engine.state.submissions || {}).forEach((id) => {
      const item = engine.model.getQuestion(id)?.canonicalQuestion;
      if (item?.sourceFraction) used.add(source.rawFractionSignature(item.sourceFraction));
    });
    return used;
  }

  const repairIdByFamily = {
    stop_early: "R-EARLY", one_side: "R-BOTH", non_common: "R-COMMON",
    smaller_numbers: "R-SMALL", value_change: "R-VALUE", arithmetic_slip: "R-ARITHMETIC-CHECK"
  };

  function selectFreshCheckId(engine, family, exclusions) {
    const repairId = repairIdByFamily[family];
    if (!repairId) return null;
    const used = usedRawSignatures(engine);
    (exclusions || []).forEach((id) => {
      const item = engine.model.getQuestion(id)?.canonicalQuestion;
      if (item?.sourceFraction) used.add(source.rawFractionSignature(item.sourceFraction));
    });
    const selected = source.selectFreshRepairCheck({ repairId, usedRawFractionSignatures: used });
    return selected ? prefix(selected.id) : null;
  }

  function selectRecoveryQuestionIds(engine, missedFamilies, requiredCount) {
    const selected = source.selectRecoveryItems({
      requiredCount,
      missedFamilies,
      usedRawFractionSignatures: usedRawSignatures(engine),
      usedItemIds: new Set(engine.state.seenConfirmations.map(unprefix))
    });
    return selected.map((item) => prefix(item.id));
  }

  function evaluateFinalEvidence(records) {
    const correct = records.filter((record) => record.correct && record.independent && !record.hintUsed);
    const procedural = correct.some((record) => /procedural|stopping|boundary/.test(record.family));
    const reasoningOrApplication = correct.some((record) => /reasoning|application/.test(record.family));
    const blocking = ["stop_early", "one_side", "non_common", "smaller_numbers", "value_change"];
    const counts = {};
    records.forEach((record) => { if (blocking.includes(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1; });
    const repeatedBlockingFamilies = Object.keys(counts).filter((family) => counts[family] >= 2);
    const route = source.routeFinalCheck({ correctCount: correct.length, proceduralFamilyCorrect: procedural, reasoningOrApplicationFamilyCorrect: reasoningOrApplication, repeatedBlockingMisconception: repeatedBlockingFamilies.length > 0 });
    return { correctCount: correct.length, proceduralFamilyCorrect: procedural, reasoningOrApplicationFamilyCorrect: reasoningOrApplication, repeatedBlockingFamilies, route, masterySatisfied: route === "finish_candidate" };
  }

  function inputMarkup(question, saved, locked) {
    const disabled = locked ? " disabled" : "";
    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    const value = saved && typeof saved === "object" ? saved : {};
    if (question.response.type === "factor_route_builder") {
      const current = value.current || { n: question.canonicalQuestion.sourceFraction.numerator, d: question.canonicalQuestion.sourceFraction.denominator };
      const history = value.history || [];
      return `<fieldset class="fra10-factor-route"><legend>${esc(uiText("G2.FACTOR_PROMPT"))}</legend><div class="fra10-route-current" aria-live="polite"><span>${esc(current.n)}</span><i></i><span>${esc(current.d)}</span></div><ol class="fra10-route-history">${history.map((step) => `<li>÷ ${esc(step.factor)} → ${esc(step.after.n)}/${esc(step.after.d)}</li>`).join("")}</ol><label><span>Common factor</span><input id="fra10-factor" inputmode="numeric" autocomplete="off"${disabled}></label><div class="fra10-route-actions"><button type="button" id="fra10-apply-factor"${disabled}>${esc(uiText("COMMON.DIVIDE_AGAIN"))}</button><button type="button" id="fra10-finished"${disabled}>${esc(uiText("COMMON.FINISHED"))}</button></div><p id="fra10-route-status" class="fra10-inline-status" aria-live="polite">${value.finished ? "Ready to check this stopping decision." : ""}</p></fieldset>`;
    }
    if (question.response.type === "factor_choice_then_fraction") {
      return `<fieldset class="fra10-compound"><legend>Choose the common factor, then write the simplest fraction</legend>${question.response.decisionRequired ? `<div class="fra10-decision" role="group" aria-label="Stopping decision">${question.response.decisionOptions.map((option) => `<button type="button" class="fra10-decision-option${value.decision === option ? " is-selected" : ""}" data-decision="${esc(option)}" aria-pressed="${value.decision === option}"${disabled}>${esc(option)}</button>`).join("")}</div>` : ""}<div class="fra10-factor-options" role="group" aria-label="Common factor">${question.response.factorOptions.map((factor) => `<button type="button" class="fra10-factor-option${String(value.factor) === String(factor) ? " is-selected" : ""}" data-factor="${factor}" aria-pressed="${String(value.factor) === String(factor)}"${disabled}>÷ ${factor}</button>`).join("")}</div><div class="fraction-input"><input id="fra10-compound-n" aria-label="Numerator" inputmode="numeric" value="${esc(value.n || "")}"${disabled}><i></i><input id="fra10-compound-d" aria-label="Denominator" inputmode="numeric" value="${esc(value.d || "")}"${disabled}></div></fieldset>`;
    }
    if (question.response.type === "choice_then_fraction") {
      return `<fieldset class="fra10-compound"><legend>Choose the valid route, then write the simplest fraction</legend><div class="choice-grid">${question.response.options.map((option, index) => `<button type="button" class="fra10-choice-option choice-card${value.choice === option ? " is-selected" : ""}" data-choice-index="${index}" aria-pressed="${value.choice === option}"${disabled}>${esc(option)}</button>`).join("")}</div><div class="fraction-input"><input id="fra10-compound-n" aria-label="Numerator" inputmode="numeric" value="${esc(value.n || "")}"${disabled}><i></i><input id="fra10-compound-d" aria-label="Denominator" inputmode="numeric" value="${esc(value.d || "")}"${disabled}></div></fieldset>`;
    }
    if (question.response.type === "sort_then_factor") {
      return `<fieldset class="fra10-sort"><legend>${esc(uiText("REPAIR.SMALL.ACTION"))}</legend>${question.response.items.map((item) => `<div class="fra10-sort-row"><strong>${item.fraction.numerator}/${item.fraction.denominator}</strong><label><span>Classification</span><select data-fra10-sort="${esc(item.id)}"${disabled}><option value="">Choose…</option><option value="can_simplify"${value.sort?.[item.id] === "can_simplify" ? " selected" : ""}>Can simplify</option><option value="already_simplest"${value.sort?.[item.id] === "already_simplest" ? " selected" : ""}>Already simplest</option></select></label><label><span>Shared factor</span><input data-fra10-sort-factor="${esc(item.id)}" inputmode="numeric" value="${esc(value.factors?.[item.id] || "")}"${disabled}></label></div>`).join("")}</fieldset>`;
    }
    if (question.response.type === "arithmetic_check") {
      return `<fieldset class="fra10-arithmetic"><legend>Recheck both whole-number divisions</legend>${question.response.checks.map((check, index) => `<label><span>${esc(check.label)} =</span><input data-fra10-check="${index}" inputmode="numeric" value="${esc(value.values?.[index] || "")}"${disabled}></label>`).join("")}</fieldset>`;
    }
    return "";
  }

  function readResponse(engine, question, allowPartial) {
    const type = question.response.type;
    const draft = engine.state.drafts[question.id] || {};
    if (type === "factor_route_builder") return draft.finished || allowPartial ? draft : null;
    if (type === "factor_choice_then_fraction" || type === "choice_then_fraction") {
      const n = engine.root.querySelector("#fra10-compound-n")?.value.trim() || "";
      const d = engine.root.querySelector("#fra10-compound-d")?.value.trim() || "";
      const response = Object.assign({}, draft, { n, d });
      const readyChoice = type === "factor_choice_then_fraction" ? /^\d+$/.test(String(response.factor || "")) : Boolean(response.choice);
      const readyDecision = !question.response.decisionRequired || Boolean(response.decision);
      if (readyChoice && readyDecision && /^-?\d+$/.test(n) && /^-?\d+$/.test(d) && Number(d) !== 0) return response;
      return allowPartial ? response : null;
    }
    if (type === "sort_then_factor") {
      const sort = {}, factors = {};
      engine.root.querySelectorAll("[data-fra10-sort]").forEach((control) => { if (control.value) sort[control.dataset.fra10Sort] = control.value; });
      engine.root.querySelectorAll("[data-fra10-sort-factor]").forEach((control) => { if (control.value.trim()) factors[control.dataset.fra10SortFactor] = control.value.trim(); });
      const complete = question.response.items.every((item) => sort[item.id] && /^\d+$/.test(factors[item.id] || ""));
      return complete || allowPartial ? { sort, factors } : null;
    }
    if (type === "arithmetic_check") {
      const values = [...engine.root.querySelectorAll("[data-fra10-check]")].map((control) => control.value.trim());
      return values.every((value) => /^-?\d+$/.test(value)) || allowPartial ? { values } : null;
    }
    return null;
  }

  function bindInputEvents(engine, question) {
    const save = () => {
      engine.state.drafts[question.id] = readResponse(engine, question, true) || {};
      engine.updateSubmitAvailability(question);
      engine.persist();
    };
    engine.root.querySelectorAll("#answer-form input, #answer-form select").forEach((control) => control.addEventListener(control.tagName === "SELECT" ? "change" : "input", save));
    engine.root.querySelectorAll(".fra10-factor-option").forEach((button) => button.addEventListener("click", () => {
      const draft = engine.state.drafts[question.id] || {};
      draft.factor = button.dataset.factor;
      engine.state.drafts[question.id] = draft;
      engine.root.querySelectorAll(".fra10-factor-option").forEach((option) => { const selected = option === button; option.classList.toggle("is-selected", selected); option.setAttribute("aria-pressed", String(selected)); });
      save();
    }));
    engine.root.querySelectorAll(".fra10-decision-option").forEach((button) => button.addEventListener("click", () => {
      const draft = engine.state.drafts[question.id] || {};
      draft.decision = button.dataset.decision;
      engine.state.drafts[question.id] = draft;
      engine.root.querySelectorAll(".fra10-decision-option").forEach((option) => { const selected = option === button; option.classList.toggle("is-selected", selected); option.setAttribute("aria-pressed", String(selected)); });
      save();
    }));
    engine.root.querySelectorAll(".fra10-choice-option").forEach((button) => button.addEventListener("click", () => {
      const draft = engine.state.drafts[question.id] || {};
      draft.choice = question.response.options[Number(button.dataset.choiceIndex)];
      engine.state.drafts[question.id] = draft;
      engine.root.querySelectorAll(".fra10-choice-option").forEach((option) => { const selected = option === button; option.classList.toggle("is-selected", selected); option.setAttribute("aria-pressed", String(selected)); });
      save();
    }));
    if (question.response.type === "factor_route_builder") {
      const ensureDraft = () => {
        const existing = engine.state.drafts[question.id];
        if (existing?.current) return existing;
        const start = question.canonicalQuestion.sourceFraction;
        return { current: { n: start.numerator, d: start.denominator }, history: [], finished: false, invalidFactorCount: 0 };
      };
      engine.root.querySelector("#fra10-apply-factor")?.addEventListener("click", () => {
        const factor = Number(engine.root.querySelector("#fra10-factor")?.value);
        const draft = ensureDraft();
        const result = source.evaluateFactorStep({ current: { numerator: Number(draft.current.n), denominator: Number(draft.current.d) }, factor });
        if (!result.valid) {
          draft.invalidFactorCount = Number(draft.invalidFactorCount || 0) + 1;
          draft.finished = false;
          engine.state.drafts[question.id] = draft;
          const status = engine.root.querySelector("#fra10-route-status");
          if (status) status.textContent = uiText("FB.NON_COMMON");
          engine.emit("factor_choice_rejected", { question_id: question.id, factor, error_family: result.family, invalid_factor_count: draft.invalidFactorCount });
          engine.recordFra10FactorError?.(question, draft);
          engine.persist();
          return;
        }
        draft.history.push({ factor, before: { ...draft.current }, after: { n: result.step.after.numerator, d: result.step.after.denominator } });
        draft.current = { n: result.step.after.numerator, d: result.step.after.denominator };
        draft.finished = false;
        engine.state.drafts[question.id] = draft;
        engine.emit("factor_step_applied", { question_id: question.id, factor, after: `${draft.current.n}/${draft.current.d}`, finished: result.finished });
        engine.suppressNodeNarration = true;
        engine.persist();
        engine.render();
      });
      engine.root.querySelector("#fra10-finished")?.addEventListener("click", () => {
        const draft = ensureDraft();
        draft.finished = true;
        engine.state.drafts[question.id] = draft;
        const status = engine.root.querySelector("#fra10-route-status");
        if (status) status.textContent = "Stopping decision recorded. Check your answer.";
        engine.updateSubmitAvailability(question);
        engine.persist();
      });
    }
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA10 approved runtime source was not loaded.");
    const questionBank = buildQuestions();
    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-09"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const sceneNext = { T1: "T2", T2: "T3", T3: "T4", T4: "T5", T5: "HANDOFF", HANDOFF: "G1" };
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const hookChoice = {
      id: "HOOK-CHOICE", purpose: "Choose the finished answer",
      scene: { display_title: "Same value. One is finished.", initial_state: uiText("HOOK.PROMPT"), objects: [hook.visual.kind], model: Object.assign({ sceneId: "HOOK-CHOICE" }, hook.visual) },
      narration: { script: [], utterance_ids: [], sync_cues: sceneCues(hook) }, animation_timeline: [],
      learner_interaction: { question_ref: prefix("HOOK-CHOICE") }, next_step: "T1"
    };
    spec.lesson.teaching_steps = [teachingStep(hook, "HOOK-CHOICE"), hookChoice, ...approved.teachingScenes.filter((scene) => scene.id !== "HOOK").map((scene) => teachingStep(scene, sceneNext[scene.id]))];

    const transferNext = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(["G1", "G2", "F1", "F2", "I1", "I2"].map((id) => {
      const question = questionBank.find((entry) => entry.id === prefix(id));
      return [id, { stage: question.stage === "independent" ? "independent_transfer" : question.stage, question_ref: question.id, support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none", pre_question_script: question.scripts.before_submit, visual_before_answer: question.prompt, correct_next: transferNext[id] }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Only authored FRA10 routes are used.", between_question_transition: "" };

    const recoveryIds = approved.recoveryBank.map((item) => prefix(item.id));
    const confirmationIds = ["C-DIR", "C-STOP", ...approved.repairs.flatMap((repair) => freshItemsForRepair(repair).map((item) => item.id))].map(prefix);
    spec.lesson.exit = {
      intro_script: textsFor(approved.finalIntroUtteranceIds),
      primary_question_refs: ["M1", "M2", "M3", "M4", "M5"].map(prefix),
      confirmation_question_refs: [...new Set([...confirmationIds, ...recoveryIds])],
      post_repair_retest_refs: recoveryIds,
      mastery_policy: { profile: "fra10_five_item", secureMinimum: 4, totalItems: 5, requireCoverage: true, blockRepeatedCentralMisconception: true }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: { [prefix("I1")]: prefix("C-DIR"), [prefix("I2")]: prefix("C-STOP") },
      repair_by_error_family: Object.fromEntries(Object.entries(repairIdByFamily).map(([family, id]) => [family, prefix(id)])),
      fresh_checks_by_error_family: Object.fromEntries(Object.keys(repairIdByFamily).map((family) => [family, freshItemsForRepair(approved.repairs.find((repair) => repair.id === repairIdByFamily[family])).map((item) => prefix(item.id))])),
      feedback_by_error_family: {
        stop_early: uiText("FB.STOP_EARLY"), one_side: uiText("FB.ONE_SIDE"), non_common: uiText("FB.NON_COMMON"), smaller_numbers: uiText("FB.SMALLER_NUMBERS"), value_change: uiText("FB.VALUE_CHANGE"), arithmetic_slip: uiText("FB.ARITHMETIC_SLIP"), unknown: uiText("FB.NEUTRAL_RECHECK")
      }
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.flow.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Another pass will help", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan", voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)", locale: "en-GB", opening_mode: "authored_scene_only",
      success_reaction_policy: { mode: "question_specific_only" },
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra10_context", no_answer_leakage: true, exact_fraction_geometry: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra10_context", "fraction_input", "single_choice", "factor_route_builder", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: uiText("COMMON.CHECK_ANSWER") }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true, version: CONTENT_VERSION, content_version: CONTENT_VERSION,
      storyboard_version: approved.handoffVersion, engine_profile: "fra10", exact_runtime_copy: true, runtime_applied: true,
      runtime_copy: runtimeCopy, runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn - support nearby", independent: "Now you take over", repair: "Targeted repair", exit: "Final check", completion: "Complete" },
      learner_boundary: approved.scope.deliberatelyLaterOrExcluded,
      migration: { resetIncompatibleState: true, preserveSoundPreference: true, archivePreviousAttempt: true },
      capabilities: { factor_route_builder: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, five_item_final: true, six_targeted_repairs: true, deterministic_recovery: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra10Adapter = {
    apply, bindInputEvents, buildQuestions, evaluateFinalEvidence, evaluateResponse, inputMarkup,
    outcomeUtteranceIds, readResponse, repairIdByFamily, runtimeCopy, selectFreshCheckId,
    selectRecoveryQuestionIds, shouldRepairNow, textFor, uiCopy, uiText, validateQuestionModel, visibleFeedback
  };
})();
