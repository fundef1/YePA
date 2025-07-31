import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Index from './Index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCookie } from '@/lib/cookies';

// Mock child components to isolate the Index page logic
vi.mock('@/components/FileUploader', () => ({
  FileUploader: (props) => <div data-testid="file-uploader" {...props}>FileUploader Mock</div>
}));

vi.mock('@/components/ProfileSelector', () => ({
  ProfileSelector: (props) => <div data-testid="profile-selector" {...props}>ProfileSelector Mock</div>
}));

vi.mock('@/components/IconBackground', () => ({
  IconBackground: () => <div data-testid="icon-background">IconBackground Mock</div>
}));

vi.mock('@/components/AnimatedGradientBackground', () => ({
  AnimatedGradientBackground: () => <div data-testid="animated-gradient-background">AnimatedGradientBackground Mock</div>
}));

// Mock modules with side effects
vi.mock('@/lib/cookies');

describe('Index Page', () => {
  beforeEach(() => {
    // Ensure mocks are clean before each test
    vi.resetAllMocks();
    // Default mock for getCookie
    vi.mocked(getCookie).mockReturnValue(null);
  });

  it('renders all the main sections of the page', () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    // Check for header
    expect(screen.getByRole('heading', { name: /YePA/i })).toBeInTheDocument();

    // Check for profile selector section
    expect(screen.getByText(/1. Select an optimization profile/i)).toBeInTheDocument();
    expect(screen.getByTestId('profile-selector')).toBeInTheDocument();

    // Check for file uploader section
    expect(screen.getByText(/2. Upload your ePUB/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();

    // Check for download section
    expect(screen.getByText(/3. Download your ePUB/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download File/i })).toBeDisabled();
    
    // Check for processing log section
    expect(screen.getByText(/Processing Log/i)).toBeInTheDocument();
  });
});