import React from 'react';
import { XYPlot, AreaSeries } from 'react-vis';
import { AutoSizer } from 'react-virtualized';
import 'react-vis/dist/style.css';

import { formatThousands, formatPercentage } from 'common/format';
import rankingColor from 'common/getRankingColor';
import groupDataForChart from 'common/groupDataForChart';
import StatisticBar from 'interface/report/Results/statistics/StatisticBar';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer from 'parser/core/Analyzer';

import DamageValue from '../DamageValue';

class DamageDone extends Analyzer {
  _total = new DamageValue();
  get total() {
    return this._total;
  }
  _byPet = {};
  byPet(petId) {
    if (!this._byPet[petId]) {
      return new DamageValue();
    }
    return this._byPet[petId];
  }
  get totalByPets() {
    return Object.keys(this._byPet)
      .map(petId => this._byPet[petId])
      .reduce((total, damageValue) => total.add(damageValue.regular, damageValue.absorbed, damageValue.blocked, damageValue.overkill), new DamageValue());
  }

  bySecond = {};

  on_byPlayer_damage(event) {
    if (!event.targetIsFriendly) {
      this._total = this._total.add(event.amount, event.absorbed, event.blocked, event.overkill);

      const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
      this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || new DamageValue()).add(event.amount, event.absorbed, event.blocked, event.overkill);
    }
  }
  on_byPlayerPet_damage(event) {
    if (!event.targetIsFriendly) {
      this._total = this._total.add(event.amount, event.absorbed, event.blocked, event.overkill);
      const petId = event.sourceID;
      this._byPet[petId] = this.byPet(petId).add(event.amount, event.absorbed, event.blocked, event.overkill);
    }
  }

  showStatistic = true;
  subStatistic() { // rendered by ThroughputStatisticGroup
    if (!this.showStatistic) {
      return null;
    }

    const performance = 0.11;

    const groupedData = groupDataForChart(this.bySecond, this.owner.fightDuration);

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(1)}
        ultrawide
        style={{ marginBottom: 20 }} // since this is in a group, reducing margin should be fine
      >
        <div className="flex">
          <div className="flex-sub" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
            <img
              src="/img/sword.png"
              alt="Healing"
              style={{ height: '1em', verticalAlign: 'baseline' }}
            />
          </div>
          <div
            className="flex-sub"
            style={{ fontWeight: 500, width: 190, textAlign: 'center' }}
            data-tip={`Total damage done: <b>${formatThousands(this.total.effective)}</b>`}
          >
            {formatThousands(this.total.effective / this.owner.fightDuration * 1000)} DPS
          </div>
          <div className={`flex-sub ${rankingColor(performance)}`} style={{ width: 110, textAlign: 'center' }}>
            {formatPercentage(performance, 0)}%
          </div>
          <div className="flex-main" style={{ padding: 0 }}>
            <AutoSizer>
              {({ width, height }) => (
                <XYPlot
                  margin={0}
                  width={width}
                  height={height}
                >
                  <AreaSeries
                    data={Object.keys(groupedData).map(x => ({
                      x: x / width,
                      y: groupedData[x],
                    }))}
                    className="primary"
                  />
                </XYPlot>
              )}
            </AutoSizer>
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default DamageDone;
