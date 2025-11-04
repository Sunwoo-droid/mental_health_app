import React, { useState } from 'react';
import { Brain, Heart, RefreshCw, ArrowRight, Zap, GraduationCap } from 'lucide-react';

// ============================================
// GAME MODE A: SIMPLE VERSION (Original)
// ============================================
function SimpleMode() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userChoices, setUserChoices] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [parameters, setParameters] = useState({
    rewardSensitivity: 50,
    negativeBias: 50,
    cognitiveLoad: 50
  });

  const scenario = {
    title: "Morning at School",
    description: "You arrive at school and see your friends talking by the lockers.",
    steps: [
      {
        situation: "You see your friend group laughing together by the lockers. They haven't noticed you yet.",
        choices: [
          { id: 'a', text: "Walk over and join them confidently", value: 'approach' },
          { id: 'b', text: "Wave and see if they invite you over", value: 'wait' },
          { id: 'c', text: "Go to your locker alone, they seem busy", value: 'avoid' }
        ]
      },
      {
        situation: "Your friend asks, 'Hey, did you finish the math homework?' You forgot about it.",
        choices: [
          { id: 'a', text: "Say 'Oh no, I completely forgot! Can I see yours?'", value: 'honest' },
          { id: 'b', text: "Say 'Almost done, I'll finish it during lunch'", value: 'deflect' },
          { id: 'c', text: "Say 'Yeah' and hope they don't ask more questions", value: 'lie' }
        ]
      },
      {
        situation: "The teacher announces a group project. Your friends are forming groups.",
        choices: [
          { id: 'a', text: "Immediately ask to join your friends' group", value: 'proactive' },
          { id: 'b', text: "Wait to see if they ask you first", value: 'passive' },
          { id: 'c', text: "Assume they don't want you and partner with someone else", value: 'withdraw' }
        ]
      },
      {
        situation: "You're friend asks what you did over the weekend.",
        choices: [
          { id: 'a', text: "Laugh and joke about how you didn't do anything and stayed inside", value: 'confident' },
          { id: 'b', text: "Respond with a short 'nothing'", value: 'secure' },
          { id: 'c', text: "Exaggerate and say you went to a bunch of parties", value: 'insecure' }
        ]
      },
      {
        situation: "You have to leave lunch early",
        choices: [
          { id: 'a', text: "Announce your farewell and wave", value: 'self-centered' },
          { id: 'b', text: "Wait until they stop talking to leave", value: 'others-centered' },
          { id: 'c', text: "Leave quietly", value: 'self-deprecate' }
        ]
      }
    ]
  };

  const handleChoice = (choice) => {
    setUserChoices([...userChoices, choice]);
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentScreen('parameters');
    }
  };

  const getDepressionChoice = (stepChoices, params) => {
    const biasScore = params.negativeBias;
    
    if (biasScore > 66) {
      return stepChoices[2];
    } else if (biasScore > 33) {
      return stepChoices[1];
    } else {
      return stepChoices[0];
    }
  };

  const resetMode = () => {
    setCurrentScreen('welcome');
    setUserChoices([]);
    setCurrentStep(0);
    setParameters({
      rewardSensitivity: 50,
      negativeBias: 50,
      cognitiveLoad: 50
    });
  };

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-16 h-16 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
              Simple Mode
            </h1>
            <p className="text-lg text-gray-600 text-center mb-8">
              Experience how depression changes decision-making through the lens of computational psychiatry.
            </p>
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-8">
              <p className="text-gray-700">
                <strong>How it works:</strong> You'll navigate a school scenario making your own choices. 
                Then, we'll show you how someone experiencing depression might navigate the same situation differently, 
                based on quantifiable parameters from mental health research.
              </p>
            </div>
            <button
              onClick={() => setCurrentScreen('scenario')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              Begin Simulation <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'scenario') {
    const currentStepData = scenario.steps[currentStep];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{scenario.title}</h2>
              <div className="flex gap-2">
                {scenario.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded ${
                      index <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Step {currentStep + 1} of {scenario.steps.length}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800">{currentStepData.situation}</p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-gray-700 mb-3">What do you do?</p>
              {currentStepData.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition"
                >
                  <span className="font-semibold text-purple-600">{choice.id.toUpperCase()}.</span> {choice.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'parameters') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Understanding Depression Parameters</h2>
            <p className="text-gray-600 mb-8">
              Depression affects the brain's decision-making through measurable changes. Adjust these parameters 
              to see how they influence choices in the same scenario you just experienced.
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Reward Sensitivity: {parameters.rewardSensitivity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parameters.rewardSensitivity}
                  onChange={(e) => setParameters({...parameters, rewardSensitivity: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Lower values = positive experiences feel less rewarding (anhedonia)
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Negative Bias: {parameters.negativeBias}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parameters.negativeBias}
                  onChange={(e) => setParameters({...parameters, negativeBias: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Higher values = neutral situations interpreted more negatively
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Cognitive Load: {parameters.cognitiveLoad}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parameters.cognitiveLoad}
                  onChange={(e) => setParameters({...parameters, cognitiveLoad: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Higher values = simple decisions feel overwhelming and exhausting
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('comparison')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              See How Depression Changes Choices
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'comparison') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">The Difference Depression Makes</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-green-800">Your Choices</h3>
                </div>
                {scenario.steps.map((step, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">{step.situation}</p>
                    <p className="font-semibold text-gray-800 bg-white p-3 rounded">
                      ✓ {userChoices[index].text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-red-800">With Depression Parameters</h3>
                </div>
                {scenario.steps.map((step, index) => {
                  const depChoice = getDepressionChoice(step.choices, parameters);
                  return (
                    <div key={index} className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">{step.situation}</p>
                      <p className="font-semibold text-gray-800 bg-white p-3 rounded">
                        → {depChoice.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 mb-6">
              <h4 className="font-bold text-gray-800 mb-2">Why This Matters</h4>
              <p className="text-gray-700">
                Depression isn't just "feeling sad" - it fundamentally changes how the brain processes information and makes decisions. 
                These aren't choices people make because they're weak or not trying hard enough. They're the result of measurable 
                neurological changes that can be treated with proper support and care.
              </p>
            </div>

            <button
              onClick={resetMode}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> Try Again with Different Parameters
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// ============================================
// GAME MODE B: ADVANCED VERSION (Empty - Ready for Your Code)
// ============================================
function AdvancedMode() {
  // TODO: Add your advanced computational psychiatry logic here!
  // This is where you'll build the more complex version
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Zap className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Advanced Mode</h1>
          <p className="text-gray-600 mb-6">
            This mode is under construction. You'll build the advanced computational psychiatry model here!
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 text-left">
            <p className="text-sm text-gray-700">
              <strong>Coming soon:</strong> Multi-parameter weighting, choice properties (reward value, social risk), 
              composite scoring algorithms, and more sophisticated depression modeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP: MODE SELECTOR
// ============================================
function MentalHealthApp() {
  const [selectedMode, setSelectedMode] = useState(null);

  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-20 h-20 text-slate-700" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Mental Health Perspective Simulator
            </h1>
            <p className="text-xl text-gray-600">
              Choose your experience level to begin
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-10 h-10 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Simple Mode</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Perfect for introducing the concept of computational psychiatry. Uses a straightforward 
                model based on negative bias to show how depression affects decision-making.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-purple-800 mb-2">Features:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 3 basic depression parameters</li>
                  <li>• Simple decision tree logic</li>
                  <li>• Clear before/after comparison</li>
                  <li>• Great for educational presentations</li>
                </ul>
              </div>
              <button
                onClick={() => setSelectedMode('simple')}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Start Simple Mode
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition border-2 border-indigo-200">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-10 h-10 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Advanced Mode</h2>
              </div>
              <p className="text-gray-600 mb-6">
                For deeper exploration of computational psychiatry. Build a sophisticated weighted 
                composite model with multiple interacting parameters.
              </p>
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-indigo-800 mb-2">You'll Create:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Multiple depression parameters</li>
                  <li>• Weighted composite scoring</li>
                  <li>• Choice properties (reward, risk)</li>
                  <li>• Research-based algorithms</li>
                </ul>
              </div>
              <button
                onClick={() => setSelectedMode('advanced')}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Start Advanced Mode
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Both modes demonstrate how depression is a quantifiable neurological condition, not a personal failing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMode === 'simple') {
    return (
      <div>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 font-semibold z-50"
        >
          ← Back to Mode Selection
        </button>
        <SimpleMode />
      </div>
    );
  }

  if (selectedMode === 'advanced') {
    return (
      <div>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 font-semibold z-50"
        >
          ← Back to Mode Selection
        </button>
        <AdvancedMode />
      </div>
    );
  }
}

export default MentalHealthApp;