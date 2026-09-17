'use strict';
/* Items, relationships and world interactions all belong to the same first-night story. */
(() => {
    const C = window.DREAM_CONTENT;
    C.items = {
        baton: { name: '신입의 꿈배턴', icon: 'wand', type: 'equipment', slot: 'weapon', rarity: '기본', lore: '첫 순찰에 받은 별 모양 배턴. 서툰 손에도 작은 꿈빛이 따라온다.', effect: '기본 정화 도구', stats: {} },
        stellarBaton: { name: '다시 빛나는 꿈배턴', icon: 'wand', type: 'equipment', slot: 'weapon', rarity: '희귀', lore: '정화한 꿈가루와 원정대의 옛 실로 고쳐 쥐었다. 오래된 물건도 새로운 시작이 된다.', effect: '정화 위력 +1 · 꿈빛 파동 +2', stats: { attack: 1, skill: 2 } },
        rookieBadge: { name: '신입 지킴이 배지', icon: 'badge', type: 'equipment', slot: 'charm', rarity: '기본', lore: '“돌아오는 것까지가 순찰이다.” 배지 뒷면에 새겨진 원정대의 약속.', effect: '첫 순찰의 표식', stats: {} },
        captainBadge: { name: '루멘의 첫 별배지', icon: 'badge', type: 'equipment', slot: 'charm', rarity: '희귀', lore: '반장이 신입 시절 달았던 배지. 실수를 했어도 누군가를 지켰다는 증거다.', effect: '최대 마음 +1 · 정화 위력 +1', stats: { hp: 1, attack: 1 } },
        herbRibbon: { name: '마들렌의 응원 리본', icon: 'ribbon', type: 'equipment', slot: 'charm', rarity: '희귀', lore: '별잎을 함께 모아준 이에게 묶어주는 리본. 조그만 정성이 생각보다 든든하다.', effect: '최대 마음 +2', stats: { hp: 2 } },
        windShoes: { name: '답장을 싣는 바람', icon: 'wing', type: 'equipment', slot: 'keepsake', rarity: '희귀', lore: '뒤뚱이 처음 배달하던 날의 깃털 부적. 늦었다고 생각한 편지가 용기가 되었다.', effect: '이동 속도 +12% · 대시 대기 -0.2초', stats: { speed: .12, dodge: .2 } },
        lanternCharm: { name: '길잡이의 작은 등불', icon: 'lantern', type: 'equipment', slot: 'keepsake', rarity: '희귀', lore: '세 갈래 꿈길에 불을 밝힌 순찰자의 기념품. 이제 뒤따르는 이도 길을 찾을 수 있다.', effect: '꿈빛 파동 +3 · 꿈빛 공명 획득 +25%', stats: { skill: 3, resonance: .25 } },
        cookie: { name: '포근한 버터 쿠키', icon: 'cookie', type: 'supply', rarity: '간식', lore: '반장이 몰래 주머니에 넣어준 간식. 포포는 “비상식량”을 자주 확인한다.', effect: '마음 3 회복', heal: 3 },
        lunch: { name: '별빛 순찰 도시락', icon: 'lunch', type: 'supply', rarity: '요리', lore: '마들렌과 함께 만든 따뜻한 도시락. 누군가 챙겨준 한 끼가 긴 순찰을 지탱한다.', effect: '마음 전체 회복 · 다음 피격 1회 보호', heal: 99, shield: 1 },
        tea: { name: '별잎 차', icon: 'tea', type: 'supply', rarity: '요리', lore: '살랑바람이 말린 잎을 천천히 우렸다. 포미까지 고개를 끄덕이는 향.', effect: '마음 2 회복 · 꿈빛 공명 +25', heal: 2, resonance: 25 },
        dreamDust: { name: '반짝 꿈가루', icon: 'dust', type: 'material', rarity: '재료', lore: '어둑이의 걱정을 털어내고 남은 빛. 도구를 고치는 데 쓰인다.', effect: '꿈배턴 수선 재료' },
        moonFlour: { name: '달빛 밀가루', icon: 'flour', type: 'material', rarity: '재료', lore: '모래성을 만들던 기억 속에서 찾은 달빛 가루. 꿈속에서는 고소한 향이 난다.', effect: '도시락 재료 · 2개 필요' },
        honey: { name: '바람꽃 꿀', icon: 'honey', type: 'material', rarity: '재료', lore: '폴짝게가 처음 친구에게 건넨 달콤한 선물.', effect: '도시락 재료 · 1개 필요' },
        thread: { name: '오래된 꿈실', icon: 'thread', type: 'material', rarity: '재료', lore: '상자 속 먼지를 털자 드러난 원정대의 실타래.', effect: '꿈배턴 수선 재료 · 2개 필요' },
        herb: { name: '반짝 별잎', icon: 'leaf', type: 'material', rarity: '채집', lore: '발걸음이 멈춘 곳에서만 보이는 조그만 잎. 마들렌의 차 향기의 비밀.', effect: '차 만들기 · 마들렌의 부탁' },
        page: { name: '빛바랜 편지 조각', icon: 'letter', type: 'story', rarity: '이야기', lore: '상자숨이가 지키고 있던 조각. “자격은… 완벽함이…”라는 글자가 남아 있다.', effect: '조각 3개를 뒤뚱에게 가져가기' },
        oldLetter: { name: '이어 붙인 첫 임명장', icon: 'letter', type: 'story', rarity: '이야기', lore: '“자격은 완벽함이 아니라, 다시 돌아오는 마음에 있다.” 루멘이 신입이던 밤에 받은 편지.', effect: '루멘 반장에게 보여주기' },
        warehouseKey: { name: '달빛 창고 열쇠', icon: 'key', type: 'story', rarity: '이야기', lore: '루멘이 직접 건넨 열쇠. 걱정을 오래 숨겨둔 문을 함께 열기로 했다.', effect: '창고 깊은 곳 입장' },
        postcard: { name: '파도에 젖은 답장', icon: 'letter', type: 'story', rarity: '부탁', lore: '해변의 오래된 상자 안에서 찾았다. 받는 이의 이름은 틀렸지만, 반가운 마음은 분명하다.', effect: '뒤뚱에게 전해주기' },
        oldJournal: { name: '루멘의 첫 순찰 일지', icon: 'journal', type: 'story', rarity: '이야기', lore: '먼지대장 안에서 되찾은 낡은 일지. 첫 페이지와 마지막 페이지에 같은 마음이 남아 있다.', effect: '항구로 돌아가 루멘에게 돌려주기' },
        compass: { name: '꿈나침반', icon: 'compass', type: 'story', rarity: '도구', lore: '늘 가까운 등대를 가리키는 나침반. 포포에게는 특별히 큰 화살표가 달려 있다.', effect: '방문한 꿈길 이동 · 의뢰 길 안내' }
    };
    C.npcs = {
        lumen: { name: '루멘 반장', image: 'npcLumen', map: 2, x: 1010, role: '등대지기 · 원정대 반장', greeting: '“순찰의 기본은 무사귀환. …그리고 간식이다.”' },
        madeleine: { name: '마들렌', image: 'npcBaker', map: 2, x: 490, role: '항구 빵집 · 순찰 도시락', greeting: '“아이고, 우리 강아지들. 빈속으로 꿈을 지키러 간다고?”' },
        post: { name: '뒤뚱', image: 'npcPost', map: 2, x: 1580, role: '꿈편지 우체부 · 편지 수선', greeting: '“포포님… 아니 뽀뽀님? 아무튼 편지요!”' }
    };
    C.maps[2].width = 2600;
    C.maps[2].npc = { x: 1010 };
    C.maps[2].platforms = [{ x: 1820, y: 520, w: 230 }];
    C.objects = [
        { id: 'herbBeach1', kind: 'herb', map: 0, x: 530, y: 651 }, { id: 'herbBeach2', kind: 'herb', map: 0, x: 1840, y: 651 },
        { id: 'herbTrail1', kind: 'herb', map: 1, x: 600, y: 540 }, { id: 'herbTrail2', kind: 'herb', map: 1, x: 2150, y: 651 },
        { id: 'herbAlley', kind: 'herb', map: 3, x: 1370, y: 495 },
        { id: 'chestBeach', kind: 'chest', map: 0, x: 2430, y: 651 }, { id: 'chestTrail', kind: 'chest', map: 1, x: 1760, y: 525 },
        { id: 'lampBeach', kind: 'beacon', map: 0, x: 740, y: 651 }, { id: 'lampTrail', kind: 'beacon', map: 1, x: 1450, y: 651 }, { id: 'lampAlley', kind: 'beacon', map: 3, x: 2300, y: 651 },
        { id: 'dreamBell', kind: 'altar', map: 2, x: 2240, y: 651 }
    ];
    C.sideQuests = {
        herbs: { name: '차 한 잔의 온기', npc: 'madeleine', goal: '꿈길에서 별잎 3개를 모아 마들렌에게 전하기', reward: '응원 리본 · 별잎 차 2잔', flag: 'herbsDelivered' },
        mail: { name: '부치지 못한 답장', npc: 'post', goal: '첫잠 해변 끝의 상자에서 답장을 찾아 뒤뚱에게 전하기', reward: '바람 깃털 부적 · 꿈빛 30', flag: 'replyDelivered' },
        beacons: { name: '돌아오는 길의 불빛', npc: 'lumen', goal: '해변·산책로·창고 골목의 길등 3개 밝히기', reward: '작은 등불 부적 · 꿈빛 40', flag: 'beaconsRewarded' }
    };
    C.quests = [
        { name: '꺼져가는 꿈빛', description: '해변의 모래보숭이에게 빛을 되찾아요.', goal: 3, map: 0, ids: ['sand1', 'sand2', 'sand3'], reward: 25 },
        { name: '등대까지 이어진 흔적', description: '산책로의 폴짝게를 정화해요.', goal: 2, map: 1, ids: ['crab1', 'crab2'], reward: 30 },
        { name: '반장이 숨겨둔 걱정', description: '잠의 항구에서 루멘과 이야기해요.', goal: 1, map: 2, npc: 'lumen', flag: 'metLumen', reward: 35 },
        { name: '든든한 순찰 도시락', description: '마들렌과 함께 첫 도시락을 만들어요.', goal: 1, map: 2, npc: 'madeleine', flag: 'cookedFirst', reward: 30 },
        { name: '상자가 지키던 편지', description: '상자숨이 3개체의 편지 조각을 찾아요.', goal: 3, map: 3, ids: ['box1', 'box2', 'box3'], reward: 40 },
        { name: '조각난 마음을 잇는 일', description: '뒤뚱에게 편지 조각 3개를 맡겨요.', goal: 1, map: 2, npc: 'post', flag: 'letterRead', reward: 35 },
        { name: '완벽하지 않아도 괜찮아', description: '되찾은 임명장을 루멘에게 보여줘요.', goal: 1, map: 2, npc: 'lumen', flag: 'readyForBoss', reward: 40 },
        { name: '창고의 오래된 걱정', description: '먼지대장의 걱정을 함께 털어줘요.', goal: 1, map: 4, ids: ['boss1'], reward: 60 },
        { name: '다녀왔습니다, 반장님', description: '첫 순찰 일지를 루멘에게 돌려줘요.', goal: 1, map: 2, npc: 'lumen', flag: 'journalReturned', reward: 50 },
        { name: '다시 켜는 우리의 밤', description: '항구 오른쪽 꿈종에서 등대에 불을 켜요.', goal: 1, map: 2, targetX: 2240, flag: 'completed', reward: 80 }
    ];
    Object.assign(C.dialogue, {
        intro: [['narrator', '잠든 사람들의 꿈이 섬으로 떠오르는 잠의 바다.\n오늘은 처음으로, 포근등대의 불빛이 약해졌습니다.'], ['popo', '아리! 첫 순찰 날인데 등대가 졸고 있어!\n길은… 괜찮아. 우리가 먼저 찾아보자!'], ['ari', '불빛이 약해진 길에 어둑이들이 모이고 있어.\n걱정을 털어주면서 항구로 가 보자.'], ['popo', '반장님이 가방도 챙겨줬어. 찾은 물건은 I로 확인!\n좋아, 오늘 밤은 우리가 지키는 거야!']],
        firstMemory: [['popo', '펑! 모래성을 쌓던 기억이 나왔어!\n이 반짝 가루랑 달빛 밀가루도 가방에 챙겨두자.'], ['ari', '걱정이 사라진 자리에 쓸모없는 건 없네.\n누군가에게 다시 필요한 물건일지도 몰라.']],
        town: [['popo', '포미가 길을 알려줬어! 반장님, 등대는 왜 졸아요?'], ['lumen', '길을 밝히는 마음이… 조금 지친 모양이구나.\n내가 맡은 등대인데도 말이지.'], ['ari', '해변에서 찾은 꿈빛을 가져왔어요.\n우리도 도울 수 있을까요?'], ['lumen', '우선 마들렌에게 따뜻한 도시락을 부탁하거라.\n이 꿈나침반과 포미가 돌아오는 길을 지켜줄 게다.'], ['popo', '창고에서도 재채기 소리가 나던데요?'], ['lumen', '창고엔 오래 덮어둔 물건들이 있지.\n상자 속 편지가 보이면… 뒤뚱에게 맡겨주렴.']],
        bakerFirst: [['madeleine', '아이고, 우리 강아지들. 반장님이 보냈지?\n달빛 밀가루와 바람꽃 꿀이면 든든한 도시락이 된단다.'], ['ari', '어둑이를 정화하고 찾은 재료들이에요.'], ['madeleine', '그럼 누군가의 좋은 기억으로 만드는 한 끼로구나.\n예쁘게 못 구워도 괜찮아. 따뜻하면 되는 거야.']],
        cooked: [['popo', '간식 완… 아니, 도시락 완료—!\n하나쯤 맛보는 것도 순찰 준비겠지?'], ['madeleine', '가방에 잘 넣어두렴. 힘들 때 먹으면 든든해질 거야.\n반장님도 신입일 땐 늘 이 도시락을 싸 갔단다.']],
        postFirst: [['post', '포포님! 아니 뽀뽀님? 어서 와요!\n낡은 편지는 제가 이어 붙일 수 있어요.'], ['ari', '창고에서 편지 조각을 찾아볼게요.'], ['post', '세 조각이면 마음이 온전히 읽힐 거예요.\n늦은 편지라고 쓸모가 없어지는 건 아니거든요.']],
        restoredLetter: [['post', '됐다! 이건 루멘 반장님의 첫 임명장이에요.\n“자격은 완벽함이 아니라, 다시 돌아오는 마음에 있다.”'], ['popo', '반장님에게 꼭 보여주자!\n이 문장은 등대보다 밝게 느껴져.']],
        captainTruth: [['lumen', '이 편지를… 다시 읽게 될 줄은 몰랐구나.\n난 실수할 때마다 반장 자격이 없다고 생각했단다.'], ['ari', '반장님이 돌아오는 길을 지켜주셔서\n우리도 첫 순찰을 나설 수 있었어요.'], ['lumen', '고맙구나. 이 열쇠로 창고 문을 열어주겠니.\n내 첫 별배지도 가져가거라. 가방에서 달 수 있단다.'], ['popo', '완벽하지 않아도 괜찮아. 혼자도 아니니까!\n그 걱정, 우리 셋이 같이 털어줄게요.']],
        bossIntro: [['popo', '저 걱정 뭉치가 등대의 빛을 붙잡고 있었구나!\n들숨… 들숨… 재채기는 점프로 피해!'], ['ari', '반장님의 처음 마음을 찾아주자.\n공명이 차면 F로 우리 꿈빛을 합칠 수 있어.']],
        bossRecovered: [['narrator', '먼지가 별빛으로 흩어지고, 낡은 꿈도장과\n루멘의 첫 순찰 일지가 모습을 드러냈습니다.'], ['popo', '첫 페이지엔 “순찰 완료!”라고 쓰여 있어!\n내가 매일 하던 말이 반장님의 시작이었구나.'], ['ari', '가방에 잘 챙겨두자. 항구로 돌아가서\n반장님에게 직접 돌려드리고 싶어.']],
        journalHome: [['lumen', '내 첫 순찰 일지로구나.\n처음엔 누구보다 걱정이 많았지.'], ['ari', '마지막 장에는… “오늘도 등대를 못 찾았다.\n등대지기가 등대를 잃어버리다니.”'], ['popo', '반장님도 길치였어요?! 원정대 유전이에요?!'], ['lumen', '…헛기침. 서툴러도 다시 돌아왔으니 된 게지.\n자, 항구 오른쪽 꿈종에 우리의 기억을 모아보자.']],
        relight: [['narrator', '첫인사를 건넨 용기, 함께 나눈 따뜻한 한 끼,\n다시 돌아온 마음이 꿈종에 모였습니다.'], ['madeleine', '누군가를 챙기는 마음도 꿈빛이 되는구나.'], ['post', '돌아온 편지도요! 받는 이름은… 다음엔 꼭 맞힐게요!'], ['lumen', '등대는 혼자 밝히는 것이 아니었구나.\n오늘의 순찰 일지는 너희가 써주겠니?'], ['popo', '길을 조금 헤맸지만, 모두 함께 돌아왔어.\n아리, 포미! 오늘도 순찰 완료—!']],
        herbsDone: [['madeleine', '별잎 향이 참 좋구나. 이 리본을 가방에 달아보렴.\n너희가 누군가를 챙겼다는 작은 표시란다.']],
        mailDone: [['post', '제가 보내지 못했던 답장에… 벌써 답장이 왔네요!\n이름은 서로 틀렸지만, 마음은 제대로 도착했어요.'], ['popo', '전달 완료… 앗, 아니! 마음 발견 완료—!']],
        lampsDone: [['lumen', '너희가 켠 길등을 따라 다른 신입들도 돌아왔단다.\n이 작은 등불은 이제 너희의 것이란다.']],
        after: [['lumen', '기념관에는 내 일지 옆에 너희의 새 일지를 꽂았단다.\n다음 순찰은 오븐 마을로 가는 꿈길이지.'], ['madeleine', '그곳엔 오래 미뤄둔 제과 대회의 꿈이 기다린단다.\n도시락은 내가 챙겨줄 테니, 이번에도 함께 가렴.']]
    });
})();
