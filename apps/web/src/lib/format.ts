export function formatINR(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `₹${(value / 1e7).toFixed(0)} Cr`; // Indian crore convention for market cap
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return formatINR(value, 0);
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}
