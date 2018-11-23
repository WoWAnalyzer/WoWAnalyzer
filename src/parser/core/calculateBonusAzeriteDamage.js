/**
 * Calculates the trait contribution to the real damage from event.
 * @param {object} event Damage event itself
 * @param {number} traitBonus Bonus to base damage from traits
 * @param {...number} coefficients Coefficients that form the base damage (most likely SP coefficient, current intellect, current attack power etc.)
 * @returns {number} Bonus damage contributed by the trait
 */
export default function calculateBonusAzeriteDamage(event, traitBonus, ...coefficients) {
  // In order to be general and not weird to pass attack power into "intellect" field, it's in the coefficients array (which all get multiplied together to form the base damage)
  const baseDamage = coefficients.reduce((total, current) => total * current, 1);
  // gets what percentage trait bonus is in the modified base damage
  const traitPortion = traitBonus / (baseDamage + traitBonus);
  const actualDamage = event.amount + (event.absorbed || 0);
  // scales down the actual damage according to the percentage
  return actualDamage * traitPortion;
}
