import { initGame } from './game.js?v=20261031-v3';
import { initWorld } from './world.js?v=20261031-craft';
import { initAccountTour } from './account-tour.js?v=20261031-craft';
import { initFieldNotebook } from './field-notebook.js?v=20261031-craft';
import { initTiesAtlas } from './ties-atlas.js?v=20261031-craft';
import { initEvidence } from './evidence.js?v=20261031-v3';
import { initLibrary } from './library.js?v=20261031-v3';
import { initEveryday } from './everyday.js?v=20261031-v3';
import { initFieldGallery } from './field-gallery.js?v=20261031-v3';
const html=document.documentElement;
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let paused=motionQuery.matches;
const motionButton=document.querySelector('#motion-control');
function motionUI(){html.dataset.motion=paused?'off':'on';motionButton.querySelector('span').textContent=paused?'Resume motion':'Pause motion';motionButton.setAttribute('aria-label',paused?'Resume motion':'Pause motion');motionButton.querySelector('svg').innerHTML=paused?'<path d="M6 3 16 10 6 17Z"/>':'<path d="M7 4v12M13 4v12"/>';document.dispatchEvent(new CustomEvent('crossing:motion',{detail:{paused}}));}
motionUI();motionButton.addEventListener('click',()=>{paused=!paused;motionUI()});motionQuery.addEventListener('change',e=>{paused=e.matches;motionUI()});
function fail(element,retry){element.replaceChildren();const p=document.createElement('p');p.className='component-error';p.textContent='This interactive section could not load. The story remains available.';const b=document.createElement('button');b.type='button';b.textContent='Try again';b.addEventListener('click',retry);const a=document.createElement('a');a.href=new URL('../research.html',import.meta.url).href;a.textContent='Open the data appendix';p.append(document.createElement('br'),b,a);element.append(p);}
function mount(id,fn){const el=document.querySelector(id);if(!el)return;try{return fn(el)}catch(err){console.error('Feature component failed:',id,err);fail(el,()=>mount(id,fn))}}
mount('#opening-game',initGame);const world=mount('#life-model',initWorld);initAccountTour(document.querySelector('#arrangements'),world);mount('#field-gallery',initFieldGallery);mount('#field-notebook',initFieldNotebook);mount('#ties-atlas',initTiesAtlas);
// Share pending requests as well as resolved data between exhibits and the index.
const dataCache=new Map();
function getData(path){if(!dataCache.has(path)){const request=fetch(new URL(path,import.meta.url)).then(response=>{if(!response.ok)throw new Error(`Data request failed (${response.status})`);return response.json()}).catch(error=>{dataCache.delete(path);throw error});dataCache.set(path,request)}return dataCache.get(path)}
async function loadEvidence(element){try{initEvidence(element,await getData('../research-data.json'))}catch(err){console.error('Evidence could not load:',err);fail(element,()=>loadEvidence(element))}}
async function loadLibrary(element){try{const [cases,measurement,research]=await Promise.all([getData('../data/response-cases.json'),getData('./measurement-menu.json'),getData('../research-data.json')]);initLibrary(element,cases,measurement,research.future)}catch(err){console.error('Research collection could not load:',err);fail(element,()=>loadLibrary(element))}}
async function loadEveryday(element){try{initEveryday(element,await getData('./everyday-data.json'))}catch(err){console.error('Everyday evidence could not load:',err);fail(element,()=>loadEveryday(element))}}
async function loadSupplement(selector,fn){const host=document.querySelector(selector);if(!host)return;try{await fn(host)}catch(error){console.error('Research section could not load:',error);fail(host,()=>loadSupplement(selector,fn))}}
const loads=[loadSupplement('#policy-map',async host=>(await import('./policy-map.js?v=20261031-v3')).mountPolicyMap(host)),loadSupplement('#research-overview',async host=>(await import('./research-overview.js?v=20261031-v3')).mountResearchOverview(host)),...Array.from(document.querySelectorAll('[data-evidence]'),loadEvidence),...Array.from(document.querySelectorAll('[data-library]'),loadLibrary),...Array.from(document.querySelectorAll('[data-everyday-view]'),loadEveryday)];
// Native details keep the index light; deep links reveal their destination.
function revealTarget(hash,focus=false){let id;try{id=decodeURIComponent(hash.slice(1))}catch{return}const target=document.getElementById(id);if(!target)return;for(let node=target;node;node=node.parentElement){if(node.tagName==='DETAILS')node.open=true}if(focus){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});requestAnimationFrame(()=>target.focus({preventScroll:true}))}return target}
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;revealTarget(link.hash,true);if(link.closest('.contents-panel'))document.querySelector('#contents-menu').open=false});
addEventListener('hashchange',()=>revealTarget(location.hash));revealTarget(location.hash);
Promise.allSettled(loads).then(()=>{const target=revealTarget(location.hash);if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));progress()});
let scheduled=false;
function progress(){scheduled=false;const conclusion=document.querySelector('#conclusion');const distance=conclusion?conclusion.offsetTop+conclusion.offsetHeight-innerHeight:html.scrollHeight-innerHeight;html.style.setProperty('--read-progress',`${distance>0?Math.max(0,Math.min(100,scrollY/distance*100)):0}%`)}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress)}},{passive:true});addEventListener('resize',progress);document.querySelectorAll('details').forEach(details=>details.addEventListener('toggle',progress));progress();html.dataset.ready='true';
const photoPin=document.querySelector('.photo-pin');photoPin?.addEventListener('click',()=>{const open=photoPin.getAttribute('aria-expanded')!=='true';photoPin.setAttribute('aria-expanded',String(open));document.querySelector('#photo-detail').hidden=!open;photoPin.closest('.annotated-photo').classList.toggle('is-open',open);photoPin.querySelector('span:first-child').textContent=open?'−':'＋'});

// The current chapter is an orientation cue, not a continuously announced status.
const contents=document.querySelector('#contents-menu');
const contentsSummary=contents.querySelector('summary');
contents.addEventListener('keydown',event=>{if(event.key==='Escape'&&contents.open){contents.open=false;contentsSummary.focus()}});
document.addEventListener('pointerdown',event=>{if(contents.open&&!contents.contains(event.target))contents.open=false});
const chapters=[...document.querySelectorAll('[data-reading-title]')];
let chapterFrame=0;
function updateChapter(){chapterFrame=0;const offset=document.querySelector('.masthead').getBoundingClientRect().height+40;let current=chapters[0];for(const section of chapters){if(section.getBoundingClientRect().top<=offset)current=section;else break}if(!current)return;contentsSummary.querySelector('.current-chapter').textContent=current.dataset.readingTitle;contents.querySelectorAll('[data-chapter]').forEach(link=>{if(link.dataset.chapter===current.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}
addEventListener('scroll',()=>{if(!chapterFrame)chapterFrame=requestAnimationFrame(updateChapter)},{passive:true});addEventListener('resize',updateChapter);updateChapter();
