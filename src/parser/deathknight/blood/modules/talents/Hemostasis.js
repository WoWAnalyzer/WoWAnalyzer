import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events from 'parser/core/Events';

const MAX_BUFF_STACKS = 5;
const PERCENT_BUFF = 0.08;

class Hemostasis extends Analyzer {
  buffedDeathStrikes = 0;
  unbuffedDeathStrikes = 0;
  buffStack = 0;
  wastedBuffs = 0;
  gainedBuffs = 0;
  damage=0;
  heal=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HEMOSTASIS_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DEATH_STRIKE_HEAL), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DEATH_STRIKE, SPELLS.BLOOD_BOIL]), this.onDamage);
  }

  onHeal(event) {
    if(this.buffStack > 0){
      this.heal += calculateEffectiveHealing(event, PERCENT_BUFF * this.buffStack);
    }
  }

  onDamage(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.DEATH_STRIKE.id) {
      if(this.buffStack > 0){
        this.buffedDeathStrikes += 1;
        this.damage += calculateEffectiveDamage(event, PERCENT_BUFF * this.buffStack);
        this.buffStack = 0;
        return;
      }
      this.unbuffedDeathStrikes += 1;
    }

    if (spellID === SPELLS.BLOOD_BOIL.id) {
      if (this.buffStack === MAX_BUFF_STACKS) {
        this.wastedBuffs += 1;
      } else {
        this.buffStack += 1;
        this.gainedBuffs += 1;
      }
    }
  }


  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.HEMOSTASIS_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(2)}
        value={`${this.buffedDeathStrikes} / ${this.buffedDeathStrikes + this.unbuffedDeathStrikes}`}
        label="Death Strikes with Hemostasis"
        tooltip={(
          <>
            Resulting in {formatNumber(this.damage)} additional damage and {formatNumber(this.heal)} additional healing.<br />
            You gained {this.gainedBuffs} and wasted {this.wastedBuffs} stacks.
          </>
        )}
      />
    );
  }
}

export default Hemostasis;
