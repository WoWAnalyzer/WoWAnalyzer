import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class WastedDeathAndDecay extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  CrimsonScourgeProcsCounter = 0;
  FreeDeathAndDecayCounter = 0;
  DeathAndDecayCounter = 0;
  WastedDeathAndDecays = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_AND_DECAY.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.CRIMSON_SCOURGE.id, event.timestamp)) {
      this.FreeDeathAndDecayCounter += 1;
    } else {
      this.DeathAndDecayCounter += 1;
    }
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CRIMSON_SCOURGE.id) {
      this.CrimsonScourgeProcsCounter += 1;
    }
  }

  statistic() {
    this.WastedDeathAndDecays = this.CrimsonScourgeProcsCounter - this.FreeDeathAndDecayCounter;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CRIMSON_SCOURGE.id} />}
        value={this.WastedDeathAndDecays}
        label="Wasted Death and Decays"
        tooltip="You let a Crimson Scourge proc expire without casting Death and Decay."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default WastedDeathAndDecay;
