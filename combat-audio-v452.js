'use strict';
/* v4.52 punchy combat sounds (작업_효과음_후보 direction A, offline synthesis + filtered Kenney CC0 layers; see assets/audio-v452/CREDITS.txt). */
Object.assign(DREAM_AUDIO_ASSETS.effects,{
 "hit-burst-ari": {
  "file": "assets/audio-v452/hit-burst-ari.wav"
 },
 "hit-burst-popo": {
  "file": "assets/audio-v452/hit-burst-popo.wav"
 },
 "hit-charged-1-ari": {
  "file": "assets/audio-v452/hit-charged-1-ari.wav"
 },
 "hit-charged-1-popo": {
  "file": "assets/audio-v452/hit-charged-1-popo.wav"
 },
 "hit-charged-2-ari": {
  "file": "assets/audio-v452/hit-charged-2-ari.wav"
 },
 "hit-charged-2-popo": {
  "file": "assets/audio-v452/hit-charged-2-popo.wav"
 },
 "hit-finisher-ari": {
  "file": "assets/audio-v452/hit-finisher-ari.wav"
 },
 "hit-finisher-popo": {
  "file": "assets/audio-v452/hit-finisher-popo.wav"
 },
 "hit-light-1-ari": {
  "file": "assets/audio-v452/hit-light-1-ari.wav"
 },
 "hit-light-1-popo": {
  "file": "assets/audio-v452/hit-light-1-popo.wav"
 },
 "hit-light-2-ari": {
  "file": "assets/audio-v452/hit-light-2-ari.wav"
 },
 "hit-light-2-popo": {
  "file": "assets/audio-v452/hit-light-2-popo.wav"
 },
 "hit-plunge-ari": {
  "file": "assets/audio-v452/hit-plunge-ari.wav"
 },
 "hit-plunge-popo": {
  "file": "assets/audio-v452/hit-plunge-popo.wav"
 },
 "hit-skill-attack-s1-ari": {
  "file": "assets/audio-v452/hit-skill-attack-s1-ari.wav"
 },
 "hit-skill-attack-s1-popo": {
  "file": "assets/audio-v452/hit-skill-attack-s1-popo.wav"
 },
 "hit-skill-attack-s3-ari": {
  "file": "assets/audio-v452/hit-skill-attack-s3-ari.wav"
 },
 "hit-skill-attack-s3-popo": {
  "file": "assets/audio-v452/hit-skill-attack-s3-popo.wav"
 },
 "hit-skill-control-s1-ari": {
  "file": "assets/audio-v452/hit-skill-control-s1-ari.wav"
 },
 "hit-skill-control-s1-popo": {
  "file": "assets/audio-v452/hit-skill-control-s1-popo.wav"
 },
 "hit-skill-control-s3-ari": {
  "file": "assets/audio-v452/hit-skill-control-s3-ari.wav"
 },
 "hit-skill-control-s3-popo": {
  "file": "assets/audio-v452/hit-skill-control-s3-popo.wav"
 },
 "hit-skill-guard-s1-ari": {
  "file": "assets/audio-v452/hit-skill-guard-s1-ari.wav"
 },
 "hit-skill-guard-s1-popo": {
  "file": "assets/audio-v452/hit-skill-guard-s1-popo.wav"
 },
 "hit-skill-guard-s3-ari": {
  "file": "assets/audio-v452/hit-skill-guard-s3-ari.wav"
 },
 "hit-skill-guard-s3-popo": {
  "file": "assets/audio-v452/hit-skill-guard-s3-popo.wav"
 },
 "swing-heavy-ari": {
  "file": "assets/audio-v452/swing-heavy-ari.wav"
 },
 "swing-heavy-popo": {
  "file": "assets/audio-v452/swing-heavy-popo.wav"
 },
 "swing-light-ari": {
  "file": "assets/audio-v452/swing-light-ari.wav"
 },
 "swing-light-popo": {
  "file": "assets/audio-v452/swing-light-popo.wav"
 }
});
(() => {
    const A=window.DreamAudioEngine.prototype, impact=A.impact, sfx=A.sfx;
    // skill-attack-2 shares the first-stage clip; stage 3 (master) has its own extra layer.
    const clip=f=>f.fx.startsWith('skill-')?f.fx.replace(/-(\d)$/,(m,s)=>'-s'+(s==='3'?3:1)):f.fx;
    const jitter=()=>.97+Math.random()*.06;
    A.combatSwing=function(profile){
        this.record({combatSwing:profile.kind,hero:profile.hero,grade:profile.grade,level:profile.level});
        this.play('swing-'+(profile.kind==='basic'?'light':'heavy')+'-'+profile.hero,{gain:.42,rate:jitter()});
    };
    A.combatLanding=function(profile){this.play('hit-plunge-'+profile.hero,{gain:.9,rate:jitter()});};
    A.impact=function(type,heavy,finish,x=0,profile=null){
        if(!profile?.fx)return impact.call(this,type,heavy,finish,x,profile);
        this.record({combatHit:profile.fx,hero:profile.hero,grade:profile.grade,level:profile.level,type});
        const now=this.ctx?.currentTime||0;
        if(now-(this.lastCombatHit??-1)<.055)return; // one transient per crowd hit
        this.lastCombatHit=now;
        const pan=(x-this.getScene().playerX)/800, rate=jitter()+profile.level*.006;
        // Skills and the burst already sounded on cast; their hits land as a short punch.
        const id=profile.fx==='burst'||profile.fx.startsWith('skill-')?'hit-light-1':'hit-'+clip(profile);
        this.play(id+'-'+profile.hero,{gain:id==='hit-light-1'&&profile.fx!=='light-1'?.7:1,rate,pan});
        if(profile.rank>=2)this.play('grade-'+profile.grade,{gain:profile.rank===3?.16:.12,pan});
        if(profile.level>=4)this.play('forge-resonance',{gain:.08,pan});
    };
    A.skillCast=function(profile){
        this.record({event:'skill',fx:profile.fx});if(!this.ctx||!this.settings.sound)return;
        this.play('hit-'+clip(profile)+'-'+profile.hero,{gain:1,rate:jitter()});
    };
    A.sfx=function(kind,subject){
        if(kind==='playerBurst'&&this.ctx&&this.settings.sound){this.record({event:kind});this.play('hit-burst-'+(this.getScene().hero==='popo'?'popo':'ari'),{gain:1});return;}
        return sfx.call(this,kind,subject);
    };
})();
