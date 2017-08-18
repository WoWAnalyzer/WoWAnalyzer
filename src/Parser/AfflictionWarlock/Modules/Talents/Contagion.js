import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const debug = true;

const UAspellIds = [SPELLS.UNSTABLE_AFFLICTION_DEBUFF_1.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_2.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_3.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_4.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_5.id,
];

const CONTAGION_DAMAGE_BONUS = .15;

class Contagion extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  totalBonusDmg = 0;

  on_initialized() {
    if(!this.owner.error){
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.CONTAGION_TALENT.id);
    }
  }

  on_byPlayer_damage(event) {
    const target = this.enemies.getEntity(event);
    if(!target)
      return;
    const hasUA = UAspellIds.some(x => target.hasBuff(x, event.timestamp));
    if(!hasUA)
      return;

    this.totalBonusDmg += getDamageBonus(event, CONTAGION_DAMAGE_BONUS);
  }
  on_finished() {
    if(debug) {
      console.log('Bonus damage: ', this.totalBonusDmg);
    }
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CONTAGION_TALENT.id} />}
        value={`${formatNumber(this.totalBonusDmg)}`}
        label={'Damage contributed'}
        tooltip={`Your Contagion talent contributed ${formatNumber(this.totalBonusDmg)} total damage (${this.owner.formatItemDamageDone(this.totalBonusDmg)}).`}
      />
    );
  }
}

export default Contagion;
