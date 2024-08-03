/** A higher order function to generate the cooldown function for an `Ability` with a hasted cooldown.
 *  Pass to the `cooldown` field with the spell's base CD */
export const hastedCooldown = (baseCD: number) => (haste: number) => baseCD / (1 + haste);

/**
 * A function to calculate a hasted cooldown.
 * Use instead of hastedCooldown when CD must also change on other dynamic factors.
 */
export const hasted = (baseCD: number, haste: number) => baseCD / (1 + haste);

/** The most common GCD. 1500ms reduced by haste. */
export const normalGcd = { base: 1500 };

/** GCD often used by 'fast melee' like Rogues, Windwalker, Feral. Static 1000ms. */
export const fastMeleeGcd = { static: 1000 };
