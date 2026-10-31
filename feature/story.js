import { initGame } from './game.js';
import { initWorld } from './world.js';
import { initEvidence } from './evidence.js';
import { initLibrary } from './library.js';

const html=document.documentElement;
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let paused=motionQuery.matches;
const motionButton=document.querySelector('#motion-control');
function motionUI(){html.dataset.motion=paused?'off':'on';motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'Resume motion':'Pause motion');motionButton.querySelector('span').textContent=paused?'Motion off':'Motion on';motionButton.querySelector('svg').innerHTML=paused?'<path d="M6 3 16 10 6 17Z"/>':'<path d="M7 4v12M13 4v12"/>';document.dispatchEvent(new CustomEvent('crossing:motion',{detail:{paused}}));}
motionUI();motionButton.addEventListener('click',()=>{paused=!paused;motionUI()});motionQuery.addEventListener('change',e=>{paused=e.matches;motionUI()});
function fail(element, retry){element.replaceChildren();const p=document.createElement('p');p.className='component-error';p.textContent='This interactive section could not load. The story remains available.';const b=document.createElement('button');b.type='button';b.textContent='Try again';b.addEventListener('click',retry);const a=document.createElement('a');a.href=new URL('../research.html',import.meta.url).href;a.textContent='Open the existing research companion';p.append(document.createElement('br'),b,a);element.append(p);}
function mount(id,fn){const el=document.querySelector(id);try{fn(el)}catch(err){console.error('Feature component failed:',id,err);fail(el,()=>mount(id,fn))}}
mount('#opening-game',initGame);mount('#life-model',initWorld);
const dataCache=new Map();
async function getData(path){if(dataCache.has(path))return dataCache.get(path);const response=await fetch(new URL(path,import.meta.url));if(!response.ok)throw new Error(`Data request failed (${response.status})`);const data=await response.json();dataCache.set(path,data);return data;}
async function loadEvidence(element){try{initEvidence(element,await getData('../research-data.json'))}catch(err){console.error('Evidence could not load:',err);fail(element,()=>loadEvidence(element))}}
document.querySelectorAll('[data-evidence]').forEach(loadEvidence);
async function loadLibrary(element){try{const [cases,measurement,research]=await Promise.all([getData('../data/response-cases.json'),getData('./measurement-menu.json'),getData('../research-data.json')]);initLibrary(element,cases,measurement,research.future)}catch(err){console.error('Research collection could not load:',err);fail(element,()=>loadLibrary(element))}}
document.querySelectorAll('[data-library]').forEach(loadLibrary);
let scheduled=false;function progress(){scheduled=false;const distance=html.scrollHeight-innerHeight;html.style.setProperty('--read-progress',`${distance>0?Math.max(0,Math.min(100,scrollY/distance*100)):0}%`)}addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress)}},{passive:true});addEventListener('resize',progress);progress();html.dataset.ready='true';
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{const target=document.getElementById(link.hash.slice(1));if(!target)return;target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});requestAnimationFrame(()=>target.focus({preventScroll:true}));}));
