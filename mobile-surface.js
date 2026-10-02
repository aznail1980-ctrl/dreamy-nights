"use strict";
// Keep browser gestures off the game while allowing nested menu scrolling and text fields.
window.DREAM_MOBILE_SURFACE = (() => {
 const probe=document.createElement('div');
 probe.id='safeAreaProbe';probe.setAttribute('aria-hidden','true');
 probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
 document.body.append(probe);
 const coarse=()=>matchMedia('(pointer:coarse)').matches;
 const editable=t=>t instanceof Element && !!t.closest('input,textarea,select,[contenteditable="true"]');
 function insets(){const s=getComputedStyle(probe);return {left:parseFloat(s.paddingLeft)||0,right:parseFloat(s.paddingRight)||0,top:parseFloat(s.paddingTop)||0,bottom:parseFloat(s.paddingBottom)||0};}
 let y=0,tap=null,lastTap=null,handledMenuTap=null;
 const actionTarget=t=>t instanceof Element?t.closest('button,a[href],summary,[role="button"]'):null;
 const pointerControl=t=>t instanceof Element&&!!t.closest('[data-action],[data-hold],#moveStick');
 const clearPressed=()=>tap?.action?.classList.remove('is-touch-pressed');
 const resetTaps=()=>{clearPressed();tap=null;lastTap=null;};
 document.addEventListener('touchstart',e=>{
  y=e.touches[0]?.clientY||0;
  if(!coarse()||editable(e.target)||e.touches.length!==1){resetTaps();return;}
  clearPressed();
  const t=e.touches[0];tap={id:t.identifier,x:t.clientX,y:t.clientY,time:performance.now(),target:e.target,action:actionTarget(e.target)};
  if(tap.action?.closest('#modal[data-kit="true"]:not(.hidden)')&&!tap.action.matches(':disabled'))tap.action.classList.add('is-touch-pressed');
 },{passive:true,capture:true});
 document.addEventListener('touchmove',e=>{
  if(!tap)return;
  const t=[...e.touches].find(t=>t.identifier===tap.id);
  if(e.touches.length!==1||!t||Math.hypot(t.clientX-tap.x,t.clientY-tap.y)>12)resetTaps();
 },{passive:true,capture:true});
 document.addEventListener('touchend',e=>{
  const current=tap;clearPressed();tap=null;
  if(!current||!coarse()||editable(e.target)||e.touches.length){lastTap=null;return;}
  const t=[...e.changedTouches].find(t=>t.identifier===current.id),now=performance.now();
  if(!t||now-current.time>350||Math.hypot(t.clientX-current.x,t.clientY-current.y)>12){lastTap=null;return;}
  const twice=lastTap&&now-lastTap.time<350&&Math.hypot(t.clientX-lastTap.x,t.clientY-lastTap.y)<32;
  lastTap={time:now,x:t.clientX,y:t.clientY};
  const button=current.action;
  const menuAction=button?.closest('#modal[data-kit="true"]:not(.hidden)');
  if((!twice&&!menuAction)||!e.cancelable||e.defaultPrevented)return;
  // Complete a short menu tap immediately on release. Cancelling touchend avoids
  // the delayed compatibility click and double-tap zoom; drags/holds stay native.
  e.preventDefault();
  if(!pointerControl(current.target)&&button?.isConnected&&!button.matches(':disabled,[aria-disabled="true"]')&&
     button.contains(document.elementFromPoint(t.clientX,t.clientY))){
      if(menuAction)handledMenuTap={time:now,x:t.clientX,y:t.clientY};
      button.click();
  }
 },{passive:false,capture:true});
 // Some embedded browsers still emit a compatibility click after cancellation.
 document.addEventListener('click',e=>{
  const h=handledMenuTap,touch=e.pointerType==='touch'||e.sourceCapabilities?.firesTouchEvents;
  if(e.isTrusted&&touch&&h&&performance.now()-h.time<450&&Math.hypot(e.clientX-h.x,e.clientY-h.y)<24){e.preventDefault();e.stopImmediatePropagation();}
 },true);
 document.addEventListener('touchcancel',resetTaps,{passive:true,capture:true});
 window.addEventListener('blur',resetTaps);
 window.addEventListener('orientationchange',resetTaps);
 document.addEventListener('dblclick',e=>{if(coarse()&&!editable(e.target)&&e.cancelable)e.preventDefault();},{passive:false,capture:true});
 document.addEventListener('touchmove',e=>{
  if(!coarse()||editable(e.target))return;
  const next=e.touches[0]?.clientY||0,dy=next-y;y=next;
  // At a scroll boundary consume the gesture instead of passing it to Safari's page.
  if(e.touches.length===1)for(let el=e.target;el instanceof Element&&el!==document.body;el=el.parentElement){
   const style=getComputedStyle(el);
   if(/auto|scroll/.test(style.overflowY)&&el.scrollHeight>el.clientHeight+1&&
      ((dy<0&&el.scrollTop+el.clientHeight<el.scrollHeight-1)||(dy>0&&el.scrollTop>0)))return;
  }
  if(e.cancelable)e.preventDefault();
 },{passive:false});
 for(const type of ['contextmenu','selectstart','dragstart','gesturestart','gesturechange'])document.addEventListener(type,e=>{
  if(coarse()&&!editable(e.target)&&e.cancelable)e.preventDefault();
 },{passive:false});
 return {insets};
})();
