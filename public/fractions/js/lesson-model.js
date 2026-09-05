(function () {
  "use strict";

  const PHASE_LABELS = {
    teaching: "Learn the idea",
    guided: "Try it together",
    faded: "Less support",
    independent: "Your turn",
    independent_transfer: "Your turn",
    practice: "Build fluency",
    exit: "Final check",
    repair: "Quick repair",
    completion: "Complete"
  };

  function normalisePhase(stage) {
    if (stage === "independent_transfer" || stage === "independent") return "independent";
    return stage;
  }

  function buildLessonModel(spec) {
    const questions = new Map(spec.question_bank.map((question) => [question.id, question]));
    const nodes = [];
    const nodeMap = new Map();
    const recoveryByOrigin = new Map();
    const shortId = (id) => String(id || "").replace(`${spec.identity.id}-`, "");
    const primaryPrimitive = getPrimaryPrimitive(spec);
    const declaredPrimitives = new Set(spec.engine_capability_requirements?.visual_primitives || []);

    if (spec.canonical_lesson?.reference_for_future_lessons) {
      const requiredRefs = new Set([
        ...(spec.lesson?.teaching_steps || []).map((step) => step.learner_interaction?.question_ref),
        ...Object.values(spec.lesson?.transfer_steps || {}).map((step) => step.question_ref),
        ...(spec.lesson?.practice?.question_order || []),
        ...(spec.lesson?.exit?.primary_question_refs || []),
        ...(spec.lesson?.exit?.confirmation_question_refs || []),
        ...Object.values(spec.lesson?.exit?.repair_by_primary || {})
      ].filter(Boolean));
      requiredRefs.forEach((questionId) => {
        const question = questions.get(questionId);
        const issues = validateFractionQuestionModel(question);
        if (issues.length) throw new Error(`${questionId} has an invalid canonical model: ${issues.join("; ")}`);
      });
    }

    function visualForQuestion(question, description) {
      if (question?.visual?.primitive) return question.visual;
      const prompt = String(question?.prompt || description || "");
      let primitive = primaryPrimitive;
      const firstAvailable = (...candidates) => candidates.find((candidate) => declaredPrimitives.has(candidate));
      if (/order from|smallest to largest|largest to smallest/i.test(prompt)) primitive = firstAvailable("ordering_cards", "signed_number_line", "comparison_lane") || primitive;
      else if (/___|same value|compare/i.test(prompt)) primitive = firstAvailable("comparison_lane", "signed_number_line", "decimal_place_value_grid") || primitive;
      else if (/number line|intervals? after/i.test(prompt)) primitive = firstAvailable("number_line", "signed_number_line", "interval_counter") || primitive;
      else if (/£|°C|\bkg\b|\bkm\b|\bL\b|\bmetres?\b|cost|balance|temperature|mass|volume|area|journey|budget/i.test(prompt)) primitive = firstAvailable("context_model", "money_card", "measure_strip", "calculation_chain", "bar_model", "area_model") || primitive;
      else if (/÷/.test(prompt)) primitive = firstAvailable("division_scaler", "long_division", "grouping_model", "place_value_repartition") || primitive;
      else if (/×/.test(prompt)) primitive = firstAvailable("sign_magnitude_model", "decimal_area_model", "repeated_groups", "place_value_scaler") || primitive;
      else if (/[+] | [-] /.test(prompt)) primitive = firstAvailable("column_calculation", "signed_number_line", "opposite_transform") || primitive;
      return { primitive, description: description || question?.prompt || "", action: question?.visual?.action || "highlight" };
    }

    function addNode(node) {
      nodes.push(node);
      nodeMap.set(node.id, node);
      return node;
    }

    spec.lesson.teaching_steps.forEach((step) => {
      const questionId = step.learner_interaction?.question_ref || null;
      const question = questionId ? questions.get(questionId) : null;
      const node = addNode({
        id: step.id,
        phase: "teaching",
        kind: question ? "question" : "scene",
        narration: step.narration?.script || "",
        purpose: step.purpose,
        displayTitle: step.scene?.display_title || "",
        questionId,
        question,
        visual: question
          ? { ...visualForQuestion(question, step.scene?.initial_state || step.scene?.objects?.join(" ") || ""), action: step.animation_timeline?.[0]?.action || "highlight", timeline: step.animation_timeline || [], scene: step.scene || {}, syncCues: step.narration?.sync_cues?.length ? step.narration.sync_cues : (question?.visual?.syncCues || []) }
          : {
              primitive: primaryPrimitive,
              description: step.scene?.initial_state || step.scene?.objects?.join(" ") || "",
              action: step.animation_timeline?.[0]?.action || "fade_in",
              timeline: step.animation_timeline || [],
              scene: step.scene || {},
              syncCues: step.narration?.sync_cues || []
            },
        nextId: step.next_step || step.branching?.continue?.next_step || step.branching?.correct?.next_step || null,
        source: step
      });
      if (question?.recovery_item_ref) recoveryByOrigin.set(node.id, question.recovery_item_ref);
    });

    Object.entries(spec.lesson.transfer_steps || {}).forEach(([id, step]) => {
      const question = questions.get(step.question_ref);
      const node = addNode({
        id,
        phase: normalisePhase(step.stage),
        kind: "question",
        narration: step.pre_question_script || "",
        purpose: question?.target || step.stage,
        questionId: step.question_ref,
        question,
        visual: visualForQuestion(question, step.visual_before_answer || question?.visual?.description || question?.prompt || ""),
        nextId: step.correct_next || null,
        recoveryRef: step.recovery_ref || question?.recovery_item_ref || null,
        supportLevel: step.support_level,
        source: step
      });
      if (node.recoveryRef) recoveryByOrigin.set(node.id, node.recoveryRef);
    });

    const practiceIds = spec.lesson.practice?.question_order || [];
    practiceIds.forEach((questionId, index) => {
      const question = questions.get(questionId);
      const nextId = shortId(practiceIds[index + 1] || spec.lesson.exit?.primary_question_refs?.[0] || "") || null;
      const node = addNode({
        id: shortId(questionId),
        phase: "practice",
        kind: "question",
        narration: index === 0 ? spec.lesson.practice.intro_script || "" : "",
        purpose: question?.target || "Practice",
        questionId,
        question,
        visual: visualForQuestion(question, question?.prompt),
        nextId,
        source: question
      });
      if (question?.recovery_item_ref) recoveryByOrigin.set(node.id, question.recovery_item_ref);
    });

    const exitIds = spec.lesson.exit?.primary_question_refs || [];
    exitIds.forEach((questionId, index) => {
      const question = questions.get(questionId);
      addNode({
        id: shortId(questionId),
        phase: "exit",
        kind: "question",
        narration: spec.lesson.exit?.use_question_before_submit_narration === true
          ? [...(index === 0 ? [spec.lesson.exit.intro_script || []] : []), ...(question?.scripts?.before_submit || [])].flat(Infinity).filter(Boolean)
          : (index === 0 ? spec.lesson.exit.intro_script || "" : ""),
        purpose: question?.target || "Final check",
        questionId,
        question,
        visual: visualForQuestion(question, question?.prompt),
        nextId: shortId(exitIds[index + 1] || "") || null,
        exit: true,
        source: question
      });
    });

    const firstId = nodes[0]?.id || null;
    const instructionalNodes = nodes.filter((node) => node.phase !== "exit");
    const phaseStarts = new Map();
    nodes.forEach((node) => {
      if (!phaseStarts.has(node.phase)) phaseStarts.set(node.phase, node.id);
    });

    return {
      spec,
      questions,
      nodes,
      nodeMap,
      recoveryByOrigin,
      firstId,
      instructionalNodes,
      phaseStarts,
      exitIds,
      confirmationIds: spec.lesson.exit?.confirmation_question_refs || [],
      primaryPrimitive,
      visualForQuestion,
      getNode(id) {
        return nodeMap.get(id) || null;
      },
      getQuestion(id) {
        return questions.get(id) || null;
      },
      getProgressIndex(id) {
        const index = nodes.findIndex((node) => node.id === id);
        return Math.max(0, index);
      },
      phaseLabel(phase) {
        const authored = spec.canonical_lesson?.phase_labels;
        if (authored && authored[phase]) return authored[phase];
        if (spec.canonical_lesson?.storyboard_version === "2.0") {
          const labels = { teaching: "Learn the idea", guided: "Try it with me", faded: "Less help", independent: "On your own", repair: "Quick repair", exit: "Final check", completion: "Complete" };
          return labels[phase] || "Lesson";
        }
        return PHASE_LABELS[phase] || "Lesson";
      }
    };
  }

  function getPrimaryPrimitive(spec) {
    if (spec.visual_language?.primary_visual_contract?.primitive) return spec.visual_language.primary_visual_contract.primitive;
    if (spec.visual_language?.fraction_bar_contract) return "fraction_bar";
    const itemPrimitive = (spec.question_bank || []).find((question) => question.visual?.primitive)?.visual.primitive;
    if (itemPrimitive) return itemPrimitive;
    const declared = spec.engine_capability_requirements?.visual_primitives || [];
    return declared.find((primitive) => !["fraction_input", "integer_input", "decimal_input", "caption_layer", "progress_indicator", "single_choice", "yes_no", "comparison_symbol"].includes(primitive)) || "fraction_bar";
  }

  function validateFractionQuestionModel(question) {
    const issues = [];
    if (!question) return ["question is missing"];
    const model = question.model;
    if (!model || typeof model !== "object") return ["question.model is missing"];
    if (!question.assessmentIntent) issues.push("assessmentIntent is missing");
    if (!model.context) issues.push("model.context is missing");
    if (model.context === "fraction_comparison") {
      ["left", "right"].forEach((side) => {
        if (!Number.isInteger(model[side]?.numerator) || model[side].numerator < 0) issues.push(`${side} numerator must be a non-negative integer`);
        if (!Number.isInteger(model[side]?.denominator) || model[side].denominator <= 0) issues.push(`${side} denominator must be a positive integer`);
      });
      if (!["<", ">", "="].includes(model.answer)) issues.push("comparison answer must be <, > or =");
      if (model.sameWholeSize !== true) issues.push("comparison models must explicitly preserve the same whole size");
      return issues;
    }
    if (["fra05_number_line", "fra05_runner_track"].includes(model.context)) {
      const fra05Issues = window.RevilyFra05Canonical?.validateNumberLineModel?.(question) || [];
      issues.push(...fra05Issues);
      return issues;
    }
    if (model.context === "fra09_given_factor") {
      const fra09Issues = window.RevilyFra09Adapter?.validateQuestionModel?.(question) || [];
      issues.push(...fra09Issues);
      return issues;
    }
    if (model.context === "fra10_simplest_form") {
      const fra10Issues = window.RevilyFra10Adapter?.validateQuestionModel?.(question) || [];
      issues.push(...fra10Issues);
      return issues;
    }
    if (model.context === "fra11_improper_to_mixed") {
      const fra11Issues = window.RevilyFra11Canonical?.validateQuestionModel?.(question) || [];
      issues.push(...fra11Issues);
      return issues;
    }
    if (model.context === "fra12_mixed_to_improper") {
      const mixed = model.mixedNumber;
      if (!mixed || !Number.isInteger(mixed.whole) || mixed.whole < 0) issues.push("mixed-number whole must be a non-negative integer");
      if (!mixed || !Number.isInteger(mixed.numerator) || mixed.numerator < 0) issues.push("mixed-number numerator must be a non-negative integer");
      if (!mixed || !Number.isInteger(mixed.denominator) || mixed.denominator <= 0) issues.push("mixed-number denominator must be a positive integer");
      if (question.response?.type === "fraction" && question.response.accept_equivalent_notation !== false) issues.push("FRA12 fraction inputs must preserve the requested original denominator");
      return issues;
    }
    if (model.context === "fra06") {
      const fra06Issues = window.RevilyFra06Canonical?.validateQuestionModel?.(question) || [];
      issues.push(...fra06Issues);
      return issues;
    }
    if (model.context === "fra07") {
      if (question.policy?.engagementOnly && question.canonicalHook) return issues;
      if (question.policy?.reteachOnly && question.canonicalRepair) return issues;
      if (!question.canonicalQuestion) issues.push("FRA07 canonical question data is missing");
      return issues;
    }
    if (model.context === "fra08_equivalent_fraction") {
      const visual = question.canonicalQuestion?.visual || model;
      const fractions = [];
      [visual.left, visual.right, visual.source, visual.original].forEach((value) => {
        if (!value || typeof value !== "object") return;
        if ("numerator" in value && "denominator" in value) fractions.push(value);
      });
      fractions.forEach((fraction, index) => {
        if (fraction.denominator !== "missing" && fraction.denominator !== "input" && (!Number.isInteger(fraction.denominator) || fraction.denominator <= 0)) issues.push(`fraction ${index + 1} denominator must be a positive integer`);
      });
      if (question.response?.type === "fraction" && question.response.accept_equivalent_notation !== false) issues.push("factor-specific fraction inputs must be form-sensitive");
      return issues;
    }
    if (model.context === "fra13") {
      const problem = model.problem;
      if (!problem || typeof problem !== "object") return issues;
      if (!Number.isInteger(problem.denominator) || problem.denominator <= 0) issues.push("denominator must be a positive integer");
      if (!Number.isInteger(problem.numerator) || problem.numerator <= 0) issues.push("numerator must be a positive integer");
      if (!Number.isInteger(problem.quantity?.amountBaseUnits)) issues.push("amountBaseUnits must be an integer");
      if (Number.isInteger(problem.quantity?.amountBaseUnits) && Number.isInteger(problem.denominator) && problem.quantity.amountBaseUnits % problem.denominator !== 0) issues.push("amount must divide exactly by the denominator");
      if (problem.quantity?.kind === "money" && problem.quantity?.scale !== 100) issues.push("money must use a scale of 100 pence per pound");
      return issues;
    }
    if (model.context === "fra15") {
      const fra15Issues = window.RevilyFra15Canonical?.validateQuestionModel?.(question) || [];
      issues.push(...fra15Issues);
      return issues;
    }
    if (model.context === "fra16") {
      if (question.policy?.engagementOnly && model.canonicalScene?.interaction) return issues;
      if (question.policy?.reteachOnly && model.canonicalRepair) return issues;
      const canonical = question.canonicalQuestion || model.canonicalQuestion;
      if (!canonical || !Array.isArray(canonical.fractions)) return ["FRA16 canonical question data is missing"];
      canonical.fractions.forEach((item, index) => {
        if (!Number.isInteger(item.value?.numerator) || item.value.numerator <= 0) issues.push(`fraction ${index + 1} numerator must be a positive integer`);
        if (!Number.isInteger(item.value?.denominator) || item.value.denominator <= 0) issues.push(`fraction ${index + 1} denominator must be a positive integer`);
      });
      return issues;
    }
    if (model.context === "fra22") {
      if (question.policy?.reteachOnly && model.repair) return issues;
      const canonical = question.canonicalQuestion || model.canonicalQuestion;
      if (!canonical) return ["FRA22 canonical question data is missing"];
      if (canonical.math) {
        const math = canonical.math;
        if (!Number.isInteger(math.left?.denominator) || math.left.denominator <= 0) issues.push("left denominator must be a positive integer");
        if (!Number.isInteger(math.right?.denominator) || math.right.denominator <= 0) issues.push("right denominator must be a positive integer");
        if (!Number.isInteger(math.commonDenominator) || math.commonDenominator <= 0) issues.push("common denominator must be a positive integer");
      }
      if (!canonical.canonicalSignature) issues.push("canonical signature is missing");
      if (!model.freshnessSignature) issues.push("freshness signature is missing");
      return issues;
    }
    if (model.context === "fra24") {
      if (question.policy?.engagementOnly && model.canonicalScene) return issues;
      if (question.policy?.reteachOnly && model.canonicalRepair) return issues;
      const canonical = question.canonicalQuestion || model.canonicalQuestion;
      if (!canonical || !canonical.factors) return ["FRA24 canonical question data is missing"];
      [canonical.factors.first, canonical.factors.second].forEach((factor, index) => {
        if (!Number.isInteger(factor?.numerator) || factor.numerator <= 0) issues.push(`factor ${index + 1} numerator must be a positive integer`);
        if (!Number.isInteger(factor?.denominator) || factor.denominator <= 0) issues.push(`factor ${index + 1} denominator must be a positive integer`);
      });
      return issues;
    }
    if (model.context === "fra23") {
      issues.push(...(window.RevilyFra23Canonical?.validateQuestionModel?.(question) || []));
      return issues;
    }
    if (model.context === "fra19") {
      if (!model.canonicalQuestion && !model.canonicalRepair && !model.sceneId) issues.push("FRA-19 canonical question, repair, or scene data is missing");
      if (!model.visual) issues.push("FRA-19 visual data is missing");
      return issues;
    }
    if (model.context === "fra20") {
      const fra20Issues = window.RevilyFra20Canonical?.validateQuestionModel?.(question) || [];
      issues.push(...fra20Issues);
      return issues;
    }
    if (model.context === "fra26") {
      issues.push(...(window.RevilyFra26Canonical?.validateQuestionModel?.(question) || ["FRA-26 validator is unavailable"]));
      return issues;
    }
    if (model.context === "fra14_whole_from_part") {
      const fra14Issues = window.RevilyFra14Canonical?.validateQuestionModel?.(question) || [];
      issues.push(...fra14Issues);
      return issues;
    }
    if (model.context === "fra28_divide_fraction") {
      issues.push(...(window.RevilyFra28Canonical?.validateQuestionModel?.(question) || []));
      return issues;
    }
    if (!Number.isInteger(model.totalParts) || model.totalParts <= 0) issues.push("totalParts must be a positive integer");
    if (!Number.isInteger(model.selectedParts) || model.selectedParts < 0 || (!model.allowMultipleWholes && model.selectedParts > model.totalParts)) {
      issues.push("selectedParts must be a non-negative integer and stay within one whole unless multiple wholes are explicitly allowed");
    }
    (question.response?.optionModels || []).forEach((option, index) => {
      if (!Number.isInteger(option.totalParts) || option.totalParts <= 0) issues.push(`option ${index + 1} totalParts must be positive`);
      if (!Number.isInteger(option.selectedParts) || option.selectedParts < 0 || option.selectedParts > option.totalParts) {
        issues.push(`option ${index + 1} selectedParts is outside its whole`);
      }
    });
    return issues;
  }

  window.RevilyLessonModel = { PHASE_LABELS, buildLessonModel, getPrimaryPrimitive, normalisePhase, validateFractionQuestionModel };
})();
