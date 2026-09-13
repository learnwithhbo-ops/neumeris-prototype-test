import {formatText} from './math.js';
// Reuse physics models; diagrams update on learner actions, without a time loop.
import {solarExperience} from './solar-experiment.js';
import {planetExperience} from './planet-experiment.js';
import {albedoExperience,changingAlbedoExperience} from './albedo-experiments.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const adapters={
 'solar-constant':{...solarExperience,note:'The detector faces sunlight directly outside the atmosphere. S = 1360 W m⁻² stays fixed. Change area or collection time to compare power and energy; the dashed square marks 1 m².',controls:solarExperience.controls.replaceAll('Collect for 10 seconds','Set time to 10 seconds')},
 'planet-average':{...planetExperience,note:'Tilting changes the footprint: the area covered by the beam. Changing radius changes both the circular area and the whole surface area. Beam brightness represents incoming intensity. R₀ is the starting radius used for comparison.'},
 albedo:albedoExperience,'changing-albedo':changingAlbedoExperience
};
export function emittedIntensity(t,e){if(!Number.isFinite(t)||t<0||!Number.isFinite(e)||e<0||e>1)throw new RangeError('Invalid emission parameters');return e*5.67e-8*t**4;}
const emissionControls=`<div class="planet-explore-top"><h3>Compare real and ideal emitters</h3><p>Keep temperature fixed and change emissivity. Then hold emissivity fixed and change the temperature in kelvin. Which change has the stronger effect?</p></div><div class="planet-controls"><div class="planet-control-grid"><div><label for="emission-temperature">Temperature <strong><output id="emission-temperature-value">300</output> K</strong></label><input id="emission-temperature" type="range" min="200" max="400" step="10" value="300"></div><div><label for="emission-epsilon">Emissivity <strong><output id="emission-epsilon-value">0.80</output></strong></label><input id="emission-epsilon" type="range" min="0" max="100" step="5" value="80"></div></div></div>`;
export function experimentHTML(id){
 if(!adapters[id]&&id!=='emissivity')return '';
 return `<details class="reading-experiment"><summary>Try the experiments <span>Optional · change one setting and compare</span></summary><div class="planet-story experiment-only" data-experiment="${esc(id)}">${id==='emissivity'?emissionControls:adapters[id].controls}${id==='emissivity'?'<div class="emission-comparison" aria-label="Emitted intensities"></div>':`<figure class="planet-stage"><svg class="planet-svg" viewBox="0 0 900 520" role="img" aria-labelledby="experiment-title"><title id="experiment-title">Experiment diagram</title><g class="scene-layer"></g></svg><figcaption><h3 class="planet-cue-title"></h3><p class="planet-cue-caption"></p></figcaption></figure>`}<div class="planet-result" aria-label="Experiment result" role="status"></div><div class="planet-explore-footer"><p>${formatText(id==='emissivity'?'Bars use a fixed scale from 0 to 1500 W m⁻². The black-body reference is recalculated at the same temperature. The bars show energy emitted. Incoming absorbed energy is not included.':adapters[id].note)}</p><button type="button" class="quiet" data-reset-experiment>Reset experiment</button></div></div></details>`;
}
export function bindExperiment(root,id){
 const host=root.querySelector('[data-experiment]');if(!host)return;
 const find=s=>host.querySelector(s),all=s=>host.querySelectorAll(s);
 if(id==='emissivity'){
  const draw=()=>{const t=Number(find('#emission-temperature').value),e=Number(find('#emission-epsilon').value)/100,ideal=emittedIntensity(t,1),real=emittedIntensity(t,e);find('#emission-temperature-value').textContent=t;find('#emission-epsilon-value').textContent=e.toFixed(2);find('.emission-comparison').innerHTML=[[1,ideal,'Black-body reference'],[e,real,'Real surface']].map(([epsilon,intensity,label])=>`<div><strong>${formatText(label)} · ${formatText(`ε = ${epsilon.toFixed(2)}`)}</strong><div class="emission-track"><i style="width:${intensity/1500*100}%"></i></div><span>${formatText(`${intensity.toFixed(1)} W m⁻²`)}</span></div>`).join('');find('.planet-result').innerHTML=formatText(`At ${t} K, the real surface emits ${real.toFixed(1)} W m⁻²: ${(e*100).toFixed(0)}% of the black-body intensity at the same temperature.`);};
  host.addEventListener('input',draw);find('[data-reset-experiment]').onclick=()=>{find('#emission-temperature').value=300;find('#emission-epsilon').value=80;draw();};draw();return;
 }
 const a=adapters[id];let state={...a.initial};all('.planet-explore').forEach(n=>n.hidden=false);
 function draw(){const result=a.sync(state,find,all),f=a.frame(state,0,true);find('.scene-layer').innerHTML=a.render(f,state.solar??1360);find('#experiment-title').textContent=f.heading+'. '+result;find('.planet-cue-title').innerHTML=formatText(f.heading);find('.planet-cue-caption').innerHTML=formatText(f.caption);find('.planet-result').innerHTML=formatText(result);if(id==='solar-constant')find('[data-collect]').textContent='Set time to 10 seconds';}
 host.addEventListener('input',e=>{if(a.input(e,state))draw();});
 host.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-reset-experiment')){state={...a.initial};draw();}else if(a.click(b,state,true))draw();});draw();
}
