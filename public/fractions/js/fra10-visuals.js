(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const frac = (value, className) => value ? `<span class="fra10-fraction ${className || ""}" aria-label="${value.numerator} over ${value.denominator}"><b>${escapeHtml(value.numerator)}</b><i></i><b>${escapeHtml(value.denominator)}</b></span>` : "";
  const factorChip = (factor, label) => `<span class="fra10-factor-chip"><small>${escapeHtml(label || "common factor")}</small><b>${escapeHtml(factor)}</b></span>`;
  const arrow = (label) => `<span class="fra10-arrow" aria-hidden="true"><small>${escapeHtml(label || "")}</small>→</span>`;

  function modelFor(visual, context) {
    return context?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function workedMarkup(model, reveal) {
    if (!reveal || !(model.workedUi || []).length) return "";
    return `<ol class="fra10-worked" aria-label="Worked check">${model.workedUi.map((step, index) => `<li style="--fra10-step:${index}"><span>${index + 1}</span><p>${escapeHtml(step)}</p></li>`).join("")}</ol>`;
  }

  function conflictMarkup(model, reveal) {
    const source = model.sourceFraction || { numerator: 12, denominator: 18 };
    const cards = model.answerCards || [];
    return `<div class="fra10-conflict"><div class="fra10-source-card"><small>same starting value</small>${frac(source)}</div>${arrow("simplified two ways")}<div class="fra10-answer-cards">${cards.map((card) => `<section class="fra10-answer-card answer-${card.id.toLowerCase()}"><small>Answer ${card.id}</small>${frac(card.fraction)}<span class="fra10-factor-state">${card.id === "A" ? "shares 3" : "HCF = 1"}</span>${reveal && card.id === "B" ? "<strong>finished</strong>" : ""}</section>`).join("")}</div></div>`;
  }

  function barMarkup() {
    return `<div class="fra10-bar-scene"><div class="fra10-bar-row nine" role="img" aria-label="A bar with nine equal parts, six selected">${Array.from({ length: 9 }, (_, index) => `<i class="${index < 6 ? "selected" : ""}${index % 3 === 0 ? " group-start" : ""}"></i>`).join("")}</div><div class="fra10-transform-row">${frac({ numerator: 6, denominator: 9 })}${factorChip(3)}${arrow("divide both")}${frac({ numerator: 2, denominator: 3 }, "result")}</div><div class="fra10-bar-row thirds" role="img" aria-label="The same bar grouped into three equal thirds, two selected">${Array.from({ length: 3 }, (_, index) => `<i class="${index < 2 ? "selected" : ""}"></i>`).join("")}</div><span class="fra10-finished-badge">HCF = 1 · simplest form</span></div>`;
  }

  function factorList(label, values, shared) {
    return `<div class="fra10-factor-row"><strong>${escapeHtml(label)}</strong><div>${values.map((value) => `<span class="${shared.includes(value) ? "shared" : ""}">${value}</span>`).join("")}</div></div>`;
  }

  function comparisonMarkup() {
    return `<div class="fra10-comparison"><section class="not-finished"><small>looks small · not finished</small>${frac({ numerator: 6, denominator: 10 })}${factorList("6 factors", [1, 2, 3, 6], [1, 2])}${factorList("10 factors", [1, 2, 5, 10], [1, 2])}<div>${arrow("÷ 2")}${frac({ numerator: 3, denominator: 5 }, "result")}</div></section><section class="already"><small>larger numbers · already simplest</small>${frac({ numerator: 7, denominator: 12 })}${factorList("7 factors", [1, 7], [1])}${factorList("12 factors", [1, 2, 3, 4, 6, 12], [1])}<strong>only 1 is shared</strong></section></div>`;
  }

  function hcfMarkup() {
    return `<div class="fra10-hcf-route">${frac({ numerator: 24, denominator: 36 })}${factorChip(12, "HCF")}${arrow("one clean step")}${frac({ numerator: 2, denominator: 3 }, "result")}<div class="fra10-division-pair"><span>24 ÷ 12 = 2</span><span>36 ÷ 12 = 3</span></div><span class="fra10-finished-badge">only common factor: 1</span></div>`;
  }

  function branchingMarkup() {
    return `<div class="fra10-branches"><div class="fra10-branch-source">${frac({ numerator: 60, denominator: 84 })}</div><div class="fra10-branch-grid"><section class="multi"><small>several steps</small>${arrow("÷ 2")}${frac({ numerator: 30, denominator: 42 })}${arrow("÷ 6")}${frac({ numerator: 5, denominator: 7 }, "result")}</section><section class="direct"><small>one HCF step</small>${arrow("÷ 12")}${frac({ numerator: 5, denominator: 7 }, "result")}</section></div><strong>same final simplest form · HCF(5,7) = 1</strong></div>`;
  }

  function improperMarkup() {
    return `<div class="fra10-improper"><section><small>improper · needs simplifying</small><div>${frac({ numerator: 42, denominator: 30 })}${arrow("÷ 6")}${frac({ numerator: 7, denominator: 5 }, "result")}</div><span class="fra10-boundary-badge">leave as improper</span></section><section><small>improper · already simplest</small>${frac({ numerator: 11, denominator: 7 })}<strong>only 1 is shared</strong></section></div>`;
  }

  function transitionMarkup() {
    return `<div class="fra10-transition"><span>Learn the idea</span>${arrow("")}<span class="active">Try it with me</span><div class="fra10-plan"><i>1</i> choose a factor <i>2</i> divide together <i>3</i> check again <i>4</i> stop at HCF 1</div></div>`;
  }

  function ticketMarkup(model) {
    const total = Number(model.totalTicketCount || model.totalCount || 30);
    const selected = Number(model.selectedTicketCount || model.selectedCount || 18);
    return `<div class="fra10-ticket-visual"><div class="fra10-ticket-grid" role="img" aria-label="Exactly ${selected} selected tickets out of ${total} equal tickets">${Array.from({ length: total }, (_, index) => `<i class="${index < selected ? "selected" : ""}"><span aria-hidden="true">${index + 1}</span></i>`).join("")}</div><strong>${selected} online tickets out of ${total} total</strong></div>`;
  }

  function factorRowsMarkup(model) {
    return `<div class="fra10-factor-rows">${frac(model.sourceFraction)}${factorList("Factors of 28", model.numeratorFactors || [], [])}${factorList("Factors of 42", model.denominatorFactors || [], [])}<p>Find a factor that appears in both rows.</p></div>`;
  }

  function choiceFractionsMarkup(model, reveal) {
    const fractions = model.fractions || [];
    return `<div class="fra10-fraction-options">${fractions.map((entry, index) => { const id = entry.id || entry.optionId || String.fromCharCode(65 + index); return `<section class="${reveal && id === model.answerOptionId ? "correct" : ""}"><small>${escapeHtml(id)}</small>${frac(entry.fraction)}</section>`; }).join("")}</div>`;
  }

  function repairMarkup(model, reveal) {
    if (model.kind === "three_state_simplification_chain") {
      return `<div class="fra10-repair-chain">${(model.states || []).map((state, index) => `${frac(state.fraction, index === 2 ? "result" : "")}${index < model.states.length - 1 ? arrow(index === 0 ? "valid, not finished" : "÷ 4") : ""}`).join("")}<span class="fra10-finished-badge">finished only when HCF = 1</span></div>`;
    }
    if (model.kind === "invalid_vs_valid_same_factor") {
      return `<div class="fra10-repair-contrast"><section class="invalid"><small>only one number changes</small>${frac(model.invalid?.sourceFraction)}${arrow("")}${frac(model.invalid?.resultFraction)}<strong>different value</strong></section><section class="valid"><small>same factor on both</small>${frac(model.valid?.sourceFraction)}${arrow(`÷ ${model.valid?.factor}`)}${frac(model.valid?.resultFraction, "result")}<strong>same value</strong></section></div>`;
    }
    if (model.kind === "try_factor_on_both_numbers") {
      return `<div class="fra10-try-factor">${frac(model.sourceFraction)}<div class="fra10-factor-cards">${(model.factorCards || []).map((card) => `<span class="${card.factor === 12 ? "valid" : "invalid"}">${card.factor}</span>`).join("")}</div>${reveal ? frac(model.acceptedResult, "result") : ""}<p>A factor is accepted only when both divisions are exact.</p></div>`;
    }
    if (model.kind === "small_not_simple_vs_larger_simple") {
      return `<div class="fra10-repair-contrast"><section class="invalid"><small>small but not simplest</small>${frac(model.left?.fraction)}<strong>shared factor ${model.left?.sharedFactor}</strong></section><section class="valid"><small>larger but simplest</small>${frac(model.right?.fraction)}<strong>only shared factor 1</strong></section></div>`;
    }
    if (model.kind === "different_factors_vs_same_factor") {
      return `<div class="fra10-repair-contrast"><section class="invalid"><small>different divisors</small>${frac(model.invalid?.sourceFraction)}${arrow(`top ÷ ${model.invalid?.numeratorDivisor}; bottom ÷ ${model.invalid?.denominatorDivisor}`)}${frac(model.invalid?.resultFraction)}<strong>different value</strong></section><section class="valid"><small>one factor on both</small>${frac(model.valid?.sourceFraction)}${arrow(`÷ ${model.valid?.factor}`)}${frac(model.valid?.resultFraction, "result")}<strong>same value</strong></section></div>`;
    }
    return "";
  }

  function questionMarkup(model, reveal) {
    const repair = repairMarkup(model, reveal);
    if (repair) return repair;
    if (model.kind === "ticket_set" || model.kind === "question_tile_set") return `${ticketMarkup(model)}${workedMarkup(model, reveal)}`;
    if (model.kind === "factor_rows_plus_fraction_input") return factorRowsMarkup(model);
    if (model.kind === "four_fraction_choice_cards") return choiceFractionsMarkup(model, reveal);
    if (model.kind === "reasoning_choice_with_equation") return `<div class="fra10-reasoning"><div>${frac(model.equation?.source)}${arrow("valid first step")}${frac(model.equation?.intermediate)}</div><p>Is the new fraction finished?</p></div>`;
    if (model.kind === "statement_choice_with_fraction") return `<div class="fra10-statement">${frac(model.sourceFraction)}${reveal ? `<div>${factorList("Factors of 14", [1, 2, 7, 14], [1])}${factorList("Factors of 25", [1, 5, 25], [1])}</div>` : ""}</div>${workedMarkup(model, reveal)}`;
    if (model.kind === "shown_intermediate_plus_fraction_input" || model.kind === "intermediate_then_final_fraction_input") {
      return `<div class="fra10-question-transform">${model.sourceFraction ? frac(model.sourceFraction) : ""}${arrow("first valid step")}${frac(model.shownIntermediateFraction)}${arrow(reveal ? "check again" : "finish")}${reveal ? frac(model.expectedFraction, "result") : `<span class="fra10-blank-fraction"><b>?</b><i></i><b>?</b></span>`}</div>${workedMarkup(model, reveal)}`;
    }
    if (model.kind === "plain_fraction_input_with_boundary_badge") {
      return `<div class="fra10-question-source">${frac(model.sourceFraction)}<span class="fra10-boundary-badge">Leave as an improper fraction</span></div>${workedMarkup(model, reveal)}`;
    }
    if (model.kind === "factor_route_builder") return `<div class="fra10-question-source route">${frac(model.sourceFraction)}<p>Choose any exact common factor. After each step, decide whether another factor remains.</p></div>`;
    if (model.kind === "fraction_input_with_hcf_badge") return `<div class="fra10-question-source">${frac(model.sourceFraction)}${factorChip(model.shownFactor, "HCF")}</div>`;
    return `<div class="fra10-question-source">${frac(model.sourceFraction)}${reveal && model.expectedFraction ? `${arrow("finished")}${frac(model.expectedFraction, "result")}` : ""}</div>${workedMarkup(model, reveal)}`;
  }

  function teachingMarkup(model) {
    if (model.kind === "simplification_conflict_cards") return conflictMarkup(model, true);
    if (model.kind === "grouped_fraction_bar_with_factor_check") return barMarkup();
    if (model.kind === "paired_factor_list_comparison") return comparisonMarkup();
    if (model.kind === "one_step_hcf_route") return hcfMarkup();
    if (model.kind === "branching_factor_routes") return branchingMarkup();
    if (model.kind === "improper_fraction_boundary_pair") return improperMarkup();
    return transitionMarkup();
  }

  function renderMarkup(visual, context) {
    const model = modelFor(visual, context);
    const reveal = ["correct", "worked"].includes(context?.feedback);
    const isTeaching = !context?.question && ["simplification_conflict_cards", "grouped_fraction_bar_with_factor_check", "paired_factor_list_comparison", "one_step_hcf_route", "branching_factor_routes", "improper_fraction_boundary_pair", "stage_transition"].includes(model.kind);
    return `<div class="fra10-visual" data-kind="${escapeHtml(model.kind || "plain_fraction_input")}" data-reveal="${reveal}">${isTeaching ? teachingMarkup(model) : questionMarkup(model, reveal)}</div>`;
  }

  function accessibleDescription(visual, context) {
    const model = modelFor(visual, context);
    const reveal = ["correct", "worked"].includes(context?.feedback);
    if (context?.question) {
      const prompt = model.accessibleDescription || context.question.prompt || "Simplify the fraction.";
      return reveal && model.expectedFraction ? `${prompt} The locked worked check now shows ${model.expectedFraction.numerator} over ${model.expectedFraction.denominator}.` : prompt;
    }
    const descriptions = {
      simplification_conflict_cards: "Twelve eighteenths leads to two equal-value answers: six ninths and two thirds. Only two thirds has no common factor greater than one.",
      grouped_fraction_bar_with_factor_check: "One equal-width bar has nine equal parts with six selected, grouped into thirds to show two thirds.",
      paired_factor_list_comparison: "Factor lists compare six tenths, which can simplify, with seven twelfths, which already shares only factor one.",
      one_step_hcf_route: "Twenty-four thirty-sixths divides by its highest common factor, twelve, to make two thirds.",
      branching_factor_routes: "Two valid routes simplify sixty eighty-fourths to five sevenths.",
      improper_fraction_boundary_pair: "Improper fractions forty-two thirtieths and eleven sevenths stay improper while the common-factor rule is checked."
    };
    return descriptions[model.kind] || "The lesson moves from explanation to learner-controlled factor choice.";
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const cue = event.detail;
      const visual = container.querySelector(".fra10-visual");
      if (visual && cue?.id) {
        visual.setAttribute("data-fra10-cue", cue.id);
        visual.classList.add(`fra10-cue-${String(cue.id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
      }
    });
  }

  window.RevilyFra10Visuals = { accessibleDescription, bind, renderMarkup };
})();
