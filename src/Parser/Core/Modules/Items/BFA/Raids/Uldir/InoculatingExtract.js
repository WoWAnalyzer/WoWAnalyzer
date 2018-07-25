import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import {formatNumber} from 'common/format';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';
import Analyzer from 'Parser/Core/Analyzer';

/**
 * Inoculating Extract -
 * Use: Inject 5 stacks of Mutating Antibodies into a friendly target for 30 sec. your direct heals on
 * that ally will consume a Mutating Antibody to restore an additional 3135 health. (1 Min, 30 Sec
 * Cooldown).
 */


class InoculatingExtract extends Analyzer{
  healing = 0;
  charges = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.INOCULATING_EXTRACT.id);
  }

  on_byPlayer_heal(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.MUTATING_ANTIBODY.id){
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.charges += 1;
    }
  }


  item(){
    return{
      item: ITEMS.INOCULATING_EXTRACT,
      result: (
        <React.Fragment>
          <dfn data-tip={`Used <b>${Math.ceil(this.charges/5)}</b> times, consuming <b>${this.charges}</b> charges.`}>
            {formatNumber(this.healing)} Healing
          </dfn><br />
          <ItemHealingDone amount={this.healing} />
        </React.Fragment>
      ),
    };
  }

}


export default InoculatingExtract;
