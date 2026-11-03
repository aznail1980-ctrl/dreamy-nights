'use strict';
/* Replay the game's painted frames; the same renderer places body and worn items. */
window.DREAM_KEEPER_MOTION=(()=>{
 let pending=0,playing=true,elapsed=0,currentPose;
 function mount({canvas,button,read,preview,reduced}){
  cancelAnimationFrame(pending);let last=0,painted=-1;const media=matchMedia('(prefers-reduced-motion:reduce)');if(currentPose!==read().pose){elapsed=0;currentPose=read().pose;}
  function draw(){const o=read();preview(canvas,{...o,phase:elapsed*Math.PI*2,progress:Math.min(1,(elapsed%1.8)/1.2)});canvas.dataset.motionTime=elapsed.toFixed(2);}
  function sync(){const quiet=reduced()||media.matches,still=read().pose==='idle';button.disabled=quiet||still;const label=quiet?'움직임 줄이기 사용 중':still?'동작을 골라주세요':playing?'동작 멈추기':'동작 재생';if(button.textContent!==label)button.textContent=label;const pressed=String(playing&&!quiet&&!still);if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed);return !quiet&&!still&&playing;}
  button.onclick=()=>{playing=!playing;sync();};draw();sync();
  function tick(now){
   const modal=canvas.closest('#modal');if(!canvas.isConnected||modal?.classList.contains('hidden')||modal?.dataset.kind!=='characterDetail'){pending=0;return;}
   const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
   if(!document.hidden&&sync()){elapsed+=dt;if(now-painted>=80){draw();painted=now;}}
   pending=requestAnimationFrame(tick);
  }
  pending=requestAnimationFrame(tick);
 }
 return {mount};
})();
