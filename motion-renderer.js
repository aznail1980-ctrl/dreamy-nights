'use strict';
(() => {
    const R = window.DreamRenderer.prototype, oldActor = R.actor, oldEnemy = R.enemy;
    const art = window.DREAM_MOTION_ART, motion = window.DREAM_MOTION;
    R.actor = function (who, x, y, face = 1, active = false) {
        const r = this.r, p = r.player, frame = active ? motion.heroFrame(p) : -1;
        if (frame < 0 || !art.hero[who]) return oldActor.call(this, who, x, y, face, active);
        const spec = art.hero[who], box = spec.frames[frame], pivot = spec.pivots[frame], sc = spec.scale, c = this.ctx;
        const pose = { who, source: 'motion', kind: frame < 4 ? 'run' : 'jump', frame, pins: spec.pins[frame] };
        const floor = p.groundY ?? y;
        this.ellipse(x, floor + 3, Math.max(12, 24 - Math.max(0, floor - y) * .028), 4, '#48455630');
        c.save(); c.translate(x, y); c.scale(face, 1);
        if (p.invincible > 0 && !r.settings.reducedMotion && Math.floor(r.clock * 12) % 2 === 0) c.globalAlpha = .75;
        const body = () => c.drawImage(this.images[spec.key], ...box, (box[0] - pivot[0]) * sc, (box[1] - pivot[1]) * sc, box[2] * sc, box[3] * sc);
        this.costume(r.state.world.look, pose, 'back', body); body(); this.costume(r.state.world.look, pose, 'front', body);
        if (r.state.rpg.protection) {
            c.strokeStyle = '#fff0b1aa'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -64, 46, 77, 0, 0, Math.PI * 2); c.stroke();
        }
        c.restore();
    };
    R.enemy = function (e) {
        const id = e.variant || e.type, spec = art.creatures[id];
        if (!spec) return oldEnemy.call(this, e);
        if (e.dead && e.fade <= 0) return;
        const c = this.ctx, r = this.r, floor = e.floorY ?? 651, reduced = r.settings.reducedMotion;
        const def = this.C.regionCreatures?.[id] || this.C.creatures[e.type];
        const frame = motion.enemyFrame(e, reduced), height = spec.height;
        let key = spec.key, box, pivot, sc = spec.scale;
        if (typeof frame === 'number') { box = spec.frames[frame]; pivot = spec.pivots[frame]; }
        else {
            const index = { warn: 1, attack: 2, hurt: 3 }[frame];
            if (id === 'tideBell') {
                key = 'tideBellCrabV414'; box = [(index % 2) * 627, Math.floor(index / 2) * 627, 627, 627];
                pivot = [box[0] + [285,285,285,300][index], box[1] + [583,588,555,556][index]]; sc = .215;
            } else {
                const old = window.DREAM_REGION_ART[id]; key = id + 'V415'; box = old.frames[index]; sc = def.size / old.frames[0][3];
                pivot = [box[0] + box[2] / 2, box[1] + box[3]];
            }
        }
        this.ellipse(e.x, floor + 3, Math.min(90, height * .32), e.type === 'boss' ? 9 : 5, '#45576430');
        const attacking = e.windup > 0 || e.action === 'strike';
        const face = e.type === 'boss' && e.phase !== 'rest' ? (e.zone?.face || e.face || 1) : attacking ? (e.attackFace || e.face || 1) : e.face || 1;
        c.save(); c.translate(e.x, e.y); c.scale(face, 1);
        if (e.dead) { const k = Math.max(0, e.fade / .55); c.globalAlpha = k; c.scale(.65 + .35 * k, .65 + .35 * k); }
        else if (e.hurt > 0) {
            if (!reduced) c.rotate(-Math.min(.1, e.hurt * .35));
            c.filter = 'brightness(' + (1 + Math.min(.65, e.hurt * 2.3)) + ')';
        } else if (!reduced && !(e.motionSpeed > 2) && !attacking && (!e.phase || e.phase === 'rest')) {
            c.scale(1, 1 + Math.sin(e.elapsed * 2.4) * .008);
        }
        c.drawImage(this.images[key], ...box, (box[0] - pivot[0]) * sc, (box[1] - pivot[1]) * sc, box[2] * sc, box[3] * sc);
        c.restore();
        if (e.dead) return;
        if (e.type !== 'boss') {
            this.text('Lv. ' + (e.level || 1) + ' · ' + (id === 'tideBell' ? '조수종 소라게' : def.name), e.x, e.y - height - 23, 12, '#fff4dc', 'center', 650);
            if (e.hp < e.max) {
                this.round(e.x - 28, e.y - height - 12, 56, 4, 2, '#33435988');
                this.round(e.x - 28, e.y - height - 12, 56 * Math.max(0, e.hp / e.max), 4, 2, def.color || '#a4eadc');
            }
            if (e.windup > 0) {
                this.text(id === 'tideBell' ? '♪ 거품 준비' : '!', e.x, e.y - height - 47, id === 'tideBell' ? 14 : 23, '#fff0a8', 'center', 800);
                const span = id === 'tideBell' ? 300 : def.range ? Math.min(260, def.range) : e.type === 'box' ? 390 : 220;
                c.save(); c.strokeStyle = '#ffe4a5'; c.lineWidth = 2; c.setLineDash([8,8]); c.beginPath();
                c.moveTo(e.x + face * 35, floor - 4); c.lineTo(e.x + face * span, floor - 4); c.stroke(); c.restore();
            } else if (e.action === 'recover') this.text('정화할 틈!', e.x, e.y - height - 44, 12, '#fff1bd');
        } else if (e.phase === 'warn' && e.zone) {
            c.save(); c.fillStyle = '#f5b8d040';
            if (e.zone.kind === 'sneeze') {
                const x1 = e.x + e.zone.face * 60, x2 = e.x + e.zone.face * 760;
                c.beginPath(); c.moveTo(x1, floor - 10); c.lineTo(x2, floor - 90); c.lineTo(x2, floor + 10); c.closePath(); c.fill();
                c.strokeStyle = '#f6c8dbaa'; c.setLineDash([9,7]); c.beginPath(); c.moveTo(x1, floor + 2); c.lineTo(x2, floor + 2); c.stroke();
                this.text('↑ 점프!', (x1 + x2) / 2, floor - 25, 17, '#fbe8df');
            } else {
                this.ellipse(e.zone.x, floor, 156, 21, '#f8bbd360'); this.text('↔ 비켜서기', e.zone.x, floor - 34, 17, '#fbe8df');
            }
            c.restore();
        }
    };
})();
