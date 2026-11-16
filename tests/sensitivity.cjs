const assert=require('node:assert/strict'),segment=require('../dist/segment.js'),decode=require('./helpers/png.cjs');
const image=decode(__dirname+'/../dist/assets/enduro-logo.png');
const coarse=segment(image,{detail:35}),medium=segment(image,{detail:70}),fine=segment(image,{detail:100});
assert.equal(coarse.groups.length,4,'motorcycle including 123 plus three words');assert.equal(medium.groups.length,5,'123 becomes its own object');assert.equal(fine.groups.length,9,'internal details separate');
assert.deepEqual(coarse.groups.map(g=>[g.x,g.y,g.w,g.h]),[[71,107,1004,949],[782,686,355,144],[545,879,504,130],[110,1090,1082,104]]);
const number=medium.groups.find(g=>g.x===252&&g.y===631);assert.ok(number);assert.equal(number.ids.length,3);for(const id of number.ids)assert.ok(coarse.groups[0].ids.includes(id),'number retained inside motorcycle at low detail');
const lowIds=new Set(coarse.groups.flatMap(g=>g.ids)),highIds=new Set(fine.groups.flatMap(g=>g.ids));assert.deepEqual(lowIds,highIds,'changing detail regroups but never discards components');
console.log('PASS: actual logo has 4, 5 or 9 objects at sensitivity 35, 70 or 100 without lost pixels');
