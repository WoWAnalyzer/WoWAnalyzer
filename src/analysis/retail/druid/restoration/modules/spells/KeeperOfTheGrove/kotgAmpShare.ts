import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { HealEvent } from 'parser/core/Events';

export interface KotgAmpShare {
  key: string;
  /** Flat healing-increase fraction, e.g. 0.2 for +20% */
  increase: number;
}

/**
 * Splits a heal's combined KotG % amp across co-active amps for the hero-tree total.
 * Solo cards still use full marginal {@link calculateEffectiveHealing}.
 *
 * Amps stack multiplicatively. Shares are weighted by each amp's % so they sum to the joint bonus.
 */
export function splitKotgAmpHealing(
  event: HealEvent,
  amps: KotgAmpShare[],
): Record<string, number> {
  const active = amps.filter((a) => a.increase > 0);
  if (active.length === 0) {
    return {};
  }

  if (active.length === 1) {
    return { [active[0].key]: calculateEffectiveHealing(event, active[0].increase) };
  }

  const combinedIncrease = active.reduce((mult, a) => mult * (1 + a.increase), 1) - 1;
  const totalBonus = calculateEffectiveHealing(event, combinedIncrease);
  const weightSum = active.reduce((sum, a) => sum + a.increase, 0);

  const shares: Record<string, number> = {};
  for (const amp of active) {
    shares[amp.key] = totalBonus * (amp.increase / weightSum);
  }
  return shares;
}
