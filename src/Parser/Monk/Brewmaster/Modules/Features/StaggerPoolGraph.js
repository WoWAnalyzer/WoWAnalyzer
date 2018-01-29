import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';

import specialEventIndicators from 'Main/Chartist/specialEventIndicators';
import { formatDuration } from 'Main/ManaLevelGraph';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';

import './StaggerPoolGraph.css';

import StaggerFabricator from '../Core/StaggerFabricator';

class StaggerPoolGraph extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };
  
  _staggerEvents = [];
  _purifyTimestamps = [];

  on_addstagger(event) {
    this._staggerEvents.push(event);
  }

  on_removestagger(event) {
    this._staggerEvents.push(event);

    if(event.reason.ability.guid === SPELLS.PURIFYING_BREW.id) {
      this._purifyTimestamps.push(event.timestamp);
    }
  }

  plot() {
    const labels = Array.from({length: Math.ceil(this.owner.fightDuration / 1000)}, (x, i) => i);
    const poolBySeconds = labels.reduce((obj, sec) => {
      obj[sec] = undefined;
      return obj;
    }, {});

    const purifiesBySeconds = labels.reduce((obj, sec) => {
      obj[sec] = undefined;
      return obj;
    }, {});

    this._staggerEvents.forEach(({ timestamp, newPooledDamage }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
      poolBySeconds[seconds] = newPooledDamage;
      purifiesBySeconds[seconds] = undefined; // intentionally set to undefined for `specialEventIndicators`
    });
    this._purifyTimestamps.forEach(timestamp => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
      purifiesBySeconds[seconds] = true; // note that we can't have two purifies in a second due to brew gcd
    });

    let lastPoolContents = 0;
    for(const label in labels) {
      if(poolBySeconds[label] === undefined) {
        poolBySeconds[label] = lastPoolContents;
        continue;
      }

      lastPoolContents = poolBySeconds[label];
    }

    const chartData = {
      labels,
      series: [ 
        {
          className: 'stagger-pool',
          name: 'Stagger Pool Contents',
          data: Object.values(poolBySeconds),
        },
        {
          className: 'purifies',
          name: 'Purifying Brew Cast',
          data: Object.values(purifiesBySeconds),
        },
      ],
    };

    return (
      <div className="graph-container">
        <ChartistGraph
          type="Line"
          data={chartData}
          options={{
            showArea: true,
            showPoint: false,
            fullWidth: true,
            height: '350px',
            lineSmooth: Chartist.Interpolation.simple({
              fillHoles: true,
            }),
            axisX: {
              labelInterpolationFnc: function skipLabels(seconds) {
                if (seconds % 30 === 0) {
                  return formatDuration(seconds);
                }
                return null;
              },
              offset: 15,
            },
            axisY: {
              onlyInteger: false,
              offset: 75,
              labelInterpolationFnc: function skipLabels(dmg) {
                return formatNumber(dmg);
              },
            },
            plugins: [ 
              Chartist.plugins.legend({
                classNames: [ 'stagger-pool', 'purifies' ],
              }),
              specialEventIndicators({ series: [ 'purifies' ]}),
            ],
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
