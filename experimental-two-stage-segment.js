/* Two independent refinements: background-separated groups, then color regions. */
(function(root){
let raw;if(typeof module==='object'&&module.exports)raw=require('./experimental-color-segment.js');else{if(typeof importScripts==='function')importScripts('experimental-color-segment.js?v=color-3');raw=root.segmentObjects}
function normalizeBlackArtwork(image,options){
 const a=image.data,w=image.width,h=image.height,n=w*h;let visible=0,dark=0,chromatic=0;const stable=new Map();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3]<20)continue;visible++;const v=a[i];if(Math.max(a[i],a[i+1],a[i+2])-Math.min(a[i],a[i+1],a[i+2])>12){chromatic++;continue}if(v<32)dark++;if(v<8||v>253||x<2||y<2||x>=w-2||y>=h-2)continue;let flat=true;for(let dy=-2;dy<=2&&flat;dy++)for(let dx=-2;dx<=2;dx++){const j=((y+dy)*w+x+dx)*4;if(a[j+3]<20||Math.abs(a[j]-v)>1){flat=false;break}}if(flat)stable.set(v,(stable.get(v)||0)+1)}
 // Keep genuine flat gray shapes. Only near-binary artwork without a
 // substantial flat midtone is normalized, so blurred black edges do not
 // become hundreds of independent gray objects.
 if(!visible||chromatic>visible*.005||dark<visible*.005||[...stable.values()].some(n=>n>=Math.max(200,visible*.0005)))return{image,options};
 const data=new Uint8ClampedArray(a);for(let i=0;i<data.length;i+=4){if(options.transparentBackground){data[i]=data[i+1]=data[i+2]=0}else{const value=(a[i]+a[i+1]+a[i+2])/3<223?0:255;data[i]=data[i+1]=data[i+2]=value}}
 return{image:{width:w,height:h,data},options:{...options,colorSensitivity:0,tolerance:55}};
}
function segment(image,options={}){const normalized=normalizeBlackArtwork(image,options);image=normalized.image;options=normalized.options;
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
