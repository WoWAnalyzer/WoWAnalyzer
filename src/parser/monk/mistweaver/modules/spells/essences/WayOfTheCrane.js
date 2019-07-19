import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import ItemStatisticBox from 'interface/others/ItemStatisticBox';



/**
 * Simple info graphic that shows what spell did what healing during wotc window, the hps of each spell, and hptc
 */

class WayOfTheCrane extends Analyzer {

  customMap = null;
  _damageSpell = "";
  _lastTimeStamp = 0;
  _inWotc = false;
  _wotcTime = 0;

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
    this._damageSpell = event.ability.name;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.WAY_OF_THE_CRANE_HEAL.id || spellId === SPELLS.WAY_OF_THE_CRANE_HEAL_HONOR.id){
      if(this.customMap.get(this._damageSpell)===undefined){
        const healingEvents = {
          casts: 1,
          healing: event.amount || 0,
          overheal:  event.overheal || 0,
        };
        this.customMap.set(this._damageSpell, healingEvents);
      }else{
        const healingEvents = this.customMap.get(this._damageSpell);
        healingEvents.casts +=1;
        healingEvents.healing += event.amount;
        healingEvents.overheal += event.overheal||0;
        this.customMap.set(this._damageSpell, healingEvents);
      }
    }
  }

  on_byPlayer_applybuff(event){
    if(event.ability.guid !== SPELLS.WAY_OF_THE_CRANE.id){
        return;
    }
    this._inWotc = true;
    this._lastTimeStamp = event.lastTimeStamp;
  }

  on_byPlayer_removebuff(event){
    if(event.ability.guid !== SPELLS.WAY_OF_THE_CRANE.id){
      return;
    }
    this._wotcTime += 15;
    this._inWotc = false;
  }

  on_fightend(){
    if(this._inWotc === true){
      this._wotcTime += (this.selectedCombatant.fightDuration - this._lastTimeStamp)/1000;
    }
  }

  statistic() {
    let totalHeal = 0;
    this.customMap.forEach(function(value, key) {
      totalHeal += value.healing; 
    });
    const arrayOfDamageSpells = Array.from(this.customMap.keys());
    return (
      <ItemStatisticBox
        label="Way Of The Crane"
        icon={<SpellIcon id={SPELLS.WAY_OF_THE_CRANE.id} />}
        value={<ItemHealingDone amount={totalHeal} />}
        tooltip={(
          arrayOfDamageSpells.map(spell => (
            <div>{spell} did {this.customMap.get(spell).healing} healing, {this.customMap.get(spell).overheal} overhealing in {this.customMap.get(spell).casts/3} casts.</div>
          ))
        )}
      >
      <div>
        The healing done by your damaging abilities <b>during Way of the Crane</b>. That is: the HPS column doesn't count time outside of WotC.
      </div>
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Spell</th>
            <th>HPS</th>
            <th>HPCT</th>
          </tr>
        </thead>
        <tbody>
          {
            arrayOfDamageSpells.map(spell => (
              <tr>
              <td>{spell}</td>
              <td>{formatNumber(this.customMap.get(spell).healing/this._wotcTime)}</td>
              <td>{formatNumber(this.customMap.get(spell).healing/(this.customMap.get(spell).casts/3*1.5))}</td>
              </tr>
            ))
          }
          </tbody>
      </table>
      </ItemStatisticBox>

    );
  }

}

export default WayOfTheCrane;
