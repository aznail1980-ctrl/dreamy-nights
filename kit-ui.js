/* Shared inventory navigation and touch list/detail flow. No save data lives here. */
'use strict';
window.DreamKit = (() => {
    const kinds = new Set(['bag','wardrobe','characterDetail','growth','gearWorkshop','gearConfirm','regionGuide','regionWorkshop','dropGuide','pets','petChoice','petHatch']);
    const entries = [['characterDetail','캐릭터','M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 22v-4c0-5 16-5 16 0v4'],['bag','가방','M5 8h14l2 14H3L5 8m3 0V5a4 4 0 0 1 8 0v3M8 14h8'],['wardrobe','꾸미기','m8 3-6 5 4 4 2-2v12h8V10l2 2 4-4-6-5c0 4-8 4-8 0'],['pets','펫','M7 12c-6 2-5 9 0 9h10c5 0 6-7 0-9-3-2-7-2-10 0M5 5v3M10 2v4M15 2v4M20 5v3'],['growth','성장','m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7']];
    let returnTo = '';
    function detail(open, target = '') {
        const modal = document.getElementById('modal');
        if (!modal || !matchMedia('(pointer:coarse)').matches) return;
        if(target) returnTo=target;
        modal.dataset.detail=String(open);
        modal.querySelector('.modal-card').scrollTop=0;
        document.getElementById('modalContent').scrollTop=0;
        const focus = modal.querySelector(open ? '.kit-list-back' : (returnTo||'.kit-nav button'));
        focus?.focus({preventScroll:true});
    }
    function mount(kind, navigate) {
        const modal=document.getElementById('modal'),content=document.getElementById('modalContent');
        modal.querySelector('.modal-card > .kit-nav')?.remove();
        modal.querySelector('.modal-card > .kit-footer')?.remove();
        modal.dataset.kit=String(kinds.has(kind));modal.dataset.detail='false';
        if(!kinds.has(kind))return;
        document.getElementById('modalEyebrow').textContent='포근등대 · 순찰 준비실';
        // Keep the selected item readable while its action remains in a predictable footer.
        content.querySelectorAll('.item-detail,.costume-detail').forEach(panel=>{
            const body=document.createElement('div');body.className='kit-detail-body';
            [...panel.childNodes].forEach(node=>{if(!node.matches?.('.kit-list-back,.item-actions'))body.append(node);});
            panel.insertBefore(body,panel.querySelector('.item-actions'));
        });
        // One illustrated companion shelf, followed by care; long help stays optional.
        if(kind==='pets'){
            const collection=content.querySelector('.pet-collection'),layout=content.querySelector('.pet-layout');
            if(collection&&layout)content.insertBefore(collection,layout);
            const help=document.createElement('details');help.className='kit-help';help.innerHTML='<summary>알과 꿈 친구 돌봄 안내</summary>';
            content.querySelectorAll('.pet-intro,.pet-next').forEach(el=>help.append(el));content.append(help);
        }
        const actions=kind==='pets'?content.querySelector('.pet-growth .pet-actions'):kind==='petChoice'?content.querySelector('.pet-actions'):null;
        if(actions){const footer=document.createElement('footer');footer.className='kit-footer';footer.setAttribute('aria-label',kind==='pets'?'꿈 친구 돌보기':'알 선택');footer.append(actions);content.after(footer);}
        const active=['gearWorkshop','gearConfirm','regionGuide','regionWorkshop','dropGuide'].includes(kind)?'bag':['pets','petChoice','petHatch'].includes(kind)?'pets':kind;
        content.insertAdjacentHTML('beforebegin',`<nav class="kit-nav" aria-label="꿈 지킴이 메뉴">${entries.map(([id,label,path])=>`<button data-kit-page="${id}" ${id===active?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg><span>${label}</span></button>`).join('')}<span class="kit-nav-note">순찰 준비실 <i>✦</i></span></nav>`);
        modal.querySelectorAll('[data-kit-page]').forEach(button=>button.onclick=()=>navigate(button.dataset.kitPage));
    }
    return {mount,detail};
})();
