import React from 'react';

import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const AC_DAMAGE_BONUS = .25;

class AbsoluteCorruption extends Module {
  bonusDmg = 0;

  on_initialized() {
    if(!this.owner.error){
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    }
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.CORRUPTION_DEBUFF.id)
      return;
    this.bonusDmg += getDamageBonus(event, AC_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ABSOLUTE_CORRUPTION_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg)}`}
        label={'Damage contributed'}
        tooltip={`Your Absolute Corruption talent contributed ${formatNumber(this.bonusDmg)} total damage (${this.owner.formatItemDamageDone(this.bonusDmg)}).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default AbsoluteCorruption;
