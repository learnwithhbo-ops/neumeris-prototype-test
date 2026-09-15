import {findQuestions, availableQuestions} from './focused-search.js';
import {createPracticeLoader} from './practice-loader.js';
import {focusedCard, escape} from './focused-render.js';
import {progressPosition, practiceView} from './practice-state.js';
import {revealView,updateQuestionDepth,toggleHelp,motionEnabled,setExperience,signalChange} from './motion.js';
const $=id=>document.getElementById(id);
const labels={all:'SL & HL','Physics-SL':'Standard level','Physics-HL':'Higher level'};
let data,selected=new Set(),results=[],shown=0,view='selection',cards=[],slots=[],frame=0;
let activeQuestion=0,cardObserver;
let countCache=new Map(),countKey='',selectionScroll=0,practiceScroll=0;
const loader=createPracticeLoader();
let practiceData,loading=false,searchReady=false,keywordTicket=0,loadTicket=0;
const filters=()=>({course:$('course').value,format:$('format').value,collection:$('collection').value,yearFrom:$('year-from').value,yearTo:$('year-to').value,keyword:$('keyword').value.trim(),subtopics:[...selected].sort(),review:'verified'});
function countTopics(){
  const f=filters(),key=JSON.stringify({...f,subtopics:[],keyword:''});
  if(key!==countKey){countKey=key;countCache=new Map(data.subtopics.map(s=>[s.id,availableQuestions(data.questions,{},s.id,f.course,'verified',f)]));}
}
function updateSelection(){
  const f=filters(),invalid=f.collection!=='supplementary'&&f.yearFrom&&f.yearTo&&Number(f.yearFrom)>Number(f.yearTo);
  const count=invalid?0:findQuestions(data,f).length;
  $('year-fields').disabled=f.collection==='supplementary';
  const previousCount=$('selection-count').textContent;
  $('selection-count').textContent=count.toLocaleString()+' '+(count===1?'question':'questions')+' ready';
  $('selection-note').textContent=invalid?'Choose an end year after the start year.':!selected.size?'Choose one or more topics.':!count?'Try another topic or a wider year range.':selected.size+' '+(selected.size===1?'topic':'topics')+' selected';
  $('search-button').disabled=!count||loading||Boolean(f.keyword&&!searchReady);
  $('selected-topics').innerHTML=data.subtopics.filter(s=>selected.has(s.id)).map(s=>`<button type="button" class="selected-topic" data-remove-topic="${escape(s.id)}" aria-label="Remove ${escape(s.name)}">${escape(s.name)} <span aria-hidden="true">×</span></button>`).join('');
  $('study-selected').hidden=!selected.has('B.2');
  if(previousCount!==$('selection-count').textContent)signalChange($('selection-count'));
}
function renderTopics(){
  countTopics();
  const focused=document.activeElement,focusSubtopic=focused?.name==='subtopic'?focused.value:null,focusParent=focused?.dataset?.parent;
  const firstRender=!$('topic-tree').dataset.initialized;
  const open=[...document.querySelectorAll('.topic-group[open]')].map(el=>el.dataset.topic);
  $('topic-tree').innerHTML=data.topics.map(topic=>{
    const rows=data.subtopics.filter(s=>s.topic_id===topic.id).map(s=>({...s,count:countCache.get(s.id)}));
    const count=findQuestions(data,{...filters(),keyword:'',subtopics:rows.map(s=>s.id)}).length;
    const available=rows.filter(s=>s.count>0),checked=available.length&&available.every(s=>selected.has(s.id));
    const expanded=open.includes(topic.id)||(firstRender&&(rows.some(s=>selected.has(s.id))||topic.id===data.topics[0].id));
    return `<details class="topic-group" data-topic="${escape(topic.id)}" ${expanded?'open':''}><summary><label class="topic-label"><input type="checkbox" data-parent="${escape(topic.id)}" ${checked?'checked':''} ${!count?'disabled':''} aria-label="Select all ${escape(topic.name)} topics"><span>${escape(topic.name)}</span></label><span class="topic-count">${count}</span></summary><div class="subtopics">${rows.map(s=>`<label class="subtopic-label ${s.count?'':'empty'}"><input type="checkbox" name="subtopic" value="${escape(s.id)}" ${selected.has(s.id)?'checked':''} ${!s.count&&!selected.has(s.id)?'disabled':''}><span class="subtopic-name">${escape(s.name)}${s.hl_only?'<small class="hl-only">HL</small>':''}</span><span class="sub-count" aria-label="${s.count} questions">${s.count}</span></label>`).join('')}${!count?'<p class="no-questions-note">No questions match these choices.</p>':''}</div></details>`;
  }).join('');
  document.querySelectorAll('[data-parent]').forEach(input=>{
    const available=data.subtopics.filter(s=>s.topic_id===input.dataset.parent&&countCache.get(s.id)>0);
    input.indeterminate=available.some(s=>selected.has(s.id))&&!available.every(s=>selected.has(s.id));
    input.closest('label').addEventListener('click',event=>event.stopPropagation());
    input.addEventListener('change',()=>{available.forEach(s=>input.checked?selected.add(s.id):selected.delete(s.id));renderTopics();updateSelection();});
  });
  document.querySelectorAll('[name=subtopic]').forEach(input=>input.addEventListener('change',()=>{input.checked?selected.add(input.value):selected.delete(input.value);renderTopics();updateSelection();}));
  $('topic-tree').dataset.initialized='true';
  filterTopicNames();
  if(focusSubtopic)document.querySelector(`[name=subtopic][value="${CSS.escape(focusSubtopic)}"]`)?.focus({preventScroll:true});
  if(focusParent)document.querySelector(`[data-parent="${CSS.escape(focusParent)}"]`)?.focus({preventScroll:true});
}
function filterTopicNames(){
  const query=$('topic-search').value.toLocaleLowerCase().trim();let visible=0;
  for(const group of document.querySelectorAll('.topic-group')){
    let matches=0;for(const row of group.querySelectorAll('.subtopic-label')){row.hidden=Boolean(query&&!row.textContent.toLocaleLowerCase().includes(query)&&!group.querySelector('.topic-label').textContent.toLocaleLowerCase().includes(query));if(!row.hidden)matches++;}
    group.hidden=!matches;if(query&&matches)group.open=true;visible+=matches;
  }
  $('topic-empty').hidden=visible>0;
}
function updateProgress(){
  frame=0;if(view!=='practice'||$('bank-view')?.hidden)return;
  const readingLine=document.querySelector('.practice-toolbar').offsetHeight+24;
  activeQuestion=updateQuestionDepth(slots,readingLine);
  const {current,total,remaining}=motionEnabled()?{current:activeQuestion+1,total:results.length,remaining:results.length-activeQuestion-1}:progressPosition(slots.map(c=>c.getBoundingClientRect().top),results.length,readingLine);
  if(!motionEnabled())activeQuestion=current-1;
  $('previous-question').disabled=activeQuestion===0;$('next-question').disabled=activeQuestion>=results.length-1;
  $('progress-label').textContent=`Question ${current} of ${total}`;
  $('remaining-label').textContent=`${remaining} remaining`;
  $('practice-progress').max=total||1;$('practice-progress').value=current;
  $('practice-progress').setAttribute('aria-valuetext',`Question ${current} of ${total}`);

}
function scheduleProgress(){if(!frame)frame=requestAnimationFrame(updateProgress);}
function showMore(){
  const end=Math.min(shown+12,results.length);
  $('question-list').insertAdjacentHTML('beforeend',results.slice(shown,end).map((r,i)=>`<div class="question-slot">${focusedCard(r,shown+i,practiceData)}</div>`).join(''));
  shown=end;cards=[...document.querySelectorAll('.question-card')];
  slots=[...$('question-list').querySelectorAll('.question-slot')];
  cardObserver?.disconnect();if(window.ResizeObserver){cardObserver=new ResizeObserver(scheduleProgress);cards.forEach(card=>cardObserver.observe(card));}
  $('load-more').hidden=shown>=results.length;$('set-end').hidden=shown<results.length;
  scheduleProgress();
}
function showView(next,{focus=true}={}){
  const changed=view!==next;
  if(view!==next){if(view==='selection')selectionScroll=scrollY;else practiceScroll=scrollY;}
  view=next;setExperience(next==='practice'?'practice':'choose');$('selection-view').hidden=next!=='selection';$('practice-view').hidden=next!=='practice';
  if(!$('bank-view')?.hidden)document.title=next==='practice'?'Your practice · Neumeris':'The Practice Studio · Neumeris';
  window.scrollTo({top:next==='practice'?practiceScroll:selectionScroll,behavior:'instant'});
  if(focus)$(next==='practice'?'practice-title':'selection-title').focus({preventScroll:true});
  if(changed)revealView($(next==='practice'?'practice-view':'selection-view'));
  scheduleProgress();
}
async function startPractice(){
  if(loading)return;
  const applied=filters(),matches=findQuestions(data,applied);if(!matches.length)return;
  const ticket=++loadTicket;loading=true;$('search-button').disabled=true;$('load-error').hidden=true;$('search-form').setAttribute('aria-busy','true');
  $('search-button').textContent='Opening your questions…';
  try{
  const loaded=await loader.questions(matches,(done,total)=>{$('selection-note').textContent=`Opening your questions · ${done} of ${total} packs`;});
  if(ticket!==loadTicket||!location.hash.startsWith('#choose'))return;
  results=loaded.results;practiceData=loaded.data;
  shown=0;practiceScroll=0;$('question-list').innerHTML='';
  const names=data.subtopics.filter(s=>selected.has(s.id)).map(s=>s.name);
  $('practice-selection').textContent=names.length<=3?names.join(' · '):`${names.length} topics · ${results.length.toLocaleString()} questions`;
  showMore();
  if(location.hash!=='#practice')history.pushState(null,'','#practice');
  showView('practice');window.dispatchEvent(new Event('numeris:practice-view'));$('announcer').textContent=`Your practice set contains ${results.length} questions.`;
  }catch(error){$('load-error').hidden=false;$('error-message').textContent=error.message;$('announcer').textContent=error.message;}
  finally{loading=false;$('search-form').removeAttribute('aria-busy');$('search-button').innerHTML='Start practice <span aria-hidden="true">→</span>';updateSelection();}
}
function reset(){
  for(const id of ['course','format','collection'])$(id).value='all';
  for(const id of ['keyword','year-from','year-to','topic-search'])$(id).value='';
  const topic=new URLSearchParams(location.search).get('topic');
  selected=new Set(topic&&data.subtopics.some(s=>s.id===topic)?[topic]:[]);
  renderTopics();updateSelection();
}
let appliedRoute='';
function applyTopicRoute(){
  if(!data||!location.hash.startsWith('#choose?')||appliedRoute===location.hash)return;
  appliedRoute=location.hash;
  const params=new URLSearchParams(location.hash.split('?')[1]),theme=params.get('theme'),topic=params.get('topic');
  const matches=data.subtopics.filter(s=>s.topic_id===theme||s.id===topic);
  if(!matches.length)return;
  selected=new Set(matches.map(s=>s.id));renderTopics();updateSelection();
  for(const group of document.querySelectorAll('.topic-group'))group.open=matches.some(s=>s.topic_id===group.dataset.topic);
}
function registerPracticeTools(){
  if(!document.modelContext?.registerTool)return;
  const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  const tools=[{
    name:'list_practice_topics',title:'List practice topics',description:'List available Physics topics and question counts.',
    inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},
    execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object.');return {courses:Object.keys(labels),topics:data.topics,subtopics:data.subtopics.map(s=>({id:s.id,name:s.name,counts:Object.fromEntries(Object.keys(labels).map(c=>[c,availableQuestions(data.questions,{},s.id,c)]))}))};}
  },{
    name:'search_practice_questions',title:'Start Physics practice',description:'Choose topics, level, question type and exam years, then open a practice set.',
    inputSchema:{type:'object',properties:{course:{type:'string',enum:Object.keys(labels)},subtopics:{type:'array',items:{type:'string'},uniqueItems:true,maxItems:data.subtopics.length},keyword:{type:'string',maxLength:200},format:{type:'string',enum:['all','mcq','written']},collection:{type:'string',enum:['all','past','supplementary']},yearFrom:{type:'integer',minimum:1900,maximum:2100},yearTo:{type:'integer',minimum:1900,maximum:2100}},required:['course','subtopics'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
    async execute(input){
      if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['course','subtopics','keyword','format','collection','yearFrom','yearTo'].includes(k))||!Object.hasOwn(labels,input.course)||!Array.isArray(input.subtopics)||input.subtopics.length>data.subtopics.length||new Set(input.subtopics).size!==input.subtopics.length||input.subtopics.some(id=>!data.subtopics.some(s=>s.id===id))||(input.keyword!==undefined&&(typeof input.keyword!=='string'||input.keyword.length>200))||(input.format!==undefined&&!['all','mcq','written'].includes(input.format))||(input.collection!==undefined&&!['all','past','supplementary'].includes(input.collection)))throw new Error('Use supported levels, question types and topic IDs.');
      for(const key of ['yearFrom','yearTo'])if(input[key]!==undefined&&(!Number.isInteger(input[key])||input[key]<1900||input[key]>2100))throw new Error('Use a valid exam year.');
      if(input.yearFrom&&input.yearTo&&input.yearFrom>input.yearTo)throw new Error('End year must follow start year.');
      $('course').value=input.course;$('format').value=input.format??'all';$('collection').value=input.collection??'all';$('keyword').value=input.keyword??'';selected=new Set(input.subtopics);
      for(const [id,key] of [['year-from','yearFrom'],['year-to','yearTo']]){if(input[key]!==undefined&&!Array.from($(id).options).some(o=>o.value===String(input[key])))$(id).add(new Option(String(input[key]),String(input[key])));$(id).value=input[key]??'';}
      if(input.keyword){await loader.search();searchReady=true;}
      renderTopics();updateSelection();const matches=findQuestions(data,filters());
      if(!location.hash.startsWith('#choose')){history.pushState(null,'','#choose');showView('selection');}
      if(matches.length)await startPractice();else{history.pushState(null,'','#choose');showView('selection');}
      return {count:matches.length,questions:matches.slice(0,50).map(r=>({id:r.question.id,target_parts:r.targets}))};
    }
  }];
  for(const tool of tools)try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
}
async function init(){
  data=await loader.menu();
  const years=[...new Set(data.questions.filter(q=>q.source.collection!=='supplementary').map(q=>Number(q.source.year)).filter(y=>y>=1900))].sort((a,b)=>b-a);
  for(const id of ['year-from','year-to'])$(id).insertAdjacentHTML('beforeend',years.map(y=>`<option value="${y}">${y}</option>`).join(''));
  reset();applyTopicRoute();showView('selection',{focus:false});
  if(location.hash==='#practice')history.replaceState(null,'','#choose');
  $('load-more').addEventListener('click',showMore);
  function moveQuestion(step){
    const index=Math.max(0,Math.min(results.length-1,activeQuestion+step));if(index>=shown)showMore();
    const top=slots[index].getBoundingClientRect().top+scrollY-document.querySelector('.practice-toolbar').offsetHeight-24;
    window.scrollTo({top,behavior:motionEnabled()?'smooth':'instant'});
  }
  $('previous-question').addEventListener('click',()=>moveQuestion(-1));$('next-question').addEventListener('click',()=>moveQuestion(1));
  $('all-topics').addEventListener('click',()=>{countTopics();selected=new Set(data.subtopics.filter(s=>countCache.get(s.id)>0).map(s=>s.id));renderTopics();updateSelection();});
  $('clear-topics').addEventListener('click',()=>{selected.clear();renderTopics();updateSelection();});
  $('reset').addEventListener('click',reset);
  $('search-form').addEventListener('submit',event=>{event.preventDefault();if(!$('search-button').disabled)startPractice();});
  for(const id of ['course','format','collection','year-from','year-to'])$(id).addEventListener('change',()=>{renderTopics();updateSelection();});
  $('keyword').addEventListener('input',async()=>{
    const ticket=++keywordTicket;updateSelection();if(!$('keyword').value.trim()||searchReady)return;
    $('selection-note').textContent='Opening keyword search…';
    try{await loader.search();searchReady=true;if(ticket===keywordTicket)updateSelection();}catch(error){if(ticket===keywordTicket){$('selection-note').textContent=error.message;$('search-button').disabled=true;}}
  });
  $('topic-search').addEventListener('input',filterTopicNames);
  $('selected-topics').addEventListener('click',event=>{const button=event.target.closest('[data-remove-topic]');if(button){selected.delete(button.dataset.removeTopic);renderTopics();updateSelection();}});
  $('search-form').addEventListener('change',()=>{if(loading)loadTicket++;});
  $('change-questions').addEventListener('click',()=>{history.pushState(null,'','#choose');showView('selection');});
  window.addEventListener('popstate',()=>{if(/^#(?:choose|practice)/.test(location.hash))showView(practiceView(location.hash,results.length>0));});
  window.addEventListener('hashchange',()=>{if(!/^#(?:choose|practice)/.test(location.hash)){appliedRoute='';return;}applyTopicRoute();const next=practiceView(location.hash,results.length>0);if(next!==view)showView(next);});
  window.addEventListener('numeris:topic-route',applyTopicRoute);
  window.addEventListener('scroll',scheduleProgress,{passive:true});window.addEventListener('resize',scheduleProgress);
  $('question-list').addEventListener('load',scheduleProgress,true);$('question-list').addEventListener('toggle',scheduleProgress,true);
  $('question-list').addEventListener('click',event=>{
    const button=event.target.closest('[data-help-toggle]');if(!button)return;
    const panel=document.getElementById(button.getAttribute('aria-controls'));
    if(!panel||panel.closest('.question-card')!==button.closest('.question-card'))return;
    const slot=button.closest('.question-slot'),line=document.querySelector('.practice-toolbar').offsetHeight+24;
    if(motionEnabled()&&slot.getBoundingClientRect().top>line+24)window.scrollTo({top:slot.getBoundingClientRect().top+scrollY-line,behavior:'smooth'});
    toggleHelp(panel,button);
    scheduleProgress();
  });
  window.addEventListener('neumeris:motion-change',()=>{
    const index=activeQuestion;if(view!=='practice'||$('bank-view').hidden)return;
    requestAnimationFrame(()=>{updateProgress();const slot=slots[index];if(slot)window.scrollTo({top:slot.getBoundingClientRect().top+scrollY-document.querySelector('.practice-toolbar').offsetHeight-24,behavior:'instant'});scheduleProgress();});
  });
  if(window.ResizeObserver)new ResizeObserver(scheduleProgress).observe($('question-list'));
  registerPracticeTools();
}
$('retry').addEventListener('click',()=>data?startPractice():location.reload());
export const ready=init().catch(error=>{$('load-error').hidden=false;$('error-message').textContent=error.message+' Refresh the page to try again.';});
