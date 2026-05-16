import {
  buildStepsFromAgentPath,
  buildStepsFromChoiceOutcomeHistories,
  createDecisionSnapshot,
  getComparisonState,
  validateDecisionSnapshot,
} from '../decisionSnapshot';

describe('decisionSnapshot utilities', () => {
  test('builds user steps with terminal outcome alignment', () => {
    const steps = buildStepsFromChoiceOutcomeHistories({
      choices: [{ confidenceLevel: 4 }, { confidenceLevel: 6 }],
      outcomes: [{ reward: 5 }, { reward: 6 }, { reward: 7 }],
      valueHistory: [5, 5.5, 6.2],
    });

    expect(steps).toHaveLength(3);
    expect(steps[1].outcome.reward).toBe(7);
    expect(steps[0].valueBefore).toBe(5);
    expect(steps[0].valueAfter).toBe(5.5);
  });

  test('builds agent path steps', () => {
    const steps = buildStepsFromAgentPath({
      path: [
        {
          node: { id: 'start' },
          choice: { text: 'A', confidenceLevel: 5 },
          outcome: { reward: 6 },
          value: 5.8,
        },
      ],
      valueHistory: [5, 5.8],
    });

    expect(steps).toHaveLength(1);
    expect(steps[0].nodeId).toBe('start');
    expect(steps[0].valueBefore).toBe(5);
    expect(steps[0].valueAfter).toBe(5.8);
  });

  test('creates and validates a decision snapshot', () => {
    const snapshot = createDecisionSnapshot({
      source: 'test',
      steps: [{ stepIndex: 0, choice: { text: 'A' } }],
      valueHistory: [5, 6],
    });

    expect(validateDecisionSnapshot(snapshot)).toBe(true);
  });

  test('derives comparison states correctly', () => {
    const valid = createDecisionSnapshot({
      source: 'test',
      steps: [{ stepIndex: 0, choice: { text: 'A' } }],
      valueHistory: [5, 6],
    });

    expect(getComparisonState({ userSnapshot: null, agentSnapshot: null })).toBe('none');
    expect(getComparisonState({ userSnapshot: valid, agentSnapshot: null })).toBe('userOnly');
    expect(getComparisonState({ userSnapshot: null, agentSnapshot: valid })).toBe('agentOnly');
    expect(getComparisonState({ userSnapshot: valid, agentSnapshot: valid })).toBe('both');
  });
});

