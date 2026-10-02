'use strict';
/* Capture the original gentle artwork BEFORE dungeon-art replaces combat sprites.
   These forms represent memories freed from worry, never tamable/hostile actors. */
window.DREAM_PURIFICATION = (() => {
 const forms={...window.DREAM_MOTION_ART.creatures};
 const returns=Object.fromEntries(['bellSentry','undertowWhelk','thornMask','vaneBat','lockBook','sealRaven','valveSentry','siltClaw'].map(id=>[id,id]));
 const thanks={sand:['마음이 보송해졌어!','이제 편히 쉴 수 있어!'],crab:['집게에 힘이 풀렸어!','바다가 다시 예뻐 보여!'],box:['걱정을 내려놓았어!','소중한 걸 떠올렸어!'],boss:['이제 마음이 가벼워!','다시 웃을 수 있겠어!'],shoreSnail:['천천히 돌아갈게!','껍데기 속도 환해졌어!'],windMoth:['다시 날 수 있겠어!','따뜻한 바람이야!'],parcelBat:['이젠 편지를 전할게!','길을 찾았어, 고마워!'],gardenBud:['마음에 꽃이 피었어!','이젠 따뜻하게 자랄게!'],inkMimic:['새 이야기를 써볼게!','잊었던 글이 생각났어!'],waterOtter:['물길이 맑아졌어!','마음껏 헤엄칠래!'],tideBell:['맑은 소리가 돌아왔어!','내 인사가 들리니?'],bellSentry:['기다리던 종소리야!','다정하게 종을 울릴게!'],undertowWhelk:['껍데기 안도 포근해!','걱정 없이 돌아갈게!'],thornMask:['가시 대신 꽃을 피울게!','다시 도전해볼래!'],vaneBat:['바람의 길이 보여!','편안하게 날 수 있어!'],lockBook:['내 이야기를 펼칠게!','실수해도 괜찮구나!'],sealRaven:['이 답장을 전할게!','봉인된 마음이 풀렸어!'],valveSentry:['물길을 다시 열게!','고장 나도 고치면 돼!'],siltClaw:['묵은 걱정이 씻겼어!','맑은 물이 반가워!']};
 const common=['고마워, 꿈 지킴이!','덕분에 마음이 편해!','다음에 또 만나!'];let greetingCount=0,lastGreeting='';
 const duration=2.8,releaseAt=2.3,smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function begin(e){
  const id=e.variant||e.type,form=returns[id]||id;
  const lines=[...(thanks[id]||[]),...common];let message=lines[greetingCount++%lines.length];if(message===lastGreeting)message=lines[greetingCount++%lines.length];lastGreeting=message;
  e.purification={elapsed:0,duration,form:forms[form]?form:e.type,x:e.x,y:e.y,face:e.face||1,message};
  e.fade=duration;e.knockV=0;e.airFall=false;e.fallVy=0;e.windup=0;e.action=null;e.hurt=0;e.stun=0;
  return duration;
 }
 function tick(e,dt){
  if(!e.dead||!(e.fade>0))return;
  if(!e.purification){e.fade=Math.max(0,e.fade-dt);return;}
  const p=e.purification;p.elapsed=Math.min(p.duration,p.elapsed+dt);e.fade=Math.max(0,p.duration-p.elapsed);
 }
 function pose(e,reduced=false){
  const p=e.purification;if(!p||!e.dead||e.fade<=0)return null;
  const t=p.elapsed,release=smooth((t-releaseAt)/(duration-releaseAt)),reveal=smooth((t-.08)/.25);
  const spec=forms[p.form],frame=reduced?0:spec?.purified?[0,1,2,1,2,0][Math.min(5,Math.floor(Math.max(0,t-.3)/.34))]:Math.floor(t*5)%Math.min(2,spec?.frames?.length||1);
  return{form:p.form,frame,message:p.message,x:p.x,y:p.y,face:p.face,dark:1-smooth(t/.27),gentle:reveal*(1-release),halo:Math.sin(Math.PI*Math.min(1,t/.5))*.5+(1-release)*.12,
   rise:reduced?0:release*26+Math.sin(Math.PI*Math.max(0,Math.min(1,(t-1.45)/.45)))*8,bow:reduced?0:Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.45)/.65)))*.055,release,elapsed:t};
 }
 return{forms,returns,thanks,duration,releaseAt,begin,tick,pose};
})();
