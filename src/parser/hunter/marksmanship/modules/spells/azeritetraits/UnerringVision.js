import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import CriticalStrike from 'interface/icons/CriticalStrike';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber } from 'common/format';

const unerringVisionStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.UNERRING_VISION.id, rank);
  obj.crit += crit;
  return obj;
}, {
  crit: 0,
});

const MAX_STACKS = 10;

/** Unerring Vision
 * While Trueshot is active you gain 158 Critical Strike rating every sec, stacking up to 10 times.
 *
 * Example log: https://www.warcraftlogs.com/reports/47LJvZ9BgdhR8TXf#fight=43&type=summary&source=16
 */
class UnerringVision extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  crit = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UNERRING_VISION.id);
    if (!this.active) {
      return;
    }
    const { crit } = unerringVisionStats(this.selectedCombatant.traitsBySpellId[SPELLS.UNERRING_VISION.id]);
    this.crit = crit;

    this.statTracker.add(SPELLS.UNERRING_VISION_BUFF.id, {
      crit,
    });
  }

  get uptime() {
    return this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.UNERRING_VISION_BUFF.id) / this.owner.fightDuration;
  }

  get avgCrit() {
    return this.uptime * this.crit;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        category={'AZERITE_POWERS'}
      >
        <BoringSpellValueText spell={SPELLS.UNERRING_VISION}>
          <>
            <CriticalStrike /> {formatNumber(this.avgCrit)}
            <small> average Crit gained</small>
            <br />
            <CriticalStrike />
            <small> up to</small>
            {formatNumber(this.crit * MAX_STACKS)}
            <small> Crit gained</small>
          </>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }

}

export default UnerringVision;
