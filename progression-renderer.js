'use strict';
(() => {
    const R=DreamRenderer.prototype, actor=R.actor, draw=R.draw;
    R.actor=function(who,x,y,face=1,active=false){
        const r=this.r,p=r.player,v=p.skillVisual;
        if(!active||!v||p.hitT>0||p.dodgeT>0||p.climbing)return actor.call(this,who,x,y,face,active);
        this.r={...r,player:{...p,chargeHeld:v.id==='guard',chargeT:.6,chargeLevel:1,attackLength:.7,attackT:v.life+.1}};
        try{return actor.call(this,who,x,y,face,active);}finally{this.r=r;}
    };
    R.draw=function(r){
        draw.call(this,r);
        if(!['play','modal','dialogue'].includes(r.mode))return;
        const c=this.ctx,p=r.player,v=p.skillVisual;
        c.save();c.translate(-r.camera,-(r.cameraY||0));
        if(p.skillShield&&p.skillShieldT>0){
            c.strokeStyle='#a6efdc';c.fillStyle='#a6efdc15';c.lineWidth=2.5;c.beginPath();c.ellipse(p.x,p.y-68,48,78,0,0,Math.PI*2);c.fill();c.stroke();this.star(p.x,p.y-149,8,'#ddfff0');
        }
        for(const e of r.enemies)if(!e.dead&&e.growthSlow>0){c.strokeStyle='#ddc5ffb0';c.lineWidth=2;c.beginPath();c.ellipse(e.x,e.y-12,35,9,-.12,0,Math.PI*2);c.stroke();this.star(e.x-30,e.y-24,4,'#e4d0ff');}
        if(v&&v.id!=='guard'){
            const k=1-v.life/.55,spread=r.settings.reducedMotion?.65:k;
            c.globalAlpha=Math.max(0,1-k);c.strokeStyle=v.color;c.fillStyle=v.color;c.lineWidth=v.id==='attack'?4:2;
            if(v.id==='attack'&&v.hero==='ari'){
                const x=p.x+v.face*(45+spread*v.range);c.beginPath();c.moveTo(p.x,p.y-78);c.quadraticCurveTo(x,p.y-140,x,p.y-70);c.stroke();this.star(x,p.y-70,17,v.color,k);
                for(let i=1;i<4;i++)this.star(p.x+v.face*v.range*spread*i/4,p.y-76+Math.sin(i)*14,6,v.color);
            }else if(v.id==='attack'&&v.hero==='popo'){
                for(let i=0;i<2;i++){c.beginPath();c.ellipse(p.x,p.y-5,Math.max(3,spread*v.range-i*27),Math.max(3,spread*36-i*7),0,Math.PI,Math.PI*3);c.stroke();}
                for(let i=-2;i<=2;i++)this.star(p.x+i*spread*75,p.y-18-Math.abs(i%2)*25,9,v.color,k);
            }else if(v.id==='control'){
                for(let i=0;i<3;i++){c.beginPath();c.ellipse(p.x,p.y-45,35+spread*160,12+spread*30,i*.9,0,Math.PI*2);c.stroke();}
            }
        }
        c.restore();
    };
})();
