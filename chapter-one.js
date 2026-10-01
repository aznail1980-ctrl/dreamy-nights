'use strict';
/* Authored first-world routes and the optional, post-ending departure preparation. */
(() => {
 const C=window.DREAM_CONTENT;
 const layouts={
  0:{sections:['별조개가 밀려오는 해안','끊어진 조개 절벽','밀물 전망대'],description:'해안에서 첫 걱정을 정화하고, 떨어진 절벽을 지상으로 돌아 올라가요. 동쪽 전망대와 젖은 답장은 선택 탐험이에요.',platforms:[[560,341,1080],[2170,341,1420],[2590,31,780]],lower:[720,1400,2400,3320],upper:[2780,3160],devices:{camp:[330,651],cache:[3200,31]}},
  1:{sections:['별잎이 자라는 숲길','세 갈래 연의 언덕','바람이 머무는 나뭇가지'],description:'세 개의 언덕을 오가며 정화하고 별잎을 모아요. 중앙 상승 바람과 나무 위 기억을 찾거나, 지상의 갈림길로 정원에 갈 수 있어요.',platforms:[[430,341,900],[1660,341,950],[2930,341,920],[1840,31,540]],lower:[620,1120,1850,2380,3140,3620],upper:[2000,2200],devices:{camp:[330,651],cache:[2140,31],vent:[1800,651]}},
  3:{sections:['짐을 내려놓는 골목','화물 연결교','편지 보관 다락'],description:'화물 사이의 연결교를 복구하고 두 편지 조각을 찾아요. 골목 중앙의 옆문은 마지막 조각과 순찰 기록이 있는 기록실로 이어져요.',platforms:[[420,341,920],[1510,341,1380],[3100,341,1000],[1730,31,770],[3250,31,680]],lower:[650,1190,1770,2600,3330,3900],upper:[1950,2280,3450,3780],gaps:[[1340,341,170],[2890,341,210]],devices:{camp:[330,651],cache:[3500,31],switch:[1260,341],lift:[3800,651]}},
  4:{sections:['먼지 쌓인 입구','걱정과 마주하는 넓은 마루','숨을 고르는 양쪽 선반'],description:'중앙의 넓은 마루에서 먼지대장의 예고를 보고 피하세요. 양쪽 선반은 숨을 고르는 선택 공간이며, 정화 후에는 일지를 들고 루멘에게 돌아가요.',platforms:[[420,341,640],[2380,341,480]],lower:[560,920,2510,2740],upper:[],devices:{camp:[330,651],cache:[2660,341]}},
  7:{sections:['조용한 관측소 뜰','돔을 둘러싼 회랑','두 신호를 겹치는 관측대'],description:'전투 없는 관측소예요. 중앙 돔으로 올라 바다와 바람의 신호를 별지도에 겹치면, 닫힌 창고로 가는 옛 순찰길을 찾을 수 있어요.',platforms:[[880,341,1960],[1370,31,1160]],lower:[1100,1700,2620],upper:[1550,2350],devices:{camp:[330,651],cache:[1510,31],lift:[2400,651]},objects:{starChart:[2020,31]}}
 };
 function ground(m,p,margin=65){
  if(p.y<650&&!m.platforms.some(s=>s.y===p.y))p.y=m.platforms.length?341:651;
  C.onSurface(m,p,margin);return p;
 }
 for(const [index,l] of Object.entries(layouts)){
  const i=Number(index),m=C.maps[i];Object.assign(m,{sections:l.sections,description:l.description});
  m.platforms=l.platforms.map(([x,y,w])=>({x,y,w}));m.ladders=l.lower.map(x=>({x,top:341,bottom:651})).concat(l.upper.map(x=>({x,top:31,bottom:341})));
  m.bridgeGaps=(l.gaps||[]).map(([x,y,w])=>({x,y,w}));m.bridgeX=m.bridgeGaps[0]?.x||0;
  m.devices=m.devices.filter(d=>l.devices[d.kind]);
  for(const d of m.devices){[d.x,d.y]=l.devices[d.kind];if(d.kind==='lift')Object.assign(d,{top:31,bottom:651});else ground(m,d,85);}
  for(const o of C.objects.filter(o=>o.map===i)){if(l.objects?.[o.id])[o.x,o.y]=l.objects[o.id];ground(m,o,85);}
  for(const e of m.enemies){ground(m,e,110);e.floorY=e.y;}
  for(const d of m.decorations)ground(m,d,65);
  if(m.memory){const p=ground(m,{x:m.memory.x,y:31},70);Object.assign(m.memory,{x:p.x,y:p.y-60,floorY:p.y});}
 }
 // Preserve all story IDs, item rewards and exit coordinates so old saves can resume.
 for(const q of C.quests){const object=C.objects.find(o=>({starChartRead:'starChart',archiveRead:'archiveBook',bridgeOpened:'waterWheel',completed:'dreamBell'})[q.flag]===o.id);if(object)Object.assign(q,{targetX:object.x,targetY:object.y});}
 C.quests.find(q=>q.flag==='letterRead').description='창고 골목 두 조각과 기록실 한 조각을 뒤뚱에게 맡겨요.';
 C.items.page.effect='창고 골목 2조각 + 기록실 1조각 → 뒤뚱에게 전달';
 C.chapterBridge={steps:[
  {npc:'madeleine',flag:'ovenInvitationRead',scene:'ovenInvitation',item:'ovenInvitation',label:'마들렌에게 오븐 마을의 초대장 받기'},
  {npc:'post',flag:'ovenParcelPacked',scene:'ovenParcel',item:'ovenParcel',label:'뒤뚱과 초대장의 배달 주소 확인하기'},
  {npc:'lumen',flag:'ovenRouteReady',scene:'ovenRoute',item:'ovenPass',label:'루멘과 다음 항로의 출항 준비 마치기'}
 ],next(s){return s.flags.completed?this.steps.find(v=>!s.flags[v.flag])||null:null;},target(s){const step=this.next(s);if(!step)return null;const n=C.npcs[step.npc];return{map:2,x:n.x,y:n.y,label:step.label,kind:'npc',npc:step.npc};}};
 for(const [id,name,icon,lore,effect] of [
  ['ovenInvitation','버터 향이 남은 초대장','letter','“예쁘게 굽지 못해도 다시 와 주세요.” 마들렌이 오래 접어 둔 제과 대회 초대장. 등대가 켜진 밤에 다시 펼쳤다.','뒤뚱과 몽글 오븐 마을의 주소 확인'],
  ['ovenParcel','다시 굽는 약속 꾸러미','lunch','빈 레시피 쪽지와 초대장을 한데 묶었다. 완벽한 빵보다 다시 구워 볼 용기를 가져가려 한다.','루멘에게 보여주고 다음 항로 준비'],
  ['ovenPass','몽글 항로 준비표','compass','바다와 바람의 신호, 귀항 길과 순찰 도시락을 확인한 기록. 다음 밤의 항해를 기다린다.','출항 준비 완료 · 다음 세계는 아직 개방 전']
 ])C.items[id]={name,icon,lore,effect,type:'story',rarity:'이야기',grade:'common'};
 Object.assign(C.dialogue,{
  ovenInvitation:[['madeleine','등대가 다시 켜지니, 접어 둔 이 초대장도 읽어 볼 마음이 생기는구나.\n몽글 오븐 마을에서 열린 제과 대회 초대장이란다.'],['madeleine','한 번 빵을 태운 뒤로 다시 가는 게 두려웠어.\n그런데 오늘 너희를 보니, 서툰 시작도 버릴 필요는 없겠더구나.'],['ari','다시 구워 보면 되죠. 그 마음을 함께 가져갈게요.'],['madeleine','고맙구나. 초대장 뒷면의 글씨가 번졌으니, 뒤뚱에게 주소를 확인해 주겠니?']],
  ovenParcel:[['post','버터 향이 남은 초대장이네요! 받는 곳은… 몽글 오븐 마을, 다시굽는 광장!\n이번에는 이름도 주소도 제대로 읽었어요.'],['post','초대장과 빈 레시피 쪽지를 꾸러미에 묶어 둘게요.\n정답을 가져가는 여행이 아니라, 새로 적어 보는 여행이군요.'],['ari','반장님께 돌아가 항로를 확인할게요. 이번에도 무사귀환!']],
  ovenRoute:[['lumen','바다와 바람의 신호, 다시 도는 수차… 너희가 복구한 길이\n이제 다음 꿈섬으로 향하는 기준이 되었구나.'],['lumen','몽글 오븐 마을에서 찾을 것은 완벽한 빵이 아니란다.\n실패한 뒤에도 다시 굽고 싶은 마음을 살펴보렴.'],['madeleine','도시락은 내가 맡으마. 나도 내 레시피의 다음 줄을 적어 볼게.'],['narrator','몽글 항로의 출항 준비를 마쳤습니다.\n다음 세계의 문이 열리기 전까지, 잠의 항구에서 남은 기억을 찾아보세요.']]
 });
 C.remoteScenes.push('ovenInvitation','ovenParcel');
})();
// Optional departure steps are kept separate from the 15 first-night quest indices.
DREAM_CONTENT.chapterBridge.journal=function(s){
 if(!s.flags.completed)return '';
 const done=s.flags.ovenRouteReady;
 return `<section class="departure-journal"><span>첫 번째 밤 이후</span><h3>${done?'몽글 항로 · 출항 준비 완료':'다음 밤을 준비하는 마음'}</h3><p>등대를 밝힌 용기가 마들렌에게도 닿았어요. 오래 접어 둔 제과 대회 초대장을 함께 펼쳐요.</p><ol>${this.steps.map(step=>`<li class="${s.flags[step.flag]?'done':''}">${s.flags[step.flag]?'✓':'○'} ${step.label}</li>`).join('')}</ol><small>현재는 출항 준비 이야기까지 플레이할 수 있어요. 몽글 오븐 마을의 실제 맵과 전투는 아직 개방 전이에요.</small></section>`;
};
// Follow authored platforms through ladder connections, including a descent around a gap.
DREAM_CONTENT.nextRouteLadder=function(map,player,target){
 const floors=[{x:0,y:651,w:map.width},...map.platforms];
 const at=p=>floors.findIndex(f=>Math.abs(f.y-p.y)<70&&p.x>=f.x-5&&p.x<=f.x+f.w+5);
 const start=at(player),end=at(target);if(start<0||end<0||start===end)return null;
 const graph=floors.map(()=>[]);
 for(const l of map.ladders){const a=at({x:l.x,y:l.bottom}),b=at({x:l.x,y:l.top});if(a<0||b<0)continue;graph[a].push({to:b,ladder:l,up:true});graph[b].push({to:a,ladder:l,up:false});}
 for(let a=0;a<floors.length;a++)for(let b=a+1;b<floors.length;b++)if(floors[a].y===floors[b].y&&Math.max(floors[a].x,floors[b].x)<=Math.min(floors[a].x+floors[a].w,floors[b].x+floors[b].w)) {graph[a].push({to:b});graph[b].push({to:a});}
 const seen=new Set([start]),queue=[{node:start,first:null}];
 while(queue.length){const cur=queue.shift();if(cur.node===end)return cur.first;for(const e of graph[cur.node].sort((a,b)=>Math.abs((a.ladder?.x??player.x)-player.x)-Math.abs((b.ladder?.x??player.x)-player.x))){if(seen.has(e.to))continue;seen.add(e.to);queue.push({node:e.to,first:cur.first||(e.ladder?e:null)});}}
 return null;
};
DREAM_CONTENT.dialogue.relight.push(['narrator','같은 시각, 현실의 누군가가 오래 덮어 둔 일기장을 펼쳤습니다.\n서툴렀던 첫날 옆에, 내일 해 보고 싶은 일을 한 줄 적었습니다.']);
