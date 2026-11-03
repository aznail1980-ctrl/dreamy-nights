'use strict';
/* Route rules are deterministic; all persistent changes derive from existing save state. */
(()=>{
 const C=DREAM_CONTENT;
 const pads=[{x:1000,y:651,w:320},{x:1770,y:431,w:320},{x:2500,y:211,w:320}];
 const ovens=[{x:900,y:651},{x:1600,y:411},{x:2300,y:191},{x:800,y:191}];
 const seals=[{x:1000,y:-99,w:280},{x:1700,y:151,w:280},{x:1100,y:401,w:280}];
 const recipeClues=DREAM_WORLD2_CONTENT.recipeClues;
 const bases={
  13:[{x:100,y:91,w:700},{x:850,y:251,w:750},{x:1650,y:431,w:800}],
  17:[{x:1250,y:431,w:1350},{x:2400,y:211,w:1100}],
  16:[{x:900,y:431,w:340},{x:1770,y:211,w:390},{x:2150,y:311,w:220},{x:2350,y:411,w:220},{x:2550,y:311,w:220},{x:2750,y:211,w:220},{x:2950,y:321,w:220},{x:2150,y:541,w:220},{x:2550,y:541,w:220},{x:2850,y:531,w:260},{x:3150,y:431,w:550},{x:4000,y:431,w:370}],
  18:[{x:350,y:431,w:650},{x:1150,y:311,w:600}],
  15:[{x:400,y:431,w:700},{x:2000,y:431,w:700},{x:1300,y:211,w:500}],
  10:[{x:1350,y:431,w:750},{x:2200,y:211,w:800},{x:2900,y:91,w:350}],
  12:[{x:1250,y:411,w:650},{x:2050,y:191,w:650},{x:550,y:191,w:550}],
  14:[{x:300,y:-249,w:500},...seals.flatMap(p=>[{x:0,y:p.y,w:p.x-p.w/2},{x:p.x+p.w/2,y:p.y,w:2600-p.x-p.w/2}])]
 };
 C.maps[13].routeType='sugarDescent';C.maps[13].sections=['설탕눈 언덕 입구','내려가는 세 단의 길','지워진 간판과 귀환길'];
 C.maps[13].enemies.forEach((e,i)=>Object.assign(e,{x:[600,1300,1850,2850][i%4],y:[91,251,431,651][i%4]}));
 Object.assign(C.exits[11].find(e=>e.to===13),{arrivalX:230,arrivalY:91});Object.assign(C.exits[13].find(e=>e.to===11),{x:160,y:91});
 C.maps[17].routeType='cellarLoop';C.maps[17].sections=['온기를 준비하는 저장실','위층의 잠든 효모','회색 항아리로 내려오는 길'];
 C.maps[17].enemies.forEach((e,i)=>Object.assign(e,{x:[1050,2050,3100,3100][i%4],y:[651,431,211,651][i%4]}));
 C.maps[16].routeType='rollerBridge';C.maps[16].sections=['천천히 도는 풍차','두 고리가 만나는 프레첼 길','반죽을 펴는 다리'];
 C.maps[16].enemies.forEach((e,i)=>Object.assign(e,e.variant==='whipAvalanche'?{x:3050,y:651}:{x:[800,1100,2000,2550][i%4],y:651}));
 Object.assign(C.exits[16].find(e=>e.to===17),{x:4250,y:431});Object.assign(C.exits[17].find(e=>e.to===16),{arrivalX:4180,arrivalY:431});
 C.maps[18].routeType='backstage';C.maps[18].sections=['빈 관람석','두 사람의 작업대','잊힌 대기실'];
 C.maps[18].enemies.forEach((e,i)=>Object.assign(e,{x:[650,1400,1050,1700][i%4],y:[431,311,651,651][i%4]}));
 C.maps[15].routeType='memoryBranches';C.maps[15].sections=['쟁반의 기억','지워진 이름의 기억','증언을 연결하는 저울'];
 C.maps[15].enemies=C.maps[15].enemies.filter((e,i)=>i<2);C.maps[15].enemies.forEach((e,i)=>Object.assign(e,{x:i?2700:450,y:651}));
 C.maps[10].width=3300;C.maps[12].width=3000;C.maps[14].width=2600;
 C.maps[10].routeType='rise';C.maps[12].routeType='relay';C.maps[14].routeType='descent';
 C.maps[10].sections=['안전한 발효뜰','정화하면 부푸는 길','상층 귀환길'];
 C.maps[12].sections=['불씨를 받는 골목','오븐을 잇는 순환길','다시 열린 귀환길'];
 C.maps[14].sections=['동굴 입구','세 겹의 초코 층','구조와 귀환'];
 const flour=C.maps[10].enemies.filter(e=>e.variant==='flourPuff');flour.forEach((e,i)=>Object.assign(e,{x:pads[i].x,y:pads[i].y}));
 C.maps[10].enemies=C.maps[10].enemies.filter(e=>e.variant==='flourPuff'||e.id===C.maps[10].enemies.find(v=>v.variant!=='flourPuff')?.id);
 C.maps[10].enemies.filter(e=>e.variant!=='flourPuff').forEach(e=>Object.assign(e,{x:3100,y:651}));
 C.maps[12].enemies=C.maps[12].enemies.filter((e,i,a)=>a.findIndex(v=>v.variant===e.variant)===i);
 C.maps[12].enemies.forEach((e,i)=>Object.assign(e,{x:[2450,1800,2600,2750][i],y:[651,651,191,651][i]}));
 C.maps[14].enemies.forEach((e,i)=>Object.assign(e,{x:[650,2100,650,1900][i%4],y:[-99,151,401,651][i%4]}));
 // Arrival and return portals are anchored to the actual traversal surfaces.
 const proofExit=C.exits[10].find(e=>e.to===11);Object.assign(proofExit,{x:3090,y:91});
 const proofReturn=C.exits[11].find(e=>e.to===10);Object.assign(proofReturn,{arrivalX:3060,arrivalY:91});
 const caveIn=C.exits[13].find(e=>e.to===14);Object.assign(caveIn,{arrivalX:650,arrivalY:-249});
 Object.assign(C.exits[14].find(e=>e.to===13),{x:600,y:-249});
 Object.assign(C.exits[14].find(e=>e.to===15),{x:2440,y:651});
 Object.assign(C.exits[15].find(e=>e.to===14),{arrivalX:2300,arrivalY:651});
 const litCount=s=>s.flags.w2_coldOvenAlley?4:s.w2.ovens;
 const cracked=s=>s.flags.w2_chocoCave?3:s.w2.cracks;
 function risen(s,i){return s.flags.w2_proofingYard||s.killed.includes(flour[i].id);}
 const mill={x:1460,y:431,radius:200,period:18};
 function millPlatforms(time=0){return [0,1,2,3].map(i=>{const a=(Number.isFinite(time)?time:0)*Math.PI*2/mill.period+i*Math.PI/2;return{x:mill.x+Math.cos(a)*mill.radius-85,y:mill.y+Math.sin(a)*mill.radius,w:170,w2:true,mill:i};});}
 // Compute the same displacement as the rendered rotor. Only a grounded rider is carried;
 // jumping, recoil, falling and walking off retain the normal movement rules.
 function carry(s,p,dt){
  if(s.map!==16||!p.grounded||p.climbing||p.vy<0||dt<=0)return false;
  const old=millPlatforms(s.time-dt).find(q=>Math.abs(p.y-q.y)<5&&p.x>q.x-8&&p.x<q.x+q.w+8);
  if(!old)return false;
  const next=millPlatforms(s.time)[old.mill];p.x+=next.x-old.x;p.y+=next.y-old.y;p.groundY=p.y;return true;
 }
 function sync(s){
  if(!s?.w2)return;const map=C.maps[s.map];if(!bases[s.map])return;
  const platforms=bases[s.map].map(p=>({...p,w2:true}));let ladders=[];
  if(s.map===10){pads.forEach((p,i)=>{if(risen(s,i))platforms.push({x:p.x-p.w/2,y:p.y-125,w:p.w,w2:true,dough:i});});
   // Safety ladders let a missed jump recover; raised dough offers the short route.
   ladders=[{x:1400,top:431,bottom:651},{x:2250,top:211,bottom:651},{x:2970,top:91,bottom:211}];
   if(s.flags.w2_proofingYard)ladders.push({x:3090,top:91,bottom:651});
  }
  if(s.map===12){
   const n=litCount(s);ladders=[{x:1320,top:411,bottom:651},{x:2130,top:191,bottom:651}];
   if(n>=1)platforms.push({x:1000,y:531,w:320,w2:true,warm:true});
   if(n>=2)platforms.push({x:1800,y:301,w:350,w2:true,warm:true});
   if(n>=3)platforms.push({x:1100,y:191,w:950,w2:true,warm:true});
   if(n>=4)ladders.push({x:820,top:191,bottom:651});
  }
  if(s.map===13){ladders=[{x:250,top:91,bottom:651},{x:1100,top:251,bottom:651},{x:1950,top:431,bottom:651}];if(s.w2.snow||s.flags.w2_sugarSnowSlope){platforms.push({x:800,y:91,w:1550,w2:true,warm:true});ladders.push({x:2200,top:91,bottom:431});}}
  if(s.map===16){
   // No ladders: the wheel, crossed bread shelves and two safe approach steps form the route.
   platforms.push({x:680,y:541,w:220,w2:true},{x:3100,y:541,w:220,w2:true},{x:4000,y:541,w:250,w2:true},...millPlatforms(s.time));
   const length=Math.min(400,Math.max(0,(s.w2.roller?500:s.w2.rollerProgress)-100));
   if(length>0)platforms.push({x:3700,y:431,w:length,w2:true,rolled:true});
  }
  if(s.map===17){ladders=[{x:1400,top:431,bottom:651},{x:2450,top:211,bottom:431},{x:3350,top:211,bottom:651}];if(s.w2.jars.every(v=>v===2)||s.flags.w2_yeastCellar)ladders.push({x:1800,top:431,bottom:651});}
  if(s.map===18)ladders=[{x:500,top:431,bottom:651},{x:1300,top:311,bottom:651}];
  if(s.map===15){ladders=[{x:900,top:431,bottom:651},{x:2200,top:431,bottom:651},{x:1550,top:211,bottom:651}];if(s.w2.scales>=3)platforms.push({x:1100,y:431,w:900,w2:true,warm:true});}
  if(s.map===14){seals.forEach((p,i)=>{if(i>=cracked(s))platforms.push({x:p.x-p.w/2,y:p.y,w:p.w,w2:true,seal:i});});
   ladders=[{x:180,top:-99,bottom:651},{x:800,top:-249,bottom:-99}];
   if(cracked(s)===3)ladders.push({x:2350,top:-99,bottom:651});
  }
  map.platforms=platforms;map.ladders=ladders;
 }
 function breakSeal(s,p){if(s.map!==14)return false;const i=cracked(s),seal=seals[i];if(!seal||Math.abs(p.x-seal.x)>seal.w/2+8||Math.abs(p.y-seal.y)>8)return false;
  s.w2.cracks=i+1;sync(s);p.y+=8;p.grounded=false;p.vy=240;p.plungeUsed=false;return true;
 }
 function target(s){
  if(s.map===10&&s.flags.w2_madeleineStow&&!s.flags.w2_proofingYard){const i=flour.findIndex(e=>!s.killed.includes(e.id));if(i>=0)return{map:10,x:flour[i].x,y:flour[i].y,label:'밀가루뭉치를 정화해 반죽 길 열기',kind:'enemy'};}
  if(s.map===12&&!s.flags.w2_coldOvenAlley){const n=Math.min(3,s.w2.ovens),o=ovens[n];return{map:12,...(s.w2.ember>0?o:n?ovens[n-1]:{x:550,y:651}),label:s.w2.ember>0?(n+1)+'번째 오븐 앞에서 공명하기':'켜진 오븐이나 등잔에서 불씨 받기',kind:'story'};}
  if(s.map===14&&!s.flags.w2_chocoCave){const i=cracked(s);return{map:14,...(i<3?seals[i]:{x:2200,y:651}),label:i<3?(i+1)+'번째 금 간 층 위에서 점프 후 내려찍기':'동굴 아래에서 바게트 영감 구하기',kind:'story'};}
  return null;
 }
 function bindObjects(objects){
  for(const o of objects){if(o.id==='snow')Object.assign(o,{x:2200,y:431});if(o.kind==='jar')Object.assign(o,DREAM_WORLD2_CONTENT.jarSpots[o.i]);if(o.kind==='butter')Object.assign(o,DREAM_WORLD2_CONTENT.butterSpots[o.i]);if(o.id==='roller'){o.x=3500;o.y=431;}if(o.kind==='recipeClue')Object.assign(o,recipeClues[o.i]);if(o.kind==='oven')Object.assign(o,ovens[o.i]);if(o.id==='ember')o.x=550;if(o.id==='baguette')o.x=2200;}
 }
 function jumpBoost(s,p){return s.map===10&&pads.some((q,i)=>risen(s,i)&&Math.abs(p.y-(q.y-125))<8&&Math.abs(p.x-q.x)<q.w/2+8);}
 function instruction(s,p,t){if(t.map!==s.map)return null;if(s.map===16&&t.y>p.y+85)return '발판 옆으로 내려가 아래쪽 길을 따라가요 · '+t.label;if(s.map===16&&t.y<p.y-85&&t.x>=3150)return '낮은 빵 발판부터 점프해 밀대 쪽으로 올라가요 · '+t.label;if(s.map===16&&t.y<p.y-85&&t.x<2200)return '풍차 끝 발판에 올라 기다린 뒤, 오른쪽 위 길로 점프해요 · '+t.label;if(s.map===16&&t.x>=2200&&t.x<3150)return '프레첼의 위·아래 길은 다시 만나요. 가까운 빵 발판으로 점프해요 · '+t.label;if(s.map===10&&t.y<p.y-85)return '부푼 반죽 위에서 점프해 위쪽 길로 올라가요 · '+t.label;if(s.map===14&&t.y>p.y+85)return '열린 틈으로 아래층에 내려가요 · '+t.label;if(s.map===14&&Math.abs(t.x-p.x)<140&&Math.abs(t.y-p.y)<85&&cracked(s)<3)return '점프한 뒤 공격 버튼으로 금 간 층을 내려찍어요';return null;}
 window.DREAM_W2_ROUTES={mill,millPlatforms,carry,recipeClues,instruction,pads,ovens,seals,sync,breakSeal,target,bindObjects,risen,litCount,cracked,jumpBoost,emberDuration:22};
})();
