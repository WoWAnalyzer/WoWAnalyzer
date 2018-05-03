import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage, formatDuration } from 'common/format';
import BoneShieldTimesByStacks from '../Features/BoneShieldTimesByStacks';

const HP_PER_BONE_SHIELD_STACK = 0.02;

class FoulBulwark extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FOUL_BULWARK_TALENT.id);
  }

  get boneShieldTimesByStack() {
    return this.boneShieldTimesByStacks.boneShieldTimesByStacks;
  }

  get averageFoulBullwark() {
    let avgStacks = 0;
    this.boneShieldTimesByStack.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b) / this.owner.fightDuration * index;
    });
    return formatPercentage(avgStacks * HP_PER_BONE_SHIELD_STACK);
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.FOUL_BULWARK_TALENT.id} />}
        value={`${this.averageFoulBullwark}%`}
        label="average Foul Bulwark buff"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>HP-bonus</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {this.boneShieldTimesByStack.map((e, i) =>
              <tr key={i}>
                <th>{(i * HP_PER_BONE_SHIELD_STACK * 100).toFixed(0)}%</th>
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

export default FoulBulwark;
