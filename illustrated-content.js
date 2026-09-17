'use strict';
(() => {
    const C = window.DREAM_CONTENT, G = 651;
    // One floor rule is shared by props, map markers and interaction coordinates.
    function onSurface(map, point, margin = 45) {
        if (point.y >= G - 3) { point.y = G; return point; }
        const surfaces = map.platforms.filter(p => Math.abs(p.y - point.y) < 3 && p.w >= margin * 2);
        const containing = surfaces.find(p => point.x >= p.x + margin && point.x <= p.x + p.w - margin);
        if (!containing && surfaces.length) {
            const best = surfaces.map(p => ({p, x: Math.max(p.x + margin, Math.min(p.x + p.w - margin, point.x))})).sort((a,b)=>Math.abs(a.x-point.x)-Math.abs(b.x-point.x))[0];
            point.x = best.x;
        }
        return point;
    }
    C.onSurface = onSurface;
    C.maps.forEach((map, i) => {
        for (const o of C.objects.filter(o => o.map === i)) onSurface(map, o, o.kind === 'waterWheel' ? 105 : 48);
        for (const d of map.devices) if (d.kind !== 'lift') onSurface(map, d, 55);
        if (map.memory) {
            const floor = {x:map.memory.x, y:31}; onSurface(map,floor,42);
            map.memory.x = floor.x; map.memory.floorY = floor.y; map.memory.y = floor.y - 60;
        }
        map.decorations = [];
        const blocked = x => C.exits[i].some(e=>Math.abs(e.x-x)<125)
            || map.ladders.some(l=>l.bottom===G&&Math.abs(l.x-x)<65)
            || C.objects.some(o=>o.map===i&&o.y===G&&Math.abs(o.x-x)<110)
            || map.devices.some(d=>d.y===G&&Math.abs(d.x-x)<105);
        for(let x=670;x<map.width-250;x+=810){
            if (!blocked(x)) map.decorations.push({kind:'streetlamp',x,y:G,width:95});
            if (['trail','garden'].includes(map.theme) && !blocked(x+150)) map.decorations.push({kind:'planter',x:x+150,y:G,width:88});
            if (['alley','archive','boss'].includes(map.theme) && !blocked(x+160)) map.decorations.push({kind:'crate',x:x+160,y:G,width:84,stack:map.theme==='alley'});
        }
    });
    const town=C.maps[2], n=C.npcs;
    town.buildings=[
        {kind:'bakery',x:n.madeleine.home-45,y:G,width:280},
        {kind:'cottage',x:n.lumen.home-50,y:G,width:280},
        {kind:'postoffice',x:n.post.home-40,y:G,width:310},
        {kind:'cottage',x:town.width-440,y:G,width:275}
    ];
    town.decorations = [
        {kind:'planter',x:n.madeleine.home-265,y:G,width:81},
        {kind:'bench',x:n.madeleine.home+195,y:G,width:136},
        {kind:'streetlamp',x:n.madeleine.home+318,y:G,width:95},
        {kind:'planter',x:n.lumen.home+180,y:G,width:74},
        {kind:'bollard',x:180,y:G,width:60},
        {kind:'mailbox',x:n.post.home-210,y:G,width:83},
        {kind:'planter',x:n.post.home+180,y:G,width:75},
        {kind:'streetlamp',x:n.post.home+300,y:G,width:95},
        {kind:'signpost',x:town.width-730,y:G,width:89}
    ];
    // Small rooftop gardens sit on traversable ledges and never on a ladder mouth.
    for(const platform of town.platforms.filter(p=>p.y===341&&p.w>300)){
        const point={kind:'planter',x:platform.x+75,y:platform.y,width:60};
        if(!town.ladders.some(l=>Math.abs(l.x-point.x)<85))town.decorations.push(point);
    }
    // A relocated objective continues to point at its actual object, not an old constant.
    for(const q of C.quests){
        const id={tideAttuned:'tideBell0',windAttuned:'windVane0',starChartRead:'starChart',archiveRead:'archiveBook',bridgeOpened:'waterWheel',completed:'dreamBell'}[q.flag];
        const o=C.objects.find(o=>o.id===id);
        if(o){q.targetX=o.x;q.targetY=o.y;}
    }
})();
