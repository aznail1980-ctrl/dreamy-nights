const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),url=process.env.DREAM_URL||'file://'+path.join(root,'index.html'),key='dreamy-nights-chapter-one-v1';
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined}),errors=[];fs.mkdirSync(out,{recursive:true});
try{
 const setup=await b.newPage();await setup.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));});await setup.goto(url);await setup.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{}, {timeout:60000});await setup.click('#startButton');await setup.click('#confirmHero');await setup.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await setup.click('#dialogueSkip');await setup.waitForFunction(()=>DreamGame.inspect().mode==='play');const seed=await setup.evaluate(()=>DreamGame.inspect().state);await setup.close();
 for(const [map,width,height]of [[5,1440,900],[6,1440,900],[8,1440,900],[9,1440,900],[6,844,390],[9,844,390]]){
  const p=await b.newPage({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000});p.on('pageerror',e=>errors.push(e.message));
  const s=structuredClone(seed);Object.assign(s,{map,x:map===5?1700:map===6?1600:map===8?1500:1700,y:map===6?471:map===8?171:map===9?231:651,killed:[],visited:[0,1,2,3,4,5,6,7,8,9]});Object.assign(s.flags,{introSeen:true,firstMemory:true,metLumen:true,metBaker:true,metPost:true,cookedFirst:true,readyForBoss:true,bossIntroduced:true,starChartRead:true});
  await p.addInitScript(({key,s})=>{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));let q=[],t=0;window.requestAnimationFrame=f=>(q.push(f),q.length);window.__step=n=>{for(let i=0;i<n;i++){t+=1000/60;const jobs=q;q=[];jobs.forEach(f=>f(t));}};},{key,s});
  await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{}, {timeout:60000});await p.evaluate(()=>{const draw=DreamRenderer.prototype.draw;DreamRenderer.prototype.draw=function(r){window.__renderer=this;return draw.call(this,r);};});await p.click('#continueButton');await p.evaluate(()=>__step(25));
  let state=await p.evaluate(()=>DreamGame.inspect());assert.equal(state.mode,'play');assert.equal(state.state.map,map);assert.equal(state.journey.map,map);assert.equal(state.journey.kind,'enemy');assert(state.nextAction.includes('정화'));assert((await p.locator('#questTitle').innerText()).includes('·'));
  await p.screenshot({path:path.join(out,`dungeon-${map}-${width}.png`)});
  // Actually finish the two mandatory guardians; optional roamers remain alive.
  await p.evaluate(()=>{const r=__renderer.r;for(const e of r.enemies.filter(e=>!e.wild)){e.dead=true;e.fade=0;r.state.killed.push(e.id);}__step(10);});
  state=await p.evaluate(()=>DreamGame.inspect());assert.equal(state.journey.kind,'object');assert(state.enemies.some(e=>e.wild&&!e.dead));
  await p.evaluate(()=>{document.getElementById('journeyLocal').click();__step(1);});assert.equal(await p.evaluate(()=>DreamGame.inspect().modalKind),'localMap');await p.screenshot({path:path.join(out,`dungeon-map-${map}-${width}.png`)});await p.click('#modalClose');
  if(map===5&&width===1440){
   const art=await p.evaluate(()=>{
    const source=__renderer,canvas=document.createElement('canvas');canvas.id='dungeonContact';canvas.width=1250;canvas.height=16*200;Object.assign(canvas.style,{position:'absolute',left:0,top:0,width:'1250px',height:canvas.height+'px',zIndex:99999});document.body.append(canvas);
    const r=new DreamRenderer(canvas,source.images,DREAM_CONTENT);r.r={state:source.r.state,player:{},clock:1,settings:{reducedMotion:false}};r.ctx.fillStyle='#dce1db';r.ctx.fillRect(0,0,canvas.width,canvas.height);
    const list=Object.entries(DREAM_DUNGEON_ART);list.forEach(([id,spec],row)=>{
     for(let f=0;f<5;f++){const e={variant:id,type:DREAM_CONTENT.regionCreatures[id]?.type||id,x:125+f*250,y:160+row*200,floorY:160+row*200,face:1,attackFace:1,elapsed:1,walkPhase:f===1?.6:0,motionSpeed:40,level:3,hp:4,max:4,windup:f===2?1:0,hurt:f===4?.2:0,action:f===3?'strike':null};r.enemy(e);r.text(['이동 A','이동 B','예고','공격','피격'][f],e.x,e.y+24,13,'#263747','center');}
    });return list.map(([id,s])=>({id,loaded:source.images[s.key]?.naturalWidth>0,frames:s.frames.length}));
   });assert.equal(art.length,16);assert(art.every(a=>a.loaded&&a.frames===5));await p.locator('#dungeonContact').screenshot({path:path.join(out,'dungeon-art-review.png')});await p.evaluate(()=>document.getElementById('dungeonContact').remove());
  }
  await p.close();console.log('PASS dungeon',map,width,'local mission, roamers optional, actual art, neighborhood map');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'dungeon-browser-result.json'),JSON.stringify({version:'4.35.0',errors,checks:6},null,2));
}catch(e){console.error(e.stack,errors);process.exitCode=1;}finally{await b.close();}})();
