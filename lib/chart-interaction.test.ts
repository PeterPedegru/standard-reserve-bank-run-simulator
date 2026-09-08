import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pointerDay,keyboardDay} from './chart-interaction.ts';

test('pointer maps to day zero, middle and final day at native SVG scale',()=>{
 assert.equal(pointerDay(165,100,760,760),0);
 assert.equal(pointerDay(505,100,760,760),7);
 assert.equal(pointerDay(845,100,760,760),14);
});
test('pointer is clamped and scales with rendered chart width',()=>{
 assert.equal(pointerDay(-100,100,760,760),0);
 assert.equal(pointerDay(1500,100,760,760),14);
 assert.equal(pointerDay(302.5,100,380,760),7);
 assert.equal(pointerDay(200,100,0,760),0);
 assert.equal(pointerDay(NaN,100,760,760),0);
});
test('keyboard selects days without taking over other keys',()=>{
 assert.equal(keyboardDay('ArrowRight',7),8);
 assert.equal(keyboardDay('ArrowLeft',0),0);
 assert.equal(keyboardDay('ArrowUp',14),14);
 assert.equal(keyboardDay('ArrowDown',7),6);
 assert.equal(keyboardDay('Home',10),0);
 assert.equal(keyboardDay('End',3),14);
 assert.equal(keyboardDay('Tab',7),null);
});
