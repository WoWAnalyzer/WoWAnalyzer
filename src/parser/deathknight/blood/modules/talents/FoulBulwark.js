import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatDuration, formatPercentage } from 'common/format';
import BoneShieldTimesByStacks from '../features/BoneShieldTimesByStacks';

const HP_PER_BONE_SHIELD_STACK = 0.01;

class FoulBulwark extends Analyzer {
  static dependencies = {
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FOUL_BULWARK_TALENT.id);
  }

  get boneShieldTimesByStack() {
    return this.boneShieldTimesByStacks.boneShieldTimesByStacks;
  }

  get averageFoulBullwark() {
    return formatPercentage(this.boneShieldTimesByStacks.averageBoneShieldStacks * HP_PER_BONE_SHIELD_STACK);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.FOUL_BULWARK_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(3)}
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
            {this.boneShieldTimesByStack.map((e, i) => (
              <tr key={i}>
                <th>{(i * HP_PER_BONE_SHIELD_STACK * 100).toFixed(0)}%</th>
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default FoulBulwark;
