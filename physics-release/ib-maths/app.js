import { findQuestions, availableQuestions, assessedSkills, isReviewed } from './search.js';

const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = {all:'All courses & legacy','Mathematics-HL':'Mathematics HL','Mathematics-SL':'Mathematics SL','Mathematical-Studies-SL':'Mathematical Studies SL','Mathematical-Methods-SL':'Mathematical Methods SL','AA-SL':'AA SL','AA-HL':'AA HL','AI-SL':'AI SL','AI-HL':'AI HL'};
const partLabel = p => p === 'whole' ? 'whole question' : '(' + p.split('.').join(')(') + ')';
const assetUrl = path => './' + path.split('/').map(encodeURIComponent).join('/');
let data, skills, selected, applied, renderedResults = [], shown=0;
const sourceUrl=(source,page)=>escape((source.url || assetUrl(source.path))+(page?'#page='+page:''));
const reviewLabel={all:'Reviewed + provisional',verified:'Reviewed only',provisional:'Provisional only',unclassified:'Awaiting topic assignment'};

function currentFilters() { return {course:$('course').value, review:$('review').value, keyword:$('keyword').value.trim(), subtopics:[...selected].sort()}; }
function markPending() {
  const changed = JSON.stringify(currentFilters()) !== JSON.stringify(applied);
  const found=findQuestions(data,currentFilters()).length;
  $('selection-count').textContent=found.toLocaleString()+' question entries match';
  $('search-button').disabled=!found;
  $('pending-note').textContent=changed?'Press Start practice to use these choices.':'Choose your topics and course.';
}
function renderTopics() {
  const unsorted=$('review').value==='unclassified';
  $('topic-tree').hidden=unsorted;
  document.querySelector('.selection-help').textContent=unsorted?'Topic selection is not used for questions awaiting assignment.':'Select one or more. Numbers show available source entries.';
  if(unsorted)return;
  const focused = document.activeElement;
  const focusSubtopic = focused?.name === 'subtopic' ? focused.value : null;
  const focusParent = focused?.dataset?.parent;
  const firstRender = !$('topic-tree').dataset.initialized;
  const open = [...document.querySelectorAll('.topic-group[open]')].map(el => el.dataset.topic);
  const course = $('course').value;
  $('topic-tree').innerHTML = data.topics.map(topic => {
    const children = data.subtopics.filter(s => s.topic_id === topic.id);
    const rows = children.map(s => ({...s,count:availableQuestions(data.questions,skills,s.id,course,$('review').value)}));
    const count = findQuestions(data,{course,review:$('review').value,keyword:'',subtopics:children.map(s=>s.id)}).length;
    const available = rows.filter(s => s.count > 0);
    const checked = available.length && available.every(s => selected.has(s.id));
    const expanded = open.includes(topic.id) || (firstRender && topic.id === 'number-algebra');
    return `<details class="topic-group" data-topic="${escape(topic.id)}" ${expanded?'open':''}><summary><label class="topic-label"><input type="checkbox" data-parent="${escape(topic.id)}" ${checked?'checked':''} ${!count?'disabled':''} aria-label="Select all ${escape(topic.name)} subtopics"><span>${escape(topic.name)}</span></label><span class="topic-count">${count}</span></summary><div class="subtopics">${rows.map(s=>`<label class="subtopic-label ${s.count?'':'empty'}"><input type="checkbox" name="subtopic" value="${escape(s.id)}" ${selected.has(s.id)?'checked':''} ${s.count===0&&!selected.has(s.id)?'disabled':''}><span class="subtopic-name">${escape(s.name)}</span><span class="sub-count" aria-label="${s.count} questions">${s.count}</span></label>`).join('')}${!count?'<p class="no-questions-note">No matching questions in this collection yet.</p>':''}</div></details>`;
  }).join('');
  document.querySelectorAll('[data-parent]').forEach(input=> {
    const available = data.subtopics.filter(s=>s.topic_id===input.dataset.parent && availableQuestions(data.questions,skills,s.id,course,$('review').value)>0);
    input.indeterminate = available.some(s=>selected.has(s.id)) && !available.every(s=>selected.has(s.id));
    input.closest('label').addEventListener('click',event=>event.stopPropagation());
    input.addEventListener('change',()=>{available.forEach(s=>input.checked?selected.add(s.id):selected.delete(s.id));renderTopics();markPending();});
  });
  document.querySelectorAll('[name=subtopic]').forEach(input=>input.addEventListener('change',()=>{input.checked?selected.add(input.value):selected.delete(input.value);renderTopics();markPending();}));
  $('topic-tree').dataset.initialized = 'true';
  if(focusSubtopic)document.querySelector(`[name=subtopic][value="${CSS.escape(focusSubtopic)}"]`)?.focus({preventScroll:true});
  if(focusParent)document.querySelector(`[data-parent="${CSS.escape(focusParent)}"]`)?.focus({preventScroll:true});
}

