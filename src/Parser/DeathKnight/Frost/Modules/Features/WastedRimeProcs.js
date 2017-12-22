import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class WastedRimeProcs extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  rimeProcs = 0;
  castsWithRime = 0;
  castsWithoutRime = 0;
  wastedRimeProcs = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOWLING_BLAST.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.RIME.id, event.timestamp)) {
      this.castsWithRime += 1;
    } else {
      this.castsWithoutRime += 1;
    }
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RIME.id) {
      this.rimeProcs += 1;
    }
  }

  statistic() {
    this.wastedRimeProcs = this.rimeProcs - this.castsWithRime;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={this.wastedRimeProcs}
        label="Wasted Rime Procs"
        tooltip="You let a rime proc go to waste."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default WastedRimeProcs;
