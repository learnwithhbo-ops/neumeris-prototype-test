import {questionDepth,wheelMetrics,neutralDepth} from './motion-model.js';
import {createAtmosphere} from './atmosphere.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saved=()=>{try{return localStorage.getItem('numeris-motion')}catch{return null}};
let enabled=saved()!=='off'&&!reduced.matches;
const running=new Set(),animations=new WeakMap();
export const motionEnabled=()=>enabled;
function animate(element,keyframes,options={}){
 if(!enabled||!element||element.hidden)return null;
 const animation=element.animate(keyframes,{duration:400,easing:'cubic-bezier(.16,1,.3,1)',...options});
 running.add(animation);animation.finished.catch(()=>{}).finally(()=>running.delete(animation));return animation;
}
function updateControls(){
 document.body.dataset.motion=enabled?'on':'off';
 document.querySelectorAll('[data-motion-toggle]').forEach(b=>{b.disabled=reduced.matches;b.title=reduced.matches?'Your device prefers reduced motion':'';b.textContent=`Motion ${enabled?'on':'off'}`;b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',`${enabled?'Pause':'Enable'} interface motion`);});
}
export function setMotionEnabled(value){
 enabled=Boolean(value)&&!reduced.matches;try{localStorage.setItem('numeris-motion',enabled?'on':'off')}catch{}
 if(!enabled)for(const animation of running)animation.cancel();
 updateControls();atmosphere.refresh();schedulePageScene();window.dispatchEvent(new CustomEvent('neumeris:motion-change',{detail:{enabled}}));
}
export function setExperience(name){document.body.dataset.experience=name;atmosphere.refresh();requestAnimationFrame(()=>{updateNav();schedulePageScene();});}
export function revealView(element,kind){
 if(!element)return;kind??=element.id;
 const frames=kind==='notes-view'?[
  {opacity:0,clipPath:'inset(0 14% 0 0 round 16px)',transform:'translateX(24px)'},{opacity:1,clipPath:'inset(0 0 0 0 round 0px)',transform:'translateX(0)'}
 ]:kind==='papers-view'?[
  {opacity:0,transform:'translateY(32px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}
 ]:kind==='chapter'?[
  {opacity:0,transform:'translateX(36px)',clipPath:'inset(0 0 0 6%)'},{opacity:1,transform:'translateX(0)',clipPath:'inset(0 0 0 0)'}
 ]:kind==='practice-view'?[{opacity:0},{opacity:1}]:[
  {opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}
 ];animate(element,frames,{duration:kind==='chapter'?540:470});
 if(['home-view','notes-view','papers-view','bank-view','selection-view'].includes(element.id))revealItems(element);
}
export function revealItems(element,start=0){
 if(!element)return;
 [...element.querySelectorAll('.journey-card,.topic-tile,.lesson-tile,.paper-tile')].slice(start,start+18).forEach((item,i)=>watchArrival(item,i));
 element.querySelectorAll('.section-heading,.n-stats,.featured-strip,.lab-hero,.lab-next,.archive-intro,.archive-filters,.topic-panel,.options-panel').forEach((item,i)=>watchArrival(item,i));
 schedulePageScene();
}
export function signalChange(element){animate(element,[{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:270});}
export function toggleHelp(panel,button){
 const opening=button.getAttribute('aria-expanded')!=='true';animations.get(panel)?.cancel();button.setAttribute('aria-expanded',String(opening));
 if(!enabled){panel.hidden=!opening;return;}
 panel.hidden=false;const height=panel.getBoundingClientRect().height;panel.style.overflow='hidden';
 const animation=animate(panel,opening?[{height:'0px',opacity:0},{height:height+'px',opacity:1}]:[{height:height+'px',opacity:1},{height:'0px',opacity:0}],{duration:opening?340:220});
 if(!animation){panel.hidden=!opening;panel.style.overflow='';return;}
 animations.set(panel,animation);animation.finished.catch(()=>{}).finally(()=>{if(animations.get(panel)!==animation)return;panel.hidden=button.getAttribute('aria-expanded')!=='true';panel.style.overflow='';});
}
export function updateQuestionDepth(slots,readingLine){
 const rail=document.querySelector('.n-sidebar')?.getBoundingClientRect();
 const viewport=innerHeight-(rail&&rail.top>0&&rail.bottom>=innerHeight-1?rail.height:0);
 // Measure intrinsic content before changing scroll intervals; transforms never feed back into measurements.
 const heights=slots.map(slot=>slot.firstElementChild.offsetHeight);
 for(let i=0;i<slots.length;i++){const m=wheelMetrics(heights[i],viewport,readingLine);const h=m.height.toFixed(2)+'px';if(slots[i].style.getPropertyValue('--wheel-height')!==h)slots[i].style.setProperty('--wheel-height',h);}
 let active=0,best=Infinity;
 for(let i=0;i<slots.length;i++){
  const slot=slots[i],top=slot.getBoundingClientRect().top,p=i===0&&top>=readingLine?{...neutralDepth}:questionDepth(top,heights[i],viewport,readingLine);
  const distance=Math.abs(p.phase);if(distance<best){best=distance;active=i;}
  const values={'scale':p.scale.toFixed(4),'y':p.y.toFixed(2)+'px','opacity':p.opacity.toFixed(3),'visibility':p.visible?'visible':'hidden'};
  for(const [key,value] of Object.entries(values))slot.style.setProperty('--card-'+key,value);
  slot.style.setProperty('--wheel-order',String(Math.round((1-p.depth)*100)+1));slot.dataset.distant=String(p.opacity<.25);slot.inert=enabled&&(p.opacity<.25||!p.visible);
 }
 return active;
}
export function focusSection(target){
 if(!target)return;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:enabled?'smooth':'instant'});
 const section=target.closest('.reading-section,.exam-focus')||target;
 animate(section,[{boxShadow:'inset 3px 0 #416bdd00'},{boxShadow:'inset 3px 0 #416bdd',offset:.35},{boxShadow:'inset 3px 0 #416bdd00'}],{duration:1000});
}
export function openReader(dialog,opener){
 const source=opener.closest('.paper-tile').getBoundingClientRect();
 dialog.showModal();const dest=dialog.getBoundingClientRect();
 animate(dialog,[{opacity:0,transform:`translate(${source.left+source.width/2-dest.left-dest.width/2}px,${source.top+source.height/2-dest.top-dest.height/2}px) scale(.42)`,borderRadius:'22px'},{opacity:1,transform:'translate(0,0) scale(1)',borderRadius:'16px'}],{duration:520});
}
export function closeReader(dialog){
 if(dialog.dataset.closing)return;dialog.dataset.closing='true';
 const a=animate(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(25px) scale(.96)'}],{duration:210});
 const finish=()=>{dialog.close();delete dialog.dataset.closing;};if(a)a.finished.catch(()=>{}).finally(finish);else finish();
}
// Every control responds, while each larger surface has its own transition language.
const nav=document.querySelector('.n-nav');
if(nav){const indicator=document.createElement('span');indicator.className='nav-indicator';indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);}
function updateNav(){const active=nav?.querySelector('[aria-current=page]');if(!active)return;nav.style.setProperty('--nav-y',active.offsetTop+'px');nav.style.setProperty('--nav-x',active.offsetLeft+'px');nav.style.setProperty('--nav-w',active.offsetWidth+'px');nav.style.setProperty('--nav-h',active.offsetHeight+'px');}
addEventListener('resize',updateNav);addEventListener('hashchange',()=>requestAnimationFrame(updateNav));
document.addEventListener('click',event=>{
 const control=event.target.closest('[data-motion-toggle]');if(control){setMotionEnabled(!enabled);return;}
 if(!enabled)return;
 const button=event.target.closest('button,a');if(!button||button.disabled||button.classList.contains('wordmark'))return;
 if(button.matches('.n-nav a,#units a,.reading-contents button'))return;
 const rect=button.getBoundingClientRect(),wave=document.createElement('span'),size=Math.max(rect.width,rect.height)*2;
 wave.className='press-wave';wave.setAttribute('aria-hidden','true');wave.style.setProperty('--wave-size',size+'px');wave.style.setProperty('--wave-x',(event.detail?event.clientX-rect.left:rect.width/2)+'px');wave.style.setProperty('--wave-y',(event.detail?event.clientY-rect.top:rect.height/2)+'px');button.classList.add('press-surface');button.append(wave);wave.addEventListener('animationend',()=>wave.remove(),{once:true});setTimeout(()=>wave.remove(),650);
});
document.addEventListener('click',event=>{
 const summary=event.target.closest('summary');if(!summary||event.target.closest('input,label,a,button')||!enabled)return;
 const details=summary.parentElement;if(details.tagName!=='DETAILS')return;event.preventDefault();
 animations.get(details)?.cancel();const from=details.getBoundingClientRect().height,opening=(details.dataset.motionOpen??String(details.open))!=='true';details.dataset.motionOpen=String(opening);
 if(opening)details.open=true;const to=opening?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
 details.style.overflow='hidden';const a=animate(details,[{height:from+'px'},{height:to+'px'}],{duration:320});
 if(!a){details.open=opening;delete details.dataset.motionOpen;details.style.overflow='';return;}animations.set(details,a);
 a.finished.catch(()=>{}).finally(()=>{if(animations.get(details)!==a)return;details.open=opening;details.style.overflow='';});
});
document.addEventListener('change',event=>{const input=event.target;if(input.matches('select'))signalChange(input);});
reduced.addEventListener('change',event=>{if(event.matches)setMotionEnabled(false);else updateControls();});
updateControls();const atmosphere=createAtmosphere(motionEnabled);

// General pages reveal content when it arrives in view, including results appended later.
// Nothing is hidden while waiting, so reduced motion and keyboard navigation keep normal access.
const arrived=new WeakSet(),arrivalOrder=new WeakMap();
const arrivals=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(!entry.isIntersecting||!entry.target.getClientRects().length)continue;
  const item=entry.target;arrivals.unobserve(item);item.dataset.arrived='true';
  const paper=item.matches('.paper-tile'),lessonTile=item.matches('.lesson-tile'),heading=item.matches('.section-heading'),feature=item.matches('.featured-strip,.lab-next');
  const from=paper?'translateY(38px) rotate(-2deg)':lessonTile?'translateX(28px)':heading?'translateY(12px)':feature?'translateY(26px) scale(.985)':'translateY(32px)';
  animate(item,[{opacity:.12,transform:from},{opacity:1,transform:'translate(0,0) rotate(0) scale(1)'}],{duration:heading?500:650,delay:Math.min((arrivalOrder.get(item)||0)%5*55,220),fill:'backwards'});
 }
},{rootMargin:'0px 0px -28px 0px',threshold:0});
function watchArrival(item,index=0){if(arrived.has(item))return;arrived.add(item);arrivalOrder.set(item,index);arrivals.observe(item);}
const generalProgress=document.createElement('div');generalProgress.className='page-journey-progress';generalProgress.setAttribute('aria-hidden','true');document.body.prepend(generalProgress);
let pageFrame=0;
function schedulePageScene(){if(!pageFrame)pageFrame=requestAnimationFrame(updatePageScene);}
function updatePageScene(){
 pageFrame=0;const experience=document.body.dataset.experience;
 const general=['home','notes','papers','choose'].includes(experience);generalProgress.hidden=!general;if(!general)return;
 const max=Math.max(0,document.documentElement.scrollHeight-innerHeight),fraction=max?Math.min(1,Math.max(0,scrollY/max)):0;
 generalProgress.style.setProperty('--page-progress',String(fraction));
 const sidebar=document.querySelector('.n-sidebar')?.getBoundingClientRect();generalProgress.style.left=(sidebar?.top===0?sidebar.width:0)+'px';
 document.querySelectorAll('.topic-tile,.lesson-tile,.lab-hero,.archive-intro').forEach(surface=>{
  const rect=surface.getBoundingClientRect();if(!rect.width||rect.bottom<0||rect.top>innerHeight)return;
  const drift=enabled?Math.max(-1,Math.min(1,(innerHeight*.5-rect.top-rect.height*.5)/innerHeight))*24:0;
  surface.style.setProperty('--scene-drift',drift.toFixed(2)+'px');
 });
}
addEventListener('scroll',schedulePageScene,{passive:true});addEventListener('resize',schedulePageScene);

