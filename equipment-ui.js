'use strict';
window.createDreamEquipmentUI = ({C,api,state,stats,icon,bag}) => {
    const $=id=>document.getElementById(id);
    let pose='idle',face=1;
    const poses={idle:'서 있기',walk:'걷기',jump:'점프',climb:'등반',dash:'대시',attack:'공격',charge:'모으기'};
    const gearSlots={weapon:'정화 도구',charm:'가슴 장식',keepsake:'기억 부적'};
    const lookSlots={head:'머리',neck:'목',back:'등',aura:'발자국'};
    const slot=(category,key,label,id)=>{
        const owned=category==='keeper-gear'?DREAM_GEAR.equipped(state().rpg,key):null;
        const it=C.items[id],grade=C.grades[it?.grade];
        return `<button class="keeper-slot" data-${category}="${id||''}" aria-label="${label}: ${it?.name||'비어 있음'} 변경"><span class="keeper-slot-art">${it?icon(it.icon,42):'<span aria-hidden="true">＋</span>'}</span><span><small>${label}</small><b>${owned?DREAM_GEAR.name(owned):it?.name||'장착하지 않았어요'}</b>${grade?`<em style="color:${grade.color}">${grade.symbol} ${grade.name}</em>`:'<em>선택하기</em>'}</span><span aria-hidden="true">›</span></button>`;
    };
    function details(){
        if(api.mode!=='play'&&!(api.mode==='modal'&&['characterDetail','bag','wardrobe','gearWorkshop','pets','growth'].includes(api.modalKind)))return;
        const s=state(),st=stats(),name=s.active==='ari'?'아리':'포포';
        const equippedSkill=s.growth?window.DREAM_PROGRESS.skill(s):{name:'꿈빛 파동',damage:7};
        api.openModal('characterDetail',name+'의 꿈 지킴이 수첩',`<div class="keeper-layout"><section class="keeper-preview"><span class="keeper-level">Lv. ${api.level()} · ${name}</span><canvas id="keeperPreview" width="360" height="390" role="img" aria-label="${name}의 현재 장비와 꾸미기 모습"></canvas><p class="keeper-preview-note">장착한 모습 · <span id="keeperPoseLabel">${poses[pose]}</span></p><div class="keeper-pose-buttons" role="group" aria-label="미리보기 동작">${Object.entries(poses).map(([id,label])=>`<button data-keeper-pose="${id}" aria-pressed="${id===pose}">${label}</button>`).join('')}<button id="keeperTurn" aria-label="바라보는 방향 바꾸기">방향 ↔</button></div></section><section class="keeper-information"><dl class="keeper-stats"><div><dt>마음</dt><dd>${s.hp} / ${api.maxHP()}</dd></div><div><dt>정화 위력</dt><dd>${2+st.attack}</dd></div><div><dt>${equippedSkill.name}</dt><dd>${equippedSkill.damage?equippedSkill.damage+st.skill:'보호'}</dd></div><div><dt>이동 속도</dt><dd>${Math.round(100+st.speed*100)}%</dd></div></dl><h3>장비 <small>능력을 더하는 물건</small></h3><div class="keeper-slot-list">${Object.entries(gearSlots).map(([k,label])=>slot('keeper-gear',k,label,s.rpg.equipment[k])).join('')}</div><p class="keeper-equipment-note">정화 도구는 손에 든 모습이 바뀌어요. 가슴 장식과 기억 부적은 능력에 적용돼요.</p><h3>꾸미기 <small>나만의 순찰 모습</small></h3><div class="keeper-look-list">${Object.entries(lookSlots).map(([k,label])=>slot('keeper-look',k,label,s.world.look[k])).join('')}</div><div class="keeper-actions"><button id="keeperGrowth" class="primary">꿈빛 성장 · 스킬 트리</button><button id="keeperBag" class="primary">가방 · 장비 바꾸기</button><button id="keeperWardrobe" class="secondary">순찰 옷장</button><button id="keeperPets" class="secondary">작은 꿈 친구들 · 펫 P</button></div></section></div>`,'MY DREAM KEEPER');
        const render=()=>{api.preview($('keeperPreview'),{pose,face});$('keeperPoseLabel').textContent=poses[pose];document.querySelectorAll('[data-keeper-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.keeperPose===pose)));};
        render();
        document.querySelectorAll('[data-keeper-pose]').forEach(b=>b.onclick=()=>{pose=b.dataset.keeperPose;render();});
        $('keeperTurn').onclick=()=>{face=-face;render();};
        document.querySelectorAll('[data-keeper-gear]').forEach(b=>b.onclick=()=>bag('equipment',b.dataset.keeperGear));
        document.querySelectorAll('[data-keeper-look]').forEach(b=>b.onclick=()=>api.wardrobe(b.dataset.keeperLook||undefined));
        $('keeperGrowth').onclick=()=>api.growth?.();
        $('keeperBag').onclick=()=>bag('equipment');$('keeperWardrobe').onclick=()=>api.wardrobe();$('keeperPets').onclick=()=>api.pets();
    }
    function comparison(it,selected){
        if(!it?.slot)return '';
        const before=DREAM_GEAR.stats(DREAM_GEAR.equipped(state().rpg,it.slot)),after=selected?DREAM_GEAR.stats(selected):it.stats||{};
        const names={hp:'최대 마음',attack:'정화 위력',skill:'꿈빛 파동',speed:'이동 속도',resonance:'공명 획득',dodge:'대시 회복'};
        return `<dl class="gear-comparison">${Object.keys(names).filter(k=>(before[k]||0)!==(after[k]||0)).map(k=>{const pct=['speed','resonance'].includes(k),n=v=>pct?Math.round(v*1000)/10+'%':k==='dodge'?v+'초':v;const delta=(after[k]||0)-(before[k]||0);return `<div><dt>${names[k]}</dt><dd class="${delta>0?'increase':'decrease'}">${n(before[k]||0)} → ${n(after[k]||0)} <small>(${delta>0?'+':''}${n(delta)})</small></dd></div>`;}).join('')||'<div><dt>능력 변화</dt><dd>동일해요</dd></div>'}</dl>`;
    }
    function summary(g){
        const names={hp:'최대 마음',attack:'정화 위력',skill:'꿈빛 파동',speed:'이동 속도',resonance:'공명 획득',dodge:'대시 대기 감소'};
        return Object.entries(DREAM_GEAR.stats(g)).filter(([,v])=>v).map(([k,v])=>`${names[k]} +${['speed','resonance'].includes(k)?Math.round(v*1000)/10+'%':k==='dodge'?v+'초':v}`).join(' · ')||'기본 순찰 장비';
    }
    return {details,comparison,summary};
};
