import styled from '@emotion/styled';
import { Tooltip } from 'interface';

/**
 * A heatmap grid visualization component for displaying time-series data with color intensity.
 *
 * Heatmaps show temporal patterns and intensity variations across one or more rows,
 * making it easy to spot peaks, patterns, and relative intensity at a glance.
 */

export interface HeatmapBucket {
  /** The value for this time bucket */
  value: number;
  /** Optional timestamp for the start of this bucket (in milliseconds) */
  timestamp?: number;
}

export interface HeatmapRow {
  /** Label for this row (e.g., target name, spell name) */
  label?: string;
  /** Optional secondary label (e.g., total value for the row) */
  secondaryLabel?: string;
  /** Array of bucket values for this row */
  buckets: HeatmapBucket[];
}

export interface HeatmapColorThreshold {
  /** Minimum value for this color tier */
  minValue: number;
  /** Color to use for values >= minValue */
  color: string;
}

export interface HeatmapProps {
  /** Array of rows to display in the heatmap */
  rows: HeatmapRow[];
  /** Color thresholds for the heatmap gradient (from lowest to highest) */
  colorThresholds: HeatmapColorThreshold[];
  /** Default color for zero/empty buckets. Default: '#1f2937' (dark gray) */
  emptyColor?: string;
  /** Whether to show row labels. Default: true */
  showLabels?: boolean;
  /** Custom tooltip formatter. Receives bucket value and returns tooltip content */
  tooltipFormatter?: (bucket: HeatmapBucket, rowLabel?: string) => React.ReactNode;
  /** Cell size in pixels. Default: 20 */
  cellSize?: number;
  /** Gap between cells in pixels. Default: 2 */
  cellGap?: number;
  /** Gap between rows in pixels. Default: 16 */
  rowGap?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Heatmap component for visualizing time-series intensity data.
 *
 * @example
 * ```tsx
 * <Heatmap
 *   rows={[
 *     {
 *       label: "Boss",
 *       secondaryLabel: "(1.2M)",
 *       buckets: [
 *         { value: 15000, timestamp: 0 },
 *         { value: 22000, timestamp: 1000 },
 *         // ... more buckets
 *       ]
 *     }
 *   ]}
 *   colorThresholds={[
 *     { minValue: 0, color: '#fee' },
 *     { minValue: 10000, color: '#fbb' },
 *     { minValue: 20000, color: '#f88' },
 *     { minValue: 30000, color: '#f55' },
 *     { minValue: 40000, color: '#f22' },
 *   ]}
 *   tooltipFormatter={(bucket) => `DPS: ${bucket.value}`}
 * />
 * ```
 */
export default function Heatmap({
  rows,
  colorThresholds,
  emptyColor = '#1f2937',
  showLabels = true,
  tooltipFormatter,
  cellSize = 20,
  cellGap = 2,
  rowGap = 16,
  className,
}: HeatmapProps) {
  const getColor = (value: number): string => {
    if (value === 0) return emptyColor;

    // Sort thresholds by minValue descending and find the first match
    const sorted = [...colorThresholds].sort((a, b) => b.minValue - a.minValue);
    for (const threshold of sorted) {
      if (value >= threshold.minValue) {
        return threshold.color;
      }
    }

    // Return the lowest threshold color as fallback
    return colorThresholds[0]?.color || emptyColor;
  };

  const defaultTooltip = (bucket: HeatmapBucket, rowLabel?: string) => (
    <>
      {rowLabel && (
        <>
          <strong>{rowLabel}</strong>
          <br />
        </>
      )}
      <strong>Value:</strong> {bucket.value.toFixed(0)}
      {bucket.timestamp !== undefined && (
        <>
          <br />
          <strong>Time:</strong> {(bucket.timestamp / 1000).toFixed(1)}s
        </>
      )}
    </>
  );

  const getTooltipContent = tooltipFormatter || defaultTooltip;

  return (
    <Container className={className} $rowGap={rowGap}>
      {rows.map((row, rowIdx) => (
        <Row key={rowIdx}>
          {showLabels && row.label && (
            <RowLabel>
              {row.label}
              {row.secondaryLabel && <SecondaryLabel>{row.secondaryLabel}</SecondaryLabel>}
            </RowLabel>
          )}

          <CellsContainer $gap={cellGap}>
            {row.buckets.map((bucket, bucketIdx) => (
              <Tooltip key={bucketIdx} content={getTooltipContent(bucket, row.label)}>
                <Cell $color={getColor(bucket.value)} $size={cellSize} />
              </Tooltip>
            ))}
          </CellsContainer>
        </Row>
      ))}
    </Container>
  );
}

// Styled Components

const Container = styled.div<{ $rowGap: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $rowGap }) => $rowGap}px;
  min-width: fit-content;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RowLabel = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const SecondaryLabel = styled.span`
  margin-left: 8px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
`;

const CellsContainer = styled.div<{ $gap: number }>`
  display: flex;
  gap: ${({ $gap }) => $gap}px;
  flex: 1;
`;

const Cell = styled.div<{ $color: string; $size: number }>`
  flex: 1;
  min-width: 0;
  aspect-ratio: 1;
  max-width: ${({ $size }) => $size}px;
  max-height: ${({ $size }) => $size}px;
  background-color: ${({ $color }) => $color};
  border-radius: 2px;
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
`;
