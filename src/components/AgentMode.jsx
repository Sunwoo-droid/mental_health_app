import React, { useState } from 'react';
import { ArrowRightIcon, ArrowPathIcon, BoltIcon, ChartBarIcon, AcademicCapIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { storyNodes } from './StoryNodes';
import { tdUpdate } from '../utils/simulationMath';
import { buildStepsFromAgentPath, createDecisionSnapshot } from '../utils/decisionSnapshot';
import SafetyNotice from './SafetyNotice';
import SupportResources from './SupportResources';

// ============================================
// AGENT MODE COMPONENT
// ============================================
// This component allows users to adjust agent parameters and see how
// different learning rates affect the agent's experience through scenarios

function AgentMode({ setSelectedMode }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Current phase of the experience
  const [phase, setPhase] = useState('agent-config');
  // Phases: 'agent-config' → 'comparison' → 'math-details'
  const [showMathDetails, setShowMathDetails] = useState(false);
  
  // Agent's journey
  const [agentChoices, setAgentChoices] = useState([]);
  const [agentValueHistory, setAgentValueHistory] = useState([5]);
  const [agentPath, setAgentPath] = useState([]); // Track full path: [{node, choice, outcome}]
  const [agentParameters, setAgentParameters] = useState({
    positiveLearningRate: 0.5,  // Mental filter default
    negativeLearningRate: 0.5,   // Mental filter default
    startingConfidence: 5        // Starting confidence level (0-10)
  });

  // ============================================
  // BRANCHING SCENARIO STRUCTURE
  // ============================================
  // storyNodes is imported from StoryNodes.jsx
  // Each node has: id, situation, choices (with nextNodeId), and outcomes
  // The agent navigates through this branching structure

  // ============================================
  // AGENT SIMULATION (Real TD Learning!)
  // AGENT SIMULATION (Real TD Learning!)
  // ============================================

  const runAgentSimulation = () => {
    // Agent uses actual TD learning equations
    const pathData = {
      choices: [],
      valueHistory: [],
      rpeHistory: [],
      path: [] // Track full path: [{node, choice, outcome, value}]
    };
    
    let currentValue = agentParameters.startingConfidence; // Start at user-defined confidence
    let currentNodeId = 'start'; // Start at the beginning
    let maxSteps = 50; // Safety limit to prevent infinite loops
    
    // Navigate through branching story structure
    while (currentNodeId && maxSteps > 0) {
      const node = storyNodes[currentNodeId];
      if (!node) break;
      
      pathData.valueHistory.push(currentValue);
      
      // If this is a terminal node, apply outcome and end
      if (node.isTerminal) {
        const outcome = node.outcome;
        const tdResult = tdUpdate({
          currentValue,
          reward: outcome.reward,
          positiveLearningRate: agentParameters.positiveLearningRate,
          negativeLearningRate: agentParameters.negativeLearningRate,
        });
        currentValue = tdResult.nextValue;
        pathData.valueHistory.push(currentValue);
        pathData.rpeHistory.push({
          rpe: tdResult.rpe,
          alpha: tdResult.alpha,
          reward: outcome.reward,
          normalizedReward: tdResult.normalizedReward,
        });
        pathData.path.push({ node, choice: null, outcome: node.outcome, value: currentValue });
        break;
      }
      
      // AGENT DECISION MAKING:
      // Pick choice based on which matches current value best
      // Higher value = more confident = pick more confident options
      
      if (!node.choices || node.choices.length === 0) break;
      
      let bestChoice = node.choices[0];
      let smallestDiff = Math.abs(node.choices[0].confidenceLevel - currentValue);
      
      for (let choice of node.choices) {
        const diff = Math.abs(choice.confidenceLevel - currentValue);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          bestChoice = choice;
        }
      }
      
      pathData.choices.push(bestChoice);
      
      // Apply outcome from current node (if it exists) BEFORE moving to next node
      let outcome = null;
      if (node.outcome) {
        outcome = node.outcome;
        const tdResult = tdUpdate({
          currentValue,
          reward: outcome.reward,
          positiveLearningRate: agentParameters.positiveLearningRate,
          negativeLearningRate: agentParameters.negativeLearningRate,
        });
        currentValue = tdResult.nextValue;
        pathData.rpeHistory.push({
          rpe: tdResult.rpe,
          alpha: tdResult.alpha,
          reward: outcome.reward,
          normalizedReward: tdResult.normalizedReward,
          oldValue: pathData.valueHistory[pathData.valueHistory.length - 1],
          newValue: currentValue,
        });
        // Push updated value to history after applying outcome
        pathData.valueHistory.push(currentValue);
      }
      
      // Record this step in the path
      pathData.path.push({ node, choice: bestChoice, outcome, value: currentValue });
      
      // Move to next node
      currentNodeId = bestChoice.nextNodeId;
      maxSteps--;
    }
    
    setAgentChoices(pathData.choices);
    setAgentValueHistory(pathData.valueHistory);
    setAgentPath(pathData.path);
    setPhase('comparison');
    
    // Store agent decisions in localStorage
    const steps = buildStepsFromAgentPath({
      path: pathData.path,
      valueHistory: pathData.valueHistory,
    });
    const agentDecisions = createDecisionSnapshot({
      source: 'agent-mode',
      steps,
      valueHistory: pathData.valueHistory,
      metadata: {
        path: pathData.path,
        choices: pathData.choices,
        parameters: agentParameters,
      },
    });
    localStorage.setItem('agentDecisions', JSON.stringify(agentDecisions));
  };

  // ============================================
  // RENDER FUNCTIONS FOR EACH PHASE
  // ============================================

  // PHASE: Agent Configuration
  if (phase === 'agent-config') {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 p-8 rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30">
                <BoltIcon className="w-16 h-16 text-amber-400" />
              </div>
            </div>
            <h2 className="text-3xl font-medium text-center mb-6 text-slate-100">
              Agent Mode
            </h2>

            <p className="text-slate-300 mb-8 text-center">
              Experiment with how different "personality settings" affect someone's experience. Adjust how much 
              someone is affected by good vs. bad experiences, then watch how an AI agent navigates the same scenarios.
            </p>
            <SafetyNotice className="mb-6" />
            <SupportResources className="mb-8" />

            {/* Current Parameters */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-lg border border-slate-600">
                <h3 className="font-medium text-slate-300 mb-4 text-center flex items-center justify-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                  Agent Parameters
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">How much good experiences affect confidence</span>
                      <span className="font-medium text-green-400">{agentParameters.positiveLearningRate}</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300 shadow-md"
                        style={{ width: `${agentParameters.positiveLearningRate * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">How much bad experiences affect confidence</span>
                      <span className="font-medium text-red-400">{agentParameters.negativeLearningRate}</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-300 shadow-md"
                        style={{ width: `${agentParameters.negativeLearningRate * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Starting Confidence Level</span>
                      <span className="font-medium text-amber-400">{agentParameters.startingConfidence}/10</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300 shadow-md"
                        style={{ width: `${(agentParameters.startingConfidence / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustable Parameters */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 mb-8 rounded-lg border border-slate-600">
              <h3 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                Adjust Agent Parameters
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    How much good experiences affect confidence: {agentParameters.positiveLearningRate}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={agentParameters.positiveLearningRate}
                    onChange={(e) => setAgentParameters({
                      ...agentParameters,
                      positiveLearningRate: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower = good experiences barely help (like depression). Higher = good experiences help build confidence.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    How much bad experiences affect confidence: {agentParameters.negativeLearningRate}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={agentParameters.negativeLearningRate}
                    onChange={(e) => setAgentParameters({
                      ...agentParameters,
                      negativeLearningRate: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher = bad experiences hit really hard (like depression). Lower = more resilient, able to bounce back.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Starting Confidence Level: {agentParameters.startingConfidence}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={agentParameters.startingConfidence}
                    onChange={(e) => setAgentParameters({
                      ...agentParameters,
                      startingConfidence: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The agent's initial confidence level before experiencing any scenarios. Lower = less confident, Higher = more confident.
                  </p>
                </div>

                <button
                  onClick={() => setAgentParameters({
                    positiveLearningRate: 0.1,
                    negativeLearningRate: 0.8,
                    startingConfidence: 5
                  })}
                  className="text-lg text-red-400 hover:text-red-700 font-medium"
                >
                  Set to Typical Depression Profile (Good experiences barely help, bad ones hit hard)
                </button>
              </div>
            </div>

            <div className="bg-slate-700/50 border-l-4 border-slate-600 p-4 mb-8 rounded-lg">
              <p className="text-sm text-white">
                <strong>How it works:</strong> The agent goes through the same scenarios you did, but with the settings you choose. 
                When something good happens, confidence increases based on your "good experiences" setting. When something bad happens, 
                confidence decreases based on your "bad experiences" setting. The agent makes choices based on its current confidence level.
              </p>
            </div>

            <button
              onClick={runAgentSimulation}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-6 font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-amber-500/50 rounded-lg flex items-center justify-center gap-2"
            >
              Run Agent Simulation <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Math Details (check first if user wants to see math)
  if (phase === 'comparison' && showMathDetails) {
    const impactRatio = agentParameters.negativeLearningRate / agentParameters.positiveLearningRate;
    
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 p-8 rounded-lg shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30">
                  <AcademicCapIcon className="w-16 h-16 text-amber-400" />
                </div>
              </div>
              <h2 className="text-4xl font-semibold text-slate-100 mb-3">The Math Behind It All</h2>
              <p className="text-lg text-slate-300">
                Understanding how the TD-learning equation explains depression
              </p>
            </div>

            {/* The Core Equation */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-l-4 border-amber-500 p-6 mb-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <LightBulbIcon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-100">The TD-Learning Equation</h3>
              </div>
              
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg mb-4">
                <div className="text-center mb-4">
                  <code className="text-2xl font-mono text-amber-400 font-bold">
                    V(t+1) = V(t) + α[r - V(t)]
                  </code>
                </div>
                <p className="text-slate-300 text-center text-sm">
                  This is the equation that updates your confidence after each experience
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-sm font-medium text-slate-300 mb-2">What each part means:</p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li><strong className="text-amber-400">V(t)</strong> = Your current confidence level</li>
                    <li><strong className="text-amber-400">V(t+1)</strong> = Your confidence after this experience</li>
                    <li><strong className="text-amber-400">r</strong> = How good or bad the experience was</li>
                    <li><strong className="text-amber-400">[r - V(t)]</strong> = The "surprise" (how different it was from what you expected)</li>
                    <li><strong className="text-amber-400">α</strong> = How much you learn from this experience</li>
                  </ul>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-sm font-medium text-slate-300 mb-2">In simple terms:</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your new confidence = Your old confidence + (How much you learn × How surprising it was)
                  </p>
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                    The key is that <strong className="text-amber-400">α</strong> (how much you learn) changes based on whether the experience was good or bad.
                  </p>
                </div>
              </div>
            </div>

            {/* The Mental Filter Math */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-l-4 border-teal-500 p-6 mb-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-100">The Math Behind "Mental Filter"</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-slate-100 mb-3">Your Current Settings:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-500/30">
                      <p className="text-sm text-slate-300 mb-1">Good experiences affect confidence by:</p>
                      <p className="text-2xl font-bold text-green-400">{agentParameters.positiveLearningRate}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {agentParameters.positiveLearningRate < 0.3 
                          ? "Very low - good experiences barely help"
                          : agentParameters.positiveLearningRate < 0.6
                          ? "Moderate - good experiences help somewhat"
                          : "High - good experiences help a lot"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-900/20 to-rose-900/20 p-4 rounded-lg border border-red-500/30">
                      <p className="text-sm text-slate-300 mb-1">Bad experiences affect confidence by:</p>
                      <p className="text-2xl font-bold text-red-400">{agentParameters.negativeLearningRate}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {agentParameters.negativeLearningRate > 0.7 
                          ? "Very high - bad experiences hit really hard"
                          : agentParameters.negativeLearningRate > 0.4
                          ? "Moderate - bad experiences have some impact"
                          : "Low - bad experiences don't affect you much"}
                      </p>
                    </div>
                  </div>
                </div>

                {impactRatio > 1 && (
                  <div className="bg-gradient-to-br from-rose-900/20 to-red-900/20 border-l-4 border-rose-500 p-5 rounded-lg">
                    <h4 className="font-semibold text-slate-100 mb-3">The Impact Ratio</h4>
                    <p className="text-slate-300 mb-3">
                      Bad experiences have <strong className="text-rose-400 text-lg">{impactRatio.toFixed(1)}x</strong> more impact than good experiences.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      This means it takes {impactRatio.toFixed(1)} good experiences to balance out just 1 bad experience. 
                      {agentParameters.positiveLearningRate < agentParameters.negativeLearningRate - 0.2 && 
                        " This asymmetry makes it mathematically difficult for positive experiences to accumulate - they're dismissed while negatives feel like patterns."}
                    </p>
                  </div>
                )}

                <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-slate-100 mb-3">How It Works in Practice</h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="font-medium text-green-400 mb-2">When something GOOD happens:</p>
                      <p className="text-sm text-slate-300 mb-2">
                        The equation uses α = {agentParameters.positiveLearningRate} (your "good experiences" setting)
                      </p>
                      <p className="text-sm text-slate-300">
                        Your confidence increases by: <strong className="text-green-400">{agentParameters.positiveLearningRate}</strong> × (how good it was - what you expected)
                      </p>
                      <p className="text-xs text-slate-400 mt-2 italic">
                        {agentParameters.positiveLearningRate < 0.3 
                          ? "This is very small - good experiences barely move the needle"
                          : "This helps build confidence, but may not be enough if bad experiences hit harder"}
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className="font-medium text-red-400 mb-2">When something BAD happens:</p>
                      <p className="text-sm text-slate-300 mb-2">
                        The equation uses α = {agentParameters.negativeLearningRate} (your "bad experiences" setting)
                      </p>
                      <p className="text-sm text-slate-300">
                        Your confidence decreases by: <strong className="text-red-400">{agentParameters.negativeLearningRate}</strong> × (how bad it was - what you expected)
                      </p>
                      <p className="text-xs text-slate-400 mt-2 italic">
                        {agentParameters.negativeLearningRate > 0.7 
                          ? "This is very large - bad experiences cause big drops in confidence"
                          : "This has some impact, but you're more resilient to setbacks"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-World Example */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-l-4 border-indigo-500 p-6 mb-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <LightBulbIcon className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-semibold text-slate-100">A Real Example</h3>
              </div>
              
              <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700 mb-4">
                <p className="text-slate-300 mb-4">
                  Let's say your confidence is currently <strong className="text-amber-400">5/10</strong>, and something really good happens (worth <strong className="text-green-400">+8</strong>):
                </p>
                
                <div className="space-y-3">
                  <div className="bg-slate-900 p-4 rounded border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">With your current settings:</p>
                    <p className="text-sm text-slate-300 mb-2">
                      Surprise = 8 - 5 = <strong className="text-amber-400">3</strong> (it was better than expected!)
                    </p>
                    <p className="text-sm text-slate-300 mb-2">
                      New confidence = 5 + ({agentParameters.positiveLearningRate} × 3) = <strong className="text-green-400">{(5 + agentParameters.positiveLearningRate * 3).toFixed(1)}/10</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Your confidence increased by {(agentParameters.positiveLearningRate * 3).toFixed(1)} points
                    </p>
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Now something bad happens (worth <strong className="text-red-400">-6</strong>):</p>
                    {(() => {
                      const afterGood = 5 + agentParameters.positiveLearningRate * 3;
                      const surprise = -6 - afterGood;
                      const afterBad = Math.max(0, Math.min(10, afterGood + agentParameters.negativeLearningRate * surprise));
                      const change = afterBad - afterGood;
                      return (
                        <>
                          <p className="text-sm text-slate-300 mb-2">
                            Starting from {afterGood.toFixed(1)}/10, the surprise = -6 - {afterGood.toFixed(1)} = <strong className="text-red-400">{surprise.toFixed(1)}</strong>
                          </p>
                          <p className="text-sm text-slate-300 mb-2">
                            New confidence = {afterGood.toFixed(1)} + ({agentParameters.negativeLearningRate} × {surprise.toFixed(1)}) = <strong className="text-red-400">{afterBad.toFixed(1)}/10</strong>
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            Your confidence decreased by {Math.abs(change).toFixed(1)} points
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {(() => {
                  const goodImpact = agentParameters.positiveLearningRate * 3;
                  const afterGood = 5 + goodImpact;
                  const surprise = -6 - afterGood;
                  const badImpact = Math.abs(agentParameters.negativeLearningRate * surprise);
                  return (
                    <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                      Notice how the bad experience had a much bigger impact ({badImpact.toFixed(1)} points) 
                      than the good one ({goodImpact.toFixed(1)} points), even though the good experience was actually better! 
                      This is the mental filter in action.
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Why This Matters */}
            <div className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-l-4 border-teal-500 p-6 mb-8 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Why This Matters</h3>
              <div className="space-y-3 text-slate-300">
                <p>
                  This isn't just abstract math - this is how your brain actually works. Research shows that people with depression 
                  have different learning rates, making it harder to build confidence from positive experiences.
                </p>
                <p>
                  The good news? Treatment (therapy and medication) can help rebalance these rates. It's not about "thinking more positively" 
                  - it's about recalibrating the brain's update mechanism so that positive experiences can actually register and accumulate.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowMathDetails(false)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-8 border border-amber-500 font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-amber-500/50 rounded-lg"
              >
                ← Back to Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Results (Agent Stats Only)
  if (phase === 'comparison') {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 p-8 rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                <BoltIcon className="w-12 h-12 text-amber-400" />
              </div>
            </div>
            <h2 className="text-3xl font-medium text-center mb-6 text-slate-100">
              Agent Results
            </h2>

            <p className="text-slate-300 text-center mb-8">
              Here's how the agent experienced the week with learning rates α⁺={agentParameters.positiveLearningRate} and α⁻={agentParameters.negativeLearningRate}.
            </p>

            {/* Confidence Trajectory Graph */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 mb-8 rounded-lg border border-slate-600">
              <h3 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                Confidence Over Time
              </h3>
              
              <div className="relative bg-slate-800 border border-slate-600" style={{ height: '300px', paddingLeft: '40px', paddingBottom: '30px' }}>
                {/* Y-axis labels */}
                <div className="absolute left-2 top-0 text-sm text-slate-300 font-medium">10</div>
                <div className="absolute left-2 text-sm text-slate-300 font-medium" style={{ top: '50%', transform: 'translateY(-50%)' }} >5</div>
                <div className="absolute left-2 bottom-8 text-sm text-slate-300 font-medium">0</div>
                
                {/* Chart area with visible border */}
                <div className="absolute bg-slate-700/50" style={{ left: '40px', right: '10px', top: '10px', bottom: '30px', borderLeft: '3px solid #374151', borderBottom: '3px solid #374151' }}>
                  {/* Grid line at middle */}
                  <div className="absolute w-full h-px bg-slate-600" style={{ top: '50%' }}></div>
                  
                  {agentValueHistory.length > 1 ? (
                    <>
                      {/* Agent trajectory (indigo) */}
                      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points={agentValueHistory.map((val, idx) => {
                            const x = (idx / (agentValueHistory.length - 1)) * 100;
                            const y = 100 - (val / 10) * 100;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      
                      {/* Agent dots */}
                      {agentValueHistory.map((val, idx) => {
                        const x = (idx / (agentValueHistory.length - 1)) * 100;
                        const y = 100 - (val / 10) * 100;
                        return (
                          <div
                            key={`agent-dot-${idx}`}
                            className="absolute w-3 h-3 bg-slate-700 rounded-full border-2 border-slate-300"
                            style={{
                              left: `calc(${x}% - 6px)`,
                              top: `calc(${y}% - 6px)`
                            }}
                          />
                        );
                      })}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      No agent data
                    </div>
                  )}
                </div>
                
                {/* X-axis label */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-slate-300 font-medium">
                  Decision Number
                </div>
              </div>

              <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-slate-700"></div>
                  <span className="text-sm text-white">Agent (α⁺={agentParameters.positiveLearningRate}, α⁻={agentParameters.negativeLearningRate})</span>
                </div>
              </div>
            </div>

            {/* Agent's Decisions */}
            <div className="mb-8">
              <h3 className="font-medium text-slate-100 mb-4 text-center">Agent's Journey</h3>
              
              <div className="space-y-4">
                {agentPath.map((step, idx) => (
                  <div key={idx} className="border border-slate-700  p-4">
                    <p className="text-xs text-slate-300 mb-1">Situation:</p>
                    <p className="text-sm text-slate-100 mb-2">{step.node.situation}</p>
                    {step.choice && (
                      <>
                        <p className="text-xs text-slate-300 mb-1">Agent's choice:</p>
                        <p className="text-sm font-medium text-slate-100">{step.choice.text}</p>
                        <p className="text-xs text-indigo-700 mt-1">Confidence Level: {step.choice.confidenceLevel}/10</p>
                      </>
                    )}
                    {step.outcome && (
                      <p className="text-xs text-slate-300 mt-2">Outcome: {step.outcome.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">Confidence after: {step.value.toFixed(2)}/10</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Stats */}
            <div className="mb-8">
              <div className="bg-slate-700/50 p-6 ">
                <h3 className="font-medium text-slate-300 mb-3">Agent's Journey</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Starting Confidence:</span>
                    <span className="font-medium">{agentValueHistory[0]}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ending Confidence:</span>
                    <span className="font-medium">{agentValueHistory[agentValueHistory.length - 1].toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Change:</span>
                    <span className="font-medium">
                      {(agentValueHistory[agentValueHistory.length - 1] - agentValueHistory[0]).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Insights */}
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-l-4 border-teal-500 p-6 mb-8 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                Key Insights
              </h3>
              
              <div className="space-y-3 text-slate-200">
                <div>
                  <p className="font-medium">1. Learning Rates Shape Experience</p>
                  <p className="text-sm">
                    The agent navigated through a branching narrative, making {agentChoices.length} decisions along its path. 
                    The learning rates (α⁺={agentParameters.positiveLearningRate}, α⁻={agentParameters.negativeLearningRate}) 
                    determined how these experiences affected confidence and which path the agent took through the story.
                  </p>
                </div>

                <div>
                  <p className="font-medium">2. Not About "Trying Harder"</p>
                  <p className="text-sm">
                    The agent didn't choose to be pessimistic. The TD-learning equation, with these parameters, 
                    inevitably leads to this confidence trajectory. This shows how depression isn't a character flaw - 
                    it's a computational difference in how the brain updates from experience.
                  </p>
                </div>

                <div>
                  <p className="font-medium">3. This Is Treatable</p>
                  <p className="text-sm">
                    Therapy (especially CBT) and medication help rebalance these learning rates. Treatment isn't 
                    about "being more positive" - it's about recalibrating the brain's update mechanism so that 
                    positive experiences can actually register and accumulate.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  sessionStorage.setItem('showComparison', 'true');
                  setSelectedMode(null);
                }}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                View Decision Comparison
              </button>
              <button
                onClick={() => setShowMathDetails(true)}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-6 border border-amber-500 font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-amber-500/50 rounded-lg flex items-center justify-center gap-2"
              >
                <ChartBarIcon className="w-5 h-5" /> View Math Details
              </button>
              <button
                onClick={() => {
                  setPhase('agent-config');
                  setAgentChoices([]);
                  setAgentValueHistory([5]);
                  setAgentPath([]);
                }}
                className="flex-1 min-w-[200px] bg-slate-800 text-white py-3 px-6 font-medium hover:bg-slate-700 transition rounded-lg flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" /> Adjust Parameters
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

export default AgentMode;