function filterChips(filters) {
  const chips = [labels[filters.course],reviewLabel[filters.review]];
  for (const topic of data.topics) {
    if(filters.review==='unclassified')break;
    const relevant = data.subtopics.filter(s=>s.topic_id===topic.id && filters.subtopics.includes(s.id));
    if (!relevant.length) continue;
    const available = data.subtopics.filter(s=>s.topic_id===topic.id && availableQuestions(data.questions,skills,s.id,filters.course,filters.review)>0);
    if (available.length && available.every(s=>filters.subtopics.includes(s.id))) chips.push(topic.name + ' · all available subtopics');
    else chips.push(...relevant.map(s=>s.name));
  }
  if(filters.keyword)chips.push('“'+filters.keyword+'”');
  return chips.map(text=>`<span class="chip">${escape(text)}</span>`).join('');
}

function provisionalCard({question:q,matchedSubtopics}, index) {
  const names=matchedSubtopics.map(id=>data.subtopics.find(s=>s.id===id).name);
  const images=q.render_mode==='source-pdf' ? `<figure class="source-pdf"><iframe src="${sourceUrl(q.source,q.content_pages[0])}&amp;zoom=page-width&amp;toolbar=0&amp;navpanes=0" title="Original paper: question ${q.question_number}, starting on PDF page ${q.content_pages[0]}" loading="lazy" referrerpolicy="no-referrer"></iframe><figcaption>Question ${q.question_number} · PDF page${q.content_pages.length>1?'s':''} ${q.content_pages.join(', ')}. Scroll within the PDF for continuing parts.</figcaption><p class="part-note">If the PDF does not appear, use Open original paper below.</p></figure>` : q.question_assets.map((a,i)=>`<figure class="question-page"><img src="${assetUrl(a.path)}" alt="Original source page ${a.pdf_page} containing question ${q.question_number}" loading="${index===0&&i===0?'eager':'lazy'}" decoding="async" width="${Math.round(a.crop_pdf_points_top_left[2]*1.5)}" height="${Math.round(a.crop_pdf_points_top_left[3]*1.5)}"><figcaption>Question ${q.question_number} · PDF page ${a.pdf_page} · Full source page</figcaption></figure>`).join('');
  const evidence=(q.classification_evidence??[]).filter(e=>matchedSubtopics.includes(e.subtopic_id));
  const calculator={required:'Calculator required',prohibited:'No calculator',permitted:'Calculator allowed',unverified:'Calculator condition unverified'}[q.source.calculator];
  return `<article class="question-card provisional-card" id="question-${escape(q.id)}"><div class="question-head"><div class="question-meta"><span class="question-number">${escape(q.section_label ? q.section_label + ' · ' : '')}Q${q.question_number}</span><span>${escape(q.source.course.replaceAll('-',' '))} ${escape(q.source.level)}${q.source.syllabus==='legacy'?' · Legacy':''}</span><span>${escape(q.source.session)} ${q.source.year} · Paper ${q.source.paper} · ${escape(q.source.timezone)}</span></div><h3>${escape(names.join(' · ') || q.title)}</h3><div class="question-labels"><span class="badge provisional">Provisional match</span>${q.marks!==null?`<span class="badge">${q.marks} marks</span>`:''}<span class="badge">${escape(calculator)}</span>${q.possible_duplicate_group?'<span class="badge">Possible repeat appearance</span>':''}</div></div><div class="matched-parts"><strong>Question ${q.question_number}</strong><span>Part labels and course suitability await review. Full pages may include neighbouring questions.</span></div>${images}<div class="question-bottom"><div class="question-links">${q.markscheme?`<button type="button" class="answer-button" data-answer="${index}" aria-expanded="false" aria-controls="answer-${escape(q.trial_label)}">View possible mark scheme</button>`:'<span class="answer-unavailable">Mark scheme not confirmed</span>'}<a class="source-link" href="${sourceUrl(q.source,q.content_pages[0])}" target="_blank" rel="noopener">Open original paper ↗</a></div>${evidence.length?`<details class="part-details"><summary>Why this question matched</summary><p class="part-note">Topic suggestions come from text matches or recorded editorial decisions; assessed skills still need review.</p><ul class="evidence-list">${evidence.map(e=>`<li><strong>${escape(data.subtopics.find(s=>s.id===e.subtopic_id).name)}</strong><br>“${escape(e.context)}”</li>`).join('')}</ul></details>`:''}${q.source_issues.map(note=>`<p class="source-note">${escape(note)}</p>`).join('')}${q.source.source_variant==='donated-scan'?'<p class="source-note">Donated scan: annotations or handwritten working may appear on the source pages.</p>':''}${q.markscheme?`<section class="answer-panel" id="answer-${escape(q.trial_label)}" hidden aria-label="Possible mark scheme for question ${q.question_number}"></section>`:''}</div></article>`;
}

