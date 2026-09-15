export function createPracticeLoader(fetcher=fetch){
  let menuPromise,searchPromise;
  const pending=new Map();
  const json=async url=>{const response=await fetcher('./'+url);if(!response.ok)throw new Error('This question pack could not load. Please try again.');return response.json();};
  const menu=()=>menuPromise??=(json('bank/index.json').then(index=>{
    if(index.schema!==2)throw new Error('Please refresh to open the updated topic menu.');
    index.questions=index.questions.map(([id,question_number,source,pack,parts,question_type,ib_level])=>({id,question_number,source:index.sources[source],pack:index.packUrls[pack],question_type:question_type??undefined,ib_level:ib_level??undefined,contexts:[],parts:parts.map(([label,subtopic_ids,duplicate_group,context_ids])=>({label,subtopic_ids,duplicate_group,context_ids,review_status:'reviewed',depends_on:[]}))}));
    return index;
  }).catch(error=>{menuPromise=null;throw error;}));
  async function search(){
    if(!searchPromise)searchPromise=(async()=>{const index=await menu(),text=await json(index.search);for(const q of index.questions){const item=text[q.id];if(!item)throw new Error('Search index needs refreshing.');q.contexts=item.contexts;for(const p of q.parts)p.text=item.parts.find(x=>x.label===p.label)?.text??'';}return index;})().catch(error=>{searchPromise=null;throw error;});
    return searchPromise;
  }
  async function questions(matches,onProgress=()=>{}){
    const urls=[...new Set(matches.map(r=>r.question.pack))];let complete=0;
    const packs=await Promise.all(urls.map(url=>{if(!pending.has(url))pending.set(url,json(url).catch(error=>{pending.delete(url);throw error;}));return pending.get(url).then(pack=>{onProgress(++complete,urls.length);return pack;});}));
    const all=new Map(packs.flatMap(p=>p.questions.map(q=>[q.id,q])));
    const results=matches.map(result=>{const question=all.get(result.question.id);if(!question)throw new Error('A question pack needs refreshing.');return {...result,question};});
    return {results,data:{guidance:{entries:Object.assign({},...packs.map(p=>p.guidance.entries))},answers:{entries:Object.assign({},...packs.map(p=>p.answers.entries))},presentation:Object.assign({},...packs.map(p=>p.presentation))}};
  }
  return {menu,search,questions};
}
