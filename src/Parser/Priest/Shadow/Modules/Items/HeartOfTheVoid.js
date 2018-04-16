import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import Wrapper from 'common/Wrapper';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';

const HEART_OF_THE_VOID_DAMAGE_INCREASE = 0.75;

class HeartOfTheVoid extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDamage = 0;
  bonusHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.HEART_OF_THE_VOID.id);
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
        <Wrapper>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          <ItemHealingDone amount={this.bonusHealing} />
        </Wrapper>
      ),
    };
  }
}

export default HeartOfTheVoid;
