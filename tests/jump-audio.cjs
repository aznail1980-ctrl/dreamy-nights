const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={document:{hidden:false,addEventListener(){}},console};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['audio-manifest.js','combat-audio-assets.js','audio-engine.js','combat-feedback.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
function pcm(file){const b=fs.readFileSync(path.join(root,file));assert.equal(b.readUInt32LE(24),32000);let i=12;while(i<b.length){const size=b.readUInt32LE(i+4);if(b.toString('ascii',i,i+4)==='data'){return Array.from({length:size/2},(_,j)=>b.readInt16LE(i+8+j*2)/32768);}i+=size+8+(size%2);}throw Error('Missing PCM');}
const energy=a=>a.reduce((n,v)=>n+v*v,0)/a.length;
let hero='ari',time=1,heard=[];const engine=new ctx.DreamAudioEngine({settings:{sound:true},getScene:()=>({hero,clock:time,playerX:0})});engine.ctx={get currentTime(){return time}};engine.play=id=>heard.push(id);
for(hero of ['ari','popo']){for(const kind of ['jump','doubleJump']){
 const key=`action-${kind}-${hero}`,file=ctx.DREAM_AUDIO_ASSETS.effects[key].file,a=pcm(file),hitFile=ctx.DREAM_AUDIO_ASSETS.effects[`strike-basic-${hero}-0`].file,hit=pcm(hitFile);
 assert(!fs.readFileSync(path.join(root,file)).equals(fs.readFileSync(path.join(root,hitFile))));assert(Math.max(...a.map(Math.abs))<.53);assert(energy(a)>.01);assert(Math.abs(a[0])<.0001&&Math.abs(a.at(-1))<.0001);
 // Movement has a rounded onset; impact retains a strong immediate attack.
 assert(energy(a.slice(0,640))/energy(a)<.1,'jump should have no sharp strike transient');assert(energy(hit.slice(0,640))/energy(hit)>1,'impact transient remains distinct');
 time++;heard=[];engine.sfx(kind);assert.deepEqual(heard,[key]);
 }
 for(const action of ['light','plunge','charged']){time++;heard=[];const profile=ctx.DREAM_COMBAT.fromWeapon({hero,grade:'unique',level:5,action});engine.impact('sand',true,false,0,profile);assert(heard.some(x=>x.startsWith('strike-')));assert(!heard.some(x=>/jump/i.test(x)));assert(heard.includes('grade-unique'));}
}
engine.settings.sound=false;heard=[];time++;engine.sfx('jump');engine.sfx('doubleJump');assert.deepEqual(heard,[]);
console.log('PASS both heroes: movement-only samples, soft onset vs sharp hit, first/double jump routes, 3 attacks, grade layer, mute');
