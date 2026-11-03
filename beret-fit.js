'use strict';
/* Soft fitted crown, with consistent worn-art and inventory-art sources. */
(()=>{
 DREAM_ART_V49.files.wearBeretV42='assets/wearBeret-fitted.png';
 DREAM_WEAR.assets.wearBeretV42={size:[2172,724],frames:[[125,173,480,378],[843,156,479,390],[1566,155,483,377]]};
 DREAM_WEAR.items.seaBeret.anchor=[[.5,.72],[.5,.72],[.5,.82]];
 DREAM_WEAR.icons.beret='seaBeret';
 DREAM_ATTACHMENTS.beretFit=pose=>{const f=DREAM_ATTACHMENTS.fit(pose),rear=pose.kind==='climb';return {x:f.head[0]+(rear?0:1),y:f.head[1]+(rear?2:4),size:f.scale*(rear?.94:.9),angle:rear?f.angle:f.angle*.5,view:f.view};};
})();
