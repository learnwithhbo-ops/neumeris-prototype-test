(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(numerator, denominator, className) {
    return `<span class="fra12-fraction ${className || ""}" aria-hidden="true"><b>${escapeHtml(numerator ?? "?")}</b><i></i><b>${escapeHtml(denominator ?? "?")}</b></span>`;
  }

  function mixedNumber(mixed, className) {
    if (!mixed) return "";
    return `<span class="fra12-mixed ${className || ""}" aria-label="${escapeHtml(`${mixed.whole} and ${mixed.numerator} over ${mixed.denominator}`)}"><b>${escapeHtml(mixed.whole)}</b>${fraction(mixed.numerator, mixed.denominator)}</span>`;
  }

  function sectionRow(total, selected, className) {
    const count = Math.max(1, Number(total) || 1);
    const marked = Math.max(0, Math.min(count, Number(selected) || 0));
    return `<div class="fra12-sections ${className || ""}" style="--fra12-parts:${count}" aria-hidden="true">${Array.from({ length: count }, (_, index) => `<i class="${index < marked ? "is-selected" : ""}"></i>`).join("")}</div>`;
  }

  function timberBoards(wholeCount, denominator, partialSelected, options) {
    const settings = options || {};
    const wholes = Math.max(0, Number(wholeCount) || 0);
    const parts = Math.max(1, Number(denominator) || 1);
    return `<div class="fra12-board-line${settings.joined ? " is-joined" : ""}">
      ${Array.from({ length: wholes }, (_, index) => `<div class="fra12-board is-whole" data-board="whole-${index + 1}">${sectionRow(parts, parts)}</div>`).join("")}
      ${partialSelected === null || partialSelected === undefined ? "" : `<div class="fra12-board is-partial" data-board="partial">${sectionRow(parts, partialSelected)}</div>`}
    </div>`;
  }

  function working(model) {
    const steps = model.workedSteps || [];
    if (!steps.length) return "";
    return `<ol class="fra12-working">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
  }

  function sceneMarkup(model) {
    const mixed = model.mixedNumber || {};
    if (model.kind === "timber_mixed_amount") {
      return `<div class="fra12-timber-hook">
        <span class="fra12-context-label">Shelf timber</span>
        ${timberBoards(model.wholeBoards, model.partitionCount, model.partialSelected)}
        <div class="fra12-hook-action"><button type="button" class="fra12-count-control" disabled>Count the quarters</button><p class="fra12-count-result" role="status" aria-live="polite"></p></div>
      </div>`;
    }
    if (model.kind === "mixed_number_breakdown") {
      return `<div class="fra12-breakdown">${mixedNumber(model.mixedNumber, "fra12-main-mixed")}
        <div class="fra12-breakdown-grid"><div><strong>Whole part</strong><span>${escapeHtml(mixed.whole)} complete boards</span></div><div><strong>Extra fraction</strong><span>${fraction(mixed.numerator, mixed.denominator)}</span></div><div><strong>Denominator ${escapeHtml(mixed.denominator)}</strong><span>${escapeHtml(mixed.denominator)} pieces per whole</span></div></div>
        ${timberBoards(mixed.whole, mixed.denominator, mixed.numerator)}
      </div>`;
    }
    if (model.kind === "grouped_piece_count") {
      return `<div class="fra12-group-count">${mixedNumber(model.mixedNumber)}${timberBoards(model.wholeGroups, model.partsPerGroup, model.extraPartWaits ? model.mixedNumber.numerator : null)}<div class="fra12-group-equation"><span>${escapeHtml(model.wholeGroups)} groups</span><b>×</b><span>${escapeHtml(model.partsPerGroup)} quarters</span><b>=</b><strong>${escapeHtml(model.wholePieceTotal)} quarters</strong></div></div>`;
    }
    if (model.kind === "piece_join_conversion") {
      return `<div class="fra12-piece-join">${timberBoards(mixed.whole, mixed.denominator, mixed.numerator, { joined: true })}<div class="fra12-piece-equation"><span>${escapeHtml(model.wholePieceTotal)} quarters</span><b>+</b><span>${escapeHtml(model.extraPieces)} quarters</span><b>=</b><strong>${fraction(model.totalNumerator, model.denominator)}</strong></div></div>`;
    }
    if (model.kind === "compact_conversion_method") {
      return `<div class="fra12-compact-method">${mixedNumber(model.mixedNumber, "fra12-main-mixed")}<ol>${model.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol><p><span>Whole × denominator</span><span>Add numerator</span><span>Keep denominator</span></p></div>`;
    }
    return `<div class="fra12-handoff"><span>Visual regrouping</span><b aria-hidden="true">→</b><span>Compact method</span><b aria-hidden="true">→</b><strong>Your turn</strong></div>`;
  }

  function panelsMarkup(model) {
    const wholeCount = Number(model.wholeCount ?? model.mixedNumber?.whole) || 0;
    const denominator = Number(model.partitionCount ?? model.mixedNumber?.denominator) || 1;
    const partial = Number(model.partialSelected ?? model.mixedNumber?.numerator) || 0;
    return `<div class="fra12-panel-model">${timberBoards(wholeCount, denominator, partial)}<p class="fra12-piece-key"><span></span> one selected ${denominator === 1 ? "piece" : `part out of ${denominator}`}</p></div>`;
  }

  function repairMarkup(model, reveal) {
    if (model.kind === "grouped_piece_model") return `<div class="fra12-repair-model">${timberBoards(model.groups, model.partsPerGroup, model.extraParts)}<p>${escapeHtml(model.groups)} groups of ${escapeHtml(model.partsPerGroup)} equal pieces</p></div>`;
    if (model.kind === "denominator_group_size_model") return `<div class="fra12-repair-equation">${mixedNumber(model.mixedNumber)}<p>${escapeHtml(model.mixedNumber.whole)} × <strong>${reveal ? escapeHtml(model.correctGroupSize) : "?"}</strong></p><span>The denominator names the group size.</span></div>`;
    if (model.kind === "locked_denominator_conversion") return `<div class="fra12-repair-equation">${mixedNumber(model.mixedNumber)}<b aria-hidden="true">=</b>${fraction(reveal ? model.expectedNumerator : "?", model.fixedDenominator)}</div>`;
    if (model.kind === "two_stage_conversion") return `<div class="fra12-repair-equation">${mixedNumber(model.mixedNumber)}<ol><li>${escapeHtml(model.firstStage)}</li><li>${reveal ? escapeHtml(model.secondStage) : "Add the extra fraction"}</li></ol></div>`;
    if (model.kind === "form_choice") return `<div class="fra12-form-contrast">${mixedNumber(model.mixedNumber)}<span>Requested form</span>${fraction(reveal ? 9 : "?", 5)}</div>`;
    return "";
  }

  function questionMarkup(model, reveal) {
    const repair = repairMarkup(model, reveal);
    if (repair) return repair;
    let body = "";
    if (["whole_partial_planks", "whole_partial_panels"].includes(model.kind)) body = panelsMarkup(model);
    else if (model.kind === "staged_conversion") {
      const mixed = model.mixedNumber || {};
      body = `<div class="fra12-staged-model">${mixedNumber(mixed, "fra12-main-mixed")}<div><span>${escapeHtml(mixed.whole)} × ${escapeHtml(mixed.denominator)}</span><b>→</b><span>add ${escapeHtml(mixed.numerator)}</span><b>→</b><span>keep denominator ${escapeHtml(mixed.denominator)}</span></div></div>`;
    } else if (model.kind === "scaffolded_symbolic_conversion") {
      body = `<div class="fra12-symbol-model">${mixedNumber(model.mixedNumber, "fra12-main-mixed")}<p>${escapeHtml(model.visibleStructure)}</p>${fraction("?", model.partitionCount)}</div>`;
    } else if (["reasoning_mcq", "method_mcq"].includes(model.kind)) {
      body = `<div class="fra12-reason-model">${mixedNumber(model.mixedNumber, "fra12-main-mixed")}${model.studentClaim ? `<blockquote>${escapeHtml(model.studentClaim)}</blockquote>` : `<p>Choose the line that preserves the amount.</p>`}</div>`;
    } else {
      body = `<div class="fra12-symbol-model">${mixedNumber(model.mixedNumber, "fra12-main-mixed")}</div>`;
    }
    return `<div class="fra12-question-model">${body}${reveal ? working(model) : ""}</div>`;
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const reveal = ["correct", "worked"].includes(context?.feedback);
    return context?.question ? questionMarkup(model, reveal) : sceneMarkup(model);
  }

  function accessibleDescription(model, context) {
    const reveal = ["correct", "worked"].includes(context?.feedback);
    const authored = model?.accessibleDescription;
    if (authored) return `${authored}${reveal ? " The locked worked conversion is now shown." : ""}`;
    if (model?.sceneId === "HOOK") return "Shelf timber shows two whole boards and three of four equal parts of another board. The improper-fraction total is not labelled before the count control is used.";
    if (model?.mixedNumber) {
      const mixed = model.mixedNumber;
      return `A model for ${mixed.whole} and ${mixed.numerator} over ${mixed.denominator}.${reveal ? " The sequential conversion working is shown." : " No answer or working is shown before submission."}`;
    }
    return "A mixed-number regrouping model using equal parts.";
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const cue = event.detail;
      const visual = container.querySelector(".visual-stage > *");
      if (visual && cue?.id) visual.setAttribute("data-fra12-cue", cue.id);
      if (cue?.target === "hook.countQuartersButton") {
        const button = container.querySelector(".fra12-count-control");
        if (button) button.disabled = false;
      }
    });
    const button = container.querySelector(".fra12-count-control");
    button?.addEventListener("click", () => {
      const result = container.querySelector(".fra12-count-result");
      if (result) result.textContent = "Eleven quarter-boards altogether.";
      button.disabled = true;
      button.textContent = "11 quarters";
      container.querySelector(".fra12-timber-hook")?.classList.add("is-counted");
    });
  }

  window.RevilyFra12Visuals = { accessibleDescription, bind, renderMarkup };
})();
