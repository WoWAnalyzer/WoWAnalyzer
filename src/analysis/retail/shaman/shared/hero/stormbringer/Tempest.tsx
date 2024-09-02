import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
  RemoveBuffEvent,
  SpendResourceEvent,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import typedKeys from 'common/typedKeys';
import RESOURCE_TYPES, { Resource } from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import { CompositeEncoding } from 'vega-lite/build/src/compositemark';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import Panel from 'parser/ui/Panel';
import { SubSection } from 'interface/guide';

type WasteType = 'maelstrom' | 'awakening-storms';

interface SpecOptions {
  requiredMaelstrom: number;
  resource: Resource;
}

const SPEC_OPTIONS = {
  [SPECS.ELEMENTAL_SHAMAN.id]: {
    requiredMaelstrom: 300,
    resource: RESOURCE_TYPES.MAELSTROM,
  },
  [SPECS.ENHANCEMENT_SHAMAN.id]: {
    requiredMaelstrom: 40,
    resource: RESOURCE_TYPES.MAELSTROM_WEAPON,
  },
} satisfies Record<number, SpecOptions>;

type Point = { timestamp: number; value: number };
type XPoint = Pick<Point, 'timestamp'>;

class Tempest extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected specOptions: SpecOptions;

  protected wastedProcs: Record<WasteType, number> = {
    maelstrom: 0,
    'awakening-storms': 0,
  };

  private maelstrom: Point[] = [];
  private awakeningStorms: Point[] = [];
  private tempestCasts: XPoint[] = [];

  private current: number = 0;
  private startTime: number;

  constructor(options: Options) {
    super(options);
    this.specOptions = SPEC_OPTIONS[this.selectedCombatant.specId];
    this.startTime = this.owner.fight.start_time;
    this.active = this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendMaelstrom);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_CAST),
      this.onTempestCast,
    );

    /** Awakening Storms listeners */
    [Events.applybuff, Events.applybuffstack, Events.removebuff].forEach((filter) =>
      this.addEventListener(
        filter.by(SELECTED_PLAYER).spell(SPELLS.AWAKENING_STORMS_BUFF),
        this.onAwakeningStorms,
      ),
    );
  }

  onTempestCast(event: CastEvent) {
    this.tempestCasts.push({ timestamp: event.timestamp - this.startTime });
  }

  onAwakeningStorms(event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent) {
    switch (event.type) {
      case EventType.RemoveBuff:
        this.awakeningStorms.push({
          timestamp: event.timestamp,
          value: 0,
        });
        if (this.selectedCombatant.hasBuff(SPELLS.TEMPEST_BUFF.id)) {
          this.wastedProcs['awakening-storms'] += 1;
        }
        break;
      default:
        this.awakeningStorms.push({
          timestamp: event.timestamp,
          value: event.type === EventType.ApplyBuff ? 1 : event.stack,
        });
        break;
    }
  }

  onSpendMaelstrom(event: SpendResourceEvent) {
    if (event.resourceChangeType !== this.specOptions.resource.id) {
      return;
    }

    this.current += event.resourceChange;
    if (this.current >= this.specOptions.requiredMaelstrom) {
      if (this.selectedCombatant.hasBuff(SPELLS.TEMPEST_BUFF.id)) {
        this.wastedProcs['maelstrom'] += 1;
      }
      // reached cap point
      this.maelstrom.push({
        timestamp: event.timestamp,
        value: this.specOptions.requiredMaelstrom,
      });
      this.current -= this.specOptions.requiredMaelstrom;
    }

    // progress towards next tempest
    this.maelstrom.push({
      timestamp: event.timestamp,
      value: this.current,
    });
  }

  get graph() {
    const colors = {
      maelstrom: '#00D1FF',
      awakeningStorms: '#0080FF',
    };

    const baseEncoding: CompositeEncoding<any> = {
      x: {
        field: 'x',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value'),
          tickCount: 25,
          grid: false,
        },
        scale: { zero: true, nice: false },
        title: 'Time',
      },
      y: {
        field: 'y',
        type: 'quantitative',
        axis: {
          tickCount: 4,
        },
      },
    };

    const spec: VisualizationSpec = {
      layer: [
        {
          data: {
            name: 'maelstrom',
          },
          mark: {
            type: 'area',
            line: {
              interpolate: 'step',
              color: colors.maelstrom,
              strokeWidth: 1,
              opacity: 0.8,
            },
            interpolate: 'step',
            opacity: 0.3,
          },
          encoding: {
            ...baseEncoding,
            y: {
              field: 'y',
              type: 'quantitative',
              title: 'Maelstrom',
              axis: {
                grid: false,
                format: '~s',
              },
            },
            color: { value: colors.maelstrom },
          },
        },

        /** Awakening Storms stacks */
        {
          data: {
            name: 'awakeningStorms',
          },
          mark: {
            type: 'line',
            opacity: 1,
            interpolate: 'step',
            line: {
              strokeWidth: 1,
              color: colors.awakeningStorms,
            },
            color: colors.awakeningStorms,
          },
          encoding: {
            ...baseEncoding,
            color: {
              value: colors.awakeningStorms,
            },
          },
        },
      ],
    };

    const start = this.owner.fight.start_time;
    const data = {
      maelstrom: this.maelstrom.map(({ timestamp, value }) => {
        const x = Math.max(timestamp, start) - start;
        return {
          x: x,
          y: value,
        };
      }),
      awakeningStorms: this.awakeningStorms.map(({ timestamp, value }) => {
        const x = Math.max(timestamp, start) - start;
        return {
          x: x,
          y: value,
        };
      }),
    };

    return (
      <div className="graph-container">
        <AutoSizer>
          {({ width, height }) => (
            <BaseChart height={height} width={width} spec={spec} data={data} />
          )}
        </AutoSizer>
      </div>
    );
  }

  get guideSubsection(): JSX.Element {
    return (
      <>
        <SubSection title={<SpellLink spell={TALENTS.TEMPEST_TALENT} />}>
          <SpellLink spell={TALENTS.TEMPEST_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} /> detailed usage
          {this.graph}
        </SubSection>
      </>
    );
  }

  statistic() {
    return [
      <Statistic
        key="tempest-statistic"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL()}
        tooltip={
          <>
            {this.wastedProcs['maelstrom']} wasted proc(s) from spending maelstrom
            <br />
            {this.wastedProcs['awakening-storms']} wasted proc(s) from{' '}
            <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} />
          </>
        }
      >
        <TalentSpellText talent={TALENTS.TEMPEST_TALENT}>
          <div>
            {typedKeys(this.wastedProcs).reduce((total, k) => this.wastedProcs[k] + total, 0)}{' '}
            wasted casts
          </div>
        </TalentSpellText>
      </Statistic>,
      <Panel key="tempest-graph" title="Tempest" position={99}>
        {this.graph}
      </Panel>,
    ];
  }
}

export default Tempest;
