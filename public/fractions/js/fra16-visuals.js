(function () {
  "use strict";

  const NAMED_FRACTIONS = {
    five_eighths: { numerator: 5, denominator: 8, display: "5/8" },
    two_thirds: { numerator: 2, denominator: 3, display: "2/3" },
    four_ninths: { numerator: 4, denominator: 9, display: "4/9" },
    seven_twelfths: { numerator: 7, denominator: 12, display: "7/12" },
    three_quarters: { numerator: 3, denominator: 4, display: "3/4" },
    seven_sixths: { numerator: 7, denominator: 6, display: "7/6" },
    nine_eighths: { numerator: 9, denominator: 8, display: "9/8" },
    three_fifths: { numerator: 3, denominator: 5, display: "3/5" },
    benchmark_route: { icon: "½", display: "Use a benchmark" },
    equivalence_route: { icon: "=", display: "Match the part size" }
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function gcd(a, b) {
    let x = Math.abs(Number(a));
    let y = Math.abs(Number(b));
    while (y) [x, y] = [y, x % y];
    return x || 1;
  }

  function lcm(a, b) {
    return Math.abs(Number(a) * Number(b)) / gcd(a, b);
  }

  function fractionMarkup(value, className) {
    if (!value || value.icon) return `<span class="fra16-route-icon">${escapeHtml(value?.icon || "?")}</span>`;
    return `<span class="fra16-fraction ${className || ""}" aria-label="${value.numerator} over ${value.denominator}"><b>${value.numerator}</b><i aria-hidden="true"></i><b>${value.denominator}</b></span>`;
  }

  function namedFractions(ids) {
    return (ids || []).map((id) => ({ id, value: NAMED_FRACTIONS[id] })).filter((item) => item.value);
  }

  function questionFractions(model) {
    if (Array.isArray(model.fractions) && model.fractions.length) {
      return model.fractions.map((item) => ({ id: item.id, value: { ...item.value, display: item.display } }));
    }
    return namedFractions(model.visual?.fractionIds || model.canonicalScene?.visual?.fractionIds || model.canonicalRepair?.visual?.fractionIds);
  }

  function segmentMarkup(total, selected, options) {
    const opts = options || {};
    const count = Math.max(1, Math.min(60, Number(total) || 1));
    const filled = Math.max(0, Math.min(count, Number(selected) || 0));
    return Array.from({ length: count }, (_, index) => `<i class="${index < filled ? "is-selected" : ""}${opts.halfIndex === index ? " is-half-start" : ""}" aria-hidden="true"></i>`).join("");
  }

  function barMarkup(value, options) {
    const opts = options || {};
    const numerator = Number(opts.numerator ?? value.numerator);
    const denominator = Number(opts.denominator ?? value.denominator);
    const wholes = Math.max(1, Math.ceil(numerator / denominator));
    const bars = Array.from({ length: wholes }, (_, wholeIndex) => {
      const selected = Math.max(0, Math.min(denominator, numerator - wholeIndex * denominator));
      return `<span class="fra16-bar" style="--fra16-parts:${denominator}">${segmentMarkup(denominator, selected, { halfIndex: denominator % 2 === 0 ? denominator / 2 : -1 })}</span>`;
    }).join("");
    return `<div class="fra16-bar-row${opts.compact ? " is-compact" : ""}" data-fraction="${escapeHtml(value.display || `${value.numerator}/${value.denominator}`)}"><span class="fra16-original">${fractionMarkup(value)}</span><div class="fra16-bars">${bars}</div>${opts.equivalent ? `<span class="fra16-equivalent">${fractionMarkup(opts.equivalent)}</span>` : ""}</div>`;
  }

  function progressHookMarkup() {
    const blue = { numerator: 5, denominator: 8, display: "5/8" };
    const orange = { numerator: 2, denominator: 3, display: "2/3" };
    return `<div class="fra16-hook">
      <div class="fra16-game-row blue"><strong>Blue</strong><span class="fra16-progress-bar" style="--fra16-parts:8">${segmentMarkup(8, 5)}</span><small>5 of 8 stages</small></div>
      <div class="fra16-game-row orange"><strong>Orange</strong><span class="fra16-progress-bar" style="--fra16-parts:3">${segmentMarkup(3, 2)}</span><small>2 of 3 stages</small></div>
      <div class="fra16-stage-size" aria-hidden="true"><span style="--stage:12.5%">one Blue stage</span><span style="--stage:33.333%">one Orange stage</span></div>
      <p class="fra16-same-game"><span aria-hidden="true">↔</span> Same whole game length</p>
      <span hidden>${fractionMarkup(blue)} ${fractionMarkup(orange)}</span>
    </div>`;
  }

  function equivalentBarsMarkup(fractions, commonDenominator, showEquivalent) {
    const denominator = Number(commonDenominator) || fractions.reduce((value, item) => lcm(value, item.value.denominator), 1);
    return `<div class="fra16-comparison-bars">${fractions.map((item) => {
      const equivalentNumerator = item.value.numerator * denominator / item.value.denominator;
      const equivalent = showEquivalent ? { numerator: equivalentNumerator, denominator, display: `${equivalentNumerator}/${denominator}` } : null;
      return barMarkup(item.value, { equivalent });
    }).join("")}</div>`;
  }

  function benchmarkMarkup(fractions, reveal) {
    return `<div class="fra16-benchmark"><div class="fra16-half-label"><span>0</span><strong>½</strong><span>1</span></div>${fractions.map((item) => {
      const relation = item.value.numerator * 2 < item.value.denominator ? "below" : item.value.numerator * 2 > item.value.denominator ? "above" : "equal";
      return `<div class="fra16-benchmark-row ${reveal ? `is-${relation}` : ""}"><span>${fractionMarkup(item.value)}</span><div class="fra16-benchmark-track"><i style="--endpoint:${Math.min(100, item.value.numerator / item.value.denominator * 100)}%"></i><b></b></div>${reveal ? `<small>${relation === "below" ? "below one half" : relation === "above" ? "above one half" : "exactly one half"}</small>` : ""}</div>`;
    }).join("")}</div>`;
  }

  function commonUnitTrackMarkup(fractions, denominator, revealOrder) {
    const sorted = [...fractions].sort((left, right) => left.value.numerator * right.value.denominator - right.value.numerator * left.value.denominator);
    const rows = fractions.map((item) => {
      const equivalentNumerator = item.value.numerator * denominator / item.value.denominator;
      return `<div class="fra16-track-row"><span>${fractionMarkup(item.value)}</span><div class="fra16-unit-track" style="--fra16-parts:${denominator}">${segmentMarkup(denominator, equivalentNumerator)}</div><strong>${equivalentNumerator}/${denominator}</strong></div>`;
    }).join("");
    return `<div class="fra16-common-track"><div class="fra16-direction"><span>LEAST</span><i></i><span>GREATEST</span></div>${rows}${revealOrder ? `<div class="fra16-order-result">${sorted.map((item, index) => `${fractionMarkup(item.value)}${index < sorted.length - 1 ? "<b>&lt;</b>" : ""}`).join("")}</div>` : ""}</div>`;
  }

  function handoffMarkup() {
    return `<div class="fra16-handoff"><article><span class="fra16-route-icon">½</span><strong>Benchmark route</strong></article><article><span class="fra16-route-icon">=</span><strong>Matched-part route</strong></article><div class="fra16-stage-path"><span class="is-complete">Learn the idea</span><i></i><span class="is-active">Try it with me</span><i></i><span>Your turn</span></div></div>`;
  }

  function symbolicMarkup(fractions) {
    if (fractions.length < 2) return `<div class="fra16-symbolic"><span class="fra16-route-icon">?</span></div>`;
    return `<div class="fra16-symbolic"><span>${fractionMarkup(fractions[0].value)}</span><strong aria-hidden="true">?</strong><span>${fractionMarkup(fractions[1].value)}</span></div>`;
  }

  function equalBarsMarkup(fractions, reveal) {
    const endpoint = reveal ? `<span class="fra16-shared-endpoint"><i></i><b>same endpoint</b></span>` : "";
    return `<div class="fra16-equal-bars">${fractions.map((item) => barMarkup(item.value)).join("")}${endpoint}</div>`;
  }

  function orderCanvasMarkup(fractions, reveal) {
    if (!reveal) return `<div class="fra16-order-canvas"><div class="fra16-direction"><span>LEAST</span><i></i><span>GREATEST</span></div><p>Move every card into this direction.</p></div>`;
    const denominator = fractions.reduce((value, item) => lcm(value, item.value.denominator), 1);
    return commonUnitTrackMarkup(fractions, denominator, true);
  }

  function repairMarkup(model) {
    const repair = model.canonicalRepair;
    const fractions = questionFractions(model);
    if (!repair) return equivalentBarsMarkup(fractions, model.visual?.commonDenominator, true);
    if (repair.id === "R-DEN") {
      const values = [{ id: "two_fifths", value: { numerator: 2, denominator: 5, display: "2/5" } }, { id: "three_eighths", value: { numerator: 3, denominator: 8, display: "3/8" } }];
      return equivalentBarsMarkup(values, 40, false);
    }
    if (repair.id === "R-EQUIV") {
      const values = [{ id: "two_thirds", value: { numerator: 2, denominator: 3, display: "2/3" } }, { id: "three_fifths", value: { numerator: 3, denominator: 5, display: "3/5" } }];
      return equivalentBarsMarkup(values, 15, true);
    }
    if (repair.id === "R-SYMBOL") {
      const values = [{ id: "seven_ninths", value: { numerator: 7, denominator: 9, display: "7/9" } }, { id: "five_sixths", value: { numerator: 5, denominator: 6, display: "5/6" } }];
      return `${equivalentBarsMarkup(values, 18, true)}<div class="fra16-symbol-guide"><span>point</span><strong>&lt;</strong><span>open side</span></div>`;
    }
    const values = fractions.length ? fractions : [{ id: "seven_twelfths", value: NAMED_FRACTIONS.seven_twelfths }, { id: "three_fifths", value: NAMED_FRACTIONS.three_fifths }];
    return equivalentBarsMarkup(values, model.visual?.commonDenominator || 60, true);
  }

  function workedMarkup(model, fractions) {
    const question = model.canonicalQuestion;
    const steps = question?.workedCheck?.visibleSteps || [];
    let visual;
    if (question?.id === "M4" || question?.id === "RF-B") visual = benchmarkMarkup(fractions, true);
    else if (question?.id === "M2" || question?.id === "RF-EQ") visual = equalBarsMarkup(fractions, true);
    else if (question?.response?.kind === "order_cards") visual = orderCanvasMarkup(fractions, true);
    else {
      const denominators = fractions.map((item) => item.value.denominator);
      const common = denominators.reduce((value, item) => lcm(value, item), 1);
      visual = equivalentBarsMarkup(fractions, common, true);
    }
    return `<div class="fra16-worked">${visual}<ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>`;
  }

  function modelFrom(visual, context) {
    return context?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function renderMarkup(visual, context) {
    const ctx = context || {};
    const model = modelFrom(visual, ctx);
    const feedback = ctx.feedback || "initial";
    const reveal = ["correct", "support", "worked"].includes(feedback);
    const fractions = questionFractions(model);
    if (model.canonicalRepair) return repairMarkup(model);
    if (model.canonicalQuestion && reveal && model.canonicalQuestion.workedCheck) return workedMarkup(model, fractions);
    const kind = model.kind || model.visual?.kind;
    if (kind === "progress_bars") return progressHookMarkup();
    if (kind === "fraction_bars") return equivalentBarsMarkup(fractions, null, false);
    if (kind === "equivalent_fraction_bars") return equivalentBarsMarkup(fractions, model.visual?.commonDenominator || model.commonDenominator, Boolean(model.visual?.showEquivalentFormsBeforeSubmit || reveal));
    if (kind === "benchmark_bars") return benchmarkMarkup(fractions, reveal && Boolean(model.canonicalQuestion));
    if (kind === "common_unit_order_track") return commonUnitTrackMarkup(fractions, model.visual?.commonDenominator || 24, true);
    if (kind === "above_one_fraction_bars") return equivalentBarsMarkup(fractions, model.visual?.commonDenominator || 24, true);
    if (kind === "visual_equal_bars") return equalBarsMarkup(fractions, false);
    if (kind === "order_cards") return orderCanvasMarkup(fractions, false);
    if (kind === "reasoning_pair" || kind === "symbolic_pair") {
      if (model.canonicalScene?.id === "HANDOFF") return handoffMarkup();
      return symbolicMarkup(fractions);
    }
    return fractions.length ? symbolicMarkup(fractions) : handoffMarkup();
  }

  function accessibleDescription(model, context) {
    const reveal = ["correct", "support", "worked"].includes(context?.feedback);
    if (reveal && model?.canonicalQuestion?.workedCheck?.visibleSteps?.length) {
      return `Worked check after the answer was locked. ${model.canonicalQuestion.workedCheck.visibleSteps.join(" ")}`;
    }
    return model?.accessibleDescription || model?.visual?.accessibleDescriptionBeforeSubmit || "A fair fraction-comparison model using equal-sized wholes.";
  }

  window.RevilyFra16Visuals = { accessibleDescription, fractionMarkup, renderMarkup };
})();
