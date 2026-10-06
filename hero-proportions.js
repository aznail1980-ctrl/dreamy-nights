'use strict';
/* v4.43: corrected Ari artwork and landmarks measured on the new paintings.
   Body, hat, scarf and weapon all resolve from the same pose and foot pivot. */
(() => {
    const A=DREAM_ART_V49,E=DREAM_EQUIPMENT,W=DREAM_WEAR,M=DREAM_MOTION_ART.hero.ari;
    Object.assign(A.files,{
        heroAriSprite:'assets/ariIdleV443.png',ariWalkV41:'assets/ariWalkV443.png',
        ariClimbV41:'assets/ariClimbV443.png',ariDashV49:'assets/ariDashV443.png',
        ariChargeV44:'assets/ariChargeV443.png',ariAttack:'assets/ariAttackV443.png',
        ariMotionV422:'assets/ariMotionV443.png',ari:'assets/ariPortraitV443.png'
    });
    const local=(p,pivot,scale,flip=1)=>[(p[0]-pivot[0])*scale*flip,(p[1]-pivot[1])*scale];
    const pin=(neck,head,bow,angle=0)=>({neck,head,bow,angle});
    const idlePoint=p=>local(p,[500,1411],132/1245,-1);
    W.anchors.ari.idle=pin(idlePoint([435,668]),idlePoint([450,350]),idlePoint([570,310]));
    E.hands.ari.idle=[...idlePoint([494,946]),.7];
    W.anchors.ari.attack=pin([-3,-65],[1,-98],[-12,-106],.18);

    const walking={
        neck:[[150,326],[540,327],[917,331],[142,955],[538,959],[922,960]],
        hand:[[264,400],[554,423],[1018,415],[258,1040],[575,1044],[1027,1042]],
        head:[[170,188],[559,188],[936,188],[167,809],[554,811],[930,812]],
        bow:[[234,147],[634,146],[1011,148],[235,775],[626,775],[1009,775]]
    };
    const walk=DREAM_ART_V41.motion.ariWalkV41;
    W.anchors.ari.walk=walk.frames.map((f,i)=>{
        const p=v=>local(v,[f.source[0]+f.anchorX,f.source[1]+f.anchorY],132/walk.height,-1);
        E.hands.ari.walk[i]=[...p(walking.hand[i]),.65];
        return pin(p(walking.neck[i]),p(walking.head[i]),p(walking.bow[i]));
    });
    const dash=A.sheets.ariDashV49;
    dash.frames=[[159,73,439,417],[899,56,522,434],[170,524,499,450],[928,535,407,442]];
    const dashNeck=[[484,299],[1284,310],[524,775],[1233,766]];
    const dashHead=[[505,173],[1325,188],[558,650],[1242,637]];
    const dashHand=[[307,353],[1074,333],[346,800],[1073,844]];
    dash.pins=dashNeck.map((v,i)=>{
        const p=v=>local(v,dash.pivots[i],dash.scale);
        E.hands.ari.dash[i]=[...p(dashHand[i]),.7];
        return pin(p(v),p(dashHead[i]),p([dashHead[i][0]-60,dashHead[i][1]-18]),.25);
    });
    const charge=DREAM_ART_V44.sheets.ariChargeV44;
    charge.frames=[[165,91,251,369],[687,136,254,324],[1176,100,262,359],[115,580,357,354],[641,608,299,325],[1211,545,234,401]];
    const chargeNeck=[[245,261],[756,310],[1248,288],[356,770],[860,789],[1272,738]];
    const chargeHead=[[255,158],[749,213],[1239,183],[366,682],[866,693],[1278,626]];
    charge.pins=chargeNeck.map((v,i)=>{
        const p=v=>local(v,charge.pivots[i],charge.scale,charge.flips[i]);
        return pin(p(v),p(chargeHead[i]),p([chargeHead[i][0]+(charge.flips[i]<0?43:-43),chargeHead[i][1]-10]),i===3||i===4?.25:0);
    });
    // The atlas keeps deliberate airborne feet in run/jump poses; do not ground every frame.
    M.frames=[[57,74,333,401],[449,76,290,400],[826,83,320,398],[1217,75,295,360],[72,544,306,420],[458,547,278,343],[832,551,284,415],[1211,578,297,379]];
    DREAM_MOTION_ART.sheets.ariMotionV422.frames=M.frames;
    M.pivots=M.pivots.map((p,i)=>[p[0],i<4?475:970]);
    const neck=[[282,233],[667,237],[1043,238],[1430,234],[282,695],[667,701],[1041,707],[1427,746]];
    const hand=[[344,264],[722,276],[1113,267],[1496,261],[360,703],[716,732],[1098,751],[1493,803]];
    const head=[[273,132,130,.04],[661,132,131,.07],[1044,145,130,.10],[1425,132,127,-.04],[273,600,129,.08],[660,610,130,.02],[1038,620,127,.07],[1426,650,128,.16]];
    const back=[[245,263],[620,277],[1003,275],[1383,264],[244,707],[622,709],[995,726],[1367,781]];
    M.pins=neck.map((v,i)=>{
        const p=v=>local(v,M.pivots[i],M.scale);
        M.hands[i]=[...p(hand[i]),.4];
        return pin(p(v),p(head[i]),p([head[i][0]-36,head[i][1]-4]),.08);
    });
    E.hands.ari.run=M.hands.slice(0,4);E.hands.ari.jump=M.hands;
    DREAM_ATTACHMENTS.motion.ari.head=head;
    DREAM_ATTACHMENTS.motion.ari.bow=head.map(v=>[v[0]-36,v[1]-4]);
    DREAM_ATTACHMENTS.motion.ari.back=back;
    Object.assign(DREAM_ATTACHMENTS.scalp.ari,{
        idle:[5.3,-110,36,.24],attack:[1,-96,39,.16],
        walk:walking.head.map((v,i)=>{const f=walk.frames[i],p=local(v,[f.source[0]+f.anchorX,f.source[1]+f.anchorY],132/walk.height,-1);return [...p,37,.24];}),
        climb:[[2,-106,36,-.07],[0,-104,36,.05],[1,-104,36,.07],[1,-109,36,-.04],[0,-107,36,-.08],[0,-107,36,.04]],
        dash:dashHead.map((v,i)=>[...local(v,dash.pivots[i],dash.scale),44,.38]),
        charge:chargeHead.map((v,i)=>[...local(v,charge.pivots[i],charge.scale,charge.flips[i]),43,.24])
    });
    const oldScarf=DREAM_SCARF.fit;
    DREAM_SCARF.fit=function(pose){
        const f=oldScarf(pose);
        if(pose.who==='ari'&&pose.source==='charge')return {...f,x:pose.pins.neck[0],y:pose.pins.neck[1]-3};
        return f;
    };
    Object.assign(DREAM_LOBBY_ART.ari,{
        file:'assets/ariLobbyV443.png',
        frames:[[143,37,317,443],[630,37,315,443],[1115,37,319,443],[137,525,325,450],[622,526,327,449]],
        pivots:[[281,479],[768,479],[1254,479],[282,974],[768,974]],
        // Same scale through expression changes; a short greeting cannot enlarge the head.
        referenceHeight:480
    });
    DREAM_EXPRESSION_FRAMES.ari.scale=.45;
    DREAM_EXPRESSION_FRAMES.ari.eyeY=148;
    window.DREAM_HERO_PROPORTIONS={version:'4.43.0',motion:M,files:{...A.files}};
})();
