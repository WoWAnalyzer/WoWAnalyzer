import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import convertColor from 'parser/ui/convertColor';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Options } from 'parser/core/Module';
import { SubSection } from 'interface/guide';
import type { JSX } from 'react';

interface GraphData {
  name: string;
  type: 'buff';
  timestamp: number;
  Count: number;
}

class FreezingStacks extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
  }

  get graphData(): GraphData[] {
    const freezingId = SPELLS.FREEZING.id;
    // Collect all "Change Points"
    interface ChangePoint {
      timestamp: number;
      guid: number;
      newStacks: number;
    }

    const changes: ChangePoint[] = [];

    Object.values(this.enemies.getEntities()).forEach((enemy) => {
      const history = enemy.getBuffHistory(freezingId, this.owner.playerId);
      history.forEach((buff) => {
        buff.stackHistory.forEach((stackEvent) => {
          changes.push({
            timestamp: stackEvent.timestamp,
            guid: enemy.guid,
            newStacks: stackEvent.stacks,
          });
        });

        // Removal
        if (buff.end) {
          changes.push({
            timestamp: buff.end,
            guid: enemy.guid,
            newStacks: 0,
          });
        } else {
          // Ends at fight end
          changes.push({
            timestamp: this.owner.fight.end_time,
            guid: enemy.guid,
            newStacks: 0,
          });
        }
      });
    });

    // Sort by timestamp
    changes.sort((a, b) => a.timestamp - b.timestamp);

    const currentStacks = new Map<string, number>();
    const data: GraphData[] = [];
    let lastMaxStacks = 0;

    // Process changes
    changes.forEach((change) => {
      currentStacks.set(String(change.guid), change.newStacks);

      // Find new max
      let max = 0;
      currentStacks.forEach((stacks) => {
        if (stacks > max) max = stacks;
      });

      if (max !== lastMaxStacks) {
        data.push({
          name: 'Freezing Stacks',
          type: 'buff',
          timestamp: change.timestamp,
          Count: max,
        });
        lastMaxStacks = max;
      }
    });

    // Ensure we start at 0 if no data at start
    if (data.length > 0 && data[0].timestamp > this.owner.fight.start_time) {
      data.unshift({
        name: 'Freezing Stacks',
        type: 'buff',
        timestamp: this.owner.fight.start_time,
        Count: 0,
      });
    }

    return data;
  }

  get plot() {
    const data = this.graphData;
    const graphLength = this.owner.fight.end_time - this.owner.fight.start_time;
    const threshold = 8 * 60 * 1000;
    const tickCount = graphLength > threshold ? Math.floor(graphLength / 20000) : 25;
    const color = convertColor('#3366cc');

    const spec: VisualizationSpec = {
      data: {
        name: 'graphData',
      },
      transform: [
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
        y: {
          field: 'Count',
          type: 'quantitative' as const,
          title: 'Stacks',
        },
        color: {
          field: 'name',
          type: 'nominal' as const,
          scale: { range: [color] },
          legend: { title: 'Debuff' },
        },
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: { strokeWidth: 2 },
            opacity: 0.2,
            interpolate: 'step-after' as const,
          },
        },
        {
          mark: 'point' as const,
          transform: [{ filter: { param: 'hover' as const, empty: false } }],
        },
        {
          // Tooltip rule
          transform: [{ pivot: 'name', value: 'Count', groupby: ['timestamp_shifted'] }],
          mark: 'rule' as const,
          encoding: {
            opacity: {
              condition: { value: 0.8, param: 'hover' as const, empty: false },
              value: 0,
            },
            tooltip: [{ field: 'Freezing Stacks', type: 'quantitative' as const, title: 'Stacks' }],
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
        },
      ],
    };

    const widthPercentage = graphLength > threshold ? (graphLength / threshold) * 100 : 100;

    return (
      <div
        className="graph-container"
        style={{
          width: '100%',
          overflowX: graphLength > threshold ? 'auto' : 'hidden',
        }}
      >
        <div
          style={{
            padding: graphLength > threshold ? '0 0 30px' : '0 0 0px',
            width: `${widthPercentage}%`,
            overflowY: 'hidden',
            minHeight: 200,
          }}
        >
          <AutoSizer>
            {({ width, height }) => (
              <BaseChart spec={spec} data={{ graphData: data }} width={width} height={height} />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }

  get guideSubsection(): JSX.Element {
    return (
      <SubSection title="Freezing">
        <div style={{ width: '100%', height: '100%', padding: '10px' }}>
          <BoringSpellValueText spell={SPELLS.FREEZING}>Freezing Stacks</BoringSpellValueText>
          <div style={{ height: '200px', marginTop: '10px' }}>{this.plot}</div>
        </div>
      </SubSection>
    );
  }
}

export default FreezingStacks;
