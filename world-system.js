'use strict';
window.createDreamWorld = function (api) {
    const C = window.DREAM_CONTENT, $ = id => document.getElementById(id), s = () => api.state;
    const lookSlots = { head: '머리', neck: '목', back: '등', aura: '발자국' };
    let selectedLook = 'softScarf';
    function initialize(state) {
        for (const f of C.worldFlags)
            state.flags[f] = false;
        state.version = 3;
        state.world = { look: { head: null, neck: 'softScarf', back: null, aura: null }, tideStep: 0, vanes: [0, 0, 0], treasure: [], harvestAt: {} };
        state.rpg.inventory.softScarf = 1;
        return state;
    }
    function migrate(state, raw) {
        const w = state.world, r = raw.world;
        if (raw.version < 3) {
            const oldMap = raw.version === 1 ? [0, 1, 2, 8, 12, 14] : [0, 1, 2, 3, 8, 9, 10, 12, 13, 14];
            state.claimed = (raw.claimed || []).map(i => oldMap[i]).filter(Number.isInteger);
            if (state.flags.completed)
                C.worldFlags.forEach(f => state.flags[f] = true);
            else if (state.flags.readyForBoss) {
                ['tideAttuned', 'windAttuned', 'starChartRead', 'archiveRead'].forEach(f => state.flags[f] = true);
            }
        }
        if (r && typeof r === 'object') {
            for (const k of Object.keys(lookSlots)) {
                const id = r.look?.[k];
                w.look[k] = C.items[id]?.cosmeticSlot === k && state.rpg.inventory[id] > 0 ? id : null;
            }
            w.tideStep = Math.min(3, Math.max(0, Number(r.tideStep) || 0));
            if (Array.isArray(r.vanes) && r.vanes.length === 3)
                w.vanes = r.vanes.map(v => Number.isInteger(v) && v >= 0 && v < 4 ? v : 0);
            if (Array.isArray(r.treasure))
                w.treasure = [...new Set(r.treasure.filter(id => C.objects.some(o => o.kind === 'treasure' && o.id === id)))];
            for (const [id, t] of Object.entries(r.harvestAt || {}))
                if (C.objects.some(o => o.kind === 'herb' && o.id === id) && Number.isFinite(t))
                    w.harvestAt[id] = Math.max(0, t);
            C.worldFlags.forEach(f => state.flags[f] = raw.flags?.[f] === true);
        }
        state.rpg.inventory.softScarf = 1;
        return state;
    }
    function selectHero(confirm) {
        let choice = 'ari';
        const name = id => id === 'ari' ? '아리' : '포포';
        const keeperSeal = `<svg viewBox="0 0 56 64" aria-hidden="true" focusable="false">
            <path d="M14 38 10 61 22 55 28 61 29 40M29 40 29 61 36 55 47 60 41 37" fill="#8eaaa0" stroke="#6e8c80" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="m18 44-3 11m22-11 4 11" stroke="#d0ded0" stroke-width="2" stroke-linecap="round"/>
            <path d="M28 3 34 6 41 7 45 13 50 18 49 26 50 33 45 39 40 45 33 46 27 49 20 46 13 45 9 38 5 33 6 25 5 18 10 13 14 7 22 6Z" fill="#e4bf7b" stroke="#b79363" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="28" cy="26" r="18" fill="#fbebc1" stroke="#fff6da" stroke-width="2"/>
            <circle cx="28" cy="26" r="14.5" fill="none" stroke="#dfbf83" stroke-width="1"/>
            <path d="m28 14 3.4 7.8 8.6 1-6.4 5.6 1.8 8.3L28 32.4l-7.4 4.3 1.8-8.3-6.4-5.6 8.6-1Z" fill="#91aa96" stroke="#698878" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="m25 26 2 2 4-5" fill="none" stroke="#fff9df" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        api.openModal('character', '꿈 지킴이 선택', `
            <p class="choose-lead">친구를 골라, 첫 순찰을 떠나게 된 이야기를 만나보세요.</p>
            <div class="keeper-selection"><div class="hero-choices" role="group" aria-label="함께할 꿈 지킴이 선택">
                ${['ari', 'popo'].map(id => `<button type="button" class="hero-choice ${choice === id ? 'selected' : ''}" data-hero="${id}" aria-pressed="${choice === id}" aria-label="${name(id)} 선택" aria-describedby="heroDescription-${id}">
                    <span class="hero-choice-status" aria-hidden="true"><span class="hero-choice-seal">${keeperSeal}</span><span class="hero-choice-status-text">${choice === id ? '출격 준비' : '지킴이 선택'}</span></span>
                    <span class="hero-choice-art"><span class="keeper-choice-spark" aria-hidden="true">✦</span><img src="assets/${id === 'popo' ? 'popoFrontV41' : id}.webp" alt=""><canvas data-choice-canvas="${id}" width="440" height="560" aria-hidden="true"></canvas></span>
                    <div class="hero-choice-copy"><span>${DREAM_HERO_PROFILES[id].keyword}</span><h3>${name(id)}</h3><p id="heroDescription-${id}">${DREAM_HERO_PROFILES[id].weapon}</p></div>
                </button>`).join('')}
            </div>
            <div id="keeperProfile">${renderDreamHeroProfile(choice)}</div></div>
            <div class="hero-confirm"><p>두 지킴이 모두 같은 이야기와 성장 기회를 가져요.<br>마음이 가는 친구를 골라주세요.</p><button id="confirmHero" class="primary">${name(choice)}와 모험 시작 →</button></div>
            <span id="heroChoiceAnnouncement" class="hero-choice-announcement" role="status" aria-live="polite"></span>`, 'YOUR FIRST FOOTSTEP');
        if(window.DREAM_LOBBY_UI)DREAM_LOBBY_UI.button($('confirmHero'),`${name(choice)}와 모험 시작`,'star','선택한 지킴이로 출발');
        const buttons = [...document.querySelectorAll('[data-hero]')];
        function choose(id) {
            const changed = choice !== id;
            choice = id;
            if (changed) $('keeperProfile').innerHTML = renderDreamHeroProfile(id);
            for (const button of buttons) {
                const selected = button.dataset.hero === choice;
                button.classList.toggle('selected', selected);
                button.setAttribute('aria-pressed', String(selected));
                button.querySelector('.hero-choice-status-text').textContent = selected ? '출격 준비' : '지킴이 선택';
            }
            if(window.DREAM_LOBBY_UI)DREAM_LOBBY_UI.button($('confirmHero'),`${name(choice)}와 모험 시작`,'star','선택한 지킴이로 출발');else $('confirmHero').textContent = `${name(choice)}와 모험 시작 →`;
            const selectedButton = buttons.find(b => b.dataset.hero === id);
            selectedButton.classList.remove('choice-reveal');
            void selectedButton.offsetWidth;
            selectedButton.classList.add('choice-reveal');
            selectedButton.dispatchEvent(new CustomEvent('dream-hero-choice', {bubbles:true, detail:{id}}));
            if (changed) api.sound('stamp');
            $('heroChoiceAnnouncement').textContent = `${name(choice)} 선택. ${DREAM_HERO_PROFILES[id].quote} 아래에서 이 친구의 이야기를 읽어보세요.`;
        }
        for (const button of buttons) {
            button.onclick = () => choose(button.dataset.hero);
            button.onkeydown = event => {
                if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                    event.preventDefault();
                    event.stopPropagation();
                    const next = buttons[event.code === 'ArrowLeft' ? 0 : 1];
                    choose(next.dataset.hero);
                    next.focus({ preventScroll: true });
                    return;
                }
                // The game consumes Space for movement; keep selection buttons operable.
                if (event.code === 'Space') {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!event.repeat) button.click();
                }
            };
        }
        $('confirmHero').onclick = () => {
            api.closeModal();
            confirm(choice);
        };
    }
    function wardrobe(id = selectedLook) {
        if (api.mode !== 'play' && !(api.mode === 'modal' && ['wardrobe', 'bag', 'npc', 'characterDetail'].includes(api.modalKind)))
            return;
        selectedLook = id;
        const ids = Object.keys(C.items).filter(k => C.items[k].type === 'costume'), item = C.items[id] || C.items.softScarf, owned = api.own(id) > 0, recipe = C.costumeRecipes[id], equipped = s().world.look[item.cosmeticSlot] === id, canCraft = recipe && Object.entries(recipe).every(([key, n]) => api.own(key) >= n);
        api.openModal('wardrobe', '나만의 꿈 지킴이', `<div class="wardrobe-layout"><aside class="wardrobe-preview"><span class="small-label">${s().active === 'ari' ? '아리' : '포포'}의 순찰 옷장</span><canvas id="lookPreview" width="360" height="390" aria-label="현재 착용한 캐릭터 모습"></canvas><div class="look-slots">${Object.entries(lookSlots).map(([key, label]) => `<button data-look-slot="${s().world.look[key] || ''}" ${!s().world.look[key] ? 'disabled' : ''}><small>${label}</small><b>${C.items[s().world.look[key]]?.name || '장식 없음'}</b></button>`).join('')}</div></aside><div class="wardrobe-items"><p class="wardrobe-note">탐험의 기억을 입어요. 꾸미기는 장비 능력과 별도로 적용돼요.</p><div class="costume-grid">${ids.map(key => `<button data-look="${key}" data-grade="${C.items[key].grade}" class="costume-item ${key === id ? 'selected' : ''} ${api.own(key) ? '' : 'locked'}">${api.icon(C.items[key].icon, 38)}<b>${C.items[key].name}</b><small>${Object.values(s().world.look).includes(key) ? '착용 중' : api.own(key) ? '보유' : C.costumeRecipes[key] ? '제작 가능 아이템' : '탐험으로 발견'}</small></button>`).join('')}</div><div class="costume-detail"><span>${lookSlots[item.cosmeticSlot]} · ${C.grades[item.grade].name}</span><h3>${item.name}</h3><p>${item.lore}</p>${owned ? `<button id="wearLook" class="primary">${equipped ? '벗기' : '착용하기'}</button>` : recipe ? `<p class="recipe-list">${Object.entries(recipe).map(([key, n]) => `${C.items[key].name} <b>${api.own(key)}/${n}</b>`).join(' · ')}</p><button id="craftLook" class="primary" ${canCraft ? '' : 'disabled'}>재료로 만들기</button>` : `<div class="item-effect">${item.effect}</div>`}</div></div></div>`, 'COLLECT MOMENTS · WEAR YOUR STORY');
        api.preview($('lookPreview'));
        $('lookPreview').insertAdjacentHTML('afterend','<button id="wardrobeDetails" class="drop-guide">전체 장비 · 동작별 착용 보기 ↗</button>');
        $('wardrobeDetails').onclick=()=>api.details();
        document.querySelectorAll('[data-look]').forEach(b => b.onclick = () => wardrobe(b.dataset.look));
        document.querySelectorAll('[data-look-slot]').forEach(b => b.onclick = () => wardrobe(b.dataset.lookSlot));
        if ($('wearLook'))
            $('wearLook').onclick = () => {
                s().world.look[item.cosmeticSlot] = equipped ? null : id;
                api.sound('stamp');
                api.save();
                wardrobe(id);
            };
        if ($('craftLook'))
            $('craftLook').onclick = () => {
                if (api.own(id) || !Object.entries(recipe).every(([key, n]) => api.own(key) >= n))
                    return;
                Object.entries(recipe).forEach(([key, n]) => api.take(key, n));
                api.add(id, 1, false);
                api.sound('memory');
                api.save();
                wardrobe(id);
            };
    }
    function gateOpen(gate) {
        if (!gate)
            return true;
        if (gate === 'bossReady')
            return s().flags.readyForBoss && s().flags.bridgeOpened;
        return !!s().flags[gate];
    }
    function exits(map = s().map) {
        return C.exits[map];
    }
    function travel(ex) {
        if (!gateOpen(ex.gate)) {
            api.toast(ex.hint || '이야기의 다음 단서를 먼저 찾아주세요.', 4);
            return;
        }
        api.enterMap(ex.to, false, ex.arrivalX, ex.arrivalY ?? 651);
    }
    function nearestExit() {
        return exits().filter(e => Math.abs(e.x - api.player.x) < 90 && Math.abs(api.player.y - (e.y ?? 651)) < 65).sort((a, b) => Math.abs(a.x - api.player.x) - Math.abs(b.x - api.player.x))[0] || null;
    }
    function route(dest) {
        const visited = new Set([s().map]), queue = [{ map: s().map, first: null }];
        while (queue.length) {
            const n = queue.shift();
            if (n.map === dest)
                return n.first;
            for (const ex of exits(n.map)) {
                if (visited.has(ex.to) || !gateOpen(ex.gate))
                    continue;
                visited.add(ex.to);
                queue.push({ map: ex.to, first: n.first || ex });
            }
        }
        return null;
    }
    function map(selected = s().map) {
        if (api.mode !== 'play' && !(api.mode === 'modal' && api.modalKind === 'map'))
            return;
        const m = C.maps[selected], known = s().visited.includes(selected), qi = api.activeQuest(), q = C.quests[qi], goal = window.DreamGame?.inspect().journey, next = route(goal?.map ?? q?.map ?? s().map);
        api.openModal('map', '포근등대와 잠의 항구 · 탐험 지도', window.DreamAtlas.island({state:s(),selected,goal,quest:q,next,gateOpen}), 'OUR FIRST NIGHT · FIELD ATLAS');
        document.querySelectorAll('[data-place]').forEach(b => b.onclick = () => map(Number(b.dataset.place)));
        $('atlasSelect').onchange = event => { map(Number(event.target.value)); $('atlasSelect').focus(); };
        $('islandSea').onclick = () => { api.closeModal(); $('journeyWorld').click(); };
        $('islandLocal').onclick = () => { api.closeModal(); $('journeyLocal').click(); };
        $('atlasTravel').onclick = () => {
            if (!known || !s().flags.metLumen)
                return;
            if (selected === 4 && !gateOpen('bossReady')) {
                api.toast('반장의 열쇠와 물길 복구가 필요해요.');
                return;
            }
            api.closeModal();
            api.enterMap(selected);
        };
    }
    const specialKinds = ['tideBell', 'windVane', 'starChart', 'archiveBook', 'waterWheel', 'treasure'];
    function isSpecial(obj) {
        return specialKinds.includes(obj.kind);
    }
    function label(obj) {
        return { tideBell: ['낮은 조수종', '가운데 조수종', '높은 조수종'][obj.index] + ' 울리기', windVane: '풍향계 돌리기 · ' + ['북', '동', '남', '서'][s().world.vanes[obj.index] || 0], starChart: '오래된 별지도 읽기', archiveBook: '마지막 순찰 기록 읽기', waterWheel: '꿈빛 수차 복구하기', treasure: '기억이 담긴 상자 열기' }[obj.kind];
    }
    function cleared() {
        return !api.enemies.some(e => !e.dead && !e.wild);
    }
    function finish(flag, memory, item, dialogue) {
        if (s().flags[flag])
            return;
        s().flags[flag] = true;
        if (item)
            api.add(item);
        api.memory(memory);
        api.sound('clear');
        api.save();
        api.dialogue(dialogue);
        api.refresh();
    }
    function interact(obj) {
        const w = s().world;
        if (obj.kind === 'treasure') {
            if (w.treasure.includes(obj.id)) {
                api.toast('이 상자의 기억은 이미 가방에 담았어요.');
                return;
            }
            w.treasure.push(obj.id);
            api.add('thread', 2);
            api.add(obj.id === 'tideTreasure' ? 'seaGlass' : 'dreamDust', 4);
            s().light += 20;
            api.save();
            return;
        }
        if (obj.kind === 'tideBell') {
            if (s().flags.tideAttuned) {
                api.sound('memory');
                api.toast('바다의 신호가 별지도에 남아 있어요.');
                return;
            }
            if (!cleared()) {
                api.toast('먼저 동굴의 어둑이들을 정화하면 종소리가 잘 들릴 거예요.');
                return;
            }
            const order = [0, 2, 1];
            if (obj.index === order[w.tideStep]) {
                w.tideStep++;
                api.sound('memory');
                api.toast('조수종 ' + w.tideStep + '/3 · 낮은 종 → 높은 종 → 가운데 종');
            }
            else {
                w.tideStep = obj.index === 0 ? 1 : 0;
                api.sound('jump');
                api.toast('파도에 적힌 순서: 낮음 → 높음 → 가운데. 다시 들어봐요.', 4);
            }
            api.save();
            if (w.tideStep === 3) {
                api.add('seaGlass', 3, false);
                finish('tideAttuned', 'tideMemory', 'tideScarf', 'tideSolved');
            }
            return;
        }
        if (obj.kind === 'windVane') {
            if (s().flags.windAttuned) {
                api.toast('바람의 신호를 되찾았어요. 관측소 언덕길이 열려 있어요.');
                return;
            }
            w.vanes[obj.index] = (w.vanes[obj.index] + 1) % 4;
            api.sound('stamp');
            api.toast(['서쪽', '가운데', '동쪽'][obj.index] + ' 풍향계 · ' + ['북', '동', '남', '서'][w.vanes[obj.index]] + ' / 비문의 방향: 동 → 서 → 북', 4);
            api.save();
            if (w.vanes.every((v, i) => v === [1, 3, 0][i]) && cleared())
                finish('windAttuned', 'windMemory', null, 'windSolved');
            else if (w.vanes.every((v, i) => v === [1, 3, 0][i]))
                api.toast('방향은 맞아요. 정원의 어둑이를 정화하면 바람이 이어져요.');
            return;
        }
        if (obj.kind === 'starChart') {
            if (s().flags.starChartRead) {
                api.toast('옛 지도에는 창고 골목과 기록실이 이어져 있어요.');
                return;
            }
            if (!s().flags.tideAttuned || !s().flags.windAttuned) {
                api.toast('바다와 바람의 두 신호가 필요해요. 두 갈래 조사부터 마쳐요.', 4);
                return;
            }
            sequencePuzzle('starChart', '함께 그리는 별지도', '달이 바다를 비추고, 바람이 돌아오는 길을 잇는다.', ['☾ 달', '≈ 파도', '❋ 바람'], () => finish('starChartRead', 'chartMemory', null, 'chartSolved'));
            return;
        }
        if (obj.kind === 'archiveBook') {
            if (s().flags.archiveRead) {
                api.toast('편지 조각을 뒤뚱에게 맡기면 그날의 말을 온전히 읽을 수 있어요.');
                return;
            }
            if (!cleared()) {
                api.toast('기록을 감싸고 있는 어둑이들을 먼저 정화해주세요.');
                return;
            }
            s().flags.archiveRead = true;
            api.add('starCrown');
            api.save();
            api.dialogue('archiveRead');
            return;
        }
        if (obj.kind === 'waterWheel') {
            if (s().flags.bridgeOpened) {
                api.toast('수차가 꿈빛을 등대로 보내고 있어요. 항구 승강기를 이용할 수 있어요.');
                return;
            }
            if (!s().flags.readyForBoss) {
                api.toast('반장에게 임명장을 보여드리면 수차와 창고의 열쇠를 받을 수 있어요.', 4);
                return;
            }
            if (!cleared()) {
                api.toast('물길의 어둑이를 정화해서 수차 주변을 정리해주세요.');
                return;
            }
            pipePuzzle();
        }
    }
    function sequencePuzzle(kind, title, clue, labels, complete) {
        let progress = 0;
        api.openModal(kind, title, `<div class="story-puzzle"><div class="puzzle-emblem">✧</div><p>${clue}</p><div id="puzzleProgress" class="puzzle-progress">○　○　○</div><div class="puzzle-buttons">${labels.map((name, i) => `<button data-puzzle="${i}">${name}</button>`).join('')}</div><p id="puzzleHint">기억에 적힌 순서대로 신호를 이어주세요.</p></div>`, 'A MEMORY BECOMES A PATH');
        document.querySelectorAll('[data-puzzle]').forEach(b => b.onclick = () => {
            if (Number(b.dataset.puzzle) !== progress) {
                $('puzzleHint').textContent = '천천히 떠올려요. ' + labels[progress] + '의 차례예요.';
                return;
            }
            progress++;
            api.sound('memory');
            $('puzzleProgress').textContent = Array.from({ length: 3 }, (_, i) => i < progress ? '✦' : '○').join('　');
            if (progress === 3) {
                api.closeModal();
                complete();
            }
        });
    }
    function pipePuzzle() {
        let valves = [0, 0, 0];
        api.openModal('pipes', '다시 이어지는 꿈빛 물길', `<div class="story-puzzle"><div class="puzzle-emblem">⌁</div><p>반장의 도면: <b>첫 밸브 동쪽 → 가운데 남쪽 → 마지막 동쪽</b><br>밸브를 돌려 물이 등대까지 흐르게 해주세요.</p><div class="valve-row">${valves.map((_, i) => `<button data-valve="${i}"><small>${i + 1}번 밸브</small><strong>↑</strong><span>북</span></button>`).join('')}</div><button id="openWater" class="primary">물길 열어보기</button><p id="pipeHint">밸브를 한 번 누르면 시계 방향으로 돌아가요.</p></div>`, 'THE WAY BACK HOME');
        document.querySelectorAll('[data-valve]').forEach(b => b.onclick = () => {
            const i = Number(b.dataset.valve);
            valves[i] = (valves[i] + 1) % 4;
            b.querySelector('strong').textContent = ['↑', '→', '↓', '←'][valves[i]];
            b.querySelector('span').textContent = ['북', '동', '남', '서'][valves[i]];
            api.sound('stamp');
        });
        $('openWater').onclick = () => {
            if (!valves.every((n, i) => n === [1, 2, 1][i])) {
                $('pipeHint').textContent = '아직 이어지지 않은 관이 있어요. 동 → 남 → 동 방향을 확인해요.';
                return;
            }
            api.closeModal();
            finish('bridgeOpened', 'waterMemory', null, 'bridgeSolved');
        };
    }
    function missionsHTML() {
        const now = api.activeQuest(), current = C.quests[now < 0 ? C.quests.length - 1 : now], html = [];
        for (let act = 1; act <= 4; act++) {
            const quests = C.quests.map((q, i) => ({ ...q, i })).filter(q => q.act === act);
            html.push(`<div class="act-heading"><b>${C.acts[act]}</b><span>${quests.filter(q => api.questComplete(q.i)).length}/${quests.length}</span></div>`);
            if (act > current.act) {
                html.push('<p class="future-act">앞선 이야기에서 단서를 찾으면 다음 장이 열려요.</p>');
                continue;
            }
            for (const q of quests) {
                const complete = api.questComplete(q.i), claimed = s().claimed.includes(q.i);
                html.push(`<div class="mission-row ${complete ? 'done' : ''} ${q.i === now ? 'current-mission' : ''}"><span class="mission-check">${complete ? '✓' : q.i === now ? '→' : '○'}</span><div><b>${q.name}</b><p>${q.description} &nbsp; ${api.questCount(q.i)}/${q.goal}</p></div><button class="stamp" data-claim="${q.i}" ${!complete || claimed ? 'disabled' : ''}>${claimed ? '도장 완료' : complete ? '꿈도장 찍기' : '꿈빛 +' + q.reward}</button></div>`);
            }
        }
        return html.join('');
    }
    function update() {
        const state = s();
        if (!state?.world)
            return;
        const grants = [['replyDelivered', 'mailBag'], ['beaconsRewarded', 'lampPack'], ['completed', 'starTrail']];
        for (const [flag, id] of grants)
            if (state.flags[flag] && !api.own(id)) {
                api.add(id);
                api.save();
            }
        if (api.mode !== 'play')
            return;
        if (state.map === 6 && !state.flags.windAttuned && state.world.vanes.every((v, i) => v === [1, 3, 0][i]) && cleared())
            finish('windAttuned', 'windMemory', null, 'windSolved');
        const r = state.rpg, w = state.world;
        for (const id of r.gathered) {
            if (w.harvestAt[id] === undefined)
                w.harvestAt[id] = state.time;
        }
        r.gathered = r.gathered.filter(id => {
            if (state.time - w.harvestAt[id] < 90)
                return true;
            delete w.harvestAt[id];
            return false;
        });
    }
    return { initialize, migrate, selectHero, wardrobe, gateOpen, exits, travel, nearestExit, route, map, isSpecial, label, interact, missionsHTML, update };
};
