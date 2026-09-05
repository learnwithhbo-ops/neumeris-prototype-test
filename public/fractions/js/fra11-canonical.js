(function () {
  "use strict";

  const LESSON_ID = "FRA-11";
  const CONTENT_VERSION = "fra11-canonical-handoff-v1";
  const approved = window.RevilyFra11Approved;
  const runtimeCopy = window.FRA11_RUNTIME_COPY || approved?.FRA11_RUNTIME_COPY || {};
  const ui = approved?.FRA11_LEARNER_UI_COPY || {};
  const canonical = approved?.FRA11;
  const prefixed = (id) => `${LESSON_ID}-${id}`;
  const shortId = (id) => String(id || "").replace(`${LESSON_ID}-`, "");
  const textFor = (id) => {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA11 runtime utterance: ${id}`);
    return entry.text;
  };
  const textsFor = (ids) => (ids || []).map(textFor);

  function collectObjects(value, output) {
    if (Array.isArray(value)) return value.forEach((item) => collectObjects(item, output));
    if (!value || typeof value !== "object") return;
    output.push(value);
    Object.values(value).forEach((item) => collectObjects(item, output));
  }

  function validateRuntimeContract(registry, spec) {
    const selectedRegistry = registry || runtimeCopy;
    const issues = [...(approved?.validateFRA11CanonicalSpec?.() || [])];
    const textSet = new Set();
    Object.entries(selectedRegistry).forEach(([id, entry]) => {
      const text = String(entry?.text || "").trim();
      if (!text) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
      if (textSet.has(text)) issues.push(`${id} duplicates another runtime utterance`);
      textSet.add(text);
    });
    const objects = [];
    collectObjects(spec || { timelines: approved?.FRA11_TIMELINES, questions: approved?.FRA11_QUESTIONS, repairs: approved?.FRA11_REPAIRS }, objects);
    objects.forEach((object) => {
      if (Object.prototype.hasOwnProperty.call(object, "captionText")) issues.push("captionText is forbidden");
      if (object.utteranceId && object.anchorText) {
        const entry = selectedRegistry[object.utteranceId];
        if (!entry) issues.push(`Cue points to missing utterance ${object.utteranceId}`);
        else if (!entry.text.includes(String(object.anchorText))) issues.push(`Cue anchor is absent from ${object.utteranceId}`);
      }
      Object.entries(object).forEach(([key, value]) => {
        if ((key === "runtimeUtteranceIds" || key.endsWith("UtteranceIds")) && Array.isArray(value)) {
          value.forEach((id) => { if (!selectedRegistry[id]) issues.push(`Missing runtime utterance ${id}`); });
        }
      });
    });
    return [...new Set(issues)];
  }

  function responseFor(question) {
    const response = question.response || {};
    if (response.kind === "mixed_number_fixed_denominator") {
      return {
        type: "mixed_number",
        presentation: "fixed_denominator",
        fixedDenominator: response.fixedDenominator,
        input_label: "Mixed-number answer"
      };
    }
    if (response.kind === "mixed_number_full_fraction") {
      return { type: "mixed_number", presentation: "full_fraction", input_label: "Mixed-number answer" };
    }
    if (response.kind === "division_then_mixed") {
      return {
        type: "division_then_mixed",
        fixedDenominator: response.fixedDenominator,
        linkedFromSingleMathObject: true,
        input_label: "Linked division and mixed-number answer"
      };
    }
    if (response.kind === "whole_number") {
      return { type: "integer", input_label: question.visual?.accessibleInputLabel || "whole-number answer field" };
    }
    if (response.kind === "multiple_choice") {
      const options = ui.options?.[response.optionsKey] || [];
      return {
        type: "single_choice",
        options: options.map((option) => option.text),
        optionIds: options.map((option) => option.id),
        keyboard_submit: true
      };
    }
    return { type: "single_choice", options: [ui.controls?.continue || "Continue"], keyboard_submit: true };
  }

  function answerFor(question) {
    const expected = question.expected || {};
    if (question.response.kind === "division_then_mixed") {
      return {
        quotient: String(expected.quotient), remainder: String(expected.remainder),
        whole: String(expected.whole), n: String(expected.fractionNumerator), d: String(expected.fractionDenominator)
      };
    }
    if (["mixed_number_fixed_denominator", "mixed_number_full_fraction"].includes(question.response.kind)) {
      return { whole: String(expected.whole), n: String(expected.fractionNumerator), d: String(expected.fractionDenominator) };
    }
    if (question.response.kind === "whole_number") return String(expected.whole);
    if (question.response.kind === "multiple_choice") {
      const options = ui.options?.[question.response.optionsKey] || [];
      return options.find((option) => option.id === expected.optionId)?.text || expected.optionId;
    }
    return ui.controls?.continue || "Continue";
  }

  function visibleWorkedSteps(question) {
    const key = question.workedCheck?.visibleStepsKey;
    return [...(question.workedCheck?.visibleSteps || (key ? ui.workedChecks?.[key] : []) || [])];
  }

  function optionId(question, response) {
    if (question.runtimeQuestionData?.response?.kind !== "multiple_choice") return null;
    const options = ui.options?.[question.runtimeQuestionData.response.optionsKey] || [];
    return options.find((option) => option.text === String(response))?.id || String(response || "");
  }

  function mixedResponse(response, fixedDenominator) {
    if (!response || typeof response !== "object") return null;
    const whole = Number(response.whole);
    const fractionNumerator = Number(response.n ?? response.fractionNumerator);
    const rawDenominator = response.d ?? response.fractionDenominator ?? fixedDenominator;
    const fractionDenominator = rawDenominator === undefined ? undefined : Number(rawDenominator);
    if (!Number.isInteger(whole)) return null;
    return { whole, fractionNumerator, fractionDenominator };
  }

  function signalFor(question, response) {
    const data = question.runtimeQuestionData || question;
    const expected = data.expected || {};
    if (data.response?.kind === "multiple_choice") return optionId(question, response);
    if (data.response?.kind === "division_then_mixed" && response && typeof response === "object") {
      if (Number(response.quotient) > expected.quotient || Number(response.whole) > expected.whole) return "quotient_too_high";
      if (Number(response.quotient) !== Number(response.whole) || Number(response.remainder) !== Number(response.n)) return "whole_and_remainder_fields_swapped";
      if (Number(response.remainder) !== expected.remainder || Number(response.n) !== expected.fractionNumerator) return "remainder_wrong";
    }
    const mixed = mixedResponse(response, data.response?.fixedDenominator);
    if (!mixed) return null;
    if (mixed.fractionDenominator !== undefined && mixed.fractionDenominator !== expected.fractionDenominator) return "denominator_changed";
    if (mixed.whole === expected.fractionNumerator && mixed.fractionNumerator === expected.whole) return "whole_and_remainder_fields_swapped";
    if (mixed.whole > expected.whole || mixed.fractionNumerator >= expected.fractionDenominator) {
      return data.id === "G2" ? "quotient_too_high" : data.id === "M1" ? "whole_part_six" : "whole_part_too_high_or_partial_group";
    }
    if (mixed.fractionNumerator === 0 || response?.n === "" || response?.fractionNumerator === "") {
      return data.id === "M1" ? "quotient_only_five" : "remainder_ignored";
    }
    if (data.id === "G2" && mixed.fractionNumerator !== expected.fractionNumerator) return "remainder_wrong";
    return null;
  }

  function chooseOutcome(data, response, classification) {
    const outcomes = data.outcomes || {};
    if (classification === "canonical_correct") return outcomes.correct || {};
    if (classification === "value_correct_noncanonical_exact_whole") {
      return outcomes.valueCorrectNoncanonical || outcomes.valueCorrectZeroFraction || outcomes.valueCorrectWholePlusOne || outcomes.defaultIncorrect || {};
    }
    const signal = signalFor({ runtimeQuestionData: data }, response);
    if (data.response?.kind === "multiple_choice") {
      return (outcomes.knownIncorrect || []).find((item) => item.optionId === signal) || outcomes.defaultIncorrect || {};
    }
    return (outcomes.knownIncorrect || []).find((item) => item.signal === signal) || outcomes.defaultIncorrect || {};
  }

  function classifyResponse(question, response) {
    const data = question.runtimeQuestionData || question;
    if (!data?.math) return { classification: "incorrect", correct: false, outcome: {}, errorFamily: question.primaryErrorFamily || "ARITH" };
    let classification = "incorrect";
    if (data.response.kind === "division_then_mixed") {
      const expected = data.expected;
      const valid = response && typeof response === "object"
        && ["quotient", "remainder", "whole", "n"].every((key) => /^\d+$/.test(String(response[key] ?? "")))
        && Number(response.quotient) === expected.quotient
        && Number(response.remainder) === expected.remainder
        && Number(response.whole) === expected.whole
        && Number(response.n) === expected.fractionNumerator
        && Number(response.d ?? data.response.fixedDenominator) === expected.fractionDenominator;
      classification = valid ? "canonical_correct" : "incorrect";
    } else if (data.response.kind === "multiple_choice") {
      classification = optionId(question, response) === data.expected.optionId ? "canonical_correct" : "incorrect";
    } else if (data.response.kind === "whole_number") {
      if (response && typeof response === "object") {
        classification = approved.classifyMixedNumberResponse({ numerator: data.math.numerator, denominator: data.math.denominator, response: mixedResponse(response) });
      } else {
        classification = /^\d+$/.test(String(response ?? "")) && Number(response) === data.expected.whole ? "canonical_correct" : "incorrect";
      }
    } else {
      const submitted = mixedResponse(response, data.response.fixedDenominator);
      classification = submitted
        ? approved.classifyMixedNumberResponse({ numerator: data.math.numerator, denominator: data.math.denominator, response: submitted })
        : "incorrect";
    }
    const outcome = chooseOutcome(data, response, classification);
    const visibleFeedback = outcome.visibleFeedbackKey ? ui.visibleFeedback?.[outcome.visibleFeedbackKey] || "" : "";
    const signal = signalFor(question, response);
    const familyBySignal = {
      whole_part_too_high_or_partial_group: "R-GROUP", quotient_too_high: "R-GROUP", whole_part_six: "R-GROUP",
      remainder_ignored: "R-LEFTOVER", quotient_only_five: "R-LEFTOVER", remainder_wrong: "R-LEFTOVER",
      denominator_changed: "R-DENOM", whole_and_remainder_fields_swapped: "R-FIELDS"
    };
    const errorFamily = classification === "canonical_correct"
      ? null
      : outcome.errorFamily || (classification === "value_correct_noncanonical_exact_whole" ? null : (familyBySignal[signal] || (data.math.remainder === 0 ? "R-ZERO" : "ARITH")));
    return {
      correct: classification === "canonical_correct",
      classification,
      outcome,
      signal,
      errorFamily,
      runtimeUtteranceIds: [...(outcome.runtimeUtteranceIds || [])],
      visibleFeedback
    };
  }

  function convertQuestion(question, overrides) {
    const worked = visibleWorkedSteps(question);
    const evaluation = classifyResponse;
    const correctIds = [...(question.outcomes?.correct?.runtimeUtteranceIds || [])];
    const incorrectIds = [...(question.outcomes?.defaultIncorrect?.runtimeUtteranceIds || [])];
    const hintUtteranceIds = question.hint?.utteranceId ? [question.hint.utteranceId] : [];
    return Object.assign({
      id: prefixed(question.id),
      stage: ["final", "recovery_final"].includes(question.stage) ? "exit" : question.stage,
      target: question.assessmentIntent,
      assessmentIntent: question.assessmentIntent,
      evidenceFamily: question.evidenceFamily,
      prompt: ui.questionPrompts?.[question.promptKey] || "",
      questionDetail: "",
      model: Object.assign({
        context: "fra11_improper_to_mixed",
        questionId: question.id,
        math: question.math,
        canonicalSignature: question.math ? `${question.math.numerator}/${question.math.denominator}` : question.id
      }, question.visual || {}),
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.hint?.policy === "optional" ? "optional" : "none",
        solutionPolicy: question.workedCheck?.revealWhen === "answerLocked" ? "after_locked_submit" : "after_response",
        scored: question.response?.scored !== false,
        engagementOnly: question.response?.scored === false,
        answerLocksOnSubmit: question.response?.answerLock === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.hint?.policy === "optional",
        countsAsIndependentEvidence: ["independent", "final", "recovery_final", "confirmation", "repair_check"].includes(question.stage),
        canonicalSignature: question.math ? `${question.math.numerator}/${question.math.denominator}` : question.id
      },
      attempt_policy: { submit_label: ui.controls?.lockAnswer || "Lock answer" },
      visual: { primitive: "fra11_context", action: "focus", description: ui.questionPrompts?.[question.promptKey] || question.assessmentIntent },
      scripts: {
        before_submit: [],
        on_correct_reaction: textsFor(correctIds)[0] || "",
        on_correct_math: "",
        on_incorrect_reaction: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_1: textsFor(incorrectIds)[0] || "",
        on_incorrect_attempt_2: textsFor(incorrectIds)[0] || "",
        worked_explanation: worked.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_narration: [],
        response_feedback: {},
        error_family_feedback: {}
      },
      runtimeOutcome: { correctUtteranceIds: correctIds, incorrectDefaultUtteranceIds: incorrectIds },
      runtimeHintUtteranceIds: hintUtteranceIds,
      mathematical_support: hintUtteranceIds.length ? { hint_1: textFor(hintUtteranceIds[0]) } : {},
      runtimeQuestionId: question.id,
      runtimeQuestionData: question,
      validationProfile: "fra11",
      errorClassification: { kind: "fra11", requiresRepeatedEvidence: true, fallback: "ARITH" },
      primaryErrorFamily: question.outcomes?.defaultIncorrect?.errorFamily
        || ({ M1: "R-GROUP", M2: "R-GROUP", M3: "R-ZERO", M4: "R-GROUP", M5: "R-DENOM" }[question.id])
        || "ARITH",
      evaluateResponse: evaluation
    }, overrides || {});
  }

  const repairModels = {
    "R-GROUP": { math: { numerator: 17, denominator: 5, quotient: 3, remainder: 2 }, kind: "repair_grouping", input: { type: "integer", input_label: "Complete groups" }, answer: "3" },
    "R-LEFTOVER": { math: { numerator: 26, denominator: 5, quotient: 5, remainder: 1 }, kind: "repair_leftover", input: { type: "integer", input_label: "Fractional numerator" }, answer: "1" },
    "R-DENOM": { math: { numerator: 18, denominator: 7, quotient: 2, remainder: 4 }, kind: "repair_denominator", input: { type: "integer", input_label: "Original denominator" }, answer: "7" },
    "R-FIELDS": { math: { numerator: 23, denominator: 6, quotient: 3, remainder: 5 }, kind: "repair_fields", input: { type: "division_then_mixed", fixedDenominator: 6, linkedFromSingleMathObject: true }, answer: { quotient: "3", remainder: "5", whole: "3", n: "5", d: "6" } },
    "R-ZERO": { math: { numerator: 32, denominator: 8, quotient: 4, remainder: 0 }, kind: "repair_zero", input: { type: "integer", input_label: "Whole-number answer field" }, answer: "4" }
  };

  function convertRepair(id, repair) {
    const example = repairModels[id];
    const correctFeedback = id === "R-GROUP" ? "Three complete groups use fifteen fifths; two fifths remain."
      : id === "R-LEFTOVER" ? "One fifth remains, so 1 is the fractional numerator."
      : id === "R-DENOM" ? "The pieces remain sevenths, so the denominator stays 7."
      : id === "R-FIELDS" ? "The quotient is in front, the remainder is on top, and 6 stays underneath."
      : "Four complete wholes leave no fractional part.";
    const incorrectFeedback = id === "R-GROUP" ? "Count only complete groups of five."
      : id === "R-LEFTOVER" ? "Subtract the twenty-five fifths already used in complete groups."
      : id === "R-DENOM" ? "The part size has not changed."
      : id === "R-FIELDS" ? "Use quotient in front and remainder on top."
      : "No eighth-sized piece is left over.";
    return {
      id: prefixed(id), stage: "repair", target: repair.title, prompt: repair.title,
      assessmentIntent: `supported_repair_${id}`, evidenceFamily: id,
      model: { context: "fra11_improper_to_mixed", questionId: id, kind: example.kind, math: example.math, supportedInteraction: repair.supportedInteraction },
      response: example.input, answer: { value: example.answer },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: ui.controls?.continue || "Continue" },
      visual: { primitive: "fra11_context", action: "repair", description: repair.title },
      scripts: {
        reteach: textsFor(repair.runtimeUtteranceIds),
        engagement_correct_feedback: correctFeedback,
        engagement_incorrect_feedback: incorrectFeedback,
        // Owner-facing interaction directions stay in the visual model only. They
        // are neither learner copy nor Ryan copy, so they must not enter the UI.
        engagement_detail: "",
        engagement_correct_response: [], engagement_incorrect_response: [], engagement_response: [],
        worked_explanation: "", worked_narration: [], response_feedback: {}, error_family_feedback: {}
      },
      runtimeQuestionId: id,
      runtimeQuestionData: null,
      validationProfile: id === "R-FIELDS" ? "fra11_repair_linked" : null,
      primaryErrorFamily: id,
      freshCheckId: prefixed(repair.freshCheckId)
    };
  }

  function sceneCues(sceneId) {
    return (approved.FRA11_TIMELINES?.[sceneId] || []).map((cue) => ({
      id: cue.cueId,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.cueId,
      authorAction: cue.action,
      reducedMotionAction: cue.reducedMotionAction,
      accessibleLabel: ui.accessibleDescriptions?.[sceneId] || "Improper-fraction regrouping model"
    }));
  }

  const sceneModels = {
    HOOK: { kind: "contextual_equal_pieces", sceneId: "HOOK", math: { numerator: 13, denominator: 4, quotient: 3, remainder: 1 }, totalPieces: 13, partsPerWhole: 4, grouping: [4, 4, 4, 1], unitLabel: "¼ m", context: "quarter_metre_border_tiles" },
    T1: { kind: "equal_pieces", sceneId: "T1", math: { numerator: 14, denominator: 5, quotient: 2, remainder: 4 }, totalPieces: 14, partsPerWhole: 5, grouping: [5, 5, 4] },
    T2: { kind: "linked_division_and_mixed_fields", sceneId: "T2", math: { numerator: 14, denominator: 5, quotient: 2, remainder: 4 } },
    T3: { kind: "symbolic_rule", sceneId: "T3", math: { numerator: 23, denominator: 6, quotient: 3, remainder: 5 } },
    T4: { kind: "remainder_check", sceneId: "T4", math: { numerator: 19, denominator: 4, quotient: 4, remainder: 3 }, invalid: { quotient: 3, remainder: 7 } },
    T5: { kind: "exact_whole", sceneId: "T5", math: { numerator: 18, denominator: 6, quotient: 3, remainder: 0 }, totalPieces: 18, partsPerWhole: 6, grouping: [6, 6, 6] },
    HANDOFF: { kind: "rule_summary", sceneId: "HANDOFF", rule: canonical.mentalModel }
  };

  const sceneTitles = {
    HOOK: "Quarter-metre border tiles", T1: "Build complete wholes", T2: "Connect grouping to division",
    T3: "Write the mixed number", T4: "The remainder must be smaller", T5: "When nothing is left", HANDOFF: "Use the regrouping rule"
  };

  function teachingStep(id, nextId) {
    const utteranceIds = Object.keys(runtimeCopy).filter((runtimeId) => runtimeId.startsWith(`${id}.`) && /^\d+$/.test(runtimeId.split(".").at(-1)));
    const cues = sceneCues(id);
    return {
      id, purpose: sceneTitles[id],
      scene: { display_title: sceneTitles[id], initial_state: sceneTitles[id], objects: [sceneModels[id].kind], model: Object.assign({ context: "fra11_improper_to_mixed" }, sceneModels[id]) },
      narration: { script: textsFor(utteranceIds), utterance_ids: utteranceIds, sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, reducedMotionAction: cue.reducedMotionAction, duration_ms: 650 })),
      learner_action: id === "HOOK" ? { button: "Start lesson" } : null,
      next_step: nextId
    };
  }

  function generatedQuestion(seed, usedPairs) {
    const candidates = [[38, 7], [43, 8], [47, 9], [41, 6], [53, 10], [58, 11]];
    const used = new Set(usedPairs || []);
    const rotated = [...candidates.slice(seed % candidates.length), ...candidates.slice(0, seed % candidates.length)];
    const pair = rotated.find(([n, d]) => !used.has(`${n}/${d}`) && approved.gcd(n % d, d) === 1) || candidates[seed % candidates.length];
    const [numerator, denominator] = pair;
    const solved = approved.solveImproperFraction(numerator, denominator);
    const id = `GENERATED-R${seed + 1}`;
    const data = {
      id, stage: "recovery_final", assessmentIntent: "Deterministic fresh direct recovery evidence", evidenceFamily: "direct_conversion",
      promptKey: null, copyAuthority: "FRA11 recovery generator constraints", math: { numerator, denominator, quotient: solved.whole, remainder: solved.remainder },
      response: { kind: "mixed_number_fixed_denominator", editableFields: ["whole", "fractionNumerator"], fixedDenominator: denominator, answerLock: true },
      expected: { whole: solved.whole, fractionNumerator: solved.remainder, fractionDenominator: denominator, display: `${solved.whole} ${solved.remainder}/${denominator}` },
      hint: null,
      outcomes: { correct: { runtimeUtteranceIds: ["FINAL.CORRECT"], errorFamily: null }, defaultIncorrect: { runtimeUtteranceIds: ["FINAL.INCORRECT"], errorFamily: null } },
      visual: { kind: "symbolic_fraction", showDivisionBeforeSubmit: false, showGroupingBeforeSubmit: false },
      workedCheck: { revealWhen: "answerLocked", visibleSteps: [`${numerator} ÷ ${denominator} = ${solved.whole} remainder ${solved.remainder}.`, `${numerator}/${denominator} = ${solved.whole} ${solved.remainder}/${denominator}.`] }
    };
    return convertQuestion(data, { prompt: `Convert ${numerator}/${denominator} to a mixed number.`, generatedRecovery: true, generationSeed: seed + 1 });
  }

  function selectFreshRecoveryQuestionIds(params) {
    const count = Number(params?.count) || 2;
    const seenIds = new Set((params?.seenQuestionIds || []).map(shortId));
    const seenPairs = new Set(params?.seenPairs || []);
    const familyOrder = [...new Set(params?.missedFamilies || [])];
    const dataById = new Map(approved.FRA11_QUESTIONS.map((question) => [question.id, question]));
    const pool = [...canonical.recoveryPolicy.freshPool];
    const preferred = ["MINI-1", "MINI-2", ...pool.filter((id) => !id.startsWith("MINI-"))];
    const selected = [];
    const add = (id) => {
      const item = dataById.get(id);
      if (!item || seenIds.has(id) || selected.includes(prefixed(id))) return;
      const pair = item.math ? `${item.math.numerator}/${item.math.denominator}` : null;
      if (pair && seenPairs.has(pair)) return;
      selected.push(prefixed(id));
      if (pair) seenPairs.add(pair);
    };
    ["MINI-1", "MINI-2"].forEach(add);
    familyOrder.forEach((family) => pool.filter((id) => dataById.get(id)?.evidenceFamily === family).forEach(add));
    preferred.forEach(add);
    let generatedSeed = 0;
    while (selected.length < count) {
      const generated = generatedQuestion(generatedSeed++, seenPairs);
      selected.push(generated.id);
      seenPairs.add(`${generated.model.math.numerator}/${generated.model.math.denominator}`);
    }
    return { ids: selected.slice(0, count), generatedSeeds: [...Array(generatedSeed)].map((_, index) => index + 1) };
  }

  function apply(baseSpec) {
    approved.assertFRA11CanonicalSpec();
    const contractIssues = validateRuntimeContract();
    if (contractIssues.length) throw new Error(`FRA11 runtime contract failed: ${contractIssues.join("; ")}`);
    const spec = baseSpec;
    const converted = approved.FRA11_QUESTIONS.filter((question) => question.id !== "HOOK").map((question) => convertQuestion(question));
    const repairs = Object.entries(approved.FRA11_REPAIRS).filter(([id]) => id !== "ARITH").map(([id, repair]) => convertRepair(id, repair));
    const question = (id) => converted.find((item) => item.id === prefixed(id));
    const before = { G1: ["G1.PRE"], G2: ["G2.PRE"], F1: ["F1.PRE"], F2: ["F2.PRE"], I1: ["INDEPENDENT.INTRO"], I2: ["I2.PRE"] };
    Object.entries(before).forEach(([id, ids]) => { question(id).scripts.before_submit = textsFor(ids); });

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: canonical.title, cluster: "Fractions" });
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-02", "FRA-06"] });
    spec.diagnostic = { enabled: false, question_refs: [] };
    spec.retrieval_practice = { enabled: false, question_refs: [] };
    spec.question_bank = [...converted, ...repairs];
    spec.lesson = {
      teaching_steps: canonical.route.orderedTeaching.map((id, index, ids) => teachingStep(id, ids[index + 1] || "G1")),
      transfer_steps: {
        G1: { stage: "guided", support_level: "high", question_ref: prefixed("G1"), pre_question_script: textsFor(["G1.PRE"]), correct_next: "G2" },
        G2: { stage: "guided", support_level: "high", question_ref: prefixed("G2"), pre_question_script: textsFor(["G2.PRE"]), correct_next: "F1" },
        F1: { stage: "faded", support_level: "medium", question_ref: prefixed("F1"), pre_question_script: textsFor(["F1.PRE"]), correct_next: "F2" },
        F2: { stage: "faded", support_level: "medium", question_ref: prefixed("F2"), pre_question_script: textsFor(["F2.PRE"]), correct_next: "I1" },
        I1: { stage: "independent", support_level: "low", question_ref: prefixed("I1"), pre_question_script: textsFor(["INDEPENDENT.INTRO"]), correct_next: "I2" },
        I2: { stage: "independent", support_level: "low", question_ref: prefixed("I2"), pre_question_script: textsFor(["I2.PRE"]), correct_next: "M1" }
      },
      practice: { enabled: false, question_order: [] },
      adaptive_pathway: {
        skip_after: { G2: { questionRefs: [prefixed("G1"), prefixed("G2")], next: "F2", otherwise: "F1" } },
        no_hint_gate_after: { nodeId: "I2", returnId: "M1", introUtteranceIds: [] },
        no_hint_confirmation_by_question: Object.fromEntries(Object.entries(canonical.route.hintConfirmationMap).map(([from, to]) => [prefixed(from), prefixed(to)])),
        repair_by_error_family: {
          "R-GROUP": prefixed("R-GROUP"), "R-LEFTOVER": prefixed("R-LEFTOVER"), "R-DENOM": prefixed("R-DENOM"),
          "R-FIELDS": prefixed("R-FIELDS"), "R-ZERO": prefixed("R-ZERO")
        },
        fresh_checks_by_error_family: {
          "R-GROUP": [prefixed("RG-C")], "R-LEFTOVER": [prefixed("RL-C")], "R-DENOM": [prefixed("RD-C")],
          "R-FIELDS": [prefixed("RF-C")], "R-ZERO": [prefixed("RZ-C")], ARITH: [prefixed("MINI-1"), prefixed("MINI-2")]
        },
        feedback_by_error_family: Object.fromEntries(Object.entries(canonical.misconceptions).map(([family, data]) => [family, ui.visibleFeedback?.[data.immediateFeedbackKey] || ""])),
        mastery_model: { profile: "fra11", strongRouteSkipsF1ButKeepsF2: true }
      },
      exit: {
        intro_script: textsFor(["FINAL.INTRO"]),
        use_question_before_submit_narration: false,
        primary_question_refs: ["M1", "M2", "M3", "M4", "M5"].map(prefixed),
        confirmation_question_refs: ["C1", "C2", "RG-C", "RL-C", "RD-C", "RF-C", "RZ-C", "MINI-1", "MINI-2"].map(prefixed),
        mastery_policy: { profile: "fra11_five_item", secureMinimum: 4, requireMoreThanOneEvidenceFamily: true, blockRepeatedCentralMisconception: true, repeatedCentralFamilies: ["R-GROUP", "R-LEFTOVER", "R-DENOM", "R-FIELDS", "R-ZERO"] },
        fra11_recovery: { twoItemCount: 2, threeItemCount: 3, freshPool: canonical.recoveryPolicy.freshPool.map(prefixed), generatorSeedVersion: "fra11-v1-deterministic-candidates" }
      }
    };
    spec.completion = {
      secure: { title: "Conversion rule secure", summary: canonical.scope.studentFacingIdea, ryan_script: textFor(canonical.route.completionUtteranceId) },
      needs_work: { title: "Keep building complete wholes", summary: canonical.scope.studentFacingIdea, ryan_script: "" }
    };
    spec.voice_and_script = {
      opening_mode: "authored_scene_only",
      voice: "Microsoft Ryan",
      voice_id: "en-GB-RyanNeural",
      script_policy: "FRA11_RUNTIME_COPY only",
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 },
      caption_presentation: { mode: "on_canvas_progressive", reveal: "word_by_word", source: "same_runtime_utterance_as_audio", hide_empty: true }
    };
    spec.visual_language = { primary_visual_contract: { primitive: "fra11_context", equal_piece_geometry: true, oneDominantModelAtATime: true } };
    spec.engine_capability_requirements = {
      visual_primitives: ["fra11_context", "mixed_number_input", "integer_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"],
      capabilities: ["registry_only_narration", "progressive_captions", "utterance_anchor_cues", "answer_lock", "fresh_confirmation", "targeted_repair", "five_item_final"]
    };
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: ui.controls?.lockAnswer || "Lock answer", continue: ui.controls?.continue || "Continue" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      engine_profile: "fra11",
      version: CONTENT_VERSION,
      status: "FRA11 IMPLEMENTATION CANDIDATE / READY FOR OWNER REVIEW",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      runtime_copy_policy: canonical.runtimeSurfaceContract,
      approved_source: approved,
      route_contract: canonical.route,
      recovery_contract: canonical.recoveryPolicy,
      phase_labels: { teaching: ui.stageLabels.teach, guided: ui.stageLabels.guided, faded: ui.stageLabels.faded, independent: ui.stageLabels.independent, repair: ui.stageLabels.repair, exit: ui.stageLabels.final, completion: "Complete" }
    };
    return spec;
  }

  function validateQuestionModel(question) {
    const model = question?.model;
    const issues = [];
    if (!model || model.context !== "fra11_improper_to_mixed") return ["FRA11 model context is missing"];
    const math = model.math;
    if (math) {
      if (math.numerator !== math.denominator * math.quotient + math.remainder) issues.push("n = d × q + r failed");
      if (math.remainder < 0 || math.remainder >= math.denominator) issues.push("remainder is outside 0 ≤ r < d");
    }
    return issues;
  }

  function ensureGeneratedQuestion(engine, id, seed) {
    let question = engine.model.getQuestion(id);
    if (question) return question;
    question = generatedQuestion(Number(seed || String(id).match(/\d+/)?.[0] || 1) - 1, []);
    engine.model.questions.set(question.id, question);
    return question;
  }

  window.RevilyFra11Canonical = {
    CONTENT_VERSION,
    apply,
    classifyResponse,
    evaluateResponse: classifyResponse,
    ensureGeneratedQuestion,
    generatedQuestion,
    selectFreshRecoveryQuestionIds,
    validateQuestionModel,
    validateRuntimeContract
  };
})();
