# Glow Nature — Campaign Rescue Simulator

Vietnamese educational campaign lab for Tomorrow Marketers Academy. Next.js App Router, TypeScript, React, Recharts and Lucide. No login, database, paid API, or Meta connection.

## Run locally

Requires Node.js 22+ (validated with Node.js 24) and npm.

```sh
npm ci
npm run dev
```

Open the local server on port 3000. In restricted cloud workspaces use `npm ci --cache /workspace/.npm-cache`. Existing checkouts are already isolated; no Git worktree is needed.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Learner workflow

1. Read the campaign brief (Traffic, not Sales).
2. Investigate KPIs, toggle chart metrics/Ad Sets, inspect daily data, and write up to three observations/hypotheses.
3. Allocate exactly 8 million VND in 200,000 VND increments, choose 1–3 targeted actions, explain the strategy, and select 2–3 monitoring metrics with an adjustment rule.
4. Review deterministic assessments, optionally revise once, compare proposals, and print/copy/download the final report.

The optional timer does not terminate the exercise. LocalStorage retains the session on this browser; reset clears learner decisions. No data is sent to a backend. Clipboard fallback downloads a text summary.

## Architecture

- `data/source.xlsx`: original supplied workbook, unchanged.
- `scripts/import_data.py`: reproducible workbook extraction (`python -m pip install openpyxl` if reimporting).
- `data/campaign.json`: 21 typed daily observations, source SHA-256, reporting Reach/Frequency and limitations.
- `types/campaign.ts`: metric, decision and session types.
- `lib/metrics.ts`: aggregation, nullable ratios, VND formatting and budget constraints.
- `lib/actions.ts`: action library and allowed targets.
- `lib/simulation.ts`: standalone validation and deterministic educational assessments.
- `store/session.ts`: browser persistence.
- `components/`: dashboard, decisions and report.
- `tests/`: unit tests and Playwright learner-flow tests.

## Data and evaluation limitations

Totals: Spend 8,000,000 VND; Link Clicks 3,800; LPV 2,444; ATC 132; Purchase 33. Aggregate formulas in Excel have no cached values. Source SUMIF formulas are verified during import and totals are recomputed from the daily observations. Reach/Frequency remain supplied reporting metrics; never add them into campaign unique Reach. Zero denominators produce N/A. Impressions, daily Reach/Frequency, device, placement, and page speed are unavailable; CTR/CPM require additional inputs.

The assessment gives reasons and risks, never unsupported forecasts. The displayed score is **indicative structured points out of 70**, with the remaining **30 points requiring trainer review** of evidence and reasoning. Basic text-length validation prevents empty submissions; it cannot establish meaningful reasoning. No keyword semantic scoring is used. Structured heuristics do not determine a single ideal budget and are not a substitute for trainer judgment. Because the app is fully client-side, rules are inspectable in source/browser bundles; they are not shown as an answer key in learner screens. A future optional semantic evaluator should be server-side, never expose an API key in the client.

Print styling targets one A4 landscape page for normal exercise-length entries. Arbitrarily long free text remains preserved and may span additional pages rather than being truncated. Choose A4 landscape and turn browser headers/footers off. Desktop-first layout includes tablet/mobile fallbacks and accessible daily tables for chart data.

## Browser tests

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright npx playwright install chromium webkit
PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright npx playwright test
```

Playwright config starts a production server after `npm run build`. For the preinstalled cloud Chromium, use `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser -- --project=chromium`. WebKit exercises Safari's engine, not a physical Safari device. PDF layout is checked with Chromium.

## Validation record

The original workbook import reconciles all 21 observations. Six unit tests cover totals, ratios, budget caps, validation, deterministic feedback, alternative allocations and action targeting. Chromium workflow tests cover dashboard controls, persistence, revision, reset, exports, and responsive layout. The representative report is checked as a single-page A4 landscape PDF. WebKit/Safari testing could not run because browser downloads were denied by the environment network policy; allow `cdn.playwright.dev` in environment settings before running the WebKit project. No deployment has been performed.

PostCSS is overridden to patched version 8.5.30, compatible with the framework's PostCSS 8 dependency; the production dependency audit reports no vulnerabilities.

## Deploy to Vercel

1. Push this project to your GitHub repository.
2. In Vercel choose **Add New → Project**, import the repository and select the **Next.js** preset.
3. Root directory: this repository root. Install command: `npm ci`; build command: `npm run build`; output: Next.js default.
4. No environment variables are required. Select Node.js 22 or 24 and deploy.

Alternatively run `npx vercel` from this directory with your own Vercel authentication. Deployment has not been performed by this task.
