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
            scale=h[2]*sheet.scale/42;angle=h[3];back=point(data.back[frame],sheet,frame);lean=data.lean[frame];
        }
        return {head,bow,scale,angle,back,lean,view:rear?2:0};
    }
    return {fit,point,motion};
})();
