# 조수종 소라게 제작 기록

- 제작: Codex 내장 image_gen 도구. 별도 유료 API 사용 없음.
- 게임 원본: `assets/tideBellCrabV414.png` (1254 × 1254, 투명 PNG).
- 네 자세: 대기 / 종 흔들기 / 거품 공격 / 피격. 각 셀의 발 위치를 따로 맞춰 렌더링.
- 적용: 메아리 조수 동굴 전용. 1.05초 예고 → 느린 거품 한 발 → 1.15초 회복. 피해량 1, 기존 레벨·확률 드롭 유지.
- 원본 이미지를 변경하지 않고 게임에서 2×2 셀로 나누어 사용.

## 최종 생성 프롬프트

Use case: stylized-concept. Asset type: one production sprite sheet for a Korean cozy fantasy side-scrolling RPG 'Our Dreamy Nights'. Generate a SINGLE square 1024x1024 sprite sheet on genuinely transparent background, exactly four equally sized 512x512 cells in a 2x2 grid, NO grid lines, NO text. SAME creature in every cell: a small tide-pool bell hermit crab, shy expressive teal eyes, plump mint-blue body, pearlescent cream spiral shell with small brass bell and seaweed ribbon. Soft hand-painted 2D anime game illustration, warm dark-brown clean outlines, soft coral shadows, cream/gold highlights, cohesive with cute chibi human heroes and storybook harbor buildings. Full side view facing RIGHT in every cell, same scale and ground baseline at 450 pixels within each cell, creature fits inside 70px margins. Top left idle gentle stance; top right attack anticipation, body crouches and lifts shell bell; bottom left attack releasing ONE compact aqua bubble from its mouth toward right, bubble inside cell and no trails beyond cell; bottom right recoil from hit, eyes squeezed shut and shell rocked back. Exact same character identity, shell and bell in all poses. Crisp isolated silhouettes, no scenery, floor, border, checkerboard, labels, numbers, UI, or watermark. Transparent alpha outside the four creatures.

실제 결과는 1254px이며 포즈별 투명 여백이 달라 런타임 좌표로 보정했다. 전용 효과음과 나머지 미션 지역의 몬스터는 후속 작업이다.
