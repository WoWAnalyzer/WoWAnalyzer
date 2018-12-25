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

import HealingValue from '../HealingValue';

class HealingDone extends Analyzer {
  _total = new HealingValue();
  get total() {
    return this._total;
  }
  _healingByAbsorbs = new HealingValue();
  get healingByAbsorbs() {
    return this._healingByAbsorbs;
  }

  bySecond = {};

  _byAbility = {};
  byAbility(spellId) {
    if (!this._byAbility[spellId]) {
      return new HealingValue();
    }
    return this._byAbility[spellId];
  }

  on_heal(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      this._addHealing(event, event.amount, event.absorbed, event.overheal);
    }
  }
  on_absorbed(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      this._addHealingByAbsorb(event, event.amount, 0, 0);
    }
  }
  on_removebuff(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      if (event.absorb) {
        this._addHealingByAbsorb(event, 0, 0, event.absorb);
      }
    }
  }

  _addHealing(event, amount = 0, absorbed = 0, overheal = 0) {
    this._total = this._total.add(amount, absorbed, overheal);

    const spellId = event.ability.guid;
    this._byAbility[spellId] = (this._byAbility[spellId] || new HealingValue()).add(amount, absorbed, overheal);

    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || new HealingValue()).add(amount, absorbed, overheal);
  }
  _addHealingByAbsorb(event, amount = 0, absorbed = 0, overhealing = 0) {
    this._addHealing(event, amount, absorbed, overhealing);
    this._healingByAbsorbs = this._healingByAbsorbs.add(amount, absorbed, overhealing);
  }
  _subtractHealing(event, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealing(event, -amount, -absorbed, -overheal);
  }
  _subtractHealingByAbsorb(event, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealingByAbsorb(event, -amount, -absorbed, -overheal);
  }

  showStatistic = true;
  statistic() {
    if (!this.showStatistic) {
      return null;
    }

    const performance = 0.55;

    const groupedData = groupDataForChart(this.bySecond, this.owner.fightDuration);

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(0.2)}
        wide
      >
        <div className="flex">
          <div className="flex-sub" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
            <img
              src="/img/healing.png"
              alt="Healing"
              style={{ height: '1em', verticalAlign: 'baseline' }}
            />
          </div>
          <div
            className="flex-sub"
            style={{ fontWeight: 500, width: 190, textAlign: 'center' }}
            data-tip={`Total healing done: <b>${formatThousands(this.total.effective)}</b>`}
          >
            {formatThousands(this.total.effective / this.owner.fightDuration * 1000)} HPS
          </div>
          <div className={`flex-sub ${rankingColor(performance)}`} style={{ padding: '10px 30px' }}>
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

export default HealingDone;
