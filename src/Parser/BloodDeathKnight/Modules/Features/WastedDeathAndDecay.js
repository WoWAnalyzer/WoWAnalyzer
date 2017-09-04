import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class WastedDeathAndDecay  extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  CrimsonScourgeProcsCounter = 0;
  CrimsonScourgeWastedCounter = 0;
  FreeDeathAndDecayCounter = 0;
  DeathAndDecayCounter = 0;
  WastedDeathAndDecays = 0;

  on_initialized() {
    }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_AND_DECAY.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.CRIMSON_SCOURGE.id, event.timestamp)) {
    this.FreeDeathAndDecayCounter++;
    }
  else {
    this.DeathAndDecayCounter++;
    }
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CRIMSON_SCOURGE.id) {
      this.CrimsonScourgeProcsCounter++;
    }
  }



  statistic() {
    this.WastedDeathAndDecays=this.CrimsonScourgeProcsCounter - this.FreeDeathAndDecayCounter;
    return (
      <StatisticBox
        icon={<Icon icon="spell_shadow_deathanddecay" alt="Wasted Death and Decays" />}
        value={this.WastedDeathAndDecays}
        label='Wasted Death and Decays'
        tooltip={'You let a Crimson Scorge Proc expire without casting Death and Decay.'}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default WastedDeathAndDecay;
