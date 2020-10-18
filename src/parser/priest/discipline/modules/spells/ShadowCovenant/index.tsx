import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import DonutChart, { DonutChartItem } from 'interface/statistics/components/DonutChart';
import SpellLink from 'common/SpellLink';

import ShadowCovenantOutput from './ShadowCovenantOutput';
import ShadowCovenantSynergies from './ShadowCovenantSynergies';

type ShadowCovenantDonutChartFactors = {
  shadowCovenantHealing: number;
  bonusAtonementHealing: number;
  bonusShadowHealing: number;
};

class ShadowCovenant extends Analyzer {
  static dependencies = {
    shadowCovenantOutput: ShadowCovenantOutput,
  };
  protected readonly shadowCovenantOutput!: ShadowCovenantOutput;

  private generateDonutStats({
    shadowCovenantHealing,
    bonusAtonementHealing,
    bonusShadowHealing,
  }: ShadowCovenantDonutChartFactors): DonutChartItem[] {
    return [
      {
        color: '#772bb5',
        label: 'Raw Healing',
        tooltip: 'Raw healing done by the Shadow Covenant spell.',
        value: shadowCovenantHealing,
      },
      {
        color: '#fcba03',
        label: 'Atonement',
        tooltip: 'Healing done via extra damage through Atonement.',
        value: bonusAtonementHealing,
      },
      {
        color: '#0B3C49',
        label: 'Shadow Healing',
        tooltip: 'Healing done via bonus Shadow healing.',
        value: bonusShadowHealing,
      },
    ];
  }

  statistic() {
    const {
      shadowCovenantHealing,
      bonusAtonementHealing,
      bonusShadowHealing,
    } = this.shadowCovenantOutput;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        tooltip="Output breakdown for Shadow Covenant, including healing from the buff."
      >
        <div className="pad">
          <label>
            <SpellLink id={SPELLS.SHADOW_COVENANT_TALENT.id}>Shadow Covenant</SpellLink>
          </label>
          <DonutChart
            items={this.generateDonutStats({
              shadowCovenantHealing,
              bonusAtonementHealing,
              bonusShadowHealing,
            })}
          />
        </div>
      </Statistic>
    );
  }
}

export default {
  ShadowCovenantOutput,
  ShadowCovenantSynergies,
  ShadowCovenant,
};
