import {radiationBudget,iceBudget,compareAlbedos} from './albedo-model.js';
const gold='#ffd36c',cyan='#74dde0',white='#edf8ff',muted='#a8c3d9',red='#ffaaa0';
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number(n.toFixed(2)).toLocaleString('en-GB');
const pct=n=>num(100*n)+'%';
const t=(x,y,s,size=37,color=white,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${safe(s)}</text>`;
const c=(y,s,size=39,color=white)=>t(450,y,s,size,color,'text-anchor="middle"');
const line=(x1,y1,x2,y2,color=muted,width=3,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none" ${extra}/>`;
const fade=(s,p)=>`<g opacity="${Math.max(0,Math.min(1,p))}">${s}</g>`;
const draw=(path,p,color=cyan,width=4)=>`<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-p}"/>`;
const arrowColors={[gold]:'gold',[cyan]:'cyan',[white]:'white',[red]:'red'};
const arrowDefs='<defs>'+Object.entries(arrowColors).map(([color,id])=>`<marker id="albedo-arrow-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')+'</defs>';
const flow=(path,p,color=cyan,width=4)=>draw(path,p,color,width).replace('/>',` marker-end="url(#albedo-arrow-${arrowColors[color]})"/>`);
function stream(x1,y1,x2,y2,power,time,color,kind,reveal=1){
 if(power<=0||reveal<=0)return '';
 const length=Math.hypot(x2-x1,y2-y1),dx=(x2-x1)/length,dy=(y2-y1)/length,w=48*power/600,end=length*reveal,spacing=95*340/power;
 let svg=line(x1,y1,x1+dx*end,y1+dy*end,color,w,`class="${kind}-beam" stroke-linecap="butt" opacity=".65"`);
 for(let d=(time*115)%spacing;d<end-10;d+=spacing)svg+=line(x1+dx*d,y1+dy*d,x1+dx*(d+9),y1+dy*(d+9),color,Math.min(w,6));
 const ex=x1+dx*end,ey=y1+dy*end,h=9+w*.3;
 svg+=`<path d="M${ex-dx*h-dy*h} ${ey-dy*h+dx*h}L${ex} ${ey}L${ex-dx*h+dy*h} ${ey-dy*h-dx*h}" fill="none" stroke="${color}" stroke-width="3"/>`;
 return svg;
}
function split(f){
 const v=radiationBudget(f.incident??340,f.albedo??.3),intro=f.scene==='arrival',ref=f.scene==='reflection';
 const p=f.progress;
 let svg=stream(70,252,401,252,v.incident,f.time,gold,'incoming',intro?p:1);
 svg+=stream(459,235,684,106,v.reflected,f.time,white,'reflected',intro?0:ref?p:1);
 svg+=stream(459,278,684,407,v.absorbed,f.time,cyan,'absorbed',intro?0:ref?p:1);
 svg+=`<rect x="402" y="218" width="65" height="76" rx="13" fill="#27516b" stroke="${cyan}"/>`;
 if(f.scene==='boundary')svg+=draw('M365 185H875V488H365Z',p,muted,2);
 svg+=t(70,158,'Incoming',34,gold)+t(70,202,num(v.incident)+' W m⁻²',43,gold);
 svg+=fade(t(565,49,'Reflected',34,white)+t(711,125,num(v.reflected),47,white)+t(711,166,'W m⁻²',29,muted),intro?0:1);
 svg+=fade(t(565,359,'Absorbed',34,cyan)+t(711,421,num(v.absorbed),47,cyan)+t(711,462,'W m⁻²',29,muted),intro?0:1);
 return svg+c(500,'α = '+num(v.albedo)+'   ·   absorbed fraction = '+num(1-v.albedo),35,white);
}
function shares(f){
 const a=f.albedo??.3,n=Math.round(a*100),p=f.progress,id=f.scene;
 let svg=t(230,57,'100 equal shares',34,white,'text-anchor="middle"');
 for(let i=0;i<100;i++){const x=80+(i%10)*30,y=85+Math.floor(i/10)*30;svg+=`<rect x="${x}" y="${y}" width="25" height="25" rx="3" fill="${i<n?white:cyan}" opacity="${id==='thirty'&&i<n?.25+.75*p:.85}"/>`;}
 svg+=t(455,153,pct(a)+' reflected',45,white)+t(455,230,pct(1-a)+' absorbed',43,cyan);
 if(['percent','decimal','not-thirty'].includes(id))svg+=fade(t(455,337,'30 ÷ 100 = 0.30',39,gold),p);
 else svg+=t(455,337,'α = '+num(a),60,gold);
 if(id==='not-thirty')svg+=t(453,425,'Use 0.30, not 30.',35,white);
 else svg+=t(230,445,'Each tile is 1% of the input.',27,muted,'text-anchor="middle"');
 if(id==='not-absorbed')svg+=fade(line(450,247,830,247,cyan,4),p);
 return svg;
}
function ratio(f){
 const id=f.scene,p=f.progress,numeric=['numeric-ratio','numeric-answer','wrong-numeric','wrong-result'].includes(id),wrong=id.startsWith('wrong');
 if(['units','cancel-units','no-unit'].includes(id)){
  const vanish=id==='no-unit'?1-p:1;
  return c(77,'A ratio of two powers',42)+fade(t(355,211,'W',82,gold)+line(297,269,422,269,white)+t(355,359,'W',82,cyan),vanish)+(id!=='units'?fade(draw('M304 225L416 154',id==='cancel-units'?p:1,gold,6)+draw('M304 372L416 302',id==='cancel-units'?p:1,cyan,6),vanish):'')+fade(c(292,'No unit',70,white),id==='no-unit'?p:0)+c(462,id==='no-unit'?'Albedo is dimensionless.':'Same unit above and below',37,white);
 }
 let svg=c(66,'Albedo = reflected / incident',40,white);
 svg+=t(110,282,'α =',72,gold);
 svg+=fade(t(475,200,numeric?'100':'Reflected power',numeric?75:42,white,'text-anchor="middle"'),id==='definition'?p:1);
 svg+=line(290,251,666,251,white,3);
 const denominator=numeric?(wrong?'400':'500'):(wrong?'Absorbed power':'Incident power');
 svg+=fade(t(475,342,denominator,numeric?75:42,wrong?red:cyan,'text-anchor="middle"'),id==='definition'?.2:id==='denominator'?p:1);
 if(wrong)svg+=draw('M294 364L660 289',p,red,6)+c(464,numeric?'Use the incoming total: 500.':'Compare reflection with the input.',34,white);
 if(id==='numeric-answer')svg+=fade(t(696,282,'= 0.20',45,gold),p);
 if(id==='wrong-result')svg+=t(687,278,'= 0.25',45,muted);
 return svg;
}
function account(f){
 const id=f.scene,p=f.progress,first=id==='given-reflected',add=id==='add-total';
 const card=(x,label,value,color,opacity)=>fade(`<rect x="${x}" y="99" width="325" height="151" rx="12" fill="#193d5d" stroke="${color}"/>${t(x+23,149,label,33,color)}${t(x+23,216,value,61,color)}`,opacity);
 let svg=card(65,'Reflected','100',white,1)+t(430,204,'+',57,white)+card(510,'Absorbed','400',cyan,first?0:id==='given-absorbed'?p:1);
 svg+=c(294,'All intensities in W m⁻²',29,muted);
 if(add)svg+=fade(c(385,'Incoming = 100 + 400',45,gold)+c(466,'= 500 W m⁻²',57,gold),p);
 else svg+=c(389,id==='two-flows'?'No transmission or other input':'Incoming = ?',44,gold)+c(467,'Recover the input before taking the ratio.',31,white);
 return svg;
}
function complement(f){
 const p=f.progress,id=f.scene;
 const cut=228;
 let svg=`<rect x="70" y="80" width="${cut}" height="90" fill="${white}"/><rect x="${70+cut}" y="80" width="${760-cut}" height="90" fill="${cyan}"/>`;
 svg+=t(184,139,'α',56,'#183d5f','text-anchor="middle"')+t(564,139,'absorbed',43,'#183d5f','text-anchor="middle"');
 svg+=c(258,'α + absorbed fraction = 1',46,white);
 if(id==='one-minus')svg+=fade(c(379,'Absorbed fraction = 1 − α',48,gold)+c(471,'For α = 0.30:  1 − 0.30 = 0.70',38,cyan),p);
 else svg+=fade(c(394,id==='alpha'?'α is the reflected share.':'The shares recover the whole input.',40,white),p);
 return svg;
}
function absorption(f){
 const id=f.scene,p=f.progress;
 if(id==='given-input')return c(98,'Given: mean incident intensity',44,gold)+fade(c(278,'340 W m⁻²',88,white),p)+c(425,'This value has already been averaged.',35,cyan);
 if(id==='conservation')return c(83,'Check the radiation account',42)+t(90,224,'102',77,white)+t(287,224,'+',62,muted)+t(389,224,'238',77,cyan)+fade(t(590,224,'= 340',76,gold),p)+t(90,290,'reflected',31,white)+t(389,290,'absorbed',31,cyan)+t(634,290,'incoming',31,gold)+c(427,'W m⁻²',44,muted);
 if(id==='reflected-result')return c(89,'Reflected fraction = α',43,white)+fade(c(237,'I reflected = 0.30 × 340',51,white)+c(373,'= 102 W m⁻²',75,gold),p);
 let svg=c(68,'Mean input: 340 W m⁻²',40,gold);
 if(id!=='given-input')svg+=fade(c(166,'1 − 0.30 = 0.70',60,cyan),id==='given-albedo'?p:1);
 if(['multiply','absorbed-result'].includes(id))svg+=fade(c(292,'I absorbed = 0.70 × 340',50,cyan),id==='multiply'?p:1);
 if(id==='absorbed-result')svg+=fade(c(429,'= 238 W m⁻²',72,gold),p);
 return svg;
}
function extraFlows(f){
 const layer=f.scene==='atmosphere';
 let svg=c(60,layer?'Atmosphere and surface: name the boundary':'Check for an additional outgoing flow',35,white);
 svg+=draw('M305 100H590V450H305Z',1,muted,2);
 svg+=line(60,245,390,245,gold,12)+t(72,210,'Incoming',32,gold);
 svg+=flow('M455 220L700 130',f.progress,white,9)+t(660,93,'Reflected',31,white);
 svg+=draw(layer?'M455 254H535':'M455 254H725',f.progress,cyan,9)+t(603,296,layer?'Atmosphere absorbs':'Transmitted',26,cyan);
 svg+=flow('M455 289L525 385',f.progress,gold,9)+t(610,428,layer?'Surface absorbs':'Absorbed',29,gold);
 svg+=c(507,layer?'Trace each layer separately.':'With transmission: absorbed = 1 − α − τ',34,white);
 return svg;
}
function emission(f){
 const id=f.scene,p=f.progress,showEmit=id!=='reflect';
 let svg=`<rect x="60" y="329" width="780" height="126" fill="#275b6d"/>`;
 svg+=flow('M115 90L300 325',1,gold,8)+flow('M315 320L462 115',1,white,6)+flow('M310 338V418',1,cyan,7);
 svg+=t(65,59,'Incoming sunlight',31,gold)+t(419,84,'Reflected',31,white)+t(205,490,'Absorbed',31,cyan);
 if(showEmit)svg+=flow('M667 327C624 294 710 264 667 231S624 168 667 111',id==='emit'?p:1,red,7)+t(633,64,'Emitted IR',32,red);
 if(['albedo-only','not-emitted','no-temperature'].includes(id))svg+=fade(c(278,'α = reflected / incident',39,white),p);
 if(id==='equilibrium')svg+=fade(c(274,'At equilibrium: P absorbed = P emitted',32,white),p);
 if(id==='label-incoming')svg+=draw('M59 75H354',p,gold,4);
 if(id==='label-all')svg+=draw('M415 96H598',p,white,4)+draw('M629 77H821',p,red,4)+draw('M200 503H369',p,cyan,4);
 if(id==='not-emitted')svg+=draw('M626 85L746 306',p,red,4);
 if(id==='no-temperature')svg+=fade(c(516,'Find the reflection ratio; no T calculation needed.',27,white),p);
 return svg;
}

function cloud(cx,cy,scale=1,opacity=1){return `<g transform="translate(${cx} ${cy}) scale(${scale})" fill="#d9e8ef" opacity="${opacity}"><ellipse cx="0" cy="0" rx="68" ry="22"/><ellipse cx="-28" cy="-16" rx="30" ry="25"/><ellipse cx="20" cy="-24" rx="36" ry="30"/></g>`;}
function patch(x,y,name,type){
 let svg=`<rect x="${x}" y="${y}" width="195" height="155" rx="12" fill="${type==='snow'?'#e6f3f8':type==='ocean'?'#174a74':type==='vegetation'?'#316a54':'#315570'}"/>`;
 if(type==='snow')svg+=`<path d="M${x+25} ${y+91}L${x+65} ${y+26}L${x+100} ${y+84}L${x+135} ${y+42}L${x+169} ${y+91}Z" fill="#a6cbdc"/>`;
 if(type==='ocean')for(let i=0;i<3;i++)svg+=`<path d="M${x+25} ${y+40+i*22}q25 -15 50 0t50 0t40 0" fill="none" stroke="${cyan}" stroke-width="3"/>`;
 if(type==='vegetation')for(let i=0;i<3;i++)svg+=`<path d="M${x+28+i*55} ${y+94}l25 -63l25 63Z" fill="#7bc98e"/>`;
 if(type==='cloud')svg+=cloud(x+98,y+77,.85);
 return svg+t(x+98,y+135,name,25,type==='snow'?'#173450':white,'text-anchor="middle"');
}
function mosaic(f){
 const p=f.progress,id=f.scene;
 const patches=[patch(40,75,'Snow / ice','snow'),patch(250,75,'Ocean','ocean'),patch(40,252,'Vegetation','vegetation'),patch(250,252,'Cloud tops','cloud')];
 let svg=patches.map((body,i)=>fade(body,id==='surfaces'?Math.min(1,Math.max(.1,p*4-i)):id==='average'?.35:1)).join('');
 if(['changing','change-average'].includes(id))svg+=cloud(140,210,.7,p);
 svg+=draw('M475 237H530',p,cyan,4)+`<rect x="548" y="144" width="301" height="187" rx="15" fill="#193d5d" stroke="${cyan}"/>`;
 svg+=t(698,203,'One average',36,white,'text-anchor="middle"')+t(698,269,id==='change-average'?'α → new α':'α',id==='change-average'?44:73,gold,'text-anchor="middle"');
 if(id==='not-uniform')svg+=draw('M465 115L821 347',p,'#ffaaa0',4);
 return svg+c(471,id==='not-uniform'?'Different patches need not share that value.':'Weight regions by the incoming power.',34,white);
}
function latitude(f){
 const cx=550,cy=260,r=162,p=f.progress;
 let svg=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#245b70" stroke="${cyan}" stroke-width="3"/>`;
 for(const y of [cy-110,cy,cy+110]){const edge=cx-Math.sqrt(r*r-(y-cy)**2);svg+=stream(55,y,edge,y,180,f.time,gold,'latitude-ray');svg+=line(edge,y,cx+Math.sqrt(r*r-(y-cy)**2),y,cyan,1,'stroke-dasharray="7 6"');}
 if(f.scene==='polar-ice')svg+=fade(`<path d="M425 159A162 162 0 0 1 675 159Q550 215 425 159Z" fill="#e4f4f9"/>`,p);
 svg+=t(55,68,'Parallel sunlight',35,gold)+t(755,157,'High',28,white)+t(755,196,'latitude',28,white)+t(755,291,'Equator',28,white);
 return svg+c(479,'Compare illumination and surface conditions.',36,white);
}
function daily(f){
 const cover=f.cloud??0,p=f.progress,id=f.scene;
 let svg=`<rect x="40" y="379" width="820" height="93" fill="#2e665f"/>`;
 const sunX=id==='day-change'?110+140*p:110;
 svg+=`<circle cx="${sunX}" cy="82" r="34" fill="${gold}"/>`;
 svg+=draw(`M${sunX+27} 119L444 290`,1,gold,8);
 svg+=flow('M455 288L708 138',cover,white,5+cover*8)+cloud(451,287,1.2,.25+.75*cover);
 svg+=flow('M445 307L558 374',1,gold,9-6*cover);
 svg+=t(660,96,'Reflected sunlight',30,white,'text-anchor="middle"')+c(504,'Cloud and illumination conditions can change.',33,white);
 return svg;
}
function factors(f){
 const id=f.scene,p=f.progress;
 if(['factor-link','identify-change','not-list'].includes(id))return c(82,'Make the connection explicit',41,white)+fade(c(179,'Named factor',46,gold)+flow('M450 200V234',1,cyan,4)+c(289,'Changed reflecting conditions',42,white)+flow('M450 309V349',1,cyan,4)+c(413,'Changed reflected fraction',43,cyan),p);
 return ['Daily variation','Cloud formation','Latitude'].map((label,i)=>`<rect x="75" y="${45+i*151}" width="750" height="113" rx="12" fill="#183d5f" stroke="${cyan}"/>${t(110,115+i*151,(i+1)+' · '+label,45,white)}`).join('');
}
function intensityCompare(f){
 const I=f.incident??250,a=f.albedo??.3,power=radiationBudget(I,a);
 let svg=split({...f,incident:I,albedo:a,scene:'steady'});
 svg+=c(48,'Same α = 0.30 as the input changes',33,white);
 // The fraction is defined for these positive inputs; zero input is handled in the experiment caption.
 return svg+t(77,355,num(power.reflected)+' / '+num(I)+' = 0.30',37,white);
}
function ice(f){
 const v=iceBudget(f.ice??1,f.incident??340),p=f.progress;
 let svg=c(46,'Fixed incoming sunlight: '+num(v.incident)+' W m⁻²',35,gold);
 svg+=`<rect x="75" y="115" width="365" height="195" rx="10" fill="#164772"/>`;
 for(let i=0;i<4;i++)svg+=`<path d="M85 ${150+i*36}q45 -13 90 0t90 0t90 0t75 0" fill="none" stroke="${cyan}" stroke-width="2" opacity=".5"/>`;
 const width=365*v.ice;
 svg+=`<rect class="ice-cover" x="75" y="115" width="${width}" height="195" fill="#e5f4f9"/>`;
 if(width>40)svg+=t(75+width/2,218,'Ice',33,'#1d425d','text-anchor="middle"');
 if(width<240)svg+=t(75+width+(365-width)/2,265,'Water',30,white,'text-anchor="middle"');
 svg+=t(78,373,pct(v.ice)+' ice cover',43,white)+t(78,428,'α = '+num(v.albedo),52,gold);
 svg+=t(512,123,'Reflected',32,white)+t(512,171,num(v.reflected)+' W m⁻²',43,white)+`<rect x="512" y="197" width="${300*v.albedo}" height="20" fill="${white}" class="ice-reflected"/>`;
 svg+=t(512,299,'Absorbed',32,cyan)+t(512,347,num(v.absorbed)+' W m⁻²',43,cyan)+`<rect x="512" y="373" width="${300*(1-v.albedo)}" height="20" fill="${cyan}" class="ice-absorbed"/>`;
 return svg+c(493,'Illustrative model: ice α = 0.60; water α = 0.10.',28,muted);
}
function feedback(f){
 const id=f.scene,p=f.progress,stage=id==='absorption-warming'?2:id==='more-melting'?3:4;
 const boxes=[[55,82,'Initial warming'],[500,82,'Less ice'],[500,274,'Lower albedo'],[55,274,'More absorption']];
 let svg=boxes.map(([x,y,label],i)=>fade(`<rect x="${x}" y="${y}" width="345" height="99" rx="12" fill="#193d5d" stroke="${i===0?red:cyan}"/>${t(x+172,y+62,label,36,i===0?red:white,'text-anchor="middle"')}`,id==='initial-change'&&i>0?.3:1)).join('');
 svg+=flow('M410 131H488',id==='more-melting'?p:1,cyan,5)+flow('M672 189V262',1,cyan,5)+flow('M488 323H411',1,cyan,5);
 svg+=flow('M225 263V193',id==='absorption-warming'?p:1,red,6);
 if(id==='close-loop')svg+=draw('M34 62H864V393H34Z',p,red,3);
 return svg+c(455,id==='close-loop'?'The response reinforces the initial warming.':'More absorption can contribute to further warming.',34,white);
}
function mechanisms(f){
 const ir=f.scene==='infrared-mechanism',p=f.progress;
 return fade(`<rect x="50" y="55" width="365" height="393" rx="14" fill="#183d5f" stroke="${gold}"/>${t(232,121,'Ice–albedo',41,gold,'text-anchor="middle"')}${draw('M100 191L240 306L351 191',1,gold,7)}${t(232,377,'Reflected sunlight',31,white,'text-anchor="middle"')}`,ir?.4:1)+fade(`<rect x="485" y="55" width="365" height="393" rx="14" fill="#183d5f" stroke="${red}"/>${t(667,121,'Greenhouse gases',36,red,'text-anchor="middle"')}${draw('M667 326C629 294 705 266 667 236S629 175 667 170',1,red,7)}<circle cx="667" cy="164" r="18" fill="${red}"/>${t(667,377,'Infrared absorption',31,white,'text-anchor="middle"')}`,f.scene==='ice-mechanism'?.25:ir?p:1)+c(501,'Different radiation pathways',35,white);
}
function compare(f){
 const v=compareAlbedos(f.before??.4,f.albedo??.3,f.incident??340),id=f.scene,p=f.progress;
 const col=(x,label,b)=>`<text x="${x+169}" y="128" font-size="37" fill="${white}" text-anchor="middle">${label}</text><rect x="${x}" y="170" width="338" height="77" fill="${cyan}"/><rect class="compare-reflected" x="${x}" y="170" width="${338*b.albedo}" height="77" fill="${white}"/>${t(x+169,311,'α = '+num(b.albedo),48,gold,'text-anchor="middle"')}${t(x+169,371,pct(1-b.albedo)+' absorbed',38,cyan,'text-anchor="middle"')}${t(x+169,429,num(b.absorbed)+' W m⁻²',42,white,'text-anchor="middle"')}`;
 return c(56,'Same input: '+num(v.before.incident)+' W m⁻²',39,gold)+col(62,'Before',v.before)+fade(col(501,'After',v.after),id==='before'?.25:1)+c(494,'White: reflected   ·   Cyan: absorbed',30,muted);
}
function difference(f){
 const id=f.scene,p=f.progress;
 if(id==='three-answers')return [['Difference','238 − 204 = 34 W m⁻²'],['Ratio','238 / 204 ≈ 1.167'],['Percentage change','34 / 204 × 100% ≈ 16.7%']].map(([label,value],i)=>`<rect x="55" y="${29+i*157}" width="790" height="140" rx="12" fill="#183d5f" stroke="${cyan}"/>${t(83,78+i*157,label,32,muted)}${t(83,137+i*157,value,42,white)}`).join('');
 if(id==='percent-base')return c(76,'Relative to the original absorbed intensity',33,white)+t(366,194,'34',79,gold)+line(283,239,448,239,white)+t(366,329,'204',79,cyan)+t(494,265,'× 100%',54,white)+fade(c(430,'≈ 16.7%',81,gold),p);
 return c(70,'Find the change in absorbed intensity',37,white)+c(203,'238 − 204 = 34 W m⁻²',58,cyan)+fade(c(345,'0.70 − 0.60 = 0.10',55,gold)+c(444,'0.10 × 340 = 34 W m⁻²',49,white),p);
}
function cloudEffects(f){
 const id=f.scene,p=f.progress;
 let svg=cloud(450,237,1.7)+flow('M105 66L422 191',1,gold,8)+flow('M452 171L704 69',1,white,7)+t(79,425,'Sunlight reflection',33,gold);
 if(id!=='no-temperature')svg+=flow('M666 391C632 358 700 331 666 294S632 236 570 229',id==='infrared'?p:1,red,7)+t(587,425,'Infrared effects',33,red);
 return svg+c(499,id==='fixed-effects'?'State which effects are held fixed.':'A full energy balance needs both pathways.',33,white);
}
export function renderAlbedoScene(f){
 const views={split,shares,ratio,account,complement,absorption,'extra-flows':extraFlows,emission,mosaic,latitude,daily,factors,'intensity-compare':intensityCompare,ice,feedback,mechanisms,compare,difference,'cloud-effects':cloudEffects};
 if(!views[f.view])throw new Error('Unknown albedo view: '+f.view);
 return arrowDefs+views[f.view](f);
}
