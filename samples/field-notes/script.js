const diagram=document.querySelector('.diagram');
const journey=document.querySelector('.diagram-journey');
const motionButton=document.querySelector('#motion');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let paused=false;
let framePending=false;
diagram.dataset.route='use';
function updateProgress(){
  framePending=false;
  if(paused||reducedMotion.matches){diagram.style.setProperty('--progress','1');return;}
  const bounds=journey.getBoundingClientRect();
  const travel=Math.max(1,journey.offsetHeight-window.innerHeight*.65);
  const progress=Math.min(1,Math.max(.12,(window.innerHeight*.72-bounds.top)/travel));
  diagram.style.setProperty('--progress',String(progress));
}
function requestProgress(){if(!framePending){framePending=true;requestAnimationFrame(updateProgress)}}
window.addEventListener('scroll',requestProgress,{passive:true});
window.addEventListener('resize',requestProgress);
reducedMotion.addEventListener('change',requestProgress);
requestProgress();
document.querySelectorAll('.selectors button').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.selectors button').forEach(item=>{item.classList.remove('active');item.setAttribute('aria-pressed','false')});
  button.classList.add('active');button.setAttribute('aria-pressed','true');
  diagram.dataset.route=button.dataset.route;
  document.querySelector('#diagram-label').textContent=button.dataset.label;
}));
motionButton.addEventListener('click',()=>{
  paused=!paused;motionButton.setAttribute('aria-pressed',String(paused));
  motionButton.textContent=paused?'Resume motion':'Pause motion';
  document.documentElement.classList.toggle('motion-paused',paused);
  requestProgress();
});
const photoInput=document.querySelector('#photos');
let localPhotos=[];
photoInput.addEventListener('change',()=>{
  localPhotos.forEach(URL.revokeObjectURL);localPhotos=[];
  const files=Array.from(photoInput.files).slice(0,4);
  const slots=['--cover','--one','--two','--closing'];
  const credits=[document.querySelector('[data-credit="0"]'),document.querySelector('.photo-large figcaption span:last-child'),document.querySelector('.photo-small figcaption span:last-child'),document.querySelector('[data-credit="3"]')];
  slots.forEach((slot,index)=>{
    if(files[index]){const url=URL.createObjectURL(files[index]);localPhotos.push(url);document.documentElement.style.setProperty(slot,`url("${url}")`);credits[index].textContent='Selected local photograph · caption to confirm';}
    else{document.documentElement.style.removeProperty(slot);credits[index].textContent=['Field photograph · SG–Johor visit','Johor Bahru · field photograph','Concourse and escalator · field photograph','MyICA poster · field photograph'][index];}
  });
  document.querySelector('#photo-status').textContent=files.length?`${files.length} local photo${files.length===1?'':'s'} selected; captions need confirmation.`:'Original field photographs restored.';
});
