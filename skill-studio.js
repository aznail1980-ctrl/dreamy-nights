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
 return {facts,card};
})();
