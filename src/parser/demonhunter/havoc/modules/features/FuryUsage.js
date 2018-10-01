import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import StatisticWrapper from 'interface/others/StatisticWrapper';

const CHART_SIZE = 100;

/**
 * Tracks the fury usage of Havoc Demon Hunter and creates a piechart with the breakdown.
 *
 * Example log: https://www.warcraftlogs.com/reports/KhTmkBYz9WJrVN7w#fight=15&type=damage-done&source=21
 */

const LIST_OF_FURY_SPENDERS = [
  SPELLS.CHAOS_STRIKE.id,
  SPELLS.ANNIHILATION.id,
  SPELLS.BLADE_DANCE.id,
  SPELLS.DEATH_SWEEP.id,
  SPELLS.EYE_BEAM.id,
  SPELLS.CHAOS_NOVA.id,
];

class FuryUsage extends Analyzer {
  furySpenderCasts = {
    [SPELLS.CHAOS_STRIKE.id]: {
      casts: 0,
      furyUsed: 0,
      name: SPELLS.CHAOS_STRIKE.name,
      color: '#34AF72',
    },
    [SPELLS.ANNIHILATION.id]: {
      casts: 0,
      furyUsed: 0,
      name: SPELLS.ANNIHILATION.name,
      color: '#6F9F35',
    },
    [SPELLS.BLADE_DANCE.id]: {
      casts: 0,
      furyUsed: 0,
      name: SPELLS.BLADE_DANCE.name,
      color: '#D3544B',
    },
    [SPELLS.DEATH_SWEEP.id]: {
      casts: 0,
      furyUsed: 0,
      name: SPELLS.DEATH_SWEEP.name,
      color: '#B07121',
    },
    [SPELLS.EYE_BEAM.id]: {
      casts: 0,
      furyUsed: 0,
      name: SPELLS.EYE_BEAM.name,
      color: '#8B56B8',
    },
    [SPELLS.CHAOS_NOVA.id]: {
      casts: 0,
      furyUsed: 0,
      name: SPELLS.CHAOS_NOVA.name,
      color: '#2D7313',
    },
  };
  lastVolleyHit = 0;

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, casts, spellId }, index) => {
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
            <dfn data-tip={`${casts} casts <br/> ${value} fury used`}>
              {formatPercentage(value / total, 1)}%
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
    if (LIST_OF_FURY_SPENDERS.every(id => spellId !== id)) {
      return;
    }
    //shouldn't really happen unless something messed up in the log where the cast event doesn't have any class resource information so we skip those.
    if (!event.classResources) {
      return;
    }
    this.furySpenderCasts[spellId].casts += 1;
    this.furySpenderCasts[spellId].furyUsed += event.classResources[0].cost || 0;
  }

  furyUsageChart() {
    let totalFuryUsed = 0;
    const items = [];

    LIST_OF_FURY_SPENDERS.forEach(id => {
      if (this.furySpenderCasts[id].casts > 0 && this.furySpenderCasts[id].furyUsed > 0) {
        items.push({
          color: this.furySpenderCasts[id].color,
          label: this.furySpenderCasts[id].name,
          spellId: id,
          value: Math.round(this.furySpenderCasts[id].furyUsed),
          casts: this.furySpenderCasts[id].casts,
        });
        totalFuryUsed += this.furySpenderCasts[id].furyUsed;
      }
    });
    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalFuryUsed.toFixed(1))}
        </div>
      </div>
    )
      ;
  }

  statistic() {
    return (
      <StatisticWrapper position={STATISTIC_ORDER.CORE(13)}>
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <div className="row">
            <StatisticsListBox
              title="Fury usage"
              containerProps={{ className: 'col-xs-12' }}
            >
              {this.furyUsageChart()}
            </StatisticsListBox>
          </div>
        </div>
      </StatisticWrapper>
    );
  }

}

export default FuryUsage;
