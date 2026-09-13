import {formatText} from './math.js';
// Reviewed scientific illustration assets and accessible captions.
import {scientificFigures} from './figure-catalog.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const figureIds=Object.keys(scientificFigures);
export function readingFigure(id){
 const f=scientificFigures[id];if(!f)throw new Error(`Unknown reading figure: ${id}`);
 return `<figure class="reading-figure scientific-figure" data-figure="${esc(id)}"><img src="${esc(f.src)}" width="${f.width}" height="${f.height}" loading="lazy" decoding="async" alt="${esc(f.description)}"><figcaption><strong>${esc(f.title)}</strong><span>${formatText(f.caption)}</span><a class="figure-open" href="${esc(f.src)}" target="_blank" rel="noopener" aria-label="View diagram full size: ${esc(f.title)}">View diagram full size ↗</a></figcaption></figure>`;
}

export function gasSourcesTable(){return `<div class="gas-table"><table><caption>Examples of processes that release each gas</caption><thead><tr><th scope="col">Gas</th><th scope="col">Natural example</th><th scope="col">Human contribution</th></tr></thead><tbody>${[
 ['Water vapour · H₂O','Water becoming vapour; plants releasing vapour through their leaves','Burning fuels and industrial cooling release some vapour. Warming can also increase water vapour through the water cycle.'],
 ['Carbon dioxide · CO₂','Living things releasing energy from food; breakdown of dead material','Burning coal, oil or natural gas; some industrial processes.'],
 ['Methane · CH₄','Wet, waterlogged ground where microbes break down organic material','Livestock digestion, rotting waste and leaks during fuel production.'],
 ['Nitrous oxide · N₂O','Processes carried out by microbes, such as bacteria, in soils and water','Fertiliser use can increase the amount released from soil.']
 ].map(row=>`<tr><th scope="row">${formatText(row[0])}</th><td>${formatText(row[1])}</td><td>${formatText(row[2])}</td></tr>`).join('')}</tbody></table></div>`;}
