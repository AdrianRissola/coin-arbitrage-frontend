# Coin Arbitrage Frontend

React dashboard for [coin-arbitrage-backend](https://github.com/AdrianRissola/coin-arbitrage-backend). It shows price differences between cryptocurrency exchanges in real time and the history of recorded opportunities.

This is a personal project. It displays price differences only: it does not trade, and a displayed difference is not a guarantee of profit. The backend calculation ignores trading and withdrawal fees, slippage, liquidity and transfer times.

An earlier version of this README linked a hosted instance at https://coin-arbitrage-frontend.onrender.com/. Its current availability has not been verified.

## Architecture

- Create React App (`react-scripts`) with Material UI, Sass styles and `notistack` notifications.
- `src/App.js` opens a WebSocket to the backend and sends subscription messages such as `{ "channel": "arbitrage", "ticker": "BTC-USDT" }`. The channels used are `arbitrage`, `bestArbitrage` (ticker `ALL`) and `Markets`; responses are routed to the views in `src/components/views/` (arbitrage, best arbitrage, historical, market status).
- `src/service/` calls the backend REST API with Axios: `coin-arbitrage/crypto/markets`, `coin-arbitrage/crypto/available-tickers` and `coin-arbitrage/crypto/historical-arbitrages`.
- `src/params.js` resolves the endpoints from `REACT_APP_WEB_SOCKET_ENDPOINT` and `REACT_APP_API_REST_ENDPOINT`. **If a variable is empty or undefined, it falls back to a hosted backend URL hard-coded in that file**, so configure both variables before running locally to avoid contacting that deployment.
- `webpack.config.js` and `webpack.local.config.js` are custom Webpack configurations that are not used by the package scripts. They define only the two endpoint variables.

## Local setup

Requirements: Node.js and npm (no supported version range is declared in `package.json`) and a running instance of the backend (see its README for the database prerequisites).

```sh
npm ci
cp .env.example .env.development.local
npm run dev
```

`.env.example` points to a backend on `localhost:3001`:

```
REACT_APP_API_REST_ENDPOINT=http://localhost:3001/
REACT_APP_WEB_SOCKET_ENDPOINT=ws://localhost:3001/
```

Both values need the trailing slash. The backend must list `http://localhost:3000` (the default Create React App address) in its allowed origins.

`.gitignore` excludes every `.env.*` file except `.env.example` and `.env.production`, which is tracked on purpose and contains only public endpoint configuration. Never put secrets in any file or variable that reaches the browser: everything in a client bundle is readable by users.

## Scripts

| Command | What it runs |
|---|---|
| `npm run dev`, `npm start` | `react-scripts start` |
| `npm run build` | `react-dotenv` followed by `react-scripts build` |
| `npm run test:security` | dependency-free Node tests for the configuration and logging fixes (uses the built-in `node:test` runner: Node 18 or newer) |
| `npm test` | `react-scripts test` (see limitations) |

`react-dotenv` writes `public/env.js` (and reformats `public/index.html`) from the process environment and a `.env` file, keeping only the names in the `react-dotenv.whitelist` of `package.json`: `REACT_APP_API_REST_ENDPOINT` and `REACT_APP_WEB_SOCKET_ENDPOINT`. Set these two variables for the build. Because the file is tracked, review `git status` after a build and do not commit generated content.

## Known limitations

- `src/App.test.js` is the unchanged Create React App scaffold ("learn react") and does not test this application. Rendering `App` also opens a real WebSocket and the service modules issue HTTP requests when imported, so it is not a safe unit test target as it stands.
- `npm run test:security` covers configuration and logging only; there is no UI regression suite.
- `test:security` was verified with Node v25.2.1 and npm 11.6.2; that is the tested environment, not a supported-version guarantee, and the legacy dependencies may not support every Node version.
- Dependencies were not updated and no `npm audit` review has been done.
- Production deployment hardening has not been completed.

## Project milestones

A selection of existing commits (see the full history on GitHub; this list is not a complete changelog):

| Commit | Change |
|---|---|
| [`5e8a450`](https://github.com/AdrianRissola/coin-arbitrage-frontend/commit/5e8a450) | Create React App scaffold |
| [`9cb2cde`](https://github.com/AdrianRissola/coin-arbitrage-frontend/commit/9cb2cde) | historical arbitrage feature |
| [`2865d08`](https://github.com/AdrianRissola/coin-arbitrage-frontend/commit/2865d08) | historical data requested through the REST API instead of WebSocket |
| [`820d0e3`](https://github.com/AdrianRissola/coin-arbitrage-frontend/commit/820d0e3) | best arbitrage view supporting multiple quote currencies |
