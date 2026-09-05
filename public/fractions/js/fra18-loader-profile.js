(function () {
  "use strict";
  const loader = window.RevilySkillLoader;
  const canonical = window.RevilyFra18Canonical;
  if (!loader?.loadSkill || !canonical?.apply || loader.__fra18ProfileApplied) return;
  const originalLoadSkill = loader.loadSkill.bind(loader);
  loader.loadSkill = async function (topicRef, skillId) {
    const loaded = await originalLoadSkill(topicRef, skillId);
    if (String(skillId || "").toUpperCase() !== "FRA-18") return loaded;
    const newlyApplied = loaded.spec?.canonical_lesson?.version !== canonical.CONTENT_VERSION;
    const spec = newlyApplied ? canonical.apply(loaded.spec) : loaded.spec;
    loader.applyFra06To28AudioPolicy?.(spec, "FRA-18");
    if (newlyApplied) {
      const issues = loader.inspectSkill(spec, loaded.entry, await loader.loadManifest(topicRef));
      if (issues.length) throw new Error(`FRA-18 failed its canonical runtime contract: ${issues.join("; ")}`);
    }
    return { ...loaded, spec };
  };
  loader.__fra18ProfileApplied = true;
})();
