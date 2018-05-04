import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const MAX_BUFF_STACKS = 5;
const PERCENT_BUFF=0.2;

class SkullflowersHaemostasis extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.SKULLFLOWERS_HAEMOSTASIS.id);
  }

  buffStack = 0;
  wastedBuff = 0;
  damage=0;
  heal=0;

  on_byPlayer_cast(event){
    if (event.ability.guid === SPELLS.BLOOD_BOIL.id) {
      return;
    }
    if(this.combatants.selected.hasBuff(SPELLS.DANCING_RUNE_WEAPON.id) && this.buffStack + 3 > MAX_BUFF_STACKS){
      this.wastedBuff += MAX_BUFF_STACKS - (3 + this.buffStack);
    } else if(this.buffStack === MAX_BUFF_STACKS) {
      this.wastedBuff += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.HAEMOSTASIS_BUFF.id) {
      this.buffStack = 1;
    }
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.HAEMOSTASIS_BUFF.id) {
      return;
    }
    this.buffStack = event.stack;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE_HEAL.id) {
      return;
    }
    if(this.buffStack > 0){
      this.heal += calculateEffectiveHealing(event,PERCENT_BUFF * this.buffStack);
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE.id) {
      return;
    }
    if(this.buffStack > 0){
      this.damage += calculateEffectiveDamage(event,PERCENT_BUFF * this.buffStack);
      this.buffStack = 0;
    }
  }

  item() {
    return {
      item: ITEMS.SKULLFLOWERS_HAEMOSTASIS,
      result:(
        <React.Fragment>
          <ItemDamageDone amount={this.damage} /><br />
          <ItemHealingDone amount={this.heal} /><br />
          Overcapped {this.wastedBuff} times
        </React.Fragment>
      ),
    };
  }
}

export default SkullflowersHaemostasis;
