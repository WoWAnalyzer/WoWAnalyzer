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
import RESOURCE_TYPES, { Resource } from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import BaseChart from 'parser/ui/BaseChart';
import AutoSizer from 'react-virtualized-auto-sizer';
import { tempestGraph } from './TempestGraph';

type ProcType = 'maelstrom' | 'awakening-storms';

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

  public tempestSources: Record<ProcType, { generated: number; wasted: number }> = {
    maelstrom: { generated: 0, wasted: 0 },
    'awakening-storms': { generated: 0, wasted: 0 },
  };

  private maelstrom: Point[] = [];
  private awakeningStorms: Point[] = [];
  private tempestCasts: XPoint[] = [];

  private current: number = 0;
  private graphEnabled: boolean = true;

  constructor(options: Options) {
    super(options);
    this.specOptions = SPEC_OPTIONS[this.selectedCombatant.specId];

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
    this.tempestCasts.push({ timestamp: event.timestamp });
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

        if (this.awakeningStorms.at(-1)!.value === 3) {
          const proc = this.tempestSources['awakening-storms'];
          proc.generated += 1;
          if (this.selectedCombatant.hasBuff(SPELLS.TEMPEST_BUFF.id)) {
            proc.wasted += 1;
          }
        }
        break;
    }
  }

  onSpendMaelstrom(event: SpendResourceEvent) {
    if (event.resourceChangeType !== this.specOptions.resource.id) {
      return;
    }

    this.current += event.resourceChange;
    if (this.current >= this.specOptions.requiredMaelstrom) {
      const proc = this.tempestSources['maelstrom'];
      proc.generated += 1;
      if (this.selectedCombatant.hasBuff(SPELLS.TEMPEST_BUFF.id)) {
        proc.wasted += 1;
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
    const data = {
      maelstrom: this.maelstrom,
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
