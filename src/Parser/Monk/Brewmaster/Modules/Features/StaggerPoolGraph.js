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

import './StaggerPoolGraph.css';

import StaggerFabricator from '../Core/StaggerFabricator';

class StaggerPoolGraph extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };
  
  _staggerValues = [];

  on_addstagger(event) {
    this._staggerValues.push(event);
  }

  on_removestagger(event) {
    this._staggerValues.push(event);
  }

  plot() {
    const poolBySeconds = {
      0: 0,
    };

    this._staggerValues.forEach(({ timestamp, newPooledDamage }) => {
      const seconds = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
      poolBySeconds[seconds] = newPooledDamage;
    });

    const labels = Object.keys(poolBySeconds);
    const chartData = {
      labels,
      series: [ 
        {
          className: 'stagger-pool',
          name: 'Staggered Damage',
          data: Object.values(poolBySeconds),
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
