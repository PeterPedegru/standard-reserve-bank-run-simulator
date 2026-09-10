# Bank Run Simulator

Independent educational Standard Reserve model by @intelpocik. Not endorsed by the project. English and Russian interfaces with light/dark themes and device-local preferences. No wallets, financial transactions, live data or price forecast.

## Personal valuation scenarios

One NFT represents 1–10 existing, equally funded branches. Price = assumed market cap / assumed circulating supply, not maximum supply. Inputs stay fixed across days; they are not live observations or derived from this toy ledger.

Daily issuance accrual is shown in STANDARD and hypothetical USD, with no-exit and half-price comparisons. It is not a daily payout. A separate retirement quote adds the withdrawal to the trailing seven-day window and recalculates the fee before redistribution, without changing the simulation. Retiring the final branch burns the charter. Balances include assumed opening balances. Gas, slippage, acquisition/expansion costs and liquidity are excluded; values are not profit or executable sale quotes.

## Strategy comparison

The strategy section forks the selected day's ledger into hold, expand and withdraw paths through day 14. Each starts with the same NFT and separate wallet tokens. Expansion burns wallet tokens at an explicitly assumed fixed license price and adds branches to the system denominator without adding historical balance. Insufficient funds and the 10-branch limit block expansion. Retirement releases a proportional balance after fees and permanently changes future issuance and fee shares. Full retirement leaves zero future accrual.

External retirement counts and issuance follow the original scenario, but balances, withdrawal pressure and redistribution are recalculated for each path. Partial retirees participate in redistribution through remaining branches under the model's per-branch allocation assumption. The comparison's terminal total adds wallet tokens to a hypothetical full exit after fees; it includes starting capital and is not profit. There is no automatic reinvestment of unminted ledger entries, auction simulation or dynamic market price. The separate system chart remains the original scenario.

Strategy checks: `node --test lib/strategies.test.ts` (holding equivalence, paid expansion, persistent retirement, accounting conservation and unavailable expansion).

## Run and verify

Use Node.js 24 LTS. Install dependencies with `npm ci` first.

- `npm run dev`
- `node --test lib/simulator.test.ts lib/i18n.test.ts lib/chart-interaction.test.ts lib/valuation.test.ts lib/strategies.test.ts`
- `npx tsc --noEmit`
- `npm run build`

## Vercel

`next.config.ts` enables Vinext static export. `vercel.json` uses Vercel's Vite preset, runs the standard build and publishes `dist/client`, which contains the generated `index.html`. No server runtime, wallet connection, or environment variables are required.

## Model

Source: https://www.standardreserve.xyz/whitepaper/ checked 2026-09-09 (public whitepaper-CWJ24W4_.js). Exact launch fee and policy parameters are redacted. All chosen numerical parameters and ordering assumptions are disclosed on the page. This is not a smart-contract replica.

The model conserves initial ledger + new issuance = remaining ledger + wallet payouts + cancelled fee entitlement. Fee recycling does not consume new issuance budget. Pool flow is independent of branch retirement. The system chart excludes new branches, auctions, dormancy, token sales and actual buybacks. Strategy comparisons separately model the user's expansion and retirement.

## Verification and remaining gaps

Twenty automated tests cover 30 scenario combinations, conservation, exit counts, fee bounds, rolling-window decay, policy lag, input rejection, translation coverage and placeholders, locale-aware numbers, safe preference loading, pointer-to-day mapping, keyboard navigation, valuation arithmetic and additional-withdrawal quoting. Type checking and a production build pass. Local HTTP returned 200. Browser QA on 9 September 2026 covered light/dark and English/Russian views, 390/768/1440px widths without horizontal overflow, pointer lighting above and below the chart (the chart excluded), reduced motion, market-cap and branch-count changes, partial retirement, scenario/day synchronization, keyboard chart navigation and the daily table. No browser errors remained after adding the existing SVG favicon to metadata.

## Interaction design

Hover over the chart to inspect a day; click or tap to select it across the simulator. The focused chart also supports arrow keys, Home and End. A viewport-wide pointer light covers the page and is clipped out of the complete chart panel, including when the pointer is near its border. It follows scrolling and resizing without changing model state. Chart reveals, value transitions and entrance animations respect reduced-motion settings; touch users retain every functional control without hover effects. Displayed numbers are exact model results, not interpolated financial values.

Optional WebMCP `set_simulation_scenario` registration is feature-detected and cleaned up on unmount. No supported WebMCP invocation context was available for runtime verification; its browser contract remains unverified.

Public-release preparation updated React/React DOM/RSC to 19.2.8, vinext to beta.9, its RSC plugin to 0.5.34 and Vite to 8.0.16. This clears the reported React server-function and image-size advisories. The remaining production-audit entries are esbuild (Windows development-server issue) and undici via local Miniflare/tooling. No server actions or user image processing are implemented. This is dependency hygiene, not a security audit; keep tooling and runtime updates under review.

## Public source export

The original private Sites project ID is intentionally excluded. The neutral `.openai/hosting.json` retains the fields required by the build configuration. This repository contains the current source snapshot, not the original private hosting history. Publishing source code does not change access to the hosted application.
