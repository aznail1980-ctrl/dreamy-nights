# v4.35 몬스터 원화 제작 기록

제작 방식: Codex 내장 image_gen 도구. 외부 CLI나 유료 음성 서비스는 사용하지 않았다. 기존 게임 원화를 참고한 신규 생성 후 동일 도구로 프레임 간 투명 여백을 보완했다. 모든 그림은 RGBA 투명 PNG이며 코드에 기록된 개별 그림 영역과 발 기준으로 렌더링한다. 걷기 A/B · 공격 예고 · 공격 · 피격의 5자세다.

## 최종 자산

| 파일 | 내용 | 동작 수 |
|---|---|---|
| assets/dungeonCoastV435.png | 종껍질 파수꾼, 먹물바위 소라, 가시가면 지킴이, 낡은 풍향 박쥐 | 20 |
| assets/dungeonDepthV435.png | 잉크자물쇠 책, 봉인 종이까마귀, 녹슨 밸브지기, 진흙집게 잠복꾼 | 20 |
| assets/outdoorMischiefV435.png | 진주등 달팽이, 소원잎 나방, 장미씨 고슴이, 리본꾸러미, 잉크병 서기 | 25 |
| assets/patrolMischiefV435.png | 모래보숭이, 폴짝게, 상자숨이 | 15 |

먼지대장 보스와 펫 원화는 유지한다. 신규 적 8종은 각 조사 던전에서만 출현하며, 기존 일반 적 8종은 이름·저장 ID·전투 규칙을 유지하고 표정과 자세 원화를 교체한다. 스프라이트 영역/발 위치는 dungeon-art.js, 측정값은 tests/dungeon-art-measurements.json에 있다.

## 전달한 프롬프트 세트의 제작 지시

공통: Korean hand-painted watercolor/gouache and ink fantasy RPG; mildly hostile, less cuddly than pets; small narrow amber eyes, stern/downward brows, asymmetrical mischievous scowl; no blush, sparkling baby eyes or fluffy baby features; age 8+ adventure, no horror or gore; full bodies facing right; transparent alpha; consistent character scale and ground; walk A / walk B / readable wind-up / attack / hurt; no text or captions.

1. 해안·정원 4 × 5 아틀라스: cracked bronze diving-bell shell crab with robust claws and blue bubble; dark teal rock-spiral whelk with webbed arms and shell slide; thorn-collar wooden leaf-mask root keeper with seed attack; oxidized copper weather-vane bat with ragged pointed leaf wings and gust.
2. 기록실·물길 4 × 5 아틀라스: locked violet leather book with jagged pages, ribbon arms and ink spit; folded parchment raven with navy ink edges/red wax seal; dented copper valve sentry on pipe legs with spanner arm; dark blue stone/silt lobster with rust-pipe tail and bubble claw attack.
3. 일반 지역 5 × 5 아틀라스: grumpy pearl/coral rock-shell snail; sharp folded wish-leaf moth; bristly rose-seed thorn hedgehog, not furry; torn wrapping-paper parcel bat; angular ink-bottle scribe with quill and folded paper legs.
4. 기본 순찰 3 × 5 아틀라스: angular dark-violet sand/ink mound with tattered flag and pebble fists; navy pointed coral crab with jointed legs and big rust-orange claw, no bow tie; scuffed delivery-box mimic with torn flaps, amber ink eye slit, paper feet and ribbon arms. Preserve sand/crab/parcel identities but remove round puppy eyes and fuzzy pompom textures.

여백 수정에서 전달한 핵심 지시: “Preserve the same creatures and five poses. Shrink each individual sprite including effects to 65% of its present cell size. Center it in its own cell. Leave minimum 35 pixels fully transparent on ALL FOUR SIDES. Nothing touches another pose or the image border. The whole body and attack effect must fit within 70% width/height of each cell. Feet at 80% cell height. Smaller fully separated drawings are critical.”

## 검수

초기 아틀라스에서 인접 공격 그림의 조각이 섞이는 문제를 발견해 이미지 도구로 여백을 다시 제작했다. 실제 게임 렌더러로 자세별 그림을 펼쳐 확인하고 개별 발 위치를 맞췄다. 예고와 공격 판정은 별도 게임 로직으로 실행되며, 그림에 포함된 작은 거품/바람 외에 실제 이동 투사체가 추가된다. 전용 몬스터 발성은 기존 음원 연결이며 신규 녹음으로 표시하지 않는다.
