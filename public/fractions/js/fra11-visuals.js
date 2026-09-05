(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const partName = (denominator, plural) => {
    const names = { 2: ["half", "halves"], 3: ["third", "thirds"], 4: ["quarter", "quarters"], 5: ["fifth", "fifths"], 6: ["sixth", "sixths"], 7: ["seventh", "sevenths"], 8: ["eighth", "eighths"], 9: ["ninth", "ninths"], 10: ["tenth", "tenths"], 11: ["eleventh", "elevenths"], 12: ["twelfth", "twelfths"] };
    return names[Number(denominator)]?.[plural ? 1 : 0] || `${denominator}-part${plural ? "s" : ""}`;
  };

  function fraction(numerator, denominator, className) {
    return `<span class="fra11-fraction ${className || ""}" aria-hidden="true"><b>${escapeHtml(numerator)}</b><i></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function mixed(whole, numerator, denominator, className) {
    return `<span class="fra11-mixed ${className || ""}" aria-hidden="true"><strong>${escapeHtml(whole)}</strong>${fraction(numerator, denominator)}</span>`;
  }

  function pieceMarkup(index, options) {
    const label = options?.pieceAccessibleName;
    const group = options?.groups?.findIndex((range) => index >= range.start && index < range.end) ?? -1;
    const remainder = group === (options?.groups?.length || 0) - 1 && options?.groups?.[group]?.remainder;
    return `<span class="fra11-piece${remainder ? " is-remainder" : ""}" data-piece-index="${index + 1}" data-group-index="${group}"${label ? ` tabindex="0" role="img" aria-label="${escapeHtml(label)}"` : ""}><i aria-hidden="true"></i>${options?.unitLabel ? `<small aria-hidden="true">${escapeHtml(options.unitLabel)}</small>` : ""}</span>`;
  }

  function groupRanges(grouping) {
    let cursor = 0;
    return (grouping || []).map((count, index, all) => {
      const item = { start: cursor, end: cursor + Number(count), remainder: index === all.length - 1 && Number(count) < Number(all[0]) };
      cursor += Number(count);
      return item;
    });
  }

  function pieces(total, options) {
    const safeTotal = Math.max(1, Math.min(60, Number(total) || 1));
    const content = options?.grouped && options?.groups?.length
      ? options.groups.map((range, groupIndex) => `<span class="fra11-piece-group${range.remainder ? " is-remainder-group" : ""}" data-group-index="${groupIndex}" role="group" aria-label="${range.remainder ? "Remaining pieces" : `Complete group ${groupIndex + 1}`}">${Array.from({ length: range.end - range.start }, (_, offset) => pieceMarkup(range.start + offset, options)).join("")}</span>`).join("")
      : Array.from({ length: safeTotal }, (_, index) => pieceMarkup(index, options)).join("");
    return `<div class="fra11-pieces${options?.grouped ? " is-grouped" : ""}" style="--fra11-parts-per-whole:${Number(options?.partsPerWhole) || 4}" data-total-pieces="${safeTotal}">${content}</div>`;
  }

  function groupingLegend(math) {
    if (!math) return "";
    return `<div class="fra11-grouping-legend"><span><b>${math.quotient}</b> complete group${math.quotient === 1 ? "" : "s"}</span><span><b>${math.remainder}</b> left</span></div>`;
  }

  function equalPiecesMarkup(model, reveal, questionId) {
    const math = model.math || {};
    const total = model.totalPieces ?? math.numerator;
    const perWhole = model.partsPerWhole ?? math.denominator;
    const grouping = model.grouping || model.postSubmitGrouping || [...Array(math.quotient || 0)].map(() => perWhole).concat(math.remainder ? [math.remainder] : []);
    const pieceAccessibleName = questionId === "M2" ? "fifth-sized piece" : null;
    return `<div class="fra11-equal-pieces${reveal ? " is-revealed" : ""}" data-fra11-scene="${escapeHtml(model.sceneId || questionId || "pieces")}">
      ${model.context === "quarter_metre_border_tiles" ? `<div class="fra11-tile-bracket"><span aria-hidden="true"></span><b>¼ m</b></div>` : ""}
      ${pieces(total, { partsPerWhole: perWhole, grouped: reveal, groups: reveal ? groupRanges(grouping) : [], unitLabel: model.unitLabel, pieceAccessibleName })}
      ${reveal ? `${groupingLegend(math)}<div class="fra11-result">${fraction(math.numerator, math.denominator)}<span>=</span>${math.remainder ? mixed(math.quotient, math.remainder, math.denominator) : `<strong>${math.quotient}</strong>`}</div>` : ""}
    </div>`;
  }

  function linkedMarkup(model, reveal) {
    const math = model.math || {};
    return `<div class="fra11-linked-model${reveal ? " is-revealed" : ""}" data-fra11-scene="${escapeHtml(model.sceneId || model.questionId || "linked")}">
      <div class="fra11-source-fraction">${fraction(math.numerator, math.denominator)}</div>
      <div class="fra11-linked-division"><span>${math.numerator} ÷ ${math.denominator}</span><b>=</b><strong>${reveal ? `${math.quotient} r${math.remainder}` : "? r?"}</strong></div>
      <div class="fra11-field-map" aria-hidden="true"><span>quotient ↓</span><span>remainder ↓</span><span>original denominator ↓</span></div>
      <div class="fra11-linked-result">${reveal ? mixed(math.quotient, math.remainder, math.denominator) : mixed("?", "?", math.denominator)}</div>
    </div>`;
  }

  function ruleMarkup(model, reveal) {
    const math = model.math || {};
    if (model.kind === "remainder_check") {
      return `<div class="fra11-remainder-check" data-fra11-scene="T4">
        <div class="fra11-invalid-state"><b>NOT FINISHED</b><span>${math.numerator} ÷ ${math.denominator} = ${model.invalid.quotient} r${model.invalid.remainder}</span><small>${model.invalid.remainder} is not smaller than ${math.denominator}</small></div>
        <div class="fra11-valid-state"><b>VALID</b><span>${math.numerator} ÷ ${math.denominator} = ${math.quotient} r${math.remainder}</span><small>${math.remainder} &lt; ${math.denominator}</small>${mixed(math.quotient, math.remainder, math.denominator)}</div>
      </div>`;
    }
    if (model.kind === "exact_whole") return equalPiecesMarkup(model, reveal || !model.questionId, model.questionId);
    if (model.kind === "rule_summary") {
      return `<ol class="fra11-rule-summary">${(model.rule || []).map((line, index) => `<li><b>${index + 1}</b><span>${escapeHtml(line)}</span></li>`).join("")}</ol>`;
    }
    return `<div class="fra11-symbolic-rule" data-fra11-scene="${escapeHtml(model.sceneId || "rule")}">
      <div>${fraction(math.numerator, math.denominator)}<span>→</span><strong>${math.numerator} ÷ ${math.denominator}</strong></div>
      <div class="fra11-rule-fields"><span>quotient in front</span><span>remainder on top</span><span>denominator underneath</span></div>
      <div>${mixed(math.quotient, math.remainder, math.denominator)}</div>
    </div>`;
  }

  function questionMarkup(model, reveal, question) {
    const id = model.questionId || question?.runtimeQuestionId;
    const math = model.math || {};
    if (["equal_pieces", "contextual_equal_pieces"].includes(model.kind)) return equalPiecesMarkup(model, reveal, id);
    if (["linked_division_and_mixed_fields", "division_structure_only"].includes(model.kind)) return linkedMarkup(model, reveal);
    if (model.kind === "student_claim_and_options") {
      return `<div class="fra11-claim-model${reveal ? " is-revealed" : ""}"><span>Student claim</span><strong>${escapeHtml(model.studentClaim)}</strong>${reveal ? `<div>${fraction(math.numerator, math.denominator)}<span>=</span>${math.remainder ? mixed(math.quotient, math.remainder, math.denominator) : `<strong>${math.quotient}</strong>`}</div>` : ""}</div>`;
    }
    if (model.kind === "division_line_options") {
      return `<div class="fra11-division-choice"><strong>${fraction(math.numerator, math.denominator)}</strong><span>${reveal ? `${math.numerator} ÷ ${math.denominator} = ${math.quotient} r${math.remainder}` : "Choose the complete line below"}</span></div>`;
    }
    if (String(model.kind).startsWith("repair_")) {
      const pieceModel = Object.assign({}, model, { totalPieces: math.numerator, partsPerWhole: math.denominator, grouping: [...Array(math.quotient || 0)].map(() => math.denominator).concat(math.remainder ? [math.remainder] : []) });
      if (["repair_grouping", "repair_leftover", "repair_zero"].includes(model.kind)) return equalPiecesMarkup(pieceModel, true, id);
      if (model.kind === "repair_fields") return linkedMarkup(model, true);
      return `<div class="fra11-repair-denominator">${fraction(math.numerator, math.denominator)}<span>the pieces remain</span><strong>${math.denominator === 7 ? "sevenths" : `${math.denominator} equal parts`}</strong>${reveal ? mixed(math.quotient, math.remainder, math.denominator) : ""}</div>`;
    }
    return `<div class="fra11-symbolic-question${reveal ? " is-revealed" : ""}">${fraction(math.numerator, math.denominator)}${reveal ? `<span>=</span>${math.remainder ? mixed(math.quotient, math.remainder, math.denominator) : `<strong>${math.quotient}</strong>`}` : ""}</div>`;
  }

  function teachingLayers(model, initialMarkup, revealedMarkup) {
    return `<div class="fra11-teaching-layers" data-fra11-teaching-scene="${escapeHtml(model.sceneId)}"><div data-fra11-layer="initial">${initialMarkup}</div><div data-fra11-layer="revealed" hidden>${revealedMarkup}</div></div>`;
  }

  function renderMarkup(visual, context) {
    const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
    const reveal = ["correct", "worked", "support"].includes(context?.feedback);
    if (!context?.question) {
      if (["contextual_equal_pieces", "equal_pieces", "exact_whole"].includes(model.kind)) {
        return teachingLayers(model, equalPiecesMarkup(model, false, model.sceneId), equalPiecesMarkup(model, true, model.sceneId));
      }
      if (model.kind === "linked_division_and_mixed_fields") return teachingLayers(model, linkedMarkup(model, false), linkedMarkup(model, true));
      return ruleMarkup(model, true);
    }
    return questionMarkup(model, reveal, context.question);
  }

  function accessibleDescription(model, context) {
    const item = model || {};
    const reveal = ["correct", "worked", "support"].includes(context?.feedback);
    const id = item.questionId || context?.question?.runtimeQuestionId;
    if (!context?.question) {
      if (id === "HOOK" || item.sceneId === "HOOK") return "A border made from equal blue tiles. Each tile is one quarter of a metre. The tiles are ready to be regrouped.";
      const math = item.math;
      return math ? `${math.numerator} equal ${partName(math.denominator, false)}-sized pieces are regrouped into complete wholes and leftovers.` : "A quotient, remainder and unchanged denominator are connected in one improper-fraction model.";
    }
    if (id === "M2" && !reveal) return "A collection of equal fifth-sized pieces. Each piece can be reached individually. The total and final grouping are not announced before submission.";
    if (id === "G1" && !reveal) return "Eleven equal quarter-sized pieces are shown. No complete-group or leftover count is announced before submission.";
    const math = item.math || {};
    if (!reveal) return `${math.numerator} over ${math.denominator} is shown. No quotient, remainder or final mixed number is announced.`;
    return `${math.numerator} over ${math.denominator} is shown as ${math.quotient} complete wholes with ${math.remainder} ${partName(math.denominator, false)}-sized part${math.remainder === 1 ? "" : "s"} left.`;
  }

  function bind(container, visual) {
    container.addEventListener("revily:narration-cue", (event) => {
      const cueId = event.detail?.id || event.detail?.action;
      if (cueId) container.querySelector(".fra11-visual")?.setAttribute("data-fra11-cue", cueId);
      const revealLayer = /HOOK\.CUE\.GROUP_ONE|T1\.CUE\.FIRST_WHOLE|T2\.CUE\.DIVISION|T5\.CUE\.EXACT_GROUPS/.test(String(cueId || ""));
      if (revealLayer) {
        const layers = container.querySelector(".fra11-teaching-layers");
        const initial = layers?.querySelector('[data-fra11-layer="initial"]');
        const revealed = layers?.querySelector('[data-fra11-layer="revealed"]');
        if (initial) initial.hidden = true;
        if (revealed) revealed.hidden = false;
        const model = visual?.scene?.model || visual?.model || {};
        const math = model.math;
        if (math) container.setAttribute("aria-label", `${math.numerator} equal pieces are regrouped into ${math.quotient} complete wholes with ${math.remainder} piece${math.remainder === 1 ? "" : "s"} left. The part size remains ${partName(math.denominator, true)}.`);
      }
    });
  }

  window.RevilyFra11Visuals = { accessibleDescription, bind, renderMarkup };
})();
