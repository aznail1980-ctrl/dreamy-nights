const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),url='file://'+path.join(root,'index.html'),key='dreamy-nights-chapter-one-v1';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined}),errors=[],checks=[];fs.mkdirSync(out,{recursive:true});try{
 const setup=await browser.newPage();setup.on('pageerror',e=>errors.push(e.message));await setup.addInitScript(()=>localStorage.setItem('dreamy-nights-opening-v1','seen'));await setup.goto(url);await setup.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{},{timeout:45000});await setup.click('#startButton');await setup.click('#confirmHero');await setup.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await setup.click('#dialogueSkip');const seed=await setup.evaluate(()=>DreamGame.inspect().state);await setup.close();
 for(const hero of ['ari','popo']){
 const mobile=hero==='popo',p=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});p.on('pageerror',e=>errors.push(e.message));const s=structuredClone(seed);delete s.growth;Object.assign(s,{active:hero,xp:675,x:330,y:651,map:0,killed:[],hp:8});Object.assign(s.flags,{introSeen:true,firstMemory:true,metLumen:true,walkHint:true});
 await p.addInitScript(({s,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));let q=[],t=0;window.requestAnimationFrame=fn=>(q.push(fn),q.length);window.__step=n=>{for(let i=0;i<n;i++){t+=1000/60;const jobs=q;q=[];jobs.forEach(fn=>fn(t));}};},{s,key});await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{},{timeout:45000});
 await p.evaluate(()=>{DREAM_CONTENT.maps[0].enemies=[{id:'skillFixture',type:'sand',x:470,y:651,hpScale:30}];const old=DreamRenderer.prototype.actor;DreamRenderer.prototype.actor=function(...args){window.__renderer=this;return old.apply(this,args);};});await p.click('#continueButton');const step=n=>p.evaluate(n=>__step(n),n),inspect=()=>p.evaluate(()=>DreamGame.inspect());await step(4);
 const open=async()=>{if(mobile){await p.locator('#tagPortrait').tap();await p.locator('#keeperGrowth').tap();}else await p.keyboard.press('u');await p.waitForFunction(()=>DreamGame.inspect().modalKind==='growth');};
 await open();assert.equal((await inspect()).state.growth.nodes.length,0);
 for(const branch of ['attack','guard','control']){
  if(branch!=='attack'){await p.locator('#growthReset').click();await p.locator('#growthConfirm').click();}
  await p.locator('#growthTab-'+branch).click();
  for(const stage of [1,2,3]){await p.locator('#growthNode-'+branch+stage).click();await p.locator('#growthLearn').click();}
  let v=await inspect();assert.equal(v.state.growth.active,branch);assert.equal(v.state.growth.nodes.length,3);assert(v.state.growth.passives.includes(branch));
  if(branch==='attack'){
   await p.screenshot({path:path.join(out,'progression-'+hero+(mobile?'-mobile':'-desktop')+'.png')});
   const overflow=await p.evaluate(()=>[...document.querySelectorAll('.growth-screen,.growth-detail,.growth-node')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className));assert.deepEqual(overflow,[]);
   // Learning freezes the world, so opening menus never consumes skill timers.
   const before=await inspect();await step(90);assert.equal((await inspect()).player.x,before.player.x);
  }
  await p.locator('#modalClose').click();await step(2);
  // Deterministic combat position, real skill input, real enemy damage path.
  await p.evaluate(()=>{const r=__renderer.r;Object.assign(r.player,{x:330,y:651,groundY:651,grounded:true,facing:1,invincible:0,hitT:0,dodgeT:0});const e=r.enemies[0];Object.assign(e,{x:450,y:651,floorY:651,home:450,hp:150,max:150,dead:false,stun:20,windup:0,action:null});});
  await step(750); // recover the previous skill naturally; no menu/cooldown reset
  await p.evaluate(()=>{const e=__renderer.r.enemies[0];Object.assign(e,{x:450,hp:150,stun:20});});
  if(mobile)await p.locator('#skillControl').tap();else await p.keyboard.press('k');
  v=await inspect();assert(v.state.growth.skillCD>0);assert.equal(v.player.skillVisual.id,branch);
  if(branch==='guard')assert(v.player.skillShield&&v.enemies[0].hp===150);else assert(v.enemies[0].hp<150);
  if(branch==='control')assert(v.enemies[0].growthSlow>0);
  await step(3);await p.screenshot({path:path.join(out,`progression-${hero}-${branch}-cast.png`)});
  const after=await inspect();if(mobile)await p.locator('#skillControl').tap();else await p.keyboard.press('k');assert.equal((await inspect()).enemies[0].hp,after.enemies[0].hp,'cooldown must block second cast');
  if(branch==='guard'){
   const wave=async hp=>{await p.evaluate(hp=>{const r=__renderer.r;r.state.hp=hp;r.state.flags.pomiRescue=true;r.player.invincible=0;r.waves.length=0;r.waves.push({x:r.player.x,y:r.player.y-55,vx:0,life:1,r:10,damage:1,hit:false});},hp);await step(1);return inspect();};
   let shielded=await wave(7);assert.equal(shielded.state.hp,7);assert(!shielded.player.skillShield,'one shield charge consumed');
   let guarded=await wave(2.5);assert.equal(guarded.state.hp,2);assert(guarded.state.growth.guardCD>24,'low-health passive starts 25 second cooldown');
   let second=await wave(2.5);assert.equal(second.state.hp,1.5,'passive cannot repeat during cooldown');
  }
  if(branch==='attack'){
   await step(45);
   for(let combo=0;combo<3;combo++){
    await p.evaluate(i=>{const r=__renderer.r;Object.assign(r.player,{x:330,y:651,groundY:651,grounded:true,facing:1,hitT:0,dodgeT:0});Object.assign(r.enemies[0],{x:405,y:651,stun:20,knockV:0});if(!i){r.enemies[0].hp=150;r.player.comboT=0;}},combo);
    await p.keyboard.press('j');await step(25);
   }
   assert.equal((await inspect()).enemies[0].hp,141,'third-hit passive adds one damage to the 2+2+4 combo');
  }
  if(branch==='control'){
   await step(45);
   await p.evaluate(()=>{const r=__renderer.r;Object.assign(r.player,{x:330,y:651,groundY:651,grounded:true,facing:1,hitT:0});Object.assign(r.enemies[0],{x:800,y:651,stun:20,knockV:0,growthSlow:0});});
   await p.keyboard.press('Shift');await step(20);assert((await inspect()).player.dashGift>0);
   await p.evaluate(()=>{const r=__renderer.r;Object.assign(r.player,{x:330,y:651,groundY:651,grounded:true,facing:1});Object.assign(r.enemies[0],{x:520,y:651,stun:20,knockV:0,growthSlow:0,hp:150});});
   await p.keyboard.press('j');await step(12);const gift=await inspect();assert(gift.enemies[0].hp<150&&gift.enemies[0].growthSlow>0,'dash passive extends reach and slows');assert.equal(gift.player.dashGift,0);
  }
  await open();const cooldown=(await inspect()).state.growth.skillCD;await step(90);assert.equal((await inspect()).state.growth.skillCD,cooldown,'menu pauses cooldown');
  checks.push(hero+' '+branch+' unlock, mastery, passive, cast and cooldown');
 }
 const beforeReload=(await inspect()).state;await p.reload();await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title');await p.click('#continueButton');await step(2);const reloaded=(await inspect()).state;assert.deepEqual(reloaded.growth.nodes,beforeReload.growth.nodes);assert.equal(reloaded.growth.active,'control');assert(reloaded.growth.skillCD>0,'reload must preserve cooldown');
 await open();await p.locator('#growthReset').click();await p.locator('#growthConfirm').click();const reset=(await inspect()).state;assert.equal(reset.growth.nodes.length,0);assert.equal(reset.growth.active,'base');assert(reset.growth.skillCD>0);assert.equal(reset.rpg.resonance,reloaded.rpg.resonance);await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'progression-browser-result.json'),JSON.stringify({checks,errors},null,2));console.log('PASS',checks);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
