(function () {
  "use strict";

  const BaseLessonEngine = window.RevilyLessonEngine?.LessonEngine;
  const adapter = window.RevilyFra27Canonical;
  const visuals = window.RevilyFra27Visuals;
  const serialiseResponse = window.RevilyValidators.serialiseResponse;
  if (!BaseLessonEngine || !adapter || !visuals) throw new Error("FRA-27 engine extension loaded before the shared lesson engine.");

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const uniqueLines = (values) => [...new Set((values || []).flat(Infinity).filter((value) => typeof value === "string" && value.trim()))];

  // FRA-26 can be under active development beside this target-scoped extension.
  // Supply its legacy predicate only when the shared engine has not defined it.
  if (typeof BaseLessonEngine.prototype.isFra26V1 !== "function") {
    Object.defineProperty(BaseLessonEngine.prototype, "isFra26V1", {
      configurable: true,
      value() {
        return this.spec?.identity?.id === "FRA-26" && this.spec?.canonical_lesson?.engine_profile === "fra26";
      },
    });
  }

  class Fra27LessonEngine extends BaseLessonEngine {
    isFra27V1() {
      return this.spec?.identity?.id === "FRA-27" && this.spec?.canonical_lesson?.version === adapter.CONTENT_VERSION;
    }

    isRegistryRuntimeLesson() {
      return this.isFra27V1() || super.isRegistryRuntimeLesson();
    }

    loadState() {
      const state = super.loadState();
      if (!this.isFra27V1()) return state;
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || "null");
        if (!saved || saved.contentVersion === adapter.CONTENT_VERSION) return state;
        state.soundOn = saved.soundOn !== false;
        state.developerOpen = saved.developerOpen === true;
        state.contentMigration = {
          from: saved.contentVersion || "legacy-fra27-yaml",
          to: adapter.CONTENT_VERSION,
          resetTo: "HOOK",
          previousAttemptId: saved.attemptId || null,
          previousStatus: saved.status || null,
          preserved: ["soundOn", "developerOpen", "previous completion status in history"],
          cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
        };
        const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
        const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
        if (!alreadyArchived) {
          history.push({
            attemptId: saved.attemptId || null,
            status: saved.status || "LEARNING",
            archivedAt: new Date().toISOString(),
            reason: "content_version_migration",
            fromContentVersion: saved.contentVersion || "legacy-fra27-yaml",
            toContentVersion: adapter.CONTENT_VERSION,
            completionResult: saved.exit?.result || null,
            submissions: saved.submissions || {}
          });
          localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
        }
      } catch {
        // The coherent HOOK reset remains safe when history storage is unavailable.
      }
      return state;
    }

    inputMarkup(question, saved, locked) {
      if (!this.isFra27V1()) return super.inputMarkup(question, saved, locked);
      const disabled = locked ? " disabled" : "";
      const value = saved && typeof saved === "object" ? saved : {};
      if (question.response.type === "fra27_share") {
        return `<fieldset class="fra27-share-answer"><legend>Write the fraction in one equal share</legend><div class="fixed-fraction-builder"><input id="fraction-n" aria-label="Numerator in one share" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? "")}"${disabled} /><i aria-hidden="true"></i><b class="fixed-fraction-value" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b></div><p>Move every tile in the model before checking.</p></fieldset>`;
      }
      if (question.response.type === "fra27_reciprocal_product") {
        if (question.response.entryMode === "fields") {
          const reciprocalParts = String(value.reciprocal || "").split("/");
          return `<fieldset class="fra27-reciprocal-answer"><legend>Complete the reciprocal and product</legend><div class="fra27-product-stage"><span>Reciprocal</span><div class="fraction-input"><input id="fra27-reciprocal-n" aria-label="Reciprocal numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(reciprocalParts[0] || "")}"${disabled} /><i aria-hidden="true"></i><input id="fra27-reciprocal-d" aria-label="Reciprocal denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(reciprocalParts[1] || "")}"${disabled} /></div><span>Product</span><div class="fraction-input"><input id="fraction-n" aria-label="Product numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? "")}"${disabled} /><i aria-hidden="true"></i><input id="fraction-d" aria-label="Product denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.d ?? "")}"${disabled} /></div></div></fieldset>`;
        }
        const selected = value.reciprocal || "";
        const revealProduct = Boolean(selected);
        return `<fieldset class="fra27-reciprocal-answer"><legend>Choose the reciprocal, then multiply</legend><div class="fra27-reciprocal-options" role="group" aria-label="Reciprocal choices">${question.response.options.map((option) => `<button type="button" class="fra27-reciprocal-option${String(selected) === String(option) ? " is-selected" : ""}" data-fra27-reciprocal="${escapeHtml(option)}" aria-pressed="${String(selected) === String(option)}"${disabled}>${escapeHtml(option)}</button>`).join("")}</div><input type="hidden" id="fra27-reciprocal-answer" value="${escapeHtml(selected)}" /><div class="fra27-product-stage"${revealProduct ? "" : " hidden"}><span>Product</span><div class="fraction-input"><input id="fraction-n" aria-label="Product numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? "")}"${disabled} /><i aria-hidden="true"></i><input id="fraction-d" aria-label="Product denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.d ?? "")}"${disabled} /></div></div></fieldset>`;
      }
      return super.inputMarkup(question, saved, locked);
    }

    bindInputEvents(question, locked) {
      super.bindInputEvents(question, locked);
      if (!this.isFra27V1() || locked || question.response.type !== "fra27_reciprocal_product") return;
      this.root.querySelectorAll("[data-fra27-reciprocal]").forEach((button) => {
        button.addEventListener("click", () => {
          const value = button.dataset.fra27Reciprocal;
          const hidden = this.root.querySelector("#fra27-reciprocal-answer");
          if (hidden) hidden.value = value;
          this.root.querySelectorAll("[data-fra27-reciprocal]").forEach((item) => {
            const selected = item === button;
            item.classList.toggle("is-selected", selected);
            item.setAttribute("aria-pressed", String(selected));
          });
          const product = this.root.querySelector(".fra27-product-stage");
          if (product) product.hidden = false;
          hidden?.dispatchEvent(new Event("input", { bubbles: true }));
        });
      });
    }

    renderQuestion(current) {
      super.renderQuestion(current);
      if (!this.isFra27V1() || current.question?.response?.type !== "fra27_share") return;
      const saved = this.lastResponse(current.questionId) ?? this.state.drafts[current.questionId];
      if (saved?.trayCounts) visuals.restoreShare(this.elements.canvas, saved.trayCounts);
    }

    readResponse(question, allowPartial) {
      if (!this.isFra27V1()) return super.readResponse(question, allowPartial);
      if (question.response.type === "fra27_share") {
        const trayCounts = visuals.shareCounts(this.elements.canvas);
        const numerator = this.root.querySelector("#fraction-n")?.value.trim() || "";
        const placed = trayCounts.reduce((sum, count) => sum + count, 0);
        const complete = placed === Number(question.response.totalTiles) && /^-?\d+$/.test(numerator);
        return complete || allowPartial ? { trayCounts, n: numerator, d: String(question.response.fixedDenominator) } : null;
      }
      if (question.response.type === "fra27_reciprocal_product") {
        const reciprocal = question.response.entryMode === "fields"
          ? `${this.root.querySelector("#fra27-reciprocal-n")?.value.trim() || ""}/${this.root.querySelector("#fra27-reciprocal-d")?.value.trim() || ""}`
          : (this.root.querySelector("#fra27-reciprocal-answer")?.value || "");
        const n = this.root.querySelector("#fraction-n")?.value.trim() || "";
        const d = this.root.querySelector("#fraction-d")?.value.trim() || "";
        const reciprocalComplete = question.response.entryMode === "fields"
          ? /^-?\d+\/-?\d+$/.test(reciprocal) && Number(reciprocal.split("/")[1]) !== 0
          : Boolean(reciprocal);
        const complete = reciprocalComplete && /^-?\d+$/.test(n) && /^-?\d+$/.test(d) && Number(d) !== 0;
        return complete || allowPartial ? { reciprocal, n, d } : null;
      }
      return super.readResponse(question, allowPartial);
    }

    lockInputs() {
      super.lockInputs();
      if (!this.isFra27V1()) return;
      this.root.querySelectorAll("[data-fra27-tile], [data-fra27-move], [data-fra27-reciprocal]").forEach((control) => {
        control.disabled = true;
        control.setAttribute("aria-disabled", "true");
      });
    }

    submitAnswer(current) {
      if (!this.isFra27V1()) return super.submitAnswer(current);
      const response = this.readResponse(current.question);
      if (response === null) return;
      const firstAttempt = (this.state.attempts[current.questionId] || 0) === 0;
      const evaluation = adapter.evaluateResponse(current.question, response);
      super.submitAnswer(current);
      if (firstAttempt && !current.question.policy?.engagementOnly) {
        this.state.evidence.answerValueCorrect[current.questionId] = evaluation.valueCorrect === true;
        this.state.evidence.answerFormCorrect[current.questionId] = evaluation.formCorrect === true;
        if (evaluation.componentCorrect) this.state.evidence.componentFirstAttemptCorrect[current.questionId] = Object.assign({}, evaluation.componentCorrect);
        this.persist();
      }
    }

    fra27OutcomeLines(question, response, correct) {
      if (!this.isFra27V1()) return [];
      const ids = adapter.selectOutcomeUtteranceIds(question, response, correct);
      const registry = this.spec.canonical_lesson.runtime_copy;
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    handlePrimary(current) {
      if (this.isFra27V1() && current?.recovery && this.state.resolved[current.questionId]) return this.finishRecovery();
      return super.handlePrimary(current);
    }

    handleEngagement(current, response, correct) {
      if (!this.isFra27V1()) return super.handleEngagement(current, response, correct);
      this.state.started = true;
      this.state.resolved[current.questionId] = "engagement";
      this.state.feedback[current.questionId] = "worked";
      this.state.engagementResponses[current.questionId] = { response: serialiseResponse(response), correct: null };
      this.persist();
      this.lockInputs();
      window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question: current.question, narration: current.narration, feedback: "worked" });
      this.showFeedback("engagement", "", "", "Your prediction");
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      const lines = current.question.scripts?.engagement_response_by_value?.[String(response)] || [];
      this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), matched_expected_response: null, scored: false });
      this.startNarration(lines, null);
    }

    handleCorrect(current) {
      if (!this.isFra27V1()) return super.handleCorrect(current);
      const question = current.question;
      const questionId = current.questionId;
      const attempts = this.state.attempts[questionId] || 1;
      this.state.resolved[questionId] = attempts === 1 ? "correct" : "correct_after_support";
      this.state.feedback[questionId] = "correct";
      if (question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) this.queueFra27Confirmation(questionId, "hint");
      if (question.policy?.requiresFreshNoHintConfirmationAfterSupport && attempts > 1) this.queueFra27Confirmation(questionId, "support");
      this.persist();
      this.lockInputs();
      window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "correct" });
      const response = this.lastResponse(questionId);
      this.showFeedback("correct", adapter.visibleFeedback(question, response, true), "", "Your result");
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      this.startNarration(this.fra27OutcomeLines(question, response, true), null);
    }

    queueFra27Confirmation(questionId, reason) {
      const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
      if (!confirmationId || this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) || this.state.evidence.freshConfirmationPassed[confirmationId]) return;
      this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
      this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason });
    }

    handleFra05Incorrect(current) {
      if (!this.isFra27V1()) return super.handleFra05Incorrect(current);
      const question = current.question;
      const questionId = current.questionId;
      const response = this.lastResponse(questionId);
      const attempts = this.state.attempts[questionId] || 1;
      const recorded = this.state.evidence.errorFamily[questionId];
      const family = recorded === "support_needed"
        ? (this.state.evidence.candidateErrorFamily[questionId] || "UNKNOWN")
        : (recorded || this.state.evidence.candidateErrorFamily[questionId] || "UNKNOWN");
      const runtimeLines = this.fra27OutcomeLines(question, response, false);
      const visible = adapter.visibleFeedback(question, response, false);
      const explicitStable = recorded !== "support_needed" && !["UNKNOWN", "ARITHMETIC"].includes(family) && !adapter.requiresRepeatedEvidence(question, response);
      this.root.querySelector("#answer-form")?.classList.add("has-error");
      if (attempts === 1 && !explicitStable) {
        this.state.feedback[questionId] = "first_incorrect";
        const detail = question.policy?.hintPolicy === "optional" ? "Try again, or open the hint for a strategy clue." : "Use the cue, then try the question again.";
        this.showFeedback("hint", visible, detail, "Try again");
        this.startNarration(runtimeLines, null);
        this.refocusInput();
        this.persist();
        return;
      }
      if (current.recovery) {
        this.state.feedback[questionId] = "support";
        this.showFeedback("support", visible, "Use the repair model and try again.", "Try again");
        this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.startNarration(runtimeLines, null);
        this.refocusInput();
        this.persist();
        return;
      }
      this.state.feedback[questionId] = "support";
      this.state.evidence.supportEscalated[questionId] = true;
      const recoveryId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family]
        || this.spec.lesson.adaptive_pathway?.repair_by_error_family?.UNKNOWN;
      const freshId = this.freshCheckForFamily(family) || this.freshCheckForFamily("UNKNOWN");
      const used = Number(this.state.evidence.repairCyclesUsed[family] || 0);
      if (recoveryId && freshId && used < 1) {
        this.state.evidence.repairCyclesUsed[family] = used + 1;
        this.state.resolved[questionId] = "worked_then_recovery";
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId,
          nextId: `FRESH:${freshId}`,
          returnId: current.nextId,
          freshId,
          family,
          exitRemediation: false
        };
        this.lockInputs();
        this.elements.primary.textContent = "Try a quick repair";
        this.elements.primary.disabled = false;
        this.showFeedback("support", visible, "Use the short repair, then answer a fresh question.", "Next step");
      } else {
        this.state.resolved[questionId] = "worked";
        this.lockInputs();
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.showFeedback("support", visible, "Use the worked state, then continue.", "Next step");
      }
      this.startNarration(runtimeLines, null);
      this.persist();
    }

    targetedFeedback(question, response, family) {
      if (this.isFra27V1()) return adapter.visibleFeedback(question, response, false);
      return super.targetedFeedback(question, response, family);
    }

    requiresRepeatedEvidence(question, response) {
      if (this.isFra27V1()) return adapter.requiresRepeatedEvidence(question, response);
      return super.requiresRepeatedEvidence(question, response);
    }

    classifyMisconception(question, response) {
      if (this.isFra27V1()) return adapter.classifyErrorFamily(question, response);
      return super.classifyMisconception(question, response);
    }

    adaptiveNextId(current) {
      if (!this.isFra27V1()) return super.adaptiveNextId(current);
      if (current.id === "G2") {
        const g1Id = "FRA-27-G1";
        const g2Id = "FRA-27-G2";
        const g1 = {
          questionId: "G1",
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g1Id] === true,
          componentFirstAttemptCorrect: this.state.evidence.componentFirstAttemptCorrect[g1Id] || {},
          hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g1Id] === true,
          supportEscalated: this.state.evidence.supportEscalated[g1Id] === true,
          errorFamilyHypothesis: this.state.evidence.errorFamily[g1Id] || null
        };
        const g2 = {
          questionId: "G2",
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g2Id] === true,
          componentFirstAttemptCorrect: this.state.evidence.componentFirstAttemptCorrect[g2Id] || {},
          hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g2Id] === true,
          supportEscalated: this.state.evidence.supportEscalated[g2Id] === true,
          errorFamilyHypothesis: this.state.evidence.errorFamily[g2Id] || null
        };
        const skip = window.RevilyFra27V1.shouldSkipF1(g1, g2);
        if (skip) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "clean guided visual and reciprocal/product evidence" });
        return skip ? "F2" : "F1";
      }
      if (current.id === "I2") {
        const pending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
        if (pending) {
          this.state.freshContext = { questionId: pending, family: this.model.getQuestion(pending)?.evidenceFamily || "UNKNOWN", returnId: "M1", exitRemediation: false, correct: null };
          return `FRESH:${pending}`;
        }
        return "M1";
      }
      return current.nextId;
    }

    finishRecovery() {
      if (!this.isFra27V1()) return super.finishRecovery();
      const pending = this.state.pendingRecovery;
      if (!pending) return;
      this.stopNarration(false);
      const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
      if (recoveryQuestion?.supportedInteractionId) {
        this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: recoveryQuestion.supportedInteractionId });
        this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
        this.emit("fra27_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
        this.persist();
        return this.render();
      }
      if (pending.fra27FinalRecovery) {
        this.state.pendingRecovery = null;
        this.beginNextFra27RecoveryStep();
        this.persist();
        return this.render();
      }
      this.state.pendingRecovery = null;
      if (pending.freshId) {
        this.state.freshContext = { questionId: pending.freshId, family: pending.family, returnId: pending.returnId, exitRemediation: false, correct: null };
        this.state.cursor = `FRESH:${pending.freshId}`;
      } else {
        this.state.cursor = pending.nextId;
      }
      this.persist();
      this.render();
    }

    handleExitSubmission(current, response, correct) {
      if (!this.isFra27V1()) return super.handleExitSubmission(current, response, correct);
      this.state.exit.responses[current.questionId] = { response: serialiseResponse(response), correct };
      this.lockInputs();
      this.showSavedExitResponse(current, correct, true);
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = true;
      const completed = this.model.exitIds.every((id) => this.state.exit.responses[id]);
      if (completed) {
        const score = this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct).length;
        const missed = this.model.exitIds.filter((id) => !this.state.exit.responses[id]?.correct);
        this.state.exit.primaryScore = score;
        this.state.exit.missedPrimaryIds = missed;
        this.routeFra27FinalEvidence(score, missed);
      }
      this.persist();
    }

    routeFra27FinalEvidence(score, missed) {
      const records = adapter.finalEvidenceRecords(this, this.model.exitIds);
      const route = window.RevilyFra27V1.evaluatePrimaryFinalRoute(records);
      if (route.kind === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra27", route: route.kind, primaryEvidence: records };
        this.emit("fra27_final_route_selected", { route: route.kind, score });
        return;
      }
      const repairMap = this.spec.lesson.adaptive_pathway.repair_by_error_family;
      const families = route.kind === "repair_then_two_item_mini_check" ? [route.family] : route.families;
      const repairQueue = [...new Set(families)].filter((family) => repairMap[family]).map((family) => ({ family, id: repairMap[family] }));
      const recoveryIds = route.questionIds.map((id) => `FRA-27-${id}`);
      this.state.exit.remediation = {
        profile: "fra27",
        route: route.kind,
        primaryEvidence: records,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        results: []
      };
      this.emit("fra27_final_route_selected", { route: route.kind, score, missed_question_ids: missed, repair_families: families, recovery_question_ids: recoveryIds });
      this.beginNextFra27RecoveryStep();
    }

    beginNextFra27RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra27") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace("FRA-27-", "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          family: repair.family,
          exitRemediation: true,
          fra27FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra27RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = { questionId, family: this.model.getQuestion(questionId)?.evidenceFamily || "DIRECT", returnId: "COMPLETE", exitRemediation: true, fra27FinalRecovery: true, correct: null };
      this.state.cursor = `FRESH:${questionId}`;
    }

    handleFreshSubmission(current, response, correct) {
      if (!this.isFra27V1()) return super.handleFreshSubmission(current, response, correct);
      const questionId = current.questionId;
      if (!this.state.seenConfirmations.includes(questionId)) this.state.seenConfirmations.push(questionId);
      this.state.resolved[questionId] = correct ? "fresh_correct" : "fresh_incorrect";
      this.state.feedback[questionId] = "worked";
      if (this.state.freshContext) this.state.freshContext.correct = correct;
      if (this.state.freshContext?.fra27FinalRecovery) this.state.exit.responses[questionId] = { response: serialiseResponse(response), correct };
      this.lockInputs();
      if (questionId.includes("FRA-27-A") || questionId.includes("FRA-27-MC-")) this.showSavedExitResponse(current, correct, true);
      else {
        window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question: current.question, narration: current.narration, feedback: correct ? "correct" : "worked" });
        this.showFeedback(correct ? "correct" : "support", adapter.visibleFeedback(current.question, response, correct), "", "Your result");
        this.startNarration(this.fra27OutcomeLines(current.question, response, correct), null);
      }
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      this.emit("fresh_confirmation_submitted", { question_id: questionId, correct, error_family: this.state.evidence.candidateErrorFamily[questionId] || null });
      this.persist();
    }

    advanceFresh(current) {
      if (this.isFra27V1() && this.state.freshContext?.fra27FinalRecovery) return this.advanceFra27Recovery(current);
      return super.advanceFresh(current);
    }

    advanceFra27Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra27") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId: questionId.replace("FRA-27-", ""),
        firstAttemptCorrect: correct && (this.state.attempts[questionId] || 0) === 1,
        errorFamilyHypothesis: correct ? null : (this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || "UNKNOWN")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra27RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra27RecoverySequence();
    }

    finishFra27RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra27") return;
      const ids = remediation.recoveryIds.map((id) => id.replace("FRA-27-", ""));
      const result = window.RevilyFra27V1.evaluateRecoveryCompletion(ids, remediation.results);
      this.state.exit.result = result === "finish_candidate" ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { result, evidence: remediation.results };
      this.state.freshContext = null;
      this.state.cursor = "COMPLETE";
      this.emit("fra27_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation });
      this.persist();
      this.render();
    }

    finalCheckLead(current, correct) {
      if (this.isFra27V1()) return adapter.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
      return super.finalCheckLead(current, correct);
    }

    showSavedExitResponse(current, correct, narrate) {
      if (!this.isFra27V1()) return super.showSavedExitResponse(current, correct, narrate);
      const question = current.question;
      const response = this.lastResponse(current.questionId);
      const visible = adapter.visibleFeedback(question, response, correct);
      if (this.state.workedRevealed[current.questionId]) {
        window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        this.showFeedback(correct ? "correct" : "support", visible, question.scripts?.worked_explanation || "", "Your result");
        this.elements.primary.disabled = false;
        return;
      }
      window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "initial" });
      this.showFeedback(correct ? "correct" : "support", visible, "", "Your result");
      if (!narrate) return;
      const lines = this.fra27OutcomeLines(question, response, correct);
      if (lines.length) this.startNarration(lines, () => this.revealFra05WorkedCheck(current, correct), { resumeAction: "reveal_fra05_worked" });
      else this.revealFra05WorkedCheck(current, correct);
    }

    revealFra05WorkedCheck(current, correct) {
      if (!this.isFra27V1()) return super.revealFra05WorkedCheck(current, correct);
      const question = current.question;
      this.state.workedRevealed[current.questionId] = true;
      this.persist();
      window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      this.showFeedback(correct ? "correct" : "support", adapter.visibleFeedback(question, this.lastResponse(current.questionId), correct), question.scripts?.worked_explanation || "", "Quick check");
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      const lines = uniqueLines(question.scripts?.worked_narration || []);
      if (lines.length) this.startNarration(lines, null);
      this.emit("worked_solution_shown", { question_id: current.questionId, answer_locked: true, final_check: true });
    }

    restoreResolvedFeedback(current) {
      if (!this.isFra27V1()) return super.restoreResolvedFeedback(current);
      const mode = this.state.resolved[current.questionId];
      if (mode === "engagement") {
        window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question: current.question, narration: current.narration, feedback: "worked" });
        this.showFeedback("engagement", "", "", "Your prediction");
        return;
      }
      const correct = ["correct", "correct_after_support", "fresh_correct"].includes(mode) || this.state.exit.responses[current.questionId]?.correct === true;
      const worked = this.state.workedRevealed[current.questionId] === true;
      window.RevilyVisuals.render(this.elements.canvas, current.visual, { spec: this.spec, question: current.question, narration: current.narration, feedback: worked ? "worked" : (correct ? "correct" : "initial") });
      this.showFeedback(correct ? "correct" : "support", adapter.visibleFeedback(current.question, this.lastResponse(current.questionId), correct), worked ? (current.question.scripts?.worked_explanation || "") : "", "Your result");
    }
  }

  window.RevilyLessonEngine.LessonEngine = Fra27LessonEngine;
  window.RevilyFra27Engine = { LessonEngine: Fra27LessonEngine };
})();
