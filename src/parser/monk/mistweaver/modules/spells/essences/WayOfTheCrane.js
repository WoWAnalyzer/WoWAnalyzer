import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox from 'interface/others/StatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';



/**
 * Simple info graphic that shows what spell did what healing during wotc window, the hps of each spell, and hptc
 */

class WayOfTheCrane extends Analyzer {

  customMap = null;
  damageSpell = "";
  lastTimeStamp = 0;
  inWotc = false;
  wotcTime = 0;

  constructor(...args) {
    super(...args);
    const hasEssence = this.selectedCombatant.hasEssence(SPELLS.CONFLICT.traitId);
    if(!hasEssence){
        return;
    }
    this.active = this.selectedCombatant.hasMajor(SPELLS.CONFLICT.traitId);
    if (!this.active) {
      return;
    }
    this.customMap = new Map();
  }

  on_byPlayer_damage(event) {
    if(!this.selectedCombatant.hasBuff(SPELLS.WAY_OF_THE_CRANE.id)){
      return;
    }
    this.damageSpell = event.ability.name;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.WAY_OF_THE_CRANE_HEAL.id || spellId === SPELLS.WAY_OF_THE_CRANE_HEAL_HONOR.id){
      if(this.customMap.get(this.damageSpell)===undefined){
        this.customMap.set(this.damageSpell, [1, event.amount || 0, event.overheal || 0]);
      }else{
        let array = this.customMap.get(this.damageSpell);
        let heal = array[1];
        let overheal = array[2];
        if(event.amount){
          heal += event.amount;
        }
        if(event.overheal){
          overheal += event.overheal;
        }
        array = [array[0] + 1, heal, overheal];
        this.customMap.set(this.damageSpell, array);
      }
    }
  }

  on_byPlayer_applybuff(event){
    if(event.ability.guid !== SPELLS.WAY_OF_THE_CRANE.id){
        return;
    }
    this.inWotc = true;
    this.lastTimeStamp = event.lastTimeStamp;
  }

  on_byPlayer_removebuff(event){
    if(event.ability.guid !== SPELLS.WAY_OF_THE_CRANE.id){
      return;
    }
    this.wotcTime += 15;
    this.inWotc = false;
  }

  on_fightend(){
    if(this.inWotc === true){
      this.wotcTime += (this.selectedCombatant.fightDuration - this.lastTimeStamp)/1000;
    }
  }

  statistic() {
    let totalHeal = 0;
    this.customMap.forEach(function(value, key) {
      totalHeal += value[1]; 
    });
    console.log(totalHeal);
    const arrayOfDamageSpells = Array.from(this.customMap.keys());
    return (
      <StatisticBox
        label="Way Of The Crane"
        icon={<SpellIcon id={SPELLS.WAY_OF_THE_CRANE.id} />}
        value={<ItemHealingDone amount={totalHeal} />}
        tooltip={(
            arrayOfDamageSpells.map(spell => (
                <div>{spell} did {this.customMap.get(spell)[1]} healing, {this.customMap.get(spell)[2]} overhealing in {this.customMap.get(spell)[0]/3} casts.</div>
            ))
        )}
      >
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Spell</th>
            <th>During Wotc HPS</th>
            <th>HPCT</th>
          </tr>
        </thead>
        <tbody>
          {
            arrayOfDamageSpells.map(spell => (
              <tr>
              <td>{spell}</td>
              <td>{formatNumber(this.customMap.get(spell)[1]/this.wotcTime)}</td>
              <td>{formatNumber(this.customMap.get(spell)[1]/(this.customMap.get(spell)[0]/3*1.5))}</td>
              </tr>
            ))
          }
          </tbody>
      </table>
      </StatisticBox>

    );
  }

}

export default WayOfTheCrane;
