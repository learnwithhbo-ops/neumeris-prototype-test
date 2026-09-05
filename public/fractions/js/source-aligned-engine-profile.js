(function () {
  'use strict';
  const proto = window.RevilyLessonEngine.LessonEngine.prototype;
  const enabled = engine => engine.spec.experience_contract?.refinement_profile === 'source_aligned_v1';
  const { escapeHtml: esc, render: renderVisual } = window.RevilyVisuals;
  const { validate, parseRational, serialiseResponse } = window.RevilyValidators;
  function extend(name, handler) {
    const original = proto[name];
    proto[name] = function (...args) { return enabled(this) ? handler.apply(this,args) : original.apply(this,args); };
    return original;
  }
  function feedbackLine(engine,current,correct) {
    const q=current.question, response=engine.lastResponse(current.questionId) ?? engine.state.engagementResponses[current.questionId]?.response;
    if(correct&&q.correct_feedback_by_evidence){const specific=q.response_feedback?.[window.RevilyPlaceValue.evidence(q,response).classification];if(specific)return specific;}
    if(correct) return engine.state.evidence.supportEscalated[q.id] || engine.state.evidence.hintOpened[q.id] || engine.state.attempts[q.id]>1
      ? (q.scripts.correct_after_support || q.scripts.on_correct_reaction) : q.scripts.on_correct_reaction;
    if(q.response.type==='integer'&&q.response.lcd_denominators&&/^-?\d+$/.test(String(response).trim())) {
      const [a,b]=q.response.lcd_denominators,value=Number(response);let key;
      if(value>0&&value%a===0&&value%b===0)key=value===a*b?'product_not_lowest':'common_not_lowest';
      else if(value===Math.max(a,b))key='larger_not_common';
      else if(value===a+b)key='sum_not_common';
      else if(q.response.lcd_numerators?.includes(value))key='numerator_used';
      if(key&&q.response_feedback?.[key])return q.response_feedback[key];
    }
    if(q.response.type==='cancellation_working')return q.response_feedback?.[window.RevilyCancellation.classify(q,response)]||q.scripts.on_incorrect_attempt_1;
    if(q.response.type==='conversion_product')return q.response_feedback?.[window.RevilyConversionProduct.classify(q,response)]||q.scripts.on_incorrect_attempt_1;
    if(q.response.conversion_profile==='original_parts')return q.response_feedback?.[window.RevilyMixedConversion.classify(q,response)]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='mixed_add_components')return q.response_feedback?.[window.RevilyMixedAddition.evidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='mixed_regroup_stages')return q.response_feedback?.[window.RevilyMixedRegroup.evidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='mixed_subtract_components')return q.response_feedback?.[window.RevilyMixedSubtraction.evidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='mixed_exchange_rewrite')return q.response_feedback?.[window.RevilyMixedExchange.rewriteEvidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='mixed_exchange_result')return q.response_feedback?.[window.RevilyMixedExchange.resultEvidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='additive_final_value')return q.response_feedback?.[window.RevilyAdditiveTimeline.evidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='af18_capstone')return q.response_feedback?.[String(response)]||q.response_feedback?.[window.RevilyAf18.evidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.evidence_profile==='place_value_conversion')return q.response_feedback?.[window.RevilyPlaceValue.evidence(q,response).classification]||q.scripts.on_incorrect_attempt_1;
    if(q.response.require_simplest_form&&q.scripts.on_equivalent_unfinished&&window.RevilyValidators.sameRational(response,q.answer.value))return q.scripts.on_equivalent_unfinished;
    if(q.response.accept_equivalent_notation===false&&q.scripts.on_equivalent_wrong_form&&window.RevilyValidators.sameRational(response,q.answer.value))return q.scripts.on_equivalent_wrong_form;
    const key=response&&typeof response==='object'&&'n' in response&&'d' in response
      ? `${'whole' in response&&response.whole?response.whole+' ':''}${response.n}/${response.d}`:String(response);
    return q.response_feedback?.[key] || q.scripts.on_incorrect_attempt_1;
  }
  function missingRequestedMethod(engine,current) {
    const q=current.question;
    return Boolean(q.response?.multiplier_method) && window.RevilyPercentageChangeStructure.evidence(q,engine.lastResponse(q.id)).classification==='check_requested_method';
  }
  function draw(engine,current,feedback) {
    renderVisual(engine.elements.canvas,current.visual,{
      spec:engine.spec,question:current.question,narration:current.narration,feedback,
      workingRevealed:engine.state.workedRevealed[current.questionId] || 1,
      firstStepAssisted:engine.state.hintLevels?.[current.questionId]>=3,
      onWorkingStep:count=>{ engine.state.workedRevealed[current.questionId]=count; engine.persist(); }
    });
    if(['correct','support','worked'].includes(feedback))window.scrollTo?.({top:0,behavior:'instant'});
  }
  function outcome(engine,current,correct,narrate=true,engagement=false) {
    const line=!correct && current.exit && current.question.final_error_feedback!=='answer_specific' && !['cancellation_working','conversion_product'].includes(current.question.response.type) ? current.question.scripts.on_locked_incorrect : feedbackLine(engine,current,correct);
    const workingArea=current.question.response.type==='cancellation_working'&&engine.root.querySelector('.os-cancellation');
    if(workingArea)workingArea.outerHTML=window.RevilyCancellation.markup(current.question,engine.lastResponse(current.questionId),true);
    engine.lockInputs();
    draw(engine,current,correct?'correct':'support');
    engine.showFeedback(correct?'correct':'support',line,'',engagement?'Your response · unscored':missingRequestedMethod(engine,current)?'Final amount correct · method still required':'Your result');
    engine.elements.primary.textContent='Continue'; engine.elements.primary.disabled=false;
    if(narrate) {
      const auto=current.question.policy?.autoContinueAfterFeedback===true && !current.exit;
      engine.startNarration([line],auto?()=>engine.advance(current):null,auto?{resumeAction:'advance_current'}:undefined);
    }
  }
  function primaryEvidence(engine) {
    return engine.model.exitIds.map(questionId=>({
      questionId, correct:engine.state.exit.responses[questionId]?.correct===true,
      unsupported:engine.state.evidence.firstAttemptCorrect[questionId]===true
        && !engine.state.evidence.hintOpenedBeforeSubmit[questionId]
        && !engine.state.evidence.supportEscalated[questionId]
    }));
  }
  function changeAnswerForm(drafts,current,nextForm) {
    drafts['whole' in current?'mixed':'fraction']={...current};
    return {...(drafts[nextForm]||(nextForm==='mixed'?{whole:'',n:'',d:''}:{n:'',d:''}))};
  }
  function simplificationEvidence(q,response){
    if(q.evidence_profile!=='operation_then_simplify')return null;
    const parts=window.RevilyValidators.exactFractionParts(response);
    const operationCorrect=q.response.type==='single_choice'?q.operation_correct_options?.includes(response)===true:Boolean(parts&&BigInt(parts.n)>0n&&BigInt(parts.d)>0n&&window.RevilyValidators.sameRational(response,q.answer.value));
    const fullyCorrect=validate(q,response);
    return {operationCorrect,simplificationComplete:fullyCorrect,outcome:fullyCorrect?'complete':operationCorrect?'operation_correct_simplification_incomplete':'operation_not_yet_correct'};
  }
  const originalSubmit=extend('submitAnswer',function(current){
    const previous=this.state.attempts[current.questionId]||0,result=originalSubmit.call(this,current);
    if((this.state.attempts[current.questionId]||0)<=previous)return result;
    const direction=current.question.conversion_direction;
    if(['additive_final_value','additive_structure'].includes(current.question.evidence_profile)){
      const history=this.state.evidence.additiveEvents ||= {},q=current.question,response=this.lastResponse(current.questionId),evidence=q.evidence_profile==='additive_final_value'?window.RevilyAdditiveTimeline.evidence(q,response):{structureCorrect:validate(q,response),evidenceKind:'selected_structure',scope:q.structural_evidence,operationSequenceObserved:q.structural_evidence==='complete_plan',intermediateCalculationObserved:false};
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...evidence});this.persist();
    }
    if(current.question.evidence_profile==='fraction_operation_selection'){
      const history=this.state.evidence.fractionOperationSelection ||= {};
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...window.RevilyFractionSituation.evidence(current.question,this.lastResponse(current.questionId))});
      this.persist();
    }
    if(['mixed_exchange_rewrite','mixed_exchange_result'].includes(current.question.evidence_profile)){
      const history=this.state.evidence.mixedExchange ||= {},method=current.question.evidence_profile==='mixed_exchange_rewrite'?'rewriteEvidence':'resultEvidence';
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...window.RevilyMixedExchange[method](current.question,this.lastResponse(current.questionId))});
      this.persist();
    }
    if(current.question.evidence_profile==='mixed_subtract_components'){
      const history=this.state.evidence.mixedSubtraction ||= {};
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...window.RevilyMixedSubtraction.evidence(current.question,this.lastResponse(current.questionId))});
      this.persist();
    }
    if(current.question.evidence_profile==='mixed_add_components'){
      const history=this.state.evidence.mixedAddition ||= {};
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...window.RevilyMixedAddition.evidence(current.question,this.lastResponse(current.questionId))});
      this.persist();
    }
    if(current.question.evidence_profile==='mixed_regroup_stages'){
      const history=this.state.evidence.mixedRegrouping ||= {};
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...window.RevilyMixedRegroup.evidence(current.question,this.lastResponse(current.questionId))});
      this.persist();
    }
    if(['mixed_to_improper','improper_to_mixed'].includes(direction)){
      const directions=this.state.evidence.fractionConversion ||= {},history=directions[direction] ||= {},attempt=this.state.submissions[current.questionId].at(-1);
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],correct:attempt.correct,unsupported:this.state.attempts[current.questionId]===1&&!this.state.evidence.hintOpened[current.questionId]&&!this.state.evidence.supportEscalated[current.questionId],classification:current.question.response.conversion_profile==='original_parts'?window.RevilyMixedConversion.classify(current.question,attempt.response):attempt.correct?'correct':'check_this_direction'});
      this.persist();
    }
    const evidence=simplificationEvidence(current.question,this.lastResponse(current.questionId));
    if(evidence){
      const history=this.state.evidence.operationSimplification ||= {};
      (history[current.questionId] ||= []).push({attempt:this.state.attempts[current.questionId],...evidence});
      if(previous===0){this.state.evidence.answerValueCorrect[current.questionId]=evidence.operationCorrect;this.state.evidence.answerFormCorrect[current.questionId]=evidence.simplificationComplete;}
      Object.assign(this.state.submissions[current.questionId].at(-1),evidence);
      this.emit('operation_simplification_evaluated',{question_id:current.questionId,...evidence});this.persist();
    }
    return result;
  });
  extend('narrationBeatGapMs',function(){return 60;});
  extend('narrationAdvanceDelayMs',function(){return 280;});
  const originalNarrationLines=extend('narrationLinesFor',function(current){
    const q=current?.question;
    if(q?.correct_feedback_by_evidence&&this.state.resolved[q.id])return[feedbackLine(this,current,true)];
    if(q?.resume_specific_narration&&!this.state.resolved[q.id]&&!this.state.exit.responses[q.id]){
      if(['first_incorrect','support'].includes(this.state.feedback[q.id]))return[feedbackLine(this,current,false)];
      const level=this.state.hintLevels?.[q.id]||0;
      if(level)return[level===3?'Here is the first worked step. Use it to continue your own calculation.':q.mathematical_support[level===1?'hint_1':'hint_2']];
    }
    return originalNarrationLines.call(this,current);
  });
  extend('refocusInput',function(){
    this.root.querySelector('#answer-form input:not([type=hidden]):not(:disabled), #answer-form select:not(:disabled), #answer-form button.choice-card:not(:disabled)')?.focus({preventScroll:true});
  });
  const originalPrimary=extend('handlePrimary',function(current){
    const opening=current?.kind==='scene'&&!this.state.started;
    originalPrimary.call(this,current);
    if(opening)window.scrollTo?.({top:0,behavior:'instant'});
  });
  const originalLoad = extend('loadState',function () {
    const state=originalLoad.call(this);
    try {
      const saved=JSON.parse(localStorage.getItem(this.storageKey)||'null');
      if(saved && saved.skillId===this.spec.identity.id && saved.contentVersion!==state.contentVersion) {
        state.soundOn=saved.soundOn!==false; state.developerOpen=saved.developerOpen===true;
        const history=JSON.parse(localStorage.getItem(this.historyKey)||'[]');
        if(!history.some(item=>item.attemptId===saved.attemptId && item.reason==='source_aligned_revision')) {
          history.push({...saved, archivedAt:new Date().toISOString(), reason:'source_aligned_revision'});
          localStorage.setItem(this.historyKey,JSON.stringify(history));
        }
        state.contentMigration={from:saved.contentVersion||'bulk-preview',to:state.contentVersion,previousAttemptId:saved.attemptId,previousStatus:saved.status,preserved:['sound preference','full previous attempt in history']};
      }
    } catch(_error) { /* An unavailable history store must not prevent opening the lesson. */ }
    return state;
  });
  const originalInput=extend('inputMarkup',function(q,saved,locked) {
    if(!locked&&q.id&&Object.prototype.hasOwnProperty.call(this.state.drafts,q.id))saved=this.state.drafts[q.id];
    if(q.response.exchange_profile==='one_whole')return originalInput.call(this,q,saved,locked).replace('<legend>Your mixed number</legend>','<legend>Rewrite after exchanging one whole</legend>');
    if(q.response.type==='mixed_number'&&(q.response.conversion_profile==='original_parts'||q.response.require_proper_fractional_part))return window.RevilyMixedConversion.markup(q,saved,locked);
    if(q.response.type==='conversion_product')return window.RevilyConversionProduct.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked,(final,value,isLocked)=>this.inputMarkup(final,value,isLocked));
    if(q.response.type==='cancellation_working')return window.RevilyCancellation.markup(q,locked?saved:(this.state.drafts[q.id]??saved),locked);
    if(q.response.type==='single_choice'&&['compound_fraction','signed_compound_fraction','decimal_compound_fraction','symbolic_compound_fraction'].includes(q.response.math_layout)) {
      const markup=text=>{
        if(q.response.math_layout==='decimal_compound_fraction')return window.RevilyPercentFraction.math(text);
        if(q.response.math_layout==='symbolic_compound_fraction')return window.RevilyPercentageChangeStructure.symbolicMath(text);
        const pattern=q.response.math_layout==='signed_compound_fraction'?/(\([\d ×+÷−-]+\)|[−-]?\d+)\s*\/\s*(\([\d ×+÷−-]+\)|[−-]?\d+)/g:/(\([\d ×+÷]+\)|\d+)\s*\/\s*(\([\d ×+÷]+\)|\d+)/g;let html='',offset=0;
        for(const match of text.matchAll(pattern)){html+=esc(text.slice(offset,match.index));html+=window.RevilyVisuals.fractionMarkup(match[1].replace(/[()]/g,''),match[2].replace(/[()]/g,''));offset=match.index+match[0].length;}
        return html+esc(text.slice(offset));
      };
      const options=q.response.options,disabled=locked?' disabled':'';
      return `<fieldset class="choice-answer"><legend>Choose an answer</legend><div class="choice-grid">${options.map((option,index)=>`<button class="choice-card${saved===option?' is-selected':''}" type="button" data-option-index="${index}" aria-pressed="${saved===option}"${disabled}>${markup(option)}</button>`).join('')}</div><input type="hidden" id="choice-answer" value="${saved==null?'':options.indexOf(saved)}"/></fieldset>`;
    }
    if(q.response.type==='fraction'&&q.response.allow_mixed_number) {
      const value=saved&&typeof saved==='object'?saved:q.response.default_form==='mixed'?{whole:'',n:'',d:''}:{n:'',d:''},mixed='whole' in value,disabled=locked?' disabled':'';
      const fractional=`<div class="fraction-input"><input id="fraction-n" aria-label="Numerator" inputmode="numeric" autocomplete="off" value="${esc(value.n??'')}"${disabled}/><i aria-hidden="true"></i><input id="fraction-d" aria-label="Denominator" inputmode="numeric" autocomplete="off" value="${esc(value.d??'')}"${disabled}/></div>`;
      const whole=`<label class="single-answer" id="os-whole-label"${mixed?'':' hidden'}><span>Wholes</span><input id="os-answer-whole" aria-label="Whole-number part" inputmode="numeric" autocomplete="off" value="${esc(value.whole??'')}"${disabled}/></label>`;
      return `<fieldset class="fraction-answer os-exact-fraction"><legend>${esc(q.response.input_label||'Your exact fraction')}</legend><div class="os-fraction-fields">${mixed?whole+fractional:fractional+whole}${q.response.suffix?`<b>${esc(q.response.suffix)}</b>`:''}</div><button type="button" class="secondary-button" id="os-mixed-toggle" aria-expanded="${mixed}" aria-controls="os-whole-label"${disabled}>${mixed?'Use a fraction instead':'Use a mixed number'}</button><p class="os-answer-help">${q.response.require_simplest_form?'Use a fraction or mixed number in simplest form.':'An exact equivalent fraction is accepted. A mixed number is optional.'} Each form keeps your own draft.</p></fieldset>`;
    }
    if(q.response.type==='fraction'&&q.response.show_authored_label) {
      const value=saved&&typeof saved==='object'?saved:{n:'',d:''},disabled=locked?' disabled':'';
      return `<fieldset class="fraction-answer"><legend>${esc(q.response.input_label||'Your fraction')}</legend><div class="os-fraction-fields"><div class="fraction-input"><input id="fraction-n" aria-label="Numerator" inputmode="numeric" autocomplete="off" value="${esc(value.n??'')}"${disabled}/><i aria-hidden="true"></i><input id="fraction-d" aria-label="Denominator" inputmode="numeric" autocomplete="off" value="${esc(value.d??'')}"${disabled}/></div>${q.response.suffix?`<b${q.response.suffix_label?` aria-label="${esc(q.response.suffix_label)}"`:''}>${esc(q.response.suffix)}</b>`:''}</div></fieldset>`;
    }
    if(q.response.type!=='exact_number') return originalInput.call(this,q,saved,locked);
    return `<label class="single-answer"><span>${esc(q.response.input_label||'Your exact answer')}</span><span class="unit-input"><input id="exact-answer" type="text" inputmode="text" autocomplete="off" aria-describedby="exact-help" value="${esc(saved??'')}"${locked?' disabled':''}/>${q.response.suffix?`<b>${esc(q.response.suffix)}</b>`:''}</span></label><p id="exact-help" class="os-answer-help">Use a whole number, fraction (a/b), or mixed number (w a/b). Equivalent exact forms are accepted.</p>`;
  });
  const originalRead=extend('readResponse',function(q,partial) {
    if(q.response.exchange_profile==='one_whole'){
      const value={whole:this.root.querySelector('#mixed-whole')?.value.trim()||'',n:this.root.querySelector('#mixed-n')?.value.trim()||'',d:String(q.response.fixedDenominator)};
      return partial?value:['whole','n'].every(key=>/^\d+$/.test(value[key]))?value:null;
    }
    if(q.response.type==='mixed_number'&&(q.response.conversion_profile==='original_parts'||q.response.require_proper_fractional_part)){
      const value={whole:this.root.querySelector('#mixed-whole')?.value.trim()||'',n:this.root.querySelector('#mixed-n')?.value.trim()||'',d:this.root.querySelector('#mixed-d')?.value.trim()||''};
      return partial?value:['whole','n','d'].every(key=>/^\d+$/.test(value[key]))&&BigInt(value.d)>0n?value:null;
    }
    if(q.response.type==='integer'&&q.response.accept_exact_equivalents===true) {
      const value=this.root.querySelector('#integer-answer')?.value.trim()||'';
      return parseRational(value)?value:partial?value:null;
    }
    if(q.response.type==='conversion_product')return window.RevilyConversionProduct.read(this.root,q,partial,(final,isPartial)=>this.readResponse(final,isPartial));
    if(q.response.type==='mixed_number'&&q.response.require_simplest_form&&partial)return {whole:this.root.querySelector('#mixed-whole')?.value.trim()||'',n:this.root.querySelector('#mixed-n')?.value.trim()||'',d:this.root.querySelector('#mixed-d')?.value.trim()||''};
    if(q.response.type==='cancellation_working')return window.RevilyCancellation.read(this.root,q,partial);
    if(q.response.type==='fraction'&&q.response.allow_mixed_number) {
      const n=this.root.querySelector('#fraction-n')?.value.trim()||'',d=this.root.querySelector('#fraction-d')?.value.trim()||'';
      const mixed=this.root.querySelector('#os-whole-label')?.hidden===false,whole=this.root.querySelector('#os-answer-whole')?.value.trim()||'';
      const value=mixed?{whole,n,d}:{n,d};
      if(partial)return value;
      if(mixed&&q.response.require_all_mixed_fields&&(!/^\d+$/.test(whole)||!/^\d+$/.test(n)||!/^\d+$/.test(d)||BigInt(d)===0n))return null;
      if(mixed&&whole!==''&&!/^-?\d+$/.test(whole))return null;
      if(mixed&&/^-?\d+$/.test(whole)&&!n&&!d)return {whole,n:'0',d:'1'};
      const partPattern=q.response.allow_signed_parts?/^-?\d+$/:/^\d+$/;
      if(!partPattern.test(n)||!partPattern.test(d)||BigInt(d)===0n)return null;
      return value;
    }
    if(q.response.type!=='exact_number') return originalRead.call(this,q,partial);
    const value=this.root.querySelector('#exact-answer')?.value.trim()||'';
    return parseRational(value) ? value : partial ? value : null;
  });
  extend('handleCorrect',function(current) {
    const qid=current.questionId;
    const supported=this.state.attempts[qid]>1 || this.state.evidence.hintOpened[qid] || this.state.evidence.supportEscalated[qid];
    this.state.resolved[qid]=supported?'correct_after_support':'correct'; this.state.feedback[qid]='correct';
    this.lockInputs(); outcome(this,current,true); this.persist();
  });
  const originalBind=extend('bindInputEvents',function(q,locked) {
    if(q.response.type!=='cancellation_working')return originalBind.call(this,q,locked);
    if(!locked)window.RevilyCancellation.bind(this,q);
  });
  extend('handleIncorrect',function(current) {
    const q=current.question, supported=this.state.attempts[q.id]>=2;
    this.state.feedback[q.id]=supported?'support':'first_incorrect';
    this.state.practiceStreak=0;
    if(supported) this.state.evidence.supportEscalated[q.id]=true;
    // In this profile a wrong response never sets resolved or advances the cursor.
    const incomplete=simplificationEvidence(q,this.lastResponse(q.id))?.outcome==='operation_correct_simplification_incomplete';
    const line=supported&&!incomplete&&!q.retain_answer_specific_feedback&&!['mixed_add_components','mixed_regroup_stages','mixed_subtract_components','mixed_exchange_rewrite','mixed_exchange_result'].includes(q.evidence_profile)?q.scripts.on_incorrect_attempt_2:feedbackLine(this,current,false);
    draw(this,current,supported?'support':'hint');
    const methodMissing=missingRequestedMethod(this,current);
    this.showFeedback(supported?'support':'hint',line,'',methodMissing?(supported?'Use the working to show the requested method':'Show the requested method'):supported?'Use the working, then correct your answer':'Try again');
    this.elements.primary.textContent='Check answer'; this.elements.primary.disabled=this.readResponse(q)===null;
    this.startNarration([line],null); this.refocusInput(); this.persist();
  });
  extend('handleEngagement',function(current,response,correct) {
    this.state.resolved[current.questionId]='engagement'; this.state.feedback[current.questionId]='worked';
    this.state.engagementResponses[current.questionId]={response:serialiseResponse(response),correct:null,matched:correct};
    this.lockInputs(); outcome(this,current,correct,true,true);
    this.emit('engagement_response_shown',{question_id:current.questionId,scored:false,matched_expected_response:correct}); this.persist();
  });
  extend('restoreResolvedFeedback',function(current) {
    const record=this.state.engagementResponses[current.questionId];
    const correct=record?record.matched===true:validate(current.question,this.lastResponse(current.questionId));
    outcome(this,current,correct,false,Boolean(record));
  });
  extend('restoreFirstHint',function(current) {
    draw(this,current,'hint'); this.showFeedback('hint',feedbackLine(this,current,false),'',missingRequestedMethod(this,current)?'Show the requested method':'Try again');
  });
  const originalQuestion=extend('renderQuestion',function(current) {
    originalQuestion.call(this,current);
    this.root.querySelector('#os-mixed-toggle')?.addEventListener('click',()=>{
      const label=this.root.querySelector('#os-whole-label'),button=this.root.querySelector('#os-mixed-toggle');
      this.state.answerFormDrafts ||= {};const drafts=this.state.answerFormDrafts[current.questionId] ||= {};
      const currentDraft=this.readResponse(current.question,true);
      const formDraft=current.question.response.type==='conversion_product'&&current.question.response.final_response?currentDraft.result:currentDraft;
      const next=changeAnswerForm(drafts,formDraft,label.hidden?'mixed':'fraction');
      label.hidden=!label.hidden;button.setAttribute('aria-expanded',String(!label.hidden));button.textContent=label.hidden?'Use a mixed number':'Use a fraction instead';
      this.root.querySelector('#fraction-n').value=next.n||'';this.root.querySelector('#fraction-d').value=next.d||'';this.root.querySelector('#os-answer-whole').value=next.whole||'';
      if(label.hidden)this.root.querySelector('.os-fraction-fields .fraction-input').after(label);
      else this.root.querySelector('.os-fraction-fields').prepend(label);
      const response=this.readResponse(current.question),disabled=response===null;
      this.elements.primary.disabled=disabled;this.root.querySelector('#answer-form button[type=submit]')?.toggleAttribute('disabled',disabled);
      this.state.drafts[current.questionId]=this.readResponse(current.question,true);this.persist();
      this.root.querySelector(label.hidden?'#fraction-n':'#os-answer-whole')?.focus({preventScroll:true});
    });
    if(!this.state.resolved[current.questionId] && this.state.feedback[current.questionId]==='support') {
      const incomplete=simplificationEvidence(current.question,this.lastResponse(current.questionId))?.outcome==='operation_correct_simplification_incomplete';
      draw(this,current,'support'); this.showFeedback('support',incomplete||current.question.retain_answer_specific_feedback||['mixed_add_components','mixed_regroup_stages','mixed_subtract_components','mixed_exchange_rewrite','mixed_exchange_result'].includes(current.question.evidence_profile)?feedbackLine(this,current,false):current.question.scripts.on_incorrect_attempt_2,'','Use the working, then correct your answer');
    }
  });
  const originalRender=extend('render',function(...args) {
    originalRender.apply(this,args);
    this.root.querySelector('.app-shell')?.setAttribute('data-source-aligned','true');
    // Keep the new mathematical model in view after leaving a long answer form.
    window.scrollTo?.({top:0,behavior:'instant'});
  });
  const originalCompletion=extend('renderCompletion',function(current) {
    originalCompletion.call(this,current);
    this.root.querySelector('.app-shell')?.setAttribute('data-source-aligned','true');
    this.root.querySelector('#start-again')?.setAttribute('aria-label','Start again');
  });
  extend('hintMarkup',function(q,current,locked) {
    if(locked || current.exit || q.policy?.hintPolicy!=='optional') return '';
    const level=this.state.hintLevels?.[q.id]||0;
    const clue=level===1?q.mathematical_support.hint_1:level===2?q.mathematical_support.hint_2:level===3?q.working[0]:'';
    return `<section class="os-hint"><button type="button" class="hint-toggle" id="hint-toggle"${level>=3?' disabled':''}>${['Ask Ryan for a clue','Another clue','Show one worked step','One worked step shown'][level]}</button><p id="os-hint-copy" aria-live="polite"${clue?'':' hidden'}>${q.visual?.model?.decimal_math?window.RevilyPercentFraction.math(clue):q.visual?.model?.math_text?window.RevilyVisuals.mathMarkup(clue):esc(clue)}</p></section>`;
  });
  extend('bindHintEvents',function(q,current,locked) {
    if(locked || current.exit) return;
    this.root.querySelector('#hint-toggle')?.addEventListener('click',()=>{
      this.state.hintLevels ||= {};
      const level=Math.min(3,(this.state.hintLevels[q.id]||0)+1); this.state.hintLevels[q.id]=level;
      this.state.evidence.hintOpened[q.id]=true;
      const clue=level===1?q.mathematical_support.hint_1:level===2?q.mathematical_support.hint_2:q.working[0];
      const copy=this.root.querySelector('#os-hint-copy'); copy.hidden=false;
      if(q.visual?.model?.decimal_math)copy.innerHTML=window.RevilyPercentFraction.math(clue);else if(q.visual?.model?.math_text)copy.innerHTML=window.RevilyVisuals.mathMarkup(clue);else copy.textContent=clue;
      const button=this.root.querySelector('#hint-toggle'); button.textContent=['','Another clue','Show one worked step','One worked step shown'][level]; button.disabled=level===3;
      this.emit('hint_opened',{question_id:q.id,level,scored:false});
      this.startNarration([level===3?'Here is the first worked step. Use it to continue your own calculation.':clue],null); this.persist();
    });
  });
  extend('showSavedExitResponse',function(current,correct,narrate) { outcome(this,current,correct,narrate); });
  extend('handleExitSubmission',function(current,response,correct) {
    this.state.exit.responses[current.questionId]={response:serialiseResponse(response),correct};
    this.lockInputs(); outcome(this,current,correct);
    if(this.model.exitIds.every(qid=>this.state.exit.responses[qid])) {
      const records=primaryEvidence(this), passed=records.every(r=>r.correct&&r.unsupported);
      this.state.exit.primaryScore=records.filter(r=>r.correct).length;
      this.state.exit.missedPrimaryIds=records.filter(r=>!r.correct||!r.unsupported).map(r=>r.questionId);
      // SECURE remains the shell's compatibility flag; no long-term Strong claim is made.
      this.state.exit.result=passed?'SECURE':'NEEDS_WORK';
      this.state.masteryState=passed?'READY_FOR_RETRIEVAL':'LEARNING';
      this.emit('source_mastery_evaluated',{records,mastery_state:this.state.masteryState,delayed_retrieval_activated:false});
    }
    this.persist();
  });
  window.RevilySourceAlignedProfile={enabled,primaryEvidence,changeAnswerForm,simplificationEvidence};
})();
