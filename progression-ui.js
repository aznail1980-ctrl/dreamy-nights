'use strict';
window.createDreamProgressUI = function(api) {
    const P = window.DREAM_PROGRESS, $ = id => document.getElementById(id);
    let branch = 'attack', selected = { branch: 'attack', stage: 1 }, confirming = false;
    const labels = { attack: '공격', guard: '보호', control: '제어' };
    const symbols = { attack: '✦', guard: '◇', control: '✧' };
    const traits = { attack: '세 번째 별빛', guard: '다시 일어설 용기', control: '한 걸음의 기회' };
    const traitText = { attack: '기본 정화의 세 번째 연속 공격에 위력 +1을 더해요.', guard: '마음이 40% 이하일 때 받는 피해를 한 번 절반으로 줄여요. 재사용 25초.', control: '대시 후 1.8초 안의 첫 기본 정화 사거리가 45 늘고, 적을 잠깐 느리게 해요.' };
    function description(s, b, stage) {
        const ari = s.active === 'ari';
        if (stage === 2) return traitText[b];
        if (stage === 3) return b === 'attack' ? '이 기술의 기본 위력이 7 → 10으로 올라가고 범위가 넓어져요.' : b === 'guard' ? '한 번의 피해를 막는 장막의 유지 시간이 3.5 → 5초로 늘어요.' : '이 기술의 기본 위력이 4 → 6으로 올라가고, 일반 적의 둔화가 2.2 → 3.2초로 늘어요. 보스는 0.7초예요.';
        return b === 'attack' ? (ari ? '앞쪽으로 긴 별빛을 보내요. 기본 위력 7 · 재사용 5초.' : '꿈망치로 주변 바닥에 울림을 퍼뜨려요. 기본 위력 7 · 재사용 5초.') : b === 'guard' ? '3.5초 안에 받는 피해를 한 번 막아요. 직접 피해는 없어요. 재사용 10초.' : (ari ? '가까운 어둑이를 꿈실로 묶어 2.2초 동안 느리게 해요.' : '가까운 어둑이를 밀고 2.2초 동안 느리게 해요.') + ' 기본 위력 4 · 재사용 7초. 보스의 둔화·밀림은 약해요.';
    }
    function title(s,b,stage) { return stage === 2 ? traits[b] : stage === 3 ? P.names[s.active][b] + ' · 깊은 꿈빛' : P.names[s.active][b]; }
    function open(focus) {
        if (!api.state || !['play','modal'].includes(api.mode)) return;
        const s = api.state, g = s.growth, info = P.info(s), safe = P.safe(s,api.player), b = selected.branch, stage = selected.stage;
        const known = P.learned(s,b,stage), reason = P.reason(s,b,stage), spec = P.skill(s);
        const icon = k => `<span class="growth-symbol" style="--branch:${P.colors[k]}">${symbols[k] || '✦'}</span>`;
        const nodes = P.branches.map(k => `<section class="growth-branch ${branch === k ? 'visible-branch' : ''}" aria-label="${labels[k]} 갈래" style="--branch:${P.colors[k]}"><h3>${icon(k)}${labels[k]}의 길</h3>${[1,2,3].map(n => {
            const has=P.learned(s,k,n), why=P.reason(s,k,n), active=n===2?g.passives.includes(k):g.active===k;
            return `<button id="growthNode-${k}${n}" class="growth-node ${selected.branch===k&&stage===n?'selected':''} ${has?'learned':''}" data-growth-node="${k}:${n}" aria-pressed="${selected.branch===k&&stage===n}"><span class="growth-node-tier">${n}단계 · Lv. ${[0,2,4,8][n]}</span><strong>${title(s,k,n)}</strong><small>${has?(active?'배움 · 사용 중':'배움'):why||'배울 수 있어요 · 1포인트'}</small></button>`;
        }).join('')}</section>`).join('');
        api.openModal('growth','꿈빛 성장',`<div class="growth-screen"><header class="growth-overview"><div><span class="growth-eyebrow">되찾은 기억이 나의 힘으로</span><h3>${s.active==='ari'?'아리':'포포'} <b>Lv. ${info.level}</b></h3><div class="growth-xp" role="progressbar" aria-label="다음 레벨 경험치" aria-valuenow="${info.current}" aria-valuemax="${info.total}"><i style="width:${Math.min(100,info.current/info.total*100)}%"></i></div><p>경험치 ${info.current} / ${info.total} · ${info.nextPoint?'Lv. '+info.nextPoint+'에 성장 포인트 +1':'첫 나라 성장 포인트를 모두 받았어요'}</p></div><div class="growth-point"><b>${info.available}</b><span>남은 포인트</span><small>획득 ${info.earned} · 사용 ${g.nodes.length}</small></div></header><p class="growth-intro">의뢰 완료·새 장소·기억 발견으로도 자라요. <b>스킬 1개 + 자동 특성 2개</b>를 골라 나만의 순찰을 만들어요.</p><div class="growth-layout"><div><div class="growth-branch-tabs" role="group" aria-label="성장 갈래">${P.branches.map(k=>`<button id="growthTab-${k}" data-growth-tab="${k}" aria-pressed="${branch===k}">${symbols[k]} ${labels[k]}</button>`).join('')}</div><div class="growth-tree">${nodes}</div></div><aside class="growth-detail"><div class="growth-skill-preview" data-skill="${b}" style="--branch:${P.colors[b]}"><canvas id="growthPreview" width="360" height="390" aria-label="${title(s,b,stage)} 동작 예시"></canvas><span class="growth-preview-effect" aria-hidden="true">${symbols[b]}</span></div><span class="growth-eyebrow">${stage===2?'추가 조작 없는 자동 특성':stage===3?'같은 버튼, 더 깊어진 기술':'현재 K / 스킬 버튼으로 사용'}</span><h3>${title(s,b,stage)}</h3><p>${description(s,b,stage)}</p><p class="growth-status" role="status">${known?'이미 배운 힘이에요. 아래에서 장착할 수 있어요.':reason||'배우면 성장 포인트 1개를 사용해요.'}</p><button id="growthLearn" class="primary" ${known||reason?'disabled':''}>${known?'배움 완료':'배우기 · 1포인트'}</button>${known&&stage!==2?`<button id="growthEquip" class="secondary" ${!safe||g.active===b?'disabled':''}>${g.active===b?'현재 사용 중':'이 스킬 사용하기'}</button>`:known?`<button id="growthPassive" class="secondary" ${!safe||(!g.passives.includes(b)&&g.passives.length>=2)?'disabled':''}>${g.passives.includes(b)?'이 특성 빼기':'자동 특성으로 사용'}</button>`:''}</aside></div><section class="growth-loadout"><h3>이번 순찰에 가져갈 힘</h3><div><article><small>선택 스킬 · K</small><b>${spec.name}</b><span>재사용 ${spec.cooldown}초</span></article><article><small>공명기 · F</small><b>${P.names[s.active].burst}</b><span>공명 100에서 사용</span></article>${[0,1].map(i=>`<article><small>자동 특성 ${i+1}</small><b>${traits[g.passives[i]]||'아직 비어 있어요'}</b><span>${g.passives[i]?'추가 버튼 없이 발동':'2단계에서 배워요'}</span></article>`).join('')}</div></section><footer class="growth-footer"><p>${safe?'편안한 쉼터예요. 기술 교체와 다시 배우기는 무료예요.':'기술 교체·다시 배우기는 항구나 가까운 야영지에서 할 수 있어요.'}</p><div><button id="growthBase" class="secondary" ${!safe||g.active==='base'?'disabled':''}>기본 꿈빛 파동 사용</button><button id="growthReset" class="secondary" ${!safe||!g.nodes.length?'disabled':''}>무료로 다시 배우기</button><button id="growthBack" class="secondary">캐릭터 수첩</button></div>${confirming?`<div class="growth-confirm" role="group" aria-label="성장 초기화 확인"><b>사용한 ${g.nodes.length}포인트를 모두 돌려받을까요?</b><p>배운 기술과 자동 특성이 해제돼요. 레벨·경험치·장비·펫은 유지돼요. 체력·공명·재사용 시간은 회복되지 않아요.</p><button id="growthConfirm" class="primary">포인트 돌려받기</button><button id="growthCancel" class="secondary">그대로 둘게요</button></div>`:''}</footer></div>`,'MY DREAM PATH');
        api.preview($('growthPreview'),{pose:b==='guard'?'charge':b==='control'?'dash':'attack',phase:2});
        document.querySelectorAll('[data-growth-node]').forEach(el=>el.onclick=()=>{const [k,n]=el.dataset.growthNode.split(':');selected={branch:k,stage:Number(n)};branch=k;confirming=false;open(el.id);});
        document.querySelectorAll('[data-growth-tab]').forEach(el=>el.onclick=()=>{branch=el.dataset.growthTab;selected={branch,stage:1};confirming=false;open(el.id);});
        const commit = (action,focusId) => {if(action()){api.changed();api.save();api.refresh();api.sound('memory');}open(focusId);};
        $('growthLearn').onclick=()=>commit(()=>P.learn(s,b,stage),'growthLearn');
        if($('growthEquip'))$('growthEquip').onclick=()=>commit(()=>P.equip(s,b,'active',api.player),'growthEquip');
        if($('growthPassive'))$('growthPassive').onclick=()=>commit(()=>P.equip(s,b,'passive',api.player),'growthPassive');
        $('growthBase').onclick=()=>commit(()=>P.equip(s,'base','active',api.player),'growthBase');
        $('growthReset').onclick=()=>{confirming=true;open('growthConfirm');};
        if($('growthConfirm'))$('growthConfirm').onclick=()=>{confirming=false;commit(()=>P.reset(s,api.player),'growthReset');};
        if($('growthCancel'))$('growthCancel').onclick=()=>{confirming=false;open('growthReset');};
        $('growthBack').onclick=()=>{confirming=false;api.back();};
        if(focus)$(focus)?.focus({preventScroll:true});
    }
    return {open};
};
