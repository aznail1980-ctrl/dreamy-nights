'use strict';
window.DREAM_EQUIPMENT = {bodySizes:{},weapons:{},hands:{ari:{},popo:{}},ids:['baton','stellarBaton','wornBaton','shoreBaton','tideBaton','auroraBaton']};
for (const [key,size] of Object.entries({heroAriSprite:[1024,1536],heroPopoSprite:[1024,1536],ariWalkV41:[1192,1319],popoWalkV41:[1536,1024],ariAttack:[1080,579],popoAttack:[921,582],ariChargeV44:[1536,1024],popoChargeV44:[1536,1024],ariDashV49:[1536,1024],popoDashV49:[1536,1024]})) {
    DREAM_EQUIPMENT.bodySizes[key]=size;
    DREAM_ART_V49.files[key]='assets/'+key+'V416.webp';
}
for(const who of ['ari','popo'])DREAM_ART_V49.files[who+'WeaponsV416']='assets/'+who+'WeaponsV416.webp';

Object.assign(DREAM_EQUIPMENT.weapons,{"ari": {"frames": [[265, 10, 169, 475], [667, 10, 202, 475], [1121, 10, 174, 504], [258, 517, 186, 491], [672, 519, 194, 489], [1080, 510, 257, 498]], "grips": [[348, 360], [768, 360], [1210, 360], [348, 872], [768, 872], [1210, 872]]}, "popo": {"frames": [[169, 32, 314, 463], [591, 25, 359, 469], [1058, 60, 308, 435], [139, 553, 375, 442], [510, 513, 516, 483], [1022, 511, 396, 485]], "grips": [[328, 360], [768, 360], [1216, 360], [328, 872], [768, 872], [1216, 872]]}});

for(const [key,size]of Object.entries({ariClimbV41:[1193,1319],popoClimbV41:[1192,1319]})){DREAM_EQUIPMENT.bodySizes[key]=size;DREAM_ART_V49.files[key]='assets/'+key+'V416.webp';}
