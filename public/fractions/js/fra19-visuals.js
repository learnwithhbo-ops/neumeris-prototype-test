(function () {
  "use strict";

  const escape = (value) => window.RevilyVisuals?.escapeHtml?.(String(value ?? "")) || String(value ?? "");
  const fraction = (value, className) => value
    ? `<span class="fra19-fraction ${className || ""}" aria-label="${escape(value.numerator)} over ${escape(value.denominator)}"><b>${escape(value.numerator)}</b><i aria-hidden="true"></i><b>${escape(value.denominator)}</b></span>`
    : "";

  function cells(count, selected, pattern, prefix) {
    const safeCount = Math.max(1, Math.min(48, Number(count) || 1));
    const safeSelected = Math.max(0, Math.min(safeCount, Number(selected) || 0));
    return Array.from({ length: safeCount }, (_, index) => `<i class="fra19-cell${index < safeSelected ? ` is-selected ${pattern || "blue"}` : ""}"${prefix ? ` data-target-id="${escape(prefix)}-${index + 1}"` : ""}></i>`).join("");
  }

  function rail(value, options) {
    const opts = options || {};
    return `<div class="fra19-rail-row ${escape(opts.className || "")}"${opts.targetId ? ` data-target-id="${escape(opts.targetId)}"` : ""}>
      <span class="fra19-rail-label">${opts.label ? escape(opts.label) : fraction(value)}</span>
      <div class="fra19-rail ${escape(opts.pattern || "blue")}" style="--fra19-parts:${Math.max(1, Number(value?.denominator) || 1)}">${cells(value?.denominator, value?.numerator, opts.pattern || "blue", opts.cellPrefix)}</div>
    </div>`;
  }

  function working(question, feedback) {
    if (feedback !== "worked") return "";
    const steps = question?.model?.workedSteps || [];
    const finalLine = question?.model?.workedFinal || "";
    if (!steps.length && !finalLine) return "";
    return `<section class="fra19-working" aria-label="Locked working"><strong>Check the working</strong><ol>${steps.map((step) => `<li>${escape(step)}</li>`).join("")}</ol>${finalLine ? `<p>${escape(finalLine)}</p>` : ""}</section>`;
  }

  function sourceRails(math, visual) {
    if (!math?.left || !math?.right) return "";
    return `<div class="fra19-source-rails">
      ${rail(math.left, { label: `${math.left.numerator}/${math.left.denominator}`, pattern: "blue" })}
      ${rail(math.right, { label: `${math.right.numerator}/${math.right.denominator}`, pattern: "amber" })}
    </div><p class="fra19-safe-note">${escape(visual?.accessibleDescriptionBeforeSubmit || "The equal-length wholes are divided into different part sizes.")}</p>`;
  }

  function hookMarkup(sceneId) {
    const afterClaim = sceneId === "HOOK-CHOICE";
    return `<div class="fra19-board fra19-hook" data-fra19-scene="${escape(sceneId)}">
      <div class="fra19-endpoint-guide" data-target-id="hook-endpoint-guide" aria-hidden="true"></div>
      <div class="fra19-cued-group${afterClaim ? " is-cued" : ""}" data-target-id="hook-blue-rail">${rail({ numerator: 1, denominator: 3 }, { label: "Blue", pattern: "blue", targetId: "hook-blue-thirds" })}</div>
      <div class="fra19-cued-group${afterClaim ? " is-cued" : ""}" data-target-id="hook-amber-rail">${rail({ numerator: 1, denominator: 4 }, { label: "Amber", pattern: "amber", targetId: "hook-amber-fourths" })}</div>
      <div class="fra19-claim${afterClaim ? " is-cued" : ""}" data-target-id="hook-student-claim-2-7"><span>1/3 + 1/4 = 2/7</span><b aria-hidden="true"></b></div>
      <div class="fra19-piece-compare" data-target-id="hook-width-bracket"><span class="blue">one third</span><span class="amber">one quarter</span><i aria-hidden="true"></i></div>
      <p class="fra19-goal" data-target-id="hook-shared-part-size-goal">Make one shared part size first.</p>
    </div>`;
  }

  function t1Markup() {
    return `<div class="fra19-board fra19-mismatch">
      <div class="fra19-lifted blue" data-target-id="t1-third-piece" style="--piece-width:66%"><span>one third</span></div>
      <div class="fra19-lifted amber" data-target-id="t1-quarter-piece" style="--piece-width:50%"><span>one quarter</span></div>
      <div class="fra19-width-bracket" data-target-id="t1-width-bracket"><span>The third is wider</span></div>
      <div class="fra19-denominator-pair"><b data-target-id="t1-denominator-3">thirds</b><b data-target-id="t1-denominator-4">quarters</b></div>
      <p class="fra19-goal" data-target-id="t1-match-goal-arrow">Make the part sizes match before adding.</p>
    </div>`;
  }

  function t2Markup() {
    return `<div class="fra19-board fra19-multiples">
      <section data-target-id="t2-list-3"><strong>Multiples of 3</strong><div><span>3</span><span>6</span><span>9</span><span data-target-id="t2-common-12-a">12</span></div></section>
      <section data-target-id="t2-list-4"><strong>Multiples of 4</strong><div><span>4</span><span>8</span><span data-target-id="t2-common-12-b">12</span></div></section>
      <p class="fra19-common-card" data-target-id="t2-common-denominator-label">12 is a common denominator</p>
    </div>`;
  }

  function t3Markup() {
    return `<div class="fra19-board fra19-subdivide">
      ${rail({ numerator: 1, denominator: 3 }, { label: "1/3", pattern: "blue" })}
      <div class="fra19-transform-arrow" aria-hidden="true">↓ split each third into four</div>
      <div data-target-id="t3-third-subdivision-lines">${rail({ numerator: 4, denominator: 12 }, { label: "4/12", pattern: "blue", targetId: "t3-selected-twelfths" })}</div>
      <div class="fra19-scale-link"><span data-target-id="t3-scale-top">× 4</span><span data-target-id="t3-scale-bottom">× 4</span><i data-target-id="t3-fixed-endpoint">same endpoint</i></div>
    </div>`;
  }

  function t4Markup() {
    return `<div class="fra19-board fra19-combine">
      <div class="fra19-equivalent-pair">
        <div>${rail({ numerator: 4, denominator: 12 }, { label: "1/3 = 4/12", pattern: "blue" })}</div>
        <div data-target-id="t4-quarter-subdivision-lines">${rail({ numerator: 3, denominator: 12 }, { label: "1/4 = 3/12", pattern: "amber", targetId: "t4-selected-twelfths" })}</div>
      </div>
      <div class="fra19-combined-rail" data-target-id="t4-combined-rail">${rail({ numerator: 7, denominator: 12 }, { label: "7/12", pattern: "blend" })}</div>
      <p class="fra19-fixed-denominator" data-target-id="t4-fixed-denominator">4 + 3 = 7 matching pieces; the size stays twelfths.</p>
    </div>`;
  }

  function t5Markup() {
    return `<div class="fra19-board fra19-transfer-model">
      <div data-target-id="t5-source-rails">${rail({ numerator: 3, denominator: 8 }, { label: "3/8", pattern: "blue" })}${rail({ numerator: 5, denominator: 12 }, { label: "5/12", pattern: "amber" })}</div>
      <div class="fra19-divisibility" data-target-id="t5-common-24"><span>24 ÷ 8 = 3</span><span>24 ÷ 12 = 2</span></div>
      <div data-target-id="t5-repartitioned-rails">${rail({ numerator: 9, denominator: 24 }, { label: "9/24", pattern: "blue" })}${rail({ numerator: 10, denominator: 24 }, { label: "10/24", pattern: "amber" })}</div>
      <div class="fra19-result-card" data-target-id="t5-result-19-24">9/24 + 10/24 = 19/24</div>
      <p class="fra19-efficiency" data-target-id="t5-efficiency-note">A larger valid common denominator also works; 24 is efficient.</p>
    </div>`;
  }

  function handoffMarkup() {
    return `<div class="fra19-board fra19-handoff">
      <div><span>1</span><strong>Choose</strong><p>a denominator both fractions can use</p></div>
      <div><span>2</span><strong>Rename</strong><p>both fractions without changing value</p></div>
      <div><span>3</span><strong>Add</strong><p>the numerators; keep the common denominator</p></div>
    </div>`;
  }

  function sceneMarkup(sceneId) {
    if (sceneId === "HOOK" || sceneId === "HOOK-CHOICE") return hookMarkup(sceneId);
    if (sceneId === "T1") return t1Markup();
    if (sceneId === "T2") return t2Markup();
    if (sceneId === "T3") return t3Markup();
    if (sceneId === "T4") return t4Markup();
    if (sceneId === "T5") return t5Markup();
    if (sceneId === "HANDOFF") return handoffMarkup();
    if (sceneId === "INDEPENDENT-TRANSITION") return `<div class="fra19-board fra19-transition"><strong>Your decisions</strong>${handoffMarkup()}</div>`;
    if (sceneId === "FINAL-INTRO") return `<div class="fra19-board fra19-final-intro"><strong>Final check</strong><div>${[1, 2, 3, 4, 5].map((number) => `<span>${number}</span>`).join("")}</div><p>Answer first. Working appears only after the answer locks.</p></div>`;
    return "";
  }

  function methodMarkup(question) {
    const methods = question?.model?.math?.methods || [];
    return `<div class="fra19-methods">${methods.map((method) => `<section><strong>Method ${escape(method.id)}</strong><p>Common denominator ${escape(method.commonDenominator)}</p><p>${escape(method.leftEquivalent.numerator)}/${escape(method.commonDenominator)} + ${escape(method.rightEquivalent.numerator)}/${escape(method.commonDenominator)} = ${escape(method.result.numerator)}/${escape(method.result.denominator)}</p></section>`).join("")}</div>`;
  }

  function questionMarkup(question, feedback) {
    const visual = question?.model?.visual || {};
    const math = question?.model?.math || {};
    let main = "";
    if (visual.kind === "method_comparison_cards") main = methodMarkup(question);
    else if (visual.kind === "candidate_denominator_cards") main = `<div class="fra19-candidates">${(visual.candidateDenominators || math.candidates || []).map((value) => `<span>${escape(value)}</span>`).join("")}</div>`;
    else if (visual.kind === "equivalent_fraction_builder") main = `<div class="fra19-equivalence-card">${fraction(math.source)}<b>=</b><span class="fra19-fraction"><b>?</b><i></i><b>${escape(math.targetDenominator)}</b></span></div>`;
    else if (visual.kind === "same_denominator_locked_field") main = `<div class="fra19-locked-denominator">${fraction(math.left)}<b>+</b>${fraction(math.right)}<b>=</b><span class="fra19-fraction"><b>?</b><i></i><b>${escape(math.left?.denominator || visual.preferredCommonDenominator)}</b></span><small>denominator fixed</small></div>`;
    else if (visual.kind === "context_tape_lengths") main = `<div class="fra19-cables"><span class="blue">${escape(math.left?.numerator)}/${escape(math.left?.denominator)} m</span><i aria-hidden="true"></i><span class="amber">${escape(math.right?.numerator)}/${escape(math.right?.denominator)} m</span></div>`;
    else if (visual.kind === "error_analysis") main = `<div class="fra19-error-card"><span>${escape(question.canonicalQuestion?.studentWork || question.prompt)}</span></div>${sourceRails(math, visual)}`;
    else if (visual.kind === "staged_fraction_builder") main = sourceRails(math, visual);
    else if (math.left && math.right) main = sourceRails(math, visual);
    else main = `<div class="fra19-symbolic-card"><strong>${escape(question?.canonicalQuestion?.title || "Exact fraction work")}</strong><p>${escape(visual.accessibleDescriptionBeforeSubmit || question?.prompt || "")}</p></div>`;
    return `<div class="fra19-board fra19-question" data-fra19-question="${escape(question?.canonicalQuestionId || "")}">${main}${working(question, feedback)}</div>`;
  }

  function repairMarkup(model) {
    const sceneId = model?.questionId || "";
    const visual = model?.visual || {};
    if (sceneId === "R-DIRECT") return `<div class="fra19-board fra19-repair">${rail({ numerator: 2, denominator: 3 }, { label: "2/3", pattern: "blue" })}${rail({ numerator: 1, denominator: 4 }, { label: "1/4", pattern: "amber" })}<div class="fra19-claim"><span>3/7</span><b></b></div><p>Rename as twelfths, then add: 8/12 + 3/12 = 11/12.</p></div>`;
    if (sceneId === "R-SCALE") return `<div class="fra19-board fra19-repair"><div class="fra19-scale-repair"><span>3/8</span><b>× 3 on both</b><span>9/24</span></div>${rail({ numerator: 9, denominator: 24 }, { label: "same amount", pattern: "blue" })}</div>`;
    if (sceneId === "R-COMMON") return `<div class="fra19-board fra19-repair"><div class="fra19-candidates"><span class="invalid">18</span><span class="valid">24</span></div><p>24 = 8 × 3 and 12 × 2. A valid common multiple works for both.</p></div>`;
    if (sceneId === "R-KEEP") return `<div class="fra19-board fra19-repair"><div class="fra19-claim"><span>9/24 + 10/24 = 19/48</span><b></b></div><div class="fra19-result-card">9/24 + 10/24 = 19/24</div></div>`;
    return `<div class="fra19-board fra19-repair"><p>${escape(visual.accessibleDescriptionBeforeSubmit || "Targeted FRA-19 repair")}</p></div>`;
  }

  function renderMarkup(visual, ctx) {
    const question = ctx?.question;
    const model = question?.model || visual?.scene?.model || visual?.model || {};
    if (model.sceneId) return sceneMarkup(model.sceneId);
    if (question?.canonicalQuestionId === "HOOK-CHOICE" || model.canonicalQuestion?.id === "HOOK") return hookMarkup("HOOK-CHOICE");
    if (question?.policy?.reteachOnly || model.canonicalRepair) return repairMarkup(model);
    return questionMarkup(question, ctx?.feedback || "initial");
  }

  function accessibleDescription(model, ctx) {
    const visual = model?.visual || ctx?.question?.model?.visual || {};
    if (ctx?.feedback === "worked" && ctx?.question?.model?.workedFinal) return `${visual.accessibleDescriptionBeforeSubmit || "Fraction model."} Locked working: ${ctx.question.model.workedFinal}`;
    return visual.accessibleDescriptionBeforeSubmit || model?.canonicalQuestion?.visual?.accessibleDescriptionBeforeSubmit || "An equal-length FRA-19 fraction model. Answer-sensitive values are hidden until submission.";
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const cue = event.detail || {};
      (cue.targetIds || []).forEach((targetId) => {
        container.querySelectorAll(`[data-target-id="${window.CSS?.escape ? CSS.escape(targetId) : targetId}"]`).forEach((node) => node.classList.add("is-cued"));
      });
      if (cue.id) container.dataset.fra19Cue = cue.id;
    });
  }

  window.RevilyFra19Visuals = { accessibleDescription, bind, renderMarkup };
})();
