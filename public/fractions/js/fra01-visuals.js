(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function fractionMarkup(numerator, denominator, label) {
    return `<span class="fra01-fraction" aria-label="${escapeHtml(label || `${numerator} out of ${denominator}`)}"><span>${escapeHtml(numerator)}</span><i aria-hidden="true"></i><span>${escapeHtml(denominator)}</span></span>`;
  }

  function safeCount(value, fallback, maximum) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) return fallback;
    return Math.min(number, maximum || 24);
  }

  function selectedCount(model) {
    return Math.max(0, Math.min(safeCount(model?.totalParts, 1, 60), Number(model?.selectedParts) || 0));
  }

  function contextPieces(model, kind) {
    const total = safeCount(model?.totalParts, 1, 24);
    const selected = selectedCount(model);
    const meaning = String(model?.selectedMeaning || "selected").replace(/[^a-z0-9_-]/gi, "");
    const unselectedMeaning = String(model?.unselectedMeaning || "").replace(/[^a-z0-9_-]/gi, "");
    const unequal = model?.unequalParts === true;
    return Array.from({ length: total }, (_, index) => {
      const active = index < selected;
      const secondary = !active && Boolean(unselectedMeaning);
      const width = unequal
        ? [0.42, 1.7, 0.68, 1.25, 0.78, 1.17, 0.9, 1.1][index % 8]
        : 1;
      return `<span class="fra01-piece${active ? " is-selected" : ""}${secondary ? ` is-${unselectedMeaning}` : ""}" style="--piece-index:${index};--piece-grow:${width}" aria-hidden="true"><i></i></span>`;
    }).join("");
  }

  function segmentedContext(model, kind, options) {
    const opts = options || {};
    const total = safeCount(model?.totalParts, 1, 24);
    const meaning = String(model?.selectedMeaning || "selected").replace(/[^a-z0-9_-]/gi, "");
    const unequalClass = model?.unequalParts ? " is-unequal" : "";
    const compactClass = model?.compact ? " is-compact" : "";
    return `<div class="fra01-segmented is-${escapeHtml(kind)} selection-${escapeHtml(meaning)}${unequalClass}${compactClass}" style="--fra01-parts:${total}" aria-hidden="true">${contextPieces(model, kind)}</div>${opts.showLegend ? `<div class="fra01-context-legend"><span><i class="legend-solid"></i>${escapeHtml(meaning === "left" ? "left" : meaning)}</span>${model?.unselectedMeaning ? `<span><i class="legend-faded"></i>${escapeHtml(model.unselectedMeaning)}</span>` : ""}</div>` : ""}${opts.caption ? `<small class="fra01-diagram-note">${escapeHtml(opts.caption)}</small>` : ""}`;
  }

  function pointAt(angle, radius, centre) {
    return {
      x: centre + radius * Math.cos(angle),
      y: centre + radius * Math.sin(angle)
    };
  }

  function cakeMarkup(model) {
    const total = safeCount(model?.totalParts, 6, 12);
    const selected = selectedCount(model);
    const unequal = model?.unequalParts === true;
    const weights = Array.from({ length: total }, (_, index) => {
      if (!unequal) return 1;
      if (index === 0) return 0.28;
      if (index === 1) return 2.15;
      if (index === 2) return 0.62;
      return 1;
    });
    const sum = weights.reduce((totalWeight, weight) => totalWeight + weight, 0);
    const centre = 70;
    const radius = 57;
    let cursor = -Math.PI / 2;
    const slices = weights.map((weight, index) => {
      const start = cursor;
      const end = cursor + (weight / sum) * Math.PI * 2;
      cursor = end;
      const a = pointAt(start, radius, centre);
      const b = pointAt(end, radius, centre);
      const large = end - start > Math.PI ? 1 : 0;
      const selectedClass = index < selected ? " is-selected" : "";
      return `<path class="fra01-cake-slice${selectedClass}" d="M ${centre} ${centre} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z" />`;
    }).join("");
    return `<svg class="fra01-cake${unequal ? " is-unequal" : ""}" viewBox="0 0 140 140" aria-hidden="true"><circle class="fra01-cake-shadow" cx="70" cy="74" r="59"></circle>${slices}<circle class="fra01-cake-crust" cx="70" cy="70" r="58"></circle></svg>`;
  }

  function tokensMarkup(model) {
    const total = safeCount(model?.totalParts, 1, 30);
    const selected = selectedCount(model);
    const layout = model?.layout === "staggered" ? " is-staggered" : "";
    const tokens = Array.from({ length: total }, (_, index) => `<span class="fra01-token${index < selected ? " is-selected" : ""}" style="--token-index:${index}" aria-hidden="true"><i></i></span>`).join("");
    return `<div class="fra01-token-boundary${model?.wholeBoundary ? " has-boundary" : ""}${layout}" aria-hidden="true"><div class="fra01-token-set" style="--token-count:${total}">${tokens}</div></div>`;
  }

  function handoffMarkup() {
    return `<div class="fra01-handoff" aria-hidden="true"><span class="handoff-step handoff-whole"><b>Whole</b><small>What counts as everything?</small></span><i>→</i><span class="handoff-step handoff-equal"><b>Equal parts</b><small>Are the parts genuinely equal?</small></span><i>→</i><span class="handoff-step handoff-target"><b>Part asked about</b><small>Shaded? left? selected?</small></span><i>→</i><span class="handoff-step handoff-fraction"><b>Fraction</b><small>Read “part out of whole”.</small></span></div>`;
  }

  function hookMarkup(model, feedback) {
    const worked = ["correct", "worked", "support"].includes(feedback);
    return `<div class="fra01-hook${worked ? " is-after-response" : ""}">
      <div class="hook-bar hook-bar-unequal" aria-hidden="true"><span></span><span></span></div>
      <div class="hook-bar hook-bar-equal" aria-hidden="true"><span></span><span></span></div>
      <div class="hook-piece-labels" aria-hidden="true"><span>small piece</span><span>large piece</span></div>
      <div class="hook-half-label" aria-hidden="true">${fractionMarkup(1, 2, "one half")}</div>
    </div>`;
  }

  function equalRepairMarkup() {
    return `<div class="fra01-equal-repair" aria-hidden="true"><div class="repair-strip repair-strip-unequal"><span></span><span></span><small>tiny piece</small><small>much larger piece</small></div><div class="repair-arrow">→</div><div class="repair-strip repair-strip-equal"><span></span><span></span><small>equal</small><small>equal</small></div></div>`;
  }

  function optionMarkup(model) {
    const context = String(model?.context || "strip");
    let drawing;
    if (context === "cake") drawing = cakeMarkup(model);
    else if (context === "token_set") drawing = tokensMarkup(model);
    else drawing = segmentedContext(model, context, { caption: "" });
    return `<span class="fra01-option-visual">${drawing}</span><span class="fra01-option-label">${escapeHtml(model?.label || "")}</span><span class="visually-hidden">${escapeHtml(accessibleDescription(model))}</span>`;
  }

  function teachingMarkup(model, visual, feedback) {
    const context = String(model?.context || "");
    const variant = String(model?.teachingVariant || visual?.scene?.model?.teachingVariant || "");
    if (variant === "hook") return hookMarkup(model, feedback);
    if (variant === "handoff" || context === "handoff") return handoffMarkup();
    if (context === "equal_parts_repair") return equalRepairMarkup();

    let drawing;
    if (context === "cake") drawing = cakeMarkup(model);
    else if (context === "token_set") drawing = tokensMarkup(model);
    else drawing = segmentedContext(model, context, { showLegend: context === "chocolate_bar" && Boolean(model?.unselectedMeaning) });

    const showFraction = Number.isInteger(model?.selectedParts) && model.selectedParts > 0;
    const total = safeCount(model?.totalParts, 1, 24);
    return `<div class="fra01-teach-context variant-${escapeHtml(variant || "plain")}"><div class="fra01-whole-outline">${drawing}</div>${showFraction ? `<div class="fra01-teach-fraction" aria-hidden="true">${fractionMarkup(model.selectedParts, total)}</div>` : ""}</div>`;
  }

  function workedMarkup(question) {
    const model = question?.model || {};
    if (question?.response?.type === "single_choice" || question?.response?.type === "yes_no") {
      return `<div class="fra01-worked-result"><span>Check the whole and the equal parts.</span><strong>${escapeHtml(question?.answer?.value || "")}</strong></div>`;
    }
    return `<div class="fra01-worked-result"><span>${escapeHtml(model.selectedParts)} ${escapeHtml(model.selectedMeaning || "selected")} out of ${escapeHtml(model.totalParts)} equal parts</span>${fractionMarkup(model.selectedParts, model.totalParts)}</div>`;
  }

  function questionMarkup(question, feedback, response) {
    const model = question?.model || {};
    const context = String(model.context || "");
    if (context === "cake_options" || context === "strip_options") {
      return `<div class="fra01-choice-canvas"><span class="fra01-choice-cue">Choose from the visual options below.</span></div>`;
    }
    let drawing;
    if (context === "cake") drawing = cakeMarkup(model);
    else if (context === "token_set") drawing = tokensMarkup(model);
    else if (context === "equal_parts_repair") drawing = equalRepairMarkup();
    else drawing = segmentedContext(model, context, { showLegend: context === "chocolate_bar" && Boolean(model.unselectedMeaning) });
    const reveal = ["correct", "worked", "support"].includes(feedback);
    const focus = ['hint', 'first_incorrect'].includes(feedback) && model.feedbackFocus === 'whole_then_selected'
      ? (Number(response?.d) !== model.totalParts ? 'whole' : 'selected') : '';
    return `<div class="fra01-question-context${focus ? ` hint-focus-${focus}` : ''}"><div class="fra01-whole-outline">${drawing}</div>${reveal ? workedMarkup(question) : ""}</div>`;
  }

  function renderMarkup(visual, context) {
    const ctx = context || {};
    const model = ctx.question?.model || visual?.scene?.model || visual?.model || {};
    if (ctx.question) {
      if (ctx.question.policy?.reteachOnly) return teachingMarkup(model, visual, ctx.feedback || "initial");
      if (ctx.question.policy?.engagementOnly) return hookMarkup(model, ctx.feedback || "initial");
      return questionMarkup(ctx.question, ctx.feedback || "initial", ctx.response);
    }
    return teachingMarkup(model, visual, ctx.feedback || "initial");
  }

  function accessibleDescription(model) {
    if (!model) return "A visual fraction model.";
    const context = String(model.context || "model").replace(/_/g, " ");
    if (model.teachingVariant === "hook") return "One chocolate bar split into two visibly unequal pieces: one small and one large.";
    if (model.teachingVariant === "teach_whole") return "One whole chocolate bar. Its structure changes as Ryan explains.";
    if (model.teachingVariant === "teach_several") return "One whole brownie tray. Its cuts and icing appear as Ryan explains.";
    if (model.teachingVariant === "teach_set") return "A group of game tokens. The whole-group boundary and highlights appear as Ryan explains.";
    if (model.context === "cake_options") return "Two cake diagrams. Cake A has six equal slices. Cake B has six visibly unequal pieces, including one very small and one very large piece.";
    if (model.context === "strip_options") return "Visual answer options with partition counts and widths shown for comparison.";
    if (model.context === "handoff") return "A four-step reminder: identify the whole, check equal parts, focus on the part asked about, then read the fraction.";
    if (model.context === "equal_parts_repair") return "An unequal two-piece whole changes into two equal pieces.";
    const total = Number(model.totalParts) || 0;
    const selected = Number(model.selectedParts) || 0;
    if (model.accessiblePartSequence) {
      const states = Array.from({length: total}, (_, index) => index < selected
        ? (model.selectedMeaning || 'selected')
        : (model.unselectedMeaning || `not ${model.selectedMeaning || 'selected'}`));
      return `One whole ${context}. Equal parts in reading order: ${states.join('; ')}.`;
    }
    if (model.context === 'token_set') return `One whole group containing ${total} tokens. ${selected} are ${model.selectedMeaning || 'selected'}.`;
    if (model.unequalParts) return `A ${context} divided into ${total} visibly unequal pieces.`;
    if (model.unselectedMeaning) return `A ${context} divided into ${total} equal parts. ${selected} are ${model.selectedMeaning}; the others are ${model.unselectedMeaning}.`;
    if (total && selected <= 0) return `A ${context} divided into ${total} equal parts.`;
    if (total) return `A ${context} divided into ${total} equal parts. ${selected} are ${model.selectedMeaning || "selected"}.`;
    return `A ${context} visual.`;
  }

  window.RevilyFra01Visuals = {
    accessibleDescription,
    cakeMarkup,
    optionMarkup,
    renderMarkup,
    segmentedContext,
    tokensMarkup
  };
})();
