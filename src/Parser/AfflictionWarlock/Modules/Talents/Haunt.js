import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const HAUNT_DAMAGE_BONUS = .15;

class Haunt extends Module {
  //TODO: test on dummy or in raid on some boss, there are no logs with this talent to test, should work though
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.HAUNT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasHaunt = target.hasBuff(SPELLS.HAUNT.id, event.timestamp);
    if (!hasHaunt) {
      return;
    }

    this.bonusDmg += getDamageBonus(event, HAUNT_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAUNT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label='Damage contributed'
        tooltip={`Your Haunt talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default Haunt;
