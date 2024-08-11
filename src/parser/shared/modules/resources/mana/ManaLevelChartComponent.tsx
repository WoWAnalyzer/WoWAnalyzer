import fetchWcl from 'common/fetchWclApi';
import { WCLBossResources } from 'common/WCL_TYPES';
import { DeathEvent } from 'parser/core/Events';
import ManaLevelGraph from 'parser/ui/ManaLevelGraph';
import { PureComponent } from 'react';

interface Props {
  reportCode: string;
  start: number;
  end: number;
  offset: number;
  combatants: any;
  manaUpdates: any[];
  height?: number;
}

interface State {
  bossHealth: WCLBossResources | null;
}

class ManaLevelChartComponent extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      bossHealth: null,
    };
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (
      prevProps.reportCode !== this.props.reportCode ||
      prevProps.start !== this.props.start ||
      prevProps.end !== this.props.end ||
      prevProps.offset !== this.props.offset
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
        bossHealth: json as WCLBossResources,
      });
    });
  }

  render() {
    if (!this.state.bossHealth) {
      return <div>Loading...</div>;
    }

    const { start, offset, manaUpdates, combatants } = this.props;
    const initial = manaUpdates[0] ? manaUpdates[0].current / manaUpdates[0].max : 1; // if first event is defined, use it to copy first value, otherwise use 100%
    const mana =
      offset === 0
        ? [{ x: 0, y: 100 }]
        : [
            {
              x: 0,
              y: 100 * initial,
            },
          ]; // start with full mana if we start at the beginning of the fight, otherwise copy first value
    mana.push(
      ...manaUpdates.map(({ timestamp, current, max }) => {
        const x = Math.max(timestamp, start) - start;
        return {
          x,
          y: (current / max) * 100,
        };
      }),
    );

    const bossData = this.state.bossHealth.series.map((series: any) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const data = series.data.map(([timestamp, health]) => ({ x: timestamp - start, y: health }));

      return {
        id: series.id,
        title: `${series.name} Health`,
        data,
      };
    });

    let deaths: Array<{ x: number; name: string; ability: string }> = [];
    if (this.state.bossHealth.deaths) {
      deaths = this.state.bossHealth.deaths
        .filter((death: DeathEvent) => Boolean(death.targetIsFriendly))
        .map(({ timestamp, targetID, killingAbility }: DeathEvent) => ({
          x: timestamp - start,
          name: combatants.players[targetID] ? combatants.players[targetID].name : 'Unknown Player',
          ability: killingAbility ? killingAbility.name : 'Unknown Ability',
        }));
    }

    return (
      <div className="graph-container">
        <ManaLevelGraph
          mana={mana}
          bossData={bossData}
          deaths={deaths}
          height={this.props.height}
        />
      </div>
    );
  }
}

export default ManaLevelChartComponent;
