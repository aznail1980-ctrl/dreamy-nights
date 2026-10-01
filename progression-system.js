'use strict';
(() => {
    const C = window.DREAM_CONTENT, branches = ['attack', 'guard', 'control'];
    const curve = [0, 60, 145, 245, 360, 490, 635, 795, 970, 1160];
    const finite = (n, max = 1e8) => Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
    const threshold = level => level <= 10 ? curve[Math.max(0, level - 1)] : 1160 + (level - 10) * 220;
    function level(s) {
        const xp = s?.growth?.xp ?? s?.xp ?? 0;
        return xp >= 1160 ? 10 + Math.floor((xp - 1160) / 220) : 1 + curve.slice(1).filter(n => xp >= n).length;
    }
    const points = s => Math.min(5, Math.floor(level(s) / 2));
    const learned = (s, branch, stage) => s.growth.nodes.includes(branch + stage);
    const mastered = (s, branch) => learned(s, branch, 3);
    const passive = (s, branch) => s.growth.passives.includes(branch) && learned(s, branch, 2);
    const names = {
        ari: { attack: '별빛 파동', guard: '소원 장막', control: '꿈실 매듭', burst: '기억의 별자리' },
        popo: { attack: '별망치 울림', guard: '든든한 북소리', control: '통통 반동', burst: '돌아갈 길의 울림' }
    };
    const colors = { base: '#ffe2a2', attack: '#ffdc91', guard: '#a8e9db', control: '#d7c2ff' };
    function rewards(s) {
        const found = [];
        for (const i of s.visited || []) if (i > 0 && C.maps[i]) found.push(['map:' + C.maps[i].id, 18]);
        for (const id of s.memories || []) if (C.memories.some(m => m.id === id)) found.push(['memory:' + id, 12]);
        for (const q of C.quests) {
            const done = q.flag ? s.flags[q.flag] : q.ids?.filter(id => s.killed.includes(id)).length >= q.goal;
            if (done) found.push(['quest:' + (q.flag || q.ids.join('/')), 28]);
        }
        for (const q of Object.values(C.sideQuests)) if (s.flags[q.flag]) found.push(['side:' + q.flag, 35]);
        return found;
    }
    function initialize(s, raw = null) {
        const source = raw?.growth, xp = finite(s.xp, 1e7);
        // Keep legacy level and progress through that level; retain the original total XP too.
        const legacyLevel = 1 + Math.floor(xp / 75);
        s.growth = { version: 1, xp: source?.version === 1 ? finite(source.xp) : raw ? threshold(legacyLevel) + (xp % 75) / 75 * (threshold(legacyLevel + 1) - threshold(legacyLevel)) : xp,
            nodes: [], active: 'base', passives: [], rewards: [], skillCD: 0, guardCD: 0, tutorialSeen: false };
        const g = s.growth;
        const validRewards = new Set(rewards(s).map(([key]) => key));
        g.rewards = source?.version === 1 && Array.isArray(source.rewards) ? [...new Set(source.rewards.filter(k => validRewards.has(k)))] : raw ? [...validRewards] : [];
        if (source?.version === 1) {
            const wanted = new Set(Array.isArray(source.nodes) ? source.nodes : []);
            for (let stage = 1; stage <= 3; stage++) for (const branch of branches) {
                if (wanted.has(branch + stage) && !reason(s, branch, stage)) g.nodes.push(branch + stage);
            }
            if (branches.includes(source.active) && learned(s, source.active, 1)) g.active = source.active;
            g.passives = [...new Set(Array.isArray(source.passives) ? source.passives : [])].filter(b => branches.includes(b) && learned(s, b, 2)).slice(0, 2);
            g.skillCD = finite(source.skillCD, 12); g.guardCD = finite(source.guardCD, 25);
            g.tutorialSeen = source.tutorialSeen === true;
        }
        return s;
    }
    function gain(s, amount) { amount = finite(amount, 1000); s.xp = finite(s.xp + amount, 1e7); s.growth.xp = finite(s.growth.xp + amount); return amount; }
    function sync(s) {
        let gained = 0;
        for (const [key, xp] of rewards(s)) if (!s.growth.rewards.includes(key)) { s.growth.rewards.push(key); gained += gain(s, xp); }
        return gained;
    }
    function reason(s, branch, stage) {
        if (!branches.includes(branch) || ![1,2,3].includes(stage)) return '알 수 없는 성장 선택이에요.';
        if (learned(s, branch, stage)) return '이미 배웠어요.';
        if (level(s) < [0,2,4,8][stage]) return 'Lv. ' + [0,2,4,8][stage] + '에 배울 수 있어요.';
        if (stage > 1 && !learned(s, branch, stage - 1)) return '앞 단계를 먼저 배워주세요.';
        if (s.growth.nodes.length >= points(s)) return '남은 성장 포인트가 없어요.';
        return '';
    }
    function learn(s, branch, stage) {
        if (reason(s, branch, stage)) return false;
        s.growth.nodes.push(branch + stage);
        if (stage === 1 && s.growth.active === 'base') s.growth.active = branch;
        if (stage === 2 && s.growth.passives.length < 2) s.growth.passives.push(branch);
        return true;
    }
    function safe(s, p) {
        return s.map === 2 || !!C.maps[s.map]?.devices?.some(d => d.kind === 'camp' && p?.grounded && Math.abs(d.x - p.x) < 85 && Math.abs(d.y - p.y) < 65);
    }
    function equip(s, branch, kind, p) {
        if (!safe(s, p)) return false;
        if (kind === 'active') {
            if (branch !== 'base' && (!branches.includes(branch) || !learned(s, branch, 1))) return false;
            s.growth.active = branch; return true;
        }
        if (kind !== 'passive' || !branches.includes(branch) || !learned(s, branch, 2)) return false;
        const list = s.growth.passives, index = list.indexOf(branch);
        if (index >= 0) list.splice(index, 1);
        else if (list.length < 2) list.push(branch);
        else return false;
        return true;
    }
    function reset(s, p) {
        if (!safe(s, p) || !s.growth.nodes.length) return false;
        s.growth.nodes = []; s.growth.passives = []; s.growth.active = 'base';
        return true; // XP, health, resonance and cooldowns are deliberately retained.
    }
    function info(s) {
        const lv = level(s), total = threshold(lv + 1) - threshold(lv);
        return { level: lv, current: Math.floor(s.growth.xp - threshold(lv)), total, available: points(s) - s.growth.nodes.length, earned: points(s), nextPoint: lv < 10 ? (Math.floor(lv / 2) + 1) * 2 : null };
    }
    function skill(s) {
        const id = s.growth.active, master = id !== 'base' && mastered(s, id);
        return { id, master, color: colors[id], name: id === 'base' ? '꿈빛 파동' : names[s.active][id], cooldown: id === 'guard' ? 10 : id === 'control' ? 7 : 5,
            damage: id === 'guard' ? 0 : id === 'control' ? (master ? 6 : 4) : (master ? 10 : 7),
            range: id === 'base' ? 285 : id === 'attack' && s.active === 'ari' ? (master ? 420 : 340) : id === 'attack' ? (master ? 280 : 220) : 230 };
    }
    function cast(s, p) {
        if (s.growth.skillCD > 0) return null;
        const spec = skill(s); s.growth.skillCD = spec.cooldown;
        if (spec.id === 'guard') { p.skillShieldT = spec.master ? 5 : 3.5; p.skillShield = true; }
        p.skillVisual = { id: spec.id, life: .55, color: spec.color, range: spec.range, face: p.facing, hero: s.active };
        return spec;
    }
    function tick(s, p, dt) {
        s.growth.skillCD = Math.max(0, s.growth.skillCD - dt); s.growth.guardCD = Math.max(0, s.growth.guardCD - dt);
        p.skillShieldT = Math.max(0, (p.skillShieldT || 0) - dt); if (!p.skillShieldT) p.skillShield = false;
        p.dashGift = Math.max(0, (p.dashGift || 0) - dt);
        if (p.skillVisual) { p.skillVisual.life -= dt; if (p.skillVisual.life <= 0) p.skillVisual = null; }
    }
    window.DREAM_PROGRESS = { branches, names, colors, threshold, level, points, info, initialize, gain, sync, rewards, learned, mastered, passive, reason, learn, safe, equip, reset, skill, cast, tick };
})();