function initArchive() {
  const s=data.summary;
  $('coverage-note').textContent=`${s.subtopics_with_questions} subtopics have matches. ${s.reviewed_questions} reviewed questions; ${s.provisional_with_topic_matches.toLocaleString()} provisional source entries. Possible repeat appearances are flagged.`;
  $('collection-count').textContent=`5 topics · ${data.subtopics.filter(s=>!s.legacy_only).length} subtopics + ${data.subtopics.filter(s=>s.legacy_only).length} legacy categories`;
  $('archive-summary').textContent=`Browse all ${s.source_papers} source papers · ${s.papers_needing_review} have source issues`;
  $('archive-status').textContent=`${s.parsed_papers} papers indexed; ${s.papers_needing_review} have unresolved source issues. ${s.unclassified_questions} extracted questions await topic assignment—choose that collection above to view them.`;
  let limit=50;
  function draw() {
    const words=$('paper-keyword').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const papers=data.papers.filter(p=>words.every(w=>[p.source.course.replaceAll('-',' '),p.source.level,p.source.year,p.source.session,'Paper '+p.source.paper,p.source.timezone,p.source.id,p.issue??'indexed'].join(' ').toLowerCase().includes(w)));
    $('paper-list').innerHTML=`<p class="part-note">Showing ${Math.min(limit,papers.length)} of ${papers.length} papers</p>`+papers.slice(0,limit).map(p=>`<div class="paper-row"><a href="${sourceUrl(p.source)}" target="_blank" rel="noopener">${escape(p.source.course.replaceAll('-',' '))} ${escape(p.source.level)} · ${escape(p.source.session)} ${p.source.year} · P${p.source.paper} · ${escape(p.source.timezone)}</a><span>${p.issue?escape(p.issue):p.searchable_count+' entries with topic matches'}</span></div>`).join('')+(papers.length>limit?'<button type="button" class="answer-button" id="more-papers">Show 50 more papers</button>':'');
    $('more-papers')?.addEventListener('click',()=>{limit+=50;draw();});
  }
  $('archive-browser').addEventListener('toggle',()=>{if($('archive-browser').open && !$('paper-list').innerHTML)draw();});
  $('paper-keyword').addEventListener('input',()=>{limit=50;draw();});draw();
}

