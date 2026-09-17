/* Supplied GDD v1.5 and World 1 story adapted into one complete, compact chapter.
   Gameplay content only: the historical workflow instructions in the documents are not executed. */
'use strict';
window.DREAM_CONTENT = {
    maps: [
        { id: 'beach', name: '첫잠 해변', icon: '☾', width: 2800, theme: 'beach', platforms: [{ x: 610, y: 526, w: 230 }, { x: 1620, y: 505, w: 240 }], enemies: [{ id: 'sand1', type: 'sand', x: 1000 }, { id: 'sand2', type: 'sand', x: 1550 }, { id: 'sand3', type: 'sand', x: 2130 }], memory: { id: 'shell', x: 1738, y: 456 } },
        { id: 'trail', name: '살랑바람 산책로', icon: '❋', width: 2500, theme: 'trail', platforms: [{ x: 550, y: 540, w: 280 }, { x: 960, y: 466, w: 280 }, { x: 1740, y: 525, w: 240 }], enemies: [{ id: 'crab1', type: 'crab', x: 950 }, { id: 'crab2', type: 'crab', x: 1780 }], memory: { id: 'kite', x: 1090, y: 420 } },
        { id: 'town', name: '잠의 항구 마을', icon: '⚓', width: 2000, theme: 'town', platforms: [{ x: 1150, y: 520, w: 230 }], enemies: [], npc: { x: 900 } },
        { id: 'alley', name: '부둣가 창고 골목', icon: '▣', width: 2700, theme: 'alley', platforms: [{ x: 530, y: 532, w: 230 }, { x: 1360, y: 495, w: 240 }, { x: 1950, y: 528, w: 220 }], enemies: [{ id: 'box1', type: 'box', x: 900 }, { id: 'box2', type: 'box', x: 1560 }, { id: 'box3', type: 'box', x: 2110 }], memory: { id: 'letter', x: 1480, y: 448 } },
        { id: 'warehouse', name: '창고 깊은 곳', icon: '✦', width: 1900, theme: 'boss', platforms: [{ x: 440, y: 529, w: 210 }, { x: 1190, y: 529, w: 210 }], enemies: [{ id: 'boss1', type: 'boss', x: 1360 }] }
    ],
    creatures: {
        sand: { name: '모래보숭이', hp: 5, speed: 39, size: 112, exp: 18, light: 7, worry: '모래성을 또 망치면 어쩌지?', memory: '바다가 몇 번을 지워도, 다시 쌓던 작은 모래성.' },
        crab: { name: '폴짝게', hp: 7, speed: 58, size: 128, exp: 24, light: 9, worry: '먼저 다가갔다가 어색해지면 어쩌지?', memory: '집게를 흔들어 건넨 첫인사. 그날부터 친구가 생겼다.' },
        box: { name: '상자숨이', hp: 9, speed: 26, size: 122, exp: 30, light: 12, worry: '오래 넣어두었으니, 이제 아무도 찾지 않겠지?', memory: '상자 속에 숨겨 둔 첫 순찰 배지. 여전히 반짝인다.' },
        boss: { name: '먼지대장', hp: 64, speed: 36, size: 315, exp: 100, light: 70, worry: '나는 정말 반장 자격이 있을까?', memory: '루멘의 첫 순찰 일지. 서툴렀던 시작도, 누군가를 지키는 마음도 그대로였다.' }
    },
    memories: [
        { id: 'pillow', icon: '✧', name: '처음의 반짝임', description: '걱정을 털어내자 빛이 남았다. 정화는 누군가의 소중한 기억을 되찾는 일이었다.', hint: '첫 어둑이를 정화하면 만나요.' },
        { id: 'shell', icon: '◈', name: '파도를 담은 조개', description: '귀에 대면 들리는 파도 소리. 첫잠 해변에서 약속했던 “내일 또 만나”.', hint: '첫잠 해변의 높은 발판 위를 살펴보세요.' },
        { id: 'kite', icon: '◇', name: '바람을 타던 연', description: '자꾸만 내려앉아도 손을 놓지 않았던 날. 연은 마침내 바람을 배웠다.', hint: '산책로의 두 번째 발판에 별빛이 보여요.' },
        { id: 'pomi', icon: '☁', name: '작은 길잡이', description: '길을 헤매던 두 신입에게 다가온 양구름 포미. 함께라서 돌아갈 곳을 찾았다.', hint: '항구 마을에서 루멘 반장을 만나세요.' },
        { id: 'letter', icon: '✉', name: '부치지 못한 답장', description: '“너무 늦었을까?” 하고 접어둔 편지. 기다리는 마음에는 마감일이 없었다.', hint: '창고 골목의 상자 위를 찾아보세요.' },
        { id: 'journal', icon: '▤', name: '반장의 첫 순찰 일지', description: '첫 페이지에는 “순찰 완료!”라고 쓰여 있었다. 우리의 말은, 누군가의 시작에서 이어졌다.', hint: '먼지대장의 걱정을 모두 털어주세요.' }
    ],
    quests: [
        { name: '첫 꿈빛을 찾아서', description: '첫잠 해변의 모래보숭이를 정화해요.', goal: 3, map: 0, ids: ['sand1', 'sand2', 'sand3'], reward: 25 },
        { name: '바람을 따라, 폴짝!', description: '산책로의 폴짝게를 도와주세요.', goal: 2, map: 1, ids: ['crab1', 'crab2'], reward: 30 },
        { name: '항구에 도착! …맞지?', description: '항구의 루멘 반장과 이야기해요.', goal: 1, map: 2, flag: 'metLumen', reward: 35 },
        { name: '상자 속에 숨은 마음', description: '창고 골목의 상자숨이를 정화해요.', goal: 3, map: 3, ids: ['box1', 'box2', 'box3'], reward: 40 },
        { name: '재채기 주의보', description: '창고 깊은 곳의 먼지대장을 도와줘요.', goal: 1, map: 4, ids: ['boss1'], reward: 60 },
        { name: '우리의 첫 번째 밤', description: '오래된 순찰 일지의 이야기를 들어요.', goal: 1, map: 2, flag: 'completed', reward: 80 }
    ],
    dialogue: {
        intro: [
            ['narrator', '사람들이 잠들면, 그 밤의 꿈은 섬이 되어\n잠의 바다 위로 떠오릅니다.'],
            ['popo', '아리! 일어나! 첫 순찰 날이야!\n…앗, 임명식은 저쪽이었나?'],
            ['ari', '우선 해변을 따라가 보자.\n저 반짝이는 등대가 우리를 기다리고 있어.'],
            ['popo', '좋아, 정했어! 걱정 뭉치들은 우리가 털어주자.\n포포와 아리, 출동!']
        ],
        firstMemory: [
            ['popo', '펑! …우와, 이게 네 기억이구나.\n작은 모래성을 쌓던 즐거운 마음이었어.'],
            ['ari', '어둑이는 나쁜 마음이 아니었네.\n우리가 걱정을 털어주면, 기억이 다시 반짝이는 거야.']
        ],
        town: [
            ['popo', '항구에 도착! …맞지?\n이 조그만 구름 친구가 길을 알려줬어!'],
            ['lumen', '양구름 드리미, 포미로구나.\n순찰의 기본은 무사귀환. …그리고 간식이다.'],
            ['lumen', '이건 지킴이 수첩과 꿈나침반이다.\n길을 헤매면 지도를 펼쳐보거라.'],
            ['popo', '반장님! 창고에서 재채기 소리가 들려요.\n아리랑 가 봐도 돼요?'],
            ['lumen', '창고에는… 조금 오래된 걱정이 있지.\n준비가 되면 살펴봐 주겠니.'],
            ['ari', '다녀오겠습니다. 포미도 같이 가자!']
        ],
        bossIntro: [
            ['popo', '들숨… 들숨… 크게 들숨!\n아리, 바닥이 반짝이면 비켜서야 해!'],
            ['ari', '저 커다란 몸에도 작은 걱정이 숨어 있겠지.\n괜찮아. 우리가 같이 털어줄게.']
        ],
        finale: [
            ['narrator', '마지막 먼지가 별빛으로 흩어졌습니다.\n그 자리에 낡은 꿈도장과 순찰 일지 한 권이 남았습니다.'],
            ['ari', '“나는 정말 반장 자격이 있을까?”\n반장님도 처음엔 걱정이 많으셨구나.'],
            ['popo', '첫 페이지를 봐! “순찰 완료!”래!\n우와, 반장님도 나랑 똑같이 말했네!'],
            ['lumen', '서툴러도 괜찮단다. 돌아와서,\n다시 꿈을 지키러 나가면 되는 거니까.'],
            ['ari', '마지막 장에는… “오늘도 등대를 못 찾았다.\n등대지기가 등대를 잃어버리다니.”'],
            ['popo', '반장님도 길치였어요?! 원정대 유전이에요?!\n에헤헤. 그럼 오늘도… 순찰 완료—!']
        ],
        after: [
            ['lumen', '깨끗해진 창고를 작은 기념관으로 만들었단다.\n너희의 새 일지도 내 일지 옆에 꽂아두었지.'],
            ['popo', '…있잖아, 나 이 일 하길 잘한 것 같아.\n다음 꿈에서도 함께 순찰하자, 아리!']
        ],
        friendship: [
            ['popo', '짜잔! 포포 특제 순찰 지도!\n여기 별표는 전부 뭔가 있을 것 같은 곳이야.'],
            ['ari', '그러니까 길을 잃은 게 아니라…\n남들이 안 가 본 길을 먼저 찾고 있었구나.'],
            ['popo', '그렇지! 좋아, 정했어.\n엄마 아빠에게도 새 길을 찾았다고 편지 쓸 거야!']
        ]
    }
};
