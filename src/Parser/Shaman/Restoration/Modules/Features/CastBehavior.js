import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';


const CHART_SIZE = 75;

class CastBehavior extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, spellId }, index) => {
      label = tooltip ? (
        <dfn data-tip={tooltip}>{label}</dfn>
      ) : label;
      label = spellId ? (
        <SpellLink id={spellId} icon={false}>{label}</SpellLink>
      ) : label;
      return (
        <div
          className="flex"
          style={{
            borderBottom: '3px solid rgba(255,255,255,0.1)',
            marginBottom: ((numItems - 1) === index) ? 0 : 5,
          }}
          key={index}
        >
          <div className="flex-sub">
            <div
              style={{
                display: 'inline-block',
                background: color,
                borderRadius: '50%',
                width: 16,
                height: 16,
                marginBottom: -3,
              }}
            />
          </div>
          <div className="flex-main" style={{ paddingLeft: 5 }}>
            {label}
          </div>
          <div className="flex-sub">
            <dfn data-tip={value}>
              {formatPercentage(value / total, 0)}%
            </dfn>
          </div>
        </div>
      );
    });
  }
  chart(items) {
    return (
      <DoughnutChart
        data={{
          datasets: [{
            data: items.map(item => item.value),
            backgroundColor: items.map(item => item.color),
            borderColor: '#000000',
            borderWidth: 0,
          }],
          labels: items.map(item => item.label),
        }}
        options={{
          legend: {
            display: false,
          },
          tooltips: {
            bodyFontSize: 8,
          },
          cutoutPercentage: 45,
          animation: false,
          responsive: false,
        }}
        width={CHART_SIZE}
        height={CHART_SIZE}
      />
    );
  }

  twUsageRatioChart() {
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
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalTwGenerated)}
        </div>
      </div>
    );
  }

  fillerCastRatioChart() {
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;

    const healingWaveHeals = healingWave.casts || 0;
    const healingSurgeHeals = healingSurge.casts || 0;
    const fillerHealingWaves = healingWaveHeals - twHealingWaves;
    const fillerHealingSurges = healingSurgeHeals - twHealingSurges;
    const totalFillers = fillerHealingWaves + fillerHealingSurges;

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
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalFillers)}
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
        <div className="row">
          <StatisticsListBox
            title={<span><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id}/> usage</span>}
            containerProps={{ className: 'col-xs-12' }}
          >
            {this.twUsageRatioChart()}
          </StatisticsListBox>
        </div>
        <div className="row">
          <StatisticsListBox
            title="Fillers"
            containerProps={{ className: 'col-xs-12' }}
          >
            {this.fillerCastRatioChart()}
          </StatisticsListBox>
        </div>
      </div>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(40);
}

export default CastBehavior;
