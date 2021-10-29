export function abbreviateBossNames(originalBossName: string) {
  if (!originalBossName) {
    return 'No name provided';
  }
  const splitNames = originalBossName.trim().split(' ');
  let abbreviatedBossName = '';
  for (let i = 0; i < splitNames.length; i += 1) {
    if (i < splitNames.length - 1) {
      abbreviatedBossName += splitNames[i].charAt(0) + '. ';
    } else {
      abbreviatedBossName += splitNames[i];
    }
  }
  return abbreviatedBossName;
}
