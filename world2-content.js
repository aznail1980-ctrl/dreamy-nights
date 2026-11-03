'use strict';
/* Second dream island. First-world map/quest IDs are never renumbered. */
(()=>{
 const C=window.DREAM_CONTENT;
 window.DREAM_WORLD2_NAMES={bongsun:"봉순",croi:"크루아",shushu:"슈슈",baguette:"바게트 영감",yeasty:"이스티",pomi:"포미"};
 const names=['몽글 선착장 · 발효뜰','다시굽는 광장','식은 오븐 골목','설탕눈 비탈길','초코 동굴','레시피 숙성실','버터 들판 · 프레첼 풍차길','다시피움 발효 저장고','빈 결선장','큰 화덕 속 · 첫 오븐 방'];
 const keys=['proofing','plaza','ovenalley','sugarslope','chococave','proofroom','buttermill','cellar','finalhall','firstoven'];
 const layouts=[
 [[650,471,460],[1420,341,550],[2250,181,620],[2940,421,500]],
 [[700,401,850],[2070,401,1050],[1450,151,700]],
 [[500,421,650],[1340,251,600],[2210,421,800],[2890,121,520]],
 [[400,91,680],[1180,251,670],[1940,401,640],[2780,511,450]],
 [[300,-299,650],[1150,-79,650],[2110,141,650],[1250,361,620],[2700,471,570]],
 [[750,401,550],[1820,401,650]],
 [[550,451,500],[1380,221,550],[2300,411,500],[3100,101,650]],
 [[450,431,600],[1260,241,600],[2130,41,600],[2970,361,600]],
 [[550,411,750],[1610,181,650],[2530,411,700]],
 [[350,421,500],[2650,421,500]]];
 const widths=[3800,3600,3800,3700,3800,3000,4400,3900,3700,3600];
 const coords=[[12,70],[42,58],[25,43],[64,40],[78,72],[51,30],[64,15],[47,82],[84,35],[42,46]];
 const roster=[['flourPuff','flourPuff','flourPuff','doughSloth'],[],['ovenDoor','sootJelly','smokeHog','coldSteam'],['smokeHog','doughSloth'],['spatulaHop','chocoRipple'],[],['cinnaTwist','whiskSpin','whipAvalanche'],['proofBubble','jarHop'],['measureCup','emptyPlate'],['underbakedGhost']];
 const defs=[
 ['flourPuff','밀가루뭉치','rush',1,220,1.15,96],['smokeHog','탄내고슴이','fan',2,0,1.3,96],['cinnaTwist','계피회오리','rush',3,250,1.25,105],['doughSloth','반죽늘보','hop',2,155,1.35,96],['whiskSpin','거품기돌이','rush',3,280,1.2,105],['coldSteam','식은김','fan',2,0,1.5,98],['ovenDoor','덜컹문짝','hop',2,180,1.25,110],['sootJelly','그을음해파리','seed',2,0,1.3,108],['spatulaHop','주걱뜀이','hop',3,190,1.25,106],['chocoRipple','굳은물결','wake',3,230,1.35,99],['proofBubble','부글거품','fan',4,0,1.5,102],['jarHop','들썩항아리','hop',4,145,1.3,110],['measureCup','눈금컵','fan',4,0,1.3,106],['emptyPlate','빈접시','double',4,0,1.4,100],['whipAvalanche','휘핑 산사태','seed',5,0,1.6,240],['underbakedGhost','설익은 빵귀신','fan',6,0,1.6,280]];
 for(const [id,name,pattern,level,speed,warning,size]of defs){
  const boss=level>=5;C.creatures['w2_'+id]={...C.creatures[boss?'boss':'sand'],name,hp:boss?(id==='underbakedGhost'?110:65):12+level*3,size,exp:boss?30:5+level};
  C.regionCreatures[id]={name,pattern,level,speed,warning,size,range:boss?540:310,duration:.65,color:'#efc081',material:'w2Flour',type:'w2_'+id,lore:'식어 가는 오븐 마을에 모인 걱정.',hint:'몸을 웅크리면 피하고, 공격이 끝나면 정화해요.'};
 }
 keys.forEach((key,i)=>{
  const index=10+i,platforms=layouts[i].map(([x,y,w])=>({x,y,w,w2:true}));
  const ladders=platforms.map(p=>({x:p.x+95,top:p.y,bottom:651}));
  const enemies=roster[i].flatMap((variant,k)=>{
   const d=C.regionCreatures[variant],n=['whipAvalanche','underbakedGhost'].includes(variant)?1:variant==='flourPuff'?1:2;
   return Array.from({length:n},(_,j)=>({id:`w2-${key}-${variant}-${k}-${j}`,variant,type:d.type,x:Math.min(widths[i]-500,850+k*620+j*290),y:651,level:d.level+3,hpScale:1,wild:false}));
  });
  C.maps.push({id:'w2-'+key,name:names[i],world:2,theme:'w2',backdrop:'w2Backdrop_'+key,width:widths[i],platforms,ladders,enemies,devices:[],decorations:[],buildings:[],sections:['발견하는 길','단서와 갈림길','돌아오는 지름길'],description:['반죽 언덕을 정화하면 폭신한 길이 열려요.','봉순의 화덕을 중심으로 탐험을 준비해요.','네 오븐에 불씨를 옮기고 두 사람의 흔적을 찾아요.','비탈을 내려가 지워진 이름을 찾아요.','겹겹의 초코 층을 내려찍으며 증인을 찾아요.','세 단서를 저울에 올리고 레시피의 주인을 알아봐요.','풍차 날개를 타고 올라 밀대로 저장고 입구를 열어요.','세 항아리를 데우고 잠든 효모를 깨워요.','포미와 두 작업대를 공명해 대기실을 열어요.','반죽·부풀기·굽기, 마지막 걱정을 함께 정화해요.'][i],region:'몽글 오븐 마을'});
  C.maps[index].musicTheme=['garden','town','alley','trail','tide','archive','observatory','waterway','archive','boss'][i];
  C.exits[index]=[];C.mapPositions[index]=coords[i];DREAM_ART_V49.files['w2Backdrop_'+key]='assets/world2/backdrop-'+key+'-w2.png';
 });
 function link(a,x,b,xx,gate=''){C.exits[a].push({x,y:651,to:b,arrivalX:xx+130,gate,hint:'현재 의뢰의 단서를 먼저 확인해요.'});C.exits[b].push({x:xx,y:651,to:a,arrivalX:x-130,gate:a===2?'':gate,hint:'현재 의뢰의 단서를 먼저 확인해요.'});}
 link(2,430,10,100,'ovenRouteReady');link(10,3650,11,100,'w2_proofingYard');
 link(11,880,12,100,'w2_coldPlaza');link(11,1850,13,100,'w2_coldOvenAlley');
 link(13,3550,14,100,'w2_sugarSnowSlope');link(14,3650,15,100,'w2_chocoCave');
 link(15,2850,11,2980,'w2_halfRecipe');link(11,3300,16,100,'w2_halfRecipe');
 link(16,4250,17,100,'w2_pretzelMill');link(17,3750,18,100,'w2_yeastCellar');
 link(18,3550,11,2540,'w2_emptyFinal');link(11,1650,19,100,'w2_preheat');
 const questRows=[
 ['mongleDepart','몽글 항로 출항',10,360,'선착장 계류 기둥을 공명으로 밝혀요.'],
 ['madeleineStow','바구니 속 밀항자',10,620,'들썩이는 도시락 바구니를 살펴봐요.'],
 ['proofingYard','부풀지 않는 발효뜰',10,1800,'밀가루뭉치 세 무리를 정화하고 반죽 길을 열어요.'],
 ['coldPlaza','불 꺼진 다시굽는 광장',11,1320,'봉순에게 큰 화덕이 식은 이유를 물어봐요.'],
 ['coldOvenAlley','식은 오븐 골목의 불씨',12,600,'불씨를 받아 네 오븐을 차례로 밝혀요.'],
 ['sugarSnowSlope','설탕눈 비탈길의 지운 간판',13,2200,'모아 공격으로 눈 더미를 걷고 슈슈를 도와요.'],
 ['chocoCave','초코 동굴의 훈수꾼',14,3100,'초코 층을 내려찍고 바게트 영감을 구해요.'],
 ['halfRecipe','반쪽 레시피',15,1550,'세 갈래 길의 기억을 살펴보고 중앙 저울에서 연결해요.'],
 ['pretzelMill','프레첼 풍차길의 휘핑 산사태',16,3300,'버터 결정 다섯 개와 풍차길의 걱정을 정화해요.'],
 ['yeastCellar','다시피움 발효 저장고',17,3050,'공명으로 세 항아리를 깨우고 회색 항아리를 조사해요.'],
 ['emptyFinal','빈 결선장',18,2150,'포미와 작업대를 공명하고 열린 대기실을 살펴봐요.'],
 ['porridgeEntry','죽 그릇 밑의 참가증',11,1320,'죽 그릇을 봉순에게 가져가요.'],
 ['preheat','큰 화덕 예열',11,2140,'버터 결정과 효모로 예열 불씨를 만들어요.'],
 ['underbakedGhost','설익은 빵귀신',19,1800,'걱정을 정화한 뒤 두 할머니와 문을 닫아요.'],
 ['twoApplications','두 장의 신청서',11,1320,'함께 구운 마들렌을 나누고 신청서를 맡겨요.']];
 const quests=questRows.map(([id,name,map,x,description],i)=>({id,flag:'w2_'+id,name,map,x,y:651,description,index:i,act:i<4?1:i<8?2:i<12?3:4}));
 quests.find(q=>q.id==='sugarSnowSlope').y=431;
 C.worldFlags.push(...quests.map(q=>q.flag),'w2_started','w2_completed');
 const items=[['w2Flour','고운 밀가루','material'],['w2Butter','버터 결정','material'],['w2Yeast','다시피움 효모','story'],['w2Recipe','달빛 마들렌 레시피','story'],['w2Entry','두 이름의 참가증','story'],['w2Ember','예열 불씨','story'],['w2Brioche','처음 구운 브리오슈','story'],['w2Madeleine','달빛 마들렌','supply'],['w2Applications','두 장의 신청서','story']];
 const itemDetails={
  w2Flour:['보송한 밀가루에 아직 부풀지 못한 꿈이 담겨 있어요.','몽글 오븐 마을의 제과 재료'],
  w2Butter:['풍차길에서 되찾은 고소한 황금빛 결정이에요.','큰 화덕 예열에 필요한 재료'],
  w2Yeast:['따뜻한 공명에 다시 깨어난 효모예요. 작은 기포가 새 출발을 알려요.','큰 화덕 예열에 필요한 이야기 물건'],
  w2Recipe:['서로 다른 세 기억을 모아 되찾은 마들렌 레시피예요.','봉순과 마들렌의 지난 이야기'],
  w2Entry:['죽 그릇 밑에 숨겨져 있던 오래된 참가증. 두 사람의 이름이 나란히 있어요.','봉순에게 전할 지난날의 단서'],
  w2Ember:['함께 지키기로 한 온기가 작은 등불 안에 살아 있어요.','큰 화덕으로 이어지는 이야기 물건'],
  w2Brioche:['조금 서툴러도 함께 구워 더 따뜻한 첫 빵이에요.','첫 오븐의 걱정을 정화한 기념'],
  w2Madeleine:['두 사람이 함께 구운 폭신한 마들렌. 나눠 먹으면 마음까지 따뜻해져요.','먹으면 마음 4 회복'],
  w2Applications:['이제는 함께 도전하기로 했어요. 같은 팀 이름으로 적은 새 신청서 두 장이에요.','몽글 오븐 마을 이야기 완료 기념']
 };
 for(const[id,name,type]of items)C.items[id]={name,type,icon:id,grade:'common',rarity:type==='story'?'이야기':'일반',lore:itemDetails[id][0],effect:itemDetails[id][1],...(type==='supply'?{heal:4}:{})};
 window.DREAM_WORLD2_CONTENT={keys,names,quests,coords,defs,jarSpots:[{x:750,y:651},{x:1800,y:431},{x:2800,y:211}],butterSpots:[{x:650,y:651},{x:1100,y:431},{x:1850,y:211},{x:2450,y:411},{x:2900,y:651}],recipeClues:[{x:650,y:431,name:'두 줄의 쟁반'},{x:2350,y:431,name:'지워진 이름'},{x:1550,y:211,name:'자신 있던 반죽'}]};
})();
