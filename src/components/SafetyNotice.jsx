import React from 'react';

function SafetyNotice({ className = '' }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-lg p-4 ${className}`}>
      <p className="text-sm text-slate-300">
        This experience is an educational simulation, not a clinical assessment or diagnosis.
        Real mental health experiences vary by person, and support from qualified professionals can help.
      </p>
    </div>
  );
}

export default SafetyNotice;

