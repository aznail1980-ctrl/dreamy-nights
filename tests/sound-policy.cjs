const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../sound-policy.js'),'utf8');
for(const kind of ['ambient','transient','absent','throw']){
 const requests=[],session=kind==='absent'?undefined:{get type(){return this.value;},set type(v){requests.push(v);if(kind==='throw'||kind==='transient'&&v==='ambient')throw Error('unsupported');this.value=v;}};
 const c=vm.createContext({navigator:{audioSession:session,userAgent:'iPhone',platform:'iPhone',maxTouchPoints:5},matchMedia:()=>({matches:true})});c.window=c;vm.runInContext(source,c);
 for(const desired of [true,false]){const s={sound:desired,soundChosen:true};c.DREAM_SOUND_POLICY.initialize(s);assert.equal(s.sound,desired);}
 const legacy={sound:true};c.DREAM_SOUND_POLICY.initialize(legacy);assert.equal(legacy.sound,false);assert(!requests.includes('playback'));assert.equal(c.DREAM_SOUND_POLICY.inspect().sessionType,['ambient','transient'].includes(kind)?kind:'unsupported');
}
console.log('PASS remembered mobile on/off; unconfirmed legacy settings await first choice; ambient/transient/unsupported handling');
