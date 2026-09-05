(function () {
  "use strict";

  const LESSON_ID = "FRA-13";
  const CONTENT_VERSION = "fra13-fraction-of-amount-v1";
  const source = window.RevilyFra13V1;
  const approved = source?.spec;
  const runtimeCopy = source?.runtimeCopy || {};
  const problems = source?.problems || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = {
    stops_after_one_share: prefix("R-ONE"),
    wrong_grouping: prefix("R-GROUP"),
    divide_by_numerator: prefix("R-NUMDIV"),
    numerator_only: prefix("R-OPERATOR")
  };
  const freshByFamily = {
    general_process: [prefix("C-PROC")],
    money: [prefix("C-MONEY")],
    stops_after_one_share: [prefix("C-ONE")],
    wrong_grouping: [prefix("C-GROUP")],
    divide_by_numerator: [prefix("C-NUMDIV")],
    numerator_only: [prefix("C-OPERATOR")],
    unknown: [prefix("C-PROC"), prefix("C-MONEY"), prefix("C-ONE"), prefix("C-GROUP"), prefix("C-NUMDIV"), prefix("C-OPERATOR")]
  };
  const sceneTitles = {
    HOOK: "Pick before the reveal",
    T1: "The denominator makes equal shares",
    T2: "Find one share",
    T3: "The numerator takes the shares",
    T4: "See the method in a new amount",
    HANDOFF: "Now you take over"
  };

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA13 runtime utterance: ${id}`);
    return entry;
  }

  function textFor(id) {
    return runtimeEntry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function problemFor(id) {
    const problem = problems[id];
    if (!problem) throw new Error(`Missing FRA13 problem: ${id}`);
    return problem;
  }

  function normaliseMoneyToPence(value) {
    if (typeof value === "number" && Number.isInteger(value)) return value;
    const text = String(value ?? "").trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
    const pence = text.match(/^([+-]?\d+)\s*p(?:ence)?$/i);
    if (pence) return Number.isSafeInteger(Number(pence[1])) ? Number(pence[1]) : null;
    const pounds = text.replace(/^£\s*/, "");
    const match = pounds.match(/^([+-]?)(\d+)(?:\.(\d{1,2}))?$/);
    if (!match) return null;
    const sign = match[1] === "-" ? -1 : 1;
    const whole = Number(match[2]);
    const fraction = (match[3] || "").padEnd(2, "0");
    const result = sign * (whole * 100 + Number(fraction || 0));
    return Number.isSafeInteger(result) ? result : null;
  }

  function decimalValue(value) {
    const text = String(value ?? "").trim().replace(/−/g, "-");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function stableObjectKey(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return String(value ?? "");
    return Object.keys(value).sort().map((key) => `${key}=${value[key] ?? ""}`).join("|");
  }

  function responseKey(question, response) {
    if (question?.response?.type === "money") return `pence:${normaliseMoneyToPence(response)}`;
    if (question?.response?.type === "quantity") return `quantity:${decimalValue(response)}`;
    if (question?.response?.type === "two_step_integer") return stableObjectKey(response);
    return String(response ?? "");
  }

  function questionId(question) {
    return question?.canonicalQuestionId || unprefix(question?.id);
  }

  function matchingIncorrectUtteranceIds(question, response) {
    const id = questionId(question);
    const outcome = question?.runtimeOutcome || {};
    const value = response && typeof response === "object" ? response : String(response ?? "");
    if (id === "G1" && String(value) === "4") return outcome.errorSpecificUtteranceIdsBySignal?.denominator_as_answer || [];
    if (id === "G2" && value && typeof value === "object") {
      if (Number(value.final) === problemFor("G2").derived.oneShareBaseUnits) return outcome.errorSpecificUtteranceIdsBySignal?.final_equals_one_share || [];
      if (Number(value.final) === problemFor("G2").quantity.amountBaseUnits * problemFor("G2").numerator) return outcome.errorSpecificUtteranceIdsBySignal?.final_equals_amount_times_numerator || [];
    }
    if (id === "F1" && value && typeof value === "object" && Number(value.final) === problemFor("F1").derived.oneShareBaseUnits) {
      return outcome.errorSpecificUtteranceIdsBySignal?.final_equals_one_share || [];
    }
    if (id === "F2") return outcome.errorSpecificUtteranceIdsByResponse?.[String(value)] || [];
    if (id === "I1") {
      const numeric = decimalValue(value);
      if (numeric === problemFor("I1").derived.oneShareBaseUnits) return outcome.errorSpecificUtteranceIdsBySignal?.answer_equals_one_share || [];
      if (numeric === problemFor("I1").quantity.amountBaseUnits / problemFor("I1").numerator) return outcome.errorSpecificUtteranceIdsBySignal?.answer_equals_amount_divided_by_numerator || [];
    }
    if (id === "I2" && normaliseMoneyToPence(value) === problemFor("I2").derived.oneShareBaseUnits) {
      return outcome.errorSpecificUtteranceIdsBySignal?.answer_equals_one_share || [];
    }
    return [];
  }

  function selectOutcomeUtteranceIds(question, response, correct) {
    const outcome = question?.runtimeOutcome || {};
    if (correct) return [...(outcome.correctUtteranceIds || [])];
    const specific = matchingIncorrectUtteranceIds(question, response);
    return specific.length ? [...specific] : [...(outcome.incorrectDefaultUtteranceIds || [])];
  }

  function classifyErrorFamily(question, response) {
    const id = questionId(question);
    const raw = response && typeof response === "object" ? response : String(response ?? "");
    const numeric = decimalValue(raw);
    if (id === "G1" && numeric === 4) return "wrong_grouping";
    if (["G2", "F1"].includes(id) && raw && typeof raw === "object") {
      const problem = problemFor(id);
      if (Number(raw.final) === problem.derived.oneShareBaseUnits) return "stops_after_one_share";
      if (Number(raw.final) === problem.quantity.amountBaseUnits * problem.numerator) return "numerator_only";
    }
    if (id === "F2") {
      return ({
        "48 ÷ 5 × 8": "divide_by_numerator",
        "48 ÷ 8": "stops_after_one_share",
        "48 × 5": "numerator_only"
      })[String(raw)] || "unknown";
    }
    if (id === "I1") {
      if (numeric === problemFor(id).derived.oneShareBaseUnits) return "stops_after_one_share";
      if (numeric === problemFor(id).quantity.amountBaseUnits / problemFor(id).numerator) return "divide_by_numerator";
    }
    if (id === "I2") {
      const pence = normaliseMoneyToPence(raw);
      if (pence === problemFor(id).derived.oneShareBaseUnits) return "stops_after_one_share";
    }
    if (["M2", "M3"].includes(id) && numeric === problemFor(id).derived.oneShareBaseUnits) return "stops_after_one_share";
    if (id === "M2" && numeric === problemFor(id).quantity.amountBaseUnits * problemFor(id).numerator) return "numerator_only";
    if (id === "M4") {
      const pence = normaliseMoneyToPence(raw);
      if (pence === problemFor(id).derived.oneShareBaseUnits) return "stops_after_one_share";
      if (pence === problemFor(id).quantity.amountBaseUnits * problemFor(id).numerator) return "numerator_only";
    }
    if (id === "M5" && String(raw) === "Three fifths of 40") return "stops_after_one_share";
    if (id === "C-ONE" && numeric === problemFor(id).derived.oneShareBaseUnits) return "stops_after_one_share";
    if (id === "C-GROUP" && numeric === problemFor(id).denominator) return "wrong_grouping";
    if (id === "C-OPERATOR" && numeric === problemFor(id).quantity.amountBaseUnits * problemFor(id).numerator) return "numerator_only";
    if (id === "A2" && numeric === problemFor(id).derived.oneShareBaseUnits) return "stops_after_one_share";
    if (id === "A5" && String(raw) === "Stop, because 5 is the final answer") return "stops_after_one_share";
    return question?.primaryErrorFamily || "unknown";
  }

  function requiresRepeatedEvidence(question, response) {
    const id = questionId(question);
    if (id === "F2" && ["48 ÷ 5 × 8", "48 ÷ 8", "48 × 5"].includes(String(response))) return false;
    return ["stops_after_one_share", "wrong_grouping", "divide_by_numerator", "numerator_only"].includes(classifyErrorFamily(question, response));
  }

  function completedOperationOrderIsValid(amount, numerator, denominator, operations) {
    if (![amount, numerator, denominator].every(Number.isInteger) || denominator === 0 || !Array.isArray(operations)) return false;
    const compact = operations.map((item) => String(item).trim()).join(" ").replace(/×/g, "*").replace(/÷/g, "/").replace(/\s+/g, " ");
    const divideFirst = `${amount} / ${denominator} * ${numerator}`;
    const multiplyFirst = `${amount} * ${numerator} / ${denominator}`;
    if (compact !== divideFirst && compact !== multiplyFirst) return false;
    return amount * numerator % denominator === 0;
  }

  function outcomeMetadata(question) {
    const feedback = question.feedback || {};
    const optionBranches = {};
    Object.entries(feedback.incorrectByOption || {}).forEach(([optionId, ids]) => {
      const option = question.learnerUi?.options?.find((item) => item.id === optionId);
      if (option) optionBranches[option.label] = [...ids];
    });
    return {
      correctUtteranceIds: [...(feedback.correctUtteranceIds || [])],
      incorrectDefaultUtteranceIds: [...(feedback.incorrectDefaultUtteranceIds || [])],
      errorSpecificUtteranceIdsByResponse: optionBranches,
      errorSpecificUtteranceIdsBySignal: Object.fromEntries(Object.entries(feedback.incorrectBySignal || {}).map(([key, ids]) => [key, [...ids]])),
      workedCheckUtteranceIds: [...(question.workedCheck?.ryanUtteranceIds || [])]
    };
  }

  function responseFor(question) {
    const response = question.response || {};
    const uiInput = question.learnerUi?.input || {};
    if (response.kind === "integer") {
      return { type: "integer", input_label: uiInput.suffix ? `Answer in ${uiInput.suffix}` : "Your answer", suffix: uiInput.suffix || null, keyboard_submit: true };
    }
    if (response.kind === "two_step_integer") {
      return {
        type: "two_step_integer",
        fields: response.fields.map((field, index) => ({
          id: field.id,
          label: index === 0 ? (question.learnerUi?.stepA || "Find one share") : (question.learnerUi?.stepB || "Find the fraction"),
          expression: field.expression
        })),
        keyboard_submit: true
      };
    }
    if (response.kind === "single_choice") {
      return { type: "single_choice", options: (question.learnerUi?.options || []).map((option) => option.label), keyboard_submit: true };
    }
    if (response.kind === "quantity") {
      return { type: "quantity", input_label: `Answer in ${response.unit || uiInput.suffix || "the given unit"}`, suffix: response.unit || uiInput.suffix || null, scale: response.scale || 1, keyboard_submit: true };
    }
    if (response.kind === "money") {
      return { type: "money", input_label: "Amount in pounds and pence", currencyPrefix: uiInput.currencyPrefix || "£", scale: response.scale || 100, currency: response.currency || "GBP", keyboard_submit: true };
    }
    throw new Error(`${question.id}: unsupported FRA13 response kind ${response.kind}`);
  }

  function answerFor(question) {
    const response = question.response || {};
    if (response.kind === "single_choice") {
      return question.learnerUi.options.find((option) => option.id === response.answer)?.label;
    }
    if (response.kind === "two_step_integer") {
      return Object.fromEntries(response.fields.map((field) => [field.id, String(field.answerBaseUnits)]));
    }
    return response.answerBaseUnits;
  }

  function promptFor(question) {
    return question.learnerUi?.context || question.learnerUi?.prompt || question.learnerUi?.title || question.id;
  }

  function detailFor(question) {
    return question.learnerUi?.studentWork || question.learnerUi?.question || "";
  }

  function initialFamily(question) {
    const id = question.id;
    if (id === "G1") return "wrong_grouping";
    if (["G2", "F1", "I1", "I2", "M2", "M3", "M4", "M5", "A2", "A5", "C-ONE"].includes(id)) return "stops_after_one_share";
    if (id === "F2") return "divide_by_numerator";
    if (id === "C-GROUP") return "wrong_grouping";
    if (id === "C-NUMDIV") return "divide_by_numerator";
    if (id === "C-OPERATOR") return "numerator_only";
    return question.freshnessFamily || "unknown";
  }

  function convertQuestion(question, overrides) {
    const outcome = outcomeMetadata(question);
    const workedSteps = question.workedCheck?.visibleSteps || [];
    const correctText = textsFor(outcome.correctUtteranceIds)[0] || "";
    const defaultIncorrectText = textsFor(outcome.incorrectDefaultUtteranceIds)[0] || "";
    const responseFeedback = Object.fromEntries(Object.entries(outcome.errorSpecificUtteranceIdsByResponse).map(([key, ids]) => [key, textsFor(ids)[0] || ""]));
    const family = initialFamily(question);
    const problem = problemFor(question.problemId);
    const runtimeUtteranceIds = [
      ...(question.ryanBeforeSubmitUtteranceIds || []),
      ...(question.hintUtteranceIds || []),
      ...outcome.correctUtteranceIds,
      ...outcome.incorrectDefaultUtteranceIds,
      ...Object.values(outcome.errorSpecificUtteranceIdsByResponse).flat(),
      ...Object.values(outcome.errorSpecificUtteranceIdsBySignal).flat(),
      ...outcome.workedCheckUtteranceIds
    ];
    const hintText = textsFor(question.hintUtteranceIds || [])[0] || "";
    return Object.assign({
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: question.assessmentIntent,
      assessmentIntent: question.assessmentIntent,
      evidenceFamily: ["M1", "M2", "A1", "A2"].includes(question.id) ? "direct_calculation" : ["M3", "M4", "M5", "A3", "A4", "A5"].includes(question.id) ? "context_or_reasoning" : question.freshnessFamily || family,
      prompt: promptFor(question),
      questionDetail: detailFor(question),
      response: responseFor(question),
      answer: { value: answerFor(question) },
      policy: {
        hintPolicy: question.policy?.hintPolicy === "optional_collapsed" ? "optional" : "none",
        solutionPolicy: question.policy?.solutionPolicy || "after_response",
        scored: question.policy?.scored === true,
        answerLocksOnSubmit: question.policy?.answerLocksOnSubmit === true,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy?.requiresFreshNoHintConfirmationIfHintUsed === true,
        requiresFreshNoHintConfirmationAfterSupport: ["I1", "I2"].includes(question.id),
        maxAttemptsBeforeRepair: question.policy?.maxAttemptsBeforeRepair || 2
      },
      attempt_policy: { submit_label: question.learnerUi?.submitLabel || question.learnerUi?.input?.submitLabel || "Check answer" },
      model: {
        context: "fra13",
        questionId: question.id,
        problem,
        visual: question.visual,
        accessibleDescription: question.visual?.authorOnlyAccessibleDescription || null,
        workedSteps: [...workedSteps],
        validCompletedAlternateOrder: approved.scope.acceptEquivalentCompletedOperationOrder === true
      },
      visual: { primitive: "fra13_context", action: "focus", description: promptFor(question) },
      scripts: {
        before_submit: textsFor(question.ryanBeforeSubmitUtteranceIds || []),
        hint: hintText,
        on_correct_reaction: correctText,
        on_correct_math: "",
        on_incorrect_reaction: defaultIncorrectText,
        on_incorrect_attempt_1: defaultIncorrectText,
        on_incorrect_attempt_2: defaultIncorrectText,
        response_feedback: responseFeedback,
        worked_explanation: workedSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: [...workedSteps],
        worked_narration: textsFor(outcome.workedCheckUtteranceIds)
      },
      mathematical_support: hintText ? { hint_1: hintText } : {},
      runtimeOutcome: outcome,
      runtimeUtteranceIds,
      primaryErrorFamily: family,
      errorFamily: question.freshnessFamily || family,
      errorClassification: { fallback: family, requiresRepeatedEvidence: true },
      recovery_item_ref: repairByFamily[family] || null,
      canonicalQuestion: question
    }, overrides || {});
  }

  function convertRepair(repair) {
    const problem = problemFor(repair.problemId);
    return {
      id: prefix(repair.id),
      canonicalQuestionId: repair.id,
      stage: "repair",
      target: approved.uiCopy === "FRA13_UI_COPY" ? "Repair the fraction roles" : "Targeted repair",
      assessmentIntent: `repair_${repair.errorFamily}`,
      evidenceFamily: repair.errorFamily,
      prompt: "Review the two fraction jobs",
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: { context: "fra13", questionId: repair.id, problem, visual: repair.visual, workedSteps: [] },
      visual: { primitive: "fra13_context", action: "repair", description: "A targeted fraction-of-an-amount repair." },
      scripts: { reteach: textsFor(repair.ryanUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.ryanUtteranceIds],
      freshCheckId: prefix(repair.freshCheckId),
      primaryErrorFamily: repair.errorFamily,
      errorClassification: { fallback: repair.errorFamily }
    };
  }

  function recoveryIntro(id, utteranceId, title) {
    return {
      id: prefix(id),
      canonicalQuestionId: id,
      stage: "repair",
      target: title,
      assessmentIntent: "recovery_transition",
      prompt: title,
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "none", scored: false, reteachOnly: true },
      model: { context: "fra13", questionId: id, visual: { kind: "stage_transition" }, workedSteps: [] },
      visual: { primitive: "fra13_context", action: "transition", description: title },
      scripts: { reteach: [textFor(utteranceId)], worked_explanation: "" },
      runtimeUtteranceIds: [utteranceId],
      primaryErrorFamily: "unknown",
      errorClassification: { fallback: "unknown" }
    };
  }

  function buildHookQuestion() {
    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const labels = { card_a: "Card A — 8 tokens", card_b: "Card B — 3/5 of 20 tokens" };
    return {
      id: prefix("HOOK-CHOICE"),
      canonicalQuestionId: "HOOK-CHOICE",
      stage: "opening",
      target: "Choose a reward before the fraction is evaluated",
      assessmentIntent: "unscored_prediction",
      evidenceFamily: "opening_choice",
      prompt: "Which reward would you take?",
      questionDetail: "Choose before the fraction card is revealed.",
      response: { type: "single_choice", options: hook.interaction.options.map((id) => labels[id]), keyboard_submit: true },
      answer: { value: labels.card_b },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Reveal the cards" },
      model: { context: "fra13", questionId: "HOOK-CHOICE", problem: problemFor("HOOK"), visual: hook.visual, accessibleDescription: "Card A offers eight tokens. Card B offers three fifths of twenty tokens. Twenty neutral tokens are shown without grouping." },
      visual: { primitive: "fra13_context", action: "choice", description: "Eight tokens or three fifths of twenty tokens." },
      scripts: {
        engagement_response_by_value: {
          [labels.card_a]: textsFor(hook.interaction.afterChoiceUtteranceIds),
          [labels.card_b]: textsFor(hook.interaction.afterChoiceUtteranceIds)
        },
        engagement_detail: "Both choices now lead to the same fraction reveal.",
        engagement_label: "Your choice"
      },
      runtimeOutcome: { responseUtteranceIdsByValue: Object.fromEntries(hook.interaction.options.map((id) => [labels[id], [...hook.interaction.afterChoiceUtteranceIds]])) },
      runtimeUtteranceIds: [...hook.interaction.afterChoiceUtteranceIds],
      primaryErrorFamily: "unknown",
      errorClassification: { fallback: "unknown", requiresRepeatedEvidence: false }
    };
  }

  function sceneCues(scene) {
    return (scene.timeline || []).map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      target: cue.authorOnlyTarget
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: scene.purpose,
      scene: {
        display_title: sceneTitles[scene.id] || scene.purpose,
        initial_state: scene.purpose,
        objects: [scene.visual.kind],
        model: { context: "fra13", sceneId: scene.id, problem: scene.visual.problemId ? problemFor(scene.visual.problemId) : null, visual: scene.visual }
      },
      narration: { script: textsFor(scene.ryanUtteranceIds), utterance_ids: [...scene.ryanUtteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 620 })),
      next_step: nextId
    };
  }

  function buildQuestions() {
    return [
      buildHookQuestion(),
      ...approved.questions.map((question) => convertQuestion(question)),
      ...approved.confirmations.map((question) => convertQuestion(question)),
      ...approved.repairs.map((repair) => convertRepair(repair)),
      ...approved.alternateFinals.map((question) => convertQuestion(question)),
      recoveryIntro("RECOVERY-MINI-INTRO", "RECOVERY.MINI.INTRO", "Two fresh checks"),
      recoveryIntro("RECOVERY-FINAL-INTRO", "RECOVERY.FINAL.INTRO", "Five fresh questions")
    ];
  }

  function shouldSkipF1(evidence) {
    const g1 = evidence?.g1 || {};
    const g2 = evidence?.g2 || {};
    const parts = g2.componentFirstAttemptCorrect || {};
    return g1.firstAttemptCorrect === true
      && g2.firstAttemptCorrect === true
      && parts.oneShare === true
      && parts.final === true
      && !g1.hintOpenedBeforeSubmit
      && !g2.hintOpenedBeforeSubmit
      && !g1.supportEscalated
      && !g2.supportEscalated
      && !evidence?.unresolvedCentralError;
  }

  function routeFinal(params) {
    if (params.correctCount >= 4 && params.hasDirectCalculationEvidence && params.hasContextOrReasoningEvidence && !params.repeatedBlockingMisconception) return "finish_candidate";
    if (params.correctCount === 3) return "targeted_repair_then_two_item_check";
    return "targeted_repair_then_alternate_final";
  }

  function selectRecoveryQuestionIds(missedFinalQuestionIds, desiredCount) {
    if (desiredCount === 5) return ["A1", "A2", "A3", "A4", "A5"].map(prefix);
    const mapping = { M1: "C-GROUP", M2: "C-ONE", M3: "C-PROC", M4: "C-MONEY", M5: "C-ONE" };
    const selected = [];
    (missedFinalQuestionIds || []).map(unprefix).forEach((id) => {
      const candidate = mapping[id];
      if (candidate && !selected.includes(candidate) && selected.length < desiredCount) selected.push(candidate);
    });
    ["C-PROC", "C-MONEY", "C-NUMDIV", "C-OPERATOR", "C-GROUP", "C-ONE"].forEach((candidate) => {
      if (selected.length < desiredCount && !selected.includes(candidate)) selected.push(candidate);
    });
    return selected.slice(0, desiredCount).map(prefix);
  }

  function evaluateFinalEvidence(records, totalExpected) {
    const correct = (records || []).filter((record) => record.correct === true);
    const blocking = new Set(["stops_after_one_share", "wrong_grouping", "divide_by_numerator", "numerator_only"]);
    const familyCounts = {};
    (records || []).forEach((record) => {
      if (blocking.has(record.errorFamily)) familyCounts[record.errorFamily] = (familyCounts[record.errorFamily] || 0) + 1;
    });
    const repeatedBlockingFamilies = Object.keys(familyCounts).filter((family) => familyCounts[family] >= 2);
    const hasDirectCalculationEvidence = correct.some((record) => record.evidenceFamily === "direct_calculation");
    const hasContextOrReasoningEvidence = correct.some((record) => record.evidenceFamily === "context_or_reasoning");
    const expected = totalExpected || 5;
    return {
      correctCount: correct.length,
      totalCount: records.length,
      hasDirectCalculationEvidence,
      hasContextOrReasoningEvidence,
      repeatedBlockingFamilies,
      masterySatisfied: records.length === expected && correct.length >= 4 && hasDirectCalculationEvidence && hasContextOrReasoningEvidence && !repeatedBlockingFamilies.length
    };
  }

  function collectObjects(value, output) {
    if (Array.isArray(value)) return value.forEach((item) => collectObjects(item, output));
    if (!value || typeof value !== "object") return;
    output.push(value);
    Object.values(value).forEach((item) => collectObjects(item, output));
  }

  function validateRuntimeContract() {
    const issues = [];
    const ownerByText = new Map();
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      const text = String(entry?.text || "").trim();
      if (!text) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} does not share audio and caption copy`);
      if (ownerByText.has(text.toLowerCase())) issues.push(`${id} duplicates ${ownerByText.get(text.toLowerCase())}`);
      ownerByText.set(text.toLowerCase(), id);
    });
    const objects = [];
    collectObjects(approved, objects);
    objects.forEach((object) => {
      if (Object.prototype.hasOwnProperty.call(object, "captionText")) issues.push("captionText is forbidden");
      if (object.utteranceId && object.anchorText) {
        const entry = runtimeCopy[object.utteranceId];
        if (!entry) issues.push(`${object.id || "cue"} points to missing ${object.utteranceId}`);
        else if (!entry.text.toLowerCase().includes(String(object.anchorText).toLowerCase())) issues.push(`${object.id || "cue"} has an invalid anchor`);
      }
    });
    Object.entries(problems).forEach(([id, problem]) => {
      if (!Number.isInteger(problem.denominator) || problem.denominator <= 0) issues.push(`${id} has an invalid denominator`);
      if (problem.quantity.amountBaseUnits % problem.denominator !== 0) issues.push(`${id} does not divide exactly`);
      if (problem.derived.oneShareBaseUnits !== problem.quantity.amountBaseUnits / problem.denominator) issues.push(`${id} has an invalid one-share value`);
      if (problem.derived.resultBaseUnits !== problem.derived.oneShareBaseUnits * problem.numerator) issues.push(`${id} has an invalid result`);
      if (problem.quantity.kind === "money" && (!Number.isInteger(problem.quantity.amountBaseUnits) || problem.quantity.scale !== 100)) issues.push(`${id} money is not integer pence`);
    });
    return issues;
  }

  function apply(spec) {
    if (!approved || !Object.keys(runtimeCopy).length || !Object.keys(problems).length) throw new Error("FRA13 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA13 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: approved.title, status: approved.status, version: CONTENT_VERSION });
    spec.learning_objective = approved.scope.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-01", "FRA-02", "P-N01"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const hook = approved.teachingScenes.find((scene) => scene.id === "HOOK");
    const hookChoice = {
      id: "HOOK-CHOICE",
      purpose: "Choose before the reveal",
      scene: { display_title: "Pick before the reveal", initial_state: "Choose one reward card.", objects: [hook.visual.kind], model: { context: "fra13", sceneId: "HOOK-CHOICE", problem: problemFor("HOOK"), visual: hook.visual } },
      narration: { script: [], utterance_ids: [], sync_cues: [] },
      animation_timeline: [],
      learner_interaction: { question_ref: prefix("HOOK-CHOICE") },
      next_step: "T1"
    };
    const nextByScene = { T1: "T2", T2: "T3", T3: "T4", T4: "HANDOFF", HANDOFF: "G1" };
    spec.lesson.teaching_steps = [teachingStep(hook, "HOOK-CHOICE"), hookChoice, ...approved.teachingScenes.filter((scene) => scene.id !== "HOOK").map((scene) => teachingStep(scene, nextByScene[scene.id]))];

    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const nextByQuestion = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const item = question(id);
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: item.scripts.before_submit,
        visual_before_answer: item.prompt,
        correct_next: nextByQuestion[id],
        recovery_ref: item.recovery_item_ref
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "Canonical adaptive route only.", between_question_transition: "" };

    const primaryIds = ["M1", "M2", "M3", "M4", "M5"].map(prefix);
    const alternateIds = ["A1", "A2", "A3", "A4", "A5"].map(prefix);
    const confirmationIds = ["C-PROC", "C-MONEY", "C-ONE", "C-GROUP", "C-NUMDIV", "C-OPERATOR"].map(prefix);
    spec.lesson.exit = {
      intro_script: textsFor(approved.routing.finalIntroUtteranceIds),
      primary_question_refs: primaryIds,
      confirmation_question_refs: [...confirmationIds, ...alternateIds],
      mastery_policy: {
        profile: "fra13_five_item",
        secureMinimum: 4,
        totalItems: 5,
        requireDirectCalculation: true,
        requireContextOrReasoning: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: ["stops_after_one_share", "wrong_grouping", "divide_by_numerator", "numerator_only"],
        scoreThreeRecoveryCount: 2,
        scoreZeroToTwoRecoveryCount: 5,
        repairCycleCapPerFamily: approved.routing.repairCycleCapPerFamily
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra13_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1", minimumFreshNoHintNonUnitSuccess: 1 },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-PROC"),
        [prefix("F2")]: prefix("C-PROC"),
        [prefix("I1")]: prefix("C-PROC"),
        [prefix("I2")]: prefix("C-MONEY")
      },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: freshByFamily,
      feedback_by_error_family: {},
      recovery_intro: { mini: prefix("RECOVERY-MINI-INTRO"), alternate: prefix("RECOVERY-FINAL-INTRO") },
      alternate_final_ids: alternateIds
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: [textFor(approved.routing.completionUtteranceIds[0])], buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "One more pass will help", ryan_script: [textFor(approved.routing.needsWorkUtteranceIds[0])], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)" },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra13_context", exact_equal_groups: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra13_context", "integer_input", "two_step_integer", "quantity_input", "money_input", "single_choice", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "1.0-fra13-owner-approved",
      engine_profile: "fra13",
      runtime_applied: true,
      owner_review_status: "owner_approved_implementation_handoff_v1",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: approved.sourceOfTruth,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn — support nearby", independent: "Now you take over", repair: "Let's fix that idea", exit: "Final check", completion: "Lesson complete" },
      route_contract: approved.routing,
      capabilities: { multi_field_answers: true, exact_money_pence: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, five_item_final: true, targeted_repairs: true, fresh_confirmations: true, repair_cycle_cap: true, utterance_id_runtime: true }
    };
    return spec;
  }

  window.RevilyFra13Canonical = {
    apply,
    buildQuestions,
    classifyErrorFamily,
    completedOperationOrderIsValid,
    evaluateFinalEvidence,
    normaliseMoneyToPence,
    repairByFamily,
    requiresRepeatedEvidence,
    responseKey,
    routeFinal,
    runtimeCopy,
    selectOutcomeUtteranceIds,
    selectRecoveryQuestionIds,
    shouldSkipF1,
    textFor,
    validateRuntimeContract
  };
})();
