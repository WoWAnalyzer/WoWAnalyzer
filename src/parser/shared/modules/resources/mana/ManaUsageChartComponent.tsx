import { PureComponent } from 'react';

import ManaUsageGraph from './ManaUsageGraph';

interface Props {
  start: number;
  end: number;
  offset: number;
  healingBySecond: any;
  manaUpdates: any[];
}

class HealingDoneGraph extends PureComponent<Props> {
  groupHealingBySeconds(healingBySecond: { [second: number]: any }, interval: number): any {
    return Object.keys(healingBySecond).reduce((obj: any, second: any) => {
      const healing = healingBySecond[second];

      const index = Math.floor(second / interval);

      if (obj[index]) {
        obj[index] = obj[index].add(healing.regular, healing.absorbed, healing.overheal);
      } else {
        obj[index] = healing;
      }
      return obj;
    }, {});
  }

  render() {
    const { start, end, offset, healingBySecond, manaUpdates } = this.props;

    // TODO: move this to vega-lite window transform
    // e.g. { window: [{op: 'mean', field: 'hps', as: 'hps'}], frame: [-2, 2] }
    const interval = 5;
    const healingPerFrame = this.groupHealingBySeconds(healingBySecond, interval);

    let max = 0;
    Object.keys(healingPerFrame)
      .map((k) => healingPerFrame[k])
      .forEach((healingDone) => {
        const current = healingDone.effective;
        if (current > max) {
          max = current;
        }
      });
    max /= interval;

    const manaUsagePerFrame: { [frame: number]: number } = {
      0: 0,
    };
    const manaLevelPerFrame: { [frame: number]: number | null } = {
      0: 1,
    };
    manaUpdates.forEach((item) => {
      const frame = Math.floor((item.timestamp - start) / 1000 / interval);

      manaUsagePerFrame[frame] = (manaUsagePerFrame[frame] || 0) + item.used / item.max;
      manaLevelPerFrame[frame] = item.current / item.max; // use the lowest value of the frame; likely to be more accurate
    });
    const fightDurationSec = Math.ceil((end - start) / 1000);
    const labels: number[] = [];
    for (let i = 0; i <= fightDurationSec / interval; i += 1) {
      labels.push(Math.ceil(offset / 1000) + i * interval);

      healingPerFrame[i] = healingPerFrame[i] !== undefined ? healingPerFrame[i].effective : 0;
      manaUsagePerFrame[i] = manaUsagePerFrame[i] !== undefined ? manaUsagePerFrame[i] : 0;
      manaLevelPerFrame[i] = manaLevelPerFrame[i] !== undefined ? manaLevelPerFrame[i] : null;
    }

    let lastKnown = 0;
    const mana = Object.values(manaLevelPerFrame).map((value, i) => {
      if (value !== null) {
        lastKnown = value;
      }
      return {
        x: labels[i],
        y: lastKnown * max,
      };
    });
    const healing = Object.values(healingPerFrame).map((value: any, i: number) => ({
      x: labels[i],
      y: value / interval,
    }));
    const manaUsed = Object.values(manaUsagePerFrame).map((value, i) => ({
      x: labels[i],
      y: value * max,
    }));

    return (
      <div className="graph-container" style={{ marginBottom: 20 }}>
        <ManaUsageGraph mana={mana} healing={healing} manaUsed={manaUsed} />
      </div>
    );
  }
}

export default HealingDoneGraph;
