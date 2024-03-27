import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  FightEndEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import Panel from 'parser/ui/Panel';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { TALENTS_MONK } from 'common/TALENTS';

type SpellTracker = {
  timestamp: number;
  motcCount: number;
  motcAverage: number;
  bdbCount: number;
};

class MoTCGraph extends Analyzer {
  currentBDB: number = 0;

  motcStacks: SpellTracker[] = [];
  normalSCKCasts: SpellTracker[] = [];
  docjSCKCasts: SpellTracker[] = [];

  currentMOTC: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.sckCast,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.MARK_OF_THE_CRANE),
      this.motcApplied,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.MARK_OF_THE_CRANE),
      this.motcRemoved,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.BONEDUST_BREW_TALENT),
      this.bdbApplied,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.BONEDUST_BREW_TALENT),
      this.bdbRemoved,
    );

    this.addEventListener(Events.fightend, this.endPoint);
  }

  sckCast(event: CastEvent) {
    const data = {
      timestamp: event.timestamp,
      motcCount: this.currentMOTC,
      motcAverage: 0,
      bdbCount: this.currentBDB,
    };

    if (this.selectedCombatant.hasBuff(SPELLS.DANCE_OF_CHI_JI_BUFF.id)) {
      this.docjSCKCasts.push(data);
    } else {
      this.normalSCKCasts.push(data);
    }
  }

  motcApplied(event: ApplyDebuffEvent) {
    this.currentMOTC += 1;

    this.handleMoTCChange(event.timestamp);
  }

  motcRemoved(event: RemoveDebuffEvent) {
    this.currentMOTC -= 1;
    this.handleMoTCChange(event.timestamp);
  }

  handleMoTCChange(timestamp: number) {
    if (this.motcStacks.length !== 0) {
      const json = this.motcStacks[this.motcStacks.length - 1];
      this.motcStacks.push({
        timestamp: timestamp,
        motcCount: json.motcCount,
        motcAverage: 0,
        bdbCount: json.bdbCount,
      });
    }

    this.motcStacks.push({
      timestamp: timestamp,
      motcCount: this.currentMOTC,
      motcAverage: 0,
      bdbCount: this.currentBDB,
    });
  }

  bdbApplied(event: ApplyDebuffEvent) {
    this.currentBDB += 1;

    this.handleBDBChange(event.timestamp);
  }

  bdbRemoved(event: RemoveDebuffEvent) {
    this.currentBDB -= 1;
    this.handleBDBChange(event.timestamp);
  }

  handleBDBChange(timestamp: number) {
    if (this.motcStacks.length !== 0) {
      const json = this.motcStacks[this.motcStacks.length - 1];
      this.motcStacks.push({
        timestamp: timestamp,
        motcCount: json.motcCount,
        motcAverage: 0,
        bdbCount: json.bdbCount,
      });
    }

    this.motcStacks.push({
      timestamp: timestamp,
      motcCount: this.currentMOTC,
      motcAverage: 0,
      bdbCount: this.currentBDB,
    });
  }

  endPoint(event: FightEndEvent) {
    this.handleMoTCChange(event.timestamp);
    this.handleBDBChange(event.timestamp);
    // calculate medium
    let average = 0;
    this.motcStacks.forEach((e) => {
      average += e.motcCount;
    });

    average = average / this.motcStacks.length;
    this.motcStacks.forEach((e) => {
      e.motcAverage = average;
    });
  }

  get plot() {
    const xAxis = {
      field: 'timestamp_shifted',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value'),
        tickCount: 25,
        grid: false,
      },
      scale: {
        nice: false,
      },
      title: null,
    };

    const spec: VisualizationSpec = {
      data: {
        name: 'motcStacks',
      },
      transform: [
        {
          filter: 'isValid(datum.motcCount)',
        },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: xAxis,
        tooltip: [
          {
            field: 'motcCount',
            type: 'quantitative' as const,
            title: 'Mark of the Crane Count',
            format: '.3~s',
          },
          {
            field: 'bdbCount',
            type: 'quantitative' as const,
            title: 'Bonedust Brew Debuffs',
            format: '.3~s',
          },
          {
            field: 'motcAverage',
            type: 'quantitative' as const,
            title: 'Mark of the Crane Average',
            format: '.3~s',
          },
        ],
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: '#fab700',
              strokeWidth: 1,
            },
            color: 'rgba(250, 183, 0, 0.15)',
          },
          encoding: {
            y: {
              field: 'motcCount',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: '#abeabe',
              strokeWidth: 1,
            },
            color: 'rgba(45, 155, 120, .15)',
          },
          encoding: {
            y: {
              field: 'bdbCount',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        {
          mark: {
            type: 'line' as const,
            color: 'rgba(45, 155, 120)',
            strokeDash: [5, 5],
          },
          encoding: {
            y: {
              field: 'motcAverage',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },

        {
          data: {
            name: 'normalSCKCasts',
          },
          mark: {
            type: 'point' as const,
            shape: 'circle',
            color: '#C202C2', // Magenta
            filled: true,
            size: 70,
          },
          transform: [
            {
              calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
              as: 'timestamp_shifted',
            },
          ],
          encoding: {
            x: xAxis,
            y: {
              field: 'motcCount',
              type: 'quantitative' as const,
              title: null,
            },
          },
        },

        {
          data: {
            name: 'docjSCKCasts',
          },
          mark: {
            type: 'point' as const,
            shape: 'triangle-down',
            color: '#FCA000', // orange
            filled: true,
            size: 70,
          },
          transform: [
            {
              calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
              as: 'timestamp_shifted',
            },
          ],
          encoding: {
            x: xAxis,
            y: {
              field: 'motcCount',
              type: 'quantitative' as const,
              title: null,
            },
          },
        },
      ],
    };

    return (
      <div
        className="graph-container"
        style={{
          width: '100%',
          minHeight: 200,
        }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <BaseChart
              spec={spec}
              data={{
                motcStacks: this.motcStacks,
                normalSCKCasts: this.normalSCKCasts,
                docjSCKCasts: this.docjSCKCasts,
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  statistic() {
    return (
      <Panel
        title="Mark of The Crane"
        position={100}
        explanation={
          <>
            <SpellLink spell={SPELLS.MARK_OF_THE_CRANE} /> greatly increased the damage{' '}
            <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} /> does. This means you want to cast it at
            high stacks. Magenta dots are regular <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} />{' '}
            casts while Orange triangles are <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} />{' '}
            empowered by <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} />.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default MoTCGraph;
