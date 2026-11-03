'use strict';
// Shared atlas rectangles for inventory and borderless world rewards. Source PNG preserved.
(()=>{
 const key='w2BakeryItems',file='assets/world2/items-bakery-atlas.png';
 const size=[1254, 1254],frames={"w2Flour": [42, 48, 338, 338], "w2Butter": [431, 84, 387, 284], "w2Yeast": [895, 47, 290, 340], "w2Recipe": [35, 436, 350, 378], "w2Entry": [426, 501, 381, 238], "w2Ember": [919, 431, 247, 361], "w2Brioche": [37, 856, 347, 352], "w2Madeleine": [423, 874, 373, 328], "w2Applications": [845, 866, 391, 337]};
 DREAM_ART_V49.files[key]=file;
 const art={key,file,size,frames,icon(id,pixels=34){
  const b=frames[id];if(!b)return null;
  return `<svg class="item-art" width="${pixels}" height="${pixels}" viewBox="${b.join(' ')}" aria-hidden="true"><image href="${file}" width="${size[0]}" height="${size[1]}"/></svg>`;
 }};
 window.DREAM_W2_ITEMS=art;
 const R=DreamRenderer.prototype,previous=R.item;
 R.item=function(id,x,y,w,h=w,angle=0){
  const b=frames[id];if(!b)return previous.call(this,id,x,y,w,h,angle);
  const image=this.images[key];if(!image)return;
  const scale=Math.min(w/b[2],h/b[3]),ctx=this.ctx;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.drawImage(image,...b,-b[2]*scale/2,-b[3]*scale/2,b[2]*scale,b[3]*scale);ctx.restore();
 };
})();
