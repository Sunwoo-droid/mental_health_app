import React from 'react';
import { render, screen } from '@testing-library/react';
import ModeSelector from '../ModeSelector';
import { createDecisionSnapshot } from '../../utils/decisionSnapshot';

function renderModeSelector() {
  return render(<ModeSelector setSelectedMode={jest.fn()} />);
}

function writeSnapshot(key) {
  const snapshot = createDecisionSnapshot({
    source: key,
    steps: [{ stepIndex: 0, choice: { text: 'A', confidenceLevel: 5 }, outcome: { reward: 6 } }],
    valueHistory: [5, 5.6],
  });
  window.localStorage.setItem(key, JSON.stringify(snapshot));
}

describe('ModeSelector comparison gating', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  test('shows none state when no snapshots exist', () => {
    renderModeSelector();
    expect(
      screen.getByText(/Status: no snapshots yet/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /View Decision Comparison/i })
    ).not.toBeInTheDocument();
  });

  test('shows user-only state when only user snapshot exists', () => {
    writeSnapshot('userDecisions');
    renderModeSelector();
    expect(screen.getByText(/Status: your snapshot is ready/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /View Decision Comparison/i })
    ).toBeInTheDocument();
  });

  test('shows agent-only state when only agent snapshot exists', () => {
    writeSnapshot('agentDecisions');
    renderModeSelector();
    expect(screen.getByText(/Status: agent snapshot is ready/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /View Decision Comparison/i })
    ).toBeInTheDocument();
  });

  test('shows both state when both snapshots exist', () => {
    writeSnapshot('userDecisions');
    writeSnapshot('agentDecisions');
    renderModeSelector();
    expect(screen.getByText(/Status: both snapshots are ready/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /View Decision Comparison/i })
    ).toBeInTheDocument();
  });
});

