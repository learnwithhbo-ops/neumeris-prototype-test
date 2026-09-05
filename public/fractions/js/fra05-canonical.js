(function () {
  "use strict";

  const FRA05_ID = "FRA-05";
  const CONTENT_VERSION = "FRA05-2.0";
  const source = window.RevilyFra05V2;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const repairIds = {
    tick_marks: `${FRA05_ID}-R-TICKS`, zero_as_step: `${FRA05_ID}-R-ZERO`,
    wrong_whole: `${FRA05_ID}-R-WHOLE`, swap_roles: `${FRA05_ID}-R-SWAP`,
    unanchored_estimate: `${FRA05_ID}-R-ANCHOR`
  };
  const studentSceneTitles = {
    HOOK: "Five markers - but how many gaps?", T1: "Find one whole",
    T2: "The denominator sets the step size", T3: "The numerator counts the steps",
    T4: "Keep counting past one", T5: "Use labelled points to estimate",
    HANDOFF: "Your number-line plan"
  };
  const studentRepairTitles = {
    "R-TICKS": "Count the spaces, not the marks", "R-ZERO": "Start counting after zero",
    "R-WHOLE": "Keep the same step size past one", "R-SWAP": "Put each count in the right place",
    "R-ANCHOR": "Use the labelled points to estimate"
  };
  const cueActions = {
    "HOOK.CUE.1": "show_markers", "HOOK.CUE.2": "focus_markers", "HOOK.CUE.3": "reveal_equal_gaps",
    "HOOK.CUE.4": "highlight_travelled_gaps", "HOOK.CUE.5": "reveal_fraction", "HOOK.CUE.6": "transform_number_line",
    "T1.CUE.1": "show_zero", "T1.CUE.2": "show_one", "T1.CUE.3": "show_whole_bracket",
    "T2.CUE.1": "partition_line", "T2.CUE.2": "sweep_intervals", "T2.CUE.3": "show_step_size", "T2.CUE.4": "focus_denominator",
    "T3.CUE.1": "start_at_zero", "T3.CUE.2": "count_step_1", "T3.CUE.3": "count_step_2",
    "T3.CUE.4": "count_step_3", "T3.CUE.5": "count_step_4", "T3.CUE.6": "reveal_fraction",
    "T4.CUE.1": "extend_past_one", "T4.CUE.2": "reach_one", "T4.CUE.3": "count_step_5",
    "T4.CUE.4": "show_whole_brackets", "T4.CUE.5": "trace_from_zero",
    "T5.CUE.1": "show_estimate_point", "T5.CUE.2": "show_anchor_half", "T5.CUE.3": "show_estimate_guide",
    "HANDOFF.CUE.1": "show_denominator_role", "HANDOFF.CUE.2": "show_numerator_role"
  };

  const prefixed = (id) => `${FRA05_ID}-${id}`;
  function runtimeEntry(id, registry) {
    const entry = (registry || runtimeCopy)[id];
    if (!entry) throw new Error(`Missing FRA05 runtime utterance: ${id}`);
    return entry;
  }
  const textFor = (id) => runtimeEntry(id).text;
  const textsFor = (ids) => (ids || []).map(textFor);

  function toModel(visual) {
    const item = visual || {};
    const denominator = Number.isInteger(item.denominator) ? item.denominator : null;
    const maxWhole = Number(item.maxWhole ?? 1);
    return Object.assign({}, item, {
      context: item.kind === "runner_track" ? "fra05_runner_track" : "fra05_number_line",
      denominator, minWhole: Number(item.minWhole ?? 0), maxWhole,
      totalIntervals: denominator ? denominator * maxWhole : null,
      pointIndexFromZero: Number.isInteger(item.pointIndexFromZero) ? item.pointIndexFromZero : null,
      allowMultipleWholes: maxWhole > 1
    });
  }
  function optionLabel(question, id) {
    return question.response?.options?.find((option) => option.id === id)?.label || String(id);
  }
  function responseFor(question) {
    if (question.response.kind === "tick_selector") return {
      type: "tick_selector", allow_drag: question.response.allowDrag !== false,
      allow_click: question.response.allowClick !== false, allow_keyboard: question.response.allowKeyboard !== false,
      allow_nudge_buttons: question.response.allowNudgeButtons !== false, input_label: "Selected boundary"
    };
    if (question.response.kind === "fraction_input") return { type: "fraction", accept_equivalent_notation: false };
    return { type: "single_choice", options: (question.response.options || []).map((option) => option.label), keyboard_submit: true };
  }
  function answerFor(question) {
    if (question.answer?.kind === "tick_index") return String(question.answer.indexFromZero);
    if (question.answer && typeof question.answer === "object" && "numerator" in question.answer) return `${question.answer.numerator}/${question.answer.denominator}`;
    if (question.response.kind === "single_choice") return optionLabel(question, question.answer);
    return String(question.answer);
  }
  function evidenceFamily(question) {
    const intent = String(question.authorOnlyAssessmentIntent || "");
    if (/estimate|anchor/.test(intent)) return "estimate";
    if (/beyond|extended/.test(intent)) return "beyond_one";
    if (/place|location|symbol_to_exact/.test(intent)) return "exact_placement";
    if (/interval|tick_mark/.test(intent)) return "interval_count";
    return "exact_read";
  }
  function responseKey(response) {
    const value = response && typeof response === "object" && "value" in response ? response.value : response;
    if (value && typeof value === "object" && "n" in value && "d" in value) return `${value.n}/${value.d}`;
    return String(value ?? "");
  }
  function signalResponseKeys(question, observed) {
    const text = String(observed || "");
    if (/selected any non-best estimate/i.test(text)) return (question.response.options || []).filter((option) => option.id !== question.answer).map((option) => option.label);
    if (/selected an endpoint or an option on the wrong side of 1\/2/i.test(text)) {
      const ids = new Set(["one_quarter", "one"]);
      return (question.response.options || []).filter((option) => ids.has(option.id)).map((option) => option.label);
    }
    const selected = text.match(/^selected (?:option )?([A-Za-z0-9_-]+)$/i);
    if (selected) return [optionLabel(question, selected[1])];
    const fraction = text.match(/submitted\s+(-?\d+\s*\/\s*-?\d+)/i);
    if (fraction) return [fraction[1].replace(/\s/g, "")];
    const tick = text.match(/tick index\s+(\d+)/i);
    if (tick) return [tick[1]];
    if (/represented as 1\/5/i.test(text)) return ["1"];
    return [];
  }
  function classificationFor(question) {
    const result = { choiceFamilies: {}, integerFamilies: {}, fractionFamilies: {}, fallback: "unknown", requiresRepeatedEvidence: true };
    (question.errorSignals || []).forEach((signal) => signalResponseKeys(question, signal.observed).forEach((key) => {
      if (question.response.kind === "single_choice") result.choiceFamilies[key] = signal.family;
      else if (question.response.kind === "tick_selector") result.integerFamilies[key] = signal.family;
      else result.fractionFamilies[key] = signal.family;
    }));
    return result;
  }
  function outcomeMetadata(question) {
    const specific = {};
    (question.errorSignals || []).forEach((signal) => signalResponseKeys(question, signal.observed).forEach((key) => { specific[key] = [...(signal.feedbackUtteranceIds || [])]; }));
    return {
      correctUtteranceIds: [...(question.feedback?.correctUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(question.feedback?.incorrectDefaultUtteranceIds || [])],
      errorSpecificUtteranceIdsByResponse: specific,
      workedCheckUtteranceIds: [...(question.workedCheck?.ryanUtteranceIds || [])]
    };
  }
  function primaryFamily(question) {
    if (question.errorSignals?.[0]?.family) return question.errorSignals[0].family;
    const family = evidenceFamily(question);
    if (family === "estimate") return "unanchored_estimate";
    if (family === "beyond_one") return "wrong_whole";
    if (family === "exact_placement") return "zero_as_step";
    return "tick_marks";
  }
  function convertQuestion(question, overrides) {
    const outcome = outcomeMetadata(question);
    const family = primaryFamily(question);
    const responseFeedback = Object.fromEntries(Object.entries(outcome.errorSpecificUtteranceIdsByResponse).map(([key, ids]) => [key, textsFor(ids)[0] || ""]));
    return Object.assign({
      id: prefixed(question.id), stage: question.stage,
      target: `Number-line ${evidenceFamily(question).replace(/_/g, " ")}`,
      assessmentIntent: question.authorOnlyAssessmentIntent, evidenceFamily: evidenceFamily(question), prompt: question.prompt,
      model: toModel(question.visual), response: responseFor(question), answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy || "none", solutionPolicy: question.policy?.solutionPolicy || "after_response",
        scored: question.policy?.scored !== false, answerLocksOnSubmit: question.policy?.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.requiresFreshNoHintConfirmationIfHintUsed === true
      },
      attempt_policy: { submit_label: question.response?.submitLabel || "Check answer" },
      visual: { primitive: "fra05_context", action: "focus", description: question.prompt },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: textsFor(outcome.correctUtteranceIds)[0] || "", on_correct_math: "",
        on_incorrect_reaction: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_1: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        on_incorrect_attempt_2: textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "",
        worked_explanation: (question.workedCheck?.visibleSteps || []).join(" "),
        worked_narration: textsFor(outcome.workedCheckUtteranceIds), response_feedback: responseFeedback
      },
      runtimeOutcome: outcome, mathematical_support: question.hint ? { hint_1: question.hint } : {},
      errorClassification: classificationFor(question), recovery_item_ref: repairIds[family] || null, primaryErrorFamily: family
    }, overrides || {});
  }
  function convertFallback(profile) {
    const item = profile.deterministicFallback;
    return convertQuestion(Object.assign({}, item, { id: item.id.replace("-FALLBACK", "") }), {
      stage: "confirmation", evidenceFamily: profile.family,
      primaryErrorFamily: profile.family === "estimate" ? "unanchored_estimate" : profile.family === "beyond_one" ? "wrong_whole" : "tick_marks"
    });
  }
  function convertRepair(repair) {
    const title = studentRepairTitles[repair.id] || "Look at the number line again";
    return {
      id: prefixed(repair.id), stage: "repair", target: `Practise: ${title.toLowerCase()}`,
      assessmentIntent: `repair_${repair.family}`, evidenceFamily: repair.family, prompt: title, model: toModel(repair.visual),
      response: { type: "continue" }, answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      visual: { primitive: "fra05_context", action: "repair", description: title },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds], freshCheckId: prefixed(repair.freshConfirmationId),
      primaryErrorFamily: repair.family, errorClassification: { fallback: repair.family }
    };
  }
  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({ id: cue.id, utteranceId: cue.utteranceId, cue: cue.anchorText, anchorText: cue.anchorText, action: cueActions[cue.id] || "focus_number_line" }));
  }
  function teachingStep(scene, nextId) {
    const title = studentSceneTitles[scene.id] || "Use the number line";
    const authoredIds = new Set(scene.ryanUtteranceIds || []);
    const cues = sceneCues(scene).filter((cue) => authoredIds.has(cue.utteranceId));
    return {
      id: scene.id, purpose: title,
      scene: { display_title: title, initial_state: title, objects: [scene.visual.kind], model: toModel(scene.visual) },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 700 })), next_step: nextId
    };
  }
  function buildQuestions() {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const common = [...hook.interaction.commonRevealUtteranceIds];
    const correctIds = [...hook.interaction.feedbackByOption.three_quarters.ryanUtteranceIds];
    const incorrectIds = [...hook.interaction.feedbackByOption.four_fifths.ryanUtteranceIds];
    const hookQuestion = {
      id: prefixed("HOOK-CHOICE"), stage: "opening", target: "Choose a fraction for the journey",
      assessmentIntent: "opening_interval_prediction", evidenceFamily: "opening_choice", prompt: hook.interaction.prompt,
      model: toModel(hook.visual), response: { type: "single_choice", options: hook.interaction.options.map((option) => option.label), keyboard_submit: true },
      answer: { value: hook.interaction.options.find((option) => option.id === "three_quarters").label },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Reveal the line" },
      visual: { primitive: "fra05_context", action: "focus", description: hook.interaction.prompt, syncCues: sceneCues(hook) },
      scripts: {
        engagement_label: "Look at the equal spaces", engagement_correct_feedback: textsFor(correctIds)[0],
        engagement_incorrect_feedback: textsFor(incorrectIds)[0], engagement_detail: textsFor(common),
        engagement_correct_response: textsFor([...correctIds, ...common]), engagement_incorrect_response: textsFor([...incorrectIds, ...common])
      },
      runtimeOutcome: { correctUtteranceIds: correctIds, incorrectDefaultUtteranceIds: incorrectIds, commonRevealUtteranceIds: common },
      primaryErrorFamily: "unknown", errorClassification: { fallback: "unknown" }
    };
    return [hookQuestion, ...approved.questions.map((question) => convertQuestion(question)), ...approved.repairs.map(convertRepair), ...approved.recoveryProfiles.map(convertFallback)];
  }

  function validateNumberLineModel(question) {
    const issues = []; const model = question?.model;
    if (!model || !["fra05_number_line", "fra05_runner_track"].includes(model.context)) return issues;
    if (model.context === "fra05_runner_track") {
      if (model.markerCount !== model.equalGapCount + 1) issues.push("runner track marker count must be one more than gap count");
      if (model.runnerMarkerIndexFromZero !== 3 || model.equalGapCount !== 4) issues.push("runner track must show three travelled gaps out of four");
      return issues;
    }
    if (model.minWhole !== 0 || ![1, 2].includes(model.maxWhole)) issues.push("number line must run from zero to one or two");
    if (model.denominator !== null && (!Number.isInteger(model.denominator) || model.denominator < 2 || model.denominator > 12)) issues.push("denominator must be an integer from 2 to 12");
    if (model.denominator && model.totalIntervals !== model.denominator * model.maxWhole) issues.push("total interval count is inconsistent");
    if (model.pointIndexFromZero !== null && model.denominator && (model.pointIndexFromZero < 0 || model.pointIndexFromZero > model.totalIntervals)) issues.push("point index is outside the line");
    if (question.response?.type === "tick_selector" && model.interactiveMode !== "select_tick") issues.push("tick selector requires a selectable number line");
    return issues;
  }
  function collectObjects(value, output) {
    if (Array.isArray(value)) return value.forEach((item) => collectObjects(item, output));
    if (!value || typeof value !== "object") return;
    output.push(value); Object.values(value).forEach((item) => collectObjects(item, output));
  }
  function validateRuntimeContract(registry, lessonSpec) {
    const selectedRegistry = registry || runtimeCopy; const selectedSpec = lessonSpec || approved; const issues = []; const owners = new Map();
    Object.entries(selectedRegistry).forEach(([id, entry]) => {
      const text = String(entry?.text || "").trim(); const key = text.toLowerCase();
      if (!text) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
      if (owners.has(key)) issues.push(`${id} duplicates ${owners.get(key)}`); owners.set(key, id);
    });
    const objects = []; collectObjects(selectedSpec, objects);
    objects.forEach((object) => {
      if (Object.prototype.hasOwnProperty.call(object, "captionText")) issues.push("captionText is forbidden");
      Object.entries(object).forEach(([key, value]) => {
        if (key.endsWith("UtteranceIds") && Array.isArray(value)) value.forEach((id) => { if (!selectedRegistry[id]) issues.push(`Missing runtime utterance ${id}`); });
      });
      if (object.utteranceId && object.anchorText) {
        const entry = selectedRegistry[object.utteranceId];
        if (!entry) issues.push(`${object.id || "cue"} points to missing ${object.utteranceId}`);
        else if (!entry.text.toLowerCase().includes(String(object.anchorText).toLowerCase())) issues.push(`${object.id || "cue"} anchor is absent from ${object.utteranceId}`);
      }
    });
    return issues;
  }
  function selectOutcomeUtteranceIds(question, response, correct) {
    const outcome = question?.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    return [...(outcome.errorSpecificUtteranceIdsByResponse?.[responseKey(response)] || outcome.incorrectDefaultUtteranceIds || [])];
  }
  function getHookResponseSequence(optionId) {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    return [...hook.interaction.feedbackByOption[optionId].ryanUtteranceIds, ...hook.interaction.commonRevealUtteranceIds];
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA05 v2 runtime source was not loaded.");
    const runtimeIssues = validateRuntimeContract();
    if (runtimeIssues.length) throw new Error(`FRA05 v2 runtime contract failed: ${runtimeIssues.join("; ")}`);
    const questionBank = buildQuestions();
    questionBank.forEach((question) => { const issues = validateNumberLineModel(question); if (issues.length) throw new Error(`${question.id}: ${issues.join("; ")}`); });
    spec.identity = Object.assign({}, spec.identity, { id: FRA05_ID, title: approved.title, status: "IMPLEMENTATION_CANDIDATE_READY_FOR_OWNER_REVIEW_V2", version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.concept_model = Object.assign({}, spec.concept_model, { core_idea: approved.scope.studentFacingIdea, worked_model: approved.mentalModel.join(" ") });
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02", "FRA-03"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;
    const scenes = approved.teachingScenes; const hook = scenes.find((scene) => scene.id === "HOOK");
    const hookChoice = {
      id: "HOOK-CHOICE", purpose: "Choose a fraction for the journey",
      scene: { display_title: "Count the equal spaces", initial_state: "Choose a fraction for the runner's journey.", objects: ["runner_track"], model: toModel(hook.visual) },
      narration: {
        script: [], utterance_ids: [],
        sync_cues: sceneCues(hook).filter((cue) => !(hook.ryanUtteranceIds || []).includes(cue.utteranceId))
      }, animation_timeline: [],
      learner_interaction: { question_ref: prefixed("HOOK-CHOICE") }, next_step: "T1"
    };
    const sceneNext = { T1: "T2", T2: "T3", T3: "T4", T4: "T5", T5: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = [teachingStep(hook, "HOOK-CHOICE"), hookChoice, ...scenes.filter((scene) => scene.id !== "HOOK").map((scene) => teachingStep(scene, sceneNext[scene.id]))];
    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const question = questionBank.find((item) => item.id === prefixed(id));
      const next = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" }[id];
      return [id, { stage: question.stage === "independent" ? "independent_transfer" : question.stage, question_ref: question.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: question.scripts.before_submit, visual_before_answer: question.prompt, correct_next: next, recovery_ref: question.recovery_item_ref }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Evidence-driven confirmations only.", between_question_transition: "" };
    const confirmations = approved.questions.filter((question) => question.stage === "confirmation").map((question) => prefixed(question.id));
    const fallbacks = approved.recoveryProfiles.map((profile) => prefixed(profile.deterministicFallback.id.replace("-FALLBACK", "")));
    const confirmationIds = [...confirmations, ...fallbacks];
    spec.lesson.exit = {
      intro_script: textsFor(approved.routing.finalCheck.introUtteranceIds), primary_question_refs: ["M1", "M2", "M3", "M4"].map(prefixed),
      confirmation_question_refs: confirmationIds,
      repair_by_primary: { [prefixed("M1")]: repairIds.tick_marks, [prefixed("M2")]: repairIds.tick_marks, [prefixed("M3")]: repairIds.wrong_whole, [prefixed("M4")]: repairIds.unanchored_estimate },
      post_repair_retest_refs: confirmationIds,
      mastery_policy: { secureMinimum: 3, requireMoreThanOneEvidenceFamily: true, blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: ["tick_marks", "zero_as_step", "wrong_whole", "swap_roles", "unanchored_estimate"], twoCorrectRequiredFreshSuccesses: 2, zeroOrOneCorrectRequiredFreshSuccesses: 4 }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only", skip_after: { G2: { type: "guided_strong", questionRefs: [prefixed("G1"), prefixed("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" }, repair_by_error_family: Object.assign({}, repairIds),
      fresh_checks_by_error_family: {
        tick_marks: [prefixed("C-TICKS"), prefixed("RF-INTERVAL-COUNT"), prefixed("RF-EXACT-READ")],
        zero_as_step: [prefixed("C-ZERO"), prefixed("C-EXACT-HINT"), prefixed("RF-EXACT-READ")], wrong_whole: [prefixed("C-WHOLE"), prefixed("RF-BEYOND-ONE")],
        swap_roles: [prefixed("C-SWAP"), prefixed("RF-EXACT-READ")], unanchored_estimate: [prefixed("C-ANCHOR"), prefixed("RF-ESTIMATE")], unknown: fallbacks
      },
      no_hint_confirmation_by_question: { [prefixed("F1")]: prefixed("C-TICKS"), [prefixed("F2")]: prefixed("C-WHOLE"), [prefixed("I1")]: prefixed("C-EXACT-HINT"), [prefixed("I2")]: prefixed("C-ANCHOR") },
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(approved.routing.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building your number-line strategy", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan", voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)", locale: "en-GB", opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "authored_audio_then_browser_speech", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra05_context", equal_width_wholes: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra05_context", "fraction_input", "single_choice", "tick_selector", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true, version: CONTENT_VERSION, content_version: CONTENT_VERSION, storyboard_version: "1.0-v2-runtime",
      engine_profile: "fra05", runtime_applied: true, owner_review_status: "candidate", runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      objective: spec.learning_objective, core_mental_model: approved.mentalModel,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Less help", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      capabilities: { exact_number_line: true, extended_number_line: true, anchor_estimation: true, click_drag_keyboard_tick_selector: true,
        draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, four_item_final: true,
        targeted_repairs: true, fresh_confirmations: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra05Canonical = { apply, buildQuestions, getHookResponseSequence, runtimeCopy, selectOutcomeUtteranceIds, textFor, toModel, validateNumberLineModel, validateRuntimeContract };
})();
