(function () {
  'use strict';
  const KEY = 'power-market-terms.v1';
  let seen;
  try { seen = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { seen = new Set(); }
  let steps = [], index = 0, panel, current, mode;
  const first = (selector) => { const candidates = [...document.querySelectorAll(selector)].filter(el => !el.disabled); return candidates.find(el => el.getBoundingClientRect().width > 0) || candidates.find(el => el.closest('details')); };
  const step = (key, title, body, selector) => ({ key, title, body, selector });
  function terms(kind, level) {
    const lmp = kind === 'lmp', network = kind === 'construction';
    const piece = type => { const id = level.nodes?.find(n => n.type === type)?.id; return `[data-construction-node="${id}"], [data-construction-piece-id="${id}"]`; };
    const resource = lmp ? '[data-target-kind="resource"]' : network ? piece('resource') : '.day-ahead-offer';
    const load = lmp ? '[data-target-kind="load"]' : network ? piece('load') : '#day-ahead-demand';
    const line = lmp ? '.map-connection-group' : network ? '.construction-line-piece, .construction-line-group' : '#day-ahead-network-summary';
    const all = [
      step('generator', 'Generator / resource', network ? 'A blue resource supplies electricity. Capacity is the most it can produce. Attach the preset flows so output stays within that capacity. Offer prices are reference information; this mode checks network balance, not price.' : 'A resource supplies electricity. Its capacity is the most it can produce. Use its offer and available output when choosing how to serve demand.', resource),
      step('capacity', 'Capacity · MW', 'Capacity is a limit, not the amount currently used. MW (megawatts) measures the rate of production, consumption, or flow. A 40 MW resource can supply up to 40 MW.', resource),
      step('load', 'Load / demand', network || lmp ? 'A load uses electricity. Its demand tells you how many MW must arrive at this circle. Check incoming minus outgoing flow against that number.' : 'This is the largest amount buyers bid for in the day-ahead market. The accepted amount can be smaller if their bids are below the offers needed to supply it.', load),
      step('line', 'Transmission line / limit', 'A line connects two components. Its limit is the maximum MW it can carry. The ∞ symbol means there is no binding line limit in this exercise.', line),
      step('flow', 'Flow · MW', network ? 'Each purple line piece already carries a preset flow. Choose endpoints so each load receives its demand and every hub balances. The flow must fit within the line limit.' : 'Flow is the amount moved along a connection. At a grid node: generation plus incoming flow equals local demand plus outgoing flow.', line)
    ];
    if (network) {
      all.splice(2, 0, step('hub', 'Grid node / hub', 'A green hub is a meeting point, not a generator. It cannot create or consume power: total flow entering must equal total flow leaving.', piece('bus')));
      all.push(step('placement', 'Build and check', 'Click a piece to add it to the workspace, or drag it to choose its position. Move each line near its two endpoints. Drag a placed piece back to the tray or right-click it to return it. Check network tests balance and capacity, and accepts any arrangement that passes.', '#construction-map'));
      if (level.id === 7 || level.id >= 9) all.push(step('parallel', 'Parallel corridors', 'Separate lines may connect the same two hubs. Each retains its own capacity and preset flow. The drawing offsets them so you can select each one.', line));
      if (level.id === 8 || level.id === 10) all.push(step('loop', 'Loop', 'A loop joins hubs along more than one route. In this puzzle you must still balance every hub using the preset flows; a loop alone does not guarantee a valid solution.', '#construction-map'));
      if (level.contingency) all.push(step('outage', 'Specified outage check', `This level also removes ${level.contingency.label}. The remaining line capacities must still allow all loads to be served. The outage check may reroute flows; the ordinary puzzle uses the preset flows.`, '#construction-map'));
    } else {
      all.push(step('offer', 'Offer · $/MWh', 'An offer is a submitted energy price. MWh is energy: 1 MW supplied for one hour is 1 MWh. $30/MWh means $30 for that amount of energy. An offer is not necessarily the final market price.', resource));
      all.push(step('lmp', 'LMP · locational marginal price', 'LMP is the additional optimized energy cost of serving a small extra amount at this location, expressed in $/MWh. Ask which available supply can reach this node for the next increment, while respecting limits.', lmp ? '[data-target-kind="bus"]' : '#day-ahead-stack'));
      if (lmp) all.push(step('solve', 'Your task', `Serve the displayed ${level.loadDemand} MW. Select each grid node or load to enter its LMP, and each highlighted transmission to enter its flow. Check Answer checks balance, constraints, and prices.`, '#check-network-button'));
      else all.push(step('day-ahead', 'Day-ahead schedule', 'Plan awards for the displayed hour or hours before delivery. Choose resource quantities and check your schedule. These energy awards are financial positions; the exercise models their supply balance. Forecast outcomes are evaluated separately where shown.', '#day-ahead-run-button'));
      if (level.resources.some(r => r.offerCurve || r.supplyCurve)) all.push(step('curve', 'Offer curve', 'Read MW along the bottom and $/MWh vertically. The point on a resource curve gives its offer for the next small increment at that output. Compare marginal offers across generators; the lowest starting offer need not stay cheapest.', lmp ? '[data-target-kind="resource"][data-target-id="' + level.resources.find(r => r.offerCurve || r.supplyCurve).id + '"]' : '.day-ahead-curve'));
      if (!lmp) all.push(step('bid', 'Demand bid curve', 'A bid is the buyer’s maximum willingness to pay. Accept supply while the additional bid value covers its offer. A flat bid values all MW equally; a declining bid values later MW less. The last point is capped at this level’s existing demand.', '#day-ahead-demand-curve'));
      if ((lmp && [3, 4, 8, 10].includes(level.id)) || level.lineLimit) all.push(step('congestion', 'Congestion', 'A binding path prevents additional cheap energy from reaching a location. Local supply or redispatch may then set a different LMP. A line at its limit does not automatically mean prices must differ.', line));
      if (level.id === 4 && lmp) all.push(step('crr', 'CRR · congestion revenue right', 'This level asks for LMPs and flows. The CRR label identifies a financial hedge on a source-to-sink congestion spread; it does not add transmission capacity. No hedge payout is required for this level.', '[data-target-id="central-east"]'));
      if (level.evForecast || level.windForecast) all.push(step('forecast', 'Forecast / expected value', 'Multiply each possible MW outcome by its probability, then add the results. For these exercises the expected renewable availability limits scheduling; firm units retain their listed capacity. Expected values are a teaching scheduling rule, not a guarantee.', '#day-ahead-forecast'));
      if (['commitment', 'commitmentReserve', 'integrated'].includes(level.controlMode)) all.push(step('commitment', 'Commitment / startup cost', 'ON makes a unit available across the displayed hours. Startup cost is paid once for starting that unit. The energy limit slider sets the maximum dispatch allowed in each hour; the market chooses actual output within that limit.', '[data-day-ahead-kind="commitment"]'));
      if (level.reserveRequirement) all.push(step('reserve', 'Reserve', 'Reserve holds capacity available for a surprise. A resource’s energy plus reserve cannot exceed its forecast available capacity. Use the reserve slider separately from the energy limit.', '[data-day-ahead-kind="reserve"], #day-ahead-reserve-summary'));
    }
    if (network && level.id >= 7) all.push(step('transport', 'Model used here', 'This puzzle uses a lossless capacity-and-balance model. Lines carry the preset flows you place. Real electrical networks also depend on impedance; this exercise tests balance and capacity rather than AC power flow.', '#construction-map'));
    if (lmp) all.push(step('boundary', 'At a hard limit', 'LMP uses the next small increment when it can be supplied. If no additional load can be served at a hard capacity boundary, this teaching model uses the value of the last small increment instead. Keep your answer to one decimal place.', '[data-target-kind="bus"]'));
    return all.filter(s => first(s.selector));
  }
  function close() {
    first('.guide-target')?.classList.remove('guide-target');
    panel?.remove(); panel = null;
    document.removeEventListener('keydown', keyboard);
  }
  function keyboard(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
  }
  function next() { if (index + 1 < steps.length) { index++; show(); } else close(); }
  function position() {
    if (!panel || !current) return;
    const r = current.getBoundingClientRect(), w = Math.min(320, innerWidth - 24), h = panel.offsetHeight;
    const below = r.bottom + h + 24 < innerHeight;
    const top = below ? r.bottom + 14 : Math.max(12, r.top - h - 14);
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    panel.style.cssText = `width:${w}px;left:${left}px;top:${Math.min(top, innerHeight - h - 12)}px`;
    panel.dataset.side = below ? 'below' : 'above';
    panel.style.setProperty('--arrow-x', `${Math.max(18, Math.min(w - 18, r.left + r.width / 2 - left))}px`);
  }
  function show() {
    first('.guide-target')?.classList.remove('guide-target');
    const s = steps[index]; current = first(s.selector);
    if (!current) { next(); return; }
    let disclosure = current.closest('details');
    while (disclosure) { disclosure.open = true; disclosure = disclosure.parentElement.closest('details'); }
    seen.add(`${mode}:${s.key}`); localStorage.setItem(KEY, JSON.stringify([...seen]));
    current.classList.add('guide-target'); current.scrollIntoView({ block: 'center', behavior: 'instant' });
    if (!panel) { panel = document.createElement('aside'); panel.className = 'term-guide'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Term explanation'); document.body.append(panel); }
    panel.innerHTML = `<div class="term-guide-top"><span>Term definition</span><button type="button" data-guide="close" aria-label="Close definitions">×</button></div><h3>${s.title}</h3><p>${s.body}</p><label>Find a term<select aria-label="Choose a term">${steps.map((t, i) => `<option value="${i}" ${i === index ? 'selected' : ''}>${t.title}</option>`).join('')}</select></label><div class="term-guide-actions"><button type="button" data-guide="back" ${index ? '' : 'disabled'}>Previous</button><button type="button" data-guide="next">${index === steps.length - 1 ? 'Done' : 'Next'}</button></div>`;
    panel.querySelector('select').onchange = e => { index = Number(e.target.value); show(); };
    panel.querySelectorAll('[data-guide]').forEach(b => b.onclick = () => { if (b.dataset.guide === 'close') close(); else if (b.dataset.guide === 'back') { index--; show(); } else next(); });
    position(); panel.querySelector('button').focus({ preventScroll: true });
  }
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
  window.LearningGuide = {
    close,
    list: terms,
    isNew: (kind, key) => !seen.has(`${kind}:${key}`),
    open(kind, level, auto = false, start = 0) {
      close(); mode = kind; steps = terms(kind, level); index = start;
      if (auto && (level.id !== 0 || seen.has(`${kind}:intro`))) return;
      if (auto) { seen.add(`${kind}:intro`); localStorage.setItem(KEY, JSON.stringify([...seen])); }
      if (steps.length) { document.addEventListener('keydown', keyboard); show(); }
    }
  };
})();
