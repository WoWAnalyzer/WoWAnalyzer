import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticGroup from 'parser/ui/StatisticGroup';

import PaladinAbilityTracker from '../core/PaladinAbilityTracker';

class CastBehavior extends Analyzer {
  static dependencies = {
    abilityTracker: PaladinAbilityTracker,
  };

  protected abilityTracker!: PaladinAbilityTracker;

  get iolProcsPerHolyShockCrit() {
    return 1;
  }

  iolCastRatioChart() {
    const abilityTracker = this.abilityTracker;
    const getAbility = (spellId: number) => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const holyShockHeal = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);
    const holyShockDamage = getAbility(SPELLS.HOLY_SHOCK_DAMAGE.id);
    const judgment = getAbility(SPELLS.JUDGMENT_CAST_HOLY.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const iolJudgments = judgment.healingIolHits || 0;
    const totalIolUsages = iolFlashOfLights + iolHolyLights + iolJudgments;

    const holyShockCasts = (holyShockHeal.healingHits || 0) + (holyShockDamage.damageHits || 0);
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
        color: '#F8b700',
        label: SPELLS.JUDGMENT_CAST_HOLY.name,
        spellId: SPELLS.JUDGMENT_CAST_HOLY.id,
        value: iolJudgments,
      },
      {
        color: '#A93226',
        label: <Trans id="paladin.holy.modules.castBehavior.wastedProcs">Wasted procs</Trans>,
        tooltip: (
          <Trans id="paladin.holy.modules.castBehavior.wastedProcsDetails">
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
    const getAbility = (spellId: number) => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;

    const flashOfLightHeals = flashOfLight.casts || 0;
    const holyLightHeals = holyLight.casts || 0;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;
    const fillerHolyLights = holyLightHeals - iolHolyLights;

    if (fillerFlashOfLights + fillerHolyLights > 0) {
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
      ];

      return <DonutChart items={items} />;
    } else {
      return <div className="value">0 Filler Casts</div>;
    }
  }

  statistic() {
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.GENERAL} large={false} wide={false} style={{}}>
        <Statistic ultrawide>
          <div className="pad">
            <label>
              <Trans id="paladin.holy.modules.castBehavior.infusionOfLightUsage">
                <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} /> usage
              </Trans>
            </label>

            {this.iolCastRatioChart()}
          </div>
        </Statistic>
        <Statistic ultrawide>
          <div className="pad">
            <label>
              <Trans id="paladin.holy.modules.castBehavior.fillers">Fillers</Trans>
            </label>

            {this.fillerCastRatioChart()}
          </div>
        </Statistic>
      </StatisticGroup>
    );
  }
}

export default CastBehavior;
