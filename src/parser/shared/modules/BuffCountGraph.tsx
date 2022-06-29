import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { Field, PositionDef, StringFieldDef } from 'vega-lite/build/src/channeldef';

/**
 * A customizable graph that displays the number of a chosen buff that are active at any given time.
 */
abstract class BuffCountGraph extends Analyzer {
  /** Trackers for the buffs to graph */
  buffTrackers: GraphedSpellInternalTracker[];
  /** Trackers for the casts to graph */
  castTrackers: GraphedSpellInternalTracker[];
  /** Buff trackers indexed by spellId */
  buffTrackerLookup: { [key: number]: GraphedSpellInternalTracker[] };
  /** Cast trackers indexed by spellId */
  castTrackerLookup: { [key: number]: GraphedSpellInternalTracker[] };
  /** History of buff counts used to draw graph line */
  buffCountHistory: BuffDataObj[];

  /**
   * Creates a BuffCountGraph showing the specified buffs and casts.
   * @param buffSpecs the specifications of buffs (or debuffs) to graph. A graph line representing
   *     the number of that buff or debuff present over time during the fight will be shown.
   *     Only buffs or debuffs that originate from the selected player will be shown.
   * @param castSpecs the specifications of casts to show. A vertical line will be shown at each
   *     time when the spell was cast over the course of the fight. Only spells the selected
   *     player cast will be shown.
   */
  protected constructor(
    options: Options,
    buffSpecs: GraphedSpellSpec[],
    castSpecs: GraphedSpellSpec[],
  ) {
    super(options);

    // create internal tracking objs
    this.buffTrackers = buffSpecs.map((spec) => this._convertToInternalTracker(spec));
    this.castTrackers = castSpecs.map((spec) => this._convertToInternalTracker(spec));
    this.buffTrackerLookup = this._generateLookup(this.buffTrackers);
    this.castTrackerLookup = this._generateLookup(this.castTrackers);
    this.buffCountHistory = [];

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

    const castSpellList = [...new Set(this.castTrackers.flatMap((spec) => spec.spells))];
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(castSpellList), this.onCast);
  }

  /** Converts the external specification type to the internal tracking type */
  _convertToInternalTracker(spec: GraphedSpellSpec): GraphedSpellInternalTracker {
    const spells: Spell[] = Array.isArray(spec.spells) ? spec.spells : [spec.spells];
    const fieldId = spells.reduce((str, spell) => str + spell.id.toString() + '-', '');
    const tooltipName: string = spec.tooltipName !== undefined ? spec.tooltipName : spells[0].name;
    const color: string =
      spec.color !== undefined
        ? spec.color // TODO internal transform in formats
        : this._generateColor(spells[0].id);
    const changes: SpellChange[] = [];
    const currCount = 0;
    return { fieldId, spells, tooltipName, color, changes, currCount };
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

    // in order to generate a stepped graph, we need to add a data point showing
    // the before counts and the after counts on timestamp when change occurs

    // add 'before' data
    const beforeData: BuffDataObj = { timestamp: event.timestamp };
    this.buffTrackers.forEach((tracker) => {
      beforeData[tracker.fieldId] = tracker.currCount;
    });
    this.buffCountHistory.push(beforeData);

    // register the change
    applicableTrackers.forEach((tracker) => {
      tracker.currCount += change;
    });

    // add 'after' data
    const afterData: BuffDataObj = { timestamp: event.timestamp };
    this.buffTrackers.forEach((tracker) => {
      afterData[tracker.fieldId] = tracker.currCount;
    });
    this.buffCountHistory.push(afterData);
  }

  onCast(event: CastEvent) {
    const applicableTrackers = this.castTrackerLookup[event.ability.guid];
    if (applicableTrackers === undefined) {
      // shouldn't be possible if the setup code works right...
      console.warn(
        'Spell ID ' +
          event.ability.guid +
          " was passed into BuffCountGraph#onCast, but wasn't found in any tracker...",
      );
      return;
    }

    applicableTrackers.forEach((tracker) => {
      tracker.changes.push({ timestamp: event.timestamp, count: 1 });
    });
  }

  /** Generates a tooltip mapping (used by vega) */
  generateTooltips(): Array<StringFieldDef<Field>> {
    return this.buffTrackers.map((tracker) => ({
      field: tracker.fieldId,
      type: 'quantitative' as const,
      title: tracker.tooltipName,
      format: '.3~s',
    }));
  }

  /** Generates filled in mouseover areas (used by vega) */
  generateAreas() {
    return this.buffTrackers.map((tracker) => ({
      mark: {
        type: 'area' as const,
        line: {
          interpolate: 'linear' as const,
          color: 'rgb(' + tracker.color + ')',
          strokeWidth: 1,
        },
        color: 'rgba(' + tracker.color + ', 0.15)',
      },
      encoding: {
        y: {
          field: tracker.fieldId,
          type: 'quantitative' as const,
          title: null,
          axis: {
            grid: false,
            format: '~s',
          },
        },
      },
    }));
  }

  /** Generates a cast spec mapping */
  generateCasts(xAxis: PositionDef<Field>) {
    return this.castTrackers.map((tracker) => ({
      data: {
        name: tracker.fieldId,
      },
      mark: {
        type: 'rule' as const,
        color: 'rgb(' + tracker.color + ')',
        size: 3,
      },
      transform: [
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: xAxis,
      },
    }));
  }

  /**
   * Packages the cast data into the format expected by Vega's plotter
   */
  _generateCastData(): { [key: string]: Array<{ timestamp: number }> } {
    const castsData: { [key: string]: Array<{ timestamp: number }> } = {};
    this.castTrackers.forEach((tracker) => {
      const casts = tracker.changes.map((change) => ({ timestamp: change.timestamp }));
      castsData[tracker.fieldId] = casts;
    });
    return castsData;
  }

  // simple color generation code... that for some reasons goes from number to hex to rgb
  _generateColor(spell: number): string {
    let color = spell - 0xffffff;
    color = Math.abs(color);
    const colorString = color.toString(16).padStart(6, '0').toUpperCase();
    const r = parseInt(colorString.substring(0, 2), 16);
    const g = parseInt(colorString.substring(2, 4), 16);
    const b = parseInt(colorString.substring(4, 6), 16);
    const rgbString = r + ', ' + g + ', ' + b;
    return rgbString;
  }

  /** A div containing the generated graph */
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
        name: 'buffHistory',
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
        x: xAxis,
        tooltip: this.generateTooltips(),
      },
      layer: [...this.generateAreas(), ...this.generateCasts(xAxis)],
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
                buffHistory: this.buffCountHistory,
                ...this._generateCastData(),
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

