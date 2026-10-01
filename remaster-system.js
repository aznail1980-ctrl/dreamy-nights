'use strict';
window.createDreamRemaster = function (api) {
    const C = window.DREAM_CONTENT, G = 651, $ = id => document.getElementById(id), s = () => api.state, m = () => C.maps[s().map];
    let lastSection = '', musicTheme = '', voiceAudio = null, voiceToken = 0, currentVoice = null;
    function initialize(state, raw) {
        for (const map of C.maps)
            map.platforms = map.platforms.filter(p => !p.bridge);
        state.version = 4;
        state.remaster = { devices: [], camps: [], heard: [], explored: {} };
        if (raw?.remaster)
            for (const k of ['devices', 'camps', 'heard'])
                if (Array.isArray(raw.remaster[k]))
                    state.remaster[k] = raw.remaster[k].filter(v => typeof v === 'string').slice(0, 100);
        if (raw?.remaster?.explored && typeof raw.remaster.explored === 'object')
            for (const map of C.maps) {
                const cells = raw.remaster.explored[map.id];
                if (Array.isArray(cells)) state.remaster.explored[map.id] = [...new Set(cells.filter(n => Number.isInteger(n) && n >= 0 && n < 30))];
            }
        for (const [id, n] of Object.entries(C.npcs)) {
            n.x = n.home;
            n.life = { mode: 'idle', timer: 2.4 + n.phase, target: n.home, vx: 0, near: false, greeting: 0, greetCooldown: 0, stops: 0 };
        }
        for (const m of C.maps)
            if (state.remaster.devices.includes(m.id + '-switch'))
                for (const bridge of C.bridgePlatforms(m))
                    m.platforms.push(bridge);
        return state;
    }
    function climb(dt, dir) {
        const p = api.player;
        if (p.climbLatch) {
            if (!dir || dir !== p.climbLatch)
                p.climbLatch = false;
            else
                return false;
        }
        if (p.climbing && !dir && Math.abs(p.moveAxis || 0) > .55) {
            p.climbing = null;
            p.climbSpeed = 0;
            p.climbDetachT = .25;
            p.vy = 0;
            return false;
        }
        if (p.lift) {
            const target = p.lift.target, dy = target - p.y;
            p.vx = 0;
            p.vy = 0;
            p.y += Math.sign(dy) * Math.min(Math.abs(dy), 240 * dt);
            p.grounded = true;
            p.groundY = p.y;
            if (Math.abs(dy) < 3) {
                p.lift = null;
                api.sound('arrive');
            }
            return true;
        }
        if (p.climbing && p.jumpBuffer > 0) {
            p.climbing = null;
            p.climbSpeed = 0;
            p.climbDetachT = .35;
            p.vy = p.jumpReleased ? -480 : -620;
            p.jumpCutAvailable = !p.jumpReleased;
            p.grounded = false;
            p.coyote = 0;
            p.jumpBuffer = 0;
            api.sound('jump');
            return false;
        }
        let l = p.climbing;
        if (!l && dir && !(p.climbDetachT > 0) && !(p.dodgeT > 0) && !(p.hitT > 0))
            l = m().ladders.find(l => Math.abs(l.x - p.x) < 45 && p.y >= l.top - 5 && p.y <= l.bottom + 5 && (dir < 0 ? p.y > l.top + 2 : p.y < l.bottom - 2));
        if (!l)
            return false;
        if (!p.climbing) {
            p.pendingStrike = null;
            p.attackT = 0;
            p.chargeHeld = false;
            p.chargeT = 0;
            p.chargeReady = false;
            p.climbPhase = 0;
            p.climbSpeed = 0;
        }
        p.climbing = l;
        const dx = l.x - p.x;
        p.x += Math.sign(dx) * Math.min(Math.abs(dx), 190 * dt);
        p.vx = 0;
        p.vy = 0;
        p.grounded = false;
        const target = Math.abs(dx) > 9 ? 0 : dir * 145;
        p.climbSpeed += Math.sign(target - p.climbSpeed) * Math.min(Math.abs(target - p.climbSpeed), 850 * dt);
        const before = p.y;
        p.y = Math.max(l.top, Math.min(l.bottom, p.y + p.climbSpeed * dt));
        p.climbPhase -= (p.y - before) / 92 * Math.PI * 2;
        p.walkBlend = 0;
        p.groundY = l.bottom;
        if (dir < 0 && p.y <= l.top || dir > 0 && p.y >= l.bottom) {
            p.grounded = true;
            p.groundY = p.y;
            p.climbing = null;
            p.climbSpeed = 0;
            p.climbLatch = dir;
        }
        return true;
    }
    function nearest() {
        const p = api.player;
        return m().devices.filter(d => Math.abs(d.x - p.x) < 85 && Math.abs(d.y - p.y) < 65 && (!['cache', 'switch'].includes(d.kind) || !s().remaster.devices.includes(d.id))).map(d => ({ type: 'device', device: d, label: d.label }))[0];
    }
    function interact(d) {
        const p = api.player;
        if (d.kind === 'camp') {
            s().hp = api.maxHP();
            if (!s().remaster.camps.includes(d.id))
                s().remaster.camps.push(d.id);
            api.save();
            api.sound('camp');
            api.toast('따뜻한 별빛 아래에서 마음 체력을 회복하고 저장했어요.');
        }
        if (d.kind === 'lift') {
            p.x = d.x;
            p.lift = { target: p.y > 341 ? d.top : d.bottom };
            api.sound('mechanism');
        }
        if (d.kind === 'vent') {
            p.vy = -1620;
            p.grounded = false;
            api.sound('wind');
            api.toast('상승 바람! 방향키로 착지할 곳을 골라요.');
        }
        if (d.kind === 'cache') {
            s().remaster.devices.push(d.id);
            for (const [id, n] of [['dreamDust', 5], ['thread', 2], ['seaGlass', 2], ['cookie', 1]])
                api.add(id, n);
            api.sound('chest');
            api.spark(d.x, d.y - 35, 44, '#ffdc93', 260);
            api.save();
        }
        if (d.kind === 'switch') {
            if (s().remaster.devices.includes(d.id)) return;
            s().remaster.devices.push(d.id);
            for (const bridge of C.bridgePlatforms(m())) m().platforms.push(bridge);
            api.spark(d.x, d.y - 50, 28, '#ffe2a1', 200);
            api.sound('mechanism');
            api.toast('접힌 다리가 펼쳐졌어요. 위아래 탐험로를 편하게 돌아올 수 있어요.');
            api.save();
        }
    }
    function update(dt) {
        if(voiceAudio)voiceAudio.volume=api.settings.sound?Math.min(1,api.settings.volume*2.8*(api.settings.voiceVolume??1)*(currentVoice?.gain||1)):0;
        if (api.mode !== 'play')
            return;
        const p = api.player;
        const cells = s().remaster.explored[m().id] ||= [];
        const tier = Math.max(0,Math.min(2,Math.round((G-p.y)/310)));
        const cell = tier*10 + Math.max(0,Math.min(9,Math.floor(p.x/m().width*10)));
        if (!cells.includes(cell)) cells.push(cell);
        for (const [id, n] of Object.entries(C.npcs)) {
            if (n.map !== s().map) continue;
            const life = n.life ||= {mode:'idle',timer:3+n.phase,target:n.home,vx:0,near:false,greeting:0,greetCooldown:0,stops:0};
            const near = Math.abs(p.x-n.x)<160 && Math.abs(p.y-n.y)<85;
            life.greetCooldown = Math.max(0,life.greetCooldown-dt);
            life.greeting = Math.max(0,life.greeting-dt);
            if (near && !life.near && life.greetCooldown<=0) {
                life.greeting=1.8; life.greetCooldown=12; life.mode='idle'; life.timer=3;
            }
            life.near=near;
            let desired=0;
            if(!near){
                life.timer-=dt;
                if(life.mode==='idle'&&life.timer<=0){
                    life.stops++;
                    const offsets=id==='lumen'?[-62,42,75,-25]:id==='madeleine'?[45,-48,16,-65]:[-76,63,-25,78];
                    life.target=n.home+offsets[life.stops%offsets.length];life.mode='walk';
                }
                if(life.mode==='walk'){
                    const dx=life.target-n.x;
                    desired=Math.sign(dx)*Math.min(id==='post'?39:29,Math.abs(dx)*2.1);
                    if(Math.abs(dx)<2){life.mode='idle';life.timer=3.3+((life.stops*7+n.phase)%5)*.72;}
                }
            }
            life.vx += Math.sign(desired-life.vx)*Math.min(Math.abs(desired-life.vx),dt*105);
            const old=n.x;n.x+=life.vx*dt;
            n.walking=Math.abs(life.vx)>2;
            n.walkTime+=Math.abs(n.x-old)/(id==='post'?33:55)*Math.PI*2;
            if(near&&Math.abs(p.x-n.x)>20)n.face=Math.sign(p.x-n.x);
            else if(Math.abs(life.vx)>3)n.face=Math.sign(life.vx);
            n.greetingActive=life.greeting>0;
        }
        const section = m().sections[Math.max(0, Math.min(2, Math.round((G - p.y) / 310)))];
        if (section !== lastSection) {
            lastSection = section;
            $('areaName').textContent = section;
        }
        // Lift has a landing at both ends, so it can be called from either platform.
        const lift = m().devices.find(d => d.kind === 'lift');
        if (lift && !p.lift)
            lift.y = p.y < 300 ? 31 : 651;
    }
    function routePoint(target) {
        const p = api.player, ty = target.y ?? G;
        if (Math.abs(ty - p.y) < 70)
            return { x: target.x, climb: 0 };
        const up = ty < p.y;
        const ladders = m().ladders.filter(l => up ? Math.abs(l.bottom - p.y) < 55 : Math.abs(l.top - p.y) < 55);
        const l = ladders.sort((a, b) => (Math.abs(a.x - p.x) + Math.abs(a.x - target.x) * .22) - (Math.abs(b.x - p.x) + Math.abs(b.x - target.x) * .22))[0];
        return l ? { x: l.x, climb: Math.abs(l.x - p.x) < 30 ? (up ? -1 : 1) : 0 } : { x: target.x, climb: 0 };
    }
    function localMap() {
        if (api.mode !== 'play' && !(api.mode === 'modal' && api.modalKind === 'localMap'))
            return;
        const map = m(), p = api.player, x = v => v / map.width * 1000, y = v => (v + 160) / 900 * 350;
        api.openModal('localMap', map.name + ' · 탐험 지도', `<p>세 층의 길은 사다리로 이어져 있어요. 점선 틈은 점프하거나 다리 장치를 복구해 건널 수 있어요.</p><div class="local-atlas"><svg viewBox="0 0 1000 350" role="img" aria-label="현재 지역의 상층, 중층, 해안길과 사다리 지도"><path d="M0 ${y(G)}H1000" stroke="#c6b199" stroke-width="12"/>${map.platforms.map(v => `<path d="M${x(v.x)} ${y(v.y)}h${x(v.w)}" stroke="#9ebbad" stroke-width="8"/>`).join('')}${map.ladders.map(v => `<path d="M${x(v.x)} ${y(v.top)}V${y(v.bottom)}" stroke="#edd59c" stroke-width="3"/>`).join('')}${C.objects.filter(o => o.map === s().map).map(o => `<circle cx="${x(o.x)}" cy="${y(o.y) - 10}" r="5" fill="#d49bbb"><title>${o.id}</title></circle>`).join('')}${map.devices.map(o => `<text x="${x(o.x)}" y="${y(o.y) - 10}" fill="#f0dfb8" font-size="16">${{ camp: '⌂', lift: '↕', cache: '✦', vent: '↑', switch: '⚙' }[o.kind]}<title>${o.label}</title></text>`).join('')}<circle cx="${x(p.x)}" cy="${y(p.y) - 8}" r="8" fill="#fff7bd" stroke="#b88c80" stroke-width="3"/></svg></div><div class="map-levels">${map.sections.map((n, i) => `<span>${i + 1}층 · ${n}</span>`).join('')}</div><p class="atlas-legend">● 내 위치 · 분홍 점: 발견할 것 · 노란 선: 사다리 · ⌂ 야영지 · ↕ 승강기 · ✦ 보물</p><button id="wholeAtlas" class="primary">섬 전체 지도 M →</button>`, 'EXPLORE EVERY LAYER');
        $('wholeAtlas').onclick = () => {
            api.closeModal();
            api.worldMap();
        };
    }
    function archive() { window.DreamLibrary.open(api); }
    function stopVoice() {
        voiceToken++;
        if (voiceAudio) {
            voiceAudio.pause();
            voiceAudio.currentTime = 0;
            voiceAudio = null;
        }
        if (window.speechSynthesis)
            window.speechSynthesis.cancel();
        api.duck(false);
    }
    function readVoice(key,index,who,text){
        stopVoice();currentVoice={key,index,who,text,source:'muted'};
        const button=document.getElementById('voiceReplay');
        const id=key+'-'+index+'-'+who,entry=(window.DREAM_VOICE_OVERRIDES||{})[id];
        const normalize=v=>String(v||'').normalize('NFC').replace(/\s+/g,'');
        const script=window.DREAM_VOICE_SCRIPTS?.[id];
        const valid=entry?.speaker===who&&normalize(script)===normalize(text)&&typeof entry.file==='string'&&/^assets\/voice-performed\/[a-zA-Z0-9_-]+\.(mp3|m4a|wav|ogg)$/.test(entry.file);
        if(button){button.disabled=!valid;button.title=valid?'현재 대사 다시 듣기':'이 장면은 자막으로 진행해요';button.setAttribute('aria-label',button.title);}
        if(!api.settings.voice||!api.settings.sound)return;
        if(!valid){currentVoice.source='captions';return;}
        const token=voiceToken,audio=new Audio(entry.file);voiceAudio=audio;
        currentVoice.source=entry.source||'performance';
        const gain=Number.isFinite(entry.gain)?Math.max(.25,Math.min(2,entry.gain)):1;
        currentVoice.gain=gain;
        audio.volume=Math.min(1,api.settings.volume*2.8*(api.settings.voiceVolume??1)*gain);
        audio.onplaying=()=>{if(token===voiceToken)api.duck(true);};
        const finish=()=>{if(token===voiceToken){api.duck(false);voiceAudio=null;}};
        audio.onended=finish;
        const fail=()=>{if(token!==voiceToken)return;finish();currentVoice.source='captions';};
        audio.onerror=fail;audio.play().catch(fail);
    }
    function replay() {
        if (currentVoice)
            readVoice(currentVoice.key, currentVoice.index, currentVoice.who, currentVoice.text);
    }
    return { voiceStatus: () => ({ enabled: api.settings.voice, line: currentVoice?.key, who: currentVoice?.who, source: currentVoice?.source, file: voiceAudio?.currentSrc || voiceAudio?.src || null, index: currentVoice?.index, playing: !!voiceAudio && !voiceAudio.paused, duration: voiceAudio && Number.isFinite(voiceAudio.duration) ? voiceAudio.duration : 0 }), initialize, climb, nearest, interact, update, routePoint, localMap, archive, readVoice, stopVoice, replay };
};
