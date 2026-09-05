(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  function modelFor(visual, ctx) {
    if (visual?.context === "fra28_divide_fraction") return visual;
    return ctx?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function fraction(value) {
    if (!value) return "";
    return `<span class="fra28-fraction" aria-label="${value.numerator} over ${value.denominator}"><b>${escapeHtml(value.numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(value.denominator)}</b></span>`;
  }

  function measurementStrip(model, reveal) {
    const visual = model.visual || {};
    const total = Math.max(1, Number(visual.totalEqualParts || 8));
    const active = Math.max(0, Math.min(total, Number(visual.activeParts || 0)));
    const group = Math.max(1, Math.min(total, Number(visual.divisorUnitParts || 1)));
    const groups = Math.floor(active / group);
    const cells = Array.from({ length: total }, (_, index) => `<i class="fra28-strip-cell${index < active ? " is-active" : ""}" style="--cell-index:${index}"></i>`).join("");
    const brackets = reveal ? Array.from({ length: groups }, (_, index) => `<span class="fra28-group-bracket" style="--group-index:${index};--group-size:${group};--total:${total}" aria-hidden="true"><b>${index + 1}</b></span>`).join("") : "";
    const amount = model.math?.dividend || (total === 8 ? { numerator: 3, denominator: 4 } : { numerator: active, denominator: total });
    const divisor = model.math?.divisor || { numerator: group, denominator: total };
    return `<div class="fra28-measurement-card context-${escapeHtml(visual.context || "fraction_bar")}">
      <div class="fra28-context-icon" aria-hidden="true"><span></span><i></i></div>
      <div class="fra28-measurement-label">Amount ${fraction(amount)}</div>
      <div class="fra28-strip" style="--parts:${total}">${cells}${brackets}</div>
      <div class="fra28-measure-tile" style="--tile-span:${group};--parts:${total}"><span>one group</span>${fraction(divisor)}</div>
      ${reveal ? `<div class="fra28-count-result"><strong>${groups}</strong><span>groups fit</span></div>` : ""}
    </div>`;
  }

  function symbolic(model, reveal) {
    const math = model.math || {};
    const visual = model.visual || {};
    const dividend = math.dividend || visual.dividend;
    const divisor = math.divisor || visual.divisor;
    const reciprocal = math.reciprocalOfDivisor || visual.reciprocal;
    const quotient = math.quotient || visual.quotient;
    const teaching = model.mode === "teaching";
    const showRewrite = reveal || teaching;
    return `<div class="fra28-symbolic-card">
      <div class="fra28-expression"><span class="fra28-dividend-card">${fraction(dividend)}<small>amount</small></span><b aria-label="divided by">÷</b><span class="fra28-divisor-card">${fraction(divisor)}<small>group size</small></span></div>
      ${showRewrite ? `<div class="fra28-rewrite" aria-label="Rewrite using the divisor reciprocal"><span class="fra28-dividend-card is-locked">${fraction(dividend)}<small>kept</small></span><b aria-label="multiplied by">×</b><span class="fra28-reciprocal-card">${fraction(reciprocal)}<small>divisor reciprocal</small></span>${quotient ? `<b>=</b><span class="fra28-quotient-card">${fraction(quotient)}</span>` : ""}</div>` : `<div class="fra28-rewrite-placeholder" aria-hidden="true"><span>?</span></div>`}
    </div>`;
  }

  function paintContext(model, reveal) {
    const math = model.math || {};
    const total = math.dividend || model.visual?.containerAmount;
    const portion = math.divisor || model.visual?.potAmount;
    const count = math.quotient?.numerator || 6;
    return `<div class="fra28-context-card fra28-paint-context">
      <div class="fra28-container"><i aria-hidden="true"></i><strong>${fraction(total)} L</strong><span>paint container</span></div>
      <b aria-hidden="true">÷</b>
      <div class="fra28-portions${reveal ? " is-revealed" : ""}">${Array.from({ length: reveal ? count : 1 }, (_, index) => `<span class="fra28-pot" style="--pot-index:${index}"><i aria-hidden="true"></i><b>${fraction(portion)} L</b></span>`).join("")}</div>
      ${reveal ? `<strong class="fra28-context-result">${count} pots</strong>` : `<span class="fra28-context-prompt">How many pots?</span>`}
    </div>`;
  }

  function cableContext(model, reveal) {
    const math = model.math || {};
    const total = math.dividend;
    const section = math.divisor;
    const count = math.quotient?.numerator || 4;
    return `<div class="fra28-context-card fra28-cable-context"><div class="fra28-cable"><span>${fraction(total)} m</span></div><div class="fra28-wire-sections">${Array.from({ length: reveal ? count : 1 }, (_, index) => `<i style="--wire-index:${index}"><b>${fraction(section)} m</b></i>`).join("")}</div>${reveal ? `<strong>${count} sections</strong>` : `<span>one section size</span>`}</div>`;
  }

  function rangeModel(model, reveal) {
    const quotient = model.math?.quotient;
    const position = quotient ? Math.max(0, Math.min(1, quotient.numerator / quotient.denominator)) : 0;
    return `<div class="fra28-range-card"><div class="fra28-range-line"><span>0</span><i></i><span>1</span>${reveal ? `<b style="--position:${position}" aria-label="Quotient ${quotient.numerator} over ${quotient.denominator}">${fraction(quotient)}</b>` : ""}</div><p>${reveal ? "The exact quotient is between 0 and 1." : "Decide where the quotient belongs."}</p></div>`;
  }

  function handoff(model) {
    const labels = model.visual?.labels || [];
    return `<div class="fra28-handoff"><strong>Divide by a fraction</strong><ol>${labels.map((label) => `<li>${escapeHtml(label)}</li>`).join("")}</ol></div>`;
  }

  function repair(model) {
    const repairId = model.visual?.repairId || model.sceneId || "";
    const messages = {
      "R-DIVIDEND": ["Keep the amount", "Use the divisor reciprocal"],
      "R-BOTH": ["Do not flip both", "Only the divisor changes"],
      "R-UNCHANGED": ["Division sign changes", "The divisor becomes its reciprocal"],
      "R-SEPARATE": ["Each fraction is one value", "Keep each card together"],
      "R-POSSIBLE": ["Part of one group is possible", "The quotient can be between 0 and 1"],
      "R-RECIPROCAL": ["Swap numerator and denominator", "a/b becomes b/a"]
    };
    return `<div class="fra28-repair-card" data-repair="${escapeHtml(repairId)}"><span class="is-unsafe">${escapeHtml(messages[repairId]?.[0] || "Check the chosen method")}</span><b aria-hidden="true">→</b><span class="is-safe">${escapeHtml(messages[repairId]?.[1] || "Use the divisor reciprocal")}</span></div>`;
  }

  function renderMarkup(visual, ctx) {
    const model = modelFor(visual, ctx);
    const reveal = ["correct", "worked"].includes(ctx?.feedback);
    const kind = model.visual?.kind || "symbolic_expression";
    let markup;
    if (model.mode === "repair" || kind === "repair") markup = repair(model);
    else if (kind === "measurement_strip") markup = measurementStrip(model, reveal || model.mode === "teaching");
    else if (kind === "paint_container_and_sample_pot" || kind === "bag_and_single_portion") markup = paintContext(model, reveal);
    else if (kind === "wire_and_single_section" || kind === "cable_and_single_unit") markup = cableContext(model, reveal);
    else if (kind === "range_then_fraction") markup = rangeModel(model, reveal);
    else if (kind === "handoff") markup = handoff(model);
    else markup = symbolic(model, reveal);
    return `<div class="fra28-visual" data-scene="${escapeHtml(model.sceneId || "")}" data-kind="${escapeHtml(kind)}" data-reveal="${reveal}" aria-hidden="true">${markup}</div>`;
  }

  function accessibleDescription(visual, ctx) {
    const model = modelFor(visual, ctx);
    if (model.accessibleDescription) return model.accessibleDescription;
    return "A division-by-a-fraction model keeps the amount unchanged and applies the reciprocal only to the group-size fraction.";
  }

  window.RevilyFra28Visuals = { accessibleDescription, renderMarkup };
})();
