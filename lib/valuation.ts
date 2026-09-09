import type {Config,Point} from './simulator.ts';

// A valuation overlay, not a market or transaction simulation.
export function valuePosition(points:Point[],day:number,config:Config,marketCap:number,supply:number,branches:number,retire:number){
 if(!Number.isFinite(marketCap)||marketCap<=0||!Number.isFinite(supply)||supply<=0||supply>1e9)throw new Error('Invalid valuation assumptions');
 const p=points[day];
 if(!p||!Number.isInteger(branches)||branches<1||branches>10||branches>p.branches||!Number.isInteger(retire)||retire<1||retire>branches)throw new Error('Invalid position');
 const price=marketCap/supply;
 const gross=p.held*retire;
 // Quote an additional withdrawal after the selected day's modeled batch.
 const trailingGross=points.slice(Math.max(0,day-6),day+1).reduce((sum,row)=>sum+row.gross,0);
 const withdrawals=trailingGross+gross;
 const pressure=withdrawals/Math.max(p.ledger-gross+withdrawals,1);
 const fee=(config.floor+(config.ceiling-config.floor)*Math.min(pressure/(config.saturation/100),1)**2)/100;
 const net=gross*(1-fee);
 return {price,dailyTokens:p.dailyYield*branches,dailyUsd:p.dailyYield*branches*price,balanceTokens:p.held*branches,gross,fee,net,netUsd:net*price,remaining:branches-retire};
}