/** Tracking object for when the number of a buff out changes or when a spell casts */
type SpellChange = {
  /** The timestamp of the change */
  timestamp: number;
  /** The *new* number of buffs that are out (ignored when used with spell casts) */
  count: number;
};

/** Internal tracking obj for building up the graph info */
type GraphedSpellInternalTracker = {
  /** Unique ID string used to name the field within Vega */
  fieldId: string;
  /** The spells to be graphed together */
  spells: Spell[];
  /** The name to use in tooltips and the legend */
  tooltipName: string;
  /** The color to render the graph lines, in format '#rrggbb'. */
  color: string;
  /** The times the buff count changed (for buffs) or the spell was cast (for casts) */
  changes: SpellChange[];
  /** The current number of buffs out (for buffs, ignored for casts) */
  currCount: number;
};

/** Data format expected by vega for buff data points */
type BuffDataObj = {
  timestamp: number;
  [key: string]: number;
};

/**
 * Specification of a buff or cast to be graphed
 */
export type GraphedSpellSpec = {
  /** REQUIRED The spell or spells to be graphed. If multiple spells are included in the same spec,
   * they will be combined in the same line. */
  spells: Spell | Spell[];
  /** OPTIONAL The name to use on tooltips and the legend for this buff.
   * If omitted, the name of the first spell in spells will be used. */
  tooltipName?: string;
  /** OPTIONAL Color to render the graph line, in format 'rr,gg,bb'.
   * If omitted, a color will be deterministically chosen based on the first spell's ID.
   */
  color?: string;
};

export default BuffCountGraph;
