const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright');
const out=path.resolve(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});
const url='file://'+path.resolve(__dirname,'../index.html');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined});const checks=[],errors=[];
 async function open(w,h,reduced=false){
  const p=await browser.newPage({viewport:{width:w,height:h},isMobile:w<1000,hasTouch:w<1000,reducedMotion:reduced?'reduce':'no-preference'});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('dreamy-nights-opening-v1','seen'));await p.goto(url);
  await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title'&&DreamGame.inspect().lobby.ready.popo,{},{timeout:45000});
  await p.click('#startButton');await p.waitForTimeout(500);return p;
 }
 try{
  for(const [w,h] of [[1440,920],[390,844],[320,568],[844,390]]){
   const p=await open(w,h);
   assert.equal(await p.locator('.keeper-dossier').getAttribute('data-profile'),'ari');
   assert((await p.locator('.keeper-origin').innerText()).includes('원정대에 들어온 이유'));
   await p.click('[data-hero="popo"]');await p.waitForFunction(()=>DreamGame.inspect().lobby.choiceFrames.popo===4,{},{timeout:5000});
   assert.equal(await p.locator('.keeper-dossier').getAttribute('data-profile'),'popo');
   assert.equal(await p.evaluate(()=>DreamGame.inspect().lobby.choiceFrames.popo),4);
   assert((await p.locator('.keeper-facts').innerText()).includes('별나무 꿈망치'));
   await p.screenshot({path:path.join(out,`keeper-choice-${w}.png`)});
   await p.waitForTimeout(1650);
   await p.click('[data-hero="popo"]');await p.waitForFunction(()=>DreamGame.inspect().lobby.choiceFrames.popo===4,{},{timeout:5000});assert.equal(await p.evaluate(()=>DreamGame.inspect().lobby.choiceFrames.popo),4,'reselect replays greeting');
   await p.locator('[data-hero="ari"]').focus();await p.keyboard.press('Space');assert.equal(await p.locator('.keeper-dossier').getAttribute('data-profile'),'ari');
   await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.keeper-dossier').getAttribute('data-profile'),'popo');
   await p.locator('.keeper-secret summary').click();assert.equal(await p.locator('.keeper-secret').getAttribute('open'),'');assert((await p.locator('.keeper-secret p').innerText()).includes('거꾸로'));
   await p.screenshot({path:path.join(out,`keeper-story-${w}.png`)});
   const overflow=await p.locator('#modal .modal-card').evaluate(e=>e.scrollWidth>e.clientWidth+2);assert(!overflow,'horizontal overflow '+w);
   await p.locator('#confirmHero').scrollIntoViewIfNeeded();const b=await p.locator('#confirmHero').boundingBox();assert(b.x>=0&&b.x+b.width<=w+1&&b.y>=0&&b.y+b.height<=h+1,'confirm bounds '+w);if(w<1000)assert(b.height>=43.9);if(w<h)assert(b.width>w*.75,'portrait action fills width');
   await p.click('#confirmHero');assert.equal(await p.evaluate(()=>DreamGame.inspect().state.active),'popo');
   await p.reload();await p.waitForFunction(()=>DreamGame.inspect().mode==='title');await p.click('#continueButton');assert.equal(await p.evaluate(()=>DreamGame.inspect().state.active),'popo');
   checks.push(`${w}x${h}: profile, story, replay greeting, keyboard, disclosure, layout, confirm and saved choice`);await p.close();
  }
  const r=await open(390,844,true);await r.click('[data-hero="popo"]');await r.waitForTimeout(160);assert.equal(await r.evaluate(()=>DreamGame.inspect().lobby.choiceFrames.popo),0);
  const before=await r.locator('[data-choice-canvas="popo"]').screenshot();await r.waitForTimeout(320);assert.deepEqual(await r.locator('[data-choice-canvas="popo"]').screenshot(),before);assert.equal(await r.locator('.keeper-dossier').getAttribute('data-profile'),'popo');await r.click('#confirmHero');assert.equal(await r.evaluate(()=>DreamGame.inspect().state.active),'popo');await r.close();checks.push('Reduced motion keeps selected art still while profile and confirmation remain usable');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'hero-selection-result.json'),JSON.stringify({checks,errors},null,2));console.log('PASS',checks);
 }catch(e){console.error(e.stack,errors);process.exitCode=1;}finally{await browser.close();}
})();
