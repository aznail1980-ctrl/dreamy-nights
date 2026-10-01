'use strict';
window.createDreamPetUI=({api,state,own,take,details})=>{
    const P=DREAM_PETS,$=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let selected='',notice='',happy='';
    function art(id,frame,size=150){const a=DREAM_PET_ART[id],b=a.frames[frame];return `<svg class="pet-art" width="${size}" height="${size}" viewBox="${b.join(' ')}" role="img" aria-label="${P.species[id].name}"><image href="${a.file}" width="${a.size[0]}" height="${a.size[1]}"/></svg>`;}
    function changed(message){notice=message;api.save();api.refresh();api.sound('stamp');}
    function open(id){
        if(api.mode!=='play'&&!(api.mode==='modal'&&['pets','petChoice','petHatch','characterDetail','npc'].includes(api.modalKind)))return;
        const s=state(),pets=s.pets,event=P.available(s),egg=pets.egg;
        if(id&&pets.owned.some(p=>p.species===id))selected=id;
        const p=pets.owned.find(p=>p.species===selected)||P.active(s)||pets.owned[0];if(p)selected=p.species;
        api.openModal('pets','작은 꿈 친구들',`<div class="pet-intro"><span>항구에서 구조한 꿈의 알</span><p>루멘 반장이 맡긴 작은 생명과 첫 번째 밤을 여행해요. 선택한 펫 한 마리만 곁에서 도와줘요.</p></div><p class="forge-notice" role="status">${esc(notice||'알은 함께 탐험하면 깨어나고, 펫은 모험과 간식으로 자라요.')}</p>${egg?`<section class="pet-nest">${art(egg.species,0,140)}<div><small>함께 기다리는 시간</small><h3>${P.species[egg.species].egg}</h3><progress max="8" value="${egg.warmth}" aria-label="부화 준비도"></progress><p>온기 ${egg.warmth} / 8 · 새로운 장소 +3, 처음 정화한 몬스터 +1</p><div class="pet-actions"><button id="petWarm" ${egg.warmth>=8||own('cookie')<1?'disabled':''}>쿠키 한 개 나누기 · 온기 +2</button><button id="petHatch" class="primary" ${egg.warmth<8?'disabled':''}>${egg.warmth>=8?'알에서 소리가 들려요!':'조금 더 기다려요'}</button></div><small>쿠키 ${own('cookie')}개 · 같은 장소나 몬스터로는 온기가 중복되지 않아요.</small></div></section>`:''}${event?'<button id="petChoose" class="pet-event primary">✦ 반장이 맡긴 꿈의 알 · 직접 선택하기</button>':!egg&&!pets.owned.length?'<p class="pet-locked">항구에서 루멘 반장을 만나면 첫 꿈의 알을 선택할 수 있어요.</p>':''}${p?`<div class="pet-layout"><section class="pet-portrait">${art(p.species,P.grown(p)?(happy===p.species?5:3):1,240)}<h3>${esc(p.name)}</h3><span>${P.grown(p)?'자란 친구':'아기 친구'} · Lv. ${P.level(p)}</span><small>${P.species[p.species].nature}</small></section><section class="pet-growth"><h3>함께한 발자국</h3><label>성장 ${p.xp} / 60<progress max="60" value="${p.xp}" aria-label="펫 성장"></progress></label><p>${P.grown(p)?'어른 모습으로 자랐어요. 최대 5레벨까지 함께 성장해요.':'성장 24를 모으면 어른 모습으로 자라요.'}</p><label>친밀도 ${p.affinity} / 100<progress max="100" value="${p.affinity}" aria-label="펫 친밀도"></progress></label><p class="pet-help">${P.species[p.species].help}<br><small>함께 처음 정화한 몬스터만 세어요. 현재 ${p.assist} / 5</small></p><div class="pet-actions"><button id="petFollow" class="primary">${pets.active===p.species?'둥지에서 쉬기':'함께 여행하기'}</button><button id="petFeed" ${own('cookie')<1||(p.xp>=60&&p.affinity>=100)?'disabled':''}>쿠키 주기 · 성장 +4</button></div><small>쿠키 ${own('cookie')}개 · 간식을 주면 친밀도도 8 올라요.</small><form id="petNameForm" class="pet-name"><label for="petName">부를 이름</label><input id="petName" maxlength="24" value="${esc(p.name)}" autocomplete="off"><button type="submit">이름 저장</button></form></section></div><div class="pet-collection" aria-label="나의 펫">${pets.owned.map(x=>`<button data-pet-pick="${x.species}" aria-pressed="${x.species===selected}">${art(x.species,P.grown(x)?3:1,78)}<b>${esc(x.name)}</b><small>${pets.active===x.species?'함께 여행 중':'둥지에서 쉬는 중'}</small></button>`).join('')}</div>`:''}<p class="pet-next">알 선물: 루멘과 첫 만남 · 장소 6곳 탐험 · 첫 번째 밤 이야기 완료. 서로 다른 세 친구를 차례로 만날 수 있어요.</p><button id="petDetails" class="secondary">캐릭터 수첩으로</button>`,'A LITTLE FRIEND, A SHARED DREAM');
        $('petDetails').onclick=details;
        if($('petChoose'))$('petChoose').onclick=choose;
        if(egg){$('petWarm').onclick=()=>{if(P.feed(s,'egg',take))changed('쿠키 향을 맡고 알이 따뜻해졌어요.');open();};$('petHatch').onclick=()=>hatch(egg.species);}
        if(p){
            document.querySelectorAll('[data-pet-pick]').forEach(b=>b.onclick=()=>open(b.dataset.petPick));
            $('petFollow').onclick=()=>{P.select(s,pets.active===p.species?null:p.species);changed(pets.active?p.name+'과 함께 떠나요.':'친구가 둥지에서 편히 쉬어요.');open();};
            $('petFeed').onclick=()=>{const baby=!P.grown(p);if(P.feed(s,p.species,take)){happy=p.species;api.petReaction?.();changed(baby&&P.grown(p)?p.name+'이 훌쩍 자랐어요!':p.name+'이 쿠키를 맛있게 먹었어요.');}open();};
            $('petNameForm').onsubmit=e=>{e.preventDefault();if(P.rename(s,p.species,$('petName').value))changed('새 이름을 기억했어요.');else notice='친구를 부를 이름을 적어주세요.';open();};
        }
    }
    function choose(){
        const s=state(),event=P.available(s);if(!event)return open();
        const ids=Object.keys(P.species).filter(id=>!s.pets.owned.some(p=>p.species===id));let choice=ids[0];
        api.openModal('petChoice','어떤 꿈을 함께 돌볼까요?',`<p>루멘 반장: “이 작은 알들은 꿈길에서 길을 잃었단다. 마음이 가는 친구와 함께 걸어보렴.”</p><div class="pet-choices">${ids.map(id=>`<button data-pet-egg="${id}" aria-pressed="${id===choice}">${art(id,0,142)}<h3>${P.species[id].egg}</h3><small>${P.species[id].place}의 친구</small><p>${P.species[id].nature}</p><b>${P.species[id].help}</b></button>`).join('')}</div><p>직접 고른 알을 받아 부화할 때까지 돌봐요. 다른 친구는 다음 탐험 선물에서 만날 수 있어요.</p><div class="pet-actions"><button id="petAccept" class="primary">이 알과 함께하기</button><button id="petLater" class="secondary">조금 더 생각하기</button></div>`,'A GIFT FROM CAPTAIN LUMEN');
        document.querySelectorAll('[data-pet-egg]').forEach(b=>b.onclick=()=>{choice=b.dataset.petEgg;document.querySelectorAll('[data-pet-egg]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.petEgg===choice)));});
        $('petLater').onclick=()=>open();$('petAccept').onclick=()=>{if(P.choose(s,choice,event))changed(P.species[choice].egg+'을 품에 안았어요. 함께 꿈길을 걸어봐요.');open();};
    }
    function hatch(id){
        if(!P.hatch(state(),id))return open();changed('안녕, '+P.species[id].name+'!');
        api.openModal('petHatch','처음 만난 작은 친구',`<div class="pet-hatch">${art(id,1,270)}<h3>${P.species[id].name}이 태어났어요!</h3><p>당신의 발소리를 기억하고 따라와요.<br>새로운 곳을 둘러보고, 간식도 나눠주세요.</p><button id="petHello" class="primary">우리 함께 가자!</button></div>`,'A NEW DREAM IS BORN');
        $('petHello').onclick=()=>open(id);
    }
    return {open,art};
};
