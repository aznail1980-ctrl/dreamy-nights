const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),url=process.env.DREAM_URL||'file://'+path.join(root,'index.html');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined}),errors=[];fs.mkdirSync(out,{recursive:true});
try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));let q=[],t=0;window.requestAnimationFrame=f=>(q.push(f),q.length);window.__step=n=>{for(let i=0;i<n;i++){t+=1000/60;const jobs=q;q=[];jobs.forEach(f=>f(t));}};});
 await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{}, {timeout:120000});
 await p.evaluate(()=>{const draw=DreamRenderer.prototype.draw;DreamRenderer.prototype.draw=function(r){window.__renderer=this;return draw.call(this,r);};});await p.click('#startButton');await p.click('#confirmHero');await p.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await p.click('#dialogueSkip');await p.evaluate(()=>__step(5));
 const step=n=>p.evaluate(n=>__step(n),n);
 async function arrange({first=false,wild=false,id='sand',kind='light'}={}){return p.evaluate(({first,wild,id,kind})=>{
  const r=__renderer.r,player=r.player;Object.assign(player,{x:800,y:kind==='plunge'?485:651,grounded:kind!=='plunge',groundY:651,vy:0,vx:0,facing:1,invincible:100,attackT:0,chargeHeld:false,chargeT:0,chargeLevel:0,pendingStrike:null,dodgeT:0,hitT:0,plunge:null,plungeUsed:false,climbing:null,lift:null});r.state.flags.firstMemory=!first;r.state.flags.metLumen=true;r.state.flags.walkHint=true;
  r.enemies.forEach((e,i)=>{e.dead=i!==0;e.fade=0;delete e.purification;Object.assign(e,{x:i===0?(kind==='plunge'?810:865):4500,y:651,floorY:651,hp:1,max:1,stun:100,knockV:0,airFall:false,action:null,windup:0,growthSlow:0,respawn:28});});
  const e=r.enemies[0];e.wild=wild;e.variant=['sand','crab','box','boss'].includes(id)?undefined:id;e.type=DREAM_CONTENT.regionCreatures[id]?.type||id;e.face=-1;e.home=e.x;
  DREAM_CONTENT.rollDrops=()=>[['cookie',1]];window.__victim=e;return r.state.rpg.inventory.cookie;
 },{first,wild,id,kind});}
 async function finish(kind='light'){await p.keyboard.down('j');if(kind==='charged')await step(70);await p.keyboard.up('j');for(let i=0;i<35;i++){await step(1);if(await p.evaluate(()=>__victim.dead))return;}throw Error('actual attack did not purify');}
 let before=await arrange();await p.screenshot({path:out+'/purification-before.png'});await finish();
 let s=await p.evaluate(()=>DreamGame.inspect());assert.equal(s.state.rpg.inventory.cookie,before+1);assert.equal(s.loot.length,0);assert(s.enemies[0].dead&&s.enemies[0].purification);const light=s.state.light,hp=s.state.hp;
 await step(39);const calm=await p.evaluate(()=>DREAM_PURIFICATION.pose(__victim));assert.equal(calm.form,'sand');assert.equal(calm.gentle,1);assert.equal(calm.dark,0);assert.equal(await p.evaluate(()=>DreamGame.inspect().loot.length),0);await p.screenshot({path:out+'/purification-gentle.png'});
 // Pause must hold both transformation and delayed loot until resumed.
 const pausedAt=await p.evaluate(()=>__victim.purification.elapsed);await p.keyboard.press('Escape');await step(120);assert.equal(await p.evaluate(()=>__victim.purification.elapsed),pausedAt);assert.equal(await p.evaluate(()=>DreamGame.inspect().loot.length),0);await p.click('#resume');
 // Another actual attack cannot damage the peaceful actor or grant duplicate rewards.
 await p.keyboard.press('j');await step(20);s=await p.evaluate(()=>DreamGame.inspect());assert.equal(s.state.rpg.inventory.cookie,before+1);assert.equal(s.state.light,light);assert.equal(s.state.hp,hp);
 await step(62);s=await p.evaluate(()=>DreamGame.inspect());assert.equal(s.enemies[0].fade,0);assert(s.loot.length===1&&s.loot[0].age>0);await p.screenshot({path:out+'/purification-reward.png'});
 await step(190);
 // First-memory dialogue used to freeze the fading enemy. It now finishes only the cosmetic sequence.
 before=await arrange({first:true,id:'shoreSnail'});await finish();assert.equal(await p.evaluate(()=>DreamGame.inspect().mode),'dialogue');await step(120);s=await p.evaluate(()=>DreamGame.inspect());assert.equal(s.mode,'dialogue');assert.equal(s.enemies[0].fade,0);assert.equal(s.state.rpg.inventory.cookie,before+1);assert(s.loot.length===1);await p.click('#dialogueSkip');await step(190);
 // Strong and aerial attacks use the same one-time reward and soft form.
 for(const kind of ['charged','plunge']){before=await arrange({id:'bellSentry',kind});await finish(kind);assert.equal(await p.evaluate(()=>__victim.purification.form),'tideBell');assert.equal(await p.evaluate(()=>DreamGame.inspect().state.rpg.inventory.cookie),before+1);await step(300);}
 // Saved defeated guardians do not replay the transformation or pay a second time.
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('dreamy-nights-chapter-one-v1')));const cookies=saved.rpg.inventory.cookie;await p.reload();await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title');await p.click('#continueButton');await step(5);s=await p.evaluate(()=>DreamGame.inspect());assert(s.enemies[0].dead&&!s.enemies[0].purification);assert.equal(s.state.rpg.inventory.cookie,cookies);assert.equal(s.loot.length,0);
 // All current forms use the original art already loaded by the game, including dungeon mappings.
 await p.evaluate(()=>{const draw=DreamRenderer.prototype.draw;DreamRenderer.prototype.draw=function(r){window.__renderer=this;return draw.call(this,r);};__step(1);});
 const loaded=await p.evaluate(()=>Object.entries(DREAM_PURIFICATION.forms).every(([id,s])=>__renderer.images[s.key]?.naturalWidth>0));assert(loaded);
 // Leaving immediately preserves the reward but does not carry the old map's loot visuals.
 before=await arrange({id:'vaneBat'});await finish();await p.keyboard.press('Escape');await p.click('#backTown');await step(130);s=await p.evaluate(()=>DreamGame.inspect());assert.equal(s.state.map,2);assert.equal(s.state.rpg.inventory.cookie,before+1);assert.equal(s.loot.length,0);
 assert.deepEqual(errors,[]);console.log('PASS actual basic/charged/plunge purification, gentle original art, immediate saved rewards/delayed visuals, no duplicate hits, dialogue finish, pause/resume, reload and early map departure');
}catch(e){console.error(e.stack,errors);process.exitCode=1;}finally{await b.close();}})();
