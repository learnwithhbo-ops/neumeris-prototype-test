export const isReviewed = question => question.review?.status === 'verified' || (!question.review && question.parts.length > 0);
export function assessedSkills(part) { return [part.main_skill_id, ...part.other_assessed_skill_ids]; }
export function eligibleParts(question, course) {
  return course === 'all' ? question.parts.map(p => p.label) : (question.course_suitability[course]?.eligible_parts ?? []);
}
export function visibleQuestion(question, course='all', review='all') {
  const verified=isReviewed(question);
  if(review==='verified' && !verified || review==='provisional' && verified)return false;
  if(review==='unclassified' && (verified || question.suggested_subtopic_ids?.length))return false;
  if(course==='all')return true;
  if(verified && ['AA-SL','AA-HL','AI-SL','AI-HL'].includes(course))return eligibleParts(question,course).length>0;
  // Source filtering does not assert mathematical suitability.
  return question.source.course+'-'+question.source.level===course;
}
export function questionSubtopics(question, skills, course='all') {
  if(!isReviewed(question))return question.suggested_subtopic_ids ?? [];
  const allowed=['AA-SL','AA-HL','AI-SL','AI-HL'].includes(course)?eligibleParts(question,course):question.parts.map(p=>p.label);
  return [...new Set(question.parts.filter(p=>allowed.includes(p.label)).flatMap(p=>assessedSkills(p).map(id=>skills[id].subtopic_id)))];
}
export function availableQuestions(questions, skills, subtopicId, course='all', review='all') {
  return questions.filter(q=>visibleQuestion(q,course,review) && questionSubtopics(q,skills,course).includes(subtopicId)).length;
}
export function requiredParts(question, targets) {
  const parts=Object.fromEntries(question.parts.map(p=>[p.label,p])), needed=new Set();
  function visit(label) { for(const dep of parts[label].depends_on) { if(needed.has(dep))continue;needed.add(dep);visit(dep); } }
  targets.forEach(visit);
  return question.parts.map(p=>p.label).filter(p=>needed.has(p) && !targets.includes(p));
}
const indexes=new WeakMap();
function index(data) {
  if(indexes.has(data))return indexes.get(data);
  const skills=Object.fromEntries(data.skills.map(s=>[s.id,s]));
  const subs=Object.fromEntries(data.subtopics.map(s=>[s.id,s]));
  const text=new Map(data.questions.map(q=>[q.id,[q.title,q.excerpt_text,q.search_text,q.trial_label,q.id,q.question_number,q.source.course,q.source.level,q.source.year,q.source.session,
    ...questionSubtopics(q,skills).map(id=>subs[id].name),...q.parts.flatMap(p=>assessedSkills(p).map(id=>skills[id].name))].join(' ').toLocaleLowerCase()]));
  const value={skills,text};indexes.set(data,value);return value;
}
export function findQuestions(data, filters) {
  const {skills,text}=index(data),selected=new Set(filters.subtopics), review=filters.review??'all';
  const words=(filters.keyword??'').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if(!selected.size && review!=='unclassified')return [];
  const results=[];
  for(const question of data.questions) {
    if(!visibleQuestion(question,filters.course,review))continue;
    const matched=questionSubtopics(question,skills,filters.course).filter(id=>selected.has(id));
    if(!matched.length && review!=='unclassified')continue;
    if(!words.every(word=>text.get(question.id).includes(word)))continue;
    if(!isReviewed(question)) { results.push({question,targets:[],prerequisites:[],matchedSubtopics:matched});continue; }
    const eligible=['AA-SL','AA-HL','AI-SL','AI-HL'].includes(filters.course)?eligibleParts(question,filters.course):question.parts.map(p=>p.label);
    const targets=question.parts.filter(p=>eligible.includes(p.label) && assessedSkills(p).some(id=>selected.has(skills[id].subtopic_id))).map(p=>p.label);
    if(targets.length)results.push({question,targets,prerequisites:requiredParts(question,targets),matchedSubtopics:matched});
  }
  return results;
}
