import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import Panel from 'parser/ui/Panel';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { Field, PositionDef, StringFieldDef } from 'vega-lite/build/src/channeldef';
import { LayerSpec, UnitSpec } from 'vega-lite/build/src/spec';

type SpellTracker = Timestamp & {
  // annoying abstract but spell: number out=
  [key: number]: number;
};

// the stupidest json i've ever made
type Timestamp = {
  timestamp: number;
};

// Hots we want graphed. This will produce an area and an outline
const HOTS_TO_LISTEN_FOR: Spell[] = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.WILD_GROWTH,
  //  SPELLS.REGROWTH,
  // SPELLS.RENEWING_BLOOM,
  // SPELLS.SPRING_BLOSSOMS,
];

// Casts we want to track. These will produce a vertical bar
const CASTS_TO_TRACK: Spell[] = [
  SPELLS.TRANQUILITY_CAST,
  SPELLS.FLOURISH_TALENT,
  SPELLS.CONVOKE_SPIRITS,
];

class HotGraph extends Analyzer {
  /**
   * key = hot id
   * value = # of instances currently out
   */
  currentHotMap: Map<number, number> = new Map<number, number>();
  /**
   * Key = cast id
   * value = array of times they were cast
   */
  trackedCasts: Map<number, Timestamp[]> = new Map<number, Timestamp[]>(); // spell to times casted
  /**
   * a list of all data relating to the hots at different timeframes
   */
  hotHistoryMap: SpellTracker[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(HOTS_TO_LISTEN_FOR),
      this.hotApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HOTS_TO_LISTEN_FOR),
      this.hotRemoved,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CASTS_TO_TRACK), this.cast);
  }

  cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (!this.trackedCasts.has(spellId)) {
      this.trackedCasts.set(spellId, []);
    }
    const timestamps = this.trackedCasts.get(spellId)!;
    timestamps.push({ timestamp: event.timestamp });
  }

  hotApplied(event: ApplyBuffEvent) {
    const spell = event.ability.guid;
    // if we aren't trackign start tracking at 0
    if (!this.currentHotMap.has(spell)) {
      this.currentHotMap.set(spell, 0);
    }
    // increase by 1
    const currentHots = this.currentHotMap.get(spell)! + 1;
    // update
    this.currentHotMap.set(spell, currentHots);
    this.handleChange(event.timestamp, spell);
  }

  hotRemoved(event: RemoveBuffEvent) {
    const spell = event.ability.guid;
    // if we aren't trackign start tracking at 0
    if (!this.currentHotMap.has(spell)) {
      this.currentHotMap.set(spell, 0);
    }
    // decrease by 1
    const currentHots = this.currentHotMap.get(spell)! - 1;
    // update
    this.currentHotMap.set(spell, currentHots);
    this.handleChange(event.timestamp, spell);
  }

  handleChange(timestamp: number, spell: number) {
    const json = this.hotHistoryMap[this.hotHistoryMap.length - 1];
    // This makes the graph stepped... Without this we'd have non-flat lines points
    const forBlock = Object.assign({}, json);
    forBlock.timestamp = timestamp;
    this.hotHistoryMap.push(forBlock);

    // this is the new data
    const newBlock = Object.assign({}, json);
    newBlock.timestamp = timestamp;
    newBlock[spell] = this.currentHotMap.get(spell)!;
    this.hotHistoryMap.push(newBlock);
  }

  generateTooltips(): Array<StringFieldDef<Field>> {
    const tooltips: Array<StringFieldDef<Field>> = [];
    // this generates the tooltips for areas dynamically
    this.currentHotMap.forEach((array, spell) => {
      // look up spell name (this is in two lines because of debugging and was lazy)
      const spellObject = HOTS_TO_LISTEN_FOR.find((listener) => listener.id === spell);
      const name = spellObject?.name;
      tooltips.push({
        field: spell.toString(), // Field to check is id
        type: 'quantitative' as const,
        title: name, // but we want the display to be the actual name
        format: '.3~s',
      });
    });

    return tooltips;
  }

  generateAreas() {
    const dataEncoding: Array<LayerSpec<Field> | UnitSpec<Field>> = [];

    this.currentHotMap.forEach((array, spell) => {
      // we use Rejuv as the base layer. The rest is gonna be dynamically generated :D
      if (spell === SPELLS.REJUVENATION.id) {
        return;
      }

      // generate a color based off of ID
      const rgbString = this.generateColor(spell);
      // push the spell onto the return json
      dataEncoding.push({
        mark: {
          type: 'area' as const,
          line: {
            interpolate: 'linear' as const,
            color: 'rgb(' + rgbString + ')',
            strokeWidth: 1,
          },
          color: 'rgba(' + rgbString + ', 0.15)',
        },
        encoding: {
          y: {
            field: spell.toString(),
            type: 'quantitative' as const,
            title: null,
            axis: {
              grid: false,
              format: '~s',
            },
          },
        },
      });
    });

    return dataEncoding;
  }

  generateCasts(xAxis: PositionDef<Field>) {
    const dataEncoding: Array<LayerSpec<Field> | UnitSpec<Field>> = [];
    // dynaimcally adds cast marks to the graph
    this.trackedCasts.forEach((timestamps, spell) => {
      // generate color for it based off spell ID
      const spellColor = this.generateColor(spell);

      dataEncoding.push({
        data: {
          name: spell.toString(),
        },
        mark: {
          type: 'rule' as const,
          color: 'rgb(' + spellColor + ')',
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
      });
    });

    return dataEncoding;
  }

  convertCasts() {
    const json: { [key: number]: Array<{ timestamp: number }> } = {};
    // convert the maps we use to track into jsons... maybe just store everything as jsons initially?
    this.trackedCasts.forEach((cast, spell) => {
      json[spell] = [];
      const array = json[spell];
      // take each cast and give it to the json
      cast.forEach((timestamp) => {
        array.push({ timestamp: timestamp.timestamp });
      });
    });
    return json;
  }

  // simple color generation code... that for some reasons goes from number to hex to rgb
  generateColor(spell: number): string {
    let color = spell - 0xffffff;
    color = Math.abs(color);
    const colorString = color.toString(16).padStart(6, '0').toUpperCase();
    const r = parseInt(colorString.substring(0, 2), 16);
    const g = parseInt(colorString.substring(2, 4), 16);
    const b = parseInt(colorString.substring(4, 6), 16);
    const rgbString = r + ', ' + g + ', ' + b;
    return rgbString;
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
        name: 'hotHistory',
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
        tooltip: [
          {
            field: SPELLS.REJUVENATION.id,
            type: 'quantitative' as const,
            title: SPELLS.REJUVENATION.name,
            format: '.3~s',
          },
          ...this.generateTooltips(),
        ],
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: 'rgb(' + this.generateColor(SPELLS.REJUVENATION.id) + ')',
              strokeWidth: 1,
            },
            color: 'rgba(' + this.generateColor(SPELLS.REJUVENATION.id) + ', .15)',
          },
          encoding: {
            y: {
              field: SPELLS.REJUVENATION.id,
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        ...this.generateAreas(),
        ...this.generateCasts(xAxis),
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
                hotHistory: this.hotHistoryMap,
                ...this.convertCasts(),
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
      <Panel title="Hot Graph" position={100} explanation={<></>}>
        {this.plot}
      </Panel>
    );
  }
}

export default HotGraph;
