import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { ELEMENTAL_BLAST_IDS } from '../../constants';
import Events from 'parser/core/Events';

class ElementalBlast extends Analyzer {
  currentBuffAmount=0;
  lastFreshApply=0;
  resultDuration=0;


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER), this.onRemoveBuff);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplyBuff);
  }

  onRemoveBuff(event) {
    if (ELEMENTAL_BLAST_IDS.includes(event.ability.guid)){
      this.currentBuffAmount -= 1;
      if (this.currentBuffAmount===0) {
        this.resultDuration += event.timestamp - this.lastFreshApply;
      }
    }
  }

  onApplyBuff(event) {
    if (ELEMENTAL_BLAST_IDS.includes(event.ability.guid)){
      if (this.currentBuffAmount===0) {
        this.lastFreshApply = event.timestamp;
      }
      this.currentBuffAmount += 1;
    }
  }

  get hasteUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) / this.owner.fightDuration;
  }

  get critUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) / this.owner.fightDuration;
  }

  get masteryUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) / this.owner.fightDuration;
  }

  get elementalBlastUptime() {
    return this.resultDuration/this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ELEMENTAL_BLAST_TALENT.id} />}
        value={`${formatPercentage(this.elementalBlastUptime)} %`}
        label="Uptime"
        tooltip={(
          <>
            <span className="stat-mastery">
              <strong>{formatPercentage(this.masteryUptime)}% Mastery</strong>
            </span><br />
            <span className="stat-criticalstrike">
              <strong>{formatPercentage(this.critUptime)}% Crit</strong>
            </span><br />
            <span className="stat-haste">
              <strong>{formatPercentage(this.hasteUptime)}% Haste</strong>
            </span>
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ElementalBlast;
