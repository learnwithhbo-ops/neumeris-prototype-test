(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(numerator, denominator, className) {
    return `<span class="fra20-fraction ${className || ""}" aria-hidden="true"><b>${escapeHtml(numerator)}</b><i></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function equation(math, reveal, options) {
    if (!math) return "";
    const settings = options || {};
    const result = reveal ? fraction(math.differenceNumerator, math.denominator, "fra20-result") : `<span class="fra20-question-mark" aria-label="answer hidden">?</span>`;
    if (settings.missingStart) {
      return `<div class="fra20-equation"><span class="fra20-missing-box">?</span><span class="fra20-over-denominator">/${escapeHtml(math.denominator)}</span><span>−</span>${fraction(math.removeNumerator, math.denominator)}<span>=</span>${fraction(math.differenceNumerator, math.denominator)}</div>`;
    }
    return `<div class="fra20-equation">${fraction(math.startNumerator, math.denominator, "fra20-start-fraction")}<span>−</span>${fraction(math.removeNumerator, math.denominator, "fra20-remove-fraction")}<span>=</span>${result}</div>`;
  }

  function stripCells(visual, options) {
    const settings = options || {};
    const total = Math.max(1, Number(visual.denominator) || 1);
    const start = Math.max(0, Number(visual.startSelected) || 0);
    const removed = Math.max(0, Number(visual.removedSelected) || 0);
    const remaining = Math.max(0, start - removed);
    const reveal = settings.reveal === true;
    const selectable = settings.selectable === true;
    return `<div class="fra20-strip${settings.vertical ? " is-vertical" : ""}${total > 12 ? " is-compact" : ""}" style="--fra20-parts:${total}" aria-hidden="${selectable ? "false" : "true"}">${Array.from({ length: total }, (_, index) => {
      const wasSelected = index < start;
      const isRemoved = index >= remaining && index < start;
      const remains = index < remaining;
      const state = wasSelected ? (isRemoved ? " is-removed" : " is-selected") : "";
      const post = reveal && isRemoved ? " is-drained" : "";
      const selectAttrs = selectable
        ? ` role="button" tabindex="0" data-fra20-cell="${index}" aria-label="Section ${index + 1}, ${remains ? "still selected" : isRemoved ? "marked removed" : "empty"}" aria-pressed="false"`
        : "";
      return `<i class="fra20-cell${state}${post}"${selectAttrs}><span>${index + 1}</span></i>`;
    }).join("")}</div>`;
  }

  function worked(model, reveal) {
    const steps = model?.workedSteps || [];
    if (!reveal || !steps.length) return "";
    return `<ol class="fra20-working" aria-label="Working shown after the answer was locked">${steps.map((step, index) => `<li style="--fra20-step:${index}"><span>Step ${index + 1}</span><b>${escapeHtml(step)}</b></li>`).join("")}</ol>`;
  }

  function tankMarkup(visual, reveal, model, sceneId) {
    const math = model.math || {
      startNumerator: visual.startSelected,
      removeNumerator: visual.removedSelected,
      denominator: visual.denominator,
      differenceNumerator: Number(visual.startSelected || 0) - Number(visual.removedSelected || 0)
    };
    const hook = ["HOOK", "HOOK-CHOICE"].includes(sceneId || model.questionId);
    return `<div class="fra20-tank-scene${hook ? " is-hook" : ""}${reveal ? " is-revealed" : ""}">
      <div class="fra20-tank-label"><strong>START</strong><span>${math.startNumerator}/${math.denominator}</span><strong>REMOVE</strong><span>${math.removeNumerator}/${math.denominator}</span></div>
      <div class="fra20-tank-shell"><span class="fra20-tank-rim"></span>${stripCells(visual, { vertical: true, reveal })}</div>
      ${hook ? `<div class="fra20-student-claim"><small>Student's claim</small><span>${fraction(9, 11)} − ${fraction(4, 11)} = ${fraction(5, 0)}</span></div>` : equation(math, reveal)}
      ${reveal ? `<p class="fra20-invariant">The water level changed. The <b>${math.denominator}</b>-band scale did not.</p>` : ""}
      ${worked(model, reveal)}
    </div>`;
  }

  function directionMarkup(visual) {
    return `<div class="fra20-direction"><div class="fra20-direction-cards"><article><strong>START</strong>${fraction(visual.startSelected, visual.denominator)}</article><span class="fra20-remove-arrow">− ${escapeHtml(visual.removedSelected)} parts →</span><article><strong>REMOVE</strong>${fraction(visual.removedSelected, visual.denominator)}</article></div>${stripCells(visual, { vertical: true })}<p>start count − removed count</p></div>`;
  }

  function countbackMarkup(visual) {
    const start = Number(visual.startSelected);
    const removed = Number(visual.removedSelected);
    const denominator = Number(visual.denominator);
    const result = Number.isFinite(Number(visual.resultSelected)) ? Number(visual.resultSelected) : start - removed;
    const countValues = Array.from({ length: Math.max(0, removed) + 1 }, (_, index) => start - index);
    const denominatorName = ({ 9: "ninths", 11: "elevenths", 13: "thirteenths", 14: "fourteenths", 16: "sixteenths" })[denominator] || `parts out of ${denominator}`;
    const countback = countValues.map((value, index) => `${index === countValues.length - 1 ? "<strong>" : "<b>"}${escapeHtml(value)}${index === countValues.length - 1 ? "</strong>" : "</b>"}${index < countValues.length - 1 ? "<i>→</i>" : ""}`).join("");
    return `<div class="fra20-countback"><div class="fra20-countback-values" aria-label="Count back ${removed} from ${start}">${countback}</div>${stripCells(visual, { vertical: true, reveal: true })}${equation({ startNumerator: start, removeNumerator: removed, denominator, differenceNumerator: result }, true)}<p class="fra20-denominator-anchor">${escapeHtml(denominatorName)} stay ${escapeHtml(denominatorName)}</p></div>`;
  }

  function compactMethodMarkup() {
    return `<div class="fra20-compact-method">${stripCells({ denominator: 12, startSelected: 7, removedSelected: 2 }, { reveal: true })}${equation({ startNumerator: 7, removeNumerator: 2, denominator: 12, differenceNumerator: 5 }, true)}<div class="fra20-method-row"><span>7 − 2 = 5</span><span>keep 12</span><strong>5/12 &lt; 7/12</strong></div></div>`;
  }

  function symbolicMarkup(visual, reveal, model) {
    const math = model.math || {};
    const missing = model.questionId === "M3" || String(model.questionId || "").startsWith("RF-M");
    const visibleStart = missing && !reveal ? "?" : (math.startNumerator ?? "?");
    return `<div class="fra20-symbolic">${equation(math, reveal, { missingStart: missing })}<div class="fra20-structure-chips"><span>START ${escapeHtml(visibleStart)}</span><span>REMOVE ${escapeHtml(math.removeNumerator ?? "?")}</span><span>KEEP ${escapeHtml(math.denominator ?? "")}</span></div>${worked(model, reveal)}</div>`;
  }

  function contextMarkup(visual, reveal, model) {
    const kind = visual.kind;
    const label = kind === "cable" ? "1 metre cable" : kind === "timeline" ? "film timeline" : kind === "board" ? "section board" : "equal-part whole";
    return `<div class="fra20-context"><div class="fra20-context-label"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(visual.denominator)} equal sections</span></div>${stripCells(visual, { reveal })}${equation(model.math, reveal)}${worked(model, reveal)}</div>`;
  }

  function modelOptionsMarkup(visual, reveal, model) {
    return `<div class="fra20-model-options"><div class="fra20-model-source"><strong>Before</strong>${stripCells(visual, { reveal: false })}</div>${reveal ? `<div class="fra20-model-result"><strong>After</strong>${stripCells({ denominator: visual.denominator, startSelected: visual.resultSelected, removedSelected: 0 }, { reveal: true })}${fraction(visual.resultSelected, visual.denominator)}</div>` : `<p>Choose the after-model below.</p>`}${worked(model, reveal)}</div>`;
  }

  function repairMarkup(visual, reveal, model) {
    if (model.questionId === "R-ADD") return `<div class="fra20-repair"><strong>Subtraction moves back</strong>${countbackMarkup(visual)}</div>`;
    if (model.questionId === "R-ORDER") return `<div class="fra20-repair">${directionMarkup(visual)}</div>`;
    if (model.questionId === "R-RENAME") return `<div class="fra20-repair"><div class="fra20-route-contrast"><article><strong>Direct</strong>${fraction(9, 13)} − ${fraction(4, 13)} = ${fraction(5, 13)}</article><article><span>Unneeded detour</span>${fraction(18, 26)} − ${fraction(8, 26)}</article></div></div>`;
    if (["R-ARITH", "R-UNKNOWN"].includes(model.questionId)) {
      return `<div class="fra20-repair"><div class="fra20-route-contrast"><article><strong>Same part size</strong>${fraction("a", "d")} − ${fraction("b", "d")} = ${fraction("a − b", "d")}</article></div></div>`;
    }
    return tankMarkup(visual, true, model, model.questionId);
  }

  function sectionTapMarkup(visual, model) {
    return `<div class="fra20-cell-tap"><p>Tap every section that remains selected.</p>${stripCells(visual, { selectable: true, reveal: true })}<div class="fra20-tap-status" aria-live="polite">0 sections tapped</div>${worked(model, false)}</div>`;
  }

  function handoffMarkup() {
    return `<div class="fra20-handoff"><span>START</span><i aria-hidden="true">→</i><span>REMOVE</span><i aria-hidden="true">→</i><strong>KEEP PART SIZE</strong><div><b>Learn the idea</b><i></i><b>Try it with me</b></div></div>`;
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const authoredVisual = model.visual || {};
    const kind = authoredVisual.kind;
    const reveal = ["correct", "worked", "support"].includes(context?.feedback);
    const sceneId = model.sceneId || model.questionId;
    if (kind === "tank") return tankMarkup(authoredVisual, reveal, model, sceneId);
    if (kind === "direction") return directionMarkup(authoredVisual);
    if (kind === "tank_countback") return countbackMarkup(authoredVisual);
    if (kind === "compact_method") return compactMethodMarkup();
    if (kind === "handoff") return handoffMarkup();
    if (kind === "model_options") return modelOptionsMarkup(authoredVisual, reveal, model);
    if (["cable", "timeline", "board", "status_bar", "display", "strip"].includes(kind)) return contextMarkup(authoredVisual, reveal, model);
    if (context?.question?.response?.type === "fra20_cell_tap_integer") return sectionTapMarkup(authoredVisual, model);
    if (String(model.questionId || "").startsWith("R-") && !String(model.questionId || "").endsWith("-S") && !String(model.questionId || "").endsWith("-C")) return repairMarkup(authoredVisual, reveal, model);
    return symbolicMarkup(authoredVisual, reveal, model);
  }

  function accessibleDescription(model, context) {
    const visual = model?.visual || {};
    const reveal = ["correct", "worked", "support"].includes(context?.feedback);
    const before = model?.accessibleDescription || "A same-denominator subtraction model. The requested result is hidden.";
    if (!reveal || !model?.math) return before;
    return `${before} After the answer was locked, the worked result ${model.math.differenceNumerator}/${model.math.denominator} is shown.`;
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const visual = container.querySelector(".fra20-visual");
      if (visual && event.detail?.id) visual.setAttribute("data-fra20-cue", event.detail.id);
    });
    const updateStatus = () => {
      const selected = [...container.querySelectorAll("[data-fra20-cell][aria-pressed=true]")];
      const status = container.querySelector(".fra20-tap-status");
      if (status) status.textContent = `${selected.length} section${selected.length === 1 ? "" : "s"} tapped`;
      const input = container.closest(".lesson-shell")?.querySelector("#integer-answer");
      if (input) {
        input.value = String(selected.length);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };
    container.querySelectorAll("[data-fra20-cell]").forEach((cell) => {
      const toggle = () => {
        if (cell.getAttribute("aria-disabled") === "true") return;
        const pressed = cell.getAttribute("aria-pressed") === "true";
        cell.setAttribute("aria-pressed", String(!pressed));
        cell.classList.toggle("is-tapped", !pressed);
        updateStatus();
      };
      cell.addEventListener("click", toggle);
      cell.addEventListener("keydown", (event) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          toggle();
        }
      });
    });
  }

  window.RevilyFra20Visuals = { accessibleDescription, bind, renderMarkup };
})();
