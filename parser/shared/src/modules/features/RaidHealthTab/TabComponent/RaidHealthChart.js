import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer } from 'react-virtualized';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { t } from '@lingui/macro';

const DEATH_COLOR = 'rgba(255, 0, 0, 0.8)';

class RaidHealthChart extends React.Component {
  static propTypes = {
    players: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      borderColor: PropTypes.string.isRequired,
      backgroundColor: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      })).isRequired,
    })).isRequired,
    deaths: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
    })).isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      players: this.props.players.map(player => ({ disabled: false, ...player })),
    };
    this.togglePlayer = this.togglePlayer.bind(this);
  }

  state = {
    players: [],
  };

  togglePlayer(index) {
    this.setState((prevState) => {
      const players = prevState.players;
      players[index].disabled = !players[index].disabled;
      return {
        players,
      };
    });
  }

  render() {
    const { players, deaths, startTime, endTime } = this.props;
    const xValues = [];
    const yValues = [];
    for (let i = 0; i < (endTime - startTime) / 1000; i += 30) {
      xValues.push(i);
    }
    for (let i = 0; i <= players.length; i += 2) {
      yValues.push(i * 100);
    }

    const xAxis = {
      field: 'x',
      type: 'quantitative',
      title: 'Time',
      axis: {
        labelExpr: formatTime('datum.value * 1000'),
      },
    };

    const deathSpec = {
      data: {
        name: 'deaths',
      },
      mark: {
        type: 'rule',
        color: DEATH_COLOR,
      },
      encoding: {
        x: xAxis,
      },
    };

    const hpSpec = {
      data: {
        name: 'hp',
      },
      mark: 'area',
      selection: {
        player: {
          type: 'multi',
          fields: ['title'],
          bind: 'legend',
        },
      },
      encoding: {
        x: xAxis,
        y: {
          field: 'y',
          type: 'quantitative',
          stack: true,
          title: t({
            id: "shared.modules.raidHealthTab.chart.title.y",
            message: `Total Raid Health`
          }),
        },
        color: {
          field: 'title',
          type: 'nominal',
          title: t({
            id: "common.player",
            message: `Player`
          }),
        },
        opacity: {
          condition: { selection: 'player', value: 1 },
          value: 0.3,
        },
      },
    };
    const data = {
      hp: [].concat(...players.map(p => p.data.map(datum => ({...datum, title: p.title })))),
      deaths,
    };

    const spec = {
      layer: [hpSpec, deathSpec],
    };

    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <BaseChart
            height={400}
            width={width}
            spec={spec}
            data={data}
          />
        )}
      </AutoSizer>
    );
  }
}

export default RaidHealthChart;
