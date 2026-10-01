'use strict';
(() => {
    const E=window.DREAM_EQUIPMENT,C=window.DREAM_CONTENT,W=window.DREAM_WEAR;
    const point=(x,y,px,py,s,flip=1)=>[(x-px)*s*flip,(y-py)*s];
    const pin=(neck,head,angle=0)=>({neck,head,bow:[head[0]-8,head[1]+9],angle});
    // Coordinates belong to the weapon-free source art, before the actor's world transform.
    const idle={ari:{neck:[404,789],head:[415,337],hand:[466,1062],pivot:[500,1411],scale:132/1245},popo:{neck:[470,604],head:[530,240],hand:[591,965],pivot:[560,1477],scale:132/1397}};
    for(const who of ['ari','popo']){
        const d=idle[who],p=v=>point(...v,...d.pivot,d.scale,-1);
        W.anchors[who].idle=pin(p(d.neck),p(d.head));E.hands[who].idle=[...p(d.hand),who==='ari'?.7:-2.3];
    }
    const walks={
        ari:{hand:[[246,423],[535,441],[979,435],[246,1077],[548,1075],[994,1085]],neck:[[155,354],[551,352],[929,354],[159,998],[553,994],[938,1001]],head:[[176,166],[570,166],[944,170],[177,807],[572,805],[949,812]]},
        popo:{hand:[[320,337],[820,350],[1340,340],[313,842],[815,855],[1338,851]],neck:[[221,237],[735,239],[1232,240],[223,739],[734,748],[1238,745]],head:[[253,100],[755,100],[1252,105],[253,606],[756,615],[1260,609]]}
    };
    for(const who of ['ari','popo']){
        const d=walks[who],sheet=DREAM_ART_V41.motion[who+'WalkV41'];
        E.hands[who].walk=[];W.anchors[who].walk=sheet.frames.map((f,i)=>{
            const p=v=>point(v[0]-f.source[0],v[1]-f.source[1],f.anchorX,f.anchorY,132/sheet.height,-1);
            E.hands[who].walk.push([...p(d.hand[i]),who==='ari'?.65:-2.2]);return pin(p(d.neck[i]),p(d.head[i]));
        });
        E.hands[who].climb=[-15,-38,-.5];
    }
    const dash={
        ari:{hand:[[309,363],[1074,339],[347,804],[1075,846]],neck:[[482,317],[1279,329],[522,789],[1229,790]],head:[[518,178],[1310,191],[567,653],[1268,653]]},
        popo:{hand:[[252,351],[1013,327],[310,789],[1066,817]],neck:[[422,302],[1220,304],[510,786],[1280,784]],head:[[454,181],[1262,184],[548,666],[1313,666]]}
    };
    const charge={
        ari:{hand:[[180,310],[819,279],[1289,163],[448,797],[905,853],[1245,839]],neck:[[242,281],[745,316],[1245,294],[349,780],[865,792],[1270,735]],head:[[216,159],[719,216],[1239,171],[366,675],[870,695],[1258,620]]},
        popo:{hand:[[224,354],[838,249],[1283,161],[450,797],[890,850],[1240,820]],neck:[[249,282],[737,315],[1290,292],[320,753],[825,773],[1260,723]],head:[[230,181],[733,220],[1256,205],[350,669],[865,680],[1241,624]]}
    };
    for(const [kind,data,art,suffix]of [['dash',dash,DREAM_ART_V49,'DashV49'],['charge',charge,DREAM_ART_V44,'ChargeV44']])for(const who of ['ari','popo']){
        const d=data[who],sheet=art.sheets[who+suffix];E.hands[who][kind]=[];
        sheet.pins=sheet.pivots.map((pivot,i)=>{
            const p=v=>point(...v,...pivot,sheet.scale,sheet.flips?.[i]||1);
            E.hands[who][kind].push([...p(d.hand[i]),kind==='dash'?-1.25:[.4,-.65,-.1,1.35,2.05,.4][i]]);
            return pin(p(d.neck[i]),p(d.head[i]),kind==='dash'?.2:i===3||i===4?.2:0);
        });
    }
    E.hands.ari.attack=[28,-38,1.1];E.hands.popo.attack=[35,-43,1.1];
    W.anchors.ari.attack=pin([8,-66],[5,-107],.18);
    W.anchors.popo.attack=pin([5,-72],[6,-112],.18);
    const previousSync=C.syncHeroItems;
    C.syncHeroItems=who=>{
        previousSync?.(who);
        E.ids.forEach((id,i)=>C.items[id].icon='weapon-'+i);
        C.items.baton.name=who==='popo'?'별나무 꿈망치':'첫 별빛 지팡이';
        C.items.stellarBaton.name=who==='popo'?'찬란한 꿈망치':'찬란한 별빛 지팡이';
    };
    C.syncHeroItems('ari');
    E.icon=(kind,who,size=34)=>{
        const i=Number(kind.slice(7)),spec=E.weapons[who];if(!kind.startsWith('weapon-')||!spec?.frames[i])return null;
        return `<svg class="item-art" width="${size}" height="${size}" viewBox="${spec.frames[i].join(' ')}" aria-hidden="true"><image href="assets/${who}WeaponsV416.webp" width="1536" height="1024"/></svg>`;
    };
})();
