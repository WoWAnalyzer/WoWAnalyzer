import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import Abilities from 'parser/shared/modules/Abilities';

const ACTIVATION_COOLDOWN = 120; // seconds

/**
 * Rotcrusted Voodoo Doll
 * Use: Brandish the Voodoo Doll at your target, 
 * dealing X Shadow damage over 6 sec, and an additional X Shadow damage after 6 sec. (2 Min Cooldown)
 */
class RotcrustedVoodooDoll extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  damage = 0;
  ticks = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.ROTCRUSTED_VOODOO_DOLL.id);

    if (this.active) {
        this.abilities.add({
          spell: SPELLS.ROTCRUSTED_VOODOO_DOLL_BUFF,
          buffSpellId: SPELLS.ROTCRUSTED_VOODOO_DOLL_TICK.id,
          name: ITEMS.ROTCRUSTED_VOODOO_DOLL.name,
          category: Abilities.SPELL_CATEGORIES.ITEMS,
          cooldown: ACTIVATION_COOLDOWN,
          castEfficiency: {
            suggestion: true,
          },
        });
      }
  }

  on_byPlayer_damage(event) {
    if ((event.ability.guid !== SPELLS.ROTCRUSTED_VOODOO_DOLL_TICK.id) && (event.ability.guid !== SPELLS.ROTCRUSTED_VOODOO_DOLL_HIT.id)) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
    this.ticks += 1;
  }

  item() {
    return {
      item: ITEMS.ROTCRUSTED_VOODOO_DOLL,
      result: (
          <dfn data-tip={`<b>${this.ticks}</b> ticks, causing <b>${formatNumber(this.damage)}</b> damage.`}>
            <ItemDamageDone amount={this.damage} />
          </dfn>
      ),
    };
  }
}

export default RotcrustedVoodooDoll;