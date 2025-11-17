import React, { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, BarChart3, ArrowRight, RefreshCw } from 'lucide-react';

// ============================================
// LEARNING MODE COMPONENT
// ============================================
// This component implements a two-pass system:
// Pass 1: User makes choices → We estimate their TD parameters (α⁺, α⁻)
// Pass 2: Agent uses TD equations with mental filter parameters → Compare

function LearningMode() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Current phase of the experience
  const [phase, setPhase] = useState('intro');
  // Phases: 'intro' → 'user-playing' → 'parameter-reveal' → 'agent-config' → 'agent-playing' → 'comparison'
  
  // User's journey (Pass 1)
  const [userChoices, setUserChoices] = useState([]);
  const [userValueHistory, setUserValueHistory] = useState([5]); // Start at neutral (5)
  const [userParameters, setUserParameters] = useState(null);
  
  // Agent's journey (Pass 2)
  const [agentChoices, setAgentChoices] = useState([]);
  const [agentValueHistory, setAgentValueHistory] = useState([5]);
  const [agentParameters, setAgentParameters] = useState({
    positiveLearningRate: 0.1,  // Mental filter default
    negativeLearningRate: 0.8   // Mental filter default
  });
  
  // Current position in scenario sequence
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Outcome display state
  const [showingOutcome, setShowingOutcome] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState(null);

  // ============================================
  // SCENARIO DATA
  // ============================================
  // Multi-step scenarios that test learning rates
  // Each scenario has multiple decisions that flow together
  
  const scenarios = [
    {
      id: 'monday_morning',
      title: 'Monday Morning - Lockers',
      description: 'Start of the school week',
      steps: [
        {
          situation: "You arrive at school and see your friend group laughing together by the lockers. They haven't noticed you yet.",
          choices: [
            { 
              id: 'a', 
              text: "Walk over confidently and join them", 
              confidenceLevel: 8,
              // This suggests high current confidence
            },
            { 
              id: 'b', 
              text: "Wave and see if they invite you over", 
              confidenceLevel: 5,
              // Neutral/cautious approach
            },
            { 
              id: 'c', 
              text: "Go to your locker, they seem busy", 
              confidenceLevel: 2,
              // Low confidence/avoidance
            }
          ],
          // Outcome is positive regardless of choice
          outcome: {
            reward: 7,
            description: "Your friend Sarah turns and smiles. 'Hey! I was hoping I'd see you! How was your weekend?'"
          }
        },
        {
          situation: "Sarah is asking about your weekend and seems genuinely interested.",
          choices: [
            { 
              id: 'a', 
              text: "Share enthusiastically about what you did", 
              confidenceLevel: 8,
            },
            { 
              id: 'b', 
              text: "Give a brief summary", 
              confidenceLevel: 5,
            },
            { 
              id: 'c', 
              text: "Say 'It was fine' and change the subject", 
              confidenceLevel: 3,
            }
          ],
          outcome: {
            reward: 5,
            description: "Sarah laughs and relates to your story. 'That sounds awesome! We should hang out sometime.'"
          }
        },
        {
          // This step TESTS if positive outcomes increased confidence
          situation: "The bell is about to ring. Another friend, Marcus, walks by.",
          choices: [
            { 
              id: 'a', 
              text: "Call out to Marcus to say hi", 
              confidenceLevel: 8,
              // High α⁺ would choose this after positive experiences
            },
            { 
              id: 'b', 
              text: "Smile if he looks your way", 
              confidenceLevel: 5,
              // Medium update
            },
            { 
              id: 'c', 
              text: "Let him pass, don't want to interrupt", 
              confidenceLevel: 2,
              // Low α⁺ - didn't learn from previous positives
            }
          ],
          outcome: {
            reward: 6,
            description: "Marcus waves back with a big smile. 'See you in class!'"
          }
        }
      ]
    },
    {
      id: 'tuesday_text',
      title: 'Tuesday Afternoon - Text Message',
      description: 'Continuing the week',
      steps: [
        {
          situation: "After school, you text your friend about grabbing food together. You wait... 3 hours pass with no response.",
          choices: [
            { 
              id: 'a', 
              text: "Assume they're busy, no big deal", 
              confidenceLevel: 7,
              // High resilience (low α⁻)
            },
            { 
              id: 'b', 
              text: "Feel a bit worried but wait", 
              confidenceLevel: 5,
            },
            { 
              id: 'c', 
              text: "They're probably avoiding me", 
              confidenceLevel: 2,
              // High α⁻ - quickly assuming negative
            }
          ],
          outcome: {
            reward: -4,
            description: "Finally get a response: 'Sorry! Phone died. Can't tonight, family dinner. Rain check?'"
          }
        },
        {
          // This tests: Did negative outcome drop confidence a lot?
          situation: "The next day at lunch, you see a different friend sitting alone.",
          choices: [
            { 
              id: 'a', 
              text: "Go sit with them", 
              confidenceLevel: 7,
              // Low α⁻: Yesterday's rejection didn't overgeneralize
            },
            { 
              id: 'b', 
              text: "Wave but sit with your usual group", 
              confidenceLevel: 5,
            },
            { 
              id: 'c', 
              text: "Sit alone, don't want to risk it", 
              confidenceLevel: 2,
              // High α⁻: One rejection → avoid all social
            }
          ],
          outcome: {
            reward: 8,
            description: "They light up when you sit down. 'Thanks for sitting with me! I was feeling kind of lonely.'"
          }
        }
      ]
    },
    {
      id: 'wednesday_class',
      title: 'Wednesday - Class Participation',
      description: 'Midweek challenge',
      steps: [
        {
          situation: "Teacher asks a question you think you know the answer to. A few hands go up.",
          choices: [
            { 
              id: 'a', 
              text: "Raise your hand confidently", 
              confidenceLevel: 8,
            },
            { 
              id: 'b', 
              text: "Raise your hand hesitantly", 
              confidenceLevel: 5,
            },
            { 
              id: 'c', 
              text: "Stay quiet, don't want to be wrong", 
              confidenceLevel: 2,
            }
          ],
          outcome: {
            reward: 9,
            description: "Teacher calls on you. You answer correctly! 'Exactly right! Great explanation.'"
          }
        },
        {
          // Testing positive learning again
          situation: "Later in class, teacher asks another question. You think you might know this one too.",
          choices: [
            { 
              id: 'a', 
              text: "Raise your hand again", 
              confidenceLevel: 8,
              // High α⁺: Previous success encouraged you
            },
            { 
              id: 'b', 
              text: "Consider it but don't raise hand", 
              confidenceLevel: 5,
            },
            { 
              id: 'c', 
              text: "Don't raise hand, might be wrong this time", 
              confidenceLevel: 2,
              // Low α⁺: Previous success dismissed as luck
            }
          ],
          outcome: {
            reward: 4,
            description: "Someone else answers. Teacher says 'Good!' You realize you would have been right too."
          }
        }
      ]
    }
  ];

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Get current step data
  const getCurrentStep = () => {
    if (currentScenarioIndex >= scenarios.length) return null;
    const scenario = scenarios[currentScenarioIndex];
    if (currentStepIndex >= scenario.steps.length) return null;
    return scenario.steps[currentStepIndex];
  };

  const getCurrentScenario = () => {
    if (currentScenarioIndex >= scenarios.length) return null;
    return scenarios[currentScenarioIndex];
  };

  // ============================================
  // PARAMETER ESTIMATION (Pass 1 Logic)
  // ============================================
  // After user finishes, we analyze their choices to estimate α⁺ and α⁻

  const estimateParameters = () => {
    // We'll look at how confidence changed after positive vs negative outcomes
    
    let positiveUpdates = [];
    let negativeUpdates = [];
    
    let scenarioIdx = 0;
    let stepIdx = 0;
    
    // Go through all user choices and calculate implied learning
    for (let i = 0; i < userChoices.length; i++) {
      const choice = userChoices[i];
      const scenario = scenarios[scenarioIdx];
      const step = scenario.steps[stepIdx];
      
      // Current confidence = confidence level of chosen option
      const currentConfidence = choice.confidenceLevel;
      
      // Get outcome
      const outcome = step.outcome;
      
      // Look at NEXT choice (if exists) to see how confidence changed
      if (i < userChoices.length - 1) {
        const nextChoice = userChoices[i + 1];
        const nextConfidence = nextChoice.confidenceLevel;
        
        // Calculate confidence change
        const confidenceChange = nextConfidence - currentConfidence;
        
        // Categorize by outcome type
        if (outcome.reward > 0) {
          // Positive outcome: Did confidence increase?
          positiveUpdates.push({
            reward: outcome.reward,
            change: confidenceChange,
            // Implied learning rate: change / reward
            impliedAlpha: Math.max(0, confidenceChange / outcome.reward)
          });
        } else if (outcome.reward < 0) {
          // Negative outcome: Did confidence decrease?
          negativeUpdates.push({
            reward: outcome.reward,
            change: confidenceChange,
            // For negative, we want: how much did it drop relative to severity?
            impliedAlpha: Math.max(0, -confidenceChange / Math.abs(outcome.reward))
          });
        }
      }
      
      // Move to next step
      stepIdx++;
      if (stepIdx >= scenario.steps.length) {
        stepIdx = 0;
        scenarioIdx++;
      }
    }
    
    // Calculate average learning rates
    const avgPositiveAlpha = positiveUpdates.length > 0
      ? positiveUpdates.reduce((sum, u) => sum + u.impliedAlpha, 0) / positiveUpdates.length
      : 0.5;
      
    const avgNegativeAlpha = negativeUpdates.length > 0
      ? negativeUpdates.reduce((sum, u) => sum + u.impliedAlpha, 0) / negativeUpdates.length
      : 0.5;
    
    // Clamp to reasonable range and adjust
    const finalPositiveAlpha = Math.min(0.9, Math.max(0.1, avgPositiveAlpha * 0.8));
    const finalNegativeAlpha = Math.min(0.9, Math.max(0.1, avgNegativeAlpha * 0.8));
    
    return {
      positiveLearningRate: parseFloat(finalPositiveAlpha.toFixed(2)),
      negativeLearningRate: parseFloat(finalNegativeAlpha.toFixed(2))
    };
  };

  // ============================================
  // USER CHOICE HANDLER (Pass 1)
  // ============================================

  const handleUserChoice = (choice) => {
    // Record user's choice
    setUserChoices([...userChoices, choice]);
    
    // Get the outcome for this step
    const step = getCurrentStep();
    setCurrentOutcome(step.outcome);
    
    // Show outcome screen (don't advance yet)
    setShowingOutcome(true);
  };

  const handleContinueFromOutcome = () => {
    // Now that user has seen outcome, record their confidence
    const lastChoice = userChoices[userChoices.length - 1];
    
    if (userChoices.length === 1) {
      // First choice - replace initial [5]
      setUserValueHistory([lastChoice.confidenceLevel]);
    } else {
      // Subsequent choices - append
      setUserValueHistory([...userValueHistory, lastChoice.confidenceLevel]);
    }
    
    // Hide outcome screen
    setShowingOutcome(false);
    setCurrentOutcome(null);
    
    // Move to next step
    const scenario = getCurrentScenario();
    if (currentStepIndex < scenario.steps.length - 1) {
      // More steps in this scenario
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Move to next scenario
      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex(currentScenarioIndex + 1);
        setCurrentStepIndex(0);
      } else {
        // Finished all scenarios! Estimate parameters
        const estimated = estimateParameters();
        setUserParameters(estimated);
        setPhase('parameter-reveal');
      }
    }
  };

  // ============================================
  // AGENT SIMULATION (Pass 2 - Real TD Learning!)
  // ============================================

  const runAgentSimulation = () => {
    // Agent uses actual TD learning equations
    const agentPath = {
      choices: [],
      valueHistory: [],
      rpeHistory: []
    };
    
    let currentValue = 5; // Start neutral
    
    // Go through same scenarios
    for (let scenarioIdx = 0; scenarioIdx < scenarios.length; scenarioIdx++) {
      const scenario = scenarios[scenarioIdx];
      
      for (let stepIdx = 0; stepIdx < scenario.steps.length; stepIdx++) {
        const step = scenario.steps[stepIdx];
        
        // AGENT DECISION MAKING:
        // Pick choice based on which matches current value best
        // Higher value = more confident = pick more confident options
        
        let bestChoice = step.choices[0];
        let smallestDiff = Math.abs(step.choices[0].confidenceLevel - currentValue);
        
        for (let choice of step.choices) {
          const diff = Math.abs(choice.confidenceLevel - currentValue);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            bestChoice = choice;
          }
        }
        
        agentPath.choices.push(bestChoice);
        agentPath.valueHistory.push(currentValue);
        
        // GET OUTCOME (same as what user got)
        const outcome = step.outcome;
        
        // TD UPDATE: V(t+1) = V(t) + α[r - V(t)]
        // But we need to interpret reward relative to expectations
        
        // Expected reward based on current confidence        
        // Actual reward (normalized to 0-10 scale)
        // Positive outcomes (+7) should map to ~8-9
        // Negative outcomes (-4) should map to ~2-3
        const normalizedReward = 5 + (outcome.reward * 0.4); // Scale to 0-10
        
        const rpe = normalizedReward - currentValue;
        
        // Select learning rate based on outcome sign
        const alpha = rpe > 0 
          ? agentParameters.positiveLearningRate 
          : agentParameters.negativeLearningRate;
        
        // Apply TD equation
        const newValue = currentValue + (alpha * rpe);
        
        // Clamp to 0-10 range (but not too aggressively)
        currentValue = Math.max(0, Math.min(10, newValue));
        
        agentPath.rpeHistory.push({ rpe, alpha, reward: outcome.reward });
        
        console.log(`Agent Step ${scenarioIdx}-${stepIdx}:`, {
          choice: bestChoice.text,
          outcomeReward: outcome.reward,
          normalizedReward: normalizedReward,
          rpe: rpe.toFixed(2),
          alpha: alpha,
          oldValue: (currentValue - alpha * rpe).toFixed(2),
          newValue: currentValue.toFixed(2)
        });
      }
    }
    
    // Add final value
    agentPath.valueHistory.push(currentValue);
    
    setAgentChoices(agentPath.choices);
    setAgentValueHistory(agentPath.valueHistory);
    setPhase('comparison');
  };

  // ============================================
  // RENDER FUNCTIONS FOR EACH PHASE
  // ============================================

  // PHASE: Intro
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-16 h-16 text-teal-600" />
            </div>
            <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
              Learning Mode
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              In this mode, you'll experience various social situations throughout a school week. 
              Make choices that feel natural to you.
            </p>
            
            <div className="bg-teal-50 border-l-4 border-teal-600 p-4 mb-6">
              <p className="font-semibold text-teal-900 mb-2">How it works:</p>
              <ol className="text-gray-700 space-y-2 list-decimal list-inside">
                <li><strong>You play:</strong> Navigate social situations and make choices</li>
                <li><strong>We analyze:</strong> Calculate how your confidence changes after different outcomes</li>
                <li><strong>Agent plays:</strong> See how someone with mental filter would experience the same week</li>
                <li><strong>Compare:</strong> Understand how different "learning rates" create different experiences</li>
              </ol>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
              <p className="text-sm text-gray-700">
                <strong>What we're measuring:</strong> Your brain constantly updates beliefs based on experiences. 
                We'll estimate your "learning rates" - how much positive vs. negative experiences change your expectations.
              </p>
            </div>

            <button
              onClick={() => setPhase('user-playing')}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              Begin Your Week <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: User Playing
  if (phase === 'user-playing') {
    const step = getCurrentStep();
    const scenario = getCurrentScenario();
    
    if (!step || !scenario) {
      return <div>Loading...</div>;
    }

    // Calculate total progress
    const totalSteps = scenarios.reduce((sum, s) => sum + s.steps.length, 0);
    const completedSteps = userChoices.length;
    const progressPercent = (completedSteps / totalSteps) * 100;

    // OUTCOME SCREEN (shown after making a choice)
    if (showingOutcome && currentOutcome) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{scenario.title}</span>
                  <span>Step {completedSteps} of {totalSteps}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* What Happened */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">What Happened</h2>
                <div className={`rounded-lg p-6 mb-6 ${
                  currentOutcome.reward > 0 ? 'bg-green-50 border-2 border-green-300' : 'bg-amber-50 border-2 border-amber-300'
                }`}>
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {currentOutcome.description}
                  </p>
                </div>

                {/* Visual feedback */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  {currentOutcome.reward > 5 ? (
                    <>
                      <span className="text-4xl">😊</span>
                      <span className="text-lg font-semibold text-green-700">Positive outcome!</span>
                    </>
                  ) : currentOutcome.reward > 0 ? (
                    <>
                      <span className="text-4xl">🙂</span>
                      <span className="text-lg font-semibold text-teal-700">Good outcome</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl">😕</span>
                      <span className="text-lg font-semibold text-amber-700">Challenging outcome</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleContinueFromOutcome}
                className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // CHOICE SCREEN (normal question screen)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{scenario.title}</span>
                <span>Step {completedSteps + 1} of {totalSteps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Confidence meter - only show if we have history */}
            {userValueHistory.length > 1 && (
              <div className="mb-6 p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Your Confidence</span>
                  <span className="text-2xl font-bold text-teal-600">
                    {userValueHistory[userValueHistory.length - 1].toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(userValueHistory[userValueHistory.length - 1] / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Situation */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800">{step.situation}</p>
            </div>

            {/* Choices */}
            <div className="space-y-3">
              <p className="font-semibold text-gray-700 mb-3">What do you do?</p>
              {step.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleUserChoice(choice)}
                  className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
                >
                  <span className="font-semibold text-teal-600">{choice.id.toUpperCase()}.</span> {choice.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Parameter Reveal
  if (phase === 'parameter-reveal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <BarChart3 className="w-16 h-16 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Your Learning Pattern
            </h2>

            <p className="text-gray-600 text-center mb-8">
              Based on how your choices changed after positive and negative experiences, 
              here are your estimated learning rates:
            </p>

            {/* Positive Learning Rate */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-gray-800">Positive Learning Rate</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {userParameters.positiveLearningRate}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-green-600 h-4 rounded-full"
                  style={{ width: `${userParameters.positiveLearningRate * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                How much good experiences update your confidence. 
                {userParameters.positiveLearningRate > 0.6 ? " You learn well from positive outcomes!" :
                 userParameters.positiveLearningRate > 0.3 ? " You update moderately from positives." :
                 " You tend to dismiss positive experiences (mental filter tendency)."}
              </p>
            </div>

            {/* Negative Learning Rate */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                  <span className="font-bold text-gray-800">Negative Learning Rate</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {userParameters.negativeLearningRate}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-red-600 h-4 rounded-full"
                  style={{ width: `${userParameters.negativeLearningRate * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                How much bad experiences update your confidence.
                {userParameters.negativeLearningRate > 0.7 ? " You may be overgeneralizing from negatives." :
                 userParameters.negativeLearningRate > 0.4 ? " You update moderately from setbacks." :
                 " You're quite resilient to negative experiences!"}
              </p>
            </div>

            {/* Interpretation */}
            <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-2">What This Means</h3>
              <p className="text-gray-700 mb-3">
                These "learning rates" determine how your brain updates expectations from experience. 
                A balanced pattern (both around 0.5) means you learn equally from positive and negative outcomes.
              </p>
              {userParameters.positiveLearningRate < userParameters.negativeLearningRate - 0.2 && (
                <p className="text-gray-700 font-semibold">
                  Your pattern shows asymmetry: negative experiences impact you more than positive ones. 
                  This is common in stressful times, but when chronic, it's called the "mental filter" cognitive distortion.
                </p>
              )}
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8">
              <p className="text-gray-700">
                <strong>Next:</strong> You'll see how someone with "mental filter" depression (very low positive learning rate, 
                high negative learning rate) would experience the exact same week you just had.
              </p>
            </div>

            <button
              onClick={() => setPhase('agent-config')}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Continue to Agent Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Agent Configuration
  if (phase === 'agent-config') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Mental Filter Configuration
            </h2>

            <p className="text-gray-600 mb-8">
              Now let's see how someone with "Mental Filter" cognitive distortion would experience 
              the same week. You can use the typical depression profile or customize the parameters.
            </p>

            {/* Current Parameters */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 mb-4">Your Parameters</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Positive Learning</span>
                      <span className="font-semibold">{userParameters.positiveLearningRate}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${userParameters.positiveLearningRate * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Negative Learning</span>
                      <span className="font-semibold">{userParameters.negativeLearningRate}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${userParameters.negativeLearningRate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="font-bold text-red-800 mb-4">Mental Filter Agent</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Positive Learning</span>
                      <span className="font-semibold">{agentParameters.positiveLearningRate}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${agentParameters.positiveLearningRate * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Negative Learning</span>
                      <span className="font-semibold">{agentParameters.negativeLearningRate}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${agentParameters.negativeLearningRate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustable Parameters */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Adjust Agent Parameters (Optional)</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Positive Learning Rate: {agentParameters.positiveLearningRate}
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
                    Lower = dismisses positive experiences (mental filter)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Negative Learning Rate: {agentParameters.negativeLearningRate}
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
                    Higher = over-learns from negative experiences
                  </p>
                </div>

                <button
                  onClick={() => setAgentParameters({
                    positiveLearningRate: 0.1,
                    negativeLearningRate: 0.8
                  })}
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Reset to Typical Mental Filter Profile
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
              <p className="text-sm text-gray-700">
                <strong>The Algorithm:</strong> The agent will use the actual TD-learning equation: 
                <code className="bg-white px-2 py-1 rounded mx-1">V(t+1) = V(t) + α[r - V(t)]</code>
                where α changes based on whether the outcome is positive or negative.
              </p>
            </div>

            <button
              onClick={runAgentSimulation}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              Run Agent Simulation <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: Comparison
  if (phase === 'comparison') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              The Same Week, Different Brains
            </h2>

            <p className="text-gray-600 text-center mb-8">
              Both of you experienced identical events. But different learning rates led to completely different experiences.
            </p>

            {/* Confidence Trajectory Graph */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Confidence Over Time</h3>
              
              {/* DEBUG: Show the data */}
              <div className="text-xs text-gray-600 mb-2">
                User data points: {userValueHistory.length} | Agent data points: {agentValueHistory.length}
              </div>
              <div className="text-xs text-gray-600 mb-4">
                User values: [{userValueHistory.join(', ')}]<br/>
                Agent values: [{agentValueHistory.join(', ')}]
              </div>
              
              <div className="relative bg-white border-2 border-gray-300" style={{ height: '300px', paddingLeft: '40px', paddingBottom: '30px' }}>
                {/* Y-axis labels */}
                <div className="absolute left-2 top-0 text-sm text-gray-600 font-semibold">10</div>
                <div className="absolute left-2 text-sm text-gray-600 font-semibold" style={{ top: '50%', transform: 'translateY(-50%)' }} >5</div>
                <div className="absolute left-2 bottom-8 text-sm text-gray-600 font-semibold">0</div>
                
                {/* Chart area with visible border */}
                <div className="absolute bg-blue-50" style={{ left: '40px', right: '10px', top: '10px', bottom: '30px', borderLeft: '3px solid #374151', borderBottom: '3px solid #374151' }}>
                  {/* Grid line at middle */}
                  <div className="absolute w-full h-px bg-gray-400" style={{ top: '50%' }}></div>
                  
                  {userValueHistory.length > 1 ? (
                    <>
                      {/* User trajectory (green) */}
                      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points={userValueHistory.map((val, idx) => {
                            const x = (idx / (userValueHistory.length - 1)) * 100;
                            const y = 100 - (val / 10) * 100;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      
                      {/* User dots */}
                      {userValueHistory.map((val, idx) => {
                        const x = (idx / (userValueHistory.length - 1)) * 100;
                        const y = 100 - (val / 10) * 100;
                        return (
                          <div
                            key={`user-dot-${idx}`}
                            className="absolute w-3 h-3 bg-green-600 rounded-full border-2 border-white"
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
                      No user data
                    </div>
                  )}
                  
                  {agentValueHistory.length > 1 ? (
                    <>
                      {/* Agent trajectory (red) */}
                      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points={agentValueHistory.map((val, idx) => {
                            const x = (idx / (agentValueHistory.length - 1)) * 100;
                            const y = 100 - (val / 10) * 100;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          strokeDasharray="5,3"
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
                            className="absolute w-3 h-3 bg-red-600 rounded-full border-2 border-white"
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
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 font-semibold">
                  Decision Number
                </div>
              </div>

              <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-green-600"></div>
                  <span className="text-sm text-gray-700">You (α⁺={userParameters.positiveLearningRate}, α⁻={userParameters.negativeLearningRate})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-red-600 opacity-80"></div>
                  <span className="text-sm text-gray-700">Agent (α⁺={agentParameters.positiveLearningRate}, α⁻={agentParameters.negativeLearningRate})</span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4 text-center">Decision Comparison</h3>
              
              <div className="space-y-6">
                {scenarios.map((scenario, scenarioIdx) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">{scenario.title}</h4>
                    
                    {scenario.steps.map((step, stepIdx) => {
                      const globalStepIdx = scenarios.slice(0, scenarioIdx).reduce((sum, s) => sum + s.steps.length, 0) + stepIdx;
                      const userChoice = userChoices[globalStepIdx];
                      const agentChoice = agentChoices[globalStepIdx];
                      
                      return (
                        <div key={stepIdx} className="grid md:grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-100 last:border-0">
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Your choice:</p>
                            <p className="text-sm font-medium text-gray-800">{userChoice?.text}</p>
                            <p className="text-xs text-green-700 mt-1">Confidence: {userChoice?.confidenceLevel}/10</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Agent's choice:</p>
                            <p className="text-sm font-medium text-gray-800">{agentChoice?.text}</p>
                            <p className="text-xs text-red-700 mt-1">Confidence: {agentChoice?.confidenceLevel}/10</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Final Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">Your Journey</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Starting Confidence:</span>
                    <span className="font-semibold">{userValueHistory[0]}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ending Confidence:</span>
                    <span className="font-semibold">{userValueHistory[userValueHistory.length - 1].toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Change:</span>
                    <span className="font-semibold">
                      {(userValueHistory[userValueHistory.length - 1] - userValueHistory[0]).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="font-bold text-red-800 mb-3">Agent's Journey</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Starting Confidence:</span>
                    <span className="font-semibold">{agentValueHistory[0]}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ending Confidence:</span>
                    <span className="font-semibold">{agentValueHistory[agentValueHistory.length - 1].toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Change:</span>
                    <span className="font-semibold">
                      {(agentValueHistory[agentValueHistory.length - 1] - agentValueHistory[0]).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Insights */}
            <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-3">Key Insights</h3>
              
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-semibold">1. Same Events, Different Processing</p>
                  <p className="text-sm">
                    You both experienced identical interactions: {scenarios.reduce((sum, s) => sum + s.steps.length, 0)} decisions, 
                    mostly positive outcomes. But different learning rates led to completely different final states.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">2. The Math Behind "Mental Filter"</p>
                  <p className="text-sm">
                    With α⁺=0.1, positive experiences barely update beliefs. With α⁻=0.8, negative experiences 
                    have 8x more impact. This asymmetry makes it mathematically impossible for positive experiences 
                    to accumulate - they're dismissed as flukes while negatives feel like patterns.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">3. Not About "Trying Harder"</p>
                  <p className="text-sm">
                    The agent didn't choose to be pessimistic. The TD-learning equation, with those parameters, 
                    inevitably leads to lower confidence. This shows depression isn't a character flaw - 
                    it's a computational difference in how the brain updates from experience.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">4. This Is Treatable</p>
                  <p className="text-sm">
                    Therapy (especially CBT) and medication help rebalance these learning rates. Treatment isn't 
                    about "being more positive" - it's about recalibrating the brain's update mechanism so that 
                    positive experiences can actually register and accumulate.
                  </p>
                </div>
              </div>
            </div>

            {/* TD Equation Explanation */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-3">The TD-Learning Equation</h3>
              <div className="bg-white p-4 rounded mb-3 font-mono text-sm">
                V(t+1) = V(t) + α[r - V(t)]
              </div>
              <p className="text-sm text-gray-700 mb-2">Where:</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li><strong>V(t)</strong> = Current confidence/value</li>
                <li><strong>r</strong> = Reward from outcome (positive or negative)</li>
                <li><strong>[r - V(t)]</strong> = Reward Prediction Error (surprise!)</li>
                <li><strong>α</strong> = Learning rate (how much to update)</li>
              </ul>
              <p className="text-sm text-gray-700 mt-3">
                <strong>The key:</strong> In mental filter, α is LOW for positive outcomes (0.1) and 
                HIGH for negative outcomes (0.8). This makes positive surprises barely update beliefs, 
                while negative surprises dramatically change them.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setPhase('intro');
                  setUserChoices([]);
                  setUserValueHistory([5]);
                  setUserParameters(null);
                  setAgentChoices([]);
                  setAgentValueHistory([5]);
                  setCurrentScenarioIndex(0);
                  setCurrentStepIndex(0);
                }}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" /> Start Over
              </button>
              
              <button
                onClick={() => {
                  setPhase('agent-config');
                  setAgentChoices([]);
                  setAgentValueHistory([5]);
                }}
                className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Try Different Parameters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default LearningMode;