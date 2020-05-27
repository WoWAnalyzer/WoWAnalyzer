import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import CriticalStrike from 'interface/icons/CriticalStrike';
import Statistic from 'interface/statistics/Statistic';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const unerringVisionStats = (traits: number[]) => Object.values(traits).reduce((obj, rank) => {
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
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=274447
 */
class UnerringVision extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  crit = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UNERRING_VISION.id);
    if (!this.active) {
      return;
    }
    const { crit } = unerringVisionStats(this.selectedCombatant.traitsBySpellId[SPELLS.UNERRING_VISION.id]);
    this.crit = crit;

    options.statTracker.add(SPELLS.UNERRING_VISION_BUFF.id, {
      crit: this.crit,
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
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
      >
        <BoringSpellValueText spell={SPELLS.UNERRING_VISION}>
          <>
            <CriticalStrike /> {formatNumber(this.avgCrit)}<small> average Crit gained</small><br />
            <CriticalStrike /><small> up to</small> {formatNumber(this.crit * MAX_STACKS)}<small> Crit gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default UnerringVision;
