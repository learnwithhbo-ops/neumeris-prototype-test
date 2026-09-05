(function () {
  "use strict";

  function normaliseText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function speechTokens(text) {
    const source = normaliseText(text);
    const tokens = [];
    const pattern = /\S+/g;
    let match;
    while ((match = pattern.exec(source))) {
      tokens.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    return { source, tokens };
  }

  function timingPlan(text, durationMs) {
    const parsed = speechTokens(text);
    const totalDuration = Math.max(900, Number(durationMs) || 0);
    const weights = parsed.tokens.map((token) => {
      const spokenLength = token.text.replace(/[^A-Za-z0-9]/g, "").length;
      const punctuationPause = /[.!?]$/.test(token.text) ? 1.25 : /[,;:]$/.test(token.text) ? 0.55 : 0;
      return 0.78 + Math.sqrt(Math.max(1, spokenLength)) * 0.22 + punctuationPause;
    });
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
    let elapsedWeight = 0;
    const tokens = parsed.tokens.map((token, index) => {
      const atMs = Math.round((elapsedWeight / totalWeight) * totalDuration);
      elapsedWeight += weights[index];
      return { ...token, atMs };
    });
    return { text: parsed.source, durationMs: totalDuration, tokens };
  }

  function cuePlan(text, cues) {
    const source = normaliseText(text);
    const lower = source.toLowerCase();
    return (cues || []).map((cue, index) => {
      const phrase = normaliseText(cue?.cue);
      const position = phrase ? lower.indexOf(phrase.toLowerCase()) : -1;
      return {
        ...cue,
        id: cue?.id || `cue-${index + 1}`,
        phrase,
        position: position >= 0 ? position : Number.POSITIVE_INFINITY,
        fired: false
      };
    });
  }

  class NarrationSync {
    constructor(callbacks) {
      this.callbacks = callbacks || {};
      this.timers = [];
      this.plan = null;
      this.cues = [];
      this.providerAligned = false;
      this.token = 0;
    }

    start(text, cues, options) {
      this.stop();
      this.token += 1;
      const runToken = this.token;
      const opts = options || {};
      this.plan = timingPlan(text, opts.durationMs);
      this.cues = cuePlan(this.plan.text, cues);
      this.providerAligned = false;
      this.callbacks.onReset?.({ text: this.plan.text, cues: this.cues });
      this.callbacks.onCaption?.({ text: "", fullText: this.plan.text, current: null, complete: false });

      const delay = Math.max(0, Number(opts.fallbackDelayMs) || 0);
      this.plan.tokens.forEach((word, index) => {
        const timer = window.setTimeout(() => {
          if (runToken !== this.token || this.providerAligned) return;
          this.revealIndex(index);
        }, delay + word.atMs);
        this.timers.push(timer);
      });
    }

    boundary(charIndex, charLength) {
      if (!this.plan) return;
      if (!this.providerAligned) {
        this.providerAligned = true;
        this.clearTimers();
      }
      const start = Math.max(0, Number(charIndex) || 0);
      const length = Math.max(1, Number(charLength) || 1);
      let index = this.plan.tokens.findIndex((word) => word.start <= start && word.end >= start + Math.min(length, word.text.length));
      if (index < 0) index = this.plan.tokens.findIndex((word) => word.end > start);
      if (index < 0) index = this.plan.tokens.length - 1;
      this.revealIndex(index);
    }

    useAlignment(words) {
      if (!this.plan || !Array.isArray(words) || !words.length) return false;
      const providerWords = words.map((word) => {
        const rawOffset = word.atMs ?? word.offsetMs ?? word.offset;
        const atMs = word.atMs !== undefined || word.offsetMs !== undefined
          ? Number(rawOffset)
          : Number(rawOffset) / 10000;
        return { ...word, atMs: Number.isFinite(atMs) ? Math.max(0, Math.round(atMs)) : null };
      });
      const aligned = [];
      let providerIndex = 0;
      let usedProviderTiming = false;
      this.plan.tokens.forEach((token) => {
        const punctuationOnly = token.text.replace(/[^A-Za-z0-9]/g, "").length === 0;
        const previousAtMs = aligned.at(-1)?.atMs ?? 0;
        if (punctuationOnly) {
          const nextAtMs = providerWords[providerIndex]?.atMs;
          aligned.push({ ...token, atMs: Number.isFinite(nextAtMs) ? Math.max(previousAtMs, nextAtMs - 1) : previousAtMs });
          return;
        }
        const word = providerWords[providerIndex];
        providerIndex += 1;
        if (!word || !Number.isFinite(word.atMs)) {
          aligned.push({ ...token, atMs: Math.max(previousAtMs, token.atMs) });
          return;
        }
        usedProviderTiming = true;
        aligned.push({ ...token, atMs: Math.max(previousAtMs, word.atMs) });
      });
      if (!usedProviderTiming) return false;
      if (!aligned.some((token, index) => token.atMs !== this.plan.tokens[index].atMs)) return false;
      this.plan.tokens = aligned;
      this.providerAligned = true;
      this.clearTimers();
      return true;
    }

    seekTime(timeMs) {
      if (!this.plan) return;
      const elapsed = Math.max(0, Number(timeMs) || 0);
      let index = -1;
      this.plan.tokens.forEach((word, wordIndex) => {
        if (word.atMs <= elapsed) index = wordIndex;
      });
      if (index >= 0) this.revealIndex(index);
    }

    revealIndex(index) {
      if (!this.plan || !this.plan.tokens.length) return;
      const safeIndex = Math.max(0, Math.min(this.plan.tokens.length - 1, index));
      const current = this.plan.tokens[safeIndex];
      const visible = this.plan.text.slice(0, current.end);
      this.callbacks.onCaption?.({
        text: visible,
        fullText: this.plan.text,
        current,
        complete: safeIndex === this.plan.tokens.length - 1
      });
      this.fireCues(current.end);
    }

    fireCues(charEnd) {
      this.cues.forEach((cue) => {
        if (!cue.fired && cue.position <= charEnd) {
          cue.fired = true;
          this.callbacks.onCue?.(cue);
        }
      });
    }

    complete() {
      if (!this.plan) return;
      this.clearTimers();
      if (this.plan.tokens.length) this.revealIndex(this.plan.tokens.length - 1);
      this.cues.forEach((cue) => {
        if (!cue.fired) {
          cue.fired = true;
          this.callbacks.onCue?.(cue);
        }
      });
      this.callbacks.onComplete?.({ text: this.plan.text });
    }

    clearTimers() {
      this.timers.forEach((timer) => window.clearTimeout(timer));
      this.timers = [];
    }

    stop() {
      this.clearTimers();
      this.plan = null;
      this.cues = [];
      this.providerAligned = false;
    }
  }

  window.RevilyNarrationSync = { NarrationSync, cuePlan, speechTokens, timingPlan };
})();
