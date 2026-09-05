(function () {
  "use strict";

  const LESSON_ID = "FRA-25";
  const CONTENT_VERSION = "FRA25-HANDOFF-V1";
  const source = window.RevilyFra25Approved;
  const lesson = source?.FRA25_LESSON_SPEC;
  const runtimeCopy = source?.FRA25_RUNTIME_COPY || {};
  const prefix = (id) => `${LESSON_ID}-${id}`;
  const unprefix = (id) => String(id || "").replace(`${LESSON_ID}-`, "");

  const repairByFamily = {
    PAIR: prefix("R-PAIR"),
    SHARED: prefix("R-SHARED"),
    TERM: prefix("R-TERM"),
    NONE: prefix("R-NONE"),
    FINISH: prefix("R-FINISH")
  };

  const freshByFamily = Object.fromEntries((source?.FRA25_REPAIRS || []).map((repair) => [
    repair.family,
    [prefix(repair.freshIndependentRecheck.id)]
  ]));
  freshByFamily.ARITHMETIC = [];
  freshByFamily.UNKNOWN = [];

  function runtimeEntry(id) {
    const entry = runtimeCopy[id];
    if (!entry) throw new Error(`Missing FRA25 runtime utterance: ${id}`);
    return entry;
  }

  function textFor(id) {
    return runtimeEntry(id).text;
  }

  function textsFor(ids) {
    return (ids || []).map(textFor);
  }

  function fractionKey(value) {
    if (!value || typeof value !== "object") return "";
    return `${value.numerator}/${value.denominator}`;
  }

  function responseFraction(response) {
    if (!response || typeof response !== "object") return null;
    const numerator = Number(response.n ?? response.numerator ?? response.finalNumerator);
    const denominator = Number(response.d ?? response.denominator ?? response.finalDenominator);
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator === 0) return null;
    return { numerator, denominator };
  }

  function isExactFraction(actual, expected) {
    return Boolean(actual && expected && actual.numerator === expected.numerator && actual.denominator === expected.denominator);
  }

  function isEquivalentFraction(actual, expected) {
    return Boolean(actual && expected && actual.denominator !== 0 && expected.denominator !== 0
      && actual.numerator * expected.denominator === expected.numerator * actual.denominator);
  }

  function questionId(question) {
    return question?.canonicalQuestionId || unprefix(question?.id);
  }

  function choiceId(question, response) {
    const value = response && typeof response === "object" && "choice" in response ? response.choice : response;
    return question?.response?.optionIds?.[String(value)] || String(value ?? "");
  }

  function classifyErrorFamily(question, response) {
    const id = questionId(question);
    const choice = choiceId(question, response);
    const byChoice = {
      G2: { A: "NONE", B: "NONE", D: "PAIR" },
      F2: { B: "SHARED", C: "PAIR", D: "SHARED" },
      I2: { A: "PAIR", C: "UNKNOWN", D: "PAIR" },
      M3: { A: "NONE", B: "NONE", C: "PAIR" },
      M4: { A: "TERM", C: "TERM", D: "UNKNOWN" },
      M5: { A: "UNKNOWN", B: "UNKNOWN", D: "NONE" },
      "R-PAIR-SUPPORTED": { invalid_same_side: "PAIR" },
      "R-TERM-SUPPORTED": { TERM_3: "TERM", TERM_5: "TERM", FACTOR_9: "UNKNOWN", FACTOR_10: "UNKNOWN" },
      "R-TERM-RECHECK": { YES: "TERM" },
      "R-NONE-SUPPORTED": { SOME_YES: "NONE" },
      "R-NONE-RECHECK": { B: "NONE", C: "NONE" },
      "RM3-REASON": { A: "NONE", B: "NONE", C: "PAIR" },
      "RM4-ERROR": { A: "TERM", C: "TERM", D: "UNKNOWN" },
      "RM5-MATCH": { A: "UNKNOWN", B: "UNKNOWN", D: "NONE" }
    };
    if (byChoice[id]?.[choice]) return byChoice[id][choice];

    const canonical = question?.canonicalQuestion;
    const expected = canonical?.answer?.finalFraction;
    const actual = responseFraction(response);
    if (actual && expected && isEquivalentFraction(actual, expected) && !isExactFraction(actual, expected)) return "FINISH";

    if (["fra25_pair_divisor", "fra25_quotient_pair", "fra25_reduced_product_fraction"].includes(question?.response?.type)) {
      if (response?.numeratorSlot && response?.denominatorSlot && response?.divisor) return "SHARED";
      if (Object.values(response || {}).some((value) => String(value).trim() !== "")) return "ARITHMETIC";
    }
    return question?.primaryErrorFamily || "UNKNOWN";
  }

  function requiresRepeatedEvidence(question, response) {
    const family = classifyErrorFamily(question, response);
    const signal = question?.canonicalQuestion?.observableErrorSignals?.find((entry) => entry.family === family);
    return signal?.requiresRepeatBeforeStableClassification === true;
  }

  function responseFor(question) {
    const response = question.response;
    if (["fraction_input", "factor_trays_then_fraction"].includes(response.kind)) {
      return {
        type: "fraction",
        input_label: "Final fraction",
        accept_equivalent_notation: false,
        keyboard_submit: true
      };
    }
    if (["single_choice", "factor_selection"].includes(response.kind)) {
      const options = (response.choices || []).map((option) => option.text);
      return {
        type: "single_choice",
        options,
        optionIds: Object.fromEntries((response.choices || []).map((option) => [option.text, option.id])),
        keyboard_submit: true
      };
    }
    if (["pair_and_divisor", "drag_pair_then_divisor"].includes(response.kind)) {
      return {
        type: "fra25_pair_divisor",
        includeFinalFraction: Boolean(response.acceptedFractions?.length),
        keyboard_submit: true
      };
    }
    if (response.kind === "quotient_pair") {
      return { type: "fra25_quotient_pair", fields: [...(response.editableFields || [])], keyboard_submit: true };
    }
    if (response.kind === "reduced_product_and_fraction_input") {
      return { type: "fra25_reduced_product_fraction", keyboard_submit: true };
    }
    throw new Error(`${question.id}: unsupported FRA25 response kind ${response.kind}`);
  }

  function correctUtteranceIds(question) {
    const id = question.id;
    if (id === "G1") return [...(source.FRA25_OUTCOME_BINDINGS.G1.correct || [])];
    if (id === "G2") return [...(source.FRA25_OUTCOME_BINDINGS.G2.correct || [])];
    if (question.workedCheck) return [...(question.workedCheck.outcomeUtteranceIds.correct || [])];
    return [];
  }

  function incorrectUtteranceIds(question, family) {
    if (question.id === "G1" && family === "SHARED") return [...(source.FRA25_OUTCOME_BINDINGS.G1.incorrectByFamily.SHARED || [])];
    if (question.workedCheck) return [...(question.workedCheck.outcomeUtteranceIds.incorrect || [])];
    const signal = question.observableErrorSignals?.find((entry) => entry.family === family);
    return [...(signal?.immediateUtteranceIds || [])];
  }

  function visibleFeedback(question, response, correct, family) {
    const visible = question?.canonicalQuestion?.studentFacing?.visibleFeedback;
    if (correct) return visible?.correct || "Answer locked. Compare your method with the worked check.";
    const option = choiceId(question, response);
    return visible?.byChoiceId?.[option]
      || visible?.incorrectDefault
      || ({
        PAIR: "A valid pair uses one numerator factor and one denominator factor.",
        SHARED: "Use the same exact divisor on both members of the pair.",
        TERM: "Only a complete multiplicative factor can cancel.",
        NONE: "Check every numerator-denominator pair before deciding that cancellation is available.",
        FINISH: "Finish multiplying the remaining factors and give the result in simplest form.",
        ARITHMETIC: "The structure is useful; recheck the exact quotient or product fact.",
        UNKNOWN: "Show the pair and shared divisor used so the next step can be checked."
      })[family] || "Compare the committed answer with the worked check.";
  }

  function evaluateResponse(question, response) {
    const canonical = question?.canonicalQuestion;
    if (!canonical) return { correct: false, errorFamily: "UNKNOWN", utteranceIds: [], visibleText: "Question data is unavailable." };
    let correct = false;
    if (canonical.answer.choiceIds?.length) {
      correct = canonical.answer.choiceIds.includes(choiceId(question, response));
    } else if (canonical.answer.validPairs?.length) {
      const matchedPair = canonical.answer.validPairs.some((pair) => (
        pair.numeratorSlot === response?.numeratorSlot
        && pair.denominatorSlot === response?.denominatorSlot
        && pair.divisor === Number(response?.divisor)
      ));
      const expectedFraction = canonical.answer.finalFraction;
      const finalCorrect = !question.response.includeFinalFraction
        || isExactFraction(responseFraction(response), expectedFraction);
      correct = matchedPair && finalCorrect;
    } else if (canonical.answer.quotientPair?.length) {
      correct = canonical.answer.quotientPair.every((value, index) => Number(response?.quotients?.[index]) === value);
    } else if (canonical.answer.reducedProduct) {
      const expected = canonical.answer.reducedProduct;
      correct = Number(response?.leftNumerator) === expected.left.numerator
        && Number(response?.leftDenominator) === expected.left.denominator
        && Number(response?.rightNumerator) === expected.right.numerator
        && Number(response?.rightDenominator) === expected.right.denominator
        && isExactFraction(responseFraction(response), canonical.answer.finalFraction);
    } else if (canonical.answer.finalFraction) {
      correct = isExactFraction(responseFraction(response), canonical.answer.finalFraction);
    }
    const errorFamily = correct ? null : classifyErrorFamily(question, response);
    const utteranceIds = correct ? correctUtteranceIds(canonical) : incorrectUtteranceIds(canonical, errorFamily);
    return {
      correct,
      errorFamily,
      utteranceIds,
      visibleText: visibleFeedback(question, response, correct, errorFamily),
      expectedFraction: canonical.answer.finalFraction || null
    };
  }

  function convertQuestion(question, overrides) {
    const response = responseFor(question);
    const beforeIds = [...(question.studentFacing.ryanBeforeSubmitUtteranceIds || [])];
    const outcomeIds = [
      ...correctUtteranceIds(question),
      ...question.observableErrorSignals.flatMap((signal) => [...(signal.immediateUtteranceIds || [])]),
      ...(question.workedCheck?.outcomeUtteranceIds.correct || []),
      ...(question.workedCheck?.outcomeUtteranceIds.incorrect || [])
    ];
    const runtimeIds = [...new Set([...beforeIds, ...outcomeIds])];
    const workedSteps = [...(question.workedCheck?.visibleSteps || question.visual.afterSubmitState || [])];
    const initialFamily = question.observableErrorSignals[0]?.family || "UNKNOWN";
    return Object.assign({
      id: prefix(question.id),
      canonicalQuestionId: question.id,
      stage: question.stage,
      target: question.studentFacing.title,
      assessmentIntent: question.authorOnly.assessmentIntent,
      evidenceFamily: question.family,
      prompt: question.studentFacing.prompt,
      questionDetail: question.studentFacing.title,
      response,
      answer: { value: fractionKey(question.answer.finalFraction) || question.answer.choiceIds?.[0] || null },
      policy: {
        hintPolicy: question.policy.hintPolicy === "optional" ? "optional" : "none",
        solutionPolicy: question.policy.solutionPolicy,
        scored: question.policy.scored,
        answerLocksOnSubmit: question.policy.answerLocksOnSubmit,
        countsAsIndependentEvidence: question.policy.eligibleForIndependentMastery,
        requiresFreshNoHintConfirmationIfHintUsed: question.policy.requiresFreshNoHintConfirmationIfHintUsed,
        maxAttemptsBeforeRepair: 2
      },
      attempt_policy: { submit_label: question.response.submitLabel },
      model: {
        context: "fra25",
        questionId: question.id,
        canonicalQuestion: question,
        visual: question.visual,
        accessibleDescription: question.visual.accessibleDescriptionBeforeSubmit,
        workedSteps
      },
      visual: { primitive: "fra25_context", action: "focus", description: question.visual.visibleExpression },
      scripts: {
        before_submit: textsFor(beforeIds),
        hint: question.studentFacing.hint || "",
        on_correct_reaction: "",
        on_correct_math: "",
        on_incorrect_reaction: "",
        on_incorrect_attempt_1: "",
        on_incorrect_attempt_2: "",
        worked_explanation: workedSteps.map((step, index) => `${index + 1}. ${step}`).join(" "),
        worked_steps: workedSteps,
        worked_narration: []
      },
      mathematical_support: question.studentFacing.hint ? { hint_1: question.studentFacing.hint } : {},
      runtimeOutcome: { correctUtteranceIds: correctUtteranceIds(question) },
      runtimeUtteranceIds: runtimeIds,
      primaryErrorFamily: initialFamily,
      errorFamily: initialFamily,
      errorClassification: { fallback: initialFamily },
      recovery_item_ref: repairByFamily[initialFamily] || null,
      canonicalQuestion: question
    }, overrides || {});
  }

  function convertRepairIntro(repair) {
    return {
      id: prefix(repair.id),
      canonicalQuestionId: repair.id,
      stage: "repair",
      target: `Repair ${repair.family}`,
      assessmentIntent: repair.authorOnlyTrigger,
      evidenceFamily: repair.family,
      prompt: `Repair ${repair.family.toLowerCase()} thinking`,
      response: { type: "continue" },
      answer: { value: "continue" },
      policy: { hintPolicy: "none", solutionPolicy: "reteach", scored: false, reteachOnly: true },
      model: { context: "fra25", questionId: repair.id, canonicalRepair: repair, visual: repair.visual, accessibleDescription: repair.visual.accessibleDescriptionBeforeSubmit, workedSteps: [] },
      visual: { primitive: "fra25_context", action: "repair", description: repair.visual.visibleExpression },
      scripts: { reteach: textsFor(repair.teachingUtteranceIds), worked_explanation: "" },
      runtimeUtteranceIds: [...repair.teachingUtteranceIds],
      supportedInteractionId: prefix(repair.supportedInteraction.id),
      freshCheckId: prefix(repair.freshIndependentRecheck.id),
      primaryErrorFamily: repair.family,
      errorClassification: { fallback: repair.family }
    };
  }

  function hookQuestion() {
    const labels = ["Multiply first", "Simplify first"];
    return {
      id: prefix("HOOK-CHOICE"),
      canonicalQuestionId: "HOOK-CHOICE",
      stage: "hook",
      target: "Compare the two valid routes",
      assessmentIntent: "unscored_route_preference",
      evidenceFamily: "HOOK",
      prompt: "Which route would you choose for this product?",
      questionDetail: "Both routes preserve the product; choose the one you would use.",
      response: { type: "single_choice", options: labels, optionIds: { "Multiply first": "MULTIPLY", "Simplify first": "SIMPLIFY" }, keyboard_submit: true },
      answer: { value: "Simplify first" },
      policy: { hintPolicy: "none", solutionPolicy: "after_response", scored: false, engagementOnly: true, answerLocksOnSubmit: true },
      attempt_policy: { submit_label: "Save choice" },
      model: { context: "fra25", questionId: "HOOK-CHOICE", visual: source.FRA25_TEACHING_SCENES[0].visual, accessibleDescription: source.FRA25_TEACHING_SCENES[0].visual.accessibleDescriptionBeforeSubmit, workedSteps: [] },
      visual: { primitive: "fra25_context", action: "choice", description: source.FRA25_TEACHING_SCENES[0].visual.visibleExpression },
      scripts: {
        engagement_visible_by_value: {
          "Multiply first": "Multiply first is valid. It reaches 252/945 before simplifying to 4/15.",
          "Simplify first": "Simplify first is valid. It keeps the factors smaller and reaches the same 4/15."
        },
        engagement_label: "Your route"
      },
      runtimeUtteranceIds: [],
      primaryErrorFamily: "UNKNOWN",
      errorClassification: { fallback: "UNKNOWN", requiresRepeatedEvidence: false }
    };
  }

  function sceneCues(scene) {
    return scene.timedVisualEvents.map((cue) => ({
      id: cue.id,
      utteranceId: cue.utteranceId,
      cue: cue.anchorText,
      anchorText: cue.anchorText,
      action: cue.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      targets: [...cue.targetIds],
      target: cue.targetIds.join(" "),
      reducedMotionEquivalent: cue.reducedMotionEquivalent
    }));
  }

  function teachingStep(scene, nextId) {
    const cues = sceneCues(scene);
    return {
      id: scene.id,
      purpose: scene.purpose,
      scene: {
        display_title: ({ HOOK: "Two routes, one product", T1: "Four factor positions", T2: "One shared division", T3: "Check, multiply, finish", T4: "Different valid routes", T5: "Factors, terms, and no cancellation", HANDOFF: "The invariant" })[scene.id],
        initial_state: scene.visual.visibleExpression,
        objects: [scene.visual.kind],
        model: { context: "fra25", sceneId: scene.id, visual: scene.visual }
      },
      narration: { script: textsFor(scene.utteranceIds), utterance_ids: [...scene.utteranceIds], sync_cues: cues },
      animation_timeline: cues.map((cue) => ({ utteranceId: cue.utteranceId, cue: cue.anchorText, action: cue.action, duration_ms: 520 })),
      next_step: nextId
    };
  }

  function buildQuestions() {
    return [
      hookQuestion(),
      ...source.FRA25_ALL_CORE_QUESTIONS.map((question) => convertQuestion(question)),
      ...source.FRA25_REPAIRS.flatMap((repair) => [
        convertRepairIntro(repair),
        convertQuestion(repair.supportedInteraction, { repairParentId: prefix(repair.id), primaryErrorFamily: repair.family, errorFamily: repair.family }),
        convertQuestion(repair.freshIndependentRecheck, { repairParentId: prefix(repair.id), primaryErrorFamily: repair.family, errorFamily: repair.family })
      ]),
      ...source.FRA25_REPLACEMENT_FINALS.map((question) => convertQuestion(question))
    ];
  }

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function option(value, label, selected) {
    return `<option value="${escapeHtml(value)}"${String(value) === String(selected ?? "") ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function inputMarkup(question, saved, locked) {
    const disabled = locked ? " disabled" : "";
    const value = saved && typeof saved === "object" ? saved : {};
    const canonical = question.canonicalQuestion;
    const factors = canonical?.visual?.math?.factors;
    if (question.response.type === "fra25_pair_divisor") {
      const numeratorOptions = factors
        ? option("left_numerator", `${factors.left.numerator} - left numerator`, value.numeratorSlot)
          + option("right_numerator", `${factors.right.numerator} - right numerator`, value.numeratorSlot)
        : option("left_numerator", "left numerator", value.numeratorSlot) + option("right_numerator", "right numerator", value.numeratorSlot);
      const denominatorOptions = factors
        ? option("left_denominator", `${factors.left.denominator} - left denominator`, value.denominatorSlot)
          + option("right_denominator", `${factors.right.denominator} - right denominator`, value.denominatorSlot)
        : option("left_denominator", "left denominator", value.denominatorSlot) + option("right_denominator", "right denominator", value.denominatorSlot);
      const finalFields = question.response.includeFinalFraction
        ? `<div class="fra25-final-fraction"><span>Final fraction</span><div class="fraction-input"><input data-fra25-final-numerator aria-label="Final numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.n ?? value.finalNumerator ?? "")}"${disabled} /><i aria-hidden="true"></i><input data-fra25-final-denominator aria-label="Final denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.d ?? value.finalDenominator ?? "")}"${disabled} /></div></div>`
        : "";
      return `<fieldset class="fra25-pair-input"><legend>Choose one numerator factor, one denominator factor, and one shared divisor</legend><div class="fra25-pair-fields"><label><span>Numerator factor</span><select data-fra25-numerator-slot aria-label="Numerator factor"${disabled}><option value="">Choose…</option>${numeratorOptions}</select></label><label><span>Shared divisor</span><input data-fra25-divisor aria-label="Shared divisor" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.divisor ?? "")}"${disabled} /></label><label><span>Denominator factor</span><select data-fra25-denominator-slot aria-label="Denominator factor"${disabled}><option value="">Choose…</option>${denominatorOptions}</select></label></div>${finalFields}</fieldset>`;
    }
    if (question.response.type === "fra25_quotient_pair") {
      const labels = question.response.fields || ["first quotient", "second quotient"];
      return `<fieldset class="fra25-quotient-input"><legend>Complete both exact divisions</legend>${[0, 1].map((index) => `<label><span>${escapeHtml(labels[index] || `Quotient ${index + 1}`)}</span><input data-fra25-quotient="${index}" aria-label="Quotient ${index + 1}" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.quotients?.[index] ?? "")}"${disabled} /></label>`).join("")}</fieldset>`;
    }
    if (question.response.type === "fra25_reduced_product_fraction") {
      return `<fieldset class="fra25-reduced-input"><legend>Enter the reduced product, then the final fraction</legend><div class="fra25-reduced-product"><div class="fraction-input"><input data-fra25-reduced="leftNumerator" aria-label="Left reduced numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.leftNumerator ?? "")}"${disabled} /><i aria-hidden="true"></i><input data-fra25-reduced="leftDenominator" aria-label="Left reduced denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.leftDenominator ?? "")}"${disabled} /></div><b>×</b><div class="fraction-input"><input data-fra25-reduced="rightNumerator" aria-label="Right reduced numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.rightNumerator ?? "")}"${disabled} /><i aria-hidden="true"></i><input data-fra25-reduced="rightDenominator" aria-label="Right reduced denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.rightDenominator ?? "")}"${disabled} /></div><b>=</b><div class="fraction-input"><input data-fra25-final-numerator aria-label="Final numerator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.finalNumerator ?? value.n ?? "")}"${disabled} /><i aria-hidden="true"></i><input data-fra25-final-denominator aria-label="Final denominator" inputmode="numeric" autocomplete="off" value="${escapeHtml(value.finalDenominator ?? value.d ?? "")}"${disabled} /></div></div></fieldset>`;
    }
    return "";
  }

  function readResponse(engine, question, allowPartial) {
    if (question.response.type === "fra25_pair_divisor") {
      const response = {
        numeratorSlot: engine.root.querySelector("[data-fra25-numerator-slot]")?.value || "",
        denominatorSlot: engine.root.querySelector("[data-fra25-denominator-slot]")?.value || "",
        divisor: engine.root.querySelector("[data-fra25-divisor]")?.value.trim() || ""
      };
      if (question.response.includeFinalFraction) {
        response.n = engine.root.querySelector("[data-fra25-final-numerator]")?.value.trim() || "";
        response.d = engine.root.querySelector("[data-fra25-final-denominator]")?.value.trim() || "";
      }
      const complete = Boolean(response.numeratorSlot && response.denominatorSlot && /^\d+$/.test(response.divisor) && Number(response.divisor) > 0
        && (!question.response.includeFinalFraction || (/^-?\d+$/.test(response.n) && /^-?\d+$/.test(response.d) && Number(response.d) !== 0)));
      return complete || allowPartial ? response : null;
    }
    if (question.response.type === "fra25_quotient_pair") {
      const quotients = [...engine.root.querySelectorAll("[data-fra25-quotient]")].map((field) => field.value.trim());
      const complete = quotients.length === 2 && quotients.every((entry) => /^-?\d+$/.test(entry));
      return complete || allowPartial ? { quotients } : null;
    }
    if (question.response.type === "fra25_reduced_product_fraction") {
      const response = {};
      engine.root.querySelectorAll("[data-fra25-reduced]").forEach((field) => { response[field.dataset.fra25Reduced] = field.value.trim(); });
      response.finalNumerator = engine.root.querySelector("[data-fra25-final-numerator]")?.value.trim() || "";
      response.finalDenominator = engine.root.querySelector("[data-fra25-final-denominator]")?.value.trim() || "";
      const complete = ["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator", "finalNumerator", "finalDenominator"].every((key) => /^-?\d+$/.test(response[key])) && Number(response.leftDenominator) !== 0 && Number(response.rightDenominator) !== 0 && Number(response.finalDenominator) !== 0;
      return complete || allowPartial ? response : null;
    }
    return null;
  }

  function bindInputEvents(engine, question) {
    const form = engine.root.querySelector("#answer-form");
    const update = () => {
      engine.state.drafts[question.id] = readResponse(engine, question, true) || {};
      engine.updateSubmitAvailability(question);
      engine.persist();
    };
    form.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", update);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !engine.elements.primary.disabled) {
          event.preventDefault();
          engine.handlePrimary(engine.current());
        }
      });
    });
    form.querySelectorAll("select").forEach((select) => {
      select.addEventListener("change", update);
      select.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !engine.elements.primary.disabled) {
          event.preventDefault();
          engine.handlePrimary(engine.current());
        }
      });
    });
  }

  function validateQuestionModel(question) {
    const issues = [];
    const canonical = question?.canonicalQuestion || question?.model?.canonicalQuestion;
    if (!canonical) return ["FRA25 canonical question is missing"];
    const factors = canonical.visual?.math?.factors;
    if (factors) {
      [factors.left, factors.right].forEach((fraction, index) => {
        if (!Number.isInteger(fraction.numerator)) issues.push(`fraction ${index + 1} numerator must be an integer`);
        if (!Number.isInteger(fraction.denominator) || fraction.denominator <= 0) issues.push(`fraction ${index + 1} denominator must be positive`);
      });
    }
    return issues;
  }

  function validateRuntimeContract() {
    const issues = [
      ...(source?.validateFRA25LessonSpec?.() || ["validateFRA25LessonSpec is missing"]),
      ...(source?.runFRA25StaticAssertions?.() || ["runFRA25StaticAssertions is missing"])
    ];
    const seen = new Map();
    Object.entries(runtimeCopy).forEach(([id, entry]) => {
      const text = String(entry?.text || "").trim();
      if (!text) issues.push(`${id} has no runtime text`);
      if (entry?.captionSource !== "same_as_audio") issues.push(`${id} caption source is not same_as_audio`);
      if (seen.has(text.toLowerCase())) issues.push(`${id} duplicates ${seen.get(text.toLowerCase())}`);
      seen.set(text.toLowerCase(), id);
    });
    return [...new Set(issues)];
  }

  function apply(spec) {
    if (!lesson || !Object.keys(runtimeCopy).length) throw new Error("FRA25 approved runtime source was not loaded.");
    const issues = validateRuntimeContract();
    if (issues.length) throw new Error(`FRA25 runtime contract failed: ${issues.join("; ")}`);
    const questionBank = buildQuestions();
    const question = (id) => questionBank.find((item) => item.id === prefix(id));

    spec.identity = Object.assign({}, spec.identity, { id: LESSON_ID, title: lesson.title, status: lesson.status, version: CONTENT_VERSION });
    spec.learning_objective = lesson.curriculumBoundary.objective;
    spec.dependencies = Object.assign({}, spec.dependencies, { required_skill_refs: ["FRA-10", "FRA-24"] });
    spec.diagnostic = Object.assign({}, spec.diagnostic, { enabled: false, question_refs: [] });
    spec.retrieval_practice = Object.assign({}, spec.retrieval_practice, { enabled: false, question_refs: [] });
    spec.question_bank = questionBank;

    const nextByScene = { HOOK: "HOOK-CHOICE", T1: "T2", T2: "T3", T3: "T4", T4: "T5", T5: "HANDOFF", HANDOFF: "G1" };
    const hookChoiceStep = {
      id: "HOOK-CHOICE",
      purpose: "Choose a valid route",
      scene: { display_title: "Which route would you choose?", initial_state: lesson.teachingScenes[0].visual.visibleExpression, objects: ["two_route_product"], model: { context: "fra25", sceneId: "HOOK-CHOICE", visual: lesson.teachingScenes[0].visual } },
      narration: { script: [], utterance_ids: [], sync_cues: [] },
      animation_timeline: [],
      learner_interaction: { question_ref: prefix("HOOK-CHOICE") },
      next_step: "T1"
    };
    spec.lesson.teaching_steps = [
      teachingStep(lesson.teachingScenes[0], nextByScene.HOOK),
      hookChoiceStep,
      ...lesson.teachingScenes.slice(1).map((scene) => teachingStep(scene, nextByScene[scene.id]))
    ];

    const transferIds = ["G1", "G2", "F1", "F2", "I1", "I2"];
    const nextByQuestion = { G1: "G2", G2: "F1", F1: "F2", F2: "I1", I1: "I2", I2: "M1" };
    spec.lesson.transfer_steps = Object.fromEntries(transferIds.map((id) => {
      const item = question(id);
      const before = [...(item.scripts.before_submit || [])];
      if (id === "I1") before.unshift(textFor("INDEPENDENT.TRANSITION"));
      return [id, {
        stage: item.stage === "independent" ? "independent_transfer" : item.stage,
        question_ref: item.id,
        support_level: ["G1", "G2"].includes(id) ? "high" : ["F1", "F2"].includes(id) ? "reduced" : "none",
        pre_question_script: before,
        visual_before_answer: item.prompt,
        correct_next: nextByQuestion[id],
        recovery_ref: item.recovery_item_ref
      }];
    }));
    spec.lesson.practice = { intro_script: [], question_order: [], question_count: 0, feedback_policy: "FRA25 adaptive route only.", between_question_transition: "" };

    const finalIds = source.FRA25_FINAL_QUESTIONS.map((item) => prefix(item.id));
    const confirmationIds = source.FRA25_CONFIRMATION_QUESTIONS.map((item) => prefix(item.id));
    const replacementIds = source.FRA25_REPLACEMENT_FINALS.map((item) => prefix(item.id));
    spec.lesson.exit = {
      intro_script: textsFor(lesson.stageTransitionUtteranceIds.finalIntro),
      use_question_before_submit_narration: true,
      primary_question_refs: finalIds,
      confirmation_question_refs: [...confirmationIds, ...replacementIds],
      mastery_policy: {
        profile: "fra25_five_item",
        secureMinimum: 4,
        totalItems: 5,
        requireProceduralAndReasoningBreadth: true,
        blockRepeatedCentralMisconception: true,
        repeatedCentralFamilies: ["PAIR", "SHARED", "TERM", "NONE", "FINISH"],
        scoreThreeRecoveryCount: 2,
        scoreZeroToTwoRecoveryCount: 3
      }
    };
    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      skip_after: { G2: { type: "fra25_guided_strong", questionRefs: [prefix("G1"), prefix("G2")], next: "F2", otherwise: "F1" } },
      no_hint_gate_after: { nodeId: "I2", returnId: "M1", introUtteranceIds: lesson.stageTransitionUtteranceIds.hintConfirmation },
      no_hint_confirmation_by_question: {
        [prefix("F1")]: prefix("C-DIRECT"),
        [prefix("F2")]: prefix("C-PAIR"),
        [prefix("I1")]: prefix("C-DIRECT"),
        [prefix("I2")]: prefix("C-PAIR")
      },
      repair_by_error_family: repairByFamily,
      fresh_checks_by_error_family: freshByFamily,
      feedback_by_error_family: {},
      replacement_final_ids: replacementIds
    };

    spec.completion = {
      secure: { title: "Lesson complete", ryan_script: textsFor(lesson.stageTransitionUtteranceIds.completion), buttons: ["Back to Fractions", "Start again"] },
      needs_work: { title: "One more pass will help", ryan_script: [], buttons: ["Try the lesson again", "Back to Fractions"] }
    };
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narrator: "Ryan",
      voice: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      locale: "en-GB",
      opening_mode: "authored_scene_only",
      caption_presentation: { mode: "on_canvas_progressive", max_lines: 2, transcript_bar: false },
      narration_playback: { mode: "browser_speech_ryan", require_ryan_voice: true, browser_voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)", opening_delay_ms: 0 },
      success_reaction_policy: { mode: "question_specific_only" }
    });
    spec.visual_language = Object.assign({}, spec.visual_language, { primary_visual_contract: { primitive: "fra25_context", property_driven: true, no_answer_leakage: true } });
    spec.engine_capability_requirements = Object.assign({}, spec.engine_capability_requirements, { visual_primitives: ["fra25_context", "fraction_input", "single_choice", "pair_and_divisor", "quotient_pair", "reduced_product_input", "optional_hint", "post_submit_working", "caption_layer", "progress_indicator"] });
    spec.experience_contract = Object.assign({}, spec.experience_contract, { global_ui_copy: Object.assign({}, spec.experience_contract?.global_ui_copy, { submit: "Check answer" }) });
    spec.canonical_lesson = {
      reference_for_future_lessons: false,
      version: CONTENT_VERSION,
      content_version: CONTENT_VERSION,
      storyboard_version: "1.0-fra25-owner-approved",
      engine_profile: "fra25",
      runtime_applied: true,
      owner_review_status: "owner_approved_implementation_handoff_v1",
      runtime_copy: runtimeCopy,
      runtime_copy_text_to_id: Object.fromEntries(Object.entries(runtimeCopy).map(([id, entry]) => [entry.text, id])),
      source_of_truth: lesson.sourceOfTruth,
      source_corrections: lesson.sourceCorrections,
      phase_labels: { teaching: "Learn the idea", guided: "Try it with me", faded: "Your turn - some support remains", independent: "Now you take over", repair: "Repair", exit: "Final check", completion: "Lesson complete" },
      route_contract: lesson.route,
      persistence_contract: lesson.persistence,
      capabilities: { structured_factor_answers: true, draft_persistence: true, optional_hints: true, hint_evidence: true, final_working_after_locked_submit: true, five_item_final: true, targeted_repairs: true, fresh_confirmations: true, utterance_id_runtime: true, reduced_motion_equivalence: true }
    };
    return spec;
  }

  window.RevilyFra25Canonical = {
    CONTENT_VERSION,
    apply,
    buildQuestions,
    classifyErrorFamily,
    evaluatePrimaryFinal: source?.evaluatePrimaryFinal,
    evaluateResponse,
    freshByFamily,
    bindInputEvents,
    inputMarkup,
    prefix,
    recoveryRoutePasses: source?.recoveryRoutePasses,
    repairByFamily,
    readResponse,
    requiresRepeatedEvidence,
    runtimeCopy,
    shouldSkipF1: source?.shouldSkipF1,
    textFor,
    validateQuestionModel,
    validateRuntimeContract,
    visibleFeedback
  };
})();
