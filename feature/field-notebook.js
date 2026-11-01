/* Photo annotations are normalized to unchanged originals; no locations or outcomes are inferred. */
const photographs = [
  {
    id:'street', label:'Street services', title:'Everyday services, side by side',
    file:'sz-services.jpg', width:1600, height:1200,
    alt:'Pedestrians pass a row of storefronts with dental, courier and mobile-phone signage.',
    caption:'Shenzhen · a commercial street.',
    scope:'Signs show what is offered, not who uses it.',
    spots:[
      {id:'dental', label:'Dental', rect:[.071,.316,.262,.075], observation:'Dental services are advertised above the street.', limit:'Quality and prices are not established.'},
      {id:'parcels', label:'Parcels', rect:[.368,.323,.236,.073], observation:'Courier signage above a storefront with parcels outside.', limit:'Parcel volumes and destinations are unknown.'},
      {id:'mobile', label:'Mobile services', rect:[.649,.325,.303,.077], observation:'China Mobile signage identifies another everyday service.', limit:'The sign does not establish eligibility or use.'}
    ]
  },
  {
    id:'guides', label:'Arrival guides', title:'Information at the crossing',
    file:'sz-wayfinding.jpg', width:1536, height:2048,
    alt:'A rack holds guides in several languages beneath the Futian Port Inbound Service Center sign.',
    caption:'Futian Port · guides on display.',
    scope:'The operator is unconfirmed; referrals were not tested.',
    spots:[
      {id:'name', label:'Centre name', rect:[.244,.054,.523,.050], observation:'Futian Port Inbound Service Center.', limit:'The sign does not identify its operator.'},
      {id:'languages', label:'Language guides', rect:[.269,.247,.445,.126], observation:'Korean, Japanese and Spanish guides share a row.', limit:'Printed languages do not establish staff language support.'}
    ]
  },
  {
    id:'licences', label:'Licence conversion', title:'A service between systems',
    file:'ss-driving-school.jpg', width:1200, height:1600,
    alt:'Lee Kin Driving School storefront with a red sign advertising conversion to Mainland and Hong Kong driving licences.',
    caption:'Driving-licence conversion advertised at a Sheung Shui driving school.',
    scope:'Advertising, not evidence of completed applications.',
    spots:[
      {id:'conversion', label:'Conversion sign', rect:[.123,.516,.202,.244], observation:'The red sign advertises Mainland and Hong Kong driving-licence conversion.', limit:'Use, eligibility and outcomes are not shown.'}
    ]
  }
];
const asset = file => new URL(`./assets/${file}`,import.meta.url).href;
let instance=0;
const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node};

