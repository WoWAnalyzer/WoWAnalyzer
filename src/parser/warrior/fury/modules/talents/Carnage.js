import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const DAMAGE_BONUS = 0.15;
const RAGE_REDUCTION_RATIO = 75 / 85;

class Carnage extends Analyzer {
  damage = 0;
  rampageCasts = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTalent(SPELLS.CARNAGE_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAMPAGE), this.onRampageCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.RAMPAGE_1, SPELLS.RAMPAGE_2, SPELLS.RAMPAGE_3, SPELLS.RAMPAGE_4]), this.onRampageDamage);
  }

  onRampageCast() {
    this.rampageCasts += 1;
  }

  onRampageDamage(event) {
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get additionalRampageCasts() {
    return this.rampageCasts - Math.floor(this.rampageCasts * RAGE_REDUCTION_RATIO);
  }
  
  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.CARNAGE_TALENT.id}
        value={`${formatNumber(this.damage)} damage`}
        label="Carnage"
        tooltip={`Carnage allowed you to use Rampage <b>~${this.additionalRampageCasts}</b> additional times and contributed to <b>${formatPercentage(this.damagePercent)}%</b> of your overall damage.`}
      />
    );
  }
}

export default Carnage;