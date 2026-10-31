/* Selected field photographs. Captions describe visible context, not participants or outcomes. */
const views = [
  {id:'services',topic:'Street trade',title:'Along one street',file:'sz-services.jpg',width:1600,height:1200,alt:'Pedestrians pass storefronts with visible dental, courier and mobile-phone signage.',caption:'Dental, courier and mobile-phone storefronts share one street.',limit:'This is a commercial setting. The image does not establish service quality, affordability or the share of cross-border customers.'},
  {id:'meals',topic:'Street trade',title:'A posted menu',file:'sz-meals.jpg',width:1200,height:1600,alt:'A food-stall sign advertises meal combinations at 16 and 20 yuan.',caption:'A posted menu offers two combinations: 16 and 20 yuan.',limit:'One photographed sign, with an unverified capture date. It is not a current price list or a comparison of living costs.'},
  {id:'parcels',topic:'Street trade',title:'A collection point',file:'sz-parcels.jpg',width:1200,height:1600,alt:'A small neighbourhood parcel pickup storefront with shelves and everyday objects.',caption:'A small neighbourhood parcel pickup storefront in Shenzhen.',limit:'The storefront does not establish parcel flows, who its customers are, or how often they use it.'},
  {id:'maps',topic:'Finding your way',title:'Two networks on display',file:'sz-transit-maps.jpg',width:2048,height:1536,alt:'Printed Shenzhen rail and MTR system maps are displayed side by side above information brochures.',caption:'Shenzhen rail and MTR maps displayed together.',limit:'Information on display, photographed during the field trip. Use current transport sources for journey planning; this image does not establish the information point’s operator or the help received.'},
  {id:'community',topic:'Finding your way',title:'A sign toward services',file:'sz-community-sign.jpg',width:1200,height:1600,alt:'A sign beside a planted residential frontage names Lianhua Ercun Community Public Service Center and points left.',caption:'A sign points toward Lianhua Ercun’s community service centre.',limit:'The sign identifies a place. It does not establish service eligibility, staffing, use by cross-border residents or outcomes.'},
  {id:'park',topic:'Public space',title:'Beside the water',file:'sz-park.jpg',width:1200,height:1600,alt:'Trees shade grass beside a waterside footpath, with a few distant people walking.',caption:'Trees, water and a walking path on the Shenzhen field trip.',limit:'A view of public space. The exact park and capture date are unverified; no pictured person is identified as a participant.'}
];
const asset = name => new URL(`./assets/${name}`,import.meta.url).href;
let instance = 0;

