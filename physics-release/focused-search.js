export function hydrateLibrary(data, supplemental=null, bridges={}, adjustments={}, curation={}, crossBoard=null) {
  if(crossBoard){
    data.sources={...data.sources,...crossBoard.sources};
    data.questions.push(...crossBoard.questions);
    data.papers.push(...crossBoard.papers);
  }
  if(supplemental){
    data.sources={...data.sources,...supplemental.sources};
    data.questions.unshift(...supplemental.questions);
    data.papers.push(...supplemental.papers);
    data.summary.supplementary_questions=supplemental.questions.length;
    data.summary.supplementary_parts=supplemental.questions.reduce((n,q)=>n+q.parts.filter(p=>p.review_status==='reviewed'&&p.subtopic_ids.length).length,0);
    data.summary.checked_parts+=data.summary.supplementary_parts;
  }
  for(const q of data.questions) {
    q.source=data.sources[q.source_file_id];
    if(!q.source)throw new Error('Missing question source: '+q.source_file_id);
    if(q.paper_label)q.source={...q.source,paper_label:q.paper_label};
    if(q.source_level)q.source={...q.source,level:q.source_level};
    if(q.markscheme)q.markscheme.source=data.sources[q.markscheme.source_id];
    for(const p of q.parts){
      const key=q.id+':'+p.label;
      if(adjustments[key])Object.assign(p,adjustments[key].change);
      if(curation.exclusions?.[key])p.syllabus_exclusion=curation.exclusions[key];
      if(curation.adaptations?.[key])Object.assign(p,curation.adaptations[key].change);
      if(bridges[key])p.bridge_result=bridges[key];
      if(p.answer?.source_id)p.answer.source=data.sources[p.answer.source_id];
    }
  }
  const partIndex=new Map(data.questions.flatMap(q=>q.parts.map(p=>[q.id+':'+p.label,{q,p}])));
  for(const [sourceId,sha] of Object.entries(curation.source_hashes??{})){
    if(data.sources[sourceId]?.sha256!==sha)throw new Error('Topical review needs updating for source: '+sourceId);
  }
  for(const group of curation.duplicates??[]){
    const appearances=group.members.map(key=>{
      const entry=partIndex.get(key);
      if(!entry)throw new Error('Missing duplicate reference: '+key);
      return {id:entry.q.id,label:entry.p.label,question_number:entry.q.question_number,source:entry.q.source,page:entry.q.content_pages[0]};
    });
    for(const key of group.members){
      const p=partIndex.get(key).p;
      if(p.duplicate_group)throw new Error('Overlapping duplicate groups: '+key);
      p.duplicate_group=group.id;p.duplicate_appearances=appearances;
    }
  }
  for(const p of data.papers){
    p.source=data.sources[p.source_id];
    if(p.source.collection==='supplementary'){
      p.focused_question_count=data.questions.filter(q=>q.source_file_id===p.source_id).length;
      p.issue=p.focused_question_count?null:'Reference or answer material; no separate topical question entry.';
    }
  }
  const allTopics=data.subtopics.map(s=>s.id);
  const all=findQuestions(data,{subtopics:allTopics,course:'all'});
  const added=findQuestions(data,{subtopics:allTopics,course:'all',collection:'supplementary'});
  data.summary.part_appearances=data.questions.reduce((n,q)=>n+matchingParts(q).filter(p=>p.subtopic_ids.length).length,0);
  data.summary.checked_parts=all.reduce((n,r)=>n+r.targets.length,0);
  data.summary.repeat_appearances=data.summary.part_appearances-data.summary.checked_parts;
  data.summary.supplementary_parts=added.reduce((n,r)=>n+r.targets.length,0);
  data.summary.supplementary_questions=added.length;
  data.summary.syllabus_excluded_parts=data.questions.reduce((n,q)=>n+q.parts.filter(p=>p.syllabus_exclusion).length,0);
  data.summary.mcq_questions=all.filter(r=>isMcq(r.question)).length;
  data.summary.written_questions=all.length-data.summary.mcq_questions;
  data.summary.thermodynamics_questions=findQuestions(data,{subtopics:['B.4'],course:'all'}).length;
  data.summary.source_papers=data.papers.length;
  data.summary.segmented_questions=all.length;
  data.summary.papers_needing_review=data.papers.filter(p=>p.source.collection!=='supplementary'&&p.issue).length;
  return data;
}
export const isReviewed=q=>q.parts.some(p=>p.review_status==='reviewed') && q.parts.filter(p=>p.subtopic_ids.length).every(p=>p.review_status==='reviewed');
export const assessedSkills=p=>p.subtopic_ids??[];
export const isMcq=q=>q.question_type?q.question_type==='mcq':['1','1A'].includes(String(q.source.paper_label??q.source.paper));
// Topic practice is curated. Draft keyword matches remain in the source archive.
// Current guide sections with no SL content; keep in sync with the topic menu.
export const HL_ONLY_SUBTOPICS=new Set(['A.4','A.5','B.4','D.4','E.2']);
export function partMatchesCourse(q,p,course='all') {
  if(course==='all')return true;
  if(p.subtopic_ids?.some(id=>HL_ONLY_SUBTOPICS.has(id)))return course==='Physics-HL';
  const level=p.ib_level??q.ib_level;
  if(level)return course==='Physics-HL'||(course==='Physics-SL'&&level==='SL');
  return q.source.course+'-'+q.source.level===course;
}
const matchingParts=(q,course='all')=>q.parts.filter(p=>p.review_status==='reviewed'&&!p.syllabus_exclusion&&partMatchesCourse(q,p,course));
export function visibleQuestion(q,course='all',review='all',filters={}) {
  if(filters.collection==='supplementary'&&q.source.collection!=='supplementary')return false;
  if(filters.collection==='past'&&q.source.collection==='supplementary')return false;
  // Extra banks are organized by topic; the date range applies to exam papers.
  if(q.source.collection!=='supplementary' && (filters.yearFrom || filters.yearTo)) {
    const year=Number(q.source.year);
    if(!Number.isFinite(year) || year<1900)return false;
    if(filters.yearFrom && year<Number(filters.yearFrom))return false;
    if(filters.yearTo && year>Number(filters.yearTo))return false;
  }
  const mcq=isMcq(q);
  if(filters.format==='mcq'&&!mcq)return false;
  if(filters.format==='written'&&mcq)return false;
  if(filters.syllabus && filters.syllabus!=='all' && q.source.syllabus!==filters.syllabus)return false;
  if(filters.paper && filters.paper!=='all' && String(q.source.paper_label??q.source.paper)!==filters.paper)return false;
  if(review==='unclassified')return q.parts.some(p=>partMatchesCourse(q,p,course))&&!q.parts.some(p=>p.subtopic_ids.length&&p.review_status==='reviewed');
  return matchingParts(q,course).some(p=>p.subtopic_ids.length);
}
export function questionSubtopics(q,skills={},course='all',review='all') {
  return [...new Set(matchingParts(q,course).flatMap(p=>p.subtopic_ids))];
}
export function availableQuestions(questions,skills,subtopic,course='all',review='all',filters={}) {
  return findQuestions({questions},{...filters,keyword:'',subtopics:[subtopic],course,review}).length;
}
export function requiredParts(q,targets) {
  const parts=new Map(q.parts.map(p=>[p.label,p])),needed=new Set(),visited=new Set();
  function visit(label) {
    if(visited.has(label))return;
    visited.add(label);
    for(const dep of parts.get(label)?.depends_on??[]) {
      if(!parts.has(dep))throw new Error('Missing prerequisite: '+dep);
      needed.add(dep);visit(dep);
    }
  }
  targets.forEach(visit);
  return q.parts.map(p=>p.label).filter(p=>needed.has(p)&&!targets.includes(p));
}
// A supplied final result bypasses its entire earlier calculation chain.
export function supportParts(q,targets) {
  const needed=new Set(q.parts.filter(p=>targets.includes(p.label)).flatMap(p=>p.depends_on));
  return q.parts.filter(p=>needed.has(p.label)&&!targets.includes(p.label)).map(p=>p.label);
}
export function selectedContexts(q,labels) {
  const ids=new Set(q.parts.filter(p=>labels.includes(p.label)).flatMap(p=>p.context_ids));
  return q.contexts.filter(c=>ids.has(c.id));
}
export function findQuestions(data,filters) {
  const selected=new Set(filters.subtopics),review=filters.review??'all';
  const words=(filters.keyword??'').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if(!selected.size&&review!=='unclassified')return [];
  const results=[],seen=new Set();
  for(const q of data.questions) {
    if(!visibleQuestion(q,filters.course,review,filters))continue;
    const parts=matchingParts(q,filters.course).filter(p=>p.subtopic_ids.some(s=>selected.has(s)));
    if(!parts.length&&review!=='unclassified')continue;
    const context=selectedContexts(q,parts.map(p=>p.label));
    const text=[q.question_number,q.source.level,q.source.year,q.source.session,q.source.collection_label,'Paper '+q.source.paper_label,...parts.map(p=>p.display_text??p.text),...context.map(c=>c.display_text??c.text)].join(' ').toLocaleLowerCase();
    if(!words.every(w=>text.includes(w)))continue;
    // Choose a representative only after filters: an HL copy must not hide its SL copy.
    const unique=parts.filter(p=>!seen.has(p.duplicate_group??q.id+':'+p.label));
    if(!unique.length&&review!=='unclassified')continue;
    unique.forEach(p=>seen.add(p.duplicate_group??q.id+':'+p.label));
    const targets=unique.map(p=>p.label),prerequisites=supportParts(q,targets);
    const repeatedIn=[...new Map(unique.flatMap(p=>p.duplicate_appearances??[]).filter(a=>a.id!==q.id).map(a=>[a.id+':'+a.label,a])).values()];
    results.push({question:q,targets,prerequisites,repeatedIn,matchedSubtopics:[...new Set(unique.flatMap(p=>p.subtopic_ids).filter(s=>selected.has(s)))]});
  }
  return results;
}
