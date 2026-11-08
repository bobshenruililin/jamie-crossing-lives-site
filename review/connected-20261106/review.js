/* Review controls operate the frozen November 6 candidate. No changes are saved. */
const scenes={
  care:{target:'#care-loop',anchor:'#services',description:'Follow eligible care, records by permission and a conditional route back.',action:'Follow the pathway →'},
  connections:{target:'#ties-panel',anchor:'#ties',description:'Trace housing, work or relationships. Compare the two accounts in the same positions.',action:'Replay the home’s move →'},
  contacts:{target:'.circles',anchor:'#contact-story',description:'A lead, a qualification, a barrier, and someone who helped. Explore the reported sequence.',action:'Follow the account →'},
  johor:{target:'#echo',anchor:'#johor',description:'Open a question to see what prompted it. Published context stays separate.',action:'Explore the next question →'}
};
const frame=document.querySelector('#candidate'),before=document.querySelector('#before'),tryButton=document.querySelector('#try');
let scene='care',version='candidate',ready=false,step=0;
function doc(){return frame.contentDocument;}
function position(){const n=doc()?.querySelector(scenes[scene].target);if(n)frame.contentWindow.scrollTo({top:frame.contentWindow.scrollY+n.getBoundingClientRect().top-78,behavior:'instant'});}
function showScene(id){
  scene=id;step=0;document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===id)));
  document.querySelector('#scene-description').textContent=scenes[id].description;
  document.querySelector('#full-scene').href='snapshot/'+scenes[id].anchor;
  before.querySelector('img').src=`assets/before-${id}.jpg`;before.querySelector('img').alt=`Published main before this candidate: ${id}`;
  tryButton.textContent=ready?scenes[id].action:'Start in the preview ↓';
  if(ready){
    if(id==='care')doc().querySelector('[data-care-go="1"]').click();
    if(id==='connections'){doc().querySelector('.ties-switch [data-profile="guide"]').click();doc().querySelector('.ties-focus [data-focus="all"]').click();}
    if(id==='contacts')doc().querySelector('.contact-chain [data-contact="0"]').click();
    if(id==='johor')doc().querySelector('.echo-mark[data-n="1"]').click();
  }
  position();
}
function showVersion(id){version=id;frame.hidden=id==='before';before.hidden=id!=='before';document.querySelectorAll('[data-version]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.version===id)));tryButton.disabled=!ready||id!=='candidate';document.querySelector('#phone').disabled=id!=='candidate';if(id==='candidate')requestAnimationFrame(position);}
document.querySelector('.scenes').addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(b)showScene(b.dataset.scene);});
document.querySelector('.versions').addEventListener('click',e=>{const b=e.target.closest('[data-version]');if(b)showVersion(b.dataset.version);});
tryButton.addEventListener('click',()=>{
  if(!ready)return;step++;
  if(scene==='care')doc().querySelector(`[data-care-go="${[2,3,1][(step-1)%3]}"]`).click();
  if(scene==='connections'){doc().querySelector('.ties-switch [data-profile="guide"]').click();doc().querySelector('.ties-focus [data-focus="all"]').click();doc().querySelector('[data-replay]').click();}
  if(scene==='contacts')doc().querySelector(`.contact-chain [data-contact="${step%3}"]`).click();
  if(scene==='johor')doc().querySelector(`.echo-mark[data-n="${[3,2,4,1][(step-1)%4]}"]`).click();
  requestAnimationFrame(position);
});
document.querySelector('#phone').addEventListener('click',e=>{const on=frame.classList.toggle('is-phone');e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.textContent=on?'Desktop view':'Phone view';requestAnimationFrame(position);});
document.querySelector('.capture-switch').addEventListener('click',e=>{const b=e.target.closest('[data-shots]');if(!b)return;document.querySelectorAll('[data-shots]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));document.querySelector('.capture-grid').dataset.device=b.dataset.shots;document.querySelectorAll('[data-shot]').forEach(a=>{const url=`assets/${a.dataset.shot}-${b.dataset.shots}.jpg`;a.href=url;a.querySelector('img').src=url;});});
async function initialise(){
  ready=false;tryButton.disabled=true;
  const limit=Date.now()+15000;
  while(!doc()?.querySelector('.care-drawing')&&Date.now()<limit)await new Promise(r=>setTimeout(r,100));
  if(!doc()?.querySelector('.care-drawing')){tryButton.textContent='Open the website ↗';return;}
  await doc().fonts.ready;
  const finish=()=>{ready=true;tryButton.disabled=version!=='candidate';showScene(scene);};
  const notice=doc().querySelector('#status-popup');
  if(notice?.open)notice.addEventListener('close',finish,{once:true});else finish();
}
frame.addEventListener('load',initialise);
// Module may execute after a cached iframe has loaded.
if(frame.contentDocument?.readyState==='complete'&&frame.contentDocument.querySelector('#status-popup'))initialise();
