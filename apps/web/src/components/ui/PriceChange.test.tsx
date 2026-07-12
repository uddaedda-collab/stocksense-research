import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceChange } from './PriceChange';

describe('PriceChange', () => {
  function findByExactText(container: HTMLElement, text: string) {
    return Array.from(container.querySelectorAll('span')).find((el) => el.textContent === text);
  }

  it('renders an up arrow and gain badge for positive change', () => {
    const { container } = render(<PriceChange changePercent={2.5} />);
    const el = findByExactText(container, '▲ +2.50%');
    expect(el).toBeTruthy();
    expect(el).toHaveClass('badge-gain');
  });

  it('renders a down arrow and loss badge for negative change', () => {
    const { container } = render(<PriceChange changePercent={-1.2} />);
    const el = findByExactText(container, '▼ -1.20%');
    expect(el).toBeTruthy();
    expect(el).toHaveClass('badge-loss');
  });

  it('treats zero change as a gain (non-negative), with no leading sign', () => {
    const { container } = render(<PriceChange changePercent={0} />);
    const el = findByExactText(container, '▲ 0.00%');
    expect(el).toBeTruthy();
    expect(el).toHaveClass('badge-gain');
  });
});
