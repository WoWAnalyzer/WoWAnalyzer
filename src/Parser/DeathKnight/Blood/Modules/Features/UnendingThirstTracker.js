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

  bloodShieldRefreshed = 0;
  totalDSCounter = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_STRIKE.id) {
      return;
    }
    this.totalDSCounter += 1;
  }

  //Death Strike causes the buff blood shield. If blood shield is refreshed it means death strike was casted when the blood shield buff was active.
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLOOD_SHIELD.id) {
      this.bloodShieldRefreshed += 1;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UNENDING_THIRST.id} />}
        value={`${this.bloodShieldRefreshed} out of ${this.totalDSCounter}`}
        label="Empowered Death Strikes"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default UnendingThirstTracker;
