import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,simulate} from './simulator.ts';
import {compareStrategies} from './strategies.ts';
const input={day:7,branches:3,add:2,retire:1,license:1000,wallet:5000};
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('holding matches original equal-balance scenario',()=>{
 const points=simulate(defaults),[hold]=compareStrategies(points,defaults,input);
 for(const row of hold.points){near(row.balance,points[row.day].held*input.branches);near(row.daily,points[row.day].dailyYield*input.branches);assert.equal(row.totalBranches,points[row.day].branches);assert.equal(row.wallet,input.wallet);}
});
test('expansion burns wallet tokens, changes denominator and never backfills balances',()=>{
 const points=simulate(defaults),[hold,expand]=compareStrategies(points,defaults,input),start=expand.points[0],next=expand.points[1];
 near(start.balance,hold.points[0].balance);assert.equal(start.wallet,3000);assert.equal(start.spent,2000);assert.equal(start.branches,5);assert.equal(start.totalBranches,points[7].branches+2);
 near(next.earned,points[8].issuance*5/(points[7].branches+2));assert.ok(next.daily>hold.points[1].daily);
});
test('partial and full retirement persist in every future day',()=>{
 const points=simulate(defaults),partial=compareStrategies(points,defaults,input)[2];
 for(const row of partial.points){assert.equal(row.branches,2);assert.equal(row.totalBranches,points[row.day].branches-1);assert.ok(row.paid>0);assert.equal(row.wallet,input.wallet+row.paid);}
 const full=compareStrategies(points,defaults,{...input,retire:3})[2];
 for(const row of full.points){assert.equal(row.branches,0);assert.equal(row.balance,0);assert.equal(row.daily,0);assert.equal(row.earned,0);assert.equal(row.recycled,0);assert.equal(row.totalAfterExit,row.wallet);}
});
test('all strategies conserve system accounting through external exits and fee redistribution',()=>{
 for(const day of [0,3,7,14])for(const exits of [0,60,95]){
  const config={...defaults,exits},points=simulate(config),snapshot=JSON.stringify(points);
  for(const s of compareStrategies(points,config,{...input,day}))for(const r of s.points){
   near(r.systemLedger+r.systemPaid+r.systemBurned,points[day].ledger+points[r.day].issued-points[day].issued);
   assert.ok(r.exitFee>=0&&r.exitFee<=config.ceiling/100);assert.ok(r.balance>=0);assert.ok(r.wallet>=0);
  }
  assert.equal(JSON.stringify(points),snapshot);
 }
});
test('unfunded and over-limit expansion is unavailable, not free',()=>{
 const points=simulate(defaults);
 assert.equal(compareStrategies(points,defaults,{...input,wallet:0})[1].unavailable,'funds');
 assert.equal(compareStrategies(points,defaults,{...input,branches:10})[1].unavailable,'limit');
 assert.throws(()=>compareStrategies(points,defaults,{...input,license:-1}));
});
