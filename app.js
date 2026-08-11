const ERCOT_DASHBOARD_BASE = "/api/ercot";
const STORAGE_KEY = "ercotDashboardSnapshots.v1";
const LAST_DATA_KEY = "ercotDashboardLastData.v1";
const FORECAST_KEY = "ercotDashboardForecasts.v1";
const POLL_MS = 5 * 60 * 1000;
const PRICE_SPIKE_THRESHOLDS = [100, 250, 500, 1000];

const sampleData = {
  source: "sample",
  lastUpdated: "2026-06-08T12:35:00-05:00",
  snapshot: {
    loadMw: 68420,
    forecastLoadMw: null,
    availableCapacityMw: 80250,
    reservesMw: 11830,
    netLoadMw: 48550,
    outageMw: 7450
  },
  prices: {
    hubs: [
      { name: "North", realtime: 72.4, dayAhead: null },
      { name: "Houston", realtime: 81.7, dayAhead: null },
      { name: "South", realtime: 69.2, dayAhead: null },
      { name: "West", realtime: 38.5, dayAhead: null }
    ],
    trend: [
      { hour: "07:00", north: 34, houston: 37, west: 22 },
      { hour: "08:00", north: 41, houston: 45, west: 27 },
      { hour: "09:00", north: 39, houston: 44, west: 24 },
      { hour: "10:00", north: 48, houston: 52, west: 28 },
      { hour: "11:00", north: 61, houston: 68, west: 33 },
      { hour: "12:00", north: 72, houston: 82, west: 39 }
    ].map((point) => ({ ...point, south: point.north - 2, epoch: Date.now() }))
  },
  fuelMix: [
    { name: "Gas", mw: 32600, color: "#62a8ff" },
    { name: "Wind", mw: 12400, color: "#50d3c6" },
    { name: "Solar", mw: 7470, color: "#f4c95d" },
    { name: "Coal", mw: 6450, color: "#ffad5a" },
    { name: "Nuclear", mw: 5120, color: "#b38cff" },
    { name: "Storage", mw: 380, color: "#35d07f" }
  ],
  renewables: {
    windForecastMw: null,
    windActualMw: 12400,
    solarForecastMw: null,
    solarActualMw: 7470,
    trend: [
      { hour: "07:00", windError: 0, solarError: 0 },
      { hour: "08:00", windError: 0, solarError: 0 },
      { hour: "09:00", windError: 0, solarError: 0 },
      { hour: "10:00", windError: 0, solarError: 0 },
      { hour: "11:00", windError: 0, solarError: 0 },
      { hour: "12:00", windError: 0, solarError: 0 }
    ]
  },
  ancillary: {
    responsiveReservePrice: null,
    nonSpinPrice: null,
    ecrsPrice: null
  },
  fuelTrend: [
    { label: "07:00", epoch: Date.now() - 5 * 60 * 60 * 1000, gas: 28600, wind: 15000, solar: 1200, coal: 6400, nuclear: 5100 },
    { label: "08:00", epoch: Date.now() - 4 * 60 * 60 * 1000, gas: 29800, wind: 14400, solar: 3100, coal: 6450, nuclear: 5120 },
    { label: "09:00", epoch: Date.now() - 3 * 60 * 60 * 1000, gas: 30400, wind: 13800, solar: 5200, coal: 6420, nuclear: 5120 },
    { label: "10:00", epoch: Date.now() - 2 * 60 * 60 * 1000, gas: 31500, wind: 13100, solar: 6500, coal: 6460, nuclear: 5120 },
    { label: "11:00", epoch: Date.now() - 60 * 60 * 1000, gas: 32300, wind: 12600, solar: 7200, coal: 6440, nuclear: 5120 },
    { label: "12:00", epoch: Date.now(), gas: 32600, wind: 12400, solar: 7470, coal: 6450, nuclear: 5120 }
  ].map((point) => ({ ...point, storage: point.storage ?? 0, other: point.other ?? 0 })),
  loadTrend: [
    { label: "07:00", epoch: Date.now() - 5 * 60 * 60 * 1000, load: 62000, capacity: 77000, forecast: null },
    { label: "08:00", epoch: Date.now() - 4 * 60 * 60 * 1000, load: 63500, capacity: 77200, forecast: null },
    { label: "09:00", epoch: Date.now() - 3 * 60 * 60 * 1000, load: 64800, capacity: 77800, forecast: null },
    { label: "10:00", epoch: Date.now() - 2 * 60 * 60 * 1000, load: 66100, capacity: 78400, forecast: null },
    { label: "11:00", epoch: Date.now() - 60 * 60 * 1000, load: 67300, capacity: 79300, forecast: null },
    { label: "12:00", epoch: Date.now(), load: 68420, capacity: 80250, forecast: null }
  ],
  netLoadTrend: [
    { label: "07:00", epoch: Date.now() - 5 * 60 * 60 * 1000, load: 62000, netLoad: 45800 },
    { label: "08:00", epoch: Date.now() - 4 * 60 * 60 * 1000, load: 63500, netLoad: 46000 },
    { label: "09:00", epoch: Date.now() - 3 * 60 * 60 * 1000, load: 64800, netLoad: 45800 },
    { label: "10:00", epoch: Date.now() - 2 * 60 * 60 * 1000, load: 66100, netLoad: 46500 },
    { label: "11:00", epoch: Date.now() - 60 * 60 * 1000, load: 67300, netLoad: 47500 },
    { label: "12:00", epoch: Date.now(), load: 68420, netLoad: 48550 }
  ],
  weather: {
    lastUpdated: null,
    locations: [
      { name: "Dallas", temperatureF: 93, humidityPct: 45, cloudCoverPct: 20, windSpeedMph: 11, windGustMph: 18 },
      { name: "Houston", temperatureF: 91, humidityPct: 61, cloudCoverPct: 35, windSpeedMph: 9, windGustMph: 16 },
      { name: "Austin", temperatureF: 94, humidityPct: 39, cloudCoverPct: 18, windSpeedMph: 10, windGustMph: 17 },
      { name: "San Antonio", temperatureF: 96, humidityPct: 36, cloudCoverPct: 15, windSpeedMph: 12, windGustMph: 20 },
      { name: "Midland", temperatureF: 98, humidityPct: 22, cloudCoverPct: 8, windSpeedMph: 15, windGustMph: 24 }
    ]
  }
};

let currentData = sampleData;
let currentView = "overview";
let liveTimeframeHours = 6;
let trendTimeframeDays = 7;
let fuelChartType = "line";
let forecastHorizonHours = 12;

const formatMw = (value) => Number.isFinite(value) ? `${Math.round(value).toLocaleString()} MW` : "Unavailable";
const formatMoney = (value) => Number.isFinite(value) ? `$${value.toFixed(2)}` : "Unavailable";
const pct = (value, total) => total ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const max = (values) => values.length ? Math.max(...values) : null;
const min = (values) => values.length ? Math.min(...values) : null;

