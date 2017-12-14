import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS/OTHERS';
import { formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import isAtonement from '../Core/isAtonement';

class CarafeOfSearingLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  lastDamageEventIsTrinketDot = false;
  damage = 0;
  healing = 0;
  manaGained = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.CARAFE_OF_SEARING_LIGHT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REFRESHING_AGONY_DOT.id) {
      this.lastDamageEventIsTrinketDot = false;
      return;
    }

    this.lastDamageEventIsTrinketDot = true;
    this.damage += event.amount;
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event) || !this.lastDamageEventIsTrinketDot) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REFRESHING_AGONY_MANA.id) {
      return;
    }

    this.manaGained += event.resourceChange;
  }

  item() {

    const damage = this.damage || 0;
    const healing = this.healing || 0;
    const manaGained = this.manaGained || 0;

    return {
      item: ITEMS.CARAFE_OF_SEARING_LIGHT,
      result: (
        <dfn>
          {this.owner.formatItemDamageDone(damage)} <br/>
          {this.owner.formatItemHealingDone(healing)} <br/>
          {formatThousands(manaGained)} mana gained ({formatThousands(this.manaGained / this.owner.fightDuration * 1000 * 5)} MP5)
        </dfn>
      ),
    };
  }
}

export default CarafeOfSearingLight;
