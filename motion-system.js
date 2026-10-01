'use strict';
window.DREAM_MOTION = {
    heroFrame(p) {
        if (p.climbing || p.lift || p.dodgeT > 0 || p.attackT > 0 || p.plunge || (p.chargeHeld && p.chargeT > .15) || (p.plungeLandT > 0 && p.grounded)) return -1;
        if (!p.grounded) return p.airJumpT > .2 ? 5 : p.vy < -140 ? 4 : p.vy > 140 ? 6 : 5;
        if (p.landSquash > .035 && (p.motionSpeed || 0) < 80) return 7;
        if ((p.motionSpeed || 0) > 165) return Math.floor((p.walkTime || 0) / (Math.PI * 2) * 4) % 4;
        return -1;
    },
    track(e, dt, oldX) {
        const moved = Math.abs(e.x - oldX), attacking = e.windup > 0 || e.action === 'strike' || (e.type === 'boss' && e.phase !== 'rest');
        const walking = !attacking && !e.dead && !(e.hurt > 0) && !(e.stun > 0) && !e.airFall && e.action !== 'recover';
        e.motionSpeed = walking ? moved / Math.max(.001, dt) : 0;
        if (walking && moved > .035) {
            e.walkPhase = (e.walkPhase || 0) + moved / (e.type === 'boss' ? 100 : e.variant === 'shoreSnail' ? 34 : 42);
            e.face = Math.sign(e.x - oldX);
        }
        if (e.previousPhase === 'release' && e.phase === 'rest') e.poseRecovery = .22;
        else e.poseRecovery = Math.max(0, (e.poseRecovery || 0) - dt);
        e.previousPhase = e.phase;
    },
    falling(e, dt) {
        if (!e.airFall || e.dead) return false;
        const floor = e.floorY ?? 651;
        e.fallVy = (e.fallVy || 0) + 1500 * dt;
        e.y = Math.min(floor, e.y + e.fallVy * dt);
        if (e.y >= floor) { e.airFall = false; e.fallVy = 0; }
        return true;
    },
    enemyFrame(e, reduced) {
        const id = e.variant || e.type;
        const walk = (e.motionSpeed || 0) > 2 ? Math.floor((e.walkPhase || 0) * 2) % 2 : 0;
        if (id === 'boss') return e.hurt > 0 ? 5 : e.phase === 'warn' ? (e.zone?.kind === 'stomp' ? 4 : 2) : e.phase === 'release' ? (e.zone?.kind === 'stomp' ? 5 : 3) : e.poseRecovery > 0 ? 5 : walk;
        if (['sand','crab','box'].includes(id)) return e.hurt > 0 || e.windup > 0 ? 2 : e.action === 'strike' ? 3 : walk;
        if (e.hurt > 0) return 'hurt';
        if (e.windup > 0) return 'warn';
        if (e.action === 'strike') return 'attack';
        if (id === 'tideBell') return e.action === 'recover' ? 3 : (e.motionSpeed || 0) > 2 ? walk : 2;
        if (id === 'windMoth' && !reduced) return Math.floor(e.elapsed * 4) % 2;
        return walk;
    }
};
