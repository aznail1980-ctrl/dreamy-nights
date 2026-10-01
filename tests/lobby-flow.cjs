const QA_OUT=require('path').resolve(__dirname,'../test-results');require('fs').mkdirSync(QA_OUT,{recursive:true});
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright');
const url='file://'+path.resolve(__dirname,'../index.html');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined}),checks=[],errors=[];
try{for(const [w,h,mobile] of [[1440,920,false],[390,844,true],[320,568,true],[844,390,true]]){
 const page=await browser.newPage({viewport:{width:w,height:h},isMobile:mobile,hasTouch:mobile});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForFunction(()=>window.DreamGame?.inspect().mode==='opening',{},{timeout:45000});
 await page.waitForTimeout(720);await page.screenshot({path:`${QA_OUT}/lobby-v418-intro-${w}.png`});
 for(const sel of ['.opening-play','.opening-skip','.opening-sound']){const b=await page.locator(sel).boundingBox();assert(b&&b.x>=-1&&b.y>=-1&&b.x+b.width<=w+1&&b.y+b.height<=h+1,sel+' clipped '+w);if(mobile)assert(b.height>=43.9,sel+' too small');}
 await page.click('.opening-skip');await page.waitForFunction(()=>DreamGame.inspect().lobby.ready.ari&&DreamGame.inspect().lobby.ready.popo);await page.waitForTimeout(720);
 await page.screenshot({path:`${QA_OUT}/lobby-v418-title-${w}.png`});
 for(const sel of ['#startButton','#openingReplay','#titleHelp','#lobbyMotion','[data-lobby-hero="ari"]','[data-lobby-hero="popo"]']){const b=await page.locator(sel).boundingBox();assert(b&&b.x>=-1&&b.y>=-1&&b.x+b.width<=w+1&&b.y+b.height<=h+1,sel+' clipped '+w);if(mobile)assert(b.height>=43.9,sel+' too small');}
 const before=(await page.locator('[data-lobby-hero="ari"] canvas').screenshot()).toString('base64');await page.click('[data-lobby-hero="ari"]');await page.waitForTimeout(330);const after=(await page.locator('[data-lobby-hero="ari"] canvas').screenshot()).toString('base64');assert.notEqual(before,after);assert((await page.locator('.character-note').textContent()).includes('아리'));
 await page.click('#lobbyMotion');await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>DreamGame.inspect().lobby.paused),true);const paused=(await page.locator('[data-lobby-hero="ari"] canvas').screenshot()).toString('base64');await page.waitForTimeout(220);assert.equal(paused,(await page.locator('[data-lobby-hero="ari"] canvas').screenshot()).toString('base64'));await page.click('#lobbyMotion');
 await page.click('#startButton');await page.waitForFunction(()=>DreamGame.inspect().modalKind==='character');await page.click('[data-hero="popo"]');await page.waitForTimeout(720);await page.screenshot({path:`${QA_OUT}/lobby-v418-choice-${w}.png`});assert((await page.locator('#confirmHero').textContent()).includes('포포'));await page.locator('#confirmHero').click();assert.equal(await page.evaluate(()=>DreamGame.inspect().state.active),'popo');
 await page.reload();await page.waitForFunction(()=>DreamGame.inspect().mode==='title');await page.waitForFunction(()=>DreamGame.inspect().lobby.ready.popo);await page.waitForTimeout(720);await page.screenshot({path:`${QA_OUT}/lobby-v418-resume-${w}.png`});assert.equal(await page.locator('#title').getAttribute('data-has-save'),'true');
 for(const sel of ['#startButton','#continueButton']){const b=await page.locator(sel).boundingBox();assert(b&&b.x>=-1&&b.y>=-1&&b.x+b.width<=w+1&&b.y+b.height<=h+1,sel+' clipped resume '+w);}
 await page.click('#continueButton');assert.equal(await page.evaluate(()=>DreamGame.inspect().state.active),'popo');checks.push(`${w}x${h}: intro/title bounds, touch targets, animated greeting, pause, choice, save and resume`);await page.close();
}
assert.deepEqual(errors,[]);fs.writeFileSync(QA_OUT+'/lobby-v418-qa-result.json',JSON.stringify({checks,errors},null,2));console.log('PASS',checks);
}catch(e){console.error(e.stack);console.error('PAGE ERRORS',errors);process.exitCode=1;}finally{await browser.close();}})();
