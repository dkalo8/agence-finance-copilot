'use strict';

const fc = require('fast-check');
const spendingAgent = require('./spendingAgent');
const anomalyAgent = require('./anomalyAgent');
const goalsAgent = require('./goalsAgent');

// ─── Shared arbitraries ──────────────────────────────────────────────────────

const now = new Date();
const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const currentMonthDate = fc
  .integer({ min: 1, max: 28 })
  .map(d => `${currentYM}-${String(d).padStart(2, '0')}`);

const posAmount = fc.integer({ min: 1, max: 200000 }).map(n => n / 100);

const transaction = fc.record({
  id: fc.string({ minLength: 4, maxLength: 12 }),
  amount: posAmount,
  date: currentMonthDate,
  category: fc.constantFrom('Food', 'Transport', 'Shopping', 'Entertainment'),
  merchant_name: fc.oneof(fc.string({ minLength: 1, maxLength: 20 }), fc.constant(null)),
});

const VALID_SEVERITIES = new Set(['info', 'warning', 'high', 'medium', 'low']);

// ─── spendingAgent ───────────────────────────────────────────────────────────

describe('spendingAgent — property tests', () => {
  test('always returns an array for any transaction input', () => {
    fc.assert(
      fc.property(fc.array(transaction), (txns) => {
        const result = spendingAgent({ transactions: txns });
        expect(Array.isArray(result)).toBe(true);
      })
    );
  });

  test('every insight has type, message, and valid severity', () => {
    fc.assert(
      fc.property(fc.array(transaction, { minLength: 1 }), (txns) => {
        const insights = spendingAgent({ transactions: txns });
        for (const insight of insights) {
          expect(typeof insight.type).toBe('string');
          expect(typeof insight.message).toBe('string');
          expect(typeof insight.severity).toBe('string');
          expect(VALID_SEVERITIES.has(insight.severity)).toBe(true);
        }
      })
    );
  });

  test('top_category insight always present when current-month transactions exist', () => {
    fc.assert(
      fc.property(fc.array(transaction, { minLength: 1 }), (txns) => {
        const insights = spendingAgent({ transactions: txns });
        const hasTopCategory = insights.some(i => i.type === 'top_category');
        expect(hasTopCategory).toBe(true);
      })
    );
  });

  test('category_spike only fires when a category exceeds 30% of total spend', () => {
    fc.assert(
      fc.property(fc.array(transaction, { minLength: 1 }), (txns) => {
        const insights = spendingAgent({ transactions: txns });
        const spikes = insights.filter(i => i.type === 'category_spike');
        if (spikes.length > 0) {
          const total = txns.reduce((sum, t) => sum + t.amount, 0);
          const byCategory = txns.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {});
          const hasHighCategory = Object.values(byCategory).some(
            amt => (amt / total) * 100 > 30
          );
          expect(hasHighCategory).toBe(true);
        }
      })
    );
  });

  test('never returns more than one top_category insight per run', () => {
    fc.assert(
      fc.property(fc.array(transaction, { minLength: 1 }), (txns) => {
        const insights = spendingAgent({ transactions: txns });
        const topCats = insights.filter(i => i.type === 'top_category');
        expect(topCats.length).toBeLessThanOrEqual(1);
      })
    );
  });
});

// ─── anomalyAgent ────────────────────────────────────────────────────────────

describe('anomalyAgent — property tests', () => {
  test('always returns an array for any transaction input', () => {
    fc.assert(
      fc.property(fc.array(transaction), (txns) => {
        const result = anomalyAgent({ transactions: txns });
        expect(Array.isArray(result)).toBe(true);
      })
    );
  });

  test('every insight has type, message, severity, and numeric amount', () => {
    fc.assert(
      fc.property(fc.array(transaction, { minLength: 1 }), (txns) => {
        const insights = anomalyAgent({ transactions: txns });
        for (const insight of insights) {
          expect(typeof insight.type).toBe('string');
          expect(typeof insight.message).toBe('string');
          expect(typeof insight.severity).toBe('string');
          expect(VALID_SEVERITIES.has(insight.severity)).toBe(true);
          expect(typeof insight.amount).toBe('number');
          expect(insight.amount).toBeGreaterThan(0);
        }
      })
    );
  });

  test('large_transaction always fires for amounts strictly greater than 500', () => {
    const largeTx = fc.record({
      id: fc.string({ minLength: 4, maxLength: 12 }),
      amount: fc.integer({ min: 50001, max: 10000000 }).map(n => n / 100), // 500.01–100000
      date: currentMonthDate,
      category: fc.constantFrom('Food', 'Shopping'),
      merchant_name: fc.string({ minLength: 1, maxLength: 20 }),
    });

    fc.assert(
      fc.property(largeTx, (tx) => {
        const insights = anomalyAgent({ transactions: [tx] });
        expect(insights.some(i => i.type === 'large_transaction')).toBe(true);
      })
    );
  });

  test('no large_transaction insight for amounts at or below 500', () => {
    const smallTx = fc.record({
      id: fc.string({ minLength: 4, maxLength: 12 }),
      amount: fc.integer({ min: 1, max: 50000 }).map(n => n / 100), // 0.01–500.00
      date: currentMonthDate,
      category: fc.constantFrom('Food', 'Shopping'),
      merchant_name: fc.string({ minLength: 1, maxLength: 20 }),
    });

    fc.assert(
      fc.property(fc.array(smallTx, { minLength: 1, maxLength: 20 }), (txns) => {
        const insights = anomalyAgent({ transactions: txns });
        expect(insights.some(i => i.type === 'large_transaction')).toBe(false);
      })
    );
  });

  test('duplicate_charge insight has severity medium', () => {
    fc.assert(
      fc.property(fc.array(transaction, { minLength: 1 }), (txns) => {
        const insights = anomalyAgent({ transactions: txns });
        for (const insight of insights.filter(i => i.type === 'duplicate_charge')) {
          expect(insight.severity).toBe('medium');
        }
      })
    );
  });
});

