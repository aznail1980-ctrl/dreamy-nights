'use strict';
window.DreamLibrary={
 open(api){
  const C=window.DREAM_CONTENT,$=id=>document.getElementById(id);let selected=0;
  const positions=[[21,64],[20,24],[48,19],[53,45],[82,17],[82,49],[67,81]];
  api.openModal('worldArchive','잠의 바다 · 꿈의 서가',`<div class="dream-library"><nav class="library-shelf" aria-label="일곱 꿈의 기록">${C.worlds.map((w,i)=>`<button class="lore-volume" data-volume="${i}" aria-pressed="${i===0}" aria-label="${w[0]} 기록 펼치기"><span class="volume-art" style="--bx:${positions[i][0]}%;--by:${positions[i][1]}%"></span><small>제${i+1}권</small><b>${w[0]}</b></button>`).join('')}</nav><article class="open-storybook" aria-live="polite"><div id="lorePages" class="lore-pages"></div><footer class="book-controls"><button id="lorePrev" class="secondary" aria-label="이전 기록">←</button><span id="lorePageNumber"></span><button id="loreNext" class="secondary" aria-label="다음 기록">→</button></footer></article></div>`,'THE LIBRARY OF DREAMS');
  function render(i){
   selected=Math.max(0,Math.min(6,i));const w=C.worlds[selected],s=api.state;
   $('lorePages').innerHTML=`<section class="book-page picture-page"><span class="book-eyebrow">DREAM JOURNAL · ${String(selected+1).padStart(2,'0')}</span><div class="book-illustration" style="--bx:${positions[selected][0]}%;--by:${positions[selected][1]}%"></div><h3>${w[0]}</h3><p class="book-theme">${w[1]}</p><small>${selected===0?(s?.flags.completed?'기록 완료 · 다시 밝힌 등대':'기록 중 · 우리의 첫 순찰'):'아직 열리지 않은 항로'}</small></section><section class="book-page written-page"><span class="book-eyebrow">섬에 남은 마음</span><p>${w[4]}</p><dl><dt>이야기의 주인공</dt><dd>${w[2]}</dd><dt>걱정의 모습</dt><dd>${w[3]}</dd></dl><div class="book-echo"><span>현실에 닿는 작은 빛</span><p>${w[5]}</p></div>${selected===0?'<p class="book-rule">걱정 속 기억을 되찾으면 꿈빛이 되어 현실의 아침을 밝혀요.</p>':'<p class="book-rule">이 이야기는 다음 순찰에서 이어져요. 지금은 첫 번째 섬의 등대를 함께 지켜주세요.</p>'}</section>`;
   document.querySelectorAll('[data-volume]').forEach(b=>{const active=Number(b.dataset.volume)===selected;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
   $('lorePrev').disabled=selected===0;$('loreNext').disabled=selected===6;$('lorePageNumber').textContent=(selected+1)+' / 7 · 꿈의 기록';
  }
  document.querySelectorAll('[data-volume]').forEach(b=>b.onclick=()=>render(Number(b.dataset.volume)));
  $('lorePrev').onclick=()=>render(selected-1);$('loreNext').onclick=()=>render(selected+1);render(0);
 }
};

window.DreamNeighborhood={
 open(api,target,instruction){
  const C=window.DREAM_CONTENT,$=id=>document.getElementById(id),s=api.state,p=api.player,m=C.maps[s.map];
  const cells=s.remaster.explored[m.id]||[],tier=y=>Math.max(0,Math.min(2,Math.round((651-y)/310))),cell=o=>tier(o.y)*10+Math.max(0,Math.min(9,Math.floor(o.x/m.width*10)));
  const names={herb:'별잎',chest:'보물상자',treasure:'기억 상자',beacon:'길등',altar:'항구 꿈종',tideBell:'조수종',windVane:'풍향계',starChart:'별지도',archiveBook:'순찰 기록',waterWheel:'꿈빛 수차'};
  const places=[...Object.entries(C.npcs).filter(([,n])=>n.map===s.map).map(([id,n])=>({...n,id,kind:'npc',label:n.name})),...C.objects.filter(o=>o.map===s.map).map(o=>({...o,label:names[o.kind]||'꿈의 흔적'})),...m.devices].filter(o=>cells.includes(cell(o))||Math.hypot(o.x-p.x,o.y-p.y)<250);
  const tiers=m.sections.map((name,i)=>`<span style="top:${(651-i*310+200)/1050*100}%">${name}</span>`).join('');
  api.openModal('localMap',m.name+' · 발자국 지도',`<div class="neighborhood-header"><p>${instruction}</p><span>탐험 ${cells.length} / 30</span></div><div class="neighborhood-layout"><div><div class="neighborhood-scroll" id="neighborhoodScroll"><div class="neighborhood-sheet" id="neighborhoodSheet"><canvas id="neighborhoodCanvas" width="1536" height="540" role="img" aria-label="${m.name}의 실제 지형, 건물, 다리, 사다리와 탐험 구역"></canvas><div class="map-strata">${tiers}</div><span class="neighborhood-player" style="left:${p.x/m.width*100}%;top:${(p.y+200)/1050*100}%" aria-label="내 위치"><img src="assets/${s.active==='ari'?'ari':'popoFrontV41'}.webp" alt=""><b>나</b></span>${target?.map===s.map?`<span class="neighborhood-target" style="left:${target.x/m.width*100}%;top:${(target.y+200)/1050*100}%" aria-label="현재 목표: ${target.label}">★</span>`:''}<span id="neighborhoodSelection" class="neighborhood-selection hidden"></span></div></div><div class="neighborhood-tools"><button id="neighborhoodZoom" class="secondary" aria-pressed="false">자세히 보기 ＋</button><span>밝은 길: 내 발자국 · 엷은 안개: 미탐험</span></div></div><aside class="neighborhood-notes"><span class="book-eyebrow">발견한 장소와 물건</span><label for="nearbySelect" class="visually-hidden">발견한 장소 선택</label><select id="nearbySelect"><option value="">내 위치</option>${places.map((o,i)=>`<option value="${i}">${o.label} · ${tier(o.y)+1}층</option>`).join('')}</select><div id="nearbyDetail"><h3>여기까지 걸어왔어요</h3><p>실제 지형에 내 발자국이 남아요. 자세히 보기로 길과 건물을 살펴보세요.</p></div><div class="neighborhood-legend"><span>● 선택한 지킴이</span><span>★ 지금 향할 곳</span><span>다리 복구 상태도 지도에 남아요.</span></div><div class="atlas-tabs"><button id="wholeAtlas" class="primary">섬 전체 지도</button><button id="localSea" class="secondary">세계 지도</button></div></aside></div>`,'A FIELD JOURNAL · YOUR FOOTSTEPS');
  api.renderer.drawExplorationMap($('neighborhoodCanvas'),s,p);
  $('nearbySelect').onchange=e=>{const o=places[Number(e.target.value)],valid=e.target.value!==''&&o;
   $('neighborhoodSelection').classList.toggle('hidden',!valid);
   if(valid){$('neighborhoodSelection').style.left=o.x/m.width*100+'%';$('neighborhoodSelection').style.top=(o.y+200)/1050*100+'%';$('nearbyDetail').innerHTML=`<h3>${o.label}</h3><p>${m.sections[tier(o.y)]}에서 찾았어요.</p><small>${o.kind==='npc'?'이곳에 가면 이야기를 나눌 수 있어요.':o.kind==='switch'?(s.remaster.devices.includes(o.id)?'다리가 펼쳐져 있어요.':'크랭크를 돌리면 접힌 다리가 펼쳐져요.'):'발견한 물건은 현장에서 상호작용할 수 있어요.'}</small>`;
   }else $('nearbyDetail').innerHTML='<h3>내 위치</h3><p>지금 남기고 있는 발자국이에요.</p>';
  };
  $('neighborhoodZoom').onclick=()=>{const on=$('neighborhoodZoom').getAttribute('aria-pressed')!=='true';$('neighborhoodZoom').setAttribute('aria-pressed',String(on));$('neighborhoodZoom').textContent=on?'전체 보기 −':'자세히 보기 ＋';$('neighborhoodSheet').classList.toggle('zoomed',on);if(on)$('neighborhoodScroll').scrollLeft=(p.x/m.width)*$('neighborhoodSheet').scrollWidth-$('neighborhoodScroll').clientWidth/2;};
  $('wholeAtlas').onclick=()=>{api.closeModal();api.islandMap()};$('localSea').onclick=()=>{api.closeModal();document.getElementById('journeyWorld').click()};
 }
};
