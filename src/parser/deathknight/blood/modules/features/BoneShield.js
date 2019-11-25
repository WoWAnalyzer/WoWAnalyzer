import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticBox from 'interface/others/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoneShieldTimesByStacks from './/BoneShieldTimesByStacks';


class BoneShield extends Analyzer {

  static dependencies = {
    statTracker: StatTracker,
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
  };


  get boneShieldTimesByStack() {
    return this.boneShieldTimesByStacks.boneShieldTimesByStacks;
  }


  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BONE_SHIELD.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Bone Shield uptime can be improved. Try to keep it up at all times.')
          .icon(SPELLS.BONE_SHIELD.icon)
          .actual(`${formatPercentage(actual)}% Bone Shield uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {

      return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.BONE_SHIELD.id} />}
          value={`${formatPercentage(this.uptime)} %`}
          label="Bone Shield uptime"
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
              {Object.values(this.boneShieldTimesByStack).map((e, i) => (
                <tr key={i}>
                  <th>{i}</th>
                  <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                  <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </StatisticBox>

      );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default BoneShield;
