const path=require('path'),fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
const base=process.env.GAME_URL||'http://127.0.0.1:8769/',root=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:true,voice:false,volume:.24}));window.__oscillators=0;const old=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){__oscillators++;return old.call(this);};});
 await p.goto(base);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title',null,{timeout:60000});
 await p.evaluate(()=>{const old=DreamAudioEngine.prototype.update;DreamAudioEngine.prototype.update=function(dt){window.__mix=this;return old.call(this,dt);};});
 await p.click('#startButton');await p.click('#confirmHero');await p.waitForFunction(()=>DreamGame.inspect().mode==='dialogue');await p.click('#dialogueSkip');await p.waitForFunction(()=>window.__mix?.buffers.size===Object.keys(DREAM_AUDIO_ASSETS.effects).length,null,{timeout:30000});
 await p.waitForFunction(()=>DreamGame.inspect().audioMix.tracks.some(t=>t.playing));
 const scene=await p.evaluate(()=>{const real=__mix.getScene;window.__actualScene=real;return real();});
 for(const theme of ['beach','trail','town','alley','boss','tide','garden','observatory','archive','waterway']){
  await p.evaluate(theme=>{__mix.getScene=()=>({...__actualScene(),mode:'play',theme});},theme);
  await p.waitForFunction(theme=>__mix.inspect().tracks.some(t=>t.theme===theme&&t.playing&&!t.failed),theme,{timeout:20000});
  await p.waitForFunction(theme=>__mix.decks.some(d=>d.theme===theme&&d.started),theme,{timeout:30000});
  assert.equal(await p.evaluate(()=>__mix.scoreTheme),theme);assert((await p.evaluate(()=>__mix.decks.length))<=2);
 }
 await p.waitForFunction(()=>__mix.decks.length===1&&__mix.decks[0].started,null,{timeout:10000});assert.equal(await p.evaluate(()=>__mix.decks.length),1);
 // A real media source feeds the music bus with non-zero samples.
 const power=await p.evaluate(async()=>{const d=__mix.decks.at(-1),a=__mix.ctx.createAnalyser();a.fftSize=1024;d.gain.connect(a);d.audio.currentTime=35;const v=new Float32Array(a.fftSize);let peak=0;for(let i=0;i<30&&peak<=.00001;i++){await new Promise(r=>setTimeout(r,100));if(!d.audio.seeking){a.getFloatTimeDomainData(v);peak=Math.max(peak,...v.map(Math.abs));}}d.gain.disconnect(a);return peak;});assert(power>.00001,'music signal');
 await p.evaluate(()=>{__mix.ducked=true;});await p.waitForTimeout(300);assert((await p.evaluate(()=>__mix.musicLevel))<.35);await p.evaluate(()=>__mix.ducked=false);
 await p.evaluate(()=>{for(const type of ['sand','crab','box','boss','shoreSnail','windMoth','parcelBat','gardenBud','inkMimic','waterOtter','tideBell'])__mix.enemy({type,x:100});});
 const cries=await p.evaluate(()=>__mix.events.filter(e=>e.sample?.startsWith('cry-')).map(e=>e.sample));assert.equal(new Set(cries).size,11);
 await p.waitForTimeout(950);await p.evaluate(()=>{for(let i=0;i<3;i++)__mix.impact('box',false,false,0);});const hits=await p.evaluate(()=>__mix.events.filter(e=>e.sample?.startsWith('hit-wood')).map(e=>e.sample));assert.equal(new Set(hits).size,3);assert.equal(await p.evaluate(()=>__oscillators),0);
 await p.evaluate(()=>__mix.getScene=__actualScene);await p.keyboard.press('Escape');await p.waitForSelector('#musicVolumeSetting');
 await p.locator('#musicVolumeSetting').evaluate(el=>{el.value=37;el.dispatchEvent(new Event('input',{bubbles:true}));});const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('dreamy-nights-settings-v1')));assert.equal(saved.musicVolume,.37);assert.equal(saved.effectsVolume,.85);assert.equal(saved.voiceVolume,1);
 await p.locator('#soundSetting').uncheck();await p.waitForTimeout(150);assert((await p.evaluate(()=>__mix.inspect().tracks)).every(t=>!t.playing));await p.locator('#soundSetting').check();await p.waitForFunction(()=>__mix.inspect().tracks.some(t=>t.playing));
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});await p.screenshot({path:path.join(root,'test-results/audio-settings.png')});
 // Exercise real voice playback independently, including cancellation and no generic fallback.
 const voice=await p.evaluate(async()=>{const api={settings:{sound:true,voice:true,volume:.24,voiceVolume:.7},duck:v=>window.__voiceDuck=v};let generic=0;speechSynthesis.speak=()=>generic++;
 const v=createDreamRemaster(api);v.readVoice('town',1,'lumen',DREAM_VOICE_SCRIPTS['town-1-lumen']);await new Promise(r=>setTimeout(r,750));const good=v.voiceStatus();v.readVoice('town',1,'madeleine','wrong speaker');await new Promise(r=>setTimeout(r,80));const wrong=v.voiceStatus();v.readVoice('ovenInvitation',0,'madeleine','새 대사');const missing=v.voiceStatus();v.stopVoice();return{good,wrong,missing,generic,duck:__voiceDuck};});
 assert.equal(voice.good.source,'character-synthesis');assert(voice.good.playing);assert.equal(voice.wrong.source,'captions');assert.equal(voice.missing.source,'captions');assert.equal(voice.generic,0);assert.equal(voice.duck,false);
 await p.goto(new URL('audio-room.html',base).href);await p.waitForSelector('#track');assert.equal(await p.locator('#track option').count(),10);await p.locator('#track').selectOption('town');await p.waitForFunction(()=>!document.querySelector('#music').paused);await p.locator('details summary').click();assert.equal(await p.locator('details li').count(),10);await p.screenshot({path:path.join(root,'test-results/audio-room.png')});
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:path.join(root,'test-results/audio-room-mobile.png')});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
 console.log('PASS 10 streamed scores and crossfades; all effect assets decoded; 11 creature voices; impact variants; 0 oscillators; music signal/duck/mute/sliders; actor matching, cancel, no generic TTS; listening room and credits');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
