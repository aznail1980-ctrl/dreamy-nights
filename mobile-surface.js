"use strict";
// Keep browser gestures off the game while allowing nested menu scrolling and text fields.
window.DREAM_MOBILE_SURFACE = (() => {
 const probe=document.createElement('div');
 probe.id='safeAreaProbe';probe.setAttribute('aria-hidden','true');
 probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
 document.body.append(probe);
 const coarse=()=>matchMedia('(pointer:coarse)').matches;
 const editable=t=>t instanceof Element && !!t.closest('input,textarea,[contenteditable="true"]');
 function insets(){const s=getComputedStyle(probe);return {left:parseFloat(s.paddingLeft)||0,right:parseFloat(s.paddingRight)||0,top:parseFloat(s.paddingTop)||0,bottom:parseFloat(s.paddingBottom)||0};}
 let y=0,tap=null,lastTap=null;
 const actionTarget=t=>t instanceof Element?t.closest('button,a[href],summary,[role="button"]'):null;
 const pointerControl=t=>t instanceof Element&&!!t.closest('[data-action],[data-hold],#moveStick');
 const resetTaps=()=>{tap=null;lastTap=null;};
 document.addEventListener('touchstart',e=>{
  y=e.touches[0]?.clientY||0;
  if(!coarse()||editable(e.target)||e.touches.length!==1){resetTaps();return;}
  const t=e.touches[0];tap={id:t.identifier,x:t.clientX,y:t.clientY,time:performance.now(),target:e.target,action:actionTarget(e.target)};
 },{passive:true,capture:true});
 document.addEventListener('touchmove',e=>{
  if(!tap)return;
  const t=[...e.touches].find(t=>t.identifier===tap.id);
  if(e.touches.length!==1||!t||Math.hypot(t.clientX-tap.x,t.clientY-tap.y)>12)resetTaps();
 },{passive:true,capture:true});
 document.addEventListener('touchend',e=>{
  const current=tap;tap=null;
  if(!current||!coarse()||editable(e.target)||e.touches.length){lastTap=null;return;}
  const t=[...e.changedTouches].find(t=>t.identifier===current.id),now=performance.now();
  if(!t||now-current.time>350||Math.hypot(t.clientX-current.x,t.clientY-current.y)>12){lastTap=null;return;}
  const twice=lastTap&&now-lastTap.time<350&&Math.hypot(t.clientX-lastTap.x,t.clientY-lastTap.y)<32;
  lastTap={time:now,x:t.clientX,y:t.clientY};
  if(!twice||!e.cancelable||e.defaultPrevented)return;
  // WebKit can still zoom transformed/absolute surfaces. Cancel only a second tap,
  // not a drag, hold, multitouch gesture or editable-field selection.
  e.preventDefault();
  // Cancelling touchend suppresses its compatibility click. Preserve one menu click;
  // combat controls already ran on pointerdown/up and must never be clicked again.
  const button=current.action;
  if(!pointerControl(current.target)&&button?.isConnected&&!button.matches(':disabled,[aria-disabled="true"]')&&
     button.contains(document.elementFromPoint(t.clientX,t.clientY)))button.click();
 },{passive:false,capture:true});
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
