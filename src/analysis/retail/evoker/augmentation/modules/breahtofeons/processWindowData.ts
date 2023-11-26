import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { formatDuration } from 'common/format';
import CombatLogParser from '../../CombatLogParser';
import { BREATH_OF_EONS_MULTIPLIER } from '../../constants';
import { DamageSources, DamageTable, DamageWindow } from './BreathOfEonsHelper';
import sortDamageSources from './sortDamageSources';
import getDamage from './getDamage';

type Params = {
  windows: BreathOfEonsWindows[];
  fightStartTime: number;
  owner: CombatLogParser;
  index: number;
  damageTables: DamageTable[];
  pets: number[];
  petToPlayerMap: Map<number, number>;
};

const debug = false;

function processWindowData({
  index,
  damageTables,
  windows,
  pets,
  petToPlayerMap,
  owner,
  fightStartTime,
}: Params) {
  const table = damageTables[index];

  const windowData: BreathOfEonsWindows = windows[index];

  const damageWindows: DamageWindow[] = [];
  const damageWindowsOptimalTargets: DamageWindow[] = [];
  const sourceInRange: DamageSources[] = [];

  const breathStart = windowData.start;
  const breathEnd = windowData.end;

  const { damageInRange, earlyDeadMobsDamage, lostDamage } = getDamage({
    owner,
    breathStart,
    breathEnd,
    table,
    windowData,
    pets,
    petToPlayerMap,
    sourceInRange,
    damageWindows,
    damageWindowsOptimalTargets,
    fightStartTime,
  });

  const sortedSourceInRange: DamageSources[] = sortDamageSources(sourceInRange, owner);

  const sortedWindows = damageWindows.sort((a, b) => b.sum - a.sum);
  const topWindow = sortedWindows[0];

  const sortedWindowsOptimalTargets = damageWindowsOptimalTargets.sort((a, b) => b.sum - a.sum);
  const topWindowOptimalTarget = sortedWindowsOptimalTargets[0];

  /** If the damage difference between what we found and what actually happened is greater than 10%
   * we display the actual amount - this only seems to happen when a target becomes immune before
   * Breath explodes, resulting in an overvaluation. e.g. Neltharion */
  const damageDifference =
    ((damageInRange - earlyDeadMobsDamage) * BREATH_OF_EONS_MULTIPLIER) /
    windows[index].breathPerformance.damage;
  const damageToDisplay =
    damageDifference > 1.1 || damageDifference < 0.9
      ? windows[index].breathPerformance.damage
      : (damageInRange - earlyDeadMobsDamage) * BREATH_OF_EONS_MULTIPLIER;

  if (debug) {
    console.log(index + 1 + '. ', 'Top Window:', topWindow);
    console.log(index + 1 + '. ', 'Top Window optimal:', topWindowOptimalTarget);
    console.log(
      index + 1 + '.',
      'Damage within current window:',
      damageInRange,
      'Expected sum:',
      windows[index].breathPerformance.damage * 10,
      ' difference:',
      windows[index].breathPerformance.damage * 10 - damageInRange,
      'start:',
      formatDuration(breathStart - fightStartTime),
      breathStart,
      'end:',
      formatDuration(breathEnd - fightStartTime),
      breathEnd,
    );
    console.log(
      index + 1 + '.',
      'source:',
      sourceInRange.sort((a, b) => b.damage - a.damage),
    );
    console.log(index + 1 + '.', 'sorted source:', sortedSourceInRange);
    console.log(index + 1 + '.', 'damage lost to ebon drop:', lostDamage);
    console.log(index + 1 + '.', 'damage lost to early mob deaths:', earlyDeadMobsDamage);
  }

  return {
    damageInRange,
    lostDamage,
    earlyDeadMobsDamage,
    breathStart,
    breathEnd,
    damageToDisplay,
    topWindow,
    topWindowOptimalTarget,
    sourceInRange: sortedSourceInRange,
  };
}

export default processWindowData;
