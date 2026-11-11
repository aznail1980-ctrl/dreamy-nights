'use strict';
/* v4.52 hand-built impact sheets (tools/build-combat-vfx.py → assets/vfx-v452).
   Each attack kind and skill stage has its own drawing; the older vector impact
   stays as the fallback until a sheet has loaded, and still draws the swing trail. */
(() => {
 const R=DreamRenderer.prototype, vector=R.drawHitEffects;
 const VERSION='4.52.0', DIR='assets/vfx-v452/';
 // frames, frame w×h, anchor (fraction of the frame that lands on the hit point), on-screen scale, mirrored by facing
 const sheet=(frames,w,h,ax,ay,scale,mirror=true)=>({frames,w,h,ax,ay,scale,mirror});
 const SHEETS={
  'light-1':sheet(6,320,320,.72,.5,.55),'light-2':sheet(6,320,320,.72,.5,.55),
  finisher:sheet(7,384,384,.7,.5,.6),
  'charged-1':sheet(8,448,448,.64,.5,.64),'charged-2':sheet(10,512,512,.64,.5,.74),
  plunge:sheet(8,448,320,.5,.8,.6,false),
  burst:sheet(10,640,640,.5,.5,1,false)
 };
 for(const st of [1,2,3]){
  SHEETS['skill-attack-'+st]=sheet(8,448,384,.68,.5,.56+st*.04);
  SHEETS['skill-guard-'+st]=sheet(8,384,384,.5,.52,.62,false);
  SHEETS['skill-control-'+st]=sheet(8,384,384,.5,.52,.48+st*.03,false);
 }
 const images=new Map();
 function image(key){
  let im=images.get(key);
  if(!im){im=new Image();im.decoding='async';im.src=DIR+key+'.webp?v='+VERSION;images.set(key,im);}
  return im.complete&&im.naturalWidth?im:null;
 }
 let warmed='';
 function warm(hero){ // fetch the active hero's sheets once, before the first hit needs them
  if(warmed===hero)return;warmed=hero;
  for(const id of Object.keys(SHEETS))image(hero+'-'+id);
 }
 R.drawHitEffects=function(r){
  const c=this.ctx,hero=r.state?.active==='popo'?'popo':'ari',fallback=[];
  warm(hero);
  for(const v of r.impacts||[]){
   const f=v.feedback, spec=f?.fx&&SHEETS[f.fx], im=spec&&image((f.hero||hero)+'-'+f.fx);
   if(!im){fallback.push(v);continue;}
   const age=Math.min(.999,Math.max(0,1-v.life/v.max)), i=Math.floor(age*spec.frames);
   const w=spec.w*spec.scale, h=spec.h*spec.scale, flip=spec.mirror&&(v.dir||1)<0?-1:1;
   const y=f.fx==='plunge'?(v.floorY??v.y):v.y;
   c.save();c.translate(v.x,y);c.scale(flip,1);
   if(r.settings?.reducedMotion)c.globalAlpha=.85;
   c.drawImage(im,i*spec.w,0,spec.w,spec.h,-w*spec.ax,-h*spec.ay,w,h);
   // Weapon grade keeps its small colored stars on top of the hero's impact.
   if(f.rank>=2&&f.fx!=='burst'&&!f.fx.startsWith('skill-guard'))for(let k=0;k<Math.min(5,2+Math.floor(f.level/2));k++){const a=k*2.4;this.star(Math.cos(a)*w*.32,Math.sin(a)*h*.22,3+f.rank,f.color,age);}
   c.restore();
  }
  vector.call(this,{...r,impacts:fallback});
 };
 window.DREAM_VFX=Object.freeze({sheets:SHEETS,ready:key=>!!image(key),warm});
})();
