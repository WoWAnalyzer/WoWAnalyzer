import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

import SpellUsable from '../features/SpellUsable';
import ExecuteRange from './Execute/ExecuteRange';

/**
 * Logs used to test:
 *
 * 0 wasted buffs: https://www.warcraftlogs.com/reports/YF9MzcnWXd4ak7vC/#fight=1&source=25
 * 4/15 wasted: https://www.warcraftlogs.com/reports/qAK2R8kZg9DL1YFm/#fight=27&source=1113&type=summary&graph=true
 *
 */

class OverpowerAnalyzer extends Analyzer {
  static dependencies = {
    executeRange: ExecuteRange,
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  protected executeRange!: ExecuteRange;
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  overpowerCasts = 0;
  wastedProc = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OVERPOWER),
      this._onOverpowerCast,
    );
  }

  get WastedOverpowerThresholds() {
    return {
      actual: this.wastedProc / this.overpowerCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  _onOverpowerCast(event: CastEvent) {
    this.overpowerCasts += 1;
    const overpower = this.selectedCombatant.getBuff(SPELLS.OVERPOWER.id);

    if (
      !(
        overpower &&
        overpower.stacks === 2 &&
        this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id)
      )
    ) {
      return;
    }

    // if not in execute and stacks were at two when overpower was casted then a proc is considered wasted
    if (!this.executeRange.isTargetInExecuteRange(event.targetID || 0, event.targetInstance || 0)) {
      this.wastedProc += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason =
        'This Overpower was used while already at 2 stacks and Mortal Strike was available';
    }
  }

  suggestions(when: When) {
    when(this.WastedOverpowerThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid using <SpellLink spell={SPELLS.OVERPOWER} icon /> at 2 stacks when{' '}
          <SpellLink spell={SPELLS.MORTAL_STRIKE} icon /> is available. Use your stacks of Overpower
          with Mortal Strike to avoid over stacking, which result in a loss of damage.
        </>,
      )
        .icon(SPELLS.OVERPOWER.icon)
        .actual(
          t({
            id: 'warrior.arms.suggestions.overpower.stacksWasted',
            message: `${formatPercentage(actual)}% of Overpower stacks were wasted.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon spell={SPELLS.OVERPOWER} />}
        label="Overpower Buffs Wasted"
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={
          <>
            {this.wastedProc} <small>wasted buffs</small>
            <br />
            {this.overpowerCasts} <small>total casts</small>
          </>
        }
        tooltip={
          <>
            The overpower buff caps at two stacks. When at cap, casting Overpower will waste a buff
            stack. This is not important during execute phase as Mortal Strike is replaced with
            Execute which does not consume Overpower buff stacks.
          </>
        }
      />
    );
  }
}

export default OverpowerAnalyzer;
