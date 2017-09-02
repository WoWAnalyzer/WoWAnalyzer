import React from 'react';
import Module from 'Parser/Core/Module';
import Icon from 'common/Icon';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Energy from '../Features/Energy';

class EnergyWaste extends Module {
  static dependencies = {
    energy: Energy,
  };
  statistic() {
    const energyWasted = this.energy.energyWastedFromBOB + this.energy.energyWastedFromMax;
    const hasBoB = this.owner.selectedCombatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id);
    return (
      <StatisticBox
        icon={<Icon icon="class_monk" alt="Energy" />}
        value={`${formatNumber(energyWasted)}`}
        label='Total wasted energy'
        tooltip={`You were at max energy for a total of <b>${this.energy.timeAtMaxEnergy.toFixed(2)}s</b> you should try to use abilities slightly earlier to avoid capping.
          <ul>
            <li>Total energy wasted from not being able to regen at max energy: ${formatNumber(this.energy.energyWastedFromMax)}</li>
            ${hasBoB ? `<li>Total energy wasted from Black Ox Brew: ${formatNumber(this.energy.energyWastedFromBOB)}*</li>` : ''}
          </ul>
          ${hasBoB ? '<i>*This may not match exactly with WCL due to differences in how energy is calculated</i>' : ''}
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

}

export default EnergyWaste;
