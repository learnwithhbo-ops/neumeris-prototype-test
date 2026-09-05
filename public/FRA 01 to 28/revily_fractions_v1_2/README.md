# Revily V2 Fractions Atomic Skill Pack v1.2

This package contains the complete atomic Fractions strand **FRA-01 through FRA-28** using the Revily Skill Specification v1.2 contract.

## Source-of-truth rule
Each skill YAML is an implementation specification, not a prompt for Codex to design a lesson. Mathematical content, Ryan's skill-specific speech, questions, canonical answers, hints, worked explanations, teaching scenes, animation meaning, branching and mastery behaviour are authored in the YAML. The engine may select generic success reactions only from `shared/RYAN_DIALOGUE_PROFILE_v1.yaml` and may not generate dialogue.

## Naming reconciliation
The earlier temporary V2 prototype called Equivalent Fractions `NUM-FRA-01`. The recovered Revily curriculum registry preserves the established Fractions IDs, where **Equivalent Fractions is FRA-08**, **same-denominator addition is FRA-17**, and **different-denominator addition is FRA-19**. This pack uses the registry IDs throughout.

## Contents
- `skills/`: 28 complete atomic skill YAML files.
- `shared/REVILY_MASTER_SKILL_TEMPLATE_v1.2.yaml`: blank contract for future skills.
- `shared/revily-skill-spec-v1.2.schema.json`: machine validation schema.
- `shared/RYAN_DIALOGUE_PROFILE_v1.yaml`: exact generic Ryan reaction bank and no-repeat rules.
- `FRACTIONS_MANIFEST.yaml`: ordered skills and prerequisites.
- `VALIDATION_REPORT.json`: schema/reference/content QA results.

## Validation summary
- Skills: 28
- Questions/checks/recovery items: 563
- Teaching scenes: 280
- Passing package QA: 28/28

## Deliberate exclusions
This atomic pack does not yet include FRA-C01 to FRA-C06 composites or FRA-B01 to FRA-B03 cross-strand bridges. Those are separate registry nodes rather than FRA-01..FRA-28 atomic skills.
