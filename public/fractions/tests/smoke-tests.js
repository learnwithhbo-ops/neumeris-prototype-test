(async function () {
  "use strict";

  const status = document.getElementById("test-status");
  const summary = document.getElementById("test-summary");
  const log = document.getElementById("test-log");
  const fixture = document.getElementById("test-fixture");
  const topics = window.RevilyTopics;
  const loader = window.RevilySkillLoader;
  const { buildLessonModel, validateFractionQuestionModel } = window.RevilyLessonModel;
  const { parseDecimal, parseRational, validate } = window.RevilyValidators;
  const { LessonEngine, normaliseNarrationText, openingNarrationLines, selectRyanVoice, speechBeats } = window.RevilyLessonEngine;
  const { NarrationSync, timingPlan } = window.RevilyNarrationSync;
  const { render: renderVisual } = window.RevilyVisuals;
  const narrationAssets = window.RevilyNarrationAssets;
  const onlySkillId = new URLSearchParams(window.location.search).get("only")?.toUpperCase() || null;
  if (!Object.isExtensible(narrationAssets.tracks)) throw new Error("The shared Ryan audio registry must accept skill-specific authored clips.");
  const supportedTypes = new Set(["integer", "two_step_integer", "choice_and_integer", "choice_two_step_integer", "quantity", "money", "decimal", "fraction", "mixed_number", "division_then_mixed", "single_choice", "multiple_choice", "set_builder", "yes_no", "comparison_symbol", "ordered_sequence", "tick_selector", "classification_sort", "classification_and_size", "classification_size_validity", "paired_classification", "factor_then_integer", "fra12_staged_fields", "fra16_equivalent_comparison", "fra16_benchmark_comparison", "fra16_order_cards", "fra17_cell_tap_integer", "fra18_fields", "fra18_select_then_fields", "fra19_staged_fields", "fra20_cell_tap_integer", "fra23_group_tap_fraction", "fra23_unit_fraction", "fra23_badge_fraction", "fra26_matching", "fra26_tile_placement", "fra26_staged_integer", "fra27_reciprocal_product", "fra27_share", "fra28_choice_then_fraction", "fra28_reciprocal_and_fraction", "fra28_range_and_fraction", "factor_route_builder", "factor_choice_then_fraction", "choice_then_fraction", "sort_then_factor", "arithmetic_check", "continue"]);
  const supportedPrimitives = new Set([
    "area_model", "bar_model", "base_ten_model", "calculation_chain", "column_calculation", "comparison_lane",
    "context_model", "cross_cancel", "decimal_area_model", "decimal_place_value_grid", "division_measure_model",
    "division_scaler", "expanded_form", "factor_tree_fraction", "fraction_area", "fraction_bar", "fraction_bar_add",
    "fraction_bar_compare", "fraction_bar_subtract", "fraction_factor_cancel", "fraction_groups",
    "fraction_multiplication_area", "fraction_relation", "grouping_model", "interval_counter", "long_division",
    "magnitude_bar", "magnitude_estimate", "measure_strip", "mixed_number_model", "money_card", "multi_model_fraction",
    "number_line", "number_line_compare", "opposite_transform", "ordering_cards", "place_value_repartition",
    "place_value_scaler", "quantity_compare", "reasonableness_check", "reciprocal_pair", "regrouping_model",
    "repeated_groups", "sharing_model", "sign_magnitude_model", "signed_number_line", "percentage_strip", "fra01_context", "fra02_context", "fra03_context", "fra04_context", "fra05_context", "fra06_context", "fra07_context", "fra08_context", "fra09_context", "fra10_context", "fra11_context", "fra12_context", "fra13_context", "fra14_context", "fra15_context", "fra16_context", "fra17_context", "fra18_context", "fra19_context", "fra20_context", "fra21_context", "fra22_context", "fra23_context", "fra24_context", "fra26_context", "fra27_context", "fra28_context"
  ]);
  const nonVisualPrimitives = new Set(["caption_layer", "comparison_symbol", "decimal_input", "fraction_input", "mixed_number_input", "integer_input", "two_step_integer", "choice_and_integer", "choice_two_step_integer", "quantity_input", "money_input", "progress_indicator", "single_choice", "multiple_choice", "set_builder", "tick_selector", "classification_sort", "classification_and_size", "classification_size_validity", "paired_classification", "fra16_equivalent_comparison", "fra16_benchmark_comparison", "fra16_order_cards", "fra18_fields", "fra18_select_then_fields", "fra19_staged_fields", "fra26_matching", "fra26_tile_placement", "fra26_staged_integer", "factor_route_builder", "yes_no", "optional_hint", "post_submit_working", "fixed_fraction_field", "fra27_context", "fra28_context"]);
  let assertions = 0;
  let failures = 0;
  let renderedVisuals = 0;
  let checkedAnswers = 0;
  const skillResults = [];

  function assert(condition, message) {
    assertions += 1;
    if (!condition) throw new Error(message);
  }

  function report(label, passed, detail) {
    const item = document.createElement("li");
    item.className = passed ? "" : "fail";
    item.textContent = `${label}: ${detail}`;
    log.appendChild(item);
  }

  function assertNarrationAsset(line, context) {
    if (typeof line !== "string") return;
    const text = normaliseNarrationText(line);
    if (!text || /^not applicable\.?$/i.test(text) || /^no worked solution is shown/i.test(text)) return;
    if (/^Record the response silently|^Use the exact .* policy/i.test(text)) return;
    assert(Boolean(narrationAssets.tracks[text]?.src), `${context} has no Microsoft Ryan audio asset`);
  }

  function assertNarrationBeatAssets(line, context) {
    if (Array.isArray(line)) {
      line.forEach((item, index) => assertNarrationBeatAssets(item, `${context} line ${index + 1}`));
      return;
    }
    if (line && typeof line === "object") {
      Object.values(line).forEach((item, index) => assertNarrationBeatAssets(item, `${context} value ${index + 1}`));
      return;
    }
    if (typeof line !== "string") return;
    const fra05Entry = Object.values(window.FRA05_RUNTIME_COPY || {}).find((entry) => entry.text === normaliseNarrationText(line));
    if (fra05Entry) {
      const asset = narrationAssets.tracks[fra05Entry.text];
      assert(Boolean(asset?.src), `${context} has no exact FRA05 Ryan audio asset`);
      assert(Array.isArray(asset?.words) && asset.words.length > 0, `${context} has no FRA05 Ryan word-boundary timing`);
      return;
    }
    speechBeats(line).forEach((beat, index) => {
      const asset = narrationAssets.tracks[beat];
      assert(Boolean(asset?.src), `${context} beat ${index + 1} has no Microsoft Ryan audio asset`);
      assert(Array.isArray(asset?.words) && asset.words.length > 0, `${context} beat ${index + 1} has no Ryan word-boundary timing`);
    });
  }

  supportedTypes.add('cancellation_working');
  supportedTypes.add('conversion_product');
  function correctResponse(question) {
    const answer = question.answer.value;
    const type = question.response.type;
    if (type === 'cancellation_working') return JSON.parse(JSON.stringify(answer));
    if (type === 'conversion_product') return JSON.parse(JSON.stringify(answer));
    if (type === "fraction") {
      if (answer && typeof answer === "object") {
        return {
          n: String(answer.n ?? answer.numerator),
          d: String(answer.d ?? answer.denominator)
        };
      }
      const match = String(answer).match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
      return match ? { n: match[1], d: match[2] } : String(answer);
    }
    if (type === "mixed_number") {
      if (answer && typeof answer === "object") return { ...answer };
      const mixed = String(answer).match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
      if (mixed) return { whole: mixed[1], n: mixed[2], d: mixed[3] };
      return { whole: String(answer), n: "0", d: "1" };
    }
    if (type === "division_then_mixed") return { ...answer };
    if (type === "integer" || type === "quantity" || type === "decimal" || type === "tick_selector") return String(answer);
    if (type === "money") return `${answer}p`;
    if (type === "two_step_integer") return { ...answer };
    if (type === "choice_and_integer" || type === "choice_two_step_integer") return { ...answer };
    if (type === "factor_then_integer") return { ...answer };
    if (["fra27_reciprocal_product", "fra27_share", "fra28_choice_then_fraction", "fra28_reciprocal_and_fraction", "fra28_range_and_fraction"].includes(type)) return JSON.parse(JSON.stringify(answer));
    if (type === "fra12_staged_fields") return { ...answer };
    if (type === "fra16_equivalent_comparison") return { rewrittenNumerators: [...answer.rewrittenNumerators], symbol: answer.symbol };
    if (type === "fra16_benchmark_comparison") return { relations: [...answer.relations], symbol: answer.symbol };
    if (type === "fra16_order_cards") return [...answer];
    if (type === "multiple_choice") return [...answer];
    if (["classification_sort", "classification_and_size", "classification_size_validity"].includes(type)) return { ...answer };
    if (type === "paired_classification") return [...answer];
    if (type === "set_builder") return Array.from({ length: Number(answer) }, (_, index) => String(index));
    if (type === "ordered_sequence") return Array.isArray(answer) ? [...answer] : String(answer).split("<").map((item) => item.trim());
    return answer;
  }

  function wrongResponse(question) {
    const answer = question.answer.value;
    const type = question.response.type;
    if (type === "fraction") {
      if (answer && typeof answer === "object") {
        const n = BigInt(String(answer.n ?? answer.numerator));
        return { n: String(n + 1n), d: String(answer.d ?? answer.denominator) };
      }
      const match = String(answer).match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
      return match ? { n: String(BigInt(match[1]) + 1n), d: match[2] } : String(BigInt(answer) + 1n);
    }
    if (type === "mixed_number") {
      const correct = correctResponse(question);
      return { whole: String(BigInt(correct.whole) + 1n), n: correct.n, d: correct.d };
    }
    if (type === "division_then_mixed") return { ...answer, remainder: String(BigInt(answer.remainder) + 1n), n: String(BigInt(answer.n) + 1n) };
    if (type === "integer" || type === "quantity" || type === "tick_selector") return String(BigInt(answer) + 1n);
    if (type === "money") return `${Number(answer) + 100}p`;
    if (type === "two_step_integer") {
      const result = { ...answer };
      const key = Object.keys(result).at(-1);
      result[key] = String(BigInt(result[key]) + 1n);
      return result;
    }
    if (type === "choice_and_integer" || type === "choice_two_step_integer") {
      const result = { ...answer };
      result.whole = String(BigInt(result.whole) + 1n);
      return result;
    }
    if (type === "factor_then_integer") return { factor: "997", value: "991" };
    if (type === "fra27_reciprocal_product") return { reciprocal: "997/991", n: "997", d: "991" };
    if (type === "fra27_share") return { trayCounts: [997], n: "997", d: "991" };
    if (type === "fra28_choice_then_fraction") return { choice: "not-an-option", quotient: { n: "997", d: "991" } };
    if (type === "fra28_reciprocal_and_fraction") return { reciprocal: { n: "997", d: "991" }, quotient: { n: "997", d: "991" } };
    if (type === "fra28_range_and_fraction") return { range: "not-a-range", quotient: { n: "997", d: "991" } };
    if (type === "fra12_staged_fields") return { ...answer, wholePieceTotal: String(BigInt(answer.wholePieceTotal) + 1n) };
    if (type === "fra16_equivalent_comparison") return { rewrittenNumerators: [String(BigInt(answer.rewrittenNumerators[0]) + 1n), String(answer.rewrittenNumerators[1])], symbol: answer.symbol };
    if (type === "fra16_benchmark_comparison") return { relations: ["above_half", answer.relations[1]], symbol: answer.symbol };
    if (type === "fra16_order_cards") return [...answer].reverse();
    if (type === "decimal") return String(answer) === "123456789.987654321" ? "-123456789.987654321" : "123456789.987654321";
    if (type === "yes_no") return answer === true || String(answer).toLowerCase() === "yes" ? "No" : "Yes";
    if (type === "comparison_symbol") return ["<", ">", "="].find((value) => value !== String(answer));
    if (type === "multiple_choice") {
      const expected = new Set(answer.map(String));
      return [(question.response.options || []).find((value) => !expected.has(String(value))) || question.response.options?.[0]];
    }
    if (type === "set_builder") {
      const total = Number(question.response.totalTokens || question.model?.totalParts);
      const wrongCount = Number(answer) < total ? Number(answer) + 1 : Math.max(0, Number(answer) - 1);
      return Array.from({ length: wrongCount }, (_, index) => String(index));
    }
    if (type === "ordered_sequence") return correctResponse(question).slice().reverse();
    if (type === "classification_sort") {
      const result = { ...answer };
      const key = Object.keys(result)[0];
      result[key] = (question.response.destinations || []).find((value) => value !== result[key]);
      return result;
    }
    if (type === "classification_and_size" || type === "classification_size_validity") {
      const result = { ...answer };
      result.classification = (question.response.classification_options || ["proper", "improper", "mixed"]).find((value) => value !== answer.classification);
      return result;
    }
    if (type === "paired_classification") {
      const result = [...answer];
      result[0] = (question.response.classification_options || ["proper", "improper", "mixed"]).find((value) => value !== answer[0]);
      return result;
    }
    return (question.response.options || []).find((value) => String(value) !== String(answer)) ?? "definitely-not-the-answer";
  }

  function fra20Response(question, shouldBeCorrect) {
    const canonical = question.canonicalQuestion;
    const expected = canonical.expectedAnswer;
    if (expected.kind === "unscored_choice") {
      const optionId = shouldBeCorrect
        ? expected.preferredOptionId
        : canonical.options.find((option) => option.id !== expected.preferredOptionId)?.id;
      return canonical.options.find((option) => option.id === optionId)?.text;
    }
    if (expected.kind === "option") {
      const optionId = shouldBeCorrect
        ? expected.optionId
        : canonical.options.find((option) => option.id !== expected.optionId)?.id;
      return canonical.options.find((option) => option.id === optionId)?.text;
    }
    if (expected.kind === "integer") return String(shouldBeCorrect ? expected.value : expected.value + 1);
    const numerator = expected.value.numerator + (shouldBeCorrect ? 0 : 1);
    const denominator = expected.value.denominator;
    if (question.response.type === "integer") return String(numerator);
    if (question.response.type === "fra20_cell_tap_integer") {
      return { numerator: String(numerator), denominator: String(denominator), tapped: Array.from({ length: numerator }, (_, index) => index) };
    }
    return { n: String(numerator), d: String(denominator) };
  }

  function fra10Response(question, shouldBeCorrect) {
    const type = question.response.type;
    if (type === "single_choice") {
      return shouldBeCorrect
        ? question.answer.value
        : question.response.options.find((option) => String(option) !== String(question.answer.value));
    }
    if (type === "fraction") {
      const [n, d] = String(question.answer.value).split("/").map(Number);
      return { n: String(n + (shouldBeCorrect ? 0 : 1)), d: String(d) };
    }
    if (type === "factor_route_builder") {
      const expected = question.canonicalQuestion.expectedFraction;
      return { current: { n: expected.numerator + (shouldBeCorrect ? 0 : 1), d: expected.denominator }, history: [], finished: true };
    }
    if (type === "factor_choice_then_fraction") {
      const answer = structuredClone(question.answer.value);
      if (!shouldBeCorrect) answer.n = String(Number(answer.n) + 1);
      return answer;
    }
    if (type === "choice_then_fraction") {
      const answer = structuredClone(question.answer.value);
      if (!shouldBeCorrect) answer.choice = question.response.options.find((option) => option !== answer.choice) || "wrong";
      return answer;
    }
    if (type === "sort_then_factor") {
      const response = { sort: {}, factors: {} };
      question.response.items.forEach((item) => {
        response.sort[item.id] = item.correctBucket;
        response.factors[item.id] = String(item.expectedFactor);
      });
      if (!shouldBeCorrect) response.factors[question.response.items[0].id] = String(Number(question.response.items[0].expectedFactor) + 1);
      return response;
    }
    if (type === "arithmetic_check") {
      const values = question.response.checks.map((check) => String(check.answer));
      if (!shouldBeCorrect) values[0] = String(Number(values[0]) + 1);
      return { values };
    }
    throw new Error(`${question.id}: unsupported FRA10 response type ${type}`);
  }

  function fra21Response(question, shouldBeCorrect) {
    const canonical = question.canonicalQuestion;
    const answer = canonical?.answer;
    if (!canonical || !answer) return shouldBeCorrect ? correctResponse(question) : wrongResponse(question);
    if (answer.kind === "fraction_value") {
      return { n: String(answer.canonical.numerator + (shouldBeCorrect ? 0 : 1)), d: String(answer.canonical.denominator) };
    }
    if (answer.kind === "integer_fields") {
      const values = Object.fromEntries(Object.entries(answer.expected).map(([id, value]) => [id, String(value)]));
      if (!shouldBeCorrect) {
        const last = Object.keys(values).at(-1);
        values[last] = String(Number(values[last]) + 1);
      }
      return values;
    }
    if (answer.kind === "single_choice") {
      const optionId = shouldBeCorrect ? answer.correctOptionId : canonical.response.optionIds.find((id) => id !== answer.correctOptionId);
      return Object.entries(question.response.optionIds).find(([, id]) => id === optionId)?.[0];
    }
    if (answer.kind === "composite") {
      const optionId = shouldBeCorrect ? answer.correctOptionId : canonical.response.optionIds.find((id) => id !== answer.correctOptionId);
      const choice = Object.entries(question.response.optionIds).find(([, id]) => id === optionId)?.[0];
      const whole = Number(Object.values(answer.expectedFields)[0]) + (shouldBeCorrect ? 0 : 1);
      return { choice, whole: String(whole) };
    }
    if (answer.kind === "ordered_steps") return shouldBeCorrect ? [...answer.correctOrder] : [...answer.correctOrder].reverse();
    throw new Error(`${canonical.id}: unsupported FRA21 answer kind ${answer.kind}`);
  }

  function fra23Response(question, shouldBeCorrect) {
    const type = question.response.type;
    const answer = question.answer.value;
    if (type === "integer") return String(Number(answer) + (shouldBeCorrect ? 0 : 1));
    if (type === "single_choice") return shouldBeCorrect
      ? answer
      : question.response.options.find((option) => String(option) !== String(answer));
    if (type === "fraction") return { n: String(Number(answer.n) + (shouldBeCorrect ? 0 : 1)), d: String(answer.d) };
    if (type === "fra23_group_tap_fraction") return {
      numerator: String(Number(answer.numerator) + (shouldBeCorrect ? 0 : 1)),
      tappedGroups: shouldBeCorrect ? Array.from({ length: Number(answer.tappedGroups) }, (_, index) => String(index + 1)) : ["1"]
    };
    if (type === "fra23_unit_fraction") return {
      numerator: String(Number(answer.numerator) + (shouldBeCorrect ? 0 : 1)),
      unit: shouldBeCorrect ? answer.unit : question.response.unitOptions.find((unit) => unit !== answer.unit)
    };
    if (type === "fra23_badge_fraction") return {
      numerator: String(Number(answer.numerator) + (shouldBeCorrect ? 0 : 1)),
      placement: shouldBeCorrect ? answer.placement : question.response.placementOptions.find((placement) => placement !== answer.placement)
    };
    throw new Error(`${question.id}: unsupported FRA23 response type ${type}`);
  }

  function fra26Response(question, shouldBeCorrect) {
    const type = question.response.type;
    const answer = question.answer.value;
    if (type === "fraction") return shouldBeCorrect ? { n: String(answer.n), d: String(answer.d) } : { n: String(Number(answer.n) + 1), d: String(answer.d) };
    if (type === "single_choice") return shouldBeCorrect ? answer : question.response.options.find((option) => option !== answer);
    if (type === "fra26_matching" || type === "fra26_tile_placement") {
      const result = { ...answer };
      const key = Object.keys(result)[0];
      result[key] = `wrong-${result[key]}`;
      return shouldBeCorrect ? { ...answer } : result;
    }
    if (type === "fra26_staged_integer") return shouldBeCorrect ? { ...answer } : { ...answer, firstDenominator: "2" };
    return shouldBeCorrect ? correctResponse(question) : wrongResponse(question);
  }

  function fra17Response(question, shouldBeCorrect) {
    const canonical = question.canonicalQuestion;
    if (!canonical) return shouldBeCorrect ? correctResponse(question) : wrongResponse(question);
    if (canonical.answer?.kind === "option") {
      const option = canonical.response.options.find((item) => item.id === canonical.answer.optionId);
      const alternate = canonical.response.options.find((item) => item.id !== canonical.answer.optionId);
      return (shouldBeCorrect ? option : alternate)?.label;
    }
    const expected = canonical.answer?.value;
    const numerator = Number(expected?.numerator || 0) + (shouldBeCorrect ? 0 : 1);
    const denominator = Number(expected?.denominator || 1);
    if (question.response.type === "integer") return String(numerator);
    if (question.response.type === "fra17_cell_tap_integer") {
      return { numerator: String(numerator), tapped: Array.from({ length: numerator }, (_, index) => String(index)) };
    }
    return { n: String(numerator), d: String(denominator) };
  }

  function fra18Response(question, shouldBeCorrect) {
    const authored = question.canonicalQuestion;
    if (!authored) return shouldBeCorrect ? correctResponse(question) : wrongResponse(question);
    const kind = authored.response?.kind;
    if (kind === "decision") {
      const option = authored.response.options.find((item) => item.id === (shouldBeCorrect ? "WAIT" : "ADD"));
      return option.text;
    }
    if (kind === "choice") {
      const option = authored.response.options.find((item) => shouldBeCorrect ? item.id === authored.response.correctOptionId : item.id !== authored.response.correctOptionId);
      return option.text;
    }
    if (kind === "fraction") {
      const answer = authored.response.acceptedFraction;
      return { n: String(answer.numerator + (shouldBeCorrect ? 0 : 1)), d: String(answer.denominator) };
    }
    const result = Object.fromEntries(Object.entries(authored.response.correctFields || {}).map(([key, value]) => [key, String(value)]));
    if (kind === "select_then_fields") result.selectedOperand = shouldBeCorrect ? authored.response.correctOperand : (authored.response.correctOperand === "left" ? "right" : "left");
    if (!shouldBeCorrect && kind === "fields") {
      const key = authored.response.requiredFields[0];
      result[key] = String(Number(result[key]) + 1);
    }
    return result;
  }

  function walkMainGraph(model) {
    const visited = [];
    let cursor = model.firstId;
    while (cursor && visited.length <= model.nodes.length) {
      assert(!visited.includes(cursor), `main graph loops at ${cursor}`);
      const node = model.getNode(cursor);
      assert(node, `main graph points to missing node ${cursor}`);
      visited.push(cursor);
      cursor = node.nextId;
    }
    assert(visited.length === model.nodes.length, `main graph visits ${visited.length} of ${model.nodes.length} nodes`);
  }

  function createTestEngine(topic, spec, dialogue, cursor) {
    const host = document.createElement("div");
    fixture.appendChild(host);
    const engine = new LessonEngine(host, spec, dialogue, { topic });
    engine.state = engine.freshState();
    engine.state.started = true;
    engine.state.soundOn = false;
    engine.state.cursor = cursor;
    engine.persist = () => {};
    engine.emit = () => {};
    engine.startNarration = () => {};
    engine.stopNarration = () => {};
    engine.render();
    return { engine, host };
  }

  function fillEngineResponse(engine, question, response) {
    const type = question.response.type;
    if (type === "integer") engine.root.querySelector("#integer-answer").value = String(response);
    else if (type === "fra20_cell_tap_integer") {
      engine.root.querySelector("#integer-answer").value = String(response.numerator);
      const selected = new Set((response.tapped || []).map(Number));
      engine.root.querySelectorAll("[data-fra20-cell]").forEach((button) => {
        const active = selected.has(Number(button.dataset.fra20Cell));
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
    else if (type === "two_step_integer") engine.root.querySelectorAll("[data-two-step-field]").forEach((input) => { input.value = response[input.dataset.twoStepField] ?? ""; });
    else if (type === "choice_and_integer" || type === "choice_two_step_integer") {
      const options = engine.choiceOptions(question);
      engine.root.querySelector("#choice-answer").value = String(options.findIndex((option) => String(option) === String(response.choice)));
      engine.root.querySelectorAll("[data-choice-integer-field]").forEach((input) => { input.value = response[input.dataset.choiceIntegerField] ?? ""; });
    }
    else if (type === "quantity") engine.root.querySelector("#quantity-answer").value = String(response);
    else if (type === "money") engine.root.querySelector("#money-answer").value = String(response);
    else if (type === "fra12_staged_fields") {
      engine.root.querySelector("#fra12-whole-piece-total").value = String(response.wholePieceTotal);
      engine.root.querySelector("#fra12-total-numerator").value = String(response.totalNumerator);
      engine.root.querySelector("#fra12-final-numerator").value = String(response.finalNumerator);
    }
    else if (type === "fra16_equivalent_comparison") {
      engine.root.querySelectorAll("[data-fra16-equivalent-index]").forEach((input) => { input.value = String(response.rewrittenNumerators[Number(input.dataset.fra16EquivalentIndex)]); });
      engine.root.querySelector("[data-fra16-symbol]").value = response.symbol;
    }
    else if (type === "fra16_benchmark_comparison") {
      engine.root.querySelectorAll("[data-fra16-relation-index]").forEach((select) => { select.value = response.relations[Number(select.dataset.fra16RelationIndex)]; });
      engine.root.querySelector("[data-fra16-symbol]").value = response.symbol;
    }
    else if (type === "fra16_order_cards") {
      const list = engine.root.querySelector("[data-fra16-order-list]");
      response.forEach((id) => { const item = list.querySelector(`[data-card-id="${id}"]`); if (item) list.appendChild(item); });
    }
    else if (type === "tick_selector") engine.setTickSelection(question, Number(response));
    else if (type === "decimal") engine.root.querySelector("#decimal-answer").value = String(response);
    else if (type === "fraction" && engine.root.querySelector("#fraction-whole")) engine.root.querySelector("#fraction-whole").value = String(response);
    else if (type === "fraction") {
      engine.root.querySelector("#fraction-n").value = response.n;
      engine.root.querySelector("#fraction-d").value = response.d;
    } else if (type === "mixed_number") {
      engine.root.querySelector("#mixed-whole").value = response.whole;
      engine.root.querySelector("#mixed-n").value = response.n;
      if (engine.root.querySelector("#mixed-d")) engine.root.querySelector("#mixed-d").value = response.d;
    } else if (type === "division_then_mixed") {
      engine.root.querySelectorAll("[data-division-mixed-field]").forEach((input) => { input.value = response[input.dataset.divisionMixedField] ?? ""; });
    } else if (type === "multiple_choice") {
      const selected = new Set(response.map(String));
      engine.root.querySelectorAll(".multi-choice-card").forEach((button) => {
        const active = selected.has(String(button.dataset.optionValue));
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", String(active));
      });
    } else if (type === "set_builder") {
      const selected = new Set(response.map(String));
      engine.root.querySelectorAll(".set-builder-token").forEach((button) => {
        const active = selected.has(String(button.dataset.tokenIndex));
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", String(active));
      });
    } else if (type === "ordered_sequence") {
      engine.root.querySelector("#order-result").innerHTML = response.map((item) => `<span data-value="${item}">${item}</span>`).join("");
    } else if (type === "classification_sort") {
      engine.root.querySelectorAll("[data-sort-card]").forEach((select) => { select.value = response[select.dataset.sortCard] || ""; });
    } else if (type === "classification_and_size" || type === "classification_size_validity") {
      engine.root.querySelectorAll("[data-compound-key]").forEach((select) => { select.value = String(response[select.dataset.compoundKey]); });
    } else if (type === "paired_classification") {
      engine.root.querySelectorAll("[data-paired-index]").forEach((select) => { select.value = response[Number(select.dataset.pairedIndex)] || ""; });
    } else {
      const options = engine.choiceOptions(question);
      engine.root.querySelector("#choice-answer").value = String(options.findIndex((option) => String(option) === String(response)));
    }
  }

  function submitEngineResponse(engine, response) {
    const current = engine.current();
    fillEngineResponse(engine, current.question, response);
    engine.submitAnswer(current);
    return current;
  }

  function renderModelVisual(spec, model, options) {
    const opts = options || {};
    const node = opts.nodeId ? model.getNode(opts.nodeId) : null;
    const question = opts.questionId ? model.getQuestion(opts.questionId) : node?.question || null;
    const visual = node?.visual || model.visualForQuestion(question, question?.prompt || "");
    const host = document.createElement("div");
    renderVisual(host, visual, {
      spec,
      question,
      narration: node?.narration || "",
      feedback: opts.feedback || "initial"
    });
    return host;
  }

  function assertFra01VisualContractLegacy(spec, model, topic, dialogue) {
    assert(spec.canonical_lesson?.reference_for_future_lessons === true, "FRA-01 is not marked as the canonical reference lesson");
    assert(spec.voice_and_script.opening_mode === "authored_scene_only", "FRA-01 still uses the generic lesson opening");
    assert(spec.voice_and_script.narration_playback?.mode === "authored_audio_then_browser_speech", "FRA-01 does not prefer packaged Ryan narration");
    assert(spec.voice_and_script.narration_playback?.require_ryan_voice === true, "FRA-01 can fall back to a different narrator");
    assert(spec.voice_and_script.caption_presentation?.mode === "on_canvas_progressive", "FRA-01 captions are not progressive and on-canvas");
    assert(speechBeats(model.getNode("T01").narration).length === 4, "FRA-01 opening narration was not split into short caption beats");
    spec.lesson.teaching_steps.forEach((step) => assertNarrationBeatAssets(step.narration?.script, `FRA-01 ${step.id}`));
    Object.entries(spec.lesson.transfer_steps || {}).forEach(([id, step]) => assertNarrationBeatAssets(step.pre_question_script, `FRA-01 ${id}`));
    assertNarrationBeatAssets(spec.lesson.practice?.intro_script, "FRA-01 practice intro");
    assertNarrationBeatAssets(spec.lesson.exit?.intro_script, "FRA-01 exit intro");
    assertNarrationBeatAssets(spec.completion.secure.ryan_script, "FRA-01 secure completion");
    assertNarrationBeatAssets(spec.completion.needs_work.ryan_script, "FRA-01 needs-work completion");
    spec.question_bank.forEach((question) => {
      [question.scripts?.on_correct_math, question.scripts?.on_incorrect_attempt_1, question.scripts?.on_incorrect_attempt_2,
        question.scripts?.worked_explanation, question.mathematical_support?.hint_1, question.mathematical_support?.hint_2,
        question.mathematical_support?.worked_solution]
        .filter((line) => line && !/^not applicable\.?$/i.test(line) && !/^no worked solution is shown/i.test(line) && !/^record the response silently/i.test(line))
        .forEach((line) => assertNarrationBeatAssets(line, `FRA-01 ${question.id}`));
    });

    const t01 = renderModelVisual(spec, model, { nodeId: "T01" });
    assert(t01.querySelector(".fair-turns-story"), "FRA-01 T01 did not render the lesson-specific fair-turns hook");
    assert(t01.querySelectorAll(".session-turn").length === 4, "FRA-01 T01 did not show four learner turns");

    const t02 = renderModelVisual(spec, model, { nodeId: "T02" });
    assert(t02.querySelectorAll(".story-cell").length === 4, "FRA-01 T02 did not show four equal parts");
    assert(t02.querySelectorAll(".story-cell.is-target").length === 1, "FRA-01 T02 did not identify one quarter for the narration cue");
    assert(t02.querySelectorAll(".set-model").length === 0, "FRA-01 T02 incorrectly rendered a set model");

    const t04 = renderModelVisual(spec, model, { nodeId: "T04" });
    assert(t04.querySelectorAll(".story-cell").length === 6, "FRA-01 T04 did not retain six equal parts");
    assert(t04.querySelector(".denominator-vocabulary"), "FRA-01 T04 did not connect the denominator to the six parts");

    const t05 = renderModelVisual(spec, model, { nodeId: "T05" });
    assert(t05.querySelectorAll(".story-cell").length === 4, "FRA-01 T05 did not show four equal parts");
    assert(t05.querySelectorAll(".story-cell.is-target").length === 3, "FRA-01 T05 did not stage three parts for sequential selection");
    assert(!t05.querySelector(".story-cell.is-shaded"), "FRA-01 T05 showed selected parts before Ryan counted them");

    const t07 = renderModelVisual(spec, model, { nodeId: "T07" });
    assert(t07.querySelector(".routine-flow"), "FRA-01 T07 did not show the whole/equal-parts/selected-parts sequence");
    assert(t07.querySelector(".fraction-role-map"), "FRA-01 T07 did not map numerator and denominator roles");

    const t09 = renderModelVisual(spec, model, { nodeId: "T09" });
    assert(t09.querySelectorAll(".half-bar").length === 2, "FRA-01 T09 did not compare halves of two different wholes");
    assert(t09.querySelectorAll(".whole-fraction").length === 2, "FRA-01 T09 did not stage both one-half labels");

    const t08 = renderModelVisual(spec, model, { nodeId: "T08" });
    assert(t08.querySelector(".equal-parts-trap-story"), "FRA-01 T08 did not teach the equal-parts boundary visually");

    const c03Initial = renderModelVisual(spec, model, { questionId: "FRA-01-C03" });
    assert(c03Initial.querySelector(".single-unequal-model"), "FRA-01 C03 did not show the authored unequal regions");
    assert(!c03Initial.querySelector(".contrast-model"), "FRA-01 C03 revealed the valid comparison before support");
    const c03Support = renderModelVisual(spec, model, { questionId: "FRA-01-C03", feedback: "support" });
    assert(c03Support.querySelector(".contrast-model"), "FRA-01 C03 support did not contrast unequal and equal partitions");

    const expectedModels = [
      ["FRA-01-C01", ".fraction-cell", 6, 1],
      ["FRA-01-F01", ".counter", 12, 5],
      ["FRA-01-I01", ".counter.is-cupcake", 9, 7],
      ["FRA-01-P02", ".counter.is-tile", 8, 3],
      ["FRA-01-P03", ".fraction-cell", 12, 7],
      ["FRA-01-P05", ".fraction-cell", 10, 3],
      ["FRA-01-R02", ".counter", 6, 2]
    ];
    expectedModels.forEach(([questionId, selector, total, selected]) => {
      const host = renderModelVisual(spec, model, { questionId });
      assert(host.querySelectorAll(selector).length === total, `${questionId} visual showed the wrong whole`);
      assert(host.querySelectorAll(`${selector}.is-shaded`).length === selected, `${questionId} visual showed the wrong selected amount`);
    });

    const c01Hint = renderModelVisual(spec, model, { questionId: "FRA-01-C01", feedback: "hint" });
    const c01Support = renderModelVisual(spec, model, { questionId: "FRA-01-C01", feedback: "support" });
    assert(!c01Hint.querySelector(".fraction-role-map"), "FRA-01 first hint disclosed the completed fraction");
    assert(c01Support.querySelector(".fraction-role-map"), "FRA-01 worked support did not show numerator and denominator roles");

    const chocolate = renderModelVisual(spec, model, { questionId: "FRA-01-P03" });
    assert(chocolate.querySelector(".fraction-bar.is-chocolate"), "the chocolate context fell back to a generic bar");
    const ribbon = renderModelVisual(spec, model, { questionId: "FRA-01-P05" });
    assert(ribbon.querySelector(".fraction-bar.is-ribbon"), "the ribbon context fell back to a generic bar");
    const modelChoice = model.getQuestion("FRA-01-P01");
    const choiceHarness = createTestEngine(topic, spec, dialogue, "I03");
    assert(choiceHarness.host.querySelectorAll(".model-choice-card").length === 3, "symbol-to-visual transfer did not render three diagram choices");
    assert(choiceHarness.host.querySelectorAll(".model-choice-card .fraction-bar").length === 3, "symbol-to-visual choices were not diagrams");
    choiceHarness.engine.destroy();
    choiceHarness.host.remove();

    const referenced = new Set([
      ...Object.values(spec.lesson.transfer_steps).map((step) => step.question_ref),
      ...spec.lesson.exit.primary_question_refs,
      ...spec.lesson.exit.confirmation_question_refs,
      ...Object.values(spec.lesson.exit.repair_by_primary)
    ]);
    referenced.forEach((id) => assert(validateFractionQuestionModel(model.getQuestion(id)).length === 0, `${id} failed the canonical structured-model guard`));
    spec.question_bank.filter((question) => ["visual_to_symbol", "context_to_symbol"].includes(question.assessmentIntent)).forEach((question) => {
      assert(!/\b\d+\b/.test(question.prompt), `${question.id} leaks diagram counts in its scored prompt`);
    });

    const sceneHarness = createTestEngine(topic, spec, dialogue, "T04");
    assert(sceneHarness.host.textContent.includes("The bottom number"), "FRA-01 scene heading did not use the clear learner-facing title");
    assert(!sceneHarness.host.textContent.includes(model.getNode("T04").purpose), "FRA-01 exposed an internal scene purpose to the learner");
    assert(sceneHarness.host.querySelector(".canvas-caption-layer"), "FRA-01 did not render the on-canvas caption layer");
    assert(!sceneHarness.host.querySelector(".ryan-panel"), "FRA-01 still rendered the permanent narration bar");
    assert(sceneHarness.host.querySelector("#ryan-caption").textContent === "", "FRA-01 displayed the full narration before it was spoken");
    assert(!sceneHarness.host.querySelector("#developer-toggle"), "FRA-01 exposed developer controls on the student route");
    sceneHarness.engine.destroy();
    sceneHarness.host.remove();

    const restartHarness = createTestEngine(topic, spec, dialogue, "P03");
    restartHarness.engine.state.resolved["FRA-01-P01"] = "correct";
    let archivedAttempts = 0;
    restartHarness.engine.archiveAttempt = () => { archivedAttempts += 1; };
    restartHarness.engine.startAgain();
    assert(archivedAttempts === 1, "FRA-01 restart did not archive the previous attempt");
    assert(restartHarness.engine.state.cursor === "T01" && restartHarness.engine.state.started, "FRA-01 restart did not return to the first teaching scene");
    assert(Object.keys(restartHarness.engine.state.resolved).length === 0, "FRA-01 restart retained resolved answers in the new attempt");
    restartHarness.engine.destroy();
    restartHarness.host.remove();

    assert(!spec.completion.secure.ryan_script.includes("learned understand"), "FRA-01 secure completion contains a grammar error");
    assert(!spec.completion.needs_work.ryan_script.includes("progress with understand"), "FRA-01 needs-work completion contains a grammar error");

    assertFra01LearnerProfiles(spec, model, topic, dialogue);
  }

  function submitAndAdvance(engine, response) {
    const current = engine.current();
    submitEngineResponse(engine, response);
    engine.advance(current);
    return current;
  }

  function answerCurrentCorrectly(engine) {
    const current = engine.current();
    submitAndAdvance(engine, correctResponse(current.question));
    return current;
  }

  function assertFra01LearnerProfilesLegacy(spec, model, topic, dialogue) {
    const strong = createTestEngine(topic, spec, dialogue, "G01");
    ["G01", "G02", "F01"].forEach((expected) => {
      assert(strong.engine.current().id === expected, `Profile A expected ${expected}`);
      answerCurrentCorrectly(strong.engine);
    });
    assert(strong.engine.current().id === "I01", "Profile A did not skip redundant faded questions");
    answerCurrentCorrectly(strong.engine);
    answerCurrentCorrectly(strong.engine);
    assert(strong.engine.current().id === "E01", "Profile A did not reach the final check after two independent successes");
    strong.engine.destroy();
    strong.host.remove();

    const typical = createTestEngine(topic, spec, dialogue, "G01");
    const typicalFirst = typical.engine.current();
    submitEngineResponse(typical.engine, wrongResponse(typicalFirst.question));
    submitAndAdvance(typical.engine, correctResponse(typicalFirst.question));
    answerCurrentCorrectly(typical.engine);
    answerCurrentCorrectly(typical.engine);
    assert(typical.engine.current().id === "F02", "Profile B did not receive an additional faded item after a guided retry");
    answerCurrentCorrectly(typical.engine);
    assert(typical.engine.current().id === "I01", "Profile B did not progress after sufficient faded evidence");
    typical.engine.destroy();
    typical.host.remove();

    const struggling = createTestEngine(topic, spec, dialogue, "F01");
    const struggleNode = struggling.engine.current();
    const struggleWrong = wrongResponse(struggleNode.question);
    submitEngineResponse(struggling.engine, struggleWrong);
    submitEngineResponse(struggling.engine, struggleWrong);
    assert(struggling.engine.state.pendingRecovery?.recoveryId === "FRA-01-R01", "Profile C did not receive misconception-specific repair");
    struggling.engine.advance(struggleNode);
    assert(struggling.engine.current().recovery, "Profile C repair did not open");
    answerCurrentCorrectly(struggling.engine);
    assert(struggling.engine.current().id === "F02", "Profile C did not receive a fresh parallel question after repair");
    struggling.engine.destroy();
    struggling.host.remove();

    const lateFailure = createTestEngine(topic, spec, dialogue, "G01");
    answerCurrentCorrectly(lateFailure.engine);
    answerCurrentCorrectly(lateFailure.engine);
    answerCurrentCorrectly(lateFailure.engine);
    assert(lateFailure.engine.current().id === "I01", "Profile D setup did not reach independent work");
    const independent = lateFailure.engine.current();
    const independentWrong = wrongResponse(independent.question);
    submitEngineResponse(lateFailure.engine, independentWrong);
    submitEngineResponse(lateFailure.engine, independentWrong);
    lateFailure.engine.advance(independent);
    assert(lateFailure.engine.current().questionId === "FRA-01-R02", "Profile D did not diagnose the set-whole misconception");
    answerCurrentCorrectly(lateFailure.engine);
    answerCurrentCorrectly(lateFailure.engine);
    assert(lateFailure.engine.current().id === "I03", "Profile D incorrectly skipped the third independent check");
    lateFailure.engine.destroy();
    lateFailure.host.remove();

    const recovery = createTestEngine(topic, spec, dialogue, "E01");
    for (let index = 0; index < 3; index += 1) {
      const exitQuestion = recovery.engine.current();
      submitAndAdvance(recovery.engine, wrongResponse(exitQuestion.question));
    }
    assert(recovery.engine.current().recovery && recovery.engine.current().exitRepair, "Profile E did not enter final-check repair after low evidence");
    answerCurrentCorrectly(recovery.engine);
    assert(recovery.engine.current().confirmation, "Profile E did not receive a fresh retest after repair");
    answerCurrentCorrectly(recovery.engine);
    assert(recovery.engine.current().recovery, "Profile E did not repair the second missed idea");
    answerCurrentCorrectly(recovery.engine);
    answerCurrentCorrectly(recovery.engine);
    assert(recovery.engine.state.exit.result === "SECURE", "Profile E did not recover after two successful fresh checks");
    recovery.engine.destroy();
    recovery.host.remove();
  }

  function assertFra01VisualContract(spec, model, topic, dialogue) {
    assert(spec.canonical_lesson?.reference_for_future_lessons === true, "FRA-01 is not marked as the canonical reference lesson");
    assert(spec.canonical_lesson?.storyboard_version === "2.0", "FRA-01 did not load the approved storyboard v2 implementation");
    assert(spec.canonical_lesson?.objective === "Interpret a fraction as a number of equal parts of one whole or quantity.", "FRA-01 objective changed from the approved wording");
    assert(spec.canonical_lesson?.source_of_truth.includes("Revily_FRA01_Storyboard_v2.pdf"), "FRA-01 does not identify the approved PDF as its visual source of truth");
    assert(spec.voice_and_script.opening_mode === "authored_scene_only", "FRA-01 still uses the generic lesson opening");
    assert(spec.voice_and_script.narration_playback?.mode === "authored_audio_then_browser_speech", "FRA-01 does not prefer packaged Ryan narration");
    assert(spec.voice_and_script.narration_playback?.require_ryan_voice === true, "FRA-01 can fall back to a different narrator");
    assert(spec.voice_and_script.caption_presentation?.mode === "on_canvas_progressive", "FRA-01 captions are not progressive and on-canvas");
    assert(spec.voice_and_script.caption_presentation?.reveal === "word_by_word", "FRA-01 captions are not word synchronised");
    assert(speechBeats(model.getNode("HOOK-INTRO").narration).length === 3, "FRA-01 hook narration was not split into short caption beats");

    spec.lesson.teaching_steps.forEach((step) => assertNarrationBeatAssets(step.narration?.script, `FRA-01 ${step.id}`));
    Object.entries(spec.lesson.transfer_steps || {}).forEach(([id, step]) => assertNarrationBeatAssets(step.pre_question_script, `FRA-01 ${id}`));
    assertNarrationBeatAssets(spec.lesson.exit?.intro_script, "FRA-01 final-check intro");
    assertNarrationBeatAssets(spec.completion.secure.ryan_script, "FRA-01 secure completion");
    assertNarrationBeatAssets(spec.completion.needs_work.ryan_script, "FRA-01 needs-work completion");
    assertNarrationBeatAssets(spec.voice_and_script.runtime_narration_lines, "FRA-01 runtime narration");
    const spokenScriptKeys = [
      "before_submit", "on_correct_math", "on_incorrect_attempt_1", "on_incorrect_attempt_2",
      "on_correct_reaction", "on_incorrect_reaction", "engagement_response", "engagement_correct_response",
      "engagement_incorrect_response", "post_submit_correct", "post_submit_incorrect", "reteach",
      "whole_count", "selected_count", "option_B", "option_C"
    ];
    spec.question_bank.forEach((question) => {
      const scripts = spokenScriptKeys.flatMap((key) => {
        const value = question.scripts?.[key];
        return Array.isArray(value) ? value : [value];
      });
      const hints = [question.mathematical_support?.hint_1, question.mathematical_support?.hint_2];
      [...scripts, ...hints].filter((line) => typeof line === "string" && line.trim())
        .forEach((line) => assertNarrationBeatAssets(line, `FRA-01 ${question.id}`));
    });

    const hook = renderModelVisual(spec, model, { nodeId: "HOOK-INTRO" });
    assert(hook.querySelector(".fra01-hook .hook-bar-unequal"), "FRA-01 hook did not render the approved unequal chocolate split");
    const t1 = renderModelVisual(spec, model, { nodeId: "T1" });
    assert(t1.querySelectorAll(".fra01-piece").length === 4, "FRA-01 T1 did not use four equal chocolate parts");
    assert(t1.querySelectorAll(".fra01-piece.is-selected").length === 1, "FRA-01 T1 did not stage one fourth");
    const t2 = renderModelVisual(spec, model, { nodeId: "T2" });
    assert(t2.querySelector(".fra01-segmented.is-brownie_tray"), "FRA-01 T2 fell back to a generic bar instead of a brownie tray");
    assert(t2.querySelectorAll(".fra01-piece").length === 5 && t2.querySelectorAll(".fra01-piece.is-selected").length === 3, "FRA-01 T2 does not show three of five brownie pieces");
    const t3 = renderModelVisual(spec, model, { nodeId: "T3" });
    assert(t3.querySelectorAll(".fra01-token").length === 8 && t3.querySelectorAll(".fra01-token.is-selected").length === 3, "FRA-01 T3 does not show three of eight tokens");
    assert(t3.querySelector(".fra01-token-boundary.has-boundary"), "FRA-01 T3 does not identify the whole group");
    const t4 = renderModelVisual(spec, model, { nodeId: "T4" });
    assert(t4.querySelector(".fra01-handoff"), "FRA-01 T4 does not show the approved handoff routine");

    const expectedModels = [
      ["FRA-01-G2", ".fra01-cake-slice", 6, 2],
      ["FRA-01-F1", ".fra01-piece", 7, 3],
      ["FRA-01-F2", ".fra01-token", 8, 5],
      ["FRA-01-I1", ".fra01-piece", 10, 7],
      ["FRA-01-M1", ".fra01-piece", 9, 4],
      ["FRA-01-M2", ".fra01-token", 11, 6]
    ];
    expectedModels.forEach(([questionId, selector, total, selected]) => {
      const host = renderModelVisual(spec, model, { questionId });
      assert(host.querySelectorAll(selector).length === total, `${questionId} visual showed the wrong whole`);
      assert(host.querySelectorAll(`${selector}.is-selected`).length === selected, `${questionId} visual showed the wrong selected amount`);
    });
    const i1 = renderModelVisual(spec, model, { questionId: "FRA-01-I1" });
    assert(i1.querySelectorAll(".fra01-piece.is-eaten").length === 3, "FRA-01 I1 does not distinguish eaten chocolate from chocolate left");

    const guidedChoice = createTestEngine(topic, spec, dialogue, "G1");
    assert(guidedChoice.host.querySelectorAll(".model-choice-card").length === 2, "FRA-01 G1 did not render two cake choices");
    assert(guidedChoice.host.querySelectorAll(".model-choice-card .fra01-cake").length === 2, "FRA-01 G1 choices are not actual cake diagrams");
    assert(guidedChoice.host.querySelectorAll(".model-choice-card .fra01-cake-slice.is-selected").length === 0, "FRA-01 G1 still shows icing on the fair-split cakes");
    assert(!/icing/i.test(guidedChoice.engine.current().question.prompt + " " + guidedChoice.engine.current().question.scripts.before_submit), "FRA-01 G1 still tells the learner to ignore icing");
    guidedChoice.engine.destroy();
    guidedChoice.host.remove();
    const finalCakeChoice = createTestEngine(topic, spec, dialogue, "M3");
    assert(finalCakeChoice.host.querySelectorAll(".model-choice-card .fra01-cake-slice.is-selected").length === 0, "FRA-01 M3 brought the unrelated cake icing back in the final check");
    finalCakeChoice.engine.destroy();
    finalCakeChoice.host.remove();

    const hookCorrect = createTestEngine(topic, spec, dialogue, "HOOK");
    const correctHookNarration = [];
    hookCorrect.engine.startNarration = (lines) => correctHookNarration.push(...lines);
    submitEngineResponse(hookCorrect.engine, "No");
    assert(correctHookNarration[0]?.startsWith("You spotted it."), "FRA-01 opening did not acknowledge the correct fair-split judgement");
    const hookCorrectFeedback = hookCorrect.host.querySelector("#feedback-slot")?.textContent || "";
    hookCorrect.engine.destroy();
    hookCorrect.host.remove();

    const hookIncorrect = createTestEngine(topic, spec, dialogue, "HOOK");
    const incorrectHookNarration = [];
    hookIncorrect.engine.startNarration = (lines) => incorrectHookNarration.push(...lines);
    submitEngineResponse(hookIncorrect.engine, "Yes");
    assert(incorrectHookNarration[0]?.startsWith("Not quite."), "FRA-01 opening gave the correct-answer reaction after an incorrect judgement");
    assert(incorrectHookNarration[0] !== correctHookNarration[0], "FRA-01 opening still gives identical reactions for correct and incorrect responses");
    assert((hookIncorrect.host.querySelector("#feedback-slot")?.textContent || "") !== hookCorrectFeedback, "FRA-01 opening still shows identical feedback for correct and incorrect responses");
    hookIncorrect.engine.destroy();
    hookIncorrect.host.remove();

    const finalWorking = createTestEngine(topic, spec, dialogue, "M1");
    const finalNarration = [];
    finalWorking.engine.startNarration = (lines) => finalNarration.push(...lines);
    submitEngineResponse(finalWorking.engine, correctResponse(finalWorking.engine.current().question));
    const workingSteps = [...finalWorking.host.querySelectorAll(".worked-steps li")];
    assert(workingSteps.length === 3, "FRA-01 final working was not separated into three visible steps");
    assert(workingSteps.every((step, index) => step.querySelector(".worked-step-label")?.textContent === `Step ${index + 1}`), "FRA-01 final working does not label Step 1, Step 2 and Step 3 explicitly");
    assert(workingSteps.every((step, index) => step.style.getPropertyValue("--worked-step-index") === String(index)), "FRA-01 final working does not stage the three steps in sequence");
    assert(finalNarration.length === 1 && finalNarration[0] === "That matches the plank. Check the three steps on screen.", "FRA-01 Ryan still reads the worked calculation aloud after submission");
    assert(!finalNarration.includes(finalWorking.engine.current().question.scripts.worked_explanation), "FRA-01 worked explanation leaked into post-submit narration");
    assert(finalWorking.engine.narrationBeatGapMs() === 60 && finalWorking.engine.narrationAdvanceDelayMs() === 280, "FRA-01 still uses the long shared narration hand-off delays");
    finalWorking.engine.destroy();
    finalWorking.host.remove();

    assert(!spec.voice_and_script.runtime_narration_lines.some((line) => /^Wonderful\b/i.test(line)), "FRA-01 still relies on the repeated Wonderful final-check reaction");
    const independentChoice = createTestEngine(topic, spec, dialogue, "I2");
    assert(independentChoice.host.querySelectorAll(".model-choice-card").length === 3, "FRA-01 I2 did not render three strip choices");
    assert(independentChoice.host.querySelectorAll(".model-choice-card .fra01-segmented.is-strip").length === 3, "FRA-01 I2 choices are not strip diagrams");
    independentChoice.engine.destroy();
    independentChoice.host.remove();

    const referenced = new Set([
      ...Object.values(spec.lesson.transfer_steps).map((step) => step.question_ref),
      ...spec.lesson.exit.primary_question_refs,
      ...spec.lesson.exit.confirmation_question_refs,
      ...Object.values(spec.lesson.exit.repair_by_primary)
    ]);
    referenced.forEach((id) => assert(validateFractionQuestionModel(model.getQuestion(id)).length === 0, `${id} failed the canonical structured-model guard`));
    spec.question_bank.filter((question) => ["visual_to_fraction", "whole_set_to_fraction", "remaining_fraction_in_context", "final_visual_to_fraction", "final_whole_set"].includes(question.assessmentIntent)).forEach((question) => {
      assert(!/\b\d+\b/.test(question.prompt), `${question.id} leaks diagram counts in its scored prompt`);
    });

    const learnerFacingCopy = [
      ...spec.lesson.teaching_steps.flatMap((step) => [step.scene?.display_title, step.narration?.script]),
      ...spec.question_bank.flatMap((question) => [question.prompt, ...Object.values(question.scripts || {}), ...Object.values(question.mathematical_support || {})])
    ].flat().filter((value) => typeof value === "string").join(" ");
    assert(!/\b(?:numerator|denominator)\b/i.test(learnerFacingCopy), "FRA-01 introduces formal numerator/denominator vocabulary outside the approved scope");
    assert(!/\b(?:ribbon|cupcake)\b/i.test(learnerFacingCopy), "FRA-01 retained an unapproved generic ribbon or cupcake context");

    const sceneHarness = createTestEngine(topic, spec, dialogue, "T1");
    assert(sceneHarness.host.textContent.includes("Start with the whole"), "FRA-01 scene heading did not use the approved learner-facing title");
    assert(sceneHarness.host.querySelector(".canvas-caption-layer"), "FRA-01 did not render the on-canvas caption layer");
    assert(!sceneHarness.host.querySelector(".ryan-panel"), "FRA-01 still rendered the permanent narration bar");
    assert(sceneHarness.host.querySelector("#ryan-caption").textContent === "", "FRA-01 displayed the full narration before it was spoken");
    const emptyCaptionStyle = getComputedStyle(sceneHarness.host.querySelector("#ryan-caption"));
    assert(emptyCaptionStyle.visibility === "hidden" && emptyCaptionStyle.opacity === "0" && emptyCaptionStyle.backgroundColor === "rgba(0, 0, 0, 0)", "FRA-01 empty captions still leave a visible ghost box");
    assert(!sceneHarness.host.querySelector("#developer-toggle"), "FRA-01 exposed developer controls on the student route");
    sceneHarness.engine.destroy();
    sceneHarness.host.remove();

    const restartHarness = createTestEngine(topic, spec, dialogue, "I1");
    restartHarness.engine.state.resolved["FRA-01-G1"] = "correct";
    let archivedAttempts = 0;
    restartHarness.engine.archiveAttempt = () => { archivedAttempts += 1; };
    restartHarness.engine.startAgain();
    assert(archivedAttempts === 1, "FRA-01 restart did not archive the previous attempt");
    assert(restartHarness.engine.state.cursor === "HOOK-INTRO" && restartHarness.engine.state.started, "FRA-01 restart did not return to the approved opening hook");
    assert(Object.keys(restartHarness.engine.state.resolved).length === 0, "FRA-01 restart retained resolved answers in the new attempt");
    restartHarness.engine.destroy();
    restartHarness.host.remove();

    assertFra01LearnerProfiles(spec, model, topic, dialogue);
  }

  function assertFra01LearnerProfiles(spec, model, topic, dialogue) {
    const strong = createTestEngine(topic, spec, dialogue, "G1");
    answerCurrentCorrectly(strong.engine);
    assert(strong.engine.current().id === "G2", "Strong route did not move from G1 to G2");
    answerCurrentCorrectly(strong.engine);
    assert(strong.engine.current().id === "F2", "Two clean guided answers did not skip F1");
    answerCurrentCorrectly(strong.engine);
    answerCurrentCorrectly(strong.engine);
    answerCurrentCorrectly(strong.engine);
    assert(strong.engine.current().id === "M1", "Strong route did not reach the final check efficiently");
    strong.engine.destroy();
    strong.host.remove();

    const typical = createTestEngine(topic, spec, dialogue, "G1");
    const typicalFirst = typical.engine.current();
    submitEngineResponse(typical.engine, wrongResponse(typicalFirst.question));
    submitAndAdvance(typical.engine, correctResponse(typicalFirst.question));
    answerCurrentCorrectly(typical.engine);
    assert(typical.engine.current().id === "F1", "A guided retry incorrectly received the fast-route skip");
    typical.engine.destroy();
    typical.host.remove();

    const hinted = createTestEngine(topic, spec, dialogue, "I1");
    hinted.engine.state.evidence.hintOpened["FRA-01-I1"] = true;
    answerCurrentCorrectly(hinted.engine);
    answerCurrentCorrectly(hinted.engine);
    assert(hinted.engine.current().fresh, "Hint-assisted independent work did not trigger a fresh no-hint confirmation");
    assert(hinted.engine.current().question.policy.hintPolicy === "none", "Fresh confirmation still offers a hint");
    hinted.engine.destroy();
    hinted.host.remove();

    const repairCases = [
      ["G1", "Cake B", "FRA-01-R-EQUAL", "Equal-parts error"],
      ["F2", { n: "5", d: "5" }, "FRA-01-R-WHOLE", "Whole-identification error"],
      ["I1", { n: "3", d: "10" }, "FRA-01-R-CONTEXT", "Requested-part error"],
      ["F1", { n: "7", d: "3" }, "FRA-01-R-ORDER", "Order reversal"]
    ];
    repairCases.forEach(([nodeId, response, repairId, label]) => {
      const harness = createTestEngine(topic, spec, dialogue, nodeId);
      submitEngineResponse(harness.engine, response);
      submitEngineResponse(harness.engine, response);
      assert(harness.engine.state.pendingRecovery?.recoveryId === repairId, `${label} did not receive its targeted repair`);
      harness.engine.destroy();
      harness.host.remove();
    });

    const struggling = createTestEngine(topic, spec, dialogue, "F1");
    const struggleNode = struggling.engine.current();
    submitEngineResponse(struggling.engine, { n: "7", d: "3" });
    submitEngineResponse(struggling.engine, { n: "7", d: "3" });
    struggling.engine.advance(struggleNode);
    assert(struggling.engine.current().recovery && struggling.engine.current().kind === "scene", "Targeted repair did not open as a short narrated scene");
    const firstFreshId = struggling.engine.state.pendingRecovery.freshId;
    struggling.engine.advance(struggling.engine.current());
    assert(struggling.engine.current().fresh && struggling.engine.current().questionId === firstFreshId, "Repair did not lead to a fresh parallel question");
    struggling.engine.destroy();
    struggling.host.remove();

    const secure = createTestEngine(topic, spec, dialogue, "M1");
    for (let index = 0; index < 3; index += 1) {
      const finalQuestion = secure.engine.current();
      submitEngineResponse(secure.engine, correctResponse(finalQuestion.question));
      assert(secure.engine.root.querySelector(".worked-steps"), "Final answer did not reveal working immediately after the locked submit");
      const firstControl = secure.engine.root.querySelector("#answer-form input:not([type=hidden]), #answer-form button.choice-card");
      assert(firstControl?.disabled, "Final answer was not locked before working appeared");
      secure.engine.advance(finalQuestion);
    }
    assert(secure.engine.state.cursor === "COMPLETE", "Three of three final answers did not finish the lesson");
    secure.engine.destroy();
    secure.host.remove();

    const borderline = createTestEngine(topic, spec, dialogue, "M1");
    let finalNode = borderline.engine.current();
    submitAndAdvance(borderline.engine, wrongResponse(finalNode.question));
    finalNode = borderline.engine.current();
    submitAndAdvance(borderline.engine, correctResponse(finalNode.question));
    finalNode = borderline.engine.current();
    submitAndAdvance(borderline.engine, correctResponse(finalNode.question));
    assert(borderline.engine.current().confirmation, "Two of three final answers did not route to one targeted confirmation");
    borderline.engine.destroy();
    borderline.host.remove();

    const foundational = createTestEngine(topic, spec, dialogue, "M1");
    for (let index = 0; index < 3; index += 1) {
      const finalQuestion = foundational.engine.current();
      submitAndAdvance(foundational.engine, wrongResponse(finalQuestion.question));
    }
    assert(foundational.engine.current().recovery && foundational.engine.current().exitRepair, "Zero of three final answers did not route to targeted repair");
    foundational.engine.destroy();
    foundational.host.remove();
  }

  function assertFra02CanonicalContract(spec, model, topic, dialogue) {
    assert(spec.canonical_lesson?.storyboard_version === "1.0", "FRA-02 did not load the approved storyboard v1 implementation");
    assert(spec.canonical_lesson?.engine_profile === "fra02", "FRA-02 did not select its canonical engine profile");
    assert(spec.canonical_lesson?.source_of_truth.includes("Revily_FRA02_Storyboard_v1.pdf"), "FRA-02 does not identify the approved PDF as its visual source of truth");
    assert(spec.canonical_lesson?.objective === "Identify, name and interpret the numerator and denominator in a written or represented fraction.", "FRA-02 objective changed from the approved wording");
    assert(spec.diagnostic?.enabled === false && spec.diagnostic?.question_refs?.length === 0, "FRA-02 mounted the future diagnostic layer");
    assert(spec.lesson.practice.question_order.length === 0, "FRA-02 mounted a fixed retrieval or practice quota");
    assert(spec.voice_and_script.opening_mode === "authored_scene_only", "FRA-02 still uses the generic opening");
    assert(spec.voice_and_script.narration_playback?.voice_id === "en-GB-RyanNeural", "FRA-02 is not locked to Microsoft Ryan Neural");
    assert(spec.voice_and_script.narration_playback?.require_ryan_voice === true, "FRA-02 can fall back to a different narrator");
    assert(spec.voice_and_script.narration_playback?.opening_delay_ms === 0, "FRA-02 still adds an unnecessary opening pause");
    assert(spec.voice_and_script.caption_presentation?.mode === "on_canvas_progressive", "FRA-02 captions are not progressive and on-canvas");
    assert(spec.voice_and_script.caption_presentation?.reveal === "word_by_word", "FRA-02 captions are not word synchronised");
    assert(model.phaseLabel("guided") === "Try it with me" && model.phaseLabel("independent") === "Now you take over", "FRA-02 phase labels are not authored from the canonical specification");

    spec.lesson.teaching_steps.forEach((step) => assertNarrationBeatAssets(step.narration?.script, `FRA-02 ${step.id}`));
    Object.entries(spec.lesson.transfer_steps || {}).forEach(([id, step]) => assertNarrationBeatAssets(step.pre_question_script, `FRA-02 ${id}`));
    assertNarrationBeatAssets(spec.lesson.exit?.intro_script, "FRA-02 final-check intro");
    Object.entries(spec.lesson.adaptive_pathway?.feedback_by_error_family || {}).forEach(([family, line]) => assertNarrationBeatAssets(line, `FRA-02 ${family} feedback`));
    assertNarrationBeatAssets(spec.completion.secure.ryan_script, "FRA-02 secure completion");
    assertNarrationBeatAssets(spec.completion.needs_work.ryan_script, "FRA-02 needs-work completion");
    spec.question_bank.forEach((question) => {
      [question.scripts?.before_submit, question.scripts?.on_correct_math, question.scripts?.on_incorrect_attempt_1,
        question.scripts?.on_incorrect_attempt_2, question.scripts?.on_correct_reaction, question.scripts?.on_incorrect_reaction,
        question.scripts?.worked_explanation, question.scripts?.engagement_response, question.scripts?.reteach,
        question.scripts?.whole_count, question.scripts?.selected_count, question.scripts?.option_B, question.scripts?.option_C,
        question.mathematical_support?.hint_1, question.mathematical_support?.hint_2, question.mathematical_support?.worked_solution]
        .filter(Boolean)
        .forEach((line) => assertNarrationBeatAssets(line, `FRA-02 ${question.id}`));
    });

    assert(model.getNode("HOOK").narration.startsWith("Five of these twelve cinema seats are booked."), "FRA-02 hook narration changed from the approved opening");
    assert(model.getNode("T1").displayTitle === "The top number has a role", "FRA-02 T1 is not the numerator scene");
    assert(model.getNode("T2").displayTitle === "The bottom number defines the parts", "FRA-02 T2 is not the denominator scene");
    assert(model.getNode("T3").narration.includes("Three eighths"), "FRA-02 T3 lost its 3/8 connection");
    assert(model.getNode("T4").narration.includes("11 is still the numerator") && model.getNode("T4").narration.includes("6 is still the denominator"), "FRA-02 T4 lost the 11/6 role-invariance explanation");

    const hook = renderModelVisual(spec, model, { nodeId: "HOOK" });
    assert(hook.querySelectorAll(".fra02-seat").length === 12, "FRA-02 hook does not show twelve cinema seats");
    assert(hook.querySelectorAll(".fra02-seat.is-booked").length === 5, "FRA-02 hook does not show exactly five booked seats");
    assert(hook.querySelectorAll(".fra02-hook-fractions .fra02-fraction").length === 2, "FRA-02 hook does not stage the 5/12 to 12/5 swap");
    const t3 = renderModelVisual(spec, model, { nodeId: "T3" });
    assert(t3.querySelectorAll(".fra02-cell").length === 8 && t3.querySelectorAll(".fra02-cell.is-selected").length === 3, "FRA-02 T3 does not show three of eight chocolate pieces");
    const t4 = renderModelVisual(spec, model, { nodeId: "T4" });
    assert(t4.querySelectorAll(".fra02-whole-row").length === 2, "FRA-02 T4 does not show 11 sixths across two wholes");
    assert(t4.querySelectorAll(".fra02-cell.is-selected").length === 11, "FRA-02 T4 does not count eleven sixth-sized parts");
    const visualCounts = [
      ["FRA-02-G1", ".fra02-cell", 9, ".fra02-cell.is-selected", 4],
      ["FRA-02-G2", ".fra02-cell", 8, ".fra02-cell.is-selected", 3],
      ["FRA-02-F1", ".fra02-cell", 9, ".fra02-cell.is-selected", 5],
      ["FRA-02-I1", ".fra02-cell", 10, ".fra02-cell.is-selected", 4],
      ["FRA-02-M2", ".fra02-cell", 14, ".fra02-cell.is-selected", 5],
      ["FRA-02-M3", ".fra02-token", 13, ".fra02-token.is-selected", 10],
      ["FRA-02-R-SWAP", ".fra02-cell", 8, ".fra02-cell.is-selected", 3],
      ["FRA-02-R-TARGET", ".fra02-token", 8, ".fra02-token.is-selected", 3],
      ["FRA-02-R-DENOM", ".fra02-cell", 9, ".fra02-cell.is-selected", 4]
    ];
    visualCounts.forEach(([questionId, allSelector, allCount, selectedSelector, selectedCount]) => {
      const visual = renderModelVisual(spec, model, { questionId });
      assert(visual.querySelectorAll(allSelector).length === allCount, `${questionId} renders the wrong total count`);
      assert(visual.querySelectorAll(selectedSelector).length === selectedCount, `${questionId} renders the wrong selected count`);
    });
    [["FRA-02-F2", "5", "12"], ["FRA-02-I2", "11", "6"], ["FRA-02-M1", "8", "17"], ["FRA-02-M4", "9", "4"]].forEach(([questionId, numerator, denominator]) => {
      const visual = renderModelVisual(spec, model, { questionId });
      assert(visual.querySelector(".fra02-numerator")?.textContent === numerator && visual.querySelector(".fra02-denominator")?.textContent === denominator, `${questionId} renders the wrong written fraction`);
    });
    assert(model.getNode("T1").visual.syncCues.some((cue) => cue.action === "show_numerator"), "FRA-02 T1 has no speech-led numerator reveal cue");
    assert(model.getNode("T2").visual.syncCues.some((cue) => cue.action === "focus_whole") && model.getNode("T2").visual.syncCues.some((cue) => cue.action === "show_denominator"), "FRA-02 T2 has no whole-focus and denominator reveal cues");

    const fixed = createTestEngine(topic, spec, dialogue, "F1");
    assert(fixed.host.querySelectorAll(".fixed-fraction-builder input").length === 1, "FRA-02 fixed-field builder exposes more than one editable input");
    assert(fixed.host.querySelector(".fixed-fraction-value")?.textContent === "9", "FRA-02 F1 does not keep the denominator 9 fixed");
    assert(fixed.host.textContent.includes("Only the open field can be changed"), "FRA-02 fixed-field builder does not explain its single editable field");
    fixed.engine.destroy();
    fixed.host.remove();

    const detail = createTestEngine(topic, spec, dialogue, "F2");
    assert(detail.host.querySelector(".question-detail")?.textContent === "What does the 12 tell you?", "FRA-02 did not render the approved supporting question line");
    detail.engine.destroy();
    detail.host.remove();

    const g1Question = model.getQuestion("FRA-02-G1");
    assert(g1Question.prompt === "Which number counts the selected parts?", "FRA-02 G1 names the numerator before the learner has connected the selected-part meaning");
    assert(!/numerator/i.test(g1Question.scripts.before_submit), "FRA-02 G1 narration names the numerator before the learner responds");
    assert(/numerator/i.test(g1Question.scripts.on_correct_math), "FRA-02 G1 does not name the numerator after a correct selected-part response");

    ["F1", "F2", "I1", "I2"].forEach((id) => {
      const script = spec.lesson.transfer_steps[id]?.pre_question_script || "";
      assert(script.length > 0 && /hint/i.test(script), `FRA-02 ${id} has no authored Ryan handoff or hint invitation`);
      assert(model.getNode(id).narration === script, `FRA-02 ${id} did not wire its authored handoff into the lesson node`);
    });

    const learnerSuccessIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const learnerSuccessReactions = learnerSuccessIds.map((id) => model.getQuestion(`FRA-02-${id}`).scripts?.on_correct_reaction);
    assert(learnerSuccessReactions.every(Boolean), "FRA-02 has a guided, faded or independent question without authored encouragement");
    assert(new Set(learnerSuccessReactions).size === learnerSuccessReactions.length, "FRA-02 repeats learner encouragement across successive questions");
    assert(learnerSuccessReactions.every((line) => !/^Wonderful\b/i.test(line)), "FRA-02 learner encouragement still relies on the repeated Wonderful reaction");

    const learnerReactionHarness = createTestEngine(topic, spec, dialogue, "G1");
    let learnerReactionNode = learnerReactionHarness.engine.current();
    submitEngineResponse(learnerReactionHarness.engine, correctResponse(learnerReactionNode.question));
    assert(learnerReactionHarness.host.querySelector(".feedback-card")?.textContent.includes(learnerReactionNode.question.scripts.on_correct_reaction), "FRA-02 G1 did not display its authored encouragement");
    learnerReactionHarness.engine.advance(learnerReactionNode);
    learnerReactionNode = learnerReactionHarness.engine.current();
    submitEngineResponse(learnerReactionHarness.engine, correctResponse(learnerReactionNode.question));
    assert(learnerReactionHarness.host.querySelector(".feedback-card")?.textContent.includes(learnerReactionNode.question.scripts.on_correct_reaction), "FRA-02 G2 did not display its different authored encouragement");
    learnerReactionHarness.engine.destroy();
    learnerReactionHarness.host.remove();

    const concealedFreshVisual = renderModelVisual(spec, model, { questionId: "FRA-02-C-SWAP-1" });
    assert(!concealedFreshVisual.querySelector(".fra02-fraction"), "FRA-02 C-SWAP-1 shows 7/10 before asking the learner to build it");
    assert(!/7 over 10|numerator|denominator/i.test(concealedFreshVisual.getAttribute("aria-label") || ""), "FRA-02 C-SWAP-1 leaks its answer through the accessible visual description");
    const revealedFreshVisual = renderModelVisual(spec, model, { questionId: "FRA-02-C-SWAP-1", feedback: "correct" });
    assert(revealedFreshVisual.querySelector(".fra02-numerator")?.textContent === "7" && revealedFreshVisual.querySelector(".fra02-denominator")?.textContent === "10", "FRA-02 C-SWAP-1 does not reveal 7/10 after the answer is committed");

    const strong = createTestEngine(topic, spec, dialogue, "G1");
    answerCurrentCorrectly(strong.engine);
    answerCurrentCorrectly(strong.engine);
    assert(strong.engine.current().id === "F2", "Two clean FRA-02 guided successes did not skip F1");
    ["F2", "I1", "I2"].forEach((expected) => {
      assert(strong.engine.current().id === expected, `Strong FRA-02 route did not retain ${expected}`);
      answerCurrentCorrectly(strong.engine);
    });
    assert(strong.engine.current().id === "M1", "Strong FRA-02 route did not reach the four-item final check");
    for (let index = 0; index < 4; index += 1) answerCurrentCorrectly(strong.engine);
    assert(strong.engine.state.cursor === "COMPLETE" && strong.engine.state.exit.result === "SECURE", "Strong FRA-02 route did not finish with sufficient final evidence");
    strong.engine.destroy();
    strong.host.remove();

    const standard = createTestEngine(topic, spec, dialogue, "G1");
    const g1 = standard.engine.current();
    submitEngineResponse(standard.engine, wrongResponse(g1.question));
    submitAndAdvance(standard.engine, correctResponse(g1.question));
    answerCurrentCorrectly(standard.engine);
    assert(standard.engine.current().id === "F1", "A supported FRA-02 guided response incorrectly received the fast route");
    ["F1", "F2", "I1", "I2"].forEach((expected) => {
      assert(standard.engine.current().id === expected, `Standard FRA-02 route did not show ${expected}`);
      answerCurrentCorrectly(standard.engine);
    });
    assert(standard.engine.current().id === "M1", "Standard FRA-02 route did not reach M1-M4");
    standard.engine.destroy();
    standard.host.remove();

    const hinted = createTestEngine(topic, spec, dialogue, "I1");
    hinted.engine.state.evidence.hintOpened["FRA-02-I1"] = true;
    answerCurrentCorrectly(hinted.engine);
    answerCurrentCorrectly(hinted.engine);
    assert(hinted.engine.current().fresh, "Hint-assisted FRA-02 independent work did not trigger a fresh no-hint confirmation");
    assert(hinted.engine.current().question.policy.hintPolicy === "none", "FRA-02 fresh confirmation still offers a hint");
    hinted.engine.destroy();
    hinted.host.remove();

    const retryHinted = createTestEngine(topic, spec, dialogue, "I1");
    const retryIndependent = retryHinted.engine.current();
    submitEngineResponse(retryHinted.engine, wrongResponse(retryIndependent.question));
    retryHinted.engine.state.evidence.hintOpened["FRA-02-I1"] = true;
    submitAndAdvance(retryHinted.engine, correctResponse(retryIndependent.question));
    answerCurrentCorrectly(retryHinted.engine);
    assert(retryHinted.engine.current().fresh, "A FRA-02 hint opened after a first retry did not require fresh no-hint evidence");
    retryHinted.engine.destroy();
    retryHinted.host.remove();

    const repairCases = [
      ["I1", { n: "10", d: "4" }, "FRA-02-R-SWAP", "role swap"],
      ["I1", { n: "6", d: "10" }, "FRA-02-R-TARGET", "wrong target part"],
      ["G2", "3", "FRA-02-R-DENOM", "selected count used as denominator"],
      ["F1", "9", "FRA-02-R-FIELD", "fixed field changed"]
    ];
    repairCases.forEach(([nodeId, response, repairId, label]) => {
      const harness = createTestEngine(topic, spec, dialogue, nodeId);
      submitEngineResponse(harness.engine, response);
      submitEngineResponse(harness.engine, response);
      assert(harness.engine.state.pendingRecovery?.recoveryId === repairId, `FRA-02 ${label} did not receive its targeted repair`);
      assert(Boolean(harness.engine.state.pendingRecovery?.freshId), `FRA-02 ${label} repair did not prepare a fresh confirmation`);
      harness.engine.destroy();
      harness.host.remove();
    });

    const ambiguous = createTestEngine(topic, spec, dialogue, "G2");
    submitEngineResponse(ambiguous.engine, "4");
    submitEngineResponse(ambiguous.engine, "4");
    assert(!ambiguous.engine.state.pendingRecovery, "FRA-02 guessed a targeted repair for an ambiguous response");
    assert(!ambiguous.engine.state.resolved["FRA-02-G2"], "FRA-02 silently resolved an ambiguous incorrect response");
    assert(Boolean(ambiguous.host.querySelector("#integer-answer:not(:disabled)")), "FRA-02 disabled input instead of leaving an ambiguous response open");
    ambiguous.engine.destroy();
    ambiguous.host.remove();

    ["M1", "M2", "M3", "M4"].forEach((id) => {
      const question = model.getQuestion(`FRA-02-${id}`);
      assert(question.policy.hintPolicy === "none", `FRA-02 ${id} exposes a hint in the final check`);
      assert(question.policy.solutionPolicy === "after_locked_submit", `FRA-02 ${id} does not reveal working only after the answer locks`);
    });
    const finalReactionQuestions = spec.question_bank.filter((question) => question.policy?.solutionPolicy === "after_locked_submit");
    const finalReactions = finalReactionQuestions.map((question) => question.scripts?.on_correct_reaction).filter(Boolean);
    assert(finalReactions.length === finalReactionQuestions.length, "FRA-02 has a final or fresh-confirmation item without an authored success reaction");
    assert(new Set(finalReactions).size === finalReactions.length, "FRA-02 repeats a final-check success reaction");
    assert(finalReactions.every((reaction) => !/^Wonderful\b/i.test(reaction)), "FRA-02 still relies on the repeated Wonderful final-check reaction");
    assert(finalReactionQuestions.every((question) => question.scripts?.on_incorrect_reaction === "Not quite. Here’s the working — compare it with what you did."), "FRA-02 does not author the approved incorrect final-check reaction on every relevant item");

    const reactionHarness = createTestEngine(topic, spec, dialogue, "M1");
    let reactionNode = reactionHarness.engine.current();
    submitEngineResponse(reactionHarness.engine, correctResponse(reactionNode.question));
    assert(reactionHarness.host.querySelector(".feedback-card")?.textContent.includes(reactionNode.question.scripts.on_correct_reaction), "FRA-02 M1 did not display its authored success reaction");
    reactionHarness.engine.advance(reactionNode);
    reactionNode = reactionHarness.engine.current();
    submitEngineResponse(reactionHarness.engine, correctResponse(reactionNode.question));
    assert(reactionHarness.host.querySelector(".feedback-card")?.textContent.includes(reactionNode.question.scripts.on_correct_reaction), "FRA-02 M2 did not display its different authored success reaction");
    reactionHarness.engine.destroy();
    reactionHarness.host.remove();

    assert(!/\b8\b/.test(model.getQuestion("FRA-02-G2").scripts.before_submit), "FRA-02 G2 narration leaks the denominator count");
    assert(!/\b5\b/.test(model.getQuestion("FRA-02-F1").mathematical_support.hint_1), "FRA-02 F1 hint leaks the missing numerator");
    assert(!/whole is split into 12 equal parts/i.test(model.getQuestion("FRA-02-F2").mathematical_support.hint_1), "FRA-02 F2 hint repeats the correct option verbatim");
    assert(!/4\s*\/\s*10/.test(model.getQuestion("FRA-02-I1").mathematical_support.hint_1), "FRA-02 I1 hint leaks 4/10");
    assert(!/11 is the numerator/i.test(model.getQuestion("FRA-02-I2").mathematical_support.hint_1), "FRA-02 I2 hint states the correct option");

    const runFinal = (responses) => {
      const harness = createTestEngine(topic, spec, dialogue, "M1");
      responses.forEach((response, index) => {
        const current = harness.engine.current();
        submitEngineResponse(harness.engine, response === true ? correctResponse(current.question) : response === false ? wrongResponse(current.question) : response);
        assert(Boolean(harness.host.querySelector("#answer-form input:disabled, #answer-form button.choice-card:disabled")), `FRA-02 final item ${index + 1} did not lock its answer`);
        assert(harness.host.querySelector(".feedback-card")?.textContent.includes("working") || harness.host.querySelector(".feedback-card")?.textContent.includes("numerator") || harness.host.querySelector(".feedback-card")?.textContent.includes("denominator"), `FRA-02 final item ${index + 1} did not reveal worked feedback`);
        if (index < responses.length - 1) harness.engine.advance(current);
      });
      return harness;
    };

    const secureFour = runFinal([true, true, true, true]);
    assert(secureFour.engine.state.exit.result === "SECURE", "Four of four FRA-02 final answers did not produce SECURE");
    secureFour.engine.finishExit();
    assert(secureFour.engine.state.cursor === "COMPLETE", "Secure FRA-02 final did not reach completion");
    secureFour.engine.destroy();
    secureFour.host.remove();

    const secureThree = runFinal([false, true, true, true]);
    assert(secureThree.engine.state.exit.result === "SECURE", "Three of four varied FRA-02 final answers did not produce SECURE");
    secureThree.engine.destroy();
    secureThree.host.remove();

    const targetedTwo = runFinal([false, false, true, true]);
    assert(targetedTwo.engine.current().recovery && targetedTwo.engine.current().exitRepair, "Two of four FRA-02 final answers did not start targeted repair");
    assert(targetedTwo.engine.state.exit.remediation?.requiredSuccesses === 2, "FRA-02 two-correct route does not require a fresh two-item mini-check");
    for (let index = 0; index < 2; index += 1) {
      if (targetedTwo.engine.current().recovery) targetedTwo.engine.advance(targetedTwo.engine.current());
      assert(targetedTwo.engine.current().fresh, `FRA-02 two-correct route did not provide fresh item ${index + 1}`);
      answerCurrentCorrectly(targetedTwo.engine);
    }
    assert(targetedTwo.engine.state.cursor === "COMPLETE" && targetedTwo.engine.state.exit.result === "SECURE", "FRA-02 two-correct route did not complete after two fresh successes");
    targetedTwo.engine.destroy();
    targetedTwo.host.remove();

    const classifiedFinal = runFinal([true, true, { n: "3", d: "13" }, "C. Correct — the number of counted parts is always the denominator."]);
    assert(classifiedFinal.engine.current().questionId === "FRA-02-R-TARGET", "FRA-02 final repair ignored the demonstrated target-part error");
    classifiedFinal.engine.destroy();
    classifiedFinal.host.remove();

    const foundational = runFinal([false, false, false, true]);
    assert(foundational.engine.current().recovery && foundational.engine.current().exitRepair, "One of four FRA-02 final answers did not start repair");
    assert(foundational.engine.state.exit.remediation?.requiredSuccesses === 4, "FRA-02 zero-or-one-correct route does not require fresh final evidence");
    const foundationalRepairs = new Set();
    const foundationalFresh = new Set();
    for (let index = 0; index < 4; index += 1) {
      if (foundational.engine.current().recovery) {
        const repairId = foundational.engine.current().questionId;
        assert(!foundationalRepairs.has(repairId), `FRA-02 unnecessarily repeated ${repairId} between fresh successes`);
        foundationalRepairs.add(repairId);
        foundational.engine.advance(foundational.engine.current());
      }
      assert(foundational.engine.current().fresh, `FRA-02 foundational route did not provide fresh final item ${index + 1}`);
      assert(!foundationalFresh.has(foundational.engine.current().questionId), 'FRA-02 reused a recovery question as fresh evidence');
      foundationalFresh.add(foundational.engine.current().questionId);
      answerCurrentCorrectly(foundational.engine);
    }
    assert(foundationalFresh.size === 4 && foundationalRepairs.size > 0, 'FRA-02 foundational repair did not preserve four genuinely fresh checks');
    assert(foundational.engine.state.cursor === "COMPLETE" && foundational.engine.state.exit.result === "SECURE", "FRA-02 foundational route did not complete after four fresh successes");
    assert(foundational.host.querySelector('#start-again')?.getAttribute('aria-label') === 'Start again', 'FRA-02 completion restart loses its accessible name');
    assert(Boolean(foundational.host.querySelector('#sound-toggle')?.getAttribute('aria-label')), 'FRA-02 completion loses sound control');
    foundational.engine.destroy();
    foundational.host.remove();

    const repeated = createTestEngine(topic, spec, dialogue, "M1");
    repeated.engine.state.evidence.errorFamily["FRA-02-G1"] = "swap_roles";
    repeated.engine.state.evidence.errorFamily["FRA-02-I2"] = "swap_roles";
    for (let index = 0; index < 4; index += 1) {
      const current = repeated.engine.current();
      submitEngineResponse(repeated.engine, correctResponse(current.question));
      if (index < 3) repeated.engine.advance(current);
    }
    assert(!repeated.engine.state.exit.result && repeated.engine.current().exitRepair, "FRA-02 ignored a repeated central misconception at the mastery gate");
    repeated.engine.destroy();
    repeated.host.remove();

    const learnerPrompts = spec.question_bank.filter((question) => !question.policy?.reteachOnly).map((question) => `${question.prompt} ${question.questionDetail || ""}`).join(" ");
    assert(!/diagnostic|retrieval|mixed number|convert|classification/i.test(learnerPrompts), "FRA-02 exposes future-layer or out-of-scope language to learners");
    const fra02LearnerText = [
      ...spec.lesson.teaching_steps.flatMap((step) => [step.scene?.display_title, step.narration?.script]),
      ...Object.values(spec.lesson.transfer_steps || {}).map((step) => step.pre_question_script),
      ...spec.question_bank.flatMap((question) => [question.prompt, question.questionDetail, ...Object.values(question.scripts || {}), ...Object.values(question.mathematical_support || {})]),
      spec.completion.secure?.title, spec.completion.secure?.ryan_script,
      spec.completion.needs_work?.title, spec.completion.needs_work?.ryan_script,
      renderModelVisual(spec, model, { nodeId: "HANDOFF" }).textContent
    ].flat().filter(Boolean).join(" ");
    assert(!/\bjobs?\b/i.test(fra02LearnerText), "FRA-02 still exposes the mathematically imprecise word job to learners");
  }

  function assertFra03CanonicalContract(spec, model, topic, dialogue) {
    assert(spec.canonical_lesson?.version === "FRA03-2.0", "FRA-03 did not load the v2 canonical implementation");
    assert(spec.canonical_lesson?.engine_profile === "fra03", "FRA-03 did not select its canonical engine profile");
    assert(spec.canonical_lesson?.source_of_truth.includes("Revily_FRA03_Storyboard_v2.pdf"), "FRA-03 does not identify the approved v2 storyboard");
    assert(spec.canonical_lesson?.objective === "Represent the same fraction using area models, sets and number lines, and match a representation to its fraction.", "FRA-03 objective changed from the approved wording");
    assert(spec.diagnostic?.enabled === false && spec.diagnostic?.question_refs?.length === 0, "FRA-03 mounted a Diagnostic layer");
    assert(spec.lesson.practice.question_order.length === 0, "FRA-03 mounted a Retrieval or fixed-practice layer");
    assert(spec.voice_and_script.opening_mode === "authored_scene_only", "FRA-03 still uses the generic topic opening");
    assert(spec.voice_and_script.narration_playback?.voice_id === "en-GB-RyanNeural" && spec.voice_and_script.narration_playback?.require_ryan_voice === true, "FRA-03 is not locked to Ryan narration");
    assert(spec.voice_and_script.caption_presentation?.mode === "on_canvas_progressive" && spec.voice_and_script.caption_presentation?.reveal === "word_by_word", "FRA-03 captions are not progressive and word synchronised");
    assert(model.phaseLabel("guided") === "Try it with me" && model.phaseLabel("independent") === "Now you take over", "FRA-03 phase labels are not authored from the canonical specification");

    spec.lesson.teaching_steps.forEach((step) => assertNarrationBeatAssets(step.narration?.script, `FRA-03 ${step.id}`));
    Object.entries(spec.lesson.transfer_steps || {}).forEach(([id, step]) => assertNarrationBeatAssets(step.pre_question_script, `FRA-03 ${id}`));
    assertNarrationBeatAssets(spec.lesson.exit?.intro_script, "FRA-03 final-check intro");
    Object.entries(spec.lesson.adaptive_pathway?.feedback_by_error_family || {}).forEach(([family, line]) => assertNarrationBeatAssets(line, `FRA-03 ${family} feedback`));
    assertNarrationBeatAssets(spec.completion.secure.ryan_script, "FRA-03 secure completion");
    assertNarrationBeatAssets(spec.completion.needs_work.ryan_script, "FRA-03 needs-work completion");
    spec.question_bank.forEach((question) => {
      [question.scripts?.before_submit, question.scripts?.on_correct_math, question.scripts?.on_incorrect_attempt_1,
        question.scripts?.on_incorrect_attempt_2, question.scripts?.on_correct_reaction, question.scripts?.on_incorrect_reaction,
        question.scripts?.worked_explanation, question.scripts?.engagement_response, question.scripts?.reteach,
        question.scripts?.whole_count, question.scripts?.selected_count, question.scripts?.option_B, question.scripts?.option_C,
        ...Object.values(question.scripts?.response_feedback || {}),
        question.mathematical_support?.hint_1, question.mathematical_support?.hint_2, question.mathematical_support?.worked_solution]
        .filter(Boolean)
        .forEach((line) => assertNarrationBeatAssets(line, `FRA-03 ${question.id}`));
    });

    assert(model.getNode("HOOK").narration.startsWith("You’ve finished three of five challenges"), "FRA-03 v2 game-progress hook narration changed");
    assert(model.getNode("HOOK-ASK")?.kind === "question", "FRA-03 hook does not pause for the approved engagement choice");
    assert(model.getNode("T1").narration.includes("five equal tiles") && model.getNode("T1").narration.includes("three fifths"), "FRA-03 T1 lost the 3/5 progress-area explanation");
    assert(model.getNode("T2").narration.includes("five challenge badges") && model.getNode("T2").narration.includes("three fifths"), "FRA-03 T2 lost the 3/5 set-model explanation");
    assert(model.getNode("T3").narration.includes("five equal spaces") && model.getNode("T3").narration.includes("three spaces from zero"), "FRA-03 T3 lost the interval explanation");
    assert(model.getNode("T4").narration.includes("Keep four sevenths fixed") && model.getNode("T4").narration.includes("Different model; still four sevenths"), "FRA-03 T4 lost the v2 cross-model invariant");

    const hook = renderModelVisual(spec, model, { nodeId: "HOOK" });
    assert(hook.querySelector(".fra03-game-transform") && hook.querySelectorAll(".fra03-game-layer").length === 4, "FRA-03 hook does not provide the approved continuous game-progress transformation");
    const t1 = renderModelVisual(spec, model, { nodeId: "T1" });
    assert(t1.querySelectorAll(".fra03-area-part").length === 5 && t1.querySelectorAll(".fra03-area-part.is-selected").length === 3, "FRA-03 T1 does not show 3/5");
    const t2 = renderModelVisual(spec, model, { nodeId: "T2" });
    assert(t2.querySelectorAll(".fra03-token").length === 5 && t2.querySelectorAll(".fra03-token.is-selected").length === 3, "FRA-03 T2 does not show 3/5");
    assert(t2.querySelector(".fra03-set-boundary"), "FRA-03 T2 does not visibly define the whole set");
    const t3 = renderModelVisual(spec, model, { nodeId: "T3" });
    assert(t3.querySelectorAll(".fra03-interval").length === 5 && t3.querySelectorAll(".fra03-tick").length === 6, "FRA-03 T3 does not distinguish five intervals from six ticks");
    assert(model.getNode("T1").visual.syncCues.some((cue) => cue.action === "show_partitions") && model.getNode("T3").visual.syncCues.some((cue) => cue.action === "band_intervals"), "FRA-03 teaching visuals are not speech-led");

    const g1 = model.getQuestion("FRA-03-G1");
    assert(g1.response.optionModels.length === 3, "FRA-03 G1 does not have three authored model choices");
    assert(g1.response.optionModels[1].unequalParts === true && g1.response.optionModels[2].totalParts === 6, "FRA-03 G1 distractors do not encode unequal area and wrong partition counts");
    const g1Harness = createTestEngine(topic, spec, dialogue, "G1");
    assert(g1Harness.host.querySelectorAll(".model-choice-card").length === 3, "FRA-03 G1 model choices did not render as answer controls");
    assert(g1Harness.host.querySelectorAll(".model-choice-card .fra03-area-part").length === 16, "FRA-03 G1 model-choice counts do not match 5, 5 and 6 parts");
    g1Harness.engine.destroy();
    g1Harness.host.remove();

    const i1Harness = createTestEngine(topic, spec, dialogue, "I1");
    assert(i1Harness.host.querySelectorAll(".multi-choice-card").length === 5, "FRA-03 I1 does not render five independently selectable model cards");
    const i1First = i1Harness.host.querySelector(".multi-choice-card");
    i1First.click();
    assert(i1First.getAttribute("aria-pressed") === "true", "FRA-03 multi-select cards do not expose selection state");
    i1Harness.engine.destroy();
    i1Harness.host.remove();

    const i2Harness = createTestEngine(topic, spec, dialogue, "I2");
    assert(i2Harness.host.querySelectorAll(".set-builder-token").length === 8, "FRA-03 I2 does not keep all eight set objects visible");
    const builderToken = i2Harness.host.querySelector(".set-builder-token");
    builderToken.click();
    assert(builderToken.getAttribute("aria-pressed") === "true" && i2Harness.host.querySelector("#set-builder-count").textContent === "1 selected", "FRA-03 set builder does not preserve accessible selected state");
    i2Harness.engine.destroy();
    i2Harness.host.remove();

    const strong = createTestEngine(topic, spec, dialogue, "G1");
    answerCurrentCorrectly(strong.engine);
    answerCurrentCorrectly(strong.engine);
    assert(strong.engine.current().id === "F2", "Two clean FRA-03 guided successes did not skip F1");
    ["F2", "I1", "I2"].forEach((expected) => {
      assert(strong.engine.current().id === expected, `Strong FRA-03 route did not retain ${expected}`);
      answerCurrentCorrectly(strong.engine);
    });
    assert(strong.engine.current().id === "M1", "Strong FRA-03 route did not reach M1-M4");
    for (let index = 0; index < 4; index += 1) answerCurrentCorrectly(strong.engine);
    assert(strong.engine.state.cursor === "COMPLETE" && strong.engine.state.exit.result === "SECURE", "Strong FRA-03 route did not finish securely");
    strong.engine.destroy();
    strong.host.remove();

    const standard = createTestEngine(topic, spec, dialogue, "G1");
    const standardG1 = standard.engine.current();
    submitEngineResponse(standard.engine, "B");
    submitAndAdvance(standard.engine, correctResponse(standardG1.question));
    answerCurrentCorrectly(standard.engine);
    assert(standard.engine.current().id === "F1", "A supported FRA-03 guided response incorrectly received the fast route");
    ["F1", "F2", "I1", "I2"].forEach((expected) => {
      assert(standard.engine.current().id === expected, `Standard FRA-03 route did not show ${expected}`);
      answerCurrentCorrectly(standard.engine);
    });
    assert(standard.engine.current().id === "M1", "Standard FRA-03 route did not reach the final check");
    standard.engine.destroy();
    standard.host.remove();

    const hinted = createTestEngine(topic, spec, dialogue, "I1");
    hinted.engine.state.evidence.hintOpened["FRA-03-I1"] = true;
    answerCurrentCorrectly(hinted.engine);
    answerCurrentCorrectly(hinted.engine);
    assert(hinted.engine.current().fresh && hinted.engine.current().questionId === "FRA-03-C-MATCH", "Hint-assisted FRA-03 model matching did not trigger a fresh no-hint confirmation");
    assert(hinted.engine.current().question.policy.hintPolicy === "none", "FRA-03 fresh confirmation still exposes a hint");
    hinted.engine.destroy();
    hinted.host.remove();

    const repairCases = [
      ["G1", "B", "FRA-03-R-AREA", "unequal-area response"],
      ["G2", "4/7", "FRA-03-R-INTERVAL", "tick-count response"],
      ["G1", "C", "FRA-03-R-SAME-FRACTION", "changed-fraction response"],
      ["I1", ["A", "C"], "FRA-03-R-WHOLE", "cropped-whole response"]
    ];
    repairCases.forEach(([nodeId, response, repairId, label]) => {
      const harness = createTestEngine(topic, spec, dialogue, nodeId);
      submitEngineResponse(harness.engine, response);
      submitEngineResponse(harness.engine, response);
      assert(harness.engine.state.pendingRecovery?.recoveryId === repairId, `FRA-03 ${label} did not receive its targeted repair`);
      assert(Boolean(harness.engine.state.pendingRecovery?.freshId), `FRA-03 ${label} did not prepare a fresh check`);
      harness.engine.destroy();
      harness.host.remove();
    });

    ["M1", "M2", "M3", "M4"].forEach((id) => {
      const question = model.getQuestion(`FRA-03-${id}`);
      assert(question.policy.hintPolicy === "none", `FRA-03 ${id} exposes a hint`);
      assert(question.policy.solutionPolicy === "after_locked_submit", `FRA-03 ${id} can reveal working before answer lock`);
    });
    const finalHarness = createTestEngine(topic, spec, dialogue, "M1");
    assert(!finalHarness.host.querySelector("#hint-toggle") && !finalHarness.host.querySelector(".feedback-card"), "FRA-03 M1 leaks support before submission");
    const finalNode = finalHarness.engine.current();
    submitEngineResponse(finalHarness.engine, correctResponse(finalNode.question));
    assert(Boolean(finalHarness.host.querySelector("#answer-form input:disabled")), "FRA-03 final answer did not lock before working appeared");
    assert(finalHarness.host.querySelector(".feedback-card")?.textContent.includes("10 equal parts"), "FRA-03 M1 did not show approved working after lock");
    finalHarness.engine.destroy();
    finalHarness.host.remove();

    const runFinal = (responses) => {
      const harness = createTestEngine(topic, spec, dialogue, "M1");
      responses.forEach((response, index) => {
        const current = harness.engine.current();
        submitEngineResponse(harness.engine, response === true ? correctResponse(current.question) : response === false ? wrongResponse(current.question) : response);
        assert(Boolean(harness.host.querySelector("#answer-form input:disabled, #answer-form button.choice-card:disabled")), `FRA-03 final item ${index + 1} did not lock its response`);
        if (index < responses.length - 1) harness.engine.advance(current);
      });
      return harness;
    };

    const secureThree = runFinal([false, true, true, true]);
    assert(secureThree.engine.state.exit.result === "SECURE", "Three of four varied FRA-03 final answers did not finish");
    secureThree.engine.destroy();
    secureThree.host.remove();

    const targetedTwo = runFinal([false, false, true, true]);
    assert(targetedTwo.engine.current().recovery && targetedTwo.engine.current().exitRepair, "Two of four FRA-03 final answers did not start targeted repair");
    assert(targetedTwo.engine.state.exit.remediation?.requiredSuccesses === 2, "FRA-03 two-correct route does not require two fresh successes");
    for (let index = 0; index < 2; index += 1) {
      targetedTwo.engine.advance(targetedTwo.engine.current());
      assert(targetedTwo.engine.current().fresh, `FRA-03 two-correct route did not present fresh item ${index + 1}`);
      answerCurrentCorrectly(targetedTwo.engine);
    }
    assert(targetedTwo.engine.state.cursor === "COMPLETE" && targetedTwo.engine.state.exit.result === "SECURE", "FRA-03 two-correct route did not finish after two fresh successes");
    targetedTwo.engine.destroy();
    targetedTwo.host.remove();

    const foundational = runFinal([false, false, false, true]);
    assert(foundational.engine.current().recovery && foundational.engine.current().exitRepair, "One of four FRA-03 final answers did not start repair");
    assert(foundational.engine.state.exit.remediation?.requiredSuccesses === 4, "FRA-03 zero-or-one route does not require four fresh successes");
    for (let index = 0; index < 4; index += 1) {
      if (foundational.engine.current().exitRepair) foundational.engine.advance(foundational.engine.current());
      assert(foundational.engine.current().fresh, `FRA-03 foundational route did not present fresh item ${index + 1}`);
      answerCurrentCorrectly(foundational.engine);
    }
    assert(foundational.engine.state.cursor === "COMPLETE" && foundational.engine.state.exit.result === "SECURE", "FRA-03 foundational route did not finish after four fresh successes");
    foundational.engine.destroy();
    foundational.host.remove();

    const repeated = createTestEngine(topic, spec, dialogue, "M1");
    repeated.engine.state.evidence.errorFamily["FRA-03-G2"] = "interval_count";
    repeated.engine.state.evidence.errorFamily["FRA-03-I1"] = "interval_count";
    for (let index = 0; index < 4; index += 1) answerCurrentCorrectly(repeated.engine);
    assert(!repeated.engine.state.exit.result && repeated.engine.current().exitRepair, "FRA-03 ignored a repeated central misconception at the mastery gate");
    repeated.engine.destroy();
    repeated.host.remove();

    const learnerCopy = [
      ...spec.question_bank.map((question) => `${question.prompt} ${question.questionDetail || ""}`),
      ...spec.lesson.teaching_steps.map((step) => `${step.scene?.display_title || ""} ${step.narration?.script || ""}`)
    ].join(" ");
    assert(!/diagnostic|retrieval|error family|misconception|assessment intent/i.test(learnerCopy), "FRA-03 exposes internal or future-layer language to learners");
    assert(!/simplif|equivalent fraction|mixed number|operation/i.test(learnerCopy), "FRA-03 leaks later fraction curriculum into learner-facing content");
    assert(model.getQuestion("FRA-03-F1").answer.value === "5/9" && model.getQuestion("FRA-03-F2").model.fraction.denominator === 7 && model.getQuestion("FRA-03-G2").answer.value === "4/6" && model.getQuestion("FRA-03-M1").answer.value === "7/10", "FRA-03 changed v2 representation-specific denominators");
  }

  function assertFra04CanonicalContract(spec, model, topic, dialogue) {
    assert(spec.canonical_lesson?.version === "FRA04-1.1", "FRA-04 did not load the canonical implementation");
    assert(spec.canonical_lesson?.engine_profile === "fra04", "FRA-04 did not select its canonical engine profile");
    assert(spec.canonical_lesson?.source_of_truth.includes("Revily_FRA04_Storyboard_v1.pdf"), "FRA-04 does not identify the approved storyboard");
    assert(spec.canonical_lesson?.objective === "Compare fractions with the same denominator or the same numerator using the meaning of the parts.", "FRA-04 objective changed from the approved wording");
    assert(spec.diagnostic?.enabled === false && spec.diagnostic?.question_refs?.length === 0, "FRA-04 mounted a diagnostic layer");
    assert(spec.lesson.practice.question_order.length === 0, "FRA-04 mounted a retrieval or fixed-practice layer");
    assert(spec.voice_and_script.opening_mode === "authored_scene_only", "FRA-04 still uses the generic topic opening");
    assert(spec.voice_and_script.narration_playback?.voice_id === "en-GB-RyanNeural", "FRA-04 is not locked to Ryan Neural");
    assert(spec.voice_and_script.caption_presentation?.mode === "on_canvas_progressive" && spec.voice_and_script.caption_presentation?.reveal === "word_by_word", "FRA-04 captions are not progressive and word synchronised");
    assert(model.phaseLabel("guided") === "Try it with me" && model.phaseLabel("independent") === "Now you take over", "FRA-04 phase labels changed from the canonical sequence");

    spec.lesson.teaching_steps.forEach((step) => assertNarrationBeatAssets(step.narration?.script, `FRA-04 ${step.id}`));
    Object.entries(spec.lesson.transfer_steps || {}).forEach(([id, step]) => assertNarrationBeatAssets(step.pre_question_script, `FRA-04 ${id}`));
    assertNarrationBeatAssets(spec.lesson.exit?.intro_script, "FRA-04 final-check intro");
    Object.entries(spec.lesson.adaptive_pathway?.feedback_by_error_family || {}).forEach(([family, line]) => assertNarrationBeatAssets(line, `FRA-04 ${family} feedback`));
    assertNarrationBeatAssets(spec.completion.secure.ryan_script, "FRA-04 secure completion");
    assertNarrationBeatAssets(spec.completion.needs_work.ryan_script, "FRA-04 needs-work completion");
    spec.question_bank.forEach((question) => {
      [question.scripts?.before_submit, question.scripts?.on_correct_math, question.scripts?.on_incorrect_attempt_1,
        question.scripts?.on_incorrect_attempt_2, question.scripts?.on_correct_reaction, question.scripts?.on_incorrect_reaction,
        question.scripts?.worked_explanation, question.scripts?.engagement_response, question.scripts?.reteach,
        ...Object.values(question.scripts?.engagement_response_by_value || {}),
        question.scripts?.whole_count, question.scripts?.selected_count, question.scripts?.option_B, question.scripts?.option_C,
        question.mathematical_support?.hint_1, question.mathematical_support?.hint_2, question.mathematical_support?.worked_solution]
        .filter(Boolean)
        .forEach((line) => assertNarrationBeatAssets(line, `FRA-04 ${question.id}`));
    });

    assert(model.getNode("HOOK").narration === "Both bars have three pieces selected. If I let you choose, would you rather have three quarters of a chocolate bar or three eighths?", "FRA-04 hook narration changed");
    assert(model.getNode("HOOK-CHOICE")?.kind === "question", "FRA-04 hook no longer pauses for the approved learner choice");
    const hookQuarterChoice = createTestEngine(topic, spec, dialogue, "HOOK-CHOICE");
    submitEngineResponse(hookQuarterChoice.engine, "Three quarters");
    const hookQuarterFeedback = hookQuarterChoice.host.querySelector(".feedback-card")?.textContent || "";
    assert(/three quarters is the greater amount/i.test(hookQuarterFeedback), "FRA-04 did not acknowledge the three-quarters opening choice");
    assert(!hookQuarterChoice.engine.state.evidence.errorFamily["FRA-04-HOOK-CHOICE"], "FRA-04 treated the three-quarters hook choice as misconception evidence");
    hookQuarterChoice.engine.destroy();
    hookQuarterChoice.host.remove();

    const hookEighthChoice = createTestEngine(topic, spec, dialogue, "HOOK-CHOICE");
    submitEngineResponse(hookEighthChoice.engine, "Three eighths");
    const hookEighthFeedback = hookEighthChoice.host.querySelector(".feedback-card")?.textContent || "";
    assert(/you chose three eighths/i.test(hookEighthFeedback) && /eighths are smaller than quarters/i.test(hookEighthFeedback), "FRA-04 did not explain the three-eighths opening choice");
    assert(hookEighthFeedback !== hookQuarterFeedback, "FRA-04 still gives both opening choices the same response");
    assert(!hookEighthChoice.engine.state.evidence.errorFamily["FRA-04-HOOK-CHOICE"], "FRA-04 treated the three-eighths hook choice as misconception evidence");
    hookEighthChoice.engine.destroy();
    hookEighthChoice.host.remove();
    assert(model.getNode("T1").narration.includes("pieces are the same size"), "FRA-04 T1 lost the same-denominator meaning");
    assert(model.getNode("T2").narration.includes("Thirds are bigger pieces than sevenths"), "FRA-04 T2 lost the same-numerator meaning");
    assert(model.getNode("T3").narration.includes("open side faces the larger fraction"), "FRA-04 T3 lost the comparison-symbol meaning");
    assert(model.getNode("T4").narration.includes("use equals"), "FRA-04 T4 lost equality as a third outcome");

    const hook = renderModelVisual(spec, model, { nodeId: "HOOK" });
    const hookBars = hook.querySelectorAll(".fra04-bar");
    assert(hookBars.length === 2, "FRA-04 hook does not show two whole chocolate bars");
    assert(hookBars[0].querySelectorAll(".fra04-piece").length === 4 && hookBars[1].querySelectorAll(".fra04-piece").length === 8, "FRA-04 hook partitions are not quarters and eighths");
    assert(hookBars[0].querySelectorAll(".fra04-piece.selected").length === 3 && hookBars[1].querySelectorAll(".fra04-piece.selected").length === 3, "FRA-04 hook does not preserve the same selected count");
    assert(hookBars[0].classList.contains("chocolate") && hookBars[1].classList.contains("chocolate"), "FRA-04 hook lost the approved chocolate context");

    const t1 = renderModelVisual(spec, model, { nodeId: "T1" });
    const t1Bars = t1.querySelectorAll(".fra04-bar");
    assert([...t1Bars].every((bar) => bar.querySelectorAll(".fra04-piece").length === 7), "FRA-04 same-denominator bars do not use identical seventh-sized pieces");
    assert(t1Bars[0].querySelectorAll(".fra04-piece.selected").length === 5 && t1Bars[1].querySelectorAll(".fra04-piece.selected").length === 3, "FRA-04 T1 selected counts are wrong");

    const t2 = renderModelVisual(spec, model, { nodeId: "T2" });
    const t2Bars = t2.querySelectorAll(".fra04-bar");
    assert(t2Bars[0].querySelectorAll(".fra04-piece").length === 3 && t2Bars[1].querySelectorAll(".fra04-piece").length === 7, "FRA-04 T2 does not contrast thirds and sevenths");
    assert([...t2Bars].every((bar) => bar.querySelectorAll(".fra04-piece.selected").length === 2), "FRA-04 T2 does not preserve the same numerator count");

    const t3 = renderModelVisual(spec, model, { nodeId: "T3" });
    assert(t3.querySelector(".fra04-symbol")?.textContent === ">", "FRA-04 T3 points the comparison symbol the wrong way");
    assert(t3.querySelector(".fra04-open-label") && t3.querySelector(".fra04-point-label"), "FRA-04 T3 does not label the open side and point");
    assert(t3.querySelector(".fra04-reverse")?.textContent.includes("<"), "FRA-04 T3 does not show the reversed-order symbol");
    const t4 = renderModelVisual(spec, model, { nodeId: "T4" });
    assert(t4.querySelector(".fra04-symbol")?.textContent === "=", "FRA-04 T4 does not visibly support equality");

    ["G1", "G2", "F1", "I1", "I2", "M1", "M2", "M3"].forEach((id) => {
      const question = model.getQuestion(`FRA-04-${id}`);
      const comparison = question.model;
      const crossLeft = BigInt(comparison.left.numerator) * BigInt(comparison.right.denominator);
      const crossRight = BigInt(comparison.right.numerator) * BigInt(comparison.left.denominator);
      const exact = crossLeft < crossRight ? "<" : crossLeft > crossRight ? ">" : "=";
      assert(exact === comparison.answer && exact === question.answer.value, `FRA-04 ${id} visual, validator and answer are not driven by one exact comparison`);
      assert(comparison.sameWholeSize === true, `FRA-04 ${id} does not explicitly preserve equal whole size`);
    });

    const initialM1 = renderModelVisual(spec, model, { questionId: "FRA-04-M1" });
    assert(initialM1.querySelectorAll(".fra04-bar").length === 0, "FRA-04 M1 leaks a fraction-bar solution before submit");
    assert(initialM1.getAttribute("aria-label") && !/greater than|less than|they are equal|displayed comparison/i.test(initialM1.getAttribute("aria-label")), "FRA-04 M1 accessible description leaks the conclusion");
    const initialM3 = renderModelVisual(spec, model, { questionId: "FRA-04-M3" });
    const m3 = model.getQuestion("FRA-04-M3");
    assert(m3.model.left.numerator === 6 && m3.model.left.denominator === 13 && m3.model.right.numerator === 12 && m3.model.right.denominator === 26, "FRA-04 M3 does not use the intended non-identical equivalent fractions");
    assert(m3.model.left.numerator !== m3.model.right.numerator && BigInt(m3.model.left.numerator) * BigInt(m3.model.right.denominator) === BigInt(m3.model.right.numerator) * BigInt(m3.model.left.denominator), "FRA-04 M3 equality pair is either identical or not equivalent");
    const m3Bars = initialM3.querySelectorAll(".fra04-bar");
    assert(m3Bars.length === 2, "FRA-04 explicitly visual equality item does not show two equal-amount bars");
    assert(m3Bars[0].querySelectorAll(".fra04-piece").length === 13 && m3Bars[1].querySelectorAll(".fra04-piece").length === 26, "FRA-04 M3 visual does not partition the equivalent fractions into thirteenths and twenty-sixths");
    assert(m3Bars[0].querySelectorAll(".fra04-piece.selected").length === 6 && m3Bars[1].querySelectorAll(".fra04-piece.selected").length === 12, "FRA-04 M3 visual does not show equivalent selected amounts");

    ["F1", "F2", "I1", "I2"].forEach((id) => {
      const harness = createTestEngine(topic, spec, dialogue, id);
      const question = harness.engine.current().question;
      const summary = harness.engine.workedSummary(question);
      const left = `${question.model.left.numerator}/${question.model.left.denominator}`;
      const right = `${question.model.right.numerator}/${question.model.right.denominator}`;
      assert(summary.includes(left) && summary.includes(right), `FRA-04 ${id} post-submit working does not explain its actual fraction pair`);
      assert(!/undefined|null|NaN/i.test(summary), `FRA-04 ${id} post-submit working contains an invalid placeholder`);
      harness.engine.destroy();
      harness.host.remove();
    });

    const strong = createTestEngine(topic, spec, dialogue, "G1");
    answerCurrentCorrectly(strong.engine);
    answerCurrentCorrectly(strong.engine);
    assert(strong.engine.current().id === "F2", "Two clean FRA-04 guided successes did not skip F1");
    ["F2", "I1", "I2"].forEach((expected) => {
      assert(strong.engine.current().id === expected, `Strong FRA-04 route did not retain ${expected}`);
      answerCurrentCorrectly(strong.engine);
    });
    assert(strong.engine.current().id === "M1", "Strong FRA-04 route did not reach M1-M4");
    for (let index = 0; index < 4; index += 1) answerCurrentCorrectly(strong.engine);
    assert(strong.engine.state.cursor === "COMPLETE" && strong.engine.state.exit.result === "SECURE", "Strong FRA-04 route did not finish securely");
    strong.engine.destroy();
    strong.host.remove();

    const standard = createTestEngine(topic, spec, dialogue, "G1");
    const standardG1 = standard.engine.current();
    submitEngineResponse(standard.engine, wrongResponse(standardG1.question));
    submitAndAdvance(standard.engine, correctResponse(standardG1.question));
    answerCurrentCorrectly(standard.engine);
    assert(standard.engine.current().id === "F1", "A supported FRA-04 guided response incorrectly received the fast route");
    ["F1", "F2", "I1", "I2"].forEach((expected) => {
      assert(standard.engine.current().id === expected, `Standard FRA-04 route did not show ${expected}`);
      answerCurrentCorrectly(standard.engine);
    });
    assert(standard.engine.current().id === "M1", "Standard FRA-04 route did not reach the final check");
    standard.engine.destroy();
    standard.host.remove();

    const hinted = createTestEngine(topic, spec, dialogue, "I1");
    hinted.engine.state.evidence.hintOpened["FRA-04-I1"] = true;
    answerCurrentCorrectly(hinted.engine);
    answerCurrentCorrectly(hinted.engine);
    assert(hinted.engine.current().fresh && hinted.engine.current().questionId === "FRA-04-C-SAME-DENOM-1", "FRA-04 hint-assisted work did not insert the matching no-hint confirmation");
    assert(hinted.engine.current().question.policy.hintPolicy === "none", "FRA-04 fresh confirmation exposes a hint");
    hinted.engine.destroy();
    hinted.host.remove();

    const repairCases = [
      ["G1", ">", "FRA-04-R-SAME-DENOM", "same-denominator reasoning"],
      ["G2", "<", "FRA-04-R-SAME-NUM", "same-numerator reasoning"],
      ["F2", "C. They are equal because both numerators are 5.", "FRA-04-R-EQUALITY", "repeated equality ignoring"]
    ];
    repairCases.forEach(([nodeId, response, repairId, label]) => {
      const harness = createTestEngine(topic, spec, dialogue, nodeId);
      submitEngineResponse(harness.engine, response);
      submitEngineResponse(harness.engine, response);
      assert(harness.engine.state.pendingRecovery?.recoveryId === repairId, `FRA-04 ${label} did not receive its targeted repair`);
      assert(Boolean(harness.engine.state.pendingRecovery?.freshId), `FRA-04 ${label} did not prepare a fresh check`);
      harness.engine.destroy();
      harness.host.remove();
    });

    const classificationHarness = createTestEngine(topic, spec, dialogue, "G1");
    const g1Question = classificationHarness.engine.current().question;
    assert(classificationHarness.engine.classifyMisconception(g1Question, ">") === "same_denominator", "FRA-04 guessed symbol-direction evidence from an ambiguous wrong sign");
    assert(classificationHarness.engine.classifyMisconception(g1Question, { value: ">", largerFractionIdentifiedCorrectly: true }) === "symbol_direction", "FRA-04 does not separate a verified magnitude judgement from symbol direction");
    assert(spec.lesson.adaptive_pathway.repair_by_error_family.symbol_direction === "FRA-04-R-SYMBOL", "FRA-04 verified symbol reversal does not map to R-SYMBOL");
    classificationHarness.engine.destroy();
    classificationHarness.host.remove();

    ["M1", "M2", "M3", "M4"].forEach((id) => {
      const question = model.getQuestion(`FRA-04-${id}`);
      assert(question.policy.hintPolicy === "none", `FRA-04 ${id} exposes a final hint`);
      assert(question.policy.solutionPolicy === "after_locked_submit", `FRA-04 ${id} can show working before answer lock`);
    });
    const finalQuestions = ["M1", "M2", "M3", "M4"].map((id) => model.getQuestion(`FRA-04-${id}`));
    assert(new Set(finalQuestions.map((question) => question.scripts.on_correct_reaction)).size === finalQuestions.length, "FRA-04 repeats the same correct reaction across the final check");
    assert(new Set(finalQuestions.map((question) => question.scripts.on_incorrect_reaction)).size === finalQuestions.length, "FRA-04 repeats the same incorrect reaction across the final check");
    const endingCopy = [...finalQuestions.flatMap((question) => [question.scripts.on_correct_reaction, question.scripts.on_incorrect_reaction]), spec.completion.secure.ryan_script].join(" ");
    assert(!/wonderful|nice work/i.test(endingCopy), "FRA-04 still repeats generic praise at the end");
    const finalHarness = createTestEngine(topic, spec, dialogue, "M1");
    assert(!finalHarness.host.querySelector("#hint-toggle"), "FRA-04 M1 renders Ask for a hint");
    const finalNode = finalHarness.engine.current();
    submitEngineResponse(finalHarness.engine, correctResponse(finalNode.question));
    assert(Boolean(finalHarness.host.querySelector("#answer-form button.choice-card:disabled")), "FRA-04 final answer did not lock before working");
    assert(finalHarness.host.querySelectorAll(".fra04-bar").length === 2, "FRA-04 final working did not reveal the aligned bars after lock");
    assert(finalHarness.host.querySelector(".feedback-card")?.textContent.includes("Nine tenths"), "FRA-04 final working did not use the committed comparison");
    finalHarness.engine.destroy();
    finalHarness.host.remove();

    const runFinal = (responses) => {
      const harness = createTestEngine(topic, spec, dialogue, "M1");
      responses.forEach((response, index) => {
        const current = harness.engine.current();
        submitEngineResponse(harness.engine, response ? correctResponse(current.question) : wrongResponse(current.question));
        if (index < responses.length - 1) harness.engine.advance(current);
      });
      return harness;
    };

    const secureThree = runFinal([false, true, true, true]);
    assert(secureThree.engine.state.exit.result === "SECURE", "Three of four FRA-04 final answers did not finish when no central misconception repeated");
    secureThree.engine.destroy();
    secureThree.host.remove();

    const targetedTwo = runFinal([false, false, true, true]);
    assert(targetedTwo.engine.current().recovery && targetedTwo.engine.current().exitRepair, "Two of four FRA-04 final answers did not start targeted repair");
    assert(targetedTwo.engine.state.exit.remediation?.requiredSuccesses === 2, "FRA-04 two-correct route does not require two fresh successes");
    for (let index = 0; index < 2; index += 1) {
      targetedTwo.engine.advance(targetedTwo.engine.current());
      assert(targetedTwo.engine.current().fresh, `FRA-04 two-correct route did not present fresh item ${index + 1}`);
      answerCurrentCorrectly(targetedTwo.engine);
    }
    assert(targetedTwo.engine.state.cursor === "COMPLETE" && targetedTwo.engine.state.exit.result === "SECURE", "FRA-04 two-correct route did not finish after two fresh successes");
    targetedTwo.engine.destroy();
    targetedTwo.host.remove();

    const foundational = runFinal([false, false, false, true]);
    assert(foundational.engine.current().recovery && foundational.engine.current().exitRepair, "One of four FRA-04 final answers did not start repair");
    assert(foundational.engine.state.exit.remediation?.requiredSuccesses === 4, "FRA-04 zero-or-one route does not require four fresh successes");
    for (let index = 0; index < 4; index += 1) {
      foundational.engine.advance(foundational.engine.current());
      assert(foundational.engine.current().fresh, `FRA-04 foundational route did not present fresh item ${index + 1}`);
      answerCurrentCorrectly(foundational.engine);
    }
    assert(foundational.engine.state.cursor === "COMPLETE" && foundational.engine.state.exit.result === "SECURE", "FRA-04 foundational route did not finish after four fresh successes");
    foundational.engine.destroy();
    foundational.host.remove();

    const repeated = createTestEngine(topic, spec, dialogue, "M1");
    repeated.engine.state.evidence.errorFamily["FRA-04-G2"] = "same_numerator";
    repeated.engine.state.evidence.errorFamily["FRA-04-I2"] = "same_numerator";
    for (let index = 0; index < 4; index += 1) answerCurrentCorrectly(repeated.engine);
    assert(!repeated.engine.state.exit.result && repeated.engine.current().exitRepair, "FRA-04 ignored a repeated central misconception at the mastery gate");
    repeated.engine.destroy();
    repeated.host.remove();

    const learnerCopy = [
      ...spec.question_bank.map((question) => `${question.prompt} ${question.questionDetail || ""}`),
      ...spec.lesson.teaching_steps.map((step) => `${step.scene?.display_title || ""} ${step.narration?.script || ""}`)
    ].join(" ");
    assert(!/diagnostic|retrieval|FRA-16|error family|misconception|assessment intent/i.test(learnerCopy), "FRA-04 exposes internal or future-layer language to learners");
    assert(!/crocodile|alligator/i.test(learnerCopy), "FRA-04 introduced a forbidden symbol mnemonic");
    assert(!/bigger denominator means bigger fraction/i.test(learnerCopy), "FRA-04 states the denominator misconception as a rule");
  }

  async function assertFra01ResponsiveFrames() {
    localStorage.removeItem("revily.fractions.FRA-01.current.v1");
    for (const width of [390, 320]) {
      const frame = document.createElement("iframe");
      frame.title = `FRA01 responsive check at ${width} pixels`;
      frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:844px;border:0;`;
      document.body.appendChild(frame);
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error(`FRA-01 ${width}px responsive frame did not load`)), 15000);
        frame.addEventListener("load", () => window.setTimeout(() => {
          window.clearTimeout(timeout);
          resolve();
        }, 750), { once: true });
        frame.src = `../index.html?responsive-qa=${width}#/fractions/FRA-01`;
      });
      const frameDocument = frame.contentDocument;
      const startButton = [...(frameDocument?.querySelectorAll("button") || [])]
        .find((button) => button.textContent?.trim() === "Start lesson");
      if (startButton) {
        startButton.click();
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      assert(Boolean(frameDocument?.querySelector("#math-canvas")), `FRA-01 did not render at ${width}px`);
      const viewportWidth = frame.contentWindow.innerWidth;
      const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > viewportWidth + 2 || rect.left < -2;
      }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
      assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-01 has horizontal page overflow at ${width}px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
      const shellButtons = [...frameDocument.querySelectorAll(".topbar button, .lesson-footer button")];
      assert(shellButtons.every((button) => button.getBoundingClientRect().right <= viewportWidth + 2), `FRA-01 controls overflow at ${width}px`);
      frame.remove();
    }
  }

  async function assertFra02ResponsiveFrames() {
    localStorage.removeItem("revily.fractions.FRA-02.current.v1");
    for (const width of [390, 320]) {
      const frame = document.createElement("iframe");
      frame.title = `FRA02 responsive check at ${width} pixels`;
      frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:844px;border:0;`;
      document.body.appendChild(frame);
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error(`FRA-02 ${width}px responsive frame did not load`)), 5000);
        frame.addEventListener("load", () => window.setTimeout(() => {
          window.clearTimeout(timeout);
          resolve();
        }, 750), { once: true });
        frame.src = `../index.html?responsive-qa=${width}#/fractions/FRA-02`;
      });
      const frameDocument = frame.contentDocument;
      assert(Boolean(frameDocument?.querySelector("#math-canvas")), `FRA-02 did not render at ${width}px`);
      const viewportWidth = frame.contentWindow.innerWidth;
      const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > viewportWidth + 2 || rect.left < -2;
      }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
      assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-02 has horizontal page overflow at ${width}px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
      const shellButtons = [...frameDocument.querySelectorAll(".topbar button, .lesson-footer button")];
      assert(shellButtons.every((button) => button.getBoundingClientRect().right <= viewportWidth + 2), `FRA-02 controls overflow at ${width}px`);
      frame.remove();
    }
  }

  async function assertFra03ResponsiveFrames() {
    localStorage.removeItem("revily.fractions.FRA-03.current.v1");
    for (const width of [390, 320]) {
      const frame = document.createElement("iframe");
      frame.title = `FRA03 responsive check at ${width} pixels`;
      frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:844px;border:0;`;
      document.body.appendChild(frame);
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error(`FRA-03 ${width}px responsive frame did not load`)), 5000);
        frame.addEventListener("load", () => window.setTimeout(() => {
          window.clearTimeout(timeout);
          resolve();
        }, 750), { once: true });
        frame.src = `../index.html?responsive-qa=${width}#/fractions/FRA-03`;
      });
      const frameDocument = frame.contentDocument;
      assert(Boolean(frameDocument?.querySelector("#math-canvas")), `FRA-03 did not render at ${width}px`);
      const viewportWidth = frame.contentWindow.innerWidth;
      const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > viewportWidth + 2 || rect.left < -2;
      }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
      assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-03 has horizontal page overflow at ${width}px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
      const shellButtons = [...frameDocument.querySelectorAll(".topbar button, .lesson-footer button")];
      assert(shellButtons.every((button) => button.getBoundingClientRect().right <= viewportWidth + 2), `FRA-03 controls overflow at ${width}px`);
      frame.remove();
    }
  }

  function assertFra05CanonicalContract(spec, model, topic, dialogue) {
    assert(spec.identity.title === "Locate Fractions on a Number Line", "FRA-05 title is not the approved title");
    assert(spec.identity.status === "IMPLEMENTATION_CANDIDATE_READY_FOR_OWNER_REVIEW_V2", "FRA-05 status is not the v2 implementation candidate state");
    assert(spec.canonical_lesson.version === "FRA05-2.0", "FRA-05 did not register the v2 content/runtime version");
    assert(spec.canonical_lesson.engine_profile === "fra05", "FRA-05 did not register its canonical engine profile");
    assert(spec.voice_and_script.narration_playback?.require_ryan_voice === true, "FRA-05 permits a non-Ryan narrator");
    assert(spec.voice_and_script.narration_playback?.mode === "authored_audio_then_browser_speech", "FRA-05 is not configured to prefer authored Ryan audio");
    assert(spec.voice_and_script.caption_presentation?.mode === "on_canvas_progressive", "FRA-05 captions are not progressive and on-canvas");
    assert(spec.lesson.teaching_steps.map((step) => step.id).join("|") === "HOOK|HOOK-CHOICE|T1|T2|T3|T4|T5|HANDOFF", "FRA-05 teaching sequence differs from the approved storyboard");
    assert(spec.lesson.practice.question_order.length === 0, "FRA-05 retained quota-based practice");

    const registry = window.FRA05_RUNTIME_COPY;
    const runtimeTexts = new Set(Object.values(registry).map((entry) => entry.text));
    assert(Object.keys(registry).length === 123, "FRA-05 v2 runtime registry does not contain 123 utterances");
    assert(window.RevilyFra05Canonical.validateRuntimeContract().length === 0, "FRA-05 runtime/caption/cue contract failed");
    assert(new Set([...runtimeTexts].map((text) => text.toLowerCase())).size === runtimeTexts.size, "FRA-05 runtime registry contains duplicate speech");
    assert(Object.values(registry).every((entry) => entry.captionSource === "same_as_audio"), "FRA-05 captions do not share the audio source text");
    assert(Object.entries(registry).every(([id, entry]) => window.RevilyFra05NarrationAssets?.tracksByUtteranceId?.[id]?.text === entry.text), "FRA-05 utterance audio and caption text are not sourced from the same exact registry entry");
    const allCues = spec.lesson.teaching_steps.flatMap((step) => step.narration?.sync_cues || []);
    assert(allCues.length === 29, "FRA-05 does not expose all 29 v2 cue bindings");
    assert(allCues.every((cue) => registry[cue.utteranceId]?.text.toLowerCase().includes(cue.anchorText.toLowerCase())), "FRA-05 has an orphan or invented cue anchor");
    const registryWithoutCueSpeech = { ...registry };
    delete registryWithoutCueSpeech[allCues[0].utteranceId];
    assert(window.RevilyFra05Canonical.validateRuntimeContract(registryWithoutCueSpeech).length > 0, "FRA-05 cue validation did not fail after removing its utterance");

    const speakableQuestionKeys = ["before_submit", "on_correct_reaction", "on_incorrect_reaction", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_narration", "reteach"];
    const speakableLines = [
      ...spec.lesson.teaching_steps.flatMap((step) => step.narration?.script || []),
      ...spec.question_bank.flatMap((question) => speakableQuestionKeys.flatMap((key) => question.scripts?.[key] || [])),
      ...spec.question_bank.flatMap((question) => Object.values(question.scripts?.response_feedback || {})),
      ...spec.lesson.exit.intro_script,
      ...spec.completion.secure.ryan_script,
    ].flat(Infinity).filter(Boolean);
    assert(speakableLines.every((line) => runtimeTexts.has(normaliseNarrationText(line))), "FRA-05 sends non-registry text to Ryan");
    assert(!speakableLines.some((line) => /communicationGoal|authorOnly|assessment intent|render|storyboard/i.test(line)), "FRA-05 speakable lines contain authoring language");

    const hookWrongIds = window.RevilyFra05Canonical.getHookResponseSequence("four_fifths");
    const hookCorrectIds = window.RevilyFra05Canonical.getHookResponseSequence("three_quarters");
    assert(hookWrongIds[0] === "HOOK.FEEDBACK.FOUR_FIFTHS" && hookCorrectIds[0] === "HOOK.FEEDBACK.CORRECT", "FRA-05 hook does not branch honestly before reveal");
    assert(registry[hookWrongIds[0]].text !== registry[hookCorrectIds[0]].text, "FRA-05 hook choices share the same first response");
    assert(hookWrongIds.slice(1).join("|") === hookCorrectIds.slice(1).join("|"), "FRA-05 hook choices do not converge on the same reveal");

    [
      ["Four fifths", hookWrongIds],
      ["Three quarters", hookCorrectIds]
    ].forEach(([choice, expectedIds]) => {
      const harness = createTestEngine(topic, spec, dialogue, "HOOK-CHOICE");
      const spoken = [];
      harness.engine.startNarration = (lines) => spoken.push(...[lines].flat(Infinity).filter(Boolean));
      submitEngineResponse(harness.engine, choice);
      assert(spoken.join("|") === expectedIds.map((id) => registry[id].text).join("|"), `FRA-05 hook ${choice} did not play its exact branch then the common reveal`);
      const hookQuestion = harness.engine.model.getQuestion("FRA-05-HOOK-CHOICE");
      assert(hookQuestion.policy.engagementOnly === true && hookQuestion.policy.scored === false && harness.engine.state.exit.primaryScore === null, "FRA-05 hook choice affected mastery evidence");
      harness.engine.destroy(); harness.host.remove();
    });

    spec.question_bank.filter((question) => question.policy?.scored).forEach((question) => {
      const correctIds = window.RevilyFra05Canonical.selectOutcomeUtteranceIds(question, correctResponse(question), true);
      const wrong = wrongResponse(question);
      const incorrectIds = window.RevilyFra05Canonical.selectOutcomeUtteranceIds(question, wrong, false);
      assert(correctIds.length > 0 && incorrectIds.length > 0, `${question.id} lacks an outcome branch`);
      assert(correctIds.join("|") !== incorrectIds.join("|"), `${question.id} uses the same correct and incorrect branch`);
      assert(incorrectIds.every((id) => !correctIds.includes(id)), `${question.id} can play correct feedback for a wrong answer`);
      Object.values(question.runtimeOutcome?.errorSpecificUtteranceIdsByResponse || {}).forEach((ids) => {
        assert(ids.length > 0 && ids.every((id) => registry[id]), `${question.id} has invalid error-specific feedback`);
        assert(ids.every((id) => !correctIds.includes(id)), `${question.id} error-specific feedback matches correct feedback`);
      });
      Object.entries(question.runtimeOutcome?.errorSpecificUtteranceIdsByResponse || {}).forEach(([key, ids]) => {
        const response = question.response.type === "fraction"
          ? { n: key.split("/")[0], d: key.split("/")[1] }
          : key;
        assert(window.RevilyFra05Canonical.selectOutcomeUtteranceIds(question, response, false).join("|") === ids.join("|"), `${question.id} did not select its matching error-specific branch`);
      });
      const unknownWrong = question.response.type === "fraction" ? { n: "997", d: "991" } : "__unknown_wrong__";
      assert(window.RevilyFra05Canonical.selectOutcomeUtteranceIds(question, unknownWrong, false).join("|") === (question.runtimeOutcome?.incorrectDefaultUtteranceIds || []).join("|"), `${question.id} did not select its default incorrect branch for an unknown wrong response`);
      if (question.policy.solutionPolicy === "after_locked_submit") {
        assert(question.policy.answerLocksOnSubmit === true, `${question.id} can reveal working before answer lock`);
      }
    });
    const finalFeedback = ["M1", "M2", "M3", "M4"].flatMap((id) => {
      const question = model.getQuestion(`FRA-05-${id}`);
      return [question.scripts.on_correct_reaction, question.scripts.on_incorrect_reaction];
    });
    assert(new Set(finalFeedback).size === 8, "FRA-05 M1-M4 feedback is not item-specific");

    const migrationKey = "revily.fractions.FRA-05.current.v1";
    localStorage.setItem(migrationKey, JSON.stringify({ version: 1, contentVersion: "FRA05-1.0", topicId: "fractions", skillId: "FRA-05", cursor: "T4", soundOn: false }));
    const migrationHost = document.createElement("div");
    fixture.appendChild(migrationHost);
    const migratedEngine = new LessonEngine(migrationHost, spec, dialogue, { topic });
    assert(migratedEngine.state.cursor === "HOOK" && migratedEngine.state.contentVersion === "FRA05-2.0", "FRA-05 v1 state did not reset to the coherent v2 hook boundary");
    assert(migratedEngine.state.soundOn === false && migratedEngine.state.contentMigration?.from === "FRA05-1.0", "FRA-05 migration did not preserve the safe sound preference and record the migration");
    migratedEngine.destroy(); migrationHost.remove(); localStorage.removeItem(migrationKey);

    const resumeSeed = new LessonEngine(document.createElement("div"), spec, dialogue, { topic });
    const savedState = resumeSeed.freshState();
    savedState.started = true;
    savedState.cursor = "T1";
    savedState.soundOn = false;
    savedState.narrationResume = { active: true, cursor: "T1", utteranceIds: ["T1.2"], index: 0, elapsedMs: 425, action: "advance_current" };
    localStorage.setItem(migrationKey, JSON.stringify(savedState));
    const resumeHost = document.createElement("div");
    fixture.appendChild(resumeHost);
    const resumedEngine = new LessonEngine(resumeHost, spec, dialogue, { topic });
    resumedEngine.state.soundOn = false;
    let resumedCall = null;
    resumedEngine.startNarration = (lines, onDone, options) => { resumedCall = { lines: [lines].flat(Infinity), onDone, options }; };
    resumedEngine.mount();
    assert(Boolean(resumedCall), "FRA-05 did not recognise a valid persisted narration state");
    assert(resumedCall.lines.join("|") === registry["T1.2"].text && resumedCall.options.resumeAtMs === 425 && resumedCall.options.resumeAction === "advance_current", "FRA-05 resume did not restore matching utterance, caption/cue time and continuation action");
    resumedEngine.destroy(); resumeHost.remove(); localStorage.removeItem(migrationKey);

    const orphanHarness = createTestEngine(topic, spec, dialogue, "HOOK-CHOICE");
    const appliedCueIds = [];
    orphanHarness.engine.progressiveCaptions = true;
    orphanHarness.engine.narrationSync.complete = () => {};
    orphanHarness.engine.applyNarrationCue = (cue) => appliedCueIds.push(cue.id);
    orphanHarness.engine.stopNarration = () => { orphanHarness.engine.activeNarration = null; };
    orphanHarness.engine.activeNarration = { utteranceIds: hookCorrectIds, done: () => {} };
    orphanHarness.engine.skipNarration();
    assert(!appliedCueIds.includes("HOOK.CUE.2") && appliedCueIds.every((id) => id !== "HOOK.CUE.2"), "FRA-05 skip applied an orphan highlight from the unplayed hook branch");
    orphanHarness.engine.destroy(); orphanHarness.host.remove();

    const hook = renderModelVisual(spec, model, { nodeId: "HOOK" });
    assert(hook.querySelectorAll(".fra05-track-markers > span").length === 5, "FRA-05 hook does not show five boundary markers");
    assert(hook.querySelectorAll(".fra05-gap-bands > span").length === 4, "FRA-05 hook does not show four equal gaps");
    assert(hook.querySelector(".fra05-track-markers .has-runner"), "FRA-05 hook does not put the runner on the fourth marker");

    const t2 = renderModelVisual(spec, model, { nodeId: "T2" });
    assert(t2.querySelectorAll(".fra05-tick").length === 7, "FRA-05 T2 sixths line does not have seven boundary ticks");
    assert(t2.querySelectorAll(".fra05-bands > span").length === 6, "FRA-05 T2 sixths line does not have six intervals");

    const g1 = model.getQuestion("FRA-05-G1");
    const g2 = model.getQuestion("FRA-05-G2");
    assert(!/\b(?:five|5|six|6)\b/i.test(g1.scripts.before_submit), "FRA-05 G1 narration says the scored count before submit");
    assert(g2.response.type === "tick_selector" && g2.answer.value === "3", "FRA-05 G2 is not an exact tick selector for 3/7");
    assert(g2.model.denominator === 7 && g2.model.pointIndexFromZero === 3, "FRA-05 G2 model is not the approved seventh-sized line");

    const g2Harness = createTestEngine(topic, spec, dialogue, "G2");
    assert(g2Harness.host.querySelector("#tick-selector-slider[role=slider]"), "FRA-05 tick selector has no keyboard-accessible slider control");
    g2Harness.engine.setTickSelection(g2, 2);
    assert(g2Harness.engine.state.drafts[g2.id] === "2", "FRA-05 did not persist an unfinished point draft");
    g2Harness.engine.render();
    assert(g2Harness.host.querySelector("#tick-answer")?.value === "2", "FRA-05 did not restore its point draft");
    g2Harness.engine.destroy();
    g2Harness.host.remove();

    const strong = createTestEngine(topic, spec, dialogue, "G1");
    submitAndAdvance(strong.engine, correctResponse(strong.engine.current().question));
    submitAndAdvance(strong.engine, correctResponse(strong.engine.current().question));
    assert(strong.engine.state.cursor === "F2", "FRA-05 strong guided route did not skip F1 while keeping F2");
    strong.engine.destroy();
    strong.host.remove();

    const standard = createTestEngine(topic, spec, dialogue, "G1");
    submitEngineResponse(standard.engine, wrongResponse(standard.engine.current().question));
    assert(standard.engine.state.evidence.errorFamily["FRA-05-G1"] === "support_needed", "FRA-05 over-classified one ambiguous guided miss");
    submitAndAdvance(standard.engine, correctResponse(standard.engine.current().question));
    submitAndAdvance(standard.engine, correctResponse(standard.engine.current().question));
    assert(standard.engine.state.cursor === "F1", "FRA-05 standard guided route did not include F1");
    standard.engine.destroy();
    standard.host.remove();

    const f1 = model.getQuestion("FRA-05-F1");
    const f2 = model.getQuestion("FRA-05-F2");
    assert(f1.answer.value === "5/9" && f1.response.accept_equivalent_notation === false, "FRA-05 F1 does not preserve the representation-specific 5/9 answer");
    assert(f2.answer.value === "7/4" && f2.model.maxWhole === 2, "FRA-05 F2 is not the approved beyond-one exact read");
    const fallback = model.getQuestion("FRA-05-RF-INTERVAL-COUNT");
    assert(!validate(fallback, { n: "2", d: "3" }), "FRA-05 incorrectly simplifies the representation-specific recovery answer 4/6");

    const i1Hint = createTestEngine(topic, spec, dialogue, "I1");
    let hintNarrationCount = 0;
    i1Hint.engine.startNarration = () => { hintNarrationCount += 1; };
    i1Hint.host.querySelector("#hint-toggle")?.click();
    assert(hintNarrationCount === 0, "FRA-05 optional hint was automatically voiced");
    i1Hint.engine.state.evidence.hintOpened["FRA-05-I1"] = true;
    submitAndAdvance(i1Hint.engine, correctResponse(i1Hint.engine.current().question));
    assert(i1Hint.engine.state.cursor === "I2", "FRA-05 I1 did not continue to I2");
    submitAndAdvance(i1Hint.engine, correctResponse(i1Hint.engine.current().question));
    assert(i1Hint.engine.state.cursor === "FRESH:FRA-05-C-EXACT-HINT", "FRA-05 hint-assisted I1 did not insert the 5/6 no-hint confirmation");
    i1Hint.engine.destroy();
    i1Hint.host.remove();

    const i2Hint = createTestEngine(topic, spec, dialogue, "I2");
    i2Hint.engine.state.evidence.hintOpened["FRA-05-I2"] = true;
    submitAndAdvance(i2Hint.engine, correctResponse(i2Hint.engine.current().question));
    assert(i2Hint.engine.state.cursor === "FRESH:FRA-05-C-ANCHOR", "FRA-05 hint-assisted I2 did not insert its no-hint anchor confirmation");
    i2Hint.engine.destroy(); i2Hint.host.remove();

    const routeQuestionIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    Object.entries(spec.lesson.adaptive_pathway.repair_by_error_family).forEach(([family, repairId]) => {
      const sourceQuestion = routeQuestionIds.map((id) => model.getQuestion(`FRA-05-${id}`)).find((question) => {
        const maps = question?.errorClassification || {};
        return [maps.choiceFamilies, maps.integerFamilies, maps.fractionFamilies].some((map) => Object.values(map || {}).includes(family));
      });
      assert(Boolean(sourceQuestion), `FRA-05 ${family} has no scored source response for its repair route`);
      const maps = sourceQuestion.errorClassification || {};
      const pair = [maps.choiceFamilies, maps.integerFamilies, maps.fractionFamilies]
        .map((map) => Object.entries(map || {}).find(([, mappedFamily]) => mappedFamily === family))
        .find(Boolean);
      const responseKey = pair[0];
      const response = sourceQuestion.response.type === "fraction"
        ? { n: responseKey.split("/")[0], d: responseKey.split("/")[1] }
        : responseKey;
      const shortId = sourceQuestion.id.replace("FRA-05-", "");
      const harness = createTestEngine(topic, spec, dialogue, shortId);
      submitEngineResponse(harness.engine, response);
      submitEngineResponse(harness.engine, response);
      assert(harness.engine.state.pendingRecovery?.recoveryId === repairId, `FRA-05 ${family} repeated misconception did not select its matching repair`);
      harness.engine.advance(harness.engine.current());
      assert(harness.engine.current().recovery && harness.engine.current().questionId === repairId, `FRA-05 ${family} repair did not open`);
      const expectedFreshId = harness.engine.state.pendingRecovery?.freshId;
      harness.engine.advance(harness.engine.current());
      assert(harness.engine.current().fresh && harness.engine.current().questionId === expectedFreshId, `FRA-05 ${family} repair did not lead to its fresh check`);
      harness.engine.destroy(); harness.host.remove();
    });

    ["M1", "M2", "M3", "M4"].forEach((id) => {
      const question = model.getQuestion(`FRA-05-${id}`);
      assert(question.policy.hintPolicy === "none", `FRA-05 ${id} exposes a final-check hint`);
      assert(question.policy.solutionPolicy === "after_locked_submit", `FRA-05 ${id} does not lock the response before working`);
    });
    const m1Visual = renderModelVisual(spec, model, { questionId: "FRA-05-M1" });
    assert(!/3\s*(?:over|\/)\s*5/i.test(m1Visual.getAttribute("aria-label") || ""), "FRA-05 M1 accessible description leaks the inferred fraction");
    const m4Question = model.getQuestion("FRA-05-M4");
    assert(registry["M4.INCORRECT.DEFAULT"].text === "That estimate is off. Compare P with zero and one half before looking at the guide.", "FRA-05 M4 incorrect feedback does not use the zero and one-half anchors");
    assert(registry["M4.WORK.1"].text === "P is nearer to one half than to zero, so one fifth is too close to the start.", "FRA-05 M4 does not compare P with zero and one half");
    assert(registry["M4.WORK.2"].text === "Split the whole into thirds: P is almost on one third, so that is the best estimate.", "FRA-05 M4 does not justify the one-third estimate with equal thirds");
    assert(m4Question.scripts.worked_explanation.includes("1/5 sits much nearer 0") && m4Question.scripts.worked_explanation.includes("Divide the whole into 3 equal parts"), "FRA-05 M4 visible working does not show the requested comparison steps");
    const m4Before = renderModelVisual(spec, model, { questionId: "FRA-05-M4" });
    assert(!m4Before.querySelector(".fra05-estimate-comparisons"), "FRA-05 M4 reveals comparison fractions before answer lock");
    const m4After = renderModelVisual(spec, model, { questionId: "FRA-05-M4", feedback: "worked" });
    assert(m4After.querySelectorAll(".fra05-estimate-comparison").length === 2, "FRA-05 M4 locked working does not show both one fifth and one third");
    assert(m4After.querySelector(".fra05-estimate-comparison.is-best")?.textContent.includes("1/3"), "FRA-05 M4 does not mark one third as the best estimate");
    assert(/between 0 and one half/i.test(m4After.getAttribute("aria-label") || ""), "FRA-05 M4 accessible description places P on the wrong side of one half");

    const timingHarness = createTestEngine(topic, spec, dialogue, "T1");
    const captionLayer = timingHarness.host.querySelector(".fra05-caption-layer");
    assert(Boolean(captionLayer) && !captionLayer.classList.contains("has-caption-text"), "FRA-05 caption surface is visible before the first timed word");
    timingHarness.engine.updateProgressiveCaption({ text: registry["T1.2"].text, current: { start: 0, end: 4 } });
    assert(captionLayer.classList.contains("has-caption-text"), "FRA-05 caption surface does not appear with the first timed word");
    timingHarness.engine.updateProgressiveCaption({ text: "", current: null });
    assert(!captionLayer.classList.contains("has-caption-text"), "FRA-05 caption surface leaves a ghost after caption text clears");
    const preloadedSources = [];
    timingHarness.engine.state.soundOn = true;
    timingHarness.engine.preloadedNarrationAudio.clear();
    timingHarness.engine.createAudio = (src) => ({ src, load: () => preloadedSources.push(src), pause: () => {} });
    timingHarness.engine.primeUpcomingFra05Narration(timingHarness.engine.current());
    const t2FirstLine = model.getNode("T2").narration[0];
    assert(preloadedSources.includes(narrationAssets.tracks[t2FirstLine].src), "FRA-05 does not stage the next screen's Ryan audio before navigation");
    timingHarness.engine.destroy(); timingHarness.host.remove();

    const finalHarness = createTestEngine(topic, spec, dialogue, "M1");
    for (const id of ["M1", "M2", "M3", "M4"]) {
      assert(finalHarness.engine.current().id === id, `FRA-05 final route expected ${id}`);
      submitAndAdvance(finalHarness.engine, correctResponse(finalHarness.engine.current().question));
    }
    assert(finalHarness.engine.state.exit.result === "SECURE", "FRA-05 4/4 final result did not become SECURE");
    finalHarness.engine.destroy();
    finalHarness.host.remove();

    ["M1", "M2", "M3", "M4"].forEach((id) => {
      [true, false].forEach((correct) => {
        const harness = createTestEngine(topic, spec, dialogue, id);
        const queues = [];
        const callbacks = [];
        harness.engine.startNarration = (lines, onDone) => {
          queues.push([lines].flat(Infinity).filter(Boolean));
          if (onDone) callbacks.push(onDone);
        };
        const question = harness.engine.current().question;
        const response = correct ? correctResponse(question) : wrongResponse(question);
        const expectedIds = window.RevilyFra05Canonical.selectOutcomeUtteranceIds(question, response, correct);
        submitEngineResponse(harness.engine, response);
        assert(queues[0].join("|") === expectedIds.map((utteranceId) => registry[utteranceId].text).join("|"), `FRA-05 ${id} ${correct ? "correct" : "incorrect"} branch did not play exactly one canonical outcome`);
        assert(Boolean(harness.host.querySelector("#answer-form input:disabled, #answer-form button.choice-card:disabled")), `FRA-05 ${id} did not lock the answer before feedback`);
        assert(!harness.host.querySelector(".fra05-number-line.is-revealed"), `FRA-05 ${id} revealed the worked check before outcome narration completed`);
        assert(callbacks.length === 1, `FRA-05 ${id} did not stage its worked check after outcome feedback`);
        callbacks.shift()();
        assert(Boolean(harness.host.querySelector(".fra05-number-line.is-revealed")), `FRA-05 ${id} did not reveal its worked check after answer lock`);
        assert(queues[1].join("|") === [question.scripts.worked_narration].flat(Infinity).filter(Boolean).join("|"), `FRA-05 ${id} worked narration changed from the registry copy`);
        callbacks.shift()?.();
        assert(harness.engine.elements.primary.disabled === false, `FRA-05 ${id} did not enable Continue after the worked narration`);
        harness.engine.destroy(); harness.host.remove();
      });
    });

    const runFra05Final = (pattern) => {
      const harness = createTestEngine(topic, spec, dialogue, "M1");
      pattern.forEach((isCorrect, index) => {
        const current = harness.engine.current();
        submitEngineResponse(harness.engine, isCorrect ? correctResponse(current.question) : wrongResponse(current.question));
        if (index < pattern.length - 1) harness.engine.advance(current);
      });
      return harness;
    };
    const targetedFinal = runFra05Final([false, false, true, true]);
    assert(targetedFinal.engine.current().exitRepair && targetedFinal.engine.state.exit.remediation?.requiredSuccesses === 2, "FRA-05 2/4 route did not start targeted repair with two required fresh successes");
    for (let index = 0; index < 2; index += 1) {
      targetedFinal.engine.advance(targetedFinal.engine.current());
      assert(targetedFinal.engine.current().fresh, `FRA-05 2/4 route did not present fresh check ${index + 1}`);
      answerCurrentCorrectly(targetedFinal.engine);
    }
    assert(targetedFinal.engine.state.exit.result === "SECURE", "FRA-05 2/4 route did not finish after two fresh successes");
    targetedFinal.engine.destroy(); targetedFinal.host.remove();

    const foundationalFinal = runFra05Final([false, false, false, true]);
    assert(foundationalFinal.engine.current().exitRepair && foundationalFinal.engine.state.exit.remediation?.requiredSuccesses === 4, "FRA-05 0-1/4 route did not start repair with four required fresh successes");
    for (let index = 0; index < 4; index += 1) {
      foundationalFinal.engine.advance(foundationalFinal.engine.current());
      assert(foundationalFinal.engine.current().fresh, `FRA-05 0-1/4 route did not present fresh check ${index + 1}`);
      answerCurrentCorrectly(foundationalFinal.engine);
    }
    assert(foundationalFinal.engine.state.exit.result === "SECURE", "FRA-05 0-1/4 route did not finish after four fresh successes");
    foundationalFinal.engine.destroy(); foundationalFinal.host.remove();

    spec.lesson.teaching_steps.forEach((step) => {
      assert(Boolean(step.scene?.display_title) && !/Create a lesson-specific conflict|Make the defined whole explicit|Establish that|Transfer responsibility|Re-establish/i.test(step.scene.display_title), `FRA-05 ${step.id} exposes its authoring purpose as the learner heading`);
      assertNarrationBeatAssets(step.narration?.script, `FRA-05 ${step.id} narration`);
    });
    spec.question_bank.filter((question) => question.stage === "repair").forEach((question) => {
      assert(question.prompt !== question.target, `${question.id} exposes its authoring purpose as the learner prompt`);
    });
    spec.question_bank.forEach((question) => {
      ["before_submit", "on_correct_reaction", "on_incorrect_reaction", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_narration", "reteach"]
        .forEach((key) => assertNarrationBeatAssets(question.scripts?.[key], `${question.id} ${key}`));
      Object.values(question.scripts?.response_feedback || {}).forEach((line, index) => assertNarrationBeatAssets(line, `${question.id} response feedback ${index + 1}`));
    });
    assertNarrationBeatAssets(spec.lesson.exit.intro_script, "FRA-05 final-check introduction");
    assertNarrationBeatAssets(spec.completion.secure.ryan_script, "FRA-05 secure completion");
    assertNarrationBeatAssets(spec.completion.needs_work.ryan_script, "FRA-05 needs-work completion");

    const learnerCopy = [
      ...spec.lesson.teaching_steps.flatMap((step) => [step.scene?.display_title, step.scene?.initial_state, step.narration?.script]),
      ...spec.question_bank.flatMap((question) => [question.prompt, ...Object.values(question.scripts || {}), ...Object.values(question.mathematical_support || {})]),
      spec.completion.secure.title,
      spec.completion.secure.ryan_script,
      spec.completion.needs_work.title,
      spec.completion.needs_work.ryan_script,
      ...spec.completion.secure.buttons,
      ...spec.completion.needs_work.buttons
    ].flat(Infinity).filter(Boolean).join(" ");
    assert(!/diagnostic|retrieval practice|error family|assessment intent|clean no-hint|evidence|misconception|implementation|classification|canonical|storyboard/i.test(learnerCopy), "FRA-05 exposes internal authoring language to learners");
    assert(!/Create a lesson-specific conflict|Make the defined whole explicit|Establish that|Transfer responsibility|Re-establish|Return the interval count|Make known positions/i.test(learnerCopy), "FRA-05 exposes authoring-purpose copy to learners");
    assert(!/proper fraction|improper fraction|mixed number|simplif/i.test(learnerCopy), "FRA-05 leaks later classification, conversion or simplification scope");
  }

  function assertFra06CanonicalContract(spec, model, topic, dialogue) {
    assert(spec.identity.title === "Recognise Proper, Improper and Mixed Forms", "FRA-06 title is not the approved title");
    assert(spec.identity.status === "OWNER_APPROVED_IMPLEMENTATION_HANDOFF_V1", "FRA-06 status is not the owner-approved handoff state");
    assert(spec.canonical_lesson.version === "fra06-handoff-v1-runtime-copy-1", "FRA-06 content version is not the approved handoff version");
    assert(spec.canonical_lesson.engine_profile === "fra06", "FRA-06 did not register its lesson-engine profile");
    assert(spec.lesson.teaching_steps.map((step) => step.id).join("|") === "HOOK|HOOK-CHOICE|T1|T2|T3|T4|T5", "FRA-06 teaching sequence differs from the approved storyboard");
    assert(spec.lesson.practice.question_order.length === 0, "FRA-06 retained legacy quota practice");
    assert(spec.diagnostic.question_refs.length === 0 && spec.retrieval_practice.enabled === false, "FRA-06 added an unauthorised diagnostic or retrieval layer");

    const registry = window.FRA06_RUNTIME_COPY;
    const runtimeTexts = new Set(Object.values(registry).map((entry) => entry.text));
    assert(Object.keys(registry).length === 139, "FRA-06 runtime registry does not contain all 139 approved utterances");
    assert(window.RevilyFra06Canonical.validateRuntimeContract().length === 0, "FRA-06 runtime/caption/cue contract failed");
    assert(Object.values(registry).every((entry) => entry.captionSource === "same_as_audio"), "FRA-06 captions do not use the audio utterance text");
    const cues = spec.lesson.teaching_steps.flatMap((step) => step.narration?.sync_cues || []);
    assert(cues.length === 34, "FRA-06 does not expose all 34 approved visual cue bindings");
    assert(cues.every((cue) => registry[cue.utteranceId]?.text.includes(cue.anchorText)), "FRA-06 has an orphan or invented cue anchor");
    const brokenRegistry = { ...registry }; delete brokenRegistry[cues[0].utteranceId];
    assert(window.RevilyFra06Canonical.validateRuntimeContract(brokenRegistry).length > 0, "FRA-06 cue validation accepted a removed utterance");

    const speakableKeys = ["before_submit", "on_correct_reaction", "on_incorrect_reaction", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_narration", "reteach"];
    const speakableLines = [
      ...spec.lesson.teaching_steps.flatMap((step) => step.narration?.script || []),
      ...spec.question_bank.flatMap((question) => speakableKeys.flatMap((key) => question.scripts?.[key] || [])),
      ...spec.question_bank.flatMap((question) => Object.values(question.scripts?.response_feedback || {})),
      ...spec.question_bank.flatMap((question) => Object.values(question.scripts?.family_feedback || {})),
      ...spec.question_bank.flatMap((question) => Object.values(question.scripts?.engagement_response_by_value || {})),
      ...spec.lesson.exit.intro_script, ...spec.completion.secure.ryan_script
    ].flat(Infinity).filter(Boolean);
    assert(speakableLines.every((line) => runtimeTexts.has(normaliseNarrationText(line))), "FRA-06 sends non-registry copy to Ryan");
    assert(new Set(speakableLines).size === runtimeTexts.size, "FRA-06 leaves an approved runtime utterance unreachable");
    const promptTexts = new Set(spec.question_bank.map((question) => question.prompt).filter(Boolean));
    assert(!speakableLines.some((line) => promptTexts.has(line)), "FRA-06 automatically speaks a visible prompt");
    assert(!speakableLines.some((line) => /authorOnly|assessmentIntent|route|validation|QA/i.test(line)), "FRA-06 speakable copy contains authoring or QA language");

    const properHook = window.RevilyFra06Canonical.getHookResponseSequence("proper_card");
    const improperHook = window.RevilyFra06Canonical.getHookResponseSequence("improper_card");
    const mixedHook = window.RevilyFra06Canonical.getHookResponseSequence("mixed_card");
    assert(properHook[0] === "HOOK.FEEDBACK.WRONG_PROPER" && improperHook[0] === "HOOK.FEEDBACK.WRONG_IMPROPER" && mixedHook[0] === "HOOK.FEEDBACK.CORRECT", "FRA-06 hook does not select its three honest first-response branches");
    assert(new Set([properHook[0], improperHook[0], mixedHook[0]]).size === 3, "FRA-06 hook branches share a first-response utterance");
    assert(properHook.slice(1).join("|") === mixedHook.slice(1).join("|") && improperHook.slice(1).join("|") === mixedHook.slice(1).join("|"), "FRA-06 hook branches do not converge on the common reveal");
    [
      ["3/5", properHook], ["7/5", improperHook], ["2 1/4", mixedHook]
    ].forEach(([response, expectedIds]) => {
      const harness = createTestEngine(topic, spec, dialogue, "HOOK-CHOICE");
      const spoken = [];
      harness.engine.startNarration = (lines) => spoken.push(...[lines].flat(Infinity).filter(Boolean));
      submitEngineResponse(harness.engine, response);
      assert(spoken.join("|") === expectedIds.map((id) => registry[id].text).join("|"), `FRA-06 hook ${response} did not play its unique branch then common reveal`);
      assert(Object.keys(harness.engine.state.submissions).length === 0 && Object.keys(harness.engine.state.evidence.firstAttemptCorrect).length === 0, "FRA-06 hook choice affected mastery evidence");
      harness.engine.destroy(); harness.host.remove();
    });

    spec.question_bank.filter((question) => question.policy?.scored).forEach((question) => {
      const correctIds = window.RevilyFra06Canonical.selectOutcomeUtteranceIds(question, correctResponse(question), true);
      const incorrectIds = window.RevilyFra06Canonical.selectOutcomeUtteranceIds(question, wrongResponse(question), false);
      assert(correctIds.length === 1 && incorrectIds.length === 1, `${question.id} does not select exactly one outcome branch`);
      assert(correctIds[0] !== incorrectIds[0], `${question.id} can play correct feedback after a wrong answer`);
      assert(registry[correctIds[0]] && registry[incorrectIds[0]], `${question.id} outcome branch is not in the runtime registry`);
    });

    const hookVisual = renderModelVisual(spec, model, { nodeId: "HOOK" });
    assert(hookVisual.querySelectorAll(".fra06-card").length === 3, "FRA-06 hook does not show exactly three approved cards");
    assert(hookVisual.querySelector(".fra06-one-checkpoint"), "FRA-06 hook omits the one-whole checkpoint");
    const t1Visual = renderModelVisual(spec, model, { nodeId: "T1" });
    assert(t1Visual.querySelectorAll(".fra06-tick").length === 8, "FRA-06 T1 does not show seven equal intervals");
    assert(t1Visual.querySelector(".fra06-point > i")?.textContent === "P", "FRA-06 T1 does not identify its plotted point as P");
    const t4Visual = renderModelVisual(spec, model, { nodeId: "T4" });
    assert(t4Visual.querySelectorAll(".fra06-whole-bar.is-full").length === 2 && t4Visual.querySelectorAll(".fra06-whole-bar.is-parts i.is-selected").length === 3, "FRA-06 T4 geometry does not show two wholes and three eighths");
    const m3Before = renderModelVisual(spec, model, { questionId: "FRA-06-M3" });
    const m3Outcome = renderModelVisual(spec, model, { questionId: "FRA-06-M3", feedback: "correct" });
    const m3Worked = renderModelVisual(spec, model, { questionId: "FRA-06-M3", feedback: "worked" });
    assert(!m3Before.querySelector(".fra06-bars") && !m3Outcome.querySelector(".fra06-bars"), "FRA-06 M3 reveals the diagram before its worked check");
    assert(m3Worked.querySelectorAll(".fra06-whole-bar.is-full").length === 4 && m3Worked.querySelectorAll(".fra06-whole-bar.is-parts i.is-selected").length === 3, "FRA-06 M3 worked check does not reveal four wholes and three tenths");

    const sortHarness = createTestEngine(topic, spec, dialogue, "I1");
    assert(sortHarness.host.querySelectorAll("[data-sort-card]").length === 4, "FRA-06 sort lacks one destination selector per card");
    assert([...sortHarness.host.querySelectorAll("[data-sort-card]")].every((select) => select.getBoundingClientRect().height >= 0), "FRA-06 sort selectors did not render");
    fillEngineResponse(sortHarness.engine, sortHarness.engine.current().question, correctResponse(sortHarness.engine.current().question));
    assert(validate(sortHarness.engine.current().question, sortHarness.engine.readResponse(sortHarness.engine.current().question)), "FRA-06 sort control does not commit its canonical map");
    sortHarness.engine.destroy(); sortHarness.host.remove();

    const migrationKey = "revily.fractions.FRA-06.current.v1";
    localStorage.setItem(migrationKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra06-yaml", topicId: "fractions", skillId: "FRA-06", cursor: "T06", soundOn: false, developerOpen: true }));
    const migrationHost = document.createElement("div"); fixture.appendChild(migrationHost);
    const migrated = new LessonEngine(migrationHost, spec, dialogue, { topic });
    assert(migrated.state.cursor === "HOOK" && migrated.state.contentVersion === "fra06-handoff-v1-runtime-copy-1", "FRA-06 legacy state did not reset to the coherent hook boundary");
    assert(migrated.state.soundOn === false && migrated.state.developerOpen === true && migrated.state.contentMigration?.from === "legacy-fra06-yaml", "FRA-06 migration did not preserve safe preferences and record its source version");
    migrated.destroy(); migrationHost.remove(); localStorage.removeItem(migrationKey);

    const strictEngine = new LessonEngine(document.createElement("div"), spec, dialogue, { topic });
    let rejectedVisibleCopy = false;
    try { strictEngine.startNarration([model.getQuestion("FRA-06-G1").prompt], null); } catch (_error) { rejectedVisibleCopy = true; }
    assert(rejectedVisibleCopy, "FRA-06 narration accepted a visible prompt outside the runtime registry");
    strictEngine.destroy();

    const strong = createTestEngine(topic, spec, dialogue, "G1");
    submitAndAdvance(strong.engine, correctResponse(strong.engine.current().question));
    submitAndAdvance(strong.engine, correctResponse(strong.engine.current().question));
    assert(strong.engine.state.cursor === "F2", "FRA-06 strong route did not skip F1 while retaining F2");
    strong.engine.destroy(); strong.host.remove();

    const standard = createTestEngine(topic, spec, dialogue, "G1");
    submitEngineResponse(standard.engine, wrongResponse(standard.engine.current().question));
    submitAndAdvance(standard.engine, correctResponse(standard.engine.current().question));
    submitAndAdvance(standard.engine, correctResponse(standard.engine.current().question));
    assert(standard.engine.state.cursor === "F1", "FRA-06 standard route did not retain F1");
    standard.engine.destroy(); standard.host.remove();

    const hinted = createTestEngine(topic, spec, dialogue, "I2");
    hinted.engine.state.evidence.hintOpened["FRA-06-I2"] = true;
    submitAndAdvance(hinted.engine, correctResponse(hinted.engine.current().question));
    assert(hinted.engine.state.cursor === "FRESH:FRA-06-C-I2", "FRA-06 hint-assisted success did not insert an unseen same-family no-hint confirmation");
    hinted.engine.destroy(); hinted.host.remove();

    const repairCases = [
      ["G1", "Improper fraction", "FRA-06-R-PROPER"],
      ["G2", "Proper fraction; less than one.", "FRA-06-R-EQUAL"],
      ["F2", "Two wholes and three sevenths of another; a mixed number.", "FRA-06-R-MIXED"],
      ["I2", "Not correct — 12/7 is impossible.", "FRA-06-R-INVALID"]
    ];
    repairCases.forEach(([cursor, response, expectedRepair]) => {
      const harness = createTestEngine(topic, spec, dialogue, cursor);
      const returnId = harness.engine.current().nextId;
      submitEngineResponse(harness.engine, response);
      submitEngineResponse(harness.engine, response);
      assert(harness.engine.state.pendingRecovery?.recoveryId === expectedRepair, `FRA-06 ${cursor} repeated error did not select ${expectedRepair}`);
      harness.engine.advance(harness.engine.current());
      assert(harness.engine.current().recovery && harness.engine.current().questionId === expectedRepair, `FRA-06 ${cursor} repair did not open`);
      harness.engine.advance(harness.engine.current());
      assert(harness.engine.current().fresh, `FRA-06 ${cursor} repair did not lead to a fresh no-hint check`);
      submitAndAdvance(harness.engine, correctResponse(harness.engine.current().question));
      assert(harness.engine.state.cursor === returnId, `FRA-06 ${cursor} fresh repair check did not return to ${returnId}`);
      harness.engine.destroy(); harness.host.remove();
    });

    ["M1", "M2", "M3", "M4"].forEach((id) => {
      const question = model.getQuestion(`FRA-06-${id}`);
      assert(question.policy.hintPolicy === "none", `FRA-06 ${id} exposes a hint`);
      assert(question.policy.answerLocksOnSubmit && question.policy.solutionPolicy === "after_locked_submit", `FRA-06 ${id} does not lock before revealing working`);
    });
    const lockedFinal = createTestEngine(topic, spec, dialogue, "M1");
    const finalCurrent = lockedFinal.engine.current();
    submitEngineResponse(lockedFinal.engine, correctResponse(finalCurrent.question));
    assert(lockedFinal.engine.state.evidence.answerLocked[finalCurrent.questionId] === true, "FRA-06 final response was not locked on submit");
    assert(!lockedFinal.engine.state.workedRevealed[finalCurrent.questionId], "FRA-06 final working appeared before its outcome branch completed");
    lockedFinal.engine.destroy(); lockedFinal.host.remove();

    const runFinalScore = (correctCount) => {
      const harness = createTestEngine(topic, spec, dialogue, "M1");
      ["M1", "M2", "M3", "M4"].forEach((id, index) => {
        const current = harness.engine.current();
        assert(current.id === id, `FRA-06 final route expected ${id}`);
        submitAndAdvance(harness.engine, index < correctCount ? correctResponse(current.question) : wrongResponse(current.question));
      });
      return harness;
    };
    const secure = runFinalScore(3);
    assert(secure.engine.state.exit.result === "SECURE", "FRA-06 3/4 breadth result did not finish securely");
    secure.engine.destroy(); secure.host.remove();
    const targeted = runFinalScore(2);
    assert(targeted.engine.state.exit.remediation?.requiredSuccesses === 2 && targeted.engine.state.cursor.startsWith("RECOVERY:"), "FRA-06 2/4 result did not begin targeted repair plus two fresh checks");
    let targetedCycles = 0;
    while (!targeted.engine.state.exit.result && targetedCycles < 3) {
      assert(targeted.engine.current().recovery, "FRA-06 2/4 recovery did not open its matching repair");
      targeted.engine.advance(targeted.engine.current());
      assert(targeted.engine.current().fresh, "FRA-06 2/4 repair did not open a fresh check");
      submitAndAdvance(targeted.engine, correctResponse(targeted.engine.current().question));
      targetedCycles += 1;
    }
    assert(targeted.engine.state.exit.result === "SECURE" && targetedCycles === 2, "FRA-06 2/4 route did not require and complete exactly two fresh no-hint successes");
    targeted.engine.destroy(); targeted.host.remove();
    const recovery = runFinalScore(0);
    assert(recovery.engine.state.exit.remediation?.requiredSuccesses === 4 && recovery.engine.state.cursor.startsWith("RECOVERY:"), "FRA-06 0/4 result did not begin weakness repair plus a fresh four-item set");
    let recoveryCycles = 0;
    while (!recovery.engine.state.exit.result && recoveryCycles < 5) {
      assert(recovery.engine.current().recovery, "FRA-06 0/4 recovery did not open a matching repair");
      recovery.engine.advance(recovery.engine.current());
      assert(recovery.engine.current().fresh, "FRA-06 0/4 repair did not open a fresh check");
      submitAndAdvance(recovery.engine, correctResponse(recovery.engine.current().question));
      recoveryCycles += 1;
    }
    assert(recovery.engine.state.exit.result === "SECURE" && recoveryCycles === 4, "FRA-06 0/4 route did not require and complete four fresh no-hint successes");
    recovery.engine.destroy(); recovery.host.remove();

    const learnerCopy = [
      ...spec.lesson.teaching_steps.flatMap((step) => [step.scene?.display_title, step.scene?.initial_state]),
      ...spec.question_bank.flatMap((question) => [question.prompt, ...Object.values(question.mathematical_support || {})])
    ].flat(Infinity).filter(Boolean).join(" ");
    assert(!/convert|simplif|equivalent fraction|add the fractions|subtract the fractions/i.test(learnerCopy), "FRA-06 introduced conversion, simplification, equivalence or operations");
  }

  async function assertFra04ResponsiveFrames() {
    localStorage.removeItem("revily.fractions.FRA-04.current.v1");
    for (const width of [390, 320]) {
      const frame = document.createElement("iframe");
      frame.title = `FRA04 responsive check at ${width} pixels`;
      frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:844px;border:0;`;
      document.body.appendChild(frame);
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error(`FRA-04 ${width}px responsive frame did not load`)), 5000);
        frame.addEventListener("load", () => window.setTimeout(() => {
          window.clearTimeout(timeout);
          resolve();
        }, 750), { once: true });
        frame.src = `../index.html?responsive-qa=${width}#/fractions/FRA-04`;
      });
      const frameDocument = frame.contentDocument;
      assert(Boolean(frameDocument?.querySelector("#math-canvas")), `FRA-04 did not render at ${width}px`);
      const viewportWidth = frame.contentWindow.innerWidth;
      const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > viewportWidth + 2 || rect.left < -2;
      }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
      assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-04 has horizontal page overflow at ${width}px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
      const shellButtons = [...frameDocument.querySelectorAll(".topbar button, .lesson-footer button")];
      assert(shellButtons.every((button) => button.getBoundingClientRect().right <= viewportWidth + 2), `FRA-04 controls overflow at ${width}px`);
      frame.remove();
    }
  }

  async function assertFra05ResponsiveFrames() {
    localStorage.removeItem("revily.fractions.FRA-05.current.v1");
    for (const width of [390, 320]) {
      const frame = document.createElement("iframe");
      frame.title = `FRA05 responsive check at ${width} pixels`;
      frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:844px;border:0;`;
      document.body.appendChild(frame);
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error(`FRA-05 ${width}px responsive frame did not load`)), 5000);
        frame.addEventListener("load", () => window.setTimeout(() => {
          window.clearTimeout(timeout);
          resolve();
        }, 750), { once: true });
        frame.src = `../index.html?responsive-qa=${width}#/fractions/FRA-05`;
      });
      const frameDocument = frame.contentDocument;
      assert(Boolean(frameDocument?.querySelector(".fra05-runner-track")), `FRA-05 hook did not render at ${width}px`);
      const viewportWidth = frame.contentWindow.innerWidth;
      const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > viewportWidth + 2 || rect.left < -2;
      }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
      assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-05 has horizontal page overflow at ${width}px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
      const shellButtons = [...frameDocument.querySelectorAll(".topbar button, .lesson-footer button")];
      assert(shellButtons.every((button) => button.getBoundingClientRect().right <= viewportWidth + 2), `FRA-05 controls overflow at ${width}px`);
      frame.remove();
    }
  }

  async function assertFra09ResponsiveFrames() {
    localStorage.removeItem("revily.fractions.FRA-09.current.v1");
    for (const width of [390, 320]) {
      const frame = document.createElement("iframe");
      frame.title = `FRA09 responsive check at ${width} pixels`;
      frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:844px;border:0;`;
      document.body.appendChild(frame);
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error(`FRA-09 ${width}px responsive frame did not load`)), 5000);
        frame.addEventListener("load", () => window.setTimeout(() => {
          window.clearTimeout(timeout);
          resolve();
        }, 750), { once: true });
        frame.src = `../index.html?responsive-qa=${width}#/fractions/FRA-09`;
      });
      const frameDocument = frame.contentDocument;
      assert(Boolean(frameDocument?.querySelector(".fra09-progress-bar")), `FRA-09 hook did not render at ${width}px`);
      const viewportWidth = frame.contentWindow.innerWidth;
      const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > viewportWidth + 2 || rect.left < -2;
      }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
      assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-09 has horizontal page overflow at ${width}px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
      const shellButtons = [...frameDocument.querySelectorAll(".topbar button, .lesson-footer button")];
      assert(shellButtons.every((button) => button.getBoundingClientRect().right <= viewportWidth + 2), `FRA-09 controls overflow at ${width}px`);
      frame.remove();
    }
  }

  async function assertFra06ResponsiveFrame() {
    localStorage.removeItem("revily.fractions.FRA-06.current.v1");
    const frame = document.createElement("iframe");
    frame.title = "FRA06 responsive check at 390 pixels";
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:390px;height:844px;border:0;";
    document.body.appendChild(frame);
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("FRA-06 390px responsive frame did not load")), 5000);
      frame.addEventListener("load", () => window.setTimeout(() => { window.clearTimeout(timeout); resolve(); }, 750), { once: true });
      frame.src = "../index.html?responsive-qa=390#/fractions/FRA-06";
    });
    const frameDocument = frame.contentDocument;
    assert(Boolean(frameDocument?.querySelector(".fra06-hook")), "FRA-06 hook did not render at 390px");
    const viewportWidth = frame.contentWindow.innerWidth;
    const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > viewportWidth + 2 || rect.left < -2;
    }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
    assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-06 has horizontal page overflow at 390px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
    frame.remove();
  }

  function assertFra11CanonicalContract(spec, model, topic, dialogue) {
    const approved = window.RevilyFra11Approved;
    const canonical = window.RevilyFra11Canonical;
    assert(Boolean(approved && canonical), "FRA-11 approved registry or canonical adapter did not load");
    assert(approved.validateFRA11CanonicalSpec().length === 0, "validateFRA11CanonicalSpec() reported an owner-contract error");
    assert(canonical.validateRuntimeContract().length === 0, "FRA-11 runtime copy/caption/cue parity failed");
    assert(spec.canonical_lesson?.engine_profile === "fra11", "FRA-11 did not select the canonical engine profile");
    assert(spec.canonical_lesson?.version === "fra11-canonical-handoff-v1", "FRA-11 content version changed");
    assert(spec.diagnostic?.enabled === false && spec.retrieval_practice?.enabled === false, "FRA-11 mounted an out-of-scope Diagnostic or Retrieval layer");
    assert(spec.lesson.teaching_steps.length === 7, "FRA-11 teaching sequence is not hook, T1-T5 and handoff");
    assert(spec.lesson.practice.question_order.length === 0, "FRA-11 retained a quota practice layer");
    assert(spec.lesson.exit.primary_question_refs.join("|") === ["M1", "M2", "M3", "M4", "M5"].map((id) => `FRA-11-${id}`).join("|"), "FRA-11 final check is not M1-M5");
    assert(spec.lesson.adaptive_pathway.skip_after.G2.next === "F2", "FRA-11 strong route does not retain F2");
    assert(Object.keys(spec.lesson.adaptive_pathway.no_hint_confirmation_by_question).length === 4, "FRA-11 hint confirmations are incomplete");

    const hook = renderModelVisual(spec, model, { nodeId: "HOOK" });
    assert(hook.querySelectorAll('[data-fra11-layer="initial"] .fra11-piece').length === 13, "FRA-11 hook does not start with thirteen equal tiles");
    assert(hook.querySelector('[data-fra11-layer="revealed"]')?.hidden === true, "FRA-11 hook reveals regrouping before its cue");
    assert(!/three|remainder|3 1\/4/i.test(hook.getAttribute("aria-label") || ""), "FRA-11 hook accessibility text reveals the answer early");

    const m2 = renderModelVisual(spec, model, { questionId: "FRA-11-M2" });
    assert(m2.querySelectorAll('.fra11-piece[tabindex="0"]').length === 14, "FRA-11 M2 does not expose fourteen keyboard-operable fifth-sized pieces");
    assert([...m2.querySelectorAll('.fra11-piece')].every((piece) => piece.getAttribute("aria-label") === "fifth-sized piece"), "FRA-11 M2 pre-answer piece labels reveal grouping or totals");

    const strong = createTestEngine(topic, spec, dialogue, "G2");
    strong.engine.state.evidence.firstAttemptCorrect["FRA-11-G1"] = true;
    strong.engine.state.evidence.firstAttemptCorrect["FRA-11-G2"] = true;
    assert(strong.engine.adaptiveNextId(model.getNode("G2")) === "F2", "FRA-11 strong guided route did not skip F1 and retain F2");
    strong.engine.destroy();
    strong.host.remove();

    const migrationKey = "revily.fractions.FRA-11.current.v1";
    const historyKey = "revily.fractions.FRA-11.history.v1";
    localStorage.setItem(migrationKey, JSON.stringify({ version: 1, contentVersion: "legacy-fra11-yaml", topicId: "fractions", skillId: "FRA-11", attemptId: "fra11-legacy-attempt", status: "LEARNING", cursor: "T06", soundOn: false, submissions: { legacy: [{ response: "old" }] } }));
    localStorage.removeItem(historyKey);
    const migrationHost = document.createElement("div"); fixture.appendChild(migrationHost);
    const migrated = new LessonEngine(migrationHost, spec, dialogue, { topic });
    assert(migrated.state.cursor === "HOOK" && migrated.state.contentVersion === "fra11-canonical-handoff-v1", "FRA-11 legacy state did not reset to the coherent hook boundary");
    assert(migrated.state.soundOn === false && migrated.state.contentMigration?.from === "legacy-fra11-yaml", "FRA-11 migration did not preserve sound preference and record its source version");
    const migrationHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    assert(migrationHistory.some((entry) => entry.attemptId === "fra11-legacy-attempt" && entry.reason === "content_version_migration"), "FRA-11 migration did not archive the incompatible attempt");
    migrated.destroy(); migrationHost.remove(); localStorage.removeItem(migrationKey); localStorage.removeItem(historyKey);

    const strictEngine = new LessonEngine(document.createElement("div"), spec, dialogue, { topic });
    let rejectedPrompt = false;
    try { strictEngine.startNarration([model.getQuestion("FRA-11-G1").prompt], null); } catch (_error) { rejectedPrompt = true; }
    assert(rejectedPrompt, "FRA-11 narration accepted a visible prompt outside FRA11_RUNTIME_COPY");
    strictEngine.destroy();

    const actualStrong = createTestEngine(topic, spec, dialogue, "G1");
    submitAndAdvance(actualStrong.engine, correctResponse(actualStrong.engine.current().question));
    submitAndAdvance(actualStrong.engine, correctResponse(actualStrong.engine.current().question));
    assert(actualStrong.engine.state.cursor === "F2", "FRA-11 clean G1/G2 route did not skip F1 while keeping F2");
    actualStrong.engine.destroy(); actualStrong.host.remove();

    const standard = createTestEngine(topic, spec, dialogue, "G1");
    const standardG1 = submitEngineResponse(standard.engine, wrongResponse(standard.engine.current().question));
    standard.engine.advance(standardG1);
    submitAndAdvance(standard.engine, correctResponse(standard.engine.current().question));
    assert(standard.engine.state.cursor === "F1", "FRA-11 supported guided route incorrectly skipped F1");
    standard.engine.destroy(); standard.host.remove();

    const hinted = createTestEngine(topic, spec, dialogue, "I2");
    const hintLines = [];
    hinted.engine.startNarration = (lines) => hintLines.push(...[lines].flat(Infinity).filter(Boolean));
    hinted.host.querySelector("#hint-toggle")?.click();
    const i2 = model.getQuestion("FRA-11-I2");
    const expectedHintLines = i2.runtimeHintUtteranceIds.map((id) => spec.canonical_lesson.runtime_copy[id].text);
    assert(hintLines.join("|") === expectedHintLines.join("|"), `FRA-11 I2 hint did not speak exactly its mapped runtime utterance (${JSON.stringify(hintLines)} vs ${JSON.stringify(expectedHintLines)})`);
    assert(hinted.engine.state.evidence.hintOpened["FRA-11-I2"] === true, "FRA-11 did not record the opened hint");
    submitAndAdvance(hinted.engine, correctResponse(hinted.engine.current().question));
    assert(hinted.engine.state.evidence.hintOpenedBeforeSubmit["FRA-11-I2"] === true, "FRA-11 did not preserve pre-submit hint evidence");
    assert(hinted.engine.state.cursor === "FRESH:FRA-11-C2", "FRA-11 hint-assisted I2 success did not require C2 without a hint");
    assert(hinted.engine.current().question.policy.hintPolicy === "none", "FRA-11 fresh no-hint confirmation still exposes a hint");
    hinted.engine.destroy(); hinted.host.remove();

    const repeated = createTestEngine(topic, spec, dialogue, "G1");
    const repeatedG1 = submitEngineResponse(repeated.engine, { whole: "3", n: "3", d: "4" });
    assert(!repeated.engine.state.pendingRecovery, "One FRA-11 grouping error triggered repair without corroborating evidence");
    repeated.engine.advance(repeatedG1);
    const repeatedG2 = submitEngineResponse(repeated.engine, { quotient: "4", remainder: "2", whole: "4", n: "2", d: "5" });
    assert(repeated.engine.state.pendingRecovery?.recoveryId === "FRA-11-R-GROUP", "Repeated FRA-11 grouping evidence did not choose R-GROUP");
    assert(repeated.engine.state.pendingRecovery?.freshId === "FRA-11-RG-C", "FRA-11 R-GROUP did not retain its mapped fresh check");
    repeated.engine.advance(repeatedG2);
    assert(repeated.engine.current().recovery && repeated.engine.current().questionId === "FRA-11-R-GROUP", "FRA-11 targeted repair did not open");
    const repairQuestion = repeated.engine.current().question;
    submitEngineResponse(repeated.engine, correctResponse(repairQuestion));
    repeated.engine.advance(repeated.engine.current());
    assert(repeated.engine.current().fresh && repeated.engine.current().questionId === "FRA-11-RG-C", "FRA-11 targeted repair did not lead to its fresh check");
    repeated.engine.destroy(); repeated.host.remove();

    const repairCases = [
      ["G1", { whole: "3", n: "3", d: "4" }, "R-GROUP", "RG-C"],
      ["G1", { whole: "2", n: "0", d: "4" }, "R-LEFTOVER", "RL-C"],
      ["I2", "4 5/1 — turn the leftover fraction upside down.", "R-DENOM", "RD-C"],
      ["G1", { whole: "3", n: "2", d: "4" }, "R-FIELDS", "RF-C"],
      ["F2", "3", "R-ZERO", "RZ-C"]
    ];
    repairCases.forEach(([cursor, response, family, freshShortId]) => {
      const harness = createTestEngine(topic, spec, dialogue, cursor);
      harness.engine.state.evidence.candidateErrorFamily[`corroborating-${family}`] = family;
      const current = submitEngineResponse(harness.engine, response);
      assert(harness.engine.state.pendingRecovery?.recoveryId === `FRA-11-${family}`, `FRA-11 ${family} did not select its targeted repair after corroborating evidence`);
      assert(harness.engine.state.pendingRecovery?.freshId === `FRA-11-${freshShortId}`, `FRA-11 ${family} did not select ${freshShortId}`);
      harness.engine.advance(current);
      assert(harness.engine.current().recovery && harness.engine.current().questionId === `FRA-11-${family}`, `FRA-11 ${family} repair did not open`);
      harness.engine.advance(harness.engine.current());
      assert(harness.engine.current().fresh && harness.engine.current().questionId === `FRA-11-${freshShortId}`, `FRA-11 ${family} repair did not hand off to ${freshShortId}`);
      harness.engine.destroy(); harness.host.remove();
    });

    ["M1", "M2", "M3", "M4", "M5"].forEach((id) => {
      const finalQuestion = model.getQuestion(`FRA-11-${id}`);
      assert(finalQuestion.policy.hintPolicy === "none", `FRA-11 ${id} exposes a hint`);
      assert(finalQuestion.policy.solutionPolicy === "after_locked_submit", `FRA-11 ${id} does not lock before revealing working`);
      [true, false].forEach((isCorrect) => {
        const harness = createTestEngine(topic, spec, dialogue, id);
        const queues = [];
        const callbacks = [];
        harness.engine.startNarration = (lines, done) => { queues.push([lines].flat(Infinity).filter(Boolean)); if (done) callbacks.push(done); };
        const current = harness.engine.current();
        const response = isCorrect ? correctResponse(current.question) : wrongResponse(current.question);
        submitEngineResponse(harness.engine, response);
        const expectedId = isCorrect ? "FINAL.CORRECT" : "FINAL.INCORRECT";
        assert(queues.length === 1 && queues[0].join("|") === spec.canonical_lesson.runtime_copy[expectedId].text, `FRA-11 ${id} ${isCorrect ? "correct" : "incorrect"} branch did not use exactly ${expectedId}`);
        assert(harness.engine.state.evidence.answerLocked[current.questionId] === true, `FRA-11 ${id} answer was not locked on submit`);
        assert(!harness.engine.state.workedRevealed[current.questionId], `FRA-11 ${id} working appeared before the outcome utterance completed`);
        assert(callbacks.length === 1, `FRA-11 ${id} did not stage its visible working after the outcome utterance`);
        callbacks.shift()();
        assert(harness.engine.state.workedRevealed[current.questionId] === true, `FRA-11 ${id} working did not reveal after answer lock`);
        assert(queues.length === 1, `FRA-11 ${id} automatically voiced visible worked calculations`);
        harness.engine.destroy(); harness.host.remove();
      });
    });

    const runFinal = (pattern) => {
      const harness = createTestEngine(topic, spec, dialogue, "M1");
      pattern.forEach((isCorrect, index) => {
        const current = harness.engine.current();
        assert(current.id === `M${index + 1}`, `FRA-11 final route expected M${index + 1}`);
        submitEngineResponse(harness.engine, isCorrect ? correctResponse(current.question) : wrongResponse(current.question));
        if (index < pattern.length - 1) harness.engine.advance(current);
      });
      return harness;
    };

    const secureFive = runFinal([true, true, true, true, true]);
    assert(secureFive.engine.state.exit.result === "SECURE" && secureFive.engine.state.exit.remediation?.route === "primary_mastery", "FRA-11 5/5 did not finish as the authored mastery route");
    secureFive.engine.destroy(); secureFive.host.remove();
    const secureFour = runFinal([true, true, true, true, false]);
    assert(secureFour.engine.state.exit.result === "SECURE", "FRA-11 4/5 with breadth did not finish as authored");
    secureFour.engine.destroy(); secureFour.host.remove();

    const targetedThree = runFinal([true, true, true, false, false]);
    assert(targetedThree.engine.state.exit.remediation?.route === "targeted_repair_then_two_item_check" && targetedThree.engine.state.exit.remediation?.requiredSuccesses === 2, "FRA-11 3/5 did not start targeted repair plus a two-item check");
    let targetedFreshCount = 0;
    while (!targetedThree.engine.state.exit.result && targetedFreshCount < 3) {
      while (targetedThree.engine.current().recovery) targetedThree.engine.advance(targetedThree.engine.current());
      assert(targetedThree.engine.current().fresh, "FRA-11 3/5 recovery did not present a fresh item");
      submitAndAdvance(targetedThree.engine, correctResponse(targetedThree.engine.current().question));
      targetedFreshCount += 1;
    }
    assert(targetedThree.engine.state.exit.result === "SECURE" && targetedFreshCount === 2, "FRA-11 3/5 route did not require and pass exactly two fresh no-hint items");
    targetedThree.engine.destroy(); targetedThree.host.remove();

    const foundational = runFinal([true, false, false, false, false]);
    assert(foundational.engine.state.exit.remediation?.route === "targeted_repair_then_fresh_three_item_final" && foundational.engine.state.exit.remediation?.requiredSuccesses === 3, "FRA-11 0-2/5 did not start targeted repair plus a fresh three-item final");
    let foundationalFreshCount = 0;
    while (!foundational.engine.state.exit.result && foundationalFreshCount < 4) {
      while (foundational.engine.current().recovery) foundational.engine.advance(foundational.engine.current());
      assert(foundational.engine.current().fresh, "FRA-11 foundational recovery did not present a fresh item");
      submitAndAdvance(foundational.engine, correctResponse(foundational.engine.current().question));
      foundationalFreshCount += 1;
    }
    assert(foundational.engine.state.exit.result === "SECURE" && foundationalFreshCount === 3, "FRA-11 0-2/5 route did not require and pass exactly three fresh no-hint items");
    foundational.engine.destroy(); foundational.host.remove();
  }

  function assertFra16CanonicalContract(spec, model, topic, dialogue) {
    const approved = window.RevilyFra16V1;
    const canonical = window.RevilyFra16Canonical;
    const registry = spec.canonical_lesson.runtime_copy;
    assert(approved.validateCanonicalSpec().length === 0, "validateFRA16CanonicalSpec() failed in the browser runtime");
    assert(canonical.validateRuntimeContract().length === 0, "FRA16 runtime/caption/cue contract failed");
    assert(Object.keys(registry).length === 148, "FRA16 did not register all 148 approved Ryan utterances");
    Object.entries(registry).forEach(([utteranceId, entry]) => {
      const track = window.RevilyFra16NarrationAssets.tracksByUtteranceId[utteranceId];
      assert(track?.text === entry.text, `${utteranceId} audio/caption text drifted`);
      assert(Array.isArray(track?.words) && track.words.length > 0, `${utteranceId} has no deterministic timing`);
    });

    const hook = model.getQuestion("FRA-16-HOOK-CHOICE");
    const hookScene = approved.spec.teachingScenes.find((scene) => scene.id === "HOOK");
    const hookBranches = [];
    hookScene.interaction.options.forEach((option) => {
      const harness = createTestEngine(topic, spec, dialogue, "HOOK-CHOICE");
      const spoken = [];
      harness.engine.startNarration = (lines) => spoken.push(...lines);
      submitEngineResponse(harness.engine, option.label);
      const expectedIds = approved.getHookResponseSequence(option.id);
      const expectedLines = expectedIds.map((id) => registry[id].text);
      assert(spoken.join("|") === expectedLines.join("|"), `hook ${option.id} did not play its exact branch`);
      assert(harness.engine.state.resolved[hook.id] === "engagement", `hook ${option.id} was not recorded as unscored engagement`);
      assert(!harness.engine.state.evidence.firstAttemptCorrect[hook.id], `hook ${option.id} leaked into mastery evidence`);
      hookBranches.push(spoken.join("|"));
      harness.engine.destroy();
      harness.host.remove();
    });
    assert(new Set(hookBranches).size === 4, "hook Blue, Orange, Same and Not sure feedback is not distinct");

    const orderHarness = createTestEngine(topic, spec, dialogue, "F2");
    const orderList = orderHarness.engine.root.querySelector("[data-fra16-order-list]");
    assert(Boolean(orderList), "FRA16 ordering control did not render");
    assert(orderList.querySelectorAll("[data-fra16-order-item][draggable='true']").length === 3, "FRA16 ordering cards are not pointer draggable");
    assert(orderList.querySelectorAll("[data-fra16-move='left']").length === 3 && orderList.querySelectorAll("[data-fra16-move='right']").length === 3, "FRA16 ordering cards lack accessible move buttons");
    assert([...orderList.querySelectorAll(".fra16-order-card")].every((card) => card.tabIndex === 0), "FRA16 ordering cards are not keyboard focusable");
    const orderIds = () => [...orderList.querySelectorAll("[data-fra16-order-item]")].map((item) => item.dataset.cardId);
    const initialOrder = orderIds();
    orderList.querySelector(".fra16-order-card").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    assert(orderIds()[1] === initialOrder[0], "ArrowRight did not move the focused FRA16 order card");
    orderList.querySelector(`[data-card-id="${initialOrder[0]}"] [data-fra16-move='left']`).click();
    assert(orderIds().join("|") === initialOrder.join("|"), "accessible move buttons did not restore the FRA16 order");
    const dragData = new DataTransfer();
    const dragSource = orderList.querySelector(`[data-card-id="${initialOrder[0]}"]`);
    const dragTarget = orderList.querySelector(`[data-card-id="${initialOrder[2]}"]`);
    dragSource.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: dragData }));
    dragTarget.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: dragData }));
    assert(orderIds().join("|") !== initialOrder.join("|"), "pointer drag did not reorder FRA16 cards");
    orderHarness.engine.destroy();
    orderHarness.host.remove();

    const hinted = createTestEngine(topic, spec, dialogue, "I2");
    hinted.engine.state.evidence.hintOpened["FRA-16-I2"] = true;
    hinted.engine.state.evidence.hintOpenedBeforeSubmit["FRA-16-I2"] = true;
    submitEngineResponse(hinted.engine, correctResponse(hinted.engine.current().question));
    assert(hinted.engine.state.resolved["FRA-16-I2"] === "correct", "hint use was treated as an incorrect answer");
    assert(hinted.engine.state.evidence.pendingNoHintConfirmations.includes("FRA-16-C-SORT"), "I2 hint-supported success did not require C-SORT");
    hinted.engine.destroy();
    hinted.host.remove();

    const repeated = createTestEngine(topic, spec, dialogue, "I1");
    const repeatedWrong = wrongResponse(repeated.engine.current().question);
    submitEngineResponse(repeated.engine, repeatedWrong);
    assert(!repeated.engine.state.pendingRecovery, "one observable I1 error triggered repair before repeated evidence");
    submitEngineResponse(repeated.engine, repeatedWrong);
    assert(repeated.engine.state.pendingRecovery?.recoveryId === "FRA-16-R-NUM", "repeated numerator-only evidence did not choose R-NUM");
    assert(repeated.engine.state.pendingRecovery?.supportedId === "FRA-16-RN-S", "R-NUM did not retain its supported practice");
    assert(repeated.engine.state.pendingRecovery?.freshId === "FRA-16-RN-C", "R-NUM did not retain its fresh recheck");
    repeated.engine.destroy();
    repeated.host.remove();

    [true, false].forEach((correct) => {
      const harness = createTestEngine(topic, spec, dialogue, "M1");
      const narrations = [];
      let outcomeDone = null;
      harness.engine.startNarration = (lines, done) => {
        narrations.push([...lines]);
        if (!outcomeDone && done) outcomeDone = done;
      };
      const finalQuestion = harness.engine.current().question;
      const response = correct ? correctResponse(finalQuestion) : wrongResponse(finalQuestion);
      submitEngineResponse(harness.engine, response);
      const expectedIds = canonical.selectOutcomeUtteranceIds(finalQuestion, response, correct);
      assert(narrations[0].join("|") === expectedIds.map((id) => registry[id].text).join("|"), `M1 ${correct ? "correct" : "incorrect"} runtime branch changed`);
      if (!correct) assert(!expectedIds.some((id) => finalQuestion.runtimeOutcome.correctUtteranceIds.includes(id)), "M1 wrong answer played a correct-response line");
      assert(harness.engine.state.evidence.answerLocked["FRA-16-M1"] === true, "M1 answer was not locked before outcome feedback");
      assert(!harness.engine.state.workedRevealed["FRA-16-M1"], "M1 working appeared before the outcome branch completed");
      assert(!harness.engine.root.querySelector(".fra16-worked"), "M1 worked markup leaked before lock/outcome completion");
      outcomeDone();
      assert(harness.engine.state.workedRevealed["FRA-16-M1"] === true, "M1 working did not reveal after its outcome branch");
      assert(Boolean(harness.engine.root.querySelector(".fra16-worked")), "M1 post-lock working did not render");
      harness.engine.destroy();
      harness.host.remove();
    });

    const strong = createTestEngine(topic, spec, dialogue, "G2");
    strong.engine.state.evidence.firstAttemptCorrect["FRA-16-G1"] = true;
    strong.engine.state.evidence.firstAttemptCorrect["FRA-16-G2"] = true;
    assert(strong.engine.adaptiveNextId(model.getNode("G2")) === "F2", "strong guided route did not skip F1 and retain F2");
    strong.engine.state.evidence.supportEscalated["FRA-16-G2"] = true;
    assert(strong.engine.adaptiveNextId(model.getNode("G2")) === "F1", "standard guided route did not retain F1");
    strong.engine.destroy();
    strong.host.remove();
  }

  async function assertFra16ResponsiveFrame() {
    localStorage.removeItem("revily.fractions.FRA-16.current.v1");
    const frame = document.createElement("iframe");
    frame.title = "FRA16 responsive check at 390 pixels";
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:390px;height:844px;border:0;";
    document.body.appendChild(frame);
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("FRA-16 390px responsive frame did not load")), 5000);
      frame.addEventListener("load", () => window.setTimeout(() => { window.clearTimeout(timeout); resolve(); }, 750), { once: true });
      frame.src = "../index.html?responsive-qa=390#/fractions/FRA-16";
    });
    const frameDocument = frame.contentDocument;
    assert(Boolean(frameDocument?.querySelector(".fra16-hook")), "FRA-16 hook did not render at 390px");
    const viewportWidth = frame.contentWindow.innerWidth;
    const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > viewportWidth + 2 || rect.left < -2;
    }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
    assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-16 has horizontal page overflow at 390px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
    const controls = [...frameDocument.querySelectorAll("button, input, select")];
    assert(controls.every((control) => control.getBoundingClientRect().right <= viewportWidth + 2), "FRA-16 controls overflow at 390px");
    frame.remove();
  }

  async function assertFra11ResponsiveFrame() {
    localStorage.removeItem("revily.fractions.FRA-11.current.v1");
    const frame = document.createElement("iframe");
    frame.title = "FRA11 responsive check at 390 pixels";
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:390px;height:844px;border:0;";
    document.body.appendChild(frame);
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("FRA-11 390px responsive frame did not load")), 5000);
      frame.addEventListener("load", () => window.setTimeout(() => { window.clearTimeout(timeout); resolve(); }, 750), { once: true });
      frame.src = "../index.html?responsive-qa=390&dev=1&phase=exit#/fractions/FRA-11";
    });
    const frameDocument = frame.contentDocument;
    assert(Boolean(frameDocument?.querySelector(".fra11-visual")), "FRA-11 final check did not render at 390px");
    const viewportWidth = frame.contentWindow.innerWidth;
    const overflowing = [...frameDocument.querySelectorAll("body *")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > viewportWidth + 2 || rect.left < -2;
    }).slice(0, 5).map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
    assert(frameDocument.documentElement.scrollWidth <= viewportWidth + 2 && overflowing.length === 0, `FRA-11 has horizontal page overflow at 390px (${frameDocument.documentElement.scrollWidth}/${viewportWidth}; ${overflowing.join(", ")})`);
    assert([...frameDocument.querySelectorAll("button, input")].every((control) => control.getBoundingClientRect().right <= viewportWidth + 2), "FRA-11 controls overflow at 390px");

    const whole = frameDocument.querySelector("#mixed-whole");
    const numerator = frameDocument.querySelector("#mixed-n");
    whole.value = "5"; whole.dispatchEvent(new frame.contentWindow.Event("input", { bubbles: true }));
    numerator.value = "1"; numerator.dispatchEvent(new frame.contentWindow.Event("input", { bubbles: true }));
    frameDocument.querySelector("#primary-action").click();
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    frameDocument.querySelector("#skip-narration")?.click();
    for (let waitIndex = 0; waitIndex < 30 && frameDocument.querySelector("#primary-action")?.disabled; waitIndex += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
    assert(whole.disabled && numerator.disabled, "FRA-11 mobile final answer did not lock");
    assert(Boolean(frameDocument.querySelector(".feedback-card")), "FRA-11 mobile final answer did not reveal its worked check");
    assert(frameDocument.querySelector("#primary-action")?.disabled === false, "FRA-11 mobile Continue did not enable after the outcome branch");
    frameDocument.querySelector("#primary-action").click();
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const pieces = [...frameDocument.querySelectorAll('.fra11-piece[aria-label="fifth-sized piece"]')];
    assert(pieces.length === 14, "FRA-11 M2 does not render fourteen individually reachable pieces at 390px");
    assert(pieces.every((piece) => piece.tabIndex === 0 && piece.getAttribute("role") === "img"), "FRA-11 M2 pieces are not keyboard-focusable at 390px");
    pieces[0].focus();
    assert(frameDocument.activeElement === pieces[0], "FRA-11 M2 piece focus did not work from the keyboard path");
    const hasReducedMotionRule = [...frameDocument.styleSheets].some((sheet) => {
      try { return [...sheet.cssRules].some((rule) => String(rule.conditionText || "").includes("prefers-reduced-motion") && rule.cssText.includes("fra11")); }
      catch { return false; }
    });
    assert(hasReducedMotionRule, "FRA-11 has no browser-applied reduced-motion override");
    frame.remove();
  }

  function assertPa01Contract(spec, model) {
    assert(spec.spec_intent?.implementation_status === "first_production_exemplar", "PA-01 is not marked as the reviewed pilot exemplar");
    assert(spec.diagnostic?.enabled === false && spec.diagnostic.question_refs.length === 0, "PA-01 activated Diagnostic outside the requested scope");
    assert(!spec.retrieval_practice, "PA-01 activated Retrieval outside the requested scope");
    assert(spec.concept_model?.mathematical_rule === "p% of A means p/100 × A.", "PA-01 changed the approved percentage setup rule");
    assert(spec.voice_and_script?.narration_playback?.mode === "browser_speech_ryan", "PA-01 should use the permission-safe Ryan browser voice path until authored audio is approved");
    assert(spec.voice_and_script?.narration_playback?.require_ryan_voice === true, "PA-01 permits a non-Ryan narrator");
    assert(spec.lesson.teaching_steps.filter((step) => step.learner_interaction?.question_ref).length === 3, "PA-01 does not contain three purposeful teaching checkpoints");
    assert(spec.lesson.practice.question_order.length === 5, "PA-01 practice is not the approved five-item set");
    assert(spec.lesson.exit.primary_question_refs.length === 2 && spec.lesson.exit.confirmation_question_refs.length === 2, "PA-01 exit or confirmation set is incomplete");
    assert(model.primaryPrimitive === "percentage_strip", "PA-01 does not use its aligned percentage-strip model");

    const activeQuestions = spec.question_bank.filter((question) => !["exit", "confirmation"].includes(question.stage));
    activeQuestions.forEach((question) => {
      assert(question.visual?.primitive === "percentage_strip", `${question.id} is not tied to the percentage-strip representation`);
      assert(question.visual?.model?.showRoles !== true, `${question.id} reveals assessed role labels before submission`);
      assert(question.visual?.model?.showFormula !== true, `${question.id} reveals an assessed setup before submission`);
      ["on_correct_math", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_explanation"].forEach((key) => {
        assert(Boolean(question.scripts?.[key]), `${question.id} is missing ${key}`);
      });
      const host = document.createElement("div");
      renderVisual(host, question.visual, { spec, question, feedback: "initial" });
      const solution = question.visual.model.solutionLabel;
      assert(!solution || !host.querySelector(".percentage-solution"), `${question.id} leaks its solution before submission`);
      renderVisual(host, question.visual, { spec, question, feedback: "support" });
      assert(!solution || host.querySelector(".percentage-solution"), `${question.id} does not reveal its authored solution after support`);
    });

    ["PA-01-E01", "PA-01-E02", "PA-01-CFM01", "PA-01-CFM02"].forEach((id) => {
      const question = model.getQuestion(id);
      assert(question.attempt_policy.max_attempts_before_resolution === 1, `${id} is not one-shot`);
      assert(question.mathematical_support.hint_1 === null && question.mathematical_support.hint_2 === null, `${id} exposes a hint during mastery evidence`);
    });
  }

  function assertPaBatchContract(spec, model) {
    const id = spec.identity.id;
    const expectedBatch = ["PA-06", "PA-07"].includes(id) ? "production_batch_2" : "production_batch_1";
    assert(spec.spec_intent?.implementation_status === expectedBatch, `${id} is not marked as the expected production-batch lesson`);
    assert(spec.diagnostic?.enabled === false && spec.diagnostic.question_refs.length === 0, `${id} activated Diagnostic outside scope`);
    assert(!spec.retrieval_practice, `${id} activated Retrieval outside scope`);
    assert(spec.experience_contract?.authored_feedback_only === true, `${id} permits generic answer feedback`);
    assert(spec.voice_and_script?.narration_playback?.mode === "browser_speech_ryan", `${id} does not use the permission-safe Ryan browser voice path`);
    assert(spec.voice_and_script?.narration_playback?.require_ryan_voice === true, `${id} permits a non-Ryan narrator`);
    assert(spec.lesson.teaching_steps.filter((step) => step.learner_interaction?.question_ref).length === 3, `${id} does not contain three purposeful teaching checkpoints`);
    assert(model.primaryPrimitive === "percentage_strip", `${id} does not use the aligned percentage representation`);
    assert(spec.question_bank.length === 18, `${id} does not contain its complete 18-question teaching and evidence bank`);

    spec.question_bank.forEach((question) => {
      assert(question.visual?.primitive === "percentage_strip", `${question.id} is not tied to the percentage representation`);
      assert(Boolean(question.visual?.model?.solutionLabel), `${question.id} has no resolved-state visual label`);
      if (["PA-06", "PA-07"].includes(id) && question.response?.type === "single_choice") {
        assert(question.response.options.length === 4, `${question.id} does not expose exactly four choices`);
        assert(question.response.options.includes(question.answer.value), `${question.id} authored answer is not one of its choices`);
      }
      const evidenceOnly = ["exit", "confirmation"].includes(question.stage);
      if (evidenceOnly) {
        assert(question.attempt_policy.max_attempts_before_resolution === 1, `${question.id} is not one-shot evidence`);
        assert(question.mathematical_support.hint_1 === null && question.mathematical_support.hint_2 === null, `${question.id} exposes hints during mastery evidence`);
      } else {
        ["on_correct_reaction", "on_correct_math", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "worked_explanation"].forEach((key) => {
          assert(Boolean(question.scripts?.[key]), `${question.id} is missing ${key}`);
        });
      }
      const host = document.createElement("div");
      renderVisual(host, question.visual, { spec, question, feedback: "initial" });
      assert(!host.querySelector(".percentage-solution"), `${question.id} leaks its solution before submission`);
      assert(!host.querySelector(".percentage-method-steps"), `${question.id} leaks its method before submission`);
      renderVisual(host, question.visual, { spec, question, feedback: "support" });
      assert(host.querySelector(".percentage-solution"), `${question.id} does not reveal its authored solution after support`);
    });
  }

  async function loadTopicPackage(topic) {
    const [manifest, dialogue, schema] = await Promise.all([
      loader.loadManifest(topic),
      loader.loadDialogueProfile(topic),
      loader.loadSchema(topic)
    ]);
    const packages = onlySkillId
      ? (manifest.skills.some((entry) => entry.id === onlySkillId) ? [await loader.loadSkill(topic, onlySkillId)] : [])
      : await loader.loadAllSkills(topic);
    return { topic, manifest, dialogue, schema, packages };
  }

  try {
    const topicPackages = await Promise.all(topics.all.map(loadTopicPackage));
    assert(topicPackages.length === 7, "topic registry should contain all seven current topic collections");
    assert(new Set(topics.all.map((topic) => topic.id)).size === topics.all.length, "topic ids are not unique");
    assert(new Set(topics.all.map((topic) => topic.route)).size === topics.all.length, "topic routes are not unique");
    assert(topics.narration.voiceId === "en-GB-RyanNeural", "Microsoft Ryan Neural is not the configured narration voice");
    assert(/Microsoft Ryan Online \(Natural\)/.test(topics.narration.voiceName), "the preferred Ryan voice is not the Microsoft Natural voice");
    topics.all.forEach((topic) => {
      assert(topic.openingNarration?.lead.includes("{skillTitle}"), `${topic.title} has no reusable human opening lead`);
      assert(topic.openingNarration?.hook && !/\b(?:FRA|DEC)-\d{2}\b/.test(topic.openingNarration.hook), `${topic.title} opening exposes an internal skill id`);
    });

    const allSkillIds = topicPackages.flatMap(({ manifest }) => manifest.skills.map((skill) => skill.id));
    assert(new Set(allSkillIds).size === allSkillIds.length, "skill ids collide across topics");
    const fractionsTopic = topicPackages.find(({ topic }) => topic.id === "fractions");
    const addSubtractTopic = topicPackages.find(({ topic }) => topic.id === "add-subtract-fractions");
    const multiplyDivideTopic = topicPackages.find(({ topic }) => topic.id === "multiply-divide-fractions");
    const decimalsTopic = topicPackages.find(({ topic }) => topic.id === "decimal-calculation");
    const fdpTopic = topicPackages.find(({ topic }) => topic.id === "fractions-decimals-percentages");
    const percentagesTopic = topicPackages.find(({ topic }) => topic.id === "percentage-amounts");
    const percentageChangeTopic = topicPackages.find(({ topic }) => topic.id === "percentage-change");
    assert(fractionsTopic.manifest.skills.length === 28, "Fractions manifest does not contain 28 skills");
    assert(addSubtractTopic.manifest.skills.length === 18, "Adding and Subtracting Fractions manifest does not contain AF-01 through AF-18");
    assert(multiplyDivideTopic.manifest.skills.length === 17, "Multiplying and Dividing Fractions manifest does not contain MD-01 through MD-17");
    assert(decimalsTopic.manifest.skills.length === 19, "Decimal manifest does not contain 19 skills");
    assert(fdpTopic.manifest.skills.length === 15, "FDP Conversions manifest does not contain FDP-01 through FDP-15");
    assert(percentagesTopic.manifest.skills.length === 15, "Percentage Amounts manifest does not contain PA-01 through PA-15");
    assert(percentageChangeTopic.manifest.skills.length === 13, "Percentage Change manifest does not contain PC-01 through PC-13");
    if (!onlySkillId) assert(decimalsTopic.packages.length === 19, "not every Decimal manifest entry loaded a specification");

    const fractionDialogue = fractionsTopic.dialogue;
    assert((fractionDialogue.reaction_bank || []).length === 21, "Ryan reaction bank should contain 21 authored reactions");
    assert(new Set(fractionDialogue.reaction_bank.map((reaction) => reaction.lead_family)).size === fractionDialogue.reaction_bank.length, "Ryan lead families are not unique");
    assert(narrationAssets.voice === "en-GB-RyanNeural", "the Fractions narration pack is not Microsoft Ryan Neural");
    assert(Object.keys(narrationAssets.tracks || {}).length >= 1300, "the Microsoft Ryan Fractions narration pack is incomplete");
    fractionDialogue.reaction_bank.forEach((reaction) => assertNarrationAsset(reaction.text, reaction.id));
    assert(window.RevilyDecimalNarrationAssets?.voice === "en-GB-RyanNeural", "the Decimal narration pack is not Microsoft Ryan Neural");
    assert(window.RevilyDecimalNarrationAssets?.targetLessons?.length === 19, "the Decimal Ryan narration pack does not cover all nineteen lessons");

    const genericRyan = { name: "Ryan", voiceURI: "Ryan", lang: "en-GB" };
    const genericBritishVoice = { name: "Microsoft George", voiceURI: "Microsoft George", lang: "en-GB" };
    const microsoftRyan = { name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", voiceURI: "Microsoft Ryan Online (Natural)", lang: "en-GB" };
    assert(selectRyanVoice([genericRyan, microsoftRyan]) === microsoftRyan, "voice selection did not prefer Microsoft Ryan Online (Natural)");
    assert(selectRyanVoice([genericBritishVoice], { strict: true }) === null, "strict Ryan selection substituted a different British voice");

    const syncCaptions = [];
    const syncCues = [];
    const sync = new NarrationSync({
      onCaption: (state) => syncCaptions.push(state),
      onCue: (cue) => syncCues.push(cue.action)
    });
    const syncLine = "Show the whole, then split it into four equal parts.";
    const planned = timingPlan(syncLine, 10000);
    assert(planned.tokens.every((word, index) => index === 0 || word.atMs >= planned.tokens[index - 1].atMs), "progressive caption timing is not monotonic");
    sync.start(syncLine, [{ cue: "four equal parts", action: "split_equal" }], { durationMs: 100000 });
    assert(syncCaptions[0].text === "", "progressive captions revealed words before narration began");
    sync.boundary(0, 4);
    assert(syncCaptions.at(-1).text === "Show", "provider word boundary did not reveal the matching caption prefix");
    sync.boundary(syncLine.indexOf("four"), 4);
    assert(syncCues.includes("split_equal"), "the exact narration phrase did not fire its visual cue");
    sync.complete();
    assert(syncCaptions.at(-1).text === syncLine, "caption completion did not reveal the full spoken line");
    sync.stop();

    const alignedCaptions = [];
    const aligned = new NarrationSync({ onCaption: (state) => alignedCaptions.push(state) });
    aligned.start("Ryan starts here.", [], { durationMs: 5000 });
    aligned.useAlignment([{ atMs: 200 }, { atMs: 600 }, { atMs: 1000 }]);
    aligned.seekTime(0);
    assert(alignedCaptions.at(-1).text === "", "aligned captions revealed a word before its audio boundary");
    aligned.seekTime(210);
    assert(alignedCaptions.at(-1).text === "Ryan", "aligned captions did not follow packaged Ryan timing");
    aligned.stop();

    const punctuatedCaptions = [];
    const punctuated = new NarrationSync({ onCaption: (state) => punctuatedCaptions.push(state) });
    punctuated.start("Wonderful — that’s right.", [], { durationMs: 5000 });
    punctuated.useAlignment([{ atMs: 100 }, { atMs: 600 }, { atMs: 1000 }]);
    punctuated.seekTime(599);
    assert(punctuatedCaptions.at(-1).text === "Wonderful —", "standalone punctuation shifted packaged Ryan word alignment");
    punctuated.seekTime(610);
    assert(punctuatedCaptions.at(-1).text === "Wonderful — that’s", "caption timing did not resume after standalone punctuation");
    punctuated.stop();

    for (const topicPackage of topicPackages) {
      const { topic, manifest, dialogue, schema, packages } = topicPackage;
      assert(loader.inspectManifest(manifest, topic).length === 0, `${topic.title} manifest failed inspection`);
      assert(schema.properties?.question_bank, `${topic.title} v1.2 schema did not load`);
      const internalIds = new Set(manifest.skills.map((skill) => skill.id));

      for (const { entry, spec } of packages) {
        const before = assertions;
        try {
          const issues = loader.inspectSkill(spec, entry, manifest);
          assert(issues.length === 0, issues.join("; "));
          assert(spec.identity.title === entry.title, "title is not manifest-driven");
          if (spec.experience_contract?.refinement_profile === "source_aligned_v1") {
            // Source-specific contract replaces the old ten-scene/two-exit template.
            const model = buildLessonModel(spec);
            walkMainGraph(model);
            const reviewed = window.RevilySourceAuditContracts?.[spec.identity.id];
            assert(Boolean(reviewed), "an unreviewed lesson opted into the source audit");
            assert(model.nodes.length === reviewed.nodes && model.exitIds.length === reviewed.exit, `${spec.identity.id} source sequence is incomplete`);
            assert(spec.spec_intent.source_material.sha256 === reviewed.sha256, `${spec.identity.id} source differs from its independent audit contract`);
            assert(model.confirmationIds.length === 0, `${spec.identity.id} retained the generic confirmation shortcut`);
            assert(spec.lesson.exit.mastery_policy.profile === reviewed.mastery, `${spec.identity.id} lost its source-specific independent mastery rule`);
            const probe = new LessonEngine(document.createElement("div"), spec, dialogue, { topic });
            for (const question of spec.question_bank) {
              assert(window.RevilyValidators.validate(question, question.answer.value), `${question.id} rejects its exact answer`);
              assert(!window.RevilyValidators.validate(question, "__incorrect__"), `${question.id} accepts an unrelated answer`);
              checkedAnswers += 2;
              const host = document.createElement("div");
              renderVisual(host, question.visual, { spec, question, feedback: "initial" });
              assert(host.querySelector("[data-revealed=false]"), `${question.id} has no concealed initial model`);
              assert(!host.querySelector(".os-working"), `${question.id} shows working before submission`);
              renderVisual(host, question.visual, { spec, question, feedback: "correct" });
              const checkpoint = question.policy?.solutionPolicy === "checkpoint";
              assert(host.querySelectorAll(".os-working li").length === (checkpoint ? 0 : 1), `${question.id} incorrect post-answer working policy`);
              if (checkpoint) renderVisual(host, question.visual, { spec, question, feedback: "support" });
              host.querySelector("[data-os-next]")?.click();
              assert(host.querySelectorAll(".os-working li").length === Math.min(2, question.working.length), `${question.id} next working line failed`);
              assert(Boolean(probe.inputMarkup(question, null, false)), `${question.id} input did not render`);
              renderedVisuals += 2;
            }
            skillResults.push({ topic: topic.id, id: spec.identity.id, passed: true, assertions: assertions - before });
            report(spec.identity.id, true, `${spec.identity.title} — ${assertions - before} source-aligned runtime checks passed; audio: ${spec.spec_intent.refinement.production_audio}`);
            continue;
          }
          const canonicalFra01 = spec.identity.id === "FRA-01" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra02 = spec.identity.id === "FRA-02" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra03 = spec.identity.id === "FRA-03" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra04 = spec.identity.id === "FRA-04" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra05 = spec.identity.id === "FRA-05" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra06 = spec.identity.id === "FRA-06" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra08 = spec.identity.id === "FRA-08" && spec.canonical_lesson?.runtime_applied;
          const canonicalFra09 = spec.identity.id === "FRA-09" && spec.canonical_lesson?.runtime_applied;
          const canonicalFra10 = spec.identity.id === "FRA-10" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra11 = spec.identity.id === "FRA-11";
          const canonicalFra12 = spec.identity.id === "FRA-12" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra13 = spec.identity.id === "FRA-13" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra16 = spec.identity.id === "FRA-16" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra17 = spec.identity.id === "FRA-17" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra18 = spec.identity.id === "FRA-18" && spec.canonical_lesson?.engine_profile === "fra18";
          const canonicalFra19 = spec.identity.id === "FRA-19" && spec.canonical_lesson?.engine_profile === "fra19";
          const canonicalFra14 = spec.identity.id === "FRA-14" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra15 = spec.identity.id === "FRA-15" && spec.canonical_lesson?.runtime_applied;
          const canonicalFra20 = spec.identity.id === "FRA-20" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra21 = spec.identity.id === "FRA-21" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra22 = spec.identity.id === "FRA-22" && spec.canonical_lesson?.runtime_applied;
          const canonicalFra23 = spec.identity.id === "FRA-23" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra24 = spec.identity.id === "FRA-24" && spec.canonical_lesson?.runtime_applied;
          const canonicalFra26 = spec.identity.id === "FRA-26" && spec.canonical_lesson?.reference_for_future_lessons;
          const canonicalFra27 = spec.identity.id === "FRA-27" && spec.canonical_lesson?.runtime_applied;
          const canonicalFra28 = spec.identity.id === "FRA-28" && spec.canonical_lesson?.runtime_applied;
          const canonicalLesson = spec.canonical_lesson?.runtime_applied === true
            || spec.canonical_lesson?.reference_for_future_lessons === true
            || canonicalFra11 || canonicalFra18 || canonicalFra19;
          const fractionNumber = /^FRA-(\d{2})$/.exec(spec.identity.id)?.[1];
          if (topic.id === "fractions" && Number(fractionNumber) >= 6 && Number(fractionNumber) <= 28 && !canonicalFra18) {
            assert(spec.voice_and_script?.narration_playback?.mode === "authored_audio_then_browser_speech", `${spec.identity.id} does not prefer packaged Ryan audio`);
            assert(spec.voice_and_script?.narration_playback?.require_ryan_voice === true, `${spec.identity.id} permits a non-Ryan narrator`);
            if (spec.canonical_lesson?.runtime_copy) {
              Object.entries(spec.canonical_lesson.runtime_copy).forEach(([utteranceId, entry]) => {
                const asset = narrationAssets.tracks?.[entry.text];
                assert(Boolean(asset?.src), `${spec.identity.id} ${utteranceId} has no packaged Ryan audio`);
                assert(Array.isArray(asset?.words) && asset.words.length > 0, `${spec.identity.id} ${utteranceId} has no Ryan word timing`);
              });
            }
          }
          if (topic.id === "decimal-calculation") {
            assert(spec.voice_and_script?.narration_playback?.mode === "authored_audio_then_browser_speech", `${spec.identity.id} does not prefer packaged Ryan audio`);
            assert(spec.voice_and_script?.narration_playback?.require_ryan_voice === true, `${spec.identity.id} permits a non-Ryan narrator`);
            assert(spec.voice_and_script?.narration_playback?.timing_source === "provider_word_boundaries", `${spec.identity.id} does not use provider word timing`);
            const decimalOpening = openingNarrationLines(topic, spec, spec.lesson.teaching_steps[0].narration.script);
            assertNarrationBeatAssets(decimalOpening, `${spec.identity.id} opening`);
            spec.lesson.teaching_steps.forEach((step) => assertNarrationBeatAssets(step.narration?.script, `${spec.identity.id} ${step.id}`));
            Object.values(spec.lesson.transfer_steps || {}).forEach((step) => assertNarrationBeatAssets(step.pre_question_script, `${spec.identity.id} transfer`));
            assertNarrationBeatAssets(spec.lesson.practice?.intro_script, `${spec.identity.id} practice intro`);
            assertNarrationBeatAssets(spec.lesson.exit?.intro_script, `${spec.identity.id} exit intro`);
            assertNarrationBeatAssets(spec.completion.secure.ryan_script, `${spec.identity.id} secure completion`);
            assertNarrationBeatAssets(spec.completion.needs_work.ryan_script, `${spec.identity.id} needs-work completion`);
            spec.question_bank.forEach((question) => {
              ["before_submit", "on_correct_math", "on_incorrect_attempt_1", "on_incorrect_attempt_2", "on_correct_reaction", "on_incorrect_reaction", "reteach", "hint", "worked_narration", "worked_explanation", "response_feedback", "family_feedback", "error_family_feedback"].forEach((key) => {
                assertNarrationBeatAssets(question.scripts?.[key], `${question.id} ${key}`);
              });
              assertNarrationBeatAssets(question.mathematical_support?.hint_1, `${question.id} hint 1`);
              assertNarrationBeatAssets(question.mathematical_support?.hint_2, `${question.id} hint 2`);
            });
          }
          if (canonicalFra01) {
            assert(spec.lesson.teaching_steps.length === 6, "canonical FRA-01 teaching sequence is not the approved hook plus four teaching scenes");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-01 retained the repetitive fixed practice queue");
            assert(spec.lesson.exit.primary_question_refs.length === 3, "canonical FRA-01 final check is not three items");
            assert(spec.lesson.exit.confirmation_question_refs.length === 8, "canonical FRA-01 does not have two fresh checks for each error family");
          } else if (canonicalFra02) {
            assert(spec.lesson.teaching_steps.length === 6, "canonical FRA-02 teaching sequence is not the approved hook, four teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-02 retained a quota-based practice queue");
            assert(spec.lesson.exit.primary_question_refs.length === 4, "canonical FRA-02 final check is not four items");
            assert(spec.lesson.exit.confirmation_question_refs.length === 8, "canonical FRA-02 does not have two fresh checks for each error family");
          } else if (canonicalFra03) {
            assert(spec.lesson.teaching_steps.length === 7, "canonical FRA-03 teaching sequence is not the approved hook, engagement, four teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-03 retained a quota-based practice queue");
            assert(spec.lesson.exit.primary_question_refs.length === 4, "canonical FRA-03 final check is not four items");
            assert(spec.lesson.exit.confirmation_question_refs.length === 10, "canonical FRA-03 does not have error-family checks plus same-family hint confirmations");
          } else if (canonicalFra04) {
            assert(spec.lesson.teaching_steps.length === 7, "canonical FRA-04 teaching sequence is not the approved hook, choice, four teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-04 retained a quota-based practice queue");
            assert(spec.lesson.exit.primary_question_refs.length === 4, "canonical FRA-04 final check is not four items");
            assert(spec.lesson.exit.confirmation_question_refs.length === 8, "canonical FRA-04 does not have two fresh checks for each error family");
          } else if (canonicalFra05) {
            assert(spec.lesson.teaching_steps.length === 8, "canonical FRA-05 teaching sequence is not the approved hook, choice, five teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-05 retained a quota-based practice queue");
            assert(spec.lesson.exit.primary_question_refs.length === 4, "canonical FRA-05 final check is not four items");
            assert(spec.lesson.exit.confirmation_question_refs.length === 10, "canonical FRA-05 does not include approved confirmations and deterministic fresh recovery items");
          } else if (canonicalFra06) {
            assert(spec.lesson.teaching_steps.length === 7, "canonical FRA-06 teaching sequence is not the approved hook, choice and five teaching scenes");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-06 retained quota-based practice");
            assert(spec.lesson.exit.primary_question_refs.length === 4, "canonical FRA-06 final check is not four items");
            assert(spec.lesson.exit.confirmation_question_refs.length === 10, "canonical FRA-06 does not include its nine confirmations and mixed-form repair check");
          } else if (canonicalFra10) {
            assert(spec.lesson.teaching_steps.length === 8, "canonical FRA-10 teaching sequence is not HOOK, choice, T1-T5 and HANDOFF");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-10 retained fixed practice, Diagnostic or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-10 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 18, "canonical FRA-10 does not include confirmations, fresh repair checks and the recovery bank");
          } else if (canonicalFra11) {
            assert(spec.lesson.teaching_steps.length === 7, "canonical FRA-11 teaching sequence is not the approved hook, T1-T5 and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-11 retained fixed practice or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-11 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 9, "canonical FRA-11 does not include confirmations and the authored recovery pool");
          } else if (canonicalFra12) {
            assert(spec.lesson.teaching_steps.length === 6, "canonical FRA-12 teaching sequence is not the timber hook, four teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-12 retained quota-based practice");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-12 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 18, "canonical FRA-12 does not include confirmations and the authored recovery bank");
          } else if (canonicalFra13) {
            assert(spec.lesson.teaching_steps.length === 7, "canonical FRA-13 teaching sequence is not the approved hook, choice, four teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-13 retained quota-based practice");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-13 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 11, "canonical FRA-13 does not include six confirmations and A1-A5");
          } else if (canonicalFra16) {
            assert(spec.lesson.teaching_steps.length === 8, "canonical FRA-16 teaching sequence is not the approved hook, choice, five teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-16 retained quota-based practice");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-16 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 16, "canonical FRA-16 does not include confirmations, repair checks and RF1-RF-B");
          } else if (canonicalFra17) {
            assert(spec.lesson.teaching_steps.length === 7, "canonical FRA-17 teaching sequence is not HOOK, choice, T1-T4 and HANDOFF");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-17 retained fixed practice, Diagnostic or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 4, "canonical FRA-17 final check is not M1-M4");
            assert(spec.lesson.exit.confirmation_question_refs.length === 13, "canonical FRA-17 does not include confirmations, fresh repair checks and the authored recovery bank");
          } else if (canonicalFra18) {
            assert(spec.lesson.teaching_steps.length === 10, "canonical FRA-18 teaching sequence is not HOOK, choice, T1-T6, HANDOFF and final intro");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-18 retained fixed practice, Diagnostic or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-18 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 0, "canonical FRA-18 placed repair or recovery items in the primary route");
          } else if (canonicalFra19) {
            assert(spec.lesson.teaching_steps.length === 10, "canonical FRA-19 teaching sequence is not HOOK, choice, T1-T5, HANDOFF and the two authored transitions");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-19 retained fixed practice, Diagnostic or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-19 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 0, "canonical FRA-19 placed repair or recovery items in the primary route");
          } else if (canonicalFra14) {
            assert(spec.lesson.teaching_steps.length === 6, "canonical FRA-14 teaching sequence is not the approved hook, four teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-14 retained fixed practice or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-14 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 12, "canonical FRA-14 does not include seven confirmations and RM1-RM5");
          } else if (canonicalFra20) {
            assert(spec.lesson.teaching_steps.length === 6, "canonical FRA-20 teaching sequence is not the approved hook, choice, three teaching scenes and handoff");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-20 retained fixed practice, Diagnostic or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 4, "canonical FRA-20 final check is not M1-M4");
            assert(spec.lesson.exit.confirmation_question_refs.length === 40, "canonical FRA-20 does not include the approved confirmations, repairs and recovery pool");
          } else if (canonicalFra21) {
            assert(spec.lesson.teaching_steps.length === 6, "canonical FRA-21 teaching sequence is not HOOK, T1-T4 and HANDOFF");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-21 retained fixed practice, Diagnostic or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-21 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 21, "canonical FRA-21 does not include confirmations, fresh repair checks and the authored recovery bank");
          } else if (canonicalFra23) {
            assert(spec.lesson.teaching_steps.length === 6, "canonical FRA-23 teaching sequence is not HOOK, T1-T4 and HANDOFF");
            assert(spec.lesson.practice.question_order.length === 0, "canonical FRA-23 retained fixed practice, Diagnostic or Retrieval");
            assert(spec.lesson.exit.primary_question_refs.length === 5, "canonical FRA-23 final check is not M1-M5");
            assert(spec.lesson.exit.confirmation_question_refs.length === 27, "canonical FRA-23 does not include confirmations, supported repair checks, mini-checks and alternate final items");
          } else if (!canonicalLesson) {
            assert(spec.lesson.teaching_steps.length === 10, "teaching scene count is not 10");
            assert(spec.lesson.practice.question_order.length === 5, "practice count is not 5");
            assert(spec.lesson.exit.primary_question_refs.length === 2, "exit primary count is not 2");
            assert(spec.lesson.exit.confirmation_question_refs.length === 2, "confirmation count is not 2");
          }
          if (spec.canonical_lesson?.engine_profile === "fra07") {
            // Its authorised registry has no needs-work speech. Do not invent audio
            // to satisfy the legacy template's non-empty-script assumption.
            assert(spec.completion.secure.ryan_script && spec.completion.needs_work.title && spec.completion.needs_work.buttons.length === 2, "FRA-07 completion or recovery controls are incomplete");
            assert(spec.completion.needs_work.ryan_script === "", "FRA-07 added unauthorised needs-work speech");
          } else if (canonicalFra11) {
            assert(spec.completion.secure.ryan_script && spec.completion.needs_work.title, "FRA-11 completion or recovery branch is incomplete");
          } else {
            assert(spec.completion.secure.ryan_script && spec.completion.needs_work.ryan_script, "completion branches are incomplete");
          }
          if (topic.id === "decimal-calculation") assert(spec.question_bank.length === 20, `expected 20 authored Decimal items, found ${spec.question_bank.length}`);

          (spec.dependencies.required_skill_refs || []).filter((ref) => ref.startsWith(`${topic.skillPrefix}-`)).forEach((ref) => {
            assert(internalIds.has(ref), `missing internal prerequisite ${ref}`);
          });

          if (topic.id === "fractions" && !canonicalLesson) {
            spec.lesson.teaching_steps.forEach((step) => assertNarrationAsset(step.narration?.script, `${spec.identity.id} ${step.id}`));
            Object.values(spec.lesson.transfer_steps || {}).forEach((step) => assertNarrationAsset(step.pre_question_script, `${spec.identity.id} transfer`));
            assertNarrationAsset(spec.lesson.practice?.intro_script, `${spec.identity.id} practice intro`);
            assertNarrationAsset(spec.lesson.exit?.intro_script, `${spec.identity.id} exit intro`);
            assertNarrationAsset(spec.completion.secure.ryan_script, `${spec.identity.id} secure completion`);
            assertNarrationAsset(spec.completion.needs_work.ryan_script, `${spec.identity.id} needs-work completion`);
          }

          const model = buildLessonModel(spec);
          const expectedNodeCount = canonicalLesson
            ? spec.lesson.teaching_steps.length + Object.keys(spec.lesson.transfer_steps || {}).length + (spec.lesson.practice?.question_order || []).length + (spec.lesson.exit?.primary_question_refs || []).length
            : 20;
          assert(model.nodes.length === expectedNodeCount, `unexpected main lesson node count: ${model.nodes.length}`);
          assert(model.firstId === (canonicalLesson ? spec.lesson.teaching_steps[0].id : "T01"), "lesson does not begin at its approved opening scene");
          walkMainGraph(model);

          const interactiveTeaching = model.nodes.filter((node) => node.phase === "teaching" && node.kind === "question");
          const expectedTeachingQuestions = canonicalLesson ? spec.lesson.teaching_steps.filter((step) => step.learner_interaction?.question_ref).length : 3;
          assert(interactiveTeaching.length === expectedTeachingQuestions, `unexpected teaching checkpoint count: ${interactiveTeaching.length}`);
          (canonicalLesson ? [] : interactiveTeaching).forEach((node) => {
            assert(model.recoveryByOrigin.has(node.id), `${node.id} has no recovery handoff`);
            assert(model.getQuestion(model.recoveryByOrigin.get(node.id)), `${node.id} recovery item is missing`);
          });
          (canonicalLesson ? ["G1", "G2", "F1", "F2", "I1", "I2"] : ["G01", "F01", "I01"]).forEach((nodeId) => {
            assert(model.getNode(nodeId), `${nodeId} transfer node is missing`);
            if (!canonicalLesson) assert(model.recoveryByOrigin.has(nodeId), `${nodeId} recovery handoff is missing`);
          });
          if (canonicalFra16) {
            ["numerator_only", "denominator_only", "inconsistent_equivalence", "equality_rejected", "symbol_or_order_direction"].forEach((family) => {
              assert(Boolean(spec.lesson.adaptive_pathway.repair_by_error_family[family]), `${family} repair route is missing`);
              assert(Boolean(spec.lesson.adaptive_pathway.repair_supported_by_error_family[family]), `${family} supported repair check is missing`);
              assert(Boolean(spec.lesson.adaptive_pathway.repair_fresh_by_error_family[family]), `${family} fresh recheck is missing`);
            });
          }

          const inputProbe = new LessonEngine(document.createElement("div"), spec, dialogue, { topic });
          assert(inputProbe.storageKey === `revily.${topic.storageNamespace}.${spec.identity.id}.current.v1`, "storage key is not topic and skill safe");
          const firstNarration = spec.lesson.teaching_steps[0].narration.script;
          const openingLines = openingNarrationLines(topic, spec, firstNarration);
          if (canonicalLesson) {
            const authoredOpeningLines = [firstNarration].flat(Infinity).map(normaliseNarrationText).filter(Boolean);
            assert(openingLines.length === authoredOpeningLines.length, `${spec.identity.id} still prepends the generic opening to its authored hook`);
            assert(openingLines.join("|") === authoredOpeningLines.join("|"), `${spec.identity.id} did not begin with its approved lesson-specific hook`);
          } else {
            assert(openingLines.length === 3, "the lesson opening does not contain a lead, relatable hook and authored first explanation");
            const expectedOpeningLead = topic.openingNarration.skillLeads?.[spec.identity.id]
              || `Let's get started with ${spec.identity.title}.`;
            assert(openingLines[0] === expectedOpeningLead, "the human opening does not introduce the current lesson naturally");
            assert(openingLines[2] === normaliseNarrationText(firstNarration), "the human opening changed the authored first explanation");
          }
          assert(!openingLines.some((line) => /\b(?:FRA|DEC)-\d{2}\b/.test(line)), "the learner-facing opening exposes an internal skill id");
          inputProbe.state = inputProbe.freshState();
          inputProbe.persist = () => {};
          const firstNode = inputProbe.model.getNode(inputProbe.model.firstId);
          const authoredOpeningCount = [firstNarration].flat(Infinity).map(normaliseNarrationText).filter(Boolean).length;
          assert(inputProbe.narrationLinesFor(firstNode).length === (canonicalLesson ? authoredOpeningCount : 3), "the first lesson start queued the wrong opening sequence");
          assert(inputProbe.state.openingPlayed, "the human opening was not persisted as played");
          assert(inputProbe.narrationLinesFor(firstNode).length === authoredOpeningCount, "the human opening repeats within the same attempt");

          for (const question of spec.question_bank) {
            if (question.response) assert(supportedTypes.has(question.response.type), `unsupported response type ${question.response.type}`);
            const questionVisual = model.visualForQuestion(question, question.prompt);
            assert(supportedPrimitives.has(questionVisual.primitive), `unsupported visual primitive ${questionVisual.primitive}`);
            if (question.response && !question.policy?.reteachOnly && !question.policy?.engagementOnly && question.stage !== "repair" && !/-R-/.test(question.id)) {
              const correct = canonicalFra10 ? fra10Response(question, true) : (canonicalFra20 ? fra20Response(question, true) : (canonicalFra17 ? fra17Response(question, true) : (canonicalFra18 ? fra18Response(question, true) : (canonicalFra21 ? fra21Response(question, true) : (canonicalFra23 ? fra23Response(question, true) : (canonicalFra26 ? fra26Response(question, true) : correctResponse(question)))))));
              const wrong = canonicalFra10 ? fra10Response(question, false) : (canonicalFra20 ? fra20Response(question, false) : (canonicalFra17 ? fra17Response(question, false) : (canonicalFra18 ? fra18Response(question, false) : (canonicalFra21 ? fra21Response(question, false) : (canonicalFra23 ? fra23Response(question, false) : (canonicalFra26 ? fra26Response(question, false) : wrongResponse(question)))))));
              if (canonicalFra10) {
                assert(window.RevilyFra10Adapter.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra10Adapter.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra17) {
                assert(window.RevilyFra17Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra17Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra18) {
                assert(window.RevilyFra18Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra18Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra20) {
                assert(window.RevilyFra20Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra20Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra21) {
                assert(window.RevilyFra21Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra21Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra23) {
                assert(window.RevilyFra23Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra23Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra26) {
                assert(window.RevilyFra26Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra26Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra08) {
                assert(validate(question, correct), `${question.id} rejects its canonical answer`);
                assert(!validate(question, wrong), `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra09) {
                assert(window.RevilyFra09Adapter.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra09Adapter.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra15) {
                assert(window.RevilyFra15Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra15Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra22) {
                assert(window.RevilyFra22Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra22Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra24) {
                assert(window.RevilyFra24Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra24Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra27) {
                assert(window.RevilyFra27Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra27Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else if (canonicalFra28) {
                assert(window.RevilyFra28Canonical.evaluateResponse(question, correct).correct, `${question.id} rejects its canonical answer`);
                assert(!window.RevilyFra28Canonical.evaluateResponse(question, wrong).correct, `${question.id} accepts a deliberately wrong answer`);
              } else {
                assert(validate(question, correct), `${question.id} rejects its canonical answer`);
                assert(!validate(question, wrong), `${question.id} accepts a deliberately wrong answer`);
              }
              const inputMarkup = inputProbe.inputMarkup(question, null, false);
              assert(/<(?:input|button|select)\b/.test(inputMarkup), `${question.id} did not produce an answer control`);
              checkedAnswers += 2;
            }
            if (!canonicalLesson && !question.policy?.reteachOnly && !["diagnostic", "exit", "confirmation", "final"].includes(question.stage)) {
              assert(question.scripts.on_incorrect_attempt_1 || question.runtimeOutcome || question.policy?.hintPolicy === "optional" || question.response?.presentation === "guided_builder" || question.policy?.engagementOnly, `${question.id} has no first-response support path`);
              if (question.policy?.hintPolicy !== "optional" && !question.policy?.engagementOnly && question.response?.presentation !== "guided_builder" && !question.runtimeOutcome) assert(question.scripts.on_incorrect_attempt_2, `${question.id} has no second-incorrect script`);
            }
            const visualHost = document.createElement("div");
            renderVisual(visualHost, questionVisual, { spec, question, feedback: "initial" });
            assert(visualHost.innerHTML && !visualHost.innerHTML.includes("undefined"), `${question.id} initial visual did not render cleanly`);
            renderVisual(visualHost, questionVisual, { spec, question, feedback: "support" });
            assert(visualHost.innerHTML && !visualHost.innerHTML.includes("undefined"), `${question.id} support visual did not render cleanly`);
            renderedVisuals += 2;
          }

          for (const primitive of spec.engine_capability_requirements.visual_primitives || []) {
            if (nonVisualPrimitives.has(primitive)) continue;
            assert(supportedPrimitives.has(primitive), `declared primitive ${primitive} has no shared renderer`);
            const visualHost = document.createElement("div");
            renderVisual(visualHost, { primitive, description: spec.concept_model.core_idea }, { spec, feedback: "initial" });
            assert(visualHost.querySelector(`[data-primitive="${primitive}"]`), `${primitive} did not render through the shared visual registry`);
            renderedVisuals += 1;
          }

          for (const node of model.nodes) {
            const visualHost = document.createElement("div");
            renderVisual(visualHost, node.visual, { spec, question: node.question, narration: node.narration, feedback: "initial" });
            assert(visualHost.innerHTML && !visualHost.innerHTML.includes("undefined"), `${node.id} visual did not render cleanly`);
            renderedVisuals += 1;
          }

          if (spec.identity.id === "FRA-01") assertFra01VisualContract(spec, model, topic, dialogue);
          if (spec.identity.id === "FRA-02") assertFra02CanonicalContract(spec, model, topic, dialogue);
          if (spec.identity.id === "FRA-03") assertFra03CanonicalContract(spec, model, topic, dialogue);
          if (spec.identity.id === "FRA-04") assertFra04CanonicalContract(spec, model, topic, dialogue);
          if (spec.identity.id === "FRA-05") assertFra05CanonicalContract(spec, model, topic, dialogue);
          if (spec.identity.id === "FRA-06") assertFra06CanonicalContract(spec, model, topic, dialogue);
          if (spec.identity.id === "FRA-11") assertFra11CanonicalContract(spec, model, topic, dialogue);
          if (spec.identity.id === "FRA-16") assertFra16CanonicalContract(spec, model, topic, dialogue);
          if (spec.identity.id === "PA-01") assertPa01Contract(spec, model);
          if (["PA-02", "PA-03", "PA-04", "PA-05", "PA-06", "PA-07"].includes(spec.identity.id)) assertPaBatchContract(spec, model);

          if (!canonicalLesson) {
          const recoveryNode = interactiveTeaching[0];
          const correctHarness = createTestEngine(topic, spec, dialogue, recoveryNode.id);
          submitEngineResponse(correctHarness.engine, correctResponse(recoveryNode.question));
          assert(correctHarness.engine.state.resolved[recoveryNode.questionId] === "correct", "correct-first checkpoint did not resolve");
          correctHarness.engine.destroy();
          correctHarness.host.remove();

          const recoveryHarness = createTestEngine(topic, spec, dialogue, recoveryNode.id);
          const recoveryWrong = wrongResponse(recoveryNode.question);
          submitEngineResponse(recoveryHarness.engine, recoveryWrong);
          assert(recoveryHarness.engine.state.feedback[recoveryNode.questionId] === "first_incorrect", "first incorrect branch did not remain active for retry");
          assert(recoveryHarness.engine.root.querySelector("#answer-form input:not(:disabled), #answer-form button:not(:disabled)"), "first incorrect branch disabled learner input");
          submitEngineResponse(recoveryHarness.engine, recoveryWrong);
          assert(recoveryHarness.engine.state.pendingRecovery?.recoveryId === model.recoveryByOrigin.get(recoveryNode.id), "second incorrect branch did not prepare the authored recovery item");
          recoveryHarness.engine.advance(recoveryHarness.engine.current());
          assert(recoveryHarness.engine.state.cursor.startsWith("RECOVERY:"), "recovery item did not open");
          const recoveryQuestion = recoveryHarness.engine.current().question;
          const recoveryItemWrong = wrongResponse(recoveryQuestion);
          submitEngineResponse(recoveryHarness.engine, recoveryItemWrong);
          submitEngineResponse(recoveryHarness.engine, recoveryItemWrong);
          submitEngineResponse(recoveryHarness.engine, recoveryItemWrong);
          assert(!recoveryHarness.engine.state.resolved[recoveryQuestion.id], "additional incorrect recovery attempts silently resolved");
          assert(recoveryHarness.engine.root.querySelector("#answer-form input:not(:disabled), #answer-form button:not(:disabled)"), "worked recovery disabled learner correction");
          submitEngineResponse(recoveryHarness.engine, correctResponse(recoveryQuestion));
          assert(recoveryHarness.engine.state.resolved[recoveryQuestion.id], "canonical recovery response did not resolve");
          recoveryHarness.engine.finishRecovery();
          assert(recoveryHarness.engine.state.cursor === recoveryNode.nextId, "recovery did not return to the authored next scene");
          recoveryHarness.engine.destroy();
          recoveryHarness.host.remove();

          if (!canonicalLesson) {
          const exitHarness = createTestEngine(topic, spec, dialogue, model.getNode("E01").id);
          const exitFirst = exitHarness.engine.current();
          submitEngineResponse(exitHarness.engine, correctResponse(exitFirst.question));
          assert(exitHarness.engine.root.textContent.includes("Answer saved"), "exit answer disclosed feedback instead of deferring it");
          exitHarness.engine.advance(exitFirst);
          const exitSecond = exitHarness.engine.current();
          submitEngineResponse(exitHarness.engine, wrongResponse(exitSecond.question));
          assert(exitHarness.engine.state.cursor.startsWith("CONFIRM:"), "one-of-two exit score did not select a confirmation item");
          exitHarness.engine.advance(exitSecond);
          const confirmation = exitHarness.engine.current();
          assert(confirmation.confirmation, "confirmation view did not render");
          submitEngineResponse(exitHarness.engine, correctResponse(confirmation.question));
          assert(exitHarness.engine.state.exit.result === "SECURE", "correct confirmation did not produce SECURE");
          exitHarness.engine.finishExit();
          assert(exitHarness.engine.state.cursor === "COMPLETE", "secure exit did not reach completion");
          exitHarness.engine.destroy();
          exitHarness.host.remove();

          const needsHarness = createTestEngine(topic, spec, dialogue, model.getNode("E01").id);
          const needsFirst = needsHarness.engine.current();
          submitEngineResponse(needsHarness.engine, wrongResponse(needsFirst.question));
          needsHarness.engine.advance(needsFirst);
          const needsSecond = needsHarness.engine.current();
          submitEngineResponse(needsHarness.engine, wrongResponse(needsSecond.question));
          assert(needsHarness.engine.state.exit.result === "NEEDS_WORK", "zero-of-two exit score did not produce NEEDS_WORK");
          needsHarness.engine.finishExit();
          assert(needsHarness.engine.root.textContent.includes(spec.completion.needs_work.title), "needs-work completion did not render authored copy");
          needsHarness.engine.destroy();
          needsHarness.host.remove();
          }
          }

          const engineHost = document.createElement("div");
          fixture.appendChild(engineHost);
          const engine = new LessonEngine(engineHost, spec, dialogue, { topic });
          engine.state = engine.freshState();
          engine.persist = () => {};
          engine.emit = () => {};
          engine.mount();
          assert(engineHost.querySelector("#math-canvas"), "lesson teaching surface did not start");
          assert(engineHost.textContent.includes(spec.identity.title), "lesson title did not render from the specification");
          assert(engineHost.querySelector("#brand-home")?.getAttribute("aria-label") === `Back to ${topic.title}`, "topic return control is incorrect");
          engine.destroy();
          engineHost.remove();

          skillResults.push({ topic: topic.id, id: spec.identity.id, passed: true, assertions: assertions - before });
          report(spec.identity.id, true, `${spec.identity.title} — ${assertions - before} checks passed`);
        } catch (error) {
          failures += 1;
          skillResults.push({ topic: topic.id, id: spec.identity.id, passed: false, error: error.message });
          report(spec.identity.id, false, error.stack || error.message);
        }
      }
    }

    if (onlySkillId === "FRA-11") await assertFra11ResponsiveFrame();
    if (!onlySkillId) {
    await assertFra01ResponsiveFrames();
    await assertFra02ResponsiveFrames();
    await assertFra03ResponsiveFrames();
    await assertFra04ResponsiveFrames();
    await assertFra05ResponsiveFrames();
    await assertFra06ResponsiveFrame();
    await assertFra16ResponsiveFrame();
    await assertFra09ResponsiveFrames();

    const fra08 = fractionsTopic.packages.find(({ spec }) => spec.identity.id === "FRA-08").spec;
    const exactQuestion = fra08.question_bank.find((question) => question.response.type === "fraction" && question.response.accept_equivalent_notation === false);
    assert(Boolean(exactQuestion), "FRA-08 has no exact-notation fraction question");
    const [exactN, exactD] = String(exactQuestion.answer.value).split("/").map(BigInt);
    assert(validate(exactQuestion, { n: String(exactN), d: String(exactD) }), `${exactQuestion.id} rejects its authored exact fraction`);
    assert(!validate(exactQuestion, { n: String(exactN * 2n), d: String(exactD * 2n) }), `${exactQuestion.id} accepts an equivalent form when exact notation is required`);
    const equivalentQuestion = fractionsTopic.packages.flatMap(({ spec }) => spec.question_bank).find((question) => question.response.type === "fraction" && question.response.accept_equivalent_notation !== false);
    const canonicalFraction = parseRational(equivalentQuestion.answer.value);
    assert(validate(equivalentQuestion, { n: String(canonicalFraction.n * 2n), d: String(canonicalFraction.d * 2n) }), "exact rational equivalence is not accepted");

    const decimalQuestion = decimalsTopic.packages.find(({ spec }) => spec.identity.id === "DEC-05").spec.question_bank.find((question) => question.response.type === "decimal");
    const canonicalDecimal = parseDecimal(decimalQuestion.answer.value);
    assert(canonicalDecimal, "canonical Decimal answer did not parse exactly");
    assert(validate(decimalQuestion, `${decimalQuestion.answer.value}0`), "numeric-equivalent trailing-zero Decimal answer is not accepted");
    assert(!validate(decimalQuestion, wrongResponse(decimalQuestion)), "a deliberately wrong Decimal answer was accepted");

    const fra08Engine = new LessonEngine(document.createElement("div"), fra08, fractionsTopic.dialogue, { topic: fractionsTopic.topic });
    const dec08 = decimalsTopic.packages.find(({ spec }) => spec.identity.id === "DEC-08").spec;
    const dec08Engine = new LessonEngine(document.createElement("div"), dec08, decimalsTopic.dialogue, { topic: decimalsTopic.topic });
    assert(fra08Engine.storageKey !== dec08Engine.storageKey, "Fractions and Decimal progress keys collide");
    assert(fra08Engine.storageKey.includes(".fractions.FRA-08."), "Fractions legacy persistence namespace changed");
    assert(dec08Engine.storageKey.includes(".decimal-calculation.DEC-08."), "Decimal persistence namespace is incorrect");

    const narrationHost = document.createElement("div");
    narrationHost.innerHTML = `<section id="ryan"><strong id="status"></strong><p id="caption"></p><button id="replay"></button><button id="skip"></button></section><button id="primary"></button>`;
    fixture.appendChild(narrationHost);
    const fakeAudio = [];
    let fakeAudioPlays = 0;
    const legacyNarrationSpec = fractionsTopic.packages.find(({ spec }) => spec.identity.id === "FRA-02").spec;
    const narrationEngine = new LessonEngine(narrationHost, legacyNarrationSpec, fractionsTopic.dialogue, {
      topic: fractionsTopic.topic,
      narrationAssets: { "A paced test line.": { src: "/fractions/audio/test.mp3" } },
      speechSynthesis: null,
      createAudio(source) {
        const audio = { source, play: () => { fakeAudioPlays += 1; return Promise.resolve(); }, pause: () => {} };
        fakeAudio.push(audio);
        return audio;
      }
    });
    narrationEngine.state = narrationEngine.freshState();
    narrationEngine.state.started = true;
    narrationEngine.elements = {
      ryan: narrationHost.querySelector("#ryan"),
      ryanStatus: narrationHost.querySelector("#status"),
      caption: narrationHost.querySelector("#caption"),
      replay: narrationHost.querySelector("#replay"),
      skip: narrationHost.querySelector("#skip"),
      primary: narrationHost.querySelector("#primary")
    };
    let narrationAdvanced = 0;
    narrationEngine.startNarration(["A paced test line."], () => { narrationAdvanced += 1; });
    assert(fakeAudio.length === 1, "narration did not start its authored Ryan audio asset");
    assert(fakeAudioPlays === 1, "narration did not play its preloaded Ryan audio asset");
    fakeAudio[0].onerror();
    assert(narrationAdvanced === 0, "an audio error advanced the lesson");
    assert(Boolean(narrationEngine.activeNarration), "an audio error discarded replayable narration");
    assert(narrationEngine.elements.ryanStatus.textContent === "Ryan paused", "an audio error did not leave the scene paused");
    narrationEngine.replayNarration();
    assert(fakeAudio.length === 1 && fakeAudioPlays === 2, "replay did not restart the preloaded Ryan audio asset");
    narrationEngine.skipNarration();
    assert(narrationAdvanced === 1, "skip did not hand off the ordinary narrated scene");
    narrationEngine.stopNarration(false);
    const audioCountBeforeDelay = fakeAudio.length;
    const audioPlaysBeforeDelay = fakeAudioPlays;
    narrationEngine.startNarration(["A paced test line."], null, { delayMs: 60 });
    assert(fakeAudio.length === audioCountBeforeDelay, "delayed opening narration started audio immediately");
    assert(fakeAudioPlays === audioPlaysBeforeDelay, "delayed opening narration played before its pause elapsed");
    assert(narrationEngine.elements.ryanStatus.textContent === "Ryan will begin shortly", "delayed opening narration does not expose a clear waiting state");
    await new Promise((resolve) => window.setTimeout(resolve, 90));
    assert(fakeAudio.length === audioCountBeforeDelay && fakeAudioPlays === audioPlaysBeforeDelay + 1, "delayed opening narration did not start after its pause");
    narrationEngine.stopNarration(false);
    narrationHost.remove();
    }

    const passedSkills = skillResults.filter((skill) => skill.passed).length;
    const expectedSkillTotal = topicPackages.reduce((total, topicPackage) => total + topicPackage.manifest.skills.length, 0);
    status.textContent = failures ? `${failures} skill checks failed.` : onlySkillId ? `${onlySkillId} passed the focused shared-engine checks.` : `All ${expectedSkillTotal} registered skills passed the shared-engine checks.`;
    summary.hidden = false;
    summary.innerHTML = `<div><span>Skills rendered</span><strong>${passedSkills}/${onlySkillId ? 1 : expectedSkillTotal}</strong></div><div><span>Answers checked</span><strong>${checkedAnswers}</strong></div><div><span>Visual states rendered</span><strong>${renderedVisuals}</strong></div>`;
    window.__REVILY_SMOKE_RESULT__ = { passed: failures === 0, failures, assertions, checkedAnswers, renderedVisuals, skills: skillResults };
  } catch (error) {
    failures += 1;
    status.textContent = "The all-topic runner could not complete.";
    const failureDetail = error?.stack || error?.message || String(error);
    report("PACK", false, failureDetail);
    window.__REVILY_SMOKE_RESULT__ = { passed: false, failures, assertions, error: failureDetail, skills: skillResults };
  }
})();
