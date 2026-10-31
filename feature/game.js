/* An original conceptual miniature. Every demand and game rule is invented. */
const SVG_NS = 'http://www.w3.org/2000/svg';
let gameInstance = 0;
const COLORS = { home: '#c9512d', work: '#173e40', use: '#3c8b81', ties: '#98603b' };
const STOPS = [
  { id: 'work', name: 'Work / study', queue: 3, point: [207, -81, 9], pin: [207, -102, 120] },
  { id: 'use', name: 'Use', queue: 2, point: [286, 22, 9], pin: [293, 8, 87] },
  { id: 'ties', name: 'Ties', queue: 2, point: [171, 135, 9], pin: [170, 123, 73] }
];
const HOME = [-228, 25, 9];
const INCOMING = [ ['work', 'use'], ['work', 'ties'], ['use', 'ties'], ['work', 'use'], ['work', 'ties'], [] ];
const project = (x, z, y = 0) => [380 + (x * .825 + z * .565) * .92, 258 + (-x * .565 + z * .825) * .52 - y * .92];
const xy = (point) => project(...point).map(n => +n.toFixed(2));

export function initGame(container) {
  if (!container) return { pause() {}, destroy() {} };
  const uid = `cl-game-${++gameInstance}`;
  container.classList.add('cl-game');
  container.innerHTML = `<div class="cl-game-head"><span>Illustrative game</span><span class="cl-game-budget">2 routes · 2 seats per route</span></div>
    <div class="cl-game-map"><svg class="cl-game-city" viewBox="0 0 760 440" role="img" aria-label="An invented miniature city, with home connected by a bridge to work or study, particular uses and personal ties. This is not a geographic map."></svg><div class="cl-game-stops"></div></div>
    <div class="cl-game-play"><p class="cl-game-instruction" id="${uid}-instruction">Tap a destination to connect it to Home.</p>
      <div class="cl-game-actions"><button class="cl-game-round" type="button">Run a round</button><button class="cl-game-reset" type="button">Reset</button></div>
      <div class="cl-game-ledger"><span class="cl-game-round-count">Round 0 of 6</span><span class="cl-game-result">0 journeys made</span><span class="cl-game-route-count">0 of 2 routes used</span></div>
      <p class="cl-game-status" role="status" aria-live="polite" aria-atomic="true">Choose two connections. You can change them between rounds.</p>
    </div>
    <section class="cl-game-end" aria-labelledby="${uid}-end-title" hidden>
      <h4 class="cl-game-end-title" id="${uid}-end-title" tabindex="-1" aria-describedby="${uid}-end-tally">Six rounds complete</h4>
      <p class="cl-game-end-tally" id="${uid}-end-tally"></p>
      <p class="cl-game-end-lead">What did the rules make easy?</p>
      <ul class="cl-game-left-out">
        <li><strong>Home stayed fixed.</strong><span>The life arrangements include moving home while keeping connections elsewhere. <a href="#arrangements">Return to the model</a></span></li>
        <li><strong>Routes changed for free.</strong><span>The game assigns no time, money or commitment to changing a connection. <a href="#ties">Read about continuing ties</a></span></li>
        <li><strong>Every destination was available.</strong><span>Only routes and seats limited access here. Finding information and suitable services never entered the rules. <a href="#access">Read about everyday services</a></span></li>
      </ul>
      <button class="cl-game-again" type="button">Play again</button>
    </section>
    <p class="cl-game-note">Invented demand and rules, not research data. Each round carries up to two waiting journeys on each route. New needs arrive between rounds. Connections can be changed freely; this miniature does not model real travel or switching costs.</p>`;
  const svg = container.querySelector('svg');
  const stopsEl = container.querySelector('.cl-game-stops');
  const instruction = container.querySelector('.cl-game-instruction');
  const status = container.querySelector('.cl-game-status');
  const roundButton = container.querySelector('.cl-game-round');
  const resetButton = container.querySelector('.cl-game-reset');
  const endPanel = container.querySelector('.cl-game-end');
  const endTitle = container.querySelector('.cl-game-end-title');
  const endTally = container.querySelector('.cl-game-end-tally');
  const againButton = container.querySelector('.cl-game-again');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let globalPaused = document.documentElement.dataset.motion === 'off';
  let localVisible = typeof IntersectionObserver === 'undefined', destroyed = false, raf = 0, startTime = null, animation = false;
  let round = 0, journeys = 0, routes = new Set(), queues = {}, tokens = [];
  const listeners = [];
  const on = (target, name, callback) => { target.addEventListener(name, callback); listeners.push(() => target.removeEventListener(name, callback)); };
  const add = (tag, attrs = {}, parent = svg) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, val]) => node.setAttribute(key, val));
    parent.appendChild(node); return node;
  };
  const poly = (points, fill, parent = svg, attrs = {}) => add('polygon', { points: points.map(p => xy(p).join(',')).join(' '), fill, ...attrs }, parent);
  const line = (points, stroke, width = 1, parent = svg, attrs = {}) => add('polyline', { points: points.map(p => xy(p).join(',')).join(' '), fill: 'none', stroke, 'stroke-width': width, ...attrs }, parent);
  function box(x, z, w, d, h, mat, parent = svg, y = 0) {
    poly([[x,z,y],[x,z+d,y],[x,z+d,y+h],[x,z,y+h]], mat[1], parent);
    poly([[x,z+d,y],[x+w,z+d,y],[x+w,z+d,y+h],[x,z+d,y+h]], mat[2], parent);
    poly([[x,z,y+h],[x+w,z,y+h],[x+w,z+d,y+h],[x,z+d,y+h]], mat[0], parent);
  }
  function building(b) {
    const { x,z,w,d,h,type } = b;
    const home = type === 'home';
    const mat = home ? ['#e49b72','#9f402b','#c75b3c'] : type === 'use' ? ['#dae3cf','#658e80','#9bb4a1'] : ['#e7dec7','#9da98f','#bec4aa'];
    poly([[x+6,z+8,1],[x+w+17,z+8,1],[x+w+17,z+d+21,1],[x+6,z+d+21,1]], '#173e4015');
    box(x,z,w,d,h,mat);
    if (home || type === 'ties') {
      poly([[x-4,z-4,h],[x+w/2,z-4,h+24],[x+w/2,z+d+4,h+24],[x-4,z+d+4,h]], home?'#e8885d':'#638577');
      poly([[x+w/2,z-4,h+24],[x+w+4,z-4,h],[x+w+4,z+d+4,h],[x+w/2,z+d+4,h+24]], home?'#a4442e':'#315c54');
      poly([[x,z+d,h],[x+w,z+d,h],[x+w/2,z+d,h+24]],mat[2]);
      box(x+w*.67,z+8,7,9,18,['#d5b899','#8e725c','#b39170'],svg,h+9);
    } else {
      box(x+4,z+4,w-8,d-8,5,['#eef0d9','#7b9a89','#adc3ac'],svg,h);
      if(type==='work') {
        box(x+10,z+12,w*.45,d*.42,7,['#96b3a5','#487b6e','#739789'],svg,h+5);
        line([[x+w-12,z+12,h+5],[x+w-12,z+12,h+27]],'#496c62',1.4);
      }
      if(type==='use') {
        box(x-2,z+d-2,w+4,11,5,['#6c9c88','#305f55','#427c6c'],svg,25);
        // A general-purpose storefront, rather than a medical symbol.
        line([[x+9,z+d+.4,39],[x+w-9,z+d+.4,39]],'#f1eee0',3);
      }
    }
    for(let level=0;level<Math.max(1,Math.floor((h-12)/21));level++) {
      for(let column=0;column<Math.max(2,Math.floor((w-10)/16));column++) {
        const wx=x+9+column*16,wy=11+level*21;
        poly([[wx,z+d+.2,wy],[wx+6,z+d+.2,wy],[wx+6,z+d+.2,wy+9],[wx,z+d+.2,wy+9]],home?'#f6d4a3':'#3f6a61');
      }
      for(let column=0;column<Math.max(1,Math.floor((d-8)/18));column++) {
        const wz=z+8+column*18,wy=11+level*21;
        poly([[x-.2,wz,wy],[x-.2,wz+6,wy],[x-.2,wz+6,wy+9],[x-.2,wz,wy+9]],home?'#e8b88c':'#517b6a');
      }
    }
    if(home || type==='ties') poly([[x+w*.65,z+d+.4,0],[x+w*.82,z+d+.4,0],[x+w*.82,z+d+.4,24],[x+w*.65,z+d+.4,24]],'#244a47');
  }
  function tree(x,z,s) {
    const [a,b]=xy([x,z]);
    add('ellipse',{cx:a+5,cy:b+4,rx:s*.65,ry:s*.2,fill:'#173e4015'});
    line([[x,z,0],[x,z,s*1.3]],'#6a7a5b',2);
    const [cx,cy]=xy([x,z,s*1.3]);
    add('path',{d:`M${cx-s*.65},${cy} L${cx-s*.55},${cy-s*.7} L${cx},${cy-s} L${cx+s*.64},${cy-s*.55} L${cx+s*.7},${cy+s*.18} L${cx},${cy+s*.55} Z`,fill:'#799779'});
    add('path',{d:`M${cx},${cy-s} L${cx+s*.64},${cy-s*.55} L${cx+s*.7},${cy+s*.18} L${cx},${cy+s*.55} L${cx+s*.14},${cy-s*.24} Z`,fill:'#4e7660'});
  }
  function drawCity() {
    svg.replaceChildren(); tokens=[];
    const defs=add('defs');
    const f=add('filter',{id:'cl-game-shadow',x:'-20%',y:'-50%',width:'140%',height:'200%'},defs);
    add('feGaussianBlur',{stdDeviation:10},f);
    add('ellipse',{cx:390,cy:334,rx:290,ry:58,fill:'#173e40',opacity:'.1',filter:'url(#cl-game-shadow)'});
    // The canal and platforms are conceptual geometry, not a representation of a place.
    poly([[-95,-180,-19],[95,-180,-19],[95,188,-19],[-95,188,-19]],'#a2c2b6');
    for(let z=-155;z<173;z+=37) line([[-58,z,-18],[22,z,-18]],'#d1e0ce',1.3);
    [-1,1].forEach(side=> {
      const x=side<0?-355:95;
      box(x,-157,260,319,18,['#d8dcc6','#809785','#aab79d'],svg,-19);
      poly([[x+5,-152,0],[x+255,-152,0],[x+255,157,0],[x+5,157,0]],side<0?'#e0dcc4':'#d9ddc6');
      poly([[x+4,52,1],[x+255,52,1],[x+255,78,1],[x+4,78,1]],'#f1ead6');
      poly([[x+163,-152,1],[x+186,-152,1],[x+186,157,1],[x+163,157,1]],'#f1ead6');
      for(let z=-136;z<151;z+=25) line([[x+174,z,1.1],[x+174,z+9,1.1]],'#b4b9a1',1);
    });
    // Piers, deck, sleepers and parapets make a physical crossing, rather than a line.
    [-65,55].forEach(x=>box(x,57,13,23,29,['#8a9b86','#668574','#7b9381'],svg,-26));
    box(-96,52,192,27,9,['#e7d9b9','#99a487','#b3b99b'],svg,1);
    for(let x=-87;x<96;x+=12) line([[x,53,10.1],[x,78,10.1]],'#beac8a',.7);
    [52,79].forEach(z=> {
      line([[-96,z,21],[96,z,21]],'#3e6c60',1.7);
      for(let x=-92;x<97;x+=23) line([[x,z,10],[x,z,21]],'#3e6c60',1.2);
    });
    const buildings=[
      {x:-329,z:-128,w:42,d:39,h:108,type:'office'}, {x:-260,z:-131,w:52,d:39,h:73,type:'office'},
      {x:-175,z:-125,w:48,d:39,h:32,type:'shop'}, {x:-268,z:-26,w:72,d:55,h:43,type:'home'},
      {x:-344,z:12,w:41,d:43,h:53,type:'office'}, {x:-173,z:9,w:38,d:33,h:28,type:'shop'},
      {x:-291,z:100,w:56,d:39,h:32,type:'shop'}, {x:-181,z:99,w:43,d:43,h:62,type:'office'},
      {x:130,z:-127,w:39,d:36,h:37,type:'shop'}, {x:183,z:-122,w:54,d:43,h:111,type:'work'},
      {x:286,z:-126,w:38,d:42,h:76,type:'office'}, {x:260,z:-14,w:64,d:39,h:47,type:'use'},
      {x:132,z:100,w:72,d:48,h:36,type:'ties'}, {x:263,z:96,w:60,d:41,h:60,type:'office'}
    ];
    const trees=[[-340,111,20],[-320,127,17],[-220,-145,15],[-120,-84,19],[-119,115,17],[112,5,18],[330,59,22],[236,129,17],[266,-145,16]];
    const depth=(x,z)=>-x*.565+z*.825;
    [...buildings.map(b=>({depth:depth(b.x+b.w/2,b.z+b.d/2),draw:()=>building(b)})),...trees.map(([x,z,s])=>({depth:depth(x,z),draw:()=>tree(x,z,s)}))].sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    STOPS.forEach(stop=> {
      const anchor=xy(stop.point);
      line([stop.point,[stop.point[0],stop.point[1],stop.pin[2]-16]],COLORS[stop.id],.8,svg,{'stroke-opacity':'.5'});
      add('circle',{cx:anchor[0],cy:anchor[1],r:4,fill:COLORS[stop.id],stroke:'#f2eee3','stroke-width':2});
      if(routes.has(stop.id)) {
        const a=xy(HOME), b=xy([-90,65,17]), c=xy([90,65,17]), end=anchor;
        const d=`M${a} L${b} L${c} L${end}`;
        add('path',{d,fill:'none',stroke:'#f2eee3','stroke-width':8,'stroke-linejoin':'round','stroke-linecap':'round'});
        const path=add('path',{d,fill:'none',stroke:COLORS[stop.id],'stroke-width':3.3,'stroke-linejoin':'round','stroke-linecap':'round'});
        const token=add('rect',{x:a[0]-5,y:a[1]-3,width:10,height:6,rx:1,fill:COLORS[stop.id],stroke:'#f2eee3','stroke-width':1.5,visibility:'hidden'});
        tokens.push({id:stop.id,token,path});
      }
    });
    const [hx,hy]=xy(HOME);
    add('circle',{cx:hx,cy:hy,r:6,fill:COLORS.home,stroke:'#f2eee3','stroke-width':3});
    line([HOME,[-228,25,98]],COLORS.home,.9);
  }
  const stopButtons = new Map();
  function makeStop(id,name,pin) {
    const b=document.createElement(id==='home'?'div':'button');
    if(id!=='home')b.type='button';
    b.className=id==='home'?'cl-game-stop cl-game-home':'cl-game-stop';b.dataset.stop=id;b.style.setProperty('--stop-color',COLORS[id]);
    b.style.setProperty('--stop-active', {home:'#a53e22',work:'#173e40',use:'#29675f',ties:'#875132'}[id]);
    const [x,y]=xy(pin);b.style.left=`${x/7.6}%`;b.style.top=`${y/4.4}%`;
    b.innerHTML=`<span>${name}</span>${id==='home'?'<small>Fixed origin</small>':'<small></small>'}`;
    b.setAttribute('aria-describedby',`${uid}-instruction`);
    stopsEl.appendChild(b);stopButtons.set(id,b);
    if(id!=='home')on(b,'click',()=>choose(id));
  }
  makeStop('home','Home',[-228,25,111]);
  STOPS.forEach(s=>makeStop(s.id,s.name,s.pin));
  function choose(id) {
    if(round===6) { status.textContent='Six rounds complete. Read what the rules left out, or play again below.'; return; }
    settle();
    if(routes.has(id)) {
      routes.delete(id); status.textContent=`${STOPS.find(s=>s.id===id).name} route removed. One connection is free.`;
    } else if(routes.size===2) {
      status.textContent='Both routes are in use. Tap a linked destination to remove its route, then connect another.';
    } else {
      routes.add(id); status.textContent=`${STOPS.find(s=>s.id===id).name} connected. ${routes.size===1?'Add a second connection, or run a round.':'Run a round, or change a connection.'}`;
    }
    update();
  }
  function update() {
    STOPS.forEach(s=> {
      const b=stopButtons.get(s.id), linked=routes.has(s.id);
      b.classList.toggle('is-connected',linked);b.setAttribute('aria-pressed',String(linked));
      b.querySelector('small').textContent=`${queues[s.id]} waiting${linked?' · linked':''}`;
      b.setAttribute('aria-label',`${s.name}: ${queues[s.id]} waiting. ${round===6?'Six rounds complete.':linked?'Route connected. Tap to remove.':'Tap to connect to Home.'}`);
    });
    instruction.textContent=round===6?'Read what these rules left out below.':'Tap a destination to connect it to Home. Tap again to remove.';
    container.querySelector('.cl-game-round-count').textContent=`Round ${round} of 6`;
    container.querySelector('.cl-game-result').textContent=`${journeys} ${journeys===1?'journey':'journeys'} made`;
    container.querySelector('.cl-game-route-count').textContent=`${routes.size} of 2 routes used`;
    roundButton.disabled=routes.size===0||round===6;
    resetButton.hidden=round===6;
    endPanel.hidden=round!==6;
    container.classList.toggle('cl-game-complete',round===6);
    drawCity();
  }
  function runRound(event) {
    if(!routes.size || round===6) return;
    // Native keyboard/assistive clicks have detail 0. Capture ownership before
    // disabling Run; pointer completion must not force focus or scroll.
    const handoffFocus=event?.detail===0&&document.activeElement===roundButton;
    settle();
    let carried=0;
    const moved=new Set();
    routes.forEach(id=>{ const n=Math.min(2,queues[id]);queues[id]-=n;carried+=n;if(n)moved.add(id); });
    journeys+=carried; INCOMING[round].forEach(id=>queues[id]++); round++;
    const waiting=Object.values(queues).reduce((sum,n)=>sum+n,0);
    status.textContent=round===6?(handoffFocus?'':'Six rounds complete. The reflection below explains what the rules left out.'):`${carried} ${carried===1?'journey':'journeys'} made this round. ${waiting} waiting in total. Keep your routes or change them before the next round.`;
    endTally.textContent=`Invented tally: ${journeys} ${journeys===1?'journey':'journeys'} made · ${waiting} waiting. These counts describe the game rules.`;
    // Counts and the live announcement update immediately; motion is feedback only.
    update();
    // The focused heading and its tally replace, rather than repeat, the live
    // completion announcement for keyboard users.
    if(round===6&&handoffFocus)endTitle.focus();
    if(!isPaused()&&moved.size){
      animation=true;startTime=null;
      tokens.forEach(({id,token})=>token.setAttribute('visibility',moved.has(id)?'visible':'hidden'));
      schedule();
    }
  }
  function reset() {
    settle();
    round=0;journeys=0;routes=new Set();queues=Object.fromEntries(STOPS.map(s=>[s.id,s.queue]));
    endTally.textContent='';
    status.textContent='Choose up to two destinations. You can change connections between rounds.';update();
  }
  function isPaused() { return globalPaused||media.matches||document.hidden||!localVisible; }
  function settle() {
    cancelAnimationFrame(raf);raf=0;startTime=null;animation=false;
    tokens.forEach(({token})=>token.setAttribute('visibility','hidden'));
  }
  function frame(now) {
    raf=0;if(destroyed||isPaused()||!animation){settle();return;}
    startTime??=now;
    const t=Math.min(1,(now-startTime)/600), eased=1-Math.pow(1-t,3);
    tokens.forEach(({token,path})=>{const p=path.getPointAtLength(path.getTotalLength()*eased);token.setAttribute('x',p.x-5);token.setAttribute('y',p.y-3);});
    if(t<1)schedule();else settle();
  }
  function schedule() {if(!raf&&!destroyed&&!isPaused()&&animation)raf=requestAnimationFrame(frame);}
  function pause(value=true) {globalPaused=Boolean(value);if(isPaused())settle();}
  on(roundButton,'click',runRound);on(resetButton,'click',reset);
  on(againButton,'click',event=>{const keyboard=event.detail===0;reset();if(keyboard)stopButtons.get('work')?.focus();});
  on(document,'crossing:motion',e=>pause(e.detail?.paused));
  on(document,'visibilitychange',()=>{if(isPaused())settle();});
  on(media,'change',()=>{if(isPaused())settle();});
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{localVisible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.05);if(!localVisible)settle();},{threshold:[0,.05]}):null;
  observer?.observe(container);
  reset();
  return { pause, getState(){return{round,journeys,routes:[...routes],queues:{...queues},animating:animation};}, destroy(){destroyed=true;settle();observer?.disconnect();listeners.forEach(remove=>remove());container.replaceChildren();} };
}
