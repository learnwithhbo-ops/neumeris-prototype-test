(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function valueText(value) {
    if (typeof value === "number") return String(value);
    if (value && typeof value === "object") return `${value.numerator}/${value.denominator}`;
    return String(value ?? "");
  }

  function fraction(value, className, id) {
    if (typeof value === "number") return `<span class="fra26-whole ${className || ""}"${id ? ` id="${id}"` : ""}>${escapeHtml(value)}</span>`;
    return `<span class="fra26-fraction ${className || ""}"${id ? ` id="${id}"` : ""} aria-label="${escapeHtml(value.numerator)} over ${escapeHtml(value.denominator)}"><b>${escapeHtml(value.numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(value.denominator)}</b></span>`;
  }

  function equation(parts, className) {
    return `<div class="fra26-equation ${className || ""}">${parts.join("")}</div>`;
  }

  function worked(model, reveal) {
    const steps = model?.workedSteps || [];
    if (!reveal || !steps.length) return "";
    return `<ol class="fra26-working" aria-label="Working shown after the committed answer was locked">${steps.map((step, index) => `<li style="--fra26-step:${index}"><span>${index + 1}</span><b>${escapeHtml(step)}</b></li>`).join("")}</ol>`;
  }

  function hookMarkup(visual, reveal, model) {
    const question = model?.questionId === "HOOK";
    const firstScale = visual.firstScale || visual.firstMultiplier || { numerator: 3, denominator: 5 };
    const width = visual.firstResultWidthUnits || visual.currentWidth || 15;
    return `<div class="fra26-hook${reveal ? " is-revealed" : ""}">
      <div class="fra26-width-labels"><span>25 units</span><span>${width} units</span></div>
      <div class="fra26-title-card is-original"><b>REVILY</b><i style="--fra26-width:25"></i></div>
      <div class="fra26-scale-arrow"><span>&times;</span>${fraction(firstScale)}</div>
      <div class="fra26-title-card is-scaled"><b>REVILY</b><i style="--fra26-width:${width}"></i></div>
      ${question && reveal ? `<div class="fra26-hook-outcomes"><article><span>Repeat ${valueText(firstScale)}</span>${equation([`<b>15 &times; ${valueText(firstScale)}</b>`, "<span>=</span>", "<strong>9</strong>"])}</article><article class="is-restored"><span>Use 5/3</span>${equation(["<b>15 &times; 5/3</b>", "<span>=</span>", "<strong>25</strong>"])}</article></div>` : ""}
    </div>`;
  }

  function productMarkup(visual, reveal, model) {
    const factors = visual.factors || [{ numerator: 3, denominator: 5 }, { numerator: 5, denominator: 3 }];
    return `<div class="fra26-product${reveal ? " is-revealed" : ""}">
      ${equation([fraction(factors[0], "fra26-source", "fra26-factor-a"), "<span>&times;</span>", fraction(factors[1], "fra26-reciprocal", "fra26-factor-b"), "<span>=</span>", `<span class="fra26-built-product"><b>${visual.numeratorProduct || 15}</b><i></i><b>${visual.denominatorProduct || 15}</b></span>`, "<span>=</span>", `<strong id="fra26-product-one">${visual.result || 1}</strong>`])}
      <div class="fra26-product-lines"><span>3 &times; 5 = 15</span><span>5 &times; 3 = 15</span></div>
      <strong class="fra26-pair-label">RECIPROCAL PAIR</strong>${worked(model, reveal)}
    </div>`;
  }

  function exchangeMarkup(visual, reveal, model) {
    const source = visual.source || { numerator: 4, denominator: 7 };
    const reciprocal = visual.reciprocal || { numerator: 7, denominator: 4 };
    const reciprocalKnown = Number.isFinite(Number(reciprocal.numerator)) && Number.isFinite(Number(reciprocal.denominator));
    const numeratorProduct = reciprocalKnown ? Number(source.numerator) * Number(reciprocal.numerator) : null;
    const denominatorProduct = reciprocalKnown ? Number(source.denominator) * Number(reciprocal.denominator) : null;
    const check = reciprocalKnown
      ? [fraction(source), "<span>&times;</span>", fraction(reciprocal), "<span>=</span>", fraction({ numerator: numeratorProduct, denominator: denominatorProduct }), "<span>=</span>", "<strong>1</strong>"]
      : [fraction(source), "<span>&times;</span>", '<span class="fra26-empty-factor" aria-label="Reciprocal not yet shown">?</span>', "<span>=</span>", "<strong>1</strong>"];
    return `<div class="fra26-exchange${reveal ? " is-revealed" : ""}">
      <div class="fra26-exchange-cards">${fraction(source, "fra26-source", "fra26-exchange-source")}<span class="fra26-curved-paths" aria-hidden="true"><i></i><i></i></span>${fraction(reciprocal, "fra26-reciprocal", "fra26-exchange-reciprocal")}</div>
      ${equation(check)}
      ${reciprocalKnown ? "<p>Both positions exchange. The product is one.</p>" : ""}${worked(model, reveal)}
    </div>`;
  }

  function integerMarkup(visual, reveal, model) {
    const integer = visual.integer || 6;
    const reciprocal = visual.reciprocal;
    return `<div class="fra26-integer-cards${reveal ? " is-revealed" : ""}">
      <div class="fra26-card-row"><article><small>Integer</small>${fraction(integer)}</article><span>=</span><article><small>Hidden denominator</small>${fraction({ numerator: integer, denominator: 1 })}</article><span>&harr;</span><article><small>Reciprocal</small>${reciprocal ? fraction(reciprocal) : '<span class="fra26-empty-factor" aria-label="Reciprocal not yet shown">?</span>'}</article></div>
      ${visual.selfReciprocal ? `<div class="fra26-self-card">${fraction(1)}<span>&times;</span>${fraction(1)}<span>=</span><strong>1</strong><small>SELF-RECIPROCAL</small></div>` : ""}
      ${worked(model, reveal)}
    </div>`;
  }

  function zeroMarkup(visual, reveal, model) {
    const trials = visual.trials || visual.triedProducts || [];
    return `<div class="fra26-zero${reveal ? " is-revealed" : ""}">
      <div class="fra26-zero-target">0 &times; <span>?</span> = 1</div>
      ${reveal ? `<div class="fra26-zero-trials">${trials.map((trial) => `<span>${escapeHtml(trial)}</span>`).join("")}</div><div class="fra26-invalid-fraction"><s>1/0</s><strong>NO RECIPROCAL</strong></div>` : ""}${worked(model, reveal)}
    </div>`;
  }

  function questionMarkup(visual, model, reveal) {
    const kind = visual.kind;
    if (kind === "repair_intro") {
      const id = visual.repairId;
      const repair = model.repair || {};
      if (id === "R-INTEGER") return integerMarkup({ integer: repair.values?.teachingInteger || 8, reciprocal: { numerator: 1, denominator: repair.values?.teachingInteger || 8 } }, true, model);
      if (id === "R-ZERO") return zeroMarkup({ trials: ["0 × 2 = 0", "0 × 10 = 0", "0 × 100 = 0"] }, true, model);
      if (id === "R-SIGN-VALUE") {
        const source = repair.values?.teaching || { numerator: 5, denominator: 6 };
        return `<div class="fra26-choice-contrast">${equation([fraction(source), "<span>&times;</span>", fraction({ numerator: source.denominator, denominator: source.numerator }), "<span>=</span><strong>1</strong>"])}<p>Keep the same values and exchange both positions.</p></div>`;
      }
      const source = repair.values?.teaching || { numerator: 4, denominator: 9 };
      return exchangeMarkup({ source, reciprocal: { numerator: source.denominator, denominator: source.numerator } }, true, model);
    }
    if (kind === "scale_card_restoration") return hookMarkup(visual, reveal, model);
    if (["integer_to_fraction_then_reciprocal", "final_integer_reciprocal", "integer_reciprocal_fraction_input", "integer_missing_fraction_factor", "staged_integer_reciprocal_builder"].includes(kind)) {
      return integerMarkup({ integer: visual.integer || visual.shownStructure?.numerator || model.canonicalQuestion?.answer?.source?.value, reciprocal: reveal ? model.canonicalQuestion?.answer?.exact : null }, reveal, model);
    }
    if (["zero_impossible_product_choice", "zero_reason_choice", "number_choice", "final_claim_evaluation"].includes(kind)) return zeroMarkup(visual, reveal, model);
    if (["reciprocal_pair_matching"].includes(kind)) {
      return `<div class="fra26-match-visual"><div>${(visual.leftCards || []).map((card) => fraction(card.value, "fra26-match-card")).join("")}</div><span aria-hidden="true">&harr;</span><div>${(visual.rightCards || []).map((card) => fraction(card.value, "fra26-match-card")).join("")}</div>${worked(model, reveal)}</div>`;
    }
    if (kind === "two_tile_reciprocal_builder") return exchangeMarkup({ source: visual.source, reciprocal: reveal ? model.canonicalQuestion.answer.reciprocal : { numerator: "?", denominator: "?" } }, reveal, model);
    if (kind === "reciprocal_vs_opposite_choice") return `<div class="fra26-choice-contrast">${equation([fraction({ numerator: 5, denominator: 6 }), "<span>&times;</span><strong>?</strong><span>=</span><b>1</b>"])}${reveal ? `<p>Keep the values and exchange both positions.</p>` : ""}${worked(model, reveal)}</div>`;
    if (kind === "statement_choice") return `<div class="fra26-statement-visual"><article>${fraction(1)}<span>&times;</span>${fraction(1)}<span>= 1</span></article><article>0 &times; ? = 1</article>${worked(model, reveal)}</div>`;
    const source = visual.source || visual.knownFactor || model.canonicalQuestion?.answer?.source?.value;
    const reciprocal = model.canonicalQuestion?.answer?.exact;
    if (source) {
      return `<div class="fra26-question-equation">${equation([fraction(source), "<span>&times;</span>", reveal && reciprocal ? fraction(reciprocal) : '<span class="fra26-empty-factor">?</span>', "<span>=</span><strong>1</strong>"])}${reveal && reciprocal ? `<p>${valueText(source)} &times; ${valueText(reciprocal)} = 1</p>` : ""}${worked(model, reveal)}</div>`;
    }
    return `<div class="fra26-question-equation"><span class="fra26-empty-factor">?</span>${worked(model, reveal)}</div>`;
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const authored = model.visual || {};
    const reveal = ["correct", "worked", "support"].includes(context?.feedback);
    if (model.sceneId === "HANDOFF") return `<div class="fra26-handoff"><span>Make a product of one</span><i aria-hidden="true">&rarr;</i><strong>Find reciprocals</strong><i aria-hidden="true">&rarr;</i><span>Check independently</span></div>`;
    if (model.sceneId === "HOOK") return hookMarkup(authored, false, model);
    if (model.sceneId === "T1") return productMarkup(authored, true, model);
    if (model.sceneId === "T2") return exchangeMarkup(authored, true, model);
    if (model.sceneId === "T3") return integerMarkup(authored, true, model);
    if (model.sceneId === "T4") return zeroMarkup(authored, true, model);
    return questionMarkup(authored, model, reveal);
  }

  function accessibleDescription(model, context) {
    const before = model?.accessibleDescription || "A reciprocal model.";
    if (!["correct", "worked", "support"].includes(context?.feedback)) return before;
    const steps = model?.workedSteps || [];
    return steps.length ? `${before} After the answer is committed, the working is shown: ${steps.join(" ")}` : `${before} The checked reciprocal state is shown.`;
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const root = container.querySelector(".fra26-visual");
      if (!root || !event.detail?.id) return;
      root.dataset.fra26Cue = event.detail.id;
      root.classList.add(`is-cue-${String(event.detail.action || event.detail.id).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`);
    });
  }

  window.RevilyFra26Visuals = { accessibleDescription, bind, renderMarkup };
})();
