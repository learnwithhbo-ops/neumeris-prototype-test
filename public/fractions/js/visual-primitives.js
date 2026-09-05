(function () {
  "use strict";

  const NUMBER_WORDS = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
    fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
    nineteen: 19, twenty: 20
  };
  const DENOMINATOR_WORDS = {
    half: 2, halves: 2, third: 3, thirds: 3, quarter: 4, quarters: 4,
    fourth: 4, fourths: 4, fifth: 5, fifths: 5, sixth: 6, sixths: 6,
    seventh: 7, sevenths: 7, eighth: 8, eighths: 8, ninth: 9, ninths: 9,
    tenth: 10, tenths: 10, eleventh: 11, elevenths: 11, twelfth: 12,
    twelfths: 12, thirteenth: 13, thirteenths: 13, fourteenth: 14,
    fourteenths: 14, fifteenth: 15, fifteenths: 15, sixteenth: 16,
    sixteenths: 16, twentieth: 20, twentieths: 20
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function fractionMarkup(numerator, denominator, className) {
    return `<span class="math-fraction ${className || ""}" aria-label="${escapeHtml(numerator)} over ${escapeHtml(denominator)}"><span>${escapeHtml(numerator)}</span><i aria-hidden="true"></i><span>${escapeHtml(denominator)}</span></span>`;
  }

  function mathMarkup(expression) {
    const text = String(expression ?? "");
    const pattern = /(-?\d+)\s+(\d+)\s*\/\s*(\d+)|(-?[\d?A-Za-z]+)\s*\/\s*(-?[\d?A-Za-z]+)/g;
    let result = "";
    let last = 0;
    let match;
    while ((match = pattern.exec(text))) {
      result += escapeHtml(text.slice(last, match.index));
      if (match[1] !== undefined) {
        result += `<span class="mixed-inline"><b>${escapeHtml(match[1])}</b>${fractionMarkup(match[2], match[3])}</span>`;
      } else {
        result += fractionMarkup(match[4], match[5]);
      }
      last = match.index + match[0].length;
    }
    return result + escapeHtml(text.slice(last));
  }

  function wordNumber(value) {
    const text = String(value || "").toLowerCase();
    if (/^\d+$/.test(text)) return Number(text);
    return NUMBER_WORDS[text];
  }

  function expandFractionWords(text) {
    const numberWords = Object.keys(NUMBER_WORDS).join("|");
    const denominatorWords = Object.keys(DENOMINATOR_WORDS).join("|");
    return String(text || "").replace(new RegExp(`\\b(${numberWords})\\s+(${denominatorWords})\\b`, "gi"), (phrase, nWord, dWord) => {
      return `${NUMBER_WORDS[nWord.toLowerCase()]}/${DENOMINATOR_WORDS[dWord.toLowerCase()]}`;
    });
  }

  function cleanVisualText(text) {
    return String(text || "")
      .replace(/Render every numerical or symbolic example literally named in that line; add no alternative example\.?/gi, " ")
      .replace(/Render the exact quantities\/representation required by this authored prompt:\s*/gi, " ")
      .replace(/Render the exact mathematical objects described in:\s*/gi, " ")
      .replace(/Ryan line for this scene is fixed as:\s*/gi, " ")
      .replace(/Do not pre-fill the learner answer\.?/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractFractions(text) {
    const source = expandFractionWords(text);
    const results = [];
    const seen = new Set();
    const pattern = /(-?\d+)\s+(\d+)\s*\/\s*(\d+)|(-?\d+)\s*\/\s*(\d+)/g;
    let match;
    while ((match = pattern.exec(source))) {
      const item = match[1] !== undefined
        ? { whole: Number(match[1]), n: Number(match[2]), d: Number(match[3]), raw: `${match[1]} ${match[2]}/${match[3]}` }
        : { whole: 0, n: Number(match[4]), d: Number(match[5]), raw: `${match[4]}/${match[5]}` };
      const key = item.raw;
      if (item.d > 0 && !seen.has(key)) {
        seen.add(key);
        results.push(item);
      }
    }
    return results;
  }

  function inferAreaModel(text, fractions, options) {
    const opts = options || {};
    const source = expandFractionWords(cleanVisualText(text)).toLowerCase();
    if (fractions.length) {
      return {
        n: Math.max(0, fractions[0].n),
        d: Math.max(1, fractions[0].d),
        whole: fractions[0].whole || 0,
        selectionKind: selectionKind(source)
      };
    }

    const partNouns = "parts|pieces|sections|strips|boxes|quarters|intervals|regions|counters|tiles|cupcakes|lengths|slices";
    const numberToken = `\\d+|${Object.keys(NUMBER_WORDS).join("|")}`;
    const ofMatch = source.match(new RegExp(`\\b(${numberToken})\\s+of\\s+(?:(?:these|the)\\s+)?(${numberToken})\\s+(?:equal(?:-sized)?\\s+)?(?:${partNouns})\\b`, "i"));
    if (ofMatch) {
      return {
        n: wordNumber(ofMatch[1]) || 0,
        d: wordNumber(ofMatch[2]) || 1,
        whole: 0,
        selectionKind: selectionKind(source)
      };
    }

    const partMatch = source.match(new RegExp(`(?:split|divided|made|has|contains|into|whole(?:\\s+set)?\\s+(?:has|contains))[^.!?]{0,55}?(${numberToken})\\s+(?:equal(?:-sized)?\\s+)?(?:${partNouns})\\b`, "i"))
      || source.match(new RegExp(`\\b(${numberToken})\\s+(?:equal(?:-sized)?\\s+)?(?:${partNouns})\\b`, "i"));
    const denominator = Math.max(1, partMatch ? (wordNumber(partMatch[1]) || 1) : 4);
    const selectedMatch = source.match(new RegExp(`\\b(${numberToken})\\s+(?:are|is|become|becomes|have|has)?\\s*(?:shaded|selected|coloured|highlighted|blue|red|used|unused|unshaded|left|remain(?:ing)?|have icing)\\b`, "i"));
    const icingMatch = source.match(new RegExp(`\\b(${numberToken})\\s+(?:have|has)\\s+icing\\b`, "i"));
    const eatenMatch = source.match(new RegExp(`\\b(?:eats?|ate)\\s+(${numberToken})(?:\\s+(?:parts|pieces))?\\b`, "i"));
    const usedMatch = source.match(new RegExp(`\\b(${numberToken})\\s+(?:are|is)\\s+used\\b`, "i"));
    const unshadedMatch = source.match(new RegExp(`\\b(${numberToken})\\s+(?:are|is)\\s+unshaded\\b`, "i"));
    let numerator = selectedMatch ? wordNumber(selectedMatch[1]) : icingMatch ? wordNumber(icingMatch[1]) : null;

    if (/what fraction[^?]*(?:remains?|remaining)/i.test(source) && eatenMatch) {
      numerator = denominator - (wordNumber(eatenMatch[1]) || 0);
    } else if (/what fraction[^?]*unused/i.test(source) && usedMatch) {
      numerator = denominator - (wordNumber(usedMatch[1]) || 0);
    } else if (/what fraction[^?]*shaded/i.test(source) && unshadedMatch) {
      numerator = denominator - (wordNumber(unshadedMatch[1]) || 0);
    }

    if (numerator === null || numerator === undefined) numerator = opts.defaultNumerator ?? 0;
    return {
      n: Math.max(0, Math.min(denominator, numerator)),
      d: denominator,
      whole: 0,
      selectionKind: selectionKind(source)
    };
  }

  function selectionKind(source) {
    if (/\bblue\b/i.test(source)) return "blue";
    if (/\bred\b/i.test(source)) return "red";
    if (/icing/i.test(source)) return "icing";
    if (/unused|remain/i.test(source)) return "remaining";
    if (/eats?|used/i.test(source)) return "used";
    return "selected";
  }

  function areaModelKind(text) {
    const source = String(text || "").toLowerCase();
    if (/\bcircle|\bpizza|\bdisc/.test(source)) return "circle";
    if (/\bcounter/.test(source)) return "counter";
    if (/\btile/.test(source)) return "tile";
    if (/\bcupcake/.test(source)) return "cupcake";
    if (/\bchocolate/.test(source)) return "chocolate";
    if (/\bribbon/.test(source)) return "ribbon";
    return "bar";
  }

  function structuredAreaModelKind(model) {
    const context = String(model?.context || "fraction_bar").toLowerCase();
    if (["circle", "pizza", "disc"].includes(context)) return "circle";
    if (["counter", "tile", "cupcake"].includes(context)) return context;
    if (context === "chocolate") return "chocolate";
    if (context === "ribbon") return "ribbon";
    return "bar";
  }

  function fractionCells(numerator, denominator, options) {
    const opts = options || {};
    const d = Math.max(1, Math.min(denominator || 1, 160));
    const n = Math.max(0, numerator || 0);
    const cells = Array.from({ length: d }, (_, index) => {
      const shaded = index < Math.min(n, d);
      return `<span class="fraction-cell${shaded ? " is-shaded" : ""}" style="--cell-index:${index};--cell-delay:${index * 150}ms;--partition-delay:${index * 55}ms" aria-hidden="true"></span>`;
    }).join("");
    const variant = String(opts.variant || "bar").replace(/[^a-z0-9_-]/gi, "");
    const selection = String(opts.selectionKind || "selected").replace(/[^a-z0-9_-]/gi, "");
    return `<div class="fraction-bar is-${variant} selection-${selection}${opts.unequal ? " is-unequal" : ""}" style="--parts:${d}" aria-hidden="true">${cells}</div>`;
  }

  function fractionBars(fraction, options) {
    const opts = options || {};
    const whole = Math.max(0, fraction.whole || 0);
    const numerator = Math.max(0, fraction.n || 0) + whole * Math.max(1, fraction.d || 1);
    const denominator = Math.max(1, fraction.d || 1);
    const barCount = Math.max(1, Math.min(12, Math.ceil(numerator / denominator)));
    return Array.from({ length: barCount }, (_, index) => {
      const remaining = Math.max(0, numerator - index * denominator);
      return fractionCells(Math.min(denominator, remaining), denominator, opts);
    }).join("");
  }

  function circleModel(numerator, denominator) {
    const d = Math.max(1, Math.min(denominator || 1, 24));
    const n = Math.max(0, Math.min(numerator || 0, d));
    const centre = 60;
    const radius = 52;
    const wedges = [];
    for (let index = 0; index < d; index += 1) {
      const start = (index / d) * Math.PI * 2 - Math.PI / 2;
      const end = ((index + 1) / d) * Math.PI * 2 - Math.PI / 2;
      const x1 = centre + radius * Math.cos(start);
      const y1 = centre + radius * Math.sin(start);
      const x2 = centre + radius * Math.cos(end);
      const y2 = centre + radius * Math.sin(end);
      const large = end - start > Math.PI ? 1 : 0;
      wedges.push(`<path class="circle-piece${index < n ? " is-shaded" : ""}" style="--cell-index:${index};--cell-delay:${index * 150}ms" d="M ${centre} ${centre} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z" />`);
    }
    return `<svg class="circle-model" viewBox="0 0 120 120" aria-hidden="true">${wedges.join("")}</svg>`;
  }

  function unequalCircleModel(denominator) {
    const d = Math.max(2, Math.min(denominator || 4, 12));
    const centre = 60;
    const radius = 52;
    const weights = Array.from({ length: d }, (_, index) => index === 0 ? 1.75 : index === 1 ? 0.55 : 1);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let cursor = -Math.PI / 2;
    const wedges = weights.map((weight) => {
      const start = cursor;
      const end = cursor + (weight / total) * Math.PI * 2;
      cursor = end;
      const x1 = centre + radius * Math.cos(start);
      const y1 = centre + radius * Math.sin(start);
      const x2 = centre + radius * Math.cos(end);
      const y2 = centre + radius * Math.sin(end);
      const large = end - start > Math.PI ? 1 : 0;
      return `<path class="circle-piece is-unequal-piece" d="M ${centre} ${centre} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z" />`;
    }).join("");
    return `<svg class="circle-model is-unequal" viewBox="0 0 120 120" aria-hidden="true">${wedges}</svg>`;
  }

  function setModel(numerator, denominator, kind, selection) {
    const count = Math.max(1, Math.min(denominator || 1, 60));
    const safeKind = String(kind || "counter").replace(/[^a-z0-9_-]/gi, "");
    const safeSelection = String(selection || "selected").replace(/[^a-z0-9_-]/gi, "");
    return `<div class="set-model is-${safeKind} selection-${safeSelection}" aria-hidden="true">${Array.from({ length: count }, (_, index) => `<span class="counter is-${safeKind}${index < numerator ? " is-shaded" : ""}" style="--cell-index:${index}"><i></i></span>`).join("")}</div>`;
  }

  function drawingForStructuredModel(model) {
    const kind = structuredAreaModelKind(model);
    const numerator = Number(model?.selectedParts) || 0;
    const denominator = Number(model?.totalParts) || 1;
    const selection = String(model?.selectedMeaning || "selected").toLowerCase();
    if (model?.unequalParts) return unequalAreaDrawing({ d: denominator, n: numerator, selectionKind: selection }, kind);
    if (kind === "circle") return circleModel(numerator, denominator);
    if (["counter", "tile", "cupcake"].includes(kind)) return setModel(numerator, denominator, kind, selection);
    return `<div class="bar-stack">${fractionCells(numerator, denominator, { variant: kind, selectionKind: selection })}</div>`;
  }

  function modelChoiceMarkup(model) {
    if (!model) return "";
    if (window.RevilyFra14Visuals?.optionMarkup && model.context === "fra14_model_option") {
      return window.RevilyFra14Visuals.optionMarkup(model);
    }
    if (window.RevilyFra03Visuals?.optionMarkup && ["area_model", "set_model", "grouped_set", "number_line"].includes(String(model.context || ""))) {
      return window.RevilyFra03Visuals.optionMarkup(model);
    }
    if (window.RevilyFra01Visuals?.optionMarkup && ["cake", "strip", "brownie_tray", "token_set"].includes(String(model.context || ""))) {
      return window.RevilyFra01Visuals.optionMarkup(model);
    }
    return `<span class="model-choice-visual">${drawingForStructuredModel(model)}</span><span class="model-choice-label">${escapeHtml(model.label || "")}</span>`;
  }

  function structuredModelLabel(model) {
    if (!model) return "";
    const context = String(model.context || "model").replace(/_/g, " ");
    if (model.unequalParts) return `A ${context} divided into ${model.totalParts} visibly unequal parts.`;
    return `A ${context} showing ${model.selectedParts} ${model.selectedMeaning || "selected"} parts out of ${model.totalParts} equal parts in the whole.`;
  }

  function fractionRoleMap(model, answer) {
    const answerFraction = String(answer || `${model.n}/${model.d}`).match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    const numerator = answerFraction ? answerFraction[1] : model.n;
    const denominator = answerFraction ? answerFraction[2] : model.d;
    return `<div class="fraction-role-map"><span class="role-chip numerator-chip"><small>numerator</small><b>${escapeHtml(numerator)}</b><em>selected parts</em></span>${fractionMarkup(numerator, denominator, "role-fraction")}<span class="role-chip denominator-chip"><small>denominator</small><b>${escapeHtml(denominator)}</b><em>equal parts in the whole</em></span></div>`;
  }

  function fractionRuleVisual() {
    return `<div class="fraction-rule-visual"><div class="fraction-rule-flow"><span>WHOLE</span><i aria-hidden="true">&rarr;</i><span>EQUAL PARTS</span><i aria-hidden="true">&rarr;</i><span>SELECTED PARTS</span></div>${fractionRoleMap({ n: 3, d: 4 }, "3/4")}</div>`;
  }

  function unequalAreaDrawing(model, kind) {
    if (kind === "circle") return unequalCircleModel(model.d);
    return fractionCells(0, model.d, { unequal: true, variant: kind, selectionKind: model.selectionKind });
  }

  function storyCells(parts, selected, numbered) {
    const count = Math.max(1, Math.min(12, Number(parts) || 4));
    const shaded = Math.max(0, Math.min(count, Number(selected) || 0));
    return Array.from({ length: count }, (_, index) => `<span class="story-cell${index < shaded ? " is-target" : ""}" style="--story-index:${index}">${numbered ? `<b>${index + 1}</b>` : ""}</span>`).join("");
  }

  function fractionStoryVisual(scene) {
    const variant = String(scene?.variant || "");
    const model = scene?.model || {};
    const parts = Math.max(1, Number(model.parts) || 4);
    const selected = Math.max(0, Number(model.selected) || 0);
    const wholeLabel = escapeHtml(model.whole_label || "one whole");

    if (variant === "fair_turns_hook") {
      const names = Array.isArray(model.turn_labels) && model.turn_labels.length === parts
        ? model.turn_labels
        : Array.from({ length: parts }, (_, index) => `Turn ${index + 1}`);
      return `<div class="fra01-story fair-turns-story">
        <div class="story-kicker">${escapeHtml(model.context_label || "ONE SHARED SESSION")}</div>
        <div class="session-heading"><strong>${wholeLabel}</strong><span>${escapeHtml(model.detail_label || "four friends")}</span></div>
        <div class="session-bar" aria-hidden="true">${names.map((name, index) => `<span class="session-turn turn-${index + 1}" style="--turn-index:${index}"><b>${escapeHtml(name)}</b><i>${index + 1}</i></span>`).join("")}</div>
        <div class="turn-verdict"><span class="unequal-verdict">Unequal turns</span><span class="equal-verdict">4 equal turns</span></div>
        <div class="story-fraction hook-fraction">${fractionMarkup(1, parts)}<span>of the hour</span></div>
      </div>`;
    }

    if (variant === "quarter_structure") {
      return `<div class="fra01-story quarter-structure-story">
        <div class="story-kicker">${wholeLabel}</div>
        <div class="story-partition-bar" style="--story-parts:${parts}" aria-hidden="true">${storyCells(parts, 1, true)}</div>
        <div class="structure-labels"><span class="equal-label">${parts} equal parts altogether</span><span class="selected-label">1 selected part</span></div>
        <div class="story-fraction structure-fraction">${fractionMarkup(1, parts)}<span>one quarter</span></div>
      </div>`;
    }

    if (variant === "denominator_focus") {
      return `<div class="fra01-story denominator-story">
        <div class="story-partition-bar count-all" style="--story-parts:${parts}" aria-hidden="true">${storyCells(parts, 0, true)}</div>
        <div class="focus-fraction">${fractionMarkup("?", parts)}</div>
        <div class="vocabulary-chip denominator-vocabulary"><strong>${parts}</strong><span>equal parts altogether</span><b>denominator</b></div>
      </div>`;
    }

    if (variant === "numerator_focus") {
      return `<div class="fra01-story numerator-story">
        <div class="story-partition-bar progressive-select" style="--story-parts:${parts}" aria-hidden="true">${storyCells(parts, selected, false)}</div>
        <div class="selection-counter"><span>selected</span><strong>0</strong></div>
        <div class="focus-fraction">${fractionMarkup(selected, parts)}</div>
        <div class="vocabulary-chip numerator-vocabulary"><strong>${selected}</strong><span>selected parts</span><b>numerator</b></div>
      </div>`;
    }

    if (variant === "fraction_rule") {
      return `<div class="fra01-story fraction-routine-story">
        <div class="routine-flow"><span class="routine-whole">Find the whole</span><i aria-hidden="true">&rarr;</i><span class="routine-equal">Check the parts are equal</span><i aria-hidden="true">&rarr;</i><span class="routine-selected">Count the selected parts</span></div>
        <div class="routine-model"><div class="story-partition-bar" style="--story-parts:${parts}" aria-hidden="true">${storyCells(parts, selected, false)}</div>${fractionRoleMap({ n: selected, d: parts }, `${selected}/${parts}`)}</div>
      </div>`;
    }

    if (variant === "whole_comparison") {
      return `<div class="fra01-story whole-comparison-story">
        <div class="whole-example short-whole"><div class="half-bar"><span></span><span></span></div><span class="whole-fraction">${fractionMarkup(1, 2)}</span><small>short whole</small></div>
        <div class="whole-example long-whole"><div class="half-bar"><span></span><span></span></div><span class="whole-fraction">${fractionMarkup(1, 2)}</span><small>long whole</small></div>
        <div class="whole-message">Same fraction. Different amount.</div>
      </div>`;
    }

    if (variant === "learner_handoff") {
      return `<div class="fra01-story handoff-story">
        <div class="handoff-model"><div class="story-partition-bar" style="--story-parts:${parts}" aria-hidden="true">${storyCells(parts, selected, false)}</div><span class="scaffold-label whole-scaffold">whole</span><span class="scaffold-label equal-scaffold">${parts} equal parts</span><span class="scaffold-label selected-scaffold">${selected} selected</span></div>
        <strong class="handoff-label">Your turn</strong>
      </div>`;
    }

    if (variant === "equal_parts_trap") {
      return `<div class="fra01-story equal-parts-trap-story">
        <div class="single-unequal-model">${fractionCells(0, parts, { unequal: true, variant: "bar" })}<small>Same number of pieces; different sizes</small></div>
        <div class="whole-message">Fraction parts must be equal.</div>
      </div>`;
    }

    return "";
  }

  function areaVisual(text, fractions, context) {
    const ctx = context || {};
    const story = fractionStoryVisual(ctx.visual?.scene);
    if (story) return `<div class="visual-centre area-visual">${story}</div>`;
    const semanticText = cleanVisualText(ctx.question?.prompt || ctx.narration || text);
    const lower = semanticText.toLowerCase();
    const authoredModel = ctx.question?.model || ctx.visual?.model || null;
    const model = authoredModel ? {
      n: authoredModel.selectedParts,
      d: authoredModel.totalParts,
      whole: 0,
      selectionKind: authoredModel.selectedMeaning || "selected"
    } : inferAreaModel(semanticText, fractions, { defaultNumerator: ctx.question ? 0 : 1 });
    const kind = authoredModel ? structuredAreaModelKind(authoredModel) : areaModelKind(semanticText);
    const feedback = ctx.feedback || "initial";
    const reveal = feedback === "correct" || feedback === "support" || feedback === "worked";
    const action = String(ctx.visual?.action || "");

    if (!ctx.question && ["reveal_rule", "fade_scaffolds"].includes(action)) {
      return `<div class="visual-centre area-visual">${fractionRuleVisual()}</div>`;
    }

    if (!ctx.question && action === "reveal_equation") {
      return `<div class="visual-centre area-visual"><div class="bar-stack">${fractionCells(model.n, model.d, { variant: kind, selectionKind: model.selectionKind })}</div>${fractionRoleMap(model, `${model.n}/${model.d}`)}</div>`;
    }

    if (ctx.question?.assessmentIntent === "symbol_to_visual") {
      return `<div class="visual-centre area-visual"><div class="equation-card model-target-fraction">${mathMarkup(ctx.question.targetFraction || "")}</div></div>`;
    }

    let drawing = authoredModel ? drawingForStructuredModel(authoredModel) : null;
    if (!drawing && kind === "circle") drawing = circleModel(model.n, model.d);
    else if (!drawing && ["counter", "tile", "cupcake"].includes(kind)) drawing = setModel(model.n, model.d, kind, model.selectionKind);
    else if (!drawing) drawing = `<div class="bar-stack">${fractionCells(model.n, model.d, { variant: kind, selectionKind: model.selectionKind })}</div>`;

    const unequal = authoredModel?.unequalParts || /unequal|different[- ](?:sizes|sized)|not equal|much larger|much smaller/.test(lower);
    if (unequal) {
      const invalid = unequalAreaDrawing(model, kind);
      if (!ctx.question || reveal) {
        const valid = kind === "circle" ? circleModel(0, model.d) : fractionCells(0, model.d, { variant: kind, selectionKind: model.selectionKind });
        drawing = `<div class="contrast-model"><div>${invalid}<small>Unequal parts</small></div><div>${valid}<small>Equal parts</small></div></div>`;
      } else {
        drawing = `<div class="single-unequal-model">${invalid}<small>Unequal parts</small></div>`;
      }
    }

    const scaffold = !reveal && ctx.question?.scaffold?.showRoleLabels
      ? `<div class="question-scaffold"><span>top: selected parts</span><span>bottom: all equal parts in the whole</span></div>`
      : "";
    const result = reveal && ctx.question?.response?.type === "fraction"
      ? fractionRoleMap(model, ctx.question.answer?.value)
      : "";
    return `<div class="visual-centre area-visual">${drawing}${scaffold}${result}</div>`;
  }

  function relationVisual(fractions) {
    const fraction = fractions[0] || { n: 3, d: 8 };
    return `<div class="role-visual"><span class="role-label numerator-role">selected parts</span>${fractionMarkup(fraction.n, fraction.d, "role-fraction")}<span class="role-label denominator-role">equal parts in the whole</span></div>`;
  }

  function compareVisual(fractions, symbol) {
    const pair = fractions.length >= 2 ? fractions.slice(0, 2) : [{ n: 3, d: 5 }, { n: 3, d: 7 }];
    return `<div class="compare-visual"><div class="compare-side"><div class="bar-stack">${fractionBars(pair[0])}</div>${fractionMarkup(pair[0].n, pair[0].d)}</div><span class="compare-symbol">${escapeHtml(symbol || "?")}</span><div class="compare-side"><div class="bar-stack">${fractionBars(pair[1])}</div>${fractionMarkup(pair[1].n, pair[1].d)}</div></div>`;
  }

  function numberLineVisual(fractions, text) {
    const fraction = fractions[0] || inferAreaModel(text, []);
    const denominator = Math.max(1, Math.min(fraction.d || 4, 24));
    const point = Math.max(0, fraction.whole * denominator + fraction.n);
    const intervals = Math.max(denominator, Math.min(48, Math.ceil((point || denominator) / denominator) * denominator));
    const ticks = Array.from({ length: intervals + 1 }, (_, index) => {
      const active = index === point;
      const label = index === 0 ? "0" : index % denominator === 0 ? String(index / denominator) : active ? fraction.raw || `${fraction.n}/${fraction.d}` : "";
      return `<span class="number-tick${active ? " is-active" : ""}" style="--tick-index:${index}"><i aria-hidden="true"></i>${label ? `<b>${escapeHtml(label)}</b>` : ""}</span>`;
    }).join("");
    return `<div class="number-line" style="--intervals:${intervals}" aria-hidden="true">${ticks}</div>`;
  }

  function mixedVisual(fractions) {
    const fraction = fractions[0] || { whole: 2, n: 3, d: 4, raw: "2 3/4" };
    return `<div class="mixed-visual"><div class="bar-stack">${fractionBars(fraction)}</div><div class="equation-card">${mathMarkup(fraction.raw)}</div></div>`;
  }

  function operationVisual(fractions, operator, answer, revealAnswer) {
    const pair = fractions.length >= 2 ? fractions.slice(0, 2) : [{ n: 1, d: 3 }, { n: 1, d: 6 }];
    const answerMarkup = revealAnswer && answer !== undefined ? `<span class="operation-result">= ${mathMarkup(answer)}</span>` : "";
    return `<div class="operation-visual"><div class="operand"><div class="bar-stack">${fractionBars(pair[0])}</div>${fractionMarkup(pair[0].n, pair[0].d)}</div><span class="operation-symbol">${escapeHtml(operator)}</span><div class="operand"><div class="bar-stack">${fractionBars(pair[1])}</div>${fractionMarkup(pair[1].n, pair[1].d)}</div>${answerMarkup}</div>`;
  }

  function barModelVisual(fractions, text) {
    const fraction = fractions[0] || { n: 3, d: 5 };
    const amounts = [...String(text).matchAll(/\b\d+\b/g)].map((match) => Number(match[0])).filter((number) => number !== fraction.n && number !== fraction.d);
    const amount = amounts[0];
    return `<div class="quantity-bar"><div class="quantity-cells" style="--parts:${Math.min(fraction.d, 20)}">${Array.from({ length: Math.min(fraction.d, 20) }, (_, index) => `<span class="${index < fraction.n ? "is-shaded" : ""}">${amount && amount % fraction.d === 0 ? amount / fraction.d : ""}</span>`).join("")}</div><div class="quantity-labels"><b>${fractionMarkup(fraction.n, fraction.d)}</b>${amount ? `<span>of ${amount}</span>` : ""}</div></div>`;
  }

  function multiplicationAreaVisual(fractions, answer, revealAnswer) {
    const pair = fractions.length >= 2 ? fractions.slice(0, 2) : [{ n: 2, d: 3 }, { n: 4, d: 5 }];
    const columns = Math.max(1, Math.min(pair[0].d, 16));
    const rows = Math.max(1, Math.min(pair[1].d, 16));
    const cells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const horizontal = column < pair[0].n;
        const vertical = row < pair[1].n;
        cells.push(`<span class="${horizontal ? "shade-a " : ""}${vertical ? "shade-b " : ""}${horizontal && vertical ? "overlap" : ""}" aria-hidden="true"></span>`);
      }
    }
    return `<div class="multiplication-visual"><div class="area-grid" style="--columns:${columns};--rows:${rows}">${cells.join("")}</div><div class="equation-card">${fractionMarkup(pair[0].n, pair[0].d)} × ${fractionMarkup(pair[1].n, pair[1].d)}${revealAnswer && answer !== undefined ? ` = ${mathMarkup(answer)}` : ""}</div></div>`;
  }

  function groupsVisual(fractions, text) {
    const fraction = fractions[0] || { n: 3, d: 5 };
    const integers = [...String(text).matchAll(/\b\d+\b/g)].map((match) => Number(match[0]));
    const groupCount = Math.max(1, Math.min(6, integers.find((number) => number !== fraction.n && number !== fraction.d) || 3));
    return `<div class="groups-visual">${Array.from({ length: groupCount }, () => `<div class="mini-group">${fractionCells(fraction.n, fraction.d)}</div>`).join("")}<span class="groups-brace">${groupCount} equal groups</span></div>`;
  }

  function cancellationVisual(fractions, answer, revealAnswer) {
    const pair = fractions.length >= 2 ? fractions.slice(0, 2) : [{ n: 3, d: 8 }, { n: 4, d: 9 }];
    return `<div class="cancellation-visual"><div class="cancel-equation">${fractionMarkup(pair[0].n, pair[0].d, "can-cancel")}<b>×</b>${fractionMarkup(pair[1].n, pair[1].d, "can-cancel")}${revealAnswer && answer !== undefined ? `<b>=</b>${mathMarkup(answer)}` : ""}</div><span class="cancel-path" aria-hidden="true">÷ common factors</span></div>`;
  }

  function reciprocalVisual(fractions, answer, revealAnswer) {
    const fraction = fractions[0] || { n: 3, d: 5 };
    return `<div class="reciprocal-visual"><div class="reciprocal-card">${fractionMarkup(fraction.n, fraction.d)}</div><span>×</span><div class="reciprocal-card is-question">${revealAnswer && answer !== undefined ? mathMarkup(answer) : "?"}</div><span>=</span><strong>1</strong></div>`;
  }

  function divisionVisual(fractions, answer, revealAnswer) {
    const pair = fractions.length >= 2 ? fractions.slice(0, 2) : [{ n: 2, d: 3 }, { n: 1, d: 4 }];
    return `<div class="division-visual"><div class="measure-bar">${fractionBars(pair[0])}</div><div class="divisor-chip">group size ${fractionMarkup(pair[1].n, pair[1].d)}</div><div class="equation-card">${fractionMarkup(pair[0].n, pair[0].d)} ÷ ${fractionMarkup(pair[1].n, pair[1].d)}${revealAnswer && answer !== undefined ? ` = ${mathMarkup(answer)}` : " = ?"}</div></div>`;
  }

  function extractDecimals(text) {
    const source = String(text || "").replace(/\u2212/g, "-");
    const values = [];
    const pattern = /(^|[^\w.])(-?(?:\d+(?:\.\d+)?|\.\d+))(?![\w.])/g;
    let match;
    while ((match = pattern.exec(source))) values.push(match[2]);
    return values;
  }

  function decimalSourceText(description, context) {
    const spec = context?.spec;
    const authoredExamples = [
      ...(spec?.concept_model?.must_notice || []),
      spec?.concept_model?.mathematical_rule,
      spec?.concept_model?.invariant
    ].filter(Boolean).join(" ");
    return `${description || ""} ${authoredExamples}`.trim();
  }

  function decimalParts(value) {
    const text = String(value ?? "0").replace(/\u2212/g, "-").trim();
    const sign = text.startsWith("-") ? "−" : "";
    const unsigned = text.replace(/^[+-]/, "");
    const parts = unsigned.split(".");
    return { sign, whole: parts[0] || "0", fraction: parts[1] || "", raw: `${sign}${unsigned}` };
  }

  function decimalPlaceValueVisual(text, values, answer, revealAnswer, primitive) {
    const value = values.find((item) => item.includes(".")) || values[0] || "0.4";
    const parts = decimalParts(value);
    const whole = parts.whole.padStart(3, " ").slice(-3).split("");
    const fraction = parts.fraction.padEnd(3, " ").slice(0, 3).split("");
    const headings = ["hundreds", "tens", "ones", "tenths", "hundredths", "thousandths"];
    const digits = [...whole, ...fraction];
    const equation = revealAnswer && answer !== undefined ? `${questionExpression(text)} = ${answer}` : questionExpression(text);
    const scaleMode = ["place_value_scaler", "place_value_repartition"].includes(primitive);
    return `<div class="decimal-place-visual">
      <div class="place-value-sign">${parts.sign}</div>
      <div class="decimal-place-grid" role="presentation">
        ${headings.map((heading) => `<span class="place-heading">${heading}</span>`).join("")}
        ${digits.map((digit, index) => `<b class="place-digit${digit.trim() ? "" : " is-empty"}${index === 3 ? " decimal-boundary" : ""}">${digit.trim() || "0"}</b>`).join("")}
      </div>
      ${scaleMode ? `<div class="place-shift" aria-hidden="true"><span>place value</span><i></i><span>× or ÷ 10</span></div>` : ""}
      <div class="equation-card decimal-equation">${mathMarkup(equation || parts.raw)}</div>
    </div>`;
  }

  function questionExpression(text) {
    const source = String(text || "").trim().replace(/Render the exact mathematical objects described in:\s*/gi, "");
    const sentences = source.split(/(?:[!?]\s+|\.(?=\s+[A-Z]))/).map((part) => part.trim()).filter(Boolean);
    const sentence = sentences.find((part) => /\d/.test(part) && !/[a-z]+_[a-z_]+/i.test(part));
    return sentence ? sentence.slice(0, 210) : "";
  }

  function decimalNumberLineVisual(text, values, answer, revealAnswer, signed) {
    const authored = parseNumberLinePrompt(text);
    const points = authored ? [authored.start, authored.end, authored.target] : values.slice(0, 4).map(Number).filter(Number.isFinite);
    let minimum = points.length ? Math.min(...points) : signed ? -1 : 0;
    let maximum = points.length ? Math.max(...points) : 1;
    if (minimum === maximum) {
      minimum -= 1;
      maximum += 1;
    }
    if (signed && minimum > 0) minimum = 0;
    if (signed && maximum < 0) maximum = 0;
    const tickCount = authored ? Math.max(2, Math.min(12, authored.intervals)) : 10;
    const width = 760;
    const left = 42;
    const right = width - 42;
    const position = (value) => left + ((value - minimum) / (maximum - minimum)) * (right - left);
    const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
      const x = left + (index / tickCount) * (right - left);
      const value = minimum + (index / tickCount) * (maximum - minimum);
      const label = index === 0 || index === tickCount || index === Math.round(tickCount / 2) ? trimVisualDecimal(value) : "";
      return `<g><line x1="${x}" y1="58" x2="${x}" y2="76"></line>${label ? `<text x="${x}" y="99">${escapeHtml(label)}</text>` : ""}</g>`;
    }).join("");
    const markerValues = authored ? [authored.target] : points.slice(0, 4);
    const markers = markerValues.map((value, index) => `<g class="decimal-marker marker-${index}"><circle cx="${position(value)}" cy="58" r="8"></circle><text x="${position(value)}" y="35">${escapeHtml(trimVisualDecimal(value))}</text></g>`).join("");
    const result = revealAnswer && answer !== undefined ? `<div class="equation-card decimal-equation">${mathMarkup(String(answer))}</div>` : "";
    return `<div class="decimal-line-visual"><svg class="decimal-number-line" viewBox="0 0 ${width} 112" aria-hidden="true"><line class="decimal-line-axis" x1="${left}" y1="58" x2="${right}" y2="58"></line>${ticks}${markers}</svg>${result}</div>`;
  }

  function parseNumberLinePrompt(text) {
    const match = String(text || "").replace(/\u2212/g, "-").match(/from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)\s+in\s+(\d+)\s+equal intervals.*?(\d+)\s+intervals? after\s+(-?\d+(?:\.\d+)?)/i);
    if (!match) return null;
    const start = Number(match[1]);
    const end = Number(match[2]);
    const intervals = Number(match[3]);
    const steps = Number(match[4]);
    return { start, end, intervals, target: start + ((end - start) / intervals) * steps };
  }

  function trimVisualDecimal(value) {
    return Number(value.toFixed(5)).toString().replace(/-/g, "−");
  }

  function orderingVisual(text, values, answer, revealAnswer) {
    const promptValues = values.slice(0, 6);
    const ordered = String(answer ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    const cards = revealAnswer && ordered.length > 1 ? ordered : promptValues;
    const label = revealAnswer && ordered.length > 1 ? "smallest → largest" : questionExpression(text);
    return `<div class="decimal-order-visual"><div class="ordering-cards">${cards.map((value, index) => `<span>${mathMarkup(value)}</span>${index < cards.length - 1 && revealAnswer ? "<i>→</i>" : ""}`).join("")}</div>${label ? `<div class="equation-card decimal-equation">${mathMarkup(label)}</div>` : ""}</div>`;
  }

  function decimalColumnVisual(text, values, answer, revealAnswer, primitive) {
    const operands = values.slice(0, 2);
    const operator = operationSymbol(text);
    if (operands.length < 2) return decimalPlaceValueVisual(text, values, answer, revealAnswer, primitive);
    const decimals = Math.max(...operands.map((value) => decimalParts(value).fraction.length));
    const aligned = operands.map((value) => {
      const parts = decimalParts(value);
      return `${parts.sign}${parts.whole}.${parts.fraction.padEnd(decimals, "0")}`;
    });
    return `<div class="decimal-column-visual"><div class="column-calculation"><span></span><b>${escapeHtml(aligned[0])}</b><span>${escapeHtml(operator)}</span><b>${escapeHtml(aligned[1])}</b><i></i>${revealAnswer && answer !== undefined ? `<span>=</span><strong>${escapeHtml(answer)}</strong>` : ""}</div><div class="column-place-label">decimal points aligned</div></div>`;
  }

  function operationSymbol(text) {
    const source = String(text || "");
    if (/÷|divide|shared|split|per |groups?|pieces?/i.test(source)) return "÷";
    if (/×|each|times|product|area/i.test(source)) return "×";
    if (/\+|added|total|combined|receives/i.test(source)) return "+";
    if (/\s-\s|subtract|removed|remains|left|falls|cut off|spend/i.test(source)) return "−";
    return "?";
  }

  function decimalContextVisual(text, values, answer, revealAnswer, primitive) {
    const quantities = values.slice(0, 4);
    const symbol = operationSymbol(text);
    const unit = contextUnit(text);
    const chain = quantities.map((value) => `<span>${unit.prefix}${escapeHtml(value)}${unit.suffix}</span>`).join(`<i>${escapeHtml(symbol)}</i>`);
    const result = revealAnswer && answer !== undefined ? `<strong>= ${unit.prefix}${escapeHtml(answer)}${unit.suffix}</strong>` : "";
    const label = primitive === "reasonableness_check" ? "Check the result against the size of the quantities" : questionExpression(text) || String(text || "").slice(0, 180);
    return `<div class="decimal-context-visual"><div class="quantity-chain">${chain || "<span>known quantities</span>"}${result}</div><div class="context-strip"><i></i></div><div class="equation-card decimal-equation">${mathMarkup(label)}</div></div>`;
  }

  function contextUnit(text) {
    const source = String(text || "");
    if (source.includes("£")) return { prefix: "£", suffix: "" };
    if (/°C|degrees/i.test(source)) return { prefix: "", suffix: "°C" };
    const match = source.match(/\b(km|kg|cm|mm|m|L)\b/i);
    return { prefix: "", suffix: match ? ` ${match[1]}` : "" };
  }

  function decimalAreaVisual(text, values, answer, revealAnswer) {
    const factor = Math.abs(Number(values.find((value) => Number(value) <= 1) || values[0] || 0.4));
    const shaded = Math.max(1, Math.min(100, Math.round((factor % 1 || Math.min(factor, 1)) * 100)));
    const cells = Array.from({ length: 100 }, (_, index) => `<span class="${index < shaded ? "is-shaded" : ""}"></span>`).join("");
    const expression = questionExpression(text);
    return `<div class="decimal-area-visual"><div class="decimal-hundred-grid" aria-hidden="true">${cells}</div>${expression ? `<div class="equation-card decimal-equation">${mathMarkup(expression)}${revealAnswer && answer !== undefined ? ` = ${mathMarkup(answer)}` : ""}</div>` : ""}</div>`;
  }

  function repeatedGroupsVisual(text, values, answer, revealAnswer) {
    const decimal = values.find((value) => value.includes(".")) || values[0] || "0.5";
    const groupValue = values.find((value, index) => index > 0 && /^\d+$/.test(value));
    const count = Math.max(2, Math.min(8, Number(groupValue) || 4));
    const expression = questionExpression(text);
    return `<div class="decimal-groups-visual"><div class="decimal-groups">${Array.from({ length: count }, () => `<span>${escapeHtml(decimal)}</span>`).join("")}</div>${expression ? `<div class="equation-card decimal-equation">${mathMarkup(expression)}${revealAnswer && answer !== undefined ? ` = ${mathMarkup(answer)}` : ""}</div>` : ""}</div>`;
  }

  function longDivisionVisual(text, values, answer, revealAnswer) {
    const dividend = values[0] || "7";
    const divisor = values[1] || "4";
    return `<div class="long-division-visual"><div class="long-division"><span>${escapeHtml(divisor)}</span><i></i><b>${escapeHtml(dividend)}</b>${revealAnswer && answer !== undefined ? `<strong>${escapeHtml(answer)}</strong>` : `<strong>?</strong>`}</div><div class="equation-card decimal-equation">quotient × divisor = dividend</div></div>`;
  }

  function divisionScalerVisual(text, values, answer, revealAnswer) {
    const dividend = values[0] || "3.6";
    const divisor = values[1] || "0.4";
    const places = decimalParts(divisor).fraction.length;
    const scaledDividend = shiftDecimal(dividend, places);
    const scaledDivisor = shiftDecimal(divisor, places);
    return `<div class="division-scaler-visual"><div class="scale-row"><span>${escapeHtml(dividend)} ÷ ${escapeHtml(divisor)}</span><i>× ${10 ** places} both</i><span>${escapeHtml(scaledDividend)} ÷ ${escapeHtml(scaledDivisor)}</span>${revealAnswer && answer !== undefined ? `<strong>= ${escapeHtml(answer)}</strong>` : ""}</div></div>`;
  }

  function shiftDecimal(value, places) {
    const parts = decimalParts(value);
    const digits = `${parts.whole}${parts.fraction}`.replace(/^0+(?=\d)/, "");
    const remaining = parts.fraction.length - places;
    let result;
    if (remaining > 0) result = `${digits.slice(0, -remaining) || "0"}.${digits.slice(-remaining)}`;
    else result = `${digits}${"0".repeat(Math.abs(remaining))}`;
    return `${parts.sign}${result}`;
  }

  function signMagnitudeVisual(text, values, answer, revealAnswer) {
    const operands = values.slice(0, 2);
    const signs = operands.map((value) => String(value).startsWith("-") ? "−" : "+");
    const resultSign = revealAnswer && String(answer).startsWith("-") ? "−" : revealAnswer ? "+" : "?";
    return `<div class="sign-magnitude-visual"><div class="sign-rule"><span>${signs[0] || "+"}</span><i>${escapeHtml(operationSymbol(text))}</i><span>${signs[1] || "+"}</span><b>→</b><strong>${resultSign}</strong></div><div class="magnitude-row">${operands.map((value) => `<span>${escapeHtml(String(value).replace(/^-/, ""))}</span>`).join(`<i>${escapeHtml(operationSymbol(text))}</i>`)}${revealAnswer && answer !== undefined ? `<strong>= ${escapeHtml(String(answer).replace(/^-/, ""))}</strong>` : ""}</div></div>`;
  }

  function percentagePanel(model, revealAnswer) {
    const percent = Math.max(0, Math.min(100, Number(model?.percent) || 0));
    const whole = model?.wholeAmount ?? "the whole";
    const unit = model?.unit || "";
    const prefix = unit === "£" ? "£" : "";
    const suffix = unit && unit !== "£" ? ` ${unit}` : "";
    const amountLabel = `${prefix}${whole}${suffix}`;
    const showRoles = model?.showRoles === true;
    const showFormula = model?.showFormula === true;
    const showSolution = model?.showResult === true || revealAnswer;
    const defaultPartitionCount = model?.layout === "hundred_grid" ? 100 : 10;
    const partitionCount = Math.max(1, Math.min(100, Number(model?.partitionCount) || defaultPartitionCount));
    const selectedGroups = Math.max(0, Math.min(partitionCount, Number(model?.selectedGroups) || Math.round((percent / 100) * partitionCount)));
    const majorEvery = Math.max(0, Math.min(partitionCount, Number(model?.majorEvery) || 0));
    const majorPartitionCount = majorEvery > 1 && partitionCount % majorEvery === 0 ? partitionCount / majorEvery : 0;
    const result = model?.partAmount;
    const solution = model?.solutionLabel;
    const wholeRole = showRoles ? `<span><small>Whole</small><b>${escapeHtml(amountLabel)}</b></span>` : `<span><small>Amount</small><b>${escapeHtml(amountLabel)}</b></span>`;
    const partRole = showRoles
      ? `<span><small>Required part</small><b>${showSolution && result !== undefined ? escapeHtml(`${prefix}${result}${suffix}`) : "?"}</b></span>`
      : "";
    const formula = showFormula
      ? `<div class="percentage-equation">${mathMarkup(`${percent}/100 × ${amountLabel}`)}${showSolution && result !== undefined ? ` = ${escapeHtml(`${prefix}${result}${suffix}`)}` : " = ?"}</div>`
      : "";
    const methodSteps = Array.isArray(model?.methodSteps) && (model?.showMethod === true || revealAnswer)
      ? `<ol class="percentage-method-steps">${model.methodSteps.map((step) => `<li>${mathMarkup(step)}</li>`).join("")}</ol>`
      : "";
    const revealedSolution = showSolution && solution ? `<div class="percentage-solution">${mathMarkup(solution)}</div>` : "";
    const stripStyle = `--percentage:${percent}%;--partitions:${partitionCount}${majorPartitionCount ? `;--major-partitions:${majorPartitionCount}` : ""}`;
    const trackClass = majorPartitionCount ? " has-major-groups" : "";
    const visualTracks = model?.layout === "hundred_grid"
      ? `<div class="percentage-hundred-grid" aria-hidden="true">${Array.from({ length: 100 }, (_, index) => `<span${index < selectedGroups ? ` class="is-selected"` : ""}></span>`).join("")}</div>`
      : `<div class="percentage-track${trackClass}" style="${stripStyle}" aria-hidden="true"><span></span><i>${escapeHtml(percent)}%</i></div>
        <div class="percentage-amount-track${trackClass}" style="${stripStyle}" aria-hidden="true"><span></span><b>${escapeHtml(amountLabel)}</b>${showSolution && result !== undefined ? `<i>${escapeHtml(`${prefix}${result}${suffix}`)}</i>` : ""}</div>`;

    return `<section class="percentage-panel">
      ${model?.heading ? `<h3>${escapeHtml(model.heading)}</h3>` : ""}
      <div class="percentage-role-row">
        ${wholeRole}
        <span><small>${showRoles ? "Stated percentage" : "Percentage"}</small><b>${escapeHtml(percent)}%</b></span>
        ${partRole}
      </div>
      ${visualTracks}
      ${formula}
      ${methodSteps}
      ${revealedSolution}
    </section>`;
  }

  function percentageStripVisual(visual, context, revealAnswer) {
    const model = context?.question?.visual?.model || visual?.model || visual?.scene?.model || {};
    const comparisons = Array.isArray(model.comparisons) ? model.comparisons : null;
    if (comparisons?.length) {
      const defaults = model.comparisonDefaults || { showRoles: true, showFormula: true, showResult: true };
      return `<div class="percentage-strip-visual is-comparison">${comparisons.map((item) => percentagePanel({ ...defaults, ...item }, true)).join("")}</div>`;
    }
    return `<div class="percentage-strip-visual">${percentagePanel(model, revealAnswer)}</div>`;
  }

  function percentageAccessibleDescription(visual, context, revealAnswer) {
    const model = context?.question?.visual?.model || visual?.model || visual?.scene?.model || {};
    if (Array.isArray(model.comparisons)) {
      return model.comparisons.map((item) => `${item.percent} percent of ${item.wholeAmount}${item.unit ? ` ${item.unit}` : ""}${item.partAmount !== undefined ? ` gives ${item.partAmount}` : ""}`).join(". ");
    }
    const percent = Number(model.percent) || 0;
    const whole = `${model.unit === "£" ? "£" : ""}${model.wholeAmount ?? "the whole"}${model.unit && model.unit !== "£" ? ` ${model.unit}` : ""}`;
    const base = `A percentage strip labelled ${percent} percent and an amount strip labelled ${whole}.`;
    const partitionDescription = model.layout === "hundred_grid"
      ? ` The whole is divided into one hundred equal cells and ${Math.max(0, Number(model.selectedGroups) || 1)} ${Number(model.selectedGroups) === 1 ? "cell is" : "cells are"} selected.`
      : model.partitionCount
        ? ` The whole is divided into ${Number(model.partitionCount)} equal groups and ${Math.max(0, Number(model.selectedGroups) || Math.round((percent / 100) * Number(model.partitionCount)))} are selected.${Number(model.majorEvery) > 1 ? ` Every ${Number(model.majorEvery)} small groups are visibly joined as one larger benchmark group.` : ""}`
        : "";
    const methodDescription = Array.isArray(model.methodSteps) && (model.showMethod === true || revealAnswer)
      ? ` The method shown is: ${model.methodSteps.join("; ")}.`
      : "";
    if ((model.showResult === true || revealAnswer) && model.solutionLabel) return `${base}${partitionDescription}${methodDescription} ${model.solutionLabel}.`;
    if (model.showRoles === true) {
      const requiredPart = model.partAmount !== undefined
        ? `${model.unit === "£" ? "£" : ""}${model.partAmount}${model.unit && model.unit !== "£" ? ` ${model.unit}` : ""}`
        : "not yet known";
      const formula = model.showFormula === true ? ` The relationship shown is ${percent} over 100 multiplied by ${whole}.` : "";
      return `${base}${partitionDescription} The whole is ${whole}, the stated percentage is ${percent} percent, and the required part is ${requiredPart}.${formula}${methodDescription}`;
    }
    return `${base}${partitionDescription} The result is not identified before submission.`;
  }

  function genericVisual(text) {
    const useful = String(text || "").replace(/Render the exact mathematical objects described in:\s*/gi, "").split(/Ryan line for this scene is fixed as:/i)[0].trim();
    return `<div class="equation-card large-equation">${mathMarkup(useful.slice(0, 220))}</div>`;
  }

  function cueDelayFor(action, narration) {
    const text = String(narration || "").trim();
    if (!text) return 0;
    const cuePatterns = {
      partition_or_group: /\bshade\b/i,
      transform_representation: /\bwatch\b/i,
      reveal_equation: /\bsix means\b|\bdenominator\b/i,
      reveal_rule: /\bdefine the whole\b/i,
      highlight_error_boundary: /\bpieces being equal\b|\bdifferent sizes\b/i,
      compare_change_and_invariant: /\bif the whole\b/i,
      fade_scaffolds: /\bmore support\b/i
    };
    const match = text.match(cuePatterns[action] || /\b(?:watch|shade|highlight|show|means)\b/i);
    if (!match || match.index === undefined) return 180;
    const wordsBeforeCue = text.slice(0, match.index).trim().split(/\s+/).filter(Boolean).length;
    return Math.max(180, Math.min(6500, Math.round((wordsBeforeCue / 2.35) * 1000)));
  }

  function render(container, visual, context) {
    const ctx = context || {};
    // Explicit opt-in: audited models must never fall back to text-extracted fractions.
    if (visual?.primitive === "operation_structure") {
      const renderer = window.RevilyOperationVisuals;
      if (!renderer) throw new Error("Operation-structure renderer is not loaded.");
      container.className = "math-canvas";
      container.setAttribute("data-operation-structure", "");
      container.setAttribute("role", "group");
      container.setAttribute("aria-label", renderer.accessibleDescription(visual, ctx));
      container.innerHTML = renderer.renderMarkup(visual, ctx);
      renderer.bind(container, visual, ctx);
      return;
    }
    container.removeAttribute?.("data-operation-structure");
    const question = ctx.question || null;
    const description = [visual?.description, question?.prompt, ctx.narration].filter(Boolean).join(" ");
    const semanticText = cleanVisualText(question?.prompt || ctx.narration || visual?.description || "");
    const fractions = extractFractions(semanticText);
    const primitive = visual?.primitive || question?.visual?.primitive || "fraction_bar";
    const action = String(visual?.action || "fade_in").replace(/[^a-z0-9_-]/gi, "");
    const feedback = ctx.feedback || "initial";
    const revealAnswer = feedback === "correct" || feedback === "support" || feedback === "worked";
    const answer = question?.answer?.value;
    const isDecimal = /^DEC-/i.test(ctx.spec?.identity?.id || "") || question?.response?.type === "decimal";
    const decimalText = decimalSourceText(description, ctx);
    const decimalDisplayText = question?.prompt || ctx.narration || "";
    const decimals = extractDecimals(decimalText);
    let markup;

    if (primitive === "percentage_strip") {
      markup = percentageStripVisual(visual, ctx, revealAnswer);
    } else if (primitive === "fra01_context" && window.RevilyFra01Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra01-context-visual" aria-hidden="true">${window.RevilyFra01Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra02_context" && window.RevilyFra02Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra02-context-visual" aria-hidden="true">${window.RevilyFra02Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra03_context" && window.RevilyFra03Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra03-context-visual" aria-hidden="true">${window.RevilyFra03Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra04_context" && window.RevilyFra04Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra04-context-visual" aria-hidden="true">${window.RevilyFra04Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra05_context" && window.RevilyFra05Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra05-context-visual">${window.RevilyFra05Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra06_context" && window.RevilyFra06Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra06-context-visual">${window.RevilyFra06Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra07_context" && window.RevilyFra07Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra07-context-visual">${window.RevilyFra07Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra08_context" && window.RevilyFra08Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra08-context-visual"><div class="fra08-visual">${window.RevilyFra08Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra09_context" && window.RevilyFra09Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra09-context-visual">${window.RevilyFra09Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra10_context" && window.RevilyFra10Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra10-context-visual">${window.RevilyFra10Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra11_context" && window.RevilyFra11Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra11-context-visual"><div class="fra11-visual">${window.RevilyFra11Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra12_context" && window.RevilyFra12Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra12-context-visual">${window.RevilyFra12Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra13_context" && window.RevilyFra13Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra13-context-visual"><div class="fra13-visual">${window.RevilyFra13Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra14_context" && window.RevilyFra14Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra14-context-visual">${window.RevilyFra14Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra15_context" && window.RevilyFra15Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra15-context-visual">${window.RevilyFra15Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra16_context" && window.RevilyFra16Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra16-context-visual">${window.RevilyFra16Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra17_context" && window.RevilyFra17Visuals?.renderMarkup) {
      const fra17Interactive = ctx?.question?.response?.type === "fra17_cell_tap_integer";
      markup = `<div class="visual-centre fra17-context-visual"><div class="fra17-visual" aria-hidden="${fra17Interactive ? "false" : "true"}">${window.RevilyFra17Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra18_context" && window.RevilyFra18Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra18-context-visual"><div class="fra18-visual">${window.RevilyFra18Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra19_context" && window.RevilyFra19Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra19-context-visual"><div class="fra19-visual">${window.RevilyFra19Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra20_context" && window.RevilyFra20Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra20-context-visual"><div class="fra20-visual">${window.RevilyFra20Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra21_context" && window.RevilyFra21Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra21-context-visual"><div class="fra21-visual">${window.RevilyFra21Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra22_context" && window.RevilyFra22Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra22-context-visual">${window.RevilyFra22Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (primitive === "fra23_context" && window.RevilyFra23Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra23-context-visual"><div class="fra23-visual">${window.RevilyFra23Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra24_context" && window.RevilyFra24Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra24-context-visual"><div class="fra24-visual">${window.RevilyFra24Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra26_context" && window.RevilyFra26Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra26-context-visual"><div class="fra26-visual">${window.RevilyFra26Visuals.renderMarkup(visual, ctx)}</div></div>`;
    } else if (primitive === "fra28_context" && window.RevilyFra28Visuals?.renderMarkup) {
      markup = `<div class="visual-centre fra28-context-visual">${window.RevilyFra28Visuals.renderMarkup(visual, ctx)}</div>`;
    } else if (isDecimal && ["decimal_place_value_grid", "base_ten_model", "expanded_form", "place_value_scaler", "place_value_repartition"].includes(primitive)) {
      markup = decimalPlaceValueVisual(decimalDisplayText, decimals, answer, revealAnswer, primitive);
    } else if (isDecimal && ["number_line", "interval_counter", "signed_number_line", "magnitude_bar", "comparison_lane"].includes(primitive)) {
      markup = decimalNumberLineVisual(decimalDisplayText, decimals, answer, revealAnswer, primitive === "signed_number_line" || primitive === "magnitude_bar");
    } else if (isDecimal && primitive === "ordering_cards") markup = orderingVisual(decimalDisplayText, decimals, answer, revealAnswer);
    else if (isDecimal && ["column_calculation", "regrouping_model", "opposite_transform"].includes(primitive)) markup = decimalColumnVisual(decimalDisplayText, decimals, answer, revealAnswer, primitive);
    else if (isDecimal && ["context_model", "measure_strip", "money_card", "calculation_chain", "reasonableness_check", "bar_model"].includes(primitive)) markup = decimalContextVisual(decimalDisplayText, decimals, answer, revealAnswer, primitive);
    else if (isDecimal && ["decimal_area_model", "area_model", "magnitude_estimate"].includes(primitive)) markup = decimalAreaVisual(decimalDisplayText, decimals, answer, revealAnswer);
    else if (isDecimal && ["repeated_groups", "grouping_model"].includes(primitive)) markup = repeatedGroupsVisual(decimalDisplayText, decimals, answer, revealAnswer);
    else if (isDecimal && primitive === "long_division") markup = longDivisionVisual(decimalDisplayText, decimals, answer, revealAnswer);
    else if (isDecimal && primitive === "division_scaler") markup = divisionScalerVisual(decimalDisplayText, decimals, answer, revealAnswer);
    else if (isDecimal && primitive === "sign_magnitude_model") markup = signMagnitudeVisual(decimalDisplayText, decimals, answer, revealAnswer);
    else if (primitive === "fraction_area") markup = areaVisual(description, fractions, { ...ctx, visual });
    else if (primitive === "fraction_relation") markup = relationVisual(fractions);
    else if (["fraction_bar_compare", "number_line_compare"].includes(primitive)) {
      const comparisonAnswer = revealAnswer && question?.response?.type === "comparison_symbol" ? answer : null;
      markup = primitive === "number_line_compare"
        ? `<div class="number-line-pair">${numberLineVisual(fractions.slice(0, 1), description)}${numberLineVisual(fractions.slice(1, 2), description)}</div>${compareVisual(fractions, comparisonAnswer)}`
        : compareVisual(fractions, comparisonAnswer);
    } else if (primitive === "number_line") markup = numberLineVisual(fractions, description);
    else if (primitive === "multi_model_fraction") markup = `<div class="multi-model">${areaVisual(description, fractions, { ...ctx, visual })}${numberLineVisual(fractions, description)}</div>`;
    else if (primitive === "mixed_number_model") markup = mixedVisual(fractions);
    else if (["fraction_bar_add"].includes(primitive)) markup = operationVisual(fractions, "+", answer, revealAnswer);
    else if (["fraction_bar_subtract"].includes(primitive)) markup = operationVisual(fractions, "−", answer, revealAnswer);
    else if (["bar_model", "quantity_compare"].includes(primitive)) markup = barModelVisual(fractions, description);
    else if (primitive === "fraction_groups") markup = groupsVisual(fractions, description);
    else if (primitive === "fraction_multiplication_area") markup = multiplicationAreaVisual(fractions, answer, revealAnswer);
    else if (["cross_cancel", "fraction_factor_cancel", "factor_tree_fraction"].includes(primitive)) markup = cancellationVisual(fractions, answer, revealAnswer);
    else if (primitive === "reciprocal_pair") markup = reciprocalVisual(fractions, answer, revealAnswer);
    else if (["sharing_model", "division_measure_model"].includes(primitive)) markup = divisionVisual(fractions, answer, revealAnswer);
    else if (primitive === "fraction_bar") markup = areaVisual(description, fractions, { ...ctx, visual });
    else markup = genericVisual(description);

    container.className = `math-canvas action-${action} feedback-${feedback}`;
    const authoredDuration = Number(visual?.timeline?.[0]?.duration_ms || 750);
    container.style.setProperty("--action-duration", `${Math.max(300, Math.min(1800, authoredDuration))}ms`);
    container.style.setProperty("--cue-delay", `${cueDelayFor(action, ctx.narration)}ms`);
    container.setAttribute("role", "img");
    const fra01Description = primitive === "fra01_context" && window.RevilyFra01Visuals?.accessibleDescription
      ? window.RevilyFra01Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model)
      : "";
    const fra02Description = primitive === "fra02_context" && window.RevilyFra02Visuals?.accessibleDescription
      ? window.RevilyFra02Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model)
      : "";
    const fra03Description = primitive === "fra03_context" && window.RevilyFra03Visuals?.accessibleDescription
      ? window.RevilyFra03Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model)
      : "";
    const fra04Description = primitive === "fra04_context" && window.RevilyFra04Visuals?.accessibleDescription
      ? window.RevilyFra04Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model)
      : "";
    const fra05Description = primitive === "fra05_context" && window.RevilyFra05Visuals?.accessibleDescription
      ? window.RevilyFra05Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra06Description = primitive === "fra06_context" && window.RevilyFra06Visuals?.accessibleDescription
      ? window.RevilyFra06Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra07Description = primitive === "fra07_context" && window.RevilyFra07Visuals?.accessibleDescription
      ? window.RevilyFra07Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra08Description = primitive === "fra08_context" && window.RevilyFra08Visuals?.accessibleDescription
      ? window.RevilyFra08Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra09Description = primitive === "fra09_context" && window.RevilyFra09Visuals?.accessibleDescription
      ? window.RevilyFra09Visuals.accessibleDescription(visual, ctx)
      : "";
    const fra10Description = primitive === "fra10_context" && window.RevilyFra10Visuals?.accessibleDescription
      ? window.RevilyFra10Visuals.accessibleDescription(visual, ctx)
      : "";
    const fra11Description = primitive === "fra11_context" && window.RevilyFra11Visuals?.accessibleDescription
      ? window.RevilyFra11Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra12Description = primitive === "fra12_context" && window.RevilyFra12Visuals?.accessibleDescription
      ? window.RevilyFra12Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra13Description = primitive === "fra13_context" && window.RevilyFra13Visuals?.accessibleDescription
      ? window.RevilyFra13Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra14Description = primitive === "fra14_context" && window.RevilyFra14Visuals?.accessibleDescription
      ? window.RevilyFra14Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra15Description = primitive === "fra15_context" && window.RevilyFra15Visuals?.accessibleDescription
      ? window.RevilyFra15Visuals.accessibleDescription(visual, ctx)
      : "";
    const fra16Description = primitive === "fra16_context" && window.RevilyFra16Visuals?.accessibleDescription
      ? window.RevilyFra16Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra17Description = primitive === "fra17_context" && window.RevilyFra17Visuals?.accessibleDescription
      ? window.RevilyFra17Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra18Description = primitive === "fra18_context" && window.RevilyFra18Visuals?.accessibleDescription
      ? window.RevilyFra18Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra19Description = primitive === "fra19_context" && window.RevilyFra19Visuals?.accessibleDescription
      ? window.RevilyFra19Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra20Description = primitive === "fra20_context" && window.RevilyFra20Visuals?.accessibleDescription
      ? window.RevilyFra20Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra21Description = primitive === "fra21_context" && window.RevilyFra21Visuals?.accessibleDescription
      ? window.RevilyFra21Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra22Description = primitive === "fra22_context" && window.RevilyFra22Visuals?.accessibleDescription
      ? window.RevilyFra22Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra23Description = primitive === "fra23_context" && window.RevilyFra23Visuals?.accessibleDescription
      ? window.RevilyFra23Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra24Description = primitive === "fra24_context" && window.RevilyFra24Visuals?.accessibleDescription
      ? window.RevilyFra24Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra26Description = primitive === "fra26_context" && window.RevilyFra26Visuals?.accessibleDescription
      ? window.RevilyFra26Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const fra28Description = primitive === "fra28_context" && window.RevilyFra28Visuals?.accessibleDescription
      ? window.RevilyFra28Visuals.accessibleDescription(question?.model || visual?.scene?.model || visual?.model, ctx)
      : "";
    const percentageDescription = primitive === "percentage_strip"
      ? percentageAccessibleDescription(visual, ctx, revealAnswer)
      : "";
    if (["fra05_context", "fra06_context", "fra07_context", "fra08_context", "fra09_context", "fra10_context", "fra11_context", "fra12_context", "fra13_context", "fra14_context", "fra15_context", "fra16_context", "fra17_context", "fra18_context", "fra19_context", "fra20_context", "fra21_context", "fra22_context", "fra23_context", "fra24_context", "fra26_context", "fra28_context"].includes(primitive)) container.setAttribute("role", "group");
    container.setAttribute("aria-label", percentageDescription || fra01Description || fra02Description || fra03Description || fra04Description || fra05Description || fra06Description || fra07Description || fra08Description || fra09Description || fra10Description || fra11Description || fra12Description || fra13Description || fra14Description || fra15Description || fra16Description || fra17Description || fra18Description || fra19Description || fra20Description || fra21Description || fra22Description || fra23Description || fra24Description || fra26Description || fra28Description || (question
      ? (question.assessmentIntent === "symbol_to_visual" ? `Target fraction: ${question.targetFraction}. Choose the matching model below.` : structuredModelLabel(question.model) || `Visual model: ${cleanVisualText(question.prompt)}`)
      : visualLabel(primitive, semanticText, isDecimal)));
    container.innerHTML = `<div class="visual-stage" data-primitive="${escapeHtml(primitive)}">${markup}</div>`;
    if (primitive === "fra05_context") window.RevilyFra05Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra08_context") window.RevilyFra08Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra10_context") window.RevilyFra10Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra11_context") window.RevilyFra11Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra12_context") window.RevilyFra12Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra13_context") window.RevilyFra13Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra17_context") window.RevilyFra17Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra18_context") window.RevilyFra18Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra19_context") window.RevilyFra19Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra20_context") window.RevilyFra20Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra23_context") window.RevilyFra23Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra24_context") window.RevilyFra24Visuals?.bind?.(container, visual, ctx);
    if (primitive === "fra26_context") window.RevilyFra26Visuals?.bind?.(container, visual, ctx);
  }

  function visualLabel(primitive, text, isDecimal) {
    if (primitive === "percentage_strip") return "Aligned percentage and amount strips showing the selected proportion of a whole.";
    if (isDecimal && primitive.includes("number_line")) return "A decimal number line showing the values in the current explanation.";
    if (isDecimal && ["decimal_place_value_grid", "base_ten_model", "expanded_form", "place_value_scaler", "place_value_repartition"].includes(primitive)) return "A decimal place-value model showing digits aligned with their named columns.";
    if (isDecimal && ["column_calculation", "regrouping_model"].includes(primitive)) return "A decimal calculation with decimal points and equal place values aligned.";
    if (isDecimal && primitive.includes("division")) return "A decimal division model preserving the relationship between dividend, divisor and quotient.";
    if (isDecimal && primitive === "sign_magnitude_model") return "A signed decimal model separating the result sign from the magnitude calculation.";
    if (isDecimal) return "A mathematical decimal model for the current explanation.";
    if (primitive.includes("number_line")) return "A number line showing the fractional positions used in this explanation.";
    if (primitive.includes("add")) return "Aligned fraction bars showing equal-sized parts being combined.";
    if (primitive.includes("subtract")) return "Aligned fraction bars showing equal-sized parts being removed.";
    if (primitive.includes("multiplication")) return "An area model showing the overlap produced by multiplying fractions.";
    if (primitive.includes("division") || primitive === "sharing_model") return "A measurement model showing groups of a fractional size.";
    if (primitive.includes("reciprocal")) return "A product-one model for a number and its reciprocal.";
    if (primitive.includes("compare")) return "Equal-width fraction models shown for an exact comparison.";
    if (/unequal|different sizes/i.test(text)) return "A contrast between unequal pieces and valid equal fraction parts.";
    return "A mathematical fraction model for the current explanation.";
  }

  window.RevilyVisuals = {
    escapeHtml,
    extractDecimals,
    extractFractions,
    fractionMarkup,
    mathMarkup,
    modelChoiceMarkup,
    render,
    structuredModelLabel,
    visualLabel
  };
})();
