'use strict';
window.createDreamConversation = function ({settings, images}) {
    const $ = id => document.getElementById(id), root = $('dialogue');
    let letters = [], shown = 0, remaining = 0, last = false, current = null, cues = [], expression = '';
    const expressions = window.DreamExpressions, portraitCanvas = $('dialogueExpression');
    function updateExpression() {
        if (!current) return;
        const next = expressions.choose(cues, shown);
        if (next === expression) return;
        const visible = expressions.draw(portraitCanvas, current.who, next, images);
        portraitCanvas.classList.toggle('hidden', !visible);
        $('dialoguePortrait').classList.toggle('hidden', visible || !current.portrait);
        root.dataset.expression = visible ? next : '';
        expression = next;
        current.expression = visible ? next : null;
    }
    function syncVoice() {
        const on = !!settings.voice;
        $('voiceToggle').textContent = '♪';
        $('voiceToggle').classList.toggle('voice-muted', !on);
        $('voiceToggle').setAttribute('aria-pressed', String(on));
        $('voiceToggle').setAttribute('aria-label', on ? '음성 끄기' : '음성 켜기');
        $('voiceToggle').title = on ? '음성 켜짐 · 누르면 끄기' : '음성 꺼짐 · 누르면 켜기';
    }
    function updateButton() {
        updateExpression();
        const typing = shown < letters.length;
        root.classList.toggle('is-speaking', typing);
        $('dialogueNext').innerHTML = `${last && !typing ? '대화 마치기' : '다음'} <kbd>Enter</kbd><span aria-hidden="true">›</span>`;
        $('dialogueNext').setAttribute('aria-label', typing ? '지금 대사 전체 보기' : last ? '대화 마치기' : '다음 대사');
    }
    function finish() {
        shown = letters.length;
        $('dialogueInk').textContent = letters.join('');
        updateButton();
    }
    function render({who, name, portrait, line, index, total, active, key}) {
        current = {who, line, index, total, key, portrait, expression:null};
        cues = expressions.timeline(key, index, line);
        expression = '';
        portraitCanvas.classList.add('hidden');
        root.dataset.speaker = who;
        root.dataset.side = !portrait ? 'narrator' : who === active ? 'right' : 'left';
        $('dialoguePortrait').classList.toggle('hidden', !portrait);
        $('dialogueSymbol').classList.toggle('hidden', !!portrait);
        if (portrait) {
            $('dialoguePortrait').src = portrait;
            $('dialoguePortrait').alt = name;
        }
        $('dialogueSpeaker').textContent = name;
        $('dialogueMeasure').textContent = line;
        // Announce the complete utterance once; visual letter updates are hidden from assistive technology.
        $('dialogueAccessible').textContent = name + '. ' + line;
        $('dialoguePage').textContent = `${index + 1} / ${total}`;
        last = index === total - 1;
        letters = Array.from(line.normalize('NFC'));
        shown = Math.min(2, letters.length);
        remaining = 0;
        $('dialogueInk').textContent = letters.slice(0, shown).join('');
        syncVoice();
        if (settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
        else updateButton();
    }
    function update(dt) {
        if (shown >= letters.length) return;
        remaining += dt;
        while (shown < letters.length) {
            const previous = letters[shown - 1], delay = /[.!?…\n]/.test(previous) ? .105 : .022;
            if (remaining < delay) break;
            remaining -= delay;
            shown++;
        }
        $('dialogueInk').textContent = letters.slice(0, shown).join('');
        updateExpression();
        if (shown >= letters.length) updateButton();
    }
    return {render, update, finish, syncVoice, typing: () => shown < letters.length,
        inspect: () => current ? {...current, typing: shown < letters.length} : null};
};
