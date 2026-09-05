(function () {
  "use strict";

  const LESSON_ID = "FRA-23";
  const CONTENT_VERSION = "fra23-codex-handoff-v1-runtime-copy-1";
  const approved = window.RevilyFra23Approved;
  const runtimeCopy = window.FRA23_RUNTIME_COPY || {};
  const lesson = approved?.lesson;
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");
  const byId = (items) => Object.fromEntries((items || []).map((item) => [item.id, item]));

  const canonicalScenes = byId(lesson?.teachingScenes);
  const blockingFamilies = new Set(["M-BOTH", "M-ADD", "M-DEN", "M-INTEGER"]);

  const repairByFamily = {
    "M-BOTH": prefix("R-BOTH"),
    "M-ADD": prefix("R-ADD"),
    "M-DEN": prefix("R-DEN"),
    "M-INTEGER": prefix("R-INTEGER"),
    "M-ARITH": prefix("ARITHMETIC_FACT_CHECK"),
    UNKNOWN: prefix("D-STRUCTURE")
  };

  const repairSupportedByFamily = {
    "M-BOTH": prefix("R-BOTH-S"),
    "M-ADD": prefix("R-ADD-S"),
    "M-DEN": prefix("R-DEN-S"),
    "M-INTEGER": prefix("R-INT-S")
  };

  const freshChecksByFamily = {
    "M-BOTH": [prefix("R-BOTH-C"), prefix("C-METHOD")],
    "M-ADD": [prefix("R-ADD-C"), prefix("C-DIRECT")],
    "M-DEN": [prefix("R-DEN-C"), prefix("C-VIS")],
    "M-INTEGER": [prefix("R-INT-C"), prefix("C-ORDER")],
    "M-ARITH": [prefix("A-FACT-2"), prefix("A-FACT-3")],
    UNKNOWN: [prefix("C-METHOD")]
  };

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA23 runtime utterance: ${id}`);
    return entry;
  }

  function textFor(id) {
    return runtimeEntry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function responseFor(question) {
    const kind = question.response.kind;
    if (kind === "fraction_input") {
      return { type: "fraction", accept_equivalent_notation: true, keyboard_submit: true };
    }
    if (kind === "fixed_denominator_fraction_input") {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: "numerator",
        fixedDenominator: question.response.lockedDenominator,
        input_label: "Numerator",
        keyboard_submit: true
      };
    }
    if (kind === "single_integer_input") {
      return { type: "integer", input_label: "Your answer", keyboard_submit: true };
    }
    if (kind === "multiple_choice") {
      const options = question.visual?.options || [];
      return {
        type: "single_choice",
        options: options.map((option) => option.text),
        optionIds: Object.fromEntries(options.map((option) => [option.text, option.id])),
        keyboard_submit: true
      };
    }
    if (kind === "tap_groups_then_fixed_denominator_input") {
      return {
        type: "fra23_group_tap_fraction",
        groupCount: question.visual?.groupCount || question.values?.integerFactor || 1,
        piecesPerGroup: question.visual?.piecesPerGroup || question.values?.numerator || 1,
        fixedDenominator: question.response.lockedDenominator,
        keyboard_submit: true
      };
    }
    if (kind === "unit_choice_then_fixed_denominator_input") {
      return {
        type: "fra23_unit_fraction",
        unitOptions: question.visual?.unitChoices || ["thirds", "sixths", "twelfths"],
        correctUnit: question.response.correctUnit,
        fixedDenominator: question.response.lockedDenominator,
        keyboard_submit: true
      };
    }
    if (kind === "drag_badge_then_fixed_denominator_input") {
      return {
        type: "fra23_badge_fraction",
        placementOptions: question.visual?.placementOptions || ["numerator", "denominator", "six_groups"],
        requiredBadgePlacement: question.response.requiredBadgePlacement,
        fixedDenominator: question.response.lockedDenominator,
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA23 response kind ${kind}`);
  }

  function answerFor(question) {
    if (question.answer.kind === "integer") return String(question.answer.value);
    if (question.answer.kind === "option") {
      return (question.visual?.options || []).find((option) => option.id === question.answer.optionId)?.text || question.answer.optionId;
    }
    if (["tap_groups_then_fixed_denominator_input", "unit_choice_then_fixed_denominator_input", "drag_badge_then_fixed_denominator_input"].includes(question.response.kind)) {
      return {
        numerator: String(question.answer.numerator),
        denominator: String(question.answer.denominator),
        tappedGroups: question.response.kind === "tap_groups_then_fixed_denominator_input" ? question.visual?.groupCount || question.values?.integerFactor : undefined,
        unit: question.response.correctUnit,
        placement: question.response.requiredBadgePlacement
      };
    }
    if (question.response.kind === "fixed_denominator_fraction_input") return String(question.answer.numerator);
    return { n: String(question.answer.numerator), d: String(question.answer.denominator) };
  }

  function outcomeFor(question) {
    return {
      correctUtteranceIds: [...(question.feedback.correctUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(question.feedback.incorrectDefaultUtteranceIds || [])],
      errorSpecificUtteranceIdsByFamily: Object.fromEntries(Object.entries(question.feedback.errorSpecificUtteranceIdsByFamily || {}).map(([family, ids]) => [family, [...ids]])),
      workedCheckUtteranceIds: [...(question.workedCheck?.ryanUtteranceIds || [])]
    };
  }

  function convertCue(cue) {
    return {
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/\./g, "-"),
      target: [cue.id],
      accessibleLabel: cue.reducedMotionAction
    };
  }

  function convertQuestion(question) {
    const finalLike = ["final", "recovery_mini_check", "alternate_final"].includes(question.stage);
    const preIds = [...(question.ryanBeforeSubmitUtteranceIds || [])];
    const outcome = outcomeFor(question);
    const workedSteps = [...(question.workedCheck?.visibleSteps || [])];
    const runtimeUtteranceIds = [
      ...preIds,
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectDefaultUtteranceIds,
      ...Object.values(outcome.errorSpecificUtteranceIdsByFamily).flat(),
      ...outcome.workedCheckUtteranceIds
    ];
    const hintPolicy = question.hint ? "optional" : "none";
    return {
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
        hintPolicy,
        solutionPolicy: finalLike ? "after_locked_submit" : "after_response",
        scored: question.policy.scored !== false,
        answerLocksOnSubmit: finalLike || question.policy.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: Boolean(question.hint),
        maxAttemptsBeforeRepair: finalLike ? 1 : 2,
        countsAsIndependentEvidence: ["independent", "final", "recovery_mini_check", "alternate_final"].includes(question.stage),
        countsTowardMastery: question.policy.countsTowardMastery === true
      },
      attempt_policy: { submit_label: question.response.submitLabel || "Check answer" },
      model: {
        context: "fra23",
        questionId: question.id,
        canonicalQuestion: question,
        values: question.values || {},
        visual: question.visual,
        workedSteps,
        accessibleDescription: question.visual?.accessibleDescriptionPreSubmit || ""
      },
      visual: { primitive: "fra23_context", action: "focus", description: question.prompt, syncCues: [] },
      scripts: {
        before_submit: textsFor(preIds),
        hint: question.hint || "",
        on_correct_reaction: outcome.correctUtteranceIds[0] ? textFor(outcome.correctUtteranceIds[0]) : "",
        on_correct_math: "",
        on_incorrect_reaction: outcome.incorrectDefaultUtteranceIds[0] ? textFor(outcome.incorrectDefaultUtteranceIds[0]) : "",
        on_incorrect_attempt_1: outcome.incorrectDefaultUtteranceIds[0] ? textFor(outcome.incorrectDefaultUtteranceIds[0]) : "",
        on_incorrect_attempt_2: outcome.incorrectDefaultUtteranceIds[0] ? textFor(outcome.incorrectDefaultUtteranceIds[0]) : "",
        worked_explanation: workedSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: workedSteps,
        worked_narration: []
      },
      mathematical_support: question.hint ? { hint_1: question.hint } : {},
      runtimeOutcome: outcome,
      runtimeUtteranceIds: [...new Set(runtimeUtteranceIds)],
      primaryErrorFamily: "UNKNOWN",
      errorFamily: "UNKNOWN",
      errorClassification: { fallback: "UNKNOWN", requiresRepeatedEvidence: true },
      recovery_item_ref: repairByFamily.UNKNOWN,
      canonicalQuestion: question
    };
  }

  function convertRepair(repair) {
    const titles = {
      "M-BOTH": "Keep the piece size fixed",
      "M-ADD": "Count repeated groups",
      "M-DEN": "Name the unit pieces",
      "M-INTEGER": "Turn the integer into groups"
    };
    return {
      id: prefix(repair.id),
      canonicalQuestionId: repair.id,
      stage: "repair",
      target: repair.family,
      assessmentIntent: `repair_${repair.family}`,
      evidenceFamily: repair.family,
      prompt: titles[repair.family],
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: { context: "fra23", questionId: repair.id, canonicalRepair: repair, visual: { kind: "repair_panel", family: repair.family }, workedSteps: [] },
      visual: { primitive: "fra23_context", action: "repair", description: titles[repair.family] },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds],
      supportedInteractionId: prefix(repair.supportedQuestionId),
      freshCheckId: prefix(repair.freshRecheckQuestionId),
      primaryErrorFamily: repair.family,
      errorClassification: { fallback: repair.family }
    };
  }

  function buildUtilityRepairs() {
    return [
      {
        id: prefix("ARITHMETIC_FACT_CHECK"), canonicalQuestionId: "ARITHMETIC_FACT_CHECK", stage: "repair", target: "M-ARITH", assessmentIntent: "arithmetic_fact_check", evidenceFamily: "M-ARITH",
        prompt: "Check the multiplication fact", response: { type: "continue" }, answer: { value: "continue" }, policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
        model: { context: "fra23", questionId: "ARITHMETIC_FACT_CHECK", canonicalRepair: { id: "ARITHMETIC_FACT_CHECK", family: "M-ARITH" }, visual: { kind: "arithmetic_fact_check" }, workedSteps: [] },
        visual: { primitive: "fra23_context", action: "repair", description: "Keep the fraction structure and check the multiplication fact." },
        scripts: { reteach: textsFor(["A-FACT-1.PRE"]), worked_explanation: "" }, runtimeUtteranceIds: ["A-FACT-1.PRE"], supportedInteractionId: prefix("A-FACT-1"), freshCheckId: prefix("A-FACT-2"), primaryErrorFamily: "M-ARITH", errorClassification: { fallback: "M-ARITH" }
      }
    ];
  }

  function teachingStep(scene, nextId) {
    const cues = (scene.timeline || []).map(convertCue);
    return {
      id: scene.id,
      purpose: scene.teachingPurpose,
      scene: {
        display_title: scene.id === "HOOK" ? "Same-sized pieces" : scene.id === "HANDOFF" ? "Try the idea" : "Multiply a fraction by an integer",
        initial_state: scene.teachingPurpose,
        objects: [scene.visual.kind],
        model: { context: "fra23", sceneId: scene.id, visual: scene.visual }
      },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      next_step: nextId
    };
  }

  function submissionFor(question, response) {
    const kind = question.canonicalQuestion?.response.kind;
    if (!kind) return null;
    if (kind === "fraction_input") return { kind: "fraction", numerator: Number(response?.n), denominator: Number(response?.d) };
    if (kind === "fixed_denominator_fraction_input") return { kind: "fraction", numerator: Number(response), denominator: question.canonicalQuestion.response.lockedDenominator };
    if (kind === "single_integer_input") return { kind: "integer", value: Number(response) };
    if (kind === "multiple_choice") return { kind: "choice", optionId: question.response.optionIds?.[String(response)] || String(response || "") };
    return {
      kind: "supported_fraction",
      numerator: Number(response?.numerator),
      denominator: question.canonicalQuestion.response.lockedDenominator,
      tappedGroups: Array.isArray(response?.tappedGroups) ? response.tappedGroups.length : Number(response?.tappedGroups),
      unit: response?.unit,
      placement: response?.placement
    };
  }

  function equivalent(n1, d1, n2, d2) {
    return Number.isFinite(n1) && Number.isFinite(d1) && Number.isFinite(n2) && Number.isFinite(d2) && d1 !== 0 && d2 !== 0 && n1 * d2 === n2 * d1;
  }

  function optionErrorFamily(id, optionId) {
    const maps = {
      F2: { B: "M-BOTH", C: "M-ADD", D: "M-DEN" },
      "C-METHOD": { B: "M-BOTH", C: "M-ADD", D: "M-DEN" },
      "D-STRUCTURE": { B: "M-BOTH", C: "UNKNOWN", D: "M-DEN" },
      M5: { A: "M-BOTH", B: "M-BOTH", D: "M-ADD" },
      "MC-ERROR": { A: "M-BOTH", B: "M-ADD", D: "M-DEN" },
      "ALT-M5": { A: "M-BOTH", B: "M-ADD", D: "M-DEN" }
    };
    return maps[id]?.[optionId] || "UNKNOWN";
  }

  function fractionErrorFamily(question, numerator, denominator, response) {
    const values = question.values || {};
    const integer = Number(values.integerFactor);
    const sourceN = Number(values.numerator);
    const sourceD = Number(values.denominator);
    if (Number.isFinite(integer) && Number.isFinite(sourceN) && Number.isFinite(sourceD)) {
      if (numerator === integer * sourceN && denominator === integer * sourceD) return "M-BOTH";
      if (numerator === integer + sourceN && denominator === sourceD) return "M-ADD";
      if (numerator === sourceN && denominator === integer * sourceD) return "M-DEN";
      if (response?.visibleMethod === "integer_as_k_over_k") return "M-INTEGER";
      if (denominator === sourceD || response?.visibleMethod === "multiply_integer_by_numerator") return "M-ARITH";
    }
    return "UNKNOWN";
  }

  function evaluateResponse(question, response) {
    const canonicalQuestion = question.canonicalQuestion;
    if (!canonicalQuestion) return { correct: false, valueCorrect: false, formCorrect: false, errorFamily: "UNKNOWN", outcomeSignal: "UNKNOWN" };
    const submission = submissionFor(question, response);
    const answer = canonicalQuestion.answer;
    let correct = false;
    let errorFamily = null;
    if (submission.kind === "choice") {
      correct = submission.optionId === answer.optionId;
      errorFamily = correct ? null : optionErrorFamily(canonicalQuestion.id, submission.optionId);
    } else if (submission.kind === "integer") {
      correct = submission.value === answer.value;
      errorFamily = correct ? null : "M-ARITH";
    } else {
      correct = canonicalQuestion.policy.allowEquivalentFraction
        ? equivalent(submission.numerator, submission.denominator, answer.numerator, answer.denominator)
        : submission.numerator === answer.numerator && submission.denominator === answer.denominator;
      if (correct && submission.kind === "supported_fraction") {
        if (canonicalQuestion.response.kind === "tap_groups_then_fixed_denominator_input" && submission.tappedGroups !== canonicalQuestion.visual.groupCount) {
          correct = false;
          errorFamily = "M-ADD";
        }
        if (canonicalQuestion.response.kind === "unit_choice_then_fixed_denominator_input" && submission.unit !== canonicalQuestion.response.correctUnit) {
          correct = false;
          errorFamily = "M-DEN";
        }
        if (canonicalQuestion.response.kind === "drag_badge_then_fixed_denominator_input" && submission.placement !== canonicalQuestion.response.requiredBadgePlacement) {
          correct = false;
          errorFamily = "M-INTEGER";
        }
      }
      errorFamily = correct ? null : (errorFamily || fractionErrorFamily(canonicalQuestion, submission.numerator, submission.denominator, response));
    }
    return {
      correct,
      valueCorrect: correct,
      formCorrect: correct,
      mathematicallyCorrect: correct,
      errorFamily: errorFamily || null,
      outcomeSignal: errorFamily || "correct"
    };
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const outcome = question.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    const family = evaluateResponse(question, response).errorFamily || "UNKNOWN";
    return [...(outcome.errorSpecificUtteranceIdsByFamily?.[family] || outcome.incorrectDefaultUtteranceIds || [])];
  }

  function visibleFeedback(question, response, correct) {
    const ids = selectOutcomeUtteranceIds(question, response, correct);
    return ids.length ? textFor(ids[0]) : "";
  }

  function classifyErrorFamily(question, response) {
    return evaluateResponse(question, response).errorFamily || "UNKNOWN";
  }

  function requiresRepeatedEvidence(question, response) {
    return blockingFamilies.has(classifyErrorFamily(question, response));
  }

  function shouldSkipF1(records) {
    const central = new Set(["M-BOTH", "M-ADD", "M-DEN", "M-INTEGER"]);
    return (records || []).length === 2 && records.every((record) => (
      record.firstAttemptCorrect === true
      && record.attempts === 1
      && record.hintOpenedBeforeSubmit !== true
      && record.supportEscalated !== true
      && !central.has(record.errorFamilyHypothesis)
    ));
  }

  function evaluateFinalEvidence(records) {
    const list = records || [];
    const correctIds = new Set(list.filter((record) => record.firstAttemptCorrect).map((record) => unprefix(record.questionId)));
    const correctCount = correctIds.size;
    const procedural = ["M1", "M3", "M4"].some((id) => correctIds.has(id));
    const application = ["M2", "M5"].some((id) => correctIds.has(id));
    const counts = {};
    list.forEach((record) => {
      const family = record.errorFamilyHypothesis;
      if (blockingFamilies.has(family)) counts[family] = (counts[family] || 0) + 1;
    });
    const repeatedBlockingFamily = Object.keys(counts).find((family) => counts[family] >= 2) || null;
    const masterySatisfied = correctCount >= 4 && procedural && application && !repeatedBlockingFamily;
    return {
      route: masterySatisfied ? "finish_candidate" : (correctCount === 3 || (correctCount >= 4 && (!procedural || !application || repeatedBlockingFamily))) ? "targeted_repair_then_two_item_check" : "repair_then_alternate_five_item_final",
      masterySatisfied,
      correctCount,
      procedural,
      application,
      repeatedBlockingFamily,
      blockerCounts: counts
    };
  }

  function selectRecoveryQuestionIds(route, missedFamilies) {
    if (route === "repair_then_alternate_five_item_final") return ["ALT-M1", "ALT-M2", "ALT-M3", "ALT-M4", "ALT-M5"].map(prefix);
    const priorities = {
      "M-BOTH": ["MC-ERROR", "MC-DIRECT", "MC-CONTEXT"],
      "M-ADD": ["MC-DIRECT", "MC-ORDER", "MC-ERROR"],
      "M-DEN": ["MC-CONTEXT", "MC-ERROR", "MC-MISSING"],
      "M-INTEGER": ["MC-ORDER", "MC-DIRECT", "MC-MISSING"],
      "M-ARITH": ["MC-MISSING", "MC-DIRECT", "MC-CONTEXT"],
      UNKNOWN: ["MC-DIRECT", "MC-CONTEXT", "MC-ERROR"]
    };
    const selected = [];
    for (const family of [...new Set(missedFamilies || [])]) {
      const candidate = (priorities[family] || priorities.UNKNOWN).find((id) => !selected.includes(id));
      if (candidate) selected.push(candidate);
      if (selected.length === 2) break;
    }
    if (selected.length === 2) return selected.map(prefix);
    for (const id of ["MC-DIRECT", "MC-CONTEXT", "MC-ORDER", "MC-MISSING", "MC-ERROR"]) {
      if (!selected.includes(id)) selected.push(id);
      if (selected.length === 2) break;
    }
    return selected.map(prefix);
  }

  function validateRuntimeContract() {
    const issues = [];
    if (!lesson || lesson.displayId !== LESSON_ID) issues.push("FRA23 approved lesson is missing or has the wrong id.");
    if (lesson?.contentVersion !== CONTENT_VERSION) issues.push("FRA23 content version does not match the handoff.");
    if (Object.keys(runtimeCopy).length !== 138) issues.push("FRA23 runtime copy must contain exactly 138 utterances.");
    if ((lesson?.questions || []).length !== 38) issues.push("FRA23 must contain exactly 38 authored questions.");
    if ((lesson?.teachingScenes || []).map((scene) => scene.id).join(",") !== "HOOK,T1,T2,T3,T4,HANDOFF") issues.push("FRA23 teaching sequence is incomplete.");
    for (const question of lesson?.questions || []) {
      for (const id of [
        ...(question.ryanBeforeSubmitUtteranceIds || []),
        ...(question.feedback?.correctUtteranceIds || []),
        ...(question.feedback?.incorrectDefaultUtteranceIds || []),
        ...Object.values(question.feedback?.errorSpecificUtteranceIdsByFamily || {}).flat()
      ]) if (!runtimeCopy[id]) issues.push(`${question.id} references missing utterance ${id}.`);
    }
    return issues;
  }

  function validateQuestionModel(question) {
    if (question.policy?.reteachOnly && question.model?.canonicalRepair) return [];
    const source = question.canonicalQuestion || question.model?.canonicalQuestion;
    if (!source) return ["FRA23 canonical question data is missing"];
    if (!source.answer || !source.response || !source.visual) return [`${source.id || question.id}: FRA23 answer, response, and visual data are required`];
    if (source.answer.kind === "fraction" && (!Number.isInteger(source.answer.numerator) || !Number.isInteger(source.answer.denominator) || source.answer.denominator <= 0)) {
      return [`${source.id}: FRA23 fraction answer must use integer numerator and a positive denominator`];
    }
    return [];
  }

  function apply(spec) {
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA23 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = [
      ...lesson.questions.map(convertQuestion),
      ...lesson.repairs.map(convertRepair),
      ...buildUtilityRepairs()
    ];
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: lesson.title, status: lesson.status, version: CONTENT_VERSION, estimated_minutes: 26 });
    spec.learning_objective = lesson.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02", "P-N01"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const order = ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF"];
    const sceneNext = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = order.map((id) => teachingStep(canonicalScenes[id], sceneNext[id]));
    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const next = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const item = question(id);
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: item.scripts.before_submit,
        visual_before_answer: item.prompt,
        correct_next: next[id],
        recovery_ref: item.recovery_item_ref
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Approved FRA23 route only.", between_question_transition: "" };
    spec.lesson.exit = {
      intro_script: textsFor(["FINAL.INTRO.1", "FINAL.INTRO.2"]),
      primary_question_refs: ["M1", "M2", "M3", "M4", "M5"].map(prefix),
      confirmation_question_refs: lesson.questions.filter((item) => ["confirmation", "repair", "recovery_mini_check", "alternate_final"].includes(item.stage)).map((item) => prefix(item.id)),
      use_question_before_submit_narration: false,
      mastery_policy: {
        profile: "fra23_five_item",
        secureMinimum: 4,
        totalItems: 5,
        requireProceduralEvidence: true,
        requireApplicationEvidence: true,
        repeatedCentralFamilies: [...blockingFamilies],
        nearSecureRecoveryCount: 2,
        insecureRecoveryCount: 5,
        repairCycleCapPerFamily: 1
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra23_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: Object.fromEntries(Object.entries(lesson.adaptiveRouting.hintConfirmationMap).map(([id, confirmationId]) => [prefix(id), prefix(confirmationId)])),
      repair_by_error_family: repairByFamily,
      repair_supported_by_error_family: repairSupportedByFamily,
      fresh_checks_by_error_family: freshChecksByFamily
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: [textFor("COMPLETE.1")], buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "One more pass will help", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan", voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)", voice_id: "en-GB-RyanNeural", locale: "en-GB", opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", timing_source: "provider_word_boundaries_with_deterministic_fallback" },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra23_context", same_unit_piece: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra23_context", "fraction_input", "integer_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "fra23-codex-handoff-v1",
      engine_profile: "fra23",
      runtime_applied: true,
      owner_review_status: lesson.status,
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: lesson.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn — support nearby", independent: "Now you take over", repair: "Targeted repair", exit: "Final check", completion: "Lesson complete" },
      route_contract: lesson.adaptiveRouting,
      capabilities: { exact_fraction_equivalence: true, fixed_denominator_items: true, live_ryan_word_boundaries: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, targeted_repairs: true, supported_repair_interactions: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra23Canonical = {
    apply,
    buildQuestions: () => [...lesson.questions.map(convertQuestion), ...lesson.repairs.map(convertRepair), ...buildUtilityRepairs()],
    classifyErrorFamily,
    evaluateFinalEvidence,
    evaluateResponse,
    freshChecksByFamily,
    prefix,
    repairByFamily,
    requiresRepeatedEvidence,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    selectRecoveryQuestionIds,
    shouldSkipF1,
    textFor,
    unprefix,
    validateRuntimeContract,
    validateQuestionModel,
    visibleFeedback
  };
})();
