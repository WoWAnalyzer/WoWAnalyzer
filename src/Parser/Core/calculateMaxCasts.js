
/*
 * Gets raw max casts of a spell over a period of time.
 * cooldown - spells cooldown in seconds
 * fightDuration - fight's duration ... in milliseconds for some reason. Look, this is legacy code ok?
 * charges (optional) - spell's number of charges.
 */
export default function calculateMaxCasts(cooldown, fightDuration, charges = 1) {
  return (fightDuration / 1000 / cooldown) + charges - 1;
}
