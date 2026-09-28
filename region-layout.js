'use strict';
(() => {
    const C=window.DREAM_CONTENT;
    const layouts={
        6:{sections:['다시 심는 화단','풍향계 온실','소원이 머무는 꽃마루'],platforms:[[550,341,1100],[1900,341,1500],[3650,341,1150],[950,31,1750],[3000,31,1600]],lower:[700,1350,2050,3000,3800,4500],upper:[1100,2200,3200,4000],gaps:[[1650,341,250],[3400,341,250],[2700,31,300]],lift:4480,vent:1450,switch:1550,objects:{windVane0:[1150,341],windVane1:[3900,31],windVane2:[3250,651],gardenTreasure:[4450,341]}},
        8:{sections:['잊힌 책의 입구','편지 분류 회랑','첫 순찰 기록의 서가'],platforms:[[450,341,1500],[2120,341,2250],[850,31,2000],[3020,31,1430]],lower:[620,1600,2350,4100],upper:[1100,1750,2450,3300,4200],gaps:[[1950,341,170],[2850,31,170]],lift:4350,vent:730,switch:1850,objects:{archiveBook:[4000,31],archiveTreasure:[3500,341]}},
        9:{sections:['갈대가 잠든 저수로','수문 정비 연결교','귀항 신호의 수차대'],platforms:[[650,341,1200],[2050,341,1400],[3650,341,1360],[1150,31,1650],[3100,31,1790]],lower:[820,1600,2200,3100,3900,4780],upper:[1400,2400,3250,4100,4700],gaps:[[1850,341,200],[3450,341,200],[2800,31,300]],lift:4770,vent:1110,switch:3330,objects:{waterWheel:[4400,31]}}
    };
    for(const [index,l]of Object.entries(layouts)){
        const m=C.maps[index];m.sections=l.sections;
        m.platforms=l.platforms.map(([x,y,w])=>({x,y,w}));
        m.ladders=l.lower.map(x=>({x,top:341,bottom:651})).concat(l.upper.map(x=>({x,top:31,bottom:341})));
        m.bridgeGaps=l.gaps.map(([x,y,w])=>({x,y,w}));m.bridgeX=l.gaps[0][0]+l.gaps[0][2]/2;
        for(const o of C.objects.filter(o=>o.map===Number(index))){if(l.objects[o.id])[o.x,o.y]=l.objects[o.id];C.onSurface(m,o,65);}
        for(const e of m.enemies){C.onSurface(m,e,100);e.floorY=e.y;}
        for(const d of m.devices){
            if(d.kind==='lift')Object.assign(d,{x:l.lift,y:651,top:31,bottom:651});
            else if(d.kind==='vent')Object.assign(d,{x:l.vent,y:651});
            else if(d.kind==='switch')Object.assign(d,{x:l.switch,y:341});
            else C.onSurface(m,d,80);
        }
        if(m.memory){const p={x:m.memory.x,y:31};C.onSurface(m,p,60);Object.assign(m.memory,{x:p.x,y:p.y-60,floorY:p.y});}
        for(const q of C.quests)if(q.map===Number(index)&&q.targetX){const o=C.objects.find(o=>o.map===Number(index)&&['windVane','archiveBook','waterWheel'].includes(o.kind));if(o){q.targetX=o.x;q.targetY=o.y;}}
    }
    const propForMap={0:'shoreRope',1:'wishPlanter',2:'shoreRope',3:'archiveStack',5:'shoreRope',6:'wishPlanter',7:'archiveStack',8:'archiveStack',9:'canalReeds'};
    for(const [index,kind]of Object.entries(propForMap)){
        const m=C.maps[index];
        // Mission scenery follows its authored surfaces; avoid ladder mouths and story objects.
        if(layouts[index])m.decorations=[];
        const avoid=p=>m.ladders.some(l=>Math.abs(l.x-p.x)<110&&(l.top===p.y||l.bottom===p.y))||C.objects.some(o=>o.map===Number(index)&&o.y===p.y&&Math.abs(o.x-p.x)<145)||m.devices.some(d=>d.y===p.y&&Math.abs(d.x-p.x)<135);
        for(const [x,y]of [[m.width*.16,651],[m.width*.44,341],[m.width*.78,31]]){
            const p={kind,x:Math.round(x),y,width:kind==='archiveStack'?93:108};C.onSurface(m,p,85);
            if(!avoid(p))m.decorations.push(p);
        }
    }
})();
