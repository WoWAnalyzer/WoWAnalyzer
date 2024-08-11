import Spell from 'common/SPELLS/Spell';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import convertColor from 'parser/ui/convertColor';

/**
 * An abstract implementation producing a graph showing the number of buffs the player has active
 * over the course of an encounter.
 *
 * Output is a div from the {@link plot} field. The plot will not automatically be drawn,
 * this div has to be added to a statistic or panel of some sort.
 *
 * Buffs to graph are specified by implementing the {@link buffSpecs} function to return
 * information of the buffs to show and how they should appear in the resulting graph.
 * Optionally the implementer can also override the {@link castRuleSpecs} function to cause
 * vertical rule lines to be drawn on the timestamp of certain spell casts.
 *
 * If more complex logic is desired for the vertical rule lines, this can be accomplished as follows:
 * Return a cast rule spec in {@link castRuleSpecs} with the desired name and color, but with an
 * empty array passed for the 'spells' field. Then, the implementing Analyzer should call
 * {@link addRuleLine} with the tracker's name at the timestamps where rule lines should appear.
 */
abstract class BuffCountGraph extends Analyzer {
  /** Trackers for the buffs to graph */
  buffTrackers: GraphedSpellInternalTracker[];
  /** Buff trackers indexed by spellId */
  buffTrackerLookup: { [key: number]: GraphedSpellInternalTracker[] };
  /** Trackers for the rule lines to graph */
  ruleLineTrackers: GraphedSpellInternalTracker[];
  /** Rule line trackers indexed by spellId */
  ruleLineTrackerLookup: { [key: number]: GraphedSpellInternalTracker[] };
  /** Data handed to vega for graphing */
  graphData: GraphData[];
  /** Timestamp of the last data points added - used to avoid adding duplicate data on same timestamp */
  lastTimestamp: number;

  protected constructor(options: Options) {
    super(options);

    // create internal tracking objs
    this.buffTrackers = this.buffSpecs().map((spec) => this._convertToInternalTracker(spec));
    this.buffTrackerLookup = this._generateLookup(this.buffTrackers);
    this.ruleLineTrackers = this.castRuleSpecs().map((spec) =>
      this._convertToInternalTracker(spec),
    );
    this.ruleLineTrackerLookup = this._generateLookup(this.ruleLineTrackers);
    // create empty data list
    this.graphData = [];
    this.lastTimestamp = this.owner.fight.start_time; // timestamp of last item added to data

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

    const castSpellList = [...new Set(this.ruleLineTrackers.flatMap((spec) => spec.spells))];
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(castSpellList), this.onCast);

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  /**
   * Implement to return the buffs to be graphed.
   * This is a function instead of a field in the constructor so implementer can filter the specs
   * based on player talents / legendaries / covenant.
   */
  abstract buffSpecs(): GraphedSpellSpec[];

  /**
   * Override to return casts to be graphed.
   * This is a function instead of a field in the constructor so implementer can filter the specs
   * based on player talents / legendaries / covenant.
   */
  castRuleSpecs(): GraphedSpellSpec[] {
    return [];
  }

  /**
   * Adds a vertical rule line for the given tracker at the given timestamp
   * @param trackerName the name of the tracker this rule line is for -
   *     will determine the line's color and its name in the legend
   * @param timestamp the timestamp to add the rule
   */
  addRuleLine(trackerName: string, timestamp: number) {
    const tracker = this.ruleLineTrackers.find((t) => t.name === trackerName);
    if (!tracker) {
      console.warn("Couldn't find tracker with name " + trackerName);
      return;
    }
    this.graphData.push({
      name: tracker.name,
      type: 'rule',
      timestamp,
    });
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
    if (!applicableTrackers) {
      // shouldn't be possible if the setup code works right...
      console.warn(
        'Spell ID ' +
          event.ability.guid +
          " was passed into onBuff..., but wasn't found in any tracker!",
      );
      return;
    }

    /*
     * We only want to add data for the last buff change on the same timestamp
     * so we wait until a buff change happens with a new timestamp, and then add the
     * data for the last timestamp
     */
    if (event.timestamp !== this.lastTimestamp) {
      this._registerChange();
    }
    this.lastTimestamp = event.timestamp;

    // update buff counts
    applicableTrackers.forEach((tracker) => {
      tracker.currCount += change;
    });
  }

  // adds the pending data
  _registerChange() {
    this.buffTrackers.forEach((tracker) => {
      this.graphData.push({
        name: tracker.name,
        type: 'buff',
        timestamp: this.lastTimestamp,
        Count: tracker.currCount,
      });
    });
  }

  onCast(event: CastEvent) {
    const applicableTrackers = this.ruleLineTrackerLookup[event.ability.guid];
    if (!applicableTrackers) {
      // shouldn't be possible if the setup code works right...
      console.warn(
        'Spell ID ' +
          event.ability.guid +
          " was passed into onCast..., but wasn't found in any tracker!",
      );
      return;
    }

    applicableTrackers.forEach((tracker) => {
      this.graphData.push({
        name: tracker.name,
        type: 'rule',
        timestamp: event.timestamp,
      });
    });
  }

