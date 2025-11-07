import React, { useState } from 'react';
// Import the separated components
import { SimpleMode, LearningMode, ModeSelector } from './components';

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
          className="fixed top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 font-semibold z-50"
        >
          ← Back to Mode Selection
        </button>
        <SimpleMode setSelectedMode={setSelectedMode} /> 
      </>
    );
  }

  // 3. Render LearningMode if 'Learning' is selected
  if (selectedMode === 'Learning') {
    return (
      <>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 font-semibold z-50"
        >
          ← Back to Mode Selection
        </button>
        <LearningMode setSelectedMode={setSelectedMode} />
      </>
    );
  }
}

export default MentalHealthApp;