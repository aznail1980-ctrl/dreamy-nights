const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),c=vm.createContext({});c.window=c;
for(const file of ['story','rpg-content','world-content','remaster-content','illustrated-content','exploration-content','art-v49','art-v44','motion-assets','wear-content','loot-content','tide-content','region-art','region-content','region-layout','chapter-one','dungeon-content','region-combat'])vm.runInContext(fs.readFileSync(path.join(root,file+'.js'),'utf8'),c);
const C=c.DREAM_CONTENT,seen=new Set();
for(const i of [5,6,8,9]){
 const m=C.maps[i],l=C.dungeons[i];assert.equal(m.enemies.filter(e=>!e.wild).length,2);assert.equal(new Set(m.enemies.map(e=>e.variant)).size,2);
 for(const id of l.species){assert(!seen.has(id));seen.add(id);assert.equal(C.maps.filter(m=>m.enemies.some(e=>e.variant===id)).length,1);}
 assert(new Set(m.platforms.map(p=>p.y)).size>=3);assert(!m.devices.some(d=>['switch','lift','vent'].includes(d.kind)));
 const s={map:i,flags:{metLumen:true,readyForBoss:true},killed:[],world:{tideStep:0,vanes:[0,0,0]}};
 assert.equal(C.dungeonObjective(s,{x:180,y:651},m.enemies).kind,'enemy');
 const guards=m.enemies.filter(e=>!e.wild);s.killed=guards.map(e=>e.id);
 const goal=C.dungeonObjective(s,{x:180,y:651},m.enemies);assert.equal(goal.kind,'object');assert(goal.dungeon);assert(!goal.label.includes('정화'));
 s.flags[l.flag]=true;assert.equal(C.dungeonObjective(s,{x:180,y:651},m.enemies),null);
}
for(const id of seen){
 const d=C.regionCreatures[id],e={variant:id,x:500,y:651,floorY:651,home:500,timer:0,elapsed:0,face:1,windup:0};let damage=0,shots=[],sounds=[];
 const api={player:{x:600,y:651},waves:shots,advance(e,dx){e.x+=dx},damage(n){assert.equal(n,1);damage+=n},sound(v){sounds.push(v)}};
 c.updateDreamRegionEnemy(e,1/60,api);assert(e.windup>=1.3,id+' readable warning');assert.equal(damage,0);assert.equal(shots.length,0);
 for(let n=0;n<Math.ceil((d.warning+.03)*60);n++)c.updateDreamRegionEnemy(e,1/60,api);
 assert.equal(e.action,'strike');assert.equal(sounds.length,1);
 for(let n=0;n<Math.ceil((d.duration+.02)*60);n++)c.updateDreamRegionEnemy(e,1/60,api);
 assert.equal(e.action,'recover');assert(e.actionT>1);assert(damage<=1);assert(shots.length<=2);
 assert(C.items[d.material]);const drops=C.rollDrops({id:'trial',variant:id,type:d.type,level:3},d.map,()=>0);assert(drops.some(x=>x[0]===d.material));
}
const box=C.maps[8].enemies.find(e=>e.id==='box3');assert(box&&!box.wild);assert(C.rollDrops(box,8,()=>.99).some(x=>x[0]==='page'),'story page guaranteed');
console.log('PASS four independent routes, eight exclusive species, local objectives, story-page drops, telegraph/attack/recovery and mild damage');
