(function () {
  "use strict";

  const LESSON_ID = "FRA-16";
  const CONTENT_VERSION = "fra16-runtime-v1";
  const source = window.RevilyFra16V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const prefixed = (id) => `${LESSON_ID}-${id}`;
  const repairIds = {
    numerator_only: prefixed("R-NUM"),
    denominator_only: prefixed("R-DEN"),
    inconsistent_equivalence: prefixed("R-EQUIV"),
    equality_rejected: prefixed("R-EQUIV"),
    symbol_or_order_direction: prefixed("R-SYMBOL")
  };
  const repairFreshByFamily = {
    numerator_only: prefixed("RN-C"),
    denominator_only: prefixed("RD-C"),
    inconsistent_equivalence: prefixed("RE-C"),
    equality_rejected: prefixed("RF-EQ"),
    symbol_or_order_direction: prefixed("RS-C")
  };
  const sceneTitles = {
    HOOK: "Same game, different stage sizes",
    T1: "Make the comparison fair",
    T2: "Match the part size",
    T3: "Use one half exactly",
    T4: "Order three fractions",
    T5: "Compare fractions above one",
    HANDOFF: "Choose an exact route"
  };
  const repairTitles = {
    "R-NUM": "Match the part size before comparing numerators",
    "R-DEN": "A denominator names the part size",
    "R-EQUIV": "Keep the fraction value fixed",
    "R-SYMBOL": "Make the symbol match the size comparison"
  };

  function runtimeEntry(id, registry) {
    const entry = (registry || runtimeCopy)[id];
    if (!entry) throw new Error(`Missing FRA16 runtime utterance: ${id}`);
    return entry;
  }

  const textFor = (id) => runtimeEntry(id).text;
  const textsFor = (ids) => (ids || []).map(textFor);
  const fractionDisplayById = (question) => Object.fromEntries((question.fractions || []).map((item) => [item.id, item.display]));

  function stableResponseKey(response) {
    if (Array.isArray(response)) return response.map(String).join("|");
    if (response && typeof response === "object") {
      return JSON.stringify(Object.keys(response).sort().reduce((result, key) => {
        result[key] = response[key];
        return result;
      }, {}));
    }
    return String(response ?? "");
  }

  function arraysEqual(left, right) {
    return Array.isArray(left) && Array.isArray(right)
      && left.length === right.length
      && left.every((value, index) => String(value) === String(right[index]));
  }

  function answerFor(question) {
    if (question.answer.kind === "equivalent_comparison") {
      return { rewrittenNumerators: [...question.answer.rewrittenNumerators], symbol: question.answer.symbol };
    }
    if (question.answer.kind === "benchmark_comparison") {
      return { relations: [...question.answer.relations], symbol: question.answer.symbol };
    }
    if (question.answer.kind === "order") return [...question.answer.orderedFractionIds];
    if (question.answer.kind === "comparison") return question.answer.symbol;
    if (question.answer.kind === "choice") {
      return question.response.options.find((option) => option.id === question.answer.optionId)?.label || question.answer.optionId;
    }
    throw new Error(`${question.id}: unsupported FRA16 answer kind ${question.answer.kind}`);
  }

  function responseFor(question) {
    const response = question.response;
    if (response.kind === "equivalent_comparison") {
      return {
        type: "fra16_equivalent_comparison",
        commonDenominator: response.commonDenominator,
        fractionDisplays: (question.fractions || []).map((item) => item.display),
        comparisonOptions: [...response.comparisonOptions],
        inputLabels: ["Equivalent numerator for the first fraction", "Equivalent numerator for the second fraction"]
      };
    }
    if (response.kind === "benchmark_then_symbol") {
      return {
        type: "fra16_benchmark_comparison",
        relationOptions: [...response.relationOptions],
        fractionDisplays: (question.fractions || []).map((item) => item.display),
        comparisonOptions: [...response.comparisonOptions]
      };
    }
    if (response.kind === "order_cards") {
      const labels = fractionDisplayById(question);
      return {
        type: "fra16_order_cards",
        direction: response.direction,
        cards: (question.fractions || []).map((item) => ({ id: item.id, label: item.display })),
        labels,
        allowDrag: response.allowDrag === true,
        allowKeyboardReorder: response.allowKeyboardReorder === true,
        allowMoveButtons: response.allowMoveButtons === true
      };
    }
    if (response.kind === "comparison_symbol") {
      return { type: "single_choice", options: [...response.options], keyboard_submit: true };
    }
    if (response.kind === "single_choice") {
      return {
        type: "single_choice",
        options: response.options.map((option) => option.label),
        optionIdsByLabel: Object.fromEntries(response.options.map((option) => [option.label, option.id])),
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA16 response kind ${response.kind}`);
  }

  function optionIdFor(question, response) {
    if (question.canonicalQuestion?.response?.kind !== "single_choice") return String(response ?? "");
    return question.response.optionIdsByLabel?.[String(response)] || String(response ?? "");
  }

  function observedResponseKey(question, response) {
    const canonical = question.canonicalQuestion || question;
    const answer = canonical.answer;
    if (canonical.response.kind === "equivalent_comparison") {
      const numerators = response?.rewrittenNumerators || [];
      if (arraysEqual(numerators, answer.rewrittenNumerators) && response?.symbol !== answer.symbol) return "equivalent_forms_correct_symbol_wrong";
      const originalNumerators = (canonical.fractions || []).map((item) => item.value.numerator);
      if (numerators.some((value, index) => Number(value) === Number(originalNumerators[index]))) return "only_denominator_changed";
      return canonical.id === "G1" ? "different_factors_or_inconsistent_rewrite" : "inconsistent_equivalence";
    }
    if (canonical.response.kind === "benchmark_then_symbol") {
      if (arraysEqual(response?.relations, answer.relations) && response?.symbol !== answer.symbol) return "categories_correct_symbol_wrong";
      return "benchmark_category_wrong";
    }
    if (canonical.response.kind === "order_cards") {
      const submitted = Array.isArray(response) ? response.map(String) : [];
      const expected = answer.orderedFractionIds.map(String);
      if (arraysEqual(submitted, [...expected].reverse())) return "exact_reverse_order";
      if (canonical.id === "F2" && submitted.indexOf("one_half") !== 1) return "one_half_not_used_as_middle_anchor";
      const rawNumeratorOrder = [...(canonical.fractions || [])]
        .sort((a, b) => a.value.numerator - b.value.numerator)
        .map((item) => item.id);
      if (arraysEqual(submitted, rawNumeratorOrder)) return "sorted_by_raw_numerators";
      return "unknown_order";
    }
    if (canonical.response.kind === "comparison_symbol") {
      if (canonical.id === "I1" && response === ">") return "selected_greater_than";
      if (canonical.id === "I1" && response === "=") return "selected_equals";
      if (canonical.id === "M2") return "equality_rejected";
      return `selected_${response === ">" ? "greater_than" : response === "<" ? "less_than" : "equals"}`;
    }
    return optionIdFor(question, response);
  }

  function classifyErrorFamily(question, response) {
    const canonical = question.canonicalQuestion || question;
    const observed = observedResponseKey(question, response);
    if (["equivalent_forms_correct_symbol_wrong", "categories_correct_symbol_wrong", "exact_reverse_order"].includes(observed)) return "symbol_or_order_direction";
    if (["only_denominator_changed", "different_factors_or_inconsistent_rewrite", "inconsistent_equivalence"].includes(observed)) return "inconsistent_equivalence";
    if (["one_half_not_used_as_middle_anchor", "sorted_by_raw_numerators", "selected_greater_than"].includes(observed)) return "numerator_only";
    if (observed === "equality_rejected") return "equality_rejected";
    if ((canonical.id === "M4" || canonical.id === "M5") && observed === "A") return "denominator_only";
    if (canonical.id === "M5" && observed === "C") return "equality_rejected";
    return canonical.errorSignals?.find((signal) => signal.feedbackUtteranceIds?.some((id) => (
      canonical.feedback?.incorrectByObservedResponse?.[observed] || []
    ).includes(id)))?.family || "unknown";
  }

  function requiresRepeatedEvidence(question, response) {
    const canonical = question.canonicalQuestion || question;
    const observed = observedResponseKey(question, response);
    if ((canonical.id === "M4" || canonical.id === "M5") && ["A", "C", "D"].includes(observed)) return false;
    if (["only_denominator_changed", "different_factors_or_inconsistent_rewrite", "inconsistent_equivalence"].includes(observed)) return false;
    const signal = canonical.errorSignals?.find((entry) => entry.family === classifyErrorFamily(question, response));
    return ["repeat_or_explicit_reasoning", "isolated_slip_then_discriminate", "unknown_requires_fresh_discriminator"].includes(signal?.classificationRule);
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const canonical = question?.canonicalQuestion || question;
    if (!canonical?.feedback) return [];
    if (correct) return [...(canonical.feedback.correctUtteranceIds || [])];
    const observed = observedResponseKey(question, response);
    return [...(canonical.feedback.incorrectByObservedResponse?.[observed]
      || canonical.feedback.incorrectDefaultUtteranceIds
      || [])];
  }

  function cuesFor(timeline) {
    return (timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/\./g, "-")
    }));
  }

  function questionModel(question) {
    return {
      context: "fra16",
      kind: question.visual.kind,
      fractions: question.fractions || [],
      visual: question.visual,
      workedCheck: question.workedCheck || null,
      canonicalQuestion: question,
      accessibleDescription: question.visual.accessibleDescriptionBeforeSubmit
    };
  }

  function convertQuestion(question, overrides) {
    const correctIds = [...(question.feedback?.correctUtteranceIds || [])];
    const incorrectIds = [...(question.feedback?.incorrectDefaultUtteranceIds || [])];
    const workedIds = [...(question.workedCheck?.ryanUtteranceIds || [])];
    const specificIds = Object.values(question.feedback?.incorrectByObservedResponse || {}).flat();
    const converted = {
      id: prefixed(question.id),
      stage: question.stage,
      target: question.authorOnlyAssessmentIntent || question.family,
      assessmentIntent: question.authorOnlyAssessmentIntent || question.family,
      evidenceFamily: question.family,
      prompt: question.prompt,
      canonicalQuestion: question,
      model: questionModel(question),
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy.hintPolicy,
        solutionPolicy: question.policy.solutionPolicy,
        scored: question.policy.scored !== false,
        answerLocksOnSubmit: question.policy.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy.requiresFreshNoHintConfirmationIfHintUsed === true,
        countsAsIndependentEvidence: question.stage === "final" || question.stage === "recovery"
      },
      attempt_policy: { submit_label: question.response.submitLabel || "Check answer" },
      visual: { primitive: "fra16_context", action: "focus", description: question.visual.accessibleDescriptionBeforeSubmit },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: textsFor(correctIds)[0] || "",
        on_correct_math: "",
        on_incorrect_reaction: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_1: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_2: textsFor(incorrectIds)[0] || "",
        worked_explanation: (question.workedCheck?.visibleSteps || []).map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: [...(question.workedCheck?.visibleSteps || [])],
        worked_narration: textsFor(workedIds)
      },
      runtimeOutcome: {
        correctUtteranceIds: correctIds,
        incorrectDefaultUtteranceIds: incorrectIds,
        errorSpecificUtteranceIdsByObservedResponse: question.feedback?.incorrectByObservedResponse || {},
        workedCheckUtteranceIds: workedIds
      },
      runtimeUtteranceIds: [...question.ryanBeforeSubmitUtteranceIds, ...correctIds, ...incorrectIds, ...specificIds, ...workedIds],
      mathematical_support: question.hint ? { hint_1: question.hint } : {},
      errorClassification: { fallback: question.family || "unknown", fra16Canonical: true },
      primaryErrorFamily: question.family || "unknown"
    };
    return Object.assign(converted, overrides || {});
  }

  function convertRepair(repair) {
    const title = repairTitles[repair.id] || "Quick fraction-comparison repair";
    const syncCues = cuesFor(repair.timeline);
    return {
      id: prefixed(repair.id),
      stage: "repair",
      target: title,
      assessmentIntent: `repair_${repair.errorFamily}`,
      evidenceFamily: repair.errorFamily,
      prompt: title,
      model: {
        context: "fra16",
        kind: repair.visual.kind,
        visual: repair.visual,
        canonicalRepair: repair,
        accessibleDescription: repair.visual.accessibleDescriptionBeforeSubmit
      },
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      visual: { primitive: "fra16_context", action: "repair", description: repair.visual.accessibleDescriptionBeforeSubmit, syncCues },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds, ...(repair.equalityExtensionUtteranceIds || [])],
      equalityExtensionUtteranceIds: [...(repair.equalityExtensionUtteranceIds || [])],
      equalityExtensionNarration: textsFor(repair.equalityExtensionUtteranceIds || []),
      supportedQuestionId: prefixed(repair.supportedQuestion.id),
      freshCheckId: prefixed(repair.freshCheck.id),
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily }
    };
  }

  function teachingStep(scene, nextId) {
    const cues = cuesFor(scene.timeline);
    const title = sceneTitles[scene.id];
    return {
      id: scene.id,
      purpose: title,
      scene: {
        display_title: title,
        initial_state: scene.visual.accessibleDescriptionBeforeSubmit,
        objects: [scene.visual.kind],
        model: { context: "fra16", kind: scene.visual.kind, visual: scene.visual, canonicalScene: scene, accessibleDescription: scene.visual.accessibleDescriptionBeforeSubmit }
      },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 650 })),
      next_step: nextId
    };
  }

  function buildQuestions() {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const labelsById = Object.fromEntries(hook.interaction.options.map((option) => [option.id, option.label]));
    const hookQuestion = {
      id: prefixed("HOOK-CHOICE"),
      stage: "opening",
      target: "Make an unscored same-game prediction",
      assessmentIntent: "opening_prediction",
      evidenceFamily: "opening_choice",
      prompt: hook.interaction.prompt,
      model: { context: "fra16", kind: hook.visual.kind, visual: hook.visual, canonicalScene: hook, accessibleDescription: hook.visual.accessibleDescriptionBeforeSubmit },
      response: { type: "single_choice", options: hook.interaction.options.map((option) => option.label), optionIdsByLabel: Object.fromEntries(hook.interaction.options.map((option) => [option.label, option.id])) },
      answer: { value: labelsById.orange },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Show the comparison" },
      visual: { primitive: "fra16_context", action: "focus", description: hook.visual.accessibleDescriptionBeforeSubmit },
      scripts: {
        engagement_response_by_value: Object.fromEntries(hook.interaction.options.map((option) => [option.label, textsFor(hook.interaction.feedbackByOption[option.id].ryanUtteranceIds)])),
        engagement_outcome_by_value: Object.fromEntries(hook.interaction.options.map((option) => [option.label, hook.interaction.feedbackByOption[option.id].outcome]))
      },
      runtimeOutcome: { responseUtteranceIdsByValue: Object.fromEntries(hook.interaction.options.map((option) => [option.label, [...hook.interaction.feedbackByOption[option.id].ryanUtteranceIds]])) },
      runtimeUtteranceIds: Object.values(hook.interaction.feedbackByOption).flatMap((branch) => branch.ryanUtteranceIds),
      primaryErrorFamily: "unknown",
      errorClassification: { fallback: "unknown" }
    };
    const repairQuestions = approved.repairs.flatMap((repair) => [
      convertRepair(repair),
      convertQuestion(repair.supportedQuestion, { repairSupported: true, primaryErrorFamily: repair.errorFamily }),
      convertQuestion(repair.freshCheck, { repairFresh: true, primaryErrorFamily: repair.errorFamily })
    ]);
    const recoveryQuestions = approved.recoveryProfiles.map((profile) => convertQuestion(profile.deterministicFallback, { recoveryFinal: true }));
    return [
      hookQuestion,
      ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.confirmations.map((question) => convertQuestion(question)),
      ...repairQuestions,
      ...recoveryQuestions
    ];
  }

  function collectObjects(value, output) {
    if (Array.isArray(value)) return value.forEach((item) => collectObjects(item, output));
    if (!value || typeof value !== "object") return;
    output.push(value);
    Object.values(value).forEach((item) => collectObjects(item, output));
  }

  function validateRuntimeContract(registry, selectedSpec) {
    const chosenRegistry = registry || runtimeCopy;
    const chosenSpec = selectedSpec || approved;
    const issues = [];
    const approvedIssues = source?.validateCanonicalSpec?.() || [];
    issues.push(...approvedIssues);
    Object.entries(chosenRegistry).forEach(([id, entry]) => {
      if (!String(entry?.text || "").trim()) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption text`);
    });
    const objects = [];
    collectObjects(chosenSpec, objects);
    objects.forEach((object) => {
      if (Object.prototype.hasOwnProperty.call(object, "captionText")) issues.push("captionText is forbidden");
      Object.entries(object).forEach(([key, value]) => {
        if ((key.endsWith("UtteranceIds") || key === "ryanUtteranceIds") && Array.isArray(value)) {
          value.forEach((id) => { if (!chosenRegistry[id]) issues.push(`Missing runtime utterance ${id}`); });
        }
      });
      if (object.utteranceId && object.anchorText) {
        const entry = chosenRegistry[object.utteranceId];
        if (!entry) issues.push(`${object.id || "cue"} points to missing ${object.utteranceId}`);
        else if (!entry.text.includes(String(object.anchorText))) issues.push(`${object.id || "cue"} anchor is absent from ${object.utteranceId}`);
      }
    });
    return [...new Set(issues)];
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA16 approved runtime source was not loaded.");
    const contractIssues = validateRuntimeContract();
    if (contractIssues.length) throw new Error(`FRA16 runtime contract failed: ${contractIssues.join("; ")}`);
    const questionBank = buildQuestions();
    const byId = Object.fromEntries(questionBank.map((question) => [question.id, question]));
    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.concept_model = Object.assign({}, spec.concept_model, { core_idea: approved.scope.studentFacingIdea, worked_model: approved.scope.teaches.join(" ") });
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-04", "FRA-05", "FRA-07", "FRA-08"] });
    spec.diagnostic = { enabled: false, question_refs: [] };
    spec.retrieval_practice = { enabled: false, question_refs: [] };
    spec.question_bank = questionBank;

    const scenes = approved.teachingScenes;
    spec.lesson.teaching_steps = [
      teachingStep(scenes[0], "HOOK-CHOICE"),
      {
        id: "HOOK-CHOICE",
        purpose: "Make an unscored same-game prediction",
        scene: { display_title: sceneTitles.HOOK, initial_state: scenes[0].visual.accessibleDescriptionBeforeSubmit, objects: [scenes[0].visual.kind], model: { context: "fra16", kind: scenes[0].visual.kind, visual: scenes[0].visual, canonicalScene: scenes[0], accessibleDescription: scenes[0].visual.accessibleDescriptionBeforeSubmit } },
        narration: { script: [], utterance_ids: [], sync_cues: [] },
        animation_timeline: [],
        learner_interaction: { question_ref: prefixed("HOOK-CHOICE") },
        next_step: "T1"
      },
      ...scenes.slice(1).map((scene, index) => teachingStep(scene, scenes[index + 2]?.id || "G1"))
    ];

    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const nextById = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const question = byId[prefixed(id)];
      return [id, {
        stage: question.stage === "independent" ? "independent_transfer" : question.stage,
        question_ref: question.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: question.scripts.before_submit,
        visual_before_answer: question.prompt,
        correct_next: nextById[id]
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Evidence-driven confirmations and recovery only.", between_question_transition: "" };

    const finalIds = approved.routing.finalGate.primaryFinalIds.map(prefixed);
    const confirmationIds = [
      ...approved.confirmations.map((question) => prefixed(question.id)),
      ...approved.repairs.flatMap((repair) => [prefixed(repair.supportedQuestion.id), prefixed(repair.freshCheck.id)]),
      ...approved.recoveryProfiles.map((profile) => prefixed(profile.deterministicFallback.id))
    ];
    spec.lesson.exit = {
      intro_script: textsFor(["FINAL.INTRO"]),
      primary_question_refs: finalIds,
      use_question_before_submit_narration: true,
      confirmation_question_refs: confirmationIds,
      repair_by_primary: {
        [prefixed("M1")]: repairIds.numerator_only,
        [prefixed("M2")]: repairIds.equality_rejected,
        [prefixed("M3")]: repairIds.symbol_or_order_direction,
        [prefixed("M4")]: repairIds.denominator_only,
        [prefixed("M5")]: repairIds.denominator_only
      },
      post_repair_retest_refs: confirmationIds,
      mastery_policy: {
        profile: "fra16_five_item",
        secureMinimum: 4,
        requireMoreThanOneEvidenceFamily: true,
        requireReasoningOrApplicationEvidence: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: [...approved.mastery.repeatedBlockingFamilies],
        threeCorrectRequiredFreshSuccesses: 2,
        zeroToTwoCorrectRequiredFreshSuccesses: 3,
        recoveryQuestionIds: approved.routing.finalGate.recoveryPoolIds.map(prefixed)
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "guided_strong", questionRefs: [prefixed("G1"), prefixed("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      repair_by_error_family: Object.assign({ unknown: repairIds.inconsistent_equivalence }, repairIds),
      repair_supported_by_error_family: Object.assign({
        equality_rejected: prefixed("RE-S"),
        unknown: prefixed("RE-S")
      }, Object.fromEntries(approved.repairs.map((repair) => [repair.errorFamily, prefixed(repair.supportedQuestion.id)]))),
      repair_fresh_by_error_family: Object.assign({ unknown: prefixed("RE-C") }, repairFreshByFamily),
      fresh_checks_by_error_family: {
        numerator_only: [prefixed("RN-C"), prefixed("C-PAIR")],
        denominator_only: [prefixed("RD-C"), prefixed("C-BENCH")],
        inconsistent_equivalence: [prefixed("RE-C"), prefixed("C-PAIR")],
        equality_rejected: [prefixed("RF-EQ")],
        symbol_or_order_direction: [prefixed("RS-C"), prefixed("C-SORT")],
        unknown: [prefixed("C-PAIR"), prefixed("C-SORT"), prefixed("C-BENCH")]
      },
      no_hint_confirmation_by_question: {
        [prefixed("F1")]: prefixed("C-PAIR"),
        [prefixed("F2")]: prefixed("C-BENCH"),
        [prefixed("I1")]: prefixed("C-PAIR"),
        [prefixed("I2")]: prefixed("C-SORT")
      },
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.routing.completion.ryanUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep making the comparison fair", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      success_reaction_policy: { mode: "question_specific_only" },
      caption_presentation: { mode: "on_canvas_progressive", reveal: "word_by_word", max_lines: 2, transcript_bar: false },
      narration_playback: {
        mode: "browser_speech_ryan",
        provider: "Microsoft Edge Neural TTS",
        voice_id: "en-GB-RyanNeural",
        browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
        require_ryan_voice: true,
        timing_source: "provider_word_boundaries_with_deterministic_fallback"
      }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra16_context", same_whole_size: true, fixed_endpoint_repartition: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra16_context", "fra16_equivalent_comparison", "fra16_benchmark_comparison", "fra16_order_cards", "single_choice", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "FRA16-owner-handoff-v1",
      engine_profile: "fra16",
      runtime_applied: true,
      owner_review_status: "approved-handoff",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_hierarchy: approved.sourceOfTruth,
      objective: approved.scope.objective,
      core_mental_model: approved.scope.studentFacingIdea,
      canonical_spec: approved,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Less help", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      capabilities: {
        exact_rational_comparison: true,
        equivalent_comparison_fields: true,
        benchmark_classification: true,
        accessible_ordering: true,
        optional_visible_only_hints: true,
        fresh_no_hint_confirmation: true,
        targeted_repairs: true,
        five_item_final: true,
        locked_worked_checks: true,
        utterance_id_runtime: true,
        draft_and_route_persistence: true
      }
    };
    return spec;
  }

  window.RevilyFra16Canonical = {
    apply,
    buildQuestions,
    classifyErrorFamily,
    observedResponseKey,
    repairIds,
    requiresRepeatedEvidence,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    stableResponseKey,
    textFor,
    validateRuntimeContract
  };
})();
