'use strict';
window.createDreamRPG = function (api) {
    const G = window.DREAM_GEAR;
    const C = window.DREAM_CONTENT, $ = id => document.getElementById(id), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const labels = { equipment: '장비', supply: '소모품', material: '재료', story: '이야기', costume: '꾸미기' }, slots = { weapon: '정화 도구', charm: '가슴 장식', keepsake: '기억 부적' };
    const extraFlags = ['cookedFirst', 'letterRead', 'readyForBoss', 'journalReturned', 'herbsDelivered', 'replyDelivered', 'beaconsRewarded', 'metBaker', 'metPost', 'bakerGift', 'bossRecovered', 'ovenInvitationRead', 'ovenParcelPacked', 'ovenRouteReady'];
    let selectedGearUid = '', bagSlot = 'all', bagMessage = '', bagUpgradeOpen = false;
    let selection = 'baton', bagTab = 'equipment', bagGrade = 'all', mini = null, loot = [], comboTime = 0, combo = 0;
    const state = () => api.state, own = id => state()?.rpg.inventory[id] || 0;
    const regionUI=window.createDreamRegionUI({C,api,state,own,add,take,icon,bag});
    const equipmentUI=window.createDreamEquipmentUI({C,api,state,stats,icon,bag});
    const gearUI=window.createDreamGearUI({C,G,api,state,icon,bag,details:equipmentUI.details});
    const petUI=window.createDreamPetUI({api,state,own,take,details:equipmentUI.details});
    function initialize(s) {
        extraFlags.forEach(f => s.flags[f] = false);
        s.version = 2;
        s.rpg = { inventory: { baton: 1, rookieBadge: 1, cookie: 3 }, equipment: { weapon: 'baton', charm: 'rookieBadge', keepsake: null }, accepted: [], gathered: [], opened: [], beacons: [], resonance: 0, protection: 0, stats: { hits: 0, bestCombo: 0, perfectDodges: 0, cooked: 0 } };
        G.initialize(s.rpg);
        DREAM_PETS.initialize(s);
        return s;
    }
    function migrate(s, raw) {
        const r = s.rpg, source = raw.rpg;
        if (raw.version === 1 || !source) {
            r.inventory.cookie = Math.round(s.snacks);
            for (const e of C.maps.flatMap(m => m.enemies)) {
                if (!s.killed.includes(e.id))
                    continue;
                for (const [id, n] of drops(e.type))
                    r.inventory[id] = (r.inventory[id] || 0) + n;
            }
            s.claimed = s.claimed.map(i => [0, 1, 2, 4, 7, 9][i]).filter(Number.isInteger);
            if (s.flags.metLumen) {
                r.inventory.compass = 1;
                r.accepted.push('beacons');
            }
            if (s.flags.completed) {
                for (const f of ['cookedFirst', 'letterRead', 'readyForBoss', 'journalReturned', 'bossRecovered'])
                    s.flags[f] = true;
                Object.assign(r.inventory, { oldLetter: 1, warehouseKey: 1, oldJournal: 1, captainBadge: 1 });
            }
            else if (s.killed.includes('boss1')) {
                s.flags.bossRecovered = true;
                r.inventory.oldJournal = 1;
            }
        }
        else {
            if (source.inventory && typeof source.inventory === 'object') {
                r.inventory = {};
                for (const id of Object.keys(C.items)) {
                    const qty = source.inventory[id];
                    if (Number.isFinite(qty) && qty > 0)
                        r.inventory[id] = clamp(Math.floor(qty), 0, 999);
                }
            }
            if (!r.inventory.baton)
                r.inventory.baton = 1;
            for (const slot of Object.keys(slots)) {
                const id = source.equipment?.[slot];
                r.equipment[slot] = typeof id === 'string' && C.items[id]?.slot === slot && r.inventory[id] > 0 ? id : null;
            }
            if (!r.equipment.weapon)
                r.equipment.weapon = 'baton';
            for (const [key, valid] of [['accepted', Object.keys(C.sideQuests)], ['gathered', C.objects.filter(o => o.kind === 'herb').map(o => o.id)], ['opened', C.objects.filter(o => o.kind === 'chest').map(o => o.id)], ['beacons', C.objects.filter(o => o.kind === 'beacon').map(o => o.id)]])
                if (Array.isArray(source[key]))
                    r[key] = [...new Set(source[key].filter(id => valid.includes(id)))];
            for (const key of ['resonance', 'protection'])
                if (Number.isFinite(source[key]))
                    r[key] = clamp(source[key], 0, key === 'resonance' ? 100 : 1);
            for (const key of Object.keys(r.stats))
                if (Number.isFinite(source.stats?.[key]))
                    r.stats[key] = clamp(Math.floor(source.stats[key]), 0, 999999);
            for (const f of extraFlags)
                s.flags[f] = raw.flags?.[f] === true;
        }
        let bridgeValid=s.flags.completed;
        for(const step of C.chapterBridge?.steps||[]){s.flags[step.flag]=!!(bridgeValid&&s.flags[step.flag]);bridgeValid=s.flags[step.flag];}
        G.initialize(r,source);
        DREAM_PETS.initialize(s,raw);
        s.snacks = r.inventory.cookie || 0;
        return s;
    }
    function stats() {
        const r = state()?.rpg;
        let result = { attack: 0, skill: 0, hp: 0, speed: 0, dodge: 0, resonance: 0 };
        if (r)
            for (const id of Object.values(r.equipment)) {
                if (!id || !r.inventory[id])
                    continue;
                for (const [k, v] of Object.entries(G.stats(G.equipped(r,C.items[id].slot)||{itemId:id,level:0})))
                    result[k] += v;
            }
        return result;
    }
    function add(id, qty = 1, notify = true) {
        if (!C.items[id] || qty <= 0)
            return;
        const r = state().rpg;
        if(G.isGear(id))G.add(r,id,qty);
        else r.inventory[id] = clamp(own(id) + qty, 0, 999);
        if (id === 'cookie')
            state().snacks = r.inventory[id];
        if (notify)
            api.toast(C.items[id].name + ' ×' + qty + ' · 가방에 담았어요');
    }
    function take(id, qty) {
        if (G.isGear(id) || !Number.isInteger(qty) || qty <= 0 || own(id) < qty)
            return false;
        state().rpg.inventory[id] -= qty;
        if (state().rpg.inventory[id] === 0)
            delete state().rpg.inventory[id];
        if (id === 'cookie')
            state().snacks = own(id);
        return true;
    }
    function icon(kind, size = 34) {
        const weaponIcon=window.DREAM_EQUIPMENT.icon(kind,state()?.active||'ari',size);
        if(weaponIcon)return weaponIcon;
        const regionIndex=C.regionIcons?.[kind];
        if(regionIndex!==undefined){
            const spec=window.DREAM_REGION_ART.regionItems,b=spec.frames[regionIndex];
            return `<svg class="item-art" width="${size}" height="${size}" viewBox="${b.join(' ')}" aria-hidden="true"><image href="assets/regionItemsV415.png" width="${spec.size[0]}" height="${spec.size[1]}"/></svg>`;
        }
        const wearable = window.DREAM_WEAR.icons[kind];
        if (wearable) {
            const asset = window.DREAM_WEAR.items[wearable].asset, spec = window.DREAM_WEAR.assets[asset], b = spec.frames[1];
            return `<svg class="item-art" width="${size}" height="${size}" viewBox="${b.join(' ')}" aria-hidden="true"><image href="assets/${asset}.webp" width="${spec.size[0]}" height="${spec.size[1]}"/></svg>`;
        }
        const aliases = { star: 'dust', wing: 'cape' };
        kind = aliases[kind] || kind;
        return `<img class="item-art" src="assets/item-${kind}.webp" width="${size}" height="${size}" alt="" loading="lazy">`;
    }
    function bag(tab = bagTab, id = selection, grade = bagGrade, slot = bagSlot) {
        if (api.mode === 'modal' && api.modalKind === 'bag' && tab === 'toggle') { api.closeModal(); return; }
        if (api.mode !== 'play' && !(api.mode === 'modal' && ['bag','characterDetail','regionGuide','regionWorkshop','wardrobe','gearWorkshop','gearConfirm'].includes(api.modalKind))) return;
        if (['toggle','all'].includes(tab)) { tab='equipment'; grade='all'; slot='all'; }
        if (tab==='story') tab='material';
        if (tab!==bagTab) { slot=arguments.length<4?'all':slot; bagMessage=''; bagUpgradeOpen=false; }
        bagSlot=tab==='equipment'&&Object.hasOwn(slots,slot)?slot:'all';bagTab=tab;bagGrade=grade;
        const matches=type=>tab==='material'?['material','story'].includes(type):type===tab;
        const ids=Object.keys(C.items).filter(k=>own(k)>0&&matches(C.items[k].type)&&(grade==='all'||C.items[k].grade===grade)&&(bagSlot==='all'||C.items[k].slot===bagSlot));
        // After the last snack, keep the empty result visible; do not silently select another food.
        if(!ids.includes(id)&&!(id===selection&&C.items[id]?.type==='supply'&&bagMessage))id=ids[0]||null;
        if(id!==selection){bagMessage='';bagUpgradeOpen=false;}selection=id;
        const copies=state().rpg.gear.filter(g=>g.itemId===id);
        const chosen=copies.find(g=>g.uid===selectedGearUid)||copies.find(g=>Object.values(state().rpg.equippedUids).includes(g.uid))||[...copies].sort((a,b)=>b.level-a.level)[0];
        selectedGearUid=chosen?.uid||'';
        const it=C.items[id],equipped=chosen&&Object.values(state().rpg.equippedUids).includes(chosen.uid);
        const html=window.DREAM_BAG_VIEW({C,G,icon,s:state(),own,tab,id,ids,grade,slot:bagSlot,slots,chosen,copies,equipped,stats:stats(),maxHP:api.maxHP(),level:api.level(),summary:equipmentUI.summary,comparison:equipmentUI.comparison,notice:bagMessage,upgradeOpen:bagUpgradeOpen});
        api.openModal('bag','내 가방',html,'먼저 물건을 고르고, 하고 싶은 일을 눌러요');
        const reveal=()=>window.DreamKit?.detail(true,`[data-item="${id}"]`);
        const redraw=()=>{bag(tab,id);reveal();};
        const changed=message=>{bagMessage=message;api.save();api.refresh();api.sound('stamp');redraw();};
        $('bagListBack').onclick=()=>window.DreamKit?.detail(false);
        $('bagGrade').onchange=e=>{bagMessage='';bagUpgradeOpen=false;bag(tab,null,e.target.value);};
        if($('bagSlot'))$('bagSlot').onchange=e=>{bagMessage='';bagUpgradeOpen=false;bag(tab,null,grade,e.target.value);};
        $('bagDetails').onclick=equipmentUI.details;
        $('gearWorkshop').onclick=()=>gearUI.open(chosen?.uid,'dismantle');
        $('dropGuide').onclick=dropGuide;$('regionGuide').onclick=regionUI.guide;
        if($('materialRecipes'))$('materialRecipes').onclick=regionUI.workshop;
        if($('gearCopy'))$('gearCopy').onchange=e=>{selectedGearUid=e.target.value;bagMessage='';bagUpgradeOpen=false;redraw();};
        api.preview($('bagHeroPreview'));if($('bagWornPreview'))api.preview($('bagWornPreview'));
        document.querySelectorAll('[data-bag-tab]').forEach(b=>b.onclick=()=>{bagMessage='';bagUpgradeOpen=false;bag(b.dataset.bagTab,null,'all','all');document.querySelector(`[data-bag-tab="${b.dataset.bagTab}"]`)?.focus({preventScroll:true});});
        document.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{bagMessage='';bagUpgradeOpen=false;bag(tab,b.dataset.item);window.DreamKit?.detail(true,`[data-item="${b.dataset.item}"]`);});
        document.querySelectorAll('[data-bag-equipped]').forEach(b=>b.onclick=()=>{
            const slot=b.dataset.bagEquipped,g=G.equipped(state().rpg,slot);bagMessage='';bagUpgradeOpen=false;selectedGearUid=g?.uid||'';
            bag('equipment',g?.itemId,'all',slot);if(g)window.DreamKit?.detail(true,`[data-bag-equipped="${slot}"]`);
        });
        if($('equipItem'))$('equipItem').onclick=()=>{if(!chosen||!G.equip(state().rpg,chosen.uid))return;state().hp=Math.min(state().hp,api.maxHP());changed(G.name(chosen)+'을 지금 쓰고 있어요!');};
        if($('unequipItem'))$('unequipItem').onclick=()=>{G.unequip(state().rpg,it.slot);state().hp=Math.min(state().hp,api.maxHP());changed('장비를 벗어서 가방에 넣었어요.');};
        if($('wearBagLook'))$('wearBagLook').onclick=()=>{
            if(!it.cosmeticSlot||own(id)<1)return;
            const worn=state().world.look[it.cosmeticSlot]===id;state().world.look[it.cosmeticSlot]=worn?null:id;
            changed(worn?'벗어서 가방에 넣었어요.':it.name+'을 입었어요!');
        };
        if($('useItem'))$('useItem').onclick=()=>{const used=use(id);bagMessage=used?it.name+' 1개를 썼어요. '+own(id)+'개 남았어요.':'지금은 회복 효과가 충분해요. 간식은 그대로예요.';redraw();};
        if($('bagUpgrade'))$('bagUpgrade').onclick=()=>{bagUpgradeOpen=true;bagMessage='';redraw();};
        if($('bagUpgradeCancel'))$('bagUpgradeCancel').onclick=()=>{bagUpgradeOpen=false;redraw();};
        if($('bagUpgradeConfirm')){
            const uid=chosen.uid,expected=chosen.level;
            $('bagUpgradeConfirm').onclick=()=>{
                if(!(state().flags.metLumen||state().flags.completed))return;
                const live=G.find(state().rpg,uid);
                if(!G.upgrade(state().rpg,uid,expected)){bagMessage='장비나 재료가 바뀌었어요. 다시 확인해주세요.';redraw();return;}
                bagUpgradeOpen=false;state().hp=Math.min(state().hp,api.maxHP());changed(G.name(live)+'! 한 단계 더 강해졌어요.');
            };
        }
    }
    function dropGuide() {
        api.openModal('dropGuide', '어둑이의 레벨과 발견할 보물', `<p>어둑이를 정화할 때 재료와 장비를 각각 추첨해요. 높은 레벨일수록 장비 발견 확률과 좋은 등급의 확률이 올라갑니다.</p><div class="grade-legend">${Object.values(C.grades).reverse().map(g => `<span style="--grade:${g.color}">${g.symbol} ${g.name}</span>`).join('')}</div><table class="drop-table"><thead><tr><th>몬스터 레벨</th><th>장비 획득</th><th>저급</th><th>일반</th><th>레어</th><th>유니크</th></tr></thead><tbody>${C.lootBands.map(b => `<tr><td>Lv. ${b.min}–${b.max === 99 ? '9' : b.max}</td><td>${(C.dropProfile({ level: b.min }).gearChance * 100).toFixed(1)}–${(C.dropProfile({ level: Math.min(b.max, 9) }).gearChance * 100).toFixed(1)}%</td>${Object.values(b.weights).map(v => `<td>${v}%</td>`).join('')}</tr>`).join('')}<tr><td>먼지대장</td><td>100%</td><td>0%</td><td>0%</td><td>70%</td><td>30%</td></tr></tbody></table><p class="drop-note">등급 확률은 <b>장비를 획득했을 때</b>의 비율입니다. 예: Lv. 7의 유니크 장비 확률은 27.5% × 10% = 2.75%예요. 재료는 별도로 추첨하며 아무 아이템도 나오지 않을 수 있습니다.</p><p>편지 조각처럼 이야기에 꼭 필요한 단서는 정해진 어둑이에게서 반드시 나와요. 같은 이름의 장비도 강화 단계는 각각 다를 수 있어요. 가방에서 개별 장비를 선택해 비교해주세요.</p><button id="backToBag" class="primary">가방으로 돌아가기</button>`, 'FIND SOMETHING WORTH KEEPING');
        $('backToBag').onclick = () => {
            api.closeModal();
            bag();
        };
    }
    function use(id) {
        const item = C.items[id];
        if (item?.type !== 'supply' || own(id) < 1)
            return false;
        const s = state();
        if (s.hp >= api.maxHP() && (!item.shield || s.rpg.protection > 0) && (!item.resonance || s.rpg.resonance >= 100)) {
            api.toast('지금은 이 간식의 힘이 충분히 남아 있어요.');
            return false;
        }
        take(id, 1);
        s.hp = Math.min(api.maxHP(), s.hp + (item.heal || 0));
        if (item.shield)
            s.rpg.protection = 1;
        if (item.resonance)
            s.rpg.resonance = clamp(s.rpg.resonance + item.resonance, 0, 100);
        api.sound('memory');
        api.toast(item.name + ' · 마음을 든든하게 채웠어요');
        api.save();
        api.refresh();
        return true;
    }
    function quickHeal() {
        const id = ['cookie','shoreBiscuit','lunch','canalCake','tea','bloomTea'].find(id=>own(id)>0);
        if (id)
            use(id);
        else
            api.toast('간식이 없어요. 마들렌을 만나거나 수첩 보상을 받아주세요.');
    }
    function drops(type) {
        return { sand: [['dreamDust', 2], ['moonFlour', 1]], crab: [['dreamDust', 3], ['honey', 1]], box: [['dreamDust', 3], ['thread', 1], ['page', 1]], boss: [['dreamDust', 10]] }[type] || [];
    }
    function petProgress(kind,id) {
        const s=state(),wasReady=s.pets.egg?.warmth>=8,pet=DREAM_PETS.active(s),wasGrown=pet&&DREAM_PETS.grown(pet);
        const help=DREAM_PETS.progress(s,kind,id);
        if(help)api.petReaction?.();
        if(help==='tideOtter'&&s.hp<api.maxHP()){s.hp=Math.min(api.maxHP(),s.hp+1);api.floatText('작은 친구의 응원 · 마음 +1',api.player.x,api.player.y-175,'#c5f5de');}
        if(help==='leafFox'){gainResonance(6);api.floatText('새잎의 응원 · 공명 +6',api.player.x,api.player.y-175,'#d8efae');}
        if(help==='glowNewt'&&s.rpg.fragments<100000000){s.rpg.fragments++;api.floatText('반짝! 잔해물 +1',api.player.x,api.player.y-175,'#eddbff');}
        if(s.pets.egg?.warmth>=8&&!wasReady)api.toast('알이 움직여요! 캐릭터 수첩 → 작은 꿈 친구들에서 만나봐요. · P',4);
        else if(pet&&!wasGrown&&DREAM_PETS.grown(pet))api.toast(pet.name+'이 어른 모습으로 자랐어요! · P',4);
    }
    function rewardKill(enemy) {
        petProgress('enemy',enemy.id);
        const rewards = C.rollDrops(enemy, state().map);
        for (const [id, n] of rewards) {
            add(id, n, false);
            loot.push({ grade: C.items[id].grade, id, count: n, icon: C.items[id].icon, name: C.items[id].name, x: enemy.x + (rewards.findIndex(v => v[0] === id) - (rewards.length - 1) / 2) * 64, y: enemy.y - 60, originY: enemy.y - 60, age: 0, duration: 2.7 });
        }
        if (!rewards.length)
            return;
        api.sound(rewards.some(([id]) => C.items[id].grade === 'unique') ? 'clear' : 'loot');
        api.spark(enemy.x, enemy.y - 45, 40, '#fff0b1', 280);
        api.toast(rewards.map(([id, n]) => C.items[id].name + ' +' + n).join(' · '), 2.2);
    }
    function gainResonance(n) {
        state().rpg.resonance = clamp(state().rpg.resonance + n * (1 + stats().resonance), 0, 100);
    }
    function hit() {
        comboTime = 2.2;
        combo++;
        state().rpg.stats.hits++;
        state().rpg.stats.bestCombo = Math.max(state().rpg.stats.bestCombo, combo);
        gainResonance(6);
    }
    function perfectDodge() {
        state().rpg.stats.perfectDodges++;
        gainResonance(24);
        api.floatText('찰나의 회피!', api.player.x, api.player.y - 210, '#ffe6a7');
        api.sound('tag');
    }
    function absorb() {
        if (state().rpg.protection) {
            state().rpg.protection = 0;
            api.toast('도시락의 온기가 한 번 지켜줬어요!');
            api.sound('memory');
            api.save();
            return true;
        }
        return false;
    }
    function teamBurst() {
        if (state().rpg.resonance < 100) {
            api.toast('정화·찰나의 회피로 꿈빛 공명을 채워주세요.');
            return;
        }
        state().rpg.resonance = 0;
        api.player.invincible = 1.2;
        api.player.attackT = .5;
        state().hp = Math.min(api.maxHP(), state().hp + 1);
        api.ring(api.player.x, api.player.y - 80, 520, '#ffdf94');
        api.spark(api.player.x, api.player.y - 80, 80, '#f8dcff', 550);
        api.sound('playerBurst');
        for (const e of api.enemies) {
            if (api.mode !== 'play')
                break;
            if (!e.dead && Math.abs(e.x - api.player.x) < 540 && Math.abs(e.y - api.player.y) < 160)
                api.hit(e, 18 + stats().skill);
        }
        api.say((window.DREAM_PROGRESS?.names[state().active].burst||'공명 정화')+'—!', 3, state().active === 'ari' ? '아리' : '포포');
        api.save();
    }
    function objective() {
        const i = api.activeQuest();
        if (i < 0)
            return null;
        const q = C.quests[i];
        return { map: q.map, x: q.targetX || C.npcs[q.npc]?.x || null, npc: q.npc || null };
    }
    function accepted(id) {
        return state().rpg.accepted.includes(id);
    }
    function accept(id) {
        if (!accepted(id))
            state().rpg.accepted.push(id);
        api.save();
    }
    function npcMark(id) {
        const q = objective();
        if(C.chapterBridge?.next(state())?.npc===id)return '!';
        if (q?.npc === id)
            return '!';
        const s = state();
        if (id === 'madeleine' && accepted('herbs') && !s.flags.herbsDelivered && own('herb') >= 3)
            return '✓';
        if (id === 'post' && accepted('mail') && !s.flags.replyDelivered && own('postcard'))
            return '✓';
        if (id === 'lumen' && accepted('beacons') && !s.flags.beaconsRewarded && s.rpg.beacons.length >= 3)
            return '✓';
        return '…';
    }
    function npc(id) {
        const s = state();
        if (!C.npcs[id])
            return;
        if (id !== 'lumen' && !s.flags.metLumen) {
            C.dialogue.beforeBriefing = [[id, '새로 온 꿈 지킴이들이구나! 먼저 루멘 반장님을 만나보렴.\n등대 불빛이 약해져서 너희를 기다리고 계셔.']];
            api.dialogue('beforeBriefing');
            return;
        }
        if (id === 'lumen' && !s.flags.metLumen) {
            api.dialogue('town', () => {
                s.flags.metLumen = true;
                add('compass', 1, false);
                api.memory('pomi');
                accept('beacons');
                api.save();
                api.say('캐릭터 수첩에서 꿈빛 성장을 골라보렴. 항구에서는 무료로 다시 배울 수 있단다.',5);
                api.toast('캐릭터 → 꿈빛 성장 · 되찾은 기억으로 새 기술을 배워요!',5);
            });
            return;
        }
        if (id === 'madeleine' && !s.flags.metBaker) {
            s.flags.metBaker = true;
            if (!s.flags.cookedFirst && !s.flags.bakerGift) {
                s.flags.bakerGift = true;
                add('moonFlour', Math.max(0, 2 - own('moonFlour')), false);
                add('honey', Math.max(0, 1 - own('honey')), false);
            }
            accept('herbs');
            api.dialogue('bakerFirst', () => npcMenu(id));
            api.save();
            return;
        }
        if (id === 'post' && !s.flags.metPost) {
            s.flags.metPost = true;
            accept('mail');
            api.dialogue('postFirst', () => npcMenu(id));
            api.save();
            return;
        }
        npcMenu(id);
    }
    function choice(id, title, subtitle, enabled = true) {
        return `<button class="npc-choice" data-npc-action="${id}" ${enabled ? '' : 'disabled'}><span><b>${title}</b><small>${subtitle}</small></span><i>↗</i></button>`;
    }
    function npcMenu(id) {
        const s = state(), n = C.npcs[id];
        let choices = choice('petNursery','작은 꿈 친구들을 만나고 싶어요.','꿈의 알 선택 · 부화 · 펫 성장') + choice('gearWorkshop','기억 수선대를 이용할게요.','남는 장비 분해 · 꿈빛 잔해물로 장비 강화') + choice('regionWorkshop','지역 재료로 만들고 싶어요.','순찰 간식 3종 · 항구 기념 장비 3종'), message = n.greeting;
        const bridge=C.chapterBridge?.next(s);
        if(bridge?.npc===id)choices=choice('ovenContinue',bridge.label,'첫 밤의 후일담 · 몽글 오븐 마을 출항 준비')+choices;
        if(s.flags.ovenRouteReady)message='“다음 항로 준비는 끝났어요. 문이 열릴 때까지 이 항구의 남은 꿈들을 돌봐주세요.”';
        if (id === 'lumen') {
            if (s.flags.letterRead && !s.flags.readyForBoss)
                choices += choice('truth', '반장님, 이 편지를 봐주세요.', '뒤뚱이 이어 붙인 편지의 주인을 만나요.');
            if (own('oldJournal') && !s.flags.journalReturned)
                choices += choice('returnJournal', '다녀왔어요. 일지를 찾았어요.', '먼지대장에게서 찾은 반장의 첫 마음.');
            choices += choice('repair', '꿈배턴을 고쳐주세요.', own('stellarBaton') ? '이미 수선한 꿈배턴이 가방에 있어요.' : `꿈가루 ${own('dreamDust')}/8 · 꿈실 ${own('thread')}/2`, !own('stellarBaton') && own('dreamDust') >= 8 && own('thread') >= 2);
            if (!s.flags.beaconsRewarded)
                choices += choice('lamps', '길등을 모두 밝혔어요.', `밝힌 길등 ${s.rpg.beacons.length}/3 · 작은 등불 부적`, s.rpg.beacons.length >= 3);
            choices += choice('rest', '잠시 쉬어도 될까요?', '마음 전체 회복 · 무료');
            if (s.flags.completed)
                choices += choice('after', '그날 밤 이야기를 더 듣고 싶어요.', '다음 꿈길에 대해 이야기해요.');
        }
        else if (id === 'madeleine') {
            choices += choice('cook', '도시락을 같이 만들어요.', `달빛 밀가루 ${own('moonFlour')}/2 · 바람꽃 꿀 ${own('honey')}/1`, own('moonFlour') >= 2 && own('honey') >= 1);
            choices += choice('tea', '따뜻한 차 한 잔 부탁해요.', `반짝 별잎 ${own('herb')}/1 · 꿈빛 5`, own('herb') >= 1 && s.light >= 5);
            if (!s.flags.herbsDelivered)
                choices += choice('herbs', '별잎을 모아왔어요.', `별잎 ${own('herb')}/3 · 응원 리본과 차 2잔`, own('herb') >= 3);
            choices += choice('wardrobe', '새 순찰 옷을 만들고 싶어요.', '탐험 재료로 옷 만들기 · 꾸미기 C');
            choices += choice('shop', '간식을 챙겨갈게요.', '모은 꿈빛으로 쿠키와 요리 재료를 준비해요.');
        }
        else {
            if (!s.flags.letterRead)
                choices += choice('letter', '이 편지를 이어주실래요?', `편지 조각 ${own('page')}/3 · ${s.flags.archiveRead?'골목 2조각 + 기록실 1조각':'기록실의 마지막 기록을 먼저 읽어요'}`, own('page') >= 3 && s.flags.archiveRead);
            if (!s.flags.replyDelivered)
                choices += choice('mail', '전하지 못한 답장을 찾았어요.', own('postcard') ? '해변에서 찾아낸 답장이 가방에 있어요.' : '첫잠 해변 오른쪽 끝, 오래된 상자를 찾아요.', own('postcard') > 0);
            if (s.flags.letterRead)
                message = '“마음은 늦게라도 전할 수 있어요. 반장님에게도 꼭 보여주세요.”';
        }
        api.openModal('npc', n.name, `<div class="npc-dialog-layout"><div class="npc-illustration"><img src="assets/${n.image}.webp" alt="${n.name}"><span>${n.role}</span></div><div class="npc-services"><p class="npc-quote">${message}</p><div class="npc-responses">${choices || '<p>오늘도 좋은 순찰이 되길 바라요.</p>'}</div><div class="npc-service-note">${id === 'madeleine' ? '별잎 채집과 요리는 언제든 이어 할 수 있어요.' : id === 'post' ? '필요한 물건은 순찰 가방 I에서 확인해요.' : '수첩 N에서 마을 사람들의 부탁도 확인해요.'}</div></div></div>`, 'PEOPLE OF THE SLEEPING HARBOR');
        document.querySelectorAll('[data-npc-action]').forEach(b => b.onclick = () => npcAction(id, b.dataset.npcAction));
    }
    function npcAction(id, action) {
        const s = state();
        if(action==='petNursery')return petUI.open();
        if(action==='gearWorkshop')return gearUI.open();
        if(action==='regionWorkshop')return regionUI.workshop();
        if(action==='ovenContinue'){
            const step=C.chapterBridge?.next(s);
            if(!step||step.npc!==id)return;
            api.closeModal();
            api.dialogue(step.scene,()=>{
                if(s.flags[step.flag])return;
                s.flags[step.flag]=true;
                if(!own(step.item))add(step.item,1,false);
                api.save();api.refresh();
                api.say(C.chapterBridge.next(s)?.label||'출항 준비 완료! 다음 세계가 열리기 전까지 남은 기억을 찾아보자.');
            });
            return;
        }
        if (action === 'truth' && !s.flags.readyForBoss && own('oldLetter')) {
            api.closeModal();
            api.dialogue('captainTruth', () => {
                s.flags.readyForBoss = true;
                add('warehouseKey');
                add('captainBadge');
                api.save();
                api.refresh();
            });
        }
        else if (action === 'returnJournal' && !s.flags.journalReturned && own('oldJournal')) {
            api.closeModal();
            api.dialogue('journalHome', () => {
                s.flags.journalReturned = true;
                api.save();
                api.say('항구 오른쪽 끝 꿈종으로 가자. 이제 우리가 불을 켤 차례야.');
            });
        }
        else if (action === 'repair' && !own('stellarBaton') && own('dreamDust') >= 8 && own('thread') >= 2) {
            take('dreamDust', 8);
            take('thread', 2);
            add('stellarBaton');
            api.sound('stamp');
            api.save();
            npcMenu(id);
        }
        else if (action === 'rest') {
            s.hp = api.maxHP();
            api.save();
            api.toast('항구에서 마음을 든든하게 채웠어요.');
            npcMenu(id);
        }
        else if (action === 'letter' && !s.flags.letterRead && s.flags.archiveRead && own('page') >= 3) {
            take('page', 3);
            add('oldLetter', 1, false);
            s.flags.letterRead = true;
            api.closeModal();
            api.dialogue('restoredLetter');
            api.save();
        }
        else if (action === 'herbs' && !s.flags.herbsDelivered && own('herb') >= 3) {
            take('herb', 3);
            s.flags.herbsDelivered = true;
            add('herbRibbon', 1, false);
            add('tea', 2, false);
            api.closeModal();
            api.dialogue('herbsDone');
            api.save();
        }
        else if (action === 'mail' && !s.flags.replyDelivered && own('postcard')) {
            take('postcard', 1);
            s.flags.replyDelivered = true;
            add('windShoes', 1, false);
            s.light += 30;
            api.closeModal();
            api.dialogue('mailDone');
            api.save();
        }
        else if (action === 'lamps' && !s.flags.beaconsRewarded && s.rpg.beacons.length >= 3) {
            s.flags.beaconsRewarded = true;
            add('lanternCharm', 1, false);
            s.light += 40;
            api.closeModal();
            api.dialogue('lampsDone');
            api.save();
        }
        else if (action === 'tea' && own('herb') >= 1 && s.light >= 5) {
            take('herb', 1);
            s.light -= 5;
            add('tea', 1);
            api.save();
            npcMenu(id);
        }
        else if (action === 'wardrobe')
            api.wardrobe();
        else if (action === 'shop')
            shop();
        else if (action === 'cook')
            cook();
        else if (action === 'after') {
            api.closeModal();
            api.dialogue('after');
        }
        api.refresh();
    }
    function shop() {
        const s = state(), prices = { cookie: 10, moonFlour: 5, honey: 8 };
        api.openModal('shop', '마들렌의 순찰 찬장', `<div class="shop-balance">보유 꿈빛 <b>✧ ${s.light}</b></div><div class="shop-items">${Object.entries(prices).map(([id, price]) => `<article>${icon(C.items[id].icon, 67)}<h3>${C.items[id].name}</h3><p>${C.items[id].effect}</p><small>가방에 ${own(id)}개</small><button class="primary" data-buy="${id}" ${s.light < price ? 'disabled' : ''}>✧ ${price} · 교환</button></article>`).join('')}</div>`, 'A LITTLE PREPARATION');
        document.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
            const id = b.dataset.buy, cost = prices[id];
            if (!cost || s.light < cost)
                return;
            s.light -= cost;
            add(id, 1, false);
            api.sound('stamp');
            api.save();
            shop();
            api.refresh();
        });
    }
    function cook() {
        if (own('moonFlour') < 2 || own('honey') < 1)
            return;
        mini = { kind: 'cook', time: 0, round: 0, results: [], done: false };
        api.openModal('cook', '별빛 순찰 도시락', `<div class="cooking-layout"><div class="cooking-art">${icon('lunch', 110)}<div class="steam">∿ &nbsp; ∿ &nbsp; ∿</div></div><div class="cooking-story"><span class="small-label">마들렌의 작은 주방</span><h3 id="cookStep">01 · 반죽을 살살 섞어요</h3><p>별이 가운데에 왔을 때 눌러주세요.<br>조금 서툴러도 도시락은 완성돼요.</p><div class="cook-meter"><div class="sweet-spot"></div><i id="cookNeedle">✦</i></div><div id="cookResults" class="cook-results">○ &nbsp; ○ &nbsp; ○</div><button id="cookPress" class="primary">살살 섞기 <kbd>Space</kbd></button><small>완성할 때 재료를 사용해요. 취소하면 그대로 남아요.</small></div></div>`, 'MADELEINE’S KITCHEN');
        $('cookPress').onclick = pressCook;
    }
    function pressCook() {
        if (api.modalKind !== 'cook' || mini?.kind !== 'cook' || mini.done)
            return;
        const value = .5 + Math.sin(mini.time * 2.4) * .45;
        const good = Math.abs(value - .5) < .19;
        mini.results.push(good);
        mini.round++;
        api.sound(good ? 'memory' : 'stamp');
        if (mini.round >= 3) {
            mini.done = true;
            if (!take('moonFlour', 2) || !take('honey', 1)) {
                api.toast('재료가 부족해요.');
                return;
            }
            state().rpg.stats.cooked++;
            const quality = mini.results.filter(Boolean).length;
            add('lunch', quality === 3 ? 2 : 1, false);
            const first = !state().flags.cookedFirst;
            state().flags.cookedFirst = true;
            api.save();
            $('cookStep').textContent = quality === 3 ? '반짝반짝, 완벽한 도시락!' : '따뜻한 도시락 완성!';
            $('cookResults').textContent = mini.results.map(v => v ? '✦' : '♡').join('　');
            $('cookPress').textContent = '가방에 담기 →';
            $('cookPress').onclick = () => {
                api.closeModal();
                if (first)
                    api.dialogue('cooked');
                else
                    api.toast(quality === 3 ? '정성 보너스 · 도시락 2개를 담았어요!' : '도시락을 가방에 담았어요.');
            };
            api.refresh();
            return;
        }
        $('cookStep').textContent = ['', '02 · 별 모양을 꾹 찍어요', '03 · 노릇하게 구워요'][mini.round];
        $('cookPress').innerHTML = ['', '별 모양 찍기', '오븐에서 꺼내기'][mini.round] + ' <kbd>Space</kbd>';
        $('cookResults').textContent = mini.results.map(v => v ? '✦' : '♡').concat(Array(3 - mini.round).fill('○')).join('　');
        mini.time = 0;
    }
    function ritual() {
        if (!state().flags.journalReturned) {
            api.toast('반장의 일지를 돌려드리면 꿈종이 깨어나요.');
            return;
        }
        if (state().flags.completed) {
            api.ending();
            return;
        }
        const next=api.activeQuest();
        if(next>=0&&C.quests[next].flag!=='completed'){api.toast('아직 남은 첫 순찰 의뢰: '+C.quests[next].name+' · 수첩에서 확인해요.',4);return;}
        mini = { kind: 'ritual', round: 0, done: false };
        api.openModal('ritual', '함께 켜는 등대', `<div class="ritual"><div class="ritual-moon">☾</div><p>되찾은 기억을 차례로 울려주세요.<br><b>첫인사 → 함께 나눈 한 끼 → 돌아오는 집</b></p><div id="ritualNotes" class="ritual-notes"><span>☾ 첫인사</span><span>✦ 한 끼</span><span>⌂ 집</span></div><div class="ritual-buttons"><button data-note="0"><strong>☾</strong>처음의 달</button><button data-note="1"><strong>✦</strong>온기의 별</button><button data-note="2"><strong>⌂</strong>등대의 집</button></div><p id="ritualHint">첫 기억, 처음 건넸던 인사를 떠올려요.</p></div>`, 'THE LIGHT WE MAKE TOGETHER');
        document.querySelectorAll('[data-note]').forEach(b => b.onclick = () => note(Number(b.dataset.note)));
    }
    function note(n) {
        if (api.modalKind !== 'ritual' || mini?.kind !== 'ritual' || mini.done)
            return;
        if (n !== mini.round) {
            api.sound('jump');
            $('ritualHint').textContent = '서두르지 않아도 괜찮아요. 반짝이는 기억부터 울려주세요.';
            return;
        }
        mini.round++;
        api.sound('memory');
        [...$('ritualNotes').children].forEach((el, i) => el.classList.toggle('lit', i < mini.round));
        if (mini.round === 3) {
            mini.done = true;
            state().flags.completed = true;
            state().rpg.resonance = 100;
            api.save();
            api.closeModal();
            api.dialogue('relight', () => api.ending());
        }
        else
            $('ritualHint').textContent = ['', '두 번째 기억, 함께 나눈 한 끼를 떠올려요.', '마지막 기억, 모두 함께 돌아갈 집을 떠올려요.'][mini.round];
    }
    function interactObject(obj) {
        const r = state().rpg;
        if (api.isWorldObject(obj)) {
            api.worldInteract(obj);
            return;
        }
        if (obj.kind === 'herb') {
            if (r.gathered.includes(obj.id))
                return;
            r.gathered.push(obj.id);
            add('herb', 1);
            api.spark(obj.x, obj.y - 22, 18, '#d4e8b2', 110);
            api.sound('memory');
        }
        if (obj.kind === 'chest') {
            if (r.opened.includes(obj.id))
                return;
            r.opened.push(obj.id);
            if (obj.id === 'chestBeach') {
                add('postcard', 1);
                add('dreamDust', 4, false);
            }
            else {
                add('cookie', 2);
                add('dreamDust', 4, false);
            }
            api.sound('clear');
            api.spark(obj.x, obj.y - 28, 30, '#ffe4a0', 180);
        }
        if (obj.kind === 'beacon') {
            if (r.beacons.includes(obj.id))
                return;
            r.beacons.push(obj.id);
            state().light += 10;
            api.toast('길등 ' + r.beacons.length + '/3 · 돌아오는 길이 밝아졌어요');
            api.sound('memory');
            api.ring(obj.x, obj.y - 100, 140, '#ffe2ab');
        }
        if (obj.kind === 'altar') {
            ritual();
            return;
        }
        api.save();
        api.refresh();
    }
    function nearest() {
        const p = api.player, map = state().map, possible = [];
        if (true)
            for (const [id, n] of Object.entries(C.npcs))
                if (n.map === map && Math.abs(n.x - p.x) < 115 && Math.abs(n.y - p.y) < 70)
                    possible.push({ type: 'npc', id, x: n.x, y: n.y, label: n.name + '과 이야기하기' });
        for (const obj of C.objects) {
            if (obj.map !== map || Math.abs(obj.x - p.x) > 90 || Math.abs(obj.y - p.y) > 55)
                continue;
            const r = state().rpg;
            if (obj.kind === 'herb' && r.gathered.includes(obj.id) || obj.kind === 'chest' && r.opened.includes(obj.id) || obj.kind === 'beacon' && r.beacons.includes(obj.id))
                continue;
            possible.push({ type: 'object', obj, x: obj.x, y: obj.y, label: { herb: '별잎 채집하기', chest: '오래된 상자 열기', beacon: '돌아오는 길 밝히기', altar: state().flags.completed ? '그날 밤 다시 떠올리기' : '꿈종에 기억 모으기' }[obj.kind] || api.worldLabel(obj) });
        }
        return possible.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0] || null;
    }
    function handleInteraction(interaction) {
        if (interaction.type === 'npc') {
            npc(interaction.id);
            return true;
        }
        if (interaction.type === 'object') {
            interactObject(interaction.obj);
            return true;
        }
        return false;
    }
    function recoverJournal() {
        state().flags.bossRecovered = true;
        add('oldJournal', 1, false);
        api.memory('journal');
        api.dialogue('bossRecovered', () => api.say('M으로 항구에 돌아가자. 일지를 루멘에게 직접 전해주자!'));
        api.save();
    }
    function sideHTML() {
        return `<div class="sidequest-list">${Object.entries(C.sideQuests).map(([id, q]) => {
            const s = state(), done = s.flags[q.flag], known = accepted(id);
            let count = id === 'herbs' ? Math.min(own('herb'), 3) + '/3' : id === 'mail' ? (own('postcard') ? '답장 발견' : '상자 찾기') : s.rpg.beacons.length + '/3';
            return `<article class="sidequest-card ${done ? 'done' : ''}"><div class="sidequest-avatar"><img src="assets/${C.npcs[q.npc].image}.webp" alt="${C.npcs[q.npc].name}"></div><div><span>${C.npcs[q.npc].name}의 부탁</span><h3>${q.name}</h3><p>${known ? q.goal : '마을에서 이야기를 나누면 부탁이 생겨요.'}</p><small>${done ? '✓ 마음을 전했어요' : known ? count : '아직 만나지 않은 부탁'} · ${q.reward}</small></div></article>`;
        }).join('')}</div>`;
    }
    function update(dt) {
        if (mini?.kind === 'cook' && !mini.done && api.modalKind === 'cook' && api.mode === 'modal') {
            mini.time += dt;
            const needle = $('cookNeedle');
            if (needle)
                needle.style.left = ((.5 + Math.sin(mini.time * 2.4) * .45) * 100) + '%';
        }
        if (api.mode === 'play') {
            comboTime -= dt;
            if (comboTime <= 0)
                combo = 0;
            for (const l of loot) {
                l.age += dt;
                if (l.age < .5)
                    l.y -= dt * 130;
                else if (l.age > 1.65) {
                    l.x += (api.player.x - l.x) * dt * 5;
                    l.y += (api.player.y - 65 - l.y) * dt * 5;
                }
            }
            loot = loot.filter(l => l.age < l.duration);
        }
        const s = state();
        if (!s?.rpg)
            return;
        const gauge = $('resonanceFill');
        if (gauge) {
            gauge.style.width = s.rpg.resonance + '%';
            $('resonanceCount').textContent = Math.round(s.rpg.resonance) + '%';
            $('burstControl').classList.toggle('ready', s.rpg.resonance >= 100);
            $('bagCount').textContent = Object.keys(s.rpg.inventory).filter(id => own(id) > 0).length;
            $('guardBadge').classList.toggle('hidden', !s.rpg.protection);
        }
    }
    function key(e) {
        if (api.modalKind === 'cook' && e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            if (mini?.done)
                $('cookPress').click();
            else
                pressCook();
            return true;
        }
        return false;
    }
    function view() {
        return { loot, combo: comboTime > 0 ? combo : 0, npcMarks: Object.fromEntries(Object.keys(C.npcs).map(id => [id, npcMark(id)])) };
    }
    return { pets:petUI.open, petProgress, gearWorkshop: gearUI.open, details: equipmentUI.details, initialize, migrate, stats, add, take, own, bag, use, quickHeal, icon, rewardKill, gainResonance, hit, perfectDodge, absorb, teamBurst, objective, nearest, handleInteraction, recoverJournal, sideHTML, update, key, view, npc, ritual };
};
