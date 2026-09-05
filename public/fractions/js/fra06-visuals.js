(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function fractionMarkup(value, extraClass) {
    if (!value) return "";
    if (value.kind === "mixed_number") return `<span class="fra06-mixed ${extraClass || ""}" aria-label="${value.whole} and ${value.numerator} over ${value.denominator}"><b>${escapeHtml(value.whole)}</b>${fractionMarkup({ kind: "fraction", numerator: value.numerator, denominator: value.denominator })}</span>`;
    return `<span class="fra06-fraction ${extraClass || ""}" aria-label="${value.numerator} over ${value.denominator}"><b>${escapeHtml(value.numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(value.denominator)}</b></span>`;
  }
  function modelFrom(visual, context) {
    const base = context?.question?.model || visual?.scene?.model || visual?.model || {};
    if (context?.feedback === "worked" && base.workedVisual) return Object.assign({}, base, base.workedVisual, { context: "fra06", workedVisual: base.workedVisual });
    return base;
  }
  function numberLineMarkup(line, value, showPoint) {
    const start = Number(line?.start ?? 0);
    const end = Number(line?.end ?? line?.maxWhole ?? 1);
    const denominator = Math.max(1, Number(line?.denominator || value?.denominator || 1));
    const intervals = Math.max(1, denominator * Math.max(1, end - start));
    const pointIndex = Number(line?.pointIndex ?? value?.numerator);
    const ticks = Array.from({ length: intervals + 1 }, (_, index) => `<span class="fra06-tick${index % denominator === 0 ? " is-whole" : ""}" style="--tick:${index / intervals * 100}%"><i></i>${index % denominator === 0 ? `<b>${start + index / denominator}</b>` : ""}</span>`).join("");
    const point = showPoint && Number.isFinite(pointIndex) ? `<span class="fra06-point" style="--point:${Math.max(0, Math.min(100, pointIndex / intervals * 100))}%" aria-hidden="true"><i>P</i></span>` : "";
    return `<div class="fra06-line" style="--fra06-intervals:${intervals}"><div class="fra06-one-checkpoint" style="--one:${Math.max(0, Math.min(100, (1 - start) / (end - start || 1) * 100))}%"><span>ONE-WHOLE CHECKPOINT</span></div><div class="fra06-axis">${ticks}${point}</div></div>`;
  }
  function barMarkup(wholeBars, selected, total) {
    const complete = Array.from({ length: Math.max(0, Number(wholeBars) || 0) }, (_, index) => `<div class="fra06-whole-bar is-full"><span>whole ${index + 1}</span></div>`).join("");
    const parts = Array.from({ length: Math.max(1, Number(total) || 1) }, (_, index) => `<i class="${index < Number(selected || 0) ? "is-selected" : ""}"></i>`).join("");
    return `<div class="fra06-bars">${complete}<div class="fra06-whole-bar is-parts" style="--parts:${Math.max(1, Number(total) || 1)}">${parts}</div></div>`;
  }
  function cardMarkup(card) {
    return `<article class="fra06-card" data-card-id="${escapeHtml(card.id || "")}">${fractionMarkup(card.value || card)}</article>`;
  }
  function hookMarkup(model) {
    return `<div class="fra06-hook"><div class="fra06-card-row">${(model.cards || []).map((card, index) => cardMarkup(Object.assign({ id: `hook-${index}` }, card))).join("")}</div>${numberLineMarkup(model.numberLine || { start: 0, end: 3 }, null, false)}</div>`;
  }
  function fractionLineMarkup(model, context) {
    const value = model.value || {};
    const line = model.numberLine || model;
    const showPoint = model.kind !== "fraction_symbol" && model.kind !== "claim_with_fraction";
    return `<div class="fra06-fraction-line"><div class="fra06-symbol-card">${fractionMarkup(value)}</div>${showPoint ? numberLineMarkup(line, value, true) : ""}${labelsMarkup(model, context)}</div>`;
  }
  function mixedMarkup(model, context) {
    const value = model.value || model.values?.[0] || {};
    const bars = model.wholeBars ?? value.whole;
    const next = model.nextWhole || { totalParts: value.denominator, selectedParts: value.numerator };
    const showBars = model.kind === "mixed_number_bars" || model.showBars === true || Object.prototype.hasOwnProperty.call(model, "wholeBars") || Object.prototype.hasOwnProperty.call(model, "nextWhole");
    return `<div class="fra06-mixed-model"><div class="fra06-symbol-card">${fractionMarkup(value)}</div>${showBars ? barMarkup(bars, next.selectedParts, next.totalParts) : ""}${labelsMarkup(model, context)}</div>`;
  }
  function labelsMarkup(model, context) {
    if (context?.question && !["correct", "support", "worked"].includes(context.feedback)) return "";
    return Array.isArray(model.labels) ? `<div class="fra06-labels">${model.labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}</div>` : "";
  }
  function decisionMarkup() {
    return `<div class="fra06-decision"><strong>How is the number written?</strong><div><article><b>Separate whole-number part</b><span>MIXED</span><small>greater than one</small></article><article><b>One fraction</b><span>Compare numerator and denominator</span><small>smaller → proper · equal/larger → improper</small></article></div></div>`;
  }
  function sortMarkup(model) {
    return `<div class="fra06-sort-visual"><div class="fra06-card-row">${(model.cards || []).map(cardMarkup).join("")}</div><div class="fra06-bin-row">${(model.bins || ["proper", "improper", "mixed"]).map((bin) => `<span>${escapeHtml(bin)}</span>`).join("")}</div></div>`;
  }
  function contrastMarkup(model) {
    const values = model.values || [model.left, model.right].filter(Boolean);
    return `<div class="fra06-contrast">${values.map((value) => `<article>${fractionMarkup(value)}<small>${value.kind === "mixed_number" ? "separate whole part" : "one fraction"}</small></article>`).join("")}</div>`;
  }
  function renderMarkup(visual, context) {
    const model = modelFrom(visual, context || {});
    switch (model.kind) {
      case "three_form_checkpoint_hook": return hookMarkup(model);
      case "fraction_on_number_line": case "fraction_with_number_line": case "fraction_symbol": case "claim_with_fraction": return fractionLineMarkup(model, context || {});
      case "mixed_number_bars": case "mixed_number_symbol": return mixedMarkup(model, context || {});
      case "classification_decision_map": return decisionMarkup();
      case "classification_sort": case "fraction_card_row": return sortMarkup(model);
      case "written_form_contrast": return contrastMarkup(model);
      case "number_line": return numberLineMarkup(model, null, true);
      default: return model.value ? fractionLineMarkup(model, context || {}) : `<div class="fra06-generic">ONE-WHOLE CHECKPOINT</div>`;
    }
  }
  function accessibleDescription(model) {
    return model?.accessibleDescription || "A fraction or mixed number is shown around the one-whole checkpoint.";
  }

  window.RevilyFra06Visuals = { accessibleDescription, fractionMarkup, renderMarkup };
})();
