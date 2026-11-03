'use strict';
window.createDreamEquipmentUI = ({C,api,state,stats,icon,bag}) => {
    const $=id=>document.getElementById(id);
    let pose='idle',face=1;
    const poses={idle:'서 있기',walk:'걷기',run:'달리기',jump:'점프',climb:'등반',dash:'대시',attack:'공격',charge:'모으기'};
    const gearSlots={weapon:'정화 도구',charm:'가슴 장식',keepsake:'기억 부적'};
    const lookSlots={head:'머리',neck:'목',back:'등',aura:'발자국'};
    const slot=(category,key,label,id)=>{
        const owned=category==='keeper-gear'?DREAM_GEAR.equipped(state().rpg,key):null;
        const it=C.items[id],grade=C.grades[it?.grade];
        const empty={weapon:'<path d="M8 4h8v5H8zM12 9v12"/>',charm:'<path d="m12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1Z"/>',keepsake:'<path d="M8 7h8l2 13H6L8 7m1 0V4h6v3"/>',head:'<path d="M3 16h18M6 16V9a6 6 0 0 1 12 0v7"/>',neck:'<path d="M6 4h12v6H6zM10 10l-2 11h5l1-11"/>',back:'<path d="M8 3h8l5 18-9-3-9 3Z"/>',aura:'<ellipse cx="8" cy="8" rx="3" ry="5"/><ellipse cx="16" cy="16" rx="3" ry="5"/>'};
        const emptyArt='<svg class="keeper-empty-icon" viewBox="0 0 24 24" aria-hidden="true">'+empty[key]+'</svg>';
        return `<button class="keeper-slot" data-keeper-slot="${key}" data-${category}="${id||''}" aria-label="${label}: ${it?.name||'비어 있음'} 변경"><span class="keeper-slot-art">${it?icon(it.icon,42):emptyArt}</span><span><small>${label}</small><b>${owned?DREAM_GEAR.name(owned):it?.name||'장착하지 않았어요'}</b>${grade?`<em style="color:${grade.color}">${grade.symbol} ${grade.name}</em>`:'<em>선택하기</em>'}</span><span aria-hidden="true">›</span></button>`;
    };
    function details(){
        if(api.mode!=='play'&&!(api.mode==='modal'&&['characterDetail','bag','wardrobe','gearWorkshop','pets','growth'].includes(api.modalKind)))return;
        const s=state(),st=stats(),name=s.active==='ari'?'아리':'포포';
        const equippedSkill=s.growth?window.DREAM_PROGRESS.skill(s):{name:'꿈빛 파동',damage:7};
        const poseButton=([id,label])=>`<button data-keeper-pose="${id}" aria-pressed="${id===pose}">${label}</button>`;
        api.openModal('characterDetail',name+'의 순찰 준비',`<div class="keeper-layout keeper-studio"><section class="keeper-preview"><div class="keeper-studio-heading"><span class="keeper-level">Lv. ${api.level()} · ${name}</span><span>부위를 눌러 바꿔보세요</span></div><div class="keeper-dressing"><div class="keeper-slot-list" aria-label="능력을 더하는 장비">${Object.entries(gearSlots).map(([k,label])=>slot('keeper-gear',k,label,s.rpg.equipment[k])).join('')}</div><div class="keeper-stage-view"><canvas id="keeperPreview" width="360" height="390" role="img" aria-label="${name}의 현재 장비와 꾸미기 모습"></canvas></div><div class="keeper-look-list" aria-label="모습을 바꾸는 꾸미기">${Object.entries(lookSlots).map(([k,label])=>slot('keeper-look',k,label,s.world.look[k])).join('')}</div></div><p class="keeper-preview-note">지금 착용한 모습 · <span id="keeperPoseLabel">${poses[pose]}</span></p><div class="keeper-pose-buttons" role="group" aria-label="미리보기 동작">${Object.entries(poses).filter(([id])=>['idle','walk','attack'].includes(id)).map(poseButton).join('')}<button id="keeperTurn" aria-label="바라보는 방향 바꾸기">방향 바꾸기</button></div><button id="keeperMotion" class="secondary keeper-motion-toggle" aria-pressed="false">동작 재생</button><details class="keeper-more-poses"><summary>다른 동작 보기</summary><div class="keeper-pose-buttons">${Object.entries(poses).filter(([id])=>!['idle','walk','attack'].includes(id)).map(poseButton).join('')}</div></details></section><section class="keeper-information"><div class="keeper-identity"><small>꿈빛 원정대 · 나의 지킴이</small><h3>${name}</h3><p>${s.active==='ari'?'작은 용기로 잊힌 마음에 빛을 건네는 지킴이':'호기심과 꿈망치로 새로운 길을 여는 지킴이'}</p></div><dl class="keeper-stats"><div><dt>마음</dt><dd>${s.hp} / ${api.maxHP()}</dd></div><div><dt>정화 힘</dt><dd>${2+st.attack}</dd></div><div><dt>이동 속도</dt><dd>${Math.round(100+st.speed*100)}%</dd></div><div><dt>강화 재료</dt><dd>${s.rpg.fragments||0}</dd></div></dl><div class="keeper-current-skill"><small>지금 쓰는 기술</small><b>${equippedSkill.name}</b><span>${equippedSkill.damage?'정화 힘 '+(equippedSkill.damage+st.skill):'나를 보호하는 기술'}</span></div><p class="keeper-equipment-note"><b>장비</b>는 힘을 더하고, <b>꾸미기</b>는 모습을 바꿔요.<br>무기는 손에 든 모습도 달라져요.</p><div class="keeper-actions"><button id="keeperBag" class="primary">장비 고르기</button><button id="keeperGrowth" class="secondary">스킬 배우기</button></div></section></div>`,'순찰 준비실');
        const render=()=>{window.DREAM_KEEPER_MOTION.mount({canvas:$('keeperPreview'),button:$('keeperMotion'),read:()=>({pose,face}),preview:api.preview,reduced:()=>!!api.reducedMotion});$('keeperPoseLabel').textContent=poses[pose];document.querySelectorAll('[data-keeper-pose]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.keeperPose===pose)));};
        const revealPreview=()=>$('keeperPreview')?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});
        render();
        document.querySelectorAll('[data-keeper-pose]').forEach(b=>b.onclick=()=>{pose=b.dataset.keeperPose;render();revealPreview();});
        $('keeperTurn').onclick=()=>{face=-face;render();revealPreview();};
        document.querySelectorAll('[data-keeper-gear]').forEach(b=>b.onclick=()=>bag('equipment',b.dataset.keeperGear,'all',b.dataset.keeperSlot));
        document.querySelectorAll('[data-keeper-look]').forEach(b=>b.onclick=()=>api.wardrobe(b.dataset.keeperLook||undefined,b.dataset.keeperSlot,'all'));
        $('keeperGrowth').onclick=()=>api.growth?.();
        $('keeperBag').onclick=()=>bag('equipment');
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
