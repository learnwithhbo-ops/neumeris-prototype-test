(function () {
  "use strict";
  const loader = window.RevilySkillLoader;
  const canonical = window.RevilyFra19Canonical;
  if (!loader?.loadSkill || !canonical?.apply || loader.__fra19ProfileApplied) return;
  const originalLoadSkill = loader.loadSkill.bind(loader);
  loader.loadSkill = async function (topicRef, skillId) {
    const loaded = await originalLoadSkill(topicRef, skillId);
    if (String(skillId || "").toUpperCase() !== "FRA-19" || loaded.spec?.canonical_lesson?.version === canonical.CONTENT_VERSION) return loaded;
    const spec = canonical.apply(loaded.spec);
    const issues = loader.inspectSkill(spec, loaded.entry, await loader.loadManifest(topicRef));
    if (issues.length) throw new Error(`FRA-19 failed its canonical runtime contract: ${issues.join("; ")}`);
    return { ...loaded, spec };
  };
  loader.__fra19ProfileApplied = true;
})();
