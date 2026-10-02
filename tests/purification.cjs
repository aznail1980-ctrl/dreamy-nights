const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const c=vm.createContext({});c.window=c;c.DREAM_MOTION_ART={creatures:Object.fromEntries(['sand','crab','box','boss','shoreSnail','windMoth','parcelBat','gardenBud','inkMimic','waterOtter','tideBell','bellSentry','undertowWhelk','thornMask','vaneBat','lockBook','sealRaven','valveSentry','siltClaw'].map(id=>[id,{key:id+'-original'}]))};
vm.runInContext(fs.readFileSync(root+'/purification.js','utf8'),c);const P=c.DREAM_PURIFICATION;
c.DREAM_MOTION_ART.creatures.sand={key:'angry'};assert.equal(P.forms.sand.key,'sand-original');
for(const id of [...Object.keys(P.forms),...Object.keys(P.returns)]){
 const e={variant:id,type:id==='boss'?'boss':'sand',x:80,y:421,face:-1,dead:true,knockV:100,hurt:.3,airFall:true,windup:1,action:'strike'};
 assert.equal(P.begin(e),2.8);assert.equal(e.knockV,0);assert.equal(e.action,null);assert(P.forms[e.purification.form]);assert.equal(e.purification.form,id);assert(e.purification.message);
 const start=P.pose(e);assert.equal(start.dark,1);assert.equal(start.gentle,0);
 P.tick(e,.6);const calm=P.pose(e);assert.equal(calm.dark,0);assert.equal(calm.gentle,1);assert(calm.bow>0);assert.equal(calm.x,80);assert.equal(calm.face,-1);assert.equal(e.y,421);
 const reduced=P.pose(e,true);assert.equal(reduced.bow,0);assert.equal(reduced.rise,0);
 P.tick(e,1.85);const goodbye=P.pose(e);assert(goodbye.gentle<1&&goodbye.gentle>0);assert(goodbye.rise>0);
 P.tick(e,.5);assert.equal(e.fade,0);assert.equal(P.pose(e),null);
}
assert.equal(P.pose({dead:true,fade:0}),null,'loaded completed enemies stay hidden');
console.log('PASS original art capture, 19 current/legacy mappings, calm hold, farewell, reduced motion and saved-dead absence');

const messages=new Set();for(let i=0;i<5;i++){const e={type:'sand',x:0,y:0};P.begin(e);messages.add(e.purification.message);}assert(messages.size>=3);
