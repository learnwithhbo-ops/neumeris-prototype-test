(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  function modelFor(visual, ctx) {
    if (visual?.context === "fra22") return visual;
    return ctx?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function fractionMarkup(numerator, denominator, className) {
    return `<span class="fra22-fraction ${escapeHtml(className || "")}" aria-label="${escapeHtml(numerator)} over ${escapeHtml(denominator)}"><b>${escapeHtml(numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function cells(total, selected, options) {
    const opts = options || {};
    return Array.from({ length: total }, (_, index) => {
      const selectedCell = index < selected;
      const removed = (opts.removed || []).includes(index);
      return `<i class="${selectedCell ? "is-selected" : ""}${removed ? " is-removed" : ""}" aria-hidden="true"></i>`;
    }).join("");
  }

  function battery(total, selected, options) {
    const opts = options || {};
    return `<div class="fra22-battery ${escapeHtml(opts.className || "")}" style="--fra22-parts:${total}" aria-hidden="true"><span class="fra22-battery-body">${cells(total, selected, opts)}</span><b></b></div>`;
  }

  function labelledBar(numerator, denominator, label, options) {
    return `<div class="fra22-labelled-bar ${escapeHtml(options?.className || "")}"><strong>${escapeHtml(label)}</strong>${battery(denominator, numerator, options)}${fractionMarkup(numerator, denominator)}</div>`;
  }

  function hookMarkup() {
    return `<div class="fra22-scene fra22-hook" data-scene="HOOK" aria-hidden="true">
      <div class="fra22-hook-start"><span class="fra22-chip">START CHARGE</span>${battery(6, 5, { className: "battery-sixths" })}${fractionMarkup(5, 6)}</div>
      <div class="fra22-quarter-use"><span>render uses ${fractionMarkup(1, 4)}</span><i></i><b>one quarter of full capacity</b></div>
      <div class="fra22-wrong-method"><strong>subtract top and bottom?</strong><div><span>(5 − 1)</span><i></i><span>(6 − 4)</span><b>=</b>${fractionMarkup(4, 2)}</div><div class="fra22-impossible-batteries">${battery(1, 1)}${battery(1, 1)}</div><em>Impossible</em></div>
    </div>`;
  }

  function t1Markup() {
    return `<div class="fra22-scene fra22-pieces" data-scene="T1" aria-hidden="true">
      ${labelledBar(5, 6, "Six equal pieces", { className: "fra22-sixths-row" })}
      ${labelledBar(1, 4, "Four equal pieces", { className: "fra22-quarters-row" })}
      <div class="fra22-shared-target"><i></i><strong>one shared piece size</strong><i></i></div>
    </div>`;
  }

  function multipleTrack(step, values, className) {
    return `<div class="fra22-multiple-track ${escapeHtml(className)}"><strong>multiples of ${step}</strong><div>${values.map((value) => `<span class="${value === 12 ? "is-meeting" : ""}" data-value="${value}">${value}</span>`).join("")}</div></div>`;
  }

  function t2Markup() {
    return `<div class="fra22-scene fra22-multiples" data-scene="T2" aria-hidden="true">
      ${multipleTrack(6, [6, 12, 18, 24], "track-six")}
      <span class="fra22-meeting-line"></span>
      ${multipleTrack(4, [4, 8, 12, 16, 20, 24], "track-four")}
      <strong class="fra22-common-label">COMMON DENOMINATOR</strong>
    </div>`;
  }

  function t3Markup() {
    return `<div class="fra22-scene fra22-rename" data-scene="T3" aria-hidden="true">
      <div class="fra22-rename-row sixths-to-twelfths">${labelledBar(5, 6, "Split each sixth into 2", { className: "source-bar" })}<b>×2</b>${labelledBar(10, 12, "Same amount in twelfths", { className: "target-bar" })}<strong>${fractionMarkup(5, 6)} = ${fractionMarkup(10, 12)}</strong></div>
      <div class="fra22-rename-row quarters-to-twelfths">${labelledBar(1, 4, "Split each quarter into 3", { className: "source-bar" })}<b>×3</b>${labelledBar(3, 12, "Same amount in twelfths", { className: "target-bar" })}<strong>${fractionMarkup(1, 4)} = ${fractionMarkup(3, 12)}</strong></div>
      <p class="fra22-factor-note">same factor on numerator and denominator</p>
    </div>`;
  }

  function t4Markup() {
    return `<div class="fra22-scene fra22-remove" data-scene="T4" aria-hidden="true">
      <div class="fra22-order-line"><span>start</span>${fractionMarkup(10, 12)}<b>−</b>${fractionMarkup(3, 12)}<i></i><span>removed</span></div>
      ${battery(12, 10, { className: "battery-twelfths", removed: [7, 8, 9] })}
      <div class="fra22-result-line">${fractionMarkup(10, 12, "before-count")}<b>−</b>${fractionMarkup(3, 12)}<b>=</b>${fractionMarkup(7, 12, "after-count")}</div>
      <p><strong>12</strong> stays fixed: the piece size is still twelfths.</p>
    </div>`;
  }

  function routeCard(title, denominator, left, right, result, className) {
    return `<div class="fra22-route-card ${escapeHtml(className)}"><span>${escapeHtml(title)}</span>${battery(denominator, left)}<div>${fractionMarkup(left, denominator)} − ${fractionMarkup(right, denominator)} = ${fractionMarkup(result, denominator)}</div></div>`;
  }

  function t5Markup() {
    return `<div class="fra22-scene fra22-two-routes" data-scene="T5" aria-hidden="true">
      ${routeCard("Twelfths — quicker", 12, 10, 3, 7, "route-twelve")}
      ${routeCard("Twenty-fourths — also exact", 24, 20, 6, 14, "route-twenty-four")}
      <div class="fra22-equivalence-link">${fractionMarkup(7, 12)}<i></i><span>same exact amount</span><i></i>${fractionMarkup(14, 24)}</div>
    </div>`;
  }

  function handoffMarkup() {
    return `<div class="fra22-scene fra22-handoff" data-scene="HANDOFF" aria-hidden="true"><div><span>1</span><strong>Match the parts</strong></div><b>→</b><div><span>2</span><strong>Rename both fractions</strong></div><b>→</b><div><span>3</span><strong>Subtract in order</strong></div><b>→</b><div><span>4</span><strong>Keep the common denominator</strong></div></div>`;
  }

  function workedMarkup(question) {
    const steps = question?.workedCheck?.visibleSteps || [];
    if (!steps.length) return "";
    return `<ol class="fra22-worked-steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
  }

  function contextVisual(question) {
    const kind = question.visual?.kind;
    if (kind === "coolant_tank_context") {
      return `<div class="fra22-context-object coolant"><div class="fra22-tank"><i style="--fill:.875"></i><span>7/8 full</span></div><b>− 1/6 of full capacity</b></div>`;
    }
    if (kind === "cable_reel_context") {
      return `<div class="fra22-context-object cable"><div class="fra22-reel"><i></i><b>7/8 m left</b></div><span class="fra22-cut">1/3 m used</span></div>`;
    }
    if (String(question.id).includes("CONTEXT")) {
      return `<div class="fra22-context-object reservoir"><div class="fra22-tank"><i style="--fill:.8"></i><span>4/5 full</span></div><b>− 1/6 of full capacity</b></div>`;
    }
    return "";
  }

  function questionMarkup(question, reveal) {
    const supporting = question.supportingVisibleText || [];
    const math = question.math;
    const expression = supporting.find((line) => /\d+\s*\/\s*\d+/.test(line)) || (math ? math.canonicalExpression : "") || supporting[0] || "";
    const context = contextVisual(question);
    const methodChoices = "";
    const fixedForm = question.answer?.kind === "fields"
      ? `<div class="fra22-fixed-working"><span>${fractionMarkup("?", question.answer.fixedDenominator || "?")}</span><b>−</b><span>${fractionMarkup(question.id === "M3" ? 5 : "?", question.answer.fixedDenominator || "?")}</span><b>=</b><span>${fractionMarkup("?", question.answer.fixedDenominator || "?")}</span></div>`
      : "";
    return `<div class="fra22-question-visual" data-question="${escapeHtml(question.id)}" data-reveal="${reveal}" aria-hidden="true">
      ${context || `<div class="fra22-expression">${escapeHtml(expression || question.prompt)}</div>`}
      ${fixedForm}${methodChoices}
      ${reveal ? workedMarkup(question) : ""}
    </div>`;
  }

  const repairExamples = {
    DIRECT: { title: "Match the pieces before subtracting", expression: "2/3 − 1/4", steps: ["2/3 = 8/12", "1/4 = 3/12", "8/12 − 3/12 = 5/12"] },
    SCALE: { title: "Use one factor on top and bottom", expression: "3/5 = ?/20", steps: ["5 × 4 = 20", "3 × 4 = 12", "3/5 = 12/20"] },
    COMMON: { title: "The denominator must fit both", expression: "quarters and sixths", steps: ["18 fits sixths", "18 does not fit quarters", "12 and 24 fit both"] },
    ORDER: { title: "Keep subtraction direction", expression: "14/20 − 5/20", steps: ["start amount − removed amount", "14 − 5 = 9", "result: 9/20"] },
    DEN_KEEP: { title: "Keep the piece size", expression: "15/18 − 4/18", steps: ["15 − 4 = 11", "the denominator stays 18", "result: 11/18"] }
  };

  function repairMarkup(model) {
    const family = model.repair?.errorFamily || model.visual?.family || model.questionId?.replace("R-", "") || "DIRECT";
    const example = repairExamples[family] || repairExamples.DIRECT;
    return `<div class="fra22-repair-card" data-family="${escapeHtml(family)}" aria-hidden="true"><span>QUICK REPAIR</span><h2>${escapeHtml(example.title)}</h2><strong>${escapeHtml(example.expression)}</strong><ol>${example.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>`;
  }

  function renderMarkup(visual, ctx) {
    const model = modelFor(visual, ctx);
    const reveal = ["correct", "worked"].includes(ctx?.feedback);
    const sceneId = model.sceneId || "";
    let markup;
    if (model.repair) markup = repairMarkup(model);
    else if (ctx?.question?.canonicalQuestion) markup = questionMarkup(ctx.question.canonicalQuestion, reveal);
    else if (sceneId === "HOOK") markup = hookMarkup();
    else if (sceneId === "T1") markup = t1Markup();
    else if (sceneId === "T2") markup = t2Markup();
    else if (sceneId === "T3") markup = t3Markup();
    else if (sceneId === "T4") markup = t4Markup();
    else if (sceneId === "T5") markup = t5Markup();
    else markup = handoffMarkup();
    return `<div class="fra22-visual" data-scene="${escapeHtml(sceneId)}" data-reveal="${reveal}">${markup}</div>`;
  }

  function accessibleDescription(visual, ctx) {
    const model = modelFor(visual, ctx);
    if (ctx?.question?.canonicalQuestion?.accessibleDescription) return ctx.question.canonicalQuestion.accessibleDescription;
    if (model.accessibleDescription) return model.accessibleDescription;
    const scene = model.scene;
    if (scene?.id === "HOOK") return "A six-cell battery shows five sixths charge and a bracket shows one quarter of the same full capacity. The invalid direct subtraction produces four halves, an impossible amount larger than the start.";
    if (scene?.id === "T4") return "A bar of twelve equal cells starts with ten selected. Three are removed in the original order, leaving seven twelfths while the denominator stays twelve.";
    return scene?.authorOnlyPurpose || "An exact unlike-denominator subtraction model using equal-sized parts.";
  }

  window.RevilyFra22Visuals = { accessibleDescription, renderMarkup };
})();
