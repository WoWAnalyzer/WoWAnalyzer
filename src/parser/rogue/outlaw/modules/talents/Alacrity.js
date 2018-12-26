import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox from 'interface/others/StatisticBox';
import AlacrityTimesByStacks from 'parser/rogue/outlaw/modules/talents/AlacrityTimesByStacks';

const HASTE_PER_STACK = 0.02;

class Alacrity extends Analyzer {

  static dependencies = {
    alacrityTimesByStacks: AlacrityTimesByStacks,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ALACRITY_TALENT.id);
  }


  get alacrityTimesByStack() {
    return this.alacrityTimesByStacks.alacrityTimesByStacks;
  }


  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ALACRITY_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return this.alacrityTimesByStacks.averageAlacrityStacks*HASTE_PER_STACK;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ALACRITY_TALENT.id} />}
        value={`${formatPercentage(this.averageHaste)} %`}
        label={`Alacrity Average Haste Gain (Uptime ${formatPercentage(this.uptime)}%) `}
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
            {Object.values(this.alacrityTimesByStack).map((e, i) => (
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

}

export default Alacrity;
