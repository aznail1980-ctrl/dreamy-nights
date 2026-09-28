'use strict';
window.createDreamRegionUI=function({C,api,state,own,add,take,icon,bag}){
    const $=id=>document.getElementById(id);
    function craft(id){
        const recipe=C.regionRecipes.find(r=>r.id===id);
        if(!recipe||state().map!==2||!state().flags.metLumen)return false;
        if(C.items[id].type==='equipment'&&own(id)>0)return false;
        if(own(id)>=999||Object.entries(recipe.cost).some(([key,n])=>own(key)<n))return false;
        for(const [key,n]of Object.entries(recipe.cost))take(key,n);
        add(id,1);api.sound('stamp');api.save();api.refresh();return true;
    }
    function workshop(){
        const allowed=state().map===2&&state().flags.metLumen;
        api.openModal('regionWorkshop','항구의 기억 공방',`<p>정화하고 되찾은 기억으로 순찰 간식과 기념품을 만들어요. ${allowed?'재료가 모이면 바로 만들 수 있어요.':'제작은 루멘 반장을 만난 뒤 항구에서 할 수 있어요.'}</p><div class="region-grid">${C.regionRecipes.map(r=>{
            const it=C.items[r.id],made=it.type==='equipment'&&own(r.id)>0,ready=allowed&&!made&&own(r.id)<999&&Object.entries(r.cost).every(([id,n])=>own(id)>=n);
            return `<article class="region-card">${icon(it.icon,70)}<h3>${it.name}</h3><p>${it.effect}</p><ul>${Object.entries(r.cost).map(([id,n])=>`<li>${C.items[id].name} <b>${own(id)} / ${n}</b></li>`).join('')}</ul><button class="primary" data-region-craft="${r.id}" ${ready?'':'disabled'}>${made?'이미 제작한 기념품':!allowed?'항구에서 제작':ready?'만들기':'재료를 더 모아주세요'}</button></article>`;
        }).join('')}</div><div class="region-actions"><button id="regionBook" class="secondary">재료를 주는 어둑이 알아보기</button><button id="regionBag" class="secondary">가방으로</button></div>`,'MEMORIES MADE USEFUL');
        document.querySelectorAll('[data-region-craft]').forEach(b=>b.onclick=()=>{craft(b.dataset.regionCraft);workshop();});
        $('regionBook').onclick=guide;$('regionBag').onclick=()=>bag();
    }
    function guide(){
        const defs={...C.regionCreatures,tideBell:{name:'조수종 소라게',map:5,material:'seaGlass',lore:'늦는 배를 기다리던 종소리를 등에 지고 있어요.',hint:'종을 흔든 뒤 느린 거품 한 발. 종소리가 멈추면 다가가요.'}};
        api.openModal('regionGuide','포근등대 생태 수첩',`<p>이곳의 어둑이는 버려진 기억과 걱정에서 태어났어요. 정화한 재료는 항구 공방에서 다시 쓸모를 찾아요.</p><div class="region-grid">${Object.entries(defs).map(([id,d])=>{
            const spec=window.DREAM_REGION_ART[id],b=spec?.frames[0]||[0,0,627,627],size=spec?.size||[1254,1254],file=id==='tideBell'?'tideBellCrabV414':id+'V415';
            const places=C.maps.filter(m=>m.enemies.some(e=>e.variant===id)).map(m=>m.name).join(' · ');
            return `<article class="region-card"><svg class="region-portrait" viewBox="${b.join(' ')}" aria-label="${d.name}"><image href="assets/${file}.png" width="${size[0]}" height="${size[1]}"/></svg><small>${places}</small><h3>${d.name}</h3><p>${d.lore}</p><p class="region-tip">${d.hint}</p><p>${icon(C.items[d.material].icon,26)} ${C.items[d.material].name} · 확률 획득</p></article>`;
        }).join('')}</div><div class="region-actions"><button id="regionCraft" class="primary">제작법 보기</button><button id="regionBag" class="secondary">가방으로</button></div>`,'THE FIRST COUNTRY · FIELD NOTES');
        $('regionCraft').onclick=workshop;$('regionBag').onclick=()=>bag();
    }
    return{craft,workshop,guide};
};
