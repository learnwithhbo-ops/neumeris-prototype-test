import {sceneAt} from './planet-model.js';
import {planetExperience} from './planet-experiment.js';
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function planetStoryHTML(lesson,experience=planetExperience){return `<section class="planet-story" aria-label="Narrated visual lesson">
 <div class="planet-mode" role="group" aria-label="Learning mode"><button type="button" data-mode="watch" aria-pressed="true">▶ Watch the explanation</button><button type="button" data-mode="explore" aria-pressed="false">Try the experiments</button></div>
 <div class="planet-watch"><div class="planet-chapters" role="group" aria-label="Explanation chapters">${lesson.visual_story.chapters.map((c,i)=>`<button type="button" data-chapter="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${h(c.title)}</button>`).join('')}</div></div>
 ${experience.controls}
 <div class="planet-watch planet-playback"><div class="planet-play-row"><button type="button" class="primary" data-action="play">▶ Play explanation</button><button type="button" class="quiet" data-action="replay">Replay chapter</button><label>Speed <select data-speed aria-label="Narration speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label></div><audio controls preload="metadata" aria-label="Narrated animation playback and seek"></audio></div>
 <figure class="planet-stage"><svg class="planet-svg" viewBox="0 0 900 520" role="img" aria-labelledby="planet-description"><title id="planet-description">Visual explanation of radiation across a planet.</title><g class="scene-layer"></g></svg><figcaption><h3 class="planet-cue-title"></h3><p class="planet-cue-caption" role="status"></p></figcaption></figure>
 <div class="planet-result" aria-label="Experiment result" hidden></div>
 <div class="planet-explore planet-explore-footer" hidden><p>${h(experience.note)}</p><button type="button" class="quiet" data-action="motion">Pause movement</button><button type="button" class="quiet" data-action="reset-explore">Reset experiment</button><output class="sr-only" id="planet-explore-summary" aria-live="polite"></output></div>
 <div class="planet-watch planet-player"><p class="planet-audio-error" role="status" hidden></p><p class="planet-player-note">Ryan · AI-generated voice · chapters continue automatically</p><details class="planet-steps"><summary>Jump to a visual step</summary><div class="planet-cue-buttons" role="group" aria-label="Scene positions"></div></details><details class="planet-transcript"><summary>Read this chapter’s transcript</summary><p></p></details><div class="planet-checkpoint"></div></div>
 <label class="planet-reduced"><input type="checkbox" data-reduced> Reduce motion <span>Use still diagrams and completed equation steps with the narration.</span></label>
 </section>`;}

export function bindPlanetStory(root,lesson,experience=planetExperience){
 const host=root.querySelector('.planet-story'),find=s=>host.querySelector(s),all=s=>host.querySelectorAll(s);
 const controller=new AbortController(),signal=controller.signal;
 const on=(node,event,fn)=>node.addEventListener(event,fn,{signal});
 const audio=find('audio'),media=window.matchMedia('(prefers-reduced-motion: reduce)');
 const state={...experience.initial};
 let chapter=0,mode='watch',manualTime=0,failed=false;
 let reduced=media.matches,exploreRunning=true,exploreTime=0,lastNow=0,raf=0,destroyed=false,paintKey='',captionKey='',playbackRequest=0;
 const cues=()=>lesson.visual_story.chapters[chapter].cues;
 const scene=()=>mode==='watch'?sceneAt(cues(),failed?manualTime:audio.currentTime,reduced):experience.frame(state,exploreTime,reduced);
 function paint(force=false){
  const f=scene(),intensity=mode==='watch'?1360:(state.solar??1360);
  const moving=experience.animatedViews.includes(f.view);
  // Include every topic parameter, so future experiments cannot update only their numbers.
  const key=JSON.stringify({...f,time:moving?Number(f.time.toFixed(2)):0,intensity});
  if(key!==paintKey||force){
   paintKey=key;host.dataset.scene=f.scene;host.dataset.view=f.view;
   find('.scene-layer').innerHTML=experience.render(f,intensity);
   find('#planet-description').textContent=f.heading+'. '+f.caption;
  }
  const cap=f.heading+f.caption;
  if(cap!==captionKey||force){captionKey=cap;find('.planet-cue-title').textContent=f.heading;find('.planet-cue-caption').textContent=f.caption;all('[data-cue]').forEach((b,i)=>b.setAttribute('aria-pressed',String(cues()[i]?.at===f.at)));}
  find('.planet-result').hidden=mode==='watch';
 }
 function loop(now){
  if(destroyed)return;
  if(lastNow&&mode==='explore'&&exploreRunning&&!reduced){const delta=(now-lastNow)/1000;exploreTime+=delta;if(experience.tick?.(state,delta)){syncExploration(!state.collecting);}}
  lastNow=now;paint();
  if((mode==='watch'&&!audio.paused&&!audio.ended&&!failed)||(mode==='explore'&&exploreRunning&&!reduced))raf=requestAnimationFrame(loop);else{raf=0;lastNow=0;}
 }
 function wake(){if(!raf&&!destroyed)raf=requestAnimationFrame(loop);}
 function playbackLabel(){find('[data-action=play]').textContent=audio.paused?'▶ Play explanation':'Pause explanation';}
 function error(message){failed=true;manualTime=audio.currentTime||0;audio.pause();find('.planet-audio-error').hidden=false;find('.planet-audio-error').textContent=message;find('.planet-steps').open=true;paint();}
 async function play(){
  const request=++playbackRequest;
  failed=false;find('.planet-audio-error').hidden=true;
  if(audio.error)audio.load();
  try{await audio.play();}catch{if(!destroyed&&mode==='watch'&&request===playbackRequest)error('Audio could not start. Try Play again, or step through the visuals and use the transcript.');}
 }
 function loadChapter(index,continuePlaying=false){
  playbackRequest++;audio.pause();chapter=index;failed=false;manualTime=0;
  audio.src=lesson.segments[chapter].audio_path;audio.load();
  find('.planet-audio-error').hidden=true;find('.planet-transcript p').textContent=lesson.segments[chapter].narration;
  all('[data-chapter]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===chapter)));
  find('.planet-cue-buttons').innerHTML=cues().map((c,i)=>`<button type="button" data-cue="${i}" aria-pressed="${i===0}">${h(c.heading)}</button>`).join('');
  const checkpoint=lesson.segments[chapter].checkpoint;
  find('.planet-checkpoint').innerHTML=checkpoint?`<details class="checkpoint"><summary>${h(checkpoint.prompt)}</summary><p>${h(checkpoint.text)}</p><details><summary>Compare your explanation</summary><p>${h(checkpoint.answer)}</p></details></details>`:'';
  paint(true);playbackLabel();if(continuePlaying)play();
 }
 on(host,'click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.mode){
   if(mode===b.dataset.mode)return;
   playbackRequest++;audio.pause();mode=b.dataset.mode;lastNow=0;
   all('.planet-watch').forEach(n=>n.hidden=mode!=='watch');all('.planet-explore').forEach(n=>n.hidden=mode!=='explore');
   all('[data-mode]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.mode===mode)));updateExploration();
   paint(true);wake();
  }else if(b.dataset.chapter!==undefined)loadChapter(Number(b.dataset.chapter),!audio.paused);
  else if(b.dataset.cue!==undefined){const i=Number(b.dataset.cue),cue=cues()[i];const at=Math.min(cue.at+(cue.transition??1),(cues()[i+1]?.at??lesson.segments[chapter].duration_seconds)-.02);audio.pause();manualTime=at;try{audio.currentTime=at;}catch{failed=true;}paint(true);}
  else if(b.dataset.action==='play'){if(audio.paused)play();else audio.pause();}
  else if(b.dataset.action==='replay'){audio.pause();manualTime=0;audio.currentTime=0;paint(true);play();}
  else if(b.dataset.action==='motion'){exploreRunning=!exploreRunning;b.textContent=exploreRunning?'Pause movement':'Resume movement';lastNow=0;wake();}
  else if(b.dataset.action==='reset-explore'){Object.assign(state,experience.initial);exploreTime=0;updateExploration();}
  else if(experience.click(b,state,reduced)){if(state.collecting){exploreRunning=true;find('[data-action=motion]').textContent='Pause movement';}updateExploration();}
 });
 function syncExploration(announce=true){
  const summary=experience.sync(state,find,all);
  if(announce)find('#planet-explore-summary').textContent=summary;
  find('.planet-result').textContent=summary;
 }
 function updateExploration(){syncExploration();paint(true);wake();}
 on(host,'input',e=>{if(experience.input(e,state))updateExploration();});
 on(find('[data-speed]'),'change',e=>{audio.defaultPlaybackRate=audio.playbackRate=Number(e.target.value);});
 on(audio,'ratechange',()=>{
  const speed=find('[data-speed]'),rate=String(audio.playbackRate);
  if(![...speed.options].some(o=>o.value===rate)){const option=document.createElement('option');option.value=rate;option.textContent=rate+'×';speed.append(option);}
  speed.value=rate;
  if(audio.defaultPlaybackRate!==audio.playbackRate)audio.defaultPlaybackRate=audio.playbackRate;
 });
 function updateReduced(value){reduced=value;find('[data-reduced]').checked=value;find('[data-action=motion]').disabled=value;paint(true);wake();}
 on(find('[data-reduced]'),'change',e=>updateReduced(e.target.checked));
 on(media,'change',e=>updateReduced(e.matches));
 on(audio,'play',()=>{playbackLabel();wake();});on(audio,'pause',()=>{playbackLabel();paint();});
 on(audio,'timeupdate',()=>paint());on(audio,'seeked',()=>paint(true));
 on(audio,'error',()=>error('Audio could not load. Step through the visuals below; the complete transcript is also available.'));
 on(audio,'ended',()=>{if(chapter<lesson.segments.length-1&&mode==='watch')loadChapter(chapter+1,true);else{playbackLabel();find('[data-action=play]').textContent='Replay final chapter';}});

 loadChapter(0);updateReduced(reduced);
 return ()=>{destroyed=true;controller.abort();cancelAnimationFrame(raf);audio.pause();audio.removeAttribute('src');audio.load();};
}
