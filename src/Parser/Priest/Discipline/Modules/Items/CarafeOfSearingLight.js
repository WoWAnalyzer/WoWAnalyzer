import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS/OTHERS';
import Wrapper from 'common/Wrapper';
import CoreCarafeOfSearingLight from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/CarafeOfSearingLight';
import ItemHealingDone from 'Main/ItemHealingDone';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemManaGained from 'Main/ItemManaGained';

import isAtonement from '../Core/isAtonement';

class CarafeOfSearingLight extends CoreCarafeOfSearingLight {
  healing = 0;
  lastDamageEventIsTrinketDot = false;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REFRESHING_AGONY_DOT.id) {
      this.lastDamageEventIsTrinketDot = false;
    } else {
      this.lastDamageEventIsTrinketDot = true;
    }
    super.on_byPlayer_damage(event);
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
        <Wrapper>
          <ItemDamageDone amount={damage} /><br/>
          <ItemHealingDone amount={healing} /><br />
          <ItemManaGained amount={manaGained} />
        </Wrapper>
      ),
    };
  }
}

export default CarafeOfSearingLight;
