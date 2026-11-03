const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const server = require('../scripts/preview.cjs')(0);
  await new Promise(resolve => server.on('listening', resolve));
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'warning') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByRole('button', { name: 'LMP Solver', exact: true }).click();
  await page.getByRole('button', { name: 'Level 0', exact: true }).click();
  await page.locator('.term-guide').waitFor();
  assert.match(await page.locator('.term-guide h3').innerText(), /Generator/);
  assert.equal(await page.locator('.term-guide-top > span').innerText(), 'Term definition');
  assert.equal(await page.getByRole('button', {name:'Skip guide'}).count(), 0);
  await page.getByRole('button', { name: 'Close definitions' }).click();
  await page.locator('#lmp-help-button').click();
  await page.getByLabel('Choose a term').selectOption({ label: 'LMP · locational marginal price' });
  assert.match(await page.locator('.term-guide p').innerText(), /additional optimized energy cost/);
  await page.screenshot({ path: process.env.TEMP + '/power-market-mobile.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole('button', { name: 'Close definitions' }).click();
  await page.locator('#back-button').click();
  await page.locator('#mode-back-button').click();
  await page.getByRole('button', { name: 'Network Construction', exact: true }).click();
  await page.getByRole('button', { name: 'Level 0: Basic path', exact: true }).click();
  await page.locator('.term-guide').waitFor();
  await page.getByRole('button', { name: 'Close definitions' }).click();
  await page.locator('#construction-back-button').click();
  assert.ok(await page.locator('.level-caption').count() > 0);
  await page.locator('#construction-mode-back-button').click();
  await page.getByRole('button', { name: 'Day-Ahead Market', exact: true }).click();
  await page.getByRole('button', { name: 'Level 0: Single-hour clearing', exact: true }).click();
  await page.locator('.term-guide').waitFor();
  await page.getByRole('button', { name: 'Close definitions' }).click();
  await page.locator('#day-ahead-reveal-button').click();
  await page.locator('#day-ahead-run-button').click();
  assert.match(await page.locator('#day-ahead-result').innerText(), /Correct schedule/);
  await page.locator('#day-ahead-next-button').click();
  assert.equal(await page.locator('.term-guide').count(), 0);
  await page.locator('.resource-value-input').first().fill('10');
  assert.equal(await page.locator('#day-ahead-input-wind').inputValue(), '10');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: process.env.TEMP + '/power-market-desktop.png' });
  const audit = await browser.newPage({ reducedMotion: 'reduce' });
  audit.on('pageerror', e => errors.push(e.message));
  await audit.addInitScript(() => {
    const green = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [i, 'green']));
    localStorage.setItem('power-market-solver-progress.v3', JSON.stringify({ statuses: green, constructionStatuses: green, dayAheadStatuses: green, dayAheadOfferVersion: 13, constructionInputVersion: 4 }));
  });
  await audit.goto(`http://127.0.0.1:${server.address().port}`);
  await audit.locator('#day-ahead-mode-button').click();
  for (let id = 0; id <= 10; id++) {
    await audit.locator(`[data-day-ahead-level="${id}"]`).click();
    await audit.locator('#day-ahead-level-screen').waitFor({ state: 'visible' });
    if (await audit.locator('.term-guide').count()) await audit.getByRole('button', { name: 'Close definitions' }).click();
    await audit.locator('#day-ahead-reveal-button').click();
    await audit.locator('#day-ahead-run-button').click();
    assert.match(await audit.locator('#day-ahead-result').innerText(), /Correct schedule/, `Day ahead ${id}`);
    await audit.locator('#day-ahead-back-button').click();
  }
  await audit.locator('#day-ahead-mode-back-button').click();
  await audit.locator('#lmp-mode-button').click();
  for (let id = 0; id <= 10; id++) {
    await audit.locator(`[data-level="${id}"]`).click();
    await audit.locator('#level-screen').waitFor({ state: 'visible' });
    if (await audit.locator('.term-guide').count()) await audit.getByRole('button', { name: 'Close definitions' }).click();
    await audit.locator('#reveal-answer-button').click();
    await audit.locator('#check-network-button').click();
    assert.match(await audit.locator('#completion-title').innerText(), /Perfect/, `LMP ${id}`);
    await audit.locator('#back-button').click();
  }
  await audit.locator('#mode-back-button').click();
  await audit.locator('#network-mode-button').click();
  await audit.locator('[data-construction-level="0"]').click();
  await audit.locator('#construction-level-screen').waitFor({state:'visible'});
  if (await audit.locator('.term-guide').count()) await audit.getByRole('button',{name:'Close definitions'}).click();
  assert.equal(await audit.locator('.tray-group').count(), 4);
  await audit.screenshot({path:process.env.TEMP + '/power-market-construction-desktop.png'});
  await audit.setViewportSize({width:390,height:844});
  await audit.locator('#construction-help-button').click();
  await audit.getByLabel('Choose a term').selectOption({label:'Load / demand'});
  assert.equal(await audit.locator('.tray-group[data-group="load"]').getAttribute('open'), '');
  await audit.getByRole('button',{name:'Close definitions'}).click();
  await audit.locator('#construction-map').scrollIntoViewIfNeeded();
  assert.equal(await audit.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
  await audit.screenshot({path:process.env.TEMP + '/power-market-construction-mobile.png'});
  for (const type of ['resource','bus','load','line']) {
    const group = audit.locator(`.tray-group[data-group="${type}"]`);
    if (await group.getAttribute('open') === null) await group.locator('summary').click();
  }
  for (const [type,x] of [['resource',0.14],['bus',0.5],['load',0.86]]) {
    const map = audit.locator('#construction-map');
    const bounds = await map.boundingBox();
    await audit.locator(`.tray-group[data-group="${type}"] .construction-node-piece`).dragTo(map,{targetPosition:{x:bounds.width*x,y:bounds.height*0.5}});
  }
  assert.equal(await audit.locator('[data-construction-node]').count(),3);
  for (const [id,x] of [['line-1',0.32],['line-2',0.68]]) {
    const map = audit.locator('#construction-map');
    const bounds = await map.boundingBox();
    await audit.locator(`[data-construction-line-piece="${id}"]`).dragTo(map,{targetPosition:{x:bounds.width*x,y:bounds.height*0.5}});
  }
  assert.match(await audit.locator('#construction-placement-progress').innerText(), /All pieces placed/);
  await audit.locator('#construction-check-button').click();
  assert.match(await audit.locator('#construction-feedback').innerText(),/Success/);
  assert.deepEqual(errors, []);
  await browser.close();
  server.close();
  console.log('Browser checks passed: all mode guides, term picker, skip/reopen, no later automatic popup, mobile width, schedule progression.');
})().catch(e => { console.error(e); process.exit(1); });
