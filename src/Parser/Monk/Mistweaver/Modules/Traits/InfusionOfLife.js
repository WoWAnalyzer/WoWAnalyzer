import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const INFUSION_OF_LIFE_HEALING_INCREASE = 0.05;

/**
 * Infusion of Life (Artifact Trait)
 * Increases healing done by Vivify by 5%.
 */
class InfusionOfLife extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.INFUSION_OF_LIFE.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.VIVIFY.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, INFUSION_OF_LIFE_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.INFUSION_OF_LIFE.id}>
            <SpellIcon id={SPELLS.INFUSION_OF_LIFE.id} noLink /> Infusion of Life
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default InfusionOfLife;
