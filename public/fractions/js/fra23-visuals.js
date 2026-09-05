(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(numerator, denominator, className) {
    return `<span class="fra23-fraction ${escapeHtml(className || "")}" aria-hidden="true"><b>${escapeHtml(numerator)}</b><i></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function pieceStrip(pieces, denominator, settings) {
    const options = settings || {};
    const count = Math.max(1, Number(pieces) || 1);
    return `<span class="fra23-piece-strip${options.muted ? " is-muted" : ""}" style="--fra23-denominator:${Math.max(count, Number(denominator) || count)}" aria-hidden="true">${Array.from({ length: count }, (_, index) => `<i class="${options.selected === false ? "" : "is-selected"}" data-piece="${index + 1}"></i>`).join("")}</span>`;
  }

  function groupCards(groupCount, piecesPerGroup, denominator, badges) {
    return `<div class="fra23-groups" style="--fra23-groups:${groupCount}" aria-hidden="true">${Array.from({ length: groupCount }, (_, index) => `<span class="fra23-group" data-group="${index + 1}">${badges ? `<b class="fra23-count-badge">${(index + 1) * piecesPerGroup}</b>` : ""}${pieceStrip(piecesPerGroup, denominator)}<small>${piecesPerGroup}/${denominator}</small></span>`).join("")}</div>`;
  }

  function ruler(denominator) {
    return `<div class="fra23-ruler" style="--fra23-denominator:${denominator}" aria-hidden="true"><b>0 m</b>${Array.from({ length: denominator + 1 }, (_, index) => `<i style="--tick:${index}"></i>`).join("")}<b>1 m</b></div>`;
  }

  function hookScene(visual) {
    return `<div class="fra23-hook-scene" data-fra23-scene="HOOK">
      ${ruler(visual.referenceDenominator)}
      ${groupCards(visual.stripCount, visual.stripNumerator, visual.stripDenominator, false)}
      <div class="fra23-claim" aria-hidden="true"><small>Student claim</small>${fraction(visual.studentClaim.numerator, visual.studentClaim.denominator)}<span class="fra23-cross">×</span></div>
      <div class="fra23-aligned" aria-hidden="true">${pieceStrip(visual.correctProduct.numerator, visual.correctProduct.denominator)}${fraction(visual.correctProduct.numerator, visual.correctProduct.denominator, "is-result")}</div>
    </div>`;
  }

  function repeatedGroupsScene(visual, countBadges) {
    return `<div class="fra23-repeated-scene" data-fra23-scene="${countBadges ? "T2" : "T1"}">
      ${groupCards(visual.groupCount, visual.piecesPerGroup, visual.denominator, countBadges)}
      ${countBadges ? `<div class="fra23-role-key" aria-hidden="true"><span><b>${visual.finalNumerator}</b> pieces counted</span><span><b>${visual.denominator}</b> names the piece size</span></div>` : `<p class="fra23-same-unit" aria-hidden="true">Every piece is the same width: one eighth</p>`}
    </div>`;
  }

  function methodScene(visual) {
    return `<div class="fra23-method-scene" data-fra23-scene="T3" aria-hidden="true">
      <div class="fra23-expression"><b>${visual.integerFactor}</b><span>×</span>${fraction(visual.numerator, visual.denominator)}<span>=</span>${fraction(visual.productNumerator, visual.denominator, "is-result")}</div>
      <div class="fra23-method-lanes"><span><small>piece count</small>${visual.integerFactor} × ${visual.numerator} = <b>${visual.productNumerator}</b></span><span><small>piece size</small><b>${visual.denominator}</b> stays fixed</span></div>
      <div class="fra23-wrong-contrast">not ${escapeHtml(visual.contrastWrongMethod)}</div>
    </div>`;
  }

  function orderScene(visual) {
    return `<div class="fra23-order-scene" data-fra23-scene="T4">
      <div class="fra23-order-expressions" aria-hidden="true"><span>${visual.integerFactor} × ${fraction(visual.numerator, visual.denominator)}</span><b>=</b><span>${fraction(visual.numerator, visual.denominator)} × ${visual.integerFactor}</span></div>
      ${groupCards(visual.integerFactor, visual.numerator, visual.denominator, false)}
      <div class="fra23-shared-result" aria-hidden="true">same five groups ${fraction(visual.productNumerator, visual.denominator, "is-result")}</div>
    </div>`;
  }

  function handoffScene() {
    return `<div class="fra23-handoff" data-fra23-scene="HANDOFF" aria-hidden="true"><span>Learn the idea</span><i>→</i><strong>Try it with me</strong></div>`;
  }

  function valuesExpression(question) {
    const values = question.values || {};
    const integer = values.integerFactor;
    const n = values.numerator;
    const d = values.denominator;
    if (!Number.isFinite(Number(integer)) || !Number.isFinite(Number(n)) || !Number.isFinite(Number(d))) return "";
    const fractionFirst = question.family === "ORDER" || /fraction_first/i.test(question.authorOnlyAssessmentIntent || "");
    return `<div class="fra23-question-expression" aria-hidden="true">${fractionFirst ? `${fraction(n, d)} <span>×</span> <b>${integer}</b>` : `<b>${integer}</b> <span>×</span> ${fraction(n, d)}`}</div>`;
  }

  function workedPanel(question) {
    const steps = question?.model?.workedSteps || [];
    if (!steps.length) return "";
    return `<ol class="fra23-worked" aria-label="Worked check">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
  }

  function questionMarkup(question, context) {
    const source = question.canonicalQuestion || question.model?.canonicalQuestion;
    if (!source) return "";
    const visual = source.visual || {};
    const values = source.values || {};
    const worked = ["worked", "correct", "support"].includes(context.feedback);
    let body = "";
    if (["repeated_fraction_strips", "tap_repeated_groups"].includes(visual.kind)) {
      body = groupCards(visual.groupCount || values.integerFactor, visual.piecesPerGroup || values.numerator, visual.denominator || values.denominator, false);
    } else if (visual.kind === "context_light_strips") {
      body = `<div class="fra23-context-card" aria-hidden="true"><span class="fra23-bulb">✦</span><strong>${values.integerFactor} equal strips</strong>${pieceStrip(values.numerator, values.denominator)}<small>each strip is ${values.numerator}/${values.denominator} ${values.unit || ""}</small></div>`;
    } else if (visual.kind === "unit_choice") {
      body = `<div class="fra23-unit-visual" aria-hidden="true">${pieceStrip(values.numerator, values.denominator)}<span>Which unit pieces stay the same?</span></div>`;
    } else if (visual.kind === "integer_badge_placement") {
      body = `<div class="fra23-badge-visual" aria-hidden="true"><b class="fra23-integer-badge">${values.integerFactor}</b><span>groups of</span>${fraction(values.numerator, values.denominator)}</div>`;
    } else if (["multiple_choice_working", "multiple_choice_result", "multiple_choice_error_analysis"].includes(visual.kind)) {
      body = `<div class="fra23-method-card">${valuesExpression(source)}<small>${visual.kind === "multiple_choice_error_analysis" ? "Inspect the student method before choosing." : "Choose the line that preserves the piece size."}</small></div>`;
    } else if (source.family === "MISSING") {
      body = `<div class="fra23-missing" aria-hidden="true"><b>?</b><span>×</span>${fraction(values.numerator, values.denominator)}<span>=</span>${fraction(source.answer.numerator || "?", source.answer.denominator || values.denominator)}</div>`;
    } else {
      body = valuesExpression(source);
    }
    return `<div class="fra23-question-visual" data-fra23-kind="${escapeHtml(visual.kind || source.family)}">${body}${worked ? workedPanel(question) : ""}</div>`;
  }

  function repairMarkup(repair) {
    const panels = {
      "M-BOTH": `<div class="fra23-repair-compare" aria-hidden="true"><span>${fraction(3, 8)} + ${fraction(3, 8)} + ${fraction(3, 8)} + ${fraction(3, 8)}</span><b>${fraction(12, 8)}</b><del>${fraction(12, 32)}</del></div>`,
      "M-ADD": `<div class="fra23-repair-count" aria-hidden="true">${groupCards(4, 2, 9, true)}<span>2, 4, 6, 8 ninths</span></div>`,
      "M-DEN": `<div class="fra23-repair-unit" aria-hidden="true">${pieceStrip(3, 12)}<b>twelfths stay twelfths</b></div>`,
      "M-INTEGER": `<div class="fra23-repair-integer" aria-hidden="true"><b>6 groups</b><span>×</span>${fraction(2, 5)}<span>→ count fifths</span></div>`,
      "M-ARITH": `<div class="fra23-repair-integer" aria-hidden="true"><b>Keep the structure</b><span>→</span><span>check one multiplication fact</span></div>`
    };
    return `<div class="fra23-repair-panel"><strong>Targeted repair</strong>${panels[repair.family] || panels["M-ARITH"]}</div>`;
  }

  function renderMarkup(visual, context) {
    const ctx = context || {};
    const question = ctx.question;
    const model = question?.model || visual?.scene?.model || visual?.model || {};
    if (model.canonicalRepair) return repairMarkup(model.canonicalRepair);
    if (question?.canonicalQuestion) return questionMarkup(question, ctx);
    const sceneId = model.sceneId;
    const sceneVisual = model.visual || {};
    if (sceneId === "HOOK") return hookScene(sceneVisual);
    if (sceneId === "T1") return repeatedGroupsScene(sceneVisual, false);
    if (sceneId === "T2") return repeatedGroupsScene(sceneVisual, true);
    if (sceneId === "T3") return methodScene(sceneVisual);
    if (sceneId === "T4") return orderScene(sceneVisual);
    if (sceneId === "HANDOFF") return handoffScene();
    return `<div class="fra23-placeholder">${escapeHtml(visual?.description || "Multiply a fraction by an integer")}</div>`;
  }

  function accessibleDescription(model, context) {
    const ctx = context || {};
    const question = ctx.question;
    const worked = ["worked", "correct", "support"].includes(ctx.feedback);
    if (model?.canonicalRepair) return `Targeted repair for ${model.canonicalRepair.family}. The visual keeps equal piece sizes explicit.`;
    const source = question?.canonicalQuestion || model?.canonicalQuestion;
    if (source) {
      let description = source.visual?.accessibleDescriptionPreSubmit || "A fraction multiplied by a positive integer is shown without its result.";
      if (worked && question.model?.workedSteps?.length) description += ` Worked check: ${question.model.workedSteps.join(" ")}`;
      return description;
    }
    const sceneId = model?.sceneId;
    if (sceneId === "HOOK") return "A one-metre ruler is divided into eight equal intervals. Four separate three-eighth-metre strips use the same piece width. A crossed twelve-thirty-seconds claim is separate from the aligned twelve-eighths model.";
    if (sceneId === "T1") return "Four repeated groups each contain three equal eighth-sized pieces.";
    if (sceneId === "T2") return "Count badges accumulate three, six, nine, then twelve while every piece remains one eighth.";
    if (sceneId === "T3") return "A compact method lane multiplies the integer by the numerator while the denominator lane stays fixed.";
    if (sceneId === "T4") return "Five times three sevenths and three sevenths times five share the same five repeated groups and exact result fifteen sevenths.";
    return "The stage changes from learning the idea to trying it with guided support.";
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const id = String(event.detail?.id || "").toLowerCase().replace(/\./g, "-");
      if (!id) return;
      const root = container.querySelector(".fra23-visual");
      if (root) {
        root.setAttribute("data-last-cue", id);
        root.classList.add(`cue-${id}`);
      }
    });
  }

  window.RevilyFra23Visuals = { accessibleDescription, bind, renderMarkup };
})();
