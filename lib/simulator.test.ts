import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,simulate,type Config} from './simulator.ts';
test('no exits: no payouts, burning or redistribution',()=>{
 const rows=simulate({...defaults,exits:0});
 for(const r of rows){assert.equal(r.branches,1000);assert.equal(r.paid+r.burned+r.recycled,0);assert.equal(r.ledger,defaults.balance+r.issued);}
});
test('all scenarios conserve ledger + paid + cancelled entitlement',()=>{
 for(const exits of [0,5,30,60,95])for(const flow of [-100,0,100])for(const pace of ['steady','front'] as const){
  const c={...defaults,exits,flow,pace};const rows=simulate(c);
  for(const r of rows){assert.ok(Math.abs(r.ledger+r.paid+r.burned-c.balance-r.issued)<1e-6);assert.ok(r.branches>=50);assert.equal(r.burned,r.recycled);assert.ok(r.fee>=c.floor/100&&r.fee<=c.ceiling/100+1e-12);assert.ok(r.multiplier>=.2&&r.multiplier<=1.25);for(const v of Object.values(r))assert.ok(Number.isFinite(v)&&v>=0);}
  assert.equal(rows[7].branches,1000-exits*10);assert.equal(rows[14].branches,rows[7].branches);assert.equal(rows[14].pressure,0);assert.equal(rows[14].fee,c.floor/100);
 }
});
test('policy uses completed epochs and reacts asymmetrically',()=>{
 const down=simulate(defaults),up=simulate({...defaults,flow:1}),flat=simulate({...defaults,flow:0});
 assert.equal(down[1].multiplier,1);assert.equal(down[2].multiplier,.85);assert.equal(up[2].multiplier,1.05);assert.equal(flat[14].multiplier,1);assert.equal(down[14].multiplier,.2);assert.equal(up[14].multiplier,1.25);
});
test('invalid values rejected without producing results',()=>{
 for(const c of [{...defaults,exits:100},{...defaults,flow:NaN},{...defaults,base:-1},{...defaults,saturation:0},{...defaults,pace:'bad'}])assert.throws(()=>simulate(c as Config));
});
test('zero issuance and zero exit fee still conserve balances',()=>{
 const c={...defaults,base:0,floor:0,ceiling:20};const end=simulate(c)[14];assert.equal(end.issued,0);assert.ok(Math.abs(end.ledger+end.paid+end.burned-c.balance)<1e-6);
});
