(function () {
  "use strict";

  const root = document.getElementById("app");
  const topics = window.RevilyTopics;
  const loader = window.RevilySkillLoader;
  const { LessonEngine } = window.RevilyLessonEngine;
  const { escapeHtml } = window.RevilyVisuals;
  let activeEngine = null;
  let routeToken = 0;

  initialise();

  function initialise() {
    window.addEventListener("hashchange", route);
    if (!location.hash) location.replace("#/topics");
    else route();
  }

  async function route() {
    const token = ++routeToken;
    if (activeEngine) {
      activeEngine.destroy();
      activeEngine = null;
    }

    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    if (!parts.length || (parts.length === 1 && parts[0].toLowerCase() === "topics")) return renderTopics(token);

    const topic = topics.find(parts[0]);
    if (!topic) return renderRouteError("That topic is not registered.");
    if (parts.length === 1) return renderTopic(topic, token);
    if (parts.length === 2 && new RegExp(topic.skillIdPattern, "i").test(parts[1])) {
      return renderLesson(topic, parts[1].toUpperCase(), token);
    }
    return renderRouteError("That lesson address is not recognised.");
  }

  async function renderTopics(token) {
    showLoading("Loading Revily topics…");
    try {
      const topicPackages = await loader.loadAllTopics();
      if (token !== routeToken) return;
      document.title = "Topics | Revily";
      root.setAttribute("aria-busy", "false");
      root.innerHTML = `
        <div class="app-shell home-shell">
          <header class="home-topbar">
            <a class="home-brand" href="#/topics" aria-label="Revily topics home">
              <span class="brand-mark" aria-hidden="true">R</span>
              <span><small>Revily</small><strong>Topics</strong></span>
            </a>
            <span class="prototype-pill">Prototype · all topics unlocked</span>
          </header>
          <main id="main-content" class="home-main" tabindex="-1">
            <section class="home-hero">
              <div>
                <span class="eyebrow">Choose a topic</span>
                <h1>Maths, made visible.</h1>
                <p>Choose a curriculum topic, then open any focused skill to learn, practise and complete its final check.</p>
              </div>
              ${topicsHeroMarkup(topicPackages.map(({ topic }) => topic))}
            </section>
            <section class="topic-section" aria-labelledby="topics-heading">
              <div class="section-heading"><div><span class="eyebrow">${topicPackages.length} curriculum topics</span><h2 id="topics-heading">Pick a topic</h2></div><p>More topics can be registered as their authored packs are approved.</p></div>
              <div class="topic-grid main-topic-grid">
                ${topicPackages.map(({ topic, manifest }, index) => mainTopicCard(topic, manifest, index)).join("")}
              </div>
            </section>
          </main>
          <footer class="home-footer"><span>One shared Revily lesson engine</span><a href="tests/smoke.html">Development checks</a></footer>
        </div>`;
      focusMain();
    } catch (error) {
      renderError(error, "#/topics", "Back to Topics");
    }
  }

  async function renderTopic(topic, token) {
    showLoading(`Loading ${topic.title}…`);
    try {
      const manifest = await loader.loadManifest(topic);
      if (token !== routeToken) return;
      document.title = `${topic.title} | Revily`;
      root.setAttribute("aria-busy", "false");
      root.innerHTML = `
        <div class="app-shell home-shell">
          <header class="home-topbar">
            <a class="home-brand" href="#/topics" aria-label="Back to Revily topics">
              <span class="brand-mark" aria-hidden="true">R</span>
              <span><small>Revily</small><strong>${escapeHtml(topic.title)}</strong></span>
            </a>
            <div class="home-nav-actions"><a class="topic-back" href="#/topics">← Topics</a><span class="prototype-pill">Prototype · all skills unlocked</span></div>
          </header>
          <main id="main-content" class="home-main" tabindex="-1">
            <section class="home-hero">
              <div>
                <span class="eyebrow">Choose your lesson</span>
                <h1>${escapeHtml(topic.heroTitle)}</h1>
                <p>${escapeHtml(topic.heroDescription)}</p>
              </div>
              ${topicHeroMarkup(topic)}
            </section>
            <section class="topic-section" aria-labelledby="topic-heading">
              <div class="section-heading"><div><span class="eyebrow">${manifest.skills.length} independent skills</span><h2 id="topic-heading">Pick a ${escapeHtml(topic.skillNoun)}</h2></div><p>Every skill is available for testing.</p></div>
              <div class="topic-grid">
                ${manifest.skills.map((skill, index) => skillCard(topic, skill, index)).join("")}
              </div>
            </section>
          </main>
          <footer class="home-footer"><span>One lesson engine · ${numberWord(manifest.skills.length)} authored specifications</span><a href="tests/smoke.html">Development checks</a></footer>
        </div>`;
      focusMain();
    } catch (error) {
      renderError(error, "#/topics", "Back to Topics");
    }
  }

  function mainTopicCard(topic, manifest, index) {
    const summary = topicProgress(topic, manifest);
    const statusClass = summary.complete === summary.total && summary.total ? "complete" : summary.started ? "progress" : "ready";
    const status = summary.complete ? `${summary.complete} of ${summary.total} complete` : summary.started ? "In progress" : "Ready";
    return `<a class="topic-card main-topic-card motif-${index % 4}" href="#/${escapeHtml(topic.route)}">
      <span class="topic-number">${String(index + 1).padStart(2, "0")}</span>
      <div><small>${manifest.skills.length} SKILLS</small><h3>${escapeHtml(topic.title)}</h3><p>${escapeHtml(topic.description)}</p></div>
      <span class="topic-status ${statusClass}">${escapeHtml(status)}</span>
      <span class="topic-arrow" aria-hidden="true">→</span>
    </a>`;
  }

  function skillCard(topic, skill, index) {
    const progress = readProgress(topic, skill.id);
    const status = progress?.status === "SECURE" ? "Complete" : progress?.started ? "In progress" : "Ready";
    const statusClass = progress?.status === "SECURE" ? "complete" : progress?.started ? "progress" : "ready";
    return `<a class="topic-card motif-${index % 4}" href="#/${escapeHtml(topic.route)}/${escapeHtml(skill.id)}">
      <span class="topic-number">${String(index + 1).padStart(2, "0")}</span>
      <div><small>${escapeHtml(skill.id)}</small><h3>${escapeHtml(skill.title)}</h3></div>
      <span class="topic-status ${statusClass}">${status}</span>
      <span class="topic-arrow" aria-hidden="true">↗</span>
    </a>`;
  }

  function topicProgress(topic, manifest) {
    return manifest.skills.reduce((summary, skill) => {
      const progress = readProgress(topic, skill.id);
      if (progress?.started) summary.started += 1;
      if (progress?.status === "SECURE") summary.complete += 1;
      return summary;
    }, { total: manifest.skills.length, started: 0, complete: 0 });
  }

  function readProgress(topic, skillId) {
    try {
      return JSON.parse(localStorage.getItem(`revily.${topic.storageNamespace || topic.id}.${skillId}.current.v1`) || "null");
    } catch (_error) {
      return null;
    }
  }

  async function renderLesson(topic, skillId, token) {
    showLoading(`Loading ${skillId}…`);
    try {
      const [{ spec }, dialogue] = await Promise.all([
        loader.loadSkill(topic, skillId),
        loader.loadDialogueProfile(topic),
        loader.loadSchema(topic)
      ]);
      if (token !== routeToken) return;
      document.title = `${spec.identity.title} | Revily ${topic.title}`;
      activeEngine = new LessonEngine(root, spec, dialogue, {
        topic,
        onHome() {
          location.hash = `#/${topic.route}`;
        }
      });
      activeEngine.mount();
    } catch (error) {
      renderError(error, `#/${topic.route}`, `Back to ${topic.title}`);
    }
  }

  function topicHeroMarkup(topic) {
    if (topic.heroVariant === "decimals") {
      return `<div class="hero-model hero-decimal-model" aria-hidden="true"><div class="hero-place-grid"><span>ones</span><span>tenths</span><b>3</b><i>.</i><b>7</b></div><div class="hero-decimal">3.7</div></div>`;
    }
    if (topic.heroVariant === "percentages") {
      return `<div class="hero-model hero-percentage-model" aria-hidden="true"><div class="hero-percentage-track"><span></span><i>35%</i></div><div class="hero-percentage-equation">35/100 × 80</div></div>`;
    }
    return `<div class="hero-model" aria-hidden="true"><div class="hero-fraction"><span>3</span><i></i><span>4</span></div><div class="hero-bars"><span></span><span></span><span></span><span></span></div></div>`;
  }

  function topicsHeroMarkup(registeredTopics) {
    return `<div class="hero-model" aria-hidden="true"><div class="hero-topic-stack">${registeredTopics.map((topic, index) => `<span class="motif-${index % 4}">${escapeHtml(topic.heroSymbol || topic.title.slice(0, 1))}</span>`).join("")}</div></div>`;
  }

  function numberWord(value) {
    const words = { 19: "nineteen", 28: "twenty-eight" };
    return words[value] || String(value);
  }

  function showLoading(message) {
    root.setAttribute("aria-busy", "true");
    root.innerHTML = `<main class="loading-screen" id="main-content" tabindex="-1"><div class="loading-mark" aria-hidden="true">R</div><p>${escapeHtml(message)}</p></main>`;
  }

  function renderRouteError(message) {
    renderError(new Error(message), "#/topics", "Back to Topics");
  }

  function renderError(error, href, label) {
    root.setAttribute("aria-busy", "false");
    root.innerHTML = `<main class="error-screen" id="main-content" tabindex="-1"><span class="eyebrow">Specification could not be rendered</span><h1>That lesson did not load.</h1><p>${escapeHtml(error?.message || error)}</p><a class="primary-button" href="${escapeHtml(href || "#/topics")}">${escapeHtml(label || "Back to Topics")}</a></main>`;
    focusMain();
  }

  function focusMain() {
    window.setTimeout(() => root.querySelector("#main-content")?.focus(), 0);
  }
})();
