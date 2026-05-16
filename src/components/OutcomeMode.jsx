import React, { useState, useEffect } from 'react';
import { CpuChipIcon, ChartBarIcon, ArrowRightIcon, ArrowPathIcon, BookOpenIcon, HeartIcon, PhoneIcon, AcademicCapIcon, LightBulbIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { storyNodes } from './StoryNodes';
import SafetyNotice from './SafetyNotice';
import SupportResources from './SupportResources';
import {
  convertRewardToDisplayScale,
  estimateLearningRatesFromChoices,
  tdUpdate,
} from '../utils/simulationMath';
import {
  buildStepsFromChoiceOutcomeHistories,
  createDecisionSnapshot,
  parseDecisionSnapshot,
} from '../utils/decisionSnapshot';

// ============================================
// OUTCOME MODE: Choose-Your-Own-Adventure
// ============================================
// User choices influence outcomes, creating branching paths
// TD learning tracks confidence changes in real-time

function OutcomeMode({ setSelectedMode }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [phase, setPhase] = useState('landing'); // 'landing' | 'playing' | 'finished'
  const [currentValue, setCurrentValue] = useState(5); // Confidence value (0-10)
  const [valueHistory, setValueHistory] = useState([5]);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [outcomeHistory, setOutcomeHistory] = useState([]);
  const [rpeHistory, setRpeHistory] = useState([]);
  
  // Learning rates (estimated from behavior)
  const [positiveLearningRate, setPositiveLearningRate] = useState(0.5);
  const [negativeLearningRate, setNegativeLearningRate] = useState(0.5);
  
  // Current position in branching story
  const [currentNodeId, setCurrentNodeId] = useState('start');
  
  // Track if we're showing an outcome (separate from the situation)
  const [showingOutcome, setShowingOutcome] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState(null);
  const [pendingNextNodeId, setPendingNextNodeId] = useState(null);
  
  // Load agent decisions for comparison
  const [agentDecisions, setAgentDecisions] = useState(null);
  
  useEffect(() => {
    const agentData = localStorage.getItem('agentDecisions');
    if (agentData) {
      const parsedSnapshot = parseDecisionSnapshot(agentData);
      if (parsedSnapshot) {
        setAgentDecisions(parsedSnapshot);
        return;
      }
      try {
        setAgentDecisions(JSON.parse(agentData));
      } catch (e) {
        console.error('Error parsing agent decisions:', e);
      }
    }
  }, [phase]); // Reload when phase changes (e.g., when returning to landing)
  
  // ============================================
  // BRANCHING SCENARIO STRUCTURE
  // ============================================
  // storyNodes is imported from StoryNodes.jsx
  // Each node has: id, situation, choices (with nextNodeId), and outcomes based on choice

  // ============================================
  // TD LEARNING FUNCTIONS
  // ============================================

  const updateValueWithTD = (reward, currentVal) => {
    return tdUpdate({
      currentValue: currentVal,
      reward,
      positiveLearningRate,
      negativeLearningRate,
    }).nextValue;
  };

  const estimateLearningRates = () => {
    return estimateLearningRatesFromChoices({
      choices: choiceHistory,
      outcomes: outcomeHistory,
      rewardTransform: (reward) => convertRewardToDisplayScale(reward),
    });
  };

  // ============================================
  // CHOICE HANDLING
  // ============================================

  const handleChoice = (choice) => {
    // Record choice
    const updatedChoiceHistory = [...choiceHistory, choice];
    setChoiceHistory(updatedChoiceHistory);
    
    // Track outcomes and values with functional updates to avoid stale state
    let updatedOutcomeHistory = [...outcomeHistory];
    let updatedValueHistory = [...valueHistory];
    let updatedCurrentValue = currentValue;
    
      // Move to next node
      if (choice.nextNodeId) {
        const nextNode = storyNodes[choice.nextNodeId];
        
        // When you make a choice at node A to go to node B:
        // 1. Show the outcome from node B (describes what happened as a result of your choice)
        // 2. After acknowledging the outcome, show node B's situation
        
        if (nextNode && nextNode.outcome) {
          // Record the outcome
          updatedOutcomeHistory = [...updatedOutcomeHistory, nextNode.outcome];
          
          // Update value using TD learning
          const tdResult = tdUpdate({
            currentValue: updatedCurrentValue,
            reward: nextNode.outcome.reward,
            positiveLearningRate,
            negativeLearningRate,
          });
          updatedCurrentValue = tdResult.nextValue;
          updatedValueHistory = [...updatedValueHistory, updatedCurrentValue];
          setRpeHistory([...rpeHistory, { rpe: tdResult.rpe, alpha: tdResult.alpha, reward: tdResult.displayReward }]);
          
          // Update state
          setOutcomeHistory(updatedOutcomeHistory);
          setCurrentValue(updatedCurrentValue);
          setValueHistory(updatedValueHistory);
          
          // Update learning rates based on behavior
          const estimated = estimateLearningRates();
          setPositiveLearningRate(estimated.positiveLearningRate);
          setNegativeLearningRate(estimated.negativeLearningRate);
          
          // Show outcome before showing the next situation
          setPendingOutcome(nextNode.outcome);
          setPendingNextNodeId(choice.nextNodeId);
          setShowingOutcome(true);
        } else {
          // No outcome, just navigate to next node
          setCurrentNodeId(choice.nextNodeId);
        }
      }
  };

  const handleOutcomeAcknowledged = () => {
    // Navigate to the next node and show its situation
    if (pendingNextNodeId) {
      setCurrentNodeId(pendingNextNodeId);
    }
    setShowingOutcome(false);
    setPendingOutcome(null);
    setPendingNextNodeId(null);
  };

  const resetGame = () => {
    setPhase('landing');
    setCurrentValue(5);
    setValueHistory([5]);
    setChoiceHistory([]);
    setOutcomeHistory([]);
    setRpeHistory([]);
    setPositiveLearningRate(0.5);
    setNegativeLearningRate(0.5);
    setCurrentNodeId('start');
    setShowingOutcome(false);
    setPendingOutcome(null);
    setPendingNextNodeId(null);
    // Clear stored user decisions when resetting
    localStorage.removeItem('userDecisions');
  };

  // Store user decisions when game finishes
  useEffect(() => {
    if (phase === 'finished' && choiceHistory.length > 0) {
      const steps = buildStepsFromChoiceOutcomeHistories({
        choices: choiceHistory,
        outcomes: outcomeHistory,
        valueHistory,
      });
      const userDecisions = createDecisionSnapshot({
        source: 'outcome-mode',
        steps,
        valueHistory,
        metadata: {
          choices: choiceHistory,
          outcomes: outcomeHistory,
        },
      });
      localStorage.setItem('userDecisions', JSON.stringify(userDecisions));
    }
  }, [phase, choiceHistory, outcomeHistory, valueHistory]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  if (phase === 'landing') {
    const avgConfidence = valueHistory.length > 0
      ? (valueHistory.reduce((a, b) => a + b, 0) / valueHistory.length).toFixed(1)
      : '5.0';
    
    const maxConfidence = valueHistory.length > 0 ? Math.max(...valueHistory).toFixed(1) : '5.0';
    const minConfidence = valueHistory.length > 0 ? Math.min(...valueHistory).toFixed(1) : '5.0';
    
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 p-8 mb-6 rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                <BookOpenIcon className="w-16 h-16 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-4xl font-semibold text-center mb-4 text-slate-100">
              Outcome Mode
            </h1>
            <p className="text-lg text-slate-300 text-center mb-8 leading-relaxed">
              Get an evaluation of your "depression" levels using confidence levels and learning rates.
            </p>
          </div>
          <SafetyNotice className="mb-6" />
          <SupportResources className="mb-6" />

          {/* Stats Dashboard */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg hover:border-indigo-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <CpuChipIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-100">Your Stats</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">Current Confidence</span>
                    <span className="font-semibold text-slate-200">{currentValue.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 transition-all duration-500 rounded-full shadow-lg"
                      style={{ width: `${(currentValue / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-sm text-slate-400">Average</p>
                    <p className="text-xl font-semibold text-slate-100">{avgConfidence}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Highest</p>
                    <p className="text-xl font-semibold text-slate-300">{maxConfidence}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Lowest</p>
                    <p className="text-xl font-semibold text-slate-400">{minConfidence}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <ChartBarIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-100">Learning Rates</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">Positive Learning (α⁺)</span>
                    <span className="font-semibold text-slate-200">{positiveLearningRate.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    How much you are affected by good experiences
                  </p>
                  <div className="w-full bg-slate-700 h-2 mt-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300 shadow-md"
                      style={{ width: `${(positiveLearningRate / 0.9) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">Negative Learning (α⁻)</span>
                    <span className="font-semibold text-slate-200">{negativeLearningRate.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    How much you are affected by bad experiences
                  </p>
                  <div className="w-full bg-slate-700 h-2 mt-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-300 shadow-md"
                      style={{ width: `${(negativeLearningRate / 0.9) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-700/50 border border-slate-600 p-3 mt-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Note:</strong> These rates are estimated from your choices. 
                    Higher α⁻ means negative experiences have a stronger impact on your confidence. Typically, people with depression have a higher α⁻ and a lower α⁺.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence History Chart */}
          {valueHistory.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 mb-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                Confidence Over Time
              </h3>
              {valueHistory.length === 1 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Make choices to see your confidence change over time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Chart container with explicit height */}
                  <div 
                    className="relative border-b border-l border-slate-600 bg-slate-900"
                    style={{ height: '200px', paddingLeft: '32px' }}
                  >
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400 px-1" style={{ width: '32px' }}>
                      <span>10</span>
                      <span>5</span>
                      <span>0</span>
                    </div>
                    {/* Bars container - using flex with explicit alignment */}
                    <div 
                      className="h-full flex items-end justify-start gap-1"
                      style={{ height: '200px', width: '100%' }}
                    >
                      {valueHistory.map((value, index) => {
                        // Calculate height as percentage of max (10)
                        const heightPercent = (value / 10) * 100;
                        // Ensure minimum visible height (at least 8px)
                        const barHeightPx = Math.max((heightPercent / 100) * 200, 8);
                        const barWidth = `${100 / valueHistory.length}%`;
                        return (
                          <div 
                            key={index} 
                            className="flex flex-col items-center justify-end group relative hover:opacity-80 transition-opacity"
                            style={{ 
                              height: '100%',
                              width: barWidth,
                              minWidth: '20px'
                            }}
                          >
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500 transition-all hover:from-indigo-500 hover:via-purple-400 hover:to-pink-400 cursor-pointer rounded-t shadow-md"
                              style={{ 
                                height: `${barHeightPx}px`,
                                minHeight: '8px'
                              }}
                              title={`Step ${index + 1}: ${value.toFixed(1)}/10`}
                            />
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-700 border border-slate-600 text-slate-100 text-xs px-2 py-1 whitespace-nowrap z-10">
                              {value.toFixed(1)}/10
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex gap-1" style={{ paddingLeft: '32px' }}>
                    {valueHistory.map((value, index) => (
                      <div key={index} className="text-center" style={{ width: `${100 / valueHistory.length}%` }}>
                        <span className="text-xs text-slate-400">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Journey Summary - Table Format */}
          {choiceHistory.length > 0 && (() => {
            const agentStepsWithChoices = agentDecisions?.steps
              ? agentDecisions.steps.filter((step) => step.choice)
              : agentDecisions?.path
                ? agentDecisions.path.filter((p) => p.choice)
                : [];

            return (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 mb-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  Your Journey
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200 border-r border-slate-700">
                          Step
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-400 border-r border-slate-700">
                          Your Decisions
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-amber-400">
                          Agent's Decisions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {choiceHistory.map((choice, index) => {
                        // For the last choice, check if there's a terminal outcome
                        const isLastChoice = index === choiceHistory.length - 1;
                        const outcomeIndex = isLastChoice && outcomeHistory.length > choiceHistory.length 
                          ? outcomeHistory.length - 1 
                          : index;
                        const outcome = outcomeHistory[outcomeIndex];
                        const agentStep = agentStepsWithChoices[index];
                        
                        return (
                          <tr key={index} className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-slate-300 border-r border-slate-700">
                              <div className="flex-shrink-0 w-8 h-8 bg-slate-600 text-slate-100 flex items-center justify-center font-semibold rounded">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-700">
                              <div className="p-3 bg-slate-700/50 border border-slate-600 rounded">
                                <p className="text-slate-200 font-medium mb-1">{choice.text}</p>
                                {outcome && (
                                  <p className="text-sm text-slate-400 mt-1 mb-2">
                                    {outcome.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-slate-500">
                                    Confidence: {choice.confidenceLevel}/10
                                  </span>
                                  {outcome && (() => {
                                    const displayReward = convertRewardToDisplayScale(outcome.reward);
                                    const isPositive = displayReward > 0;
                                    return (
                                      <span className={`text-xs font-medium ${
                                        isPositive ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                        Reward: {isPositive ? '+' : ''}{displayReward.toFixed(1)}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {agentStep?.choice ? (
                                <div className="p-3 bg-slate-700/50 border border-slate-600 rounded">
                                  <p className="text-slate-200 font-medium mb-1">{agentStep.choice.text}</p>
                                  {agentStep.outcome && (
                                    <p className="text-sm text-slate-400 mt-1 mb-2">
                                      {agentStep.outcome.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-slate-500">
                                      Confidence: {agentStep.choice.confidenceLevel}/10
                                    </span>
                                    {agentStep.outcome && (() => {
                                      const displayReward = typeof agentStep.rewardDisplay === 'number'
                                        ? agentStep.rewardDisplay
                                        : convertRewardToDisplayScale(agentStep.outcome.reward);
                                      const isPositive = displayReward > 0;
                                      return (
                                        <span className={`text-xs font-medium ${
                                          isPositive ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                          Reward: {isPositive ? '+' : ''}{displayReward.toFixed(1)}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 bg-slate-700/30 border border-slate-600 rounded text-center">
                                  {index === 0 ? (
                                    <>
                                      <p className="text-slate-300 text-sm mb-3">
                                        Play Agent Mode to compare decisions
                                      </p>
                                      <button
                                        onClick={() => setSelectedMode('agent')}
                                        className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-2 px-4 text-sm border border-amber-500 font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-amber-500/50 rounded-lg inline-flex items-center gap-2"
                                      >
                                        Start Agent Mode
                                        <ArrowRightIcon className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <p className="text-slate-500 text-xs italic">-</p>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Actions */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={choiceHistory.length === 0 ? () => setPhase('playing') : resetGame}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg flex items-center justify-center gap-2"
            >
              {choiceHistory.length === 0 ? 'Start Adventure' : 'Play Again'} 
              {choiceHistory.length === 0 ? <ArrowRightIcon className="w-5 h-5" /> : <ArrowPathIcon className="w-5 h-5" />}
            </button>
            {choiceHistory.length > 0 && (
              <button
                onClick={() => {
                  sessionStorage.setItem('showComparison', 'true');
                  setSelectedMode(null);
                }}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-6 border border-amber-500 font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-amber-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                Compare with Agent
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setSelectedMode(null)}
              className="bg-slate-800 text-slate-300 py-3 px-6 border border-slate-700 font-medium hover:bg-slate-700 transition rounded-lg"
            >
              ← Back to Modes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    // If we're showing an outcome, display it separately
    if (showingOutcome && pendingOutcome) {
      return (
        <div className="min-h-screen bg-slate-900 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-lg shadow-xl">
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Current Confidence</span>
                  <span className="font-semibold text-slate-200">{currentValue.toFixed(1)}/10</span>
                </div>
              <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentValue / 10) * 100}%` }}
                />
              </div>
              </div>

              {/* Outcome display */}
              {(() => {
                const displayReward = convertRewardToDisplayScale(pendingOutcome.reward);
                const isPositive = displayReward > 0;
                
                return (
                  <div className={`p-6 mb-6 border-l-4 rounded-lg ${
                    isPositive
                      ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500' 
                      : 'bg-gradient-to-br from-red-900/30 to-rose-900/20 border-red-500'
                  }`}>
                    <h3 className="text-xl font-semibold text-slate-100 mb-3">Result</h3>
                    <p className="text-lg text-slate-200 leading-relaxed mb-4">
                      {pendingOutcome.description}
                    </p>
                    <p className={`text-lg font-medium ${
                      isPositive
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      Reward: {isPositive ? '+' : ''}{displayReward.toFixed(1)}
                    </p>
                  </div>
                );
              })()}

              {/* Continue button */}
              <button
                onClick={handleOutcomeAcknowledged}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                Continue <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Otherwise, show the current situation
    const currentNode = storyNodes[currentNodeId];
    
    if (!currentNode) {
      setPhase('finished');
      return null;
    }

    // If current node is terminal, show it and provide a button to finish
    // This ensures the user sees all 7 steps before the game ends

    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 p-8">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Current Confidence</span>
                <span className="font-semibold text-slate-200">{currentValue.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentValue / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Situation */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600 p-6 mb-6 rounded-lg">
              <p className="text-lg text-slate-200 leading-relaxed">{currentNode.situation}</p>
            </div>

            {/* Choices - only show if not terminal */}
            {!currentNode.isTerminal && currentNode.choices && (
              <div className="space-y-3 mb-6">
                <p className="font-medium text-slate-300 mb-3">What do you do?</p>
                {currentNode.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left p-4 bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/50 transition rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">{choice.id.toUpperCase()}.</span>
                      <span className="text-sm text-slate-500">Confidence: {choice.confidenceLevel}/10</span>
                    </div>
                    <p className="mt-1 text-slate-200">{choice.text}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Show finish button if terminal */}
            {currentNode.isTerminal && (
              <button
                onClick={() => setPhase('finished')}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                View Final Results <ArrowRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    const finalNode = storyNodes[currentNodeId];
    
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 p-8 rounded-lg shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                  <HeartIcon className="w-16 h-16 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-4xl font-semibold text-slate-100 mb-3">Your Journey Complete</h2>
              <p className="text-lg text-slate-300">
                Thank you for exploring how mental health affects our experiences
              </p>
            </div>
            
            {/* Final Outcome */}
            {finalNode?.outcome && (() => {
              const displayReward = convertRewardToDisplayScale(finalNode.outcome.reward);
              const isPositive = displayReward > 0;
              return (
                <div className={`p-6 mb-8 border-l-4 rounded-lg ${
                  isPositive
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500' 
                    : 'bg-gradient-to-br from-red-900/30 to-rose-900/20 border-red-500'
                }`}>
                  <p className="text-lg text-slate-200 mb-2 font-medium">{finalNode.situation}</p>
                  <p className="text-slate-300 mb-2">{finalNode.outcome.description}</p>
                  <p className={`text-sm font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Reward: {isPositive ? '+' : ''}{displayReward.toFixed(1)}
                  </p>
                </div>
              );
            })()}

            {/* Final Confidence - Simple Display */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600 p-6 mb-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <CpuChipIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100">Your Final Confidence</h3>
              </div>
              <div className="text-5xl font-bold text-indigo-400 mb-3 text-center">
                {currentValue.toFixed(1)}/10
              </div>
              <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(currentValue / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Mental Health Resources */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <LightBulbIcon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-100">Helpful Resources</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Crisis Resources */}
                <div className="bg-gradient-to-br from-red-900/20 to-rose-900/20 border border-red-500/30 p-6 rounded-lg hover:border-red-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <PhoneIcon className="w-6 h-6 text-red-400" />
                    </div>
                    <h4 className="font-semibold text-slate-100">Crisis Support</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    If you're in crisis or having thoughts of self-harm, help is available 24/7.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="https://988lifeline.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors group"
                    >
                      <span className="font-medium">988 Suicide & Crisis Lifeline</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <p className="text-xs text-slate-400">Call or text 988 (US)</p>
                  </div>
                </div>

                {/* Therapy & Treatment */}
                <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 p-6 rounded-lg hover:border-blue-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <AcademicCapIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-slate-100">Find Treatment</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    Professional help can make a real difference. Therapy and medication can help rebalance learning rates.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="https://www.psychologytoday.com/us/therapists" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
                    >
                      <span className="font-medium">Psychology Today Therapist Directory</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a 
                      href="https://www.nami.org/help" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
                    >
                      <span className="font-medium">NAMI HelpLine</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Education & Understanding */}
                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 p-6 rounded-lg hover:border-purple-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <BookOpenIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-slate-100">Learn More</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    Understanding depression is the first step toward healing.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="https://www.nimh.nih.gov/health/topics/depression" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
                    >
                      <span className="font-medium">NIMH: Depression Information</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a 
                      href="https://www.nami.org/About-Mental-Illness/Mental-Health-Conditions/Depression" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
                    >
                      <span className="font-medium">NAMI: Depression Resources</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Self-Help & Support */}
                <div className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border border-teal-500/30 p-6 rounded-lg hover:border-teal-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                      <HeartIcon className="w-6 h-6 text-teal-400" />
                    </div>
                    <h4 className="font-semibold text-slate-100">Support & Community</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    You're not alone. Connect with others who understand what you're going through.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="https://www.nami.org/Support-Education/Support-Groups" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors group"
                    >
                      <span className="font-medium">NAMI Support Groups</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a 
                      href="https://www.depression.org.nz/getting-through/self-help-tools/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors group"
                    >
                      <span className="font-medium">Self-Help Tools & Strategies</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Message */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-l-4 border-indigo-500 p-6 mb-8 rounded-lg">
              <div className="flex items-start gap-3">
                <HeartIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Remember</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Depression isn't a character flaw or something you can "think your way out of." 
                    As this simulation showed, it's a real change in how the brain processes experiences. 
                    Treatment works by helping rebalance these learning mechanisms. Recovery is possible, 
                    and seeking help is a sign of strength.
                  </p>
                </div>
              </div>
            </div>
            <SafetyNotice className="mb-6" />

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setPhase('landing')}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                <ChartBarIcon className="w-5 h-5" /> View Detailed Stats
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem('showComparison', 'true');
                  setSelectedMode(null);
                }}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-6 border border-amber-500 font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-amber-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                Compare with Agent
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={resetGame}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 px-6 border border-slate-600 font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-200 rounded-lg flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" /> Play Again
              </button>
              <button
                onClick={() => setSelectedMode(null)}
                className="flex-1 min-w-[200px] bg-slate-800 text-slate-300 py-3 px-6 border border-slate-700 font-medium hover:bg-slate-700 transition rounded-lg"
              >
                ← Back to Modes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default OutcomeMode;

