'use strict';
DREAM_EXPRESSION_FRAMES.madeleineW2={"key": "w2Expression_madeleine", "file": "assets/world2/madeleine-expressions.png", "eyeY": 6, "scale": 0.34576271186440677, "frames": [{"box": [46, 10, 555, 602], "anchor": [323.5, 10]}, {"box": [666, 9, 566, 603], "anchor": [949.0, 9]}, {"box": [22, 627, 590, 615], "anchor": [317.0, 627]}, {"box": [664, 633, 579, 609], "anchor": [953.5, 633]}], "emotions": {"smile": 0, "uneasy": 1, "touched": 2, "joy": 3, "laugh": 3}};
DREAM_ART_V49.files.w2Expression_madeleine="assets/world2/madeleine-expressions.png";
DREAM_ART_V49.files.w2Kitchen='assets/world2/cut-bongsunKitchen-w2.png';
DREAM_ART_V49.files.w2MemoryPromise='assets/world2/memory-promise.png';
DREAM_ART_V49.files.w2EchoEpilogue='assets/world2/cut-echoEpilogue-w2.png';
DREAM_ART_V49.files.w2MemoryPorridge='assets/world2/memory-porridge.png';
(()=>{
 const scenes=DreamExpressions.scenes;
 function cue(key,index,emotion){(scenes[key] ||= {})[index]=[{emotion}];}
 cue('w2-madeleineStow',0,'smile');cue('w2-madeleineStow',2,'uneasy');
 cue('w2-coldPlaza',2,'uneasy');cue('w2-sugarSnowSlope',2,'uneasy');
 cue('w2-halfRecipe',1,'touched');cue('w2-halfRecipe',3,'uneasy');
 cue('w2-yeastCellar',2,'smile');cue('w2-emptyFinal',1,'uneasy');
 cue('w2-porridgeEntry',1,'touched');cue('w2-porridgeEntry',3,'touched');
 cue('w2-underbakedGhost',1,'smile');cue('w2-twoApplications',1,'joy');
 const original=window.createDreamConversation;
 window.createDreamConversation=function(options){
  const conversation=original(options),root=document.getElementById('dialogue');
  const figure=document.createElement('figure');figure.className='w2-memory-scene';figure.hidden=true;
  const picture=document.createElement('img'),caption=document.createElement('figcaption');figure.append(picture,caption);root.prepend(figure);
  const applications=document.createElement('div');applications.className='w2-applications';applications.hidden=true;applications.setAttribute('aria-label','두 사람이 같은 팀 이름으로 작성한 대회 신청서');
  for(const name of ['봉순','마들렌']){const card=document.createElement('section');const title=document.createElement('span'),team=document.createElement('strong'),author=document.createElement('small');title.textContent='대회 신청서 · 팀 이름';team.textContent='우리 강아지들';author.textContent='신청인 '+name;card.append(title,team,author);applications.append(card);}
  figure.append(applications);
  picture.onerror=()=>{figure.hidden=true;root.classList.remove('w2-memory-active');};
  return {...conversation,render(data){
   const memory=data.key==='w2-pretzelMill'&&data.index===0?['w2MemoryPromise','그날, 풍차 아래의 약속']:data.key==='w2-porridgeEntry'&&data.index===0?['w2Kitchen','봉순당 부엌 · 대회보다 소중했던 한 그릇']:data.key==='w2-porridgeEntry'&&data.index<=3?['w2MemoryPorridge','결선 날 · 친구 곁에 남은 이유']:data.key==='w2-twoApplications'&&data.index===4?['w2EchoEpilogue','현실의 봉순당 · 두 장의 신청서, 하나의 약속']:null;
   applications.hidden=!(data.key==='w2-twoApplications'&&data.index===4);
   figure.hidden=!memory;root.classList.toggle('w2-memory-active',!!memory);
   if(memory){const source=options.images[memory[0]]?.src||DREAM_ART_V49.files[memory[0]];if(picture.getAttribute('src')!==source)picture.src=source;picture.alt=memory[1];caption.textContent=memory[1];}
   conversation.render({...data,expressionWho:data.key?.startsWith('w2-')&&data.who==='madeleine'?'madeleineW2':data.expressionWho});
  }};
 };
})();
