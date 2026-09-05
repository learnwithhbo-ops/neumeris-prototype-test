(function(){
 'use strict';
 const V=window.RevilyValidators,proto=window.RevilyLessonEngine.LessonEngine.prototype;
 const enabled=e=>e.spec.lesson?.exit?.mastery_policy?.profile==='af18_mixed_capstone';
 function evidence(q,response){
  const correct=V.validate(q,response),numeric=q.response.type!=='single_choice',valueCorrect=numeric?V.sameRational(response,q.answer.value):null;
  let classification=correct?'correct':valueCorrect?'finish_form':'check_calculation',suspect=null;
  if(!correct&&valueCorrect)suspect={route:'M-AF18-04',prior:q.response.require_proper_fractional_part?['AF-11']:['AF-03']};
  else if(!correct){
   const entries=Object.entries(q.capstone?.suspects||{});
   const match=entries.find(([key])=>numeric?V.sameRational(response,key):key===response);
   if(match){suspect=match[1];classification=suspect.classification||'suspected_route';}
  }
  return{correct,valueCorrect,answerFormCorrect:numeric?correct:null,classification,category:q.capstone?.category||'method',suspectedRoute:suspect?.route||null,confirmationSkillCandidates:suspect?.prior||[],routeConfirmed:false,unseenMethodAssessed:false,earlierSkillStateChanged:false,...(q.id.endsWith('-X05')?{selectedFirstIncorrectStep:response,firstIncorrectStepIdentified:correct}:{})};
 }
 function evaluate(spec,state,model){
  const policy=spec.lesson.exit.mastery_policy,refs=model.exitIds,items=refs.map(questionId=>{const q=model.getQuestion(questionId),saved=state.exit.responses[questionId];return{questionId,...(saved?evidence(q,saved.response):{correct:false,category:q.capstone?.category}),supported:Boolean(state.evidence.hintOpened[questionId]||state.evidence.supportEscalated[questionId]||state.evidence.hintOpenedBeforeSubmit[questionId]||state.attempts[questionId]>1),submitted:Boolean(saved)};});
  const record=id=>items.find(x=>x.questionId===id),numericalCorrect=policy.numerical_refs.filter(id=>record(id)?.correct).length,proper=policy.proper_refs.some(id=>record(id)?.correct),mixed=policy.mixed_refs.some(id=>record(id)?.correct),context=record(policy.required_context)?.correct===true,method=record(policy.method_ref)?.correct===true,allSubmitted=items.every(x=>x.submitted),unsupported=items.every(x=>!x.supported);
  const routes=new Map();for(const item of items)if(item.suspectedRoute&&!item.correct){const forms=routes.get(item.suspectedRoute)||new Set();forms.add(item.category);routes.set(item.suspectedRoute,forms);}
  const repeated=[...routes].filter(([,forms])=>forms.size>=2).map(([route])=>route);
  return{passed:allSubmitted&&numericalCorrect>=policy.minimum_numerical&&proper&&mixed&&context&&method&&unsupported&&!repeated.length,allSubmitted,numericalCorrect,proper,mixed,context,method,unsupported,repeatedSuspectedRoutes:repeated,items,earlierSkillStatesUnchanged:true};
 }
 const allSaved=e=>e.model.exitIds.every(id=>e.state.exit.responses[id]);
 function pending(e,current,narrate){
  e.lockInputs();window.RevilyVisuals.render(e.elements.canvas,current.visual,{spec:e.spec,question:current.question,feedback:null});
  const line=current.question.scripts.on_locked_incorrect;e.showFeedback('hint',line,'','Response saved');e.elements.primary.textContent=allSaved(e)?'Review answers':'Continue';e.elements.primary.disabled=false;
  if(narrate)e.startNarration([line],null);
 }
 function extend(name,handler){const original=proto[name];proto[name]=function(...args){return enabled(this)?handler.call(this,original,...args):original.apply(this,args);};}
 extend('submitAnswer',function(original,current){if(this.state.exit.responses[current.questionId]||this.state.resolved[current.questionId])return;const previous=this.state.attempts[current.questionId]||0,result=original.call(this,current);if((this.state.attempts[current.questionId]||0)>previous){const item=evidence(current.question,this.lastResponse(current.questionId)),history=this.state.evidence.capstoneMixed ||= {}; (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...item});if(!previous&&item.valueCorrect!==null){this.state.evidence.answerValueCorrect[current.questionId]=item.valueCorrect;this.state.evidence.answerFormCorrect[current.questionId]=item.answerFormCorrect;}Object.assign(this.state.submissions[current.questionId].at(-1),{capstoneEvidence:item});this.persist();}return result;});
 extend('classifyMisconception',function(_original,q,response){const ev=evidence(q,response);return ev.suspectedRoute?'suspected_'+ev.suspectedRoute:'unclassified_capstone_response';});
 extend('handleExitSubmission',function(_original,current,response,correct){
  this.state.exit.responses[current.questionId]={response:V.serialiseResponse(response),correct};
  if(allSaved(this)){const result=evaluate(this.spec,this.state,this.model);this.state.exit.capstoneEvaluation=result;this.state.exit.primaryScore=result.numericalCorrect;this.state.exit.missedPrimaryIds=result.items.filter(x=>!x.correct||x.supported).map(x=>x.questionId);this.state.exit.result=result.passed?'SECURE':'NEEDS_WORK';this.state.masteryState=result.passed?'READY_FOR_RETRIEVAL':'LEARNING';this.emit('capstone_mastery_evaluated',{...result,delayed_retrieval_activated:false});}
  pending(this,current,true);this.persist();
 });
 extend('showSavedExitResponse',function(original,current,correct,narrate){
  if(!Number.isInteger(this.state.exit.capstoneReviewIndex))return pending(this,current,narrate);
  original.call(this,current,correct,narrate);this.elements.primary.textContent=this.state.exit.capstoneReviewIndex===this.model.exitIds.length-1?'Finish review':'Next reviewed answer';
  const label=this.root.querySelector('.lesson-progress strong'),count=this.root.querySelector('.lesson-progress span'),bar=this.root.querySelector('.lesson-progress .progress-track i');if(label)label.textContent='Review your answers';if(count)count.textContent=`Answer ${this.state.exit.capstoneReviewIndex+1} of ${this.model.exitIds.length}`;if(bar)bar.style.width=`${100*(this.state.exit.capstoneReviewIndex+1)/this.model.exitIds.length}%`;
 });
 extend('advance',function(original,current){
  if(current.exit&&allSaved(this)&&!this.state.exit.capstoneReviewComplete){
   const next=Number.isInteger(this.state.exit.capstoneReviewIndex)?this.state.exit.capstoneReviewIndex+1:0;this.stopNarration(false);
   if(next>=this.model.exitIds.length){this.state.exit.capstoneReviewComplete=true;this.persist();return original.call(this,current);}
   this.state.exit.capstoneReviewIndex=next;const qid=this.model.exitIds[next],node=this.model.nodes.find(n=>n.questionId===qid);this.state.cursor=node.id;this.state.evidence.route.push({from:current.id,to:node.id,kind:'locked_capstone_review',at:new Date().toISOString()});this.persist();this.render();this.showSavedExitResponse(node,this.state.exit.responses[qid].correct,true);return;
  }
  return original.call(this,current);
 });
 window.RevilyAf18={enabled,evidence,evaluate};
})();
