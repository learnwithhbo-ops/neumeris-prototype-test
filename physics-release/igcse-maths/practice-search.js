export function sourceMatches(s,f={}) {
 if(s?.collection==='cross-board')return s.target_qualification==='4MA1'&&s.target_tier==='Higher'&&s.admission==='reviewed'&&(!f.from||s.year>=Number(f.from))&&(!f.to||s.year<=Number(f.to))&&(!f.paper||f.paper==='all')&&(!f.variant||f.variant==='all');
 return s.tier==='Higher' && (!f.from||s.year>=Number(f.from)) && (!f.to||s.year<=Number(f.to)) && (!f.paper||f.paper==='all'||s.paper.startsWith(f.paper)) && (!f.variant||f.variant==='all'||s.regional===(f.variant==='regional'));
}
const admitted=(s,p)=>s.collection!=='cross-board'||(p.review?.status==='approved'&&p.review.target_qualification==='4MA1'&&p.review.target_tier==='Higher');
function matchesWords(q,p,data,words){const text=`${p.text} ${q.context.filter(c=>p.context_ids.includes(c.id)).map(c=>c.text).join(' ')} ${p.topic_ids.map(t=>data.subtopics.find(s=>s.id===t)?.name).join(' ')} ${data.guidance[p.guidance]?.hint}`.toLowerCase();return words.every(w=>text.includes(w));}
export function findPractice(data,f={}) {
 const topics=new Set(f.topics||[]),seen=new Set(),results=[];
 if(!topics.size||Number(f.from)>Number(f.to))return results;
 const words=(f.keyword||'').toLowerCase().trim().split(/\s+/).filter(Boolean);
 for(const q of data.questions){if(!sourceMatches(data.sources[q.source_id],f))continue;const targets=q.parts.filter(p=>admitted(data.sources[q.source_id],p)&&p.topic_ids.some(t=>topics.has(t))&&matchesWords(q,p,data,words));const unique=targets.filter(p=>{if(seen.has(p.duplicate_group))return false;seen.add(p.duplicate_group);return true;});if(unique.length)results.push({question:q,targets:unique});}
 return results;
}
export function topicCounts(data,f={}) {
 const counts=Object.fromEntries(data.subtopics.map(t=>[t.id,0])),seen=new Set(),words=(f.keyword||'').toLowerCase().trim().split(/\s+/).filter(Boolean);
 if(Number(f.from)>Number(f.to))return counts;
 for(const q of data.questions){if(!sourceMatches(data.sources[q.source_id],f))continue;for(const p of q.parts){if(!admitted(data.sources[q.source_id],p)||!matchesWords(q,p,data,words))continue;for(const t of p.topic_ids){const key=t+':'+p.duplicate_group;if(!seen.has(key)){counts[t]++;seen.add(key);}}}}
 return counts;
}
export function findArchive(data,f={}){return Object.values(data.sources).filter(s=>s.collection!=='cross-board'&&sourceMatches(s,f));}
