import React from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';

import { formatDuration } from 'Main/ManaLevelGraph';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';

import StaggerFabricator from '../Core/StaggerFabricator';

class StaggerPoolGraph extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };
  
  _staggerEvents = [];
  _purifyTimestamps = [];
  _deathTimestamps = [];

  on_addstagger(event) {
    this._staggerEvents.push(event);
  }

  on_removestagger(event) {
    this._staggerEvents.push(event);

    if(event.reason.ability.guid === SPELLS.PURIFYING_BREW.id) {
      this._purifyTimestamps.push(event.timestamp);
    }
  }

  on_toPlayer_death(event) {
    this._deathTimestamps.push(event.timestamp);
  }

  plot() {
    const labels = Array.from({length: Math.ceil(this.owner.fightDuration / 1000)}, (x, i) => i);
    const poolBySeconds = labels.reduce((obj, sec) => {
      obj[sec] = undefined;
      return obj;
    }, {});

    const purifies = this._purifyTimestamps.map(timestamp => Math.floor((timestamp - this.owner.fight.start_time) / 1000));
    const deaths = this._deathTimestamps.map(timestamp => Math.floor((timestamp - this.owner.fight.start_time) / 1000));

    this._staggerEvents.forEach(({ timestamp, newPooledDamage }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
      poolBySeconds[seconds] = newPooledDamage;
    });

    // fix stagger after deaths
    let lastPoolContents = 0;
    for(const label in labels) {
      if(poolBySeconds[label] === undefined) {
        poolBySeconds[label] = lastPoolContents;
      } else {
        lastPoolContents = poolBySeconds[label];
      }
      if(deaths.includes(Number(label))) {
        lastPoolContents = 0;
      }
    }

    const chartData = {
      labels,
      datasets: [ 
        {
          label: 'Stagger Pool Contents',
          data: Object.values(poolBySeconds),
          backgroundColor: 'rgba(240, 234, 214, 0.2)',
          borderColor: 'rgb(240, 234, 214)',
          borderWidth: 2,
        },
        // add labels to legend
        {
          label: 'Purifying Brew Cast',
          backgroundColor: '#00ff96',
          data: [],
          fillOpacity: 0.2,
        },
        {
          label: 'Player Deaths',
          backgroundColor: 'rgb(183, 76, 75)',
          data: [],
          fillOpacity: 0.2,
        },
      ],
    };

    function annotations(values, color) {
      return values.map(index => { 
        return {
          type: 'line',
          mode: 'vertical',
          borderColor: color,
          borderWidth: 2,
          value: index,
          scaleID: 'x-axis-0',
        };
      });
    }

    return (
      <div className="graph-container">
        <LineChart
          data={chartData}
          height={100}
          width={300}
          options={{
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  return `Damage in Stagger Pool: ${formatNumber(tooltipItem.yLabel)}`;
                },
              },
            },
            legend: {
              labels: {
                fontColor: '#ccc',
              },
            },
            animation: {
              duration: 0,
            },
            elements: {
              line: {
                tension: 0,
              },
              point: {
                radius: 0,
              },
            },
            scales: {
              xAxes: [{
                labelString: 'Time',
                ticks: {
                  fontColor: '#ccc',
                  callback: formatDuration,
                },
              }],
              yAxes: [{
                labelString: 'Damage in Stagger Pool',
                ticks: {
                  fontColor: '#ccc',
                  callback: formatNumber,
                },
              }],
            },
            annotation: {
              annotations: [
                ...annotations(purifies, 'rgba(0, 255, 150, 0.5)'),
                ...annotations(deaths, 'rgba(183, 76, 75, 0.8)'),
              ],
            },
          }}
        />
      </div>
    );
  }

  tab() {
    return {
      title: 'Stagger Pool',
      url: 'stagger-pool',
      render: () => (
        <Tab title="Stagger Pool">
          {this.plot()}
        </Tab>
      ),
    };
  }
}

export default StaggerPoolGraph;
