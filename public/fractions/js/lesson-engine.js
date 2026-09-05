(function () {
  "use strict";

  const { buildLessonModel, normalisePhase } = window.RevilyLessonModel;
  const { serialiseResponse, validate } = window.RevilyValidators;
  const { escapeHtml, mathMarkup, modelChoiceMarkup, render: renderVisual } = window.RevilyVisuals;
  const { NarrationSync } = window.RevilyNarrationSync;
  const STATE_VERSION = 1;
  const MAX_EVENTS = 400;

  class LessonEngine {
    constructor(root, spec, dialogueProfile, callbacks) {
      this.root = root;
      this.spec = spec;
      this.dialogue = dialogueProfile || { reaction_bank: [] };
      this.callbacks = callbacks || {};
      const registeredTopic = window.RevilyTopics?.all?.find((topic) => new RegExp(topic.skillIdPattern, "i").test(spec.identity.id));
      this.topic = callbacks?.topic || registeredTopic || {
        id: String(spec.identity.id || "skill").split("-")[0].toLowerCase(),
        title: spec.identity.cluster || "Topic",
        storageNamespace: String(spec.identity.id || "skill").split("-")[0].toLowerCase()
      };
      this.model = buildLessonModel(spec);
      this.storageKey = `revily.${this.topic.storageNamespace || this.topic.id}.${spec.identity.id}.current.v1`;
      this.historyKey = `revily.${this.topic.storageNamespace || this.topic.id}.${spec.identity.id}.history.v1`;
      this.state = this.loadState();
      this.fra11DirectResumeAtI1 = this.state.cursor === "I1" && this.state.lastViewed === "I1";
      this.activeNarration = null;
      this.narrationTimer = 0;
      this.advanceTimer = 0;
      this.utterance = null;
      this.audio = null;
      this.preloadedNarrationAudio = new Map();
      this.audioSyncFrame = 0;
      this.lastNarration = null;
      this.captionHideTimer = 0;
      this.narrationAssets = callbacks?.narrationAssets || window.RevilyNarrationAssets?.tracks || {};
      this.narrationPlayback = spec.voice_and_script?.narration_playback || {};
      this.captionPresentation = spec.voice_and_script?.caption_presentation || {};
      this.progressiveCaptions = this.captionPresentation.mode === "on_canvas_progressive";
      this.speechSynthesis = Object.prototype.hasOwnProperty.call(callbacks || {}, "speechSynthesis")
        ? callbacks.speechSynthesis
        : window.speechSynthesis;
      this.createUtterance = callbacks?.createUtterance || ((text) => new window.SpeechSynthesisUtterance(text));
      this.createAudio = callbacks?.createAudio || ((source) => {
        const audio = document.createElement("audio");
        audio.src = source;
        return audio;
      });
      this.renderToken = 0;
      this.developerMode = new URLSearchParams(window.location.search).get("dev") === "1";
      const developerPhase = this.developerMode ? new URLSearchParams(window.location.search).get("phase") : null;
      const developerStart = developerPhase ? this.model.phaseStarts.get(developerPhase) : null;
      if (developerStart) {
        this.state = this.freshState();
        this.state.started = true;
        this.state.cursor = developerStart;
        this.state.soundOn = false;
      }
      this.suppressNodeNarration = false;
      this.narrationSync = new NarrationSync({
        onCaption: (state) => this.updateProgressiveCaption(state),
        onCue: (cue) => this.applyNarrationCue(cue),
        onComplete: () => this.completeProgressiveCaption()
      });
      this.boundVisibility = () => {
        if (document.hidden) this.stopNarration(false);
      };
    }

    mount() {
      document.addEventListener("visibilitychange", this.boundVisibility);
      this.render();
    }

    destroy() {
      this.stopNarration(false);
      this.preloadedNarrationAudio.forEach((audio) => {
        if (typeof audio.pause === "function") audio.pause();
      });
      this.preloadedNarrationAudio.clear();
      document.removeEventListener("visibilitychange", this.boundVisibility);
      this.persist();
    }

    freshState() {
      return {
        version: STATE_VERSION,
        contentVersion: this.spec.canonical_lesson?.version || null,
        topicId: this.topic.id,
        skillId: this.spec.identity.id,
        attemptId: createId(),
        started: false,
        openingPlayed: false,
        status: "LEARNING",
        cursor: this.model.firstId,
        trail: [],
        attempts: {},
        submissions: {},
        drafts: {},
        engagementResponses: {},
        resolved: {},
        feedback: {},
        workedRevealed: {},
        narrationResume: null,
        contentMigration: null,
        pendingRecovery: null,
        evidence: {
          firstAttemptCorrect: {},
          misconceptions: {},
          errorFamily: {},
          candidateErrorFamily: {},
          hintOpened: {},
          hintOpenedBeforeSubmit: {},
          supportEscalated: {},
          pendingNoHintConfirmations: [],
          freshConfirmationPassed: {},
          factorStageFirstAttemptCorrect: {},
          responseStageFirstAttemptCorrect: {},
          componentFirstAttemptCorrect: {},
          factorInvalid: {},
          answerLocked: {},
          answerValueCorrect: {},
          answerFormCorrect: {},
          countsAsFreshEvidence: {},
          freshnessSignature: {},
          errorConfidence: {},
          repairCyclesUsed: {},
          noHintNonUnitSuccesses: [],
          canonicalSignature: {},
          route: []
        },
        exit: { responses: {}, result: null, confirmationId: null, primaryScore: null, missedPrimaryIds: [], remediation: null },
        freshContext: null,
        seenConfirmations: [],
        reactionHistory: { ids: [], texts: [], leadFamilies: [] },
        practiceStreak: 0,
        soundOn: true,
        developerOpen: false,
        events: [],
        lastViewed: null,
        lastPhase: null
      };
    }

    loadState() {
      const fresh = this.freshState();
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || "null");
        if (!saved || saved.version !== STATE_VERSION || saved.skillId !== this.spec.identity.id) return fresh;
        if (saved.topicId && saved.topicId !== this.topic.id) return fresh;
        if (fresh.contentVersion && saved.contentVersion !== fresh.contentVersion) {
          if (this.spec.identity.id === "FRA-05" && fresh.contentVersion === "FRA05-2.0") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.contentMigration = { from: saved.contentVersion || "FRA05-1.0", to: fresh.contentVersion, resetTo: fresh.cursor };
          } else if (this.spec.identity.id === "FRA-06" && fresh.contentVersion === "fra06-handoff-v1-runtime-copy-1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = { from: saved.contentVersion || "legacy-fra06-yaml", to: fresh.contentVersion, resetTo: "HOOK", preserved: ["soundOn", "developerOpen"] };
          } else if (this.spec.identity.id === "FRA-07" && fresh.contentVersion === "fra07-recognise-equivalent-fractions-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra07-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous attempt status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({ attemptId: saved.attemptId || null, status: saved.status || "LEARNING", archivedAt: new Date().toISOString(), reason: "content_version_migration", fromContentVersion: saved.contentVersion || "legacy-fra07-yaml", toContentVersion: fresh.contentVersion, lastCursor: saved.cursor || null });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch { /* The fresh attempt remains safe if history storage is unavailable. */ }
          } else if (this.spec.identity.id === "FRA-08" && fresh.contentVersion === "fra08-equivalent-fractions-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra08-pilot",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              preserved: ["soundOn"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "cues", "narrationResume", "recovery", "exit"]
            };
          } else if (this.spec.identity.id === "FRA-09" && fresh.contentVersion === "fra09-canonical-handoff-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra09-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "previous attempt status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra09-yaml",
                  toContentVersion: fresh.contentVersion,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // Resetting incompatible state is still safe if history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-11" && fresh.contentVersion === "fra11-canonical-handoff-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra11-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "previous attempt status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra11-yaml",
                  toContentVersion: fresh.contentVersion,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch {
              // Resetting incompatible state is still safe if history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-10" && fresh.contentVersion === "fra10-simplest-form-handoff-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            const previouslyComplete = ["SECURE", "COMPLETE", "COMPLETED"].includes(saved.status)
              || (saved.cursor === "COMPLETE" && saved.exit?.result === "SECURE");
            if (previouslyComplete) {
              fresh.status = "SECURE";
              fresh.cursor = "COMPLETE";
              fresh.started = true;
              fresh.exit.result = "SECURE";
            }
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra10-yaml",
              to: fresh.contentVersion,
              resetTo: previouslyComplete ? "COMPLETE" : "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: previouslyComplete ? ["completion", "soundOn", "developerOpen"] : ["soundOn", "developerOpen", "previous attempt status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra10-yaml",
                  toContentVersion: fresh.contentVersion,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // Resetting incompatible state is still safe if history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-12" && fresh.contentVersion === "fra12-owner-approved-handoff-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra12-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous attempt status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra12-yaml",
                  toContentVersion: fresh.contentVersion,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // The canonical FRA12 attempt can still start if history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-13" && fresh.contentVersion === "fra13-fraction-of-amount-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra13-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous attempt status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra13-yaml",
                  toContentVersion: fresh.contentVersion,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // The new canonical FRA13 attempt can still start if history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-14" && fresh.contentVersion === "FRA14-HANDOFF-V1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra14-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra14-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // The canonical FRA14 attempt can still start if history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-15" && fresh.contentVersion === "fra15-quantity-as-fraction-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra15-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra15-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA15 still resets coherently if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-16" && fresh.contentVersion === "fra16-runtime-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra16-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra16-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA16 still resets coherently if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-17" && fresh.contentVersion === "fra17-same-denominator-addition-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra17-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra17-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA-17 still resets coherently if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-21" && fresh.contentVersion === "FRA21-HANDOFF-V1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra21-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit", "freshness evidence"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra21-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA-21 still resets coherently if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-22" && fresh.contentVersion === "fra22-unlike-denominator-subtraction-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra22-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit", "freshness evidence"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra22-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  pathwayOrigin: saved.cursor || null
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA22 still resets coherently if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-26" && fresh.contentVersion === "fra26-handoff-v1-runtime-copy-1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra26-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous attempt status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              if (!history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration")) {
                history.push({ attemptId: saved.attemptId || null, status: saved.status || "LEARNING", archivedAt: new Date().toISOString(), reason: "content_version_migration", fromContentVersion: saved.contentVersion || "legacy-fra26-yaml", toContentVersion: fresh.contentVersion, submissions: saved.submissions || {} });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA-26 can still reset safely if history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-28" && fresh.contentVersion === "FRA28-HANDOFF-V1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = { from: saved.contentVersion || "legacy-fra28-yaml", to: fresh.contentVersion, resetTo: "HOOK", previousAttemptId: saved.attemptId || null, previousStatus: saved.status || null, preserved: ["soundOn", "developerOpen", "previous completion status in history"], cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"] };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              if (!history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration")) {
                history.push({ attemptId: saved.attemptId || null, status: saved.status || "LEARNING", archivedAt: new Date().toISOString(), reason: "content_version_migration", fromContentVersion: saved.contentVersion || "legacy-fra28-yaml", toContentVersion: fresh.contentVersion, completionResult: saved.exit?.result || null, submissions: saved.submissions || {} });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch {
              // FRA-28 can still reset safely if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-24" && fresh.contentVersion === "fra24-canonical-handoff-v1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra24-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra24-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA24 still resets coherently if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-23" && fresh.contentVersion === "fra23-codex-handoff-v1-runtime-copy-1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra23-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra23-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA23 still resets coherently if attempt history storage is unavailable.
            }
          } else if (this.spec.identity.id === "FRA-20" && fresh.contentVersion === "fra20-handoff-v1-runtime-1") {
            fresh.soundOn = saved.soundOn !== false;
            fresh.developerOpen = saved.developerOpen === true;
            fresh.contentMigration = {
              from: saved.contentVersion || "legacy-fra20-yaml",
              to: fresh.contentVersion,
              resetTo: "HOOK",
              previousAttemptId: saved.attemptId || null,
              previousStatus: saved.status || null,
              preserved: ["soundOn", "developerOpen", "previous completion status in history"],
              cleared: ["cursor", "drafts", "submissions", "resolved", "answerLocks", "hints", "captions", "cues", "narrationResume", "recovery", "exit"]
            };
            try {
              const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
              const alreadyArchived = history.some((entry) => entry?.attemptId === saved.attemptId && entry?.reason === "content_version_migration");
              if (!alreadyArchived) {
                history.push({
                  attemptId: saved.attemptId || null,
                  status: saved.status || "LEARNING",
                  archivedAt: new Date().toISOString(),
                  reason: "content_version_migration",
                  fromContentVersion: saved.contentVersion || "legacy-fra20-yaml",
                  toContentVersion: fresh.contentVersion,
                  completionResult: saved.exit?.result || null,
                  submissions: saved.submissions || {}
                });
                localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
              }
            } catch (_historyError) {
              // FRA20 still resets coherently if attempt history storage is unavailable.
            }
          }
          return fresh;
        }
        return Object.assign(fresh, saved, {
          topicId: this.topic.id,
          exit: Object.assign(fresh.exit, saved.exit || {}),
          evidence: Object.assign(fresh.evidence, saved.evidence || {}),
          reactionHistory: Object.assign(fresh.reactionHistory, saved.reactionHistory || {}),
          workedRevealed: Object.assign(fresh.workedRevealed, saved.workedRevealed || {})
        });
      } catch (_error) {
        return fresh;
      }
    }

    persist() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch (_error) {
        this.showToast("Progress could not be saved on this device.");
      }
    }

    emit(name, payload) {
      this.state.events.push({
        name,
        at: new Date().toISOString(),
        attempt_id: this.state.attemptId,
        topic_id: this.topic.id,
        skill_id: this.spec.identity.id,
        ...(payload || {})
      });
      if (this.state.events.length > MAX_EVENTS) this.state.events = this.state.events.slice(-MAX_EVENTS);
      this.persist();
    }

    current() {
      if (this.state.cursor === "COMPLETE") {
        return { id: "COMPLETE", phase: "completion", kind: "completion", result: this.state.exit.result || "NEEDS_WORK" };
      }
      if (this.state.cursor.startsWith("RECOVERY:")) {
        const questionId = this.state.cursor.slice("RECOVERY:".length);
        const question = this.model.getQuestion(questionId);
        const origin = this.state.pendingRecovery ? this.model.getNode(this.state.pendingRecovery.originId) : null;
        return {
          id: this.state.cursor,
          phase: this.isFra10V1() || this.state.pendingRecovery?.exitRemediation ? "repair" : (origin?.phase || normalisePhase(question?.stage || "teaching")),
          kind: question?.policy?.reteachOnly ? "scene" : "question",
          questionId,
          question,
          recovery: true,
          exitRepair: Boolean(this.state.pendingRecovery?.exitRemediation),
          purpose: question?.target,
          displayTitle: question?.prompt || question?.target || "Quick repair",
          narration: question?.scripts?.reteach?.length
            ? (this.isRegistryRuntimeLesson() ? uniqueLines(question.scripts.reteach) : uniqueLines(question.scripts.reteach).join(" "))
            : "",
          visual: this.model.visualForQuestion(question, question?.prompt)
        };
      }
      if (this.state.cursor.startsWith("FRESH:")) {
        const questionId = this.state.cursor.slice("FRESH:".length);
        if (this.isFra11V1() && questionId.includes("-GENERATED-R") && !this.model.getQuestion(questionId)) {
          window.RevilyFra11Canonical.ensureGeneratedQuestion(this, questionId, Number(questionId.match(/R(\d+)$/)?.[1] || 1));
        }
        const question = this.model.getQuestion(questionId);
        return {
          id: this.state.cursor,
          phase: this.state.freshContext?.exitRemediation ? "exit" : "independent",
          kind: "question",
          questionId,
          question,
          fresh: true,
          exit: Boolean(this.state.freshContext?.exitRemediation),
          purpose: question?.target,
          narration: this.state.freshContext?.introNarration || "",
          visual: this.model.visualForQuestion(question, question?.prompt)
        };
      }
      if (this.state.cursor.startsWith("CONFIRM:")) {
        const questionId = this.state.cursor.slice("CONFIRM:".length);
        const question = this.model.getQuestion(questionId);
        return {
          id: this.state.cursor,
          phase: "exit",
          kind: "question",
          questionId,
          question,
          confirmation: true,
          exit: true,
          purpose: question?.target,
          narration: "",
          visual: this.model.visualForQuestion(question, question?.prompt)
        };
      }
      return this.model.getNode(this.state.cursor);
    }

    render() {
      this.renderToken += 1;
      const token = this.renderToken;
      this.stopNarration(false);
      const current = this.current();
      if (!current) {
        this.state.cursor = this.model.firstId;
        this.persist();
        return this.render();
      }
      if (current.kind === "completion") return this.renderCompletion(current);

      const progress = this.progressFor(current);
      const progressiveClass = this.progressiveCaptions ? " progressive-caption-lesson" : "";
      this.root.setAttribute("aria-busy", "false");
      this.root.innerHTML = `
        <div class="app-shell lesson-shell${progressiveClass}">
          <header class="topbar">
            <button class="brand-button" id="brand-home" type="button" aria-label="Back to ${escapeHtml(this.topic.title)}">
              <span class="brand-mark" aria-hidden="true">R</span>
              <span><small>Revily ${escapeHtml(this.topic.title)}</small><strong>${escapeHtml(this.spec.identity.title)}</strong></span>
            </button>
            <div class="topbar-actions">
              <button class="quiet-button" id="sound-toggle" type="button" aria-label="${this.state.soundOn ? "Sound on" : "Sound off"}" aria-pressed="${this.state.soundOn}">
                <span aria-hidden="true">${this.state.soundOn ? "◖" : "○"}</span><span>${this.state.soundOn ? "Sound on" : "Sound off"}</span>
              </button>
              <button class="quiet-button" id="start-again" type="button" aria-label="Start again"><span aria-hidden="true">↻</span><span>Start again</span></button>
            </div>
          </header>
          <div class="lesson-progress" aria-label="Progress through this lesson">
            <div><strong>${escapeHtml(this.model.phaseLabel(current.phase))}</strong><span>${progress.label}</span></div>
            <div class="progress-track" aria-hidden="true"><i style="width:${progress.percent}%"></i></div>
          </div>
          <main id="main-content" class="lesson-main" tabindex="-1">
            <article class="lesson-card">
              <div class="teaching-surface${this.progressiveCaptions ? " has-canvas-captions" : ""}">
                <div id="math-canvas" class="math-canvas"></div>
                ${this.progressiveCaptions ? `
                  <section class="canvas-caption-layer${this.isFra05V2() ? " fra05-caption-layer" : ""}" id="ryan-panel" aria-label="Ryan's narration" hidden>
                    <strong class="visually-hidden" id="ryan-status">Ryan</strong>
                    <p class="canvas-caption" id="ryan-caption" aria-hidden="true"></p>
                    <p class="visually-hidden" id="ryan-caption-accessible" aria-live="polite"></p>
                    <div class="narration-controls canvas-narration-controls" aria-label="Narration controls">
                      <button type="button" id="replay-narration">Replay</button>
                      <button type="button" id="skip-narration">Skip</button>
                    </div>
                  </section>` : `
                  <section class="ryan-panel" id="ryan-panel" aria-label="Ryan's narration" hidden>
                    <div class="ryan-identity"><span class="ryan-avatar" aria-hidden="true">R</span><strong id="ryan-status">Ryan</strong></div>
                    <p id="ryan-caption"></p>
                    <div class="narration-controls">
                      <button type="button" id="replay-narration">Replay</button>
                      <button type="button" id="skip-narration">Skip</button>
                    </div>
                  </section>`}
              </div>
              <section class="interaction" id="interaction"></section>
              <footer class="lesson-footer">
                <button class="secondary-button" id="lesson-back" type="button">Back</button>
                <span></span>
                <button class="primary-button" id="primary-action" type="button">Continue</button>
              </footer>
            </article>
          </main>
          ${this.developerMarkup(current)}
          <div class="toast" id="toast" role="status" aria-live="polite"></div>
          <dialog class="restart-dialog" id="restart-dialog" aria-labelledby="restart-title"><form method="dialog"><span class="eyebrow">Start again</span><h2 id="restart-title">Reset this lesson attempt?</h2><p>Your earlier completion history will stay saved.</p><div><button class="secondary-button" id="cancel-restart" value="cancel">Cancel</button><button class="primary-button" id="confirm-restart" value="confirm">Start again</button></div></form></dialog>
        </div>`;

      this.elements = {
        canvas: this.root.querySelector("#math-canvas"),
        interaction: this.root.querySelector("#interaction"),
        ryan: this.root.querySelector("#ryan-panel"),
        caption: this.root.querySelector("#ryan-caption"),
        captionAccessible: this.root.querySelector("#ryan-caption-accessible"),
        ryanStatus: this.root.querySelector("#ryan-status"),
        replay: this.root.querySelector("#replay-narration"),
        skip: this.root.querySelector("#skip-narration"),
        primary: this.root.querySelector("#primary-action"),
        back: this.root.querySelector("#lesson-back"),
        toast: this.root.querySelector("#toast")
      };
      this.bindShellEvents(current);
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question: current.question, narration: current.narration, feedback: this.state.feedback[current.questionId] || "initial", response: this.lastResponse(current.questionId) });

      if (this.narrationPlayback.mode === "authored_audio_then_browser_speech") {
        const spokenScripts = Object.entries(current.question?.scripts || {})
          .filter(([key]) => !["worked_explanation", "response_feedback"].includes(key))
          .flatMap(([, value]) => Array.isArray(value) ? value : [value]);
        this.primeNarrationAssets([current.narration, ...spokenScripts]);
        this.primeUpcomingFra05Narration(current);
      }

      if (current.kind === "question") this.renderQuestion(current);
      else this.renderScene(current);

      if (this.state.lastViewed !== current.id) {
        this.emit("step_viewed", { step_id: current.questionId || current.id, phase: current.phase });
        this.state.lastViewed = current.id;
      }
      if (this.state.lastPhase !== current.phase) {
        if (this.state.lastPhase) this.emit("phase_completed", { phase: this.state.lastPhase });
        this.state.lastPhase = current.phase;
      }
      this.persist();

      if (token !== this.renderToken || this.suppressNodeNarration) {
        this.suppressNodeNarration = false;
        return;
      }
      if (this.resumeFra05Narration?.(current)) return;
      if (current.id === this.model.firstId && !this.state.started) {
        this.hideRyan();
        this.elements.primary.textContent = current.source?.learner_action?.button || "Start lesson";
      } else if (this.shouldStartNodeNarration(current)) {
        this.startNarration(
          this.narrationLinesFor(current),
          current.kind === "scene" ? () => this.advance(current) : null,
          { resumeAction: current.kind === "scene" ? "advance_current" : null }
        );
      }
    }

    shouldStartNodeNarration(current) {
      if (!current?.narration) return false;
      if (current.questionId && (this.state.resolved[current.questionId] || this.state.exit.responses[current.questionId])) return false;
      if (this.isFra13V1() && current.questionId
        && (this.state.feedback[current.questionId] || this.state.evidence.hintOpened[current.questionId])) return false;
      return true;
    }

    bindShellEvents(current) {
      this.root.querySelector("#brand-home").addEventListener("click", () => this.goHome());
      this.root.querySelector("#sound-toggle").addEventListener("click", () => this.toggleSound());
      this.root.querySelector("#start-again").addEventListener("click", () => this.openRestartDialog());
      this.root.querySelector("#confirm-restart").addEventListener("click", (event) => {
        event.preventDefault();
        this.startAgain();
      });
      this.root.querySelector("#developer-toggle")?.addEventListener("click", () => this.toggleDeveloper());
      this.root.querySelectorAll("[data-dev-phase]").forEach((button) => {
        button.addEventListener("click", () => this.jumpToPhase(button.dataset.devPhase));
      });
      this.elements.back.addEventListener("click", () => this.goBack());
      this.elements.primary.addEventListener("click", () => this.handlePrimary(current));
      this.elements.replay.addEventListener("click", () => this.replayNarration());
      this.elements.skip.addEventListener("click", () => this.skipNarration());
      this.elements.back.disabled = !this.state.trail.length;
      this.elements.back.hidden = current.phase === "exit";
      if (current.exitRepair) this.elements.back.hidden = true;
    }

    renderScene(current) {
      const heading = current.displayTitle || (current.id === this.model.firstId && !this.state.started
        ? openingHeading(this.topic, this.spec)
        : sceneHeading(current));
      this.elements.interaction.innerHTML = `<div class="scene-copy"><span class="eyebrow">${escapeHtml(this.model.phaseLabel(current.phase))}</span><h1>${escapeHtml(heading)}</h1></div>`;
      this.elements.primary.textContent = current.id === this.model.firstId && !this.state.started
        ? (current.source?.learner_action?.button || "Start lesson")
        : (current.source?.learner_action?.button || "Continue");
      this.elements.primary.disabled = false;
    }

    developerMarkup(current) {
      if (!this.developerMode) return "";
      return `<button class="developer-toggle" id="developer-toggle" type="button" aria-expanded="${this.state.developerOpen}" aria-label="Developer details">{ }</button>
        <aside class="developer-panel" id="developer-panel" ${this.state.developerOpen ? "" : "hidden"}>
          <strong>Development</strong>
          <dl><div><dt>Skill</dt><dd>${escapeHtml(this.spec.identity.id)}</dd></div><div><dt>Phase</dt><dd>${escapeHtml(current.phase)}</dd></div><div><dt>Scene / question</dt><dd>${escapeHtml(current.questionId || current.id)}</dd></div></dl>
          <div class="developer-actions" aria-label="Jump to lesson phase"><button type="button" data-dev-phase="teaching">Teaching</button><button type="button" data-dev-phase="guided">Guided</button><button type="button" data-dev-phase="independent">Independent</button><button type="button" data-dev-phase="practice">Practice</button><button type="button" data-dev-phase="exit">Exit</button></div>
        </aside>`;
    }

    questionTextMarkup(question, text) {
      return question.prompt_math_layout === 'symbolic_compound_fraction'
        ? window.RevilyPercentageChangeStructure.symbolicMath(text)
        : mathMarkup(text);
    }

    renderQuestion(current) {
      const question = current.question;
      const resolved = Boolean(this.state.resolved[current.questionId]);
      const exitSaved = Boolean(this.state.exit.responses[current.questionId]);
      const locked = resolved || exitSaved;
      const saved = this.lastResponse(current.questionId) ?? this.state.drafts[current.questionId] ?? null;
      this.elements.interaction.innerHTML = `
        <div class="question-header"><span class="eyebrow">${escapeHtml(this.model.phaseLabel(current.phase))}</span><h1 id="question-prompt">${this.questionTextMarkup(question, question.prompt)}</h1>${question.questionDetail ? `<p class="question-detail">${this.questionTextMarkup(question, question.questionDetail)}</p>` : ""}</div>
        <form id="answer-form" class="answer-form" aria-labelledby="question-prompt" novalidate>
          ${this.inputMarkup(question, saved, locked)}
          ${this.hintMarkup(question, current, locked)}
          <div id="feedback-slot" class="feedback-slot" aria-live="polite"></div>
          <button type="submit" class="visually-hidden">${escapeHtml(question.attempt_policy?.submit_label || "Check answer")}</button>
        </form>`;
      const form = this.root.querySelector("#answer-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.handlePrimary(current);
      });
      this.bindInputEvents(question, locked);
      if (question.response.type === "tick_selector" && saved !== null && saved !== undefined && saved !== "") {
        window.RevilyFra05Visuals?.updateSelectedTick?.(this.elements.canvas, Number(saved));
      }
      if (question.response.type === "fra17_cell_tap_integer" && saved && typeof saved === "object") {
        const tapped = new Set((saved.tapped || []).map(String));
        this.elements.canvas.querySelectorAll("[data-fra17-cell]").forEach((cell) => {
          const selected = tapped.has(String(cell.dataset.fra17Cell));
          cell.setAttribute("aria-pressed", String(selected));
          cell.classList.toggle("is-tapped", selected);
        });
        const status = this.elements.canvas.querySelector(".fra17-tap-status");
        if (status) status.textContent = `${tapped.size} selected cell${tapped.size === 1 ? "" : "s"} tapped`;
      }
      if (question.response.type === "fra20_cell_tap_integer" && saved && typeof saved === "object") {
        const tapped = new Set((saved.tapped || []).map(String));
        this.elements.canvas.querySelectorAll("[data-fra20-cell]").forEach((cell) => {
          const selected = tapped.has(String(cell.dataset.fra20Cell));
          cell.setAttribute("aria-pressed", String(selected));
          cell.classList.toggle("is-tapped", selected);
        });
        const status = this.elements.canvas.querySelector(".fra20-tap-status");
        if (status) status.textContent = `${tapped.size} section${tapped.size === 1 ? "" : "s"} tapped`;
      }
      this.bindHintEvents(question, current, locked);
      this.elements.primary.textContent = locked ? "Continue" : question.attempt_policy?.submit_label || this.spec.experience_contract.global_ui_copy.submit;
      const currentResponse = locked ? null : this.readResponse(question);
      const submitDisabled = locked ? false : currentResponse === null || this.fra08RetryResponseUnchanged(question, currentResponse);
      this.elements.primary.disabled = submitDisabled;
      form.querySelector('button[type="submit"]')?.toggleAttribute("disabled", submitDisabled);
      if (resolved && current.fresh && this.isRegistryRuntimeLesson()) {
        const correct = this.state.freshContext?.correct === true;
        if (question.policy?.solutionPolicy === "after_locked_submit") this.showSavedExitResponse(current, correct, false);
        else this.showFeedback(correct ? "correct" : "hint", this.finalCheckLead(current, correct), "", "Your result");
      } else if (resolved && current.fresh) {
        const correct = this.state.freshContext?.correct === true;
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        const lead = this.finalCheckLead(current, correct);
        this.showFeedback(correct ? "correct" : "support", lead, question.scripts?.worked_explanation || this.workedSummary(question));
      } else if (resolved) this.restoreResolvedFeedback(current);
      else if (exitSaved) this.showSavedExitResponse(current, this.state.exit.responses[current.questionId]?.correct, false);
      else if (this.state.feedback[current.questionId] === "first_incorrect") this.restoreFirstHint(current);
      else if (this.state.feedback[current.questionId] === "support") {
        const family = this.state.evidence.errorFamily[current.questionId] || question.primaryErrorFamily || "unknown";
        this.showFeedback("support", this.targetedFeedback(question, this.lastResponse(current.questionId), family), question.scripts?.on_incorrect_attempt_2 || question.mathematical_support?.hint_1 || "Try the corrected idea in the open field.");
      }
      window.setTimeout(() => {
        if (!locked && current.phase !== "exit") {
          const firstControl = form.querySelector("input:not([type=hidden]), select, button.tick-selector-slider, button.choice-card, button.multi-choice-card, button.set-builder-token, button.order-option, button.fra16-order-card");
          firstControl?.focus(this.spec.canonical_lesson?.reference_for_future_lessons || this.spec.experience_contract?.refinement_profile === "source_aligned_v1" ? { preventScroll: true } : undefined);
        }
      }, 80);
    }

    inputMarkup(question, saved, locked) {
      const disabled = locked ? " disabled" : "";
      const type = question.response.type;
      const savedObject = saved && typeof saved === "object" ? saved : {};
      if (this.isFra10V1() && ["factor_route_builder", "factor_choice_then_fraction", "choice_then_fraction", "sort_then_factor", "arithmetic_check"].includes(type)) {
        return window.RevilyFra10Adapter.inputMarkup(question, saved, locked);
      }
      if (this.isFra26V1() && ["fra26_matching", "fra26_tile_placement", "fra26_staged_integer"].includes(type)) {
        return window.RevilyFra26Canonical.inputMarkup(question, saved, locked);
      }
      if (this.isFra28V1() && window.RevilyFra28Canonical.structuredTypes.has(type)) return window.RevilyFra28Canonical.inputMarkup(question, saved, locked);
      const optionMarkup = (values, selected) => `<option value="">Choose…</option>${(values || []).map((value) => `<option value="${escapeHtml(String(value))}"${String(selected ?? "") === String(value) ? " selected" : ""}>${escapeHtml(String(value).replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase()))}</option>`).join("")}`;
      if (type === "classification_sort") {
        return `<fieldset class="classification-sort-input"><legend>Choose a destination for every card</legend>${(question.response.cards || []).map((card) => `<div class="classification-sort-row"><strong>${mathMarkup(card.label)}</strong><label><span>Destination for ${escapeHtml(card.label)}</span><select data-sort-card="${escapeHtml(card.id)}" aria-label="Destination for ${escapeHtml(card.label)}"${disabled}>${optionMarkup(question.response.destinations, savedObject[card.id])}</select></label></div>`).join("")}</fieldset>`;
      }
      if (type === "classification_and_size" || type === "classification_size_validity") {
        return `<fieldset class="compound-response-input"><legend>Choose every part of the description</legend><div class="compound-response-grid"><label><span>Written form</span><select data-compound-key="classification"${disabled}>${optionMarkup(question.response.classification_options, savedObject.classification)}</select></label><label><span>Size relative to one</span><select data-compound-key="size"${disabled}>${optionMarkup(question.response.size_options, savedObject.size)}</select></label>${type === "classification_size_validity" ? `<label><span>Is it valid?</span><select data-compound-key="valid"${disabled}>${optionMarkup([true, false], savedObject.valid)}</select></label>` : ""}</div></fieldset>`;
      }
      if (type === "paired_classification") {
        const savedValues = Array.isArray(saved) ? saved : [];
        return `<fieldset class="compound-response-input"><legend>Classify both written forms</legend><div class="compound-response-grid">${(question.response.items || []).map((item, index) => `<label><span>${mathMarkup(item.label)}</span><select data-paired-index="${index}" aria-label="Classification for ${escapeHtml(item.label)}"${disabled}>${optionMarkup(question.response.classification_options, savedValues[index])}</select></label>`).join("")}</div></fieldset>`;
      }
      if (type === "fra16_equivalent_comparison") {
        const numerators = Array.isArray(savedObject.rewrittenNumerators) ? savedObject.rewrittenNumerators : ["", ""];
        const displays = question.response.fractionDisplays || ["first fraction", "second fraction"];
        const denominator = question.response.commonDenominator;
        return `<fieldset class="fra16-equivalent-input"><legend>Rewrite both fractions, then choose the comparison symbol</legend><div class="fra16-equivalent-fields">${displays.map((display, index) => `<label><span>${mathMarkup(display)} as ${denominator}ths</span><span class="fra16-fixed-fraction"><input data-fra16-equivalent-index="${index}" aria-label="${escapeHtml(question.response.inputLabels?.[index] || `Equivalent numerator for ${display}`)}" inputmode="numeric" autocomplete="off" value="${escapeHtml(numerators[index] ?? "")}"${disabled} /><i aria-hidden="true"></i><b>${denominator}</b></span></label>`).join("")}</div><label class="fra16-symbol-select"><span>Comparison symbol</span><select data-fra16-symbol aria-label="Comparison symbol"${disabled}>${optionMarkup(question.response.comparisonOptions, savedObject.symbol)}</select></label></fieldset>`;
      }
      if (type === "fra16_benchmark_comparison") {
        const relations = Array.isArray(savedObject.relations) ? savedObject.relations : ["", ""];
        const displays = question.response.fractionDisplays || ["first fraction", "second fraction"];
        return `<fieldset class="fra16-benchmark-input"><legend>Classify each fraction against one half, then compare</legend><div class="fra16-benchmark-fields">${displays.map((display, index) => `<label><span>${mathMarkup(display)}</span><select data-fra16-relation-index="${index}" aria-label="Position of ${escapeHtml(display)} relative to one half"${disabled}>${optionMarkup(question.response.relationOptions, relations[index])}</select></label>`).join("")}</div><label class="fra16-symbol-select"><span>Comparison symbol</span><select data-fra16-symbol aria-label="Comparison symbol"${disabled}>${optionMarkup(question.response.comparisonOptions, savedObject.symbol)}</select></label></fieldset>`;
      }
      if (type === "fra16_order_cards") {
        const cards = question.response.cards || [];
        const knownIds = new Set(cards.map((card) => String(card.id)));
        const savedOrder = Array.isArray(saved) && saved.length === cards.length && saved.every((id) => knownIds.has(String(id))) ? saved.map(String) : cards.map((card) => String(card.id));
        const byId = Object.fromEntries(cards.map((card) => [String(card.id), card]));
        return `<fieldset class="fra16-order-input"><legend>${question.response.direction === "greatest_to_least" ? "Order greatest to least" : "Order least to greatest"}</legend><div class="fra16-order-direction" aria-hidden="true"><span>${question.response.direction === "greatest_to_least" ? "GREATEST" : "LEAST"}</span><i></i><span>${question.response.direction === "greatest_to_least" ? "LEAST" : "GREATEST"}</span></div><div class="fra16-order-list" data-fra16-order-list role="list" aria-label="Movable fraction cards">${savedOrder.map((id, index) => {
          const card = byId[id];
          return `<div class="fra16-order-item" data-fra16-order-item data-card-id="${escapeHtml(id)}" role="listitem" draggable="${!locked}"><button class="fra16-order-card" type="button" aria-label="${escapeHtml(card.label)}, position ${index + 1} of ${savedOrder.length}. Use left and right arrows to move."${disabled}>${mathMarkup(card.label)}</button><span class="fra16-move-buttons"><button type="button" data-fra16-move="left" aria-label="Move ${escapeHtml(card.label)} left"${index === 0 || locked ? " disabled" : ""}>←</button><button type="button" data-fra16-move="right" aria-label="Move ${escapeHtml(card.label)} right"${index === savedOrder.length - 1 || locked ? " disabled" : ""}>→</button></span></div>`;
        }).join("")}</div><p class="fra16-order-status" data-fra16-order-status aria-live="polite">Current order: ${savedOrder.map((id) => byId[id].label).join(", ")}</p></fieldset>`;
      }
      if (type === "fra12_staged_fields") {
        const value = saved && typeof saved === "object" ? saved : {};
        return `<fieldset class="fra12-staged-answer"><legend>Complete the conversion in order</legend><div class="fra12-staged-fields">
          <label><span>1. Pieces in the wholes</span><input id="fra12-whole-piece-total" aria-label="Pieces in the wholes" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.wholePieceTotal ?? "")}"${disabled} /></label>
          <label><span>2. Total numerator</span><input id="fra12-total-numerator" aria-label="Total numerator after adding the extra pieces" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.totalNumerator ?? "")}"${disabled} /></label>
          <label class="fra12-final-field"><span>3. Final numerator</span><input id="fra12-final-numerator" aria-label="Final numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.finalNumerator ?? "")}"${disabled} /><b class="fra12-fixed-denominator" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b></label>
        </div></fieldset>`;
      }
      if (type === "fra17_cell_tap_integer") {
        const value = saved && typeof saved === "object" ? saved : { numerator: "", tapped: [] };
        return `<fieldset class="fra17-tap-answer"><legend>Tap the patterned cells, then complete the fraction</legend><div class="fixed-fraction-builder"><input id="integer-answer" aria-label="Selected-cell numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.numerator ?? "")}"${disabled} /><i aria-hidden="true"></i><b class="fixed-fraction-value" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b></div><p>The cell buttons are in the strip model above. Empty cells do not count.</p></fieldset>`;
      }
      if (type === "fra20_cell_tap_integer") {
        const value = saved && typeof saved === "object" ? saved : { numerator: "", tapped: [] };
        return `<fieldset class="fra20-tap-answer"><legend>Tap the remaining sections</legend><div class="fixed-fraction-builder"><input id="integer-answer" aria-label="Remaining-section numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.numerator ?? "")}" readonly${disabled} /><i aria-hidden="true"></i><b class="fixed-fraction-value" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b></div><p>Use the section buttons in the model above. Each section can be selected once.</p></fieldset>`;
      }
      if (type === "fra23_group_tap_fraction") {
        const value = saved && typeof saved === "object" ? saved : { numerator: "", tappedGroups: [] };
        const tapped = new Set(Array.isArray(value.tappedGroups) ? value.tappedGroups.map(String) : []);
        return `<fieldset class="fra23-supported-answer"><legend>Tap every repeated group, then complete the numerator</legend><div class="fra23-support-options" role="group" aria-label="Repeated groups">${Array.from({ length: question.response.groupCount }, (_, index) => `<button type="button" class="fra23-support-choice${tapped.has(String(index + 1)) ? " is-selected" : ""}" data-fra23-group="${index + 1}" aria-pressed="${tapped.has(String(index + 1))}"${disabled}>Group ${index + 1}: ${question.response.piecesPerGroup} pieces</button>`).join("")}</div><div class="fixed-fraction-builder"><input id="fra23-supported-numerator" aria-label="Total numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.numerator ?? "")}"${disabled} /><i aria-hidden="true"></i><b class="fixed-fraction-value" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b></div></fieldset>`;
      }
      if (type === "fra23_unit_fraction") {
        const value = saved && typeof saved === "object" ? saved : { numerator: "", unit: "" };
        return `<fieldset class="fra23-supported-answer"><legend>Choose the unchanged unit, then complete the numerator</legend><div class="fra23-support-options" role="group" aria-label="Unit pieces">${(question.response.unitOptions || []).map((unit) => `<button type="button" class="fra23-support-choice${value.unit === unit ? " is-selected" : ""}" data-fra23-unit="${escapeHtml(unit)}" aria-pressed="${value.unit === unit}"${disabled}>${escapeHtml(unit)}</button>`).join("")}</div><div class="fixed-fraction-builder"><input id="fra23-supported-numerator" aria-label="Total numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.numerator ?? "")}"${disabled} /><i aria-hidden="true"></i><b class="fixed-fraction-value" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b></div></fieldset>`;
      }
      if (type === "fra23_badge_fraction") {
        const value = saved && typeof saved === "object" ? saved : { numerator: "", placement: "" };
        const labels = { numerator: "Put 6 on the numerator", denominator: "Put 6 on the denominator", six_groups: "Use 6 as the number of groups" };
        return `<fieldset class="fra23-supported-answer"><legend>Place the integer badge by choosing its role, then complete the numerator</legend><div class="fra23-support-options" role="group" aria-label="Integer badge placement">${(question.response.placementOptions || []).map((placement) => `<button type="button" class="fra23-support-choice${value.placement === placement ? " is-selected" : ""}" data-fra23-placement="${escapeHtml(placement)}" aria-pressed="${value.placement === placement}"${disabled}>${escapeHtml(labels[placement] || placement)}</button>`).join("")}</div><div class="fixed-fraction-builder"><input id="fra23-supported-numerator" aria-label="Total numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.numerator ?? "")}"${disabled} /><i aria-hidden="true"></i><b class="fixed-fraction-value" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b></div><p>These buttons are the keyboard and touch equivalent of dragging the badge.</p></fieldset>`;
      }
      if (type === "integer") {
        if (question.response.presentation === "fraction_builder") {
          const editNumerator = question.response.editableField === "numerator";
          const numerator = editNumerator
            ? `<input id="integer-answer" aria-label="${escapeHtml(question.response.input_label || "Missing numerator")}" inputmode="numeric" autocomplete="off" value="${escapeHtml(saved ?? "")}"${disabled} />`
            : `<b class="fixed-fraction-value" aria-label="Fixed numerator ${escapeHtml(question.response.fixedNumerator)}">${escapeHtml(question.response.fixedNumerator)}</b>`;
          const denominator = editNumerator
            ? `<b class="fixed-fraction-value" aria-label="Fixed denominator ${escapeHtml(question.response.fixedDenominator)}">${escapeHtml(question.response.fixedDenominator)}</b>`
            : `<input id="integer-answer" aria-label="${escapeHtml(question.response.input_label || "Missing denominator")}" inputmode="numeric" autocomplete="off" value="${escapeHtml(saved ?? "")}"${disabled} />`;
          return `<fieldset class="fixed-fraction-answer"><legend>${escapeHtml(question.response.input_label || "Complete the fraction")}</legend><div class="fixed-fraction-builder">${numerator}<i aria-hidden="true"></i>${denominator}</div><p>Only the open field can be changed.</p></fieldset>`;
        }
        return `<label class="single-answer"><span>${escapeHtml(question.response.input_label || "Your answer")}</span><span class="unit-input">${question.response.prefix ? `<b aria-hidden="true">${escapeHtml(question.response.prefix)}</b>` : ""}<input id="integer-answer" inputmode="numeric" autocomplete="off" value="${escapeHtml(saved ?? "")}"${disabled} />${question.response.suffix ? `<b aria-hidden="true">${escapeHtml(question.response.suffix)}</b>` : ""}</span></label>`;
      }
      if (type === "two_step_integer") {
        return `<fieldset class="two-step-answer"><legend>Complete both steps</legend>${(question.response.fields || []).map((field) => `<label><span>${escapeHtml(field.label || field.id)}</span><small>${mathMarkup(field.expression || "")}</small><span class="unit-input">${field.prefix ? `<b aria-hidden="true">${escapeHtml(field.prefix)}</b>` : ""}<input data-two-step-field="${escapeHtml(field.id)}" inputmode="numeric" autocomplete="off" value="${escapeHtml(savedObject[field.id] ?? "")}"${disabled} />${field.suffix ? `<b aria-hidden="true">${escapeHtml(field.suffix)}</b>` : ""}</span></label>`).join("")}</fieldset>`;
      }
      if (type === "choice_and_integer" || type === "choice_two_step_integer") {
        const options = this.choiceOptions(question);
        const optionModels = question.response.optionModels || [];
        const selectedChoice = savedObject.choice ?? "";
        const fields = type === "choice_two_step_integer"
          ? (question.response.fields || [{ id: "onePart", label: "One equal part" }, { id: "whole", label: "Whole" }])
          : [{ id: "whole", label: question.response.valueLabel || "Whole", prefix: question.response.prefix, suffix: question.response.suffix }];
        return `<fieldset class="choice-and-integer-answer"><legend>${escapeHtml(question.response.choiceLabel || "Choose, then enter the whole")}</legend><div class="choice-grid">${options.map((option, index) => `<button class="choice-card${optionModels[index] ? " model-choice-card" : ""}${String(selectedChoice) === String(option) ? " is-selected" : ""}" type="button" data-option-index="${index}" aria-pressed="${String(selectedChoice) === String(option)}"${disabled}>${optionModels[index] ? modelChoiceMarkup(optionModels[index]) : mathMarkup(option)}</button>`).join("")}</div><input type="hidden" id="choice-answer" value="${escapeHtml(selectedChoice ? String(options.findIndex((option) => String(option) === String(selectedChoice))) : "")}" /><div class="choice-and-integer-fields">${fields.map((field) => `<label><span>${escapeHtml(field.label || field.id)}</span><span class="unit-input">${field.prefix ? `<b aria-hidden="true">${escapeHtml(field.prefix)}</b>` : ""}<input data-choice-integer-field="${escapeHtml(field.id)}" inputmode="numeric" autocomplete="off" value="${escapeHtml(savedObject[field.id] ?? "")}"${disabled} />${field.suffix ? `<b aria-hidden="true">${escapeHtml(field.suffix)}</b>` : ""}</span></label>`).join("")}</div></fieldset>`;
      }
      if (type === "quantity") {
        return `<label class="single-answer quantity-answer"><span>${escapeHtml(question.response.input_label || "Your answer")}</span><span class="unit-input"><input id="quantity-answer" inputmode="decimal" autocomplete="off" spellcheck="false" value="${escapeHtml(saved ?? "")}"${disabled} /><b aria-hidden="true">${escapeHtml(question.response.suffix || "")}</b></span></label>`;
      }
      if (type === "money") {
        return `<label class="single-answer money-answer"><span>${escapeHtml(question.response.input_label || "Amount")}</span><span class="unit-input"><b aria-hidden="true">${escapeHtml(question.response.currencyPrefix || "£")}</b><input id="money-answer" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Amount in pounds and pence" value="${escapeHtml(saved ?? "")}"${disabled} /></span><small>You can also enter the amount in pence, for example 750p.</small></label>`;
      }
      if (type === "factor_then_integer") {
        const value = saved && typeof saved === "object" ? saved : { factor: "", value: "" };
        const expectedFactor = String(question.answer?.value?.factor ?? "");
        const secondStageVisible = String(value.factor ?? "") === expectedFactor;
        return `<fieldset class="factor-then-integer-answer"><legend>First choose the factor, then complete the fraction</legend>
          <div class="factor-options" role="group" aria-label="Choose the multiplication factor">${(question.response.factorOptions || []).map((factor) => `<button class="factor-option${String(value.factor) === String(factor) ? " is-selected" : ""}" type="button" data-factor="${escapeHtml(factor)}" aria-pressed="${String(value.factor) === String(factor)}"${disabled}>× ${escapeHtml(factor)}</button>`).join("")}</div>
          <input type="hidden" id="factor-answer" value="${escapeHtml(value.factor ?? "")}" />
          <div class="factor-value-stage" id="factor-value-stage"${secondStageVisible ? "" : " hidden"}>
            <label class="single-answer"><span>${escapeHtml(question.response.input_label || "Missing value")}</span><input id="factor-value-answer" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.value ?? "")}"${disabled} /></label>
          </div>
        </fieldset>`;
      }
      if (type === "decimal") {
        return `<label class="single-answer decimal-answer"><span>${escapeHtml(question.response.input_label || "Your answer")}</span><input id="decimal-answer" inputmode="decimal" autocomplete="off" spellcheck="false" value="${escapeHtml(saved ?? "")}"${disabled} /></label>`;
      }
      if (type === "tick_selector") {
        const total = Math.max(1, Number(question.model?.denominator) * Number(question.model?.maxWhole || 1));
        const hasValue = saved !== null && saved !== undefined && saved !== "";
        const value = hasValue ? Math.max(0, Math.min(total, Number(saved))) : "";
        const valueText = hasValue ? `Boundary ${Number(value) + 1}; ${value} interval${Number(value) === 1 ? "" : "s"} from zero` : "No boundary selected";
        return `<fieldset class="tick-selector-answer"><legend>Place point P on a boundary</legend><input type="hidden" id="tick-answer" value="${escapeHtml(value)}" /><div class="tick-selector-controls"><button class="tick-nudge" id="tick-nudge-left" type="button" aria-label="Move point one boundary left"${disabled}>&minus;</button><button class="tick-selector-slider" id="tick-selector-slider" type="button" role="slider" aria-label="Selected number-line boundary" aria-valuemin="0" aria-valuemax="${total}"${hasValue ? ` aria-valuenow="${value}"` : ""} aria-valuetext="${escapeHtml(valueText)}" data-total="${total}" data-value="${escapeHtml(value)}"${disabled}><span id="tick-selector-status">${escapeHtml(valueText)}</span><small>Click or drag the line, use arrow keys, or nudge</small></button><button class="tick-nudge" id="tick-nudge-right" type="button" aria-label="Move point one boundary right"${disabled}>+</button></div></fieldset>`;
      }
      if (type === "fraction") {
        if (/^-?\d+$/.test(String(question.answer?.value ?? "").trim())) {
          return `<label class="single-answer"><span>Your answer</span><input id="fraction-whole" inputmode="numeric" autocomplete="off" value="${escapeHtml(saved ?? "")}"${disabled} /></label>`;
        }
        const value = saved && typeof saved === "object" ? saved : { n: "", d: "" };
        const partLabel = question.response.partLabel || "Numerator";
        const wholeLabel = question.response.wholeLabel || "Denominator";
        if (question.response.presentation === "guided_builder") {
          return `<fieldset class="fraction-answer guided-fraction-builder"><legend>Build the fraction from the cake</legend><div class="guided-builder-steps"><label><b>1</b><span>Equal slices in the whole</span><input id="fraction-d" aria-label="${escapeHtml(wholeLabel)}" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.d ?? "")}"${disabled} /></label><i aria-hidden="true">→</i><label><b>2</b><span>Slices with blue icing</span><input id="fraction-n" aria-label="${escapeHtml(partLabel)}" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? "")}"${disabled} /></label><i aria-hidden="true">→</i><div class="guided-built-fraction" aria-label="The fraction being built"><span id="guided-built-n">${escapeHtml(value.n || "?")}</span><i></i><span id="guided-built-d">${escapeHtml(value.d || "?")}</span></div></div></fieldset>`;
        }
        return `<fieldset class="fraction-answer"><legend>Your fraction</legend><div class="fraction-input"><input id="fraction-n" aria-label="${escapeHtml(partLabel)}" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? "")}"${disabled} /><i aria-hidden="true"></i><input id="fraction-d" aria-label="${escapeHtml(wholeLabel)}" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.d ?? "")}"${disabled} /></div></fieldset>`;
      }
      if (type === "mixed_number") {
        const value = saved && typeof saved === "object" ? saved : { whole: "", n: "", d: "" };
        const fixedDenominator = question.response.presentation === "fixed_denominator" ? question.response.fixedDenominator : null;
        const denominator = fixedDenominator === null
          ? `<input id="mixed-d" aria-label="Denominator" inputmode="numeric" value="${escapeHtml(value.d ?? "")}"${disabled} />`
          : `<b class="fixed-mixed-denominator" id="mixed-fixed-d" data-value="${escapeHtml(fixedDenominator)}" aria-label="Fixed denominator ${escapeHtml(fixedDenominator)}">${escapeHtml(fixedDenominator)}</b>`;
        return `<fieldset class="mixed-answer${fixedDenominator === null ? "" : " fixed-denominator-mixed"}"><legend>Your mixed number</legend><label><span>Wholes</span><input id="mixed-whole" aria-label="Whole number" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.whole ?? "")}"${disabled} /></label><div class="fraction-input"><input id="mixed-n" aria-label="Fractional numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? "")}"${disabled} /><i aria-hidden="true"></i>${denominator}</div></fieldset>`;
      }
      if (type === "division_then_mixed") {
        const value = saved && typeof saved === "object" ? saved : { quotient: "", remainder: "", whole: "", n: "" };
        const fixedDenominator = Number(question.response.fixedDenominator);
        return `<fieldset class="division-then-mixed-answer"><legend>Complete the linked division and mixed number</legend>
          <div class="division-result-fields" aria-label="Division result">
            <label><span>Quotient</span><input data-division-mixed-field="quotient" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.quotient ?? "")}"${disabled} /></label>
            <label><span>Remainder</span><input data-division-mixed-field="remainder" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.remainder ?? "")}"${disabled} /></label>
          </div>
          <div class="linked-response-arrow" aria-hidden="true">↓</div>
          <div class="linked-mixed-fields" aria-label="Mixed-number result">
            <label><span>Whole number</span><input data-division-mixed-field="whole" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.whole ?? "")}"${disabled} /></label>
            <div class="fraction-input"><input data-division-mixed-field="n" aria-label="Fractional numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? "")}"${disabled} /><i aria-hidden="true"></i><b class="fixed-mixed-denominator" data-value="${escapeHtml(fixedDenominator)}" aria-label="Fixed denominator ${escapeHtml(fixedDenominator)}">${escapeHtml(fixedDenominator)}</b></div>
          </div>
          <p class="linked-field-note">Both rows describe the same division.</p>
        </fieldset>`;
      }
      if (type === "multiple_choice") {
        const options = this.choiceOptions(question);
        const optionModels = question.response.optionModels || [];
        const selected = new Set(Array.isArray(saved) ? saved.map(String) : []);
        return `<fieldset class="choice-answer model-choice-answer multiple-choice-answer"><legend>Select every answer that works</legend><div class="choice-grid">${options.map((option, index) => `<button class="multi-choice-card${optionModels[index] ? " model-choice-card" : ""}${selected.has(String(option)) ? " is-selected" : ""}" type="button" data-option-index="${index}" data-option-value="${escapeHtml(option)}" aria-pressed="${selected.has(String(option))}"${disabled}>${optionModels[index] ? modelChoiceMarkup(optionModels[index]) : mathMarkup(option)}</button>`).join("")}</div></fieldset>`;
      }
      if (type === "set_builder") {
        const total = Math.max(1, Math.min(24, Number(question.response.totalTokens || question.model?.totalParts) || 1));
        const selected = new Set(Array.isArray(saved) ? saved.map(String) : []);
        return `<fieldset class="set-builder-answer"><legend>Select objects inside the whole set</legend><div class="set-builder-boundary" role="group" aria-label="A whole set of ${total} selectable objects">${Array.from({ length: total }, (_, index) => `<button class="set-builder-token${selected.has(String(index)) ? " is-selected" : ""}" type="button" data-token-index="${index}" aria-pressed="${selected.has(String(index))}" aria-label="Object ${index + 1}${selected.has(String(index)) ? ", selected" : ""}"${disabled}><i aria-hidden="true"></i><b aria-hidden="true">${selected.has(String(index)) ? "✓" : ""}</b></button>`).join("")}</div><p class="set-builder-count" id="set-builder-count" aria-live="polite">${selected.size} selected</p></fieldset>`;
      }
      if (type === "ordered_sequence") {
        const options = this.sequenceOptions(question);
        const selected = Array.isArray(saved) ? saved : [];
        return `<fieldset class="order-answer"><legend>Build the order from smallest to largest</legend><div class="order-result" id="order-result" aria-live="polite">${selected.map((item, index) => `<span data-value="${escapeHtml(item)}">${mathMarkup(item)}${index < selected.length - 1 ? " <" : ""}</span>`).join("") || "<em>Select the fractions in order</em>"}</div><div class="order-options">${options.map((option) => `<button class="order-option" type="button" data-value="${escapeHtml(option)}"${selected.includes(option) || locked ? " disabled" : ""}>${mathMarkup(option)}</button>`).join("")}</div><button class="reset-order" id="reset-order" type="button"${locked ? " disabled" : ""}>Reset order</button></fieldset>`;
      }
      const options = this.choiceOptions(question);
      const optionModels = question.response.optionModels || [];
      return `<fieldset class="choice-answer${optionModels.length ? " model-choice-answer" : ""}"><legend>Choose an answer</legend><div class="choice-grid">${options.map((option, index) => `<button class="choice-card${optionModels[index] ? " model-choice-card" : ""}${saved !== null && saved !== undefined && String(saved) === String(option) ? " is-selected" : ""}" type="button" data-option-index="${index}" aria-pressed="${saved !== null && saved !== undefined && String(saved) === String(option)}"${["fra17", "fra20"].includes(question.model?.context) && optionModels[index] ? ` aria-label="${escapeHtml(option)}"` : ""}${disabled}>${optionModels[index] ? modelChoiceMarkup(optionModels[index]) : mathMarkup(option)}</button>`).join("")}</div><input type="hidden" id="choice-answer" value="${escapeHtml(saved !== null && saved !== undefined ? String(options.findIndex((option) => String(option) === String(saved))) : "")}" /></fieldset>`;
    }

    hintMarkup(question, current, locked) {
      if (question?.policy?.hintPolicy !== "optional" || locked || current.exit || current.confirmation || current.fresh) return "";
      const opened = this.state.evidence.hintOpened[question.id] === true;
      const hint = question.mathematical_support?.hint_1 || question.scripts?.hint || "Start with the whole.";
      return `<section class="optional-hint"><button class="hint-toggle" id="hint-toggle" type="button" aria-expanded="${opened}">${opened ? "Hide hint" : "Ask for a hint"}</button><div class="hint-content" id="hint-content"${opened ? "" : " hidden"}><strong>A clue</strong><p>${mathMarkup(hint)}</p></div></section>`;
    }

    bindHintEvents(question, current, locked) {
      const toggle = this.root.querySelector("#hint-toggle");
      if (!toggle || locked) return;
      toggle.addEventListener("click", () => {
        const content = this.root.querySelector("#hint-content");
        const opening = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(opening));
        toggle.textContent = opening ? "Hide hint" : "Ask for a hint";
        if (content) content.hidden = !opening;
        if (opening && !this.state.evidence.hintOpened[question.id]) {
          this.state.evidence.hintOpened[question.id] = true;
          this.emit("hint_opened", { question_id: question.id, support_choice: true });
          if ((this.isFra13V1() || this.isFra15V1() || this.isFra17V1() || this.isFra20V1() || this.isFra23V1() || this.isFra24V1() || this.isFra26V1() || this.isFra28V1()) && question.policy?.requiresFreshNoHintConfirmationIfHintUsed) {
            const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[question.id];
            if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
              this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
              this.emit("fresh_confirmation_required", { origin_question_id: question.id, confirmation_question_id: confirmationId, reason: "hint_opened" });
            }
          }
          if (this.isFra11V1()) {
            const registry = this.spec.canonical_lesson?.runtime_copy || {};
            const lines = (question.runtimeHintUtteranceIds || []).map((id) => registry[id]?.text).filter(Boolean);
            this.startNarration(lines, null);
          } else if (!this.isRegistryRuntimeLesson() || this.isFra13V1() || this.isFra15V1() || this.isFra17V1() || this.isFra24V1() || this.isFra10V1()) {
            this.startNarration([question.scripts?.hint?.length ? question.scripts.hint : (question.mathematical_support?.hint_1 || "Start with the whole.")], null);
          }
        }
        this.persist();
      });
    }

    choiceOptions(question) {
      if (question.response.type === "yes_no") return question.response.display_options || ["Yes", "No"];
      return question.response.options || [];
    }

    sequenceOptions(question) {
      const afterColon = String(question.prompt).split(":").slice(1).join(":");
      const options = afterColon.split(",").map((item) => item.replace(/[.?]$/, "").trim()).filter(Boolean);
      return options.length ? options : String(question.answer.value).split("<").map((item) => item.trim());
    }

    bindInputEvents(question, locked) {
      const form = this.root.querySelector("#answer-form");
      if (locked) return;
      if (this.isFra10V1() && ["factor_route_builder", "factor_choice_then_fraction", "choice_then_fraction", "sort_then_factor", "arithmetic_check"].includes(question.response.type)) {
        window.RevilyFra10Adapter.bindInputEvents(this, question);
        return;
      }
      if (this.isFra26V1() && ["fra26_matching", "fra26_tile_placement", "fra26_staged_integer"].includes(question.response.type)) {
        window.RevilyFra26Canonical.bindInputEvents(this, question);
        return;
      }
      if (this.isFra28V1() && window.RevilyFra28Canonical.structuredTypes.has(question.response.type)) {
        window.RevilyFra28Canonical.bindInputEvents(this, question);
        return;
      }
      form.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
          const draft = this.readResponse(question, true);
          this.state.drafts[question.id] = draft ?? "";
          this.updateSubmitAvailability(question);
          this.persist();
          if (question.response.presentation === "guided_builder") {
            const numerator = form.querySelector("#fraction-n")?.value.trim() || "?";
            const denominator = form.querySelector("#fraction-d")?.value.trim() || "?";
            const builtN = form.querySelector("#guided-built-n");
            const builtD = form.querySelector("#guided-built-d");
            if (builtN) builtN.textContent = numerator;
            if (builtD) builtD.textContent = denominator;
          }
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!this.elements.primary.disabled) this.handlePrimary(this.current());
          }
        });
      });
      form.querySelectorAll("select").forEach((select) => {
        select.addEventListener("change", () => {
          const draft = this.readResponse(question, true);
          this.state.drafts[question.id] = draft || {};
          this.updateSubmitAvailability(question);
          this.persist();
        });
        select.addEventListener("keydown", (event) => {
          if (event.key === "Enter" && !this.elements.primary.disabled) {
            event.preventDefault();
            this.handlePrimary(this.current());
          }
        });
      });
      if (question.response.type === "fra16_order_cards") {
        const list = form.querySelector("[data-fra16-order-list]");
        let draggedId = null;
        const refresh = (announcement) => {
          const items = [...list.querySelectorAll("[data-fra16-order-item]")];
          const labels = question.response.labels || {};
          items.forEach((item, index) => {
            const id = item.dataset.cardId;
            const card = item.querySelector(".fra16-order-card");
            const left = item.querySelector('[data-fra16-move="left"]');
            const right = item.querySelector('[data-fra16-move="right"]');
            card.setAttribute("aria-label", `${labels[id] || id}, position ${index + 1} of ${items.length}. Use left and right arrows to move.`);
            left.disabled = index === 0;
            right.disabled = index === items.length - 1;
          });
          const order = items.map((item) => item.dataset.cardId);
          const status = form.querySelector("[data-fra16-order-status]");
          if (status) status.textContent = announcement || `Current order: ${order.map((id) => labels[id] || id).join(", ")}`;
          this.state.drafts[question.id] = order;
          this.updateSubmitAvailability(question);
          this.persist();
        };
        const move = (item, delta) => {
          const items = [...list.querySelectorAll("[data-fra16-order-item]")];
          const index = items.indexOf(item);
          const nextIndex = Math.max(0, Math.min(items.length - 1, index + delta));
          if (nextIndex === index) return;
          if (delta < 0) list.insertBefore(item, items[nextIndex]);
          else list.insertBefore(item, items[nextIndex].nextSibling);
          const label = question.response.labels?.[item.dataset.cardId] || item.dataset.cardId;
          refresh(`${label} moved to position ${nextIndex + 1}.`);
          item.querySelector(".fra16-order-card")?.focus();
        };
        list.querySelectorAll("[data-fra16-order-item]").forEach((item) => {
          item.querySelector('[data-fra16-move="left"]')?.addEventListener("click", () => move(item, -1));
          item.querySelector('[data-fra16-move="right"]')?.addEventListener("click", () => move(item, 1));
          item.querySelector(".fra16-order-card")?.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); move(item, -1); }
            else if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); move(item, 1); }
            else if (event.key === "Enter" && !this.elements.primary.disabled) { event.preventDefault(); this.handlePrimary(this.current()); }
          });
          item.addEventListener("dragstart", (event) => {
            draggedId = item.dataset.cardId;
            item.classList.add("is-dragging");
            event.dataTransfer?.setData("text/plain", draggedId);
          });
          item.addEventListener("dragend", () => { item.classList.remove("is-dragging"); draggedId = null; });
          item.addEventListener("dragover", (event) => event.preventDefault());
          item.addEventListener("drop", (event) => {
            event.preventDefault();
            const id = draggedId || event.dataTransfer?.getData("text/plain");
            const dragged = id ? list.querySelector(`[data-card-id="${window.CSS?.escape ? CSS.escape(id) : id}"]`) : null;
            if (!dragged || dragged === item) return;
            const targetRect = item.getBoundingClientRect();
            const after = event.clientX > targetRect.left + targetRect.width / 2;
            list.insertBefore(dragged, after ? item.nextSibling : item);
            refresh(`${question.response.labels?.[id] || id} moved by drag.`);
            dragged.querySelector(".fra16-order-card")?.focus();
          });
        });
        refresh();
      }
      if (["fra23_group_tap_fraction", "fra23_unit_fraction", "fra23_badge_fraction"].includes(question.response.type)) {
        const updateSupportedDraft = () => {
          this.state.drafts[question.id] = this.readResponse(question, true) || {};
          this.updateSubmitAvailability(question);
          this.persist();
        };
        form.querySelectorAll("[data-fra23-group]").forEach((button) => button.addEventListener("click", () => {
          const selected = button.getAttribute("aria-pressed") !== "true";
          button.setAttribute("aria-pressed", String(selected));
          button.classList.toggle("is-selected", selected);
          updateSupportedDraft();
        }));
        form.querySelectorAll("[data-fra23-unit], [data-fra23-placement]").forEach((button) => button.addEventListener("click", () => {
          const selector = button.hasAttribute("data-fra23-unit") ? "[data-fra23-unit]" : "[data-fra23-placement]";
          form.querySelectorAll(selector).forEach((option) => {
            const selected = option === button;
            option.setAttribute("aria-pressed", String(selected));
            option.classList.toggle("is-selected", selected);
          });
          updateSupportedDraft();
        }));
      }
      if (question.response.type === "factor_then_integer") {
        const factorInput = form.querySelector("#factor-answer");
        const valueStage = form.querySelector("#factor-value-stage");
        const valueInput = form.querySelector("#factor-value-answer");
        const expectedFactor = String(question.answer?.value?.factor ?? "");
        form.querySelectorAll(".factor-option").forEach((button) => {
          button.addEventListener("click", () => {
            form.querySelectorAll(".factor-option").forEach((option) => {
              const selected = option === button;
              option.classList.toggle("is-selected", selected);
              option.setAttribute("aria-pressed", String(selected));
            });
            factorInput.value = button.dataset.factor;
            const factorCorrect = button.dataset.factor === expectedFactor;
            valueStage.hidden = !factorCorrect;
            if (!factorCorrect && valueInput) valueInput.value = "";
            this.state.drafts[question.id] = { factor: button.dataset.factor, value: factorCorrect ? (valueInput?.value || "") : "" };
            this.updateSubmitAvailability(question);
            this.persist();
            if (factorCorrect) window.setTimeout(() => valueInput?.focus(), 0);
          });
        });
      }
      if (question.response.type === "tick_selector") {
        const slider = form.querySelector("#tick-selector-slider");
        const choose = (next) => this.setTickSelection(question, next);
        slider?.addEventListener("keydown", (event) => {
          const current = slider.dataset.value === "" ? null : Number(slider.dataset.value);
          if (["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End"].includes(event.key)) event.preventDefault();
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") choose(current === null ? 0 : current - 1);
          else if (event.key === "ArrowRight" || event.key === "ArrowUp") choose(current === null ? 1 : current + 1);
          else if (event.key === "Home") choose(0);
          else if (event.key === "End") choose(Number(slider.dataset.total));
          else if (event.key === "Enter" && !this.elements.primary.disabled) {
            event.preventDefault();
            this.handlePrimary(this.current());
          }
        });
        form.querySelector("#tick-nudge-left")?.addEventListener("click", () => {
          const current = slider?.dataset.value === "" ? null : Number(slider.dataset.value);
          choose(current === null ? 0 : current - 1);
        });
        form.querySelector("#tick-nudge-right")?.addEventListener("click", () => {
          const current = slider?.dataset.value === "" ? null : Number(slider.dataset.value);
          choose(current === null ? 1 : current + 1);
        });
        this.elements.canvas.addEventListener("revily:tick-select", (event) => choose(event.detail?.index));
      }
      form.querySelectorAll(".choice-card").forEach((button) => {
        button.addEventListener("click", () => {
          form.querySelectorAll(".choice-card").forEach((card) => {
            card.classList.remove("is-selected");
            card.setAttribute("aria-pressed", "false");
          });
          button.classList.add("is-selected");
          button.setAttribute("aria-pressed", "true");
          form.querySelector("#choice-answer").value = button.dataset.optionIndex;
          this.state.drafts[question.id] = this.readResponse(question, true);
          this.updateSubmitAvailability(question);
          this.persist();
        });
      });
      form.querySelectorAll(".multi-choice-card").forEach((button) => {
        button.addEventListener("click", () => {
          const selected = button.getAttribute("aria-pressed") !== "true";
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
          this.state.drafts[question.id] = this.readResponse(question, true) || [];
          this.updateSubmitAvailability(question);
          this.persist();
        });
      });
      form.querySelectorAll(".set-builder-token").forEach((button) => {
        button.addEventListener("click", () => {
          const selected = button.getAttribute("aria-pressed") !== "true";
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
          button.setAttribute("aria-label", `Object ${Number(button.dataset.tokenIndex) + 1}${selected ? ", selected" : ""}`);
          const count = form.querySelectorAll(".set-builder-token[aria-pressed=true]").length;
          const countLabel = form.querySelector("#set-builder-count");
          if (countLabel) countLabel.textContent = `${count} selected`;
          this.state.drafts[question.id] = this.readResponse(question, true) || [];
          this.updateSubmitAvailability(question);
          this.persist();
        });
      });
      form.querySelectorAll(".order-option").forEach((button) => {
        button.addEventListener("click", () => {
          button.disabled = true;
          const result = form.querySelector("#order-result");
          const values = [...result.querySelectorAll("[data-value]")].map((item) => item.dataset.value);
          values.push(button.dataset.value);
          result.innerHTML = values.map((item, index) => `<span data-value="${escapeHtml(item)}">${mathMarkup(item)}${index < values.length - 1 ? " <" : ""}</span>`).join("");
          this.state.drafts[question.id] = values;
          this.updateSubmitAvailability(question);
          this.persist();
        });
      });
      form.querySelector("#reset-order")?.addEventListener("click", () => {
        form.querySelector("#order-result").innerHTML = "<em>Select the fractions in order</em>";
        form.querySelectorAll(".order-option").forEach((button) => { button.disabled = false; });
        this.state.drafts[question.id] = [];
        this.updateSubmitAvailability(question);
        this.persist();
      });
    }

    setTickSelection(question, next) {
      const slider = this.root.querySelector("#tick-selector-slider");
      const input = this.root.querySelector("#tick-answer");
      if (!slider || !input) return;
      const total = Math.max(1, Number(slider.dataset.total) || 1);
      const value = Math.max(0, Math.min(total, Math.round(Number(next) || 0)));
      const valueText = `Boundary ${value + 1}; ${value} interval${value === 1 ? "" : "s"} from zero`;
      slider.dataset.value = String(value);
      slider.setAttribute("aria-valuenow", String(value));
      slider.setAttribute("aria-valuetext", valueText);
      const status = slider.querySelector("#tick-selector-status");
      if (status) status.textContent = valueText;
      input.value = String(value);
      this.state.drafts[question.id] = String(value);
      window.RevilyFra05Visuals?.updateSelectedTick?.(this.elements.canvas, value);
      this.updateSubmitAvailability(question);
      this.persist();
    }

    recordFra10FactorError(question, draft) {
      if (!this.isFra10V1()) return;
      const questionId = question.id;
      this.state.evidence.factorInvalid[questionId] = Number(this.state.evidence.factorInvalid[questionId] || 0) + 1;
      this.state.evidence.candidateErrorFamily[questionId] = "non_common";
      if (this.state.evidence.factorInvalid[questionId] < 2) return;
      this.state.evidence.errorFamily[questionId] = "non_common";
      this.state.evidence.misconceptions[questionId] = "non_common";
      this.state.evidence.supportEscalated[questionId] = true;
      const current = this.current();
      const recoveryId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.non_common;
      const freshId = this.freshCheckForFamily("non_common");
      if (!current || !recoveryId || !freshId) return;
      this.state.resolved[questionId] = "worked_then_recovery";
      this.state.pendingRecovery = {
        originId: current.id,
        originQuestionId: questionId,
        recoveryId,
        nextId: `FRESH:${freshId}`,
        returnId: current.nextId,
        freshId,
        family: "non_common",
        exitRemediation: false
      };
      this.lockInputs();
      this.elements.primary.textContent = "Try a quick repair";
      this.elements.primary.disabled = false;
      this.showFeedback("support", window.RevilyFra10Adapter.uiText("FB.NON_COMMON"), "Use the short factor check, then answer a fresh question.", "Next step");
      this.emit("misconception_detected", { question_id: questionId, misconception: "non_common", source: "factor_route_builder" });
      this.persist();
    }

    readResponse(question, allowPartial) {
      const type = question.response.type;
      if (this.isFra10V1() && ["factor_route_builder", "factor_choice_then_fraction", "choice_then_fraction", "sort_then_factor", "arithmetic_check"].includes(type)) {
        return window.RevilyFra10Adapter.readResponse(this, question, allowPartial);
      }
      if (["fra23_group_tap_fraction", "fra23_unit_fraction", "fra23_badge_fraction"].includes(type)) {
        const numerator = this.root.querySelector("#fra23-supported-numerator")?.value.trim() || "";
        const result = { numerator, denominator: String(question.response.fixedDenominator) };
        if (type === "fra23_group_tap_fraction") result.tappedGroups = [...this.root.querySelectorAll("[data-fra23-group][aria-pressed=true]")].map((button) => button.dataset.fra23Group);
        if (type === "fra23_unit_fraction") result.unit = this.root.querySelector("[data-fra23-unit][aria-pressed=true]")?.dataset.fra23Unit || "";
        if (type === "fra23_badge_fraction") result.placement = this.root.querySelector("[data-fra23-placement][aria-pressed=true]")?.dataset.fra23Placement || "";
        const auxiliaryComplete = type === "fra23_group_tap_fraction" ? result.tappedGroups.length > 0 : type === "fra23_unit_fraction" ? Boolean(result.unit) : Boolean(result.placement);
        const complete = /^-?\d+$/.test(numerator) && auxiliaryComplete;
        return complete || allowPartial ? result : null;
      }
      if (this.isFra26V1() && ["fra26_matching", "fra26_tile_placement", "fra26_staged_integer"].includes(type)) {
        return window.RevilyFra26Canonical.readResponse(this, question, allowPartial);
      }
      if (this.isFra28V1() && window.RevilyFra28Canonical.structuredTypes.has(type)) return window.RevilyFra28Canonical.readResponse(this, question, allowPartial);
      if (type === "classification_sort") {
        const result = {};
        const selects = [...this.root.querySelectorAll("[data-sort-card]")];
        selects.forEach((select) => { if (select.value) result[select.dataset.sortCard] = select.value; });
        return allowPartial || Object.keys(result).length === selects.length ? result : null;
      }
      if (type === "classification_and_size" || type === "classification_size_validity") {
        const result = {};
        const selects = [...this.root.querySelectorAll("[data-compound-key]")];
        selects.forEach((select) => {
          if (!select.value) return;
          result[select.dataset.compoundKey] = select.dataset.compoundKey === "valid" ? select.value === "true" : select.value;
        });
        return allowPartial || Object.keys(result).length === selects.length ? result : null;
      }
      if (type === "paired_classification") {
        const selects = [...this.root.querySelectorAll("[data-paired-index]")];
        const result = selects.map((select) => select.value).filter(Boolean);
        return allowPartial || result.length === selects.length ? result : null;
      }
      if (type === "fra16_equivalent_comparison") {
        const fields = [...this.root.querySelectorAll("[data-fra16-equivalent-index]")];
        const rewrittenNumerators = fields.map((field) => field.value.trim());
        const symbol = this.root.querySelector("[data-fra16-symbol]")?.value || "";
        const complete = fields.length === 2 && rewrittenNumerators.every((value) => /^-?\d+$/.test(value)) && Boolean(symbol);
        return complete || allowPartial ? { rewrittenNumerators, symbol } : null;
      }
      if (type === "fra16_benchmark_comparison") {
        const fields = [...this.root.querySelectorAll("[data-fra16-relation-index]")];
        const relations = fields.map((field) => field.value);
        const symbol = this.root.querySelector("[data-fra16-symbol]")?.value || "";
        const complete = fields.length === 2 && relations.every(Boolean) && Boolean(symbol);
        return complete || allowPartial ? { relations, symbol } : null;
      }
      if (type === "fra16_order_cards") {
        const values = [...this.root.querySelectorAll("[data-fra16-order-item]")].map((item) => item.dataset.cardId);
        return values.length === (question.response.cards || []).length ? values : null;
      }
      if (type === "fra17_cell_tap_integer") {
        const numerator = this.root.querySelector("#integer-answer")?.value.trim() || "";
        const tapped = [...this.root.querySelectorAll("[data-fra17-cell][aria-pressed=true]")].map((cell) => cell.dataset.fra17Cell);
        if (!/^-?\d+$/.test(numerator) || !tapped.length) return allowPartial ? { numerator, tapped } : null;
        return { numerator, tapped };
      }
      if (type === "fra20_cell_tap_integer") {
        const numerator = this.root.querySelector("#integer-answer")?.value.trim() || "";
        const tapped = [...this.root.querySelectorAll("[data-fra20-cell][aria-pressed=true]")].map((cell) => cell.dataset.fra20Cell);
        if (!/^-?\d+$/.test(numerator) || !tapped.length) return allowPartial ? { numerator, tapped } : null;
        return { numerator, tapped };
      }
      if (type === "factor_then_integer") {
        const factor = this.root.querySelector("#factor-answer")?.value || "";
        const value = this.root.querySelector("#factor-value-answer")?.value.trim() || "";
        if (!/^\d+$/.test(factor)) return null;
        const expectedFactor = String(question.answer?.value?.factor ?? "");
        if (factor !== expectedFactor) return { factor, value: null };
        if (!/^-?\d+$/.test(value)) return allowPartial ? { factor, value } : null;
        return { factor, value };
      }
      if (type === "fra12_staged_fields") {
        const response = {
          wholePieceTotal: this.root.querySelector("#fra12-whole-piece-total")?.value.trim() || "",
          totalNumerator: this.root.querySelector("#fra12-total-numerator")?.value.trim() || "",
          finalNumerator: this.root.querySelector("#fra12-final-numerator")?.value.trim() || ""
        };
        const complete = Object.values(response).every((value) => /^-?\d+$/.test(value));
        return complete || allowPartial ? response : null;
      }
      if (type === "integer") {
        const value = this.root.querySelector("#integer-answer")?.value.trim() || "";
        return /^-?\d+$/.test(value) ? value : (allowPartial ? value : null);
      }
      if (type === "two_step_integer") {
        const result = {};
        const fields = [...this.root.querySelectorAll("[data-two-step-field]")];
        fields.forEach((field) => { result[field.dataset.twoStepField] = field.value.trim(); });
        const complete = fields.length > 0 && fields.every((field) => /^-?\d+$/.test(field.value.trim()));
        return complete || allowPartial ? result : null;
      }
      if (type === "choice_and_integer" || type === "choice_two_step_integer") {
        const indexText = this.root.querySelector("#choice-answer")?.value;
        const options = this.choiceOptions(question);
        const result = { choice: indexText === "" || indexText === undefined ? "" : (options[Number(indexText)] ?? "") };
        const fields = [...this.root.querySelectorAll("[data-choice-integer-field]")];
        fields.forEach((field) => { result[field.dataset.choiceIntegerField] = field.value.trim(); });
        const complete = Boolean(result.choice) && fields.length > 0 && fields.every((field) => /^-?\d+$/.test(field.value.trim()));
        return complete || allowPartial ? result : null;
      }
      if (type === "quantity") {
        const value = (this.root.querySelector("#quantity-answer")?.value || "").trim().replace(/\u2212/g, "-");
        return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? value : (allowPartial ? value : null);
      }
      if (type === "money") {
        const value = (this.root.querySelector("#money-answer")?.value || "").trim();
        return window.RevilyValidators.parseMoneyPence(value) !== null ? value : (allowPartial ? value : null);
      }
      if (type === "tick_selector") {
        const value = this.root.querySelector("#tick-answer")?.value ?? "";
        return /^\d+$/.test(value) ? value : null;
      }
      if (type === "decimal") {
        const value = (this.root.querySelector("#decimal-answer")?.value || "").trim().replace(/\u2212/g, "-");
        return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? value : null;
      }
      if (type === "fraction") {
        const wholeInput = this.root.querySelector("#fraction-whole");
        if (wholeInput) {
          const value = wholeInput.value.trim();
          return /^-?\d+$/.test(value) ? value : null;
        }
        const n = this.root.querySelector("#fraction-n")?.value.trim() || "";
        const d = this.root.querySelector("#fraction-d")?.value.trim() || "";
        if (allowPartial) return { n, d };
        if (!/^-?\d+$/.test(n) || !/^-?\d+$/.test(d) || BigInt(d) === 0n) return null;
        return { n, d };
      }
      if (type === "mixed_number") {
        const whole = this.root.querySelector("#mixed-whole")?.value.trim() || "";
        const n = this.root.querySelector("#mixed-n")?.value.trim() || "";
        const d = this.root.querySelector("#mixed-d")?.value.trim()
          || this.root.querySelector("#mixed-fixed-d")?.dataset.value
          || String(question.response.fixedDenominator ?? "");
        if (!/^-?\d+$/.test(whole)) return null;
        if (!n && !d) return { whole, n: "0", d: "1" };
        if (!/^\d+$/.test(n) || !/^\d+$/.test(d) || BigInt(d) === 0n) return null;
        return { whole, n, d };
      }
      if (type === "division_then_mixed") {
        const result = { d: String(question.response.fixedDenominator ?? "") };
        const fields = [...this.root.querySelectorAll("[data-division-mixed-field]")];
        fields.forEach((field) => { result[field.dataset.divisionMixedField] = field.value.trim(); });
        const complete = fields.length === 4
          && fields.every((field) => /^\d+$/.test(field.value.trim()))
          && /^\d+$/.test(result.d);
        return complete || allowPartial ? result : null;
      }
      if (type === "ordered_sequence") {
        const values = [...this.root.querySelectorAll("#order-result [data-value]")].map((item) => item.dataset.value);
        return values.length === this.sequenceOptions(question).length ? values : null;
      }
      if (type === "multiple_choice") {
        const values = [...this.root.querySelectorAll(".multi-choice-card[aria-pressed=true]")].map((button) => button.dataset.optionValue);
        return values.length ? values : null;
      }
      if (type === "set_builder") {
        const values = [...this.root.querySelectorAll(".set-builder-token[aria-pressed=true]")].map((button) => button.dataset.tokenIndex);
        return values.length ? values : null;
      }
      const indexText = this.root.querySelector("#choice-answer")?.value;
      if (indexText === "" || indexText === undefined) return null;
      const options = this.choiceOptions(question);
      return options[Number(indexText)] ?? null;
    }

    updateSubmitAvailability(question) {
      const response = this.readResponse(question);
      const submitDisabled = response === null || this.fra08RetryResponseUnchanged(question, response);
      this.elements.primary.disabled = submitDisabled;
      this.root.querySelector('#answer-form button[type="submit"]')?.toggleAttribute("disabled", submitDisabled);
      this.root.querySelector("#answer-form")?.classList.remove("has-error");
    }

    fra08RetryResponseUnchanged(question, response) {
      if (!this.isFra08V1() || question?.policy?.answerLocksOnSubmit === true) return false;
      if (!this.state.attempts[question.id] || this.state.resolved[question.id] || this.state.exit.responses[question.id]) return false;
      if (!["first_incorrect", "support"].includes(this.state.feedback[question.id])) return false;
      const previous = this.lastResponse(question.id);
      return previous !== null && JSON.stringify(serialiseResponse(response)) === JSON.stringify(previous);
    }

    prepareFra08Retry(question) {
      if (!this.isFra08V1() || question?.policy?.answerLocksOnSubmit === true) return this.refocusInput();
      this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
      this.elements.primary.disabled = true;
      this.root.querySelector('#answer-form button[type="submit"]')?.setAttribute("disabled", "");
      window.setTimeout(() => {
        const control = this.root.querySelector("#answer-form input:not([type=hidden]):not(:disabled), #answer-form .factor-option:not(:disabled), #answer-form .choice-card:not(:disabled)");
        control?.focus();
        if (control?.tagName === "INPUT" && typeof control.select === "function") control.select();
      }, 80);
      this.emit("retry_enabled", { question_id: question.id, requires_changed_response: true });
    }

    handlePrimary(current) {
      if (!current) return;
      if (current.kind === "scene") {
        if (!this.state.started) {
          this.state.started = true;
          this.emit("skill_started", { restarted: false });
          this.elements.primary.disabled = true;
          this.elements.primary.textContent = "Starting…";
          const pauseAfterNarration = current.source?.pause_after_narration === true;
          const afterOpening = (this.isFra12V1() && current.id === "HOOK") || pauseAfterNarration
            ? () => {
                this.elements.primary.disabled = false;
                this.elements.primary.textContent = current.source?.learner_action?.button || "Continue";
                this.state.narrationResume = null;
                this.persist();
              }
            : () => this.advance(current);
          this.startNarration(
            this.narrationLinesFor(current),
            afterOpening,
            { delayMs: this.narrationPlayback.opening_delay_ms || 0, resumeAction: (this.isFra12V1() && current.id === "HOOK") || pauseAfterNarration ? "enable_scene_continue" : "advance_current" }
          );
          return;
        }
        this.stopNarration(false);
        this.advance(current);
        return;
      }
      const questionId = current.questionId;
      if (this.state.resolved[questionId] || this.state.exit.responses[questionId]) {
        if (current.fresh) return this.advanceFresh(current);
        if (current.confirmation) {
          if (this.state.exit.result) this.finishExit();
          else this.advance(current);
        }
        else this.advance(current);
        return;
      }
      this.submitAnswer(current);
    }

    narrationLinesFor(current) {
      if (this.isFra11V1() && current.id === "I1" && this.fra11DirectResumeAtI1) {
        this.fra11DirectResumeAtI1 = false;
        return [this.spec.canonical_lesson.runtime_copy["I1.PRE"].text];
      }
      if (this.isFra16V1() && current.recovery && this.state.pendingRecovery?.family === "equality_rejected") {
        return uniqueLines([current.narration, current.question?.equalityExtensionNarration || []]);
      }
      if (this.spec.voice_and_script?.opening_mode === "authored_scene_only") {
        this.state.openingPlayed = true;
        this.persist();
        return uniqueLines([current.narration]);
      }
      if (current.id !== this.model.firstId || this.state.openingPlayed) {
        return uniqueLines([current.narration]);
      }
      this.state.openingPlayed = true;
      this.persist();
      return openingNarrationLines(this.topic, this.spec, current.narration);
    }

    submitAnswer(current) {
      const question = current.question;
      const response = this.readResponse(question);
      if (response === null) return;
      if (this.fra08RetryResponseUnchanged(question, response)) {
        this.prepareFra08Retry(question);
        this.emit("retry_unchanged_blocked", { question_id: question.id });
        return;
      }
      this.stopNarration(false);
      const questionId = current.questionId;
      const fra07Evaluation = this.isFra07V1() ? window.RevilyFra07Canonical?.evaluateResponse?.(question, response) : null;
      const fra10Evaluation = this.isFra10V1() ? window.RevilyFra10Adapter.evaluateResponse(question, response) : null;
      const fra14Evaluation = this.isFra14V1() ? window.RevilyFra14Canonical?.evaluateResponse?.(question, response) : null;
      const fra15Evaluation = this.isFra15V1() ? window.RevilyFra15Canonical?.evaluateResponse?.(question, response) : null;
      const fra17Evaluation = this.isFra17V1() ? window.RevilyFra17Canonical?.evaluateResponse?.(question, response) : null;
      const fra20Evaluation = this.isFra20V1() ? window.RevilyFra20Canonical?.evaluateResponse?.(question, response) : null;
      const fra21Evaluation = this.isFra21V1() ? window.RevilyFra21Canonical?.evaluateResponse?.(question, response) : null;
      const fra22Evaluation = this.isFra22V1() ? window.RevilyFra22Canonical?.evaluateResponse?.(question, response) : null;
      const fra23Evaluation = this.isFra23V1() ? window.RevilyFra23Canonical?.evaluateResponse?.(question, response) : null;
      const fra24Evaluation = this.isFra24V1() ? window.RevilyFra24Canonical?.evaluateResponse?.(question, response) : null;
      const fra26Evaluation = this.isFra26V1() ? window.RevilyFra26Canonical?.evaluateResponse?.(question, response) : null;
      const fra28Evaluation = this.isFra28V1() ? window.RevilyFra28Canonical?.evaluateResponse?.(question, response) : null;
      const correct = fra28Evaluation ? fra28Evaluation.correct === true : (fra07Evaluation ? fra07Evaluation.correct === true : (fra26Evaluation ? fra26Evaluation.correct === true : (fra24Evaluation ? fra24Evaluation.correct === true : (fra23Evaluation ? fra23Evaluation.correct === true : (fra22Evaluation ? fra22Evaluation.correct === true : (fra21Evaluation ? fra21Evaluation.correct === true : (fra20Evaluation ? fra20Evaluation.correct === true : (fra17Evaluation ? fra17Evaluation.correct === true : (fra15Evaluation ? fra15Evaluation.correct === true : (fra14Evaluation ? fra14Evaluation.correct === true : (fra10Evaluation ? fra10Evaluation.correct === true : validate(question, response))))))))))));
      this.state.attempts[questionId] = (this.state.attempts[questionId] || 0) + 1;
      const firstAttempt = this.state.attempts[questionId] === 1;
      const hintOpened = this.state.evidence.hintOpened[questionId] === true;
      if (firstAttempt && !question.policy?.engagementOnly) {
        this.state.evidence.firstAttemptCorrect[questionId] = correct;
        this.state.evidence.hintOpenedBeforeSubmit[questionId] = hintOpened;
        this.state.evidence.canonicalSignature[questionId] = question.policy?.canonicalSignature || question.model?.canonicalSignature || null;
        if (fra22Evaluation) {
          const freshnessSignature = question.policy?.freshnessSignature || question.model?.freshnessSignature || null;
          const alreadySeen = freshnessSignature && Object.entries(this.state.evidence.freshnessSignature || {}).some(([id, signature]) => id !== questionId && signature === freshnessSignature);
          this.state.evidence.freshnessSignature[questionId] = freshnessSignature;
          this.state.evidence.countsAsFreshEvidence[questionId] = question.policy?.countsAsFreshEvidence === true && !alreadySeen;
          this.state.evidence.answerValueCorrect[questionId] = correct;
          this.state.evidence.answerFormCorrect[questionId] = correct;
        }
        if (fra17Evaluation || fra20Evaluation || fra23Evaluation || fra24Evaluation) {
          this.state.evidence.answerValueCorrect[questionId] = fra24Evaluation ? fra24Evaluation.valueCorrect === true : (fra23Evaluation ? fra23Evaluation.valueCorrect === true : (fra20Evaluation ? fra20Evaluation.mathematicallyCorrect === true : fra17Evaluation.valueCorrect === true));
          this.state.evidence.answerFormCorrect[questionId] = (fra24Evaluation || fra23Evaluation || fra20Evaluation || fra17Evaluation).formCorrect === true;
        }
        if (question.response.type === "factor_then_integer") {
          this.state.evidence.factorStageFirstAttemptCorrect[questionId] = String(response.factor) === String(question.answer?.value?.factor);
          this.state.evidence.responseStageFirstAttemptCorrect[questionId] = String(response.value ?? "") === String(question.answer?.value?.value);
        }
        if (this.isFra10V1() && question.response.type === "factor_route_builder") {
          this.state.evidence.factorStageFirstAttemptCorrect[questionId] = !(this.state.evidence.factorInvalid[questionId] > 0);
          this.state.evidence.responseStageFirstAttemptCorrect[questionId] = correct;
        }
        if (question.response.type === "two_step_integer") {
          this.state.evidence.componentFirstAttemptCorrect[questionId] = Object.fromEntries((question.response.fields || []).map((field) => [
            field.id,
            /^-?\d+$/.test(String(response?.[field.id] ?? ""))
              && BigInt(response[field.id]) === BigInt(question.answer?.value?.[field.id])
          ]));
        }
      } else if (hintOpened) {
        this.state.evidence.hintOpenedBeforeSubmit[questionId] = true;
      }
      if (question.policy?.answerLocksOnSubmit) this.state.evidence.answerLocked[questionId] = true;
      const multiplierEvidence = question.response?.multiplier_method
        ? window.RevilyPercentageChangeStructure.evidence(question, response) : null;
      if (multiplierEvidence && firstAttempt) {
        this.state.evidence.answerValueCorrect[questionId] = multiplierEvidence.finalAnswerCorrect;
        this.state.evidence.answerFormCorrect[questionId] = multiplierEvidence.multiplierMethodShown;
      }
      const methodOnlyMismatch = multiplierEvidence?.classification === "check_requested_method";
      if (methodOnlyMismatch) this.emit("required_method_not_shown", { question_id: questionId, final_answer_correct: multiplierEvidence.finalAnswerCorrect, correct_alternative_method_shown: multiplierEvidence.correctAlternativeMethodShown, misconception_confirmed: false });
      if (!correct && !question.policy?.engagementOnly && !methodOnlyMismatch) {
        const candidate = fra28Evaluation?.errorFamily || fra07Evaluation?.errorFamily || fra26Evaluation?.errorFamily || fra24Evaluation?.errorFamily || fra23Evaluation?.errorFamily || fra22Evaluation?.errorFamily || fra21Evaluation?.matchedErrorFamily || fra20Evaluation?.errorFamily || fra17Evaluation?.errorFamily || fra15Evaluation?.errorFamily || fra14Evaluation?.errorFamily || fra10Evaluation?.errorFamily || this.classifyMisconception(question, response);
        const pairedEvidence = Object.entries(this.state.evidence.candidateErrorFamily || {}).some(([id, family]) => id !== questionId && family === candidate);
        const misconception = fra22Evaluation?.errorConfidence === "high"
          ? candidate
          : this.requiresRepeatedEvidence(question, response) && firstAttempt && !pairedEvidence
          ? "support_needed"
          : candidate;
        if (fra22Evaluation) this.state.evidence.errorConfidence[questionId] = fra22Evaluation.errorConfidence;
        this.state.evidence.candidateErrorFamily[questionId] = candidate;
        this.state.evidence.misconceptions[questionId] = misconception;
        this.state.evidence.errorFamily[questionId] = misconception;
        this.emit("misconception_detected", { question_id: questionId, misconception });
      }
      if (question.policy?.engagementOnly) {
        this.state.engagementResponses[questionId] = { response: serialiseResponse(response), at: new Date().toISOString() };
      } else {
        this.state.submissions[questionId] = this.state.submissions[questionId] || [];
        this.state.submissions[questionId].push({ response: serialiseResponse(response), correct, at: new Date().toISOString() });
      }
      this.state.drafts[questionId] = serialiseResponse(response);
      this.emit("answer_submitted", { question_id: questionId, attempt_number: this.state.attempts[questionId], correct: question.policy?.engagementOnly ? null : correct, scored: question.policy?.scored !== false, hint_opened_before_submit: hintOpened, response_type: question.response.type, answer_value_correct: multiplierEvidence?.finalAnswerCorrect ?? fra24Evaluation?.valueCorrect ?? fra23Evaluation?.valueCorrect ?? fra22Evaluation?.correct ?? fra20Evaluation?.mathematicallyCorrect ?? fra17Evaluation?.valueCorrect, ...(multiplierEvidence?{required_method_shown:multiplierEvidence.multiplierMethodShown,correct_alternative_method_shown:multiplierEvidence.correctAlternativeMethodShown}:{}), answer_form_correct: multiplierEvidence?.multiplierMethodShown ?? fra24Evaluation?.formCorrect ?? fra23Evaluation?.formCorrect ?? fra22Evaluation?.correct ?? fra20Evaluation?.formCorrect ?? fra17Evaluation?.formCorrect, counts_as_fresh_evidence: this.state.evidence.countsAsFreshEvidence[questionId], freshness_signature: this.state.evidence.freshnessSignature[questionId], factor_history: fra10Evaluation?.factorHistory || undefined, selected_factor: fra10Evaluation?.selectedFactor, selected_option_id: fra20Evaluation?.selectedOptionId ?? fra10Evaluation?.selectedOptionId });

      if (question.policy?.engagementOnly) return this.handleEngagement(current, response, correct);
      if (current.fresh) return this.handleFreshSubmission(current, response, correct);
      if (current.exit || current.confirmation) return this.handleExitSubmission(current, response, correct);
      if (this.isFra28V1()) return this.handleFra28Outcome(current, response, fra28Evaluation);
      if (this.isFra26V1()) return this.handleFra26Outcome(current, response, fra26Evaluation);
      if (this.isFra22V1()) return this.handleFra22Outcome(current, response, fra22Evaluation);
      if (this.isFra21V1()) return this.handleFra21Outcome(current, response, fra21Evaluation);
      if (this.isFra15V1()) return this.handleFra15Outcome(current, response, fra15Evaluation);
      if (this.isFra14V1()) return this.handleFra14Outcome(current, response, fra14Evaluation);
      if (correct) return this.handleCorrect(current);
      return this.handleIncorrect(current);
    }

    handleEngagement(current, response, correct) {
      const question = current.question;
      const responseLinesByValue = question.scripts?.engagement_response_by_value || {};
      const exactResponseLines = responseLinesByValue[String(response)] || null;
      this.state.resolved[current.questionId] = "engagement";
      this.state.feedback[current.questionId] = "worked";
      this.state.engagementResponses[current.questionId] = { response: serialiseResponse(response), correct: null };
      this.persist();
      this.lockInputs();
      if (this.isFra28V1()) {
        const optionId = question.response?.optionIds?.[String(response)] || String(response);
        const visible = question.scripts?.engagement_visible_by_id?.[optionId] || "";
        const outcomeLines = (question.runtimeOutcome?.commonRevealUtteranceIds || []).map((id) => this.spec.canonical_lesson.runtime_copy[id]?.text).filter(Boolean);
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        this.showFeedback("engagement", visible, "", "Your estimate");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = outcomeLines.length > 0;
        this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), option_id: optionId, matched_expected_response: null, scored: false });
        this.startNarration(outcomeLines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
        return;
      }
      if (this.isFra26V1()) {
        const visible = question.scripts?.engagement_visible_by_value?.[String(response)] || "";
        const registry = this.spec.canonical_lesson.runtime_copy;
        const outcomeLines = (question.runtimeOutcome?.commonRevealUtteranceIds || []).map((id) => registry[id]?.text).filter(Boolean);
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        this.showFeedback(correct ? "correct" : "engagement", visible, "", "Your prediction");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = outcomeLines.length > 0;
        this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), matched_expected_response: correct, scored: false });
        this.startNarration(outcomeLines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
        return;
      }
      if (this.isFra20V1() || this.isFra24V1()) {
        const optionId = question.response?.optionIds?.[String(response)] || String(response);
        const visible = question.scripts?.engagement_visible_by_id?.[optionId] || "";
        const responseLines = exactResponseLines || [];
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        this.showFeedback(correct ? "correct" : "engagement", visible, "", "Your prediction");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = responseLines.length > 0;
        this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), option_id: optionId, matched_expected_response: correct, scored: false });
        this.startNarration(responseLines, () => {
          this.elements.primary.disabled = false;
          this.advance(current);
        }, { resumeAction: "advance_current" });
        return;
      }
      if (this.isFra14V1()) {
        const optionId = question.response?.optionIds?.[String(response)] || String(response);
        const visible = question.scripts?.engagement_visible_by_id?.[optionId] || "";
        const registry = this.spec.canonical_lesson?.runtime_copy || {};
        const outcomeLines = (question.runtimeOutcome?.commonRevealUtteranceIds || []).map((id) => registry[id]?.text || "").filter(Boolean);
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "initial" });
        this.showFeedback(correct ? "correct" : "engagement", visible, "", "Your prediction");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), option_id: optionId, matched_expected_response: correct, scored: false });
        this.startNarration(outcomeLines, () => this.advance(current), { resumeAction: "advance_current" });
        return;
      }
      if (this.isFra11V1()) {
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        this.showFeedback(
          correct ? "correct" : "engagement",
          correct ? question.scripts?.engagement_correct_feedback : question.scripts?.engagement_incorrect_feedback,
          question.scripts?.engagement_detail || "",
          "Try the repair"
        );
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), matched_expected_response: correct, scored: false });
        return;
      }
      if (this.isFra10V1()) {
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        const visible = question.scripts?.engagement_visible_by_value?.[String(response)] || "";
        this.showFeedback(correct ? "correct" : "engagement", visible, "", question.scripts?.engagement_label || "Your choice");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        const responseLines = exactResponseLines || [];
        this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), matched_expected_response: correct, scored: false });
        this.startNarration(responseLines, () => this.advance(current), { resumeAction: "advance_current" });
        return;
      }
      if (this.isFra08V1()) {
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        const slot = this.root.querySelector("#feedback-slot");
        if (slot) slot.innerHTML = "";
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        const responseLines = question.scripts?.engagement_correct_response || [];
        this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), matched_expected_response: null, scored: false });
        this.startNarration(responseLines, () => this.advance(current), { resumeAction: "advance_current" });
        return;
      }
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: this.isFra13V1() ? "worked" : (this.isRegistryRuntimeLesson() ? "initial" : "worked") });
      const engagementLabel = this.isFra17V1() ? `${question.scripts?.engagement_label || "Your prediction"}: ${String(response)}` : (question.scripts?.engagement_label || (this.isFra06V1() ? "Your prediction" : undefined));
      this.showFeedback(
        "engagement",
        exactResponseLines
          ? exactResponseLines[0]
          : correct
          ? (question.scripts?.engagement_correct_feedback || "Right — the pieces are different sizes, so they cannot both be halves.")
          : (question.scripts?.engagement_incorrect_feedback || "It may look fair because there are two pieces, but their sizes are different. Halves must be equal."),
        exactResponseLines ? exactResponseLines.slice(1).join(" ") : (question.scripts?.engagement_detail || "Watch the cut move so the two shares become equal."),
        engagementLabel
      );
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      const responseLines = exactResponseLines || (correct
        ? (question.scripts?.engagement_correct_response || question.scripts?.engagement_response)
        : (question.scripts?.engagement_incorrect_response || question.scripts?.engagement_response));
      this.emit("engagement_response_shown", { question_id: current.questionId, response: serialiseResponse(response), matched_expected_response: correct });
      this.startNarration(responseLines || [], () => this.advance(current), { resumeAction: "advance_current" });
    }

    handleFra28Outcome(current, response, suppliedEvaluation) {
      const question = current.question;
      const questionId = current.questionId;
      const evaluation = suppliedEvaluation || window.RevilyFra28Canonical.evaluateResponse(question, response);
      const correct = evaluation.correct === true;
      const recordedFamily = this.state.evidence.errorFamily[questionId];
      const confirmedFamily = !correct && recordedFamily && recordedFamily !== "support_needed" ? recordedFamily : null;
      const recoveryId = confirmedFamily ? this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[confirmedFamily] : null;
      const freshId = confirmedFamily ? this.freshCheckForFamily(confirmedFamily) : null;
      const outcomeLines = (evaluation.utteranceIds || []).map((id) => this.spec.canonical_lesson.runtime_copy[id]?.text).filter(Boolean);
      this.state.resolved[questionId] = correct ? "correct" : "incorrect_locked";
      this.state.feedback[questionId] = "worked";
      if (correct && question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) {
        const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
        if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
      }
      if (recoveryId && freshId) {
        this.state.evidence.supportEscalated[questionId] = true;
        this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId, nextId: `FRESH:${freshId}`, returnId: current.nextId, freshId, family: confirmedFamily, exitRemediation: false, fra28RepairFlow: true };
      }
      this.persist();
      this.lockInputs();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      this.showFeedback(correct ? "correct" : "support", evaluation.visibleText || "", question.scripts?.worked_explanation || "", "Answer locked");
      this.elements.primary.textContent = recoveryId && freshId ? "Try a quick repair" : "Continue";
      this.elements.primary.disabled = outcomeLines.length > 0;
      this.emit("worked_solution_shown", { question_id: questionId, answer_locked: true, final_check: false, correct, error_family: evaluation.errorFamily });
      this.startNarration(outcomeLines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
    }

    fra14Evaluation(question, response) {
      return window.RevilyFra14Canonical?.evaluateResponse?.(question, response) || { correct: false, errorFamily: "AMBIGUOUS", utteranceIds: [], visibleText: "" };
    }

    fra14OutcomeLines(question, response) {
      const evaluation = this.fra14Evaluation(question, response);
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return evaluation.utteranceIds.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    handleFra14Outcome(current, response, suppliedEvaluation) {
      const question = current.question;
      const questionId = current.questionId;
      const evaluation = suppliedEvaluation || this.fra14Evaluation(question, response);
      const correct = evaluation.correct === true;
      if (current.recovery && !correct) {
        this.state.evidence.answerLocked[questionId] = false;
        this.state.feedback[questionId] = "first_incorrect";
        this.root.querySelector("#answer-form")?.classList.add("has-error");
        this.showFeedback("hint", evaluation.visibleText || "Check the whole and each equal-part value.", "Use the repair model, then try the supported check again.", "Try the repair again");
        this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.refocusInput();
        this.persist();
        return;
      }

      this.state.resolved[questionId] = correct ? (this.state.attempts[questionId] === 1 ? "correct" : "correct_after_support") : "worked";
      this.state.feedback[questionId] = "worked";
      if (correct && question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) {
        const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
        if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
          this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
          this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "hint_supported_success" });
        }
      }
      if (!correct) {
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId] || evaluation.errorFamily || "AMBIGUOUS";
        const repairId = recorded !== "support_needed" ? this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[candidate] : null;
        const freshId = repairId ? this.freshCheckForFamily(candidate) : null;
        if (repairId && freshId) {
          this.state.evidence.supportEscalated[questionId] = true;
          this.state.pendingRecovery = {
            originId: current.id,
            originQuestionId: questionId,
            recoveryId: repairId,
            nextId: `FRESH:${freshId}`,
            returnId: current.nextId,
            freshId,
            family: candidate,
            exitRemediation: false
          };
          this.emit("fra14_repair_queued", { origin_question_id: questionId, error_family: candidate, repair_id: repairId, fresh_confirmation_id: freshId });
        } else if (["ARITHMETIC_OR_UNIT_SLIP", "AMBIGUOUS"].includes(candidate)) {
          const confirmationId = `${this.spec.identity.id}-C-ARITHMETIC`;
          if (!this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
            this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
          }
        }
      }
      this.lockInputs();
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = true;
      this.persist();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "initial" });
      this.showFeedback(correct ? "correct" : "support", evaluation.visibleText || "", "", "Your result");
      const outcomeLines = this.fra14OutcomeLines(question, response);
      this.startNarration(outcomeLines, () => this.revealFra05WorkedCheck(current, correct), { resumeAction: "reveal_fra05_worked" });
    }

    fra15Evaluation(question, response) {
      return window.RevilyFra15Canonical?.evaluateResponse?.(question, response)
        || { correct: false, errorFamily: "unknown", candidateFamilies: ["unknown"], classificationRule: "unknown", utteranceIds: [], visibleText: "" };
    }

    fra15OutcomeLines(question, response) {
      const evaluation = this.fra15Evaluation(question, response);
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return evaluation.utteranceIds.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    handleFra15Outcome(current, response, suppliedEvaluation) {
      const question = current.question;
      const questionId = current.questionId;
      const evaluation = suppliedEvaluation || this.fra15Evaluation(question, response);
      const correct = evaluation.correct === true;
      if (current.recovery && !correct) {
        this.state.evidence.answerLocked[questionId] = false;
        this.state.feedback[questionId] = "first_incorrect";
        this.root.querySelector("#answer-form")?.classList.add("has-error");
        this.showFeedback("hint", "That placement does not match the supported comparison.", "Use the visible expressed and reference roles, then try the repair again.", "Try the repair again");
        this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.refocusInput();
        this.persist();
        return;
      }

      this.state.resolved[questionId] = correct ? (this.state.attempts[questionId] === 1 ? "correct" : "correct_after_support") : "worked";
      this.state.feedback[questionId] = "worked";
      if (correct && question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) {
        const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
        if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
          this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
          this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "hint_supported_success" });
        }
      }
      if (!correct) {
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId] || evaluation.errorFamily || "unknown";
        const confirmed = recorded && recorded !== "support_needed" && candidate !== "unknown";
        const repairId = confirmed ? this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[candidate] : null;
        const freshId = repairId ? this.freshCheckForFamily(candidate) : null;
        if (repairId && freshId) {
          this.state.evidence.supportEscalated[questionId] = true;
          this.state.evidence.repairCyclesUsed[candidate] = Number(this.state.evidence.repairCyclesUsed[candidate] || 0) + 1;
          this.state.pendingRecovery = {
            originId: current.id,
            originQuestionId: questionId,
            recoveryId: repairId,
            nextId: `FRESH:${freshId}`,
            returnId: current.nextId,
            freshId,
            family: candidate,
            exitRemediation: false
          };
          this.emit("fra15_repair_queued", { origin_question_id: questionId, error_family: candidate, repair_id: repairId, fresh_confirmation_id: freshId });
        }
      }
      this.lockInputs();
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = true;
      this.persist();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "initial" });
      this.showFeedback(correct ? "correct" : "support", evaluation.visibleText || "", "", "Your result");
      this.startNarration(this.fra15OutcomeLines(question, response), () => this.revealFra05WorkedCheck(current, correct), { resumeAction: "reveal_fra05_worked" });
    }

    handleFra26Outcome(current, response, suppliedEvaluation) {
      const question = current.question;
      const questionId = current.questionId;
      const evaluation = suppliedEvaluation || window.RevilyFra26Canonical.evaluateResponse(question, response);
      const correct = evaluation.correct === true;
      const attempts = this.state.attempts[questionId] || 1;
      const family = evaluation.errorFamily || this.state.evidence.candidateErrorFamily[questionId] || question.primaryErrorFamily || "unknown";
      const registry = this.spec.canonical_lesson.runtime_copy;
      const outcomeLines = (evaluation.utteranceIds || []).map((id) => registry[id]?.text).filter(Boolean);
      const visible = evaluation.visibleText || window.RevilyFra26Canonical.visibleFeedback(question, response, correct);
      this.state.feedback[questionId] = correct ? "correct" : (attempts === 1 ? "first_incorrect" : "support");

      if (correct) {
        this.state.resolved[questionId] = attempts === 1 && !this.state.evidence.hintOpenedBeforeSubmit[questionId] ? "correct" : "correct_after_support";
        if (question.policy?.requiresFreshNoHintConfirmationIfHintUsed && (this.state.evidence.hintOpenedBeforeSubmit[questionId] || attempts > 1)) {
          const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
          if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
        }
        this.lockInputs();
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "correct" });
        this.showFeedback("correct", visible, "", "Your result");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.startNarration(outcomeLines, null);
        this.persist();
        return;
      }

      this.root.querySelector("#answer-form")?.classList.add("has-error");
      this.showFeedback("hint", visible, "", "Check this response");
      this.startNarration(outcomeLines, null);
      if (attempts < 2) {
        this.refocusInput();
        this.persist();
        return;
      }

      this.state.evidence.supportEscalated[questionId] = true;
      if (current.recovery) {
        this.state.resolved[questionId] = "repair_attempt_cap";
        if (this.state.pendingRecovery) this.state.pendingRecovery.fra26RepairFailed = true;
        this.lockInputs();
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.persist();
        return;
      }

      const recoveryId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
      const freshId = this.freshCheckForFamily(family);
      if (recoveryId && freshId) {
        this.state.resolved[questionId] = "worked_then_recovery";
        this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId, nextId: `FRESH:${freshId}`, returnId: current.nextId, freshId, family, exitRemediation: false, fra26RepairFlow: true };
        this.lockInputs();
        this.elements.primary.textContent = "Try a short repair";
        this.elements.primary.disabled = false;
      } else {
        this.state.resolved[questionId] = "worked";
        this.lockInputs();
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
      }
      this.persist();
    }

    handleFra22Outcome(current, response, suppliedEvaluation) {
      const question = current.question;
      const questionId = current.questionId;
      const evaluation = suppliedEvaluation || window.RevilyFra22Canonical.evaluateResponse(question, response);
      const correct = evaluation.correct === true;
      const attempts = this.state.attempts[questionId] || 1;
      const visible = window.RevilyFra22Canonical.visibleFeedback(question, response, correct, attempts);
      const outcomeLines = this.fra22OutcomeLines(question, response, correct);

      if (correct) {
        this.state.resolved[questionId] = attempts === 1 ? "correct" : "correct_after_support";
        this.state.feedback[questionId] = "worked";
        if (question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) {
          const authoredId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
          const family = question.canonicalQuestion?.family === "CONTEXT" ? "CONTEXT" : question.canonicalQuestion?.family === "SELECT" ? "SELECT" : "DIRECT";
          const confirmationId = authoredId && !Object.values(this.state.evidence.freshnessSignature || {}).includes(this.model.getQuestion(authoredId)?.model?.freshnessSignature)
            ? authoredId
            : this.freshCheckForFamily(family, [questionId]);
          if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
            this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
            this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "hint_supported_success" });
          }
        }
        this.lockInputs();
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        this.showFeedback("correct", visible, question.scripts?.worked_explanation || "", "Your result");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.emit("worked_solution_shown", { question_id: questionId, answer_locked: true, correct: true, final_check: false });
        this.persist();
        if (outcomeLines.length) this.startNarration(outcomeLines, null);
        return;
      }

      const recorded = this.state.evidence.errorFamily[questionId];
      const family = recorded === "support_needed"
        ? (this.state.evidence.candidateErrorFamily[questionId] || evaluation.errorFamily || "UNKNOWN")
        : (recorded || evaluation.errorFamily || "UNKNOWN");
      const mustRepair = window.RevilyFra22Canonical.requiresImmediateRepair(question, response, attempts);
      const canRetry = current.recovery || (!question.policy?.answerLocksOnSubmit && attempts === 1 && !mustRepair);
      this.root.querySelector("#answer-form")?.classList.add("has-error");
      if (canRetry) {
        this.state.feedback[questionId] = "first_incorrect";
        const detail = current.recovery
          ? "Use the supported model, then try this check again."
          : question.policy?.hintPolicy === "optional"
            ? "Try again, or open the hint for one strategy clue."
            : "Use this mathematical cue, then try again.";
        this.showFeedback("hint", visible, detail, "Try again");
        this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.refocusInput();
        this.persist();
        if (outcomeLines.length) this.startNarration(outcomeLines, null);
        return;
      }

      const repairId = window.RevilyFra22Canonical.isBlockingFamily(family)
        ? this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family]
        : null;
      const supportedId = repairId ? this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family?.[family] : null;
      const freshId = this.freshCheckForFamily(family, [questionId]);
      this.state.feedback[questionId] = "worked";
      this.state.resolved[questionId] = repairId && supportedId && freshId ? "worked_then_recovery" : "worked";
      this.state.evidence.supportEscalated[questionId] = true;
      if (repairId && supportedId && freshId) {
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId: repairId,
          supportedId,
          freshId,
          returnId: current.nextId,
          family,
          fra22RepairFlow: true,
          exitRemediation: false
        };
      } else if (freshId && !this.state.evidence.pendingNoHintConfirmations.includes(freshId) && !this.state.evidence.freshConfirmationPassed[freshId]) {
        this.state.evidence.pendingNoHintConfirmations.push(freshId);
        this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: freshId, reason: family === "ARITHMETIC" ? "isolated_arithmetic_slip" : "unclassified_locked_response" });
      }
      this.lockInputs();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      this.showFeedback("support", visible, question.scripts?.worked_explanation || "", repairId ? "Targeted repair" : "Compare the working");
      this.elements.primary.textContent = repairId && supportedId && freshId ? "Try a quick repair" : "Continue";
      this.elements.primary.disabled = false;
      this.emit("worked_solution_shown", { question_id: questionId, answer_locked: true, correct: false, final_check: false, error_family: family, repair_queued: Boolean(repairId && supportedId && freshId) });
      this.persist();
      if (outcomeLines.length) this.startNarration(outcomeLines, null);
    }

    handleFra21Outcome(current, response, suppliedEvaluation) {
      const question = current.question;
      const questionId = current.questionId;
      const evaluation = suppliedEvaluation || window.RevilyFra21Canonical.evaluateResponse(question, response);
      const correct = evaluation.correct === true;
      const attempts = this.state.attempts[questionId] || 1;
      const visible = window.RevilyFra21Canonical.visibleFeedback(question, response, correct);
      const outcomeLines = this.fra21OutcomeLines(question, response, correct);

      if (correct) {
        this.state.resolved[questionId] = attempts === 1 ? "correct" : "correct_after_support";
        this.state.feedback[questionId] = "correct";
        if (question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) {
          const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
          if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
            this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
            this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "hint_supported_success" });
          }
        }
        this.lockInputs();
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "correct" });
        this.showFeedback("correct", visible, "", "Your result");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.persist();
        if (outcomeLines.length) this.startNarration(outcomeLines, null);
        return;
      }

      const recorded = this.state.evidence.errorFamily[questionId];
      const family = recorded === "support_needed"
        ? (this.state.evidence.candidateErrorFamily[questionId] || evaluation.matchedErrorFamily || "UNKNOWN")
        : (recorded || evaluation.matchedErrorFamily || "UNKNOWN");
      this.root.querySelector("#answer-form")?.classList.add("has-error");
      if (attempts === 1 || current.recovery) {
        this.state.feedback[questionId] = "first_incorrect";
        const detail = question.policy?.hintPolicy === "optional"
          ? "Try again, or open the hint for one strategy clue."
          : "Use the mathematical feedback, then try again.";
        this.showFeedback("hint", visible, detail, "Try again");
        this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.refocusInput();
        this.persist();
        if (outcomeLines.length) this.startNarration(outcomeLines, null);
        return;
      }

      const repairId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
      const freshId = window.RevilyFra21Canonical.selectFreshCheckId(family, [
        ...Object.keys(this.state.submissions || {}),
        ...(this.state.seenConfirmations || [])
      ]);
      this.state.feedback[questionId] = "support";
      this.state.evidence.supportEscalated[questionId] = true;
      if (repairId && freshId) {
        this.state.resolved[questionId] = "worked_then_recovery";
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId: repairId,
          nextId: `FRESH:${freshId}`,
          returnId: current.nextId,
          freshId,
          family,
          fra21RepairFlow: true,
          exitRemediation: false
        };
        this.lockInputs();
        this.elements.primary.textContent = "Try a quick repair";
        this.elements.primary.disabled = false;
        this.showFeedback("support", visible, "Use the short repair, then answer a fresh question.", "Next step");
      } else {
        if (freshId && family === "ARITHMETIC" && !this.state.evidence.pendingNoHintConfirmations.includes(freshId) && !this.state.evidence.freshConfirmationPassed[freshId]) {
          this.state.evidence.pendingNoHintConfirmations.push(freshId);
          this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: freshId, reason: "isolated_arithmetic_slip" });
        }
        this.state.resolved[questionId] = "worked";
        this.lockInputs();
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.showFeedback("support", visible, "Compare your first step with the matched-piece structure.", "Your result");
      }
      this.persist();
      if (outcomeLines.length) this.startNarration(outcomeLines, null);
    }

    handleFra11Correct(current) {
      const question = current.question;
      const questionId = current.questionId;
      const response = this.lastResponse(questionId);
      const evaluation = window.RevilyFra11Canonical.classifyResponse(question, response);
      this.state.resolved[questionId] = "correct";
      this.state.feedback[questionId] = "correct";
      if (question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) {
        const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
        if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
          this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
          this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId });
        }
      }
      this.persist();
      this.lockInputs();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      const registry = this.spec.canonical_lesson.runtime_copy;
      const runtimeLines = evaluation.runtimeUtteranceIds.map((id) => registry[id].text);
      const workedSteps = String(question.scripts?.worked_explanation || "").split(/(?=\d+\.\s)/).filter(Boolean);
      const visibleLead = evaluation.visibleFeedback || runtimeLines[0] || workedSteps.at(-1) || "Answer locked.";
      this.showFeedback("correct", visibleLead, question.scripts?.worked_explanation || "", "Answer locked");
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = runtimeLines.length > 0;
      this.emit("worked_solution_shown", { question_id: questionId, answer_locked: true, final_check: false });
      this.startNarration(runtimeLines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
    }

    handleFra11Incorrect(current) {
      const question = current.question;
      const questionId = current.questionId;
      const response = this.lastResponse(questionId);
      const evaluation = window.RevilyFra11Canonical.classifyResponse(question, response);
      const recordedFamily = this.state.evidence.errorFamily[questionId];
      const family = recordedFamily === "support_needed" ? evaluation.errorFamily : (recordedFamily || evaluation.errorFamily || "ARITH");
      const confirmedFamily = recordedFamily && recordedFamily !== "support_needed" && recordedFamily !== "ARITH" ? recordedFamily : null;
      const recoveryId = confirmedFamily ? this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[confirmedFamily] : null;
      const freshId = confirmedFamily ? this.freshCheckForFamily(confirmedFamily) : null;
      this.state.resolved[questionId] = "incorrect_locked";
      this.state.feedback[questionId] = "support";
      if (recoveryId && freshId) {
        this.state.evidence.supportEscalated[questionId] = true;
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId,
          nextId: `FRESH:${freshId}`,
          returnId: current.nextId,
          freshId,
          family: confirmedFamily,
          exitRemediation: false
        };
      }
      this.persist();
      this.lockInputs();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      const registry = this.spec.canonical_lesson.runtime_copy;
      const runtimeLines = evaluation.runtimeUtteranceIds.map((id) => registry[id].text);
      const workedSteps = String(question.scripts?.worked_explanation || "").split(/(?=\d+\.\s)/).filter(Boolean);
      const visibleLead = evaluation.visibleFeedback || runtimeLines[0] || workedSteps[0] || "Answer locked.";
      this.showFeedback("support", visibleLead, question.scripts?.worked_explanation || "", "Answer locked");
      this.elements.primary.textContent = recoveryId && freshId ? "Try a quick repair" : "Continue";
      this.elements.primary.disabled = runtimeLines.length > 0;
      this.emit("worked_solution_shown", { question_id: questionId, answer_locked: true, final_check: false, correct: false, error_family: family });
      this.startNarration(runtimeLines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
    }

    handleCorrect(current) {
      if (this.isFra11V1()) return this.handleFra11Correct(current);
      const question = current.question;
      const questionId = current.questionId;
      const attempts = this.state.attempts[questionId] || 1;
      this.state.resolved[questionId] = attempts === 1 ? "correct" : "correct_after_support";
      this.state.feedback[questionId] = "correct";
      if (question.policy?.requiresFreshNoHintConfirmationIfHintUsed && this.state.evidence.hintOpenedBeforeSubmit[questionId]) {
        const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
        if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
          this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
          this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId });
        }
      }
      if (question.policy?.requiresFreshNoHintConfirmationAfterSupport && attempts > 1) {
        const confirmationId = this.spec.lesson.adaptive_pathway?.no_hint_confirmation_by_question?.[questionId];
        if (confirmationId && !this.state.evidence.pendingNoHintConfirmations.includes(confirmationId) && !this.state.evidence.freshConfirmationPassed[confirmationId]) {
          this.state.evidence.pendingNoHintConfirmations.push(confirmationId);
          this.emit("fresh_confirmation_required", { origin_question_id: questionId, confirmation_question_id: confirmationId, reason: "supported_or_retried_success" });
        }
      }
      if (current.phase === "practice") this.state.practiceStreak += 1;
      if (this.isFra13V1() && ["FRA-13-I1", "FRA-13-I2"].includes(questionId)
        && attempts === 1
        && !this.state.evidence.hintOpenedBeforeSubmit[questionId]
        && !this.state.evidence.supportEscalated[questionId]
        && !this.state.evidence.noHintNonUnitSuccesses.includes(questionId)) {
        this.state.evidence.noHintNonUnitSuccesses.push(questionId);
      }
      const authoredFeedbackOnly = this.spec.experience_contract?.authored_feedback_only === true;
      const reaction = this.isRegistryRuntimeLesson() || authoredFeedbackOnly ? null : this.selectReaction(current, attempts);
      this.persist();
      this.lockInputs();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "correct" });
      const authoredReaction = question.scripts?.on_correct_reaction || "";
      const acknowledgement = this.isRegistryRuntimeLesson() || authoredFeedbackOnly ? authoredReaction : (reaction?.text || authoredReaction);
      const lines = this.isFra07V1()
        ? this.fra07OutcomeLines(question, this.lastResponse(questionId), true)
        : this.isFra13V1()
        ? this.fra13OutcomeLines(question, this.lastResponse(questionId), true)
        : this.isFra17V1()
          ? this.fra17OutcomeLines(question, this.lastResponse(questionId), true)
        : this.isFra20V1()
          ? this.fra20OutcomeLines(question, this.lastResponse(questionId), true)
        : this.isFra23V1()
          ? this.fra23OutcomeLines(question, this.lastResponse(questionId), true)
        : this.isFra24V1()
          ? this.fra24OutcomeLines(question, this.lastResponse(questionId), true)
        : (this.isRegistryRuntimeLesson()
          ? uniqueLines([authoredReaction])
          : authoredFeedbackOnly
            ? uniqueLines([authoredReaction || question.scripts?.on_correct_math])
            : uniqueLines([acknowledgement, question.scripts?.on_correct_math]));
      const worked = this.isRegistryRuntimeLesson() ? "" : (question.scripts?.on_correct_math || this.workedSummary(question));
      const visibleAcknowledgement = this.isFra07V1()
        ? window.RevilyFra07Canonical.visibleFeedback(question, this.lastResponse(questionId), true)
        : this.isFra10V1()
        ? window.RevilyFra10Adapter.visibleFeedback(question, this.lastResponse(questionId), null, true)
        : this.isFra17V1()
          ? window.RevilyFra17Canonical.visibleFeedback(question, this.lastResponse(questionId), true)
        : this.isFra20V1()
          ? window.RevilyFra20Canonical.visibleFeedback(question, this.lastResponse(questionId), true)
        : this.isFra23V1()
          ? window.RevilyFra23Canonical.visibleFeedback(question, this.lastResponse(questionId), true)
        : this.isFra24V1()
          ? window.RevilyFra24Canonical.visibleFeedback(question, this.lastResponse(questionId), true)
        : acknowledgement;
      this.showFeedback("correct", visibleAcknowledgement, worked, this.isFra07V1() ? "Your result" : undefined);
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      if (this.isFra10V1() && !lines.length) return;
      this.startNarration(lines, () => {
        if (current.recovery) this.finishRecovery();
        else this.advance(current);
      }, { resumeAction: "advance_current" });
    }

    fra07OutcomeLines(question, response, correct) {
      if (!this.isFra07V1()) return [];
      const ids = window.RevilyFra07Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    handleFra07Incorrect(current) {
      const question = current.question;
      const questionId = current.questionId;
      const response = this.lastResponse(questionId);
      const evaluation = window.RevilyFra07Canonical.evaluateResponse(question, response);
      const outcomeLines = this.fra07OutcomeLines(question, response, false);
      const visible = window.RevilyFra07Canonical.visibleFeedback(question, response, false);
      const recorded = this.state.evidence.errorFamily[questionId];
      const family = recorded === "support_needed"
        ? (this.state.evidence.candidateErrorFamily[questionId] || evaluation.errorFamily || "unknown")
        : (recorded || evaluation.errorFamily || "unknown");
      const exactEvidence = evaluation.classificationRule === "explicit_option_is_strong_evidence"
        || (recorded && !["support_needed", "unknown"].includes(recorded));
      const pending = this.state.pendingRecovery;

      const finishLockedOutcome = (buttonLabel) => {
        this.persist();
        this.lockInputs();
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "support" });
        this.showFeedback("support", visible, "", "Your result");
        this.elements.primary.textContent = buttonLabel;
        this.elements.primary.disabled = outcomeLines.length > 0;
        this.startNarration(outcomeLines, () => { this.elements.primary.disabled = false; }, { resumeAction: "enable_fra05_continue" });
      };

      if (pending?.fra07Discriminator && current.recovery) {
        const repairId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[question.primaryErrorFamily];
        const freshId = this.freshCheckForFamily(question.primaryErrorFamily);
        this.state.resolved[questionId] = "worked_then_recovery";
        this.state.feedback[questionId] = "support";
        this.state.evidence.supportEscalated[questionId] = true;
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId: repairId,
          freshId,
          returnId: pending.returnId,
          family: question.primaryErrorFamily,
          fra07DiscriminatorRepairQueued: true,
          exitRemediation: false
        };
        finishLockedOutcome(window.RevilyFra07Canonical.uiTextFor("BUTTON.CONTINUE"));
        return;
      }

      if (family === "unknown" && !current.recovery && !current.exit) {
        const visualFamilies = new Set(["visual_judgment", "visual_match", "cross_model_match"]);
        const discriminatorId = question.canonicalQuestion?.families?.some((item) => visualFamilies.has(item)) ? "D-VIS" : "D-SYM";
        this.state.resolved[questionId] = "worked_then_discriminator";
        this.state.feedback[questionId] = "support";
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId: `${this.spec.identity.id}-${discriminatorId}`,
          nextId: current.nextId,
          returnId: current.nextId,
          family: "unknown",
          fra07Discriminator: true,
          exitRemediation: false
        };
        finishLockedOutcome(window.RevilyFra07Canonical.uiTextFor("BUTTON.CONTINUE"));
        return;
      }

      if (exactEvidence && !current.recovery && !current.exit) {
        const repairId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
        const freshId = this.freshCheckForFamily(family);
        if (repairId && freshId) {
          this.state.resolved[questionId] = "worked_then_recovery";
          this.state.feedback[questionId] = "support";
          this.state.evidence.supportEscalated[questionId] = true;
          this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId: repairId, freshId, returnId: current.nextId, family, exitRemediation: false };
          finishLockedOutcome(window.RevilyFra07Canonical.uiTextFor("BUTTON.CONTINUE"));
          return;
        }
      }

      return this.handleFra05Incorrect(current);
    }

    handleIncorrect(current) {
      if (this.isFra11V1()) return this.handleFra11Incorrect(current);
      if (this.isFra07V1()) return this.handleFra07Incorrect(current);
      if (this.isRegistryRuntimeLesson()) return this.handleFra05Incorrect(current);
      const question = current.question;
      const questionId = current.questionId;
      const attempts = this.state.attempts[questionId];
      const hintOpened = this.state.evidence.hintOpened[questionId] === true;
      const optionalHint = question.policy?.hintPolicy === "optional";
      const recordedFamily = this.state.evidence.errorFamily[questionId];
      const family = recordedFamily === "support_needed"
        ? (this.state.evidence.candidateErrorFamily[questionId] || question.primaryErrorFamily || "unknown")
        : (recordedFamily || question.primaryErrorFamily || "unknown");
      const fra02Profile = ["fra02", "fra03", "fra04", "fra05", "fra06", "fra07", "fra08", "fra09", "fra10"].includes(this.spec.canonical_lesson?.engine_profile);
      const authoredFeedbackOnly = this.spec.identity?.id === "PA-01" || this.spec.experience_contract?.authored_feedback_only === true;
      if (current.phase === "practice") this.state.practiceStreak = 0;
      this.root.querySelector("#answer-form")?.classList.add("has-error");
      if (attempts === 1 && optionalHint && fra02Profile) {
        this.state.feedback[questionId] = "first_incorrect";
        const feedback = authoredFeedbackOnly
          ? question.scripts?.on_incorrect_attempt_1
          : this.targetedFeedback(question, this.lastResponse(questionId), family);
        const detail = hintOpened
          ? (question.mathematical_support?.hint_1 || "Use the open hint, then try again.")
          : "You can retry now or open Ask for a hint.";
        this.showFeedback("hint", feedback, detail);
        this.startNarration(uniqueLines([feedback, hintOpened ? detail : ""]), null);
        this.refocusInput();
        this.persist();
        return;
      }
      if (attempts === 1 && optionalHint && !hintOpened) {
        this.state.feedback[questionId] = "first_incorrect";
        const feedback = this.targetedFeedback(question, this.lastResponse(questionId), family);
        this.showFeedback("hint", feedback, "You can retry now or open Ask for a hint.");
        this.startNarration([feedback], null);
        this.refocusInput();
        this.persist();
        return;
      }
      if (attempts === 1 && !optionalHint) {
        this.state.feedback[questionId] = "first_incorrect";
        this.emit("hint_shown", { question_id: questionId, level: 1 });
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "hint", response: this.lastResponse(questionId) });
        const feedback = authoredFeedbackOnly
          ? question.scripts?.on_incorrect_attempt_1
          : this.targetedFeedback(question, this.lastResponse(questionId), family);
        const hint = question.mathematical_support?.hint_1 || question.scripts?.on_incorrect_attempt_1 || "";
        this.showFeedback("hint", feedback, hint);
        this.startNarration(uniqueLines([feedback, hint]), null);
        this.refocusInput();
        this.persist();
        return;
      }

      this.state.feedback[questionId] = "support";
      this.state.evidence.supportEscalated[questionId] = true;
      const feedback = authoredFeedbackOnly
        ? question.scripts?.on_incorrect_attempt_2
        : this.targetedFeedback(question, this.lastResponse(questionId), family);
      const workedDetail = authoredFeedbackOnly
        ? question.scripts?.worked_explanation
        : "Let’s repair that exact idea, then try a fresh question.";
      if (authoredFeedbackOnly) {
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "support" });
      }
      this.showFeedback("support", feedback, workedDetail);
      const recoveryRef = current.recovery ? null : this.recoveryForMisconception(
        family,
        question,
        this.model.recoveryByOrigin.get(current.id) || question.recovery_item_ref || current.recoveryRef
      );
      if (recoveryRef) {
        this.state.resolved[questionId] = "worked_then_recovery";
        const freshId = this.freshCheckForFamily(family);
        this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId: recoveryRef, nextId: freshId ? `FRESH:${freshId}` : current.nextId, returnId: current.nextId, freshId, family, exitRemediation: false };
        this.elements.primary.textContent = "Try a quick repair";
        this.elements.primary.disabled = false;
        this.lockInputs();
        this.startNarration([feedback], null);
      } else if (current.recovery) {
        if (!authoredFeedbackOnly) {
          this.showFeedback("support", feedback, question.scripts?.on_incorrect_attempt_2 || question.scripts?.worked_explanation || "Try the corrected idea in the open field.");
        }
        this.elements.primary.textContent = "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.startNarration(this.supportNarrationLines(question, question.scripts?.on_incorrect_attempt_2), null);
        this.refocusInput();
      } else if (fra02Profile) {
        const nextClue = question.scripts?.on_incorrect_attempt_2 || question.mathematical_support?.hint_1 || feedback;
        this.showFeedback("support", feedback, nextClue);
        this.elements.primary.textContent = "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.startNarration(uniqueLines([feedback, nextClue]), null);
        this.refocusInput();
      } else {
        this.state.resolved[questionId] = "worked";
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.lockInputs();
        this.startNarration(this.supportNarrationLines(question, question.scripts?.on_incorrect_attempt_2), null);
      }
      this.persist();
    }

    handleFra05Incorrect(current) {
      const question = current.question;
      const questionId = current.questionId;
      const attempts = this.state.attempts[questionId] || 1;
      const recordedFamily = this.state.evidence.errorFamily[questionId];
      const family = recordedFamily === "support_needed"
        ? (this.state.evidence.candidateErrorFamily[questionId] || question.primaryErrorFamily || "unknown")
        : (recordedFamily || question.primaryErrorFamily || "unknown");
      const outcomeLines = this.isFra07V1()
        ? this.fra07OutcomeLines(question, this.lastResponse(questionId), false)
        : this.isFra16V1()
        ? this.fra16OutcomeLines(question, this.lastResponse(questionId), false)
        : this.isFra13V1()
          ? this.fra13OutcomeLines(question, this.lastResponse(questionId), false)
          : this.isFra17V1()
            ? this.fra17OutcomeLines(question, this.lastResponse(questionId), false)
          : this.isFra20V1()
            ? this.fra20OutcomeLines(question, this.lastResponse(questionId), false)
          : this.isFra23V1()
            ? this.fra23OutcomeLines(question, this.lastResponse(questionId), false)
          : this.isFra24V1()
            ? this.fra24OutcomeLines(question, this.lastResponse(questionId), false)
            : [];
      const feedback = outcomeLines[0] || this.targetedFeedback(question, this.lastResponse(questionId), family)
        || question.scripts?.on_incorrect_attempt_1;
      const visibleFeedback = this.isFra07V1()
        ? window.RevilyFra07Canonical.visibleFeedback(question, this.lastResponse(questionId), false)
        : this.isFra10V1()
        ? window.RevilyFra10Adapter.visibleFeedback(question, this.lastResponse(questionId), family, false)
        : this.isFra17V1()
          ? window.RevilyFra17Canonical.visibleFeedback(question, this.lastResponse(questionId), false)
        : this.isFra20V1()
          ? window.RevilyFra20Canonical.visibleFeedback(question, this.lastResponse(questionId), false)
        : this.isFra23V1()
          ? window.RevilyFra23Canonical.visibleFeedback(question, this.lastResponse(questionId), false)
        : this.isFra24V1()
          ? window.RevilyFra24Canonical.visibleFeedback(question, this.lastResponse(questionId), false)
        : feedback;
      const repairNow = this.isFra10V1()
        && window.RevilyFra10Adapter.shouldRepairNow(question, this.lastResponse(questionId), family, attempts, this.state);
      this.root.querySelector("#answer-form")?.classList.add("has-error");
      if (attempts === 1 && !repairNow && !(current.recovery && (this.isFra23V1() || this.isFra24V1()))) {
        this.state.feedback[questionId] = "first_incorrect";
        const detail = this.isFra07V1() ? "" : question.policy?.hintPolicy === "optional"
          ? "Try again, or open the hint if you want a strategy clue."
          : "Use the cue, then try the question again.";
        this.showFeedback("hint", visibleFeedback, detail, this.isFra07V1() ? "Your result" : "Try again");
        this.startNarration((this.isFra17V1() || this.isFra20V1() || this.isFra23V1() || this.isFra24V1()) ? outcomeLines : (outcomeLines.length ? outcomeLines : [feedback]), null);
        if (this.isFra08V1()) this.prepareFra08Retry(question);
        else this.refocusInput();
        this.persist();
        return;
      }
      if (current.recovery && (this.isFra23V1() || this.isFra24V1())) {
        this.state.resolved[questionId] = "worked";
        this.state.feedback[questionId] = "support";
        this.state.evidence.supportEscalated[questionId] = true;
        this.lockInputs();
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        this.showFeedback("support", visibleFeedback, question.scripts?.worked_explanation || "", "Repair check locked");
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = outcomeLines.length > 0;
        this.persist();
        this.startNarration(outcomeLines, () => {
          this.elements.primary.disabled = false;
          this.finishRecovery();
        }, { resumeAction: "advance_current" });
        return;
      }
      if (current.recovery) {
        this.state.feedback[questionId] = "support";
        this.showFeedback("support", visibleFeedback, this.isFra07V1() ? "" : "Use the repair example, then try this fresh check again.", this.isFra07V1() ? "Your result" : "Try again");
        this.elements.primary.textContent = question.attempt_policy?.submit_label || "Check answer";
        this.elements.primary.disabled = this.readResponse(question) === null;
        this.startNarration((this.isFra17V1() || this.isFra20V1() || this.isFra23V1() || this.isFra24V1()) ? outcomeLines : (outcomeLines.length ? outcomeLines : [feedback]), null);
        if (this.isFra08V1()) this.prepareFra08Retry(question);
        else this.refocusInput();
        this.persist();
        return;
      }
      this.state.feedback[questionId] = "support";
      this.state.evidence.supportEscalated[questionId] = true;
      const recoveryRef = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family]
        || question.recovery_item_ref || current.recoveryRef;
      const authoredFra16FreshId = this.isFra16V1() ? this.spec.lesson.adaptive_pathway?.repair_fresh_by_error_family?.[family] : null;
      const freshId = authoredFra16FreshId || this.freshCheckForFamily(family);
      const fra16SupportedId = this.isFra16V1() ? this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family?.[family] : null;
      const repairCap = Number(this.spec.lesson.exit?.mastery_policy?.repairCycleCapPerFamily) || 1;
      const repairAvailable = !(this.isFra13V1() || this.isFra17V1() || this.isFra20V1() || this.isFra23V1() || this.isFra24V1()) || Number(this.state.evidence.repairCyclesUsed[family] || 0) < repairCap;
      if (recoveryRef && freshId && repairAvailable) {
        if (this.isFra13V1() || this.isFra17V1() || this.isFra20V1() || this.isFra23V1() || this.isFra24V1()) this.state.evidence.repairCyclesUsed[family] = Number(this.state.evidence.repairCyclesUsed[family] || 0) + 1;
        this.state.resolved[questionId] = "worked_then_recovery";
        this.state.pendingRecovery = {
          originId: current.id, originQuestionId: questionId, recoveryId: recoveryRef,
          nextId: `FRESH:${freshId}`, returnId: current.nextId, freshId, family, exitRemediation: false,
          fra16RepairFlow: this.isFra16V1(), supportedId: fra16SupportedId
        };
        this.lockInputs();
        this.elements.primary.textContent = "Try a quick repair";
        this.elements.primary.disabled = false;
      } else {
        if ((this.isFra13V1() || this.isFra17V1() || this.isFra20V1() || this.isFra23V1() || this.isFra24V1()) && !repairAvailable) {
          this.state.resolved[questionId] = "worked";
          this.lockInputs();
          this.elements.primary.textContent = "Continue";
          this.elements.primary.disabled = false;
          this.emit("repair_cycle_cap_reached", { question_id: questionId, family, cap: repairCap });
        } else {
          if (this.isFra08V1()) this.prepareFra08Retry(question);
          else {
            this.elements.primary.textContent = "Check answer";
            this.elements.primary.disabled = this.readResponse(question) === null;
            this.refocusInput();
          }
        }
      }
      this.showFeedback("support", visibleFeedback, recoveryRef ? "Use the short repair, then answer a fresh question." : "Use the cue and try again.", "Next step");
      this.startNarration((this.isFra17V1() || this.isFra20V1() || this.isFra23V1() || this.isFra24V1()) ? outcomeLines : (outcomeLines.length ? outcomeLines : [feedback]), null);
      this.persist();
    }

    fra13OutcomeLines(question, response, correct) {
      if (!this.isFra13V1()) return [];
      const ids = window.RevilyFra13Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra16OutcomeLines(question, response, correct) {
      if (!this.isFra16V1()) return [];
      const ids = window.RevilyFra16Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra17OutcomeLines(question, response, correct) {
      if (!this.isFra17V1()) return [];
      const ids = window.RevilyFra17Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra20OutcomeLines(question, response, correct) {
      if (!this.isFra20V1()) return [];
      const ids = window.RevilyFra20Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra21OutcomeLines(question, response, correct) {
      if (!this.isFra21V1()) return [];
      const ids = window.RevilyFra21Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra22OutcomeLines(question, response, correct) {
      if (!this.isFra22V1()) return [];
      const attempts = this.state.attempts[question?.id] || 1;
      const ids = window.RevilyFra22Canonical?.selectOutcomeUtteranceIds?.(question, response, correct, attempts) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra23OutcomeLines(question, response, correct) {
      if (!this.isFra23V1()) return [];
      const ids = window.RevilyFra23Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra24OutcomeLines(question, response, correct) {
      if (!this.isFra24V1()) return [];
      const ids = window.RevilyFra24Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    fra28OutcomeLines(question, response) {
      const evaluation = window.RevilyFra28Canonical?.evaluateResponse?.(question, response);
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return (evaluation?.utteranceIds || []).map((id) => registry[id]?.text).filter(Boolean);
    }

    fra26OutcomeLines(question, response, correct) {
      if (!this.isFra26V1()) return [];
      const ids = window.RevilyFra26Canonical?.selectOutcomeUtteranceIds?.(question, response, correct) || [];
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      return ids.map((id) => registry[id]?.text || "").filter(Boolean);
    }

    targetedFeedback(question, response, family) {
      if (this.isFra07V1()) return window.RevilyFra07Canonical?.visibleFeedback?.(question, response, false) || "";
      if (this.isFra15V1()) return this.fra15OutcomeLines(question, response)[0] || "";
      if (this.isFra16V1()) return this.fra16OutcomeLines(question, response, false)[0] || "";
      if (this.isFra13V1()) return this.fra13OutcomeLines(question, response, false)[0] || "";
      if (this.isFra17V1()) return window.RevilyFra17Canonical?.visibleFeedback?.(question, response, false) || "";
      if (this.isFra20V1()) return window.RevilyFra20Canonical?.visibleFeedback?.(question, response, false) || "";
      if (this.isFra21V1()) return window.RevilyFra21Canonical?.visibleFeedback?.(question, response, false) || "";
      if (this.isFra22V1()) return window.RevilyFra22Canonical?.visibleFeedback?.(question, response, false, this.state.attempts[question?.id] || 1) || "";
      if (this.isFra23V1()) return window.RevilyFra23Canonical?.visibleFeedback?.(question, response, false) || "";
      if (this.isFra24V1()) return window.RevilyFra24Canonical?.visibleFeedback?.(question, response, false) || "";
      if (this.isFra26V1()) return window.RevilyFra26Canonical?.visibleFeedback?.(question, response, false) || "";
      if (this.isFra12V1()) {
        const ids = window.RevilyFra12Canonical?.selectOutcomeUtteranceIds?.(question, response, false) || [];
        const registry = this.spec.canonical_lesson?.runtime_copy || {};
        return ids.map((id) => registry[id]?.text || "").find(Boolean) || "";
      }
      if (this.isFra10V1()) {
        const ids = window.RevilyFra10Adapter.outcomeUtteranceIds(question, false);
        const registry = this.spec.canonical_lesson?.runtime_copy || {};
        return ids.map((id) => registry[id]?.text || "").find(Boolean) || "";
      }
      if (this.isFra08V1()) {
        const ids = window.RevilyFra08Canonical?.selectOutcomeUtteranceIds?.(question, response, false) || [];
        const registry = this.spec.canonical_lesson?.runtime_copy || {};
        return ids.map((id) => registry[id]?.text || "").find(Boolean) || "";
      }
      const value = response && typeof response === "object" && "value" in response ? response.value : response;
      const responseKey = Array.isArray(value)
        ? value.map(String).sort().join("|")
        : value && typeof value === "object" && "n" in value && "d" in value
          ? `${value.n}/${value.d}`
          : String(value ?? "");
      if (question?.scripts?.response_feedback?.[responseKey]) return question.scripts.response_feedback[responseKey];
      if (family && question?.scripts?.family_feedback?.[family]) return question.scripts.family_feedback[family];
      if (family && question?.scripts?.error_family_feedback?.[family]) return question.scripts.error_family_feedback[family];
      if (/^DEC-/.test(this.spec.identity?.id || "")) {
        return question?.scripts?.on_incorrect_attempt_1 || question?.mathematical_support?.hint_1 || "";
      }
      if (this.isRegistryRuntimeLesson()) return question?.scripts?.on_incorrect_attempt_1 || question?.scripts?.on_incorrect_reaction || "";
      if (question?.id === "FRA-01-I2" && value === "B") return question.scripts?.option_B || "The counts match, but check whether the parts are equal.";
      if (question?.id === "FRA-01-I2" && value === "C") return question.scripts?.option_C || "Check how many parts make the whole.";
      if (question?.response?.presentation === "guided_builder" && response && typeof response === "object") {
        if (Number(response.d) !== Number(question.model?.totalParts)) return question.scripts?.whole_count || "Start with the whole.";
        if (Number(response.n) !== Number(question.model?.selectedParts)) return question.scripts?.selected_count || "Count only the part asked about.";
      }
      return this.misconceptionFeedback(family);
    }

    freshCheckForFamily(family, exclusions) {
      if (this.isFra10V1()) {
        const selected = window.RevilyFra10Adapter.selectFreshCheckId(this, family, exclusions);
        if (selected && !this.state.seenConfirmations.includes(selected)) this.state.seenConfirmations.push(selected);
        return selected;
      }
      if (this.isFra21V1()) {
        const selected = window.RevilyFra21Canonical.selectFreshCheckId(family, [
          ...(exclusions || []),
          ...Object.keys(this.state.submissions || {}),
          ...(this.state.seenConfirmations || [])
        ]);
        if (selected && !this.state.seenConfirmations.includes(selected)) this.state.seenConfirmations.push(selected);
        return selected;
      }
      if (this.isFra22V1()) {
        const selected = window.RevilyFra22Canonical.selectFreshCheckId(family, this.state, [
          ...(exclusions || []),
          ...Object.keys(this.state.submissions || {}),
          ...Object.keys(this.state.exit.responses || {}),
          ...(this.state.seenConfirmations || [])
        ]);
        if (selected && !this.state.seenConfirmations.includes(selected)) this.state.seenConfirmations.push(selected);
        return selected;
      }
      const blocked = new Set([...(exclusions || []), ...this.state.seenConfirmations]);
      const candidates = this.spec.lesson.adaptive_pathway?.fresh_checks_by_error_family?.[family]
        || this.spec.lesson.adaptive_pathway?.fresh_checks_by_error_family?.unknown
        || [];
      const selected = candidates.find((id) => !blocked.has(id) && !this.state.evidence.freshConfirmationPassed[id]);
      if (selected && !this.state.seenConfirmations.includes(selected)) this.state.seenConfirmations.push(selected);
      return selected || null;
    }

    handleExitSubmission(current, response, correct) {
      this.state.exit.responses[current.questionId] = { response: serialiseResponse(response), correct };
      this.lockInputs();
      this.showSavedExitResponse(current, correct, true);
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = this.isRegistryRuntimeLesson() && current.question?.policy?.solutionPolicy === "after_locked_submit";
      this.persist();
      if (current.confirmation) {
        this.state.exit.confirmationId = current.questionId;
        const remediation = this.state.exit.remediation;
        if (!remediation) {
          if (correct) this.state.exit.result = "SECURE";
          else this.beginExitRepair(this.state.exit.missedPrimaryIds, 1, "borderline");
        } else if (!correct) {
          this.state.exit.result = "NEEDS_WORK";
        } else {
          remediation.successes += 1;
          if (remediation.successes >= remediation.requiredSuccesses) this.state.exit.result = "SECURE";
          else this.beginNextExitRepair();
        }
        this.persist();
        return;
      }
      const completedPrimaries = this.model.exitIds.every((id) => this.state.exit.responses[id]);
      if (!completedPrimaries) return;
      const score = this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct).length;
      const missed = this.model.exitIds.filter((id) => !this.state.exit.responses[id]?.correct);
      this.state.exit.primaryScore = score;
      this.state.exit.missedPrimaryIds = missed;
      const mastery = this.spec.lesson.exit?.mastery_policy;
      if (this.isFra28V1() && mastery?.profile === "fra28_five_item") {
        this.routeFra28FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra07V1() && mastery?.profile === "fra07_four_item") {
        this.routeFra07FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra17V1() && mastery?.profile === "fra17_four_item") {
        this.routeFra17FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra26V1() && mastery?.profile === "fra26_four_item") {
        this.routeFra26FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra23V1() && mastery?.profile === "fra23_five_item") {
        this.routeFra23FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra24V1() && mastery?.profile === "fra24_five_item") {
        this.routeFra24FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra20V1() && mastery?.profile === "fra20_four_item") {
        this.routeFra20FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra21V1() && mastery?.profile === "fra21_five_item") {
        this.routeFra21FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra22V1() && mastery?.profile === "fra22_five_item") {
        this.routeFra22FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra16V1() && mastery?.profile === "fra16_five_item") {
        this.routeFra16FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra14V1() && mastery?.profile === "fra14_five_item") {
        this.routeFra14FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra15V1() && mastery?.profile === "fra15_five_item") {
        this.routeFra15FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra11V1() && mastery?.profile === "fra11_five_item") {
        this.routeFra11FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra12V1() && mastery?.profile === "fra12_five_item") {
        this.routeFra12FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra13V1() && mastery?.profile === "fra13_five_item") {
        this.routeFra13FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra08V1() && mastery?.profile === "fra08_five_item") {
        this.routeFra08FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra10V1() && mastery?.profile === "fra10_five_item") {
        this.routeFra10FinalEvidence(score, missed);
        this.persist();
        return;
      }
      if (this.isFra09V1() && mastery) {
        const correctFamilies = new Set(this.model.exitIds
          .filter((id) => this.state.exit.responses[id]?.correct)
          .map((id) => this.model.getQuestion(id)?.evidenceFamily)
          .filter(Boolean));
        const central = new Set(mastery.repeatedCentralFamilies || []);
        const errorCounts = {};
        this.model.exitIds.forEach((id) => {
          const family = this.state.evidence.errorFamily[id];
          if (central.has(family)) errorCounts[family] = (errorCounts[family] || 0) + 1;
        });
        const repeatedCentral = Object.values(errorCounts).some((count) => count >= 2);
        const secure = score >= mastery.secureMinimum
          && (!mastery.requireMoreThanOneEvidenceFamily || correctFamilies.size > 1)
          && (!mastery.blockRepeatedCentralMisconception || !repeatedCentral);
        if (secure) this.state.exit.result = "SECURE";
        else this.beginFra09ExitRecovery(missed, score === 2 ? "targeted_two" : "fresh_final");
        this.persist();
        return;
      }
      if (mastery && ["fra02", "fra03", "fra04", "fra05", "fra06", "fra07", "fra08", "fra09", "fra10"].includes(this.spec.canonical_lesson?.engine_profile)) {
        const correctFamilies = new Set(this.model.exitIds
          .filter((id) => this.state.exit.responses[id]?.correct)
          .map((id) => this.model.getQuestion(id)?.evidenceFamily)
          .filter(Boolean));
        const repeatedCentral = this.repeatedCentralMisconceptions(mastery.repeatedCentralFamilies || []);
        const enoughFamilies = !mastery.requireMoreThanOneEvidenceFamily || correctFamilies.size > 1;
        if (score >= mastery.secureMinimum && enoughFamilies && (!mastery.blockRepeatedCentralMisconception || !repeatedCentral.length)) {
          this.state.exit.result = "SECURE";
        } else if (score === 2) {
          this.beginExitRepair(missed, mastery.twoCorrectRequiredFreshSuccesses || 2, "targeted_two");
        } else if (score <= 1) {
          this.beginExitRepair(missed, mastery.zeroOrOneCorrectRequiredFreshSuccesses || 4, "fresh_final");
        } else {
          const centralPrimaries = this.model.exitIds.filter((id) => repeatedCentral.includes(this.model.getQuestion(id)?.primaryErrorFamily));
          this.beginExitRepair(centralPrimaries.length ? centralPrimaries : (missed.length ? missed : this.model.exitIds), mastery.twoCorrectRequiredFreshSuccesses || 2, "central_misconception_check");
        }
      } else if (score === this.model.exitIds.length) this.state.exit.result = "SECURE";
      else if (score === this.model.exitIds.length - 1) this.queueExitConfirmation(missed[0]);
      else this.beginExitRepair(missed, 2, "foundational");
      this.persist();
    }

    fra28FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return { questionId, family: question?.evidenceFamily || question?.family || "unknown", correct: saved?.correct === true, firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true, hintUsed: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true, errorFamily: saved?.correct ? null : ((recorded === "support_needed" ? candidate : recorded) || candidate || "AMBIGUOUS") };
      });
    }

    routeFra28FinalEvidence(score, missed) {
      const records = this.fra28FinalRecords(this.model.exitIds);
      const evaluation = window.RevilyFra28Canonical.evaluateFinalEvidence(records);
      if (evaluation.route === "finish") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra28", route: "finish", primaryRecords: records, evaluation };
        this.emit("fra28_final_route_selected", { route: "finish", score, repeated_blocking_families: evaluation.repeatedBlockingFamilies });
        return;
      }
      const failedIds = (missed || []).map((id) => String(id).replace("FRA-28-", ""));
      const requiredSuccesses = evaluation.route === "repair_then_two_item_mini_check" ? 2 : 3;
      const recoveryIds = window.RevilyFra28Canonical.selectRecoveryQuestionIds(failedIds, requiredSuccesses);
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const failedFamilies = (missed || []).map((id) => {
        const recorded = this.state.evidence.errorFamily[id];
        const candidate = this.state.evidence.candidateErrorFamily[id];
        return (recorded === "support_needed" ? candidate : recorded) || candidate || "AMBIGUOUS";
      });
      const repairQueue = [...new Set(failedFamilies)].filter((family) => repairMap[family]).map((family) => ({ family, id: repairMap[family] }));
      this.state.exit.remediation = { profile: "fra28", route: evaluation.route, primaryRecords: records, evaluation, repairQueue, repairIndex: 0, recoveryIds, recoveryIndex: 0, requiredSuccesses, results: [] };
      this.emit("fra28_final_route_selected", { route: evaluation.route, score, missed_question_ids: missed, repair_families: repairQueue.map((entry) => entry.family), recovery_question_ids: recoveryIds });
      this.beginNextFra28RecoveryStep();
    }

    beginNextFra28RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra28") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = { originId: this.state.exit.missedPrimaryIds[0]?.replace("FRA-28-", "") || "M1", originQuestionId: this.state.exit.missedPrimaryIds[0] || null, recoveryId: repair.id, family: repair.family, returnId: "COMPLETE", exitRemediation: true, fra28FinalRecovery: true, fra28RepairFlow: true };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) {
        this.state.exit.result = remediation.results.length === remediation.requiredSuccesses && remediation.results.every((result) => result.correct) ? "SECURE" : "NEEDS_WORK";
        this.state.pendingRecovery = null;
        this.state.freshContext = null;
        this.state.cursor = "COMPLETE";
        return;
      }
      this.state.pendingRecovery = null;
      this.state.freshContext = { questionId, family: this.model.getQuestion(questionId)?.evidenceFamily || "unknown", returnId: "COMPLETE", exitRemediation: true, fra28FinalRecovery: true, correct: null };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra28Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra28") return;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({ questionId: current.questionId, correct });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (!correct) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.cursor = "COMPLETE";
        this.emit("fra28_recovery_failed", { question_id: current.questionId, route: remediation.route });
        return;
      }
      this.beginNextFra28RecoveryStep();
    }

    fra26FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return {
          questionId,
          family: question?.evidenceFamily || "DIRECT",
          correct: saved?.correct === true,
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
          errorFamily: saved?.correct ? null : ((recorded === "support_needed" ? candidate : recorded) || candidate || "unknown")
        };
      });
    }

    fra26RepeatedCentral(records) {
      const central = new Set(["reverse_incomplete", "integer_unchanged", "zero_has_reciprocal", "sign_opposite", "value_changed"]);
      const counts = {};
      (records || []).forEach((record) => {
        if (central.has(record.errorFamily)) counts[record.errorFamily] = (counts[record.errorFamily] || 0) + 1;
      });
      return Object.values(counts).some((count) => count >= 2);
    }

    routeFra26FinalEvidence(score, missed) {
      const records = this.fra26FinalRecords(this.model.exitIds);
      const distinctFamiliesCorrect = new Set(records.filter((record) => record.correct).map((record) => record.family)).size;
      const repeatedCentralMisconception = this.fra26RepeatedCentral(records);
      const route = window.RevilyFra26Approved.selectPrimaryFinalRoute({
        correctCount: score,
        distinctFamiliesCorrect,
        repeatedCentralMisconception
      });
      if (route === "complete") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra26", route, primaryRecords: records };
        this.emit("fra26_final_route_selected", { route, score, distinct_families_correct: distinctFamiliesCorrect, repeated_central_misconception: repeatedCentralMisconception });
        return;
      }
      const recordedFamilies = missed.map((id) => {
        const recorded = this.state.evidence.errorFamily[id];
        return (recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[id] : recorded)
          || this.state.evidence.candidateErrorFamily[id]
          || "unknown";
      });
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairQueue = [...new Set(recordedFamilies)]
        .filter((family) => repairMap[family])
        .map((family) => ({ family, id: repairMap[family] }));
      const recoveryIds = window.RevilyFra26Canonical.selectRecoveryQuestionIds(route, recordedFamilies);
      const expectedCount = route === "repair_then_two_item_mini_check" ? 2 : 4;
      if (recoveryIds.length !== expectedCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra26", route: "incomplete_authored_recovery_bank", primaryRecords: records };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra26",
        route,
        primaryRecords: records,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        results: []
      };
      this.emit("fra26_final_route_selected", { route, score, missed_question_ids: missed, repair_families: repairQueue.map((entry) => entry.family), recovery_question_ids: recoveryIds });
      this.beginNextFra26RecoveryStep();
    }

    beginNextFra26RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra26") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        const repairQuestion = this.model.getQuestion(repair.id);
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          freshId: repairQuestion?.freshCheckId,
          family: repair.family,
          returnId: "COMPLETE",
          exitRemediation: true,
          fra26FinalRecovery: true,
          fra26RepairFlow: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra26RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.evidenceFamily || "DIRECT",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra26FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra26Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra26") return;
      const recorded = this.state.evidence.errorFamily[current.questionId];
      const candidate = this.state.evidence.candidateErrorFamily[current.questionId];
      remediation.results.push({
        questionId: current.questionId,
        correct: this.state.freshContext?.correct === true,
        firstAttemptCorrect: (this.state.attempts[current.questionId] || 0) === 1 && this.state.freshContext?.correct === true,
        family: current.question?.evidenceFamily || "DIRECT",
        errorFamily: this.state.freshContext?.correct === true ? null : ((recorded === "support_needed" ? candidate : recorded) || candidate || "unknown")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra26RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra26RecoverySequence();
    }

    finishFra26RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra26") return;
      const results = remediation.results || [];
      const correct = results.filter((record) => record.correct && record.firstAttemptCorrect);
      const correctCount = correct.length;
      const distinctFamiliesCorrect = new Set(correct.map((record) => record.family)).size;
      const repeatedCentralMisconception = this.fra26RepeatedCentral(results);
      const mini = remediation.route === "repair_then_two_item_mini_check";
      const passed = mini
        ? results.length === 2 && correctCount === 2 && !repeatedCentralMisconception
        : results.length === 4 && correctCount >= 3 && distinctFamiliesCorrect >= 2 && !repeatedCentralMisconception;
      remediation.recoveryEvaluation = { correctCount, distinctFamiliesCorrect, repeatedCentralMisconception, passed };
      this.state.exit.result = passed ? "SECURE" : "NEEDS_WORK";
      this.state.freshContext = null;
      this.state.pendingRecovery = null;
      this.emit("fra26_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation });
      this.persist();
      this.finishExit();
    }

    fra07FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return {
          questionId,
          family: window.RevilyFra07Canonical.finalFamily(questionId),
          firstAttemptCorrect: saved?.correct === true && this.state.evidence.firstAttemptCorrect[questionId] === true,
          independent: question?.policy?.countsAsIndependentEvidence === true,
          hintUsed: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
          canonicalSignature: question?.policy?.canonicalSignature || "",
          errorFamily: saved?.correct ? null : (recorded === "support_needed" ? candidate : recorded) || candidate || "unknown"
        };
      });
    }

    routeFra07FinalEvidence(score, missed) {
      const records = this.fra07FinalRecords(this.model.exitIds);
      const evaluation = window.RevilyFra07Canonical.evaluateFinalEvidence(records);
      if (evaluation.masterySatisfied) {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra07", route: "primary_mastery", primaryEvaluation: evaluation };
        this.emit("fra07_final_route_selected", { route: "finish", score, evaluation });
        return;
      }
      const desiredCount = evaluation.route === "repair_then_fresh_two" ? 2 : 4;
      const recoveryIds = window.RevilyFra07Canonical.selectRecoveryQuestionIds(missed, desiredCount);
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const defaultByFinal = { M1: "partition_count", M2: "inconsistent_factor", M3: "partition_count", M4: "additive" };
      const missedFamilies = missed.map((id) => {
        const recorded = this.state.evidence.errorFamily[id];
        const candidate = this.state.evidence.candidateErrorFamily[id];
        const observed = recorded === "support_needed" ? candidate : (recorded || candidate);
        return observed && observed !== "unknown" ? observed : defaultByFinal[id.replace(`${this.spec.identity.id}-`, "")];
      });
      const repairFamilies = [...new Set([...(evaluation.repeatedBlockingFamilies || []), ...missedFamilies])].filter((family) => repairMap[family]);
      const repairQueue = repairFamilies.map((family) => ({ family, id: repairMap[family] }));
      if (recoveryIds.length !== desiredCount || !repairQueue.length) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra07", route: "incomplete_authored_recovery", primaryEvaluation: evaluation, recoveryIds };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra07",
        route: evaluation.route,
        primaryEvaluation: evaluation,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        results: []
      };
      this.emit("fra07_final_route_selected", { route: evaluation.route, score, missed_question_ids: missed, repair_families: repairFamilies, recovery_question_ids: recoveryIds });
      this.beginNextFra07RecoveryStep();
    }

    beginNextFra07RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra07") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        const repairQuestion = this.model.getQuestion(repair.id);
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          freshId: repairQuestion?.freshCheckId,
          returnId: "COMPLETE",
          family: repair.family,
          fra07FinalRecovery: true,
          exitRemediation: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra07RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = { questionId, family: window.RevilyFra07Canonical.finalFamily(questionId), returnId: "COMPLETE", exitRemediation: true, fra07FinalRecovery: true, correct: null };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra07Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra07") return;
      const questionId = current.questionId;
      remediation.results.push({ questionId, correct: this.state.freshContext?.correct === true, firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra07RecoveryStep();
        this.persist();
        return this.render();
      }
      return this.finishFra07RecoverySequence();
    }

    finishFra07RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra07") return;
      const records = this.fra07FinalRecords(remediation.recoveryIds);
      const evaluation = window.RevilyFra07Canonical.evaluateFinalEvidence(records);
      const passed = remediation.route === "repair_then_fresh_two"
        ? remediation.results.length === 2 && remediation.results.every((result) => result.correct && result.firstAttemptCorrect)
        : evaluation.masterySatisfied;
      remediation.recoveryEvaluation = evaluation;
      remediation.recoveryPassed = passed;
      this.state.exit.result = passed ? "SECURE" : "NEEDS_WORK";
      this.state.freshContext = null;
      this.state.pendingRecovery = null;
      this.emit("fra07_recovery_final_completed", { result: this.state.exit.result, evidence_question_ids: remediation.recoveryIds, evaluation });
      this.persist();
      return this.finishExit();
    }

    fra17FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return {
          questionId,
          family: question?.evidenceFamily,
          correct: saved?.correct === true,
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
          countsAsIndependentEvidence: question?.policy?.countsAsIndependentEvidence === true,
          answerValueCorrect: this.state.evidence.answerValueCorrect[questionId] === true,
          answerFormCorrect: this.state.evidence.answerFormCorrect[questionId] === true,
          errorFamily: saved?.correct ? null : (recorded === "support_needed" ? candidate : recorded) || candidate || "UNKNOWN"
        };
      });
    }

    routeFra17FinalEvidence(score, missed) {
      const records = this.fra17FinalRecords(this.model.exitIds);
      const repeatedDenominator = this.repeatedCentralMisconceptions(["DEN_ADD", "DEN_MOVE"]).length > 0;
      const evaluation = window.RevilyFra17Canonical?.evaluateFinalEvidence?.(records, repeatedDenominator);
      const route = window.RevilyFra17Canonical?.routeFinal?.(records, repeatedDenominator);
      if (evaluation?.masterySatisfied && route === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra17", route: "primary_mastery", primaryEvaluation: evaluation };
        this.emit("fra17_final_route_selected", { route: "primary_mastery", score, evaluation });
        return;
      }
      const desiredCount = route === "targeted_repair_then_two_item_check" ? 2 : 4;
      const recoveryIds = window.RevilyFra17Canonical?.selectRecoveryQuestionIds?.(desiredCount, [
        ...Object.keys(this.state.submissions || {}),
        ...Object.keys(this.state.exit.responses || {}),
        ...(this.state.seenConfirmations || [])
      ]) || [];
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const missedFamilies = missed.map((id) => {
        const recorded = this.state.evidence.errorFamily[id];
        return recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[id] : (recorded || this.state.evidence.candidateErrorFamily[id]);
      });
      const repairFamilies = [...new Set([...missedFamilies, ...(repeatedDenominator ? ["DEN_ADD"] : [])])]
        .filter((family) => family && repairMap[family]);
      const repairQueue = repairFamilies.map((family) => ({ family, id: repairMap[family] }));
      if (recoveryIds.length !== desiredCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra17", route: "incomplete_authored_recovery_bank", primaryEvaluation: evaluation };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra17",
        route,
        primaryEvaluation: evaluation,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        results: []
      };
      this.emit("fra17_final_route_selected", { route, score, missed_question_ids: missed, repair_families: repairFamilies, recovery_question_ids: recoveryIds });
      this.beginNextFra17RecoveryStep();
    }

    beginNextFra17RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra17") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          family: repair.family,
          exitRemediation: true,
          fra17FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra17RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.evidenceFamily || "UNKNOWN",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra17FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra17Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra17") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        firstAttemptCorrect: (this.state.attempts[questionId] || 0) === 1 && correct,
        family: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || "UNKNOWN")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra17RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra17RecoverySequence();
    }

    finishFra17RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra17") return;
      const results = remediation.results || [];
      const allCorrectFirstTry = results.length === remediation.recoveryIds.length && results.every((result) => result.correct && result.firstAttemptCorrect);
      const families = new Set(results.filter((result) => result.correct).map((result) => result.family));
      const coverage = remediation.recoveryIds.length === 2
        ? families.has("DIRECT") && [...families].some((family) => family !== "DIRECT")
        : families.has("DIRECT") && [...families].some((family) => ["VIS", "CONTEXT", "ERROR", "REASON"].includes(family));
      const repeatedDenominator = results.filter((result) => ["DEN_ADD", "DEN_MOVE"].includes(result.errorFamily)).length >= 2;
      this.state.exit.result = allCorrectFirstTry && coverage && !repeatedDenominator ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { allCorrectFirstTry, coverage, repeatedDenominator, evidenceFamilies: [...families] };
      this.state.freshContext = null;
      this.emit("fra17_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation });
      this.persist();
      this.finishExit();
    }

    fra22FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => window.RevilyFra22Canonical.evidenceRecord(questionId, this.state, this.state.exit.responses));
    }

    routeFra22FinalEvidence(score, missed) {
      const records = this.fra22FinalRecords(this.model.exitIds);
      const decision = window.RevilyFra22Canonical.source.decideFinalRoute(records);
      if (decision.kind === "complete") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra22", route: "primary_mastery", primaryDecision: decision, primaryRecords: records };
        this.emit("fra22_final_route_selected", { route: "primary_mastery", score, decision });
        return;
      }

      const seenIds = [...new Set([
        ...Object.keys(this.state.submissions || {}),
        ...Object.keys(this.state.exit.responses || {}),
        ...(this.state.seenConfirmations || [])
      ].map(window.RevilyFra22Canonical.unprefix))];
      const seenSignatures = [...new Set(Object.values(this.state.evidence.freshnessSignature || {}).filter(Boolean))];
      const selection = window.RevilyFra22Canonical.source.selectUnusedRecoveryQuestions(
        decision.requiredFreshCount,
        decision.repairFamilies,
        seenIds,
        seenSignatures
      );
      const recoveryIds = selection.questionIds.map(window.RevilyFra22Canonical.prefix);
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairQueue = [...new Set(decision.repairFamilies)]
        .filter((family) => repairMap[family])
        .map((family) => ({ family, id: repairMap[family], supportedId: this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family?.[family] }));
      if (!selection.complete || recoveryIds.length !== decision.requiredFreshCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra22", route: "incomplete_authored_recovery_pool", primaryDecision: decision, primaryRecords: records, recoverySelection: selection };
        this.emit("fra22_recovery_pool_exhausted", { score, decision, recovery_selection: selection, generation_attempted: false });
        return;
      }
      this.state.exit.remediation = {
        profile: "fra22",
        route: decision.kind,
        primaryDecision: decision,
        primaryRecords: records,
        repairQueue,
        repairIndex: 0,
        repairResults: [],
        recoveryIds,
        recoveryIndex: 0,
        requiredCount: decision.requiredFreshCount,
        results: []
      };
      this.emit("fra22_final_route_selected", { route: decision.kind, score, missed_question_ids: missed, repair_families: decision.repairFamilies, recovery_question_ids: recoveryIds });
      this.beginNextFra22RecoveryStep();
    }

    beginNextFra22RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra22") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          supportedId: repair.supportedId,
          family: repair.family,
          exitRemediation: true,
          fra22FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, supported_question_id: repair.supportedId, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra22RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.evidenceFamily || "UNKNOWN",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra22FinalRecovery: true,
        correct: null,
        countsAsFreshEvidence: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra22Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra22") return;
      const context = this.state.freshContext || {};
      const correct = context.correct === true;
      const countsAsFreshEvidence = context.countsAsFreshEvidence === true;
      const recorded = this.state.evidence.errorFamily[current.questionId];
      const candidate = this.state.evidence.candidateErrorFamily[current.questionId];
      remediation.results.push({
        questionId: current.questionId,
        correct,
        countsAsFreshEvidence,
        firstAttemptCorrect: (this.state.attempts[current.questionId] || 0) === 1 && correct,
        errorFamily: correct ? null : ((recorded === "support_needed" ? candidate : recorded) || candidate || "UNKNOWN")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      this.beginNextFra22RecoveryStep();
      this.persist();
      this.render();
    }

    finishFra22RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra22") return;
      const results = remediation.results || [];
      const allCorrectFreshFirstTry = results.length === remediation.requiredCount
        && results.every((result) => result.correct && result.firstAttemptCorrect && result.countsAsFreshEvidence);
      const blockerCounts = {};
      results.forEach((result) => {
        if (!window.RevilyFra22Canonical.isBlockingFamily(result.errorFamily)) return;
        blockerCounts[result.errorFamily] = (blockerCounts[result.errorFamily] || 0) + 1;
      });
      const repeatedBlocker = Object.values(blockerCounts).some((count) => count >= 2);
      const repairChecksPassed = (remediation.repairResults || []).every((result) => result.correct);
      this.state.exit.result = allCorrectFreshFirstTry && repairChecksPassed && !repeatedBlocker ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { allCorrectFreshFirstTry, repairChecksPassed, repeatedBlocker, blockerCounts, required: remediation.requiredCount };
      this.state.freshContext = null;
      this.emit("fra22_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation });
      this.persist();
      this.finishExit();
    }

    fra23FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        const family = saved?.correct ? null : ((recorded === "support_needed" ? candidate : recorded) || candidate || "UNKNOWN");
        return {
          questionId,
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
          attempts: this.state.attempts[questionId] || 0,
          hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
          supportEscalated: this.state.evidence.supportEscalated[questionId] === true,
          supportLevel: question?.stage || "final",
          answerLocked: this.state.evidence.answerLocked[questionId] === true,
          errorFamilyHypothesis: family,
          freshConfirmationPassed: this.state.evidence.freshConfirmationPassed[questionId] === true
        };
      });
    }

    routeFra23FinalEvidence(score, missed) {
      const records = this.fra23FinalRecords(this.model.exitIds);
      const decision = window.RevilyFra23Canonical.evaluateFinalEvidence(records);
      if (decision.route === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra23", route: decision.route, primaryDecision: decision, primaryRecords: records };
        this.emit("fra23_final_route_selected", { route: decision.route, score, decision });
        return;
      }
      const missedFamilies = records.filter((record) => !record.firstAttemptCorrect).map((record) => record.errorFamilyHypothesis || "UNKNOWN");
      if (decision.repeatedBlockingFamily) missedFamilies.unshift(decision.repeatedBlockingFamily);
      const recoveryIds = window.RevilyFra23Canonical.selectRecoveryQuestionIds(decision.route, missedFamilies);
      const expectedCount = decision.route === "targeted_repair_then_two_item_check" ? 2 : 5;
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const supportedMap = this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family || {};
      const repairFamilies = [...new Set(missedFamilies)]
        .map((family) => repairMap[family] ? family : "UNKNOWN")
        .filter((family, index, values) => values.indexOf(family) === index && repairMap[family]);
      const repairQueue = repairFamilies.map((family) => ({ family, id: repairMap[family], supportedId: supportedMap[family] || null }));
      if (recoveryIds.length !== expectedCount || !repairQueue.length) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra23", route: "incomplete_authored_recovery", primaryDecision: decision, recoveryIds };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra23",
        route: decision.route,
        primaryDecision: decision,
        primaryRecords: records,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        expectedRecoveryCount: expectedCount,
        results: []
      };
      this.emit("fra23_final_route_selected", { route: decision.route, score, missed_question_ids: missed, repair_families: repairFamilies, recovery_question_ids: recoveryIds });
      this.beginNextFra23RecoveryStep();
    }

    beginNextFra23RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra23") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          supportedId: repair.supportedId,
          family: repair.family,
          exitRemediation: true,
          fra23FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, supported_question_id: repair.supportedId, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra23RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.evidenceFamily || "UNKNOWN",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra23FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra23Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra23") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        firstAttemptCorrect: (this.state.attempts[questionId] || 0) === 1 && correct,
        family: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || "UNKNOWN")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra23RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra23RecoverySequence();
    }

    finishFra23RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra23") return;
      const results = remediation.results || [];
      const correctCount = results.filter((result) => result.correct && result.firstAttemptCorrect).length;
      const passed = remediation.route === "targeted_repair_then_two_item_check"
        ? results.length === 2 && correctCount === 2
        : results.length === 5 && correctCount >= 4;
      this.state.exit.result = passed ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { passed, correctCount, required: remediation.route === "targeted_repair_then_two_item_check" ? 2 : 4, results: [...results] };
      this.state.freshContext = null;
      this.emit("fra23_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation });
      this.persist();
      this.finishExit();
    }

    fra24FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        const family = saved?.correct ? null : ((recorded === "support_needed" ? candidate : recorded) || candidate || "unknown");
        return {
          questionId,
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
          attempts: this.state.attempts[questionId] || 0,
          hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
          supportEscalated: this.state.evidence.supportEscalated[questionId] === true,
          supportLevel: question?.stage || "final",
          answerLocked: this.state.evidence.answerLocked[questionId] === true,
          errorFamilyHypothesis: family,
          freshConfirmationPassed: this.state.evidence.freshConfirmationPassed[questionId] === true,
          mathematicallyEquivalentButFormIncomplete: this.state.evidence.answerValueCorrect[questionId] === true && this.state.evidence.answerFormCorrect[questionId] === false
        };
      });
    }

    routeFra24FinalEvidence(score, missed) {
      const records = this.fra24FinalRecords(this.model.exitIds);
      const decision = window.RevilyFra24Canonical.evaluateFinalEvidence(records);
      if (decision.route === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra24", route: decision.route, primaryDecision: decision, primaryRecords: records };
        this.emit("fra24_final_route_selected", { route: decision.route, score, decision });
        return;
      }
      const missedFamilies = records
        .filter((record) => !record.firstAttemptCorrect)
        .map((record) => record.errorFamilyHypothesis || "unknown");
      if (decision.repeatedBlockingFamily) missedFamilies.unshift(decision.repeatedBlockingFamily);
      const seenIds = [
        ...Object.keys(this.state.submissions || {}),
        ...Object.keys(this.state.exit.responses || {}),
        ...(this.state.seenConfirmations || [])
      ];
      const recoveryIds = window.RevilyFra24Canonical.selectRecoveryQuestionIds(
        decision.route,
        missedFamilies,
        seenIds,
        this.state.attemptId
      );
      const expectedCount = decision.route === "repair_then_two_item_check" ? 2 : 3;
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairFamilies = [...new Set(missedFamilies)]
        .map((family) => repairMap[family] ? family : "unknown")
        .filter((family, index, values) => values.indexOf(family) === index && repairMap[family]);
      const repairQueue = repairFamilies.map((family) => ({ family, id: repairMap[family] }));
      if (recoveryIds.length !== expectedCount || !repairQueue.length) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra24", route: "incomplete_authored_recovery", primaryDecision: decision, recoveryIds };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra24",
        route: decision.route,
        primaryDecision: decision,
        primaryRecords: records,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        expectedRecoveryCount: expectedCount,
        results: []
      };
      this.emit("fra24_final_route_selected", { route: decision.route, score, missed_question_ids: missed, repair_families: repairFamilies, recovery_question_ids: recoveryIds });
      this.beginNextFra24RecoveryStep();
    }

    beginNextFra24RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra24") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          family: repair.family,
          exitRemediation: true,
          fra24FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra24RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.evidenceFamily || "unknown",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra24FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra24Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra24") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        firstAttemptCorrect: (this.state.attempts[questionId] || 0) === 1 && correct,
        family: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || "unknown")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra24RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra24RecoverySequence();
    }

    finishFra24RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra24") return;
      const results = remediation.results || [];
      const allCorrectFirstTry = results.length === remediation.expectedRecoveryCount
        && results.every((result) => result.correct && result.firstAttemptCorrect);
      this.state.exit.result = allCorrectFirstTry ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { allCorrectFirstTry, required: remediation.expectedRecoveryCount, results: [...results] };
      this.state.freshContext = null;
      this.emit("fra24_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation });
      this.persist();
      this.finishExit();
    }

    fra21FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return {
          questionId,
          stage: question?.stage || "final",
          correct: saved?.correct === true,
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
          countsAsIndependentEvidence: question?.policy?.countsAsIndependentEvidence === true,
          attempts: this.state.attempts[questionId] || 0,
          hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
          supportEscalated: this.state.evidence.supportEscalated[questionId] === true,
          answerLocked: this.state.evidence.answerLocked[questionId] === true,
          errorFamily: saved?.correct ? null : ((recorded === "support_needed" ? candidate : recorded) || candidate || "UNKNOWN"),
          assessmentFamilies: Array.isArray(question?.evidenceFamily) ? [...question.evidenceFamily] : [question?.evidenceFamily].filter(Boolean)
        };
      });
    }

    routeFra21FinalEvidence(score, missed) {
      const records = this.fra21FinalRecords(this.model.exitIds);
      const repeatedFamilies = this.repeatedCentralMisconceptions(["BOTH", "SCALE", "EARLY", "ORDER", "DENOM"]);
      const route = window.RevilyFra21Canonical.routeFinal(records, repeatedFamilies.length > 0);
      if (route === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra21", route, primaryRecords: records };
        this.emit("fra21_final_route_selected", { route, score, repeated_blocking_families: repeatedFamilies });
        return;
      }

      const requiredCount = route === "repair_then_three_item_final" ? 3 : 2;
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const observedFamilies = [...new Set([
        ...records.filter((record) => !record.correct).map((record) => record.errorFamily),
        ...repeatedFamilies
      ].filter((family) => family && repairMap[family]))];
      const repairQueue = observedFamilies.map((family) => ({ family, id: repairMap[family] }));
      const preferredFamilies = [...new Set(records.filter((record) => !record.correct).flatMap((record) => record.assessmentFamilies))];
      const seen = [
        ...Object.keys(this.state.submissions || {}),
        ...Object.keys(this.state.exit.responses || {}),
        ...(this.state.seenConfirmations || [])
      ];
      let recoveryIds = [];
      try {
        recoveryIds = window.RevilyFra21Canonical.selectRecoveryQuestionIds(requiredCount, preferredFamilies, seen, Number(this.state.attempts[this.model.exitIds[0]] || 1));
      } catch (_error) {
        recoveryIds = [];
      }
      if (recoveryIds.length !== requiredCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra21", route: "incomplete_authored_recovery_bank", primaryRecords: records };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra21",
        route,
        primaryRecords: records,
        repairQueue,
        repairIndex: 0,
        repairResults: [],
        recoveryIds,
        recoveryIndex: 0,
        recoveryResults: [],
        requiredCount
      };
      this.emit("fra21_final_route_selected", { route, score, repair_families: observedFamilies, recovery_question_ids: recoveryIds });
      this.beginNextFra21FinalStep();
    }

    beginNextFra21FinalStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra21") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        const freshId = window.RevilyFra21Canonical.selectFreshCheckId(repair.family, [
          ...Object.keys(this.state.submissions || {}),
          ...(this.state.seenConfirmations || [])
        ]);
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          freshId,
          family: repair.family,
          exitRemediation: true,
          fra21FinalRecovery: true,
          fra21FinalRecoveryState: { repairFamily: repair.family }
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, confirmation_question_id: freshId, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra21FinalRecovery();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.evidenceFamily || [],
        returnId: "COMPLETE",
        exitRemediation: true,
        fra21FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra21FinalRepair(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra21") return;
      const correct = this.state.freshContext?.correct === true;
      remediation.repairResults.push({ questionId: current.questionId, correct, family: this.state.freshContext?.fra21FinalRecoveryState?.repairFamily || "UNKNOWN" });
      this.state.freshContext = null;
      this.beginNextFra21FinalStep();
      this.persist();
      this.render();
    }

    advanceFra21FinalRecovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra21") return;
      const correct = this.state.freshContext?.correct === true;
      remediation.recoveryResults.push({
        questionId: current.questionId,
        correct,
        firstAttemptCorrect: (this.state.attempts[current.questionId] || 0) === 1 && correct,
        assessmentFamilies: Array.isArray(current.question?.evidenceFamily) ? [...current.question.evidenceFamily] : [current.question?.evidenceFamily].filter(Boolean),
        errorFamily: correct ? null : (this.state.evidence.candidateErrorFamily[current.questionId] || this.state.evidence.errorFamily[current.questionId] || "UNKNOWN")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      this.beginNextFra21FinalStep();
      this.persist();
      this.render();
    }

    finishFra21FinalRecovery() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra21") return;
      const results = remediation.recoveryResults || [];
      const allCorrectFirstTry = results.length === remediation.requiredCount && results.every((result) => result.correct && result.firstAttemptCorrect);
      const procedural = results.some((result) => result.assessmentFamilies.includes("PROCEDURAL"));
      const reasoningOrApplication = results.some((result) => result.assessmentFamilies.includes("REASONING_APPLICATION"));
      const repairChecksPassed = (remediation.repairResults || []).every((result) => result.correct);
      const repeatedBlocking = results.filter((result) => ["BOTH", "SCALE", "EARLY", "ORDER", "DENOM"].includes(result.errorFamily)).length >= 2;
      this.state.exit.result = allCorrectFirstTry && procedural && reasoningOrApplication && repairChecksPassed && !repeatedBlocking ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { allCorrectFirstTry, procedural, reasoningOrApplication, repairChecksPassed, repeatedBlocking };
      this.state.freshContext = null;
      this.emit("fra21_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation });
      this.persist();
      this.finishExit();
    }

    fra20FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return {
          questionId,
          family: question?.evidenceFamily,
          correct: saved?.correct === true,
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
          countsAsIndependentEvidence: question?.policy?.countsAsIndependentEvidence === true,
          answerValueCorrect: this.state.evidence.answerValueCorrect[questionId] === true,
          answerFormCorrect: this.state.evidence.answerFormCorrect[questionId] === true,
          errorFamily: saved?.correct ? null : (recorded === "support_needed" ? candidate : recorded) || candidate || "UNKNOWN"
        };
      });
    }

    fra20RecoverySeed(score) {
      const text = `${this.state.attemptId || "fra20"}:${score}:${Object.keys(this.state.submissions || {}).length}`;
      let hash = 2166136261;
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    }

    routeFra20FinalEvidence(score, missed) {
      const records = this.fra20FinalRecords(this.model.exitIds);
      const centralFamilies = this.repeatedCentralMisconceptions(["DEN_CHANGE", "ADD", "ORDER", "RENAME", "VIS"]);
      const repeatedCentral = centralFamilies.length > 0;
      const evaluation = window.RevilyFra20Canonical?.evaluateFinalEvidence?.(records, repeatedCentral);
      const route = window.RevilyFra20Canonical?.routeFinal?.(records, repeatedCentral);
      if (evaluation?.masterySatisfied && route === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra20", route: "primary_mastery", primaryEvaluation: evaluation };
        this.emit("fra20_final_route_selected", { route: "primary_mastery", score, evaluation });
        return;
      }

      const desiredCount = route === "fresh_direct_confirmation" ? 1 : route === "targeted_repair_then_two_item_check" ? 2 : 4;
      const exclusions = [
        ...Object.keys(this.state.submissions || {}),
        ...Object.keys(this.state.exit.responses || {}),
        ...(this.state.seenConfirmations || [])
      ];
      const recoveryIds = route === "fresh_direct_confirmation"
        ? [`${this.spec.identity.id}-C-M1`]
        : window.RevilyFra20Canonical?.selectRecoveryQuestionIds?.(desiredCount, this.fra20RecoverySeed(score), exclusions) || [];
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const missedFamilies = missed.map((id) => {
        const recorded = this.state.evidence.errorFamily[id];
        return recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[id] : (recorded || this.state.evidence.candidateErrorFamily[id]);
      });
      const repairFamilies = [...new Set([...missedFamilies, ...centralFamilies])]
        .map((family) => family === "COPY" ? "UNKNOWN" : family)
        .filter((family) => family && repairMap[family]);
      const repairQueue = repairFamilies.map((family) => ({ family, id: repairMap[family] }))
        .filter((repair, index, values) => values.findIndex((candidate) => candidate.id === repair.id) === index);
      if (recoveryIds.length !== desiredCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra20", route: "incomplete_authored_recovery_bank", primaryEvaluation: evaluation };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra20",
        route,
        primaryEvaluation: evaluation,
        repairQueue: route === "fresh_direct_confirmation" ? [] : repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        recoverySeed: this.fra20RecoverySeed(score),
        results: [],
        directConfirmationExpanded: false
      };
      this.emit("fra20_final_route_selected", { route, score, missed_question_ids: missed, repair_families: repairFamilies, recovery_question_ids: recoveryIds, recovery_seed: this.state.exit.remediation.recoverySeed });
      this.beginNextFra20RecoveryStep();
    }

    beginNextFra20RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra20") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          family: repair.family,
          exitRemediation: true,
          fra20FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra20RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.evidenceFamily || "UNKNOWN",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra20FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1, recovery_seed: remediation.recoverySeed });
    }

    advanceFra20Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra20") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        firstAttemptCorrect: (this.state.attempts[questionId] || 0) === 1 && correct,
        family: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || "UNKNOWN")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra20RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra20RecoverySequence();
    }

    finishFra20RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra20") return;
      const results = remediation.results || [];
      if (remediation.route === "fresh_direct_confirmation" && !results.every((result) => result.correct && result.firstAttemptCorrect) && !remediation.directConfirmationExpanded) {
        const failed = results.find((result) => !result.correct) || results[0];
        const family = failed?.errorFamily === "COPY" ? "UNKNOWN" : (failed?.errorFamily || "UNKNOWN");
        const repairId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family] || this.spec.lesson.adaptive_pathway?.repair_by_error_family?.UNKNOWN;
        const exclusions = [...Object.keys(this.state.submissions || {}), ...Object.keys(this.state.exit.responses || {}), ...(this.state.seenConfirmations || [])];
        remediation.route = "fresh_direct_confirmation_missed_targeted_repair_then_two_item_check";
        remediation.directConfirmationExpanded = true;
        remediation.repairQueue = repairId ? [{ family, id: repairId }] : [];
        remediation.repairIndex = 0;
        remediation.recoveryIds = window.RevilyFra20Canonical?.selectRecoveryQuestionIds?.(2, remediation.recoverySeed + 1, exclusions) || [];
        remediation.recoveryIndex = 0;
        remediation.results = [];
        if (remediation.recoveryIds.length !== 2) {
          this.state.exit.result = "NEEDS_WORK";
          this.finishExit();
          return;
        }
        this.beginNextFra20RecoveryStep();
        this.persist();
        return this.render();
      }

      const allCorrectFirstTry = results.length === remediation.recoveryIds.length && results.every((result) => result.correct && result.firstAttemptCorrect);
      const families = new Set(results.filter((result) => result.correct).map((result) => result.family).filter(Boolean));
      const repeatedCentral = ["DEN_CHANGE", "ADD", "ORDER", "RENAME", "VIS"].some((family) => results.filter((result) => result.errorFamily === family).length >= 2);
      let secure = false;
      if (remediation.recoveryIds.length === 1) {
        secure = allCorrectFirstTry && families.has("DIRECT");
      } else if (remediation.recoveryIds.length === 2) {
        secure = allCorrectFirstTry && families.has("DIRECT") && families.size >= 2 && !repeatedCentral;
      } else {
        const records = results.map((result) => ({ questionId: result.questionId, family: result.family, firstAttemptCorrect: result.firstAttemptCorrect, countsAsIndependentEvidence: true }));
        secure = window.RevilyFra20Canonical?.evaluateFinalEvidence?.(records, repeatedCentral)?.masterySatisfied === true;
      }
      this.state.exit.result = secure ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { allCorrectFirstTry, secure, repeatedCentral, evidenceFamilies: [...families] };
      this.state.freshContext = null;
      this.emit("fra20_recovery_completed", { route: remediation.route, result: this.state.exit.result, evaluation: remediation.recoveryEvaluation, recovery_seed: remediation.recoverySeed });
      this.persist();
      this.finishExit();
    }

    fra10FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const response = this.state.exit.responses[questionId];
        return {
          questionId,
          family: question?.evidenceFamily || "procedural",
          correct: response?.correct === true,
          independent: question?.policy?.countsAsIndependentEvidence === true,
          hintUsed: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
          errorFamily: response?.correct ? null : (this.state.evidence.errorFamily[questionId] || this.state.evidence.candidateErrorFamily[questionId] || question?.primaryErrorFamily || "unknown")
        };
      });
    }

    routeFra10FinalEvidence(score, missed) {
      const records = this.fra10FinalRecords(this.model.exitIds);
      const evaluation = window.RevilyFra10Adapter.evaluateFinalEvidence(records);
      if (evaluation.masterySatisfied) {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra10", route: "finish_candidate", primaryEvaluation: evaluation };
        return;
      }

      const requiredCount = evaluation.route === "repair_blocker_then_one_fresh_confirmation" ? 1
        : evaluation.route === "targeted_repair_then_two_item_check" ? 2 : 3;
      const missedFamilies = missed.map((id) => this.state.evidence.errorFamily[id]
        || this.state.evidence.candidateErrorFamily[id]
        || this.model.getQuestion(id)?.primaryErrorFamily)
        .filter((family) => family && family !== "unknown" && family !== "support_needed");
      evaluation.repeatedBlockingFamilies.forEach((family) => missedFamilies.push(family));
      if (!evaluation.proceduralFamilyCorrect) missedFamilies.push("one_side");
      if (!evaluation.reasoningOrApplicationFamilyCorrect) missedFamilies.push("smaller_numbers");
      const families = [...new Set(missedFamilies.length ? missedFamilies : ["stop_early"])];
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairQueue = families.map((family) => ({ family, id: repairMap[family] })).filter((item) => item.id);
      if (!repairQueue.length && repairMap.stop_early) repairQueue.push({ family: "stop_early", id: repairMap.stop_early });
      const recoveryIds = window.RevilyFra10Adapter.selectRecoveryQuestionIds(this, families, requiredCount);
      if (!repairQueue.length || recoveryIds.length !== requiredCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra10", route: "incomplete_authored_recovery", primaryEvaluation: evaluation };
        return;
      }
      const firstRepair = repairQueue.shift();
      this.state.exit.remediation = {
        profile: "fra10",
        route: evaluation.route,
        primaryEvaluation: evaluation,
        repairFamilies: [firstRepair.family, ...repairQueue.map((item) => item.family)],
        recoveryIds,
        requiredSuccesses: requiredCount
      };
      this.state.pendingRecovery = {
        originId: missed[0]?.replace(`${this.spec.identity.id}-`, "") || "M5",
        originQuestionId: missed[0] || this.model.exitIds[0],
        recoveryId: firstRepair.id,
        repairQueue,
        fra10FinalRecovery: true,
        fra10RecoveryIds: recoveryIds,
        family: firstRepair.family,
        exitRemediation: true
      };
      this.state.cursor = `RECOVERY:${firstRepair.id}`;
      this.emit("fra10_final_recovery_started", { score, route: evaluation.route, repair_families: this.state.exit.remediation.repairFamilies, recovery_question_ids: recoveryIds });
    }

    fra13FinalRecords(questionIds, responseStore) {
      const store = responseStore || this.state.exit.responses;
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = store[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return {
          questionId,
          correct: saved?.correct === true,
          evidenceFamily: question?.evidenceFamily,
          errorFamily: saved?.correct ? null : (recorded === "support_needed" ? candidate : recorded) || candidate || question?.primaryErrorFamily || "unknown"
        };
      });
    }

    routeFra13FinalEvidence(score, missed) {
      const records = this.fra13FinalRecords(this.model.exitIds);
      const evaluation = window.RevilyFra13Canonical?.evaluateFinalEvidence?.(records, 5);
      if (evaluation?.masterySatisfied) {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra13", route: "primary_mastery", primaryEvaluation: evaluation };
        this.emit("fra13_final_route_selected", { route: "primary_mastery", score, evaluation });
        return;
      }
      const desiredCount = score === 3 ? 2 : 5;
      const recoveryIds = window.RevilyFra13Canonical?.selectRecoveryQuestionIds?.(missed, desiredCount) || [];
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const cap = Number(this.spec.lesson.exit?.mastery_policy?.repairCycleCapPerFamily) || 1;
      const families = [...new Set(records.filter((record) => !record.correct).map((record) => record.errorFamily))]
        .filter((family) => family && family !== "unknown" && family !== "support_needed" && repairMap[family]);
      const cappedFamilies = families.filter((family) => Number(this.state.evidence.repairCyclesUsed[family] || 0) >= cap);
      if (cappedFamilies.length) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra13", route: "repair_cycle_cap_reached", primaryEvaluation: evaluation, cappedFamilies };
        this.emit("fra13_final_route_selected", { route: "repair_cycle_cap_reached", score, capped_families: cappedFamilies });
        return;
      }
      const repairQueue = families
        .filter((family) => Number(this.state.evidence.repairCyclesUsed[family] || 0) < cap)
        .map((family) => ({ family, id: repairMap[family] }));
      if (recoveryIds.length !== desiredCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra13", route: "incomplete_recovery_bank", primaryEvaluation: evaluation };
        return;
      }
      this.state.exit.remediation = {
        profile: "fra13",
        route: score === 3 ? "score_three_two_fresh" : "score_zero_to_two_alternate_final",
        primaryEvaluation: evaluation,
        repairQueue,
        repairIndex: 0,
        introId: this.spec.lesson.adaptive_pathway?.recovery_intro?.[score === 3 ? "mini" : "alternate"],
        introComplete: false,
        recoveryIds,
        recoveryIndex: 0,
        results: []
      };
      this.emit("fra13_final_route_selected", { route: this.state.exit.remediation.route, score, missed_question_ids: missed, repair_families: families, recovery_question_ids: recoveryIds });
      this.beginNextFra13RecoveryStep();
    }

    beginNextFra13RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra13") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.evidence.repairCyclesUsed[repair.family] = Number(this.state.evidence.repairCyclesUsed[repair.family] || 0) + 1;
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          family: repair.family,
          exitRemediation: true,
          fra13FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      if (!remediation.introComplete && remediation.introId) {
        remediation.introComplete = true;
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: remediation.introId,
          family: "unknown",
          exitRemediation: true,
          fra13FinalRecovery: true,
          fra13RecoveryIntro: true
        };
        this.state.cursor = `RECOVERY:${remediation.introId}`;
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra13RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.primaryErrorFamily || "unknown",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra13FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra13Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra13") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        evidenceFamily: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.errorFamily[questionId] === "support_needed"
          ? this.state.evidence.candidateErrorFamily[questionId]
          : this.state.evidence.errorFamily[questionId]) || this.state.evidence.candidateErrorFamily[questionId] || current.question?.primaryErrorFamily || "unknown"
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra13RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra13RecoverySequence();
    }

    finishFra13RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra13") return;
      const results = remediation.results || [];
      if (remediation.route === "score_three_two_fresh") {
        this.state.exit.result = results.length === 2 && results.every((result) => result.correct) ? "SECURE" : "NEEDS_WORK";
      } else {
        const evaluation = window.RevilyFra13Canonical?.evaluateFinalEvidence?.(results, 5);
        remediation.recoveryEvaluation = evaluation;
        this.state.exit.result = evaluation?.masterySatisfied ? "SECURE" : "NEEDS_WORK";
      }
      this.state.freshContext = null;
      this.emit("fra13_recovery_completed", { route: remediation.route, result: this.state.exit.result, results });
      this.persist();
      this.finishExit();
    }

    fra12FinalRecords(questionIds) {
      return window.RevilyFra12Canonical?.finalRecords?.(
        questionIds,
        this.state.exit.responses,
        {
          attempts: this.state.attempts,
          errorFamily: this.state.evidence.errorFamily,
          candidateErrorFamily: this.state.evidence.candidateErrorFamily
        }
      ) || [];
    }

    routeFra12FinalEvidence(score, missed) {
      const records = this.fra12FinalRecords(this.model.exitIds);
      const selection = window.RevilyFra12Canonical?.selectFinalRoute?.(records);
      const evaluation = selection?.evaluation || window.RevilyFra12Canonical?.evaluateFinalEvidence?.(records, true);
      if (selection?.route === "primary_mastery" || evaluation?.masterySatisfied) {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra12", route: "primary_mastery", primaryEvaluation: evaluation };
        this.emit("fra12_final_route_selected", { route: "primary_mastery", score, evaluation });
        return;
      }

      const desiredCount = selection?.recoveryCount || (score <= 2 ? 5 : 2);
      const missedFamilies = [...new Set(missed.map((id) => window.RevilyFra12Canonical?.recoveryFamily?.(id)).filter(Boolean))];
      const requiredFamilies = desiredCount === 5
        ? [...(this.spec.canonical_lesson?.recovery_selection_contract?.lowScoreFamilies || ["direct", "visual", "method", "denominator", "reasoning"])]
        : missedFamilies.slice(0, desiredCount);
      const excludedIds = [...new Set([
        ...Object.keys(this.state.submissions || {}),
        ...Object.keys(this.state.exit.responses || {}),
        ...(this.state.seenConfirmations || [])
      ])];
      const excludedSignatures = Object.values(this.state.evidence.canonicalSignature || {}).filter(Boolean);
      let recoveryIds = [];
      try {
        recoveryIds = window.RevilyFra12Canonical?.selectRecoveryItems?.({
          seed: window.RevilyFra12Canonical?.seedFrom?.(`${this.state.attemptId}:${score}:${missed.join("|")}`) || 1,
          count: desiredCount,
          excludedIds,
          excludedSignatures,
          requiredFamilies
        }) || [];
      } catch (_error) {
        recoveryIds = [];
      }
      if (recoveryIds.length !== desiredCount) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra12", route: "incomplete_authored_recovery_bank", primaryEvaluation: evaluation };
        return;
      }

      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairQueue = [];
      records.filter((record) => !record.correct).forEach((record) => {
        const family = record.errorFamily === "support_needed"
          ? this.state.evidence.candidateErrorFamily[record.questionId]
          : record.errorFamily;
        const id = repairMap[family];
        if (id && !repairQueue.some((repair) => repair.id === id)) repairQueue.push({ id, family });
      });
      this.state.exit.remediation = {
        profile: "fra12",
        route: desiredCount === 2 ? "score_three_repair_then_two_of_two" : "score_zero_to_two_repair_then_fresh_five",
        primaryEvaluation: evaluation,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        results: []
      };
      this.emit("fra12_final_route_selected", {
        route: this.state.exit.remediation.route,
        score,
        missed_question_ids: missed,
        repair_families: repairQueue.map((repair) => repair.family),
        recovery_question_ids: recoveryIds
      });
      this.beginNextFra12RecoveryStep();
    }

    beginNextFra12RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra12") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M5",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          family: repair.family,
          exitRemediation: true,
          fra12FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra12RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.primaryErrorFamily || "unknown",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra12FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra12Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra12") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        rawId: questionId.replace(`${this.spec.identity.id}-`, ""),
        correct,
        firstAttempt: (this.state.attempts[questionId] || 0) === 1,
        family: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.errorFamily[questionId] === "support_needed"
          ? this.state.evidence.candidateErrorFamily[questionId]
          : this.state.evidence.errorFamily[questionId]) || this.state.evidence.candidateErrorFamily[questionId] || current.question?.primaryErrorFamily || "unknown"
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra12RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra12RecoverySequence();
    }

    finishFra12RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra12") return;
      const results = remediation.results || [];
      const passed = window.RevilyFra12Canonical?.recoveryRoutePassed?.(remediation.route, results);
      if (remediation.route === "score_zero_to_two_repair_then_fresh_five") {
        const evaluation = window.RevilyFra12Canonical?.evaluateFinalEvidence?.(results, false);
        remediation.recoveryEvaluation = evaluation;
      }
      this.state.exit.result = passed ? "SECURE" : "NEEDS_WORK";
      this.state.freshContext = null;
      this.emit("fra12_recovery_completed", { route: remediation.route, result: this.state.exit.result, results });
      this.persist();
      this.finishExit();
    }

    repeatedCentralMisconceptions(centralFamilies) {
      const central = new Set(centralFamilies || []);
      const counts = {};
      Object.values(this.state.evidence.errorFamily || {}).forEach((family) => {
        if (central.has(family)) counts[family] = (counts[family] || 0) + 1;
      });
      return Object.keys(counts).filter((family) => counts[family] >= 2);
    }

    fra16PrimaryErrorFamily(questionId) {
      const recorded = this.state.evidence.errorFamily[questionId];
      const candidate = this.state.evidence.candidateErrorFamily[questionId];
      const observed = recorded === "support_needed" ? candidate : (recorded || candidate);
      if (observed && observed !== "unknown" && observed !== "support_needed") return observed;
      const fallback = {
        "FRA-16-M1": "numerator_only",
        "FRA-16-M2": "equality_rejected",
        "FRA-16-M3": "symbol_or_order_direction",
        "FRA-16-M4": "denominator_only",
        "FRA-16-M5": "denominator_only"
      };
      return fallback[questionId] || "inconsistent_equivalence";
    }

    routeFra16FinalEvidence(score, missed) {
      const mastery = this.spec.lesson.exit?.mastery_policy || {};
      const correctIds = this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct);
      const hasProceduralEvidence = correctIds.some((id) => ["FRA-16-M1", "FRA-16-M3"].includes(id));
      const hasReasoningOrApplicationEvidence = correctIds.some((id) => ["FRA-16-M2", "FRA-16-M4", "FRA-16-M5"].includes(id));
      const repeated = this.repeatedCentralMisconceptions(mastery.repeatedCentralFamilies || []);
      const route = window.RevilyFra16V1?.routeFinalCheck?.({
        correctCount: score,
        hasProceduralEvidence,
        hasReasoningOrApplicationEvidence,
        repeatedBlockingMisconception: repeated.length > 0
      }) || (score >= 4 && hasProceduralEvidence && hasReasoningOrApplicationEvidence && !repeated.length
        ? "finish_candidate"
        : score === 3 ? "targeted_repair_then_fresh_two_item_check" : "targeted_repair_then_fresh_three_item_final");
      if (route === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra16", route, score, hasProceduralEvidence, hasReasoningOrApplicationEvidence, repeatedBlockingFamilies: repeated };
        this.emit("fra16_final_route_selected", { route, score, repeated_blocking_families: repeated });
        return;
      }

      const desiredCount = route === "targeted_repair_then_fresh_three_item_final" ? 3 : 2;
      const families = [...new Set([
        ...missed.map((id) => this.fra16PrimaryErrorFamily(id)),
        ...repeated
      ])];
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairQueue = [];
      families.forEach((family) => {
        const id = repairMap[family];
        if (id && !repairQueue.some((entry) => entry.id === id)) repairQueue.push({ id, family });
      });
      if (!repairQueue.length) repairQueue.push({ id: repairMap.inconsistent_equivalence || repairMap.unknown, family: "inconsistent_equivalence" });

      const pool = mastery.recoveryQuestionIds || ["FRA-16-RF1", "FRA-16-RF2", "FRA-16-RF3", "FRA-16-RF-EQ", "FRA-16-RF-B"];
      const preferred = [];
      const add = (id) => { if (pool.includes(id) && !preferred.includes(id)) preferred.push(id); };
      families.forEach((family) => {
        if (family === "equality_rejected") add("FRA-16-RF-EQ");
        else if (family === "denominator_only") add("FRA-16-RF-B");
        else if (family === "symbol_or_order_direction") add("FRA-16-RF3");
        else if (family === "numerator_only") { add("FRA-16-RF1"); add("FRA-16-RF3"); }
        else add("FRA-16-RF1");
      });
      ["FRA-16-RF1", "FRA-16-RF3", "FRA-16-RF2", "FRA-16-RF-B", "FRA-16-RF-EQ"].forEach(add);
      const recoveryIds = preferred.slice(0, desiredCount);
      if (recoveryIds.length !== desiredCount || repairQueue.some((entry) => !entry.id)) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra16", route: "incomplete_recovery_bank", score, families, recoveryIds };
        return;
      }
      const firstRepair = repairQueue.shift();
      const repairQuestion = this.model.getQuestion(firstRepair.id);
      this.state.exit.remediation = {
        profile: "fra16",
        fra16CanonicalRecovery: true,
        route,
        score,
        families,
        recoveryIds,
        requiredSuccesses: desiredCount,
        results: []
      };
      this.state.pendingRecovery = {
        originId: missed[0]?.replace(`${this.spec.identity.id}-`, "") || "M5",
        originQuestionId: missed[0] || this.model.exitIds[0],
        recoveryId: firstRepair.id,
        supportedId: repairQuestion?.supportedQuestionId || null,
        repairQueue,
        fra16FinalRecovery: true,
        fra16RecoveryIds: recoveryIds,
        family: firstRepair.family,
        exitRemediation: true
      };
      this.state.cursor = `RECOVERY:${firstRepair.id}`;
      this.emit("fra16_final_route_selected", { route, score, repair_families: families, recovery_question_ids: recoveryIds });
    }

    continueFra16FinalRecovery(pending) {
      const remainingRepairs = [...(pending?.repairQueue || [])];
      if (remainingRepairs.length) {
        const nextRepair = remainingRepairs.shift();
        const repairQuestion = this.model.getQuestion(nextRepair.id);
        this.state.pendingRecovery = Object.assign({}, pending, {
          recoveryId: nextRepair.id,
          supportedId: repairQuestion?.supportedQuestionId || null,
          repairQueue: remainingRepairs,
          family: nextRepair.family
        });
        this.state.cursor = `RECOVERY:${nextRepair.id}`;
        this.persist();
        return this.render();
      }
      this.beginFra16RecoveryItems(pending?.fra16RecoveryIds || []);
      this.persist();
      return this.render();
    }

    beginFra16RecoveryItems(recoveryIds) {
      const ids = [...(recoveryIds || [])];
      if (!ids.length) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.cursor = "COMPLETE";
        return;
      }
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId: ids[0],
        family: "fra16_final_recovery",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra16FinalRecovery: true,
        recoveryIds: ids,
        index: 0,
        correct: null
      };
      this.state.cursor = `FRESH:${ids[0]}`;
    }

    beginFra09ExitRecovery(missedPrimaryIds, route) {
      const config = this.spec.lesson.exit?.fra09_recovery || {};
      const missed = [...(missedPrimaryIds || [])];
      const repairIds = [];
      missed.forEach((questionId) => {
        const family = this.state.evidence.errorFamily[questionId] || this.state.evidence.candidateErrorFamily[questionId];
        const repairId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
        if (repairId && !repairIds.includes(repairId)) repairIds.push(repairId);
      });
      let freshSequence;
      if (route === "fresh_final") {
        freshSequence = [...(config.freshFinalIds || [])];
      } else {
        const selected = [];
        const pools = config.miniCheckPoolByFamily || {};
        const available = (id) => !selected.includes(id)
          && !this.state.seenConfirmations.includes(id)
          && !this.state.attempts[id]
          && !this.state.resolved[id];
        missed.forEach((questionId) => {
          const family = this.model.getQuestion(questionId)?.evidenceFamily;
          const candidate = (pools[family] || []).find(available);
          if (candidate && selected.length < Number(config.miniCheckSize || 2)) selected.push(candidate);
        });
        Object.values(pools).flat().forEach((id) => {
          if (selected.length < Number(config.miniCheckSize || 2) && available(id)) selected.push(id);
        });
        freshSequence = selected.slice(0, Number(config.miniCheckSize || 2));
      }
      if (!freshSequence.length) {
        this.state.exit.result = "NEEDS_WORK";
        return;
      }
      this.state.exit.remediation = {
        route,
        missedPrimaryIds: missed,
        repairIds,
        repairIndex: 0,
        freshSequence,
        freshIndex: 0,
        results: [],
        requiredSuccesses: route === "targeted_two" ? freshSequence.length : 3,
        successes: 0,
        fra09CanonicalRecovery: true
      };
      this.beginNextFra09RecoveryStep();
    }

    beginNextFra09RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (!remediation?.fra09CanonicalRecovery) return;
      if (remediation.repairIndex < remediation.repairIds.length) {
        const repairId = remediation.repairIds[remediation.repairIndex++];
        delete this.state.resolved[repairId];
        delete this.state.feedback[repairId];
        delete this.state.drafts[repairId];
        delete this.state.engagementResponses[repairId];
        delete this.state.attempts[repairId];
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repairId,
          nextId: null,
          returnId: null,
          freshId: null,
          family: this.model.getQuestion(repairId)?.primaryErrorFamily || "UNKNOWN",
          primaryId: null,
          exitRemediation: true,
          recoveryOnly: true
        };
        this.state.cursor = `RECOVERY:${repairId}`;
        this.emit("exit_repair_started", { recovery_question_id: repairId, route: remediation.route });
        return;
      }
      const questionId = remediation.freshSequence[remediation.freshIndex];
      if (!questionId) return this.finishFra09RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.primaryErrorFamily || "UNKNOWN",
        returnId: null,
        exitRemediation: true,
        fra09FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.freshIndex + 1 });
    }

    advanceFra09Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (!remediation?.fra09CanonicalRecovery) return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        firstAttempt: (this.state.attempts[questionId] || 0) === 1,
        evidenceFamily: current.question?.evidenceFamily,
        errorFamily: this.state.evidence.errorFamily[questionId] || null
      });
      remediation.freshIndex += 1;
      this.state.freshContext = null;
      if (remediation.freshIndex < remediation.freshSequence.length) {
        this.beginNextFra09RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra09RecoverySequence();
    }

    finishFra09RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (!remediation?.fra09CanonicalRecovery) return;
      const results = remediation.results || [];
      if (remediation.route === "targeted_two") {
        this.state.exit.result = results.length === remediation.freshSequence.length
          && results.every((result) => result.correct && result.firstAttempt)
          ? "SECURE"
          : "NEEDS_WORK";
      } else {
        const correct = results.filter((result) => result.correct);
        const distinctFamilies = new Set(correct.map((result) => result.evidenceFamily).filter(Boolean));
        const central = new Set(this.spec.lesson.exit?.mastery_policy?.repeatedCentralFamilies || []);
        const counts = {};
        results.forEach((result) => {
          if (central.has(result.errorFamily)) counts[result.errorFamily] = (counts[result.errorFamily] || 0) + 1;
        });
        const repeatedCentral = Object.values(counts).some((count) => count >= 2);
        this.state.exit.result = correct.length >= 3 && distinctFamilies.size >= 2 && !repeatedCentral ? "SECURE" : "NEEDS_WORK";
      }
      this.state.freshContext = null;
      this.persist();
      this.finishExit();
    }

    fra11SeenPairs() {
      return Object.values(this.state.evidence.canonicalSignature || {}).filter((value) => /^\d+\/\d+$/.test(String(value)));
    }

    routeFra11FinalEvidence(score, missed) {
      const correctIds = this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct);
      const correctFamilies = new Set(correctIds.map((id) => this.model.getQuestion(id)?.evidenceFamily).filter(Boolean));
      const blockingFamilies = new Set(this.spec.lesson.exit?.mastery_policy?.repeatedCentralFamilies || []);
      const candidateCounts = {};
      this.model.exitIds.forEach((id) => {
        const family = this.state.evidence.candidateErrorFamily[id] || this.state.evidence.errorFamily[id];
        if (blockingFamilies.has(family)) candidateCounts[family] = (candidateCounts[family] || 0) + 1;
      });
      const repeatedBlockingFamilies = Object.keys(candidateCounts).filter((family) => candidateCounts[family] >= 2);
      const route = window.RevilyFra11Approved.routeFinalCheck({
        correctCount: score,
        hasDirectProceduralEvidence: correctFamilies.has("direct_conversion"),
        hasVisualReasoningOrErrorAnalysisEvidence: ["visual_grouping", "error_analysis", "denominator_reasoning", "reasoning_confirmation"].some((family) => correctFamilies.has(family)),
        repeatedBlockingMisconception: repeatedBlockingFamilies.length > 0
      });
      if (route === "finish_candidate") {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra11", route: "primary_mastery", score, correctFamilies: [...correctFamilies], repeatedBlockingFamilies };
        return;
      }

      const desiredCount = route === "targeted_repair_then_two_item_check" ? 2 : 3;
      const primaryFallback = { M1: "R-GROUP", M2: "R-GROUP", M3: "R-ZERO", M4: "R-GROUP", M5: "R-DENOM" };
      const missedFamilies = missed.map((id) => {
        const recorded = this.state.evidence.errorFamily[id];
        return recorded && recorded !== "support_needed" && recorded !== "ARITH"
          ? recorded
          : (this.state.evidence.candidateErrorFamily[id] || primaryFallback[id.replace(`${this.spec.identity.id}-`, "")] || null);
      }).filter((family) => blockingFamilies.has(family));
      const repairFamilies = [...new Set([...repeatedBlockingFamilies, ...missedFamilies])];
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairIds = repairFamilies.map((family) => repairMap[family]).filter(Boolean);
      const selection = window.RevilyFra11Canonical.selectFreshRecoveryQuestionIds({
        count: desiredCount,
        seenQuestionIds: [...Object.keys(this.state.submissions || {}), ...this.state.seenConfirmations],
        seenPairs: this.fra11SeenPairs(),
        missedFamilies: repairFamilies.map((family) => ({ "R-GROUP": "visual_grouping", "R-LEFTOVER": "leftover_reasoning", "R-DENOM": "denominator_reasoning", "R-FIELDS": "field_roles", "R-ZERO": "exact_whole" }[family])).filter(Boolean)
      });
      selection.ids.forEach((id) => {
        if (id.includes("-GENERATED-R")) window.RevilyFra11Canonical.ensureGeneratedQuestion(this, id, Number(id.match(/R(\d+)$/)?.[1] || 1));
      });
      this.state.exit.remediation = {
        profile: "fra11",
        route,
        score,
        missedPrimaryIds: [...missed],
        repairFamilies,
        repairIds,
        repairIndex: 0,
        freshSequence: selection.ids,
        freshIndex: 0,
        results: [],
        requiredSuccesses: desiredCount,
        generationSeeds: selection.generatedSeeds,
        fra11CanonicalRecovery: true
      };
      this.beginNextFra11RecoveryStep();
      this.emit("fra11_final_recovery_started", { score, route, missed_question_ids: missed, repair_families: repairFamilies, fresh_question_ids: selection.ids, generation_seeds: selection.generatedSeeds });
    }

    beginNextFra11RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (!remediation?.fra11CanonicalRecovery) return;
      if (remediation.repairIndex < remediation.repairIds.length) {
        const repairId = remediation.repairIds[remediation.repairIndex++];
        this.state.pendingRecovery = {
          originId: remediation.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: remediation.missedPrimaryIds[0] || null,
          recoveryId: repairId,
          nextId: null,
          returnId: null,
          freshId: null,
          family: this.model.getQuestion(repairId)?.primaryErrorFamily || "ARITH",
          primaryId: null,
          exitRemediation: true,
          recoveryOnly: true,
          fra11FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repairId}`;
        return;
      }
      const questionId = remediation.freshSequence[remediation.freshIndex];
      if (!questionId) return this.finishFra11RecoverySequence();
      if (questionId.includes("-GENERATED-R")) window.RevilyFra11Canonical.ensureGeneratedQuestion(this, questionId, Number(questionId.match(/R(\d+)$/)?.[1] || 1));
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.primaryErrorFamily || "ARITH",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra11FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.freshIndex + 1 });
    }

    advanceFra11Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (!remediation?.fra11CanonicalRecovery) return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        firstAttempt: (this.state.attempts[questionId] || 0) === 1,
        evidenceFamily: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.candidateErrorFamily[questionId] || this.state.evidence.errorFamily[questionId] || null)
      });
      remediation.freshIndex += 1;
      this.state.freshContext = null;
      if (remediation.freshIndex < remediation.freshSequence.length) {
        this.beginNextFra11RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra11RecoverySequence();
    }

    finishFra11RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (!remediation?.fra11CanonicalRecovery) return;
      const results = remediation.results || [];
      const allCorrectFirstTry = results.length === remediation.requiredSuccesses && results.every((result) => result.correct && result.firstAttempt);
      const families = new Set(results.filter((result) => result.correct).map((result) => result.evidenceFamily).filter(Boolean));
      const counts = {};
      results.forEach((result) => { if (result.errorFamily) counts[result.errorFamily] = (counts[result.errorFamily] || 0) + 1; });
      const repeatedBlocker = Object.values(counts).some((count) => count >= 2);
      const coverage = remediation.requiredSuccesses === 2
        ? families.size >= 2
        : families.has("direct_conversion") && [...families].some((family) => family !== "direct_conversion");
      this.state.exit.result = allCorrectFirstTry && coverage && !repeatedBlocker ? "SECURE" : "NEEDS_WORK";
      remediation.recoveryEvaluation = { allCorrectFirstTry, coverage, repeatedBlocker, evidenceFamilies: [...families] };
      this.state.freshContext = null;
      this.emit("fra11_recovery_final_completed", { result: this.state.exit.result, evaluation: remediation.recoveryEvaluation, generation_seeds: remediation.generationSeeds });
      this.persist();
      this.finishExit();
    }

    fra14FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const saved = this.state.exit.responses[questionId];
        const recorded = this.state.evidence.errorFamily[questionId];
        const candidate = this.state.evidence.candidateErrorFamily[questionId];
        return {
          questionId,
          family: question?.evidenceFamily,
          correct: saved?.correct === true,
          firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
          hintUsed: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
          errorFamily: saved?.correct ? null : (recorded === "support_needed" ? candidate : recorded) || candidate || "AMBIGUOUS"
        };
      });
    }

    beginFra14ReplacementFinal(recoveryIds, baseIds) {
      const ids = [...(recoveryIds || [])];
      if (!ids.length) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.cursor = "COMPLETE";
        return;
      }
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId: ids[0],
        family: "fra14_final_recovery",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra14FinalRecovery: true,
        recoveryIds: ids,
        baseIds: [...(baseIds || [])],
        index: 0,
        correct: null
      };
      this.state.cursor = `FRESH:${ids[0]}`;
    }

    beginFra14FinalRepairCheck(pending) {
      const candidateIds = this.spec.lesson.adaptive_pathway?.fresh_checks_by_error_family?.[pending?.family] || [];
      const freshId = candidateIds.find((id) => !this.state.seenConfirmations.includes(id));
      if (!freshId) return false;
      this.state.seenConfirmations.push(freshId);
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId: freshId,
        family: pending.family,
        returnId: "COMPLETE",
        exitRemediation: true,
        fra14FinalRepairCheck: true,
        fra14PendingFinalRecovery: pending,
        correct: null
      };
      this.state.cursor = `FRESH:${freshId}`;
      this.emit("fra14_final_repair_confirmation_started", { repair_id: pending.recoveryId, confirmation_question_id: freshId, error_family: pending.family });
      return true;
    }

    routeFra14FinalEvidence(score, missed) {
      const primaryRecords = this.fra14FinalRecords(this.model.exitIds);
      const evaluation = window.RevilyFra14Canonical?.evaluateFinalEvidence?.(primaryRecords);
      if (evaluation?.masterySatisfied) {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra14", route: "primary_mastery", primaryEvaluation: evaluation };
        this.emit("fra14_final_route_selected", { route: "primary_mastery", score, evaluation });
        return;
      }

      const fullRecovery = score <= 2;
      const recoveryIds = window.RevilyFra14Canonical?.selectReplacementIds?.(missed, fullRecovery) || [];
      const baseIds = fullRecovery ? [] : this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct);
      const recordFamilies = primaryRecords.filter((record) => !record.correct).map((record) => record.errorFamily);
      const repairFamilies = [...new Set([...(evaluation?.repeatedBlockingFamilies || []), ...recordFamilies])]
        .filter((family) => ["PART_AS_WHOLE", "DIVIDE_BY_DENOM_OR_ROLE_SWAP", "MULTIPLY_NUMERATOR", "STOP_AT_ONE_PART"].includes(family));
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairQueue = repairFamilies.map((family) => ({ family, id: repairMap[family] })).filter((item) => item.id);
      this.state.exit.remediation = {
        profile: "fra14",
        route: score === 3 ? "score_three_repair_and_replace_failed_slots" : fullRecovery ? "score_zero_to_two_repair_and_fresh_five" : "mastery_gate_repair_and_replace",
        primaryEvaluation: evaluation,
        baseIds,
        recoveryIds,
        repairFamilies
      };
      this.emit("fra14_final_route_selected", { route: this.state.exit.remediation.route, score, missed_question_ids: missed, repair_families: repairFamilies, replacement_question_ids: recoveryIds });
      if (!recoveryIds.length || (!fullRecovery && baseIds.length + recoveryIds.length !== 5) || (fullRecovery && recoveryIds.length !== 5)) {
        this.state.exit.result = "NEEDS_WORK";
        return;
      }
      if (!repairQueue.length) {
        this.beginFra14ReplacementFinal(recoveryIds, baseIds);
        return;
      }
      const firstRepair = repairQueue.shift();
      this.state.pendingRecovery = {
        originId: missed[0]?.replace(`${this.spec.identity.id}-`, "") || "M5",
        originQuestionId: missed[0] || this.model.exitIds[0],
        recoveryId: firstRepair.id,
        repairQueue,
        fra14FinalRecovery: true,
        fra14RecoveryIds: recoveryIds,
        fra14BaseIds: baseIds,
        family: firstRepair.family,
        exitRemediation: true
      };
      this.state.cursor = `RECOVERY:${firstRepair.id}`;
    }

    fra15FinalRecords(questionIds) {
      return window.RevilyFra15Canonical?.finalRecords?.(
        questionIds,
        this.state.exit.responses,
        this.state.evidence,
        (questionId) => this.model.getQuestion(questionId)
      ) || [];
    }

    fra15FallbackFamily(questionId) {
      const shortId = String(questionId || "").replace(`${this.spec.identity.id}-`, "");
      return ({ M1: "form", M2: "total", M3: "smallness_bias", M4: "total", M5: "units" })[shortId] || "order";
    }

    fra15ConfirmationIds(missed, count) {
      const seenFamilies = new Set();
      const ids = [];
      for (const questionId of missed || []) {
        const record = this.fra15FinalRecords([questionId])[0];
        const family = record?.errorFamily && record.errorFamily !== "unknown" ? record.errorFamily : this.fra15FallbackFamily(questionId);
        const useRepairCheck = seenFamilies.has(family);
        const id = window.RevilyFra15Canonical?.confirmationIdForFamily?.(family, useRepairCheck);
        if (id && !ids.includes(id)) ids.push(id);
        seenFamilies.add(family);
        if (ids.length === count) break;
      }
      const fallbackFamilies = ["order", "total", "combine", "smallness_bias", "form", "units"];
      for (const family of fallbackFamilies) {
        if (ids.length === count) break;
        const id = window.RevilyFra15Canonical?.confirmationIdForFamily?.(family, false);
        if (id && !ids.includes(id)) ids.push(id);
      }
      return ids.slice(0, count);
    }

    fra15RepeatedBlockingFamilies() {
      const blocking = new Set(this.spec.canonical_lesson?.route_contract?.finalDecision?.blockingRepeatedFamilies || []);
      const counts = {};
      Object.entries(this.state.evidence.candidateErrorFamily || {}).forEach(([questionId, family]) => {
        if (!questionId.startsWith(`${this.spec.identity.id}-`) || !blocking.has(family)) return;
        counts[family] = (counts[family] || 0) + 1;
      });
      return Object.keys(counts).filter((family) => counts[family] >= 2);
    }

    routeFra15FinalEvidence(score, missed) {
      const primaryRecords = this.fra15FinalRecords(this.model.exitIds);
      const evaluation = window.RevilyFra15Canonical?.evaluateFinalEvidence?.(primaryRecords, {
        repeatedBlockingFamilies: this.fra15RepeatedBlockingFamilies()
      });
      if (evaluation?.masterySatisfied) {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra15", route: "primary_mastery", primaryEvaluation: evaluation, evidenceWindow: [...this.model.exitIds] };
        this.emit("fra15_final_route_selected", { route: "primary_mastery", score, evaluation });
        return;
      }

      const lowScore = score <= 2;
      const blockerRoute = score >= 4;
      const recoveryIds = lowScore
        ? window.RevilyFra15Canonical?.recoveryFinalIds?.() || []
        : blockerRoute
          ? (evaluation?.repeatedBlockingFamilies || []).map((family) => window.RevilyFra15Canonical?.confirmationIdForFamily?.(family, false)).filter(Boolean).slice(0, 1)
          : this.fra15ConfirmationIds(missed, 2);
      const baseIds = lowScore ? [] : this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct);
      const rawFamilies = blockerRoute
        ? [...(evaluation?.repeatedBlockingFamilies || [])]
        : [
            ...(evaluation?.repeatedBlockingFamilies || []),
            ...primaryRecords.filter((record) => !record.correct).map((record) => record.errorFamily)
          ];
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairFamilies = [...new Set(rawFamilies.map((family, index) => family && family !== "unknown" ? family : this.fra15FallbackFamily(missed[index])))]
        .filter((family) => repairMap[family]);
      const repairQueue = repairFamilies
        .filter((family) => Number(this.state.evidence.repairCyclesUsed[family] || 0) < 1)
        .map((family) => ({ family, id: repairMap[family] }));
      const expectedRecoveryCount = lowScore ? 5 : blockerRoute ? 1 : 2;
      this.state.exit.remediation = {
        profile: "fra15",
        route: lowScore ? "score_zero_to_two_repair_then_fresh_final_five" : blockerRoute ? "blocking_family_repair_then_confirmation" : "score_three_repair_then_two_confirmations",
        primaryEvaluation: evaluation,
        baseIds,
        repairQueue,
        repairIndex: 0,
        recoveryIds,
        recoveryIndex: 0,
        results: [],
        expectedRecoveryCount,
        repairFamilies,
        evidenceWindow: [...baseIds, ...recoveryIds]
      };
      this.emit("fra15_final_route_selected", { route: this.state.exit.remediation.route, score, missed_question_ids: missed, repair_families: repairFamilies, recovery_question_ids: recoveryIds });
      if (recoveryIds.length !== expectedRecoveryCount) {
        this.state.exit.result = "NEEDS_WORK";
        return;
      }
      this.beginNextFra15RecoveryStep();
    }

    beginNextFra15RecoveryStep() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra15") return;
      if (remediation.repairIndex < remediation.repairQueue.length) {
        const repair = remediation.repairQueue[remediation.repairIndex++];
        this.state.evidence.repairCyclesUsed[repair.family] = Number(this.state.evidence.repairCyclesUsed[repair.family] || 0) + 1;
        this.state.pendingRecovery = {
          originId: this.state.exit.missedPrimaryIds[0]?.replace(`${this.spec.identity.id}-`, "") || "M1",
          originQuestionId: this.state.exit.missedPrimaryIds[0] || null,
          recoveryId: repair.id,
          family: repair.family,
          exitRemediation: true,
          fra15FinalRecovery: true
        };
        this.state.cursor = `RECOVERY:${repair.id}`;
        this.emit("exit_repair_started", { recovery_question_id: repair.id, family: repair.family, route: remediation.route });
        return;
      }
      const questionId = remediation.recoveryIds[remediation.recoveryIndex];
      if (!questionId) return this.finishFra15RecoverySequence();
      this.state.pendingRecovery = null;
      this.state.freshContext = {
        questionId,
        family: this.model.getQuestion(questionId)?.primaryErrorFamily || "unknown",
        returnId: "COMPLETE",
        exitRemediation: true,
        fra15FinalRecovery: true,
        correct: null
      };
      this.state.cursor = `FRESH:${questionId}`;
      this.emit("fresh_exit_check_started", { question_id: questionId, route: remediation.route, position: remediation.recoveryIndex + 1 });
    }

    advanceFra15Recovery(current) {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra15") return;
      const questionId = current.questionId;
      const correct = this.state.freshContext?.correct === true;
      remediation.results.push({
        questionId,
        correct,
        firstAttempt: this.state.attempts[questionId] === 1,
        evidenceFamily: current.question?.evidenceFamily,
        errorFamily: correct ? null : (this.state.evidence.errorFamily[questionId] || this.state.evidence.candidateErrorFamily[questionId] || current.question?.primaryErrorFamily || "unknown")
      });
      remediation.recoveryIndex += 1;
      this.state.freshContext = null;
      if (remediation.recoveryIndex < remediation.recoveryIds.length) {
        this.beginNextFra15RecoveryStep();
        this.persist();
        return this.render();
      }
      this.finishFra15RecoverySequence();
    }

    finishFra15RecoverySequence() {
      const remediation = this.state.exit.remediation;
      if (remediation?.profile !== "fra15") return;
      const results = remediation.results || [];
      if (remediation.route === "score_zero_to_two_repair_then_fresh_final_five") {
        const records = this.fra15FinalRecords(remediation.recoveryIds);
        const evaluation = window.RevilyFra15Canonical?.evaluateFinalEvidence?.(records);
        remediation.recoveryEvaluation = evaluation;
        this.state.exit.result = evaluation?.masterySatisfied ? "SECURE" : "NEEDS_WORK";
      } else {
        const allClean = results.length === remediation.expectedRecoveryCount && results.every((result) => result.correct && result.firstAttempt);
        this.state.exit.result = allClean ? "SECURE" : "NEEDS_WORK";
        remediation.recoveryEvaluation = { allClean, results: [...results] };
      }
      this.state.freshContext = null;
      this.emit("fra15_recovery_completed", { route: remediation.route, result: this.state.exit.result, evidence_window: remediation.evidenceWindow, results });
      this.persist();
      this.finishExit();
    }

    fra08FinalRecords(questionIds) {
      return (questionIds || []).map((questionId) => {
        const question = this.model.getQuestion(questionId);
        const response = this.state.exit.responses[questionId];
        return {
          questionId,
          family: question?.evidenceFamily,
          firstAttemptCorrect: response?.correct === true,
          independent: question?.policy?.countsAsIndependentEvidence === true,
          hintUsed: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
          errorFamily: response?.correct ? null : (this.state.evidence.errorFamily[questionId] || this.state.evidence.candidateErrorFamily[questionId] || question?.primaryErrorFamily || "unknown")
        };
      });
    }

    routeFra08FinalEvidence(score, missed) {
      const primaryRecords = this.fra08FinalRecords(this.model.exitIds);
      const evaluation = window.RevilyFra08Canonical?.evaluateFinalEvidence?.(primaryRecords, true);
      if (evaluation?.masterySatisfied) {
        this.state.exit.result = "SECURE";
        this.state.exit.remediation = { profile: "fra08", route: "primary_mastery", evaluation };
        return;
      }

      const desiredCount = score <= 2 ? 5 : 2;
      const recoveryIds = window.RevilyFra08Canonical?.selectRecoveryQuestionIds?.(missed, desiredCount) || [];
      const correctPrimaryIds = this.model.exitIds.filter((id) => this.state.exit.responses[id]?.correct);
      const applicationId = correctPrimaryIds.find((id) => ["reasoning_error_analysis", "visual_or_context_transfer"].includes(this.model.getQuestion(id)?.evidenceFamily));
      const baseIds = desiredCount === 2
        ? [applicationId, ...correctPrimaryIds].filter((id, index, values) => id && values.indexOf(id) === index).slice(0, 3)
        : [];
      const missedFamilies = missed.map((id) => this.state.evidence.errorFamily[id]
        || this.state.evidence.candidateErrorFamily[id]
        || this.model.getQuestion(id)?.primaryErrorFamily)
        .filter((family) => family && family !== "support_needed" && family !== "unknown");
      const repeated = evaluation?.repeatedBlockingFamilies || [];
      const families = [...new Set([...repeated, ...missedFamilies])];
      if (!families.length && missed[0]) families.push(this.model.getQuestion(missed[0])?.primaryErrorFamily || "fact");
      const repairMap = this.spec.lesson.adaptive_pathway?.repair_by_error_family || {};
      const repairQueue = families.map((family) => ({ family, id: repairMap[family] })).filter((item) => item.id);
      if (!repairQueue.length) {
        const fallback = repairMap.fact;
        if (fallback) repairQueue.push({ family: "fact", id: fallback });
      }
      if (!repairQueue.length || recoveryIds.length !== desiredCount || (desiredCount === 2 && baseIds.length !== 3)) {
        this.state.exit.result = "NEEDS_WORK";
        this.state.exit.remediation = { profile: "fra08", route: "incomplete_fresh_bank", evaluation };
        return;
      }
      const firstRepair = repairQueue.shift();
      this.state.exit.remediation = {
        profile: "fra08",
        route: score === 3 ? "score_three_targeted_repair" : score <= 2 ? "score_zero_to_two_alternate_final" : "coverage_or_blocker_repair",
        primaryEvaluation: evaluation,
        baseIds,
        recoveryIds,
        repairFamilies: [firstRepair.family, ...repairQueue.map((item) => item.family)]
      };
      this.state.pendingRecovery = {
        originId: missed[0]?.replace(`${this.spec.identity.id}-`, "") || "M5",
        originQuestionId: missed[0] || this.model.exitIds[0],
        recoveryId: firstRepair.id,
        repairQueue,
        fra08FinalRecovery: true,
        fra08RecoveryIds: recoveryIds,
        fra08BaseIds: baseIds,
        family: firstRepair.family,
        exitRemediation: true
      };
      this.state.cursor = `RECOVERY:${firstRepair.id}`;
      this.emit("fra08_final_recovery_started", { score, missed_question_ids: missed, repair_families: this.state.exit.remediation.repairFamilies, recovery_question_ids: recoveryIds });
    }

    queueExitConfirmation(primaryId, exclusions) {
      if (this.spec.canonical_lesson?.storyboard_version === "2.0") {
        const primaryQuestion = this.model.getQuestion(primaryId);
        const family = this.state.evidence.errorFamily[primaryId] || primaryQuestion?.primaryErrorFamily || "unknown";
        const confirmationId = this.freshCheckForFamily(family, exclusions);
        if (!confirmationId) {
          this.state.exit.result = "NEEDS_WORK";
          return;
        }
        this.state.exit.confirmationId = confirmationId;
        this.state.cursor = `CONFIRM:${confirmationId}`;
        return;
      }
      const blocked = new Set([...(exclusions || []), ...this.state.seenConfirmations]);
      const preferred = this.spec.lesson.exit?.confirmation_by_primary?.[primaryId];
      const candidates = [preferred, ...(this.spec.lesson.exit?.post_repair_retest_refs || []), ...this.model.confirmationIds].filter(Boolean);
      const confirmationId = candidates.find((id) => !blocked.has(id));
      if (!confirmationId) {
        this.state.exit.result = "NEEDS_WORK";
        return;
      }
      this.state.seenConfirmations.push(confirmationId);
      this.state.exit.confirmationId = confirmationId;
      this.state.cursor = `CONFIRM:${confirmationId}`;
    }

    beginExitRepair(missedPrimaryIds, requiredSuccesses, route) {
      const missed = [...(missedPrimaryIds || [])];
      this.state.exit.remediation = {
        route,
        missedPrimaryIds: missed,
        index: 0,
        requiredSuccesses,
        successes: 0
      };
      this.beginNextExitRepair();
    }

    beginNextExitRepair() {
      const remediation = this.state.exit.remediation;
      if (!remediation || !remediation.missedPrimaryIds.length) {
        this.state.exit.result = "NEEDS_WORK";
        return;
      }
      const primaryId = remediation.missedPrimaryIds[remediation.index % remediation.missedPrimaryIds.length];
      remediation.index += 1;
      const primaryQuestion = this.model.getQuestion(primaryId);
      const recordedFamily = this.state.evidence.errorFamily[primaryId];
      const family = recordedFamily === "support_needed"
        ? (this.state.evidence.candidateErrorFamily[primaryId] || primaryQuestion?.primaryErrorFamily || "unknown")
        : (recordedFamily || primaryQuestion?.primaryErrorFamily || "unknown");
      const familyRepair = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
      const primaryRepair = this.spec.lesson.exit?.repair_by_primary?.[primaryId];
      const repairId = ["fra02", "fra03", "fra04", "fra05", "fra06", "fra07", "fra08", "fra09", "fra10"].includes(this.spec.canonical_lesson?.engine_profile)
        ? (familyRepair || primaryRepair)
        : (primaryRepair || familyRepair);
      let confirmationFamily = family;
      let confirmationId = this.spec.canonical_lesson?.reference_for_future_lessons
        ? this.freshCheckForFamily(family)
        : (() => {
            const preferredConfirmation = this.spec.lesson.exit?.confirmation_by_primary?.[primaryId];
            const blocked = preferredConfirmation && this.state.seenConfirmations.includes(preferredConfirmation) ? [preferredConfirmation] : [];
            const candidates = [preferredConfirmation, ...(this.spec.lesson.exit?.post_repair_retest_refs || []), ...this.model.confirmationIds].filter(Boolean);
            return candidates.find((id) => !this.state.seenConfirmations.includes(id) && !blocked.includes(id));
          })();
      if (!confirmationId && ["fra02", "fra03", "fra04", "fra05", "fra06", "fra07", "fra08", "fra09", "fra10"].includes(this.spec.canonical_lesson?.engine_profile)) {
        const families = Object.keys(this.spec.lesson.adaptive_pathway?.fresh_checks_by_error_family || {});
        for (const candidateFamily of families) {
          confirmationId = this.freshCheckForFamily(candidateFamily);
          if (confirmationId) {
            confirmationFamily = candidateFamily;
            break;
          }
        }
      }
      if (!repairId || !confirmationId) {
        this.state.exit.result = "NEEDS_WORK";
        return;
      }
      if (!this.state.seenConfirmations.includes(confirmationId)) this.state.seenConfirmations.push(confirmationId);
      this.state.pendingRecovery = {
        originId: primaryId.replace(`${this.spec.identity.id}-`, ""),
        originQuestionId: primaryId,
        recoveryId: repairId,
        nextId: this.spec.canonical_lesson?.reference_for_future_lessons ? `FRESH:${confirmationId}` : `CONFIRM:${confirmationId}`,
        returnId: null,
        freshId: this.spec.canonical_lesson?.reference_for_future_lessons ? confirmationId : null,
        family: confirmationFamily,
        primaryId,
        exitRemediation: true
      };
      this.state.cursor = `RECOVERY:${repairId}`;
      if (this.spec.experience_contract?.deduplicate_exit_repairs && this.state.pendingRecovery.freshId) {
        const shown = remediation.shownRepairIds || (remediation.shownRepairIds = []);
        if (shown.includes(repairId)) {
          this.state.freshContext = {
            questionId: confirmationId,
            family: confirmationFamily,
            returnId: null,
            exitRemediation: true,
            primaryId,
            correct: null
          };
          this.state.pendingRecovery = null;
          this.state.cursor = `FRESH:${confirmationId}`;
        } else shown.push(repairId);
      }
      this.emit("exit_repair_started", { primary_question_id: primaryId, recovery_question_id: repairId, confirmation_question_id: confirmationId });
    }

    showSavedExitResponse(current, correct, narrate) {
      const slot = this.root.querySelector("#feedback-slot");
      const question = current?.question;
      if (question?.policy?.solutionPolicy === "after_locked_submit") {
        if (this.isRegistryRuntimeLesson()) {
          const lead = this.finalCheckLead(current, correct);
          const family = this.state.evidence.errorFamily[current.questionId] || this.state.evidence.candidateErrorFamily[current.questionId] || question.primaryErrorFamily || "unknown";
          const visibleLead = this.isFra07V1()
            ? window.RevilyFra07Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
            : this.isFra10V1()
            ? window.RevilyFra10Adapter.visibleFeedback(question, this.lastResponse(current.questionId), family, correct)
            : this.isFra26V1()
              ? window.RevilyFra26Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
            : this.isFra20V1()
              ? window.RevilyFra20Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
            : this.isFra21V1()
              ? window.RevilyFra21Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
            : this.isFra22V1()
              ? window.RevilyFra22Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct, this.state.attempts[current.questionId] || 1)
            : this.isFra23V1()
              ? window.RevilyFra23Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
            : this.isFra24V1()
              ? window.RevilyFra24Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
              : lead;
          if (this.state.workedRevealed[current.questionId]) {
            renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
            this.showFeedback(correct ? "correct" : "support", visibleLead, question.scripts?.worked_explanation || "", "Your result");
            this.elements.primary.disabled = false;
            return;
          }
          renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "initial" });
          this.showFeedback(correct ? "correct" : "support", visibleLead, "", "Your result");
          if (narrate) {
            const outcomeLines = this.isFra07V1()
              ? this.fra07OutcomeLines(question, this.lastResponse(current.questionId), correct)
              : this.isFra15V1()
              ? this.fra15OutcomeLines(question, this.lastResponse(current.questionId))
              : this.isFra26V1()
                ? this.fra26OutcomeLines(question, this.lastResponse(current.questionId), correct)
              : this.isFra28V1()
                ? this.fra28OutcomeLines(question, this.lastResponse(current.questionId))
              : this.isFra16V1()
              ? this.fra16OutcomeLines(question, this.lastResponse(current.questionId), correct)
              : this.isFra14V1()
              ? this.fra14OutcomeLines(question, this.lastResponse(current.questionId))
              : (this.isFra13V1()
                ? this.fra13OutcomeLines(question, this.lastResponse(current.questionId), correct)
                : this.isFra17V1()
                  ? this.fra17OutcomeLines(question, this.lastResponse(current.questionId), correct)
                  : this.isFra20V1()
                    ? this.fra20OutcomeLines(question, this.lastResponse(current.questionId), correct)
                  : this.isFra21V1()
                    ? this.fra21OutcomeLines(question, this.lastResponse(current.questionId), correct)
                  : this.isFra22V1()
                    ? this.fra22OutcomeLines(question, this.lastResponse(current.questionId), correct)
                  : this.isFra23V1()
                    ? this.fra23OutcomeLines(question, this.lastResponse(current.questionId), correct)
                  : this.isFra24V1()
                    ? this.fra24OutcomeLines(question, this.lastResponse(current.questionId), correct)
                    : [lead]);
            this.startNarration(outcomeLines, () => this.revealFra05WorkedCheck(current, correct), { resumeAction: "reveal_fra05_worked" });
          }
          return;
        }
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
        const lead = this.finalCheckLead(current, correct);
        this.showFeedback(correct ? "correct" : "support", lead, question.scripts?.worked_explanation || this.workedSummary(question));
        this.emit("worked_solution_shown", { question_id: current.questionId, answer_locked: true, final_check: true });
        if (narrate) this.startNarration(this.lockedWorkingNarrationLines(question, lead), null);
        return;
      }
      if (slot) slot.innerHTML = `<div class="feedback-card saved"><strong>Answer saved</strong><p>Your result will be shown after the final check.</p></div>`;
    }

    revealFra05WorkedCheck(current, correct) {
      const question = current?.question;
      if (!question) return;
      this.state.workedRevealed[current.questionId] = true;
      this.persist();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      const family = this.state.evidence.errorFamily[current.questionId] || this.state.evidence.candidateErrorFamily[current.questionId] || question.primaryErrorFamily || "unknown";
      const visibleLead = this.isFra07V1()
        ? window.RevilyFra07Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
        : this.isFra10V1()
        ? window.RevilyFra10Adapter.visibleFeedback(question, this.lastResponse(current.questionId), family, correct)
        : this.isFra26V1()
          ? window.RevilyFra26Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
        : this.isFra17V1()
          ? window.RevilyFra17Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
          : this.isFra20V1()
            ? window.RevilyFra20Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
          : this.isFra21V1()
            ? window.RevilyFra21Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
          : this.isFra22V1()
            ? window.RevilyFra22Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct, this.state.attempts[current.questionId] || 1)
          : this.isFra23V1()
            ? window.RevilyFra23Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
          : this.isFra24V1()
            ? window.RevilyFra24Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct)
        : this.finalCheckLead(current, correct);
      this.showFeedback(correct ? "correct" : "support", visibleLead, question.scripts?.worked_explanation || "", "Quick check");
      if (this.elements?.primary) {
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = !this.isFra08V1();
      }
      const finish = () => {
        if (this.elements?.primary) {
          this.elements.primary.textContent = "Continue";
          this.elements.primary.disabled = false;
        }
      };
      const lines = uniqueLines(question.scripts?.worked_narration || []);
      if (this.isFra09V1() && lines.length && this.elements?.primary) this.elements.primary.disabled = true;
      if (lines.length) this.startNarration(lines, finish, { resumeAction: "enable_fra05_continue" });
      else finish();
      this.emit("worked_solution_shown", { question_id: current.questionId, answer_locked: true, final_check: true });
    }

    finalCheckLead(current, correct) {
      if (this.isFra14V1()) {
        return this.fra14Evaluation(current?.question, this.lastResponse(current?.questionId)).visibleText || "";
      }
      if (this.isRegistryRuntimeLesson()) {
        if (this.isFra07V1()) return window.RevilyFra07Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
        if (this.isFra26V1()) return window.RevilyFra26Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
        if (this.isFra28V1()) return window.RevilyFra28Canonical.evaluateResponse(current.question, this.lastResponse(current.questionId)).visibleText || "";
        if (this.isFra17V1()) return window.RevilyFra17Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
        if (this.isFra20V1()) return window.RevilyFra20Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
        if (this.isFra21V1()) return window.RevilyFra21Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
        if (this.isFra23V1()) return window.RevilyFra23Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
        if (this.isFra24V1()) return window.RevilyFra24Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct);
        if (this.isFra22V1()) return window.RevilyFra22Canonical.visibleFeedback(current.question, this.lastResponse(current.questionId), correct, this.state.attempts[current.questionId] || 1);
        if (correct) return current?.question?.scripts?.on_correct_reaction || "";
        const family = this.state.evidence.errorFamily[current.questionId] || current.question?.primaryErrorFamily || "unknown";
        return this.targetedFeedback(current.question, this.lastResponse(current.questionId), family)
          || current?.question?.scripts?.on_incorrect_reaction || "";
      }
      if (this.isFra01CanonicalV2()) {
        const authored = correct
          ? current?.question?.scripts?.post_submit_correct
          : current?.question?.scripts?.post_submit_incorrect;
        if (authored) return authored;
        return correct
          ? "That matches. Check the working on screen."
          : "Your answer is saved. Compare it with the working on screen.";
      }
      const authored = correct
        ? current?.question?.scripts?.on_correct_reaction
        : current?.question?.scripts?.on_incorrect_reaction;
      if (authored) return authored;
      return correct
        ? "Wonderful — that’s right. Here’s the working so you can check."
        : "Not quite. Here’s the working — compare it with what you did.";
    }

    restoreResolvedFeedback(current) {
      const mode = this.state.resolved[current.questionId];
      const question = current.question;
      if (this.isFra26V1()) {
        if (mode === "engagement") {
          const response = this.state.engagementResponses?.[current.questionId]?.response;
          const visible = question.scripts?.engagement_visible_by_value?.[String(response)] || "";
          this.showFeedback("engagement", visible, "", "Your prediction");
          return;
        }
        const correct = ["correct", "correct_after_support", "fresh_correct"].includes(mode) || this.state.exit.responses[current.questionId]?.correct === true;
        const visible = window.RevilyFra26Canonical.visibleFeedback(question, this.lastResponse(current.questionId), correct);
        const worked = this.state.workedRevealed[current.questionId] === true;
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: worked ? "worked" : (correct ? "correct" : "initial") });
        this.showFeedback(correct ? "correct" : "support", visible, worked ? (question.scripts?.worked_explanation || "") : "", "Your result");
        return;
      }
      if (this.isFra14V1() && mode === "engagement") {
        const savedResponse = this.state.engagementResponses?.[current.questionId]?.response;
        const optionId = question.response?.optionIds?.[String(savedResponse)] || String(savedResponse || "");
        const visible = question.scripts?.engagement_visible_by_id?.[optionId] || "";
        this.showFeedback(optionId === "B" ? "correct" : "engagement", visible, "", "Your prediction");
        return;
      }
      if (this.isFra14V1() && mode !== "engagement") {
        const correct = ["correct", "correct_after_support", "fresh_correct"].includes(mode) || this.state.exit.responses[current.questionId]?.correct === true;
        const evaluation = this.fra14Evaluation(question, this.lastResponse(current.questionId));
        const worked = this.state.workedRevealed[current.questionId] === true;
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: worked ? "worked" : "initial" });
        this.showFeedback(correct ? "correct" : "support", evaluation.visibleText || "", worked ? (question.scripts?.worked_explanation || "") : "", "Your result");
        return;
      }
      if (this.isFra15V1() && mode !== "engagement") {
        const correct = ["correct", "correct_after_support", "fresh_correct"].includes(mode) || this.state.exit.responses[current.questionId]?.correct === true;
        const evaluation = this.fra15Evaluation(question, this.lastResponse(current.questionId));
        const worked = this.state.workedRevealed[current.questionId] === true;
        renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: worked ? "worked" : "initial" });
        this.showFeedback(correct ? "correct" : "support", evaluation.visibleText || "", worked ? (question.scripts?.worked_explanation || "") : "", "Your result");
        return;
      }
      if (this.isFra10V1()) {
        if (mode === "engagement") {
          const savedResponse = this.state.engagementResponses?.[current.questionId]?.response;
          const visible = question.scripts?.engagement_visible_by_value?.[String(savedResponse)] || "";
          this.showFeedback("engagement", visible, "", question.scripts?.engagement_label || "Your choice");
        } else if (mode === "correct" || mode === "correct_after_support") {
          this.showFeedback("correct", window.RevilyFra10Adapter.visibleFeedback(question, this.lastResponse(current.questionId), null, true), "", "Your result");
        } else {
          const family = this.state.evidence.errorFamily[current.questionId] || question.primaryErrorFamily || "unknown";
          this.showFeedback("support", window.RevilyFra10Adapter.visibleFeedback(question, this.lastResponse(current.questionId), family, false), "Use the short repair, then answer a fresh question.", "Next step");
        }
        return;
      }
      if (this.isFra11V1() && mode !== "engagement") {
        const evaluation = window.RevilyFra11Canonical.classifyResponse(question, this.lastResponse(current.questionId));
        const runtimeLine = evaluation.runtimeUtteranceIds.map((id) => this.spec.canonical_lesson.runtime_copy[id]?.text).find(Boolean) || "";
        const worked = question.scripts?.worked_explanation || "";
        const steps = worked.split(/(?=\d+\.\s)/).filter(Boolean);
        const fallback = (evaluation.correct ? steps.at(-1) : steps[0]) || "Answer locked.";
        this.showFeedback(evaluation.correct ? "correct" : "support", evaluation.visibleFeedback || runtimeLine || fallback, worked, "Answer locked");
        return;
      }
      if (this.isRegistryRuntimeLesson() && mode !== "engagement") {
        if (mode === "correct" || mode === "correct_after_support") {
          this.showFeedback("correct", question.scripts?.on_correct_reaction || "", "", "Your result");
        } else {
          const family = this.state.evidence.errorFamily[current.questionId] || question.primaryErrorFamily || "unknown";
          this.showFeedback("support", this.targetedFeedback(question, this.lastResponse(current.questionId), family), "Use the short repair, then answer a fresh question.", "Next step");
        }
        return;
      }
      if (mode === "engagement") {
        const savedResponse = this.state.engagementResponses?.[current.questionId]?.response;
        const exactLines = question.scripts?.engagement_response_by_value?.[String(savedResponse)] || [];
        this.showFeedback(
          "engagement",
          exactLines[0] || "",
          exactLines.length ? exactLines.slice(1).join(" ") : (question.scripts?.engagement_feedback || question.scripts?.engagement_detail || "Look at how the mathematical model changes."),
          question.scripts?.engagement_label || (this.isFra06V1() ? "Your prediction" : undefined)
        );
      } else if (mode === "worked" || mode === "worked_then_recovery") {
        this.showFeedback("support", question.scripts?.on_incorrect_attempt_2 || "", question.scripts?.worked_explanation || "");
      } else {
        this.showFeedback("correct", "", question.scripts?.on_correct_math || this.workedSummary(question));
      }
    }

    restoreFirstHint(current) {
      if (current.question.model?.feedbackFocus) {
        const family = this.state.evidence.errorFamily[current.questionId] || current.question.primaryErrorFamily;
        this.showFeedback("hint", this.targetedFeedback(current.question, this.lastResponse(current.questionId), family), "");
        return;
      }
      if (this.isFra13V1()) {
        const family = this.state.evidence.errorFamily[current.questionId]
          || this.state.evidence.candidateErrorFamily[current.questionId]
          || current.question.primaryErrorFamily
          || "unknown";
        const detail = current.question.policy?.hintPolicy === "optional"
          ? "Try again, or open the hint if you want a strategy clue."
          : "Use the cue, then try the question again.";
        this.showFeedback("hint", this.targetedFeedback(current.question, this.lastResponse(current.questionId), family), detail, "Try again");
        return;
      }
      if (this.isFra10V1()) {
        const family = this.state.evidence.errorFamily[current.questionId] || this.state.evidence.candidateErrorFamily[current.questionId] || current.question.primaryErrorFamily || "unknown";
        this.showFeedback("hint", window.RevilyFra10Adapter.visibleFeedback(current.question, this.lastResponse(current.questionId), family, false), current.question.policy?.hintPolicy === "optional" ? "You can retry now or open Ask for a hint." : "Use the cue, then try again.");
        return;
      }
      if (current.question.policy?.hintPolicy === "optional" && !this.state.evidence.hintOpened[current.questionId]) {
        const family = this.state.evidence.errorFamily[current.questionId] || current.question.primaryErrorFamily || "unknown";
        this.showFeedback("hint", this.targetedFeedback(current.question, this.lastResponse(current.questionId), family), "You can retry now or open Ask for a hint.");
        return;
      }
      this.showFeedback("hint", current.question.scripts?.on_incorrect_attempt_1 || "", current.question.mathematical_support?.hint_1 || "");
    }

    showFeedback(kind, primary, detail, labelOverride) {
      const slot = this.root.querySelector("#feedback-slot");
      if (!slot) return;
      const labels = { correct: "Your thinking holds", hint: "A clue", support: "Worked visual explanation", engagement: "Look at the split" };
      const primaryLines = uniqueLines([primary]);
      const numberedStepPattern = (this.isFra14V1() || this.isFra19V1?.())
        ? /(?:^|\n)([1-9])\.\s*(.*?)(?=(?:\n[1-9]\.\s)|$)/gs
        : /(?:^|\s)([1-9])\.\s*(.*?)(?=(?:\s[1-9]\.\s)|$)/g;
      const lockedQuestion = this.spec.experience_contract?.sequential_locked_working ? this.current()?.question : null;
      const lockedSteps = lockedQuestion?.policy?.solutionPolicy === "after_locked_submit" && detail === lockedQuestion.scripts?.worked_explanation
        ? (Array.isArray(lockedQuestion.scripts?.worked_steps)
          ? lockedQuestion.scripts.worked_steps
          : String(detail || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()).filter(Boolean)) : null;
      const numberedSteps = lockedSteps || ((this.spec.canonical_lesson?.storyboard_version === "2.0" || this.isFra06V1() || this.isFra07V1() || this.isFra11V1() || this.isFra12V1() || this.isFra14V1() || this.isFra17V1() || this.isFra19V1?.() || this.isFra20V1() || this.isFra22V1() || this.isFra23V1() || this.isFra24V1() || this.isFra28V1())
        ? [...String(detail || "").matchAll(numberedStepPattern)].map((match) => match[2].trim()).filter(Boolean)
        : []);
      const detailMarkup = numberedSteps.length > (lockedSteps ? 0 : 1)
        ? `<ol class="worked-steps">${numberedSteps.map((step, index) => `<li style="--worked-step-index:${index}"><strong class="worked-step-label">Step ${index + 1}</strong><span>${mathMarkup(step)}</span></li>`).join("")}</ol>`
        : uniqueLines([detail]).map((line) => `<p>${mathMarkup(line)}</p>`).join("");
      const feedbackLabel = this.isFra08V1() && kind === "correct" ? "Correct answer" : (labelOverride || labels[kind]);
      slot.innerHTML = `<div class="feedback-card ${kind}"><strong>${escapeHtml(feedbackLabel)}</strong>${primaryLines.map((line) => `<p>${mathMarkup(line)}</p>`).join("")}${detailMarkup}</div>`;
    }

    lockInputs() {
      this.root.querySelectorAll("#answer-form input, #answer-form select, #answer-form button").forEach((control) => { control.disabled = true; });
      this.root.querySelectorAll("[data-fra17-cell]").forEach((control) => {
        control.setAttribute("aria-disabled", "true");
        control.setAttribute("tabindex", "-1");
      });
      this.root.querySelectorAll("[data-fra20-cell]").forEach((control) => {
        control.setAttribute("aria-disabled", "true");
        control.setAttribute("tabindex", "-1");
      });
    }

    refocusInput() {
      window.setTimeout(() => {
        const input = this.root.querySelector("#answer-form input:not([type=hidden]):not(:disabled), #answer-form select:not(:disabled), #answer-form button.tick-selector-slider:not(:disabled), #answer-form button.choice-card:not(:disabled), #answer-form button.multi-choice-card:not(:disabled), #answer-form button.set-builder-token:not(:disabled), #answer-form button.order-option:not(:disabled), #answer-form button.fra16-order-card:not(:disabled)");
        input?.focus();
      }, 80);
    }

    lastResponse(questionId) {
      const answers = this.state.submissions[questionId] || [];
      return answers.length ? answers[answers.length - 1].response : null;
    }

    advance(current) {
      this.stopNarration(false);
      if (current.fresh) return this.advanceFresh(current);
      if (current.recovery) return this.finishRecovery();
      if (current.confirmation) {
        if (this.state.exit.result) return this.finishExit();
        return this.render();
      }
      if (this.state.pendingRecovery && this.state.pendingRecovery.originId === current.id) {
        return this.enterRecovery(this.state.pendingRecovery.recoveryId);
      }
      if (this.isFra12V1() && this.state.exit.remediation?.profile === "fra12" && this.state.cursor.startsWith("FRESH:")) {
        this.persist();
        return this.render();
      }
      if (current.exit) {
        if (this.state.exit.result) return this.finishExit();
        if (this.state.cursor.startsWith("CONFIRM:") || this.state.cursor.startsWith("RECOVERY:") || (this.isFra20V1() && this.state.cursor.startsWith("FRESH:"))) return this.render();
      }
      const nextId = this.adaptiveNextId(current);
      if (!nextId) {
        if (current.phase === "exit") return this.finishExit();
        return;
      }
      this.state.trail.push(current.id);
      this.state.cursor = nextId;
      this.state.evidence.route.push({ from: current.id, to: nextId, at: new Date().toISOString() });
      this.persist();
      this.render();
    }

    enterRecovery(questionId) {
      if (!questionId) return;
      this.stopNarration(false);
      if (this.isFra11V1()) {
        delete this.state.resolved[questionId];
        delete this.state.feedback[questionId];
        delete this.state.drafts[questionId];
        delete this.state.engagementResponses[questionId];
        delete this.state.attempts[questionId];
      }
      this.state.trail.push(this.state.cursor);
      this.state.cursor = `RECOVERY:${questionId}`;
      this.emit("recovery_item_started", { question_id: questionId });
      this.persist();
      this.render();
    }

    finishRecovery() {
      const pending = this.state.pendingRecovery;
      if (!pending) return;
      this.stopNarration(false);
      if (this.isFra28V1() && pending.fra28FinalRecovery) {
        this.state.pendingRecovery = null;
        this.beginNextFra28RecoveryStep();
        this.persist();
        return this.render();
      }
      if (this.isFra07V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (pending.fra07DiscriminatorRepairQueued) {
          this.state.pendingRecovery = Object.assign({}, pending, { fra07DiscriminatorRepairQueued: false });
          this.state.cursor = `RECOVERY:${pending.recoveryId}`;
          this.persist();
          return this.render();
        }
        if (pending.fra07Discriminator && recoveryQuestion?.canonicalQuestion?.stage === "discriminator") {
          this.state.pendingRecovery = null;
          this.state.cursor = pending.returnId || pending.nextId || "M1";
          this.persist();
          return this.render();
        }
        if (recoveryQuestion?.policy?.reteachOnly && recoveryQuestion?.supportedInteractionId) {
          this.state.pendingRecovery = Object.assign({}, pending, {
            repairId: recoveryQuestion.id,
            recoveryId: recoveryQuestion.supportedInteractionId,
            freshId: pending.freshId || recoveryQuestion.freshCheckId,
            fra07SupportedActive: true
          });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra07_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (pending.fra07SupportedActive) {
          this.state.pendingRecovery = null;
          this.state.freshContext = {
            questionId: pending.freshId,
            family: pending.family,
            returnId: pending.returnId || "M1",
            exitRemediation: Boolean(pending.exitRemediation),
            fra07RepairFresh: true,
            fra07FinalRecoveryRepair: Boolean(pending.fra07FinalRecovery),
            fra07PendingFinalRecovery: pending.fra07FinalRecovery ? pending : null,
            correct: null
          };
          this.state.cursor = `FRESH:${pending.freshId}`;
          this.persist();
          return this.render();
        }
      }
      if (this.isFra26V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (pending.fra26RepairFailed) {
          this.state.pendingRecovery = null;
          this.state.freshContext = null;
          this.state.exit.result = "NEEDS_WORK";
          this.state.cursor = "COMPLETE";
          this.emit("fra26_repair_attempt_cap_reached", { question_id: pending.recoveryId, family: pending.family, exit_remediation: Boolean(pending.exitRemediation) });
          this.persist();
          return this.render();
        }
        if (recoveryQuestion?.supportedInteractionId) {
          this.state.pendingRecovery = Object.assign({}, pending, {
            repairId: recoveryQuestion.id,
            recoveryId: recoveryQuestion.supportedInteractionId,
            freshId: pending.freshId || recoveryQuestion.freshCheckId,
            fra26SupportedActive: true
          });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra26_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (pending.fra26SupportedActive) {
          const freshId = pending.freshId;
          if (!freshId) {
            this.state.exit.result = "NEEDS_WORK";
            this.state.pendingRecovery = null;
            this.state.cursor = "COMPLETE";
            this.persist();
            return this.render();
          }
          this.state.pendingRecovery = null;
          this.state.freshContext = {
            questionId: freshId,
            family: pending.family,
            returnId: pending.returnId || "M1",
            exitRemediation: Boolean(pending.exitRemediation),
            fra26RepairFresh: true,
            fra26FinalRepair: Boolean(pending.fra26FinalRecovery),
            correct: null
          };
          this.state.cursor = `FRESH:${freshId}`;
          this.emit("fra26_fresh_repair_check_started", { question_id: freshId, family: pending.family, exit_remediation: Boolean(pending.exitRemediation) });
          this.persist();
          return this.render();
        }
        if (pending.fra26FinalRecovery) {
          this.state.pendingRecovery = null;
          this.beginNextFra26RecoveryStep();
          this.persist();
          return this.render();
        }
      }
      if (this.isFra17V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (recoveryQuestion?.supportedInteractionId) {
          this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: recoveryQuestion.supportedInteractionId });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra17_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (pending.fra17FinalRecovery) {
          this.state.pendingRecovery = null;
          this.beginNextFra17RecoveryStep();
          this.persist();
          return this.render();
        }
      }
      if (this.isFra23V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (recoveryQuestion?.supportedInteractionId) {
          this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: recoveryQuestion.supportedInteractionId });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra23_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (pending.fra23FinalRecovery) {
          this.state.pendingRecovery = null;
          this.beginNextFra23RecoveryStep();
          this.persist();
          return this.render();
        }
      }
      if (this.isFra24V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (recoveryQuestion?.supportedInteractionId) {
          this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: recoveryQuestion.supportedInteractionId });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra24_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (pending.fra24FinalRecovery) {
          this.state.pendingRecovery = null;
          this.beginNextFra24RecoveryStep();
          this.persist();
          return this.render();
        }
      }
      if (this.isFra20V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (recoveryQuestion?.supportedInteractionId) {
          this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: recoveryQuestion.supportedInteractionId });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra20_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (pending.fra20FinalRecovery) {
          this.state.pendingRecovery = null;
          this.beginNextFra20RecoveryStep();
          this.persist();
          return this.render();
        }
      }
      if (this.isFra21V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (recoveryQuestion?.supportedInteractionId) {
          const selectedFreshId = pending.freshId || window.RevilyFra21Canonical.selectFreshCheckId(pending.family, [
            ...Object.keys(this.state.submissions || {}),
            ...(this.state.seenConfirmations || [])
          ]);
          this.state.pendingRecovery = Object.assign({}, pending, {
            repairId: recoveryQuestion.id,
            recoveryId: recoveryQuestion.supportedInteractionId,
            freshId: selectedFreshId
          });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra21_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (recoveryQuestion?.fra21SupportedRepair) {
          const freshId = pending.freshId || recoveryQuestion.fra21FreshCheckIds?.[0];
          this.state.pendingRecovery = null;
          this.state.freshContext = {
            questionId: freshId,
            family: pending.family,
            returnId: pending.returnId || "M1",
            exitRemediation: Boolean(pending.exitRemediation),
            fra21RepairFresh: true,
            fra21FinalRepair: Boolean(pending.fra21FinalRecovery),
            fra21FinalRecoveryState: pending.fra21FinalRecoveryState || null,
            correct: null
          };
          this.state.cursor = `FRESH:${freshId}`;
          this.persist();
          return this.render();
        }
      }
      if (this.isFra22V1()) {
        const recoveryQuestion = this.model.getQuestion(pending.recoveryId);
        if (recoveryQuestion?.supportedInteractionId) {
          this.state.pendingRecovery = Object.assign({}, pending, {
            repairId: recoveryQuestion.id,
            recoveryId: recoveryQuestion.supportedInteractionId,
            supportedId: recoveryQuestion.supportedInteractionId,
            fra22SupportedActive: true
          });
          this.state.cursor = `RECOVERY:${recoveryQuestion.supportedInteractionId}`;
          this.emit("fra22_supported_repair_started", { repair_id: recoveryQuestion.id, supported_question_id: recoveryQuestion.supportedInteractionId, family: pending.family });
          this.persist();
          return this.render();
        }
        if (pending.fra22SupportedActive) {
          if (pending.fra22FinalRecovery) {
            const remediation = this.state.exit.remediation;
            remediation?.repairResults?.push({ questionId: pending.supportedId, correct: true, family: pending.family });
            this.state.pendingRecovery = null;
            this.beginNextFra22RecoveryStep();
            this.persist();
            return this.render();
          }
          this.state.pendingRecovery = null;
          this.state.freshContext = {
            questionId: pending.freshId,
            family: pending.family,
            returnId: pending.returnId || "M1",
            exitRemediation: false,
            fra22RepairFresh: true,
            correct: null,
            countsAsFreshEvidence: null
          };
          this.state.cursor = `FRESH:${pending.freshId}`;
          this.persist();
          return this.render();
        }
        if (pending.fra22FinalRecovery) {
          this.state.pendingRecovery = null;
          this.beginNextFra22RecoveryStep();
          this.persist();
          return this.render();
        }
      }
      if (pending.fra16FinalRecovery) {
        if (pending.supportedId) {
          this.state.pendingRecovery = null;
          this.state.freshContext = {
            questionId: pending.supportedId,
            family: pending.family,
            returnId: null,
            exitRemediation: true,
            fra16FinalRepairSupported: true,
            fra16PendingFinalRecovery: pending,
            correct: null
          };
          this.state.cursor = `FRESH:${pending.supportedId}`;
          this.persist();
          return this.render();
        }
        return this.continueFra16FinalRecovery(pending);
      }
      if (pending.fra16RepairFlow) {
        this.state.pendingRecovery = null;
        const questionId = pending.supportedId || pending.freshId;
        this.state.freshContext = {
          questionId,
          family: pending.family,
          returnId: pending.returnId,
          exitRemediation: false,
          fra16RepairSupported: Boolean(pending.supportedId),
          fra16RepairFresh: !pending.supportedId,
          fra16RepairId: pending.recoveryId,
          fra16FreshId: pending.freshId,
          correct: null
        };
        this.state.cursor = `FRESH:${questionId}`;
        this.persist();
        return this.render();
      }
      if (pending.fra15FinalRecovery) {
        this.state.pendingRecovery = null;
        this.beginNextFra15RecoveryStep();
        this.persist();
        return this.render();
      }
      if (pending.fra14FinalRecovery) {
        if (this.beginFra14FinalRepairCheck(pending)) {
          this.persist();
          return this.render();
        }
        const remainingRepairs = [...(pending.repairQueue || [])];
        if (remainingRepairs.length) {
          const nextRepair = remainingRepairs.shift();
          this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: nextRepair.id, repairQueue: remainingRepairs, family: nextRepair.family });
          this.state.cursor = `RECOVERY:${nextRepair.id}`;
          this.persist();
          return this.render();
        }
        this.beginFra14ReplacementFinal(pending.fra14RecoveryIds || [], pending.fra14BaseIds || []);
        this.persist();
        return this.render();
      }
      if (pending.fra11FinalRecovery) {
        this.state.pendingRecovery = null;
        this.beginNextFra11RecoveryStep();
        this.persist();
        return this.render();
      }
      if (pending.fra12FinalRecovery) {
        this.state.pendingRecovery = null;
        this.beginNextFra12RecoveryStep();
        this.persist();
        return this.render();
      }
      if (pending.fra13FinalRecovery) {
        this.state.pendingRecovery = null;
        this.beginNextFra13RecoveryStep();
        this.persist();
        return this.render();
      }
      if (pending.fra10FinalRecovery) {
        const remainingRepairs = [...(pending.repairQueue || [])];
        if (remainingRepairs.length) {
          const nextRepair = remainingRepairs.shift();
          this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: nextRepair.id, repairQueue: remainingRepairs, family: nextRepair.family });
          this.state.cursor = `RECOVERY:${nextRepair.id}`;
          this.persist();
          return this.render();
        }
        const recoveryIds = [...(pending.fra10RecoveryIds || [])];
        this.state.pendingRecovery = null;
        this.state.freshContext = {
          questionId: recoveryIds[0],
          family: "fra10_final_recovery",
          returnId: "COMPLETE",
          exitRemediation: true,
          fra10FinalRecovery: true,
          recoveryIds,
          index: 0,
          correct: null
        };
        this.state.cursor = `FRESH:${recoveryIds[0]}`;
        this.persist();
        return this.render();
      }
      if (pending.fra08FinalRecovery) {
        const remainingRepairs = [...(pending.repairQueue || [])];
        if (remainingRepairs.length) {
          const nextRepair = remainingRepairs.shift();
          this.state.pendingRecovery = Object.assign({}, pending, {
            recoveryId: nextRepair.id,
            repairQueue: remainingRepairs,
            family: nextRepair.family
          });
          this.state.cursor = `RECOVERY:${nextRepair.id}`;
          this.persist();
          return this.render();
        }
        const recoveryIds = [...(pending.fra08RecoveryIds || [])];
        this.state.pendingRecovery = null;
        this.state.freshContext = {
          questionId: recoveryIds[0],
          family: "fra08_final_recovery",
          returnId: "COMPLETE",
          exitRemediation: true,
          fra08FinalRecovery: true,
          recoveryIds,
          baseIds: [...(pending.fra08BaseIds || [])],
          index: 0,
          correct: null
        };
        this.state.cursor = `FRESH:${recoveryIds[0]}`;
        this.persist();
        return this.render();
      }
      if (pending.recoveryOnly && this.state.exit.remediation?.fra09CanonicalRecovery) {
        this.state.pendingRecovery = null;
        this.beginNextFra09RecoveryStep();
        this.persist();
        return this.render();
      }
      this.state.pendingRecovery = null;
      if (pending.freshId) {
        this.state.freshContext = {
          questionId: pending.freshId,
          family: pending.family,
          returnId: pending.returnId,
          exitRemediation: Boolean(pending.exitRemediation),
          primaryId: pending.primaryId || null,
          correct: null
        };
        this.state.cursor = `FRESH:${pending.freshId}`;
      } else {
        this.state.cursor = pending.nextId;
      }
      this.persist();
      this.render();
    }

    handleFreshSubmission(current, response, correct) {
      const question = current.question;
      const questionId = current.questionId;
      if (!this.state.seenConfirmations.includes(questionId)) this.state.seenConfirmations.push(questionId);
      this.state.resolved[questionId] = correct ? "fresh_correct" : "fresh_incorrect";
      this.state.feedback[questionId] = "worked";
      if (this.state.freshContext) {
        this.state.freshContext.correct = correct;
        if (this.isFra22V1()) this.state.freshContext.countsAsFreshEvidence = this.state.evidence.countsAsFreshEvidence[questionId] === true;
      }
      if (this.state.freshContext?.fra07FinalRecovery || this.state.freshContext?.fra08FinalRecovery || this.state.freshContext?.fra10FinalRecovery || this.state.freshContext?.fra14FinalRecovery || this.state.freshContext?.fra15FinalRecovery || this.state.freshContext?.fra16FinalRecovery || this.state.freshContext?.fra17FinalRecovery || this.state.freshContext?.fra20FinalRecovery || this.state.freshContext?.fra21FinalRecovery || this.state.freshContext?.fra22FinalRecovery || this.state.freshContext?.fra23FinalRecovery || this.state.freshContext?.fra24FinalRecovery || this.state.freshContext?.fra28FinalRecovery) {
        this.state.exit.responses[questionId] = { response: serialiseResponse(response), correct };
      }
      if (this.state.freshContext?.fra13FinalRecovery) {
        this.state.exit.responses[questionId] = { response: serialiseResponse(response), correct };
      }
      if (this.state.freshContext?.fra12FinalRecovery) {
        this.state.exit.responses[questionId] = { response: serialiseResponse(response), correct };
      }
      if (this.state.freshContext?.fra11FinalRecovery) {
        this.state.exit.responses[questionId] = { response: serialiseResponse(response), correct };
      }
      if (this.isRegistryRuntimeLesson()) {
        this.lockInputs();
        this.elements.primary.textContent = "Continue";
        this.elements.primary.disabled = false;
        this.emit("fresh_confirmation_submitted", { question_id: questionId, correct, counts_as_fresh_evidence: this.state.evidence.countsAsFreshEvidence[questionId], freshness_signature: this.state.evidence.freshnessSignature[questionId], error_family: question.errorFamily || question.primaryErrorFamily });
        this.persist();
        if (question.policy?.solutionPolicy === "after_locked_submit") {
          this.elements.primary.disabled = true;
          this.showSavedExitResponse(current, correct, true);
        } else {
          const lead = this.finalCheckLead(current, correct);
          const visibleLead = this.isFra07V1()
            ? window.RevilyFra07Canonical.visibleFeedback(question, response, correct)
            : this.isFra10V1()
            ? window.RevilyFra10Adapter.visibleFeedback(question, response, correct ? null : (this.state.evidence.errorFamily[questionId] || question.primaryErrorFamily), correct)
            : this.isFra26V1()
              ? window.RevilyFra26Canonical.visibleFeedback(question, response, correct)
            : this.isFra17V1()
              ? window.RevilyFra17Canonical.visibleFeedback(question, response, correct)
              : this.isFra20V1()
                ? window.RevilyFra20Canonical.visibleFeedback(question, response, correct)
              : this.isFra21V1()
                ? window.RevilyFra21Canonical.visibleFeedback(question, response, correct)
              : this.isFra22V1()
                ? window.RevilyFra22Canonical.visibleFeedback(question, response, correct, this.state.attempts[questionId] || 1)
              : this.isFra23V1()
                ? window.RevilyFra23Canonical.visibleFeedback(question, response, correct)
              : this.isFra24V1()
                ? window.RevilyFra24Canonical.visibleFeedback(question, response, correct)
                : lead;
          renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: correct ? "correct" : "hint" });
          this.showFeedback(correct ? "correct" : "hint", visibleLead, "", "Your result");
          const outcomeLines = this.isFra07V1()
            ? this.fra07OutcomeLines(question, response, correct)
            : this.isFra15V1()
            ? this.fra15OutcomeLines(question, response)
            : this.isFra26V1()
              ? this.fra26OutcomeLines(question, response, correct)
            : this.isFra13V1()
            ? this.fra13OutcomeLines(question, response, correct)
            : this.isFra17V1()
              ? this.fra17OutcomeLines(question, response, correct)
              : this.isFra20V1()
                ? this.fra20OutcomeLines(question, response, correct)
              : this.isFra21V1()
                ? this.fra21OutcomeLines(question, response, correct)
              : this.isFra22V1()
                ? this.fra22OutcomeLines(question, response, correct)
              : this.isFra23V1()
                ? this.fra23OutcomeLines(question, response, correct)
              : this.isFra24V1()
                ? this.fra24OutcomeLines(question, response, correct)
                : [lead];
          this.startNarration(outcomeLines, null);
        }
        return;
      }
      this.lockInputs();
      renderVisual(this.elements.canvas, current.visual, { spec: this.spec, question, narration: current.narration, feedback: "worked" });
      const lead = this.finalCheckLead(current, correct);
      this.showFeedback(correct ? "correct" : "support", lead, question.scripts?.worked_explanation || this.workedSummary(question));
      this.elements.primary.textContent = "Continue";
      this.elements.primary.disabled = false;
      this.emit("fresh_confirmation_submitted", { question_id: questionId, correct, error_family: question.errorFamily || question.primaryErrorFamily });
      this.persist();
      this.startNarration(this.lockedWorkingNarrationLines(question, lead), null);
    }

    isFra01CanonicalV2() {
      return this.spec.identity?.id === "FRA-01" && this.spec.canonical_lesson?.storyboard_version === "2.0";
    }

    isFra05V2() {
      return this.spec.identity?.id === "FRA-05" && this.spec.canonical_lesson?.version === "FRA05-2.0";
    }

    isFra06V1() {
      return this.spec.identity?.id === "FRA-06" && this.spec.canonical_lesson?.version === "fra06-handoff-v1-runtime-copy-1";
    }

    isFra07V1() {
      return this.spec.identity?.id === "FRA-07" && this.spec.canonical_lesson?.version === "fra07-recognise-equivalent-fractions-v1";
    }

    isFra08V1() {
      return this.spec.identity?.id === "FRA-08" && this.spec.canonical_lesson?.version === "fra08-equivalent-fractions-v1";
    }

    isFra09V1() {
      return this.spec.identity?.id === "FRA-09" && this.spec.canonical_lesson?.version === "fra09-canonical-handoff-v1";
    }

    isFra10V1() {
      return this.spec.identity?.id === "FRA-10" && this.spec.canonical_lesson?.version === "fra10-simplest-form-handoff-v1";
    }

    isFra11V1() {
      return this.spec.identity?.id === "FRA-11" && this.spec.canonical_lesson?.version === "fra11-canonical-handoff-v1";
    }

    isFra12V1() {
      return this.spec.identity?.id === "FRA-12" && this.spec.canonical_lesson?.version === "fra12-owner-approved-handoff-v1";
    }

    isFra13V1() {
      return this.spec.identity?.id === "FRA-13" && this.spec.canonical_lesson?.version === "fra13-fraction-of-amount-v1";
    }

    isFra14V1() {
      return this.spec.identity?.id === "FRA-14" && this.spec.canonical_lesson?.version === "FRA14-HANDOFF-V1";
    }

    isFra15V1() {
      return this.spec.identity?.id === "FRA-15" && this.spec.canonical_lesson?.version === "fra15-quantity-as-fraction-v1";
    }

    isFra16V1() {
      return this.spec.identity?.id === "FRA-16" && this.spec.canonical_lesson?.version === "fra16-runtime-v1";
    }

    isFra17V1() {
      return this.spec.identity?.id === "FRA-17" && this.spec.canonical_lesson?.version === "fra17-same-denominator-addition-v1";
    }

    isFra20V1() {
      return this.spec.identity?.id === "FRA-20" && this.spec.canonical_lesson?.version === "fra20-handoff-v1-runtime-1";
    }

    isFra21V1() {
      return this.spec.identity?.id === "FRA-21" && this.spec.canonical_lesson?.version === "FRA21-HANDOFF-V1";
    }

    isFra22V1() {
      return this.spec.identity?.id === "FRA-22" && this.spec.canonical_lesson?.version === "fra22-unlike-denominator-subtraction-v1";
    }

    isFra23V1() {
      return this.spec.identity?.id === "FRA-23" && this.spec.canonical_lesson?.version === "fra23-codex-handoff-v1-runtime-copy-1";
    }

    isFra24V1() {
      return this.spec.identity?.id === "FRA-24" && this.spec.canonical_lesson?.version === "fra24-canonical-handoff-v1";
    }

    isFra26V1() {
      return this.spec.identity?.id === "FRA-26" && this.spec.canonical_lesson?.version === "fra26-handoff-v1-runtime-copy-1";
    }

    isFra28V1() {
      return this.spec.identity?.id === "FRA-28" && this.spec.canonical_lesson?.version === "FRA28-HANDOFF-V1";
    }

    isRegistryRuntimeLesson() {
      return this.isFra05V2() || this.isFra06V1() || this.isFra07V1() || this.isFra08V1() || this.isFra09V1() || this.isFra10V1() || this.isFra11V1() || this.isFra12V1() || this.isFra13V1() || this.isFra14V1() || this.isFra15V1() || this.isFra16V1() || this.isFra17V1() || this.isFra20V1() || this.isFra21V1() || this.isFra22V1() || this.isFra23V1() || this.isFra24V1() || this.isFra26V1() || this.isFra28V1();
    }

    resumeFra05Narration(current) {
      if (!this.isRegistryRuntimeLesson()) return false;
      const saved = this.state.narrationResume;
      if (!saved?.active || saved.cursor !== current?.id || !Array.isArray(saved.utteranceIds) || !saved.utteranceIds.length) return false;
      const registry = this.spec.canonical_lesson?.runtime_copy || {};
      if (saved.utteranceIds.some((id) => !registry[id])) {
        this.state.narrationResume = null;
        this.persist();
        return false;
      }
      const startIndex = Math.max(0, Math.min(saved.utteranceIds.length - 1, Number(saved.index) || 0));
      const completedIds = new Set(saved.utteranceIds.slice(0, startIndex));
      (current.visual?.syncCues || []).filter((cue) => completedIds.has(cue.utteranceId)).forEach((cue) => this.applyNarrationCue(cue));
      const lines = saved.utteranceIds.slice(startIndex).map((id) => registry[id].text);
      const action = saved.action;
      const done = action === "advance_current" ? () => this.advance(current)
        : action === "enable_scene_continue" ? () => {
            this.elements.primary.textContent = current.source?.learner_action?.button || "Continue";
            this.elements.primary.disabled = false;
          }
        : action === "enable_fra12_continue" ? () => {
            this.elements.primary.textContent = "Continue";
            this.elements.primary.disabled = false;
          }
        : action === "reveal_fra05_worked" ? () => {
            const correct = this.state.exit.responses[current.questionId]?.correct
              ?? (this.state.freshContext ? this.state.freshContext.correct === true : undefined)
              ?? ["correct", "correct_after_support"].includes(this.state.resolved[current.questionId]);
            this.revealFra05WorkedCheck(current, correct);
          }
        : action === "enable_fra05_continue" ? () => {
            this.elements.primary.textContent = "Continue";
            this.elements.primary.disabled = false;
          }
        : null;
      this.startNarration(lines, done, { resumeAtMs: saved.elapsedMs, resumeAction: action, resuming: true });
      return true;
    }

    supportNarrationLines(question, lead) {
      return this.isFra01CanonicalV2() || this.isRegistryRuntimeLesson()
        ? uniqueLines([lead])
        : uniqueLines([lead, question?.scripts?.worked_explanation]);
    }

    lockedWorkingNarrationLines(question, lead) {
      return this.spec.voice_and_script?.narration_playback?.locked_working_mode === "reaction_only" || this.isFra01CanonicalV2() || this.isRegistryRuntimeLesson()
        ? uniqueLines([lead])
        : uniqueLines([lead, question?.scripts?.worked_explanation]);
    }

    narrationBeatGapMs() {
      if (Number.isFinite(this.spec.voice_and_script?.narration_playback?.beat_gap_ms)) return Math.max(0, this.spec.voice_and_script.narration_playback.beat_gap_ms);
      return this.isFra01CanonicalV2() || this.isRegistryRuntimeLesson() ? 60 : 180;
    }

    narrationAdvanceDelayMs() {
      if (Number.isFinite(this.spec.voice_and_script?.narration_playback?.advance_delay_ms)) return Math.max(0, this.spec.voice_and_script.narration_playback.advance_delay_ms);
      return this.isFra01CanonicalV2() || this.isRegistryRuntimeLesson() ? 280 : 1500;
    }

    primeNarrationAssets(lines) {
      if (this.narrationPlayback.mode !== "authored_audio_then_browser_speech" || !this.state.soundOn) return;
      const flattened = [];
      const collect = (value) => {
        if (Array.isArray(value)) value.forEach(collect);
        else if (typeof value === "string") flattened.push(...(this.isRegistryRuntimeLesson() ? [value] : speechBeats(value)));
      };
      collect(lines);
      uniqueLines(flattened).forEach((line) => {
        const asset = this.narrationAssets[line] || this.narrationAssets[normaliseNarrationText(line)];
        if (!asset?.src || this.preloadedNarrationAudio.has(asset.src)) return;
        try {
          const audio = this.createAudio(asset.src);
          audio.preload = "auto";
          if (typeof audio.load === "function") audio.load();
          this.preloadedNarrationAudio.set(asset.src, audio);
        } catch (_error) {
          // Playback will retry by creating the audio element when the line is needed.
        }
      });
    }

    primeUpcomingFra05Narration(current) {
      if (!this.isFra05V2() || !this.state.soundOn || !current) return;
      const currentIndex = this.model.nodes.findIndex((node) => node.id === current.id);
      if (currentIndex < 0) return;
      this.model.nodes.slice(currentIndex + 1, currentIndex + 4).forEach((node) => {
        const spokenScripts = Object.entries(node.question?.scripts || {})
          .filter(([key]) => !["worked_explanation", "response_feedback"].includes(key))
          .flatMap(([, value]) => Array.isArray(value) ? value : [value]);
        this.primeNarrationAssets([node.narration, ...spokenScripts]);
      });
    }

    advanceFresh(current) {
      const context = this.state.freshContext || {};
      const correct = context.correct === true;
      const questionId = current.questionId;
      if (context.fra28FinalRecovery) {
        this.advanceFra28Recovery(current);
        this.persist();
        return this.render();
      }
      if (context.fra07RepairFresh) {
        this.state.freshContext = null;
        if (correct) {
          this.state.evidence.freshConfirmationPassed[questionId] = true;
          if (context.fra07FinalRecoveryRepair) {
            this.beginNextFra07RecoveryStep();
            this.persist();
            return this.render();
          }
          this.state.cursor = context.returnId || "M1";
          this.persist();
          return this.render();
        }
        const repairId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[context.family];
        const repairQuestion = this.model.getQuestion(repairId);
        delete this.state.resolved[questionId];
        delete this.state.feedback[questionId];
        delete this.state.drafts[questionId];
        delete this.state.attempts[questionId];
        delete this.state.submissions[questionId];
        delete this.state.evidence.firstAttemptCorrect[questionId];
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId: repairId,
          freshId: repairQuestion?.freshCheckId || questionId,
          returnId: context.returnId,
          family: context.family,
          fra07FinalRecovery: Boolean(context.fra07FinalRecoveryRepair),
          exitRemediation: Boolean(context.exitRemediation)
        };
        this.state.cursor = `RECOVERY:${repairId}`;
        this.emit("fra07_fresh_recheck_failed", { question_id: questionId, family: context.family, repair_id: repairId });
        this.persist();
        return this.render();
      }
      if (context.fra07FinalRecovery) return this.advanceFra07Recovery(current);
      if (context.fra26RepairFresh) {
        this.state.freshContext = null;
        if (!correct) {
          this.state.pendingRecovery = null;
          this.state.exit.result = "NEEDS_WORK";
          this.state.cursor = "COMPLETE";
          this.emit("fra26_fresh_repair_check_failed", { question_id: questionId, family: context.family, exit_remediation: Boolean(context.exitRemediation) });
          this.persist();
          return this.render();
        }
        this.state.evidence.freshConfirmationPassed[questionId] = true;
        if (context.fra26FinalRepair) {
          this.beginNextFra26RecoveryStep();
          this.persist();
          return this.render();
        }
        this.state.cursor = context.returnId || "M1";
        this.persist();
        return this.render();
      }
      if (context.fra17FinalRecovery) return this.advanceFra17Recovery(current);
      if (context.fra26FinalRecovery) return this.advanceFra26Recovery(current);
      if (context.fra23FinalRecovery) return this.advanceFra23Recovery(current);
      if (context.fra24FinalRecovery) return this.advanceFra24Recovery(current);
      if (context.fra20FinalRecovery) return this.advanceFra20Recovery(current);
      if (context.fra21FinalRepair) return this.advanceFra21FinalRepair(current);
      if (context.fra21FinalRecovery) return this.advanceFra21FinalRecovery(current);
      if (context.fra22FinalRecovery) return this.advanceFra22Recovery(current);
      if (this.isFra22V1() && correct && context.countsAsFreshEvidence === false) {
        const replacementId = this.freshCheckForFamily(context.family || current.question?.evidenceFamily || "UNKNOWN", [questionId]);
        if (replacementId) {
          this.state.freshContext = Object.assign({}, context, { questionId: replacementId, correct: null, countsAsFreshEvidence: null });
          this.state.cursor = `FRESH:${replacementId}`;
          this.emit("fra22_duplicate_signature_replaced", { repeated_question_id: questionId, replacement_question_id: replacementId, generation_attempted: false });
          this.persist();
          return this.render();
        }
        this.state.evidence.pendingNoHintConfirmations = this.state.evidence.pendingNoHintConfirmations.filter((id) => id !== questionId);
        this.state.freshContext = null;
        if (context.exitRemediation) {
          this.state.exit.result = "NEEDS_WORK";
          this.emit("fra22_recovery_pool_exhausted", { repeated_question_id: questionId, generation_attempted: false });
          this.persist();
          return this.finishExit();
        }
        this.state.cursor = context.returnId || "M1";
        this.persist();
        return this.render();
      }
      if (context.fra22RepairFresh) {
        if (correct && context.countsAsFreshEvidence === true) {
          this.state.evidence.freshConfirmationPassed[questionId] = true;
          this.state.freshContext = null;
          this.state.cursor = context.returnId || "M1";
          this.persist();
          return this.render();
        }
        const recorded = this.state.evidence.errorFamily[questionId];
        const family = (recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[questionId] : recorded)
          || this.state.evidence.candidateErrorFamily[questionId]
          || context.family
          || "UNKNOWN";
        const recoveryId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
        const supportedId = this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family?.[family];
        const freshId = this.freshCheckForFamily(family, [questionId]);
        this.state.freshContext = null;
        if (recoveryId && supportedId && freshId) {
          this.state.pendingRecovery = { originId: current.id, originQuestionId: questionId, recoveryId, supportedId, freshId, returnId: context.returnId, family, fra22RepairFlow: true, exitRemediation: false };
          return this.enterRecovery(recoveryId);
        }
        this.state.cursor = context.returnId || "M1";
        this.persist();
        return this.render();
      }
      if (context.fra16FinalRepairSupported) {
        const pending = context.fra16PendingFinalRecovery || {};
        if (correct) {
          this.state.evidence.freshConfirmationPassed[questionId] = true;
          this.state.freshContext = null;
          return this.continueFra16FinalRecovery(Object.assign({}, pending, { supportedId: null }));
        }
        delete this.state.resolved[questionId];
        delete this.state.feedback[questionId];
        delete this.state.drafts[questionId];
        this.state.submissions[questionId] = [];
        this.state.freshContext = null;
        this.state.pendingRecovery = pending;
        this.state.cursor = `RECOVERY:${pending.recoveryId}`;
        this.persist();
        return this.render();
      }
      if (context.fra16RepairSupported) {
        if (correct) {
          const freshId = context.fra16FreshId;
          this.state.freshContext = {
            questionId: freshId,
            family: context.family,
            returnId: context.returnId,
            exitRemediation: false,
            fra16RepairFresh: true,
            fra16RepairId: context.fra16RepairId,
            fra16FreshId: freshId,
            correct: null
          };
          this.state.cursor = `FRESH:${freshId}`;
          this.persist();
          return this.render();
        }
        delete this.state.resolved[questionId];
        delete this.state.feedback[questionId];
        delete this.state.drafts[questionId];
        this.state.submissions[questionId] = [];
        this.state.freshContext = null;
        this.state.pendingRecovery = {
          originId: context.returnId || "I2",
          originQuestionId: questionId,
          recoveryId: context.fra16RepairId,
          supportedId: questionId,
          freshId: context.fra16FreshId,
          returnId: context.returnId,
          family: context.family,
          fra16RepairFlow: true,
          exitRemediation: false
        };
        this.state.cursor = `RECOVERY:${context.fra16RepairId}`;
        this.persist();
        return this.render();
      }
      if (context.fra16FinalRecovery) {
        const nextIndex = Number(context.index || 0) + 1;
        if (nextIndex < context.recoveryIds.length) {
          const nextId = context.recoveryIds[nextIndex];
          this.state.freshContext = Object.assign({}, context, { questionId: nextId, index: nextIndex, correct: null });
          this.state.cursor = `FRESH:${nextId}`;
          this.persist();
          return this.render();
        }
        const results = context.recoveryIds.map((id) => ({ questionId: id, correct: this.state.exit.responses[id]?.correct === true }));
        const passed = results.length === this.state.exit.remediation?.requiredSuccesses && results.every((result) => result.correct);
        this.state.exit.remediation = Object.assign({}, this.state.exit.remediation, { results, recoveryPassed: passed });
        this.state.exit.result = passed ? "SECURE" : "NEEDS_WORK";
        this.state.freshContext = null;
        this.emit("fra16_recovery_final_completed", { result: this.state.exit.result, evidence_question_ids: context.recoveryIds, required_all_correct: true });
        this.persist();
        return this.finishExit();
      }
      if (context.fra14FinalRepairCheck) {
        const pending = context.fra14PendingFinalRecovery || {};
        if (!correct) {
          this.state.exit.result = "NEEDS_WORK";
          this.state.freshContext = null;
          this.state.pendingRecovery = null;
          this.state.cursor = "COMPLETE";
          this.emit("fra14_final_repair_confirmation_failed", { confirmation_question_id: questionId, error_family: context.family });
          this.persist();
          return this.render();
        }
        this.state.evidence.freshConfirmationPassed[questionId] = true;
        this.state.freshContext = null;
        const remainingRepairs = [...(pending.repairQueue || [])];
        if (remainingRepairs.length) {
          const nextRepair = remainingRepairs.shift();
          this.state.pendingRecovery = Object.assign({}, pending, { recoveryId: nextRepair.id, repairQueue: remainingRepairs, family: nextRepair.family });
          this.state.cursor = `RECOVERY:${nextRepair.id}`;
        } else {
          this.beginFra14ReplacementFinal(pending.fra14RecoveryIds || [], pending.fra14BaseIds || []);
        }
        this.emit("fra14_final_repair_confirmation_passed", { confirmation_question_id: questionId, error_family: context.family });
        this.persist();
        return this.render();
      }
      if (context.fra14FinalRecovery) {
        const nextIndex = Number(context.index || 0) + 1;
        if (nextIndex < context.recoveryIds.length) {
          const nextId = context.recoveryIds[nextIndex];
          this.state.freshContext = Object.assign({}, context, { questionId: nextId, index: nextIndex, correct: null });
          this.state.cursor = `FRESH:${nextId}`;
          this.persist();
          return this.render();
        }
        const evidenceIds = [...(context.baseIds || []), ...(context.recoveryIds || [])];
        const records = this.fra14FinalRecords(evidenceIds);
        const evaluation = window.RevilyFra14Canonical?.evaluateFinalEvidence?.(records);
        this.state.exit.remediation = Object.assign({}, this.state.exit.remediation, { recoveryEvaluation: evaluation, evidenceWindow: evidenceIds });
        this.state.exit.result = evaluation?.masterySatisfied ? "SECURE" : "NEEDS_WORK";
        this.state.freshContext = null;
        this.state.cursor = "COMPLETE";
        this.emit("fra14_recovery_final_completed", { result: this.state.exit.result, evidence_question_ids: evidenceIds, evaluation });
        this.persist();
        return this.render();
      }
      if (context.fra15FinalRecovery) return this.advanceFra15Recovery(current);
      if (context.fra11FinalRecovery) return this.advanceFra11Recovery(current);
      if (context.fra12FinalRecovery) return this.advanceFra12Recovery(current);
      if (context.fra13FinalRecovery) return this.advanceFra13Recovery(current);
      if (context.fra09FinalRecovery) return this.advanceFra09Recovery(current);
      if (context.fra10FinalRecovery) {
        const nextIndex = Number(context.index || 0) + 1;
        if (nextIndex < context.recoveryIds.length) {
          const nextId = context.recoveryIds[nextIndex];
          this.state.freshContext = Object.assign({}, context, { questionId: nextId, index: nextIndex, correct: null });
          this.state.cursor = `FRESH:${nextId}`;
          this.persist();
          return this.render();
        }
        const passed = context.recoveryIds.every((id) => this.state.exit.responses[id]?.correct === true);
        this.state.exit.remediation = Object.assign({}, this.state.exit.remediation, { recoveryPassed: passed, recoveryEvidenceIds: [...context.recoveryIds] });
        this.state.exit.result = passed ? "SECURE" : "NEEDS_WORK";
        this.state.freshContext = null;
        this.state.cursor = "COMPLETE";
        this.emit("fra10_recovery_final_completed", { result: this.state.exit.result, evidence_question_ids: context.recoveryIds, required_all_correct: true });
        this.persist();
        return this.render();
      }
      if (context.fra08FinalRecovery) {
        const nextIndex = Number(context.index || 0) + 1;
        if (nextIndex < context.recoveryIds.length) {
          const nextId = context.recoveryIds[nextIndex];
          this.state.freshContext = Object.assign({}, context, { questionId: nextId, index: nextIndex, correct: null });
          this.state.cursor = `FRESH:${nextId}`;
          this.persist();
          return this.render();
        }
        const evidenceIds = [...(context.baseIds || []), ...(context.recoveryIds || [])];
        const records = this.fra08FinalRecords(evidenceIds);
        const evaluation = window.RevilyFra08Canonical?.evaluateFinalEvidence?.(records, false);
        this.state.exit.remediation = Object.assign({}, this.state.exit.remediation, { recoveryEvaluation: evaluation, evidenceWindow: evidenceIds });
        this.state.exit.result = evaluation?.masterySatisfied ? "SECURE" : "NEEDS_WORK";
        this.state.freshContext = null;
        this.state.cursor = "COMPLETE";
        this.emit("fra08_recovery_final_completed", { result: this.state.exit.result, evidence_question_ids: evidenceIds, evaluation });
        this.persist();
        return this.render();
      }
      if (context.fra16RepairFresh && !correct) {
        const recorded = this.state.evidence.errorFamily[questionId];
        const family = recorded === "support_needed"
          ? (this.state.evidence.candidateErrorFamily[questionId] || context.family)
          : (recorded || this.state.evidence.candidateErrorFamily[questionId] || context.family || "unknown");
        const recoveryId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family]
          || this.spec.lesson.adaptive_pathway?.repair_by_error_family?.unknown;
        const supportedId = this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family?.[family]
          || this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family?.unknown;
        const freshId = this.spec.lesson.adaptive_pathway?.repair_fresh_by_error_family?.[family]
          || this.spec.lesson.adaptive_pathway?.repair_fresh_by_error_family?.unknown;
        this.state.pendingRecovery = {
          originId: current.id,
          originQuestionId: questionId,
          recoveryId,
          supportedId,
          freshId,
          returnId: context.returnId,
          family,
          fra16RepairFlow: true,
          exitRemediation: false
        };
        this.state.freshContext = null;
        return this.enterRecovery(recoveryId);
      }
      if (correct) {
        this.state.evidence.freshConfirmationPassed[questionId] = true;
        this.state.evidence.pendingNoHintConfirmations = this.state.evidence.pendingNoHintConfirmations.filter((id) => id !== questionId);
        if (context.exitRemediation) return this.finishExitFreshSuccess(context);
        const nextPending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
        if (nextPending) {
          this.state.freshContext = { questionId: nextPending, family: this.model.getQuestion(nextPending)?.errorFamily || this.model.getQuestion(nextPending)?.primaryErrorFamily || "unknown", returnId: context.returnId || "M1", exitRemediation: false, correct: null };
          this.state.cursor = `FRESH:${nextPending}`;
        } else {
          this.state.freshContext = null;
          this.state.cursor = context.returnId || "M1";
        }
        this.persist();
        return this.render();
      }

      const recordedFreshFamily = this.state.evidence.errorFamily[questionId];
      const family = (recordedFreshFamily === "support_needed" ? this.state.evidence.candidateErrorFamily[questionId] : recordedFreshFamily)
        || this.state.evidence.candidateErrorFamily[questionId]
        || context.family
        || current.question?.errorFamily
        || current.question?.primaryErrorFamily
        || "unknown";
      const recoveryId = this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[family];
      const authoredFra16FreshId = this.isFra16V1() ? this.spec.lesson.adaptive_pathway?.repair_fresh_by_error_family?.[family] : null;
      const freshId = authoredFra16FreshId || this.freshCheckForFamily(family, [questionId]);
      const fra16SupportedId = this.isFra16V1() ? this.spec.lesson.adaptive_pathway?.repair_supported_by_error_family?.[family] : null;
      if (!recoveryId || !freshId) {
        this.state.exit.result = context.exitRemediation ? "NEEDS_WORK" : this.state.exit.result;
        this.state.freshContext = null;
        this.state.cursor = context.exitRemediation ? "COMPLETE" : (context.returnId || "M1");
        this.persist();
        return this.render();
      }
      this.state.pendingRecovery = {
        originId: current.id,
        originQuestionId: questionId,
        recoveryId,
        nextId: `FRESH:${freshId}`,
        returnId: context.returnId,
        freshId,
        family,
        exitRemediation: Boolean(context.exitRemediation),
        primaryId: context.primaryId || null,
        fra16RepairFlow: this.isFra16V1(),
        supportedId: fra16SupportedId
      };
      this.state.freshContext = null;
      this.enterRecovery(recoveryId);
    }

    finishExitFreshSuccess(context) {
      const remediation = this.state.exit.remediation;
      if (!remediation) {
        this.state.exit.result = "SECURE";
      } else {
        remediation.successes += 1;
        if (remediation.successes >= remediation.requiredSuccesses) this.state.exit.result = "SECURE";
        else {
          this.state.freshContext = null;
          this.beginNextExitRepair();
          this.persist();
          return this.render();
        }
      }
      this.state.freshContext = null;
      this.persist();
      this.finishExit();
    }

    adaptiveNextId(current) {
      if (!this.spec.canonical_lesson?.reference_for_future_lessons || current.phase === "exit") return current.nextId;
      if (this.isFra07V1() && current.id === "G2") {
        const strong = window.RevilyFra07Canonical.shouldSkipF1(this) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without hint, support escalation, or a central error" });
        return next;
      }
      if (this.isFra01CanonicalV2()) {
        if (current.id === "G2") {
          const g1 = "FRA-01-G1";
          const g2 = "FRA-01-G2";
          const strong = this.state.evidence.firstAttemptCorrect[g1] === true
            && this.state.evidence.firstAttemptCorrect[g2] === true
            && !this.state.evidence.hintOpenedBeforeSubmit[g1]
            && !this.state.evidence.hintOpenedBeforeSubmit[g2]
            && !this.state.evidence.errorFamily[g1]
            && !this.state.evidence.errorFamily[g2];
          if (strong) {
            this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "two clean guided successes" });
            return "F2";
          }
          return "F1";
        }
        if (current.id === "I2") {
          const pending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
          if (pending) {
            const question = this.model.getQuestion(pending);
            this.state.freshContext = { questionId: pending, family: question?.errorFamily || question?.primaryErrorFamily || "unknown", returnId: "M1", exitRemediation: false, correct: null };
            return `FRESH:${pending}`;
          }
          return "M1";
        }
        return current.nextId;
      }
      if (this.isFra13V1() && current.id === "G2") {
        const g1 = "FRA-13-G1";
        const g2 = "FRA-13-G2";
        const strong = window.RevilyFra13Canonical?.shouldSkipF1?.({
          g1: {
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g1] === true,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g1] === true,
            supportEscalated: this.state.evidence.supportEscalated[g1] === true
          },
          g2: {
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g2] === true,
            componentFirstAttemptCorrect: this.state.evidence.componentFirstAttemptCorrect[g2] || {},
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g2] === true,
            supportEscalated: this.state.evidence.supportEscalated[g2] === true
          },
          unresolvedCentralError: Boolean(this.state.evidence.errorFamily[g1] || this.state.evidence.errorFamily[g2])
        }) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "all guided components correct first attempt without support" });
        return next;
      }
      if (this.isFra17V1() && current.id === "G2") {
        const g1 = "FRA-17-G1";
        const g2 = "FRA-17-G2";
        const centralErrorSignals = [g1, g2]
          .flatMap((id) => [this.state.evidence.candidateErrorFamily[id], this.state.evidence.errorFamily[id]])
          .filter(Boolean);
        const strong = window.RevilyFra17Canonical?.shouldSkipF1?.({
          g1: {
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g1] === true,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g1] === true,
            supportEscalated: this.state.evidence.supportEscalated[g1] === true
          },
          g2: {
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g2] === true,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g2] === true,
            supportEscalated: this.state.evidence.supportEscalated[g2] === true
          },
          centralErrorSignals
        }) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without support or a central error" });
        return next;
      }
      if (this.isFra20V1() && current.id === "G2") {
        const g1 = "FRA-20-G1";
        const g2 = "FRA-20-G2";
        const centralFamilies = new Set(["DEN_CHANGE", "ADD", "ORDER", "RENAME", "VIS"]);
        const unresolvedCentralMisconception = [g1, g2]
          .flatMap((id) => [this.state.evidence.candidateErrorFamily[id], this.state.evidence.errorFamily[id]])
          .some((family) => centralFamilies.has(family));
        const strong = window.RevilyFra20Canonical?.shouldSkipF1?.({
          g1: {
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g1] === true,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g1] === true,
            supportEscalated: this.state.evidence.supportEscalated[g1] === true
          },
          g2: {
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g2] === true,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[g2] === true,
            supportEscalated: this.state.evidence.supportEscalated[g2] === true
          },
          unresolvedCentralMisconception
        }) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without support or an unresolved central error" });
        return next;
      }
      if (this.isFra21V1() && current.id === "G2") {
        const records = ["G1", "G2"].map((id) => {
          const questionId = `FRA-21-${id}`;
          const recorded = this.state.evidence.errorFamily[questionId];
          return {
            questionId: id,
            stage: "guided",
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
            correct: this.state.resolved[questionId] === "correct",
            attempts: this.state.attempts[questionId] || 0,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
            supportEscalated: this.state.evidence.supportEscalated[questionId] === true,
            answerLocked: this.state.evidence.answerLocked[questionId] === true,
            errorFamily: recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[questionId] : recorded,
            assessmentFamilies: this.model.getQuestion(questionId)?.evidenceFamily || []
          };
        });
        const strong = window.RevilyFra21Canonical.shouldSkipF1(records) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without support or a central error" });
        return next;
      }
      if (this.isFra22V1() && current.id === "G2") {
        const g1 = window.RevilyFra22Canonical.evidenceRecord("G1", this.state, {});
        const g2 = window.RevilyFra22Canonical.evidenceRecord("G2", this.state, {});
        const strong = window.RevilyFra22Canonical.source.shouldSkipF1(g1, g2) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without a hint, support escalation, or a visible central misconception" });
        return next;
      }
      if (this.isFra23V1() && current.id === "G2") {
        const records = ["G1", "G2"].map((id) => {
          const questionId = `FRA-23-${id}`;
          const recorded = this.state.evidence.errorFamily[questionId];
          return {
            questionId: id,
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
            attempts: this.state.attempts[questionId] || 0,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
            supportEscalated: this.state.evidence.supportEscalated[questionId] === true,
            errorFamilyHypothesis: recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[questionId] : recorded
          };
        });
        const strong = window.RevilyFra23Canonical.shouldSkipF1(records) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without support or a central error" });
        return next;
      }
      if (this.isFra24V1() && current.id === "G2") {
        const records = ["G1", "G2"].map((id) => {
          const questionId = `FRA-24-${id}`;
          const recorded = this.state.evidence.errorFamily[questionId];
          return {
            questionId: id,
            firstAttemptCorrect: this.state.evidence.firstAttemptCorrect[questionId] === true,
            attempts: this.state.attempts[questionId] || 0,
            hintOpenedBeforeSubmit: this.state.evidence.hintOpenedBeforeSubmit[questionId] === true,
            supportEscalated: this.state.evidence.supportEscalated[questionId] === true,
            supportLevel: "guided",
            answerLocked: this.state.evidence.answerLocked[questionId] === true,
            errorFamilyHypothesis: recorded === "support_needed" ? this.state.evidence.candidateErrorFamily[questionId] : recorded,
            freshConfirmationPassed: false,
            mathematicallyEquivalentButFormIncomplete: false
          };
        });
        const strong = window.RevilyFra24Canonical.shouldSkipF1(records) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without support or a central error" });
        return next;
      }
      if (this.isFra28V1() && current.id === "G2") {
        const guidedIds = ["FRA-28-G1", "FRA-28-G2"];
        const centralFamilies = new Set(["FLIP_DIVIDEND", "FLIP_BOTH", "NO_RECIPROCAL", "SEPARATE_DIVIDE", "SMALLER_IMPOSSIBLE", "RECIPROCAL_FORM"]);
        const strong = guidedIds.every((id) => this.state.evidence.firstAttemptCorrect[id] === true
          && this.state.evidence.hintOpenedBeforeSubmit[id] !== true
          && this.state.evidence.supportEscalated[id] !== true
          && !centralFamilies.has(this.state.evidence.candidateErrorFamily[id])
          && !centralFamilies.has(this.state.evidence.errorFamily[id]));
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "both guided responses were first-attempt correct without support or a central error" });
        return next;
      }
      if (this.isFra14V1() && current.id === "G2") {
        const g1 = "FRA-14-G1";
        const g2 = "FRA-14-G2";
        const components = this.state.evidence.componentFirstAttemptCorrect[g1] || {};
        const central = [g1, g2].some((id) => {
          const family = this.state.evidence.candidateErrorFamily[id] || this.state.evidence.errorFamily[id];
          return ["PART_AS_WHOLE", "DIVIDE_BY_DENOM_OR_ROLE_SWAP", "MULTIPLY_NUMERATOR", "STOP_AT_ONE_PART"].includes(family);
        });
        const strong = window.RevilyFra14Canonical?.shouldSkipF1?.({
          g1OnePartFirstAttemptCorrect: components.onePart === true,
          g1WholeFirstAttemptCorrect: components.whole === true,
          g2FirstAttemptCorrect: this.state.evidence.firstAttemptCorrect[g2] === true,
          supportEscalated: Boolean(this.state.evidence.supportEscalated[g1] || this.state.evidence.supportEscalated[g2]),
          centralError: central
        }) === true;
        const next = strong ? "F2" : "F1";
        if (strong) this.emit("adaptive_skip", { from: "G2", to: "F2", skipped: "F1", reason: "all three guided components were first-attempt correct without support or central error" });
        return next;
      }
      if (["fra02", "fra03", "fra04", "fra05", "fra06", "fra07", "fra08", "fra09", "fra10", "fra11", "fra12", "fra13", "fra14", "fra15", "fra16", "fra17", "fra20", "fra21", "fra22", "fra23", "fra24", "fra26", "fra28"].includes(this.spec.canonical_lesson?.engine_profile)) {
        const gate = this.spec.lesson.adaptive_pathway?.no_hint_gate_after;
        if (gate?.nodeId === current.id) {
          const pending = this.state.evidence.pendingNoHintConfirmations.find((id) => !this.state.evidence.freshConfirmationPassed[id]);
          if (pending) {
            const question = this.model.getQuestion(pending);
            this.state.freshContext = {
              questionId: pending,
              family: question?.errorFamily || question?.primaryErrorFamily || "unknown",
              returnId: gate.returnId || current.nextId,
              exitRemediation: false,
              introNarration: this.isFra12V1()
                ? (question?.scripts?.before_submit || [])
                : (gate.introUtteranceIds || []).map((id) => this.spec.canonical_lesson?.runtime_copy?.[id]?.text).filter(Boolean),
              correct: null
            };
            return `FRESH:${pending}`;
          }
        }
        const fra02Rule = this.spec.lesson.adaptive_pathway?.skip_after?.[current.id];
        if (!fra02Rule) return current.nextId;
        const clean = (fra02Rule.questionRefs || []).every((questionId) => (
          this.state.evidence.firstAttemptCorrect[questionId] === true
          && !this.state.evidence.hintOpenedBeforeSubmit[questionId]
          && !this.state.evidence.errorFamily[questionId]
          && !this.state.evidence.factorInvalid[questionId]
          && !this.state.evidence.supportEscalated[questionId]
        ));
        const next = clean ? fra02Rule.next : (fra02Rule.otherwise || current.nextId);
        if (clean) this.emit("adaptive_skip", { from: current.id, to: next, skipped: current.nextId, reason: "clean guided evidence" });
        return next;
      }
      const rule = this.spec.lesson.adaptive_pathway?.skip_after?.[current.id];
      if (!rule) return current.nextId;
      const ready = (rule.requires || []).every((nodeId) => {
        const node = this.model.getNode(nodeId);
        return node?.questionId && this.state.evidence.firstAttemptCorrect[node.questionId] === true;
      });
      if (ready) {
        this.emit("adaptive_skip", { from: current.id, to: rule.next, evidence_nodes: rule.requires });
        return rule.next;
      }
      return current.nextId;
    }

    fra08ResponseKey(question, response) {
      if (response && typeof response === "object" && "factor" in response) {
        if (response.value === null || response.value === undefined || response.value === "") return `factor:${response.factor}`;
        return `factor-value:${response.factor}:${response.value}`;
      }
      if (response && typeof response === "object" && "n" in response && "d" in response) return `${response.n}/${response.d}`;
      return String(response ?? "");
    }

    requiresRepeatedEvidence(question, response) {
      const classification = question?.errorClassification || {};
      if (this.isFra07V1()) return window.RevilyFra07Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra15V1()) return window.RevilyFra15Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra16V1()) return window.RevilyFra16Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra17V1()) return window.RevilyFra17Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra28V1()) return window.RevilyFra28Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra26V1()) return window.RevilyFra26Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra20V1()) return window.RevilyFra20Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra21V1()) return window.RevilyFra21Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra22V1()) return window.RevilyFra22Canonical?.isBlockingFamily?.(window.RevilyFra22Canonical?.evaluateResponse?.(question, response)?.errorFamily) === true;
      if (this.isFra23V1()) return window.RevilyFra23Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra24V1()) return window.RevilyFra24Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (this.isFra14V1()) {
        const family = window.RevilyFra14Canonical?.classifyErrorFamily?.(question, response);
        return ["PART_AS_WHOLE", "DIVIDE_BY_DENOM_OR_ROLE_SWAP", "MULTIPLY_NUMERATOR", "STOP_AT_ONE_PART"].includes(family);
      }
      if (this.isFra11V1()) {
        const evaluation = window.RevilyFra11Canonical?.classifyResponse?.(question, response);
        return Boolean(evaluation?.errorFamily && evaluation.errorFamily !== "ARITH" && !String(evaluation.classification || "").startsWith("value_correct_noncanonical"));
      }
      if (this.isFra13V1()) return window.RevilyFra13Canonical?.requiresRepeatedEvidence?.(question, response) === true;
      if (!this.isFra08V1()) return classification.requiresRepeatedEvidence === true;
      const direct = this.fra08ResponseKey(question, response);
      const predicate = window.RevilyFra08Canonical?.predicateKey?.(question, response);
      return classification.repeatedResponseKeys?.[direct] === true
        || (predicate && classification.repeatedResponseKeys?.[predicate] === true);
    }

    classifyMisconception(question, response) {
      const classification = question?.errorClassification;
      if (this.isFra07V1()) return window.RevilyFra07Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "unknown";
      if (this.isFra15V1()) return window.RevilyFra15Canonical?.evaluateResponse?.(question, response)?.errorFamily || classification?.fallback || "unknown";
      if (this.isFra16V1()) return window.RevilyFra16Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "unknown";
      if (this.isFra17V1()) return window.RevilyFra17Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "UNKNOWN";
      if (this.isFra28V1()) return window.RevilyFra28Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "AMBIGUOUS";
      if (this.isFra26V1()) return window.RevilyFra26Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "unknown";
      if (this.isFra20V1()) return window.RevilyFra20Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "UNKNOWN";
      if (this.isFra21V1()) return window.RevilyFra21Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "UNKNOWN";
      if (this.isFra22V1()) return window.RevilyFra22Canonical?.evaluateResponse?.(question, response)?.errorFamily || classification?.fallback || "UNKNOWN";
      if (this.isFra23V1()) return window.RevilyFra23Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "UNKNOWN";
      if (this.isFra24V1()) return window.RevilyFra24Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "unknown";
      if (this.isFra14V1()) return window.RevilyFra14Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "AMBIGUOUS";
      if (this.isFra11V1()) return window.RevilyFra11Canonical?.classifyResponse?.(question, response)?.errorFamily || classification?.fallback || "ARITH";
      if (this.isFra12V1()) return window.RevilyFra12Canonical?.classifyResponse?.(question, response) || classification?.fallback || "unknown";
      if (this.isFra13V1()) return window.RevilyFra13Canonical?.classifyErrorFamily?.(question, response) || classification?.fallback || "unknown";
      if (this.isFra09V1()) {
        const evaluation = window.RevilyFra09Adapter?.evaluateResponse?.(question, response);
        return evaluation?.errorFamily || classification?.fallback || question?.primaryErrorFamily || "UNKNOWN";
      }
      if (this.isFra08V1() && classification) {
        const direct = this.fra08ResponseKey(question, response);
        const predicate = window.RevilyFra08Canonical?.predicateKey?.(question, response);
        if (classification.factorFamilies && response && typeof response === "object" && "factor" in response) {
          const family = classification.factorFamilies[String(response.factor)];
          if (family && (response.value === null || response.value === undefined || response.value === "")) return family;
        }
        if (classification.choiceFamilies?.[direct]) return classification.choiceFamilies[direct];
        if (classification.integerFamilies?.[direct]) return classification.integerFamilies[direct];
        if (classification.fractionFamilies?.[direct]) return classification.fractionFamilies[direct];
        if (predicate) {
          const signal = (classification.predicates || []).find((item) => `predicate:${item.description}` === predicate);
          if (signal) return signal.family;
        }
        return classification.fallback || question.primaryErrorFamily || "unknown";
      }
      if (classification && Object.keys(classification).length) {
        const value = response && typeof response === "object" && "value" in response ? response.value : response;
        if (classification.choiceSetFamilies && Array.isArray(value)) {
          const family = classification.choiceSetFamilies[value.map(String).sort().join("|")];
          if (family) return family;
        }
        if (classification.countFamilies && Array.isArray(value)) {
          const family = classification.countFamilies[String(new Set(value.map(String)).size)];
          if (family) return family;
        }
        if (classification.symbolDirectionRequiresMagnitudeEvidence && response && typeof response === "object" && response.largerFractionIdentifiedCorrectly === true) {
          return "symbol_direction";
        }
        if (classification.choiceFamilies && typeof value !== "object") {
          const family = classification.choiceFamilies[String(value)];
          if (family) return family;
        }
        if (classification.integerFamilies && typeof value !== "object") {
          const family = classification.integerFamilies[String(value).trim()];
          if (family) return family;
        }
        if (classification.fractionFamilies && value && typeof value === "object" && "n" in value && "d" in value) {
          const family = classification.fractionFamilies[`${value.n}/${value.d}`];
          if (family) return family;
        }
        if (classification.sortFamilies && value && typeof value === "object" && !Array.isArray(value)) {
          for (const [cardId, destination] of Object.entries(value)) {
            const family = classification.sortFamilies[`${cardId}:${destination}`];
            if (family) return family;
          }
        }
        if (value && typeof value === "object") {
          const actualN = Number(value.n);
          const actualD = Number(value.d);
          const expectedN = Number(question.model?.selectedParts);
          const expectedD = Number(question.model?.totalParts);
          if (classification.swappedFraction && actualN === expectedD && actualD === expectedN) return "swap_roles";
          const numeratorFamily = classification.numeratorFamilies?.[String(value.n)];
          if (numeratorFamily) return numeratorFamily;
          const denominatorFamily = classification.denominatorFamilies?.[String(value.d)];
          if (denominatorFamily) return denominatorFamily;
        }
        return classification.fallback || question.primaryErrorFamily || "unknown";
      }
      if (this.spec.canonical_lesson?.storyboard_version === "2.0") {
        const model = question?.model || {};
        if (question.id === "FRA-01-I2") return response === "B" ? "equal_parts" : response === "C" ? "whole_not_identified" : "unknown";
        if (["equal_parts_validity", "final_equal_parts_reasoning"].includes(question.assessmentIntent)) return "equal_parts";
        if (question.response?.type !== "fraction" || typeof response !== "object") return question.primaryErrorFamily || "unknown";
        const actualPart = Number(response.n);
        const actualWhole = Number(response.d);
        const expectedPart = Number(model.selectedParts);
        const expectedWhole = Number(model.totalParts);
        if (actualPart === expectedWhole && actualWhole === expectedPart) return "order_reversal";
        if (actualWhole !== expectedWhole) return "whole_not_identified";
        if (model.selectedMeaning === "left" && actualPart === expectedWhole - expectedPart) return "target_part";
        if (actualPart !== expectedPart) return "target_part";
        return question.primaryErrorFamily || "unknown";
      }
      const model = question?.model || {};
      if (model.unequalParts && question.response?.type === "yes_no") return "unequal_parts_accepted";
      if (question.assessmentIntent === "symbol_to_visual") return "representation_mismatch";
      if (question.response?.type !== "fraction" || typeof response !== "object") return "concept_not_yet_secure";
      const actualN = Number(response.n);
      const actualD = Number(response.d);
      const expectedN = Number(model.selectedParts);
      const expectedD = Number(model.totalParts);
      if (actualN === expectedD && actualD === expectedN) return "reversed_fraction";
      if (actualD === expectedN) return "shaded_only_denominator";
      if (actualD !== expectedD) return "wrong_whole";
      if (actualN === expectedD - expectedN) {
        if (["remaining", "unused"].includes(model.selectedMeaning)) return `used_instead_of_${model.selectedMeaning}`;
        return "unselected_as_numerator";
      }
      return "selected_count_error";
    }

    recoveryForMisconception(misconception, question, fallback) {
      if (["fra02", "fra03", "fra04", "fra05", "fra06", "fra07", "fra08", "fra09", "fra10", "fra12", "fra13", "fra15", "fra16", "fra21"].includes(this.spec.canonical_lesson?.engine_profile)) {
        return this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[misconception] || null;
      }
      if (this.spec.canonical_lesson?.storyboard_version === "2.0") {
        return this.spec.lesson.adaptive_pathway?.repair_by_error_family?.[misconception]
          || this.spec.lesson.adaptive_pathway?.repair_by_error_family?.unknown
          || fallback;
      }
      if (misconception === "unequal_parts_accepted") return "FRA-01-R03";
      if (["wrong_whole", "unselected_as_numerator", "selected_count_error"].includes(misconception) && ["counter", "tile", "cupcake"].includes(question.model?.context)) return "FRA-01-R02";
      if (misconception && this.spec.identity.id === "FRA-01") return "FRA-01-R01";
      return fallback;
    }

    misconceptionFeedback(code) {
      const authored = this.spec.lesson.adaptive_pathway?.feedback_by_error_family;
      if (authored) return authored[code] || authored.unknown || authored.support_needed;
      if (this.spec.canonical_lesson?.storyboard_version === "2.0") {
        const messages = {
          equal_parts: "Count isn’t enough. Check whether the parts are genuinely equal.",
          order_reversal: "Say what the picture means before you type it: the part asked about, out of all the equal parts in the whole.",
          whole_not_identified: "Start with the whole. Count everything that belongs to it.",
          target_part: "You counted a real part of the picture, but check which part the question asks about.",
          unknown: "Start with the whole, check the parts are equal, then count the part asked about."
        };
        return messages[code] || messages.unknown;
      }
      const messages = {
        reversed_fraction: "The two counts are in the opposite positions.",
        shaded_only_denominator: "The denominator must describe the whole, not just the selected part.",
        wrong_whole: "The denominator needs to count every equal part in the whole.",
        unselected_as_numerator: "The question asks for the selected group, not the unselected group.",
        used_instead_of_remaining: "You counted what was eaten; the question asks what remains.",
        used_instead_of_unused: "You counted what was used; the question asks what is unused.",
        unequal_parts_accepted: "A fraction name only works when the parts are equal.",
        representation_mismatch: "Match both roles: selected parts on top and all equal parts on the bottom.",
        selected_count_error: "Recheck which parts the question asks you to count."
      };
      return messages[code] || "Use the visual to recheck the whole and the selected part.";
    }

    workedSummary(question) {
      const model = question?.model;
      if (!model || question.stage === "exit" || question.stage === "confirmation") return "";
      if (model.context === "fraction_comparison" && model.left && model.right) {
        const left = model.left;
        const right = model.right;
        const comparison = `${left.numerator}/${left.denominator} ${model.answer} ${right.numerator}/${right.denominator}`;
        if (left.denominator === right.denominator) {
          return `Both fractions have denominator ${left.denominator}, so their pieces are the same size. Compare ${left.numerator} pieces with ${right.numerator} pieces: ${comparison}.`;
        }
        if (left.numerator === right.numerator) {
          const largerPieces = left.denominator < right.denominator ? left.denominator : right.denominator;
          const smallerPieces = left.denominator < right.denominator ? right.denominator : left.denominator;
          return `Both fractions have numerator ${left.numerator}, so they count the same number of pieces. A whole split into ${largerPieces} equal parts has larger pieces than one split into ${smallerPieces}: ${comparison}.`;
        }
        if (left.numerator * right.denominator === right.numerator * left.denominator) {
          return `The two fractions cover the same amount of an equal whole, so ${comparison}.`;
        }
        return `Compare the two fractions using the same whole: ${comparison}.`;
      }
      if (question.assessmentIntent === "symbol_to_visual") return `${question.targetFraction} means ${model.selectedParts} selected parts out of ${model.totalParts} equal parts. Model ${question.answer?.value} matches.`;
      if (model.unequalParts) return `The ${model.totalParts} parts are not equal, so they cannot name equal fractional parts.`;
      const partWord = model.selectedParts === 1 ? "part" : "parts";
      return `${model.selectedParts} ${model.selectedMeaning || "selected"} ${partWord} out of ${model.totalParts} equal parts gives ${model.selectedParts}/${model.totalParts}.`;
    }

    finishExit() {
      if (!this.state.exit.result) return;
      this.state.status = this.state.exit.result;
      this.state.cursor = "COMPLETE";
      this.emit("exit_completed", { result: this.state.exit.result });
      this.emit("skill_completed", { result: this.state.exit.result });
      this.persist();
      this.render();
    }

    renderCompletion(current) {
      this.stopNarration(false);
      const branch = current.result === "SECURE" ? this.spec.completion.secure : this.spec.completion.needs_work;
      const completionNarration = uniqueLines([branch.ryan_script]);
      this.root.setAttribute("aria-busy", "false");
      this.root.innerHTML = `
        <div class="app-shell completion-shell">
          <header class="topbar"><button class="brand-button" id="brand-home" type="button" aria-label="Back to ${escapeHtml(this.topic.title)}"><span class="brand-mark" aria-hidden="true">R</span><span><small>Revily ${escapeHtml(this.topic.title)}</small><strong>${escapeHtml(this.spec.identity.title)}</strong></span></button><button class="quiet-button" id="start-again" type="button"><span aria-hidden="true">↻</span><span>Start again</span></button></header>
          <main id="main-content" class="completion-main" tabindex="-1">
            <article class="completion-card ${current.result === "SECURE" ? "secure" : "needs-work"}">
              <div class="completion-orbit" aria-hidden="true"><span></span><i></i></div>
              <span class="eyebrow">${current.result === "SECURE" ? "Lesson complete" : "Keep building"}</span>
              <h1>${escapeHtml(branch.title)}</h1>
              ${completionNarration.length ? (this.progressiveCaptions ? `<section class="completion-caption-layer" id="ryan-panel" aria-label="Ryan's narration"><strong class="visually-hidden" id="ryan-status">Ryan</strong><p class="canvas-caption" id="ryan-caption" aria-hidden="true"></p><p class="visually-hidden" id="ryan-caption-accessible" aria-live="polite"></p><div class="narration-controls canvas-narration-controls"><button type="button" id="replay-narration">Replay</button><button type="button" id="skip-narration">Skip</button></div></section>` : `<section class="completion-ryan" id="ryan-panel" aria-label="Ryan's narration"><span class="ryan-avatar" aria-hidden="true">R</span><div><strong id="ryan-status">Ryan</strong><p id="ryan-caption">${escapeHtml(completionNarration.join(" "))}</p></div><div class="narration-controls"><button type="button" id="replay-narration">Replay</button><button type="button" id="skip-narration">Skip</button></div></section>`) : ""}
              <div class="completion-actions">${(branch.buttons || []).map((button, index) => `<button type="button" class="${index === 0 ? "primary-button" : "secondary-button"}" data-completion-action="${index}">${escapeHtml(button)}</button>`).join("")}</div>
              <button class="text-button" id="back-to-topic" type="button">Back to ${escapeHtml(this.topic.title)}</button>
            </article>
          </main>
          <dialog class="restart-dialog" id="restart-dialog" aria-labelledby="restart-title"><form method="dialog"><span class="eyebrow">Start again</span><h2 id="restart-title">Reset this lesson attempt?</h2><p>Your earlier completion history will stay saved.</p><div><button class="secondary-button" id="cancel-restart" value="cancel">Cancel</button><button class="primary-button" id="confirm-restart" value="confirm">Start again</button></div></form></dialog>
        </div>`;
      this.root.querySelector("#brand-home").addEventListener("click", () => this.goHome());
      this.root.querySelector("#back-to-topic").addEventListener("click", () => this.goHome());
      this.root.querySelector("#start-again").addEventListener("click", () => this.openRestartDialog());
      this.root.querySelector("#confirm-restart").addEventListener("click", (event) => {
        event.preventDefault();
        this.startAgain();
      });
      this.root.querySelectorAll("[data-completion-action]").forEach((button) => {
        const label = button.textContent.toLowerCase();
        button.addEventListener("click", () => label.includes("again") ? this.startAgain() : this.goHome());
      });
      this.elements = {
        ryan: this.root.querySelector("#ryan-panel"),
        caption: this.root.querySelector("#ryan-caption"),
        captionAccessible: this.root.querySelector("#ryan-caption-accessible"),
        ryanStatus: this.root.querySelector("#ryan-status"),
        replay: this.root.querySelector("#replay-narration"),
        skip: this.root.querySelector("#skip-narration"),
        toast: null
      };
      this.elements.replay?.addEventListener("click", () => this.replayNarration());
      this.elements.skip?.addEventListener("click", () => this.skipNarration());
      if (this.spec.experience_contract?.completion_header_controls) {
        const restart = this.root.querySelector("#start-again");
        restart.setAttribute("aria-label", "Start again");
        const controls = document.createElement("div");
        controls.className = "topbar-actions";
        restart.replaceWith(controls);
        const sound = document.createElement("button");
        sound.className = "quiet-button";
        sound.id = "sound-toggle";
        sound.type = "button";
        const label = this.state.soundOn ? "Sound on" : "Sound off";
        sound.setAttribute("aria-label", label);
        sound.setAttribute("aria-pressed", String(this.state.soundOn));
        sound.innerHTML = `<span aria-hidden="true">${this.state.soundOn ? "◖" : "○"}</span><span>${label}</span>`;
        sound.addEventListener("click", () => this.toggleSound());
        controls.append(sound, restart);
      }
      this.startNarration(completionNarration, null);
    }

    selectReaction(current, attempts) {
      if (this.spec.voice_and_script?.success_reaction_policy?.mode === "question_specific_only") return null;
      if (current.question?.success_reaction?.mode === "silent") return null;
      const history = this.state.reactionHistory;
      let context = "standard_success";
      if (current.recovery) context = "recovery_success";
      else if (attempts > 1) context = "correct_after_hint";
      else if (current.phase === "independent") context = "independent_first_try";
      else if (current.phase === "faded") context = "faded_first_try";
      else if (current.phase === "guided") context = "guided_first_try";
      else if (current.phase === "practice" && this.state.practiceStreak >= 2) context = "practice_streak";
      else if (current.phase === "practice") context = "practice_first_try";
      else if (current.phase === "teaching") context = "teaching_checkpoint_first_try";
      const unused = (reaction) => !history.ids.includes(reaction.id) && !history.texts.includes(reaction.text) && !history.leadFamilies.includes(reaction.lead_family);
      const reactions = this.dialogue.reaction_bank || [];
      let pool = reactions.filter((reaction) => (reaction.eligible_contexts || []).includes(context) && unused(reaction));
      if (!pool.length) pool = reactions.filter((reaction) => (reaction.eligible_contexts || []).includes("standard_success") && unused(reaction));
      if (!pool.length) return null;
      const reaction = pool[randomIndex(pool.length)];
      history.ids.push(reaction.id);
      history.texts.push(reaction.text);
      history.leadFamilies.push(reaction.lead_family);
      this.persist();
      return reaction;
    }

    narrationCuesFor(line) {
      const current = this.current();
      const beat = normaliseNarrationText(line);
      if (!current || !beat) return [];
      const utteranceId = this.isRegistryRuntimeLesson() ? this.fra05UtteranceForLine(beat)?.id : null;
      return (current.visual?.syncCues || []).filter((cue) => {
        const phrase = normaliseNarrationText(cue?.cue);
        const idMatches = !this.isRegistryRuntimeLesson() || (utteranceId && cue?.utteranceId === utteranceId);
        return idMatches && phrase && beat.toLowerCase().includes(phrase.toLowerCase());
      });
    }

    fra05UtteranceForLine(line) {
      if (!this.isRegistryRuntimeLesson()) return null;
      const text = normaliseNarrationText(line);
      const id = this.spec.canonical_lesson?.runtime_copy_text_to_id?.[text];
      const entry = id ? this.spec.canonical_lesson?.runtime_copy?.[id] : null;
      return id && entry?.text === text ? { id, entry } : null;
    }

    updateProgressiveCaption(state) {
      if (!this.progressiveCaptions || !this.elements?.caption) return;
      const text = String(state?.text || "");
      const current = state?.current;
      if (!text || !current) {
        this.elements.caption.textContent = "";
        this.elements.ryan?.classList.remove("has-caption-text");
        return;
      }
      const before = text.slice(0, Math.max(0, current.start));
      const word = text.slice(current.start, current.end);
      this.elements.caption.innerHTML = `${escapeHtml(before)}<span class="caption-current-word">${escapeHtml(word)}</span>`;
      this.elements.ryan?.classList.add("has-caption-text");
      if (this.elements.captionAccessible) this.elements.captionAccessible.textContent = text;
    }

    completeProgressiveCaption() {
      if (!this.progressiveCaptions || !this.elements?.ryan) return;
      this.elements.ryan.classList.add("is-complete");
    }

    resetNarrationCues() {
      const canvas = this.elements?.canvas;
      if (!canvas) return;
      [...canvas.classList].filter((name) => name.startsWith("cue-")).forEach((name) => canvas.classList.remove(name));
      canvas.removeAttribute("data-active-cue");
    }

    applyNarrationCue(cue) {
      const canvas = this.elements?.canvas;
      if (!canvas || !cue) return;
      const action = cueClass(cue.action || cue.id);
      if (!action) return;
      canvas.classList.add(`cue-${action}`);
      canvas.setAttribute("data-active-cue", action);
      if (cue.accessibleLabel) canvas.setAttribute("aria-label", cue.accessibleLabel);
      canvas.dispatchEvent(new CustomEvent("revily:narration-cue", { detail: cue }));
    }

    startNarration(lines, onDone, options) {
      const authoredLines = uniqueLines(lines);
      const queue = this.progressiveCaptions && !this.isRegistryRuntimeLesson()
        ? uniqueLines(authoredLines.flatMap((line) => speechBeats(line)))
        : authoredLines;
      if (!queue.length) {
        if (onDone) onDone();
        return;
      }
      if (this.isRegistryRuntimeLesson()) {
        const invalid = queue.find((line) => !this.fra05UtteranceForLine(line));
        if (invalid) throw new Error(`${this.spec.identity.id} narration is not registry-authored: ${invalid}`);
      }
      this.primeNarrationAssets(queue);
      this.stopNarration(false);
      const fullText = queue.join(" ");
      const utteranceIds = this.isRegistryRuntimeLesson() ? queue.map((line) => this.fra05UtteranceForLine(line).id) : [];
      this.activeNarration = {
        lines: queue, index: 0, text: fullText, utteranceIds,
        resumeAtMs: Math.max(0, Number(options?.resumeAtMs) || 0),
        done: once(onDone || (() => {}))
      };
      if (this.isRegistryRuntimeLesson()) {
        this.state.narrationResume = {
          active: true, cursor: this.current()?.id || null, utteranceIds,
          index: 0, elapsedMs: this.activeNarration.resumeAtMs,
          action: options?.resumeAction || null
        };
        this.persist();
      }
      this.lastNarration = { lines: queue, text: fullText };
      if (this.progressiveCaptions) this.resetNarrationCues();
      this.elements = this.elements || {};
      if (!this.elements.ryan || !document.body.contains(this.elements.ryan)) return;
      this.elements.ryan.hidden = false;
      this.elements.ryan.classList.add("is-speaking");
      this.elements.ryan.classList.remove("is-complete");
      this.elements.ryanStatus.textContent = this.state.soundOn ? "Ryan is speaking" : "Ryan's captions";
      if (this.progressiveCaptions) {
        this.elements.caption.textContent = "";
        this.elements.ryan.classList.remove("has-caption-text");
        if (this.elements.captionAccessible) this.elements.captionAccessible.textContent = "";
      } else {
        this.elements.caption.textContent = queue[0];
      }
      this.elements.replay.disabled = false;
      this.elements.skip.hidden = false;
      const delayMs = Math.max(0, Math.min(5000, Number(options?.delayMs) || 0));
      if (delayMs) {
        const narration = this.activeNarration;
        this.elements.ryan.classList.remove("is-speaking");
        this.elements.ryanStatus.textContent = "Ryan will begin shortly";
        this.elements.replay.disabled = true;
        this.elements.skip.hidden = true;
        this.narrationTimer = window.setTimeout(() => {
          if (this.activeNarration !== narration) return;
          this.elements.replay.disabled = false;
          this.elements.skip.hidden = false;
          this.playNarration();
        }, delayMs);
        return;
      }
      this.playNarration();
    }

    async playNarration() {
      if (!this.activeNarration) return;
      window.clearTimeout(this.narrationTimer);
      this.stopSpeech();
      const narration = this.activeNarration;
      const line = narration.lines[narration.index];
      if (!line) return this.finishNarration();
      const fra05Utterance = this.fra05UtteranceForLine(line);
      if (this.isRegistryRuntimeLesson()) {
        if (!fra05Utterance) throw new Error(`${this.spec.identity.id} narration is not registry-authored: ${line}`);
        narration.resumeAtMs = narration.index === 0 ? narration.resumeAtMs : 0;
        this.state.narrationResume = Object.assign({}, this.state.narrationResume, {
          active: true, cursor: this.current()?.id || null, utteranceIds: narration.utteranceIds,
          index: narration.index, elapsedMs: narration.resumeAtMs, utteranceId: fra05Utterance.id
        });
        this.elements.ryan.dataset.utteranceId = fra05Utterance.id;
        this.elements.caption.dataset.utteranceId = fra05Utterance.id;
        this.persist();
      }
      if (this.progressiveCaptions) {
        this.elements.caption.textContent = "";
        this.elements.ryan.classList.remove("has-caption-text");
        if (this.elements.captionAccessible) this.elements.captionAccessible.textContent = "";
        this.narrationSync.start(line, this.narrationCuesFor(line), {
          durationMs: narrationDuration(line),
          fallbackDelayMs: this.state.soundOn ? 850 : 0
        });
      } else {
        this.elements.caption.textContent = line;
      }
      this.elements.ryan.classList.add("is-speaking");
      this.elements.ryan.classList.remove("is-complete");
      this.elements.ryanStatus.textContent = this.state.soundOn ? "Ryan is speaking" : "Ryan's captions";

      if (!this.state.soundOn) {
        this.narrationTimer = window.setTimeout(() => this.finishNarrationLine(narration), narrationDuration(line));
        return;
      }

      const asset = this.narrationAssets[line] || this.narrationAssets[normaliseNarrationText(line)];
      const playbackMode = this.narrationPlayback.mode || "authored_audio_then_browser_speech";
      if (asset?.src && playbackMode !== "browser_speech_ryan") {
        this.playNarrationAsset(asset, narration);
        return;
      }

      if (this.speechSynthesis && typeof this.createUtterance === "function") {
        const voices = await this.loadSpeechVoices();
        if (this.activeNarration !== narration) return;
        try {
          const utterance = this.createUtterance(line);
          const strictRyan = this.narrationPlayback.require_ryan_voice === true;
          const voice = selectRyanVoice(voices, { strict: strictRyan });
          if (strictRyan && !voice) {
            this.playCaptionOnly(narration, line, "Ryan voice unavailable");
            return;
          }
          utterance.voice = voice || null;
          utterance.lang = voice?.lang || "en-GB";
          utterance.rate = 0.94;
          utterance.pitch = 0.98;
          utterance.onboundary = (event) => {
            if (this.activeNarration !== narration || !this.progressiveCaptions) return;
            if (!event.name || event.name === "word") this.narrationSync.boundary(event.charIndex, event.charLength);
          };
          utterance.onend = () => this.finishNarrationLine(narration);
          utterance.onerror = () => this.progressiveCaptions
            ? this.playCaptionOnly(narration, line, "Ryan voice unavailable")
            : this.pauseNarrationAfterError(narration);
          this.utterance = utterance;
          this.speechSynthesis.speak(utterance);
          return;
        } catch (_error) {
          if (this.progressiveCaptions) this.playCaptionOnly(narration, line, "Ryan voice unavailable");
          else this.pauseNarrationAfterError(narration);
          return;
        }
      }

      if (this.progressiveCaptions) this.playCaptionOnly(narration, line, "Ryan voice unavailable");
      else this.pauseNarrationAfterError(narration);
    }

    playNarrationAsset(asset, narration) {
      try {
        const audio = this.narrationPlayback.mode === "authored_audio_then_browser_speech" && this.preloadedNarrationAudio.has(asset.src)
          ? this.preloadedNarrationAudio.get(asset.src)
          : this.createAudio(asset.src);
        audio.preload = "auto";
        if (typeof audio.pause === "function") audio.pause();
        const resumeAtMs = this.isRegistryRuntimeLesson() ? Math.max(0, Number(narration.resumeAtMs) || 0) : 0;
        try { audio.currentTime = resumeAtMs / 1000; } catch (_error) { /* Metadata may still be loading. */ }
        audio.onended = () => {
          this.setAudioPlaybackState("completed");
          this.finishNarrationLine(narration);
        };
        audio.onerror = () => {
          this.setAudioPlaybackState("error");
          this.pauseNarrationAfterError(narration);
        };
        if (this.progressiveCaptions && Array.isArray(asset.words) && asset.words.length) {
          this.narrationSync.useAlignment(asset.words);
          audio.ontimeupdate = () => {
            const elapsedMs = (audio.currentTime || 0) * 1000;
            this.narrationSync.seekTime(elapsedMs);
            if (this.isRegistryRuntimeLesson() && this.state.narrationResume?.active) {
              this.state.narrationResume.elapsedMs = Math.round(elapsedMs);
              if (!this._fra05NarrationPersistAt || elapsedMs - this._fra05NarrationPersistAt >= 500) {
                this._fra05NarrationPersistAt = elapsedMs;
                this.persist();
              }
            }
          };
          audio.onplay = () => {
            this.setAudioPlaybackState("playing");
            this.followAudioAlignment(audio);
          };
        } else {
          audio.onplay = () => this.setAudioPlaybackState("playing");
        }
        this.audio = audio;
        if (this.progressiveCaptions && resumeAtMs) this.narrationSync.seekTime(resumeAtMs);
        const playback = audio.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(() => this.pauseNarrationAfterError(narration));
        }
      } catch (_error) {
        this.pauseNarrationAfterError(narration);
      }
    }

    setAudioPlaybackState(state) {
      if (!this.elements?.ryan || !document.body.contains(this.elements.ryan)) return;
      this.elements.ryan.dataset.narrationSource = "authored-ryan-audio";
      this.elements.ryan.dataset.audioState = state;
    }

    followAudioAlignment(audio) {
      if (!audio || this.audio !== audio || !this.progressiveCaptions) return;
      this.narrationSync.seekTime((audio.currentTime || 0) * 1000);
      if (!audio.paused && !audio.ended && typeof window.requestAnimationFrame === "function") {
        this.audioSyncFrame = window.requestAnimationFrame(() => this.followAudioAlignment(audio));
      }
    }

    playCaptionOnly(narration, line, status) {
      if (!narration || this.activeNarration !== narration) return;
      this.stopSpeech();
      if (this.progressiveCaptions) {
        this.narrationSync.start(line, this.narrationCuesFor(line), {
          durationMs: narrationDuration(line),
          fallbackDelayMs: 0
        });
      }
      this.elements.ryanStatus.textContent = status || "Ryan's captions";
      this.narrationTimer = window.setTimeout(() => this.finishNarrationLine(narration), narrationDuration(line));
    }

    async loadSpeechVoices() {
      const speech = this.speechSynthesis;
      if (!speech?.getVoices) return [];
      const available = speech.getVoices();
      if (available.length) return available;
      await new Promise((resolve) => {
        const finish = once(() => {
          if (speech.removeEventListener) speech.removeEventListener("voiceschanged", finish);
          resolve();
        });
        if (speech.addEventListener) speech.addEventListener("voiceschanged", finish);
        window.setTimeout(finish, 1200);
      });
      return speech.getVoices();
    }

    finishNarrationLine(narration) {
      if (!narration || this.activeNarration !== narration) return;
      if (this.progressiveCaptions) this.narrationSync.complete();
      this.stopSpeech();
      if (narration.index < narration.lines.length - 1) {
        narration.index += 1;
        this.narrationTimer = window.setTimeout(() => this.playNarration(), this.narrationBeatGapMs());
        return;
      }
      this.finishNarration();
    }

    pauseNarrationAfterError(narration) {
      if (!narration || this.activeNarration !== narration) return;
      window.clearTimeout(this.narrationTimer);
      this.stopSpeech();
      if (this.elements.ryan && document.body.contains(this.elements.ryan)) {
        this.elements.ryan.classList.remove("is-speaking");
        this.elements.ryanStatus.textContent = "Ryan paused";
        this.elements.skip.hidden = false;
      }
      const current = this.current();
      if (current?.kind === "scene" && this.elements.primary) {
        this.elements.primary.disabled = false;
        this.elements.primary.textContent = "Continue";
      }
    }

    finishNarration() {
      window.clearTimeout(this.narrationTimer);
      if (!this.activeNarration) return;
      this.stopSpeech();
      if (this.elements.ryan && document.body.contains(this.elements.ryan)) {
        this.elements.ryan.classList.remove("is-speaking");
        this.elements.ryanStatus.textContent = "Ryan finished";
        this.elements.skip.hidden = true;
      }
      const done = this.activeNarration.done;
      this.activeNarration = null;
      this.utterance = null;
      if (this.isRegistryRuntimeLesson() && this.state.narrationResume) {
        this.state.narrationResume.active = false;
        this.state.narrationResume.elapsedMs = 0;
        this.persist();
      }
      this.advanceTimer = window.setTimeout(done, this.narrationAdvanceDelayMs());
    }

    replayNarration() {
      if (this.activeNarration) {
        if (this.progressiveCaptions) this.resetNarrationCues();
        this.activeNarration.index = 0;
        this.playNarration();
        return;
      }
      if (this.lastNarration) this.startNarration(this.lastNarration.lines, null);
    }

    skipNarration() {
      if (!this.activeNarration) return;
      const done = this.activeNarration.done;
      if (this.progressiveCaptions) {
        this.narrationSync.complete();
        const activeIds = new Set(this.activeNarration.utteranceIds || []);
        (this.current()?.visual?.syncCues || [])
          .filter((cue) => !this.isRegistryRuntimeLesson() || activeIds.has(cue.utteranceId))
          .forEach((cue) => this.applyNarrationCue(cue));
      }
      if (this.isRegistryRuntimeLesson() && this.state.narrationResume) {
        this.state.narrationResume.active = false;
        this.persist();
      }
      this.stopNarration(false);
      if (this.elements?.ryan && document.body.contains(this.elements.ryan)) {
        this.elements.ryan.classList.remove("is-speaking");
        this.elements.ryanStatus.textContent = "Ryan finished";
        this.elements.skip.hidden = true;
      }
      done();
    }

    stopNarration(runDone) {
      window.clearTimeout(this.narrationTimer);
      window.clearTimeout(this.advanceTimer);
      const done = this.activeNarration?.done;
      this.activeNarration = null;
      this.narrationSync.stop();
      this.stopSpeech();
      this.utterance = null;
      if (this.elements?.ryan && document.body.contains(this.elements.ryan)) {
        this.elements.ryan.classList.remove("is-speaking");
      }
      if (runDone && done) done();
    }

    stopSpeech() {
      if (this.audioSyncFrame && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(this.audioSyncFrame);
      }
      this.audioSyncFrame = 0;
      if (this.audio) {
        if (!this.audio.ended) this.setAudioPlaybackState("stopped");
        this.audio.onended = null;
        this.audio.onerror = null;
        this.audio.ontimeupdate = null;
        this.audio.onplay = null;
        if (typeof this.audio.pause === "function") this.audio.pause();
        this.audio = null;
      }
      if (this.utterance) {
        this.utterance.onend = null;
        this.utterance.onerror = null;
      }
      if (this.speechSynthesis?.cancel) this.speechSynthesis.cancel();
      this.utterance = null;
    }

    hideRyan() {
      if (this.elements?.ryan) this.elements.ryan.hidden = true;
    }

    toggleSound() {
      const fra07Cues = this.isFra07V1() ? [...(this.current()?.visual?.syncCues || [])] : [];
      this.state.soundOn = !this.state.soundOn;
      this.persist();
      this.suppressNodeNarration = true;
      this.render();
      fra07Cues.forEach((cue) => this.applyNarrationCue(cue));
    }

    toggleDeveloper() {
      if (!this.developerMode) return;
      this.state.developerOpen = !this.state.developerOpen;
      this.persist();
      const panel = this.root.querySelector("#developer-panel");
      const toggle = this.root.querySelector("#developer-toggle");
      panel.hidden = !this.state.developerOpen;
      toggle.setAttribute("aria-expanded", String(this.state.developerOpen));
    }

    jumpToPhase(phase) {
      const nextId = this.model.phaseStarts.get(phase);
      if (!nextId) return;
      this.stopNarration(false);
      this.state.cursor = nextId;
      this.state.trail = [];
      this.state.pendingRecovery = null;
      this.state.exit = { responses: {}, result: null, confirmationId: null, primaryScore: null, missedPrimaryIds: [], remediation: null };
      this.state.developerOpen = false;
      this.state.lastViewed = null;
      this.persist();
      this.render();
    }

    goBack() {
      if (!this.state.trail.length) return;
      this.stopNarration(false);
      const wasRecovery = this.state.cursor.startsWith("RECOVERY:");
      const previous = this.state.trail.pop();
      this.state.cursor = previous;
      if (!wasRecovery) this.state.pendingRecovery = null;
      this.persist();
      this.render();
    }

    goHome() {
      this.destroy();
      if (this.callbacks.onHome) this.callbacks.onHome();
    }

    openRestartDialog() {
      this.stopNarration(false);
      const dialog = this.root.querySelector("#restart-dialog");
      if (dialog?.showModal) dialog.showModal();
      else if (dialog) dialog.setAttribute("open", "");
    }

    startAgain() {
      const preservedSoundOn = this.isFra14V1() ? this.state.soundOn : null;
      const preservedDeveloperOpen = this.isFra14V1() ? this.state.developerOpen : null;
      this.archiveAttempt("start_again");
      this.state = this.freshState();
      if (this.isFra14V1()) {
        this.state.soundOn = preservedSoundOn;
        this.state.developerOpen = preservedDeveloperOpen;
      }
      this.state.started = true;
      this.emit("skill_started", { restarted: true });
      this.persist();
      this.render();
    }

    archiveAttempt(reason) {
      try {
        const history = JSON.parse(localStorage.getItem(this.historyKey) || "[]");
        history.push({
          attemptId: this.state.attemptId,
          status: this.state.status,
          archivedAt: new Date().toISOString(),
          reason,
          submissions: this.state.submissions
        });
        localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-20)));
      } catch (_error) {
        // A fresh attempt can still begin if history storage is unavailable.
      }
    }

    progressFor(current) {
      if (current.kind === "completion") return { label: "Complete", percent: 100 };
      if (this.spec.canonical_lesson?.reference_for_future_lessons) {
        const phaseProgress = { teaching: 26, guided: 43, faded: 58, independent: 75, practice: 78, repair: 82, exit: 92 };
        const labels = { teaching: "Build the idea", guided: "Work together", faded: "Support is fading", independent: "Show it independently", repair: "Targeted support", exit: "Check understanding" };
        return { label: labels[current.phase] || "Adaptive route", percent: phaseProgress[current.phase] || 5 };
      }
      let index = this.model.getProgressIndex(current.id);
      if (current.recovery && this.state.pendingRecovery) index = this.model.getProgressIndex(this.state.pendingRecovery.originId);
      if (current.confirmation) index = this.model.nodes.length;
      const total = this.model.nodes.length + 1;
      return { label: `Step ${Math.min(total, index + 1)} of ${total}`, percent: Math.max(3, Math.min(100, ((index + 1) / total) * 100)) };
    }

    showToast(message) {
      const toast = this.root.querySelector("#toast");
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 2200);
    }
  }

  function sceneHeading(current) {
    const narration = normaliseNarrationText(current?.narration || "");
    if (!narration) return "Lesson";
    const firstSentence = narration.match(/^.*?[.!?](?=\s|$)/)?.[0];
    return firstSentence || narration;
  }

  function uniqueLines(lines) {
    const output = [];
    const seen = new Set();
    const flattened = [];
    const collect = (value) => {
      if (Array.isArray(value)) value.forEach(collect);
      else if (value) flattened.push(value);
    };
    collect(lines || []);
    flattened.forEach((line) => {
      const text = normaliseNarrationText(line);
      const key = text.toLowerCase().replace(/\s+/g, " ");
      if (text && !seen.has(key)) {
        seen.add(key);
        output.push(text);
      }
    });
    return output;
  }

  function narrationDuration(text) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(2800, (words / 2.35) * 1000 + 1100);
  }

  function normaliseNarrationText(text) {
    return String(text || "").trim().replace(/\s+/g, " ");
  }

  function speechBeats(text) {
    const source = normaliseNarrationText(text);
    if (!source) return [];
    return (source.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [source])
      .map(normaliseNarrationText)
      .filter(Boolean);
  }

  function openingHeading(topic, spec) {
    return openingLead(topic, spec);
  }

  function openingLead(topic, spec) {
    const config = topic?.openingNarration || {};
    const skillId = normaliseNarrationText(spec?.identity?.id);
    const title = normaliseNarrationText(spec?.identity?.title || "this lesson");
    return normaliseNarrationText(config.skillLeads?.[skillId] || config.lead || "Let's get started with {skillTitle}.")
      .replace(/\{skillTitle\}/g, title);
  }

  function openingNarrationLines(topic, spec, authoredNarration) {
    if (spec?.voice_and_script?.opening_mode === "authored_scene_only") {
      return uniqueLines([authoredNarration]);
    }
    const config = topic?.openingNarration || {};
    const lead = openingLead(topic, spec);
    return uniqueLines([lead, config.hook, authoredNarration]);
  }

  function selectRyanVoice(voices, options) {
    const candidates = Array.from(voices || []);
    const description = (voice) => `${voice?.name || ""} ${voice?.voiceURI || ""}`;
    const englishUk = (voice) => /^en[-_]GB$/i.test(voice?.lang || "") || /English.*United Kingdom/i.test(description(voice));
    const microsoft = (voice) => /Microsoft/i.test(description(voice));
    const ryan = (voice) => /\bRyan\b/i.test(description(voice));
    const natural = (voice) => /Natural|Neural/i.test(description(voice));
    const exactRyan = candidates.find((voice) => microsoft(voice) && ryan(voice) && natural(voice) && englishUk(voice))
      || candidates.find((voice) => microsoft(voice) && ryan(voice) && englishUk(voice))
      || candidates.find((voice) => ryan(voice) && natural(voice) && englishUk(voice))
      || candidates.find((voice) => ryan(voice) && englishUk(voice));
    if (options?.strict) return exactRyan || null;
    return exactRyan
      || candidates.find((voice) => microsoft(voice) && natural(voice) && englishUk(voice))
      || candidates.find(englishUk)
      || null;
  }

  function cueClass(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function randomIndex(length) {
    if (length <= 1) return 0;
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function once(callback) {
    let called = false;
    return () => {
      if (called) return;
      called = true;
      callback();
    };
  }

  function createId() {
    return window.crypto?.randomUUID ? window.crypto.randomUUID() : `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  window.RevilyLessonEngine = { LessonEngine, cueClass, narrationDuration, normaliseNarrationText, openingHeading, openingLead, openingNarrationLines, selectRyanVoice, speechBeats, uniqueLines };
})();
