(function () {
  "use strict";

  const LESSON_ID = "FRA-24";
  const CONTENT_VERSION = "fra24-canonical-handoff-v1";
  const approved = window.RevilyFra24ApprovedSpec;
  const runtimeCopy = approved?.FRA24_RUNTIME_COPY || {};
  const canonical = approved?.FRA24;
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = {
    add: prefix("R-ADD"),
    cross: prefix("R-CROSS"),
    keep_denominator: prefix("R-KEEP"),
    common_denominator_needed: prefix("R-COMMON"),
    improper_invalid: prefix("R-IMPROPER"),
    mixed_conversion: prefix("R-IMPROPER"),
    form: prefix("R-FORM"),
    arithmetic_slip: prefix("ARITHMETIC"),
    unknown: prefix("UNKNOWN")
  };

  const freshChecksByFamily = {
    add: [prefix("RA-FRESH"), prefix("C-METHOD"), prefix("A-DIRECT")],
    cross: [prefix("RC-FRESH"), prefix("C-METHOD"), prefix("A-METHOD")],
    keep_denominator: [prefix("RK-FRESH"), prefix("C-VIS"), prefix("A-VIS")],
    common_denominator_needed: [prefix("RCO-FRESH"), prefix("C-METHOD"), prefix("A-DIRECT")],
    improper_invalid: [prefix("RIMP-FRESH"), prefix("C-IMP"), prefix("A-IMPROPER")],
    mixed_conversion: [prefix("RIMP-FRESH"), prefix("C-IMP"), prefix("A-IMPROPER")],
    form: [prefix("RFORM-FRESH"), prefix("A-FORM"), prefix("C-CONTEXT")],
    arithmetic_slip: [prefix("RARITH-FRESH"), prefix("C-DIR"), prefix("A-DIRECT")],
    unknown: [prefix("C-METHOD"), prefix("C-VIS"), prefix("A-METHOD")]
  };

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA24 runtime utterance: ${id}`);
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

  function factorsFor(question) {
    return question?.factors || { first: { numerator: 1, denominator: 1 }, second: { numerator: 1, denominator: 1 } };
  }

  function rawProduct(question) {
    const { first, second } = factorsFor(question);
    return {
      numerator: first.numerator * second.numerator,
      denominator: first.denominator * second.denominator
    };
  }

  function gcd(a, b) {
    let x = Math.abs(Math.trunc(Number(a) || 0));
    let y = Math.abs(Math.trunc(Number(b) || 0));
    while (y) [x, y] = [y, x % y];
    return x || 1;
  }

  function reducedProduct(question) {
    const value = rawProduct(question);
    const divisor = gcd(value.numerator, value.denominator);
    return { numerator: value.numerator / divisor, denominator: value.denominator / divisor };
  }

  function optionLabel(question, optionId) {
    return question.learnerUi?.options?.find((option) => option.id === optionId)?.text || optionId;
  }

  function responseFor(question) {
    if (question.response.kind === "fraction_input") {
      return {
        type: "fraction",
        accept_equivalent_notation: question.answerPolicy.kind !== "fraction_simplest",
        partLabel: "Numerator",
        wholeLabel: "Denominator",
        keyboard_submit: true
      };
    }
    if (question.response.kind === "integer_input") {
      return {
        type: "integer",
        presentation: "fraction_builder",
        editableField: "denominator",
        fixedNumerator: rawProduct(question).numerator,
        input_label: "Missing denominator",
        keyboard_submit: true
      };
    }
    if (question.response.kind === "single_choice") {
      const options = question.learnerUi.options || [];
      return {
        type: "single_choice",
        options: options.map((option) => option.text),
        optionIds: Object.fromEntries(options.map((option) => [option.text, option.id])),
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA24 response kind ${question.response.kind}`);
  }

  function answerFor(question) {
    if (question.answerPolicy.kind === "choice_B") return optionLabel(question, "B");
    if (question.answerPolicy.kind === "missing_denominator") return String(rawProduct(question).denominator);
    const value = question.answerPolicy.kind === "fraction_simplest" ? reducedProduct(question) : rawProduct(question);
    return { n: String(value.numerator), d: String(value.denominator) };
  }

  function evidenceFamily(question) {
    const intent = String(question.assessmentIntent || "");
    if (intent.startsWith("VIS")) return "VIS";
    if (intent.startsWith("METHOD") || intent.startsWith("ERROR")) return "METHOD";
    if (intent.startsWith("IMPROPER") || intent.includes("IMPROPER")) return "IMPROPER";
    if (intent.startsWith("CONTEXT")) return "CONTEXT";
    if (intent.startsWith("FORM") || intent.includes("FORM")) return "FORM";
    return "DIRECT";
  }

  function workedSteps(question) {
    const { first, second } = factorsFor(question);
    const raw = rawProduct(question);
    const reduced = reducedProduct(question);
    if (question.answerPolicy.kind === "choice_B") {
      return [
        "Keep the two number rows intact.",
        `${first.numerator} × ${second.numerator} = ${raw.numerator} and ${first.denominator} × ${second.denominator} = ${raw.denominator}.`,
        `The direct product is ${raw.numerator}/${raw.denominator}.`
      ];
    }
    if (question.answerPolicy.kind === "missing_denominator") {
      return [
        `${first.numerator} × ${second.numerator} = ${raw.numerator} on top.`,
        `${first.denominator} × ${second.denominator} = ${raw.denominator} on the bottom.`,
        `The missing denominator is ${raw.denominator}.`
      ];
    }
    const steps = question.visual.kind === "area_product_grid"
      ? [
          `${first.numerator} selected columns × ${second.numerator} selected rows = ${raw.numerator} overlap cells.`,
          `${first.denominator} columns × ${second.denominator} rows = ${raw.denominator} equal cells in the whole.`,
          `The product is ${raw.numerator}/${raw.denominator}.`
        ]
      : [
          `${first.numerator} × ${second.numerator} = ${raw.numerator} on top.`,
          `${first.denominator} × ${second.denominator} = ${raw.denominator} on the bottom.`,
          `The product is ${raw.numerator}/${raw.denominator}.`
        ];
    if (question.answerPolicy.kind === "fraction_simplest") {
      steps.push(`${raw.numerator}/${raw.denominator} simplifies after multiplying to ${reduced.numerator}/${reduced.denominator}.`);
    }
    return steps;
  }

  function runtimeOutcome(question) {
    const outcome = question.runtime.outcomeUtteranceIds;
    const specific = Object.fromEntries(Object.entries(outcome.incorrectBySignal || {})
      .filter(([signal]) => signal !== "default")
      .map(([signal, id]) => [signal, [id]]));
    return {
      correctUtteranceIds: outcome.correct ? [outcome.correct] : [],
      incorrectDefaultUtteranceIds: outcome.incorrectBySignal?.default ? [outcome.incorrectBySignal.default] : [],
      errorSpecificUtteranceIdsByFamily: specific,
      workedCheckUtteranceIds: []
    };
  }

  function convertQuestion(question) {
    const outcome = runtimeOutcome(question);
    const preIds = [...(question.runtime.preUtteranceIds || [])];
    const hintId = question.support.hintUtteranceId;
    const steps = workedSteps(question);
    const finalLike = ["final", "confirmation", "recovery_final", "repair"].includes(question.stage);
    const runtimeUtteranceIds = [
      ...preIds,
      ...(hintId ? [hintId] : []),
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectDefaultUtteranceIds,
      ...Object.values(outcome.errorSpecificUtteranceIdsByFamily).flat()
    ];
    const visualCues = approved.FRA24_CUES
      .filter((cue) => preIds.includes(cue.utteranceId))
      .map(convertCue);
    return {
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage === "recovery_final" ? "recovery" : question.stage,
      target: question.assessmentIntent,
      assessmentIntent: question.assessmentIntent,
      evidenceFamily: evidenceFamily(question),
      prompt: question.learnerUi.prompt,
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.support.hintPolicy === "optional_collapsed" ? "optional" : "none",
        solutionPolicy: finalLike || question.response.lockOnSubmit ? "after_locked_submit" : "after_response",
        scored: true,
        answerLocksOnSubmit: question.response.lockOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.support.hintPolicy === "optional_collapsed",
        maxAttemptsBeforeRepair: question.response.allowRetryAfterFeedback ? 2 : 1,
        countsAsIndependentEvidence: ["independent", "final", "recovery_final"].includes(question.stage)
      },
      attempt_policy: { submit_label: "Check answer" },
      model: {
        context: "fra24",
        questionId: question.id,
        canonicalQuestion: question,
        factors: question.factors,
        visual: question.visual,
        workedSteps: steps,
        accessibleDescription: question.visual.accessibleDescriptionTemplate || ""
      },
      visual: {
        primitive: "fra24_context",
        action: "focus",
        description: question.learnerUi.prompt,
        syncCues: visualCues
      },
      scripts: {
        before_submit: textsFor(preIds),
        hint: hintId ? textFor(hintId) : "",
        on_correct_reaction: outcome.correctUtteranceIds.length ? textFor(outcome.correctUtteranceIds[0]) : "",
        on_correct_math: "",
        on_incorrect_reaction: outcome.incorrectDefaultUtteranceIds.length ? textFor(outcome.incorrectDefaultUtteranceIds[0]) : "",
        on_incorrect_attempt_1: outcome.incorrectDefaultUtteranceIds.length ? textFor(outcome.incorrectDefaultUtteranceIds[0]) : "",
        on_incorrect_attempt_2: outcome.incorrectDefaultUtteranceIds.length ? textFor(outcome.incorrectDefaultUtteranceIds[0]) : "",
        worked_explanation: steps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: steps,
        worked_narration: []
      },
      mathematical_support: hintId ? { hint_1: textFor(hintId) } : {},
      runtimeOutcome: outcome,
      runtimeUtteranceIds,
      primaryErrorFamily: "unknown",
      errorFamily: "unknown",
      errorClassification: { fallback: "unknown", requiresRepeatedEvidence: true },
      recovery_item_ref: repairByFamily.unknown,
      canonicalQuestion: question
    };
  }

  function convertRepair(id, repair) {
    return {
      id: prefix(id),
      canonicalQuestionId: id,
      stage: "repair",
      target: repair.title,
      assessmentIntent: `repair_${repair.errorFamily}`,
      evidenceFamily: evidenceFamily({ assessmentIntent: repair.errorFamily }),
      prompt: repair.title,
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: {
        context: "fra24",
        questionId: id,
        canonicalRepair: repair,
        visual: { kind: "repair_panel", errorFamily: repair.errorFamily },
        workedSteps: []
      },
      visual: { primitive: "fra24_context", action: "repair", description: repair.title },
      scripts: { reteach: textsFor(repair.runtimeUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.runtimeUtteranceIds],
      supportedInteractionId: repair.supportedInteractionId ? prefix(repair.supportedInteractionId) : null,
      freshCheckId: repair.freshCheckId ? prefix(repair.freshCheckId) : null,
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily }
    };
  }

  function convertCue(cue) {
    return {
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchor,
      anchorText: cue.anchor,
      action: cue.id.toLowerCase(),
      target: [cue.id],
      accessibleLabel: cue.reducedMotionAction
    };
  }

  function cuesForScene(scene) {
    const ids = new Set(scene.cueIds || []);
    return approved.FRA24_CUES.filter((cue) => ids.has(cue.id)).map(convertCue);
  }

  function teachingStep(id, scene, nextId, utteranceIds) {
    const ids = utteranceIds || scene.runtimeUtteranceIds;
    const cues = cuesForScene(scene).filter((cue) => ids.includes(cue.utteranceId));
    return {
      id,
      purpose: scene.purpose,
      scene: {
        display_title: id === "HOOK" ? "A fraction of a fraction" : id === "HANDOFF" ? "Try the idea" : "Multiply two fractions",
        initial_state: scene.purpose,
        objects: [scene.visual.kind],
        model: { context: "fra24", sceneId: id, visual: scene.visual }
      },
      narration: { script: textsFor(ids), utterance_ids: [...ids], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      next_step: nextId
    };
  }

  function buildHookQuestion() {
    const scene = approved.FRA24_TEACHING_SCENES.HOOK;
    const labels = {
      less_than_half: "Less than half",
      exactly_half: "Exactly half",
      more_than_half: "More than half",
      show_me: "Show me"
    };
    const feedbackIds = {
      less_than_half: "HOOK.FEEDBACK.LESS",
      exactly_half: "HOOK.FEEDBACK.EXACT",
      more_than_half: "HOOK.FEEDBACK.MORE",
      show_me: "HOOK.FEEDBACK.SHOW"
    };
    const revealIds = ["HOOK.REVEAL.1", "HOOK.REVEAL.2", "HOOK.REVEAL.3", "HOOK.REVEAL.4", "HOOK.REVEAL.5"];
    const linesByLabel = Object.fromEntries(Object.keys(labels).map((id) => [labels[id], textsFor([feedbackIds[id], ...revealIds])]));
    const idsByLabel = Object.fromEntries(Object.keys(labels).map((id) => [labels[id], [feedbackIds[id], ...revealIds]]));
    const cues = cuesForScene(scene).filter((cue) => revealIds.includes(cue.utteranceId));
    return {
      id: prefix("HOOK-CHOICE"),
      canonicalQuestionId: "HOOK-CHOICE",
      stage: "opening",
      target: "Predict the fraction-of-a-fraction overlap",
      assessmentIntent: "unscored_prediction",
      evidenceFamily: "opening_choice",
      prompt: "What fraction of the whole map do you think will be both unlocked and scanned?",
      response: { type: "single_choice", options: Object.values(labels), optionIds: Object.fromEntries(Object.entries(labels).map(([id, label]) => [label, id])), keyboard_submit: true },
      answer: { value: labels.exactly_half },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Reveal the scan" },
      model: { context: "fra24", questionId: "HOOK-CHOICE", canonicalScene: scene, visual: scene.visual, workedSteps: [] },
      visual: { primitive: "fra24_context", action: "choice", description: "Predict before the scan is revealed.", syncCues: cues },
      scripts: {
        engagement_response_by_value: linesByLabel,
        engagement_visible_by_id: Object.fromEntries(Object.keys(labels).map((id) => [id, textFor(feedbackIds[id])])),
        engagement_label: "Your prediction"
      },
      runtimeOutcome: { responseUtteranceIdsByValue: idsByLabel },
      runtimeUtteranceIds: Object.values(idsByLabel).flat(),
      primaryErrorFamily: "unknown",
      errorClassification: { fallback: "unknown", requiresRepeatedEvidence: false }
    };
  }

  function buildQuestions() {
    return [
      buildHookQuestion(),
      ...Object.values(approved.FRA24_ALL_QUESTIONS).map(convertQuestion),
      ...Object.entries(approved.FRA24_REPAIRS).map(([id, repair]) => convertRepair(id, repair))
    ];
  }

  function submissionFor(question, response) {
    const canonicalQuestion = question.canonicalQuestion;
    if (!canonicalQuestion) return null;
    if (question.response.type === "fraction") {
      return { kind: "fraction", numerator: Number(response?.n), denominator: Number(response?.d), methodEvidence: response?.methodEvidence };
    }
    if (question.response.type === "integer") return { kind: "integer", value: Number(response?.value ?? response), methodEvidence: response?.methodEvidence };
    const optionId = question.response.optionIds?.[String(response)] || String(response || "");
    return { kind: "choice", optionId };
  }

  function evaluateResponse(question, response) {
    const id = questionId(question);
    const submission = submissionFor(question, response);
    if (!submission || !approved.FRA24_ALL_QUESTIONS[id]) {
      return { correct: false, valueCorrect: false, formCorrect: false, errorFamily: "unknown", outcomeSignal: "default" };
    }
    const marked = approved.markFRA24Response(id, submission);
    let outcomeSignal = marked.outcomeSignal || "default";
    if (id === "I2" && marked.errorFamily === "arithmetic_slip") outcomeSignal = "row_error";
    if (!marked.correct && marked.errorFamily === "unknown" && id === "M2" && submission.kind === "fraction") {
      const raw = rawProduct(question.canonicalQuestion);
      if (submission.denominator === raw.denominator && submission.numerator !== raw.numerator) outcomeSignal = "overlap_error";
      else if (submission.numerator === raw.numerator && submission.denominator !== raw.denominator) outcomeSignal = "whole_error";
    }
    return {
      correct: marked.correct === true,
      valueCorrect: marked.mathematicallyEquivalent === true,
      formCorrect: marked.formComplete === true,
      errorFamily: marked.errorFamily || "unknown",
      outcomeSignal,
      visibleText: visibleFeedback(question, response, marked.correct === true, outcomeSignal)
    };
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const outcome = question.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    const evaluation = evaluateResponse(question, response);
    return [...(outcome.errorSpecificUtteranceIdsByFamily?.[evaluation.outcomeSignal]
      || outcome.errorSpecificUtteranceIdsByFamily?.[evaluation.errorFamily]
      || outcome.incorrectDefaultUtteranceIds
      || [])];
  }

  function visibleFeedback(question, response, correct, suppliedSignal) {
    const outcome = question.runtimeOutcome || {};
    let ids;
    if (correct) ids = outcome.correctUtteranceIds || [];
    else {
      const evaluation = suppliedSignal ? { outcomeSignal: suppliedSignal, errorFamily: suppliedSignal } : evaluateResponse(question, response);
      ids = outcome.errorSpecificUtteranceIdsByFamily?.[evaluation.outcomeSignal]
        || outcome.errorSpecificUtteranceIdsByFamily?.[evaluation.errorFamily]
        || outcome.incorrectDefaultUtteranceIds
        || [];
    }
    return ids.length ? textFor(ids[0]) : "";
  }

  function classifyErrorFamily(question, response) {
    return evaluateResponse(question, response).errorFamily || "unknown";
  }

  function requiresRepeatedEvidence(question, response) {
    return ["add", "cross", "keep_denominator", "common_denominator_needed", "improper_invalid", "mixed_conversion", "form"]
      .includes(classifyErrorFamily(question, response));
  }

  function shouldSkipF1(records) {
    return approved.shouldSkipFRA24F1((records || []).map((record) => ({ ...record, questionId: unprefix(record.questionId) }))) === true;
  }

  function evaluateFinalEvidence(records) {
    return approved.evaluateFRA24Final((records || []).map((record) => ({ ...record, questionId: unprefix(record.questionId) })));
  }

  function stableSeed(value) {
    let hash = 2166136261;
    for (const char of String(value || "fra24")) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function selectRecoveryQuestionIds(route, missedFamilies, seenIds, seedSource) {
    return approved.selectFRA24RecoveryItemIds(
      route,
      missedFamilies,
      (seenIds || []).map(unprefix),
      stableSeed(seedSource)
    ).map(prefix);
  }

  function validateRuntimeContract() {
    const issues = [...approved.validateFRA24CanonicalSpec()];
    try { approved.assertFRA24CanonicalSpec(); } catch (error) { issues.push(error.message); }
    try { approved.runFRA24StaticAssertions(); } catch (error) { issues.push(error.message); }
    return issues;
  }

  function apply(spec) {
    if (!canonical || !Object.keys(runtimeCopy).length) throw new Error("FRA24 owner-approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA24 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const byRawId = (id) => questionBank.find((question) => question.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, {
      id: LESSON_ID,
      title: canonical.title,
      status: canonical.status,
      version: CONTENT_VERSION,
      estimated_minutes: 27
    });
    spec.learning_objective = canonical.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, {
      required_skill_refs: ["FRA-02", "FRA-23"],
      supporting_prerequisite_refs: ["P-N01"]
    });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const scenes = approved.FRA24_TEACHING_SCENES;
    const hookInitialIds = ["HOOK.1", "HOOK.2", "HOOK.3"];
    const hookChoice = {
      id: "HOOK-CHOICE",
      purpose: "Commit to a prediction before the overlap is revealed",
      scene: { display_title: "Predict the overlap", initial_state: "The grid is not revealed yet.", objects: ["map_overlap_grid"], model: { context: "fra24", sceneId: "HOOK-CHOICE", visual: scenes.HOOK.visual } },
      narration: { script: [], utterance_ids: [], sync_cues: [] },
      animation_timeline: [],
      learner_interaction: { question_ref: prefix("HOOK-CHOICE") },
      next_step: "T1"
    };
    spec.lesson.teaching_steps = [
      teachingStep("HOOK", scenes.HOOK, "HOOK-CHOICE", hookInitialIds),
      hookChoice,
      teachingStep("T1", scenes.T1, "T2"),
      teachingStep("T2", scenes.T2, "T3"),
      teachingStep("T3", scenes.T3, "T4"),
      teachingStep("T4", scenes.T4, "HANDOFF"),
      teachingStep("HANDOFF", scenes.HANDOFF, "G1")
    ];

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
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Approved FRA24 route only.", between_question_transition: "" };

    const confirmationIds = [
      ...Object.keys(approved.FRA24_CONFIRMATIONS),
      ...Object.keys(approved.FRA24_REPAIR_ITEMS),
      ...Object.keys(approved.FRA24_RECOVERY_ITEMS)
    ].map(prefix);
    spec.lesson.exit = {
      intro_script: textsFor(approved.FRA24_ROUTE.finalIntroUtteranceIds),
      primary_question_refs: approved.FRA24_ROUTE.final.questionIds.map(prefix),
      confirmation_question_refs: confirmationIds,
      use_question_before_submit_narration: false,
      mastery_policy: {
        profile: "fra24_five_item",
        secureMinimum: 4,
        totalItems: 5,
        requireDirectProcedure: true,
        requireBreadth: true,
        repeatedCentralFamilies: ["add", "cross", "keep_denominator", "common_denominator_needed", "improper_invalid"],
        nearSecureRecoveryCount: 2,
        insecureRecoveryCount: 3,
        repairCycleCapPerFamily: 1
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra24_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: Object.fromEntries(Object.entries(approved.FRA24_CONFIRMATION_MAP).map(([id, confirmationId]) => [prefix(id), prefix(confirmationId)])),
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: freshChecksByFamily
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: [textFor(approved.FRA24_ROUTE.completionUtteranceId)], buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "One more pass will help", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      voice_id: "en-GB-RyanNeural",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: {
        mode: "browser_speech_ryan",
        require_ryan_voice: true,
        browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
        timing_source: "provider_word_boundaries_with_deterministic_fallback"
      },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra24_context", same_whole: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra24_context", "fraction_input", "integer_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "fra24-owner-approved-v1",
      engine_profile: "fra24",
      runtime_applied: true,
      owner_review_status: canonical.status,
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: canonical.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn — support nearby", independent: "Now you take over", repair: "Targeted repair", exit: "Final check", completion: "Lesson complete" },
      route_contract: approved.FRA24_ROUTE,
      capabilities: { exact_fraction_equivalence: true, simplest_form_when_requested: true, live_ryan_word_boundaries: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, targeted_repairs: true, supported_repair_interactions: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra24Canonical = {
    apply,
    buildQuestions,
    classifyErrorFamily,
    evaluateFinalEvidence,
    evaluateResponse,
    freshChecksByFamily,
    repairByFamily,
    requiresRepeatedEvidence,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    selectRecoveryQuestionIds,
    shouldSkipF1,
    textFor,
    validateRuntimeContract,
    visibleFeedback
  };
})();
