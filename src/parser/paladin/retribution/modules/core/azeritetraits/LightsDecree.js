import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';

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

 	constructor(...args) {
 		super(...args);
 		this.active = this.selectedCombatant.hasTrait(SPELLS.LIGHTS_DECREE.id);
 		if (!this.active) {
 			return;
 		}
 		if (this.selectedCombatant.hasTalent(SPELLS.CRUSADE_TALENT.id)) {
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
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LIGHTS_DECREE.id}
        value={(
          <>
            {formatPercentage(damageThroughputPercent)} % / {formatNumber(dps)} DPS <br />
            {formatDuration(this.totalDurationIncrease)} Total Duration Increase
          </>
        )}
        tooltip={`Damage done: ${formatNumber(this.damageDone)}`}
      />
    );
 	}
}

export default LightsDecree;
