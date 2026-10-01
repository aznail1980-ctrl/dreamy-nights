const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={document:{hidden:false,addEventListener(){}},console};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['audio-manifest.js','combat-audio-assets.js','audio-engine.js','combat-feedback.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const meta=JSON.parse(fs.readFileSync(path.join(root,'assets/audio-v429/sources.json')));assert.equal(Object.keys(meta).length,42);
for(const [name,clip] of Object.entries(meta)){
 const data=fs.readFileSync(path.join(root,clip.file));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.readUInt32LE(24),32000);
 let offset=12,pcm;while(offset+8<data.length){const id=data.toString('ascii',offset,offset+4),n=data.readUInt32LE(offset+4);if(id==='data'){pcm=data.subarray(offset+8,offset+8+n);break;}offset+=8+n+(n%2);}
 assert(pcm);let peak=0,energy=0;for(let i=0;i<pcm.length;i+=2){const v=pcm.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(v));energy+=v*v;}assert(peak>.3&&peak<.7,name+' peak');assert(energy/(pcm.length/2)>.0001,name+' non-silent');assert(Math.abs(pcm.readInt16LE(0))<3&&Math.abs(pcm.readInt16LE(pcm.length-2))<3,name+' smooth boundaries');assert(clip.bassEnergyUnder180Hz<.01,name+' bass cap');
}
let hero='ari',time=1;const engine=new ctx.DreamAudioEngine({settings:{sound:true},getScene:()=>({hero,clock:time,playerX:0,theme:'beach'})});engine.ctx={get currentTime(){return time}};let heard=[];engine.play=(id)=>{assert(ctx.DREAM_AUDIO_ASSETS.effects[id],id);heard.push(id)};
for(hero of ['ari','popo']){
 for(const kind of ['basic','plunge','charged']){time+=1;heard=[];const f=ctx.DREAM_COMBAT.fromWeapon({hero,grade:'unique',level:5,action:kind==='basic'?'light':kind});engine.combatSwing(f);engine.impact('box',true,false,0,f);assert(heard.includes('swing-'+kind+'-'+hero));assert(heard.some(id=>id.startsWith('strike-'+kind+'-'+hero)));assert(heard.includes('grade-unique')&&heard.includes('forge-resonance'));assert(heard.every(id=>ctx.DREAM_AUDIO_ASSETS.effects[id].file.startsWith('assets/audio-v429/')),'old metal/wood mixed into player hit');}
 for(const [event,clip] of Object.entries({jump:'jump',dodge:'dodge',hurt:'hurt',chargeReady:'ready',skill:'skill',playerGuard:'guard',playerControl:'control',playerBurst:'burst',purify:'purify'})){time+=1;heard=[];engine.sfx(event);assert.deepEqual(heard,['action-'+clip+'-'+hero]);}
}
console.log('PASS 42 PCM clips, smooth boundaries and bass cap; both heroes/three attacks; no old weapon layers; 18 character action routes');
