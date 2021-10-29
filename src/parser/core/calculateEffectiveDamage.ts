import { DamageEvent } from 'parser/core/Events';

/**
 * Calculates the effective damage attributable to a percent damage buff.
 *
 * For example, consider an effect that boosts damage by 20%, and we want to attribute damage caused by the effect.
 * We pass an event with raw damage of 1200, and we pass the increase which is 0.20.
 * The function would calculate 1000 as the damage without the boost so 1200 - 1000 = 200 damage attributable.
 *
 * @param event a damage event that was boosted by an effect
 * @param increase the boost's added multiplier (for +20% pass 0.20)
 * @return the amount of damage attributable on the given damage event from the given boost
 */
export default function calculateEffectiveDamage(event: DamageEvent, increase: number): number {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  return raw - raw / (1 + increase);
}
