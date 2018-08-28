import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class HardHowlingBlastCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  castsWithoutRime = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOWLING_BLAST.id) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.RIME.id, event.timestamp)) {
      this.castsWithoutRime += 1;
    }
  }

  statistic() {
    this.nonrimedHB = this.castsWithoutRime;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={this.castsWithoutRime}
        label="Howling Blasts without Rime proc"
        tooltip="You should aim to get this as close to 0 as possible.  It is almost always a DPS loss to cast Howling Blast without Rime.  The only time you should do this is during extended periods of being out of melee range, long enough that you get capped on runes.  In this case, it is acceptable to dump runes to build RP and stop yourself from capping.  "
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HardHowlingBlastCasts;
