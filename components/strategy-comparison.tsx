'use client';
import {useState} from 'react';
import {Slider} from '@/components/ui/slider';
import {createTranslator,createFormatters,type Language} from '@/lib/i18n';
import type {Config,Point} from '@/lib/simulator';
import {compareStrategies} from '@/lib/strategies';

export function StrategyComparison({points,config,day,branches,price,language}:{points:Point[];config:Config;day:number;branches:number;price:number;language:Language}){
 const [add,setAdd]=useState(1),[retire,setRetire]=useState(1),[license,setLicense]=useState(1000),[wallet,setWallet]=useState(5000),[end,setEnd]=useState(14);
 const t=createTranslator(language),{decimal,pct,num}=createFormatters(language);
 const selected=Math.max(day,end),closed=Math.min(branches,retire);
 const scenarios=compareStrategies(points,config,{day,branches,add,retire:closed,license,wallet});
 const usd=(n:number)=>new Intl.NumberFormat(language==='ru'?'ru-RU':'en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
 return <section id="strategies" className="strategy-section" aria-labelledby="strategy-title">
  <div className="position-heading"><div><span className="eyebrow">{t('STRATEGIES')}</span><h2 id="strategy-title">{t('Hold, expand or withdraw')}</h2></div><span className="tag assumed">{t('One action on day {day}',{day})}</span></div>
  <p className="strategy-intro">{t('Same NFT, wallet and external market scenario. Only your action changes. Starting branches: {count}.',{count:branches})}</p>
  <div className="strategy-controls">
   <label className="valuation-input">{t('Starting wallet · STANDARD')}<select value={wallet} onChange={e=>setWallet(Number(e.target.value))}>{[0,1000,5000,10000,50000].map(n=><option key={n} value={n}>{num(n)}</option>)}</select></label>
   <label className="valuation-input">{t('Assumed cost per license · STANDARD')}<select value={license} onChange={e=>setLicense(Number(e.target.value))}>{[100,500,1000,2500,5000,10000].map(n=><option key={n} value={n}>{num(n)}</option>)}</select></label>
   <label className="valuation-input">{t('Branches to add')}<select value={add} onChange={e=>setAdd(Number(e.target.value))}>{Array.from({length:9},(_,i)=>i+1).map(n=><option key={n} value={n}>+{n}</option>)}</select></label>
   <label className="valuation-input">{t('Branches to close')}<select value={closed} onChange={e=>setRetire(Number(e.target.value))}>{Array.from({length:branches},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} / {branches}</option>)}</select></label>
  </div>
  <p className="strategy-disclaimer">{t('Licenses are paid from wallet tokens, not accrued balances; 100% is burned. Price and immediate availability are assumptions, not an auction simulation.')}</p>
  <div className="strategy-timeline"><span>{t('Result on day {day}',{day:selected})}</span><Slider aria-label={t('Strategy result day')} min={day} max={14} value={[selected]} disabled={day===14} onValueChange={v=>setEnd(Array.isArray(v)?v[0]:v)}/><span>{day}–14</span></div>
  {day===14&&<p className="strategy-disclaimer">{t('Day 14 has no future days. Select an earlier day above to compare future accrual.')}</p>}
  <div className="strategy-cards">{scenarios.map(s=>{
   const row=s.points.find(p=>p.day===selected);
   return <article key={s.strategy} className={`strategy-card strategy-${s.strategy}`}>
    <h3>{t(s.strategy==='hold'?'Hold':s.strategy==='expand'?'Expand':'Withdraw')}</h3>
    <p className="strategy-action">{s.strategy==='hold'?t('No action. Keep all branches.'):s.strategy==='expand'?t('Buy {count} licenses and burn {amount} STANDARD.',{count:add,amount:num(add*license)}):t('Close {count} branches after day {day}.',{count:closed,day})}</p>
    {!row?<p className="strategy-unavailable" role="status">{t(s.unavailable==='limit'?'Unavailable: maximum 10 branches per NFT.':'Unavailable: insufficient STANDARD in the starting wallet.')}</p>:<>
     <span className="strategy-label">{t('Accrued NFT balance')}</span><strong className="strategy-balance">{decimal(row.balance)}<small>STANDARD</small></strong>
     <dl>{[
      [t('Active branches / system'),`${row.branches} / ${num(row.totalBranches)}`],
      [t('Share of issuance'),pct(row.share)],
      [t('Current accrual / day'),`${decimal(row.daily)} STANDARD`],
      [t('New issuance since action'),decimal(row.earned)],
      [t('Fees received since action'),decimal(row.recycled)],
      [t('License tokens burned'),decimal(row.spent)],
      [t('Withdrawal received'),decimal(row.paid)],
      [t('Withdrawal fee paid'),decimal(row.feePaid)],
      [t('Wallet including starting tokens'),decimal(row.wallet)]
     ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
     <div className="strategy-total"><span>{t('Wallet + net exit of remaining branches')}</span><strong>{decimal(row.totalAfterExit)} STANDARD</strong><span>≈ {usd(row.totalAfterExit*price)}</span><small>{t('Final exit fee: {fee}. Includes starting capital; not profit.',{fee:pct(row.exitFee)})}</small></div>
     {row.branches===0&&<p className="retirement-warning">{t('NFT burned. Future accrual is zero.')}</p>}
    </>}
   </article>;
  })}</div>
  <details className="valuation-notes"><summary>{t('Strategy assumptions')}</summary>
   <p>{t('The action happens after the selected day’s system batch. Added branches earn from the next day and do not receive past issuance. Closing branches removes their share permanently; a partial exit retains only the remaining balance and branches.')}</p>
   <p>{t('Each strategy recalculates its system branch count, issuance shares, seven-day exit pressure and fee redistribution. Other branches follow the original retirement schedule. Pool flow and system issuance follow the same external scenario; trades, auctions and further actions are excluded.')}</p>
   <p>{t('The final total assumes all remaining branches are closed at the result day. That final quote is not executed. USD uses the fixed assumed token price, without gas, slippage, purchase costs or a price reaction to burning and minting.')}</p>
  </details>
 </section>;
}
