import { formatNumber, formatPercentage } from 'common/format';

/**
 * Formats an overheal amount with its share of raw healing in parentheses.
 * Example: `12,345 (34.56%)`
 */
export function formatOverhealing(overheal: number, effectiveHealing: number): string {
  const raw = effectiveHealing + overheal;
  return `${formatNumber(overheal)} (${formatPercentage(raw > 0 ? overheal / raw : 0)}%)`;
}
