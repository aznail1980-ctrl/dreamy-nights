'use strict';
/* Neck fittings are independent of cape/bag attachment pins. Distances are actor pixels.
   Side-view collar art follows the throat; attack is an action, not a camera direction. */
window.DREAM_SCARF = (() => {
    const offsets={
        ari:{idle:[-2,-4,15,-.08],walk:[-2,-4,15,0],run:[-1,-3,15,.12],jump:[-1,-3,15,.1],climb:[0,-2,16,0],dash:[-3,-3,15,.3],attack:[-3,-3,15,.18]},
        popo:{idle:[-2,-4,15,-.06],walk:[-2,-4,15,0],run:[-1,-3,15,.12],jump:[-1,-3,15,.1],climb:[0,-3,16,0],dash:[-4,-4,15,.3],attack:[-3,-3,15,.18]}
    };
    // Painted throat centers on each weapon-free charge/release source frame.
    const charge={ari:[[246,252],[754,303],[1252,276],[362,766],[866,780],[1275,723]],popo:[[278,252],[758,305],[1305,287],[343,742],[842,760],[1271,704]]};
    function fit(pose){
        const {who,kind,frame=0}=pose,o=offsets[who]?.[kind]||offsets[who].idle;
        let x=pose.pins.neck[0]+o[0],y=pose.pins.neck[1]+o[1],angle=o[3];
        if(pose.source==='charge'){
            const sheet=DREAM_ART_V44.sheets[who+'ChargeV44'],point=charge[who][frame],pivot=sheet.pivots[frame];
            x=(point[0]-pivot[0])*sheet.scale*sheet.flips[frame];y=(point[1]-pivot[1])*sheet.scale;angle=frame===3||frame===4?.3:0;
        }
        return {x,y,width:o[2],angle,view:kind==='climb'?2:0};
    }
    return {fit};
})();
DreamRenderer.prototype.scarf=function(id,pose,layer){
    const item=DREAM_WEAR.items[id];if(!item)return;
    const f=DREAM_SCARF.fit(pose),c=this.ctx;
    c.save();c.translate(f.x,f.y);c.rotate(f.angle);
    if(layer==='front'){
        // The upper/back rim sits behind the painted neck, chin and hair. Only the
        // front cloth and knot cross the body; never paste an open oval over the chest.
        c.beginPath();c.rect(-24,.45,48,40);c.clip();
    }
    this.wear(id,f.view,0,0,f.width/item.width,0);
    c.restore();
};
