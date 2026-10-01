'use strict';
DreamRenderer.prototype.drawGrowthPet=function(r){
    const p=DREAM_PETS.active(r.state);if(!p||!['play','modal'].includes(r.mode))return;
    const a=DREAM_PET_ART[p.species],im=this.images[a.key],b=r.pet;if(!im||!b)return;
    const moving=Math.abs(b.vx||0)>25,grown=DREAM_PETS.grown(p),frame=grown?(!moving&&b.happy>0?5:moving?4:3):(moving?2:1),box=a.frames[frame],c=this.ctx;
    const phase=b.walkTime||0,motion=!r.settings.reducedMotion,hop=motion&&moving&&b.grounded?Math.abs(Math.sin(phase))*3:0;
    const h=grown?59:43,scale=h/box[3],breath=motion&&!moving?Math.sin(r.clock*2.1)*.012:0;
    c.save();c.globalAlpha=Math.max(0,1-(b.recall||0)/.28);
    if(b.grounded)this.ellipse(b.x,b.y+1,grown?22:15,4,'#53425c20');
    c.translate(b.x,b.y-hop);c.scale(b.facing||1,1+breath);c.rotate(motion&&moving?Math.sin(phase)*.025:0);
    c.drawImage(im,...box,-box[2]*scale/2,-h,box[2]*scale,h);c.restore();
};
