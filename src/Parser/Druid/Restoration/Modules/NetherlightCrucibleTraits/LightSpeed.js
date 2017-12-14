import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import STAT from "Parser/Core/Modules/Features/STAT";
import StatWeights from '../Features/StatWeights';

/**
 * Light speed
 * Haste increased by 500, movement speed increased by 650.
 * Only the haste part is handled here.
 */

const HASTE_AMOUNT = 500;

class LightSpeed extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
    statWeights: StatWeights,
  };

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.LIGHT_SPEED.id];
    this.active = this.traitLevel > 0;
  }

  subStatistic() {
    const hasteGained = HASTE_AMOUNT * this.traitLevel;
    const healing = this.statWeights._getGain(STAT.HASTE_HPM) * hasteGained;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LIGHT_SPEED.id}>
            <SpellIcon id={SPELLS.LIGHT_SPEED.id} noLink /> Light Speed
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {this.owner.formatItemHealingDone(healing)}
        </div>
      </div>
    );
  }
}

export default LightSpeed;
