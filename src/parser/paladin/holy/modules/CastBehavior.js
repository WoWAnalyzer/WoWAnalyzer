import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';

import PaladinAbilityTracker from './core/PaladinAbilityTracker';

class CastBehavior extends Analyzer {
  static dependencies = {
    abilityTracker: PaladinAbilityTracker,
  };

  get iolProcsPerHolyShockCrit() {
    return 1;
  }

  iolCastRatioChart() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const holyShockCast = getAbility(SPELLS.HOLY_SHOCK_CAST.id);
    const holyShockHeal = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);
    const holyShockDamage = getAbility(SPELLS.HOLY_SHOCK_DAMAGE.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const totalIolUsages = iolFlashOfLights + iolHolyLights;

    const holyShockCasts = holyShockCast.casts || 0;
    const holyShockCrits =
      (holyShockHeal.healingCriticalHits || 0) + (holyShockDamage.damageCriticalHits || 0);
    const iolProcsPerHolyShockCrit = this.iolProcsPerHolyShockCrit;
    const totalIolProcs = holyShockCrits * iolProcsPerHolyShockCrit;
    const unusedProcs = totalIolProcs - totalIolUsages;

    const items = [
      {
        color: '#FFFDE7',
        label: SPELLS.FLASH_OF_LIGHT.name,
        spellId: SPELLS.FLASH_OF_LIGHT.id,
        value: iolFlashOfLights,
      },
      {
        color: '#F57C00',
        label: SPELLS.HOLY_LIGHT.name,
        spellId: SPELLS.HOLY_LIGHT.id,
        value: iolHolyLights,
      },
      {
        color: '#A93226',
        label: <Trans>Wasted procs</Trans>,
        tooltip: (
          <Trans>
            The amount of Infusion of Lights you did not use out of the total available. You cast{' '}
            {holyShockCasts} Holy Shocks with a {formatPercentage(holyShockCrits / holyShockCasts)}%
            crit ratio. This gave you {totalIolProcs} Infusion of Light procs, of which you used{' '}
            {totalIolUsages}.
          </Trans>
        ),
        value: unusedProcs,
      },
    ];

    return <DonutChart items={items} />;
  }

  fillerCastRatioChart() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const lightOfTheMartyr = getAbility(SPELLS.LIGHT_OF_THE_MARTYR.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;

    const flashOfLightHeals = flashOfLight.casts || 0;
    const holyLightHeals = holyLight.casts || 0;
    const lightOfTheMartyrHeals = lightOfTheMartyr.casts || 0;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;
    const fillerHolyLights = holyLightHeals - iolHolyLights;

    const items = [
      {
        color: '#FFFDE7',
        label: SPELLS.FLASH_OF_LIGHT.name,
        spellId: SPELLS.FLASH_OF_LIGHT.id,
        value: fillerFlashOfLights,
      },
      {
        color: '#F57C00',
        label: SPELLS.HOLY_LIGHT.name,
        spellId: SPELLS.HOLY_LIGHT.id,
        value: fillerHolyLights,
      },
      {
        color: '#A93226',
        label: SPELLS.LIGHT_OF_THE_MARTYR.name,
        spellId: SPELLS.LIGHT_OF_THE_MARTYR.id,
        value: lightOfTheMartyrHeals,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <StatisticGroup position={STATISTIC_ORDER.CORE(40)}>
        <Statistic ultrawide>
          <div className="pad">
            <label>
              <Trans>
                <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> usage
              </Trans>
            </label>

            {this.iolCastRatioChart()}
          </div>
        </Statistic>
        <Statistic ultrawide>
          <div className="pad">
            <label>
              <Trans>Fillers</Trans>
            </label>

            {this.fillerCastRatioChart()}
          </div>
        </Statistic>
      </StatisticGroup>
    );
  }
}

export default CastBehavior;
