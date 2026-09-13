import {renderSolarScene} from './solar-scenes.js';
import {detectorBudget} from './solar-model.js';
const num=n=>Number(n.toFixed(2)).toLocaleString('en-GB');
export const solarExperience={
 render:renderSolarScene,
 animatedViews:['setup','detector','bench','rate','orientation'],
 initial:{area:.5,exposure:0,collecting:false},
 note:'The detector faces sunlight directly outside the atmosphere. Incoming intensity stays at 1360 W m⁻². The pulses illustrate arriving energy; the dashed square marks 1 m².',
 controls:`<div class="planet-explore" hidden><div class="planet-explore-top"><h3>Try the detector bench</h3><p class="planet-challenge">Double the area: what changes? Then keep the area fixed and collect for longer: does power change, or only energy?</p></div><div class="planet-controls"><div class="planet-control-grid"><div><label for="solar-area">Detector area <strong><output id="solar-area-value">0.50</output> m²</strong></label><input id="solar-area" type="range" min="25" max="200" step="25" value="50"><div class="planet-presets"><button type="button" data-area=".5">0.50 m² detector</button><button type="button" data-area="1">Double to 1 m²</button></div></div><div><label for="solar-time">Collection time <strong><output id="solar-time-value" aria-live="off">0</output> s</strong></label><input id="solar-time" type="range" min="0" max="10" step=".1" value="0"><div class="planet-presets"><button type="button" data-collect>Collect for 10 seconds</button><button type="button" data-empty>Start again at 0 s</button></div></div></div></div></div>`,
 frame(s,time,reduced){return {scene:'detector-bench',view:'bench',area:s.area,exposure:Math.round(s.exposure*10)/10,progress:1,time:reduced?0:time,reduced,heading:'A larger area receives more power; more time collects more energy',caption:'S = 1360 W m⁻² stays fixed. Power P = SA. Energy E = Pt.'};},
 sync(s,find){
  const seconds=Math.round(s.exposure*10)/10,v=detectorBudget(s.area,seconds);
  find('#solar-area').value=s.area*100;find('#solar-area-value').textContent=s.area.toFixed(2);
  find('#solar-time').value=s.exposure;find('#solar-time-value').textContent=num(seconds);
  find('[data-collect]').textContent=s.collecting?'Collecting…':'Collect for 10 seconds';find('[data-collect]').disabled=s.collecting;
  return `${num(s.area)} m² receives ${num(v.power)} W. In ${num(seconds)} s it receives ${num(v.energy)} J. Changing time changes energy; the power stays ${num(v.power)} W.`;
 },
 click(b,s,reduced){
  if(b.dataset.area!==undefined){s.area=Number(b.dataset.area);s.collecting=false;}
  else if(b.hasAttribute('data-collect')){s.exposure=reduced?10:0;s.collecting=!reduced;}
  else if(b.hasAttribute('data-empty')){s.exposure=0;s.collecting=false;}
  else return false;return true;
 },
 input(e,s){
  if(e.target.id==='solar-area')s.area=Number(e.target.value)/100;
  else if(e.target.id==='solar-time')s.exposure=Number(e.target.value);
  else return false;s.collecting=false;return true;
 },
 tick(s,delta){if(!s.collecting)return false;s.exposure=Math.min(10,s.exposure+delta);if(s.exposure===10)s.collecting=false;return true;}
};
