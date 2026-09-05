import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SoulFragmentsTracker from '../features/SoulFragmentsTracker';

class SoulsOvercap extends Analyzer {
  static dependencies = {
    soulFragmentsTracker: SoulFragmentsTracker,
  };

  protected soulFragmentsTracker!: SoulFragmentsTracker;

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.soulFragmentsTracker.soulsGenerated
        ? this.soulFragmentsTracker.overcap / this.soulFragmentsTracker.soulsGenerated
        : 0,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  wastedPercent() {
    return this.soulFragmentsTracker.soulsGenerated
      ? this.soulFragmentsTracker.overcap / this.soulFragmentsTracker.soulsGenerated
      : 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip={
          <>
            You generated {formatNumber(this.soulFragmentsTracker.overcap)} souls at cap.
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            Total Soul Fragments generated: {formatNumber(this.soulFragmentsTracker.soulsGenerated)}
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            Total Soul Fragments spent: {formatNumber(this.soulFragmentsTracker.soulsSpent)}
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            At the end of the fight, you had {formatNumber(
              this.soulFragmentsTracker.currentSouls,
            )}{' '}
            unused Soul Fragments.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SOUL_FRAGMENT_DEVOUR}>
          <>
            {formatPercentage(this.wastedPercent())}% <small>souls over cap</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulsOvercap;
