import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatDuration, formatNumber } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import PainbringerTimesByStacks from './PainbringerTimesByStacks';
import PainbringerStacksBySeconds from './PainbringerTimesByStacks';


class Painbringer extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    painbringerTimesByStacks: PainbringerTimesByStacks,
    painbringerStacksBySeconds: PainbringerStacksBySeconds,
  };


  get painbringerTimesByStack() {
    return this.painbringerTimesByStacks.painbringerTimesByStacks;
  }

  get painbringerAvgStack() {
    return this.painbringerStacksBySeconds.totalPainbringerStacks / this.painbringerStacksBySeconds.stackChanges;
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.PAINBRINGER_Buff.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.70,
        average: 0.65,
        major: .6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Painbringer uptime can be improved. Try to keep it up at all times.')
          .icon(SPELLS.PAINBRINGER.icon)
          .actual(`${formatPercentage(actual)}% Painbringer uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    console.log("stack avg #", this.painbringerTimesByStack.painbringerTimesByStacks);
      return (
        <ExpandableStatisticBox
          icon={<SpellIcon id={SPELLS.PAINBRINGER.id} />}
          value={`${formatPercentage(this.painbringerTimesByStack[5].reduce((a, b) => a + b, 0) / this.owner.fightDuration)} %`}
          label="Painbringer Uptime At 5 Stacks"
          tooltip={`Average Painbringer Stacks: <b>${formatNumber(this.painbringerAvgStack)}</b></br>
                    Total Buff Uptime: <b>${formatPercentage(this.uptime)}</b> %`}
        >
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Stacks</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
              {this.painbringerTimesByStack.map((e, i) =>
                <tr key={i}>
                  <th>{i}</th>
                  <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                  <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </ExpandableStatisticBox>
      );

    }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Painbringer;
