'use strict';
window.createDreamControls = function ({ keys, keyMap, playing, action, activate, releaseJump, releaseAttack }) {
    const keyboard = new Set(), pointers = new Map();
    const stick = document.getElementById('moveStick'), knob = document.getElementById('stickKnob');
    let stickId = null, x = 0, y = 0, directionTap = null;
    const doubleTapWindow = 260;
    const touch = matchMedia('(pointer:coarse)').matches;
    function syncKeys() {
        keys.clear();
        for (const code of keyboard) if (keyMap[code]) keys.add(keyMap[code]);
        for (const value of pointers.values()) if (value.hold) keys.add(value.hold);
    }
    function held(name) {
        return [...pointers.values()].some(value => value.action === name);
    }
    function move(event) {
        if (event.pointerId !== stickId) return;
        const box = stick.getBoundingClientRect(), radius = box.width * .34;
        const dx = (event.clientX - box.left - box.width / 2) / radius;
        const dy = (event.clientY - box.top - box.height / 2) / radius;
        const length = Math.hypot(dx, dy), scale = Math.max(1, length);
        const deadzone = .18;
        const magnitude = Math.max(0, (Math.min(1, length) - deadzone) / (1 - deadzone));
        x = length > 0 ? dx / length * magnitude : 0;
        y = length > 0 ? dy / length * magnitude : 0;
        const stageScale = box.width / stick.offsetWidth;
        knob.style.transform = `translate(-50%, -50%) translate(${dx / scale * radius / stageScale}px, ${dy / scale * radius / stageScale}px)`;
    }
    function release(id, cancelled = false) {
        const value = pointers.get(id);
        if (!value) return;
        pointers.delete(id);
        if (id === stickId) { stickId = null; x = y = 0; knob.style.transform = 'translate(-50%, -50%)'; }
        value.element.classList.toggle('pressed', [...pointers.values()].some(p => p.element === value.element));
        syncKeys();
        if (value.action === 'jump' && !held('jump')) releaseJump();
        if (value.action === 'attack' && !held('attack')) releaseAttack(cancelled);
    }
    function bind(element, kind, name) {
        element.addEventListener('pointerdown', event => {
            if (event.button > 0 || !playing() || (kind === 'stick' && stickId !== null)) return;
            event.preventDefault();
            activate();
            element.setPointerCapture(event.pointerId);
            const alreadyHeld = kind === 'action' && held(name);
            pointers.set(event.pointerId, { element, hold: kind === 'hold' ? name : null, action: kind === 'action' ? name : null });
            element.classList.add('pressed');
            syncKeys();
            if (kind === 'stick') { stickId = event.pointerId; move(event); }
            else if (kind === 'action' && !alreadyHeld) action(name === 'attack' ? 'attackPress' : name);
        });
        for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
            element.addEventListener(type, event => release(event.pointerId, type !== 'pointerup'));
        }
        element.addEventListener('contextmenu', event => event.preventDefault());
        if (kind === 'action') element.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.repeat) { event.preventDefault(); action(name); }
        });
    }
    bind(stick, 'stick');
    stick.addEventListener('pointermove', move);
    document.querySelectorAll('[data-hold]').forEach(element => bind(element, 'hold', element.dataset.hold));
    document.querySelectorAll('[data-action]').forEach(element => bind(element, 'action', element.dataset.action));
    function clear() {
        keyboard.clear();
        directionTap = null;
        for (const [id, value] of [...pointers]) {
            // Clear state before releasing capture; lostpointercapture can run synchronously.
            pointers.delete(id);
            value.element.classList.remove('pressed');
            if (value.element.hasPointerCapture(id)) value.element.releasePointerCapture(id);
        }
        stickId = null;
        x = y = 0;
        knob.style.transform = 'translate(-50%, -50%)';
        keys.clear();
    }
    return {
        touch, clear, held,
        keyDown(code) {
            if (keyboard.has(code)) return; // Auto-repeat is movement, never another tap.
            const direction = keyMap[code];
            const horizontal = direction === 'left' || direction === 'right';
            const wasHeld = [...keyboard].some(key => keyMap[key] === direction);
            const oppositeHeld = [...keyboard].some(key => keyMap[key] === (direction === 'left' ? 'right' : 'left'));
            keyboard.add(code);
            syncKeys(); // Dash reads the newly pressed direction.
            if (!horizontal) return;
            if (!playing() || wasHeld || oppositeHeld) { directionTap = null; return; }
            const now = performance.now();
            if (directionTap?.direction === direction && directionTap.released && now - directionTap.time <= doubleTapWindow) {
                directionTap = null; // A rejected cooldown attempt must not queue a later dash.
                action('dodge');
            } else {
                directionTap = { direction, time: now, released: false };
            }
        },
        keyUp(code) {
            keyboard.delete(code);
            syncKeys();
            if (directionTap?.direction === keyMap[code] && ![...keyboard].some(key => keyMap[key] === directionTap.direction))
                directionTap.released = true;
        },
        axisX: () => Math.abs(y) > .5 && Math.abs(y) > Math.abs(x) * 1.15 ? 0 : x,
        climbAxis: () => Math.abs(y) > .5 && Math.abs(y) > Math.abs(x) * .95 ? Math.sign(y) : 0,
        inspect: () => ({ x, y, pointers: pointers.size, attack: held('attack'), keyboard: [...keyboard] })
    };
};
