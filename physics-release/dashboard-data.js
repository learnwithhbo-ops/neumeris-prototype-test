import {ProgressStore, browserStorage, validateSnapshot} from './originals-progress.js';
import {checkMcq, checkWritten} from './originals-marking.js';

export const COURSES = Object.freeze([
  {id:'ib-physics', name:'IB Physics', detail:'SL & HL', symbol:'Φ', href:'#originals'},
  {id:'ib-maths', name:'IB Mathematics', detail:'AA & AI · SL & HL', symbol:'∫', href:'./ib-maths/#choose'},
  {id:'igcse-maths', name:'IGCSE Mathematics', detail:'Edexcel A · Higher', symbol:'ƒ', href:'./igcse-maths/#choose'},
]);
export const COURSE_KEY = 'neumeris.dashboard.courses.v1';
const courseIds = new Set(COURSES.map(c=>c.id));
export function readCourses(storage = browserStorage()) {
  try {
    const value = JSON.parse(storage?.getItem(COURSE_KEY) || 'null');
    if (value?.version !== 1 || !Array.isArray(value.courses) || value.courses.length > 3 || value.courses.some(c=>!courseIds.has(c)) || new Set(value.courses).size !== value.courses.length) return [];
    return [...value.courses];
  } catch { return []; }
}
export function saveCourses(courses, storage = browserStorage()) {
  if (!Array.isArray(courses) || courses.some(c=>!courseIds.has(c)) || new Set(courses).size !== courses.length) throw new Error('Choose valid courses.');
  try { if (!storage) return false; storage.setItem(COURSE_KEY, JSON.stringify({version:1,courses})); return true; } catch { return false; }
}
const empty = () => ({attempted:0, checked:0, mcq_correct:0, mcq_checked:0, written_score:0, written_max:0, written_checked:0});
const percentage = (score, max) => max ? Math.round(100*score/max) : null;
function finish(value) { return {...value, mcq_percentage:percentage(value.mcq_correct,value.mcq_checked), written_percentage:percentage(value.written_score,value.written_max)}; }

/** Latest checked responses only; unmarked answers and old editions never become zero scores. */
export function summarizePerformance(batches, snapshots) {
  const total=empty(), topics=new Map(), sets=[];
  for (const batch of batches) {
    const snapshot=snapshots[batch.batch_id];
    const counts=empty();
    if (!snapshot || (snapshot.content_revision ?? null) !== (batch.content_revision ?? null)) { sets.push({...finish(counts),batch_id:batch.batch_id,title:batch.title}); continue; }
    validateSnapshot(snapshot,batch.batch_id,batch.content_revision??null);
    for (const q of batch.questions) {
      const parts=snapshot.records[q.id]?.parts || {};
      const labels=q.question_type==='mcq'?['mcq']:q.parts.map(p=>p.label);
      const touched=labels.some(label=>parts[label]?.value?.trim());
      if (!touched) continue;
      counts.attempted++; total.attempted++;
      for (const id of q.topic_ids) { if (!topics.has(id)) topics.set(id,empty()); topics.get(id).attempted++; }
      for (const label of labels) {
        const answer=parts[label];
        if (!answer?.value?.trim() || !answer.result || answer.result.answer_value!==answer.value || answer.result.status==='self_reviewed') continue;
        const calculated=q.question_type==='mcq'?checkMcq(q,answer.value):checkWritten(q,label,answer.value);
        const score=calculated.estimated_awarded;
        if (answer.result.score!==score || answer.result.max_marks!==calculated.max_marks || (q.question_type==='mcq' && answer.result.status!=='checked')) continue;
        for (const target of [total,counts,...q.topic_ids.map(id=>topics.get(id))]) {
          target.checked++;
          if (q.question_type==='mcq') { target.mcq_checked++; target.mcq_correct+=score; }
          else { target.written_checked++; target.written_score+=score; target.written_max+=calculated.max_marks; }
        }
      }
    }
    sets.push({...finish(counts),batch_id:batch.batch_id,title:batch.title});
  }
  return {...finish(total),topics:[...topics].map(([id,value])=>({id,...finish(value)})).sort((a,b)=>a.id.localeCompare(b.id)),sets};
}
export function readPerformance(batches, storage = browserStorage()) {
  const snapshots={},warnings=[];
  for (const batch of batches) {
    const store=new ProgressStore({storage,batchId:batch.batch_id,contentRevision:batch.content_revision??null});
    snapshots[batch.batch_id]=store.snapshot();
    if (store.status.persistence!=='saved') warnings.push(`${batch.title}: ${store.status.message}`);
  }
  return {performance:summarizePerformance(batches,snapshots),warnings};
}

/** Display-only examples use in-memory stores and never write student storage. */
export function samplePerformance(batches) {
  const snapshots={};
  for (const [n,batch] of batches.entries()) {
    const store=new ProgressStore({storage:null,batchId:batch.batch_id,contentRevision:batch.content_revision??null});
    for (const q of batch.questions.slice(0,n===2?4:8)) {
      if (q.question_type==='mcq') {
        const value=(q.number%5===0)?q.options.find(o=>o.label!==q.answer.correct_option).label:q.answer.correct_option;
        const result=checkMcq(q,value); store.setAnswer(q.id,'mcq',value);
        store.setResult(q.id,'mcq',{score:result.estimated_awarded,max_marks:result.max_marks,status:'checked',feedback:''});
      } else {
        for (const part of q.answer.parts.slice(0,2)) {
          const value=(q.number%4===0)?part.answer:`${part.working} ${part.answer}`;
          const result=checkWritten(q,part.label,value); store.setAnswer(q.id,part.label,value);
          store.setResult(q.id,part.label,{score:result.estimated_awarded,max_marks:result.max_marks,status:'needs_review',feedback:''});
        }
      }
    }
    snapshots[batch.batch_id]=store.snapshot();
  }
  return summarizePerformance(batches,snapshots);
}
