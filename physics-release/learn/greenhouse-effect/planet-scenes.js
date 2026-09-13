import {illumination,planetBudget,beamAppearance,rayPackets} from './planet-model.js';
const gold='#ffd36c',cyan='#74dde0',white='#edf8ff',muted='#a8c3d9';
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fixed=n=>Number(n.toFixed(2));
const text=(x,y,s,size=38,fill=white,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${safe(s)}</text>`;
const line=(x1,y1,x2,y2,color=cyan,width=3,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const centered=(y,s,size=40,fill=white)=>text(450,y,s,size,fill,'text-anchor="middle"');
const draw=(d,p,color=gold,width=4)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-p}"/>`;
const fade=(content,p)=>`<g opacity="${p}">${content}</g>`;
const defs=`<defs><linearGradient id="scene-beam"><stop stop-color="#ffe59a" stop-opacity=".1"/><stop offset="1" stop-color="#ffd36c"/></linearGradient><radialGradient id="scene-glow"><stop stop-color="#ffdf7c" stop-opacity=".8"/><stop offset="1" stop-color="#ffdf7c" stop-opacity="0"/></radialGradient></defs>`;

function globe(cx,cy,r,solar=1360,outline=false){
 const b=beamAppearance(solar);
 return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b1d32"/>
 <path class="sunlit-face" d="M${cx} ${cy-r}A${r} ${r} 0 0 0 ${cx} ${cy+r}Z" fill="#47949e" opacity="${.08+b.strength*.9}"/>
 <path d="M${cx} ${cy-r}A${r} ${r} 0 0 0 ${cx} ${cy+r}Z" fill="url(#scene-beam)" opacity="${b.glow}"/>
 <g fill="none" stroke="${cyan}" opacity="${outline?.75:.24}"><ellipse cx="${cx}" cy="${cy}" rx="${r*.44}" ry="${r}"/><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*.33}"/>${line(cx,cy-r,cx,cy+r,cyan,1)}</g>
 <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${cyan}" stroke-width="${outline?5:2}"/>`;
}
function worldBeam(cx,cy,r,solar,t,reveal=1){
 const b=beamAppearance(solar);if(!solar)return '';
 let rays='';
 for(let i=-4;i<=4;i++){
  const y=cy+i*r*.21,end=cx-Math.sqrt(r*r-(y-cy)**2),reach=50+(end-50)*reveal;
  rays+=line(50,y,reach,y,gold,b.stroke,`opacity="${.15+b.strength*.7}"`);
  rays+=rayPackets(solar,t,50,reach-6,y).map(p=>line(p.x-9,y,p.x+9,y,gold,5)).join('');
 }
 return `<path class="beam-fill" d="M50 ${cy-r}H${cx}V${cy+r}H50Z" fill="url(#scene-beam)" opacity="${b.fill*reveal}"/>${rays}`;
}
function world(f){
 const cx=465,cy=225,r=145,night=f.scene==='night',trace=f.scene==='trace-areas';
 let svg=worldBeam(cx,cy,r,1360,f.time,f.scene==='arrival'?f.progress:1)+globe(cx,cy,r,1360,trace&&f.progress>.5);
 if(night)svg+=fade(`<circle cx="${cx+85}" cy="${cy}" r="38" fill="#0b1d32" stroke="${muted}" stroke-width="3"/>${text(cx+85,cy+14,'0',44,white,'text-anchor="middle"')}${text(660,cy-25,'Night side',36)}${text(660,cy+27,'No direct rays',28,muted)}`,f.progress);
 else svg+=text(55,68,'Incoming sunlight',34,gold);
 if(trace){const disc=f.progress<.5;svg+=line(cx-r,cy-r,cx-r,cy+r,disc?gold:muted,disc?8:2)+centered(440,disc?'Intercepted: πR²':'Whole surface: 4πR²',46,disc?gold:cyan);}
 return svg;
}
function disc(f){
 const p=f.progress,showRadius=['radius','disc-area','disc-only'].includes(f.scene),showArea=['disc-area','disc-only'].includes(f.scene);
 let svg=globe(235,220,132,1360)+text(235,415,'Side view',34,muted,'text-anchor="middle"');
 svg+=line(405,220,475,220,muted,3)+text(440,208,'→',45,muted,'text-anchor="middle"');
 svg+=fade(`<circle cx="665" cy="220" r="132" fill="#ffd36c25" stroke="${gold}" stroke-width="4"/>${text(665,65,'View along the rays',32,white,'text-anchor="middle"')}`,f.scene==='projection'?p:1);
 if(showRadius){svg+=draw('M665 220H797',f.scene==='radius'?p:1)+text(728,203,'R',42,gold);}
 if(showArea)svg+=fade(text(665,285,'πR²',62,gold,'text-anchor="middle"'),f.scene==='disc-area'?p:1);
 if(f.scene==='disc-versus-sphere')svg+=fade(text(665,418,'Use the silhouette',34,gold,'text-anchor="middle"'),p);
 return svg;
}
function power(f){
 const stage=['power-intensity','power-area','power-total'].indexOf(f.scene),p=f.progress;
 const box=(x,label,formula,color,opacity)=>fade(`<rect x="${x}" y="100" width="220" height="240" rx="15" fill="#183d5f" stroke="${color}"/>${text(x+110,158,label,29,muted,'text-anchor="middle"')}${text(x+110,252,formula,65,color,'text-anchor="middle"')}`,opacity);
 return box(50,'Intensity','S',gold,1)+text(300,235,'×',56)+box(340,'Facing area','πR²',cyan,stage>0?1:p*.22)+fade(text(588,235,'=',55)+box(630,'Power','P',gold,1),stage===2?p:0)+centered(435,stage===2?'W m⁻² × m² = W':'Power = intensity × facing area',36,muted);
}
function surface(f){
 let svg=globe(240,215,133,1360,true)+text(240,421,'Entire sphere',34,cyan,'text-anchor="middle"');
 for(let i=0;i<4;i++){const x=510+(i%2)*145,y=100+Math.floor(i/2)*133;svg+=fade(`<rect x="${x}" y="${y}" width="125" height="105" rx="12" fill="#74dde022" stroke="${cyan}"/>${text(x+62,y+67,'πR²',38,cyan,'text-anchor="middle"')}`,Math.min(1,Math.max(0,f.progress*4-i)));}
 return svg+text(644,60,'Equal area units',32,muted,'text-anchor="middle"')+text(644,424,'4πR²',60,cyan,'text-anchor="middle"');
}
function division(f){
 const id=f.scene,p=f.progress;
 if(id==='incident-result')return centered(120,'Mean incident intensity',40,muted)+centered(295,'S / 4',100,gold)+centered(415,'Before accounting for reflection',34,muted);
 if(id.startsWith('numeric')){
  const result=id==='numeric-result'||id==='numeric-divide',amount=id==='numeric-result'?1:p;
  return centered(70,'Substitute the solar constant',34,muted)+text(330,204,'1360',75,gold,'text-anchor="middle"')+line(200,255,460,255,white,3)+text(330,351,'4',75,cyan,'text-anchor="middle"')+fade(text(520,288,'=',60)+text(625,288,'340',90,gold),result?amount:0)+centered(447,'W m⁻²',38,muted);
 }
 const ratio=id.startsWith('area-ratio'),simplify=id==='eq-simplify',cancelR=['eq-cancel-r','eq-simplify','area-ratio-cancel'].includes(id),cancelPi=cancelR||id==='eq-cancel-pi';
 const numerator=['eq-numerator','eq-surface','eq-fraction','eq-match','eq-cancel-pi','eq-cancel-r','eq-simplify'].includes(id)||ratio;
 const denominator=['eq-fraction','eq-match','eq-cancel-pi','eq-cancel-r','eq-simplify'].includes(id)||ratio;
 let svg=centered(65,ratio?'Ratio of intercepted area to total area':'Mean intensity = power ÷ surface area',33,muted);
 if(!numerator)svg+=fade(text(450,207,id==='eq-power'?'P = SπR²':'Incoming power',id==='eq-power'?56:44,gold,'text-anchor="middle"'),p);
 if(!denominator)svg+=fade(text(450,353,'Whole surface area',44,cyan,'text-anchor="middle"'),['divide-intro','eq-numerator'].includes(id)?.45:1);
 const shift=simplify?p*105:0,remaining=simplify?1-p:1;
 svg+=line(245+shift,267,655-shift,267,white,3);
 const term=(x,y,label,color)=>text(x,y,label,76,color,'text-anchor="middle"');
 if(numerator){
  const np=id==='eq-numerator'?p:1;
  svg+=fade(term(345+shift,207,ratio?'1':'S',gold)+fade(term(455,207,'π',gold)+term(565,207,'R²',cyan),remaining),np);
 }
 if(denominator)svg+=fade(term(345+shift,353,'4',cyan)+fade(term(455,353,'π',gold)+term(565,353,'R²',cyan),remaining),id==='eq-fraction'?p:1);
 if(id==='eq-match')svg+=`<g fill="none" stroke-width="2"><rect x="413" y="139" width="84" height="233" rx="9" stroke="${gold}"/><rect x="513" y="139" width="106" height="233" rx="9" stroke="${cyan}"/></g>`;
 if(cancelPi)svg+=fade([185,330].map(y=>draw(`M417 ${y+30}L490 ${y-44}`,id==='eq-cancel-pi'?p:1,gold,6)).join(''),remaining);
 if(cancelR)svg+=fade([185,330].map(y=>draw(`M517 ${y+30}L614 ${y-44}`,id==='eq-cancel-r'||ratio?p:1,cyan,6)).join(''),remaining);
 if(ratio)svg+=fade(text(710,282,'= ¼',75,gold),id==='area-ratio-cancel'?p:1);
 if(simplify)svg+=fade(centered(441,'The common factors are gone.',33,muted),p);
 return svg;
}
function local(f,solar){
 const angle=f.angle,rad=angle*Math.PI/180,c=Math.cos(rad),sin=Math.sin(rad),cx=590,cy=245,half=48/Math.max(.5,c),b=beamAppearance(solar);
 const end=y=>cx-(y-cy)*Math.tan(rad);let svg='';
 svg+=`<path class="beam-fill" d="M55 197H${end(197)}L${end(293)} 293H55Z" fill="url(#scene-beam)" opacity="${b.fill}"/>`;
 for(const y of [197,221,245,269,293]){
  if(solar)svg+=line(55,y,end(y),y,gold,b.stroke,`opacity="${.2+b.strength*.8}"`)+rayPackets(solar,f.time,55,end(y)-8,y).map(p=>line(p.x-10,y,p.x+10,y,gold,4+b.strength*2)).join('');
 }
 svg+=line(cx-142*sin,cy+142*c,cx+142*sin,cy-142*c,muted,8);
 svg+=line(cx-half*sin,cy+half*c,cx+half*sin,cy-half*c,gold,solar?12:0,`class="beam-footprint" opacity="${.2+b.strength*.8}"`);
 // Normal points out of the receiving surface; theta is measured from it to the incoming beam direction.
 const nx=cx-175*c,ny=cy-175*sin;
 svg+=line(cx,cy,nx,ny,cyan,3,'stroke-dasharray="8 7" class="surface-normal"')+text(nx-8,ny-20,'Normal',32,cyan,'text-anchor="middle"');
 if(angle>.5){svg+=`<path class="incidence-angle" d="M${cx-65} ${cy}A65 65 0 0 1 ${cx-65*c} ${cy-65*sin}" fill="none" stroke="${cyan}" stroke-width="5"/>`;
  svg+=text(cx-104*Math.cos(rad/2),cy-104*Math.sin(rad/2)-9,Math.round(angle)+'°',44,cyan,'text-anchor="middle"');}
 else svg+=text(cx-90,cy-19,'0°',38,cyan,'text-anchor="middle"');
 // A fixed-width incoming beam compared with the illuminated length along the plane.
 svg+=line(33,197,33,293,gold,3)+line(24,197,42,197,gold,3)+line(24,293,42,293,gold,3);
 const ox=30*c,oy=30*sin;
 svg+=line(cx-half*sin+ox,cy+half*c+oy,cx+half*sin+ox,cy-half*c+oy,gold,3,'class="footprint-measure"');
 svg+=text(55,100,'Same incoming beam',36,gold)+text(680,76,'Receiving surface',30,muted,'text-anchor="middle"');
 const values=illumination(solar,angle);
 if(f.scene.startsWith('detector'))svg+=centered(442,'P = S × directly facing area',47,gold);
 else if(f.scene==='local-overhead')svg+=fade(centered(445,'Sun overhead → normal along the beam',33,cyan),f.progress);
 else if(f.scene==='local-full')svg+=fade(centered(430,'Directly facing surface',34,muted)+centered(484,'Local intensity = S',54,gold),f.progress);
 else if(f.scene==='local-incident')svg+=fade(centered(445,'Incident radiation arrives at the surface →',36,gold),f.progress);
 else svg+=text(100,426,'Footprint',30,muted)+text(100,478,fixed(values.footprint)+'×',58,gold)+text(525,426,'Local intensity',30,muted)+text(525,478,Math.round(values.local)+' W m⁻²',48,cyan);
 return svg;
}
function size(f,solar){
 const r=70*f.radius,budget=planetBudget(solar,f.radius),cx=315,cy=225;
 let svg=worldBeam(cx,cy,r,solar,f.time)+globe(cx,cy,r,solar,true);
 svg+=line(cx,cy,cx+r,cy,white,3)+text(cx+r/2,cy-13,'R',34,white,'text-anchor="middle"');
 const card=(y,label,value,color)=>`<rect x="550" y="${y-45}" width="302" height="103" rx="12" fill="#193d5d" stroke="${color}"/>${text(573,y-8,label,27,muted)}${text(573,y+36,value,43,color)}`;
 svg+=card(97,'Intercepted area',fixed(budget.areaScale)+'×',gold)+card(220,'Whole surface area',fixed(budget.areaScale)+'×',cyan)+card(343,'Global mean',Math.round(budget.mean)+' W m⁻²',white);
 return svg+text(315,452,'R = '+fixed(f.radius)+'R₀',45,white,'text-anchor="middle"');
}
function average(f,solar){
 const cx=320,cy=217,r=123;let svg=worldBeam(cx,cy,r,solar,f.time)+globe(cx,cy,r,solar,true);
 if(f.scene==='half-only')return svg+text(600,164,'Half is dark…',35,muted,'text-anchor="middle"')+text(600,258,'S / 2 ?',70,white,'text-anchor="middle"')+draw('M497 211L712 275',f.progress,'#ef9c94',6)+centered(448,'Include the slanting illumination too.',38,cyan);
 const entries=[[0,'A','Sun overhead',solar],[60,'B','Slanting at 60°',solar/2],[180,'C','Night',0]];
 if(f.scene!=='global-mean')for(const [i,[a,label,name,value]] of entries.entries()){
  const x=cx-r*Math.cos(a*Math.PI/180),y=cy-r*Math.sin(a*Math.PI/180),ly=105+i*98;
  svg+=`<circle cx="${x}" cy="${y}" r="22" fill="#0b1d32" stroke="${gold}"/>${text(x,y+11,label,32,gold,'text-anchor="middle"')}`;
  svg+=text(530,ly,label+' · '+name,29,muted)+text(530,ly+47,Math.round(value)+' W m⁻²',44,white);
 }
 else svg+=text(590,200,'Whole surface',35,cyan,'text-anchor="middle"')+text(590,274,'4πR²',66,cyan,'text-anchor="middle"');
 svg+=centered(437,'Whole-planet mean: '+Math.round(solar/4)+' W m⁻²',43,gold);
 return svg;
}
function decision(f){
 const id=f.scene,p=f.progress;
 if(['given-mean','double-average'].includes(id))return centered(95,'Given: global mean = 340 W m⁻²',38,cyan)+text(240,239,'340',70,muted)+text(408,239,'÷ 4',70,muted)+text(570,239,'= 85',70,muted)+(id==='double-average'?draw('M393 204L525 255',p,'#ff9b8c',7)+fade(centered(382,'Keep 340 W m⁻²',64,gold),p):'');
 if(id==='separate-absorption')return centered(110,'1. Geometry',43,cyan)+centered(208,'S → S/4',74,white)+fade(centered(335,'2. Reflection & absorption',38,gold)+centered(424,'Account for the reflected fraction',31,muted),p);
 const items=[['local-question','Local region / detector','Use local illumination'],['planet-question','Solar constant for a whole planet','Average once: S/4'],['mean-question','An already averaged intensity','Use the given mean']];
 return items.map(([scene,title,value],i)=>{const y=35+i*152,active=id===scene||['read-question','label-given'].includes(id);return fade(`<rect x="65" y="${y}" width="770" height="128" rx="13" fill="#183d5f" stroke="${active?cyan:muted}" stroke-width="${active?3:1}"/>${text(94,y+49,title,36,white)}${text(94,y+98,value,31,active?gold:muted)}`,active?1:.32);}).join('');
}
function exam(f){return centered(90,'Explain why the global mean is S/4.',40,white)+fade(text(100,225,'1. Intercepted area: πR²',46,gold),f.scene==='exam-areas'?1:f.progress)+fade(text(100,334,'2. Whole surface: 4πR²',46,cyan),f.scene==='exam-areas'?f.progress:0)+line(100,385,800,385,muted,1);}
function reflection(f){return text(60,155,'Incoming mean',34,muted)+text(110,220,'S/4',57,gold)+draw('M75 260H445',1,gold,9)+draw('M445 260L680 80',f.progress,white,6)+fade(text(595,61,'Reflected: a',38,white),f.progress)+draw('M445 260L715 365',f.progress,cyan,7)+fade(text(560,430,'Absorbed: 1 − a',36,cyan),f.progress);}

export function renderScene(frame,solar=1360){
 const renderers={world,disc,power,surface,divide:division,local,size,average,decision,exam,reflection};
 const render=renderers[frame.view];if(!render)throw new Error('Unknown visual scene: '+frame.view);
 return defs+render(frame,solar);
}