function questionCard(result, index) {
  const {question:q, targets, prerequisites} = result;
  if(!isReviewed(q))return provisionalCard(result,index);
  const calculator = {required:'Calculator required',prohibited:'No calculator',permitted:'Calculator allowed',unverified:'Calculator condition unverified'}[q.source.calculator];
  const sourceCourse = q.source.course.replaceAll('-',' ') + ' ' + q.source.level;
  const partial = applied.course !== 'all' && q.course_suitability[applied.course]?.status === 'partial';
  const images = q.question_assets.map((a,i)=>`<figure class="question-page"><img src="${assetUrl(a.path)}" alt="${escape(q.trial_label)} original question${q.question_assets.length>1?', page '+(i+1):''}" loading="${index===0?'eager':'lazy'}" decoding="async" width="${Math.round(a.crop_pdf_points_top_left[2]*2)}" height="${Math.round(a.crop_pdf_points_top_left[3]*2)}"><figcaption>Original paper · PDF page ${a.pdf_page}</figcaption></figure>`).join('');
  return `<article class="question-card" id="question-${escape(q.trial_label)}"><div class="question-head"><div class="question-meta"><span class="question-number">${escape(q.trial_label)}</span><span>${escape(sourceCourse)}${q.source.syllabus==='legacy'?' · Legacy':''}</span><span>·</span><span>${escape(q.source.session)} ${q.source.year} · Paper ${q.source.paper} · Q${q.question_number}</span></div><h3>${escape(q.title)}</h3><div class="question-labels"><span class="badge verified">Reviewed</span><span class="badge">${q.marks} marks in full question</span><span class="badge ${q.practice_type}">${q.practice_type==='focused'?'Functions only':'Mixed topics'}</span><span class="badge">${escape(calculator)}</span>${partial?'<span class="badge">Selected parts fit your course</span>':''}</div></div><div class="matched-parts"><strong>Practise ${targets.map(partLabel).join(', ')}</strong>${prerequisites.length?`<span>Start with ${prerequisites.map(partLabel).join(', ')}.</span>`:'<span>No earlier parts needed beyond the selection.</span>'}</div>${images}<div class="question-bottom"><div class="question-links">${q.markscheme?`<button type="button" class="answer-button" data-answer="${index}" aria-expanded="false" aria-controls="answer-${escape(q.trial_label)}">Show answer</button>`:'<span class="answer-unavailable">Official answer unavailable</span>'}<a class="source-link" href="${sourceUrl(q.source,q.content_pages[0])}" target="_blank" rel="noopener">Open original paper ↗</a></div><details class="part-details"><summary>Skills, marks &amp; parts to work on</summary>${partsTable(result)}${methodNote(q)}${q.editorial_note?`<p class="part-note">${escape(q.editorial_note)}</p>`:''}</details>${q.source_issues.map(note=>`<p class="source-note">${escape(note)}</p>`).join('')}${q.markscheme?`<section class="answer-panel" id="answer-${escape(q.trial_label)}" hidden aria-label="Answer for ${escape(q.trial_label)}"></section>`:''}</div></article>`;
}

