import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWclApi';

import ManaLevelGraph from 'parser/ui/ManaLevelGraph';

class ManaLevelChartComponent extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    combatants: PropTypes.object.isRequired,
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

    const { start, offset, manaUpdates, combatants } = this.props;
    const initial = manaUpdates[0] ? (manaUpdates[0].current / manaUpdates[0].max) : 1; // if first event is defined, use it to copy first value, otherwise use 100%
    const mana = offset === 0 ?
      [{ x: 0, y: 100 }] :
      [{
        x: 0,
        y: 100 * initial,
      }]; // start with full mana if we start at the beginning of the fight, otherwise copy first value
    mana.push(...manaUpdates.map(({ timestamp, current, max }) => {
      const x = Math.max(timestamp, start) - start;
      return {
        x,
        y: (current / max) * 100,
      };
    }));

    const bossData = this.state.bossHealth.series.map((series) => {
      const data = series.data.map(([timestamp, health]) => ({ x: timestamp - start, y: health }));

      return {
        id: series.id,
        title: `${series.name} Health`,
        data,
      };
    });

    let deaths = [];
    if (this.state.bossHealth.deaths) {
      deaths = this.state.bossHealth.deaths
        .filter(death => Boolean(death.targetIsFriendly))
        .map(({ timestamp, targetID, killingAbility }) => ({
          x: timestamp - start,
          name: combatants.players[targetID].name,
          ability: killingAbility ? killingAbility.name : 'Unknown Ability',
        }));
    }

    return (
      <div className="graph-container">
        <ManaLevelGraph
          mana={mana}
          bossData={bossData}
          deaths={deaths}
        />
      </div>
    );
  }
}

export default ManaLevelChartComponent;
