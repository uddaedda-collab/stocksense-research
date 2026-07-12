import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisclaimerBox } from './DisclaimerBox';

describe('DisclaimerBox', () => {
  it('renders the provided disclaimer text', () => {
    render(<DisclaimerBox text="This is not investment advice." />);
    expect(screen.getByText(/This is not investment advice\./)).toBeInTheDocument();
    expect(screen.getByText('Disclaimer:')).toBeInTheDocument();
  });

  it('exposes the disclaimer as an accessible note role', () => {
    render(<DisclaimerBox text="Test disclaimer" />);
    expect(screen.getByRole('note')).toBeInTheDocument();
  });
});
