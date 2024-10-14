import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES, { getResource, getResourceCost } from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, EventType, RemoveBuffEvent } from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { expressionFunction, Interpolate, SignalRef } from 'vega';
import { CompositeEncoding } from 'vega-lite/build/src/compositemark';
import { OverlayMarkDef } from 'vega-lite/build/src/mark';
import { Transform } from 'vega-lite/build/src/transform';

const GRAPH_ENABLED = false;

type ElementalSpiritType = 'molten-weapon' | 'icy-edge' | 'crackling-surge';

type Point = {
  value: number;
  timestamp: number;
  type: ElementalSpiritType;
};

class ElementalSpirits extends Analyzer {
  protected elementalSpiritHistory: Point[] = [];
  protected elementalBlastHistory: (Pick<Point, 'timestamp'> & {
    event: CastEvent;
    maelstrom: number;
  })[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_SPIRITS_TALENT);

    if (!this.active) {
      return;
    }

    if (!this.active) {
      return;
    }

    const eventFilters = [Events.applybuff, Events.removebuff];
    const spells: { spell: Spell; callback: (e: ApplyBuffEvent | RemoveBuffEvent) => void }[] = [
      { spell: SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON, callback: this.gainMoltenWeapon },
      { spell: SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE, callback: this.gainIcyEdge },
      { spell: SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE, callback: this.gainCracklingSurge },
    ];

