import fetchWcl from 'common/fetchWclApi';
import { WCLBossResources } from 'common/WCL_TYPES';
import ManaLevelGraph from 'parser/ui/ManaLevelGraph';
import ManaStyles from 'parser/ui/ManaStyles';
import { useEffect, useState } from 'react';

interface Props {
  reportCode: string;
  actorId: number;
  start: number;
  end: number;
  offsetTime: number;
  manaUpdates: {
    timestamp: number;
    current: number;
    max: number;
  }[];
}

const Mana = ({ reportCode, actorId, start, end, manaUpdates, offsetTime }: Props) => {
  const [bossHealth, setBossHealth] = useState<WCLBossResources | null>(null);

  useEffect(() => {
    const load = () => {
      fetchWcl<WCLBossResources>(`report/graph/resources/${reportCode}`, {
        start,
        end,
        sourceclass: 'Boss',
        hostility: 'Enemies',
        abilityid: 1000,
      }).then((json) => {
        setBossHealth(json);
      });
    };

    load();
  }, [reportCode, start, end]);

  if (!bossHealth) {
    return <div>Loading...</div>;
  }

  const mana = manaUpdates.map(({ timestamp, current, max }) => ({
    x: Math.max(timestamp, start) - start,
    y: (current / max) * 100,
  }));

  const deaths = bossHealth.deaths?.length
    ? bossHealth.deaths
        .filter((death) => death.targetID === actorId)
        .map(({ timestamp, killingAbility }) => ({
          x: timestamp - start,
          ability: killingAbility || 'Uknown Ability',
        }))
    : [];

  const bossData = bossHealth.series.map((series, i) => {
    const data = series.data.map(([timestamp, health]) => ({ x: timestamp - start, y: health }));

    const color = ManaStyles[`Boss-${i}` as keyof typeof ManaStyles] as {
      backgroundColor: string;
      borderColor: string;
    };

    return {
      title: `${series.name} Health`,
      borderColor: color.borderColor,
      backgroundColor: color.backgroundColor,
      data,
    };
  });

  return (
    <div>
      <br />
      <div className="graph-container">
        <ManaLevelGraph mana={mana} deaths={deaths} bossData={bossData} />
      </div>
    </div>
  );
};

export default Mana;
