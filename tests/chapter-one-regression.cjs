const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),c=vm.createContext({});c.window=c;
for(const n of ['story','rpg-content','world-content','remaster-content','illustrated-content','exploration-content','art-v49','art-v44','motion-assets','wear-content','loot-content','tide-content','region-art','region-content','region-layout','chapter-one','dungeon-content','equipment-art','equipment-content','pet-art','pet-system','pet-ui','gear-system','gear-ui','equipment-ui','region-ui','rpg-system','world-system','remaster-system','progression-system'])vm.runInContext(fs.readFileSync(path.join(root,n+'.js'),'utf8'),c);
const C=c.DREAM_CONTENT,plain=x=>JSON.parse(JSON.stringify(x));let count=0;
function test(name,f){f();console.log('PASS',name);count++;}
const floor=(m,p)=>p.y===651||m.platforms.some(f=>f.y===p.y&&p.x>=f.x&&p.x<=f.x+f.w);
test('All 10 maps keep their exits and all mission anchors stand on reachable surfaces',()=>{
 assert.equal(C.maps.length,10);assert.equal(C.quests.length,15);
 for(const [i,m]of C.maps.entries()){
  for(const f of m.platforms)assert(f.x>=0&&f.w>0&&f.x+f.w<=m.width,m.id+' platform');
  for(const l of m.ladders){assert(floor(m,{x:l.x,y:l.top}),m.id+' ladder top '+l.x);assert(floor(m,{x:l.x,y:l.bottom}),m.id+' ladder bottom '+l.x);}
  for(const p of [...C.objects.filter(o=>o.map===i),...m.enemies,...m.devices.filter(d=>d.kind!=='lift')]){assert(floor(m,p),m.id+' floating '+(p.id||p.kind));if(p.y!==651)assert(C.nextRouteLadder(m,{x:185,y:651},p),m.id+' unreachable '+p.id);}
  for(const e of C.exits[i])assert(e.x>=0&&e.x<=m.width&&C.exits[e.to].some(v=>v.to===i),m.id+' return exit');
 }
});
test('Former template maps now have five distinct route structures and the boss has an open arena',()=>{
 assert.equal(new Set([0,1,3,4,7].map(i=>JSON.stringify(C.maps[i].platforms))).size,5);
 assert.equal(C.maps[4].platforms.length,2);assert(!C.maps[4].devices.some(d=>['switch','lift','vent'].includes(d.kind)));
 assert(C.nextRouteLadder(C.maps[0],{x:900,y:341},{x:2700,y:341}).up===false,'disconnected ledges first descend');
});
let elements=[],body='',s,world,rpg,ended=0,pending=null,scenes=[],lastToast='';
const node=id=>elements.find(e=>e.id===id)||null;
function parse(html){body=html;elements=[];for(const m of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/g)){const a={};for(const v of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))a[v[1]]=v[2]??'';elements.push({id:a.id,dataset:Object.fromEntries(Object.entries(a).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase()),v])),disabled:Object.hasOwn(a,'disabled'),style:{},classList:{toggle(){}},children:[0,1,2].map(()=>({classList:{toggle(){}}})),querySelector(){return {textContent:''}},setAttribute(){},insertAdjacentHTML(){},textContent:''});}}
c.document={getElementById:node,querySelectorAll(sel){const m=sel.match(/^\[([\w-]+)\]$/);return m?elements.filter(e=>Object.hasOwn(e.dataset,m[1].slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase()))):[];}};
const api={get state(){return s},get enemies(){return C.maps[s.map].enemies.filter(e=>!s.killed.includes(e.id))},mode:'play',modalKind:'',player:{x:185,y:651},settings:{},maxHP:()=>6,level:()=>1,sound(){},say(){},spark(){},ring(){},floatText(){},refresh(){},preview(){},toast(t){lastToast=t},save(){},memory(id){if(!s.memories.includes(id))s.memories.push(id)},enterMap(i){s.map=i;api.mode='play'},openModal(kind,title,html){api.mode='modal';api.modalKind=kind;parse(html)},closeModal(){api.mode='play';api.modalKind='';},dialogue(key,done){assert(C.dialogue[key],key);scenes.push(key);if(pending===false){pending=done;return;}done?.();},ending(){ended++},activeQuest(){return C.quests.findIndex(q=>q.flag?!s.flags[q.flag]:q.ids.filter(id=>s.killed.includes(id)).length<q.goal)}};
rpg=c.createDreamRPG(api);Object.assign(api,{own:rpg.own,add:rpg.add,take:rpg.take,icon:rpg.icon});world=c.createDreamWorld(api);
s=world.initialize(rpg.initialize({version:4,active:'ari',map:0,x:185,y:651,flags:{},killed:[],memories:[],claimed:[],visited:[0],light:0,hp:6,xp:0,time:0}));
function kill(id){const e=C.maps.flatMap(m=>m.enemies).find(e=>e.id===id);assert(e,id);if(s.killed.includes(id))return;s.killed.push(id);rpg.rewardKill(e);}
function clear(){for(const e of C.maps[s.map].enemies.filter(e=>!e.wild))kill(e.id);}
function go(dest){for(let i=0;s.map!==dest&&i<12;i++){const ex=world.route(dest);assert(ex,'no route '+s.map+'→'+dest);world.travel(ex);}assert.equal(s.map,dest);}
function obj(id){return C.objects.find(o=>o.id===id);}
function action(npc,id){api.mode='play';rpg.npc(npc);const b=elements.find(e=>e.dataset.npcAction===id);assert(b&&!b.disabled,npc+' '+id);b.onclick();}
function click(key,value){const b=elements.find(e=>e.dataset[key]===String(value));assert(b,key+value);b.onclick();}
test('A previous-version save inside the boss room can always return to the alley',()=>{const old=s.map;s.map=4;assert(!world.gateOpen('bossReady'));const exit=world.route(3);assert(exit);world.travel(exit);assert.equal(s.map,3);s.map=old;});
test('First patrol food is recoverable; cooking is required before reading the star chart',()=>{
 assert(!world.gateOpen('bossReady'));assert.equal(C.chapterBridge.next(s),null);clear();go(1);clear();go(2);rpg.npc('lumen');assert(s.flags.metLumen);
 s.flags.tideAttuned=s.flags.windAttuned=true;world.interact(obj('starChart'));assert.equal(api.mode,'play');assert(lastToast.includes('도시락'));s.flags.tideAttuned=s.flags.windAttuned=false;
 action('madeleine','cook');for(let i=0;i<3;i++)node('cookPress').onclick();node('cookPress').onclick();assert(s.flags.cookedFirst);assert(rpg.own('lunch')>0);
});
test('Both investigation branches, wrong-input recovery and the star chart unlock the archive',()=>{
 go(6);clear();world.interact(obj('windVane0'));for(let i=0;i<3;i++)world.interact(obj('windVane1'));assert(s.flags.windAttuned);
 go(5);clear();world.interact(obj('tideBell2'));assert.equal(s.world.tideStep,0);for(const id of ['tideBell0','tideBell2','tideBell1'])world.interact(obj(id));assert(s.flags.tideAttuned);
 go(7);world.interact(obj('starChart'));click('puzzle',2);assert(!s.flags.starChartRead);for(let i=0;i<3;i++)click('puzzle',i);assert(s.flags.starChartRead);go(3);clear();go(8);clear();assert.equal(rpg.own('page'),3);
});
test('The restored letter cannot bypass the last record; the key alone cannot bypass the waterway',()=>{
 go(2);api.mode='play';rpg.npc('post');const b=elements.find(e=>e.dataset.npcAction==='letter');assert(b.disabled);assert(!s.flags.letterRead);
 go(8);world.interact(obj('archiveBook'));assert(s.flags.archiveRead);go(2);action('post','letter');assert.equal(rpg.own('page'),0);assert(s.flags.letterRead);action('lumen','truth');assert(rpg.own('warehouseKey'));assert(!world.gateOpen('bossReady'));
 go(9);world.interact(obj('waterWheel'));assert(!s.flags.bridgeOpened);clear();world.interact(obj('waterWheel'));node('openWater').onclick();assert(!s.flags.bridgeOpened);click('valve',0);click('valve',1);click('valve',1);click('valve',2);node('openWater').onclick();assert(s.flags.bridgeOpened);assert(world.gateOpen('bossReady'));
});
test('Boss journal must return home; unfinished main missions cannot silently end the chapter',()=>{
 go(4);clear();rpg.recoverJournal();assert(rpg.own('oldJournal'));rpg.ritual();assert(!s.flags.completed);go(2);action('lumen','returnJournal');assert(s.flags.journalReturned);
 s.killed=s.killed.filter(id=>id!=='sand1');api.mode='play';rpg.ritual();assert.equal(api.mode,'play');assert(lastToast.includes('첫 순찰'));kill('sand1');rpg.ritual();click('note',2);assert(!s.flags.completed);for(let i=0;i<3;i++)click('note',i);assert(s.flags.completed);assert.equal(api.activeQuest(),-1);assert.equal(ended,1);assert.equal(C.chapterBridge.next(s).npc,'madeleine');
});
test('Departure conversations advance only on completion, cannot duplicate rewards, and retain the closed-world notice',()=>{
 pending=false;action('madeleine','ovenContinue');assert(!s.flags.ovenInvitationRead);const done=pending;pending=null;done();done();assert.equal(rpg.own('ovenInvitation'),1);assert.equal(C.chapterBridge.next(s).npc,'post');
 action('post','ovenContinue');assert(s.flags.ovenParcelPacked);action('lumen','ovenContinue');assert(s.flags.ovenRouteReady);assert.equal(C.chapterBridge.next(s),null);assert(C.chapterBridge.journal(s).includes('아직 개방 전'));assert.equal(C.maps.length,10);
});
test('Existing completion saves and partially prepared departure saves retain inventory and flags',()=>{
 const raw=plain(s);c.C=C;c.GROUND=651;c.rpg=rpg;c.world=world;c.remaster=c.createDreamRemaster(api);c.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const js=fs.readFileSync(path.join(root,'game.js'),'utf8');vm.runInContext(js.slice(js.indexOf('    function defaultState()'),js.indexOf('    function loadSave()')),c);
 const restored=c.validateSave(raw);assert(restored.flags.ovenRouteReady);assert.equal(restored.rpg.inventory.ovenPass,1);assert.equal(restored.rpg.equippedUids.weapon,raw.rpg.equippedUids.weapon);
 const old=plain(raw);for(const step of C.chapterBridge.steps)delete old.flags[step.flag];const migrated=c.validateSave(old);assert(migrated.flags.completed);assert.equal(C.chapterBridge.next(migrated).npc,'madeleine');
 const partial=plain(raw);partial.flags.ovenRouteReady=false;assert.equal(C.chapterBridge.next(c.validateSave(partial)).npc,'lumen');
});
test('New upper garden saves preserve their elevation rather than falling below the mission platform',()=>{const raw=plain(s);raw.version=4;raw.map=6;raw.x=4140;raw.y=-69;const loaded=c.validateSave(raw);assert.equal(loaded.y,-69);assert.equal(loaded.map,6);});
console.log(count+' first-world route, story, ending and departure checks passed');
