'use strict';
// AudioSession describes playback behavior; it does NOT expose the ringer switch.
// Unsupported mobile browsers therefore start each visit silently, even with an old sound-on save.
window.DREAM_SOUND_POLICY = (() => {
    const mobile=()=>matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    let sessionType='unsupported';
    function respectDeviceMute(){
        try{
            const session=navigator.audioSession;if(!session)return false;
            for(const type of ['ambient','transient']){
                try{session.type=type;if(session.type===type){sessionType=type;return true;}}catch{}
            }
        }catch{}
        sessionType='unsupported';return false;
    }
    function initialize(settings){if(mobile())settings.sound=false;respectDeviceMute();}
    return {mobile,initialize,respectDeviceMute,inspect:()=>({mobile:mobile(),sessionType})};
})();
