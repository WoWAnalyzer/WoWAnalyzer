import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

const damagingCasts = [SPELLS.EYE_OF_THE_STORM.id, SPELLS.WIND_GUST.id, SPELLS.CALL_LIGHTNING.id];
const CALL_LIGHTNING__BUFF_DURATION = 15000;

class PrimalStormElemental extends Analyzer {
  eotsCasts = 0;
  pseCasts = 0;
  lastCLCastTimestamp = 0;


  damageGained = 0;
  maelstromGained = 0;
  badCasts=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRIMAL_ELEMENTALIST_TALENT.id)
      && this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.STORM_ELEMENTAL_TALENT.id){
      return;
    }
    this.pseCasts++;
  }

  on_cast(event) {
    if (!damagingCasts.includes(event.ability.guid)) {
      return;
    }
    this.damageGained+=event.amount;

    if(this.lastCLCastTimestamp!==0 || event.ability.guid !== SPELLS.CALL_LIGHTNING.id) {
      if(event.timestamp>this.lastCLCastTimestamp+CALL_LIGHTNING__BUFF_DURATION){
        this.badCasts++;
      }
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STORM_ELEMENTAL_TALENT.id} />}
        value={`~ ${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Buffed casts contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default PrimalStormElemental;
