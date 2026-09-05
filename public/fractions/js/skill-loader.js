(function () {
  "use strict";

  const registry = window.RevilyTopics;
  const skillCache = new Map();
  const manifestCache = new Map();
  const dialogueCache = new Map();
  const schemaCache = new Map();

  function resolveTopic(topicRef) {
    const topic = typeof topicRef === "object" && topicRef?.id ? topicRef : registry?.find(topicRef || "fractions");
    if (!topic) throw new Error(`Unknown Revily topic: ${topicRef || "(missing)"}`);
    return topic;
  }

  function packUrl(topicRef, relativePath) {
    const topic = resolveTopic(topicRef);
    return new URL(topic.packRoot + relativePath, document.baseURI).toString();
  }

  async function fetchText(topic, relativePath) {
    const response = await fetch(packUrl(topic, relativePath), { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${relativePath} (${response.status}).`);
    return response.text();
  }

  async function fetchYaml(topic, relativePath) {
    if (!window.jsyaml) throw new Error("The YAML interpreter did not load.");
    const source = await fetchText(topic, relativePath);
    try {
      return window.jsyaml.load(source);
    } catch (error) {
      throw new Error(`Could not parse ${relativePath}: ${error.message}`);
    }
  }

  function loadManifest(topicRef) {
    const topic = resolveTopic(topicRef);
    if (!manifestCache.has(topic.id)) {
      manifestCache.set(topic.id, fetchYaml(topic, topic.manifestPath).then((manifest) => {
        const issues = inspectManifest(manifest, topic);
        if (issues.length) throw new Error(`${topic.title} manifest failed its runtime contract: ${issues.join("; ")}`);
        return manifest;
      }));
    }
    return manifestCache.get(topic.id);
  }

  function inspectManifest(manifest, topicRef) {
    const topic = resolveTopic(topicRef);
    const issues = [];
    if (!manifest || !Array.isArray(manifest.skills)) return ["skills are missing"];
    if (topic.expectedSkillCount && manifest.skills.length !== topic.expectedSkillCount) {
      issues.push(`expected ${topic.expectedSkillCount} skills, found ${manifest.skills.length}`);
    }
    const ids = manifest.skills.map((skill) => skill.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) issues.push(`${ids.length - uniqueIds.size} duplicate skill id(s)`);
    const pattern = new RegExp(topic.skillIdPattern, "i");
    const invalidIds = ids.filter((id) => !pattern.test(String(id || "")));
    if (invalidIds.length) issues.push(`invalid skill ids: ${invalidIds.join(", ")}`);
    const expected = Array.from({ length: manifest.skills.length }, (_, index) => `${topic.skillPrefix}-${String(index + 1).padStart(2, "0")}`);
    if (expected.some((id, index) => ids[index] !== id)) issues.push(`skills are not in ${topic.skillPrefix}-01 sequence order`);
    manifest.skills.forEach((skill) => {
      if (!skill.title) issues.push(`${skill.id || "unknown skill"} has no title`);
      if (!skill.file) issues.push(`${skill.id || "unknown skill"} has no specification file`);
    });
    return issues;
  }

  function loadDialogueProfile(topicRef) {
    const topic = resolveTopic(topicRef);
    if (!dialogueCache.has(topic.id)) dialogueCache.set(topic.id, fetchYaml(topic, topic.dialoguePath));
    return dialogueCache.get(topic.id);
  }

  function loadSchema(topicRef) {
    const topic = resolveTopic(topicRef);
    if (!schemaCache.has(topic.id)) {
      schemaCache.set(topic.id, fetch(packUrl(topic, topic.schemaPath), { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error(`Could not load the Revily schema (${response.status}).`);
        return response.json();
      }));
    }
    return schemaCache.get(topic.id);
  }

  function applyFra06To28AudioPolicy(spec, skillId) {
    const match = /^FRA-(\d{2})$/.exec(String(skillId || spec?.identity?.id || "").toUpperCase());
    const number = Number(match?.[1]);
    if (!Number.isInteger(number) || number < 6 || number > 28) return spec;
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narration_playback: Object.assign({}, spec.voice_and_script?.narration_playback, {
        mode: "authored_audio_then_browser_speech",
        require_ryan_voice: true,
        voice_id: "en-GB-RyanNeural",
        voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)"
      })
    });
    return spec;
  }

  function applyDecimalAudioPolicy(spec, skillId) {
    const id = String(skillId || spec?.identity?.id || "").toUpperCase();
    if (!/^DEC-(?:0[1-9]|1\d)$/.test(id)) return spec;
    spec.voice_and_script = Object.assign({}, spec.voice_and_script, {
      narration_playback: Object.assign({}, spec.voice_and_script?.narration_playback, {
        mode: "authored_audio_then_browser_speech",
        require_ryan_voice: true,
        voice_id: "en-GB-RyanNeural",
        voice_name: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
        timing_source: "provider_word_boundaries"
      })
    });
    return spec;
  }

  async function loadSkill(topicRef, skillId) {
    const topic = resolveTopic(topicRef);
    const normalisedId = String(skillId || "").toUpperCase();
    const cacheKey = `${topic.id}:${normalisedId}`;
    if (skillCache.has(cacheKey)) return skillCache.get(cacheKey);
    const promise = loadManifest(topic).then(async (manifest) => {
      const entry = manifest.skills.find((skill) => skill.id === normalisedId);
      if (!entry) throw new Error(`Unknown ${topic.title} skill: ${normalisedId}`);
      let spec = await fetchYaml(topic, entry.file);
      if (normalisedId === "FRA-01" && window.RevilyFra01CanonicalV2?.apply) {
        spec = window.RevilyFra01CanonicalV2.apply(spec);
      } else if (normalisedId === "FRA-01" && window.RevilyFra01Canonical?.apply) {
        spec = window.RevilyFra01Canonical.apply(spec);
      } else if (normalisedId === "FRA-02" && window.RevilyFra02Canonical?.apply) {
        spec = window.RevilyFra02Canonical.apply(spec);
      } else if (normalisedId === "FRA-03" && window.RevilyFra03Canonical?.apply) {
        spec = window.RevilyFra03Canonical.apply(spec);
      } else if (normalisedId === "FRA-04" && window.RevilyFra04Canonical?.apply) {
        spec = window.RevilyFra04Canonical.apply(spec);
      } else if (normalisedId === "FRA-05" && window.RevilyFra05Canonical?.apply) {
        spec = window.RevilyFra05Canonical.apply(spec);
      } else if (normalisedId === "FRA-09" && window.RevilyFra09Adapter?.apply) {
        spec = window.RevilyFra09Adapter.apply(spec);
      } else if (normalisedId === "FRA-11" && window.RevilyFra11Canonical?.apply) {
        spec = window.RevilyFra11Canonical.apply(spec);
      } else if (normalisedId === "FRA-06" && window.RevilyFra06Canonical?.apply) {
        spec = window.RevilyFra06Canonical.apply(spec);
      } else if (normalisedId === "FRA-07" && window.RevilyFra07Canonical?.apply) {
        spec = window.RevilyFra07Canonical.apply(spec);
      } else if (normalisedId === "FRA-08" && window.RevilyFra08Canonical?.apply) {
        spec = window.RevilyFra08Canonical.apply(spec);
      } else if (normalisedId === "FRA-10" && window.RevilyFra10Adapter?.apply) {
        spec = window.RevilyFra10Adapter.apply(spec);
      } else if (normalisedId === "FRA-13" && window.RevilyFra13Canonical?.apply) {
        spec = window.RevilyFra13Canonical.apply(spec);
      } else if (normalisedId === "FRA-14" && window.RevilyFra14Canonical?.apply) {
        spec = window.RevilyFra14Canonical.apply(spec);
      } else if (normalisedId === "FRA-15" && window.RevilyFra15Canonical?.apply) {
        spec = window.RevilyFra15Canonical.apply(spec);
      } else if (normalisedId === "FRA-12" && window.RevilyFra12Canonical?.apply) {
        spec = window.RevilyFra12Canonical.apply(spec);
      } else if (normalisedId === "FRA-16" && window.RevilyFra16Canonical?.apply) {
        spec = window.RevilyFra16Canonical.apply(spec);
      } else if (normalisedId === "FRA-17" && window.RevilyFra17Canonical?.apply) {
        spec = window.RevilyFra17Canonical.apply(spec);
      } else if (normalisedId === "FRA-19" && window.RevilyFra19Canonical?.apply) {
        spec = window.RevilyFra19Canonical.apply(spec);
      } else if (normalisedId === "FRA-20" && window.RevilyFra20Canonical?.apply) {
        spec = window.RevilyFra20Canonical.apply(spec);
      } else if (normalisedId === "FRA-21" && window.RevilyFra21Canonical?.apply) {
        spec = window.RevilyFra21Canonical.apply(spec);
      } else if (normalisedId === "FRA-22" && window.RevilyFra22Canonical?.apply) {
        spec = window.RevilyFra22Canonical.apply(spec);
      } else if (normalisedId === "FRA-23" && window.RevilyFra23Canonical?.apply) {
        spec = window.RevilyFra23Canonical.apply(spec);
      } else if (normalisedId === "FRA-24" && window.RevilyFra24Canonical?.apply) {
        spec = window.RevilyFra24Canonical.apply(spec);
      } else if (normalisedId === "FRA-26" && window.RevilyFra26Canonical?.apply) {
        spec = window.RevilyFra26Canonical.apply(spec);
      } else if (normalisedId === "FRA-28" && window.RevilyFra28Canonical?.apply) {
        spec = window.RevilyFra28Canonical.apply(spec);
      }
      spec = applyFra06To28AudioPolicy(spec, normalisedId);
      spec = applyDecimalAudioPolicy(spec, normalisedId);
      const issues = inspectSkill(spec, entry, manifest);
      if (issues.length) throw new Error(`${normalisedId} failed its runtime contract: ${issues.join("; ")}`);
      return { topic, entry, spec };
    });
    skillCache.set(cacheKey, promise);
    return promise;
  }

  function inspectSkill(spec, manifestEntry, manifest) {
    const issues = [];
    if (!spec || typeof spec !== "object") return ["the YAML root is not an object"];
    if (spec.schema_version !== "1.2") issues.push("schema_version is not 1.2");
    if (!spec.identity || spec.identity.id !== manifestEntry.id) issues.push("identity.id does not match the manifest");
    if (!spec.identity || spec.identity.title !== manifestEntry.title) issues.push("identity.title does not match the manifest");
    if (!spec.lesson || !Array.isArray(spec.lesson.teaching_steps)) issues.push("lesson.teaching_steps is missing");
    const canonicalLesson = spec.canonical_lesson?.reference_for_future_lessons === true;
    const sourceAligned = spec.experience_contract?.refinement_profile === "source_aligned_v1";
    if (!canonicalLesson && !sourceAligned && spec.lesson?.teaching_steps?.length !== 10) issues.push(`expected 10 teaching scenes, found ${spec.lesson?.teaching_steps?.length || 0}`);
    if (sourceAligned && !spec.lesson?.teaching_steps?.length) issues.push("source-aligned lessons require authored teaching scenes");
    if (canonicalLesson && spec.lesson?.teaching_steps?.length < 4) issues.push("canonical lessons need at least four purposeful teaching scenes");
    if (!Array.isArray(spec.question_bank) || !spec.question_bank.length) issues.push("question_bank is missing");
    if (!spec.completion?.secure || !spec.completion?.needs_work) issues.push("completion branches are missing");

    const questionIds = new Set((spec.question_bank || []).map((question) => question.id));
    const duplicateQuestions = (spec.question_bank || []).length - questionIds.size;
    if (duplicateQuestions) issues.push(`${duplicateQuestions} duplicate question id(s)`);

    const questionRefs = [];
    const stepRefs = [];
    const teachingIds = (spec.lesson?.teaching_steps || []).map((step) => step.id);
    const transferIds = Object.keys(spec.lesson?.transfer_steps || {});
    const shortId = (id) => String(id || "").replace(`${spec.identity?.id}-`, "");
    const practiceIds = spec.lesson?.practice?.question_order || [];
    const exitIds = spec.lesson?.exit?.primary_question_refs || [];
    const stepIds = new Set([...teachingIds, ...transferIds, ...practiceIds.map(shortId), ...exitIds.map(shortId)]);
    if (stepIds.size !== teachingIds.length + transferIds.length + practiceIds.length + exitIds.length) issues.push("duplicate lesson step id(s)");

    (spec.diagnostic?.question_refs || []).forEach((ref) => questionRefs.push({ ref, at: "diagnostic" }));
    (spec.lesson?.teaching_steps || []).forEach((step) => {
      if (step.learner_interaction?.question_ref) questionRefs.push({ ref: step.learner_interaction.question_ref, at: step.id });
      if (step.next_step) stepRefs.push({ ref: step.next_step, at: step.id });
    });
    Object.entries(spec.lesson?.transfer_steps || {}).forEach(([id, step]) => {
      if (step.question_ref) questionRefs.push({ ref: step.question_ref, at: id });
      if (step.recovery_ref) questionRefs.push({ ref: step.recovery_ref, at: `${id} recovery` });
      if (step.correct_next) stepRefs.push({ ref: step.correct_next, at: id });
    });
    practiceIds.forEach((ref) => questionRefs.push({ ref, at: "practice" }));
    exitIds.forEach((ref) => questionRefs.push({ ref, at: "exit" }));
    (spec.lesson?.exit?.confirmation_question_refs || []).forEach((ref) => questionRefs.push({ ref, at: "confirmation" }));
    (spec.question_bank || []).forEach((question) => {
      if (question.recovery_item_ref) questionRefs.push({ ref: question.recovery_item_ref, at: `${question.id} recovery` });
    });

    const missingQuestions = questionRefs.filter(({ ref }) => !questionIds.has(ref));
    if (missingQuestions.length) issues.push(`missing question references: ${missingQuestions.map(({ ref, at }) => `${ref} (${at})`).join(", ")}`);
    const missingSteps = stepRefs.filter(({ ref }) => !stepIds.has(shortId(ref)) && !stepIds.has(ref));
    if (missingSteps.length) issues.push(`missing lesson-step references: ${missingSteps.map(({ ref, at }) => `${ref} (${at})`).join(", ")}`);

    const manifestPrerequisites = manifestEntry.prerequisites || [];
    const specPrerequisites = spec.dependencies?.required_skill_refs || [];
    if (normaliseList(manifestPrerequisites) !== normaliseList(specPrerequisites)) issues.push("prerequisites do not match the manifest");
    if (manifest?.skills) {
      const internalIds = new Set(manifest.skills.map((skill) => skill.id));
      const missingInternal = specPrerequisites.filter((ref) => ref.startsWith(`${spec.identity.id.split("-")[0]}-`) && !internalIds.has(ref));
      if (missingInternal.length) issues.push(`missing internal prerequisites: ${missingInternal.join(", ")}`);
    }
    return issues;
  }

  function normaliseList(values) {
    return JSON.stringify([...(values || [])].map(String).sort());
  }

  async function loadAllSkills(topicRef) {
    const topic = resolveTopic(topicRef);
    const manifest = await loadManifest(topic);
    return Promise.all(manifest.skills.map((entry) => loadSkill(topic, entry.id)));
  }

  async function loadAllTopics() {
    return Promise.all(registry.all.map(async (topic) => ({ topic, manifest: await loadManifest(topic) })));
  }

  window.RevilySkillLoader = {
    applyDecimalAudioPolicy,
    applyFra06To28AudioPolicy,
    inspectManifest,
    inspectSkill,
    loadAllSkills,
    loadAllTopics,
    loadDialogueProfile,
    loadManifest,
    loadSchema,
    loadSkill,
    packUrl,
    resolveTopic
  };
})();
