'use strict';
/* Grade, encounter level and drop probabilities share one source of truth. */
(() => {
    const C = window.DREAM_CONTENT;
    C.grades = { low: { name: '저급', color: '#97939f', symbol: '·', order: 0 }, common: { name: '일반', color: '#81bbaa', symbol: '◇', order: 1 }, rare: { name: '레어', color: '#b599e0', symbol: '✧', order: 2 }, unique: { name: '유니크', color: '#edbc66', symbol: '✦', order: 3 } };
    const unique = new Set(['captainBadge', 'oldLetter', 'warehouseKey', 'oldJournal', 'starCrown', 'mailBag', 'lampPack', 'starTrail']);
    const rare = new Set(['stellarBaton', 'herbRibbon', 'windShoes', 'lanternCharm', 'lunch', 'seaGlass', 'roseBow', 'seaBeret', 'tideScarf', 'nightCape']);
    for (const [id, it] of Object.entries(C.items))
        it.grade = unique.has(id) ? 'unique' : rare.has(id) ? 'rare' : ['dreamDust', 'thread'].includes(id) ? 'low' : 'common';
    const definitions = [
        ['wornBaton', '해진 순찰 도구', 'wand', 'weapon', 'low', {}, '오래된 나무를 곱게 다듬은 작은 정화 도구.'],
        ['shoreBaton', '해안의 순찰 도구', 'wand', 'weapon', 'common', { attack: 1 }, '파도에 씻긴 나무로 만든 든든한 정화 도구.'],
        ['tideBaton', '달물결 순찰 도구', 'wand', 'weapon', 'rare', { attack: 2, skill: 1 }, '조수종의 울림이 끝에 맺힌 정화 도구.'],
        ['auroraBaton', '새벽별 순찰 도구', 'wand', 'weapon', 'unique', { attack: 3, skill: 3 }, '아직 오지 않은 아침의 빛을 머금고 있다.'],
        ['fadedBadge', '빛바랜 별 조각', 'badge', 'charm', 'low', { resonance: .03 }, '바랜 표면 아래 작은 별이 남아 있다.'],
        ['shellBadge', '조개빛 배지', 'badge', 'charm', 'common', { hp: 1 }, '무사히 돌아오길 바라는 해안 주민의 표식.'],
        ['tideBrooch', '푸른 공명 브로치', 'badge', 'charm', 'rare', { hp: 2, skill: 1 }, '파도의 기억이 마음을 단단하게 감싼다.'],
        ['dawnBadge', '여명의 지킴이 배지', 'badge', 'charm', 'unique', { hp: 2, attack: 1, skill: 1 }, '수많은 밤의 귀환을 기억하는 별배지.'],
        ['frayedCharm', '낡은 꿈실 매듭', 'thread', 'keepsake', 'low', { resonance: .05 }, '쉽게 풀리지 않는 작은 약속의 매듭.'],
        ['windKnot', '바람결 매듭', 'ribbon', 'keepsake', 'common', { resonance: .1 }, '별잎을 스치던 바람을 담아 묶었다.'],
        ['moonLantern', '달무리 등불', 'lantern', 'keepsake', 'rare', { speed: .06, resonance: .18 }, '어두운 귀갓길에서도 발걸음이 가벼워진다.'],
        ['firstLight', '첫빛의 등불', 'lantern', 'keepsake', 'unique', { speed: .1, resonance: .25 }, '누군가를 기다려준 모든 등불의 빛이 모였다.']
    ];
    const statNames = { hp: '최대 마음', attack: '정화 위력', skill: '꿈빛 파동', resonance: '공명 획득', speed: '이동 속도' };
    for (const [id, name, icon, slot, grade, stats, lore] of definitions) {
        const effect = Object.entries(stats).map(([k, v]) => statNames[k] + ' +' + (['speed', 'resonance'].includes(k) ? Math.round(v * 100) + '%' : v)).join(' · ') || '기본 정화 도구';
        C.items[id] = { name, icon, slot, grade, stats, lore, effect, type: 'equipment', rarity: C.grades[grade].name, dropOnly: true };
    }
    C.lootBands = [
        { min: 1, max: 2, weights: { low: 45, common: 50, rare: 5, unique: 0 } },
        { min: 3, max: 4, weights: { low: 20, common: 60, rare: 18, unique: 2 } },
        { min: 5, max: 6, weights: { low: 10, common: 55, rare: 30, unique: 5 } },
        { min: 7, max: 99, weights: { low: 4, common: 44, rare: 42, unique: 10 } }
    ];
    const levels = [1, 2, 2, 5, 8, 3, 4, 4, 6, 7];
    C.maps.forEach((m, i) => m.enemies.forEach(e => {
        e.level = Math.min(9, levels[i] + (e.type === 'crab' || e.type === 'box' ? 1 : 0));
        e.hpScale = 1 + (e.level - 1) * .055;
    }));
    C.syncHeroItems = function (hero) {
        const popo = hero === 'popo';
        for (const id of ['wornBaton', 'shoreBaton', 'tideBaton', 'auroraBaton']) {
            C.items[id].icon = popo ? 'hammer' : 'wand';
            C.items[id].name = { wornBaton: '해진', shoreBaton: '해안의', tideBaton: '달물결', auroraBaton: '새벽별' }[id] + (popo ? ' 꿈해머' : ' 꿈배턴');
        }
    };
    const chance = (rng, p) => rng() < p;
    C.dropProfile = function (enemy) {
        const level = Math.max(1, Math.min(99, Math.floor(enemy.level || 1))), boss = enemy.type === 'boss';
        return { level, boss, materialChance: Math.min(.94, .72 + level * .025), ingredientChance: Math.min(.85, .36 + level * .05), gearChance: boss ? 1 : Math.min(.35, .10 + level * .025), weights: boss ? { low: 0, common: 0, rare: 70, unique: 30 } : C.lootBands.find(b => level >= b.min && level <= b.max).weights };
    };
    C.rollDrops = function (enemy, map, rng = Math.random) {
        const p = C.dropProfile(enemy), result = [];
        const add = (id, n) => {
            const old = result.find(r => r[0] === id);
            if (old)
                old[1] += n;
            else
                result.push([id, n]);
        };
        if (chance(rng, p.materialChance))
            add('dreamDust', p.boss ? 8 : 1 + Math.floor(p.level / 3));
        const material = { sand: 'moonFlour', crab: 'honey', box: 'thread', boss: 'thread' }[enemy.type];
        if (material && chance(rng, p.ingredientChance))
            add(material, 1 + (p.level >= 6 ? 1 : 0));
        if (map === 5 && chance(rng, .45 + p.level * .03))
            add('seaGlass', 1);
        if (chance(rng, p.gearChance)) {
            let roll = rng() * 100, grade = 'common';
            for (const [g, w] of Object.entries(p.weights)) {
                roll -= w;
                if (roll < 0) {
                    grade = g;
                    break;
                }
            }
            const pool = definitions.filter(d => d[4] === grade);
            const chosen = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
            add(chosen[0], 1);
        }
        // Story clues must not depend on chance or repeatable spawns.
        if (['box1', 'box2', 'box3'].includes(enemy.id))
            add('page', 1);
        return result;
    };
})();
