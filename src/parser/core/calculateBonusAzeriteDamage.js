/**
 * Calculates the trait contribution to the real damage from event.
 * @param {object} event Damage event itself
 * @param {number} traitBonus Bonus to base damage from traits
 * @param {...number} coefficients Coefficients that form the base damage (most likely SP coefficient, current intellect, current attack power etc.)
 * @returns {number} Bonus damage contributed by the trait
 */
export default function calculateBonusAzeriteDamage(event, traitBonus, ...coefficients) {
  const actualDamage = event.amount + (event.absorbed || 0);
  // In order to generalize, instead of hardcoded fields for intellect, attack power, spell coefficients
  // there's just one array that gets multiplied together to form the base damage
  const baseDamage = coefficients.reduce((total, current) => total * current, 1);
  // Get modifier from `actualDamage = (baseDamage + traitBonus) * modifier`
  const modifier = actualDamage / (baseDamage + traitBonus);
  // Scale the trait bonus by the same modifier
  return traitBonus * modifier;
}
