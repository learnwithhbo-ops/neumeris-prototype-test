(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(value, extraClass) {
    if (!value) return "";
    return `<span class="fra25-fraction ${extraClass || ""}" aria-hidden="true"><b>${escapeHtml(value.numerator)}</b><i></i><b>${escapeHtml(value.denominator)}</b></span>`;
  }

  function product(math, extraClass) {
    const factors = math?.factors;
    if (!factors) return "";
    return `<div class="fra25-product ${extraClass || ""}" aria-hidden="true">${fraction(factors.left)}<span class="fra25-times">×</span>${fraction(factors.right)}</div>`;
  }

  function factorGrid(math, labels) {
    const factors = math?.factors;
    if (!factors) return "";
    const ids = labels || { ln: "fra25-ln", ld: "fra25-ld", rn: "fra25-rn", rd: "fra25-rd" };
    return `<div class="fra25-factor-grid" aria-hidden="true">
      <span class="fra25-row-label">numerator factors</span>
      <b id="${escapeHtml(ids.ln)}">${factors.left.numerator}</b><i>×</i><b id="${escapeHtml(ids.rn)}">${factors.right.numerator}</b>
      <span class="fra25-factor-line"></span>
      <span class="fra25-row-label">denominator factors</span>
      <b id="${escapeHtml(ids.ld)}">${factors.left.denominator}</b><i>×</i><b id="${escapeHtml(ids.rd)}">${factors.right.denominator}</b>
    </div>`;
  }

  function routeCard(label, start, steps, tone) {
    return `<article class="fra25-route-card ${tone || ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(start)}</strong>${steps.map((step) => `<div>${escapeHtml(step)}</div>`).join("")}</article>`;
  }

  function worked(model, reveal) {
    if (!reveal) return "";
    const steps = model?.workedSteps || [];
    if (!steps.length) return "";
    return `<div class="fra25-working" aria-label="Working shown after the answer was locked">${steps.map((step, index) => `<div style="--step:${index}"><span>${index + 1}</span><b>${escapeHtml(step)}</b></div>`).join("")}</div>`;
  }

  function sceneMarkup(sceneId, visual) {
    const math = visual.math;
    if (sceneId === "HOOK" || sceneId === "HOOK-CHOICE") {
      return `<div class="fra25-hook-routes">
        ${routeCard("Multiply first", "18/35 × 14/27", ["18 × 14 / 35 × 27", "252/945", "4/15"], "route-a")}
        <div class="fra25-route-equals" aria-hidden="true">same value</div>
        ${routeCard("Simplify first", "18/35 × 14/27", ["18 & 27 ÷ 9", "14 & 35 ÷ 7", "2/5 × 2/3 = 4/15"], "route-b")}
      </div>`;
    }
    if (sceneId === "T1") return `<div class="fra25-scene-stack">${product(math)}${factorGrid(math, { ln: "t1-n1", ld: "t1-d1", rn: "t1-n2", rd: "t1-d2" })}<p class="fra25-rule">one numerator factor ↔ one denominator factor</p></div>`;
    if (sceneId === "T2") return `<div class="fra25-shared-rewrite"><div class="fra25-old-pair"><s>4</s><b>÷ 2</b><em>2</em></div><span>with</span><div class="fra25-old-pair"><s>10</s><b>÷ 2</b><em>5</em></div><strong>2/9 × 3/5</strong></div>`;
    if (sceneId === "T3") return `<div class="fra25-route-strip"><span>2/9 × 3/5</span><i>3 and 9 ÷ 3</i><span>2/3 × 1/5</span><i>multiply</i><strong>2/15</strong></div>`;
    if (sceneId === "T4") return `<div class="fra25-parallel-routes">${routeCard("Route A", "12/18 × 5/14", ["12/18 ÷ 6", "2 and 14 ÷ 2", "1/3 × 5/7 = 5/21"], "route-a")}${routeCard("Route B", "12/18 × 5/14", ["12 and 14 ÷ 2", "6/18 ÷ 6", "1/3 × 5/7 = 5/21"], "route-b")}</div>`;
    if (sceneId === "T5") return `<div class="fra25-boundary-contrast"><article><span>complete factor</span><strong>(3 + 5)</strong><p><s>5 ↔ 10</s> <b>term, not factor</b></p></article><article><span>no useful cancellation</span><strong>5/8 × 7/9</strong><p>5↔8 · 5↔9 · 7↔8 · 7↔9</p><b>multiply as written</b></article></div>`;
    if (sceneId === "HANDOFF") return `<div class="fra25-invariant"><span>one numerator factor</span><i>↔</i><span>one denominator factor</span><strong>same exact divisor on both</strong></div>`;
    return product(math);
  }

  function questionMarkup(authoredVisual, model, reveal) {
    const kind = authoredVisual.kind;
    const math = authoredVisual.math;
    const expression = authoredVisual.visibleExpression || "";
    if (kind === "term_vs_factor_contrast" || kind === "repair_complete_factor") {
      return `<div class="fra25-question-visual"><div class="fra25-expression-card"><span>expression</span><strong>${escapeHtml(expression)}</strong><div class="fra25-term-boundary"><b>( complete factor )</b><i>terms stay inside the bracket</i></div></div>${worked(model, reveal)}</div>`;
    }
    if (kind === "no_cancel_mcq" || kind === "repair_cross_pair_grid") {
      return `<div class="fra25-question-visual">${math ? product(math) : `<strong class="fra25-visible-expression">${escapeHtml(expression)}</strong>`}<div class="fra25-cross-checks" aria-hidden="true"><span>top left ↔ bottom left</span><span>top left ↔ bottom right</span><span>top right ↔ bottom left</span><span>top right ↔ bottom right</span></div>${worked(model, reveal)}</div>`;
    }
    if (kind === "route_comparison_mcq" || kind === "parallel_valid_routes") {
      return `<div class="fra25-question-visual fra25-route-question"><strong>${escapeHtml(expression)}</strong><div class="fra25-mini-routes"><span>simplify within a factor first</span><span>cross-cancel first</span></div>${worked(model, reveal)}</div>`;
    }
    if (kind === "repair_shared_divisor") {
      return `<div class="fra25-question-visual"><strong class="fra25-visible-expression">${escapeHtml(expression)}</strong><div class="fra25-shared-badge">same divisor on both</div>${worked(model, reveal)}</div>`;
    }
    if (kind === "repair_pair_tray") {
      return `<div class="fra25-question-visual">${product(math)}<div class="fra25-pair-tray"><span>numerator factor</span><i>shared divisor</i><span>denominator factor</span></div>${worked(model, reveal)}</div>`;
    }
    if (kind === "repair_finish_trays") {
      return `<div class="fra25-question-visual"><strong class="fra25-visible-expression">${escapeHtml(expression)}</strong><div class="fra25-finish-trays"><span>top factors → numerator</span><span>bottom factors → denominator</span></div>${worked(model, reveal)}</div>`;
    }
    return `<div class="fra25-question-visual">${math ? factorGrid(math) : `<strong class="fra25-visible-expression">${escapeHtml(expression)}</strong>`}${worked(model, reveal)}</div>`;
  }

  function cueTargets(visual) {
    const ids = (visual?.syncCues || []).flatMap((cue) => cue.targets || []).filter(Boolean);
    return ids.length ? `<div class="fra25-cue-targets" aria-hidden="true">${[...new Set(ids)].map((id) => `<i id="${escapeHtml(id)}"></i>`).join("")}</div>` : "";
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const authoredVisual = model.visual || {};
    const sceneId = model.sceneId || "";
    const reveal = ["correct", "worked"].includes(context?.feedback);
    const content = sceneId ? sceneMarkup(sceneId, authoredVisual) : questionMarkup(authoredVisual, model, reveal);
    return `<div class="fra25-visual" data-fra25-kind="${escapeHtml(authoredVisual.kind || "product")}" data-fra25-scene="${escapeHtml(sceneId)}">${content}${cueTargets(visual)}</div>`;
  }

  function accessibleDescription(model, context) {
    const visual = model?.visual || {};
    const reveal = ["correct", "worked"].includes(context?.feedback);
    const before = model?.accessibleDescription || visual.accessibleDescriptionBeforeSubmit || `The expression ${visual.visibleExpression || "for this fraction product"} is shown.`;
    if (!reveal) return before;
    const final = model?.canonicalQuestion?.workedCheck?.finalAnswer;
    return `${before} The answer is locked and the worked check is now visible${final ? `, ending at ${final}` : ""}.`;
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const visual = container.querySelector(".fra25-visual");
      if (!visual || !event.detail?.id) return;
      visual.setAttribute("data-fra25-cue", event.detail.id);
      (event.detail.targets || []).forEach((id) => container.querySelector(`#${window.CSS?.escape ? CSS.escape(id) : id}`)?.classList.add("is-cued"));
    });
  }

  window.RevilyFra25Visuals = { accessibleDescription, bind, renderMarkup };
})();
