(function () {
  "use strict";

  function gcd(a, b) {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y) [x, y] = [y, x % y];
    return x || 1n;
  }

  function rational(numerator, denominator) {
    let n = BigInt(numerator);
    let d = BigInt(denominator);
    if (d === 0n) return null;
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const divisor = gcd(n, d);
    return { n: n / divisor, d: d / divisor };
  }

  function parseRational(value) {
    if (value && typeof value === "object" && "whole" in value) {
      const whole = BigInt(value.whole || 0);
      const numerator = BigInt(value.n || 0);
      const denominator = BigInt(value.d || 1);
      const sign = whole < 0n ? -1n : 1n;
      return rational(whole * denominator + sign * numerator, denominator);
    }
    if (value && typeof value === "object" && "n" in value && "d" in value) {
      return rational(value.n, value.d);
    }
    const text = String(value ?? "").trim().replace(/−/g, "-");
    let match = text.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (match) {
      const whole = BigInt(match[1]);
      const numerator = BigInt(match[2]);
      const denominator = BigInt(match[3]);
      const sign = whole < 0n ? -1n : 1n;
      return rational(whole * denominator + sign * numerator, denominator);
    }
    match = text.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (match) return rational(match[1], match[2]);
    if (/^-?\d+$/.test(text)) return rational(text, 1);
    return null;
  }

  function parseDecimal(value) {
    const text = String(value ?? "").trim().replace(/\u2212/g, "-");
    const match = text.match(/^([+-]?)(\d+)(?:\.(\d*))?$/);
    if (!match) return null;
    const sign = match[1] === "-" ? -1n : 1n;
    const fraction = match[3] || "";
    const scale = 10n ** BigInt(fraction.length);
    const digits = BigInt(`${match[2]}${fraction}` || "0");
    return rational(sign * digits, scale);
  }

  function parseMoneyPence(value) {
    if (typeof value === "number" && Number.isSafeInteger(value)) return value;
    const text = String(value ?? "").trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
    const pence = text.match(/^([+-]?\d+)\s*p(?:ence)?$/i);
    if (pence) {
      const result = Number(pence[1]);
      return Number.isSafeInteger(result) ? result : null;
    }
    const pounds = text.replace(/^£\s*/, "");
    const match = pounds.match(/^([+-]?)(\d+)(?:\.(\d{1,2}))?$/);
    if (!match) return null;
    const sign = match[1] === "-" ? -1 : 1;
    const whole = Number(match[2]);
    const pennies = Number((match[3] || "").padEnd(2, "0") || 0);
    const result = sign * ((whole * 100) + pennies);
    return Number.isSafeInteger(result) ? result : null;
  }

  function exactFractionParts(value) {
    if (value && typeof value === "object" && "n" in value && "d" in value) {
      return { n: String(value.n), d: String(value.d) };
    }
    const match = String(value ?? "").trim().match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    return match ? { n: match[1], d: match[2] } : null;
  }

  function sameRational(left, right) {
    const a = parseRational(left);
    const b = parseRational(right);
    return Boolean(a && b && a.n === b.n && a.d === b.d);
  }

  function normaliseText(value) {
    return String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/×/g, "x")
      .toLowerCase();
  }

  function normaliseYesNo(value) {
    if (value === true) return "yes";
    if (value === false) return "no";
    const text = normaliseText(value);
    if (["true", "yes", "y"].includes(text)) return "yes";
    if (["false", "no", "n"].includes(text)) return "no";
    return text;
  }

  function normaliseSequence(value) {
    if (Array.isArray(value)) return value.map(normaliseText);
    return String(value ?? "").split(/\s*(?:<|,|→)\s*/).filter(Boolean).map(normaliseText);
  }

  function normaliseStructured(value) {
    if (Array.isArray(value)) return value.map(normaliseStructured);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normaliseStructured(value[key])]));
    }
    if (typeof value === "boolean") return value;
    return normaliseText(value);
  }

  function sameStructured(left, right) {
    return JSON.stringify(normaliseStructured(left)) === JSON.stringify(normaliseStructured(right));
  }

  function validate(question, response) {
    const answer = question?.answer?.value;
    const type = question?.response?.type;
    if(type==='percentage_change_fields')return window.RevilyPercentageChangeStructure?.evidence(question,response).correct===true;
    if(type==='mixed_percentage_answer')return window.RevilyMixedPercentage?.evidence(question,response).correct===true;
    if(type==='percentage_form')return window.RevilyPercentageComparison?.evidence(question,response).correct===true;
    if(type==='measured_percentage_amount')return window.RevilyMeasuredPercentageAmount?.evidence(question,response).correct===true;
    if(type==='money_percentage_amount')return window.RevilyMoneyPercentageAmount?.evidence(question,response).correct===true;
    if(type==='method_choice_amount')return window.RevilyMethodChoiceAmount?.evidence(question,response).correct===true;
    if(type==='decimal_multiplier_amount')return window.RevilyDecimalMultiplierAmount?.evidence(question,response).correct===true;
    if(type==='one_percent_amount')return window.RevilyOnePercentAmount?.evidence(question,response).correct===true;
    if(type==='percentage_fraction_amount')return window.RevilyPercentageFractionAmount?.evidence(question,response).correct===true;
    if(type==='mixed_fdp_forms')return window.RevilyMixedFDP?.evidence(question,response).correct===true;
    if(type==='fdp_ordering')return window.RevilyFDPOrdering?.evidence(question,response).correct===true;
    if(type==='fdp_comparison')return window.RevilyFDPComparison?.evidence(question,response).correct===true;
    if(type==='percent_fraction')return window.RevilyPercentFraction?.evidence(question,response).correct===true;
    if(type==='decimal_percent'||question.response?.decimal_percent_fraction||question.response?.decimal_stage_fraction)return window.RevilyDecimalPercent?.evidence(question,response).correct===true;
    if(type==='equivalent_percent'||question.response?.equivalent_percent_fraction)return window.RevilyEquivalentPercent?.evidence(question,response).correct===true;
    if(question.response?.division_fraction)return window.RevilyDivisionDecimal?.evidence(question,response).correct===true;
    if(type==='equivalent_decimal')return window.RevilyPlaceValue?.evidence(question,response).correct===true;
    if(type==='power_ten_fields')return window.RevilyPlaceValue?.evidence(question,response).correct===true;
    if (['place_value_pair','place_value_forms','benchmark_forms','decimal_scale_pair','decimal_fraction','decimal_places_pair'].includes(type)) return window.RevilyPlaceValue?.evidence(question,response).correct===true;
    if (type === 'decimal' && question.response.allow_leading_decimal_point) return window.RevilyPlaceValue?.sameDecimal(response,answer)===true;
    if (type === "cancellation_working") return window.RevilyCancellation?.classify(question, response) === 'correct';
    if(question.response?.exchange_profile==='one_whole')return window.RevilyMixedExchange?.rewriteEvidence(question,response).correct===true;
    if(question.response?.require_proper_fractional_part){
      const p=window.RevilyMixedConversion?.mixedParts(response);
      return Boolean(p&&p.whole>0n&&p.n>0n&&p.n<p.d&&(!question.response.require_simplest_form||gcd(p.n,p.d)===1n)&&sameRational(p,answer));
    }
    if(question.response?.conversion_profile==='original_parts')return window.RevilyMixedConversion?.classify(question,response)==='correct';
    if (type === "conversion_product") return window.RevilyConversionProduct?.classify(question, response) === 'correct';
    if (type === "exact_number") return sameRational(response, answer);
    if (question?.validationProfile === "fra11" && window.RevilyFra11Canonical?.classifyResponse) {
      return window.RevilyFra11Canonical.classifyResponse(question, response).correct === true;
    }
    if (type === "division_then_mixed") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      return ["quotient", "remainder", "whole", "n", "d"].every((key) => (
        /^\d+$/.test(String(response[key] ?? ""))
        && /^\d+$/.test(String(answer[key] ?? ""))
        && BigInt(response[key]) === BigInt(answer[key])
      ));
    }
    if (type === "fraction") {
      if(question.response.allow_mixed_number&&question.response.require_simplest_form) {
        const mixed=String(response??'').trim().match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
        const value=response&&typeof response==='object'&&'whole' in response?response:mixed?{whole:mixed[1],n:mixed[2],d:mixed[3]}:null;
        if(value) {
          if(!['whole','n','d'].every(k=>/^\d+$/.test(String(value[k]??''))))return false;
          const w=BigInt(value.whole),n=BigInt(value.n),d=BigInt(value.d);
          return w>0n&&n>0n&&n<d&&gcd(n,d)===1n&&sameRational(response,answer);
        }
        const parts=exactFractionParts(response);
        return Boolean(parts&&BigInt(parts.d)>0n&&gcd(BigInt(parts.n),BigInt(parts.d))===1n&&sameRational(response,answer));
      }
      if (question.response.accept_equivalent_notation === false) {
        const submitted = exactFractionParts(response);
        const expected = exactFractionParts(answer);
        return Boolean(submitted && expected && BigInt(submitted.n) === BigInt(expected.n) && BigInt(submitted.d) === BigInt(expected.d));
      }
      return sameRational(response, answer);
    }
    if (type === "mixed_number") {
      if(question.response.require_simplest_form) {
        const match=String(response??'').trim().match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
        const value=response&&typeof response==='object'&&'whole' in response?response:match?{whole:match[1],n:match[2],d:match[3]}:null;
        if(!value||!['whole','n','d'].every(k=>/^\d+$/.test(String(value[k]??''))))return false;
        const w=BigInt(value.whole),n=BigInt(value.n),d=BigInt(value.d);
        return w>0n&&n>0n&&n<d&&gcd(n,d)===1n&&sameRational(value,answer);
      }
      return sameRational(response, answer);
    }
    if (type === "fra12_staged_fields") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      return ["wholePieceTotal", "totalNumerator", "finalNumerator"].every((key) => (
        /^-?\d+$/.test(String(response[key] ?? ""))
        && /^-?\d+$/.test(String(answer[key] ?? ""))
        && BigInt(response[key]) === BigInt(answer[key])
      ));
    }
    if (type === "fra19_staged_fields") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      return ["commonDenominator", "leftEquivalentNumerator", "rightEquivalentNumerator", "resultNumerator"].every((key) => (
        /^-?\d+$/.test(String(response[key] ?? ""))
        && /^-?\d+$/.test(String(answer[key] ?? ""))
        && BigInt(response[key]) === BigInt(answer[key])
      ));
    }
    if (type === "integer") {
      if(question.response.accept_exact_equivalents===true) {
        if(question.response.require_simplest_form) {
          const parts=exactFractionParts(response);
          if(!/^-?\d+$/.test(String(response??''))&&(!parts||BigInt(parts.d)!==1n))return false;
        }
        return sameRational(response,answer);
      }
      if(Array.isArray(question.response.common_factor_of)) {
        if(!/^\d+$/.test(String(response??''))||BigInt(response)<=1n)return false;
        return question.response.common_factor_of.length>1&&question.response.common_factor_of.every(value=>/^\d+$/.test(String(value))&&BigInt(value)%BigInt(response)===0n);
      }
      return /^-?\d+$/.test(String(response ?? "")) && BigInt(response) === BigInt(answer);
    }
    if (type === "two_step_integer") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      const fields = question.response?.fields || [];
      return fields.length > 0 && fields.every((field) => {
        const submitted = response[field.id];
        const expected = answer[field.id];
        return /^-?\d+$/.test(String(submitted ?? ""))
          && /^-?\d+$/.test(String(expected ?? ""))
          && BigInt(submitted) === BigInt(expected);
      });
    }
    if (type === "fra16_equivalent_comparison") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      const submitted = response.rewrittenNumerators;
      const expected = answer.rewrittenNumerators;
      return Array.isArray(submitted) && Array.isArray(expected)
        && submitted.length === expected.length
        && submitted.every((value, index) => /^-?\d+$/.test(String(value ?? "")) && BigInt(value) === BigInt(expected[index]))
        && normaliseText(response.symbol) === normaliseText(answer.symbol);
    }
    if (type === "fra16_benchmark_comparison") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      return sameStructured(response.relations, answer.relations)
        && normaliseText(response.symbol) === normaliseText(answer.symbol);
    }
    if (type === "fra16_order_cards") return sameStructured(response, answer);
    if (type === "choice_and_integer") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      return normaliseText(response.choice) === normaliseText(answer.choice)
        && /^-?\d+$/.test(String(response.whole ?? ""))
        && BigInt(response.whole) === BigInt(answer.whole);
    }
    if (type === "choice_two_step_integer") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      return normaliseText(response.choice) === normaliseText(answer.choice)
        && ["onePart", "whole"].every((key) => /^-?\d+$/.test(String(response[key] ?? "")) && BigInt(response[key]) === BigInt(answer[key]));
    }
    if (type === "quantity") {
      const submitted = parseDecimal(response);
      if (!submitted || !Number.isSafeInteger(Number(answer))) return false;
      const scale = BigInt(Number(question.response?.scale) || 1);
      return submitted.n * scale === BigInt(answer) * submitted.d;
    }
    if (type === "money") return parseMoneyPence(response) === Number(answer);
    if (type === "factor_then_integer") {
      if (!response || typeof response !== "object" || !answer || typeof answer !== "object") return false;
      return /^\d+$/.test(String(response.factor ?? ""))
        && /^-?\d+$/.test(String(response.value ?? ""))
        && BigInt(response.factor) === BigInt(answer.factor)
        && BigInt(response.value) === BigInt(answer.value);
    }
    if (type === "tick_selector") {
      return /^\d+$/.test(String(response ?? "")) && Number(response) === Number(answer);
    }
    if (type === "decimal") {
      if (question.response.accept_numeric_equivalent === false) {
        return String(response ?? "").trim().replace(/\u2212/g, "-") === String(answer ?? "").trim().replace(/\u2212/g, "-");
      }
      const submitted = parseDecimal(response);
      const expected = parseDecimal(answer);
      return Boolean(submitted && expected && submitted.n === expected.n && submitted.d === expected.d);
    }
    if (type === "yes_no") return normaliseYesNo(response) === normaliseYesNo(answer);
    if (type === "ordered_sequence") {
      const submitted = normaliseSequence(response);
      const expected = normaliseSequence(answer);
      return submitted.length === expected.length && submitted.every((item, index) => item === expected[index]);
    }
    if (type === "multiple_choice") {
      const submitted = [...new Set(Array.isArray(response) ? response.map(normaliseText) : [])].sort();
      const expected = [...new Set(Array.isArray(answer) ? answer.map(normaliseText) : [])].sort();
      return submitted.length === expected.length && submitted.every((item, index) => item === expected[index]);
    }
    if (type === "set_builder") {
      const selected = Array.isArray(response) ? new Set(response.map(String)) : null;
      const expectedCount = Number(answer);
      const total = Number(question?.response?.totalTokens || question?.model?.totalParts);
      return Boolean(selected && Number.isInteger(expectedCount) && selected.size === expectedCount
        && [...selected].every((index) => Number.isInteger(Number(index)) && Number(index) >= 0 && Number(index) < total));
    }
    if (["classification_sort", "classification_and_size", "classification_size_validity", "paired_classification"].includes(type)) {
      return sameStructured(response, answer);
    }
    return normaliseText(response) === normaliseText(answer);
  }

  function serialiseResponse(response) {
    if (typeof response === "bigint") return response.toString();
    if (Array.isArray(response)) return response.map(serialiseResponse);
    if (response && typeof response === "object") {
      return Object.fromEntries(Object.entries(response).map(([key, value]) => [key, serialiseResponse(value)]));
    }
    return response;
  }

  window.RevilyValidators = {
    exactFractionParts,
    normaliseSequence,
    normaliseText,
    parseRational,
    parseDecimal,
    parseMoneyPence,
    sameRational,
    sameStructured,
    serialiseResponse,
    validate
  };
})();
