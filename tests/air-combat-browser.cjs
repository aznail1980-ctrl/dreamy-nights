const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),url='file://'+path.join(root,'index.html'),key='dreamy-nights-chapter-one-v1';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined}),checks=[],errors=[];fs.mkdirSync(out,{recursive:true});
try{
 let seed;
 const setup=await browser.newPage();await setup.addInitScript(()=>localStorage.setItem('dreamy-nights-opening-v1','seen'));await setup.goto(url);await setup.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{},{timeout:45000});await setup.click('#startButton');await setup.click('#confirmHero');await setup.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await setup.click('#dialogueSkip');seed=await setup.evaluate(()=>DreamGame.inspect().state);await setup.close();
 for(const [hero,mobile]of [['ari',false],['popo',false],['ari',true]]){
  const p=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:920},isMobile:mobile,hasTouch:mobile});p.on('pageerror',e=>errors.push(e.message));const s=structuredClone(seed);Object.assign(s,{active:hero,map:0,x:820,y:651,killed:[]});Object.assign(s.flags,{introSeen:true,firstMemory:true,metLumen:true,walkHint:true});
  await p.addInitScript(({key,s})=>{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));let q=[],t=0;window.requestAnimationFrame=fn=>(q.push(fn),q.length);window.__step=n=>{for(let i=0;i<n;i++){t+=1000/60;const jobs=q;q=[];jobs.forEach(fn=>fn(t));}};},{key,s});
  await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{},{timeout:45000});
  await p.evaluate(()=>{DREAM_CONTENT.maps[0].enemies=[{id:'airTestEnemy',type:'sand',x:900,y:651,hpScale:8}];});await p.click('#continueButton');const step=n=>p.evaluate(n=>__step(n),n),inspect=()=>p.evaluate(()=>DreamGame.inspect());await step(3);
  if(mobile)await p.locator('#jumpControl').tap();else await p.keyboard.down('Space');await step(6);if(!mobile)await p.keyboard.up('Space');const first=await inspect();assert(!first.player.grounded&&first.player.y<651&&!first.player.airJumpUsed);
  if(mobile)await p.locator('#jumpControl').tap();else await p.keyboard.down('Space');await step(2);const second=await inspect();assert(second.player.airJumpUsed&&second.player.vy<0);if(!mobile)await p.keyboard.up('Space');
  await step(6);const beforeThird=await inspect();if(mobile)await p.locator('#jumpControl').tap();else await p.keyboard.down('Space');await step(1);if(!mobile)await p.keyboard.up('Space');const third=await inspect();assert(third.player.airJumpUsed&&third.player.airJumpT<beforeThird.player.airJumpT,'third press must not reset jump');
  // Move over the actual monster while airborne, then descend through its hitbox.
  await p.keyboard.down('d');await step(14);await p.keyboard.up('d');await step(2);
  const before=await inspect();assert(!before.player.grounded);const hp=before.enemies[0].hp;
  if(mobile)await p.locator('#attackControl').tap();else await p.keyboard.down('j');assert((await inspect()).player.plunge);if(!mobile)await p.keyboard.up('j');
  await step(9);await p.screenshot({path:path.join(out,`air-plunge-${hero}${mobile?'-mobile':''}.png`)});await step(40);const landed=await inspect();assert(landed.player.grounded&&!landed.player.plunge&&!landed.player.airJumpUsed);assert.equal(hp-landed.enemies[0].hp,4,'one impact including landing');
  await p.keyboard.down('a');await step(48);await p.keyboard.up('a');await step(18);await p.keyboard.down('j');await step(70);assert((await inspect()).player.chargeReady,'ground charge preserved');await p.keyboard.up('j');assert.equal((await inspect()).player.pendingStrike.impact,'charged');await step(60);
  await p.keyboard.down('Space');await step(9);await p.keyboard.up('Space');await p.keyboard.down('j');await p.keyboard.up('j');assert((await inspect()).player.plunge);await p.keyboard.down('Shift');await step(1);await p.keyboard.up('Shift');const cancelled=await inspect();assert(!cancelled.player.plunge&&cancelled.player.plungeUsed&&cancelled.player.dodgeT>0);await step(65);
  checks.push(`${hero}${mobile?' touch':' keyboard'}: double jump, no third jump, descending hit once, landing reset, ground charge and dash cancellation`);await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'air-combat-result.json'),JSON.stringify({checks,errors},null,2));console.log('PASS',checks);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
