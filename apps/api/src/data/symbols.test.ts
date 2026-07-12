import { describe, expect, it } from 'vitest';
import { findSymbolMeta, toYahooSymbol, NIFTY50_SYMBOLS } from './symbols';

describe('toYahooSymbol', () => {
  it('appends .NS for a bare ticker', () => {
    expect(toYahooSymbol('RELIANCE')).toBe('RELIANCE.NS');
  });

  it('leaves an already-suffixed symbol unchanged', () => {
    expect(toYahooSymbol('reliance.ns')).toBe('RELIANCE.NS');
    expect(toYahooSymbol('SOMESTOCK.BO')).toBe('SOMESTOCK.BO');
  });

  it('leaves index symbols (^) unchanged', () => {
    expect(toYahooSymbol('^NSEI')).toBe('^NSEI');
  });

  it('leaves forex/commodity symbols unchanged', () => {
    expect(toYahooSymbol('INR=X')).toBe('INR=X');
    expect(toYahooSymbol('GC=F')).toBe('GC=F');
  });
});

describe('findSymbolMeta', () => {
  it('finds metadata by display symbol', () => {
    const meta = findSymbolMeta('TCS');
    expect(meta?.name).toContain('Tata Consultancy');
  });

  it('finds metadata by full Yahoo symbol', () => {
    const meta = findSymbolMeta('TCS.NS');
    expect(meta?.displaySymbol).toBe('TCS');
  });

  it('returns undefined for an unknown symbol', () => {
    expect(findSymbolMeta('NOTREAL')).toBeUndefined();
  });
});

describe('NIFTY50_SYMBOLS', () => {
  it('has no duplicate symbols', () => {
    const symbols = NIFTY50_SYMBOLS.map((s) => s.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it('every entry uses the .NS suffix', () => {
    NIFTY50_SYMBOLS.forEach((s) => expect(s.symbol.endsWith('.NS')).toBe(true));
  });
});