export function initFieldNotebook(host){
  const prefix=`field-notebook-${++instance}`;
  const notebook=make('div','fn-notebook');
  const tabs=make('div','fn-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Choose a field photograph');
  const tabButtons=photographs.map(photo=>{const button=make('button','fn-tab',photo.label);button.type='button';button.setAttribute('aria-pressed','false');tabs.append(button);return button});
  const grid=make('div','fn-grid');
  const context=make('figure','fn-context');
  const stage=make('div','fn-stage');
  const photoImage=make('img','fn-photo');photoImage.loading='lazy';photoImage.decoding='async';
  const highlight=make('span','fn-highlight');highlight.setAttribute('aria-hidden','true');highlight.hidden=true;
  stage.append(photoImage,highlight);
  const caption=make('figcaption','fn-caption');
  const credit=make('p','fn-credit','Field photographs supplied by Bob and Jamie.');
  context.append(stage,caption,credit);

  const reading=make('div','fn-reading');
  const title=make('h4','fn-title');
  const instruction=make('p','fn-instruction','Choose a detail.');
  const choices=make('div','fn-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Choose a visible detail');
  const detail=make('div','fn-detail');detail.hidden=true;
  const detailLabel=make('p','fn-detail-label','From the same photograph');
  const crop=make('div','fn-crop');crop.setAttribute('aria-hidden','true');
  const cropImage=make('img');cropImage.alt='';cropImage.decoding='async';crop.append(cropImage);
  const observation=make('p','fn-observation');observation.id=`${prefix}-observation`;
  const limit=make('p','fn-limit');
  detail.append(detailLabel,crop,observation,limit);
  const scope=make('p','fn-scope');
  const full=make('a','fn-original','Open full photograph ↗');full.target='_blank';full.rel='noopener';
  const status=make('span','fn-status');status.setAttribute('role','status');status.setAttribute('aria-atomic','true');
  reading.append(title,instruction,choices,detail,scope,full,status);
  grid.append(context,reading);notebook.append(tabs,grid);host.replaceChildren(notebook);

  let current=0, selected=-1, choiceButtons=[];
  function chooseDetail(index,announce=true){
    selected=index;const photo=photographs[current];const spot=photo.spots[index];
    choiceButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index+1)));
    highlight.hidden=!spot;detail.hidden=!spot;scope.hidden=Boolean(spot);
    if(!spot){if(announce)status.textContent=`Whole photograph. ${photo.caption}`;return}
    const [x,y,w,h]=spot.rect;
    detailLabel.textContent=spot.label;
    Object.assign(highlight.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`});
    crop.style.aspectRatio=String((photo.width*w)/(photo.height*h));
    cropImage.src=asset(photo.file);cropImage.width=photo.width;cropImage.height=photo.height;
    Object.assign(cropImage.style,{width:`${100/w}%`,left:`${-100*x/w}%`,top:`${-100*y/h}%`});
    observation.textContent=spot.observation;limit.textContent=spot.limit;
    if(announce)status.textContent=`${spot.label}. ${spot.observation} ${spot.limit}`;
  }
  function choosePhoto(index,announce=true){
    current=index;const photo=photographs[current];notebook.dataset.photo=photo.id;
    context.dataset.format=photo.width<photo.height?'portrait':'landscape';
    stage.style.aspectRatio=`${photo.width} / ${photo.height}`;
    photoImage.src=asset(photo.file);photoImage.alt=photo.alt;photoImage.width=photo.width;photoImage.height=photo.height;
    caption.textContent=photo.caption;title.textContent=photo.title;scope.textContent=photo.scope;full.href=asset(photo.file);
    tabButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    choiceButtons=['Whole view',...photo.spots.map(spot=>spot.label)].map((label,i)=>{const button=make('button','fn-choice',label);button.type='button';button.dataset.detail=String(i-1);button.setAttribute('aria-pressed',String(i===0));return button});
    choices.replaceChildren(...choiceButtons);chooseDetail(-1,false);
    if(announce)status.textContent=`${photo.label}. ${photo.caption}`;
  }
  const onPhotoClick=event=>{const index=tabButtons.findIndex(button=>button.contains(event.target));if(index>=0)choosePhoto(index)};
  const onPhotoKey=event=>{let next;if(event.key==='ArrowRight')next=(current+1)%photographs.length;else if(event.key==='ArrowLeft')next=(current+photographs.length-1)%photographs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=photographs.length-1;else return;event.preventDefault();choosePhoto(next);tabButtons[next].focus()};
  const onDetailClick=event=>{const button=event.target.closest('button[data-detail]');if(button&&choices.contains(button))chooseDetail(Number(button.dataset.detail))};
  const onDetailKey=event=>{let next;const count=choiceButtons.length;const focused=choiceButtons.indexOf(event.target.closest('button'));const start=focused<0?selected+1:focused;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(start+1)%count;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(start+count-1)%count;else if(event.key==='Home')next=0;else if(event.key==='End')next=count-1;else return;event.preventDefault();chooseDetail(next-1);choiceButtons[next].focus()};
  tabs.addEventListener('click',onPhotoClick);tabs.addEventListener('keydown',onPhotoKey);choices.addEventListener('click',onDetailClick);choices.addEventListener('keydown',onDetailKey);choosePhoto(0,false);
  return {destroy(){tabs.removeEventListener('click',onPhotoClick);tabs.removeEventListener('keydown',onPhotoKey);choices.removeEventListener('click',onDetailClick);choices.removeEventListener('keydown',onDetailKey);host.replaceChildren()}};
}
