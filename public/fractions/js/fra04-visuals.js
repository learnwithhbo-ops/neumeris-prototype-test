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

  function fractionMarkup(value, className) {
    return `<span class="fra04-fraction ${className || ""}"><span>${escapeHtml(value.numerator)}</span><i aria-hidden="true"></i><span>${escapeHtml(value.denominator)}</span></span>`;
  }

  function cellsMarkup(value, options) {
    const opts = options || {};
    const denominator = Math.max(1, Number(value.denominator) || 1);
    const numerator = Math.max(0, Math.min(denominator, Number(value.numerator) || 0));
    const material = opts.material === "chocolate" ? " chocolate" : "";
    const cells = Array.from({ length: denominator }, (_, index) => {
      const selected = index < numerator ? " selected" : "";
      return `<i class="fra04-piece${selected}" aria-hidden="true"><b></b></i>`;
    }).join("");
    return `<div class="fra04-bar${material}" style="--parts:${denominator}">${cells}</div>`;
  }

  function rowMarkup(value, side, model, showBars) {
    const label = fractionMarkup(value, `fra04-${side}-fraction`);
    return `<div class="fra04-row fra04-${side}">
      <div class="fra04-value">${label}</div>
      ${showBars ? cellsMarkup(value, { material: model.material }) : `<div class="fra04-no-bar" aria-hidden="true"></div>`}
    </div>`;
  }

  function symbolMarkup(symbol, model) {
    const anatomy = model.visualKind === "comparison_symbol" || model.teachingVariant === "repair_symbol";
    return `<div class="fra04-symbol-wrap${anatomy ? " anatomy" : ""}">
      ${anatomy && symbol !== "=" ? `<span class="fra04-open-label">open side · larger</span>` : ""}
      <b class="fra04-symbol">${escapeHtml(symbol)}</b>
      ${anatomy && symbol !== "=" ? `<span class="fra04-point-label">point · smaller</span>` : ""}
    </div>`;
  }

  function summaryMarkup() {
    return `<div class="fra04-summary">
      <div><strong>Same denominator</strong><span>same-size pieces</span><b>compare the count</b></div>
      <div><strong>Same numerator</strong><span>same number of pieces</span><b>compare piece size</b></div>
      <div><strong>Compare</strong><span>larger · smaller · equal</span><b>&lt; &nbsp; &gt; &nbsp; =</b></div>
    </div>`;
  }

  function comparisonMarkup(model, feedback, question) {
    if (model.teachingVariant === "handoff") return summaryMarkup();
    const resolved = ["correct", "support", "worked"].includes(feedback);
    const teaching = Boolean(model.teachingVariant && !["hook"].includes(model.teachingVariant));
    const showBars = model.showVisualInitially !== false || resolved || teaching;
    const showSymbol = resolved || model.revealSymbol === true || teaching;
    const symbol = showSymbol ? model.answer : "?";
    const structure = String(model.structure || "").replace(/_/g, " ");
    const structureLabel = structure && structure !== "summary"
      ? `<span class="fra04-structure-label">${escapeHtml(structure)}</span>`
      : "";
    const reverse = model.reverseExample
      ? `<div class="fra04-reverse">${fractionMarkup(model.right)}<b>&lt;</b>${fractionMarkup(model.left)}</div>`
      : "";
    const hookNote = model.material === "chocolate"
      ? `<p class="fra04-whole-note">identical whole-size chocolate bars</p>`
      : "";
    const hiddenVisualNote = !showBars
      ? `<p class="fra04-symbolic-note">Use the fractions’ shared structure.</p>`
      : "";

    return `<div class="fra04-comparison${model.material === "chocolate" ? " is-chocolate" : ""}${model.structure === "equality" ? " is-equality" : ""}">
      ${hookNote}
      ${structureLabel}
      <div class="fra04-pair">
        ${rowMarkup(model.left, "left", model, showBars)}
        ${symbolMarkup(symbol, model)}
        ${rowMarkup(model.right, "right", model, showBars)}
      </div>
      ${hiddenVisualNote}
      ${reverse}
      ${question?.policy?.solutionPolicy === "after_locked_submit" && resolved ? `<span class="fra04-locked-note">answer locked · working shown</span>` : ""}
    </div>`;
  }

  function renderMarkup(visual, context) {
    const ctx = context || {};
    const model = ctx.question?.model || visual?.scene?.model || visual?.model || {};
    if (!model.left || !model.right) {
      return `<div class="fra04-summary"><div><strong>Compare fractions</strong><span>look for shared structure</span><b>&lt; &nbsp; &gt; &nbsp; =</b></div></div>`;
    }
    return comparisonMarkup(model, ctx.feedback || "initial", ctx.question || null);
  }

  function accessibleDescription(model) {
    if (!model?.left || !model?.right) return "A fraction comparison model.";
    const left = `${model.left.numerator} over ${model.left.denominator}`;
    const right = `${model.right.numerator} over ${model.right.denominator}`;
    const material = model.material === "chocolate" ? " chocolate" : "";
    const base = `Two identical-width${material} wholes. The left is divided into ${model.left.denominator} equal parts with ${model.left.numerator} selected. The right is divided into ${model.right.denominator} equal parts with ${model.right.numerator} selected.`;
    if (model.teachingVariant === "symbol_anatomy" || model.teachingVariant === "repair_symbol") {
      return `${base} The written comparison is ${left} ${model.answer} ${right}, with the open side and point labelled.`;
    }
    if (model.teachingVariant === "equality" || model.teachingVariant === "repair_equality") {
      return `${base} The two values are shown with an equals symbol.`;
    }
    if (model.teachingVariant && model.teachingVariant !== "hook") {
      return `${base} The displayed comparison is ${left} ${model.answer} ${right}.`;
    }
    return base;
  }

  window.RevilyFra04Visuals = {
    accessibleDescription,
    cellsMarkup,
    comparisonMarkup,
    fractionMarkup,
    renderMarkup
  };
})();
