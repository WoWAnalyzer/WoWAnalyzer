import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import {formatNumber} from 'common/format';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import Analyzer from 'Parser/Core/Analyzer';

/**
 * Vigilant's Bloodshaper -
 * Equip: Your damaging spells have a chance to launch an orb of charged blood at your target,
 * dealing 0 shadow damage split among all nearby enemeies.
 */


class VigilantsBloodshaper extends Analyzer{
  damage = 0;
  hits = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.VIGILANTS_BLOODSHAPER.id);
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.VOLATILE_BLOOD_EXPLOSION.id){
      this.damage += event.amount + (event.absorbed || 0);
      this.hits += 1;
    }
  }

  item(){
    return{
      item: ITEMS.VIGILANTS_BLOODSHAPER,
      result: (
        <React.Fragment>
          <dfn data-tip={`Procced <b>${this.hits}</b> times, causing <b>${this.damage}</b> damage.`}>
            {formatNumber(this.damage)} Damage
          </dfn><br />
          <ItemDamageDone amount={this.damage} />
        </React.Fragment>
      ),
    };
  }

}


export default VigilantsBloodshaper;
