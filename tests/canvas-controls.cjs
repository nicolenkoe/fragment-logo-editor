const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../dist/layout.js','utf8');
const object={id:1,x:100,y:100,angle:0,scale:1,img:{width:100,height:80}};
const elements={rotateHandle:{style:{},setPointerCapture(){}},angle:{},angleValue:{}};let checkpoints=0,renders=0;
const sandbox={layers:[object],current:()=>object,$:id=>elements[id],point:e=>({x:e.clientX,y:e.clientY}),checkpoint:()=>checkpoints++,render:()=>renders++,Math};vm.createContext(sandbox);
vm.runInContext(code.slice(code.indexOf('let rotationDrag=null;'),code.indexOf('// A review hook:')),sandbox);
const handle=elements.rotateHandle,event=(x,y,extra={})=>({clientX:x,clientY:y,pointerId:1,preventDefault(){},stopPropagation(){},...extra});
handle.onpointerdown(event(100,0));handle.onpointermove(event(200,100));assert.equal(object.angle,90);handle.onpointermove(event(100,200));assert.equal(object.angle,-180);handle.onpointerup(event(100,200));assert.equal(checkpoints,1,'one undo checkpoint per gesture');
handle.onpointermove(event(0,100));assert.equal(object.angle,-180,'released handle stops rotating');
object.angle=0;function at(degrees){const a=degrees*Math.PI/180;return event(100+100*Math.cos(a),100+100*Math.sin(a))}
handle.onpointerdown(at(179));handle.onpointermove(at(-179));assert.ok(Math.abs(object.angle-2)<1e-8,'crossing angle boundary keeps continuous rotation');handle.onpointercancel(event(0,0));
object.angle=0;handle.onpointerdown(event(100,0));handle.onpointermove({...at(-68),shiftKey:true});assert.equal(object.angle,15,'shift snaps to 15 degrees');handle.onpointerup(event(0,0));
handle.onkeydown({key:'ArrowRight',shiftKey:true,preventDefault(){}});assert.equal(object.angle,30,'keyboard rotation works');assert.ok(renders>=4);
// Fit math must preserve aspect ratio for both portrait and landscape source images.
let width=600,height=500;const stage={get clientWidth(){return width},get clientHeight(){return height}};elements.stage=stage;
sandbox.getComputedStyle=()=>({paddingLeft:'28',paddingRight:'28',paddingTop:'28',paddingBottom:'28'});sandbox.canvas={width:1254,height:1254,style:{}};sandbox.positionRotationHandle=()=>{};
vm.runInContext(code.slice(code.indexOf('function fitCanvas(){'),code.indexOf('function positionRotationHandle(){')),sandbox);
for(const [w,h] of [[600,500],[320,480],[780,230],[1280,720]])for(const [cw,ch] of [[1254,1254],[2400,800],[800,2400]]){width=w;height=h;sandbox.canvas.width=cw;sandbox.canvas.height=ch;vm.runInContext('fitCanvas()',sandbox);const actualW=parseFloat(sandbox.canvas.style.width),actualH=parseFloat(sandbox.canvas.style.height);assert.ok(actualW<=w-56+.01&&actualH<=h-56+.01);assert.ok(Math.abs(actualW/actualH-cw/ch)<1e-8)}
console.log('PASS: drag rotation, one-step undo, wraparound, Shift snapping, keyboard, canvas fit math');
