'use strict';
window.createDreamProgressUI = function(api) {
    const P = window.DREAM_PROGRESS, $ = id => document.getElementById(id);
    let selected = { branch: 'attack', stage: 1 }, confirming = false, mobileDetail = false, treeScroll = 0;
    const labels = { attack: '공격', guard: '보호', control: '제어' };
    const hints = { attack: '힘차게 정화해요', guard: '내 마음을 지켜요', control: '적을 느리게 해요' };
    const tiers = ['','기술 배우기','자동 특성','기술 강화'];
    const art = (s,b,n,extra='') => `<span class="st-art ${extra}" aria-hidden="true" style="--icon-x:${(P.branches.indexOf(b)+(s.active==='popo'?3:0))*20}%;--icon-y:${(n-1)*50}%"></span>`;
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
        const reopening=api.mode==='modal'&&!!document.querySelector('.st-screen');
        if(!reopening){mobileDetail=false;confirming=false;treeScroll=0;}
        const scroll=reopening?$('modalContent').scrollTop:0;
        const s=api.state,g=s.growth,info=P.info(s),safe=P.safe(s,api.player),b=selected.branch,stage=selected.stage;
        const known=P.learned(s,b,stage),reason=P.reason(s,b,stage),spec=P.skill(s);
        const nodeStatus=(k,n)=>{
            const has=P.learned(s,k,n),active=n===2?g.passives.includes(k):g.active===k;
            return has?(active?'사용 중':'배웠어요'):!P.reason(s,k,n)?'배울 수 있어요':info.level<[0,2,4,8][n]?'Lv. '+[0,2,4,8][n]+' 필요':!P.learned(s,k,n-1)&&n>1?'앞 단계 필요':'포인트 필요';
        };
        const nodes=P.branches.map(k=>`<section class="st-branch" aria-label="${labels[k]}의 길" style="--branch:${P.colors[k]}"><button id="growthTab-${k}" class="st-branch-title" data-growth-tab="${k}"><b>${labels[k]}의 길</b><small>${hints[k]}</small></button><ol>${[1,2,3].map(n=>{
            const has=P.learned(s,k,n),ready=!has&&!P.reason(s,k,n),active=has&&(n===2?g.passives.includes(k):g.active===k),isSelected=b===k&&stage===n;
            const status=nodeStatus(k,n),nodeTitle=n===3?'깊은 꿈빛':title(s,k,n);
            return `<li class="${has?'is-learned':''} ${ready?'is-ready':''}"><button id="growthNode-${k}${n}" class="st-node ${isSelected?'is-selected':''} ${has?'is-learned':''} ${ready?'is-ready':''} ${!has&&!ready?'is-locked':''}" data-growth-node="${k}:${n}" aria-pressed="${isSelected}" aria-label="${labels[k]} ${n}단계, ${title(s,k,n)}, ${status}"><span class="st-medallion">${art(s,k,n)}<span class="st-seal" aria-hidden="true">${has?'✓':ready?'+':'◇'}</span></span><span class="st-node-name">${nodeTitle}</span><span class="st-node-state">${status}</span><span class="st-tier">${n} · ${tiers[n]}</span></button>${n<3?`<span class="st-link ${P.learned(s,k,n+1)?'lit':has?'next':''}" aria-hidden="true"><i></i><b>⌄</b></span>`:''}</li>`;
        }).join('')}</ol></section>`).join('');
        const learnLabel=known?'배움 완료':reason?'아직 배울 수 없어요':'이 힘 배우기 · 1포인트';
        api.openModal('growth','꿈빛 스킬 트리',`<div class="growth-screen st-screen" data-view="${mobileDetail?'detail':'tree'}"><header class="st-overview"><div class="st-level"><b>${s.active==='ari'?'아리':'포포'} <em>Lv. ${info.level}</em></b><div class="growth-xp" role="progressbar" aria-label="다음 레벨 경험치" aria-valuenow="${info.current}" aria-valuemax="${info.total}"><i style="width:${Math.min(100,info.current/info.total*100)}%"></i></div><small>경험치 ${info.current} / ${info.total}</small></div><p>그림을 눌러 힘을 살펴보세요.<br><span>스킬 1개 · 자동 특성 2개를 사용할 수 있어요.</span></p><div class="st-points"><b>${info.available}</b><span>배울 포인트</span></div></header><div class="st-layout"><section class="st-map" aria-label="세 갈래 성장 지도"><div class="st-root"><span>✦</span><b>나의 꿈빛</b><small class="st-direction-desktop">위에서 아래로 이어서 배워요</small><small class="st-direction-touch">왼쪽에서 오른쪽으로 배워요 →</small></div><div class="st-fork" aria-hidden="true"></div><div class="st-tree">${nodes}</div><div class="st-legend"><span>＋ 배울 수 있음</span><span>✓ 배운 힘</span><span>◇ 아직 잠김</span></div><p class="st-next-point">${info.nextPoint?'Lv. '+info.nextPoint+'에 성장 포인트를 1개 더 받아요.':'첫 나라의 성장 포인트를 모두 받았어요.'}</p></section><aside class="st-detail" aria-label="선택한 스킬 상세" style="--branch:${P.colors[b]}"><button id="growthTreeBack" class="secondary st-tree-back">← 스킬 트리로</button><div class="st-detail-visual">${art(s,b,stage)}<canvas id="growthPreview" width="360" height="390" aria-label="${s.active==='ari'?'아리':'포포'}의 ${title(s,b,stage)} 자세"></canvas></div><span class="st-detail-kind">${labels[b]}의 길 · ${stage}단계 · ${tiers[stage]}</span><h3>${title(s,b,stage)}</h3><p class="st-description">${description(s,b,stage)}</p><div class="st-requirements"><span>Lv. ${[0,2,4,8][stage]}</span><span>${stage===1?'첫 번째 힘':stage===2?'앞의 기술 필요':'앞의 자동 특성 필요'}</span></div><p id="growthStatus" class="st-status" role="status" tabindex="-1">${known?(stage===2?(g.passives.includes(b)?'자동으로 발동하고 있어요.':'배운 특성이에요. 아래에서 사용할 수 있어요.'):(g.active===b?'현재 스킬 버튼으로 사용하는 힘이에요.':'배운 기술이에요. 아래에서 사용할 수 있어요.')):reason||'성장 포인트 1개로 배울 수 있어요.'}</p><div class="st-actions"><button id="growthLearn" class="primary" ${known||reason?'disabled':''}>${learnLabel}</button>${known&&stage!==2?`<button id="growthEquip" class="secondary" ${!safe||g.active===b?'disabled':''}>${g.active===b?'현재 사용 중':'이 스킬 사용하기'}</button>`:known?`<button id="growthPassive" class="secondary" ${!safe||(!g.passives.includes(b)&&g.passives.length>=2)?'disabled':''}>${g.passives.includes(b)?'이 특성 빼기':'자동 특성으로 사용'}</button>`:''}</div>${known&&!safe?'<small class="st-safe-note">힘 바꾸기는 항구나 야영지에서 할 수 있어요.</small>':''}</aside></div><details class="st-loadout"><summary>지금 쓰는 힘 · ${spec.name}</summary><div><article><small>선택 스킬 · S</small><b>${spec.name}</b><span>재사용 ${spec.cooldown}초</span></article><article><small>공명기 · F</small><b>${P.names[s.active].burst}</b><span>공명 100에서 사용</span></article>${[0,1].map(i=>`<article><small>자동 특성 ${i+1}</small><b>${traits[g.passives[i]]||'아직 비어 있어요'}</b><span>${g.passives[i]?'추가 버튼 없이 발동':'2단계에서 배워요'}</span></article>`).join('')}</div></details><footer class="growth-footer st-footer"><p>${safe?'이 쉼터에서는 힘을 바꾸거나 포인트를 돌려받을 수 있어요.':'항구나 야영지에서 힘 바꾸기·무료 다시 배우기를 할 수 있어요.'}</p><div><button id="growthBase" class="secondary" ${!safe||g.active==='base'?'disabled':''}>기본 꿈빛 파동 사용</button><button id="growthReset" class="secondary" ${!safe||!g.nodes.length?'disabled':''}>무료로 다시 배우기</button><button id="growthBack" class="secondary">캐릭터 수첩</button></div>${confirming?`<div class="growth-confirm" role="group" aria-label="성장 초기화 확인"><b>사용한 ${g.nodes.length}포인트를 모두 돌려받을까요?</b><p>배운 기술과 자동 특성이 해제돼요. 레벨·경험치·장비·펫은 유지돼요. 체력·공명·재사용 시간은 회복되지 않아요.</p><button id="growthConfirm" class="primary">포인트 돌려받기</button><button id="growthCancel" class="secondary">그대로 둘게요</button></div>`:''}</footer></div>`,'MY DREAM PATH');
        api.preview($('growthPreview'),{pose:b==='guard'?'charge':b==='control'?'dash':'attack',phase:2});
        const choose=(k,n,id)=>{treeScroll=$('modalContent').scrollTop;selected={branch:k,stage:n};mobileDetail=true;confirming=false;open(id);if(matchMedia('(pointer:coarse)').matches){$('modalContent').scrollTop=0;$('growthTreeBack').focus({preventScroll:true});}};
        document.querySelectorAll('[data-growth-node]').forEach(el=>{
            el.onclick=()=>{const [k,n]=el.dataset.growthNode.split(':');choose(k,Number(n),el.id);};
            el.onkeydown=e=>{const [k,n]=el.dataset.growthNode.split(':'),col=P.branches.indexOf(k),row=Number(n);let next;
                const horizontal=matchMedia('(pointer:coarse)').matches;
                const across=e.key==='ArrowLeft'||e.key==='ArrowRight',down=e.key==='ArrowUp'||e.key==='ArrowDown';
                if(across||down){const delta=['ArrowLeft','ArrowUp'].includes(e.key)?-1:1;
                    next=across===horizontal?'growthNode-'+k+Math.max(1,Math.min(3,row+delta)):'growthNode-'+P.branches[Math.max(0,Math.min(2,col+delta))]+row;
                }
                if(next){e.preventDefault();e.stopPropagation();$(next)?.focus();}
            };
        });
        document.querySelectorAll('[data-growth-tab]').forEach(el=>el.onclick=()=>choose(el.dataset.growthTab,1,el.id));
        $('growthTreeBack').onclick=()=>{mobileDetail=false;open('growthNode-'+selected.branch+selected.stage);$('modalContent').scrollTop=treeScroll;};
        const commit=(action,focusId)=>{if(action()){api.changed();api.save();api.refresh();api.sound('memory');}open(focusId);};
        $('growthLearn').onclick=()=>commit(()=>P.learn(s,b,stage),'growthLearn');
        if($('growthEquip'))$('growthEquip').onclick=()=>commit(()=>P.equip(s,b,'active',api.player),'growthEquip');
        if($('growthPassive'))$('growthPassive').onclick=()=>commit(()=>P.equip(s,b,'passive',api.player),'growthPassive');
        $('growthBase').onclick=()=>commit(()=>P.equip(s,'base','active',api.player),'growthBase');
        $('growthReset').onclick=()=>{confirming=true;open('growthConfirm');$('growthConfirm')?.scrollIntoView({block:'nearest'});};
        if($('growthConfirm'))$('growthConfirm').onclick=()=>{confirming=false;commit(()=>P.reset(s,api.player),'growthReset');};
        if($('growthCancel'))$('growthCancel').onclick=()=>{confirming=false;open('growthReset');};
        $('growthBack').onclick=()=>{confirming=false;api.back();};
        $('modalContent').scrollTop=scroll;
        if(focus){const target=$(focus);(target?.disabled?$('growthStatus'):target)?.focus({preventScroll:true});}
    }
    return {open};
};
