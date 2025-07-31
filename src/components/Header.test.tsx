import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { describe, it, expect } from 'vitest';

describe('Header', () => {
  it('renders the main title "YePA"', () => {
    render(<Header isColorful={false} maxWidth={0} maxHeight={0} />);
    expect(screen.getByRole('heading', { name: /YePA/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Header isColorful={false} maxWidth={0} maxHeight={0} />);
    expect(screen.getByText(/Yet ePUB Processor Another/i)).toBeInTheDocument();
  });
});