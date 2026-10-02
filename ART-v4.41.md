# v4.41 정화 원화 제작 기록

내장 image_gen 도구로 제작. 원화 PNG와 알파는 후처리하지 않았으며, 게임에서 아틀라스 좌표로 잘라 그린다.

## 최종 자산

- `assets/purifiedCoastCuteV441.png`: 종껍질 파수꾼, 먹물바위 소라, 가시가면 지킴이, 낡은 풍향 박쥐.
- `assets/purifiedDepthCuteV441.png`: 잉크자물쇠 책, 봉인 종이까마귀, 녹슨 밸브지기, 진흙집게 잠복꾼.
- 각 시트 4행×3열. 대기·고개 숙여 인사·손짓 동작, 총 24컷. `purification-art.js`에 프레임/발 기준점이 있다.
- 단순 눈/표정 교체 시안은 채택하지 않았다. 몸 전체의 비율, 작은 팔다리, 부드러운 재질, 밝은 색감으로 다시 설계했다.

## 입력 역할

- 첫 번째 참조: `dungeonCoastV435.png` 또는 `dungeonDepthV435.png`. 몬스터의 종·고유 소품만 참조.
- 두 번째 참조: `coastalCrittersV422.png`. 초기 귀여운 몬스터의 비율·색감·화풍 기준.
- 생성 옵션: `transparent_background: true`.

## 최종 공통 프롬프트

Create a NEW fully redesigned purified creature sprite atlas for this cozy Korean fantasy game. Reference 1 gives ONLY the four SPECIES and identity props, NOT proportions, armor texture or visual style. Reference 2 is the STRICT target for cuteness, soft pastel painted rendering, rounded collectible character proportions and polished quality. Do NOT simply replace eyes or expressions on reference 1. Redesign entire bodies as adorable plump tiny storybook sprites: oversized round head/body, tiny rounded limbs, soft ivory cheeks, subtle blush, warm big eyes, smooth pearl/pastel surfaces and clean charming shapes; remove rusty grim details, spikes, sharp teeth and gritty armor. Visibly as cute and polished as reference 2. Keep only the species-defining prop so each is recognizable 1:1. Exactly FOUR evenly spaced ROWS and THREE evenly spaced COLUMNS, one entire isolated creature inside each equal grid cell, transparent background, no labels or cell borders, 10% clear padding on all sides. Three poses per row: gentle delighted idle; grateful bow eyes closed; waving or flapping a tiny limb with happy smile. All face screen right three-quarter side. Consistent size and floor baseline within row. No sparkles outside the silhouettes. This is a production game sprite sheet.

해안/정원 추가 프롬프트:

Rows: 1 tiny pastel pearl aqua hermit crab wearing rounded diving-bell shell with coral, 2 chubby ivory snail/whelk with pearl spiral shell, 3 round soft green sprout sprite with a tiny smooth leaf mask and flower, 4 fluffy cream weather-vane BAT with round ears and pastel mint bat wings plus a tiny brass vane ornament.

기록실/수로 추가 프롬프트:

Rows: 1 small plump lavender enchanted book sprite with tiny gold lock and soft paper feet, no teeth; 2 round baby paper RAVEN with cream navy folded paper feathers and red wax seal; 3 tiny round pastel copper toy-like valve ROBOT with round head, wheel hat and mitten-shaped wrench hands; 4 chubby powder blue CRAB with rounded pincers, ivory cheeks and tiny clean copper tube on back.
