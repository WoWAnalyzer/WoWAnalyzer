import React from 'react';
import { Scatter } from 'react-chartjs-2';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import { formatDuration } from 'common/format';

import RuneBreakdown from './RuneBreakdown';
import RuneTracker from './RuneTracker';

class RuneDetails extends Analyzer {
  static dependencies = {
    runeTracker: RuneTracker,
  };

  formatLabel(number){
    return formatDuration(number, 0);
  }

  render() {

    const labels = Array.from({length: Math.ceil(this.owner.fightDuration / 1000)}, (x, i) => i);

    const runeData = {
      labels: labels,
      datasets: [{
        label: 'Runes',
        data: this.runeTracker.runesReady,
        backgroundColor: 'rgba(196, 31, 59, 0)',
        borderColor: 'rgb(196, 31, 59)',
        borderWidth: 2,
        pointStyle: 'line',
      }],
    };

    const chartOptions = {
      showLines: true,
      elements: {
        point: { radius: 0 },
        line: {
          tension: 0,
          skipNull: true,
         },
      },
      scales: {
        xAxes: [{
          labelString: 'Time',
          ticks: {
            fontColor: '#ccc',
            callback: this.formatLabel,
            beginAtZero: true,
            stepSize: 10,
            max: this.owner.fightDuration / 1000,
          },
        }],
        yAxes: [{
          labelString: 'Runes',
          ticks: {
            fontColor: '#ccc',
            beginAtZero: true,
          },
        }],
      },
    };

    return (
      <div>
        <Scatter
          data={runeData}
          options={chartOptions}
          height={100}
          width={300}
        />

        <RuneBreakdown
          tracker={this.runeTracker}
          showSpenders={true}
        />
      </div>
    );
  }

  tab() {
    return {
      title: 'Rune usage',
      url: 'rune-usage',
      render: () => (
        <Tab title="Rune usage breakdown">
          {this.render()}
        </Tab>
      ),
    };
 }

}

export default RuneDetails;
