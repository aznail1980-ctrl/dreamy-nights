'use strict';
(() => {
    const R=DreamRenderer.prototype,E=DREAM_EQUIPMENT,oldCostume=R.costume,oldItem=R.item;
    R.costume=function(look,pose,layer,drawBody){
        oldCostume.call(this,look,pose,layer,drawBody);
        if(layer!=='front')return;
        const kind=pose.source==='charge'?'charge':pose.kind;
        const hands=E.hands[pose.who][kind],hand=Array.isArray(hands?.[0])?hands[pose.frame]:hands;
        const spec=E.weapons[pose.who],id=this.r.state.rpg.equipment?.weapon||'baton',idx=Math.max(0,E.ids.indexOf(id));
        const im=this.images[pose.who+'WeaponsV416'];if(!hand||!spec||!im)return;
        const box=spec.frames[idx],grip=spec.grips[idx],size=pose.who==='ari'?44:47,sc=size/box[3],c=this.ctx;
        c.save();c.translate(hand[0],hand[1]);c.rotate(hand[2]);
        c.drawImage(im,...box,(box[0]-grip[0])*sc,(box[1]-grip[1])*sc,box[2]*sc,box[3]*sc);c.restore();
        if(kind!=='climb'){
            // Reuse the actual painted fist above the handle, preserving its skin and line art.
            c.save();c.beginPath();c.ellipse(hand[0],hand[1],pose.who==='ari'?3.8:4.2,4.4,0,0,Math.PI*2);c.clip();drawBody();c.restore();
        }
    };
    R.item=function(icon,x,y,w,h=w,angle=0){
        if(!icon.startsWith('weapon-'))return oldItem.call(this,icon,x,y,w,h,angle);
        const who=this.r?.state?.active||'ari',spec=E.weapons[who],box=spec?.frames[Number(icon.slice(7))],im=this.images[who+'WeaponsV416'];
        if(!box||!im)return;const sc=Math.min(w/box[2],h/box[3]),c=this.ctx;
        c.save();c.translate(x,y);c.rotate(angle);c.drawImage(im,...box,-box[2]*sc/2,-box[3]*sc/2,box[2]*sc,box[3]*sc);c.restore();
    };
})();
