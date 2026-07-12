import type { TechnicalIndicatorResult } from '@platform/shared';
import { formatINR, formatNumber } from '@/lib/format';

export function TechnicalsPanel({ data }: { data: TechnicalIndicatorResult }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">Technical Indicators</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Trend" value={data.trend} />
        <Stat label="Momentum" value={data.momentum} />
        <Stat label="RSI (14)" value={formatNumber(data.rsi14, 1)} />
        <Stat label="MACD" value={formatNumber(data.macd.macdLine, 2)} />
        <Stat label="MACD Signal" value={formatNumber(data.macd.signalLine, 2)} />
        <Stat label="SMA 20" value={formatINR(data.sma20)} />
        <Stat label="SMA 50" value={formatINR(data.sma50)} />
        <Stat label="SMA 200" value={formatINR(data.sma200)} />
        <Stat label="EMA 12" value={formatINR(data.ema12)} />
        <Stat label="EMA 26" value={formatINR(data.ema26)} />
        <Stat label="ATR (14)" value={formatNumber(data.atr14, 2)} />
        <Stat label="ADX (14)" value={formatNumber(data.adx14, 1)} />
        <Stat label="Bollinger Upper" value={formatINR(data.bollinger.upper)} />
        <Stat label="Bollinger Middle" value={formatINR(data.bollinger.middle)} />
        <Stat label="Bollinger Lower" value={formatINR(data.bollinger.lower)} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Support Levels</p>
          <p className="font-semibold">
            {data.support.length > 0 ? data.support.map((s) => formatINR(s)).join(', ') : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Resistance Levels</p>
          <p className="font-semibold">
            {data.resistance.length > 0 ? data.resistance.map((r) => formatINR(r)).join(', ') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}
