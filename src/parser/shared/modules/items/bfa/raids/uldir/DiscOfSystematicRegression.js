import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import {formatNumber} from 'common/format';
import Analyzer from 'parser/core/Analyzer';

/**
 * Equip: Your attacks have a chance to cause a Void Sector, 
 * instantly dealing 5814 Shadow damage split among all targets in a cone in front of you.
 * 
 * Example log: 
 */

class DiscOfSystematicRegression extends Analyzer {
    totalDamage = 0;
    hits = 0;

    constructor(...args){
        super(...args);
        this.active = this.selectedCombatant.hasTrinket(ITEMS.DISC_OF_SYSTEMATIC_REGRESSION.id);
    }

    on_byPlayer_damage(event){
        const spellId = event.ability.guid;
        if(spellId === SPELLS.VOIDED_SECTORS.id){
            this.totalDamage += (event.amount || 0) + (event.absorbed || 0);
            this.hits += 1;
        }
    }

    item(){
        return {
        item: ITEMS.DISC_OF_SYSTEMATIC_REGRESSION,
        result: (
            <>
            <dfn data-tip={`Hit <b>${this.hits}</b> times for an average of <b>${formatNumber(this.totalDamage/this.hits)}</b> damage per hit.`}>
                <ItemDamageDone amount={this.totalDamage} />
            </dfn>
            </>
        ),
        };
    }
}

export default DiscOfSystematicRegression;