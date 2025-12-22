import React, { useState } from 'react';
// Import the separated components
import { SimpleMode, AgentMode, ModeSelector, OutcomeMode, DepressionFilter } from './components';

// ============================================
// MAIN APP: MODE SELECTOR
// ============================================
function MentalHealthApp() {
  const [selectedMode, setSelectedMode] = useState(null);

  // 1. Render ModeSelector if no mode is selected
  if (!selectedMode) {
    return <ModeSelector setSelectedMode={setSelectedMode} />;
  }

  // 2. Render SimpleMode if 'simple' is selected
  if (selectedMode === 'simple') {
    return (
      <>
        {/* Optional fixed button to go back to selection */}
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 bg-slate-800 border border-slate-700 px-4 py-2 rounded transition text-slate-200 font-medium z-50 hover:bg-slate-700"
        >
          ← Back to Mode Selection
        </button>
        <SimpleMode setSelectedMode={setSelectedMode} /> 
      </>
    );
  }

  // 3. Render AgentMode if 'agent' is selected
  if (selectedMode === 'agent') {
    return (
      <>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 bg-slate-800 border border-slate-700 px-4 py-2 rounded transition text-slate-200 font-medium z-50 hover:bg-slate-700"
        >
          ← Back to Mode Selection
        </button>
        <AgentMode setSelectedMode={setSelectedMode} />
      </>
    );
  }

  // 4. Render OutcomeMode if 'outcome' is selected
  if (selectedMode === 'outcome') {
    return (
      <>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 bg-slate-800 border border-slate-700 px-4 py-2 rounded transition text-slate-200 font-medium z-50 hover:bg-slate-700"
        >
          ← Back to Mode Selection
        </button>
        <OutcomeMode setSelectedMode={setSelectedMode} />
      </>
    );
  }

  // 5. Render DepressionFilter if 'depressionFilter' is selected
  if (selectedMode === 'depressionFilter') {
    return (
      <>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 bg-slate-800 border border-slate-700 px-4 py-2 rounded transition text-slate-200 font-medium z-50 hover:bg-slate-700"
        >
          ← Back to Mode Selection
        </button>
        <DepressionFilter setSelectedMode={setSelectedMode} />
      </>
    );
  }
}

export default MentalHealthApp;