(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  function modelFor(visual, ctx) {
    if (visual?.context === "fra14_whole_from_part") return visual;
    return ctx?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function fractionMarkup(numerator, denominator) {
    return `<span class="fra14-fraction" aria-label="${numerator} over ${denominator}"><b>${numerator}</b><i aria-hidden="true"></i><b>${denominator}</b></span>`;
  }

  function sectionMarkup(model, reveal, sceneId) {
    const visual = model.visual || {};
    const math = model.math || {};
    const total = Math.max(1, Number(visual.totalSections || math.denominator || 1));
    const known = Math.max(0, Math.min(total, Number(visual.knownSpanSections || math.numerator || 0)));
    return Array.from({ length: total }, (_, index) => {
      const isKnown = index < known;
      const isHiddenFinish = !reveal && sceneId === "HOOK" && index >= known;
      const teachingVisible = (sceneId === "T3" && isKnown) || (sceneId === "T4" && isKnown);
      const value = math.expectedOnePart !== undefined ? `${math.expectedOnePart}${math.unitSymbol ? ` ${math.unitSymbol}` : ""}` : "";
      const visibleValue = reveal || teachingVisible;
      const stageValue = !visibleValue && model.mode !== "question" && value ? ` data-reveal-text="${escapeHtml(value)}"` : "";
      const label = `<b class="fra14-section-value${visibleValue ? "" : " is-hidden"}"${stageValue}>${visibleValue ? escapeHtml(value) : ""}</b>`;
      return `<span class="fra14-section${isKnown ? " is-known" : " is-unknown"}${isHiddenFinish ? " is-hidden-finish" : ""}" style="--section-index:${index}">${label}<i aria-hidden="true"></i></span>`;
    }).join("");
  }

  function barMarkup(model, reveal) {
    const visual = model.visual || {};
    const math = model.math || {};
    const total = Math.max(1, Number(visual.totalSections || math.denominator || 1));
    const known = Math.max(0, Math.min(total, Number(visual.knownSpanSections || math.numerator || 0)));
    const sceneId = model.sceneId || "";
    const knownLabel = visual.knownAmountLabel || `${known} known parts`;
    const wholeResult = math.expectedWhole !== undefined ? `${math.expectedWhole}${math.unitSymbol ? ` ${math.unitSymbol}` : ""}` : "";
    const stagedWhole = !reveal && ["T3", "T4", "R-SCALE", "R-ONEPART"].includes(sceneId) ? ` data-reveal-text="${escapeHtml(wholeResult)}"` : "";
    const contextClass = String(visual.kind || "generic_bar").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
    const onePart = math.expectedOnePart !== undefined ? `${math.knownAmount} ÷ ${math.numerator} = ${math.expectedOnePart}` : "";
    const whole = math.expectedWhole !== undefined ? `${math.expectedOnePart} × ${math.denominator} = ${math.expectedWhole}` : "";
    return `<div class="fra14-bar-card context-${escapeHtml(contextClass)} scene-${escapeHtml(String(sceneId).toLowerCase())}" data-scene="${escapeHtml(sceneId)}" data-reveal="${reveal}">
      <div class="fra14-context-mark" aria-hidden="true"><span></span><i></i></div>
      <div class="fra14-fraction-label">${fractionMarkup(known, total)} <span>of the whole</span></div>
      <div class="fra14-known-bracket" style="--known-span:${known};--total-sections:${total}"><span>${escapeHtml(knownLabel)}</span></div>
      <div class="fra14-bar" style="--total-sections:${total}">${sectionMarkup(model, reveal, sceneId)}</div>
      <div class="fra14-whole-bracket"><span class="fra14-whole-pending">${escapeHtml(visual.wholeLabel || "whole = ?")}</span><span class="fra14-whole-result"${stagedWhole}>${reveal ? escapeHtml(wholeResult) : ""}</span></div>
      ${workingMarkup(model, reveal, sceneId, onePart, whole)}
      <span class="fra14-finish" aria-hidden="true"></span>
    </div>`;
  }

  function stagedEquation(text, visible) {
    return `<strong${visible ? "" : ` data-reveal-text="${escapeHtml(text)}"`}>${visible ? escapeHtml(text) : ""}</strong>`;
  }

  function workingMarkup(model, reveal, sceneId, onePart, whole) {
    const teaching = model.mode === "teaching";
    const stagedRepair = ["R-ROLES", "R-SCALE", "R-ONEPART"].includes(sceneId);
    const show = reveal || (teaching && ["T2", "T3", "T4"].includes(sceneId)) || stagedRepair;
    if (!show) return "";
    const oneVisible = reveal || sceneId === "T3" || sceneId === "T4";
    const wholeVisible = reveal;
    return `<div class="fra14-working">
      <div class="fra14-work-step step-one"><small>One equal part</small>${stagedEquation(onePart, oneVisible)}</div>
      ${sceneId === "T2" ? "" : `<div class="fra14-work-step step-whole"><small>Rebuild the whole</small>${stagedEquation(whole, wholeVisible)}</div>`}
      ${sceneId === "T4" ? `<div class="fra14-forward-check"><small>Forward check</small>${stagedEquation("45 ÷ 5 = 9", reveal)}</div>` : ""}
    </div>`;
  }

  function handoffMarkup(model) {
    return `<div class="fra14-handoff"><div class="fra14-method-card"><span>Known amount</span><b aria-hidden="true">→</b><span>One equal part</span><b aria-hidden="true">→</b><span>Whole</span></div></div>${barMarkup(model, false)}`;
  }

  function renderMarkup(visual, ctx) {
    const model = modelFor(visual, ctx);
    const reveal = ["correct", "worked"].includes(ctx?.feedback);
    const sceneId = model.sceneId || "";
    const markup = sceneId === "HANDOFF" ? handoffMarkup(model) : barMarkup(model, reveal);
    return `<div class="fra14-visual" data-scene="${escapeHtml(sceneId)}" data-reveal="${reveal}" aria-hidden="true">${markup}</div>`;
  }

  function optionMarkup(model) {
    const total = Math.max(1, Number(model.totalSections || 1));
    const known = Math.max(0, Math.min(total, Number(model.knownSpanSections || 0)));
    return `<span class="fra14-option-model" aria-hidden="true"><b>${escapeHtml(model.label || "")}</b><span class="fra14-option-bar" style="--total-sections:${total}">${Array.from({ length: total }, (_, index) => `<i class="${index < known ? "is-known" : ""}"></i>`).join("")}</span><small>${escapeHtml(model.knownAmountLabel || "known part")}</small></span>`;
  }

  function accessibleDescription(visual, ctx) {
    const model = modelFor(visual, ctx);
    const reveal = ["correct", "worked"].includes(ctx?.feedback);
    if (reveal && model.math?.expectedWhole !== undefined) {
      const math = model.math;
      const unit = math.unitSymbol ? ` ${math.unitSymbol}` : "";
      return `An equal bar has ${math.denominator} sections. The known bracket spans ${math.numerator} and is labelled ${model.visual?.knownAmountLabel || math.knownAmount}. Working is revealed: ${math.knownAmount} divided by ${math.numerator} gives ${math.expectedOnePart}${unit} for one part; ${math.expectedOnePart} multiplied by ${math.denominator} gives the whole, ${math.expectedWhole}${unit}.`;
    }
    if (model.accessibleDescription) return model.accessibleDescription;
    const bar = model.visual || {};
    return `An equal bar has ${bar.totalSections || 0} sections. The known bracket spans ${bar.knownSpanSections || 0} and is labelled ${bar.knownAmountLabel || "known amount"}.`;
  }

  window.RevilyFra14Visuals = { accessibleDescription, optionMarkup, renderMarkup };
})();
