/**
 * Calculates the trait contribution to the real damage from event.
 * @param {object} event Damage event itself
 * @param {number[]} traitBonuses Array of additive bonuses to base damage from traits
 * @param {...number} coefficients Coefficients that form the base damage (most likely SP coefficient, current intellect, current attack power etc.)
 * @returns {number[]} Bonus damage contributed by the trait/s
 */
export default function calculateBonusAzeriteDamage(event, traitBonuses, ...coefficients) {
  const actualDamage = event.amount + (event.absorbed || 0);
  // In order to generalize, instead of hardcoded fields for intellect, attack power, spell coefficients
  // there's just one array that gets multiplied together to form the base damage
  const baseDamage = coefficients.reduce((total, current) => total * current, 1) + traitBonuses.reduce((total, current) => total + current, 0);
  // Get modifier from `actualDamage = baseDamage * modifier` (where baseDamage already has the additive bonuses added)
  const modifier = actualDamage / baseDamage;
  // Scale the trait bonus/es by the same modifier
  return traitBonuses.map(bonus => bonus * modifier);
}
