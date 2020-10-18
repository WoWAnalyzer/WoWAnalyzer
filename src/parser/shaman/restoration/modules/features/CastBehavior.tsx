import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';

import StatisticGroup from 'interface/statistics/StatisticGroup';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { Trans } from '@lingui/macro';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

class CastBehavior extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
  };

  protected abilityTracker!: RestorationAbilityTracker;

  get twUsageRatioChart() {
    const riptide = this.abilityTracker.getAbility(SPELLS.RIPTIDE.id);
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);

    const chainHealCasts = chainHeal.casts || 0;
    const riptideCasts = riptide.casts || 0;
    const totalTwGenerated = riptideCasts + chainHealCasts;
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;

    const totalTwUsed = twHealingWaves + twHealingSurges;
    const unusedTw = totalTwGenerated - totalTwUsed;

    const items = [
      {
        color: SPELLS.HEALING_WAVE.color,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: twHealingWaves,
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: <Trans id="shaman.restoration.spell.healingSurge">Healing Surge</Trans>,
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: twHealingSurges,
      },
      {
        color: '#CC3D20',
        label: <Trans id="shaman.restoration.castBehaviour.unusedTW">Unused Tidal Waves</Trans>,
        tooltip: <Trans id="shaman.restoration.castBehaviour.unusedTW.tooltip">The amount of Tidal Waves you did not use out of the total available. You cast {riptideCasts} Riptides and {chainHealCasts} Chain Heals which gave you {totalTwGenerated} Tidal Waves charges, of which you used ${totalTwUsed}.</Trans>,
        value: unusedTw,
      },
    ];

    return (
      <DonutChart
        items={items}
      />
    );
  }

  get fillerCastRatioChart() {
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;

    const healingWaveHeals = healingWave.casts || 0;
    const healingSurgeHeals = healingSurge.casts || 0;
    const fillerHealingWaves = healingWaveHeals - twHealingWaves;
    const fillerHealingSurges = healingSurgeHeals - twHealingSurges;

    const items = [
      {
        color: SPELLS.HEALING_WAVE.color,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: fillerHealingWaves,
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: <Trans id="shaman.restoration.spell.healingSurge">Healing Surge</Trans>,
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: fillerHealingSurges,
      },
    ];

    return (
      <DonutChart
        items={items}
      />
    );
  }

  statistic() {
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.GENERAL} large={false} wide={false} style={{}}>
        <Statistic ultrawide>
          <div className="pad">
            <label><Trans id="shaman.restoration.castBehaviour.statistic.tidalWaves"><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> usage</Trans></label>
            {this.twUsageRatioChart}
          </div>
        </Statistic>
        <Statistic ultrawide>
          <div className="pad">
            <label><Trans id="shaman.restoration.castBehaviour.statistic.fillers">Fillers</Trans></label>
            {this.fillerCastRatioChart}
          </div>
        </Statistic>
      </StatisticGroup>
    );
  }
}

export default CastBehavior;
