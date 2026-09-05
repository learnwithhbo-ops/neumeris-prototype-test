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

  function fractionMarkup(numerator, denominator, className) {
    return `<span class="fra05-fraction ${className || ""}" aria-label="${escapeHtml(numerator)} over ${escapeHtml(denominator)}"><b>${escapeHtml(numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function modelFrom(visual, context) {
    return context?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function runnerMarkup(model, reveal) {
    const markers = Math.max(2, Number(model.markerCount) || 5);
    const gaps = Math.max(1, Number(model.equalGapCount) || markers - 1);
    const runnerIndex = Math.max(0, Math.min(markers - 1, Number(model.runnerMarkerIndexFromZero) || 3));
    return `<div class="fra05-runner-track${reveal ? " is-revealed" : ""}" style="--fra05-gaps:${gaps};--fra05-runner:${runnerIndex}">
      <div class="fra05-track-heading"><span>START</span><strong>Count the journey</strong><span>FINISH</span></div>
      <div class="fra05-track-line" aria-hidden="true">
        <div class="fra05-gap-bands">${Array.from({ length: gaps }, (_, index) => `<span class="${index < runnerIndex ? "is-travelled" : ""}" style="--gap:${index}"><i></i></span>`).join("")}</div>
        <div class="fra05-track-markers">${Array.from({ length: markers }, (_, index) => `<span style="--marker:${index}" class="${index === runnerIndex ? "has-runner" : ""}"><i></i>${index === runnerIndex ? "<b class=\"fra05-runner\">R</b>" : ""}</span>`).join("")}</div>
      </div>
      <div class="fra05-track-labels"><b>${escapeHtml(model.startLabel || "0")}</b><b>${escapeHtml(model.finishLabel || "1")}</b></div>
      <div class="fra05-runner-callouts" aria-hidden="true">
        <span class="fra05-tempting">${fractionMarkup(model.initialTemptingLabel?.numerator || 4, model.initialTemptingLabel?.denominator || 5)}<em>?</em></span>
        <span class="fra05-reveal-fraction">${fractionMarkup(model.revealLabel?.numerator || 3, model.revealLabel?.denominator || 4)}</span>
      </div>
      <p class="visually-hidden">Five boundary markers make four equal journey spaces. The runner is on the fourth marker after travelling three spaces.</p>
    </div>`;
  }

  function anchorLabels(model) {
    const anchors = Array.isArray(model.anchors) && model.anchors.length
      ? model.anchors
      : [{ value: model.minWhole || 0, label: String(model.minWhole || 0) }, { value: model.maxWhole || 1, label: String(model.maxWhole || 1) }];
    const span = Number(model.maxWhole || 1) - Number(model.minWhole || 0) || 1;
    return anchors.map((anchor) => `<span class="fra05-anchor${anchor.major ? " is-major" : ""}" style="--anchor:${((Number(anchor.value) - Number(model.minWhole || 0)) / span) * 100}%">${escapeHtml(anchor.label)}</span>`).join("");
  }

  function screenReaderLine(model, showPoint, isEstimate, reveal) {
    if (isEstimate) {
      const point = Number(model.estimatedPointValue);
      const relativePosition = point < 0.5
        ? "Point P is between 0 and one half."
        : point > 0.5
          ? "Point P is between one half and 1."
          : "Point P is at one half.";
      const workedComparison = reveal && Array.isArray(model.workedEstimateComparisons)
        ? ` After answer lock, the guide compares ${model.workedEstimateComparisons.map((item) => item.label).join(" and ")}.`
        : "";
      return `<p class="visually-hidden">A number line from 0 to 1 with one half labelled. ${relativePosition} Use the spacing from the labelled anchors to estimate.${workedComparison}</p>`;
    }
    const denominator = Math.max(1, Number(model.denominator) || 1);
    const total = denominator * Math.max(1, Number(model.maxWhole) || 1);
    const point = Number(model.pointIndexFromZero);
    return `<ol class="visually-hidden fra05-boundary-sequence" aria-label="Number-line boundaries in order">${Array.from({ length: total + 1 }, (_, index) => {
      const whole = index % denominator === 0 ? `, whole-number label ${index / denominator}` : "";
      const marked = showPoint && index === point ? ", marked P" : "";
      return `<li>Boundary ${index + 1}${whole}${marked}</li>`;
    }).join("")}</ol>`;
  }

  function numberLineMarkup(model, context) {
    const feedback = context?.feedback || "initial";
    const reveal = ["correct", "support", "worked"].includes(feedback);
    const isEstimate = Number.isFinite(Number(model.estimatedPointValue));
    const denominator = Math.max(1, Number(model.denominator) || 1);
    const maxWhole = Math.max(1, Number(model.maxWhole) || 1);
    const total = isEstimate ? 0 : denominator * maxWhole;
    const answerPoint = isEstimate
      ? Math.max(0, Math.min(100, Number(model.estimatedPointValue) * 100 / maxWhole))
      : Math.max(0, Math.min(100, (Number(model.pointIndexFromZero) / total) * 100));
    const interactive = model.interactiveMode === "select_tick";
    const scoredBeforeSubmit = Boolean(context?.question) && !reveal;
    const showPoint = model.showPointInitially === true || (reveal && Number.isFinite(answerPoint));
    const showBands = model.showIntervalBandsInitially === true || (reveal && model.revealIntervalBandsAfterSubmit === true);
    const ticks = isEstimate ? "" : Array.from({ length: total + 1 }, (_, index) => {
      const major = index % denominator === 0;
      return `<span class="fra05-tick${major ? " is-major" : ""}" style="--tick:${(index / total) * 100}%" data-tick-index="${index}"><i></i></span>`;
    }).join("");
    const bands = isEstimate ? "" : Array.from({ length: total }, (_, index) => `<span class="${showBands ? "is-visible" : ""}${Number.isInteger(model.pointIndexFromZero) && index < model.pointIndexFromZero ? " is-to-point" : ""}" style="--band:${index};--bands:${total}"><i>${model.showIntervalOrdinalsInitially || (reveal && model.revealIntervalOrdinalsAfterSubmit) ? index + 1 : ""}</i></span>`).join("");
    const estimateGuideDenominator = reveal ? Number(model.revealSubdivisionDenominatorAfterSubmit) : 0;
    const estimateGuide = isEstimate && estimateGuideDenominator > 1
      ? `<div class="fra05-estimate-guide" aria-hidden="true">${Array.from({ length: estimateGuideDenominator - 1 }, (_, index) => `<span style="--guide:${((index + 1) / estimateGuideDenominator) * 100}%"></span>`).join("")}</div>`
      : "";
    const estimateComparisons = isEstimate && reveal && Array.isArray(model.workedEstimateComparisons)
      ? `<div class="fra05-estimate-comparisons" aria-hidden="true">${model.workedEstimateComparisons.map((item) => {
          const value = Number(item.numerator) / Number(item.denominator);
          const position = Math.max(0, Math.min(100, value * 100 / maxWhole));
          const status = item.status === "best_estimate" ? " is-best" : " is-too-small";
          return `<span class="fra05-estimate-comparison${status}" style="--comparison:${position}%"><i></i><b>${escapeHtml(item.label)}</b><em>${escapeHtml(item.callout || "")}</em></span>`;
        }).join("")}</div>`
      : "";
    const pointLabel = escapeHtml(model.pointLabel || "P");
    const answerFraction = isEstimate && reveal && model.workedBestEstimate
      ? `<span class="fra05-estimate-conclusion">Best estimate ${fractionMarkup(model.workedBestEstimate.numerator, model.workedBestEstimate.denominator, "fra05-line-fraction")}</span>`
      : !isEstimate && Number.isInteger(model.pointIndexFromZero) && model.denominator && (reveal || !context?.question)
        ? fractionMarkup(model.pointIndexFromZero, model.denominator, "fra05-line-fraction")
        : "";
    return `<div class="fra05-number-line${interactive ? " is-interactive" : ""}${isEstimate ? " is-estimate" : ""}${reveal ? " is-revealed" : ""}${showBands ? " has-bands" : ""}" style="--fra05-answer:${answerPoint}%" data-total-ticks="${total}">
      <div class="fra05-line-kicker"><span>${isEstimate ? "USE THE LABELLED POSITIONS" : scoredBeforeSubmit ? "COUNT THE EQUAL SPACES" : `${denominator} EQUAL INTERVAL${denominator === 1 ? "" : "S"} PER WHOLE`}</span>${maxWhole > 1 ? "<b>Keep the same step size past 1</b>" : ""}</div>
      <div class="fra05-whole-brackets" aria-hidden="true">${Array.from({ length: maxWhole }, (_, index) => `<span style="--whole:${index};--wholes:${maxWhole}"><i></i><b>one whole</b></span>`).join("")}</div>
      <div class="fra05-line-wrap">
        <div class="fra05-line-hit" data-fra05-tick-surface="${interactive}" aria-hidden="true">
          <div class="fra05-bands">${bands}</div>
          <div class="fra05-axis"></div>
          ${estimateGuide}
          ${estimateComparisons}
          <div class="fra05-ticks">${ticks}</div>
          ${showPoint || !context?.question ? `<span class="fra05-fixed-point${showPoint ? " is-visible" : ""}" style="--point:${answerPoint}%"><b>${pointLabel}</b><i></i></span>` : ""}
          <span class="fra05-selected-point" style="--point:0%" hidden><b>${pointLabel}</b><i></i></span>
        </div>
        <div class="fra05-anchor-labels" aria-hidden="true">${anchorLabels(model)}</div>
      </div>
      <div class="fra05-line-answer" aria-hidden="true">${answerFraction}</div>
      ${screenReaderLine(model, showPoint, isEstimate, reveal)}
    </div>`;
  }

  function renderMarkup(visual, context) {
    const model = modelFrom(visual, context);
    const reveal = ["correct", "support", "worked"].includes(context?.feedback || "initial");
    return model.context === "fra05_runner_track" || model.kind === "runner_track"
      ? runnerMarkup(model, reveal)
      : numberLineMarkup(model, context || {});
  }

  function accessibleDescription(model, context) {
    if (!model) return "A fraction number-line model.";
    if (model.context === "fra05_runner_track") return "A journey track with five boundary markers and four equal spaces; the runner stands on the fourth marker.";
    if (Number.isFinite(Number(model.estimatedPointValue))) {
      const point = Number(model.estimatedPointValue);
      const position = point < 0.5 ? "between 0 and one half" : point > 0.5 ? "between one half and 1" : "at one half";
      const reveal = ["correct", "support", "worked"].includes(context?.feedback || "initial");
      const worked = reveal && Array.isArray(model.workedEstimateComparisons)
        ? " The locked worked check shows one fifth too near zero and one third almost at P."
        : "";
      return `A number line from 0 to 1 with one half labelled and point P ${position}.${worked}`;
    }
    const maxWhole = Number(model.maxWhole) || 1;
    const denominator = Number(model.denominator) || 1;
    const reveal = ["correct", "support", "worked"].includes(context?.feedback || "initial");
    if (reveal && Number.isInteger(model.pointIndexFromZero)) return `A number line from 0 to ${maxWhole}, divided into ${denominator} equal intervals per whole, with P at boundary index ${model.pointIndexFromZero} from zero.`;
    if (context?.question && model.interactiveMode === "select_tick") return `A selectable number line from 0 to ${maxWhole} with evenly spaced boundary marks. Use the boundary selector below to place P.`;
    if (context?.question && model.showPointInitially === true) return `A number line from 0 to ${maxWhole} with evenly spaced boundary marks. Point P is marked for you to read.`;
    if (context?.question) return `A number line from 0 to ${maxWhole} with evenly spaced boundary marks and no point marked.`;
    if (model.interactiveMode === "select_tick") return `A selectable number line from 0 to ${maxWhole}, divided into ${denominator} equal intervals per whole.`;
    return `A number line from 0 to ${maxWhole}, divided into ${denominator} equal intervals per whole.`;
  }

  function updateSelectedTick(container, index) {
    const line = container?.querySelector(".fra05-number-line.is-interactive");
    if (!line) return;
    const total = Math.max(1, Number(line.dataset.totalTicks) || 1);
    const safe = Math.max(0, Math.min(total, Number(index) || 0));
    const point = line.querySelector(".fra05-selected-point");
    if (point) {
      point.hidden = false;
      point.style.setProperty("--point", `${(safe / total) * 100}%`);
    }
    line.querySelectorAll(".fra05-tick").forEach((tick) => tick.classList.toggle("is-selected", Number(tick.dataset.tickIndex) === safe));
  }

  function bind(container, visual, context) {
    const model = modelFrom(visual, context);
    if (model.interactiveMode !== "select_tick") return;
    const surface = container.querySelector("[data-fra05-tick-surface=true]");
    if (!surface) return;
    const total = Math.max(1, Number(model.denominator) * Number(model.maxWhole || 1));
    let dragging = false;
    const selectAt = (clientX) => {
      const rect = surface.getBoundingClientRect();
      if (!rect.width) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const index = Math.round(ratio * total);
      updateSelectedTick(container, index);
      container.dispatchEvent(new CustomEvent("revily:tick-select", { bubbles: true, detail: { index } }));
    };
    surface.addEventListener("pointerdown", (event) => {
      dragging = true;
      surface.setPointerCapture?.(event.pointerId);
      selectAt(event.clientX);
    });
    surface.addEventListener("pointermove", (event) => {
      if (dragging) selectAt(event.clientX);
    });
    surface.addEventListener("pointerup", (event) => {
      dragging = false;
      surface.releasePointerCapture?.(event.pointerId);
    });
    surface.addEventListener("pointercancel", () => { dragging = false; });
  }

  window.RevilyFra05Visuals = { accessibleDescription, bind, fractionMarkup, renderMarkup, updateSelectedTick };
})();
