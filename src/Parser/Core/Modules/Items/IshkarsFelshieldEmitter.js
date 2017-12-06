import React from 'react';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Combatants from '../Combatants';
import Analyzer from '../../Analyzer';

/*
 * Ishkars Felshield Emitter -
 * Use: Place a Felshield on an ally, absorbing [2416491 * (1 + Versatility)] damage for 9 sec. When the shield is consumed or expires, it explodes dealing 50% of the absorbed damage as Fire split amongst all enemies within 8 yds. (1 Min Cooldown)
 */
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
        this.damageDealt += event.amount + (event.absorbed || 0);
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
