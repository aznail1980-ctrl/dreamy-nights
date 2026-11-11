'use strict';
window.DREAM_COMBAT = (() => {
    const ranks={low:0,common:1,rare:2,unique:3};
    const colors={low:'#cfdae0',common:'#9aefdc',rare:'#d6b1ff',unique:'#ffdb84'};
    // v4.52: each attack kind gets its own effect sheet, sound and weight (hitstop·shake).
    // fx = assets/vfx-v452/<hero>-<fx>.webp, tier = how heavy the hit feels.
    const weights={
        light:{hitstop:.05,shake:3,life:.24},finisher:{hitstop:.085,shake:6.5,life:.32},
        charged1:{hitstop:.1,shake:8,life:.4},charged2:{hitstop:.14,shake:13,life:.52},
        plunge:{hitstop:.09,shake:7,life:.4},skill:{hitstop:.08,shake:6,life:.45},
        skill3:{hitstop:.1,shake:8.5,life:.5},burst:{hitstop:.12,shake:11,life:.7}
    };
    function stageOf(state,branch){
        const nodes=state.growth?.nodes||[];
        return nodes.includes(branch+'3')?3:nodes.includes(branch+'2')?2:1;
    }
    function profile(state,action='light',opts={}) {
        const gear=window.DREAM_GEAR?.equipped(state.rpg,'weapon');
        const item=DREAM_CONTENT.items[gear?.itemId||state.rpg.equipment?.weapon||'baton'];
        const branch=String(action).startsWith('skill-')?action.slice(6):'';
        const stage=opts.stage||(branch&&branch!=='base'?stageOf(state,branch):1);
        return fromWeapon({hero:state.active,grade:item?.grade,level:gear?.level,action,stage,charge:opts.charge});
    }
    function fromWeapon({hero='ari',grade='common',level=0,action='light',stage=1,charge=1}={}) {
        grade=Object.hasOwn(ranks,grade)?grade:'common';
        level=Math.max(0,Math.min(5,Math.floor(Number(level)||0)));
        stage=Math.max(1,Math.min(3,Math.floor(Number(stage)||1)));
        charge=Number(charge)===2?2:1;
        const base=action==='light-2'?'light':action==='skill'?'skill-base':action;
        const kind=base==='plunge'?'plunge':base==='charged'?'charged':'basic';
        let fx,tier;
        if(base==='charged'){fx='charged-'+charge;tier='charged'+charge;}
        else if(base==='finisher'){fx='finisher';tier='finisher';}
        else if(base==='plunge'){fx='plunge';tier='plunge';}
        else if(base==='burst'){fx='burst';tier='burst';}
        else if(base.startsWith('skill-')){
            const branch=base.slice(6);
            // The pre-branch wave reads as a first-stage attack star.
            fx='skill-'+(['attack','guard','control'].includes(branch)?branch:'attack')+'-'+(branch==='base'?1:stage);
            tier=stage===3?'skill3':'skill';
        }
        else {fx=action==='light-2'?'light-2':'light-1';tier='light';}
        return {hero:hero==='popo'?'popo':'ari',kind,action,grade,rank:ranks[grade],level,stage,charge,fx,tier,weight:weights[tier],
            color:colors[grade],size:1+ranks[grade]*.045+level*.018,
            rays:6+ranks[grade]*2+Math.floor(level/2)*2,rings:(kind==='basic'?0:1)+(ranks[grade]===3?1:0)+(level>=4?1:0),
            trail:2+ranks[grade]*.4+level*.22};
    }
    return {profile,fromWeapon,stageOf,weights};
})();
