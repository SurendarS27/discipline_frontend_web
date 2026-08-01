import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Smoke test - verifies the React testing pipeline is functional
describe('PragatiX Frontend CI Smoke Test', () => {
  it('renders a basic React element', () => {
    render(<div data-testid="ci-smoke">PragatiX CI Online</div>);
    expect(screen.getByTestId('ci-smoke')).toBeInTheDocument();
    expect(screen.getByTestId('ci-smoke')).toHaveTextContent('PragatiX CI Online');
  });

  it('environment sanity check', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
