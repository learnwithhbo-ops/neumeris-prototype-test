(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function fraction(numerator, denominator, className) {
    return `<span class="fra17-fraction ${className || ""}" aria-hidden="true"><b>${escapeHtml(numerator)}</b><i></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function cells(denominator, first, second, options) {
    const settings = options || {};
    const total = Math.max(1, Number(denominator) || 1);
    const firstCount = Math.max(0, Number(first) || 0);
    const secondCount = Math.max(0, Number(second) || 0);
    return `<div class="fra17-strip${settings.compact ? " is-compact" : ""}" id="${escapeHtml(settings.id || "fra17-strip")}" style="--fra17-parts:${total}" aria-hidden="true">${Array.from({ length: total }, (_, index) => {
      const group = index < firstCount ? " first" : index < firstCount + secondCount ? " second" : "";
      const selectable = settings.selectable ? ` role="button" tabindex="0" data-fra17-cell="${index}" aria-label="Cell ${index + 1}, ${group ? "patterned" : "empty"}" aria-pressed="false"` : "";
      const cueHidden = settings.cueHidden && index < firstCount + secondCount ? " is-cue-hidden" : "";
      return `<i class="fra17-cell${group}${cueHidden}" id="${escapeHtml(settings.cellPrefix || "strip-cell-")}${index + 1}"${selectable}><span>${index + 1}</span></i>`;
    }).join("")}</div>`;
  }

  function expression(visual, showResult) {
    const a = visual.firstNumerator ?? visual.sourceFractions?.[0]?.numerator;
    const b = visual.secondNumerator ?? visual.sourceFractions?.[1]?.numerator;
    const d = visual.denominator ?? visual.sourceFractions?.[0]?.denominator;
    if (![a, b, d].every(Number.isFinite)) return "";
    return `<div class="fra17-expression">${fraction(a, d, "source-a")}<span>+</span>${fraction(b, d, "source-b")}<span>=</span>${showResult ? fraction(a + b, d, "result") : `<span class="fra17-question-mark">?</span>`}</div>`;
  }

  function worked(model, reveal) {
    const steps = model?.workedSteps || [];
    if (!reveal || !steps.length) return "";
    return `<ol class="fra17-working" aria-label="Working shown after the answer was locked">${steps.map((step, index) => `<li style="--fra17-step:${index}"><span>${index + 1}</span><b>${escapeHtml(step)}</b></li>`).join("")}</ol>`;
  }

  function hookMarkup(visual, reveal) {
    return `<div class="fra17-hook${reveal ? " is-revealed" : ""}">
      <div class="fra17-light-shell"><span>LIGHT STRIP</span>${cells(8, 2, 3, { id: "light-strip", cellPrefix: "strip-cell-", cueHidden: !reveal })}</div>
      <div class="fra17-wrong-claim" id="wrong-claim-5-16"><small>Student's claim</small>${fraction(5, 16)}</div>
      <p class="fra17-invariant"><b>8</b> equal sections before and after</p>
    </div>`;
  }

  function alignedMarkup(visual, reveal, model) {
    const d = visual.denominator;
    const a = visual.firstNumerator ?? visual.sourceFractions?.[0]?.numerator;
    const b = visual.secondNumerator ?? visual.sourceFractions?.[1]?.numerator;
    const combined = reveal ? `<div class="fra17-combined-result"><span>combined</span>${cells(d, a, b, { id: "fra17-combined-strip", compact: d > 12 })}${fraction(a + b, d)}</div>` : "";
    return `<div class="fra17-aligned">
      <div id="t1-strip-a"><span>${a}/<b id="t1-denominator-a">${d}</b></span>${cells(d, a, 0, { id: "t1-strip-a-partitions", cellPrefix: "t1-cell-a-", compact: d > 12 })}</div>
      <div id="t1-strip-b"><span>${b}/<b id="t1-denominator-b">${d}</b></span>${cells(d, 0, b, { id: "t1-strip-b-partitions", cellPrefix: "t1-cell-b-", compact: d > 12 })}</div>
      ${combined}${worked(model, reveal)}
    </div>`;
  }

  function combinedMarkup(visual, reveal, model) {
    const d = visual.denominator;
    const a = visual.firstNumerator;
    const b = visual.secondNumerator;
    return `<div class="fra17-combine">
      <div id="t2-result">${expression(visual, reveal)}</div>
      <div id="t2-first-group"><span id="t2-second-group"></span>${cells(d, a, b, { id: "t2-combined-strip", compact: d > 12 })}</div>
      <span id="t2-selected-cells" class="fra17-cue-anchor" aria-hidden="true"></span>
      <div class="fra17-numerator-calc" id="t2-numerator-calculation">${a} + ${b} = ${a + b}</div>
      <p class="fra17-denominator-anchor" id="t2-denominator-anchor">piece size: <b>${d}ths</b></p>
      ${worked(model, reveal)}
    </div>`;
  }

  function symbolicMarkup(visual, reveal, model) {
    const d = visual.denominator;
    const a = visual.firstNumerator;
    const b = visual.secondNumerator;
    const teachingIds = model?.sceneId === "T3";
    return `<div class="fra17-symbolic">
      ${Number.isFinite(d) ? `<div id="${teachingIds ? "t3-first-four" : "fra17-symbolic-model"}"><span id="${teachingIds ? "t3-next-three" : "fra17-symbolic-next"}"></span>${cells(d, a, b, { id: "fra17-symbolic-strip", compact: d > 12 })}</div>` : ""}
      <div id="${teachingIds ? "t3-result" : "fra17-symbolic-result"}">${expression(visual, reveal)}</div>
      ${Number.isFinite(d) ? `<div class="fra17-numerator-calc" id="${teachingIds ? "t3-numerator-calculation" : "fra17-symbolic-calculation"}">${a} + ${b} = <b id="${teachingIds ? "t3-result-numerator" : "fra17-symbolic-numerator"}">${a + b}</b></div><p class="fra17-denominator-anchor"><span id="${teachingIds ? "t3-denominator-a" : "fra17-denominator-a"}">${d}</span>ths + <span id="${teachingIds ? "t3-denominator-b" : "fra17-denominator-b"}">${d}</span>ths stay <b id="${teachingIds ? "t3-denominator-result" : "fra17-denominator-result"}">${d}</b>ths</p>` : ""}
      <div class="fra17-general-rule" id="${teachingIds ? "t3-general-rule" : "fra17-general-rule"}">a/d + b/d = (a + b)/d</div>
      ${worked(model, reveal)}
    </div>`;
  }

  function contrastMarkup(visual, reveal, model) {
    const d = visual.denominator;
    const wrong = visual.wrongClaim;
    return `<div class="fra17-contrast">
      <article class="is-correct" id="t4-correct-equation"><strong>Same <span id="t4-denominator-a">${d}</span>-part whole</strong>${cells(d, visual.expectedNumerator, 0, { id: "t4-ten-cell", compact: d > 12 })}${fraction(visual.expectedNumerator, d)}<span id="t4-denominator-b" class="fra17-cue-anchor" aria-hidden="true"></span></article>
      <article class="is-wrong" id="t4-wrong-7-20"><strong>Partition changed</strong><span id="t4-twenty-cell">${wrong ? fraction(wrong.numerator, wrong.denominator) : `<span class="fra17-repartition">unneeded new denominator</span>`}</span><i class="fra17-cross" aria-hidden="true"></i></article>
      ${worked(model, reveal)}
    </div>`;
  }

  function guidedMarkup(visual, reveal, model) {
    return `<div class="fra17-guided-model">${cells(visual.denominator, visual.firstNumerator, visual.secondNumerator, { compact: visual.denominator > 12 })}${expression(visual, reveal)}${worked(model, reveal)}</div>`;
  }

  function measureMarkup(visual, reveal, model) {
    return `<div class="fra17-measure"><div class="fra17-measure-label"><b>0 m</b><span>one metre</span><b>1 m</b></div>${cells(visual.denominator, visual.firstNumerator, visual.secondNumerator, { compact: visual.denominator > 12 })}${expression(visual, reveal)}${worked(model, reveal)}</div>`;
  }

  function reasoningMarkup(visual, reveal, model) {
    const wrong = visual.wrongClaim;
    return `<div class="fra17-reasoning"><div class="fra17-student-claim"><small>Student's claim</small>${wrong ? expression(Object.assign({}, visual, { expectedNumerator: wrong.numerator }), false).replace("?", `${wrong.numerator}/${wrong.denominator}`) : expression(visual, false)}</div>${reveal ? `<div class="fra17-reason-result">${expression(visual, true)}</div>` : ""}${worked(model, reveal)}</div>`;
  }

  function cellTapMarkup(visual, model) {
    const supported = model.questionId === "R-VIS-SUPPORTED";
    return `<div class="fra17-cell-tap"><p>${supported ? "Tap every patterned cell once" : "Count each patterned cell once"}</p>${cells(visual.denominator, visual.firstNumerator, visual.secondNumerator, { selectable: supported })}<div class="fra17-tap-status" aria-live="polite">0 selected cells tapped</div></div>`;
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const authoredVisual = model.visual || {};
    const kind = authoredVisual.kind;
    const reveal = ["correct", "worked", "support"].includes(context?.feedback) || model.questionId === "HOOK-CHOICE";
    if (model.sceneId === "HANDOFF") return `<div class="fra17-handoff"><span id="handoff-invariant">Learn why the piece size stays fixed</span><i aria-hidden="true">&rarr;</i><strong id="stage-guided">Try it with Ryan</strong><i aria-hidden="true">&rarr;</i><span>Your turn</span></div>`;
    if (kind === "light_strip_hook") return hookMarkup(authoredVisual, reveal);
    if (kind === "aligned_fraction_strips") return alignedMarkup(authoredVisual, reveal, model);
    if (kind === "combined_fraction_strip") return combinedMarkup(authoredVisual, reveal, model);
    if (["symbolic_same_denominator_addition", "fraction_input_only"].includes(kind)) return symbolicMarkup(authoredVisual, reveal, model);
    if (["denominator_error_contrast", "repair_partition_contrast"].includes(kind)) return contrastMarkup(authoredVisual, reveal, model);
    if (kind === "guided_two_group_strip") return guidedMarkup(authoredVisual, reveal, model);
    if (kind === "measure_strip") return measureMarkup(authoredVisual, reveal, model);
    if (kind === "reasoning_mcq") return reasoningMarkup(authoredVisual, reveal, model);
    if (kind === "cell_tap_strip") return cellTapMarkup(authoredVisual, model);
    return `<div class="fra17-symbolic">${expression(authoredVisual, reveal)}${worked(model, reveal)}</div>`;
  }

  function accessibleDescription(model, context) {
    const visual = model?.visual || {};
    const reveal = ["correct", "worked", "support"].includes(context?.feedback);
    const before = model?.accessibleDescription || visual.accessibleDescriptionBeforeSubmit || "A same-denominator fraction model.";
    if (!reveal) return before;
    const result = visual.resultFraction;
    return result ? `${before} After submission, the worked result ${result.numerator}/${result.denominator} is shown.` : `${before} The post-submit teaching state is shown.`;
  }

  function bind(container) {
    const cueHost = container.closest(".math-canvas") || container;
    cueHost.addEventListener("revily:narration-cue", (event) => {
      const visual = container.querySelector(".fra17-visual");
      if (!visual || !event.detail?.id) return;
      visual.setAttribute("data-fra17-cue", event.detail.id);
      visual.querySelectorAll(".is-cue-active").forEach((target) => target.classList.remove("is-cue-active"));
      (event.detail.target || []).forEach((targetId) => {
        const target = visual.querySelector(`#${CSS.escape(targetId)}`);
        if (!target) return;
        target.classList.add("is-cue-active", "is-cue-revealed");
        target.closest(".fra17-numerator-calc, .fra17-denominator-anchor, .fra17-general-rule")?.classList.add("is-cue-revealed");
      });
      if (event.detail.id === "HOOK-E4") visual.querySelector(".fra17-invariant")?.classList.add("is-cue-revealed");
    });
    const updateStatus = () => {
      const selected = [...container.querySelectorAll("[data-fra17-cell][aria-pressed=true]")];
      const status = container.querySelector(".fra17-tap-status");
      if (status) status.textContent = `${selected.length} selected cell${selected.length === 1 ? "" : "s"} tapped`;
      const input = container.closest(".lesson-shell")?.querySelector("#integer-answer");
      input?.dispatchEvent(new Event("input", { bubbles: true }));
    };
    container.querySelectorAll("[data-fra17-cell]").forEach((cell) => {
      const toggle = () => {
        if (cell.getAttribute("aria-disabled") === "true") return;
        const pressed = cell.getAttribute("aria-pressed") === "true";
        cell.setAttribute("aria-pressed", String(!pressed));
        cell.classList.toggle("is-tapped", !pressed);
        updateStatus();
      };
      cell.addEventListener("click", toggle);
      cell.addEventListener("keydown", (event) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          toggle();
        }
      });
    });
  }

  window.RevilyFra17Visuals = { accessibleDescription, bind, renderMarkup };
})();
