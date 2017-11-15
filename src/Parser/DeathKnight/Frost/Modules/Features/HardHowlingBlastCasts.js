import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class HardHowlingBlastCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  rimeProcs = 0;
  castsWithRime = 0;
  castsWithoutRime = 0;
  hardHowlingBlastCasts = 0;
  nonrimedHB = 0;

  on_initialized() {
  }

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
    this.nonrimedHB = this.castsWithoutRime;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={this.nonrimedHB}
        label='Howling Blasts without Rime proc'
        tooltip='You should aim to get this as close to 0 as possible.'
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HardHowlingBlastCasts;