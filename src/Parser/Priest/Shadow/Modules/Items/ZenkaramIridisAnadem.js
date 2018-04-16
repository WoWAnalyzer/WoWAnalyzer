import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SCHOOLS from 'common/MAGIC_SCHOOLS';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';

const ZENKARAM_VOIDFORM_DAMAGE_INCREASE = 0.23;
const DEFAULT_VOIDFORM_DAMAGE_INCREASE = 0.20;

class ZenkaramIridisAnadem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDamage = 0;
  bonusHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.ZENKARAM_IRIDIS_ANADEM.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.VOIDFORM_BUFF.id) && event.ability.type === SCHOOLS.ids.SHADOW) {
      const increase = (1 + ZENKARAM_VOIDFORM_DAMAGE_INCREASE) / (1 + DEFAULT_VOIDFORM_DAMAGE_INCREASE) - 1;
      this.bonusDamage += calculateEffectiveDamage(event, increase);

    }
  }

  on_byPlayer_heal(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.VAMPIRIC_EMBRACE_HEAL.id) {
      this.bonusHealing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.ZENKARAM_IRIDIS_ANADEM,
      result: (
        <Wrapper>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          <ItemHealingDone amount={this.bonusHealing} />
        </Wrapper>
      ),
    };
  }
}

export default ZenkaramIridisAnadem;
