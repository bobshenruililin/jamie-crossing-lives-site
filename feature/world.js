/* Authored spatial illustration adapted from the approved Border Instruments sample.
   Coordinates, buildings and paths explain relationships; they are not map data. */
let worldInstance = 0;
const instances = new WeakMap();

export function initWorld(container) {
  if (!container || typeof container.querySelector !== 'function') return null;
  if (instances.has(container)) return instances.get(container);
  const uid = `cl-world-${++worldInstance}`;
  container.classList.add('cl-world');
  container.innerHTML = `
    <div class="cl-world-arrangements" role="group" aria-label="Choose an illustrative life arrangement">
      <button type="button" data-case="use" aria-pressed="true"><span>Cross to use</span><svg viewBox="0 0 70 24" aria-hidden="true"><path d="M5 12h50m-7-6 7 6-7 6"/></svg></button>
      <button type="button" data-case="move" aria-pressed="false"><span>Move home</span><svg viewBox="0 0 70 24" aria-hidden="true"><path d="M5 12h50m-7-6 7 6-7 6M61 4v16"/></svg></button>
      <button type="button" data-case="work" aria-pressed="false"><span>Work or study across</span><svg viewBox="0 0 70 24" aria-hidden="true"><path d="M6 8h49m-6-5 6 5-6 5M58 17H9m6-5-6 5 6 5"/></svg></button>
      <button type="button" data-case="ties" aria-pressed="false"><span>Keep ties</span><svg viewBox="0 0 70 24" aria-hidden="true"><path d="M7 12c10-18 18 18 28 0s18 18 28 0"/></svg></button>
    </div>
    <figure class="cl-world-figure">
      <svg class="cl-world-scene" data-world="scene" viewBox="180 90 1220 640" role="img" tabindex="0" aria-labelledby="${uid}-title ${uid}-description" aria-keyshortcuts="ArrowLeft ArrowRight Home"></svg>
      <figcaption class="cl-world-caption"><span>Conceptual model · not a map</span><span>Drag horizontally or focus the model and use arrow keys</span></figcaption>
    </figure>
    <div class="cl-world-tools">
      <div class="cl-world-layers" data-world="layers" role="group" aria-label="Highlight an established part of life"></div>
      <div class="cl-world-camera">
        <button type="button" data-world="reset" aria-label="Reset the model view"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.5 7M4 4v6h6"/></svg><span>Reset view</span></button>
        <button type="button" data-world="motion" aria-pressed="false">Pause motion</button>
      </div>
    </div>
    <p class="cl-world-layer-help" data-world="layer-help">Choose a layer to highlight what this example establishes.</p>
    <div class="cl-world-reading" aria-live="polite" aria-atomic="true">
      <h3 data-world="case-title">Cross for a particular purpose</h3>
      <p data-world="case-note"></p>
    </div>
    <details class="cl-world-evidence">
      <summary>What the example does—and does not—establish <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7l6 6 6-6"/></svg></summary>
      <div class="cl-world-evidence-content"><div><p data-world="evidence-note"></p><p class="cl-world-evidence-limit">The four arrangements can overlap. They are not population categories. The architecture and paths are explanatory illustration; moving markers do not measure speed, frequency or journey counts.</p><a href="${new URL('../research-data.json',import.meta.url).href}">View the underlying arrangement descriptions</a></div><dl data-world="facts"></dl></div>
    </details>`;

  const NS = 'http://www.w3.org/2000/svg';
  const select = (key) => container.querySelector(`[data-world="${key}"]`);
  const selectAll = (selector) => [...container.querySelectorAll(selector)];
  const svg = select('scene');
  const colors = {home:'#c9512d',work:'#173e40',care:'#3c8b81',ties:'#b4774e',use:'#c9512d'};
  const cleanups = [];
  const listen = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    cleanups.push(() => target.removeEventListener(name, handler, options));
  };
  const arrangements=[
    {id:'use',title:'Cross for a particular purpose',short:'A visit can cross. A home can stay.',note:'A repair, meal or leisure trip can cross a border while other parts of life stay put.',source:'A repair, meal or leisure trip can cross a border while other parts of life stay put. Illustrative arrangements overlap; this is not a population classification.',home:'One side',work:'Not specified',use:'Across the border',ties:'Not specified',homeSide:0,routes:['use']},
    {id:'move',title:'Move home; retain connections',short:'Home moves. Connections remain.',note:'One participant described lower earnings alongside lower living costs and preferred work.',source:'One participant described lower earnings alongside lower living costs and preferred work. It is an individual account, not a measured general benefit.',home:'Shenzhen after Hong Kong',work:'Reported guiding work; location not specified',use:'Not specified',ties:'Family in Hong Kong',homeSide:1,routes:['ties']},
    {id:'work',title:'Separate residence and work or study',short:'A home here. Work or study across.',note:'Official cross-boundary pupil data illustrate separation of home and school.',source:'Official cross-boundary pupil data illustrate separation of home and school. Mainland residence is not necessarily Shenzhen; the pupil count does not measure workers.',home:'One side of a boundary',work:'Across the boundary',use:'Not specified',ties:'Not specified',homeSide:0,routes:['work']},
    {id:'ties',title:'Stay based in Hong Kong; keep ties elsewhere',short:'A base here. Relationships elsewhere.',note:'Connections can span places without moving home and work. This account does not establish a regular commute.',source:'The source account also mentions Shenzhen property. It does not establish a regular commute. Connections can span places without moving home and work.',home:'Rents in Hong Kong',work:'Hong Kong',use:'Not specified',ties:'Shenzhen family and friends',homeSide:0,routes:['ties','localwork']}
  ];

  let current=0, layer=null, yaw=-.62, targetYaw=-.62, tilt=.54;
  let dragging=false, startX=0, startY=0, lastX=0, horizontalDrag=false;
  let time=6500, lastTime=0, lastPaint=0, frameId=0, destroyed=false;
  let routeTokens=[];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let globalPaused = document.documentElement.dataset.motion === 'off' || motionQuery.matches;
  let localPaused = false;
  let inView = typeof IntersectionObserver === 'undefined';
  const isPaused = () => globalPaused || localPaused;
  const elem=(tag,attrs={},parent)=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(parent)parent.appendChild(el);return el;};
  function project(x,z,y=0){const a=Math.cos(yaw),b=Math.sin(yaw);return [790+(x*a-z*b)*1.15,460+(x*b+z*a)*tilt-y*1.15];}
  const p=(x,z,y=0)=>project(x,z,y).map(v=>Math.round(v*100)/100).join(',');
  function poly(points,fill,parent,extra={}){return elem('polygon',{points:points.map(q=>p(...q)).join(' '),fill,...extra},parent);}
  function line(points,stroke,width,parent,extra={}){return elem('polyline',{points:points.map(q=>p(...q)).join(' '),fill:'none',stroke,'stroke-width':width,...extra},parent);}
  function box(x,z,w,d,h,mat,parent,y=0){
    const top=mat[0],side=mat[1],front=mat[2];
    // Camera stays in the negative-x / positive-z quadrant: only these walls are visible.
    poly([[x,z,y],[x,z+d,y],[x,z+d,y+h],[x,z,y+h]],side,parent);
    poly([[x,z+d,y],[x+w,z+d,y],[x+w,z+d,y+h],[x,z+d,y+h]],front,parent);
    poly([[x,z,y+h],[x+w,z,y+h],[x+w,z+d,y+h],[x,z+d,y+h]],top,parent);
  }
  function building(spec,parent){const {x,z,w,d,h,type,side}=spec;
    const mats=side?['#d5dfd5','#799b91','#adc2b6']:['#f2e9d6','#b69c7e','#d6c3a4'];
    const homeHere=(arrangements[current].homeSide===side && type==='house');
    if(homeHere){mats[0]='#f2b18b';mats[1]='#a5412b';mats[2]='#ce6645';}
    poly([[x+8,z+10,0],[x+w+25,z+10,0],[x+w+25,z+d+30,0],[x+8,z+d+30,0]],'#173e4018',parent);
    box(x,z,w,d,h,mats,parent);
    if(type==='house'){
      // Broad pitched roof, with a real ridge and two differently lit slopes.
      const roof=homeHere?['#eb7b52','#9f432e']:['#52746d','#294d49'];
      poly([[x-5,z-5,h],[x+w/2,z-5,h+29],[x+w/2,z+d+5,h+29],[x-5,z+d+5,h]],roof[0],parent);
      poly([[x+w/2,z-5,h+29],[x+w+5,z-5,h],[x+w+5,z+d+5,h],[x+w/2,z+d+5,h+29]],roof[1],parent);
      poly([[x,z+d,h],[x+w,z+d,h],[x+w/2,z+d,h+29]],mats[2],parent);
      box(x+w*.66,z+d*.2,8,9,20,['#e4d4bb','#9a7d66','#b99e81'],parent,h+12);
      poly([[x+w*.43,z+d+.15,0],[x+w*.64,z+d+.15,0],[x+w*.64,z+d+.15,27],[x+w*.43,z+d+.15,27]],'#21484a',parent);
    }else{
      box(x+4,z+4,w-8,d-8,5,['#e8e6d7','#72928a','#9eb7ad'],parent,h);
      if(type==='office'){box(x+w*.2,z+d*.24,w*.32,d*.4,7,['#94b0a7','#668b80','#7d9f91'],parent,h+5);line([[x+w*.76,z+d*.5,h+5],[x+w*.76,z+d*.5,h+22]],'#315b55',1.2,parent);}
      if(type==='service'){box(x+2,z+d-2,w-4,9,5,['#e69a69','#ae6344','#cc7b51'],parent,24);}
    }
    const rows=Math.max(1,Math.floor((h-15)/22));
    for(let row=0;row<rows;row++){
      for(let col=0;col<Math.max(2,Math.floor(w/18));col++){
        const wx=x+10+col*17,wy=14+row*22;
        if(type==='house'&&row===0&&col>1)continue;
        poly([[wx,z+d+.2,wy],[wx+7,z+d+.2,wy],[wx+7,z+d+.2,wy+10],[wx,z+d+.2,wy+10]],homeHere?'#f8d6a5':'#3b6662',parent);
        line([[wx,z+d+.3,wy+5],[wx+7,z+d+.3,wy+5]],'#c6c7b0',.8,parent);
      }
      for(let col=0;col<Math.max(1,Math.floor(d/20));col++){
        const wz=z+9+col*18,wy=14+row*22;
        poly([[x-.2,wz,wy],[x-.2,wz+7,wy],[x-.2,wz+7,wy+10],[x-.2,wz,wy+10]],homeHere?'#e6ba8b':'#466f69',parent);
      }
    }
    if(type==='service')line([[x+8,z+d+.3,18],[x+w-8,z+d+.3,18]],'#eae4d1',3,parent);
  }
  function tree(x,z,size,parent){
    const [sx,sy]=project(x,z,0);elem('ellipse',{cx:sx+6,cy:sy+3,rx:size*.73,ry:size*.23,fill:'#173e4016'},parent);
    line([[x,z,0],[x,z,size*1.3]],'#6c7f68',2,parent);
    const [cx,cy]=project(x,z,size*1.35);
    const r=size*.65;elem('path',{d:`M ${cx-r} ${cy} Q ${cx-r*1.1} ${cy-r*.8} ${cx} ${cy-r*1.2} Q ${cx+r*1.05} ${cy-r*.7} ${cx+r} ${cy} Q ${cx+r*.8} ${cy+r*.7} ${cx} ${cy+r*.7} Q ${cx-r} ${cy+r*.6} ${cx-r} ${cy}`,fill:'#698b72'},parent);
    elem('path',{d:`M ${cx} ${cy-r*1.2} Q ${cx+r*1.05} ${cy-r*.7} ${cx+r} ${cy} Q ${cx+r*.8} ${cy+r*.7} ${cx} ${cy+r*.7} Q ${cx+r*.3} ${cy-r*.1} ${cx} ${cy-r*1.2}`,fill:'#426b5d'},parent);
  }
  function pin(x,z,h,text,tone){
    const [sx,sy]=project(x,z,h);const g=elem('g',{class:'cl-world-pin'},svg);const width=text.length*6.7+25;
    elem('line',{x1:sx,y1:sy+9,x2:sx,y2:sy+36,stroke:tone,'stroke-width':1},g);
    elem('circle',{cx:sx,cy:sy+36,r:3.2,fill:tone,stroke:'#f3eee1','stroke-width':2},g);
    elem('rect',{x:sx-width/2,y:sy-14,width,height:24,rx:1,fill:tone},g);
    const t=elem('text',{x:sx,y:sy+2.4,'text-anchor':'middle',class:'cl-world-scene-label cl-world-light'},g);t.textContent=text;
    return g;
  }
  const buildings=[
    {x:-342,z:-122,w:47,d:43,h:116,type:'office',side:0},{x:-273,z:-135,w:55,d:43,h:80,type:'office',side:0},
    {x:-198,z:-115,w:58,d:40,h:38,type:'service',side:0},{x:-286,z:-40,w:82,d:66,h:49,type:'house',side:0},
    {x:-352,z:14,w:39,d:52,h:63,type:'office',side:0},{x:-175,z:7,w:47,d:40,h:35,type:'service',side:0},
    {x:-265,z:82,w:51,d:45,h:34,type:'service',side:0},{x:-175,z:82,w:43,d:47,h:69,type:'office',side:0},
    {x:135,z:-132,w:57,d:47,h:40,type:'service',side:1},{x:213,z:-123,w:65,d:43,h:92,type:'office',side:1},
    {x:300,z:-102,w:45,d:47,h:131,type:'office',side:1},{x:158,z:-40,w:82,d:66,h:49,type:'house',side:1},
    {x:284,z:-11,w:49,d:55,h:50,type:'service',side:1},{x:145,z:88,w:61,d:43,h:61,type:'office',side:1},
    {x:238,z:83,w:71,d:47,h:38,type:'service',side:1}
  ];
  const trees=[[-345,99,24],[-318,110,19],[-296,84,21],[-200,-139,18],[-126,-100,22],[-120,52,17],[128,15,18],[335,100,24],[319,128,21],[268,48,18],[119,-90,18],[289,-135,17]];
  function routePath(type){
    const config=arrangements[current];let start,end,color,labelText,lift;
    if(type==='use'){start=[-222,30,11];end=[270,106,45];color=colors.use;labelText='PARTICULAR PURPOSE';lift=95;}
    if(type==='work'){start=[-223,30,12];end=[240,-102,105];color=colors.work;labelText='WORK / STUDY';lift=112;}
    if(type==='ties'){start=config.id==='move'?[200,30,12]:[-222,30,12];end=config.id==='move'?[-244,-15,97]:[201,-14,97];color=colors.ties;labelText=config.id==='move'?'FAMILY':'FAMILY / FRIENDS';lift=130;}
    if(type==='localwork'){start=[-231,27,8];end=[-307,-97,130];color=colors.work;labelText='WORK';lift=25;}
    const a=project(...start),b=project(...end),c=[a[0]+(b[0]-a[0])*.34,a[1]-lift],d=[a[0]+(b[0]-a[0])*.68,b[1]-lift];
    const path=`M ${a} C ${c} ${d} ${b}`;
    const opacity=layer&&layer!==(type==='localwork'?'work':type)?.12:1;
    const g=elem('g',{opacity},svg);elem('path',{d:path,class:'cl-world-route',stroke:'#f1ecdf','stroke-width':8},g);
    const pathEl=elem('path',{d:path,class:'cl-world-route',stroke:color,'stroke-width':2.3,'stroke-dasharray':type==='ties'?'3 7':type==='use'?'1 0':'7 3'},g);
    elem('circle',{cx:a[0],cy:a[1],r:4,fill:color,stroke:'#f5efdf','stroke-width':2},g);elem('circle',{cx:b[0],cy:b[1],r:4,fill:color,stroke:'#f5efdf','stroke-width':2},g);
    const token=elem('circle',{cx:a[0],cy:a[1],r:5,fill:color,stroke:'#f5efe3','stroke-width':2,class:'cl-world-route-token'},g);
    routeTokens.push({token,a,b,c,d,offset:type==='ties'?.3:0});
    const mx=(a[0]+3*c[0]+3*d[0]+b[0])/8,my=(a[1]+3*c[1]+3*d[1]+b[1])/8;
    if(type!=='localwork'){const w=labelText.length*6.5+18;elem('rect',{x:mx-w/2,y:my-22,width:w,height:22,rx:1,fill:'#ede8db'},g);const text=elem('text',{x:mx,y:my-7,'text-anchor':'middle',class:'cl-world-route-label'},g);text.textContent=labelText;}
    return pathEl;
  }
  function render(){
    routeTokens=[];
    svg.replaceChildren();elem('title',{id:uid+'-title'},svg).textContent='Lives do not move together: '+arrangements[current].title;
    elem('desc',{id:uid+'-description'},svg).textContent='Original conceptual spatial model, not a map. Use left and right arrow keys to turn the model; Home resets the view. '+arrangements[current].source;
    const defs=elem('defs',{},svg);const blur=elem('filter',{id:uid+'-shadow',x:'-30%',y:'-50%',width:'160%',height:'200%'},defs);elem('feGaussianBlur',{stdDeviation:14},blur);
    const [scx,scy]=project(15,32,-43);elem('ellipse',{cx:scx,cy:scy+48,rx:395,ry:95,fill:'#315c4a',opacity:'.12',filter:`url(#${uid}-shadow)`},svg);
    // The two plinths are explanatory sides, not terrain or geographical boundaries.
    [-1,1].forEach(side=>{const x=side<0?-370:105;box(x,-157,265,320,22,['#d5d4bd','#789087','#a5b2a0'],svg,-24);
      poly([[x+8,-149,0],[x+257,-149,0],[x+257,155,0],[x+8,155,0]],side<0?'#dfdcc6':'#d9dfcb',svg);
      // Paths and small ground-level planters establish scale without mapping real roads.
      poly([[x+8,49,1],[x+257,49,1],[x+257,70,1],[x+8,70,1]],'#ece8d5',svg);
      poly([[x+155,-148,1],[x+176,-148,1],[x+176,154,1],[x+155,154,1]],'#ece8d5',svg);
      for(let z=-135;z<146;z+=24)line([[x+165,z,1.4],[x+165,z+10,1.4]],'#a4b29e',.8,svg);
      line([[x+11,-143,1],[x+248,-143,1]],'#a9b69f',1,svg);line([[x+11,147,1],[x+248,147,1]],'#a9b69f',1,svg);
    });
    // One precise bridging instrument through an otherwise continuous dividing plane.
    box(-106,42,212,35,9,['#e8d5b5','#8c9b88','#b0bca4'],svg,-1);
    for(let x=-94;x<110;x+=14)line([[x,44,9],[x,75,9]],'#aa9779',.75,svg);
    [43,76].forEach(z=>{line([[-106,z,20],[106,z,20]],'#426d65',2,svg);for(let x=-102;x<=105;x+=26)line([[x,z,8],[x,z,20]],'#426d65',1.4,svg);});
    const depth=(x,z)=>x*Math.sin(yaw)+z*Math.cos(yaw);
    const objects=[...buildings.map(spec=>({depth:depth(spec.x+spec.w/2,spec.z+spec.d/2),draw:()=>building(spec,svg)})),...trees.map(([x,z,s])=>({depth:depth(x,z),draw:()=>tree(x,z,s,svg)}))];
    objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    // Boundary markers stop at the bridge. They are a concept, not a depiction of infrastructure.
    for(let z=-177;z<186;z+=16){if(z>30&&z<90)continue;line([[0,z,-5],[0,z+7,-5]],'#517d74',1.4,svg,{'stroke-opacity':'.62'});}
    const a=project(0,-174,-4),b=project(0,190,-4);const bx=(a[0]+b[0])/2,by=(a[1]+b[1])/2;
    const boundary=elem('text',{x:bx+8,y:by+83,transform:`rotate(${Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI} ${bx+8} ${by+83})`,class:'cl-world-scene-tiny'},svg);boundary.textContent='THE BOUNDARY';
    const placeNames=current===1?['HONG KONG','SHENZHEN']:current===3?['HONG KONG','SHENZHEN']:['ONE SIDE','ACROSS'];
    [-1,1].forEach((side,i)=>{const [lx,ly]=project(side*235,193,-22);const t=elem('text',{x:lx,y:ly,'text-anchor':'middle',class:'cl-world-place-label'},svg);t.textContent=placeNames[i];});
    arrangements[current].routes.forEach(routePath);
    const c=arrangements[current],hx=c.homeSide?199:-245;
    const homeOpacity=layer&&layer!=='home'?.37:1;
    const home=pin(hx,-8,119,'HOME',colors.home);
    home.setAttribute('opacity',homeOpacity);
    const workOpacity=layer&&layer!=='work'?.25:1;
    if(c.id==='work')pin(242,-102,153,'WORK / STUDY',colors.work).setAttribute('opacity',workOpacity);
    if(c.id==='ties')pin(-319,-100,168,'WORK',colors.work).setAttribute('opacity',workOpacity);
    if(layer==='care'){
      const g=elem('g',{},svg);elem('rect',{x:628,y:573,width:295,height:39,rx:1,fill:'#eae6da',stroke:'#3c8b81','stroke-width':1},g);const t=elem('text',{x:775,y:597,'text-anchor':'middle',class:'cl-world-route-label'},g);t.textContent='CARE · NOT SPECIFIED IN THIS EXAMPLE';
    }
    animateTokens();
  }
  function animateTokens(){routeTokens.forEach(({token,a,b,c,d,offset})=>{const t=(time*.000055+offset)%1,mt=1-t;token.setAttribute('cx',mt*mt*mt*a[0]+3*mt*mt*t*c[0]+3*mt*t*t*d[0]+t*t*t*b[0]);token.setAttribute('cy',mt*mt*mt*a[1]+3*mt*mt*t*c[1]+3*mt*t*t*d[1]+t*t*t*b[1]);});}

  function update() {
    const c=arrangements[current];
    select('case-title').textContent=c.title;
    select('case-note').textContent=c.note;
    select('evidence-note').textContent=c.source;
    select('facts').replaceChildren();
    [['Home',c.home],['Work',c.work],['Use',c.use],['Ties',c.ties],['Care','Not specified in this example']].forEach(([key,value])=>{
      const dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=key;dd.textContent=value;select('facts').append(dt,dd);
    });
    selectAll('[data-case]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.case===c.id)));
    updateLayers();render();
  }
  const layerDescriptions={
    home:'The home anchor moves only when the example establishes a change of residence.',
    work:'A work location is drawn only when established. The official pupil data concern school, not workers.',
    care:'Care is not specified in these four examples. This model does not infer a care connection.',
    ties:'Family and friendships can span places without establishing a regular commute.'
  };
  function updateLayers() {
    const c=arrangements[current];
    selectAll('[data-layer]').forEach(button=>{
      const type=button.dataset.layer;
      const known=type==='home'||type==='work'&&(c.id==='work'||c.id==='ties')||type==='ties'&&(c.id==='move'||c.id==='ties');
      const status=known?'shown':type==='work'&&c.id==='move'?'location unstated':'unspecified';
      button.querySelector('.cl-world-layer-status').textContent=status;
      button.setAttribute('aria-pressed',String(layer===type));
      button.setAttribute('aria-label',`${type.charAt(0).toUpperCase()+type.slice(1)}: ${status}. ${layer===type?'Remove highlight':'Highlight layer'}`);
      button.classList.toggle('cl-world-muted',Boolean(layer&&layer!==type));
    });
    select('layer-help').textContent=layer?layerDescriptions[layer]:'Choose a layer to highlight what this example establishes.';
  }
  Object.keys(layerDescriptions).forEach(type=>{
    const button=document.createElement('button');button.type='button';button.className='cl-world-layer';
    button.dataset.layer=type;button.style.setProperty('--cl-world-tone',colors[type]);button.setAttribute('aria-pressed','false');
    button.innerHTML=`<span class="cl-world-layer-dot" aria-hidden="true"></span><span class="cl-world-layer-name">${type}</span><span class="cl-world-layer-status"></span>`;
    listen(button,'click',()=>{layer=layer===type?null:type;updateLayers();render();});
    select('layers').append(button);
  });
  function chooseCase(id) {
    const next=arrangements.findIndex(c=>c.id===id);
    if(next<0)return;current=next;layer=null;update();
  }
  selectAll('[data-case]').forEach(button=>listen(button,'click',()=>chooseCase(button.dataset.case)));
  listen(container.querySelector('.cl-world-arrangements'),'keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?3:(current+(event.key==='ArrowRight'?1:3))%4;
    chooseCase(arrangements[next].id);
    container.querySelector(`[data-case="${arrangements[next].id}"]`).focus();
  });

  function stopFrame() {if(frameId){cancelAnimationFrame(frameId);frameId=0;}lastTime=0;}
  function schedule() {
    if(destroyed || isPaused() || document.hidden || !inView){stopFrame();return;}
    if(!frameId)frameId=requestAnimationFrame(frame);
  }
  function motionUI() {
    const button=select('motion');
    button.disabled=globalPaused;
    button.textContent=globalPaused?'Motion off':localPaused?'Resume motion':'Pause motion';
    button.setAttribute('aria-pressed',String(isPaused()));
    schedule();
  }
  function pause(value=true){globalPaused=Boolean(value);motionUI();}
  listen(select('motion'),'click',()=>{localPaused=!localPaused;motionUI();});
  listen(document,'crossing:motion',event=>{if(typeof event.detail?.paused==='boolean')pause(event.detail.paused);});
  listen(window,'crossing:motion',event=>{if(event.target===window&&typeof event.detail?.paused==='boolean')pause(event.detail.paused);});
  listen(motionQuery,'change',event=>pause(event.matches));
  listen(document,'visibilitychange',schedule);
  const observer = typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
    inView=entries.some(entry=>entry.isIntersecting);schedule();
  },{rootMargin:'80px',threshold:0});
  observer?.observe(container);

  // Pointer capture follows horizontal drag; vertical touch remains native scrolling.
  listen(svg,'pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    dragging=true;horizontalDrag=false;startX=lastX=event.clientX;startY=event.clientY;
  });
  listen(svg,'pointermove',event=>{
    if(!dragging)return;
    const dx=event.clientX-startX,dy=event.clientY-startY;
    if(!horizontalDrag){
      if(Math.abs(dx)<6)return;
      if(event.pointerType!=='mouse'&&Math.abs(dy)>Math.abs(dx)){dragging=false;return;}
      horizontalDrag=true;svg.setPointerCapture?.(event.pointerId);
    }
    targetYaw=Math.max(-.97,Math.min(-.24,targetYaw+(event.clientX-lastX)*.0025));lastX=event.clientX;
    // Input remains immediate even while ambient route movement is paused.
    yaw=targetYaw;render();
  });
  const endDrag=()=>{dragging=false;horizontalDrag=false;};
  listen(svg,'pointerup',endDrag);listen(svg,'pointercancel',endDrag);listen(svg,'lostpointercapture',endDrag);
  listen(svg,'keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;
    event.preventDefault();
    targetYaw=event.key==='Home'?-.62:Math.max(-.97,Math.min(-.24,targetYaw+(event.key==='ArrowRight'?.08:-.08)));
    yaw=targetYaw;render();
  });
  listen(select('reset'),'click',()=>{targetYaw=yaw=-.62;render();});

  function frame(now) {
    frameId=0;
    if(destroyed || isPaused() || document.hidden || !inView){lastTime=0;return;}
    const dt=lastTime?Math.min(50,now-lastTime):0;lastTime=now;time+=dt;
    if(now-lastPaint>=1000/30){lastPaint=now;animateTokens();}
    schedule();
  }
  update();motionUI();
  const api={
    pause,
    setCase:chooseCase,
    setView(value){if(!Number.isFinite(value))return;targetYaw=yaw=Math.max(-.97,Math.min(-.24,value));render();},
    getState(){return{arrangement:arrangements[current].id,layer,paused:isPaused(),yaw,renderer:'projected SVG'};},
    destroy(){destroyed=true;stopFrame();observer?.disconnect();cleanups.forEach(cleanup=>cleanup());instances.delete(container);container.replaceChildren();container.classList.remove('cl-world');}
  };
  instances.set(container,api);
  return api;
}
