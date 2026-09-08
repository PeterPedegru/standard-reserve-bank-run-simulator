export type Config = { exits:number; flow:number; base:number; floor:number; ceiling:number; saturation:number; balance:number; pace:'steady'|'front' };
export const defaults:Config={exits:60,flow:-20,base:100000,floor:2,ceiling:50,saturation:60,balance:10000000,pace:'front'};
export const presets:Record<string,{label:string;note:string;config:Partial<Config>}>= {
 calm:{label:'Business as usual',note:'Light exits · capital coming in',config:{exits:5,flow:20,pace:'steady'}},
 selloff:{label:'Slow sell-off',note:'Gradual exits · capital leaving',config:{exits:30,flow:-10,pace:'steady'}},
 run:{label:'Bank run',note:'Front-loaded exits · heavy outflows',config:{exits:60,flow:-20,pace:'front'}}
};
export type Point={day:number;branches:number;ledger:number;held:number;paid:number;burned:number;recycled:number;fee:number;pressure:number;multiplier:number;issuance:number;dailyYield:number;retired:number;gross:number;issued:number};
export function validateConfig(c:Config){
 const fields:[keyof Config,number,number][]=[['exits',0,95],['flow',-100,100],['base',0,500000],['floor',0,20],['ceiling',20,70],['saturation',10,100],['balance',1000000,50000000]];
 for(const [key,min,max] of fields)if(typeof c[key]!=='number'||!Number.isFinite(c[key])||Number(c[key])<min||Number(c[key])>max)throw new Error(`Invalid ${key}`);
 if(c.floor>c.ceiling||!['steady','front'].includes(c.pace))throw new Error('Invalid curve or pace');
}
export function simulate(c:Config):Point[]{
 validateConfig(c);
 let branches=1000,ledger=c.balance,paid=0,burned=0,recycled=0,multiplier=1,issued=0;
 const withdrawals:number[]=[];
 const result:Point[]=[{day:0,branches,ledger,held:ledger/branches,paid,burned,recycled,fee:c.floor/100,pressure:0,multiplier,issuance:0,dailyYield:c.base/branches,retired:0,gross:0,issued}];
 const weights=c.pace==='front'?[.4,.2,.13,.1,.07,.06,.04]:Array(7).fill(1/7);
 let cumulativeWeight=0,alreadyExited=0;
 for(let day=1;day<=14;day++){
  // One-day epochs and policy step sizes are explicit educational assumptions.
  const signal=(day>1?c.flow:0)+(day>2?c.flow:0);
  if(signal<0)multiplier=Math.max(.2,multiplier-.15);
  else if(signal>0)multiplier=Math.min(1.25,multiplier+.05);
  const issuance=Math.min(c.base*multiplier,900000000-c.balance-issued);
  issued+=issuance;ledger+=issuance;
  if(day<=7)cumulativeWeight+=weights[day-1];
  const target=day<=7?Math.round(1000*c.exits/100*cumulativeWeight):alreadyExited;
  const retired=target-alreadyExited;alreadyExited=target;
  const gross=ledger*retired/branches;
  // Assumed cohort pricing: today's gross withdrawal is included in W.
  const trailing=withdrawals.slice(-6).reduce((a,b)=>a+b,0)+gross;
  const pressure=trailing/Math.max(ledger-gross+trailing,1);
  const fee=(c.floor+(c.ceiling-c.floor)*Math.min(1,pressure/(c.saturation/100))**2)/100;
  const charged=gross*fee;
  paid+=gross-charged;burned+=charged/2;recycled+=charged/2;
  ledger=ledger-gross+charged/2;branches-=retired;withdrawals.push(gross);
  result.push({day,branches,ledger,held:ledger/branches,paid,burned,recycled,fee,pressure,multiplier,issuance,dailyYield:c.base*multiplier/branches,retired,gross,issued});
 }
 return result;
}
