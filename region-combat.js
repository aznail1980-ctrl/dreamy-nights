'use strict';
window.updateDreamRegionEnemy=function(e,dt,api){
    const d=window.DREAM_CONTENT.regionCreatures[e.variant];
    const {player,waves,advance,damage,sound}=api,floor=e.floorY??651;
    const fire=(vy=0,gravity=0)=>waves.push({x:e.x+e.attackFace*48,y:floor-55,vx:e.attackFace*(d.pattern==='seed'?175:190),vy,gravity,life:1.55,r:d.pattern==='wake'?19:14,damage:1,kind:d.projectile||(d.pattern==='wake'?'tideBubble':'region'),icon:d.material,hit:false});
    e.timer-=dt;
    if(e.action==='recover'){
        e.y=floor;e.actionT-=dt;
        if(e.actionT<=0){e.action=null;e.timer=1.25;}
        return;
    }
    if(e.action==='strike'){
        e.actionT-=dt;
        const phase=Math.min(1,1-e.actionT/e.actionLength);
        if(['rush','hop','wake'].includes(d.pattern)){
            e.y=floor-(d.pattern==='hop'?Math.sin(phase*Math.PI)*65:0);
            advance(e,e.attackFace*d.speed*dt);
            if(!e.didHit&&Math.abs(e.x-player.x)<74&&Math.abs(e.y-player.y)<100){damage(1,e.x);e.didHit=true;}
        }
        if(d.pattern==='double'&&!e.secondShot&&phase>=.55){fire(0);e.secondShot=true;}
        if(e.actionT<=0){
            if(d.pattern==='wake')fire(0);
            e.y=floor;e.action='recover';e.actionT=1.15;
        }
        return;
    }
    if(e.windup>0){
        e.windup-=dt;
        if(e.windup<=0){
            e.action='strike';e.actionLength=d.duration||.65;e.actionT=e.actionLength;e.didHit=false;e.secondShot=false;
            if(d.pattern==='fan'){fire(-32);fire(32);}
            if(d.pattern==='seed')fire(-125,220);
            if(d.pattern==='double')fire(0);
            sound({hop:'regionHop',rush:'regionRush',fan:'regionFan',seed:'regionSeed',double:'regionInk',wake:'regionWake'}[d.pattern]);
        }
        return;
    }
    e.y=floor;
    if(Math.abs(player.y-floor)<115&&!player.climbing&&Math.abs(player.x-e.x)<d.range&&e.timer<=0){
        e.windup=d.warning;e.attackFace=Math.sign(player.x-e.x)||e.face;e.face=e.attackFace;
    }else{
        const target=e.home+Math.sin(e.elapsed*.55)*32;
        e.x+=Math.sign(target-e.x)*Math.min(22*dt,Math.abs(target-e.x));
    }
};
