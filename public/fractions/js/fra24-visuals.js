(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(value, className) {
    const numerator = value?.numerator ?? "?";
    const denominator = value?.denominator ?? "?";
    return `<span class="fra24-fraction ${escapeHtml(className || "")}" aria-hidden="true"><b>${escapeHtml(numerator)}</b><i></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function rawProduct(factors) {
    return {
      numerator: factors.first.numerator * factors.second.numerator,
      denominator: factors.first.denominator * factors.second.denominator
    };
  }

  function fractionExpression(factors, options) {
    const settings = options || {};
    const raw = rawProduct(factors);
    return `<div class="fra24-expression${settings.compact ? " is-compact" : ""}" aria-hidden="true">
      ${fraction(factors.first)}<span class="fra24-operation">×</span>${fraction(factors.second)}
      ${settings.showResult ? `<span class="fra24-operation">=</span>${fraction(raw, "fra24-result-fraction")}` : ""}
    </div>`;
  }

  function areaGrid(factors, options) {
    const settings = options || {};
    const columns = Math.max(1, Number(settings.visibleColumns || factors.first.denominator));
    const rows = Math.max(1, Number(settings.rows || factors.second.denominator));
    const selectedColumns = Math.max(0, Number(factors.first.numerator));
    const selectedRows = Math.max(0, Number(factors.second.numerator));
    const referenceColumns = Math.max(1, Number(settings.referenceColumns || factors.first.denominator));
    const cells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const first = column < selectedColumns;
        const second = row < selectedRows;
        const classes = ["fra24-cell", first ? "is-first" : "", second ? "is-second" : "", first && second ? "is-overlap" : "", column === referenceColumns - 1 ? "is-reference-edge" : ""].filter(Boolean).join(" ");
        cells.push(`<span class="${classes}" data-row="${row}" data-column="${column}"></span>`);
      }
    }
    return `<div class="fra24-grid-wrap${settings.improper ? " is-improper" : ""}">
      <div class="fra24-grid${settings.hook ? " is-hook-reveal" : ""}" style="--fra24-columns:${columns};--fra24-rows:${rows};--fra24-reference-columns:${referenceColumns}" aria-hidden="true">${cells.join("")}</div>
      ${settings.improper ? `<span class="fra24-reference-brace" style="--fra24-reference-ratio:${referenceColumns / columns}">reference whole: ${referenceColumns} columns</span>` : ""}
    </div>`;
  }

  function workedPanel(question) {
    const steps = question?.model?.workedSteps || [];
    if (!steps.length) return "";
    return `<ol class="fra24-worked" aria-label="Worked check">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
  }

  function mapScene(sceneId, visual, context) {
    const feedback = context.feedback || "initial";
    const factors = { first: visual.firstFraction, second: visual.secondFraction };
    const reveal = feedback === "worked";
    return `<div class="fra24-map-scene" data-fra24-scene="${escapeHtml(sceneId)}">
      <div class="fra24-map-copy" aria-hidden="true"><span>UNLOCKED ${fraction(visual.firstFraction)}</span><span>SCANNED ${fraction(visual.secondFraction)}</span></div>
      ${areaGrid(factors, { hook: sceneId === "HOOK", rows: visual.secondFraction.denominator })}
      <div class="fra24-grid-counts" aria-hidden="true"><span class="fra24-overlap-count">6 overlap cells</span><span class="fra24-whole-count">12 cells in the whole</span></div>
      <div class="fra24-hook-result" aria-hidden="true"><span class="fra24-raw-result">${fraction({ numerator: 6, denominator: 12 })}</span><span class="fra24-hook-simplify">→ ${fraction({ numerator: 1, denominator: 2 })}</span></div>
      ${sceneId === "T1" ? `<strong class="fra24-product-badge" aria-hidden="true">PRODUCT = overlap</strong>` : ""}
      ${reveal ? "" : ""}
    </div>`;
  }

  function gridToSymbolic(visual) {
    const factors = { first: visual.firstFraction, second: visual.secondFraction };
    return `<div class="fra24-grid-symbolic" data-fra24-scene="T2">
      ${areaGrid(factors)}
      <div class="fra24-meaning-lines" aria-hidden="true">
        <span class="fra24-numerator-meaning">selected columns × selected rows <b>3 × 2 = 6</b></span>
        <span class="fra24-denominator-meaning">all columns × all rows <b>4 × 3 = 12</b></span>
      </div>
      <div class="fra24-derived-result" aria-hidden="true"><span class="fra24-derived-raw">${fraction(factors.first)} × ${fraction(factors.second)} = ${fraction({ numerator: 6, denominator: 12 })}</span><span class="fra24-derived-simplify">→ ${fraction({ numerator: 1, denominator: 2 })}</span></div>
    </div>`;
  }

  function symbolicRows(factors, showResult) {
    const raw = rawProduct(factors);
    const resultNumerator = showResult ? raw.numerator : "?";
    const resultDenominator = showResult ? raw.denominator : "?";
    return `<div class="fra24-symbolic-rows">
      ${fractionExpression(factors, { showResult })}
      <div class="fra24-row-rails" aria-hidden="true">
        <span class="fra24-top-rail"><b>${factors.first.numerator}</b><i></i><b>${factors.second.numerator}</b><strong>${resultNumerator}</strong></span>
        <span class="fra24-bottom-rail"><b>${factors.first.denominator}</b><i></i><b>${factors.second.denominator}</b><strong>${resultDenominator}</strong></span>
      </div>
      <span class="fra24-no-common" aria-hidden="true">No common denominator needed</span>
    </div>`;
  }

  function improperScene(visual) {
    const factors = { first: visual.firstFraction, second: visual.secondFraction };
    return `<div class="fra24-improper-scene" data-fra24-scene="T4">
      ${fractionExpression(factors)}
      ${areaGrid(factors, { improper: true, visibleColumns: visual.visibleColumns, referenceColumns: visual.referenceWholeColumns, rows: visual.rows })}
      <div class="fra24-improper-products" aria-hidden="true"><span class="fra24-improper-top">5 × 3 = <b>15</b></span><span class="fra24-improper-bottom">4 × 7 = <b>28</b></span>${fraction({ numerator: 15, denominator: 28 }, "fra24-improper-result")}</div>
    </div>`;
  }

  function nestedContext(question, factors) {
    const context = question.learnerUi?.context || {};
    const project = question.visual.context === "project";
    const firstSuffix = context.firstSuffix || (project ? "of the full project is complete." : "of the full video is edited.");
    const secondSuffix = context.secondSuffix || (project ? "of the completed part has been checked." : "of the edited part has captions.");
    return `<div class="fra24-context-cards" aria-hidden="true">
      <section><span class="fra24-context-icon">${project ? "✓" : "▶"}</span>${fraction(factors.first)}<p>${escapeHtml(firstSuffix)}</p></section>
      <section><span class="fra24-context-icon">${project ? "✓✓" : "CC"}</span>${fraction(factors.second)}<p>${escapeHtml(secondSuffix)}</p></section>
    </div>`;
  }

  function rowPairingCards(factors) {
    return `<div class="fra24-row-cards" aria-label="Pair the numerator row, then the denominator row">
      <div class="fra24-card-row is-numerator"><span>Numerators</span><button type="button" data-fra24-row-card="numerator" aria-pressed="false">${factors.first.numerator}</button><button type="button" data-fra24-row-card="numerator" aria-pressed="false">${factors.second.numerator}</button></div>
      <div class="fra24-card-row is-denominator"><span>Denominators</span><button type="button" data-fra24-row-card="denominator" aria-pressed="false">${factors.first.denominator}</button><button type="button" data-fra24-row-card="denominator" aria-pressed="false">${factors.second.denominator}</button></div>
      <p class="fra24-row-card-status" aria-live="polite">Tap the numerator row first.</p>
    </div>`;
  }

  function questionMarkup(question, context) {
    const canonicalQuestion = question.canonicalQuestion || question.model?.canonicalQuestion;
    if (!canonicalQuestion) return "";
    const factors = canonicalQuestion.factors;
    const kind = canonicalQuestion.visual.kind;
    const worked = ["worked", "correct", "support"].includes(context.feedback);
    let body = "";
    if (kind === "area_product_grid") {
      body = `<div class="fra24-question-grid">${areaGrid(factors)}${worked ? `<div class="fra24-grid-result" aria-hidden="true">${fraction(rawProduct(factors))}</div>` : ""}</div>`;
    } else if (kind === "nested_context_cards") {
      body = nestedContext(canonicalQuestion, factors);
    } else if (kind === "row_pairing_cards") {
      body = rowPairingCards(factors);
    } else if (kind === "missing_fraction_field") {
      body = `<div class="fra24-missing-visual" aria-hidden="true">${fractionExpression(factors)}<span>=</span>${fraction({ numerator: rawProduct(factors).numerator, denominator: "?" })}</div>`;
    } else if (["method_choice_fraction_product", "method_critique"].includes(kind)) {
      body = `<div class="fra24-method-visual">${fractionExpression(factors)}${worked ? `<span class="fra24-row-reminder" aria-hidden="true">top × top · bottom × bottom</span>` : ""}</div>`;
    } else {
      body = symbolicRows(factors, worked);
    }
    return `<div class="fra24-question-visual" data-fra24-kind="${escapeHtml(kind)}">${body}${worked ? workedPanel(question) : ""}</div>`;
  }

  function repairMarkup(repair) {
    const labels = {
      add: "Multiply; do not add the two rows.",
      cross: "Keep numerator with numerator and denominator with denominator.",
      keep_denominator: "Both denominator factors build the new whole grid.",
      common_denominator_needed: "Fraction multiplication does not need matching denominators.",
      improper_invalid: "An improper factor uses the same row-by-row rule.",
      form: "Multiply first; simplify only when the answer form asks for it.",
      arithmetic_slip: "Keep the correct row structure and check the multiplication fact.",
      unknown: "Use a fresh visible method check before naming the error."
    };
    return `<div class="fra24-repair-panel"><span class="fra24-repair-icon" aria-hidden="true">↺</span><strong>${escapeHtml(repair.title)}</strong><p>${escapeHtml(labels[repair.errorFamily] || labels.unknown)}</p></div>`;
  }

  function renderMarkup(visual, context) {
    const ctx = context || {};
    const question = ctx.question;
    const model = question?.model || visual?.scene?.model || visual?.model || {};
    if (model.canonicalRepair) return repairMarkup(model.canonicalRepair);
    if (question?.canonicalQuestion) return questionMarkup(question, ctx);
    if (model.canonicalScene) return mapScene("HOOK", model.canonicalScene.visual, ctx);
    const sceneId = model.sceneId;
    const sceneVisual = model.visual || {};
    if (sceneId === "HOOK" || sceneId === "HOOK-CHOICE" || sceneId === "T1") return mapScene(sceneId === "HOOK-CHOICE" ? "HOOK" : sceneId, sceneVisual, ctx);
    if (sceneId === "T2") return gridToSymbolic(sceneVisual);
    if (sceneId === "T3") return symbolicRows({ first: sceneVisual.firstFraction, second: sceneVisual.secondFraction }, true);
    if (sceneId === "T4") return improperScene(sceneVisual);
    if (sceneId === "HANDOFF") return `<div class="fra24-handoff" aria-hidden="true"><span>Learn the idea</span><i>→</i><strong>Try it with me</strong></div>`;
    return `<div class="fra24-placeholder">${escapeHtml(visual?.description || "Multiply two fractions")}</div>`;
  }

  function accessibleDescription(model, context) {
    const ctx = context || {};
    const question = ctx.question;
    const worked = ["worked", "correct", "support"].includes(ctx.feedback);
    if (model?.canonicalRepair) return `Targeted repair: ${model.canonicalRepair.title}.`;
    if (model?.canonicalScene) return "A 4-by-3 map grid starts with three of four columns unlocked. The scan prediction is collected before row boundaries, the second selection, overlap counts, or the result are revealed.";
    const canonicalQuestion = question?.canonicalQuestion || model?.canonicalQuestion;
    if (canonicalQuestion) {
      const factors = canonicalQuestion.factors;
      const first = `${factors.first.numerator}/${factors.first.denominator}`;
      const second = `${factors.second.numerator}/${factors.second.denominator}`;
      let description;
      if (canonicalQuestion.visual.kind === "area_product_grid") {
        description = `A rectangular area grid shows ${first} by selected columns and ${second} by selected rows. The overlap uses a distinct crosshatch and strong border; its total is not stated before submission.`;
      } else if (canonicalQuestion.visual.kind === "nested_context_cards") {
        description = `Two nested status cards show ${first} of the full item, then ${second} of that selected part.`;
      } else if (canonicalQuestion.visual.kind === "missing_fraction_field") {
        description = `The factors are ${first} and ${second}. The product numerator is fixed and the denominator field is open.`;
      } else if (canonicalQuestion.visual.kind === "row_pairing_cards") {
        description = `Four tappable number cards place ${factors.first.numerator} and ${factors.second.numerator} in the numerator row, with ${factors.first.denominator} and ${factors.second.denominator} in the denominator row. No diagonal arrows are shown.`;
      } else {
        description = `A fraction multiplication expression shows ${first} times ${second}, with horizontal numerator and denominator rows and no diagonal arrows.`;
      }
      if (worked) description += ` Worked check: ${(question.model?.workedSteps || []).join(" ")}`;
      return description;
    }
    const sceneId = model?.sceneId;
    if (sceneId === "T4") return "An area model has seven rows and five visible quarter-width columns. A reference-whole boundary encloses the first four columns; the fifth extends beyond one whole.";
    if (["HOOK", "HOOK-CHOICE", "T1", "T2"].includes(sceneId)) return "A fraction multiplication area model uses column selection, row selection, and a non-colour crosshatched overlap state.";
    if (sceneId === "T3") return "A symbolic fraction product uses horizontal rails joining numerator to numerator and denominator to denominator. No diagonal arrows are shown.";
    return "A visual transition hands responsibility from Ryan's model to the learner.";
  }

  function bind(container) {
    if (container.dataset.fra24Bound === "true") return;
    container.dataset.fra24Bound = "true";
    container.addEventListener("revily:narration-cue", (event) => {
      const id = String(event.detail?.id || "").toLowerCase();
      if (id) container.querySelector(".fra24-visual")?.setAttribute("data-last-cue", id);
    });
    container.addEventListener("click", (event) => {
      const card = event.target.closest?.("[data-fra24-row-card]");
      if (!card || !container.contains(card)) return;
      card.classList.add("is-selected");
      card.setAttribute("aria-pressed", "true");
      const cards = [...container.querySelectorAll("[data-fra24-row-card]")];
      const selected = cards.filter((candidate) => candidate.getAttribute("aria-pressed") === "true");
      const numeratorComplete = cards.filter((candidate) => candidate.dataset.fra24RowCard === "numerator").every((candidate) => candidate.getAttribute("aria-pressed") === "true");
      const status = container.querySelector(".fra24-row-card-status");
      if (!status) return;
      if (selected.length === cards.length) status.textContent = "Rows paired. Enter the product in the fraction fields.";
      else status.textContent = numeratorComplete ? "Now tap the denominator row." : "Tap both numerator cards first.";
    });
  }

  window.RevilyFra24Visuals = { accessibleDescription, bind, renderMarkup };
})();
