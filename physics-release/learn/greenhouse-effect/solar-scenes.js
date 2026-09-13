import {detectorBudget,facingArea} from './solar-model.js';
import {rayPackets} from './planet-model.js';
const gold='#ffd36c',cyan='#74dde0',white='#edf8ff',muted='#a8c3d9',red='#ffaaa0';
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number(n.toFixed(2)).toLocaleString('en-GB');
const text=(x,y,s,size=38,fill=white,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${safe(s)}</text>`;
const center=(y,s,size=38,fill=white)=>text(450,y,s,size,fill,'text-anchor="middle"');
const line=(x1,y1,x2,y2,fill=gold,width=4,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${fill}" stroke-width="${width}" fill="none" ${extra}/>`;
const fade=(body,p)=>`<g opacity="${p}">${body}</g>`;
const draw=(path,p,fill=gold,width=5)=>`<path d="${path}" fill="none" stroke="${fill}" stroke-width="${width}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-p}"/>`;
const arrow=(x,y,end,fill=gold)=>line(x,y,end,y,fill)+`<path d="M${end-12} ${y-7}L${end} ${y}L${end-12} ${y+7}" fill="none" stroke="${fill}" stroke-width="3"/>`;

function setup(f){
 const p=f.progress,id=f.scene;
 let svg=`<circle cx="92" cy="200" r="49" fill="${gold}"/>${text(92,290,'Sun',35,gold,'text-anchor="middle"')}`;
 svg+=`<circle cx="710" cy="218" r="126" fill="#74dde016" stroke="${cyan}" stroke-dasharray="7 8"/><circle cx="710" cy="218" r="91" fill="#286a7b" stroke="${cyan}"/>`;
 svg+=text(710,232,'Earth',36,white,'text-anchor="middle"')+text(710,382,'Atmosphere',32,cyan,'text-anchor="middle"');
 for(const y of [165,200,235]){svg+=arrow(165,y,510);svg+=rayPackets(1360,f.time,170,500,y).map(v=>line(v.x-8,y,v.x+8,y,white,5)).join('');}
 svg+=fade(`<rect x="515" y="153" width="13" height="94" rx="3" fill="${cyan}"/>${text(460,110,'Detector',34,cyan,'text-anchor="middle"')}${line(460,120,519,149,cyan,2)}`,id==='place-detector'?p:1);
 if(id==='mean-distance')svg+=draw('M100 425H710',p,cyan,3)+center(479,'Earth’s mean distance from the Sun',34,cyan);
 else svg+=center(468,'Outside the atmosphere · directly facing',35,white);
 return svg;
}

// A front-on view of the receiving face: pulses arrive normal to the screen.
function face(area,time,reduced=false){
 const side=200*Math.sqrt(area),x=240-side/2,y=245-side/2;
 let svg=`<rect x="140" y="145" width="200" height="200" fill="none" stroke="${muted}" stroke-dasharray="7 6" opacity=".45"/>`;
 svg+=`<rect class="detector-face" x="${x}" y="${y}" width="${side}" height="${side}" fill="#ffd36c25" stroke="${gold}" stroke-width="4"/>`;
 for(let n=100;n<side;n+=100)svg+=line(x+n,y,x+n,y+side,gold,1,'opacity=".45"')+line(x,y+n,x+side,y+n,gold,1,'opacity=".45"');
 for(let dx=32;dx<side-12;dx+=60)for(let dy=32;dy<side-12;dy+=60){
  const phase=reduced?.55:(time*.85+(dx+dy)/400)%1;
  svg+=`<circle class="arrival-pulse" cx="${x+dx}" cy="${y+dy}" r="${4+phase*12}" fill="${gold}" opacity="${(1-phase)*.6}"/>`;
 }
 svg+=text(240,65,'Detector face',37,white,'text-anchor="middle"')+text(240,425,num(area)+' m²',55,gold,'text-anchor="middle"');
 svg+=text(240,478,'Light arrives perpendicular to this face',24,muted,'text-anchor="middle"');
 return svg;
}
function metric(y,label,value,color,bar=0){
 return `<rect x="470" y="${y}" width="385" height="130" rx="12" fill="#183d5f" stroke="${color}"/>${text(490,y+36,label,28,muted)}${text(490,y+87,value,48,color)}<rect x="490" y="${y+108}" width="340" height="8" rx="4" fill="#0b1d32"/><rect class="quantity-bar" x="490" y="${y+108}" width="${340*Math.min(1,Math.max(0,bar))}" height="8" rx="4" fill="${color}"/>`;
}
function detector(f){
 const area=f.area??1,v=detectorBudget(area,1);
 let svg=face(area,f.time,f.reduced)+metric(90,'Incoming intensity','1360 W m⁻²',cyan,1);
 if(f.scene!=='unit-area')svg+=metric(270,'Received power',num(v.power)+' W',gold,v.power/2720);
 else svg+=fade(text(492,313,'Every 1 m² receives',33,muted)+text(492,374,'1360 W',61,gold),f.progress);
 return svg;
}
function bench(f){
 const v=detectorBudget(f.area??.5,f.exposure??0);
 return face(v.area,f.time,f.reduced)+metric(72,'Power · P = SA',num(v.power)+' W',gold,v.power/2720)+metric(235,'Energy · E = Pt',num(v.energy)+' J',cyan,v.energy/27200)+text(492,427,'Collection time',29,muted)+text(492,480,num(v.seconds)+' s',53,white);
}
function rate(f){
 const p=f.progress,id=f.scene,v=detectorBudget(1,id==='energy-per-second'?f.exposure:0);
 return face(1,f.time,f.reduced)+text(485,128,'S = 1360 W m⁻²',45,cyan)+(id==='energy-per-second'?fade(text(485,246,num(v.energy)+' J',66,gold)+text(485,304,'received in '+num(v.seconds)+' s',35,white)+text(485,405,'1 W = 1 J s⁻¹',43,cyan),p):text(485,265,'1360 W',67,gold)+text(485,327,'for this 1 m²',37,white));
}
function quantity(f){
 const id=f.scene,p=f.progress;
 if(id==='intensity-ratio')return center(90,'Intensity = power ÷ area',41,white)+text(250,280,'S =',77,gold)+fade(text(515,207,'P',85,gold)+line(440,263,590,263,white,3)+text(515,354,'A',85,cyan),p)+center(459,'W / m² = W m⁻²',43,white);
 if(id==='intensity-name')return center(160,'Intensity',65,gold)+fade(center(286,'Power received per unit area',43,white)+center(399,'W m⁻²',62,cyan),p);
 if(id==='not-temperature'||id==='not-luminosity'){
  const temperature=id==='not-temperature';
  return center(91,'Solar constant S',47,gold)+center(174,'1360 W m⁻²',64,cyan)+line(95,235,805,235,muted,2)+fade(center(320,temperature?'Temperature':'Sun’s total emitted power',45,muted)+center(393,temperature?'kelvin (K)':'watts (W)',50,muted)+draw('M210 273L693 416',p,red,4),p)+center(484,'These are different physical quantities.',31,white);
 }
 const rows=[['Intensity','1360 W m⁻²',gold],['Power','680 W',cyan],['Energy (10 s)','6800 J',white]];
 return rows.map(([label,value,color],i)=>`<rect x="65" y="${40+i*153}" width="770" height="127" rx="12" fill="#183d5f" stroke="${color}"/>${text(96,116+i*153,label,37,color)}${text(805,116+i*153,value,51,color,'text-anchor="end"')}`).join('');
}
function atmosphere(f){
 const id=f.scene,p=f.progress,altered=['altered-rays','ground','cloud-question'].includes(id);
 let svg=`<rect x="40" y="211" width="820" height="154" fill="#74dde018"/><path d="M40 419Q430 379 860 419V490H40Z" fill="#286a7b"/>`;
 svg+=text(72,472,'Ground',31,white)+text(555,343,'Atmosphere',32,cyan);
 for(const x of [140,260,380])svg+=draw(`M${x} 46V211`,1,gold,4);
 svg+=`<rect x="579" y="125" width="80" height="10" rx="2" fill="${cyan}"/>${draw('M619 45V121',1,gold)}${text(830,170,'Outside detector',28,cyan,'text-anchor="end"')}`;
 if(id!=='outside')svg+=fade(`<g fill="#c8dce7"><ellipse cx="255" cy="252" rx="89" ry="28"/><ellipse cx="215" cy="235" rx="41" ry="30"/><ellipse cx="277" cy="226" rx="43" ry="36"/></g>`,id==='clouds'?p:1);
 if(altered){
  svg+=draw('M260 212L190 141',id==='altered-rays'?p:1,white)+text(70,111,'Reflected',27,white);
  svg+=draw('M380 211V306',1,gold)+`<circle cx="380" cy="306" r="14" fill="${gold}"/>`+text(408,285,'Absorbed',27,gold);
  svg+=draw('M140 211V407',1,gold)+`<rect x="108" y="403" width="65" height="10" fill="${cyan}"/>`;
  svg+=text(390,385,'Some radiation reaches the ground',27,white);
 }
 return svg;
}
function orientation(f){
 const a=f.angle??0,r=a*Math.PI/180,c=Math.cos(r),sn=Math.sin(r),cx=610,cy=234,L=124;
 let svg=text(58,70,'Parallel sunlight',37,gold);
 const projected=L*c;
 for(let k=-2;k<=2;k++){
  const y=cy+k*projected/2,end=cx-(y-cy)*Math.tan(r);
  svg+=arrow(55,y,end)+rayPackets(1360,f.time,55,end-15,y).map(v=>line(v.x-8,y,v.x+8,y,white,5)).join('');
 }
 svg+=line(cx-L*sn,cy+L*c,cx+L*sn,cy-L*c,cyan,10,'class="fixed-detector"');
 svg+=line(470,cy-projected,470,cy+projected,gold,5,'class="facing-projection"')+line(460,cy-projected,480,cy-projected,gold,3)+line(460,cy+projected,480,cy+projected,gold,3);
 svg+=line(cx,cy,cx-157*c,cy-157*sn,cyan,3,'stroke-dasharray="7 6"');
 if(a>.5){svg+=`<path d="M${cx-65} ${cy}A65 65 0 0 1 ${cx-65*c} ${cy-65*sn}" fill="none" stroke="${cyan}" stroke-width="4"/>`+text(cx-107,cy-46,Math.round(a)+'°',38,cyan);}
 else svg+=draw(`M${cx-28} ${cy}V${cy-28}H${cx}`,f.progress,cyan,3)+text(cx+28,cy-45,'90°',45,cyan);
 svg+=text(712,90,'Detector',33,cyan,'text-anchor="middle"')+text(712,132,'fixed area: 1 m²',28,muted,'text-anchor="middle"');
 svg+=text(75,431,'Facing area',32,muted)+text(75,488,num(facingArea(1,a))+' m²',53,gold)+text(510,431,'Received power',32,muted)+text(510,488,num(facingArea(1,a)*1360)+' W',53,cyan);
 return svg;
}
function localContext(f){
 let svg=`<circle cx="455" cy="324" r="137" fill="#286a7b" stroke="${cyan}"/>`;
 for(const x of [425,455,485])svg+=draw(`M${x} 32V174`,1,gold,4);
 svg+=fade(line(376,177,534,177,cyan,8)+draw('M455 155H477V177',1,cyan,3),f.progress);
 svg+=text(632,154,'Local horizontal',31,cyan,'text-anchor="middle"')+text(632,196,'surface',31,cyan,'text-anchor="middle"');
 svg+=line(533,177,552,173,muted,2)+center(505,f.scene==='one-location'?'One location ≠ a whole-planet average':'Sun overhead → directly facing surface',34,white);
 return svg;
}
function equation(f){
 const id=f.scene,p=f.progress;
 if(id.startsWith('units')){
  const cancel=id==='units-cancel'||id==='units-result',remain=id==='units-result'?1-p:1;
  return center(65,'Check the dimensions',39,white)+text(225,197,'W',81,gold)+fade(line(155,249,295,249,white,3)+text(225,334,'m²',69,cyan)+text(374,266,'×',59,white)+text(503,269,'m²',69,cyan),remain)+fade(text(655,268,'= W',77,gold),id==='units-result'?p:0)+(cancel?fade(draw('M156 348L296 282',id==='units-cancel'?p:1,cyan,5)+draw('M434 281L570 219',id==='units-cancel'?p:1,cyan,5),remain):'')+center(453,'Power is measured in watts.',39,white);
 }
 if(id.startsWith('energy'))return center(90,'Energy = power × time',43,white)+fade(center(213,id==='energy-result'?'E = 680 × 10':'E = P × t',70,cyan),p)+(id==='energy-result'?fade(center(332,'E = 6800 J',80,gold)+center(444,'W × s = J',43,white),p):center(413,'The question must ask for energy.',34,muted));
 const result=id==='power-result',sub=['power-substitute','power-result'].includes(id);
 return center(95,'Power = intensity × facing area',39,white)+fade(center(223,sub?'P = 1360 × 0.50':'P = S × A',71,gold),id==='power-question'?.3:p)+(result?fade(center(354,'P = 680 W',81,cyan),p):center(389,'Outside the atmosphere · directly facing',33,muted));
}
function definition(f){
 const id=f.scene,p=f.progress;
 if(id==='value-alone')return center(133,'1360 W m⁻²',77,gold)+fade(center(270,'A value alone does not define S.',40,white)+center(395,'Add the quantity and the conditions.',35,cyan),p);
 const hidden=id==='recall-hidden',intro=['definition-start','two-conditions'].includes(id);
 const stage=id.endsWith('quantity')?0:id.endsWith('location')?1:2;
 const rows=hidden?[['What is the physical quantity?',''],['Where is it measured?',''],['Which way does the surface face?','']]:[['Radiant power received','per unit area'],['Outside the atmosphere','at Earth’s mean distance'],['Surface perpendicular','to the incoming rays']];
 return rows.map(([a,b],i)=>{
  const active=!intro&&i<=stage,visible=hidden||active||intro;
  return fade(`<rect x="55" y="${30+i*157}" width="790" height="137" rx="12" fill="#183d5f" stroke="${active?cyan:muted}"/>${text(80,89+i*157,(i+1)+' · '+a,38,active?white:muted)}${text(127,136+i*157,b,33,active?gold:muted)}`,visible?(i===stage&&!hidden&&!intro?p:1):.13);
 }).join('');
}
function decision(f){
 const id=f.scene,p=f.progress;
 if(['circle-conditions','choose-detector'].includes(id))return center(76,'Read the detector setup',40,white)+text(75,168,'A detector outside the atmosphere',36,white)+text(75,237,'faces sunlight directly.',36,white)+draw('M325 183H807',p,cyan,4)+draw('M74 251H459',p,cyan,4)+(id==='choose-detector'?fade(center(383,'P = S × A',79,gold),p):center(420,'Mark the location and orientation.',35,cyan));
 if(id==='stop-at-power')return center(80,'Question: find the power',43,white)+center(210,'P = 680 W',79,gold)+fade(center(337,'× 10 s → energy',49,muted)+draw('M200 290L702 356',p,red,5),p)+center(469,'Stop once the requested quantity is found.',32,cyan);
 if(['next-four','no-extra-four'].includes(id))return center(85,'Directly facing detector',43,white)+center(199,'P = 1360 × 0.50',65,gold)+center(288,'= 680 W',71,cyan)+text(450,405,'÷ 4 ?',57,muted,'text-anchor="middle"')+(id==='no-extra-four'?draw('M347 364L549 424',p,red,6):'')+center(484,'Whole-planet averaging comes next.',31,white);
 const direct=id==='direct-value',average=id==='averaged-value';
 return fade(`<rect x="65" y="60" width="770" height="172" rx="13" fill="#183d5f" stroke="${cyan}"/>${text(94,124,'Directly facing intensity',43,white)}${text(94,186,'Use it with the facing detector area.',33,gold)}`,average?.3:1)+fade(`<rect x="65" y="281" width="770" height="172" rx="13" fill="#183d5f" stroke="${cyan}"/>${text(94,345,'Already averaged intensity',43,white)}${text(94,407,'Use the stated average for its model.',33,gold)}`,direct?.3:1);
}
export function renderSolarScene(f){
 const views={setup,detector,bench,rate,quantity,atmosphere,orientation,'local-context':localContext,equation,definition,decision};
 if(!views[f.view])throw new Error('Unknown solar scene: '+f.view);
 return views[f.view](f);
}