    eventFilters.forEach((filter) => {
      spells.forEach((entry) =>
        this.addEventListener(filter.by(SELECTED_PLAYER_PET).spell(entry.spell), entry.callback),
      );
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT),
      this.onCastElementalBlast,
    );
  }

  get moltenWeaponCount() {
    return this.elementalSpiritHistory.filter((e) => e.type === 'molten-weapon').at(-1)?.value ?? 0;
  }

  get icyEdgeCount() {
    return this.elementalSpiritHistory.filter((e) => e.type === 'icy-edge').at(-1)?.value ?? 0;
  }

  get cracklingSurgeCount() {
    return (
      this.elementalSpiritHistory.filter((e) => e.type === 'crackling-surge').at(-1)?.value ?? 0
    );
  }

  get elementalSpiritCount() {
    return this.icyEdgeCount + this.moltenWeaponCount + this.cracklingSurgeCount;
  }

  gainMoltenWeapon(event: ApplyBuffEvent | RemoveBuffEvent) {
    this.recordElementalSpirit(this.moltenWeaponCount, event, 'molten-weapon');
  }

  gainIcyEdge(event: ApplyBuffEvent | RemoveBuffEvent) {
    this.recordElementalSpirit(this.icyEdgeCount, event, 'icy-edge');
  }

  gainCracklingSurge(event: ApplyBuffEvent | RemoveBuffEvent) {
    this.recordElementalSpirit(this.cracklingSurgeCount, event, 'crackling-surge');
  }

  private recordElementalSpirit(
    current: number,
    event: ApplyBuffEvent | RemoveBuffEvent,
    type: ElementalSpiritType,
  ) {
    let value = current + (event.type === EventType.ApplyBuff ? 1 : -1);
    if (value < 0) {
      console.error(
        `Attempt to record negative ${type} count @ ${event.timestamp} (${this.owner.formatTimestamp(event.timestamp)})`,
      );
      value = 0;
    }

    this.elementalSpiritHistory.push({
      value: value,
      timestamp: event.timestamp,
      type: type,
    });
  }

  onCastElementalBlast(event: CastEvent) {
    const maelstromUsed =
      getResourceCost(event.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id) ??
      getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id)?.cost ??
      0;
    this.elementalBlastHistory.push({
      timestamp: event.timestamp,
      event: event,
      maelstrom: maelstromUsed,
    });
  }

  get graph() {
    const colors: { [key: string | ElementalSpiritType]: string } = {
      'molten-weapon': '#f37735',
      'icy-edge': '#94d3ec',
      'crackling-surge': '#3b7fb0',
      'elemental-blast': '#fab700',
    };

    const current = new Map<ElementalSpiritType, number>();
    const elementalSpiritData: Omit<Point, 'type'>[] = [];
    this.elementalSpiritHistory.forEach((p) => {
      current.set(p.type, p.value);
      const count = [...current.values()].reduce((total, value) => (total += value), 0);
      const sameTimestamp = elementalSpiritData.find(
        (d) => Math.abs(d.timestamp - p.timestamp) < 10,
      );
      if (sameTimestamp) {
        sameTimestamp.value = count;
      } else {
        elementalSpiritData.push({
          timestamp: p.timestamp,
          value: count,
        });
      }
    });

    const data = {
      elementalSpirits: elementalSpiritData,
      elementalBlast: this.elementalBlastHistory,
    };

    const baseEncoding: CompositeEncoding<any> = {
      x: {
        field: 'timestamp_shifted',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value'),
          tickCount: 25,
          grid: false,
        },
        scale: { zero: true, nice: false },
        title: 'Time',
      },
    };

    const transforms: Transform[] = [
      {
        calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
        as: 'timestamp_shifted',
      },
    ];

    const showIndividualLineColors = false;
    const lineColors = {
      field: 'type',
      condition: [
        { test: `datum.type === 'molten-weapon'`, value: colors['molten-weapon'] },
        { test: `datum.type === 'icy-edge'`, value: colors['icy-edge'] },
        { test: `datum.type === 'crackling-surge'`, value: colors['crackling-surge'] },
      ],
    };

    const interpolate: Interpolate | undefined = 'step-after';
    const strokeWidth = 1;
    const point: OverlayMarkDef<SignalRef> | undefined = { filled: false };

    const spec: VisualizationSpec = {
      layer: [
        {
          data: {
            name: 'elementalSpirits',
          },
          mark: {
            type: 'area',
            point: point,
            line: {
              interpolate: interpolate,
              strokeWidth: strokeWidth,
              opacity: 1,
            },
            interpolate: interpolate,
            opacity: 0.7,
          },
          transform: transforms,
          encoding: {
            ...baseEncoding,
            y: {
              aggregate: 'sum',
              field: 'value',
              title: 'Elemental Spirits',
            },
            color: (lineColors && showIndividualLineColors) || undefined,
          },
        },

        /** Elemental Blast casts */
        {
          data: {
            name: 'elementalBlast',
          },
          mark: {
            type: 'rule',
            color: colors['elemental-blast'],
            strokeWidth: 2,
            opacity: 1,
          },
          encoding: {
            x: baseEncoding.x,
            tooltip: [
              {
                field: 'timestamp_shifted',
                type: 'quantitative',
                title: 'Elemental Blast Cast',
                formatType: 'timestamp',
                format: '3',
              },
            ],
          },
          transform: transforms,
        },
      ],
      resolve: {
        scale: {
          y: 'shared',
        },
      },
    };

    return (
      GRAPH_ENABLED && (
        <div className="graph-container">
          <AutoSizer disableHeight>
            {({ width, height }) => (
              <BaseChart height={height} width={width} spec={spec} data={data} />
            )}
          </AutoSizer>
        </div>
      )
    );
  }

  elementalSpiritsDonut() {
    const items = [
      {
        color: '#f37735',
        label: <>Molten Weapon</>,
        spellId: SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON.id,
        value: this.moltenWeaponCount,
      },
      {
        color: '#94d3ec',
        label: <>Icy Edge</>,
        spellId: SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE.id,
        value: this.icyEdgeCount,
      },
      {
        color: '#3b7fb0',
        label: <>Crackling Surge</>,
        spellId: SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE.id,
        value: this.cracklingSurgeCount,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} category={STATISTIC_CATEGORY.TALENTS}>
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> distribution
          </label>
          {this.elementalSpiritsDonut()}
        </div>
      </Statistic>
    );
  }
}

expressionFunction('timestamp', function (datum: number, params: string) {
  return formatDuration(datum, Number(params));
});

export default ElementalSpirits;
