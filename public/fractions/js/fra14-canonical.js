(function () {
  "use strict";

  const LESSON_ID = "FRA-14";
  const CONTENT_VERSION = "FRA14-HANDOFF-V1";
  const approved = window.RevilyFra14Approved;
  const runtimeCopy = window.FRA14_RUNTIME_COPY || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  function textFor(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA14 runtime utterance: ${id}`);
    return entry.text;
  }

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
        if (/UtteranceIds$/.test(key) && Array.isArray(value)) value.forEach((id) => {
          if (!selectedRegistry[id]) issues.push(`Missing runtime utterance ${id}`);
        });
      });
      if (object.utteranceId && object.anchorText) {
        const entry = selectedRegistry[object.utteranceId];
        if (!entry) issues.push(`Cue points to missing utterance ${object.utteranceId}`);
        else if (!entry.text.toLocaleLowerCase("en-GB").includes(String(object.anchorText).toLocaleLowerCase("en-GB"))) {
          issues.push(`Cue anchor is absent from ${object.utteranceId}`);
        }
      }
    });
    return [...new Set(issues)];
  }

  function accessibleDescription(visual) {
    if (!visual) return "An equal-section bar shows the given fractional part without revealing the missing whole.";
    const sectionWord = visual.totalSections === 1 ? "section" : "sections";
    return `An equal bar has ${visual.totalSections} ${sectionWord}. The known bracket spans ${visual.knownSpanSections} and is labelled ${visual.knownAmountLabel}. The remaining value is not shown.`;
  }

  function syncCuesFor(utteranceIds) {
    const ids = new Set(utteranceIds || []);
    return approved.speechLedCues.filter((cue) => ids.has(cue.utteranceId)).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      action: cue.id,
      reducedMotionEquivalent: cue.reducedMotionEquivalent
    }));
  }

  function modelFor(raw, options) {
    const visual = raw.visual || options?.visual;
    return {
      context: "fra14_whole_from_part",
      sceneId: options?.sceneId || raw.id,
      mode: options?.mode || (raw.stage ? "question" : (raw.supportedInteraction ? "repair" : "teaching")),
      math: raw.math || options?.math || null,
      visual,
      accessibleDescription: options?.accessibleDescription || accessibleDescription(visual)
    };
  }

  function labelsAndIds(options) {
    const labelled = (options || []).map((option) => ({ id: option.id, label: option.label || `Model ${option.id}` }));
    const values = labelled.map((option) => option.label);
    return {
      values,
      optionIds: Object.fromEntries(labelled.map((option) => [option.label, option.id]))
    };
  }

  function responseFor(raw) {
    const response = raw.response;
    if (response.kind === "numeric") {
      return {
        type: "integer",
        input_label: "Whole",
        prefix: response.prefix,
        suffix: response.suffix,
        keyboard_submit: true
      };
    }
    if (response.kind === "two_step_numeric") {
      return {
        type: "two_step_integer",
        fields: response.fields.map((field) => ({
          id: field.id === "one_part" ? "onePart" : field.id,
          label: field.id === "one_part" ? "One equal part" : "Whole",
          prefix: field.prefix,
          suffix: field.suffix
        })),
        keyboard_submit: true
      };
    }
    if (response.kind === "plan_and_numeric") {
      const mapped = labelsAndIds(response.planOptions);
      return {
        type: "choice_and_integer",
        choiceLabel: "Choose the plan",
        valueLabel: "Whole",
        options: mapped.values,
        optionIds: mapped.optionIds,
        prefix: response.wholeField.prefix,
        suffix: response.wholeField.suffix,
        keyboard_submit: true
      };
    }
    if (response.kind === "model_and_numeric") {
      const mapped = labelsAndIds(response.modelOptions);
      return {
        type: "choice_and_integer",
        choiceLabel: "Choose the matching bar",
        valueLabel: "Whole",
        options: mapped.values,
        optionIds: mapped.optionIds,
        optionModels: response.modelOptions.map((option) => ({
          context: "fra14_model_option",
          totalSections: option.totalSections,
          knownSpanSections: option.knownSpanSections,
          knownAmountLabel: option.knownAmountLabel,
          label: option.id
        })),
        prefix: response.wholeField.prefix,
        suffix: response.wholeField.suffix,
        keyboard_submit: true
      };
    }
    const mapped = labelsAndIds(response.options);
    return {
      type: "single_choice",
      options: mapped.values,
      optionIds: mapped.optionIds,
      keyboard_submit: true
    };
  }

  function answerFor(raw) {
    if (raw.response.kind === "two_step_numeric") return { onePart: raw.answer.onePart, whole: raw.answer.whole };
    if (raw.response.kind === "plan_and_numeric") {
      const option = raw.response.planOptions.find((item) => item.id === raw.answer.planId);
      return { choice: option?.label, whole: raw.answer.whole };
    }
    if (raw.response.kind === "model_and_numeric") {
      return { choice: `Model ${raw.answer.modelId}`, whole: raw.answer.whole };
    }
    if (raw.response.kind === "single_choice") return raw.response.options.find((item) => item.id === raw.answer)?.label;
    return raw.answer;
  }

  function workedExplanation(raw) {
    return (raw.workedCheck?.visibleSteps || []).map((step, index) => `${index + 1}. ${step}`).join("\n");
  }

  function errorClassification(raw) {
    const numericFamilies = {};
    const choiceFamilies = {};
    (raw.likelyErrorSignals || []).forEach((signal) => {
      if (signal.numericValue !== undefined) numericFamilies[String(signal.numericValue)] = signal.family;
      if (signal.responseId) choiceFamilies[signal.responseId] = signal.family;
    });
    return {
      numericFamilies,
      choiceFamilies,
      fallback: "AMBIGUOUS",
      repeatedFamilies: Object.fromEntries((raw.likelyErrorSignals || []).map((signal) => [signal.family, signal.requiresRepeatBeforeClassification]))
    };
  }

  function convertQuestion(raw, additions) {
    const correctIds = [...(raw.feedback.correctUtteranceIds || [])];
    const defaultIds = [...(raw.feedback.incorrectDefaultUtteranceIds || [])];
    const specificIds = Object.fromEntries(Object.entries(raw.feedback.errorSpecificUtteranceIds || {}).map(([family, ids]) => [family, [...ids]]));
    const question = {
      id: prefix(raw.id),
      stage: raw.stage,
      family: raw.family,
      evidenceFamily: raw.family,
      target: raw.authorOnly.assessmentIntent,
      assessmentIntent: raw.authorOnly.assessmentIntent,
      prompt: raw.studentFacing.prompt,
      questionDetail: raw.studentFacing.title,
      response: responseFor(raw),
      answer: { value: answerFor(raw) },
      policy: {
        scored: raw.policy.scored,
        answerLocksOnSubmit: raw.policy.answerLocksOnSubmit,
        hintPolicy: raw.policy.hintPolicy === "optional_collapsed" ? "optional" : "none",
        solutionPolicy: raw.policy.solutionPolicy,
        eligibleForIndependentMastery: raw.policy.eligibleForIndependentMastery,
        firstAttemptIsAuthoritative: raw.policy.firstAttemptIsAuthoritative,
        requiresFreshNoHintConfirmationIfHintUsed: raw.policy.hintPolicy === "optional_collapsed"
      },
      model: modelFor(raw),
      visual: { primitive: "fra14_context", description: accessibleDescription(raw.visual), syncCues: syncCuesFor(raw.studentFacing.ryanBeforeSubmitUtteranceIds) },
      mathematical_support: { hint_1: raw.studentFacing.hint || "" },
      scripts: {
        before_submit: textsFor(raw.studentFacing.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: correctIds[0] ? textFor(correctIds[0]) : "",
        on_incorrect_reaction: defaultIds[0] ? textFor(defaultIds[0]) : "",
        worked_explanation: workedExplanation(raw)
      },
      runtimeOutcome: {
        correctUtteranceIds: correctIds,
        incorrectDefaultUtteranceIds: defaultIds,
        errorSpecificUtteranceIds: specificIds,
        correctVisibleText: raw.feedback.correctVisibleText,
        incorrectDefaultVisibleText: raw.feedback.incorrectDefaultVisibleText,
        errorSpecificVisibleText: Object.assign({}, raw.feedback.errorSpecificVisibleText || {})
      },
      errorClassification: errorClassification(raw),
      canonicalQuestion: raw,
      primaryErrorFamily: "AMBIGUOUS"
    };
    return Object.assign(question, additions || {});
  }

  function buildHookQuestion() {
    const scene = approved.teachingScenes.find((item) => item.id === "HOOK");
    const interaction = scene.studentFacing.interaction;
    const mapped = labelsAndIds(interaction.options);
    const expected = interaction.options.find((option) => interaction.feedbackByOption[option.id].outcome === "correct");
    return {
      id: prefix("HOOK"),
      stage: "teaching",
      target: scene.authorOnly.purpose,
      assessmentIntent: "Make a non-scored prediction about the hidden finish.",
      prompt: scene.studentFacing.prompt,
      questionDetail: scene.studentFacing.title,
      response: { type: "single_choice", options: mapped.values, optionIds: mapped.optionIds, keyboard_submit: true },
      answer: { value: expected.label },
      policy: { scored: false, engagementOnly: true, answerLocksOnSubmit: true, hintPolicy: "none", solutionPolicy: "after_locked_submit" },
      model: modelFor(scene),
      visual: { primitive: "fra14_context", description: accessibleDescription(scene.visual) },
      scripts: {
        before_submit: textsFor(scene.studentFacing.ryanUtteranceIds),
        engagement_response: textsFor(interaction.commonRevealUtteranceIds),
        engagement_visible_by_id: Object.fromEntries(Object.entries(interaction.feedbackByOption).map(([id, feedback]) => [id, feedback.visibleFeedback]))
      },
      canonicalQuestion: scene,
      runtimeOutcome: { commonRevealUtteranceIds: [...interaction.commonRevealUtteranceIds] }
    };
  }

  function buildRepairQuestion(repair) {
    const base = {
      id: prefix(repair.id),
      stage: "repair",
      family: repair.errorFamily,
      evidenceFamily: repair.errorFamily,
      target: repair.authorOnlyTrigger,
      assessmentIntent: repair.authorOnlyTrigger,
      prompt: repair.supportedInteraction.prompt,
      questionDetail: "Quick repair",
      policy: { scored: false, answerLocksOnSubmit: true, hintPolicy: "none", solutionPolicy: "after_locked_submit", eligibleForIndependentMastery: false },
      model: modelFor(repair),
      visual: { primitive: "fra14_context", description: accessibleDescription(repair.visual), syncCues: syncCuesFor(repair.ryanUtteranceIds) },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), before_submit: [], on_correct_reaction: "", on_incorrect_reaction: "", worked_explanation: "" },
      runtimeOutcome: {
        correctUtteranceIds: [],
        incorrectDefaultUtteranceIds: [],
        errorSpecificUtteranceIds: {},
        correctVisibleText: "",
        incorrectDefaultVisibleText: "",
        errorSpecificVisibleText: {}
      },
      canonicalRepair: repair,
      primaryErrorFamily: repair.errorFamily,
      freshCheckId: prefix(repair.freshConfirmationId)
    };
    if (repair.id === "R-PART") {
      const mapped = labelsAndIds(repair.supportedInteraction.options);
      return Object.assign(base, {
        response: {
          type: "choice_two_step_integer",
          options: mapped.values,
          optionIds: mapped.optionIds,
          choiceLabel: "Choose the whole bracket",
          fields: [{ id: "onePart", label: "One equal part" }, { id: "whole", label: "Whole" }]
        },
        answer: {
          value: {
            choice: repair.supportedInteraction.options.find((option) => option.id === repair.supportedInteraction.correctOptionId)?.label,
            onePart: repair.supportedInteraction.thenAskOnePart,
            whole: repair.supportedInteraction.thenAskWhole
          }
        }
      });
    }
    if (repair.id === "R-ROLES") {
      return Object.assign(base, {
        response: { type: "ordered_sequence", options: [...repair.supportedInteraction.draggableOperations] },
        answer: { value: [...repair.supportedInteraction.correctOrder] },
        scripts: Object.assign({}, base.scripts, { worked_explanation: `1. ${repair.supportedInteraction.completedChain}` })
      });
    }
    return Object.assign(base, {
      response: { type: "two_step_integer", fields: [{ id: "onePart", label: "One equal part" }, { id: "whole", label: "Whole" }] },
      answer: { value: { onePart: repair.supportedInteraction.onePart, whole: repair.supportedInteraction.whole } }
    });
  }

  function buildQuestions() {
    return [
      buildHookQuestion(),
      ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.confirmations.map((question) => convertQuestion(question, { isFreshConfirmation: true })),
      ...approved.replacementFinals.map((question) => convertQuestion(question, { isReplacementFinal: true })),
      ...approved.repairs.map(buildRepairQuestion)
    ];
  }

  function responseChoiceId(question, response) {
    const value = response && typeof response === "object" ? response.choice : response;
    return question.response?.optionIds?.[String(value)] || String(value || "");
  }

  function integerEquals(left, right) {
    return /^-?\d+$/.test(String(left ?? "")) && Number(left) === Number(right);
  }

  function isCorrect(question, response) {
    const raw = question.canonicalQuestion;
    if (!raw?.response) {
      const answer = question.answer?.value;
      if (Array.isArray(answer)) return Array.isArray(response) && answer.length === response.length && answer.every((value, index) => value === response[index]);
      if (answer && typeof answer === "object") return Object.keys(answer).every((key) => key === "choice" ? responseChoiceId(question, response) === question.response.optionIds?.[answer.choice] : integerEquals(response?.[key], answer[key]));
      return integerEquals(response, answer) || String(response) === String(answer);
    }
    if (raw.response.kind === "numeric") return integerEquals(response, raw.answer);
    if (raw.response.kind === "two_step_numeric") return integerEquals(response?.onePart, raw.answer.onePart) && integerEquals(response?.whole, raw.answer.whole);
    if (raw.response.kind === "plan_and_numeric") return responseChoiceId(question, response) === raw.answer.planId && integerEquals(response?.whole, raw.answer.whole);
    if (raw.response.kind === "model_and_numeric") return responseChoiceId(question, response) === raw.answer.modelId && integerEquals(response?.whole, raw.answer.whole);
    return responseChoiceId(question, response) === raw.answer;
  }

  function classifyErrorFamily(question, response) {
    const raw = question.canonicalQuestion;
    if (!raw?.response) return question.primaryErrorFamily || "AMBIGUOUS";
    const choiceId = responseChoiceId(question, response);
    const whole = response && typeof response === "object" ? response.whole : response;
    const onePart = response && typeof response === "object" ? response.onePart : null;
    const choiceSignal = (raw.likelyErrorSignals || []).find((signal) => signal.responseId && signal.responseId === choiceId);
    if (choiceSignal) return choiceSignal.family;
    if (raw.response.kind === "two_step_numeric") {
      if (!integerEquals(onePart, raw.math.expectedOnePart)) return "ONE_PART_SUBSTEP";
      if (!integerEquals(whole, raw.math.expectedWhole)) {
        const exact = (raw.likelyErrorSignals || []).find((signal) => signal.numericValue !== undefined && Number(whole) === signal.numericValue);
        return exact?.family || "WHOLE_SUBSTEP";
      }
    }
    const exact = (raw.likelyErrorSignals || []).find((signal) => signal.numericValue !== undefined && Number(whole) === signal.numericValue);
    if (exact) return exact.family;
    if (["plan_and_numeric", "model_and_numeric"].includes(raw.response.kind)) {
      const correctChoice = raw.response.kind === "plan_and_numeric" ? raw.answer.planId : raw.answer.modelId;
      if (choiceId === correctChoice && !integerEquals(whole, raw.answer.whole)) return "ARITHMETIC_OR_UNIT_SLIP";
    }
    return "AMBIGUOUS";
  }

  function evaluateResponse(question, response) {
    const correct = isCorrect(question, response);
    const errorFamily = correct ? null : classifyErrorFamily(question, response);
    const outcome = question.runtimeOutcome || {};
    const utteranceIds = correct
      ? [...(outcome.correctUtteranceIds || [])]
      : [...(outcome.errorSpecificUtteranceIds?.[errorFamily] || outcome.incorrectDefaultUtteranceIds || [])];
    const visibleText = correct
      ? (outcome.correctVisibleText || "")
      : (outcome.errorSpecificVisibleText?.[errorFamily] || outcome.incorrectDefaultVisibleText || "");
    return { correct, errorFamily, utteranceIds, visibleText };
  }

  function validateQuestionModel(question) {
    const raw = question?.canonicalQuestion || question?.canonicalRepair;
    const math = raw?.math || question?.model?.math;
    const visual = raw?.visual || question?.model?.visual;
    const issues = [];
    if (!math || !visual) return ["FRA14 math or visual model is missing"];
    if (!Number.isInteger(math.denominator) || math.denominator < 2 || math.denominator > 12) issues.push("denominator must be from 2 to 12");
    if (!Number.isInteger(math.numerator) || math.numerator < 1 || math.numerator >= math.denominator) issues.push("numerator must be a proper positive part count");
    if (math.knownAmount % math.numerator !== 0) issues.push("known amount must divide exactly by numerator");
    if (math.expectedOnePart !== math.knownAmount / math.numerator) issues.push("one-part value is inconsistent");
    if (math.expectedWhole !== math.expectedOnePart * math.denominator) issues.push("whole value is inconsistent");
    if (visual.totalSections !== math.denominator) issues.push("bar section count does not match denominator");
    if (visual.knownSpanSections !== math.numerator) issues.push("known bracket does not match numerator");
    if (visual.equalSections !== true) issues.push("bar sections must be equal");
    return issues;
  }

  function shouldSkipF1(evidence) {
    return evidence?.g1OnePartFirstAttemptCorrect === true
      && evidence?.g1WholeFirstAttemptCorrect === true
      && evidence?.g2FirstAttemptCorrect === true
      && !evidence?.supportEscalated
      && !evidence?.centralError;
  }

  function evaluateFinalEvidence(records) {
    const correct = records.filter((record) => record.correct === true && record.firstAttemptCorrect !== false && !record.hintUsed);
    const reasoningOrContext = new Set(["money_context_final", "error_analysis_final", "implied_fraction_structure_final", "context_final", "reasoning_final"]);
    const central = new Set(["PART_AS_WHOLE", "DIVIDE_BY_DENOM_OR_ROLE_SWAP", "MULTIPLY_NUMERATOR", "STOP_AT_ONE_PART"]);
    const counts = {};
    records.forEach((record) => {
      if (central.has(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1;
    });
    const repeatedBlockingFamilies = Object.keys(counts).filter((family) => counts[family] >= 2);
    const reasoningOrContextSecure = correct.some((record) => reasoningOrContext.has(record.family));
    return {
      correctCount: correct.length,
      reasoningOrContextSecure,
      repeatedBlockingFamilies,
      masterySatisfied: records.length === 5 && correct.length >= 4 && reasoningOrContextSecure && !repeatedBlockingFamilies.length
    };
  }

  function selectReplacementIds(missedIds, fullRecovery) {
    if (fullRecovery) return ["RM1", "RM2", "RM3", "RM4", "RM5"].map(prefix);
    return (missedIds || []).map((id) => prefix(`RM${unprefix(id).replace(/^M/, "")}`));
  }

  function sceneVisual(sceneId) {
    if (sceneId === "T4") return {
      kind: "cable_bar", totalSections: 5, knownSpanSections: 1, equalSections: true,
      knownAmountLabel: "1 part = 9 m", wholeLabel: "5 parts = ?", showKnownBracket: true, showWholeBracket: true, contextDecoration: "minimal"
    };
    if (sceneId === "HANDOFF") return {
      kind: "generic_bar", totalSections: 5, knownSpanSections: 3, equalSections: true,
      knownAmountLabel: "known parts", wholeLabel: "whole", showKnownBracket: true, showWholeBracket: true, contextDecoration: "minimal"
    };
    return {
      kind: "route_bar", totalSections: 4, knownSpanSections: 3, equalSections: true,
      knownAmountLabel: "24 km", wholeLabel: "whole route = ?", hiddenRemainingSections: sceneId === "T3" ? 0 : 1,
      showKnownBracket: true, showWholeBracket: true, contextDecoration: "minimal"
    };
  }

  function teachingStep(scene, nextId, hookQuestion) {
    const visual = scene.visual || sceneVisual(scene.id);
    const utteranceIds = [...(scene.studentFacing.ryanUtteranceIds || [])];
    const cueUtteranceIds = [...utteranceIds, ...(scene.studentFacing.interaction?.commonRevealUtteranceIds || [])];
    const cues = syncCuesFor(cueUtteranceIds);
    return {
      id: scene.id,
      purpose: scene.authorOnly.purpose,
      scene: {
        display_title: scene.studentFacing.title || scene.studentFacing.stageLabel,
        initial_state: accessibleDescription(visual),
        objects: [visual.kind],
        model: {
          context: "fra14_whole_from_part",
          sceneId: scene.id,
          mode: "teaching",
          math: scene.math || (scene.id === "T4" ? { knownAmount: 9, numerator: 1, denominator: 5, expectedOnePart: 9, expectedWhole: 45, unitSymbol: "m" } : { knownAmount: 24, numerator: 3, denominator: 4, expectedOnePart: 8, expectedWhole: 32, unitSymbol: "km" }),
          visual,
          visibleLabels: scene.studentFacing.visibleLabels || [],
          accessibleDescription: accessibleDescription(visual)
        }
      },
      narration: { script: textsFor(utteranceIds), utterance_ids: utteranceIds, sync_cues: cues },
      animation_timeline: cues,
      learner_interaction: hookQuestion ? { question_ref: hookQuestion.id } : { type: "continue" },
      next_step: nextId
    };
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA14 canonical source was not loaded.");
    const runtimeIssues = validateRuntimeContract();
    if (runtimeIssues.length) throw new Error(`FRA14 runtime contract failed: ${runtimeIssues.join("; ")}`);
    const questionBank = buildQuestions();
    questionBank.filter((question) => question.model?.context === "fra14_whole_from_part").forEach((question) => {
      const issues = validateQuestionModel(question);
      if (issues.length) throw new Error(`${question.id}: ${issues.join("; ")}`);
    });
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const scenes = approved.teachingScenes;
    const sceneNext = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = scenes.map((scene) => teachingStep(scene, sceneNext[scene.id], scene.id === "HOOK" ? question("HOOK") : null));

    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const transferNext = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const item = question(id);
      const intro = id === "I1" ? textsFor(approved.adaptiveRoute.independentIntroUtteranceIds) : item.scripts.before_submit;
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: intro,
        visual_before_answer: item.prompt,
        correct_next: transferNext[id],
        recovery_ref: null
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Only canonical FRA14 confirmations and repairs are used.", between_question_transition: "" };

    const repairByFamily = Object.fromEntries(approved.repairs.map((repair) => [repair.errorFamily, prefix(repair.id)]));
    const freshByFamily = Object.fromEntries(approved.repairs.map((repair) => [repair.errorFamily, [prefix(repair.freshConfirmationId)]]));
    spec.lesson.exit = {
      intro_script: textsFor(approved.adaptiveRoute.finalIntroUtteranceIds),
      primary_question_refs: approved.adaptiveRoute.finalQuestions.map(prefix),
      confirmation_question_refs: [...approved.confirmations.map((item) => prefix(item.id)), ...approved.replacementFinals.map((item) => prefix(item.id))],
      repair_by_primary: {},
      post_repair_retest_refs: approved.replacementFinals.map((item) => prefix(item.id)),
      mastery_policy: { profile: "fra14_five_item", secureMinimum: 4, totalItems: 5, requireReasoningOrContext: true, blockRepeatedCentralMisconception: true }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra14_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: Object.fromEntries(Object.entries(approved.adaptiveRoute.hintConfirmations).map(([id, confirmation]) => [prefix(id), prefix(confirmation)])),
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: Object.assign(freshByFamily, {
        ARITHMETIC_OR_UNIT_SLIP: [prefix("C-ARITHMETIC")],
        AMBIGUOUS: [prefix("C-ARITHMETIC")],
        unknown: [prefix("C-ARITHMETIC")]
      }),
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.adaptiveRoute.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building the whole-from-part method", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
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
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra14_context", equal_sections: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra14_context", "integer_input", "two_step_integer", "choice_and_integer", "single_choice", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "FRA14-HANDOFF-V1",
      engine_profile: "fra14",
      exact_runtime_copy: true,
      runtime_applied: true,
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn - support nearby", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      route_contract: approved.adaptiveRoute,
      migration: { resetIncompatibleState: true, preserveSoundPreference: true, preserveCompletionStatusInHistory: true, archivePreviousAttempt: true, resetTo: "HOOK" },
      capabilities: { whole_from_fractional_part: true, component_evidence: true, optional_hints: true, hint_evidence: true, post_lock_working: true, targeted_repairs: true, fresh_confirmations: true, replacement_finals: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra14Canonical = {
    apply,
    buildQuestions,
    classifyErrorFamily,
    evaluateFinalEvidence,
    evaluateResponse,
    runtimeCopy,
    selectReplacementIds,
    shouldSkipF1,
    textFor,
    validateQuestionModel,
    validateRuntimeContract
  };
})();
