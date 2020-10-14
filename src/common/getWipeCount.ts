import Fight from "parser/core/Fight";

export default function getWipeCount(fights: Fight[], fight: Fight): number {
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
