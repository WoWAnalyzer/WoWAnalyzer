// Based on Main/Mana.js

import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import fetchWcl from 'common/fetchWcl';

import SPELLS from 'common/SPELLS';

import specialEventIndicators from 'Main/Chartist/specialEventIndicators';

import 'Main/Mana.css';

import Abilities from './AbilitiesComponent';
import './Maelstrom.css';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

class Maelstrom extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      mana: null,
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
    const manaPromise = fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceid: actorId,
      abilityid: 111,
    })
      .then(json => {
        this.setState({
          mana: json,
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

    return Promise.all([manaPromise, bossHealthPromise]);
  }

  render() {
    if (!this.state.mana || !this.state.bossHealth) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { start, end } = this.props;

    const manaBySecond = {
      0: 100,
    };
    this.state.mana.series[0].data.forEach((item) => {
      const secIntoFight = Math.floor((item[0] - start) / 1000);
      manaBySecond[secIntoFight] = item[1];
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
    this.state.mana.deaths && this.state.mana.deaths.forEach((death) => {
      const secIntoFight = Math.floor((death.timestamp - start) / 1000);

      if (death.targetIsFriendly) {
        deathsBySecond[secIntoFight] = true;
      }
    });


    const abilitiesAll = {};
    const categories = {
      generated: 'Generated',
      spend: 'Spend',
    };

    const overCapBySecond = {};
    let lastOverCap;
    let lastSecFight = start;
    this.state.mana.series[0].events.forEach((event) => {
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
              category: 'Spend',
              name: spell.name || event.ability.name,
              spellId: event.ability.guid,
            },
            spend: 0,
            casts: 0,
            created: 0,
            wasted: 0,
          };
        }
        abilitiesAll[`${event.ability.guid}_spend`].casts += 1;
        const lastMana = lastSecFight === secIntoFight ? manaBySecond[lastSecFight - 1] : manaBySecond[lastSecFight];
        const spendResource = spell.maelstrom ? spell.maelstrom : (spell.max_maelstrom < lastMana ? spell.max_maelstrom : lastMana);
        abilitiesAll[`${event.ability.guid}_spend`].spend += spendResource;
        abilitiesAll[`${event.ability.guid}_spend`].wasted += spell.max_maelstrom ? spell.max_maelstrom - spendResource : 0;
      } else if (event.type === 'energize') {
        if (!abilitiesAll[`${event.ability.guid}_gen`]) {
          const spell = SPELLS[event.ability.guid];
          abilitiesAll[`${event.ability.guid}_gen`] = {
            ability: {
              category: 'Generated',
              name: spell.name || event.ability.name,
              spellId: event.ability.guid,
            },
            spend: 0,
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

      manaBySecond[i] = manaBySecond[i] !== undefined ? manaBySecond[i] : null;
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : null;
      bosses.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : null;
      });
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    const chartData = {
      labels,
      series: [
        ...bosses.map((series, index) => ({
          className: `boss-health boss-${index} boss-${series.guid}`,
          name: `${series.name} Health`,
          data: Object.keys(series.data).map(key => series.data[key]),
        })),
        {
          className: 'maelstrom',
          name: 'Maelstrom',
          data: Object.keys(manaBySecond).map(key => manaBySecond[key]),
        },
        {
          className: 'wasted',
          name: 'Maelstrom wasted',
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
            high: 130,
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
                  'maelstrom',
                  'wasted',
                ],
              }),
              specialEventIndicators({
                series: ['death'],
              }),
              // tooltips(),
            ],
          }}
          type="Line"
        />
        <Abilities
          abilities={abilities}
          categories={categories}
        />
      </div>
    );
  }
}

export default Maelstrom;
