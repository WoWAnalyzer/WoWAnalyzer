import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Shocklight
 * While Concordance of the Legionfall is active, your critical strike is increased by 1500.
 */
class Shocklight extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.SHOCKLIGHT_TRAIT.id] > 0;
  }

  subStatistic() {
    const murderousIntentUptime = this.combatants.selected.getBuffUptime(SPELLS.SHOCKLIGHT_BUFF.id) / this.owner.fightDuration;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SHOCKLIGHT_TRAIT.id}>
            <SpellIcon id={SPELLS.SHOCKLIGHT_TRAIT.id} noLink /> Shocklight
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(murderousIntentUptime)} % uptime
        </div>
      </div>
    );
  }
}

export default Shocklight;
