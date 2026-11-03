const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),c={};c.window=c;vm.createContext(c);
const list=JSON.parse(fs.readFileSync(path.join(__dirname,'chapter-one-regression.cjs'),'utf8').match(/for\(const n of (\[[^\n]+?\])/)[1].replaceAll("'",'"'));
for(const n of [...list,'world2-content','world2-routes','world2-system'])vm.runInContext(fs.readFileSync(path.join(root,n+'.js'),'utf8'),c);
const C=c.DREAM_CONTENT,R=c.DREAM_W2_ROUTES,s={map:10,flags:{w2_madeleineStow:true},killed:[]};c.DREAM_WORLD2.initialize(s);
const onFloor=(map,x,y)=>y===651||map.platforms.some(p=>p.y===y&&x>=p.x&&x<=p.x+p.w);
for(const i of [10,12,13,14,15,16,17,18]){s.map=i;R.sync(s);const m=C.maps[i];for(const p of m.platforms)assert(p.x>=0&&p.x+p.w<=m.width);for(const l of m.ladders){assert(onFloor(m,l.x,l.top),'ladder top '+i);assert(onFloor(m,l.x,l.bottom),'ladder bottom '+i);}}
s.map=10;R.sync(s);assert(!C.maps[10].platforms.some(p=>p.dough===0));s.killed.push(C.maps[10].enemies.find(e=>e.variant==='flourPuff').id);R.sync(s);assert(C.maps[10].platforms.some(p=>p.dough===0));assert(R.jumpBoost(s,{x:1000,y:526}));assert(!R.jumpBoost(s,{x:300,y:651}));
s.map=12;R.sync(s);assert(!C.maps[12].platforms.some(p=>p.warm));s.w2.ovens=3;R.sync(s);assert(C.maps[12].platforms.some(p=>p.x===1100&&p.y===191));s.w2.ovens=4;R.sync(s);assert(C.maps[12].ladders.some(l=>l.x===820));
s.map=14;R.sync(s);assert(!R.breakSeal(s,{x:1000,y:651}),'ground attacks cannot break a high layer');assert(!R.breakSeal(s,{x:1700,y:151}),'cannot skip layers');
for(const [i,q]of R.seals.entries()){const player={x:q.x,y:q.y,grounded:true};assert(R.breakSeal(s,player));assert.equal(s.w2.cracks,i+1);assert(!player.grounded);assert(!C.maps[14].platforms.some(p=>p.seal===i));}
assert(C.maps[14].ladders.some(l=>l.x===2350));
const raw=JSON.parse(JSON.stringify(s)),restored={map:14,flags:{},killed:[]};c.DREAM_WORLD2.initialize(restored,raw);R.sync(restored);assert(!C.maps[14].platforms.some(p=>p.seal!==undefined));
console.log('PASS: reachable ladder anchors, purification creates spring route, oven circuit opens in stages, real ordered layer removal, return shortcut and reload persistence.');
const resume={map:12,flags:{},killed:[],light:0,xp:0};c.DREAM_WORLD2_CONTENT.quests.slice(0,4).forEach(q=>resume.flags[q.flag]=true);c.DREAM_WORLD2.initialize(resume,{w2:{ovens:4}});
let mode='dialogue',calls=0,callback;resume.w2.ember=10;
const api={get state(){return resume},get mode(){return mode},player:{x:800,y:191},dialogue(key,done){assert.equal(key,'w2-coldOvenAlley');calls++;callback=done;mode='dialogue'},save(){},refresh(){},add(){}};
const system=c.createDreamWorld2(api);system.tick(5);assert.equal(resume.w2.ember,10,'dialogue pauses ember timer');mode='play';system.tick(1);assert.equal(calls,1);assert.equal(resume.w2.ember,9);callback();assert(resume.flags.w2_coldOvenAlley);assert.equal(resume.light,35);system.tick(1);assert.equal(calls,1);
console.log('PASS: dialogue pauses timer; reloading after fourth oven resumes completion once without repeating route.');

s.map=15;R.sync(s);for(const q of R.recipeClues)assert(onFloor(C.maps[15],q.x,q.y));assert.equal(new Set(R.recipeClues.map(q=>q.y)).size,2);

s.map=16;s.w2.rollerProgress=0;R.sync(s);assert(!C.maps[16].platforms.some(p=>p.rolled));s.w2.rollerProgress=300;R.sync(s);assert.equal(C.maps[16].platforms.find(p=>p.rolled).w,200);s.w2.roller=true;R.sync(s);assert.equal(C.maps[16].platforms.find(p=>p.rolled).w,400);for(const q of c.DREAM_WORLD2_CONTENT.butterSpots)assert(onFloor(C.maps[16],q.x,q.y));

s.map=17;s.w2.jars=[0,0,0];R.sync(s);for(const q of c.DREAM_WORLD2_CONTENT.jarSpots)assert(onFloor(C.maps[17],q.x,q.y));assert(!C.maps[17].ladders.some(l=>l.x===1800));s.w2.jars=[2,2,2];R.sync(s);assert(C.maps[17].ladders.some(l=>l.x===1800));const savedCellar=JSON.parse(JSON.stringify(s));c.DREAM_WORLD2.initialize(s,savedCellar);R.sync(s);assert(C.maps[17].ladders.some(l=>l.x===1800),'return shortcut restored');

s.map=13;s.w2.snow=false;R.sync(s);assert(!C.maps[13].ladders.some(l=>l.x===2200));s.w2.snow=true;R.sync(s);assert(C.maps[13].ladders.some(l=>l.x===2200));assert(C.maps[13].platforms.some(p=>p.x===800&&p.y===91));
// Windmill transport is deterministic, scoped to Act2 and stops for airborne actors.
s.map=16;s.time=2;R.sync(s);assert.equal(C.maps[16].ladders.length,0);assert.equal(C.maps[16].platforms.filter(p=>p.mill!==undefined).length,4);
for(const dt of [1/120,1/60,.05]){const a=R.millPlatforms(s.time-dt)[1],b=R.millPlatforms(s.time)[1],p={x:a.x+85,y:a.y,vy:0,grounded:true};assert(R.carry(s,p,dt));assert(Math.abs(p.x-(b.x+85))<1e-8);assert(Math.abs(p.y-b.y)<1e-8);p.grounded=false;const before=[p.x,p.y];assert(!R.carry(s,p,dt));assert.deepEqual([p.x,p.y],before);}
const inactive={...s,map:2},actor={x:1460,y:631,grounded:true,vy:0};assert(!R.carry(inactive,actor,1/60));assert(!R.carry(s,actor,0));
const lap=R.millPlatforms(18),start=R.millPlatforms(0);start.forEach((p,i)=>{assert(Math.abs(p.x-lap[i].x)<1e-8);assert(Math.abs(p.y-lap[i].y)<1e-8)});
console.log('PASS windmill carry at 20/60/120Hz, full lap, airborne detach, pause and Act1 isolation; no ladders on pretzel route');
