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
 let y=0;
 document.addEventListener('touchstart',e=>{y=e.touches[0]?.clientY||0;},{passive:true});
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