function filterByHours(records, hours) {
  const dated = records.filter((record) => Number.isFinite(record.epoch));
  if (!dated.length) return records;
  const latest = Math.max(...dated.map((record) => record.epoch));
  const cutoff = latest - hours * 60 * 60 * 1000;
  return dated.filter((record) => record.epoch >= cutoff);
}

function filterByDays(records, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return records.filter((snapshot) => Date.parse(snapshot.collectedAt) >= cutoff);
}

function getStoredSnapshots() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function getStoredForecasts() {
  try {
    return JSON.parse(localStorage.getItem(FORECAST_KEY) || "[]");
  } catch {
    return [];
  }
}

function setStoredForecasts(forecasts) {
  localStorage.setItem(FORECAST_KEY, JSON.stringify(forecasts));
}

function averageWeather(weather) {
  const locations = weather?.locations || [];
  return {
    temperatureF: average(locations.map((item) => item.temperatureF).filter(Number.isFinite)),
    cloudCoverPct: average(locations.map((item) => item.cloudCoverPct).filter(Number.isFinite)),
    windSpeedMph: average(locations.map((item) => item.windSpeedMph).filter(Number.isFinite)),
    humidityPct: average(locations.map((item) => item.humidityPct).filter(Number.isFinite))
  };
}

function setStoredSnapshots(snapshots) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

function compactStoredSnapshots(snapshots) {
  const cutoff = Date.now() - 8 * 24 * 60 * 60 * 1000;
  const bySlot = new Map();
  snapshots
    .filter((snapshot) => Date.parse(snapshot.collectedAt) >= cutoff)
    .forEach((snapshot) => {
      const slot = Math.floor(Date.parse(snapshot.collectedAt) / (5 * 60 * 1000));
      bySlot.set(slot, snapshot);
    });
  return Array.from(bySlot.values()).sort((a, b) => Date.parse(a.collectedAt) - Date.parse(b.collectedAt));
}

function storeSnapshot(data) {
  if (data.source !== "live") return;
  const snapshot = {
    collectedAt: new Date().toISOString(),
    lastUpdated: data.lastUpdated,
    loadMw: data.snapshot.loadMw,
    availableCapacityMw: data.snapshot.availableCapacityMw,
    reservesMw: data.snapshot.reservesMw,
    netLoadMw: data.snapshot.netLoadMw,
    outageMw: data.snapshot.outageMw,
    houstonPrice: data.prices.hubs.find((hub) => hub.name === "Houston")?.realtime ?? null,
    southPrice: data.prices.hubs.find((hub) => hub.name === "South")?.realtime ?? null,
    westPrice: data.prices.hubs.find((hub) => hub.name === "West")?.realtime ?? null,
    gasMw: data.fuelMix.find((source) => source.name === "Gas")?.mw ?? null,
    windMw: data.renewables.windActualMw,
    solarMw: data.renewables.solarActualMw,
    coalMw: data.fuelMix.find((source) => source.name === "Coal")?.mw ?? null,
    nuclearMw: data.fuelMix.find((source) => source.name === "Nuclear")?.mw ?? null,
    storageMw: data.fuelMix.find((source) => source.name === "Storage")?.mw ?? null,
    otherMw: data.fuelMix.find((source) => source.name === "Other")?.mw ?? null,
    avgTemperatureF: averageWeather(data.weather).temperatureF,
    avgCloudCoverPct: averageWeather(data.weather).cloudCoverPct,
    avgWindSpeedMph: averageWeather(data.weather).windSpeedMph
  };
  setStoredSnapshots(compactStoredSnapshots([...getStoredSnapshots(), snapshot]));
}

function latestFromArray(records, timeField = "epoch") {
  return records
    .filter((record) => Number.isFinite(Number(record[timeField])))
    .sort((a, b) => Number(a[timeField]) - Number(b[timeField]))
    .at(-1);
}

function latestFuelRecord(fuelJson) {
  const allRecords = [];
  Object.values(fuelJson.data || {}).forEach((day) => {
    Object.entries(day).forEach(([timestamp, values]) => allRecords.push({ timestamp, values }));
  });
  return allRecords.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)).at(-1);
}

function normalizeFuelTrend(fuelJson) {
  const allRecords = [];
  Object.values(fuelJson.data || {}).forEach((day) => {
    Object.entries(day).forEach(([timestamp, values]) => {
      allRecords.push({
        label: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        epoch: Date.parse(timestamp),
        gas: Number(values["Natural Gas"]?.gen) || 0,
        wind: Number(values.Wind?.gen) || 0,
        solar: Number(values.Solar?.gen) || 0,
        coal: Number(values["Coal and Lignite"]?.gen) || 0,
        nuclear: Number(values.Nuclear?.gen) || 0,
        storage: Number(values["Power Storage"]?.gen) || 0,
        other: Number(values.Other?.gen) || 0
      });
    });
  });
  return allRecords
    .filter((record) => Number.isFinite(record.epoch))
    .sort((a, b) => a.epoch - b.epoch);
}

