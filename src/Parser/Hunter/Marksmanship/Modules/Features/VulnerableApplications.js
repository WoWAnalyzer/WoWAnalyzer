import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import StatisticsListBox from 'Main/StatisticsListBox';
import STATISTIC_ORDER from "Main/STATISTIC_ORDER";
import Wrapper from 'common/Wrapper';

const CHART_SIZE = 50;

//code grabbed from Parser/Paladin/Holy/Modules/PaladinCore/CastBehavior.js

class VulnerableApplications extends Analyzer {

  windburstCasts = 0;
  markedShotCasts = 0;

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

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WINDBURST.id && spellId !== SPELLS.MARKED_SHOT.id) {
      return;
    }
    if (spellId === SPELLS.WINDBURST.id) {
      this.windburstCasts += 1;
    }
    if (spellId === SPELLS.MARKED_SHOT.id) {
      this.markedShotCasts += 1;
    }
  }

  vulnApplicationChart() {
    const markedShotVuln = this.markedShotCasts;
    const windburstVuln = this.windburstCasts;
    const totalVuln = this.windburstCasts + this.markedShotCasts;

    const items = [
      {
        color: '#ecd1b6',
        label: 'Windburst',
        spellId: SPELLS.WINDBURST.id,
        value: windburstVuln,
      },
      {
        color: '#ff7d0a',
        label: 'Marked Shot',
        spellId: SPELLS.MARKED_SHOT.id,
        value: markedShotVuln,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalVuln)}
        </div>
      </div>
    );
  }
  statistic() {
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
        <div className="row">
          <StatisticsListBox
            title={<Wrapper><SpellLink id={SPELLS.VULNERABLE.id} /> applications</Wrapper>}
            containerProps={{ className: 'col-xs-12' }}
          >
            {this.vulnApplicationChart()}
          </StatisticsListBox>
        </div>
      </div>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(9);
}

export default VulnerableApplications;
