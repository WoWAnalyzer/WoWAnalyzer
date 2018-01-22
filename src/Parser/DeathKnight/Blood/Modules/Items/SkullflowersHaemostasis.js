import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';
import Wrapper from 'common/Wrapper';

class SkullflowersHaemostasis extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.SKULLFLOWERS_HAEMOSTASIS.id);
  }

  buffStack = 0;
  savedBuffStack=0;
  wastedBuff = 0;
  maxBuffStacks = 5;
  damage=0;
  heal=0;
  percentBuff=1/6;
  dsCastWithBuff=false;


  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.HAEMOSTASIS_BUFF.id) {
      this.buffStack += 1;
      this.savedBuffStack=this.buffStack;
    }
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid === SPELLS.HAEMOSTASIS_BUFF.id) {
      if (this.buffstack >= this.maxBuffStacks) {
        this.wastedBuff += 1;
        this.buffStack = this.maxBuffStacks;
        this.savedBuffStack=this.buffStack;
      }
      else {
        this.buffStack += 1;
        this.savedBuffStack=this.buffStack;
      }
    }
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.HAEMOSTASIS_BUFF.id) {
      this.buffStack = 0;
    }
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE_HEAL.id) {
      return;
    }
    this.heal += (event.amount + (event.absorbed || 0)) * this.percentBuff * this.savedBuffStack;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE.id) {
      return;
    }
    this.damage += (event.amount + (event.absorbed || 0)) * this.percentBuff * this.savedBuffStack;
  }



  item() {
    return {
      item: ITEMS.SKULLFLOWERS_HAEMOSTASIS,
      result:(
        <Wrapper>
          <ItemDamageDone amount={this.damage} /><br />
          <ItemHealingDone amount={this.heal} /><br />
          Overcapped {this.wastedBuff} Times
        </Wrapper>
      ),
    };
  }
}

export default SkullflowersHaemostasis;
