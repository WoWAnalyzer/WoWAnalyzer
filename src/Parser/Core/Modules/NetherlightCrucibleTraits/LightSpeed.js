import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';

/**
 * Light Speed
 * Haste increased by 500.
 * Movement speed increased by 650.
 */

const HASTE_AMOUNT = 500;
const MOVEMENT_SPEED_AMOUNT = 650;

class LightSpeed extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.LIGHT_SPEED_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LIGHT_SPEED_TRAIT.id}>
            <SpellIcon id={SPELLS.LIGHT_SPEED_TRAIT.id} noLink /> Light Speed
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatNumber(this.traitLevel * HASTE_AMOUNT)} haste gained
          <br />
          {formatNumber(this.traitLevel * MOVEMENT_SPEED_AMOUNT)} movement speed gained
        </div>
      </div>
    );
  }
}

export default LightSpeed;
