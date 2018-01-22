import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';
import Wrapper from 'common/Wrapper';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

class SkullflowersHaemostasis extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.SKULLFLOWERS_HAEMOSTASIS.id);
  }

  buffStack = 0;
  wastedBuff = 0;
  maxBuffStacks = 5;
  damage=0;
  heal=0;
  percentBuff=0.2;
  deathStrikeDamageIsDone = false;
  deathStrikeHealingIsDone = false;



  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.HAEMOSTASIS_BUFF.id) {
      this.buffStack += 1;
    }
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid === SPELLS.HAEMOSTASIS_BUFF.id) {
      if (this.buffstack >= this.maxBuffStacks) {
        this.wastedBuff += 1;
        this.buffStack = this.maxBuffStacks;
      }
      else {
        this.buffStack += 1;
      }
    }
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE_HEAL.id) {
      return;
    }
    this.heal += calculateEffectiveHealing(event,this.percentBuff * this.buffStack);
    this.deathStrikeHealingIsDone = true;
    if (this.deathStrikeHealingIsDone && this.deathStrikeDamageIsDone === true) {
      this.buffStack = 0;
      this.deathStrikeDamageIsDone = false;
      this.deathStrikeHealingIsDone = false;
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE.id) {
      return;
    }
    this.damage += calculateEffectiveDamage(event,this.percentBuff * this.buffStack);
    this.deathStrikeDamageIsDone = true;
    if (this.deathStrikeHealingIsDone && this.deathStrikeDamageIsDone === true) {
      this.buffStack = 0;
      this.deathStrikeDamageIsDone = false;
      this.deathStrikeHealingIsDone = false;
    }
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
