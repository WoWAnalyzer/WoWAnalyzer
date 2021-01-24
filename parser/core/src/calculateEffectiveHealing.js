/**
 * Velen's is a static 15% healing increase to the raw healing going out. If that increase turns out to be overhealing it is worthless, so my approach of reducing the healing gain by the overhealing really only gives you the gain in healing that actually did something. An implementation that ignores overhealing and acts like Velen's contributed 15% of the effective healing will be inaccurate if there was any overhealing.
 *
 * I'll try to explain this PoV with an example:
 * Normal spell heals for 1,000 raw
 * With Velen's this is 1,150 raw. So Velen's increased the heal by 150 raw healing, that healing is on top of the original 1,000 raw healing the spell normally does.
 * Then comes overhealing;
 * If the spell overheals for 50, then the spell will have healed for 1,100. At this point Velen's effectively contributes 100 healing.
 * If the spell overheals for 100, then the spell will have healed for 1,050. So velen's effectiveness is 50;
 * If the spell overheals for 150, then the spell will have healed for the original 1,000 and Velen's increase was completely wasted.
 * If the spell overheals for 200, then 50 healing of the original spell was already overhealing, and the increased healing from Velen's did nothing (0).
 *
 * If you ignore raw healing and look at the actual healing done you may see the last 950 healing and think 15% of that was contributed by Velen's, while in fact it was 0.
 */

export default function calculateEffectiveHealing(event, relativeHealIncrease) {
  const amount = event.amount;
  const absorbed = event.absorbed || 0;
  const overheal = event.overheal || 0;
  const raw = amount + absorbed + overheal;
  const relativeHealingIncreaseFactor = 1 + relativeHealIncrease;
  const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
  const effectiveHealing = healingIncrease - overheal;

  return Math.max(0, effectiveHealing);
}
