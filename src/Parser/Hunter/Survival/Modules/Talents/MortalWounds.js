import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const RESET_CHANCE_PER_TICK = 0.02;

/**
 * Each time Lacerate deals damage, you have a 2% chance to gain a charge of Mongoose Bite.
 */
class MortalWounds extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  ticks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.MORTAL_WOUNDS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }
    this.ticks++;
  }

  get averageBitesGained() {
    return this.ticks * RESET_CHANCE_PER_TICK;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MORTAL_WOUNDS_TALENT.id} />}
        value={`~${this.averageBitesGained.toFixed(2)}`}
        label="Approximate bites gained"
        tooltip={`Because logs don't include information about mongoose bite resets, this is currently untrackable. This shows the average amount of Mongoose Bites you would have generated over this encounter through this talent.`} />
    );
  }

}

export default MortalWounds;
