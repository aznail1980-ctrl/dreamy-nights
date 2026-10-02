const path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const base=process.env.GAME_URL||'file://'+path.resolve(__dirname,'../index.html');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN}),errors=[];try{
 for(const supported of [true,false]){
 const p=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(supported=>{
  localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:true,voice:true,volume:.24}));window.__plays=[];window.__sessions=[];window.__contexts=0;
  if(supported){let type='auto';Object.defineProperty(navigator,'audioSession',{value:{get type(){return type;},set type(v){type=v;__sessions.push(v);}}});}
  const old=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){__plays.push({tag:this.tagName,muted:this.muted,volume:this.volume,session:navigator.audioSession?.type});return old.call(this);};
  const Native=window.AudioContext;window.AudioContext=class extends Native{constructor(...args){super(...args);__contexts++;}};
  let q=[],t=0;requestAnimationFrame=f=>(q.push(f),q.length);window.__step=n=>{for(let i=0;i<n;i++){t+=1000/60;let jobs=q;q=[];jobs.forEach(f=>f(t));}};
 },supported);
 await p.goto(base);await p.waitForFunction(()=>DreamGame?.inspect().mode==='opening',{}, {timeout:120000});assert(await p.locator('.opening-video').evaluate(e=>e.muted));assert.equal(await p.evaluate(()=>__contexts),0);
 await p.click('.opening-play');await p.waitForTimeout(100);assert((await p.evaluate(()=>__plays)).every(e=>e.muted));
 await p.click('.opening-sound');assert.equal(await p.locator('.opening-video').evaluate(e=>e.muted),false);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('dreamy-nights-settings-v1')).sound),true);
 await p.click('.opening-sound');assert(await p.locator('.opening-video').evaluate(e=>e.muted));
 await p.click('.opening-skip');await p.click('#startButton');await p.click('#confirmHero');await p.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await p.click('#dialogueSkip');await p.evaluate(()=>__step(3));assert.equal(await p.evaluate(()=>DreamGame.inspect().audioMix.sound),false);assert.equal(await p.evaluate(()=>DreamGame.inspect().voice.playing),false);
 // Gameplay touches do not turn sound back on. Explicit sound action does.
 await p.keyboard.press('j');await p.evaluate(()=>__step(20));assert.equal(await p.evaluate(()=>DreamGame.inspect().audioMix.sound),false);
 await p.locator('#hud .sound-toggle').click();await p.evaluate(()=>__step(3));assert.equal(await p.evaluate(()=>DreamGame.inspect().audioMix.sound),true);
 if(supported)assert((await p.evaluate(()=>__sessions)).every(t=>t==='ambient'));
 await p.keyboard.press('Escape');await p.locator('#soundSetting').uncheck();await p.evaluate(()=>__step(3));assert.equal(await p.evaluate(()=>DreamGame.inspect().audioMix.sound),false);assert((await p.evaluate(()=>DreamGame.inspect().audioMix.tracks)).every(t=>!t.playing));await p.click('#resume');
 await p.locator('#hud .sound-toggle').click();
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await p.evaluate(()=>DreamGame.inspect().audioMix.sound),false,'background return must require a new sound choice');
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await p.evaluate(()=>DreamGame.inspect().audioMix.sound),false);if(await p.locator('#resume').isVisible())await p.click('#resume');await p.locator('#hud .sound-toggle').click();await p.reload();await p.waitForFunction(()=>DreamGame?.inspect().mode==='title',{}, {timeout:120000});await p.click('#continueButton');await p.evaluate(()=>__step(3));assert.equal(await p.evaluate(()=>DreamGame.inspect().audioMix.sound),false,'each mobile visit starts muted');
 await p.evaluate(()=>{const draw=DreamRenderer.prototype.draw;window.__draws=0;DreamRenderer.prototype.draw=function(r){__draws++;window.__renderer=this;return draw.call(this,r);};});await p.evaluate(()=>__step(1));
 if(supported){
  await p.click('#tagPortrait');await p.evaluate(()=>__step(1));const start=await p.evaluate(()=>__draws);await p.evaluate(()=>__step(120));assert.equal(await p.evaluate(()=>__draws),start,'paused menu must not redraw the world every frame');
  const c=await p.context().newCDPSession(p),send=(type,touchPoints)=>c.send('Input.dispatchTouchEvent',{type,touchPoints});
  const tap=async selector=>{const el=p.locator(selector);await el.scrollIntoViewIfNeeded();const r=await el.boundingBox();assert(r.width>=40&&r.height>=40);await send('touchStart',[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]);await send('touchEnd',[]);};
  await p.evaluate(()=>{window.__menuClicks=[];window.__menuEnds=[];document.addEventListener('click',e=>{const b=e.target.closest('button');if(b)__menuClicks.push({id:b.id,page:b.dataset.kitPage,pose:b.dataset.keeperPose});},true);document.addEventListener('touchend',e=>__menuEnds.push(e.defaultPrevented));});
  await tap('[data-keeper-pose="run"]');assert.equal(await p.locator('#keeperPoseLabel').textContent(),'달리기');assert.equal(await p.evaluate(()=>__menuClicks.filter(e=>e.pose==='run').length),1);assert.equal(await p.evaluate(()=>__menuEnds.at(-1)),true);
  for(const page of ['bag','characterDetail','bag','characterDetail']){await tap(`[data-kit-page="${page}"]`);assert.equal(await p.evaluate(()=>DreamGame.inspect().modalKind),page);assert.equal(await p.locator('#modal').getAttribute('data-refresh'),'true');assert.equal(await p.locator('.modal-card').evaluate(e=>getComputedStyle(e).animationName),'none');}
  assert.equal(await p.evaluate(()=>__menuClicks.filter(e=>e.page).length),4);
  await tap('[data-keeper-gear="baton"]');assert.equal(await p.evaluate(()=>DreamGame.inspect().modalKind),'bag');await tap('[data-item="baton"]');assert.equal(await p.locator('#modal').getAttribute('data-detail'),'true');await tap('#bagListBack');assert.equal(await p.locator('#modal').getAttribute('data-detail'),'false');
  const buttons=await p.evaluate(()=>__menuClicks.length);const target=p.locator('[data-item="baton"]');await target.scrollIntoViewIfNeeded();const r=await target.boundingBox();await send('touchStart',[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]);await send('touchMove',[{x:r.x+r.width/2,y:r.y+r.height/2-35,id:1}]);await send('touchEnd',[]);assert.equal(await p.evaluate(()=>__menuClicks.length),buttons,'drag is not an item selection');assert.equal(await p.evaluate(()=>document.querySelectorAll('.is-touch-pressed').length),0);
  await p.click('#modalClose');await p.evaluate(()=>__step(5));assert((await p.evaluate(()=>__draws))>start,'world drawing resumes');
 }
 await p.close();console.log('PASS mobile sound policy, intro/game unified mute, saved-on reload, menu immediate taps and paused drawing',supported);
 }
 assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
