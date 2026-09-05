(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  function modelFor(visual, ctx) {
    return ctx?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function fractionMarkup(value, className) {
    if (!value) return "";
    return `<span class="fra15-fraction ${escapeHtml(className || "")}" aria-label="${escapeHtml(value.numerator)} over ${escapeHtml(value.denominator)}"><b>${escapeHtml(value.numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(value.denominator)}</b></span>`;
  }

  function quantityValue(quantity) {
    return quantity?.count ?? quantity?.value ?? quantity?.comparableValue ?? "?";
  }

  function quantityLabel(quantity, fallback) {
    return String(quantity?.label || quantity?.id || fallback || "quantity").replace(/_/g, " ");
  }

  function normaliseQuantities(model) {
    const visual = model.visual || {};
    const source = model.source || {};
    if (Array.isArray(visual.quantities)) return visual.quantities;
    if (source.expressed && source.reference) return [
      { ...source.expressed, semanticRole: "expressed" },
      { ...source.reference, semanticRole: "reference" }
    ];
    if (visual.expressed && visual.reference) return [
      { ...visual.expressed, semanticRole: "expressed", id: visual.expressed.id || "first" },
      { ...visual.reference, semanticRole: "reference", id: visual.reference.id || "reference" }
    ];
    if (visual.values) return [
      { id: "P", value: visual.values.P, semanticRole: "expressed" },
      { id: "Q", value: visual.values.Q, semanticRole: "reference" }
    ];
    return [];
  }

  function quantityBars(model, reveal) {
    const visual = model.visual || {};
    const showRoles = Boolean(model.sceneId || reveal || visual.showRoleLabelsBeforeSubmit || visual.showLabelsBeforeSubmit || visual.showRoleSequenceCue);
    const quantities = normaliseQuantities(model);
    const comparable = quantities.map((quantity) => Number(quantity.comparableValue ?? quantityValue(quantity)) || 1);
    const maximum = Math.max(...comparable, 1);
    const bars = quantities.map((quantity, index) => {
      const role = quantity.semanticRole || (index === 0 ? "expressed" : "reference");
      const width = Math.max(18, (comparable[index] / maximum) * 100);
      const value = quantityValue(quantity);
      const unit = quantity.unit || quantity.comparableUnit || "";
      return `<div class="fra15-quantity-row role-${role}">
        <div class="fra15-quantity-label"><strong>${escapeHtml(quantityLabel(quantity, index === 0 ? "first quantity" : "reference quantity"))}</strong><span>${escapeHtml(value)}${unit ? ` ${escapeHtml(unit)}` : ""}</span></div>
        <div class="fra15-measure-track"><span class="fra15-measure-bar" style="--bar-width:${width}%"><i aria-hidden="true"></i></span></div>
        ${showRoles ? `<small class="fra15-role-label">${role === "expressed" ? "quantity being expressed" : "reference quantity"}</small>` : ""}
      </div>`;
    }).join("");
    const raw = model.source?.rawFraction || visual.rawFraction || visual.fraction || visual.initialStudentFraction || null;
    const resolved = visual.resolvedFraction || visual.simplestFraction || model.source?.rawFraction || null;
    const conversion = model.source?.suppliedConversion || visual.suppliedConversion;
    return `<div class="fra15-quantity-model">
      ${conversion ? `<div class="fra15-conversion-card"><span>Conversion supplied</span><strong>${escapeHtml(conversion)}</strong></div>` : ""}
      <div class="fra15-quantity-bars">${bars}</div>
      ${visual.phrase ? `<div class="fra15-phrase">${escapeHtml(visual.phrase)}</div>` : ""}
      <div class="fra15-fraction-build${reveal ? " is-revealed" : ""}">
        ${raw ? `<span class="fra15-build-label">Build the comparison</span>${fractionMarkup(raw, "fra15-raw-fraction")}` : ""}
        ${visual.simplestFraction ? `<span class="fra15-build-arrow" aria-hidden="true">→</span>${fractionMarkup(visual.simplestFraction, "fra15-simplest-fraction")}` : ""}
        ${visual.resolvedFraction && (!raw || visual.resolvedFraction.numerator !== raw.numerator || visual.resolvedFraction.denominator !== raw.denominator) ? `<span class="fra15-build-arrow" aria-hidden="true">→</span>${fractionMarkup(visual.resolvedFraction, "fra15-resolved-fraction")}` : ""}
      </div>
      ${visual.rejectedCombinedValue ? `<div class="fra15-rejected-total" aria-label="${visual.rejectedCombinedValue} is not the named reference"><s>${escapeHtml(visual.rejectedCombinedValue)}</s><span>not the named reference</span></div>` : ""}
      ${resolved && reveal && !raw ? fractionMarkup(resolved, "fra15-result-fraction") : ""}
    </div>`;
  }

  function counterGroups(model, reveal) {
    const visual = model.visual || {};
    const source = model.source || {};
    const groups = visual.groups || (source.expressed && source.reference ? [source.expressed, source.reference] : []);
    const total = visual.total || source.total;
    return `<div class="fra15-counter-model">
      <div class="fra15-counter-groups">${groups.map((group, groupIndex) => `<section class="fra15-counter-group group-${groupIndex}"><strong>${escapeHtml(quantityLabel(group, `group ${groupIndex + 1}`))}</strong><div role="list" aria-label="${escapeHtml(quantityLabel(group))}: ${escapeHtml(group.count)} counters">${Array.from({ length: Number(group.count) || 0 }, (_, index) => `<i role="listitem" aria-label="counter ${index + 1}"></i>`).join("")}</div><span>${escapeHtml(group.count)}</span></section>`).join("")}</div>
      <div class="fra15-reference-bracket"><span>named reference</span></div>
      ${total ? `<div class="fra15-total-label${reveal ? " is-revealed" : ""}">Combined total: ${escapeHtml(total)}</div>` : ""}
      ${(source.rawFraction || visual.resolvedFraction) ? `<div class="fra15-counter-result${reveal ? " is-revealed" : ""}">${fractionMarkup(source.rawFraction || visual.resolvedFraction)}</div>` : ""}
      ${visual.comparisonQuestion?.fraction ? `<div class="fra15-counter-result fra15-comparison-result">${fractionMarkup(visual.comparisonQuestion.fraction)}<small>${escapeHtml(visual.comparisonQuestion.phrase)}</small></div>` : ""}
      ${visual.wholeSetQuestion?.fraction ? `<div class="fra15-counter-result fra15-whole-set-result">${fractionMarkup(visual.wholeSetQuestion.fraction)}<small>${escapeHtml(visual.wholeSetQuestion.phrase)}</small></div>` : ""}
    </div>`;
  }

  function reversibleMarkup(model) {
    const visual = model.visual || {};
    return `<div class="fra15-reversible">
      <section><p>${escapeHtml(visual.leftPhrase || "blue as a fraction of orange")}</p>${fractionMarkup(visual.leftFraction || { numerator: 12, denominator: 8 })}<small>first wording</small></section>
      <span class="fra15-reverse-arrow" aria-hidden="true">⇄</span>
      <section><p>${escapeHtml(visual.rightPhrase || "orange as a fraction of blue")}</p>${fractionMarkup(visual.rightFraction || { numerator: 8, denominator: 12 })}<small>reversed wording</small></section>
    </div>`;
  }

  function triptychMarkup(model) {
    const panels = model.visual?.panels || [];
    return `<div class="fra15-triptych">${panels.map((panel, index) => `<section style="--panel-index:${index}">${fractionMarkup(panel.fraction)}<strong>${escapeHtml(panel.comparison)}</strong><small>${panel.relation === "first_smaller" ? "first is smaller" : panel.relation === "equal" ? "quantities are equal" : "first is larger"}</small></section>`).join("")}</div><p class="fra15-sense-note">Use the side of one as a check. Keep the wording order fixed.</p>`;
  }

  function matchingMarkup(model) {
    const visual = model.visual || {};
    const statements = visual.statements || model.source?.mappings?.map((mapping) => mapping.phrase) || [];
    const fractions = visual.fractionCards || model.source?.mappings?.map((mapping) => mapping.answer) || [];
    return `<div class="fra15-matching-model"><div>${statements.map((statement) => `<span>${escapeHtml(statement)}</span>`).join("")}</div><i aria-hidden="true">→</i><div>${fractions.map((fraction) => fractionMarkup(fraction)).join("")}</div></div>`;
  }

  function handoffMarkup(model) {
    const prompts = model.visual?.prompts || ["Which quantity is being expressed?", "Which quantity is the reference?"];
    return `<div class="fra15-handoff-model"><div class="fra15-word-order"><span>first named quantity</span><b aria-hidden="true">→</b><span>numerator</span></div><div class="fra15-word-order reference"><span>named reference</span><b aria-hidden="true">→</b><span>denominator</span></div>${prompts.map((prompt) => `<p>${escapeHtml(prompt)}</p>`).join("")}</div>`;
  }

  function workedMarkup(model, feedback) {
    if (feedback !== "worked" || !model.workedCheck?.visibleSteps?.length) return "";
    return `<ol class="fra15-worked-steps">${model.workedCheck.visibleSteps.map((step) => `<li>${escapeHtml(String(step).replace(/Ã·/g, "÷").replace(/->/g, "→"))}</li>`).join("")}</ol>`;
  }

  function renderMarkup(visual, ctx) {
    const model = modelFor(visual, ctx);
    const kind = model.kind || model.visual?.kind || "comparison";
    const reveal = ["correct", "support", "worked"].includes(ctx?.feedback);
    let body;
    if (/counter_group|counter_groups/.test(kind)) body = counterGroups(model, reveal);
    else if (kind === "reversible_phrase_comparison") body = reversibleMarkup(model);
    else if (kind === "side_of_one_triptych") body = triptychMarkup(model);
    else if (kind === "matching_cards") body = matchingMarkup(model);
    else if (kind === "reusable_prompt_card") body = handoffMarkup(model);
    else if (kind === "phrase_to_fraction_mapping") body = `${quantityBars(model, reveal)}<div class="fra15-role-map"><span>first named</span><b>numerator</b><span>reference</span><b>denominator</b></div>`;
    else body = quantityBars(model, reveal);
    return `<div class="fra15-visual" data-kind="${escapeHtml(kind)}" data-scene="${escapeHtml(model.sceneId || "")}" data-reveal="${reveal}" aria-hidden="true">${body}${workedMarkup(model, ctx?.feedback)}</div>`;
  }

  function accessibleDescription(visual, ctx) {
    const model = modelFor(visual, ctx);
    if (model.accessibleDescription) return model.accessibleDescription;
    const quantities = normaliseQuantities(model);
    if (quantities.length) return `Two quantities on a shared comparison scale: ${quantities.map((quantity) => `${quantityLabel(quantity)} ${quantityValue(quantity)} ${quantity.unit || ""}`.trim()).join("; ")}.`;
    const groups = model.visual?.groups || [];
    if (groups.length) return `Two countable groups: ${groups.map((group) => `${group.count} ${quantityLabel(group)}`).join("; ")}.`;
    return "A comparison model keeps the first named quantity above the named reference quantity.";
  }

  window.RevilyFra15Visuals = { accessibleDescription, renderMarkup };
})();
