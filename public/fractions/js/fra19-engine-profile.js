(function () {
  "use strict";

  const Engine = window.RevilyLessonEngine?.LessonEngine;
  const canonical = window.RevilyFra19Canonical;
  if (!Engine || !canonical) return;

  const prototype = Engine.prototype;
  if (typeof prototype.isFra28V1 !== "function") {
    prototype.isFra28V1 = function () {
      return this.spec.identity?.id === "FRA-28" && this.spec.canonical_lesson?.version === "FRA28-HANDOFF-V1";
    };
  }
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

  const serialise = (value) => value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
  const runtimeLines = (engine, ids) => (ids || []).map((id) => engine.spec.canonical_lesson?.runtime_copy?.[id]?.text).filter(Boolean);
  const renderWorked = (engine, current, feedback) => window.RevilyVisuals.render(
    engine.elements.canvas,
    current.visual,
    { spec: engine.spec, question: current.question, narration: current.narration, feedback: feedback || "worked" }
  );
  const repairForFamily = (family) => canonical.repairByFamily[family] || null;
  const familyRepairFallback = {
    STAGED: "FRA-19-R-DIRECT", DIRECT: "FRA-19-R-DIRECT", ERROR: "FRA-19-R-DIRECT", CONTEXT: "FRA-19-R-DIRECT",
    METHOD: "FRA-19-R-SCALE", EQUIVALENCE: "FRA-19-R-SCALE", COMMON: "FRA-19-R-COMMON",
    FORM: "FRA-19-R-KEEP", SAME_DENOMINATOR_REPAIR: "FRA-19-R-KEEP"
  };

  prototype.isFra19V1 = function () {
    return this.spec.identity?.id === "FRA-19" && this.spec.canonical_lesson?.version === canonical.CONTENT_VERSION;
  };

  prototype.isRegistryRuntimeLesson = function () {
    return this.isFra19V1() || original.isRegistryRuntimeLesson.call(this);
  };

  prototype.loadState = function () {
    if (!this.isFra19V1()) return original.loadState.call(this);
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch { saved = null; }
    const state = original.loadState.call(this);
    if (!saved || saved.skillId !== "FRA-19" || saved.contentVersion === canonical.CONTENT_VERSION) return state;
    state.soundOn = saved.soundOn !== false;
    state.developerOpen = saved.developerOpen === true;
    state.contentMigration = {
      from: saved.contentVersion || "legacy-fra19-yaml",
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
          fromContentVersion: saved.contentVersion || "legacy-fra19-yaml",
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
    if (!this.isFra19V1() || question.response?.type !== "fra19_staged_fields") return original.inputMarkup.call(this, question, saved, locked);
    const disabled = locked ? " disabled" : "";
    const value = saved && typeof saved === "object" ? saved : {};
    const escape = window.RevilyVisuals.escapeHtml;
    const fields = [
      ["commonDenominator", "1. Common denominator", "Common denominator"],
      ["leftEquivalentNumerator", "2. First equivalent numerator", "Equivalent numerator for the first fraction"],
      ["rightEquivalentNumerator", "3. Second equivalent numerator", "Equivalent numerator for the second fraction"],
      ["resultNumerator", "4. Result numerator", "Numerator after adding the matching parts"]
    ];
    const editable = new Set(question.response.editableFields || fields.map(([key]) => key));
    const fixed = question.response.fixedFields || {};
    return `<fieldset class="fra19-staged-answer"><legend>Build the exact addition in order</legend><div class="fra19-staged-fields">${fields.map(([key, label, aria]) => editable.has(key)
      ? `<label><span>${label}</span><input data-fra19-field="${key}" aria-label="${aria}" inputmode="numeric" autocomplete="off" value="${escape(value[key] ?? "")}"${disabled} /></label>`
      : `<div class="fra19-fixed-stage"><span>${label}</span><b aria-label="${aria}, fixed at ${escape(fixed[key])}">${escape(fixed[key])}</b></div>`).join("")}</div></fieldset>`;
  };

  prototype.readResponse = function (question, allowPartial) {
    if (!this.isFra19V1() || question.response?.type !== "fra19_staged_fields") return original.readResponse.call(this, question, allowPartial);
    const result = {};
    const fields = [...this.root.querySelectorAll("[data-fra19-field]")];
    fields.forEach((field) => { if (field.value.trim()) result[field.dataset.fra19Field] = field.value.trim(); });
    Object.entries(question.response.fixedFields || {}).forEach(([key, value]) => {
      if (["commonDenominator", "leftEquivalentNumerator", "rightEquivalentNumerator", "resultNumerator"].includes(key)) result[key] = String(value);
    });
    const editable = question.response.editableFields || ["commonDenominator", "leftEquivalentNumerator", "rightEquivalentNumerator", "resultNumerator"];
    return allowPartial || editable.every((key) => Object.prototype.hasOwnProperty.call(result, key)) ? result : null;
  };

  prototype.classifyMisconception = function (question, response) {
    return this.isFra19V1() ? canonical.classifyErrorFamily(question, response) : original.classifyMisconception.call(this, question, response);
  };

  prototype.requiresRepeatedEvidence = function (question, response) {
    return this.isFra19V1() ? canonical.requiresRepeatedEvidence(question, response) : original.requiresRepeatedEvidence.call(this, question, response);
  };

  prototype.submitAnswer = function (current) {
    if (!this.isFra19V1()) return original.submitAnswer.call(this, current);
    const question = current.question;
    const response = this.readResponse(question);
    if (response === null) return;
    this.stopNarration(false);
    const questionId = current.questionId;
    const evaluation = canonical.evaluateResponse(question, response);
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
      this.state.evidence.answerLocked[questionId] = question.policy?.answerLocksOnSubmit === true && correct;
      if (question.response?.type === "fra19_staged_fields") {
        const expected = question.canonicalQuestion?.answer || {};
        this.state.evidence.componentFirstAttemptCorrect[questionId] = Object.fromEntries(
          ["commonDenominator", "leftEquivalentNumerator", "rightEquivalentNumerator", "resultNumerator"].map((key) => [key, /^-?\d+$/.test(String(response[key] ?? "")) && Number(response[key]) === Number(expected[key])])
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
      this.emit("misconception_detected", { question_id: questionId, misconception: this.state.evidence.errorFamily[questionId], candidate_family: family });
    }

    if (question.policy?.engagementOnly) {
      this.state.engagementResponses[questionId] = { response: serialise(response), at: new Date().toISOString() };
    } else {
      this.state.submissions[questionId] = this.state.submissions[questionId] || [];
      this.state.submissions[questionId].push({ response: serialise(response), correct, at: new Date().toISOString() });
    }
    this.state.drafts[questionId] = serialise(response);
    this.emit("answer_submitted", {
      question_id: questionId, attempt_number: attempt, correct: question.policy?.engagementOnly ? null : correct,
      scored: question.policy?.scored !== false, hint_opened_before_submit: hintOpened, response_type: question.response.type,
      answer_value_correct: evaluation.valueCorrect, answer_form_correct: evaluation.formCorrect, error_family: evaluation.errorFamily
    });

    if (question.policy?.engagementOnly) return this.handleFra19Engagement(current, response, correct);
    if (current.fresh) return this.handleFra19FreshSubmission(current, response, evaluation);
    if (current.exit || current.confirmation) return this.handleFra19ExitSubmission(current, response, evaluation);
    if (correct) return this.handleFra19Correct(current, response, evaluation);
    return this.handleFra19Incorrect(current, response, evaluation);
  };

  prototype.handleFra19Engagement = function (current, response, correct) {
    this.state.resolved[current.questionId] = "engagement";
    this.state.feedback[current.questionId] = "worked";
    this.lockInputs();
    renderWorked(this, current, "worked");
    const visible = current.question.scripts?.engagement_visible_by_value?.[String(response)] || "The rails are equal in length, but the selected pieces are different widths.";
    this.showFeedback(correct ? "correct" : "engagement", visible, "", "Your prediction");
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = false;
    this.persist();
  };

  prototype.queueFra19NoHintConfirmation = function (questionId) {
    const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
    if (!confirmationId || this.state.evidence.freshConfirmationPassed[confirmationId] || this.state.evidence.pendingNoHintConfirmations.includes(confirmationId)) return;
    this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
    this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "hint_assisted_success" });
  };

  prototype.handleFra19Correct = function (current, response, evaluation) {
    const questionId = current.questionId;
    this.state.resolved[questionId] = this.state.attempts[questionId] === 1 ? "correct" : "correct_after_support";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    if (current.question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) this.queueFra19NoHintConfirmation(questionId);
    this.lockInputs();
    renderWorked(this, current);
    this.showFeedback("correct", evaluation.visibleFeedback, current.question.scripts?.worked_explanation || "", "Answer locked");
    this.elements.primary.textContent = "Continue";
    const lines = runtimeLines(this, evaluation.runtimeUtteranceIds);
    this.elements.primary.disabled = lines.length > 0;
    this.persist();
    this.startNarration(lines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
  };

  prototype.handleFra19Incorrect = function (current, response, evaluation) {
    const question = current.question;
    const questionId = current.questionId;
    const attempt = this.state.attempts[questionId];
    const family = evaluation.errorFamily || "UNKNOWN";
    const paired = Object.entries(this.state.evidence.candidateErrorFamily || {}).some(([id, value]) => id !== questionId && value === family);
    const selectedOption = question.canonicalQuestion?.options?.find((option) => option.label === response || option.id === question.response?.optionIds?.[String(response)]);
    const stableExplicitRule = Boolean(selectedOption?.authorOnlyErrorSignal);
    const matchingRepair = repairForFamily(family);
    const activateRepair = Boolean(matchingRepair && (attempt >= 2 || paired || stableExplicitRule));
    const lines = family === "ARITHMETIC" ? runtimeLines(this, ["R-ARITHMETIC.1"]) : runtimeLines(this, evaluation.runtimeUtteranceIds);

    if (!activateRepair && attempt === 1) {
      this.state.feedback[questionId] = "first_incorrect";
      this.showFeedback("hint", evaluation.visibleFeedback, question.policy?.hintPolicy === "optional" ? "You can retry now or open Ask for a hint." : "Check the exact part size and try again.", "Check this step");
      this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
      this.elements.primary.disabled = false;
      this.refocusInput();
      this.persist();
      this.startNarration(lines, null);
      return;
    }

    this.state.feedback[questionId] = "worked";
    this.state.evidence.supportEscalated[questionId] = true;
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    this.state.resolved[questionId] = matchingRepair ? "worked_then_recovery" : "worked";
    this.lockInputs();
    renderWorked(this, current);
    this.showFeedback("support", evaluation.visibleFeedback, question.scripts?.worked_explanation || "", "Answer locked");
    if (matchingRepair) {
      const freshId = canonical.freshByFamily[family]?.[0] || null;
      this.state.pendingRecovery = {
        originId: current.id, originQuestionId: questionId, recoveryId: matchingRepair,
        nextId: freshId ? `FRESH:${freshId}` : current.nextId, returnId: current.nextId,
        freshId, family, exitRemediation: false, fra19RepairFlow: true
      };
      this.elements.primary.textContent = "Try a quick repair";
    } else {
      this.elements.primary.textContent = "Continue";
    }
    this.elements.primary.disabled = lines.length > 0;
    this.persist();
    this.startNarration(lines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
  };

  prototype.handleFra19ExitSubmission = function (current, response, evaluation) {
    const questionId = current.questionId;
    const correct = evaluation.correct === true;
    this.state.exit.responses[questionId] = { response: serialise(response), correct };
    this.state.resolved[questionId] = correct ? "fresh_correct" : "fresh_incorrect";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    this.lockInputs();
    this.showSavedExitResponse(current, correct, false);
    const lines = runtimeLines(this, evaluation.runtimeUtteranceIds);
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = lines.length > 0;
    if (this.model.exitIds.every((id) => this.state.exit.responses[id])) {
      const score = this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct).length;
      const missed = this.model.exitIds.filter((id) => !this.state.exit.responses[id]?.correct);
      this.state.exit.primaryScore = score;
      this.state.exit.missedPrimaryIds = missed;
      this.routeFra19FinalEvidence(score, missed);
    }
    this.persist();
    this.startNarration(lines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
  };

  prototype.showSavedExitResponse = function (current, correct, narrate) {
    if (!this.isFra19V1()) return original.showSavedExitResponse.call(this, current, correct, narrate);
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
    if (!this.isFra19V1()) return original.finalCheckLead.call(this, current, correct);
    return canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
  };

  prototype.restoreResolvedFeedback = function (current) {
    if (!this.isFra19V1()) return original.restoreResolvedFeedback.call(this, current);
    const response = this.state.exit.responses[current.questionId]?.response ?? this.lastResponse(current.questionId) ?? this.state.engagementResponses[current.questionId]?.response;
    if (current.question.policy?.engagementOnly) {
      const visible = current.question.scripts?.engagement_visible_by_value?.[String(response)] || "The selected pieces are not matching widths yet.";
      this.showFeedback("engagement", visible, "", "Your prediction");
      return;
    }
    const evaluation = canonical.evaluateResponse(current.question, response);
    const worked = this.state.workedRevealed[current.questionId] === true;
    if (worked) renderWorked(this, current);
    this.showFeedback(evaluation.correct ? "correct" : "support", evaluation.visibleFeedback, worked ? (current.question.scripts?.worked_explanation || "") : "", worked ? "Answer locked" : "Your result");
  };

  prototype.adaptiveNextId = function (current) {
    if (!this.isFra19V1()) return original.adaptiveNextId.call(this, current);
    if (current.phase === "exit") return current.nextId;
    if (current.id === "G2") {
      const evidenceFor = (id) => {
        const components = this.state.evidence.componentFirstAttemptCorrect[id] || {};
        return {
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[id] === true,
          allComponentsCorrect: Object.keys(components).length === 4 && Object.values(components).every(Boolean),
          hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[id] === true,
          supportEscalated: this.state.evidence.supportEscalated[id] === true
        };
      };
      const g1 = "FRA-19-G1";
      const g2 = "FRA-19-G2";
      const centralErrorSignals = [g1, g2].flatMap((id) => [this.state.evidence.candidateErrorFamily[id], this.state.evidence.errorFamily[id]]).filter(Boolean);
      const strong = canonical.shouldSkipF1({ g1: evidenceFor(g1), g2: evidenceFor(g2), centralErrorSignals });
      if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "all guided components were first-attempt correct without a hint, support, or central error" });
      return strong ? "F2" : "F1";
    }
    if (current.id === "I2") {
      const pending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
      if (pending) {
        const question = this.model.getQuestion(pending);
        this.state.freshContext = { questionId: pending, family: question?.evidenceFamily || question?.primaryErrorFamily || "UNKNOWN", returnId: "FINAL-INTRO", exitRemediation: false, fra19HintFresh: true, correct: null };
        return `FRESH:${pending}`;
      }
    }
    return current.nextId;
  };

  prototype.routeFra19FinalEvidence = function (score, missed) {
    const records = this.model.exitIds.map((questionId) => ({
      questionId,
      correct: this.state.exit.responses[questionId]?.correct === true,
      errorFamily: this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || "UNKNOWN"
    }));
    const evaluation = canonical.evaluateFinalEvidence(records);
    if (evaluation.masterySatisfied) {
      this.state.exit.result = "SECURE";
      this.state.exit.remediation = { profile: "fra19", route: "primary_mastery", primaryEvaluation: evaluation };
      this.emit("fra19_final_route_selected", { route: "primary_mastery", score, evaluation });
      return;
    }
    const profileId = score >= 3 ? "FINAL_3_OF_5" : "FINAL_0_TO_2_OF_5";
    const missedFamilies = (missed || []).map((id) => this.model.getQuestion(id)?.evidenceFamily || "ERROR");
    const activeFamilies = records.filter((record) => !record.correct).map((record) => record.errorFamily);
    const seen = [...Object.keys(this.state.submissions || {}), ...Object.keys(this.state.exit.responses || {})];
    const recoveryIds = canonical.selectRecoveryQuestionIds(profileId, missedFamilies, activeFamilies, seen);
    const repairFamily = activeFamilies.find((family) => repairForFamily(family)) || null;
    const repairId = repairForFamily(repairFamily) || missedFamilies.map((family) => familyRepairFallback[family]).find(Boolean) || "FRA-19-R-DIRECT";
    this.state.exit.remediation = {
      profile: "fra19", route: profileId, primaryEvaluation: evaluation, recoveryIds,
      recoveryIndex: 0, successes: 0, requiredSuccesses: profileId === "FINAL_3_OF_5" ? 2 : 3,
      repairId, repairFamily: repairFamily || missedFamilies[0] || "DIRECT", recoveryResults: []
    };
    if (!recoveryIds.length) {
      this.state.exit.result = "NEEDS_WORK";
      return;
    }
    this.state.pendingRecovery = {
      originId: this.state.cursor, originQuestionId: missed?.[0] || null, recoveryId: repairId,
      family: repairFamily || "UNKNOWN", freshId: this.model.getQuestion(repairId)?.freshCheckId || null,
      returnId: null, exitRemediation: true, fra19RepairFlow: true, fra19FinalRecovery: true
    };
    this.emit("fra19_final_route_selected", { route: profileId, score, repair_id: repairId, recovery_question_ids: recoveryIds, evaluation });
  };

  prototype.finishRecovery = function () {
    if (!this.isFra19V1()) return original.finishRecovery.call(this);
    const pending = this.state.pendingRecovery;
    if (!pending) return;
    const currentQuestion = this.model.getQuestion(pending.recoveryId);
    if (currentQuestion?.supportedInteractionId) {
      this.state.pendingRecovery = { ...pending, recoveryId: currentQuestion.supportedInteractionId, freshId: currentQuestion.freshCheckId || pending.freshId };
      this.state.cursor = `RECOVERY:${currentQuestion.supportedInteractionId}`;
      this.emit("fra19_supported_repair_started", { repair_id: currentQuestion.id, supported_question_id: currentQuestion.supportedInteractionId, family: pending.family });
      this.persist();
      return this.render();
    }
    const freshId = pending.freshId || currentQuestion?.freshCheckId;
    if (freshId) {
      this.state.freshContext = {
        questionId: freshId, family: pending.family, returnId: pending.returnId,
        exitRemediation: Boolean(pending.exitRemediation), fra19RepairFresh: true,
        fra19FinalRecovery: Boolean(pending.fra19FinalRecovery), repairId: pending.recoveryId, correct: null
      };
      this.state.pendingRecovery = null;
      this.state.cursor = `FRESH:${freshId}`;
      this.persist();
      return this.render();
    }
    this.state.pendingRecovery = null;
    this.state.cursor = pending.returnId || pending.nextId;
    this.persist();
    this.render();
  };

  prototype.handleFra19FreshSubmission = function (current, response, evaluation) {
    const correct = evaluation.correct === true;
    const questionId = current.questionId;
    this.state.resolved[questionId] = correct ? "fresh_correct" : "fresh_incorrect";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    this.state.workedRevealed[questionId] = true;
    if (!this.state.seenConfirmations.includes(questionId)) this.state.seenConfirmations.push(questionId);
    if (this.state.freshContext) this.state.freshContext.correct = correct;
    if (this.state.freshContext?.fra19FinalRecovery) this.state.exit.responses[questionId] = { response: serialise(response), correct };
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

  prototype.beginFra19RecoveryItem = function () {
    const remediation = this.state.exit.remediation;
    const questionId = remediation?.recoveryIds?.[remediation.recoveryIndex];
    if (!questionId) {
      this.state.exit.result = remediation?.successes === remediation?.requiredSuccesses ? "SECURE" : "NEEDS_WORK";
      this.state.freshContext = null;
      this.persist();
      return this.finishExit();
    }
    this.state.freshContext = {
      questionId, family: this.model.getQuestion(questionId)?.evidenceFamily || "UNKNOWN",
      returnId: null, exitRemediation: true, fra19FinalRecovery: true, fra19RecoveryItem: true, correct: null
    };
    this.state.cursor = `FRESH:${questionId}`;
    this.persist();
    this.render();
  };

  prototype.advanceFresh = function (current) {
    if (!this.isFra19V1()) return original.advanceFresh.call(this, current);
    const context = this.state.freshContext || {};
    const correct = context.correct === true;
    const questionId = current.questionId;
    if (context.fra19RepairFresh) {
      if (correct) this.state.evidence.freshConfirmationPassed[questionId] = true;
      if (context.fra19FinalRecovery) {
        this.state.freshContext = null;
        return this.beginFra19RecoveryItem();
      }
      if (correct) {
        this.state.freshContext = null;
        this.state.cursor = context.returnId || "FINAL-INTRO";
        this.persist();
        return this.render();
      }
      const family = canonical.evaluateResponse(current.question, this.lastResponse(questionId)).errorFamily || context.family;
      const repairId = repairForFamily(family) || repairForFamily(context.family);
      if (repairId) {
        this.state.freshContext = null;
        this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId: repairId, family, freshId: this.model.getQuestion(repairId)?.freshCheckId || null, returnId: context.returnId, exitRemediation: false, fra19RepairFlow: true };
        this.state.cursor = `RECOVERY:${repairId}`;
        this.persist();
        return this.render();
      }
    }
    if (context.fra19HintFresh) {
      if (correct) {
        this.state.evidence.freshConfirmationPassed[questionId] = true;
        this.state.evidence.pendingNoHintConfirmations = this.state.evidence.pendingNoHintConfirmations.filter((id) => id !== questionId);
        const next = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
        if (next) {
          this.state.freshContext = { questionId: next, family: this.model.getQuestion(next)?.evidenceFamily || "UNKNOWN", returnId: "FINAL-INTRO", exitRemediation: false, fra19HintFresh: true, correct: null };
          this.state.cursor = `FRESH:${next}`;
        } else {
          this.state.freshContext = null;
          this.state.cursor = context.returnId || "FINAL-INTRO";
        }
        this.persist();
        return this.render();
      }
      const family = canonical.evaluateResponse(current.question, this.lastResponse(questionId)).errorFamily || "UNKNOWN";
      const repairId = repairForFamily(family);
      if (repairId) {
        this.state.freshContext = null;
        this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId: repairId, family, freshId: this.model.getQuestion(repairId)?.freshCheckId || null, returnId: context.returnId || "FINAL-INTRO", exitRemediation: false, fra19RepairFlow: true };
        this.state.cursor = `RECOVERY:${repairId}`;
        this.persist();
        return this.render();
      }
    }
    if (context.fra19RecoveryItem) {
      const remediation = this.state.exit.remediation;
      remediation.recoveryResults.push({ questionId, correct });
      if (correct) remediation.successes += 1;
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) return this.beginFra19RecoveryItem();
      this.state.exit.result = remediation.successes === remediation.requiredSuccesses ? "SECURE" : "NEEDS_WORK";
      this.emit("fra19_recovery_completed", { result: this.state.exit.result, successes: remediation.successes, required_successes: remediation.requiredSuccesses, recovery_results: remediation.recoveryResults });
      this.persist();
      return this.finishExit();
    }
    return original.advanceFresh.call(this, current);
  };
})();
