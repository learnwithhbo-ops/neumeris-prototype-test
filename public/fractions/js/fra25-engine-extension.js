(function () {
  "use strict";

  const install = (Engine) => {
    const adapter = window.RevilyFra25Canonical;
    if (!Engine || !adapter) return;
    const proto = Engine.prototype;
    if (proto.__revilyFra25V1Extended) return;
    Object.defineProperty(proto, "__revilyFra25V1Extended", { value: true, configurable: true });
    const serialise = window.RevilyValidators.serialiseResponse;
    const prefix = adapter.prefix;

  proto.isFra25V1 = function () {
    return this.spec.identity?.id === "FRA-25" && this.spec.canonical_lesson?.version === "FRA25-HANDOFF-V1";
  };

  const originalIsRegistryRuntimeLesson = proto.isRegistryRuntimeLesson;
  proto.isRegistryRuntimeLesson = function () {
    return this.isFra25V1() || originalIsRegistryRuntimeLesson.call(this);
  };

  const originalProgressFor = proto.progressFor;
  proto.progressFor = function (current) {
    if (!this.isFra25V1()) return originalProgressFor.call(this, current);
    if (current.kind === "completion") return { label: "Complete", percent: 100 };
    const positions = {
      HOOK: 1, "HOOK-CHOICE": 2, T1: 3, T2: 4, T3: 5, T4: 6, T5: 7, HANDOFF: 8,
      G1: 9, G2: 10, F1: 11, F2: 12, I1: 13, I2: 14,
      M1: 15, M2: 16, M3: 17, M4: 18, M5: 19
    };
    const rawId = String(current.questionId || current.id || "").replace(/^FRA-25-/, "").replace(/^RECOVERY:/, "");
    const position = positions[rawId] || (current.phase === "repair" || current.recovery || current.confirmation ? 19 : 1);
    return { label: `Step ${position} of 20`, percent: Math.max(5, Math.min(95, position * 5)) };
  };

  const originalLoadState = proto.loadState;
  proto.loadState = function () {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch { saved = null; }
    const restored = originalLoadState.call(this);
    if (!this.isFra25V1()) return restored;
    if (saved && saved.version === 1 && saved.skillId === "FRA-25" && saved.contentVersion !== "FRA25-HANDOFF-V1") {
      restored.soundOn = saved.soundOn !== false;
      restored.developerOpen = saved.developerOpen === true;
      restored.narrationResume = null;
      restored.contentMigration = {
        from: saved.contentVersion || "legacy-fra25-yaml",
        to: "FRA25-HANDOFF-V1",
        resetTo: "HOOK",
        previousAttemptId: saved.attemptId || null,
        previousStatus: saved.status || null,
        preserved: ["soundOn", "developerOpen", "previous attempt status and responses in history"],
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
            fromContentVersion: saved.contentVersion || "legacy-fra25-yaml",
            toContentVersion: "FRA25-HANDOFF-V1",
            completionResult: saved.exit?.result || null,
            submissions: saved.submissions || {},
            engagementResponses: saved.engagementResponses || {}
          });
          localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
        }
      } catch {
        // A clean FRA25 attempt remains safe if history storage is unavailable.
      }
    } else {
      restored.narrationResume = null;
    }
    return restored;
  };

  const structuredTypes = new Set(["fra25_pair_divisor", "fra25_quotient_pair", "fra25_reduced_product_fraction"]);
  const originalInputMarkup = proto.inputMarkup;
  proto.inputMarkup = function (question, saved, locked) {
    if (this.isFra25V1() && structuredTypes.has(question.response.type)) return adapter.inputMarkup(question, saved, locked);
    return originalInputMarkup.call(this, question, saved, locked);
  };

  const originalReadResponse = proto.readResponse;
  proto.readResponse = function (question, allowPartial) {
    if (this.isFra25V1() && structuredTypes.has(question.response.type)) return adapter.readResponse(this, question, allowPartial);
    return originalReadResponse.call(this, question, allowPartial);
  };

  const originalBindInputEvents = proto.bindInputEvents;
  proto.bindInputEvents = function (question, locked) {
    if (this.isFra25V1() && structuredTypes.has(question.response.type)) {
      if (!locked) adapter.bindInputEvents(this, question);
      return;
    }
    return originalBindInputEvents.call(this, question, locked);
  };

  function outcomeLines(engine, evaluation) {
    const registry = engine.spec.canonical_lesson.runtime_copy;
    return (evaluation?.utteranceIds || []).map((id) => registry[id]?.text || "").filter(Boolean);
  }

  function resetQuestion(engine, questionId) {
    delete engine.state.resolved[questionId];
    delete engine.state.feedback[questionId];
    delete engine.state.drafts[questionId];
    delete engine.state.engagementResponses[questionId];
    delete engine.state.attempts[questionId];
    delete engine.state.evidence.answerLocked[questionId];
    engine.state.submissions[questionId] = [];
    delete engine.state.exit.responses[questionId];
    delete engine.state.workedRevealed[questionId];
  }

  proto.fra25RevealLockedWorking = function (current, correct, evaluation) {
    const question = current.question;
    this.state.workedRevealed[current.questionId] = true;
    this.persist();
    window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
    this.showFeedback(correct ? "correct" : "support", evaluation.visibleText, question.scripts?.worked_explanation || "", "Quick check");
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = false;
    this.emit("worked_solution_shown", { question_id: current.questionId, answer_locked: true, final_check: true });
  };

  proto.fra25ShowLockedResult = function (current, correct, narrate) {
    const question = current.question;
    const response = this.lastResponse(current.questionId);
    const evaluation = adapter.evaluateResponse(question, response);
    if (this.state.workedRevealed[current.questionId]) {
      window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      this.showFeedback(correct ? "correct" : "support", evaluation.visibleText, question.scripts?.worked_explanation || "", "Quick check");
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      return;
    }
    window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "initial" });
    this.showFeedback(correct ? "correct" : "support", evaluation.visibleText, "", "Answer locked");
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = true;
    const reveal = () => this.fra25RevealLockedWorking(current, correct, evaluation);
    const lines = outcomeLines(this, evaluation);
    if (narrate && lines.length) this.startNarration(lines, reveal, { resumeAction: "reveal_fra05_worked" });
    else reveal();
  };

  proto.fra25QueueConfirmation = function (questionId) {
    const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
    if (!confirmationId || this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) || this.state.evidence.freshConfirmationPassed[confirmationId]) return;
    this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
    this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "hint_supported_first_attempt_success" });
  };

  proto.fra25QueueRepair = function (current, family, options) {
    const recoveryId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
    const repairQuestion = recoveryId ? this.model.getQuestion(recoveryId) : null;
    const freshId = repairQuestion?.freshCheckId || this.freshCheckForFamily(family);
    if (!recoveryId || !freshId) return false;
    this.state.evidence.supportEscalated[current.questionId] = true;
    this.state.pendingRecovery = {
      originId: current.id,
      originQuestionId: current.questionId,
      recoveryId,
      freshId,
      returnId: options?.returnId ?? current.nextId,
      family,
      exitRemediation: options?.exitRemediation === true,
      fra25FinalRecovery: options?.fra25FinalRecovery === true,
      retryConfirmationId: options?.retryConfirmationId || null
    };
    this.emit("fra25_repair_queued", { origin_question_id: current.questionId, error_family: family, repair_id: recoveryId, fresh_confirmation_id: freshId, final_recovery: options?.fra25FinalRecovery === true });
    return true;
  };

  proto.fra25HandleEngagement = function (current, response) {
    const question = current.question;
    const visible = question.scripts?.engagement_visible_by_value?.[String(response)] || "Both routes preserve the product and finish at the same fraction.";
    this.state.resolved[current.questionId] = "engagement";
    this.state.feedback[current.questionId] = "worked";
    this.state.engagementResponses[current.questionId] = { response: serialise(response), correct: null };
    this.lockInputs();
    window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
    this.showFeedback("engagement", visible, "", question.scripts?.engagement_label || "Your route");
    this.elements.primary.textContent = "Continue";
    this.elements.primary.disabled = false;
    this.emit("engagement_response_shown", { question_id: current.questionId, response: serialise(response), matched_expected_response: null, scored: false });
    this.persist();
  };

  proto.fra25HandleOutcome = function (current, response, evaluation) {
    const question = current.question;
    const questionId = current.questionId;
    const correct = evaluation.correct === true;
    const attempts = this.state.attempts[questionId] || 1;
    const locks = question.policy?.answerLocksOnSubmit === true || correct;
    const recorded = this.state.evidence.errorFamily[questionId];
    const confirmedFamily = recorded && recorded !== "support_needed" ? recorded : null;

    if (current.recovery && !correct) {
      this.state.evidence.answerLocked[questionId] = false;
      this.state.feedback[questionId] = "first_incorrect";
      this.root.querySelector("#answer-form")?.classList.add("has-error");
      this.showFeedback("hint", evaluation.visibleText, "Use the repair model, then try this supported interaction again.", "Try the repair again");
      this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
      this.elements.primary.disabled = this.readResponse(question) === null;
      const lines = outcomeLines(this, evaluation);
      if (lines.length) this.startNarration(lines, null);
      this.refocusInput();
      this.persist();
      return;
    }

    if (!correct && !locks && attempts === 1) {
      this.state.feedback[questionId] = "first_incorrect";
      this.root.querySelector("#answer-form")?.classList.add("has-error");
      this.showFeedback("hint", evaluation.visibleText, "Use the factor positions and try again.", "Try again");
      this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
      this.elements.primary.disabled = this.readResponse(question) === null;
      const lines = outcomeLines(this, evaluation);
      if (lines.length) this.startNarration(lines, null);
      this.refocusInput();
      this.persist();
      return;
    }

    this.state.resolved[questionId] = correct ? (attempts === 1 ? "correct" : "correct_after_support") : "worked";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    if (correct && question.policy?.requiresFreshNoHintConfirmationIfHintUsed
      && this.state.evidence.firstAttemptCorrect[questionId] === true
      && this.state.evidence.hintOpenedBeforeSubmit[questionId] === true) this.fra25QueueConfirmation(questionId);
    if (!correct && confirmedFamily && this.fra25QueueRepair(current, confirmedFamily)) this.state.resolved[questionId] = "worked_then_recovery";
    this.lockInputs();
    window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
    this.showFeedback(correct ? "correct" : "support", evaluation.visibleText, question.scripts?.worked_explanation || "", "Answer locked");
    this.elements.primary.textContent = this.state.pendingRecovery?.originId === current.id ? "Try a quick repair" : "Continue";
    this.elements.primary.disabled = true;
    this.persist();
    const lines = outcomeLines(this, evaluation);
    const enable = () => { if (this.elements?.primary) this.elements.primary.disabled = false; };
    if (lines.length) this.startNarration(lines, enable, { resumeAction: "enable_fra05_continue" });
    else enable();
  };

  proto.fra25HandleFreshSubmission = function (current, response, evaluation) {
    const questionId = current.questionId;
    const correct = evaluation.correct === true;
    if (!this.state.seenConfirmations.includes(questionId)) this.state.seenConfirmations.push(questionId);
    this.state.resolved[questionId] = correct ? "fresh_correct" : "fresh_incorrect";
    this.state.feedback[questionId] = "worked";
    this.state.evidence.answerLocked[questionId] = true;
    if (this.state.freshContext) this.state.freshContext.correct = correct;
    if (this.state.freshContext?.fra25FinalRecovery) this.state.exit.responses[questionId] = { response: serialise(response), correct };
    this.lockInputs();
    this.emit("fresh_confirmation_submitted", { question_id: questionId, correct, error_family: evaluation.errorFamily || current.question.primaryErrorFamily });
    this.persist();
    this.fra25ShowLockedResult(current, correct, true);
  };

  proto.fra25HandleExitSubmission = function (current, response, evaluation) {
    const correct = evaluation.correct === true;
    this.state.exit.responses[current.questionId] = { response: serialise(response), correct };
    this.lockInputs();
    this.persist();
    this.fra25ShowLockedResult(current, correct, true);
    if (!this.model.exitIds.every((id) => this.state.exit.responses[id])) return;
    const score = this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct).length;
    const missed = this.model.exitIds.filter((id) => !this.state.exit.responses[id]?.correct);
    this.state.exit.primaryScore = score;
    this.state.exit.missedPrimaryIds = missed;
    this.routeFra25FinalEvidence(score, missed);
    this.persist();
  };

  const originalSubmitAnswer = proto.submitAnswer;
  proto.submitAnswer = function (current) {
    if (!this.isFra25V1()) return originalSubmitAnswer.call(this, current);
    const question = current.question;
    const response = this.readResponse(question);
    if (response === null) return;
    this.stopNarration(false);
    const questionId = current.questionId;
    const evaluation = adapter.evaluateResponse(question, response);
    const correct = evaluation.correct === true;
    this.state.attempts[questionId] = (this.state.attempts[questionId] || 0) + 1;
    const firstAttempt = this.state.attempts[questionId] === 1;
    const hintOpened = this.state.evidence.hintOpened[questionId] === true;
    if (firstAttempt && !question.policy?.engagementOnly) {
      this.state.evidence.firstAttemptCorrect[questionId] = correct;
      this.state.evidence.hintOpenedBeforeSubmit[questionId] = hintOpened;
      this.state.evidence.canonicalSignature[questionId] = question.canonicalQuestion?.visual?.visibleExpression || null;
    } else if (hintOpened) this.state.evidence.hintOpenedBeforeSubmit[questionId] = true;
    if (question.policy?.answerLocksOnSubmit) this.state.evidence.answerLocked[questionId] = true;
    if (!correct && !question.policy?.engagementOnly) {
      const candidate = evaluation.errorFamily || "UNKNOWN";
      const pairedEvidence = Object.entries(this.state.evidence.candidateErrorFamily || {}).some(([id, family]) => id !== questionId && family === candidate);
      const misconception = adapter.requiresRepeatedEvidence(question, response) && firstAttempt && !pairedEvidence ? "support_needed" : candidate;
      this.state.evidence.candidateErrorFamily[questionId] = candidate;
      this.state.evidence.misconceptions[questionId] = misconception;
      this.state.evidence.errorFamily[questionId] = misconception;
      this.emit("misconception_detected", { question_id: questionId, misconception, candidate });
    }
    if (question.policy?.engagementOnly) {
      this.state.engagementResponses[questionId] = { response: serialise(response), at: new Date().toISOString() };
    } else {
      this.state.submissions[questionId] = this.state.submissions[questionId] || [];
      this.state.submissions[questionId].push({ response: serialise(response), correct, at: new Date().toISOString() });
    }
    this.state.drafts[questionId] = serialise(response);
    this.emit("answer_submitted", { question_id: questionId, attempt_number: this.state.attempts[questionId], correct: question.policy?.engagementOnly ? null : correct, scored: question.policy?.scored !== false, hint_opened_before_submit: hintOpened, response_type: question.response.type, error_family: evaluation.errorFamily || null });
    if (question.policy?.engagementOnly) return this.fra25HandleEngagement(current, response);
    if (current.fresh) return this.fra25HandleFreshSubmission(current, response, evaluation);
    if (current.exit || current.confirmation) return this.fra25HandleExitSubmission(current, response, evaluation);
    return this.fra25HandleOutcome(current, response, evaluation);
  };

  const originalAdaptiveNextId = proto.adaptiveNextId;
  proto.adaptiveNextId = function (current) {
    if (!this.isFra25V1()) return originalAdaptiveNextId.call(this, current);
    if (current.phase === "exit") return current.nextId;
    if (current.id === "G2") {
      const record = (id) => ({
        questionId: id.replace("FRA-25-", ""),
        firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[id] === true,
        hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[id] === true,
        supportEscalated: this.state.evidence.supportEscalated[id] === true
      });
      const ids = [prefix("G1"), prefix("G2")];
      const unresolvedCentralErrors = ids.flatMap((id) => [this.state.evidence.candidateErrorFamily[id], this.state.evidence.errorFamily[id]])
        .filter((family) => ["PAIR", "SHARED", "TERM", "NONE", "FINISH"].includes(family));
      const strong = adapter.shouldSkipF1({ g1: record(ids[0]), g2: record(ids[1]), unresolvedCentralErrors }) === true;
      if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without hint, support, or a central error" });
      return strong ? "F2" : "F1";
    }
    if (current.id === "I2") {
      const pending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
      if (pending) {
        const question = this.model.getQuestion(pending);
        this.state.freshContext = {
          questionId: pending,
          family: question?.evidenceFamily || question?.primaryErrorFamily || "UNKNOWN",
          returnId: "M1",
          exitRemediation: false,
          introNarration: (this.spec.lesson.adaptive_pathway.no_hint_gate_after.introUtteranceIds || []).map((id) => this.spec.canonical_lesson.runtime_copy[id].text),
          correct: null
        };
        return `FRESH:${pending}`;
      }
      return "M1";
    }
    return current.nextId;
  };

  const originalFinishRecovery = proto.finishRecovery;
  proto.finishRecovery = function () {
    if (!this.isFra25V1()) return originalFinishRecovery.call(this);
    const pending = this.state.pendingRecovery;
    if (!pending) return;
    this.stopNarration(false);
    const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
    if (recoveryQuestion?.supportedInteractionId) {
      this.state.pendingRecovery = Object.assign({}, pending, {
        repairIntroId: recoveryQuestion.id,
        recoveryId: recoveryQuestion.supportedInteractionId,
        freshId: recoveryQuestion.freshCheckId || pending.freshId
      });
      this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
      this.emit("fra25_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
      this.persist();
      return this.render();
    }
    if (pending.freshId) {
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId: pending.freshId,
        family: pending.family,
        returnId: pending.returnId,
        exitRemediation: Boolean(pending.exitRemediation),
        fra25RepairRecheck: true,
        fra25FinalRepairRecheck: Boolean(pending.fra25FinalRecovery),
        fra25PendingRepair: pending,
        retryConfirmationId: pending.retryConfirmationId || null,
        correct: null
      };
      this.state.cursor = `FRESH:${pending.freshId}`;
      this.emit("fra25_repair_recheck_started", { question_id: pending.freshId, family: pending.family, final_recovery: Boolean(pending.fra25FinalRecovery) });
      this.persist();
      return this.render();
    }
    if (pending.fra25FinalRecovery) {
      this.state.pendingRecovery = null;
      this.beginNextFra25RecoveryStep();
      this.persist();
      return this.render();
    }
    this.state.pendingRecovery = null;
    this.state.cursor = pending.returnId || pending.nextId || "M1";
    this.persist();
    this.render();
  };

  proto.fra25RetryFresh = function (questionId, context) {
    resetQuestion(this, questionId);
    this.state.freshContext = Object.assign({}, context, { questionId, correct: null });
    this.state.cursor = `FRESH:${questionId}`;
    this.persist();
    this.render();
  };

  const originalAdvanceFresh = proto.advanceFresh;
  proto.advanceFresh = function (current) {
    if (!this.isFra25V1()) return originalAdvanceFresh.call(this, current);
    const context = this.state.freshContext || {};
    const correct = context.correct === true;
    const questionId = current.questionId;
    if (context.fra25FinalRecovery) return this.advanceFra25Recovery(current);
    if (context.fra25RepairRecheck) {
      if (correct) {
        this.state.evidence.freshConfirmationPassed[questionId] = true;
        this.state.freshContext = null;
        if (context.fra25FinalRepairRecheck) {
          this.beginNextFra25RecoveryStep();
          this.persist();
          return this.render();
        }
        if (context.retryConfirmationId) {
          const retryId = context.retryConfirmationId;
          resetQuestion(this, retryId);
          const retryQuestion = this.model.getQuestion(retryId);
          this.state.freshContext = { questionId: retryId, family: retryQuestion?.evidenceFamily || "UNKNOWN", returnId: context.returnId || "M1", exitRemediation: false, correct: null };
          this.state.cursor = `FRESH:${retryId}`;
          this.persist();
          return this.render();
        }
        this.state.cursor = context.returnId || "M1";
        this.persist();
        return this.render();
      }
      this.state.evidence.freshConfirmationPassed[questionId] = false;
      this.state.freshContext = null;
      if (context.fra25FinalRepairRecheck) {
        this.state.exit.result = "NEEDS_WORK";
        this.emit("fra25_repair_recheck_failed", { question_id: questionId, family: context.family, final_recovery: true });
        this.persist();
        return this.finishExit();
      }
      const pending = context.fra25PendingRepair || {};
      [questionId, pending.recoveryId, pending.repairIntroId].filter(Boolean).forEach((id) => resetQuestion(this, id));
      const repairIntroId = pending.repairIntroId || pending.recoveryId;
      this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: repairIntroId });
      this.state.cursor = `RECOVERY:${repairIntroId}`;
      this.emit("fra25_repair_recheck_failed", { question_id: questionId, family: context.family, final_recovery: false });
      this.persist();
      return this.render();
    }
    if (correct) {
      this.state.evidence.freshConfirmationPassed[questionId] = true;
      this.state.evidence.pendingNoHintConfirmations = this.state.evidence.pendingNoHintConfirmations.filter((id) => id !== questionId);
      const nextPending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
      if (nextPending) {
        const question = this.model.getQuestion(nextPending);
        this.state.freshContext = { questionId: nextPending, family: question?.evidenceFamily || "UNKNOWN", returnId: context.returnId || "M1", exitRemediation: false, correct: null };
        this.state.cursor = `FRESH:${nextPending}`;
      } else {
        this.state.freshContext = null;
        this.state.cursor = context.returnId || "M1";
      }
      this.persist();
      return this.render();
    }
    const recorded = this.state.evidence.errorFamily[questionId];
    const family = (recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[questionId] : recorded)
      || this.state.evidence.candidateErrorFamily[questionId] || "UNKNOWN";
    if (this.fra25QueueRepair(current, family, { returnId: context.returnId || "M1", retryConfirmationId: questionId })) {
      this.state.freshContext = null;
      return this.enterRecovery(this.state.pendingRecovery.recoveryId);
    }
    return this.fra25RetryFresh(questionId, context);
  };

  proto.fra25EvidenceRecords = function (questionIds) {
    return (questionIds || []).map((fullId) => {
      const question = this.model.getQuestion(fullId);
      const questionId = String(fullId).replace("FRA-25-", "");
      const saved = this.state.exit.responses[fullId];
      const recorded = this.state.evidence.errorFamily[fullId];
      const candidate = this.state.evidence.candidateErrorFamily[fullId];
      const observed = saved?.correct ? [] : [...new Set([recorded === "support_needed" ? candidate : recorded, candidate].filter((family) => family && family !== "support_needed"))];
      return {
        questionId,
        stage: question?.canonicalQuestion?.stage || question?.stage || "final",
        family: question?.evidenceFamily,
        firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[fullId] === true,
        attempts: Number(this.state.attempts[fullId] || 0),
        hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[fullId] === true,
        supportEscalated: this.state.evidence.supportEscalated[fullId] === true,
        answerLocked: this.state.evidence.answerLocked[fullId] === true,
        committedResponse: saved?.response,
        observedErrorFamilies: observed
      };
    });
  };

  proto.routeFra25FinalEvidence = function (score, missed) {
    const records = this.fra25EvidenceRecords(this.model.exitIds);
    const decision = adapter.evaluatePrimaryFinal(records);
    if (decision.action === "finish") {
      this.state.exit.result = "SECURE";
      this.state.exit.remediation = { profile: "fra25", route: "primary_mastery", decision, records };
      this.emit("fra25_final_route_selected", { route: "primary_mastery", score, decision });
      return;
    }
    const repairQueue = decision.repairIds.map((id) => {
      const fullId = prefix(id);
      return { id: fullId, family: this.model.getQuestion(fullId)?.primaryErrorFamily || id.replace("R-", "") };
    });
    const recoveryIds = decision.recoveryQuestionIds.map(prefix);
    const expectedCount = decision.action === "repair_then_two_item_check" ? 2 : 3;
    if (recoveryIds.length !== expectedCount) {
      this.state.exit.result = "NEEDS_WORK";
      this.state.exit.remediation = { profile: "fra25", route: "incomplete_authored_recovery_bank", decision };
      return;
    }
    this.state.exit.remediation = { profile: "fra25", route: decision.action, decision, missed, repairQueue, repairIndex: 0, recoveryIds, recoveryIndex: 0, results: [], expectedCount };
    this.emit("fra25_final_route_selected", { route: decision.action, score, missed_question_ids: missed, repair_ids: repairQueue.map((item) => item.id), recovery_question_ids: recoveryIds });
    this.beginNextFra25RecoveryStep();
  };

  proto.beginNextFra25RecoveryStep = function () {
    const remediation = this.state.exit.remediation;
    if (remediation?.profile !== "fra25") return;
    if (remediation.repairIndex < remediation.repairQueue.length) {
      const repair = remediation.repairQueue[remediation.repairIndex++];
      const repairQuestion = this.model.getQuestion(repair.id);
      this.state.pendingRecovery = {
        originId: this.state.exit.missedPrimaryIds[0]?.replace("FRA-25-", "") || "M1",
        originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
        recoveryId: repair.id,
        freshId: repairQuestion?.freshCheckId || null,
        family: repair.family,
        exitRemediation: true,
        fra25FinalRecovery: true
      };
      this.state.cursor = `RECOVERY:${repair.id}`;
      this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
      return;
    }
    const questionId = remediation.recoveryIds[remediation.recoveryIndex];
    if (!questionId) return this.finishFra25RecoverySequence();
    this.state.pendingRecovery = null;
    this.state.freshContext = { questionId, family: this.model.getQuestion(questionId)?.evidenceFamily || "UNKNOWN", returnId: "COMPLETE", exitRemediation: true, fra25FinalRecovery: true, correct: null };
    this.state.cursor = `FRESH:${questionId}`;
    this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
  };

  proto.advanceFra25Recovery = function (current) {
    const remediation = this.state.exit.remediation;
    if (remediation?.profile !== "fra25") return;
    remediation.results.push({ questionId: current.questionId, correct: this.state.freshContext?.correct === true, firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[current.questionId] === true, answerLocked: this.state.evidence.answerLocked[current.questionId] === true });
    remediation.recoveryIndex += 1;
    this.state.freshContext = null;
    if (remediation.recoveryIndex < remediation.recoveryIds.length) {
      this.beginNextFra25RecoveryStep();
      this.persist();
      return this.render();
    }
    this.finishFra25RecoverySequence();
  };

  proto.finishFra25RecoverySequence = function () {
    const remediation = this.state.exit.remediation;
    if (remediation?.profile !== "fra25") return;
    const records = this.fra25EvidenceRecords(remediation.recoveryIds);
    const requiredQuestionIds = remediation.recoveryIds.map((id) => id.replace("FRA-25-", ""));
    const passes = adapter.recoveryRoutePasses({ requiredQuestionIds, records });
    this.state.exit.result = passes && records.length === remediation.expectedCount ? "SECURE" : "NEEDS_WORK";
    remediation.recoveryRecords = records;
    remediation.recoveryPassed = passes;
    this.state.freshContext = null;
    this.emit("fra25_recovery_completed", { route: remediation.route, result: this.state.exit.result, required_question_ids: requiredQuestionIds, required_all_correct: true });
    this.persist();
    this.finishExit();
  };

  const originalShowSavedExitResponse = proto.showSavedExitResponse;
  proto.showSavedExitResponse = function (current, correct, narrate) {
    if (this.isFra25V1()) return this.fra25ShowLockedResult(current, correct, narrate);
    return originalShowSavedExitResponse.call(this, current, correct, narrate);
  };

  const originalFinalCheckLead = proto.finalCheckLead;
  proto.finalCheckLead = function (current, correct) {
    if (this.isFra25V1()) return adapter.evaluateResponse(current.question, this.lastResponse(current.questionId)).visibleText || "";
    return originalFinalCheckLead.call(this, current, correct);
  };

  const originalRestoreResolvedFeedback = proto.restoreResolvedFeedback;
  proto.restoreResolvedFeedback = function (current) {
    if (!this.isFra25V1()) return originalRestoreResolvedFeedback.call(this, current);
    const mode = this.state.resolved[current.questionId];
    const question = current.question;
    if (mode === "engagement") {
      const saved = this.state.engagementResponses[current.questionId]?.response;
      const visible = question.scripts?.engagement_visible_by_value?.[String(saved)] || "Both routes preserve the product.";
      this.showFeedback("engagement", visible, "", question.scripts?.engagement_label || "Your route");
      return;
    }
    const evaluation = adapter.evaluateResponse(question, this.lastResponse(current.questionId));
    window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
    this.showFeedback(evaluation.correct ? "correct" : "support", evaluation.visibleText, question.scripts?.worked_explanation || "", "Answer locked");
  };
  };

  const existingEngine = window.RevilyLessonEngine?.LessonEngine;
  if (existingEngine) {
    install(existingEngine);
  } else if (!window.__revilyFra25EngineHooked) {
    window.__revilyFra25EngineHooked = true;
    let engineModule;
    Object.defineProperty(window, "RevilyLessonEngine", {
      configurable: true,
      get: () => engineModule,
      set: (value) => {
        engineModule = value;
        install(value?.LessonEngine);
      }
    });
  }
})();
