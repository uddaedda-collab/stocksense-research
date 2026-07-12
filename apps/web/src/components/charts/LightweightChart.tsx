'use client';

import { useEffect, useRef } from 'react';
import type { HistoricalBar } from '@platform/shared';
import { useTheme } from '@/lib/ThemeProvider';

interface Props {
  bars: HistoricalBar[];
  height?: number;
}

/**
 * Renders an OHLC candlestick chart using TradingView's free, open-source
 * Lightweight Charts library (Apache 2.0 licensed). Loaded dynamically on
 * the client only, since it requires the DOM/canvas.
 */
export function LightweightChart({ bars, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let chart: any;
    let resizeObserver: ResizeObserver;

    async function render() {
      if (!containerRef.current || bars.length === 0) return;
      const { createChart, ColorType } = await import('lightweight-charts');

      containerRef.current.innerHTML = '';
      chart = createChart(containerRef.current, {
        height,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: theme === 'dark' ? '#d1d5db' : '#374151',
        },
        grid: {
          vertLines: { color: theme === 'dark' ? '#1f2937' : '#f3f4f6' },
          horzLines: { color: theme === 'dark' ? '#1f2937' : '#f3f4f6' },
        },
        timeScale: { borderVisible: false },
        rightPriceScale: { borderVisible: false },
      });

      const series = chart.addCandlestickSeries({
        upColor: '#16a34a',
        downColor: '#dc2626',
        borderVisible: false,
        wickUpColor: '#16a34a',
        wickDownColor: '#dc2626',
      });

      series.setData(
        bars.map((b) => ({ time: b.date, open: b.open, high: b.high, low: b.low, close: b.close }))
      );
      chart.timeScale().fitContent();

      resizeObserver = new ResizeObserver((entries) => {
        const { width } = entries[0].contentRect;
        chart.applyOptions({ width });
      });
      resizeObserver.observe(containerRef.current);
    }

    render();

    return () => {
      resizeObserver?.disconnect();
      chart?.remove();
    };
  }, [bars, height, theme]);

  if (bars.length === 0) {
    return <p className="text-sm text-gray-500">No chart data available.</p>;
  }

  return <div ref={containerRef} role="img" aria-label="Stock price candlestick chart" />;
}
