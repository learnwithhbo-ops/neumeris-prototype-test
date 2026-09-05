(function () {
  "use strict";

  const runtimeCopy = window.FRA16_RUNTIME_COPY || {};
  const shared = window.RevilyNarrationAssets = window.RevilyNarrationAssets || {
    voice: "en-GB-RyanNeural",
    voiceName: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    tracks: {}
  };
  const tracksByUtteranceId = {};
  const tracks = {};

  function deterministicWords(text) {
    const tokens = window.RevilyNarrationSync?.timingPlan
      ? window.RevilyNarrationSync.timingPlan(text, Math.max(1100, String(text).split(/\s+/).length * 410)).tokens
      : String(text).split(/\s+/).map((word, index) => ({ text: word, atMs: index * 410 }));
    return tokens.map((token) => ({ text: token.text, atMs: token.atMs }));
  }

  Object.entries(runtimeCopy).forEach(([utteranceId, entry]) => {
    const track = {
      utteranceId,
      text: entry.text,
      provider: "Microsoft Edge Neural TTS",
      voice: "en-GB-RyanNeural",
      voiceName: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      timingSource: "deterministic_utterance_fallback",
      words: deterministicWords(entry.text)
    };
    tracksByUtteranceId[utteranceId] = track;
    tracks[entry.text] = track;
  });

  Object.assign(shared.tracks, tracks);
  window.RevilyFra16NarrationAssets = {
    provider: "Microsoft Edge Neural TTS",
    voice: "en-GB-RyanNeural",
    voiceName: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    tracks,
    tracksByUtteranceId
  };
})();
