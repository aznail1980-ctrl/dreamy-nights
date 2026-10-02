const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../sound-policy.js'),'utf8');
for(const kind of ['ambient','transient','absent','throw']){
 const requests=[],session=kind==='absent'?undefined:{get type(){return this.value;},set type(v){requests.push(v);if(kind==='throw'||kind==='transient'&&v==='ambient')throw Error('unsupported');this.value=v;}};
 const c=vm.createContext({navigator:{audioSession:session,userAgent:'iPhone',platform:'iPhone',maxTouchPoints:5},matchMedia:()=>({matches:true})});c.window=c;vm.runInContext(source,c);
 const s={sound:true,voice:true,volume:.3};c.DREAM_SOUND_POLICY.initialize(s);assert.equal(s.sound,false);assert.equal(s.voice,true);assert.equal(s.volume,.3);assert(!requests.includes('playback'));assert.equal(c.DREAM_SOUND_POLICY.inspect().sessionType,['ambient','transient'].includes(kind)?kind:'unsupported');
}
const desktop=vm.createContext({navigator:{userAgent:'Macintosh',platform:'MacIntel',maxTouchPoints:0},matchMedia:()=>({matches:false})});desktop.window=desktop;vm.runInContext(source,desktop);const s={sound:true};desktop.DREAM_SOUND_POLICY.initialize(s);assert(s.sound);
console.log('PASS silent mobile start even with old sound-on save; ambient/transient/unsupported session behavior; desktop unchanged');
