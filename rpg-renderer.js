'use strict';
(() => {
    const R = window.DreamRenderer.prototype;
    R.actor = function (who, x, y, face = 1, active = false) {
        const c = this.ctx, r = this.r, p = active ? r.player : r.companion, size = active ? 192 : 186, blend = p.walkBlend || 0, t = p.walkTime || 0, ground = p.grounded !== false, reduce = r.settings.reducedMotion;
        const breath = Math.sin(r.clock * 2.2 + (active ? 0 : 1)) * .006;
        const bounce = reduce ? 0 : ground ? Math.abs(Math.sin(t)) * blend * 3.1 : 0;
        const stretch = ground ? (p.landSquash > 0 ? 1 - Math.sin(p.landSquash / .18 * Math.PI) * .07 : 1 + breath) : 1.03;
        const lean = reduce ? 0 : (p.lean || 0) * .052;
        const groundY = p.groundY || this.G, altitude = Math.max(0, groundY - y);
        this.ellipse(x, groundY + 5, Math.max(18, 36 - altitude * .07), Math.max(3, 7 - altitude * .015), '#60446b30');
        c.save();
        c.globalAlpha = active && p.invincible > 0 && Math.floor(r.clock * 12) % 2 === 0 ? .69 : 1;
        c.translate(x, y - bounce);
        c.rotate(lean);
        if (active && p.dodgeT > 0) {
            c.rotate(-face * .16);
            this.glow(0, -80, 70, '#e6d5ff');
        }
        let attackWeight = 0;
        if (active && p.attackT > 0) {
            const duration = p.attackLength || .38, progress = 1 - Math.min(1, p.attackT / duration);
            attackWeight = progress < .2 ? progress / .2 : progress > .66 ? (1 - progress) / .34 : 1;
            attackWeight = Math.max(0, Math.min(1, attackWeight));
        }
        if (attackWeight < .98) {
            c.save();
            c.globalAlpha *= 1 - attackWeight * .94;
            if (who === 'ari') {
                const scale = size / 657;
                c.scale(face === 1 ? -scale : scale, scale * stretch);
                c.translate(-270, -722);
                const angles = ground ? [Math.sin(t) * .45 * blend, Math.sin(t + Math.PI) * .45 * blend] : [-.38, .27];
                for (const [key, pivot, which] of [['ariLegBack', 190, 0], ['ariLegFront', 300, 1]]) {
                    c.save();
                    c.translate(pivot, 595);
                    c.rotate(reduce ? 0 : angles[which]);
                    c.translate(-pivot, -595);
                    c.drawImage(this.images[key], 0, 575, 533, 89, 0, 575, 533, 89);
                    c.save();
                    c.translate(pivot, 651);
                    c.rotate(reduce ? 0 : Math.max(0, Math.sin(t + (which ? Math.PI : 0))) * .32 * blend);
                    c.drawImage(this.images[key], 0, 645, 533, 115, -pivot, 645 - 651, 533, 115);
                    c.restore();
                    c.restore();
                }
                c.save();
                c.translate(265, 592);
                c.rotate(reduce ? 0 : Math.sin(t * 2) * .008 * blend);
                c.translate(-265, -592);
                c.drawImage(this.images.ariBody, 0, 0);
                c.restore();
            }
            else {
                const im = this.images.popoSide, sc = size / im.height;
                c.scale(face === 1 ? -sc : sc, sc * stretch);
                c.translate(-165, -682);
                const angle = ground ? Math.sin(t) * .46 * blend : -.38;
                for (const back of [true, false]) {
                    c.save();
                    c.translate(back ? 155 : 168, 512);
                    c.rotate(reduce ? 0 : back ? -angle : angle);
                    c.translate(-168, -512);
                    if (back)
                        c.globalAlpha *= .83;
                    c.drawImage(im, 0, 508, 330, 82, 0, 508, 330, 82);
                    c.save();
                    c.translate(168, 587);
                    c.rotate(reduce ? 0 : Math.max(0, Math.sin(t + (back ? Math.PI : 0))) * .35 * blend);
                    c.drawImage(im, 0, 582, 330, 100, -168, -5, 330, 100);
                    c.restore();
                    c.restore();
                }
                c.drawImage(im, 0, 238, 330, 278, 0, 238, 330, 278);
                c.save();
                c.translate(156, 243);
                c.rotate(reduce ? 0 : (Math.sin(t * 2) * .012 * blend + Math.sin(r.clock * 1.9) * .007));
                c.drawImage(im, 0, 0, 330, 247, -156, -243, 330, 247);
                c.restore();
            }
            c.restore();
        }
        if (attackWeight > 0) {
            c.save();
            c.globalAlpha *= attackWeight;
            c.scale(face, 1);
            const im = this.images[who === 'ari' ? 'ariAttack' : 'popoAttack'], hh = size * .95, ww = hh * im.width / im.height;
            c.rotate(-.06 * attackWeight);
            c.drawImage(im, -88 - attackWeight * 5, -hh, ww, hh);
            c.restore();
        }
        if (active && r.state.rpg.protection) {
            c.save();
            c.strokeStyle = '#f8e6b58a';
            c.lineWidth = 2;
            c.beginPath();
            c.ellipse(0, -90, 72, 106, 0, 0, Math.PI * 2);
            c.stroke();
            c.restore();
        }
        c.restore();
        if (active)
            this.text(who === 'ari' ? '아리' : '포포', x, y - size - 19, 13, '#584262');
    };
    R.drawNPC = function (id) {
        const n = this.C.npcs[id], r = this.r, c = this.ctx, im = this.images[n.image], h = id === 'post' ? 158 : 211, w = h * im.width / im.height, t = r.clock;
        this.ellipse(n.x, this.G + 4, w * .3, 7, '#75587827');
        c.save();
        c.translate(n.x, this.G);
        c.scale(1, 1 + Math.sin(t * 1.7 + n.x) * .009);
        c.drawImage(im, -w / 2, -h, w, h);
        c.restore();
        this.round(n.x - 67, this.G - h - 48, 134, 31, 15, '#fff0dbe9', '#d4b9c478');
        this.text(n.name, n.x, this.G - h - 27, 15, '#745877', 'center', 650);
        const mark = r.rpgInfo?.npcMarks[id] || '…';
        this.text(mark, n.x, this.G - h - 61, 24, mark === '!' ? '#ffe7a4' : '#9b7b98', 'center', 700);
    };
    R.drawRPGWorld = function (r) {
        const c = this.ctx, s = r.state;
        if (s.map === 2) {
            c.save();
            c.translate(this.C.npcs.madeleine.home - 490, 0);
            this.round(345, 484, 281, 159, 8, '#d6b5ad', '#b991a1');
            this.round(323, 469, 323, 38, 9, '#a4b9ae');
            for (let i = 0; i < 7; i++)
                this.round(329 + i * 46, 467, 23, 45, 4, '#e6d9bb');
            this.round(365, 531, 110, 71, 7, '#ffe4b8', '#b89499');
            this.text('마들렌의 작은 주방', 482, 453, 19, '#715771', 'center', 650);
            c.restore();
            c.save();
            c.translate(this.C.npcs.post.home - 1580, 0);
            this.round(1470, 516, 215, 125, 8, '#b19bab', '#937991');
            this.round(1524, 489, 130, 54, 8, '#e3bbb1', '#937991');
            this.text('꿈편지 우체국', 1577, 473, 17, '#735572', 'center', 650);
            this.round(1554, 545, 75, 12, 6, '#775f81');
            c.restore();
            this.hut(this.C.npcs.lumen.home);
            for (const id of Object.keys(this.C.npcs))
                this.drawNPC(id);
        }
        for (const obj of this.C.objects) {
            if (obj.map !== s.map)
                continue;
            const x = obj.x, y = obj.y;
            if (obj.kind === 'herb') {
                if (s.rpg.gathered.includes(obj.id)) {
                    this.ellipse(x, y, 8, 2, '#a6aa9066');
                    continue;
                }
                c.save();
                c.translate(x, y);
                c.rotate(Math.sin(r.clock * 2 + x) * .07);
                c.strokeStyle = '#89a083';
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(0, 0);
                c.quadraticCurveTo(9, -16, 0, -40);
                c.stroke();
                c.save();
                c.rotate(-.5);
                this.ellipse(-5, -25, 7, 13, '#adc8a0');
                c.restore();
                c.save();
                c.rotate(.55);
                this.ellipse(6, -18, 7, 12, '#c0d1a5');
                c.restore();
                this.star(0, -45, 7, '#ffedae');
                c.restore();
            }
            if (obj.kind === 'chest') {
                const open = s.rpg.opened.includes(obj.id);
                this.chest(x, y, open, 92);
            }
            if (obj.kind === 'beacon') {
                const lit = s.rpg.beacons.includes(obj.id);
                this.round(x - 6, y - 81, 12, 81, 4, '#957b8d');
                this.round(x - 22, y - 133, 44, 53, 12, lit ? '#f7deb0' : '#a2a0b3', '#8f7693');
                this.round(x - 25, y - 87, 50, 9, 3, '#c6a2a7');
                if (lit) {
                    this.glow(x, y - 104, 100);
                    this.star(x, y - 105, 15, '#fff2c2');
                }
                else
                    this.text('✧', x, y - 99, 23, '#ddd4e2');
            }
            if (obj.kind === 'altar') {
                this.round(x - 97, y - 22, 194, 22, 8, '#b699b0');
                this.round(x - 64, y - 37, 128, 18, 5, '#d3b8c9');
                c.strokeStyle = '#af8fa5';
                c.lineWidth = 9;
                c.beginPath();
                c.moveTo(x - 63, y - 38);
                c.lineTo(x - 63, y - 185);
                c.quadraticCurveTo(x, y - 224, x + 63, y - 185);
                c.lineTo(x + 63, y - 38);
                c.stroke();
                this.glow(x, y - 123, s.flags.completed ? 160 : 80);
                this.ellipse(x, y - 135, 35, 46, s.flags.completed ? '#ffe5a0' : '#ded0b1');
                this.round(x - 40, y - 103, 80, 13, 5, '#bd9aa4');
                this.star(x, y - 145, 15, '#fff6d8');
                this.text(s.flags.completed ? '우리의 등대' : '기억을 모으는 꿈종', x, y - 244, 19, '#785978', 'center', 600);
            }
        }
        if (r.rpgInfo?.combo > 1)
            this.text(r.rpgInfo.combo + ' COMBO', r.player.x + 80, r.player.y - 214, 18, '#a56c94', 'center', 800);
        if (s.flags.completed) {
            for (let i = 0; i < 18; i++) {
                const x = (i * 277 + r.clock * 18) % this.C.maps[s.map].width;
                this.star(x, 290 + Math.sin(r.clock * .4 + i) * 160, 3 + (i % 3), '#fff0b8', r.clock * .3);
            }
        }
    };
})();
