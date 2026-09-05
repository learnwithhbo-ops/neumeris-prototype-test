(function(){
 'use strict';
 const proto=window.RevilyLessonEngine.LessonEngine.prototype,enabled=e=>e.spec.experience_contract?.place_value_profile===true;
 function extend(name,handler){const original=proto[name];proto[name]=function(...args){return enabled(this)?handler.call(this,original,...args):original.apply(this,args);};}
 extend('shouldStartNodeNarration',function(original,current){const q=current?.question;if(current?.exit&&Number.isInteger(this.state.exit.deferredReviewIndex))return true;if(q?.resume_specific_narration&&!this.state.resolved[q.id]&&!this.state.exit.responses[q.id]&&(this.state.feedback[q.id]||this.state.hintLevels?.[q.id]))return this.narrationLinesFor(current).length>0;return original.call(this,current);});
 extend('narrationLinesFor',function(original,current){if(current?.exit&&Number.isInteger(this.state.exit.deferredReviewIndex)){const saved=this.state.exit.responses[current.questionId],q=current.question,specific=q.response_feedback?.[window.RevilyPlaceValue.evidence(q,saved.response).classification];return[saved.correct?(q.correct_feedback_by_evidence&&specific||q.scripts.on_correct_reaction):specific||q.scripts.on_incorrect_attempt_1];}return original.call(this,current);});
 extend('inputMarkup',function(original,q,saved,locked){
  if(q.response.type==='percentage_change_fields')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='mixed_percentage_answer')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='percentage_form')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(['measured_percentage_amount','money_percentage_amount','method_choice_amount','decimal_multiplier_amount','one_percent_amount','percentage_fraction_amount'].includes(q.response.type))return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='mixed_fdp_forms')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='fdp_ordering')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='fdp_comparison')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='percent_fraction')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='decimal_percent')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='equivalent_percent')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='equivalent_decimal')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='power_ten_fields')return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(['place_value_pair','place_value_forms','benchmark_forms','decimal_scale_pair','decimal_fraction','decimal_places_pair'].includes(q.response.type))return window.RevilyPlaceValue.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
  if(q.response.type==='decimal'&&q.response.suffix){const esc=window.RevilyVisuals.escapeHtml;return `<label class="single-answer decimal-answer"><span>${esc(q.response.input_label||'Your answer')}</span><span class="unit-input"><input id="decimal-answer" inputmode="decimal" autocomplete="off" spellcheck="false" value="${esc(String(saved??''))}"${locked?' disabled':''}/><b aria-hidden="true">${esc(q.response.suffix)}</b></span></label>`;}
  return original.call(this,q,saved,locked);
 });
 extend('readResponse',function(original,q,partial){
  if(q.response.type==='percentage_change_fields')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='mixed_percentage_answer')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='percentage_form')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(['measured_percentage_amount','money_percentage_amount','method_choice_amount','decimal_multiplier_amount','one_percent_amount','percentage_fraction_amount'].includes(q.response.type))return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='mixed_fdp_forms')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='fdp_ordering')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='fdp_comparison')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='percent_fraction')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='decimal_percent')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='equivalent_percent')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='equivalent_decimal')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='power_ten_fields')return window.RevilyPlaceValue.read(this.root,q,partial);
  if(['place_value_pair','place_value_forms','benchmark_forms','decimal_scale_pair','decimal_fraction','decimal_places_pair'].includes(q.response.type))return window.RevilyPlaceValue.read(this.root,q,partial);
  if(q.response.type==='decimal'){const value=this.root.querySelector('#decimal-answer')?.value.trim()||'';return partial||window.RevilyPlaceValue.decimal(value)?value:null;}
  return original.call(this,q,partial);
 });
 extend('submitAnswer',function(original,current){
  if(this.state.exit.responses[current.questionId]||this.state.resolved[current.questionId])return;
  const before=this.state.attempts[current.questionId]||0,result=original.call(this,current);
  if((this.state.attempts[current.questionId]||0)>before){const ev=window.RevilyPlaceValue.evidence(current.question,this.lastResponse(current.questionId)),history=this.state.evidence.placeValueConversion ||= {}; (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...ev});this.persist();}
  if(current.question?.response.type==='mixed_percentage_answer')window.RevilyMixedPercentage.normaliseDisplay(this,current);
  if(current.question?.response.type==='percentage_change_fields')window.RevilyPercentageChangeStructure.normaliseDisplay(this,current);
  return result;
 });
 extend('classifyMisconception',function(_original,q,response){return 'unconfirmed_'+window.RevilyPlaceValue.evidence(q,response).classification;});
 window.RevilyPlaceValueProfile={enabled};
})();
