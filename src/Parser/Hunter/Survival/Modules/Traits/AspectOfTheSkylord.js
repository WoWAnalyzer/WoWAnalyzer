import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from "common/SpellLink";
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const ASPECT_MODIFIER = 0.3;

/**
 * Aspect of the Eagle increases all damage you deal by 30% for its duration.
 */
class AspectOfTheSkylord extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.traitsBySpellId[SPELLS.ASPECT_OF_THE_SKYLORD_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_SKYLORD_BUFF.id, event.timestamp)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, ASPECT_MODIFIER);
  }

  on_byPlayerPet_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_SKYLORD_BUFF.id, event.timestamp)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, ASPECT_MODIFIER);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ASPECT_OF_THE_SKYLORD_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default AspectOfTheSkylord;
