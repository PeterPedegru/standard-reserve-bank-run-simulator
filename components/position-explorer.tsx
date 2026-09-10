'use client';
import {useState} from 'react';
import {Slider} from '@/components/ui/slider';
import {createTranslator,createFormatters,type Language} from '@/lib/i18n';
import {presets,type Config,type Point} from '@/lib/simulator';
import {valuePosition} from '@/lib/valuation';
import {StrategyComparison} from '@/components/strategy-comparison';

export function PositionExplorer({points,baseline,day,config,language,preset,onScenario,onDay}:{points:Point[];baseline:Point[];day:number;config:Config;language:Language;preset:string;onScenario:(id:string)=>void;onDay:(day:number)=>void}){
 const [capMillions,setCapMillions]=useState(10),[supplyMillions,setSupplyMillions]=useState(100),[branches,setBranches]=useState(1),[retire,setRetire]=useState(1);
 const t=createTranslator(language),{num,decimal,pct}=createFormatters(language);
 const usd=(value:number)=>new Intl.NumberFormat(language==='ru'?'ru-RU':'en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
 const priceFormat=(value:number)=>new Intl.NumberFormat(language==='ru'?'ru-RU':'en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:6}).format(value);
 const v=valuePosition(points,day,config,capMillions*1e6,supplyMillions*1e6,branches,retire);
 const baselineDaily=baseline[day].dailyYield*branches*v.price;
 return <section className="position-explorer" aria-labelledby="position-title">
  <div className="position-heading"><div><span className="eyebrow">{t('POSITION')}</span><h2 id="position-title">{t('NFT accrual')}</h2></div><span className="tag assumed">{t('Assumptions, not live prices')}</span></div>
  <div className="position-layout"><div className="position-inputs">
   <label className="valuation-input">{t('Assumed market cap · USD')}<select value={capMillions} onChange={e=>setCapMillions(Number(e.target.value))}>{[1,5,10,25,50,100,250].map(n=><option key={n} value={n}>{usd(n*1e6)}</option>)}</select></label>
   <div className="control"><div className="control-label"><span>{t('Assumed circulating supply')}</span><output>{num(supplyMillions)} {t('million tokens')}</output></div><Slider aria-label={t('Assumed circulating supply')} value={[supplyMillions]} min={10} max={1000} step={10} onValueChange={n=>setSupplyMillions(Array.isArray(n)?n[0]:n)}/></div>
   <div className="price-equation"><span>{t('Market cap ÷ circulating supply')}</span><strong>1 STANDARD = {priceFormat(v.price)}</strong><small>{t('Not FDV: the 1B supply cap is not the circulating supply. Both inputs are hypothetical and stay fixed across days.')}</small></div>
   <div className="control"><div className="control-label"><span>{t('Branches in one NFT')}</span><output>{branches} / 10</output></div><Slider aria-label={t('Branches in one NFT')} value={[branches]} min={1} max={10} step={1} onValueChange={n=>{const next=Array.isArray(n)?n[0]:n;setBranches(next);setRetire(r=>Math.min(r,next));}}/><p>{t('Starting position only. Expansion costs and future effects are calculated in the strategy comparison below.')}</p></div>
  </div><div className="position-results">
   <div className="position-scenarios" role="group" aria-label={t('Selected scenario')}>{Object.entries(presets).map(([id,s])=><button key={id} aria-pressed={preset===id} onClick={()=>onScenario(id)}>{t(s.label)}</button>)}</div>
   <div className="position-day"><label htmlFor="position-day">{t('Day')} {day}</label><Slider id="position-day" aria-label={t('Simulation day')} value={[day]} min={0} max={14} step={1} onValueChange={n=>onDay(Array.isArray(n)?n[0]:n)}/></div>
   <div className="earning-hero"><span>{t('One NFT · gross issuance accrual at this day’s rate')}</span><strong key={v.dailyUsd} className="value-arrive">{usd(v.dailyUsd)}<small>{t('/ day on paper')}</small></strong><p>{t('{amount} STANDARD / day · branches: {count}',{amount:decimal(v.dailyTokens),count:branches})}</p><div className="per-branch">{t('One branch: {tokens} STANDARD / day ≈ {dollars}',{tokens:decimal(points[day].dailyYield),dollars:usd(points[day].dailyYield*v.price)})}</div><p className="earning-warning">{t('Not a daily payout. This is ledger accrual, excluding redistributed fees. Withdrawal retires branches; tomorrow’s rate can change.')}</p></div>
   <div className="value-comparison"><div><span>{t('No exits · same price & pool flow')}</span><strong>{usd(baselineDaily)}<small>{t('/ day on paper')}</small></strong></div><div><span>{t('Selected scenario · token price halves')}</span><strong>{usd(v.dailyUsd/2)}<small>{t('/ day on paper')}</small></strong></div></div>
  </div></div>
  <StrategyComparison points={points} config={config} day={day} branches={branches} price={v.price} language={language}/>
  <div className="exit-experiment"><div><span className="eyebrow">{t('WITHDRAWAL')}</span><h3>{t('Withdrawal estimate')}</h3><p>{t('NFT ledger balance: {tokens} STANDARD. Includes the assumed opening balance, not just new earnings.',{tokens:decimal(v.balanceTokens)})}</p><label className="valuation-input">{t('Branches to retire')}<select value={retire} onChange={e=>setRetire(Number(e.target.value))}>{Array.from({length:branches},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} / {branches}</option>)}</select></label></div>
   <div className="exit-quote"><div><span>{t('Gross released balance')}</span><strong>{decimal(v.gross)} STANDARD</strong></div><div><span>{t('Illustrative exit fee')} · {pct(v.fee)}</span><strong>−{decimal(v.gross-v.net)} STANDARD</strong></div><div className="quote-total"><span>{t('Net tokens after retirement')}</span><strong>{decimal(v.net)} STANDARD<small>≈ {usd(v.netUsd)}</small></strong></div><p>{t('Dollar equivalent before slippage and gas, not a sale quote or profit. No liquidity or NFT acquisition cost is modeled.')}</p><p className="retirement-warning">{v.remaining===0?t('All branches retired: the NFT charter is burned. No future accrual.'):t('Remaining branches: {count}. Retired branches stop earning permanently.',{count:v.remaining})}</p></div>
  </div>
  <details className="valuation-notes"><summary>{t('How these numbers are calculated')}</summary><p>{t('Daily tokens = current system issuance rate ÷ active branches × your branches. Your NFT represents equally funded branches already in the simulation; changing its branch count does not open new branches.')}</p><p>{t('The exit quote adds your withdrawal to the selected day’s trailing 7-day gross withdrawals and recalculates the fee before redistribution. It does not change the simulation or reuse the earlier cohort’s fee.')}</p><p>{t('Market cap and supply are independent valuation assumptions, not derived from this toy ledger. Accrued tokens are not circulating tokens. A withdrawal can increase supply; this model does not forecast that price impact.')}</p></details>
 </section>;
}
