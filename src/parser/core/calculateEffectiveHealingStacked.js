/**
 * See `calculateEffectiveHealing` first for more info about our approach.
 *
 * Some spells stack and we want to know the value of the last point. For example Holy Paladin's trait
 * Deliver the Light increases Flash of Light and Holy Light healing done by 3% for each point. 3 points
 * are worth 9%. To get the value of 1 point doing `healingDone / 1.03` (which is pretty much what
 * `calculateEffectiveHealing` would do) would overvalue the point. Instead this gets the healing before
 * the bonus and then calculates the value of 1 point, accounting for overhealing like
 * `calculateEffectiveHealing`.
 */

export default function calculateEffectiveHealingStacked(event, relativeHealIncreasePerStack, stacks) {
  const amount = event.amount;
  const absorbed = event.absorbed || 0;
  const overheal = event.overheal || 0;
  const raw = amount + absorbed + overheal;
  const relativeHealingIncreaseFactor = 1 + (relativeHealIncreasePerStack * stacks);
  const totalHealingIncrease = raw - raw / relativeHealingIncreaseFactor;
  const oneStackHealingIncrease = totalHealingIncrease / stacks;
  const effectiveHealing = oneStackHealingIncrease - overheal;

  return Math.max(0, effectiveHealing);
}
