(function () {
  "use strict";

  const LESSON_ID = "FRA-26";
  const CONTENT_VERSION = "fra26-handoff-v1-runtime-copy-1";
  const source = window.RevilyFra26Approved;
  const lesson = source?.FRA26_CANONICAL_SPEC;
  const runtimeCopy = source?.FRA26_RUNTIME_COPY || {};
  const uiCopy = source?.FRA26_LEARNER_UI_COPY || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = Object.freeze({
    reverse_incomplete: prefix("R-REVERSE"),
    integer_unchanged: prefix("R-INTEGER"),
    zero_has_reciprocal: prefix("R-ZERO"),
    sign_opposite: prefix("R-SIGN-VALUE"),
    value_changed: prefix("R-SIGN-VALUE")
  });
  const freshByFamily = Object.freeze({
    reverse_incomplete: [prefix("R-REVERSE-CHECK")],
    integer_unchanged: [prefix("R-INTEGER-CHECK")],
    zero_has_reciprocal: [prefix("R-ZERO-CHECK")],
    sign_opposite: [prefix("R-SIGN-VALUE-CHECK")],
    value_changed: [prefix("R-SIGN-VALUE-CHECK")],
    arithmetic_slip: [prefix("C-FRACTION"), prefix("C-PRODUCT")],
    support_needed: [prefix("C-FRACTION"), prefix("C-INTEGER"), prefix("C-ZERO")],
    unknown: [prefix("C-FRACTION"), prefix("C-INTEGER")]
  });

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA-26 runtime utterance: ${id}`);
    return entry;
  }

  function textFor(id) {
    return runtimeEntry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function uiText(id) {
    const entry = uiCopy[id];
    if (!entry?.text) throw new Error(`Missing FRA-26 learner UI copy: ${id}`);
    return entry.text;
  }

  function questionId(question) {
    return question?.canonicalQuestionId || unprefix(question?.id);
  }

  function optionLabel(canonical, optionId) {
    const option = canonical?.response?.options?.find((candidate) => candidate.id === optionId);
    return option ? uiText(option.copyId) : optionId;
  }

  function optionId(question, response) {
    return question?.response?.optionIds?.[String(response)] || String(response ?? "");
  }

  function fractionCandidate(response) {
    if (!response || typeof response !== "object") return null;
    const numerator = Number(response.n ?? response.numerator);
    const denominator = Number(response.d ?? response.denominator);
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) return null;
    return { numerator, denominator };
  }

  function answerSource(canonical) {
    return canonical?.answer?.source || null;
  }

  function responseFor(question) {
    const response = question.response || {};
    if (response.kind === "fraction_input") {
      return {
        type: question.id === "R-INTEGER-SUPPORTED" ? "fra26_staged_integer" : "fraction",
        input_label: "Reciprocal",
        accept_equivalent_notation: question.policy.allowEquivalentReciprocal !== false,
        keyboard_submit: true
      };
    }
    if (response.kind === "matching") {
      return {
        type: question.id === "R-REVERSE-SUPPORTED" ? "fra26_tile_placement" : "fra26_matching",
        keyboard_submit: true
      };
    }
    if (["single_choice", "non_scored_choice"].includes(response.kind)) {
      const options = (response.options || []).map((option) => uiText(option.copyId));
      return {
        type: "single_choice",
        options,
        optionIds: Object.fromEntries((response.options || []).map((option) => [uiText(option.copyId), option.id])),
        keyboard_submit: true
      };
    }
    throw new Error(`${question.id}: unsupported FRA-26 response kind ${response.kind}`);
  }

  function answerFor(question) {
    if (question.answer.optionId) return optionLabel(question, question.answer.optionId);
    if (question.answer.pairs) return Object.fromEntries(question.answer.pairs);
    if (question.answer.placements) return { ...question.answer.placements };
    if (question.answer.staged) {
      const reciprocal = question.answer.staged.at(-1);
      return { firstDenominator: String(question.answer.staged[0].denominator), n: String(reciprocal.numerator), d: String(reciprocal.denominator) };
    }
    if (question.answer.exact) return { n: String(question.answer.exact.numerator), d: String(question.answer.exact.denominator) };
    return null;
  }

  function feedbackIds(question, correct) {
    const feedback = question?.feedback || {};
    if (correct) return [...(feedback.correctRyanUtteranceIds || [])];
    return [...(feedback.incorrectDefaultRyanUtteranceIds || [])];
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    return feedbackIds(question?.canonicalQuestion || question, correct);
  }

  function defaultErrorFamily(question) {
    const id = question?.id || "";
    if (/INTEGER/.test(id) || question?.answer?.source?.kind === "integer") return "integer_unchanged";
    if (/ZERO|REASON/.test(id)) return "zero_has_reciprocal";
    if (/SIGN-VALUE/.test(id)) return "sign_opposite";
    return "reverse_incomplete";
  }

  function matchingCorrect(canonical, response) {
    if (!response || typeof response !== "object") return false;
    if (canonical.answer.pairs) return canonical.answer.pairs.every(([left, right]) => response[left] === right);
    if (canonical.answer.placements) {
      return Number(response.numerator) === canonical.answer.placements.numerator
        && Number(response.denominator) === canonical.answer.placements.denominator;
    }
    return false;
  }

  function evaluateResponse(question, response) {
    const canonical = question?.canonicalQuestion;
    if (!canonical) return { correct: false, errorFamily: "unknown", visibleText: "" };
    let correct = false;
    if (canonical.answer.optionId) {
      correct = optionId(question, response) === canonical.answer.optionId;
    } else if (canonical.answer.pairs || canonical.answer.placements) {
      correct = matchingCorrect(canonical, response);
    } else if (canonical.answer.staged) {
      const candidate = fractionCandidate(response);
      correct = Number(response?.firstDenominator) === 1
        && Boolean(candidate && source.acceptsReciprocalAnswer({ kind: "integer", value: 8 }, candidate));
    } else if (canonical.answer.exact) {
      const candidate = fractionCandidate(response);
      correct = Boolean(candidate && source.acceptsReciprocalAnswer(canonical.answer.source, candidate));
    }
    const errorFamily = correct ? null : classifyErrorFamily(question, response);
    return {
      correct,
      errorFamily,
      utteranceIds: selectOutcomeUtteranceIds(question, response, correct),
      visibleText: visibleFeedback(question, response, correct)
    };
  }

  function classifyErrorFamily(question, response) {
    const canonical = question?.canonicalQuestion || question;
    const id = canonical?.id || questionId(question);
    const selected = optionId(question, response);
    const byChoice = {
      G1: { B: "reverse_incomplete", C: "reverse_incomplete", D: "reverse_incomplete" },
      I2: { B: "zero_has_reciprocal", C: "sign_opposite", D: "integer_unchanged" },
      M4: { A: "zero_has_reciprocal", C: "zero_has_reciprocal", D: "zero_has_reciprocal" },
      "R-ZERO-SUPPORTED": { A: "zero_has_reciprocal", B: "zero_has_reciprocal" },
      "R-SIGN-VALUE-SUPPORTED": { A: "reverse_incomplete", B: "sign_opposite" },
      "RM-REASON": { B: "zero_has_reciprocal", C: "zero_has_reciprocal" },
      RF4: { B: "zero_has_reciprocal", C: "zero_has_reciprocal" },
      "C-ZERO": { ONE: "zero_has_reciprocal", FOUR: "zero_has_reciprocal", EIGHTH: "zero_has_reciprocal" },
      "R-ZERO-CHECK": { ONE: "zero_has_reciprocal", FOUR: "zero_has_reciprocal", EIGHTH: "zero_has_reciprocal" }
    };
    if (byChoice[id]?.[selected]) return byChoice[id][selected];
    if (canonical?.answer?.pairs) {
      if ((id === "F2" && response?.L2 && response.L2 !== "R3") || (id === "RM-MATCH" && response?.L2 && response.L2 !== "R2")) return "integer_unchanged";
      return "reverse_incomplete";
    }
    if (canonical?.answer?.placements) return "reverse_incomplete";
    const candidate = fractionCandidate(response);
    const sourceValue = answerSource(canonical);
    if (candidate && sourceValue) return source.classifyFractionResponse(sourceValue, candidate) || defaultErrorFamily(canonical);
    return defaultErrorFamily(canonical);
  }

  function requiresRepeatedEvidence(question, response) {
    return ["reverse_incomplete", "integer_unchanged", "value_changed"].includes(classifyErrorFamily(question, response));
  }

  function visibleFeedback(question, response, correct) {
    const canonical = question?.canonicalQuestion || question;
    const feedback = canonical?.feedback || {};
    const selected = optionId(question, response);
    const specific = (feedback.byResponse || []).find((branch) => branch.matcher === `selected ${selected}`);
    const copyIds = correct ? feedback.correctCopyIds : (specific?.copyIds || feedback.incorrectDefaultCopyIds);
    if (copyIds?.length) return uiText(copyIds[0]);
    const utteranceIds = correct ? feedback.correctRyanUtteranceIds : (specific?.ryanUtteranceIds || feedback.incorrectDefaultRyanUtteranceIds);
    return utteranceIds?.length ? textFor(utteranceIds[0]) : "";
  }

  function convertQuestion(question, overrides) {
    const response = responseFor(question);
    const workedSteps = (question.workedCheck?.copyIds || []).map(uiText);
    const runtimeIds = [
      ...(question.ryanBeforeSubmitUtteranceIds || []),
      ...(question.id === "HOOK" ? ["HOOK.REVEAL.1", "HOOK.REVEAL.2"] : []),
      ...(question.feedback?.correctRyanUtteranceIds || []),
      ...(question.feedback?.incorrectDefaultRyanUtteranceIds || []),
      ...(question.feedback?.byResponse || []).flatMap((branch) => branch.ryanUtteranceIds || [])
    ];
    const hintCopyId = `${question.id}.HINT`;
    const hint = uiCopy[hintCopyId]?.text || "";
    return Object.assign({
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: question.authorOnlyAssessmentIntent,
      assessmentIntent: question.authorOnlyAssessmentIntent,
      evidenceFamily: question.families?.[0] || "DIRECT",
      prompt: uiText(question.promptCopyId),
      response,
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy.hintPolicy === "optional" ? "optional" : question.policy.hintPolicy,
        solutionPolicy: question.policy.solutionPolicy,
        scored: question.policy.scored,
        engagementOnly: question.id === "HOOK",
        answerLocksOnSubmit: question.policy.answerLocksOnSubmit,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy.requiresFreshNoHintConfirmationIfHintUsed,
        countsAsIndependentEvidence: ["final", "recovery", "confirmation"].includes(question.stage) && question.policy.supportedSuccessCountsAsMastery !== true,
        maxAttemptsBeforeRepair: 2
      },
      attempt_policy: { submit_label: question.response.submitLabelCopyId ? uiText(question.response.submitLabelCopyId) : uiText("BUTTON.CHECK") },
      model: {
        context: "fra26",
        questionId: question.id,
        canonicalQuestion: question,
        visual: question.visual,
        accessibleDescription: uiText(question.accessibleDescriptionCopyId),
        workedSteps
      },
      visual: { primitive: "fra26_context", action: "focus", description: uiText(question.accessibleDescriptionCopyId) },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds || []),
        hint,
        on_correct_reaction: textsFor(question.feedback?.correctRyanUtteranceIds || [])[0] || "",
        on_incorrect_reaction: textsFor(question.feedback?.incorrectDefaultRyanUtteranceIds || [])[0] || "",
        on_incorrect_attempt_1: textsFor(question.feedback?.incorrectDefaultRyanUtteranceIds || [])[0] || "",
        on_incorrect_attempt_2: textsFor(question.feedback?.incorrectDefaultRyanUtteranceIds || [])[0] || "",
        worked_explanation: workedSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: workedSteps,
        worked_narration: [],
        engagement_visible_by_value: question.id === "HOOK" ? {
          [uiText("HOOK.OPTION.REPEAT")]: uiText("HOOK.FEEDBACK.INCORRECT"),
          [uiText("HOOK.OPTION.RESTORE")]: uiText("HOOK.FEEDBACK.CORRECT")
        } : undefined
      },
      mathematical_support: hint ? { hint_1: hint } : {},
      runtimeOutcome: {
        correctUtteranceIds: [...(question.feedback?.correctRyanUtteranceIds || [])],
        incorrectUtteranceIds: [...(question.feedback?.incorrectDefaultRyanUtteranceIds || [])],
        commonRevealUtteranceIds: question.id === "HOOK" ? ["HOOK.REVEAL.1", "HOOK.REVEAL.2"] : []
      },
      runtimeUtteranceIds: [...new Set(runtimeIds)],
      primaryErrorFamily: defaultErrorFamily(question),
      errorFamily: defaultErrorFamily(question),
      errorClassification: { fallback: defaultErrorFamily(question) },
      recovery_item_ref: repairByFamily[defaultErrorFamily(question)] || null,
      canonicalQuestion: question
    }, overrides || {});
  }

  function convertRepair(id, repair) {
    return {
      id: prefix(id), canonicalQuestionId: id, stage: "repair", target: `Repair ${id}`,
      assessmentIntent: `targeted_${id.toLowerCase()}`, evidenceFamily: id,
      prompt: "Review the reciprocal structure.", response: { type: "continue" }, answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: { context: "fra26", questionId: id, repair, visual: { kind: "repair_intro", repairId: id }, accessibleDescription: "A targeted reciprocal repair is shown.", workedSteps: [] },
      visual: { primitive: "fra26_context", action: "repair", description: "A targeted reciprocal repair." },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds],
      supportedInteractionId: prefix(repair.supportedQuestionId), freshCheckId: prefix(repair.freshCheckQuestionId),
      primaryErrorFamily: ({ "R-REVERSE": "reverse_incomplete", "R-INTEGER": "integer_unchanged", "R-ZERO": "zero_has_reciprocal", "R-SIGN-VALUE": "sign_opposite" })[id],
      errorClassification: { fallback: "unknown" }
    };
  }

  function buildQuestions() {
    return [
      ...Object.values(source.FRA26_QUESTIONS).map((question) => convertQuestion(question)),
      ...Object.entries(lesson.repairs).map(([id, repair]) => convertRepair(id, repair))
    ];
  }

  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      reducedMotionEquivalent: cue.reducedMotionState,
      accessibleLabel: cue.reducedMotionState
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: scene.authorOnlyTeachingPurpose,
      scene: { display_title: ({ HOOK: "Undo the scale", T1: "Make a product of one", T2: "Exchange both positions", T3: "Integers, unit fractions and one", T4: "Why zero is different" })[scene.id], initial_state: scene.authorOnlyUnderstandingExpected || scene.id, objects: [scene.visual.kind], model: { context: "fra26", sceneId: scene.id, visual: scene.visual } },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 560 })),
      next_step: nextId
    };
  }

  function inputMarkup(question, saved, locked) {
    const disabled = locked ? " disabled" : "";
    const value = saved && typeof saved === "object" ? saved : {};
    if (question.response.type === "fra26_matching") {
      const visual = question.canonicalQuestion.visual;
      const right = visual.rightCards || [];
      return `<fieldset class="fra26-matching-input"><legend>Match each number to its reciprocal</legend>${(visual.leftCards || []).map((card) => `<label><span>${window.RevilyVisuals.mathMarkup(formatValue(card.value))}</span><select data-fra26-match="${card.id}" aria-label="Reciprocal match for ${formatValue(card.value)}"${disabled}><option value="">Choose a match</option>${right.map((target) => `<option value="${target.id}"${value[card.id] === target.id ? " selected" : ""}>${formatValue(target.value)}</option>`).join("")}</select></label>`).join("")}</fieldset>`;
    }
    if (question.response.type === "fra26_tile_placement") {
      const tiles = question.canonicalQuestion.visual.numberTiles;
      const options = (field) => `<option value="">Choose a tile</option>${tiles.map((tile) => `<option value="${tile}"${String(value[field] || "") === String(tile) ? " selected" : ""}>${tile}</option>`).join("")}`;
      return `<fieldset class="fra26-tile-input"><legend>Place both number tiles in the reciprocal</legend><div class="fra26-input-fraction"><label><span>Numerator</span><select data-fra26-tile="numerator"${disabled}>${options("numerator")}</select></label><i aria-hidden="true"></i><label><span>Denominator</span><select data-fra26-tile="denominator"${disabled}>${options("denominator")}</select></label></div></fieldset>`;
    }
    if (question.response.type === "fra26_staged_integer") {
      const firstComplete = String(value.firstDenominator || "") === "1";
      return `<fieldset class="fra26-staged-input"><legend>Write 8 as a fraction, then give its reciprocal</legend><label class="fra26-fixed-stage"><b>8</b><i></i><input data-fra26-first-denominator aria-label="Denominator when 8 is written as a fraction" inputmode="numeric" value="${value.firstDenominator || ""}"${disabled}></label><div data-fra26-reciprocal-stage${firstComplete ? "" : " hidden"}><span>Reciprocal</span><div class="fraction-input"><input data-fra26-stage-n aria-label="Reciprocal numerator" inputmode="numeric" value="${value.n || ""}"${disabled}><i></i><input data-fra26-stage-d aria-label="Reciprocal denominator" inputmode="numeric" value="${value.d || ""}"${disabled}></div></div></fieldset>`;
    }
    return "";
  }

  function bindInputEvents(engine, question) {
    const form = engine.root.querySelector("#answer-form");
    const update = () => {
      engine.state.drafts[question.id] = readResponse(engine, question, true) || {};
      engine.updateSubmitAvailability(question);
      engine.persist();
    };
    form.querySelectorAll("select, input").forEach((control) => control.addEventListener("change", update));
    form.querySelectorAll("input").forEach((control) => control.addEventListener("input", update));
    const first = form.querySelector("[data-fra26-first-denominator]");
    if (first) first.addEventListener("input", () => {
      const ready = first.value.trim() === "1";
      const stage = form.querySelector("[data-fra26-reciprocal-stage]");
      if (stage) stage.hidden = !ready;
      if (ready && !engine.state.evidence.fra26IntegerStageNarrated?.[question.id]) {
        engine.state.evidence.fra26IntegerStageNarrated ||= {};
        engine.state.evidence.fra26IntegerStageNarrated[question.id] = true;
        engine.startNarration(textsFor(["R-INTEGER.3", "R-INTEGER.4"]), null);
      }
    });
  }

  function readResponse(engine, question, allowPartial) {
    if (question.response.type === "fra26_matching") {
      const result = Object.fromEntries([...engine.root.querySelectorAll("[data-fra26-match]")].map((select) => [select.dataset.fra26Match, select.value]));
      return allowPartial || Object.values(result).every(Boolean) ? result : null;
    }
    if (question.response.type === "fra26_tile_placement") {
      const result = Object.fromEntries([...engine.root.querySelectorAll("[data-fra26-tile]")].map((select) => [select.dataset.fra26Tile, select.value]));
      return allowPartial || Object.values(result).every(Boolean) ? result : null;
    }
    if (question.response.type === "fra26_staged_integer") {
      const result = { firstDenominator: engine.root.querySelector("[data-fra26-first-denominator]")?.value.trim() || "", n: engine.root.querySelector("[data-fra26-stage-n]")?.value.trim() || "", d: engine.root.querySelector("[data-fra26-stage-d]")?.value.trim() || "" };
      return allowPartial || Object.values(result).every((part) => /^-?\d+$/.test(part)) ? result : null;
    }
    return null;
  }

  function formatValue(value) {
    if (typeof value === "number") return String(value);
    return value && typeof value === "object" ? `${value.numerator}/${value.denominator}` : String(value ?? "");
  }

  function selectRecoveryQuestionIds(route, missedFamilies) {
    if (route === "repair_then_four_item_recovery_final") return ["RF1", "RF2", "RF3", "RF4"].map(prefix);
    const families = new Set(missedFamilies || []);
    const first = families.has("integer_unchanged") ? "RM-INTEGER" : families.has("reverse_incomplete") || families.has("sign_opposite") || families.has("value_changed") ? "RM-DIRECT" : "RM-MISSING";
    const second = families.has("zero_has_reciprocal") ? "RM-REASON" : "RM-MATCH";
    return [first, second].map(prefix);
  }

  function validateRuntimeContract() {
    const errors = [];
    try { source.validateFRA26CanonicalSpec(); } catch (error) { errors.push(error.message); }
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      if (entry.spokenBy !== "Ryan") errors.push(`${id}: spokenBy must be Ryan`);
      if (entry.captionSource !== "same_as_audio") errors.push(`${id}: captionSource must be same_as_audio`);
    });
    Object.entries(uiCopy).forEach(([id, entry]) => {
      if (entry.speechPolicy !== "never_automatic_ryan") errors.push(`${id}: learner UI copy is not speech-blocked`);
    });
    return errors;
  }

  function validateQuestionModel(question) {
    const issues = [];
    if (question?.model?.context !== "fra26") return ["model.context must be fra26"];
    if (!question.assessmentIntent) issues.push("assessmentIntent is missing");
    if (!question.model.canonicalQuestion && !question.model.repair) issues.push("canonical question or repair source is missing");
    if (!question.model.accessibleDescription) issues.push("accessibleDescription is missing");
    if (question.model.canonicalQuestion && question.model.canonicalQuestion.id !== question.canonicalQuestionId) issues.push("canonical question ID does not match");
    return issues;
  }

  function apply(spec) {
    if (!lesson) throw new Error("FRA-26 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA-26 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const byRawId = (id) => questionBank.find((question) => question.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: lesson.title, status: lesson.status, version: CONTENT_VERSION });
    spec.learning_objective = lesson.curriculumContract.objective;
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const hook = lesson.teachingScenes.HOOK;
    const hookChoice = { id: "HOOK-CHOICE", purpose: "Predict the restoring scale factor", scene: { display_title: "Which multiplier restores the width?", initial_state: uiText("HOOK.PROMPT"), objects: [hook.visual.kind], model: { context: "fra26", sceneId: "HOOK-CHOICE", visual: hook.visual } }, narration: { script: [], utterance_ids: [], sync_cues: [] }, animation_timeline: [], learner_interaction: { question_ref: prefix("HOOK") }, next_step: "T1" };
    const nextByScene = { T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF" };
    const handoff = { id: "HANDOFF", purpose: "Move from explanation to guided practice", scene: { display_title: "Use the product-one test", initial_state: "Product equals one", objects: ["reciprocal_handoff"], model: { context: "fra26", sceneId: "HANDOFF", visual: { kind: "reciprocal_handoff" } } }, narration: { script: textsFor(lesson.authoredTransitions.handoffUtteranceIds), utterance_ids: [...lesson.authoredTransitions.handoffUtteranceIds], sync_cues: [] }, animation_timeline: [], next_step: "G1" };
    spec.lesson.teaching_steps = [teachingStep(hook, "HOOK-CHOICE"), hookChoice, ...["T1", "T2", "T3", "T4"].map((id) => teachingStep(lesson.teachingScenes[id], nextByScene[id])), handoff];

    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const nextByQuestion = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const item = byRawId(id);
      const before = [...item.scripts.before_submit];
      if (id === "I1") before.unshift(...textsFor(lesson.authoredTransitions.independentIntroUtteranceIds));
      return [id, { stage: item.stage === "independent" ? "independent_transfer" : item.stage, question_ref: item.id, support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none", pre_question_script: before, visual_before_answer: item.prompt, correct_next: nextByQuestion[id], recovery_ref: item.recovery_item_ref }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Approved FRA-26 adaptive route only.", between_question_transition: "" };
    spec.lesson.exit = {
      intro_script: textsFor(lesson.authoredTransitions.finalIntroUtteranceIds),
      use_question_before_submit_narration: true,
      primary_question_refs: ["M1", "M2", "M3", "M4"].map(prefix),
      confirmation_question_refs: ["C-FRACTION", "C-INTEGER", "C-PRODUCT", "C-ZERO", "R-REVERSE-CHECK", "R-INTEGER-CHECK", "R-ZERO-CHECK", "R-SIGN-VALUE-CHECK", "RM-DIRECT", "RM-INTEGER", "RM-MISSING", "RM-REASON", "RM-MATCH", "RF1", "RF2", "RF3", "RF4"].map(prefix),
      mastery_policy: { profile: "fra26_four_item", secureMinimum: 3, totalItems: 4, minimumDistinctFamilies: 2, blockRepeatedCentralMisconception: true, repairCycleCapPerFamily: 1 }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra26_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: { [prefix("F1")]: prefix("C-FRACTION"), [prefix("F2")]: prefix("C-INTEGER"), [prefix("I1")]: prefix("C-PRODUCT"), [prefix("I2")]: prefix("C-ZERO") },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: freshByFamily
    };
    spec.completion = { secure: { title: "Lesson complete", ryan_script: textsFor(lesson.authoredTransitions.completionUtteranceIds), buttons: ["Back to Fractions", "Start again"] }, needs_work: { title: "More practice needed", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] } };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, { narrator: "Ryan", voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)", locale: "en-GB", opening_mode: "authored_scene_only", caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false }, narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 }, success_reaction_policy: { mode: "question_specific_only" } });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra26_context", property_driven: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra26_context", "fraction_input", "single_choice", "fra26_matching", "fra26_tile_placement", "fra26_staged_integer", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = { reference_for_future_lessons: true, version: CONTENT_VERSION, content_version: CONTENT_VERSION, storyboard_version: "fra26-owner-approved-v1", engine_profile: "fra26", runtime_applied: true, owner_review_status: lesson.status, runtime_copy: runtimeCopy, runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])), source_of_truth: lesson.sourceOfTruth, phase_labels: { teaching: uiText("STAGE.LEARN"), guided: uiText("STAGE.GUIDED"), faded: uiText("STAGE.FADED"), independent: uiText("STAGE.INDEPENDENT"), repair: "Targeted repair", exit: uiText("STAGE.FINAL"), completion: "Lesson complete" }, route_contract: lesson.routing, persistence_contract: lesson.persistenceContract, capabilities: { exact_rational_equivalence: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, four_item_final: true, targeted_repairs: true, fresh_confirmations: true, utterance_id_runtime: true, reduced_motion_equivalence: true } };
    return spec;
  }

  window.RevilyFra26Canonical = { CONTENT_VERSION, apply, buildQuestions, classifyErrorFamily, evaluateResponse, inputMarkup, bindInputEvents, readResponse, repairByFamily, freshByFamily, requiresRepeatedEvidence, runtimeCopy, selectOutcomeUtteranceIds, selectRecoveryQuestionIds, textFor, uiText, validateQuestionModel, validateRuntimeContract, visibleFeedback };
})();
