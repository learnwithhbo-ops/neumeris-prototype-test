(function () {
  "use strict";

  if (!window.RevilyFra25Canonical) throw new Error("FRA25 canonical adapter must load before its bootstrap.");

  const installLoader = (loader) => {
    if (!loader?.loadSkill || loader.loadSkill.__fra25Wrapped) return;
    const originalLoadSkill = loader.loadSkill.bind(loader);
    const wrappedLoadSkill = async function (topicRef, skillId) {
      const loaded = await originalLoadSkill(topicRef, skillId);
      const spec = loaded?.spec || loaded;
      const id = String(spec?.identity?.id || loaded?.entry?.id || skillId || "").toUpperCase();
      if (id === "FRA-25" && spec?.canonical_lesson?.version !== "FRA25-HANDOFF-V1") {
        const adapted = window.RevilyFra25Canonical.apply(spec);
        return loaded?.spec ? Object.assign({}, loaded, { spec: adapted }) : adapted;
      }
      return loaded;
    };
    wrappedLoadSkill.__fra25Wrapped = true;
    loader.loadSkill = wrappedLoadSkill;
  };

  const installVisuals = (visuals) => {
    if (!visuals?.render || visuals.render.__fra25Wrapped) return;
    const originalRender = visuals.render.bind(visuals);
    const wrappedRender = function (container, visual, context) {
      if (visual?.primitive !== "fra25_context") return originalRender(container, visual, context);
      const feedback = context?.feedback || "initial";
      const action = visual?.action || "focus";
      const model = context?.question?.model || visual?.scene?.model || visual?.model || {};
      container.className = `math-canvas action-${action} feedback-${feedback}`;
      container.setAttribute("role", "group");
      container.setAttribute("aria-label", window.RevilyFra25Visuals.accessibleDescription(model, context));
      container.innerHTML = `<div class="visual-stage" data-primitive="fra25_context"><div class="visual-centre fra25-context-visual">${window.RevilyFra25Visuals.renderMarkup(visual, context)}</div></div>`;
      window.RevilyFra25Visuals.bind(container, visual, context);
    };
    wrappedRender.__fra25Wrapped = true;
    visuals.render = wrappedRender;
  };

  const hookAssignment = (property, guard, install) => {
    if (window[property]) {
      install(window[property]);
      return;
    }
    if (window[guard]) return;
    window[guard] = true;
    let assigned;
    Object.defineProperty(window, property, {
      configurable: true,
      get: () => assigned,
      set: (value) => {
        assigned = value;
        install(value);
      }
    });
  };

  hookAssignment("RevilySkillLoader", "__revilyFra25LoaderHooked", installLoader);
  hookAssignment("RevilyVisuals", "__revilyFra25VisualsHooked", installVisuals);
})();
