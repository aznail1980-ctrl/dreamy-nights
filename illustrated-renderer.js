'use strict';
(() => {
 const R=window.DreamRenderer.prototype, ART=window.DREAM_ART_V44, oldActor=R.actor, oldItem=R.item;
 const props={bakery:['harborBuildingsV44',0],postoffice:['harborBuildingsV44',1],cottage:['harborBuildingsV44',2],mailbox:['harborPropsV44',0],planter:['harborPropsV44',1],streetlamp:['harborPropsV44',2],bench:['harborPropsV44',3],bollard:['harborPropsV44',4],signpost:['harborPropsV44',5],herb:['questPropsV44',0],tideBell:['questPropsV44',1],altar:['questPropsV44',2],windVane:['questPropsV44',3],starChart:['questPropsV44',4],archiveBook:['questPropsV44',4],waterWheel:['questPropsV44',5]};
 // All environmental illustrations share a visible bottom edge in world space.
 R.groundArt=function(kind,x,y,width){
  const entry=props[kind];if(!entry)return 0;
  const [key,i]=entry,b=ART.sheets[key].frames[i],h=width*b[3]/b[2];
  this.ctx.drawImage(this.images[key],...b,x-width/2,y-h,width,h);return h;
 };
 R.item=function(icon,x,y,w,h=w,angle=0){
  const key='item-'+icon,b=ART.itemBounds[key];if(!b||window.DREAM_WEAR.icons[icon])return oldItem.call(this,icon,x,y,w,h,angle);
  const c=this.ctx,sc=Math.min(w/b[2],h/b[3]);c.save();c.translate(x,y);c.rotate(angle);c.drawImage(this.images[key],...b,-b[2]*sc/2,-b[3]*sc/2,b[2]*sc,b[3]*sc);c.restore();
 };
 R.drawIllustratedBuildings=function(map){for(const d of map.buildings||[])if(Math.abs(d.x-this.r.camera-720)<1000)this.groundArt(d.kind,d.x,d.y,d.width);};
 R.drawDecorations=function(map){
  for(const d of map.decorations||[]){if(Math.abs(d.x-this.r.camera-720)>850)continue;
   if(d.kind==='crate'){
    this.prop('crateV41',d.x,d.y,d.width);
    if(d.stack){const b=window.DREAM_ART_V41.props.crateV41,h=d.width*(b[3]-b[1])/(b[2]-b[0]);this.prop('parcelV41',d.x+2,d.y-h+4,62);}
   }else this.groundArt(d.kind,d.x,d.y,d.width);
  }
 };
 R.collectible=function(m){
  if(!m||this.r.state.memories.includes(m.id))return;
  const floor=m.floorY??m.y+60,y=floor-21+(this.r.settings.reducedMotion?0:Math.sin(this.r.clock*2)*2);
  this.ellipse(m.x,floor+1,17,3,'#89748333');this.glow(m.x,y,39,'#f8dfb0');this.item('dust',m.x,y,38);this.text('반짝 기억',m.x,y-32,12,'#725873');
 };
 R.drawNPC=function(id){
  const n=this.C.npcs[id],r=this.r,c=this.ctx,key=id+'LifeV44',sheet=ART.sheets[key];
  const frame=n.greetingActive?5:n.walking?((Math.floor((n.walkTime||0)/(Math.PI*2)*4)%4)+4)%4:4,b=sheet.frames[frame];
  const sc=(id==='post'?98:137)/sheet.height,w=b[2]*sc,h=b[3]*sc;
  this.ellipse(n.x,n.y+2,id==='post'?24:26,4,'#50425330');
  c.save();c.translate(n.x,n.y);c.scale(n.face<0?-1:1,1);
  if(!n.walking&&!r.settings.reducedMotion)c.scale(1,1+Math.sin(r.clock*1.8+n.phase)*.003);
  c.drawImage(this.images[key],...b,-w/2,-h,w,h);c.restore();
  this.round(n.x-62,n.y-171,124,23,11,'#fff6e9eb');this.text(n.name,n.x,n.y-155,12,'#675268','center',650);
  this.text(r.rpgInfo?.npcMarks[id]||'…',n.x,n.y-184,20,'#fff1b3');
  if(n.greetingActive){this.round(n.x-85,n.y-226,170,28,12,'#fffaf2ed');this.text({lumen:'오늘도 무사히 돌아오렴.',madeleine:'갓 구운 빵 냄새가 나지?',post:'편지 한 통에 마음을 담아요!'}[id],n.x,n.y-207,12,'#70576e');}
 };
 R.drawRPGWorld=function(r){
  const s=r.state,c=this.ctx;if(s.map===2)Object.keys(this.C.npcs).forEach(id=>this.drawNPC(id));
  for(const o of this.C.objects.filter(o=>o.map===s.map)){
   const x=o.x,y=o.y;
   if(o.kind==='herb'){if(!s.rpg.gathered.includes(o.id))this.groundArt('herb',x,y,48);continue;}
   if(o.kind==='chest'||o.kind==='treasure'){this.chest(x,y,o.kind==='chest'?s.rpg.opened.includes(o.id):s.world.treasure.includes(o.id),92);continue;}
   if(o.kind==='beacon'){
    c.save();if(!s.rpg.beacons.includes(o.id))c.filter='saturate(.25) brightness(.75)';this.groundArt('streetlamp',x,y,58);c.restore();
    if(s.rpg.beacons.includes(o.id))this.glow(x+12,y-95,62,'#fff0bc');continue;
   }
   const widths={altar:240,tideBell:106,windVane:90,starChart:148,archiveBook:130,waterWheel:212};if(!widths[o.kind])continue;
   const h=this.groundArt(o.kind,x,y,widths[o.kind]);
   const labels={altar:s.flags.completed?'우리의 등대':'기억을 모으는 꿈종',tideBell:['낮은 종','가운데 종','높은 종'][o.index],windVane:['북','동','남','서'][s.world.vanes[o.index]||0],starChart:'바다와 바람의 별지도',archiveBook:'반장의 마지막 기록',waterWheel:s.flags.bridgeOpened?'꿈빛이 흐르는 수차':'멈춰 선 수차'};
   this.round(x-78,y-h-31,156,24,12,'#fff4e9e8');this.text(labels[o.kind],x,y-h-14,12,'#6c5970');
   const done=o.kind==='tideBell'?s.flags.tideAttuned:o.kind==='windVane'?s.flags.windAttuned:o.kind==='waterWheel'?s.flags.bridgeOpened:o.kind==='altar'?s.flags.completed:false;
   if(done)this.glow(x,y-h*.6,65,'#f7df9d');
  }
  if(r.rpgInfo?.combo>1)this.text(r.rpgInfo.combo+' COMBO',r.player.x+85,r.player.y-175,18,'#ae738e','center',800);
 };
 R.actor=function(who,x,y,face=1,active=false){
  const p=this.r.player,charging=p.chargeHeld&&p.chargeT>.15,released=p.chargeLevel>0&&p.attackT>0;
  if(!active||(!charging&&!released))return oldActor.call(this,who,x,y,face,active);
  const c=this.ctx,r=this.r,sheet=ART.sheets[who+'ChargeV44'],elapsed=(p.attackLength||.74)-p.attackT;
  const frame=charging?(p.chargeT<.35?0:p.chargeT<.8?1:2):elapsed<.1?2:elapsed<.28?3:elapsed<.53?4:5;
  const b=sheet.frames[frame],pivot=sheet.pivots[frame],sc=sheet.scale,flip=sheet.flips[frame],pose={who,kind:'attack',frame,pins:sheet.pins[frame]};
  this.ellipse(x,p.groundY??y,25,4,'#48455630');c.save();c.translate(x,y);c.scale(released?p.attackFacing||face:face,1);
  const drawBody=()=>{c.save();c.scale(flip,1);c.drawImage(this.images[who+'ChargeV44'],...b,(b[0]-pivot[0])*sc,(b[1]-pivot[1])*sc,b[2]*sc,b[3]*sc);c.restore();};
  this.costume(r.state.world.look,pose,'back',drawBody);drawBody();this.costume(r.state.world.look,pose,'front',drawBody);c.restore();
  if(charging){const k=Math.min(1,p.chargeT/1.05);this.glow(x,y-55,45+k*55,p.chargeReady?'#ffe1a1':'#bfe5e8');
   c.save();c.strokeStyle=p.chargeReady?'#fff3c7':'#c0e6e6';c.lineWidth=3;c.beginPath();c.ellipse(x,y-2,30+k*18,8,0,-Math.PI/2,-Math.PI/2+Math.PI*2*k);c.stroke();c.restore();
   if(p.chargeReady)this.text('놓으면 강한 정화!',x,y-181,14,'#fff4c5','center',700);
  }
 };
 R.drawHitEffects=function(r){
  const c=this.ctx;
  for(const v of r.impacts||[]){
   const k=Math.max(0,v.life/v.max),size=v.charged?122:v.heavy?83:61,expand=r.settings.reducedMotion?1:1+(1-k)*.7;
   c.save();c.translate(v.x,v.y);c.rotate(v.seed);c.globalAlpha=Math.min(1,k*2);
   this.glow(0,0,size*.9,'#ffcc88');
   for(let i=0;i<10;i++){
    const a=i*Math.PI/5,len=size*(i%2?.56:1)*expand;c.save();c.rotate(a);
    c.fillStyle='#855277';c.beginPath();c.moveTo(size*.16,-6);c.lineTo(len+5,0);c.lineTo(size*.16,6);c.fill();
    c.fillStyle=i%2?'#ffd885':'#fff9e1';c.beginPath();c.moveTo(size*.17,-3);c.lineTo(len,0);c.lineTo(size*.17,3);c.fill();c.restore();
   }
   this.star(0,0,Math.max(10,size*.47*k),'#795370',.1);this.star(0,0,Math.max(8,size*.4*k),'#fffbe7',.1);
   if(v.charged){c.strokeStyle='#fff0b5';c.lineWidth=5*k;c.beginPath();c.ellipse(0,0,size*expand,size*.6*expand,0,0,Math.PI*2);c.stroke();}
   c.restore();
  }
  const p=r.player;if(p.chargeLevel&&p.attackT>0){const elapsed=p.attackLength-p.attackT;
   if(elapsed>.1&&elapsed<.47){const k=(elapsed-.1)/.37,reach=p.chargeLevel===2?255:195;
    c.save();c.translate(p.x,p.y-55);c.scale(p.attackFacing||p.facing,1);c.globalAlpha=Math.sin(k*Math.PI);
    for(const [color,width]of[['#aa709f66',34],['#ffc789cc',20],['#fff5cf',7]]){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.ellipse(48,0,reach-62,93,-.25,-1.2+k*.6,1.4+k*.3);c.stroke();}
    c.restore();
   }
  }
 };
 // World drops share the borderless renderer; R.item above supplies the illustrated art.

})();
