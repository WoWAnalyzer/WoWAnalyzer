import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';

interface StackTracker {
  timestamp: number;
  stacks: number;
}

interface CastTracker {
  timestamp: number;
  stacks: number;
}

interface CountTracker {
  timestamp: number;
  count: number;
}

/**
 * Graph showing Abundance (Rejuvenation) stack count over time, with Regrowth casts overlaid.
 * Helps players visualize their Rejuv ramp → Regrowth spam gameplay loop.
 * Only active when Abundance is talented.
 */
class AbundanceGraph extends Analyzer {
  stackChanges: StackTracker[] = [];
  regrowthCasts: CastTracker[] = [];
  regrowthHotChanges: CountTracker[] = [];

  currentStacks = 0;
  currentRegrowthHots = 0;
  hasNaturesBounty = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    this.hasNaturesBounty = this.selectedCombatant.hasTalent(TALENTS_DRUID.NATURES_BOUNTY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ABUNDANCE_BUFF),
      this.onAbundanceApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.ABUNDANCE_BUFF),
      this.onAbundanceStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ABUNDANCE_BUFF),
      this.onAbundanceRemoveStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ABUNDANCE_BUFF),
      this.onAbundanceRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthCast,
    );
    if (this.hasNaturesBounty) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
        this.onRegrowthHotApply,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
        this.onRegrowthHotRemove,
      );
    }
  }

  onAbundanceApply(_event: ApplyBuffEvent) {
    this.currentStacks = 1;
    this.handleChange(_event.timestamp);
  }

  onAbundanceStack(event: ApplyBuffStackEvent) {
    this.currentStacks = event.stack;
    this.handleChange(event.timestamp);
  }

  onAbundanceRemoveStack(event: RemoveBuffStackEvent) {
    this.currentStacks = event.stack;
    this.handleChange(event.timestamp);
  }

  onAbundanceRemove(_event: RemoveBuffEvent) {
    this.currentStacks = 0;
    this.handleChange(_event.timestamp);
  }

  handleChange(timestamp: number) {
    // Add a point at the previous stack count to create a step function
    if (this.stackChanges.length !== 0) {
      const prev = this.stackChanges[this.stackChanges.length - 1];
      this.stackChanges.push({
        timestamp,
        stacks: prev.stacks,
      });
    }
    this.stackChanges.push({
      timestamp,
      stacks: this.currentStacks,
    });
  }

  onRegrowthCast(event: CastEvent) {
    this.regrowthCasts.push({
      timestamp: event.timestamp,
      stacks: this.currentStacks,
    });
  }

  onRegrowthHotApply(event: ApplyBuffEvent) {
    this.currentRegrowthHots += 1;
    this.handleRegrowthHotChange(event.timestamp);
  }

  onRegrowthHotRemove(event: RemoveBuffEvent) {
    this.currentRegrowthHots = Math.max(0, this.currentRegrowthHots - 1);
    this.handleRegrowthHotChange(event.timestamp);
  }

  handleRegrowthHotChange(timestamp: number) {
    if (this.regrowthHotChanges.length !== 0) {
      const prev = this.regrowthHotChanges[this.regrowthHotChanges.length - 1];
      this.regrowthHotChanges.push({
        timestamp,
        count: prev.count,
      });
    }
    this.regrowthHotChanges.push({
      timestamp,
      count: this.currentRegrowthHots,
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
        name: 'stackChanges',
      },
      transform: [
        {
          filter: 'isValid(datum.stacks)',
        },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: xAxis,
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: '#a010a0',
              strokeWidth: 1,
            },
            color: 'rgba(160, 16, 160, .15)',
          },
          encoding: {
            y: {
              field: 'stacks',
              type: 'quantitative' as const,
              title: 'Count',
              axis: {
                grid: false,
                format: '~s',
              },
            },
            tooltip: [
              {
                field: 'stacks',
                type: 'quantitative' as const,
                title: 'Abundance Stacks',
              },
            ],
          },
        },
        ...(this.hasNaturesBounty
          ? [
              {
                data: {
                  name: 'regrowthHotChanges',
                },
                mark: {
                  type: 'area' as const,
                  line: {
                    interpolate: 'linear' as const,
                    color: '#20a020',
                    strokeWidth: 1,
                  },
                  color: 'rgba(32, 160, 32, .15)',
                },
                transform: [
                  {
                    filter: 'isValid(datum.count)',
                  },
                  {
                    calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
                    as: 'timestamp_shifted',
                  },
                ],
                encoding: {
                  x: xAxis,
                  y: {
                    field: 'count',
                    type: 'quantitative' as const,
                    title: 'Count',
                  },
                  tooltip: [
                    {
                      field: 'count',
                      type: 'quantitative' as const,
                      title: 'Regrowth HoTs',
                    },
                  ],
                },
              },
            ]
          : []),
        {
          data: {
            name: 'regrowthCasts',
          },
          mark: {
            type: 'point' as const,
            shape: 'diamond',
            filled: true,
            size: 50,
            stroke: '#000000',
            strokeWidth: 0.5,
          },
          transform: [
            {
              calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
              as: 'timestamp_shifted',
            },
            {
              calculate:
                'datum.stacks >= 8 ? "8+ stacks" : datum.stacks >= 6 ? "6-7 stacks" : "< 6 stacks"',
              as: 'stackCategory',
            },
          ],
          encoding: {
            x: xAxis,
            y: {
              field: 'stacks',
              type: 'quantitative' as const,
              title: 'Count',
            },
            color: {
              field: 'stackCategory',
              type: 'nominal' as const,
              scale: {
                domain: ['8+ stacks', '6-7 stacks', '< 6 stacks'],
                range: ['#4488ff', '#cccc00', '#ff4444'],
              },
              title: 'Regrowth cast',
            },
            tooltip: [
              {
                field: 'stacks',
                type: 'quantitative' as const,
                title: 'Abundance Stacks',
              },
            ],
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
          titlePadding: 40,
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
                stackChanges: this.stackChanges,
                regrowthCasts: this.regrowthCasts,
                regrowthHotChanges: this.regrowthHotChanges,
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  get guideSubsection() {
    return (
      <>
        <strong>
          <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} />
        </strong>{' '}
        — this graph shows your <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> stacks over the
        fight, with <SpellLink spell={SPELLS.REGROWTH} /> casts and active{' '}
        <SpellLink spell={SPELLS.REGROWTH} /> HoTs overlaid. You want to ramp{' '}
        <SpellLink spell={SPELLS.REJUVENATION} /> on the group before or as damage hits to set up an{' '}
        <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> window where you can spam{' '}
        <SpellLink spell={SPELLS.REGROWTH} />. During this window,{' '}
        <SpellLink spell={SPELLS.REGROWTH} /> is extremely cheap and guaranteed to crit, so you
        should be casting it repeatedly while your stacks are high.
        <br />
        <br />
        The number of <SpellLink spell={SPELLS.REGROWTH} /> casts in this window depends on the
        fight and incoming damage
        {this.hasNaturesBounty && (
          <>
            —early casts are very efficient, and even as stacks start to fall off, additional active{' '}
            <SpellLink spell={SPELLS.REGROWTH} /> HoTs increase the value of each cast through{' '}
            <SpellLink spell={TALENTS_DRUID.NATURES_BOUNTY_TALENT} />
          </>
        )}
        . In general, your gameplay should cycle between ramping with{' '}
        <SpellLink spell={SPELLS.REJUVENATION} /> and then spending that window with high{' '}
        <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> stacks casting{' '}
        <SpellLink spell={SPELLS.REGROWTH} />.
        <br />
        <br />
        On the graph, this should show up as clear cycles:{' '}
        <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> stacks rising during your{' '}
        <SpellLink spell={SPELLS.REJUVENATION} /> ramp, followed by a series of{' '}
        <SpellLink spell={SPELLS.REGROWTH} /> casts while stacks are high or healing is needed, then
        going back into your <SpellLink spell={SPELLS.REJUVENATION} /> ramp again.
        <div style={{ marginTop: 15 }}>{this.plot}</div>
      </>
    );
  }
}

export default AbundanceGraph;
