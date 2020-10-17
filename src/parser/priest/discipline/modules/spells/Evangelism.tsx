import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { TooltipElement } from 'common/Tooltip';
import StatisticBox from 'interface/others/StatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { formatPercentage, formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';

import isAtonement from '../core/isAtonement';
import Atonement from './Atonement';

const EVANGELISM_DURATION = 6;

class Evangelism extends Analyzer {
  static dependencies = {
    atonementModule: Atonement,
  };

  protected atonementModule!: Atonement;

  _previousEvangelismCast: CastEvent | null = null;
  _evangelismStatistics: {
    [timestamp: number]: {
      count: number,
      atonementSeconds: number,
      healing: number,
    }
  } = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get evangelismStatistics() {
    return Object.keys(this._evangelismStatistics).map(Number).map((key: number) => this._evangelismStatistics[key]);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EVANGELISM_TALENT.id) {
      return;
    }
    this._previousEvangelismCast = event;
    const atonedPlayers = this.atonementModule.numAtonementsActive;

    this._evangelismStatistics[event.timestamp] = {
      count: atonedPlayers,
      atonementSeconds: atonedPlayers * EVANGELISM_DURATION,
      healing: 0,
    };
  }

  onHeal(event: HealEvent) {
    if (isAtonement(event)) {
      const target = this.atonementModule.currentAtonementTargets.find(id => id.target === event.targetID);
      // Pets, guardians, etc.
      if (!target) {
        return;
      }

      // Add all healing that shouldn't exist to expiration
      if (event.timestamp > target.atonementExpirationTimestamp && this._previousEvangelismCast) {
        this._evangelismStatistics[this._previousEvangelismCast.timestamp].healing += (event.amount + (event.absorbed || 0));
      }
    }
  }

  statistic() {
    const evangelismStatistics = this.evangelismStatistics;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EVANGELISM_TALENT.id} />}
        value={`${formatNumber(evangelismStatistics.reduce((total, c) => total + c.healing, 0) / this.owner.fightDuration * 1000)} HPS`}
        label={(
          <TooltipElement content={`Evangelism accounted for approximately ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(evangelismStatistics.reduce((p, c) => p + c.healing, 0)))}% of your healing.`}>
            Evangelism contribution
          </TooltipElement>
        )}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th>Healing</th>
              <th>Duration</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {
              this.evangelismStatistics
                .map((evangelism, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{formatNumber(evangelism.healing)}</td>
                    <td>{evangelism.atonementSeconds}s</td>
                    <td>{evangelism.count}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </StatisticBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default Evangelism;
