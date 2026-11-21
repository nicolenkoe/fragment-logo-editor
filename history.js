'use strict';
(function(){
let redoHistory=[];
function snapshot(){return{base:copy(base),layers:layers.map(cloneLayer),active,selected:[...selected],pending:pending?{...pending}:null,filename:$('filename').textContent,visible:$('baseVisible').checked,sourceBytes:window.FragmentExport?.sourceBytes()}}
function sync(){const button=$('redo');if(button)button.disabled=!redoHistory.length}
const beforeCheckpoint=checkpoint;checkpoint=function(...args){redoHistory=[];beforeCheckpoint(...args);const state=history[history.length-1];if(state){state.filename=$('filename').textContent;state.visible=$('baseVisible').checked;state.sourceBytes=window.FragmentExport?.sourceBytes()}sync()};
const beforeRender=render;render=function(...args){beforeRender(...args);sync()};
function metadata(s){if(s.filename!==undefined)$('filename').textContent=s.filename;if(s.visible!==undefined)$('baseVisible').checked=s.visible;if(s.sourceBytes!==undefined)window.FragmentExport?.setSourceBytes(s.sourceBytes)}
const undo=$('undo').onclick;$('undo').onclick=()=>{if(!history.length)return;const state=history[history.length-1];redoHistory.push(snapshot());if(redoHistory.length>12)redoHistory.shift();undo();metadata(state);render();sync()};
$('redo').onclick=()=>{if(!redoHistory.length)return;history.push(snapshot());if(history.length>12)history.shift();const state=redoHistory.pop();base=state.base;layers=state.layers;active=state.active;selected=new Set(state.selected||[]);pending=state.pending;selection=null;splitSession=null;metadata(state);if(typeof clearSplitPreview==='function')clearSplitPreview();ui();sync()};
const keyboard=document.onkeydown;document.onkeydown=e=>{if(!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&(e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();$(e.key.toLowerCase()==='y'||e.shiftKey?'redo':'undo').click();return}keyboard?.(e)};sync();
})();
