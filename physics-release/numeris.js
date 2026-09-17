import {motionEnabled,revealView,revealItems,setExperience} from './motion.js';
import {createUniverse} from './universe.js';
const $=id=>document.getElementById(id);
const icons={grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',book:'<path d="M12 5v16m0-16C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-6-2-10 1Z"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m16 8 6-6m-4 0h4v4"/>',paper:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 8h7M9 12h7M9 16h4M2 6v13a5 5 0 0 0 5 5"/>',atom:'<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4"/><circle cx="12" cy="12" r="1"/>'};
export const icon=name=>`<svg class="n-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.atom}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));

let entering=false,bankPromise,viewsPromise,currentPage='',routeSerial=0;
const sky=createUniverse($('starfield'),{isEnabled:motionEnabled,isVisible:()=>!$('portal').hidden,isEntering:()=>entering});
window.addEventListener('neumeris:motion-change',()=>sky.start());
function enter(){
 if(entering)return;entering=true;$('enter-numeris').disabled=true;$('observatory').hidden=false;$('observatory').inert=true;$('portal').classList.add('launching');
 if(!location.hash)history.replaceState(null,'','#subjects');
 setTimeout(()=>{entering=false;$('portal').hidden=true;$('portal').classList.remove('launching');$('enter-numeris').disabled=false;$('observatory').inert=false;sky.stop();currentPage='';route();$('subjects-title').focus({preventScroll:true});},motionEnabled()?1050:0);
}
$('enter-numeris').addEventListener('click',enter);
$('replay-entrance').addEventListener('click',()=>{history.pushState(null,'',location.pathname);currentPage='';setExperience('entrance');$('observatory').hidden=true;$('portal').hidden=false;document.title='Neumeris · A universe of understanding';$('enter-numeris').focus();sky.start();});
async function route(){
 const ticket=++routeSerial,hash=location.hash.slice(1),part=hash.split('?')[0],isBank=['choose','practice'].includes(part),page=part==='subjects'?'subjects':part==='notes'?'notes':part==='papers'?'papers':isBank?'bank':'home';
 if(!hash&&!new URLSearchParams(location.search).has('topic')){$('portal').hidden=false;$('observatory').hidden=true;currentPage='';setExperience('entrance');sky.start();return;}
 if(!entering){$('portal').hidden=true;$('observatory').hidden=false;sky.stop();}
 const changed=currentPage!==page;currentPage=page;setExperience(isBank?part:page);
 for(const p of ['subjects','home','notes','papers','bank'])$(p+'-view').hidden=p!==page;
 document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(isBank?'choose':page))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('view-label').textContent=({subjects:'Your subjects',home:'Physics',notes:'Discovery Lab',papers:'Exam Archive',bank:'Practice Studio'})[page];
 document.title=({subjects:'Explore your subjects',home:'Your physics observatory',notes:'The Discovery Lab',papers:'The Exam Archive',bank:'The Practice Studio'})[page]+' · Neumeris';
 if(changed)revealView($(page+'-view'));
 if(['home','subjects'].includes(page)&&changed)revealItems($(page+'-view'));
 if(isBank){bankPromise??=import('./app.js');try{const bank=await bankPromise;await bank.ready;if(ticket===routeSerial)window.dispatchEvent(new Event('numeris:topic-route'));}catch{$('load-error').hidden=false;$('error-message').textContent='The practice studio could not load. Please refresh to try again.';}}
 if(page==='notes'||page==='papers'){viewsPromise??=import('./numeris-views.js');try{const views=await viewsPromise;await views.show(page);if(ticket===routeSerial)revealItems($(page+'-view'));}catch{$(page+'-content').innerHTML='<div class="n-error">This collection could not load. <button class="n-button" onclick="location.reload()">Try again</button></div>';}}
}
window.addEventListener('hashchange',()=>{route();window.scrollTo({top:0,behavior:'instant'});});
window.addEventListener('popstate',route);
window.addEventListener('numeris:practice-view',route);
if(new URLSearchParams(location.search).has('topic')&&!location.hash)history.replaceState(null,'','#choose');
if(location.hash)route();
