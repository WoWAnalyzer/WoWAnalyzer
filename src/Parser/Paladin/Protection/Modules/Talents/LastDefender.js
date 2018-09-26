import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import {formatNumber} from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox from 'Interface/Others/StatisticBox';


class LastDefender extends Analyzer{
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LAST_DEFENDER_TALENT.id);
  }

  get damageAbsorbed(){
    return this.abilityTracker.getAbility(SPELLS.LAST_DEFENDER_TALENT.id).healingEffective +
           this.abilityTracker.getAbility(SPELLS.LAST_DEFENDER_TALENT.id).healingAbsorbed;
  }

  get damageAbsorbedPS(){
    return this.damageAbsorbed/this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <StatisticBox
        label="Damage Prevented"
        icon={<SpellIcon id={SPELLS.LAST_DEFENDER_TALENT.id} />}
        value={`${formatNumber(this.damageAbsorbed)} Damage`}
        tooltip={`${formatNumber(this.damageAbsorbedPS)} Damage Per Second`}
      />
    );
  }
}

export default LastDefender;
