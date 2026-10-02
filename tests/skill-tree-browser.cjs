const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),url=process.env.DREAM_URL||'file://'+path.join(root,'index.html'),key='dreamy-nights-chapter-one-v1';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined}),errors=[];fs.mkdirSync(out,{recursive:true});try{
 const setup=await browser.newPage();await setup.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));});await setup.goto(url);await setup.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{}, {timeout:120000});await setup.click('#startButton');await setup.click('#confirmHero');await setup.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await setup.click('#dialogueSkip');const seed=await setup.evaluate(()=>DreamGame.inspect().state);await setup.close();
 for(const [hero,w,h,mobile,low] of [['ari',1440,1000,false,false],['popo',1280,800,false,true],['ari',844,390,true,false],['popo',568,320,true,false]]){
  const p=await browser.newPage({viewport:{width:w,height:h},isMobile:mobile,hasTouch:mobile});p.on('pageerror',e=>errors.push(e.message));const s=structuredClone(seed);delete s.growth;Object.assign(s,{active:hero,xp:low?0:675,x:330,y:651,map:2,killed:[],hp:6});Object.assign(s.flags,{introSeen:true,firstMemory:true,metLumen:true,walkHint:true});
  await p.addInitScript(({s,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));let q=[],t=0;window.requestAnimationFrame=f=>(q.push(f),q.length);window.__step=n=>{for(let i=0;i<n;i++){t+=1000/60;const jobs=q;q=[];jobs.forEach(f=>f(t));}};},{s,key});
  await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{}, {timeout:120000});await p.click('#continueButton');await p.evaluate(()=>__step(2));await p.keyboard.press('u');await p.waitForFunction(()=>DreamGame.inspect().modalKind==='growth');
  const img=await p.evaluate(()=>new Promise(resolve=>{const i=new Image;i.onload=()=>resolve([i.naturalWidth,i.naturalHeight]);i.onerror=()=>resolve(null);i.src='assets/skill-icons-v437.png';}));assert(img&&Math.abs(img[0]/img[1]-2)<.01);
  assert.equal(await p.locator('.st-node:visible').count(),9);assert.equal(await p.locator('.st-link').count(),6);assert.equal(await p.locator('.st-fork').count(),1);
  const pos=await p.locator('.st-node .st-art').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundPosition));assert.equal(new Set(pos).size,9);
  const overflow=await p.evaluate(()=>[...document.querySelectorAll('.st-screen,.st-map,.st-node,.st-detail,#modalContent')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+2).map(e=>[e.className,e.scrollWidth,e.clientWidth]));assert.deepEqual(overflow,[]);
  const clipped=await p.evaluate(()=>{const bounds=document.getElementById('modalContent').getBoundingClientRect();return [...document.querySelectorAll('.st-node')].filter(e=>e.getBoundingClientRect().bottom>bounds.bottom+1).map(e=>e.id);});assert.deepEqual(clipped,[],'all nine choices should fit at first glance');
  if(mobile){const bb=await p.locator('#growthNode-attack1').boundingBox();assert(bb.width>=44&&bb.height>=44);}
  await p.screenshot({animations:'disabled',path:out+`/skill-tree-${hero}-${w}.png`});
  const view=()=>p.evaluate(()=>DreamGame.inspect());
  await p.click('#growthNode-attack3');assert(await p.locator('#growthLearn').isDisabled());assert.match(await p.locator('.st-status').textContent(),low?/Lv. 8/:/앞 단계/);
  if(mobile)await p.click('#growthTreeBack');
  await p.click('#growthNode-attack1');
  if(low){assert(await p.locator('#growthLearn').isDisabled());assert.match(await p.locator('.st-status').textContent(),/Lv. 2/);}
  else{
   await p.click('#growthLearn');assert.deepEqual((await view()).state.growth.nodes,['attack1']);assert.equal((await view()).state.growth.active,'attack');assert(await p.locator('#growthLearn').isDisabled());assert.equal(await p.locator('.st-points b').textContent(),'4');
   if(mobile)await p.click('#growthTreeBack');
   assert(await p.locator('#growthNode-attack2').evaluate(e=>e.classList.contains('is-ready')));
   await p.click('#growthNode-attack2');await p.click('#growthLearn');assert((await view()).state.growth.passives.includes('attack'));
   await p.screenshot({animations:'disabled',path:out+`/skill-detail-${hero}-${w}.png`});
   if(mobile)await p.click('#growthTreeBack');
   assert.equal(await p.locator('.st-node:visible').count(),9);assert.equal(await p.locator('.st-link.lit').count(),1);
   const before=(await view()).state.growth;await p.click('#growthReset');await p.click('#growthCancel');assert.deepEqual((await view()).state.growth,before);
   await p.click('#growthReset');await p.click('#growthConfirm');assert.equal((await view()).state.growth.nodes.length,0);assert.equal(await p.locator('.st-points b').textContent(),'5');
  }
  if(!mobile){await p.focus('#growthNode-attack1');await p.keyboard.press('ArrowRight');assert.equal(await p.evaluate(()=>document.activeElement.id),'growthNode-guard1');await p.keyboard.press('ArrowDown');assert.equal(await p.evaluate(()=>document.activeElement.id),'growthNode-guard2');}
  await p.emulateMedia({reducedMotion:'reduce'});assert(await p.locator('.st-medallion').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationName==='none')));
  await p.close();console.log('PASS illustrated tree, requirements, input, reset and layout',hero,w,h);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
