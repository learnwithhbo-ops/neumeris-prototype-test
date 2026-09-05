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

  function safePositive(value, fallback, maximum) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) return fallback;
    return Math.min(number, maximum || 60);
  }

  function safeSelected(model, total) {
    const selected = Number(model?.selectedParts);
    if (!Number.isInteger(selected) || selected < 0) return 0;
    return model?.allowMultipleWholes ? Math.min(selected, 120) : Math.min(selected, total);
  }

  function fractionValues(model) {
    const fraction = model?.fraction || {};
    return {
      numerator: fraction.numerator ?? model?.fixedNumerator ?? model?.selectedParts ?? "?",
      denominator: fraction.denominator ?? model?.fixedDenominator ?? model?.totalParts ?? "?"
    };
  }

  function fractionMarkup(model, options) {
    const opts = options || {};
    const values = fractionValues(model);
    const label = opts.label || `${values.numerator} over ${values.denominator}`;
    return `<span class="fra02-fraction${opts.compact ? " is-compact" : ""}" aria-label="${escapeHtml(label)}"><span class="fra02-numerator">${escapeHtml(values.numerator)}</span><i aria-hidden="true"></i><span class="fra02-denominator">${escapeHtml(values.denominator)}</span></span>`;
  }

  function cellsMarkup(model, kind, options) {
    const opts = options || {};
    const total = safePositive(model?.totalParts, 1, 30);
    const selected = Math.min(total, safeSelected(model, total));
    const meaning = String(model?.selectedMeaning || "selected").replace(/[^a-z0-9_-]/gi, "");
    const cells = Array.from({ length: total }, (_, index) => `<span class="fra02-cell${index < selected ? " is-selected" : ""}" style="--cell-index:${index}" aria-hidden="true"><i></i></span>`).join("");
    return `<div class="fra02-partition is-${escapeHtml(kind)} selection-${escapeHtml(meaning)}${opts.wholeFocus ? " has-whole-focus" : ""}" style="--fra02-parts:${total}" aria-hidden="true">${cells}</div>`;
  }

  function seatMarkup(model) {
    const total = safePositive(model?.totalParts, 12, 24);
    const selected = Math.min(total, safeSelected(model, total));
    return `<div class="fra02-seat-boundary" aria-hidden="true"><div class="fra02-seats" style="--seat-columns:${Math.min(6, total)}">${Array.from({ length: total }, (_, index) => `<span class="fra02-seat${index < selected ? " is-booked" : ""}" style="--seat-index:${index}"><i></i><b>${index < selected ? "✓" : ""}</b></span>`).join("")}</div><small>${selected} booked out of ${total} total</small></div>`;
  }

  function tokenMarkup(model) {
    const total = safePositive(model?.totalParts, 1, 30);
    const selected = Math.min(total, safeSelected(model, total));
    const meaning = String(model?.selectedMeaning || "selected").replace(/[^a-z0-9_-]/gi, "");
    return `<div class="fra02-token-boundary${model?.wholeBoundary ? " has-boundary" : ""}" aria-hidden="true"><div class="fra02-tokens" style="--token-columns:${Math.min(7, Math.max(4, Math.ceil(total / 2)))}">${Array.from({ length: total }, (_, index) => `<span class="fra02-token${index < selected ? " is-selected" : ""}" style="--token-index:${index}"><i></i></span>`).join("")}</div>${model?.hideCountLabels ? "" : `<small>${selected} ${escapeHtml(meaning)} · ${total - selected} not ${escapeHtml(meaning)}</small>`}</div>`;
  }

  function pointAt(angle, radius, centre) {
    return { x: centre + radius * Math.cos(angle), y: centre + radius * Math.sin(angle) };
  }

  function cakeMarkup(model) {
    const total = safePositive(model?.totalParts, 12, 18);
    const selected = Math.min(total, safeSelected(model, total));
    const centre = 70;
    const radius = 58;
    const slices = Array.from({ length: total }, (_, index) => {
      const start = -Math.PI / 2 + (index / total) * Math.PI * 2;
      const end = -Math.PI / 2 + ((index + 1) / total) * Math.PI * 2;
      const a = pointAt(start, radius, centre);
      const b = pointAt(end, radius, centre);
      return `<path class="fra02-cake-slice${index < selected ? " is-selected" : ""}" d="M ${centre} ${centre} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z"></path>`;
    }).join("");
    return `<svg class="fra02-cake" viewBox="0 0 140 140" aria-hidden="true">${slices}<circle cx="70" cy="70" r="59" class="fra02-cake-outline"></circle></svg>`;
  }

  function drawingForModel(model, options) {
    const context = String(model?.context || "fraction_symbol");
    if (context === "cinema_seats") return seatMarkup(model);
    if (context === "token_set") return tokenMarkup(model);
    if (context === "cake") return cakeMarkup(model);
    if (context === "chocolate_partition") return cellsMarkup(model, "chocolate", options);
    if (["board", "plank", "strip"].includes(context)) return cellsMarkup(model, context, options);
    return "";
  }

  function roleLabels(model) {
    const values = fractionValues(model);
    const selected = safeSelected(model, safePositive(model?.totalParts, 1, 60));
    const total = safePositive(model?.totalParts, Number(values.denominator) || 1, 60);
    return `<div class="fra02-role-labels" aria-hidden="true"><span class="fra02-role numerator-role"><b>NUMERATOR</b><small>${escapeHtml(values.numerator)} part${Number(values.numerator) === 1 ? "" : "s"} counted</small></span><span class="fra02-role denominator-role"><b>DENOMINATOR</b><small>${escapeHtml(values.denominator)} equal parts per whole</small></span><span class="visually-hidden">${selected} selected from ${total}</span></div>`;
  }

  function roleDiagram(model, options) {
    const opts = options || {};
    const showFraction = opts.reveal || !model?.hideFractionUntilFeedback;
    const showRoles = opts.reveal || !model?.hideRolesUntilFeedback;
    const drawingModel = model?.context === "fraction_role_diagram"
      ? Object.assign({}, model, { context: model?.selectedMeaning === "booked" ? "cinema_seats" : "board" })
      : model;
    const drawing = drawingForModel(drawingModel, { wholeFocus: true });
    return `<div class="fra02-role-diagram variant-${escapeHtml(model?.teachingVariant || "plain")}${opts.reveal ? " is-revealed" : ""}"><div class="fra02-role-object">${drawing}</div>${showFraction ? `<div class="fra02-role-fraction">${fractionMarkup(model)}</div>` : ""}${showRoles ? roleLabels(model) : ""}</div>`;
  }

  function multiWholeMarkup(model) {
    const denominator = safePositive(model?.fraction?.denominator || model?.totalParts, 6, 12);
    const numerator = safePositive(model?.fraction?.numerator || model?.selectedParts, 11, 60);
    const wholes = Math.ceil(numerator / denominator);
    return `<div class="fra02-multi-whole"><small>${numerator} sixth-sized parts</small><div class="fra02-whole-stack">${Array.from({ length: wholes }, (_, wholeIndex) => {
      const selected = Math.max(0, Math.min(denominator, numerator - wholeIndex * denominator));
      return `<div class="fra02-whole-row"><span>whole ${wholeIndex + 1}</span>${cellsMarkup({ totalParts: denominator, selectedParts: selected, selectedMeaning: "counted" }, "sixths", { wholeFocus: true })}</div>`;
    }).join("")}</div><div class="fra02-multi-role">${fractionMarkup(model)}${roleLabels(model)}</div></div>`;
  }

  function hookMarkup(model) {
    const swapped = { fraction: { numerator: model?.fraction?.denominator || 12, denominator: model?.fraction?.numerator || 5 } };
    return `<div class="fra02-hook"><div class="fra02-hook-seats">${seatMarkup(model)}</div><div class="fra02-hook-fractions"><span class="correct-description">${fractionMarkup(model)}<small>describes the seats</small></span><span class="swap-arrow" aria-hidden="true">→</span><span class="wrong-description">${fractionMarkup(swapped)}<small>does not describe the seats</small></span></div></div>`;
  }

  function handoffMarkup() {
    return `<div class="fra02-handoff" aria-hidden="true"><span><b>Read the fraction</b></span><i>→</i><span><b>Find the role</b></span><i>→</i><span><b>Connect to meaning</b></span><i>→</i><span><b>Use the role</b></span></div>`;
  }

  function teachingMarkup(model) {
    const variant = String(model?.teachingVariant || "");
    if (variant === "hook") return hookMarkup(model);
    if (variant === "handoff" || model?.context === "handoff") return handoffMarkup();
    if (model?.context === "multi_whole_sixths") return multiWholeMarkup(model);
    if (model?.context === "fraction_role_diagram" || ["numerator", "denominator", "both_roles", "repair_swap", "repair_denominator"].includes(variant)) return roleDiagram(model);
    if (variant === "repair_field") return `<div class="fra02-field-repair"><div class="fra02-static-builder"><span>?</span><i></i><b>${escapeHtml(model.fixedDenominator)}</b><small>${escapeHtml(model.fixedDenominator)} stays fixed</small></div></div>`;
    if (variant === "repair_target") return `<div class="fra02-target-repair">${tokenMarkup(model)}${fractionMarkup(model)}</div>`;
    const drawing = drawingForModel(model);
    return `<div class="fra02-teach-model">${drawing}${model?.fraction ? fractionMarkup(model) : ""}</div>`;
  }

  function workedMarkup(question) {
    const model = question?.model || {};
    if (question?.response?.type === "fraction") return `<div class="fra02-worked"><span>The correct fraction</span>${fractionMarkup(model, { compact: true })}</div>`;
    if (question?.response?.type === "integer") return `<div class="fra02-worked"><span>The correct value</span><b>${escapeHtml(question?.answer?.value || "")}</b></div>`;
    return `<div class="fra02-worked"><span>The correct statement</span><b>${escapeHtml(String(question?.answer?.value || "").replace(/^[A-D]\.\s*/, ""))}</b></div>`;
  }

  function questionMarkup(question, feedback) {
    const model = question?.model || {};
    const reveal = ["correct", "support", "worked"].includes(feedback);
    const context = String(model.context || "");
    let drawing = "";
    if (context === "fraction_symbol") {
      const showModel = model.showPartModel === true;
      drawing = `<div class="fra02-symbol-question">${fractionMarkup(model)}${showModel ? cellsMarkup({ totalParts: model.totalParts, selectedParts: model.selectedParts, selectedMeaning: model.selectedMeaning }, "strip") : ""}</div>`;
    } else if (context === "fraction_role_diagram") {
      drawing = roleDiagram(model, { reveal });
    } else if (context === "multi_whole_sixths") {
      drawing = multiWholeMarkup(model);
    } else {
      drawing = drawingForModel(model);
    }
    const hintClass = feedback === "hint" && ["whole", "selected"].includes(model.hintFocus) ? ` hint-focus-${model.hintFocus}` : "";
    return `<div class="fra02-question-model${hintClass}"><div class="fra02-question-object">${drawing}</div>${reveal ? workedMarkup(question) : ""}</div>`;
  }

  function renderMarkup(visual, context) {
    const ctx = context || {};
    const model = ctx.question?.model || visual?.scene?.model || visual?.model || {};
    if (ctx.question) {
      if (ctx.question.policy?.reteachOnly) return teachingMarkup(model);
      return questionMarkup(ctx.question, ctx.feedback || "initial");
    }
    return teachingMarkup(model);
  }

  function accessibleDescription(model) {
    if (!model) return "A visual fraction model.";
    const values = fractionValues(model);
    const total = Number(model.totalParts) || Number(values.denominator) || 0;
    const selected = Number(model.selectedParts) || Number(values.numerator) || 0;
    const context = String(model.context || "fraction model").replace(/_/g, " ");
    if (model.context === "handoff") return "Read the fraction; find the role; connect to meaning; use the role.";
    if (model.teachingVariant === "repair_field") return `A fraction builder with an empty top field and a fixed ${model.fixedDenominator} in the bottom field.`;
    if (model.accessiblePartSequence) {
      const meaning = model.selectedMeaning || "selected";
      const parts = Array.from({ length: total }, (_, index) => index < selected ? meaning : `not ${meaning}`).join("; ");
      return `One whole ${context}. Equal parts in reading order: ${parts}.`;
    }
    if (model.teachingVariant === "hook") return "A whole group of twelve cinema seats. Five seats are marked as booked. The written fraction changes from five twelfths to twelve fifths as Ryan explains.";
    if (model.context === "multi_whole_sixths") return "Two whole bars, each divided into six equal parts. All six parts of the first bar and five parts of the second bar are counted, making eleven sixth-sized parts.";
    if (model.context === "fraction_symbol") return `A written fraction with ${values.numerator} above the fraction bar and ${values.denominator} below it.${model.showPartModel ? ` A matching whole has ${total} equal parts with ${selected} selected.` : ""}`;
    if (model.context === "fraction_role_diagram" && model.hideFractionUntilFeedback) return `A ${total}-part whole with ${selected} ${model.selectedMeaning || "selected"}. No completed fraction is shown before the learner answers.`;
    if (model.context === "fraction_role_diagram") return `A ${total}-part whole with ${selected} ${model.selectedMeaning || "selected"}, beside the written fraction ${values.numerator} over ${values.denominator}.`;
    if (model.context === "cinema_seats") return `A whole group of ${total} cinema seats. ${selected} are visibly marked as booked.`;
    if (model.context === "token_set") return `A bounded whole group of ${total} tokens. ${selected} are ${model.selectedMeaning || "selected"}.`;
    if (model.context === "cake") return `One cake divided into ${total} equal slices. ${selected} slices are ${model.selectedMeaning || "selected"}.`;
    if (total) return `One ${context} divided into ${total} equal parts. ${selected} are ${model.selectedMeaning || "selected"}.`;
    return `A ${context}.`;
  }

  window.RevilyFra02Visuals = {
    accessibleDescription,
    cakeMarkup,
    cellsMarkup,
    fractionMarkup,
    renderMarkup,
    seatMarkup,
    tokenMarkup
  };
})();
