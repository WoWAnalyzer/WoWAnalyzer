import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const ASPECT_MODIFIER = 0.3;

/*
 * Aspect of the Eagle increases all damage you deal by 30% for its duration.
 */
class AspectOfTheSkylord extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.ASPECT_OF_THE_SKYLORD_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.ASPECT_OF_THE_SKYLORD_BUFF.id, event.timestamp)) {
      return;
    }
    this.damage += getDamageBonus(event, ASPECT_MODIFIER);
  }
  
  on_byPlayerPet_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.ASPECT_OF_THE_SKYLORD_BUFF.id, event.timestamp)) {
      return;
    }
    this.damage += getDamageBonus(event, ASPECT_MODIFIER);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ASPECT_OF_THE_SKYLORD_TRAIT.id}>
            <SpellIcon id={SPELLS.ASPECT_OF_THE_SKYLORD_TRAIT.id} noLink /> Aspect of the Skylord
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default AspectOfTheSkylord;
