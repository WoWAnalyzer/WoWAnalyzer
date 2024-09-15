import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
  FreeCastEvent,
  GetRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  SpendResourceEvent,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import RESOURCE_TYPES, { Resource } from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import BaseChart from 'parser/ui/BaseChart';
import AutoSizer from 'react-virtualized-auto-sizer';
import { tempestGraph } from './TempestGraph';
import { TEMPEST_SOURCE_SPELL_EVENT_LINK } from './normalizers/StormbringerEventLinkNormalizer';

type ProcType = 'maelstrom' | 'awakening-storms';

const DEBUG = false;

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
type PointWithRange = Point & { min: number; max: number };
type XPoint = Pick<Point, 'timestamp'>;

class Tempest extends Analyzer {
  protected specOptions: SpecOptions;

  public tempestSources: Record<ProcType, { generated: number; wasted: number }> = {
    maelstrom: { generated: 0, wasted: 0 },
    'awakening-storms': { generated: 0, wasted: 0 },
  };

  private maelstromSpenders: (Point | PointWithRange)[] = [];
  private awakeningStorms: Point[] = [];
  private tempestCasts: XPoint[] = [];

  private graphEnabled: boolean = true;

  constructor(options: Options) {
    super(options);
    this.specOptions = SPEC_OPTIONS[this.selectedCombatant.specId];

    this.active = this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT);
    if (!this.active) {
      return;
    }

    this.maelstromSpenders.push({
      timestamp: this.owner.fight.start_time,
      value: 0,
      min: 0,
      max: this.specOptions.requiredMaelstrom - 1,
    });
    this.awakeningStorms.push({
      timestamp: this.owner.fight.start_time,
      value: this.selectedCombatant.getBuffStacks(
        SPELLS.AWAKENING_STORMS_BUFF.id,
        this.owner.fight.start_time,
      ),
    });

    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendMaelstrom);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_CAST),
      this.onTempestCast,
    );
    [Events.applybuff, Events.applybuffstack, Events.refreshbuff].forEach((filter) =>
      this.addEventListener(
        filter.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BUFF),
        this.onApplyTempest,
      ),
    );
    /** Awakening Storms listeners */
    [Events.applybuff, Events.applybuffstack, Events.removebuff].forEach((filter) =>
      this.addEventListener(
        filter.by(SELECTED_PLAYER).spell(SPELLS.AWAKENING_STORMS_BUFF),
        this.onAwakeningStorms,
      ),
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BUFF),
      () => (this.ignoreNextRefresh = true),
    );
  }

  onTempestCast(event: CastEvent) {
    this.tempestCasts.push({ timestamp: event.timestamp });
  }

  get maelstromSpent() {
    return this.maelstromSpenders.reduce((total, spender) => (total += spender.value), 0);
  }

  get current() {
    return (
      this.maelstromSpenders.slice(0, -1).reduce((total, spender) => (total += spender.value), 0) %
      this.specOptions.requiredMaelstrom
    );
  }

  private ignoreNextRefresh = false;
  onApplyTempest(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    const sourceEvent = GetRelatedEvent<CastEvent | FreeCastEvent | RemoveBuffEvent>(
      event,
      TEMPEST_SOURCE_SPELL_EVENT_LINK,
    );
    if (!sourceEvent) {
      DEBUG &&
        console.error(
          `tempest buff applied with no source at ${this.owner.formatTimestamp(event.timestamp, 3)}`,
          event,
        );
      return;
    }

    const procType: ProcType =
      sourceEvent.type === EventType.RemoveBuff ? 'awakening-storms' : 'maelstrom';
    this.tempestSources[procType].generated += 1;
    if (event.type === EventType.RefreshBuff && !this.ignoreNextRefresh) {
      this.tempestSources[procType].wasted += 1;
    }
    this.ignoreNextRefresh = false;

    // when tempest procs from a cast, check the current progress towards a proc is accurate
    if (sourceEvent.type === EventType.Cast || sourceEvent.type === EventType.FreeCast) {
      const cost = sourceEvent.resourceCost![this.specOptions.resource.id]!;

      const current = this.current;
      // if true, the initial maelstrom is inaccurate and needs recalculating
      if (current + cost < this.specOptions.requiredMaelstrom) {
        // adjust the range of possible starting maelstrom
        const initial = this.maelstromSpenders[0] as PointWithRange;

        const min = Math.max(this.specOptions.requiredMaelstrom - cost! - current, initial.min);
        const max = Math.min(this.specOptions.requiredMaelstrom - current - 1, initial.max);
        if (min < initial.max && max > initial.min) {
          this.maelstromSpenders.splice(0, 1, {
            ...initial,
            value: Math.trunc((min + max) / 2),
            min: min,
            max: max,
          });
        }
      }
    }
  }

  onAwakeningStorms(event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent) {
    switch (event.type) {
      case EventType.RemoveBuff:
        this.awakeningStorms.push({
          timestamp: event.timestamp,
          value: 0,
        });
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
    this.maelstromSpenders.push({
      timestamp: event.timestamp,
      value: event.resourceChange,
    });
  }

  get graph() {
    const maelstrom: Point[] = [];
    let current = 0;
    this.maelstromSpenders.forEach((spent) => {
      current += spent.value;
      if (current >= this.specOptions.requiredMaelstrom) {
        current -= this.specOptions.requiredMaelstrom;
        maelstrom.push({
          timestamp: spent.timestamp,
          value: this.specOptions.requiredMaelstrom,
        });
      }
      maelstrom.push({
        timestamp: spent.timestamp,
        value: current,
      });
    });

    const data = {
      maelstrom: maelstrom,
      awakeningStorms: this.awakeningStorms,
      tempest: this.tempestCasts,
    };

    return this.graphEnabled ? (
      <div className="graph-container">
        <AutoSizer disableHeight>
          {({ width }) => (
            <BaseChart
              height={300}
              width={width}
              spec={tempestGraph(this.owner.info)}
              data={data}
            />
          )}
        </AutoSizer>
      </div>
    ) : null;
  }
}

export default Tempest;
