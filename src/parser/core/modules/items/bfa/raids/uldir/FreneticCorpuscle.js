import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import {formatNumber} from 'common/format';
import Analyzer from 'parser/core/Analyzer';

/**
 * Frenetic Corpuscle -
 * Equip: Your attacks have a chance to grant you Frothing Rage for 45 sec. When Frothing Rage
 * reaches 4 charges, your next attack will deal an additional 19496 Physical damage.
 */
class FreneticCorpuscle extends Analyzer {
  totalDamage = 0;
  hits = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.FRENETIC_CORPUSCLE.id);
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FRENETIC_BLOW.id){
      this.totalDamage += (event.amount || 0) + (event.absorbed || 0);
      this.hits += 1;
    }
  }

  item(){
    return {
      item: ITEMS.FRENETIC_CORPUSCLE,
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

export default FreneticCorpuscle;
