import React from 'react';
import Module from 'Parser/Core/Module';
import Icon from 'common/Icon';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Energy, { MAX_ENERGY } from '../Features/Energy';

class EnergyWaste extends Module {
  static dependencies = {
    energy: Energy,
  };

  suggestions(when) {
    const totalEnergy = this.energy.totalEnergyRegen + (this.energy.bobCasts * 100);
    const energyWastedFromRegenPerc = this.energy.energyWastedFromMax / totalEnergy;
    const energyWastedFromBobPerc = (this.energy.energyWastedFromBOB / this.energy.bobCasts) / MAX_ENERGY;
    
    when(energyWastedFromRegenPerc).isGreaterThan(0.05)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You wasted {formatPercentage(actual)}% of possible energy during the fight. You should try to prevent capping on energy (hitting 100 energy) to make best use of it.</span>)
          .icon('class_monk')
          .actual(`${formatPercentage(actual)}% wasted`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.1);
      });
    
    this.energy.bobCasts > 0 && 
    when(energyWastedFromBobPerc).isGreaterThan(0.4)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You wasted more than {formatPercentage(actual)}% of energy from <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} />. You should try to use this ability at lower energy levels in order to make best use of the energy.</span>)
          .icon('class_monk')
          .actual(`${formatPercentage(actual)}% wasted`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });
  }

  statistic() {
    const energyWasted = this.energy.energyWastedFromBOB + this.energy.energyWastedFromMax;
    const hasBoB = this.owner.selectedCombatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id);
    const totalEnergy = this.energy.totalEnergyRegen + (this.energy.bobCasts * 100);
    return (
      <StatisticBox
        icon={<Icon icon="class_monk" alt="Energy" />}
        value={`${formatPercentage(energyWasted/totalEnergy)}%`}
        label='Total wasted energy'
        tooltip={`Total possible energy generated from the fight <b>${formatNumber(totalEnergy)}<b> of that a total of <b>${formatNumber(energyWasted)}<b> energy was wasted:
          <ul>
            <li>Total energy wasted from being capped at max energy: ${formatNumber(this.energy.energyWastedFromMax)}</li>
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
