'use strict';
const viewState={zoom:1,panX:0,panY:0};
const fitWithoutView=fitCanvas;
fitCanvas=function(){canvas.style.transform=`translate(${viewState.panX}px,${viewState.panY}px) scale(${viewState.zoom})`;fitWithoutView();$('resetView').textContent=Math.round(viewState.zoom*100)+'%'};
function resetCanvasView(){viewState.zoom=1;viewState.panX=viewState.panY=0;fitCanvas();render()}
function zoomCanvasAt(zoom,x,y){const next=Math.max(.25,Math.min(6,zoom)),r=canvas.getBoundingClientRect(),factor=next/viewState.zoom;viewState.panX+=(x-r.left-r.width/2)*(1-factor);viewState.panY+=(y-r.top-r.height/2)*(1-factor);viewState.zoom=next;fitCanvas();render()}
function cancelCanvasGesture(){drag=null;if(typeof selectionGesture!=='undefined')selectionGesture=null;if(typeof objectGesture!=='undefined')objectGesture=null;if(typeof rotationDrag!=='undefined')rotationDrag=null}
$('resetView').onclick=resetCanvasView;
$('stage').addEventListener('wheel',e=>{e.preventDefault();const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?$('stage').clientHeight:1);zoomCanvasAt(viewState.zoom*Math.exp(-pixels*.0015),e.clientX,e.clientY)},{passive:false});
let viewSpace=false,viewPan=null,touchZoom=null,touchConsumed=false;
const viewTouches=new Map();
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){viewSpace=true;e.preventDefault()}});
document.addEventListener('keyup',e=>{if(e.code==='Space')viewSpace=false});window.addEventListener('blur',()=>{viewSpace=false;viewPan=null;viewTouches.clear();touchZoom=null;touchConsumed=false});
function touchPair(){const [a,b]=[...viewTouches.values()];return{distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
const viewStage=$('stage');
viewStage.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch'){
  viewTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(viewTouches.size>=2){e.preventDefault();e.stopImmediatePropagation();cancelCanvasGesture();if(typeof cancelContextHold==='function')cancelContextHold();touchConsumed=true;touchZoom={...touchPair(),...viewState};for(const id of viewTouches.keys())viewStage.setPointerCapture(id)}
 }else if(e.button===1||viewSpace&&e.button===0){e.preventDefault();e.stopImmediatePropagation();cancelCanvasGesture();viewPan={pointer:e.pointerId,x:e.clientX,y:e.clientY,panX:viewState.panX,panY:viewState.panY};viewStage.setPointerCapture(e.pointerId)}
},true);
viewStage.addEventListener('pointermove',e=>{
 if(viewTouches.has(e.pointerId))viewTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(touchConsumed){e.preventDefault();e.stopImmediatePropagation();if(touchZoom&&viewTouches.size>=2){const pair=touchPair();Object.assign(viewState,{zoom:touchZoom.zoom,panX:touchZoom.panX,panY:touchZoom.panY});fitCanvas();zoomCanvasAt(touchZoom.zoom*pair.distance/touchZoom.distance,touchZoom.x,touchZoom.y);viewState.panX+=pair.x-touchZoom.x;viewState.panY+=pair.y-touchZoom.y;fitCanvas()}return}
 if(viewPan?.pointer===e.pointerId){e.preventDefault();e.stopImmediatePropagation();viewState.panX=viewPan.panX+e.clientX-viewPan.x;viewState.panY=viewPan.panY+e.clientY-viewPan.y;fitCanvas()}
},true);
function endViewPointer(e){viewTouches.delete(e.pointerId);if(touchConsumed){e.preventDefault();e.stopImmediatePropagation();if(viewTouches.size<2)touchZoom=null;if(!viewTouches.size)touchConsumed=false}if(viewPan?.pointer===e.pointerId){viewPan=null;e.preventDefault();e.stopImmediatePropagation()}}
viewStage.addEventListener('pointerup',endViewPointer,true);viewStage.addEventListener('pointercancel',endViewPointer,true);
resetCanvasView();

// A small local preview covers Chromium's stale surface during Android rotation.
if(globalThis.AndroidViewport?.preview){
 let nativePreviewTimer;
 const renderWithoutNativePreview=render;
 render=function(){renderWithoutNativePreview();clearTimeout(nativePreviewTimer);nativePreviewTimer=setTimeout(()=>{
  try{const factor=Math.min(1,1200/Math.max(canvas.width,canvas.height)),preview=off(Math.max(1,Math.round(canvas.width*factor)),Math.max(1,Math.round(canvas.height*factor)));preview.getContext('2d').drawImage(canvas,0,0,preview.width,preview.height);AndroidViewport.preview(preview.toDataURL('image/png'));}catch{}
 },100)};
 render();
}
