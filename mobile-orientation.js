'use strict';
window.DREAM_ORIENTATION={
 viewport(coarse){
  const w=window.innerWidth||document.documentElement.clientWidth,h=window.innerHeight||document.documentElement.clientHeight,v=window.visualViewport;
  // iOS may retain portrait visualViewport dimensions/scale during rotation. Never skip fitting.
  const sameDirection=v&&(v.width>v.height)===(w>h);
  const reliable=v&&Math.abs(v.scale-1)<.02&&(!coarse||sameDirection)&&Math.abs(v.width-w)<3;
  return {width:reliable?v.width:w,height:reliable?v.height:h};
 },
 create(onChange){
  const gate=document.getElementById('rotateGate'),shell=document.getElementById('shell'),button=document.getElementById('rotateFullscreen');let blocked=false,previous;
  button.onclick=async()=>{
   try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();try{await screen.orientation?.lock?.('landscape');}catch{}}catch{}
   document.getElementById('rotateStatus').textContent='휴대폰을 가로로 돌리면 모험이 이어져요.';
  };
  return {sync(next){
   if(blocked===next)return;blocked=next;gate.setAttribute('aria-hidden',String(!next));document.documentElement.classList.toggle('needs-landscape',next);
   if(next){previous=document.activeElement;shell.inert=true;shell.setAttribute('aria-hidden','true');gate.focus({preventScroll:true});}
   else{shell.inert=false;shell.removeAttribute('aria-hidden');if(previous?.isConnected&&!previous.closest('.hidden'))previous.focus({preventScroll:true});}
   onChange(next);
  }};
 }
};
