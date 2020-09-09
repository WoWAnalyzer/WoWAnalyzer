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

// This essence frequently bugs out in-game and gives you rank 1 stat values instead of your actual rank and can swap around in ranks mid encounter
class TheFormlessVoid extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  primaryStatBuff = 0;
  hasteBuff = 0;
  rank = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.THE_FORMLESS_VOID.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.THE_FORMLESS_VOID.traitId);
    this.rank = this.selectedCombatant.essenceRank(SPELLS.THE_FORMLESS_VOID.traitId);

    if (this.rank < 2) {
      this.primaryStatBuff = calculatePrimaryStat(440, 300, this.selectedCombatant.neck.itemLevel);
    } else {
      this.primaryStatBuff = calculatePrimaryStat(440, 375, this.selectedCombatant.neck.itemLevel);
    }
    if (this.rank >= 3) {
      this.hasteBuff = calculatePrimaryStat(440, 68, this.selectedCombatant.neck.itemLevel);
    }

    this.statTracker.add(SPELLS.SYMBIOTIC_PRESENCE_BUFF.id, {
      intellect: this.primaryStatBuff,
      haste: this.hasteBuff,
    });
  }

  get minorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SYMBIOTIC_PRESENCE_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic flexible>
        <div className="pad">
          <label><SpellLink id={SPELLS.THE_FORMLESS_VOID.id} /> <small>Minor Rank {this.rank}</small></label>
          <div className="value">
            <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.minorBuffUptime * this.primaryStatBuff)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
            {this.rank >= 3 && (<><HasteIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.minorBuffUptime * this.hasteBuff)} <small>average Haste gained</small><br /></>)}
          </div>
        </div>
      </ItemStatistic>
    );
  }
}

export default TheFormlessVoid;
