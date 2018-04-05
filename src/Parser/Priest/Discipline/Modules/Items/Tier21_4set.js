import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';

import Penance from '../Spells/Penance';
import isAtonement from '../Core/isAtonement';

const TIER_21_FOUR_SET_BONUS = 0.3;
const RADIANT_FOCUS_DURATION = 15000;

class Tier21_4set extends Analyzer {
  static dependencies = {
    penance: Penance,
  };

  lastRadianceCastTimestamp = 0;
  lastPenanceBoltNumber = 0;
  currentPenanceIsBuffed = false;
  lastDamageEventIsPenance = false;

  healing = 0;
  damage = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T21_4SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_damage(event){

    const spellId = event.ability.guid;

    if (spellId !== SPELLS.PENANCE.id) {
      this.lastDamageEventIsPenance = false;
      return;
    }

    // The debuff was lost before it was used
    if(event.timestamp - this.lastRadianceCastTimestamp > RADIANT_FOCUS_DURATION){
      this.currentPenanceIsBuffed = false;
    }

    this.lastDamageEventIsPenance = true;

    // This isn't the first penance since last radiance cast
    if(this.lastPenanceBoltNumber > event.penanceBoltNumber) {
      this.currentPenanceIsBuffed = false;
      return;
    }

    if(this.currentPenanceIsBuffed) {
      this.lastPenanceBoltNumber = event.penanceBoltNumber;
      this.damage += calculateEffectiveDamage(event,TIER_21_FOUR_SET_BONUS);
    }

  }

  on_byPlayer_heal(event){
    if(isAtonement(event) && this.currentPenanceIsBuffed && this.lastDamageEventIsPenance){
      this.healing += calculateEffectiveHealing(event,TIER_21_FOUR_SET_BONUS);
    }
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_RADIANCE.id) {
      return;
    }
    this.currentPenanceIsBuffed = true;
    this.lastRadianceCastTimestamp = event.timestamp;
    this.lastPenanceBoltNumber = 0;
  }

  item() {

    const healing = this.healing || 0;
    const damage = this.damage || 0;

    return {
      id: `spell-${SPELLS.DISC_PRIEST_T21_4SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.DISC_PRIEST_T21_4SET_BONUS_PASSIVE.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T21_4SET_BONUS_PASSIVE.id} icon={false} />,
      result: (
        <Wrapper>
          <ItemDamageDone amount={damage} /><br />
          <ItemHealingDone amount={healing} />
        </Wrapper>
      ),
    };
  }
}

export default Tier21_4set;
