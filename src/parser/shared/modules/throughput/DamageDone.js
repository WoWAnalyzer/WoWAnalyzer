import React from 'react';
import { XYPlot, AreaSeries } from 'react-vis';
import { AutoSizer } from 'react-virtualized';
import 'react-vis/dist/style.css';

import { formatThousands, formatPercentage } from 'common/format';
import rankingColor from 'common/getRankingColor';
import groupDataForChart from 'common/groupDataForChart';
import makeWclUrl from 'common/makeWclUrl';
import StatisticBar from 'interface/statistics/StatisticBar';
import ThroughputPerformance, { UNAVAILABLE } from 'interface/report/Results/ThroughputPerformance';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer from 'parser/core/Analyzer';
import { TooltipElement } from 'common/Tooltip';

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

    const groupedData = groupDataForChart(this.bySecond, this.owner.fightDuration);
    const perSecond = this.total.effective / this.owner.fightDuration * 1000;
    const wclUrl = makeWclUrl(this.owner.report.code, {
      fight: this.owner.fightId,
      source: this.owner.playerId,
      type: 'damage-done',
    });

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(1)}
        ultrawide
        style={{ marginBottom: 20, overflow: 'hidden' }} // since this is in a group, reducing margin should be fine
      >
        <div className="flex">
          <div className="flex-sub icon">
            <img
              src="/img/sword.png"
              alt="Healing"
            />
          </div>
          <TooltipElement
            className="flex-sub value"
            tagName="div"
            style={{ width: 190 }}
            content={<>Total damage done: <strong>{formatThousands(this.total.effective)}</strong></>}
          >
            {formatThousands(perSecond)} DPS
          </TooltipElement>
          <div className="flex-sub" style={{ width: 110, textAlign: 'center' }}>
            <ThroughputPerformance throughput={perSecond} metric="dps">
              {({ performance, topThroughput }) => performance && performance !== UNAVAILABLE && (
                <TooltipElement
                  className={rankingColor(performance)}
                  content={<>Your DPS compared to the DPS of a top 100 player. To become a top 100 <span className={this.selectedCombatant.spec.className.replace(' ', '')}>{this.selectedCombatant.spec.specName} {this.selectedCombatant.spec.className}</span> on this fight you need to do at least <strong>{formatThousands(topThroughput)} DPS</strong>.</>}
                  style={{ cursor: 'help' }}
                  tagName="div"
                >
                  {formatPercentage(performance, 0)}%
                </TooltipElement>
              )}
            </ThroughputPerformance>
          </div>
          <div className="flex-main chart">
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

export default DamageDone;
