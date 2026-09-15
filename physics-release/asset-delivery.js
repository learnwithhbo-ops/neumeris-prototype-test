// The release builder sets a storage URL here; local previews use local files.
export const assetBase='';
export function assetUrl(relative){
  if(!relative||/^(?:[a-z]+:|\/\/)/i.test(relative)||relative.split('/').some(p=>p==='..'))throw new Error('Invalid collection asset path.');
  return assetBase+relative.split('/').map(encodeURIComponent).join('/');
}
