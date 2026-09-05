(function () {
  "use strict";

  const LESSON_ID = "FRA-27";
  const CONTENT_VERSION = "fra27-divide-fraction-by-integer-v1";
  const source = window.RevilyFra27V1;
  const approved = source?.FRA27_LESSON_SPEC;
  const runtimeCopy = source?.FRA27_RUNTIME_COPY || {};
  const uiCopy = source?.FRA27_UI_COPY || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  function runtimeText(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA-27 runtime utterance: ${id}`);
    return entry.text;
  }

  function runtimeTexts(ids) {
    return (ids || []).filter((id) => runtimeCopy[id]).map(runtimeText);
  }

  function visibleText(ref) {
    if (!ref) return "";
    if (ref.channel === "ryan_audio_caption") return runtimeCopy[ref.id]?.text || "";
    if (ref.channel === "visible_ui_only") return uiCopy[ref.id]?.text || "";
    return "";
  }

  function problemFor(raw) {
    return source.FRA27_PROBLEMS[raw?.problemId] || null;
  }

  function fractionLabel(value) {
    return `${value.numerator}/${value.denominator}`;
  }

  function optionLabel(raw, optionId) {
    return raw.options.find((option) => option.id === optionId)?.visibleLabel || optionId;
  }

  function optionId(question, response) {
    const value = response && typeof response === "object" && "choice" in response ? response.choice : response;
    return question.response?.optionIds?.[String(value)] || String(value || "");
  }

  function responseFor(raw) {
    const response = raw.responseSpec || {};
    if (response.kind === "fraction") {
      return {
        type: "fraction",
        accept_equivalent_notation: true,
        partLabel: "Numerator",
        wholeLabel: "Denominator",
        unitLabel: response.unitDisplayedByUi || null,
        keyboard_submit: true
      };
    }
    if (response.kind === "missing_numerator") {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: "numerator",
        fixedDenominator: response.fixedDenominator,
        input_label: "Missing numerator",
        keyboard_submit: true
      };
    }
    if (response.kind === "choice") {
      return {
        type: "single_choice",
        options: raw.options.map((option) => option.visibleLabel),
        optionIds: Object.fromEntries(raw.options.map((option) => [option.visibleLabel, option.id])),
        keyboard_submit: true
      };
    }
    if (response.kind === "reciprocal_and_product") {
      return {
        type: "fra27_reciprocal_product",
        entryMode: raw.options.length ? "choices" : "fields",
        options: raw.options.map((option) => option.visibleLabel),
        optionIds: Object.fromEntries(raw.options.map((option) => [option.visibleLabel, option.id])),
        keyboard_submit: true
      };
    }
    if (response.kind === "drag_share_then_fraction") {
      return {
        type: "fra27_share",
        trayCount: response.trayCount,
        totalTiles: response.totalTiles,
        fixedDenominator: response.fixedDenominator || problemFor(raw)?.dividend.denominator,
        expectedTrayCounts: [...(response.expectedTrayCounts || [])],
        keyboard_submit: true
      };
    }
    if (response.kind === "method_animation_choice") {
      return {
        type: "single_choice",
        options: ["Make equal shares", "Make three copies"],
        optionIds: { "Make equal shares": "share_into_groups", "Make three copies": "make_copies" },
        keyboard_submit: true
      };
    }
    if (response.kind === "operation_meaning_choice") {
      return {
        type: "single_choice",
        options: ["Make equal shares", "Take away the divisor"],
        optionIds: { "Make equal shares": "make_equal_shares", "Take away the divisor": "take_away" },
        keyboard_submit: true
      };
    }
    if (response.kind === "unscored_cut_choice") {
      return {
        type: "single_choice",
        options: ["Cut after one quarter", "Cut after two quarters"],
        optionIds: { "Cut after one quarter": "after_one_quarter", "Cut after two quarters": "after_two_quarters" },
        keyboard_submit: true
      };
    }
    throw new Error(`${raw.id}: unsupported FRA-27 response kind ${response.kind}`);
  }

  function answerFor(raw) {
    const response = raw.responseSpec || {};
    const expected = problemFor(raw) ? source.divideFractionByInteger(problemFor(raw).dividend, problemFor(raw).integerDivisor) : null;
    if (response.kind === "fraction") return { n: String(expected.numerator), d: String(expected.denominator) };
    if (response.kind === "missing_numerator") return String(response.expectedNumerator);
    if (response.kind === "choice") return optionLabel(raw, response.correctOptionId);
    if (response.kind === "reciprocal_and_product") {
      const reciprocal = response.expectedReciprocal || source.reciprocalOfInteger(problemFor(raw).integerDivisor);
      return { reciprocal: fractionLabel(reciprocal), n: String(expected.numerator), d: String(expected.denominator) };
    }
    if (response.kind === "drag_share_then_fraction") {
      return { trayCounts: [...response.expectedTrayCounts], n: String(expected.numerator), d: String(expected.denominator) };
    }
    if (response.kind === "method_animation_choice") return "Make equal shares";
    if (response.kind === "operation_meaning_choice") return "Make equal shares";
    if (response.kind === "unscored_cut_choice") return "Cut after one quarter";
    return null;
  }

  function cueList(utteranceIds, cueIds) {
    const utterances = new Set(utteranceIds || []);
    const allowedCues = new Set(cueIds || []);
    return source.FRA27_SPEECH_CUES
      .filter((cue) => utterances.has(cue.utteranceId) && (!allowedCues.size || allowedCues.has(cue.id)))
      .map((cue) => ({
        id: cue.id,
        utteranceId: cue.utteranceId,
        cue: cue.anchorText,
        anchorText: cue.anchorText,
        action: cue.action,
        target: cue.targetIds,
        reducedMotionEquivalent: cue.reducedMotionEquivalent
      }));
  }

  function modelFor(raw, additions) {
    const problem = problemFor(raw);
    const numerator = Number(problem?.dividend?.numerator || 1);
    const denominator = Number(problem?.dividend?.denominator || 1);
    return Object.assign({
      context: "fra27",
      questionId: raw.id,
      sceneId: raw.id,
      problem,
      visual: raw.visual || {},
      responseSpec: raw.responseSpec || {},
      totalParts: denominator,
      selectedParts: numerator,
      allowMultipleWholes: numerator > denominator,
      accessibleDescription: raw.accessibleDescription || ""
    }, additions || {});
  }

  function defaultFamily(raw) {
    if (raw.assessmentFamily === "REASON" || raw.assessmentFamily === "ERROR") return "MULTIPLY";
    return "UNKNOWN";
  }

  function feedbackRefs(raw) {
    const outcomes = raw.outcomes || {};
    const ref = (id) => id ? (runtimeCopy[id]
      ? { channel: "ryan_audio_caption", id }
      : { channel: "visible_ui_only", id }) : null;
    return {
      correct: ref(outcomes.correctUtteranceId || outcomes.correctUiCopyId),
      incorrectDefault: ref(outcomes.incorrectDefaultUtteranceId || outcomes.incorrectDefaultUiCopyId),
      incorrectByOption: Object.fromEntries(Object.entries(outcomes.incorrectByOption || {}).map(([id, copyId]) => [id, ref(copyId)])),
      incorrectBySignal: Object.fromEntries(Object.entries(outcomes.incorrectBySignal || {}).map(([id, copyId]) => [id, ref(copyId)]))
    };
  }

  function workedExplanation(raw) {
    return (raw.postSubmitWorking?.visibleLines || []).map((line, index) => `${index + 1}. ${line}`).join(" ");
  }

  function convertQuestion(raw, additions) {
    const hintId = typeof raw.hintPolicy === "object" ? raw.hintPolicy.utteranceId : null;
    const refs = feedbackRefs(raw);
    const runtimeUtteranceIds = [
      ...(raw.spokenPromptUtteranceIds || []),
      ...(hintId ? [hintId] : []),
      ...Object.values(refs).flatMap((value) => value && !Array.isArray(value) && value.channel === "ryan_audio_caption" ? [value.id] : []),
      ...Object.values(refs.incorrectByOption || {}).filter((value) => value?.channel === "ryan_audio_caption").map((value) => value.id),
      ...Object.values(refs.incorrectBySignal || {}).filter((value) => value?.channel === "ryan_audio_caption").map((value) => value.id),
      ...(raw.postSubmitWorking?.spokenUtteranceIds || [])
    ];
    return Object.assign({
      id: prefix(raw.id),
      canonicalQuestionId: raw.id,
      stage: raw.stage,
      target: raw.authorOnly?.assessmentIntent || raw.assessmentFamily,
      assessmentIntent: raw.authorOnly?.assessmentIntent || raw.assessmentFamily,
      evidenceFamily: raw.assessmentFamily,
      prompt: raw.visibleUi.body,
      questionDetail: raw.visibleUi.title,
      response: responseFor(raw),
      answer: { value: answerFor(raw) },
      policy: {
        hintPolicy: typeof raw.hintPolicy === "object" ? "optional" : "none",
        solutionPolicy: raw.postSubmitWorking ? "after_locked_submit" : "after_response",
        scored: raw.scoring.contributesToMastery === true,
        answerLocksOnSubmit: raw.scoring.answerLockPolicy === "lock_on_submit",
        requiresFreshNoHintConfirmationIfHintUsed: typeof raw.hintPolicy === "object",
        requiresFreshNoHintConfirmationAfterSupport: ["I1", "I2"].includes(raw.id),
        countsAsIndependentEvidence: raw.scoring.contributesToMastery === true,
        maxAttemptsBeforeRepair: raw.scoring.allowRetry ? 2 : 1
      },
      attempt_policy: { submit_label: raw.visibleUi.submitLabel },
      model: modelFor(raw),
      visual: { primitive: "fra27_context", action: "focus", description: raw.accessibleDescription },
      mathematical_support: hintId ? { hint_1: runtimeText(hintId) } : {},
      scripts: {
        before_submit: runtimeTexts(raw.spokenPromptUtteranceIds),
        hint: hintId ? runtimeText(hintId) : "",
        on_correct_reaction: refs.correct?.channel === "ryan_audio_caption" ? visibleText(refs.correct) : "",
        on_incorrect_reaction: refs.incorrectDefault?.channel === "ryan_audio_caption" ? visibleText(refs.incorrectDefault) : "",
        on_incorrect_attempt_1: refs.incorrectDefault?.channel === "ryan_audio_caption" ? visibleText(refs.incorrectDefault) : "",
        on_incorrect_attempt_2: refs.incorrectDefault?.channel === "ryan_audio_caption" ? visibleText(refs.incorrectDefault) : "",
        worked_explanation: workedExplanation(raw),
        worked_steps: [...(raw.postSubmitWorking?.visibleLines || [])],
        worked_narration: runtimeTexts(raw.postSubmitWorking?.spokenUtteranceIds || [])
      },
      runtimeOutcome: refs,
      runtimeUtteranceIds: [...new Set(runtimeUtteranceIds)],
      primaryErrorFamily: defaultFamily(raw),
      errorClassification: { fallback: defaultFamily(raw), requiresRepeatedEvidence: true },
      canonicalQuestion: raw,
      sourceProvenance: raw.sourceProvenance
    }, additions || {});
  }

  function buildHookQuestion() {
    const scene = source.FRA27_TEACHING_SCENES.find((item) => item.id === "HOOK");
    const raw = {
      id: "HOOK-CHOICE",
      stage: "opening",
      assessmentFamily: "VISUAL",
      visibleUi: {
        title: "Where should the strip be cut?",
        body: "Choose one of the quarter-metre marks.",
        submitLabel: "Show the share"
      },
      accessibleDescription: "A three-quarter-metre light strip has marks after one quarter and two quarters. Choose a mark for an unscored prediction.",
      spokenPromptUtteranceIds: ["HOOK.1", "HOOK.2"],
      responseSpec: { kind: "unscored_cut_choice" },
      hintPolicy: "none",
      outcomes: {},
      options: [],
      visual: { kind: "hook_light_strip", totalQuarterMarks: 3 },
      postSubmitWorking: null,
      scoring: { contributesToMastery: false, allowRetry: false, answerLockPolicy: "lock_on_submit" },
      authorOnly: { assessmentIntent: scene.authorOnlyPurpose },
      sourceProvenance: "storyboard_exact"
    };
    const question = convertQuestion(raw, {
      policy: { scored: false, engagementOnly: true, answerLocksOnSubmit: true, hintPolicy: "none", solutionPolicy: "after_response" },
      scripts: {
        before_submit: [],
        engagement_response_by_value: {
          "Cut after one quarter": runtimeTexts(["HOOK.REVEAL"]),
          "Cut after two quarters": runtimeTexts(["HOOK.REVEAL"])
        },
        engagement_detail: "",
        engagement_label: "Your prediction"
      },
      runtimeOutcome: { responseUtteranceIdsByValue: {
        "Cut after one quarter": ["HOOK.REVEAL"],
        "Cut after two quarters": ["HOOK.REVEAL"]
      } }
    });
    question.model.sceneId = "HOOK";
    return question;
  }

  function supportedRaw(repair) {
    const ui = uiCopy[repair.supportedInteraction.promptUiCopyId];
    return {
      id: `${repair.id}-SUPPORTED`,
      stage: "repair",
      assessmentFamily: "DIRECT",
      problemId: repair.supportedInteraction.problemId,
      visibleUi: { stageLabel: "Quick repair", title: "Use the repaired idea", body: ui.text, submitLabel: "Check repair" },
      accessibleDescription: ui.text,
      spokenPromptUtteranceIds: [],
      responseSpec: repair.supportedInteraction.responseSpec,
      hintPolicy: "none",
      outcomes: { correctUiCopyId: "REPAIR.SUPPORTED.CORRECT", incorrectDefaultUiCopyId: "REPAIR.SUPPORTED.INCORRECT" },
      options: [],
      visual: repair.visual,
      postSubmitWorking: null,
      scoring: { contributesToMastery: false, allowRetry: true, answerLockPolicy: "lock_on_correct_or_route" },
      authorOnly: { assessmentIntent: `Supported ${repair.errorFamily} repair` },
      sourceProvenance: "storyboard_exact_with_handoff_concretisation"
    };
  }

  function convertRepair(repair) {
    const problem = source.FRA27_PROBLEMS[repair.teachingProblemId];
    return {
      id: prefix(repair.id),
      canonicalQuestionId: repair.id,
      stage: "repair",
      target: repair.triggerRule,
      assessmentIntent: repair.triggerRule,
      evidenceFamily: repair.errorFamily,
      prompt: uiCopy[repair.supportedInteraction.promptUiCopyId].text,
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      attempt_policy: { submit_label: "Continue" },
      model: {
        context: "fra27",
        questionId: repair.id,
        sceneId: repair.id,
        problem,
        visual: repair.visual,
        totalParts: problem.dividend.denominator,
        selectedParts: problem.dividend.numerator,
        allowMultipleWholes: problem.dividend.numerator > problem.dividend.denominator,
        accessibleDescription: `A targeted ${repair.errorFamily.toLowerCase().replaceAll("_", " ")} repair model.`
      },
      visual: { primitive: "fra27_context", action: "repair", description: repair.triggerRule },
      scripts: { reteach: runtimeTexts(repair.speechUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.speechUtteranceIds],
      supportedInteractionId: prefix(`${repair.id}-SUPPORTED`),
      freshCheckId: prefix(repair.freshCheckQuestionId),
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily },
      canonicalRepair: repair
    };
  }

  function buildQuestions() {
    const questions = Object.values(source.FRA27_QUESTIONS).map((raw) => convertQuestion(raw, {
      isFreshConfirmation: raw.stage === "confirmation" || raw.stage === "repair",
      isRecoveryFinal: raw.stage === "recovery_final"
    }));
    const repairs = Object.values(source.FRA27_REPAIRS);
    return [
      buildHookQuestion(),
      ...questions,
      ...repairs.map((repair) => convertQuestion(supportedRaw(repair), { isRepairSupported: true, repairFamily: repair.errorFamily })),
      ...repairs.map(convertRepair)
    ];
  }

  function packageResponse(question, response) {
    const raw = question.canonicalQuestion;
    const kind = raw?.responseSpec?.kind;
    if (kind === "fraction") return { kind: "fraction", numerator: Number(response?.n), denominator: Number(response?.d) };
    if (kind === "missing_numerator") return { kind: "missing_numerator", numerator: Number(response) };
    if (kind === "choice") return { kind: "choice", optionId: optionId(question, response) };
    if (kind === "drag_share_then_fraction") return {
      kind: "drag_share_then_fraction",
      trayCounts: [...(response?.trayCounts || [])].map(Number),
      fraction: { numerator: Number(response?.n), denominator: Number(response?.d) }
    };
    if (kind === "reciprocal_and_product") {
      const selected = raw.options?.find((option) => option.id === optionId(question, response?.reciprocal));
      const reciprocal = selected?.value || parseFractionLabel(response?.reciprocal);
      return {
        kind: "reciprocal_and_product",
        reciprocal,
        product: { numerator: Number(response?.n), denominator: Number(response?.d) }
      };
    }
    if (kind === "method_animation_choice") return { kind, choice: optionId(question, response) };
    if (kind === "operation_meaning_choice") return { kind, choice: optionId(question, response) };
    return { kind: "choice", optionId: optionId(question, response) };
  }

  function parseFractionLabel(value) {
    const match = String(value || "").match(/^\s*(-?\d+)\s*\/\s*(-?\d+)\s*$/);
    return match ? { numerator: Number(match[1]), denominator: Number(match[2]) } : { numerator: 0, denominator: 0 };
  }

  function evaluateSupported(question, response) {
    const raw = question.canonicalQuestion;
    const problem = problemFor(raw);
    const expected = source.divideFractionByInteger(problem.dividend, problem.integerDivisor);
    const converted = packageResponse(question, response);
    let correct = false;
    if (converted.kind === "drag_share_then_fraction") {
      const expectedCounts = raw.responseSpec.expectedTrayCounts || [];
      correct = converted.trayCounts.length === expectedCounts.length
        && converted.trayCounts.every((count, index) => count === expectedCounts[index])
        && source.areEquivalentFractions(converted.fraction, expected);
    } else if (converted.kind === "reciprocal_and_product") {
      correct = source.areEquivalentFractions(converted.reciprocal, source.reciprocalOfInteger(problem.integerDivisor))
        && source.areEquivalentFractions(converted.product, expected);
    } else if (converted.kind === "method_animation_choice") {
      correct = converted.choice === "share_into_groups";
    } else if (converted.kind === "operation_meaning_choice") {
      correct = converted.choice === "make_equal_shares";
    }
    const ref = { channel: "visible_ui_only", id: correct ? "REPAIR.SUPPORTED.CORRECT" : "REPAIR.SUPPORTED.INCORRECT" };
    return { correct, valueCorrect: correct, formCorrect: correct, errorFamily: correct ? null : question.repairFamily, feedback: ref, visibleText: visibleText(ref) };
  }

  function evaluateResponse(question, response) {
    if (question.isRepairSupported) return evaluateSupported(question, response);
    const id = unprefix(question.id);
    if (id === "HOOK-CHOICE") return { correct: true, valueCorrect: true, formCorrect: true, errorFamily: null, feedback: null, visibleText: "" };
    const result = source.checkFRA27Response(id, packageResponse(question, response));
    return Object.assign({}, result, {
      valueCorrect: result.correct,
      formCorrect: result.correct,
      visibleText: visibleText(result.feedback)
    });
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const evaluation = evaluateResponse(question, response);
    if (evaluation.correct !== correct) return [];
    return evaluation.feedback?.channel === "ryan_audio_caption" ? [evaluation.feedback.id] : [];
  }

  function classifyErrorFamily(question, response) {
    return evaluateResponse(question, response).errorFamily || "UNKNOWN";
  }

  function visibleFeedback(question, response, correct) {
    const evaluation = evaluateResponse(question, response);
    if (evaluation.correct === correct && evaluation.visibleText) return evaluation.visibleText;
    const fallback = correct ? question.runtimeOutcome?.correct : question.runtimeOutcome?.incorrectDefault;
    return visibleText(fallback);
  }

  function requiresRepeatedEvidence(question, response) {
    const family = classifyErrorFamily(question, response);
    if (["UNKNOWN", "ARITHMETIC"].includes(family)) return false;
    const kind = question.canonicalQuestion?.responseSpec?.kind;
    return !["choice", "method_animation_choice", "operation_meaning_choice"].includes(kind);
  }

  function finalEvidenceRecords(engine, questionIds) {
    return (questionIds || []).map((fullId) => {
      const id = unprefix(fullId);
      const recorded = engine.state.evidence.errorFamily[fullId];
      const candidate = engine.state.evidence.candidateErrorFamily[fullId];
      return {
        questionId: id,
        stage: source.FRA27_QUESTIONS[id]?.stage || "final",
        family: source.FRA27_QUESTIONS[id]?.assessmentFamily || "DIRECT",
        submittedAnswer: engine.state.exit.responses[fullId]?.response,
        committedAnswer: engine.state.exit.responses[fullId]?.response,
        firstAttemptCorrect: engine.state.evidence.firstAttemptCorrect[fullId] === true,
        attempts: engine.state.attempts[fullId] || 0,
        hintOpenedBeforeSubmit: engine.state.evidence.hintOpenedBeforeSubmit[fullId] === true,
        supportEscalated: engine.state.evidence.supportEscalated[fullId] === true,
        answerLocked: engine.state.evidence.answerLocked[fullId] === true,
        countsAsIndependentEvidence: true,
        answerValueCorrect: engine.state.evidence.answerValueCorrect[fullId] === true,
        answerFormCorrect: engine.state.evidence.answerFormCorrect[fullId] === true,
        errorFamilyHypothesis: engine.state.exit.responses[fullId]?.correct ? null : (recorded === "support_needed" ? candidate : recorded) || candidate || "UNKNOWN",
        stableRepairFamily: null,
        freshConfirmationPassed: false,
        solutionViewedAfterLock: engine.state.workedRevealed[fullId] === true
      };
    });
  }

  function teachingStep(scene, nextId, hookQuestion) {
    const utteranceIds = scene.id === "HOOK" ? scene.utteranceIds.filter((id) => id !== "HOOK.REVEAL") : scene.utteranceIds;
    const cues = cueList(utteranceIds, scene.cueIds);
    return {
      id: scene.id,
      purpose: scene.authorOnlyPurpose,
      scene: {
        display_title: scene.id === "HOOK" ? "Share a fractional length" : scene.id === "HANDOFF" ? "Two connected methods" : `Build the method · ${scene.id}`,
        initial_state: scene.authorOnlyPurpose,
        objects: ["fraction division model"],
        model: {
          context: "fra27",
          sceneId: scene.id,
          visual: { kind: `teaching_${scene.id.toLowerCase()}` },
          totalParts: scene.id === "T4" ? 5 : 4,
          selectedParts: scene.id === "T4" ? 7 : 3,
          allowMultipleWholes: scene.id === "T4",
          accessibleDescription: scene.authorOnlyPurpose
        }
      },
      narration: { script: runtimeTexts(utteranceIds), utterance_ids: [...utteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      learner_interaction: hookQuestion ? { question_ref: hookQuestion.id } : { type: "continue" },
      next_step: nextId
    };
  }

  function hookChoiceStep(question) {
    return {
      id: "HOOK-CHOICE",
      purpose: "Commit an unscored prediction before the smaller parts are revealed.",
      scene: {
        display_title: "Choose a quarter-metre mark",
        initial_state: question.model.accessibleDescription,
        objects: ["three-quarter-metre light strip"],
        model: Object.assign({}, question.model, { sceneId: "HOOK" })
      },
      narration: { script: [], utterance_ids: [], sync_cues: [] },
      animation_timeline: [],
      learner_interaction: { question_ref: question.id },
      next_step: "T1"
    };
  }

  function validateRuntimeContract() {
    const issues = [...source.validateFRA27CanonicalSpec()];
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      if (entry.provenance !== "storyboard_exact") issues.push(`${id} lacks storyboard_exact provenance`);
      if (entry.captionSource !== "same_as_audio") issues.push(`${id} does not use audio/caption parity`);
    });
    Object.entries(uiCopy).forEach(([id, entry]) => {
      if (entry.delivery !== "visible_ui_only") issues.push(`${id} is not UI-only`);
    });
    return [...new Set(issues)];
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA-27 approved package was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA-27 canonical validation failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.curriculumContract.objective;
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const next = { HOOK: "HOOK-CHOICE", T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = source.FRA27_TEACHING_SCENES.flatMap((scene) => scene.id === "HOOK"
      ? [teachingStep(scene, next[scene.id], null), hookChoiceStep(question("HOOK-CHOICE"))]
      : [teachingStep(scene, next[scene.id], null)]);
    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const transferNext = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const item = question(id);
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: item.scripts.before_submit,
        visual_before_answer: item.prompt,
        correct_next: transferNext[id],
        recovery_ref: null
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Only approved FRA-27 confirmations and repairs are used.", between_question_transition: "" };
    spec.lesson.exit = {
      intro_script: runtimeTexts(["FINAL.INTRO"]),
      primary_question_refs: ["M1", "M2", "M3", "M4", "M5"].map(prefix),
      confirmation_question_refs: Object.keys(source.FRA27_QUESTIONS).filter((id) => !["G1", "G2", "F1", "F2", "I1", "I2", "M1", "M2", "M3", "M4", "M5"].includes(id)).map(prefix),
      repair_by_primary: {},
      post_repair_retest_refs: ["A1", "A2", "A3"].map(prefix),
      mastery_policy: { profile: "fra27_five_item", secureMinimum: 4, totalItems: 5, repairCycleCapPerFamily: 1 }
    };
    const repairByFamily = Object.fromEntries(Object.values(source.FRA27_REPAIRS).map((repair) => [repair.errorFamily, prefix(repair.id)]));
    const freshByFamily = Object.fromEntries(Object.values(source.FRA27_REPAIRS).map((repair) => [repair.errorFamily, [prefix(repair.freshCheckQuestionId)]]));
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra27_guided_strong", next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-DIRECT"),
        [prefix("F2")]: prefix("C-METHOD"),
        [prefix("I1")]: prefix("C-RECIP"),
        [prefix("I2")]: prefix("C-DIRECT")
      },
      repair_by_error_family: Object.assign({}, repairByFamily, { ARITHMETIC: prefix("R-NUM"), UNKNOWN: prefix("R-MULT"), unknown: prefix("R-MULT") }),
      fresh_checks_by_error_family: Object.assign({}, freshByFamily, { ARITHMETIC: [prefix("R-NUM-FRESH")], UNKNOWN: [prefix("R-MULT-FRESH")], unknown: [prefix("R-MULT-FRESH")] }),
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: runtimeTexts(["COMPLETE.1"]), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: uiCopy.RESTART.text, ryan_script: [], buttons: ["Start the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      success_reaction_policy: { mode: "question_specific_only" },
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra27_context", exact_storyboard_geometry: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra27_context", "fraction_input", "single_choice", "caption_layer", "progress_indicator"] });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "FRA27-HANDOFF-V1",
      engine_profile: "fra27",
      exact_runtime_copy: true,
      runtime_applied: true,
      runtime_copy: runtimeCopy,
      ui_copy: uiCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn - support nearby", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      route_contract: approved.route,
      migration: { resetIncompatibleState: true, preserveSoundPreference: true, preserveCompletionStatusInHistory: true, archivePreviousAttempt: true, resetTo: "HOOK" },
      capabilities: { exact_fraction_division: true, component_evidence: true, optional_hints: true, fresh_confirmations: true, five_targeted_repairs: true, mini_check_recovery: true, alternate_final_recovery: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra27Canonical = {
    CONTENT_VERSION,
    apply,
    buildQuestions,
    classifyErrorFamily,
    evaluateResponse,
    finalEvidenceRecords,
    requiresRepeatedEvidence,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    uiCopy,
    validateRuntimeContract,
    visibleFeedback
  };
})();
