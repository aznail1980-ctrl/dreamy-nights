'use strict';
(() => {
 const R=DreamRenderer.prototype;
 R.drawHitEffects=function(r){
  const c=this.ctx,reduced=r.settings.reducedMotion;
  for(const v of r.impacts||[]){
   const f=v.feedback||DREAM_COMBAT.profile(r.state,v.charged?'charged':v.heavy?'finisher':'light');
   const k=Math.max(0,v.life/v.max),age=1-k,size=(f.kind==='charged'?88:f.kind==='plunge'?72:44)*f.size;
   const expand=reduced?1:.7+age*.8;
   c.save();c.translate(v.x,v.y);c.globalAlpha=Math.min(.95,k*2);c.lineCap='round';
   // A bright, short white core reads first; the grade-colored silhouette stays legible.
   c.strokeStyle=f.color;c.lineWidth=f.trail+2;
   if(f.kind==='basic'){
    c.rotate((v.dir||1)*-.5);c.beginPath();c.moveTo(-size*.65,0);c.lineTo(size*.65,0);c.moveTo(0,-size*.45);c.lineTo(0,size*.45);c.stroke();
   }else if(f.kind==='plunge'){
    c.beginPath();c.moveTo(0,-size*expand);c.lineTo(0,size*.45);c.stroke();
    c.beginPath();c.ellipse(0,(v.floorY??v.y)-v.y,size*expand,size*.22,0,0,Math.PI*2);c.stroke();
   }
   const rays=reduced?Math.min(8,f.rays):f.rays;
   for(let i=0;i<rays;i++){
    const a=i*Math.PI*2/rays+(v.seed||0),reach=size*expand*(i%2?.55:1);
    c.save();c.rotate(a);c.fillStyle=f.color;c.beginPath();c.moveTo(size*.18,-2.4);c.lineTo(reach,0);c.lineTo(size*.18,2.4);c.fill();c.restore();
   }
   for(let i=0;i<f.rings;i++){c.strokeStyle=f.color;c.lineWidth=2;const radius=Math.max(4,size*(expand-i*.18));c.beginPath();c.ellipse(0,0,radius,radius*(f.kind==='plunge'?.28:.72),-.25,0,Math.PI*2);c.stroke();}
   this.star(0,0,(f.kind==='charged'?22:13)*Math.max(.45,k),'#fffdf0',.2);
   if(f.rank>=2)for(let i=0;i<Math.min(5,2+Math.floor(f.level/2));i++){const a=i*2.4;this.star(Math.cos(a)*size*.7,Math.sin(a)*size*.45,3+f.rank,f.color,age);}
   c.restore();
  }
  const p=r.player;if(!(p.attackT>0)&&!p.plunge)return;
  const f=p.pendingStrike?.feedback||p.plunge?.feedback||DREAM_COMBAT.profile(r.state,p.chargeLevel?'charged':'light');
  c.save();c.translate(p.x,p.y);c.scale(p.attackFacing||p.facing,1);c.strokeStyle=f.color;c.lineWidth=f.trail;c.lineCap='round';c.globalAlpha=reduced?.55:.75;
  if(p.plunge&&p.plunge.windup<=0){c.beginPath();c.moveTo(-16,-146);c.lineTo(-10,-28);c.moveTo(16,-146);c.lineTo(10,-28);c.stroke();}
  else {const progress=1-p.attackT/(p.attackLength||.33);if(progress>.15&&progress<.82){c.beginPath();c.ellipse(35,-65,(f.kind==='charged'?130:65)*f.size,48,0,-1.3,1.1);c.stroke();if(f.level>=3){c.lineWidth=1.5;c.beginPath();c.ellipse(35,-65,(f.kind==='charged'?142:75)*f.size,55,0,-1.2,.9);c.stroke();}}}
  c.restore();
 };
})();
