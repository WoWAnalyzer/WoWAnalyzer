/**
 * Calculates the effective healing attributable to a percent healing buff.
 * The bonus healing is considered 'marginal' and will be consumed first when encountering overheal.
 *
 * For example, consider an effect that boosts healing by 20%, and we want to attribute healing caused by the effect.
 * We pass an event with raw healing of 1200 and 0 overheal, and we pass the relativeHealIncrease which is 0.20.
 * The function would calculate 1000 as the healing without the boost so 1200 - 1000 = 200 healing attributable.
 *
 * We consider the boosted healing to be the 'last' healing applied, so it is the first thing to be subtracted if we overheal.
 * For example, if the 1200 heal was 1150 effective and 50 overheal, we would attribute 200 - 50 = 150 healing attributable.
 * If the 1200 heal was 900 effective and 300 overheal, all of the bonus was overheal and so 0 healing is attributable.
 *
 * @param event a healing event (or heal-like event) that was boosted by an effect
 * @param relativeHealIncrease the boost's added multiplier (for +20% pass 0.20)
 * @return the amount of healing attributable on the given heal from the given boost
 */
export default function calculateEffectiveHealing(
  event: { amount: number },
  relativeHealIncrease: number,
): number {
  const amount = event.amount;
  const absorbed = (event as any).absorbed || 0;
  const overheal = (event as any).overheal || 0;
  const raw = amount + absorbed + overheal;
  const relativeHealingIncreaseFactor = 1 + relativeHealIncrease;
  const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
  const effectiveHealing = healingIncrease - overheal;

  return Math.max(0, effectiveHealing);
}
