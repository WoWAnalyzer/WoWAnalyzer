import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'parser/core/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const debug = false;

class HardHowlingBlastCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  castsWithoutRime = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);
    if (spellId !== SPELLS.HOWLING_BLAST.id || !target) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.RIME.id, event.timestamp) && target.hasBuff(SPELLS.FROST_FEVER.id)) {
      this.castsWithoutRime += 1;
      debug && console.log(`Caught a HB hardcast at ${event.timestamp}`);
    }
  }

  statistic() {
    this.nonrimedHB = this.castsWithoutRime;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={this.castsWithoutRime}
        label="Howling Blasts without Rime proc"
        tooltip="You should aim to get this as close to 0 as possible.  It is almost always a DPS loss to cast Howling Blast without Rime.  It is okay to do this during extended periods of being out of melee range.  In this case, it is acceptable to dump runes to build RP and stop yourself from capping runes.  It is also okay to hardcast to apply Frost Fever to a target.  The analyzer does not count it against you when you do this"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HardHowlingBlastCasts;
