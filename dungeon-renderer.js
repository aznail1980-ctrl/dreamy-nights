'use strict';
/* Structural motifs follow collision surfaces; nothing decorative is a hidden obstacle. */
(() => {
 const R=window.DreamRenderer.prototype,baseSurface=R.drawSurface,baseDecorations=R.drawDecorations;
 R.drawSurface=function(p,map){
  if(!map.dungeon)return baseSurface.call(this,p,map);
  const c=this.ctx,left=Math.max(p.x,this.r.camera-90),right=Math.min(p.x+p.w,this.r.camera+1530);
  if(right<=left)return;
  if(p.ground){baseSurface.call(this,p,map);return;}
  c.save();
  if(map.theme==='tide'||map.theme==='garden'){
   baseSurface.call(this,p,map);
   c.beginPath();c.rect(left,p.y,right-left,165);c.clip();
   if(map.theme==='tide'){
    // Reef buttresses and small shell seams instead of another straight soil shelf.
    for(let x=Math.floor(left/220)*220;x<right;x+=220){
     c.strokeStyle='#375c7280';c.lineWidth=4;c.beginPath();c.moveTo(x+18,p.y+13);c.quadraticCurveTo(x+100,p.y+35,x+140,p.y+82);c.stroke();
     c.strokeStyle='#c5e7da88';c.lineWidth=2;c.beginPath();c.moveTo(x+25,p.y+18);c.lineTo(x+59,p.y+22);c.stroke();
    }
   }else{
    for(let x=Math.floor(left/190)*190+50;x<right;x+=190){
     c.strokeStyle='#6b7d6480';c.lineWidth=8;c.beginPath();c.moveTo(x,p.y+30);c.bezierCurveTo(x-10,p.y+72,x+48,p.y+75,x+27,p.y+135);c.stroke();
     c.strokeStyle='#abc79c';c.lineWidth=3;c.stroke();this.ellipse(x+29,p.y+94,8,4,'#829a6b');
    }
   }
  }else{
   const archive=map.theme==='archive';
   const g=c.createLinearGradient(0,p.y,0,p.y+40);g.addColorStop(0,archive?'#b6a081':'#8caead');g.addColorStop(1,archive?'#5c4f55':'#345462');
   this.round(left,p.y,right-left,35,3,g);this.round(left,p.y-3,right-left,7,2,archive?'#e3cb9e':'#b8dcd2');
   c.beginPath();c.rect(left,p.y,right-left,150);c.clip();
   for(let x=Math.floor(left/120)*120;x<right;x+=120){
    if(archive){
     c.strokeStyle='#453b4766';c.lineWidth=2;c.beginPath();c.moveTo(x,p.y+8);c.lineTo(x+115,p.y+8);c.moveTo(x+55,p.y);c.lineTo(x+55,p.y+35);c.stroke();
     if(Math.round(x/120)%3===0){c.strokeStyle='#66545d';c.lineWidth=10;c.beginPath();c.moveTo(x,p.y+32);c.lineTo(x+55,p.y+91);c.lineTo(x+110,p.y+32);c.stroke();}
    }else{
     c.strokeStyle='#213f5066';c.lineWidth=3;for(let n=0;n<4;n++){c.beginPath();c.moveTo(x+n*27,p.y+10);c.lineTo(x+n*27+17,p.y+25);c.stroke();}
     this.ellipse(x+8,p.y+16,3,3,'#f0d4a0');
     c.strokeStyle='#668f91';c.lineWidth=13;c.beginPath();c.moveTo(x,p.y+51);c.lineTo(x+120,p.y+51);c.stroke();c.strokeStyle='#b2c3ac';c.lineWidth=2;c.stroke();
    }
   }
  }
  c.restore();
 };
 R.drawDecorations=function(map){
  baseDecorations.call(this,map);
  const mission=this.C.dungeons?.[this.r.state.map];if(!mission)return;
  for(const[x,y,title,tip]of mission.signs){
   if(x<this.r.camera-350||x>this.r.camera+1650)continue;
   const c=this.ctx;c.save();
   // In-world route inscriptions: small, off the walking line, no modal or extra control.
   this.round(x-165,y-214,330,61,13,'#203a4cdd');
   this.text(title,x,y-191,15,'#ffe2ac','center',700);
   this.text(tip,x,y-171,11,'#d7e8e3','center',500);
   c.restore();
  }
 };
})();
