import fetchWcl from 'common/fetchWclApi';
import ManaLevelGraph from 'parser/ui/ManaLevelGraph';
import ManaStyles from 'parser/ui/ManaStyles';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

class Mana extends PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    manaUpdates: PropTypes.array.isRequired,
    offsetTime: PropTypes.number.isRequired,
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
    if (
      prevProps.reportCode !== this.props.reportCode ||
      prevProps.start !== this.props.start ||
      prevProps.end !== this.props.end
    ) {
      this.load();
    }
  }

  load() {
    const { reportCode, start, end } = this.props;
    fetchWcl(`report/graph/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 'Enemies',
      abilityid: 1000,
    }).then((json) => {
      this.setState({
        bossHealth: json,
      });
    });
  }

  render() {
    if (!this.state.bossHealth) {
      return <div>Loading...</div>;
    }

    const { start, end, manaUpdates, offsetTime } = this.props;

    const mana = manaUpdates.map(({ timestamp, current, max }) => {
      const x = Math.max(timestamp, start) - start;
      return {
        x,
        y: (current / max) * 100,
      };
    });

    let deaths = [];
    if (this.state.bossHealth.deaths) {
      deaths = this.state.bossHealth.deaths
        .filter((death) => death.targetID === this.props.actorId)
        .map(({ timestamp, killingAbility }) => ({
          x: timestamp - start,
          ability: killingAbility ? killingAbility.name : 'Unknown Ability',
        }));
    }

    const bossData = this.state.bossHealth.series.map((series, i) => {
      const data = series.data.map(([timestamp, health]) => ({ x: timestamp - start, y: health }));

      return {
        title: `${series.name} Health`,
        borderColor: ManaStyles[`Boss-${i}`].borderColor,
        backgroundColor: ManaStyles[`Boss-${i}`].backgroundColor,
        data,
      };
    });

    return (
      <div>
        <br />
        <div className="graph-container">
          <ManaLevelGraph
            mana={mana}
            deaths={deaths}
            bossData={bossData}
            offsetTime={offsetTime}
            startTime={start}
            endTime={end}
          />
        </div>
      </div>
    );
  }
}

export default Mana;