function partsTable({question:q,targets}) {
  const eligible = applied.course==='all'?q.parts.map(p=>p.label):(q.course_suitability[applied.course]?.eligible_parts ?? q.parts.map(p=>p.label));
  return `<div class="part-table-wrap"><table class="part-table"><thead><tr><th>Part</th><th>What it practises</th><th>Needs</th><th>Marks</th></tr></thead><tbody>${q.parts.map(p=>`<tr class="${targets.includes(p.label)?'target-row':''}"><td>${partLabel(p.label)}${!eligible.includes(p.label)?'<div class="secondary">Outside this course</div>':targets.includes(p.label)?'<div class="secondary">Selected</div>':''}</td><td><span class="skill-name">${escape(skills[p.main_skill_id].name)}</span>${p.other_assessed_skill_ids.map(s=>`<div class="secondary">Also: ${escape(skills[s].name)}</div>`).join('')}${p.prerequisite_skill_ids.length?`<div class="secondary">Supporting: ${p.prerequisite_skill_ids.map(s=>escape(skills[s].name)).join('; ')}</div>`:''}</td><td>${p.depends_on.map(partLabel).join(', ')||'—'}</td><td>${p.marks??'Grouped'}</td></tr>`).join('')}</tbody></table></div>${Object.keys(q.mark_groups).length?`<p class="part-note">Combined marks: ${Object.entries(q.mark_groups).map(([label,g])=>partLabel(label)+' '+g.marks+' marks').join('; ')}. The original paper does not allocate these to individual subparts.</p>`:''}`;
}
function methodNote(q) {
  if(applied.course==='all')return '';
  const exception=q.course_suitability[applied.course]?.method_exception;
  return exception?`<p class="part-note"><strong>${escape(labels[applied.course])} method:</strong> ${escape(exception.reason)}</p>`:'';
}
function applySearch({scroll=false}={}) {
  applied=currentFilters();renderedResults=findQuestions(data,applied);shown=0;
  const total=renderedResults.length, verified=renderedResults.filter(r=>isReviewed(r.question)).length;
  $('result-count').textContent=total.toLocaleString()+' '+(total===1?'question entry':'question entries');
  $('result-description').textContent=total?`${verified} reviewed · ${(total-verified).toLocaleString()} provisional · ${labels[applied.course]}`:'Adjust your selection to build a practice set.';
  $('active-filters').innerHTML=filterChips(applied);
  $('course-note').textContent=applied.course==='all'?'Reviewed entries show assessed skills and suitable parts. Provisional entries show suggested subtopics; their skills and suitability still need review.':'Reviewed entries match suitable parts for your course. Provisional entries are filtered by their original course; mathematical suitability is unverified.';
  $('question-list').innerHTML=total?'':`<div class="empty-state"><h3>${applied.subtopics.length?'No matching questions':'Choose a topic to begin'}</h3><p>Choose another subtopic or course, clear the keyword, or include provisional questions.</p><button type="button" class="answer-button" id="empty-reset">Show all topics</button></div>`;
  $('empty-reset')?.addEventListener('click',reset);
  showMore();
  $('announcer').textContent=total+' question entries found. '+verified+' reviewed.';
  markPending();
  navigate('#practice');
}
function showMore() {
  const end=Math.min(shown+12,renderedResults.length);
  $('question-list').insertAdjacentHTML('beforeend',renderedResults.slice(shown,end).map((r,i)=>questionCard(r,shown+i)).join(''));
  shown=end;
  $('shown-count').textContent=shown?`Showing ${shown.toLocaleString()} of ${renderedResults.length.toLocaleString()} entries` : '';
  $('load-more').hidden=shown>=renderedResults.length;
}
function toggleAnswer(button) {
  const q=renderedResults[Number(button.dataset.answer)].question;
  const panel=$('answer-'+q.trial_label);
  if(!isReviewed(q)) {
    if(!panel.innerHTML)panel.innerHTML=`<h4>Possible matching mark scheme</h4><p class="part-note">The paper details match. The answer section for question ${q.question_number} has not been verified.</p><a class="source-link" href="${sourceUrl(q.markscheme.source)}" target="_blank" rel="noopener">Open mark-scheme paper ↗</a>`;
    panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));button.textContent=panel.hidden?'View possible mark scheme':'Hide mark scheme';return;
  }
  if(!panel.innerHTML)panel.innerHTML=`<h4>Official mark scheme</h4><a class="source-link" href="${sourceUrl(q.markscheme.source,q.markscheme.pages[0])}" target="_blank" rel="noopener">Open original mark scheme ↗</a>${q.markscheme.assets.map(a=>`<p class="answer-page-label">PDF page ${a.pdf_page}</p><img src="${assetUrl(a.path)}" alt="${escape(q.trial_label)} official mark scheme, PDF page ${a.pdf_page}" loading="lazy" decoding="async">`).join('')}`;
  panel.hidden=!panel.hidden;
  button.setAttribute('aria-expanded',String(!panel.hidden));
  button.textContent=panel.hidden?'Show answer':'Hide answer';
}
function reset() {
  $('course').value='all';$('keyword').value='';$('review').value='all';
  selected=new Set();
  renderTopics();markPending();navigate('#choose',false);
}

