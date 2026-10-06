'use strict';
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs');
const url=process.env.GAME_URL||'http://127.0.0.1:8773/';
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN});try{
 for(const [width,height,mobile] of [[1440,900,false],[844,390,true]]){
 const p=await b.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,soundChosen:true,voice:false,reducedMotion:true}));});
 await p.goto(url);await p.waitForFunction(()=>DreamGame?.inspect().mode==='title'&&DreamGame.inspect().lobby.ready.ari&&DreamGame.inspect().lobby.ready.popo);
 fs.mkdirSync('test-results',{recursive:true});await p.screenshot({path:`test-results/ari-proportions-title-${width}.png`});
 await p.click('#startButton');await p.click('[data-hero="ari"]');await p.screenshot({path:`test-results/ari-proportions-choice-${width}.png`});
 const bounds=await p.locator('#confirmHero').boundingBox();assert(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width+1);
 await p.evaluate(()=>{const old=DreamRenderer.prototype.actor;DreamRenderer.prototype.actor=function(...a){window.__r443=this;return old.apply(this,a)}});
 await p.click('#confirmHero');await p.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await p.click('#dialogueSkip');await p.waitForFunction(()=>window.__r443);
 const metrics=await p.evaluate(()=>{
  const r=__r443,cv=document.createElement('canvas');cv.id='proportionReview';cv.width=1440;cv.height=1120;Object.assign(cv.style,{position:'absolute',inset:'0',zIndex:999999,width:'1440px',height:'1120px'});document.body.append(cv);
  const rr=new DreamRenderer(cv,r.images,DREAM_CONTENT),c=rr.ctx;rr.r={...r.r,state:structuredClone(r.r.state),settings:{reducedMotion:true}};
  c.fillStyle='#ece2d8';c.fillRect(0,0,1440,1120);
  const poses=[['서 있기',{}],['걷기',{motionSpeed:100,walkTime:.1}],['달리기',{motionSpeed:240,walkTime:.1}],['점프',{grounded:false,vy:-300}],['등반',{climbing:{},climbPhase:.1}],['대시',{dodgeT:.18,dodgeFacing:1}],['공격',{attackT:.19,attackLength:.38}],['모으기',{chargeHeld:true,chargeT:.6}]];
  for(let i=0;i<poses.length;i++)for(let j=0;j<2;j++){
   const who=j?'popo':'ari';rr.r.state.active=who;rr.r.state.world.look={};rr.r.player={grounded:true,walkBlend:1,...poses[i][1]};
   const col=i%4,row=Math.floor(i/4),x=col*360+95+j*165,y=row*540+380;
   c.save();c.translate(x,y);c.scale(1.65,1.65);rr.actor(who,0,0,1,true);c.restore();c.fillStyle='#334956';c.font='18px sans-serif';c.fillText((j?'포포':'아리')+' · '+poses[i][0],x-64,y+38);
  }
  const posesInBounds=[];
  const a=DREAM_LOBBY_ART.ari,im=new Image();im.src=a.file;
  const expression=document.createElement('canvas');expression.width=440;expression.height=480;
  const expressionResults=[];for(const who of ['ari','popo'])for(const name of Object.keys(DreamExpressions.frames[who].emotions))expressionResults.push(DreamExpressions.draw(expression,who,name,r.images));
  return {version:DREAM_HERO_PROPORTIONS.version,files:Object.values(DREAM_ART_V49.files).filter(s=>s.includes('V443')),expressions:expressionResults,headWidths:['ari','popo'].map(who=>DREAM_ATTACHMENTS.motion[who].head.map(h=>h[2]*DREAM_MOTION_ART.hero[who].scale)),idleWidths:['ari','popo'].map(who=>DREAM_ATTACHMENTS.scalp[who].idle[2])};
 });
 assert.equal(metrics.version,'4.43.0');assert.equal(metrics.files.length,8);assert(metrics.expressions.every(Boolean));
 assert(Math.abs(metrics.idleWidths[0]-metrics.idleWidths[1])<3);
 metrics.headWidths[0].forEach((v,i)=>assert(Math.abs(v-metrics.headWidths[1][i])<7,'run/jump head widths comparable'));
 if(!mobile)await p.locator('#proportionReview').screenshot({path:'test-results/ari-proportions-poses.png'});
 await p.evaluate(()=>document.getElementById('proportionReview').remove());
 await p.click('#tagPortrait');await p.locator('[data-keeper-pose="idle"]').click();await p.screenshot({path:`test-results/ari-proportions-equipment-${width}.png`});
 for(const pose of ['walk','run','jump','climb','dash','attack','charge'])await p.locator(`[data-keeper-pose="${pose}"]`).click();
 assert.deepEqual(errors,[]);console.log('PASS',width,'title/choice, all expressions, all preview poses, comparable head widths',metrics.idleWidths);await p.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
