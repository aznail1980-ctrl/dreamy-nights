'use strict';
(()=>{
 window.DreamAtlas={...window.DreamAtlas};
 const original=DreamAtlas.mini;
 function localTarget(s,target){if(!target||target.map===s.map)return target;const seen=new Set([s.map]),queue=[{map:s.map,first:null}];while(queue.length){const n=queue.shift();if(n.map===target.map)return n.first?{...n.first,map:s.map,label:'다음 지역 출구'}:null;for(const e of DREAM_CONTENT.exits[n.map]||[]){if(seen.has(e.to)||(e.gate&&!s.flags[e.gate]))continue;seen.add(e.to);queue.push({map:e.to,first:n.first||e});}}return null;}
 function terrain(s,target){target=localTarget(s,target);const m=DREAM_CONTENT.maps[s.map],x=v=>v/m.width*1000,y=v=>(v+300)/1000*600;return '<svg viewBox="0 0 1000 660" role="img" aria-label="현재 지역의 실제 발판과 사다리"><rect width="1000" height="660" fill="#634831"/>'+m.platforms.map(p=>`<path d="M${x(p.x)} ${y(p.y)}h${x(p.w)}" stroke="${p.seal!==undefined?'#ffc667':p.dough!==undefined?'#fff3bf':'#e6c698'}" stroke-width="14"/>`).join('')+m.ladders.map(l=>`<path d="M${x(l.x)} ${y(l.top)}V${y(l.bottom)}" stroke="#fff4d6" stroke-width="4" stroke-dasharray="5 7"/>`).join('')+`<circle cx="${x(s.x)}" cy="${y(s.y??651)-15}" r="14" fill="#fff5a5"/>`+(target?`<text x="${x(target.x)}" y="${y(target.y)-20}" fill="#ffe391" font-size="36">★</text>`:'')+'</svg>';}
 DreamAtlas.mini=(s,t)=>s.map>=10?terrain(s,t):original(s,t);
 const detail=DreamAtlas.worldDetail;
 DreamAtlas.worldDetail=(i,s)=>i===1?'<span>'+(s.flags.ovenRouteReady?'항로 개방':'첫 번째 밤 이후 출항 준비')+'</span><h3>몽글 오븐 마을</h3><p>봉순과 마들렌의 잊힌 약속을 따라 다시 굽는 용기를 찾아요.</p><small>'+(s.flags.ovenRouteReady?'잠의 항구 왼쪽 몽글 항로 포털에서 출항할 수 있어요.':'포근등대의 이야기를 마친 뒤 마들렌, 뒤뚱, 루멘과 출항을 준비하세요.')+'</small>':detail(i,s);
 const sea=DreamAtlas.world;DreamAtlas.world=s=>sea(s).replace('첫 번째 섬 탐험 지도','현재 지역 탐험 지도').replace('출항 준비를 마쳤어요. 다음 항로가 열리기 전까지 남은 기억을 찾아보세요.','잠의 항구에서 몽글 오븐 마을로 출항할 수 있어요.');
 const positions=[[20,77],[49,54],[16,45],[84,31],[82,74],[43,18],[70,12],[51,84],[82,47],[39,33]];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const base=DreamAtlas.island;
 DreamAtlas.island=function(args){
  const {state:s,gateOpen}=args;if(s.map<10)return base(args);
  const selected=args.selected>=10&&args.selected<20?args.selected:s.map,m=DREAM_CONTENT.maps[selected],goal=DREAM_WORLD2.target(s),known=s.visited.includes(selected);
  const links=[];
  for(let a=10;a<20;a++)for(const e of DREAM_CONTENT.exits[a]){
   if(e.to<10||e.to<=a)continue;
   const [x,y]=positions[a-10],[u,v]=positions[e.to-10];
   links.push(`<path d="M${x*10} ${y*6.667} L${u*10} ${v*6.667}" class="${gateOpen(e.gate)?'open':'closed'}"/>`);
  }
  const pins=DREAM_CONTENT.maps.slice(10).map((m,i)=>{const id=i+10,current=id===s.map,visited=s.visited.includes(id),target=id===goal?.map;return `<button class="map-pin ${current?'current':''} ${visited?'visited':''} ${id===selected?'selected':''} ${target?'objective':''}" data-place="${id}" style="left:${positions[i][0]}%;top:${positions[i][1]}%" aria-label="${esc(m.name)} · ${current?'현재 위치':visited?'방문한 곳':'아직 방문하지 않은 곳'}${target?' · 다음 목표':''}" aria-pressed="${id===selected}"><span class="pin-disc">${target?'★':id-9}</span><b>${esc(m.name)}</b></button>`;}).join('');
  return `<div class="atlas-layout w2-region-layout"><div class="w2-region-scroll" tabindex="0" aria-label="몽글 오븐 마을 지도 · 옆으로 밀어 다른 지역 보기"><div class="painted-atlas w2-region-atlas"><img class="atlas-painting" src="assets/world2/atlas-island-w2.png" alt="반죽 언덕에 둘러싸인 몽글 오븐 마을. 중앙 광장, 북쪽 풍차와 지하 저장고·초코 동굴." draggable="false"><svg class="atlas-routes" viewBox="0 0 1000 666.7" aria-hidden="true">${links.join('')}</svg>${pins}</div></div><aside class="atlas-sidebar"><span class="atlas-kicker">두 번째 밤 · 발견 ${s.visited.filter(i=>i>=10&&i<20).length} / 10</span><label for="atlasSelect">지역 살펴보기</label><select id="atlasSelect">${DREAM_CONTENT.maps.slice(10).map((m,i)=>`<option value="${i+10}" ${i+10===selected?'selected':''}>${i+1}. ${esc(m.name)}${i+10===s.map?' · 현재':s.visited.includes(i+10)?' · 방문':''}</option>`).join('')}</select><div class="atlas-place-detail"><span>${selected===s.map?'현재 위치':known?'방문한 곳':'앞으로 탐험할 곳'}</span><h3>${esc(m.name)}</h3><p>${esc(m.description)}</p></div><button id="atlasTravel" disabled>이동은 연결된 포털로</button><p class="atlas-legend">★ 다음 목표 · 금색 현재 위치<br>실선 열린 길 · 점선 단서가 필요한 길<br>지도를 밀거나 지역 목록으로 살펴보세요.<br>선착장 왼쪽 포털로 잠의 항구에 돌아가요.</p><div class="atlas-tabs"><button id="islandSea" class="secondary">세계 지도</button><button id="islandLocal" class="secondary">내 주변 보기</button></div></aside></div>`;
 };
})();
