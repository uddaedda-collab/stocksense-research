import { beforeEach, describe, expect, it } from 'vitest';
import { addRecentlyViewed, getRecentlyViewed } from './recentlyViewed';

describe('recentlyViewed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty array when nothing has been viewed', () => {
    expect(getRecentlyViewed()).toEqual([]);
  });

  it('adds a symbol to the front of the list', () => {
    addRecentlyViewed('RELIANCE');
    addRecentlyViewed('TCS');
    expect(getRecentlyViewed()).toEqual(['TCS', 'RELIANCE']);
  });

  it('moves an existing symbol to the front instead of duplicating it', () => {
    addRecentlyViewed('RELIANCE');
    addRecentlyViewed('TCS');
    addRecentlyViewed('RELIANCE');
    expect(getRecentlyViewed()).toEqual(['RELIANCE', 'TCS']);
  });

  it('caps the list at 8 items', () => {
    for (let i = 0; i < 10; i++) {
      addRecentlyViewed(`SYMBOL${i}`);
    }
    expect(getRecentlyViewed()).toHaveLength(8);
    expect(getRecentlyViewed()[0]).toBe('SYMBOL9');
  });
});
