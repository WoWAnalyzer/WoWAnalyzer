import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

class Tier21_4p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

//TODO: Figure out a way to properly show statistics on this - should be possible with more logs available over the course of first week.

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T21_4P_BONUS.id);
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T21_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T21_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T21_4P_BONUS.id} />,
      result: <span> This gave your <SpellLink id={SPELLS.MARKED_SHOT.id} /> a 50% chance of firing an extra time, on up to 3 targets.</span>,
    };
  }
}

export default Tier21_4p;
