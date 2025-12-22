import React, { useState, useEffect } from 'react';
import { CpuChipIcon, BoltIcon, BookOpenIcon, FunnelIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
 // ============================================
// MODE SELECTOR
// ============================================
function ModeSelector({ setSelectedMode }) { // 👈 Accept setSelectedMode as prop
    const [userDecisions, setUserDecisions] = useState(null);
    const [agentDecisions, setAgentDecisions] = useState(null);
    const [showComparison, setShowComparison] = useState(false);

    // Load decisions from localStorage
    useEffect(() => {
        const userData = localStorage.getItem('userDecisions');
        const agentData = localStorage.getItem('agentDecisions');
        
        if (userData) {
            try {
                setUserDecisions(JSON.parse(userData));
            } catch (e) {
                console.error('Error parsing user decisions:', e);
            }
        }
        
        if (agentData) {
            try {
                setAgentDecisions(JSON.parse(agentData));
            } catch (e) {
                console.error('Error parsing agent decisions:', e);
            }
        }

        // Check if we should show comparison (set by AgentMode or other components)
        const shouldShowComparison = sessionStorage.getItem('showComparison');
        if (shouldShowComparison === 'true') {
            setShowComparison(true);
            sessionStorage.removeItem('showComparison'); // Clear the flag after using it
        }
    }, []);

    // Clear decisions (for testing/reset)
    const clearDecisions = () => {
        localStorage.removeItem('userDecisions');
        localStorage.removeItem('agentDecisions');
        setUserDecisions(null);
        setAgentDecisions(null);
        setShowComparison(false);
    };

    // If we should show comparison, render it
    if (showComparison) {
        return (
            <div className="min-h-screen bg-slate-900 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                                <CpuChipIcon className="w-20 h-20 text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-semibold text-slate-100 mb-4">
                            Decision Comparison
                        </h1>
                        <p className="text-xl text-slate-400">
                            Compare your decisions with the agent's decisions
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden mb-6">
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
                                    {(() => {
                                        // Helper function to convert reward to display scale
                                        const convertRewardToDisplayScale = (reward) => {
                                            return ((reward - 4.5) / 3.5) * 10;
                                        };

                                        // If no user decisions, show message in first row
                                        if (!userDecisions && agentDecisions) {
                                            // Get agent steps with choices
                                            const agentStepsWithChoices = agentDecisions.path.filter(p => p.choice);
                                            
                                            return (
                                                <>
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-8 text-center border-b border-slate-700">
                                                            <div className="max-w-2xl mx-auto">
                                                                <p className="text-slate-300 text-lg mb-4">
                                                                    Play Outcome Mode to compare your decisions with the agent's
                                                                </p>
                                                                <button
                                                                    onClick={() => setSelectedMode('outcome')}
                                                                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg inline-flex items-center gap-2"
                                                                >
                                                                    Start Outcome Mode
                                                                    <ArrowRightIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Show agent decisions */}
                                                    {agentStepsWithChoices.map((step, i) => (
                                                        <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-4 py-4 text-sm font-medium text-slate-300 border-r border-slate-700">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-slate-600 text-slate-100 flex items-center justify-center font-semibold rounded-lg">
                                                                    {i + 1}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 border-r border-slate-700">
                                                                <div className="p-3 bg-slate-700/30 border border-slate-600 rounded-lg text-center">
                                                                    {i === 0 ? (
                                                                        <>
                                                                            <p className="text-slate-300 text-sm mb-3">
                                                                                Play Outcome Mode to compare decisions
                                                                            </p>
                                                                            <button
                                                                                onClick={() => setSelectedMode('outcome')}
                                                                                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-4 text-sm border border-indigo-500 font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg inline-flex items-center gap-2"
                                                                            >
                                                                                Start Outcome Mode
                                                                                <ArrowRightIcon className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-slate-500 text-xs italic">-</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                                                                    <p className="text-slate-200 font-medium mb-1">{step.choice.text}</p>
                                                                    {step.outcome && (
                                                                        <p className="text-sm text-slate-400 mt-1 mb-2">
                                                                            {step.outcome.description}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-xs text-slate-500">
                                                                            Confidence: {step.choice.confidenceLevel}/10
                                                                        </span>
                                                                        {step.outcome && (() => {
                                                                            const displayReward = convertRewardToDisplayScale(step.outcome.reward);
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
                                                        </tr>
                                                    ))}
                                                </>
                                            );
                                        }

                                        // User decisions exist but no agent decisions - show user decisions with button to run agent
                                        if (userDecisions && !agentDecisions) {
                                            return userDecisions.choices.map((userChoice, i) => {
                                                // Get user outcome
                                                const isLastChoice = i === userDecisions.choices.length - 1;
                                                const outcomeIndex = isLastChoice && userDecisions.outcomes.length > userDecisions.choices.length 
                                                    ? userDecisions.outcomes.length - 1 
                                                    : i;
                                                const userOutcome = userDecisions.outcomes[outcomeIndex];
                                                
                                                return (
                                                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-4 py-4 text-sm font-medium text-slate-300 border-r border-slate-700">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-slate-600 text-slate-100 flex items-center justify-center font-semibold rounded-lg">
                                                                {i + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-700">
                                                            <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                                                                <p className="text-slate-200 font-medium mb-1">{userChoice.text}</p>
                                                                {userOutcome && (
                                                                    <p className="text-sm text-slate-400 mt-1 mb-2">
                                                                        {userOutcome.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs text-slate-500">
                                                                        Confidence: {userChoice.confidenceLevel}/10
                                                                    </span>
                                                                    {userOutcome && (() => {
                                                                        const displayReward = convertRewardToDisplayScale(userOutcome.reward);
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
                                                            <div className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg text-center">
                                                                {i === 0 ? (
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
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        }

                                        // Both user and agent decisions exist - show comparison
                                        if (userDecisions && agentDecisions) {
                                            // Get agent steps with choices
                                            const agentStepsWithChoices = agentDecisions.path.filter(p => p.choice);
                                            
                                            // Determine max steps
                                            const maxSteps = Math.max(
                                                userDecisions.choices.length,
                                                agentStepsWithChoices.length
                                            );

                                            const rows = [];
                                            for (let i = 0; i < maxSteps; i++) {
                                                const userChoice = userDecisions.choices[i];
                                                const agentStep = agentStepsWithChoices[i];
                                                
                                                // Get user outcome
                                                const isLastChoice = i === userDecisions.choices.length - 1;
                                                const outcomeIndex = isLastChoice && userDecisions.outcomes.length > userDecisions.choices.length 
                                                    ? userDecisions.outcomes.length - 1 
                                                    : i;
                                                const userOutcome = userDecisions.outcomes[outcomeIndex];

                                                rows.push(
                                                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-4 py-4 text-sm font-medium text-slate-300 border-r border-slate-700">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-slate-600 text-slate-100 flex items-center justify-center font-semibold rounded-lg">
                                                                {i + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-700">
                                                            {userChoice ? (
                                                                <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                                                                    <p className="text-slate-200 font-medium mb-1">{userChoice.text}</p>
                                                                    {userOutcome && (
                                                                        <p className="text-sm text-slate-400 mt-1 mb-2">
                                                                            {userOutcome.description}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-xs text-slate-500">
                                                                            Confidence: {userChoice.confidenceLevel}/10
                                                                        </span>
                                                                        {userOutcome && (() => {
                                                                            const displayReward = convertRewardToDisplayScale(userOutcome.reward);
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
                                                                <div className="p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                                                                    <p className="text-slate-500 text-xs italic">-</p>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {agentStep?.choice ? (
                                                                <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
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
                                                                            const displayReward = convertRewardToDisplayScale(agentStep.outcome.reward);
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
                                                                <div className="p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                                                                    <p className="text-slate-500 text-xs italic">-</p>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return rows;
                                        }

                                        // No data
                                        return (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                                                    No decisions to compare yet
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={() => {
                                setShowComparison(false);
                                sessionStorage.removeItem('showComparison'); // Clear any lingering flag
                            }}
                            className="bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 px-6 border border-slate-600 font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-200 rounded-lg"
                        >
                            Back to Mode Selection
                        </button>
                        <button
                            onClick={clearDecisions}
                            className="bg-slate-800 text-slate-300 py-3 px-6 border border-slate-700 font-medium hover:bg-slate-700 transition rounded-lg"
                        >
                            Clear Comparison Data
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                            <CpuChipIcon className="w-20 h-20 text-indigo-400 animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-semibold text-slate-100 mb-4">
                        Mental Health Perspective Simulator
                    </h1>
                    <p className="text-xl text-slate-400">
                        Choose a mode to begin
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-105 rounded-lg flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <BookOpenIcon className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-100">Outcome Mode</h2>
                        </div>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Get an evaluation of your "depression" levels.
                        </p>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Think of it as a combination between a choose-your-own-adventure and a personality test.
                        </p>
                        <div className="bg-slate-700/50 border border-slate-600 p-4 mb-6">
                            <p className="text-sm font-medium text-slate-300 mb-2">What you'll do:</p>
                            <ul className="text-sm text-slate-400 space-y-1">
                                <li>• Go through a typical school day</li>
                                <li>• Make decisions as you would normally</li>
                                <li>• See your confidence levels change</li>
                                <li>• Learn about the different traits that contribute to depression</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setSelectedMode('outcome')}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg mt-auto"
                        >
                            Start Outcome Mode
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105 rounded-lg flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <BoltIcon className="w-10 h-10 text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-100">Agent Mode</h2>
                        </div>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Experiment with how different "personality settings" affect someone's experience.
                        </p>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Adjust how much someone is affected by good vs. bad experiences, then watch how an AI agent navigates the same scenarios.
                        </p>
                        <div className="bg-slate-700/50 border border-slate-600 p-4 mb-6">
                            <p className="text-sm font-medium text-slate-300 mb-2">What you'll do:</p>
                            <ul className="text-sm text-slate-400 space-y-1">
                                <li>• Adjust how much good experiences affect confidence</li>
                                <li>• Adjust how much bad experiences affect confidence</li>
                                <li>• Watch an AI agent go through the same scenarios</li>
                                <li>• See how different settings lead to different outcomes</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setSelectedMode('agent')}
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-6 border border-amber-500 font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-amber-500/50 rounded-lg mt-auto"
                        >
                            Start Agent Mode
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300 hover:scale-105 rounded-lg flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-500/10 rounded-lg">
                                <FunnelIcon className="w-10 h-10 text-rose-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-100">Depression Filter</h2>
                        </div>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Experience what it's like to have depression's "mental filter" - where good experiences barely help, but bad ones hit hard.
                        </p>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Some choices will be blocked because they require more confidence than you can build up.
                        </p>
                        <div className="bg-slate-700/50 border border-slate-600 p-4 mb-6">
                            <p className="text-sm font-medium text-slate-300 mb-2">What you'll experience:</p>
                            <ul className="text-sm text-slate-400 space-y-1">
                                <li>• Good experiences barely increase your confidence</li>
                                <li>• Bad experiences significantly decrease your confidence</li>
                                <li>• Some choices become unavailable (blocked)</li>
                                <li>• See how this creates a cycle that's hard to break</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setSelectedMode('depressionFilter')}
                            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 px-6 border border-rose-500 font-medium hover:from-rose-500 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-rose-500/50 rounded-lg mt-auto"
                        >
                            Start Depression Filter
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800 border border-slate-700 p-6 text-center max-w-4xl mx-auto rounded-lg shadow-xl">
                        <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-4 rounded-full"></div>
                        <p className="text-slate-200 text-lg leading-relaxed">
                            Through all three modes, hopefully you will be able to come to a better understanding of depression.
                        </p>
                        <p className="text-slate-200 text-lg leading-relaxed mt-3">
                            It isn't just a feeling. It's a fundamental change in the brain's processing.
                        </p>
                    </div>
                </div>

                {/* Show comparison button if data exists */}
                {(userDecisions && agentDecisions) || (agentDecisions && !userDecisions) ? (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setShowComparison(true);
                                sessionStorage.setItem('showComparison', 'true'); // Set flag in case of refresh
                            }}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 border border-indigo-500 font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-md hover:shadow-indigo-500/50 rounded-lg inline-flex items-center gap-2"
                        >
                            View Decision Comparison
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default ModeSelector;