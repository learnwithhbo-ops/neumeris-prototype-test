(function(){
 'use strict';
 const F=()=>window.RevilyFDPComparison,exact=raw=>window.RevilyPercentageFractionAmount.expression(raw),same=(a,b)=>F().same(a,b),one={n:1n,d:1n},zero={n:0n,d:1n};
 const op=(a,b,k)=>k==='+'?{n:a.n*b.d+b.n*a.d,d:a.d*b.d}:k==='-'?{n:a.n*b.d-b.n*a.d,d:a.d*b.d}:k==='*'?{n:a.n*b.n,d:a.d*b.d}:b.n?{n:a.n*b.d,d:a.d*b.n}:null;
 // Inspect only a calculation already accepted by the bounded exact grammar.
 // No evaluation of JavaScript, hidden learner method or prompt-derived numbers.
 function tree(raw){
  const text=String(raw).split('=')[0].replace(/[×xX]/g,'*').replace(/÷/g,'/').replace(/−/g,'-'),tokens=text.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+*\/-]/g);let i=0;
  const binary=(a,b,k)=>({op:k,left:a,right:b,value:op(a.value,b.value,k)});
  function atom(){const t=tokens[i++];if(t==='('){const a=sum();i++;return a;}if(t==='+'||t==='-'){const a=atom();return t==='+'?a:{op:'neg',left:a,value:{n:-a.value.n,d:a.value.d}};}return{op:'number',value:F().parse(t)};}
  function product(){let a=atom();while(['*','/'].includes(tokens[i])){const k=tokens[i++];a=binary(a,atom(),k);}return a;}
  function sum(){let a=product();while(['+','-'].includes(tokens[i])){const k=tokens[i++];a=binary(a,product(),k);}return a;}
  return sum();
 }
 const hasProduct=n=>n.op==='*'||Boolean(n.left&&hasProduct(n.left))||Boolean(n.right&&hasProduct(n.right));
 function factorOut(n,common){if(same(n.value,common))return one;if(n.op==='*'){const left=factorOut(n.left,common);if(left)return op(left,n.right.value,'*');const right=factorOut(n.right,common);if(right)return op(n.left.value,right,'*');}if(n.op==='/'){const left=factorOut(n.left,common);if(left)return op(left,n.right.value,'/');}return null;}
 function terms(n,sign=1){return n.op==='+'?[...terms(n.left,sign),...terms(n.right,sign)]:n.op==='-'?[...terms(n.left,sign),...terms(n.right,-sign)]:[{node:n,sign}];}
 function splitProduct(n,common,total){const pieces=terms(n).filter(t=>t.node.value.n!==0n);if(pieces.length<2)return false;let sum=zero;for(const piece of pieces){if(!hasProduct(piece.node))return false;const coefficient=factorOut(piece.node,common);if(!coefficient)return false;sum=op(sum,coefficient,piece.sign===1?'+':'-');}return same(sum,total);}
 function analyse(raw,original,multiplier){
  const calculation=exact(raw),a=F().parse(original),m=F().parse(multiplier),expected=a&&m?op(a,m,'*'):null;
  if(!calculation||!expected)return{calculationValid:false,mathematicallyCorrect:false,multiplierMethodShown:false,correctAlternativeMethodShown:false,methodNotShown:false,route:null};
  const mathematicallyCorrect=same(calculation.value,expected);let route=null;
  if(mathematicallyCorrect)for(const side of String(raw).split('=')){
   const ast=tree(side);
   if(ast.op==='*'&&((same(ast.left.value,a)&&same(ast.right.value,m))||(same(ast.left.value,m)&&same(ast.right.value,a))))route='direct_product';
   else if(hasProduct(ast)&&same(factorOut(ast,a),m))route='factored_product';
   else if(splitProduct(ast,a,m))route='split_multiplier';
   else if(splitProduct(ast,m,a))route='split_original';
   else{const nonzero=terms(ast).filter(t=>t.node.value.n!==0n);if(nonzero.length===1&&nonzero[0].sign===1&&hasProduct(nonzero[0].node)&&same(factorOut(nonzero[0].node,a),m))route='product_with_zero_term';}
   if(route)break;
  }
  const hasCalculation=String(raw).split('=').some(side=>tree(side).op!=='number');
  return{calculationValid:true,mathematicallyCorrect,multiplierMethodShown:Boolean(route),correctAlternativeMethodShown:mathematicallyCorrect&&hasCalculation&&!route,methodNotShown:mathematicallyCorrect&&!hasCalculation,route};
 }
 window.RevilyMultiplierMethod={analyse};
})();
