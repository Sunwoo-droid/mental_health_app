const DEFAULT_REWARD_SCALE_CONFIG = {
  inputCenter: 4.5,
  inputHalfRange: 3.5,
  displayMultiplier: 10,
  normalizedBase: 5,
  normalizedMultiplier: 0.5,
};

export const DEFAULT_LEARNING_RATE_ESTIMATION_CONFIG = {
  minAlpha: 0.1,
  maxAlpha: 0.9,
  fallbackAlpha: 0.5,
  shrinkFactor: 0.8,
};

function clamp(value, minValue, maxValue) {
  return Math.min(maxValue, Math.max(minValue, value));
}

export function convertRewardToDisplayScale(
  reward,
  config = DEFAULT_REWARD_SCALE_CONFIG
) {
  return ((reward - config.inputCenter) / config.inputHalfRange) * config.displayMultiplier;
}

export function normalizeRewardForTd(
  reward,
  config = DEFAULT_REWARD_SCALE_CONFIG
) {
  const displayReward = convertRewardToDisplayScale(reward, config);
  return config.normalizedBase + (displayReward * config.normalizedMultiplier);
}

export function computeRpe({ normalizedReward, currentValue }) {
  return normalizedReward - currentValue;
}

export function tdUpdate({
  currentValue,
  reward,
  positiveLearningRate,
  negativeLearningRate,
  config = DEFAULT_REWARD_SCALE_CONFIG,
}) {
  const normalizedReward = normalizeRewardForTd(reward, config);
  const rpe = computeRpe({ normalizedReward, currentValue });
  const alpha = rpe > 0 ? positiveLearningRate : negativeLearningRate;
  const nextValue = clamp(currentValue + (alpha * rpe), 0, 10);

  return {
    nextValue,
    normalizedReward,
    rpe,
    alpha,
    displayReward: convertRewardToDisplayScale(reward, config),
  };
}

export function estimateLearningRatesFromChoices({
  choices,
  outcomes,
  config = DEFAULT_LEARNING_RATE_ESTIMATION_CONFIG,
  getChoiceConfidence = (choice) => choice?.confidenceLevel ?? 5,
  getOutcomeReward = (outcome) => outcome?.reward,
  rewardTransform = (reward) => reward,
}) {
  if (!choices || !outcomes || choices.length < 2 || outcomes.length === 0) {
    return {
      positiveLearningRate: config.fallbackAlpha,
      negativeLearningRate: config.fallbackAlpha,
    };
  }

  const positiveUpdates = [];
  const negativeUpdates = [];

  const maxIndex = Math.min(outcomes.length, choices.length - 1);
  for (let index = 0; index < maxIndex; index += 1) {
    const currentConfidence = getChoiceConfidence(choices[index]);
    const nextConfidence = getChoiceConfidence(choices[index + 1]);
    const confidenceChange = nextConfidence - currentConfidence;
    const rawReward = getOutcomeReward(outcomes[index]);

    if (typeof rawReward !== "number") {
      continue;
    }

    const reward = rewardTransform(rawReward);
    if (reward > 0) {
      positiveUpdates.push(Math.max(0, confidenceChange / reward));
    } else if (reward < 0) {
      negativeUpdates.push(Math.max(0, -confidenceChange / Math.abs(reward)));
    }
  }

  const averageOrFallback = (values) => {
    if (!values.length) {
      return config.fallbackAlpha;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const positiveLearningRate = clamp(
    averageOrFallback(positiveUpdates) * config.shrinkFactor,
    config.minAlpha,
    config.maxAlpha
  );
  const negativeLearningRate = clamp(
    averageOrFallback(negativeUpdates) * config.shrinkFactor,
    config.minAlpha,
    config.maxAlpha
  );

  return {
    positiveLearningRate: parseFloat(positiveLearningRate.toFixed(2)),
    negativeLearningRate: parseFloat(negativeLearningRate.toFixed(2)),
  };
}