function normalizeLoadTrend(supplyJson) {
  return (supplyJson.data || [])
    .map((row) => ({
      label: new Date(row.epoch || row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      epoch: Number(row.epoch) || Date.parse(row.timestamp),
      load: Number(row.demand) || 0,
      capacity: Number(row.capacity) || 0,
      forecast: Number(row.forecast) || null
    }))
    .filter((record) => Number.isFinite(record.epoch))
    .sort((a, b) => a.epoch - b.epoch);
}

function buildNetLoadTrend(loadTrend, fuelTrend) {
  const fuelBySlot = new Map(
    fuelTrend.map((record) => [Math.round(record.epoch / (5 * 60 * 1000)), record])
  );
  return loadTrend
    .map((loadRecord) => {
      const fuelRecord = fuelBySlot.get(Math.round(loadRecord.epoch / (5 * 60 * 1000)));
      if (!fuelRecord) return null;
      return {
        label: loadRecord.label,
        epoch: loadRecord.epoch,
        load: loadRecord.load,
        netLoad: loadRecord.load - fuelRecord.wind - fuelRecord.solar
      };
    })
    .filter(Boolean);
}

function latestOutageRecord(outageJson) {
  const current = Object.values(outageJson.current || {});
  return current.sort((a, b) => Date.parse(a.deliveryTime) - Date.parse(b.deliveryTime)).at(-1);
}

function latestStorageRecord(storageJson) {
  const records = [
    ...(storageJson.previousDay?.data || []),
    ...(storageJson.currentDay?.data || [])
  ];
  return latestFromArray(records);
}

function normalizeFuelMix(fuelJson, storageJson) {
  const latest = latestFuelRecord(fuelJson);
  const values = latest?.values || {};
  const storage = latestStorageRecord(storageJson);
  const storageMw = Number(storage?.netOutput ?? values["Power Storage"]?.gen ?? 0);
  const map = [
    ["Gas", values["Natural Gas"]?.gen, "#62a8ff"],
    ["Wind", values.Wind?.gen, "#50d3c6"],
    ["Solar", values.Solar?.gen, "#f4c95d"],
    ["Coal", values["Coal and Lignite"]?.gen, "#ffad5a"],
    ["Nuclear", values.Nuclear?.gen, "#b38cff"],
    ["Storage", storageMw, "#35d07f"],
    ["Hydro", values.Hydro?.gen, "#7bdff2"],
    ["Other", values.Other?.gen, "#c6d0dd"]
  ];

  return map
    .map(([name, mw, color]) => ({ name, mw: Number(mw) || 0, color }))
    .filter((source) => Math.abs(source.mw) > 1);
}

function normalizePrices(priceJson) {
  const rows = priceJson.rtSppData || [];
  const latest = latestFromArray(rows, "interval") || rows.at(-1) || {};
  const trendRows = rows;
  return {
    hubs: [
      { name: "North", realtime: Number(latest.hbNorth), dayAhead: null },
      { name: "Houston", realtime: Number(latest.hbHouston), dayAhead: null },
      { name: "South", realtime: Number(latest.hbSouth), dayAhead: null },
      { name: "West", realtime: Number(latest.hbWest), dayAhead: null }
    ],
    trend: trendRows.map((row) => ({
      hour: row.intervalEnding || new Date(row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      epoch: Number(row.interval) || Date.parse(row.timestamp),
      north: Number(row.hbNorth) || 0,
      houston: Number(row.hbHouston) || 0,
      south: Number(row.hbSouth) || 0,
      west: Number(row.hbWest) || 0
    }))
  };
}

function normalizeDashboardData(parts) {
  const supplyLatest = latestFromArray(parts.supply.data || {});
  const fuelMix = normalizeFuelMix(parts.fuel, parts.storage);
  const fuelTrend = normalizeFuelTrend(parts.fuel);
  const loadTrend = normalizeLoadTrend(parts.supply);
  const netLoadTrend = buildNetLoadTrend(loadTrend, fuelTrend);
  const prices = normalizePrices(parts.prices);
  const wind = fuelMix.find((source) => source.name === "Wind")?.mw || 0;
  const solar = fuelMix.find((source) => source.name === "Solar")?.mw || 0;
  const reservesMw = Number(String(parts.prc.current_condition?.prc_value || "").replaceAll(",", ""));
  const outageLatest = latestOutageRecord(parts.outages);
  const loadMw = Number(supplyLatest?.demand) || 0;
  const availableCapacityMw = Number(supplyLatest?.capacity) || 0;

  return {
    source: "live",
    lastUpdated: parts.supply.lastUpdated || parts.prices.lastUpdated || new Date().toISOString(),
    snapshot: {
      loadMw,
      forecastLoadMw: Number(supplyLatest?.forecast) || null,
      availableCapacityMw,
      reservesMw,
      netLoadMw: loadMw - wind - solar,
      outageMw: Number(outageLatest?.Combined?.total ?? parts.outages.currentOutages) || 0
    },
    prices,
    fuelMix,
    renewables: {
      windForecastMw: null,
      windActualMw: wind,
      solarForecastMw: null,
      solarActualMw: solar,
      trend: fuelMix.length ? prices.trend.map((point) => ({ hour: point.hour, windError: 0, solarError: 0 })) : []
    },
    ancillary: {
      responsiveReservePrice: null,
      nonSpinPrice: null,
      ecrsPrice: null
    },
    fuelTrend,
    loadTrend,
    netLoadTrend,
    weather: parts.weather || sampleData.weather
  };
}

async function fetchJson(path) {
  const response = await fetch(`${ERCOT_DASHBOARD_BASE}/${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

async function fetchWeather() {
  const response = await fetch("/api/weather/current", { cache: "no-store" });
  if (!response.ok) throw new Error(`weather returned ${response.status}`);
  return response.json();
}

async function fetchWeatherForecast() {
  const response = await fetch("/api/weather/forecast", { cache: "no-store" });
  if (!response.ok) throw new Error(`weather forecast returned ${response.status}`);
  return response.json();
}

async function fetchLiveData() {
  const [supply, prc, fuel, outages, storage, prices, weather, weatherForecast] = await Promise.all([
    fetchJson("supply-demand.json"),
    fetchJson("daily-prc.json"),
    fetchJson("fuel-mix.json"),
    fetchJson("generation-outages.json"),
    fetchJson("energy-storage-resources.json"),
    fetchJson("system-wide-prices.json"),
    fetchWeather(),
    fetchWeatherForecast()
  ]);
  const data = normalizeDashboardData({ supply, prc, fuel, outages, storage, prices, weather });
  data.weatherForecast = weatherForecast;
  data.forecastPrice = buildForecastPriceSeries(data);
  return data;
}

function setStatus(text, tone) {
  document.getElementById("dataStatus").textContent = text;
  document.getElementById("statusDot").className = `status-dot ${tone || ""}`;
}

function createMetric(label, value, subtext, tone = "") {
  return `
    <div class="metric-card">
      <div class="metric-label">${label}</div>
      <div class="metric-value ${tone}">${value}</div>
      <div class="metric-subtext">${subtext}</div>
    </div>
  `;
}

function renderSnapshot(data) {
  const delta = Number.isFinite(data.snapshot.forecastLoadMw) ? data.snapshot.loadMw - data.snapshot.forecastLoadMw : null;
  const reservePct = data.snapshot.loadMw ? (data.snapshot.reservesMw / data.snapshot.loadMw) * 100 : 0;
  const loadVsCapacity = data.snapshot.availableCapacityMw ? (data.snapshot.loadMw / data.snapshot.availableCapacityMw) * 100 : 0;

  document.getElementById("lastUpdated").textContent = `Updated ${new Date(data.lastUpdated).toLocaleString()}`;
  document.getElementById("snapshotGrid").innerHTML = [
    createMetric("Current Load", formatMw(data.snapshot.loadMw), "Actual ERCOT demand", "neutral"),
    createMetric("Forecast Miss", delta === null ? "Unavailable" : `${delta > 0 ? "+" : ""}${formatMw(delta)}`, delta === null ? "Needs forecast report" : "Actual minus forecast", delta > 0 ? "warning" : "positive"),
    createMetric("Available Capacity", formatMw(data.snapshot.availableCapacityMw), "Capacity available to run"),
    createMetric("Operating Reserves", formatMw(data.snapshot.reservesMw), `${reservePct.toFixed(1)}% of load`, reservePct < 10 ? "danger" : reservePct < 15 ? "warning" : "positive"),
    createMetric("Net Load", formatMw(data.snapshot.netLoadMw), "Load minus wind and solar"),
    createMetric("Load / Capacity", `${loadVsCapacity.toFixed(1)}%`, "Higher means tighter grid", loadVsCapacity > 88 ? "warning" : "positive")
  ].join("");
}

function renderPrices(data) {
  document.getElementById("priceGrid").innerHTML = data.prices.hubs
    .map((hub) => {
      const spread = Number.isFinite(hub.dayAhead) ? hub.realtime - hub.dayAhead : null;
      return `
        <div class="price-card">
          <div class="price-name">${hub.name}</div>
          <div class="price-value">${formatMoney(hub.realtime)}</div>
          <div class="metric-subtext ${spread > 20 ? "warning" : "neutral"}">${spread === null ? "DA: Public API needed" : `RT - DA: ${spread > 0 ? "+" : ""}${formatMoney(spread)}`}</div>
        </div>
      `;
    })
    .join("");
}

function renderFuelMix(data) {
  const total = data.fuelMix.reduce((sum, source) => sum + Math.max(source.mw, 0), 0);
  const largest = Math.max(...data.fuelMix.map((source) => Math.abs(source.mw)), 1);

  document.getElementById("fuelMix").innerHTML = data.fuelMix
    .map((source) => `
      <div class="bar-row">
        <div>${source.name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(Math.abs(source.mw) / largest) * 100}%; background: ${source.color}"></div>
        </div>
        <div class="bar-value">${source.mw < 0 ? "-" : ""}${pct(Math.abs(source.mw), total)}</div>
      </div>
    `)
    .join("");
}

function renderRenewables(data) {
  const windError = Number.isFinite(data.renewables.windForecastMw) ? data.renewables.windActualMw - data.renewables.windForecastMw : null;
  const solarError = Number.isFinite(data.renewables.solarForecastMw) ? data.renewables.solarActualMw - data.renewables.solarForecastMw : null;
  const renewableShare = data.snapshot.loadMw ? ((data.renewables.windActualMw + data.renewables.solarActualMw) / data.snapshot.loadMw) * 100 : 0;

  document.getElementById("renewablesGrid").innerHTML = [
    createMetric("Wind Output", formatMw(data.renewables.windActualMw), windError === null ? "Forecast needs Public API" : `${windError > 0 ? "+" : ""}${formatMw(windError)} vs forecast`, windError < -1000 ? "warning" : "neutral"),
    createMetric("Solar Output", formatMw(data.renewables.solarActualMw), solarError === null ? "Forecast needs Public API" : `${solarError > 0 ? "+" : ""}${formatMw(solarError)} vs forecast`, solarError < -750 ? "warning" : "neutral"),
    createMetric("Renewable Share", `${renewableShare.toFixed(1)}%`, "Wind + solar over load", "positive")
  ].join("");
}

function renderScarcity(data) {
  const reservePct = data.snapshot.loadMw ? (data.snapshot.reservesMw / data.snapshot.loadMw) * 100 : 0;
  const ancillaryValues = Object.values(data.ancillary).filter(Number.isFinite);
  const avgAncillary = average(ancillaryValues);

  document.getElementById("scarcityGrid").innerHTML = [
    createMetric("Reserve Ratio", `${reservePct.toFixed(1)}%`, "Reserves divided by load", reservePct < 10 ? "danger" : reservePct < 15 ? "warning" : "positive"),
    createMetric("Outages", formatMw(data.snapshot.outageMw), "Unavailable generation", data.snapshot.outageMw > 9000 ? "warning" : "neutral"),
    createMetric("Avg AS Price", formatMoney(avgAncillary), avgAncillary === null ? "Public API needed" : "Ancillary service signal", avgAncillary > 50 ? "warning" : "neutral")
  ].join("");

  const steps = [
    { label: "Normal", test: reservePct >= 15, color: "positive" },
    { label: "Watch", test: reservePct < 15 && reservePct >= 10, color: "warning" },
    { label: "Tight", test: reservePct < 10 && reservePct >= 6, color: "danger" },
    { label: "Scarcity", test: reservePct < 6, color: "danger" }
  ];

  document.getElementById("scarcityBand").innerHTML = steps
    .map((step) => `<div class="risk-step ${step.test ? `active ${step.color}` : ""}">${step.label}</div>`)
    .join("");
}

function renderCongestion(data) {
  const hubMap = Object.fromEntries(data.prices.hubs.map((hub) => [hub.name, hub.realtime]));
  const spreads = [
    { name: "Houston - West", value: hubMap.Houston - hubMap.West },
    { name: "North - West", value: hubMap.North - hubMap.West },
    { name: "South - West", value: hubMap.South - hubMap.West },
    { name: "Houston - North", value: hubMap.Houston - hubMap.North }
  ];

  document.getElementById("spreadGrid").innerHTML = spreads
    .map((spread) => `
      <div class="spread-card">
        <div class="spread-name">${spread.name}</div>
        <div class="spread-value ${Math.abs(spread.value) > 25 ? "warning" : "neutral"}">${spread.value > 0 ? "+" : ""}${formatMoney(spread.value)}</div>
      </div>
    `)
    .join("");
}

function renderSpikeList(data) {
  const spikes = [];
  data.prices.trend.forEach((point) => {
    [
      ["North", point.north],
      ["Houston", point.houston],
      ["South", point.south],
      ["West", point.west]
    ].forEach(([hub, price]) => {
      const threshold = PRICE_SPIKE_THRESHOLDS.filter((value) => price >= value).at(-1);
      if (threshold) spikes.push({ hub, price, threshold, hour: point.hour, epoch: point.epoch });
    });
  });

  const recentSpikes = spikes
    .sort((a, b) => b.epoch - a.epoch || b.price - a.price)
    .slice(0, 8);

  document.getElementById("spikeList").innerHTML = recentSpikes.length
    ? recentSpikes.map((spike) => `
      <div class="conclusion">
        <strong>${spike.hub} crossed $${spike.threshold}/MWh</strong>
        <span>${spike.hour}: ${formatMoney(spike.price)}. Check reserves, net load, and hub spreads around this interval.</span>
      </div>
    `).join("")
    : `<div class="conclusion"><strong>No major spikes</strong><span>No hub exceeded $${PRICE_SPIKE_THRESHOLDS[0]}/MWh in the loaded price window.</span></div>`;
}

function renderWeather(data) {
  const weather = data.weather || sampleData.weather;
  document.getElementById("weatherUpdated").textContent = weather.lastUpdated
    ? `Updated ${new Date(weather.lastUpdated).toLocaleString()}`
    : "Sample weather";
  document.getElementById("weatherGrid").innerHTML = weather.locations.map((location) => {
    const heatTone = location.temperatureF >= 100 ? "danger" : location.temperatureF >= 90 ? "warning" : "neutral";
    return createMetric(
      location.name,
      `${Math.round(location.temperatureF)} F`,
      `${Math.round(location.windSpeedMph)} mph wind, ${Math.round(location.cloudCoverPct)}% cloud`,
      heatTone
    );
  }).join("");

  const temps = weather.locations.map((location) => location.temperatureF).filter(Number.isFinite);
  const clouds = weather.locations.map((location) => location.cloudCoverPct).filter(Number.isFinite);
  const winds = weather.locations.map((location) => location.windSpeedMph).filter(Number.isFinite);
  const notes = [
    ["Load pressure", `Average city temperature is ${Math.round(average(temps))} F. Higher heat usually lifts cooling demand and net load.`],
    ["Solar risk", `Average cloud cover is ${Math.round(average(clouds))}%. Higher cloud cover can reduce solar output and raise net load.`],
    ["Wind context", `Average wind speed is ${Math.round(average(winds))} mph. Surface wind is only a rough proxy for wind generation, but sharp changes are worth watching.`]
  ];
  document.getElementById("weatherNotes").innerHTML = notes
    .map(([title, body]) => `<div class="conclusion"><strong>${title}</strong><span>${body}</span></div>`)
    .join("");
}

function averageHubPrice(data) {
  const values = data.prices.hubs.map((hub) => hub.realtime).filter(Number.isFinite);
  return average(values) || 0;
}

function buildWeatherPriceModel(data) {
  const history = getStoredSnapshots().filter((item) =>
    Number.isFinite(item.avgTemperatureF) &&
    Number.isFinite(item.avgCloudCoverPct) &&
    Number.isFinite(item.avgWindSpeedMph) &&
    Number.isFinite(item.houstonPrice)
  );
  const recentWeather = averageWeather(data.weather);
  const baselinePrice = averageHubPrice(data);
  const baselineNetLoad = data.snapshot.netLoadMw;

  if (history.length < 12) {
    return {
      source: "default",
      baselineTemp: recentWeather.temperatureF || 85,
      baselineCloud: recentWeather.cloudCoverPct || 30,
      baselineWind: recentWeather.windSpeedMph || 10,
      baselinePrice,
      baselineNetLoad,
      tempSlope: 1.6,
      cloudSlope: 0.25,
      windSlope: -0.8,
      netLoadSlope: 2.5
    };
  }

  const avgTemp = average(history.map((item) => item.avgTemperatureF));
  const avgCloud = average(history.map((item) => item.avgCloudCoverPct));
  const avgWind = average(history.map((item) => item.avgWindSpeedMph));
  const avgPrice = average(history.map((item) => item.houstonPrice));
  return {
    source: "local",
    baselineTemp: avgTemp,
    baselineCloud: avgCloud,
    baselineWind: avgWind,
    baselinePrice: avgPrice,
    baselineNetLoad: average(history.map((item) => item.netLoadMw).filter(Number.isFinite)) || baselineNetLoad,
    tempSlope: avgPrice / Math.max(avgTemp, 1) * 0.35,
    cloudSlope: 0.18,
    windSlope: -0.5,
    netLoadSlope: 2.0
  };
}

function buildForecastPriceSeries(data) {
  const forecast = data.weatherForecast?.hourly || [];
  const model = buildWeatherPriceModel(data);
  const currentTemp = averageWeather(data.weather).temperatureF || model.baselineTemp;
  const currentNetLoad = data.snapshot.netLoadMw;
  return forecast.map((point) => {
    const tempDelta = point.temperatureF - model.baselineTemp;
    const cloudDelta = point.cloudCoverPct - model.baselineCloud;
    const windDelta = point.windSpeedMph - model.baselineWind;
    const projectedNetLoad = currentNetLoad + (point.temperatureF - currentTemp) * 450 + point.cloudCoverPct * 45 - point.windSpeedMph * 85;
    const netLoadDelta = (projectedNetLoad - model.baselineNetLoad) / 1000;
    const price = Math.max(
      0,
      model.baselinePrice +
        tempDelta * model.tempSlope +
        cloudDelta * model.cloudSlope +
        windDelta * model.windSlope +
        netLoadDelta * model.netLoadSlope
    );
    const risk = price >= 250 ? "High" : price >= 100 ? "Watch" : projectedNetLoad > currentNetLoad + 3000 ? "Watch" : "Normal";
    return {
      targetTime: point.time,
      epoch: Date.parse(point.time),
      label: new Date(point.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temperatureF: point.temperatureF,
      cloudCoverPct: point.cloudCoverPct,
      windSpeedMph: point.windSpeedMph,
      projectedNetLoad,
      predictedPrice: price,
      risk,
      modelSource: model.source
    };
  });
}

function storeForecastSeries(data) {
  const generatedAt = new Date().toISOString();
  const cutoff = Date.now() - 4 * 24 * 60 * 60 * 1000;
  const newForecasts = (data.forecastPrice || []).map((point) => ({
    generatedAt,
    targetTime: point.targetTime,
    predictedPrice: point.predictedPrice,
    projectedNetLoad: point.projectedNetLoad,
    forecastTemperatureF: point.temperatureF,
    forecastCloudCoverPct: point.cloudCoverPct,
    forecastWindSpeedMph: point.windSpeedMph,
    risk: point.risk,
    modelSource: point.modelSource
  }));
  const combined = [...getStoredForecasts(), ...newForecasts]
    .filter((item) => Date.parse(item.generatedAt) >= cutoff);
  const byKey = new Map();
  combined.forEach((item) => byKey.set(`${item.generatedAt}-${item.targetTime}`, item));
  setStoredForecasts(Array.from(byKey.values()));
}

function findActualForForecast(forecast, snapshots) {
  const target = Date.parse(forecast.targetTime);
  return snapshots
    .filter((snapshot) => Math.abs(Date.parse(snapshot.collectedAt) - target) <= 35 * 60 * 1000)
    .sort((a, b) => Math.abs(Date.parse(a.collectedAt) - target) - Math.abs(Date.parse(b.collectedAt) - target))
    .at(0);
}

function renderForecast(data) {
  const forecast = filterByHours(data.forecastPrice || [], forecastHorizonHours);
  const highest = forecast.reduce((best, point) => point.predictedPrice > (best?.predictedPrice || 0) ? point : best, null);
  document.getElementById("forecastUpdated").textContent = data.weatherForecast?.lastUpdated
    ? `Updated ${new Date(data.weatherForecast.lastUpdated).toLocaleString()}`
    : "Forecast unavailable";
  document.getElementById("forecastMetricGrid").innerHTML = [
    createMetric("Source", "Open-Meteo", "Working forecast source", "positive"),
    createMetric("WeatherNext 2", "Not connected", "No unauthenticated free API detected", "warning"),
    createMetric("Peak Forecast Price", formatMoney(highest?.predictedPrice), highest ? `${highest.label} ${highest.risk} risk` : "No forecast loaded", highest?.predictedPrice >= 100 ? "warning" : "neutral"),
    createMetric("Model", highest?.modelSource === "local" ? "Local fit" : "Default", "Uses local history when enough samples exist"),
    createMetric("Horizon", `${forecastHorizonHours}h`, "Selected forecast window"),
    createMetric("Comparisons", `${renderForecastComparisons(false).length}`, "Completed forecast checks")
  ].join("");

  drawLineChart(
    "forecastWeatherChart",
    [
      { name: "Temp F", color: "#ffad5a", values: forecast.map((p) => ({ label: p.label, value: p.temperatureF })) },
      { name: "Cloud %", color: "#c6d0dd", values: forecast.map((p) => ({ label: p.label, value: p.cloudCoverPct })) },
      { name: "Wind mph", color: "#50d3c6", values: forecast.map((p) => ({ label: p.label, value: p.windSpeedMph })) }
    ],
    { format: (value) => `${Math.round(value)}` }
  );
  drawLineChart(
    "forecastPriceChart",
    [
      { name: "Predicted price", color: "#f4c95d", values: forecast.map((p) => ({ label: p.label, value: p.predictedPrice })) },
      { name: "Projected net load", color: "#62a8ff", values: forecast.map((p) => ({ label: p.label, value: p.projectedNetLoad / 1000 })) }
    ],
    { format: (value) => `${Math.round(value)}` }
  );
  renderForecastComparisons(true);
  renderWeatherNextStatus();
}

function renderForecastComparisons(writeDom) {
  const now = Date.now();
  const snapshots = getStoredSnapshots();
  const completed = getStoredForecasts()
    .filter((forecast) => Date.parse(forecast.targetTime) <= now)
    .map((forecast) => ({ forecast, actual: findActualForForecast(forecast, snapshots) }))
    .filter((item) => item.actual)
    .slice(-8)
    .reverse();

  if (writeDom) {
    document.getElementById("forecastComparisonList").innerHTML = completed.length
      ? completed.map(({ forecast, actual }) => {
          const priceError = actual.houstonPrice - forecast.predictedPrice;
          const tempError = Number.isFinite(actual.avgTemperatureF) && Number.isFinite(forecast.forecastTemperatureF)
            ? `${(actual.avgTemperatureF - forecast.forecastTemperatureF).toFixed(1)} F`
            : "unavailable";
          return `
            <div class="conclusion">
              <strong>${new Date(forecast.targetTime).toLocaleString()}</strong>
              <span>Price error: ${formatMoney(priceError)}. Temperature error: ${tempError}. Forecast ${forecast.risk}; actual Houston ${formatMoney(actual.houstonPrice)}.</span>
            </div>
          `;
        }).join("")
      : `<div class="conclusion"><strong>No completed comparisons yet</strong><span>Forecasts are saved now. Once their target time passes and an actual snapshot exists nearby, comparisons will appear here.</span></div>`;
  }
  return completed;
}

function renderWeatherNextStatus() {
  document.getElementById("weatherNextStatus").innerHTML = `
    <div class="conclusion">
      <strong>Not freely connected in this local app</strong>
      <span>WeatherNext 2 forecast data is available through Google Earth Engine, BigQuery, Cloud Storage/Zarr, and Vertex AI early access. Those paths need a Google Cloud or Earth Engine setup, not a simple anonymous API call.</span>
    </div>
    <div class="conclusion">
      <strong>How it would plug in</strong>
      <span>Add a backend job that reads WeatherNext 2 for the ERCOT locations, normalizes hourly temperature, cloud, wind, humidity, and then feeds the same forecast-price comparison pipeline used here.</span>
    </div>
  `;
}

function renderConcepts() {
  const concepts = [
    ["Net load", "Demand that must be served after wind and solar output. Rising net load often increases dispatchable generation needs."],
    ["RT hub price", "Real-time settlement point price for a trading hub. It reacts to actual system conditions."],
    ["Congestion basis", "Price difference between hubs. Large spreads suggest transmission constraints or regional oversupply."],
    ["Local storage history", "This app saves live snapshots in your browser. Trends grow more useful after it has run for hours or days."]
  ];

  document.getElementById("conceptList").innerHTML = concepts
    .map(([title, body]) => `<div class="concept"><strong>${title}</strong><span>${body}</span></div>`)
    .join("");
}

function renderConclusions(data) {
  const houston = data.prices.hubs.find((hub) => hub.name === "Houston");
  const west = data.prices.hubs.find((hub) => hub.name === "West");
  const reservePct = data.snapshot.loadMw ? (data.snapshot.reservesMw / data.snapshot.loadMw) * 100 : 0;
  const hubSpread = houston.realtime - west.realtime;
  const renewableShare = data.snapshot.loadMw ? ((data.renewables.windActualMw + data.renewables.solarActualMw) / data.snapshot.loadMw) * 100 : 0;

  const conclusions = [
    ["Price explanation", `Houston real-time price is ${formatMoney(houston.realtime)}. Compare it with reserves and net load to decide whether the move looks scarcity-driven.`],
    ["Scarcity check", `Operating reserves are ${reservePct.toFixed(1)}% of load, which points to ${reservePct < 10 ? "tight" : reservePct < 15 ? "watch-level" : "normal"} system conditions.`],
    ["Renewable driver", `Wind and solar are serving ${renewableShare.toFixed(1)}% of current load. Lower renewable output raises net load.`],
    ["Congestion clue", `Houston is ${formatMoney(hubSpread)} above West. If this spread persists, investigate transmission congestion or renewable oversupply in West ERCOT.`]
  ];

  document.getElementById("conclusions").innerHTML = conclusions
    .map(([title, body]) => `<div class="conclusion"><strong>${title}</strong><span>${body}</span></div>`)
    .join("");
}

function drawLineChart(canvasId, series, options) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 22, right: 22, bottom: 34, left: 54 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const allValues = series.flatMap((line) => line.values.map((point) => point.value)).filter(Number.isFinite);
  const minValue = Math.min(options.min ?? Math.min(...allValues, 0), 0);
  const maxValue = options.max ?? Math.max(...allValues, 1);
  const range = maxValue - minValue || 1;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#242b36";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#9ca8b7";
  ctx.font = "12px Inter, system-ui, sans-serif";

  if (!allValues.length) {
    ctx.fillText("No stored data yet", padding.left, height / 2);
    return;
  }

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    const labelValue = maxValue - (range / 4) * i;
    ctx.fillText(options.format(labelValue), 8, y + 4);
  }

  series.forEach((line) => {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    line.values.forEach((point, index) => {
      const x = padding.left + (plotWidth / Math.max(line.values.length - 1, 1)) * index;
      const y = padding.top + plotHeight - ((point.value - minValue) / range) * plotHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  const labels = series[0].values;
  labels.forEach((point, index) => {
    if (labels.length > 8 && index % Math.ceil(labels.length / 6) !== 0) return;
    const x = padding.left + (plotWidth / Math.max(labels.length - 1, 1)) * index;
    ctx.fillStyle = "#9ca8b7";
    ctx.fillText(point.label, x - 14, height - 12);
  });

  let legendX = padding.left;
  series.forEach((line) => {
    ctx.fillStyle = line.color;
    ctx.fillRect(legendX, 10, 10, 10);
    ctx.fillStyle = "#c6d0dd";
    ctx.fillText(line.name, legendX + 16, 19);
    legendX += ctx.measureText(line.name).width + 48;
  });
}

function drawStackedAreaChart(canvasId, series, options) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 22, right: 22, bottom: 34, left: 54 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const pointCount = Math.max(...series.map((line) => line.values.length), 0);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#242b36";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#9ca8b7";
  ctx.font = "12px Inter, system-ui, sans-serif";

  if (!pointCount) {
    ctx.fillText("No stored data yet", padding.left, height / 2);
    return;
  }

  const totals = Array.from({ length: pointCount }, (_, index) =>
    series.reduce((sum, line) => sum + Math.max(line.values[index]?.value || 0, 0), 0)
  );
  const maxValue = Math.max(...totals, 1);
  const xFor = (index) => padding.left + (plotWidth / Math.max(pointCount - 1, 1)) * index;
  const yFor = (value) => padding.top + plotHeight - (value / maxValue) * plotHeight;
  const baselines = Array(pointCount).fill(0);

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(options.format(maxValue - (maxValue / 4) * i), 8, y + 4);
  }

  series.forEach((line) => {
    const top = line.values.map((point, index) => baselines[index] + Math.max(point.value || 0, 0));
    ctx.beginPath();
    top.forEach((value, index) => {
      const x = xFor(index);
      const y = yFor(value);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let index = pointCount - 1; index >= 0; index -= 1) {
      ctx.lineTo(xFor(index), yFor(baselines[index]));
    }
    ctx.closePath();
    ctx.fillStyle = `${line.color}99`;
    ctx.fill();
    ctx.strokeStyle = line.color;
    ctx.stroke();
    top.forEach((value, index) => {
      baselines[index] = value;
    });
  });

  const labels = series[0].values;
  labels.forEach((point, index) => {
    if (labels.length > 8 && index % Math.ceil(labels.length / 6) !== 0) return;
    ctx.fillStyle = "#9ca8b7";
    ctx.fillText(point.label, xFor(index) - 14, height - 12);
  });

  let legendX = padding.left;
  series.forEach((line) => {
    ctx.fillStyle = line.color;
    ctx.fillRect(legendX, 10, 10, 10);
    ctx.fillStyle = "#c6d0dd";
    ctx.fillText(line.name, legendX + 16, 19);
    legendX += ctx.measureText(line.name).width + 48;
  });
}

function renderCharts(data) {
  const priceTrend = filterByHours(data.prices.trend, liveTimeframeHours);
  const fuelTrend = filterByHours(data.fuelTrend || [], liveTimeframeHours);
  const netLoadTrend = filterByHours(data.netLoadTrend || [], liveTimeframeHours);
  const fuelSeries = [
    { name: "Gas", color: "#62a8ff", values: fuelTrend.map((p) => ({ label: p.label, value: p.gas })) },
    { name: "Wind", color: "#50d3c6", values: fuelTrend.map((p) => ({ label: p.label, value: p.wind })) },
    { name: "Solar", color: "#f4c95d", values: fuelTrend.map((p) => ({ label: p.label, value: p.solar })) },
    { name: "Coal", color: "#ffad5a", values: fuelTrend.map((p) => ({ label: p.label, value: p.coal })) },
    { name: "Nuclear", color: "#b38cff", values: fuelTrend.map((p) => ({ label: p.label, value: p.nuclear })) },
    { name: "Storage", color: "#35d07f", values: fuelTrend.map((p) => ({ label: p.label, value: p.storage })) },
    { name: "Other", color: "#c6d0dd", values: fuelTrend.map((p) => ({ label: p.label, value: p.other })) }
  ];

  drawLineChart(
    "priceChart",
    [
      { name: "North", color: "#62a8ff", values: priceTrend.map((p) => ({ label: p.hour, value: p.north })) },
      { name: "Houston", color: "#f4c95d", values: priceTrend.map((p) => ({ label: p.hour, value: p.houston })) },
      { name: "South", color: "#ffad5a", values: priceTrend.map((p) => ({ label: p.hour, value: p.south })) },
      { name: "West", color: "#50d3c6", values: priceTrend.map((p) => ({ label: p.hour, value: p.west })) }
    ],
    { format: (value) => `$${Math.round(value)}` }
  );

  const drawFuelChart = fuelChartType === "area" ? drawStackedAreaChart : drawLineChart;
  drawFuelChart("fuelMixChart", fuelSeries, { format: (value) => `${Math.round(value / 1000)}k` });

  drawLineChart(
    "netLoadChart",
    [
      { name: "Load", color: "#62a8ff", values: netLoadTrend.map((p) => ({ label: p.label, value: p.load })) },
      { name: "Net load", color: "#ffad5a", values: netLoadTrend.map((p) => ({ label: p.label, value: p.netLoad })) }
    ],
    { format: (value) => `${Math.round(value / 1000)}k` }
  );

  drawLineChart(
    "renewablesChart",
    [
      { name: "Wind", color: "#50d3c6", values: fuelTrend.map((p) => ({ label: p.label, value: p.wind })) },
      { name: "Solar", color: "#f4c95d", values: fuelTrend.map((p) => ({ label: p.label, value: p.solar })) }
    ],
    { format: (value) => `${Math.round(value / 1000)}k` }
  );
}

function renderLiveDashboard(data) {
  renderSnapshot(data);
  renderPrices(data);
  renderFuelMix(data);
  renderRenewables(data);
  renderScarcity(data);
  renderCongestion(data);
  renderSpikeList(data);
  renderWeather(data);
  renderForecast(data);
  renderConcepts();
  renderConclusions(data);
  renderCharts(data);
}

function selectedTrendSnapshots() {
  return filterByDays(getStoredSnapshots(), trendTimeframeDays);
}

function labelForSnapshot(snapshot) {
  return new Date(snapshot.collectedAt).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

function renderTrends() {
  const data = selectedTrendSnapshots();
  const reserveRatios = data.map((item) => item.loadMw ? (item.reservesMw / item.loadMw) * 100 : null).filter(Number.isFinite);
  const houstonPrices = data.map((item) => item.houstonPrice).filter(Number.isFinite);
  const loads = data.map((item) => item.loadMw).filter(Number.isFinite);
  const netLoads = data.map((item) => item.netLoadMw).filter(Number.isFinite);
  const spreads = data.map((item) => item.houstonPrice - item.westPrice).filter(Number.isFinite);

  document.getElementById("trendWindow").textContent = `${data.length} stored snapshots`;
  document.getElementById("trendMetricGrid").innerHTML = [
    createMetric("Avg Load", formatMw(average(loads)), "Seven-day stored average", "neutral"),
    createMetric("Peak Load", formatMw(max(loads)), "Highest stored load", "warning"),
    createMetric("Avg Net Load", formatMw(average(netLoads)), "Load minus wind and solar"),
    createMetric("Min Reserve Ratio", reserveRatios.length ? `${min(reserveRatios).toFixed(1)}%` : "Unavailable", "Lowest stored cushion", reserveRatios.length && min(reserveRatios) < 10 ? "danger" : "positive"),
    createMetric("Avg Houston RT", formatMoney(average(houstonPrices)), "Stored real-time average", "neutral"),
    createMetric("Max H-W Basis", formatMoney(max(spreads)), "Houston minus West", max(spreads) > 25 ? "warning" : "neutral")
  ].join("");

  const chartData = data.map((item) => ({ label: labelForSnapshot(item), ...item }));
  drawLineChart(
    "weeklyLoadChart",
    [
      { name: "Load", color: "#62a8ff", values: chartData.map((p) => ({ label: p.label, value: p.loadMw })) },
      { name: "Reserves", color: "#35d07f", values: chartData.map((p) => ({ label: p.label, value: p.reservesMw })) }
    ],
    { format: (value) => `${Math.round(value / 1000)}k` }
  );
  drawLineChart(
    "weeklyPriceChart",
    [
      { name: "Houston", color: "#f4c95d", values: chartData.map((p) => ({ label: p.label, value: p.houstonPrice })) },
      { name: "South", color: "#ffad5a", values: chartData.map((p) => ({ label: p.label, value: p.southPrice })) },
      { name: "H-W basis", color: "#b38cff", values: chartData.map((p) => ({ label: p.label, value: p.houstonPrice - p.westPrice })) }
    ],
    { format: (value) => `$${Math.round(value)}` }
  );
  drawLineChart(
    "weeklyRenewablesChart",
    [
      { name: "Wind", color: "#50d3c6", values: chartData.map((p) => ({ label: p.label, value: p.windMw })) },
      { name: "Solar", color: "#f4c95d", values: chartData.map((p) => ({ label: p.label, value: p.solarMw })) }
    ],
    { format: (value) => `${Math.round(value / 1000)}k` }
  );
  drawLineChart(
    "weeklyFuelMixChart",
    [
      { name: "Gas", color: "#62a8ff", values: chartData.map((p) => ({ label: p.label, value: p.gasMw })) },
      { name: "Wind", color: "#50d3c6", values: chartData.map((p) => ({ label: p.label, value: p.windMw })) },
      { name: "Solar", color: "#f4c95d", values: chartData.map((p) => ({ label: p.label, value: p.solarMw })) },
      { name: "Coal", color: "#ffad5a", values: chartData.map((p) => ({ label: p.label, value: p.coalMw })) },
      { name: "Nuclear", color: "#b38cff", values: chartData.map((p) => ({ label: p.label, value: p.nuclearMw })) },
      { name: "Storage", color: "#35d07f", values: chartData.map((p) => ({ label: p.label, value: p.storageMw })) },
      { name: "Other", color: "#c6d0dd", values: chartData.map((p) => ({ label: p.label, value: p.otherMw })) }
    ],
    { format: (value) => `${Math.round(value / 1000)}k` }
  );

  const notes = data.length < 6
    ? [["Collecting history", "Leave the dashboard running or refresh it over time. Weekly conclusions improve after several snapshots have been saved."]]
    : [
        ["Load pattern", `Stored peak load was ${formatMw(max(loads))}, compared with an average of ${formatMw(average(loads))}.`],
        ["Reserve pressure", `The lowest reserve ratio in local history was ${min(reserveRatios).toFixed(1)}%. Lower values point to tighter grid conditions.`],
        ["Congestion signal", `The largest stored Houston-West spread was ${formatMoney(max(spreads))}. Persistent large spreads suggest congestion or West-area oversupply.`]
      ];

  document.getElementById("trendNotes").innerHTML = notes
    .map(([title, body]) => `<div class="conclusion"><strong>${title}</strong><span>${body}</span></div>`)
    .join("");
}

function renderCurrentView() {
  if (currentView === "trends") {
    renderTrends();
  } else {
    renderLiveDashboard(currentData);
  }
}

async function refreshData() {
  setStatus("Connecting", "");
  try {
    currentData = await fetchLiveData();
    localStorage.setItem(LAST_DATA_KEY, JSON.stringify(currentData));
    storeSnapshot(currentData);
    storeForecastSeries(currentData);
    setStatus("Live ERCOT data", "live");
  } catch (error) {
    const cached = localStorage.getItem(LAST_DATA_KEY);
    currentData = cached ? JSON.parse(cached) : sampleData;
    setStatus(cached ? "Cached data" : "Sample data", cached ? "warning" : "error");
    console.warn("ERCOT live fetch failed:", error);
  }
  renderCurrentView();
}

function setView(view) {
  currentView = view;
  document.getElementById("overviewView").classList.toggle("hidden", view !== "overview");
  document.getElementById("marketView").classList.toggle("hidden", view !== "market");
  document.getElementById("generationView").classList.toggle("hidden", view !== "generation");
  document.getElementById("weatherView").classList.toggle("hidden", view !== "weather");
  document.getElementById("forecastView").classList.toggle("hidden", view !== "forecast");
  document.getElementById("trendsView").classList.toggle("hidden", view !== "trends");
  document.getElementById("overviewTab").classList.toggle("active", view === "overview");
  document.getElementById("marketTab").classList.toggle("active", view === "market");
  document.getElementById("generationTab").classList.toggle("active", view === "generation");
  document.getElementById("weatherTab").classList.toggle("active", view === "weather");
  document.getElementById("forecastTab").classList.toggle("active", view === "forecast");
  document.getElementById("trendsTab").classList.toggle("active", view === "trends");
  renderCurrentView();
}

function downloadFile(fileName, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function snapshotsToCsv(snapshots) {
  const columns = [
    "collectedAt",
    "lastUpdated",
    "loadMw",
    "availableCapacityMw",
    "reservesMw",
    "netLoadMw",
    "outageMw",
    "houstonPrice",
    "southPrice",
    "westPrice",
    "gasMw",
    "windMw",
    "solarMw",
    "coalMw",
    "nuclearMw",
    "storageMw",
    "otherMw"
  ];
  const rows = snapshots.map((snapshot) =>
    columns.map((column) => JSON.stringify(snapshot[column] ?? "")).join(",")
  );
  return [columns.join(","), ...rows].join("\n");
}

function exportSnapshots(format) {
  const snapshots = getStoredSnapshots();
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "csv") {
    downloadFile(`ercot-snapshots-${stamp}.csv`, snapshotsToCsv(snapshots), "text/csv");
  } else {
    downloadFile(`ercot-snapshots-${stamp}.json`, JSON.stringify(snapshots, null, 2), "application/json");
  }
  document.getElementById("exportStatus").textContent = `Exported ${snapshots.length} locally stored snapshots.`;
}

document.getElementById("refreshButton").addEventListener("click", refreshData);
document.getElementById("overviewTab").addEventListener("click", () => setView("overview"));
document.getElementById("marketTab").addEventListener("click", () => setView("market"));
document.getElementById("generationTab").addEventListener("click", () => setView("generation"));
document.getElementById("weatherTab").addEventListener("click", () => setView("weather"));
document.getElementById("forecastTab").addEventListener("click", () => setView("forecast"));
document.getElementById("trendsTab").addEventListener("click", () => setView("trends"));
document.getElementById("exportCsvButton").addEventListener("click", () => exportSnapshots("csv"));
document.getElementById("exportJsonButton").addEventListener("click", () => exportSnapshots("json"));
document.getElementById("liveTimeframeSelect").addEventListener("change", (event) => {
  liveTimeframeHours = Number(event.target.value);
  renderCurrentView();
});
document.getElementById("fuelChartTypeSelect").addEventListener("change", (event) => {
  fuelChartType = event.target.value;
  renderCurrentView();
});
document.getElementById("trendTimeframeSelect").addEventListener("change", (event) => {
  trendTimeframeDays = Number(event.target.value);
  renderCurrentView();
});
document.getElementById("forecastHorizonSelect").addEventListener("change", (event) => {
  forecastHorizonHours = Number(event.target.value);
  renderCurrentView();
});
window.addEventListener("resize", renderCurrentView);

refreshData();
setInterval(refreshData, POLL_MS);
