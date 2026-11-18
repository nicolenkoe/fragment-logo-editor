/* Two independent refinements: background-separated groups, then color regions. */
(function(root){
let raw;if(typeof module==='object'&&module.exports)raw=require('./experimental-color-segment.js');else{if(typeof importScripts==='function')importScripts('experimental-color-segment.js?v=color-2');raw=root.segmentObjects}
function segment(image,options={}){
 const detail=Math.max(0,Math.min(100,options.detail??35)),color=Math.max(0,Math.min(100,options.colorSensitivity||0));
 const spatial=raw(image,{...options,detail,colorSensitivity:0});
 if(!color||!spatial.groups.length)return spatial;
 const fine=raw(image,{...options,detail:100,colorSensitivity:color});
 const owner=new Map();spatial.groups.forEach((g,i)=>g.ids.forEach(id=>owner.set(id,i)));
 const records=new Map(fine.groups.map(g=>[g.ids[0],{...g,ids:[...g.ids],owner:-1,r:0,g:0,b:0,count:0}]));
 // Both segmentations preserve the same foreground mask; every color region
 // belongs to exactly one spatial group. No merging can cross that boundary.
 for(let p=0;p<fine.labels.length;p++){const region=records.get(fine.labels[p]);if(!region)continue;const i=p*4;region.owner=owner.get(spatial.labels[p]);region.r+=image.data[i];region.g+=image.data[i+1];region.b+=image.data[i+2];region.count++}
 const parts=[...records.values()],parent=parts.map((_,i)=>i);
 function find(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i}
 const gap=108-color,radius=Math.max(image.width,image.height)*.65*(1-color/100)**2;
 // At maximum, every disconnected visible color region is independent, even
 // when another region elsewhere has exactly the same RGB value.
 if(color<100)for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
  const a=parts[i],b=parts[j];if(a.owner!==b.owner)continue;
  const distance=Math.hypot(a.r/a.count-b.r/b.count,a.g/a.count-b.g/b.count,a.b/a.count-b.b/b.count);
  const dx=Math.max(0,a.x-b.x-b.w,b.x-a.x-a.w),dy=Math.max(0,a.y-b.y-b.h,b.y-a.y-a.h);
  if(distance<=gap&&Math.hypot(dx,dy)<=radius)parent[find(j)]=find(i);
 }
 const groups=new Map();parts.forEach((p,i)=>{const key=find(i),old=groups.get(key);if(!old){groups.set(key,{ids:p.ids,x:p.x,y:p.y,w:p.w,h:p.h,area:p.area});return}const x=Math.min(old.x,p.x),y=Math.min(old.y,p.y);groups.set(key,{ids:old.ids.concat(p.ids),x,y,w:Math.max(old.x+old.w,p.x+p.w)-x,h:Math.max(old.y+old.h,p.y+p.h)-y,area:old.area+p.area})});
 return{groups:[...groups.values()].sort((a,b)=>a.y-b.y||a.x-b.x),labels:fine.labels,background:fine.background};
}
if(typeof module==='object'&&module.exports)module.exports=segment;else root.segmentObjects=segment;
})(typeof globalThis!=='undefined'?globalThis:this);
