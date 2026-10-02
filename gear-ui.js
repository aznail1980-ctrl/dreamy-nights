'use strict';
window.createDreamGearUI=({C,G,api,state,icon,bag,details})=>{
    const $=id=>document.getElementById(id),r=()=>state().rpg;
    let selected='',grade='all',page=0,mode='upgrade',marked=new Set(),notice='';
    const names={attack:'정화 위력',skill:'꿈빛 파동',hp:'최대 마음',speed:'이동 속도',resonance:'공명 획득',dodge:'대시 대기 감소'};
    const fmt=(k,v)=>['speed','resonance'].includes(k)?Math.round(v*1000)/10+'%':k==='dodge'?v+'초':v;
    const unlocked=()=>!!(state().flags.metLumen||state().flags.completed);
    function changed(message){notice=message;state().hp=Math.min(state().hp,api.maxHP());api.save();api.refresh();api.sound('stamp');}
    function statRows(g,next=false){
        const before=G.stats(g),after=next?G.stats({...g,level:g.level+1}):before;
        return `<dl class="forge-stats">${Object.entries(names).filter(([k])=>(before[k]||after[k])).map(([k,label])=>`<div><dt>${label}</dt><dd>${fmt(k,before[k]||0)}${next?` <span>→ ${fmt(k,after[k]||0)}</span>`:''}</dd></div>`).join('')||'<div><dt>기본 장비</dt><dd>강화로 능력을 더해요.</dd></div>'}</dl>`;
    }
    function open(uid,requestedMode){
        if(['upgrade','dismantle'].includes(requestedMode)){mode=requestedMode;notice='';}
        if(api.mode!=='play'&&!(api.mode==='modal'&&['bag','npc','characterDetail','gearWorkshop','gearConfirm'].includes(api.modalKind)))return;
        if(uid&&G.find(r(),uid)){selected=uid;grade='all';page=0;}
        marked=new Set([...marked].filter(id=>!G.protection(r(),G.find(r(),id))));
        const all=r().gear.filter(g=>grade==='all'||C.items[g.itemId].grade===grade);
        const pages=Math.max(1,Math.ceil(all.length/18));page=Math.min(page,pages-1);
        const g=all.find(x=>x.uid===selected)||all[page*18];selected=g?.uid||'';
        const equipped=g&&Object.values(r().equippedUids).includes(g.uid),max=g?.level===G.maxLevel,can=unlocked(),cost=g&&!max?G.costs[g.level]:0;
        const review=G.quote(r(),[...marked]);
        api.openModal('gearWorkshop','기억 수선대',`<div class="forge-top"><p>남는 장비의 꿈빛을 모아 오래 함께할 장비를 다듬어요.</p><b>${icon('dust',30)} 꿈빛 잔해물 <strong>${r().fragments}</strong></b></div><p class="forge-note">${can?'강화는 실패·파괴 없이 최대 +5. 장착한 장비도 강화할 수 있어요.':'먼저 항구에서 루멘 반장을 만나 수선대를 배워요. 장비와 비용은 미리 볼 수 있어요.'}</p><div class="forge-tabs"><button id="forgeUpgradeTab" aria-pressed="${mode==='upgrade'}">장비 강화</button><button id="forgeDismantleTab" aria-pressed="${mode==='dismantle'}">장비 분해</button><label>등급 <select id="forgeGrade">${[['all','전체'],...Object.entries(C.grades).map(([id,v])=>[id,v.name])].map(([id,n])=>`<option value="${id}" ${id===grade?'selected':''}>${n}</option>`).join('')}</select></label></div><p class="forge-notice" role="status">${notice||'장비를 선택하면 능력과 다음 강화 비용을 확인할 수 있어요.'}</p><div class="forge-layout"><section><div class="forge-grid">${all.slice(page*18,page*18+18).map(x=>{const it=C.items[x.itemId],reason=G.protection(r(),x),on=Object.values(r().equippedUids).includes(x.uid);return `<article class="forge-card ${x.uid===selected?'selected':''}"><button data-forge-pick="${x.uid}" aria-pressed="${x.uid===selected}">${icon(it.icon,48)}<b>${G.name(x)}</b><small>${C.grades[it.grade].symbol} ${C.grades[it.grade].name} · ${x.uid.slice(1)}번</small><em>${on?'장착 중':x.locked?'잠금':reason?'보호 장비':'보관 중'}</em></button>${mode==='dismantle'?`<label class="forge-check"><input type="checkbox" data-forge-mark="${x.uid}" ${marked.has(x.uid)?'checked':''} ${reason?'disabled':''}> ${reason?'분해 제외':'분해 선택 · 잔해물 '+G.yieldOf(x)}</label>`:''}</article>`;}).join('')||'<p>이 등급의 장비가 없어요.</p>'}</div><div class="forge-pages"><button id="forgePrev" ${page===0?'disabled':''}>이전</button><span>${page+1} / ${pages}</span><button id="forgeNext" ${page===pages-1?'disabled':''}>다음</button></div>${mode==='dismantle'?`<div class="forge-batch"><button id="forgeSelectLow">저급·일반 선택</button><button id="forgeClear">선택 해제</button><p>선택 ${marked.size}개 · 잔해물 +${review.ok?review.reward:0}</p><button id="forgeReview" class="primary" ${!can||!review.ok?'disabled':''}>분해 목록 확인</button><small>장착·잠금·이야기 장비는 자동 제외해요.</small></div>`:''}</section><aside class="forge-detail">${g?`${icon(C.items[g.itemId].icon,94)}<span>${C.grades[C.items[g.itemId].grade].name} · ${g.uid.slice(1)}번 장비</span><h3>${G.name(g)}</h3><p>장비 능력${mode==='upgrade'&&!max?' · 현재 → 다음 단계':''}</p>${statRows(g,mode==='upgrade'&&!max)}<div class="forge-item-actions"><button id="forgeEquip" ${equipped?'disabled':''}>${equipped?'장착 중':'장착하기'}</button><button id="forgeLock" aria-pressed="${g.locked}">${g.locked?'잠금 해제':'장비 잠금'}</button></div>${mode==='upgrade'?`<p class="forge-cost">${max?'최대 강화 단계예요.':`+${g.level} → +${g.level+1} · 잔해물 ${cost}개`}</p><button id="forgeUpgrade" class="primary" ${!can||max||r().fragments<cost?'disabled':''}>${max?'강화 완료':r().fragments<cost?'잔해물이 부족해요':'확정 강화하기'}</button>`:`<p>${G.protection(r(),g)||'분해하면 잔해물 '+G.yieldOf(g)+'개를 받아요.'}</p><small>강화에 쓴 잔해물의 절반도 돌려받아요.</small>`}`:'<p>장비를 선택해주세요.</p>'}</aside></div><div class="forge-footer"><button id="forgeBag" class="secondary">가방으로</button><button id="forgeDetails" class="secondary">캐릭터 능력 확인</button></div>`,'REPAIR THE LIGHT · KEEP THE MEMORY');
        $('forgeUpgradeTab').onclick=()=>{mode='upgrade';open();};$('forgeDismantleTab').onclick=()=>{mode='dismantle';open();};
        $('forgeGrade').onchange=e=>{grade=e.target.value;page=0;selected='';open();};
        document.querySelectorAll('[data-forge-pick]').forEach(b=>b.onclick=()=>{selected=b.dataset.forgePick;open();});
        document.querySelectorAll('[data-forge-mark]').forEach(b=>b.onchange=()=>{b.checked?marked.add(b.dataset.forgeMark):marked.delete(b.dataset.forgeMark);open();});
        $('forgePrev').onclick=()=>{page--;selected='';open();};$('forgeNext').onclick=()=>{page++;selected='';open();};
        $('forgeBag').onclick=()=>bag('equipment',g?.itemId);$('forgeDetails').onclick=details;
        if(g){
            $('forgeEquip').onclick=()=>{if(G.equip(r(),g.uid))changed(G.name(g)+' 장착');open();};
            $('forgeLock').onclick=()=>{const live=G.find(r(),g.uid);if(!live)return;live.locked=!live.locked;changed(live.locked?'분해하지 않도록 잠갔어요.':'잠금을 해제했어요.');open();};
            if($('forgeUpgrade')){const expected=g.level;$('forgeUpgrade').onclick=()=>{if(unlocked()&&G.upgrade(r(),g.uid,expected))changed(G.name(g)+' · 강화 성공!');open();};}
        }
        if(mode==='dismantle'){
            $('forgeSelectLow').onclick=()=>{marked=new Set(all.filter(x=>['low','common'].includes(C.items[x.itemId].grade)&&!G.protection(r(),x)).map(x=>x.uid));open();};
            $('forgeClear').onclick=()=>{marked.clear();open();};$('forgeReview').onclick=confirm;
        }
    }
    function confirm(){
        if(!unlocked())return;const review=G.quote(r(),[...marked]);if(!review.ok){notice=review.reason;open();return;}
        api.openModal('gearConfirm','이 장비들을 분해할까요?',`<p>장비 ${review.uids.length}개가 사라지고 <b>꿈빛 잔해물 ${review.reward}개</b>를 받아요. 분해한 장비는 되돌릴 수 없어요.</p><ul class="forge-review">${review.uids.map(uid=>{const g=G.find(r(),uid);return `<li>${icon(C.items[g.itemId].icon,32)}<span>${G.name(g)} · ${uid.slice(1)}번</span><b>+${G.yieldOf(g)}</b></li>`;}).join('')}</ul><div class="forge-footer"><button id="forgeConfirm" class="primary">${review.uids.length}개 분해 · 잔해물 받기</button><button id="forgeCancel" class="secondary">취소</button></div>`,'REVIEW YOUR CHOICE');
        $('forgeCancel').onclick=()=>open();$('forgeConfirm').onclick=()=>{if(unlocked()&&G.dismantle(r(),review)){marked.clear();changed('꿈빛 잔해물 +'+review.reward+' · 분해 완료');}else notice='장비 상태가 바뀌었어요. 목록을 다시 확인해주세요.';open();};
    }
    return {open};
};
