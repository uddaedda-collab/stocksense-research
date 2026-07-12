import { supabase } from './supabaseClient';
import { getQuote } from './marketData';

// ---------------------------------------------------------------------------
// Background job that periodically evaluates active (untriggered) price
// alerts against live quotes and marks them triggered when their condition
// is met. Runs in-process via setInterval since the backend is a persistent
// Node server (not serverless) on Render - no external cron/queue needed.
// Free-tier note: on Render's free instance the process sleeps after ~15min
// of inactivity, so this job also pauses during sleep and resumes checking
// on the next incoming request that wakes the instance - alerts are "best
// effort periodic", not real-time, and this is documented to users in the
// Alerts page disclaimer.
// ---------------------------------------------------------------------------

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
let intervalHandle: NodeJS.Timeout | null = null;
let isChecking = false;

export async function checkAlertsOnce(): Promise<{ checked: number; triggered: number }> {
  if (!supabase) return { checked: 0, triggered: 0 };
  if (isChecking) return { checked: 0, triggered: 0 }; // avoid overlapping runs
  isChecking = true;

  try {
    const { data: activeAlerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('triggered', false);

    if (error || !activeAlerts || activeAlerts.length === 0) {
      return { checked: 0, triggered: 0 };
    }

    const uniqueSymbols = [...new Set(activeAlerts.map((a: any) => a.symbol))];
    const quotesBySymbol = new Map<string, number>();
    await Promise.all(
      uniqueSymbols.map(async (symbol) => {
        try {
          const quote = await getQuote(symbol);
          quotesBySymbol.set(symbol, quote.price);
        } catch {
          // If a symbol's quote fails, skip it this cycle rather than failing everything.
        }
      })
    );

    let triggeredCount = 0;
    for (const alert of activeAlerts as any[]) {
      const price = quotesBySymbol.get(alert.symbol);
      if (price === undefined) continue;

      const shouldTrigger =
        alert.direction === 'above' ? price >= alert.target_price : price <= alert.target_price;

      if (shouldTrigger) {
        await supabase.from('price_alerts').update({ triggered: true }).eq('id', alert.id);
        triggeredCount += 1;
      }
    }

    return { checked: activeAlerts.length, triggered: triggeredCount };
  } finally {
    isChecking = false;
  }
}

export function startAlertChecker(): void {
  if (intervalHandle) return;
  intervalHandle = setInterval(() => {
    checkAlertsOnce().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[alertChecker] Failed to check alerts:', err);
    });
  }, CHECK_INTERVAL_MS);
  // Run one check shortly after startup too, rather than waiting a full interval.
  setTimeout(() => {
    checkAlertsOnce().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[alertChecker] Initial alert check failed:', err);
    });
  }, 15_000);
}

export function stopAlertChecker(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
