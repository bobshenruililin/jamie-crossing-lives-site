#!/usr/bin/env node
/* Check the actual slide player. Optional argument: HTTP or offline HTML URL. */
const {chromium}=require('playwright');
const base=process.argv[2]||'http://127.0.0.1:4188/presentation.html';
const checks=[],errors=[];const check=(name,ok)=>checks.push({name,ok:!!ok});
(async()=>{
 const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'load'});await page.waitForSelector('#stage svg');
 check('24 slides in the picker',await page.locator('#scene-list button').count()===24);
 check('v4 edition labelled',/Script v4/.test(await page.textContent('#draft-label')));
 if(!base.startsWith('file:'))check('matching PDF link is available',await page.locator('#pdf-link').isVisible());
 await page.click('#scenes-trigger');await page.click('[data-scene-index="4"]');
 await page.waitForFunction(()=>document.querySelector('#scene-count').textContent==='05 / 24'&&document.querySelector('#stage').getAttribute('aria-busy')==='false');
 const concealed=await page.locator('#stage .is-concealed').count();
 await page.click('#next');
 check('manual reveal advances within the slide',concealed>0&&await page.locator('#stage .is-concealed').count()<concealed&&await page.textContent('#scene-count')==='05 / 24');
 await page.click('#motion');
 check('motion off reveals all evidence',await page.locator('#stage .is-concealed').count()===0);
 for(let i=0;i<24;i++){
  await page.click('#scenes-trigger');await page.click(`[data-scene-index="${i}"]`);
  await page.waitForFunction(n=>document.querySelector('#scene-count').textContent===`${String(n+1).padStart(2,'0')} / 24`&&document.querySelector('#stage').getAttribute('aria-busy')==='false',i);
  check(`slide ${i+1} has its frame and evidence`,await page.locator('#stage svg').count()===1&&await page.locator('#stage .is-concealed').count()===0);
  await page.click('#sources');
  check(`slide ${i+1} has a source-scope note`,(await page.textContent('#source-note')).length>30);
  check(`slide ${i+1} exposes no private document link`,await page.locator('#source-links a').evaluateAll(ns=>ns.every(n=>!/(docs|drive)\.google\.com|chatgpt\.com\/space|libfile_/.test(n.href))));
  await page.keyboard.press('Escape');
 }
 check('final slide holds the AGF reflections',/Dee Poon/.test(await page.textContent('#stage'))&&/What.s next/.test(await page.textContent('#stage')));
 await page.evaluate(()=>document.activeElement.blur());await page.keyboard.press('Home');
 await page.waitForFunction(()=>document.querySelector('#scene-count').textContent==='01 / 24');
 check('Home returns to the first slide',await page.textContent('#scene-count')==='01 / 24');
 await page.evaluate(()=>location.hash='joining-circles');
 await page.waitForFunction(()=>document.querySelector('#scene-count').textContent==='18 / 24');
 check('old joining-circles link reaches continuing ties',/Relationships span places/.test(await page.textContent('#stage')));
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});
  check(`player fits ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 check('no player runtime errors',errors.length===0);
 await browser.close();checks.forEach(c=>console.log(`${c.ok?'PASS':'FAIL'} ${c.name}`));
 if(errors.length)console.log(errors.join('\n'));
 console.log(`${checks.filter(c=>c.ok).length}/${checks.length} presentation checks passed · ${base}`);
 if(checks.some(c=>!c.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(2)});
