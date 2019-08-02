// Function to calculate the contribution of a class-spell based azerite trait (as in, it directly affects an existing spell, increasing its healing) by figuring out how much % of the spell the trait will do.
// As those traits scale exactly the same as the base spell (barring Intellect), any scalings and healing buffs or debuffs can be ignored
export function calculateTraitHealing(IntellectRating, BaseSpellCoefficient, RawTraitHeal, event) {
  const spellheal = IntellectRating * BaseSpellCoefficient;
  const traitComponent = RawTraitHeal / (spellheal + RawTraitHeal);

  const healAmount = event.amount + (event.absorbed || 0);
  const overhealAmount = (event.overheal || 0);
  const raw = healAmount + overhealAmount;
  const relativeHealingFactor = 1 + traitComponent;
  const relativeHealing = raw - raw / relativeHealingFactor;
  const heal = Math.max(0, relativeHealing - overhealAmount);
  const overheal = Math.max(0, relativeHealing - heal);

  return { healing: heal, overhealing: overheal };
}
