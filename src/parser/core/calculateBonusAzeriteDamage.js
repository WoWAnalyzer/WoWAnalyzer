/**
 * Calculates the trait contribution to the real damage from event.
 * @param {object} event Damage event itself
 * @param {number} traitBonus Bonus to base damage from traits
 * @param {Array} coefficients Coefficients that form the base damage (most likely SP coefficient, current intellect, current attack power etc.)
 * @param {Array} knownOtherEffects Other constants to ADD to the base damage (e.g. effect from other traits that needs to be accounted for)
 * @returns {number} Bonus damage contributed by the trait
 */
export default function calculateBonusAzeriteDamage(event, traitBonus, coefficients, knownOtherEffects = []) {
  const actualDamage = event.amount + (event.absorbed || 0);
  // In order to generalize, instead of hardcoded fields for intellect, attack power, spell coefficients
  // there's just one array that gets multiplied together to form the base damage
  const baseDamage = coefficients.reduce((total, current) => total * current, 1) + knownOtherEffects.reduce((total, current) => total + current, 0);
  // Get modifier from `actualDamage = (baseDamage + traitBonus) * modifier`
  const modifier = actualDamage / (baseDamage + traitBonus);
  // Scale the trait bonus by the same modifier
  return traitBonus * modifier;
}
