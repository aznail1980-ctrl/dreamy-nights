'use strict';
window.createDreamJourney=function(api){
 const C=window.DREAM_CONTENT,$=id=>document.getElementById(id),s=()=>api.state;
 const names={herb:'별잎',chest:'보물상자',treasure:'기억 상자',beacon:'길등',altar:'꿈종',tideBell:'조수종',windVane:'풍향계',starChart:'별지도',archiveBook:'순찰 기록',waterWheel:'수차'};
 function enemyTarget(ids,mapOnly){
  const options=[];C.maps.forEach((m,map)=>m.enemies.forEach(e=>{if(!e.wild&&(ids?ids.includes(e.id):map===mapOnly)&&!s().killed.includes(e.id)){
   const live=map===s().map?api.enemies.find(v=>v.id===e.id&&!v.dead):e;if(live)options.push({map,x:live.x,y:live.floorY??e.y??651,label:(C.regionCreatures?.[e.variant]?.name||(e.variant==='tideBell'?'조수종 소라게':C.creatures[e.type].name))+' 정화하기',kind:'enemy'});
  }}));return options.sort((a,b)=>(a.map===s().map?0:1)-(b.map===s().map?0:1)||Math.abs(a.x-api.player.x)-Math.abs(b.x-api.player.x))[0];
 }
 function target(){
  const q=C.quests[api.activeQuest()];if(!q)return null;
  if(q.ids)return enemyTarget(q.ids);
  if(q.npc){const n=C.npcs[q.npc];return{map:q.map,x:n.x,y:n.y,label:{cookedFirst:'마들렌과 도시락 만들기',letterRead:'뒤뚱에게 편지 조각 맡기기',readyForBoss:'루멘에게 임명장 보여주기',journalReturned:'루멘에게 순찰 일지 돌려주기'}[q.flag]||n.name+' 만나기',kind:'npc'};}
  if(['archiveRead','bridgeOpened'].includes(q.flag)){const foe=enemyTarget(null,q.map);if(foe)return foe;}
  let id={starChartRead:'starChart',archiveRead:'archiveBook',bridgeOpened:'waterWheel',completed:'dreamBell'}[q.flag];
  if(q.flag==='tideAttuned')id='tideBell'+[0,2,1][Math.min(2,s().world.tideStep||0)];
  if(q.flag==='windAttuned')id='windVane'+Math.max(0,s().world.vanes.findIndex((v,i)=>v!==[1,3,0][i]));
  const o=C.objects.find(o=>o.id===id);if(o){let label={starChart:'별지도에 두 신호 겹치기',archiveBook:'마지막 순찰 기록 읽기',waterWheel:'수차 복구하기',dreamBell:'꿈종에 기억 모으기'}[id]||names[o.kind];
   if(o.kind==='tideBell')label=['낮은 종','가운데 종','높은 종'][o.index]+' 울리기';
   if(o.kind==='windVane')label=(o.index+1)+'번째 풍향계를 '+['동','서','북'][o.index]+'쪽으로';
   return{map:o.map,x:o.x,y:o.y,label,kind:'object',id:o.id};
  }
  return{map:q.map,x:q.targetX||0,y:q.targetY??651,label:q.name,kind:'story'};
 }
 function instruction(t=target()){
  if(!t)return'자유 탐험 · 남은 기억과 부탁을 찾아보세요';
  const p=api.player;if(t.map!==s().map){const ex=api.route(t.map);return ex?(ex.x<p.x?'← ':'→ ')+C.maps[ex.to].name+' 방면 출구로':C.maps[t.map].name+' · 수첩에서 길의 단서 확인';}
  if(Math.abs(p.y-t.y)>85){const up=t.y<p.y,ls=C.maps[s().map].ladders.filter(l=>Math.abs((up?l.bottom:l.top)-p.y)<70).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x)),l=ls[0];return(l?(l.x<p.x?'← ':'→ '):'')+'사다리로 '+(up?'위층':'아래층')+' · '+t.label;}
  return(Math.abs(t.x-p.x)<(t.kind==='enemy'?165:100)?t.kind==='enemy'?'정화 · ':'상호작용 · ':t.x<p.x?'← ':'→ ')+t.label;
 }
 const foldKey='dreamy-nights-map-display-v49';let collapsed=true;
 try{collapsed=localStorage.getItem(foldKey)!=='expanded';}catch{}
 function fold(){const box=$('journeyToggle').closest('aside');box.classList.toggle('is-collapsed',collapsed);$('journeyToggle').setAttribute('aria-expanded',String(!collapsed));$('journeyToggle').setAttribute('aria-label',collapsed?'작은 지도 펼치기':'지도 접기');$('journeyChevron').textContent=collapsed?'＋':'−';}
 $('journeyToggle').onclick=()=>{collapsed=!collapsed;fold();try{localStorage.setItem(foldKey,collapsed?'collapsed':'expanded');}catch{}};fold();
 let miniKey='';
 function update(){if(!s())return;const t=target(),line=instruction(t);if($('nextAction').textContent!==line)$('nextAction').textContent=line;
  $('questCard').setAttribute('aria-label','현재 목표: '+line+' · 수첩 열기');$('questHint').textContent='수첩 열기 ↗';
  const key=s().map+':'+s().visited.join(',')+':'+t?.map;if(key===miniKey)return;miniKey=key;
  $('journeyCompactName').textContent=C.maps[s().map].name;
  const [mx,my]=C.mapPositions[s().map];$('journeyPreview').innerHTML='<img src="assets/atlas-island-v48.png" alt=""><i style="left:'+mx+'%;top:'+my+'%"></i>';
  $('journeyVisited').textContent='발견 '+s().visited.length+' / '+C.maps.length;
  $('journeyOverview').innerHTML=window.DreamAtlas.mini(s(),t);
  $('journeyOverview').setAttribute('aria-label',C.maps[s().map].name+' · 현재 위치 · 방문 '+s().visited.length+'곳 · 섬 지도 열기');
 }
 function switchTo(fn){api.closeModal();fn();}
 function seaMap(){
  api.openModal('seaMap','잠의 바다 · 일곱 꿈의 땅',window.DreamAtlas.world(s()),'THE SEA OF DREAMS');
  function detail(i){
   $('seaDetail').innerHTML=window.DreamAtlas.worldDetail(i); $('worldSelect').value=i;
   document.querySelectorAll('[data-world]').forEach(b=>{const active=Number(b.dataset.world)===i;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  }
  detail(0); document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>detail(Number(b.dataset.world)));
  $('worldSelect').onchange=e=>detail(Number(e.target.value));
  $('seaIsland').onclick=()=>switchTo(api.islandMap);$('seaLocal').onclick=()=>switchTo(localMap);$('seaLore').onclick=()=>switchTo(api.archive);
 }
 function localMap(){window.DreamNeighborhood.open(api,target(),instruction());}
 return{target,instruction,update,seaMap,localMap};
};
