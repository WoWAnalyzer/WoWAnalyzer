import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';

class CastBehavior extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

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
        label: 'Healing Wave',
        spellId: SPELLS.HEALING_WAVE.id,
        value: twHealingWaves,
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: 'Healing Surge',
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: twHealingSurges,
      },
      {
        color: '#CC3D20',
        label: 'Unused Tidal Waves',
        tooltip: `The amount of Tidal Waves you did not use out of the total available. You cast ${riptideCasts} Riptides and ${chainHealCasts} Chain Heals which gave you ${totalTwGenerated} Tidal Waves charges, of which you used ${totalTwUsed}.`,
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
        label: 'Healing Wave',
        spellId: SPELLS.HEALING_WAVE.id,
        value: fillerHealingWaves,
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: 'Healing Surge',
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
      <StatisticGroup position={STATISTIC_ORDER.CORE(40)}>
        <Statistic ultrawide>
          <div className="pad">
            <label><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> usage</label>
            {this.twUsageRatioChart}
          </div>
        </Statistic>
        <Statistic ultrawide>
          <div className="pad">
            <label>Fillers</label>
            {this.fillerCastRatioChart}
          </div>
        </Statistic>
      </StatisticGroup>
    );
  }
}

export default CastBehavior;
