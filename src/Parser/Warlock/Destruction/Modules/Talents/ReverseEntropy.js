import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const REVERSE_ENTROPY_DAMAGE_BONUS = 0.1;

class ReverseEntropy extends Analyzer {
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

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.REVERSE_ENTROPY_TALENT.id}>
            <SpellIcon id={SPELLS.REVERSE_ENTROPY_TALENT.id} noLink /> Reverse Entropy Gain
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Reverse Entropy talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%)`}>
            {formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS
          </dfn>
        </div>
      </div>
    );
  }
}

export default ReverseEntropy;
