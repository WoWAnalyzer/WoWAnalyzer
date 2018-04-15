import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class EarthShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.EARTH_SHIELD_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.EARTH_SHIELD_HEAL.id) {
      return;
    }

    this.healing += event.amount;
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.EARTH_SHIELD_HEAL.id);
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))} %
        </div>
      </div>
    );
  }

}

export default EarthShield;

