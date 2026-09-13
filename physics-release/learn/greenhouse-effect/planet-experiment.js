import {illumination,planetBudget} from './planet-model.js';
import {renderScene} from './planet-scenes.js';
const number=n=>Math.round(n).toLocaleString('en-GB');
export const planetExperience={
 render:renderScene,
 animatedViews:['world','local','size','average'],
 initial:{view:'local',solar:1360,angle:0,radius:1},
 controls:` <div class="planet-explore" hidden><div class="planet-explore-top"><div role="group" aria-label="Choose an experiment"><button type="button" data-view="local" aria-pressed="true">1 · Tilt a surface</button><button type="button" data-view="global" aria-pressed="false">2 · Resize a planet</button></div><p class="planet-challenge">Keep the incoming intensity fixed. Turn the surface from 0° to 60°: what happens to the area covered by the beam and the intensity on the surface?</p></div></div>
 <div class="planet-explore planet-controls" hidden><div class="planet-control-grid"><div class="planet-angle-control"><label for="planet-angle">Surface angle <strong><output id="planet-angle-value">0</output>°</strong></label><input id="planet-angle" type="range" min="0" max="60" step="1" value="0"><div class="planet-presets"><button type="button" data-angle="0">Face the beam · 0°</button><button type="button" data-angle="60">Slant the surface · 60°</button></div></div><div class="planet-radius-control" hidden><label for="planet-radius">Planet radius <strong><output id="planet-radius-value">1.0</output> × R₀</strong></label><input id="planet-radius" type="range" min="100" max="200" step="10" value="100"><div class="planet-presets"><button type="button" data-radius="1">Original size</button><button type="button" data-radius="2">Double the radius</button></div></div><div><label for="planet-intensity">Incoming intensity <strong><output id="planet-solar-value">1360</output> W m⁻²</strong></label><input id="planet-intensity" type="range" min="0" max="2000" step="40" value="1360"><span class="planet-brightness-note">Dimmer beam ← → Brighter beam</span></div></div></div>
`,
 note:'Beam brightness represents incoming intensity. Energy markers travel at a fixed visual speed. R₀ is the reference radius.',
 frame(s,time,reduced){return {scene:s.view==='local'?'explore-local':'explore-size',view:s.view==='local'?'local':'size',angle:s.angle,radius:s.radius,progress:1,time:reduced?0:time,reduced,heading:s.view==='local'?'One beam, a changing covered area':'Both areas grow together',caption:s.view==='local'?'The blue-green line is the normal: a line at right angles to the surface. The marked angle is measured from the incoming beam to that normal.':'Increasing the radius enlarges the circular catching area and the whole surface. The global mean remains S/4.'};},
 sync(s,find,all){
  find('#planet-intensity').value=s.solar;find('#planet-angle').value=s.angle;find('#planet-radius').value=s.radius*100;
  find('#planet-solar-value').textContent=s.solar;find('#planet-angle-value').textContent=s.angle;find('#planet-radius-value').textContent=s.radius.toFixed(1);
  all('[data-view]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.view===s.view)));
  find('.planet-angle-control').hidden=s.view!=='local';find('.planet-radius-control').hidden=s.view!=='global';
  find('.planet-challenge').textContent=s.view==='local'?'Keep the incoming intensity fixed. Turn the surface from 0° to 60°: what happens to the area covered by the beam and the intensity on the surface?':'Double the radius while keeping sunlight fixed. Predict which quantities grow and whether the global mean changes.';
  const v=illumination(s.solar,s.angle),b=planetBudget(s.solar,s.radius);
  return s.view==='local'?`At ${s.angle}°, the same beam covers ${v.footprint.toFixed(2)}× the directly facing area. Local intensity = ${number(v.local)} W m⁻².`:`Compared with R₀, both areas are ${b.areaScale.toFixed(2)}× as large. Total intercepted power is ${b.powerScale.toFixed(2)}× the reference power (at R₀ and S = 1360). The mean is ${number(b.mean)} W m⁻².`;
 },
 click(b,s){if(b.dataset.view)s.view=b.dataset.view;else if(b.dataset.angle!==undefined)s.angle=Number(b.dataset.angle);else if(b.dataset.radius!==undefined)s.radius=Number(b.dataset.radius);else return false;return true;},
 input(e,s){const k={'planet-intensity':'solar','planet-angle':'angle','planet-radius':'radius'}[e.target.id];if(!k)return false;s[k]=Number(e.target.value)/(k==='radius'?100:1);return true;}
};
