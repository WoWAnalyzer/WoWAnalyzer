import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import isAtonement from '../Core/isAtonement';

import Module from 'Parser/Core/Module';

const TIER_21_FOUR_SET_BONUS = 0.3;

class Tier21_4set extends Module {

  healing = 0;
  damage = 0;
  penanceBuffActive = false;
  lastDamageEventIsPenance = false;
  all = [];
  filtered = [];
  current = null;

  lastDamageAmountPenance = 0;
  inWindow = false;

  timeStampLastPenanceHit = 0;

  timeStampAppliedBuff = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T21_4SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.DISC_PRIEST_T21_4SET_BONUS_BUFF.id) {
      return;
    }
    this.penanceBuffActive = true;
    this.timeStampAppliedBuff = event.timestamp;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.PENANCE.id) {
      this.inWindow = false;
    }
  }

  on_byPlayer_damage(event) {

    if (event.ability.guid !== SPELLS.PENANCE.id) {
      this.lastDamageEventIsPenance = false;
      return;
    }

    if(event.timestamp - this.timeStampAppliedBuff > 15000)
      return;

    this.inWindow = true;
    this.lastDamageAmountPenance = event.amount;
    this.all.push({"timestamp": event.timestamp- 1873585,"damage": event.amount, "HealingEventsAssociated": []});
    this.lastDamageEventIsPenance = true;


  }

  on_byPlayer_heal(event) {

    if(!isAtonement(event))
      return;

    if(!this.inWindow)
      return;

    var oh = event.overheal ? event.overheal : 0;
    if(event.amount + oh < (this.lastDamageAmountPenance * 0.3))
      return


    this.all[this.all.length -1].HealingEventsAssociated.push(event.amount + oh);
    this.healing += calculateEffectiveHealing(event, TIER_21_FOUR_SET_BONUS);

  }

  on_finished() {
    var result = [];
    this.all.forEach(function(element) {
      if(element.HealingEventsAssociated.length > 0)
        result.push(element);
    });
    console.log(result);

  }

  item() {
    return {
      id: `spell-${SPELLS.DISC_PRIEST_T21_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.DISC_PRIEST_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T21_4SET_BONUS_PASSIVE.id} />,
      result: (
        <span>
          {(this.owner.getPercentageOfTotalHealingDone(this.healing)*100).toFixed(2)} % / {(this.healing / this.owner.fightDuration).toFixed(0)}k HPS
        </span>
      ),
    };
  }
}

export default Tier21_4set;
