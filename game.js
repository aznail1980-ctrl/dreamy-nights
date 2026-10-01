'use strict';
(() => {
    const C = window.DREAM_CONTENT, W = 1440, H = 810, GROUND = 651, SAVE_KEY = 'dreamy-nights-chapter-one-v1', SETTINGS_KEY = 'dreamy-nights-settings-v1';
    const $ = id => document.getElementById(id), clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const imageKeys = [...new Set([...Object.keys(window.DREAM_ART_V49.files), ...(window.DREAM_ART_V44?.imageKeys || []), 'wearBeretV42', 'wearCrownV42', 'wearSatchelV42', 'wearBowV42', 'wearCreamScarfV42', 'wearTideScarfV42', 'wearCapeV42', 'ariWalkV41', 'popoWalkV41', 'ariClimbV41', 'popoClimbV41', 'popoFrontV41', 'chestClosedV41', 'chestOpenV41', 'crateV41', 'parcelV41', 'heroAriSprite', 'heroPopoSprite', ...C.remaster.icons.map(k => 'item-' + k), 'ari', 'ariSide', 'ariBody', 'ariLegBack', 'ariLegFront', 'ariAttack', 'popo', 'popoSide', 'popoAttack', 'sand', 'crab', 'box', 'boss', 'sky', 'sea', 'harbor', 'grass', 'platform', 'npcLumen', 'npcBaker', 'npcPost'])];
    let sessionStarted = false, rpg, world, remaster, controls, journey, opening;
    let cameraY = 0, dialogueKey = '', autoClimb = 0;
    let images = {}, renderer, mode = 'loading', modalKind = '', beforeModal = 'play', state, player, enemies = [], particles = [], texts = [], waves = [], rings = [], camera = 0, clock = 0, lastTime = 0, uiTime = 0, saveTime = 0, hitstop = 0, shake = 0, transition = 0, autoWalk = false, interaction = null, dialogue = null, dialogueIndex = 0, dialogueDone = null, lastQuest = -1, dialogueBefore = 'play';
    let impacts = [];
    let toastTimer = 0, speechTimer = 0, splashTimer = 0, saveUnavailable = false, lastFocus = null, companion = { x: 100, y: GROUND }, pet = { x: 40, y: GROUND - 60 };
    const keys = new Set(), cooldowns = { attack: 0, skill: 0, tag: 0, dodge: 0 };
    let dodgeCooldownDuration = 1.35;
    const settings = { voice: true, sound: true, volume: .24, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, largeText: false };
    try {
        const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
        if (raw && typeof raw === 'object') {
            for (const k of ['sound', 'voice', 'reducedMotion', 'largeText'])
                if (typeof raw[k] === 'boolean')
                    settings[k] = raw[k];
            if (Number.isFinite(raw.volume))
                settings.volume = clamp(raw.volume, 0, 1);
        }
    }
    catch {
    }
    class DreamAudio {
        constructor() {
            this.ctx = null;
            this.master = null;
            this.timer = 0;
            this.note = 0;
            this.next = 0;
        }
        unlock() {
            try {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                    this.master = this.ctx.createGain();
                    this.compressor = this.ctx.createDynamicsCompressor();
                    this.compressor.threshold.value = -15;
                    this.compressor.ratio.value = 5;
                    this.compressor.attack.value = .003;
                    this.compressor.release.value = .15;
                    this.master.connect(this.compressor);
                    this.compressor.connect(this.ctx.destination);
                }
                this.ctx.resume().catch(() => {
                });
                this.volume();
            }
            catch {
                settings.sound = false;
            }
        }
        volume() {
            if (this.master && this.ctx)
                this.master.gain.setTargetAtTime(settings.sound ? settings.volume : 0, this.ctx.currentTime, .08);
        }
        tone(freq, duration = .3, gain = .2, type = 'sine', delay = 0) {
            if (!this.ctx || !this.master || !settings.sound)
                return;
            const at = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, at);
            g.gain.setValueAtTime(.001, at);
            g.gain.exponentialRampToValueAtTime(Math.max(.002, gain), at + .02);
            g.gain.exponentialRampToValueAtTime(.001, at + duration);
            o.connect(g);
            g.connect(this.master);
            o.start(at);
            o.stop(at + duration + .03);
        }
        noise(duration = .1, volume = .25, frequency = 1800) {
            if (!this.ctx || !settings.sound)
                return;
            const n = Math.ceil(this.ctx.sampleRate * duration), buffer = this.ctx.createBuffer(1, n, this.ctx.sampleRate), data = buffer.getChannelData(0);
            for (let i = 0; i < n; i++)
                data[i] = (Math.random() * 2 - 1) * (1 - i / n);
            const source = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
            source.buffer = buffer;
            filter.type = 'bandpass';
            filter.frequency.value = frequency;
            filter.Q.value = .7;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(.001, this.ctx.currentTime + duration);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);
            source.start();
        }
        thump(frequency = 180, volume = .6, duration = .18) {
            if (!this.ctx || !settings.sound)
                return;
            const o = this.ctx.createOscillator(), gain = this.ctx.createGain(), t = this.ctx.currentTime;
            o.type = 'triangle';
            o.frequency.setValueAtTime(frequency, t);
            o.frequency.exponentialRampToValueAtTime(42, t + duration);
            gain.gain.setValueAtTime(volume, t);
            gain.gain.exponentialRampToValueAtTime(.001, t + duration);
            o.connect(gain);
            gain.connect(this.master);
            o.start(t);
            o.stop(t + duration + .02);
        }
        impact(type, heavy, finish) {
            if (!this.ctx || !settings.sound)
                return;
            this.events = (this.events || []).concat({ type, heavy, finish, time: clock }).slice(-12);
            const base = { sand: 135, crab: 240, box: 170, boss: 95 }[type] || 160;
            this.thump(base * (.96 + Math.random() * .08), heavy ? .95 : .64, heavy ? .24 : .14);
            this.noise(heavy ? .15 : .09, heavy ? .85 : .48, type === 'box' ? 1200 : type === 'crab' ? 3300 : 2100);
            this.tone(type === 'crab' ? 1140 : 780, .085, .21, 'triangle');
            if (heavy) {
                this.noise(.2, .28, 650);
                this.tone(392, .27, .22, 'sine', .04);
            }
            if (finish) {
                this.thump(100, .72, .25);
                [784, 1047, 1318].forEach((f, i) => this.tone(f, .32, .18, 'sine', .035 + i * .035));
            }
        }
        sfx(kind) {
            this.events = (this.events || []).concat({ event: kind, time: clock }).slice(-24);
            const region={regionRush:[150,210,550],regionFan:[660,990,1900],regionHop:[190,285,950],regionSeed:[440,880,2600],regionInk:[120,240,650],regionWake:[330,660,1200]};
            if(region[kind]){
                const [low,high,noise]=region[kind];
                this.tone(low,.16,.16,'triangle');this.tone(high,.2,.12,'sine',.045);
                this.noise(kind==='regionFan'?.35:.14,.14,noise);return;
            }
            const special = { loot: [880, 1175, 1568, 2093], chest: [392, 587, 784, 1175, 1568], camp: [262, 330, 392, 523], arrive: [659, 880, 1047], mechanism: [147, 220, 294, 440], wind: [740, 988, 1318], rattle: [196, 247, 294], claw: [110, 220], sandRush: [146, 196], step: [90], gather: [784, 988, 1175] };
            if (special[kind]) {
                special[kind].forEach((f, i) => this.tone(f, kind === 'camp' ? .7 : .24, kind === 'step' ? .025 : .18, kind === 'mechanism' ? 'triangle' : 'sine', i * .06));
                if (['mechanism', 'claw', 'rattle'].includes(kind)) {
                    this.noise(.16, .25, kind === 'claw' ? 3100 : 950);
                    this.thump(160, .4, .16);
                }
                if (kind === 'wind')
                    this.noise(.6, .08, 1500);
                if (kind === 'sandRush')
                    this.noise(.28, .22, 550);
                return;
            }
            if (kind === 'chargeReady') {
                [523, 784, 1047].forEach((f, i) => this.tone(f, .18, .17, 'sine', i * .035));
                return;
            }
            if (kind === 'chargeRelease') {
                this.noise(.28, .45, 1600);
                this.thump(190, .85, .30);
                return;
            }
            if (kind === 'attack') {
                this.noise(.11, .35, 2600);
                this.thump(330, .09, .075);
                return;
            }
            if (kind === 'skill') {
                this.noise(.32, .3, 1100);
                this.thump(250, .7, .32);
                [392, 587, 880].forEach((f, i) => this.tone(f, .4, .22, 'triangle', i * .03));
                return;
            }
            const table = { hit: [330, 440], purify: [523, 784, 1047], jump: [392, 523], dodge: [740, 880], tag: [659, 880], memory: [659, 784, 1047], clear: [523, 659, 784, 1047, 1318], hurt: [233, 196], stamp: [523, 1047] };
            (table[kind] || [523]).forEach((f, i) => this.tone(f, kind === 'clear' ? .7 : .19, kind === 'purify' ? .15 : .24, 'sine', i * .055));
        }
        update(dt) {
            if (!this.ctx || !settings.sound || ['modal', 'pause', 'ending', 'opening'].includes(mode))
                return;
            this.timer -= dt;
            this.ambientTimer = (this.ambientTimer || 0) - dt;
            const map = C.maps[state?.map || 0], theme = map.theme;
            const score = { beach: [.44, 0, 'sine'], trail: [.37, 2, 'triangle'], town: [.49, -2, 'sine'], alley: [.48, -5, 'triangle'], boss: [.25, -7, 'triangle'], tide: [.60, -5, 'sine'], garden: [.36, 5, 'sine'], observatory: [.64, 7, 'sine'], archive: [.57, -2, 'triangle'], waterway: [.42, -5, 'sine'] }[theme] || [.5, 0, 'sine'];
            if (this.scoreTheme !== theme) {
                this.scoreTheme = theme;
                this.note = 0;
                this.timer = 0;
                this.musicChanges = (this.musicChanges || []).concat(theme).slice(-15);
            }
            if (this.ambientTimer <= 0) {
                this.ambientTimer = 4 + Math.random() * 3;
                if (['beach', 'tide', 'waterway'].includes(theme)) {
                    this.noise(1.4, .026, theme === 'waterway' ? 600 : 350);
                    this.tone(1100 + Math.random() * 500, .35, .018, 'sine', .3);
                }
                else if (['trail', 'garden'].includes(theme)) {
                    this.noise(1.1, .014, 1800);
                    this.tone(1480, .15, .019, 'sine');
                    this.tone(1760, .16, .013, 'sine', .2);
                }
                else if (theme === 'archive')
                    this.noise(.18, .017, 900);
            }
            if (this.timer > 0)
                return;
            this.timer = score[0];
            const n = this.note++, bars = [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], chord = bars[Math.floor(n / 16) % 4], motifs = [[0, 2, 1, 3, 2, 1, 0, 1], [2, 1, 0, 2, 3, 2, 1, 0], [0, 1, 2, 1, 3, 2, 0, 1]], motif = motifs[Math.floor(n / 32) % 3], semi = chord[motif[n % 8]], root = 130.81 * Math.pow(2, score[1] / 12), duck = this.ducked ? .26 : 1;
            if (n % 8 !== 7)
                this.tone(root * 4 * Math.pow(2, semi / 12), score[0] * 2.8, .039 * duck, score[2]);
            if (n % 2 === 0)
                this.tone(root * 2 * Math.pow(2, chord[(n / 2) % 4] / 12), score[0] * 1.8, .021 * duck, 'triangle', .06);
            if (n % 8 === 0) {
                this.tone(root * Math.pow(2, chord[0] / 12), score[0] * 7.6, .043 * duck, 'sine');
                this.tone(root * 1.5 * Math.pow(2, chord[0] / 12), score[0] * 7, .014 * duck, 'sine');
            }
            if (['town', 'trail', 'garden', 'boss', 'waterway'].includes(theme) && n % 4 === 2)
                this.noise(.05, (theme === 'boss' ? .07 : .016) * duck, 1800);
            if (theme === 'boss' && n % 4 === 0)
                this.thump(84, .15 * duck, .16);
        }
    }
    const audio = new DreamAudio();
    function defaultState() {
        return remaster.initialize(world.initialize(rpg.initialize({ version: 3, map: 0, x: 185, hp: 6, active: 'ari', xp: 0, light: 0, snacks: 3, killed: [], memories: [], claimed: [], visited: [0], flags: { introSeen: false, firstMemory: false, metLumen: false, bossIntroduced: false, completed: false, walkHint: false, skillHint: false, jumped: false, pomiRescue: false }, time: 0 })));
    }
    function validateSave(raw) {
        if (!raw || ![1, 2, 3, 4].includes(raw.version) || !Number.isInteger(raw.map) || raw.map < 0 || raw.map >= C.maps.length)
            return null;
        const s = defaultState(), ids = C.maps.flatMap(m => m.enemies.map(e => e.id));
        for (const k of ['xp', 'light', 'snacks', 'time'])
            if (Number.isFinite(raw[k]))
                s[k] = clamp(raw[k], 0, k === 'snacks' ? 9 : 1e7);
        s.map = raw.map;
        s.x = clamp((Number(raw.x) || 185) * (raw.version < 4 ? C.remaster.scale : 1), 90, C.maps[s.map].width - 90);
        s.hp = clamp(Number(raw.hp) || 6, .5, 12);
        s.active = raw.active === 'popo' ? 'popo' : 'ari';
        for (const [k, valid] of [['killed', ids], ['memories', C.memories.map(m => m.id)], ['claimed', C.quests.map((_, i) => i)], ['visited', C.maps.map((_, i) => i)]]) {
            if (Array.isArray(raw[k]))
                s[k] = [...new Set(raw[k].filter(x => valid.includes(x)))];
        }
        if (raw.flags && typeof raw.flags === 'object')
            for (const k of Object.keys(s.flags))
                s.flags[k] = raw.flags[k] === true;
        if (!s.visited.includes(s.map))
            s.visited.push(s.map);
        s.y = raw.version === 4 && Number.isFinite(raw.y) ? clamp(raw.y, 31, GROUND) : GROUND;
        return remaster.initialize(world.migrate(rpg.migrate(s, raw), raw), raw);
    }
    function loadSave() {
        try {
            return validateSave(JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'));
        }
        catch {
            return null;
        }
    }
    function save() {
        if (!sessionStarted || !state || state.hp <= 0)
            return;
        state.x = clamp(player?.x || state.x, 90, C.maps[state.map].width - 90);
        state.y = player?.grounded ? player.y : (player?.groundY ?? GROUND);
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        }
        catch {
            if (!saveUnavailable) {
                saveUnavailable = true;
                toast('이 브라우저에서는 자동 저장을 사용할 수 없어요.');
            }
        }
    }
    function saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
        catch {
        }
        applySettings();
    }
    function applySettings() {
        $('stage').classList.toggle('reduced-motion', settings.reducedMotion);
        $('stage').classList.toggle('large-text', settings.largeText);
        document.querySelectorAll('.sound-toggle').forEach(b => {
            b.textContent = settings.sound ? '♫' : '♪';
            b.setAttribute('aria-pressed', String(settings.sound));
            b.title = settings.sound ? '소리 끄기' : '소리 켜기';
            b.style.opacity = settings.sound ? '1' : '.55';
        });
        audio.volume();
    }
    function fit() {
        const padding = getComputedStyle(document.body);
        const view = window.visualViewport;
        const layout = window.dreamViewport({ width: view?.width || innerWidth, height: view?.height || innerHeight,
            coarse: matchMedia('(pointer:coarse)').matches,
            left: parseFloat(padding.paddingLeft) || 0, right: parseFloat(padding.paddingRight) || 0,
            top: parseFloat(padding.paddingTop) || 0, bottom: parseFloat(padding.paddingBottom) || 0 });
        document.documentElement.style.setProperty('--viewport-height', (view?.height || innerHeight) + 'px');
        $('shell').style.width = layout.width + 'px';
        $('shell').style.height = layout.height + 'px';
        $('stage').style.height = layout.stageHeight + 'px';
        $('stage').style.transform = `scale(${layout.scale})`;
        $('stage').style.setProperty('--touch-size', layout.touchSize + 'px');
        $('stage').style.setProperty('--stage-height', layout.stageHeight + 'px');
        $('stage').dataset.layout = layout.portrait ? 'portrait' : layout.coarse ? 'landscape' : 'desktop';
    }
    function show(id, on = true) {
        $(id).classList.toggle('hidden', !on);
    }
    function maxHP() {
        return Math.min(8, 6 + Math.floor((level() - 1) / 3)) + (rpg?.stats().hp || 0);
    }
    function level() {
        return 1 + Math.floor((state?.xp || 0) / 75);
    }
    function toast(text, duration = 3) {
        $('toast').textContent = text;
        toastTimer = duration;
        show('toast');
    }
    function say(text, duration = 5, name = state?.active === 'popo' ? '포포' : '아리') {
        $('speechText').textContent = text;
        $('speechName').textContent = name;
        speechTimer = duration;
        show('speech');
    }
    function floatText(text, x, y, color = '#fff4c4') {
        texts.push({ text, x, y, life: 1.15, max: 1.15, color });
    }
    function spark(x, y, count = 14, color = '#ffe3a0', power = 200) {
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, v = power * (.3 + Math.random() * .7);
            particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 45, life: .5 + Math.random() * .7, max: 1.2, r: 2 + Math.random() * 5, color });
        }
    }
    function ring(x, y, r = 150, color = '#fff0af') {
        rings.push({ x, y, r, life: .48, max: .48, color });
    }
    function questCount(i) {
        const q = C.quests[i];
        return q.flag ? Number(state.flags[q.flag]) : q.ids.filter(id => state.killed.includes(id)).length;
    }
    function questComplete(i) {
        return questCount(i) >= C.quests[i].goal;
    }
    function activeQuest() {
        return C.quests.findIndex((_, i) => !questComplete(i));
    }
    function bossUnlocked() {
        return world.gateOpen('bossReady') && rpg.own('warehouseKey') > 0;
    }
    function currentMap() {
        return C.maps[state.map];
    }
    function memory(id) {
        if (state.memories.includes(id))
            return;
        state.memories.push(id);
        const m = C.memories.find(m => m.id === id);
        audio.sfx('memory');
        toast('반짝 기억 발견 · ' + m.name, 3.8);
        spark(player.x, player.y - 100, 35, '#fff1a7');
        state.light += 10;
        save();
    }
    const conversation = window.createDreamConversation({settings, images});
    function setMode(next) {
        mode = next;
        if (next !== 'modal') delete $('stage').dataset.modalKind;
        $('stage').dataset.mode = next;
        clearControls();
        autoWalk = false;
        show('hud', next === 'play' || next === 'dialogue' || next === 'modal' || next === 'fail');
    }
    function makePlayer(x) {
        return { x, y: GROUND, vx: 0, vy: 0, facing: 1, grounded: true, coyote: .12, jumpBuffer: 0, invincible: 1, attackT: 0, attackLength: .38, dodgeT: 0, combo: 0, comboT: 0, walkTime: 0, walkBlend: 0, lean: 0, landSquash: 0, groundY: GROUND, pendingStrike: null, stepDistance: 0, attackBuffer: 0, hitT: 0, recoilV: 0, climbDetachT: 0, moveAxis: 0, motionSpeed: 0, chargeHeld: false, chargeT: 0, chargeLevel: 0, chargeReady: false };
    }
    function makeEnemies() {
        return currentMap().enemies.map(e => ({ ...e, home: e.x, y: e.y ?? GROUND, floorY: e.y ?? GROUND, hp: Math.round(C.creatures[e.type].hp * (e.hpScale || 1)), max: Math.round(C.creatures[e.type].hp * (e.hpScale || 1)), dead: !e.wild && state.killed.includes(e.id), fade: 0, hurt: 0, stun: 0, timer: e.type === 'boss' ? 2.2 : 1 + Math.random(), windup: 0, phase: 'rest', phaseT: 2.4, pattern: 0, face: -1, zone: null, elapsed: Math.random() * 4 }));
    }
    function enterMap(index, fromRight = false, x = null, y = GROUND) {
        remaster?.stopVoice();
        state.map = index;
        C.syncHeroItems(state.active);
        const popo = state.active === 'popo';
        C.items.baton.name = popo ? '신입의 꿈도장 해머' : '신입의 꿈배턴';
        C.items.stellarBaton.name = popo ? '다시 빛나는 꿈해머' : '다시 빛나는 꿈배턴';
        C.items.baton.icon = C.items.stellarBaton.icon = popo ? 'hammer' : 'wand';
        state.x = x ?? (fromRight ? C.maps[index].width - 180 : 180);
        player = makePlayer(state.x);
        player.y = y;
        player.groundY = y;
        state.y = y;
        cameraY = clamp(y - 570, -650, 0);
        camera = clamp(player.x - W * .4, 0, C.maps[index].width - W);
        companion = { x: player.x - 100, y: GROUND, vx: 0, vy: 0, facing: 1, grounded: true, groundY: GROUND, walkTime: 0, walkBlend: 0, lean: 0, jumpDelay: 0 };
        pet = { x: player.x - 160, y: GROUND - 90 };
        enemies = makeEnemies();
        particles = [];
        waves = [];
        rings = [];
        texts = [];
        autoWalk = false;
        Object.keys(cooldowns).forEach(k => cooldowns[k] = 0);
        if (!state.visited.includes(index))
            state.visited.push(index);
        if (index === 2)
            state.hp = maxHP();
        transition = .45;
        splashTimer = 2.1;
        $('zoneSplash').querySelector('b').textContent = C.maps[index].name;
        show('zoneSplash');
        lastQuest = -1;
        updateHUD();
        save();
    }
    function start(fresh = false, hero = 'ari') {
        sessionStarted = true;
        audio.unlock();
        state = fresh ? defaultState() : loadSave() || defaultState();
        if (fresh)
            state.active = hero;
        show('title', false);
        show('ending', false);
        show('modal', false);
        enterMap(state.map, false, state.x, state.y ?? GROUND);
        setMode('play');
        if (!state.flags.introSeen) {
            startDialogue('intro', () => {
                state.flags.introSeen = true;
                save();
                say('← → 또는 A, D로 이동해 보자. 등대는 오른쪽이야!');
            });
        }
        else if (state.killed.includes('boss1') && !state.flags.bossRecovered) {
            rpg.recoverJournal();
        }
        else
            say(state.flags.metLumen ? '꿈나침반이 있지? 왼쪽 목표와 오른쪽 지도로 다음 길을 확인해 봐.' : '다시 왔구나! 우리 순찰을 계속하자.');
    }
    function toTitle() {
        remaster?.stopVoice();
        if (state)
            save();
        sessionStarted = false;
        setMode('title');
        show('hud', false);
        show('dialogue', false);
        show('ending', false);
        show('modal', false);
        show('zoneSplash', false);
        show('speech', false);
        show('title');
        const s = loadSave();
        show('continueButton', !!s);
        $('startButton').textContent = s ? '새 순찰 시작 →' : '첫 순찰 떠나기 →';
        $('saveSummary').textContent = s ? `${C.maps[s.map].name} · 반짝 기억 ${s.memories.length}/${C.memories.length} · 자동 저장됨` : '키보드와 터치로 플레이 · 자동 저장';
    }
    function newGame() {
        if (loadSave()) {
            openModal('new', '새로운 꿈을 시작할까요?', '<p>현재 순찰의 진행 기록이 새 기록으로 바뀝니다.<br>이어서 진행하려면 돌아가기를 눌러주세요.</p><div class="modal-actions"><button class="primary" id="confirmNew">새 순찰 시작</button><button class="secondary" id="cancelNew">돌아가기</button></div>');
            $('confirmNew').onclick = () => {
                closeModal();
                world.selectHero(hero => start(true, hero));
            };
            $('cancelNew').onclick = closeModal;
        }
        else
            world.selectHero(hero => start(true, hero));
    }
    function startDialogue(key, onDone = () => {
    }) {
        dialogueKey = key;
        dialogue = C.dialogue[key].map(([who, line]) => [C.remoteScenes.includes(key) && ['ari', 'popo'].includes(who) ? state.active : who, line]);
        dialogueIndex = 0;
        dialogueDone = onDone;
        dialogueBefore = mode === 'title' ? 'title' : 'play';
        setMode('dialogue');
        show('zoneSplash', false);
        show('speech', false);
        show('dialogue');
        renderDialogue();
        $('dialogueNext').focus({ preventScroll: true });
    }
    function renderDialogue() {
        const [who, line] = dialogue[dialogueIndex];
        const names = {ari:'아리',popo:'포포',lumen:'루멘 반장',madeleine:'마들렌',post:'뒤뚱',narrator:'잠의 바다'};
        const art = {ari:'ari',popo:'popoFrontV41',lumen:'npcLumen',madeleine:'npcBaker',post:'npcPost'};
        conversation.render({who,name:names[who]||who,portrait:images[art[who]]?.src,line,index:dialogueIndex,total:dialogue.length,active:state.active,key:dialogueKey});
        remaster.readVoice(dialogueKey, dialogueIndex, who, line);
    }
    function nextDialogue(skip = false) {
        if (mode !== 'dialogue')
            return;
        if (!skip && conversation.typing()) { conversation.finish(); return; }
        if (!skip && ++dialogueIndex < dialogue.length) {
            renderDialogue();
            return;
        }
        remaster.stopVoice();
        show('dialogue', false);
        const done = dialogueDone;
        dialogue = null;
        dialogueDone = null;
        setMode(dialogueBefore);
        player.invincible = 1.4;
        done?.();
        updateHUD();
    }
    function finishStory() {
        rpg.recoverJournal();
    }
    function showEnding() {
        setMode('ending');
        show('hud', false);
        show('ending');
        show('zoneSplash', false);
        show('toast', false);
        audio.sfx('clear');
        $('endingStats').innerHTML = `<span>✦ 첫 밤의 지킴이</span><span>정화 ${state.killed.length} / ${C.maps.reduce((n, m) => n + m.enemies.filter(e => !e.wild).length, 0)}</span><span>반짝 기억 ${state.memories.length} / ${C.memories.length}</span><span>전한 마음 ${['herbsDelivered', 'replyDelivered', 'beaconsRewarded'].filter(f => state.flags[f]).length} / 3</span><span>최고 ${state.rpg.stats.bestCombo} 콤보</span>`;
        $('exploreButton').focus({ preventScroll: true });
    }
    function openModal(kind, title, html, eyebrow = 'DREAM KEEPER') {
        remaster?.stopVoice();
        lastFocus = document.activeElement;
        if (mode !== 'modal')
            beforeModal = mode;
        modalKind = kind;
        mode = 'modal';
        $('stage').dataset.mode = 'modal';
        $('modal').dataset.kind = kind;
        $('stage').dataset.modalKind = kind;
        clearControls();
        autoWalk = false;
        $('modalTitle').textContent = title;
        $('modalEyebrow').textContent = eyebrow;
        $('modalContent').innerHTML = html;
        show('modal');
        $('modal').querySelector('.modal-card').scrollTop = 0;
        $('modalClose').focus({ preventScroll: true });
    }
    function closeModal() {
        show('modal', false);
        mode = beforeModal;
        $('stage').dataset.mode = mode;
        delete $('stage').dataset.modalKind;
        modalKind = '';
        clearControls();
        lastFocus?.focus?.({ preventScroll: true });
    }
    function help() {
        openModal('help', '오늘 밤의 순찰 방법', '<div class="help-grid">' + [['이동', '← → / A D'], ['점프', 'Space'], ['사다리', '↑ ↓ / W S'], ['탐험 지도', 'L'], ['세계의 기록', 'V'], ['정화 공격', 'J'], ['꿈빛 파동', 'K'], ['캐릭터 · 장비', 'C / Q'], ['대시', 'Shift / ←← · →→ / AA · DD'], ['대화 · 포털', 'E'], ['간식 먹기', 'H'], ['지도 · 수첩', 'M / N'], ['인벤토리', 'I'], ['공명 정화', 'F']].map(([a, b]) => `<div class="help-item"><span>${a}</span><kbd>${b}</kbd></div>`).join('') + '</div><div class="hint-block">정화 버튼이나 J를 짧게 눌렀다 놓으면 기본 공격, 길게 모았다 놓으면 강한 공격이 나가요. 반짝이는 신호에 놓으면 최대 위력! 점프·대시로 모으기를 취소할 수 있어요.<br>같은 방향키(←/→ 또는 A/D)를 빠르게 두 번 누르거나 Shift로 대시해요. 대시 버튼의 게이지가 가득 차면 다시 쓸 수 있어요. 기본 대기시간은 1.35초이며 ‘답장을 싣는 바람’ 부적으로 줄일 수 있어요.<br>반짝이는 발판 위에는 기억 조각이 숨어 있어요.<br>먼지대장의 바닥 예고를 보면 점프하거나 대시하세요.<br>정화하며 꿈빛 공명을 채우면 F로 기억의 힘을 펼쳐요.<br>가방 I에서 장비를 장착하고 도시락을 사용해보세요.<br>터치 화면에서는 왼손 스틱으로 이동하고 위아래로 사다리를 타요. 오른손으로 정화를 짧게 눌렀다 놓거나, 길게 모아 강한 공격을 쓸 수 있어요. 이동 중 점프·대시도 함께 사용할 수 있어요. 점프를 짧게 누르면 낮게, 길게 누르면 높이 뛰어요. 왼쪽 위 캐릭터 얼굴에서 장비와 동작별 착용 모습을 확인하고 옷장으로 이동할 수 있어요. 진행은 이 브라우저에 자동 저장됩니다.</div>');
    }
    function pause() {
        if (mode === 'modal') {
            closeModal();
            return;
        }
        if (mode !== 'play')
            return;
        save();
        openModal('pause', '잠깐, 별을 바라볼까요?', '<p>순찰은 여기서 잠시 쉬고 있어요. 준비되면 계속해요.</p><label class="settings-row"><span>소리<small>직접 만든 별빛 선율과 정화 효과음</small></span><input type="checkbox" id="soundSetting"></label><label class="settings-row"><span>소리 크기</span><input type="range" id="volumeSetting" min="0" max="100" aria-label="소리 크기"></label><label class="settings-row"><span>편안한 연출<small>화면 흔들림과 입자 움직임을 줄여요.</small></span><input type="checkbox" id="motionSetting"></label><label class="settings-row"><span>큰 글씨<small>대사와 수첩 글씨를 키워요.</small></span><input type="checkbox" id="textSetting"></label><div class="pause-actions"><button id="resume" class="primary">순찰 계속하기 →</button><button id="pauseHelp" class="secondary">조작 방법</button><button id="backTown" class="secondary">항구로 돌아가기</button><button id="backTitle" class="secondary">저장하고 타이틀로</button></div>');
        $('soundSetting').checked = settings.sound;
        $('volumeSetting').value = settings.volume * 100;
        $('motionSetting').checked = settings.reducedMotion;
        $('textSetting').checked = settings.largeText;
        $('soundSetting').onchange = e => {
            settings.sound = e.target.checked;
            audio.unlock();
            saveSettings();
        };
        $('volumeSetting').oninput = e => {
            settings.volume = Number(e.target.value) / 100;
            saveSettings();
        };
        $('motionSetting').onchange = e => {
            settings.reducedMotion = e.target.checked;
            saveSettings();
        };
        $('textSetting').onchange = e => {
            settings.largeText = e.target.checked;
            saveSettings();
        };
        $('resume').onclick = closeModal;
        $('pauseHelp').onclick = () => {
            closeModal();
            help();
        };
        $('backTitle').onclick = toTitle;
        $('backTown').disabled = !state.flags.metLumen;
        $('backTown').onclick = () => {
            closeModal();
            enterMap(2);
        };
    }
    function openMap() {
        if (mode === 'modal' && modalKind === 'map') {
            closeModal();
            return;
        }
        world.map();
    }
    function journal(tab = 'missions') {
        if (mode === 'modal' && modalKind === 'journal' && tab === 'toggle') {
            closeModal();
            return;
        }
        if (mode !== 'play' && !(mode === 'modal' && modalKind === 'journal'))
            return;
        if (tab === 'toggle')
            tab = 'missions';
        let content = '';
        if (tab === 'missions') {
            content = world.missionsHTML();
        }
        else if (tab === 'memories') {
            content = '<div class="memory-grid">' + C.memories.map(m => {
                const own = state.memories.includes(m.id);
                return `<article class="memory-card ${own ? '' : 'locked'}"><span>${own ? m.icon : '✧'}</span><b>${own ? m.name : '아직 만나지 못한 기억'}</b><p>${own ? m.description : m.hint}</p></article>`;
            }).join('') + '</div>' + (state.flags.completed ? '<div class="modal-actions"><button id="friendship" class="secondary">포포의 짧은 우정 이야기 ↗</button></div>' : '');
        }
        else if (tab === 'people') {
            content = rpg.sideHTML();
        }
        else {
            content = '<div class="creature-list">' + Object.entries(C.creatures).map(([key, c]) => {
                const seen = C.maps.flatMap(m => m.enemies).some(e => e.type === key && state.killed.includes(e.id));
                return `<article class="creature-card"><img src="assets/${key}.webp" alt="${c.name}" style="opacity:${seen ? 1 : .35}"><div><b>${c.name}</b><p>${seen ? '“' + c.worry + '”<br>' + c.memory : '처음 정화하면 걱정의 정체를 알 수 있어요.'}</p></div></article>`;
            }).join('') + '</div>';
        }
        openModal('journal', '지킴이 수첩', `<div class="journal-tabs"><button data-tab="missions" class="${tab === 'missions' ? 'active' : ''}">첫 순찰 의뢰</button><button data-tab="memories" class="${tab === 'memories' ? 'active' : ''}">반짝 기억 ${state.memories.length}/${C.memories.length}</button><button data-tab="creatures" class="${tab === 'creatures' ? 'active' : ''}">어둑이 도감</button><button data-tab="people" class="${tab === 'people' ? 'active' : ''}">마을의 부탁</button></div>${content}`, 'OUR LITTLE MEMORIES');
        document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => journal(b.dataset.tab));
        document.querySelectorAll('[data-claim]').forEach(b => b.onclick = () => {
            const i = Number(b.dataset.claim);
            if (!questComplete(i) || state.claimed.includes(i))
                return;
            state.claimed.push(i);
            state.light += C.quests[i].reward;
            rpg.add('cookie', 1, false);
            audio.sfx('stamp');
            toast('순찰 완료—! 꿈빛 +' + C.quests[i].reward + ' · 간식 +1');
            save();
            journal('missions');
            updateHUD();
        });
        if ($('friendship'))
            $('friendship').onclick = () => {
                closeModal();
                startDialogue('friendship');
            };
    }
    function fail() {
        setMode('fail');
        save();
        beforeModal = 'fail';
        openModal('fail', '꿈에서 깼어요!', '<p>다시 잠들까요?<br>찾아낸 기억과 정화한 마음은 그대로 남아 있어요.</p><div class="modal-actions"><button id="retry" class="primary">다시 꿈꾸기 <kbd>R</kbd></button><button id="failTitle" class="secondary">타이틀로</button></div>', '괜찮아요, 잠깐 쉬어가요');
        show('modalClose', false);
        $('retry').onclick = retry;
        $('failTitle').onclick = () => {
            state.hp = maxHP();
            save();
            show('modalClose');
            toTitle();
        };
    }
    function retry() {
        show('modal', false);
        show('modalClose');
        state.hp = maxHP();
        enterMap(state.map);
        setMode('play');
        save();
        say('다시 왔구나! 이번에도 같이 가자.');
    }
    function heal() {
        if (mode === 'play')
            rpg.quickHeal();
    }
    function damage(amount = 1, sourceX = player.x + player.facing) {
        if (player.invincible > 0 || player.dodgeT > 0 || mode !== 'play')
            return;
        if (rpg.absorb())
            return;
        state.hp = Math.max(0, state.hp - amount);
        player.invincible = 1.4;
        const away = Math.sign(player.x - sourceX) || -player.facing;
        cancelCharge();
        player.hitT = .16;
        player.recoilV = player.climbing ? 0 : away * 240;
        player.pendingStrike = null;
        player.attackT = 0;
        if (!player.climbing) player.climbDetachT = .3;
        audio.sfx('hurt');
        shake = settings.reducedMotion ? 0 : 5;
        floatText('잠깐, 숨 고르기', player.x, player.y - 175, '#ffe2df');
        if (state.flags.metLumen && state.hp <= 2 && !state.flags.pomiRescue) {
            state.flags.pomiRescue = true;
            state.hp = Math.min(maxHP(), state.hp + 2);
            toast('포미의 응원 · 기운 내! 마음 +2');
        }
        if (state.hp <= 0)
            fail();
        updateHUD();
    }
    function defeat(e) {
        e.dead = true;
        e.fade = .55;
        if (!state.killed.includes(e.id))
            if (!e.wild)
                state.killed.push(e.id);
        rpg.rewardKill(e);
        const c = C.creatures[e.type], oldLevel = level();
        state.xp += c.exp;
        state.light += c.light;
        spark(e.x, e.y - c.size * .55, e.type === 'boss' ? 85 : 28, '#ffe6a0', e.type === 'boss' ? 440 : 230);
        ring(e.x, e.y - c.size * .5, c.size * 1.2);
        audio.sfx('purify');
        floatText('정화 완료!  +' + c.light + ' ✧', e.x, e.y - c.size - 25);
        if (level() > oldLevel) {
            state.hp = maxHP();
            toast('Lv. ' + level() + ' · 마음이 한층 더 단단해졌어요!');
        }
        if (e.type === 'boss') {
            waves = [];
            rpg.recoverJournal();
        }
        else if (!state.flags.firstMemory) {
            state.flags.firstMemory = true;
            memory('pillow');
            startDialogue('firstMemory', () => say('발판 위의 반짝임도 찾아보자. Space로 폴짝!'));
        }
        else if (questComplete(activeQuest() === -1 ? C.quests.length - 1 : Math.max(0, lastQuest))) {
            say('잘했어! 수첩에 꿈도장을 찍고 다음 길로 가자.');
        }
        save();
        updateHUD();
    }
    function hit(e, power, impact = 'skill') {
        if (e.dead)
            return;
        const charged = impact === 'charged', heavy = impact !== 'light', finish = e.hp <= power, dir = Math.sign(e.x - player.x) || player.facing;
        rpg.hit();
        e.hp = Math.max(0, e.hp - power);
        e.hurt = .28;
        e.stun = e.type === 'boss' ? (charged ? .24 : .08) : charged ? .65 : .24;
        e.knockV = dir * (e.type === 'boss' ? (charged ? 145 : heavy ? 75 : 28) : charged ? 510 : heavy ? 290 : 95);
        e.poise = (e.poise || 0) + power;
        const threshold = e.type === 'boss' ? 28 : 10;
        if (e.poise >= threshold && !finish) {
            e.poise = 0;
            e.stun = e.type === 'boss' ? .7 : .85;
            e.windup = 0;
            e.action = null;
            e.y = e.floorY ?? GROUND;
            if (e.type === 'boss') {
                e.phase = 'rest';
                e.phaseT = .9;
            }
            floatText('걱정이 흔들려요!', e.x, e.y - C.creatures[e.type].size - 45, '#ffeac0');
        }
        hitstop = settings.reducedMotion ? 0 : charged ? .11 : heavy ? .085 : .055;
        shake = settings.reducedMotion ? 0 : charged ? 10 : heavy ? 6.5 : 3.3;
        impacts.push({ x: e.x, y: e.y - C.creatures[e.type].size * .5, life: charged ? .46 : heavy ? .32 : .24, max: charged ? .46 : heavy ? .32 : .24, charged, heavy, dir, seed: Math.random() * 6 });
        spark(e.x, e.y - C.creatures[e.type].size * .5, heavy ? 20 : 11, heavy ? '#fff1ca' : '#ffe4ac', heavy ? 320 : 220);
        audio.impact(e.type, heavy, finish);
        if (e.hp <= 0)
            defeat(e);
        else
            floatText(String(power) + (heavy ? '!' : ''), e.x, e.y - C.creatures[e.type].size - 14, heavy ? '#fff0b5' : '#fff5e8');
    }
    function moveAxis() {
        const keyboard = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
        return keyboard || controls?.axisX() || 0;
    }
    function enemyRadius(e) {
        return clamp(C.creatures[e.type].size * .30, 28, 85);
    }
    function withinMeleeHeight(e) {
        const size = C.creatures[e.type].size;
        return player.y - 105 < e.y - 8 && player.y - 18 > e.y - size * .9;
    }
    function meleeTarget(reach = state.active === 'ari' ? 140 : 130) {
        const moving = Math.abs(moveAxis()) > .15;
        return enemies.filter(e => {
            const dx = e.x - player.x;
            return !e.dead && withinMeleeHeight(e) && Math.abs(dx) < reach + enemyRadius(e)
                && (dx * player.facing >= 0 || (!moving && Math.abs(dx) < 95));
        }).sort((a, b) => {
            const score = e => Math.abs(e.x - player.x) + ((e.x - player.x) * player.facing < 0 ? 32 : 0);
            return score(a) - score(b);
        })[0];
    }
    function attack() {
        if (mode !== 'play' || cooldowns.attack > 0 || player.dodgeT > 0 || player.hitT > 0 || player.climbing || player.lift)
            return;
        autoWalk = false;
        if (Math.abs(moveAxis()) > .15) player.facing = Math.sign(moveAxis());
        const target = meleeTarget();
        if (target && Math.abs(target.x - player.x) > 10)
            player.facing = Math.sign(target.x - player.x);
        player.chargeLevel = 0;
        player.attackBuffer = 0;
        player.combo = player.comboT > 0 ? (player.combo % 3) + 1 : 1;
        player.comboT = .95;
        player.attackLength = player.combo === 3 ? .43 : .33;
        player.attackT = player.attackLength;
        player.attackFacing = player.facing;
        cooldowns.attack = player.attackLength;
        // Each swing has a short active interval, and can hit each enemy only once.
        player.pendingStrike = { delay: player.combo === 3 ? .12 : .085, active: .12, combo: player.combo, facing: player.facing, hits: [], started: false };
        audio.sfx('attack');
    }
    function cancelCharge() {
        if (!player) return;
        player.chargeHeld = false;
        player.chargeT = 0;
        player.chargeReady = false;
    }
    function beginCharge() {
        if (mode !== 'play' || player.chargeHeld || player.climbing || player.lift || player.dodgeT > 0 || player.hitT > 0) return;
        autoWalk = false;
        player.chargeHeld = true;
        player.chargeT = 0;
        player.chargeReady = false;
    }
    function releaseAttack(cancelled = false) {
        if (keys.has('attack') || controls?.held('attack')) return;
        if (!player?.chargeHeld) return;
        const held = player.chargeT;
        cancelCharge();
        if (cancelled || mode !== 'play' || player.climbing || player.dodgeT > 0 || player.hitT > 0) return;
        if (held < .35) {
            player.attackBuffer = Math.max(.22, cooldowns.attack + .08);
            attack();
            return;
        }
        const target = meleeTarget(held >= 1.05 ? 255 : 195);
        if (target && Math.abs(target.x - player.x) > 10) player.facing = Math.sign(target.x - player.x);
        player.chargeLevel = held >= 1.05 ? 2 : 1;
        player.combo = 3;
        player.comboT = 0;
        player.attackBuffer = 0;
        player.attackLength = player.chargeLevel === 2 ? .74 : .62;
        player.attackT = player.attackLength;
        player.attackFacing = player.facing;
        cooldowns.attack = player.attackLength;
        player.pendingStrike = {
            delay: .17, active: .17, combo: 3, facing: player.facing, hits: [], started: false,
            reach: player.chargeLevel === 2 ? 255 : 195,
            power: (player.chargeLevel === 2 ? 14 : 8) + Math.round(rpg.stats().attack * 1.5), impact: 'charged'
        };
        audio.sfx('chargeRelease');
    }
    function strike(dt) {
        const swing = player.pendingStrike;
        if (!swing)
            return;
        swing.delay -= dt;
        if (swing.delay > 0)
            return;
        const reach = swing.reach || (state.active === 'ari' ? 140 : 130);
        const power = swing.power || (swing.combo === 3 ? 4 : 2) + rpg.stats().attack;
        if (!swing.started) {
            swing.started = true;
            if (swing.impact === 'charged') {
                spark(player.x + swing.facing * 95, player.y - 18, player.chargeLevel === 2 ? 55 : 32, '#fff0b6', 420);
                ring(player.x + swing.facing * 95, player.y - 7, swing.reach, '#fff0bf');
                shake = settings.reducedMotion ? 0 : 7;
                audio.thump(90, .7, .27);
            }
            if (swing.combo === 3)
                ring(player.x + swing.facing * 78, player.y - 75, 95, '#ffe4b9');
        }
        for (const e of enemies) {
            if (mode !== 'play')
                break;
            const dx = (e.x - player.x) * swing.facing, radius = enemyRadius(e);
            if (!e.dead && !swing.hits.includes(e.id) && withinMeleeHeight(e) && dx >= -radius * .5 && dx < reach + radius) {
                swing.hits.push(e.id);
                hit(e, power, swing.impact || (swing.combo === 3 ? 'finisher' : 'light'));
            }
        }
        swing.active -= dt;
        if (swing.active <= 0)
            player.pendingStrike = null;
    }
    function action(name) {
        if (mode !== 'play')
            return;
        audio.unlock();
        if (name === 'attackPress') return beginCharge();
        if (name === 'attack') {
            player.attackBuffer = Math.max(.22, cooldowns.attack + .08);
            return attack();
        }
        if (name === 'burst') {
            cancelCharge();
            return rpg.teamBurst();
        }
        if (name === 'jump') {
            cancelCharge();
            player.jumpReleased = false;
            player.jumpBuffer = .16;
            autoWalk = false;
            return;
        }
        if (name === 'dodge' && cooldowns.dodge <= 0) {
            cancelCharge();
            dodgeCooldownDuration = Math.max(.35, 1.35 - rpg.stats().dodge);
            cooldowns.dodge = dodgeCooldownDuration;
            player.pendingStrike = null;
            player.attackT = 0;
            if (enemies.some(e => !e.dead && (e.windup > 0 || e.phase === 'warn') && Math.abs(e.x - player.x) < 350) || waves.some(w => Math.abs(w.x - player.x) < 170))
                rpg.perfectDodge();
            player.dodgeFacing = Math.sign(moveAxis()) || player.facing;
            player.facing = player.dodgeFacing;
            player.hitT = 0;
            player.recoilV = 0;
            player.attackBuffer = 0;
            if (player.climbing) {
                player.climbing = null;
                player.climbDetachT = .35;
            }
            player.dodgeT = .26;
            player.invincible = .4;
            autoWalk = false;
            audio.sfx('dodge');
            spark(player.x, player.y - 50, 10, '#ddd0ff', 120);
            updateDashHUD();
        }
        if (name === 'skill' && cooldowns.skill <= 0 && !player.climbing && !player.lift) {
            cancelCharge();
            cooldowns.skill = 5;
            player.pendingStrike = null;
            player.attackLength = .38;
            player.attackT = .38;
            player.attackFacing = player.facing;
            player.invincible = .35;
            autoWalk = false;
            ring(player.x, player.y - 80, 300, '#ffe2a2');
            spark(player.x, player.y - 80, 36, '#f9dbff', 390);
            audio.sfx('skill');
            for (const e of enemies) {
                if (mode !== 'play')
                    break;
                if (!e.dead && Math.abs(e.x - player.x) < 285 && Math.abs(e.y - player.y) < 190)
                    hit(e, 7 + rpg.stats().skill);
            }
            say(state.active === 'popo' ? '반짝반짝 온다온다—!' : '걱정은 바람에, 기억은 마음에!', 2, state.active === 'ari' ? '아리' : '포포');
        }
        if (name === 'wardrobe')
            rpg.details();
    }
    function interact() {
        if (mode !== 'play' || !interaction)
            return;
        autoWalk = false;
        if (interaction.type === 'device') {
            remaster.interact(interaction.device);
            return;
        }
        if (interaction.type === 'portal') {
            world.travel(interaction.exit);
            return;
        }
        rpg.handleInteraction(interaction);
    }
    function updateInteraction() {
        interaction = rpg.nearest() || remaster.nearest();
        if (!interaction) {
            const ex = world.nearestExit();
            if (ex)
                interaction = { type: 'portal', dest: ex.to, exit: ex, label: C.maps[ex.to].name + '로 가기' + (!world.gateOpen(ex.gate) ? ' · 단서 필요' : '') };
        }
        show('interactHint', !!interaction && player.attackT <= 0 && !player.chargeHeld && player.dodgeT <= 0);
        if (interaction)
            $('interactText').textContent = interaction.label || '이야기하기';
    }
    function navigate() {
        if (mode !== 'play')
            return;
        if (!state.flags.metLumen) {
            journal('missions');
            return;
        }
        autoWalk = !autoWalk;
        if (autoWalk)
            toast('꿈나침반을 따라 이동해요. 전투와 조작을 하면 멈춰요.', 2.5);
    }
    function navigationDirection() {
        const qi = activeQuest();
        if (qi < 0) {
            autoWalk = false;
            return 0;
        }
        const q = C.quests[qi];
        let target, targetY = GROUND;
        if (q.map !== state.map) {
            const route = world.route(q.map);
            if (!route) {
                autoWalk = false;
                toast('지도를 펼쳐 다음 단서와 열리지 않은 길을 확인해요.');
                return 0;
            }
            target = route.x;
            targetY = route.y ?? GROUND;
        }
        else if (q.npc || q.targetX) {
            target = C.npcs[q.npc]?.x || q.targetX;
            targetY = C.npcs[q.npc]?.y ?? q.targetY ?? GROUND;
            if (q.flag === 'tideAttuned') {
                const o = C.objects.find(o => o.id === 'tideBell' + [0, 2, 1][Math.min(2, state.world.tideStep)]);
                target = o.x;
                targetY = o.y;
            }
            if (q.flag === 'windAttuned') {
                const index = state.world.vanes.findIndex((v, i) => v !== [1, 3, 0][i]);
                const o = C.objects.find(o => o.id === 'windVane' + Math.max(0, index));
                target = o.x;
                targetY = o.y;
            }
        }
        else {
            const foe = enemies.find(e => !e.dead && !e.wild);
            target = foe ? foe.x : player.x;
            targetY = foe?.floorY ?? GROUND;
            if (foe && Math.abs(foe.x - player.x) < 200 && Math.abs(foe.y - player.y) < 100) {
                autoWalk = false;
                say('여기부터는 함께 정화하자!', 2);
                return 0;
            }
        }
        const routePoint = remaster.routePoint({ x: target, y: targetY });
        autoClimb = routePoint.climb;
        target = routePoint.x;
        if (autoClimb)
            return 0;
        if (Math.abs(target - player.x) < 35 && Math.abs(targetY - player.y) < 75) {
            autoWalk = false;
            if (interaction?.type === 'portal')
                interact();
            return 0;
        }
        return Math.sign(target - player.x);
    }
    function approach(value, target, amount) {
        return value < target ? Math.min(target, value + amount) : Math.max(target, value - amount);
    }
    function stepBody(body, dt) {
        const oldY = body.y;
        body.x = clamp(body.x + (body.vx + (body.recoilV || 0)) * dt, 65, currentMap().width - 65);
        body.vy += 1950 * dt;
        body.y += body.vy * dt;
        let floor = GROUND;
        body.groundY = GROUND;
        for (const p of currentMap().platforms) {
            if (body.x > p.x - 12 && body.x < p.x + p.w + 12) {
                if (body.y <= p.y + 5)
                    body.groundY = Math.min(body.groundY, p.y);
                if (oldY <= p.y + 4 && body.y >= p.y && body.vy >= 0)
                    floor = Math.min(floor, p.y);
            }
        }
        body.grounded = false;
        if (body.y >= floor && body.vy >= 0) {
            if (body.vy > 200) {
                body.landSquash = .18;
                if (body === player)
                    spark(body.x, floor, 6, '#f9e0c0', 70);
            }
            body.y = floor;
            body.vy = 0;
            body.grounded = true;
            body.groundY = floor;
        }
    }
    function updateCompanion(dt) {
        const targetX = player.x - player.facing * 98, dx = targetX - companion.x;
        let speed = clamp(dx * 4.6, -405, 405);
        if (Math.abs(dx) < 14)
            speed = 0;
        companion.vx = approach(companion.vx || 0, speed, dt * 1900);
        if (Math.abs(companion.vx) > 35)
            companion.facing = Math.sign(companion.vx);
        if (companion.jumpDelay > 0) {
            companion.jumpDelay -= dt;
            if (companion.jumpDelay <= 0 && companion.grounded)
                companion.vy = -820;
        }
        if (companion.grounded && Math.abs(dx) > 70 && player.y < companion.y - 70)
            companion.vy = -820;
        stepBody(companion, dt);
        companion.landSquash = Math.max(0, (companion.landSquash || 0) - dt);
    }
    function updatePlayer(dt) {
        Object.keys(cooldowns).forEach(k => cooldowns[k] = Math.max(0, cooldowns[k] - dt));
        for (const k of ['invincible', 'attackT', 'dodgeT', 'comboT', 'jumpBuffer', 'landSquash', 'attackBuffer', 'hitT', 'climbDetachT'])
            player[k] = Math.max(0, player[k] - dt);
        autoClimb = 0;
        let dir = moveAxis();
        if (dir)
            autoWalk = false;
        else if (autoWalk)
            dir = navigationDirection();
        player.moveAxis = dir;
        if (dir && !player.pendingStrike && player.dodgeT <= 0)
            player.facing = Math.sign(dir);
        const speed = 345 * (1 + rpg.stats().speed);
        if (player.chargeHeld && cooldowns.attack <= 0) {
            player.chargeT = Math.min(1.25, player.chargeT + dt);
            if (player.chargeT >= 1.05 && !player.chargeReady) {
                player.chargeReady = true;
                audio.sfx('chargeReady');
                spark(player.x, player.y - 75, 12, '#fff0af', 80);
            }
        }
        let target = dir * speed;
        if (player.chargeHeld && player.chargeT > .25 && player.grounded) target = 0;
        if (player.attackT > 0 && player.grounded)
            target *= .68;
        if (player.hitT > 0)
            target *= .25;
        player.recoilV = approach(player.recoilV, 0, dt * 1250);
        player.vx = player.dodgeT > 0 ? dashVelocity(player.dodgeT, player.dodgeFacing)
            : approach(player.vx, target, dt * (dir ? (player.grounded ? 2400 : 1450) : 3200));
        if (player.grounded)
            player.coyote = .11;
        else
            player.coyote -= dt;
        if (player.jumpBuffer > 0 && player.coyote > 0 && !player.climbing && !player.lift) {
            player.vy = player.jumpReleased ? -600 : -820;
            player.grounded = false;
            player.coyote = 0;
            player.jumpBuffer = 0;
            companion.jumpDelay = .14;
            audio.sfx('jump');
            spark(player.x, player.y, 8, '#fff1d3', 80);
            state.flags.jumped = true;
        }
        const climbDir = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0) || controls?.climbAxis() || autoClimb;
        if (!remaster.climb(dt, climbDir))
            stepBody(player, dt);
        if (autoWalk && player.grounded && Math.abs(player.vx) > 30 && player.y < GROUND - 100 && !currentMap().platforms.some(v => v.y === player.y && player.x + player.facing * 65 > v.x && player.x + player.facing * 65 < v.x + v.w))
            player.jumpBuffer = .16;
        strike(dt);
        if (mode !== 'play')
            return;
        if (player.attackBuffer > 0 && !player.chargeHeld) attack();
        if (state.map === 0 && player.x > 430 && !state.flags.walkHint) {
            state.flags.walkHint = true;
            say(controls?.touch ? '왼쪽 스틱으로 이동하고, 오른쪽 점프 버튼으로 폴짝! 반짝이는 안내를 누르면 상자도 열 수 있어.' : 'Space로 점프! E로 별잎과 상자를 살펴볼 수도 있어.');
        }
        if (state.map === 1 && player.x > 460 && !state.flags.skillHint) {
            state.flags.skillHint = true;
            say(controls?.touch ? '꿈빛 버튼으로 걱정을 털어줘! 공명이 차면 공명 버튼, 모은 옷은 왼쪽 위 얼굴에서 입어보자.' : 'K는 꿈빛 파동! 공명이 차면 F, 모은 옷은 C에서 입어보자.');
        }
        if (state.map === 4 && !state.flags.bossIntroduced && player.x > 580) {
            state.flags.bossIntroduced = true;
            startDialogue('bossIntro');
            save();
        }
        const item = currentMap().memory;
        if (item && !state.memories.includes(item.id) && Math.hypot(player.x - item.x, player.y - 65 - item.y) < 76)
            memory(item.id);
        pet.x += (player.x - player.facing * 163 - pet.x) * Math.min(1, dt * 3);
        pet.y += (player.y - 92 - pet.y) * Math.min(1, dt * 4);
        cameraY += (clamp(player.y - 570, -650, 0) - cameraY) * Math.min(1, dt * 5);
        camera += (clamp(player.x - W * .42 + player.vx * .055, 0, currentMap().width - W) - camera) * Math.min(1, dt * 5.5);
    }
    function advanceEnemyAttack(e, distance) {
        const next = e.x + distance, gap = 23 + enemyRadius(e);
        // Sweep the short rush segment so a low frame rate cannot carry a foe through the hero.
        if (player.dodgeT <= 0 && !player.climbing && Math.abs(player.y - e.y) < 110) {
            const side = Math.sign(player.x - e.x);
            if (side && distance * side > 0 && Math.abs(player.x - e.x) >= gap && (player.x - next) * side < gap) {
                e.x = player.x - side * gap;
                return;
            }
        }
        e.x = next;
    }
    function dashVelocity(remaining, facing) {
        const phase = clamp(1 - remaining / .26, 0, 1);
        return facing * (240 + 140 * phase + 650 * Math.sin(Math.PI * phase));
    }
    function updateTideBell(e, dt) {
        const floor = e.floorY ?? GROUND, dx = player.x - e.x;
        e.y = floor;
        e.timer -= dt;
        if (e.action) {
            e.actionT -= dt;
            if (e.actionT <= 0) {
                if (e.action === 'strike') { e.action = 'recover'; e.actionT = 1.15; }
                else { e.action = null; e.timer = 1.3; }
            }
            return;
        }
        if (e.windup > 0) {
            e.windup -= dt;
            if (e.windup <= 0) {
                e.action = 'strike'; e.actionT = .38;
                waves.push({x:e.x+e.attackFace*60,y:floor-53,vx:e.attackFace*205,life:1.65,r:19,damage:1,kind:'tideBubble',hit:false});
                audio.sfx('claw');
            }
            return;
        }
        if (Math.abs(player.y-floor)<110 && !player.climbing && Math.abs(dx)<350 && e.timer<=0) {
            e.attackFace = Math.sign(dx) || e.face;
            e.face = e.attackFace;
            e.windup = 1.05;
        }
        else e.x = approach(e.x,e.home+Math.sin(e.elapsed*.65)*28,22*dt);
    }
    function updateEnemy(e, dt) {
        e.elapsed += dt;
        if (e.knockV) {
            e.x += e.knockV * dt;
            e.knockV *= Math.exp(-10 * dt);
        }
        e.hurt = Math.max(0, e.hurt - dt);
        e.stun = Math.max(0, e.stun - dt);
        if (e.dead) {
            e.fade = Math.max(0, e.fade - dt);
            if (e.wild) {
                e.respawn = (e.respawn ?? 28) - dt;
                if (e.respawn <= 0 && Math.abs(e.x - player.x) > 700) {
                    e.dead = false;
                    e.hp = e.max;
                    e.x = e.home;
                    e.y = e.floorY;
                    e.action = null;
                    e.windup = 0;
                    e.respawn = 28;
                }
            }
            return;
        }
        if (e.stun > 0)
            return;
        const c = C.creatures[e.type], dx = player.x - e.x;
        if (e.windup > 0 || e.action === 'strike')
            e.face = e.attackFace || e.face;
        else if (e.type === 'boss' && e.phase !== 'rest')
            e.face = e.zone?.face || e.face;
        else if (Math.abs(dx) > 12)
            e.face = Math.sign(dx);
        if (C.regionCreatures?.[e.variant]) return window.updateDreamRegionEnemy(e,dt,{player,waves,advance:advanceEnemyAttack,damage,sound:name=>audio.sfx(name)});
        if (e.variant === 'tideBell') return updateTideBell(e, dt);
        if (e.type === 'boss') {
            if (!state.flags.bossIntroduced)
                return;
            e.phaseT -= dt;
            if (e.phase === 'rest') {
                if (Math.abs(dx) > 325)
                    e.x = clamp(e.x + e.face * c.speed * dt, 300, currentMap().width - 250);
                if (e.phaseT <= 0) {
                    e.phase = 'warn';
                    e.pattern++;
                    e.phaseT = e.hp < e.max * .5 ? .9 : 1.2;
                    e.zone = e.pattern % 2 ? { kind: 'sneeze', face: e.face } : { kind: 'stomp', x: player.x };
                    say(e.zone.kind === 'sneeze' ? '들숨… 들숨… 재채기는 점프로 피해!' : '별빛이 모인 바닥에서 살짝 비켜서!', 2);
                }
            }
            else if (e.phase === 'warn' && e.phaseT <= 0) {
                e.phase = 'release';
                e.phaseT = .55;
                if (e.zone.kind === 'sneeze') {
                    waves.push({ x: e.x + e.zone.face * 100, y: GROUND - 35, vx: e.zone.face * 460, life: 2.5, r: 36, hit: false });
                    spark(e.x + e.zone.face * 80, GROUND - 95, 15, '#e2c7e7', 220);
                }
                else {
                    ring(e.zone.x, GROUND - 5, 165, '#e9bfdc');
                    spark(e.zone.x, GROUND - 10, 24, '#dec3e3', 270);
                    if (Math.abs(player.x - e.zone.x) < 155 && player.y > GROUND - 100)
                        damage(1.5, e.zone.x);
                }
                shake = settings.reducedMotion ? 0 : 4;
            }
            else if (e.phase === 'release' && e.phaseT <= 0) {
                e.phase = 'rest';
                e.phaseT = e.hp < e.max * .5 ? 1.15 : 1.7;
                e.zone = null;
            }
            return;
        }
        const floor = e.floorY ?? GROUND, sameLevel = Math.abs(player.y - floor) < 150 && !player.climbing;
        e.timer -= dt;
        if (e.action === 'strike') {
            e.actionT -= dt;
            const progress = 1 - e.actionT / e.actionLength;
            if (e.type === 'sand') {
                e.y = floor - Math.sin(progress * Math.PI) * 35;
                advanceEnemyAttack(e, e.attackFace * 360 * dt);
            }
            if (e.type === 'crab') {
                e.y = floor - Math.sin(progress * Math.PI) * 150;
                advanceEnemyAttack(e, e.attackFace * 270 * dt);
            }
            if (e.type === 'box')
                e.y = floor - Math.sin(progress * Math.PI) * 17;
            if (!e.didHit && e.type !== 'box' && Math.abs(player.x - e.x) < 75 && Math.abs(player.y - e.y) < 110) {
                damage(1, e.x);
                e.didHit = true;
                // A body rush stops at contact; it cannot keep travelling through the hero.
                if (e.type === 'sand')
                    e.actionT = 0;
            }
            if (e.actionT <= 0) {
                e.action = 'recover';
                e.actionT = .85;
                e.y = floor;
                e.timer = 1.5;
            }
            return;
        }
        if (e.action === 'recover') {
            e.actionT -= dt;
            if (e.actionT <= 0)
                e.action = null;
            return;
        }
        if (e.windup > 0) {
            e.windup -= dt;
            if (e.windup <= 0) {
                e.action = 'strike';
                e.actionLength = e.type === 'crab' ? .65 : .48;
                e.actionT = e.actionLength;
                e.didHit = false;
                if (e.type === 'box') {
                    for (const vy of [-95, 15, 115])
                        waves.push({ x: e.x + e.attackFace * 40, y: floor - 68, vx: e.attackFace * 330, vy, life: 1.65, r: 13, hit: false, kind: 'button' });
                    audio.sfx('rattle');
                }
                else
                    audio.sfx(e.type === 'sand' ? 'sandRush' : 'claw');
            }
            return;
        }
        e.y = floor;
        const range = e.type === 'box' ? 430 : 240;
        if (sameLevel && Math.abs(dx) < range && e.timer <= 0) {
            e.windup = e.type === 'box' ? .9 : .7;
            e.attackFace = e.face;
            return;
        }
        if (sameLevel && Math.abs(dx) < 500 && Math.abs(dx) > 160)
            e.x += e.face * c.speed * 1.25 * dt;
        else if (!sameLevel || Math.abs(dx) > 500)
            e.x = approach(e.x, e.home + Math.sin(e.elapsed * .6) * 64, c.speed * dt);
    }
    function enemyBounds(e) {
        const radius = enemyRadius(e), floor = e.floorY ?? GROUND;
        const terrace = currentMap().platforms.find(p => p.y === floor && e.home >= p.x && e.home <= p.x + p.w);
        return terrace ? [terrace.x + radius, terrace.x + terrace.w - radius] : [radius + 40, currentMap().width - radius - 40];
    }
    function boundEnemy(e) {
        const [lo, hi] = enemyBounds(e);
        const before = e.x;
        e.x = clamp(e.x, lo, hi);
        if (before !== e.x)
            e.knockV = 0;
    }
    function separateBodies() {
        const living = enemies.filter(e => !e.dead);
        // Soft enemy spacing keeps a group readable without affecting airborne attacks.
        for (let pass = 0; pass < 3; pass++) {
            for (let i = 0; i < living.length; i++) {
                const a = living[i];
                for (let j = i + 1; j < living.length; j++) {
                    const b = living[j];
                    if (Math.abs(a.y - b.y) > 45 || Math.abs(a.floorY - b.floorY) > 5)
                        continue;
                    const dx = b.x - a.x, gap = (enemyRadius(a) + enemyRadius(b)) * .78;
                    if (Math.abs(dx) < gap) {
                        const dir = Math.sign(dx) || (a.home <= b.home ? 1 : -1), push = (gap - Math.abs(dx)) * .5;
                        a.x -= dir * push;
                        b.x += dir * push;
                        boundEnemy(a);
                        boundEnemy(b);
                    }
                }
            }
            if (player.dodgeT > 0 || player.climbing || player.lift)
                continue;
            for (const e of living) {
                if (Math.abs(player.y - e.y) > 64)
                    continue;
                const dx = player.x - e.x, gap = 23 + enemyRadius(e);
                if (Math.abs(dx) >= gap)
                    continue;
                const dir = Math.sign(dx) || -player.facing, push = gap - Math.abs(dx);
                const oldEnemyX = e.x;
                e.x -= dir * push * .2;
                boundEnemy(e);
                const remaining = push - Math.abs(e.x - oldEnemyX);
                let lo = 65, hi = currentMap().width - 65;
                if (player.grounded && player.y < GROUND - 5) {
                    const terrace = currentMap().platforms.find(p => Math.abs(p.y - player.y) < 5 && player.x >= p.x - 12 && player.x <= p.x + p.w + 12);
                    if (terrace) { lo = terrace.x + 4; hi = terrace.x + terrace.w - 4; }
                }
                const oldPlayerX = player.x;
                player.x = clamp(player.x + dir * remaining, lo, hi);
                // At a wall/ledge, the monster yields the rest instead of pushing the hero off.
                e.x -= dir * Math.max(0, remaining - Math.abs(player.x - oldPlayerX));
                boundEnemy(e);
                if (player.vx * dir < 0)
                    player.vx = 0;
            }
        }
    }
    function animateMovement(dt, oldX) {
        const distance = Math.abs(player.x - oldX);
        const speed = player.grounded && !player.climbing && player.dodgeT <= 0 ? Math.min(distance / dt, Math.abs(player.vx)) : 0;
        player.motionSpeed = speed;
        player.lean = approach(player.lean, clamp((player.grounded ? Math.sign(player.vx) * speed : player.vx) / 400, -1, 1), dt * 6);
        player.walkTime += speed * dt / 220 * Math.PI * 2;
        player.walkBlend = approach(player.walkBlend, Math.min(1, speed / 280), dt * 9);
        player.stepDistance += speed * dt;
        if (player.stepDistance > 78 && speed > 150) {
            player.stepDistance %= 78;
            spark(player.x - player.facing * 14, player.y, 3, '#f5deca', 34);
            audio.sfx('step');
        }
    }
    function updateDashHUD() {
        const remaining = Math.max(0, cooldowns.dodge), ready = remaining <= 0;
        const progress = Math.max(0, Math.min(1, 1 - remaining / dodgeCooldownDuration));
        const button = $('dodgeControl');
        button.classList.toggle('dash-ready', ready);
        button.classList.toggle('dash-cooling', !ready);
        $('dashFill').style.transform = `scaleX(${progress})`;
        $('dashStatus').textContent = ready ? '준비' : (Math.ceil(remaining * 10) / 10).toFixed(1) + '초';
        button.setAttribute('aria-label', `대시 · ${ready ? '준비 완료' : $('dashStatus').textContent + ' 후 사용 가능'} · Shift 또는 같은 방향키 두 번`);
    }
    function updateHUD() {
        if (!state)
            return;
        const qi = activeQuest(), q = C.quests[qi < 0 ? C.quests.length - 1 : qi];
        $('activeName').textContent = state.active === 'ari' ? '아리' : '포포';
        $('activePortrait').src = images[state.active].src;
        $('reservePortrait').src = images[state.active].src;
        $('hearts').innerHTML = `<span class="hp-symbol">♥</span><span class="hp-meter"><i style="width:${state.hp / maxHP() * 100}%"></i></span><small>${state.hp}/${maxHP()}</small>`;
        $('hearts').setAttribute('aria-label', `마음 체력 ${state.hp} / ${maxHP()}`);
        $('levelText').textContent = 'Lv. ' + level();
        $('xpFill').style.width = (state.xp % 75) / 75 * 100 + '%';
        $('lightCount').textContent = state.light;
        $('snackCount').textContent = rpg.own('cookie') + rpg.own('lunch') + rpg.own('tea');
        $('locationName').textContent = currentMap().name;
        $('petLabel').textContent = '↑ ↓ 사다리 · L 탐험 지도';
        $('questCard').querySelector('.eyebrow').firstChild.textContent = C.acts[q.act] + ' ';
        $('questTitle').textContent = qi < 0 ? '순찰 완료—!' : q.name;
        $('questDetail').textContent = qi < 0 ? '항구에 남은 반짝 기억을 찾아보세요.' : q.description;
        $('questStep').textContent = String((qi < 0 ? C.quests.length - 1 : qi) + 1).padStart(2, '0') + ' / ' + String(C.quests.length);
        $('questFill').style.width = (qi < 0 ? 100 : questCount(qi) / q.goal * 100) + '%';
        $('questCount').textContent = qi < 0 ? '반짝 기억 ' + state.memories.length + ' / ' + C.memories.length : `${q.flag ? '진행' : '정화'} ${questCount(qi)} / ${q.goal}`;
        journey?.update();
        show('rewardDot', C.quests.some((_, i) => questComplete(i) && !state.claimed.includes(i)));
        for (const [id, key, duration] of [['skillControl', 'skill', 5]]) {
            $(id).querySelector('i').style.height = cooldowns[key] / duration * 100 + '%';
            $(id).setAttribute('aria-label', $(id).querySelector('b').textContent + (cooldowns[key] > .1 ? ' · ' + Math.ceil(cooldowns[key]) + '초 남음' : ''));
        }
        updateDashHUD();
        $('attackControl').style.setProperty('--charge', Math.min(1, player.chargeT / 1.05));
        $('attackControl').classList.toggle('charged', player.chargeReady);
        $('attackControl').querySelector('b').textContent = player.chargeReady ? '놓기!' : player.chargeHeld && player.chargeT > .25 ? '모으기' : '정화';
        const boss = enemies.find(e => e.type === 'boss' && !e.dead);
        show('bossHud', state.map === 4 && !!boss && state.flags.bossIntroduced);
        if (boss) {
            $('bossFill').style.width = boss.hp / boss.max * 100 + '%';
            $('bossCount').textContent = '남은 걱정 ' + Math.ceil(boss.hp / boss.max * 100) + '%';
            $('bossMood').textContent = boss.phase === 'warn' ? (boss.zone?.kind === 'sneeze' ? '들숨… 들숨… 점프할 준비!' : '발밑 별빛을 피하세요!') : '잊어둔 걱정이 모인';
        }
        if (lastQuest !== qi) {
            if (lastQuest >= 0 && qi !== lastQuest && mode === 'play')
                toast('순찰 의뢰 완료 · 수첩에서 꿈도장을 찍어주세요.');
            lastQuest = qi;
        }
    }
    function tick(dt) {
        clock += dt;
        if (mode === 'dialogue') conversation.update(dt);
        if (mode === 'play') {
            for (const v of impacts)
                v.life -= dt;
            impacts = impacts.filter(v => v.life > 0);
        }
        audio.update(dt);
        rpg.update(dt);
        world.update();
        remaster.update(dt);
        for (const [timer, id] of [['toastTimer', 'toast']]) {
            if (toastTimer > 0) {
                toastTimer -= dt;
                if (toastTimer <= 0)
                    show(id, false);
            }
        }
        if (speechTimer > 0) {
            speechTimer -= dt;
            if (speechTimer <= 0)
                show('speech', false);
        }
        if (splashTimer > 0 && mode === 'play') {
            splashTimer -= dt;
            if (splashTimer <= 0)
                show('zoneSplash', false);
        }
        if (mode === 'play') {
            state.time += dt;
            transition = Math.max(0, transition - dt);
            if (hitstop > 0) {
                hitstop -= dt;
                return;
            }
            const oldPlayerX = player.x;
            updatePlayer(dt);
            if (mode === 'play') {
                for (const e of enemies) {
                    updateEnemy(e, dt);
                    boundEnemy(e);
                    if (mode !== 'play')
                        break;
                }
            }
            if (mode === 'play') {
                separateBodies();
                animateMovement(dt, oldPlayerX);
                for (const w of waves) {
                    w.x += w.vx * dt;
                    w.y += (w.vy || 0) * dt;
                    if (w.gravity)
                        w.vy += (typeof w.gravity === 'number' ? w.gravity : 600) * dt;
                    w.life -= dt;
                    if (!w.hit && Math.abs(player.x - w.x) < 42 && Math.abs(player.y - 55 - w.y) < 65) {
                        damage(w.damage ?? 1.5, w.x - Math.sign(w.vx) * 10);
                        w.hit = true;
                        if (w.kind === 'tideBubble' || w.kind === 'region') {
                            w.life = 0;
                            ring(w.x,w.y,38,'#bceee5');
                        }
                    }
                }
                waves = waves.filter(w => w.life > 0 && w.x > 0 && w.x < currentMap().width);
                updateInteraction();
            }
            saveTime += dt;
            if (saveTime > 4) {
                saveTime = 0;
                save();
            }
            uiTime += dt;
            if (uiTime > .1) {
                updateHUD();
                uiTime = 0;
            }
        }
        if (mode === 'play' || mode === 'dialogue') {
            for (const p of particles) {
                p.life -= dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy += 160 * dt;
            }
            particles = particles.filter(p => p.life > 0);
            for (const t of texts) {
                t.life -= dt;
                t.y -= dt * 45;
            }
            texts = texts.filter(t => t.life > 0);
            for (const r of rings)
                r.life -= dt;
            rings = rings.filter(r => r.life > 0);
        }
        shake = Math.max(0, shake - dt * 20);
    }
    function loop(time) {
        const dt = Math.min(.04, (time - lastTime) / 1000 || .016);
        lastTime = time;
        tick(dt);
        renderer.draw({ state, player, enemies, particles, texts, waves, rings, camera, cameraY, clock, companion, pet, mode, shake, transition, settings, rpgInfo: rpg.view(), impacts });
        requestAnimationFrame(loop);
    }
    const keyMap = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyJ: 'attack', Space: 'jump' };
    addEventListener('keydown', e => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) && !['Escape', 'Tab'].includes(e.code))
            return;
        const dialogueControl = mode === 'dialogue' && e.target.closest('button') && e.target.id !== 'dialogueNext';
        if ((mode === 'play' || mode === 'dialogue') && ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code) && !(e.code === 'Space' && dialogueControl))
            e.preventDefault();
        if (e.code === 'Tab' && (mode === 'modal' || mode === 'dialogue')) {
            const root = mode === 'modal' ? $('modal') : $('dialogue'), items = [...root.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(x => x.offsetParent !== null), first = items[0], last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            }
            else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
            return;
        }
        if (mode === 'dialogue') {
            if (['Enter','Space'].includes(e.code) && e.target.closest('button') && e.target.id !== 'dialogueNext') return;
            if (['Enter', 'Space', 'KeyE'].includes(e.code) && !e.repeat) {
                e.preventDefault();
                nextDialogue();
            }
            return;
        }
        if (mode === 'modal') {
            if (rpg.key(e))
                return;
            if (modalKind === 'fail') {
                if (e.code === 'KeyR')
                    retry();
                return;
            }
            if (e.code === 'Escape' || (e.code === 'KeyM' && modalKind === 'map') || (e.code === 'KeyN' && modalKind === 'journal') || (e.code === 'KeyI' && modalKind === 'bag') || (['KeyC', 'KeyQ'].includes(e.code) && ['wardrobe', 'characterDetail'].includes(modalKind)))
                closeModal();
            return;
        }
        if (mode !== 'play')
            return;
        if (e.repeat) return;
        if (keyMap[e.code]) {
            controls.keyDown(e.code);
            if (keyMap[e.code] !== 'attack')
                autoWalk = false;
        }
        const acts = { KeyJ: 'attackPress', Space: 'jump', ShiftLeft: 'dodge', ShiftRight: 'dodge', KeyK: 'skill', KeyQ: 'wardrobe', KeyC: 'wardrobe' };
        if (acts[e.code])
            action(acts[e.code]);
        if (e.code === 'KeyE')
            interact();
        if (e.code === 'KeyL')
            journey.localMap();
        if (e.code === 'KeyV')
            remaster.archive();
        if (e.code === 'KeyM')
            openMap();
        if (e.code === 'KeyN')
            journal('toggle');
        if (e.code === 'Escape')
            pause();
        if (e.code === 'KeyH')
            heal();
        if (e.code === 'KeyI')
            rpg.bag('toggle');
        if (e.code === 'KeyF')
            action('burst');
    });
    addEventListener('keyup', e => {
        if (keyMap[e.code])
            controls.keyUp(e.code);
        if (e.code === 'KeyJ') releaseAttack();
        if (player && ['up', 'down'].includes(keyMap[e.code]))
            player.climbLatch = false;
        if (e.code === 'Space') releaseJump();
    });
    function releaseJump() {
        if (!player || keys.has('jump') || controls?.held('jump')) return;
        player.jumpReleased = true;
        if (player.vy < -320 && !player.climbing) player.vy *= .64;
    }
    function clearControls() {
        keys.clear();
        controls?.clear();
        cancelCharge();
        if (player) {
            player.attackBuffer = 0;
            player.jumpBuffer = 0;
            player.moveAxis = 0;
            player.climbLatch = false;
        }
    }
    function releaseInputs() {
        clearControls();
        if (mode === 'play') {
            save();
            pause();
        }
    }
    addEventListener('blur', releaseInputs);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden)
            releaseInputs();
    });
    addEventListener('pagehide', save);
    function refitViewport() {
        const previousScale = $('stage').style.transform;
        fit();
        // Browser chrome height changes must not release a held move/attack input.
        if ($('stage').style.transform !== previousScale) clearControls();
    }
    addEventListener('resize', refitViewport);
    window.visualViewport?.addEventListener('resize', refitViewport);
    addEventListener('orientationchange', () => { clearControls(); fit(); });
    document.addEventListener('fullscreenchange', fit);
    controls = window.createDreamControls({
        keys, keyMap, playing: () => mode === 'play',
        action, activate: () => { autoWalk = false; audio.unlock(); },
        releaseJump, releaseAttack
    });
    if (controls.touch) {
        $('skillControl').querySelector('b').textContent = '꿈빛';
        $('burstControl').querySelector('b').textContent = '공명';
    }
    $('inventoryButton').onclick = () => rpg.bag('toggle');
    $('startButton').onclick = newGame;
    $('continueButton').onclick = () => start();
    $('titleHelp').onclick = help;
    $('mapButton').onclick = openMap;
    $('journalButton').onclick = () => journal('toggle');
    $('questCard').onclick = () => journal('missions');
    $('journeyWorld').onclick = () => journey.seaMap();
    $('journeyLocal').onclick = () => journey.localMap();
    $('journeyOverview').onclick = () => world.map();
    $('pauseButton').onclick = pause;
    $('tagPortrait').onclick = () => rpg.details();
    $('snackButton').onclick = heal;
    $('interactButton').onclick = interact;
    $('voiceReplay').onclick = () => remaster.replay();
    $('voiceToggle').onclick = () => {
        settings.voice = !settings.voice;
        conversation.syncVoice();
        saveSettings();
        if (settings.voice)
            remaster.replay();
        else
            remaster.stopVoice();
    };
    $('localMapButton').onclick = () => journey.localMap();
    $('worldArchiveButton').onclick = () => remaster.archive();
    $('dialogueNext').onclick = () => nextDialogue();
    $('dialogueText').onclick = () => nextDialogue();
    $('dialogueSkip').onclick = () => nextDialogue(true);
    $('modalClose').onclick = closeModal;
    $('exploreButton').onclick = () => {
        show('ending', false);
        setMode('play');
        enterMap(2);
        say('항구에 남은 반짝 기억도 찾아보자!');
    };
    $('endingTitle').onclick = toTitle;
    document.querySelectorAll('.sound-toggle').forEach(b => b.onclick = () => {
        settings.sound = !settings.sound;
        if (!settings.sound)
            remaster.stopVoice();
        audio.unlock();
        saveSettings();
    });
    document.querySelectorAll('.fullscreen').forEach(b => b.onclick = async () => {
        try {
            if (document.fullscreenElement)
                await document.exitFullscreen();
            else
                await $('shell').requestFullscreen();
        }
        catch {
            toast('이 환경에서는 브라우저의 전체 화면 기능을 사용해 주세요.');
        }
    });
    // Read-only inspection is useful for verifying a playthrough without changing game state.
    window.DreamGame = Object.freeze({ inspect: () => state ? JSON.parse(JSON.stringify({ mode, modalKind, state, player, enemies, cooldowns, controls: controls?.inspect(), interaction, camera, cameraY, autoWalk, solo: true, companions: [], hitstop, impacts, audioEvents: audio.events || [], musicTheme: audio.scoreTheme, musicChanges: audio.musicChanges || [], journey: journey?.target(), nextAction: journey?.instruction(), loot: rpg.view().loot, voice: remaster.voiceStatus(), opening: opening?.inspect(), dialogue: mode === 'dialogue' ? conversation.inspect() : null, quest: activeQuest() })) : { mode }, version: '4.15.1' });
    opening = window.createDreamOpening({
        mount: $('stage'), source: 'assets/intro/first-night.mp4', poster: 'assets/intro/first-night-poster.png', settings,
        onOpen() { remaster?.stopVoice(); setMode('opening'); show('title', false); },
        onClose() { toTitle(); $('startButton').focus({preventScroll:true}); }
    });
    $('openingReplay').onclick = () => { if (mode === 'title') opening.open(); };
    async function boot() {
        fit();
        applySettings();
        let loaded = 0, failed = [];
        await Promise.all(imageKeys.map(key => new Promise(resolve => {
            const img = new Image();
            images[key] = img;
            img.onload = () => {
                const size = window.DREAM_EQUIPMENT.bodySizes[key];
                if (size && (img.width !== size[0] || img.height !== size[1])) {
                    const body = document.createElement('canvas');
                    [body.width, body.height] = size;
                    body.getContext('2d').drawImage(img, 0, 0, ...size);
                    images[key] = body;
                }
                loaded++;
                $('loadBar').style.width = loaded / imageKeys.length * 100 + '%';
                resolve();
            };
            img.onerror = () => {
                failed.push(key);
                resolve();
            };
            img.src = window.DREAM_ART_V49.files[key] || 'assets/' + key + '.webp';
        })));
        if (failed.length) {
            $('loadingText').textContent = '그림 파일을 열지 못했어요. 압축을 모두 푼 뒤 index.html을 다시 열어주세요. (' + failed.join(', ') + ')';
            return;
        }
        renderer = new window.DreamRenderer($('world'), images, C);
        state = defaultState();
        player = makePlayer(185);
        enemies = [];
        show('loading', false);
        toTitle();
        opening.maybeShow();
        requestAnimationFrame(loop);
    }
    rpg = window.createDreamRPG({ get state() {
            return state;
        }, get player() {
            return player;
        }, get enemies() {
            return enemies;
        }, get mode() {
            return mode;
        }, get modalKind() {
            return modalKind;
        }, maxHP, level, toast, floatText, spark, ring, say, save, refresh: updateHUD, openModal, closeModal, dialogue: startDialogue, memory, ending: showEnding, activeQuest, hit, sound: kind => audio.sfx(kind), isWorldObject: obj => world.isSpecial(obj), worldInteract: obj => world.interact(obj), worldLabel: obj => world.label(obj), wardrobe: id => world.wardrobe(id), preview: (canvas, options) => renderer.previewHero(canvas, state, options) });
    world = window.createDreamWorld({ get state() {
            return state;
        }, get player() {
            return player;
        }, get mode() {
            return mode;
        }, get modalKind() {
            return modalKind;
        }, get enemies() {
            return enemies;
        }, details: () => rpg.details(), own: rpg.own, add: rpg.add, take: rpg.take, icon: rpg.icon, save, toast, enterMap, openModal, closeModal, dialogue: startDialogue, memory, sound: kind => audio.sfx(kind), refresh: updateHUD, activeQuest, questComplete, questCount, preview: (canvas, options) => renderer.previewHero(canvas, state, options) });
    remaster = window.createDreamRemaster({ get state() {
            return state;
        }, get player() {
            return player;
        }, get mode() {
            return mode;
        }, get modalKind() {
            return modalKind;
        }, settings, maxHP, save, toast, openModal, closeModal, add: rpg.add, sound: k => audio.sfx(k), spark, worldMap: () => world.map(), duck: v => {
            audio.ducked = v;
        } });
    journey = window.createDreamJourney({get state(){return state;},get player(){return player;},get enemies(){return enemies;},get renderer(){return renderer;},activeQuest,route:world.route,openModal,closeModal,islandMap:()=>world.map(),archive:()=>remaster.archive()});
    boot();
})();
