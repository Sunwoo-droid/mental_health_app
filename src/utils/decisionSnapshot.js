import { convertRewardToDisplayScale } from "./simulationMath";

export const DECISION_SNAPSHOT_VERSION = 2;

function normalizeStep(step, stepIndex) {
  return {
    stepIndex,
    nodeId: step?.nodeId ?? null,
    choice: step?.choice ?? null,
    outcome: step?.outcome ?? null,
    valueBefore: typeof step?.valueBefore === "number" ? step.valueBefore : null,
    valueAfter: typeof step?.valueAfter === "number" ? step.valueAfter : null,
    confidenceChoice:
      typeof step?.confidenceChoice === "number" ? step.confidenceChoice : null,
    rewardDisplay:
      typeof step?.rewardDisplay === "number" ? step.rewardDisplay : null,
  };
}

function outcomeForStep(outcomes, index, choicesLength) {
  const isLastChoice = index === choicesLength - 1;
  const hasTerminalOutcome = outcomes.length > choicesLength;
  if (isLastChoice && hasTerminalOutcome) {
    return outcomes[outcomes.length - 1];
  }
  return outcomes[index];
}

export function buildStepsFromChoiceOutcomeHistories({
  choices = [],
  outcomes = [],
  valueHistory = [],
  nodeIds = [],
}) {
  const maxSteps = Math.max(choices.length, outcomes.length);
  const steps = [];

  for (let stepIndex = 0; stepIndex < maxSteps; stepIndex += 1) {
    const choice = choices[stepIndex] ?? null;
    const outcome = outcomeForStep(outcomes, stepIndex, choices.length) ?? null;
    const rewardDisplay =
      typeof outcome?.reward === "number"
        ? convertRewardToDisplayScale(outcome.reward)
        : null;

    steps.push(
      normalizeStep(
        {
          nodeId: nodeIds[stepIndex] ?? null,
          choice,
          outcome,
          valueBefore: valueHistory[stepIndex],
          valueAfter: valueHistory[stepIndex + 1],
          confidenceChoice: choice?.confidenceLevel ?? null,
          rewardDisplay,
        },
        stepIndex
      )
    );
  }

  return steps;
}

export function buildStepsFromAgentPath({ path = [], valueHistory = [] }) {
  const steps = [];
  let runningValueBefore =
    typeof valueHistory[0] === "number" ? valueHistory[0] : null;

  for (let index = 0; index < path.length; index += 1) {
    const item = path[index];
    if (!item?.choice && !item?.outcome) {
      continue;
    }

    const rewardDisplay =
      typeof item?.outcome?.reward === "number"
        ? convertRewardToDisplayScale(item.outcome.reward)
        : null;
    const valueAfter =
      typeof item?.value === "number"
        ? item.value
        : typeof valueHistory[index + 1] === "number"
          ? valueHistory[index + 1]
          : runningValueBefore;

    steps.push(
      normalizeStep(
        {
          nodeId: item?.node?.id ?? null,
          choice: item?.choice ?? null,
          outcome: item?.outcome ?? null,
          valueBefore: runningValueBefore,
          valueAfter,
          confidenceChoice: item?.choice?.confidenceLevel ?? null,
          rewardDisplay,
        },
        steps.length
      )
    );

    runningValueBefore = valueAfter;
  }

  return steps;
}

export function createDecisionSnapshot({
  source,
  steps = [],
  valueHistory = [],
  metadata = {},
}) {
  return {
    version: DECISION_SNAPSHOT_VERSION,
    source,
    steps: steps.map((step, index) => normalizeStep(step, index)),
    valueHistory,
    timestamp: Date.now(),
    metadata,
  };
}

export function validateDecisionSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return false;
  }
  if (!Array.isArray(snapshot.steps) || !snapshot.steps.length) {
    return false;
  }
  return snapshot.steps.every((step, index) => {
    return (
      step &&
      typeof step === "object" &&
      typeof step.stepIndex === "number" &&
      step.stepIndex === index
    );
  });
}

export function parseDecisionSnapshot(raw) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (validateDecisionSnapshot(parsed)) {
      return parsed;
    }
  } catch (error) {
    return null;
  }

  return null;
}

export function getComparisonState({ userSnapshot, agentSnapshot }) {
  const hasUser = validateDecisionSnapshot(userSnapshot);
  const hasAgent = validateDecisionSnapshot(agentSnapshot);

  if (hasUser && hasAgent) {
    return "both";
  }
  if (hasUser) {
    return "userOnly";
  }
  if (hasAgent) {
    return "agentOnly";
  }
  return "none";
}

