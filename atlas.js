'use strict';
/* Painted geography is presentation only. Story gates and travel remain in world-system. */
window.DreamAtlas = (() => {
    const C = window.DREAM_CONTENT;
    const art = { world: 'assets/atlas-world-v48.png', island: 'assets/atlas-island-v48.png' };
    C.mapPositions = [[22,70],[22,45],[48,42],[75,42],[85,64],[15,19],[39,18],[68,11],[86,24],[57,70]];
    const worldPositions = [[21,64],[20,24],[48,19],[53,45],[82,17],[82,49],[67,81]];
    const shortNames = ['첫잠 해변','살랑바람 길','잠의 항구','창고 골목','창고 깊은 곳','조수 동굴','바람 정원','별 관측소','순찰 기록실','등대 아래 물길'];
    const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const img = (kind, alt) => `<img class="atlas-painting" src="${art[kind]}" alt="${alt}" draggable="false">`;
    function pin(i, pos, name, {selected=false,current=false,visited=false,goal=false,world=false}={}) {
        const status = current ? '현재 위치' : visited ? '방문한 장소' : world ? '다음 이야기' : '미발견';
        return `<button class="map-pin ${selected?'selected':''} ${current?'current':''} ${visited?'visited':''} ${goal?'objective':''}" data-${world?'world':'place'}="${i}" style="left:${pos[0]}%;top:${pos[1]}%" aria-label="${i+1}. ${escape(name)} · ${status}${goal?' · 현재 목표':''}" aria-pressed="${selected}"><span class="pin-disc">${goal?'★':i+1}</span><b>${escape(name)}</b></button>`;
    }
    function island({state,selected,goal,quest,next,gateOpen}) {
        const target = goal?.map ?? quest?.map, m = C.maps[selected], known = state.visited.includes(selected);
        const paths = [];
        C.exits.forEach((exits,a) => exits.forEach(e => {
            if(a>=e.to)return;
            const [x,y]=C.mapPositions[a], [u,v]=C.mapPositions[e.to];
            paths.push(`<path d="M${x*10} ${y*6.667} Q${(x+u)*5+16} ${(y+v)*3.333-15} ${u*10} ${v*6.667}" class="${gateOpen(e.gate)?'open':'closed'}"/>`);
        }));
        return `<div class="atlas-layout"><div class="painted-atlas island-atlas">${img('island','해안과 숲, 항구, 정원, 관측소와 물길이 이어지는 첫 번째 꿈섬')}<svg class="atlas-routes" viewBox="0 0 1000 666.7" aria-hidden="true">${paths.join('')}</svg>${C.maps.map((m,i)=>pin(i,C.mapPositions[i],shortNames[i],{selected:i===selected,current:i===state.map,visited:state.visited.includes(i),goal:i===target})).join('')}<span class="atlas-water-label">잠의 바다</span></div><aside class="atlas-sidebar"><span class="atlas-kicker">첫 번째 밤 · 발견 ${state.visited.length} / ${C.maps.length}</span><label for="atlasSelect">장소 살펴보기</label><select id="atlasSelect">${C.maps.map((m,i)=>`<option value="${i}" ${i===selected?'selected':''}>${i+1}. ${escape(m.name)}${i===state.map?' · 현재':state.visited.includes(i)?' · 방문':''}</option>`).join('')}</select><div class="atlas-place-detail"><span>${escape(m.region)} · ${known?'발견한 장소':'아직 방문하지 않은 장소'}</span><h3>${escape(m.name)}</h3><p>${escape(m.description)}</p></div><button id="atlasTravel" class="primary" ${!known||!state.flags.metLumen||selected===state.map?'disabled':''}>${selected===state.map?'현재 위치':known?'이곳으로 돌아가기':'탐험해서 발견하기'}</button><div class="atlas-objective"><span>지금 할 일</span><b>${quest?escape(quest.name):'남은 기억 찾아보기'}</b><small>${quest&&target!==state.map?(next?escape(C.maps[next.to].name)+' 방면 출구로 이동해요.':'수첩에서 먼저 필요한 단서를 확인해요.'):'현재 지역에서 다음 단서를 찾아요.'}</small></div><p class="atlas-legend">금색: 현재 위치 · ★ 현재 목표<br>실선: 열린 길 · 점선: 단서가 필요한 길</p><div class="atlas-tabs"><button id="islandSea" class="secondary">세계 지도</button><button id="islandLocal" class="secondary">주변 지도</button></div></aside></div>`;
    }
    function world(state) {
        return `<div class="atlas-layout"><div class="painted-atlas sea-atlas">${img('world','잠의 바다를 둘러싼 일곱 꿈의 땅. 항구, 오븐 마을, 태엽 도시, 사막, 구름바다, 숲과 회색 정원.')} ${C.worlds.map((w,i)=>pin(i,worldPositions[i],w[0],{world:true,current:i===0,selected:i===0})).join('')}</div><aside class="atlas-sidebar"><span class="atlas-kicker">잠의 바다 · 일곱 꿈의 땅</span><label for="worldSelect">지역 살펴보기</label><select id="worldSelect">${C.worlds.map((w,i)=>`<option value="${i}">${i+1}. ${escape(w[0])}</option>`).join('')}</select><div id="seaDetail" class="atlas-place-detail" aria-live="polite"></div><div class="atlas-objective"><span>우리의 발자국</span><b>첫 번째 섬 · ${state.visited.length} / 10 장소</b><small>${state.flags.completed?'등대에 다시 빛을 밝혔어요. 남은 기억을 찾아보세요.':'꺼져가는 포근등대의 빛을 되찾는 여정이에요.'}</small></div><div class="atlas-tabs"><button id="seaIsland" class="primary">첫 번째 섬 탐험 지도</button><button id="seaLocal" class="secondary">내 주변 보기</button><button id="seaLore" class="secondary">세계의 기록</button></div></aside></div>`;
    }
    function worldDetail(i) {
        const w=C.worlds[i];
        return `<span>${i===0?'현재 탐험 중':'아직 열리지 않은 항로'}</span><h3>${escape(w[0])}</h3><p>${escape(w[4])}</p><small>${i===0?'포근등대에서 우리의 첫 순찰이 시작됩니다.':'이 지역의 이야기는 다음 밤에 이어집니다.'}</small>`;
    }
    function mini(state,target) {
        return `${img('island','')}<svg viewBox="0 0 1000 666.7" aria-hidden="true">${C.maps.map((m,i)=>{const [x,y]=C.mapPositions[i];return `<circle cx="${x*10}" cy="${y*6.667}" r="${i===state.map?24:13}" fill="${i===state.map?'#ffdf8e':state.visited.includes(i)?'#597666':'#f7ecd6'}" stroke="${i===state.map?'#fff7da':'#596b7355'}" stroke-width="7"/>${i===target?.map?`<text x="${x*10}" y="${y*6.667-32}" text-anchor="middle" fill="#594563" stroke="#fff3d4" stroke-width="3" paint-order="stroke" font-size="64">★</text>`:''}`}).join('')}</svg><span class="mini-current">${escape(shortNames[state.map])} · 현재 위치</span>`;
    }
    return Object.freeze({art,island,world,worldDetail,mini});
})();
