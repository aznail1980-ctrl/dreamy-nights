'use strict';
(() => {
    const R = window.DreamRenderer.prototype, actor = R.actor, world = R.drawRPGWorld;
    R.gateOpen = function (gate) {
        const f = this.r.state.flags;
        return !gate || gate === 'bossReady' ? (!gate || (f.readyForBoss && f.bridgeOpened)) : !!f[gate];
    };
    R.costume = function (look, x, y, face = 1, behind = false, p = {}) {
        const c = this.ctx, items = this.C.items, clock = this.r.clock;
        c.save();
        c.translate(x, y);
        const sway = this.r.settings.reducedMotion ? 0 : Math.sin(clock * 4 + (p.walkTime || 0)) * ((p.walkBlend || 0) * 6 + 2);
        c.strokeStyle = '#715970';
        c.lineWidth = 2;
        if (behind && look.back) {
            const id = look.back, color = items[id].color;
            c.save();
            c.translate(-face * 23, -87);
            if (id === 'nightCape') {
                c.fillStyle = color;
                c.beginPath();
                c.moveTo(0, -17);
                c.quadraticCurveTo(-face * 25, 5, -face * (38 + sway), 64);
                c.quadraticCurveTo(-face * 8, 78, 17, 46);
                c.lineTo(15, -11);
                c.closePath();
                c.fill();
                c.stroke();
            }
            else if (id === 'mailBag') {
                this.round(-16, 0, 38, 42, 9, color, '#886779');
                this.round(-18, -4, 42, 17, 6, '#dfb796');
                this.star(3, 21, 7, '#f6daa1');
            }
            else if (id === 'lampPack') {
                this.glow(0, 20, 43, '#f7d394');
                this.lantern(-15, 38, .28);
            }
            c.restore();
        }
        if (!behind) {
            if (look.neck) {
                c.save();
                c.translate(face * 2, -88);
                c.rotate(face * .06);
                this.round(-24, -3, 45, 12, 6, items[look.neck].color, '#a38c90');
                c.fillStyle = items[look.neck].color;
                c.beginPath();
                c.moveTo(face * 11, 6);
                c.lineTo(face * (25 + sway * .3), 30);
                c.lineTo(face * 9, 37);
                c.lineTo(face * 2, 6);
                c.fill();
                c.stroke();
                c.restore();
            }
            if (look.head) {
                const id = look.head, color = items[id].color;
                c.save();
                c.translate(face * 6, -173);
                c.rotate(face * .08);
                if (id === 'roseBow') {
                    c.fillStyle = color;
                    c.beginPath();
                    c.moveTo(0, 0);
                    c.bezierCurveTo(-35, -30, -43, 11, -4, 8);
                    c.bezierCurveTo(42, 20, 35, -24, 0, 0);
                    c.fill();
                    c.stroke();
                    this.ellipse(0, 3, 7, 7, '#f6d8af');
                }
                if (id === 'seaBeret') {
                    this.ellipse(0, 2, 33, 13, color);
                    this.round(-22, 6, 46, 8, 4, '#6f9cae');
                    this.star(13, 0, 8, '#f4d6a0');
                }
                if (id === 'starCrown') {
                    c.fillStyle = color;
                    c.beginPath();
                    c.moveTo(-25, 10);
                    c.lineTo(-30, -13);
                    c.lineTo(-12, -4);
                    c.lineTo(0, -25);
                    c.lineTo(12, -4);
                    c.lineTo(29, -13);
                    c.lineTo(24, 10);
                    c.closePath();
                    c.fill();
                    c.stroke();
                    this.star(0, 0, 7, '#ffefb5');
                }
                c.restore();
            }
            if (look.aura) {
                for (let i = 0; i < 5; i++)
                    this.star(-face * (14 + i * 18), 4 - Math.sin(clock * 3 + i) * 6, 3 + i % 2, '#f3d39b', clock * .6 + i);
            }
        }
        c.restore();
    };
    R.actor = function (who, x, y, face = 1, active = false) {
        if (active)
            this.costume(this.r.state.world.look, x, y, face, true, this.r.player);
        actor.call(this, who, x, y, face, active);
        if (active)
            this.costume(this.r.state.world.look, x, y, face, false, this.r.player);
    };
    R.previewHero = function (canvas, state) {
        const preview = new window.DreamRenderer(canvas, this.images, this.C);
        preview.r = { state, clock: 0, settings: { reducedMotion: true }, player: { grounded: true, groundY: 651, walkBlend: 0, attackT: 0, invincible: 0 }, companion: {} };
        const c = preview.ctx;
        c.clearRect(0, 0, 360, 390);
        c.save();
        c.scale(1.6, 1.6);
        preview.actor(state.active, 112.5, 223, 1, true);
        c.restore();
    };
    R.drawRegionBackdrop = function (r) {
        const map = this.C.maps[r.state.map], c = this.ctx, t = r.clock;
        if (['tide', 'garden', 'observatory', 'archive', 'waterway'].includes(map.theme)) {
            const colors = { tide: ['#354a6ccf', '#789fb284'], garden: ['#6c889f66', '#bad0b46b'], observatory: ['#313b65ce', '#7b769587'], archive: ['#44364dda', '#927b92b2'], waterway: ['#344e69ed', '#5e9caba8'] }[map.theme], g = c.createLinearGradient(0, 0, 0, 650);
            g.addColorStop(0, colors[0]);
            g.addColorStop(1, colors[1]);
            c.fillStyle = g;
            c.fillRect(0, 0, 1440, 651);
        }
        c.save();
        c.translate(-r.camera * .66, 0);
        if (map.theme === 'tide') {
            for (let i = 0; i < 9; i++) {
                const x = i * 470 - 90;
                this.round(x, 0, 86, 610, 35, '#516580');
                this.ellipse(x + 95, 30, 180, 170, '#50617b');
                this.ellipse(x + 80, 603, 160, 38, '#7392a5');
            }
            for (let i = 0; i < 22; i++) {
                const x = i * 167 + 120;
                this.glow(x, 470 + Math.sin(i) * 70, 15, '#a6e3db');
                this.star(x, 470 + Math.sin(i) * 70, 5, '#c7eeeb', t * .3);
            }
        }
        if (map.theme === 'garden') {
            for (let i = 0; i < 7; i++) {
                const x = i * 520 + 200;
                this.round(x - 15, 350, 30, 300, 10, '#8e889b');
                for (let j = 0; j < 4; j++)
                    this.ellipse(x + (j - 1.5) * 40, 335 + Math.sin(j) * 30, 110, 105, ['#a7bbc0', '#bec5bf', '#96b3b6', '#b1b8ca'][j]);
            }
            for (let i = 0; i < 10; i++) {
                const x = i * 360 + 90;
                c.strokeStyle = '#eee4ca77';
                c.beginPath();
                c.moveTo(x, 430);
                c.bezierCurveTo(x + 60, 380, x + 80, 310, x + 120, 300);
                c.stroke();
                c.save();
                c.translate(x + 120, 300);
                c.rotate(Math.sin(t + i) * .1);
                c.fillStyle = '#dbb9b5';
                c.beginPath();
                c.moveTo(0, -27);
                c.lineTo(20, 0);
                c.lineTo(0, 32);
                c.lineTo(-20, 0);
                c.fill();
                c.restore();
            }
        }
        if (map.theme === 'observatory') {
            const x = 1080;
            this.round(x - 300, 305, 600, 340, 8, '#807896', '#b7a6b6');
            this.ellipse(x, 310, 305, 205, '#6c7090');
            this.round(x - 325, 315, 650, 28, 8, '#b19db4');
            this.round(x - 63, 418, 126, 232, [60, 60, 0, 0], '#454762');
            for (let i = 0; i < 5; i++)
                this.star(x - 220 + i * 105, 293 - Math.sin(i) * 45, 10, '#eddaaa', .2);
            c.save();
            c.translate(x + 260, 396);
            c.rotate(-.52);
            this.round(-14, -25, 215, 50, 15, '#cfb99e', '#8d819c');
            this.round(162, -30, 26, 60, 8, '#8c819e');
            c.restore();
            this.glow(x, 310, 120, '#b7bbe6');
        }
        if (map.theme === 'archive') {
            for (let i = 0; i < 8; i++) {
                const x = i * 360 + 100;
                this.round(x, 185, 270, 465, 8, '#6c5574', '#a78b9c');
                for (let row = 0; row < 4; row++) {
                    this.round(x + 5, 268 + row * 93, 260, 10, 1, '#b299a6');
                    for (let j = 0; j < 9; j++)
                        this.round(x + 18 + j * 26, 214 + row * 93, 18, 53, 2, ['#b9979c', '#8599a5', '#c1b79b', '#b2a1b7'][(j + row) % 4]);
                }
            }
        }
        if (map.theme === 'waterway') {
            for (let i = 0; i < 9; i++) {
                const x = i * 440;
                this.round(x, 140, 80, 510, 8, '#5c748a');
                c.strokeStyle = '#8da0ac';
                c.lineWidth = 34;
                c.beginPath();
                c.arc(x + 258, 335, 190, Math.PI, 0);
                c.stroke();
                this.round(x + 120, 510, 250, 90, 14, '#447d92');
                for (let j = 0; j < 5; j++) {
                    c.strokeStyle = '#93d3d275';
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(x + 130 + j * 28, 548 + Math.sin(t + j) * 8);
                    c.lineTo(x + 174 + j * 28, 548 + Math.sin(t + j) * 8);
                    c.stroke();
                }
            }
        }
        c.restore();
    };
    R.drawRPGWorld = function (r) {
        world.call(this, r);
        const c = this.ctx, s = r.state;
        if (s.map === 5)
            this.sign(390, 605, '파도가 남긴 비문', '낮은 종 → 높은 종 → 가운데 종');
        if (s.map === 6)
            this.sign(350, 605, '바람지기의 약속', '서쪽부터 동 → 서 → 북');
        for (const o of this.C.objects) {
            if (o.map !== s.map)
                continue;
            const x = o.x, y = o.y, done = o.kind === 'tideBell' ? s.flags.tideAttuned : o.kind === 'windVane' ? s.flags.windAttuned : false;
            c.save();
            if (o.kind === 'tideBell') {
                this.round(x - 5, y - 144, 10, 144, 4, '#92a5b7');
                this.round(x - 40, y - 153, 80, 12, 5, '#bed5d3');
                c.fillStyle = done ? '#f0d8a0' : '#a6c7cb';
                c.beginPath();
                c.moveTo(x - 17, y - 129);
                c.quadraticCurveTo(x - 15, y - 72, x - 35, y - 70);
                c.lineTo(x + 35, y - 70);
                c.quadraticCurveTo(x + 15, y - 72, x + 17, y - 129);
                c.closePath();
                c.fill();
                this.ellipse(x, y - 67, 35, 5, '#d7e0cf');
                this.text(['낮은 종', '가운데 종', '높은 종'][o.index], x, y - 173, 15, '#eff0d2');
                if (done)
                    this.glow(x, y - 93, 70, '#f4d99f');
            }
            if (o.kind === 'windVane') {
                this.round(x - 4, y - 161, 8, 161, 4, '#a699a4');
                c.save();
                c.translate(x, y - 153);
                c.rotate((s.world.vanes[o.index] || 0) * Math.PI / 2);
                c.fillStyle = done ? '#f1d79b' : '#c7bcd7';
                c.beginPath();
                c.moveTo(0, -41);
                c.lineTo(19, 3);
                c.lineTo(3, -2);
                c.lineTo(3, 32);
                c.lineTo(-3, 32);
                c.lineTo(-3, -2);
                c.lineTo(-19, 3);
                c.closePath();
                c.fill();
                c.restore();
                this.text(['북', '동', '남', '서'][s.world.vanes[o.index] || 0], x, y - 215, 20, '#fff0c7');
            }
            if (o.kind === 'starChart') {
                this.round(x - 92, y - 94, 184, 91, 14, '#7f7498', '#bea9b6');
                this.ellipse(x, y - 91, 107, 40, '#bfc1d5');
                c.strokeStyle = '#f5dfa8';
                c.lineWidth = 2;
                for (let i = 0; i < 5; i++) {
                    const a = i * 1.25;
                    this.star(x + Math.cos(a) * 66, y - 92 + Math.sin(a) * 24, 7, '#f7e5b8');
                }
                this.text('바다와 바람의 별지도', x, y - 149, 18, '#fff0d4');
            }
            if (o.kind === 'archiveBook') {
                this.round(x - 50, y - 86, 100, 86, 8, '#a1818f');
                c.save();
                c.translate(x, y - 94);
                c.rotate(-.08);
                this.round(-59, -12, 118, 42, 4, '#f0dfc1', '#9e8290');
                c.strokeStyle = '#b59b9c';
                c.beginPath();
                c.moveTo(0, -12);
                c.lineTo(0, 30);
                c.stroke();
                c.restore();
                this.glow(x, y - 100, 65, '#f4daa5');
                this.text('반장의 마지막 기록', x, y - 158, 18, '#f6e4cf');
            }
            if (o.kind === 'waterWheel') {
                c.translate(x, y - 118);
                const moving = s.flags.bridgeOpened;
                c.rotate(moving ? r.clock * .38 : 0);
                c.strokeStyle = '#ccb59b';
                c.lineWidth = 12;
                c.beginPath();
                c.arc(0, 0, 100, 0, Math.PI * 2);
                c.stroke();
                for (let i = 0; i < 8; i++) {
                    c.save();
                    c.rotate(i * Math.PI / 4);
                    this.round(-8, -103, 16, 206, 3, '#968ea3');
                    this.round(-27, 80, 54, 25, 5, '#c2ae9e');
                    c.restore();
                }
                this.ellipse(0, 0, 25, 25, '#dec894');
            }
            if (o.kind === 'treasure') {
                this.chest(x, y, s.world.treasure.includes(o.id), 96);
            }
            c.restore();
        }
    };
    R.drawHitEffects = function (r) {
        const c = this.ctx;
        for (const v of r.impacts || []) {
            const k = v.life / v.max, size = (v.heavy ? 76 : 49) * (1.3 - k * .3);
            c.save();
            c.translate(v.x, v.y);
            c.rotate(v.seed);
            c.globalAlpha = k;
            c.strokeStyle = '#fff8e0';
            c.lineWidth = v.heavy ? 5 : 3;
            for (let i = 0; i < 8; i++) {
                const a = i * Math.PI / 4;
                c.beginPath();
                c.moveTo(Math.cos(a) * size * .23, Math.sin(a) * size * .23);
                c.lineTo(Math.cos(a) * size * (i % 2 ? .7 : 1), Math.sin(a) * size * (i % 2 ? .7 : 1));
                c.stroke();
            }
            this.star(0, 0, Math.max(6, size * k * .58), '#fff5d7');
            c.strokeStyle = '#e6b37f';
            c.lineWidth = 2;
            c.beginPath();
            c.arc(0, 0, size * (1 - k * .2), 0, Math.PI * 2);
            c.stroke();
            c.restore();
        }
        const p = r.player;
        if (p.attackT > 0 && p.attackT < (p.attackLength || .38) * .8) {
            const progress = 1 - p.attackT / (p.attackLength || .38);
            c.save();
            c.translate(p.x + p.facing * 25, p.y - 92);
            if (p.facing < 0)
                c.scale(-1, 1);
            c.rotate(-.5);
            c.strokeStyle = '#fff4ce';
            c.lineWidth = p.combo === 3 ? 10 : 6;
            c.globalAlpha = Math.max(0, 1 - progress);
            c.beginPath();
            c.arc(0, 0, p.combo === 3 ? 133 : 112, -1.2 + progress, .7 + progress);
            c.stroke();
            c.strokeStyle = '#eabf9955';
            c.lineWidth = 20;
            c.stroke();
            c.restore();
        }
    };
})();
