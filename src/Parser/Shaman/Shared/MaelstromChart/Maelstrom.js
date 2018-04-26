//Based on Main/Mana.js and Parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import SPELLS from 'common/SPELLS';

import { formatDuration } from 'common/format';

import MaelstromComponent from './MaelstromComponent';

class Maelstrom extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    maelstromMax: PropTypes.number,
    maelstromPerSecond: PropTypes.array,
    tracker: PropTypes.number,
    activeMaelstromGenerated: PropTypes.object,
    activeMaelstromWasted: PropTypes.object,
    generatorCasts: PropTypes.object,
    activeMaelstromWastedTimeline: PropTypes.object,
  };

  render() {
    if (!this.props.tracker) {
      return (
        <div>
          Loading...
        </div>
      );
    }


    const maxMaelstrom = this.props.maelstromMax;
    const { start, end } = this.props;

    //not it's own module since it's "fake data" meant to look visually accurate, not be numerically accurate
    let lastCatch = 0; //records the timestamp of the last event
    const overCapBySecond = [];
    const maelstromBySecond = [];
    const magicGraphNumber = Math.floor(maxMaelstrom / 2);
    let passiveWasteIndex = 0;
    if (this.props.maelstromPerSecond && this.props.activeMaelstromWastedTimeline) {
      this.props.maelstromPerSecond.forEach((item) => {
        const secIntoFight = Math.floor(passiveWasteIndex / 1000);
        if (Math.max(maelstromBySecond[secIntoFight], item) >= magicGraphNumber) { //aims to get highest peak
          maelstromBySecond[secIntoFight] = Math.max(maelstromBySecond[secIntoFight], item);
        }
        else if (Math.max(maelstromBySecond[secIntoFight], item) < magicGraphNumber) { //aims to get lowest valley
          maelstromBySecond[secIntoFight] = Math.min(maelstromBySecond[secIntoFight], item);
        }
        else if (!maelstromBySecond[secIntoFight]) {
          maelstromBySecond[secIntoFight] = item;
        }
        lastCatch = Math.floor(passiveWasteIndex / 1000);
        passiveWasteIndex++;
      });
    }

      for (let i = 0; i < lastCatch; i++) {
        if (!maelstromBySecond[i]) {
          if (maelstromBySecond[i - 1] > maxMaelstrom)
            maelstromBySecond[i] = maxMaelstrom;
          else
            maelstromBySecond[i] = maelstromBySecond[i - 1];
      }

        if (this.props.activeMaelstromWastedTimeline[i] && maelstromBySecond[i] + this.props.activeMaelstromWastedTimeline[i] > maxMaelstrom)
          overCapBySecond[i] = (maelstromBySecond[i] + this.props.activeMaelstromWastedTimeline[i]) - maxMaelstrom;
        else
          overCapBySecond[i] = 0;
    }

    const abilitiesAll = {};
    const categories = {
      generated: 'Maelstrom Generators',
      //spent: 'Focus Spenders', //I see no reason to display focus spenders, but leaving this in if someone later wants to add them
    };
    if (this.props.generatorCasts && this.props.activeMaelstromWasted && this.props.activeMaelstromGenerated) {
      Object.keys(this.props.generatorCasts).forEach((generator) => {
        const spell = SPELLS[generator];
        abilitiesAll[`${generator}_gen`] = {
          ability: {
            category: 'Maelstrom Generators',
            name: spell.name,
            spellId: Number(generator),
          },
          casts: this.props.generatorCasts[generator],
          created: this.props.activeMaelstromGenerated[generator],
          wasted: this.props.activeMaelstromWasted[generator],
        };

      });
    }

    const abilities = Object.keys(abilitiesAll).map(key => abilitiesAll[key]);
    abilities.sort((a, b) => {
      if (a.created < b.created)
        return 1;
      if (a.created === b.created)
        return 0;
      return -1;
    });

    const fightDurationSec = Math.floor((end - start) / 1000);
    const labels = [];
    for (let i = 0; i <= fightDurationSec; i++) {
      labels.push(i);

      maelstromBySecond[i] = maelstromBySecond[i] !== undefined ? maelstromBySecond[i] : null;
      if (maelstromBySecond[i] !== null) {
        maelstromBySecond[i] = maelstromBySecond[i] > 0 ? maelstromBySecond[i] : 0;
      }
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : null;
    }

    let maxX;
    const myLabels = [];
    for (maxX = 0; maxX < maelstromBySecond.length; maxX++) {
      if (maxX % 30 === 0) {
        myLabels[maxX] = (formatDuration(maxX));
      }
    }
    myLabels[maxX - 1] = formatDuration(maxX - 1);
    const myData = {
      labels: myLabels,
      datasets: [{
        label: 'Maelstrom',
        data: maelstromBySecond,
        lineTension: 0.4,
        backgroundColor: [
          'rgba(0, 139, 215, 0.2)',
        ],
        borderColor: [
          'rgba(0,145,255,1)',
        ],
        borderWidth: 2,
      },
        {
          label: 'Wasted Maelstrom',
          data: overCapBySecond,
          lineTension: 0.4,
          backgroundColor: [
            'rgba(255,20,147, 0.3)',
          ],
          borderColor: [
            'rgba(255,90,160,1)',
          ],
          borderWidth: 2,
        }],

    };
    const chartOptions = {
      lineTension: 0,
      elements: {
        point: { radius: 0 },
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
            autoSkip: false,
          },
          gridLines: {
            color: 'rgba(255,255,255,0.7)',
            borderDash: [2, 2],
          },
          position: 'bottom',
          beginAtZero: true,
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(255,255,255,0.7)',
            borderDash: [2, 2],
          },
          type: 'linear',
          ticks: {
            beginAtZero: true,
            stepSize: 30,
            max: maxMaelstrom,
          },
        }],
      },
    };

    return (
      <div>
        <Line
          data={myData}
          options={chartOptions}
          height={100}
          width={300}
        />
        <MaelstromComponent
          abilities={abilities}
          categories={categories}
        />
      </div>
    );

  }
}

export default Maelstrom;
