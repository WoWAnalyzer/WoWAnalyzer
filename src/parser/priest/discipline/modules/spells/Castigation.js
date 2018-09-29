import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import isAtonement from '../core/isAtonement';
import Penance from './/Penance';

class Castigation extends Analyzer {
  static dependencies = {
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
  };

  healing = 0;
  damage = 0;

  _isCastigationBolt = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CASTIGATION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PENANCE.id || event.penanceBoltNumber !== 3) {
      this._isCastigationBolt = false;
      return;
    }

    this._isCastigationBolt = true;
    this.damage += event.amount;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // Friendly Penance Healing
    if (spellId === SPELLS.PENANCE_HEAL.id) {
      if (event.penanceBoltNumber === 3) {
        this.healing += event.amount;
      }
    }

    // Offensive Penance Healing
    if (isAtonement(event)) {
      if (this._isCastigationBolt) {
        this.healing += event.amount;
      }
    }
  }

  statistic() {
    const healing = this.healing || 0;
    const damage = this.damage || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CASTIGATION_TALENT.id} />}
        value={`${formatNumber(healing / this.owner.fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The effective healing contributed by Castigation (${formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))}% of total healing done). Castigation also contributed ${formatNumber(damage / this.owner.fightDuration * 1000)} DPS (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))}% of total damage done), the healing gain of this damage was included in the shown numbers.`}>
            Castigation healing
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Castigation;