// ─── goalsAgent ──────────────────────────────────────────────────────────────

describe('goalsAgent — property tests', () => {
  const goal = fc.record({
    name: fc.string({ minLength: 1, maxLength: 30 }),
    target: fc.integer({ min: 1000, max: 1000000 }).map(n => n / 100),
    current: fc.constant(0),
    monthly_contribution: fc.integer({ min: 1, max: 100000 }).map(n => n / 100),
  });

  test('always returns an array', () => {
    fc.assert(
      fc.property(fc.array(goal), (goals) => {
        const result = goalsAgent({ goals });
        expect(Array.isArray(result)).toBe(true);
      })
    );
  });

  test('output length always equals input goals length (bijection)', () => {
    fc.assert(
      fc.property(fc.array(goal), (goals) => {
        const insights = goalsAgent({ goals });
        expect(insights.length).toBe(goals.length);
      })
    );
  });

  test('every insight has type, goalName, message, and valid severity', () => {
    fc.assert(
      fc.property(fc.array(goal, { minLength: 1 }), (goals) => {
        const insights = goalsAgent({ goals });
        for (const insight of insights) {
          expect(typeof insight.type).toBe('string');
          expect(typeof insight.goalName).toBe('string');
          expect(typeof insight.message).toBe('string');
          expect(typeof insight.severity).toBe('string');
          expect(VALID_SEVERITIES.has(insight.severity)).toBe(true);
        }
      })
    );
  });

  test('goal_complete returned when current >= target', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          target: fc.integer({ min: 100, max: 100000 }).map(n => n / 100),
          monthly_contribution: fc.integer({ min: 1, max: 10000 }).map(n => n / 100),
        }),
        ({ name, target, monthly_contribution }) => {
          const g = { name, target, current: target, monthly_contribution };
          const [insight] = goalsAgent({ goals: [g] });
          expect(insight.type).toBe('goal_complete');
          expect(insight.severity).toBe('info');
        }
      )
    );
  });

  test('goal_no_contributions returned when monthly_contribution is 0 or null', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          target: fc.integer({ min: 1000, max: 100000 }).map(n => n / 100),
          monthly_contribution: fc.oneof(fc.constant(0), fc.constant(null)),
        }),
        ({ name, target, monthly_contribution }) => {
          const g = { name, target, current: 0, monthly_contribution };
          const [insight] = goalsAgent({ goals: [g] });
          expect(insight.type).toBe('goal_no_contributions');
          expect(insight.severity).toBe('high');
        }
      )
    );
  });

  test('projected date is non-null string for goals with positive contributions and remaining balance', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          target: fc.integer({ min: 500000, max: 1000000 }).map(n => n / 100), // 5000–10000
          monthly_contribution: fc.integer({ min: 100, max: 100000 }).map(n => n / 100),
        }),
        ({ name, target, monthly_contribution }) => {
          const g = { name, target, current: 0, monthly_contribution };
          const [insight] = goalsAgent({ goals: [g] });
          expect(insight.projectedDate).not.toBeNull();
          expect(typeof insight.projectedDate).toBe('string');
          expect(insight.projectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      )
    );
  });

  test('goal goalName in insight always matches the input goal name', () => {
    fc.assert(
      fc.property(fc.array(goal, { minLength: 1, maxLength: 10 }), (goals) => {
        const insights = goalsAgent({ goals });
        for (let i = 0; i < goals.length; i++) {
          expect(insights[i].goalName).toBe(goals[i].name);
        }
      })
    );
  });
});
