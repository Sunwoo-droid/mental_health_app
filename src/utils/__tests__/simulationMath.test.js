import {
  convertRewardToDisplayScale,
  estimateLearningRatesFromChoices,
  normalizeRewardForTd,
  tdUpdate,
} from '../simulationMath';

describe('simulationMath utilities', () => {
  test('converts default reward scale correctly', () => {
    expect(convertRewardToDisplayScale(4.5)).toBeCloseTo(0);
    expect(convertRewardToDisplayScale(8)).toBeCloseTo(10);
    expect(convertRewardToDisplayScale(1)).toBeCloseTo(-10);
  });

  test('normalizes reward for TD updates', () => {
    expect(normalizeRewardForTd(4.5)).toBeCloseTo(5);
  });

  test('applies positive learning rate when rpe is positive', () => {
    const result = tdUpdate({
      currentValue: 3,
      reward: 8,
      positiveLearningRate: 0.5,
      negativeLearningRate: 0.9,
    });

    expect(result.rpe).toBeGreaterThan(0);
    expect(result.alpha).toBe(0.5);
    expect(result.nextValue).toBeGreaterThan(3);
  });

  test('applies negative learning rate when rpe is negative', () => {
    const result = tdUpdate({
      currentValue: 8,
      reward: 2,
      positiveLearningRate: 0.2,
      negativeLearningRate: 0.7,
    });

    expect(result.rpe).toBeLessThan(0);
    expect(result.alpha).toBe(0.7);
    expect(result.nextValue).toBeLessThan(8);
  });

  test('estimates learning rates from choice/outcome history', () => {
    const choices = [
      { confidenceLevel: 4 },
      { confidenceLevel: 6 },
      { confidenceLevel: 5 },
      { confidenceLevel: 7 },
    ];
    const outcomes = [{ reward: 2 }, { reward: -3 }, { reward: 2 }];
    const rates = estimateLearningRatesFromChoices({
      choices,
      outcomes,
      rewardTransform: (reward) => reward,
    });

    expect(rates.positiveLearningRate).toBeGreaterThanOrEqual(0.1);
    expect(rates.positiveLearningRate).toBeLessThanOrEqual(0.9);
    expect(rates.negativeLearningRate).toBeGreaterThanOrEqual(0.1);
    expect(rates.negativeLearningRate).toBeLessThanOrEqual(0.9);
  });
});

