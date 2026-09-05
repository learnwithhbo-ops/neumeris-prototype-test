(function () {
  "use strict";

  const adapter = window.RevilyFra27Canonical;
  const visuals = window.RevilyFra27Visuals;
  if (!adapter || !visuals) throw new Error("FRA-27 runtime bridge loaded before its approved adapter and visuals.");

  const loader = window.RevilySkillLoader;
  const originalLoadSkill = loader.loadSkill.bind(loader);
  loader.loadSkill = async function loadSkillWithFra27(topic, skillId) {
    const loaded = await originalLoadSkill(topic, skillId);
    if (String(skillId || "").toUpperCase() !== "FRA-27") return loaded;
    if (loaded.spec?.canonical_lesson?.version !== adapter.CONTENT_VERSION) adapter.apply(loaded.spec);
    loader.applyFra06To28AudioPolicy?.(loaded.spec, "FRA-27");
    return loaded;
  };

  const originalLoadAllSkills = loader.loadAllSkills.bind(loader);
  loader.loadAllSkills = async function loadAllSkillsWithFra27(topic) {
    const loaded = await originalLoadAllSkills(topic);
    loaded.forEach((entry) => {
      if (entry.spec?.identity?.id !== "FRA-27") return;
      if (entry.spec?.canonical_lesson?.version !== adapter.CONTENT_VERSION) adapter.apply(entry.spec);
      loader.applyFra06To28AudioPolicy?.(entry.spec, "FRA-27");
    });
    return loaded;
  };

  const validators = window.RevilyValidators;
  const originalValidate = validators.validate.bind(validators);
  validators.validate = function validateWithFra27(question, response) {
    if (question?.id?.startsWith("FRA-27-") || question?.model?.context === "fra27") {
      return adapter.evaluateResponse(question, response).correct === true;
    }
    return originalValidate(question, response);
  };

  const visualApi = window.RevilyVisuals;
  const originalRender = visualApi.render.bind(visualApi);
  visualApi.render = function renderWithFra27(container, visual, context) {
    if (visual?.primitive !== "fra27_context") return originalRender(container, visual, context);
    container.innerHTML = `<div class="visual-centre fra27-context-visual"><div class="fra27-visual-host">${visuals.renderMarkup(visual, context)}</div></div>`;
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", visuals.accessibleDescription(visual, context));
    visuals.bind(container, visual, context);
  };
})();
