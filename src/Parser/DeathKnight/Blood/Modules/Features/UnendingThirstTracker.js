import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class UnendingThirstTracker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  RecentDSCounter = 0;
  DScost=0;

  on_initialized() {
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_STRIKE.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.BLOOD_SHIELD.id, event.timestamp)) {
      this.RecentDSCounter += 1;
      this.DScost=event.classResources[0].cost;
      console.log('DScost is ', this.DScost);
    }
  }


  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UNENDING_THIRST.id} />}
        value={this.RecentDSCounter}
        label='Empowered Death Strike'
        tooltip="If you're looking to increase your dps as the cost of defense try increasing this."

      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default UnendingThirstTracker;
