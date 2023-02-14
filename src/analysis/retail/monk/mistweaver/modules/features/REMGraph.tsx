import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import Panel from 'parser/ui/Panel';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

type SpellTracker = {
  timestamp: number;
  remCount: number;
};

class REMGraph extends Analyzer {
  remChanges: SpellTracker[] = [];
  vivifyCasts: SpellTracker[] = [];
  rskCasts: SpellTracker[] = [];

  currentRems: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivifyCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.rskCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.remApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.remRemoved,
    );
  }

  vivifyCast(event: CastEvent) {
    this.vivifyCasts.push({
      timestamp: event.timestamp,
      remCount: this.currentRems,
    });
  }

  rskCast(event: CastEvent) {
    this.rskCasts.push({
      timestamp: event.timestamp,
      remCount: this.currentRems,
    });
  }

  remApplied(event: ApplyBuffEvent) {
    this.currentRems += 1;

    this.handleChange(event.timestamp);
  }

  remRemoved(event: RemoveBuffEvent) {
    this.currentRems -= 1;
    this.handleChange(event.timestamp);
  }

  handleChange(timestamp: number) {
    if (this.remChanges.length !== 0) {
      const json = this.remChanges[this.remChanges.length - 1];
      this.remChanges.push({
        timestamp: timestamp,
        remCount: json.remCount,
      });
    }

    this.remChanges.push({
      timestamp: timestamp,
      remCount: this.currentRems,
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
        name: 'remChanges',
      },
      transform: [
        {
          filter: 'isValid(datum.remCount)',
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
            field: 'remCount',
            type: 'quantitative' as const,
            title: 'Renewing Mist Count',
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
              color: '#238767',
              strokeWidth: 1,
            },
            color: 'rgba(45, 155, 120, .15)',
          },
          encoding: {
            y: {
              field: 'remCount',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
            color: { datum: 'Renewing Mist' },
          },
        },

        {
          data: {
            name: 'vivifyCasts',
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
              field: 'remCount',
              type: 'quantitative' as const,
              title: null,
            },
            color: { datum: 'Vivify cast' },
          },
        },

        {
          data: {
            name: 'rskCasts',
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
              field: 'remCount',
              type: 'quantitative' as const,
              title: null,
            },
            color: { datum: 'Rising Sun Kick cast' },
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
                remChanges: this.remChanges,
                vivifyCasts: this.vivifyCasts,
                rskCasts: this.rskCasts,
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
        title="Renewing Mist Graph"
        position={100}
        explanation={
          <>
            <SpellLink id={SPELLS.VIVIFY.id} /> also heals any targets that have{' '}
            <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />. This means casting{' '}
            <SpellLink id={SPELLS.VIVIFY.id} /> while having high amounts of{' '}
            <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> will greatly increase its
            healing. Magenta dots are <SpellLink id={SPELLS.VIVIFY.id} /> casts while Orange
            triangles are <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} /> casts.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default REMGraph;