  //////////////////////////////////////////////////////////
  // Function to break up and explain the Vega info ---
  //

  /** Generates the Vega layer that renders the buff lines */
  _generateBuffLinesLayer() {
    return {
      encoding: {
        color: this._generateColorEncoding(),
        y: {
          field: 'Count',
          type: 'quantitative' as const,
        },
      },
      transform: [
        {
          // the buff and rule-line data is together - we only want buff data here
          filter: { field: 'type', equal: 'buff' },
        },
      ],
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
        // shows dot marks on the lines we're hovering over
        {
          transform: [{ filter: { param: 'hover' as const, empty: false } }],
          mark: 'point' as const,
        },
      ],
    };
  }

  /** Generates the Vega layer that renders the rule lines */
  _generateRuleLinesLayer() {
    return {
      encoding: {
        color: this._generateColorEncoding(),
      },
      transform: [
        {
          // the buff and rule-line data is together - we only want rule-line data here
          filter: { field: 'type', equal: 'rule' },
        },
      ],
      layer: [
        {
          mark: {
            type: 'rule' as const,
            size: 3,
          },
        },
      ],
    };
  }

  /** Generates the Vega layer that renders the tooltip and mouseover line */
  _generateTooltipLayer() {
    return {
      // transforms data from 'tall' to 'wide' so all the counts are in same point -
      // this allows the tooltip to display with everything
      transform: [{ pivot: 'name', value: 'Count', groupby: ['timestamp_shifted'] }],
      mark: 'rule' as const,
      encoding: {
        // This renders a vertical rule line under the mouse -
        // The trick here is we're adding a vertical rule line to every data point,
        // but making every line invisible except the one underneath the mouse.
        opacity: {
          condition: { value: 0.8, param: 'hover' as const, empty: false },
          value: 0,
        },
        tooltip: this.buffTrackers.map((tracker) => ({
          field: tracker.name,
          type: 'quantitative' as const,
        })),
      },
      params: [
        {
          name: 'hover' as const,
          select: {
            type: 'point' as const,
            fields: ['timestamp_shifted'],
            nearest: true,
            on: 'mouseover' as const,
            clear: 'mouseout' as const,
          },
        },
      ],
    };
  }

  /** Generates the color encoding information for Vega */
  _generateColorEncoding() {
    // we want the buff and rule-line info to be smashed together to generate the legend
    const allTrackers = [...this.buffTrackers, ...this.ruleLineTrackers];
    return {
      field: 'name',
      type: 'nominal' as const,
      title: 'Spell',
      scale: {
        domain: allTrackers.map(({ name }) => name),
        range: allTrackers.map(({ color }) => color),
      },
      legend: {
        symbolOpacity: 1,
      },
    };
  }

  get plot() {
    // If the x-axis is too long, we enable horizontal scrolling, for better readability
    const graphLength = this.lastTimestamp - this.owner.fight.start_time;
    const threshold = 8 * 60 * 1000;

    // If we go above threshold make a tick each 20s
    const tickCount = graphLength > threshold ? Math.floor(graphLength / 20000) : 25;

    const spec: VisualizationSpec = {
      data: {
        name: 'graphData',
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
            tickCount: tickCount,
            grid: false,
          },
          scale: {
            nice: false,
          },
          title: null,
        },
      },
      layer: [
        this._generateBuffLinesLayer(),
        this._generateRuleLinesLayer(),
        this._generateTooltipLayer(),
      ],
    };

    // Calculate the width percentage so the graph has consistent size
    const widthPercentage = graphLength > threshold ? (graphLength / threshold) * 100 : 100;

    return (
      <div
        className="graph-container"
        style={{
          width: '100%',
          overflowX: graphLength > threshold ? 'auto' : 'hidden', // Enable horizontal scrolling if the data length exceeds the threshold
        }}
      >
        <div
          style={{
            padding: graphLength > threshold ? '0 0 30px' : '0 0 0px', // Add padding so scrollbar doesn't overlap x-axis
            width: `${widthPercentage}%`,
            overflowY: 'hidden',
            minHeight: 200,
          }}
        >
          <AutoSizer>
            {({ width, height }) => (
              <BaseChart
                spec={spec}
                data={{
                  graphData: this.graphData,
                }}
                width={width}
                height={height}
              />
            )}
          </AutoSizer>
        </div>
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
    const color: string = convertColor(spec.color);
    const currCount = 0;
    return { name, spells, color, currCount };
  }
}

export default BuffCountGraph;

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

/** The type used to compile the data for graphing. Documents a change in buff count or a spell cast */
type GraphData = {
  /** Name of the spell spec this data pertains to */
  name: string;
  /** What type of data this is (for buffs or rules) */
  type: 'buff' | 'rule';
  /** Timestamp the event occured */
  timestamp: number;
  /** The new count of buffs out (omitted for rule data) */
  Count?: number;
};
