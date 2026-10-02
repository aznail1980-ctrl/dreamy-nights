'use strict';
/* Capture the original gentle artwork BEFORE dungeon-art replaces combat sprites.
   These forms represent memories freed from worry, never tamable/hostile actors. */
window.DREAM_PURIFICATION = (() => {
 const forms={...window.DREAM_MOTION_ART.creatures};
 const returns={bellSentry:'tideBell',undertowWhelk:'shoreSnail',thornMask:'gardenBud',vaneBat:'windMoth',lockBook:'inkMimic',sealRaven:'parcelBat',valveSentry:'waterOtter',siltClaw:'crab'};
 const duration=1.8,releaseAt=1.18,smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function begin(e){
  const id=e.variant||e.type,form=returns[id]||id;
  e.purification={elapsed:0,duration,form:forms[form]?form:e.type,x:e.x,y:e.y,face:e.face||1};
  e.fade=duration;e.knockV=0;e.airFall=false;e.fallVy=0;e.windup=0;e.action=null;e.hurt=0;e.stun=0;
  return duration;
 }
 function tick(e,dt){
  if(!e.dead||!(e.fade>0))return;
  if(!e.purification){e.fade=Math.max(0,e.fade-dt);return;}
  const p=e.purification;p.elapsed=Math.min(p.duration,p.elapsed+dt);e.fade=Math.max(0,p.duration-p.elapsed);
 }
 function pose(e,reduced=false){
  const p=e.purification;if(!p||!e.dead||e.fade<=0)return null;
  const t=p.elapsed,release=smooth((t-releaseAt)/(duration-releaseAt)),reveal=smooth((t-.08)/.25);
  return{form:p.form,x:p.x,y:p.y,face:p.face,dark:1-smooth(t/.27),gentle:reveal*(1-release),halo:Math.sin(Math.PI*Math.min(1,t/.5))*.5+(1-release)*.12,
   rise:reduced?0:release*26,bow:reduced?0:Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.45)/.65)))*.055,release,elapsed:t};
 }
 return{forms,returns,duration,releaseAt,begin,tick,pose};
})();
