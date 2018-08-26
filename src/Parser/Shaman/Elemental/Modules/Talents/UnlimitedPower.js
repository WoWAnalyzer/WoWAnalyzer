import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import ExpandableStatisticBox from 'Interface/Others/ExpandableStatisticBox';
import UnlimitedPowerTimesByStacks from 'Parser/Shaman/Elemental/Modules/Talents/UnlimitedPowerTimesByStacks';

const HASTE_PER_STACK = 0.02;

class UnlimitedPower extends Analyzer {

  static dependencies = {
    unlimitedPowerTimesByStacks: UnlimitedPowerTimesByStacks,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNLIMITED_POWER_TALENT.id);
  }


  get unlimitedPowerTimesByStack() {
    return this.unlimitedPowerTimesByStacks.unlimitedPowerTimesByStacks;
  }


  get uptime() {
    return this.selectedCombatant.getBuffUptime(272737) / this.owner.fightDuration;
  }

  get averageHaste() {
    return this.unlimitedPowerTimesByStacks.averageUnlimitedPowerStacks*HASTE_PER_STACK;
  }

  statistic() {

      return (
        <ExpandableStatisticBox
          icon={<SpellIcon id={SPELLS.UNLIMITED_POWER_TALENT.id} />}
          value={`${formatPercentage(this.unlimitedPowerTimesByStacks.averageUnlimitedPowerStacks)} %`}
          label={`Unlimited Power Average Haste Gain (Uptime ${formatPercentage(this.uptime)}%) `}
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
              {Object.values(this.unlimitedPowerTimesByStack).map((e, i) => (
                <tr key={i}>
                  <th>{i}</th>
                  <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                  <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ExpandableStatisticBox>

      );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);

}

export default UnlimitedPower;
