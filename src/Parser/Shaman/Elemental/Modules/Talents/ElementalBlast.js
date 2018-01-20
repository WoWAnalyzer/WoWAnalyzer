import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import { ELEMENTAL_BLAST_IDS } from '../../Constants';

class ElementalBlast extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  currentBuffAmount=0;
  lastFreshApply=0;
  resultDuration=0;


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);
  }

  on_toPlayer_removebuff(event) {
    if (ELEMENTAL_BLAST_IDS.includes(event.ability.guid)){
      this.currentBuffAmount--;
      if (this.currentBuffAmount===0) {
        this.resultDuration += event.timestamp - this.lastFreshApply;
      }
    }
  }

  on_toPlayer_applybuff(event) {
    if (ELEMENTAL_BLAST_IDS.includes(event.ability.guid)){
      if (this.currentBuffAmount===0) {
        this.lastFreshApply = event.timestamp;
      }
      this.currentBuffAmount++;
    }
  }

  get hasteUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) / this.owner.fightDuration;
  }

  get critUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) / this.owner.fightDuration;
  }

  get masteryUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) / this.owner.fightDuration;
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
        tooltip={`
          <b class="stat-mastery">${formatPercentage(this.masteryUptime)}% Mastery</b><br/>
          <b class="stat-criticalstrike">${formatPercentage(this.critUptime)}% Crit</b><br/>
          <b class="stat-haste">${formatPercentage(this.hasteUptime)}% Haste</b>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ElementalBlast;
