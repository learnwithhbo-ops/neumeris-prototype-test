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

  function positive(value, fallback, maximum) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) return fallback;
    return Math.min(number, maximum || 40);
  }

  function selected(value, total) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) return 0;
    return Math.min(number, total);
  }

  function fractionValues(model) {
    const fraction = model?.fraction || {};
    return {
      numerator: fraction.numerator ?? model?.selectedParts ?? "?",
      denominator: fraction.denominator ?? model?.totalParts ?? "?"
    };
  }

  function fractionMarkup(model, compact) {
    const values = fractionValues(model);
    return `<span class="fra03-fraction${compact ? " is-compact" : ""}" aria-label="${escapeHtml(values.numerator)} over ${escapeHtml(values.denominator)}"><span>${escapeHtml(values.numerator)}</span><i aria-hidden="true"></i><span>${escapeHtml(values.denominator)}</span></span>`;
  }

  function areaMarkup(model) {
    const total = positive(model?.totalParts, 1, 16);
    const count = selected(model?.selectedParts, total);
    const unequal = model?.equalParts === false || model?.unequalParts === true;
    const geometry = Array.isArray(model?.geometry) && model.geometry.length === total
      ? model.geometry.map((width) => Math.max(0.25, Number(width) || 1))
      : Array.from({ length: total }, () => 1);
    const cells = Array.from({ length: total }, (_, index) => `<span class="fra03-area-part${index < count ? " is-selected" : ""}" style="--part-weight:${geometry[index]};--part-index:${index}" aria-hidden="true"><i>${index < count ? "✓" : ""}</i></span>`).join("");
    const classes = [
      "fra03-area-model",
      unequal ? "is-unequal" : "",
      model?.progressTiles ? "is-progress-panel" : "",
      model?.teachingVariant === "progress_area" ? "is-teaching-progress" : ""
    ].filter(Boolean).join(" ");
    return `<div class="${classes}" style="--fra03-parts:${total}" aria-hidden="true">${cells}</div>`;
  }

  function tokenMarkup(index, isSelected, model) {
    const kind = model?.challengeCards ? " is-card" : model?.challengeBadges ? " is-badge" : "";
    const label = model?.challengeCards ? index + 1 : model?.challengeBadges ? index + 1 : "";
    return `<span class="fra03-token${kind}${isSelected ? " is-selected" : ""}" style="--token-index:${index}" aria-hidden="true"><i>${escapeHtml(label)}</i><b>${isSelected ? "✓" : ""}</b></span>`;
  }

  function setMarkup(model) {
    const total = positive(model?.totalParts, 1, 24);
    const count = selected(model?.selectedParts, total);
    const tokens = Array.from({ length: total }, (_, index) => tokenMarkup(index, index < count, model)).join("");
    const label = model?.challengeCards ? "one whole card set" : model?.challengeBadges ? "one whole challenge set" : "one whole group";
    const classes = [
      "fra03-set-boundary",
      model?.croppedWhole ? "is-cropped" : "",
      model?.challengeCards ? "is-card-set" : "",
      model?.challengeBadges ? "is-badge-set" : "",
      model?.teachingVariant === "badge_set" ? "is-teaching-badges" : ""
    ].filter(Boolean).join(" ");
    return `<div class="${classes}" aria-hidden="true"><div class="fra03-token-grid" style="--token-columns:${Math.min(6, Math.max(3, Math.ceil(Math.sqrt(total))))}">${tokens}</div><small>${model?.croppedWhole ? "Only selected objects are shown" : label}</small></div>`;
  }

  function numberLineMarkup(model) {
    const intervals = positive(model?.equalIntervals || model?.totalParts, 5, 14);
    const mark = selected(model?.markedInterval ?? model?.selectedParts, intervals);
    const ticks = Array.from({ length: intervals + 1 }, (_, index) => `<span class="fra03-tick${index === mark ? " is-marked" : ""}" style="--tick-position:${(index / intervals) * 100}%" aria-hidden="true"><i></i>${index === 0 || index === intervals ? `<b>${index === 0 ? "0" : "1"}</b>` : ""}</span>`).join("");
    const bands = Array.from({ length: intervals }, (_, index) => `<span class="fra03-interval${index < mark ? " is-travelled" : ""}" style="--interval-start:${(index / intervals) * 100}%;--interval-width:${100 / intervals}%" aria-hidden="true"><i>${index + 1}</i></span>`).join("");
    const routeLabels = model?.routeStyle ? `<span class="fra03-route-start" aria-hidden="true">START</span><span class="fra03-route-finish" aria-hidden="true">FINISH</span><span class="fra03-route-you" aria-hidden="true">YOU</span>` : "";
    const visibleCountSummary = model?.assessmentVisual
      ? ""
      : `<small>${intervals} equal intervals · ${intervals + 1} boundary marks</small>`;
    return `<div class="fra03-number-line${model?.routeStyle ? " is-route" : ""}" style="--marked-position:${(mark / intervals) * 100}%" aria-hidden="true"><div class="fra03-line-track">${bands}${ticks}<span class="fra03-mark"><i></i></span>${routeLabels}</div>${visibleCountSummary}</div>`;
  }

  function singleModelMarkup(model) {
    const context = String(model?.context || "");
    if (context === "area_model") return areaMarkup(model);
    if (context === "set_model") return setMarkup(model);
    if (context === "number_line") return numberLineMarkup(model);
    return "";
  }

  function stateSequence(total, count, selectedLabel, unselectedLabel) {
    return Array.from({ length: total }, (_, index) => index < count ? selectedLabel : unselectedLabel).join("; ");
  }

  function accessibleModelFacts(model) {
    if (!model) return "A visual fraction model.";
    const context = String(model.context || "fraction model");
    const total = Number(model.totalParts) || 0;
    const count = Number(model.selectedParts) || 0;
    if (context === "area_model") {
      return `One rectangular whole. Region sizes are ${model.unequalParts ? "visibly unequal" : "equal"}. Region states in reading order: ${stateSequence(total, count, "selected with a blue fill and check", "unselected")}.`;
    }
    if (context === "set_model") {
      if (model.croppedWhole) return "A cropped candidate contains selected objects only; no unselected objects remain visible, so the complete group is not defined.";
      return `A visible boundary defines the whole group. Object states in reading order: ${stateSequence(total, count, "selected with a blue fill and check", "unselected")}.`;
    }
    if (context === "number_line") {
      const intervals = Number(model.equalIntervals) || total;
      const travelled = Number(model.markedInterval ?? count) || 0;
      return `A number line runs from zero to one and is split into equal spaces. Interval states from zero: ${stateSequence(intervals, travelled, "travelled", "not travelled")}. The point stands on the boundary where the travelled sequence ends.`;
    }
    return "A visual fraction model for the current explanation.";
  }

  function optionMarkup(model) {
    const drawing = singleModelMarkup(model);
    return `<span class="fra03-option-model${model?.unequalParts ? " is-invalid-geometry" : ""}">${drawing}</span><span class="model-choice-label">${escapeHtml(model?.label || "")}</span><span class="visually-hidden">${escapeHtml(accessibleModelFacts(model))}</span>`;
  }

  function crossModelMarkup(model, options) {
    const opts = options || {};
    const variants = Array.isArray(model?.variants) ? model.variants : [];
    const names = ["AREA", "SET", "NUMBER LINE"];
    const drawings = variants.map((variant, index) => `<div class="fra03-cross-item model-${index + 1}" data-model-kind="${escapeHtml(variant.context)}"><span>${names[index] || "MODEL"}</span>${singleModelMarkup(variant)}</div>`).join("");
    const classes = [
      "fra03-cross-model",
      opts.reveal ? "is-revealed" : "",
      model?.teachingVariant === "cross_sequence" ? "is-sequence" : ""
    ].filter(Boolean).join(" ");
    return `<div class="${classes}">${drawings}${model?.fraction ? `<div class="fra03-shared-fraction">${fractionMarkup(model)}</div>` : ""}</div>`;
  }

  function promptMarkup(model) {
    const source = model?.context === "translation_prompt" && model?.sourceModel
      ? `<div class="fra03-translation-source"><small>AREA MODEL</small>${singleModelMarkup(model.sourceModel)}</div>`
      : "";
    return `<div class="fra03-model-prompt">${source}<small>${source ? "Keep this fraction fixed" : "Target fraction"}</small>${fractionMarkup(model)}</div>`;
  }

  function handoffMarkup() {
    return `<div class="fra03-handoff" aria-hidden="true"><span><b>AREA</b><i></i></span><em>→</em><span><b>SET</b><i></i></span><em>→</em><span><b>NUMBER LINE</b><i></i></span><strong>same fraction</strong></div>`;
  }

  function gameProgressMarkup(model, compareOnly) {
    const variants = model?.variants || [];
    const areaModel = variants.find((item) => item.context === "area_model") || { context: "area_model", totalParts: 5, selectedParts: 3, progressTiles: true };
    const setModel = variants.find((item) => item.context === "set_model") || { context: "set_model", totalParts: 5, selectedParts: 3, challengeBadges: true };
    const lineModel = variants.find((item) => item.context === "number_line") || { context: "number_line", totalParts: 5, selectedParts: 3, equalIntervals: 5, markedInterval: 3, routeStyle: true };
    if (compareOnly) {
      return `<div class="fra03-game-compare"><div><small>LEVEL PROGRESS</small>${areaMarkup(areaModel)}</div><div><small>CHALLENGES</small>${setMarkup(setModel)}</div><div><small>ROUTE</small>${numberLineMarkup(lineModel)}</div><strong>${fractionMarkup(model, true)} complete</strong></div>`;
    }
    return `<div class="fra03-game-transform" aria-hidden="true"><div class="fra03-game-layer layer-progress"><small>CHALLENGE PROGRESS</small>${areaMarkup(areaModel)}<strong>${fractionMarkup(model, true)} complete</strong></div><div class="fra03-game-layer layer-badges"><small>CHALLENGE BADGES</small>${setMarkup(setModel)}<strong>${fractionMarkup(model, true)} complete</strong></div><div class="fra03-game-layer layer-route"><small>START TO FINISH</small>${numberLineMarkup(lineModel)}<strong>${fractionMarkup(model, true)} complete</strong></div><div class="fra03-game-layer layer-compare">${crossModelMarkup(model, { reveal: true })}</div></div>`;
  }

  function repairMarkup(model) {
    if (model.context === "area_repair") return `<div class="fra03-repair-pair">${(model.variants || []).map((variant) => `<div><small>${escapeHtml(variant.label)}</small>${areaMarkup(variant)}</div>`).join("")}</div>`;
    if (model.context === "whole_repair") return `<div class="fra03-repair-pair">${(model.variants || []).map((variant) => `<div><small>${escapeHtml(variant.label)}</small>${setMarkup(variant)}</div>`).join("")}${fractionMarkup(model)}</div>`;
    if (model.context === "same_fraction_repair") return crossModelMarkup(model, { reveal: true });
    return "";
  }

  function teachingMarkup(model) {
    const context = String(model?.context || "");
    if (context === "game_progress_transform") return gameProgressMarkup(model, false);
    if (context === "game_progress_compare") return gameProgressMarkup(model, true);
    if (context === "cross_model") return crossModelMarkup(model, { reveal: model?.teachingVariant !== "cross_sequence" });
    if (["area_repair", "whole_repair", "same_fraction_repair"].includes(context)) return repairMarkup(model);
    if (context === "handoff") return handoffMarkup();
    const drawing = singleModelMarkup(model);
    return `<div class="fra03-teaching-model">${drawing}${model?.fraction ? fractionMarkup(model) : ""}</div>`;
  }

  function workedMarkup(question) {
    const answer = question?.answer?.value;
    if (question?.policy?.engagementOnly) return `<div class="fra03-worked"><span>What stayed fixed</span><b>three fifths</b></div>`;
    if (Array.isArray(answer)) return `<div class="fra03-worked"><span>Valid models</span><b>${escapeHtml(answer.join(", "))}</b></div>`;
    if (question?.response?.type === "set_builder") return `<div class="fra03-worked"><span>Selected in the whole set</span><b>${escapeHtml(answer)} of ${escapeHtml(question?.model?.totalParts)}</b></div>`;
    return `<div class="fra03-worked"><span>Locked answer</span><b>${escapeHtml(String(answer || "").replace(/^[A-D]\.\s*/, ""))}</b></div>`;
  }

  function questionMarkup(question, feedback) {
    const model = question?.model || {};
    const context = String(model.context || "");
    const reveal = ["correct", "support", "worked"].includes(feedback);
    let drawing = "";
    if (["model_choice_prompt", "set_builder_target", "translation_prompt"].includes(context)) drawing = promptMarkup(model);
    else if (context === "game_progress_compare") drawing = gameProgressMarkup(model, true);
    else if (context === "cross_model") drawing = crossModelMarkup(model, { reveal: reveal || model.renderOptionsOnCanvas });
    else drawing = singleModelMarkup(model);
    return `<div class="fra03-question-model"><div class="fra03-question-object">${drawing}</div>${reveal ? workedMarkup(question) : ""}</div>`;
  }

  function renderMarkup(visual, context) {
    const ctx = context || {};
    const currentModel = ctx.question?.model || visual?.scene?.model || visual?.model || {};
    if (ctx.question) {
      if (ctx.question.policy?.reteachOnly) return teachingMarkup(currentModel);
      return questionMarkup(ctx.question, ctx.feedback || "initial");
    }
    return teachingMarkup(currentModel);
  }

  function accessibleDescription(model) {
    if (!model) return "A visual fraction model.";
    const context = String(model.context || "fraction model");
    if (context === "game_progress_transform") return "A blank game progress panel is divided into five equal tiles. Narration will transform this same canvas through the three model types.";
    if (model.teachingVariant === "progress_area") return "One complete rectangular progress panel is visible. Its internal equal-tile structure and selected state have not been revealed yet.";
    if (model.teachingVariant === "badge_set") return "Five challenge badges are visible inside one whole-group boundary. No badge is marked complete yet.";
    if (model.teachingVariant === "route") return "A number line runs from zero to one. The marker begins at zero, and the fraction label is hidden.";
    if (context === "game_progress_compare") return "Three views of the same game progress are compared: a five-tile panel, five challenge badges, and a zero-to-one route with five equal spaces.";
    if (context === "cross_model") return "An area model, a bounded set model and a zero-to-one number line are shown. Inspect the whole, equal parts and selected or travelled parts in each model.";
    if (context === "model_choice_prompt") return `The target fraction is ${model.selectedParts} over ${model.totalParts}. Candidate models are available as answer controls, each with its own factual description.`;
    if (context === "translation_prompt") return `A source area model has ${model.totalParts} equal regions, with regions 1 through ${model.selectedParts} selected. Candidate set models are available as answer controls.`;
    if (context === "set_builder_target") return `The written fraction is ${model.selectedParts} over ${model.totalParts}. A separate bounded set contains ${model.totalParts} selectable objects.`;
    if (context === "area_repair") return "Two area models have the same number of selected regions. One has unequal regions and the other has equal regions.";
    if (context === "whole_repair") return "Two set models are compared. One keeps the complete group visible inside a boundary; the other crops away the unselected objects.";
    if (context === "same_fraction_repair") return "Area, set and number-line models each preserve the same selected count and whole-part count.";
    if (context === "handoff") return "Area, set and number-line model names connected by a same-fraction pathway.";
    return accessibleModelFacts(model);
  }

  window.RevilyFra03Visuals = {
    accessibleDescription,
    areaMarkup,
    fractionMarkup,
    numberLineMarkup,
    optionMarkup,
    renderMarkup,
    setMarkup
  };
})();
