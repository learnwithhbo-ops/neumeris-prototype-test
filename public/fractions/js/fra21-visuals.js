(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function fraction(value, className) {
    const item = value || { numerator: "?", denominator: "?" };
    return `<span class="fra21-fraction ${className || ""}" aria-label="${escapeHtml(item.numerator)} over ${escapeHtml(item.denominator)}"><b>${escapeHtml(item.numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(item.denominator)}</b></span>`;
  }

  function cells(total, filled, options) {
    const opts = options || {};
    return Array.from({ length: total }, (_, index) => {
      const classes = [index < filled ? "is-filled" : "", opts.removed?.includes(index) ? "is-removed" : ""].filter(Boolean).join(" ");
      return `<i class="${classes}" aria-hidden="true"><span></span></i>`;
    }).join("");
  }

  function strip(total, filled, options) {
    return `<span class="fra21-strip ${options?.className || ""}" style="--fra21-parts:${total}">${cells(total, filled, options)}</span>`;
  }

  function equation(math, reveal) {
    if (!math) return "";
    if (math.kind === "equivalence") {
      return `<div class="fra21-equation">${fraction(math.source)}<span class="fra21-factor">×${math.scaleFactor}</span><strong>=</strong>${fraction(reveal ? math.target : { numerator: "?", denominator: math.targetDenominator })}</div>`;
    }
    const first = reveal ? math.convertedFirst : math.first;
    const second = reveal ? math.convertedSecond : math.second;
    const result = reveal ? math.resultAtReadyDenominator : { numerator: "?", denominator: math.readyDenominator };
    return `<div class="fra21-equation">${fraction(first, math.scaleFirst === 1 ? "is-ready" : "is-converted")}<strong>−</strong>${fraction(second, math.scaleSecond === 1 ? "is-ready" : "is-converted")}<strong>=</strong>${fraction(result, reveal ? "is-result" : "")}</div>`;
  }

  function hook() {
    return `<div class="fra21-hook">
      <div class="fra21-battery"><span class="fra21-battery-cap"></span><div class="fra21-battery-grid">${cells(8, 7)}</div><strong>${fraction({ numerator: 7, denominator: 8 })}</strong></div>
      <div class="fra21-update"><small>UPDATE USES</small>${fraction({ numerator: 1, denominator: 4 })}<span class="fra21-quarter-piece"></span></div>
      <div class="fra21-mismatch"><i></i><b>≠</b><i></i></div>
    </div>`;
  }

  function t1() {
    return `<div class="fra21-teach-compare"><div>${fraction({ numerator: 7, denominator: 8 })}${strip(8, 7)}</div><span class="fra21-remove-arrow">remove →</span><div>${fraction({ numerator: 1, denominator: 4 })}${strip(4, 1)}</div><p>Match the piece size before subtracting.</p></div>`;
  }

  function t2() {
    return `<div class="fra21-conversion">
      <span class="fra21-ready-label">READY DENOMINATOR</span>
      <div class="fra21-protected">${fraction({ numerator: 7, denominator: 8 })}<small>LEAVE IT ALONE</small></div>
      <div class="fra21-convert-line">${fraction({ numerator: 1, denominator: 4 })}<span><b class="fra21-den-factor">×2</b><b class="fra21-num-factor">×2</b></span><span class="fra21-conversion-target">${fraction({ numerator: 2, denominator: 8 })}</span></div>
      <div class="fra21-quarter-to-eighths">${strip(4, 1)}<strong>→</strong>${strip(8, 2)}</div>
    </div>`;
  }

  function t3() {
    const math = { convertedFirst: { numerator: 7, denominator: 8 }, convertedSecond: { numerator: 2, denominator: 8 }, resultAtReadyDenominator: { numerator: 5, denominator: 8 }, readyDenominator: 8, kind: "fraction_subtraction", scaleFirst: 1, scaleSecond: 1 };
    return `<div class="fra21-removal"><div class="fra21-t3-grids"><span>${strip(8, 7)}</span><span>${strip(8, 2)}</span></div><div class="fra21-t3-removal">${strip(8, 7, { removed: [5, 6] })}</div><div class="fra21-t3-equation">${equation(math, true)}</div><p class="fra21-t3-fixed">Five eighth-sized pieces remain. The denominator stays eight.</p></div>`;
  }

  function t4() {
    return `<div class="fra21-first-changes"><div class="fra21-convert-line"><span class="fra21-first-source">${fraction({ numerator: 3, denominator: 4 })}</span><span class="fra21-t4-factors"><b>×2</b><b>×2</b></span><span class="fra21-first-target">${fraction({ numerator: 6, denominator: 8 })}</span></div><div class="fra21-order-line"><span class="fra21-t4-order"><b>1</b>${fraction({ numerator: 6, denominator: 8 })}<strong>−</strong><b>2</b>${fraction({ numerator: 5, denominator: 8 })}<strong>=</strong></span><span class="fra21-t4-result">${fraction({ numerator: 1, denominator: 8 }, "is-result")}</span></div></div>`;
  }

  function handoff() {
    return `<div class="fra21-handoff"><article><span>1</span><strong>Spot the ready denominator</strong></article><i></i><article><span>2</span><strong>Rename one fraction</strong></article><i></i><article><span>3</span><strong>Subtract in order</strong></article></div>`;
  }

  function timber(math, reveal) {
    const selected = Number(math?.first?.numerator || 11);
    const cut = reveal ? Number(math?.convertedSecond?.numerator || 4) : 0;
    return `<div class="fra21-timber"><div class="fra21-timber-strip">${strip(12, selected, { removed: cut ? Array.from({ length: cut }, (_, index) => selected - 1 - index) : [] })}</div><div class="fra21-bracket"><i></i><span>${fraction(math?.second || { numerator: 1, denominator: 3 })}</span><i></i></div>${reveal ? `<p>${selected} twelfths minus ${cut} twelfths leaves ${math.resultAtReadyDenominator.numerator} twelfths.</p>` : ""}</div>`;
  }

  function tank(math, reveal) {
    const start = math?.first || { numerator: 3, denominator: 4 };
    const result = math?.resultAtReadyDenominator || { numerator: 1, denominator: 8 };
    const rows = reveal ? math.readyDenominator : start.denominator;
    const filled = reveal ? result.numerator : start.numerator;
    return `<div class="fra21-tank"><div class="fra21-tank-vessel" style="--fra21-tank-parts:${rows}">${cells(rows, filled)}</div><div><small>STARTING LEVEL</small>${fraction(start)}${math?.second ? `<small>AMOUNT USED</small>${fraction(math.second)}` : ""}</div></div>`;
  }

  function worked(model) {
    const question = model.canonicalQuestion;
    const math = model.math;
    const steps = model.workedSteps || [];
    let diagram = equation(math, true);
    if (question?.id === "M3") diagram = `${strip(6, 3)}${equation(math, true)}`;
    if (["I2", "M4"].includes(question?.id)) diagram = `${tank(math, true)}${equation(math, true)}`;
    return `<div class="fra21-worked"><span class="fra21-locked">ANSWER LOCKED</span>${diagram}${steps.length ? `<ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>` : ""}</div>`;
  }

  function repair(model) {
    const id = model.repair?.id || model.questionId;
    if (id === "R-SCALE") return `<div class="fra21-repair-scale">
      <div class="fra21-repair-c1 fra21-scale-wrong">${fraction({ numerator: 1, denominator: 4 })}<strong>=</strong>${fraction({ numerator: 1, denominator: 8 })}<b>Not equivalent</b></div>
      <div class="fra21-repair-c2 fra21-scale-arrows"><span>numerator ×2</span><span>denominator ×2</span></div>
      <div class="fra21-repair-c3">${fraction({ numerator: 1, denominator: 4 })}<strong>=</strong>${fraction({ numerator: 2, denominator: 8 }, "is-result")}</div>
    </div>`;
    if (id === "R-EARLY") return `<div class="fra21-repair-early">
      <div class="fra21-repair-c1 fra21-unequal-pieces">${strip(8, 7)}${strip(4, 1)}<b>Pieces do not match</b></div>
      <div class="fra21-repair-c2 fra21-repair-steps"><span>Ready denominator</span><span>Rename 1/4 as 2/8</span><span>Subtract</span><span>Keep the denominator</span></div>
      <div class="fra21-repair-c3">${equation({ convertedFirst: { numerator: 7, denominator: 8 }, convertedSecond: { numerator: 2, denominator: 8 }, resultAtReadyDenominator: { numerator: 5, denominator: 8 }, readyDenominator: 8, kind: "fraction_subtraction", scaleFirst: 1, scaleSecond: 1 }, true)}</div>
    </div>`;
    if (id === "R-ORDER") return `<div class="fra21-repair-order">
      <div class="fra21-repair-c1"><span class="fra21-crossed-line">5/8 − 6/8</span><b>Order changed</b></div>
      <div class="fra21-repair-c2 fra21-start-frame">${fraction({ numerator: 3, denominator: 4 })}<strong>=</strong>${fraction({ numerator: 6, denominator: 8 })}<b>Starting amount</b></div>
      <div class="fra21-repair-c3">${fraction({ numerator: 6, denominator: 8 })}<strong>−</strong>${fraction({ numerator: 5, denominator: 8 })}<b>Keep this order</b></div>
    </div>`;
    if (id === "R-DENOM") return `<div class="fra21-repair-denom">
      <div class="fra21-repair-c1 fra21-tenths-pair">${strip(10, 7)}${strip(10, 4)}</div>
      <div class="fra21-repair-c2">${fraction({ numerator: 7, denominator: 10 })}<strong>−</strong>${fraction({ numerator: 4, denominator: 10 })}<strong>=</strong>${fraction({ numerator: 3, denominator: 10 }, "is-result")}</div>
      <div class="fra21-repair-c3 fra21-denom-lock"><b>Denominator stays 10</b><s>3/5</s><s>3/0</s></div>
    </div>`;
    return `<div class="fra21-repair-both">
      <div class="fra21-repair-c1"><span class="fra21-ready-label">READY DENOMINATOR 10</span></div>
      <div class="fra21-repair-c2 fra21-protected">${fraction({ numerator: 7, denominator: 10 })}<small>LEAVE IT ALONE</small></div>
      <div class="fra21-repair-c3">${fraction({ numerator: 2, denominator: 5 })}<strong>=</strong>${fraction({ numerator: 4, denominator: 10 }, "is-converted")}</div>
    </div>`;
  }

  function questionMarkup(model, reveal) {
    if (reveal && model.workedSteps?.length) return worked(model);
    const question = model.canonicalQuestion;
    const math = model.math;
    const kind = model.visual?.kind || "symbolic_fraction_result";
    if (kind === "timber_strip") return timber(math, reveal);
    if (question?.id === "I2" || question?.id === "M4") return tank(math, reveal);
    if (question?.id === "M3") return `<div class="fra21-visual-bar"><span>${strip(reveal ? 6 : 3, reveal ? 3 : 2)}</span><div>${fraction(math.first)}<strong>−</strong>${fraction(math.second)}</div></div>`;
    if (kind === "symbolic_missing_numerators" || kind === "form_sensitive_common_denominator_fields") {
      return `<div class="fra21-missing-working">${equation(math, false)}<p>Complete the open numerator fields below.</p></div>`;
    }
    if (kind.includes("multiple_choice")) return `<div class="fra21-choice-problem">${equation(math, false)}${question?.id === "M5" ? `<p>${escapeHtml(window.RevilyFra21Canonical.uiText("M5.STATEMENT"))}</p>` : ""}</div>`;
    if (kind === "ordered_step_cards") return `<div class="fra21-repair-steps"><span>?</span><span>?</span><span>?</span><span>?</span></div>`;
    if (kind === "factor_choice_and_numerator" || kind === "choice_plus_missing_numerator") return equation(math, false);
    return equation(math, reveal);
  }

  function modelFrom(visual, context) {
    return context?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function renderMarkup(visual, context) {
    const model = modelFrom(visual, context);
    const reveal = ["correct", "support", "worked"].includes(context?.feedback);
    if (model.repair) return repair(model);
    if (model.canonicalQuestion) return questionMarkup(model, reveal);
    if (model.sceneId === "HOOK") return hook();
    if (model.sceneId === "T1") return t1();
    if (model.sceneId === "T2") return t2();
    if (model.sceneId === "T3") return t3();
    if (model.sceneId === "T4") return t4();
    return handoff();
  }

  function accessibleDescription(model, context) {
    const reveal = ["correct", "support", "worked"].includes(context?.feedback);
    if (reveal && model?.workedSteps?.length) return `Answer locked. ${model.workedSteps.join(" ")}`;
    if (model?.accessibleDescription) return model.accessibleDescription;
    const scene = model?.scene;
    const id = scene?.studentFacing?.accessibleDescriptionUiId;
    if (id) return window.RevilyFra21Canonical.uiText(id);
    return "A fraction subtraction model in which one denominator is a multiple of the other.";
  }

  window.RevilyFra21Visuals = { accessibleDescription, fraction, renderMarkup };
})();
