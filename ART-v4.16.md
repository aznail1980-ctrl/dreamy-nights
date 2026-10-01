# 착용 원화와 무기 교체 · v4.16.0

제작일: 2026-10-01. 제작 방식: 내장 imagegen 도구(기본 모드), 투명 배경 보존. 외부 API/CLI 사용 없음.

## 저장 자산

본체는 기존 원화에서 무기만 제거하도록 편집했다. 원본 파일은 보존하고 V416 접미사 PNG로 저장했다. 새 무기 2장에는 아리 지팡이 6종과 포포 망치 6종을 각각 담았다. 게임은 원화 좌표에 맞춘 손잡이·목·머리 위치와 앞뒤 가림을 사용해 장착 상태를 합성한다.

| 키 | 저장 파일 | 내용 |
|---|---|---|
| heroAriSprite | [assets/heroAriSpriteV416.png](assets/heroAriSpriteV416.png) | 무기 없는 동작 본체 |
| heroPopoSprite | [assets/heroPopoSpriteV416.png](assets/heroPopoSpriteV416.png) | 무기 없는 동작 본체 |
| ariWalkV41 | [assets/ariWalkV41V416.png](assets/ariWalkV41V416.png) | 무기 없는 동작 본체 |
| popoWalkV41 | [assets/popoWalkV41V416.png](assets/popoWalkV41V416.png) | 무기 없는 동작 본체 |
| ariAttack | [assets/ariAttackV416.png](assets/ariAttackV416.png) | 무기 없는 동작 본체 |
| popoAttack | [assets/popoAttackV416.png](assets/popoAttackV416.png) | 무기 없는 동작 본체 |
| ariChargeV44 | [assets/ariChargeV44V416.png](assets/ariChargeV44V416.png) | 무기 없는 동작 본체 |
| popoChargeV44 | [assets/popoChargeV44V416.png](assets/popoChargeV44V416.png) | 무기 없는 동작 본체 |
| ariDashV49 | [assets/ariDashV49V416.png](assets/ariDashV49V416.png) | 무기 없는 동작 본체 |
| popoDashV49 | [assets/popoDashV49V416.png](assets/popoDashV49V416.png) | 무기 없는 동작 본체 |
| ariWeapons | [assets/ariWeaponsV416.png](assets/ariWeaponsV416.png) | 6종 무기 아틀라스 |
| popoWeapons | [assets/popoWeaponsV416.png](assets/popoWeaponsV416.png) | 6종 무기 아틀라스 |
| ariClimbV41 | [assets/ariClimbV41V416.png](assets/ariClimbV41V416.png) | 무기 없는 동작 본체 |
| popoClimbV41 | [assets/popoClimbV41V416.png](assets/popoClimbV41V416.png) | 무기 없는 동작 본체 |

## 최종 프롬프트

### heroAriSprite

Use case: precise-object-edit. Production game sprite edit. Remove ONLY every handheld weapon (star baton or hammer) from this existing character image or sprite sheet. Reconstruct the small empty closed gripping hands naturally. Preserve EXACTLY the same character identity, face, hairstyle, clothing, cape, bags, every body pose, silhouette, location, orientation, pixel-art-like clean anime linework, scale, canvas proportions, sprite grid and transparent padding. Do not move, resize or recenter any character or cell. The character must be empty-handed so a separate weapon can be attached at runtime. Do not remove bags or costume ornaments. Do not add anything. Keep alpha transparency outside the characters. Output the full original canvas, no cropping, no background, no borders, no text.

### heroPopoSprite

Use case: precise-object-edit. Production game sprite edit. Remove ONLY every handheld weapon (star baton or hammer) from this existing character image or sprite sheet. Reconstruct the small empty closed gripping hands naturally. Preserve EXACTLY the same character identity, face, hairstyle, clothing, cape, bags, every body pose, silhouette, location, orientation, pixel-art-like clean anime linework, scale, canvas proportions, sprite grid and transparent padding. Do not move, resize or recenter any character or cell. The character must be empty-handed so a separate weapon can be attached at runtime. Do not remove bags or costume ornaments. Do not add anything. Keep alpha transparency outside the characters. Output the full original canvas, no cropping, no background, no borders, no text.

### ariWalkV41

Use case: precise-object-edit. Production game sprite edit. Remove ONLY every handheld weapon (star baton or hammer) from this existing character image or sprite sheet. Reconstruct the small empty closed gripping hands naturally. Preserve EXACTLY the same character identity, face, hairstyle, clothing, cape, bags, every body pose, silhouette, location, orientation, pixel-art-like clean anime linework, scale, canvas proportions, sprite grid and transparent padding. Do not move, resize or recenter any character or cell. The character must be empty-handed so a separate weapon can be attached at runtime. Do not remove bags or costume ornaments. Do not add anything. Keep alpha transparency outside the characters. Output the full original canvas, no cropping, no background, no borders, no text.

