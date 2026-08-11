# ERCOT Market Dashboard MVP

A simple dark-mode static dashboard for learning how ERCOT grid conditions affect energy prices.

## Open It

Run the local proxy/static server and open the page:

```powershell
python server.py
```

Then open `http://127.0.0.1:4173/index.html`.

The custom server is needed because browsers block direct cross-origin `fetch` calls from localhost to ERCOT. `server.py` only proxies the six ERCOT dashboard JSON files used by this MVP.

## What It Shows

- Grid snapshot: load, forecast miss, available capacity, reserves, net load, load/capacity ratio
- Price monitor: live real-time hub prices
- Fuel mix: generation by source
- Fuel mix history: gas, wind, solar, coal, nuclear, storage, and other over the selected live time window
- Fuel mix chart mode: line or stacked area
- Renewables: live wind and solar output
- Scarcity watch: reserve ratio, outages, ancillary service price signal
- Congestion view: hub price spreads
- Net load chart: load minus wind and solar over time
- Weather page: Dallas, Houston, Austin, San Antonio, and Midland conditions
- Forecast page: Open-Meteo weather forecast, weather-to-price risk estimate, and saved forecast-vs-actual comparisons
- WeatherNext 2 status: documents the Google access paths needed before it can be connected
- Price spike detector: flags hub prices above $100, $250, $500, and $1,000/MWh
- Export controls: download locally stored snapshots as CSV or JSON
- Trends page: 1-day, 3-day, and 7-day summaries from browser local storage
- Market notes and generated conclusion prompts

## Data Status

The app now pulls live data from ERCOT's open dashboard JSON endpoints:

- `supply-demand.json`
- `daily-prc.json`
- `fuel-mix.json`
- `generation-outages.json`
- `energy-storage-resources.json`
- `system-wide-prices.json`

The local server also proxies current weather from Open-Meteo for the Weather page. The app stores live snapshots in browser `localStorage` under `ercotDashboardSnapshots.v1`. The Trends view summarizes locally collected observations.

The Forecast page stores generated forecast records in browser `localStorage` under `ercotDashboardForecasts.v1`. Once the forecast target time passes and a nearby actual snapshot exists, the app compares predicted price/weather with observed price/weather.

WeatherNext 2 is not connected by default. Google exposes WeatherNext 2 forecast data through Earth Engine, BigQuery, Cloud Storage/Zarr, and Vertex AI early access, which require Google Cloud or Earth Engine setup rather than a simple anonymous API call.

Some deeper fields still need ERCOT Public API report ingestion:

- Day-ahead prices
- Renewable forecasts
- Ancillary service prices
- Longer historical backfills

Suggested refresh cadence:

- Current dashboard data: every 5 minutes
- Public API forecasts, day-ahead prices, ancillary services: hourly or after ERCOT posting
- Historical reconciliation/backfill: nightly once a backend database exists

## Implementation Notes

The app is intentionally dependency-free so the first version is easy to inspect and modify. The charting is drawn with native canvas, and all dashboard rendering lives in `app.js`.
