const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const MarketModel = require('../market-model.js');
const near = (a, b, tolerance = 0.02) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
// Independent analytical solution: 10+2q_A = 30+q_B, q_A+q_B=40.
const resources = [
  { id: 'a', capacity: 50, offerCurve: [{ mw: 0, price: 10 }, { mw: 50, price: 110 }] },
  { id: 'b', capacity: 50, offerCurve: [{ mw: 0, price: 30 }, { mw: 50, price: 80 }] }
];
const dispatch = MarketModel.fixedDispatch(resources, {}, 40);
near(dispatch.awards.a, 20); near(dispatch.awards.b, 20); near(dispatch.price, 50);
// Buyer value 90-q intersects aggregate supply at p=50, Q=40.
const welfare = MarketModel.clear(resources, {}, { system: { points: [{ mw: 0, price: 90 }, { mw: 90, price: 0 }] } });
near(welfare.demands.system, 40); near(welfare.lmp, 50);
const context = { MarketModel, localStorage: { getItem: () => null }, console, globalThis: {} };
let source = fs.readFileSync(require.resolve('../game.js'), 'utf8');
source = source.replace('  loadProgress();\n  cacheElements();', '  globalThis.audit = { levels, dayAheadLevels, clearDayAhead, validateDayAheadLevels, evaluateCommitmentReserve, classifyAnswers }; return;\n  loadProgress();\n  cacheElements();');
vm.runInNewContext(source, context);
const audit = context.globalThis.audit;
assert.deepEqual(Array.from(audit.validateDayAheadLevels()), []);
assert.ok(audit.levels.every(l => l.validation.valid));
for (const level of audit.dayAheadLevels) {
  if (['dispatch', 'congestion'].includes(level.controlMode)) {
    assert.equal(audit.clearDayAhead(level, level.defaultDispatch).feasible, true, level.title);
    const zeros = Object.fromEntries(level.resources.map(r => [r.id, 0]));
    assert.equal(audit.clearDayAhead(level, zeros).feasible, false, `${level.title}: zero cannot clear positive valuable demand`);
  }
  if (['commitmentReserve', 'integrated'].includes(level.controlMode)) {
    const values = Object.fromEntries(level.resources.map(r => [r.id, { commitment: level.defaultCommitment[r.id], reserve: level.defaultReserve[r.id], dispatch: level.defaultDispatch[r.id] }]));
    const result = audit.evaluateCommitmentReserve(level, values);
    assert.equal(result.feasible, true, level.title);
    for (const hour of level.hours || [{ id: 1, demand: level.demand }]) near(Object.values(result.hourlyAwards[hour.id]).reduce((a,b) => a+b,0), hour.demand);
  }
}
console.log('Market checks passed: crossing curves, demand clearing, all levels, zero schedules, multi-hour balance.');