function registerPracticeTools() {
  const context=document.modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  const tools=[{
    name:'list_practice_topics',title:'List practice topics',
    description:'List topic and subtopic IDs and available question-entry counts for each course. Does not change the page.',
    inputSchema:{type:'object',properties:{},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:false},
    execute(input) {
      if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).length)throw new Error('Expected an empty object.');
      return {courses:Object.keys(labels),topics:data.topics,subtopics:data.subtopics.map(s=>({id:s.id,name:s.name,topic_id:s.topic_id,counts:Object.fromEntries(Object.keys(labels).map(c=>[c,availableQuestions(data.questions,skills,s.id,c)]))}))};
    }
  },{
    name:'search_practice_questions',title:'Search practice questions',
    description:'Select a course and one or more subtopics, run the search, and update the visible questions. Matches any selected subtopic and preserves prerequisite parts.',
    inputSchema:{type:'object',properties:{course:{type:'string',enum:Object.keys(labels)},subtopics:{type:'array',items:{type:'string'},uniqueItems:true,maxItems:data.subtopics.length},keyword:{type:'string',maxLength:200}},required:['course','subtopics'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input) {
      if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(k=>!['course','subtopics','keyword'].includes(k)) || !Object.hasOwn(labels,input.course) || !Array.isArray(input.subtopics) || input.subtopics.length>data.subtopics.length || new Set(input.subtopics).size!==input.subtopics.length || input.subtopics.some(id=>!data.subtopics.some(s=>s.id===id)) || (input.keyword!==undefined && (typeof input.keyword!=='string' || input.keyword.length>200)))throw new Error('Use a supported course and valid subtopic IDs, with an optional keyword of up to 200 characters.');
      $('course').value=input.course;$('review').value='all';$('keyword').value=input.keyword??'';selected=new Set(input.subtopics);
      renderTopics();applySearch();
      return {count:renderedResults.length,questions:renderedResults.slice(0,50).map(r=>({id:r.question.id,label:r.question.trial_label,title:r.question.title,target_parts:r.targets,prerequisite_parts:r.prerequisites,review_status:isReviewed(r.question)?'verified':'provisional',answer_status:r.question.markscheme?.status??'not-located'}))};
    }
  }];
  for(const tool of tools) {
    try { Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{}); }
    catch { /* Optional browser capability: the visible controls remain available. */ }
  }
}

async function init() {
  const response=await fetch('./library.json');
  if(!response.ok)throw new Error('The question collection could not be loaded.');
  data=await response.json();skills=Object.fromEntries(data.skills.map(s=>[s.id,s]));
  $('search-button').disabled=false;
  selected=new Set();renderTopics();markPending();
  initArchive();
  applyTopicRoute();showRoute(false);
  $('load-more').addEventListener('click',showMore);
  $('question-list').addEventListener('click',event=>{const button=event.target.closest('[data-answer]');if(button)toggleAnswer(button);});
  $('review').addEventListener('change',()=>{renderTopics();markPending();});
  $('all-topics').addEventListener('click',()=>{selected=new Set(data.subtopics.map(s=>s.id));renderTopics();markPending();});
  $('search-form').addEventListener('submit',event=>{event.preventDefault();applySearch({scroll:true});});
  $('course').addEventListener('change',()=>{renderTopics();markPending();});
  $('keyword').addEventListener('input',markPending);
  $('clear-topics').addEventListener('click',()=>{selected.clear();renderTopics();markPending();});
  $('reset').addEventListener('click',reset);
  registerPracticeTools();
}
export const ready=init().catch(error=>{
  $('load-error').hidden=false;navigate('#choose',false);
  $('result-description').textContent='The collection is temporarily unavailable.';
  $('question-list').innerHTML=`<div class="empty-state"><h3>Unable to load the questions</h3><p>${escape(error.message)} Refresh the page to try again.</p><button type="button" class="answer-button" id="retry">Try again</button></div>`;
  $('retry').addEventListener('click',()=>location.reload());
});

function navigate(hash,focus=true){if(location.hash!==hash)history.pushState(null,'',hash);showRoute(focus);}
function showRoute(focus=true){const name=location.hash.slice(1).split('?')[0];let page=({home:'home',notes:'notes',choose:'selection',papers:'papers',practice:'practice'})[name]||'home';if(page==='practice'&&!applied)page='selection';for(const p of ['home','notes','selection','practice','papers'])$(p+'-view').hidden=p!==page;window.dispatchEvent(new CustomEvent('neumeris:subject-view',{detail:page==='selection'?'choose':page}));if(focus){window.scrollTo(0,0);$(page==='practice'?'results':page+'-title')?.focus({preventScroll:true});}}
function applyTopicRoute(){if(!data)return;const topic=new URLSearchParams(location.hash.split('?')[1]||'').get('topic');if(topic&&data.topics.some(t=>t.id===topic)){selected=new Set(data.subtopics.filter(s=>s.topic_id===topic).map(s=>s.id));renderTopics();markPending();document.querySelector('[data-topic="'+CSS.escape(topic)+'"]')?.setAttribute('open','');}}
addEventListener('hashchange',()=>{applyTopicRoute();showRoute();});addEventListener('popstate',()=>showRoute());
