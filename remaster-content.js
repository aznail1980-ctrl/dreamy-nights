'use strict';
/* Remaster geography: every upper route has two ways down and a readable landmark. */
(() => {
    const C = window.DREAM_CONTENT, G = 651, scale = 1.7;
    C.remaster = { version: 4, scale, icons: ['hammer', 'wand', 'badge', 'ribbon', 'beret', 'crown', 'scarf', 'cape', 'satchel', 'lantern', 'cookie', 'lunch', 'tea', 'dust', 'flour', 'honey', 'thread', 'leaf', 'letter', 'key', 'journal', 'compass'] };
    const names = [['별조개 해안', '조개 절벽', '밀물 전망대'], ['산책 숲길', '연의 언덕', '바람 다리'], ['항구 광장', '지붕 산책길', '등대 테라스'], ['짐꾼의 골목', '창고 연결교', '물건들의 다락'], ['걱정의 둥지', '먼지 선반', '별빛 피난처'], ['낮은 조수길', '공명 암벽', '높은 종의 둥지'], ['별잎 정원', '연의 온실', '바람지기 언덕'], ['관측소 뜰', '별자리 회랑', '달의 관측대'], ['서가 입구', '기록의 회랑', '마지막 기록 보관실'], ['아래 물길', '수문 연결교', '수차 관리대']];
    C.maps.forEach((m, i) => {
        m.oldWidth = m.width;
        m.width = Math.round(m.width * scale);
        m.minY = -260;
        m.sections = names[i];
        m.platforms = [];
        m.ladders = [];
        m.devices = [];
        // A broad middle route and split upper terraces make loops, not one corridor.
        for (const level of [1, 2]) {
            const y = G - level * 310, left = level === 1 ? 420 : 780, end = m.width - (level === 1 ? 360 : 650), gapX = m.width * (i % 2 ? .49 : .57);
            m.platforms.push({ x: left, y, w: gapX - left - 82, level }, { x: gapX + 82, y, w: end - gapX - 82, level });
            // Two stair ladders on each terrace, plus a central gap that can be jumped.
            for (const x of [left + 150, m.width * .37, m.width * .71, end - 150])
                m.ladders.push({ x: Math.round(x), top: y, bottom: y + 310 });
        }
        m.devices = [{ id: m.id + '-camp', kind: 'camp', x: 330, y: G, label: '별빛 야영지 · 쉬고 저장하기' },
            { id: m.id + '-lift', kind: 'lift', x: Math.round(m.width * .88), y: G, top: G - 620, bottom: G, label: '달빛 승강기 · 위아래 이동' },
            { id: m.id + '-cache', kind: 'cache', x: Math.round(m.width * .73), y: 31, label: '숨은 순찰 상자 열기' },
            { id: m.id + '-wind', kind: 'vent', x: Math.round(m.width * .3), y: G, label: '상승 바람 · 위로 날아오르기' },
            { id: m.id + '-switch', kind: 'switch', x: Math.round(m.width * .6), y: 341, label: '접힌 다리 펼치기' }];
        m.enemies.forEach((e, j) => {
            e.x = Math.round(e.x * scale);
            e.y = i === 4 ? G : G - (j % 3) * 310;
            e.floorY = e.y;
        });
        if (m.memory) {
            m.memory.x *= scale;
            m.memory.y = 31 - 60;
        }
        // Optional roaming worries give repeatable materials without resetting story guardians.
        if (![2, 4, 7].includes(i))
            for (let j = 0; j < 3; j++)
                m.enemies.push({ id: m.id + '-roamer-' + j, type: ['sand', 'crab', 'box'][(i + j) % 3], x: Math.round(m.width * (.2 + j * .27)), y: G - j * 310, floorY: G - j * 310, wild: true });
    });
    C.objects.forEach((o, j) => {
        o.x = Math.round(o.x * scale);
        let level = 0;
        if (o.kind === 'herb')
            level = j % 3;
        if (['chest', 'treasure', 'beacon'].includes(o.kind))
            level = 1;
        if (o.kind === 'tideBell')
            level = [0, 1, 2][o.index];
        if (o.kind === 'windVane')
            level = [1, 2, 0][o.index];
        if (['starChart', 'archiveBook', 'waterWheel'].includes(o.kind))
            level = 2;
        o.y = G - level * 310;
    });
    Object.values(C.npcs).forEach((n, j) => {
        n.x *= scale;
        n.home = n.x;
        n.y = G;
        n.patrol = 75 + j * 22;
        n.phase = j * 2;
        n.face = 1;
        n.walkTime = 0;
    });
    C.quests.forEach(q => {
        if (q.targetX)
            q.targetX *= scale;
        const match = C.objects.find(o => o.map === q.map && Math.abs(o.x - q.targetX) < 3);
        q.targetY = match?.y ?? G;
    });
    C.exits.forEach(exits => exits.forEach(e => {
        e.x *= scale;
        e.arrivalX *= scale;
        e.y = G;
        e.arrivalY = G;
    }));
    const look = { seaBeret: 'beret', starCrown: 'crown', softScarf: 'scarf', tideScarf: 'scarf', nightCape: 'cape', mailBag: 'satchel' };
    Object.entries(look).forEach(([k, v]) => C.items[k].icon = v);
    Object.values(C.items).forEach(v => {
        if (v.icon === 'wing')
            v.icon = 'cape';
    });
    C.creatures.sand.size = 88;
    C.creatures.crab.size = 100;
    C.creatures.box.size = 95;
    C.creatures.boss.size = 250;
    // Solo field play: remote companion dialogue is rewritten as the selected keeper's observations.
    C.maps.forEach((m, i) => {
        const anchors = [...m.enemies, ...C.objects.filter(o => o.map === i)];
        for (const a of anchors)
            if (a.y < 651 && !m.platforms.some(p => p.y === a.y && a.x > p.x + 30 && a.x < p.x + p.w - 30))
                m.platforms.push({ x: a.x - 100, y: a.y, w: 200, level: Math.round((651 - a.y) / 310) });
    });
    C.maps.forEach(m => {
        const lift = m.devices.find(d => d.kind === 'lift');
        m.platforms.push({ x: Math.min(lift.x - 70, m.width - 650), y: 31, w: lift.x + 70 - Math.min(lift.x - 70, m.width - 650), liftLanding: true });
    });
    C.remoteScenes = ['tideSolved', 'windSolved', 'chartSolved', 'archiveRead', 'bridgeSolved'];
    C.dialogue.worldPrimer = [['lumen', '잠의 바다에는 사람들이 잠들 때 생겨나는 섬들이 있단다.\n좋은 꿈에서 나온 꿈빛이 현실의 아침을 움직이지.'], ['lumen', '하지만 꿈을 포기한 마음에 회색잠이 번지고 있어.\n어둑이는 악당이 아니라, 놓지 못한 걱정이란다.'], ['lumen', '기억을 되찾아 주렴. 우리가 켜는 건 등불이면서,\n누군가 다시 시작할 수 있다는 믿음이기도 하니까.']];
    C.worlds = [
        ['포근등대와 잠의 항구', '서툰 시작도 지킬 가치가 있다', '루멘', '먼지대장', '첫 순찰의 실수만 기억하던 반장이 무사히 돌아온 모두의 마음을 되찾는다.', '현실에서 누군가 오래 접어둔 첫 일기장을 다시 편다.'],
        ['몽글 오븐 마을', '결과보다 다시 굽는 용기', '마들렌', '설익은 빵귀신', '대회를 포기한 할머니의 레시피를 맛과 향의 기억으로 복원한다.', '할머니가 이웃에게 갓 구운 빵 한 조각을 건넨다.'],
        ['째깍 태엽 도시', '늦어도 나의 속도로', '톡톡', '고장난 종지기', '시간을 두려워하는 학생을 위해 어긋난 시계들의 박자를 맞춘다.', '학생이 비교표를 덮고 작은 계획 하나를 적는다.'],
        ['별똥별 사막', '묻어 둔 호기심을 꺼내다', '은하', '모래꿀꺽', '천문학을 포기한 직장인의 사라진 별자리를 관측한다.', '퇴근길에 처음으로 하늘을 올려다본다.'],
        ['솜사탕 구름바다', '떠났던 길은 마음에 남는다', '무무', '뭉게물멍', '항해를 그리워하는 노인의 바람 지도를 이어 마지막 항로를 찾는다.', '노인이 낡은 항해 이야기를 아이에게 들려준다.'],
        ['속삭임 숲', '잊힌 노래도 누군가 기억한다', '리코', '메아리뭉치', '은퇴한 음악가의 자장가를 숲속의 흩어진 메아리로 완성한다.', '한때 그 노래를 듣던 사람이 먼저 흥얼거린다.'],
        ['회색 정원', '꿈은 서로의 내일을 밝힌다', '치로와 노아', '빅어둑이', '꿈은 쓸모없다고 믿는 아이에게 앞서 되찾은 여섯 마음의 빛이 모인다.', '아이가 빈 화분에 씨앗 하나를 심는다.']
    ];
})();
