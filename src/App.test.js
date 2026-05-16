import { render, screen } from '@testing-library/react';
import App from './App';

test('renders mode selection heading', () => {
  render(<App />);
  const heading = screen.getByText(/Mental Health Perspective Simulator/i);
  expect(heading).toBeInTheDocument();
});
