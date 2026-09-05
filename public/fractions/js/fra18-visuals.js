(function () {
  "use strict";

  const escape = (value) => window.RevilyVisuals?.escapeHtml?.(String(value ?? "")) || String(value ?? "");
  const cueClass = (id) => `cue-${String(id || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  function fraction(value, className) {
    if (!value) return "";
    return `<span class="fra18-fraction ${escape(className || "")}" aria-label="${escape(value.numerator)} over ${escape(value.denominator)}"><b>${escape(value.numerator)}</b><i aria-hidden="true"></i><b>${escape(value.denominator)}</b></span>`;
  }

  function cells(total, selected, pattern) {
    const count = Math.max(1, Math.min(30, Number(total) || 1));
    const active = Math.max(0, Math.min(count, Number(selected) || 0));
    return Array.from({ length: count }, (_, index) => `<i class="fra18-cell${index < active ? ` is-selected ${pattern || "blue"}` : ""}"></i>`).join("");
  }

  function strip(value, options) {
    const opts = options || {};
    return `<div class="fra18-strip-row ${escape(opts.className || "")}">
      <span class="fra18-strip-label">${opts.label ? escape(opts.label) : fraction(value)}</span>
      <div class="fra18-strip ${escape(opts.pattern || "blue")}" style="--fra18-parts:${Math.max(1, Number(value?.denominator) || 1)}">${cells(value?.denominator, value?.numerator, opts.pattern || "blue")}</div>
    </div>`;
  }

  function battery(value, pattern) {
    return `<div class="fra18-battery ${escape(pattern || "blue")}" style="--fra18-parts:${Math.max(1, Number(value.denominator) || 1)}"><div>${cells(value.denominator, value.numerator, pattern || "blue")}</div><i aria-hidden="true"></i></div>`;
  }

  function working(question, feedback) {
    if (feedback !== "worked") return "";
    const steps = question?.model?.workedSteps || [];
    if (!steps.length) return "";
    return `<section class="fra18-working" aria-label="Locked working"><strong>Check the working</strong><ol>${steps.map((step) => `<li>${escape(step)}</li>`).join("")}</ol></section>`;
  }

  function hookMarkup(sceneId) {
    const completed = sceneId === "HOOK-CHOICE" ? " cue-hook-c1 cue-hook-c2 cue-hook-c3 cue-hook-c4 cue-hook-c5" : "";
    return `<div class="fra18-board fra18-hook${completed}" data-fra18-scene="${escape(sceneId)}">
      <section class="fra18-battery-card hook-first"><span>First burst</span>${battery({ numerator: 1, denominator: 4 }, "blue")}<b>1/4</b></section>
      <span class="fra18-plus" aria-hidden="true">+</span>
      <section class="fra18-battery-card hook-second"><span>Second burst</span>${battery({ numerator: 4, denominator: 12 }, "amber")}<b>4/12</b></section>
      <div class="fra18-size-compare"><span class="quarter-piece">one quarter</span><span class="twelfth-piece">one twelfth</span><b>different-sized parts</b></div>
      <p class="fra18-ready-note">12 already contains quarters exactly: 4 × 3 = 12</p>
    </div>`;
  }

  function t1Markup() {
    return `<div class="fra18-board fra18-part-compare"><div class="quarter-piece">one quarter</div><div class="twelfth-piece">one twelfth</div><p>Numerators can combine only when the parts are the same size.</p></div>`;
  }

  function t2Markup() {
    return `<div class="fra18-board fra18-ready-denominator"><div class="fra18-expression">${fraction({ numerator: 1, denominator: 4 }, "changes")}<b>+</b>${fraction({ numerator: 4, denominator: 12 }, "ready")}</div><div class="fra18-factor-card">4 × 3 = <strong>12</strong></div><p><span>Change 1/4</span><span>Keep 4/12 unchanged</span></p></div>`;
  }

  function t3Markup() {
    return `<div class="fra18-board fra18-subdivide"><div>${battery({ numerator: 1, denominator: 4 }, "blue")}<span>1/4</span></div><b aria-hidden="true">→ split each quarter into three</b><div>${battery({ numerator: 3, denominator: 12 }, "blue")}<span>3/12</span></div><p><span>× 3 on top</span><span>× 3 on bottom</span><strong>same amount</strong></p></div>`;
  }

  function t4Markup() {
    return `<div class="fra18-board fra18-combine">${strip({ numerator: 3, denominator: 12 }, { label: "3/12", pattern: "blue" })}${strip({ numerator: 4, denominator: 12 }, { label: "4/12", pattern: "amber" })}<div class="fra18-combine-arrow" aria-hidden="true">↓</div>${strip({ numerator: 7, denominator: 12 }, { label: "7/12", pattern: "blend" })}<p><strong>3 + 4 = 7</strong><span>Keep the denominator 12</span></p></div>`;
  }

  function t5Markup() {
    return `<div class="fra18-board fra18-order"><div class="fra18-expression">${fraction({ numerator: 4, denominator: 18 }, "ready")}<b>+</b>${fraction({ numerator: 1, denominator: 6 }, "changes")}</div><div class="fra18-factor-card">6 × 3 = 18</div><div class="fra18-expression">${fraction({ numerator: 4, denominator: 18 })}<b>+</b>${fraction({ numerator: 3, denominator: 18 })}<b>=</b>${fraction({ numerator: 7, denominator: 18 })}</div><p>The denominator relationship—not screen position—decides which fraction changes.</p></div>`;
  }

  function t6Markup() {
    return `<div class="fra18-board fra18-boundary"><section class="is-fra18"><strong>Fits this lesson</strong><p>2/5 + 3/10</p><span>5 × 2 = 10</span><b>Use the existing 10</b></section><section class="is-later"><strong>Later lesson</strong><p>2/5 + 1/6</p><span>Neither denominator divides the other</span><b>Do not solve here</b></section></div>`;
  }

  function handoffMarkup() {
    return `<div class="fra18-board fra18-handoff"><section><span>1</span><strong>Find</strong><p>the denominator already ready</p></section><section><span>2</span><strong>Rename</strong><p>one fraction only</p></section><section><span>3</span><strong>Add</strong><p>new numerators; keep the denominator</p></section></div>`;
  }

  function sceneMarkup(sceneId) {
    if (sceneId === "HOOK" || sceneId === "HOOK-CHOICE") return hookMarkup(sceneId);
    if (sceneId === "T1") return t1Markup();
    if (sceneId === "T2") return t2Markup();
    if (sceneId === "T3") return t3Markup();
    if (sceneId === "T4") return t4Markup();
    if (sceneId === "T5") return t5Markup();
    if (sceneId === "T6") return t6Markup();
    if (sceneId === "HANDOFF") return handoffMarkup();
    if (sceneId === "FINAL-INTRO") return `<div class="fra18-board fra18-final-intro"><strong>Final check</strong><div>${[1, 2, 3, 4, 5].map((number) => `<span>${number}</span>`).join("")}</div><p>Commit each answer first. Working appears only after it locks.</p></div>`;
    return "";
  }

  function questionMarkup(question, feedback) {
    const math = question?.model?.math;
    const authored = question?.canonicalQuestion || question?.model?.canonicalQuestion;
    let model = "";
    if (math?.left && math?.right) {
      const leftPattern = math.changingOperand === "left" ? "blue" : "ready";
      const rightPattern = math.changingOperand === "right" ? "amber" : "ready";
      model = `<div class="fra18-expression fra18-question-expression">${fraction(math.left, leftPattern)}<b>+</b>${fraction(math.right, rightPattern)}</div>
        <div class="fra18-source-strips">${strip(math.left, { label: `${math.left.numerator}/${math.left.denominator}`, pattern: "blue" })}${strip(math.right, { label: `${math.right.numerator}/${math.right.denominator}`, pattern: "amber" })}</div>`;
    } else if (question?.model?.equivalence?.source) {
      model = `<div class="fra18-expression">${fraction(question.model.equivalence.source)}<b>=</b><span class="fra18-fraction"><b>?</b><i></i><b>${escape(question.model.equivalence.targetDenominator)}</b></span></div>`;
    } else {
      model = `<div class="fra18-symbolic-card"><strong>${escape(authored?.representation || "One-conversion fraction addition")}</strong></div>`;
    }
    return `<div class="fra18-board fra18-question" data-fra18-question="${escape(question?.canonicalQuestionId || "")}">${model}${working(question, feedback)}</div>`;
  }

  function repairMarkup(model) {
    const id = model?.questionId;
    if (id === "R-ONE") return `<div class="fra18-board fra18-repair"><div class="fra18-expression">${fraction({ numerator: 2, denominator: 9 }, "ready")}<b>+</b>${fraction({ numerator: 1, denominator: 3 }, "changes")}</div><p>Leave the ninths ready. Rename only the thirds.</p></div>`;
    if (id === "R-EQUIV") return `<div class="fra18-board fra18-repair"><div class="fra18-expression">${fraction({ numerator: 1, denominator: 5 })}<b>× 3 on top and bottom</b>${fraction({ numerator: 3, denominator: 15 })}</div><p>The amount stays fixed.</p></div>`;
    if (id === "R-NEW-NUM") return `<div class="fra18-board fra18-repair"><div class="fra18-expression">${fraction({ numerator: 2, denominator: 8 })}<b>+</b>${fraction({ numerator: 3, denominator: 8 })}<b>=</b>${fraction({ numerator: 5, denominator: 8 })}</div><p>After renaming, add the new numerator.</p></div>`;
    if (id === "R-DENOM") return `<div class="fra18-board fra18-repair">${strip({ numerator: 7, denominator: 15 }, { label: "7/15", pattern: "blend" })}<p>Fifteen still names the piece size. Do not add or double it.</p></div>`;
    return `<div class="fra18-board fra18-repair"><p>${escape(model?.accessibleDescription || "Targeted one-conversion repair")}</p></div>`;
  }

  function renderMarkup(visual, context) {
    const question = context?.question;
    const model = question?.model || visual?.scene?.model || visual?.model || {};
    if (model.sceneId) return sceneMarkup(model.sceneId);
    if (question?.policy?.reteachOnly || model.canonicalRepair || model.repair) return repairMarkup(model);
    return questionMarkup(question, context?.feedback || "initial");
  }

  function accessibleDescription(model, context) {
    const question = context?.question;
    const before = model?.accessibleDescription || question?.model?.accessibleDescription || "An equal-whole FRA-18 fraction model. Answer-sensitive values are hidden before submission.";
    if (context?.feedback === "worked" && question?.model?.workedSteps?.length) return `${before} Locked working: ${question.model.workedSteps.join("; ")}`;
    return before;
  }

  function bind(container) {
    container.addEventListener("revily:narration-cue", (event) => {
      const cue = event.detail || {};
      const board = container.querySelector(".fra18-board");
      if (!board || !cue.id) return;
      board.dataset.fra18Cue = cue.id;
      board.classList.add(cueClass(cue.id));
    });
  }

  window.RevilyFra18Visuals = { accessibleDescription, bind, renderMarkup };
})();
