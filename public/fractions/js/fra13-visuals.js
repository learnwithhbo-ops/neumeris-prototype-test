(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(numerator, denominator) {
    return `<span class="fra13-fraction" aria-hidden="true"><b>${escapeHtml(numerator)}</b><i></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function tokenRow(count, className) {
    return `<div class="fra13-token-row ${className || ""}" aria-hidden="true">${Array.from({ length: Math.max(0, Number(count) || 0) }, (_, index) => `<i style="--token:${index}"></i>`).join("")}</div>`;
  }

  function groupedTokens(groupCount, itemsPerGroup, selectedCount, className) {
    return `<div class="fra13-groups ${className || ""}" style="--groups:${Math.max(1, Number(groupCount) || 1)}" aria-hidden="true">${Array.from({ length: Math.max(1, Number(groupCount) || 1) }, (_, group) => `<div class="fra13-group${group < Number(selectedCount || 0) ? " is-selected" : ""}" style="--group:${group}">${tokenRow(itemsPerGroup)}</div>`).join("")}</div>`;
  }

  function amountLabel(problem) {
    if (!problem) return "";
    const quantity = problem.quantity || {};
    if (quantity.kind === "money") return `£${(quantity.amountBaseUnits / 100).toFixed(quantity.amountBaseUnits % 100 ? 2 : 0)}`;
    const unit = quantity.unit?.symbol || quantity.unit?.plural || "";
    return `${quantity.amountBaseUnits}${unit ? ` ${unit}` : ""}`;
  }

  function expression(problem) {
    if (!problem) return "";
    return `<div class="fra13-expression">${fraction(problem.numerator, problem.denominator)}<span>of</span><strong>${escapeHtml(amountLabel(problem))}</strong></div>`;
  }

  function worked(problem, model, reveal) {
    if (!reveal || !problem) return "";
    const steps = model?.workedSteps || [];
    const money = problem.quantity?.kind === "money";
    const format = (value) => money ? `£${(Number(value) / 100).toFixed(2)}` : value;
    const fallback = [
      `${format(problem.quantity.amountBaseUnits)} ÷ ${problem.denominator} = ${format(problem.derived?.oneShareBaseUnits)}`,
      `${format(problem.derived?.oneShareBaseUnits)} × ${problem.numerator} = ${format(problem.derived?.resultBaseUnits)}`
    ];
    const visible = steps.length ? steps : fallback;
    return `<div class="fra13-working" aria-label="Working shown after the answer was locked">${visible.map((step, index) => `<div style="--step:${index}"><span>${index + 1}</span><b>${escapeHtml(step)}</b></div>`).join("")}</div>`;
  }

  function hookMarkup(model, reveal) {
    const problem = model.problem || {};
    return `<div class="fra13-hook${reveal ? " is-revealed" : ""}">
      <article class="fra13-reward-card card-a"><span>Card A</span>${tokenRow(8)}<strong>8 tokens</strong></article>
      <div class="fra13-or">or</div>
      <article class="fra13-reward-card card-b"><span>Card B</span><div class="fra13-card-fraction">${fraction(3, 5)}<b>of 20 tokens</b></div>${reveal ? groupedTokens(5, 4, 3, "fra13-hook-groups") : tokenRow(20, "fra13-neutral-tokens")}${reveal ? `<strong>${problem.derived?.resultBaseUnits || 12} tokens</strong>` : ""}</article>
    </div>`;
  }

  function equalGroupsMarkup(visual, model) {
    const problem = model.problem || {};
    const groups = visual.groupCount || visual.rackCount || problem.denominator;
    const perGroup = visual.itemsPerGroup || visual.conesPerRack || problem.derived?.oneShareBaseUnits;
    const selected = visual.selectedGroupCount || 0;
    const totals = visual.runningTotals || [];
    return `<div class="fra13-equal-model">${expression(problem)}${groupedTokens(groups, perGroup, selected, visual.kind === "equal_group_cone_racks" ? "is-cones" : "")}${totals.length ? `<div class="fra13-running-totals" aria-hidden="true">${totals.map((total) => `<span>${total}</span>`).join("")}</div>` : ""}${visual.showEquationAfterSpeech ? `<div class="fra13-method-line"><b>${problem.quantity.amountBaseUnits} ÷ ${problem.denominator}</b><span>= ${problem.derived.oneShareBaseUnits}</span></div>` : ""}</div>`;
  }

  function contextIcon(kind) {
    const icons = { cable_reel: "cable reel", game_voucher: "game voucher", ribbon_roll: "ribbon roll", prize_fund_card: "prize fund", money_expression: "money", bag_context: "storage bag", fund_context: "fund" };
    return `<div class="fra13-context-icon is-${escapeHtml(kind)}" aria-hidden="true"><i></i><span>${escapeHtml(icons[kind] || "amount")}</span></div>`;
  }

  function questionMarkup(visual, model, reveal) {
    const problem = model.problem || {};
    const kind = visual.kind || "fraction_of_amount_expression";
    if (["guided_equal_groups", "guided_two_step_groups"].includes(kind)) return `<div class="fra13-question-model">${expression(problem)}${groupedTokens(visual.groupCount || problem.denominator, visual.itemsPerGroup || problem.derived?.oneShareBaseUnits, reveal ? (visual.selectedGroupCount || problem.numerator) : 0)}${worked(problem, model, reveal)}</div>`;
    if (kind === "faded_two_step_workspace") return `<div class="fra13-workspace">${expression(problem)}<div class="fra13-empty-method"><span>Find one equal share</span><i></i><span>Take the required shares</span><i></i></div>${worked(problem, model, reveal)}</div>`;
    if (kind === "operation_plan_choices") return `<div class="fra13-plan-visual">${expression(problem)}<div><span>amount</span><i>→</i><span>one share</span><i>→</i><span>required shares</span></div>${worked(problem, model, reveal)}</div>`;
    if (kind === "reasoning_work_sample") {
      const sample = model.questionId === "A5" ? "35 ÷ 7 = 5" : "40 ÷ 5 = 8";
      return `<div class="fra13-work-sample"><span>Learner's work</span><strong>${sample}</strong><i aria-hidden="true">…</i>${worked(problem, model, reveal)}</div>`;
    }
    if (kind === "ungrouped_counter_set") return `<div class="fra13-ungrouped">${expression(problem)}${tokenRow(problem.quantity?.amountBaseUnits || 0, "fra13-neutral-tokens")}${worked(problem, model, reveal)}</div>`;
    if (["cable_reel", "game_voucher", "ribbon_roll", "prize_fund_card", "money_expression", "bag_context", "fund_context"].includes(kind)) return `<div class="fra13-context-card">${contextIcon(kind)}${expression(problem)}${worked(problem, model, reveal)}</div>`;
    return `<div class="fra13-expression-card">${expression(problem)}${worked(problem, model, reveal)}</div>`;
  }

  function repairMarkup(visual, model) {
    const problem = model.problem || {};
    if (visual.kind === "equal_share_accumulation") return `<div class="fra13-repair-model">${expression(problem)}${groupedTokens(visual.groupCount, visual.itemsPerGroup, visual.selectedGroupCount)}<div class="fra13-running-totals">${(visual.runningTotals || []).map((total) => `<span>${total}</span>`).join("")}</div></div>`;
    if (visual.kind === "wrong_vs_right_grouping") return `<div class="fra13-group-contrast"><div class="is-wrong"><strong>Not four groups</strong>${groupedTokens(visual.wrongLayout.groupCount, visual.wrongLayout.itemsPerGroup, 0)}</div><div class="is-right"><strong>Five equal groups</strong>${groupedTokens(visual.rightLayout.groupCount, visual.rightLayout.itemsPerGroup, visual.selectedGroupCount)}</div></div>`;
    if (visual.kind === "fraction_role_arrows") return `<div class="fra13-role-arrows">${fraction(problem.numerator, problem.denominator)}<div><span><b>denominator</b> → divide into equal shares</span><span><b>numerator</b> → multiply to take shares</span></div></div>`;
    if (visual.kind === "incomplete_vs_complete_operator") return `<div class="fra13-operator-contrast"><span class="is-wrong">${escapeHtml(visual.wrongExpression)}</span><span class="is-right">${escapeHtml(visual.rightExpression)}</span><small>Also valid when completed: ${escapeHtml(visual.acceptCompletedAlternateOrder)}</small></div>`;
    return questionMarkup(visual, model, true);
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const authoredVisual = model.visual || {};
    const reveal = ["correct", "worked"].includes(context?.feedback);
    const kind = authoredVisual.kind;
    if (kind === "reward_card_choice") return hookMarkup(model, reveal);
    if (["equal_group_token_model", "equal_group_cone_racks"].includes(kind)) return equalGroupsMarkup(authoredVisual, model);
    if (kind === "stage_transition") return `<div class="fra13-handoff"><span>${escapeHtml(authoredVisual.fromLabel || "Learn the idea")}</span><i aria-hidden="true">→</i><strong>${escapeHtml(authoredVisual.toLabel || "Try it with me")}</strong></div>`;
    if (String(model.questionId || "").startsWith("R-")) return repairMarkup(authoredVisual, model);
    return questionMarkup(authoredVisual, model, reveal);
  }

  function accessibleDescription(model, context) {
    const visual = model?.visual || {};
    const problem = model?.problem;
    const reveal = ["correct", "worked"].includes(context?.feedback);
    if (model?.accessibleDescription) return model.accessibleDescription;
    if (visual.authorOnlyAccessibleDescription) return visual.authorOnlyAccessibleDescription;
    if (visual.kind === "reward_card_choice") return reveal ? "Card A shows eight tokens. Card B now groups twenty tokens into five equal groups and selects three groups." : "Card A shows exactly eight tokens. Card B shows exactly twenty neutral, ungrouped tokens with the label three fifths of twenty.";
    if (!problem) return "A transition between the teaching and guided stages.";
    const base = `A model for ${problem.numerator} over ${problem.denominator} of ${amountLabel(problem)}.`;
    return reveal ? `${base} The completed working is now visible.` : `${base} The answer and completed working are not shown.`;
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const visual = container.querySelector(".fra13-visual");
      if (visual && event.detail?.id) visual.setAttribute("data-fra13-cue", event.detail.id);
    });
  }

  window.RevilyFra13Visuals = { accessibleDescription, bind, renderMarkup };
})();
