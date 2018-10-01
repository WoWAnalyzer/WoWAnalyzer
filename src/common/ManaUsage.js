import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import StatisticWrapper from 'interface/others/StatisticWrapper';

const CHART_SIZE = 100;

/**
 * Tracks the mana usage of spell casts and creates a piechart with the breakdown.
 *
 * Example log: /report/tVvxzMN74jDCbkZF/28-Heroic+G'huun+-+Kill+(6:49)/1-Blazyb
 */

class ManaUsage extends Analyzer {
  listOfManaSpenders = {};
  manaSpenderCasts = {};

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
            <dfn data-tip={`${casts} casts <br/> ${value} mana used`}>
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
    if (this.listOfManaSpenders.every(id => spellId !== id)) {
      return;
    }
    //shouldn't really happen unless something messed up in the log where the cast event doesn't have any class resource information so we skip those.
    if (!event.classResources) {
      return;
    }
    this.manaSpenderCasts[spellId].casts += 1;
    this.manaSpenderCasts[spellId].manaUsed += event.resourceCost[RESOURCE_TYPES.MANA.id] || 0;
  }

  manaUsageChart() {
    const usedSpells = this.listOfManaSpenders.filter(id => this.manaSpenderCasts[id].casts > 0 && this.manaSpenderCasts[id].manaUsed > 0);
    const totalmanaUsed = usedSpells.reduce((total, id) => total + this.manaSpenderCasts[id].manaUsed, 0);
    const items = usedSpells
      .map(id => ({
        color: this.manaSpenderCasts[id].color,
        label: this.manaSpenderCasts[id].name,
        spellId: id,
        value: Math.round(this.manaSpenderCasts[id].manaUsed),
        casts: this.manaSpenderCasts[id].casts,
      }))
      .sort((a, b) => b.value - a.value);

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalmanaUsed.toFixed(1))}
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticWrapper position={STATISTIC_ORDER.CORE(13)}>
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <div className="row">
            <StatisticsListBox
              title="mana usage"
              containerProps={{ className: 'col-xs-12' }}
            >
              {this.manaUsageChart()}
            </StatisticsListBox>
          </div>
        </div>
      </StatisticWrapper>
    );
  }
}

export default ManaUsage;
