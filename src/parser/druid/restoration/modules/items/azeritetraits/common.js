export function getPrimaryStatForItemLevel(itemLevel) {
  const SCALE = 17.3;
  return Math.floor(SCALE * (1.15**(itemLevel/15)));
}
export function findItemLevelByPrimaryStat(primaryStat) {
  // Ehm..this is the same formula in getPrimaryStatForItemLevel but itemLevel broken out. ¯\_(ツ)_/¯
  // Source: https://www.wolframalpha.com/input/?i=solve+17.3+*+(1.15+%5E+(x%2F15))+%3D+y+for+x
  return Math.floor((15 * Math.log(173/(5*primaryStat)))/(2* Math.log(2) + Math.log(5) - Math.log(23)) - (15 * Math.log(2)) / (2 * Math.log(2) + Math.log(5) - Math.log(23)));
}
