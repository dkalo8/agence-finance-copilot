'use strict';

const goalsAgent = require('./goalsAgent');

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const emptyUserData = { transactions: [], balances: [], goals: [] };

// Goal behind pace: needs $3000 more, saving $200/month = 15 months
const behindGoal = { id: 'g1', name: 'Emergency Fund', target: 5000, current: 2000, monthlyContribution: 200 };
// Goal on track: needs $500 more, saving $500/month = 1 month
const onTrackGoal = { id: 'g2', name: 'Vacation Fund', target: 1500, current: 1000, monthlyContribution: 500 };
// Goal with zero contributions
const zeroContribGoal = { id: 'g3', name: 'Car Fund', target: 10000, current: 500, monthlyContribution: 0 };

// ---------------------------------------------------------------------------
// Cycle 1 — returns an array
// ---------------------------------------------------------------------------
describe('goalsAgent — cycle 1: return shape', () => {
  test('returns an array', () => {
    const userData = { transactions: [], balances: [], goals: [behindGoal] };
    const result = goalsAgent(userData);
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Cycle 2 — returns empty array for empty input
// ---------------------------------------------------------------------------
describe('goalsAgent — cycle 2: empty input', () => {
  test('returns empty array when goals list is empty', () => {
    const result = goalsAgent(emptyUserData);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Cycle 3 — insight shape
// ---------------------------------------------------------------------------
describe('goalsAgent — cycle 3: insight shape', () => {
  test('each insight has type, goalName, message, pace, projectedDate', () => {
    const userData = { transactions: [], balances: [], goals: [behindGoal] };
    const result = goalsAgent(userData);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(insight => {
      expect(insight).toHaveProperty('type');
      expect(insight).toHaveProperty('goalName');
      expect(insight).toHaveProperty('message');
      expect(insight).toHaveProperty('pace');
      expect(insight).toHaveProperty('projectedDate');
    });
  });
});

// ---------------------------------------------------------------------------
// Cycle 4 — core logic
// ---------------------------------------------------------------------------
describe('goalsAgent — cycle 4: core logic', () => {
  test('flags a goal that is behind pace (many months to complete)', () => {
    const userData = { transactions: [], balances: [], goals: [behindGoal] };
    const result = goalsAgent(userData);
    const behind = result.find(i => i.type === 'goal_behind');
    expect(behind).toBeDefined();
    expect(behind.goalName).toBe('Emergency Fund');
    expect(behind.pace).toBeGreaterThan(0);
  });

  test('marks a goal as on-track when completion is within 3 months', () => {
    const userData = { transactions: [], balances: [], goals: [onTrackGoal] };
    const result = goalsAgent(userData);
    const onTrack = result.find(i => i.type === 'goal_on_track');
    expect(onTrack).toBeDefined();
    expect(onTrack.goalName).toBe('Vacation Fund');
  });

  test('flags a goal with zero monthly contribution', () => {
    const userData = { transactions: [], balances: [], goals: [zeroContribGoal] };
    const result = goalsAgent(userData);
    const noContrib = result.find(i => i.type === 'goal_no_contributions');
    expect(noContrib).toBeDefined();
    expect(noContrib.goalName).toBe('Car Fund');
    expect(noContrib.severity).toBe('high');
  });
});

// ---------------------------------------------------------------------------
// Cycle 5 — edge cases
// ---------------------------------------------------------------------------
describe('goalsAgent — cycle 5: edge cases', () => {
  test('handles a goal that is already complete (current >= target)', () => {
    const completedGoal = { id: 'g4', name: 'Done Goal', target: 1000, current: 1200, monthlyContribution: 100 };
    const userData = { transactions: [], balances: [], goals: [completedGoal] };
    expect(() => goalsAgent(userData)).not.toThrow();
    const result = goalsAgent(userData);
    expect(Array.isArray(result)).toBe(true);
  });

  test('processes multiple goals and returns an insight for each', () => {
    const userData = { transactions: [], balances: [], goals: [behindGoal, onTrackGoal, zeroContribGoal] };
    const result = goalsAgent(userData);
    expect(result.length).toBe(3);
  });
});
