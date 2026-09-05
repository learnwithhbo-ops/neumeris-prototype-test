(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  function modelFor(visual, context) {
    return context?.question?.model || visual?.scene?.model || visual?.model || {};
  }

  function fraction(numerator, denominator, className) {
    return `<span class="fra27-fraction ${className || ""}" aria-label="${escapeHtml(numerator)} over ${escapeHtml(denominator)}"><b>${escapeHtml(numerator)}</b><i aria-hidden="true"></i><b>${escapeHtml(denominator)}</b></span>`;
  }

  function stripCells(total, selected, options) {
    const splitAt = Number(options?.splitAt || 0);
    return `<span class="fra27-strip" style="--fra27-parts:${total}">${Array.from({ length: total }, (_, index) => {
      const active = index < selected;
      const classes = [active ? "is-selected" : "", splitAt && index === splitAt ? "is-share-boundary" : ""].filter(Boolean).join(" ");
      return `<i class="${classes}" aria-hidden="true"></i>`;
    }).join("")}</span>`;
  }

  function equation(leftN, leftD, divisor, result, reveal) {
    return `<div class="fra27-equation" aria-hidden="true">
      ${fraction(leftN, leftD, "is-dividend")}
      <strong>÷</strong><b class="fra27-divisor">${escapeHtml(divisor)}</b>
      <strong>=</strong>
      <span class="fra27-result ${reveal ? "is-visible" : ""}">${reveal && result ? fraction(result.numerator, result.denominator, "is-result") : "?"}</span>
    </div>`;
  }

  function hookMarkup(reveal) {
    return `<div class="fra27-scene fra27-hook" data-scene="HOOK">
      <div class="fra27-shelf-pair" aria-hidden="true"><span>Shelf A</span><span>Shelf B</span></div>
      <div class="fra27-light-strip-wrap">
        ${stripCells(3, 3)}
        <span class="fra27-cut-mark mark-one">¼ m</span><span class="fra27-cut-mark mark-two">½ m</span>
        ${reveal ? `<b class="fra27-cut-impossible">Neither mark makes equal lengths</b>` : ""}
      </div>
      <p class="fra27-model-note">A ¾-metre strip · two equal shelves</p>
    </div>`;
  }

  function teachingMarkup(sceneId, reveal) {
    if (sceneId === "HOOK") return hookMarkup(reveal);
    if (sceneId === "T1") {
      return `<div class="fra27-scene" data-scene="T1"><div class="fra27-model-label">Subdivide quarters into eighths</div>${stripCells(8, 6, { splitAt: 3 })}<div class="fra27-share-pair"><span>${stripCells(8, 3)}</span><span>${stripCells(8, 3)}</span></div><p class="fra27-model-note">Each shelf receives ${fraction(3, 8)}</p></div>`;
    }
    if (sceneId === "T2") {
      return `<div class="fra27-scene" data-scene="T2">${equation(3, 4, 2, { numerator: 3, denominator: 8 }, true)}<div class="fra27-method-transform"><span>${fraction(3, 4)} stays fixed</span><b aria-hidden="true">×</b><span class="fra27-reciprocal">${fraction(1, 2)} is one of two shares</span></div></div>`;
    }
    if (sceneId === "T3") {
      return `<div class="fra27-scene" data-scene="T3">${equation(6, 7, 3, { numerator: 2, denominator: 7 }, true)}<div class="fra27-direct-share"><span>6 seventh-sized tiles</span><b aria-hidden="true">→</b><span>3 equal groups</span><b aria-hidden="true">→</b><span>2 tiles in each</span></div><p class="fra27-model-note">Direct share works because 6 ÷ 3 is exact.</p></div>`;
    }
    if (sceneId === "T4") {
      return `<div class="fra27-scene" data-scene="T4">${equation(7, 5, 2, { numerator: 7, denominator: 10 }, true)}<div class="fra27-method-transform"><span>${fraction(7, 5)} stays fixed</span><b aria-hidden="true">×</b><span class="fra27-reciprocal">${fraction(1, 2)}</span></div><p class="fra27-model-note">The same method works when the dividend is greater than one.</p></div>`;
    }
    return `<div class="fra27-scene fra27-handoff" data-scene="HANDOFF"><div class="fra27-method-card"><span>Equal sharing</span><b>same meaning</b><span>Multiply by ${fraction(1, "n")}</span></div><div class="fra27-rule-card">${fraction("a", "b")} ÷ n = ${fraction("a", "b")} × ${fraction(1, "n")}</div></div>`;
  }

  function shareMarkup(model, reveal) {
    const response = model.question?.responseSpec || model.responseSpec || {};
    const visual = model.visual || {};
    const totalTiles = Number(response.totalTiles || visual.tileCount || visual.pieceCount || 6);
    const trayCount = Number(response.trayCount || visual.trayCount || visual.groupCount || visual.boxCount || 3);
    const expected = response.expectedTrayCounts || Array.from({ length: trayCount }, () => totalTiles / trayCount);
    const denominator = response.fixedDenominator || model.problem?.dividend.denominator || 7;
    const interactive = response.kind === "drag_share_then_fraction" && !reveal;
    const fractionTile = () => `<span class="fra27-share-tile" aria-hidden="true"><span>1</span><i></i><span>${escapeHtml(denominator)}</span></span>`;
    const tiles = interactive
      ? Array.from({ length: totalTiles }, (_, index) => `<button type="button" class="fra27-share-tile" data-fra27-tile="${index}" data-tray="-1" aria-pressed="false" aria-label="Seventh-sized tile ${index + 1}, not placed"><span aria-hidden="true">1</span><i aria-hidden="true"></i><span aria-hidden="true">${escapeHtml(denominator)}</span></button>`).join("")
      : (reveal ? "" : Array.from({ length: totalTiles }, fractionTile).join(""));
    const trays = Array.from({ length: trayCount }, (_, index) => {
      const placed = reveal ? Array.from({ length: Number(expected[index] || 0) }, fractionTile).join("") : "";
      return `<div class="fra27-share-tray"${interactive ? ` data-fra27-tray="${index}"` : ""}><strong>Tray ${index + 1}</strong><div class="fra27-tray-drop" aria-hidden="true">${placed}</div>${interactive ? `<button type="button" data-fra27-move="${index}">Move selected tile here</button>` : ""}</div>`;
    }).join("");
    return `<div class="fra27-share-workspace" data-reveal="${reveal}"><div class="fra27-tile-bank"><strong>${reveal ? "Tiles shared" : "Tiles to share"}</strong><div>${tiles}</div></div><div class="fra27-trays">${trays}</div>${interactive ? '<p class="fra27-share-status" aria-live="polite">No tile selected.</p>' : ""}</div>`;
  }

  function contextMarkup(model, reveal) {
    const problem = model.problem || {};
    const visual = model.visual || {};
    const count = Number(visual.destinationCount || visual.boxCount || visual.groupCount || problem.integerDivisor || 3);
    const sourceLabel = visual.sourceAmountLabel || (problem.dividend ? fractionLabel(problem.dividend) : "fractional amount");
    return `<div class="fra27-context-card"><div class="fra27-source-container"><span class="fra27-bottle" aria-hidden="true"></span><strong>${escapeHtml(sourceLabel)}</strong></div><b aria-hidden="true">→</b><div class="fra27-destinations">${Array.from({ length: count }, (_, index) => `<span class="fra27-jar ${reveal ? "is-filled" : ""}"><i aria-hidden="true"></i><small>${index + 1}</small></span>`).join("")}</div></div>`;
  }

  function repairMarkup(model, reveal) {
    const sceneId = model.sceneId || model.questionId || "";
    if (sceneId.includes("R-DEN")) return `<div class="fra27-repair-model"><div>${stripCells(8, 3)}</div><b aria-hidden="true">→ split every eighth →</b><div>${stripCells(16, 3)}</div><p>The named pieces become sixteenths; the three selected pieces stay one equal share.</p></div>`;
    if (sceneId.includes("R-NUM")) return `<div class="fra27-repair-model">${equation(5, 6, 4, { numerator: 5, denominator: 24 }, true)}<p>When five cannot divide exactly by four, keep the fraction fixed and multiply by one fourth.</p></div>`;
    if (sceneId.includes("R-MULT")) return `<div class="fra27-repair-model fra27-contrast"><div class="is-wrong"><b>Three copies</b>${stripCells(5, 4)}${stripCells(5, 4)}${stripCells(5, 4)}</div><div class="is-right"><b>One of three shares</b>${stripCells(15, 4)}</div></div>`;
    if (sceneId.includes("R-FLIP")) return `<div class="fra27-repair-model"><div class="fra27-method-transform"><span class="is-locked">${fraction(5, 8)} locked</span><b>÷ 2</b><span>${fraction(1, 2)} rotates from the divisor</span></div>${equation(5, 8, 2, { numerator: 5, denominator: 16 }, true)}</div>`;
    if (sceneId.includes("R-SUB")) return `<div class="fra27-repair-model fra27-contrast"><div class="is-wrong"><b>Taking away</b><span>does not make equal shares</span></div><div class="is-right"><b>Two equal shares</b>${stripCells(8, 3)}${stripCells(8, 3)}</div></div>`;
    return `<div class="fra27-repair-model">${equation(problemNumerator(model), problemDenominator(model), model.problem?.integerDivisor || 2, expectedResult(model), reveal)}</div>`;
  }

  function fractionLabel(value) {
    return value ? `${value.numerator}/${value.denominator}` : "";
  }

  function problemNumerator(model) { return Number(model.problem?.dividend?.numerator || 1); }
  function problemDenominator(model) { return Number(model.problem?.dividend?.denominator || 1); }
  function expectedResult(model) {
    const problem = model.problem;
    return problem && window.RevilyFra27V1?.divideFractionByInteger
      ? window.RevilyFra27V1.divideFractionByInteger(problem.dividend, problem.integerDivisor)
      : null;
  }

  function questionMarkup(model, reveal) {
    const visual = model.visual || {};
    const kind = visual.kind || "";
    if (["tile_share_trays", "direct_share_groups", "tile_share_boxes", "recovery_visual"].includes(kind)) return shareMarkup(model, reveal);
    if (kind === "container_share_context" || /context/.test(kind)) return `${contextMarkup(model, reveal)}${equation(problemNumerator(model), problemDenominator(model), model.problem?.integerDivisor, expectedResult(model), reveal)}`;
    if ((model.sceneId || "").startsWith("R-") && !(model.sceneId || "").endsWith("-FRESH")) return repairMarkup(model, reveal);
    if (["locked_dividend_reciprocal_builder"].includes(kind)) {
      return `<div class="fra27-symbolic-card">${equation(problemNumerator(model), problemDenominator(model), model.problem?.integerDivisor, expectedResult(model), reveal)}<div class="fra27-method-transform"><span class="is-locked">Dividend locked</span><b aria-hidden="true">→</b><span>Choose the integer reciprocal</span></div></div>`;
    }
    if (/reason|method|error/.test(kind)) {
      return `<div class="fra27-symbolic-card">${equation(problemNumerator(model), problemDenominator(model), model.problem?.integerDivisor, expectedResult(model), reveal)}<p>Choose the line that makes one equal share.</p></div>`;
    }
    return `<div class="fra27-symbolic-card">${equation(problemNumerator(model), problemDenominator(model), model.problem?.integerDivisor, expectedResult(model), reveal)}</div>`;
  }

  function renderMarkup(visual, context) {
    const model = modelFor(visual, context);
    const reveal = ["correct", "worked"].includes(context?.feedback);
    const sceneId = model.sceneId || "";
    const teaching = ["HOOK", "T1", "T2", "T3", "T4", "HANDOFF"].includes(sceneId) && !model.problem;
    const interactiveShare = !reveal && (model.question?.responseSpec || model.responseSpec)?.kind === "drag_share_then_fraction";
    return `<div class="fra27-visual" data-scene="${escapeHtml(sceneId)}" data-reveal="${reveal}"${interactiveShare ? "" : ' aria-hidden="true"'}>${teaching ? teachingMarkup(sceneId, reveal) : questionMarkup(model, reveal)}</div>`;
  }

  function updateShareUi(container, selectedTile) {
    const tiles = [...container.querySelectorAll("[data-fra27-tile]")];
    const denominator = tiles[0]?.querySelector("span:last-child")?.textContent || "";
    container.querySelectorAll("[data-fra27-tray]").forEach((tray) => {
      const index = Number(tray.dataset.fra27Tray);
      const count = tiles.filter((tile) => Number(tile.dataset.tray) === index).length;
      const drop = tray.querySelector(".fra27-tray-drop");
      if (drop) drop.innerHTML = Array.from({ length: count }, () => `<span aria-hidden="true"><b>1</b><i></i><b>${escapeHtml(denominator)}</b></span>`).join("");
      tray.setAttribute("aria-label", `Tray ${index + 1}, ${count} tiles`);
    });
    tiles.forEach((tile) => {
      const active = tile === selectedTile;
      const trayIndex = Number(tile.dataset.tray);
      tile.setAttribute("aria-pressed", String(active));
      tile.classList.toggle("is-active", active);
      tile.setAttribute("aria-label", `Seventh-sized tile ${Number(tile.dataset.fra27Tile) + 1}, ${trayIndex < 0 ? "not placed" : `in tray ${trayIndex + 1}`}`);
    });
    const status = container.querySelector(".fra27-share-status");
    if (status) status.textContent = selectedTile ? `Tile ${Number(selectedTile.dataset.fra27Tile) + 1} selected.` : "Select a tile, then choose a tray.";
  }

  function shareCounts(container) {
    const trays = [...container.querySelectorAll("[data-fra27-tray]")];
    const tiles = [...container.querySelectorAll("[data-fra27-tile]")];
    return trays.map((tray) => tiles.filter((tile) => tile.dataset.tray === tray.dataset.fra27Tray).length);
  }

  function restoreShare(container, counts) {
    const tiles = [...container.querySelectorAll("[data-fra27-tile]")];
    let cursor = 0;
    tiles.forEach((tile) => { tile.dataset.tray = "-1"; });
    (counts || []).forEach((count, trayIndex) => {
      for (let index = 0; index < Number(count || 0) && cursor < tiles.length; index += 1) {
        tiles[cursor].dataset.tray = String(trayIndex);
        cursor += 1;
      }
    });
    updateShareUi(container, null);
  }

  function bind(container) {
    const workspace = container.querySelector(".fra27-share-workspace");
    if (!workspace || workspace.dataset.reveal === "true") return;
    let selected = null;
    workspace.querySelectorAll("[data-fra27-tile]").forEach((tile) => {
      tile.addEventListener("click", () => {
        selected = selected === tile ? null : tile;
        updateShareUi(workspace, selected);
      });
    });
    workspace.querySelectorAll("[data-fra27-move]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!selected) {
          const status = workspace.querySelector(".fra27-share-status");
          if (status) status.textContent = "Select a tile first.";
          return;
        }
        selected.dataset.tray = button.dataset.fra27Move;
        selected = null;
        updateShareUi(workspace, selected);
        container.closest(".lesson-player")?.querySelector("#answer-form input")?.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
    updateShareUi(workspace, selected);
  }

  function accessibleDescription(visual, context) {
    const model = modelFor(visual, context);
    return model.accessibleDescription || "A fraction is divided into equal shares without revealing the assessed result.";
  }

  window.RevilyFra27Visuals = { accessibleDescription, bind, renderMarkup, restoreShare, shareCounts };
})();
