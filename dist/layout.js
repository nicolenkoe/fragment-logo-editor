'use strict';
let layerPageIndex=0,layoutFrame=0;
function switchTabs(ids,selected){for(const id of ids){const tab=$(id+'Tab'),panel=$(id+'Panel');tab.setAttribute('aria-selected',String(id===selected));panel.hidden=id!==selected}scheduleLayout()}
for(const [ids] of [[['edit','text','project']],[['layers','properties']],[['geometry','color','actions']]])for(const id of ids)$(id+'Tab').onclick=()=>switchTabs(ids,id);
function drawer(name){const next=document.body.dataset.drawer===name?'':name;document.body.dataset.drawer=next;$('toggleTools').setAttribute('aria-expanded',String(next==='tools'));$('toggleInspector').setAttribute('aria-expanded',String(next==='inspector'));scheduleLayout()}
$('toggleTools').onclick=()=>drawer('tools');$('toggleInspector').onclick=()=>drawer('inspector');
$('stage').addEventListener('pointerdown',()=>{if(document.body.dataset.drawer)drawer(document.body.dataset.drawer)});
$('prevLayers').onclick=()=>{layerPageIndex--;refreshLayout()};$('nextLayers').onclick=()=>{layerPageIndex++;refreshLayout()};
const fitPanels=[];
for(const id of ['editPanel','textPanel','projectPanel','geometryPanel','colorPanel','actionsPanel']){
 const panel=$(id);panel.dataset.fitPanel='';
 // Keep a field's label with its control when a short window needs pages.
 for(const label of [...panel.children].filter(e=>e.tagName==='LABEL')){const next=label.nextElementSibling;if(next){const field=document.createElement('div');field.className='field';panel.insertBefore(field,label);field.append(label,next)}}
 const content=document.createElement('div');content.className='fit-items';while(panel.firstChild)content.append(panel.firstChild);panel.append(content);
 const pager=document.createElement('div');pager.className='pagination fit-pagination';pager.hidden=true;
 const prev=document.createElement('button'),next=document.createElement('button'),text=document.createElement('span');prev.textContent='←';next.textContent='→';prev.setAttribute('aria-label','Предыдущие настройки');next.setAttribute('aria-label','Следующие настройки');pager.append(prev,text,next);panel.append(pager);
 const state={panel,content,pager,prev,next,text,index:0};fitPanels.push(state);prev.onclick=()=>{state.index--;refreshLayout()};next.onclick=()=>{state.index++;refreshLayout()};
}
function pageControls(state){const {panel,content,pager,prev,next,text}=state;if(!panel.getClientRects().length)return;
 const items=[...content.children];items.forEach(e=>e.hidden=false);pager.hidden=true;
 const heights=items.map(e=>{const style=getComputedStyle(e);return style.display==='none'?0:e.getBoundingClientRect().height+parseFloat(style.marginTop||0)+parseFloat(style.marginBottom||0)});
 const total=heights.reduce((a,b)=>a+b,0),full=panel.clientHeight;let pages=[[]];
 if(total>full+1){pager.hidden=false;const available=Math.max(1,content.clientHeight);let used=0;
 items.forEach((item,i)=>{if(used+heights[i]>available+1&&pages[pages.length-1].length){pages.push([]);used=0}pages[pages.length-1].push(item);used+=heights[i]})
 }else pages=[items];
 state.index=Math.max(0,Math.min(state.index,pages.length-1));items.forEach(e=>e.hidden=!pages[state.index].includes(e));pager.hidden=pages.length===1;text.textContent=(state.index+1)+' / '+pages.length;prev.disabled=state.index===0;next.disabled=state.index===pages.length-1;
}
function fitCanvas(){const stage=$('stage'),style=getComputedStyle(stage);const width=Math.max(1,stage.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)),height=Math.max(1,stage.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom));const fit=Math.min(width/canvas.width,height/canvas.height);canvas.style.width=(canvas.width*fit)+'px';canvas.style.height=(canvas.height*fit)+'px';positionRotationHandle();if(typeof refreshSelectionHandles==='function')refreshSelectionHandles()}
function positionRotationHandle(){const handle=$('rotateHandle'),l=current();if(!l||l.visible===false||mode!=='move'||(typeof chosen==='function'&&chosen().length>1)){handle.hidden=true;return}
 const cr=canvas.getBoundingClientRect(),sr=$('stage').getBoundingClientRect(),ratio=cr.width/canvas.width,angle=l.angle*Math.PI/180,distance=l.img.height*l.scale/2+30/ratio;
 const x=cr.left-sr.left+(l.x+Math.sin(angle)*distance)*ratio,y=cr.top-sr.top+(l.y-Math.cos(angle)*distance)*ratio;
 handle.hidden=false;handle.style.left=(Math.min(Math.max(19,x),sr.width-19)-17)+'px';handle.style.top=(Math.min(Math.max(19,y),sr.height-19)-17)+'px';
}
function refreshLayout(){for(const panel of fitPanels)pageControls(panel);
 if($('layersPanel').getClientRects().length){const rows=[...$('layers').children],height=$('layers').clientHeight,rowHeight=window.innerHeight<=560?35:41,pageSize=Math.max(1,Math.floor(height/rowHeight)),pages=Math.max(1,Math.ceil(rows.length/pageSize));layerPageIndex=Math.max(0,Math.min(layerPageIndex,pages-1));rows.forEach((row,i)=>row.hidden=Math.floor(i/pageSize)!==layerPageIndex);$('layerPage').textContent=(layerPageIndex+1)+' / '+pages;$('prevLayers').disabled=layerPageIndex===0;$('nextLayers').disabled=layerPageIndex===pages-1;}
 fitCanvas();
}
function scheduleLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(refreshLayout)}
let rotationDrag=null;
const wrapDegrees=angle=>((angle+180)%360+360)%360-180;
$('rotateHandle').onpointerdown=e=>{const l=current();if(!l)return;e.preventDefault();e.stopPropagation();checkpoint();const p=point(e);rotationDrag={id:l.id,previous:Math.atan2(p.y-l.y,p.x-l.x),total:0,original:l.angle,pointer:e.pointerId};$('rotateHandle').setPointerCapture(e.pointerId)};
$('rotateHandle').onpointermove=e=>{if(!rotationDrag||e.pointerId!==rotationDrag.pointer)return;const l=layers.find(l=>l.id===rotationDrag.id);if(!l)return;const p=point(e),angle=Math.atan2(p.y-l.y,p.x-l.x);let delta=angle-rotationDrag.previous;if(delta>Math.PI)delta-=2*Math.PI;if(delta<-Math.PI)delta+=2*Math.PI;rotationDrag.total+=delta;rotationDrag.previous=angle;let degrees=rotationDrag.original+rotationDrag.total*180/Math.PI;if(e.shiftKey)degrees=Math.round(degrees/15)*15;l.angle=wrapDegrees(degrees);$('angle').value=l.angle;$('angleValue').textContent=Math.round(l.angle)+'°';render()};
function endRotation(e){if(!rotationDrag)return;if(e.pointerId===rotationDrag.pointer)rotationDrag=null}
$('rotateHandle').onpointerup=endRotation;$('rotateHandle').onpointercancel=endRotation;$('rotateHandle').onlostpointercapture=()=>{rotationDrag=null};
$('rotateHandle').onkeydown=e=>{const l=current();if(!l||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();checkpoint();l.angle=wrapDegrees(l.angle+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?15:1));$('angle').value=l.angle;$('angleValue').textContent=Math.round(l.angle)+'°';render()};
// A review hook: check actual content bounds instead of only hiding scrollbars.
window.checkEditorLayout=function(){const root=document.documentElement,issues=[];
 if(root.scrollWidth>root.clientWidth+1||root.scrollHeight>root.clientHeight+1)issues.push('Страница выходит за размер окна');
 for(const el of [document.body,$('stage'),...document.querySelectorAll('.fit-items,#layers')]){if(!el.getClientRects().length)continue;if(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1)issues.push(el.id||el.className||el.tagName)}
 const r=canvas.getBoundingClientRect(),s=$('stage').getBoundingClientRect();if(r.left<s.left-1||r.top<s.top-1||r.right>s.right+1||r.bottom>s.bottom+1)issues.push('Холст выходит за рабочую область');
 return{ok:issues.length===0,viewport:[window.innerWidth,window.innerHeight],issues};
};
const layoutObserver=new ResizeObserver(scheduleLayout);for(const el of [$('stage'),document.body,...fitPanels.map(s=>s.panel),$('layers')])layoutObserver.observe(el);
$('splitSettings').addEventListener('toggle',scheduleLayout);window.addEventListener('resize',scheduleLayout);document.fonts?.ready.then(scheduleLayout);refreshLayout();
