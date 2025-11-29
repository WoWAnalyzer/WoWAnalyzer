import fetchWcl from 'common/fetchWclApi';
import { useEffect, useState } from 'react';

import RaidHealthChart from './RaidHealthChart';
import { WCLBossResources } from 'common/WCL_TYPES';

const CLASS_CHART_LINE_COLORS = {
  DeathKnight: 'rgba(196, 31, 59, 0.6)',
  Druid: 'rgba(255, 125, 10, 0.6)',
  Evoker: 'rgba(51, 147, 127, 0.6)',
  Hunter: 'rgba(171, 212, 115, 0.6)',
  Mage: 'rgba(105, 204, 240, 0.6)',
  Monk: 'rgba(0, 255, 152, 0.6)',
  Paladin: 'rgba(245, 140, 186, 0.6)',
  Priest: 'rgba(255, 255, 255, 0.6)',
  Rogue: 'rgba(255, 245, 105, 0.6)',
  Shaman: 'rgba(36, 89, 255, 0.6)',
  Warlock: 'rgba(148, 130, 201, 0.6)',
  Warrior: 'rgba(199, 156, 110, 0.6)',
  DemonHunter: 'rgba(163, 48, 201, 0.6)',
};

interface Props {
  reportCode: string;
  start: number;
  end: number;
  offset: number;
}

const Graph = ({ reportCode, start, end, offset }: Props) => {
  const [data, setData] = useState<WCLBossResources | null>(null);

  useEffect(() => {
    const load = () => {
      fetchWcl<WCLBossResources>(`report/graph/resources/${reportCode}`, {
        start,
        end,
        abilityid: 1000,
      }).then((json) => {
        console.log('Received player health', json);
        setData(json);
      });
    };
    load();
  }, [reportCode, start, end]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const players = data.series.filter((item) =>
    Boolean(CLASS_CHART_LINE_COLORS[item.type as keyof typeof CLASS_CHART_LINE_COLORS]),
  );

  const entities = players.map((series) => {
    const newSeries = {
      ...series,
      lastValue: 100, // fights start at full hp
      data: {} as Record<number, number>,
    };

    series.data.forEach((item) => {
      const secIntoFight = Math.floor((item[0] - start) / 1000);

      const health = item[1];
      newSeries.data[secIntoFight] = Math.min(100, health);
    });

    return newSeries;
  });

  const deathsBySecond: Record<number, boolean | undefined> = {};
  if (data.deaths) {
    data.deaths.forEach((death) => {
      const secIntoFight = Math.floor((death.timestamp - start) / 1000);

      if (death.targetIsFriendly) {
        deathsBySecond[secIntoFight] = true;
      }
    });
  }

  const fightDurationSec = Math.ceil((end - start) / 1000);
  for (let i = 0; i <= fightDurationSec; i += 1) {
    entities.forEach((series) => {
      series.data[i] = series.data[i] !== undefined ? series.data[i] : series.lastValue;
      series.lastValue = series.data[i];
    });
    deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
  }

  // transform data into react-vis format
  const playerHealth = entities.map((player) => {
    const data = Object.entries(player.data).map(([key, value]) => ({
      x: Number(key),
      y: value,
    }));
    return {
      title: player.name,
      backgroundColor: CLASS_CHART_LINE_COLORS[player.type as keyof typeof CLASS_CHART_LINE_COLORS],
      borderColor: CLASS_CHART_LINE_COLORS[player.type as keyof typeof CLASS_CHART_LINE_COLORS],
      data,
    };
  });

  const deaths = Object.entries(deathsBySecond)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => ({ x: Number(key) }));

  return (
    <div className="graph-container">
      <RaidHealthChart
        players={playerHealth}
        deaths={deaths}
        startTime={start}
        endTime={end}
        offsetTime={offset}
      />
    </div>
  );
};

export default Graph;