### popoWalkV41

Use case: precise-object-edit. Production game sprite edit. Remove ONLY every handheld weapon (star baton or hammer) from this existing character image or sprite sheet. Reconstruct the small empty closed gripping hands naturally. Preserve EXACTLY the same character identity, face, hairstyle, clothing, cape, bags, every body pose, silhouette, location, orientation, pixel-art-like clean anime linework, scale, canvas proportions, sprite grid and transparent padding. Do not move, resize or recenter any character or cell. The character must be empty-handed so a separate weapon can be attached at runtime. Do not remove bags or costume ornaments. Do not add anything. Keep alpha transparency outside the characters. Output the full original canvas, no cropping, no background, no borders, no text.

### ariAttack

Use case: precise-object-edit. Edit this existing production game sprite image: remove ONLY all handheld star batons or hammers, and remove weapon-only glowing slash arcs or impact flashes. Keep the character's arms and small closed gripping hands, reconstructing any hand hidden by the weapon. The purpose is to attach a different weapon at the exact same hand location in game. Preserve EXACTLY all original full body poses, facial expressions, hairstyle, outfit, cape and bags, every character's position and size, the original canvas proportions and grid of cells. No pose changes. No character redesign. Keep original crisp cute 2D anime linework and colors, no painterly restyling. Do not recenter, crop, or rescale any cell. Retain transparent background. Return whole original canvas with all original cells, empty hands, no weapons, no extra objects or text.

### popoAttack

Use case: precise-object-edit. Edit this existing production game sprite image: remove ONLY all handheld star batons or hammers, and remove weapon-only glowing slash arcs or impact flashes. Keep the character's arms and small closed gripping hands, reconstructing any hand hidden by the weapon. The purpose is to attach a different weapon at the exact same hand location in game. Preserve EXACTLY all original full body poses, facial expressions, hairstyle, outfit, cape and bags, every character's position and size, the original canvas proportions and grid of cells. No pose changes. No character redesign. Keep original crisp cute 2D anime linework and colors, no painterly restyling. Do not recenter, crop, or rescale any cell. Retain transparent background. Return whole original canvas with all original cells, empty hands, no weapons, no extra objects or text.

### ariChargeV44

Use case: precise-object-edit. Edit this existing production game sprite image: remove ONLY all handheld star batons or hammers, and remove weapon-only glowing slash arcs or impact flashes. Keep the character's arms and small closed gripping hands, reconstructing any hand hidden by the weapon. The purpose is to attach a different weapon at the exact same hand location in game. Preserve EXACTLY all original full body poses, facial expressions, hairstyle, outfit, cape and bags, every character's position and size, the original canvas proportions and grid of cells. No pose changes. No character redesign. Keep original crisp cute 2D anime linework and colors, no painterly restyling. Do not recenter, crop, or rescale any cell. Retain transparent background. Return whole original canvas with all original cells, empty hands, no weapons, no extra objects or text.

### popoChargeV44

Use case: precise-object-edit. Edit this existing production game sprite image: remove ONLY all handheld star batons or hammers, and remove weapon-only glowing slash arcs or impact flashes. Keep the character's arms and small closed gripping hands, reconstructing any hand hidden by the weapon. The purpose is to attach a different weapon at the exact same hand location in game. Preserve EXACTLY all original full body poses, facial expressions, hairstyle, outfit, cape and bags, every character's position and size, the original canvas proportions and grid of cells. No pose changes. No character redesign. Keep original crisp cute 2D anime linework and colors, no painterly restyling. Do not recenter, crop, or rescale any cell. Retain transparent background. Return whole original canvas with all original cells, empty hands, no weapons, no extra objects or text.

### ariDashV49

Use case: precise-object-edit. Edit this existing production game sprite image: remove ONLY all handheld star batons or hammers, and remove weapon-only glowing slash arcs or impact flashes. Keep the character's arms and small closed gripping hands, reconstructing any hand hidden by the weapon. The purpose is to attach a different weapon at the exact same hand location in game. Preserve EXACTLY all original full body poses, facial expressions, hairstyle, outfit, cape and bags, every character's position and size, the original canvas proportions and grid of cells. No pose changes. No character redesign. Keep original crisp cute 2D anime linework and colors, no painterly restyling. Do not recenter, crop, or rescale any cell. Retain transparent background. Return whole original canvas with all original cells, empty hands, no weapons, no extra objects or text.

### popoDashV49

Use case: precise-object-edit. Edit this existing production game sprite image: remove ONLY all handheld star batons or hammers, and remove weapon-only glowing slash arcs or impact flashes. Keep the character's arms and small closed gripping hands, reconstructing any hand hidden by the weapon. The purpose is to attach a different weapon at the exact same hand location in game. Preserve EXACTLY all original full body poses, facial expressions, hairstyle, outfit, cape and bags, every character's position and size, the original canvas proportions and grid of cells. No pose changes. No character redesign. Keep original crisp cute 2D anime linework and colors, no painterly restyling. Do not recenter, crop, or rescale any cell. Retain transparent background. Return whole original canvas with all original cells, empty hands, no weapons, no extra objects or text.

