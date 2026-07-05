import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import { VisualizationSpec } from 'react-vega';
import { FuryTracker } from './FuryTracker';

type FuryGraphPoint = {
  timestamp: number;
  amount: number;
  wasted?: number;
};

type FuryGraphData = {
  graphData?: FuryGraphPoint[];
};

type FuryGraphSpec = VisualizationSpec & {
  layer?: Array<{
    encoding?: {
      y?: {
        scale?: {
          domain: [number, number];
          nice: boolean;
        };
      };
    };
  }>;
};

export class FuryGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    furyTracker: FuryTracker,
  };

  furyTracker!: FuryTracker;

  tracker() {
    return this.furyTracker;
  }

  /** Get the actual max Fury from the tracker's resource updates */
  private getActualMaxFury(): number {
    const updates = this.furyTracker.resourceUpdates;
    if (updates.length === 0) {
      return 200; // fallback
    }

    // Find the maximum 'max' value reported in the resource updates
    let maxFury = 0;
    for (const update of updates) {
      if (update.max > maxFury) {
        maxFury = update.max;
      }
    }

    return maxFury || 200; // fallback if no max found
  }

  get vegaSpec(): VisualizationSpec {
    const spec = super.vegaSpec as FuryGraphSpec;
    const maxFury = this.getActualMaxFury();

    // Set the y-axis to the actual max Fury for the player
    if (spec.layer && spec.layer[0] && spec.layer[0].encoding?.y) {
      spec.layer[0].encoding.y.scale = { domain: [0, maxFury], nice: false };
    }

    return spec;
  }

  get graphData() {
    const baseData = super.graphData as FuryGraphData;
    const maxFury = this.getActualMaxFury();

    if (baseData.graphData) {
      const filtered: FuryGraphPoint[] = [];

      for (let i = 0; i < baseData.graphData.length; i++) {
        const point = baseData.graphData[i];

        // Hard clamp to actual max Fury
        const clampedPoint = {
          ...point,
          amount: Math.min(point.amount, maxFury),
        };

        // Detect unrealistic spikes: if there's a sudden jump from low to high fury
        // that returns to low within a couple of events, skip it
        if (i > 0 && i < baseData.graphData.length - 1) {
          const prevAmount = filtered[filtered.length - 1]?.amount ?? 0;
          const nextAmount = baseData.graphData[i + 1]?.amount ?? 0;

          // If this point is a spike (higher than both neighbors) and is unrealistic, skip it
          if (
            clampedPoint.amount > maxFury * 0.5 &&
            prevAmount < maxFury * 0.4 &&
            nextAmount < maxFury * 0.4 &&
            clampedPoint.amount > prevAmount + maxFury * 0.25
          ) {
            // Skip this spike
            continue;
          }
        }

        filtered.push(clampedPoint);
      }

      baseData.graphData = filtered;
    }

    return baseData;
  }

  // plot included in Guide
}
