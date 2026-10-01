'use strict';
DreamRenderer.prototype.drawGrowthPet=function(r){
    const p=DREAM_PETS.active(r.state),b=r.pet;
    if(!p||!b||!['play','modal'].includes(r.mode))return;
    const pose=DREAM_PET_MOTION.pose(p,b,r.settings.reducedMotion),im=this.images[pose.art.key],c=this.ctx;
    if(!im){
        // Retain a companion if a new sheet cannot load on a slow connection.
        const a=DREAM_PET_ART[p.species],fallback=this.images[a.key];if(!fallback)return;
        const box=a.frames[DREAM_PETS.grown(p)?3:1],h=DREAM_PETS.grown(p)?59:43;
        c.save();c.translate(b.x,b.y);c.scale(b.facing||1,1);
        c.drawImage(fallback,...box,-box[2]*h/box[3]/2,-h,box[2]*h/box[3],h);c.restore();return;
    }
    const {box,pivot}=pose.art.frames[pose.frame],s=pose.scale;
    c.save();c.globalAlpha=Math.max(0,1-(b.recall||0)/.28);
    if(b.grounded)this.ellipse(b.x,b.y+1,DREAM_PETS.grown(p)?22:15,4,'#53425c20');
    c.translate(b.x,b.y);c.scale(b.facing||1,1);
    // Feet, tail and scarf are drawn poses. No whole-image hopping or tilting.
    const land=r.settings.reducedMotion?0:Math.max(0,b.landSquash||0)/.18*.045;
    c.scale(1+land*.4,1-land);
    c.drawImage(im,...box,-pivot[0]*s,-pivot[1]*s,box[2]*s,box[3]*s);c.restore();
};
