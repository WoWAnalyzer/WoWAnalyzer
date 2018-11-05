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

const LIST_OF_RAGE_SPENDER = [
    SPELLS.CLEAVE_TALENT.id,
    SPELLS.WHIRLWIND.id,
    SPELLS.HAMSTRING.id,
    SPELLS.MORTAL_STRIKE.id,
    SPELLS.EXECUTE.id,
    SPELLS.SLAM.id,
    SPELLS.IMPENDING_VICTORY_TALENT.id,
    SPELLS.REND_TALENT.id,
];

class RageUsage extends Analyzer {
    rageSpenderCast = {
        [SPELLS.CLEAVE_TALENT.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.CLEAVE_TALENT.name,
            color: '#CC3024',
        },
        [SPELLS.WHIRLWIND.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.WHIRLWIND.name,
            color: '#7F372D',            
        },
        [SPELLS.HAMSTRING.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.HAMSTRING.name,
            color: '#FF837A',
        },
        [SPELLS.MORTAL_STRIKE.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.MORTAL_STRIKE.name,
            color: '#CC220B',
        },
        [SPELLS.EXECUTE.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.EXECUTE.name,
            color: '#7F1507',
        },
        [SPELLS.SLAM.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.SLAM.name,
            color: '#FF2A0D',
        },
        [SPELLS.IMPENDING_VICTORY_TALENT.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.IMPENDING_VICTORY_TALENT.name,
            color: '#FF3C2D',
        },
        [SPELLS.REND_TALENT.id]: {
            casts: 0,
            rageUsed: 0,
            name: SPELLS.REND_TALENT.name,
            color: '#7F1E17',
        },
    };

    legend(items, total) {
        const numItems = items.length;
        return items.map(({ color, label, tooltip, value, casts, spellId }, index) => {
            label = tooltip ? (<dfn data-tip={tooltip}>{label}</dfn>) : label;
            label = spellId ? (<SpellLink id={spellId}>{label}</SpellLink>) : label;
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
                        <dfn data-tip={`${casts} casts <br/> ${value / 10} rage used`}>
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
        if (LIST_OF_RAGE_SPENDER.every(id => spellId !== id)) return;
        if (!event.classResources) return;

        this.rageSpenderCast[spellId].casts += 1;
        this.rageSpenderCast[spellId].rageUsed += event.classResources[0].cost || 0;
    }
    
    rageUsageChart() {
        let totalRageUsed = 0;
        const items = [];

        LIST_OF_RAGE_SPENDER.forEach(id => {
        if (this.rageSpenderCast[id].casts > 0 && this.rageSpenderCast[id].rageUsed > 0) {
            items.push({
                color: this.rageSpenderCast[id].color,
                label: this.rageSpenderCast[id].name,
                spellId: id,
                value: Math.round(this.rageSpenderCast[id].rageUsed),
                casts: this.rageSpenderCast[id].casts,
            });
            totalRageUsed += this.rageSpenderCast[id].rageUsed;
            }
        });
        return (
            <div className="flex">
            <div className="flex-sub" style={{ paddingRight: 12 }}>
                {this.chart(items)}
            </div>
            <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
                {this.legend(items, totalRageUsed.toFixed(1))}
            </div>
            </div>
        );
    }

    statistic() {
    return (
        <StatisticWrapper position={STATISTIC_ORDER.CORE(4)}>
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
            <div className="row">
            <StatisticsListBox
              title="Rage usage"
              containerProps={{ className: 'col-xs-12' }}
            >
              {this.rageUsageChart()}
            </StatisticsListBox>
            </div>
        </div>
        </StatisticWrapper>
    );
    }
}

export default RageUsage;