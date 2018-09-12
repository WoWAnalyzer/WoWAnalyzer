export function getPrimaryStatForItemLevel(itemLevel) {
  const SCALE = 17.3;
  return Math.floor(SCALE * (1.15**(itemLevel/15)));
}
export function findItemLevelByPrimaryStat(primaryStat) {
  // Ehm..this is the same formula in getPrimaryStatForItemLevel but itemLevel broken out. ¯\_(ツ)_/¯
  return Math.floor((15 * Math.log(173/(5*primaryStat)))/(2* Math.log(2) + Math.log(5) - Math.log(23)) - (15 * Math.log(2)) / (2 * Math.log(2) + Math.log(5) - Math.log(23)));
}
