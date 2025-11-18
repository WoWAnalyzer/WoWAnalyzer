import { formatPercentage } from 'common/format';
import CrossIcon from 'interface/icons/Cross';
import { Options } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks the amount of cancelled casts in %.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 */
class CancelledCasts extends CoreCancelledCasts {
  constructor(options: Options) {
    super(options);
    this.IGNORED_ABILITIES = [
      //Include the spells that you do not want to be tracked and spells that are castable while casting
      ...CASTS_THAT_ARENT_CASTS,
    ];
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.cancelledPercentage,
      isLessThan: {
        minor: 0.975,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    const tooltipText = Object.values(this.cancelledSpellList).map((cancelledSpell) => (
      <li key={cancelledSpell.spellName}>
        {cancelledSpell.spellName}: {cancelledSpell.amount}
      </li>
    ));

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(14)}
        size="flexible"
        tooltip={
          <>
            You started casting a total of {this.totalCasts} spells with a cast timer. You cancelled{' '}
            {this.castsCancelled} of those casts.
            <ul>{tooltipText}</ul>
          </>
        }
      >
        <BoringValueText label="Cancelled Casts">
          <CrossIcon /> {formatPercentage(this.cancelledPercentage)}% <small>casts cancelled</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default CancelledCasts;
