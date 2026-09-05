(function () {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const math = value => window.RevilyVisuals?.mathMarkup ? window.RevilyVisuals.mathMarkup(value) : esc(value);

  const gcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };

  function rational(value) {
    if (value && typeof value === 'object' && Number.isFinite(Number(value.n)) && Number.isFinite(Number(value.d))) {
      const n = Number(value.n), d = Number(value.d);
      if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error(`Invalid authored multi-step quantity: ${JSON.stringify(value)}`);
      const factor = gcd(n, d), sign = d < 0 ? -1 : 1;
      return { n: sign * n / factor, d: sign * d / factor };
    }
    const parsed = window.RevilyValidators.parseRational(value);
    if (!parsed) throw new Error(`Invalid authored multi-step quantity: ${value}`);
    return rational(parsed);
  }

  const multiply = (left, right) => rational({ n: left.n * right.n, d: left.d * right.d });
  const divide = (left, right) => {
    if (!right.n) throw new Error('A multi-step group size cannot be zero.');
    return rational({ n: left.n * right.d, d: left.d * right.n });
  };
  const shown = value => {
    const r = rational(value);
    return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`;
  };

  function exactResult(model) {
    if (!model || model.kind !== 'multi_step') throw new Error('An explicit multi-step model is required.');
    let intermediate, result;
    if (model.structure === 'fraction_then_group') {
      intermediate = multiply(rational(model.given), rational(model.first_fraction));
      result = divide(intermediate, rational(model.group_size));
    } else if (model.structure === 'reconstruct_then_fraction') {
      intermediate = divide(rational(model.given), rational(model.known_fraction));
      result = multiply(intermediate, rational(model.target_fraction));
    } else if (model.structure === 'reconstruct_then_group') {
      intermediate = divide(rational(model.given), rational(model.known_fraction));
      result = divide(intermediate, rational(model.group_size));
    } else if (model.structure === 'repeat_then_group') {
      intermediate = multiply(rational(model.copies), rational(model.item_size));
      result = divide(intermediate, rational(model.group_size));
    } else if (model.structure === 'fraction_then_fraction') {
      intermediate = multiply(rational(model.given), rational(model.first_fraction));
      result = multiply(intermediate, rational(model.second_fraction));
    } else {
      throw new Error(`Unknown multi-step structure: ${model.structure}`);
    }
    return { intermediate, result };
  }

  const phases = ['question', 'given', 'first_relation', 'intermediate', 'second_relation', 'result'];
  const rank = phase => Math.max(0, phases.indexOf(phase));
  function activePhase(model, reveal, workingRevealed) {
    if (model.solved) return model.phase || 'result';
    if (!reveal) return model.phase || 'question';
    const sequence = model.working_phases || (model.answer_scope === 'intermediate'
      ? ['intermediate']
      : ['intermediate', 'second_relation', 'result']);
    return sequence[Math.min(sequence.length - 1, Math.max(0, Number(workingRevealed || 1) - 1))] || 'result';
  }

  function icon(context, role) {
    const common = 'viewBox="0 0 120 78" aria-hidden="true" focusable="false"';
    if (/student|team|task/.test(context)) {
      return `<svg ${common} class="os-ms-icon os-ms-people"><circle cx="60" cy="20" r="11"/><path d="M37 68q2-32 23-32t23 32"/>${role === 'result' && /team/.test(context) ? '<path d="M94 13v52M94 13h17l-5 11 5 11H94"/>' : ''}</svg>`;
    }
    if (/ribbon/.test(context)) {
      return `<svg ${common} class="os-ms-icon os-ms-ribbon"><path d="M12 21h96v30H12z"/><path d="M32 21v30M52 21v30M72 21v30M92 21v30"/></svg>`;
    }
    if (/book|box/.test(context)) {
      return `<svg ${common} class="os-ms-icon os-ms-books"><path d="M20 56h72v12H20zM28 40h72v12H28zM20 24h72v12H20z"/><path d="M31 24v12M84 40v12M35 56v12"/></svg>`;
    }
    if (/number|reconstruct/.test(context)) {
      return `<svg ${common} class="os-ms-icon os-ms-number"><rect x="13" y="20" width="94" height="38" rx="6"/><path d="M36 20v38M60 20v38M84 20v38"/><text x="60" y="70">${role === 'middle' ? 'whole' : 'known part'}</text></svg>`;
    }
    if (/feed|flour|dough|material/.test(context)) {
      return `<svg ${common} class="os-ms-icon os-ms-sack"><path d="M42 10h36l-7 12q22 18 17 43H32q-5-25 17-43z"/><path d="M42 24h36M45 48q15-12 30 0"/></svg>`;
    }
    if (/tank|liquid|water|capacity|cup|container|bottle/.test(context)) {
      if (role === 'result') return /cup/.test(context)
        ? `<svg ${common} class="os-ms-icon os-ms-liquid"><path d="M34 18h46l-5 49H39z"/><path d="M40 42h34v20H40z"/><path d="M81 25q25-3 19 21-4 12-22 8"/></svg>`
        : `<svg ${common} class="os-ms-icon os-ms-liquid"><path d="M48 8h24v13l10 11v35H38V32l10-11z"/><path d="M42 44h36v19H42z"/></svg>`;
      return `<svg ${common} class="os-ms-icon os-ms-liquid"><path d="M22 12v50q0 8 8 8h60q8 0 8-8V12"/><path d="M25 39h70v25H25z"/></svg>`;
    }
    return `<svg ${common} class="os-ms-icon os-ms-path"><circle cx="22" cy="39" r="13"/><circle cx="60" cy="39" r="13"/><circle cx="98" cy="39" r="13"/><path d="M35 39h12M73 39h12"/></svg>`;
  }

  function labels(model) {
    const unit = model.unit ? ` ${model.unit}` : '';
    const resultUnit = model.result_unit ? ` ${model.result_unit}` : '';
    const values = exactResult(model);
    if (model.structure === 'fraction_then_group') return {
      given: `${shown(model.given)}${unit}`,
      givenLabel: model.given_label || 'starting amount',
      firstRelation: `${shown(model.first_fraction)} ${model.first_label || 'is used'}`,
      firstOperation: `× ${shown(model.first_fraction)}`,
      intermediate: `${shown(values.intermediate)}${unit}`,
      intermediateLabel: model.intermediate_label || 'amount used',
      secondRelation: `${shown(model.group_size)}${unit} ${model.group_label || 'in each group'}`,
      secondOperation: `÷ ${shown(model.group_size)}`,
      result: `${shown(values.result)}${resultUnit}`,
      resultLabel: model.result_label || 'complete groups'
    };
    if (model.structure === 'reconstruct_then_fraction') return {
      given: `${shown(model.given)}${unit}`,
      givenLabel: model.given_label || 'known part',
      firstRelation: `${shown(model.known_fraction)} ${model.first_label || 'of the whole'}`,
      firstOperation: `÷ ${shown(model.known_fraction)}`,
      intermediate: `${shown(values.intermediate)}${unit}`,
      intermediateLabel: model.intermediate_label || 'reconstructed whole',
      secondRelation: `${shown(model.target_fraction)} ${model.second_label || 'of the whole'}`,
      secondOperation: `× ${shown(model.target_fraction)}`,
      result: `${shown(values.result)}${resultUnit || unit}`,
      resultLabel: model.result_label || 'required amount'
    };
    if (model.structure === 'reconstruct_then_group') return {
      given: `${shown(model.given)}${unit}`,
      givenLabel: model.given_label || 'known part',
      firstRelation: `${shown(model.known_fraction)} ${model.first_label || 'of the whole'}`,
      firstOperation: `÷ ${shown(model.known_fraction)}`,
      intermediate: `${shown(values.intermediate)}${unit}`,
      intermediateLabel: model.intermediate_label || 'reconstructed whole',
      secondRelation: `${shown(model.group_size)}${unit} ${model.group_label || 'in each group'}`,
      secondOperation: `÷ ${shown(model.group_size)}`,
      result: `${shown(values.result)}${resultUnit}`,
      resultLabel: model.result_label || 'complete groups'
    };
    if (model.structure === 'repeat_then_group') return {
      given: `${shown(model.copies)} ${model.item_label || 'equal amounts'}`,
      givenLabel: `${shown(model.item_size)}${unit} each`,
      firstRelation: model.first_label || 'combine the equal amounts',
      firstOperation: `× ${shown(model.item_size)}`,
      intermediate: `${shown(values.intermediate)}${unit}`,
      intermediateLabel: model.intermediate_label || 'combined amount',
      secondRelation: `${shown(model.group_size)}${unit} ${model.group_label || 'in each group'}`,
      secondOperation: `÷ ${shown(model.group_size)}`,
      result: `${shown(values.result)}${resultUnit}`,
      resultLabel: model.result_label || 'complete groups'
    };
    return {
      given: `${shown(model.given)}${unit}`,
      givenLabel: model.given_label || 'starting amount',
      firstRelation: `${shown(model.first_fraction)} ${model.first_label || 'takes part one'}`,
      firstOperation: `× ${shown(model.first_fraction)}`,
      intermediate: `${shown(values.intermediate)}${unit}`,
      intermediateLabel: model.intermediate_label || 'first result',
      secondRelation: `${shown(model.second_fraction)} ${model.second_label || 'of that result'}`,
      secondOperation: `× ${shown(model.second_fraction)}`,
      result: `${shown(values.result)}${resultUnit || unit}`,
      resultLabel: model.result_label || 'required amount'
    };
  }

  const stage = (context, role, value, label, known) => `<article class="os-ms-stage os-ms-${role}" data-known="${known}">
    ${icon(context, role)}<strong>${known ? math(value) : '?'}</strong><span>${math(label)}</span>
  </article>`;
  const connector = (relationship, operation, showOperation) => `<div class="os-ms-connector"><span aria-hidden="true">→</span><p>${math(relationship)}</p>${showOperation ? `<b>${math(operation)}</b>` : ''}</div>`;

  function renderRule(model, reveal) {
    const relation = model.rule_context || 'Use each result in the relationship that follows.';
    return `<div class="os-multi-step os-ms-rule" data-ms-context="${esc(model.context || 'method')}">
      <p class="os-ms-question">${esc(model.heading || 'Track the quantity through both relationships')}</p>
      <div class="os-ms-rule-path"><article><strong>Given quantity</strong><span>what the problem starts with</span></article><span>→</span><article><strong>Intermediate quantity</strong><span>the result of the first relationship</span></article><span>→</span><article><strong>Required quantity</strong><span>the final answer</span></article></div>
      <p class="os-ms-note">${esc(reveal ? relation : 'Choose a route that preserves what each quantity means.')}</p>
    </div>`;
  }

  function render(model, reveal, workingRevealed = 1) {
    if (model.kind === 'multi_step_rule') return renderRule(model, reveal);
    const data = labels(model), phase = activePhase(model, reveal, workingRevealed), level = rank(phase);
    const middleKnown = level >= rank('intermediate');
    const resultKnown = level >= rank('result') && model.hide_numeric_result !== true;
    const firstOperation = level >= rank('first_relation');
    const secondOperation = level >= rank('second_relation');
    const context = model.context || 'path';
    return `<div class="os-multi-step" data-ms-context="${esc(context)}" data-ms-structure="${esc(model.structure)}" data-ms-phase="${esc(phase)}">
      <p class="os-ms-question">${esc(model.heading || 'Follow the quantity, not just the numbers')}</p>
      <div class="os-ms-pathway">
        ${stage(context, 'given', data.given, data.givenLabel, true)}
        ${connector(data.firstRelation, data.firstOperation, firstOperation)}
        ${stage(context, 'middle', data.intermediate, data.intermediateLabel, middleKnown)}
        ${connector(data.secondRelation, data.secondOperation, secondOperation)}
        ${stage(context, 'result', data.result, data.resultLabel, resultKnown)}
      </div>
      <p class="os-ms-note">${middleKnown ? `The first result is now the quantity used in the next relationship.` : `The middle card is necessary; it is not yet the final answer.`}</p>
    </div>`;
  }

  function accessible(model, reveal, workingRevealed = 1) {
    if (model.kind === 'multi_step_rule') return reveal
      ? `Given quantity, then intermediate quantity, then required quantity. ${model.rule_context || 'Use each result in the relationship that follows.'}`
      : 'A three-stage path from a given quantity through an unknown intermediate quantity to the required quantity. No answer is shown.';
    const data = labels(model), phase = activePhase(model, reveal, workingRevealed), level = rank(phase);
    let description = `${model.accessible_context || model.context}. Start with ${data.given}: ${data.givenLabel}. ${data.firstRelation}.`;
    if (level >= rank('intermediate')) description += ` The intermediate quantity is ${data.intermediate}: ${data.intermediateLabel}.`;
    else description += ' The intermediate quantity is not shown.';
    description += ` ${data.secondRelation}.`;
    if (level >= rank('result') && model.hide_numeric_result !== true) description += ` The required quantity is ${data.result}: ${data.resultLabel}.`;
    else description += ' The required result is not shown.';
    return description;
  }

  window.RevilyMultiStepVisuals = { exactResult, render, accessible, activePhase };
})();
