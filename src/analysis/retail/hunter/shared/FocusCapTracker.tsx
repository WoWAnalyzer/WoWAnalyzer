import { t } from '@lingui/macro';
import { formatPercentage, formatThousands } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Tooltip } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import RegenResourceCapTracker from 'parser/shared/modules/resources/resourcetracker/RegenResourceCapTracker';
import FlushLineChart from 'parser/ui/FlushLineChart';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { AutoSizer } from 'react-virtualized';

import { HUNTER_BASE_FOCUS_MAX, HUNTER_BASE_FOCUS_REGEN } from './constants';

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating focus of hunters.
 * Taking into account the effect of buffs, talents, and items on the focus cost of abilities, the maximum focus amount, and the regeneration rate.
 */
class FocusCapTracker extends RegenResourceCapTracker {
  static dependencies = {
    ...RegenResourceCapTracker.dependencies,
  };

  static resourceType = RESOURCE_TYPES.FOCUS;
  static baseRegenRate = HUNTER_BASE_FOCUS_REGEN;
  static isRegenHasted = true;
  bySecond: { [key: number]: number } = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onEnergizeByPlayer);
  }

  get wastedPercent() {
    return this.missedRegen / this.naturalRegen || 0;
  }

  get focusNaturalRegenWasteThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  currentMaxResource() {
    return HUNTER_BASE_FOCUS_MAX;
  }

  onEnergizeByPlayer(event: ResourceChangeEvent) {
    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = this.bySecond[secondsIntoFight] || this.current;
  }

  onCast(event: CastEvent) {
    super.onCast(event);
    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = this.bySecond[secondsIntoFight] || this.current;
  }

  onDamage(event: DamageEvent) {
    super.onDamage(event);
    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = this.bySecond[secondsIntoFight] || this.current;
  }

  suggestions(when: When) {
    when(this.focusNaturalRegenWasteThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You're allowing your focus to reach its cap. While at its maximum value you miss out on
          the focus that would have regenerated. Although it can be beneficial to let focus pool
          ready to be used at the right time, try to spend some before it reaches the cap.
        </>,
      )
        .icon('ability_hunter_focusfire')
        .actual(
          t({
            id: 'hunter.marksmanship.suggestions.focusCapTracker.focusLost',
            message: `${formatPercentage(1 - actual)}% regenerated focus lost due to being capped.`,
          }),
        )
        .recommended(`<${formatPercentage(1 - recommended, 0)}% is recommended.`),
    );
  }

  statistic() {
    const data = Object.entries(this.bySecond).map(([sec, val]) => ({ time: sec, val: val }));
    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(1)}
        wide
        style={{ marginBottom: 20, overflow: 'hidden' }} // since this is in a group, reducing margin should be fine
        large={false}
        ultrawide={false}
      >
        <Tooltip
          content={
            <>
              Natural Focus regen lost: <strong>{formatThousands(this.missedRegen)}</strong> <br />{' '}
              That is <strong>{formatPercentage(this.wastedPercent)}%</strong> of natural
              regenerated focus over the course of the encounter.
            </>
          }
        >
          <div className="flex">
            <div className="flex-sub icon">
              <img src="/img/bullseye.png" alt="Focus" />
            </div>
            <div className="flex-sub value" style={{ width: 100 }}>
              Focus
            </div>
            <div className="flex-main chart">
              {this.missedRegen > 0 && (
                <AutoSizer disableWidth>
                  {({ height }) => (
                    <FlushLineChart
                      data={data}
                      duration={this.owner.fightDuration / 1000}
                      height={height}
                    />
                  )}
                </AutoSizer>
              )}
            </div>
          </div>
        </Tooltip>
      </StatisticBar>
    );
  }
}

export default FocusCapTracker;
