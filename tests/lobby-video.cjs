const QA_OUT=require('path').resolve(__dirname,'../test-results');require('fs').mkdirSync(QA_OUT,{recursive:true});
const fs=require('fs'),assert=require('assert'),{chromium}=require('playwright');
const checks=[],errors=[],url=process.env.GAME_URL||'file://'+require('path').resolve(__dirname,'../index.html');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined});try{
 for(const [w,h,mobile] of [[1440,920,false],[844,390,true],[667,375,true]]){
  const p=await b.newPage({viewport:{width:w,height:h},isMobile:mobile,hasTouch:mobile});p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='opening');
  assert(await p.evaluate(()=>document.activeElement.classList.contains('opening-play')));
  await p.screenshot({path:QA_OUT+'/lobby-v418-video-opening-poster-'+w+'.png'});
  for(const sel of ['.opening-play','.opening-skip','.opening-sound']){const r=await p.locator(sel).boundingBox();assert(r.x>=0&&r.y>=0&&r.x+r.width<=w+1&&r.y+r.height<=h+1);if(mobile)assert(r.height>=43.9)}
  assert.equal(await p.evaluate(()=>localStorage.getItem('dreamy-nights-chapter-one-v1')),null);
  await p.click('.opening-skip');assert.equal(await p.evaluate(()=>DreamGame.inspect().mode),'title');
  assert.equal(await p.evaluate(()=>localStorage.getItem('dreamy-nights-opening-v1')),'seen');
  await p.reload();await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title');assert(!(await p.locator('.dream-opening').isVisible()));await p.screenshot({path:QA_OUT+'/lobby-v418-video-title-'+w+'.png'});
  await p.click('#openingReplay');await p.keyboard.press('Space');await p.waitForFunction(()=>DreamGame.inspect().opening.played);assert.equal(await p.evaluate(()=>document.querySelector('video').muted),false);
  await p.waitForFunction(()=>document.querySelector('video').currentTime>1.3);await p.click('.opening-pause');assert(await p.evaluate(()=>document.querySelector('video').paused));assert(await p.evaluate(()=>{const v=document.querySelector('video');return v.videoWidth===1280&&v.videoHeight===720&&v.duration>5&&v.duration<6&&new URL(v.currentSrc).pathname.endsWith('first-night.mp4')&&new URL(v.currentSrc).searchParams.get('v')==='4.27.1'}));await p.screenshot({path:QA_OUT+'/lobby-v418-video-video-'+w+'.png'});await p.click('.opening-pause');await p.waitForFunction(()=>!document.querySelector('video').paused);
  await p.click('.opening-sound');assert(await p.evaluate(()=>document.querySelector('video').muted));
  await p.waitForFunction(()=>DreamGame.inspect().mode==='title',{},{timeout:12000});assert.equal(await p.evaluate(()=>localStorage.getItem('dreamy-nights-chapter-one-v1')),null);
  await p.click('#openingReplay');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>DreamGame.inspect().mode),'title');
  await p.click('#startButton');await p.click('[data-hero="popo"]');await p.click('#confirmHero');assert.equal(await p.evaluate(()=>DreamGame.inspect().state.active),'popo');
  checks.push(w+'x'+h+': actual 720p H.264/AAC video, first visit, skip, repeat visit, replay, keyboard/touch play, pause, mute, end and hero selection');await p.close();
 }
 const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='opening');await p.evaluate(()=>{const v=document.querySelector('video');v.src='missing-intro.mp4';v.load()});await p.waitForFunction(()=>document.querySelector('.dream-opening').classList.contains('has-error'));await p.click('.opening-play');assert.equal(await p.evaluate(()=>DreamGame.inspect().mode),'title');checks.push('Missing video gives a working game entry and cannot trap the player');await p.close();
 assert.deepEqual(errors,[]);fs.writeFileSync(QA_OUT+'/lobby-v418-video-opening-qa-result.json',JSON.stringify({passed:true,checks,errors,media:'Final first-night.mp4, 1280x720, 30fps, 5.37 seconds with Echoes Of Home excerpt, CC BY 4.0'},null,2));console.log('PASS',checks);
 }catch(e){console.error(e.stack);process.exitCode=1}finally{await b.close()}})();
