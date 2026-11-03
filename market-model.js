/* Continuous, lossless teaching model. Prices are marginal offers, not average costs. */
(function (root) {
  "use strict";
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const clean = value => Math.round(value * 100) / 100;
  function price(points, q) {
    if (q <= points[0].mw) return points[0].price;
    for (let i = 1; i < points.length; i++) {
      if (q <= points[i].mw) return points[i - 1].price + (points[i].price - points[i - 1].price) * (q - points[i - 1].mw) / (points[i].mw - points[i - 1].mw);
    }
    return points.at(-1).price;
  }
  function integral(points, q) {
    let value = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1].mw, b = Math.min(q, points[i].mw);
      if (b > a) value += (b - a) * (price(points, a) + price(points, b)) / 2;
    }
    return value;
  }
  const pointsFor = (r) => r.offerCurve || [{ mw: 0, price: r.offer }, { mw: r.capacity, price: r.offer }];
  function quantityAt(points, p, cap, demand = false) {
    let q = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      if (demand ? p <= b.price : p >= b.price) q = b.mw;
      else if (demand ? p < a.price : p > a.price) {
        q = a.mw + (p - a.price) * (b.mw - a.mw) / (b.price - a.price); break;
      } else break;
    }
    return Math.min(cap, q);
  }
  function fixedDispatch(resources, caps, quantity) {
    const capacity = sum(resources.map(r => caps[r.id] ?? r.capacity));
    if (quantity < -1e-6 || quantity > capacity + 1e-6) return { feasible: false };
    if (Math.abs(quantity - capacity) < 1e-5) {
      const awards = Object.fromEntries(resources.map(r => [r.id, caps[r.id] ?? r.capacity]));
      return { feasible: true, awards, cost: sum(resources.map(r => integral(pointsFor(r), awards[r.id]))), price: Math.max(0, ...resources.filter(r => awards[r.id] > 0).map(r => price(pointsFor(r), awards[r.id]))) };
    }
    let lo = -1000, hi = 10000;
    for (let i = 0; i < 55; i++) {
      const p = (lo + hi) / 2;
      if (sum(resources.map(r => quantityAt(pointsFor(r), p, caps[r.id] ?? r.capacity))) < quantity - 1e-8) lo = p;
      else hi = p;
    }
    const awards = Object.fromEntries(resources.map(r => [r.id, quantityAt(pointsFor(r), lo, caps[r.id] ?? r.capacity)]));
    let residual = quantity - sum(Object.values(awards));
    for (const r of [...resources].sort((a, b) => price(pointsFor(a), awards[a.id]) - price(pointsFor(b), awards[b.id]))) {
      if (residual <= 1e-7) break;
      const take = Math.min(residual, (caps[r.id] ?? r.capacity) - awards[r.id]);
      awards[r.id] += take; residual -= take;
    }
    return { feasible: Math.abs(residual) < 1e-5, awards, cost: sum(resources.map(r => integral(pointsFor(r), awards[r.id]))), price: clean(hi) };
  }
  // For a fixed corridor flow, each zone chooses consumption against its bid.
  function zone(resources, caps, curve, transfer) {
    const cap = curve.points.at(-1).mw;
    const available = sum(resources.map(r => caps[r.id] ?? r.capacity));
    const minimum = Math.max(0, -transfer), maximum = Math.min(cap, available - transfer);
    if (minimum > maximum + 1e-6) return { feasible: false };
    let lo = -1000, hi = 10000;
    for (let i = 0; i < 45; i++) {
      const p = (lo + hi) / 2;
      const gen = sum(resources.map(r => quantityAt(pointsFor(r), p, caps[r.id] ?? r.capacity)));
      const demand = quantityAt(curve.points, p, cap, true);
      if (gen - demand < transfer) lo = p; else hi = p;
    }
    let q = Math.max(minimum, Math.min(maximum, quantityAt(curve.points, (lo + hi) / 2, cap, true)));
    if (Math.abs(q - cap) < 1e-5) q = cap;
    if (Math.abs(q) < 1e-5) q = 0;
    const dispatch = fixedDispatch(resources, caps, q + transfer);
    return { ...dispatch, demand: q, welfare: integral(curve.points, q) - dispatch.cost };
  }
  function clear(resources, caps, curves, limit = 0) {
    if (curves.system) {
      const result = zone(resources, caps, curves.system, 0);
      return { ...result, demands: { system: result.demand }, totalCost: result.cost, lmp: result.price, flow: 0 };
    }
    let best = null;
    const evaluate = (flow) => {
      const west = zone(resources.filter(r => r.zone === 'west'), caps, curves.west, flow);
      const east = zone(resources.filter(r => r.zone === 'east'), caps, curves.east, -flow);
      if (!west.feasible || !east.feasible) return null;
      return { feasible: true, awards: { ...west.awards, ...east.awards }, demands: { west: west.demand, east: east.demand }, totalCost: west.cost + east.cost, welfare: west.welfare + east.welfare, nodeLmps: { west: west.price, east: east.price }, flow, lmp: east.price };
    };
    // Bounded continuous search; the feasible interval contains zero in these lessons.
    let a = -limit, b = limit;
    for (let i = 0; i < 30; i++) {
      const x = a + (b - a) / 3, y = b - (b - a) / 3;
      const left = evaluate(x), right = evaluate(y);
      if ((left?.welfare ?? -Infinity) < (right?.welfare ?? -Infinity)) a = x; else b = y;
    }
    for (const flow of [0, -limit, limit, (a + b) / 2]) {
      const result = evaluate(flow);
      if (result && (!best || result.welfare > best.welfare + 1e-6)) best = result;
    }
    return best || { feasible: false, awards: {}, demands: {}, totalCost: Infinity, welfare: -Infinity };
  }
  root.MarketModel = { price, integral, fixedDispatch, clear };
  if (typeof module !== 'undefined') module.exports = root.MarketModel;
})(typeof globalThis !== 'undefined' ? globalThis : this);
