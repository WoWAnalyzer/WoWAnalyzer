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
  LineSeries,
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
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
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

  render() {
    const { pain, wasted, bossData, startTime, endTime } = this.props;

    const xValues = [];
    const yValues = [0, 25, 50, 75, 100];
    for (let i = startTime; i < endTime; i += 60*1000) {
      xValues.push(i);
    }

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
        <XAxis tickValues={xValues} tickFormat={value => formatDuration((value - startTime) / 1000)} />
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
        {bossData.map(boss => (
          <AreaSeries
            data={boss.data}
            color={boss.backgroundColor}
            stroke="transparent"
          />
        ))}
        {bossData.map(boss => (
          <LineSeries
            data={boss.data}
            color={boss.borderColor}
            strokeWidth={2}
          />
        ))}
        <AreaSeries
          data={pain}
          color={this.colors.pain.background}
          stroke="transparent"
        />
        <LineSeries
          data={pain}
          color={this.colors.pain.border}
          strokeWidth={2}
        />
        <AreaSeries
          data={wasted}
          color={this.colors.wasted.background}
          stroke="transparent"
        />
        <LineSeries
          data={wasted}
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

    const pain = this.state.pain.series[0].data.map(([timestamp, amount]) => {
      const x = Math.max(timestamp, start);
      return {
        x,
        y: amount / 10,
      };
    });

    const wasted = this.state.pain.series[0].events
      .filter(event => event.waste !== undefined)
      .map(({ timestamp, waste }) => ({ x: timestamp, y: waste }));

    const bossData = this.state.bossHealth.series.map((series, i) => {
      const data = series.data.map(([timestamp, health]) => ({ x: timestamp, y: health }));
      return {
        title: `${series.name} Health`,
        borderColor: ManaStyles[`Boss-${i}`].borderColor,
        backgroundColor: ManaStyles[`Boss-${i}`].backgroundColor,
        data,
      };
    });

    return (
      <PainChart
        pain={pain}
        wasted={wasted}
        bossData={bossData}
        startTime={start}
        endTime={end}
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

