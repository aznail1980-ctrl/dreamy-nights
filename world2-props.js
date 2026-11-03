'use strict';
Object.assign(DREAM_W2_ROUTE_ART,{"clues": {"key": "w2Props_clues", "file": "assets/world2/props-clues.png", "frames": [[38, 49, 424, 454], [635, 52, 353, 447], [1062, 77, 437, 428], [29, 523, 450, 432], [497, 704, 651, 190], [1200, 633, 284, 280]]}, "cellar": {"key": "w2Props_cellar", "file": "assets/world2/props-cellar.png", "frames": [[52, 71, 427, 401], [554, 72, 429, 401], [1072, 72, 421, 400], [10, 560, 494, 395], [526, 560, 495, 396], [1068, 558, 451, 398]]}});
DREAM_W2_ROUTE_ART.recipe={key:'w2Props_recipe',file:'assets/world2/props-recipe-memories.png',frames:[[13,0,711,686],[733,17,715,691],[1448,23,706,681]]};
DREAM_W2_ROUTE_ART.pomi={key:'w2PomiCoop',file:'assets/world2/pomi-coop-sheet.png',frames:[[123,36,447,519],[740,26,448,535],[122,622,459,529],[729,621,450,480]]};
DREAM_W2_ROUTE_ART.backstage={key:'w2BackstageDoor',file:'assets/world2/props-backstage-door.png',frames:[[58,0,769,878],[946,2,769,876]]};
DREAM_W2_ROUTE_ART.roller={key:'w2RollerBridge',file:'assets/world2/props-roller-bridge.png',frames:[[17,272,690,175],[741,272,690,175],[1471,309,681,112]]};
for(const id of ['clues','cellar','recipe','pomi','backstage','roller']){const s=DREAM_W2_ROUTE_ART[id];DREAM_ART_V49.files[s.key]=s.file;}
// The drawing uses the same coordinates as the interactable objects.
window.DREAM_W2_PROP_VIEW=function(state,objects){
 const w=state.w2,result=[];
 const add=(o,kind,frame,width,label)=>result.push({id:o.id,x:o.x,y:o.y,kind,frame,width,label});
 for(const o of objects.filter(o=>o.map===state.map)){
  if(o.id==='cellarRest')add(o,'cellar',5,105,'마들렌의 보온 도시락 · 마음 회복');
  if(o.id==='basket')add(o,'cellar',5,100,state.flags.w2_madeleineStow?'도시락 바구니':'들썩이는 도시락 바구니 · 살펴보기');
  if(o.id==='workshop')add(o,'cellar',state.flags.w2_preheat?4:3,210,state.flags.w2_preheat?'예열 준비 완료':'봉순의 화덕 공방');
  if(o.id==='snow')add(o,'clues',w.snow?1:0,180,w.snow?'지워진 이름 · 봉순·마…':'설탕눈 · 모아 공격');
  if(o.kind==='recipeClue')add(o,'recipe',o.i,145,o.name+(w.recipeClues.includes(o.i)?' · 확인했어요':' · 살펴보기'));
  if(o.id==='scale')add(o,'clues',w.scales>=3?3:2,180,'추론 저울 · 단서 '+w.scales+'/3');
  if(o.kind==='butter'&&!w.butter.includes(o.i))add(o,'clues',5,60,'버터 결정 · 줍기');
  if(o.id==='roller')add({...o,x:3500+w.rollerProgress},'roller',Math.floor(w.rollerProgress/28)%2,270,w.roller?'반죽 다리 완성 · 살펴보기':'오른쪽으로 밀기 · '+Math.round(w.rollerProgress/5)+'%');
  if(o.kind==='jar')add(o,'cellar',w.jars[o.i]>0?1:0,140,(o.i+1)+'번 항아리 · '+(w.jars[o.i]===2?'깨어났어요':w.jars[o.i]===1?(w.jarHeat[o.i]>=2.5?'공명해 주세요!':'온기가 퍼져요'):'공명으로 데우기'));
  if(o.id==='grey')add(o,'cellar',2,145,w.grey?'아무것도 꿈꾸지 않는 항아리':'회색 항아리 · 조사');
  if(o.id==='backstage')add(o,'backstage',w.pomi?1:0,245,w.pomi?'열린 대기실 · 살펴보기':'두 별의 대기실');
  if(o.id==='tables'){add(o,'cellar',w.pomi||w.pomiCharge>0?4:3,170,'나의 작업대 · 공명');add({...o,id:'tablePartner',x:o.x+300},'cellar',w.pomi||w.pomiCharge>0?4:3,170,'포미의 작업대');}
 }
 return result;
};
