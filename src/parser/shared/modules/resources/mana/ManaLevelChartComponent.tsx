import fetchWcl from 'common/fetchWclApi';
import { WCLBossResources } from 'common/WCL_TYPES';
import { DeathEvent } from 'parser/core/Events';
import ManaLevelGraph from 'parser/ui/ManaLevelGraph';
import { memo, useEffect, useState } from 'react';

interface Props {
  reportCode: string;
  start: number;
  end: number;
  offset: number;
  combatants: any; // oxlint-disable-line typescript-eslint/no-explicit-any -- Baseline suppression. Try to fix if you edit this code.
  manaUpdates: any[]; // oxlint-disable-line typescript-eslint/no-explicit-any -- Baseline suppression. Try to fix if you edit this code.
  height?: number;
}

const ManaLevelChartComponent = ({
  reportCode,
  start,
  end,
  offset,
  combatants,
  manaUpdates,
  height,
}: Props) => {
  const [bossHealth, setBossHealth] = useState<WCLBossResources | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWcl(`report/graph/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 'Enemies',
      abilityid: 1000,
    }).then((json) => {
      if (!cancelled) {
        setBossHealth(json as WCLBossResources);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reportCode, start, end]);

  if (!bossHealth) {
    return <div>Loading...</div>;
  }

  const initial = manaUpdates[0] ? manaUpdates[0].current / manaUpdates[0].max : 1; // if first event is defined, use it to copy first value, otherwise use 100%
  const mana =
    offset === 0
      ? [{ x: 0, y: 100 }]
      : [
          {
            x: 0,
            y: 100 * initial,
          },
        ]; // start with full mana if we start at the beginning of the fight, otherwise copy first value
  mana.push(
    ...manaUpdates.map(({ timestamp, current, max }) => {
      const x = Math.max(timestamp, start) - start;
      return {
        x,
        y: (current / max) * 100,
      };
    }),
  );

  const bossData = bossHealth.series.map((series) => {
    const data = series.data.map(([timestamp, health]) => ({ x: timestamp - start, y: health }));

    return {
      id: series.id,
      title: `${series.name} Health`,
      data,
    };
  });

  let deaths: { x: number; name: string; ability: string }[] = [];
  if (bossHealth.deaths) {
    deaths = bossHealth.deaths
      .filter((death: DeathEvent) => Boolean(death.targetIsFriendly))
      .map(({ timestamp, targetID, killingAbility }: DeathEvent) => ({
        x: timestamp - start,
        name: combatants.players[targetID] ? combatants.players[targetID].name : 'Unknown Player',
        ability: killingAbility ? killingAbility.name : 'Unknown Ability',
      }));
  }

  return (
    <div className="graph-container">
      <ManaLevelGraph mana={mana} bossData={bossData} deaths={deaths} height={height} />
    </div>
  );
};

export default memo(ManaLevelChartComponent);
