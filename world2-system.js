'use strict';
window.DREAM_WORLD2={
 initialize(s,raw){const w=raw?.w2||{};const recipeClues=Array.isArray(w.recipeClues)?[...new Set(w.recipeClues.filter(i=>Number.isInteger(i)&&i>=0&&i<3))]:Array.from({length:Math.max(0,Math.min(3,Math.floor(w.scales)||0))},(_,i)=>i);s.w2={ovens:Math.max(0,Math.min(4,Math.floor(w.ovens)||0)),cracks:Math.max(0,Math.min(3,Math.floor(w.cracks)||0)),scales:recipeClues.length,recipeClues,jars:Array.isArray(w.jars)&&w.jars.length===3?w.jars.map(x=>Math.max(0,Math.min(2,Math.floor(x)||0))):[0,0,0],butter:Array.isArray(w.butter)?[...new Set(w.butter.filter(x=>Number.isInteger(x)&&x>=0&&x<5))]:[],snow:!!w.snow,grey:!!w.grey,roller:!!w.roller,rollerProgress:w.roller?500:Math.max(0,Math.min(500,Number(w.rollerProgress)||0)),pomi:!!w.pomi,pomiCharge:w.pomi?2:Math.max(0,Math.min(2,Number(w.pomiCharge)||0)),ember:0,wrong:0,jarHeat:Array.from({length:3},(_,i)=>Math.max(0,Math.min(2.5,Number(w.jarHeat?.[i])||0)))};return s;},
 quest(s){return DREAM_WORLD2_CONTENT.quests.find(q=>!s.flags[q.flag])||null;},
 target(s){if(s.map<10){if(s.flags.ovenRouteReady&&!s.flags.w2_completed)return{map:2,x:430,y:651,label:'몽글 항로로 출항하기',kind:'story'};return null;}const route=window.DREAM_W2_ROUTES?.target(s);if(route)return route;const q=this.quest(s);if(!q)return null;
  const base={...q,label:q.description,kind:'story'},w=s.w2;
  if(s.map!==q.map)return base;
  const enemyTarget=variant=>{const e=DREAM_CONTENT.maps[s.map].enemies.find(e=>(!variant||e.variant===variant)&&!s.killed.includes(e.id));return e?{...base,x:e.x,y:e.y,kind:'enemy',label:variant==='whipAvalanche'?'휘핑 산사태 · 공격 예고를 보고 대시로 피해요':'앞길의 걱정을 정화해요'}:null;};
  if(q.id==='sugarSnowSlope')return{...base,label:w.snow?'드러난 간판을 살펴보고 슈슈와 이야기해요':'간판 앞 눈 더미에 모아 공격을 사용해요'};
  if(q.id==='halfRecipe'){const i=[0,1,2].find(i=>!w.recipeClues.includes(i));return i===undefined?{...base,label:'중앙 저울에서 세 기억을 연결해요'}:{...base,...DREAM_WORLD2_CONTENT.recipeClues[i],label:DREAM_WORLD2_CONTENT.recipeClues[i].name+' 살펴보기 · '+w.scales+' / 3'};}
  if(q.id==='pretzelMill'){
   const i=[0,1,2,3,4].find(i=>!w.butter.includes(i));
   if(i!==undefined)return{...base,...DREAM_WORLD2_CONTENT.butterSpots[i],label:'버터 결정 모으기 · '+w.butter.length+' / 5'};
   return enemyTarget('whipAvalanche')||{...base,x:3500+w.rollerProgress,y:431,label:w.roller?'밀대 곁에서 풍차의 기억을 살펴봐요':'밀대 왼쪽에서 오른쪽으로 걸어 반죽 다리 펴기'};
  }
  if(q.id==='yeastCellar'){const i=w.jars.findIndex(v=>v!==2);return i>=0?{...base,...DREAM_WORLD2_CONTENT.jarSpots[i],label:(i+1)+'번째 항아리 · '+(w.jars[i]===0?'공명으로 데우기':w.jarHeat[i]<2.5?'기포가 차오르는 중':'한 번 더 공명해 효모 깨우기')}:{...base,x:3350,label:'잠들지 않는 회색 항아리를 살펴봐요'};}
  if(q.id==='emptyFinal')return enemyTarget()||{...base,x:w.pomi?2750:2050,label:w.pomi?'열린 대기실에서 죽 그릇을 살펴봐요':'왼쪽 작업대에서 포미와 공명해요 · F'};
  if(q.id==='underbakedGhost')return enemyTarget('underbakedGhost')||{...base,label:'화덕 문 앞에서 두 할머니와 공명해요 · F'};
  return base;}
};
window.createDreamWorld2=function(api){
 const C=DREAM_CONTENT,D=DREAM_WORLD2_CONTENT,$=id=>document.getElementById(id),s=()=>api.state,p=()=>api.player;
 const scenes=[
 [['lumen','항로는 등대가 비추마. 선착장 기둥에 공명하면 돌아오는 길도 이어질 게다.'],['ari','굴뚝 연기가 가늘어지고 있어. 마을 오븐이 식어 가는 거야.']],
 [['madeleine','도시락만 넣으려다… 바구니가 너무 포근하지 뭐니.'],['ari','준비표에 내 이름은 말하지 말라고 쓰셨죠. 봉순 할머니 때문인가요?'],['madeleine','…응. 내가 제일 맛있게 먹어 본 빵을 굽던 사람이란다. 아직 그 앞엔 못 서겠구나.']],
 [['ari','반죽이 다시 부풀었어. 나란히 걸린 앞치마도 두 장이네.'],['narrator','딱딱한 언덕이 폭신한 발판이 되었습니다. 광장으로 가는 길이 열립니다.']],
 [['croi','불이 커지면 큰일 나잖아요. 다 끄는 게 제일 안전해요!'],['bongsun','대회? 됐다, 그건. 난 그냥 자신이 없었어. 빵이나 먹고 가.'],['madeleine','…여전하구나, 저 손.']],
 [['croi','끄는 게 아니라 켜는 거군요. 제가 옆에서 지켜볼게요. 조금 멀리서요.'],['ari','쟁반에 빵 자리가 두 줄이야. 혼자 굽던 오븐이 아니었어.']],
 [['shushu','봉순당 빵 없으면 아침이 안 와. 배가 그렇게 말해.'],['ari','간판에 이름이 두 개였어. 봉순·마… 뒤쪽 이름은 누가 지웠네.'],['madeleine','흠, 흠. 슈슈야, 먼저 광장으로 가서 기다리렴.']],
 [['baguette','자신이 없었다고? 그 반죽이 자신 없는 반죽이었으면 내가 성을 간다.'],['ari','자신이 있었는데 결선에 오지 않았다면, 다른 이유가 있었겠네요.'],['baguette','…밥은 먹고 다니냐. 굶으면서 수수께끼 푸는 거 아니다.']],
 [['ari','두 줄의 쟁반, 지운 이름, 자신 있던 반죽. 둘이 함께 쓰던 레시피였어.'],['madeleine','동글동글한 글씨가 내 거란다. 나머지 반쪽은 평생 앞치마에 넣고 다녔지.'],['narrator','두 장이 맞닿아 달빛 마들렌 레시피가 되었습니다. 굽는 온도만 비어 있습니다.'],['madeleine','온도는 결선 날 같이 정하자고 했거든.']],
 [['narrator','젊은 봉순과 마들렌이 풍차 아래에서 새끼손가락을 겁니다. 온도는 결선 날 정하자.'],['ari','완벽해야 한다는 걱정이 걷혔어. 밀대로 둔덕을 펴면 저장고에 들어갈 수 있겠어.']],
 [['yeasty','따뜻해요오… 다시 부풀 수 있어요. 뽀글.'],['narrator','연습 일지: 마들렌이 또 반죽을 태웠다. 그래도 둘이 먹으니 맛있다.'],['madeleine','그날 탄 건 봉순이 오븐이 이상했던 거야! …아마도.'],['yeasty','저 회색 항아리는 걱정이 아니에요오. 아무것도… 안 꿔요.']],
 [['ari','포미와 함께하니 문이 열렸어. 그런데 대회용 빵 대신 죽 그릇이 있어.'],['madeleine','…여기, 기억난다. 내가 일어나지 못했던 날이야.']],
 [['narrator','죽 그릇 밑에서 한 번도 내지 않은 참가증이 떨어집니다. 봉순과 마들렌, 두 이름이 적혀 있습니다.'],['madeleine','자신이 없었다며. 이 거짓말쟁이 할멈아.'],['bongsun','…됐다, 그건. 대회는 또 있잖아. 너는 하나뿐이고.'],['madeleine','그래서 내가 평생 남한테 밥을 먹이고 다녔구나. 그날 네 죽이 너무 따뜻해서.'],['shushu','우와아… 감동… 앗, 크림이 또 샌다!'],['bongsun','…하하. 닦고 같이 먹자.']],
 [['croi','불을 끄는 게 아니라 지키는 거죠? 그럼 저, 할 수 있어요!'],['bongsun','온도는 둘이 정하자고 했었지. …들어가 보자.'],['lumen','무사귀환이 먼저니라. …그리고 간식이다.']],
 [['bongsun','실망해도 돼. 같이 먹으면 그만이지.'],['madeleine','예쁘게 못 구워도 괜찮아. 따뜻하면 되는 거야.'],['narrator','두 할머니가 문고리를 함께 잡습니다. 공명의 빛이 닿자 땡—! 노릇한 브리오슈가 남았습니다.']],
 [['bongsun','탔네.'],['madeleine','그날 죽도 좀 눌었었어. 그래도 제일 맛있었지.'],['narrator','두 사람은 신청서를 한 장씩 씁니다. 같은 팀 이름, 우리 강아지들.'],['post','신청서 두 장, 잘 받았습니다! 봉숭아님… 아, 아니요, 봉순님!'],['narrator','현실의 봉순당. 두 사람이 신청서를 나란히 쓰고 새끼손가락을 겁니다. 실패한 빵도 누군가와 나눌 수 있습니다.']]
 ];
 scenes.forEach((lines,i)=>{const key='w2-'+D.quests[i].id;C.dialogue[key]=lines;C.remoteScenes.push(key);});
 const memories=[
  [['narrator','오븐 골목에서 보았던 쟁반의 기억이에요. 빵 자국이 나란히 두 줄 남아 있어요.'],['ari','서로의 빵을 놓을 자리를 남겨 둔 걸까?']],
  [['narrator','설탕눈 아래 드러났던 간판의 기억이에요. 봉순 옆에는 지워진 이름이 있어요.'],['ari','두 사람이 함께 걸었던 이름이었구나.']],
  [['baguette','결선 전날 반죽은 아주 좋았다. 자신이 없어서 못 온 게 아니야.'],['ari','레시피가 부족했던 게 아니라, 다른 이유가 있었겠어.']]
 ];
 memories.forEach((lines,i)=>{const key='w2-recipe-memory-'+i;C.dialogue[key]=lines;if(!C.remoteScenes.includes(key))C.remoteScenes.push(key);});
 const objects=[
 ...DREAM_WORLD2_CONTENT.recipeClues.map((q,i)=>({id:'recipeClue'+i,map:15,...q,label:q.name+' · 살펴보기',kind:'recipeClue',i})),
 {id:'anchor',map:10,x:360,y:651,label:'항로 고정 · 공명',kind:'anchor'}, {id:'basket',map:10,x:620,y:651,label:'도시락 바구니 조사',kind:'basket'},
 {id:'bongsun',map:11,x:1320,y:651,label:'봉순과 이야기',npc:'bongsun'}, {id:'workshop',map:11,x:2140,y:651,label:'화덕 공방',kind:'workshop'},
 {id:'ember',map:12,x:600,y:651,label:'불씨 등잔 받기',kind:'ember'},...Array.from({length:4},(_,i)=>({id:'oven'+i,map:12,x:1050+i*650,y:651,label:(i+1)+'번째 오븐 · 공명',kind:'oven',i})),
 {id:'snow',map:13,x:3000,y:651,label:'눈 더미 · 모아 공격',kind:'snow'}, {id:'baguette',map:14,x:3100,y:651,label:'바게트 영감 구하기',npc:'baguette'},
 {id:'scale',map:15,x:1550,y:651,label:'추론 저울',kind:'scale'},...Array.from({length:5},(_,i)=>({id:'butter'+i,map:16,x:600+i*600,y:651,label:'버터 결정 모으기',kind:'butter',i})),
 {id:'roller',map:16,x:3650,y:651,label:'큰 밀대 밀기',kind:'roller'},...Array.from({length:3},(_,i)=>({id:'jar'+i,map:17,x:750+i*750,y:651,label:(i+1)+'번째 항아리 · 공명으로 데우기',kind:'jar',i})),
 {id:'cellarRest',map:17,x:300,y:651,label:'마들렌의 보온 도시락 · 쉬어가기',kind:'rest'},
 {id:'grey',map:17,x:3350,y:651,label:'회색 항아리 조사',kind:'grey'}, {id:'backstage',map:18,x:2750,y:651,label:'대기실 · 살펴보기',kind:'backstage'}, {id:'tables',map:18,x:2050,y:651,label:'포미와 두 작업대 · 공명',kind:'tables'},
 {id:'ovenClose',map:19,x:1800,y:651,label:'함께 오븐 문 닫기 · 공명',kind:'ovenClose'}];
 window.DREAM_W2_ROUTES?.bindObjects(objects);
 window.DREAM_W2_OBJECTS=objects;
 const near=o=>o.map===s().map&&Math.abs(o.x-p().x)<(o.id==='roller'?240:125)&&Math.abs(o.y-p().y)<85;
 function syncRoller(){if(!s()?.w2)return;const o=objects.find(o=>o.id==='roller');o.x=3500+s().w2.rollerProgress;}
 syncRoller();
 function nearest(){syncRoller();return objects.filter(o=>!(o.kind==='butter'&&s().w2.butter.includes(o.i))&&!(o.id==='anchor'&&s().flags.w2_mongleDepart)&&!(o.id==='basket'&&s().flags.w2_madeleineStow)&&near(o)).sort((a,b)=>Math.abs(a.x-p().x)-Math.abs(b.x-p().x)).map(o=>({type:'w2',object:o,label:o.id==='snow'&&s().w2.snow?'드러난 간판 · 슈슈와 이야기':o.id==='roller'?(s().w2.roller?'완성된 반죽 다리 · 기억 살펴보기':'밀대 왼쪽에서 오른쪽으로 걷기'):o.id==='tables'&&s().w2.pomi?'문이 열렸어요 · 오른쪽 대기실로':o.kind==='jar'?(o.i+1)+'번째 항아리 · '+(s().w2.jars[o.i]===2?'효모가 깨어났어요':s().w2.jars[o.i]===0?'공명으로 데우기':s().w2.jarHeat[o.i]<2.5?'온기가 퍼지는 중':'한 번 더 공명하기'):o.label}))[0]||null;}
 let pomiCharging=false;
 let finishing=null;
 function finish(id){const q=D.quests.find(q=>q.id===id);if(!q||finishing||s().flags[q.flag]||!current(id))return;const owner=s();finishing=id;api.dialogue('w2-'+id,()=>{finishing=null;if(s()!==owner||s().flags[q.flag]||!current(id))return;s().flags[q.flag]=true;s().light+=35;s().xp+=12;const rewards={halfRecipe:['w2Recipe',1],yeastCellar:['w2Yeast',1],porridgeEntry:['w2Entry',1],preheat:['w2Ember',1],underbakedGhost:['w2Brioche',1],twoApplications:['w2Applications',1]};if(rewards[id])api.add(...rewards[id]);if(id==='twoApplications'){s().flags.w2_completed=true;api.add('w2Madeleine',3);}api.save();api.refresh();});}
 function current(id){return DREAM_WORLD2.quest(s())?.id===id;}
 function gone(variant,map=s().map){return C.maps[map].enemies.filter(e=>!variant||e.variant===variant).every(e=>s().killed.includes(e.id));}
 function notice(t){api.toast(t,3);return true;}
 function interact(o,resonance=false){
  if(!o)return false;const w=s().w2;
  if(o.id==='anchor'){if(current('mongleDepart')){if(!resonance)return notice('공명 버튼 또는 F로 항로를 밝혀요.');s().flags.w2_started=true;finish('mongleDepart');}else notice('등대로 돌아가는 항로가 이어져 있어요.');}
  else if(o.id==='basket'){if(current('madeleineStow'))finish('madeleineStow');else notice('마들렌의 도시락 바구니예요.');}
  else if(o.id==='bongsun'){if(current('coldPlaza')||current('porridgeEntry')||current('twoApplications'))finish(DREAM_WORLD2.quest(s()).id);else {s().hp=api.maxHP();api.save();notice('봉순이 따뜻한 간식을 건넸어요. 마음을 회복했어요.');}}
  else if(o.id==='ember'){if(!current('coldOvenAlley'))return notice('네 오븐은 다시 따뜻해졌어요.');w.ember=window.DREAM_W2_ROUTES?.emberDuration||22;notice('불씨를 받았어요. 다음 오븐 앞에서 공명하세요. 가까운 오븐에서 불씨를 다시 받을 수도 있어요.');}
  else if(o.kind==='oven'){
   if(!current('coldOvenAlley'))return notice('따뜻한 오븐이에요.');if(o.i<w.ovens){w.ember=window.DREAM_W2_ROUTES?.emberDuration||22;return notice('켜진 오븐에서 불씨를 다시 받았어요.');}
   if(o.i!==w.ovens)return notice('왼쪽부터 오븐을 차례로 밝혀요.');if(!resonance)return notice('공명 버튼 또는 F로 불씨를 옮겨요.');if(w.ember<=0)return notice('불씨가 식었어요. 앞의 오븐이나 등잔에서 다시 받아요.');
   w.ovens++;w.ember=window.DREAM_W2_ROUTES?.emberDuration||22;window.DREAM_W2_ROUTES?.sync(s());api.save();if(w.ovens===4)finish('coldOvenAlley');else notice('오븐이 켜졌어요! 불씨도 다시 따뜻해졌어요.');
  }
  else if(o.id==='snow'){if(current('sugarSnowSlope')&&w.snow)finish('sugarSnowSlope');else notice('정화 버튼을 길게 눌렀다 놓아 눈 더미를 걷어요.');}
  else if(o.id==='baguette'){if(current('chocoCave')&&w.cracks>=3)finish('chocoCave');else notice('빛나는 금이 간 초코 층 세 곳을 내려찍어 주세요.');}
  else if(o.kind==='recipeClue'){
   if(!current('halfRecipe'))return notice('두 사람의 레시피에 남은 기억이에요.');
   const owner=s();api.dialogue('w2-recipe-memory-'+o.i,()=>{if(s()!==owner)return;if(!w.recipeClues.includes(o.i)){w.recipeClues.push(o.i);w.scales=w.recipeClues.length;window.DREAM_W2_ROUTES?.sync(s());api.save();api.refresh();}notice(w.scales===3?'세 기억이 모였어요. 중앙 저울에서 연결해요.':'기억을 찾았어요. '+w.scales+' / 3');});
  }
  else if(o.id==='scale'){
   if(!current('halfRecipe'))return notice('온도만 비어 있는 두 사람의 레시피예요.');
   if(w.scales<3)return notice('세 갈래 길에서 기억을 살펴봐요. 찾은 기억 '+w.scales+' / 3');
   finish('halfRecipe');
  }
  else if(o.kind==='butter'){if(!w.butter.includes(o.i)){w.butter.push(o.i);api.add('w2Butter',1);api.save();notice('버터 결정 '+w.butter.length+' / 5');}else notice('이곳의 결정은 이미 모았어요.');}
  else if(o.id==='roller'){
   if(!current('pretzelMill'))return notice('반죽 다리가 저장고까지 이어져 있어요.');
   if(w.butter.length<5||!gone('whipAvalanche'))return notice('버터 결정 다섯 개를 모으고 휘핑 산사태를 정화해요.');
   if(w.roller){finish('pretzelMill');return true;}
   notice('밀대 왼쪽에서 오른쪽으로 걸으면 반죽이 펴져요. 중간에 쉬어도 괜찮아요.');
  }
  else if(o.kind==='jar'){
   if(w.jars[o.i]===2)return notice('효모가 깨어났어요. 다음 항아리를 찾아요.');
   if(!current('yeastCellar'))return notice('아직 잠든 효모예요. 레시피의 단서를 먼저 찾아요.');
   if(!resonance)return notice('공명 버튼 또는 F로 데우기 → 기포가 차오르면 다시 공명해요.');
   if(w.jars[o.i]===0){w.jars[o.i]=1;w.jarHeat[o.i]=0;api.save();return notice('온기가 퍼져요. 기포가 가득 차면 다시 공명해요.');}
   if(w.jarHeat[o.i]<2.5)return notice('조금만 기다려요. 기포가 천천히 차오르고 있어요.');
   w.jars[o.i]=2;api.save();notice('뽀글! 효모가 깨어났어요. '+w.jars.filter(v=>v===2).length+' / 3');
  }
  else if(o.id==='cellarRest'){
   const unsafe=(api.enemies||C.maps[s().map].enemies).some(e=>!e.dead&&!s().killed.includes(e.id)&&Math.abs(e.x-p().x)<500&&Math.abs((e.y??651)-p().y)<120);
   if(unsafe)return notice('가까운 걱정에서 벗어난 뒤 쉬어가요.');
   s().hp=api.maxHP();api.save();api.refresh();notice('마들렌의 따뜻한 도시락 · 마음을 모두 회복했어요.');
  }
  else if(o.id==='grey'){if(current('yeastCellar')&&w.jars.every(x=>x===2)){w.grey=true;finish('yeastCellar');}else notice('아무것도 꿈꾸지 않는 항아리… 먼저 세 항아리를 포근하게 데워요.');}
  else if(o.id==='tables'){
   if(!current('emptyFinal'))return notice('두 사람이 함께 쓰던 작업대예요.');
   if(w.pomi)return notice('문이 열렸어요. 오른쪽 대기실의 죽 그릇을 살펴봐요.');
   if(!gone(null))return notice('작업대 주변 걱정을 먼저 정화해요.');
   if(!resonance)return notice('포미가 오른쪽을 맡았어요. 왼쪽 작업대에서 공명 버튼 또는 F를 눌러요.');
   pomiCharging=true;api.save();notice('포미와 빛을 모아요. 잠시 작업대 곁에 있어 주세요.');
  }
  else if(o.id==='backstage'){
   if(!w.pomi)return notice('두 작업대가 함께 빛나면 문이 열릴 것 같아요.');
   if(current('emptyFinal'))finish('emptyFinal');else notice('따뜻한 죽 그릇이 남아 있어요. 봉순과 마들렌의 기억이에요.');
  }
  else if(o.id==='workshop'){if(current('preheat')){if(api.own('w2Butter')<5||!api.own('w2Yeast'))return notice('버터 결정 다섯 개와 다시피움 효모가 필요해요.');finish('preheat');}else notice('레시피와 재료를 모으면 화덕을 예열할 수 있어요.');}
  else if(o.id==='ovenClose'){if(current('underbakedGhost')&&gone('underbakedGhost')){if(!resonance)return notice('공명 버튼 또는 F로 두 할머니와 문을 닫아요.');finish('underbakedGhost');}else notice('먼저 화덕 속 걱정을 정화해요. 공격 예고를 보고 피하세요.');}
  return true;
 }
 function resonance(){const n=nearest();return n&&['anchor','oven','jar','tables','ovenClose'].includes(n.object.kind)?interact(n.object,true):false;}
 function strike(kind){if(s().map<10)return;const w=s().w2;if(kind==='charged'&&!w.snow&&current('sugarSnowSlope')&&near(objects.find(o=>o.id==='snow'))){w.snow=true;api.save();window.DREAM_W2_ROUTES?.sync(s());notice('이름이 드러났어요! 간판을 살펴봐요. 위쪽 귀환길도 열렸어요.');}if(kind==='plunge'&&window.DREAM_W2_ROUTES?.breakSeal(s(),p())){api.save();notice('초코 층이 열렸어요. 아래로 내려가세요. '+w.cracks+' / 3');}}
 let pending=false;
 function tick(dt){if(s().map<10||api.mode!=='play')return;if(s().w2.ember>0)s().w2.ember=Math.max(0,s().w2.ember-dt);
  syncRoller();
  if(s().map===16&&current('pretzelMill')&&!s().w2.roller&&s().w2.butter.length===5&&gone('whipAvalanche')){
   const o=objects.find(o=>o.id==='roller'),hero=p(),distance=o.x-hero.x;
   if(hero.grounded&&Math.abs(hero.y-o.y)<8&&distance>=120&&distance<=210&&hero.vx>20){
    s().w2.rollerProgress=Math.min(500,s().w2.rollerProgress+Math.min(hero.vx,150)*Math.max(0,dt));syncRoller();hero.x=Math.min(hero.x,o.x-170);
    if(s().w2.rollerProgress>=500){s().w2.roller=true;api.save();notice('반죽 다리가 펼쳐졌어요! 밀대를 살펴보고 풍차의 기억을 이어봐요.');}
   }
  }
  if(s().map!==18)pomiCharging=false;
  if(s().map===18&&pomiCharging&&!s().w2.pomi&&current('emptyFinal')&&gone(null)){
   const table=objects.find(o=>o.id==='tables');
   if(near(table)){
    s().w2.pomiCharge=Math.min(2,s().w2.pomiCharge+Math.max(0,dt));
    if(s().w2.pomiCharge>=2){s().w2.pomi=true;pomiCharging=false;api.save();api.refresh();notice('두 별이 이어졌어요! 열린 대기실을 살펴봐요.');}
   }
  }
  if(s().map===17)for(let i=0;i<3;i++)if(s().w2.jars[i]===1)s().w2.jarHeat[i]=Math.min(2.5,s().w2.jarHeat[i]+Math.max(0,dt));
  if(current('proofingYard')&&gone('flourPuff',10)&&!pending){pending=true;finish('proofingYard');pending=false;}
  if(current('coldOvenAlley')&&s().w2.ovens>=4)finish('coldOvenAlley');
  window.DREAM_W2_ROUTES?.sync(s());
 }
 function hud(){if(s().map<10)return;if(s().flags.w2_completed&&!window.DREAM_W2_PREVIEW){$('questTitle').textContent='몽글 오븐 마을의 이야기를 마쳤어요!';$('questStep').textContent='15 / 15';$('questCard').querySelector('.eyebrow').firstChild.textContent='몽글 오븐 마을 · ';$('questDetail').textContent='함께 구운 기억을 간직하며 열린 길을 둘러보세요.';$('questCount').textContent='두 번째 밤 완료';$('questFill').style.width='100%';return;}if(window.DREAM_W2_PREVIEW?.completed(s())){$('questTitle').textContent=window.DREAM_W2_PREVIEW.journey?'몽글 오븐 마을의 이야기를 마쳤어요!':'이 지역의 길을 열었어요!';$('questStep').textContent=window.DREAM_W2_PREVIEW.journey?'15 / 15':'체험 완료';$('questCard').querySelector('.eyebrow').firstChild.textContent='몽글 오븐 마을 · ';$('questDetail').textContent=window.DREAM_W2_PREVIEW.journey?'함께 구운 기억을 간직하며 마을을 자유롭게 둘러보세요.':s().map===13?'아래쪽 길 끝 포털에서 초코 동굴로 이어가세요.':s().map===14?'동굴 아래 오른쪽 포털에서 레시피 숙성실로 이어가세요.':s().map===16?'반죽 다리 끝 포털에서 발효 저장고로 이어가세요.':s().map===17?'오른쪽 포털에서 빈 결선장으로 이어가세요.':'열린 길을 더 탐험하거나 아래 지역 체험 메뉴에서 다른 지역을 골라보세요.';$('questCount').textContent=window.DREAM_W2_PREVIEW.journey?'두 번째 밤 완료':'지역 체험 완료';$('questFill').style.width='100%';return;}const q=DREAM_WORLD2.quest(s());$('questTitle').textContent=q?.name||'다시 굽는 밤 · 순찰 완료';$('questDetail').textContent=DREAM_WORLD2.target(s())?.label||q?.description||'몽글 오븐 마을의 남은 기억을 찾아보세요.';$('questStep').textContent=(q?q.index+1:15)+' / 15';$('questCount').textContent='두 번째 밤';$('questCard').querySelector('.eyebrow').firstChild.textContent='몽글 오븐 마을 · ';$('questFill').style.width=((q?q.index:15)/15*100)+'%';if(s().w2.ember>0)$('questCount').textContent='불씨 '+Math.ceil(s().w2.ember)+'초 · 오븐 '+s().w2.ovens+'/4';}
 return{objects,nearest,interact,resonance,strike,tick,hud,finish,gone,sync:()=>window.DREAM_W2_ROUTES?.sync(s())};
};
