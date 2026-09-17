export function progressPosition(tops, total, readingLine=0) {
  if(!total || !tops.length)return {current:0,total,remaining:total};
  let low=0,high=tops.length;
  while(low<high){const mid=(low+high)>>1;if(tops[mid]<=readingLine)low=mid+1;else high=mid;}
  const current=Math.min(total,Math.max(1,low));
  return {current,total,remaining:Math.max(0,total-current)};
}
export function practiceView(hash, hasQuestions) {
  return hash==='#practice' && hasQuestions ? 'practice' : 'selection';
}
