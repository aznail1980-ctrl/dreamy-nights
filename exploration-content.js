'use strict';
/* Presentation and authored harbor geography, independent of save-file item IDs. */
(() => {
 const C=window.DREAM_CONTENT;
 const themes=['beach','trail','town','alley','boss','tide','garden','observatory','archive','waterway'];
 window.DREAM_ART_V49={files:Object.fromEntries([...themes.map(t=>'backdrop-'+t+'-v49'),'ariDashV49','popoDashV49','harborKitV49','storybookShelfV49'].map(k=>[k,'assets/'+k+'.png'])),sheets:{}};
 window.DREAM_ART_V49.files.atlasWorldV48='assets/atlas-world-v48.png';
 C.maps.forEach((m,i)=>{
  m.backdrop='backdrop-'+m.theme+'-v49';
  m.bridgeX=m.width*(i%2?.49:.57);
  m.devices.find(d=>d.kind==='switch').label='꿈빛 크랭크 · 다리 펼치기';
 });
 const m=C.maps[2],G=651;
 m.sections=['빵집 광장과 선착장','우편 부두와 연결교','등대 전망 테라스'];
 // Arrival and story exits remain at sea level. Public terraces have multiple ladders and a lift.
 m.platforms=[
  {x:540,y:341,w:1310,harbor:'arcade'},
  {x:2020,y:341,w:1220,harbor:'pier'},
  {x:3430,y:341,w:560,harbor:'arcade'},
  {x:900,y:31,w:1150,harbor:'arcade'},
  {x:2250,y:31,w:1760,harbor:'arcade'}
 ];
 // Use the same central gap for the working crank, bridge collision, and atlas depiction.
 m.bridgeX=1935;m.bridgeSpan=180;
 m.platforms.push({x:2050,y:31,w:110,harbor:'pier'});
 // Each level has its own physical bridge gap.
 m.bridgeGaps=[{x:1850,y:341,w:170},{x:2160,y:31,w:90}];
 m.ladders=[{x:630,top:341,bottom:G},{x:1490,top:341,bottom:G},{x:2120,top:341,bottom:G},{x:3070,top:341,bottom:G},{x:3650,top:341,bottom:G},{x:1030,top:31,bottom:341},{x:1710,top:31,bottom:341},{x:2450,top:31,bottom:341},{x:3750,top:31,bottom:341}];
 const roles={madeleine:{x:900,y:G,patrol:65},post:{x:2640,y:341,patrol:85},lumen:{x:3420,y:31,patrol:65}};
 for(const[id,pose]of Object.entries(roles))Object.assign(C.npcs[id],pose,{home:pose.x});
 m.npc={x:3420,y:31};
 m.buildings=[{kind:'bakery',x:825,y:G,width:305},{kind:'postoffice',x:2570,y:341,width:310},{kind:'cottage',x:3340,y:31,width:285},{kind:'cottage',x:3830,y:341,width:250}];
 m.decorations=[{kind:'planter',x:680,y:G,width:74},{kind:'bench',x:1120,y:G,width:132},{kind:'streetlamp',x:1260,y:G,width:83},{kind:'bollard',x:220,y:G,width:55},{kind:'boat',x:1770,y:G+87,width:245},{kind:'mailbox',x:2380,y:341,width:80},{kind:'planter',x:2810,y:341,width:70},{kind:'streetlamp',x:2910,y:341,width:85},{kind:'bench',x:3150,y:31,width:133},{kind:'streetlamp',x:3590,y:31,width:84},{kind:'signpost',x:3860,y:G,width:85}];
 const lift=m.devices.find(d=>d.kind==='lift');Object.assign(lift,{x:3750,top:31,bottom:G,y:G});
 Object.assign(m.devices.find(d=>d.kind==='switch'),{x:1770,y:341});
 Object.assign(m.devices.find(d=>d.kind==='cache'),{x:2970,y:31});
 Object.assign(m.devices.find(d=>d.kind==='vent'),{x:1350,y:G});
 for(const o of C.objects.filter(o=>o.map===2))C.onSurface(m,o,60);
 if(m.memory){const point={x:2870,y:31};C.onSurface(m,point,50);Object.assign(m.memory,{x:point.x,y:point.y-60,floorY:point.y});}
 for(const q of C.quests)if(q.npc&&C.npcs[q.npc]){q.targetX=C.npcs[q.npc].x;q.targetY=C.npcs[q.npc].y;}
 C.bridgePlatforms=map=>(map.bridgeGaps||[{x:map.bridgeX-86,y:341,w:172},{x:map.bridgeX-86,y:31,w:172}]).map(p=>({...p,bridge:true}));
})();
