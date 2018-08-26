import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

const damagingCasts = [SPELLS.METEOR.id, SPELLS.IMMOLATE.id, SPELLS.FIREBLAST.id];

class PrimalFireElemental extends Analyzer {
  meteorCasts = 0;
  PFEcasts = 0;


  damageGained = 0;
  maelstromGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRIMAL_ELEMENTALIST_TALENT.id)
      && (!this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id));
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.FIRE_ELEMENTAL.id){
      return;
    }

    this.PFEcasts++;
  }

  on_cast(event) {
    if (!damagingCasts.includes(event.ability.guid)) {
      return;
    }
    this.damageGained+=event.amount;

    if(event.ability.guid !== SPELLS.METEOR.id) {
      return;
    }
    this.meteorCasts++;
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.FIRE_ELEMENTAL.id){
      return;
    }

    this.maelstromGained+=event.amount;
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
        icon={<SpellIcon id={SPELLS.FIRE_ELEMENTAL.id} />}
        value={`~ ${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Buffed casts contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default PrimalFireElemental;
