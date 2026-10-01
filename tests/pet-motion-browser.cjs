const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),url=process.env.GAME_URL||'file://'+path.join(root,'index.html');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN});try{
 const page=await b.newPage({viewport:process.env.PET_TOUCH?{width:390,height:844}:{width:1440,height:1000},hasTouch:!!process.env.PET_TOUCH,isMobile:!!process.env.PET_TOUCH}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));});
 await page.goto(url);await page.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',{},{timeout:60000});
 await page.evaluate(()=>{const old=DreamRenderer.prototype.drawGrowthPet;window.__petFrames=[];DreamRenderer.prototype.drawGrowthPet=function(r){window.__petRenderer=this;const p=DREAM_PETS.active(r.state);if(p&&r.pet){const pose=DREAM_PET_MOTION.pose(p,r.pet,r.settings.reducedMotion);__petFrames.push({species:p.species,grown:DREAM_PETS.grown(p),kind:pose.kind,frame:pose.frame,phase:r.pet.walkPhase,x:r.pet.x,y:r.pet.y});}return old.call(this,r);};});
 await page.click('#startButton');await page.click('#confirmHero');await page.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await page.click('#dialogueSkip');await page.waitForFunction(()=>window.__petRenderer&&DreamGame.inspect().mode==='play');
 const review=await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.id='petReview';canvas.width=1280;canvas.height=990;Object.assign(canvas.style,{position:'absolute',top:0,left:0,zIndex:999999,width:'1280px',maxWidth:'100vw',height:'auto'});document.body.append(canvas);
  const r=new DreamRenderer(canvas,__petRenderer.images,DREAM_CONTENT),c=r.ctx,calls=[],draw=c.drawImage.bind(c);c.drawImage=(...args)=>{calls.push(args.slice(1));draw(...args);};
  c.fillStyle='#eee9df';c.fillRect(0,0,1280,990);c.fillStyle='#304a52';c.font='bold 22px sans-serif';c.fillText('펫 동작 · 어린 모습 / 성장한 모습',26,35);
  const labels=['걷기 1','걷기 2','걷기 3','걷기 4','대기','깜빡임','점프','인사'];c.font='16px sans-serif';labels.forEach((l,i)=>c.fillText(l,i*160+56,67));
  let row=0;const state=structuredClone(DreamGame.inspect().state),loaded=[];
  for(const species of ['leafFox','tideOtter','glowNewt'])for(const xp of [0,24]){
   const p={species,xp};state.pets.owned=[p];state.pets.active=species;const a=DREAM_PET_MOTION_ART[species];loaded.push([a.key,!!r.images[a.key],r.images[a.key]?.naturalWidth]);
   c.fillStyle='#5d6573';c.font='14px sans-serif';c.fillText(DREAM_PETS.species[species].name+' · '+(xp?'성장':'어린'),10,92+row*147);
   for(let col=0;col<8;col++){
    const body={x:0,y:0,grounded:col!==6,facing:1,recall:0,moving:col<4,walkPhase:(col+.05)/4,idleTime:col===5?a.blink-.05:0,happy:col===7?1:0};
    c.save();c.translate(col*160+100,222+row*147);c.scale(1.85,1.85);r.drawGrowthPet({state,pet:body,mode:'play',settings:{reducedMotion:false}});c.restore();
   }row++;
  }
  return {calls,loaded};
 });
 assert.equal(review.calls.length,48);assert(review.loaded.every(x=>x[1]&&x[2]>1000));assert(review.calls.every(a=>a.every(Number.isFinite)));for(let row=0;row<6;row++)assert.equal(new Set(review.calls.slice(row*8,row*8+4).map(a=>a.slice(0,4).join(','))).size,4);
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});await page.locator('#petReview').screenshot({path:path.join(root,'test-results/pet-motion-review'+(process.env.PET_TOUCH?'-touch':'')+'.png')});await page.evaluate(()=>document.getElementById('petReview').remove());
 for(const species of ['leafFox','tideOtter','glowNewt'])for(const xp of [0,24]){
  await page.evaluate(({species,xp})=>{const r=__petRenderer.r;r.state.pets.owned=[{species,xp,affinity:10,assist:0,name:DREAM_PETS.species[species].name}];r.state.pets.active=species;Object.assign(r.player,{x:350,y:651,vx:0,vy:0,grounded:true,facing:1,invincible:10});Object.assign(r.pet,{x:190,y:651,vx:0,vy:0,grounded:true,recall:0,walkPhase:0,moving:false});window.__petFrames=[];},{species,xp});
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(750);await page.keyboard.press('Space');await page.waitForTimeout(600);await page.keyboard.up('ArrowRight');await page.waitForTimeout(1200);
  const frames=await page.evaluate(()=>__petFrames);assert.equal(new Set(frames.filter(f=>f.kind==='walk').map(f=>f.frame)).size,4,species+' '+xp+' walking');assert(frames.some(f=>f.kind==='jump'),species+' jump');assert(frames.some(f=>f.kind==='idle'),species+' idle');
 }
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(1000);await page.keyboard.up('ArrowLeft');assert.equal(await page.evaluate(()=>__petRenderer.r.pet.facing),-1);await page.waitForTimeout(1000);
 await page.screenshot({path:path.join(root,'test-results/pet-motion-play'+(process.env.PET_TOUCH?'-touch':'')+'.png')});
 await page.click('#inventoryButton');await page.waitForFunction(()=>DreamGame.inspect().mode==='modal');const before=await page.evaluate(()=>__petRenderer.r.pet.walkPhase);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>__petRenderer.r.pet.walkPhase),before);
 await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);await page.screenshot({path:path.join(root,'test-results/pet-motion-mobile.png')});assert.deepEqual(errors,[]);if(process.env.PET_TOUCH)console.log('Touch viewport',await page.evaluate(()=>({coarse:matchMedia('(pointer:coarse)').matches,layout:document.querySelector('#stage').dataset.layout,width:innerWidth,height:innerHeight})));
 console.log('PASS 48 illustrated poses; 3 loaded atlases; 6 species/age play cycles; jump, idle, facing, modal pause; desktop/mobile rendering');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
