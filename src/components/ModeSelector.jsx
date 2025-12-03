import React from 'react';
import { Brain, Zap, GraduationCap, BookOpen, Filter } from 'lucide-react';
 // ============================================
// MODE SELECTOR
// ============================================
function ModeSelector({ setSelectedMode }) { // 👈 Accept setSelectedMode as prop
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
                        Choose a mode to begin
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
                            <h2 className="text-2xl font-bold text-gray-800">Learning Mode</h2>
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
                            onClick={() => setSelectedMode('Learning')}
                            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Start Learning Mode
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition border-2 border-teal-200">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-10 h-10 text-teal-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Outcome Mode</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            A choose-your-own-adventure experience where your choices directly influence outcomes. 
                            Track your confidence and learning rates in real-time as you navigate branching scenarios.
                        </p>
                        <div className="bg-teal-50 rounded-lg p-4 mb-6">
                            <p className="text-sm font-semibold text-teal-800 mb-2">Features:</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Branching story paths</li>
                                <li>• Real-time confidence tracking</li>
                                <li>• TD learning algorithm</li>
                                <li>• Dynamic learning rate estimation</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setSelectedMode('outcome')}
                            className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition"
                        >
                            Start Outcome Mode
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition border-2 border-red-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Filter className="w-10 h-10 text-red-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Depression Filter</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Experience how depression's learning rates create a "mental filter" that blocks positive experiences 
                            from raising confidence. Choices requiring higher confidence are literally blocked.
                        </p>
                        <div className="bg-red-50 rounded-lg p-4 mb-6">
                            <p className="text-sm font-semibold text-red-800 mb-2">Features:</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Fixed depressed learning rates</li>
                                <li>• Blocked high-confidence choices</li>
                                <li>• Visual demonstration of the filter</li>
                                <li>• TD learning with α⁺=0.1, α⁻=0.8</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setSelectedMode('depressionFilter')}
                            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            Start Depression Filter
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-700 text-sm">
                        Through all modes, hopefully you will come to realize that there are quantifiable changes happening in the brain during depression. It's not a feeling, it's a fundamental change in processing.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ModeSelector;