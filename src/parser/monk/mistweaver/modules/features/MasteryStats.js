import React from 'react';

import SPELLS from 'common/SPELLS';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import EssenceFontMastery from 'parser/monk/mistweaver/modules/features/EssenceFontMastery';
import EnvelopingMists from 'parser/monk/mistweaver/modules/spells/EnvelopingMists';
import SoothingMist from 'parser/monk/mistweaver/modules/spells/SoothingMist';
import RenewingMist from 'parser/monk/mistweaver/modules/spells/RenewingMist';
import Vivify from 'parser/monk/mistweaver/modules/spells/Vivify';

import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';

const CHART_SIZE = 75;
const debug = false;

class MasteryStats extends Analyzer {
  static dependencies = {
    essenceFontMastery: EssenceFontMastery,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist,
    renewingMist: RenewingMist,
    vivify: Vivify,
  }

  get totalMasteryHealing() {
    return (this.vivify.gustsHealing || 0)
            + (this.renewingMist.gustsHealing || 0)
            + (this.envelopingMists.gustsHealing || 0)
            + (this.soothingMist.gustsHealing || 0)
            + (this.essenceFontMastery.healing || 0);
  }
  
  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, spellId }, index) => {
      label = tooltip ? (
        <dfn data-tip={tooltip}>{label}</dfn>
      ) : label;
      label = spellId ? (
        <SpellLink id={spellId}>{label}</SpellLink>
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
            borderColor: '#666',
            borderWidth: 1.5,
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

  masterySourceChart() {
    const items = [
      {
        color: '#00b159',
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: this.vivify.gustsHealing,
      },
      {
        color: '#db00db',
        label: 'Renewing Mist',
        spellId: SPELLS.RENEWING_MIST.id,
        value: this.renewingMist.gustsHealing,
      },
      {
        color: '#f37735',
        label: 'Enveloping Mists',
        spellId: SPELLS.ENVELOPING_MIST.id,
        value: this.envelopingMists.gustsHealing,
      },
      {
        color: '#ffc425',
        label: 'Soothing Mist',
        spellId: SPELLS.SOOTHING_MIST.id,
        value: this.soothingMist.gustsHealing,
      },
      {
        color: '#00bbcc',
        label: 'Essence font',
        spellId: SPELLS.ESSENCE_FONT.id,
        value: this.essenceFontMastery.healing,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, this.totalMasteryHealing)}
        </div>
      </div>
    );
  }

  on_fightend() {
    if (debug) {
      console.log(`Vivify:${this.vivify.gustsHealing}`);
      console.log(`Renewing:${this.renewingMist.gustsHealing}`);
      console.log(`Enveloping:${this.envelopingMists.gustsHealing}`);
      console.log(`Soothing:${this.soothingMist.gustsHealing}`);
      console.log(`Essence font:${this.essenceFontMastery.healing}`);
      console.log(`Total Mastery healing:${this.totalMasteryHealing}`);
    }
  }

  statistic() {
    return (
      <StatisticsListBox
        position={STATISTIC_ORDER.CORE(20)}
        title={<><SpellLink id={SPELLS.GUSTS_OF_MISTS.id}>Gusts of Mists</SpellLink> breakdown</>}
      >
        {this.masterySourceChart()}
      </StatisticsListBox>
    );
  }
}

export default MasteryStats;
