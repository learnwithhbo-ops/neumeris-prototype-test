# Neumeris mathematics release — 17 September 2026

The existing Neumeris entrance now opens a subject chooser. Physics keeps its
existing URLs and content. IB Mathematics lives at `/ib-maths/`; Edexcel
International GCSE Mathematics A Higher lives at `/igcse-maths/`.

Both mathematics spaces use the Neumeris sidebar, typography, colours, motion
preference and overview layout. They provide topic practice, a source-paper
archive and a **Study notes — Coming soon** page. There is no video section.
Each collection is loaded only when practice or the archive is opened.

## Published content

- IB Mathematics: the existing `interface/out` delivery collection, with 30
  reviewed questions and 6,690 explicitly provisional entries, 54 current
  subtopics, seven legacy categories and 693 source papers. Review labels,
  course suitability, prerequisite parts and answer availability are preserved.
- IGCSE Mathematics: the existing `edexcel-igcse/interface/build` delivery
  collection, with 3,041 questions, 4,655 supported parts, 39 subtopics and
  142 original Higher papers. Existing hints, key notes, inline answers and
  reviewed cross-board additions are retained.
- Full maths papers retain their original external source links. Prepared
  question and answer images are included locally in the release.
- Physics content is unchanged from production commit
  `a1e39df7656d15da7e43e53f2cad7e9c989da6f5`; only the entrance and subject
  navigation changed. Authoring files and ongoing full-repository reviews
  were not imported.

## Validation and maintenance

The existing 16 IB Mathematics and 43 IGCSE interface tests passed. Five
additional DOM integration checks passed for the entrance, lazy collection
loading, notes, topic deep links, reviewed filtering, answer/help controls,
archive navigation and empty/direct-practice states. This was automated
logic verification, not a visual browser audit.

`node scripts/verify-physics-release.mjs` verifies release checksums and local
references, all Physics practice packs, and both mathematics collections.
Vercel runs that same verifier before publication. The mathematics verifier
checks all local question/answer assets and every IGCSE practice card.

To re-import delivery content, use `scripts/prepare-maths-release.mjs` with
the authoring workspace path; it does not modify the source collections.
Update the content counts and validation expectations if the reviewed
collections change, then refresh the release manifest and validate again.

The original prototype remains in the repository. The previous Physics-only
release is retained by tag `pre-maths-20260917`, alongside the earlier
`pre-physics-20260913` backup. Reverting this release restores that published
content without deleting the maths source projects.
