import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class BuffedSOTR extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  BuffedSOTR = 0;
  NonBuffedSOTR=0;

  on_initialized() {
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHIELD_OF_THE_RIGHTEOUS.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.CONSECRATION_BUFF.id, event.timestamp)) {
      this.BuffedSOTR += 1;
    }else{
      this.NonBuffedSOTR+= 1;
    }
  }


  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id} />}
        value={`${this.BuffedSOTR} out of ${(this.BuffedSOTR+this.NonBuffedSOTR)}`}
        label='Buffed Shield Of the Righteous'
        tooltip=''

      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default BuffedSOTR;
