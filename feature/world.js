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
    <div class="cl-world-arrangements" role="group" aria-label="Choose an illustrative life arrangement"></div>
    <figure class="cl-world-figure">
      <p class="cl-world-status">Conceptual model · not a map</p>
      <div class="cl-world-viewport" data-world="viewport" id="${uid}-viewport">
        <svg class="cl-world-scene" data-world="scene" viewBox="250 108 1080 584" role="img" tabindex="0" aria-labelledby="${uid}-title ${uid}-description" aria-keyshortcuts="ArrowLeft ArrowRight Home"></svg>
        <div class="cl-world-placebar" aria-label="Illustrative sides of the boundary"><span data-world="place-left">One side</span><span class="cl-world-boundary-label">The boundary</span><span data-world="place-right">Across</span></div>
      </div>
      <figcaption class="cl-world-reading">
        <div class="cl-world-case" aria-live="polite" aria-atomic="true"><p class="cl-world-case-title" data-world="case-title"></p><p data-world="case-note"></p></div>
        <p class="cl-world-path-key">Paths connect the parts of life stated in each example. They do not trace measured journeys.</p>
      </figcaption>
    </figure>
    <div class="cl-world-toolbar">
      <div class="cl-world-layers" data-world="layers" role="group" aria-label="Highlight an established part of life"></div>
      <div class="cl-world-view">
        <div class="cl-world-zoom" role="group" aria-label="Model magnification">
          <button type="button" data-world="zoom-out" aria-label="Zoom out"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12"/></svg></button>
          <output data-world="zoom-level" aria-label="Model magnification">100%</output>
          <button type="button" data-world="zoom-in" aria-label="Zoom in"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4v12"/></svg></button>
        </div>
        <button class="cl-world-enlarge" type="button" data-world="enlarge" aria-controls="${uid}-viewport"><span>Enlarge model</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4M13 3h4v4M3 13v4h4M17 13v4h-4"/></svg></button>
        <div class="cl-world-camera">
          <button type="button" data-world="reset"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.5 7M4 4v6h6"/></svg><span>Reset view</span></button>
          <button type="button" data-world="motion">Pause motion</button>
        </div>
      </div>
    </div>
    <p class="cl-world-layer-help" data-world="layer-help" hidden></p>
    <p class="cl-world-hint">Drag or use ← and → to turn. + and − zoom; Home resets the view.</p>
    <details class="cl-world-evidence">
      <summary>What the example establishes <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7l6 6 6-6"/></svg></summary>
      <div class="cl-world-evidence-content"><div><p data-world="evidence-note"></p><p class="cl-world-evidence-limit">The four arrangements can overlap. They are not population categories. The architecture and paths are explanatory illustration; moving markers do not measure speed, frequency or journey counts.</p><a href="${new URL('../research-data.json',import.meta.url).href}">View the underlying arrangement descriptions</a></div><dl data-world="facts"></dl></div>
    </details>`;

  const NS = 'http://www.w3.org/2000/svg';
  const select = (key) => container.querySelector(`[data-world="${key}"]`);
  const selectAll = (selector) => [...container.querySelectorAll(selector)];
  const svg = select('scene');
  const viewport = select('viewport');
  const colors = {home:'#c9512d',work:'#173e40',use:'#3c8b81',ties:'#b4774e'};
  const cleanups = [];
  const listen = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    cleanups.push(() => target.removeEventListener(name, handler, options));
  };
  const arrangements=[
    {id:'use',label:'Cross to use',title:'Cross for a particular purpose',short:'A visit can cross. A home can stay.',note:'A repair, meal or leisure trip can cross a border while other parts of life stay put.',source:'A repair, meal or leisure trip can cross a border while other parts of life stay put. Illustrative arrangements overlap; this is not a population classification.',home:'One side',work:'Not specified',use:'Across the border',ties:'Not specified',homeSide:0,routes:['use']},
    {id:'move',label:'Move home',title:'Move home; retain connections',short:'Home moves. Connections remain.',note:'The guide who moved north described lower earnings alongside lower living costs and work she preferred.',source:'One participant described lower earnings alongside lower living costs and preferred work. It is an individual account, not a measured general benefit.',home:'Shenzhen after Hong Kong',work:'Reported guiding work; location not specified',use:'Not specified',ties:'Family in Hong Kong',homeSide:1,routes:['ties']},
    {id:'work',label:'Work or study across',title:'Separate residence and work or study',short:'Home on one side. Work or study on the other.',note:'Official records count 16,139 daily cross-boundary pupils in 2024/25. Their Mainland residence is not necessarily Shenzhen; this is not a count of workers.',source:'Official cross-boundary pupil data illustrate separation of home and school. Mainland residence is not necessarily Shenzhen; the pupil count does not measure workers.',home:'One side of a boundary',work:'Across the boundary',use:'Not specified',ties:'Not specified',homeSide:0,routes:['work']},
    {id:'ties',label:'Keep ties',title:'Stay based in Hong Kong; keep ties elsewhere',short:'A base here. Relationships elsewhere.',note:'The professional with Shenzhen ties works and rents in Hong Kong, while family, friends and many activities remain in Shenzhen.',source:'The source account also mentions Shenzhen property. It does not establish a regular commute. Connections can span places without moving home and work.',home:'Rents in Hong Kong',work:'Hong Kong',use:'Not specified',ties:'Shenzhen family and friends',homeSide:0,routes:['ties','localwork']}
  ];

  // One authored description per selector; no decorative route glyphs.
  arrangements.forEach((arrangement,index)=>{
    const button=document.createElement('button');button.type='button';button.dataset.case=arrangement.id;
    button.setAttribute('aria-pressed',String(index===0));
    button.style.setProperty('--case-tone',colors[arrangement.id==='move'?'home':arrangement.id]);
    const name=document.createElement('span');name.className='cl-world-case-name';name.textContent=arrangement.label;
    const short=document.createElement('span');short.className='cl-world-case-short';short.textContent=arrangement.short;
    button.append(name,short);container.querySelector('.cl-world-arrangements').append(button);
  });

  let current=0, layer=null, yaw=-.62, targetYaw=-.62, tilt=.54;
  let zoom=1, expanded=false, zoomBeforeExpand=1, hasArrived=false;
  let dragging=false, startX=0, startY=0, lastX=0, horizontalDrag=false;
  let traversal=1, traversing=false, lastTime=0, frameId=0, destroyed=false;
  let routeTokens=[];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let globalPaused = document.documentElement.dataset.motion === 'off' || motionQuery.matches;
  let localPaused = false;
  let inView = typeof IntersectionObserver === 'undefined';
  const isPaused = () => globalPaused || localPaused || motionQuery.matches;
  function union(boxes) {
    const valid=boxes.filter(b=>b&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&b.width>0&&b.height>0);
    if(!valid.length)return null;
    const x=Math.min(...valid.map(b=>b.x)),y=Math.min(...valid.map(b=>b.y));
    return{x,y,width:Math.max(...valid.map(b=>b.x+b.width))-x,height:Math.max(...valid.map(b=>b.y+b.height))-y};
  }
  function boxOf(node){try{return node.getBBox();}catch{return null;}}
  // Fit the complete illustration first, then let magnification approach the
  // active relationship. Pins and full route curves always retain a safe frame.
  // Place labels live in a non-scaling HTML strip, independent of this camera.
  function viewBox() {
    const bounds=viewport.getBoundingClientRect();
    const screenWidth=bounds.width||container.clientWidth||940;
    const screenHeight=bounds.height||screenWidth/(1080/584);
    const ratio=screenWidth/screenHeight;
    const whole=union([...svg.children].filter(n=>!['defs','title','desc'].includes(n.tagName.toLowerCase())).map(boxOf))||{x:330,y:190,width:900,height:460};
    const active=union([...svg.querySelectorAll('.cl-world-critical')].map(boxOf))||whole;
    const paddingX=Math.min(24,screenWidth*.07),paddingTop=20,paddingBottom=56;
    const availableX=Math.max(.3,1-paddingX*2/screenWidth);
    const availableY=Math.max(.3,1-(paddingTop+paddingBottom)/screenHeight);
    const baseWidth=Math.max((whole.width+30)/availableX,(whole.height+30)*ratio/availableY);
    const safeWidth=Math.max((active.width+20)/availableX,(active.height+20)*ratio/availableY);
    const width=Math.max(baseWidth/zoom,safeWidth),height=width/ratio;
    const blend=Math.max(0,Math.min(1,(zoom-1)/.3));
    let centerX=whole.x+whole.width/2+(active.x+active.width/2-whole.x-whole.width/2)*blend;
    let centerY=whole.y+whole.height/2+(active.y+active.height/2-whole.y-whole.height/2)*blend;
    const px=width*paddingX/screenWidth,pt=height*paddingTop/screenHeight,pb=height*paddingBottom/screenHeight;
    centerX=Math.max(active.x+active.width+px+10-width/2,Math.min(active.x-px-10+width/2,centerX));
    centerY=Math.max(active.y+active.height+pb+10-height/2,Math.min(active.y-pt-10+height/2,centerY+(pb-pt)/2));
    svg.setAttribute('viewBox',`${centerX-width/2} ${centerY-height/2} ${width} ${height}`);
  }
  function zoomUI() {
    select('zoom-level').textContent=`${Math.round(zoom*100)}%`;
    select('zoom-out').disabled=zoom<=1;
    select('zoom-in').disabled=zoom>=1.3;
    select('enlarge').querySelector('span').textContent=expanded?'Standard view':'Enlarge model';
    container.classList.toggle('cl-world-expanded',expanded);
    viewBox();
  }
  function settleTraversal(){traversal=1;traversing=false;stopFrame();animateTokens();}
  function setZoom(value) {
    if(!Number.isFinite(value))return;
    settleTraversal();zoom=Math.round(Math.max(1,Math.min(1.3,value))*100)/100;zoomUI();
  }
  function enlarge(value=!expanded) {
    settleTraversal();
    if(value&&!expanded){zoomBeforeExpand=zoom;zoom=Math.max(1.3,zoom);}
    if(!value&&expanded)zoom=zoomBeforeExpand;
    expanded=Boolean(value);zoomUI();
  }
  // Kept for existing callers. Entering a chapter no longer moves its camera.
  function arrive() {
    if(destroyed||hasArrived)return false;
    hasArrived=true;
    return false;
  }
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
    const [sx,sy]=project(x,z,h);const g=elem('g',{class:'cl-world-pin cl-world-critical'},svg);const width=text.length*6.7+25;
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
    const g=elem('g',{opacity,class:'cl-world-critical'},svg);
    const meanings={use:'A particular-purpose visit across the boundary.',work:'Home and work or study on different sides.',ties:config.id==='move'?'Family ties in Hong Kong continue after a move to Shenzhen.':'Family and friends in Shenzhen while home and work remain in Hong Kong.',localwork:'Home and work remain on the Hong Kong side.'};
    elem('title',{},g).textContent=meanings[type];
    elem('path',{d:path,class:'cl-world-route',stroke:'#f1ecdf','stroke-width':8},g);
    const pathEl=elem('path',{d:path,class:'cl-world-route',stroke:color,'stroke-width':2.3,'stroke-dasharray':type==='ties'?'3 7':type==='use'?'1 0':'7 3'},g);
    elem('circle',{cx:a[0],cy:a[1],r:4,fill:color,stroke:'#f5efdf','stroke-width':2},g);elem('circle',{cx:b[0],cy:b[1],r:4,fill:color,stroke:'#f5efdf','stroke-width':2},g);
    const token=elem('circle',{cx:a[0],cy:a[1],r:5,fill:color,stroke:'#f5efe3','stroke-width':2,class:'cl-world-route-token'},g);
    routeTokens.push({token,a,b,c,d});
    const mx=(a[0]+3*c[0]+3*d[0]+b[0])/8,my=(a[1]+3*c[1]+3*d[1]+b[1])/8;
    if(type!=='localwork'){const w=labelText.length*6.5+18;elem('rect',{x:mx-w/2,y:my-22,width:w,height:22,rx:1,fill:'#ede8db'},g);const text=elem('text',{x:mx,y:my-7,'text-anchor':'middle',class:'cl-world-route-label'},g);text.textContent=labelText;}
    return pathEl;
  }
  function render(){
    routeTokens=[];
    svg.replaceChildren();elem('title',{id:uid+'-title'},svg).textContent='Lives do not move together: '+arrangements[current].title;
    elem('desc',{id:uid+'-description'},svg).textContent='Original conceptual spatial model, not a map. Use left and right arrow keys to turn the model, plus and minus to zoom, and Home to reset the view. '+arrangements[current].source;
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
    const placeNames=current===1||current===3?['Hong Kong','Shenzhen']:['One side','Across'];
    select('place-left').textContent=placeNames[0];
    select('place-right').textContent=placeNames[1];
    arrangements[current].routes.forEach(routePath);
    const c=arrangements[current],hx=c.homeSide?199:-245;
    const homeOpacity=layer&&layer!=='home'?.37:1;
    const home=pin(hx,-8,119,'HOME',colors.home);
    home.setAttribute('opacity',homeOpacity);
    const workOpacity=layer&&layer!=='work'?.25:1;
    if(c.id==='work')pin(242,-102,153,'WORK / STUDY',colors.work).setAttribute('opacity',workOpacity);
    if(c.id==='ties')pin(-319,-100,168,'WORK',colors.work).setAttribute('opacity',workOpacity);
    viewBox();
    animateTokens();
  }
  function animateTokens(){routeTokens.forEach(({token,a,b,c,d})=>{const t=traversal,mt=1-t;token.setAttribute('visibility',traversing&&t<1?'visible':'hidden');token.setAttribute('cx',mt*mt*mt*a[0]+3*mt*mt*t*c[0]+3*mt*t*t*d[0]+t*t*t*b[0]);token.setAttribute('cy',mt*mt*mt*a[1]+3*mt*mt*t*c[1]+3*mt*t*t*d[1]+t*t*t*b[1]);});}

  function update() {
    const c=arrangements[current];
    select('case-title').textContent=c.title;
    select('case-note').textContent=c.note;
    select('evidence-note').textContent=c.source;
    select('facts').replaceChildren();
    [['Home',c.home],['Work / study',c.work],['Use',c.use],['Ties',c.ties]].forEach(([key,value])=>{
      const dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=key;dd.textContent=value==='Not specified'?'Not established here':value;select('facts').append(dt,dd);
    });
    selectAll('[data-case]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.case===c.id)));
    updateLayers();render();
  }
  const layerDescriptions={
    home:'The home anchor moves only when the example establishes a change of residence.',
    work:'A work location is drawn only when established. The official pupil data concern school, not workers.',
    use:'A particular purpose—such as a repair, meal or leisure visit—can cross the border without a change of home.',
    ties:'Family and friendships can span places without establishing a regular commute.'
  };
  const layerNames={home:'Home',work:'Work / study',use:'Use',ties:'Ties'};
  function updateLayers() {
    const c=arrangements[current];
    selectAll('[data-layer]').forEach(button=>{
      const type=button.dataset.layer;
      const known=type==='home'||type==='work'&&(c.id==='work'||c.id==='ties')||type==='use'&&c.id==='use'||type==='ties'&&(c.id==='move'||c.id==='ties');
      const status=known?'shown':type==='work'&&c.id==='move'?'location unstated':'not established here';
      button.querySelector('.cl-world-layer-status').textContent=status;
      button.setAttribute('aria-pressed',String(layer===type));
      button.setAttribute('aria-label',`${layerNames[type]}: ${status}. ${layer===type?'Remove highlight':'Highlight layer'}`);
      button.classList.toggle('cl-world-muted',Boolean(layer&&layer!==type));
    });
    select('layer-help').hidden=!layer;
    select('layer-help').textContent=layer?layerDescriptions[layer]:'';
  }
  Object.keys(layerDescriptions).forEach(type=>{
    const button=document.createElement('button');button.type='button';button.className='cl-world-layer';
    button.dataset.layer=type;button.style.setProperty('--cl-world-tone',colors[type]);button.setAttribute('aria-pressed','false');
    button.innerHTML=`<span class="cl-world-layer-dot" aria-hidden="true"></span><span class="cl-world-layer-name">${layerNames[type]}</span><span class="cl-world-layer-status"></span>`;
    listen(button,'click',()=>{settleTraversal();layer=layer===type?null:type;updateLayers();render();});
    select('layers').append(button);
  });
  function chooseCase(id) {
    const next=arrangements.findIndex(c=>c.id===id);
    if(next<0)return;settleTraversal();current=next;layer=null;update();beginTraversal();
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
  function beginTraversal() {
    if(destroyed||isPaused()||document.hidden||!inView){settleTraversal();return;}
    traversal=0;traversing=true;lastTime=0;animateTokens();schedule();
  }
  function schedule() {
    if(destroyed || isPaused() || document.hidden || !inView){settleTraversal();return;}
    if(traversing&&!frameId)frameId=requestAnimationFrame(frame);
  }
  function motionUI() {
    const button=select('motion');
    button.disabled=globalPaused||motionQuery.matches;
    button.textContent=button.disabled?'Motion off':localPaused?'Resume motion':'Pause motion';
    if(isPaused())settleTraversal();
    schedule();
  }
  function pause(value=true){globalPaused=Boolean(value);motionUI();}
  listen(select('motion'),'click',()=>{localPaused=!localPaused;motionUI();});
  listen(document,'crossing:motion',event=>{if(typeof event.detail?.paused==='boolean')pause(event.detail.paused);});
  listen(window,'crossing:motion',event=>{if(event.target===window&&typeof event.detail?.paused==='boolean')pause(event.detail.paused);});
  listen(motionQuery,'change',()=>{globalPaused=document.documentElement.dataset.motion==='off';motionUI();});
  listen(document,'visibilitychange',()=>{if(document.hidden)settleTraversal();schedule();});
  listen(document,'crossing:arrive',event=>{
    const target=event.detail?.target;
    if(!target||target===container.id||['world','arrangements'].includes(target))arrive();
  });
  const observer = typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
    inView=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.25);
    schedule();
  },{threshold:[0,.25]});
  observer?.observe(viewport);
  const resizeObserver=typeof ResizeObserver==='undefined'?null:new ResizeObserver(viewBox);
  resizeObserver?.observe(viewport);
  if(!resizeObserver)listen(window,'resize',viewBox);

  listen(select('zoom-in'),'click',()=>setZoom(zoom+.15));
  listen(select('zoom-out'),'click',()=>setZoom(zoom-.15));
  listen(select('enlarge'),'click',()=>enlarge());
  listen(container,'keydown',event=>{
    if(event.key==='Escape'&&expanded){event.preventDefault();enlarge(false);select('enlarge').focus();}
  });
  function resetView(){settleTraversal();targetYaw=yaw=-.62;zoom=zoomBeforeExpand=1;expanded=false;zoomUI();render();}

  // Pointer capture follows horizontal drag; vertical touch remains native scrolling.
  listen(svg,'pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    settleTraversal();
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
    // Input remains immediate even while route movement is paused.
    yaw=targetYaw;render();
  });
  const endDrag=()=>{dragging=false;horizontalDrag=false;};
  listen(svg,'pointerup',endDrag);listen(svg,'pointercancel',endDrag);listen(svg,'lostpointercapture',endDrag);
  listen(svg,'keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    if(!['ArrowLeft','ArrowRight','Home','+','=','-','_'].includes(event.key))return;
    event.preventDefault();
    settleTraversal();
    if(event.key==='Home'){resetView();return;}
    if(['+','=','-','_'].includes(event.key)){setZoom(zoom+(['+','='].includes(event.key)?.15:-.15));return;}
    targetYaw=Math.max(-.97,Math.min(-.24,targetYaw+(event.key==='ArrowRight'?.08:-.08)));
    yaw=targetYaw;render();
  });
  listen(select('reset'),'click',resetView);

  function frame(now) {
    frameId=0;
    if(destroyed || isPaused() || document.hidden || !inView){settleTraversal();return;}
    const dt=lastTime?Math.min(50,now-lastTime):0;lastTime=now;
    traversal=Math.min(1,traversal+dt/650);
    if(traversal===1){settleTraversal();return;}
    animateTokens();
    schedule();
  }
  zoomUI();update();motionUI();
  document.fonts?.ready.then(()=>{if(!destroyed)viewBox();});
  const api={
    pause,arrive,setZoom,enlarge,
    setCase:chooseCase,
    setView(value){if(!Number.isFinite(value))return;settleTraversal();targetYaw=yaw=Math.max(-.97,Math.min(-.24,value));render();},
    getState(){return{arrangement:arrangements[current].id,layer,paused:isPaused(),yaw,zoom,expanded,arrival:hasArrived?'complete':'ready',traversal:traversing?'playing':'settled',renderer:'projected SVG'};},
    destroy(){destroyed=true;settleTraversal();observer?.disconnect();resizeObserver?.disconnect();cleanups.forEach(cleanup=>cleanup());instances.delete(container);container.replaceChildren();container.classList.remove('cl-world','cl-world-expanded');}
  };
  instances.set(container,api);
  return api;
}
