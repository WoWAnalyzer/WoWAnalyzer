import { DamageSources, DamageTable, DamageWindow } from './BreathOfEonsHelper';
import { BreathOfEonsWindows } from './BreathOfEonsRotational';
import { DamageEvent } from 'parser/core/Events';
import CombatLogParser from '../../CombatLogParser';
import sortDamageSources from './sortDamageSources';
import { formatDuration } from 'common/format';

type Params = {
  owner: CombatLogParser;
  breathStart: number;
  breathEnd: number;
  table: DamageTable;
  windowData: BreathOfEonsWindows;
  pets: number[];
  petToPlayerMap: Map<number, number>;
  sourceInRange: DamageSources[];
  damageWindows: DamageWindow[];
  damageWindowsOptimalTargets: DamageWindow[];
  fightStartTime: number;
};

const getDamage = ({
  owner,
  breathEnd,
  breathStart,
  table,
  windowData,
  petToPlayerMap,
  pets,
  sourceInRange,
  damageWindows,
  damageWindowsOptimalTargets,
  fightStartTime,
}: Params) => {
  const breathLength = breathEnd - breathStart;
  const buffedPlayers = Array.from(windowData.breathPerformance.buffedPlayers.values());
  const recentDamage: DamageEvent[] = [];

  const ebonMightDropTimestamp =
    windowData.breathPerformance.ebonMightProblems.find((problem) => problem.count === 0)
      ?.timestamp ?? 0;
  const ebonMightReappliedTimestamp =
    ebonMightDropTimestamp + windowData.breathPerformance.ebonMightDroppedDuration;

  const mobsToIgnore = [];
  for (const event of windowData.breathPerformance.earlyDeadMobs) {
    mobsToIgnore.push({
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    });
  }

  let damageInRange = 0;
  let lostDamage = 0;
  let earlyDeadMobsDamage = 0;

  for (const event of table.table) {
    recentDamage.push(event);

    /** This first part is only gathering damage from our current window
     * and from the current buffed targets - ie. baseline */
    if (event.timestamp >= breathStart && event.timestamp <= breathEnd) {
      /** These shouldn't show up but just incase */
      if (event.subtractsFromSupportedActor) {
        continue;
      }

      const sourceID =
        (pets.includes(event.sourceID ?? -1)
          ? petToPlayerMap.get(event.sourceID ?? -1)
          : event.sourceID) ?? -1;

      /** If not from buffed players or player ignore */
      if (
        sourceID === buffedPlayers.find((player) => player.id === sourceID)?.id ||
        sourceID === owner.selectedCombatant.id
      ) {
        const damageAmount = event.amount + (event.absorbed ?? 0);

        const index = sourceInRange.findIndex((sum) => sum.sourceID === sourceID);
        if (index !== -1) {
          sourceInRange[index].damage += damageAmount;
        } else {
          sourceInRange.push({ sourceID: sourceID, damage: damageAmount, lostDamage: 0 });
        }

        if (
          event.timestamp >= ebonMightDropTimestamp &&
          event.timestamp <= ebonMightReappliedTimestamp
        ) {
          lostDamage += damageAmount;
        }
        damageInRange += damageAmount;

        if (
          mobsToIgnore.some(
            (item) =>
              item.targetID === event.targetID && item.targetInstance === event.targetInstance,
          )
        ) {
          earlyDeadMobsDamage += damageAmount;
        }
      }
    }

    /** This second part is gathering damage from all possible windows
     * this collects from all actors. */
    while (
      recentDamage[recentDamage.length - 1].timestamp - recentDamage[0].timestamp >=
      breathLength
    ) {
      const eventsWithinWindow = recentDamage.filter(
        (event) =>
          event.timestamp >= recentDamage[0].timestamp &&
          event.timestamp <= recentDamage[0].timestamp + breathLength,
      );

      const sourceSums: DamageSources[] = [];

      for (const eventWithinWindow of eventsWithinWindow) {
        /** These shouldn't show up but just incase */
        if (eventWithinWindow.subtractsFromSupportedActor) {
          continue;
        }

        const sourceID =
          (pets.includes(eventWithinWindow.sourceID ?? -1)
            ? petToPlayerMap.get(eventWithinWindow.sourceID ?? -1)
            : eventWithinWindow.sourceID) ?? -1;

        const damageAmount = eventWithinWindow.amount + (eventWithinWindow.absorbed ?? 0);

        const index = sourceSums.findIndex((sum) => sum.sourceID === sourceID);
        if (index !== -1) {
          sourceSums[index].damage += damageAmount;
        } else {
          sourceSums.push({ sourceID: sourceID, damage: damageAmount, lostDamage: 0 });
        }
      }
      const sortedSourceSumsOptimalTargets: DamageSources[] = sortDamageSources(sourceSums, owner);
      const currentWindowSumOptimalTargets = sortedSourceSumsOptimalTargets.reduce(
        (a, b) => a + b.damage,
        0,
      );

      const filteredSourceSums = sourceSums.filter(
        (source) =>
          source.sourceID === buffedPlayers.find((player) => player.id === source.sourceID)?.id ||
          source.sourceID === owner.selectedCombatant.id,
      );
      const sortedSourceSums: DamageSources[] = sortDamageSources(filteredSourceSums, owner);
      const currentWindowSum = sortedSourceSums.reduce((a, b) => a + b.damage, 0);

      damageWindows.push({
        start: recentDamage[0].timestamp,
        end: recentDamage[0].timestamp + breathLength,
        sum: currentWindowSum,
        sumSources: sortedSourceSums,
        startFormat: formatDuration(recentDamage[0].timestamp - fightStartTime),
        endFormat: formatDuration(recentDamage[0].timestamp + breathLength - fightStartTime),
      });
      damageWindowsOptimalTargets.push({
        start: recentDamage[0].timestamp,
        end: recentDamage[0].timestamp + breathLength,
        sum: currentWindowSumOptimalTargets,
        sumSources: sortedSourceSumsOptimalTargets,
        startFormat: formatDuration(recentDamage[0].timestamp - fightStartTime),
        endFormat: formatDuration(recentDamage[0].timestamp + breathLength - fightStartTime),
      });

      recentDamage.shift();
    }
  }

  return {
    damageInRange,
    lostDamage,
    earlyDeadMobsDamage,
  };
};

export default getDamage;
