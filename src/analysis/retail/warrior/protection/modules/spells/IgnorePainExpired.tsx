import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import IgnorePainTracker from './IgnorePainTracker';

/**
 * IP wasted due to it expiring.
 * Ignore Pain (IP) grants a buff that is a shield. If the buff expires you just lose all the shield. This just tracks that
 */
class IgnorePainExpired extends Analyzer {
  static dependencies = {
    ignorePainTracker: IgnorePainTracker,
  };

  protected ignorePainTracker!: IgnorePainTracker;

  ignorePainWasted: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.IGNORE_PAIN),
      this.ignorePainExpired,
    );
  }

  ignorePainExpired(event: RemoveBuffEvent) {
    this.ignorePainWasted += event.absorb || 0;
  }

  statistic() {
    const percentOfTotalWasted = formatPercentage(
      this.ignorePainWasted / this.ignorePainTracker.totalIgnorePainGained,
    );

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            When <SpellLink spell={SPELLS.IGNORE_PAIN} /> expires you lose all the remaining shield
            it had. This gives you an idea of how much you lost. <br />
            Total Ignore Pain Gained: {formatNumber(
              this.ignorePainTracker.totalIgnorePainGained,
            )}{' '}
            <br />
            Total Ignore Pain Wasted: {formatNumber(this.ignorePainWasted)}
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.IGNORE_PAIN} /> Ignore Pain Expired
            </>
          }
        >
          {formatNumber(this.ignorePainWasted)} <small> {percentOfTotalWasted} % </small>
          <br />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default IgnorePainExpired;
