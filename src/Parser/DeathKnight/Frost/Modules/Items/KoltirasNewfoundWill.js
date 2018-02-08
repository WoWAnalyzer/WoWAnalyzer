import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Equip: Obliterate deals 10% more damage and has a 15% chance to refund 1 runes.
 */

const DAMAGE_MODIFIER = .1;

class KoltirasNewfoundWill extends Analyzer{
    static dependencies = {
        combatants: Combatants,
    }

    bonusDamage = 0;

    on_initialized(){
        this.active = this.combatants.selected.hasWaist(ITEMS.KOLTIRAS_NEWFOUND_WILL.id);
    }

    on_byPlayer_damage(event){
        const spellId = event.ability.guid;
        if(spellId === SPELLS.OBLITERATE_MAIN_HAND_DAMAGE.id || spellId === SPELLS.OBLITERATE_OFF_HAND_DAMAGE.id){
            this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
        }
        
    }

    item() {
        console.log(this.bonusDamage)
        return {
          item: ITEMS.KOLTIRAS_NEWFOUND_WILL,
          result: <ItemDamageDone amount={this.bonusDamage} />,
        };
    }
}

export default KoltirasNewfoundWill;