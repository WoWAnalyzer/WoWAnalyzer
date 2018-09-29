const raids = {
  // Battle for Azeroth
  Uldir: require('./uldir').default, // 22
  // Legion
  AntorusTheBurningThrone: require('./antorustheburningthrone').default, // 21
  TombOfSargeras: require('./tombofsargeras').default, // 20
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
