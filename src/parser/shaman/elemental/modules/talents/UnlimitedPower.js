import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import UnlimitedPowerTimesByStacks from 'parser/shaman/elemental/modules/talents/UnlimitedPowerTimesByStacks';

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
    return this.selectedCombatant.getBuffUptime(SPELLS.UNLIMITED_POWER_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return this.unlimitedPowerTimesByStacks.averageUnlimitedPowerStacks*HASTE_PER_STACK;
  }

  statistic() {

      return (
        <ExpandableStatisticBox
          icon={<SpellIcon id={SPELLS.UNLIMITED_POWER_TALENT.id} />}
          value={`${formatPercentage(this.averageHaste)} %`}
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
