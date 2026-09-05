(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const fraction = (value, className) => value ? `<span class="fra09-fraction ${className || ""}" aria-label="${value.numerator} over ${value.denominator}"><b>${value.numerator}</b><i></i><b>${value.denominator}</b></span>` : "";
  const factorBadge = (factor, label) => factor ? `<span class="fra09-factor-badge"><small>${escapeHtml(label || "Given factor")}</small><b>${factor}</b></span>` : "";
  const quotientLane = (source, factor, result, label, reveal) => `<div class="fra09-quotient-lane ${label.toLowerCase()}"><small>${label}</small><span>${source}</span><b aria-hidden="true">&divide;</b><span class="factor">${factor}</span><b aria-hidden="true">=</b><strong>${reveal ? result : "?"}</strong></div>`;

  function modelFor(visual, ctx) {
    return ctx?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function segmentedBar(model) {
    const segments = Number(model.segments || model.originalFraction?.denominator || 24);
    const filled = Number(model.filledSegments || model.originalFraction?.numerator || 0);
    const groupSize = Math.max(1, Number(model.groupSize || 1));
    return `<div class="fra09-progress-wrap"><div class="fra09-progress-bar" role="img" aria-label="${filled} of ${segments} equal sections filled">${Array.from({ length: segments }, (_, index) => `<i class="${index < filled ? "filled" : ""}${index % groupSize === 0 ? " group-start" : ""}" style="--segment:${index}"></i>`).join("")}</div><div class="fra09-endpoint" aria-hidden="true"></div></div>`;
  }

  function teachingMarkup(model) {
    const before = model.fractionBefore || model.originalFraction;
    const after = model.fractionAfter || model.resultFraction || model.requiredResult;
    if (model.kind === "segmented_progress_bar") {
      return `<div class="fra09-teaching hook"><div class="fra09-equivalence-row">${fraction(before, "before")}<span class="fra09-same-value">same progress</span>${fraction(after, "result")}</div>${segmentedBar(model)}${factorBadge(model.groupSize, "Group size")}</div>`;
    }
    if (model.kind === "grouping_to_division") {
      return `<div class="fra09-teaching grouping"><div class="fra09-equivalence-row">${fraction(model.originalFraction)}<b>=</b>${fraction(model.resultFraction, "result")}</div>${segmentedBar(model)}<div class="fra09-lanes">${quotientLane(model.originalFraction.numerator, model.factor, model.resultFraction.numerator, "Numerator", true)}${quotientLane(model.originalFraction.denominator, model.factor, model.resultFraction.denominator, "Denominator", true)}</div></div>`;
    }
    if (model.kind === "symbolic_division_lanes") {
      return `<div class="fra09-teaching symbolic">${factorBadge(model.factor)}${fraction(model.originalFraction)}<div class="fra09-lanes">${quotientLane(model.originalFraction.numerator, model.factor, model.resultFraction.numerator, "Numerator", true)}${quotientLane(model.originalFraction.denominator, model.factor, model.resultFraction.denominator, "Denominator", true)}</div><div class="fra09-result-card"><small>One requested step</small>${fraction(model.resultFraction, "result")}</div></div>`;
    }
    if (model.kind === "valid_invalid_factor_contrast") {
      const original = model.originalFraction;
      return `<div class="fra09-teaching contrast">${fraction(original)}<div class="fra09-contrast-grid"><section class="valid"><strong>Factor ${model.validFactor}</strong><span>${original.numerator} &divide; ${model.validFactor} = ${model.validResult.numerator}</span><span>${original.denominator} &divide; ${model.validFactor} = ${model.validResult.denominator}</span><b>Works on both</b></section><section class="invalid"><strong>Factor ${model.invalidFactor}</strong><span>${original.numerator} &divide; ${model.invalidFactor} = ${original.numerator / model.invalidFactor}</span><span>${original.denominator} &divide; ${model.invalidFactor} is not exact</span><b>Does not work on both</b></section></div></div>`;
    }
    if (model.kind === "one_step_boundary") {
      return `<div class="fra09-teaching boundary"><div class="fra09-step-path">${fraction(model.originalFraction)}<span>&divide; ${model.givenFactor}</span>${fraction(model.requiredResult, "result")}<span class="stop-mark">STOP</span><span class="later-path" aria-label="Further simplification belongs to a later lesson">&divide; ${model.laterPossibleFactor} ${fraction(model.laterResult)}</span></div><p>Complete the stated factor step. Do not choose another factor.</p></div>`;
    }
    return `<div class="fra09-teaching transition"><span class="fra09-transition-stage">Learn the idea</span><b aria-hidden="true">&rarr;</b><span class="fra09-transition-stage active">Try it with me</span>${factorBadge(5)}</div>`;
  }

  function repairMarkup(model, reveal) {
    if (model.kind === "operation_contrast") return `<div class="fra09-repair operation"><span class="wrong">subtract</span><b>or</b><span class="right">divide</span><p>The instruction names division by the supplied factor.</p></div>`;
    if (model.kind === "same_factor_badge") return `<div class="fra09-repair same-factor">${factorBadge(model.givenFactor || model.factor || 6)}<div class="fra09-factor-links"><span>numerator line</span><span>denominator line</span></div></div>`;
    if (model.kind === "factor_validity_repair") {
      const original = model.originalFraction || { numerator: 21, denominator: 36 };
      const factor = model.proposedFactor || model.givenFactor || 3;
      const supported = model.supportedOriginalFraction;
      const supportedFactor = model.supportedFactor;
      return `<div class="fra09-repair factor-check"><section><small>Repair example</small>${fraction(original)}${factorBadge(factor, "Check factor")}<p>${original.numerator} &divide; ${factor} = ${original.numerator / factor}</p><p>${original.denominator} &divide; ${factor} is not exact</p></section>${supported && supportedFactor ? `<section><small>Now check</small>${fraction(supported)}${factorBadge(supportedFactor, "Proposed factor")}</section>` : ""}</div>`;
    }
    if (model.kind === "one_step_boundary_repair") return `<div class="fra09-repair boundary">${fraction(model.originalFraction || { numerator: 45, denominator: 60 })}<span class="stop-mark">ONE STEP</span><p>The requested result is the result after the supplied factor, even if another step would be possible.</p></div>`;
    const original = model.originalFraction || { numerator: 30, denominator: 42 };
    const factor = model.givenFactor || model.factor || 6;
    return `<div class="fra09-repair one-sided">${factorBadge(factor)}${fraction(original)}<div class="fra09-lanes">${quotientLane(original.numerator, factor, Number.isInteger(original.numerator / factor) ? original.numerator / factor : "?", "Numerator", reveal)}${quotientLane(original.denominator, factor, Number.isInteger(original.denominator / factor) ? original.denominator / factor : "?", "Denominator", reveal)}</div></div>`;
  }

  function questionMarkup(model, reveal) {
    const original = model.originalFraction;
    const factor = model.givenFactor ?? model.proposedFactor;
    if (model.kind?.startsWith("repair_") || ["operation_contrast", "same_factor_badge", "factor_validity_repair", "one_step_boundary_repair"].includes(model.kind)) return repairMarkup(model, reveal);
    if (model.kind === "factor_validity_card") {
      const works = original && factor && original.numerator % factor === 0 && original.denominator % factor === 0;
      return `<div class="fra09-question factor-validity">${fraction(original)}${factorBadge(factor, "Proposed factor")}<div class="fra09-exact-check"><span>${original.numerator} &divide; ${factor}${reveal ? (original.numerator % factor === 0 ? ` = ${original.numerator / factor}` : " is not exact") : ""}</span><span>${original.denominator} &divide; ${factor}${reveal ? (original.denominator % factor === 0 ? ` = ${original.denominator / factor}` : " is not exact") : ""}</span></div>${reveal ? `<strong class="fra09-verdict ${works ? "yes" : "no"}">${works ? "Works on both" : "Does not work on both"}</strong>` : ""}</div>`;
    }
    if (model.kind === "student_work_error") {
      return `<div class="fra09-question student-error"><small>Student's line</small><div>${fraction(original)}<b>&rarr;</b>${fraction(model.studentResult, "student-result")}</div>${factorBadge(factor)}${reveal ? `<p>Check the supplied factor on both original numbers.</p>` : ""}</div>`;
    }
    if (model.kind === "reasoning_options" || model.kind === "result_options") {
      return `<div class="fra09-question result-options">${fraction(original)}${factorBadge(factor)}<div class="fra09-two-lane-preview"><span>top &divide; ${factor}</span><span>bottom &divide; ${factor}</span></div>${reveal && model.resultFraction ? fraction(model.resultFraction, "result") : ""}</div>`;
    }
    if (model.kind === "missing_denominator" || model.kind === "missing_numerator") {
      const result = model.resultFraction;
      const editTop = model.kind === "missing_numerator";
      return `<div class="fra09-question missing-value">${fraction(original)}<b aria-hidden="true">&divide; ${factor} on both</b><span class="fra09-fraction result" aria-label="result fraction"><b>${editTop ? (reveal ? result.numerator : "?") : result.numerator}</b><i></i><b>${editTop ? result.denominator : (reveal ? result.denominator : "?")}</b></span></div>`;
    }
    const result = model.resultFraction;
    return `<div class="fra09-question transform">${factorBadge(factor)}<div class="fra09-equivalence-row">${fraction(original)}<b aria-hidden="true">&rarr;</b>${reveal ? fraction(result, "result") : `<span class="fra09-fraction blank" aria-label="blank result fraction"><b>?</b><i></i><b>?</b></span>`}</div>${original && result ? `<div class="fra09-lanes">${quotientLane(original.numerator, factor, result.numerator, "Numerator", reveal)}${quotientLane(original.denominator, factor, result.denominator, "Denominator", reveal)}</div>` : ""}</div>`;
  }

  function renderMarkup(visual, ctx) {
    const model = modelFor(visual, ctx);
    const reveal = ["correct", "worked"].includes(ctx?.feedback);
    const teaching = ["segmented_progress_bar", "grouping_to_division", "symbolic_division_lanes", "valid_invalid_factor_contrast", "one_step_boundary", "stage_transition"].includes(model.kind);
    return `<div class="fra09-visual" data-kind="${escapeHtml(model.kind || "fraction_transform")}" data-reveal="${reveal}">${teaching ? teachingMarkup(model) : questionMarkup(model, reveal)}</div>`;
  }

  function accessibleDescription(visual, ctx) {
    const model = modelFor(visual, ctx);
    if (model.accessibleDescription) return model.accessibleDescription;
    if (model.originalFraction) {
      const factor = model.givenFactor ?? model.proposedFactor ?? model.factor;
      return `Fraction ${model.originalFraction.numerator} over ${model.originalFraction.denominator}${factor ? ` with stated factor ${factor}` : ""}.`;
    }
    return "A fraction model showing one exact division step with the same supplied factor on numerator and denominator.";
  }

  window.RevilyFra09Visuals = { accessibleDescription, renderMarkup };
})();
