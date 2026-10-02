'use strict';
/* First-world investigation routes. Encounter/object IDs are save-game identities. */
(() => {
 const C=window.DREAM_CONTENT;
 const layouts={
  5:{shape:'bell-loop',sections:['낮은 종의 물가','천장 종으로 오르는 암반','가운데 종의 귀환 회랑'],description:'기다리던 배의 종소리가 동굴에 갇혔어요. 길을 지키는 어둑이 둘을 정화한 뒤 낮은 종 → 높은 종 → 가운데 종 순서로 순환해 바다 신호를 되찾아요.',flag:'tideAttuned',title:'바다의 신호 · 세 종의 메아리',
   platforms:[[650,371,1550],[1800,191,1800],[2300,31,1000],[3450,371,1650]],ladders:[[850,371,651],[2050,371,651],[2000,191,371],[2450,31,191],[3150,31,191],[3500,191,371],[3750,371,651],[4700,371,651]],
   objects:{tideBell0:[1050,651],tideBell1:[4330,371],tideBell2:[2780,31],herbTide:[3350,191],tideTreasure:[4850,371]},enemies:[[1580,651],[1830,371],[2970,31],[4410,651],[4080,371]],species:['bellSentry','undertowWhelk'],cache:[3190,31],memory:[2530,31],prop:'shoreRope',decor:[[700,651],[2250,191],[4940,371]],signs:[[560,651,'바다의 신호','지킴이 둘 → 낮음 → 높음 → 가운데'],[2300,191,'천장으로 이어지는 길','위쪽 종을 울린 뒤 오른쪽 회랑으로']]},
  6:{shape:'greenhouse-rise',sections:['뿌리가 얽힌 첫 화단','풍향계의 층층 온실','꼭대기 소원 정원'],description:'다시 띄우지 못한 연의 걱정이 온실을 막았어요. 층층 화단을 올라 지킴이 둘을 정화하고 세 풍향계를 동 → 서 → 북으로 맞춰 바람 신호를 이어요.',flag:'windAttuned',title:'바람의 신호 · 층층 온실',
   platforms:[[600,471,1200],[1450,291,1350],[2250,111,1500],[3250,-69,1450],[4070,291,780]],ladders:[[800,471,651],[1600,291,471],[2450,111,291],[3450,-69,111],[4400,-69,291],[4520,291,651]],
   objects:{windVane0:[1180,471],windVane1:[2780,111],windVane2:[4140,-69],herbGarden1:[1890,291],herbGarden2:[4650,291],gardenTreasure:[4280,291]},enemies:[[1640,471],[3110,111],[1160,651],[2630,291],[3880,-69]],species:['thornMask','vaneBat'],cache:[3660,-69],memory:[4570,-69],prop:'wishPlanter',decor:[[680,471],[2060,291],[4660,-69]],signs:[[500,651,'바람의 신호','온실의 지킴이 둘 · 풍향계 동 → 서 → 북'],[3330,111,'꼭대기 정원','오른쪽 사다리는 귀환용 지름길']]},
  8:{shape:'split-stacks',sections:['반으로 갈라진 열람실','편지를 숨긴 분류 서가','서가를 잇는 기록 다락'],description:'루멘의 실수가 적힌 페이지와 도착하지 못한 답장이 갈라진 서가에 남아 있어요. 두 지킴이와 마지막 편지 조각을 찾고, 위쪽 연결 다락의 순찰 기록을 읽어요.',flag:'archiveRead',title:'잊힌 답장 · 갈라진 기록실',
   platforms:[[480,411,1420],[1080,171,1150],[2620,411,1770],[3190,111,1350],[1950,-69,1960]],ladders:[[650,411,651],[1300,171,411],[1700,171,411],[2120,-69,171],[2800,411,651],[3300,111,411],[3730,-69,111],[4240,111,411]],
   objects:{archiveBook:[3540,-69],archiveTreasure:[4390,111]},enemies:[[1510,171],[3690,411],[1060,651],[3000,411],[3150,-69]],species:['lockBook','sealRaven'],cache:[2350,-69],memory:[4050,111],prop:'archiveStack',decor:[[870,411],[2000,171],[4000,411]],signs:[[410,651,'답장을 찾는 두 갈래 길','왼쪽 기록 지킴이 · 오른쪽 마지막 편지'],[2920,651,'편지 분류 서가','봉인 까마귀를 정화하면 편지 조각 획득']]},
  9:{shape:'sluice-circuit',sections:['닫힌 저수 통로','점검교와 위쪽 우회관','항구로 돌아가는 수차대'],description:'등대를 켜도 꿈빛을 보내는 수차가 멈춰 있으면 배가 돌아오지 못해요. 점검교와 우회관에서 지킴이 둘을 정화하고 수문을 복구한 뒤 항구로 돌아가요.',flag:'bridgeOpened',title:'귀항의 길 · 수문 점검로',
   platforms:[[600,451,1600],[900,231,1050],[2700,451,2250],[3200,191,1600],[1820,11,1880]],ladders:[[800,451,651],[1200,231,451],[1900,11,231],[2800,11,451],[3400,191,451],[3450,11,191],[4630,451,651],[4720,191,451]],
   objects:{waterWheel:[4370,191]},enemies:[[1640,231],[3740,451],[1290,651],[3100,11],[4400,651]],species:['valveSentry','siltClaw'],cache:[3500,11],memory:[2140,11],prop:'canalReeds',decor:[[640,451],[2120,451],[4910,451]],signs:[[520,651,'귀항 신호를 다시 잇기','반장의 열쇠 → 지킴이 둘 → 수차 복구'],[4010,191,'항구행 수차대','수문을 맞추면 아래 항구 귀환문이 열려요']]}
 };
 const defs={
  bellSentry:['종껍질 파수꾼',5,'crab','seaGlass','wake',245,.45,1.35,260,'#86c9d1','늦는 배를 기다리던 조수종에 불안이 쌓여 딱딱한 집게를 얻었어요.','집게를 들면 거품을 준비해요. 점프로 피한 뒤 쉬는 틈을 노려요.'],
  undertowWhelk:['먹물바위 소라',5,'sand','pearlChip','rush',220,.5,1.4,240,'#8babbc','돌아오지 않을까 걱정하는 마음이 바위 소라 속에 웅크렸어요.','껍데기를 낮춘 뒤 짧게 밀고 와요. 뒤로 물러나거나 점프해요.'],
  thornMask:['가시가면 지킴이',6,'sand','roseSeed','seed',0,.65,1.4,310,'#c39989','다시 실패할까 두려운 소원이 가시를 세웠어요.','씨앗을 든 뒤 한 알만 던져요. 가까이서 정화할 틈이 있어요.'],
  vaneBat:['낡은 풍향 박쥐',6,'crab','wishWing','fan',0,.65,1.4,300,'#a6c5ab','멈춘 풍향계가 같은 자리만 맴돌던 걱정을 날개에 달았어요.','날개를 모으면 두 줄기 바람이 나와요. 예고를 보고 거리를 벌려요.'],
  lockBook:['잉크자물쇠 책',8,'box','inkPearl','double',0,.9,1.5,300,'#af9dd1','실수한 페이지를 아무에게도 보여주고 싶지 않아 책을 잠갔어요.','입을 열면 잉크 두 방울. 두 번째가 지난 뒤 다가가요.'],
  sealRaven:['봉인 종이까마귀',8,'box','parcelRibbon','hop',175,.55,1.4,240,'#c9b999','전하지 못한 답장과 붉은 봉인이 날카로운 종이 날개가 됐어요.','날개를 세운 뒤 짧게 뛰어요. 착지 뒤 빈틈을 노려요.'],
  valveSentry:['녹슨 밸브지기',9,'crab','waterCog','wake',230,.5,1.4,260,'#94bdb7','다시는 고장 내지 않으려 수문을 꽉 닫아버린 걱정이에요.','렌치팔을 들면 앞으로 밀고 와요. 남는 물방울까지 살펴요.'],
  siltClaw:['진흙집게 잠복꾼',9,'crab','waterCog','fan',0,.65,1.45,300,'#89a8bf','흘려보내지 못한 후회가 진흙과 폐관을 모아 단단해졌어요.','집게를 모은 뒤 느린 물결 둘. 뒤로 물러나 정화해요.']
 };
 for(const[id,v]of Object.entries(defs)){
  const[name,map,type,material,pattern,speed,duration,warning,range,color,lore,hint]=v;
  C.regionCreatures[id]={name,map,type,material,pattern,speed,duration,warning,range,color,lore,hint,size:98,dungeon:true};
 }
 const voices={bellSentry:['tideBell',.92],undertowWhelk:['shoreSnail',.9],thornMask:['gardenBud',.92],vaneBat:['windMoth',.88],lockBook:['inkMimic',.92],sealRaven:['parcelBat',.88],valveSentry:['crab',.9],siltClaw:['sand',.9]};
 for(const[id,[voice,voiceRate]]of Object.entries(voices))Object.assign(C.regionCreatures[id],{voice,voiceRate});
 C.regionCreatures.siltClaw.projectile='tideBubble';
 C.dungeons=layouts;
 for(const[index,l]of Object.entries(layouts)){
  const i=Number(index),m=C.maps[i];Object.assign(m,{dungeon:l.shape,sections:l.sections,description:l.description,minY:-300});
  m.platforms=l.platforms.map(([x,y,w])=>({x,y,w}));m.ladders=l.ladders.map(([x,top,bottom])=>({x,top,bottom}));
  m.bridgeGaps=[];m.bridgeX=0;
  // No repeated crank/lift/vent template: these missions use their own story mechanisms.
  m.devices=m.devices.filter(d=>['camp','cache'].includes(d.kind));
  for(const d of m.devices)[d.x,d.y]=d.kind==='camp'?[330,651]:l.cache;
  for(const o of C.objects.filter(o=>o.map===i)){const at=l.objects[o.id];if(at)[o.x,o.y]=at;else o.y=651;}
  m.enemies.forEach((e,n)=>{[e.x,e.y]=l.enemies[n];e.floorY=e.y;e.variant=l.species[n%2];e.type=C.regionCreatures[e.variant].type;});
  m.decorations=l.decor.map(([x,y])=>({kind:l.prop,x,y,width:l.prop==='archiveStack'?100:110}));
  if(m.memory){const[x,y]=l.memory;Object.assign(m.memory,{x,y:y-60,floorY:y});}
  for(const q of C.quests.filter(q=>q.flag===l.flag)){q.description=l.description;const obj=C.objects.find(o=>o.map===i&&['tideBell','windVane','archiveBook','waterWheel'].includes(o.kind));Object.assign(q,{targetX:obj.x,targetY:obj.y});}
 }
 // Local investigations can be completed in either branch order. Roamers never block a puzzle.
 C.dungeonObjective=(s,player,enemies)=>{
  const l=layouts[s.map];if(!l||s.flags[l.flag]||!s.flags.metLumen||(s.map===9&&!s.flags.readyForBoss))return null;
  const guards=enemies.filter(e=>!e.wild&&!e.dead&&!s.killed.includes(e.id));
  const done=C.maps[s.map].enemies.filter(e=>!e.wild).length-guards.length;
  if(guards.length){const e=guards.slice().sort((a,b)=>(Math.abs(a.y-player.y)*2+Math.abs(a.x-player.x))-(Math.abs(b.y-player.y)*2+Math.abs(b.x-player.x)))[0];return{map:s.map,x:e.x,y:e.floorY??e.y,label:C.regionCreatures[e.variant].name+' 정화 · 지킴이 '+done+'/2',kind:'enemy',dungeon:l.title,detail:l.description,progress:done,total:s.map===5||s.map===6?5:3};}
  let id,label;
  if(s.map===5){const index=[0,2,1][Math.min(2,s.world.tideStep||0)];id='tideBell'+index;label=['낮은 종','가운데 종','높은 종'][index]+' 울리기 · '+((s.world.tideStep||0)+1)+'/3';}
  else if(s.map===6){const index=s.world.vanes.findIndex((v,i)=>v!==[1,3,0][i]);if(index<0)return null;id='windVane'+index;label=['아래 화단','가운데 온실','꼭대기 정원'][index]+' 풍향계 → '+['동','서','북'][index];}
  else{id=s.map===8?'archiveBook':'waterWheel';label=s.map===8?'다락에서 마지막 순찰 기록 읽기':'수차에서 수문 맞추기';}
  const o=C.objects.find(o=>o.id===id);return{map:s.map,x:o.x,y:o.y,label,kind:'object',id,dungeon:l.title,detail:l.description,progress:2+(s.map===5?Math.min(2,s.world.tideStep||0):s.map===6?s.world.vanes.filter((v,i)=>v===[1,3,0][i]).length:0),total:s.map===5||s.map===6?5:3};
 };
})();
