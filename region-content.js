'use strict';
(() => {
    const C=window.DREAM_CONTENT;
    C.regionCreatures={
        shoreSnail:{name:'진주등 달팽이',map:0,type:'sand',material:'pearlChip',size:91,pattern:'rush',speed:250,duration:.55,warning:1.2,range:240,color:'#f5d4ad',lore:'잃어버린 모래성의 조개 장식을 등에 모아 둔 어둑이.',hint:'껍데기를 낮추면 짧게 미끄러져요. 점프 후 빈틈을 노려요.'},
        windMoth:{name:'소원잎 나방',map:1,type:'crab',material:'wishWing',size:91,pattern:'fan',warning:1.1,range:330,color:'#bee8c7',lore:'산책길에 남겨진 소원 쪽지가 잎날개를 얻었어요.',hint:'날개를 접은 뒤 느린 바람 두 줄기를 보내요.'},
        parcelBat:{name:'리본꾸러미',map:3,type:'box',material:'parcelRibbon',size:92,pattern:'hop',speed:210,duration:.6,warning:1.05,range:245,color:'#edb6ac',lore:'수취인을 기다리던 꾸러미가 리본 날개를 펼쳤어요.',hint:'몸을 웅크린 뒤 짧게 폴짝! 착지하면 잠시 쉬어요.'},
        gardenBud:{name:'장미씨 고슴이',map:6,type:'sand',material:'roseSeed',size:92,pattern:'seed',warning:1.2,range:340,color:'#f2bacc',lore:'실수로 꺾인 꽃을 다시 피우고 싶은 정원의 걱정이에요.',hint:'꽃봉오리가 열리면 씨앗 한 알이 포물선을 그려요.'},
        inkMimic:{name:'잉크병 서기',map:8,type:'box',material:'inkPearl',size:99,pattern:'double',warning:1.3,range:350,color:'#c1b8ec',lore:'미처 쓰지 못한 순찰 기록이 잉크병 안에 모였어요.',hint:'깃펜을 든 뒤 잉크를 두 번 보내요. 두 번째까지 보고 다가가요.'},
        waterOtter:{name:'물레잠 수달',map:9,type:'crab',material:'waterCog',size:96,pattern:'wake',speed:300,duration:.48,warning:1.15,range:265,color:'#b4e2df',lore:'멈춘 수차 옆에서 귀항하는 배를 기다리다 잠들었어요.',hint:'꼬리를 세우면 짧게 돌진하고 물방울 하나를 남겨요.'}
    };
    for(const id of [...Object.keys(C.regionCreatures),'regionItems','regionProps'])window.DREAM_ART_V49.files[id+'V415']='assets/'+id+'V415.png';
    const materials=[['pearlChip','진주빛 조각','바닷바람 과자 · 조개 귀환 브로치'],['wishWing','소원잎 날개','꽃꿀 차 · 장미 소원 매듭'],['parcelRibbon','귀항 리본실','장미 소원 매듭'],['roseSeed','다시피움 씨앗','꽃꿀 차 · 장미 소원 매듭'],['inkPearl','기억 잉크알','첫항로 등불'],['waterCog','작은 수차 톱니','물길 찰떡 · 첫항로 등불']];
    C.regionIcons={};
    materials.forEach(([id,name,effect],i)=>{
        C.regionIcons[id]=i;
        C.items[id]={name,icon:id,type:'material',grade:'common',rarity:'지역 재료',lore:Object.values(C.regionCreatures).find(c=>c.material===id).lore,effect:'항구 공방에서 '+effect+' 제작'};
    });
    const items=[
        ['shoreBiscuit','바닷바람 과자',{type:'supply',heal:4},'마음 4 회복','조개빛 기억을 곱게 빻아 구운 마들렌의 해안 간식.'],
        ['bloomTea','꽃꿀 차',{type:'supply',heal:2,resonance:35},'마음 2 회복 · 공명 +35','다시 피운 꽃의 향과 숲의 소원을 천천히 우린 차.'],
        ['canalCake','물길 찰떡',{type:'supply',heal:3,shield:1},'마음 3 회복 · 다음 피격 1회 보호','수차로 빻은 곡물의 기억을 갈대잎에 싸서 쪄냈다.'],
        ['returnBrooch','조개 귀환 브로치',{type:'equipment',slot:'charm',stats:{hp:2}},'최대 마음 +2','무사히 돌아오라는 항구의 약속을 조개에 새겼다.'],
        ['wishKnot','장미 소원 매듭',{type:'equipment',slot:'keepsake',stats:{resonance:.2,speed:.04}},'공명 획득 +20% · 이동 속도 +4%','실패한 소원도 다시 묶을 수 있다는 작은 표식.'],
        ['routeLantern','첫항로 등불',{type:'equipment',slot:'keepsake',stats:{skill:2,dodge:.12}},'꿈빛 파동 +2 · 대시 대기 -0.12초','지하 물길과 잊힌 기록이 함께 밝혀주는 귀갓길.']
    ];
    items.forEach(([id,name,data,effect,lore],i)=>{C.regionIcons[id]=i+6;C.items[id]={name,icon:id,grade:i<3?'common':'rare',rarity:i<3?'지역 간식':'지역 기념품',lore,effect,...data};});
    C.regionRecipes=[
        {id:'shoreBiscuit',cost:{pearlChip:2,moonFlour:1}},
        {id:'bloomTea',cost:{wishWing:1,roseSeed:1}},
        {id:'canalCake',cost:{waterCog:1,seaGlass:1}},
        {id:'returnBrooch',cost:{pearlChip:3,seaGlass:2}},
        {id:'wishKnot',cost:{wishWing:2,parcelRibbon:2,roseSeed:2}},
        {id:'routeLantern',cost:{inkPearl:2,waterCog:2,seaGlass:2}}
    ];
    const rosters={0:['shoreSnail','windMoth','shoreSnail'],1:['windMoth','gardenBud','windMoth'],3:['parcelBat','inkMimic','parcelBat'],5:['shoreSnail','waterOtter','tideBell'],6:['gardenBud','windMoth','gardenBud'],8:['inkMimic','parcelBat','inkMimic'],9:['waterOtter','tideBell','waterOtter']};
    for(const [index,roster]of Object.entries(rosters)){
        const m=C.maps[index];let n=0;
        for(const e of m.enemies){
            // Preserve original main-story guardians and every saved encounter ID.
            if(!e.wild&&Number(index)<5)continue;
            if(!e.wild&&Number(index)===5)continue;
            const variant=roster[n++%roster.length],def=C.regionCreatures[variant];
            e.variant=variant;if(def)e.type=def.type;
            if(variant==='tideBell')e.type='crab';
            e.level=Math.min(6,Math.max(1,e.level||1));
            e.hpScale=1+(e.level-1)*.035;
        }
    }
    const originalDrops=C.rollDrops;
    C.rollDrops=(enemy,map,rng=Math.random)=>{
        const result=originalDrops(enemy,map,rng),def=C.regionCreatures[enemy.variant];
        // Regional ingredients are a separate roll; story clues retain their guaranteed rule.
        if(def&&rng()<Math.min(.9,.62+(enemy.level||1)*.035))result.push([def.material,1]);
        return result;
    };
})();
