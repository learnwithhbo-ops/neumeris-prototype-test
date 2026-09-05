(function () {
  "use strict";

  const LESSON_ID = "FRA-17";
  const CONTENT_VERSION = "fra17-same-denominator-addition-v1";
  const source = window.RevilyFra17V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = {
    DEN_ADD: prefix("R-DEN-ADD"),
    DEN_MOVE: prefix("R-DEN-MOVE"),
    NUM_COPY: prefix("R-NUM"),
    VIS_COUNT: prefix("R-VIS"),
    ARITHMETIC: prefix("R-ARITHMETIC")
  };
  const recheckByFamily = {
    DEN_ADD: [prefix("R-DEN-ADD-RECHECK"), prefix("REC-2-DIRECT"), prefix("REC-4-DIRECT")],
    DEN_MOVE: [prefix("R-DEN-MOVE-RECHECK"), prefix("REC-2-DIRECT"), prefix("REC-4-DIRECT")],
    NUM_COPY: [prefix("R-NUM-RECHECK"), prefix("REC-2-DIRECT"), prefix("REC-4-DIRECT")],
    VIS_COUNT: [prefix("R-VIS-RECHECK"), prefix("REC-4-VIS")],
    ARITHMETIC: [prefix("R-ARITHMETIC-RECHECK"), prefix("REC-2-DIRECT"), prefix("REC-4-DIRECT")]
  };

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA-17 runtime utterance: ${id}`);
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
    return question.response.options.find((option) => option.id === optionId)?.label || optionId;
  }

  function responseFor(question) {
    const response = question.response || {};
    if (question.id === "R-VIS-SUPPORTED") {
      return {
        type: "fra17_cell_tap_integer",
        fixedDenominator: response.fixedDenominator,
        totalCells: question.visual.denominator,
        selectedCells: question.visual.expectedNumerator,
        input_label: "Total selected cells",
        keyboard_submit: true
      };
    }
    if (response.kind === "integer_input") {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: "numerator",
        fixedDenominator: response.fixedDenominator,
        input_label: "Missing numerator",
        keyboard_submit: true
      };
    }
    if (response.kind === "fraction_input") {
      return {
        type: "fraction",
        accept_equivalent_notation: false,
        partLabel: "Numerator",
        wholeLabel: "Original denominator",
        unitLabel: response.unitLabel || null,
        keyboard_submit: true
      };
    }
    if (["single_choice", "model_choice"].includes(response.kind)) {
      const values = response.options.map((option) => option.label);
      const optionModels = response.kind === "model_choice"
        ? response.options.map((option) => {
            const match = option.label.match(/(\d+)\s*\/\s*(\d+)/);
            return match ? { totalParts: Number(match[2]), selectedParts: Number(match[1]), shape: "strip" } : null;
          })
        : [];
      return {
        type: "single_choice",
        options: values,
        optionIds: Object.fromEntries(response.options.map((option) => [option.label, option.id])),
        optionModels,
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA-17 response kind ${response.kind}`);
  }

  function answerFor(question) {
    if (question.answer.kind === "option") return optionLabel(question, question.answer.optionId);
    const value = question.answer.value;
    if (question.response.kind === "integer_input") return String(value.numerator);
    return { n: String(value.numerator), d: String(value.denominator) };
  }

  function defaultErrorFamily(question) {
    if (["VIS", "MATCH"].includes(question.family)) return "VIS_COUNT";
    if (["REASON", "ERROR"].includes(question.family)) return "DEN_ADD";
    return "ARITHMETIC";
  }

  function runtimeOutcome(question) {
    const feedback = question.feedback || {};
    return {
      correctUtteranceIds: [...(feedback.correctUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(feedback.incorrectDefaultUtteranceIds || [])],
      errorSpecificUtteranceIdsByFamily: Object.fromEntries(Object.entries(feedback.errorSpecificBranches || {}).map(([family, ids]) => [family, [...ids]])),
      workedCheckUtteranceIds: [...(question.workedCheck?.utteranceIds || [])]
    };
  }

  function convertQuestion(question, overrides) {
    const outcome = runtimeOutcome(question);
    const correctLine = textsFor(outcome.correctUtteranceIds)[0] || "";
    const incorrectLine = textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "";
    const hintLine = textsFor(question.hintUtteranceIds || [])[0] || "";
    const visibleSteps = question.workedCheck?.visibleSteps || [];
    const visual = question.visual || {};
    const result = visual.resultFraction || question.answer?.value || {};
    const runtimeUtteranceIds = [
      ...(question.ryanBeforeSubmitUtteranceIds || []),
      ...(question.hintUtteranceIds || []),
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectDefaultUtteranceIds,
      ...Object.values(outcome.errorSpecificUtteranceIdsByFamily).flat(),
      ...outcome.workedCheckUtteranceIds
    ];
    return Object.assign({
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: question.authorOnlyAssessmentIntent,
      assessmentIntent: question.authorOnlyAssessmentIntent,
      evidenceFamily: question.family,
      prompt: question.prompt,
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy === "optional" ? "optional" : "none",
        solutionPolicy: question.policy?.solutionPolicy || "after_response",
        scored: question.policy?.scored === true,
        answerLocksOnSubmit: question.policy?.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.requiresFreshNoHintConfirmationIfHintUsed === true,
        maxAttemptsBeforeRepair: question.policy?.maxAttemptsBeforeResolution || 2,
        countsAsIndependentEvidence: ["independent", "final", "recovery"].includes(question.stage) && !String(question.id).endsWith("-SUPPORTED")
      },
      attempt_policy: { submit_label: question.response?.submitLabel || "Check answer" },
      model: {
        context: "fra17",
        questionId: question.id,
        totalParts: Number(visual.denominator || result.denominator || 1),
        selectedParts: Number(result.numerator || visual.expectedNumerator || 0),
        visual,
        accessibleDescription: visual.accessibleDescriptionBeforeSubmit || "",
        workedSteps: [...visibleSteps]
      },
      visual: { primitive: "fra17_context", action: "focus", description: question.prompt },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds || []),
        hint: hintLine,
        on_correct_reaction: correctLine,
        on_correct_math: "",
        on_incorrect_reaction: incorrectLine,
        on_incorrect_attempt_1: incorrectLine,
        on_incorrect_attempt_2: incorrectLine,
        worked_explanation: visibleSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: [...visibleSteps],
        worked_narration: textsFor(outcome.workedCheckUtteranceIds)
      },
      mathematical_support: hintLine ? { hint_1: hintLine } : {},
      runtimeOutcome: outcome,
      runtimeUtteranceIds,
      primaryErrorFamily: defaultErrorFamily(question),
      errorFamily: defaultErrorFamily(question),
      errorClassification: { fallback: defaultErrorFamily(question), requiresRepeatedEvidence: true },
      recovery_item_ref: repairByFamily[defaultErrorFamily(question)] || null,
      canonicalQuestion: question
    }, overrides || {});
  }

  function convertRepair(repair) {
    return {
      id: prefix(repair.id),
      canonicalQuestionId: repair.id,
      stage: "repair",
      target: `Repair ${repair.family}`,
      assessmentIntent: `repair_${repair.family.toLowerCase()}`,
      evidenceFamily: repair.family,
      prompt: "Review the fixed piece size",
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: {
        context: "fra17",
        questionId: repair.id,
        totalParts: repair.visual.denominator,
        selectedParts: repair.visual.expectedNumerator,
        visual: repair.visual,
        accessibleDescription: repair.visual.accessibleDescriptionBeforeSubmit || "",
        workedSteps: []
      },
      visual: { primitive: "fra17_context", action: "repair", description: "A targeted same-denominator repair." },
      scripts: { reteach: textsFor(repair.teachingUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.teachingUtteranceIds],
      supportedInteractionId: prefix(repair.supportedInteraction.id),
      freshCheckId: prefix(repair.freshIndependentRecheck.id),
      primaryErrorFamily: repair.family,
      errorClassification: { fallback: repair.family }
    };
  }

  function buildHookQuestion() {
    const hook = approved.conceptualTeaching.scenes.find((scene) => scene.id === "HOOK");
    const labels = Object.fromEntries(hook.interaction.options.map((option) => [option.id, option.label]));
    return {
      id: prefix("HOOK-CHOICE"),
      canonicalQuestionId: "HOOK-CHOICE",
      stage: "opening",
      target: "Notice that the eight-part whole did not change",
      assessmentIntent: "unscored_partition_prediction",
      evidenceFamily: "opening_choice",
      prompt: hook.interaction.prompt,
      response: { type: "single_choice", options: hook.interaction.options.map((option) => option.label), keyboard_submit: true },
      answer: { value: labels[hook.interaction.correctOptionId] },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Show what happened" },
      model: { context: "fra17", questionId: "HOOK-CHOICE", totalParts: 8, selectedParts: 5, visual: hook.visual, accessibleDescription: hook.visual.accessibleDescriptionBeforeSubmit },
      visual: { primitive: "fra17_context", action: "choice", description: hook.interaction.prompt },
      scripts: {
        engagement_response_by_value: Object.fromEntries(Object.values(labels).map((label) => [label, textsFor(hook.interaction.commonRevealUtteranceIds)])),
        engagement_detail: "The partition stays in eighths.",
        engagement_label: "Your prediction"
      },
      runtimeOutcome: { responseUtteranceIdsByValue: Object.fromEntries(Object.values(labels).map((label) => [label, [...hook.interaction.commonRevealUtteranceIds]])) },
      runtimeUtteranceIds: [...hook.interaction.commonRevealUtteranceIds],
      primaryErrorFamily: "UNKNOWN",
      errorClassification: { fallback: "UNKNOWN", requiresRepeatedEvidence: false }
    };
  }

  function allApprovedQuestions() {
    return [
      ...approved.guidedPractice,
      ...approved.fadedPractice,
      ...approved.independentPractice,
      ...approved.confirmations,
      ...approved.finalCheck.items,
      ...approved.repairs.flatMap((repair) => [repair.supportedInteraction, repair.freshIndependentRecheck]),
      ...approved.adaptivity.recoveryProfiles.flatMap((profile) => profile.deterministicFallbackItems)
    ];
  }

  function buildQuestions() {
    return [buildHookQuestion(), ...allApprovedQuestions().map((question) => convertQuestion(question)), ...approved.repairs.map(convertRepair)];
  }

  function sceneCues(scene) {
    return (scene.timedVisualEvents || []).map((event) => ({
      id: event.id,
      utteranceId: event.utteranceId,
      cue: event.anchorText,
      anchorText: event.anchorText,
      action: event.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      target: event.targetIds,
      accessibleLabel: scene.visual.accessibleDescriptionBeforeSubmit
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: scene.authorOnlyPurpose,
      scene: {
        display_title: scene.title,
        initial_state: scene.title,
        objects: [scene.visual.kind],
        model: { context: "fra17", sceneId: scene.id, visual: scene.visual }
      },
      narration: { script: textsFor(scene.utteranceIds), utterance_ids: [...scene.utteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      next_step: nextId
    };
  }

  function submittedFraction(question, response) {
    const visual = question.canonicalQuestion?.visual || question.model?.visual || {};
    if (question.response.type === "integer") return { numerator: Number(response), denominator: Number(visual.denominator) };
    if (question.response.type === "fra17_cell_tap_integer") return { numerator: Number(response?.numerator), denominator: Number(visual.denominator) };
    if (question.response.type === "fraction") return { numerator: Number(response?.n), denominator: Number(response?.d) };
    return null;
  }

  function fractionsEquivalent(left, right) {
    return Boolean(left && right && left.denominator && right.denominator && left.numerator * right.denominator === right.numerator * left.denominator);
  }

  function evaluateResponse(question, response) {
    if (questionId(question) === "HOOK-CHOICE") {
      const correct = String(response) === String(question.answer?.value);
      return { correct, valueCorrect: correct, formCorrect: correct, errorFamily: "UNKNOWN", visibleText: visibleFeedback(question, response, correct) };
    }
    const canonical = question.canonicalQuestion || {};
    if (canonical.answer?.kind === "option") {
      const expected = optionLabel(canonical, canonical.answer.optionId);
      const correct = String(response) === String(expected);
      return { correct, valueCorrect: correct, formCorrect: correct, errorFamily: correct ? "UNKNOWN" : classifyErrorFamily(question, response), visibleText: visibleFeedback(question, response, correct) };
    }
    const expected = canonical.answer?.value;
    const submitted = submittedFraction(question, response);
    const valueCorrect = fractionsEquivalent(submitted, expected);
    const formCorrect = Boolean(submitted && expected && submitted.numerator === expected.numerator && submitted.denominator === expected.denominator);
    const tapped = Array.isArray(response?.tapped) ? [...new Set(response.tapped.map(String))].sort((a, b) => Number(a) - Number(b)) : [];
    const expectedTapped = Array.from({ length: Number(question.response.selectedCells) || 0 }, (_, index) => String(index));
    const tapsCorrect = question.response.type !== "fra17_cell_tap_integer"
      || (tapped.length === expectedTapped.length && tapped.every((value, index) => value === expectedTapped[index]));
    const correct = valueCorrect && formCorrect && tapsCorrect;
    return { correct, valueCorrect, formCorrect, errorFamily: correct ? "UNKNOWN" : classifyErrorFamily(question, response), visibleText: visibleFeedback(question, response, correct) };
  }

  function classifyErrorFamily(question, response) {
    const canonical = question.canonicalQuestion || {};
    if (canonical.answer?.kind === "option") {
      const selectedId = canonical.response.options.find((option) => option.label === response)?.id;
      if ((questionId(question) === "M4" && selectedId === "A") || (questionId(question) === "F2" && selectedId === "D") || (questionId(question).includes("REASON") && selectedId === "C")) return "DEN_ADD";
      const label = String(response || "");
      if (/\/(?:18|20|22|24|30|34|38)\b/.test(label)) return "DEN_ADD";
      return "UNKNOWN";
    }
    const submitted = submittedFraction(question, response);
    const visual = canonical.visual || question.model?.visual || {};
    const a = Number(visual.firstNumerator ?? visual.sourceFractions?.[0]?.numerator);
    const b = Number(visual.secondNumerator ?? visual.sourceFractions?.[1]?.numerator);
    const d = Number(visual.denominator ?? visual.sourceFractions?.[0]?.denominator);
    if (!submitted || !Number.isInteger(submitted.numerator) || !Number.isInteger(submitted.denominator) || submitted.denominator === 0) return "MALFORMED";
    if (submitted.numerator === a + b && submitted.denominator === d * 2) return "DEN_ADD";
    if (submitted.denominator === d && [a, b].includes(submitted.numerator)) return "NUM_COPY";
    if (fractionsEquivalent(submitted, { numerator: a + b, denominator: d }) && submitted.denominator !== d) return "FORM_MISMATCH";
    if (question.response.type === "fra17_cell_tap_integer" && (!Array.isArray(response?.tapped) || new Set(response.tapped.map(String)).size !== Number(question.response.selectedCells))) return "VIS_COUNT";
    if (submitted.denominator === d) return ["VIS", "MATCH"].includes(canonical.family) ? "VIS_COUNT" : "ARITHMETIC";
    return "UNKNOWN";
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const outcome = question.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    const family = classifyErrorFamily(question, response);
    const authoredFamily = family === "FORM_MISMATCH" && outcome.errorSpecificUtteranceIdsByFamily?.DEN_ADD ? "DEN_ADD" : family;
    return [...(outcome.errorSpecificUtteranceIdsByFamily?.[authoredFamily] || outcome.incorrectDefaultUtteranceIds || [])];
  }

  function visibleFeedback(question, response, correct) {
    const ids = selectOutcomeUtteranceIds(question, response, correct);
    if (ids.length) return textFor(ids[0]);
    if (correct) return "That matches the same-denominator structure.";
    const evaluation = question.canonicalQuestion?.answer?.kind === "fraction" ? evaluateFormOnly(question, response) : null;
    if (evaluation?.valueCorrect && !evaluation.formCorrect) return `That is the same value, but this probe requires the original denominator ${question.canonicalQuestion.answer.value.denominator}.`;
    if (question.response.type === "fra17_cell_tap_integer") return "Tap each selected cell once, leave empty cells untapped, then enter the count.";
    return "Keep the original piece size and combine both numerator counts.";
  }

  function evaluateFormOnly(question, response) {
    const expected = question.canonicalQuestion?.answer?.value;
    const submitted = submittedFraction(question, response);
    return {
      valueCorrect: fractionsEquivalent(submitted, expected),
      formCorrect: Boolean(submitted && expected && submitted.numerator === expected.numerator && submitted.denominator === expected.denominator)
    };
  }

  function requiresRepeatedEvidence(question, response) {
    return !["MALFORMED", "UNKNOWN", "FORM_MISMATCH"].includes(classifyErrorFamily(question, response));
  }

  function shouldSkipF1(evidence) {
    const blocked = new Set(["DEN_ADD", "NUM_COPY", "VIS_COUNT"]);
    return evidence?.g1?.firstAttemptCorrect === true
      && evidence?.g2?.firstAttemptCorrect === true
      && !evidence.g1.hintOpenedBeforeSubmit
      && !evidence.g2.hintOpenedBeforeSubmit
      && !evidence.g1.supportEscalated
      && !evidence.g2.supportEscalated
      && !(evidence.centralErrorSignals || []).some((family) => blocked.has(family));
  }

  function evaluateFinalEvidence(records, repeatedUnresolved) {
    const correct = (records || []).filter((record) => record.firstAttemptCorrect && record.countsAsIndependentEvidence);
    const hasM1 = correct.some((record) => unprefix(record.questionId) === "M1");
    const conceptual = correct.some((record) => ["M2", "M3", "M4"].includes(unprefix(record.questionId)));
    const masterySatisfied = correct.length >= 3 && hasM1 && conceptual && !repeatedUnresolved;
    return { correctCount: correct.length, hasM1, conceptual, repeatedUnresolved: Boolean(repeatedUnresolved), masterySatisfied };
  }

  function routeFinal(records, repeatedUnresolved) {
    const evaluation = evaluateFinalEvidence(records, repeatedUnresolved);
    if (evaluation.masterySatisfied) return "finish_candidate";
    return evaluation.correctCount >= 2 ? "targeted_repair_then_two_item_check" : "targeted_repair_then_fresh_four_item_final";
  }

  function selectRecoveryQuestionIds(desiredCount, exclusions) {
    const blocked = new Set((exclusions || []).map((id) => id.startsWith(`${LESSON_ID}-`) ? id : prefix(id)));
    if (desiredCount === 2) {
      const direct = ["REC-2-DIRECT", "REC-4-DIRECT", "R-DEN-ADD-RECHECK", "R-ARITHMETIC-RECHECK"].map(prefix).find((id) => !blocked.has(id));
      const conceptual = ["REC-2-REASON", "REC-4-ERROR", "REC-4-VIS", "REC-4-CONTEXT", "R-VIS-RECHECK"].map(prefix).find((id) => !blocked.has(id));
      return [direct, conceptual].filter(Boolean);
    }
    const preferred = (desiredCount === 2
      ? ["REC-2-DIRECT", "REC-2-REASON"]
      : ["REC-4-DIRECT", "REC-4-VIS", "REC-4-CONTEXT", "REC-4-ERROR"]).map(prefix);
    const fallback = desiredCount === 2
      ? ["REC-4-ERROR", "REC-4-VIS", "REC-4-CONTEXT", "REC-4-DIRECT", "R-DEN-ADD-RECHECK"]
      : ["REC-2-DIRECT", "REC-2-REASON", "R-DEN-ADD-RECHECK", "R-VIS-RECHECK"];
    const pool = [...preferred, ...fallback.map(prefix)];
    const selected = [];
    pool.forEach((id) => {
      if (selected.length < desiredCount && !blocked.has(id) && !selected.includes(id)) selected.push(id);
    });
    return selected;
  }

  function validateRuntimeContract() {
    const issues = [];
    const ownerByText = new Map();
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      const text = String(entry?.text || "").trim();
      if (!text) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
      if (ownerByText.has(text.toLowerCase())) issues.push(`${id} duplicates ${ownerByText.get(text.toLowerCase())}`);
      ownerByText.set(text.toLowerCase(), id);
    });
    approved.conceptualTeaching.scenes.flatMap((scene) => scene.timedVisualEvents || []).forEach((event) => {
      const entry = runtimeCopy[event.utteranceId];
      if (!entry) issues.push(`${event.id} points to missing ${event.utteranceId}`);
      else if (!entry.text.toLowerCase().includes(event.anchorText.toLowerCase())) issues.push(`${event.id} has an invalid anchor`);
    });
    return issues;
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA-17 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA-17 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const byRawId = (id) => questionBank.find((question) => question.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION, estimated_minutes: approved.estimatedMinutes });
    spec.learning_objective = "Add fractions with the same denominator by combining numerator counts while preserving the original denominator as the fixed piece size.";
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const hook = approved.conceptualTeaching.scenes.find((scene) => scene.id === "HOOK");
    const hookChoice = {
      id: "HOOK-CHOICE",
      purpose: "Resolve the eight-section conflict",
      scene: { display_title: hook.title, initial_state: hook.interaction.prompt, objects: [hook.visual.kind], model: { context: "fra17", sceneId: "HOOK-CHOICE", visual: hook.visual } },
      narration: { script: [], utterance_ids: [], sync_cues: [] },
      animation_timeline: [],
      learner_interaction: { question_ref: prefix("HOOK-CHOICE") },
      next_step: "T1"
    };
    const nextByScene = { T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = [teachingStep(hook, "HOOK-CHOICE"), hookChoice, ...approved.conceptualTeaching.scenes.filter((scene) => scene.id !== "HOOK").map((scene) => teachingStep(scene, nextByScene[scene.id]))];

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

    const confirmationIds = ["C-I1", "C-I2", ...approved.repairs.map((repair) => repair.freshIndependentRecheck.id), ...approved.adaptivity.recoveryProfiles.flatMap((profile) => profile.deterministicFallbackItems.map((item) => item.id))].map(prefix);
    spec.lesson.exit = {
      intro_script: [textFor("FINAL.INTRO")],
      primary_question_refs: ["M1", "M2", "M3", "M4"].map(prefix),
      confirmation_question_refs: confirmationIds,
      mastery_policy: {
        profile: "fra17_four_item",
        secureMinimum: 3,
        totalItems: 4,
        requireM1: true,
        requireConceptual: true,
        blockRepeatedDenominatorMisconception: true,
        repeatedCentralFamilies: ["DEN_ADD", "DEN_MOVE"],
        nearSecureRecoveryCount: 2,
        insecureRecoveryCount: 4,
        repairCycleCapPerFamily: 1
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra17_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("R-DEN-ADD-RECHECK"),
        [prefix("F2")]: prefix("REC-2-REASON"),
        [prefix("I1")]: prefix("C-I1"),
        [prefix("I2")]: prefix("C-I2")
      },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: Object.assign({ UNKNOWN: [prefix("R-ARITHMETIC-RECHECK")] }, recheckByFamily)
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: [textFor("COMPLETE.1")], buttons: ["Back to Fractions", "Start again"] },
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
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra17_context", same_whole: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra17_context", "fraction_input", "integer_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "fra17-owner-approved-v1",
      engine_profile: "fra17",
      runtime_applied: true,
      owner_review_status: "implementation_candidate_ready_for_review",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with Ryan", faded: "Support is fading", independent: "Your turn", repair: "Targeted support", exit: "Final check", completion: "Lesson complete" },
      route_contract: approved.adaptivity,
      capabilities: { exact_fraction_form: true, live_ryan_word_boundaries: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, targeted_repairs: true, supported_repair_interactions: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra17Canonical = {
    apply,
    buildQuestions,
    classifyErrorFamily,
    evaluateFinalEvidence,
    evaluateResponse,
    repairByFamily,
    requiresRepeatedEvidence,
    routeFinal,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    selectRecoveryQuestionIds,
    shouldSkipF1,
    textFor,
    validateRuntimeContract,
    visibleFeedback
  };
})();
