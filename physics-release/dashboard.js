import {COURSES,readCourses,saveCourses,readPerformance,samplePerformance} from './dashboard-data.js';
import {ORIGINALS_SETS} from './originals-sets.js';
import {loadBatch,TOPICS} from './originals.js';
import {createTopicWorkspace,topicGroups} from './originals-topics.js';

const node=(document,tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
const percent=value=>value===null?'—':`${value}%`;
const appendLink=(document,parent,text,href,className='n-link')=>{const a=node(document,'a',className,text);a.href=href;parent.append(a);return a;};

export function mountDashboard(host,{document=host.ownerDocument,fetcher=globalThis.fetch,storage}={}) {
  let batches,loading,workspace,selected=readCourses(storage),demo=false,demoSelected,generation=0;
  let courseHost,summaryHost,message,settings,controlsHost,picker;
  const selection=()=>demo?(demoSelected??(selected.length?selected:['ib-physics','ib-maths'])):selected;
  const current=()=>demo?{performance:samplePerformance(batches),warnings:[]}:readPerformance(batches,storage);
  function stat(label,value,note) {const card=node(document,'div','dashboard-stat');card.append(node(document,'p','dashboard-stat-label',label),node(document,'strong','',value),node(document,'p','dashboard-stat-note',note));return card;}
  function bar(parent,label,value,detail,kind) {
    const row=node(document,'div','dashboard-bar-row');
    const caption=node(document,'div','dashboard-bar-caption');caption.append(node(document,'span','',label),node(document,'strong','',percent(value)));
    const track=node(document,'div',`dashboard-track ${kind}`);track.setAttribute('role','img');track.setAttribute('aria-label',`${label}: ${value===null?'no checked answers':percent(value)}. ${detail}`);
    const fill=node(document,'span','dashboard-fill');fill.style.width=`${value??0}%`;track.append(fill);
    row.append(caption,track,node(document,'small','',detail));parent.append(row);
  }
  function refresh() {
    if (!batches || !courseHost) return;
    const {performance,warnings}=current(), chosen=selection();
    summaryHost.replaceChildren();courseHost.replaceChildren();
    const hasPhysics=chosen.includes('ib-physics');
    const p=hasPhysics?performance:{mcq_percentage:null,mcq_checked:0,written_percentage:null,written_checked:0,topics:[]};
    summaryHost.append(stat('MCQ accuracy',percent(p.mcq_percentage),p.mcq_checked?`${p.mcq_checked} checked ${p.mcq_checked===1?'choice':'choices'} · latest answers`:'Check a multiple-choice answer to begin'),stat('Written practice',percent(p.written_percentage),p.written_checked?`${p.written_checked} checked ${p.written_checked===1?'part':'parts'} · marks matched`:'Saved-rubric estimates, not final marks'),stat('Topics explored',String(p.topics.length),chosen.length?`${chosen.length} selected ${chosen.length===1?'course':'courses'}`:'Choose the courses you study'));
    message.textContent=demo?'Sample results — for layout preview only. Your saved answers and course choices are unchanged.':warnings.length?'Some saved results could not be read. They remain untouched; available results are shown.':'Answers save automatically on this device. Your charts update from checked answers.';
    message.className=demo?'dashboard-mode-note sample':'dashboard-mode-note';
    if (!chosen.length) {
      const empty=node(document,'section','dashboard-empty');empty.append(node(document,'span','dashboard-empty-symbol','✦'),node(document,'h2','','Make this space yours.'),node(document,'p','','Choose your courses above. As you practise, your topic performance will appear here.'));courseHost.append(empty);
    }
    for (const course of COURSES.filter(c=>chosen.includes(c.id))) {
      const card=node(document,'section','dashboard-course');card.setAttribute('aria-label',`${course.name} performance`);
      const header=node(document,'div','dashboard-course-heading'), title=node(document,'div','');
      title.append(node(document,'span','dashboard-course-symbol',course.symbol),node(document,'h2','',course.name),node(document,'p','',course.detail));header.append(title);appendLink(document,header,'Practise ↗',course.href);card.append(header);
      if (course.id==='ib-physics') {
        const chart=node(document,'div','dashboard-chart');
        const heading=node(document,'div','dashboard-chart-heading');heading.append(node(document,'h3','','Performance by topic'),node(document,'span','','Latest checked responses'));chart.append(heading);
        if (!performance.topics.length) {
          const empty=node(document,'div','dashboard-chart-empty');empty.append(node(document,'p','','Your first result starts the picture.'),node(document,'p','','Answer and check a question. Unattempted topics are left blank, never counted as zero.'));appendLink(document,empty,'Browse original questions →','#originals');chart.append(empty);
        }
        for (const topic of performance.topics) {
          const row=node(document,'div','dashboard-topic');row.append(node(document,'h4','',TOPICS[topic.id]||topic.id));
          if (topic.mcq_checked) bar(row,'MCQ accuracy',topic.mcq_percentage,`${topic.mcq_correct} correct of ${topic.mcq_checked} checked`, 'exact');
          if (topic.written_checked) bar(row,'Written practice',topic.written_percentage,`${topic.written_score} of ${topic.written_max} rubric marks matched · needs review`, 'practice');
          if (!topic.checked) row.append(node(document,'p','dashboard-unchecked','Answers saved · check them to see a score'));
          chart.append(row);
        }
        chart.append(node(document,'p','dashboard-chart-footnote','Written scores show recognized rubric marks. Unverified points need review and do not mean your answer is wrong.'));card.append(chart);
        const sets=node(document,'div','dashboard-sets');sets.append(node(document,'h3','','Practise by topic'));
        for (const group of topicGroups(batches)) {
          const topic=performance.topics.find(t=>t.id===group.id);
          const row=node(document,'div','dashboard-set'), copy=node(document,'div','');
          copy.append(node(document,'strong','',TOPICS[group.id]),node(document,'p','',topic?.checked?`${topic.checked} checked responses · MCQ ${percent(topic.mcq_percentage)} · written practice ${percent(topic.written_percentage)}`:topic?.attempted?'Answers saved · not checked yet':`${group.questions.length} original questions · ready when you are`));
          row.append(copy);appendLink(document,row,topic?.attempted?'Continue →':'Start →',`#originals?topic=${group.id}`);sets.append(row);
        }
        card.append(sets);
      } else {
        const empty=node(document,'div','dashboard-maths-empty');empty.append(node(document,'span','dashboard-subtle-tag','Performance tracking coming next'),node(document,'h3','','A space for your next breakthrough.'),node(document,'p','','Your topic library is ready. Mathematics does not yet save scored attempts, so no performance percentage is shown.'));appendLink(document,empty,'Explore topic practice →',course.href);card.append(empty);
      }
      courseHost.append(card);
    }
    settings.hidden=demo||!chosen.includes('ib-physics');
  }
  function manage() {
    workspace?.dispose(); controlsHost.replaceChildren();
    workspace=createTopicWorkspace(document,batches,{management:true,storage,topics:TOPICS,onRestore:()=>refresh()});controlsHost.append(workspace.element);
  }
  function render() {
    workspace?.dispose();host.replaceChildren();
    const hero=node(document,'div','dashboard-hero'), copy=node(document,'div','');
    copy.append(node(document,'p','dashboard-eyebrow','YOUR LEARNING SPACE'),node(document,'h1','','Your learning, in focus.'),node(document,'p','dashboard-hero-copy','See your strengths. Find your next step. A clearer picture of the topics you have practised.'));
    const orbit=node(document,'div','dashboard-orbit');orbit.setAttribute('aria-hidden','true');orbit.append(node(document,'span','','n'));hero.append(copy,orbit);host.append(hero);
    const tools=node(document,'div','dashboard-tools');tools.append(node(document,'h2','','Your courses'));
    const sample=node(document,'button','dashboard-text-button',demo?'Show my results':'Preview sample results');sample.type='button';sample.setAttribute('aria-pressed',String(demo));sample.addEventListener('click',()=>{demo=!demo;demoSelected=undefined;render();});tools.append(sample);host.append(tools);
    picker=node(document,'fieldset','dashboard-course-picker');picker.append(node(document,'legend','sr-only','Choose your courses'));
    for (const course of COURSES) {
      const label=node(document,'label','dashboard-course-choice');const input=node(document,'input','');input.type='checkbox';input.value=course.id;input.checked=selection().includes(course.id);input.setAttribute('aria-label',course.name);
      const copy=node(document,'span','');copy.append(node(document,'strong','',course.name),node(document,'small','',course.detail));label.append(input,node(document,'span','dashboard-choice-symbol',course.symbol),copy);
      input.addEventListener('change',()=>{
        const next=[...picker.querySelectorAll('input:checked')].map(i=>i.value);
        if (demo) demoSelected=next;else {selected=next; if(!saveCourses(next,storage)) {refresh();message.textContent='Course choices are available in this tab but could not be saved on this device.';return;}}
        refresh();
      });picker.append(label);
    }
    host.append(picker);message=node(document,'p','dashboard-mode-note');message.setAttribute('role','status');host.append(message);
    summaryHost=node(document,'div','dashboard-stats');host.append(summaryHost);courseHost=node(document,'div','dashboard-courses');host.append(courseHost);
    settings=node(document,'details','dashboard-settings');settings.append(node(document,'summary','','Manage answers and account'));
    const body=node(document,'div','dashboard-settings-body');controlsHost=node(document,'div','');body.append(controlsHost);settings.append(body);host.append(settings);
    refresh();manage();
  }
  async function show() {
    const ticket=++generation;
    if (!batches) {
      host.textContent='Opening your dashboard…';host.setAttribute('aria-busy','true');
      try {loading??=Promise.all(Object.keys(ORIGINALS_SETS).map(id=>loadBatch(fetcher,id)));const result=await loading;if(ticket!==generation)return;batches=result;}
      catch {loading=undefined;host.replaceChildren();const error=node(document,'p','n-error','Your dashboard could not load. Saved answers remain on this device.');error.setAttribute('role','alert');const retry=node(document,'button','n-button','Try again');retry.type='button';retry.addEventListener('click',()=>void show());host.append(error,retry);host.setAttribute('aria-busy','false');return;}
    }
    host.setAttribute('aria-busy','false');render();
  }
  return {show,dispose:()=>{generation++;workspace?.dispose();}};
}
let mounted;
export function show() { mounted??=mountDashboard(globalThis.document.getElementById('dashboard-content'));return mounted.show(); }
