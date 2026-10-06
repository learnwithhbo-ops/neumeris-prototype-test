import {originalSetForQuestion} from './originals-sets.js';

// A content edition is part of response identity, independent of marking updates.
export const ASSESSMENT_REVISION = 'assessment-20261006-v1';
// Filled from independently reviewed authoring; values are exact label/mark pairs.
export const ASSESSMENT_PARTS = Object.freeze({
  "neo-physics-foundations-01-q01": {
    "mcq": 1
  },
  "neo-physics-foundations-01-q02": {
    "a": 2,
    "b": 2,
    "c": 2
  },
  "neo-physics-foundations-01-q03": {
    "mcq": 1
  },
  "neo-physics-foundations-01-q04": {
    "a": 2,
    "b": 1,
    "c": 2
  },
  "neo-physics-foundations-01-q05": {
    "mcq": 1
  },
  "neo-physics-foundations-01-q06": {
    "a": 2,
    "b": 1,
    "c": 2
  },
  "neo-physics-foundations-01-q07": {
    "mcq": 1
  },
  "neo-physics-foundations-01-q08": {
    "a": 2,
    "b": 1
  },
  "neo-physics-foundations-01-q09": {
    "mcq": 1
  },
  "neo-physics-foundations-01-q10": {
    "a": 1,
    "b": 2,
    "c": 1
  },
  "neo-physics-foundations-01-q11": {
    "mcq": 1
  },
  "neo-physics-foundations-01-q12": {
    "a": 3,
    "b": 2
  },
  "neo-physics-foundations-02-q01": {
    "mcq": 1
  },
  "neo-physics-foundations-02-q02": {
    "a": 2,
    "b": 2,
    "c": 2
  },
  "neo-physics-foundations-02-q03": {
    "mcq": 1
  },
  "neo-physics-foundations-02-q04": {
    "a": 1,
    "b": 2,
    "c": 4
  },
  "neo-physics-foundations-02-q05": {
    "mcq": 1
  },
  "neo-physics-foundations-02-q06": {
    "a": 1,
    "b": 2,
    "c": 2
  },
  "neo-physics-foundations-02-q07": {
    "mcq": 1
  },
  "neo-physics-foundations-02-q08": {
    "a": 2,
    "b": 3
  },
  "neo-physics-foundations-02-q09": {
    "mcq": 1
  },
  "neo-physics-foundations-02-q10": {
    "a": 1,
    "b": 3
  },
  "neo-physics-foundations-02-q11": {
    "mcq": 1
  },
  "neo-physics-foundations-02-q12": {
    "a": 1,
    "b": 2,
    "c": 2
  },
  "neo-physics-foundations-03-q01": {
    "mcq": 1
  },
  "neo-physics-foundations-03-q02": {
    "a": 2,
    "b": 3,
    "c": 2
  },
  "neo-physics-foundations-03-q03": {
    "mcq": 1
  },
  "neo-physics-foundations-03-q04": {
    "a": 2,
    "b": 3,
    "c": 2
  },
  "neo-physics-foundations-03-q05": {
    "mcq": 1
  },
  "neo-physics-foundations-03-q06": {
    "a": 2,
    "b": 1,
    "c": 3
  },
  "neo-physics-foundations-03-q07": {
    "mcq": 1
  },
  "neo-physics-foundations-03-q08": {
    "a": 2,
    "b": 3,
    "c": 1
  },
  "neo-physics-foundations-03-q09": {
    "mcq": 1
  },
  "neo-physics-foundations-03-q10": {
    "a": 2,
    "b": 3
  },
  "neo-physics-foundations-03-q11": {
    "mcq": 1
  },
  "neo-physics-foundations-03-q12": {
    "a": 2,
    "b": 3,
    "c": 1
  }
});

export function knownContentRevision(revision) {
  return revision === null || revision === ASSESSMENT_REVISION;
}
export function responseContract(id, revision = null) {
  if (!originalSetForQuestion(id) || !knownContentRevision(revision)) return null;
  if (revision) return ASSESSMENT_PARTS[id] || null;
  if (Number(id.slice(-2)) % 2 === 1) return {mcq: 1};
  return {a: null, b: null, ...((id.startsWith('neo-physics-foundations-02-') || id === 'neo-physics-foundations-01-q10') ? {c: null} : {})};
}
export function responsePartAllowed(id, label, revision = null) {
  const contract = responseContract(id, revision);
  return Boolean(contract && Object.hasOwn(contract, label));
}
