(function () {
  "use strict";

  const LESSON_ID = "FRA-12";
  const CONTENT_VERSION = "fra12-owner-approved-handoff-v1";
  const source = window.RevilyFra12V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const syncCues = source?.syncCues || [];
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const sceneTitles = {
    HOOK: "Timber for one shelf",
    T1: "Name the whole and the extra part",
    T2: "Regroup the whole boards",
    T3: "Join every equal piece",
    T4: "Use the compact method",
    HANDOFF: "Your conversion plan"
  };

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA12 runtime utterance: ${id}`);
    return entry;
  }

  const textFor = (id) => runtimeEntry(id).text;
  const textsFor = (ids) => (ids || []).map(textFor);
  const mixedSignature = (mixed) => mixed ? `mixed:${mixed.whole}:${mixed.numerator}:${mixed.denominator}` : null;

  function toModel(visual, extra) {
    return Object.assign({}, visual || {}, extra || {}, {
      context: "fra12_mixed_to_improper",
      fra12VisualContext: visual?.context || null
    });
  }

  function responseFor(question) {
    const input = question.input || {};
    if (input.kind === "staged_fields") {
      return {
        type: "fra12_staged_fields",
        fields: [...(input.fields || [])],
        fixedDenominator: input.fixedDenominator,
        input_label: "Complete the three conversion fields"
      };
    }
    if (input.kind === "fraction_fields" && input.editableFields?.length === 1) {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: "numerator",
        fixedDenominator: input.fixedDenominator || question.expected?.value?.denominator,
        input_label: "Missing numerator"
      };
    }
    if (input.kind === "missing_numerator") {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: "numerator",
        fixedDenominator: input.fixedDenominator,
        input_label: "Missing numerator"
      };
    }
    if (input.kind === "fraction_fields") {
      return {
        type: "fraction",
        accept_equivalent_notation: false,
        partLabel: "Numerator",
        wholeLabel: "Denominator",
        input_label: "Improper fraction"
      };
    }
    return {
      type: "single_choice",
      options: (question.options || []).map((option) => option.text),
      optionIds: (question.options || []).map((option) => option.id),
      keyboard_submit: true
    };
  }

  function answerFor(question) {
    const expected = question.expected || {};
    if (expected.kind === "fraction" && question.input?.kind === "fraction_fields" && question.input.editableFields?.length === 1) {
      return String(expected.value.numerator);
    }
    if (expected.kind === "fraction") return `${expected.value.numerator}/${expected.value.denominator}`;
    if (expected.kind === "missing_numerator") return String(expected.numerator);
    if (expected.kind === "staged_conversion") {
      return {
        wholePieceTotal: String(expected.wholePieceTotal),
        totalNumerator: String(expected.totalNumerator),
        finalNumerator: String(expected.fraction.numerator)
      };
    }
    if (expected.kind === "option") {
      return (question.options || []).find((option) => option.id === expected.optionId)?.text || expected.optionId;
    }
    return String(expected.value ?? expected.answer ?? "");
  }

  function responseKey(question, response) {
    if (response && typeof response === "object" && "n" in response && "d" in response) return `${response.n}/${response.d}`;
    if (response && typeof response === "object" && "wholePieceTotal" in response) {
      return `${response.wholePieceTotal}|${response.totalNumerator}|${response.finalNumerator}`;
    }
    const option = (question?.canonicalQuestion?.options || []).find((item) => item.text === response);
    return option?.id || String(response ?? "");
  }

  function sameFraction(left, right) {
    if (!left || !right) return false;
    try {
      return BigInt(left.n) * BigInt(right.denominator) === BigInt(right.numerator) * BigInt(left.d);
    } catch (_error) {
      return false;
    }
  }

  function classifyResponse(question, response) {
    const raw = question?.canonicalQuestion;
    if (!raw) return question?.primaryErrorFamily || "unknown";
    const key = responseKey(question, response);
    const optionFamily = raw.optionErrorFamilies?.[key];
    if (optionFamily) return optionFamily;
    if (raw.input?.kind === "staged_fields" && response && typeof response === "object") {
      const whole = raw.mixedNumber.whole;
      const numerator = raw.mixedNumber.numerator;
      if (Number(response.wholePieceTotal) === whole * numerator) return "multiply_by_numerator";
      if (Number(response.totalNumerator) === whole + numerator) return "add_whole_and_numerator";
      return "arithmetic_slip";
    }
    if (response && typeof response === "object" && "n" in response && "d" in response) {
      const expected = raw.expected?.value;
      for (const known of raw.knownWrongAnswers || []) {
        if (known.answer && Number(known.answer.numerator) === Number(response.n) && Number(known.answer.denominator) === Number(response.d)) return known.errorFamily;
      }
      if (expected && sameFraction(response, expected)
        && (Number(response.n) !== Number(expected.numerator) || Number(response.d) !== Number(expected.denominator))) return "wrong_form";
      if (Number(response.d) !== Number(raw.mixedNumber?.denominator)) return "denominator_changed";
      const whole = Number(raw.mixedNumber?.whole);
      const numerator = Number(raw.mixedNumber?.numerator);
      const denominator = Number(raw.mixedNumber?.denominator);
      if (Number(response.n) === whole + numerator) return "add_whole_and_numerator";
      if (Number(response.n) === whole * numerator + numerator) return "multiply_by_numerator";
      if (Number(response.n) === whole * denominator) return "dropped_fractional_part";
      if (Number(response.n) === numerator) return "partial_only";
      return "arithmetic_slip";
    }
    for (const known of raw.knownWrongAnswers || []) {
      if (Number(known.answer) === Number(response)) return known.errorFamily;
    }
    return raw.input?.kind === "single_choice" ? "unknown" : "arithmetic_slip";
  }

  function outcomeMetadata(question) {
    const feedback = question.feedback || {};
    const byFamily = Object.fromEntries(Object.entries(feedback.incorrectByErrorFamily || {}).map(([family, ids]) => [family, [...ids]]));
    const byResponse = {};
    Object.entries(feedback.incorrectByOptionId || {}).forEach(([optionId, ids]) => {
      const text = (question.options || []).find((option) => option.id === optionId)?.text;
      if (text) byResponse[text] = [...ids];
    });
    return {
      correctUtteranceIds: [...(feedback.correctUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(feedback.incorrectDefaultUtteranceIds || [])],
      incorrectUtteranceIdsByFamily: byFamily,
      incorrectUtteranceIdsByResponse: byResponse,
      workedCheckUtteranceIds: [...(feedback.workedCheckUtteranceIds || [])]
    };
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const outcome = question?.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    const raw = question?.canonicalQuestion;
    const optionText = (raw?.options || []).find((option) => option.text === response)?.text;
    const family = classifyResponse(question, response);
    return [...(
      outcome.incorrectUtteranceIdsByResponse?.[optionText]
      || outcome.incorrectUtteranceIdsByFamily?.[family]
      || outcome.incorrectDefaultUtteranceIds
      || []
    )];
  }

  function primaryFamily(question) {
    const explicit = question.knownWrongAnswers?.[0]?.errorFamily
      || Object.values(question.optionErrorFamilies || {})[0];
    if (explicit) return explicit;
    if (question.input?.kind === "staged_fields") return "multiply_by_numerator";
    return question.assessmentFamily === "missing" ? "dropped_fractional_part" : "unknown";
  }

  function repairRefForQuestion(question) {
    const family = primaryFamily(question);
    const repair = approved.repairs.find((item) => item.errorFamily === family);
    return repair ? prefix(repair.id) : null;
  }

  function workedSteps(question) {
    const mixed = question.mixedNumber;
    if (!mixed) return [];
    const grouped = mixed.whole * mixed.denominator;
    const total = grouped + mixed.numerator;
    return [
      `${mixed.whole} × ${mixed.denominator} = ${grouped}`,
      `${grouped} + ${mixed.numerator} = ${total}`,
      `${total}/${mixed.denominator}`
    ];
  }

  function convertQuestion(question, overrides) {
    const outcome = outcomeMetadata(question);
    const responseFeedback = {};
    Object.entries(outcome.incorrectUtteranceIdsByResponse).forEach(([key, ids]) => { responseFeedback[key] = textsFor(ids)[0] || ""; });
    const familyFeedback = {};
    Object.entries(outcome.incorrectUtteranceIdsByFamily).forEach(([family, ids]) => { familyFeedback[family] = textsFor(ids)[0] || ""; });
    const policy = question.policy || {};
    const steps = workedSteps(question);
    return Object.assign({
      id: prefix(question.id),
      stage: ["final", "recovery"].includes(question.stage) ? "exit" : question.stage,
      target: String(question.assessmentIntent || question.assessmentFamily || "mixed number conversion").replace(/_/g, " "),
      assessmentIntent: question.assessmentIntent,
      evidenceFamily: question.assessmentFamily || "direct",
      prompt: question.prompt,
      model: toModel(question.visual, {
        mixedNumber: question.mixedNumber,
        expected: question.expected,
        canonicalSignature: mixedSignature(question.mixedNumber),
        assessmentFamily: question.assessmentFamily,
        workedSteps: steps
      }),
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: policy.hintPolicy || "none",
        solutionPolicy: policy.solutionPolicy || "after_response",
        scored: policy.scored !== false,
        answerLocksOnSubmit: policy.answerLockRequired === true,
        requiresFreshNoHintConfirmationIfHintUsed: policy.requiresFreshNoHintConfirmationIfHintUsed === true,
        countsAsIndependentEvidence: ["final", "recovery"].includes(question.stage),
        countsAsFreshEvidence: question.stage === "recovery" || question.stage === "confirmation",
        formSensitive: true,
        canonicalSignature: mixedSignature(question.mixedNumber)
      },
      attempt_policy: { submit_label: question.input?.submitLabel || "Check answer" },
      visual: { primitive: "fra12_context", action: "focus", description: question.prompt },
      scripts: {
        before_submit: textsFor(question.preSubmitUtteranceIds),
        on_correct_reaction: textsFor(outcome.correctUtteranceIds)[0] || "",
        on_correct_math: "",
        on_incorrect_reaction: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_1: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_2: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        worked_explanation: steps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_narration: textsFor(outcome.workedCheckUtteranceIds),
        response_feedback: responseFeedback,
        family_feedback: familyFeedback
      },
      runtimeOutcome: outcome,
      mathematical_support: question.hint ? { hint_1: question.hint } : {},
      errorClassification: { fallback: primaryFamily(question), requiresRepeatedEvidence: true },
      primaryErrorFamily: primaryFamily(question),
      recovery_item_ref: repairRefForQuestion(question),
      canonicalQuestion: question
    }, overrides || {});
  }

  function repairQuestion(repair) {
    const interaction = repair.supportedInteraction;
    const options = (interaction.options || repair.visual.options || []).map(String);
    const response = options.length
      ? { type: "single_choice", options, keyboard_submit: true }
      : repair.id === "R-DENOM"
        ? { type: "integer", presentation: "fraction_builder", editableField: "numerator", fixedDenominator: repair.visual.fixedDenominator, input_label: "Missing numerator" }
        : { type: "integer", input_label: "Your answer" };
    const answerValue = options.length ? options[Number(interaction.answer)] ?? String(interaction.answer) : String(interaction.answer);
    return {
      id: prefix(repair.id),
      stage: "repair",
      target: repair.errorFamily.replace(/_/g, " "),
      assessmentIntent: `targeted_repair_${repair.errorFamily}`,
      evidenceFamily: "repair",
      prompt: interaction.prompt,
      model: toModel(repair.visual, { mixedNumber: repair.visual.mixedNumber, repairId: repair.id }),
      response,
      answer: { value: answerValue },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, answerLocksOnSubmit: false },
      attempt_policy: { submit_label: "Check answer" },
      visual: { primitive: "fra12_context", action: "repair", description: interaction.prompt },
      scripts: {
        reteach: textsFor(repair.utteranceIds),
        on_correct_reaction: textsFor(interaction.correctUtteranceIds)[0] || "",
        on_incorrect_reaction: textsFor(interaction.incorrectUtteranceIds)[0] || "",
        on_incorrect_attempt_1: textsFor(interaction.incorrectUtteranceIds)[0] || "",
        on_incorrect_attempt_2: textsFor(interaction.incorrectUtteranceIds)[0] || ""
      },
      runtimeOutcome: {
        correctUtteranceIds: [...interaction.correctUtteranceIds],
        incorrectDefaultUtteranceIds: [...interaction.incorrectUtteranceIds],
        incorrectUtteranceIdsByFamily: {},
        incorrectUtteranceIdsByResponse: {},
        workedCheckUtteranceIds: []
      },
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily },
      canonicalRepair: repair
    };
  }

  function sceneCues(scene) {
    const ids = new Set(scene.cueIds || []);
    return syncCues.filter((cue) => cue.sceneId === scene.id && ids.has(cue.id)).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: `fra12_${String(cue.action || cue.id).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      target: cue.target,
      params: cue.params || null
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: sceneTitles[scene.id] || "Mixed numbers and improper fractions",
      scene: {
        display_title: sceneTitles[scene.id] || "Mixed numbers and improper fractions",
        initial_state: scene.purpose,
        objects: [scene.visual.kind],
        model: toModel(scene.visual, { sceneId: scene.id })
      },
      narration: { script: textsFor(scene.utteranceIds), utterance_ids: [...scene.utteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 650 })),
      next_step: nextId
    };
  }

  function buildQuestions() {
    return [
      ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.repairs.map(repairQuestion),
      ...approved.recoveryBank.map((question) => convertQuestion(question))
    ];
  }

  function stableHash(seed) {
    let x = Number(seed) | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  }

  function seedFrom(value) {
    let hash = 2166136261;
    for (const character of String(value ?? "0")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function selectRecoveryItems(params) {
    const excludedIds = new Set((params.excludedIds || []).map(unprefix));
    const excludedSignatures = new Set(params.excludedSignatures || []);
    const bank = approved.recoveryBank.filter((item) => !excludedIds.has(item.id) && !excludedSignatures.has(mixedSignature(item.mixedNumber)));
    if (params.count < 1 || params.count > bank.length) throw new Error("Requested FRA12 recovery count is outside the unseen authored bank.");
    const start = stableHash(params.seed) % bank.length;
    const rotated = [...bank.slice(start), ...bank.slice(0, start)];
    const selected = [];
    const selectedIds = new Set();
    for (const family of params.requiredFamilies || []) {
      const item = rotated.find((candidate) => candidate.assessmentFamily === family && !selectedIds.has(candidate.id));
      if (!item) throw new Error(`No unseen FRA12 recovery item is available for family ${family}.`);
      selected.push(item);
      selectedIds.add(item.id);
    }
    for (const item of rotated) {
      if (selected.length >= params.count) break;
      if (!selectedIds.has(item.id)) {
        selected.push(item);
        selectedIds.add(item.id);
      }
    }
    if (selected.length !== params.count) throw new Error("Unable to select the requested FRA12 recovery items.");
    return selected.map((item) => prefix(item.id));
  }

  function finalRecords(questionIds, responses, evidence) {
    return (questionIds || []).map((questionId) => {
      const rawId = unprefix(questionId);
      const question = [...approved.questions, ...approved.recoveryBank].find((item) => item.id === rawId);
      const response = responses?.[questionId];
      return {
        questionId,
        rawId,
        family: question?.assessmentFamily || "direct",
        correct: response?.correct === true,
        firstAttempt: Number(evidence?.attempts?.[questionId] || 1) === 1,
        errorFamily: response?.correct ? null : (evidence?.errorFamily?.[questionId] || evidence?.candidateErrorFamily?.[questionId] || "unknown")
      };
    });
  }

  function evaluateFinalEvidence(records, primaryWindow) {
    const correct = (records || []).filter((record) => record.correct && record.firstAttempt !== false);
    const distinctFamilies = new Set(correct.map((record) => record.family));
    const required = primaryWindow
      ? correct.some((record) => ["M2", "M4", "M5"].includes(record.rawId))
      : correct.some((record) => ["visual", "method", "reasoning"].includes(record.family));
    const blocking = new Set(approved.masteryContract.blockingFamilies);
    const counts = {};
    (records || []).forEach((record) => {
      if (blocking.has(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1;
    });
    const repeatedBlockingFamilies = Object.keys(counts).filter((family) => counts[family] >= 2);
    return {
      correctCount: correct.length,
      totalCount: (records || []).length,
      distinctFamiliesCorrect: distinctFamilies.size,
      visualOrReasoningCorrect: required,
      repeatedBlockingFamilies,
      masterySatisfied: (records || []).length === 5
        && correct.length >= approved.masteryContract.primaryFinalCorrectMinimum
        && distinctFamilies.size >= approved.masteryContract.requiredDistinctFamilies
        && required
        && repeatedBlockingFamilies.length === 0
    };
  }

  function selectFinalRoute(records) {
    const evaluation = evaluateFinalEvidence(records, true);
    if (evaluation.masterySatisfied) return { route: "primary_mastery", evaluation, recoveryCount: 0 };
    if (evaluation.correctCount >= 3) {
      return { route: "score_three_repair_then_two_of_two", evaluation, recoveryCount: 2 };
    }
    return { route: "score_zero_to_two_repair_then_fresh_five", evaluation, recoveryCount: 5 };
  }

  function recoveryRoutePassed(route, records) {
    if (route === "score_three_repair_then_two_of_two") {
      return (records || []).length === 2 && records.every((record) => record.correct === true && record.firstAttempt === true);
    }
    if (route === "score_zero_to_two_repair_then_fresh_five") {
      return evaluateFinalEvidence(records, false).masterySatisfied;
    }
    return false;
  }

  function recoveryFamily(questionId) {
    const family = approved.questions.find((item) => item.id === unprefix(questionId))?.assessmentFamily;
    return family === "missing" ? "denominator" : (family || "direct");
  }

  function validateRuntimeContract() {
    const issues = [];
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      if (!String(entry?.text || "").trim()) issues.push(`${id} has no runtime text`);
      if (entry?.spokenBy !== "Ryan") issues.push(`${id} is not spoken by Ryan`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} caption source is not same_as_audio`);
    });
    syncCues.forEach((cue) => {
      const entry = runtimeCopy[cue.utteranceId];
      if (!entry) issues.push(`${cue.id} has no active utterance`);
      else if (!entry.text.includes(cue.anchorText)) issues.push(`${cue.id} anchor is absent from ${cue.utteranceId}`);
    });
    return issues;
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA12 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA12 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-02", "FRA-06"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const nextScene = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = approved.teachingScenes.map((scene) => teachingStep(scene, nextScene[scene.id]));
    spec.lesson.transfer_steps = Object.fromEntries(["G1", "G2", "F1", "F2", "I1", "I2"].map((id) => {
      const item = question(id);
      const next = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" }[id];
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: item.scripts.before_submit,
        visual_before_answer: item.prompt,
        correct_next: next
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Canonical FRA12 route only.", between_question_transition: "" };

    const primaryIds = ["M1", "M2", "M3", "M4", "M5"].map(prefix);
    const confirmationIds = approved.questions.filter((item) => item.stage === "confirmation").map((item) => prefix(item.id));
    const recoveryIds = approved.recoveryBank.map((item) => prefix(item.id));
    const repairByFamily = Object.fromEntries(approved.repairs.map((repair) => [repair.errorFamily, prefix(repair.id)]));
    const freshByFamily = Object.fromEntries(approved.repairs.map((repair) => [repair.errorFamily, [prefix(repair.freshCheckQuestionId)]]));
    spec.lesson.exit = {
      intro_script: textsFor(approved.finalIntroUtteranceIds),
      primary_question_refs: primaryIds,
      confirmation_question_refs: [...confirmationIds, ...recoveryIds],
      post_repair_retest_refs: recoveryIds,
      mastery_policy: {
        profile: "fra12_five_item",
        secureMinimum: approved.masteryContract.primaryFinalCorrectMinimum,
        totalItems: approved.masteryContract.primaryFinalCount,
        requiredReasoningOrVisualItemIds: approved.masteryContract.requiredReasoningOrVisualItemIds.map(prefix),
        requiredDistinctFamilies: approved.masteryContract.requiredDistinctFamilies,
        repeatedCentralFamilies: [...approved.masteryContract.blockingFamilies],
        miniCheckCount: approved.masteryContract.recoveryMiniCheckCount,
        freshFinalCount: approved.masteryContract.freshFinalCountAfterLowScore
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-VIS"),
        [prefix("F2")]: prefix("C-METHOD"),
        [prefix("I1")]: prefix("C-VIS"),
        [prefix("I2")]: prefix("C-METHOD")
      },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: Object.assign(freshByFamily, {
        partial_only: [prefix("C-VIS")],
        arithmetic_slip: [prefix("C-DIRECT")],
        unknown: [prefix("C-DIRECT")]
      }),
      feedback_by_error_family: {}
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building the conversion", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
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
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra12_context", equal_width_wholes: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra12_context", "fraction_input", "integer_input", "single_choice", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "1.0-fra12-owner-approved",
      engine_profile: "fra12",
      runtime_applied: true,
      owner_review_status: "owner_approved_handoff",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      route_contract: approved.routeContract,
      mastery_contract: approved.masteryContract,
      recovery_selection_contract: approved.recoverySelectionContract,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Less help", independent: "Now you take over", repair: "Targeted repair", exit: "Final check", completion: "Complete" },
      capabilities: { staged_conversion_input: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, five_item_final: true, targeted_repairs: true, deterministic_authored_recovery: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra12Canonical = {
    apply,
    buildQuestions,
    classifyResponse,
    evaluateFinalEvidence,
    finalRecords,
    mixedSignature,
    recoveryFamily,
    recoveryRoutePassed,
    seedFrom,
    selectFinalRoute,
    selectOutcomeUtteranceIds,
    selectRecoveryItems,
    textFor,
    validateRuntimeContract
  };
})();
