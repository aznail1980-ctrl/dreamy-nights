'use strict';
(() => {
    // Phase advances from ground actually covered, not time or requested velocity.
    function tick(body,pet,dt,distance,wasGrounded){
        const art=DREAM_PET_MOTION_ART[pet.species]||DREAM_PET_MOTION_ART.leafFox;
        const grown=DREAM_PETS.grown(pet),speed=distance/Math.max(dt,.001);
        if(body.motionSpecies!==pet.species||body.motionGrown!==grown){
            body.walkPhase=0;body.idleTime=0;body.moving=false;
            body.motionSpecies=pet.species;body.motionGrown=grown;
        }
        body.moving=body.grounded&&wasGrounded&&body.recall<=0&&speed>(body.moving?5:12);
        if(body.moving){
            body.walkPhase=((body.walkPhase||0)+distance/art.stride[grown?1:0])%1;
            body.idleTime=0;
        }else body.idleTime=(body.idleTime||0)+dt;
    }
    function pose(pet,body,reducedMotion=false){
        const art=DREAM_PET_MOTION_ART[pet.species],grown=DREAM_PETS.grown(pet),offset=grown?8:0;
        let frame,kind;
        if(!body.grounded){frame=6;kind='jump';}
        else if(body.moving){frame=Math.floor((body.walkPhase||0)*4)%4;kind='walk';}
        else if(body.happy>0){frame=7;kind='happy';}
        else{const blink=!reducedMotion&&(body.idleTime||0)%art.blink>art.blink-.14;frame=blink?5:4;kind=blink?'blink':'idle';}
        return {art,frame:frame+offset,kind,scale:(grown?59:43)/art.heights[grown?1:0]};
    }
    window.DREAM_PET_MOTION={tick,pose};
})();
