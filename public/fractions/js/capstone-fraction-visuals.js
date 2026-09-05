(function(){
 'use strict';
 const checklist=[['Identify the target','A total joins amounts. A remainder, difference or missing part uses subtraction.'],['Identify the number form','Notice proper fractions, improper fractions and mixed numbers.'],['Prepare the fractions','Use matching denominators and equivalent fractions when needed.'],['Check mixed-number structure','Decide whether a new whole is regrouped or an existing whole is exchanged.'],['Calculate accurately','Keep the operation order and carry updated amounts forward.'],['Finish the answer','Simplify and use the requested form and unit.']];
 function render(m,reveal,shown){
  const {mathMarkup:math,escapeHtml:esc}=window.RevilyVisuals;
  if(m.kind==='capstone_method')return `<div class="os-capstone-method"><h2>Choose the method from the question</h2><ol>${checklist.map(([title,body])=>`<li><h3>${title}</h3><p>${body}</p></li>`).join('')}</ol></div>`;
  let html=`<div class="os-capstone-problem"><h2>${esc(m.title)}</h2>`;
  if(m.givens?.length)html+=`<div class="os-at-events">${m.givens.map(g=>`<section>${window.RevilyFractionSituation.icon(m.object)}<h3>${esc(g.label)}</h3><p>${math(g.value+(m.unit?' '+m.unit:''))}</p></section>`).join('')}</div>`;
  else html+=`<p class="os-capstone-expression">${math(m.expression)}</p>`;
  if(m.student_lines)html+=`<ol class="os-capstone-student">${m.student_lines.map(line=>`<li>${math(line)}</li>`).join('')}</ol>`;
  if(reveal){
   if(m.workspace){html+=`<p>Arithmetic model${m.unit_name?`: one whole represents 1 ${esc(m.unit_name)}`:''}.</p>`+window.RevilyOperationVisuals.renderMarkup({model:m.workspace},{feedback:'support',workingRevealed:shown||1});}
   else if(m.completed)html+=`<p data-capstone-completed="">${math(m.completed)}</p>`;
  }else html+=m.student_lines?'<p>The student’s work is shown. The correction is not shown.</p>':'<p>The method and final answer are not shown.</p>';
  return html+'</div>';
 }
 function accessible(m,reveal,shown){
  if(m.kind==='capstone_method')return checklist.map(([title,body])=>title+': '+body).join(' ');
  const base=m.title+'. '+(m.givens?.map(g=>g.label+': '+g.value+' '+(m.unit||'')).join('. ')||m.expression)+'. '+(m.student_lines?.join('. ')||'');
  return base+(reveal?(m.workspace?` Arithmetic model${m.unit_name?'; one whole is one '+m.unit_name:''}. `+window.RevilyOperationVisuals.accessibleDescription({model:m.workspace},{feedback:'support',workingRevealed:shown||1}):' '+m.completed):m.student_lines?' The student’s work is shown. The correction is not shown.':' The method and final answer are not shown.');
 }
 window.RevilyCapstoneFractionVisuals={render,accessible};
})();
