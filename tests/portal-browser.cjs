const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'), out = path.join(root, 'test-results');
const url = 'file://' + path.join(root, 'index.html'), key = 'dreamy-nights-chapter-one-v1';
(async () => {
    fs.mkdirSync(out, { recursive: true });
    const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined });
    const errors = [], checks = [];
    try {
        const setup = await browser.newPage();
        await setup.addInitScript(() => localStorage.setItem('dreamy-nights-opening-v1', 'seen'));
        await setup.goto(url);
        await setup.waitForFunction(() => window.DreamGame?.inspect().mode === 'title', {}, { timeout: 45000 });
        await setup.click('#startButton'); await setup.click('#confirmHero');
        await setup.waitForFunction(() => DreamGame.inspect().mode === 'dialogue');
        await setup.click('#dialogueSkip'); await setup.waitForFunction(() => DreamGame.inspect().mode === 'play');
        const { seed, exits } = await setup.evaluate(() => ({ seed: DreamGame.inspect().state, exits: DREAM_CONTENT.exits }));
        await setup.close();
        const cases = [
            { name: 'coast-open', map: 0, to: 1, open: true, w: 1440, h: 920 },
            { name: 'cave-locked', map: 0, to: 5, open: false, w: 1440, h: 920 },
            { name: 'cave-open', map: 0, to: 5, open: true, w: 1440, h: 920 },
            { name: 'boss-locked', map: 3, to: 4, open: false, w: 1280, h: 800 },
            { name: 'mobile-open', map: 0, to: 1, open: true, w: 390, h: 844 },
            { name: 'mobile-landscape', map: 0, to: 5, open: true, w: 844, h: 390 }
        ];
        for (const test of cases) {
            const ex = exits[test.map].find(e => e.to === test.to), state = structuredClone(seed);
            Object.assign(state, { map: test.map, x: ex.x - 50, y: ex.y ?? 651, visited: Array.from({length: 10}, (_, i) => i), killed: [] });
            Object.assign(state.flags, { introSeen: true, firstMemory: true, metBaker: true, metPost: true, bossIntroduced: true, metLumen: test.open, readyForBoss: true, bridgeOpened: true, starChartRead: true, archiveRead: test.open });
            const p = await browser.newPage({ viewport: { width: test.w, height: test.h }, isMobile: test.w < 1000, hasTouch: test.w < 1000 });
            p.on('pageerror', e => errors.push(e.message));
            await p.addInitScript(({ key, state }) => {
                localStorage.setItem(key, JSON.stringify(state));
                localStorage.setItem('dreamy-nights-opening-v1', 'seen');
                localStorage.setItem('dreamy-nights-settings-v1', JSON.stringify({ voice: false, sound: false }));
            }, { key, state });
            await p.goto(url);
            await p.waitForFunction(() => window.DreamGame?.inspect().mode === 'title', {}, { timeout: 45000 });
            await p.evaluate(() => {
                window.__portalCalls = {};
                const old = DreamRenderer.prototype.portal;
                DreamRenderer.prototype.portal = function (x, name, left, locked, y, theme) {
                    window.__portalCalls[name] = { x, locked, y, theme };
                    window.__portalImages = this.images;
                    return old.apply(this, arguments);
                };
            });
            await p.click('#continueButton');
            await p.waitForFunction(() => DreamGame.inspect().interaction?.type === 'portal');
            const info = await p.evaluate(to => ({ current: DreamGame.inspect(), render: __portalCalls[DREAM_CONTENT.maps[to].name], loaded: __portalImages.dreamPortalV4202.complete }), test.to);
            assert.equal(info.current.interaction.dest, test.to);
            assert.equal(info.render.locked, !test.open, test.name + ' display gate');
            assert.equal(info.render.y, ex.y ?? 651); assert(info.loaded);
            await p.waitForFunction(() => document.getElementById('zoneSplash').classList.contains('hidden'));
            await p.screenshot({ path: path.join(out, 'portal-' + test.name + '.png') });
            if (test.name === 'coast-open') {
                const staticMotion = await p.evaluate(() => {
                    const canvas = document.createElement('canvas'); canvas.width = 360; canvas.height = 340;
                    const renderer = new DreamRenderer(canvas, {}, DREAM_CONTENT);
                    renderer.W = 360; renderer.H = 340;
                    renderer.r = { camera: 0, cameraY: 0, settings: { reducedMotion: true }, clock: 0, player: { x: 130, y: 290 } };
                    const draw = time => { renderer.r.clock = time; renderer.ctx.clearRect(0, 0, 360, 340); renderer.portal(180, '빛나는 꿈길', false, false, 290, 'tide'); return canvas.toDataURL(); };
                    const still = draw(0) === draw(20);
                    renderer.r.settings.reducedMotion = false;
                    const moving = draw(0) !== draw(20);
                    return { still, moving };
                });
                assert(staticMotion.still && staticMotion.moving);
                checks.push('Reduced motion freezes the door; normal mode animates its light');
            }
            if (test.w < 1000) await p.click('#interactButton'); else await p.keyboard.press('e');
            if (test.open) await p.waitForFunction(to => DreamGame.inspect().state.map === to, test.to);
            else { await p.waitForTimeout(100); assert.equal(await p.evaluate(() => DreamGame.inspect().state.map), test.map); }
            checks.push(test.name + ': illustrated gate and ' + (test.open ? 'travel' : 'blocked travel') + ' match');
            await p.close();
        }
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(out, 'portal-result.json'), JSON.stringify({ checks, errors }, null, 2));
        console.log('PASS', checks);
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
