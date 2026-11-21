/* Connected-component extraction for logos on a uniform or transparent background. */
(function(root){
function segmentObjects(image,options={}){
 const {width:w,height:h,data:a}=image,n=w*h,tolerance=options.tolerance??55,sensitivity=Math.max(0,Math.min(100,options.detail??35));
 if(n>12000000)throw Error('Изображение слишком большое. Загрузите фото до 2400 px.');
 const bins=new Map();let borderCount=0,transparentCount=0;
 function border(p){borderCount++;const i=p*4;if(a[i+3]<20){transparentCount++;return}const key=(a[i]>>4)*256+(a[i+1]>>4)*16+(a[i+2]>>4);let b=bins.get(key);if(!b)bins.set(key,b=[0,0,0,0]);b[0]++;for(let k=0;k<3;k++)b[k+1]+=a[i+k]}
 const step=Math.max(1,Math.floor(Math.max(w,h)/600));for(let x=0;x<w;x+=step){border(x);if(h>1)border((h-1)*w+x)}for(let y=1;y<h-1;y+=step){border(y*w);if(w>1)border(y*w+w-1)}
 const known=Array.isArray(options.backgroundColor)&&options.backgroundColor.length===4&&options.backgroundColor.every(v=>Number.isFinite(v)&&v>=0&&v<=255)?options.backgroundColor:null;const transparent=known?known[3]<20:options.transparentBackground===true||transparentCount>borderCount*.75;let bg=[255,255,255,255];
 if(known){bg=[...known]}else if(!transparent){const b=[...bins.values()].sort((x,y)=>y[0]-x[0])[0];if(!b)return{groups:[],labels:new Int32Array(n),background:[0,0,0,0]};bg=[b[1]/b[0],b[2]/b[0],b[3]/b[0],255];let consistent=0;function check(p){let i=p*4;if(a[i+3]<20||Math.hypot(a[i]-bg[0],a[i+1]-bg[1],a[i+2]-bg[2])<tolerance)consistent++}for(let x=0;x<w;x+=step){check(x);if(h>1)check((h-1)*w+x)}for(let y=1;y<h-1;y+=step){check(y*w);if(w>1)check(y*w+w-1)}if(consistent/borderCount<.75)throw Error('Не удалось определить однотонный фон. Выделите область вручную или измените чувствительность.');
 }else bg=[0,0,0,0];
 const mask=new Uint8Array(n),labels=new Int32Array(n);let foreground=0;
 for(let p=0;p<n;p++){let i=p*4;if(a[i+3]>20&&(transparent||Math.hypot(a[i]-bg[0],a[i+1]-bg[1],a[i+2]-bg[2])>tolerance)){mask[p]=1;foreground++}}
 if(foreground>n*.75)throw Error('Фон и объекты слишком похожи. Измените чувствительность или выделите область вручную.');
 const queue=new Int32Array(n),parts=[];let id=0;
 for(let p=0;p<n;p++){if(!mask[p]||labels[p])continue;id++;let head=0,tail=1;queue[0]=p;labels[p]=id;let x0=w,y0=h,x1=0,y1=0;
 while(head<tail){let q=queue[head++],x=q%w,y=Math.floor(q/w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);for(let dy=-1;dy<=1;dy++){let yy=y+dy;if(yy<0||yy>=h)continue;for(let dx=-1;dx<=1;dx++){let xx=x+dx;if(xx<0||xx>=w)continue;let next=yy*w+xx;if(mask[next]&&!labels[next]){labels[next]=id;queue[tail++]=next}}}}
 parts.push({ids:[id],x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,area:tail});
 if(parts.length>5000)throw Error('Слишком много мелких деталей. Увеличьте допуск цвета фона или выделите область.');
 }
 const original=parts.map(p=>({...p,ids:[...p.ids]})),edges=[];
 if(sensitivity===100)return{groups:original.sort((a,b)=>a.y-b.y||a.x-b.x),labels,background:bg};
 function bind(a,b,releaseAt){edges.push({a:a.ids[0]-1,b:b.ids[0]-1,releaseAt})}
 function union(a,b){let x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);return{ids:a.ids.concat(b.ids),x,y,w:Math.max(a.x+a.w,b.x+b.w)-x,h:Math.max(a.y+a.h,b.y+b.h)-y,area:a.area+b.area}}
 // At zero retain all foreground islands as one movable, transparent object.
 if(sensitivity===0)return{groups:original.length?[original.reduce(union)]:[],labels,background:bg};
 // Keep tiny strokes until letters and words have been assembled. A global
 // image-area cutoff discarded narrow letters on large uploaded images.
 const tiny=parts.filter(p=>p.area<=8).sort((a,b)=>a.area-b.area),attached=new Set();
 for(const mark of tiny){if(attached.has(mark))continue;let best=null,distance=Infinity;
 for(const letter of parts){if(letter===mark||attached.has(letter)||letter.area<mark.area*2||letter.h>80)continue;
 const cx=mark.x+mark.w/2,gap=Math.max(0,letter.y-mark.y-mark.h,mark.y-letter.y-letter.h);
 if(cx<letter.x-1||cx>letter.x+letter.w+1||mark.w>Math.max(2,letter.w*1.1)||mark.h>Math.max(2,letter.h*.45)||gap>Math.max(2,Math.min(6,letter.h*.5)))continue;
 if(gap<distance){best=letter;distance=gap}}
 if(best){bind(best,mark,97);Object.assign(best,union(best,mark));attached.add(mark)}
 }
 let groups=parts.filter(p=>!attached.has(p));
 {
 const candidates=groups,parent=candidates.map((_,i)=>i);function find(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i}
 for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++){let a=candidates[i],b=candidates[j],overlap=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y),gap=Math.max(0,Math.max(a.x,b.x)-Math.min(a.x+a.w,b.x+b.w)),ratio=Math.min(a.h,b.h)/Math.max(a.h,b.h);if(ratio>.45&&overlap>Math.min(a.h,b.h)*.55&&gap<Math.max(2,Math.min(a.h,b.h)*.48)){bind(a,b,Math.round(90-60*gap/Math.max(1,Math.min(a.h,b.h))));parent[find(j)]=find(i)}}
 const merged=new Map();candidates.forEach((p,i)=>{let k=find(i);merged.set(k,merged.has(k)?union(merged.get(k),p):p)});groups=[...merged.values()];
 }
 // Detail sensitivity controls whether islands enclosed by an illustration
 // (numbers, visor, bolt details) belong to that illustration. Bounding-box
 // overlap alone is insufficient: nearby words may share the same bounds.
 const detail=0; // Fixed semantic scaffold; the slider cuts one shared hierarchy below.
 if(detail<100){
 const representatives=new Map();for(let p=0;p<n;p++)if(labels[p]&&!representatives.has(labels[p]))representatives.set(labels[p],p);
 const illustrations=groups.filter(g=>g.w>w*.15&&g.h>h*.15&&g.area>n*.01).sort((a,b)=>b.area-a.area).slice(0,8);
 const consumed=new Set();
 for(const main of illustrations){if(consumed.has(main))continue;
 const small=groups.filter(g=>g!==main&&!consumed.has(g)&&g.area<main.area*.12*(1-detail/100)**2&&g.x>=main.x&&g.y>=main.y&&g.x+g.w<=main.x+main.w&&g.y+g.h<=main.y+main.h);if(!small.length)continue;
 const blocked=new Set(main.ids),outside=new Uint8Array(n);let head=0,tail=0;
 function enter(p){if(!outside[p]&&!blocked.has(labels[p])){outside[p]=1;queue[tail++]=p}}
 for(let x=0;x<w;x++){enter(x);enter((h-1)*w+x)}for(let y=1;y<h-1;y++){enter(y*w);enter(y*w+w-1)}
 while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);if(x)enter(p-1);if(x+1<w)enter(p+1);if(y)enter(p-w);if(y+1<h)enter(p+w)}
 function nearOutline(child){const radius=Math.round(Math.max(w,h)*.018*(1-detail/100)**2);if(!radius||child.w>main.w*.2||child.h>main.h*.2)return false;
 for(let y=Math.max(0,child.y-radius);y<Math.min(h,child.y+child.h+radius);y++)for(let x=Math.max(0,child.x-radius);x<Math.min(w,child.x+child.w+radius);x++){
 if(!blocked.has(labels[y*w+x]))continue;
 const dx=Math.max(0,child.x-x,x-(child.x+child.w-1)),dy=Math.max(0,child.y-y,y-(child.y+child.h-1));if(Math.hypot(dx,dy)<=radius)return true;
 }return false}
 for(const child of small){if(child.ids.every(id=>!outside[representatives.get(id)])||nearOutline(child)){bind(main,child,Math.round(55+40*Math.exp(-child.area/(main.area*.01))));Object.assign(main,union(main,child));consumed.add(child)}}
 }groups=groups.filter(g=>!consumed.has(g));
 }
 // Connect semantic blocks by a minimum-spanning tree of their centres.
 // Removing the weakest scene bonds first yields two broad clusters at zero,
 // semantic objects in the middle, and individual ink components at the top.
 if(groups.length>2){
  const size=groups.length,used=new Uint8Array(size),distance=new Float64Array(size).fill(Infinity),from=new Int32Array(size).fill(-1),tree=[];
  distance[0]=0;
  for(let step=0;step<size;step++){
   let next=-1;for(let i=0;i<size;i++)if(!used[i]&&(next<0||distance[i]<distance[next]))next=i;
   used[next]=1;if(from[next]>=0)tree.push({a:groups[next],b:groups[from[next]],distance:distance[next]});
   const a=groups[next],ax=a.x+a.w/2,ay=a.y+a.h/2;
   for(let i=0;i<size;i++)if(!used[i]){const b=groups[i],d=(ax-b.x-b.w/2)**2+(ay-b.y-b.h/2)**2;if(d<distance[i]){distance[i]=d;from[i]=next}}
  }
  tree.sort((a,b)=>a.distance-b.distance);for(let i=0;i<size-2;i++)bind(tree[i].a,tree[i].b,30*(size-2-i)/(size-2));
 }
 const parent=original.map((_,i)=>i);let count=original.length;
 function root(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i}
 edges.sort((a,b)=>b.releaseAt-a.releaseAt);
 for(const edge of edges){if(sensitivity>=edge.releaseAt||count<=2)continue;const a=root(edge.a),b=root(edge.b);if(a!==b){parent[b]=a;count--}}
 const result=new Map();original.forEach((p,i)=>{const key=root(i);result.set(key,result.has(key)?union(result.get(key),p):p)});groups=[...result.values()];
 groups.sort((a,b)=>a.y-b.y||a.x-b.x);return{groups,labels,background:bg};
}
if(typeof module==='object'&&module.exports)module.exports=segmentObjects;else root.segmentObjects=segmentObjects;
})(typeof globalThis!=='undefined'?globalThis:this);
