// TODO where should this function go? It still needs to be around for legacy reasons...
export function calculateMaxCasts(cooldown, fightDuration, charges = 1) {
  return (fightDuration / 1000 / cooldown) + charges - 1;
}
