import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const REVERSE_ENTROPY_DAMAGE_BONUS = 0.1;

class ReverseEntropy extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.REVERSE_ENTROPY_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CHAOS_BOLT.id && event.ability.guid !== SPELLS.RAIN_OF_FIRE_DAMAGE.id) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, REVERSE_ENTROPY_DAMAGE_BONUS);
  }

  statistic() {
    // could show mana returned too, but that's kinda irrelevant for Warlocks anyway
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.REVERSE_ENTROPY_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`Your Reverse Entropy talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %)`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default ReverseEntropy;
