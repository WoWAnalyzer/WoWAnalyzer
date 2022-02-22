import { DamageEvent } from 'parser/core/Events';

/**
 * Calculates the effective damage attributable to the *last stack* of a stacking percent damage buff.
 *
 * This can be useful for calculating the marginal benefit of 'one more point' in something.
 * For example, consider an effect that grants +10% damage per point, and the player has 4 points.
 * We can't consider the boost from the 4th point to be another +10% because it stacks additively with the previous +30%,
 * so for a 1400 damage the calculation would be 1300 from base damage + 30%, 100 attributable from extra +10%.
 * If we had considered the +10% in a vacuum the calculation would have been 1400 - (1400 / 1.1) = 127.
 *
 * @param event a damage event that was boosted by an effect
 * @param increase the boost's added multiplier per stack (for +10% pass 0.10)
 * @param stacks the number of stacks active, *including the marginal stack we're calculating for*
 *   (so in the above example we'd pass 4)
 * @return the amount of damage attributable on the given damage event from the last stack of the given boost
 */
export default function calculateEffectiveDamageStacked(
  event: DamageEvent,
  increase: number,
  stacks: number,
): number {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  const relativeDamageIncreaseFactor = 1 + increase * stacks;
  const totalIncrease = raw - raw / relativeDamageIncreaseFactor;
  const oneStackIncrease = totalIncrease / stacks;

  return Math.max(0, oneStackIncrease);
}
