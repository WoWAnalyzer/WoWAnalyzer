import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import Analyzer from 'parser/core/Analyzer';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VisualizationSpec } from 'react-vega';
import { Color } from 'vega';

abstract class ResourceGraph extends Analyzer {
  /** Implementer must override this to return the ResourceTracker for the resource to graph */
  abstract tracker(): ResourceTracker;

  /** Implementer may set this to include the wasted line on the graph.
   *  Note that the ResourceTracker must have events with `Event.changeWaste` for this to work.
   */
  includeWasted: boolean = false;

  /** Implementer may override this to give the graph line a custom color.
   *
   * Accepts a valid CSS color string. For example: #f304d3, #ccc, rgb(253, 12, 134), steelblue.
   *
   * Ref https://vega.github.io/vega-lite/docs/types.html#color
   */
  lineColor(): Color | undefined {
    return undefined;
  }

  /** Implementer may override this to give the wasted line a custom color.
   *
   * Accepts a valid CSS color string. For example: #f304d3, #ccc, rgb(253, 12, 134), steelblue.
   *
   * Ref https://vega.github.io/vega-lite/docs/types.html#color
   */
  wastedColor(): Color {
    return 'rgba(255,90,160,1)';
  }

  resourceName(): string {
    return this.tracker().resource.name;
  }

  /** Some are scaled differently in events vs the user facing value. Implementer may override
   *  this to apply a scale factor so the graph shows with the user facing value.
   *  The returned value should be the multiplier to get from the events value to the user value. */
  scaleFactor(): number {
    return 1;
  }

  get vegaSpec(): VisualizationSpec {
    return {
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
        {
          // Tooltips cant have calculated fields, so we need to calculate this here.
          calculate: formatTime('datum.timestamp_shifted'),
          as: 'timestamp_humanized',
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
        {
          layer: [
            // First layer always applies. Show the line of current resources.
            {
              mark: {
                type: 'line' as const,
                color: this.lineColor(),
                interpolate: 'step-after' as const,
              },
            },
            // Makes a visual point if the "hover" signal defined further down is active for this point.
            { transform: [{ filter: { param: 'hover', empty: false } }], mark: 'point' },
          ],
          encoding: {
            y: {
              field: 'amount',
              title: this.resourceName(),
              type: 'quantitative' as const,
              axis: {
                grid: true,
              },
            },
          },
        },
        // Contrived logic to conditionally include this layer if the wasted line is enabled on the class.
        ...(this.includeWasted
          ? [
              {
                layer: [
                  {
                    // First layer always applies
                    mark: {
                      type: 'line' as const,
                      color: this.wastedColor(),
                      interpolate: 'step-before' as const,
                    },
                  },
                  // Makes a visual point if the "hover" signal defined further down is active for this point.
                  {
                    transform: [{ filter: { param: 'hover', empty: false } }],
                    mark: 'point' as const,
                  },
                ],
                encoding: {
                  y: {
                    field: 'wasted',
                    title: `Wasted ${this.resourceName()}`,
                    type: 'quantitative' as const,
                    axis: {
                      grid: true,
                    },
                  },
                },
              },
            ]
          : []),
        {
          // Define one vertical line (type=rule) per datapoint that is white.
          mark: {
            type: 'rule',
            color: 'white',
          },
          encoding: {
            opacity: {
              // If the "hover" signal is active, make the line slightly opaque, else invisible.
              condition: {
                value: 0.3,
                param: 'hover',
                empty: false,
              },
              value: 0,
            },
            tooltip: [
              { field: 'timestamp_humanized', type: 'nominal', title: 'Time' },
              { field: 'amount', type: 'quantitative', title: this.resourceName() },
              // Contrived way of conditionally including this object if the wasted line is enabled on the class.
              ...(this.includeWasted
                ? [
                    {
                      field: 'wasted',
                      type: 'quantitative' as const,
                      title: `Wasted ${this.resourceName()}`,
                    },
                  ]
                : []),
            ],
          },
          // Activate the "hover" signal on the closest datapoint to the mouse cursor.
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
      config: {
        view: {},
      },
    };
  }
  get graphData() {
    const graphData: GraphData[] = [];
    const tracker = this.tracker();
    const scaleFactor = this.scaleFactor();
    tracker.resourceUpdates.forEach((u) => {
      const data: GraphData = {
        timestamp: u.timestamp,
        amount: u.current * scaleFactor,
      };

      if (this.includeWasted) {
        data.wasted = (u.changeWaste || 0) * scaleFactor;
      }

      graphData.push(data);
    });

    return { graphData };
  }

  get plot() {
    // TODO make fixed 100% = 2 minutes, allow horizontal scroll
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
            <BaseChart spec={this.vegaSpec} data={this.graphData} width={width} height={height} />
          )}
        </AutoSizer>
      </div>
    );
  }
}

/** The type used to compile the data for graphing. */
export type GraphData = {
  /** Timestamp of the data point */
  timestamp: number;

  /** Graph library supports arbitrary keys, which can be referenced in the spec. */
  [key: string]: number;
  // TODO also include max, rate, etc??
};

export default ResourceGraph;
