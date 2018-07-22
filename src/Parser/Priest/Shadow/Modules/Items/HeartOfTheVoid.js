import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

const HEART_OF_THE_VOID_DAMAGE_INCREASE = 0.75;

class HeartOfTheVoid extends Analyzer {
  bonusDamage = 0;
  bonusHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasChest(ITEMS.HEART_OF_THE_VOID.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.VOID_ERUPTION_DAMAGE_1.id || spellID === SPELLS.VOID_ERUPTION_DAMAGE_2.id) {
      this.bonusDamage += calculateEffectiveDamage(event, HEART_OF_THE_VOID_DAMAGE_INCREASE);
    }
  }

  on_byPlayer_heal(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.HEART_OF_THE_VOID_HEAL.id) {
      this.bonusHealing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.HEART_OF_THE_VOID,
      result: (
        <React.Fragment>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          <ItemHealingDone amount={this.bonusHealing} />
        </React.Fragment>
      ),
    };
  }
}

export default HeartOfTheVoid;
