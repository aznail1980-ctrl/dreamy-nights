'use strict';
/* Authored scene cues describe emotion independently of the selected hero. */
window.DreamExpressions = (() => {
    const frames = window.DREAM_EXPRESSION_FRAMES;
    const labels = {smile:'부드러운 미소',joy:'활짝 웃음',surprise:'놀란 표정',focus:'집중한 표정',laugh:'환하게 웃음',pout:'뾰로통한 표정',touched:'울먹이며 미소',silly:'장난스러운 웃음',rest:'편안하게 눈을 감음',wink:'자신 있는 윙크',uneasy:'걱정스러운 표정'};
    const cue = (emotion, at = '') => ({emotion, at});
    const scenes = {
        intro: {1:[cue('surprise'),cue('focus','괜찮아.')],2:[cue('focus')],3:[cue('joy'),cue('wink','좋아,')]},
        firstMemory: {0:[cue('surprise'),cue('joy','이 반짝')],1:[cue('smile')]},
        town: {0:[cue('joy'),cue('uneasy','등대는')],2:[cue('smile')],4:[cue('uneasy')],7:[cue('focus')]},
        bossIntro: {0:[cue('surprise'),cue('focus','들숨')],1:[cue('focus')]},
        finale: {1:[cue('touched')],2:[cue('surprise'),cue('joy','우와,')],4:[cue('smile'),cue('silly','등대지기가')],5:[cue('surprise'),cue('laugh','에헤헤.'),cue('wink','순찰 완료')]},
        friendship: {0:[cue('wink'),cue('joy','여기 별표')],1:[cue('focus'),cue('silly','남들이')],2:[cue('joy'),cue('wink','편지 쓸')]},
        bakerFirst: {1:[cue('smile')]},
        cooked: {0:[cue('joy'),cue('silly','아니,'),cue('wink','하나쯤')]},
        postFirst: {1:[cue('focus')]},
        restoredLetter: {1:[cue('touched'),cue('joy','이 문장은')]},
        captainTruth: {1:[cue('touched')],3:[cue('smile'),cue('focus','그 걱정,')]},
        bossRecovered: {1:[cue('surprise'),cue('touched','내가 매일')],2:[cue('smile')]},
        journalHome: {1:[cue('smile'),cue('silly','등대지기가')],2:[cue('surprise')]},
        relight: {4:[cue('touched'),cue('joy','아리, 포미!'),cue('wink','순찰 완료')]},
        mailDone: {1:[cue('joy'),cue('surprise','앗,'),cue('wink','마음 발견')]},
        tideSolved: {0:[cue('surprise'),cue('joy','저 아래')],1:[cue('smile')]},
        windSolved: {0:[cue('focus'),cue('joy','관측소로')],1:[cue('touched'),cue('focus','이 신호를')]},
        chartSolved: {1:[cue('focus')]},
        archiveRead: {0:[cue('touched')],1:[cue('touched')],2:[cue('focus'),cue('smile','뒤뚱에게')]},
        bridgeSolved: {0:[cue('joy'),cue('wink','승강기도')],1:[cue('focus'),cue('smile','반장님의')]}
    };
    for (const sheet of Object.values(frames)) window.DREAM_ART_V49.files[sheet.key] = sheet.file;
    function timeline(key, index, line) {
        return (scenes[key]?.[index] || [cue('smile')]).map(c => ({emotion:c.emotion,position:c.at ? line.indexOf(c.at) : 0})).filter(c => c.position >= 0);
    }
    function choose(cues, shown) {
        return cues.filter(c => c.position < Math.max(1, shown)).at(-1)?.emotion || 'smile';
    }
    function draw(canvas, who, emotion, images) {
        const sheet = frames[who], ctx = canvas?.getContext('2d');
        if (!sheet || !ctx || !images[sheet.key]?.complete || !images[sheet.key].naturalWidth) return false;
        const frame = sheet.frames[sheet.emotions[emotion] ?? 0], [sx,sy,w,h] = frame.box, [ax,ay] = frame.anchor, scale = sheet.scale;
        // A shared eye line and collar baseline keep the face still when its expression changes.
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.save();ctx.scale(canvas.width/220,canvas.height/240);
        ctx.drawImage(images[sheet.key],sx,sy,w,h,110+(sx-ax)*scale,sheet.eyeY+(sy-ay)*scale,w*scale,h*scale);
        // Soften only the cut edge of the bust, leaving all facial details untouched.
        ctx.globalCompositeOperation='destination-in';
        const fade=ctx.createLinearGradient(0,220,0,240);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');ctx.fillStyle=fade;ctx.fillRect(0,0,220,240);
        ctx.restore();canvas.dataset.character=who;canvas.dataset.expression=emotion;
        canvas.setAttribute('aria-label',({ari:'아리',popo:'포포'}[who]||who)+' · '+(labels[emotion]||labels.smile));
        return true;
    }
    return Object.freeze({frames,labels,scenes,timeline,choose,draw});
})();
