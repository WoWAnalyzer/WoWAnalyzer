export default function getWipeCount(fights, fight) {
  let count = 1;
  fights.forEach(item => {
    if (item.boss === fight.boss) {
      if (item.id < fight.id) {
        count += 1;
      }
    }
  });
  return count;
}
