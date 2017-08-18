import React from 'react';

import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import {UNSTABLE_AFFLICTION_DEBUFF_IDS} from '../../Constants';
import getDamageBonus from '../WarlockCore/getDamageBonus';

const abilitiesAffected = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.PHANTOM_SINGULARITY.id,
  SPELLS.SEED_OF_CORRUPTION_EXPLOSION.id,
  SPELLS.DRAIN_SOUL.id,
  ...UNSTABLE_AFFLICTION_DEBUFF_IDS,
];

//based on the fact that it's a linear increase in damage that is +0% damage at 35% HP and +50% damage at 0% HP
const SLOPE_OF_DAMAGE_INCREASE = -50/35;

class DeathsEmbrace extends Module {
  totalBonusDmg = 0;

  getDeathEmbraceBonus(percentage) {
    //damageIncrease = (-50/35) * current_target_HP_percentage + 0.5
    //gives 0 for percentage = 0.35 and 0.5 for percentage = 0
    return SLOPE_OF_DAMAGE_INCREASE * percentage + 0.5;
  }

  on_initialized() {
    if(!this.owner.error){
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.DEATHS_EMBRACE_TALENT.id) || this.owner.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
    }
  }

  on_byPlayer_damage(event) {
    const hpPercentage = event.hitPoints / event.maxHitPoints;
    if(hpPercentage > 0.35)
      return; //talent doesn't even do anything till 35%

    const spellId = event.ability.guid;
    if(abilitiesAffected.indexOf(spellId) === -1)
      return;
    this.totalBonusDmg += getDamageBonus(event, this.getDeathEmbraceBonus(hpPercentage));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEATHS_EMBRACE_TALENT.id} />}
        value={`${formatNumber(this.totalBonusDmg)}`}
        label='Damage contributed'
        tooltip={`Your Death's Embrace talent contributed ${formatNumber(this.totalBonusDmg)} total damage (${this.owner.formatItemDamageDone(this.totalBonusDmg)}).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default DeathsEmbrace;
