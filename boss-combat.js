'use strict';
/* Shared final-boss rules. Telegraphs lock at preparation time; attacks never track mid-flight. */
window.DREAM_BOSS=(()=>{
 const is=e=>e.type==='boss'||e.variant==='underbakedGhost';
 const stage=e=>e.hp/e.max>2/3?1:e.hp/e.max>1/3?2:3;
 const names=e=>e.variant==='underbakedGhost'?['반죽의 걱정','부풀어 오른 걱정','함께 굽는 용기']:['웅크린 걱정','흩날리는 걱정','마지막 큰 숨'];
 function initialize(e){if(!is(e))return e;e.hp=e.max=e.variant==='underbakedGhost'?260:180;e.bossStage=1;e.phase='rest';e.phaseT=2.4;e.pattern=0;return e;}
 function update(e,dt,a){
  const floor=e.floorY??651,clamp=x=>Math.max(280,Math.min(a.width-240,x));
  if(!e.bossStage)e.bossStage=1;
  const next=stage(e);
  if(next>e.bossStage&&e.phase!=='release'){
   e.bossStage=next;e.phase='transition';e.phaseT=2.2;e.zone=null;e.action='recover';e.windup=0;e.y=floor;
   a.say(names(e)[next-1]+' · 숨을 고르는 지금 정화해요!',2.2);
  }
  e.phaseT-=dt;
  if(e.phase==='transition'){if(e.phaseT<=0){e.phase='rest';e.phaseT=1;e.action=null;}return;}
  if(e.phase==='rest'){
   e.action=null;e.windup=0;e.y=floor;
   const dx=a.player.x-e.x;if(Math.abs(dx)>290)e.x=clamp(e.x+Math.sign(dx)*55*dt);
   if(e.phaseT>0)return;
   const patterns=e.bossStage===1?['sneeze','stomp']:e.bossStage===2?['leap','sneeze','stomp']:['leap','stomp','sneeze'];
   const kind=patterns[e.pattern++%patterns.length],face=Math.sign(a.player.x-e.x)||e.face||1;
   e.zone={kind,face,x:clamp(e.x+Math.max(-340,Math.min(340,a.player.x-e.x))),from:e.x};
   e.lastBossAttack=kind;e.face=e.attackFace=face;e.phase='warn';e.phaseT=kind==='leap'?1.35:1.15;e.windup=e.phaseT;
   a.say(kind==='sneeze'?'낮게 퍼지는 바람 · 점프로 피해요!':kind==='leap'?'착지할 자리가 보여요 · 옆으로 비켜요!':'빛나는 바닥에서 벗어나요!',1.6);return;
  }
  if(e.phase==='warn'){
   e.windup=Math.max(.001,e.phaseT);if(e.phaseT>0)return;
   e.windup=0;e.phase='release';e.phaseT=e.zone.kind==='leap'?.85:e.zone.kind==='sneeze'&&e.bossStage===3?1.05:.55;
   e.action='strike';e.actionLength=e.phaseT;e.actionT=e.phaseT;e.secondShot=false;e.didHit=false;
   a.sound(e.zone.kind==='sneeze'?'bossSneeze':'bossStomp');
   if(e.zone.kind==='sneeze')fire(e,a,floor);
   if(e.zone.kind==='stomp'){a.ring(e.zone.x,floor-5,130,'#ffdc91');if(Math.abs(a.player.x-e.zone.x)<120&&a.player.y>floor-90)a.damage(1,e.zone.x);}
   return;
  }
  if(e.phase==='release'){
   e.actionT=Math.max(0,e.phaseT);
   if(e.zone.kind==='leap'){
    const progress=Math.min(1,1-e.phaseT/.85);e.y=floor-Math.sin(progress*Math.PI)*150;
    e.x=clamp(e.zone.from+(e.zone.x-e.zone.from)*progress);
    if(e.phaseT<=0){e.y=floor;a.ring(e.zone.x,floor-5,130,'#ffdc91');if(Math.abs(a.player.x-e.zone.x)<120&&a.player.y>floor-90)a.damage(1,e.zone.x);
     // Land beside a grounded hero instead of leaving both bodies overlapping.
     if(Math.abs(a.player.x-e.x)<110&&Math.abs(a.player.y-floor)<110)e.x=clamp(a.player.x-e.zone.face*115);
    }
   }
   if(e.zone.kind==='sneeze'&&e.bossStage===3&&!e.secondShot&&e.phaseT<.48){e.secondShot=true;fire(e,a,floor);}
   if(e.phaseT<=0){e.y=floor;e.phase='recover';e.phaseT=e.bossStage===3?2:2.35;e.action='recover';e.actionT=e.phaseT;e.zone=null;}
   return;
  }
  if(e.phase==='recover'){e.actionT=Math.max(0,e.phaseT);if(e.phaseT<=0){e.phase='rest';e.phaseT=.85;e.action=null;}}
 }
 function fire(e,a,floor){a.waves.push({x:e.x+e.zone.face*100,y:floor-32,vx:e.zone.face*330,life:2.3,r:25,hit:false,damage:1});}
 function hint(e){if(e.phase==='warn')return e.zone.kind==='sneeze'?'낮은 바람 · 점프 준비':e.zone.kind==='leap'?'도약 준비 · 착지 표시에서 벗어나요':'바닥 표시에서 벗어나요';if(['recover','transition'].includes(e.phase))return '정화할 기회! 모아 공격도 좋아요';return names(e)[(e.bossStage||1)-1];}
 return{is,stage,initialize,update,hint,names};
})();
