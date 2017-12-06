import React from 'react';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Combatants from '../Combatants';
import Analyzer from '../../Analyzer';

class IshkarsFelshieldEmitter extends Analyzer {
    static dependencies = {
        combatants: Combatants,
    };

    damageAbsorbed = 0;
    damageDealt = 0;

    on_initialized() {
        const selectedCombatant = this.combatants.selected;
        this.active = selectedCombatant.hasTrinket(ITEMS.ISHKARS_FELSHIELD_EMITTER.id);
    }

    on_byPlayer_absorbed(event) {
        const spellId = event.ability.guid;
        if (spellId === SPELLS.FELSHIELD_ABSORB.id) {
            this.damageAbsorbed += event.amount;
        }
    }

    on_byPlayer_damage(event) {
      const spellId = event.ability.guid;
      if (spellId === SPELLS.FELSHIELD_DAMAGE.id) {
        this.damageDealt += event.amount;
      }
    }

    item() {
        return {
          item: ITEMS.ISHKARS_FELSHIELD_EMITTER,
          result: (
            <Wrapper>
              {this.owner.formatItemHealingDone(this.damageAbsorbed)}<br />
              {this.owner.formatItemDamageDone(this.damageDealt)}
            </Wrapper>
          ),
        };
      }
}

export default IshkarsFelshieldEmitter;
