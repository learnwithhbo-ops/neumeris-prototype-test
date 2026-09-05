(function(){
 'use strict';
 const proto=window.RevilyLessonEngine.LessonEngine.prototype,enabled=e=>e.spec.lesson?.exit?.mastery_policy?.profile==='all_primary_unsupported_deferred';
 const allSaved=e=>e.model.exitIds.every(id=>e.state.exit.responses[id]);
 function groupEvidence(records,groups){const byId=new Map(records.map(r=>[r.questionId,r]));const evidence=groups.map(group=>{const refs=[...new Set(group.refs||[])],correct=refs.filter(id=>byId.get(id)?.correct&&byId.get(id)?.unsupported).length,minimum=group.minimum;return{key:group.key,refs,correct,minimum,passed:refs.length>0&&Number.isInteger(minimum)&&minimum>0&&minimum<=refs.length&&correct>=minimum};});return{passed:evidence.length>0&&evidence.every(g=>g.passed),groups:evidence};}
 function extend(name,handler){const original=proto[name];proto[name]=function(...args){return enabled(this)?handler.call(this,original,...args):original.apply(this,args);};}
 function pending(e,current,narrate){e.lockInputs();window.RevilyVisuals.render(e.elements.canvas,current.visual,{spec:e.spec,question:current.question,feedback:null});const line=current.question.scripts.on_locked_incorrect;e.showFeedback('hint',line,'','Response saved');e.elements.primary.textContent=allSaved(e)?'Review answers':'Continue';e.elements.primary.disabled=false;if(narrate)e.startNarration([line],null);}
 extend('handleExitSubmission',function(_original,current,response,correct){
  this.state.exit.responses[current.questionId]={response:window.RevilyValidators.serialiseResponse(response),correct};
  if(allSaved(this)){
   const records=window.RevilySourceAlignedProfile.primaryEvidence(this),policy=this.spec.lesson.exit.mastery_policy;
   const methodEvidence=policy.method_choice_rule==='two_families_and_acceptance'?window.RevilyMethodChoiceAmount.masteryEvidence(this):null;
   const moneyEvidence=policy.money_evidence_rule==='standard_notation_and_exact_method'?window.RevilyMoneyPercentageAmount.masteryEvidence(this):null;
   const mixedEvidence=policy.mixed_percentage_rule==='four_of_five_both_relationships'?window.RevilyMixedPercentage.masteryEvidence(this):null;
   const mixedChangeEvidence=policy.mixed_change_rule==='five_of_six_with_structure_evidence'?window.RevilyPercentageChangeStructure.mixedChangeMastery(this):null;
   const confirmedEvidence=policy.confirmed_evidence_gate===true?window.RevilyPercentageChangeStructure.masteryEvidence(this):null;
   const groupedEvidence=policy.required_success_groups?groupEvidence(records,policy.required_success_groups):null;
   const passed=(mixedChangeEvidence?mixedChangeEvidence.passed:groupedEvidence?groupedEvidence.passed:mixedEvidence?mixedEvidence.passed:records.every(r=>r.correct&&r.unsupported))&&(!methodEvidence||methodEvidence.passed)&&(!moneyEvidence||moneyEvidence.passed)&&(!confirmedEvidence||confirmedEvidence.passed);
   if(mixedChangeEvidence)this.state.exit.mixedChangeEvidence=mixedChangeEvidence;
   if(groupedEvidence)this.state.exit.groupedMasteryEvidence=groupedEvidence;
   if(confirmedEvidence)this.state.exit.confirmedGateEvidence=confirmedEvidence;
   if(methodEvidence)this.state.exit.methodChoiceEvidence=methodEvidence;if(moneyEvidence)this.state.exit.moneyEvidence=moneyEvidence;if(mixedEvidence)this.state.exit.mixedPercentageEvidence=mixedEvidence;
   this.state.exit.primaryScore=records.filter(r=>r.correct).length;this.state.exit.missedPrimaryIds=records.filter(r=>!r.correct||!r.unsupported).map(r=>r.questionId);this.state.exit.result=passed?'SECURE':'NEEDS_WORK';this.state.masteryState=passed?'READY_FOR_RETRIEVAL':'LEARNING';
   this.emit('source_mastery_evaluated',{records,...(methodEvidence?{method_choice_evidence:methodEvidence}:{}),...(moneyEvidence?{money_evidence:moneyEvidence}:{}),...(mixedEvidence?{mixed_percentage_evidence:mixedEvidence}:{}),...(mixedChangeEvidence?{mixed_change_evidence:mixedChangeEvidence}:{}),...(groupedEvidence?{grouped_mastery_evidence:groupedEvidence}:{}),mastery_state:this.state.masteryState,delayed_retrieval_activated:false});
  }
  pending(this,current,true);this.persist();
 });
 extend('showSavedExitResponse',function(original,current,correct,narrate){
  if(!Number.isInteger(this.state.exit.deferredReviewIndex))return pending(this,current,narrate);
  original.call(this,current,correct,narrate);const index=this.state.exit.deferredReviewIndex;this.elements.primary.textContent=index===this.model.exitIds.length-1?'Finish review':'Next reviewed answer';
  if(current.question?.response.type==='mixed_percentage_answer')window.RevilyMixedPercentage.normaliseDisplay(this,current);
  const label=this.root.querySelector('.lesson-progress strong'),count=this.root.querySelector('.lesson-progress span'),bar=this.root.querySelector('.lesson-progress .progress-track i');if(label)label.textContent='Review your answers';if(count)count.textContent=`Answer ${index+1} of ${this.model.exitIds.length}`;if(bar)bar.style.width=`${100*(index+1)/this.model.exitIds.length}%`;
 });
 extend('advance',function(original,current){
  if(current.exit&&allSaved(this)&&!this.state.exit.deferredReviewComplete){const next=Number.isInteger(this.state.exit.deferredReviewIndex)?this.state.exit.deferredReviewIndex+1:0;this.stopNarration(false);if(next>=this.model.exitIds.length){this.state.exit.deferredReviewComplete=true;this.persist();return original.call(this,current);}this.state.exit.deferredReviewIndex=next;const qid=this.model.exitIds[next],node=this.model.nodes.find(n=>n.questionId===qid);this.state.cursor=node.id;this.state.evidence.route.push({from:current.id,to:node.id,kind:'locked_mastery_review',at:new Date().toISOString()});this.persist();this.render();if(!this.shouldStartNodeNarration(node))this.showSavedExitResponse(node,this.state.exit.responses[qid].correct,true);return;}
  return original.call(this,current);
 });
 window.RevilyDeferredMastery={enabled,groupEvidence};
 extend('renderCompletion',function(original,current){const result=original.call(this,current),policy=this.spec.lesson.exit.mastery_policy;if(policy.method_choice_rule==='two_families_and_acceptance')this.root.querySelector('.completion-actions')?.insertAdjacentHTML('beforebegin',window.RevilyMethodChoiceAmount.completionSummary(this));if(policy.money_evidence_rule==='standard_notation_and_exact_method')this.root.querySelector('.completion-actions')?.insertAdjacentHTML('beforebegin',window.RevilyMoneyPercentageAmount.completionSummary(this));if(policy.mixed_percentage_rule==='four_of_five_both_relationships')this.root.querySelector('.completion-actions')?.insertAdjacentHTML('beforebegin',window.RevilyMixedPercentage.completionSummary(this));return result;});
})();