### ariWeapons

Use case: stylized-concept. One production 3 columns by 2 rows weapon sprite atlas for cozy Korean anime RPG Our Dreamy Nights. Six different star-tipped magic batons for Ari. Each weapon completely isolated on genuine alpha transparent background, centered in its own equal cell with 18 percent margin, upright with head at TOP and handle pointing straight DOWN. Flat side-view usable by a chibi hero, no perspective foreshortening, consistent scale and identical grip location near the bottom end of the handle. Read left to right, top to bottom: small classic gold star on cream wooden handle; refined luminous white-gold star with a gold collar; worn chipped wooden star on old wood; turquoise seashell star with rope wrapped handle; pearly crescent-and-star with pale blue jewel; ornate violet and gold dawn star with tiny aurora ribbons. Crisp warm brown anime outlines, soft clean shading, creamy gold mint and muted coral accents. Avoid excessive detail; readable at 40 pixels. Full weapons only, no hands, no characters, no floor, no UI frame, no grid, no text, no label, no watermark. All six handles must end on the same baseline in their cells.

### popoWeapons

Use case: stylized-concept. One production 3 columns by 2 rows weapon sprite atlas for cozy Korean anime RPG Our Dreamy Nights. Six different short two-headed dream hammers for Popo. Each weapon completely isolated on genuine alpha transparent background, centered in its own equal cell with 18 percent margin, upright with head at TOP and handle pointing straight DOWN. Flat side-view usable by a chibi hero, no perspective foreshortening, consistent scale and identical grip location near the bottom end of the handle. Read left to right, top to bottom: classic small warm brown wooden mallet with brass star on head; refined cream-and-gold mallet with glowing star emblem; worn chipped wooden mallet bound with cloth; turquoise and driftwood shell mallet; pearl and silver moon mallet with blue jewel; ornate violet and gold dawn mallet with star emblem. Crisp warm brown anime outlines, soft clean shading, creamy gold mint and muted coral accents. Avoid excessive detail; readable at 40 pixels. Full weapons only, no hands, no characters, no floor, no UI frame, no grid, no text, no label, no watermark. All six handles must end on the same baseline in their cells.

### ariClimbV41

Use case: precise-object-edit. Edit target: attached existing ari climbing sprite atlas. Remove ONLY the small weapon strapped at the waist/back (star wand) from ALL six frames, restoring underlying clothing/bag. Keep both hands, limbs, cape, bag, hairstyle, face, silhouette, original six pose positions, sizes, exact 3 columns by 2 rows layout and transparent canvas unchanged. Do not redraw the character, move sprites, add anything, or change poses. Preserve transparent background and exact framing. Weapon-free body atlas for runtime interchangeable weapons.

### popoClimbV41

Use case: precise-object-edit. Edit target: attached existing popo climbing sprite atlas. Remove ONLY the small weapon strapped at the waist/back (wooden hammer) from ALL six frames, restoring underlying clothing/bag. Keep both hands, limbs, cape, bag, hairstyle, face, silhouette, original six pose positions, sizes, exact 3 columns by 2 rows layout and transparent canvas unchanged. Do not redraw the character, move sprites, add anything, or change poses. Preserve transparent background and exact framing. Weapon-free body atlas for runtime interchangeable weapons.

## 적용과 확인

- `equipment-art.js`: 파일·크기·무기 윤곽·손잡이 좌표.
- `equipment-content.js`: 동작별 부착점, 장비 ID와 외형 매핑.
- `equipment-renderer.js`: 장착 무기와 필드 드롭/가방 아이콘.
- `equipment-ui.js`, `equipment.css`: 캐릭터 상세 및 능력 비교.
- Canvas 이미지 로드 후 크기가 달라진 원화만 원본 좌표 크기로 정규화한다. PNG 알파를 그대로 사용한다.
- 본체에 이미 그려져 있던 무기를 제거한 뒤 교체 무기를 표시하며, 손의 원화를 손잡이 위에 다시 그려 자연스럽게 쥐게 한다.
- 사다리에서는 빈손으로 오르고 선택 무기는 등에 표시한다.
- 기존 꾸미기 일러스트는 유지하며 부착점을 개선했다. 모든 의상 조합의 별도 완성 원화를 새로 제작한 것은 아니다.

## 배포용 압축

PNG 원화를 보존하고 동일 이름의 WebP를 무손실 인코딩하여 런타임에 사용한다. 원화의 색·크기·투명도를 변경하지 않는 파일 형식 변환이며 이미지 내용의 재편집이 아니다.
