import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const MAX_BUFF_STACKS = 5;
const PERCENT_BUFF = 0.1;

class Hemostasis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  buffedDeathStrikes = 0;
  unbuffedDeathStrikes = 0;
  buffStack = 0;
  wastedBuffs = 0;
  gainedBuffs = 0;
  damage=0;
  heal=0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HEMOSTASIS_TALENT.id);
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE_HEAL.id) {
      return;
    }
    if(this.buffStack > 0){
      this.heal += calculateEffectiveHealing(event, PERCENT_BUFF * this.buffStack);
    }
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.DEATH_STRIKE.id && spellID !== SPELLS.BLOOD_BOIL.id) {
      return;
    }

    if (spellID === SPELLS.DEATH_STRIKE.id) {
      if(this.buffStack > 0){
        this.buffedDeathStrikes++;
        this.damage += calculateEffectiveDamage(event, PERCENT_BUFF * this.buffStack);
        this.buffStack = 0;
        return;
      }
      this.unbuffedDeathStrikes++;
    }

    if (spellID === SPELLS.BLOOD_BOIL.id) {
      if (this.buffStack === MAX_BUFF_STACKS) {
        this.wastedBuffs++;
      } else {
        this.buffStack++;
        this.gainedBuffs++;
      }
    }
  }


  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEMOSTASIS_TALENT.id} />}
        value={`${this.buffedDeathStrikes} / ${this.buffedDeathStrikes + this.unbuffedDeathStrikes}`}
        label='empowered Death Strikes'
        tooltip={`
          Resulting in ${formatNumber(this.damage)} additional damage and ${formatNumber(this.heal)} additional healing.<br/>
          You gained ${this.gainedBuffs} and wasted ${this.wastedBuffs} stacks.
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default Hemostasis;
