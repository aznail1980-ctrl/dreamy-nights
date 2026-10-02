const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),url='file://'+path.join(root,'index.html');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined}),errors=[];fs.mkdirSync(out,{recursive:true});try{
const p=await browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));let q=[],t=0;window.requestAnimationFrame=fn=>(q.push(fn),q.length);window.__step=n=>{for(let i=0;i<n;i++){t+=1000/60;const jobs=q;q=[];jobs.forEach(fn=>fn(t));}};});
await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{},{timeout:45000});
await p.evaluate(()=>{const original=DreamRenderer.prototype.actor;DreamRenderer.prototype.actor=function(...args){window.__renderer=this;return original.apply(this,args);};});
await p.click('#startButton');await p.click('#confirmHero');await p.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await p.click('#dialogueSkip');await p.evaluate(()=>__step(5));
await p.keyboard.down('d');await p.evaluate(()=>__step(18));await p.keyboard.up('d');const running=await p.evaluate(()=>{const p=DreamGame.inspect().player;return {frame:DREAM_MOTION.heroFrame(p),speed:p.motionSpeed};});assert(running.frame>=0&&running.frame<4);await p.screenshot({path:path.join(out,'motion-running.png')});
await p.keyboard.down('Space');await p.evaluate(()=>__step(5));await p.keyboard.up('Space');const jumping=await p.evaluate(()=>DREAM_MOTION.heroFrame(DreamGame.inspect().player));assert.equal(jumping,4);await p.screenshot({path:path.join(out,'motion-jump.png')});
await p.evaluate(()=>__step(100));
await p.evaluate(()=>{const {player,enemies}=__renderer.r;const e=enemies[0];window.__fallTarget=e;Object.assign(e,{x:player.x+70,y:player.y-65,floorY:player.y,stun:.6,poise:9,hp:100,max:100,action:'strike',windup:0});player.facing=1;});
await p.keyboard.down('j');await p.keyboard.up('j');await p.evaluate(()=>__step(12));
const falling=await p.evaluate(()=>({hp:__fallTarget.hp,y:__fallTarget.y,floor:__fallTarget.floorY,airFall:__fallTarget.airFall}));
assert(falling.hp<100,'actual attack must hit the airborne fixture');assert(falling.airFall&&falling.y<falling.floor,'hit must start gravity rather than snap to floor');
await p.evaluate(()=>__step(60));assert(await p.evaluate(()=>!__fallTarget.airFall&&__fallTarget.y===__fallTarget.floorY));
const summary=await p.evaluate(()=>{
 const source=__renderer,canvas=document.createElement('canvas');canvas.id='motionReview';canvas.width=1400;canvas.height=650+Math.ceil(Object.keys(DREAM_MOTION_ART.creatures).length/2)*265;Object.assign(canvas.style,{position:'absolute',left:'0',top:'0',zIndex:99999,width:'1400px',height:canvas.height+'px'});document.body.append(canvas);
 const r=new DreamRenderer(canvas,source.images,DREAM_CONTENT),c=r.ctx;r.r={state:JSON.parse(JSON.stringify(DreamGame.inspect().state)),player:{},settings:{reducedMotion:false},clock:1};c.fillStyle='#c6cfdb';c.fillRect(0,0,1400,canvas.height);r.r.state.world.look={neck:'creamScarf'};
 const labels=['달리기 1','달리기 2','달리기 3','달리기 4','상승','정점','하강','착지'];
 for(const [row,who]of['ari','popo'].entries())for(let frame=0;frame<8;frame++){
  const x=88+frame*175,y=200+row*225;r.r.state.active=who;r.r.player={grounded:frame<4||frame===7,motionSpeed:frame<4?250:0,walkTime:frame*Math.PI/2,vy:frame===4?-400:frame===6?400:0,landSquash:frame===7?.1:0,groundY:y};
  r.text(who+' · '+labels[frame],x,y+28,14,'#24364a');c.strokeStyle='#789';c.beginPath();c.moveTo(x-80,y);c.lineTo(x+80,y);c.stroke();r.actor(who,x,y,1,true);
 }
 const ids=Object.keys(DREAM_MOTION_ART.creatures);ids.forEach((id,i)=>{const row=Math.floor(i/2),col=i%2,baseX=col*700,y=650+row*265;
  for(let frame=0;frame<4;frame++){
   const e={type:['sand','crab','box','boss'].includes(id)?id:'sand',variant:['sand','crab','box','boss'].includes(id)?undefined:id,x:baseX+90+frame*170,y,floorY:y,face:1,attackFace:1,elapsed:frame===1?.3:.1,phase:'rest',motionSpeed:50,walkPhase:frame===1?.6:0,hp:8,max:10,level:1};
   if(frame===2){e.windup=.4;e.phase='warn';e.zone={kind:'sneeze',face:1};}if(frame===3){e.action='strike';e.phase='release';e.zone={kind:'sneeze',face:1};}
   if(id==='boss'){c.save();c.translate(e.x,e.y);c.scale(.65,.65);c.translate(-e.x,-e.y);}
   r.enemy(e);if(id==='boss')c.restore();r.text(id+' · '+['이동 A','이동 B','준비','공격'][frame],e.x,y+28,12,'#24364a');
  }
 });
 return {heroes:2,monsterTypes:ids.length,newImages:Object.keys(DREAM_MOTION_ART.sheets).map(k=>({key:k,loaded:!!source.images[k]?.complete,width:source.images[k]?.width}))};
});assert.equal(summary.monsterTypes,19);assert(summary.newImages.every(a=>a.loaded&&a.width>0));await p.locator('#motionReview').screenshot({path:path.join(out,'motion-pose-review.png')});await p.evaluate(()=>{
 const source=__renderer,canvas=document.createElement('canvas');canvas.id='motionTransitions';canvas.width=1400;canvas.height=620;Object.assign(canvas.style,{position:'absolute',left:'0',top:'0',zIndex:100000,width:'1400px',height:'620px'});document.body.append(canvas);
 const r=new DreamRenderer(canvas,source.images,DREAM_CONTENT);r.r={state:JSON.parse(JSON.stringify(DreamGame.inspect().state)),settings:{reducedMotion:false},clock:1,player:{}};r.ctx.fillStyle='#c6cfdb';r.ctx.fillRect(0,0,1400,620);r.r.state.world.look={neck:'creamScarf'};
 const poses=[['걷기',{motionSpeed:100,walkTime:2}],['사다리',{climbing:{},climbPhase:2}],['대시',{dodgeT:.13,dodgeFacing:1}],['일반 공격',{attackT:.19,attackLength:.38}],['모으기',{chargeHeld:true,chargeT:.6}],['내려찍기',{grounded:false,plunge:{windup:0}}],['착지 회복',{plungeLandT:.15}]];
 for(const [row,who]of['ari','popo'].entries())for(const [col,[name,extra]]of poses.entries()){
 const x=95+col*198,y=255+row*290;r.r.state.active=who;r.r.player={grounded:true,groundY:y,motionSpeed:0,walkTime:0,walkBlend:0,...extra};r.actor(who,x,y,1,true);r.text(who+' · '+name,x,y+32,15,'#24364a');
 }
 // Exercise mirrored/new equipment poses and the remaining monster states without changing the live save.
 for(const who of['ari','popo'])for(const weapon of DREAM_EQUIPMENT.ids){r.r.state.active=who;r.r.state.rpg.equipment.weapon=weapon;for(const reduced of[false,true]){r.r.settings.reducedMotion=reduced;r.ctx.save();r.ctx.translate(-5000,0);r.r.player={grounded:false,vy:400};r.actor(who,0,0,-1,true);for(const [id,spec]of Object.entries(DREAM_MOTION_ART.creatures))for(const state of[{hurt:.2},{dead:true,fade:.3},{action:'recover'},{phase:'warn',zone:{kind:'stomp',x:0}},{phase:'release',zone:{kind:'stomp',x:0}}]){r.enemy({type:['sand','crab','box','boss'].includes(id)?id:'sand',variant:['sand','crab','box','boss'].includes(id)?undefined:id,x:0,y:651,floorY:651,face:-1,phase:'rest',elapsed:1,hp:3,max:8,...state});}r.ctx.restore();}}
});await p.locator('#motionTransitions').screenshot({path:path.join(out,'motion-transitions.png')});assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'motion-result.json'),JSON.stringify({running,jumping,falling,summary,errors},null,2));console.log('PASS: actual run/jump inputs; 2 hero and 19 current/legacy monster render paths; 7 loaded atlases; no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
