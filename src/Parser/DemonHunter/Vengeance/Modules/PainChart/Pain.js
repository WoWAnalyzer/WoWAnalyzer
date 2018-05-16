// Based on Main/Mana.js

import React from 'react';
import PropTypes from 'prop-types';
import {Line} from 'react-chartjs-2';

import fetchWcl from 'common/fetchWcl';
import {formatDuration} from 'common/format';
import SPELLS from 'common/SPELLS';
import ManaStyles from 'Main/ManaStyles';

import PainComponent from './PainComponent';
import './Pain.css';
import PainStyles from './PainStyles';


class Pain extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      pain: null,
      bossHealth: null,
    };
  }

  componentWillMount() {
    this.load(this.props.reportCode, this.props.actorId, this.props.start, this.props.end);
  }
  componentWillReceiveProps(newProps) {
    if (newProps.reportCode !== this.props.reportCode || newProps.actorId !== this.props.actorId || newProps.start !== this.props.start || newProps.end !== this.props.end) {
      this.load(newProps.reportCode, newProps.actorId, newProps.start, newProps.end);
    }
  }
  load(reportCode, actorId, start, end) {
    const painPromise = fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceid: actorId,
      abilityid: 118,
    })
      .then(json => {
        this.setState({
          pain: json,
        });
      });

    const bossHealthPromise = fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 1,
      abilityid: 1000,
    })
      .then(json => {
        this.setState({
          bossHealth: json,
        });
      });

    return Promise.all([painPromise, bossHealthPromise]);
  }

  render() {
    if (!this.state.pain || !this.state.bossHealth) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    if(!this.state.pain.series[0]) {
      return (
        <div>
          This pain chart data from Warcraft Logs is corrupted and it cannot be parsed.
        </div>
      );
    }

    const { start, end } = this.props;
    const painBySecond = {
      0: 0,
    };

    this.state.pain.series[0].data.forEach((item) => {
      const secIntoFight = Math.floor((item[0] - start) / 1000);
      painBySecond[secIntoFight] = item[1];
    });

    const bosses = [];
    const deadBosses = [];
    this.state.bossHealth.series.forEach((series) => {
      const newSeries = {
        ...series,
        data: {},
      };

      series.data.forEach((item) => {
        const secIntoFight = Math.floor((item[0] - start) / 1000);

        if (deadBosses.indexOf(series.guid) === -1) {
          const health = item[1];
          newSeries.data[secIntoFight] = health;

          if (health === 0) {
            deadBosses.push(series.guid);
          }
        }
      });
      bosses.push(newSeries);
    });

    const abilitiesAll = {};
    const categories = {
      generated: 'Pain Generators',
      spent: 'Pain Spenders',
    };

    const overCapBySecond = {};
    let lastOverCap;
    let lastSecFight = start;
    this.state.pain.series[0].events.forEach((event) => {
      const secIntoFight = Math.floor((event.timestamp - start) / 1000);
      if (event.waste === 0 && lastOverCap) {
        overCapBySecond[lastOverCap + 1] = 0;
      }
      overCapBySecond[secIntoFight] = event.waste;
      if (event.waste > 0) {
        lastOverCap = secIntoFight;
        // if (!overCapBySecond[secIntoFight - 1])
        //  overCapBySecond[secIntoFight - 1] = 0;
      }
      if (event.type === 'cast') {
        const spell = SPELLS[event.ability.guid];
        if (!abilitiesAll[`${event.ability.guid}_spend`]) {
          abilitiesAll[`${event.ability.guid}_spend`] = {
            ability: {
              category: 'Pain Spenders',
              name: (spell === undefined) ? event.ability.name : spell.name,
              spellId: event.ability.guid,
            },
            spent: 0,
            casts: 0,
            created: 0,
            wasted: 0,
          };
        }
        abilitiesAll[`${event.ability.guid}_spend`].casts += 1;
        const lastPain = lastSecFight === secIntoFight ? painBySecond[lastSecFight - 1] : painBySecond[lastSecFight];
        const spendResource = (spell.painCost !== undefined) ? spell.painCost : (spell.max_pain < lastPain ? spell.max_pain : lastPain);
        abilitiesAll[`${event.ability.guid}_spend`].spent += spendResource;
        abilitiesAll[`${event.ability.guid}_spend`].wasted += spell.max_pain ? spell.max_pain - spendResource : 0;
      } else if (event.type === 'energize') {
        if (!abilitiesAll[`${event.ability.guid}_gen`]) {
          const spell = SPELLS[event.ability.guid];
          abilitiesAll[`${event.ability.guid}_gen`] = {
            ability: {
              category: 'Pain Generators',
              name: (spell === undefined) ? event.ability.name : spell.name,
              spellId: event.ability.guid,
            },
            spent: 0,
            casts: 0,
            created: 0,
            wasted: 0,
          };
        }
        abilitiesAll[`${event.ability.guid}_gen`].casts += 1;
        abilitiesAll[`${event.ability.guid}_gen`].created += event.resourceChange;
        abilitiesAll[`${event.ability.guid}_gen`].wasted += event.waste;
      }
      if (secIntoFight !== lastSecFight) {
        lastSecFight = secIntoFight;
      }
    });

    const abilities = Object.keys(abilitiesAll).map(key => abilitiesAll[key]);
    abilities.sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created === b.created) {
        return 0;
      }
      return -1;
    });

    const fightDurationSec = Math.ceil((end - start) / 1000);
    const labels = [];
    for (let i = 0; i <= fightDurationSec; i += 1) {
      labels.push(i);

      painBySecond[i] = painBySecond[i] !== undefined ? painBySecond[i] : null;
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : null;
      bosses.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : null;
      });
    }


    const chartData = {
      labels,
      datasets: [
        ...bosses.map((series, index) => ({
          label: `${series.name} Health`,
          ...ManaStyles[`Boss-${index}`],
          ...ManaStyles[`Boss-${series.guid}`],
          data: Object.keys(series.data).map(key => series.data[key]),
        })),
        {
          label: `Pain`,
          ...PainStyles.Pain,
          data: Object.keys(painBySecond).map(key => painBySecond[key] / 10),
        },
        {
          label: `Pain wasted`,
          ...PainStyles.Wasted,
          data: Object.keys(overCapBySecond).map(key => overCapBySecond[key]),
        },
      ],
    };

    const gridLines = ManaStyles.gridLines;

    const chartOptions = {
      responsive: true,
      scales: {
        yAxes: [{
          gridLines: gridLines,
          ticks: {
            callback: (percentage, index, values) => {
              return `${percentage}`;
            },
            min: 0,
            max: 100,
            stepSize: 25,
            fontSize: 14,
          },
        }],
        xAxes: [{
          gridLines: gridLines,
          ticks: {
            callback: (seconds, index, values) => {
              if (seconds < ((step - 1) * 30)) {
                step = 0;
              }
              if (step === 0 || seconds >= (step * 30)) {
                step += 1;
                return formatDuration(seconds);
              }
              return null;
            },
            fontSize: 14,
          },
        }],
      },
      animation: {
        duration: 0,
      },
      hover: {
        animationDuration: 0,
      },
      responsiveAnimationDuration: 0,
      tooltips: {
        enabled: false,
      },
      legend: ManaStyles.legend,
    };

    let step = 0;

    return (
      <div>
        <Line
          data={chartData}
          options={chartOptions}
          width={1100}
          height={400}
        />

        <PainComponent
          abilities={abilities}
          categories={categories}
        />
      </div>
    );
  }
}

export default Pain;

