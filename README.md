# Bank Run Simulator

Independent educational Standard Reserve model by @intelpocik. Not endorsed by the project. English and Russian interfaces with light/dark themes and device-local preferences. No wallets, financial transactions, live data or price model.

## Run and verify

Use Node.js 24 LTS. Install dependencies with `npm ci` first.

- `npm run dev`
- `node --test lib/simulator.test.ts lib/i18n.test.ts`
- `npx tsc --noEmit`
- `npm run build`

## Model

Source: https://www.standardreserve.xyz/whitepaper/ checked 2026-09-08 (public whitepaper-CWJ24W4_.js). Exact launch fee and policy parameters are redacted. All chosen numerical parameters and ordering assumptions are disclosed on the page. This is not a smart-contract replica.

The model conserves initial ledger + new issuance = remaining ledger + wallet payouts + cancelled fee entitlement. Fee recycling does not consume new issuance budget. Pool flow is independent of branch retirement. No new branches, auctions, dormancy, token sales or actual buybacks are simulated.

## Verification and remaining gaps

Nine automated tests cover 30 scenario combinations, conservation, exit counts, fee bounds, rolling-window decay, policy lag, input rejection, translation coverage and placeholders, locale-aware numbers, and safe preference loading. Type checking and a production build pass. Local HTTP returned 200. Browser visual/interaction QA was not requested and has not been performed.

Optional WebMCP `set_simulation_scenario` registration is feature-detected and cleaned up on unmount. No supported WebMCP invocation context was available for runtime verification; its browser contract remains unverified.

The pinned Sites starter reports dependency advisories (including react-server-dom-webpack 19.2.6 DoS and image-size via vinext). No server actions or user image processing are implemented. Do not treat that as a security audit or proof of non-exploitability. Review and patch runtime dependencies before public release. First publication is owner-only.

## Public source export

The original private Sites project ID is intentionally excluded. The neutral `.openai/hosting.json` retains the fields required by the build configuration. This repository contains the current source snapshot, not the original private hosting history. Publishing source code does not change access to the hosted application.
