(function(){
 'use strict';
 const decimal=n=>n===100?'1.00':`0.${String(n).padStart(2,'0')}`;
 function objects(m){
  const kind=m.object,n=m.percent;
  if(!['students','bulbs','targets','battery'].includes(kind))return window.RevilyPlaceValue.grid(n,100);
  const side=24,margin=kind==='battery'?16:2;
  let marks=Array.from({length:100},(_,i)=>{const x=margin+i%10*side,y=margin+Math.floor(i/10)*side,yes=i<n,fill=yes?(kind==='bulbs'?'#fee2e2':'#b8e8e0'):'#fff',stroke=yes?(kind==='bulbs'?'#a92332':'#23655d'):'#76838c';let icon='';
   if(kind==='students')icon=`<circle cx="${x+12}" cy="${y+7}" r="4" fill="${stroke}"/><path d="M${x+6} ${y+21} v-6 q6-8 12 0 v6" fill="${stroke}"/>`;
   if(kind==='bulbs')icon=`<path d="M${x+8} ${y+16} c0-4-3-4-3-8 a7 7 0 0 1 14 0 c0 4-3 4-3 8 z M${x+8} ${y+19} h8 M${x+10} ${y+22} h4" fill="none" stroke="${stroke}" stroke-width="1.5"/>${yes?`<path d="M${x+8} ${y+5} l8 8 m-8 0 l8-8" stroke="#a92332" stroke-width="2"/>`:''}`;
   if(kind==='targets')icon=`<circle cx="${x+12}" cy="${y+12}" r="8" fill="none" stroke="${stroke}"/>${yes?`<path d="M${x+7} ${y+12} l4 4 7-8" fill="none" stroke="${stroke}" stroke-width="2"/>`:''}`;
   return `<g data-percent-cell="${i}" data-selected="${yes}"><rect x="${x}" y="${y}" width="24" height="24" fill="${fill}" stroke="#94a3b8" stroke-width=".65"/>${icon}</g>`;}).join('');
  if(kind==='battery')marks=`<rect x="9" y="9" width="254" height="254" rx="6" fill="none" stroke="#234e52" stroke-width="4"/><rect x="264" y="101" width="10" height="64" rx="2" fill="#234e52"/>`+marks;
  return `<svg class="ph-object-grid" viewBox="0 0 ${kind==='battery'?280:244} ${kind==='battery'?274:244}" aria-hidden="true">${marks}</svg>`;
 }
 function lines(m){return m.steps||[`${m.percent}% means ${m.percent} parts out of 100.`,`${m.percent} parts out of 100 = ${m.percent}/100.`,`${m.percent}/100 = ${m.percent} hundredths = ${decimal(m.percent)}.`];}
 function render(m,reveal,shown=1){const {escapeHtml:esc,mathMarkup:math}=window.RevilyVisuals;let html=`<div class="ph-model"><h2>${esc(m.title)}</h2>${m.given?`<p class="ph-given">${math(m.given)}</p>`:''}`;
  if(m.object==='rule')return html+(reveal?'<p class="ph-rule">Percent means out of 100.</p>':'<p>The explanation is not shown.</p>')+'</div>';
  if(m.model_given||reveal)html+=`<figure>${objects(m)}<figcaption>${esc(m.model_caption||'One whole divided into 100 equal parts.')}</figcaption></figure>`;
  if(reveal){const count=m.phase||shown;html+=`<ol class="ph-bridge">${lines(m).slice(0,count).map(line=>`<li>${math(line)}</li>`).join('')}</ol>`;if(count>=3&&m.percent<10)html+=`<table class="pv-chart"><caption>The zero holds the tenths place</caption><thead><tr><th>Ones</th><th>Tenths</th><th>Hundredths</th></tr></thead><tbody><tr><td>0</td><td>0</td><td>${m.percent}</td></tr></tbody></table>`;}
  else html+=m.explanation_question?'<p>The explanation is not shown.</p>':'<p>The requested forms are not shown.</p>';
  return html+'</div>';
 }
 function accessible(m,reveal,shown=1){const base=m.title+'. '+(m.given?m.given+'. ':'');if(m.object==='rule')return base+(reveal?'Percent means out of one hundred.':'The explanation is not shown.');const model=m.model_given||reveal?(m.object==='students'?`One hundred students; ${m.percent} marked as choosing football. `:m.object==='bulbs'?`One hundred bulbs; ${m.percent} faulty bulbs marked with a cross. `:m.object==='targets'?`One hundred targets; ${m.percent} marked as reached. `:m.object==='battery'?`Full battery capacity divided into one hundred equal regions; ${m.percent} filled. `:`One whole divided into one hundred equal squares; ${m.percent} shaded. `):'';return base+model+(reveal?lines(m).slice(0,m.phase||shown).join(' '):m.explanation_question?'The explanation is not shown.':'The requested forms are not shown.');}
 window.RevilyPercentHundred={decimal,objects,lines,render,accessible};
})();
