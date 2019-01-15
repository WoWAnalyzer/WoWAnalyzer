import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  AreaSeries,
  LineSeries
} from 'react-vis';

import fetchWcl from 'common/fetchWclApi';
import {formatDuration} from 'common/format';
import SPELLS from 'common/SPELLS';
import ManaStyles from 'interface/others/ManaStyles';

import PainComponent from './PainComponent';
import './Pain.scss';

class PainChart extends React.PureComponent {
  static propTypes = {
    pain: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    wasted: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    bossData: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      borderColor: PropTypes.string.isRequired,
      backgroundColor: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      })).isRequired,
    })).isRequired,
  };

  colors = {
    pain: {
      border: 'rgba(0, 143, 255, 0.6)',
      background: 'rgba(0, 143, 255, 0.08)',
    },
    wasted: {
      border: 'rgba(255, 109, 215, 0.6)',
      background: 'rgba(255, 45, 215, 0.2)',
    },
  };

  fillMissingData(data) {
    // returns a copy of `data` where missing values are equal to the last known value
    // [0, null, 1, null, null, null, 3] => [0, 0, 1, 1, 1, 1, 3]
    const newData = [];
    let lastY = 0;
    data.forEach(({ x, y }) => {
      if (y !== null) {
        lastY = y;
      }
      newData.push({ x, y: lastY });
    });
    return newData;
  }

  render() {
    const { pain, wasted, bossData } = this.props;

    const xValues = [];
    const yValues = [0, 25, 50, 75, 100];
    const start = pain[0].x;
    const end = pain[pain.length - 1].x;
    for (let i = 0; i < (end - start); i += 60) {
      xValues.push(i);
    }

    const fixedPain = this.fillMissingData(pain);
    const fixedWasted = this.fillMissingData(wasted);
    const fixedBossData = bossData.map(({ borderColor, backgroundColor, data }) => ({
      borderColor,
      backgroundColor,
      data: this.fillMissingData(data),
    }));

    return (
      <XYPlot
        height={400}
        yDomain={[0, 100]}
        margin={{
          top: 30,
        }}
      >
        <DiscreteColorLegend
          orientation="horizontal"
          items={[
            ...bossData.map(boss => ({ title: boss.title, color: boss.borderColor })),
            { title: 'Pain', color: this.colors.pain.border },
            { title: 'Pain wasted', color: this.colors.wasted.border },
          ]}
        />
        <XAxis tickValues={xValues} tickFormat={value => formatDuration(value)} />
        <YAxis tickValues={yValues} />
        <VerticalGridLines
          tickValues={xValues}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
            fill: 'white',
          }}
        />
        <HorizontalGridLines
          tickValues={yValues}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
            fill: 'white',
          }}
        />
        {fixedBossData.map(boss => (
          <AreaSeries
            data={boss.data}
            color={boss.backgroundColor}
            stroke="transparent"
            curve="curveCardinal"
          />
        ))}
        {fixedBossData.map(boss => (
          <LineSeries
            data={boss.data}
            color={boss.borderColor}
            strokeWidth={2}
            curve="curveCardinal"
          />
        ))}
        <AreaSeries
          data={fixedPain}
          color={this.colors.pain.background}
          stroke="transparent"
        />
        <LineSeries
          data={fixedPain}
          color={this.colors.pain.border}
          strokeWidth={2}
        />
        <AreaSeries
          data={fixedWasted}
          color={this.colors.wasted.background}
          stroke="transparent"
        />
        <LineSeries
          data={fixedWasted}
          color={this.colors.wasted.border}
          strokeWidth={2}
        />
      </XYPlot>
    );
  }
}

class Pain extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
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

  get plot() {
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

        if (!deadBosses.includes(series.guid)) {
          const health = item[1];
          newSeries.data[secIntoFight] = health;

          if (health === 0) {
            deadBosses.push(series.guid);
          }
        }
      });
      bosses.push(newSeries);
    });

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
      }
      if (secIntoFight !== lastSecFight) {
        lastSecFight = secIntoFight;
      }
    });

    const fightDurationSec = Math.ceil((end - start) / 1000);
    for (let i = 0; i <= fightDurationSec; i += 1) {
      painBySecond[i] = painBySecond[i] !== undefined ? painBySecond[i] : null;
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : null;
      bosses.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : null;
      });
    }

    const pain = Object.entries(painBySecond).filter(([key]) => !Number.isNaN(Number(key))).map(([key, value]) => ({ x: Number(key), y: value / 10 }));
    const wasted = Object.entries(overCapBySecond).filter(([key]) => !Number.isNaN(Number(key))).map(([key, value]) => ({ x: Number(key), y: value }));
    const bossData = bosses.map((series, index) => ({
      title: `${series.name} Health`,
      borderColor: ManaStyles[`Boss-${index}`].borderColor,
      backgroundColor: ManaStyles[`Boss-${index}`].backgroundColor,
      data: Object.entries(series.data).map(([key, value]) => ({ x: Number(key), y: value })),
    }));

    return (
      <PainChart
        pain={pain}
        wasted={wasted}
        bossData={bossData}
      />
    );
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

    const { start } = this.props;
    const painBySecond = {
      0: 0,
    };
    this.state.pain.series[0].data.forEach((item) => {
      const secIntoFight = Math.floor((item[0] - start) / 1000);
      painBySecond[secIntoFight] = item[1];
    });

    const abilitiesAll = {};
    const categories = {
      generated: 'Pain Generators',
      spent: 'Pain Spenders',
    };

    let lastSecFight = start;
    this.state.pain.series[0].events.forEach((event) => {
      const secIntoFight = Math.floor((event.timestamp - start) / 1000);
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
        const spendResource = spell !== undefined ? ((spell.painCost !== undefined) ? spell.painCost : (spell.max_pain < lastPain ? spell.max_pain : lastPain)) : 0;
        abilitiesAll[`${event.ability.guid}_spend`].spent += spendResource;
        abilitiesAll[`${event.ability.guid}_spend`].wasted += spell.max_pain !== undefined ? spell.max_pain - spendResource : 0;
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

    return (
      <>
        {this.plot}
        <PainComponent
          abilities={abilities}
          categories={categories}
        />
      </>
    );
  }
}

export default Pain;

