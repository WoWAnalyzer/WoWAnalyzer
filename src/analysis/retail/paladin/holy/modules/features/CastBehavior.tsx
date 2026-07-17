import { Trans } from '@lingui/react/macro';
import SPELLS from 'common/SPELLS';
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

  fillerCastRatioChart() {
    const abilityTracker = this.abilityTracker;
    const getAbility = (spellId: number) => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;

    const flashOfLightHeals = flashOfLight.casts || 0;
    // Holy Light no longer consumes Infusion of Light, so every cast of it is a filler.
    const fillerHolyLights = holyLight.casts || 0;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;

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
      return (
        <div className="value">
          0 <small>filler casts</small>
        </div>
      );
    }
  }

  statistic() {
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.GENERAL} large={false} wide={false} style={{}}>
        <Statistic ultrawide size="flexible">
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
