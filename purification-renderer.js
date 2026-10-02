'use strict';
(() => {
 const R=window.DreamRenderer.prototype,enemy=R.enemy,P=window.DREAM_PURIFICATION;
 R.enemy=function(e){
  if(!e.dead||!e.purification)return enemy.call(this,e);
  const pose=P.pose(e,this.r.settings.reducedMotion);if(!pose)return;
  const current=window.DREAM_MOTION_ART.creatures[e.variant||e.type],gentle=P.forms[pose.form];
  if(!current||!gentle)return enemy.call(this,e);
  const c=this.ctx,height=current.height,draw=(spec,alpha,frame=0,bow=0)=>{
   if(alpha<=0)return;const box=spec.frames[frame],pivot=spec.pivots[frame],scale=spec.scale*height/spec.height;
   c.save();c.translate(pose.x,pose.y-pose.rise);c.scale(pose.face,1);c.globalAlpha=alpha;
   c.rotate(bow);c.scale(1+bow*.25,1-bow*.7);
   c.drawImage(this.images[spec.key],...box,(box[0]-pivot[0])*scale,(box[1]-pivot[1])*scale,box[2]*scale,box[3]*scale);c.restore();
  };
  c.save();c.globalAlpha=1-pose.release;this.ellipse(pose.x,(e.floorY??pose.y)+3,Math.min(80,height*.3),5,'#49657622');c.restore();
  // A local soft glow, not a screen flash. Reduced motion keeps only the gentle crossfade.
  c.save();c.globalAlpha=pose.halo;this.glow(pose.x,pose.y-height*.55,height*.85,'#fff0b8');c.restore();
  draw(current,pose.dark,current.actionFrames?.hurt??0);
  draw(gentle,pose.gentle,pose.frame,pose.bow);
  if(pose.gentle>.1){
   c.save();c.globalAlpha=pose.gentle;
   if(!this.r.settings.reducedMotion){
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3+pose.elapsed*.5;this.star(pose.x+Math.cos(a)*(height*.48+10),pose.y-height*.55+Math.sin(a)*height*.4-pose.rise,3,'#ffe6a6',a);}
   }
   if(pose.elapsed>.38&&pose.elapsed<2.55){
    const matrix=c.getTransform(),surface=c.canvas.getBoundingClientRect().width/c.canvas.width;
    const font=Math.max(16,11/Math.max(.2,surface*Math.hypot(matrix.a,matrix.b)));
    c.font=`700 ${font}px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`;
    const w=c.measureText(pose.message).width+font,y=pose.y-height-20-pose.rise;
    this.round(pose.x-w/2,y-font*1.3,w,font*1.8,font*.4,'#fff7e9','#acd4c3');
    this.text(pose.message,pose.x,y,font,'#3c6468','center',700);
   }
   c.restore();
  }
 };
})();
