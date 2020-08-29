import React from 'react';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatPercentage, formatThousands } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Tooltip from 'common/Tooltip';
import RegenResourceCapTracker from 'parser/shared/modules/RegenResourceCapTracker';
import SpellFocusCost from 'parser/hunter/shared/modules/resources/SpellFocusCost';
import StatisticBar from 'interface/statistics/StatisticBar';

import { AutoSizer } from 'react-virtualized';
import { XYPlot, AreaSeries } from 'react-vis';
import groupDataForChart from 'common/groupDataForChart';
import { CastEvent, DamageEvent, EnergizeEvent } from 'parser/core/Events';

const BASE_FOCUS_REGEN = 3;

const BASE_FOCUS_MAX = 100;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating focus of hunters.
 * Taking into account the effect of buffs, talents, and items on the focus cost of abilities,
 * the maximum focus amount, and the regeneration rate.
 */
class FocusCapTracker extends RegenResourceCapTracker {
  static dependencies = {
    ...RegenResourceCapTracker.dependencies,
    // Needed for the `resourceCost` prop of events
    spellResourceCost: SpellFocusCost,
  };

  protected spellResourceCost!: SpellFocusCost;

  static resourceType = RESOURCE_TYPES.FOCUS;
  static baseRegenRate = BASE_FOCUS_REGEN;
  static isRegenHasted = true;

  currentMaxResource() {
    return BASE_FOCUS_MAX;
  }

  get wastedPercent() {
    return (this.missedRegen / this.naturalRegen) || 0;
  }

  bySecond: {[key: number]: number} = {};

  on_byPlayer_energize(event: EnergizeEvent) {
    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || this.current);
  }

  on_byPlayer_cast(event: CastEvent) {
    super.on_byPlayer_cast(event);
    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || this.current);
  }

  on_byPlayer_damage(event: DamageEvent) {
    super.on_byPlayer_damage(event);
    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || this.current);
  }

  get focusNaturalRegenWasteThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.focusNaturalRegenWasteThresholds).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>You're allowing your focus to reach its cap. While at its maximum value you miss out on the focus that would have regenerated. Although it can be beneficial to let focus pool ready to be used at the right time, try to spend some before it reaches the cap.</>)
        .icon('ability_hunter_focusfire')
        .actual(`${formatPercentage(1 - actual)}% regenerated focus lost due to being capped.`)
        .recommended(`<${formatPercentage(recommended, 0)}% is recommended.`);
    });
  }

  statistic() {
    const groupedData: any = groupDataForChart(this.bySecond, this.owner.fightDuration);
    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(1)}
        wide
        style={{ marginBottom: 20, overflow: 'hidden' }} // since this is in a group, reducing margin should be fine
        large={false}
        ultrawide={false}
      >
        <Tooltip content={<>Natural Focus regen lost: <strong>{formatThousands(this.missedRegen)}</strong> <br /> That is <strong>{formatPercentage(this.wastedPercent)}%</strong> of natural regenerated focus over the course of the encounter.</>}>
          <div className="flex">
            <div className="flex-sub icon">
              <img
                src="/img/bullseye.png"
                alt="Focus"
              />
            </div>
            <div
              className="flex-sub value"
              style={{ width: 100 }}
            >
              Focus
            </div>
            <div className="flex-main chart">
              {this.missedRegen > 0 && (
                <AutoSizer>
                  {({ width, height}) => (
                    <XYPlot
                      margin={0}
                      width={width}
                      height={height}
                    >
                      <AreaSeries
                        data={Object.keys(groupedData).map(x => ({
                          x: +x / width,
                          y: groupedData[x],
                        }))}
                        className="primary"
                      />
                    </XYPlot>
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
