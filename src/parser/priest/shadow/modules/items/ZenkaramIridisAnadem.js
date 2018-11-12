import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ItemHealingDone from 'interface/others/ItemHealingDone';

const ZENKARAM_VOIDFORM_DAMAGE_INCREASE = 0.23;
const DEFAULT_VOIDFORM_DAMAGE_INCREASE = 0.20;

class ZenkaramIridisAnadem extends Analyzer {
  bonusDamage = 0;
  bonusHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasHead(ITEMS.ZENKARAM_IRIDIS_ANADEM.id);
  }

  on_byPlayer_damage(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) && event.ability.type === SCHOOLS.ids.SHADOW) {
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
        <>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          <ItemHealingDone amount={this.bonusHealing} />
        </>
      ),
    };
  }
}

export default ZenkaramIridisAnadem;
