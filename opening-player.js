'use strict';
window.createDreamOpening = function ({mount, source, poster, settings, onOpen, onClose}) {
    const KEY = 'dreamy-nights-opening-v1';
    let orientationSuspended = false;
    let active = false, played = false, seen = false, loadTimer = 0, previousFocus;
    try { seen = localStorage.getItem(KEY) === 'seen'; } catch {}
    const root = document.createElement('section');
    root.className = 'dream-opening hidden';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', '첫 번째 밤의 시작 · 인트로');
    root.innerHTML = `<video class="opening-video" playsinline preload="none" aria-label="첫 순찰을 준비하는 아리와 포포"></video>
        <div class="opening-shade"></div>
        <div class="opening-invitation"><span>OUR DREAMY NIGHTS</span><h2>서툰 꿈에도,<br>돌아갈 빛은 있으니까.</h2><button type="button" class="opening-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor"/></svg><b>꿈의 문 열기</b></button><p class="opening-status" role="status">첫 번째 밤이 시작돼요.</p></div>
        <p class="opening-caption" aria-live="off"></p>
        <div class="opening-bottom"><span class="opening-label">첫 번째 밤 · 작은 빛의 약속</span><div><button type="button" class="opening-pause" hidden>잠시 멈추기</button><button type="button" class="opening-sound">소리 끄기</button><button type="button" class="opening-skip">건너뛰기 <span aria-hidden="true">›</span></button></div></div>`;
    const video = root.querySelector('video'), play = root.querySelector('.opening-play'), pause = root.querySelector('.opening-pause'), sound = root.querySelector('.opening-sound'), skip = root.querySelector('.opening-skip'), status = root.querySelector('.opening-status'), caption = root.querySelector('.opening-caption');
    const paint=(node,label,icon,caption='')=>{if(window.DREAM_LOBBY_UI)DREAM_LOBBY_UI.button(node,label,icon,caption);else if(node.querySelector('b'))node.querySelector('b').textContent=label;else node.textContent=label;};
    paint(play,'꿈의 문 열기','play','첫 번째 밤의 프롤로그');
    paint(skip,'건너뛰기','skip');
    video.poster = poster;
    mount.append(root);
    function updateSound() {
        paint(sound,video.muted?'소리 켜기':'소리 끄기',video.muted?'mute':'sound');
        sound.setAttribute('aria-pressed', String(!video.muted));
    }
    function stopTimer() { clearTimeout(loadTimer); loadTimer = 0; }
    function recordSeen() {
        seen = true;
        try { localStorage.setItem(KEY, 'seen'); } catch {}
    }
    function close(mark = true) {
        if (!active) return;
        active = false;
        stopTimer();
        video.pause();
        if (mark) recordSeen();
        root.classList.add('hidden');
        onClose();
        if (previousFocus?.isConnected && !previousFocus.closest('.hidden')) previousFocus.focus({preventScroll:true});
    }
    function mediaError() {
        if (!active) return;
        stopTimer();
        video.pause();
        root.classList.remove('is-playing');
        root.classList.add('has-error');
        status.textContent = '영상을 불러오지 못했어요. 바로 게임을 시작할 수 있어요.';
        play.querySelector('b').textContent = '게임으로 들어가기';
        play.disabled = false;
        pause.hidden = true;
    }
    async function startVideo() {
        if (!active || orientationSuspended) return;
        if (root.classList.contains('has-error')) { close(); return; }
        play.disabled = true;
        status.textContent = '꿈의 문을 열고 있어요…';
        stopTimer();
        loadTimer = setTimeout(mediaError, 15000);
        try {
            if (!video.getAttribute('src')) video.src = source;
            await video.play();
            if (!active) { video.pause(); return; }
            if (orientationSuspended) video.pause();
            played = true;
            stopTimer();
            root.classList.add('is-playing');
            play.disabled = false;
            pause.hidden = false;
            paint(pause,orientationSuspended?'계속 보기':'잠시 멈추기',orientationSuspended?'play':'pause');
            pause.focus({preventScroll:true});
        } catch (error) {
            if (!active) return;
            stopTimer();
            play.disabled = false;
            if (error.name === 'AbortError' && orientationSuspended) { status.textContent = '가로 화면에서 꿈의 문을 다시 열어주세요.'; return; }
            if (error.name === 'NotAllowedError') status.textContent = '꿈의 문 열기를 한 번 더 눌러주세요.';
            else mediaError();
        }
    }
    function open() {
        if (!source || active) return false;
        active = true; played = false;
        previousFocus = document.activeElement;
        root.classList.remove('hidden', 'is-playing', 'has-error');
        status.textContent = '첫 번째 밤이 시작돼요.';
        play.querySelector('b').textContent = '꿈의 문 열기';
        caption.textContent = '';
        play.disabled = false; pause.hidden = true;
        video.muted = !settings.sound;
        video.volume = Math.min(1, Math.max(0, settings.volume * 2 * (settings.musicVolume ?? .55)));
        if (video.readyState) video.currentTime = 0;
        updateSound();
        onOpen();
        play.focus({preventScroll:true});
        return true;
    }
    play.onclick = startVideo;
    skip.onclick = () => close();
    pause.onclick = () => {
        if (video.paused) startVideo();
        else { video.pause(); paint(pause,'계속 보기','play'); }
    };
    sound.onclick = () => { video.muted = !video.muted; updateSound(); };
    video.onended = () => close();
    video.onerror = mediaError;
    video.onwaiting = () => { if (active && played && !orientationSuspended) { stopTimer(); loadTimer = setTimeout(mediaError, 15000); } };
    video.onplaying = stopTimer;
    video.ontimeupdate = () => {
        const duration = video.duration;
        if (!Number.isFinite(duration) || !active) return;
        caption.textContent = video.currentTime < duration * .48 ? '잠든 마음에, 작은 꿈빛이 찾아왔어요.' : '이제, 첫 순찰을 떠날 시간이에요.';
    };
    root.addEventListener('keydown', event => {
        event.stopPropagation();
        if (event.code === 'Escape') { event.preventDefault(); close(); }
        if (event.code === 'Tab') {
            const buttons = [...root.querySelectorAll('button')].filter(b => !b.hidden && !b.disabled && b.offsetParent);
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && active && played && !video.paused) { video.pause(); paint(pause,'계속 보기','play'); }
    });
    return {setOrientationBlocked(blocked){orientationSuspended=blocked;if(blocked){video.pause();stopTimer();paint(pause,'계속 보기','play');}}, open, maybeShow: () => !seen && open(), close, inspect: () => ({active, seen, played, paused:video.paused, error:root.classList.contains('has-error')})};
};
