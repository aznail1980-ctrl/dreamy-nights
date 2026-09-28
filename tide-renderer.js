'use strict';
(() => {
    const R = window.DreamRenderer.prototype, previousEnemy = R.enemy;
    // Art has different transparent margins per pose: align the feet, not the cell edges.
    const feet = [583,588,555,556], centers = [285,285,285,300];
    R.enemy = function(e) {
        if (e.variant !== 'tideBell') return previousEnemy.call(this,e);
        if (e.dead && e.fade <= 0) return;
        const c=this.ctx,r=this.r,im=this.images.tideBellCrabV414;
        const frame=e.hurt>0?3:e.windup>0?1:e.action==='strike'?2:0;
        const sc=.215, pulse=r.settings.reducedMotion?0:Math.sin(e.elapsed*3)*1.5;
        this.ellipse(e.x,e.floorY+3,36,5,'#456e8138');
        c.save();c.translate(e.x,e.y-pulse);c.scale(e.face||1,1);
        if(e.dead){const k=Math.max(0,e.fade/.55);c.globalAlpha=k;c.scale(.7+.3*k,.7+.3*k);}
        if(e.hurt>0)c.rotate(-Math.min(.12,e.hurt*.4));
        c.drawImage(im,(frame%2)*627,Math.floor(frame/2)*627,627,627,-centers[frame]*sc,-feet[frame]*sc,627*sc,627*sc);
        c.restore();
        if(e.dead)return;
        this.text('Lv. '+e.level+' · 조수종 소라게',e.x,e.y-128,12,'#fff4dc','center',650);
        if(e.hp<e.max){this.round(e.x-28,e.y-117,56,4,2,'#29485b88');this.round(e.x-28,e.y-117,56*e.hp/e.max,4,2,'#a4eadc');}
        if(e.windup>0){
            this.text('♪ 거품 준비',e.x,e.y-151,14,'#fff0a8','center',700);
            c.save();c.strokeStyle='#ffe8a6';c.lineWidth=3;c.setLineDash([7,7]);c.beginPath();
            c.moveTo(e.x+e.attackFace*55,e.floorY-6);c.lineTo(e.x+e.attackFace*300,e.floorY-6);c.stroke();c.restore();
        }
    };
})();
