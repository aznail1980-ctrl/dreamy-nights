'use strict';
(() => {
    const R = window.DreamRenderer.prototype, actor = R.actor;
    R.actor = function (who, x, y, face = 1, active = false) {
        const r = this.r, p = r.player, c = this.ctx;
        const recovering = p.plungeLandT > 0 && p.grounded && !p.climbing && !(p.dodgeT > 0) && !(p.attackT > 0) && !p.chargeHeld;
        if (!active || (!p.plunge && !recovering)) return actor.call(this, who, x, y, face, active);
        const windup = p.plunge && p.plunge.windup > 0;
        const frame = windup ? 2 : p.plunge ? 4 : p.plungeLandT > .13 ? 4 : 5;
        const sheet = window.DREAM_ART_V44.sheets[who + 'ChargeV44'];
        const box = sheet.frames[frame], pivot = sheet.pivots[frame], scale = sheet.scale;
        const pose = { who, kind: 'attack', source: 'charge', frame, pins: sheet.pins[frame] };
        this.ellipse(x, p.groundY ?? y, 28, 4, '#48455630');
        if (p.plunge && !windup) {
            c.save();
            c.translate(x, y);
            const glow = c.createLinearGradient(0, -180, 0, 18);
            glow.addColorStop(0, '#fff3c000'); glow.addColorStop(1, '#fff3c080');
            c.fillStyle = glow;
            c.beginPath(); c.moveTo(-42, -165); c.lineTo(-33, -25); c.lineTo(0, 22); c.lineTo(33, -25); c.lineTo(42, -165); c.closePath(); c.fill();
            c.strokeStyle = '#fff5d2'; c.lineWidth = 3; c.lineCap = 'round';
            const flow = r.settings.reducedMotion ? 0 : (r.clock * 80) % 26;
            for (const dx of [-43, 43]) { c.beginPath(); c.moveTo(dx, -105 - flow); c.lineTo(dx, -53 - flow); c.stroke(); }
            this.star(0, 9, 12, '#fff3c7');
            c.restore();
        }
        c.save(); c.translate(x, y); c.scale(face, 1);
        if (!r.settings.reducedMotion) {
            const lean = windup ? -.06 : p.plunge ? .09 : 0;
            c.rotate(lean);
            if (p.plungeLandT > .13) c.scale(1.025, .975);
        }
        if (p.invincible > 0 && !r.settings.reducedMotion && Math.floor(r.clock * 12) % 2 === 0) c.globalAlpha = .75;
        const body = () => {
            c.save(); c.scale(sheet.flips[frame], 1);
            c.drawImage(this.images[who + 'ChargeV44'], ...box, (box[0] - pivot[0]) * scale, (box[1] - pivot[1]) * scale, box[2] * scale, box[3] * scale);
            c.restore();
        };
        // Keep the same equipment pins and weapon overlay used by ground attacks.
        this.costume(r.state.world.look, pose, 'back', body);
        body();
        this.costume(r.state.world.look, pose, 'front', body);
        c.restore();
    };
})();
