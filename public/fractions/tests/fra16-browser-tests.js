(async function () {
  "use strict";

  const status = document.getElementById("fra16-browser-status");
  const fixture = document.getElementById("fra16-browser-fixture");
  const loader = window.RevilySkillLoader;
  const topic = window.RevilyTopics.find("fractions");
  const canonical = window.RevilyFra16Canonical;
  const approved = window.RevilyFra16V1;
  const { LessonEngine } = window.RevilyLessonEngine;
  const { buildLessonModel } = window.RevilyLessonModel;
  const { validate } = window.RevilyValidators;
  let checks = 0;

  function assert(condition, message) {
    checks += 1;
    if (!condition) throw new Error(message);
  }

  function right(question) {
    const value = question.answer.value;
    if (question.response.type === "fra16_equivalent_comparison") return { rewrittenNumerators: [...value.rewrittenNumerators], symbol: value.symbol };
    if (question.response.type === "fra16_benchmark_comparison") return { relations: [...value.relations], symbol: value.symbol };
    if (question.response.type === "fra16_order_cards") return [...value];
    return value;
  }

  function wrong(question) {
    const value = question.answer.value;
    if (question.response.type === "fra16_equivalent_comparison") return { rewrittenNumerators: [String(Number(value.rewrittenNumerators[0]) + 1), String(value.rewrittenNumerators[1])], symbol: value.symbol };
    if (question.response.type === "fra16_benchmark_comparison") return { relations: [...value.relations], symbol: ["<", ">", "="].find((symbol) => symbol !== value.symbol) };
    if (question.response.type === "fra16_order_cards") return [...value].reverse();
    return (question.response.options || []).find((option) => String(option) !== String(value));
  }

  function harness(spec, dialogue, cursor) {
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

  function fill(engine, question, response) {
    if (question.response.type === "fra16_equivalent_comparison") {
      engine.root.querySelectorAll("[data-fra16-equivalent-index]").forEach((input) => { input.value = response.rewrittenNumerators[Number(input.dataset.fra16EquivalentIndex)]; });
      engine.root.querySelector("[data-fra16-symbol]").value = response.symbol;
    } else if (question.response.type === "fra16_benchmark_comparison") {
      engine.root.querySelectorAll("[data-fra16-relation-index]").forEach((select) => { select.value = response.relations[Number(select.dataset.fra16RelationIndex)]; });
      engine.root.querySelector("[data-fra16-symbol]").value = response.symbol;
    } else if (question.response.type === "fra16_order_cards") {
      const list = engine.root.querySelector("[data-fra16-order-list]");
      response.forEach((id) => list.appendChild(list.querySelector(`[data-card-id="${id}"]`)));
    } else {
      const options = engine.choiceOptions(question);
      engine.root.querySelector("#choice-answer").value = String(options.findIndex((option) => String(option) === String(response)));
    }
  }

  try {
    const manifest = await loader.loadManifest(topic);
    const dialogue = await loader.loadDialogueProfile(topic);
    const entry = manifest.skills.find((skill) => skill.id === "FRA-16");
    const { spec } = await loader.loadSkill(topic, entry.id);
    const model = buildLessonModel(spec);
    const registry = spec.canonical_lesson.runtime_copy;

    assert(approved.validateCanonicalSpec().length === 0, "validateFRA16CanonicalSpec failed");
    assert(canonical.validateRuntimeContract().length === 0, "runtime/caption/cue parity failed");
    assert(Object.keys(registry).length === 148, "runtime registry count changed");
    assert(spec.voice_and_script.narration_playback.provider === "Microsoft Edge Neural TTS", "Ryan provider changed");
    assert(spec.voice_and_script.narration_playback.voice_id === "en-GB-RyanNeural", "Ryan voice ID changed");
    Object.entries(registry).forEach(([id, utterance]) => {
      const track = window.RevilyFra16NarrationAssets.tracksByUtteranceId[id];
      assert(track?.text === utterance.text, `${id} caption/audio text changed`);
      assert(track?.words?.length > 0, `${id} has no timing`);
    });
    approved.getAllQuestionLikeSpecs().forEach((raw) => {
      const question = model.getQuestion(`FRA-16-${raw.id}`);
      const correctResponse = right(question);
      const incorrectResponse = wrong(question);
      assert(validate(question, correctResponse), `${raw.id} rejects its answer`);
      assert(!validate(question, incorrectResponse), `${raw.id} accepts a wrong answer`);
      assert(canonical.selectOutcomeUtteranceIds(question, correctResponse, true).join("|") === raw.feedback.correctUtteranceIds.join("|"), `${raw.id} correct branch changed`);
      assert(!canonical.selectOutcomeUtteranceIds(question, incorrectResponse, false).some((id) => raw.feedback.correctUtteranceIds.includes(id)), `${raw.id} wrong answer played correct feedback`);
    });
    assert(model.getQuestion("FRA-16-R-EQUIV").equalityExtensionUtteranceIds.join("|") === "R-EQUIV.EQUALITY", "equality repair extension changed");

    const hookQuestion = model.getQuestion("FRA-16-HOOK-CHOICE");
    const hookScene = approved.spec.teachingScenes.find((scene) => scene.id === "HOOK");
    const branches = [];
    hookScene.interaction.options.forEach((option) => {
      const test = harness(spec, dialogue, "HOOK-CHOICE");
      const spoken = [];
      test.engine.startNarration = (lines) => spoken.push(...lines);
      fill(test.engine, hookQuestion, option.label);
      test.engine.submitAnswer(test.engine.current());
      assert(spoken.join("|") === approved.getHookResponseSequence(option.id).map((id) => registry[id].text).join("|"), `hook ${option.id} branch changed`);
      assert(test.engine.state.resolved[hookQuestion.id] === "engagement", `hook ${option.id} was scored`);
      branches.push(spoken.join("|"));
      test.engine.destroy();
      test.host.remove();
    });
    assert(new Set(branches).size === 4, "hook branches are not distinct");

    const order = harness(spec, dialogue, "F2");
    const list = order.engine.root.querySelector("[data-fra16-order-list]");
    const ids = () => [...list.querySelectorAll("[data-fra16-order-item]")].map((item) => item.dataset.cardId);
    const initial = ids();
    list.querySelector(".fra16-order-card").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    assert(ids()[1] === initial[0], "keyboard ordering failed");
    list.querySelector(`[data-card-id="${initial[0]}"] [data-fra16-move='left']`).click();
    assert(ids().join("|") === initial.join("|"), "move-button ordering failed");
    const data = new DataTransfer();
    const dragSource = list.querySelector(`[data-card-id="${initial[0]}"]`);
    const dragTarget = list.querySelector(`[data-card-id="${initial[2]}"]`);
    dragSource.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: data }));
    dragTarget.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: data }));
    assert(ids().join("|") !== initial.join("|"), "pointer ordering failed");
    order.engine.destroy();
    order.host.remove();

    [true, false].forEach((isCorrect) => {
      const test = harness(spec, dialogue, "M1");
      const question = test.engine.current().question;
      const response = isCorrect ? right(question) : wrong(question);
      const narration = [];
      let done = null;
      test.engine.startNarration = (lines, callback) => { narration.push([...lines]); if (!done && callback) done = callback; };
      fill(test.engine, question, response);
      test.engine.submitAnswer(test.engine.current());
      const expected = canonical.selectOutcomeUtteranceIds(question, response, isCorrect).map((id) => registry[id].text);
      assert(narration[0].join("|") === expected.join("|"), `M1 ${isCorrect ? "correct" : "incorrect"} branch changed`);
      assert(test.engine.state.evidence.answerLocked[question.id] === true, "M1 did not lock");
      assert(!test.engine.state.workedRevealed[question.id] && !test.engine.root.querySelector(".fra16-worked"), "M1 working leaked before outcome completion");
      done();
      assert(test.engine.state.workedRevealed[question.id] && test.engine.root.querySelector(".fra16-worked"), "M1 working did not reveal after lock");
      test.engine.destroy();
      test.host.remove();
    });

    const frame = document.createElement("iframe");
    frame.style.cssText = "width:390px;height:844px;border:0";
    fixture.appendChild(frame);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("390px frame timed out")), 5000);
      frame.onload = () => setTimeout(() => { clearTimeout(timer); resolve(); }, 700);
      frame.src = "../?dev=1#/fractions/FRA-16";
    });
    const width = frame.contentWindow.innerWidth;
    const overflow = [...frame.contentDocument.querySelectorAll("body *")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > width + 2 || rect.left < -2;
    });
    assert(width === 390, "mobile viewport is not 390px");
    assert(frame.contentDocument.documentElement.scrollWidth <= width + 2 && overflow.length === 0, "390px layout overflows");
    assert([...frame.contentDocument.querySelectorAll("button,input,select")].every((element) => element.getBoundingClientRect().right <= width + 2), "390px controls overflow");
    frame.remove();

    status.textContent = `PASS — ${checks} FRA16 browser checks`;
    status.dataset.result = "pass";
  } catch (error) {
    status.textContent = `FAIL — ${error.message}`;
    status.dataset.result = "fail";
    throw error;
  }
})();
