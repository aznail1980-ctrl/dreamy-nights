'use strict';
/* First-night region: a hub, two investigation branches and a return route. */
(() => {
    const C = window.DREAM_CONTENT;
    C.worldFlags = ['tideAttuned', 'windAttuned', 'starChartRead', 'archiveRead', 'bridgeOpened'];
    C.maps.push({ id: 'tide', name: '메아리 조수 동굴', icon: '≈', width: 3300, theme: 'tide', platforms: [{ x: 430, y: 542, w: 230 }, { x: 960, y: 450, w: 250 }, { x: 1660, y: 530, w: 240 }, { x: 2220, y: 450, w: 260 }, { x: 2740, y: 530, w: 220 }], enemies: [{ id: 'tideSand', type: 'sand', x: 1170 }, { id: 'tideCrab', type: 'crab', x: 2140 }] }, { id: 'garden', name: '잊힌 바람 정원', icon: '❋', width: 3100, theme: 'garden', platforms: [{ x: 460, y: 540, w: 300 }, { x: 900, y: 440, w: 260 }, { x: 1440, y: 525, w: 230 }, { x: 1840, y: 435, w: 240 }, { x: 2480, y: 520, w: 280 }], enemies: [{ id: 'gardenCrab1', type: 'crab', x: 1120 }, { id: 'gardenCrab2', type: 'crab', x: 2030 }] }, { id: 'observatory', name: '달오름 별 관측소', icon: '✧', width: 2200, theme: 'observatory', platforms: [{ x: 600, y: 540, w: 260 }, { x: 1100, y: 450, w: 350 }, { x: 1620, y: 530, w: 220 }], enemies: [] }, { id: 'archive', name: '잠든 순찰 기록실', icon: '▤', width: 2900, theme: 'archive', platforms: [{ x: 420, y: 535, w: 260 }, { x: 870, y: 440, w: 260 }, { x: 1520, y: 530, w: 270 }, { x: 2080, y: 440, w: 250 }], enemies: [{ id: 'archiveBox', type: 'box', x: 900 }, { id: 'box3', type: 'box', x: 1800 }] }, { id: 'waterway', name: '등대 아래 물길', icon: '⌁', width: 3200, theme: 'waterway', platforms: [{ x: 500, y: 530, w: 280 }, { x: 1050, y: 440, w: 260 }, { x: 1630, y: 530, w: 240 }, { x: 2150, y: 450, w: 280 }, { x: 2670, y: 530, w: 230 }], enemies: [{ id: 'waterCrab', type: 'crab', x: 1150 }, { id: 'waterBox', type: 'box', x: 1970 }] });
    C.maps[3].enemies = C.maps[3].enemies.filter(e => e.id !== 'box3');
    C.creatures.boss.hp = 112;
    C.creatures.sand.hp = 9;
    C.creatures.crab.hp = 13;
    C.creatures.box.hp = 17;
    C.exits = C.maps.map(() => []);
    const link = (a, x, b, y, gate = '', hint = '') => {
        C.exits[a].push({ x, to: b, arrivalX: y < 300 ? y + 155 : y > C.maps[b].width - 300 ? y - 155 : y + 150, gate, hint });
        C.exits[b].push({ x: y, to: a, arrivalX: x < 300 ? x + 155 : x > C.maps[a].width - 300 ? x - 155 : x + 150, gate, hint });
    };
    link(0, 2700, 1, 100);
    link(1, 2400, 2, 100);
    link(0, 2180, 5, 100, 'metLumen', '먼저 항구의 루멘에게 꺼져가는 등대 이야기를 들어요.');
    link(1, 1450, 6, 100, 'metLumen', '항구의 루멘을 만나면 바람 정원으로 가는 길을 알게 돼요.');
    link(2, 1890, 7, 2100, 'cookedFirst', '마들렌과 도시락을 준비한 뒤 조사에 나서요.');
    link(6, 3000, 7, 100, 'windAttuned', '정원의 풍향계를 바로잡으면 관측소 언덕길이 열려요.');
    link(2, 2500, 3, 100, 'starChartRead', '조수 동굴과 바람 정원의 신호를 모아 별 관측소에서 오래된 지도를 읽어요.');
    link(3, 1240, 8, 100, 'starChartRead');
    link(3, 2600, 4, 100, 'bossReady', '임명장을 반장에게 보여주고, 등대 아래 물길을 복구해요.');
    link(5, 3200, 9, 100, 'tideAttuned', '동굴의 조수종을 깨우면 물길 입구가 드러나요.');
    link(8, 2800, 9, 3100, 'archiveRead', '기록실의 마지막 순찰 기록을 읽으면 오래된 계단을 찾을 수 있어요.');
    link(9, 2630, 2, 2110, 'bridgeOpened', '물길의 수차를 복구하면 항구로 돌아오는 승강기가 움직여요.');
    C.mapPositions = [[14, 74], [31, 58], [51, 52], [73, 54], [90, 63], [17, 26], [38, 20], [61, 17], [84, 30], [58, 82]];
    const desc = ['등대가 어두워진 첫 흔적. 해변의 곁길은 조수 동굴로 이어져요.', '항구로 향하는 길. 언덕을 오르면 잊힌 정원이 있어요.', '따뜻한 식사, 수선, 편지와 옷장. 탐험을 마치면 이곳으로 돌아와요.', '닫힌 창고 앞, 사라진 기록을 지키는 상자들.', '루멘이 오래 숨겨둔 걱정과 마주하는 곳.', '파도에 묻힌 종소리를 듣고 등대의 첫 신호를 찾아요.', '세 풍향계에 길을 잃은 바람. 신호를 모으면 언덕길이 열려요.', '바다와 바람의 신호를 별지도에 겹쳐 옛 순찰길을 찾아요.', '반장이 왜 일지를 숨겼는지, 그날 밤의 기록을 읽어요.', '되찾은 마음을 등대까지 보내는 물길. 복구하면 항구 지름길이 열려요.'];
    C.maps.forEach((m, i) => {
        m.description = desc[i];
        m.region = i < 2 ? '해안 길' : i === 2 ? '안식처' : i === 4 ? '마지막 걱정' : i === 5 || i === 6 ? '두 갈래 조사' : i === 7 ? '별지도' : i === 8 ? '잊힌 기록' : '귀환의 길';
    });
    C.objects = C.objects.filter(o => o.id !== 'lampTrail');
    C.objects.push({ id: 'lampTrail', kind: 'beacon', map: 1, x: 1600, y: 651 });
    C.objects.push(...[
        ['tideBell0', 'tideBell', 5, 730, 651, 0], ['tideBell1', 'tideBell', 5, 1530, 651, 1], ['tideBell2', 'tideBell', 5, 2510, 651, 2],
        ['windVane0', 'windVane', 6, 780, 651, 0], ['windVane1', 'windVane', 6, 1580, 651, 1], ['windVane2', 'windVane', 6, 2550, 651, 2],
        ['starChart', 'starChart', 7, 1330, 651], ['archiveBook', 'archiveBook', 8, 2370, 651], ['waterWheel', 'waterWheel', 9, 2370, 651],
        ['herbGarden1', 'herb', 6, 1080, 440], ['herbGarden2', 'herb', 6, 2680, 520], ['herbTide', 'herb', 5, 1830, 530],
        ['tideTreasure', 'treasure', 5, 2870, 530], ['gardenTreasure', 'treasure', 6, 1980, 435], ['archiveTreasure', 'treasure', 8, 2190, 440]
    ].map(([id, kind, map, x, y, index]) => ({ id, kind, map, x, y, index })));
    Object.assign(C.items, {
        seaGlass: { name: '파도 유리', icon: 'dust', type: 'material', rarity: '탐험 재료', lore: '파도에 오래 닳아 날카로운 곳이 없는 빛. 조수 동굴의 어둑이와 상자에서 찾는다.', effect: '바다빛 베레모 제작 재료' },
        softScarf: { name: '첫 순찰 스카프', icon: 'ribbon', type: 'costume', cosmeticSlot: 'neck', rarity: '기본 꾸미기', lore: '첫 순찰을 기억하는 따뜻한 크림색 스카프.', effect: '목 장식 · 외형에 표시', color: '#f3d89e' },
        roseBow: { name: '별잎 리본', icon: 'ribbon', type: 'costume', cosmeticSlot: 'head', rarity: '제작 꾸미기', lore: '직접 모은 잎과 꿈실로 묶은 분홍 리본.', effect: '머리 장식 · 외형에 표시', color: '#d985a6' },
        seaBeret: { name: '조수빛 베레모', icon: 'badge', type: 'costume', cosmeticSlot: 'head', rarity: '제작 꾸미기', lore: '동굴에서 주운 파도 유리를 별 장식으로 박았다.', effect: '머리 장식 · 외형에 표시', color: '#87bdc7' },
        starCrown: { name: '첫 마음의 별관', icon: 'badge', type: 'costume', cosmeticSlot: 'head', rarity: '이야기 꾸미기', lore: '기록실에서 되찾은 신입의 종이 왕관. 서툴러도 빛날 수 있다.', effect: '기록실 이야기 보상', color: '#f1cf82' },
        tideScarf: { name: '파도결 스카프', icon: 'ribbon', type: 'costume', cosmeticSlot: 'neck', rarity: '탐험 꾸미기', lore: '조수종이 남긴 푸른 꿈실로 만든 스카프.', effect: '조수 동굴 조사 보상', color: '#8bc9d6' },
        nightCape: { name: '보랏빛 순찰 망토', icon: 'wing', type: 'costume', cosmeticSlot: 'back', rarity: '제작 꾸미기', lore: '오래된 꿈실을 이어 작은 망토로 만들었다.', effect: '등 장식 · 걷는 속도에 따라 살랑여요', color: '#a68ac7' },
        mailBag: { name: '뒤뚱의 배달 가방', icon: 'letter', type: 'costume', cosmeticSlot: 'back', rarity: '부탁 꾸미기', lore: '늦은 답장을 전해준 이에게 주는 작은 우체부 가방.', effect: '편지 배달 보상', color: '#c39881' },
        lampPack: { name: '돌아오는 길의 등불', icon: 'lantern', type: 'costume', cosmeticSlot: 'back', rarity: '부탁 꾸미기', lore: '다른 지킴이들의 귀갓길도 밝혀준 빛.', effect: '길등 세 개 복구 보상', color: '#eec879' },
        starTrail: { name: '꿈빛 발자국', icon: 'dust', type: 'costume', cosmeticSlot: 'aura', rarity: '완결 꾸미기', lore: '오늘 지켜낸 기억들이 걸음마다 따라온다.', effect: '첫 번째 밤 완결 보상', color: '#f3d5a1' }
    });
    C.costumeRecipes = { roseBow: { thread: 1, herb: 2, dreamDust: 3 }, seaBeret: { seaGlass: 3, thread: 1 }, nightCape: { thread: 2, dreamDust: 8 } };
    C.memories.push({ id: 'tideMemory', icon: '≈', name: '기다려주는 파도', description: '늦게 도착한 배를 기다리며 반장이 울렸던 종. 돌아온다는 믿음이 남아 있었다.', hint: '조수 동굴의 세 종을 바르게 울려요.' }, { id: 'windMemory', icon: '❋', name: '실수해도 다시', description: '부러진 연을 고치며 방향을 배운 신입. 바람은 실패를 세지 않는다.', hint: '바람 정원의 풍향계를 바로잡아요.' }, { id: 'chartMemory', icon: '✧', name: '함께 그린 지도', description: '한 사람이 놓친 길을 다른 사람이 이었다. 등대는 바다와 바람을 함께 읽어야 보인다.', hint: '관측소에서 두 신호를 별지도에 겹쳐요.' }, { id: 'waterMemory', icon: '⌁', name: '마음이 돌아오는 길', description: '어둠 속에서도 길을 복구했다. 누군가 다시 돌아올 것을 믿었으니까.', hint: '등대 아래의 수차를 다시 움직여요.' });
    const old = C.quests;
    C.quests = [...old.slice(0, 4),
        { name: '파도가 기억하는 신호', description: '해변 곁길의 조수 동굴에서 낮은 종 → 높은 종 → 가운데 종을 울려요.', goal: 1, map: 5, targetX: 730, flag: 'tideAttuned', reward: 40, act: 2 },
        { name: '바람이 잃어버린 방향', description: '산책로 갈림길의 정원에서 풍향계를 동 → 서 → 북으로 맞춰요.', goal: 1, map: 6, targetX: 780, flag: 'windAttuned', reward: 40, act: 2 },
        { name: '두 신호가 만나는 지도', description: '별 관측소에서 달 → 파도 → 바람 순서로 오래된 별지도를 읽어요.', goal: 1, map: 7, targetX: 1330, flag: 'starChartRead', reward: 45, act: 2 },
        { name: '반장이 남긴 빈 페이지', description: '창고 골목의 기록실에서 어둑이를 정화하고 마지막 기록을 읽어요.', goal: 1, map: 8, targetX: 2370, flag: 'archiveRead', reward: 45, act: 3 },
        { ...old[4], description: '창고 골목 두 조각과 기록실 한 조각, 편지 조각을 모두 찾아요.', act: 3 },
        { ...old[5], act: 3 }, { ...old[6], act: 3 },
        { name: '돌아오는 길을 만드는 일', description: '기록실 아래 물길에서 수차를 복구해 등대로 꿈빛을 보내요.', goal: 1, map: 9, targetX: 2370, flag: 'bridgeOpened', reward: 50, act: 4 },
        { ...old[7], act: 4 }, { ...old[8], act: 4 }, { ...old[9], act: 4 }];
    C.quests.forEach((q, i) => {
        q.act = q.act || 1;
        q.key = q.flag || q.ids.join('-');
    });
    C.acts = ['', '1막 · 꺼져가는 등대', '2막 · 바다와 바람의 기억', '3막 · 반장이 숨긴 첫 마음', '4막 · 함께 돌아오는 밤'];
    C.dialogue.town.push(['lumen', '등대에는 바다와 바람, 두 신호가 필요하단다.\n도시락을 챙겨 조수 동굴과 바람 정원을 살펴보렴.'], ['ari', '두 곳의 신호를 관측소에서 겹치면\n닫힌 창고로 가는 옛 지도를 읽을 수 있겠네요.']);
    C.dialogue.cooked.push(['madeleine', '해변의 곁길과 산책로 언덕, 어느 쪽부터 가도 괜찮아.\n돌아오면 모은 재료로 너만의 옷도 만들어보렴.']);
    C.dialogue.captainTruth.push(['lumen', '물길의 수차가 멈춰 꿈빛도 돌아오지 못하고 있단다.\n기록실 아래 계단으로 내려가, 물길을 먼저 복구해주렴.']);
    Object.assign(C.dialogue, {
        tideSolved: [['popo', '종소리가 바다에 길을 그렸어! 저 아래 물길도 열렸네.'], ['ari', '반장님은 늦는 배를 기다리며 이 종을 울렸대.\n돌아올 거라고 믿어줬던 마음이 첫 신호였구나.']],
        windSolved: [['ari', '풍향계가 같은 바람을 읽기 시작했어.\n관측소로 오르는 언덕길도 찾았네.'], ['popo', '부러진 연도 다시 띄울 수 있구나.\n이 신호를 바다의 신호랑 같이 별지도에 올려보자!']],
        chartSolved: [['narrator', '바다와 바람의 신호가 겹쳐지자, 사라진 순찰길이 나타났습니다.'], ['ari', '창고 골목의 옆문은 기록실로 이어져.\n반장님이 숨긴 걱정이 거기서 시작된 것 같아.']],
        archiveRead: [['ari', '“처음 맡은 밤, 길을 잘못 알려 배가 늦었다.\n나는 반장이 되어도 되는 사람일까?”'], ['popo', '다음 장도 있어. “늦게라도 모두 돌아왔다.\n그런데 나는 내 실수만 기억했다.”'], ['ari', '상자에서 나온 편지 조각이 이날의 임명장이었구나.\n뒤뚱에게 부탁해서 반장님께 온전한 말을 전하자.']],
        bridgeSolved: [['popo', '수차가 돈다! 꿈빛이 등대까지 이어지고 있어!\n항구로 돌아가는 승강기도 다시 움직이네.'], ['ari', '이제 창고 깊은 곳의 걱정만 남았어.\n반장님의 처음 마음을 함께 데려오자.']]
    });
})();
