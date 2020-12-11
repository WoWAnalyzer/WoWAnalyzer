import React from 'react';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import UnlimitedPowerTimesByStacks from 'parser/shaman/elemental/modules/talents/UnlimitedPowerTimesByStacks';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const HASTE_PER_STACK = 0.02;

class UnlimitedPower extends Analyzer {

  static dependencies = {
    unlimitedPowerTimesByStacks: UnlimitedPowerTimesByStacks,
  };

  protected unlimitedPowerTimesByStacks!: UnlimitedPowerTimesByStacks;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNLIMITED_POWER_TALENT.id);
  }

  get unlimitedPowerTimesByStack() {
    return this.unlimitedPowerTimesByStacks.unlimitedPowerTimesByStacks;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.UNLIMITED_POWER_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return this.unlimitedPowerTimesByStacks.averageUnlimitedPowerStacks * HASTE_PER_STACK;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={(
          <>
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
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.UNLIMITED_POWER_TALENT}>
          <>
            Unlimited Power Average Haste Gain (Uptime {formatPercentage(this.uptime)}%)
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UnlimitedPower;
