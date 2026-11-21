'use strict';
function visibleAreaSource(){
 const shape=selectionGeometry(),rect={...shape.bounds},scene=off(base.width,base.height),c=scene.getContext('2d');if($('baseVisible').checked)c.drawImage(base,0,0);layers.forEach(l=>drawLayer(c,l));
 const pixels=c.getImageData(0,0,scene.width,scene.height).data,bins=new Map();let transparent=0,total=0;function sample(x,y){total++;const i=(y*scene.width+x)*4;if(pixels[i+3]<20){transparent++;return}const color=Array.from(pixels.slice(i,i+4)),key=color.map(v=>v>>4).join(',');const entry=bins.get(key)||{count:0,color};entry.count++;bins.set(key,entry)}const step=Math.max(1,Math.floor(Math.max(scene.width,scene.height)/300));for(let x=0;x<scene.width;x+=step){sample(x,0);sample(x,scene.height-1)}for(let y=0;y<scene.height;y+=step){sample(0,y);sample(scene.width-1,y)}
 const best=[...bins.values()].sort((a,b)=>b.count-a.count)[0],backgroundColor=transparent>total*.75?[0,0,0,0]:best&&best.count/total>=.75?best.color:undefined;
 return{kind:'scene',image:c.getImageData(rect.x,rect.y,rect.w,rect.h),rect,shape,replaceIds:[],baseReference:base,backgroundColor,transparentBackground:backgroundColor?.[3]===0};
}
function eraseAreaFromLayer(layer,points){
 if(layer.visible===false)return layer;
 const img=copy(layer.img),c=img.getContext('2d'),before=c.getImageData(0,0,img.width,img.height).data,m=layerLinear(layer);
 const local=points.map(p=>{const q=inverseLinearPoint(m,p.x-layer.x,p.y-layer.y);return{x:q.x+img.width/2,y:q.y+img.height/2}});
 c.globalCompositeOperation='destination-out';pathPolygon(c,local);c.fill();const after=c.getImageData(0,0,img.width,img.height).data;let changed=false,remaining=false;for(let i=3;i<after.length;i+=4){if(before[i]!==after[i])changed=true;if(after[i])remaining=true}
 if(!changed)return layer;if(!remaining)return null;
 const rest={...layer,img};delete rest.children;delete rest.text;return rest;
}
function applySceneArea(source,result){
 if(!result.groups.length){toast('В выделенной области объекты не найдены.');return false}
 const remaining=layers.map(l=>eraseAreaFromLayer(l,source.shape.points)).filter(Boolean),{created,cleaned}=makeAutomaticParts(source,result);
 if(remaining.length+created.length>150){toast('Слишком много деталей. Уменьшите чувствительность.');return false}
 checkpoint();const patch=off(source.rect.w,source.rect.h);source.image.data.set(cleaned);patch.getContext('2d').putImageData(source.image,0,0);const c=bc();c.save();pathPolygon(c,source.shape.points);c.clip();c.clearRect(source.rect.x,source.rect.y,source.rect.w,source.rect.h);c.drawImage(patch,source.rect.x,source.rect.y);c.restore();layers=remaining.concat(created);seq+=created.length;active=created.length===1?created[0].id:null;selected=new Set(active===null?[]:[active]);selection=null;pending=null;splitSession=null;setMode('move');ui();$('splitResult').textContent='Объектов: '+created.length;$('status').textContent='В выделенной области создано объектов: '+created.length;toast('Область разделена. Детали снаружи сохранены.');return true;
}
const cutBaseArea=$('cut').onclick;
$('cut').onclick=()=>{
 if(!selection||!layers.length)return cutBaseArea();
 const source=automaticSource(),s=source.rect;if(s.w<1||s.h<1){toast('Контур должен пересекать изображение.');return}
 const patch=off(s.w,s.h);patch.getContext('2d').putImageData(source.image,0,0);const img=off(s.w,s.h),c=img.getContext('2d');c.save();pathPolygon(c,source.shape.points,s.x,s.y);c.clip();c.drawImage(patch,0,0);c.restore();
 const remaining=layers.map(l=>eraseAreaFromLayer(l,source.shape.points)).filter(Boolean);checkpoint();layers=remaining;layers.push({id:++seq,name:'Фрагмент '+seq,img,x:s.x+s.w/2,y:s.y+s.h/2,scale:1,angle:0,opacity:1,visible:true,tint:null});active=seq;selected=new Set([active]);pending={...s,points:source.shape.points};const b=bc();b.save();pathPolygon(b,source.shape.points);b.clip();b.clearRect(s.x,s.y,s.w,s.h);b.restore();selection=null;splitSession=null;setMode('move');ui();toast('Область вырезана. Остальные части сохранены.');
};
