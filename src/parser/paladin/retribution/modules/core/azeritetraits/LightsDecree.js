import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

const AW_BASE_DURATION = 20;
const CRUSADE_BASE_DURATION = 25;

/** 
 * Spending Holy Power during Avenging Wrath causes you to explode with Holy light for 508 damage per Holy Power spent to nearby enemies.
 * Avenging Wrath's duration is increased by 5 sec.
 */
class LightsDecree extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
	};

  baseDuration = AW_BASE_DURATION;
  hasCrusade = false;

 	constructor(...args) {
 		super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LIGHTS_DECREE.id);
    this.hasCrusade = this.selectedCombatant.hasTalent(SPELLS.CRUSADE_TALENT.id);
 		if (!this.active) {
 			return;
 		}
 		if (this.hasCrusade) {
 			this.baseDuration = CRUSADE_BASE_DURATION;
 		}
 	}

  get damageDone() {
    const spell = this.abilityTracker.getAbility(SPELLS.LIGHTS_DECREE_DAMAGE.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  get totalDurationIncrease() {
    const buffId = this.selectedCombatant.hasTalent(SPELLS.CRUSADE_TALENT.id) ? SPELLS.CRUSADE_TALENT.id : SPELLS.AVENGING_WRATH.id;
    const hist = this.selectedCombatant.getBuffHistory(buffId);
    if (!hist || hist.length === 0) {
      return null;
    }
    let totalIncrease = 0;
    hist.forEach((buff) => {
      const end = buff.end || this.owner.currentTimestamp;
      const duration = (end - buff.start) / 1000;
      const increase = Math.max(0, duration - this.baseDuration);
      totalIncrease += increase;
    });
    return totalIncrease;
  }

  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.damageDone);
    const dps = this.damageDone / this.owner.fightDuration * 1000;
    const spellId = this.hasCrusade ? SPELLS.CRUSADE_TALENT.id : SPELLS.AVENGING_WRATH.id;
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={`Damage done: ${formatNumber(this.damageDone)}`}
      >
        <BoringSpellValueText spell={SPELLS.LIGHTS_DECREE}>
        <img
          src="/img/sword.png"
          alt="Damage"
          className="icon"
        /> {formatNumber(dps)} DPS <small>{formatPercentage(damageThroughputPercent)} % of total</small>
          <br />
          <SpellIcon id={spellId} /> +{formatNumber(this.totalDurationIncrease)} seconds
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
 	}
}

export default LightsDecree;
