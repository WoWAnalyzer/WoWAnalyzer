/**
 * Gets raw max casts of a spell over a period of time.
 * @param cooldown the cooldown time of the spell, in seconds
 * @param duration the duration of the time period to assess, in milliseconds
 * @param charges the number of charges the spell has
 */
export default function calculateMaxCasts(cooldown: number, duration: number, charges = 1) {
  return (duration / 1000 / cooldown) + charges - 1;
}
