import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import Panel from 'parser/ui/Panel';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { SPELL_COLORS } from '../../constants';

type SpellTracker = {
  timestamp: number;
  remCount: number;
};

class REMGraph extends Analyzer {
  remChanges: SpellTracker[] = [];
  vivifyCasts: SpellTracker[] = [];
  instantVivifyCasts: SpellTracker[] = [];
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
    if (this.selectedCombatant.hasBuff(SPELLS.VIVIFICATION_BUFF.id)) {
      this.instantVivifyCasts.push({
        timestamp: event.timestamp,
        remCount: this.currentRems,
      });
    } else {
      this.vivifyCasts.push({
        timestamp: event.timestamp,
        remCount: this.currentRems,
      });
    }
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
      title: 'Time',
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
        color: { value: 'black' },
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
              title: 'Count',
              axis: {
                grid: false,
                format: '~s',
              },
            },
            color: { value: 'rgba(45, 155, 120, .15)' },
          },
        },

        {
          data: {
            name: 'vivifyCasts',
          },
          mark: {
            type: 'point' as const,
            shape: 'circle',
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
              title: 'Count',
            },
            color: { datum: 'Vivify cast' },
          },
        },

        {
          data: {
            name: 'instantVivifyCasts',
          },
          mark: {
            type: 'point' as const,
            shape: 'circle',
            filled: true,
            size: 70,
            fillOpacity: 1,
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
              title: 'Count',
            },
            color: {
              datum: 'Instant Vivify',
            },
          },
        },

        {
          data: {
            name: 'rskCast',
          },
          mark: {
            type: 'point' as const,
            shape: 'triangle-down',
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
              title: 'Count',
            },
            color: { datum: 'Rising Sun Kick', value: SPELL_COLORS.RISING_SUN_KICK },
          },
        },
      ],
      config: {
        axis: {
          titleFontWeight: 'normal',
          titleFontSize: 14,
        },
        axisY: {
          titleAngle: 360,
          titlePadding: 25,
        },
      },
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
                instantVivifyCasts: this.instantVivifyCasts,
                rskCast: this.rskCasts,
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
        position={99}
        explanation={
          <>
            <SpellLink spell={SPELLS.VIVIFY} /> also heals any targets that have{' '}
            <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />. This means casting{' '}
            <SpellLink spell={SPELLS.VIVIFY} /> while having high amounts of{' '}
            <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> will greatly increase its
            healing. Normal <SpellLink spell={SPELLS.VIVIFY} /> casts are shown as blue dots, while
            a cast consuming a <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} /> buff
            is orange. Red triangles indicate{' '}
            <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> casts.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default REMGraph;
