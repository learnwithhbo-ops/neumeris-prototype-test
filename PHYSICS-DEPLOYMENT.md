# Neumeris Physics deployment

The website now serves the approved Neumeris Physics interface: Discovery Lab written lessons, topical practice with hints and answers, and the full-paper archive. Vercel publishes `physics-release/` after verifying every file against `physics-release-manifest.json`. No installation or application build is needed.

The original prototype source remains unchanged in this repository. The Vercel configuration selects the separate Physics directory; it does not remove the original application. The previous production revision is `7a968a65f874cb7d1e0d8c5e6041a7a0ea8d8fb4`.

To restore the original website, roll back to its previous Vercel deployment or revert the Physics deployment commit and let the existing Git integration redeploy. The original `npm run build` and Vite configuration are retained.

The Physics release uses content version `2026-09-13.4`, with 10 written lessons, 469 question papers, 912 original PDF files including available mark schemes, and 9,766 verified practice images. The source interface passed all 85 Node regression checks. Release preparation preserves the original source PDFs and archived narration locally.

Run `node scripts/verify-physics-release.mjs` before deploying. Keep the file manifest synchronized with intentional future updates. Domain and email DNS settings remain with the existing providers.
