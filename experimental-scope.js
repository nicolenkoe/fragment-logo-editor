'use strict';
let appliedScope=null;
const checkpointBeforeScope=checkpoint;checkpoint=function(...args){checkpointBeforeScope(...args);lastAutomaticTarget=null};
function scopeBounds(source){if(source.kind==='layer'){const l=source.parent;return layerBounds(l)}return{...source.rect}}
function currentScope(){
 if(selection&&mode==='select')return selectionGeometry().bounds;
 if(chosen().length===1&&current()?.visible!==false)return layerBounds(current());
 if(!layers.length)return{x:0,y:0,w:base.width,h:base.height};
 return appliedScope;
}
// Display the count inside the actual canvas region, never as a scene-wide
// total. The original preview already confines pixel analysis to its source.
const drawPartsPreview=drawSplitPreview;
drawSplitPreview=function(c){drawPartsPreview(c);const rect=currentScope();if(!rect)return;const ratio=canvas.width/(canvas.getBoundingClientRect().width||canvas.width),text=$('splitResult').textContent;
 if(!/^Объектов:/.test(text))return;
 const label=text.replace('Объектов: считаем…','Объектов: …');c.save();c.strokeStyle='#009dff';c.lineWidth=1.5*ratio;c.setLineDash([6*ratio,4*ratio]);c.strokeRect(rect.x,rect.y,rect.w,rect.h);c.setLineDash([]);c.font='600 '+Math.round(13*ratio)+'px system-ui';const width=c.measureText(label).width+16*ratio,height=27*ratio,x=Math.max(2*ratio,Math.min(canvas.width-width-2*ratio,rect.x+7*ratio)),y=Math.max(2*ratio,Math.min(canvas.height-height-2*ratio,rect.y+7*ratio));c.fillStyle='#007bdb';c.fillRect(x,y,width,height);c.fillStyle='#fff';c.fillText(label,x+8*ratio,y+18*ratio);c.restore();
};
function selectWholeImage(){appliedScope=null;selection={x:0,y:0,w:base.width,h:base.height,angle:0};setMode('select');ui()}
const applySourceBeforeScope=applySource;
applySource=function(...args){applySourceBeforeScope(...args);selectWholeImage()};
const demoBeforeScope=$('demo').onclick;
$('demo').onclick=async()=>{await demoBeforeScope();selectWholeImage()};
const uploadBeforeScope=$('file').onchange;
$('file').onchange=async function(e){const old=base;await uploadBeforeScope(e);if(base!==old)selectWholeImage()};
const applyPartsBeforeScope=applyAutomaticSource;
applyAutomaticSource=function(source,result){const rect=scopeBounds(source),ok=applyPartsBeforeScope(source,result);if(ok){appliedScope=rect;render()}return ok};
const targetBeforeScope=updateAutomaticTarget;
updateAutomaticTarget=function(){if(selection&&mode==='select'||chosen().length===1)appliedScope=null;targetBeforeScope()};
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
 checkpoint();const patch=off(source.rect.w,source.rect.h);source.image.data.set(cleaned);patch.getContext('2d').putImageData(source.image,0,0);const c=bc();c.save();pathPolygon(c,source.shape.points);c.clip();c.clearRect(source.rect.x,source.rect.y,source.rect.w,source.rect.h);c.drawImage(patch,source.rect.x,source.rect.y);c.restore();layers=remaining.concat(created);seq+=created.length;active=created.length===1?created[0].id:null;selected=new Set(active===null?[]:[active]);selection=null;pending=null;setMode('move');ui();$('splitResult').textContent='Объектов: '+created.length;$('status').textContent='В выделенной области создано объектов: '+created.length;toast('Область разделена. Детали снаружи сохранены.');return true;
}
