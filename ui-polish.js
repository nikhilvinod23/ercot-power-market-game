/* Presentation enhancements only; gameplay and scoring live in game.js. */
(() => {
  'use strict';
  const labels = new Map([
    ['Check Answer', 'Check answer'], ['Check Network', 'Check network'],
    ['Reveal Correct Answer', 'Reveal answer'], ['Reveal correct answer', 'Reveal answer'],
    ['Supply offers', 'Resource choices'], ['Maximum demand bid', 'Demand bid limit'],
    ['ON', 'On'], ['OFF', 'Off']
  ]);
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
      const badge = document.createElement('span'); badge.className = 'level-status-badge'; badge.setAttribute('aria-hidden', 'true');
      const status = button.classList.contains('status-green') ? 'Completed' : button.classList.contains('status-yellow') ? 'Needs practice' : button.disabled ? 'Locked' : 'Ready';
      badge.textContent = status === 'Completed' ? '✓' : status === 'Needs practice' ? '≈' : status === 'Locked' ? '−' : '';
      button.append(badge); button.title = `${title} · ${status}`;
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
      const width = map.viewBox.baseVal.width;
      map.querySelectorAll('.map-connection-label, .map-connection-meta').forEach(label => {
        const half = label.getComputedTextLength() / 2 + 8;
        const x = Number(label.getAttribute('x'));
        const clamped = Math.max(half, Math.min(width - half, x));
        if (clamped !== x) label.setAttribute('x', clamped);
      });
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
