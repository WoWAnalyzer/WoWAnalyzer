import { DamageEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';

/**
 * This should honestly be done away with but there are so many unique Events/Sub-Events that call the calculateEffectiveHealing fucntions
 * that this is just easier to do than go modify all the callers.
 */
interface LightWeightHealingEvent {
  amount: number;
  absorbed?: number;
  overheal?: number;
}

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
export function calculateEffectiveHealing(
  event: LightWeightHealingEvent,
  relativeHealIncrease: number,
): number {
  const amount = event.amount;
  const absorbed = event.absorbed || 0;
  const overheal = event.overheal || 0;
  const raw = amount + absorbed + overheal;
  const relativeHealingIncreaseFactor = 1 + relativeHealIncrease;
  const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
  const effectiveHealing = healingIncrease - overheal;

  return Math.max(0, effectiveHealing);
}

/**
 * Calculate what percent of a heal event can be attributed to a flat crit bonus (like +4% crit chance).
 *
 * ## Technical Details
 * This function uses an *amortized* model of events. It "steals" a part of each event proportional to the crit increase
 * and returns it (after removing overhealing). This doesn't make sense on any individual heal (crit %
 * increases don't increase the amount healed), but does make sense when you add up the totals
 * at the end, because you should get extra total healing on average.
 *
 * @param event a critical heal event
 * @param currentCrit the current critical strike percentage without the crit buff (example: 0.05 is 5%)
 * @param flatCritIncrease the critical strike increase being added by the buff (example: if your buff adds 4% crit, this is 0.04)
 * @param critHealMultiplier the multiplier for critical healing. this is usually 2 (the default value), but some effects increase it
 */
export function calculateEffectiveHealingFromCritIncrease(
  event: LightWeightHealingEvent,
  currentCrit: number,
  flatCritIncrease: number,
  critHealMultiplier = 2,
): number {
  // 1 - the total amount of healing done (including overhealing)
  const raw = event.amount + (event.absorbed ?? 0) + (event.overheal ?? 0);
  // 2 - the amount of (1) that is done due to it being a critical heal
  const additionalHealingFromCrit = raw - raw / critHealMultiplier;
  // 3 - the amount of (2) that is attributed to increased crit chance.
  const amountFromCritIncrease =
    additionalHealingFromCrit -
    (additionalHealingFromCrit * currentCrit) / (currentCrit + flatCritIncrease);
  // 4 - remove overhealing from (3), returning 0 if it is all overhealing)
  return Math.max(0, amountFromCritIncrease - (event.overheal ?? 0));
}

/**
 * Calculates the overhealing attributable to a percent healing buff.
 * The bonus healing is considered 'marginal' and will be consumed first when encountering overheal.
 *
 * For example, consider an effect that boosts healing by 20%, and we want to attribute overhealing caused by the effect.
 * We pass an event with raw healing of 1200 and 100 overheal, and we pass the relativeHealIncrease which is 0.20.
 * The function would calculate 1000 as the healing without the boost and the added healing to be 200, which is equal or higher to the overhealing so 100 would the the overhealing attributable.
 *
 * We consider the boosted healing to be the 'last' healing applied, so it is the first thing to be subtracted if we overheal.
 * This means that the overhealing is the smallest of overhealing and bonus healing from the healing increase
 * For example, if the 1200 heal was 1150 effective and 50 overheal, we would attribute min(200,50) = 50 healing attributable.
 * If the 1200 heal was 900 effective and 300 overheal, all of the bonus was overheal and so min(200,300) = 200 healing is attributable.
 *
 * @param event a healing event (or heal-like event) that was boosted by an effect
 * @param relativeHealIncrease the boost's added multiplier (for +20% pass 0.20)
 * @return the amount of overhealing attributable on the given heal from the given boost
 */
export function calculateOverhealing(
  event: LightWeightHealingEvent,
  relativeHealIncrease: number,
): number {
  const amount = event.amount;
  const absorbed = event.absorbed || 0;
  const overheal = event.overheal || 0;
  const raw = amount + absorbed + overheal;
  const relativeHealingIncreaseFactor = 1 + relativeHealIncrease;
  const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
  const overhealing = Math.min(overheal, healingIncrease);

  return overhealing;
}

/**
 * Gets raw max casts of a spell over a period of time.
 * @param cooldown the cooldown time of the spell, in seconds
 * @param duration the duration of the time period to assess, in milliseconds
 * @param charges the number of charges the spell has
 */
export function calculateMaxCasts(cooldown: number, duration: number, charges = 1) {
  return duration / 1000 / cooldown + charges - 1;
}

export function calculateEffectiveDamageReduction(event: DamageEvent, reduction: number) {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  return (raw / (1 - reduction)) * reduction;
}

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
export function calculateEffectiveDamage(event: DamageEvent, increase: number): number {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  return raw - raw / (1 + increase);
}

/**
 * Calculates the effective damage attributable to a crit damage increase
 *
 * For example, consider an effect that boosts crit damage by 30% so crits now deals 230% instead of 200%,
 * and we want to attribute damage caused by the effect.
 * We pass a crit event with raw damage of 2760, and we pass the increase which is 0.3.
 * The function would calculate 2400 as the damage without the boost so 2760 - 2400 = 360 damage attributable.
 *
 * @param event a crit damage event that was boosted by an effect
 * @param increase the boost's added crit multiplier (for +30% pass 0.30)
 * @return the amount of damage attributable on the given damage event from the given boost
 */
export function calculateEffectiveDamageFromCritDamageIncrease(
  event: DamageEvent,
  increase: number,
): number {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  const baseCritDmg = raw * (2 / (2 + increase));
  const effectiveDmgIncrease = raw - baseCritDmg;
  return effectiveDmgIncrease;
}

/**
 * Calculate what percent of a crit damage event can be attributed to a percent crit increase
 * @param event a crit damage event
 * @param currentCrit current crit percentage (excluding crit buff)
 * @param percentCritIncrease percent buff to calculate effect of
 * @return amount of crit damage attributable to percent crit increase
 */
export function calculateEffectiveDamageFromCritIncrease(
  event: DamageEvent,
  currentCrit: number,
  percentCritIncrease: number,
) {
  const amount = event.amount;
  const absorbed = event.absorbed || 0;
  const overkill = event.overkill || 0;
  const nonOverkill = amount + absorbed;
  const raw = amount + absorbed + overkill;
  const baseCritDmg = (raw / 2) * (currentCrit / (percentCritIncrease + currentCrit));
  const effectiveCritDmg = Math.max(0, nonOverkill - raw / 2);
  return Math.max(0, effectiveCritDmg - baseCritDmg);
}

/**
 * Calculates the target's health percent *before* the heal. Useful for evaluation of triage healing.
 *
 * Optionally, this calculation will consider removed healing absorbs to be part of 'missing health'
 * because they are usually important to remove. For example, if the target had 2000 max health,
 * 1000 current health, a 1000 healing abosrb, and the given heal removed 500 of that absorb,
 * this function would report the target as having being at 25% health.
 *
 * @param event the event to get target health from
 * @param includeHealAbsorbs iff true, removed healing absorbs on the target will be counted as missing health.
 * @return the target's health percent *before* the heal, in range 0 to 1. Note that if `includeHealAbsorbs` is true,
 * targets with a large heal absorb could report as having 0 health.
 */
export function calculateHealTargetHealthPercent(event: HealEvent, includeHealAbsorbs = false) {
  let healing = event.amount;
  if (includeHealAbsorbs) {
    healing += event.absorbed || 0;
  }
  const hitPointsBeforeHeal = event.hitPoints - healing;
  const targetHealthPercent = hitPointsBeforeHeal / event.maxHitPoints;
  if (targetHealthPercent > 1) {
    return 1;
  } else if (targetHealthPercent < 0) {
    return 0;
  } else {
    return targetHealthPercent;
  }
}

/**
 * Calculate what percent of a resource restore is attributable to a % increase
 * @param event a resource change event
 * @param increase percent increase in [0,1]
 * @return effective increase
 */
export function calculateEffectiveResourceRestored(event: ResourceChangeEvent, increase: number) {
  const relativeIncrease = 1 + increase;
  const manaIncrease = event.resourceChange - event.resourceChange / relativeIncrease;
  const effective = manaIncrease - event.waste;
  return Math.max(effective, 0);
}