export function initFieldGallery(element){
  const prefix=`field-photo-${++instance}`;
  const layout=document.createElement('div');layout.className='fj-layout fj-expanded';
  const figure=document.createElement('figure');figure.className='fj-main';
  const topic=document.createElement('p');topic.className='fj-topic';
  const wrap=document.createElement('div');wrap.className='fj-image-wrap';
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';wrap.append(img);
  const caption=document.createElement('figcaption');const text=document.createElement('p');text.className='fj-caption';
  const number=document.createElement('span');number.className='fj-number';number.setAttribute('aria-hidden','true');caption.append(text,number);
  const limit=document.createElement('p');limit.className='fj-limit';
  const actions=document.createElement('div');actions.className='fj-actions';
  const enlarge=document.createElement('button');enlarge.type='button';enlarge.className='fj-enlarge';enlarge.textContent='Enlarge photograph';
  const original=document.createElement('a');original.className='fj-original';original.textContent='Open original ↗';original.target='_blank';original.rel='noopener';
  actions.append(enlarge,original);figure.append(topic,wrap,caption,limit,actions);
  const choices=document.createElement('div');choices.className='fj-choices';choices.setAttribute('role','group');choices.setAttribute('aria-label','Choose one of six Shenzhen field photographs');
  const buttons=views.map((view,i)=>{
    const b=document.createElement('button');b.type='button';b.className='fj-choice';b.setAttribute('aria-pressed',String(i===0));
    const thumb=document.createElement('img');thumb.src=asset(view.file);thumb.alt='';thumb.loading='lazy';thumb.decoding='async';thumb.width=80;thumb.height=80;
    const label=document.createElement('span');const category=document.createElement('small');category.textContent=view.topic;const title=document.createElement('b');title.textContent=view.title;label.append(category,title);b.append(thumb,label);choices.append(b);return b;
  });
  const status=document.createElement('span');status.className='visually-hidden';status.setAttribute('role','status');status.setAttribute('aria-atomic','true');
  const dialog=document.createElement('dialog');dialog.className='fj-dialog';dialog.setAttribute('aria-labelledby',`${prefix}-caption`);dialog.setAttribute('aria-describedby',`${prefix}-limit`);
  const dialogInner=document.createElement('div');dialogInner.className='fj-dialog-inner';
  const close=document.createElement('button');close.type='button';close.className='fj-dialog-close';close.textContent='Close photograph';close.autofocus=true;
  const large=document.createElement('img');large.decoding='async';
  const largeCaption=document.createElement('p');largeCaption.className='fj-dialog-caption';largeCaption.id=`${prefix}-caption`;
  const largeLimit=document.createElement('p');largeLimit.className='fj-dialog-limit';largeLimit.id=`${prefix}-limit`;
  const credit=document.createElement('p');credit.className='fj-dialog-credit';credit.textContent='Field photograph supplied by Bob and Jamie · full image, unchanged';
  dialogInner.append(close,large,largeCaption,largeLimit,credit);dialog.append(dialogInner);
  let current=0;
  function select(i,announce=true){
    current=i;const view=views[i];layout.dataset.format=view.height>view.width?'portrait':'landscape';
    img.src=asset(view.file);img.alt=view.alt;img.width=view.width;img.height=view.height;
    topic.textContent=view.topic;text.textContent=view.caption;number.textContent=`${String(i+1).padStart(2,'0')} / ${String(views.length).padStart(2,'0')}`;limit.textContent=view.limit;original.href=asset(view.file);
    buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(i===n)));
    if(announce)status.textContent=`Photograph ${i+1} of ${views.length}. ${view.caption}`;
  }
  const onClick=e=>{const i=buttons.findIndex(b=>b.contains(e.target));if(i>=0)select(i)};
  const onKey=e=>{
    let next;
    if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(current+1)%views.length;
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(current+views.length-1)%views.length;
    else if(e.key==='Home')next=0;
    else if(e.key==='End')next=views.length-1;
    else return;
    e.preventDefault();select(next);buttons[next].focus();
  };
  const openDialog=()=>{
    const view=views[current];large.src=asset(view.file);large.alt=view.alt;large.width=view.width;large.height=view.height;largeCaption.textContent=view.caption;largeLimit.textContent=view.limit;
    if(typeof dialog.showModal==='function'){dialog.showModal();close.focus();}
    else original.click();
  };
  const closeDialog=()=>dialog.close();
  const restoreFocus=()=>enlarge.focus({preventScroll:true});
  const outsideClick=e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()};
  choices.addEventListener('click',onClick);choices.addEventListener('keydown',onKey);enlarge.addEventListener('click',openDialog);close.addEventListener('click',closeDialog);dialog.addEventListener('close',restoreFocus);dialog.addEventListener('click',outsideClick);
  layout.append(figure,choices,status);element.replaceChildren(layout,dialog);select(0,false);
  return {destroy(){if(dialog.open)dialog.close();choices.removeEventListener('click',onClick);choices.removeEventListener('keydown',onKey);enlarge.removeEventListener('click',openDialog);close.removeEventListener('click',closeDialog);dialog.removeEventListener('close',restoreFocus);dialog.removeEventListener('click',outsideClick);element.replaceChildren()}};
}
