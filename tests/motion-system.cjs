const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../motion-system.js'),'utf8'),c);const M=c.window.DREAM_MOTION;
const p={grounded:true,motionSpeed:250};assert.deepEqual([0,1,2,3].map(i=>M.heroFrame({...p,walkTime:i*Math.PI/2})),[0,1,2,3]);
assert.equal(M.heroFrame({...p,motionSpeed:0}),-1);
for(const [vy,frame]of[[-450,4],[0,5],[450,6]])assert.equal(M.heroFrame({...p,grounded:false,vy}),frame);
for(const extra of[{climbing:true},{dodgeT:.1},{attackT:.1},{plunge:{}},{chargeHeld:true,chargeT:.4}])assert.equal(M.heroFrame({...p,...extra}),-1);
assert.equal(M.heroFrame({...p,motionSpeed:0,landSquash:.1}),7);
for(const id of ['sand','crab','box','boss','shoreSnail','windMoth','parcelBat','gardenBud','inkMimic','waterOtter','tideBell']){
 const e={type:id==='boss'?'boss':'sand',variant:id==='boss'?undefined:id,x:12,phase:'rest',elapsed:0};M.track(e,.1,0);assert.equal(e.face,1);const phase=e.walkPhase;M.track(e,.1,12);assert.equal(e.walkPhase,phase);assert.equal(e.motionSpeed,0);
 e.x=0;M.track(e,.1,12);assert.equal(e.face,-1);e.windup=.3;e.x=10;M.track(e,.1,0);assert.equal(e.face,-1);assert.equal(e.motionSpeed,0);assert(M.enemyFrame(e,false)!==undefined,id);
}
const e={airFall:true,y:460,floorY:651};let last=e.y;M.falling(e,1/60);assert(e.y<465,'no snap to floor');for(let i=0;i<50;i++){M.falling(e,1/60);assert(e.y>=last&&e.y<=651);last=e.y;}assert.equal(e.y,651);assert(!e.airFall);
assert.equal(M.enemyFrame({type:'boss',phase:'warn',zone:{kind:'stomp'}},false),4);assert.equal(M.enemyFrame({type:'boss',phase:'release',zone:{kind:'sneeze'}},false),3);
console.log('PASS motion rules: heroes, all 11 monsters, direction locking, idle feet, interrupted fall and boss poses');
