/* Shared inventory navigation and touch list/detail flow. No save data lives here. */
'use strict';
window.DreamKit = (() => {
    const kinds = new Set(['bag','wardrobe','characterDetail','growth','gearWorkshop','gearConfirm','regionGuide','regionWorkshop','dropGuide','pets']);
    const entries = [['characterDetail','캐릭터','M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 22v-4c0-5 16-5 16 0v4'],['bag','가방','M5 8h14l2 14H3L5 8m3 0V5a4 4 0 0 1 8 0v3M8 14h8'],['wardrobe','꾸미기','m8 3-6 5 4 4 2-2v12h8V10l2 2 4-4-6-5c0 4-8 4-8 0'],['growth','성장','m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7']];
    let returnTo = '';
    function detail(open, target = '') {
        const modal = document.getElementById('modal');
        if (!modal || !matchMedia('(pointer:coarse)').matches) return;
        if(target) returnTo=target;
        modal.dataset.detail=String(open);
        modal.querySelector('.modal-card').scrollTop=0;
        const focus = modal.querySelector(open ? '.kit-list-back' : (returnTo||'.kit-nav button'));
        focus?.focus({preventScroll:true});
    }
    function mount(kind, navigate) {
        const modal=document.getElementById('modal'),content=document.getElementById('modalContent');
        modal.dataset.kit=String(kinds.has(kind));modal.dataset.detail='false';
        if(!kinds.has(kind))return;
        // Keep the selected item readable while its action remains in a predictable footer.
        content.querySelectorAll('.item-detail,.costume-detail').forEach(panel=>{
            const body=document.createElement('div');body.className='kit-detail-body';
            [...panel.childNodes].forEach(node=>{if(!node.matches?.('.kit-list-back,.item-actions'))body.append(node);});
            panel.insertBefore(body,panel.querySelector('.item-actions'));
        });
        const active=['gearWorkshop','gearConfirm','regionGuide','regionWorkshop','dropGuide'].includes(kind)?'bag':kind==='pets'?'characterDetail':kind;
        content.insertAdjacentHTML('afterbegin',`<nav class="kit-nav" aria-label="꿈 지킴이 메뉴">${entries.map(([id,label,path])=>`<button data-kit-page="${id}" ${id===active?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg><span>${label}</span></button>`).join('')}<span class="kit-nav-note">순찰 준비실 <i>✦</i></span></nav>`);
        content.querySelectorAll('[data-kit-page]').forEach(button=>button.onclick=()=>navigate(button.dataset.kitPage));
    }
    return {mount,detail};
})();
