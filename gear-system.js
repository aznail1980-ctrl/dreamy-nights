'use strict';
window.DREAM_GEAR = (() => {
    const C=window.DREAM_CONTENT,slots=['weapon','charm','keepsake'],costs=[4,8,14,22,32];
    const protectedItems=new Set(['baton','captainBadge']);
    const integer=(n,min,max)=>Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):min;
    const isGear=id=>C.items[id]?.type==='equipment'&&slots.includes(C.items[id].slot);
    const find=(r,uid)=>r.gear?.find(g=>g.uid===uid);
    function make(r,id,level=0,locked=false){
        let uid;do{uid='g'+r.gearNextId++;}while(find(r,uid));
        const g={uid,itemId:id,level,locked};r.gear.push(g);return g;
    }
    function sync(r){
        for(const id of Object.keys(C.items))if(isGear(id))delete r.inventory[id];
        for(const g of r.gear)r.inventory[g.itemId]=(r.inventory[g.itemId]||0)+1;
        for(const slot of slots){const g=find(r,r.equippedUids[slot]);r.equipment[slot]=g&&C.items[g.itemId].slot===slot?g.itemId:null;}
    }
    function initialize(r,source=null){
        const counts={...r.inventory},oldEquipment={...r.equipment};
        r.gear=[];r.equippedUids={};r.gearNextId=integer(source?.gearNextId,1,1000000000);r.gearVersion=1;
        r.fragments=integer(source?.fragments,0,100000000);
        const migrated=source?.gearVersion===1&&Array.isArray(source.gear);
        if(migrated){
            const seen=new Set(),perItem={};
            for(const raw of source.gear){
                if(!raw||!isGear(raw.itemId)||(perItem[raw.itemId]||0)>=999)continue;
                let uid=typeof raw.uid==='string'&&/^g[1-9][0-9]{0,11}$/.test(raw.uid)&&!seen.has(raw.uid)?raw.uid:null;
                if(!uid){do{uid='g'+r.gearNextId++;}while(seen.has(uid));}
                seen.add(uid);r.gearNextId=Math.max(r.gearNextId,Number(uid.slice(1))+1);
                r.gear.push({uid,itemId:raw.itemId,level:integer(raw.level,0,5),locked:raw.locked===true});perItem[raw.itemId]=(perItem[raw.itemId]||0)+1;
            }
        }else for(const [id,qty]of Object.entries(counts))if(isGear(id))for(let n=0;n<integer(qty,0,999);n++)make(r,id);
        if(!r.gear.some(g=>g.itemId==='baton'))make(r,'baton');
        for(const slot of slots){
            const saved=migrated?find(r,source.equippedUids?.[slot]):null;
            const candidate=saved&&C.items[saved.itemId].slot===slot?saved:r.gear.find(g=>g.itemId===oldEquipment[slot]&&C.items[g.itemId].slot===slot);
            r.equippedUids[slot]=candidate?.uid||null;
        }
        if(!r.equippedUids.weapon)r.equippedUids.weapon=r.gear.find(g=>g.itemId==='baton').uid;
        sync(r);
    }
    function equipped(r,slot){
        const g=find(r,r.equippedUids?.[slot]);
        return g?.itemId===r.equipment[slot]?g:r.gear?.find(x=>x.itemId===r.equipment[slot])||null;
    }
    function stats(g){
        const it=C.items[g?.itemId];if(!it)return {};
        const st={...it.stats},n=integer(g.level,0,5);
        if(it.slot==='weapon'){st.attack=(st.attack||0)+Math.ceil(n/2);st.skill=(st.skill||0)+Math.floor(n/2);}
        if(it.slot==='charm'){st.hp=(st.hp||0)+Math.ceil(n/2);st.skill=(st.skill||0)+Math.floor(n/2);}
        if(it.slot==='keepsake'){st.resonance=Math.round(((st.resonance||0)+n*.02)*1000)/1000;st.speed=Math.round(((st.speed||0)+n*.005)*1000)/1000;}
        return st;
    }
    function add(r,id,qty){if(!isGear(id))return false;const n=Math.min(integer(qty,0,999),999-(r.inventory[id]||0));for(let i=0;i<n;i++)make(r,id);sync(r);return n;}
    function equip(r,uid){const g=find(r,uid);if(!g)return false;r.equippedUids[C.items[g.itemId].slot]=uid;sync(r);return true;}
    function unequip(r,slot){if(slot==='weapon'||!slots.includes(slot))return false;r.equippedUids[slot]=null;sync(r);return true;}
    function protection(r,g){if(!g)return '장비를 찾을 수 없어요.';if(protectedItems.has(g.itemId))return '첫 도구와 이야기 기념품은 분해하지 않아요.';if(Object.values(r.equippedUids).includes(g.uid))return '장착 중인 장비예요.';if(g.locked)return '잠근 장비예요.';return '';}
    const invested=n=>costs.slice(0,n).reduce((a,b)=>a+b,0);
    const yieldOf=g=>({low:2,common:4,rare:9,unique:18}[C.items[g.itemId].grade]||2)+Math.floor(invested(g.level)/2);
    function quote(r,uids){
        if(!Array.isArray(uids)||!uids.length||new Set(uids).size!==uids.length)return {ok:false,reason:'분해할 장비를 선택해주세요.'};
        const list=uids.map(uid=>find(r,uid)),reason=list.map(g=>protection(r,g)).find(Boolean);
        if(reason)return {ok:false,reason};
        const reward=list.reduce((n,g)=>n+yieldOf(g),0);
        return {ok:true,uids:[...uids],reward,token:JSON.stringify(list.map(g=>[g.uid,g.itemId,g.level,g.locked]))};
    }
    function dismantle(r,review){
        const now=quote(r,review?.uids);if(!now.ok||now.token!==review.token||now.reward!==review.reward||r.fragments+now.reward>100000000)return false;
        const ids=new Set(now.uids);r.gear=r.gear.filter(g=>!ids.has(g.uid));r.fragments+=now.reward;sync(r);return true;
    }
    function upgrade(r,uid,expectedLevel){
        const g=find(r,uid);if(!g||g.level!==expectedLevel||g.level>=5||r.fragments<costs[g.level])return false;
        r.fragments-=costs[g.level];g.level++;return true;
    }
    const name=g=>g?C.items[g.itemId].name+(g.level?' +'+g.level:''):'장비 없음';
    return {initialize,sync,find,equipped,isGear,stats,add,equip,unequip,protection,quote,dismantle,upgrade,costs,yieldOf,name,maxLevel:5};
})();
