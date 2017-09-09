// Based on Main/Mana.js

import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import makeWclUrl from 'common/makeWclUrl';

import SPELLS from 'common/SPELLS';

import specialEventIndicators from 'Main/Chartist/specialEventIndicators';

import 'Main/Mana.css';

import PainComponent from './PainComponent';
import './Pain.css';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

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
    const painPromise = fetch(makeWclUrl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceid: actorId,
      abilityid: 118,
    }))
      .then(response => response.json())
      .then((json) => {
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            pain: json,
          });
        }
      });

    const bossHealthPromise = fetch(makeWclUrl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 1,
      abilityid: 1000,
    }))
      .then(response => response.json())
      .then((json) => {
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            bossHealth: json,
          });
        }
      });

    return Promise.all([ painPromise, bossHealthPromise ]);
  }

  render() {
    if (!this.state.pain || !this.state.bossHealth) {
      return (
        <div>
          Loading...
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
    const deathsBySecond = {};
    this.state.pain.deaths.forEach((death) => {
      const secIntoFight = Math.floor((death.timestamp - start) / 1000);

      if (death.targetIsFriendly) {
        deathsBySecond[secIntoFight] = true;
      }
    });


    const abilitiesAll = {};
    const categories = {
      'generated': 'Pain Generators',
      'spent': 'Pain Spenders',
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
      if (event.waste > 0 ) {
        lastOverCap = secIntoFight;
        //if (!overCapBySecond[secIntoFight - 1])
        //  overCapBySecond[secIntoFight - 1] = 0;
      }
      if (event.type === 'cast') {
          const spell = SPELLS[event.ability.guid];
        if (!abilitiesAll[event.ability.guid + '_spend']) {
          abilitiesAll[event.ability.guid + '_spend'] = {
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
        abilitiesAll[event.ability.guid + '_spend'].casts += 1;
        const lastPain = lastSecFight === secIntoFight ? painBySecond[lastSecFight-1] : painBySecond[lastSecFight];
        const spendResource = (spell.painCost !== undefined) ? spell.painCost : (spell.max_pain < lastPain ? spell.max_pain : lastPain);
        abilitiesAll[event.ability.guid + '_spend'].spent += spendResource;
        abilitiesAll[event.ability.guid + '_spend'].wasted += spell.max_pain ? spell.max_pain - spendResource: 0;
      } else if (event.type === 'energize') {
        if (!abilitiesAll[event.ability.guid + '_gen']) {
            const spell = SPELLS[event.ability.guid];
          abilitiesAll[event.ability.guid + '_gen'] = {
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
        abilitiesAll[event.ability.guid + '_gen'].casts += 1;
        abilitiesAll[event.ability.guid + '_gen'].created += event.resourceChange;
        abilitiesAll[event.ability.guid + '_gen'].wasted += event.waste;
      }
      if (secIntoFight !== lastSecFight) {
        lastSecFight = secIntoFight;
      }
    });

    const abilities = Object.keys(abilitiesAll).map((key) => abilitiesAll[key]);
    abilities.sort((a,b) => {
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
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    const chartData = {
      labels: labels,
      series: [
        ...bosses.map((series, index) => ({
          className: `boss-health boss-${index} boss-${series.guid}`,
          name: `${series.name} Health`,
          data: Object.keys(series.data).map(key => series.data[key]),
        })),
        {
          className: 'pain',
          name: 'Pain',
          data: Object.keys(painBySecond).map(key => painBySecond[key]/10),
        },
        {
          className: 'wasted',
          name: 'Pain wasted',
          data: Object.keys(overCapBySecond).map(key => overCapBySecond[key]),
        },
      ],
    };
    let step = 0;

    return (
      <div>
        <ChartistGraph
          data={chartData}
          options={{
            low: 0,
            high: 100,
            showArea: true,
            showPoint: false,
            fullWidth: true,
            height: '300px',
            lineSmooth: Chartist.Interpolation.simple({
              fillHoles: true,
            }),
            axisX: {
              labelInterpolationFnc: function skipLabels(seconds) {
                if (seconds < ((step - 1) * 30)) {
                  step = 0;
                }
                if (step === 0 || seconds >= (step * 30)) {
                  step += 1;
                  return formatDuration(seconds);
                }
                return null;
              },
              offset: 20,
            },
            axisY: {
              onlyInteger: true,
              offset: 35,
              labelInterpolationFnc: function skipLabels(percentage) {
                return `${percentage}`;
              },
            },
            plugins: [
              Chartist.plugins.legend({
                classNames: [
                  ...bosses.map((series, index) => `boss-health boss-${index} boss-${series.guid}`),
                  'pain',
                  'wasted',
                ],
              }),
              specialEventIndicators({
                series: ['death'],
              }),
            ],
          }}
          type="Line"
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
