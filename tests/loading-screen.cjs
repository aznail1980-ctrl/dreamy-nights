const {chromium}=require('playwright'),assert=require('assert/strict'),path=require('path'),fs=require('fs');
const url=process.env.GAME_URL||'http://127.0.0.1:8769/',out=path.resolve(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN});try{
 for(const [width,height,mobile] of [[1440,920,false],[852,393,true],[390,844,true],[320,568,true]]){
  const p=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile});const errors=[];p.on('pageerror',e=>errors.push(e.message));let release;const gate=new Promise(r=>release=r);let n=0;
  await p.route('**/assets/**',async r=>{if(!r.request().url().includes('LobbyV418')&&n++%5!==0)await gate;await r.continue().catch(()=>{});});
  await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.querySelectorAll('#loading .load-hero.ready').length===2);await p.waitForFunction(()=>Number(document.getElementById('loadProgress').getAttribute('aria-valuenow'))>0);
  assert.equal(await p.evaluate(()=>DreamGame.inspect().mode),'loading');let percent=Number(await p.getAttribute('#loadProgress','aria-valuenow'));assert(percent>0&&percent<100);assert.equal(await p.textContent('#loadingPercent'),percent+'%');
  for(const sel of ['#loading h1','#loadingText','#loadProgress','#loadingMotion','#loadingTip','.load-ari','.load-popo']){const b=await p.locator(sel).boundingBox();assert(b&&b.x>=-.5&&b.y>=-.5&&b.x+b.width<=width+.5&&b.y+b.height<=height+.5,sel+' clipped '+width);}
  if(mobile)assert((await p.locator('#loadingMotion').boundingBox()).height>=43.8);
  const shot=()=>p.locator('.load-popo canvas').screenshot();const a=await shot();await p.waitForTimeout(400);assert.notDeepEqual(a,await shot(),'character animates');
  await p.click('#loadingMotion');const paused=await shot();await p.waitForTimeout(250);assert.deepEqual(paused,await shot(),'pause is static');await p.click('#loadingMotion');
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(80);assert(await p.locator('#loadingMotion').isDisabled());const reduced=await shot();await p.waitForTimeout(200);assert.deepEqual(reduced,await shot());await p.emulateMedia({reducedMotion:'no-preference'});
  await p.screenshot({path:out+'/loading-v430-'+width+'.png'});release();await p.waitForFunction(()=>DreamGame.inspect().mode==='opening',null,{timeout:45000});assert.equal(await p.getAttribute('#loading','aria-busy'),'false');assert.equal(await p.getAttribute('#loadProgress','aria-valuenow'),'100');assert(await p.locator('#loading').isHidden());assert.deepEqual(errors,[]);await p.close();
 }
 const p=await browser.newPage();await p.addInitScript(()=>localStorage.setItem('loading-qa-save','preserved'));await p.route('**/assets/ari.webp',r=>r.abort());await p.goto(url);await p.waitForSelector('#loadingRetry:visible');assert((await p.textContent('#loadingText')).includes('불러오지 못했어요'));assert.equal(await p.getAttribute('#loading','aria-busy'),'false');await p.unroute('**/assets/ari.webp');await p.click('#loadingRetry');await p.waitForFunction(()=>DreamGame.inspect().mode==='opening',null,{timeout:45000});assert.equal(await p.evaluate(()=>localStorage.getItem('loading-qa-save')),'preserved');
 console.log('PASS 4 screen sizes; genuine partial/100% progress; animated heroes; pause/reduced motion; boot transition; failed asset and retry without clearing storage');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
