import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWclApi';

import ManaStyles from 'interface/others/ManaStyles.js';
import ManaChart from './ManaChart';

class Mana extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    manaUpdates: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
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
    return fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 1,
      abilityid: 1000,
    })
      .then(json => {
        console.log('Received boss health', json);
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

    const { start, end, manaUpdates } = this.props;

    const mana = manaUpdates.map(({ timestamp, current, max }) => {
      const x = Math.max(timestamp, start);
      return {
        x,
        y: (current / max) * 100,
      };
    });

    let deaths = null;
    if (this.state.bossHealth.deaths) {
      deaths = this.state.bossHealth.deaths
        .filter(death => death.targetID === this.props.actorId)
        .map(({ timestamp }) => ({ x: timestamp }));
    }

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
      <div>
        Playing Arcane well typically involves managing your mana properly. Things such as not going OOM during Arcane Power, not letting your mana cap, and ensuring you end the fight with as little mana as possible will all help in improving your DPS.<br /><br />

        <div className="graph-container">
          <ManaChart
            mana={mana}
            deaths={deaths}
            bossData={bossData}
            startTime={start}
            endTime={end}
          />
        </div>
      </div>
    );
  }
}

export default Mana;

