'use strict';
(() => {
    const R = window.DreamRenderer.prototype, oldEnemy = R.enemy, oldRPG = R.drawRPGWorld;
    const rects = { ari: [213, 166, 684, 1245], popo: [110, 80, 804, 1397] };
    R.prop = function (key, x, y, width) {
        const im = this.images[key], b = window.DREAM_ART_V41.props[key];
        if (!im || !b)
            return;
        const sw = b[2] - b[0], sh = b[3] - b[1], h = width * sh / sw;
        this.ctx.drawImage(im, b[0], b[1], sw, sh, x - width / 2, y - h, width, h);
    };
    R.crate = function (x, y, w = 90, h = 90) {
        this.prop('crateV41', x, y, w);
    };
    R.chest = function (x, y, open = false, w = 92) {
        this.prop(open ? 'chestOpenV41' : 'chestClosedV41', x, y, w);
        if (!open) {
            this.glow(x, y - 35, 55, '#f3d99c');
            this.star(x + w * .3, y - 68, 5, '#fff1c4', this.r.clock);
        }
    };
    R.item = function (icon, x, y, w, h = w, angle = 0) {
        const wearable = window.DREAM_WEAR.icons[icon];
        if (wearable) {
            const key = window.DREAM_WEAR.items[wearable].asset, box = window.DREAM_WEAR.assets[key].frames[1], c = this.ctx, sc = Math.min(w / box[2], h / box[3]);
            c.save();
            c.translate(x, y);
            c.rotate(angle);
            c.drawImage(this.images[key], ...box, -box[2] * sc / 2, -box[3] * sc / 2, box[2] * sc, box[3] * sc);
            c.restore();
            return;
        }
        const im = this.images['item-' + icon];
        if (!im)
            return;
        const c = this.ctx;
        c.save();
        c.translate(x, y);
        c.rotate(angle);
        c.drawImage(im, -w / 2, -h / 2, w, h);
        c.restore();
    };
    R.wear = function (id, view, x, y, size = 1, angle = 0) {
        const W = window.DREAM_WEAR, item = W.items[id];
        if (!item)
            return;
        const im = this.images[item.asset], boxes = W.assets[item.asset].frames;
        const box = boxes[Math.min(view, boxes.length - 1)];
        const anchor = item.anchor[Math.min(view, item.anchor.length - 1)];
        const w = item.width ? item.width * size : item.height * size * box[2] / box[3];
        const h = item.height ? item.height * size : w * box[3] / box[2];
        const c = this.ctx;
        c.save();
        c.translate(x, y);
        c.rotate(angle);
        c.drawImage(im, ...box, -w * anchor[0], -h * anchor[1], w, h);
        c.restore();
    };
    R.costume = function (look, pose, layer, drawBody) {
        const c = this.ctx, r = this.r, p = r.player, pins = pose.pins;
        const rear = pose.kind === 'climb', view = rear ? 2 : ['attack', 'dash'].includes(pose.kind) ? 1 : 0;
        const [nx, ny] = pins.neck;
        const swing = r.settings.reducedMotion ? 0 : Math.sin(p.walkTime || 0) * (p.walkBlend || 0) * .035;
        if (layer === 'back') {
            if (look.back === 'nightCape')
                this.wear('nightCape', view, nx - 1, ny + 3, pose.who === 'ari' ? .88 : 1, swing + (['attack', 'dash'].includes(pose.kind) ? 1.0 : 0));
            return;
        }
        if (look.back && look.back !== 'nightCape') {
            const bx = rear ? nx : nx - (look.back === 'lampPack' ? 28 : 24), by = ny + (rear ? 12 : 9);
            // A visible shoulder attachment keeps the bag/lantern connected to the torso.
            c.strokeStyle = look.back === 'lampPack' ? '#bd9561' : '#66546a';
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(nx - 3, ny + 5);
            c.quadraticCurveTo(bx - 3, ny + 3, bx, by + 5);
            c.stroke();
            this.wear(look.back, rear && look.back === 'mailBag' ? 1 : view, bx, by, rear ? .95 : 1, swing);
        }
        if (look.neck)
            this.wear(look.neck, view, nx, ny + 2, pose.who === 'ari' ? .92 : 1, pins.angle);
        if (rear && pose.who === 'ari' && (look.neck || look.back)) {
            // The ponytail overlaps the collar and backpack, as it does in the base illustration.
            c.save();
            c.beginPath();
            c.moveTo(-10, -103);
            c.lineTo(17, -103);
            c.lineTo(18, -79);
            c.lineTo(13, -64);
            c.lineTo(3, -60);
            c.lineTo(-7, -65);
            c.lineTo(-13, -80);
            c.closePath();
            c.clip();
            drawBody();
            c.restore();
        }
        if (look.head) {
            const point = look.head === 'roseBow' ? pins.bow : pins.head;
            const size = look.head === 'roseBow' ? 1 : pose.who === 'ari' ? .90 : pose.kind === 'idle' ? .88 : 1;
            this.wear(look.head, view, point[0], point[1], size, pins.angle);
        }
        if (look.aura)
            for (let i = 0; i < 4; i++)
                this.star(-18 - i * 13, -2 - Math.sin(r.clock * 3 + i) * 3, 2.6, '#f6e0a1', r.clock);
    };
    R.actor = function (who, x, y, face = 1, active = false) {
        const c = this.ctx, r = this.r, p = r.player, h = 132;
        const climbing = !!p.climbing, moving = !climbing && p.grounded && (p.motionSpeed ?? Math.abs(p.vx || 0)) > 20;
        const attack = !climbing && p.attackT > 0 ? Math.sin(Math.min(1, p.attackT / (p.attackLength || .38)) * Math.PI) : 0;
        const progress = p.attackT > 0 ? 1 - p.attackT / (p.attackLength || .33) : 0;
        const kind = climbing ? 'climb' : p.attackT > 0 && progress > .18 && progress < .83 ? 'attack' : moving ? 'walk' : 'idle';
        const phase = climbing ? p.climbPhase || 0 : p.walkTime || 0;
        const frame = ((Math.floor(phase / (Math.PI * 2) * 6) % 6) + 6) % 6;
        const pose = { who, kind, frame, pins: window.DREAM_WEAR.pose(who, kind, frame) };
        const reduce = r.settings.reducedMotion, bottom = p.groundY ?? y;
        const bounce = !reduce && moving ? Math.sin((p.walkTime || 0) * 2) * .8 : 0;
        this.ellipse(x, bottom + 3, Math.max(12, 24 - Math.max(0, bottom - y) * .028), 4, '#48455630');
        c.save();
        c.translate(x, y - bounce);
        if (!reduce && !climbing)
            c.rotate((p.lean || 0) * .018);
        if (active && p.invincible > 0 && Math.floor(r.clock * 12) % 2 === 0)
            c.globalAlpha = .7;
        if (p.dodgeT > 0 && !reduce)
            c.rotate(-face * .14);
        c.scale(climbing ? 1 : face, 1);
        if (!reduce && !climbing) {
            const squash = p.grounded ? Math.sin(Math.min(1, (p.landSquash || 0) / .18) * Math.PI) * .035 : -.015;
            c.scale(1 + squash, 1 - squash);
            if (!p.grounded) c.rotate(Math.max(-.045, Math.min(.045, (p.vy || 0) / 16000)));
            if (p.hitT > 0) c.rotate(-.045);
        }
        const drawBody = () => {
            c.save();
            if (kind === 'attack') {
                const a = this.images[who === 'ari' ? 'ariAttack' : 'popoAttack'], aw = h * a.width / a.height;
                c.drawImage(a, -aw * .42 + (who === 'ari' ? 28 : 0), -h, aw, h);
            }
            else if (kind === 'walk' || kind === 'climb') {
                const key = who + (kind === 'climb' ? 'ClimbV41' : 'WalkV41'), sheet = window.DREAM_ART_V41.motion[key];
                const f = sheet.frames[frame], sc = h / sheet.height, [sx, sy, sw, sh] = f.source;
                if (kind === 'walk')
                    c.scale(-1, 1);
                c.drawImage(this.images[key], sx, sy, sw, sh, -f.anchorX * sc, -f.anchorY * sc, sw * sc, sh * sc);
            }
            else {
                const im = this.images[who === 'ari' ? 'heroAriSprite' : 'heroPopoSprite'], box = rects[who], sc = h / box[3], pivot = (who === 'ari' ? 500 : 560) - box[0];
                c.scale(-1, 1);
                c.drawImage(im, ...box, -pivot * sc, -h, box[2] * sc, h);
            }
            c.restore();
        };
        this.costume(r.state.world.look, pose, 'back', drawBody);
        drawBody();
        this.costume(r.state.world.look, pose, 'front', drawBody);
        if (r.state.rpg.protection) {
            c.strokeStyle = '#fff0b1aa';
            c.lineWidth = 2;
            c.beginPath();
            c.ellipse(0, -64, 46, 77, 0, 0, Math.PI * 2);
            c.stroke();
        }
        c.restore();
        if (active && p.attackT > 0 && progress > .2 && progress < .78 && !climbing) {
            c.save();
            c.translate(x, y - 65);
            c.scale(p.attackFacing || face, 1);
            c.globalAlpha = Math.sin((progress - .2) / .58 * Math.PI) * .65;
            c.strokeStyle = p.combo === 3 ? '#ffe9a4' : '#fff0d3';
            c.lineWidth = p.combo === 3 ? 8 : 4;
            c.lineCap = 'round';
            c.beginPath();
            c.ellipse(35, 0, who === 'ari' ? 106 : 96, 62, -.3, -1.5 + progress, 1.1 + progress);
            c.stroke();
            c.restore();
        }
    };
    R.previewHero = function (canvas, state, options = {}) {
        const preview = new window.DreamRenderer(canvas, this.images, this.C);
        preview.r = { state, clock: 1, settings: { reducedMotion: true }, player: { grounded: true, groundY: 210, y: 210, walkBlend: 0, walkTime: 0, motionSpeed: 0, attackT: 0, dodgeT: 0, chargeT: 0, chargeHeld: false, invincible: 0 }, companion: {} };
        const poses = {walk:{motionSpeed:200,walkTime:options.phase??2,walkBlend:1},jump:{grounded:false,vy:-350},climb:{climbing:{},climbPhase:options.phase??2},dash:{dodgeT:.13,dodgeFacing:options.face||1},attack:{attackT:.19,attackLength:.38},charge:{chargeHeld:true,chargeT:.6}};
        Object.assign(preview.r.player,poses[options.pose]||{});
        const c = preview.ctx;
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.save();
        c.scale(1.9, 1.9);
        preview.r.player.groundY = 186;
        preview.actor(state.active, 94, 186, options.face||1, true);
        c.restore();
    };
    R.drawNPC = function (id) {
        const n = this.C.npcs[id], r = this.r, c = this.ctx, im = this.images[n.image], h = id === 'post' ? 98 : 137, w = h * im.width / im.height, t = r.clock, walk = n.walking ? 1 : 0, step = n.walkTime || 0, reduce = r.settings.reducedMotion, bob = reduce ? 0 : Math.abs(Math.sin(step)) * walk * 2;
        this.ellipse(n.x, n.y + 3, w * .26, 4, '#50425330');
        c.save();
        c.translate(n.x, n.y - bob);
        c.rotate(reduce ? 0 : Math.sin(step) * walk * .026);
        c.scale(n.face < 0 ? -1 : 1, 1);
        const split = .79;
        for (const back of [true, false]) {
            c.save();
            c.translate(back ? -w * .08 : w * .04, -h * (1 - split));
            c.rotate(reduce ? 0 : Math.sin(step + (back ? Math.PI : 0)) * walk * .22);
            if (back)
                c.globalAlpha = .8;
            c.drawImage(im, 0, im.height * split, im.width, im.height * (1 - split), -w / 2, 0, w, h * (1 - split));
            c.restore();
        }
        c.drawImage(im, 0, im.height * .36, im.width, im.height * .44, -w / 2, -h * .64, w, h * .44);
        c.save();
        c.translate(0, -h * .64);
        c.rotate(reduce ? 0 : Math.sin(t * 1.8 + n.phase) * .018 + (n.greetingActive ? -.035 : 0));
        c.drawImage(im, 0, 0, im.width, im.height * .37, -w / 2, -h * .36, w, h * .37);
        c.restore();
        c.restore();
        this.round(n.x - 65, n.y - h - 36, 130, 24, 12, '#fff2e7ea');
        this.text(n.name, n.x, n.y - h - 19, 13, '#705874', 'center', 650);
        this.text(r.rpgInfo?.npcMarks[id] || '…', n.x, n.y - h - 47, 20, '#fff1b3');
        if (n.greetingActive && Math.sin(t * .7 + n.phase) > .5) {
            this.round(n.x - 77, n.y - h - 84, 154, 29, 12, '#ffffffed');
            this.text({ lumen: '오늘도 무사히 돌아오렴.', madeleine: '갓 구운 빵 냄새가 나지?', post: '주소는 두 번 확인!' }[id], n.x, n.y - h - 65, 12, '#775f76');
        }
    };
    R.terrain = function (map) {
        const c = this.ctx, r = this.r, colors = { tide: ['#9ac2c3', '#617c96', '#425b75'], archive: ['#c5b3b8', '#83788e', '#5b526f'], waterway: ['#a3c4c2', '#6a92a1', '#4c6e86'], garden: ['#c5d5b2', '#97b3a4', '#698b90'], observatory: ['#c7c3db', '#9395b8', '#636785'] }, col = colors[map.theme] || ['#edcfad', '#b8a3aa', '#8d8399'];
        const platforms = [{ x: -100, y: 651, w: map.width + 200, ground: true }, ...map.platforms];
        for (const p of platforms) {
            if (p.x + p.w < r.camera - 100 || p.x > r.camera + 1540)
                continue;
            if (this.drawSurface) { this.drawSurface(p, map); continue; }
            const depth = p.ground ? 550 : map.theme === 'town' ? 17 : 92;
            const g = c.createLinearGradient(0, p.y, 0, p.y + depth);
            g.addColorStop(0, col[1]);
            g.addColorStop(1, col[2]);
            if (p.ground || map.theme === 'town') {
                this.round(p.x, p.y, p.w, depth, 9, g);
            }
            else {
                c.fillStyle = g;
                c.beginPath();
                c.moveTo(p.x, p.y);
                c.lineTo(p.x + p.w, p.y);
                c.quadraticCurveTo(p.x + p.w + 10, p.y + 39, p.x + p.w - 32, p.y + depth * .72);
                for (let xx = p.x + p.w - 32; xx > p.x + 40; xx -= 110)
                    c.quadraticCurveTo(xx - 40, p.y + depth + Math.sin(xx * .02) * 24, Math.max(p.x + 18, xx - 110), p.y + depth * .73);
                c.quadraticCurveTo(p.x - 8, p.y + 45, p.x, p.y);
                c.fill();
            }
            this.round(p.x, p.y - 4, p.w, 13, 6, col[0]);
            if (!['archive', 'observatory', 'town'].includes(map.theme)) {
                for (let xx = p.x + 8; xx < p.x + p.w - 10; xx += 31) {
                    this.ellipse(xx, p.y + 7, 19, 5, col[0]);
                    if (xx > r.camera - 30 && xx < r.camera + 1470 && Math.round(xx) % 5 === 0) {
                        c.strokeStyle = map.theme === 'tide' ? '#a9d1cc' : '#a9bd9f';
                        c.lineWidth = 2;
                        c.beginPath();
                        c.moveTo(xx, p.y - 5);
                        c.quadraticCurveTo(xx - 12, p.y - 28, xx - 17, p.y - 15);
                        c.moveTo(xx, p.y - 4);
                        c.quadraticCurveTo(xx + 7, p.y - 22, xx + 12, p.y - 17);
                        c.stroke();
                    }
                }
            }
            c.globalAlpha = .15;
            for (let x = p.x + 20; x < p.x + p.w; x += 95) {
                c.strokeStyle = '#fff3da';
                c.lineWidth = 1;
                c.beginPath();
                c.moveTo(x, p.y + 20);
                c.lineTo(x + 18, p.y + 45);
                c.lineTo(x + 9, p.y + depth - 7);
                c.stroke();
            }
            c.globalAlpha = 1;
            for (let x = p.x + 40; x < p.x + p.w; x += 280) {
                if (x < r.camera - 80 || x > r.camera + 1520)
                    continue;
                this.ellipse(x, p.y + 3, 30, 3, '#fff5da66');
                if (!p.ground && map.theme !== 'town') {
                    this.star(x, p.y + 43, 3, '#dce5ce');
                    c.strokeStyle = col[0] + '66';
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(x + 65, p.y + 12);
                    c.bezierCurveTo(x + 84, p.y + 60, x + 40, p.y + 90, x + 70, p.y + 125);
                    c.stroke();
                }
            }
        }
        for (const l of map.ladders) {
            this.round(l.x - 25, l.top - 15, 5, l.bottom - l.top + 18, 2, '#b4a0a0');
            this.round(l.x + 20, l.top - 15, 5, l.bottom - l.top + 18, 2, '#b4a0a0');
            for (let y = l.top + 5; y < l.bottom; y += 23)
                this.round(l.x - 22, y, 45, 4, 2, '#e7d2b5');
            this.text('↑ ↓', l.x, l.top - 25, 12, '#f6efd1');
        }
        for (const d of map.devices) {
            const done = r.state.remaster.devices.includes(d.id);
            if (d.kind === 'camp') {
                this.ellipse(d.x, d.y - 3, 43, 8, '#a58d9844');
                this.groundArt('streetlamp',d.x-30,d.y,45);
                this.item('tea', d.x + 22, d.y - 22, 34);
                this.text('별빛 야영지', d.x, d.y - 110, 13, '#fff0cb');
            }
            if (d.kind === 'lift') {
                c.strokeStyle = '#c7b6ab';
                c.lineWidth = 2;
                for (const dx of [-44, 44]) {
                    c.beginPath();
                    c.moveTo(d.x + dx, d.top - 80);
                    c.lineTo(d.x + dx, d.bottom);
                    c.stroke();
                }
                this.round(d.x - 58, d.y - 2, 116, 14, 5, '#c6ac98', '#f2d6b3');
                c.strokeStyle='#c7b6ab';c.lineWidth=2;c.beginPath();c.moveTo(d.x-44,d.y-125);c.lineTo(d.x+44,d.y-125);c.moveTo(d.x,d.y-125);c.lineTo(d.x,d.y-98);c.stroke();
                this.item('lantern', d.x, d.y - 70, 50, 60);
                this.text('달빛 승강기 ↕', d.x, d.y - 120, 13, '#fff0d3');
            }
            if (d.kind === 'cache' && done)
                this.chest(d.x, d.y, true, 82);
            if (d.kind === 'cache' && !done) {
                this.chest(d.x, d.y, false, 82);
                this.glow(d.x, d.y - 25, 55, '#f8dba5');
                this.item('badge', d.x, d.y - 24, 28);
            }
            if (d.kind === 'vent') {
                for (let j = 0; j < 5; j++) {
                    const y = d.y - (r.clock * 110 + j * 45) % 250;
                    c.globalAlpha = (1 - (d.y - y) / 260) * .5;
                    c.strokeStyle = '#d2ece1';
                    c.lineWidth = 3;
                    c.beginPath();
                    c.ellipse(d.x, y, 22 + j * 3, 7, 0, 0, Math.PI * 1.7);
                    c.stroke();
                }
                c.globalAlpha = 1;
                this.text('상승 바람', d.x, d.y - 35, 12, '#eff7d1');
            }
            if (d.kind === 'switch') {
                this.drawBridgeControl(d, done);
            }
        }
    };
    R.enemy = function (e) {
        const c = this.ctx, previousG = this.G;
        this.G = e.floorY ?? 651;
        c.save();
        if (e.action === 'strike') {
            c.translate(e.x, e.y);
            c.rotate(e.type === 'sand' ? e.attackFace * .3 : e.type === 'crab' ? Math.sin(e.actionT * 12) * .09 : 0);
            c.translate(-e.x, -e.y);
        }
        oldEnemy.call(this, e);
        c.restore();
        this.G = previousG;
        if (e.dead)
            return;
        if (e.windup > 0) {
            const span = e.type === 'box' ? 390 : 220;
            c.save();
            c.globalAlpha = .2 + Math.sin(this.r.clock * 16) * .05;
            this.round(Math.min(e.x, e.x + e.attackFace * span), e.floorY - 6, span, 12, 6, '#e68f8d');
            c.restore();
            this.text(e.type === 'box' ? '딸깍…' : e.type === 'crab' ? '집게를 든다!' : '몸통을 낮춘다!', e.x, e.y - this.C.creatures[e.type].size - 64, 12, '#71485e');
        }
        if (e.action === 'recover')
            this.text('정화할 틈!', e.x, e.y - this.C.creatures[e.type].size - 55, 12, '#fff1bd');
        if (e.action === 'strike' && e.type === 'crab') {
            const p = 1 - e.actionT / e.actionLength;
            c.strokeStyle = '#fff0d0';
            c.lineWidth = 5;
            c.beginPath();
            c.arc(e.x + e.attackFace * 35, e.y - 50, 68, -Math.PI * .8 + p, Math.PI * .5 + p);
            c.stroke();
        }
    };
    // All world drops use this renderer, including the illustrated item overrides.
    // Keep rarity in a soft glow; inventory-style frames do not belong in the world.
    R.drawLoot = function (r) {
        const c = this.ctx;
        for (const l of r.rpgInfo.loot) {
            const grade = this.C.grades[l.grade || 'common'], a = l.age;
            const alpha = Math.max(0, Math.min(1, a * 5, (l.duration - a) * 3));
            const y = l.y + Math.sin(a * 8) * 3;
            c.save();
            c.globalAlpha = alpha;
            this.glow(l.x, y, l.grade === 'unique' ? 74 : 48, grade.color);
            this.item(l.icon, l.x, y, 45);
            this.star(l.x + 24, y - 28, 5, '#fff3b5', r.clock);
            // Names remain in the acquisition notice; only compact text accompanies the drop.
            c.shadowColor = '#42354a';
            c.shadowBlur = 4;
            c.shadowOffsetY = 1;
            if (l.grade === 'rare' || l.grade === 'unique')
                this.text(grade.symbol + ' ' + grade.name, l.x, y - 39, 14, grade.color, 'center', 750);
            if (a > .4 && a < 1.8)
                this.text('+' + l.count, l.x, y + 39, 13, '#fff7df', 'center', 700);
            c.restore();
        }
    };

    R.draw = function (r) {
        this.r = r;
        const c = this.ctx, map = this.C.maps[r.state?.map || 0], title = r.mode === 'title' || r.mode === 'loading' || (r.mode === 'modal' && !r.state.flags.introSeen);
        c.clearRect(0, 0, 1440, 810);
        this.sky(title ? 0 : r.camera, r.clock, title);
        if (title)
            return;
        this.drawRegionBackdrop(r);
        const fog = c.createLinearGradient(0, 0, 0, 810);
        fog.addColorStop(0, '#24284020');
        fog.addColorStop(1, '#45516a16');
        c.fillStyle = fog;
        c.fillRect(0, 0, 1440, 810);
        c.save();
        c.translate(-r.camera, -(r.cameraY || 0));
        if (!r.settings.reducedMotion && r.shake)
            c.translate(Math.sin(r.clock * 70) * r.shake, Math.cos(r.clock * 57) * r.shake * .6);
        this.drawIllustratedBuildings(map);
        this.terrain(map);
        for (const ex of this.C.exits[r.state.map]) {
            c.save();
            c.translate(ex.x, 651);
            c.scale(.78, .78);
            c.translate(-ex.x, -651);
            this.portal(ex.x, this.C.maps[ex.to].name, ex.x < 500, !this.gateOpen(ex.gate));
            c.restore();
        }
        this.drawDecorations(map);
        this.collectible(map.memory);
        this.drawRPGWorld(r);
        for (const e of r.enemies)
            if (Math.abs(e.x - r.player.x) < 1700)
                this.enemy(e);
        this.drawGrowthPet?.(r);
        this.actor(r.state.active, r.player.x, r.player.y, r.player.facing, true);
        this.drawHitEffects(r);
        for (const w of r.waves) {
            if (w.kind === 'region') { this.item(w.icon,w.x,w.y,26,26,r.clock*2); continue; }
            if (w.kind === 'tideBubble') {
                c.save();c.fillStyle='#93dfeb70';c.strokeStyle='#e1fffa';c.lineWidth=2;
                c.beginPath();c.arc(w.x,w.y,w.r,0,Math.PI*2);c.fill();c.stroke();
                this.ellipse(w.x-6,w.y-7,5,3,'#ffffffda');c.restore();
                continue;
            }
            this.glow(w.x, w.y, w.kind === 'button' ? 23 : 53, '#d9c5ed');
            this.item(w.kind === 'button' ? 'badge' : 'dust', w.x, w.y, w.kind === 'button' ? 23 : 55, undefined, r.clock * 4);
        }
        this.drawLoot(r);
        if (!r.settings.reducedMotion)
            for (const p of r.particles) {
                c.globalAlpha = Math.max(0, Math.min(1, p.life / .4));
                this.star(p.x, p.y, p.r, p.color, r.clock * 3 + p.x);
            }
        c.globalAlpha = 1;
        for (const ring of r.rings) {
            const k = ring.life / ring.max;
            c.globalAlpha = k;
            c.strokeStyle = ring.color;
            c.lineWidth = 4;
            c.beginPath();
            c.ellipse(ring.x, ring.y, ring.r * (1 - k), ring.r * (1 - k) * .7, 0, 0, Math.PI * 2);
            c.stroke();
        }
        c.globalAlpha = 1;
        for (const txt of r.texts) {
            c.globalAlpha = Math.min(1, txt.life / .3);
            c.shadowColor = '#65516e';
            c.shadowBlur = 4;
            this.text(txt.text, txt.x, txt.y, /^[0-9]/.test(txt.text) ? 27 : 16, txt.color, 'center', 750);
        }
        c.globalAlpha = 1;
        c.shadowBlur = 0;
        c.restore();
        if (r.transition > 0) {
            c.fillStyle = `rgba(250,235,220,${r.transition})`;
            c.fillRect(0, 0, 1440, 810);
        }
    };
})();
