import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { formatDuration, formatNumber } from 'common/format';
import DamageDone from 'parser/shared/modules/DamageDone';

const AW_BASE_DURATION = 20;
const CRUSADE_BASE_DURATION = 25;

/** 
 * Spending Holy Power during Avenging Wrath causes you to explode with Holy light for 508 damage per Holy Power spent to nearby enemies.
 * Avenging Wrath's duration is increased by 5 sec.
 */
class LightsDecree extends Analyzer {
	static dependencies = {
		damageDone: DamageDone,
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

 	get LDDamageDone() {
 		return this.damageDone.byAbility(SPELLS.LIGHTS_DECREE_DAMAGE.id);
      }

  get totalDurationIncrease() {
    const buffName = this.selectedCombatant.hasTalent(SPELLS.CRUSADE_TALENT.id) ? SPELLS.CRUSADE_TALENT : SPELLS.AVENGING_WRATH;
    const hist = this.selectedCombatant.getBuffHistory(buffName.id);
    let totalIncrease = 0;
    if (!hist || hist.length === 0) {
      return null;
    }
    hist.map((buff, idx) => {
      const end = buff.end || this.owner.currentTimestamp;
      const duration = (end - buff.start) / 1000;
      const increase = Math.max(0, duration - this.baseDuration);
      totalIncrease += increase;
    });
    return totalIncrease;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LIGHTS_DECREE.id}
        value={(
          <>
            {formatNumber(this.LDDamageDone)} Damage Done <br />
            {formatDuration(this.totalDurationIncrease)} Total Duration Increase
          </>
        )}
      />
    );
 	}
}

export default LightsDecree;
