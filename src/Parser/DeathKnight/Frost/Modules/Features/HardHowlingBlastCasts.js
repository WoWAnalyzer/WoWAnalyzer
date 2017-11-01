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

  rimeprocsCounter = 0;
  rimedHBCounter = 0;
  hardHBCounter = 0;
  HardHowlingBlastCasts = 0;
  nonrimedHBCounter = 0;

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
    this.nonrimedHBCounter = this.hardHBCounter;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={this.nonrimedHBCounter}
        label='Howling Blasts without Rime proc'
        tooltip='You should aim to get this at 0.'

      />

    );
 this.nonrimedHBCounter = this.hardHBCounter - this.rimedHBCounter;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOWLING_BLAST.id} />}
        value={this.nonrimedHBCounter}
        label='hard casted Howling Blast'
        tooltip='You casted a Holwing Blast without a Rime proc.'

      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HardHowlingBlastCasts;
