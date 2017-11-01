import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class WastedRimeProcs extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  rimeprocsCounter = 0;
  rimedHBCounter = 0;
  hardHBCounter = 0;
  WastedRimeProcs = 0;

  on_initialized() {
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOWLING_BLAST.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.RIME.id, event.timestamp)) {
      this.rimedHBCounter += 1;
    } else {
      this.hardHBCounter += 1;
    }
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RIME.id) {
      this.rimeprocsCounter += 1;
    }
  }


  statistic() {
    this.WastedRimeProcs = this.rimeprocsCounter - this.rimedHBCounter;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={this.WastedRimeProcs}
        label='Wasted Rime Procs'
        tooltip='You a rime proc go to waste'

      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default WastedRimeProcs;
