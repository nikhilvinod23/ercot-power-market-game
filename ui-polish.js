/* Presentation enhancements only; gameplay and scoring live in game.js. */
(() => {
  'use strict';
  const labels = new Map([
    ['Check Answer', 'Check answer'], ['Check Network', 'Check network'],
    ['Reveal Correct Answer', 'Reveal answer'], ['Reveal correct answer', 'Reveal answer'],
    ['Supply offers', 'Resource choices'], ['Maximum demand bid', 'Demand bid limit'],
    ['ON', 'On'], ['OFF', 'Off']
  ]);
  function layoutConnectionLabels(map) {
    const groups = [...map.querySelectorAll('.map-connection-group')];
    if (!groups.some(g => !g.dataset.labelLayout)) return;
    const vb = map.viewBox.baseVal;
    let width = vb.width;
    const height = vb.height;
    const circles = [...map.querySelectorAll('.map-node-circle')].map(c => ({x:+c.getAttribute('cx'),y:+c.getAttribute('cy'),r:+c.getAttribute('r')+12}));
    const lines = [...map.querySelectorAll('.map-connection')].map(l => ({x1:+l.getAttribute('x1'),y1:+l.getAttribute('y1'),x2:+l.getAttribute('x2'),y2:+l.getAttribute('y2')}));
    const placed = [];
    const overlaps = (a,b) => a.x < b.x+b.w+6 && a.x+a.w+6 > b.x && a.y < b.y+b.h+6 && a.y+a.h+6 > b.y;
    const crosses = (r,l) => {
      let lo = 0, hi = 1;
      for (const [start,delta,min,max] of [[l.x1,l.x2-l.x1,r.x-9,r.x+r.w+9],[l.y1,l.y2-l.y1,r.y-9,r.y+r.h+9]]) {
        if (Math.abs(delta)<1e-8) { if (start<min || start>max) return false; }
        else { const a=(min-start)/delta,b=(max-start)/delta; lo=Math.max(lo,Math.min(a,b)); hi=Math.min(hi,Math.max(a,b)); if (lo>hi) return false; }
      }
      return true;
    };
    const free = r => r.x>=8 && r.y>=8 && r.x+r.w<=width-8 && r.y+r.h<=height-8 && !placed.some(p=>overlaps(r,p)) && !circles.some(c=>Math.hypot(c.x-Math.max(r.x,Math.min(r.x+r.w,c.x)),c.y-Math.max(r.y,Math.min(r.y+r.h,c.y)))<c.r) && !lines.some(l=>crosses(r,l));
    const items = groups.map(g => { const texts=[...g.querySelectorAll('.map-connection-label,.map-connection-meta')]; return {g,texts,w:Math.max(0,...texts.map(t=>t.getComputedTextLength()))+16}; }).filter(i=>i.texts.length).sort((a,b)=>b.w-a.w);
    items.forEach(({g,texts,w}) => {
      const h=texts.length*19+8, original={x:+texts[0].getAttribute('x')-w/2,y:+texts[0].getAttribute('y')-14};
      let candidates=[{...original,w,h}];
      for (let y=8;y+h<height-8;y+=12) for (let x=8;x+w<width-8;x+=12) candidates.push({x,y,w,h});
      candidates.sort((a,b)=>Math.hypot(a.x-original.x,a.y-original.y)-Math.hypot(b.x-original.x,b.y-original.y));
      let spot=candidates.find(free);
      if (!spot) {
        // A reserved label gutter keeps dense networks readable without covering the puzzle.
        const x=width+16; width+=w+32;
        spot={x,y:12,w,h};
        for (let y=12;y+h<height-8;y+=h+12) { const trial={x,y,w,h}; if(free(trial)){spot=trial;break;} }
        map.setAttribute('viewBox',`${vb.x} ${vb.y} ${width} ${height}`);
      }
      texts.forEach((t,i)=>{t.setAttribute('x',spot.x+w/2);t.setAttribute('y',spot.y+16+i*19);});
      g.dataset.labelLayout='true'; placed.push(spot);
    });
    groups.forEach(g => { g.dataset.labelLayout='true'; });
  }
  function refresh() {
    document.querySelectorAll('button, h3, .day-ahead-requirement-box > span').forEach(el => {
      if (el.children.length) return;
      const next = labels.get(el.textContent.trim());
      if (next) el.textContent = next;
    });
    document.querySelectorAll('.level-circle').forEach(button => {
      if (button.parentElement.classList.contains('level-entry')) return;
      const title = button.getAttribute('aria-label').replace(/, locked$/, '');
      const wrapper = document.createElement('div'); wrapper.className = 'level-entry';
      button.before(wrapper); wrapper.append(button);
      const caption = document.createElement('span'); caption.className = 'level-caption';
      caption.textContent = title.includes(':') ? title.split(':').slice(1).join(':').trim() : title;
      // LMP labels are deliberately short on the button; obtain the current lesson title separately.
      if (button.dataset.level !== undefined) caption.textContent = ['Nodal pricing', 'Marginal offers', 'Supply curves', 'Congestion', 'CRR hedges', 'Day-ahead schedule', 'Linear offers', 'Curve competition', 'Congested curves', 'Demand curves', 'Curve capstone'][Number(button.dataset.level)];
      wrapper.append(caption);
      const status = button.classList.contains('status-green') ? 'Completed' : button.classList.contains('status-yellow') ? 'Needs practice' : button.disabled ? 'Locked' : 'Ready';
      button.title = `${title} · ${status}`;
    });
    document.querySelectorAll('#network-map .map-node-group:not([data-ui-prompt])').forEach(group => {
      if (!group.classList.contains('status-red')) return;
      group.dataset.uiPrompt = 'true';
      const prompt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const circle = group.querySelector('circle');
      prompt.setAttribute('class', 'map-answer-prompt'); prompt.setAttribute('x', circle.getAttribute('cx')); prompt.setAttribute('y', Number(circle.getAttribute('cy')) + 48); prompt.setAttribute('text-anchor', 'middle'); prompt.textContent = 'Enter LMP'; group.append(prompt);
    });
    document.querySelectorAll('#network-map .map-connection-group.status-red:not([data-ui-prompt])').forEach(group => {
      group.dataset.uiPrompt = 'true';
      const label = group.querySelector('.map-connection-meta');
      if (label) label.textContent += ' · Enter flow';
    });
    const map = document.getElementById('network-map');
    if (map?.getBoundingClientRect().width) {
      layoutConnectionLabels(map);
    }
    document.querySelectorAll('.day-ahead-offer-control input[type="range"]').forEach(range => {
      if (range.nextElementSibling?.classList.contains('resource-value-input')) return;
      const input = document.createElement('input'); input.type = 'number'; input.className = 'resource-value-input'; input.min = range.min; input.max = range.max; input.step = range.step; input.value = range.value;
      input.setAttribute('aria-label', `${range.getAttribute('aria-label') || 'Resource choice'} in MW`);
      input.addEventListener('input', () => { if (input.value === '') return; range.value = input.value; range.dispatchEvent(new Event('input', { bubbles: true })); });
      range.addEventListener('input', () => { input.value = range.value; });
      range.after(input);
    });
    const result = document.getElementById('day-ahead-result');
    const capacity = document.getElementById('day-ahead-stack-max');
    if (capacity && /^\d+(?:\.\d+)? MW offered$/.test(capacity.textContent)) capacity.textContent = 'Total capacity: ' + capacity.textContent.replace(' offered','');
    if (result) {
      result.querySelectorAll('.day-ahead-result-grid').forEach(grid => {
        if (grid.previousElementSibling?.classList.contains('awards-heading')) return;
        const heading = document.createElement('p'); heading.className = 'awards-heading'; heading.textContent = 'Market awards and costs'; grid.before(heading);
      });
      result.querySelectorAll('.day-ahead-calculation-table-wrap').forEach(table => {
        if (table.closest('details')) return;
        const details = document.createElement('details'); details.className = 'calculation-details';
        const summary = document.createElement('summary'); summary.textContent = 'Show calculations';
        table.before(details); details.append(summary, table);
      });
      if (result.querySelectorAll(':scope > strong').length > 1) {
        [...result.querySelectorAll(':scope > strong')].slice(1).forEach(h => { const p = document.createElement('span'); p.className = 'result-subheading'; p.textContent = h.textContent; h.replaceWith(p); });
      }
    }
    const instruction = document.querySelector('#level-screen .level-instruction');
    if (instruction && !instruction.dataset.polished) { instruction.dataset.polished = 'true'; instruction.innerHTML = '<span class="status-dot unanswered"></span> Red nodes and lines need an answer <span class="status-dot pending"></span> Amber: entered <span class="status-dot verified"></span> Green: verified'; }
  }
  let scheduled = false;
  new MutationObserver(() => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; refresh(); }); } }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', refresh);
})();
