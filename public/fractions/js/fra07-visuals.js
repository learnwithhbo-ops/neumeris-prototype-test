(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function fractionMarkup(value, extraClass) {
    if (!value) return "";
    return `<span class="fra07-fraction ${extraClass || ""}" aria-label="${escapeHtml(value.numerator)} over ${escapeHtml(value.denominator)}"><b>${escapeHtml(value.numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(value.denominator)}</b></span>`;
  }

  function fractionPercent(value) {
    const numerator = Number(value?.numerator) || 0;
    const denominator = Math.max(1, Number(value?.denominator) || 1);
    return `${Number((numerator / denominator * 100).toFixed(6))}%`;
  }

  function modelFrom(visual, context) {
    return context?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function isRevealed(context) {
    return ["correct", "support", "worked"].includes(context?.feedback);
  }

  function fractionBar(value, options) {
    const denominator = Math.max(1, Math.min(12, Number(value?.denominator) || 1));
    const numerator = Math.max(0, Math.min(denominator, Number(value?.numerator) || 0));
    const opts = options || {};
    const parts = Array.from({ length: denominator }, (_, index) => `<i class="${index < numerator ? "is-selected" : ""}"></i>`).join("");
    return `<div class="fra07-bar-wrap ${opts.className || ""}"><div class="fra07-bar" style="--fra07-parts:${denominator}" aria-label="${numerator} of ${denominator} equal parts selected">${parts}<span class="fra07-endpoint" style="--fra07-end:${fractionPercent(value)}" aria-hidden="true"></span></div>${opts.label === false ? "" : fractionMarkup(value, "fra07-bar-fraction")}</div>`;
  }

  function alignedBars(left, right, context, extraClass) {
    const reveal = isRevealed(context);
    return `<div class="fra07-aligned-bars ${extraClass || ""}${reveal ? " is-revealed" : ""}"><div class="fra07-aligned-plot">${fractionBar(left, { label: false })}${fractionBar(right, { label: false })}<span class="fra07-endpoint-guide" style="--fra07-guide:${fractionPercent(left)}" aria-hidden="true"></span></div><div class="fra07-aligned-labels">${fractionMarkup(left, "fra07-bar-fraction")}${fractionMarkup(right, "fra07-bar-fraction")}</div></div>`;
  }

  function factorPair(left, right, topFactor, bottomFactor, reveal, extraClass) {
    return `<div class="fra07-factor-pair ${extraClass || ""}${reveal ? " is-revealed" : ""}"><div>${fractionMarkup(left, "fra07-fraction--standalone")}<span class="fra07-relation" aria-hidden="true"><em class="fra07-top-factor">${reveal && topFactor ? `×${escapeHtml(topFactor)}` : "→"}</em><em class="fra07-bottom-factor">${reveal && bottomFactor ? `×${escapeHtml(bottomFactor)}` : "→"}</em></span>${fractionMarkup(right, "fra07-fraction--standalone")}</div>${reveal && topFactor && bottomFactor ? `<strong class="fra07-factor-verdict">${topFactor === bottomFactor ? "ONE COMMON FACTOR" : "FACTORS DO NOT MATCH"}</strong>` : ""}</div>`;
  }

  function numberLine(value, options) {
    const opts = options || {};
    const intervals = Math.max(1, Math.min(12, Number(value?.denominator) || 1));
    const point = Math.max(0, Math.min(intervals, Number(value?.numerator) || 0));
    const showPoint = opts.showPoint !== false;
    const ticks = Array.from({ length: intervals + 1 }, (_, index) => `<i class="${index === 0 || index === intervals ? "is-end" : ""}" style="--fra07-tick:${index / intervals * 100}%"><span>${index === 0 ? "0" : index === intervals ? "1" : ""}</span></i>`).join("");
    const ariaLabel = showPoint
      ? `A zero-to-one number line divided into ${intervals} equal intervals with a supplied point at ${point} over ${intervals}.`
      : `A zero-to-one reference line divided into ${intervals} equal intervals with no point marked.`;
    return `<div class="fra07-number-line ${opts.className || ""}${showPoint ? " has-point" : " is-reference"}" style="--fra07-point:${fractionPercent({ numerator: point, denominator: intervals })}" role="img" aria-label="${ariaLabel}"><div class="fra07-axis" aria-hidden="true">${ticks}${showPoint ? `<b class="fra07-point"></b>` : ""}</div>${opts.label === false ? "" : `<div class="fra07-line-label">${fractionMarkup(value, "fra07-number-line-fraction")}</div>`}</div>`;
  }

  function downloadPair(model, context) {
    const left = model.left;
    const right = model.right;
    const questionMode = Boolean(context?.question);
    const afterResponse = questionMode && isRevealed(context);
    return `<div class="fra07-download-pair ${questionMode ? "is-question" : ""} ${afterResponse ? "is-revealed" : ""}"><div class="fra07-download-grid"><div class="fra07-download-meta"><span><i class="fra07-download-icon" aria-hidden="true">↓</i><b>GAME DOWNLOAD</b></span><span><i class="fra07-download-icon" aria-hidden="true">↓</i><b>GAME DOWNLOAD</b></span></div><div class="fra07-download-bar-stack">${fractionBar(left, { label: false })}${fractionBar(right, { label: false })}<span class="fra07-shared-guide" style="--fra07-guide:${fractionPercent(left)}" aria-hidden="true"></span></div><div class="fra07-download-label-stack"><span class="fra07-scene-label fra07-cue-hook-label-left">${fractionMarkup(left, "fra07-bar-fraction")}</span><span class="fra07-scene-label fra07-cue-hook-label-right">${fractionMarkup(right, "fra07-bar-fraction")}</span></div></div>${afterResponse ? `<strong class="fra07-reveal-badge">SAME PROGRESS</strong>` : ""}</div>`;
  }

  function subdividingBar(model) {
    const subdivisionFactor = Math.max(1, Number(model.subdivisionFactor) || 1);
    const denominator = Math.max(1, Number(model.revealed?.denominator) || 1);
    const numerator = Math.max(0, Math.min(denominator, Number(model.revealed?.numerator) || 0));
    const cells = Array.from({ length: denominator }, (_, index) => {
      const classes = ["fra07-transform-cell"];
      if (index < numerator) classes.push("is-selected");
      if ((index + 1) % subdivisionFactor === 0 && index < denominator - 1) classes.push("is-major-end");
      if ((index + 1) % subdivisionFactor !== 0 && index < denominator - 1) classes.push("is-new-divider");
      return `<i class="${classes.join(" ")}"></i>`;
    }).join("");
    return `<div class="fra07-subdivide"><div class="fra07-transform-track"><div class="fra07-transform-bar" style="--fra07-parts:${denominator}" aria-label="A two-thirds bar that subdivides in place into four sixths without moving its selected endpoint.">${cells}<span class="fra07-endpoint" style="--fra07-end:${fractionPercent(model.revealed)}" aria-hidden="true"></span></div><span class="fra07-stationary-pin" style="--fra07-guide:${fractionPercent(model.initial)}" aria-hidden="true"></span></div><div class="fra07-transform-labels"><span class="fra07-t1-label-initial">${fractionMarkup(model.initial, "fra07-fraction--standalone")}</span><span class="fra07-t1-label-revealed">${fractionMarkup(model.revealed, "fra07-fraction--standalone")}</span></div><strong class="fra07-equivalent-label">EQUIVALENT FRACTIONS<br>${model.initial.numerator}/${model.initial.denominator} = ${model.revealed.numerator}/${model.revealed.denominator}</strong></div>`;
  }

  function alignedNumberLines(model) {
    const top = { numerator: model.top.pointIndex, denominator: model.top.denominator };
    const bottom = { numerator: model.bottom.pointIndex, denominator: model.bottom.denominator };
    return `<div class="fra07-number-line-pair"><div class="fra07-number-line-plot"><div class="fra07-cue-t2-lines">${numberLine(top, { label: false, className: "fra07-cue-t2-top" })}${numberLine(bottom, { label: false, className: "fra07-cue-t2-bottom" })}</div><span class="fra07-line-guide" style="--fra07-guide:${fractionPercent(top)}" aria-hidden="true"></span></div><div class="fra07-t2-labels"><span class="fra07-cue-t2-label-top">${fractionMarkup(top, "fra07-number-line-fraction")}</span><span class="fra07-cue-t2-label-bottom">${fractionMarkup(bottom, "fra07-number-line-fraction")}</span></div></div>`;
  }

  function completeFactorPair(model) {
    return factorPair(model.left, model.right, model.topFactor, model.bottomFactor, true, "fra07-teaching-factor-pair");
  }

  function additiveClaim(model, context) {
    const sceneMode = !context?.question;
    const reveal = isRevealed(context);
    const amount = model.operation?.amount ?? model.claimOperation?.amount ?? 2;
    const left = model.left || model.pair?.[0];
    const right = model.right || model.pair?.[1];
    const supportingComparison = sceneMode || reveal
      ? alignedBars(left, right, reveal ? { feedback: "worked" } : { feedback: "initial" }, "fra07-additive-bars")
      : "";
    const verdict = sceneMode || reveal ? `<strong class="fra07-not-equivalent">NOT EQUIVALENT</strong>` : "";
    return `<div class="fra07-additive-claim ${sceneMode ? "is-scene" : "is-question"} ${reveal ? "is-revealed" : ""}"><div class="fra07-additive-equation">${fractionMarkup(left, "fra07-fraction--standalone")}<span class="fra07-add-arrows" aria-label="add ${amount} to numerator and denominator">+${amount}<br>+${amount}</span><span class="fra07-claim-sign">=</span>${fractionMarkup(right, "fra07-fraction--standalone")}</div>${supportingComparison}${verdict}</div>`;
  }

  function handoffMarkup() {
    return `<div class="fra07-handoff"><article><span aria-hidden="true">↔</span><b>SAME VALUE</b><small>Aligned endpoint or supplied point</small></article><article><span aria-hidden="true">×</span><b>ONE COMMON FACTOR</b><small>For a complete written pair</small></article><strong>TRY IT WITH ME</strong></div>`;
  }

  function pairJudgment(model, context) {
    if (model.representation === "aligned_bars") return alignedBars(model.left, model.right, context, "fra07-question-bars");
    const reveal = isRevealed(context) || model.representation === "symbolic_with_factor_tags";
    return factorPair(model.left, model.right, model.topFactor, model.bottomFactor, reveal, "fra07-question-pair");
  }

  function optionVisual(option, representation) {
    if (representation === "number_line" || option.model === "number_line") return numberLine(option.value, { className: "fra07-choice-number-line" });
    if (option.model === "set") {
      const denominator = Math.max(1, Math.min(12, Number(option.value?.denominator) || 1));
      const numerator = Math.max(0, Math.min(denominator, Number(option.value?.numerator) || 0));
      const counters = Array.from({ length: denominator }, (_, index) => `<i class="${index < numerator ? "is-selected" : ""}"></i>`).join("");
      return `<div class="fra07-set-model" role="img" aria-label="${numerator} of ${denominator} counters selected"><div aria-hidden="true">${counters}</div>${fractionMarkup(option.value, "fra07-model-fraction")}</div>`;
    }
    if (["aligned_bars", "mixed_models"].includes(representation) || option.model === "area_bar") return fractionBar(option.value);
    return fractionMarkup(option.value, "fra07-fraction--standalone");
  }

  function choiceSet(model, context) {
    const question = context?.question?.canonicalQuestion;
    const reveal = isRevealed(context);
    const numberLineQuestion = model.representation === "number_line";
    const targetVisual = numberLineQuestion
      ? numberLine(model.target, { showPoint: false, className: "fra07-target-reference-line" })
      : fractionBar(model.target, { className: "fra07-target-bar" });
    return `<div class="fra07-choice-models ${numberLineQuestion ? "is-number-line" : model.representation === "mixed_models" ? "is-mixed-model" : ""}"><div class="fra07-target"><span>Target</span>${targetVisual}</div><div class="fra07-option-model-grid">${(model.options || []).map((option) => `<article class="${reveal && option.id === question?.answer?.optionId ? "is-answer" : ""}"><b>${escapeHtml(option.id)}</b>${optionVisual(option, model.representation)}</article>`).join("")}</div></div>`;
  }

  function pairChoiceSet(model, context) {
    const question = context?.question?.canonicalQuestion;
    const reveal = isRevealed(context);
    return `<div class="fra07-pair-choice-grid">${(model.options || []).map((option) => `<article class="${reveal && option.id === question?.answer?.optionId ? "is-answer" : ""}"><b>${escapeHtml(option.id)}</b><div>${fractionMarkup(option.left, "fra07-fraction--standalone")}<span>and</span>${fractionMarkup(option.right, "fra07-fraction--standalone")}</div></article>`).join("")}</div>`;
  }

  function sortPairs(model) {
    return `<div class="fra07-sort-pairs"><div class="fra07-sort-card-grid">${(model.pairs || []).map((pair) => `<article><b>${escapeHtml(pair.id)}</b>${fractionMarkup(pair.left, "fra07-fraction--standalone")}<span>and</span>${fractionMarkup(pair.right, "fra07-fraction--standalone")}</article>`).join("")}</div><div class="fra07-sort-buckets" aria-hidden="true"><span>EQUIVALENT</span><span>NOT EQUIVALENT</span></div></div>`;
  }

  function relationshipFailure(model, context) {
    const reveal = isRevealed(context);
    return `<div class="fra07-relationship-failure">${factorPair(model.left, model.right, 2, null, true)}<div><span>Numerator: ${escapeHtml(model.numeratorRelation)}</span><span class="${reveal ? "is-failed" : ""}">Denominator: ${escapeHtml(model.denominatorRelation)}</span></div></div>`;
  }

  function repairExample(model) {
    const repair = model.repair;
    const example = repair?.authorOnlyWorkedExample || {};
    if (example.representation === "aligned_bars") return alignedBars(example.left, example.right, { feedback: "worked" }, "fra07-repair-bars");
    if (example.operation?.kind === "add") return additiveClaim({ left: example.left, right: example.right, operation: example.operation }, { feedback: "worked" });
    return factorPair(example.left, example.right, example.topFactor || 2, example.bottomFactor, true, "fra07-repair-factor");
  }

  function renderMarkup(visual, context) {
    const model = modelFrom(visual, context || {});
    switch (model.kind) {
      case "download_progress_pair": return downloadPair(model, context || {});
      case "subdividing_progress_bar": return subdividingBar(model);
      case "aligned_number_lines": return alignedNumberLines(model);
      case "complete_fraction_pair_with_factor_links": return completeFactorPair(model);
      case "additive_false_friend": return additiveClaim(model, context || {});
      case "stage_handoff": return handoffMarkup();
      case "pair_judgment": return pairJudgment(model, context || {});
      case "choice_set": return choiceSet(model, context || {});
      case "pair_choice_set": return pairChoiceSet(model, context || {});
      case "sort_pairs": return sortPairs(model);
      case "reasoning_claim": return additiveClaim(model, context || {});
      case "relationship_failure": return relationshipFailure(model, context || {});
      case "repair_example": return repairExample(model);
      default: return `<div class="fra07-generic">${fractionMarkup(model.left, "fra07-fraction--standalone")}${fractionMarkup(model.right, "fra07-fraction--standalone")}</div>`;
    }
  }

  function accessibleDescription(model, context) {
    const canonical = context?.question?.canonicalQuestion;
    if (canonical?.accessibleDescriptionCopyId) return window.RevilyFra07Canonical?.uiTextFor?.(canonical.accessibleDescriptionCopyId) || "A complete fraction-recognition model is shown.";
    if (model?.canonicalScene?.authorOnlyUnderstandingExpected) return model.canonicalScene.authorOnlyUnderstandingExpected;
    if (model?.kind === "download_progress_pair") return "Two equal-width game download bars have aligned selected endpoints.";
    return "A complete fraction-recognition model is shown without blank numerator or denominator fields.";
  }

  window.RevilyFra07Visuals = { accessibleDescription, fractionMarkup, renderMarkup };
})();
