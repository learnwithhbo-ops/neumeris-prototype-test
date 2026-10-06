// Deliberately bounded collections; new sets need a reviewed import and registry entry.
const foundationsTopics = Object.freeze(['A.1', 'A.2', 'A.3', 'B.1', 'C.3', 'C.4']);
export const ORIGINALS_SETS = Object.freeze({
  'physics-foundations-01': Object.freeze({label: 'Physics Foundations: Set 1', offset: 0, prefix: 'neo-physics-foundations-01-q', url: './originals/foundations-01.json', assetDirectory: '', filename: 'foundations-01.json', topics: foundationsTopics, diagrams: 6}),
  'physics-foundations-02': Object.freeze({label: 'Physics Foundations: Set 2', offset: 12, prefix: 'neo-physics-foundations-02-q', url: './originals/foundations-02.json', assetDirectory: 'foundations-02/', filename: 'foundations-02.json', topics: foundationsTopics, diagrams: 4}),
  'physics-foundations-03': Object.freeze({label: 'Physics Foundations: Set 3', offset: 24, prefix: 'neo-physics-foundations-03-q', url: './originals/foundations-03.json', assetDirectory: 'foundations-03/', filename: 'foundations-03.json', topics: Object.freeze(['B.2', 'B.3', 'B.5', 'C.1', 'D.1', 'D.2']), diagrams: 4}),
});
export function originalSet(batchId) {
  if (!Object.hasOwn(ORIGINALS_SETS, batchId)) throw new Error('Unknown original-question set.');
  return ORIGINALS_SETS[batchId];
}
export function originalSetForQuestion(id) {
  const batchId = Object.keys(ORIGINALS_SETS).find(key => typeof id === 'string' && new RegExp(`^${ORIGINALS_SETS[key].prefix}(?:0[1-9]|1[0-2])$`).test(id));
  return batchId || null;
}
