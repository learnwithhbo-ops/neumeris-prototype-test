import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateBatch} from '../physics-release/originals.js';
import {ORIGINALS_SETS} from '../physics-release/originals-sets.js';

const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function validateSvg(svg, asset) {
  const source = svg.toString('utf8');
  if (svg.length > 512_000 || !/<svg\b[^>]*\bviewBox\s*=/.test(source) || !/<title\b/.test(source) || !/<desc\b/.test(source)) throw new Error(`${asset}: invalid or inaccessible SVG`);
  if (/<(?:script|style|foreignObject|image|animate|animateTransform|animateMotion|set)\b/i.test(source) || /\bon[a-z]+\s*=/i.test(source) || /(?:href|src)\s*=\s*["'](?!#)/i.test(source) || /url\(\s*["']?(?!#)/i.test(source) || /<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error(`${asset}: active or external SVG content`);
  return true;
}
export async function verifyOriginals(releaseRoot = fileURLToPath(new URL('../physics-release/', import.meta.url))) {
  const folder = path.join(releaseRoot, 'originals');
  const root = await fs.realpath(folder), batches = [], allowedFiles = new Set(), allowedFolders = new Set(['assets']);
  for (const [batchId, set] of Object.entries(ORIGINALS_SETS)) {
    let bytes;
    try { bytes = await fs.readFile(path.join(folder, set.filename)); }
    catch (error) { if (error.code === 'ENOENT' && batchId !== 'physics-foundations-01') continue; throw error; }
    const batch = validateBatch(JSON.parse(bytes));
    if (batch.batch_id !== batchId) throw new Error('Public filename and batch identity disagree');
    allowedFiles.add(set.filename);
    const assets = new Set(batch.questions.flatMap(q => q.diagram ? [q.diagram.file] : [])), hashes = {};
    const assetRoot = path.join(folder, set.assetDirectory);
    if (set.assetDirectory) allowedFolders.add(set.assetDirectory.replace(/\/$/, ''));
    for (const asset of assets) {
      const real = await fs.realpath(path.join(assetRoot, asset));
      if (!real.startsWith(`${root}${path.sep}`)) throw new Error(`${asset}: asset escapes public collection`);
      const svg = await fs.readFile(real); validateSvg(svg, asset); hashes[asset] = sha256(svg);
    }
    if (assets.size) {
      const files = await fs.readdir(path.join(assetRoot, 'assets'), {withFileTypes: true});
      if (files.some(file => !file.isFile() || file.isSymbolicLink() || !assets.has(`assets/${file.name}`))) throw new Error('Unreferenced or unexpected original diagram');
    }
    if (set.assetDirectory) {
      const files = await fs.readdir(assetRoot, {withFileTypes: true});
      if (files.some(file => file.name !== 'assets' || !file.isDirectory() || file.isSymbolicLink())) throw new Error('Unexpected private files in original set');
    }
    batches.push({batch_id: batchId, questions: batch.questions.length, mcq: batch.questions.filter(q => q.question_type === 'mcq').length, written: batch.questions.filter(q => q.question_type === 'written').length, diagrams: assets.size, question_data_sha256: sha256(bytes), asset_sha256: hashes});
  }
  const entries = await fs.readdir(folder, {withFileTypes: true});
  if (entries.some(entry => entry.isSymbolicLink() || (entry.isFile() ? !allowedFiles.has(entry.name) : !entry.isDirectory() || !allowedFolders.has(entry.name)))) throw new Error('Unexpected public originals files; private references must stay outside the release');
  if (batches.length === 1) return {...batches[0], batches};
  return {collection: 'Neumeris Originals', questions: batches.reduce((sum, batch) => sum + batch.questions, 0), mcq: batches.reduce((sum, batch) => sum + batch.mcq, 0), written: batches.reduce((sum, batch) => sum + batch.written, 0), diagrams: batches.reduce((sum, batch) => sum + batch.diagrams, 0), batches};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await verifyOriginals(process.argv[2]), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
