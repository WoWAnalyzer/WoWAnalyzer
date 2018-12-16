const raids = {
  // Battle for Azeroth
  Uldir: require('./uldir').default, // tier 23
  BattleOfDazaralor: require('./battleofdazaralor').default, // tier 22
  // Legion
  AntorusTheBurningThrone: require('./antorustheburningthrone').default, // tier 21
  TombOfSargeras: require('./tombofsargeras').default, // tier 20
};
export default raids;

export function findByBossId(id) {
  let boss = null;
  Object.values(raids).some(raid => {
    boss = Object.values(raid.bosses).find(boss => boss.id === id);
    return !!boss; // this breaks the loop early once we find a boss
  });
  return boss;
}
