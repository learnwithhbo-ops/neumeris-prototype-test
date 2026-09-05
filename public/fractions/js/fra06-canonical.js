(function () {
  "use strict";

  const LESSON_ID = "FRA-06";
  const CONTENT_VERSION = "fra06-handoff-v1-runtime-copy-1";
  const source = window.RevilyFra06V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const prefixed = (id) => `${LESSON_ID}-${id}`;
  const repairIds = {
    proper_boundary: prefixed("R-PROPER"),
    improper_invalid: prefixed("R-INVALID"),
    improper_validity: prefixed("R-INVALID"),
    exact_one: prefixed("R-EQUAL"),
    mixed_form: prefixed("R-MIXED"),
    size_vs_form: prefixed("R-MIXED"),
    multi_form_sort: prefixed("R-MIXED")
  };
  const sceneTitles = {
    HOOK: "Three forms around one", T1: "Proper fractions", T2: "Improper fractions",
    T3: "Exactly one", T4: "Mixed numbers", T5: "Make the classification decision"
  };
  const repairTitles = {
    "R-PROPER": "Compare numerator and denominator", "R-INVALID": "A fraction can continue past one",
    "R-EQUAL": "Equal means exactly one", "R-MIXED": "Size and written form are different"
  };

  function runtimeEntry(id, registry) {
    const entry = (registry || runtimeCopy)[id];
    if (!entry) throw new Error(`Missing FRA06 runtime utterance: ${id}`);
    return entry;
  }
  const textFor = (id) => runtimeEntry(id).text;
  const textsFor = (ids) => (ids || []).map(textFor);
  const labelFor = (question, id) => question.response?.options?.find((option) => option.id === id)?.label || String(id);
  function formatValue(value) {
    if (!value) return "";
    if (value.kind === "fraction") return `${value.numerator}/${value.denominator}`;
    if (value.kind === "mixed_number") return `${value.whole} ${value.numerator}/${value.denominator}`;
    return String(value.label || value.id || "");
  }
  function responseKey(value) {
    if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "value")) return responseKey(value.value);
    if (Array.isArray(value)) return JSON.stringify(value);
    if (value && typeof value === "object") return JSON.stringify(Object.keys(value).sort().reduce((result, key) => { result[key] = value[key]; return result; }, {}));
    return String(value ?? "");
  }
  function toModel(visual, value) {
    const model = Object.assign({}, visual || {});
    if (!model.value && value) model.value = value;
    return Object.assign(model, { context: "fra06", accessibleDescription: model.accessibleDescription || "A fraction classification model is shown." });
  }
  function responseFor(question) {
    const response = question.response || {};
    if (response.kind === "single_choice") return {
      type: "single_choice", options: (response.options || []).map((option) => option.label), keyboard_submit: true
    };
    if (response.kind === "sort") {
      const visual = question.beforeSubmitVisual || {};
      return {
        type: "classification_sort", destinations: [...(visual.bins || ["proper", "improper", "mixed"])],
        cards: (visual.cards || []).map((card) => ({ id: card.id, label: formatValue(card.value) })),
        keyboard_alternative: response.keyboardAlternative || "Each card has a destination selector."
      };
    }
    if (response.kind === "classification_and_size") return {
      type: "classification_and_size", classification_options: [...(response.classificationOptions || ["proper", "improper", "mixed"])],
      size_options: [...(response.sizeOptions || ["less_than_one", "equal_to_one", "greater_than_one"])]
    };
    if (response.kind === "classification_size_validity") return {
      type: "classification_size_validity", classification_options: ["proper", "improper", "mixed"],
      size_options: ["less_than_one", "equal_to_one", "greater_than_one"], validity_options: [true, false]
    };
    if (response.kind === "paired_classification") return {
      type: "paired_classification", items: (question.values || []).map((item, index) => ({ id: String(index), label: formatValue(item) })),
      classification_options: ["proper", "improper", "mixed"]
    };
    throw new Error(`${question.id}: unsupported FRA06 response kind ${response.kind}`);
  }
  function answerFor(question) {
    if (question.response?.kind === "single_choice") return labelFor(question, question.answer);
    return question.answer;
  }
  function incorrectByResponse(question) {
    return Object.fromEntries(Object.entries(question.feedback?.incorrectByResponse || {}).map(([id, branch]) => [labelFor(question, id), [...(branch.utteranceIds || [])]]));
  }
  function outcomeMetadata(question) {
    return {
      correctUtteranceIds: [...(question.feedback?.correctUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(question.feedback?.incorrectDefaultUtteranceIds || [])],
      errorSpecificUtteranceIdsByResponse: incorrectByResponse(question),
      errorSpecificUtteranceIdsByFamily: Object.fromEntries(Object.entries(question.feedback?.incorrectByErrorFamily || {}).map(([family, branch]) => [family, [...(branch.utteranceIds || [])]])),
      workedCheckUtteranceIds: [...(question.workedCheck?.ryanUtteranceIds || [])]
    };
  }
  function choiceFamilies(question) {
    return Object.fromEntries(Object.entries(question.feedback?.incorrectByResponse || {}).map(([id, branch]) => [labelFor(question, id), branch.errorFamily || question.family || "unknown"]));
  }
  function sortFamilies(question) {
    if (question.id !== "I1") return {};
    return {
      "five_twelfths:improper": "proper_boundary", "five_twelfths:mixed": "proper_boundary",
      "six_sixths:proper": "exact_one", "six_sixths:mixed": "exact_one",
      "twelve_sevenths:mixed": "mixed_form", "two_four_ninths:improper": "mixed_form",
      "two_four_ninths:proper": "mixed_form"
    };
  }
  function familyFor(question) {
    if (question.family === "improper_validity") return "improper_invalid";
    if (question.family === "size_vs_form") return "mixed_form";
    return question.family || "unknown";
  }
  function convertQuestion(question, overrides) {
    const outcome = outcomeMetadata(question);
    const responseFeedback = Object.fromEntries(Object.entries(outcome.errorSpecificUtteranceIdsByResponse).map(([key, ids]) => [key, textsFor(ids)[0] || ""]));
    const workedSteps = question.workedCheck?.visibleSteps || [];
    const workedVisual = question.workedCheck?.authorOnlyVisualReveal
      ? Object.assign({}, question.workedCheck.authorOnlyVisualReveal, { accessibleDescription: workedSteps.join(" ") })
      : null;
    const runtimeUtteranceIds = [
      ...(question.ryanBeforeSubmitUtteranceIds || []), ...outcome.correctUtteranceIds,
      ...outcome.incorrectDefaultUtteranceIds, ...Object.values(outcome.errorSpecificUtteranceIdsByResponse).flat(),
      ...Object.values(outcome.errorSpecificUtteranceIdsByFamily).flat(), ...outcome.workedCheckUtteranceIds
    ];
    return Object.assign({
      id: prefixed(question.id), stage: question.stage, target: question.assessmentIntent || question.family,
      assessmentIntent: question.assessmentIntent || question.family || question.stage, evidenceFamily: question.family, prompt: question.visiblePrompt,
      model: Object.assign(toModel(question.beforeSubmitVisual, question.value), { workedVisual }), response: responseFor(question), answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy || "none", solutionPolicy: question.policy?.solutionPolicy || "after_response",
        scored: question.policy?.scored !== false, answerLocksOnSubmit: question.policy?.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.requiresFreshNoHintConfirmationIfHintUsed === true
      },
      attempt_policy: { submit_label: question.response?.submitLabel || "Check answer" },
      visual: { primitive: "fra06_context", action: "focus", description: question.beforeSubmitVisual?.accessibleDescription || question.visiblePrompt },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: textsFor(outcome.correctUtteranceIds)[0] || "", on_correct_math: "",
        on_incorrect_reaction: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_1: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_2: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        worked_explanation: workedSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: [...workedSteps], worked_narration: textsFor(outcome.workedCheckUtteranceIds), response_feedback: responseFeedback,
        family_feedback: Object.fromEntries(Object.entries(outcome.errorSpecificUtteranceIdsByFamily).map(([family, ids]) => [family, textsFor(ids)[0] || ""]))
      },
      runtimeOutcome: outcome, runtimeUtteranceIds,
      mathematical_support: question.hint ? { hint_1: question.hint.visibleText } : {},
      errorClassification: { choiceFamilies: choiceFamilies(question), sortFamilies: sortFamilies(question), fallback: familyFor(question), requiresRepeatedEvidence: true },
      recovery_item_ref: repairIds[familyFor(question)] || null, primaryErrorFamily: familyFor(question)
    }, overrides || {});
  }
  function convertRepair(repair) {
    const title = repairTitles[repair.id] || "Review the form around one";
    const family = repair.errorFamily;
    const fresh = repair.freshCheckPreference?.[0] || repair.fallbackConfirmationPreference?.[0] || repair.freshCheck?.id;
    return {
      id: prefixed(repair.id), stage: "repair", target: title, assessmentIntent: `repair_${family}`, evidenceFamily: family,
      prompt: title, model: toModel(repair.visual), response: { type: "continue" }, answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      visual: { primitive: "fra06_context", action: "repair", description: repair.visual?.accessibleDescription || title },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds], freshCheckId: fresh ? prefixed(fresh) : null,
      primaryErrorFamily: family, errorClassification: { fallback: family }
    };
  }
  function convertMixedRepairCheck(repair) {
    const check = repair.freshCheck;
    return convertQuestion(Object.assign({}, check, {
      stage: "confirmation", family: "mixed_form", assessmentIntent: "Fresh no-hint paired written-form classification", values: check.values,
      response: Object.assign({ kind: "paired_classification", submitLabel: "Check answer" }, check.response || {})
    }), { id: prefixed(check.id), model: toModel({ kind: "written_form_contrast", values: check.values }, null), primaryErrorFamily: "mixed_form" });
  }
  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({
      id: cue.id, utteranceId: cue.utteranceId, cue: cue.anchorText, anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/\./g, "-")
    }));
  }
  function teachingStep(scene, nextId) {
    const title = sceneTitles[scene.id] || "Recognise the written form";
    const cues = sceneCues(scene);
    return {
      id: scene.id, purpose: title,
      scene: { display_title: title, initial_state: title, objects: [scene.visual.kind], model: toModel(scene.visual) },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 650 })), next_step: nextId
    };
  }
  function buildQuestions() {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const options = hook.interaction.response.options;
    const branchByLabel = Object.fromEntries(options.map((option) => [option.label, [...hook.interaction.feedbackByResponse[option.id].utteranceIds]]));
    const branchOutcomeByLabel = Object.fromEntries(options.map((option) => [option.label, hook.interaction.feedbackByResponse[option.id].outcome]));
    const hookQuestion = {
      id: prefixed("HOOK-CHOICE"), stage: "opening", target: "Predict the form with complete wholes", assessmentIntent: "opening_prediction",
      evidenceFamily: "opening_choice", prompt: hook.interaction.visiblePrompt, questionDetail: hook.interaction.visibleSubprompt,
      model: toModel(hook.visual), response: { type: "single_choice", options: options.map((option) => option.label), keyboard_submit: true },
      answer: { value: options.find((option) => option.id === hook.interaction.answer).label },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Reveal the forms" }, visual: { primitive: "fra06_context", action: "focus", description: hook.visual.accessibleDescription },
      scripts: {
        engagement_response_by_value: Object.fromEntries(Object.entries(branchByLabel).map(([label, ids]) => [label, textsFor([...ids, ...hook.interaction.commonRevealUtteranceIds])])),
        engagement_outcome_by_value: branchOutcomeByLabel,
        engagement_detail: textsFor(hook.interaction.commonRevealUtteranceIds)
      },
      runtimeOutcome: { responseUtteranceIdsByValue: branchByLabel, commonRevealUtteranceIds: [...hook.interaction.commonRevealUtteranceIds] },
      runtimeUtteranceIds: [...Object.values(branchByLabel).flat(), ...hook.interaction.commonRevealUtteranceIds],
      primaryErrorFamily: "unknown", errorClassification: { fallback: "unknown" }
    };
    const repairs = Object.values(approved.repairs);
    const mixedRepair = approved.repairs["R-MIXED"];
    return [hookQuestion, ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.confirmationQuestions.map((question) => convertQuestion(question)),
      ...repairs.map(convertRepair), convertMixedRepairCheck(mixedRepair)];
  }

  function collectObjects(value, output) {
    if (Array.isArray(value)) return value.forEach((item) => collectObjects(item, output));
    if (!value || typeof value !== "object") return;
    output.push(value); Object.values(value).forEach((item) => collectObjects(item, output));
  }
  function validateRuntimeContract(registry, lessonSpec) {
    const selectedRegistry = registry || runtimeCopy;
    const selectedSpec = lessonSpec || approved;
    const issues = [];
    Object.entries(selectedRegistry).forEach(([id, entry]) => {
      if (!String(entry?.text || "").trim()) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
    });
    const objects = []; collectObjects(selectedSpec, objects);
    objects.forEach((object) => {
      if (Object.prototype.hasOwnProperty.call(object, "captionText")) issues.push("captionText is forbidden");
      Object.entries(object).forEach(([key, value]) => {
        if ((key.endsWith("UtteranceIds") || key === "ryanUtteranceIds") && Array.isArray(value)) value.forEach((id) => {
          if (!selectedRegistry[id]) issues.push(`Missing runtime utterance ${id}`);
        });
      });
      if (object.utteranceId && object.anchorText) {
        const entry = selectedRegistry[object.utteranceId];
        if (!entry) issues.push(`${object.id || "cue"} points to missing ${object.utteranceId}`);
        else if (!entry.text.includes(String(object.anchorText))) issues.push(`${object.id || "cue"} anchor is absent from ${object.utteranceId}`);
      }
    });
    return issues;
  }
  function selectOutcomeUtteranceIds(question, response, correct, family) {
    const outcome = question?.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    return [...(outcome.errorSpecificUtteranceIdsByResponse?.[responseKey(response)] || outcome.errorSpecificUtteranceIdsByFamily?.[family] || outcome.incorrectDefaultUtteranceIds || [])];
  }
  function getHookResponseSequence(responseId) {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    return [...hook.interaction.feedbackByResponse[responseId].utteranceIds, ...hook.interaction.commonRevealUtteranceIds];
  }
  function validateQuestionModel(question) {
    const issues = [];
    const values = [];
    collectObjects(question.model, values);
    values.forEach((item) => {
      if (item.kind === "fraction" && (!Number.isInteger(item.denominator) || item.denominator < 2 || item.denominator > 13)) issues.push("fraction denominator must be 2-13");
      if (item.kind === "mixed_number" && (!(item.whole > 0) || !(item.numerator > 0) || !(item.numerator < item.denominator))) issues.push("mixed number must have a positive whole and proper fractional part");
      if (item.kind === "number_line" && item.denominator && item.pointIndex > item.denominator * Number(item.maxWhole || item.end || 1)) issues.push("number-line point is outside its intervals");
    });
    return issues;
  }
  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA06 approved runtime source was not loaded.");
    const contractIssues = validateRuntimeContract();
    if (contractIssues.length) throw new Error(`FRA06 runtime contract failed: ${contractIssues.join("; ")}`);
    const questionBank = buildQuestions();
    questionBank.forEach((question) => { const issues = validateQuestionModel(question); if (issues.length) throw new Error(`${question.id}: ${issues.join("; ")}`); });
    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.concept_model = Object.assign({}, spec.concept_model, { core_idea: approved.scope.studentFacingIdea, worked_model: approved.scope.teaches.join(" ") });
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02", "FRA-05"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;
    const scenes = approved.teachingScenes;
    const hook = scenes.find((scene) => scene.id === "HOOK");
    spec.lesson.teaching_steps = [
      teachingStep(hook, "HOOK-CHOICE"),
      { id: "HOOK-CHOICE", purpose: "Make an unscored prediction", scene: { display_title: "Three forms around one", initial_state: hook.interaction.visiblePrompt, objects: [hook.visual.kind], model: toModel(hook.visual) }, narration: { script: [], utterance_ids: [], sync_cues: [] }, animation_timeline: [], learner_interaction: { question_ref: prefixed("HOOK-CHOICE") }, next_step: "T1" },
      ...scenes.filter((scene) => scene.id !== "HOOK").map((scene, index, remaining) => teachingStep(scene, remaining[index + 1]?.id || "G1"))
    ];
    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const nextById = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const question = questionBank.find((item) => item.id === prefixed(id));
      return [id, { stage: question.stage === "independent" ? "independent_transfer" : question.stage, question_ref: question.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: question.scripts.before_submit, visual_before_answer: question.prompt, correct_next: nextById[id], recovery_ref: question.recovery_item_ref }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Evidence-driven confirmations only.", between_question_transition: "" };
    const confirmationIds = approved.confirmationQuestions.map((question) => prefixed(question.id));
    const mixedCheckId = prefixed("R-MIXED-CHECK");
    const allConfirmationIds = [...confirmationIds, mixedCheckId];
    spec.lesson.exit = {
      intro_script: textsFor(approved.adaptiveRoute.finalIntroUtteranceIds), primary_question_refs: approved.adaptiveRoute.finalQuestionIds.map(prefixed),
      use_question_before_submit_narration: true,
      confirmation_question_refs: allConfirmationIds,
      repair_by_primary: { [prefixed("M1")]: repairIds.proper_boundary, [prefixed("M2")]: repairIds.exact_one, [prefixed("M3")]: repairIds.mixed_form, [prefixed("M4")]: repairIds.mixed_form },
      post_repair_retest_refs: allConfirmationIds,
      mastery_policy: { secureMinimum: 3, requireMoreThanOneEvidenceFamily: true, blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: [...approved.evidenceModel.centralErrorFamilies], twoCorrectRequiredFreshSuccesses: 2, zeroOrOneCorrectRequiredFreshSuccesses: 4 }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "guided_strong", questionRefs: [prefixed("G1"), prefixed("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" }, repair_by_error_family: Object.assign({}, repairIds),
      fresh_checks_by_error_family: {
        proper_boundary: [prefixed("C-P1"), prefixed("C-P2")], improper_invalid: [prefixed("C-I1"), prefixed("C-I2")],
        improper_validity: [prefixed("C-I1"), prefixed("C-I2")], exact_one: [prefixed("C-E2"), prefixed("C-E1")],
        mixed_form: [mixedCheckId, prefixed("C-M1"), prefixed("C-M2")], multi_form_sort: [prefixed("C-SORT")],
        size_vs_form: [prefixed("C-I1"), prefixed("C-I2")], unknown: confirmationIds
      },
      no_hint_confirmation_by_question: { [prefixed("F1")]: prefixed("C-I1"), [prefixed("F2")]: prefixed("C-M1"), [prefixed("I1")]: prefixed("C-SORT"), [prefixed("I2")]: prefixed("C-I2") },
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.adaptiveRoute.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building the three forms", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan", voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)", locale: "en-GB", opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "authored_audio_then_browser_speech", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra06_context", one_whole_checkpoint: true, no_conversion: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra06_context", "single_choice", "classification_sort", "classification_and_size", "classification_size_validity", "paired_classification", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true, version: CONTENT_VERSION, content_version: CONTENT_VERSION, storyboard_version: "FRA06-owner-handoff-v1",
      engine_profile: "fra06", runtime_applied: true, owner_review_status: "approved-handoff", runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_hierarchy: approved.sourceOfTruth, objective: spec.learning_objective, core_mental_model: approved.scope.studentFacingIdea,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Less help", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      capabilities: { exact_fraction_models: true, one_whole_checkpoint: true, classification_sort: true, compound_classification: true,
        draft_persistence: true, optional_visible_only_hints: true, hint_evidence: true, final_working_after_locked_submit: true,
        four_item_final: true, targeted_repairs: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra06Canonical = { apply, buildQuestions, getHookResponseSequence, runtimeCopy, selectOutcomeUtteranceIds, textFor, toModel, validateQuestionModel, validateRuntimeContract };
})();
