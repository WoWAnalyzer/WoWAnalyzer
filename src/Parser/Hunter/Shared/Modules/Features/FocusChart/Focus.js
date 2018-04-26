//Based on Main/Mana.js and Parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import SPELLS from 'common/SPELLS';

import { formatDuration } from 'common/format';

import FocusComponent from './FocusComponent';

const passiveWasteThresholdPercentage = .03; // (wasted passive focus generated) / (total passive focus generated), anything higher will trigger "CAN BE IMPROVED"
//TODO: get a "real" number approved by a MMS expert

class Focus extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    playerHaste: PropTypes.number.isRequired,
    focusMax: PropTypes.number,
    focusPerSecond: PropTypes.array,
    tracker: PropTypes.number,
    secondsCapped: PropTypes.number,
    activeFocusGenerated: PropTypes.object,
    activeFocusWasted: PropTypes.object,
    generatorCasts: PropTypes.object,
    activeFocusWastedTimeline: PropTypes.object,
  };

  render() {
    if (!this.props.tracker) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const focusGen = Math.round((10 + .1 * this.props.playerHaste / 375) * 100) / 100; //TODO: replace constant passive FocusGen (right now we don't account for lust/hero or Trueshot)

    const maxFocus = this.props.focusMax;
    const { start, end } = this.props;

    //not it's own module since it's "fake data" meant to look visually accurate, not be numerically accurate
    const passiveCap = this.props.secondsCapped; //counts time focus capped (in seconds)
    let lastCatch = 0; //records the timestamp of the last event
    const overCapBySecond = [];
    const focusBySecond = [];
    const magicGraphNumber = Math.floor(maxFocus / 2);
    let passiveWasteIndex = 0;
    if (this.props.focusPerSecond && this.props.activeFocusWastedTimeline) {
      this.props.focusPerSecond.forEach((item) => {
        const secIntoFight = Math.floor(passiveWasteIndex / 1000);
        if (Math.max(focusBySecond[secIntoFight], item) >= magicGraphNumber) { //aims to get highest peak
          focusBySecond[secIntoFight] = Math.max(focusBySecond[secIntoFight], item);
        }
        else if (Math.max(focusBySecond[secIntoFight], item) < magicGraphNumber) { //aims to get lowest valley
          focusBySecond[secIntoFight] = Math.min(focusBySecond[secIntoFight], item);
        }
        else if (!focusBySecond[secIntoFight]) {
          focusBySecond[secIntoFight] = item;
        }
        lastCatch = Math.floor(passiveWasteIndex / 1000);
        passiveWasteIndex++;
      });
      for (let i = 0; i < lastCatch; i++) { //extrapolates for passive focus gain
        if (!focusBySecond[i]) {
          if (focusBySecond[i - 1] > maxFocus - focusGen) {
            focusBySecond[i] = maxFocus;
          }
          else {
            focusBySecond[i] = focusBySecond[i - 1] + focusGen;
          }
        }
        if (focusBySecond[i] >= maxFocus) {
          if (this.props.activeFocusWastedTimeline[i]) {
            overCapBySecond[i] = focusGen + this.props.activeFocusWastedTimeline[i];
          }
          else {
            overCapBySecond[i] = focusGen;
          }
        }
        else if (this.props.activeFocusWastedTimeline[i] && focusBySecond[i] + this.props.activeFocusWastedTimeline[i] > maxFocus) {
          overCapBySecond[i] = (focusBySecond[i] + this.props.activeFocusWastedTimeline[i]) - maxFocus;
        }
        else {
          overCapBySecond[i] = 0;
        }
      }
    }

    const abilitiesAll = {};
    const categories = {
      generated: 'Focus Generators',
      //spent: 'Focus Spenders', //I see no reason to display focus spenders, but leaving this in if someone later wants to add them
    };
    if (this.props.generatorCasts && this.props.activeFocusWasted && this.props.activeFocusGenerated) {
      Object.keys(this.props.generatorCasts).forEach((generator) => {
        const spell = SPELLS[generator];
        abilitiesAll[`${generator}_gen`] = {
          ability: {
            category: 'Focus Generators',
            name: spell.name,
            spellId: Number(generator),
          },
          casts: this.props.generatorCasts[generator],
          created: this.props.activeFocusGenerated[generator],
          wasted: this.props.activeFocusWasted[generator],
        };
      });
    }

    const abilities = Object.keys(abilitiesAll).map(key => abilitiesAll[key]);
    abilities.sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created === b.created) {
        return 0;
      }
      return -1;
    });

    const fightDurationSec = Math.floor((end - start) / 1000);
    const labels = [];
    for (let i = 0; i <= fightDurationSec; i += 1) {
      labels.push(i);

      focusBySecond[i] = focusBySecond[i] !== undefined ? focusBySecond[i] : null;
      if (focusBySecond[i] !== null) {
        focusBySecond[i] = focusBySecond[i] > 0 ? focusBySecond[i] : 0;
      }
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : null;
    }
    const wastedFocus = Math.round(passiveCap * focusGen);
    const totalFocus = Math.floor(fightDurationSec * focusGen);
    let ratingOfPassiveWaste = "";
    if (passiveCap / this.totalFocus > passiveWasteThresholdPercentage) {
      ratingOfPassiveWaste = "Can be improved.";
    }
    const totalWasted = [totalFocus, wastedFocus, ratingOfPassiveWaste];

    let maxX;
    const myLabels = [];
    for (maxX = 0; maxX < focusBySecond.length; maxX++) {
      if (maxX % 30 === 0) {
        myLabels[maxX] = (formatDuration(maxX));
      }
    }
    myLabels[maxX - 1] = formatDuration(maxX - 1);

    const myData = {
      labels: myLabels,
      datasets: [{
        label: 'Focus',
        data: focusBySecond,
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
          label: 'Wasted Focus',
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
            max: maxFocus,
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

        <FocusComponent
          abilities={abilities}
          categories={categories}
          passive={(totalWasted)}
        />
      </div>
    );

  }
}

export default Focus;
