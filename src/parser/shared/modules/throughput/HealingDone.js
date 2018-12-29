import React from 'react';
import { XYPlot, AreaSeries } from 'react-vis';
import { AutoSizer } from 'react-virtualized';
import 'react-vis/dist/style.css';

import { formatThousands, formatPercentage, formatNumber } from 'common/format';
import rankingColor from 'common/getRankingColor';
import groupDataForChart from 'common/groupDataForChart';
import makeWclUrl from 'common/makeWclUrl';
import StatisticBar from 'interface/statistics/StatisticBar';
import ThroughputPerformance, { UNAVAILABLE } from 'interface/report/Results/ThroughputPerformance';
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
  subStatistic() { // rendered by ThroughputStatisticGroup
    if (!this.showStatistic) {
      return null;
    }

    const groupedData = groupDataForChart(this.bySecond, this.owner.fightDuration);
    const perSecond = this.total.effective / this.owner.fightDuration * 1000;
    const wclUrl = makeWclUrl(this.owner.report.code, {
      fight: this.owner.fightId,
      source: this.owner.playerId,
      type: 'healing',
    });

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(2)}
        ultrawide
        style={{ marginBottom: 19 }} // since this is in a group, reducing margin should be fine
      >
        <div className="flex">
          <div className="flex-sub icon">
            <img
              src="/img/healing.png"
              alt="Healing"
            />
          </div>
          <div
            className="flex-sub value"
            style={{ width: 190 }}
            data-tip={`Total healing done: <b>${formatThousands(this.total.effective)}</b>`}
          >
            {formatThousands(perSecond)} HPS
          </div>
          <div className="flex-sub" style={{ width: 110, textAlign: 'center' }}>
            <ThroughputPerformance throughput={perSecond} metric="hps">
              {({ performance, topThroughput }) => performance && performance !== UNAVAILABLE && (
                <div
                  className={rankingColor(performance)}
                  data-tip={`Your HPS compared to the HPS of a top 100 player. To become a top 100 <span class="${this.selectedCombatant.spec.className.replace(' ', '')}">${this.selectedCombatant.spec.specName} ${this.selectedCombatant.spec.className}</span> on this fight you need to do at least <b>${formatThousands(topThroughput)} HPS</b>.`}
                  style={{ cursor: 'help' }}
                >
                  {formatPercentage(performance, 0)}%
                </div>
              )}
            </ThroughputPerformance>
          </div>
          <div className="flex-main chart" style={{ padding: 0 }}>
            <a href={wclUrl}>
              {perSecond > 0 && (
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
              )}
            </a>
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default HealingDone;
