import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import BoneShieldStackTracker from './BoneShieldStackTracker';
import MarrowrendUsage from './MarrowrendUsage';

/** Ossuary is active at this many Bone Shield stacks or more. */
export const OSSUARY_STACKS = 5;

const MAX_STACKS = 10;

class BoneShieldGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    boneShieldStackTracker: BoneShieldStackTracker,
    marrowrendUsage: MarrowrendUsage,
  };

  protected boneShieldStackTracker!: BoneShieldStackTracker;
  protected marrowrendUsage!: MarrowrendUsage;

  tracker() {
    return this.boneShieldStackTracker;
  }

  get plot() {
    const startTime = this.owner.fight.start_time;

    const stacks: { timestamp: number; amount: number }[] = [];
    this.tracker().buffStackUpdates.forEach((tb) => {
      if (tb.change !== 0) {
        stacks.push({ timestamp: tb.timestamp, amount: tb.current - tb.change });
      }
      stacks.push({ timestamp: tb.timestamp, amount: tb.current });
    });

    const marrowrends = this.marrowrendUsage.castRecords.map((record) => ({
      timestamp: record.timestamp,
      stacksBefore: record.stacksBefore,
      // draw the cast at the stack count it produced, capped at the maximum
      stacksAfter: Math.min(MAX_STACKS, record.stacksBefore + (3 - record.wasted)),
      wasted: record.wasted,
      overcap: record.wasted > 0,
    }));

    const xAxis = {
      field: 'timestamp_shifted',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value'),
        tickCount: 25,
        grid: false,
      },
      scale: { nice: false },
      title: null,
    };
    const shiftTimestamp = [
      { filter: 'isValid(datum.timestamp)' },
      { calculate: `datum.timestamp - ${startTime}`, as: 'timestamp_shifted' },
    ];

    const spec: VisualizationSpec = {
      layer: [
        {
          data: { name: 'stacks' },
          transform: shiftTimestamp,
          mark: { type: 'line' as const },
          encoding: {
            x: xAxis,
            y: {
              field: 'amount',
              type: 'quantitative' as const,
              scale: { domain: [0, MAX_STACKS] },
              title: null,
            },
          },
        },
        {
          // Below this line Ossuary is not active
          data: { name: 'ossuary' },
          mark: { type: 'rule' as const, color: '#ffd700', strokeDash: [6, 4], strokeWidth: 1.5 },
          encoding: {
            y: { field: 'stacks', type: 'quantitative' as const },
            tooltip: [{ field: 'label', title: 'Threshold' }],
          },
        },
        {
          data: { name: 'marrowrends' },
          transform: [
            ...shiftTimestamp,
            { calculate: formatTime('datum.timestamp_shifted'), as: 'time' },
          ],
          mark: { type: 'point' as const, filled: true, size: 70, opacity: 1, strokeWidth: 1 },
          encoding: {
            x: xAxis,
            y: { field: 'stacksAfter', type: 'quantitative' as const },
            color: {
              condition: { test: 'datum.overcap', value: '#ff4d4d' },
              value: '#00ff96',
            },
            tooltip: [
              { field: 'time', title: 'Time' },
              { field: 'stacksBefore', title: 'Stacks before Marrowrend' },
              { field: 'wasted', title: 'Stacks wasted' },
            ],
          },
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
                stacks,
                ossuary: [{ stacks: OSSUARY_STACKS, label: `Ossuary (${OSSUARY_STACKS} stacks)` }],
                marrowrends,
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

export default BoneShieldGraph;
