import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class BuffedHOTP extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  BuffedHOTP = 0;
  NonBuffedHOTP = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.CONSECRATION_BUFF.id, event.timestamp)) {
      this.BuffedHOTP += 1;
    } else {
      this.NonBuffedHOTP += 1;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id} />}
        value={`${this.BuffedHOTP} out of ${(this.BuffedHOTP + this.NonBuffedHOTP)}`}
        label="Buffed Hand Of the Protector"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default BuffedHOTP;
