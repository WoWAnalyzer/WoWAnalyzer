import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

/**
 * Light's Embrace
 * When you take damage, you have a chance to generate Light's Embrace, stacking up to 5 times. Light's Embrace heals for 45500damage over 6 sec.
 */
class LightsEmbrace extends Module {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.LIGHTS_EMBRACE_TRAIT.id] > 0;
  }

  subStatistic() {
    const healing = this.healingDone.byAbility(SPELLS.LIGHTS_EMBRACE_HEALING.id).effective;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LIGHTS_EMBRACE_TRAIT.id}>
            <SpellIcon id={SPELLS.LIGHTS_EMBRACE_TRAIT.id} noLink /> Light's Embrace
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
        {formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))} % healing
        </div>
      </div>
    );
  }
}

export default LightsEmbrace;
