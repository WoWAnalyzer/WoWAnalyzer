/**
 * Calculates the effective healing attributable to the *last stack* of a stacking percent healing buff.
 * See `calculateEffectiveHealing` first for more info on the calculation and how overheal is handled.
 *
 * This can be useful for calculating the marginal benefit of 'one more point' in something.
 * For example, consider an effect that grants +10% healing per point, and the player has 4 points.
 * We can't consider the boost from the 4th point to be another +10% because it stacks additively with the previous +30%,
 * so for a 1400 heal the calculation would be 1300 from base heal + 30%, 100 attributable from extra +10%.
 * If we had considered the +10% in a vacuum the calculation would have been 1400 - (1400 / 1.1) = 127.
 *
 * @param event a healing event (or heal-like event) that was boosted by an effect
 * @param relativeHealIncreasePerStack the boost's added multiplier per stack (for +10% pass 0.10)
 * @param stacks the number of stacks active, *including the marginal stack we're calculating for*
 *   (so in the above example we'd pass 4)
 * @return the amount of healing attributable on the given heal from the last stack of the given boost
 */
export default function calculateEffectiveHealingStacked(
  event: { amount: number },
  relativeHealIncreasePerStack: number,
  stacks: number,
): number {
  const amount = event.amount;
  const absorbed = (event as any).absorbed || 0;
  const overheal = (event as any).overheal || 0;
  const raw = amount + absorbed + overheal;
  const relativeHealingIncreaseFactor = 1 + relativeHealIncreasePerStack * stacks;
  const totalHealingIncrease = raw - raw / relativeHealingIncreaseFactor;
  const oneStackHealingIncrease = totalHealingIncrease / stacks;
  const effectiveHealing = oneStackHealingIncrease - overheal;

  return Math.max(0, effectiveHealing);
}
