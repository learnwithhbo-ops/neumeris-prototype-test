const $=id=>document.getElementById(id);
const icons={grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',book:'<path d="M12 5v16m0-16C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-6-2-10 1Z"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m16 8 6-6m-4 0h4v4"/>',paper:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 8h7M9 12h7M9 16h4M2 6v13a5 5 0 0 0 5 5"/>',atom:'<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4"/><circle cx="12" cy="12" r="1"/>'};
export const icon=name=>`<svg class="n-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.atom}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let motion=storage.get('numeris-motion')!=='off'&&!reduced.matches,entering=false,bankPromise,viewsPromise;
function setMotion(){document.body.dataset.motion=motion?'on':'off';$('motion-toggle').textContent=`Motion ${motion?'on':'off'}`;$('motion-toggle').setAttribute('aria-pressed',String(motion));}
setMotion();$('motion-toggle').addEventListener('click',()=>{motion=!motion;storage.set('numeris-motion',motion?'on':'off');setMotion();if(!motion)drawSky(performance.now(),true);else startSky();});
reduced.addEventListener('change',event=>{if(event.matches){motion=false;setMotion();drawSky(performance.now(),true);}});
function hidePortal(){entering=false;$('portal').hidden=true;$('portal').classList.remove('launching');$('observatory').hidden=false;route();}
function enter(){if(entering)return;entering=true;$('observatory').hidden=false;$('observatory').inert=true;$('portal').classList.add('launching');if(!location.hash)history.replaceState(null,'','#home');setTimeout(()=>{$('observatory').inert=false;hidePortal();$('home-title').focus({preventScroll:true});},motion?1000:0);}
$('enter-numeris').addEventListener('click',enter);
$('replay-entrance').addEventListener('click',()=>{history.pushState(null,'',location.pathname);$('observatory').hidden=true;$('portal').hidden=false;$('enter-numeris').focus();startSky();});
async function route(){
 const hash=location.hash.slice(1),part=hash.split('?')[0],isBank=['choose','practice'].includes(part),page=part==='notes'?'notes':part==='papers'?'papers':isBank?'bank':'home';
 if(!hash&&!new URLSearchParams(location.search).has('topic')){$('portal').hidden=false;$('observatory').hidden=true;startSky();return;}
 if(!entering){$('portal').hidden=true;$('observatory').hidden=false;}
 for(const p of ['home','notes','papers','bank'])$(p+'-view').hidden=p!==page;
 document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(isBank?'choose':page))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('view-label').textContent=({home:'Physics',notes:'Discovery Lab',papers:'Exam Archive',bank:'Practice Studio'})[page];
 document.title=({home:'Your physics observatory',notes:'The Discovery Lab',papers:'The Exam Archive',bank:'The Practice Studio'})[page]+' · Neumeris';
 if(isBank){bankPromise??=import('./app.js');const bank=await bankPromise;await bank.ready;window.dispatchEvent(new Event('numeris:topic-route'));}
 if(page==='notes'||page==='papers'){viewsPromise??=import('./numeris-views.js');try{const views=await viewsPromise;await views.show(page);}catch{$(page+'-content').innerHTML='<div class="n-error">This collection could not load. <button class="n-button" onclick="location.reload()">Try again</button></div>';}}
}
window.addEventListener('hashchange',()=>{route();window.scrollTo({top:0,behavior:'instant'});});
window.addEventListener('popstate',route);
window.addEventListener('numeris:practice-view',route);
if(new URLSearchParams(location.search).has('topic')&&!location.hash)history.replaceState(null,'','#choose');
if(location.hash)route();
// Perspective projection gives equations and stars real depth, without a 3D dependency.
const canvas=$('starfield'),ctx=canvas.getContext('2d');let width=0,height=0,raf=0,last=0;
const stars=Array.from({length:150},()=>({x:(Math.random()-.5)*2,y:(Math.random()-.5)*2,z:Math.random()*1.3+.1,r:Math.random()*1.2+.2}));
const symbols=['ε','λ','π','Δ','E = hf','∑','ω','F = ma','∞','Φ','ψ','v = fλ','θ','ℏ'];
const equations=symbols.map((text,i)=>({text,x:(i%2?1:-1)*(.3+Math.random()*.65),y:(Math.random()-.5)*1.5,z:.6+Math.random()*.7}));
function resize(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx?.setTransform(d,0,0,d,0,0);if(!motion)drawSky(performance.now(),true);}
function drawSky(time,still=false){raf=0;if(!ctx||$('portal').hidden)return;const dt=Math.min(time-last||16,40)/1000;last=time;ctx.clearRect(0,0,width,height);const speed=entering?1.8:.028;
 for(const s of stars){if(!still)s.z-=dt*speed;if(s.z<.08){s.z=1.4;s.x=(Math.random()-.5)*2;s.y=(Math.random()-.5)*2;}const x=width/2+s.x*width*.55/s.z,y=height/2+s.y*height*.6/s.z,alpha=Math.min(.8,.22/s.z);ctx.fillStyle=`rgba(167,201,255,${alpha})`;ctx.beginPath();ctx.arc(x,y,Math.min(2,s.r/s.z),0,Math.PI*2);ctx.fill();if(entering){ctx.strokeStyle=`rgba(154,200,255,${alpha})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x-width/2)*.09,y+(y-height/2)*.09);ctx.stroke();}}
 for(const e of equations){if(!still)e.z-=dt*speed*.32;if(e.z<.3)e.z=1.4;const x=width/2+e.x*width*.53/e.z,y=height/2+e.y*height*.58/e.z;ctx.font=`italic ${Math.min(40,22/e.z)}px Georgia`;ctx.fillStyle=`rgba(119,166,244,${Math.min(.4,.19/e.z)})`;ctx.fillText(e.text,x,y);}
 if(!still&&motion&&!document.hidden)raf=requestAnimationFrame(drawSky);
}
function startSky(){if(raf)cancelAnimationFrame(raf);last=performance.now();drawSky(last,!motion);}
window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else startSky();});resize();startSky();
