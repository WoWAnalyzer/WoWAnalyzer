import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const debug = false;

class HardHowlingBlastCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  constructor(options: any) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOWLING_BLAST), this.onCast);
  }

  castsWithoutRime = 0;

  onCast(event: CastEvent) {
    const target = this.enemies.getEntity(event);
    if(!target) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.RIME.id, event.timestamp) && target.hasBuff(SPELLS.FROST_FEVER.id)) {
      this.castsWithoutRime += 1;
      debug && console.log(`Caught a HB hardcast at ${event.timestamp}`);
    }
  }

  statistic() {
    return (
      <StatisticBox
        postion={STATISTIC_ORDER.CORE(50)}
        icon={<SpellIcon id={SPELLS.RIME.id} />}
        value={this.castsWithoutRime}
        label="Howling Blasts without Rime proc"
        tooltip="You should aim to get this as close to 0 as possible.  It is almost always a DPS loss to cast Howling Blast without Rime.  It is okay to do this during extended periods of being out of melee range.  In this case, it is acceptable to dump runes to build RP and stop yourself from capping runes.  It is also okay to hardcast to apply Frost Fever to a target.  The analyzer does not count it against you when you do this"
      />
    );
  }
}

export default HardHowlingBlastCasts;
