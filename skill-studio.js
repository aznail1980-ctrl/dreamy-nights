/* Read-only skill cards. Combat remains owned by DREAM_PROGRESS. */
'use strict';
window.DREAM_SKILL_STUDIO = (()=>{
 function facts(s,branch,stage){
  if(stage===2)return branch==='attack'?[['발동','3번째 연속 공격'],['보너스','위력 +1']]:branch==='guard'?[['발동','마음 40% 이하'],['보호','피해 절반 · 25초마다']]:[['발동','대시 후 첫 공격'],['보너스','사거리 +45 · 둔화']];
  const P=window.DREAM_PROGRESS;
  const snapshot={...s,growth:{...s.growth,active:branch,nodes:[...s.growth.nodes.filter(n=>n!==branch+'3'),...(stage===3?[branch+'3']:[])]}};
  const spec=P.skill(snapshot);
  return [[branch==='guard'?'보호 시간':'기본 위력',branch==='guard'?(stage===3?'3.5 → 5초':'3.5초 · 한 번 보호'):stage===3?(branch==='attack'?'7 → 10':'4 → 6'):String(spec.damage)],['재사용',spec.cooldown+'초']];
 }
 function card(s,b,n){return '<dl class="st-facts">'+facts(s,b,n).map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')+'</dl>';}
 let pending=0;
 function mount({canvas,button,preview,branch,reduced}){
  cancelAnimationFrame(pending);let elapsed=0,last=0,painted=-1,playing=true;
  const media=matchMedia('(prefers-reduced-motion:reduce)');
  const pose=branch==='guard'?'charge':branch==='control'?'dash':'attack';
  function draw(){const progress=Math.min(1,(elapsed%2.2)/1.2);preview(canvas,{pose,phase:elapsed*Math.PI*2,progress});canvas.dataset.motionTime=elapsed.toFixed(2);}
  function sync(){const quiet=reduced()||media.matches;button.disabled=quiet;button.textContent=quiet?'움직임 줄이기 사용 중':playing?'동작 멈추기':'동작 재생';button.setAttribute('aria-pressed',String(playing&&!quiet));return playing&&!quiet;}
  button.onclick=()=>{playing=!playing;sync();};draw();sync();
  function tick(now){const modal=canvas.closest('#modal');if(!canvas.isConnected||modal?.classList.contains('hidden')||modal?.dataset.kind!=='growth'){pending=0;return;}const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(!document.hidden&&sync()&&canvas.getBoundingClientRect().width){elapsed+=dt;if(now-painted>=80){draw();painted=now;}}pending=requestAnimationFrame(tick);}
  pending=requestAnimationFrame(tick);
 }
 return {facts,card,mount};
})();
