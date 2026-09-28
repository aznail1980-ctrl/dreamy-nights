'use strict';
(() => {
 const R=window.DreamRenderer.prototype,A=window.DREAM_ART_V49,oldActor=R.actor,oldGroundArt=R.groundArt;
 const palettes={beach:['#eddcb4','#c2aa8c'],trail:['#b5c38f','#718270'],town:['#d9c6a5','#9a8268'],alley:['#a89a90','#625e72'],boss:['#9e89a1','#55465f'],tide:['#9dc9c6','#456e81'],garden:['#bbcc9d','#798f7e'],observatory:['#b5b5ce','#555d7e'],archive:['#bda48c','#725f69'],waterway:['#9fbbb4','#557f88']};
 R.drawRegionBackdrop=function(r){
  const m=this.C.maps[r.state.map],im=this.images[m.backdrop],c=this.ctx;if(!im)return;
  const h=1080,w=h*im.width/im.height,progress=Math.max(0,Math.min(1,r.camera/Math.max(1,m.width-1440)));
  c.drawImage(im,-progress*Math.max(0,w-1440),-135-(r.cameraY||0)*.16,w,h);
  if(!r.settings.reducedMotion&&['town','tide','waterway','beach'].includes(m.theme)){
   c.save();c.globalAlpha=.15;c.strokeStyle='#fdf6d4';c.lineWidth=1.5;
   for(let i=0;i<14;i++){const x=(i*173+63-progress*200)%1440,y=540+i%4*42+Math.sin(r.clock*.9+i)*3;c.beginPath();c.ellipse(x,y,15+i%3*8,2,0,0,Math.PI*1.6);c.stroke();}c.restore();
  }
 };
 R.kit=function(frame,x,y,w,atSurface=false){
  const b=A.sheets.harborKitV49.frames[frame],h=w*b[3]/b[2],surface=A.sheets.harborKitV49.surface[frame];
  this.ctx.drawImage(this.images.harborKitV49,...b,x-w/2,y-h*(atSurface?surface:1),w,h);return h;
 };
 R.groundArt=function(kind,x,y,width){if(kind==='boat')return this.kit(3,x,y,width);return oldGroundArt.call(this,kind,x,y,width);};
 const oldBuildings=R.drawIllustratedBuildings,oldDecorations=R.drawDecorations;
 R.drawIllustratedBuildings=function(map){for(const d of map.decorations||[])if(d.kind==='boat')this.groundArt(d.kind,d.x,d.y,d.width);oldBuildings.call(this,map);};
 R.drawDecorations=function(map){oldDecorations.call(this,{...map,decorations:(map.decorations||[]).filter(d=>d.kind!=='boat')});};
 R.drawBridgeControl=function(d,done){
  const c=this.ctx;this.kit(0,d.x,d.y,90);
  if(done)this.glow(d.x,d.y-58,30,'#d0e8bd');
  this.text(done?'다리 연결 완료':'꿈빛 크랭크',d.x,d.y-108,12,'#fff4d3','center',650);
  if(!done){this.star(d.x+31,d.y-70,4,'#ffdfa0',this.r.clock*.5);}
 };
 R.drawSurface=function(p,map){
  const c=this.ctx,r=this.r,[top,soil]=palettes[map.theme],left=Math.max(p.x,r.camera-65),right=Math.min(p.x+p.w,r.camera+1505);if(right<=left)return;
  if(p.bridge){this.kit(1,p.x+p.w/2,p.y,p.w+14,true);return;}
  const harbor=map.theme==='town';
  if(harbor){
   const span=250;
   c.save();c.beginPath();c.rect(p.x,p.y-75,p.w,385);c.clip();
   const start=Math.floor((left-p.x)/span)*span+p.x;
   for(let x=start;x<right;x+=span){const dock=p.harbor==='pier'||p.ground&&x+span/2>1400&&x+span/2<3150;this.kit(dock?4:2,x+span/2,p.y,span+3,true);}
   c.restore();return;
  }
  const depth=p.ground?360:['archive','observatory','alley','boss','waterway'].includes(map.theme)?38:84;
  const g=c.createLinearGradient(0,p.y,0,p.y+depth);g.addColorStop(0,soil);g.addColorStop(1,soil+'d9');
  c.fillStyle=g;c.beginPath();c.moveTo(left,p.y);c.lineTo(right,p.y);c.lineTo(right,p.y+depth);
  for(let x=right;x>left;x-=55)c.lineTo(Math.max(left,x-55),p.y+depth-(p.ground?0:8+Math.sin(x*.041)*9));c.closePath();c.fill();
  c.save();c.beginPath();c.rect(left,p.y,right-left,depth);c.clip();
  const im=this.images[map.backdrop];c.globalAlpha=.13;
  // One continuous crop follows world position; it is never tiled across the region.
  c.drawImage(im,0,im.height*.62,im.width,im.height*.32,0,p.y,map.width,depth);c.restore();
  this.round(left,p.y-3,right-left,10,4,top);
  if(!p.ground&&['trail','garden','beach','tide'].includes(map.theme)){
   c.save();c.beginPath();c.rect(p.x,p.y-10,p.w,130);c.clip();
   for(const x of [p.x+50,p.x+p.w-50])if(x>left-100&&x<right+100)this.kit(5,x,p.y,110,true);
   c.restore();
  }
 };
 R.actor=function(who,x,y,face=1,active=false){
  const r=this.r,p=r.player;if(!active||p.dodgeT<=0)return oldActor.call(this,who,x,y,face,active);
  const c=this.ctx,key=who+'DashV49',sheet=A.sheets[key],phase=1-p.dodgeT/.26;
  const frame=phase<.13?0:phase<.47?1:phase<.82?2:3,b=sheet.frames[frame],[px,py]=sheet.pivots[frame],sc=sheet.scale,direction=p.dodgeFacing||face;
  this.ellipse(x,p.groundY??y,27,4,'#4b415d30');c.save();c.translate(x,y-(p.grounded&&!r.settings.reducedMotion?Math.sin(phase*Math.PI)*5:0));c.scale(direction,1);
  const pose={who,kind:'dash',frame,pins:sheet.pins[frame]},body=()=>c.drawImage(this.images[key],...b,(b[0]-px)*sc,(b[1]-py)*sc,b[2]*sc,b[3]*sc);
  if(!r.settings.reducedMotion){
   for(let i=2;i>=1;i--){c.save();c.translate(-i*19,0);c.globalAlpha=.08/i;body();c.restore();}
   c.strokeStyle='#fbf0d29c';c.lineWidth=2;c.lineCap='round';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-55-i*6,-30-i*20);c.lineTo(-90-i*10,-30-i*20);c.stroke();}
  }
  this.costume(r.state.world.look,pose,'back',body);body();this.costume(r.state.world.look,pose,'front',body);c.restore();
 };
 R.drawExplorationMap=function(canvas,state,player){
  const map=this.C.maps[state.map],c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  const preview=new window.DreamRenderer(canvas,this.images,this.C);preview.r={state,player,clock:0,camera:0,cameraY:0,settings:{reducedMotion:true},rpgInfo:{npcMarks:{}}};
  c.clearRect(0,0,W,H);c.drawImage(this.images[map.backdrop],0,0,W,H);c.fillStyle='#fff4dd33';c.fillRect(0,0,W,H);
  const sx=W/map.width,sy=H/1050;c.save();c.scale(sx,sy);c.translate(0,200);
  // Render the same authored geometry in clipped strips, including restored bridges.
  for(let x=0;x<map.width;x+=1440){c.save();c.beginPath();c.rect(x,-200,Math.min(1440,map.width-x),1050);c.clip();preview.r.camera=x;preview.drawIllustratedBuildings(map);preview.terrain(map);preview.drawDecorations(map);c.restore();}
  for(const n of Object.keys(this.C.npcs))if(this.C.npcs[n].map===state.map)preview.drawNPC(n);
  c.restore();
  const cells=state.remaster.explored[map.id]||[];
  for(let tier=0;tier<3;tier++)for(let col=0;col<10;col++)if(!cells.includes(tier*10+col)){
   const x=(col+.5)*W/10,y=(651-tier*310+150)/1050*H,g=c.createRadialGradient(x,y,2,x,y,W/11);
   g.addColorStop(0,'#f3e8d0b0');g.addColorStop(1,'#f3e8d000');c.fillStyle=g;c.fillRect(x-W/10,y-H/5,W/5,H/2.5);
  }
 };
})();