// Reading has progressive reveals and a moving margin rule, never the practice-wheel effect.
const lesson=document.getElementById('lesson');
if(lesson){
 setExperience('lesson');const progress=document.createElement('div');progress.className='lesson-progress';progress.setAttribute('aria-hidden','true');document.body.prepend(progress);
 let blocks=[],readFrame=0;
 function updateReading(){readFrame=0;let selected=0;const focus=innerHeight*.3;
  blocks.forEach((block,i)=>{const r=block.getBoundingClientRect();if(r.top<=focus)selected=i;block.style.setProperty('--reading-progress',String(Math.max(0,Math.min(1,(focus-r.top)/r.height))));});
  lesson.querySelectorAll('[data-reading-section]').forEach((button,i)=>{if(i===selected)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  blocks.forEach((block,i)=>block.classList.toggle('reading-active',i===selected));
  const r=lesson.getBoundingClientRect();progress.style.setProperty('--lesson-progress',String(Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-innerHeight)))));
 }
 const schedule=()=>{if(!readFrame)readFrame=requestAnimationFrame(updateReading);};
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;observer.unobserve(el);animate(el,[{opacity:.12,transform:el.matches('.reading-figure')?'translateX(28px)':'translateY(22px)',clipPath:'inset(0 0 4% 0)'},{opacity:1,transform:'translate(0,0)',clipPath:'inset(0 0 0 0)'}],{duration:620});}},{rootMargin:'0px 0px -5% 0px',threshold:0});
 function prepare(){observer.disconnect();blocks=[...lesson.querySelectorAll('.reading-section')];lesson.querySelectorAll('.reading-section,.reading-figure,.reading-check,.worked,.activity,.exam-focus,.reading-experiment').forEach(el=>observer.observe(el));revealView(lesson,'chapter');schedule();}
 new MutationObserver(records=>{if(records.some(r=>r.target===lesson&&r.addedNodes.length))requestAnimationFrame(prepare);for(const r of records)for(const el of r.addedNodes)if(el.nodeType===1&&el.matches('.feedback'))animate(el,[{opacity:0,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'none'}],{duration:420});}).observe(lesson,{childList:true,subtree:true});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);prepare();
}
