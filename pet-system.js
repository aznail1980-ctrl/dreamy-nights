'use strict';
(() => {
    const species={
        tideOtter:{name:'물결수달',egg:'진주 물결 알',place:'첫잠 해변',nature:'다정하고 느긋한 바다 친구',help:'정화 다섯 번마다 마음 1 회복',color:'#86c9c5'},
        leafFox:{name:'새잎여우',egg:'새잎 꿈 알',place:'바람 숲',nature:'발견을 좋아하는 씩씩한 숲 친구',help:'정화 다섯 번마다 공명 6 충전',color:'#a6be8d'},
        glowNewt:{name:'별아가미',egg:'별빛 조개 알',place:'별물 수로',nature:'조용히 곁을 밝히는 호기심 많은 친구',help:'정화 다섯 번마다 꿈빛 잔해물 1 발견',color:'#b6a3dc'}
    };
    const num=(v,max)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
    const cleanName=v=>typeof v==='string'?Array.from(v.normalize('NFC').replace(/[<>\u0000-\u001f\u007f]/g,'').trim()).slice(0,12).join(''):'';
    const events=s=>['welcome',...((s.visited||[]).length>=6?['explorer']:[]),...(s.flags?.completed?['homecoming']:[])];
    const allowed=s=>!!(s.flags?.metLumen||s.flags?.completed);
    function initialize(s,raw){
        const src=raw?.pets,owned=[],seen=new Set();
        for(const p of Array.isArray(src?.owned)?src.owned:[]){
            if(!p||!Object.hasOwn(species,p.species)||seen.has(p.species))continue;
            seen.add(p.species);owned.push({species:p.species,name:cleanName(p.name)||species[p.species].name,xp:num(p.xp,60),affinity:num(p.affinity,100),assist:num(p.assist,4)});
        }
        const validMaps=DREAM_CONTENT.maps.map((_,i)=>i),validKills=new Set(DREAM_CONTENT.maps.flatMap(m=>m.enemies.map(e=>e.id)));
        const egg=src?.egg&&Object.hasOwn(species,src.egg.species)&&!seen.has(src.egg.species)?{species:src.egg.species,warmth:num(src.egg.warmth,8)}:null;
        const claims=[...new Set((Array.isArray(src?.claims)?src.claims:[]).filter(id=>['welcome','explorer','homecoming'].includes(id)))];
        // Recovered companions cannot be claimed a second time, even in a malformed save.
        for(const id of ['welcome','explorer','homecoming'])if(claims.length<owned.length+(egg?1:0)&&!claims.includes(id))claims.push(id);
        s.pets={version:1,owned,egg,claims,active:seen.has(src?.active)?src.active:null,
            visited:[...new Set((Array.isArray(src?.visited)?src.visited:[]).filter(i=>validMaps.includes(i)))],
            encounters:[...new Set((Array.isArray(src?.encounters)?src.encounters:[]).filter(id=>validKills.has(id)))]};
        return s;
    }
    const available=s=>allowed(s)&&!s.pets.egg?events(s).find(id=>!s.pets.claims.includes(id))||null:null;
    function choose(s,id,event){
        if(!Object.hasOwn(species,id)||s.pets.owned.some(p=>p.species===id)||available(s)!==event||!event)return false;
        s.pets.claims.push(event);s.pets.egg={species:id,warmth:0};return true;
    }
    const active=s=>s.pets?.owned.find(p=>p.species===s.pets.active)||null;
    function hatch(s,id){
        if(!s.pets.egg||s.pets.egg.species!==id||s.pets.egg.warmth<8||s.pets.owned.some(p=>p.species===id))return false;
        s.pets.owned.push({species:id,name:species[id].name,xp:0,affinity:10,assist:0});s.pets.egg=null;s.pets.active=id;return true;
    }
    function select(s,id){if(id!==null&&!s.pets.owned.some(p=>p.species===id))return false;s.pets.active=id;return true;}
    function rename(s,id,name){const p=s.pets.owned.find(p=>p.species===id),n=cleanName(name);if(!p||!n)return false;p.name=n;return true;}
    function feed(s,id,take){
        const p=s.pets.owned.find(p=>p.species===id),egg=id==='egg'?s.pets.egg:null;
        if(egg?egg.warmth>=8:!p||(p.xp>=60&&p.affinity>=100))return false;
        if(!take('cookie',1))return false;
        if(egg)egg.warmth=Math.min(8,egg.warmth+2);
        else{p.xp=Math.min(60,p.xp+4);p.affinity=Math.min(100,p.affinity+8);}
        return true;
    }
    function progress(s,kind,id){
        if(!s.pets.egg&&!active(s))return null;
        const list=kind==='map'?s.pets.visited:s.pets.encounters;
        const valid=kind==='map'?Number.isInteger(id)&&!!DREAM_CONTENT.maps[id]:kind==='enemy'&&DREAM_CONTENT.maps.some(m=>m.enemies.some(e=>e.id===id));
        if(!valid||list.includes(id))return null;list.push(id);
        const amount=kind==='map'?3:1;
        if(s.pets.egg)s.pets.egg.warmth=Math.min(8,s.pets.egg.warmth+amount);
        const p=active(s);if(!p)return null;
        p.xp=Math.min(60,p.xp+amount);p.affinity=Math.min(100,p.affinity+1);
        if(kind==='enemy'){p.assist++;if(p.assist>=5){p.assist=0;return p.species;}}
        return null;
    }
    window.DREAM_PETS={species,initialize,allowed,available,choose,active,hatch,select,rename,feed,progress,cleanName,level:p=>1+Math.floor(p.xp/15),grown:p=>p.xp>=24};
})();
