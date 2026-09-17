import {revealView,revealItems,setExperience} from './motion.js';
const $=id=>document.getElementById(id);
const icons={subjects:'<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',book:'<path d="M12 5v16m0-16C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-6-2-10 1Z"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m16 8 6-6m-4 0h4v4"/>',paper:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 8h7M9 12h7M9 16h4M2 6v13a5 5 0 0 0 5 5"/>',maths:'<path d="M19 4H5l8 8-8 8h14M19 4v3m0 10v3"/>'};
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=`<svg class="n-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[el.dataset.icon]||icons.grid}</svg>`);
let bankPromise,current='';
function updateChrome(page){
 const view=page==='choose'?'selection':page;
 const changed=current!==page;current=page;
 document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(page==='practice'?'choose':page))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const name=({home:document.body.dataset.subject,notes:'Study notes',choose:'Practice Studio',practice:'Practice Studio',papers:'Exam Archive'})[page];
 $('view-label').textContent=name;document.title=name+' · '+(page==='home'?'Neumeris':document.body.dataset.subject+' · Neumeris');
 setExperience(page);if(changed&&$(view+'-view')){revealView($(view+'-view'));revealItems($(view+'-view'));}
}
async function route(){
 const requested=location.hash.slice(1).split('?')[0];
 const page=['home','notes','choose','practice','papers'].includes(requested)?requested:'home';
 // Once loaded, each collection owns its practice state and restores it on navigation.
 if(bankPromise){if(page==='home'||page==='notes'){for(const p of ['home','notes','selection','practice','papers'])$(p+'-view').hidden=p!==page;updateChrome(page);}return;}
 const view=page==='choose'||page==='practice'?'selection':page;
 for(const p of ['home','notes','selection','practice','papers'])$(p+'-view').hidden=p!==view;
 updateChrome(page==='practice'?'choose':page);
 if(['choose','practice','papers'].includes(page)){
  bankPromise=import(new URL('app.js',location.href)).then(async app=>{await app.ready;});
  try{await bankPromise;}catch{bankPromise=null;const box=$('load-error');if(box){box.hidden=false;$('selection-view').hidden=false;$('papers-view').hidden=true;}updateChrome('choose');}
 }
}
addEventListener('neumeris:subject-view',e=>updateChrome(e.detail));
addEventListener('hashchange',()=>{route();window.scrollTo(0,0);});
addEventListener('popstate',route);
route();
