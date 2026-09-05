(function () {
  "use strict";

  const LESSON_ID = "FRA-28";
  const CONTENT_VERSION = "FRA28-HANDOFF-V1";
  const approved = window.RevilyFra28Approved;
  const source = window.RevilyFra28Source || {};
  const runtimeCopy = window.FRA28_RUNTIME_COPY || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");
  const structuredTypes = new Set([
    "fra28_choice_then_fraction",
    "fra28_reciprocal_and_fraction",
    "fra28_range_and_fraction"
  ]);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[character]);
  }

  function textFor(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA28 runtime utterance: ${id}`);
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
      if (entry?.spokenBy !== "Ryan") issues.push(`${id} is not assigned to Ryan`);
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
        else if (!entry.text.includes(String(object.anchorText))) issues.push(`Cue anchor is absent from ${object.utteranceId}`);
      }
    });
    return [...new Set(issues)];
  }

  function syncCuesFor(utteranceIds) {
    const ids = new Set(utteranceIds || []);
    return (approved.speechLedCues || []).filter((cue) => ids.has(cue.utteranceId)).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      action: cue.id,
      target: cue.target,
      reducedMotionEquivalent: cue.reducedMotionEquivalent
    }));
  }

  function accessibleDescription(raw) {
    return raw?.visual?.accessibleDescriptionPreSubmit
      || raw?.authorOnly?.visual
      || raw?.studentFacing?.prompt
      || "A division-by-a-fraction model is shown without revealing the answer.";
  }

  function modelFor(raw, additions) {
    return Object.assign({
      context: "fra28_divide_fraction",
      sceneId: raw.id,
      mode: raw.stage ? "question" : "teaching",
      math: raw.math || null,
      visual: raw.visual || null,
      accessibleDescription: accessibleDescription(raw)
    }, additions || {});
  }

  function labelsAndIds(options) {
    const values = (options || []).map((option) => option.label);
    return {
      values,
      optionIds: Object.fromEntries((options || []).map((option) => [option.label, option.id]))
    };
  }

  function responseFor(raw) {
    const response = raw.response || {};
    if (response.kind === "integer" || response.kind === "integer_with_unit") {
      return {
        type: "integer",
        input_label: response.kind === "integer_with_unit" ? "Number of groups" : "Your answer",
        suffix: response.unitLabel || "",
        keyboard_submit: true
      };
    }
    if (response.kind === "fraction") {
      return { type: "fraction", partLabel: "Numerator", wholeLabel: "Denominator", keyboard_submit: true };
    }
    if (response.kind === "single_choice") {
      const mapped = labelsAndIds(raw.studentFacing.options || []);
      return { type: "single_choice", options: mapped.values, optionIds: mapped.optionIds, keyboard_submit: true };
    }
    if (response.kind === "choice_then_fraction") {
      const mapped = labelsAndIds(raw.studentFacing.options || []);
      return { type: "fra28_choice_then_fraction", options: mapped.values, optionIds: mapped.optionIds, keyboard_submit: true };
    }
    if (response.kind === "reciprocal_and_fraction") {
      return { type: "fra28_reciprocal_and_fraction", keyboard_submit: true };
    }
    if (response.kind === "range_and_fraction") {
      const ids = raw.visual?.rangeOptions || ["0_to_1", "exactly_1", "above_1"];
      const labels = { "0_to_1": "Between 0 and 1", "exactly_1": "Exactly 1", "above_1": "Above 1" };
      const options = ids.map((id) => ({ id, label: labels[id] || id.replace(/_/g, " ") }));
      const mapped = labelsAndIds(options);
      return { type: "fra28_range_and_fraction", options: mapped.values, optionIds: mapped.optionIds, keyboard_submit: true };
    }
    throw new Error(`${raw.id}: unsupported FRA28 response kind ${response.kind}`);
  }

  function answerFor(raw) {
    const answer = raw.answer;
    if (answer.kind === "integer") return String(answer.value);
    if (answer.kind === "fraction") return { n: String(answer.value.numerator), d: String(answer.value.denominator) };
    if (answer.kind === "choice") return (raw.studentFacing.options || []).find((option) => option.id === answer.optionId)?.label || answer.optionId;
    if (answer.kind === "choice_and_fraction") return {
      choice: (raw.studentFacing.options || []).find((option) => option.id === answer.optionId)?.label || answer.optionId,
      quotient: { n: String(answer.quotient.numerator), d: String(answer.quotient.denominator) }
    };
    if (answer.kind === "reciprocal_and_quotient") return {
      reciprocal: { n: String(answer.reciprocal.numerator), d: String(answer.reciprocal.denominator) },
      quotient: { n: String(answer.quotient.numerator), d: String(answer.quotient.denominator) }
    };
    if (answer.kind === "range_and_fraction") {
      const label = { "0_to_1": "Between 0 and 1", "exactly_1": "Exactly 1", "above_1": "Above 1" }[answer.rangeId] || answer.rangeId;
      return { range: label, quotient: { n: String(answer.quotient.numerator), d: String(answer.quotient.denominator) } };
    }
    throw new Error(`${raw.id}: unsupported FRA28 answer kind ${answer.kind}`);
  }

  function workedExplanation(raw) {
    return (raw.workedCheck?.visibleSteps || []).map((step, index) => `${index + 1}. ${step}`).join(" ");
  }

  function convertQuestion(raw, additions) {
    const options = raw.studentFacing.options || [];
    const response = responseFor(raw);
    const cueUtteranceIds = [
      ...(raw.studentFacing.ryanBeforeSubmitUtteranceIds || []),
      ...(raw.feedback.correct.utteranceIds || []),
      ...(raw.feedback.incorrectDefault.utteranceIds || []),
      ...Object.values(raw.feedback.byErrorFamily || {}).flatMap((branch) => branch.utteranceIds || [])
    ];
    const question = {
      id: prefix(raw.id),
      stage: raw.stage,
      family: raw.assessmentFamily,
      evidenceFamily: raw.assessmentFamily,
      target: raw.authorOnly.assessmentIntent,
      assessmentIntent: raw.authorOnly.assessmentIntent,
      prompt: raw.studentFacing.prompt,
      questionDetail: [raw.studentFacing.context, raw.studentFacing.title].filter(Boolean).join(" "),
      response,
      answer: { value: answerFor(raw) },
      policy: {
        scored: raw.policy.scored,
        answerLocksOnSubmit: raw.policy.answerLocksOnSubmit,
        commitResponseBeforeOutcome: raw.policy.commitResponseBeforeOutcome,
        hintPolicy: raw.policy.hintPolicy === "optional_collapsed" ? "optional" : "none",
        solutionPolicy: raw.policy.solutionPolicy,
        eligibleForIndependentMastery: raw.policy.eligibleForIndependentMastery,
        countsAsIndependentEvidence: raw.policy.eligibleForIndependentMastery,
        firstAttemptIsAuthoritative: raw.policy.firstAttemptIsAuthoritative,
        requiresFreshNoHintConfirmationIfHintUsed: raw.policy.requiresFreshNoHintConfirmationIfHintUsed
      },
      model: modelFor(raw),
      visual: {
        primitive: "fra28_context",
        description: accessibleDescription(raw),
        syncCues: syncCuesFor(cueUtteranceIds)
      },
      mathematical_support: { hint_1: raw.studentFacing.hint || "" },
      scripts: {
        before_submit: textsFor(raw.studentFacing.ryanBeforeSubmitUtteranceIds),
        on_correct_reaction: textsFor(raw.feedback.correct.utteranceIds)[0] || "",
        on_incorrect_reaction: textsFor(raw.feedback.incorrectDefault.utteranceIds)[0] || "",
        worked_explanation: workedExplanation(raw)
      },
      runtimeOutcome: {
        correctUtteranceIds: [...raw.feedback.correct.utteranceIds],
        incorrectDefaultUtteranceIds: [...raw.feedback.incorrectDefault.utteranceIds],
        errorSpecificUtteranceIds: Object.fromEntries(Object.entries(raw.feedback.byErrorFamily || {}).map(([family, branch]) => [family, [...branch.utteranceIds]])),
        correctVisibleText: raw.feedback.correct.visibleText,
        incorrectDefaultVisibleText: raw.feedback.incorrectDefault.visibleText,
        errorSpecificVisibleText: Object.fromEntries(Object.entries(raw.feedback.byErrorFamily || {}).map(([family, branch]) => [family, branch.visibleText]))
      },
      canonicalQuestion: raw,
      primaryErrorFamily: "AMBIGUOUS",
      optionIds: response.optionIds,
      optionLabels: Object.fromEntries(options.map((option) => [option.id, option.label]))
    };
    return Object.assign(question, additions || {});
  }

  function buildHookQuestion() {
    const hook = approved.scenes.find((scene) => scene.id === "HOOK");
    const options = hook.studentFacing.predictionOptions.map((label, index) => ({ id: String.fromCharCode(65 + index), label }));
    const mapped = labelsAndIds(options);
    return {
      id: prefix("HOOK"),
      stage: "teaching",
      target: hook.purpose,
      assessmentIntent: "Make a non-scored estimate before the measurement reveal.",
      prompt: hook.studentFacing.title,
      questionDetail: "Choose an estimate, then inspect the one-eighth measure.",
      response: { type: "single_choice", options: mapped.values, optionIds: mapped.optionIds, keyboard_submit: true },
      answer: { value: options[2].label },
      policy: { scored: false, engagementOnly: true, answerLocksOnSubmit: true, hintPolicy: "none", solutionPolicy: "after_locked_submit" },
      model: modelFor(hook, {
        mode: "hook",
        math: {
          kind: "division_by_positive_fraction",
          dividend: { numerator: 3, denominator: 4 },
          divisor: { numerator: 1, denominator: 8 },
          reciprocalOfDivisor: { numerator: 8, denominator: 1 },
          quotient: { numerator: 6, denominator: 1 }
        },
        visual: sceneVisual("HOOK")
      }),
      visual: { primitive: "fra28_context", description: accessibleDescription(hook), syncCues: syncCuesFor(["HOOK.1", "HOOK.2", "HOOK.3"]) },
      scripts: {
        before_submit: textsFor(["HOOK.1", "HOOK.2", "HOOK.3"]),
        engagement_visible_by_id: { A: "Now measure the shown strip in one-eighth sections.", B: "Now measure the shown strip in one-eighth sections.", C: "Now measure the shown strip in one-eighth sections." }
      },
      runtimeOutcome: { commonRevealUtteranceIds: ["HOOK.4", "HOOK.5"] },
      canonicalQuestion: hook
    };
  }

  function buildRepairQuestion(repair) {
    return {
      id: prefix(repair.id),
      stage: "repair",
      family: repair.errorFamilies[0],
      evidenceFamily: repair.errorFamilies[0],
      target: repair.authorOnly.trigger,
      assessmentIntent: repair.authorOnly.trigger,
      prompt: repair.studentFacing.title,
      questionDetail: repair.studentFacing.supportedInteraction,
      policy: { scored: false, reteachOnly: true, answerLocksOnSubmit: true, hintPolicy: "none", solutionPolicy: "after_locked_submit", eligibleForIndependentMastery: false },
      model: modelFor(repair, { mode: "repair", visual: { kind: "repair", repairId: repair.id } }),
      visual: { primitive: "fra28_context", description: repair.authorOnly.visual, syncCues: syncCuesFor(repair.narrationUtteranceIds) },
      scripts: { reteach: textsFor(repair.narrationUtteranceIds), before_submit: [], worked_explanation: "" },
      canonicalRepair: repair,
      primaryErrorFamily: repair.errorFamilies[0],
      freshCheckId: prefix(repair.freshCheckQuestionId)
    };
  }

  function buildQuestions() {
    const repairFamilyByCheck = Object.fromEntries(approved.repairs.flatMap((repair) => repair.errorFamilies.map((family) => [repair.freshCheckQuestionId, family])));
    return [
      buildHookQuestion(),
      ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.confirmations.map((question) => convertQuestion(question, { isFreshConfirmation: true })),
      ...approved.repairChecks.map((question) => convertQuestion(question, { isRepairCheck: true, errorFamily: repairFamilyByCheck[question.id], primaryErrorFamily: repairFamilyByCheck[question.id] })),
      ...approved.recoveryBank.map((question) => convertQuestion(question, { isReplacementFinal: true })),
      ...approved.repairs.map(buildRepairQuestion)
    ];
  }

  function asFraction(value) {
    if (!value || typeof value !== "object") {
      if (/^-?\d+$/.test(String(value ?? ""))) return { numerator: Number(value), denominator: 1 };
      return null;
    }
    const numerator = Number(value.n ?? value.numerator);
    const denominator = Number(value.d ?? value.denominator);
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator === 0) return null;
    return { numerator, denominator };
  }

  function equivalent(left, right) {
    const a = asFraction(left);
    const b = asFraction(right);
    return Boolean(a && b && a.numerator * b.denominator === b.numerator * a.denominator);
  }

  function responseChoiceId(question, value) {
    const label = value && typeof value === "object" ? (value.choice ?? value.range) : value;
    return question.response?.optionIds?.[String(label)] || String(label || "");
  }

  function isCorrect(question, response) {
    if (question.policy?.engagementOnly) return true;
    const raw = question.canonicalQuestion;
    const answer = raw.answer;
    if (answer.kind === "integer") return equivalent(response, { numerator: answer.value, denominator: 1 });
    if (answer.kind === "fraction") return equivalent(response, answer.value);
    if (answer.kind === "choice") return responseChoiceId(question, response) === answer.optionId;
    if (answer.kind === "choice_and_fraction") {
      return responseChoiceId(question, response) === answer.optionId && equivalent(response?.quotient, answer.quotient);
    }
    if (answer.kind === "reciprocal_and_quotient") {
      return equivalent(response?.reciprocal, answer.reciprocal) && equivalent(response?.quotient, answer.quotient);
    }
    if (answer.kind === "range_and_fraction") {
      return responseChoiceId(question, response) === answer.rangeId && equivalent(response?.quotient, answer.quotient);
    }
    return false;
  }

  function matchingSignal(question, response) {
    const raw = question.canonicalQuestion;
    const choiceId = responseChoiceId(question, response);
    return (raw?.likelyErrorSignals || []).find((signal) => {
      if (signal.optionId) return signal.optionId === choiceId;
      if (signal.value && typeof signal.value === "object" && "numerator" in signal.value) {
        const candidate = response?.quotient || response;
        return equivalent(candidate, signal.value);
      }
      if (signal.kind === "numeric") return Number(response?.quotient ?? response) === Number(signal.value);
      if (signal.kind === "special") return choiceId === signal.value || String(response) === String(signal.value);
      return false;
    }) || null;
  }

  function classifyErrorFamily(question, response) {
    if (question.isRepairCheck && question.primaryErrorFamily) return question.primaryErrorFamily;
    const signal = matchingSignal(question, response);
    if (signal) return signal.errorFamily;
    const answer = question.canonicalQuestion?.answer;
    if (answer?.kind === "choice_and_fraction") {
      return responseChoiceId(question, response) === answer.optionId ? "ARITHMETIC_SLIP" : "AMBIGUOUS";
    }
    if (answer?.kind === "reciprocal_and_quotient") {
      if (!equivalent(response?.reciprocal, answer.reciprocal)) return "RECIPROCAL_FORM";
      if (!equivalent(response?.quotient, answer.quotient)) return "ARITHMETIC_SLIP";
    }
    if (answer?.kind === "range_and_fraction") {
      if (responseChoiceId(question, response) !== answer.rangeId) return "SMALLER_IMPOSSIBLE";
      return "ARITHMETIC_SLIP";
    }
    return "AMBIGUOUS";
  }

  function requiresRepeatedEvidence(question, response) {
    return matchingSignal(question, response)?.requiresRepeatBeforeClassification === true;
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
    const raw = question?.canonicalQuestion;
    if (!raw) return question?.canonicalRepair ? [] : ["FRA28 canonical question is missing"];
    if (question.policy?.engagementOnly && raw.id === "HOOK") return [];
    const issues = [];
    if (!raw.math) issues.push("math object is missing");
    if (!raw.visual) issues.push("visual object is missing");
    if (raw.math?.kind === "division_by_positive_fraction") {
      const expected = source.quotientOf(raw.math.dividend, raw.math.divisor);
      if (!source.equivalentFractions(expected, raw.math.quotient)) issues.push("stored quotient is inconsistent");
      if (raw.math.divisor.numerator <= 0 || raw.math.divisor.denominator <= 0) issues.push("divisor must be positive and non-zero");
    }
    return issues;
  }

  function inputMarkup(question, saved, locked) {
    const disabled = locked ? " disabled" : "";
    const value = saved && typeof saved === "object" ? saved : {};
    const fraction = (name, label, fractionValue) => `<fieldset class="fra28-inline-fraction"><legend>${escapeHtml(label)}</legend><div class="fraction-input"><input data-fra28-fraction="${name}" data-part="n" aria-label="${escapeHtml(label)} numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(fractionValue?.n ?? "")}"${disabled}><i aria-hidden="true"></i><input data-fra28-fraction="${name}" data-part="d" aria-label="${escapeHtml(label)} denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(fractionValue?.d ?? "")}"${disabled}></div></fieldset>`;
    const choices = (field, selected) => `<div class="choice-grid">${(question.response.options || []).map((option, index) => `<button class="choice-card${String(selected ?? "") === String(option) ? " is-selected" : ""}" type="button" data-fra28-choice-field="${field}" data-option-index="${index}" aria-pressed="${String(selected ?? "") === String(option)}"${disabled}>${escapeHtml(option)}</button>`).join("")}</div><input type="hidden" data-fra28-choice-value="${field}" value="${escapeHtml(selected ?? "")}">`;
    if (question.response.type === "fra28_choice_then_fraction") {
      return `<fieldset class="fra28-compound-answer"><legend>Choose the divisor reciprocal, then enter the exact quotient</legend>${choices("choice", value.choice)}${fraction("quotient", "Exact quotient", value.quotient)}</fieldset>`;
    }
    if (question.response.type === "fra28_reciprocal_and_fraction") {
      return `<fieldset class="fra28-compound-answer"><legend>Complete both missing fractions</legend><div class="fra28-paired-fractions">${fraction("reciprocal", "Divisor reciprocal", value.reciprocal)}${fraction("quotient", "Exact quotient", value.quotient)}</div></fieldset>`;
    }
    return `<fieldset class="fra28-compound-answer"><legend>Choose the sensible range, then calculate</legend>${choices("range", value.range)}${fraction("quotient", "Exact quotient", value.quotient)}</fieldset>`;
  }

  function readResponse(engine, question, allowPartial) {
    const readFraction = (name) => ({
      n: engine.root.querySelector(`[data-fra28-fraction="${name}"][data-part="n"]`)?.value.trim() || "",
      d: engine.root.querySelector(`[data-fra28-fraction="${name}"][data-part="d"]`)?.value.trim() || ""
    });
    const completeFraction = (value) => /^-?\d+$/.test(value.n) && /^-?\d+$/.test(value.d) && Number(value.d) !== 0;
    if (question.response.type === "fra28_choice_then_fraction") {
      const result = { choice: engine.root.querySelector('[data-fra28-choice-value="choice"]')?.value || "", quotient: readFraction("quotient") };
      return allowPartial || (Boolean(result.choice) && completeFraction(result.quotient)) ? result : null;
    }
    if (question.response.type === "fra28_reciprocal_and_fraction") {
      const result = { reciprocal: readFraction("reciprocal"), quotient: readFraction("quotient") };
      return allowPartial || (completeFraction(result.reciprocal) && completeFraction(result.quotient)) ? result : null;
    }
    const result = { range: engine.root.querySelector('[data-fra28-choice-value="range"]')?.value || "", quotient: readFraction("quotient") };
    return allowPartial || (Boolean(result.range) && completeFraction(result.quotient)) ? result : null;
  }

  function bindInputEvents(engine, question) {
    const update = () => {
      engine.state.drafts[question.id] = readResponse(engine, question, true) || {};
      engine.updateSubmitAvailability(question);
      engine.persist();
    };
    engine.root.querySelectorAll("[data-fra28-choice-field]").forEach((button) => {
      button.addEventListener("click", () => {
        const field = button.dataset.fra28ChoiceField;
        const options = question.response.options || [];
        const value = options[Number(button.dataset.optionIndex)] || "";
        engine.root.querySelectorAll(`[data-fra28-choice-field="${field}"]`).forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        const hidden = engine.root.querySelector(`[data-fra28-choice-value="${field}"]`);
        if (hidden) hidden.value = value;
        update();
      });
    });
    engine.root.querySelectorAll("[data-fra28-fraction]").forEach((input) => {
      input.addEventListener("input", update);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !engine.elements.primary.disabled) {
          event.preventDefault();
          engine.handlePrimary(engine.current());
        }
      });
    });
  }

  function sceneVisual(sceneId) {
    const visuals = {
      HOOK: { kind: "measurement_strip", totalEqualParts: 8, activeParts: 6, divisorUnitParts: 1, context: "light_strip", unit: "m", preSubmitShowsGroupCount: false },
      T1: { kind: "measurement_strip", totalEqualParts: 8, activeParts: 6, divisorUnitParts: 1, context: "light_strip", unit: "m" },
      T2: { kind: "measurement_strip", totalEqualParts: 12, activeParts: 10, divisorUnitParts: 5, context: "fraction_bar", unit: "" },
      T3: { kind: "symbolic_rewrite", dividend: { numerator: 2, denominator: 3 }, divisor: { numerator: 4, denominator: 5 }, reciprocal: { numerator: 5, denominator: 4 } },
      T4: { kind: "symbolic_rewrite", dividend: { numerator: 3, denominator: 1 }, divisor: { numerator: 2, denominator: 5 }, reciprocal: { numerator: 5, denominator: 2 }, quotient: { numerator: 15, denominator: 2 } },
      HANDOFF: { kind: "handoff", labels: approved.mentalModel }
    };
    return visuals[sceneId] || { kind: "symbolic_rewrite" };
  }

  function teachingStep(scene, nextId, hookQuestion) {
    const hook = scene.id === "HOOK";
    const utteranceIds = hook ? ["HOOK.1", "HOOK.2", "HOOK.3"] : [...scene.utteranceIds];
    const visual = sceneVisual(scene.id);
    const cues = syncCuesFor(hook ? [...utteranceIds, "HOOK.4", "HOOK.5"] : utteranceIds);
    return {
      id: scene.id,
      purpose: scene.purpose,
      scene: {
        display_title: scene.studentFacing.title || scene.studentFacing.stageLabelChange?.at(-1) || "Try it with me",
        initial_state: accessibleDescription({ visual, authorOnly: scene.authorOnly }),
        objects: [visual.kind],
        model: modelFor(scene, { sceneId: scene.id, mode: "teaching", visual })
      },
      narration: { script: textsFor(utteranceIds), utterance_ids: utteranceIds, sync_cues: cues },
      animation_timeline: cues,
      learner_interaction: hookQuestion ? { question_ref: hookQuestion.id } : { type: "continue", button: "Continue" },
      next_step: nextId,
      pause_after_narration: !hook
    };
  }

  function evaluateFinalEvidence(records) {
    const correct = records.filter((record) => record.correct === true && record.firstAttemptCorrect !== false && !record.hintUsed);
    const proceduralFamilies = new Set(["final_direct_integer", "final_below_one", "final_missing_reciprocal", "recovery_direct_integer", "recovery_below_one", "recovery_missing_reciprocal"]);
    const reasoningFamilies = new Set(["final_error_reasoning", "final_context", "recovery_method_choice", "recovery_context"]);
    const blockers = new Set(["FLIP_DIVIDEND", "FLIP_BOTH", "NO_RECIPROCAL", "SEPARATE_DIVIDE", "SMALLER_IMPOSSIBLE", "RECIPROCAL_FORM"]);
    const counts = {};
    records.forEach((record) => { if (blockers.has(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1; });
    const repeatedBlockingFamilies = Object.keys(counts).filter((family) => counts[family] >= 2);
    const hasProceduralEvidence = correct.some((record) => proceduralFamilies.has(record.family));
    const hasReasoningOrApplicationEvidence = correct.some((record) => reasoningFamilies.has(record.family));
    const route = source.decideFRA28FinalRoute({
      correctCount: correct.length,
      repeatedBlockingMisconception: repeatedBlockingFamilies.length > 0,
      hasProceduralEvidence,
      hasReasoningOrApplicationEvidence
    });
    return { correctCount: correct.length, hasProceduralEvidence, hasReasoningOrApplicationEvidence, repeatedBlockingFamilies, route, masterySatisfied: route === "finish" };
  }

  function selectRecoveryQuestionIds(failedIds, count) {
    return source.selectFRA28RecoveryItems((failedIds || []).map(unprefix), count).map(prefix);
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length) throw new Error("FRA28 canonical source was not loaded.");
    const canonicalIssues = source.validateFRA28CanonicalSpec?.() || [];
    const runtimeIssues = validateRuntimeContract();
    if (canonicalIssues.length || runtimeIssues.length) throw new Error(`FRA28 canonical contract failed: ${[...canonicalIssues, ...runtimeIssues].join("; ")}`);
    const questionBank = buildQuestions();
    questionBank.filter((question) => question.canonicalQuestion?.answer).forEach((question) => {
      const issues = validateQuestionModel(question);
      if (issues.length) throw new Error(`${question.id}: ${issues.join("; ")}`);
    });
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const teachingScenes = approved.scenes.filter((scene) => ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF"].includes(scene.id));
    const sceneNext = { HOOK: "T1", T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = teachingScenes.map((scene) => teachingStep(scene, sceneNext[scene.id], scene.id === "HOOK" ? question("HOOK") : null));

    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const transferNext = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
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
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Only canonical FRA28 checks and repairs are used.", between_question_transition: "" };

    const repairByFamily = {};
    const freshByFamily = {};
    approved.repairs.forEach((repair) => repair.errorFamilies.forEach((family) => {
      repairByFamily[family] = prefix(repair.id);
      freshByFamily[family] = [prefix(repair.freshCheckQuestionId)];
    }));
    spec.lesson.exit = {
      intro_script: textsFor(["FINAL.INTRO"]),
      use_question_before_submit_narration: true,
      primary_question_refs: approved.routing.final.primaryIds.map(prefix),
      confirmation_question_refs: [...approved.confirmations.map((item) => prefix(item.id)), ...approved.repairChecks.map((item) => prefix(item.id)), ...approved.recoveryBank.map((item) => prefix(item.id))],
      repair_by_primary: {},
      post_repair_retest_refs: approved.recoveryBank.map((item) => prefix(item.id)),
      mastery_policy: { profile: "fra28_five_item", secureMinimum: 4, totalItems: 5, requireProceduralEvidence: true, requireReasoningOrApplicationEvidence: true, blockRepeatedCentralMisconception: true }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra28_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1" },
      no_hint_confirmation_by_question: Object.fromEntries(Object.entries(approved.routing.hintConfirmations).map(([id, confirmation]) => [prefix(id), prefix(confirmation)])),
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: Object.assign({}, freshByFamily, { ARITHMETIC_SLIP: [prefix("C-INT")], AMBIGUOUS: [prefix("C-CTX")], unknown: [prefix("C-INT")] }),
      feedback_by_error_family: {}
    };
    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(["COMPLETE.1"]), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "Keep building division by a fraction", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
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
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra28_context", equal_sections: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra28_context", "integer_input", "fraction_input", "single_choice", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: CONTENT_VERSION,
      engine_profile: "fra28",
      exact_runtime_copy: true,
      runtime_applied: true,
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn", independent: "Now you take over", repair: "Quick repair", exit: "Final check", completion: "Complete" },
      route_contract: approved.routing,
      migration: { resetIncompatibleState: true, preserveSoundPreference: true, preserveDeveloperPreference: true, archivePreviousAttempt: true, resetTo: "HOOK" },
      capabilities: { divide_by_positive_fraction: true, exact_equivalence: true, structured_responses: true, optional_hints: true, hint_evidence: true, post_lock_working: true, targeted_repairs: true, fresh_confirmations: true, replacement_finals: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra28Canonical = {
    CONTENT_VERSION,
    apply,
    textFor,
    textsFor,
    validateRuntimeContract,
    validateQuestionModel,
    inputMarkup,
    readResponse,
    bindInputEvents,
    structuredTypes,
    isCorrect,
    classifyErrorFamily,
    requiresRepeatedEvidence,
    evaluateResponse,
    evaluateFinalEvidence,
    selectRecoveryQuestionIds,
    chooseGuidedRoute: source.chooseFRA28GuidedRoute,
    confirmationAfterHint: source.confirmationAfterHint
  };
})();
