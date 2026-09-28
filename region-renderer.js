'use strict';
(() => {
    const R=window.DreamRenderer.prototype,oldEnemy=R.enemy,oldItem=R.item,oldGround=R.groundArt;
    R.enemy=function(e){
        const d=this.C.regionCreatures[e.variant];if(!d)return oldEnemy.call(this,e);
        if(e.dead&&e.fade<=0)return;
        const spec=window.DREAM_REGION_ART[e.variant],im=this.images[e.variant+'V415'],c=this.ctx;
        const frame=e.hurt>0?3:e.windup>0?1:e.action==='strike'?2:0,b=spec.frames[frame],sc=d.size/spec.frames[0][3];
        const reduced=this.r.settings.reducedMotion,bob=reduced?0:Math.sin(e.elapsed*(e.variant==='windMoth'?6:3))*1.5;
        this.ellipse(e.x,e.floorY+3,30,5,'#45576430');
        c.save();c.translate(e.x,e.y-bob);c.scale(e.face||1,1);
        if(e.dead){const k=Math.max(0,e.fade/.55);c.globalAlpha=k;c.scale(.6+.4*k,.6+.4*k);}
        if(e.hurt>0)c.rotate(-Math.min(.12,e.hurt*.4));
        c.drawImage(im,...b,-b[2]*sc/2,-b[3]*sc,b[2]*sc,b[3]*sc);c.restore();
        if(e.dead)return;
        this.text('Lv. '+e.level+' · '+d.name,e.x,e.y-d.size-23,12,'#fff4dc','center',650);
        if(e.hp<e.max){this.round(e.x-28,e.y-d.size-12,56,4,2,'#33435988');this.round(e.x-28,e.y-d.size-12,56*e.hp/e.max,4,2,d.color);}
        if(e.windup>0){
            this.text('!',e.x,e.y-d.size-48,23,'#fff0a8','center',800);
            c.save();c.strokeStyle='#ffe4a5';c.lineWidth=2;c.setLineDash([8,8]);c.beginPath();c.moveTo(e.x+e.attackFace*40,e.floorY-4);c.lineTo(e.x+e.attackFace*Math.min(260,d.range),e.floorY-4);c.stroke();c.restore();
        }
    };
    R.item=function(icon,x,y,w,h=w,angle=0){
        const index=this.C.regionIcons[icon];if(index===undefined)return oldItem.call(this,icon,x,y,w,h,angle);
        const b=window.DREAM_REGION_ART.regionItems.frames[index],sc=Math.min(w/b[2],h/b[3]),c=this.ctx;
        c.save();c.translate(x,y);c.rotate(angle);c.drawImage(this.images.regionItemsV415,...b,-b[2]*sc/2,-b[3]*sc/2,b[2]*sc,b[3]*sc);c.restore();
    };
    R.groundArt=function(kind,x,y,width){
        const index=['shoreRope','wishPlanter','archiveStack','canalReeds'].indexOf(kind);
        if(index<0)return oldGround.call(this,kind,x,y,width);
        const b=window.DREAM_REGION_ART.regionProps.frames[index],h=width*b[3]/b[2];
        this.ctx.drawImage(this.images.regionPropsV415,...b,x-width/2,y-h,width,h);return h;
    };
})();
