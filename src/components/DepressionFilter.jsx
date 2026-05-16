import React, { useState } from 'react';
import { LockClosedIcon, ArrowTrendingDownIcon, ArrowRightIcon, ArrowPathIcon, ExclamationCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { storyNodes } from './StoryNodes';
import { tdUpdate } from '../utils/simulationMath';
import SafetyNotice from './SafetyNotice';
import SupportResources from './SupportResources';

// ============================================
// DEPRESSION FILTER MODE
// ============================================
// Experience how depression's learning rates create a "filter" that blocks
// positive experiences from raising confidence

function DepressionFilter({ setSelectedMode }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'finished'
  const [currentValue, setCurrentValue] = useState(5); // Confidence value (0-10)
  const [valueHistory, setValueHistory] = useState([5]);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [outcomeHistory, setOutcomeHistory] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [blockedChoiceCount, setBlockedChoiceCount] = useState(0);
  const [decisionStepCount, setDecisionStepCount] = useState(0);
  
  // Fixed depressed learning rates (simulating depression)
  const positiveLearningRate = 0.1;  // Low - positive experiences barely register
  const negativeLearningRate = 0.8;  // High - negative experiences hit hard
  
  // ============================================
  // TD LEARNING FUNCTIONS
  // ============================================
  
  // Note: storyNodes is imported from StoryNodes.jsx
  const updateValueWithTD = (reward, currentVal) => {
    return tdUpdate({
      currentValue: currentVal,
      reward,
      positiveLearningRate,
      negativeLearningRate,
    }).nextValue;
  };

  // ============================================
  // CHOICE HANDLING
  // ============================================

  const handleChoice = (choice) => {
    const currentNode = storyNodes[currentNodeId];
    if (currentNode?.choices?.length) {
      const blockedAtThisStep = currentNode.choices.filter((candidateChoice) =>
        isChoiceBlocked(candidateChoice, currentNode.choices, currentValue)
      ).length;
      setBlockedChoiceCount((previousCount) => previousCount + blockedAtThisStep);
      setDecisionStepCount((previousSteps) => previousSteps + 1);
    }
    
    // Record choice
    const updatedChoiceHistory = [...choiceHistory, choice];
    setChoiceHistory(updatedChoiceHistory);
    
    // Track outcomes and values
    let updatedOutcomeHistory = [...outcomeHistory];
    let updatedValueHistory = [...valueHistory];
    let updatedCurrentValue = currentValue;
    
    // Move to next node
    if (choice.nextNodeId) {
      const nextNode = storyNodes[choice.nextNodeId];
      
      // Record outcome of the node we're ARRIVING at (not leaving)
      // This way the outcome shows up when you arrive at the new node
      if (nextNode.outcome) {
        updatedOutcomeHistory = [...updatedOutcomeHistory, nextNode.outcome];
        
        // Update value using TD learning with depressed rates
        updatedCurrentValue = updateValueWithTD(nextNode.outcome.reward, updatedCurrentValue);
        updatedValueHistory = [...updatedValueHistory, updatedCurrentValue];
        
        // Update state
        setOutcomeHistory(updatedOutcomeHistory);
        setCurrentValue(updatedCurrentValue);
        setValueHistory(updatedValueHistory);
      }
      
      if (nextNode.isTerminal) {
        // Handle terminal node - already processed outcome above
        setPhase('finished');
      } else {
        setCurrentNodeId(choice.nextNodeId);
      }
    }
  };

  const resetGame = () => {
    setPhase('intro');
    setCurrentValue(5);
    setValueHistory([5]);
    setChoiceHistory([]);
    setOutcomeHistory([]);
    setCurrentNodeId('start');
    setBlockedChoiceCount(0);
    setDecisionStepCount(0);
  };

  // Check if a choice is blocked (requires confidence higher than current)
  // Always allow at least one choice (the one with the lowest confidenceLevel) to prevent deadlock
  const isChoiceBlocked = (choice, allChoices, currentValue) => {
    // Find the minimum confidence level among all choices
    const minConfidenceLevel = Math.min(...allChoices.map(c => c.confidenceLevel));
    
    // If this is the choice with the minimum confidence level, always allow it
    // This ensures at least one choice is always available, even if confidence is very low
    if (choice.confidenceLevel === minConfidenceLevel) {
      return false;
    }
    
    // Otherwise, block if it requires more confidence than current
    return choice.confidenceLevel > currentValue;
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-rose-500/30 p-8 mb-6 rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-2xl border border-rose-500/30">
                <FunnelIcon className="w-16 h-16 text-rose-400" />
              </div>
            </div>
            <h1 className="text-4xl font-medium text-center mb-4 text-slate-100">
              Depression Filter Mode
            </h1>
            <p className="text-lg text-slate-300 text-center mb-8">
              This mode demonstrates, mathematically, how depression can reshape decisions over time.
              You will see confidence update asymmetrically, then watch higher-confidence actions become unavailable.
            </p>
          </div>
          <SafetyNotice className="mb-6" />
          <SupportResources className="mb-6" />

          {/* Explanation */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 mb-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-medium text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
              How This Mode Works
            </h2>
            
            <div className="space-y-6">
              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 ">
                <h3 className="font-medium text-slate-100 mb-2">Core Mechanism</h3>
                <p className="text-slate-300 mb-4">
                  Confidence updates follow:
                </p>
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg mb-4">
                  <p className="text-sm text-slate-300 font-mono">V(t+1) = V(t) + α[r - V(t)]</p>
                  <p className="text-xs text-slate-400 mt-1">
                    This mode uses α⁺ = 0.1 for positive updates and α⁻ = 0.8 for negative updates.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-500/10 rounded-lg">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="font-medium text-slate-100">How much good experiences affect confidence</span>
                    </div>
                    <p className="text-2xl font-medium text-green-400 mb-1">0.1</p>
                    <p className="text-sm text-slate-300">
                      Good experiences only produce small recovery updates.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-red-500/10 rounded-lg">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="font-medium text-slate-100">How much bad experiences affect confidence</span>
                    </div>
                    <p className="text-2xl font-medium text-red-400 mb-1">0.8</p>
                    <p className="text-sm text-slate-300">
                      Negative experiences produce large downward updates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 ">
                <h3 className="font-medium text-slate-100 mb-2">What To Watch For (Realization Point)</h3>
                <p className="text-slate-300 mb-3">
                  This is the key insight: as confidence drops, the decision space narrows.
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                  <li><strong>Locked choices appear</strong> when required confidence exceeds current confidence.</li>
                  <li><strong>Positive outcomes help less</strong>, so recovery is slow.</li>
                  <li><strong>Negative outcomes dominate</strong>, causing repeated confidence loss.</li>
                  <li><strong>Behavior changes naturally</strong> toward lower-effort, avoidance-style choices.</li>
                </ul>
              </div>

              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 rounded-lg">
                <h3 className="font-medium text-slate-100 mb-2">Instruction</h3>
                <p className="text-sm text-slate-300 mb-3">
                  As you play, monitor two values:
                </p>
                <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside mb-3">
                  <li><strong>Net confidence trend</strong> from the starting point.</li>
                  <li><strong>Number of blocked options</strong> caused by low confidence.</li>
                </ul>
                <p className="text-sm text-slate-300">
                  If confidence keeps falling and options keep locking, that is the intended realization:
                  depression can change the update process itself, which then changes what actions feel possible.
                </p>
              </div>

              <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 ">
                <div className="flex items-start gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-slate-100 mb-2">Interpretation</h3>
                    <p className="text-slate-300">
                      This is not about motivation or character. The model shows how weighted learning from experience
                      can produce avoidance and disengagement even without any intention to withdraw.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setPhase('playing')}
              className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 px-6 font-medium hover:from-rose-500 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-rose-500/50 rounded-lg flex items-center justify-center gap-2"
            >
              Begin Experience <ArrowRightIcon className="w-5 h-5" />
            </button>
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
    const currentNode = storyNodes[currentNodeId];
    
    if (!currentNode) {
      setPhase('finished');
      return null;
    }
    const blockedChoicesNow = currentNode.choices
      ? currentNode.choices.filter((choice) => isChoiceBlocked(choice, currentNode.choices, currentValue)).length
      : 0;
    const confidenceDeltaFromStart = currentValue - valueHistory[0];

    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-lg shadow-xl">
            <div className="mb-6 bg-gradient-to-br from-rose-900/20 to-pink-900/20 border border-rose-500/30 rounded-lg p-4">
              <h3 className="text-slate-100 font-medium mb-2">Realization Tracker</h3>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-800/70 border border-slate-700 rounded p-3">
                  <p className="text-slate-400">Net confidence change</p>
                  <p className={`font-semibold ${confidenceDeltaFromStart < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {confidenceDeltaFromStart >= 0 ? '+' : ''}{confidenceDeltaFromStart.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded p-3">
                  <p className="text-slate-400">Blocked right now</p>
                  <p className="font-semibold text-rose-300">{blockedChoicesNow}</p>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded p-3">
                  <p className="text-slate-400">Blocked encountered</p>
                  <p className="font-semibold text-rose-300">{blockedChoiceCount}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Here, α⁺=0.1 and α⁻=0.8. This asymmetry is designed to show how decision freedom can shrink over time.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Current Confidence</span>
                <span className="font-medium text-slate-400">{currentValue.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentValue / 10) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Positive Learning: {positiveLearningRate}</span>
                <span>Negative Learning: {negativeLearningRate}</span>
              </div>
            </div>

            {/* Show last outcome if available (from previous choice) - at top */}
            {outcomeHistory.length > 0 && outcomeHistory[outcomeHistory.length - 1] && valueHistory.length >= 2 && (() => {
              const lastOutcome = outcomeHistory[outcomeHistory.length - 1];
              const previousValue = valueHistory[valueHistory.length - 2];
              const confidenceChange = currentValue - previousValue;
              const isPositiveChange = confidenceChange > 0;
              const learningRateUsed = isPositiveChange ? positiveLearningRate : negativeLearningRate;
              
              return (
                <div className={`p-6 mb-6 border-l-4 rounded-lg ${
                  isPositiveChange 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500' 
                    : 'bg-gradient-to-br from-red-900/30 to-rose-900/20 border-red-500'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100 mb-2">Outcome</h3>
                      <p className="text-slate-300 mb-2">{lastOutcome.description}</p>
                    </div>
                    <div className={`text-right ml-4 ${
                      isPositiveChange 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      <div className="text-2xl font-medium">
                        {lastOutcome.reward > 0 ? '+' : ''}
                        {lastOutcome.reward}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">Reward</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 mt-3 border border-slate-600 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Confidence Change:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">
                          {previousValue.toFixed(1)}/10
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`font-medium ${
                          isPositiveChange
                            ? 'text-green-400'
                            : confidenceChange < 0
                            ? 'text-slate-400'
                            : 'text-slate-300'
                        }`}>
                          {currentValue.toFixed(1)}/10
                        </span>
                        {confidenceChange !== 0 && (
                          <span className={`text-sm font-medium ${
                            isPositiveChange
                              ? 'text-green-400'
                              : 'text-slate-400'
                          }`}>
                            ({isPositiveChange ? '+' : ''}
                            {confidenceChange.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      With depressed learning rates (α{isPositiveChange ? '⁺' : '⁻'}={learningRateUsed}), this outcome 
                      {isPositiveChange ? ' barely increased' : ' significantly decreased'} your confidence.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Situation */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 mb-6 rounded-lg border border-slate-600">
              <p className="text-lg text-slate-100">{currentNode.situation}</p>
            </div>

            {/* Choices */}
            <div className="space-y-3 mb-6">
              <p className="font-medium text-slate-300 mb-3">What do you do?</p>
              {currentNode.choices.map((choice) => {
                const blocked = isChoiceBlocked(choice, currentNode.choices, currentValue);
                return (
                  <button
                    key={choice.id}
                    onClick={() => !blocked && handleChoice(choice)}
                    disabled={blocked}
                    className={`w-full text-left p-4 transition rounded-lg ${
                      blocked
                        ? 'bg-slate-800 border border-slate-600 cursor-not-allowed opacity-60'
                        : 'bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${blocked ? 'text-gray-400' : 'text-slate-400'}`}>
                          {choice.id.toUpperCase()}.
                        </span>
                        {blocked && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <LockClosedIcon className="w-3 h-3" />
                            <span>Requires confidence {choice.confidenceLevel}/10</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-sm ${blocked ? 'text-gray-400' : 'text-gray-500'}`}>
                        Confidence: {choice.confidenceLevel}/10
                      </span>
                    </div>
                    <p className={`${blocked ? 'text-gray-400' : 'text-slate-100'}`}>{choice.text}</p>
                    {blocked && (
                      <p className="text-xs text-slate-400 mt-2 italic">
                        This choice is blocked in the simulation to represent how low confidence might make certain actions 
                        feel impossible or overwhelming. Your current confidence ({currentValue.toFixed(1)}/10) is below what 
                        this choice represents.
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-medium text-slate-100 mb-6 text-center">Experience Complete</h2>
            <div className="bg-gradient-to-br from-rose-900/20 to-pink-900/20 border border-rose-500/30 rounded-lg p-5 mb-6">
              <h3 className="text-slate-100 font-medium mb-2">Realization Summary</h3>
              <p className="text-slate-300 text-sm mb-3">
                This run demonstrates how mathematically biased updates can narrow behavior over time.
              </p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-800/70 border border-slate-700 rounded p-3">
                  <p className="text-slate-400">Decision steps</p>
                  <p className="font-semibold text-slate-200">{decisionStepCount}</p>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded p-3">
                  <p className="text-slate-400">Blocked choices encountered</p>
                  <p className="font-semibold text-rose-300">{blockedChoiceCount}</p>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded p-3">
                  <p className="text-slate-400">Net confidence change</p>
                  <p className={`font-semibold ${(currentValue - valueHistory[0]) < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {(currentValue - valueHistory[0]) >= 0 ? '+' : ''}{(currentValue - valueHistory[0]).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Final Outcome - integrated with confidence change */}
            {outcomeHistory.length > 0 && outcomeHistory[outcomeHistory.length - 1] && valueHistory.length >= 2 && (() => {
              const lastOutcome = outcomeHistory[outcomeHistory.length - 1];
              const previousValue = valueHistory[valueHistory.length - 2];
              const confidenceChange = currentValue - previousValue;
              const isPositiveChange = confidenceChange > 0;
              const learningRateUsed = isPositiveChange ? positiveLearningRate : negativeLearningRate;
              
              return (
                <div className={`p-6 mb-6 border-l-4 rounded-lg ${
                  isPositiveChange
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500'
                    : 'bg-gradient-to-br from-red-900/30 to-rose-900/20 border-red-500'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100 mb-2">Final Outcome</h3>
                      <p className="text-slate-300 mb-2">{lastOutcome.description}</p>
                    </div>
                    <div className={`text-right ml-4 ${
                      isPositiveChange
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      <div className="text-2xl font-medium">
                        {lastOutcome.reward > 0 ? '+' : ''}
                        {lastOutcome.reward}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">Reward</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 mt-3 border border-slate-600 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Confidence Change:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">
                          {previousValue.toFixed(1)}/10
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`font-medium ${
                          isPositiveChange
                            ? 'text-green-400'
                            : confidenceChange < 0
                            ? 'text-slate-400'
                            : 'text-slate-300'
                        }`}>
                          {currentValue.toFixed(1)}/10
                        </span>
                        {confidenceChange !== 0 && (
                          <span className={`text-sm font-medium ${
                            isPositiveChange
                              ? 'text-green-400'
                              : 'text-slate-400'
                          }`}>
                            ({isPositiveChange ? '+' : ''}
                            {confidenceChange.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      With depressed learning rates (α{isPositiveChange ? '⁺' : '⁻'}={learningRateUsed}), this outcome 
                      {isPositiveChange ? ' barely increased' : ' significantly decreased'} your confidence.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Final Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-lg border border-slate-600">
                <h3 className="font-medium text-slate-100 mb-4">Final Confidence</h3>
                <div className="text-4xl font-medium text-slate-400 mb-2">
                  {currentValue.toFixed(1)}/10
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(currentValue / 10) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-slate-300 mt-2">
                  Notice how your confidence stayed low despite positive experiences in this simulation. 
                  This illustrates one way the "mental filter" concept might manifest.
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-lg border border-slate-600">
                <h3 className="font-medium text-slate-100 mb-4">Learning Rates Used</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Positive (α⁺)</span>
                      <span className="font-medium text-slate-400">{positiveLearningRate.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(positiveLearningRate / 0.9) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Very low - positive experiences barely register</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Negative (α⁻)</span>
                      <span className="font-medium text-slate-400">{negativeLearningRate.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(negativeLearningRate / 0.9) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Very high - negative experiences hit hard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-l-4 border-slate-600 p-6 mb-6 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-2">Reflection</h3>
              <p className="text-slate-300">
                The main takeaway is process-level: when positive updates are tiny and negative updates are large, confidence
                can decline into a range where many actions feel inaccessible. From the outside this can look like withdrawal,
                but this model shows one mechanism for why that withdrawal can occur.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 px-6 font-medium hover:from-rose-500 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-rose-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" /> Play Again
              </button>
              <button
                onClick={() => setSelectedMode(null)}
                className="bg-slate-800 text-slate-300 py-3 px-6 border border-slate-700 font-medium hover:bg-slate-700 transition rounded-lg"
              >
                ← Back to Modes
              </button>
            </div>
            <SafetyNotice className="mt-6" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default DepressionFilter;
