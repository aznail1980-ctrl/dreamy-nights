'use strict';
/* Illustrated region doors. The painted frame stays grounded; only its light moves. */
(() => {
    window.DREAM_ART_V49.files.dreamPortalV4202 = 'assets/dreamPortalV4202.png';
    const R = window.DreamRenderer.prototype;
    const palettes = {
        tide: ['#99e8e9', '#285b85'], waterway: ['#99e8e9', '#285b85'],
        garden: ['#c9edaf', '#3d7567'], trail: ['#c9edaf', '#3d7567'],
        observatory: ['#dfc9ff', '#61529a'], archive: ['#f7cfad', '#806087'],
        boss: ['#ffc9b2', '#7d536c']
    };
    function opening(c) {
        c.beginPath();
        c.moveTo(-49, -29);
        c.lineTo(-46, -111);
        c.bezierCurveTo(-45, -180, 45, -180, 46, -111);
        c.lineTo(49, -29);
        c.closePath();
    }
    R.portal = function (x, destination, left = false, locked = false, y = this.G, theme = '') {
        const r = this.r, c = this.ctx;
        if (x < r.camera - 150 || x > r.camera + this.W + 150 || y < (r.cameraY || 0) - 20 || y - 275 > (r.cameraY || 0) + this.H) return;
        const t = r.settings.reducedMotion ? 0 : r.clock;
        // Match the interaction radius, including elevated doors.
        const near = Math.abs(r.player.x - x) < 90 && Math.abs(r.player.y - y) < 65;
        const [light, deep] = locked ? ['#bdafcb', '#4f4667'] : (palettes[theme] || ['#aeece3', '#3c7591']);
        const breath = r.settings.reducedMotion ? 1 : .91 + Math.sin(t * 1.7 + x) * .09;
        c.save();
        c.translate(x, y);
        this.ellipse(0, 4, 85, 10, '#26384c35');
        // A small ground reflection ties the doorway to the platform.
        this.ellipse(0, 1, near && !locked ? 85 : 68, 9, light + (locked ? '20' : '4d'));
        c.save();
        c.globalAlpha = locked ? .35 : (near ? .95 : .65) * breath;
        this.glow(0, -101, near ? 130 : 111, light);
        c.restore();

        c.save();
        opening(c);
        c.clip();
        const mist = c.createLinearGradient(-35, -166, 35, -25);
        mist.addColorStop(0, deep + 'eb');
        mist.addColorStop(.5, light + (locked ? '66' : 'ce'));
        mist.addColorStop(1, deep + 'c7');
        c.fillStyle = mist;
        c.fillRect(-53, -183, 106, 162);
        this.glow(0, -95, 79, light);
        if (!locked) {
            // Soft travelling ribbons and stars, clipped inside the actual arch.
            c.lineCap = 'round';
            for (let i = 0; i < 4; i++) {
                const yy = -27 - ((t * 18 + i * 38) % 155);
                c.beginPath();
                c.moveTo(-58, yy + 14);
                c.bezierCurveTo(-12, yy - 15, 15, yy + 24, 60, yy - 5);
                c.strokeStyle = i % 2 ? '#ffefc44a' : '#e5fff966';
                c.lineWidth = i % 2 ? 2 : 5;
                c.stroke();
            }
            for (let i = 0; i < 9; i++) {
                const yy = -33 - ((t * (10 + i % 3) + i * 19) % 139);
                this.star(Math.sin(i * 2.4 + t * .28) * 35, yy, i % 3 === 0 ? 3 : 1.5, '#fff5d3');
            }
        }
        c.restore();

        const frame = this.images.dreamPortalV4202;
        // The source has transparent padding; its painted doorstep meets y = 0.
        c.save();
        if (locked) c.globalAlpha = .76;
        if (frame) c.drawImage(frame, -96, -213, 192, 218);
        c.restore();
        if (locked) {
            // A readable seal, without relying on emoji/font support.
            this.ellipse(0, -96, 21, 21, '#44374ded');
            c.strokeStyle = '#efdec7';
            c.lineWidth = 2;
            c.beginPath();
            c.arc(0, -100, 6, Math.PI, 0);
            c.stroke();
            this.round(-9, -100, 18, 15, 4, '#efdec7');
            this.ellipse(0, -94, 2, 2, '#635572');
        } else if (near) {
            this.star(0, -100, 12, '#fff4c9', -.1);
            this.star(0, -100, 5, '#ffffff');
        }

        // Do not pin an offscreen door's name over an unrelated part of the scene.
        if (x < r.camera || x > r.camera + this.W) { c.restore(); return; }
        // Destination plaque remains in view at the left and right map edges.
        c.font = '600 14px "Apple SD Gothic Neo","Malgun Gothic",sans-serif';
        const width = Math.max(176, Math.min(248, c.measureText(destination).width + 50));
        const labelX = Math.max(r.camera + width / 2 + 8, Math.min(r.camera + this.W - width / 2 - 8, x)) - x;
        this.round(labelX - width / 2, -266, width, 34, 12, locked ? '#42394fee' : '#233f50ee', locked ? '#ac95b377' : '#efdaa5b3');
        this.star(labelX - width / 2 + 17, -249, 4, locked ? '#cbb5cd' : '#ffe3a0');
        this.text(destination, labelX + 6, -244, 14, '#fff3dc', 'center', 650);
        const touch = window.matchMedia?.('(pointer: coarse)').matches;
        const hint = locked ? '단서를 찾으면 열려요' : near ? (touch ? '이동 버튼으로 들어가기' : 'E · 들어가기') : '지역 이동';
        this.round(labelX - 83, -229, 166, 21, 10, '#243342b8');
        this.text(hint, labelX, -214, 11, locked ? '#e3d7eb' : '#e4fff5', 'center', 600);
        c.restore();
    };
})();
