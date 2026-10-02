'use strict';
window.createDreamLoading=function({root,settings}){
 const q=id=>document.getElementById(id),motion=q('loadingMotion'),hint=q('loadingTip'),query=matchMedia('(prefers-reduced-motion: reduce)');
 const tips=['공격 버튼을 꾹 눌렀다가 놓으면 더 큰 꿈빛이 퍼져요.','점프한 뒤 공격하면 아래의 어둑이를 내려찍을 수 있어요.','찾아낸 장비는 가방에서 비교하고 장착할 수 있어요.','길을 잃었다면 화면 위의 다음 목표를 확인해보세요.'];
 let stopped=false,paused=false,failed=false,raf=0,last=0,elapsed=0,drawn=-1,phase=-1,tip=0;
 try{paused=localStorage.getItem('dreamy-nights-lobby-motion-v1')==='off';}catch{}
 const reduced=()=>paused||settings.reducedMotion||query.matches;
 const heroes={};
 function paint(){for(const [id,h]of Object.entries(heroes))if(h.ready){const t=reduced()?0:elapsed;const reaction=id==='ari'?Math.floor(t/7)*7:Math.floor((t+3.5)/7)*7-3.5;DREAM_LOBBY_MOTION.draw(h.canvas,h.image,id,DREAM_LOBBY_MOTION.sampleChoice(t,id,reaction,reduced()));h.host.classList.add('ready');}}
 function refresh(){root.classList.toggle('load-still',reduced()||failed);motion.textContent=reduced()?'움직임 켜기':'움직임 멈추기';motion.disabled=settings.reducedMotion||query.matches;motion.setAttribute('aria-pressed',String(!reduced()));if(motion.disabled)motion.textContent='편안한 연출';paint();}
 for(const id of ['ari','popo']){const host=root.querySelector('.load-'+id),h=heroes[id]={host,canvas:host.querySelector('canvas'),image:new Image(),ready:false};h.image.onload=()=>{h.ready=true;if(!stopped)paint();};h.image.src=DREAM_LOBBY_ART[id].file;}
 function frame(now){if(stopped)return;if(!document.hidden&&!reduced()&&!failed){if(last)elapsed+=Math.min(.1,(now-last)/1000);if(now-drawn>50){paint();drawn=now;}const next=Math.floor(elapsed/6)%tips.length;if(next!==tip){tip=next;hint.textContent=tips[tip];}}last=now;raf=requestAnimationFrame(frame);}
 motion.onclick=()=>{paused=!paused;refresh();};q('loadingRetry').onclick=()=>location.reload();
 query.addEventListener('change',refresh);refresh();raf=requestAnimationFrame(frame);
 return {
  progress(done,total){if(stopped||failed)return;const percent=Math.min(100,Math.floor(done/Math.max(1,total)*100));q('loadBar').style.width=percent+'%';q('loadingPercent').textContent=percent+'%';q('loadProgress').setAttribute('aria-valuenow',percent);q('loadProgress').setAttribute('aria-valuetext',`${total}개 그림 중 ${done}개 준비`);const next=percent<35?0:percent<80?1:2;root.dataset.phase=next;if(next!==phase){phase=next;q('loadingText').textContent=['잠든 항구에 꿈빛을 모으고 있어요.','그림 속 꿈길을 하나씩 이어가고 있어요.','조금만 더! 첫 순찰을 준비하고 있어요.'][next];}},
  fail(count){failed=true;root.classList.add('load-still','load-error');root.setAttribute('aria-busy','false');q('loadingText').textContent=`그림 ${count}개를 불러오지 못했어요. 연결을 확인하고 다시 시도해주세요.`;q('loadingRetry').hidden=false;hint.textContent='다시 준비해도 저장한 모험은 그대로 남아 있어요.';motion.hidden=true;cancelAnimationFrame(raf);},
  finish(){stopped=true;cancelAnimationFrame(raf);query.removeEventListener('change',refresh);root.setAttribute('aria-busy','false');root.classList.add('load-still');}
 };
};
