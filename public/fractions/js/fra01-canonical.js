(function () {
  "use strict";

  const FRA01_ID = "FRA-01";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function canonicalQuestion(question, overrides) {
    const updated = Object.assign(clone(question), overrides || {});
    updated.visual = Object.assign({}, updated.visual || {}, {
      primitive: "fraction_area",
      action: updated.visual?.action || "highlight",
      model: updated.model || null
    });
    return updated;
  }

  function model(context, totalParts, selectedParts, selectedMeaning, extras) {
    return Object.assign({
      context,
      totalParts,
      selectedParts,
      selectedMeaning,
      targetMeaning: selectedMeaning,
      unequalParts: false
    }, extras || {});
  }

  function apply(spec) {
    if (!spec || spec.identity?.id !== FRA01_ID || spec.canonical_lesson?.runtime_applied) return spec;

    const questions = new Map((spec.question_bank || []).map((question) => [question.id, question]));
    const originalSteps = new Map((spec.lesson?.teaching_steps || []).map((step) => [step.id, step]));
    const originalTransfer = spec.lesson?.transfer_steps || {};

    const questionOverrides = {
      "FRA-01-C01": {
        stage: "guided",
        target: "Read a shaded fraction bar",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "high",
        prompt: "What fraction of this whole is shaded?",
        model: model("fraction_bar", 6, 1, "shaded"),
        scaffold: { showWhole: true, showRoleLabels: true },
        misconceptionChecks: ["reversed_fraction", "shaded_only_denominator", "wrong_whole"]
      },
      "FRA-01-C02": {
        stage: "guided",
        target: "Read a highlighted circular model",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "high",
        prompt: "What fraction of the circle is highlighted?",
        model: model("circle", 4, 3, "highlighted"),
        scaffold: { showWhole: true, showRoleLabels: true },
        misconceptionChecks: ["reversed_fraction", "unselected_as_numerator"]
      },
      "FRA-01-G01": {
        stage: "faded",
        target: "Read a coloured fraction bar",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "reduced",
        prompt: "What fraction of the boxes is coloured?",
        model: model("boxes", 10, 4, "coloured"),
        scaffold: { showWhole: true, showRoleLabels: false },
        recovery_item_ref: "FRA-01-R01",
        misconceptionChecks: ["reversed_fraction", "shaded_only_denominator"]
      },
      "FRA-01-F01": {
        stage: "faded",
        target: "Interpret a selected set as a fraction",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "reduced",
        prompt: "What fraction of the counter set is blue?",
        model: model("counter", 12, 5, "blue"),
        scaffold: { showWhole: true, showRoleLabels: false },
        recovery_item_ref: "FRA-01-R02",
        misconceptionChecks: ["wrong_whole", "unselected_as_numerator"]
      },
      "FRA-01-P04": {
        stage: "faded",
        target: "Reject an unequal partition",
        assessmentIntent: "validity_decision",
        supportLevel: "reduced",
        prompt: "Does every slice show one sixth of the pizza?",
        model: model("pizza", 6, 0, "none", { unequalParts: true }),
        scaffold: { showWhole: true, showRoleLabels: false },
        recovery_item_ref: "FRA-01-R03",
        misconceptionChecks: ["unequal_parts_accepted"]
      },
      "FRA-01-I01": {
        stage: "independent_transfer",
        target: "Identify a fraction in a set context",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "none",
        prompt: "What fraction of the cupcakes is iced?",
        model: model("cupcake", 9, 7, "icing"),
        recovery_item_ref: "FRA-01-R02",
        misconceptionChecks: ["wrong_whole", "unselected_as_numerator"]
      },
      "FRA-01-P03": {
        stage: "independent_transfer",
        target: "Interpret the remaining fraction in context",
        assessmentIntent: "context_to_symbol",
        supportLevel: "none",
        prompt: "Sam ate the lighter pieces. What fraction of the original chocolate bar remains?",
        model: model("chocolate", 12, 7, "remaining", { unselectedMeaning: "eaten" }),
        recovery_item_ref: "FRA-01-R01",
        misconceptionChecks: ["used_instead_of_remaining", "changed_denominator"]
      },
      "FRA-01-P01": {
        stage: "independent_transfer",
        target: "Match a fraction to its model",
        assessmentIntent: "symbol_to_visual",
        supportLevel: "none",
        prompt: "Which model shows 2/5 of one whole shaded?",
        targetFraction: "2/5",
        model: model("strip", 5, 2, "shaded"),
        response: {
          type: "single_choice",
          options: ["A", "B", "C"],
          optionModels: [
            { label: "A", context: "strip", totalParts: 5, selectedParts: 2, selectedMeaning: "shaded" },
            { label: "B", context: "strip", totalParts: 5, selectedParts: 3, selectedMeaning: "shaded" },
            { label: "C", context: "strip", totalParts: 4, selectedParts: 2, selectedMeaning: "shaded" }
          ],
          keyboard_submit: true
        },
        answer: { value: "A" },
        recovery_item_ref: "FRA-01-R01",
        misconceptionChecks: ["numerator_denominator_roles", "representation_mismatch"]
      },
      "FRA-01-P02": {
        stage: "confirmation",
        target: "Confirm a selected set fraction",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "none",
        prompt: "What fraction of the tiles is red?",
        model: model("tile", 8, 3, "red"),
        misconceptionChecks: ["wrong_whole", "unselected_as_numerator"]
      },
      "FRA-01-P05": {
        stage: "retest",
        target: "Check unused fraction reasoning",
        assessmentIntent: "context_to_symbol",
        supportLevel: "none",
        prompt: "The lighter lengths have been used. What fraction of the ribbon is unused?",
        model: model("ribbon", 10, 3, "unused", { unselectedMeaning: "used" }),
        misconceptionChecks: ["used_instead_of_unused", "changed_denominator"]
      },
      "FRA-01-C03": {
        stage: "confirmation",
        target: "Confirm the equal-parts condition",
        assessmentIntent: "validity_decision",
        supportLevel: "none",
        prompt: "Do these regions represent quarters?",
        model: model("circle", 4, 0, "none", { unequalParts: true }),
        misconceptionChecks: ["unequal_parts_accepted"]
      },
      "FRA-01-E01": {
        stage: "exit",
        target: "Independent visual fraction interpretation",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "none",
        prompt: "What fraction of this whole is selected?",
        model: model("fraction_bar", 9, 4, "selected"),
        misconceptionChecks: ["reversed_fraction", "shaded_only_denominator"]
      },
      "FRA-01-E02": {
        stage: "exit",
        target: "Independent equal-parts reasoning",
        assessmentIntent: "validity_decision",
        supportLevel: "none",
        prompt: "Does every region show one seventh of the whole?",
        model: model("shape", 7, 0, "none", { unequalParts: true }),
        misconceptionChecks: ["unequal_parts_accepted"]
      },
      "FRA-01-E03": {
        stage: "exit",
        target: "Independent set fraction interpretation",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "none",
        prompt: "What fraction of the counters is selected?",
        model: model("counter", 11, 6, "selected"),
        misconceptionChecks: ["wrong_whole", "unselected_as_numerator"]
      },
      "FRA-01-E04": {
        stage: "confirmation",
        target: "Confirm part-whole interpretation",
        assessmentIntent: "visual_to_symbol",
        supportLevel: "none",
        prompt: "What fraction of this strip is shaded?",
        model: model("strip", 8, 5, "shaded"),
        misconceptionChecks: ["reversed_fraction", "unselected_as_numerator"]
      },
      "FRA-01-R01": {
        stage: "recovery",
        target: "Repair numerator and denominator roles",
        assessmentIntent: "supported_visual_to_symbol",
        supportLevel: "repair",
        prompt: "Use the labels to write the shaded fraction.",
        model: model("fraction_bar", 4, 1, "shaded"),
        scaffold: { showWhole: true, showRoleLabels: true },
        misconceptionChecks: ["reversed_fraction", "shaded_only_denominator"]
      },
      "FRA-01-R02": {
        stage: "recovery",
        target: "Repair set-whole reasoning",
        assessmentIntent: "supported_visual_to_symbol",
        supportLevel: "repair",
        prompt: "Use the labels to write the blue fraction.",
        model: model("counter", 6, 2, "blue"),
        scaffold: { showWhole: true, showRoleLabels: true },
        misconceptionChecks: ["wrong_whole", "unselected_as_numerator"]
      },
      "FRA-01-R03": {
        stage: "recovery",
        target: "Repair the equal-parts condition",
        assessmentIntent: "supported_validity_decision",
        supportLevel: "repair",
        prompt: "Compare the piece sizes. Are these pieces fifths?",
        model: model("shape", 5, 0, "none", { unequalParts: true }),
        scaffold: { showWhole: true, showEqualSizeCue: true },
        misconceptionChecks: ["unequal_parts_accepted"]
      }
    };

    spec.question_bank = (spec.question_bank || []).map((question) => {
      const overrides = questionOverrides[question.id];
      return overrides ? canonicalQuestion(question, overrides) : question;
    });

    const teachingIds = ["T01", "T02", "T04", "T05", "T07", "T08", "T09", "T10"];
    spec.lesson.teaching_steps = teachingIds.map((id, index) => {
      const step = clone(originalSteps.get(id));
      step.learner_interaction = Object.assign({}, step.learner_interaction, { question_ref: null, auto_focus: false });
      step.next_step = teachingIds[index + 1] || "G01";
      step.branching = { continue: { next_step: step.next_step } };
      if (id === "T08") {
        step.scene = Object.assign({}, step.scene, { variant: "equal_parts_trap", model: { parts: 4 } });
        step.scene.display_title = "Equal parts are essential";
      }
      return step;
    });

    const transferDefinitions = [
      ["G01", "guided", "FRA-01-C01", "high", originalTransfer.G01?.pre_question_script || ""],
      ["G02", "guided", "FRA-01-C02", "high", ""],
      ["F01", "faded", "FRA-01-G01", "reduced", originalTransfer.F01?.pre_question_script || ""],
      ["F02", "faded", "FRA-01-F01", "reduced", ""],
      ["F03", "faded", "FRA-01-P04", "reduced", ""],
      ["I01", "independent_transfer", "FRA-01-I01", "none", originalTransfer.I01?.pre_question_script || ""],
      ["I02", "independent_transfer", "FRA-01-P03", "none", ""],
      ["I03", "independent_transfer", "FRA-01-P01", "none", ""]
    ];
    spec.lesson.transfer_steps = Object.fromEntries(transferDefinitions.map((definition, index) => {
      const [id, stage, question_ref, support_level, pre_question_script] = definition;
      const next = transferDefinitions[index + 1]?.[0] || "E01";
      return [id, {
        stage,
        question_ref,
        support_level,
        pre_question_script,
        visual_before_answer: "Render the exact structured question model without pre-filling the learner response.",
        correct_next: next,
        recovery_ref: questions.get(question_ref)?.recovery_item_ref || questionOverrides[question_ref]?.recovery_item_ref || null
      }];
    }));

    spec.lesson.practice = {
      intro_script: "",
      question_order: [],
      question_count: 0,
      feedback_policy: "Independent questions reveal concise working only after submission. Extra items appear only when the evidence calls for them.",
      between_question_transition: "No generic praise or repeated prompt narration."
    };
    spec.lesson.exit = Object.assign({}, spec.lesson.exit, {
      intro_script: "",
      primary_question_refs: ["FRA-01-E01", "FRA-01-E02", "FRA-01-E03"],
      confirmation_question_refs: ["FRA-01-E04", "FRA-01-C03", "FRA-01-P02"],
      confirmation_by_primary: {
        "FRA-01-E01": "FRA-01-E04",
        "FRA-01-E02": "FRA-01-C03",
        "FRA-01-E03": "FRA-01-P02"
      },
      repair_by_primary: {
        "FRA-01-E01": "FRA-01-R01",
        "FRA-01-E02": "FRA-01-R03",
        "FRA-01-E03": "FRA-01-R02"
      },
      post_repair_retest_refs: ["FRA-01-E04", "FRA-01-C03", "FRA-01-P02", "FRA-01-P05"],
      mastery_logic: {
        "3_correct_of_3": "SECURE",
        "2_correct_of_3": "Ask one fresh confirmation matched to the missed idea. A correct response completes the lesson; otherwise repair and retest.",
        "0_or_1_correct_of_3": "Teach the first missed idea again, then require two fresh successful checks before completion."
      }
    });

    spec.lesson.adaptive_pathway = {
      evidence_scope: "current_lesson_only",
      strong_route: "Two first-attempt guided successes allow the learner to demonstrate the idea once with faded support. Two first-attempt independent successes allow the learner to move to the final check.",
      typical_route: "Use a second faded item when earlier evidence included a retry. Use the third faded item only when equal-parts validity still needs checking.",
      struggling_route: "Classify the error, show the matching repair, then ask a fresh parallel item. Never repeat the identical prompt as proof of mastery.",
      skip_after: {
        F01: { requires: ["G01", "G02", "F01"], next: "I01" },
        F02: { requires: ["F01", "F02"], next: "I01" },
        I02: { requires: ["I01", "I02"], next: "E01" }
      },
      fresh_check_by_recovery: {
        "FRA-01-R01": "FRA-01-P05",
        "FRA-01-R02": "FRA-01-P02",
        "FRA-01-R03": "FRA-01-C03"
      }
    };

    spec.identity.status = "canonical_reference_lesson";
    spec.identity.estimated_minutes = { min: 10, max: 18 };
    spec.experience_contract.target_session_minutes = { min: 10, max: 18 };
    spec.canonical_lesson = {
      reference_for_future_lessons: true,
      version: "2.0",
      runtime_applied: true,
      source_of_truth: "Structured question.model, assessmentIntent, response and answer fields",
      out_of_scope: ["global diagnostic engine", "cross-lesson retrieval practice"]
    };
    return spec;
  }

  window.RevilyFra01Canonical = { apply };
})();
