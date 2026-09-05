(function () {
  "use strict";

  const LESSON_ID = "FRA-15";
  const CONTENT_VERSION = "fra15-quantity-as-fraction-v1";
  const source = window.RevilyFra15Approved;
  const approved = source?.FRA15;
  const runtimeCopy = source?.FRA15_RUNTIME_COPY || window.FRA15_RUNTIME_COPY || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;

  const repairByFamily = Object.freeze({
    order: prefix("R-ORDER"),
    total: prefix("R-TOTAL"),
    combine: prefix("R-COMBINE"),
    smallness_bias: prefix("R-SMALL"),
    form: prefix("R-FORM"),
    units: prefix("R-UNITS")
  });
  const repairCheckByFamily = Object.freeze({
    order: prefix("R-ORDER-CHECK"),
    total: prefix("R-TOTAL-CHECK"),
    combine: prefix("R-COMBINE-CHECK"),
    smallness_bias: prefix("R-SMALL-CHECK"),
    form: prefix("R-FORM-CHECK"),
    units: prefix("R-UNITS-CHECK")
  });
  const confirmationByFamily = Object.freeze({
    order: prefix("C-ORDER"),
    total: prefix("C-TOTAL"),
    combine: prefix("C-COMBINE"),
    smallness_bias: prefix("C-SMALL"),
    form: prefix("C-FORM"),
    units: prefix("C-UNITS")
  });

  function runtimeEntry(id, registry) {
    const entry = (registry || runtimeCopy)[id];
    if (!entry) throw new Error(`Missing FRA15 runtime utterance: ${id}`);
    return entry;
  }

  const textFor = (id) => runtimeEntry(id).text;
  const textsFor = (ids) => (ids || []).map(textFor);
  const fractionText = (value) => `${value.numerator}/${value.denominator}`;

  function normaliseWorkedStep(step) {
    return String(step || "").replace(/Ã·/g, "÷").replace(/->/g, "→");
  }

  function cuesFor(timeline) {
    return (timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/\./g, "-"),
      accessibleLabel: null
    }));
  }

  function responseFor(question) {
    if (question.response.kind === "fraction_input") {
      return {
        type: "fraction",
        partLabel: "Numerator: quantity being expressed",
        wholeLabel: "Denominator: reference quantity",
        accept_equivalent_notation: question.answer.requiredForm !== "simplest"
      };
    }
    if (question.response.kind === "single_choice") {
      const options = question.response.options.map((option) => option.label);
      return {
        type: "single_choice",
        options,
        optionIds: Object.fromEntries(question.response.options.map((option) => [option.label, option.id])),
        keyboard_submit: true
      };
    }
    if (question.response.kind === "matching") {
      const statements = question.visual?.statements || Object.keys(question.answer.pairs || {});
      const fractionOptions = (question.visual?.fractionCards || []).map(fractionText);
      return {
        type: "paired_classification",
        items: statements.map((statement) => ({ id: statement, label: statement })),
        classification_options: fractionOptions,
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA15 response kind ${question.response.kind}`);
  }

  function answerFor(question) {
    if (question.answer.kind === "fraction") return fractionText(question.answer.canonicalFraction);
    if (question.answer.kind === "choice") {
      return question.response.options.find((option) => option.id === question.answer.optionId)?.label || question.answer.optionId;
    }
    if (question.answer.kind === "matching") {
      const statements = question.visual?.statements || Object.keys(question.answer.pairs || {});
      return statements.map((statement) => question.answer.pairs[statement]);
    }
    throw new Error(`${question.id}: unsupported FRA15 answer kind ${question.answer.kind}`);
  }

  function engineResponseToCanonical(question, response) {
    const raw = question?.canonicalQuestion || question;
    if (raw.response?.kind === "fraction_input") {
      return {
        numerator: Number(response?.n),
        denominator: Number(response?.d)
      };
    }
    if (raw.response?.kind === "single_choice") {
      return question.response?.optionIds?.[String(response)] || String(response ?? "");
    }
    if (raw.response?.kind === "matching") {
      const statements = raw.visual?.statements || Object.keys(raw.answer?.pairs || {});
      const values = Array.isArray(response) ? response.map(String) : [];
      const mapped = Object.fromEntries(statements.map((statement, index) => [statement, values[index]]));
      const expected = raw.answer?.pairs || {};
      if (statements.every((statement) => mapped[statement] === expected[statement])) return mapped;
      if (statements.length === 2 && mapped[statements[0]] === expected[statements[1]] && mapped[statements[1]] === expected[statements[0]]) {
        return "both_mappings_swapped";
      }
      return "one_mapping_wrong";
    }
    return response;
  }

  function visibleTextFor(question, classification) {
    const firstId = classification.outcomeUtteranceIds?.[0];
    return firstId ? textFor(firstId) : "";
  }

  function evaluateRepair(question, response) {
    const expected = question.answer?.value;
    let correct = false;
    if (question.response.type === "fraction") {
      const raw = question.repairAnswer;
      const canonicalResponse = { numerator: Number(response?.n), denominator: Number(response?.d) };
      correct = source.evaluateFractionResponse(raw, canonicalResponse).correct;
    } else {
      correct = String(response ?? "") === String(expected ?? "");
    }
    return { correct, errorFamily: correct ? null : question.primaryErrorFamily, candidateFamilies: [], classificationRule: correct ? "correct" : "supported_repair_retry", utteranceIds: [], visibleText: "" };
  }

  function evaluateResponse(question, response) {
    if (question?.canonicalRepair) return evaluateRepair(question, response);
    const raw = question?.canonicalQuestion;
    if (!raw) return { correct: false, errorFamily: "unknown", candidateFamilies: ["unknown"], classificationRule: "unknown", utteranceIds: [], visibleText: "" };
    const classification = source.classifyFRA15Response(raw.id, engineResponseToCanonical(question, response));
    return {
      correct: classification.correct === true,
      errorFamily: classification.primaryFamily,
      candidateFamilies: [...(classification.candidateFamilies || [])],
      classificationRule: classification.classificationRule,
      utteranceIds: [...(classification.outcomeUtteranceIds || [])],
      visibleText: visibleTextFor(question, classification)
    };
  }

  function selectOutcomeUtteranceIds(question, response, expectedCorrect) {
    const evaluation = evaluateResponse(question, response);
    if (typeof expectedCorrect === "boolean" && evaluation.correct !== expectedCorrect) {
      throw new Error(`${question.id}: FRA15 outcome request did not match computed correctness.`);
    }
    return [...evaluation.utteranceIds];
  }

  function requiresRepeatedEvidence(question, response) {
    const rule = evaluateResponse(question, response).classificationRule || "";
    return /tentative|allow_interface|insufficient|ambiguous/.test(rule);
  }

  function convertQuestion(raw, additions) {
    const correctIds = [...(raw.feedback?.correctUtteranceIds || [])];
    const defaultIds = [...(raw.feedback?.incorrectDefaultUtteranceIds || [])];
    const workedIds = [...(raw.workedCheck?.ryanUtteranceIds || [])];
    const question = {
      id: prefix(raw.id),
      stage: raw.stage,
      family: raw.family || raw.evidenceFamily || "comparison_order",
      evidenceFamily: raw.evidenceFamily || raw.family || "comparison_order",
      target: raw.authorOnlyAssessmentIntent || raw.authorOnlyPurpose || "Express one named quantity as a fraction of its named reference.",
      assessmentIntent: raw.authorOnlyAssessmentIntent || raw.authorOnlyPurpose || "FRA15 comparison evidence",
      prompt: raw.prompt,
      response: responseFor(raw),
      answer: { value: answerFor(raw) },
      attempt_policy: { submit_label: raw.response.submitLabel || "Check answer" },
      policy: {
        scored: raw.policy?.scored !== false,
        answerLocksOnSubmit: raw.policy?.answerLocksOnSubmit === true,
        hintPolicy: raw.policy?.hintPolicy === "optional" ? "optional" : "none",
        solutionPolicy: raw.policy?.solutionPolicy || "after_response",
        requiresFreshNoHintConfirmationIfHintUsed: raw.policy?.requiresFreshNoHintConfirmationIfHintUsed === true,
        countsAsIndependentEvidence: ["independent", "final", "recovery_final"].includes(raw.stage),
        canonicalSignature: raw.freshnessKey || raw.id
      },
      model: {
        context: "fra15",
        kind: raw.visual?.kind,
        source: raw.source || null,
        visual: raw.visual || {},
        workedCheck: raw.workedCheck || null,
        canonicalSignature: raw.freshnessKey || raw.id,
        accessibleDescription: accessibleDescription(raw)
      },
      visual: { primitive: "fra15_context", description: accessibleDescription(raw) },
      scripts: {
        before_submit: textsFor(raw.preSubmitUtteranceIds),
        hint: textsFor(raw.hintUtteranceIds)[0] || "",
        on_correct_reaction: correctIds[0] ? textFor(correctIds[0]) : "",
        on_incorrect_reaction: defaultIds[0] ? textFor(defaultIds[0]) : "",
        worked_narration: textsFor(workedIds),
        worked_explanation: (raw.workedCheck?.visibleSteps || []).map((step, index) => `${index + 1}. ${normaliseWorkedStep(step)}`).join(" ")
      },
      runtimeHintUtteranceIds: [...(raw.hintUtteranceIds || [])],
      runtimeOutcome: {
        correctUtteranceIds: correctIds,
        incorrectDefaultUtteranceIds: defaultIds,
        incorrectByPattern: raw.feedback?.incorrectByPattern || [],
        workedUtteranceIds: workedIds
      },
      canonicalQuestion: raw,
      primaryErrorFamily: raw.family || "unknown",
      errorClassification: { fallback: "unknown" }
    };
    return Object.assign(question, additions || {});
  }

  function repairFractionAnswer(profile) {
    const interaction = profile.supportedInteraction;
    if (interaction.acceptedPlacement) return { ...interaction.acceptedPlacement, requiredForm: "exact_equivalent", canonicalFraction: interaction.acceptedPlacement };
    if (interaction.acceptedFraction) return { ...interaction.acceptedFraction, requiredForm: "exact_equivalent", canonicalFraction: interaction.acceptedFraction };
    if (interaction.acceptedSimplestFraction) return { ...interaction.acceptedSimplestFraction, requiredForm: "simplest", canonicalFraction: interaction.acceptedSimplestFraction };
    return null;
  }

  function convertRepair(profile) {
    const isChoice = profile.supportedInteraction.kind === "choose_reference_group";
    const repairAnswer = repairFractionAnswer(profile);
    const options = ["White group: 4 counters", "Whole set: 10 counters"];
    return {
      id: prefix(profile.id),
      stage: "repair",
      family: profile.family,
      evidenceFamily: profile.family,
      target: profile.authorOnlyPurpose,
      assessmentIntent: profile.authorOnlyPurpose,
      prompt: isChoice ? "Choose the reference for black as a fraction of white." : "Use the supported model to build the fraction.",
      response: isChoice
        ? { type: "single_choice", options, keyboard_submit: true }
        : { type: "fraction", partLabel: "Numerator", wholeLabel: "Denominator", accept_equivalent_notation: repairAnswer.requiredForm !== "simplest" },
      answer: { value: isChoice ? options[0] : fractionText(repairAnswer.canonicalFraction) },
      repairAnswer: isChoice ? null : repairAnswer,
      policy: { scored: false, answerLocksOnSubmit: false, hintPolicy: "none", solutionPolicy: "after_response", countsAsIndependentEvidence: false },
      model: { context: "fra15", kind: profile.visual.kind, source: null, visual: profile.visual, accessibleDescription: accessibleDescription(profile) },
      visual: { primitive: "fra15_context", description: accessibleDescription(profile), syncCues: cuesFor(profile.timeline) },
      scripts: { reteach: textsFor(profile.ryanUtteranceIds), before_submit: [], on_correct_reaction: "", on_incorrect_reaction: "", worked_narration: [], worked_explanation: "" },
      canonicalRepair: profile,
      primaryErrorFamily: profile.family,
      freshCheckId: prefix(profile.freshCheck.id)
    };
  }

  function buildQuestions() {
    return [
      ...source.FRA15_QUESTIONS.map((question) => convertQuestion(question)),
      ...source.FRA15_FINAL_QUESTIONS.map((question) => convertQuestion(question)),
      ...source.FRA15_CONFIRMATION_QUESTIONS.map((question) => convertQuestion(question, { isFreshConfirmation: true })),
      ...source.FRA15_REPAIR_PROFILES.map((profile) => convertQuestion(profile.freshCheck, { isFreshConfirmation: true, isRepairCheck: true, family: profile.family, primaryErrorFamily: profile.family })),
      ...source.FRA15_RECOVERY_FINALS.map((question) => convertQuestion(question, { isReplacementFinal: true })),
      ...source.FRA15_REPAIR_PROFILES.map(convertRepair)
    ];
  }

  const sceneTitles = Object.freeze({
    HOOK: "The words decide the order",
    T1: "First named quantity, then reference",
    T2: "Reverse the words, reverse the fraction",
    T3: "The reference is not automatically the total",
    T4: "Order first, simplify second",
    T5: "Check the side of one",
    HANDOFF: "Choose the order"
  });

  function teachingStep(scene, nextId) {
    const utteranceIds = [...(scene.ryanUtteranceIds || [])];
    const cues = cuesFor(scene.timeline);
    return {
      id: scene.id,
      purpose: scene.authorOnlyPurpose,
      scene: {
        display_title: sceneTitles[scene.id],
        initial_state: accessibleDescription(scene),
        objects: [scene.visual.kind],
        model: { context: "fra15", sceneId: scene.id, visual: scene.visual, canonicalScene: scene, accessibleDescription: accessibleDescription(scene) }
      },
      narration: { script: textsFor(utteranceIds), utterance_ids: utteranceIds, sync_cues: cues },
      animation_timeline: cues,
      learner_interaction: scene.interaction || { kind: "none" },
      learner_action: scene.id === "HOOK" ? { button: "Show me" } : null,
      pause_after_narration: scene.id === "HOOK",
      next_step: nextId
    };
  }

  function accessibleDescription(raw) {
    const visual = raw?.visual || {};
    const sourceData = raw?.source || {};
    const kind = visual.kind || "comparison";
    const expressed = sourceData.expressed;
    const reference = sourceData.reference;
    const valueOf = (quantity) => quantity?.count ?? quantity?.value;
    if (expressed && reference) {
      if (raw?.policy?.scored === true) {
        return `${kind.replace(/_/g, " ")}. Two quantities are shown: ${quantityLabelForDescription(expressed, "first quantity")} ${valueOf(expressed)}${expressed.unit ? ` ${expressed.unit}` : ""}, and ${quantityLabelForDescription(reference, "second quantity")} ${valueOf(reference)}${reference.unit ? ` ${reference.unit}` : ""}.`;
      }
      return `${kind.replace(/_/g, " ")}. The quantity being expressed is ${expressed.id ? expressed.id.replace(/_/g, " ") : "the first quantity"}, ${valueOf(expressed)}${expressed.unit ? ` ${expressed.unit}` : ""}. The reference is ${reference.id ? reference.id.replace(/_/g, " ") : "the second quantity"}, ${valueOf(reference)}${reference.unit ? ` ${reference.unit}` : ""}.`;
    }
    if (Array.isArray(visual.quantities)) {
      return `${kind.replace(/_/g, " ")} showing ${visual.quantities.map((quantity) => `${quantity.label || quantity.id}: ${quantity.value} ${quantity.unit || ""}`.trim()).join(" and ")}.`;
    }
    if (Array.isArray(visual.groups)) return `${kind.replace(/_/g, " ")} with ${visual.groups.map((group) => `${group.count} ${group.id}`).join(" and ")}.`;
    return `A ${kind.replace(/_/g, " ")} model for deciding which quantity is the numerator and which is the reference denominator.`;
  }

  function quantityLabelForDescription(quantity, fallback) {
    return String(quantity?.label || quantity?.id || fallback).replace(/_/g, " ");
  }

  function validateRuntimeContract(registry, lessonSource) {
    const selectedRegistry = registry || runtimeCopy;
    const selectedSource = lessonSource || approved;
    const issues = [...(source?.validateFRA15CanonicalSpec?.() || [])];
    Object.entries(selectedRegistry).forEach(([id, entry]) => {
      if (!String(entry?.text || "").trim()) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
    });
    const visit = (value) => {
      if (Array.isArray(value)) return value.forEach(visit);
      if (!value || typeof value !== "object") return;
      if (Object.prototype.hasOwnProperty.call(value, "captionText")) issues.push("captionText is forbidden");
      Object.entries(value).forEach(([key, child]) => {
        if (/UtteranceIds$/.test(key) && Array.isArray(child)) child.forEach((id) => { if (!selectedRegistry[id]) issues.push(`Missing runtime utterance ${id}`); });
        visit(child);
      });
      if (value.utteranceId && value.anchorText) {
        const entry = selectedRegistry[value.utteranceId];
        if (!entry) issues.push(`Cue points to missing utterance ${value.utteranceId}`);
        else if (!entry.text.toLocaleLowerCase("en-GB").includes(String(value.anchorText).toLocaleLowerCase("en-GB"))) issues.push(`Cue anchor is absent from ${value.utteranceId}`);
      }
    };
    visit(selectedSource);
    return [...new Set(issues)];
  }

  function validateQuestionModel(question) {
    const raw = question?.canonicalQuestion;
    if (question?.canonicalRepair) return [];
    if (!raw) return ["FRA15 canonical question data is missing"];
    const issues = [];
    if (raw.answer?.kind === "fraction") {
      if (!Number.isInteger(raw.answer.canonicalFraction?.numerator)) issues.push("canonical numerator must be an integer");
      if (!Number.isInteger(raw.answer.canonicalFraction?.denominator) || raw.answer.canonicalFraction.denominator <= 0) issues.push("canonical denominator must be a positive integer");
    }
    if (raw.source?.kind === "two_group_comparison" && raw.visual?.counterCountsMustMatchSource) {
      if (!Number.isInteger(raw.source.expressed?.count) || !Number.isInteger(raw.source.reference?.count)) issues.push("counter groups need integer counts");
      if (raw.source.total !== raw.source.expressed.count + raw.source.reference.count) issues.push("counter total must equal both group counts");
    }
    if (raw.response?.kind === "matching" && Object.keys(raw.answer?.pairs || {}).length !== 2) issues.push("matching requires two authored pairs");
    return issues;
  }

  function finalRecords(questionIds, responses, evidence, getQuestion) {
    return (questionIds || []).map((questionId) => {
      const question = getQuestion(questionId);
      const saved = responses?.[questionId];
      const recorded = evidence?.errorFamily?.[questionId];
      const candidate = evidence?.candidateErrorFamily?.[questionId];
      return {
        questionId,
        family: question?.evidenceFamily,
        correct: saved?.correct === true,
        firstAttemptCorrect: evidence?.firstAttemptCorrect?.[questionId] === true,
        hintUsed: evidence?.hintOpenedBeforeSubmit?.[questionId] === true,
        errorFamily: saved?.correct ? null : (recorded === "support_needed" ? candidate : recorded) || candidate || "unknown"
      };
    });
  }

  function evaluateFinalEvidence(records, context) {
    const clean = (records || []).filter((record) => record.correct && record.firstAttemptCorrect && !record.hintUsed);
    const blocking = new Set(approved.route.finalDecision.blockingRepeatedFamilies);
    const counts = {};
    (records || []).forEach((record) => { if (blocking.has(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1; });
    const repeatedBlockingFamilies = [...new Set([
      ...Object.keys(counts).filter((family) => counts[family] >= 2),
      ...((context?.repeatedBlockingFamilies || []).filter((family) => blocking.has(family)))
    ])];
    const distinctEvidenceFamiliesCorrect = new Set(clean.map((record) => record.family).filter(Boolean)).size;
    const route = source.routeFRA15FinalCheck({
      correctCount: clean.length,
      firstAttemptIndependentCorrectCount: clean.length,
      distinctEvidenceFamiliesCorrect,
      repeatedBlockingMisconception: repeatedBlockingFamilies.length > 0
    });
    return { correctCount: clean.length, distinctEvidenceFamiliesCorrect, repeatedBlockingFamilies, route, masterySatisfied: route === "finish_candidate" };
  }

  function recoveryFinalIds() {
    return source.FRA15_RECOVERY_FINALS.map((question) => prefix(question.id));
  }

  function confirmationIdForFamily(family, useRepairCheck) {
    return (useRepairCheck ? repairCheckByFamily : confirmationByFamily)[family] || null;
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA15 canonical source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA15 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02", "FRA-10"] });
    spec.curriculum = Object.assign({}, spec.curriculum, { learning_objective: approved.scope.objective });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const sceneNext = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "T5", T5: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = source.FRA15_TEACHING_SCENES.map((scene) => teachingStep(scene, sceneNext[scene.id]));
    const transferNext = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(["G1", "G2", "F1", "F2", "I1", "I2"].map((id) => {
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
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Only approved FRA15 confirmations and repairs are used.", between_question_transition: "" };
    spec.lesson.exit = {
      intro_script: textsFor(approved.route.finalIntroUtteranceIds),
      use_question_before_submit_narration: true,
      primary_question_refs: source.FRA15_FINAL_QUESTIONS.map((item) => prefix(item.id)),
      confirmation_question_refs: [
        ...source.FRA15_CONFIRMATION_QUESTIONS.map((item) => prefix(item.id)),
        ...source.FRA15_REPAIR_PROFILES.map((profile) => prefix(profile.freshCheck.id)),
        ...source.FRA15_RECOVERY_FINALS.map((item) => prefix(item.id))
      ],
      post_repair_retest_refs: source.FRA15_RECOVERY_FINALS.map((item) => prefix(item.id)),
      mastery_policy: { profile: "fra15_five_item", secureMinimum: 4, totalItems: 5, repairCycleCapPerFamily: 1, blockRepeatedCentralMisconception: true, repeatedCentralFamilies: [...approved.route.finalDecision.blockingRepeatedFamilies] }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra15_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-ORDER"),
        [prefix("F2")]: prefix("C-TOTAL"),
        [prefix("I1")]: prefix("C-SMALL"),
        [prefix("I2")]: prefix("R-ORDER-CHECK")
      },
      repair_by_error_family: { ...repairByFamily },
      fresh_checks_by_error_family: Object.fromEntries(Object.entries(repairCheckByFamily).map(([family, id]) => [family, [id]])),
      confirmation_by_error_family: { ...confirmationByFamily },
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "FRA-15 complete", ryan_script: textsFor(approved.route.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building the comparison order", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
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
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra15_context", preserve_quantity_order: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra15_context", "fraction_input", "single_choice", "paired_classification", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "FRA15-STORYBOARD-V1",
      engine_profile: "fra15",
      exact_runtime_copy: true,
      runtime_applied: true,
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn - support nearby", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      route_contract: approved.route,
      migration: { resetIncompatibleState: true, preserveSoundPreference: true, preserveDeveloperPreference: true, archivePreviousAttempt: true, preserveLegacyMastery: false, resetTo: "HOOK" },
      capabilities: { quantity_as_fraction: true, optional_hints: true, hint_evidence: true, post_lock_working: true, targeted_repairs: true, fresh_confirmations: true, recovery_finals: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra15Canonical = {
    CONTENT_VERSION,
    apply,
    buildQuestions,
    confirmationIdForFamily,
    engineResponseToCanonical,
    evaluateFinalEvidence,
    evaluateResponse,
    finalRecords,
    recoveryFinalIds,
    repairByFamily,
    repairCheckByFamily,
    requiresRepeatedEvidence,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    textFor,
    validateQuestionModel,
    validateRuntimeContract
  };
})();
