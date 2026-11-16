// Rasterized DejaVu Sans "mini text" at 8, 10 and 14 px on a 2400×1600 image.
// Thin letters and dots must survive independently of the overall image size.
const assert=require('node:assert/strict');
const fs=require('node:fs'),zlib=require('node:zlib');
const segment=require('../dist/segment.js');
const image={width:2400,height:1600,data:new Uint8ClampedArray(zlib.inflateSync(fs.readFileSync(__dirname+'/small-text.rgba.deflate')))};
const result=segment(image);
assert.equal(result.groups.length,6,'six complete words');
for(const y of [100,160,230])assert.equal(result.groups.filter(g=>g.y>=y&&g.y<y+20).length,2,'two words in each text row');
const retained=new Set(result.groups.flatMap(g=>g.ids));
let foreground=0,missing=0;
for(let p=0;p<result.labels.length;p++){
 if(result.labels[p]){foreground++;if(!retained.has(result.labels[p]))missing++}
}
assert.ok(foreground>300);assert.equal(missing,0,'all detected letter pixels including dots are retained');
const letters=segment(image,{groupWords:false});
// Some tiny raster glyphs touch, so individual connected pieces can contain
// multiple letters. The dot and stem of a narrow i must still stay together.
assert.ok(letters.groups.some(g=>g.w===1&&g.h===8&&g.ids.length===2),'one-pixel i stem keeps its dot');
const detailIds=new Set(letters.groups.flatMap(g=>g.ids));
for(let p=0;p<letters.labels.length;p++)if(letters.labels[p])assert.ok(detailIds.has(letters.labels[p]),'detail mode preserves small text pixels');
console.log('PASS: complete small words at 8, 10, 14 px; every detected letter pixel retained; narrow stems retain their dots');
