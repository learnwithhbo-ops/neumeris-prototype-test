import {renderAlbedoScene} from './albedo-scenes.js';
import {radiationBudget,iceBudget,compareAlbedos} from './albedo-model.js';
const num=n=>Number(n.toFixed(2)).toLocaleString('en-GB');
const animatedViews=['split','latitude','intensity-compare'];
export const albedoExperience={
 render:renderAlbedoScene,animatedViews,initial:{albedo:.3,incident:340},
 note:'The arrow widths show radiation intensity. This model accounts for reflection and absorption only, with none passing through. Compare the same area and the same units.',
 controls:`<div class="planet-explore" hidden><div class="planet-explore-top"><h3>Follow the split</h3><p class="planet-challenge">Keep the input fixed and increase albedo. Where does the energy go? Then change the input while keeping albedo fixed: does the reflected fraction change?</p></div><div class="planet-controls"><div class="planet-control-grid"><div><label for="albedo-fraction">Albedo <strong><output id="albedo-value">0.30</output></strong></label><input id="albedo-fraction" type="range" min="0" max="100" step="5" value="30"><div class="planet-presets"><button type="button" data-albedo="0">No reflection</button><button type="button" data-albedo=".3">30% reflected</button><button type="button" data-albedo="1">All reflected</button></div></div><div><label for="albedo-input">Incoming intensity <strong><output id="albedo-input-value">340</output> W m⁻²</strong></label><input id="albedo-input" type="range" min="0" max="600" step="20" value="340"><span class="planet-brightness-note">Change the input while preserving its reflected fraction.</span></div></div></div></div>`,
 frame(s,time,reduced){return {scene:'explore-split',view:'split',...s,progress:1,time:reduced?0:time,reduced,heading:'The same input is shared between reflection and absorption',caption:s.incident?'Albedo = reflected / incoming. The reflected and absorbed amounts add up to the incoming amount.':'No radiation arrives. The slider still sets an albedo, but we cannot measure it from zero reflected divided by zero incoming radiation.'};},
 sync(s,find){
  find('#albedo-fraction').value=s.albedo*100;find('#albedo-value').textContent=s.albedo.toFixed(2);
  find('#albedo-input').value=s.incident;find('#albedo-input-value').textContent=s.incident;
  const v=radiationBudget(s.incident,s.albedo);
  return `${num(v.reflected)} reflected + ${num(v.absorbed)} absorbed = ${num(v.incident)} W m⁻² incoming. `+(s.incident?`${num(v.reflected)} / ${num(v.incident)} = ${num(v.albedo)}. Reflected fraction: ${num(v.albedo*100)}%.`:'At zero input, both flows are zero; their ratio does not determine albedo.');
 },
 click(b,s){if(b.dataset.albedo===undefined)return false;s.albedo=Number(b.dataset.albedo);return true;},
 input(e,s){if(e.target.id==='albedo-fraction')s.albedo=Number(e.target.value)/100;else if(e.target.id==='albedo-input')s.incident=Number(e.target.value);else return false;return true;}
};
export const changingAlbedoExperience={
 render:renderAlbedoScene,animatedViews,initial:{mode:'ice',ice:1,albedo:.3,incident:340,before:.4},
 note:'Ice experiment: equal incoming sunlight across the surface, no atmosphere and no radiation passing through; example ice albedo 0.60 and water albedo 0.10. The comparison holds incoming intensity at 340 W m⁻². No temperature change is calculated.',
 controls:`<div class="planet-explore" hidden><div class="planet-explore-top"><div role="group" aria-label="Choose an experiment"><button type="button" data-comparison="ice" aria-pressed="true">1 · Reveal darker water</button><button type="button" data-comparison="compare" aria-pressed="false">2 · Compare two albedos</button></div><p class="planet-challenge"></p></div><div class="planet-controls"><div class="change-ice-controls"><label for="ice-cover">Ice-covered area <strong><output id="ice-value">100</output>%</strong></label><input id="ice-cover" type="range" min="0" max="100" step="10" value="100"><div class="planet-presets"><button type="button" data-ice="1">Start with ice</button><button type="button" data-ice=".2">Expose more water</button></div></div><div class="change-compare-controls" hidden><label for="comparison-albedo">New albedo <strong><output id="comparison-value">0.30</output></strong></label><input id="comparison-albedo" type="range" min="0" max="100" step="5" value="30"><div class="planet-presets"><button type="button" data-after=".4">Match the original 0.40</button><button type="button" data-after=".3">Decrease to 0.30</button></div></div></div></div>`,
 frame(s,time,reduced){return {...s,scene:s.mode==='ice'?'explore-ice':'explore-compare',view:s.mode==='ice'?'ice':'compare',progress:1,time:reduced?0:time,reduced,heading:s.mode==='ice'?'Change the surface; hold the sunlight fixed':'Compare against the original albedo of 0.40',caption:s.mode==='ice'?'As the lower-albedo water is exposed, less sunlight is reflected and more is absorbed in this model.':'Both cases receive 340 W m⁻². White is reflected radiation; cyan is absorbed radiation.'};},
 sync(s,find,all){
  all('[data-comparison]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.comparison===s.mode)));
  find('.change-ice-controls').hidden=s.mode!=='ice';find('.change-compare-controls').hidden=s.mode!=='compare';
  find('#ice-cover').value=s.ice*100;find('#ice-value').textContent=Math.round(s.ice*100);
  find('#comparison-albedo').value=s.albedo*100;find('#comparison-value').textContent=s.albedo.toFixed(2);
  find('.planet-challenge').textContent=s.mode==='ice'?'Reduce ice cover and watch the surface change. With the same sunlight arriving, predict what happens to the reflected and absorbed shares.':'Keep the input fixed. Compare absorption at the original albedo, 0.40, with the new setting. Distinguish the difference from the percentage change.';
  if(s.mode==='ice'){const v=iceBudget(s.ice,s.incident);return `Model average α = ${num(v.albedo)}. Reflected: ${num(v.reflected)} W m⁻². Absorbed: ${num(v.absorbed)} W m⁻². The ice and water albedos are example values for this model.`;}
  const v=compareAlbedos(s.before,s.albedo,s.incident);
  return `Absorbed: ${num(v.before.absorbed)} → ${num(v.after.absorbed)} W m⁻². Difference: ${num(v.difference)} W m⁻². After/before ratio: ${v.ratio.toFixed(3)}. Percentage change relative to the original absorption: ${num(v.percent)}%.`;
 },
 click(b,s){if(b.dataset.comparison)s.mode=b.dataset.comparison;else if(b.dataset.ice!==undefined)s.ice=Number(b.dataset.ice);else if(b.dataset.after!==undefined)s.albedo=Number(b.dataset.after);else return false;return true;},
 input(e,s){if(e.target.id==='ice-cover')s.ice=Number(e.target.value)/100;else if(e.target.id==='comparison-albedo')s.albedo=Number(e.target.value)/100;else return false;return true;}
};
