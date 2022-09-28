/** A higher order function to generate the cooldown function for an `Ability`.
 *  Pass to the `cooldown` field with the spell's base CD */
export const hastedCooldown = (baseCD: number) => (haste: number) => baseCD / (1 + haste);
