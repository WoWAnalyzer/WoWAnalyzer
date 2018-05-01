import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage, formatDuration } from 'common/format';
import BoneShieldStacksBySeconds from '../Features/BoneShieldStacksBySeconds';

const HP_PER_BONE_SHIELD_STACK = 0.01;
const MAX_BONE_SHIELD_STACKS = 10;
const MAX_BONE_SHIELD_STACKS_OSSUARY = 15;

class FoulBulwark extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    boneShieldStacksBySeconds: BoneShieldStacksBySeconds,
  };

  maxStacks = MAX_BONE_SHIELD_STACKS;

  on_initialized() {
    //just in case blizzard decides to move talents around or add a legendary-ring in BfA
    this.maxStacks = this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id) ? MAX_BONE_SHIELD_STACKS_OSSUARY : MAX_BONE_SHIELD_STACKS;
    this.active = this.combatants.selected.hasTalent(SPELLS.FOUL_BULWARK_TALENT.id);
  }

  get boneShieldStacks() {
    return this.boneShieldStacksBySeconds.boneShieldStacksBySeconds;
  }

  get averageFoulBullwark() {
    const sum = this.boneShieldStacks.reduce((a, b) => a + b, 0);
    return formatPercentage(sum * HP_PER_BONE_SHIELD_STACK / this.boneShieldStacks.length);
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
            {Array.from({length: this.maxStacks + 1}, (x, i) => i).map((e, i) =>
              <tr key={i}>
                <th>{formatPercentage(i * HP_PER_BONE_SHIELD_STACK)}%</th>
                <td>{formatDuration(this.boneShieldStacks.filter(e => e === i).length)}</td>
                <td>{formatPercentage(this.boneShieldStacks.filter(e => e === i).length / Math.ceil(this.owner.fightDuration / 1000))}%</td>
              </tr>
            )}
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default FoulBulwark;
