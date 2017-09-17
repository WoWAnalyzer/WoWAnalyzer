export default function getWipeCount(report, fight) {
  let count = 1;
  report.fights.forEach(item => {
    if (item.boss === fight.boss) {
      if (item.id < fight.id) {
        count += 1;
      }
    }
  });
  return count;
}
