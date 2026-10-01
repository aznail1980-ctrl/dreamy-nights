'use strict';
window.DREAM_COMBAT = (() => {
    const ranks={low:0,common:1,rare:2,unique:3};
    const colors={low:'#cfdae0',common:'#9aefdc',rare:'#d6b1ff',unique:'#ffdb84'};
    function profile(state,action='light') {
        const gear=window.DREAM_GEAR?.equipped(state.rpg,'weapon');
        const item=DREAM_CONTENT.items[gear?.itemId||state.rpg.equipment?.weapon||'baton'];
        return fromWeapon({hero:state.active,grade:item?.grade,level:gear?.level,action});
    }
    function fromWeapon({hero='ari',grade='common',level=0,action='light'}={}) {
        grade=Object.hasOwn(ranks,grade)?grade:'common';
        level=Math.max(0,Math.min(5,Math.floor(Number(level)||0)));
        const kind=action==='plunge'?'plunge':action==='charged'?'charged':'basic';
        return {hero:hero==='popo'?'popo':'ari',kind,action,grade,rank:ranks[grade],level,
            color:colors[grade],size:1+ranks[grade]*.045+level*.018,
            rays:6+ranks[grade]*2+Math.floor(level/2)*2,rings:(kind==='basic'?0:1)+(ranks[grade]===3?1:0)+(level>=4?1:0),
            trail:2+ranks[grade]*.4+level*.22};
    }
    return {profile,fromWeapon};
})();
