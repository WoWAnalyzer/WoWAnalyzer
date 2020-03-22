import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import SpellLink from 'common/SpellLink';

import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import HasteIcon from 'interface/icons/Haste';
import ItemStatistic from 'interface/statistics/ItemStatistic';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

class TheFormlessVoid extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  primaryStatBuff = 0;
  hasteBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.THE_FORMLESS_VOID.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.THE_FORMLESS_VOID.traitId);
    this.primaryStatBuff = calculatePrimaryStat(440, 375, this.selectedCombatant.neck.itemLevel);
    this.hasteBuff = calculatePrimaryStat(440, 68, this.selectedCombatant.neck.itemLevel);

    this.statTracker.add(SPELLS.SYMBIOTIC_PRESENCE_BUFF.id, {
      intellect: this.primaryStatBuff,
      haste: this.hasteBuff,
    });
  }

  get minorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SYMBIOTIC_PRESENCE_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.THE_FORMLESS_VOID.traitId);
    return (
        <ItemStatistic flexible>
          <div className="pad">
            <label><SpellLink id={SPELLS.THE_FORMLESS_VOID.id} /> <small>Minor Rank {rank}</small></label>
            <div className="value">
              <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.minorBuffUptime * this.primaryStatBuff)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
              <HasteIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.minorBuffUptime * this.hasteBuff)} <small>average Haste gained</small><br />
            </div>
          </div>
        </ItemStatistic>
    );
  }
}

export default TheFormlessVoid;
