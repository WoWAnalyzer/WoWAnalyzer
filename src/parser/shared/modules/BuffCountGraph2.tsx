import Spell from 'common/SPELLS/Spell';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

abstract class BuffCountGraph2 extends Analyzer {
  /** Trackers for the buffs to graph */
  buffTrackers: GraphedSpellInternalTracker[];
  /** Buff trackers indexed by spellId */
  buffTrackerLookup: { [key: number]: GraphedSpellInternalTracker[] };

  dataLines: DataLine[];
  lastTimestamp: number;

  protected constructor(options: Options, buffSpecs: GraphedSpellSpec[]) {
    super(options);

    // create internal tracking objs
    this.buffTrackers = buffSpecs.map((spec) => this._convertToInternalTracker(spec));
    this.buffTrackerLookup = this._generateLookup(this.buffTrackers);

    this.dataLines = [];
    this.lastTimestamp = this.owner.fight.start_time;

    // setup listeners - spell list needs to filtered through a Set to remove duplicates
    const buffSpellList = [...new Set(this.buffTrackers.flatMap((spec) => spec.spells))];
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(buffSpellList),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(buffSpellList),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(buffSpellList),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(buffSpellList),
      this.onBuffRemoved,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd() {
    this._registerChange();
  }

  onBuffApplied(event: ApplyBuffEvent | ApplyDebuffEvent) {
    this._onBuffChanged(event, 1);
  }

  onBuffRemoved(event: RemoveBuffEvent | RemoveDebuffEvent) {
    this._onBuffChanged(event, -1);
  }

  _onBuffChanged(event: AbilityEvent<any>, change: number) {
    const applicableTrackers = this.buffTrackerLookup[event.ability.guid];
    if (applicableTrackers === undefined) {
      // shouldn't be possible if the setup code works right...
      console.warn(
        'Spell ID ' +
          event.ability.guid +
          " was passed into onBuff..., but wasn't found in any tracker...",
      );
      return;
    }

    // TODO document why I'm doing it this way
    if (event.timestamp !== this.lastTimestamp) {
      this._registerChange();
    }
    this.lastTimestamp = event.timestamp;

    // update buff counts
    applicableTrackers.forEach((tracker) => {
      tracker.currCount += change;
    });
  }

  _registerChange() {
    this.buffTrackers.forEach((tracker) => {
      this.dataLines.push({
        name: tracker.name,
        timestamp: this.lastTimestamp,
        color: tracker.color,
        count: tracker.currCount,
      });
    });
  }

  _generateTooltip() {
    return this.buffTrackers.map((tracker) => ({
      field: tracker.name,
      type: 'quantitative' as const,
    }));
  }

  get plot() {
    const spec: VisualizationSpec = {
      data: {
        name: 'dataLines',
      },
      transform: [
        {
          filter: 'isValid(datum.timestamp)',
        },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: {
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
        },
      },
      layer: [
        // this layer renders the hot count lines
        {
          encoding: {
            color: {
              field: 'name',
              type: 'nominal',
              title: 'Spell',
              scale: {
                domain: this.buffTrackers.map(({ name }) => name),
                range: this.buffTrackers.map(({ color }) => color),
              },
            },
            y: { field: 'count', type: 'quantitative' },
          },
          layer: [
            {
              mark: {
                type: 'area' as const,
                line: {
                  strokeWidth: 2,
                },
                opacity: 0.2,
                interpolate: 'step-after' as const,
              },
            },
            { transform: [{ filter: { param: 'hover', empty: false } }], mark: 'point' },
          ],
        },
        // this layer puts down rule lines for each change in buff count
        {
          transform: [{ pivot: 'name', value: 'count', groupby: ['timestamp_shifted'] }],
          mark: 'rule',
          encoding: {
            opacity: {
              condition: { value: 0.8, param: 'hover', empty: false },
              value: 0,
            },
            tooltip: this._generateTooltip(),
          },
          params: [
            {
              name: 'hover',
              select: {
                type: 'point',
                fields: ['timestamp_shifted'],
                nearest: true,
                on: 'mouseover',
                clear: 'mouseout',
              },
            },
          ],
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
                dataLines: this.dataLines,
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  /** Indexes the trackers into a lookup by spellId */
  _generateLookup(trackers: GraphedSpellInternalTracker[]) {
    const lookup: { [key: number]: GraphedSpellInternalTracker[] } = {};
    trackers.forEach((tracker) => {
      tracker.spells.forEach((spell) => {
        const entry = lookup[spell.id];
        if (entry === undefined) {
          lookup[spell.id] = [tracker];
        } else {
          lookup[spell.id].push(tracker);
        }
      });
    });
    return lookup;
  }

  /** Converts the external specification type to the internal tracking type */
  _convertToInternalTracker(spec: GraphedSpellSpec): GraphedSpellInternalTracker {
    const spells: Spell[] = Array.isArray(spec.spells) ? spec.spells : [spec.spells];
    const name: string = spec.name !== undefined ? spec.name : spells[0].name;
    const color: string = this._convertColor(spec.color);
    const currCount = 0;
    return { name, spells, color, currCount };
  }

  /** Converts a color from input format '#rrggbb' to internal format 'r,g,b' */
  _convertColor(color: string) {
    const r = '0x' + color[1] + color[2];
    const g = '0x' + color[3] + color[4];
    const b = '0x' + color[5] + color[6];
    return 'rgb(' + Number(r) + ',' + Number(g) + ',' + Number(b) + ')';
  }
}

export default BuffCountGraph2;

type DataLine = {
  name: string;
  timestamp: number;
  color: string;
  count: number;
};

/** Internal tracking obj for building up the graph info */
type GraphedSpellInternalTracker = {
  /** Name used as ID within vega and for displaying tooltips */
  name: string;
  /** The spells to be graphed together */
  spells: Spell[];
  /** The color to render the graph lines, in format 'rgb(drrr,dggg,dbbb)'. */
  color: string;
  /** The current number of buffs out (for buffs, ignored for casts) */
  currCount: number;
};

/**
 * Specification of a buff or cast to be graphed
 */
export type GraphedSpellSpec = {
  /** OPTIONAL The name to use on tooltips and the legend for this buff.
   * If omitted, the name of the first spell in spells will be used.
   * Names MUST be unique within the set of specs provided */
  name?: string;
  /** REQUIRED The spell or spells to be graphed. If multiple spells are included in the same spec,
   * they will be combined in the same line. */
  spells: Spell | Spell[];
  /** REQUIRED Color to render the graph line, in format '#rrggbb'. */
  color: string;
};
