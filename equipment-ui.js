'use strict';
window.createDreamEquipmentUI = ({C,api,state,stats,icon,bag}) => {
    const $=id=>document.getElementById(id);
    let pose='idle',face=1;
    const poses={front:'앞모습',idle:'서 있기',walk:'걷기',run:'달리기',jump:'점프',climb:'등반',dash:'대시',attack:'공격',charge:'모으기'};
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
        const growth=DREAM_PROGRESS.attributeInfo(s),a=growth.values;
        const attrRows=[['heart','마음','최대 마음 +1'],['power','정화 힘','일반 공격 +4%'],['focus','기술 위력','기술 보너스 +5%']].map(([key,label,effect])=>`<div class="attribute-row"><span><b>${label} <em>+${a[key]}</em></b><small>${effect} / 1포인트</small></span><button data-attribute="${key}" aria-label="${label} 1포인트 배분" ${growth.available?'':'disabled'}>＋</button></div>`).join('');
        api.openModal('characterDetail',name+'의 순찰 준비',`<div class="keeper-layout keeper-studio"><section class="keeper-preview"><div class="keeper-studio-heading"><span class="keeper-level">Lv. ${api.level()} · ${name}</span><span>장비를 눌러 변경</span></div><div class="keeper-dressing"><div class="keeper-slot-list">${Object.entries(gearSlots).map(([k,label])=>slot('keeper-gear',k,label,s.rpg.equipment[k])).join('')}</div><div class="keeper-stage-view"><canvas id="keeperPreview" width="360" height="390" role="img" aria-label="${name}의 현재 장비 착용 모습"></canvas><img id="keeperFront" src="assets/${s.active==='ari'?'ariPortraitV443.png':'popoFrontV41.webp'}" alt="${name}의 기본 의상 정면 원화" hidden></div><div class="keeper-look-list">${Object.entries(lookSlots).map(([k,label])=>slot('keeper-look',k,label,s.world.look[k])).join('')}</div></div><p class="keeper-preview-note" id="keeperPoseLabel"></p><div class="keeper-view-controls"><select id="keeperPoseSelect" aria-label="캐릭터 모습 선택">${Object.entries(poses).map(([id,label])=>`<option value="${id}" ${pose===id?'selected':''}>${label}</option>`).join('')}</select><button id="keeperTurn" class="secondary">방향 ↔</button><button id="keeperMotion" class="secondary">동작 재생</button></div></section><section class="keeper-information"><div class="keeper-identity"><h3>${name} <small>Lv. ${api.level()}</small></h3></div><dl class="keeper-stats"><div><dt>마음</dt><dd>${Number(s.hp.toFixed(1))} / ${api.maxHP()}</dd></div><div><dt>정화 힘</dt><dd>${Number((2+st.attack).toFixed(2))}</dd></div></dl><section class="attribute-panel" aria-label="레벨 능력치 배분"><header><b>능력 키우기</b><strong id="attributePoints">남은 ${growth.available}점</strong></header>${attrRows}<button id="attributeReset" class="text-button" ${Object.values(a).some(Boolean)?'':'disabled'}>무료로 다시 배분</button></section><div class="keeper-actions"><button id="keeperBag" class="primary">장비 고르기</button><button id="keeperGrowth" class="secondary">스킬 배우기</button></div></section></div>`,'순찰 준비실');
        const render=()=>{const front=pose==='front';$('keeperFront').hidden=!front;$('keeperPreview').style.visibility=front?'hidden':'visible';$('keeperTurn').disabled=front;window.DREAM_KEEPER_MOTION.mount({canvas:$('keeperPreview'),button:$('keeperMotion'),read:()=>({pose,face}),preview:api.preview,reduced:()=>!!api.reducedMotion});$('keeperPoseLabel').textContent=front?'앞모습 · 기본 의상 원화':'현재 장비 착용 · '+poses[pose];};
        document.querySelector('.keeper-actions').append($('attributeReset'));
        render();$('keeperPoseSelect').onchange=e=>{pose=e.target.value;render();};$('keeperTurn').onclick=()=>{face=-face;render();};
        document.querySelectorAll('[data-attribute]').forEach(b=>b.onclick=()=>{if(!DREAM_PROGRESS.allocateAttribute(s,b.dataset.attribute))return;api.save();api.refresh();details();});
        $('attributeReset').onclick=()=>{DREAM_PROGRESS.resetAttributes(s);s.hp=Math.min(s.hp,api.maxHP());api.save();api.refresh();details();};
        document.querySelectorAll('[data-keeper-gear]').forEach(b=>b.onclick=()=>bag('equipment',b.dataset.keeperGear,'all',b.dataset.keeperSlot));
        document.querySelectorAll('[data-keeper-look]').forEach(b=>b.onclick=()=>api.wardrobe(b.dataset.keeperLook||undefined,b.dataset.keeperSlot,'all'));
        $('keeperGrowth').onclick=()=>api.growth?.();$('keeperBag').onclick=()=>bag('equipment');
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
