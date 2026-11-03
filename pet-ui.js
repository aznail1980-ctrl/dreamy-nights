'use strict';
window.createDreamPetUI=({api,state,own,take,details})=>{
    const P=DREAM_PETS,$=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let selected='',notice='',happy='';
    function art(id,frame,size=150){const a=DREAM_PET_ART[id],b=a.frames[frame];return `<svg class="pet-art" width="${size}" height="${size}" viewBox="${b.join(' ')}" role="img" aria-label="${P.species[id].name}"><image href="${a.file}" width="${a.size[0]}" height="${a.size[1]}"/></svg>`;}
    function changed(message){notice=message;api.save();api.refresh();api.sound('stamp');}
    function open(id){
        if(api.mode!=='play'&&!(api.mode==='modal'&&['pets','petChoice','petHatch','characterDetail','npc'].includes(api.modalKind)))return;
        const s=state(),pets=s.pets,event=P.available(s),egg=pets.egg;
        if(id&&pets.owned.some(p=>p.species===id)){if(selected!==id)notice='';selected=id;}
        const p=selected==='egg'&&egg?null:pets.owned.find(p=>p.species===selected)||P.active(s)||pets.owned[0];if(p)selected=p.species;
        api.openModal('pets','꿈 친구 쉼터',DREAM_PET_SHELTER.view({s,p,egg,event,selected,notice,art,cookies:own('cookie')}),'함께 자라는 작은 꿈');
        document.querySelectorAll('[data-pet-pick]').forEach(b=>b.onclick=()=>open(b.dataset.petPick));
        document.querySelector('[data-pet-select-egg]')?.addEventListener('click',()=>{selected='egg';notice='';open();});
        if(p){DREAM_PET_SHELTER.preview(p,happy===p.species);happy='';}
        $('petDetails').onclick=details;
        if($('petChoose'))$('petChoose').onclick=choose;
        if(egg&&$('petWarm')){$('petWarm').onclick=()=>{if(P.feed(s,'egg',take))changed('쿠키 향을 맡고 알이 따뜻해졌어요.');open();};$('petHatch').onclick=()=>hatch(egg.species);}
        if(p){
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
        $('petLater').onclick=()=>open();$('petAccept').onclick=()=>{if(P.choose(s,choice,event)){selected='egg';changed(P.species[choice].egg+'을 품에 안았어요. 함께 꿈길을 걸어봐요.');}open();};
    }
    function hatch(id){
        if(!P.hatch(state(),id))return open();changed('안녕, '+P.species[id].name+'!');
        api.openModal('petHatch','처음 만난 작은 친구',`<div class="pet-hatch">${art(id,1,270)}<h3>${P.species[id].name}이 태어났어요!</h3><p>당신의 발소리를 기억하고 따라와요.<br>새로운 곳을 둘러보고, 간식도 나눠주세요.</p><button id="petHello" class="primary">우리 함께 가자!</button></div>`,'A NEW DREAM IS BORN');
        $('petHello').onclick=()=>open(id);
    }
    return {open,art};
};
