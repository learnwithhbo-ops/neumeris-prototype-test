# Revily multi-topic prototype

This browser application exposes complete Fractions and Decimal Calculation curriculum packs through one shared Revily interface and lesson engine.

## Routes

- `#/topics` — top-level topic library.
- `#/fractions` — all 28 Fractions skills.
- `#/decimals` — all 19 Decimal Calculation skills.
- `#/fractions/FRA-01` and `#/decimals/DEC-01` — individual specification-driven lessons.

Topic metadata lives in `js/topics.js`. Adding a later topic mainly requires adding its authored pack and registering its manifest, shared schema/dialogue files, route, skill ID convention and persistence namespace there.

## Source of truth

The browser loads the source YAML files directly from:

- `FRA 01 to 28/revily_fractions_v1_2`
- `CUR-N03_Decimal_Calculation_19_Atomic_Skills_v1.2`

Titles, prerequisites, lesson order, authored Ryan lines, prompts, answers, hints, worked explanations, recovery references, exit rules and completion copy remain in those specifications. Shared code supplies routing, state, exact validation, feedback flow, narration playback and reusable mathematical visuals.

Fractions and Decimal Calculation both use bundled Microsoft Ryan Neural audio with provider word-boundary timing. Every spoken line remains exact authored copy from the active lesson specification or approved Ryan dialogue profile; browser speech is retained only as a fallback.

## Run

From PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\fractions\serve.ps1
```

Then open <http://127.0.0.1:43128/fractions/>.

## Automated all-topic check

Open <http://127.0.0.1:43128/fractions/tests/smoke.html>. The runner loads all 47 specifications, verifies manifest/spec/prerequisite/question/recovery/lesson-step references, checks every canonical answer and one deliberately wrong answer, renders the main and support visual states, and exercises correct, hint, worked-recovery, exit-confirmation, secure and needs-work paths for every skill.

## Shared components

- `Topics`: data-driven topic registry and route metadata.
- `SkillLoader`: topic-aware manifest, schema, Ryan profile and skill loading with reference validation.
- `LessonModel`: shared teaching, transfer, practice and exit graph plus declared-primitive selection.
- `LessonEngine`: narration, feedback, recovery, exit scoring, topic-safe persistence, progress and completion.
- `Validators`: exact integer, rational and decimal validation across authored response types.
- `VisualPrimitives`: reusable fraction and decimal place-value, number-line, column, context, scaling, grouping, division and sign/magnitude views.

Diagnostics remain authored and reference-validated in the YAML but are intentionally not inserted into the learner route. Prerequisite locking, cross-topic diagnostic routing and the wider mastery graph remain outside this task's scope.
