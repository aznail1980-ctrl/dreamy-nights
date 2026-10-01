'use strict';
(() => {
    const icons={
        star:'<path d="m12 2 3.1 6.4 7.1 1-5.1 5 .9 7-6-3.3L5.9 21l.9-7-5.1-5 7.1-1Z"/>',
        play:'<path d="m9 5 10 7-10 7Z"/>',
        continue:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
        replay:'<path d="M5 8a8 8 0 1 1-1 7M5 3v6h6"/>',
        help:'<path d="M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 4h.01"/><circle cx="12" cy="12" r="10"/>',
        sound:'<path d="m3 10 4 0 5-4v12l-5-4H3Zm13-2a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
        mute:'<path d="m3 10 4 0 5-4v12l-5-4H3Zm13-1 6 6m0-6-6 6"/>',
        pause:'<path d="M8 5v14M16 5v14"/>',
        skip:'<path d="m5 5 9 7-9 7Zm13 0v14"/>',
        motion:'<path d="m12 2 2.7 6.8L22 12l-7.3 3.2L12 22l-2.7-6.8L2 12l7.3-3.2Z"/>'
    };
    const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const svg=(id,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[id]||icons.star}</svg>`;
    function button(node,label,icon='star',caption=''){
        if(!node)return;
        node.classList.add('dream-game-button');
        node.innerHTML=`<span class="game-button-icon" aria-hidden="true">${svg(icon)}</span><span class="game-button-copy">${caption?`<small>${esc(caption)}</small>`:''}<b>${esc(label)}</b></span><span class="game-button-arrow" aria-hidden="true">${svg('continue')}</span>`;
    }
    function title(saved){
        document.getElementById('title').dataset.hasSave=String(saved);
        button(document.getElementById('startButton'),saved?'새 순찰 시작':'첫 순찰 떠나기','star',saved?'새로운 꿈 지킴이':'나의 꿈 지킴이 선택');
        button(document.getElementById('continueButton'),'모험 계속','continue','기다리던 꿈길로');
    }
    function sample(time,id,reaction=-100,reduced=false){
        if(reduced)return {frame:0,lean:0,breath:1,offset:0};
        const t=time+(id==='popo'?2.65:0),phase=t%17,manual=time-reaction;
        const greeting=manual>=0&&manual<1.65?manual:phase>=9.4&&phase<11.05?phase-9.4:-1;
        let frame=0;
        if(greeting>=0)frame=greeting<.18?3:greeting<.56?4:greeting<.72?3:greeting<1.18?4:greeting<1.42?3:0;
        else{const b=t%5.7;frame=b>3.2&&b<3.29?1:b>=3.29&&b<3.39?2:b>=3.39&&b<3.47?1:0;}
        return {frame,lean:Math.sin(t*1.13)*.009+(greeting>=0?Math.sin(greeting*Math.PI/1.65)*.018:0),breath:1+Math.sin(t*1.65)*.005,offset:Math.sin(t*1.3)*1.2};
    }
    function sampleChoice(time,id,reaction,reduced=false){
        const pose=sample(time,id,reaction,reduced),t=time-reaction;
        if(reduced||t<0||t>1.65)return pose;
        const beat=Math.sin(Math.PI*t/1.65);
        pose.lean+=(id==='popo'?-1:1)*beat*.055;
        // A brief spring and landing for Popo; Ari keeps her feet planted and bows.
        pose.offset=id==='popo'?-Math.max(0,Math.sin(Math.PI*Math.min(1,t/.65)))*9:0;
        pose.breath=1+(id==='popo'?-.018:.012)*beat;
        return pose;
    }
    function draw(canvas,image,id,pose,parallax=0){
        const a=DREAM_LOBBY_ART[id],b=a.frames[pose.frame],pivot=a.pivots[pose.frame],ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
        ctx.clearRect(0,0,w,h);
        // Planted feet are the pivot: no floating cutout or weapon clipping at frame changes.
        const sc=Math.min((w-50)/Math.max(...a.frames.map(x=>x[2])),(h-50)/b[3]);
        ctx.save();ctx.translate(w*.46+parallax,h-24);ctx.rotate(pose.lean);ctx.scale(1,pose.breath);
        ctx.drawImage(image,...b,(b[0]-pivot[0])*sc,(b[1]-pivot[1])*sc+pose.offset,b[2]*sc,b[3]*sc);ctx.restore();
    }
    window.DREAM_LOBBY_UI={button,title,svg};
    window.DREAM_LOBBY_MOTION={sample,sampleChoice,draw};
    window.createDreamLobby=function({stage,settings}){
        const root=document.getElementById('title'),portraits={},reactions={ari:-100,popo:-100},choiceReactions={ari:-100,popo:-100},query=matchMedia('(prefers-reduced-motion: reduce)');
        let elapsed=0,lastDraw=-1,paused=false,targetX=0,shift=0,lastReduced=null,selectionRoot=null,selection=[],lastSurface=null;
        try{paused=localStorage.getItem('dreamy-nights-lobby-motion-v1')==='off';}catch{}
        for(const id of ['ari','popo']){
            const host=root.querySelector('[data-lobby-hero="'+id+'"]'),canvas=host.querySelector('canvas');
            const record=portraits[id]={host,canvas,image:null,ready:false},im=new Image();
            im.onload=()=>{record.image=im;record.ready=true;lastDraw=-1;};
            im.onerror=()=>{record.failed=true;};im.src=DREAM_LOBBY_ART[id].file;
            host.onclick=()=>{
                reactions[id]=elapsed;lastDraw=-1;
                root.querySelector('.character-note').textContent=id==='ari'?'아리 · 작은 빛도 놓치지 않을게. 함께 가자!':'포포 · 준비됐어! 오늘은 어떤 꿈을 만날까?';
            };
        }
        button(document.getElementById('openingReplay'),'인트로 다시 보기','replay');
        button(document.getElementById('titleHelp'),'조작 방법','help');
        stage.addEventListener('dream-hero-choice',event=>{
            const id=event.detail?.id;if(!Object.hasOwn(choiceReactions,id))return;
            choiceReactions[id]=elapsed;lastDraw=-1;
        });
        const motion=document.getElementById('lobbyMotion');
        motion.onclick=()=>{paused=!paused;try{localStorage.setItem('dreamy-nights-lobby-motion-v1',paused?'off':'on');}catch{}lastDraw=-1;};
        root.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const b=root.getBoundingClientRect();targetX=Math.max(-1,Math.min(1,(e.clientX-b.left)/b.width*2-1));});
        root.addEventListener('pointerleave',()=>targetX=0);
        function update(dt,mode,modalKind){
            const reduced=paused||settings.reducedMotion||query.matches;
            if(reduced!==lastReduced){
                stage.classList.toggle('lobby-still',reduced);motion.setAttribute('aria-pressed',String(!reduced));motion.setAttribute('aria-label',reduced?'로비 움직임 켜기':'로비 움직임 멈추기');
                motion.innerHTML=svg(reduced?'play':'pause')+'<span>모션 '+(reduced?'OFF':'ON')+'</span>';
                motion.disabled=settings.reducedMotion||query.matches;motion.title=motion.disabled?'기기 또는 게임의 편안한 연출 설정이 켜져 있어요.':'캐릭터와 버튼의 움직임 켜기/끄기';lastReduced=reduced;lastDraw=-1;
            }
            if(document.hidden||!['title','opening'].includes(mode)&&!(mode==='modal'&&modalKind==='character'))return;
            if(!reduced)elapsed+=Math.min(.05,Math.max(0,dt));
            if(mode==='opening')return;
            const surface=mode==='title'?root:document.getElementById('modalContent').firstElementChild;
            if(surface!==lastSurface){lastSurface=surface;lastDraw=-1;}

            if(lastDraw>=0&&(reduced||elapsed-lastDraw<1/30))return;
            lastDraw=elapsed;shift+=(targetX*5-shift)*.12;
            if(mode==='title')for(const [id,p]of Object.entries(portraits)){
                if(!p.ready)continue;draw(p.canvas,p.image,id,sample(elapsed,id,reactions[id],reduced),reduced?0:shift);p.host.classList.add('motion-ready');
            }
            if(mode==='modal'&&modalKind==='character'){
                const modal=document.getElementById('modalContent');
                if(selectionRoot!==modal.firstElementChild){selectionRoot=modal.firstElementChild;selection=[...modal.querySelectorAll('[data-choice-canvas]')];const selected=modal.querySelector('.hero-choice.selected');if(selected)choiceReactions[selected.dataset.hero]=elapsed;}
                for(const canvas of selection){const id=canvas.dataset.choiceCanvas,p=portraits[id];if(!p?.ready)continue;const selected=canvas.closest('.hero-choice').getAttribute('aria-pressed')==='true';draw(canvas,p.image,id,sampleChoice(elapsed,id,choiceReactions[id],reduced||!selected));canvas.parentElement.classList.add('motion-ready');}
            }
        }
        return {update,inspect:()=>({ready:Object.fromEntries(Object.entries(portraits).map(([id,p])=>[id,p.ready])),paused:!!lastReduced,choiceFrames:Object.fromEntries(['ari','popo'].map(id=>[id,sampleChoice(elapsed,id,choiceReactions[id],!!lastReduced).frame])),frames:Object.fromEntries(['ari','popo'].map(id=>[id,sample(elapsed,id,reactions[id],!!lastReduced).frame]))})};
    };
})();
