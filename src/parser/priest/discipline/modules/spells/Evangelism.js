import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { formatPercentage, formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import isAtonement from '../core/isAtonement';
import Atonement from './/Atonement';

const EVANGELISM_DURATION = 6;

class Evangelism extends Analyzer {
  static dependencies = {
    atonementModule: Atonement,
  };

  _previousEvangelismCast = null;
  _evangelismStatistics = {};

  constructor(...args) {
    super(...args);
    this.active = !!this.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT.id);
  }

  get evangelismStatistics() {
    return Object.keys(this._evangelismStatistics).map(key => this._evangelismStatistics[key]);
  }

  on_byPlayer_cast(event) {
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

  on_byPlayer_heal(event) {
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
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.EVANGELISM_TALENT.id} />}
        value={`${formatNumber(evangelismStatistics.reduce((total, c) => total + c.healing, 0) / this.owner.fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`Evangelism accounted for approximately ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(evangelismStatistics.reduce((p, c) => p + c.healing, 0)))}% of your healing.`}>
            Evangelism contribution
          </dfn>
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
                    <th scope="row">{ index + 1 }</th>
                    <td>{ formatNumber(evangelism.healing) }</td>
                    <td>{ evangelism.atonementSeconds }s</td>
                    <td>{ evangelism.count}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default Evangelism;
