'use strict';
/* Source-space landmarks for each painted pose. Resolve with the SAME sheet pivot
   and scale as the body; never smooth an attachment independently of its owner. */
window.DREAM_ATTACHMENTS = (() => {
    // head: hat-band center, visible head width, head tilt; bow: hair tie/bun.
    const motion = {
        ari: {
            head: [[296,122,164,.04],[683,131,160,.07],[1060,130,164,.10],[1451,121,155,-.04],[295,593,169,.08],[691,610,159,.02],[1050,618,161,.07],[1439,681,157,.16]],
            bow: [[259,117],[647,121],[1020,124],[1411,110],[252,586],[654,595],[1010,604],[1400,666]],
            back: [[246,278],[630,286],[1006,288],[1390,272],[254,729],[633,726],[1000,754],[1375,800]],
            lean: [.12,.18,.15,.20,.18,.28,.12,.42]
        },
        popo: {
            head: [[295,99,145,.02],[650,97,146,-.02],[1021,100,153,.06],[1405,98,141,0],[295,582,157,.04],[663,576,153,.01],[1025,598,147,.10],[1410,660,137,.17]],
            bow: [[220,101],[568,90],[941,93],[1316,100],[211,579],[583,570],[940,590],[1344,670]],
            back: [[225,260],[590,265],[954,262],[1343,252],[222,731],[585,724],[948,742],[1337,801]],
            lean: [.12,.16,.12,.20,.16,.28,.12,.4]
        }
    };
    // Band centers measured on the painted scalp (not the sprite's bounding box).
    // [x,y,width,head roll] in body-local units; walking/climbing really change each frame.
    const scalp = {
        ari: {
            idle: [7,-108,46,.24], attack: [-27,-101,47,.16],
            walk: [[13,-107,47,.23],[15,-108,47,.26],[15,-107,48,.27],[15,-107,46,.23],[16,-106,47,.25],[15,-106,47,.25]],
            climb: [[0,-105,48,-.07],[0,-107,47,.05],[2,-105,48,.07],[0,-107,48,-.04],[-1,-105,47,-.08],[1,-107,48,.04]],
            dash: [[26,-83,49,.40],[56,-80,50,.46],[41,-78,49,.44],[29,-77,48,.37]],
            charge: [[10,-103,48,.24],[22,-77,47,.32],[25,-89,47,.23],[33,-77,48,.39],[31,-74,46,.36],[17,-102,47,.24]]
        },
        popo: {
            idle: [10,-115,36,.26], attack: [5,-106,41,.27],
            walk: [[12,-114,42,.26],[13,-114,42,.28],[13,-113,43,.30],[14,-115,42,.25],[14,-114,42,.27],[13,-114,42,.26]],
            climb: [[0,-111,43,-.05],[-1,-112,44,.04],[1,-111,43,.06],[0,-112,44,-.03],[-1,-111,43,-.05],[0,-112,44,.04]],
            dash: [[31,-96,48,.39],[50,-94,49,.45],[45,-94,48,.42],[41,-94,47,.38]],
            charge: [[8,-102,42,.26],[19,-87,43,.34],[8,-91,43,.25],[29,-90,44,.39],[19,-83,43,.38],[12,-102,43,.27]]
        }
    };
    function point(v, sheet, frame) {
        const pivot=sheet.pivots[frame], flip=sheet.flips?.[frame]||1;
        return [(v[0]-pivot[0])*sheet.scale*flip,(v[1]-pivot[1])*sheet.scale];
    }
    function fit(pose) {
        const {who,kind,frame=0,pins}=pose, rear=kind==='climb';
        let head=[...pins.head],bow=[...pins.bow],angle=pins.angle||0;
        let scale=who==='ari'?.9:kind==='idle'?.88:1;
        let back=null,lean=kind==='dash'?.7:pose.source==='charge'&&[3,4].includes(frame)?.5:0;
        if(pose.source==='motion') {
            const sheet=DREAM_MOTION_ART.hero[who],data=motion[who],h=data.head[frame];
            head=point(h,sheet,frame);bow=point(data.bow[frame],sheet,frame);
            scale=h[2]*sheet.scale/42;head[0]+=who==='popo'?2:1;head[1]+=3;angle=h[3]+.22;back=point(data.back[frame],sheet,frame);lean=data.lean[frame];
        }
        else {
            const values=scalp[who][pose.source==='charge'?'charge':kind];
            const h=Array.isArray(values?.[0])?values[frame]:values;
            if(h){head=h.slice(0,2);scale=h[2]/42;angle=h[3];}
        }
        return {head,bow,scale,angle,back,lean,view:rear?2:0};
    }
    return {fit,point,motion,scalp};
})();
