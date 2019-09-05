import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWclApi';

import RaidHealthChart from './RaidHealthChart';

const CLASS_CHART_LINE_COLORS = {
  DeathKnight: 'rgba(196, 31, 59, 0.6)',
  Druid: 'rgba(255, 125, 10, 0.6)',
  Hunter: 'rgba(171, 212, 115, 0.6)',
  Mage: 'rgba(105, 204, 240, 0.6)',
  Monk: 'rgba(45, 155, 120, 0.6)',
  Paladin: 'rgba(245, 140, 186, 0.6)',
  Priest: 'rgba(255, 255, 255, 0.6)',
  Rogue: 'rgba(255, 245, 105, 0.6)',
  Shaman: 'rgba(36, 89, 255, 0.6)',
  Warlock: 'rgba(148, 130, 201, 0.6)',
  Warrior: 'rgba(199, 156, 110, 0.6)',
  DemonHunter: 'rgba(163, 48, 201, 0.6)',
};


class Graph extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      data: null,
    };
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reportCode !== this.props.reportCode || prevProps.actorId !== this.props.actorId || prevProps.start !== this.props.start || prevProps.end !== this.props.end) {
      this.update();
    }
  }

  update() {
    this.load(this.props.reportCode, this.props.actorId, this.props.start, this.props.end);
  }

  load(reportCode, actorId, start, end) {
    return fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      abilityid: 1000,
    })
      .then(json => {
        console.log('Received player health', json);
        this.setState({
          data: json,
        });
      });
  }

  render() {
    const data = this.state.data;
    if (!data) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { start, end, offset } = this.props;

    const players = data.series.filter(item => !!CLASS_CHART_LINE_COLORS[item.type]);

    const entities = [];

    players.forEach(series => {
      const newSeries = {
        ...series,
        lastValue: 100, // fights start at full hp
        data: {},
      };

      series.data.forEach((item) => {
        const secIntoFight = Math.floor((item[0] - start) / 1000);

        const health = item[1];
        newSeries.data[secIntoFight] = Math.min(100, health);
      });
      entities.push(newSeries);
    });

    const deathsBySecond = {};
    if (this.state.data.deaths) {
      this.state.data.deaths.forEach((death) => {
        const secIntoFight = Math.floor((death.timestamp - start) / 1000);

        if (death.targetIsFriendly) {
          deathsBySecond[secIntoFight] = true;
        }
      });
    }

    const fightDurationSec = Math.ceil((end - start) / 1000);
    for (let i = 0; i <= fightDurationSec; i += 1) {
      entities.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : series.lastValue;
        series.lastValue = series.data[i];
      });
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    // transform data into react-vis format
    const playerHealth = entities.map(player => {
      const data = Object.entries(player.data).map(([key, value]) => ({ x: Number(key), y: value }));
      return {
        title: player.name,
        backgroundColor: CLASS_CHART_LINE_COLORS[player.type],
        borderColor: CLASS_CHART_LINE_COLORS[player.type],
        data,
      };
    });
    const deaths = Object.entries(deathsBySecond).filter(([_, value]) => !!value).map(([key]) => ({ x: Number(key) }));

    return (
      <div className="graph-container">
        <RaidHealthChart
          players={playerHealth}
          deaths={deaths}
          startTime={start}
          endTime={end}
          offsetTime={offset}
        />
      </div>
    );
  }
}

export default Graph;
