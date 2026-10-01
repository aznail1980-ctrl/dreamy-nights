'use strict';
/* Small deterministic rules shared by keyboard/touch input and collision checks. */
window.DREAM_AIR = {
    reset(p) { p.airJumpUsed = false; p.plungeUsed = false; },
    jump(p) {
        if (p.plunge || p.climbing || p.lift || p.hitT > 0) return null;
        const first = p.grounded || p.coyote > 0;
        if (!first && p.airJumpUsed) return null;
        if (!first) { p.airJumpUsed = true; p.airJumpT = .32; }
        p.vy = first ? (p.jumpReleased ? -600 : -820) : (p.jumpReleased ? -520 : -700);
        p.jumpCutAvailable = !p.jumpReleased;
        p.grounded = false; p.coyote = 0; p.jumpBuffer = 0;
        return first ? 'ground' : 'air';
    },
    begin(p) {
        if (p.grounded || p.climbing || p.lift || p.plunge || p.plungeUsed || p.dodgeT > 0 || p.hitT > 0) return false;
        p.plunge = { windup: .12, age: 0, hits: [] };
        p.plungeUsed = true; p.jumpBuffer = 0; p.coyote = 0;
        p.pendingStrike = null; p.attackT = 0; p.attackBuffer = 0; p.chargeLevel = 0;
        p.vx *= .5; p.vy = 0;
        return true;
    },
    fall(p, dt) {
        if (!p.plunge) return;
        p.plunge.age += dt; p.plunge.windup = Math.max(0, p.plunge.windup - dt);
        // stepBody applies gravity afterwards. Freeze only during the short windup.
        p.vy = p.plunge.windup > 0 ? -1950 * dt : Math.max(920, Math.min(1200, p.vy));
    },
    canHit(p, e, oldY, size, radius, platforms, landing = false) {
        if (!p.plunge || e.dead || p.plunge.hits.includes(e.id)) return false;
        const floor = e.floorY ?? e.y;
        if (landing) return Math.abs(e.x - p.x) < 100 + radius && Math.abs(floor - p.y) < 36 && e.y > p.y - 75;
        if (p.plunge.windup > 0 || Math.abs(e.x - p.x) > 38 + radius) return false;
        // Sweep feet across the whole frame to catch small enemies at high descent speed.
        if (e.y < oldY - 12 || e.y - size * .88 > p.y + 24) return false;
        return !platforms.some(f => p.x >= f.x - 12 && p.x <= f.x + f.w + 12 && f.y >= Math.min(oldY, p.y) - 4 && f.y < floor - 5);
    }
};
