import {validateConfig,type Config,type Point} from './simulator.ts';

export type Strategy='hold'|'expand'|'withdraw';
export type StrategyInput={day:number;branches:number;add:number;retire:number;license:number;wallet:number};
export type StrategyPoint={day:number;branches:number;totalBranches:number;balance:number;wallet:number;daily:number;share:number;earned:number;recycled:number;spent:number;paid:number;feePaid:number;exitFee:number;exitNet:number;totalAfterExit:number;systemLedger:number;systemPaid:number;systemBurned:number};
export function compareStrategies(points:Point[],config:Config,input:StrategyInput){
 validateConfig(config);
 const {day,branches,add,retire,license,wallet:initialWallet}=input;
 if(!Number.isInteger(day)||!points[day]||!Number.isInteger(branches)||branches<1||branches>10||!Number.isInteger(add)||add<1||add>9||!Number.isInteger(retire)||retire<1||retire>branches||!Number.isFinite(license)||license<=0||!Number.isFinite(initialWallet)||initialWallet<0)throw new Error('Invalid strategy inputs');
 return (['hold','expand','withdraw'] as const).map(strategy=>{
  const unavailable=strategy==='expand'?(branches+add>10?'limit':initialWallet<license*add?'funds':null):null;
  if(unavailable)return {strategy,unavailable,points:[] as StrategyPoint[]};
  const start=points[day];
  let own=branches,others=start.branches-branches,balance=start.held*branches,otherBalance=start.ledger-balance,wallet=initialWallet;
  let earned=0,recycled=0,spent=0,paid=0,feePaid=0,systemPaid=0,systemBurned=0;
  const withdrawals=points.map(p=>p.day<=day?p.gross:0);
  const rows:StrategyPoint[]=[];
  function feeAt(date:number,gross:number,ledger:number){
   const W=withdrawals.slice(Math.max(0,date-6),date+1).reduce((a,b)=>a+b,0)+gross;
   const pressure=W/Math.max(ledger-gross+W,1);
   return (config.floor+(config.ceiling-config.floor)*Math.min(pressure/(config.saturation/100),1)**2)/100;
  }
  function recycle(amount:number){
   const share=own/(own+others),mine=amount*share;
   balance+=mine;otherBalance+=amount-mine;recycled+=mine;
  }
  if(strategy==='expand'){spent=license*add;wallet-=spent;own+=add;}
  if(strategy==='withdraw'){
   const gross=balance*retire/own,fee=feeAt(day,gross,balance+otherBalance),charged=gross*fee;
   balance-=gross;own-=retire;wallet+=gross-charged;paid+=gross-charged;feePaid+=charged;
   systemPaid+=gross-charged;systemBurned+=charged/2;withdrawals[day]+=gross;recycle(charged/2);
  }
  for(let date=day;date<points.length;date++){
   if(date>day){
    const emission=points[date].issuance,mine=emission*own/(own+others);
    balance+=mine;otherBalance+=emission-mine;earned+=mine;
    // The same external retirement schedule, not the same per-branch balances.
    const closing=Math.min(others,points[date].retired),gross=others?otherBalance*closing/others:0;
    const charged=gross*feeAt(date,gross,balance+otherBalance);
    otherBalance-=gross;others-=closing;withdrawals[date]=gross;
    systemPaid+=gross-charged;systemBurned+=charged/2;recycle(charged/2);
   }
   const exitFee=own?feeAt(date,balance,balance+otherBalance):0,exitNet=balance*(1-exitFee);
   rows.push({day:date,branches:own,totalBranches:own+others,balance,wallet,daily:points[date].dailyYield*points[date].branches*own/(own+others),share:own/(own+others),earned,recycled,spent,paid,feePaid,exitFee,exitNet,totalAfterExit:wallet+exitNet,systemLedger:balance+otherBalance,systemPaid,systemBurned});
  }
  return {strategy,unavailable:null,points:rows};
 });
}
