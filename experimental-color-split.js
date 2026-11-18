'use strict';
let lastAutomaticTarget=null;
function hasTransparentBackground(image){for(let p=3;p<image.data.length;p+=4)if(image.data[p]<20)return true;return false}
function automaticSource(){
 const scope=selection&&mode==='select'?'base':layers.length?'layer':'base';
 if(scope==='layer'){
  const currentLayer=current();if(!currentLayer||currentLayer.visible===false||chosen().length!==1)throw Error('Выберите один объект на холсте или в списке слоёв.');
  const parent={...currentLayer},image=parent.img.getContext('2d',{willReadFrequently:true}).getImageData(0,0,parent.img.width,parent.img.height);
  return{kind:'layer',parent,image,rect:{x:0,y:0,w:image.width,h:image.height},replaceIds:[parent.id],transparentBackground:hasTransparentBackground(image),baseReference:base};
 }
 const cached=!selection&&splitSession?.kind==='base'?splitSession:null,shape=selection&&typeof selectionGeometry==='function'?selectionGeometry():cached?.shape,rect=shape?{...shape.bounds}:selection?{...selection}:cached?{...cached.rect}:{x:0,y:0,w:base.width,h:base.height};
 const image=bc().getImageData(rect.x,rect.y,rect.w,rect.h);if(cached)image.data.set(cached.pixels);
 return{kind:'base',image,rect,shape,previousSession:cached,replaceIds:cached?cached.ids:[],baseReference:base};
}
function automaticOptions(source){return{tolerance:+$('backgroundTolerance').value||55,detail:Math.min(+$('splitTolerance').value,+$('colorSensitivity').value),colorSensitivity:+$('colorSensitivity').value,transparentBackground:source.transparentBackground===true}}
function automaticInput(source){return typeof maskForSegmentation==='function'?maskForSegmentation(source.image,source.rect,source.shape):source.image}
function makeAutomaticParts(source,result){const ids=new Map();result.groups.forEach((g,i)=>g.ids.forEach(id=>ids.set(id,i)));const images=result.groups.map(g=>{const canvas=off(g.w,g.h);return{canvas,pixels:canvas.getContext('2d').createImageData(g.w,g.h)}}),cleaned=new Uint8ClampedArray(source.image.data);
 for(let p=0;p<result.labels.length;p++){const gi=ids.get(result.labels[p]);if(gi===undefined)continue;const g=result.groups[gi],x=p%source.rect.w,y=Math.floor(p/source.rect.w),di=((y-g.y)*g.w+x-g.x)*4;for(let k=0;k<4;k++){images[gi].pixels.data[di+k]=source.image.data[p*4+k];cleaned[p*4+k]=result.background[k]}}
 const created=result.groups.map((g,i)=>{images[i].canvas.getContext('2d').putImageData(images[i].pixels,0,0);const layer={id:seq+i+1,name:source.kind==='layer'?source.parent.name+' · часть '+(i+1):'Объект '+(seq+i+1),img:images[i].canvas,x:source.rect.x+g.x+g.w/2,y:source.rect.y+g.y+g.h/2,scale:1,angle:0,opacity:1,visible:true,tint:null};if(source.kind==='layer'){const parent=source.parent,x=g.x+g.w/2-parent.img.width/2,y=g.y+g.h/2-parent.img.height/2,p=linearPoint(layerLinear(parent),x,y);Object.assign(layer,{x:parent.x+p.x,y:parent.y+p.y,scale:parent.scale,stretchX:parent.stretchX??1,stretchY:parent.stretchY??1,skew:parent.skew??0,angle:parent.angle,opacity:parent.opacity,visible:parent.visible,tint:parent.tint})}return layer});return{created,cleaned};
}
function applyAutomaticSource(source,result){if(!result.groups.length){toast('Отдельные объекты не найдены. Измените настройки.');return false}if(source.kind==='layer'&&result.groups.length===1){toast('Найден один связный объект. Увеличьте чувствительность; если просветов нет, используйте лассо.');return false}if(layers.length-source.replaceIds.length+result.groups.length>150){toast('Слишком много деталей. Уменьшите чувствительность или выберите другую область.');return false}
 const {created,cleaned}=makeAutomaticParts(source,result),originalPixels=new Uint8ClampedArray(source.image.data),replaced=new Set(source.replaceIds),anchor=source.replaceIds.length?Math.min(...source.replaceIds.map(id=>layers.findIndex(l=>l.id===id)).filter(i=>i>=0)):layers.length;
 checkpoint(true);if(source.kind==='base'){source.image.data.set(cleaned);bc().putImageData(source.image,source.rect.x,source.rect.y);layers=layers.filter(l=>!replaced.has(l.id));layers.push(...created);pending=null}else{layers=layers.filter(l=>!replaced.has(l.id));layers.splice(Math.min(anchor,layers.length),0,...created)}seq+=created.length;active=null;selected.clear();selection=null;splitSession={kind:source.kind,rect:{...source.rect},shape:source.shape,parent:source.parent,pixels:originalPixels,ids:created.map(l=>l.id)};setMode('move');ui();$('splitResult').textContent='Создано объектов: '+created.length;$('status').textContent=source.kind==='layer'?'Выбранный объект разделён на '+created.length+' частей. Остальные слои сохранены.':'Создано объектов: '+created.length;toast(source.kind==='layer'?'Объект разделён. Остальные слои не изменены.':'Объекты разделены. Фон заполнен.');return true;
}
let automaticBusy=false;
$('split').onclick=()=>{let source;try{source=automaticSource()}catch(e){toast(e.message);return}if(source.rect.w<3||source.rect.h<3){toast('Область слишком маленькая');return}const options=automaticOptions(source),button=$('split');automaticBusy=true;button.disabled=true;button.textContent='Определяем объекты…';setTimeout(()=>{try{if(base!==source.baseReference||(source.previousSession&&splitSession!==source.previousSession))return;if(source.kind==='layer'&&!source.previousSession&&!layers.some(l=>l.id===source.parent.id))return;const result=segmentObjects(automaticInput(source),options);applyAutomaticSource(source,result)}catch(e){toast(e.message||'Не удалось разделить объекты')}finally{automaticBusy=false;button.textContent='Автоматически разделить объекты';updateAutomaticTarget()}},30)};
$('splitTolerance').oninput=()=>{$('splitToleranceValue').textContent=$('splitTolerance').value;if(typeof scheduleSplitPreview==='function')scheduleSplitPreview()};
$('backgroundTolerance').oninput=()=>{$('backgroundToleranceValue').textContent=$('backgroundTolerance').value;if(typeof scheduleSplitPreview==='function')scheduleSplitPreview()};
function updateAutomaticTarget(){
 const one=chosen().length===1&&current()?.visible!==false,baseArea=!!selection&&mode==='select',available=baseArea||!layers.length||one;
 $('split').disabled=automaticBusy||!available;
 $('split').dataset.tooltip=!available?'Выберите один объект на холсте или в списке слоёв для дальнейшего разделения.':baseArea?'Разделить выделенную область исходного фото.':layers.length?'Разделить выбранный объект; остальные объекты останутся на месте.':'Разделить загруженное изображение на объекты и сразу заполнить фон.';
 const key=baseArea?'area:'+JSON.stringify(selection):!layers.length?'base':one?'layer:'+current().id:'none';
 if(lastAutomaticTarget===key)return;lastAutomaticTarget=key;
 if(typeof clearSplitPreview==='function')clearSplitPreview();
 if(!automaticBusy&&available&&typeof scheduleSplitPreview==='function')queueMicrotask(()=>{if(lastAutomaticTarget===key&&!automaticBusy)scheduleSplitPreview()});
}
