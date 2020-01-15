import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWclApi';

import ManaStyles from 'interface/others/ManaStyles.js';
import ManaLevelGraph from 'interface/others/charts/ManaLevelGraph';

class ManaLevelChartComponent extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    manaUpdates: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      bossHealth: null,
    };
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reportCode !== this.props.reportCode || prevProps.start !== this.props.start || prevProps.end !== this.props.end || prevProps.offset !== this.props.offset) {
      this.load();
    }
  }

  load() {
    const { reportCode, start, end } = this.props;
    fetchWcl(`report/tables/resources/${reportCode}`, {
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
  }

  render() {
    if (!this.state.bossHealth) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { start, end, offset, manaUpdates } = this.props;
    const initial = manaUpdates[0] ? (manaUpdates[0].current / manaUpdates[0].max) : 1; // if first event is defined, use it to copy first value, otherwise use 100%
    const mana = offset === 0 ?
      [{ x: start, y: 100 }] :
      [{
        x: start,
        y: 100 * initial,
      }]; // start with full mana if we start at the beginning of the fight, otherwise copy first value
    mana.push(...manaUpdates.map(({ timestamp, current, max }) => {
      const x = Math.max(timestamp, start);
      return {
        x,
        y: (current / max) * 100,
      };
    }));

    const bossData = this.state.bossHealth.series.map((series, i) => {
      const data = series.data.map(([timestamp, health]) => ({ x: timestamp, y: health }));

      return {
        id: series.id,
        title: `${series.name} Health`,
        backgroundColor: ManaStyles[`Boss-${i % 6}`].backgroundColor,
        borderColor: ManaStyles[`Boss-${i % 6}`].borderColor,
        data,
      };
    });

    let deaths = [];
    if (this.state.bossHealth.deaths) {
      deaths = this.state.bossHealth.deaths
        .filter(death => !!death.targetIsFriendly)
        .map(({ timestamp }) => ({
          x: timestamp,
        }));
    }

    return (
      <div className="graph-container">
        <ManaLevelGraph
          mana={mana}
          bossData={bossData}
          deaths={deaths}
          startTime={start}
          endTime={end}
          offsetTime={offset}
        />
      </div>
    );
  }
}

export default ManaLevelChartComponent;
