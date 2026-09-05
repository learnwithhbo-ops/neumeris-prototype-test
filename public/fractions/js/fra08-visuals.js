(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(numerator, denominator, className) {
    const n = numerator === "missing" || numerator === "input" ? "?" : numerator;
    const d = denominator === "missing" || denominator === "input" ? "?" : denominator;
    return `<span class="fra08-fraction ${className || ""}" aria-hidden="true"><b>${escapeHtml(n)}</b><i></i><b>${escapeHtml(d)}</b></span>`;
  }

  function blocks(total, lit, className) {
    const safeTotal = Math.max(1, Number(total) || 1);
    const safeLit = Math.max(0, Math.min(safeTotal, Number(lit) || 0));
    return `<div class="fra08-block-row ${className || ""}" style="--fra08-parts:${safeTotal}" aria-hidden="true">${Array.from({ length: safeTotal }, (_, index) => `<i class="${index < safeLit ? "is-lit" : ""}"></i>`).join("")}</div>`;
  }

  function trackerMarkup(model, reveal) {
    const original = model.original || {};
    const redesigned = model.redesigned || {};
    const revealedLit = model.revealLitBlocks ?? model.answer?.value ?? (original.litBlocks * ((redesigned.totalBlocks || 1) / (original.totalBlocks || 1)));
    const lit = reveal ? revealedLit : redesigned.litBlocksBeforeSubmit;
    const showGuide = model.showEndpointGuideBeforeSubmit || reveal;
    const sceneClass = model.sceneId ? ` scene-${String(model.sceneId).toLowerCase()}` : "";
    return `<div class="fra08-tracker${reveal ? " is-revealed" : ""}${sceneClass}">
      <div class="fra08-tracker-stack">
        <div class="fra08-tracker-row"><span>${original.litBlocks}/${original.totalBlocks}</span>${blocks(original.totalBlocks, original.litBlocks, "fra08-original-row")}</div>
        <div class="fra08-tracker-row fra08-redesigned"><span>${lit === null || lit === undefined ? `?/${redesigned.totalBlocks}` : `${lit}/${redesigned.totalBlocks}`}</span>${blocks(redesigned.totalBlocks, lit, "fra08-redesigned-row")}</div>
        ${showGuide ? `<div class="fra08-endpoint-layer" aria-hidden="true"><i class="fra08-endpoint-guide" style="left:${(Number(original.litBlocks) / Number(original.totalBlocks)) * 100}%"></i></div>` : ""}
      </div>
      <p class="fra08-visual-key"><span></span>Marked progress <i></i>Same endpoint</p>
    </div>`;
  }

  function operationSymbol(operation) {
    return operation === "divide" ? "÷" : "×";
  }

  function equationMarkup(model, reveal) {
    const left = model.left || {};
    const right = model.right || {};
    const answer = model.answer || {};
    const answerValue = answer.kind === "integer" ? answer.value : null;
    const rightN = reveal && right.numerator === "missing" ? answerValue : right.numerator;
    const rightD = reveal && right.denominator === "missing" ? answerValue : right.denominator;
    const cue = model.suppliedFactorCue || (reveal && model.factor ? { operation: model.operation, factor: model.factor } : null);
    const contrast = model.sceneId === "T5" ? `<div class="fra08-one-side-contrast"><strong>Changing one number changes the value</strong><div>${fraction(3, 5)}<span>≠</span>${fraction(3, 10)}</div></div>` : "";
    return `<div class="fra08-equation-visual${reveal ? " is-revealed" : ""}">
      <div class="fra08-equation">${fraction(left.numerator, left.denominator, "fra08-left-fraction")}<span class="fra08-relation">${escapeHtml(model.relation || "=")}</span>${fraction(rightN, rightD, "fra08-right-fraction")}</div>
      ${cue ? `<div class="fra08-factor-cue" aria-hidden="true"><span>${operationSymbol(cue.operation)} ${escapeHtml(cue.factor)}</span><span>${operationSymbol(cue.operation)} ${escapeHtml(cue.factor)}</span></div>` : ""}
      ${contrast}
    </div>`;
  }

  function buildMarkup(model, reveal) {
    const source = model.source || {};
    const instruction = model.instruction || {};
    const answer = model.answer?.value || {};
    const target = model.target || {};
    const targetN = reveal ? answer.numerator : target.numerator;
    const targetD = reveal ? answer.denominator : target.denominator;
    return `<div class="fra08-build-visual${reveal ? " is-revealed" : ""}">
      <div class="fra08-build-equation">${fraction(source.numerator, source.denominator)}<span class="fra08-build-arrow" aria-hidden="true">→</span>${fraction(targetN, targetD)}</div>
      <div class="fra08-build-instruction"><span>${operationSymbol(instruction.operation)} ${escapeHtml(instruction.factor)}</span><strong>on both numbers</strong></div>
    </div>`;
  }

  function ribbonMarkup(model, reveal) {
    const original = model.original || {};
    const originalLit = original.colouredParts ?? original.numerator;
    const originalTotal = original.totalParts ?? original.denominator;
    const total = Number(model.newDenominator) || 1;
    const answer = Number(model.answer?.value);
    const lit = reveal ? answer : model.colouredPartsBeforeSubmit;
    return `<div class="fra08-ribbon-visual${reveal ? " is-revealed" : ""}">
      <div class="fra08-ribbon-stack">
        <div class="fra08-tracker-row"><span>${originalLit}/${originalTotal}</span>${blocks(originalTotal, originalLit, "fra08-original-row")}</div>
        <div class="fra08-tracker-row"><span>${lit === null || lit === undefined ? `?/${total}` : `${lit}/${total}`}</span>${blocks(total, lit, "fra08-redesigned-row")}</div>
      </div>
    </div>`;
  }

  function optionsMarkup(model, reveal) {
    const correctId = model.answer?.optionId;
    return `<div class="fra08-reasoning-visual${reveal ? " is-revealed" : ""}">
      <div class="fra08-reason-source"><span>Starting fraction</span>${fraction(model.source?.numerator, model.source?.denominator)}</div>
      <div class="fra08-option-models">${(model.options || []).map((option) => `<div class="fra08-option-model${reveal && option.id === correctId ? " is-correct" : ""}"><span>${escapeHtml(option.id)}</span>${fraction(option.fraction?.numerator, option.fraction?.denominator)}</div>`).join("")}</div>
    </div>`;
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const reveal = ["correct", "worked"].includes(context?.feedback) || (!context?.question && model.sceneId !== "HOOK");
    if (model.kind === "progress_tracker") return trackerMarkup(model, reveal);
    if (model.kind === "fraction_equation") return equationMarkup(model, reveal);
    if (model.kind === "fraction_build") return buildMarkup(model, reveal);
    if (model.kind === "ribbon") return ribbonMarkup(model, reveal);
    if (model.kind === "reasoning_options") return optionsMarkup(model, reveal);
    return `<div class="fra08-visual-placeholder">${fraction(3, 5)}<span>=</span>${fraction(6, 10)}</div>`;
  }

  function accessibleDescription(model, context) {
    const item = model || {};
    const reveal = ["correct", "worked"].includes(context?.feedback);
    if (!context?.question) return item.authorOnlyAccessibleDescription || "An equivalent-fraction model keeps the whole width and represented value fixed.";
    if (item.kind === "fraction_equation") {
      const side = item.right || {};
      const missing = side.numerator === "missing" ? "a missing numerator" : side.denominator === "missing" ? "a missing denominator" : `${side.numerator} over ${side.denominator}`;
      const answer = reveal && item.answer?.kind === "integer" ? ` The missing value is now shown as ${item.answer.value}.` : "";
      return `An equation shows ${item.left.numerator} over ${item.left.denominator} equal to ${missing}.${answer}`;
    }
    if (item.kind === "fraction_build") return `The starting fraction is ${item.source.numerator} over ${item.source.denominator}. The instruction applies ${operationSymbol(item.instruction.operation)} ${item.instruction.factor} to both numbers. ${reveal ? "The completed target fraction is shown." : "The numerator and denominator answer fields are empty."}`;
    if (item.kind === "progress_tracker") return `A tracker has ${item.original.litBlocks} of ${item.original.totalBlocks} blocks marked. A same-width tracker has ${item.redesigned.totalBlocks} equal blocks. ${reveal ? "The matching marked endpoint is shown." : "The new marked count is not shown."}`;
    if (item.kind === "ribbon") return `A ribbon shows ${item.original.colouredParts ?? item.original.numerator} of ${item.original.totalParts ?? item.original.denominator} parts coloured. A same-width ribbon has ${item.newDenominator} equal parts. ${reveal ? "The matching coloured endpoint is shown." : "The new coloured count is not shown."}`;
    if (item.kind === "reasoning_options") return `The source fraction is ${item.source.numerator} over ${item.source.denominator}. Options are ${(item.options || []).map((option) => `${option.id}, ${option.label}`).join("; ")}. No option is preselected.`;
    return "A visual model for an equivalent-fraction question.";
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const cueId = event.detail?.id;
      if (cueId) container.querySelector(".fra08-visual")?.setAttribute("data-fra08-cue", cueId);
    });
  }

  window.RevilyFra08Visuals = { accessibleDescription, bind, renderMarkup };
})();
