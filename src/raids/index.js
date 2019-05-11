const raids = {
  // Battle for Azeroth
  Dungeons: require('./dungeons').default,
  Uldir: require('./uldir').default, // tier 23
  BattleOfDazaralor: require('./battleofdazaralor').default, // tier 24
  CrucibleOfStorms: require('./crucibleofstorms').default, //tier 24.5
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
