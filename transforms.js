'use strict';
function layerLinear(l){const angle=l.angle*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),x=l.scale*(l.stretchX??1),y=l.scale*(l.stretchY??1),k=l.skew??0;return{a:c*x,b:s*x,c:(c*k-s)*y,d:(s*k+c)*y}}
function linearPoint(m,x,y){return{x:m.a*x+m.c*y,y:m.b*x+m.d*y}}
function inverseLinearPoint(m,x,y){const det=m.a*m.d-m.b*m.c;return{x:(m.d*x-m.c*y)/det,y:(-m.b*x+m.a*y)/det}}
function nestedTransform(child,parent){const a=layerLinear(parent),b=layerLinear(child),m={a:a.a*b.a+a.c*b.b,b:a.b*b.a+a.d*b.b,c:a.a*b.c+a.c*b.d,d:a.b*b.c+a.d*b.d},sx=Math.hypot(m.a,m.b),sy=(m.a*m.d-m.b*m.c)/sx,scale=parent.scale*child.scale,p=linearPoint(a,child.x,child.y);return{x:parent.x+p.x,y:parent.y+p.y,scale,angle:Math.atan2(m.b,m.a)*180/Math.PI,stretchX:sx/scale,stretchY:sy/scale,skew:(m.a*m.c+m.b*m.d)/(sx*sy)}}
function drawLayerFrame(c,l,ratio){const m=layerLinear(l),w=l.img.width/2,h=l.img.height/2,points=[[-w,-h],[w,-h],[w,h],[-w,h]].map(p=>linearPoint(m,...p));c.save();c.beginPath();points.forEach((p,i)=>i?c.lineTo(l.x+p.x,l.y+p.y):c.moveTo(l.x+p.x,l.y+p.y));c.closePath();c.strokeStyle='white';c.lineWidth=3.5*ratio;c.stroke();c.strokeStyle='#009dff';c.lineWidth=1.5*ratio;c.setLineDash([6*ratio,4*ratio]);c.stroke();c.restore()}

// A transient affine frame for a multi-selection; real groups use their own layer.
let multiTransformFrame=null;
function transformSignature(objects){return JSON.stringify(objects.map(l=>[l.id,l.x,l.y,l.scale,l.angle,l.stretchX??1,l.stretchY??1,l.skew??0,l.visible,l.img.width,l.img.height]))}
function selectionTransformTarget(){
 const objects=chosen().filter(l=>l.visible!==false);
 if(objects.length!==chosen().length||!objects.length){multiTransformFrame=null;return null}
 if(objects.length===1){multiTransformFrame=null;return objects[0]}
 const signature=transformSignature(objects);
 if(multiTransformFrame?.signature===signature)return multiTransformFrame;
 const bounds=objects.map(layerBounds),x=Math.min(...bounds.map(b=>b.x)),y=Math.min(...bounds.map(b=>b.y)),right=Math.max(...bounds.map(b=>b.x+b.w)),bottom=Math.max(...bounds.map(b=>b.y+b.h)),cx=(x+right)/2,cy=(y+bottom)/2;
 multiTransformFrame={id:'selection-frame',x:cx,y:cy,scale:1,angle:0,img:{width:Math.max(1,right-x),height:Math.max(1,bottom-y)},signature,members:objects.map(l=>({...l,x:l.x-cx,y:l.y-cy}))};
 return multiTransformFrame;
}
function applySelectionTransform(target){
 if(!target?.members)return;
 for(const child of target.members){const layer=layers.find(l=>l.id===child.id);if(layer)Object.assign(layer,nestedTransform(child,target))}
 target.signature=transformSignature(chosen());
}
function findTransformTarget(id){const target=selectionTransformTarget();return target?.id===id?target:null}
