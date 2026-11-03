'use strict';
(()=>{const R=DreamRenderer.prototype,old=R.enemy;R.enemy=function(e){old.call(this,e);if(!DREAM_BOSS.is(e)||e.dead)return;
 const floor=e.floorY??651,c=this.ctx;
 if(e.phase==='warn'&&e.zone&&e.type!=='boss'||e.phase==='warn'&&e.zone?.kind==='leap'){
  c.save();c.setLineDash([9,7]);c.strokeStyle='#ffe7a0';c.lineWidth=3;
  if(e.zone.kind==='sneeze'){c.beginPath();c.moveTo(e.x+e.zone.face*70,floor-5);c.lineTo(e.x+e.zone.face*650,floor-5);c.stroke();this.text('↑ 점프',e.x+e.zone.face*230,floor-45,17,'#fff1be');}
  else{this.ellipse(e.zone.x,floor,130,18,'#ffd28666');c.strokeRect(e.zone.x-125,floor-8,250,8);this.text('착지 위치 · 옆으로!',e.zone.x,floor-44,17,'#fff1be');}c.restore();
 }
 if(['recover','transition'].includes(e.phase))this.text('✦ 정화할 기회',e.x,e.y-this.C.creatures[e.type].size-35,18,'#fff1be');
};})();
