'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),url=process.env.GAME_URL||'http://127.0.0.1:8769/';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));});
 await page.goto(url);await page.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',null,{timeout:60000});
 await page.evaluate(()=>{const old=DreamRenderer.prototype.actor;DreamRenderer.prototype.actor=function(...a){window.__fitRenderer=this;return old.apply(this,a)};});
 await page.click('#startButton');await page.click('#confirmHero');await page.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await page.click('#dialogueSkip');await page.waitForFunction(()=>window.__fitRenderer);
 const result=await page.evaluate(()=>{
  const cv=document.createElement('canvas');cv.width=320;cv.height=320;const r=new DreamRenderer(cv,__fitRenderer.images,DREAM_CONTENT),c=r.ctx;
  r.r={state:structuredClone(__fitRenderer.r.state),player:{},clock:1,settings:{reducedMotion:false}};
  const base={grounded:true,groundY:260,walkBlend:1,lean:.4};
  const configs=[{},...Array.from({length:6},(_,i)=>({motionSpeed:100,walkTime:(i+.1)*Math.PI/3})),...Array.from({length:4},(_,i)=>({motionSpeed:240,walkTime:(i+.1)*Math.PI/2})),{grounded:false,vy:-350},{grounded:false,vy:0},{grounded:false,vy:350},{landSquash:.1},...Array.from({length:6},(_,i)=>({climbing:{},climbPhase:(i+.1)*Math.PI/3})),...Array.from({length:4},(_,i)=>({dodgeT:[.25,.18,.10,.025][i],dodgeFacing:1})),{attackT:.19,attackLength:.38},...Array.from({length:3},(_,i)=>({chargeHeld:true,chargeT:[.2,.6,.9][i]})),...Array.from({length:3},(_,i)=>({chargeLevel:2,attackLength:.74,attackT:[.55,.35,.15][i],attackFacing:1}))];
  const heads=['seaBeret','starCrown','roseBow'],lookItems=[...heads,'softScarf','tideScarf','nightCape','mailBag','lampPack'];
  const calls=[],original=r.wear;let current;
  r.wear=function(id,view,x,y,size,angle){const t=c.getTransform();calls.push({id,view,x,y,size,angle,who:r.r.state.active,config:current,world:[t.a*x+t.c*y+t.e,t.b*x+t.d*y+t.f]});return original.call(this,id,view,x,y,size,angle)};
  let count=0;const gaps=[];
  for(const who of ['ari','popo'])for(const face of [-1,1])for(let i=0;i<configs.length;i++){
   current=i;r.r.state.active=who;r.r.player={...base,...configs[i],dodgeFacing:face,attackFacing:face};
   for(const id of lookItems){const slot=heads.includes(id)?'head':id.endsWith('Scarf')?'neck':'back';r.r.state.world.look={[slot]:id};r.actor(who,150,260,face,true);count++;}
   // Head accessories must touch the painted actor: catches floating crowns/hats in any frame.
   r.r.state.world.look={};c.clearRect(0,0,320,320);r.actor(who,150,260,face,true);const body=c.getImageData(0,0,320,320).data;
   for(const id of heads){
    r.r.state.world.look={head:id};const mask=document.createElement('canvas');mask.width=mask.height=320;const hc=mask.getContext('2d'),draw=r.wear;
    r.wear=function(item,...args){if(item===id){hc.setTransform(c.getTransform());const saved=this.ctx;this.ctx=hc;try{original.call(this,item,...args)}finally{this.ctx=saved}}return draw.call(this,item,...args)};
    c.clearRect(0,0,320,320);r.actor(who,150,260,face,true);const hat=hc.getImageData(0,0,320,320).data;let overlap=0;for(let k=3;k<hat.length;k+=4)if(hat[k]>50&&body[k]>50)overlap++;
    if(overlap<2)gaps.push({who,face,config:i,id,overlap});r.wear=draw;
   }
  }
  // Attachments follow translation exactly; no world-fixed or independently lagged overlay.
  const travel=[];for(const face of [-1,1]){r.r.state.world.look={head:'seaBeret',neck:'softScarf',back:'mailBag'};r.r.player={...base,motionSpeed:240,walkTime:2};for(const x of [90,127]){const start=calls.length;r.actor('popo',x,260,face,true);travel.push(calls.slice(start).map(v=>({id:v.id,world:v.world})));}}
  const review=document.createElement('canvas');review.id='attachmentReview';review.width=1440;review.height=1740;Object.assign(review.style,{position:'absolute',inset:'0',zIndex:999999,width:'1440px',height:'1740px'});document.body.append(review);const rr=new DreamRenderer(review,r.images,DREAM_CONTENT),ctx=rr.ctx;rr.r=r.r;ctx.fillStyle='#e8ddd5';ctx.fillRect(0,0,1440,1740);let row=0;
  const samples=[7,8,10,13,23,29];for(const who of ['ari','popo'])for(const id of heads){samples.forEach((i,col)=>{rr.r.state.active=who;rr.r.state.world.look={head:id,neck:'softScarf',back:col%2?'nightCape':'mailBag'};rr.r.player={...base,...configs[i]};ctx.save();ctx.translate(col*240+100,row*290+260);ctx.scale(1.7,1.7);rr.actor(who,0,0,1,true);ctx.restore();ctx.fillStyle='#344754';ctx.font='17px sans-serif';ctx.fillText(who+' '+id+' '+i,col*240+12,row*290+24);});row++;}
  return {count,calls,gaps,travel};
 });
 assert(result.calls.every(v=>[v.x,v.y,v.size,v.angle,...v.world].every(Number.isFinite)),'finite attachment transforms');
 assert.deepEqual(result.gaps,[],'head art must overlap painted head');
 for(let face=0;face<2;face++){const a=result.travel[face*2],b=result.travel[face*2+1];assert.deepEqual(a.map(v=>v.id),b.map(v=>v.id));a.forEach((v,i)=>{assert(Math.abs(b[i].world[0]-v.world[0]-37)<.001);assert(Math.abs(b[i].world[1]-v.world[1])<.001)});}
 for(const who of ['ari','popo']){const run=result.calls.filter(v=>v.who===who&&v.id==='seaBeret'&&v.config>=7&&v.config<=10);assert.equal(new Set(run.map(v=>v.x+','+v.y)).size,4);assert(run.every(v=>v.view===0));}
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});await page.locator('#attachmentReview').screenshot({path:path.join(root,'test-results/attachment-review.png')});await page.evaluate(()=>document.getElementById('attachmentReview').remove());
 // Reproduce the reported case through real movement input, not only isolated poses.
 await page.evaluate(()=>{const r=__fitRenderer;r.r.state.world.look={head:'seaBeret',neck:'softScarf',back:'mailBag'};window.__runningHat=[];const costume=r.costume,wear=r.wear;r.costume=function(look,pose,...a){this.__activePose=pose;return costume.call(this,look,pose,...a)};r.wear=function(id,view,x,y,size,angle){if(id==='seaBeret'&&this.__activePose?.kind==='run'){const t=this.ctx.getTransform();__runningHat.push({frame:this.__activePose.frame,x:this.r.player.x,hat:t.a*x+t.c*y+t.e});}return wear.call(this,id,view,x,y,size,angle)};});
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(1000);await page.keyboard.up('ArrowRight');
 const running=await page.evaluate(()=>__runningHat);assert(running.length>10);assert.equal(new Set(running.map(v=>v.frame)).size,4);assert(Math.max(...running.map(v=>v.x))-Math.min(...running.map(v=>v.x))>100);assert(Math.max(...running.map(v=>v.hat))-Math.min(...running.map(v=>v.hat))>50);
 await page.screenshot({path:path.join(root,'test-results/attachment-play.png')});
 await page.click('#tagPortrait');await page.click('[data-keeper-pose="run"]');assert.equal(await page.locator('#keeperPoseLabel').innerText(),'달리기');await page.click('[data-keeper-pose="walk"]');assert.equal(await page.locator('#keeperPoseLabel').innerText(),'걷기');assert.deepEqual(errors,[]);
 console.log('PASS',result.count,'hero / direction / pose / wearable combinations; head contact; frame tracking; exact world translation; distinct walk/run previews');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
