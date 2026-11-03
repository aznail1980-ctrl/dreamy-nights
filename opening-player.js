'use strict';
window.createDreamOpening = function ({mount, source, poster, settings, setSound, onOpen, onClose, hasSavedGame = () => false}) {
    const KEY = 'dreamy-nights-opening-complete-v2';
    let orientationSuspended = false, required = false, storyIndex = -1;
    let active = false, played = false, seen = false, loadTimer = 0, previousFocus;
    try { seen = localStorage.getItem(KEY) === 'complete'; } catch {}
    const root = document.createElement('section');
    root.className = 'dream-opening hidden';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', '첫 번째 밤의 시작 · 인트로');
    root.innerHTML = `<video class="opening-video" playsinline preload="none" aria-label="첫 순찰을 준비하는 아리와 포포"></video>
        <div class="opening-shade"></div><div class="opening-story" hidden><img alt=""><div><small class="opening-story-step"></small><h2></h2><p></p><button class="opening-story-next" type="button">다음 이야기</button></div></div>
        <div class="opening-invitation"><span>OUR DREAMY NIGHTS</span><h2>서툰 꿈에도,<br>돌아갈 빛은 있으니까.</h2><button type="button" class="opening-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor"/></svg><b>꿈의 문 열기</b></button><p class="opening-status" role="status">첫 번째 밤이 시작돼요.</p></div>
        <p class="opening-caption" aria-live="off"></p>
        <div class="opening-bottom"><span class="opening-label">첫 번째 밤 · 작은 빛의 약속</span><div><button type="button" class="opening-pause" hidden>잠시 멈추기</button><button type="button" class="opening-sound">소리 끄기</button><button type="button" class="opening-story-open">그림으로 이야기 보기</button><button type="button" class="opening-skip">건너뛰기 <span aria-hidden="true">›</span></button></div></div>`;
    const video = root.querySelector('video'), play = root.querySelector('.opening-play'), pause = root.querySelector('.opening-pause'), sound = root.querySelector('.opening-sound'), skip = root.querySelector('.opening-skip'), status = root.querySelector('.opening-status'), caption = root.querySelector('.opening-caption');
    const paint=(node,label,icon,caption='')=>{if(window.DREAM_LOBBY_UI)DREAM_LOBBY_UI.button(node,label,icon,caption);else if(node.querySelector('b'))node.querySelector('b').textContent=label;else node.textContent=label;};
    paint(play,'꿈의 문 열기','play','첫 번째 밤의 프롤로그');
    paint(skip,'건너뛰기','skip');
    video.defaultMuted=true;video.muted=true;
    video.poster = poster;
    mount.append(root);
    function updateSound() {
        paint(sound,video.muted?'소리 켜기':'소리 끄기',video.muted?'mute':'sound');
        sound.setAttribute('aria-pressed', String(!video.muted));
    }
    function syncSound(){
        video.muted=!settings.sound;
        video.volume=Math.min(1,Math.max(0,settings.volume*2*(settings.musicVolume??.55)));
        updateSound();
    }
    function stopTimer() { clearTimeout(loadTimer); loadTimer = 0; }
    function recordSeen() {
        seen = true;
        try { localStorage.setItem(KEY, 'complete'); } catch {}
    }
    function close(mark = false) {
        if (!active || (required && !mark)) return false;
        active = false;
        stopTimer();
        video.pause();
        if (mark) recordSeen();
        root.classList.add('hidden');
        onClose();
        if (previousFocus?.isConnected && !previousFocus.closest('.hidden')) previousFocus.focus({preventScroll:true});
    }
    function mediaError() {
        if (!active || storyIndex >= 0) return;
        stopTimer();
        video.pause();
        root.classList.remove('is-playing');
        root.classList.add('has-error');
        status.textContent = '영상을 불러오지 못했어요. 다시 시도하거나 그림으로 같은 이야기를 볼 수 있어요.';
        paint(play,'영상 다시 시도','play');
        play.disabled = false;
        pause.hidden = true;
    }
    async function startVideo() {
        if (!active || orientationSuspended || storyIndex>=0) return;
        if (root.classList.contains('has-error')) { root.classList.remove('has-error');video.removeAttribute('src');video.load(); }
        play.disabled = true;
        status.textContent = '꿈의 문을 열고 있어요…';
        stopTimer();
        loadTimer = setTimeout(mediaError, 15000);
        try {
            if (!video.getAttribute('src')) video.src = source;
            await video.play();
            if (!active || storyIndex >= 0) { video.pause(); return; }
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
        if (active) return false;
        active = true; played = false; required = !canStart();storyIndex=-1;story.hidden=true;root.classList.remove('is-story');skip.hidden=required;storyOpen.hidden=false;
        previousFocus = document.activeElement;
        root.classList.remove('hidden', 'is-playing', 'has-error');
        status.textContent = required?'처음 만나는 이야기예요. 영상이나 그림으로 끝까지 만나주세요.':'첫 번째 밤이 시작돼요.';
        play.querySelector('b').textContent = '꿈의 문 열기';
        caption.textContent = '';
        play.disabled = false; pause.hidden = true;
        window.DREAM_SOUND_POLICY?.respectDeviceMute();
        syncSound();
        if (video.readyState) video.currentTime = 0;
        updateSound();
        onOpen();
        play.focus({preventScroll:true});
        return true;
    }
    function canStart(){ return seen || hasSavedGame(); }
    const story=root.querySelector('.opening-story'),storyOpen=root.querySelector('.opening-story-open'),storyNext=root.querySelector('.opening-story-next');
    const pages=[
        {image:'assets/entry-dream-sea.png',title:'잠든 마음에도, 돌아갈 빛이 있어요',text:'잠의 바다에 밤이 내려앉으면 포근등대가 빛을 밝혀요. 길을 잃은 꿈들이 집으로 돌아갈 수 있도록요.'},
        {image:poster,title:'작은 꿈 지킴이의 첫 순찰',text:'아리와 포포는 각자의 용기를 품고 첫 순찰을 준비해요. 오늘은 어떤 마음을 만나게 될까요?'},
        {image:'assets/harbor.webp',title:'이제, 당신의 이야기가 시작돼요',text:'항구에서 만나는 이웃의 이야기를 듣고 작은 걱정들을 정화해 주세요. 함께할 꿈 지킴이를 고르고, 첫 번째 밤으로 떠나요.'}
    ];
    function showStory(){
        if(!active || orientationSuspended)return;
        video.pause();stopTimer();storyIndex=Math.max(0,storyIndex);const page=pages[storyIndex];
        root.classList.remove('is-playing','has-error');root.classList.add('is-story');story.hidden=false;pause.hidden=true;storyOpen.hidden=true;caption.textContent='';
        story.querySelector('img').src=page.image;story.querySelector('img').alt=page.title;
        story.querySelector('h2').textContent=page.title;story.querySelector('p').textContent=page.text;
        story.querySelector('small').textContent=`첫 번째 밤 · ${storyIndex+1} / ${pages.length}`;
        storyNext.textContent=storyIndex===pages.length-1?'첫 순찰 준비하기':'다음 이야기';storyNext.focus({preventScroll:true});
    }
    storyOpen.onclick=showStory;
    storyNext.onclick=()=>{if(!active||orientationSuspended)return;if(storyIndex===pages.length-1)close(true);else{storyIndex++;showStory();}};
    play.onclick = startVideo;
    skip.onclick = () => close(false);
    pause.onclick = () => {
        if (video.paused) startVideo();
        else { video.pause(); paint(pause,'계속 보기','play'); }
    };
    sound.onclick = () => { if(setSound)setSound(!settings.sound);else settings.sound=!settings.sound;window.DREAM_SOUND_POLICY?.respectDeviceMute();syncSound(); };
    video.onended = () => { if(active && storyIndex<0) close(true); };
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
        if (event.code === 'Escape') { event.preventDefault(); if(required)status.textContent='첫 이야기를 마치면 순찰을 시작할 수 있어요.';else close(false); }
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
    return {canStart,syncSound,setOrientationBlocked(blocked){orientationSuspended=blocked;if(blocked){video.pause();stopTimer();paint(pause,'계속 보기','play');}}, open, maybeShow: () => !canStart() && open(), close, inspect: () => ({active, seen, required, storyIndex, played, paused:video.paused, muted:video.muted, error:root.classList.contains('has-error')})};
};
