'use strict';
window.DreamRenderer = class DreamRenderer {
    constructor(canvas, images, content) {
        this.ctx = canvas.getContext('2d');
        this.images = images;
        this.C = content;
        this.W = 1440;
        this.H = 810;
        this.G = 651;
        this.stars = Array.from({ length: 60 }, (_, i) => ({ x: (i * 317 + 79) % 1440, y: 65 + (i * 137) % 425, r: .7 + (i % 4) * .6, phase: i * .77 }));
    }
    round(x, y, w, h, r, fill, stroke) {
        const c = this.ctx;
        c.beginPath();
        c.roundRect(x, y, w, h, r);
        if (fill) {
            c.fillStyle = fill;
            c.fill();
        }
        if (stroke) {
            c.strokeStyle = stroke;
            c.stroke();
        }
    }
    ellipse(x, y, rx, ry, fill) {
        const c = this.ctx;
        c.beginPath();
        c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        c.fillStyle = fill;
        c.fill();
    }
    text(t, x, y, size = 16, color = '#685574', align = 'center', weight = 500) {
        const c = this.ctx;
        c.font = `${weight} ${size}px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`;
        c.textAlign = align;
        c.fillStyle = color;
        c.fillText(t, x, y);
    }
    star(x, y, r, color = '#ffefb3', rotation = 0) {
        const c = this.ctx;
        c.save();
        c.translate(x, y);
        c.rotate(rotation);
        c.beginPath();
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .28 : r;
            i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        c.closePath();
        c.fillStyle = color;
        c.fill();
        c.restore();
    }
    glow(x, y, r, color = '#ffe5aa') {
        const c = this.ctx, g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color + '68');
        g.addColorStop(1, color + '00');
        c.fillStyle = g;
        c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    image(key, x, y, w, h) {
        this.ctx.drawImage(this.images[key], x, y, w, h);
    }
    lighthouse(x, y, scale = 1) {
        const c = this.ctx;
        c.save();
        c.translate(x, y);
        c.scale(scale, scale);
        this.glow(0, -237, 110);
        c.fillStyle = '#f4ddc8';
        c.strokeStyle = '#a688a4';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-34, 0);
        c.lineTo(-25, -220);
        c.lineTo(25, -220);
        c.lineTo(34, 0);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#d894a4';
        for (let i = 0; i < 3; i++) {
            c.beginPath();
            c.moveTo(-29 + i * 2, -50 - i * 60);
            c.lineTo(28 - i * 2, -76 - i * 60);
            c.lineTo(27 - i * 2, -94 - i * 60);
            c.lineTo(-27 + i * 2, -68 - i * 60);
            c.fill();
        }
        this.round(-36, -266, 72, 53, 6, '#655a83', '#a891ac');
        this.round(-26, -256, 52, 33, 4, '#ffe9b0');
        c.strokeStyle = '#a28c93';
        c.beginPath();
        c.moveTo(0, -256);
        c.lineTo(0, -223);
        c.stroke();
        c.fillStyle = '#887391';
        c.beginPath();
        c.moveTo(-45, -266);
        c.lineTo(0, -297);
        c.lineTo(45, -266);
        c.closePath();
        c.fill();
        this.round(-15, -42, 30, 42, [15, 15, 0, 0], '#887092');
        this.round(-9, -147, 18, 25, [9, 9, 2, 2], '#fcdfac');
        c.strokeStyle = '#eedaad88';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(-27, -240);
        c.lineTo(-260, -285);
        c.moveTo(27, -240);
        c.lineTo(290, -275);
        c.stroke();
        c.restore();
    }
    sky(camera, t, title = false) {
        const c = this.ctx;
        this.image('sky', -camera * .017, -38, 1510, 641);
        this.image('sea', -camera * .04, 390, 1680, 355);
        for (const s of this.stars) {
            const alpha = .24 + .5 * (.5 + .5 * Math.sin(t * .8 + s.phase));
            c.globalAlpha = alpha;
            this.star((s.x - camera * .04 + 1440) % 1440, s.y, s.r + 1, '#fff7d9');
        }
        c.globalAlpha = 1;
        const bx = -((camera * .21) % 2100);
        this.image('harbor', bx, 370, 2200, 445);
        if (bx + 2200 < 1440)
            this.image('harbor', bx + 2199, 370, 2200, 445);
        this.lighthouse(1270 - camera * .12, 483, .75);
        const fog = c.createLinearGradient(0, 560, 0, 681);
        fog.addColorStop(0, '#f6d2c700');
        fog.addColorStop(1, '#f2d2bd');
        c.fillStyle = fog;
        c.fillRect(0, 560, 1440, 121);
        if (title) {
            const haze = c.createLinearGradient(0, 0, 0, 810);
            haze.addColorStop(0, '#6f628522');
            haze.addColorStop(1, '#eec7b422');
            c.fillStyle = haze;
            c.fillRect(0, 0, 1440, 810);
        }
    }
    ground(map) {
        const c = this.ctx, g = c.createLinearGradient(0, 640, 0, 810), boss = map.theme === 'boss';
        g.addColorStop(0, boss ? '#ab8baf' : '#f2d5b7');
        g.addColorStop(1, boss ? '#796080' : '#d9b4ae');
        c.fillStyle = g;
        c.fillRect(0, this.G, 1440, 170);
        c.strokeStyle = boss ? '#d6acc266' : '#fff0d16e';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(0, this.G + 2);
        c.lineTo(1440, this.G + 2);
        c.stroke();
        for (let i = 0; i < 45; i++) {
            let x = ((i * 131 - this.r.camera) % 1510 + 1510) % 1510, y = 666 + (i * 73) % 136;
            this.ellipse(x, y, 2 + (i % 4), 1.2, boss ? '#4c416a3a' : '#b8919335');
        }
        if (boss) {
            c.strokeStyle = '#51426639';
            c.lineWidth = 2;
            for (let y = 685; y < 811; y += 35) {
                c.beginPath();
                c.moveTo(0, y);
                c.lineTo(1440, y);
                c.stroke();
            }
            for (let i = 0; i < 9; i++) {
                let x = i * 220 - this.r.camera % 220;
                c.beginPath();
                c.moveTo(x, 651);
                c.lineTo(x - 48, 810);
                c.stroke();
            }
        }
    }
    platform(p) {
        const c = this.ctx;
        this.ellipse(p.x + p.w * .5, this.G + 8, p.w * .48, 9, '#795a7924');
        c.drawImage(this.images.platform, 340, 75, 490, 157, p.x, p.y - 8, p.w, 75);
        this.glow(p.x + p.w * .5, p.y - 8, 55, '#ffeba9');
    }
    lantern(x, y, scale = 1) {
        const c = this.ctx;
        c.save();
        c.translate(x, y);
        c.scale(scale, scale);
        c.strokeStyle = '#77667f';
        c.lineWidth = 6;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, -187);
        c.quadraticCurveTo(0, -212, 28, -210);
        c.lineTo(40, -210);
        c.stroke();
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(32, -210);
        c.lineTo(32, -195);
        c.stroke();
        this.glow(32, -175, 75);
        this.round(19, -196, 27, 42, 7, '#ffeab5', '#ad8e92');
        c.strokeStyle = '#9e8494';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(14, -196);
        c.lineTo(50, -196);
        c.moveTo(17, -153);
        c.lineTo(47, -153);
        c.stroke();
        c.restore();
    }
    crate(x, y, w = 105, h = 110) {
        const c = this.ctx;
        this.round(x - w / 2, y - h, w, h, 5, '#ba8c9c', '#91738a');
        c.strokeStyle = '#dfb09f';
        c.lineWidth = 6;
        c.strokeRect(x - w / 2 + 8, y - h + 8, w - 16, h - 16);
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(x - w / 2 + 12, y - 12);
        c.lineTo(x + w / 2 - 12, y - h + 12);
        c.stroke();
        c.strokeStyle = '#805e7930';
        c.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
            c.beginPath();
            c.moveTo(x - w / 2, y - h + i * h / 4);
            c.lineTo(x + w / 2, y - h + i * h / 4);
            c.stroke();
        }
    }
    sign(x, y, title, subtitle) {
        const c = this.ctx;
        this.round(x - 4, y - 4, 8, 66, 3, '#a2808c');
        this.round(x - 105, y - 58, 210, 61, 9, '#f6e5cdeb', '#be9dad');
        this.text(title, x, y - 32, 20, '#705977', 'center', 650);
        this.text(subtitle, x, y - 11, 11, '#a28495');
    }
    hut(x) {
        const c = this.ctx;
        this.round(x - 136, 386, 272, 255, 5, '#d7b6b9', '#aa8da4');
        c.fillStyle = '#907791';
        c.beginPath();
        c.moveTo(x - 161, 393);
        c.lineTo(x, 294);
        c.lineTo(x + 160, 393);
        c.closePath();
        c.fill();
        c.strokeStyle = '#c499a8';
        c.lineWidth = 7;
        c.stroke();
        this.round(x - 105, 428, 66, 77, 20, '#f9ddb0', '#a48598');
        this.round(x + 39, 428, 66, 77, 20, '#f9ddb0', '#a48598');
        this.round(x - 31, 480, 62, 160, [31, 31, 0, 0], '#8e7899');
        this.round(x - 63, 393, 126, 30, 9, '#f4dfbf');
        this.text('꿈빛 원정대', x, 414, 15, '#856781', 'center', 600);
        this.glow(x - 70, 465, 80);
        this.glow(x + 70, 465, 80);
        c.strokeStyle = '#a18398';
        c.lineWidth = 3;
        for (const d of [-72, 72]) {
            c.beginPath();
            c.moveTo(x + d, 429);
            c.lineTo(x + d, 502);
            c.moveTo(x + d - 30, 463);
            c.lineTo(x + d + 30, 463);
            c.stroke();
        }
    }
    bossRoom() {
        const c = this.ctx, cam = this.r.camera;
        const shade = c.createLinearGradient(0, 0, 0, 660);
        shade.addColorStop(0, '#534263f7');
        shade.addColorStop(.8, '#7b628bbf');
        shade.addColorStop(1, '#998099b7');
        c.fillStyle = shade;
        c.fillRect(0, 0, 1440, 657);
        for (let i = 0; i < 7; i++) {
            const x = i * 390 - cam * .6;
            this.round(x - 17, 0, 34, 650, 0, '#604a69');
            this.round(x + 9, 0, 5, 650, 0, '#95748d60');
        }
        this.round(0, 241, 1440, 23, 0, '#62496788');
        const wx = 1020 - cam * .5;
        c.save();
        c.beginPath();
        c.roundRect(wx - 95, 164, 190, 247, [94, 94, 4, 4]);
        c.clip();
        this.image('sky', wx - 295, 158, 490, 260);
        c.restore();
        c.strokeStyle = '#bb9db7';
        c.lineWidth = 10;
        c.beginPath();
        c.roundRect(wx - 100, 159, 200, 257, [100, 100, 4, 4]);
        c.stroke();
        c.lineWidth = 6;
        c.beginPath();
        c.moveTo(wx, 168);
        c.lineTo(wx, 410);
        c.moveTo(wx - 95, 311);
        c.lineTo(wx + 95, 311);
        c.stroke();
        const beam = c.createLinearGradient(wx, 350, wx - 70, 651);
        beam.addColorStop(0, '#f5e5c235');
        beam.addColorStop(1, '#e2d1eb02');
        c.fillStyle = beam;
        c.beginPath();
        c.moveTo(wx - 88, 365);
        c.lineTo(wx + 87, 365);
        c.lineTo(wx + 320, 650);
        c.lineTo(wx - 310, 650);
        c.closePath();
        c.fill();
    }
    portal(x, dest, left = false, locked = false) {
        const c = this.ctx, t = this.r.clock;
        this.glow(x, this.G - 70, 85, locked ? '#d4c1e0' : '#ffe2ac');
        c.save();
        c.translate(x, this.G - 53);
        c.scale(.57, 1);
        c.lineWidth = 3;
        c.strokeStyle = locked ? '#c9b4dc99' : '#ffefbccc';
        c.setLineDash([7, 8]);
        c.lineDashOffset = -t * 22;
        c.beginPath();
        c.ellipse(0, 0, 55, 69, 0, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);
        c.restore();
        this.text(left ? '‹' : '›', x, this.G - 42, 48, '#fff3d6');
        this.round(x - 94, this.G - 169, 188, 38, 19, '#5c4d79b0', '#fff0d43d');
        this.text(dest, x, this.G - 143, 15, '#fff1d9');
        for (let i = 0; i < 6; i++) {
            const yy = this.G - 10 - ((t * 25 + i * 22) % 135);
            this.star(x + Math.sin(t + i) * 34, yy, 2 + i % 3, '#ffe9b4');
        }
    }
    npc(x) {
        const c = this.ctx, t = this.r.clock;
        this.ellipse(x, this.G + 3, 45, 9, '#6c527534');
        c.save();
        c.translate(x, this.G - 2 + Math.sin(t * 2) * 1.5);
        c.fillStyle = '#89779d';
        c.beginPath();
        c.moveTo(-31, -84);
        c.quadraticCurveTo(-60, -30, -51, -6);
        c.quadraticCurveTo(0, 6, 50, -6);
        c.quadraticCurveTo(51, -42, 29, -84);
        c.fill();
        this.round(-26, -13, 21, 15, 5, '#61506c');
        this.round(8, -13, 21, 15, 5, '#61506c');
        this.ellipse(0, -105, 31, 34, '#f4d4b9');
        c.fillStyle = '#f3e7db';
        c.beginPath();
        c.moveTo(-27, -111);
        c.quadraticCurveTo(-43, -51, 0, -41);
        c.quadraticCurveTo(42, -56, 26, -111);
        c.quadraticCurveTo(16, -81, 0, -81);
        c.quadraticCurveTo(-17, -83, -27, -111);
        c.fill();
        this.ellipse(-10, -107, 2.2, 3, '#62516a');
        this.ellipse(10, -107, 2.2, 3, '#62516a');
        this.ellipse(0, -99, 5, 4, '#e8acac');
        c.fillStyle = '#756187';
        c.beginPath();
        c.moveTo(-44, -126);
        c.lineTo(0, -184);
        c.lineTo(43, -125);
        c.closePath();
        c.fill();
        this.round(-42, -135, 83, 14, 7, '#aa879f');
        this.star(0, -154, 10, '#f3d291');
        c.strokeStyle = '#c49d9b';
        c.lineWidth = 6;
        c.beginPath();
        c.moveTo(45, -81);
        c.lineTo(50, 1);
        c.stroke();
        this.glow(46, -92, 45);
        this.star(47, -95, 15, '#ffdf98');
        c.restore();
        this.round(x - 58, this.G - 237, 116, 36, 18, '#fbecd5e8', '#fff3d3');
        this.text('루멘 반장', x, this.G - 213, 16, '#775e7f', 'center', 600);
        this.text(this.r.state.flags.metLumen ? '☼' : '!', x, this.G - 184, 25, '#ffe8a8');
    }
    actor(who, x, y, face = 1, active = false) {
        const c = this.ctx, r = this.r, p = r.player, moving = active ? Math.abs(p.vx) > 10 : Math.abs(p.x - r.companion.x) > 70, time = active ? p.walkTime : r.clock * 11, air = active ? !p.grounded : Math.abs(r.companion.y - this.G) > 10;
        const size = active ? 192 : 156;
        const bob = r.settings.reducedMotion ? 0 : moving && !air ? Math.abs(Math.sin(time)) * 5 : Math.sin(r.clock * 2.6) * 1.8;
        const alpha = active && p.invincible > 0 && Math.floor(r.clock * 12) % 2 === 0 ? .53 : active ? 1 : .9;
        this.ellipse(x, this.G + 5, active ? 37 : 29, 8, active ? '#60446b34' : '#60446b22');
        c.save();
        c.globalAlpha = alpha;
        c.translate(x, y - bob);
        if (active && p.dodgeT > 0) {
            c.rotate(-face * .18);
            this.glow(0, -80, 74, '#e1cdff');
        }
        if (active && p.attackT > 0) {
            c.scale(face, 1);
            const im = this.images[who === 'ari' ? 'ariAttack' : 'popoAttack'], hh = size * .93, ww = hh * im.width / im.height;
            c.drawImage(im, -88, -hh, ww, hh);
        }
        else if (who === 'ari') {
            let sc = size / 657, sy = air ? 1.04 : active && p.landSquash > 0 ? .93 : 1;
            c.scale(face === 1 ? -sc : sc, sc * sy);
            c.translate(-270, -722);
            for (const [key, pivot, phase] of [['ariLegBack', 190, 0], ['ariLegFront', 300, Math.PI]]) {
                c.save();
                c.translate(pivot, 595);
                if (moving && !air && !r.settings.reducedMotion)
                    c.rotate(Math.sin(time + phase) * .34);
                else if (air)
                    c.rotate(phase === 0 ? -.15 : .23);
                c.drawImage(this.images[key], -pivot, -595);
                c.restore();
            }
            c.drawImage(this.images.ariBody, 0, 0);
        }
        else {
            const im = this.images.popoSide, hh = size, ww = hh * im.width / im.height;
            c.scale(face === 1 ? -1 : 1, 1);
            if (moving && !r.settings.reducedMotion)
                c.rotate(Math.sin(time) * .035);
            c.drawImage(im, -ww * .5, -hh, ww, hh);
        }
        c.restore();
        if (active) {
            this.ellipse(x, y + 9, 22, 3, '#fff4c55c');
            this.text(who === 'ari' ? '아리' : '포포', x, y - size - 20, 13, '#584262');
        }
    }
    pomi() {
        const r = this.r, c = this.ctx, x = r.pet.x, y = r.pet.y + Math.sin(r.clock * 3) * 7;
        this.glow(x, y, 54, '#fff0c2');
        c.save();
        c.translate(x, y);
        c.fillStyle = '#fff1de';
        for (const [dx, dy, rr] of [[-18, 0, 16], [-8, -12, 16], [10, -12, 16], [22, 0, 14], [9, 10, 15], [-10, 10, 16]])
            this.ellipse(dx, dy, rr, rr, '#fff2df');
        this.ellipse(0, 4, 18, 14, '#f6dec8');
        this.ellipse(-7, 1, 2.1, 3, '#826e8a');
        this.ellipse(7, 1, 2.1, 3, '#826e8a');
        this.ellipse(-12, 7, 4, 2, '#e8b4b7');
        this.ellipse(12, 7, 4, 2, '#e8b4b7');
        this.text('ᴗ', 0, 12, 12, '#b28494');
        this.star(0, -28, 8, '#f7d294');
        c.restore();
    }
    enemy(e) {
        const c = this.ctx, r = this.r, def = this.C.creatures[e.type];
        if (e.dead && e.fade <= 0)
            return;
        let size = def.size, t = r.clock, bob = r.settings.reducedMotion ? 0 : Math.sin(e.elapsed * 3.4) * 3;
        const im = this.images[e.type], w = size * im.width / im.height;
        this.ellipse(e.x, this.G + 5, w * .37, 8, e.type === 'boss' ? '#4b345c40' : '#6c456739');
        c.save();
        c.translate(e.x, e.y - bob);
        if (e.dead) {
            const k = e.fade / .55;
            c.globalAlpha = k;
            c.scale(Math.max(.05, k), Math.max(.05, k));
        }
        else if (e.windup > 0 || (e.type === 'boss' && e.phase === 'warn'))
            c.scale(1 + Math.sin(t * 22) * .035, 1.025);
        else if (e.hurt > 0) {
            const k = e.hurt / .28;
            c.rotate((e.knockV > 0 ? 1 : -1) * .13 * k);
            c.scale(1 + .2 * k, 1 - .16 * k);
        }
        else
            c.scale(1, 1 + Math.sin(t * 3 + e.home) * .018);
        c.drawImage(im, -w / 2, -size, w, size);
        if (e.hurt > .08) {
            this.hitMasks = this.hitMasks || {};
            if (!this.hitMasks[e.type]) {
                const mask = document.createElement('canvas');
                mask.width = im.width;
                mask.height = im.height;
                const mx = mask.getContext('2d');
                mx.drawImage(im, 0, 0);
                mx.globalCompositeOperation = 'source-in';
                mx.fillStyle = '#fff8e6';
                mx.fillRect(0, 0, mask.width, mask.height);
                this.hitMasks[e.type] = mask;
            }
            c.globalAlpha = Math.min(.86, e.hurt * 3.8);
            c.drawImage(this.hitMasks[e.type], -w / 2, -size, w, size);
        }
        c.restore();
        if (e.dead)
            return;
        c.save();
        c.setLineDash([5, 6]);
        c.lineDashOffset = t * 10;
        c.strokeStyle = e.windup > 0 ? '#b4718b' : '#94739490';
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(e.x, this.G + 4, w * .38 + 7, 12, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
        if (e.type !== 'boss') {
            this.round(e.x - 63, e.y - size - 43, 126, 26, 13, '#f8edd5d9');
            this.text(`Lv. ${e.level||1} · ${def.name}`, e.x, e.y - size - 24, 12, '#80617f');
            this.round(e.x - 30, e.y - size - 9, 60, 4, 2, '#8067884d');
            if (e.hp < e.max)
                this.round(e.x - 30, e.y - size - 9, 60 * (1 - e.hp / e.max), 4, 2, '#fff0ac');
            if (e.windup > 0) {
                this.text('!', e.x, e.y - size - 54, 25, '#ae6583', 'center', 800);
                c.save();
                c.globalAlpha = .2 + Math.sin(t * 17) * .08;
                this.ellipse(e.x, this.G, 106, 18, '#b47c9b');
                c.restore();
            }
        }
        if (e.type === 'boss' && e.phase === 'warn' && e.zone) {
            c.save();
            const pul = .22 + Math.sin(t * 17) * .09;
            c.fillStyle = `rgba(245,184,208,${pul})`;
            if (e.zone.kind === 'sneeze') {
                const x1 = e.x + e.zone.face * 60, x2 = e.x + e.zone.face * 760;
                c.beginPath();
                c.moveTo(x1, this.G - 10);
                c.lineTo(x2, this.G - 90);
                c.lineTo(x2, this.G + 10);
                c.closePath();
                c.fill();
                c.strokeStyle = '#f6c8dbaa';
                c.setLineDash([9, 7]);
                c.beginPath();
                c.moveTo(x1, this.G + 2);
                c.lineTo(x2, this.G + 2);
                c.stroke();
                this.text('↑ 점프!', (x1 + x2) * .5, this.G - 25, 17, '#fbe8df');
            }
            else {
                this.ellipse(e.zone.x, this.G, 156, 21, `rgba(248,187,211,${pul + .1})`);
                this.text('↔ 비켜서기', e.zone.x, this.G - 34, 17, '#fbe8df');
            }
            c.restore();
        }
    }
    collectible(m) {
        if (!m || this.r.state.memories.includes(m.id))
            return;
        const t = this.r.clock, y = m.y + Math.sin(t * 2.5) * 8;
        this.glow(m.x, y, 55);
        this.star(m.x, y, 19, '#fff1b8', Math.sin(t) * .2);
        this.star(m.x + 26, y - 20, 5, '#fff8db', t);
        this.text('반짝 기억', m.x, y - 34, 12, '#85677f');
    }
    draw(r) {
        this.r = r;
        const c = this.ctx;
        c.clearRect(0, 0, 1440, 810);
        const title = r.mode === 'title' || r.mode === 'loading' || (r.mode === 'modal' && !r.state?.flags.introSeen), map = this.C.maps[r.state?.map || 0];
        this.sky(title ? 0 : r.camera, r.clock, title);
        if (title) {
            for (let i = 0; i < 18; i++) {
                const x = (i * 293 + r.clock * 5) % 1440, y = 540 + Math.sin(r.clock * .3 + i) * 70;
                this.glow(x, y, 4, '#ffe5b2');
            }
            return;
        }
        if (map.theme === 'boss')
            this.bossRoom();
        c.save();
        if (!r.settings.reducedMotion && r.shake > 0)
            c.translate(Math.sin(r.clock * 70) * r.shake, Math.cos(r.clock * 57) * r.shake * .6);
        this.drawRegionBackdrop(r);
        this.ground(map);
        c.save();
        c.translate(-r.camera, 0);
        if (map.theme === 'town')
            this.hut(970);
        if (map.theme === 'alley') {
            for (let i = 0; i < 7; i++) {
                const x = 340 + i * 370;
                this.crate(x, 645, 100, 105);
                if (i % 2)
                    this.crate(x + 50, 541, 86, 87);
            }
        }
        if (map.theme === 'boss') {
            this.crate(96, 649, 135, 140);
            this.crate(1770, 649, 150, 150);
            this.crate(1825, 499, 90, 100);
        }
        if (map.theme !== 'boss') {
            for (let i = 0; i < Math.ceil(map.width / 660); i++)
                this.lantern(370 + i * 650, this.G, .76);
            if (map.theme === 'trail') {
                for (let i = 0; i < 5; i++) {
                    const x = i * 550 + 200;
                    this.image('grass', x, 370, 500, 213);
                }
            }
        }
        for (const ex of this.C.exits[r.state.map])
            this.portal(ex.x, this.C.maps[ex.to].name, ex.x < 300, !this.gateOpen(ex.gate));
        for (const p of map.platforms)
            this.platform(p);
        this.collectible(map.memory);
        if (map.theme === 'beach')
            this.sign(360, this.G - 46, map.name, map.description.slice(0, 22));
        if (map.theme === 'trail')
            this.sign(300, this.G - 46, map.name, '항구 → · 중간 갈림길에서 정원 ↑');
        if (map.theme === 'alley')
            this.sign(305, this.G - 46, '부둣가 창고', '들숨… 재채기 주의!');
        this.drawRPGWorld(r);
        for (const e of r.enemies)
            this.enemy(e);
        this.actor(r.state.active === 'ari' ? 'popo' : 'ari', r.companion.x, r.companion.y, r.companion.facing || r.player.facing, false);
        if (r.state.flags.metLumen)
            this.pomi();
        this.actor(r.state.active, r.player.x, r.player.y, r.player.facing, true);
        this.drawHitEffects(r);
        for (const w of r.waves) {
            this.glow(w.x, w.y, 67, '#d7c0f3');
            for (let i = 0; i < 4; i++)
                this.ellipse(w.x - w.vx / Math.abs(w.vx) * i * 14, w.y + Math.sin(r.clock * 11 + i) * 9, 23 - i * 2, 24 - i * 3, '#d8bcecb7');
            this.star(w.x + 8, w.y - 13, 7, '#fff0ca');
        }
        if (r.state.flags.completed && map.theme === 'boss') {
            this.glow(1360, this.G - 30, 100);
            this.round(1318, this.G - 54, 84, 53, 5, '#ead8b6', '#b89cab');
            this.round(1360, this.G - 53, 3, 51, 1, '#c2a1ac');
            this.star(1360, this.G - 83, 13, '#ffe9af');
        }
        if (!r.settings.reducedMotion) {
            for (const p of r.particles) {
                c.globalAlpha = Math.max(0, Math.min(1, p.life / .4));
                this.star(p.x, p.y, p.r, p.color, r.clock * 3 + p.x);
            }
        }
        c.globalAlpha = 1;
        for (const ring of r.rings) {
            const progress = 1 - ring.life / ring.max;
            c.globalAlpha = ring.life / ring.max;
            c.strokeStyle = ring.color;
            c.lineWidth = (1 - progress) * 7 + 1;
            c.beginPath();
            c.ellipse(ring.x, ring.y, ring.r * progress, ring.r * progress * .7, 0, 0, Math.PI * 2);
            c.stroke();
        }
        c.globalAlpha = 1;
        for (const txt of r.texts) {
            c.globalAlpha = Math.min(1, txt.life / .3);
            c.shadowColor = '#695371';
            c.shadowBlur = 5;
            const number = /^[0-9]+!?$/.test(txt.text);
            if (number) {
                c.strokeStyle = '#725270';
                c.lineWidth = 4;
                c.font = '800 ' + (txt.text.includes('!') ? 34 : 27) + 'px sans-serif';
                c.textAlign = 'center';
                c.strokeText(txt.text, txt.x, txt.y);
            }
            this.text(txt.text, txt.x, txt.y, number ? (txt.text.includes('!') ? 34 : 27) : 18, txt.color, 'center', number ? 800 : 700);
            c.shadowBlur = 0;
        }
        c.globalAlpha = 1;
        c.restore();
        if (map.theme !== 'boss') {
            c.globalAlpha = .38;
            this.image('grass', -(r.camera * .7 % 1440), 345, 1440, 612);
            this.image('grass', 1440 - (r.camera * .7 % 1440), 345, 1440, 612);
            c.globalAlpha = 1;
        }
        c.restore();
        if (r.transition > 0) {
            c.fillStyle = `rgba(252,237,220,${r.transition / .45 * .5})`;
            c.fillRect(0, 0, 1440, 810);
        }
    }
};
