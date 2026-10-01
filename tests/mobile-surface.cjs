const {chromium}=require('playwright'),assert=require('assert/strict');
const url=process.env.GAME_URL||'http://127.0.0.1:8769/';
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN});try{
 const p=await b.newPage({viewport:{width:852,height:393},isMobile:true,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('dreamy-nights-opening-v1','seen');localStorage.setItem('dreamy-nights-settings-v1',JSON.stringify({sound:false,voice:false}));});await p.goto(url);await p.waitForFunction(()=>window.DreamGame?.inspect().mode==='title');await p.click('#startButton');await p.click('#confirmHero');await p.click('#dialogueSkip');
 const c=await p.context().newCDPSession(p),touch=(type,points)=>c.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 const metrics=()=>p.evaluate(()=>{const b=document.getElementById('shell').getBoundingClientRect();return {x:scrollX,y:scrollY,scale:visualViewport.scale,left:b.x,top:b.y,w:b.width,h:b.height,transform:document.getElementById('stage').style.transform}});
 const before=await metrics();assert.equal(before.w,852);assert.equal(before.h,393);
 for(const [x,y,dx,dy] of [[1,380,120,-100],[851,380,-120,-100],[400,392,0,-130],[2,2,120,100]]){
  await touch('touchStart',[{x,y,id:1}]);for(let n=1;n<=8;n++)await touch('touchMove',[{x:x+dx*n/8,y:y+dy*n/8,id:1}]);await touch('touchEnd',[]);
 }
 const label=await p.locator('#dreamlightCount').count()?p.locator('#dreamlightCount'):p.locator('.energy-counter');const r=await label.boundingBox();
 await touch('touchStart',[{x:r.x+8,y:r.y+r.height/2,id:1}]);await p.waitForTimeout(900);await touch('touchEnd',[]);
 assert.equal(await p.evaluate(()=>getSelection().toString()),'');
 for(let n=0;n<2;n++){await touch('touchStart',[{x:430,y:380,id:1}]);await touch('touchEnd',[]);await p.waitForTimeout(50);}
 await touch('touchStart',[{x:390,y:210,id:1},{x:460,y:210,id:2}]);for(let n=1;n<=6;n++)await touch('touchMove',[{x:390-n*15,y:210,id:1},{x:460+n*15,y:210,id:2}]);await touch('touchEnd',[]);await p.waitForTimeout(200);
 assert.deepEqual(await metrics(),before,'edge swipes/long press/double tap/pinch must not change fit');
 const blocked=await p.locator('.energy-counter').evaluate(e=>({select:getComputedStyle(e).webkitUserSelect,context:!e.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true})),selection:!e.dispatchEvent(new Event('selectstart',{bubbles:true,cancelable:true}))}));assert.equal(blocked.select,'none');assert(blocked.context&&blocked.selection);
 await p.click('#pauseButton');
 const scroller=await p.evaluate(()=>[...document.querySelectorAll('#modal *')].find(e=>{const s=getComputedStyle(e);return e.getClientRects().length&&/auto|scroll/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+40})?.tagName);assert(scroller,'settings must have a reachable scroll container');
 await p.evaluate(()=>{window.__scroll=[...document.querySelectorAll('#modal *')].find(e=>{const s=getComputedStyle(e);return e.getClientRects().length&&/auto|scroll/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+40});});
 const box=await p.evaluate(()=>{const r=__scroll.getBoundingClientRect();return{x:r.right-12,y:Math.min(innerHeight-35,r.bottom-30)}});
 await touch('touchStart',[{...box,id:1}]);for(let n=1;n<=10;n++){await touch('touchMove',[{x:box.x,y:box.y-n*12,id:1}]);await p.waitForTimeout(20);}await touch('touchEnd',[]);await p.waitForTimeout(200);assert(await p.evaluate(()=>__scroll.scrollTop>10),'menu touch scrolling remains enabled');assert.equal((await metrics()).y,0);
 // Editable fields remain selectable (pet names etc.), without enabling selection of the HUD.
 const edit=await p.evaluate(()=>{const e=document.createElement('input');document.getElementById('modalContent').append(e);const allowed=e.dispatchEvent(new Event('selectstart',{bubbles:true,cancelable:true}));const style=getComputedStyle(e).webkitUserSelect;e.remove();return {allowed,style};});assert(edit.allowed&&edit.style==='text');assert.deepEqual(errors,[]);
 console.log('PASS full viewport; four edge swipes; long press/copy blocked; double tap/pinch stable; real menu touch-scroll; editable fields preserved');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
