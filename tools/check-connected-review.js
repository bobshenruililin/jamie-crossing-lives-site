#!/usr/bin/env node
/* Historical review integration checks. Start the site server on 4188 first. */
const {chromium}=require('playwright');
const base=process.argv[2]||'http://127.0.0.1:4188/review/connected-20261106/';
const results=[],errors=[];const check=(name,ok)=>results.push({name,ok:Boolean(ok)});
(async()=>{
  const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
  const p=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto(base,{waitUntil:'networkidle'});
  check('review is explicitly archived', /Archived/.test(await p.locator('.draft').textContent()));
  check('review uses the frozen candidate, not the current website', /snapshot\/#services$/.test(await p.locator('#candidate').getAttribute('src')));
  const frame=p.frameLocator('#candidate');const child=()=>p.frames().find(f=>f!==p.mainFrame()&&f.url().includes('#services'))||p.frames()[1];
  check('actual first-visit WIP popup is retained',await frame.locator('#status-popup').evaluate(n=>n.open));
  await frame.locator('.status-popup-explore').click();await p.waitForFunction(()=>!document.querySelector('#try').disabled);
  await p.locator('#try').click();
  check('review advances the real care component',await frame.locator('.care').getAttribute('data-care-step')==='2');
  for(const scene of ['care','connections','contacts','johor']){
    await p.locator(`[data-scene="${scene}"]`).click();await p.locator('[data-version="before"]').click();
    await p.waitForFunction(()=>{const i=document.querySelector('#before img');return i.complete&&i.naturalWidth>0;});
    check(`before capture loads: ${scene}`,await p.locator('#before img').evaluate(n=>n.naturalWidth===1440));
    await p.locator('[data-version="candidate"]').click();
    check(`candidate restores actual iframe: ${scene}`,await p.locator('#candidate').isVisible());
  }
  await p.locator('#try').click();
  check('review opens the Johor support question',await frame.locator('#echo-learning-3').isVisible());
  await p.locator('[data-scene="connections"]').click();await p.locator('#phone').click();
  check('phone switch resizes the actual viewport',await p.locator('#candidate').evaluate(n=>n.clientWidth===390));
  await p.locator('#try').click();
  check('home replay keeps the correct final placement in reduced motion',await frame.locator('.city-sz [data-arrives]').isVisible()&&await frame.locator('[data-arrives] .tie-icon').evaluate(n=>n.getAnimations().length===0));
  await p.locator('#phone').click();await p.locator('[data-scene="contacts"]').click();await p.locator('#try').click();
  check('contact walkthrough exposes the reported barrier',/age-related reluctance/.test(await frame.locator('#contact-reading').textContent()));
  await p.locator('[data-shots="phone"]').click();
  await p.locator('[data-shot="care"] img').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>{const i=document.querySelector('[data-shot="care"] img');return i.complete&&i.naturalWidth===390;});
  check('phone screenshot switch loads real phone capture',await p.locator('[data-shot="care"] img').evaluate(n=>n.naturalWidth===390));
  await p.locator('[data-shots="desktop"]').click();
  for(const video of await p.locator('video').all()){
    const info=await video.evaluate(n=>new Promise(resolve=>{const done=()=>resolve({duration:n.duration,w:n.videoWidth,h:n.videoHeight});if(n.readyState>=1)done();else{n.addEventListener('loadedmetadata',done,{once:true});n.addEventListener('error',()=>resolve({error:true}),{once:true});n.load();}}));
    check('recorded interaction video decodes',info.duration>5&&info.w===1440&&info.h===1000);
  }
  for(const width of [320,390,844,1440]){await p.setViewportSize({width,height:1000});check(`review fits ${width}px`,await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));}
  await p.locator('[data-scene="care"]').click();await p.locator('#try').click();await p.evaluate(()=>scrollTo(0,0));
  // Preserve the original November 6 capture; new QA output is temporary.
  await p.screenshot({path:process.env.REVIEW_SCREENSHOT || require('node:path').join(require('node:os').tmpdir(),'crossing-lives-review-check.jpg'),type:'jpeg',quality:88});
  check('review has no observed browser errors',errors.length===0);
  await browser.close();results.forEach(r=>console.log(`${r.ok?'PASS':'FAIL'} ${r.name}`));if(errors.length)console.log(errors.join('\n'));console.log(`${results.filter(r=>r.ok).length}/${results.length} review checks passed`);if(results.some(r=>!r.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(2)});
