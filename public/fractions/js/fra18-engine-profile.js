(function () {
  "use strict";

  const Engine = window.RevilyLessonEngine?.LessonEngine;
  const canonical = window.RevilyFra18Canonical;
  if (!Engine || !canonical) return;

  const prototype = Engine.prototype;
  const original = {
    loadState: prototype.loadState,
    inputMarkup: prototype.inputMarkup,
    readResponse: prototype.readResponse,
    submitAnswer: prototype.submitAnswer,
    adaptiveNextId: prototype.adaptiveNextId,
    finishRecovery: prototype.finishRecovery,
    advanceFresh: prototype.advanceFresh,
    showSavedExitResponse: prototype.showSavedExitResponse,
    finalCheckLead: prototype.finalCheckLead,
    restoreResolvedFeedback: prototype.restoreResolvedFeedback,
    requiresRepeatedEvidence: prototype.requiresRepeatedEvidence,
    classifyMisconception: prototype.classifyMisconception,
    isRegistryRuntimeLesson: prototype.isRegistryRuntimeLesson
  };

  const copy = (value) => value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
  const runtimeLines = (engine, ids) => (ids || []).map((id) => engine.spec.canonical_lesson?.runtime_copy?.[id]?.text).filter(Boolean);
  const renderWorked = (engine, current, feedback) => window.RevilyVisuals.render(
    engine.elements.canvas,
    current.visual,
    { spec: engine.spec, question: current.question, narration: current.narration, feedback: feedback || "worked" }
  );
  const seenQuestionIds = (engine) => [...new Set([
    ...Object.keys(engine.state.submissions || {}),
    ...Object.keys(engine.state.exit?.responses || {}),
    ...(engine.state.seenConfirmations || [])
  ])];

  prototype.isFra18V1 = function () {
    return this.spec.identity?.id === "FRA-18" && this.spec.canonical_lesson?.version === canonical.CONTENT_VERSION;
  };

  prototype.isRegistryRuntimeLesson = function () {
    return this.isFra18V1() || original.isRegistryRuntimeLesson.call(this);
  };

  prototype.loadState = function () {
    if (!this.isFra18V1()) return original.loadState.call(this);
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch { saved = null; }
    const state = original.loadState.call(this);
    if (!saved || saved.skillId !== "FRA-18" || saved.contentVersion === canonical.CONTENT_VERSION) return state;
    state.soundOn = saved.soundOn !== false;
    state.developerOpen = saved.developerOpen === true;
    state.contentMigration = {
      from: saved.contentVersion || "legacy-fra18-yaml",
      to: canonical.CONTENT_VERSION,
      resetTo: "HOOK",
      previousAttemptId: saved.attemptId || null,
      previousStatus: saved.status || null,
      preserved: ["soundOn", "developerOpen", "previous completion status in history"],
      cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
    };
    try {
      const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
      if (!history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration")) {
        history.push({
          attemptId: saved.attemptId || null,
          status: saved.status || "LEARNING",
          archivedAt: new Date().toISOString(),
          reason: "content_version_migration",
          fromContentVersion: saved.contentVersion || "legacy-fra18-yaml",
          toContentVersion: canonical.CONTENT_VERSION,
          completionResult: saved.exit?.result || null,
          submissions: saved.submissions || {}
        });
        localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
      }
    } catch {
      // A clean canonical attempt is still safe if history storage is unavailable.
    }
    return state;
  };

  prototype.inputMarkup = function (question, saved, locked) {
    if (!this.isFra18V1() || !["fra18_fields", "fra18_select_then_fields"].includes(question.response?.type)) return original.inputMarkup.call(this, question, saved, locked);
    const escape = window.RevilyVisuals.escapeHtml;
    const disabled = locked ? " disabled" : "";
    const value = saved && typeof saved === "object" ? saved : {};
    const labels = {
      convertedNumerator: "Converted numerator",
      sumNumerator: "Final numerator",
      finalDenominator: "Final denominator"
    };
    const math = question.model?.math;
    const operandChoice = question.response.type === "fra18_select_then_fields" && math?.left && math?.right
      ? `<fieldset class="fra18-operand-choice"><legend>Which fraction needs renaming?</legend>${[
          ["left", `${math.left.numerator}/${math.left.denominator}`],
          ["right", `${math.right.numerator}/${math.right.denominator}`]
        ].map(([id, label]) => `<label><input type="radio" name="fra18-operand" data-fra18-operand value="${id}"${value.selectedOperand === id ? " checked" : ""}${disabled}/><span>${escape(label)}</span></label>`).join("")}</fieldset>`
      : "";
    const fields = (question.response.editableFields || []).map((key) => {
      const target = key === "convertedNumerator" || key === "sumNumerator" ? math?.targetDenominator : null;
      const suffix = target ? `<span aria-hidden="true">/${escape(target)}</span>` : "";
      return `<label><span>${escape(labels[key] || key)}</span><div><input data-fra18-field="${escape(key)}" aria-label="${escape(labels[key] || key)}" inputmode="numeric" autocomplete="off" value="${escape(value[key] ?? "")}"${disabled}/>${suffix}</div></label>`;
    }).join("");
    return `<fieldset class="fra18-fields-answer"><legend>Complete the one conversion</legend>${operandChoice}<div class="fra18-field-grid">${fields}</div></fieldset>`;
  };

  prototype.readResponse = function (question, allowPartial) {
    if (!this.isFra18V1() || !["fra18_fields", "fra18_select_then_fields"].includes(question.response?.type)) return original.readResponse.call(this, question, allowPartial);
    const response = {};
    this.root.querySelectorAll("[data-fra18-field]").forEach((field) => {
      if (field.value.trim()) response[field.dataset.fra18Field] = field.value.trim();
    });
    const operand = this.root.querySelector("[data-fra18-operand]:checked");
    if (operand) response.selectedOperand = operand.value;
    const required = question.response.editableFields || [];
    const fieldsReady = required.every((key) => Object.prototype.hasOwnProperty.call(response, key));
    const operandReady = question.response.type !== "fra18_select_then_fields" || Boolean(response.selectedOperand);
    return allowPartial || (fieldsReady && operandReady) ? response : null;
  };

  prototype.classifyMisconception = function (question, response) {
    return this.isFra18V1() ? canonical.classifyErrorFamily(question, response) : original.classifyMisconception.call(this, question, response);
  };

  prototype.requiresRepeatedEvidence = function (question, response) {
    if (!this.isFra18V1()) return original.requiresRepeatedEvidence.call(this, question, response);
    const evaluation = canonical.evaluateResponse(question, response);
    return Boolean(evaluation.valid && evaluation.errorFamily && !canonical.isStructuralEvidence(question, evaluation) && !["ARITHMETIC", "UNKNOWN"].includes(evaluation.errorFamily));
  };

  prototype.submitAnswer = function (current) {
    if (!this.isFra18V1()) return original.submitAnswer.call(this, current);
    const question = current.question;
    const response = this.readResponse(question);
    if (response === null) {
      this.showFeedback("hint", "Complete every required answer field before checking.", "", "Check the response");
      this.refocusInput();
      return;
    }
    const evaluation = canonical.evaluateResponse(question, response);
    if (evaluation.valid === false) {
      this.showFeedback("hint", evaluation.visibleFeedback, "", "Check the response");
      this.refocusInput();
      return;
    }
    this.stopNarration(false);
    const questionId = current.questionId;
    const correct = evaluation.correct === true;
    this.state.attempts[questionId] = (this.state.attempts[questionId] || 0) + 1;
    const attempt = this.state.attempts[questionId];
    const firstAttempt = attempt === 1;
    const hintOpened = this.state.evidence.hintOpened[questionId] === true;

    if (firstAttempt && !question.policy?.engagementOnly) {
      this.state.evidence.firstAttemptCorrect[questionId] = correct;
      this.state.evidence.hintOpenedBeforeSubmit[questionId] = hintOpened;
      this.state.evidence.answerValueCorrect[questionId] = evaluation.valueCorrect === true;
      this.state.evidence.answerFormCorrect[questionId] = evaluation.formCorrect === true;
      if (["fra18_fields", "fra18_select_then_fields"].includes(question.response?.type)) {
        const expected = question.canonicalQuestion?.response?.correctFields || {};
        this.state.evidence.componentFirstAttemptCorrect[questionId] = Object.fromEntries(
          Object.keys(expected).map((key) => [key, /^-?\d+$/.test(String(response[key] ?? "")) && Number(response[key]) === Number(expected[key])])
        );
      }
    } else if (hintOpened) {
      this.state.evidence.hintOpenedBeforeSubmit[questionId] = true;
    }

    if (!correct && !question.policy?.engagementOnly) {
      const family = evaluation.errorFamily || "UNKNOWN";
      const paired = Object.entries(this.state.evidence.candidateErrorFamily || {}).some(([id, value]) => id !== questionId && value === family);
      this.state.evidence.candidateErrorFamily[questionId] = family;
      this.state.evidence.errorFamily[questionId] = this.requiresRepeatedEvidence(question, response) && firstAttempt && !paired ? "support_needed" : family;
      this.state.evidence.misconceptions[questionId] = this.state.evidence.errorFamily[questionId];
      this.emit("misconception_detected", { question_id: questionId, misconception: this.state.evidence.errorFamily[questionId], candidate_family: family, possible_families: evaluation.possibleErrorFamilies });
    }

    if (question.policy?.engagementOnly) {
      this.state.engagementResponses[questionId] = { response: copy(response), at: new Date().toISOString() };
    } else {
      this.state.submissions[questionId] = this.state.submissions[questionId] || [];
      this.state.submissions[questionId].push({ response: copy(response), correct, at: new Date().toISOString() });
    }
    this.state.drafts[questionId] = copy(response);
    this.emit("answer_submitted", {
      question_id: questionId,
      attempt_number: attempt,
      correct: question.policy?.engagementOnly ? null : correct,
      scored: question.policy?.scored !== false,
      hint_opened_before_submit: hintOpened,
      response_type: question.response.type,
      answer_value_correct: evaluation.valueCorrect,
      answer_form_correct: evaluation.formCorrect,
      error_family: evaluation.errorFamily
    });

    if (question.policy?.engagementOnly) return this.handleFra18Engagement(current, response);
    if (current.fresh) return this.handleFra18FreshSubmission(current, response, evaluation);
    if (current.exit || current.confirmation) return this.handleFra18ExitSubmission(current, response, evaluation);
    if (correct) return this.handleFra18Correct(current, evaluation);
    return this.handleFra18Incorrect(current, response, evaluation);
  };

  prototype.handleFra18Engagement = function (current, response) {
    this.state.resolved[current.questionId] = "engagement";
    this.state.feedback[current.questionId] = "worked";
    this.lockInputs();
    renderWorked(this, current, "worked");
    const visible = canonical.visibleFeedback(current.question, response, false, null, true);
    this.showFeedback("engagement", visible, "", "Your prediction");
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = false;
    this.persist();
  };

  prototype.queueFra18HintConfirmation = function (questionId) {
    const confirmationId = canonical.getRequiredHintConfirmation(questionId, []);
    if (!confirmationId || this.state.evidence.freshConfirmationPassed[confirmationId] || this.state.evidence.pendingNoHintConfirmations.includes(confirmationId)) return;
    this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
    this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "hint_assisted_success" });
  };

  prototype.handleFra18Correct = function (current, evaluation) {
    const questionId = current.questionId;
    this.state.resolved[questionId] = this.state.attempts[questionId] === 1 ? "correct" : "correct_after_support";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    if (["I1", "I2"].includes(current.question.canonicalQuestionId) && this.state.evidence.hintOpenedBeforeSubmit[questionId]) this.queueFra18HintConfirmation(questionId);
    this.lockInputs();
    renderWorked(this, current);
    this.showFeedback("correct", evaluation.visibleFeedback, current.question.scripts?.worked_explanation || "", "Answer locked");
    const lines = runtimeLines(this, evaluation.runtimeUtteranceIds);
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = lines.length > 0;
    this.persist();
    this.startNarration(lines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
  };

  prototype.handleFra18Incorrect = function (current, response, evaluation) {
    const question = current.question;
    const questionId = current.questionId;
    const attempt = this.state.attempts[questionId];
    const family = evaluation.errorFamily || "UNKNOWN";
    const paired = Object.entries(this.state.evidence.candidateErrorFamily || {}).some(([id, value]) => id !== questionId && value === family);
    const structural = canonical.isStructuralEvidence(question, evaluation);
    const repairId = canonical.repairByFamily[family] || null;
    const activateRepair = Boolean(repairId && (attempt >= 2 || paired || structural));
    const discriminatorId = !repairId && attempt >= 2 ? canonical.selectDiscriminator(evaluation.possibleErrorFamilies) : null;

    if (current.recovery && this.state.pendingRecovery?.fra18SupportedActive) {
      if (attempt === 1) {
        this.state.feedback[questionId] = "first_incorrect";
        this.showFeedback("hint", evaluation.visibleFeedback, "Use the repair model and try the supported step once more.", "Check this step");
        this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
        this.elements.primary.disabled = false;
        this.refocusInput();
      } else {
        this.state.feedback[questionId] = "worked";
        this.state.evidence.supportEscalated[questionId] = true;
        this.state.evidence.answerLocked[questionId] = true;
        this.state.workedRevealed[questionId] = true;
        this.state.resolved[questionId] = "supported_worked";
        this.lockInputs();
        renderWorked(this, current);
        this.showFeedback("support", evaluation.visibleFeedback, question.scripts?.worked_explanation || "", "Supported step complete");
        this.elements.primary.textContent = "Try a fresh check";
        this.elements.primary.disabled = false;
      }
      this.persist();
      return;
    }

    if (!activateRepair && !discriminatorId) {
      this.state.feedback[questionId] = "first_incorrect";
      this.showFeedback("hint", evaluation.visibleFeedback, question.policy?.hintPolicy === "optional" ? "You can retry now or open Ask for a hint." : "Use the denominator relationship and try again.", "Check this step");
      this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
      this.elements.primary.disabled = false;
      this.refocusInput();
      this.persist();
      return;
    }

    this.state.feedback[questionId] = "worked";
    this.state.evidence.supportEscalated[questionId] = true;
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    this.state.resolved[questionId] = activateRepair ? "worked_then_recovery" : "worked_then_discriminator";
    this.lockInputs();
    renderWorked(this, current);
    this.showFeedback("support", evaluation.visibleFeedback, question.scripts?.worked_explanation || "", "Answer locked");
    if (activateRepair) {
      const repairQuestion = this.model.getQuestion(repairId);
      const freshId = repairId === "FRA-18-R-DENOM"
        ? canonical.selectDenomRepairCheck(seenQuestionIds(this))
        : repairQuestion?.freshCheckId;
      this.state.pendingRecovery = {
        originId: current.id,
        originQuestionId: questionId,
        recoveryId: repairId,
        returnId: current.nextId,
        freshId,
        family,
        exitRemediation: false,
        fra18RepairFlow: true,
        fra18StartRepair: Boolean(current.recovery)
      };
      this.elements.primary.textContent = "Try the matching repair";
    } else {
      this.state.pendingRecovery = {
        originId: current.id,
        originQuestionId: questionId,
        recoveryId: discriminatorId,
        returnId: current.nextId,
        family: "UNKNOWN",
        exitRemediation: false,
        fra18Discriminator: true
      };
      this.elements.primary.textContent = "Check one fresh step";
    }
    this.elements.primary.disabled = false;
    this.persist();
  };

  prototype.handleFra18ExitSubmission = function (current, response, evaluation) {
    const questionId = current.questionId;
    const correct = evaluation.correct === true;
    this.state.exit.responses[questionId] = { response: copy(response), correct };
    this.state.resolved[questionId] = correct ? "fresh_correct" : "fresh_incorrect";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    this.lockInputs();
    this.showSavedExitResponse(current, correct, false);
    const lines = runtimeLines(this, evaluation.runtimeUtteranceIds);
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = lines.length > 0;
    if (this.model.exitIds.every((id) => this.state.exit.responses[id])) this.routeFra18FinalEvidence();
    this.persist();
    this.startNarration(lines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
  };

  prototype.showSavedExitResponse = function (current, correct, narrate) {
    if (!this.isFra18V1()) return original.showSavedExitResponse.call(this, current, correct, narrate);
    const response = this.state.exit.responses[current.questionId]?.response ?? this.lastResponse(current.questionId);
    const evaluation = canonical.evaluateResponse(current.question, response);
    renderWorked(this, current);
    this.showFeedback(correct ? "correct" : "support", evaluation.visibleFeedback, current.question.scripts?.worked_explanation || "", "Answer locked");
    if (this.elements?.primary) {
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
    }
  };

  prototype.finalCheckLead = function (current, correct) {
    if (!this.isFra18V1()) return original.finalCheckLead.call(this, current, correct);
    return canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct, null, true);
  };

  prototype.restoreResolvedFeedback = function (current) {
    if (!this.isFra18V1()) return original.restoreResolvedFeedback.call(this, current);
    const response = this.state.exit.responses[current.questionId]?.response ?? this.lastResponse(current.questionId) ?? this.state.engagementResponses[current.questionId]?.response;
    if (current.question.policy?.engagementOnly) {
      this.showFeedback("engagement", canonical.visibleFeedback(current.question, response, false, null, true), "", "Your prediction");
      return;
    }
    const evaluation = canonical.evaluateResponse(current.question, response);
    const worked = this.state.workedRevealed[current.questionId] === true;
    if (worked) renderWorked(this, current);
    this.showFeedback(evaluation.correct ? "correct" : "support", evaluation.visibleFeedback, worked ? (current.question.scripts?.worked_explanation || "") : "", worked ? "Answer locked" : "Your result");
  };

  prototype.adaptiveNextId = function (current) {
    if (!this.isFra18V1()) return original.adaptiveNextId.call(this, current);
    if (current.phase === "exit") return current.nextId;
    if (current.id === "G2") {
      const record = (id) => ({
        firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[id] === true,
        hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[id] === true,
        supportEscalated: this.state.evidence.supportEscalated[id] === true,
        errorFamilies: [this.state.evidence.candidateErrorFamily[id], this.state.evidence.errorFamily[id]].filter((family) => family && family !== "support_needed")
      });
      const strong = canonical.shouldSkipF1({ g1: record("FRA-18-G1"), g2: record("FRA-18-G2") });
      if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were clean first-attempt successes without hint or support" });
      return strong ? "F2" : "F1";
    }
    if (current.id === "I2") {
      const cleanIndependent = ["FRA-18-I1", "FRA-18-I2"].some((id) => this.state.evidence.firstAttemptCorrect[id] === true && this.state.evidence.hintOpenedBeforeSubmit[id] !== true && this.state.evidence.supportEscalated[id] !== true);
      if (!cleanIndependent) {
        ["FRA-18-F1", "FRA-18-F2"].forEach((id) => {
          if (this.state.evidence.hintOpenedBeforeSubmit[id] !== true) return;
          const confirmationId = canonical.getRequiredHintConfirmation(id, []);
          if (confirmationId && !this.state.evidence.freshConfirmationPassed[confirmationId] && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId)) this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
        });
      }
      const pending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
      if (pending) {
        this.state.freshContext = { questionId: pending, family: "ONE_CONVERSION", returnId: "FINAL-INTRO", exitRemediation: false, fra18HintFresh: true, correct: null };
        return `FRESH:${pending}`;
      }
    }
    return current.nextId;
  };

  prototype.routeFra18FinalEvidence = function () {
    const records = this.model.exitIds.map((questionId) => ({
      questionId,
      correctFirstAttempt: this.state.exit.responses[questionId]?.correct === true && this.state.attempts[questionId] === 1,
      supported: false,
      errorFamilies: this.state.exit.responses[questionId]?.correct ? [] : [this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || "UNKNOWN"]
    }));
    const sessionFamilyCounts = {};
    Object.values(this.state.evidence.candidateErrorFamily || {}).forEach((family) => {
      if (family && !["ARITHMETIC", "UNKNOWN"].includes(family)) sessionFamilyCounts[family] = (sessionFamilyCounts[family] || 0) + 1;
    });
    Object.entries(sessionFamilyCounts).filter(([, count]) => count >= 2).forEach(([family]) => {
      records[0].errorFamilies.push(family, family);
    });
    const route = canonical.routeFinal(records);
    this.state.exit.primaryScore = route.evaluation.score;
    this.state.exit.missedPrimaryIds = records.filter((record) => !record.correctFirstAttempt).map((record) => record.questionId);
    if (route.kind === "finish") {
      this.state.exit.result = "SECURE";
      this.state.exit.remediation = { profile: "fra18", route: "primary_mastery", primaryEvaluation: route.evaluation };
      this.emit("fra18_final_route_selected", { route: "primary_mastery", evaluation: route.evaluation });
      return;
    }
    this.state.exit.remediation = {
      profile: "fra18",
      route: route.kind,
      primaryEvaluation: route.evaluation,
      repairIds: [...route.repairIds],
      repairIndex: 0,
      recoveryIds: [...route.recoveryIds],
      recoveryIndex: 0,
      successes: 0,
      requiredSuccesses: route.requiredCorrect,
      recoveryResults: []
    };
    if (!route.repairIds.length) {
      this.state.exit.result = "NEEDS_WORK";
      this.emit("fra18_final_route_selected", { route: route.kind, evaluation: route.evaluation, reason: "no stable repair family was evidenced" });
      return;
    }
    this.beginFra18FinalRepair();
    this.emit("fra18_final_route_selected", { route: route.kind, evaluation: route.evaluation, repair_ids: route.repairIds, recovery_question_ids: route.recoveryIds });
  };

  prototype.beginFra18FinalRepair = function () {
    const remediation = this.state.exit.remediation;
    const repairId = remediation?.repairIds?.[remediation.repairIndex];
    if (!repairId) return this.beginFra18RecoveryItem();
    const repairQuestion = this.model.getQuestion(repairId);
    const freshId = repairId === "FRA-18-R-DENOM" ? canonical.selectDenomRepairCheck(seenQuestionIds(this)) : repairQuestion?.freshCheckId;
    if (!freshId) {
      this.state.exit.result = "NEEDS_WORK";
      return;
    }
    this.state.pendingRecovery = {
      originId: this.state.cursor,
      originQuestionId: this.state.exit.missedPrimaryIds?.[0] || null,
      recoveryId: repairId,
      family: repairQuestion?.primaryErrorFamily || "UNKNOWN",
      freshId,
      returnId: null,
      exitRemediation: true,
      fra18RepairFlow: true,
      fra18FinalRecovery: true
    };
  };

  prototype.finishRecovery = function () {
    if (!this.isFra18V1()) return original.finishRecovery.call(this);
    const pending = this.state.pendingRecovery;
    if (!pending) return;
    if (pending.fra18StartRepair) {
      this.state.pendingRecovery = { ...pending, fra18StartRepair: false };
      this.state.cursor = `RECOVERY:${pending.recoveryId}`;
      this.persist();
      return this.render();
    }
    const currentQuestion = this.model.getQuestion(pending.recoveryId);
    if (pending.fra18Discriminator && currentQuestion?.canonicalQuestion?.stage === "discriminator") {
      this.state.pendingRecovery = null;
      this.state.cursor = pending.returnId || "FINAL-INTRO";
      this.persist();
      return this.render();
    }
    if (currentQuestion?.supportedInteractionId && !pending.fra18SupportedActive) {
      this.state.pendingRecovery = { ...pending, repairId: currentQuestion.id, recoveryId: currentQuestion.supportedInteractionId, fra18SupportedActive: true };
      this.state.cursor = `RECOVERY:${currentQuestion.supportedInteractionId}`;
      this.emit("fra18_supported_repair_started", { repair_id: currentQuestion.id, supported_question_id: currentQuestion.supportedInteractionId, family: pending.family });
      this.persist();
      return this.render();
    }
    if (pending.fra18SupportedActive) {
      this.state.freshContext = {
        questionId: pending.freshId,
        family: pending.family,
        returnId: pending.returnId,
        exitRemediation: Boolean(pending.exitRemediation),
        fra18RepairFresh: true,
        fra18FinalRecovery: Boolean(pending.fra18FinalRecovery),
        repairId: pending.repairId,
        correct: null
      };
      this.state.pendingRecovery = null;
      this.state.cursor = `FRESH:${pending.freshId}`;
      this.persist();
      return this.render();
    }
    this.state.pendingRecovery = null;
    this.state.cursor = pending.returnId || "FINAL-INTRO";
    this.persist();
    this.render();
  };

  prototype.handleFra18FreshSubmission = function (current, response, evaluation) {
    const correct = evaluation.correct === true;
    const questionId = current.questionId;
    this.state.resolved[questionId] = correct ? "fresh_correct" : "fresh_incorrect";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    if (!this.state.seenConfirmations.includes(questionId)) this.state.seenConfirmations.push(questionId);
    if (this.state.freshContext) this.state.freshContext.correct = correct;
    if (this.state.freshContext?.fra18FinalRecoveryItem) this.state.exit.responses[questionId] = { response: copy(response), correct };
    this.lockInputs();
    renderWorked(this, current);
    this.showFeedback(correct ? "correct" : "support", evaluation.visibleFeedback, current.question.scripts?.worked_explanation || "", "Answer locked");
    const lines = runtimeLines(this, evaluation.runtimeUtteranceIds);
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = lines.length > 0;
    this.emit("fresh_confirmation_submitted", { question_id: questionId, correct, error_family: evaluation.errorFamily });
    this.persist();
    this.startNarration(lines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
  };

  prototype.beginFra18RecoveryItem = function () {
    const remediation = this.state.exit.remediation;
    const questionId = remediation?.recoveryIds?.[remediation.recoveryIndex];
    if (!questionId) {
      this.state.exit.result = "NEEDS_WORK";
      this.state.freshContext = null;
      this.persist();
      return this.finishExit();
    }
    this.state.freshContext = {
      questionId,
      family: this.model.getQuestion(questionId)?.evidenceFamily || "UNKNOWN",
      returnId: null,
      exitRemediation: true,
      fra18FinalRecoveryItem: true,
      correct: null
    };
    this.state.cursor = `FRESH:${questionId}`;
    this.persist();
    this.render();
  };

  prototype.advanceFresh = function (current) {
    if (!this.isFra18V1()) return original.advanceFresh.call(this, current);
    const context = this.state.freshContext || {};
    const correct = context.correct === true;
    const questionId = current.questionId;
    if (context.fra18RepairFresh) {
      if (correct) this.state.evidence.freshConfirmationPassed[questionId] = true;
      if (context.fra18FinalRecovery) {
        const remediation = this.state.exit.remediation;
        this.state.freshContext = null;
        if (!correct) {
          this.state.exit.result = "NEEDS_WORK";
          this.persist();
          return this.finishExit();
        }
        remediation.repairIndex += 1;
        if (remediation.repairIndex < remediation.repairIds.length) {
          this.beginFra18FinalRepair();
          this.state.cursor = `RECOVERY:${this.state.pendingRecovery.recoveryId}`;
          this.persist();
          return this.render();
        }
        return this.beginFra18RecoveryItem();
      }
      if (correct) {
        this.state.freshContext = null;
        this.state.cursor = context.returnId || "FINAL-INTRO";
        this.persist();
        return this.render();
      }
      const evaluation = canonical.evaluateResponse(current.question, this.lastResponse(questionId));
      const repairId = canonical.repairByFamily[evaluation.errorFamily] || canonical.repairByFamily[context.family];
      if (repairId) {
        const repairQuestion = this.model.getQuestion(repairId);
        const freshId = repairId === "FRA-18-R-DENOM" ? canonical.selectDenomRepairCheck(seenQuestionIds(this)) : repairQuestion?.freshCheckId;
        if (freshId) {
          this.state.freshContext = null;
          this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId: repairId, family: evaluation.errorFamily || context.family, freshId, returnId: context.returnId, exitRemediation: false, fra18RepairFlow: true, fra18StartRepair: false };
          this.state.cursor = `RECOVERY:${repairId}`;
          this.persist();
          return this.render();
        }
      }
      this.state.freshContext = null;
      this.state.cursor = context.returnId || "FINAL-INTRO";
      this.persist();
      return this.render();
    }
    if (context.fra18HintFresh) {
      if (correct) {
        this.state.evidence.freshConfirmationPassed[questionId] = true;
        this.state.evidence.pendingNoHintConfirmations = this.state.evidence.pendingNoHintConfirmations.filter((id) => id !== questionId);
        const next = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
        if (next) {
          this.state.freshContext = { questionId: next, family: "ONE_CONVERSION", returnId: "FINAL-INTRO", exitRemediation: false, fra18HintFresh: true, correct: null };
          this.state.cursor = `FRESH:${next}`;
        } else {
          this.state.freshContext = null;
          this.state.cursor = context.returnId || "FINAL-INTRO";
        }
        this.persist();
        return this.render();
      }
      const evaluation = canonical.evaluateResponse(current.question, this.lastResponse(questionId));
      const repairId = canonical.repairByFamily[evaluation.errorFamily];
      if (repairId) {
        const repairQuestion = this.model.getQuestion(repairId);
        const freshId = repairId === "FRA-18-R-DENOM" ? canonical.selectDenomRepairCheck(seenQuestionIds(this)) : repairQuestion?.freshCheckId;
        if (freshId) {
          this.state.freshContext = null;
          this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId: repairId, family: evaluation.errorFamily, freshId, returnId: context.returnId || "FINAL-INTRO", exitRemediation: false, fra18RepairFlow: true, fra18StartRepair: false };
          this.state.cursor = `RECOVERY:${repairId}`;
          this.persist();
          return this.render();
        }
      }
      this.state.freshContext = null;
      this.state.cursor = context.returnId || "FINAL-INTRO";
      this.persist();
      return this.render();
    }
    if (context.fra18FinalRecoveryItem) {
      const remediation = this.state.exit.remediation;
      const evaluation = canonical.evaluateResponse(current.question, this.lastResponse(questionId));
      remediation.recoveryResults.push({ questionId, correct, errorFamily: evaluation.errorFamily || null });
      if (correct) remediation.successes += 1;
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) return this.beginFra18RecoveryItem();
      const familyCounts = {};
      remediation.recoveryResults.filter((record) => !record.correct && record.errorFamily).forEach((record) => { familyCounts[record.errorFamily] = (familyCounts[record.errorFamily] || 0) + 1; });
      const repeatedBlocker = Object.entries(familyCounts).some(([family, count]) => !["ARITHMETIC", "UNKNOWN"].includes(family) && count >= 2);
      let passed = remediation.successes >= remediation.requiredSuccesses && !repeatedBlocker;
      if (remediation.route === "repair_then_mini_check") passed = passed && remediation.successes === 2;
      if (remediation.route === "repair_then_alternate_final") {
        const correctIds = remediation.recoveryResults.filter((record) => record.correct).map((record) => String(record.questionId).replace("FRA-18-", ""));
        const procedural = correctIds.some((id) => ["AF1", "AF2", "AF3"].includes(id));
        const reasoningApplication = correctIds.some((id) => ["AF4", "AF5"].includes(id));
        passed = passed && procedural && reasoningApplication;
      }
      this.state.exit.result = passed ? "SECURE" : "NEEDS_WORK";
      this.emit("fra18_recovery_completed", { result: this.state.exit.result, successes: remediation.successes, required_successes: remediation.requiredSuccesses, recovery_results: remediation.recoveryResults, repeated_blocker: repeatedBlocker });
      this.persist();
      return this.finishExit();
    }
    return original.advanceFresh.call(this, current);
  };
})();
