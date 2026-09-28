'use strict';
/* Keep encounter IDs and crab loot compatibility when upgrading an existing save. */
(() => {
    const C = window.DREAM_CONTENT, m = C.maps[5];
    window.DREAM_ART_V49.files.tideBellCrabV414 = 'assets/tideBellCrabV414.png';
    m.sections = ['기다림의 물가', '메아리 연결교', '귀항의 종마루'];
    m.platforms = [
        {x:800,y:341,w:2400}, {x:3400,y:341,w:1720},
        {x:1500,y:31,w:1300}, {x:2980,y:31,w:1890}
    ];
    m.bridgeGaps = [{x:3200,y:341,w:200}, {x:2800,y:31,w:180}];
    m.bridgeX = 3300;
    m.ladders = [900,2400,3600,4900].map(x => ({x,top:341,bottom:651}))
        .concat([1700,2600,3700,4600].map(x => ({x,top:31,bottom:341})));
    const objects = {tideBell0:[1050,651],tideBell1:[2700,341],tideBell2:[3990,31],tideTreasure:[4790,341]};
    for (const o of C.objects.filter(o => o.map === 5)) {
        if (objects[o.id]) [o.x,o.y] = objects[o.id];
        C.onSurface(m,o,60);
    }
    const devices = {camp:[330,651],lift:[4800,651],cache:[4470,31],vent:[1300,651],switch:[3090,341]};
    for (const d of m.devices) {
        if (devices[d.kind]) [d.x,d.y] = devices[d.kind];
        if (d.kind === 'lift') Object.assign(d,{top:31,bottom:651});
    }
    m.decorations = [{kind:'signpost',x:680,y:651,width:75},{kind:'streetlamp',x:2920,y:341,width:83},{kind:'streetlamp',x:4190,y:31,width:83}];
    const homes = [[1770,651],[2180,341],[3450,31],[4360,651],[4530,341]];
    m.enemies.forEach((e,i) => {
        [e.x,e.y] = homes[i % homes.length];
        Object.assign(e,{floorY:e.y,type:'crab',variant:'tideBell',level:3,hpScale:1});
    });
    const q = C.quests.find(q => q.flag === 'tideAttuned');
    Object.assign(q,{targetX:1050,targetY:651,description:'물가의 낮은 종 → 종마루의 높은 종 → 연결교의 가운데 종 순서로 울려요.'});
})();
