#!/usr/bin/env node
/* Capture the real candidate and exercise its motion/touch behavior.
   Start the local server first. Needs Playwright (and its ffmpeg for videos).
   CHROME_PATH=/path/to/chrome node tools/capture-connected-review.js [base]
   CAPTURE_DIR overrides the output directory for provisional inspection.
   Videos record actual clicks; no generated or interpolated imagery. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const base=process.argv[2]?.startsWith('http')?process.argv[2]:'http://127.0.0.1:4188/';
const output=process.env.CAPTURE_DIR||path.resolve('review/connected-20261106/assets');
fs.mkdirSync(output,{recursive:true});
const checks=[],errors=[];
const check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
const scenes=[['care','#care-loop'],['connections','#ties-panel'],['contacts','.circles'],['johor','#echo'],['fieldwork','.services-fieldwork']];
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const sourceDirty=Boolean(execFileSync('git',['diff','--name-only','--','index.html','feature','tools'],{encoding:'utf8'}).trim());
async function ready(p){
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base,{waitUntil:'networkidle'});
  if(await p.locator('#status-popup').evaluate(n=>n.open))await p.locator('.status-popup-explore').click();
  await p.locator('.care-drawing').waitFor();
  await p.evaluate(()=>document.fonts.ready);
}
async function position(p,selector){
  await p.locator(selector).evaluate(n=>scrollTo({top:scrollY+n.getBoundingClientRect().top-78,behavior:'instant'}));
}
async function shot(p,name){
  await p.waitForTimeout(150);
  await p.screenshot({path:path.join(output,name+'.jpg'),type:'jpeg',quality:90});
}
(async()=>{
  const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
  if(process.argv.includes('--before')){
    const url='https://bobshenruililin.github.io/jamie-crossing-lives-site/';
    const p=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
    await p.goto(url,{waitUntil:'networkidle'});await p.locator('.status-popup-explore').click();await p.evaluate(()=>document.fonts.ready);
    await p.locator('.ties-switch [data-profile="guide"]').click();
    for(const [name,selector] of scenes.filter(([name])=>name!=='fieldwork')){await position(p,selector);await shot(p,'before-'+name);}
    fs.writeFileSync(path.join(output,'before-manifest.json'),JSON.stringify({url,capturedAt:new Date().toISOString(),browser:browser.version(),viewport:{width:1440,height:1000,dpr:1},motion:'reduced',referenceMain:execFileSync('git',['rev-parse','origin/main'],{encoding:'utf8'}).trim(),note:'Captured from the published site. Reference main is the fetched repository revision, not a server deployment attestation.'},null,2)+'\n');
    await browser.close();console.log('Four published-main reference captures saved.');return;
  }
  for(const [width,height,mobile] of [[1440,1000,false],[390,844,true]]){
    const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
    const p=await ctx.newPage();await ready(p);
    for(const [name,selector] of scenes){
      if(name==='care')await p.locator('[data-care-go="2"]').click();
      if(name==='johor')await p.locator('.echo-question[data-n="3"]').click();
      await position(p,selector);await shot(p,`${name}-${mobile?'phone':'desktop'}`);
    }
    await p.locator('.ties-switch [data-profile="resident"]').click();
    await position(p,'#ties-panel');await shot(p,`resident-${mobile?'phone':'desktop'}`);
    check(`${width}: resident note remains visible`,await p.locator('.ties-note').isVisible()&&/regular commute/.test(await p.locator('.ties-note').textContent()));
    if(mobile){
      await position(p,'#care-loop');await p.locator('[data-care-go="3"]').tap();
      const bounds=await p.locator('.care-drawing').boundingBox();
      check('phone: care response and illustration are in view together',bounds.y>=60&&bounds.y+bounds.height<=height&&/clinical need/.test(await p.locator('.care-reading').textContent()));
      await p.locator('.ties-switch [data-profile="guide"]').tap();
      await p.locator('.ties-focus [data-focus="work"]').tap();
      check('phone: guide workplace stays unplaced',/location not established/.test(await p.locator('.ties-unplaced').textContent()));
      await p.locator('.ties-focus [data-focus="all"]').tap();
      await p.locator('[data-replay]').tap();
      check('reduced motion: replay settles without an animation',await p.locator('[data-arrives] .tie-icon').evaluate(n=>n.getAnimations().length===0));
      await p.locator('.echo-question[data-n="3"]').tap();
      check('phone: open question can collapse',!(await p.locator('#echo-learning-3').isVisible()));
      await p.locator('.echo-mark[data-n="3"]').tap();
      check('phone: model marker opens the matching question',await p.locator('#echo-learning-3').isVisible());
    }
    check(`${width}: no horizontal document overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    await ctx.close();
  }
  // Normal-motion behavior, including cancellation of a running home movement.
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const p=await ctx.newPage();await ready(p);await position(p,'#ties-panel');
  await p.locator('[data-replay]').click();await p.waitForTimeout(100);
  check('motion: the home actually moves',await p.locator('[data-arrives] .tie-icon').evaluate(n=>n.getAnimations().some(a=>a.playState==='running')));
  check('motion: family stays put',await p.locator('[data-facet="ties"] .city-hk .tie-icon').evaluate(n=>n.getAnimations().length===0&&getComputedStyle(n).transform==='none'));
  await p.locator('#motion-control').click();
  check('motion pause cancels the home animation',await p.locator('[data-arrives] .tie-icon').evaluate(n=>n.getAnimations().length===0&&getComputedStyle(n).transform==='none'));
  await ctx.close();
  const recordings=[];
  for(const scene of ['care','connections']){
    let videoContext;
    try{
      const temp=fs.mkdtempSync(path.join(os.tmpdir(),'crossing-review-'));
      videoContext=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:temp,size:{width:1440,height:1000}},reducedMotion:'no-preference'});
      // Acknowledge only for recording preparation; the ordinary checks test the popup.
      await videoContext.addInitScript(()=>sessionStorage.setItem('crossing-lives:website-wip-acknowledged','yes'));
      const v=await videoContext.newPage();await ready(v);
      await position(v,scene==='care'?'#care-loop':'#ties-panel');await v.waitForTimeout(1000);
      if(scene==='care'){
        for(const i of [2,3,1]){await v.locator(`[data-care-go="${i}"]`).click();await v.waitForTimeout(1800);}
      }else{
        await v.locator('[data-replay]').click();await v.waitForTimeout(1500);
        await v.locator('.ties-focus [data-focus="ties"]').click();await v.waitForTimeout(1500);
        await v.locator('.ties-switch [data-profile="resident"]').click();await v.waitForTimeout(1500);
        await v.locator('.ties-focus [data-focus="home"]').click();await v.waitForTimeout(1500);
        await v.locator('.ties-focus [data-focus="all"]').click();await v.waitForTimeout(1000);
      }
      const recording=v.video();await videoContext.close();videoContext=null;
      const file=`${scene}-interaction.webm`;await recording.saveAs(path.join(output,file));recordings.push(file);
      fs.rmSync(temp,{recursive:true,force:true});
    }catch(error){console.log(`Recording unavailable (${scene}): ${error.message}`);await videoContext?.close();}
  }
  check('no page errors during capture and interaction checks',errors.length===0);
  const manifest={capturedAt:new Date().toISOString(),base,sourceCommit:revision,sourceDirty,browser:browser.version(),platform:process.platform,architecture:process.arch,viewports:[{width:1440,height:1000,dpr:1},{width:390,height:844,dpr:1,emulated:true}],screenshots:'Reduced motion; fonts ready; selected interaction states.',recordings:'Normal motion; real scripted clicks; not real-device testing.',recordingFiles:recordings,checks,errors};
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  await browser.close();checks.forEach(c=>console.log(`${c.ok?'PASS':'FAIL'} ${c.name}`));console.log(`${checks.filter(c=>c.ok).length}/${checks.length} capture/interaction checks passed`);
  if(checks.some(c=>!c.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(2)});
