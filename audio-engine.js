'use strict';
// Stream only the current/transitioning score; short recorded effects use decoded buffers.
window.DreamAudioEngine=class DreamAudioEngine{
    constructor({settings,getScene}){
        this.settings=settings;this.getScene=getScene;this.ctx=null;this.master=null;
        this.events=[];this.musicChanges=[];this.buffers=new Map();this.pending=new Set();
        this.decks=[];this.clips=new Set();this.cooldowns=new Map();this.variants=new Map();this.ducked=false;
        this.hidden=document.hidden;this.nextRetry=0;
        document.addEventListener('visibilitychange',()=>{this.hidden=document.hidden;if(this.hidden)this.silence();});
    }
    unlock(){
        try{
            if(!this.ctx){
                this.ctx=new(window.AudioContext||window.webkitAudioContext)();
                this.master=this.ctx.createGain();this.sfxBus=this.ctx.createGain();
                const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.ratio.value=4;limiter.attack.value=.004;limiter.release.value=.12;
                this.sfxBus.connect(this.master);this.master.connect(limiter);limiter.connect(this.ctx.destination);
                for(const id of Object.keys(DREAM_AUDIO_ASSETS.effects))this.load(id);
            }
            this.ctx.resume().catch(()=>{});this.volume();this.nextRetry=0;
        }catch{this.settings.sound=false;}
    }
    volume(){
        const s=this.settings,t=this.ctx?.currentTime||0;
        if(this.master)this.master.gain.setTargetAtTime(s.sound&&!this.hidden?s.volume:0,t,.025);
        if(this.sfxBus)this.sfxBus.gain.setTargetAtTime(s.effectsVolume??.85,t,.025);
        if(!s.sound)this.silence();
    }
    silence(){
        for(const d of this.decks){d.audio.pause();if(d.gain)d.gain.gain.value=0;else d.audio.volume=0;}
        for(const clip of this.clips){try{clip.stop?clip.stop():clip.pause();}catch{}}this.clips.clear();
    }
    async load(id){
        if(!this.ctx||this.buffers.has(id)||this.pending.has(id)||location.protocol==='file:')return;
        const asset=DREAM_AUDIO_ASSETS.effects[id];if(!asset)return;
        this.pending.add(id);
        try{const r=await fetch(asset.file);if(!r.ok)throw Error(r.status);const b=await this.ctx.decodeAudioData(await r.arrayBuffer());this.buffers.set(id,b);}catch{}finally{this.pending.delete(id);}
    }
    record(event){this.events.push({...event,time:this.getScene().clock});this.events=this.events.slice(-32);}
    variant(prefix,count=3){const n=this.variants.get(prefix)||0;this.variants.set(prefix,n+1);return prefix+'-'+n%count;}
    play(id,{gain=.65,rate=1,pan=0}={}){
        if(!this.ctx||!this.settings.sound||this.hidden||!DREAM_AUDIO_ASSETS.effects[id])return;
        if(this.clips.size>=16)return;
        const buffer=this.buffers.get(id),done=clip=>{this.clips.delete(clip);};
        if(buffer){
            const source=this.ctx.createBufferSource(),g=this.ctx.createGain(),p=this.ctx.createStereoPanner();
            source.buffer=buffer;source.playbackRate.value=rate;g.gain.value=gain;p.pan.value=Math.max(-.8,Math.min(.8,pan));
            source.connect(g);g.connect(p);p.connect(this.sfxBus);source.onended=()=>{done(source);source.disconnect();g.disconnect();p.disconnect();};this.clips.add(source);source.start();
        }else{
            this.load(id);const a=new Audio(DREAM_AUDIO_ASSETS.effects[id].file);a.playbackRate=rate;a.volume=Math.min(1,gain*this.settings.volume*(this.settings.effectsVolume??.85));
            a.onended=a.onerror=()=>done(a);this.clips.add(a);a.play().catch(()=>done(a));
        }
        this.record({sample:id});
    }
    enemy(subject,kind='attack'){
        const species=subject?.variant||subject?.type||'sand',key=species+kind,now=this.ctx?.currentTime||0;
        if(now<(this.cooldowns.get(key)||0))return;
        this.cooldowns.set(key,now+(kind==='attack'?.85:.45));
        const def=window.DREAM_CONTENT?.regionCreatures?.[species];
        this.play('cry-'+(def?.voice||species),{gain:kind==='attack'?.38:.17,rate:(kind==='attack'?1:1.07)*(def?.voiceRate||1),pan:((subject?.x||0)-this.getScene().playerX)/800});
    }
    combatSwing(profile){
        this.record({combatSwing:profile.kind,hero:profile.hero,grade:profile.grade,level:profile.level});
        this.play('swing-'+profile.kind+'-'+profile.hero,{gain:.30});
    }
    combatLanding(profile){
        this.play(this.variant('strike-plunge-'+profile.hero,2),{gain:.5});
    }
    impact(type,heavy,finish,x=0,profile=null){
        if(profile){
            this.record({combatHit:profile.kind,hero:profile.hero,grade:profile.grade,level:profile.level,type});
            const now=this.ctx?.currentTime||0;
            // A charged sweep can hit a crowd: do not stack the same transient at full volume.
            if(now-(this.lastCombatHit??-1)<.055)return;
            this.lastCombatHit=now;
            const pan=(x-this.getScene().playerX)/800;
            this.play(this.variant('strike-'+profile.kind+'-'+profile.hero,2),{gain:profile.kind==='basic'?.86:1,rate:(profile.rank===0?.96:1)+profile.level*.012,pan});
            if(profile.rank===1)this.play('forge-spark',{gain:.075,pan});
            if(profile.rank>=2)this.play('grade-'+profile.grade,{gain:profile.rank===3?.23:.17,pan});
            if(profile.level>=2)this.play(profile.level>=4?'forge-resonance':'forge-spark',{gain:.09+profile.level*.015,pan});
            return;
        }
        this.record({type,heavy,finish});
        const material={crab:'shell',tideBell:'shell',shoreSnail:'shell',box:'wood',parcelBat:'wood',inkMimic:'shell',boss:'heavy'}[type]||'soft';
        this.play(this.variant('hit-'+material),{gain:heavy?.98:.72,rate:.97+Math.random()*.06,pan:(x-this.getScene().playerX)/800});
        if(heavy)this.play(this.variant('chime'),{gain:.17,rate:1.08});
        if(finish)this.play('chime-2',{gain:.36,rate:1.12});
    }
    sfx(kind,subject){
        this.record({event:kind});if(!this.ctx||!this.settings.sound)return;
        const now=this.ctx.currentTime,cooldown=kind==='step'?.18:kind==='purify'?.12:.035;
        if(now<(this.cooldowns.get(kind)||0))return;this.cooldowns.set(kind,now+cooldown);
        const scene=this.getScene();
        if(subject)this.enemy(subject);
        if(kind==='step'){const floor=['town','alley','boss','archive'].includes(scene.theme)?'wood':['trail','garden'].includes(scene.theme)?'grass':'concrete';this.play(this.variant('step-'+floor,2),{gain:.12});return;}
        if(kind==='attack'){this.combatSwing({kind:'basic',hero:scene.hero==='popo'?'popo':'ari'});return;}
        const actions={jump:['jump',.35],dodge:['dodge',.36],hurt:['hurt',.48],chargeReady:['ready',.38],chargeRelease:['skill',.65],skill:['skill',.65],playerGuard:['guard',.48],playerControl:['control',.48],playerBurst:['burst',.7],purify:['purify',.34]};
        if(actions[kind]){const [clip,gain]=actions[kind];this.play('action-'+clip+'-'+(scene.hero==='popo'?'popo':'ari'),{gain});return;}
        const map={
            jump:['cloth',.33,1.15],dodge:['swish-1',.57,1.3],hurt:['hit-soft-1',.6,.97],hit:['hit-soft-0',.7,1],
            chargeReady:['chime-1',.32,1.25],chargeRelease:['charge',1,1],skill:['charge',.72,1.24],
            purify:['chime-2',.44,1.15],loot:['coins',.55,1.15],gather:['coins',.45,1.1],chest:['chest',.55,1],
            mechanism:['mechanism',.62,1],rattle:['wood-creak',.55,1.2],claw:['swish-0',.53,1.05],sandRush:['cloth',.66,.9],
            bossSneeze:['swish-1',.8,.76],bossStomp:['hit-heavy-2',.86,.96],
            regionRush:['cloth',.6,1],regionFan:['swish-1',.55,.9],regionHop:['cloth',.5,1.15],regionSeed:['swish-0',.5,1.4],regionInk:['cloth',.57,.85],regionWake:['swish-1',.57,1.1],
            camp:['chime-0',.4,.85],arrive:['chime-0',.34,1],wind:['swish-1',.32,.7],
            stamp:['page',.6,1],memory:['chime-1',.4,1],clear:['chime-2',.5,.9],tag:['cloth',.35,1]
        },entry=map[kind]||['page',.24,1];this.play(entry[0],{gain:entry[1],rate:entry[2]});
    }
    dispose(deck){deck.audio.pause();deck.audio.removeAttribute('src');deck.audio.load();deck.source?.disconnect();deck.gain?.disconnect();this.decks=this.decks.filter(d=>d!==deck);}
    switchTrack(theme){
        const track=DREAM_AUDIO_ASSETS.tracks[theme];if(!track)return;
        // A rapid map change cannot leave more than two tracks playing/loading.
        while(this.decks.length>=2)this.dispose(this.decks[0]);
        // Keep the old score audible until the replacement actually starts.
        const audio=new Audio(track.file),deck={audio,theme,track,level:0,target:1,playing:false,failed:false};
        audio.preload='auto';audio.loop=true;audio.volume=0;
        if(location.protocol!=='file:'){
            deck.source=this.ctx.createMediaElementSource(audio);deck.gain=this.ctx.createGain();deck.gain.gain.value=0;deck.source.connect(deck.gain);deck.gain.connect(this.master);audio.volume=1;
        }
        audio.onplaying=()=>{deck.started=true;if(deck.theme===this.scoreTheme)this.decks.forEach(d=>{if(d!==deck)d.target=0;});};
        audio.onerror=()=>{deck.failed=true;this.record({musicError:theme});};
        this.decks.push(deck);this.scoreTheme=theme;this.musicChanges.push(theme);this.musicChanges=this.musicChanges.slice(-15);
    }
    update(dt){
        if(!this.ctx)return;
        const s=this.settings,scene=this.getScene(),blocked=this.hidden||!s.sound||['loading','opening'].includes(scene.mode);
        if(blocked){this.silence();return;}
        const theme=['title','character'].includes(scene.mode)?'town':scene.theme;
        if((theme!==this.scoreTheme||!this.decks.some(d=>d.theme===theme&&!d.failed))&&this.ctx.currentTime>=this.nextRetry)this.switchTrack(theme);
        const quiet=this.ducked?.24:['modal','pause'].includes(scene.mode)?.55:1;
        this.musicLevel=(this.musicLevel??quiet)+(quiet-(this.musicLevel??quiet))*Math.min(1,dt*(this.ducked?12:3));
        for(const d of [...this.decks]){
            if(d.failed){this.dispose(d);this.nextRetry=this.ctx.currentTime+10;continue;}
            if(d.target===0)d.level=Math.max(0,d.level-dt/1.6);else if(d.started)d.level=Math.min(1,d.level+dt/1.6);
            const gain=d.level*(s.musicVolume??.55)*this.musicLevel*d.track.gain;
            if(d.gain)d.gain.gain.setTargetAtTime(gain,this.ctx.currentTime,.035);else d.audio.volume=Math.max(0,Math.min(1,gain*s.volume));
            if(d.target===0&&d.level===0){this.dispose(d);continue;}
            if(d.audio.paused&&!d.playing&&this.ctx.currentTime>=this.nextRetry){d.playing=true;d.audio.play().catch(()=>{this.nextRetry=this.ctx.currentTime+2;}).finally(()=>d.playing=false);}
        }
    }
    inspect(){return {theme:this.scoreTheme,tracks:this.decks.map(d=>({theme:d.theme,file:d.track.file,playing:!d.audio.paused,level:d.level,time:d.audio.currentTime,failed:d.failed})),buffers:this.buffers.size,clips:this.clips.size,ducked:!!this.ducked,musicLevel:this.musicLevel};}
};
