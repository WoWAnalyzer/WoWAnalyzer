const raids = {
  // Legion
  AntorusTheBurningThrone: require('./AntorusTheBurningThrone').default, // 21
  TombOfSargeras: require('./TombOfSargeras').default, // 20
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
