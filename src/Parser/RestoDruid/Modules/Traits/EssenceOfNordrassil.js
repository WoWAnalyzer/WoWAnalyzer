import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const ESSENCE_OF_NORDRASSIL_HEALING_INCREASE = 0.1;

/**
 * Essence of Nordrassil (Artifact Trait)
 * Increases healing done by Efflorescence by 5%
 */
class EssenceOfNordrassil extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.ESSENCE_OF_NORDRASSIL.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if(event.ability.guid !== SPELLS.EFFLORESCENCE_HEAL.id) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, ESSENCE_OF_NORDRASSIL_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ESSENCE_OF_NORDRASSIL.id}>
            <SpellIcon id={SPELLS.ESSENCE_OF_NORDRASSIL.id} noLink /> Essence of Nordrassil
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default EssenceOfNordrassil;
