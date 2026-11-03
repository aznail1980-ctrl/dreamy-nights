'use strict';
(()=>{
 const R=DreamRenderer.prototype,oldSurface=R.drawSurface,oldDecorations=R.drawDecorations;
 R.w2Prop=function(kind,frame,x,y,width,top=false){const spec=DREAM_W2_ROUTE_ART[kind],b=spec.frames[frame],im=this.images[spec.key];if(!im)return;const h=width*b[3]/b[2];this.ctx.drawImage(im,...b,x-width/2,y-(top?0:h),width,h);};
 const oldTerrain=R.terrain;
 R.terrain=function(map){
  if(this.r.state.map===16)this.drawMillRoute();
  return oldTerrain.call(this,map);
 };
 R.drawMillRoute=function(){
  const c=this.ctx,M=DREAM_W2_ROUTES.mill,im=this.images.w2WindmillPretzel;if(!im)return;
  c.save();c.strokeStyle='#76502b';c.lineWidth=26;c.lineCap='round';c.beginPath();c.moveTo(M.x-65,651);c.lineTo(M.x,M.y);c.lineTo(M.x+65,651);c.stroke();c.strokeStyle='#c49a59';c.lineWidth=12;c.stroke();
  c.translate(M.x,M.y);c.rotate(this.r.state.time*Math.PI*2/M.period);c.drawImage(im,0,106,768,768,-215,-215,430,430);c.restore();
  c.save();c.globalAlpha=.88;c.drawImage(im,768,300,768,400,2100,190,1080,450);c.restore();
 };
 R.drawSurface=function(p,map){
  if(map.world!==2)return oldSurface.call(this,p,map);
  const c=this.ctx,left=Math.max(p.x,this.r.camera-50),right=Math.min(p.x+p.w,this.r.camera+1490);if(right<=left)return;
  if(p.mill!==undefined){this.w2Prop('proofing',2,p.x+p.w/2,p.y-3,p.w,true);this.round(p.x+8,p.y-4,p.w-16,5,2,'#fff0be');return;}
  const cave=map.routeType==='descent',kind=cave?'choco':'proofing',frame=p.seal!==undefined?1:p.dough!==undefined?1:cave?0:2;
  if(p.ground){const g=c.createLinearGradient(0,p.y,0,p.y+400);g.addColorStop(0,cave?'#80543c':'#b58d61');g.addColorStop(1,cave?'#3c281f':'#785d42');c.fillStyle=g;c.fillRect(left,p.y,right-left,500);}
  if(p.rolled){this.ctx.save();this.ctx.beginPath();this.ctx.rect(p.x,p.y-2,p.w,80);this.ctx.clip();for(let x=p.x;x<p.x+p.w;x+=300)this.w2Prop('roller',2,x+150,p.y-2,305,true);this.ctx.restore();return;}
  if(p.dough!==undefined||p.seal!==undefined){this.w2Prop(kind,frame,p.x+p.w/2,p.y-3,p.w,true);return;}
  c.save();c.beginPath();c.rect(p.x,p.y-5,p.w,p.ground?300:100);c.clip();
  for(let x=p.x+Math.floor((left-p.x)/300)*300;x<right;x+=300)this.w2Prop(kind,frame,x+150,p.y-4,310,true);
  c.restore();
 };
 R.drawDecorations=function(map){
  if(map.world!==2)return oldDecorations.call(this,map);
  const s=this.r.state,M=DREAM_W2_ROUTES,t=this.r.clock;
  if(s.map===16){this.text('풍차 끝 빵 발판 · 올라타서 기다려요',1460,170,16,'#fff1ce','center',650);this.text('두 길은 다시 만나요 · 점프해서 건너요',2640,150,16,'#fff1ce','center',650);}
  for(const prop of window.DREAM_W2_PROP_VIEW?.(s,window.DREAM_W2_OBJECTS||[])||[]){
   this.w2Prop(prop.kind,prop.frame,prop.x,prop.y,prop.width);
   if(prop.label){const b=DREAM_W2_ROUTE_ART[prop.kind].frames[prop.frame],h=prop.width*b[3]/b[2];this.text(prop.label,prop.x,prop.y-h-17,14,'#fff1ce','center',650);}
  }
  if(s.map===17)for(const o of (window.DREAM_W2_OBJECTS||[]).filter(o=>o.kind==='jar')){
   if(s.w2.jars[o.i]!==1)continue;
   const heat=Math.min(1,s.w2.jarHeat[o.i]/2.5);
   this.round(o.x-42,o.y-155,84,8,4,'#4b3429');
   this.round(o.x-42,o.y-155,84*heat,8,4,'#ffe3a0');
   if(heat>=1)this.star(o.x,o.y-175,8,'#fff1b7',t*.7);
  }
  // Pomi is a scene partner only, never a permanent follower or a speaking NPC.
  if(s.map===18&&s.flags.w2_yeastCellar){
   const table=(window.DREAM_W2_OBJECTS||[]).find(o=>o.id==='tables');
   if(table){const ready=map.enemies.every(e=>s.killed.includes(e.id)),charge=s.w2.pomiCharge/2,done=s.w2.pomi;
    const frame=done?3:charge>0?2:ready?1:0,x=table.x+300,y=table.y-145;
    const spec=DREAM_W2_ROUTE_ART.pomi,b=spec.frames[frame],im=this.images[spec.key],scale=76/535;
    if(im){const lift=done?Math.abs(Math.sin(t*3))*9:Math.sin(t*2)*3;this.ctx.drawImage(im,...b,x-b[2]*scale/2,y-b[3]*scale-lift,b[2]*scale,b[3]*scale);}
    this.text('포미',x,y-95,14,'#fff5d6','center',650);
    if(ready&&!done){this.round(table.x-55,table.y-200,110,8,4,'#4b3429');this.round(table.x-55,table.y-200,110*charge,8,4,'#ffe3a0');}
    if(charge>0||done){const c=this.ctx;c.save();c.strokeStyle='#ffe4a2';c.lineWidth=3;c.globalAlpha=.65;c.beginPath();c.moveTo(table.x,table.y-160);c.quadraticCurveTo(table.x+150,table.y-260,x,table.y-160);c.stroke();c.restore();for(let i=0;i<5;i++){const u=(t*.3+i/5)%1;this.star(table.x+300*u,table.y-160-200*u*(1-u),4,'#fff4c4',t);}}
   }
  }
  // Stay near the story interaction point. Walk frames follow travel, never idle sliding.
  const actors={11:[['bongsun',1320,651]],12:[['croi',430,651]],13:[['shushu',2350,431]],14:[['baguette',2200,651]],17:[['yeasty',3350,140]]};
  const finaleReady=s.map===19&&this.C.maps[19].enemies.filter(e=>e.variant==='underbakedGhost').every(e=>s.killed.includes(e.id));
  if(finaleReady){
   actors[19]=[['bongsun',1680,651]];
   this.w2Prop('oven',1,1800,651,205);
   const baker=this.images.npcBaker;if(baker?.complete&&baker.naturalWidth){const h=137,w=h*baker.naturalWidth/baker.naturalHeight;this.ctx.drawImage(baker,1920-w/2,651-h,w,h);}
   this.text('마들렌',1920,495,14,'#fff5d6','center',650);
   this.text(s.flags.w2_underbakedGhost?'함께 구운 첫 빵 · 광장으로 돌아가요':'두 사람과 함께 화덕에 공명해요 · F',1800,405,17,'#fff1bd','center',700);
   if(!s.flags.w2_underbakedGhost)this.glow(1800,560,45,'#ffcc74');
  }
  for(const [who,home,y] of actors[s.map]||[]){
   const spec=window.DREAM_W2_NPCS?.[who],im=spec&&this.images[spec.key];if(!im?.complete)continue;
   const phase=(t+(who==='shushu'?2:0))%12,walking=(phase>=3&&phase<5)||(phase>=8&&phase<10);
   const returning=phase>=8;let offset=phase<3?0:phase<5?(phase-3)*12:phase<8?24:phase<10?24-(phase-8)*12:0;
   let frame=walking?1+Math.floor(t*6)%2:phase<3?0:3;
   if(who==='baguette'&&s.w2.cracks<3){frame=0;offset=0;}
   if(who==='yeasty'){frame=s.w2.jars.some(v=>v===2)?1+Math.floor(t*2)%2:3;offset=0;}
   const b=spec.frames[frame],scale=spec.height/spec.frames[0][3],x=home+offset;
   const floatY=who==='yeasty'?Math.sin(t*1.8)*5:0;
   this.ctx.save();this.ctx.translate(x,y+floatY);this.ctx.scale((returning?-1:1)*(who==='baguette'&&frame===1?-1:1),1);
   this.ctx.drawImage(im,...b,-b[2]*scale/2,-b[3]*scale,b[2]*scale,b[3]*scale);this.ctx.restore();
   this.text(spec.name,x,y-spec.height-12,14,'#fff5d6','center',650);
  }
  if(s.map===10)M.pads.forEach((p,i)=>{
   const open=M.risen(s,i);if(!open)this.w2Prop('proofing',0,p.x,p.y,320);
   this.text(open?'포근한 반죽 · 점프가 높아져요':'정화하면 반죽이 부풀어요',p.x,p.y-(open?155:80),14,'#fff5d6','center',650);
   if(open)this.star(p.x,p.y-175,5,'#ffdf96',t*.6);
  });
  if(s.map===12){this.w2Prop('oven',2,550,651,55);this.text('불씨 등잔 · 살펴보기',550,550,14,'#fff5d6');
   M.ovens.forEach((p,i)=>{const lit=i<M.litCount(s);this.w2Prop('oven',lit?1:0,p.x,p.y,165);this.text((i+1)+'번 오븐 · '+(lit?'불씨 다시 받기':'공명하기'),p.x,p.y-190,14,'#fff5d6');if(lit)this.glow(p.x,p.y-70,38,'#ffcc74');});
   if(s.w2.ember>0){this.w2Prop('oven',2,this.r.player.x+32,this.r.player.y-65,26);this.text(Math.ceil(s.w2.ember)+'초',this.r.player.x+40,this.r.player.y-110,13,'#fff2bd');}
  }
  if(s.map===14){M.seals.forEach((p,i)=>{if(i<M.cracked(s))return;this.text('↓ '+(i+1)+'번째 초코 층 · 내려찍기',p.x,p.y-55,15,'#fff4d5','center',700);this.star(p.x,p.y-25,7,'#ffe69d',t*.5);});

  }
 };
})();
