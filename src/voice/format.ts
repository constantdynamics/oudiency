/** Weergave van tegoed, geld en gespreksduur (Nederlandse notatie). */

export function formatCredits(credits: number): string {
  return new Intl.NumberFormat('nl-NL').format(Math.round(credits));
}

export function formatMoney(amount: number, currency = 'usd'): string {
  try {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: amount < 1 ? 3 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** 7:05 of 1:02:05 */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`;
}
