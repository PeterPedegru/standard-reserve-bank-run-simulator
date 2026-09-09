import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,simulate} from './simulator.ts';
import {valuePosition} from './valuation.ts';

test('market cap divided by circulation prices accrual, not a cash payout',()=>{
 const points=simulate(defaults),v=valuePosition(points,0,defaults,10e6,100e6,1,1);
 assert.equal(v.price,.1);assert.equal(v.dailyTokens,100);assert.equal(v.dailyUsd,10);
 const five=valuePosition(points,0,defaults,10e6,100e6,5,2);
 assert.equal(five.dailyTokens,500);assert.equal(five.gross,20000);assert.equal(five.remaining,3);
 const half=valuePosition(points,0,defaults,5e6,100e6,1,1);
 assert.equal(half.dailyTokens,v.dailyTokens);assert.equal(half.dailyUsd,v.dailyUsd/2);assert.equal(half.netUsd,v.netUsd/2);
 const diluted=valuePosition(points,0,defaults,10e6,200e6,1,1);assert.equal(diluted.price,.05);
});
test('exit quote includes the additional withdrawal and expires old pressure',()=>{
 const points=simulate(defaults),snapshot=JSON.stringify(points);
 for(const day of [0,7,14]){
  const v=valuePosition(points,day,defaults,10e6,100e6,10,10),p=points[day];
  const W=points.filter(r=>r.day>=day-6&&r.day<=day).reduce((sum,r)=>sum+r.gross,0)+p.held*10;
  const expected=(2+48*Math.min((W/(p.ledger-p.held*10+W))/.6,1)**2)/100;
  assert.ok(Math.abs(v.fee-expected)<1e-12);assert.equal(v.remaining,0);
  assert.ok(v.net<v.gross);assert.ok(Math.abs(v.net+v.gross*v.fee-v.gross)<1e-8);
 }
 assert.ok(valuePosition(points,14,defaults,10e6,100e6,10,10).fee>points[14].fee);
 assert.equal(JSON.stringify(points),snapshot);
});
test('invalid valuations and impossible branch counts are rejected',()=>{
 const points=simulate(defaults);
 for(const [cap,supply,branches,retire] of [[0,100e6,1,1],[NaN,100e6,1,1],[10e6,0,1,1],[10e6,2e9,1,1],[10e6,100e6,11,1],[10e6,100e6,1,2],[10e6,100e6,1.5,1]])assert.throws(()=>valuePosition(points,7,defaults,cap,supply,branches,retire));
});
