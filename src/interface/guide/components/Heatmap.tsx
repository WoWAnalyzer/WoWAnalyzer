import styled from '@emotion/styled';
import { Tooltip } from 'interface';
import { formatNumber } from 'common/format';
import { useRef, useEffect, useState } from 'react';

/**
 * A heatmap grid visualization component for displaying time-series data with color intensity.
 *
 * Heatmaps show temporal patterns and intensity variations across one or more rows,
 * making it easy to spot peaks, patterns, and relative intensity at a glance.
 */

export interface HeatmapBlock {
  /** The value for this time block */
  value: number;
  /** Optional timestamp for the start of this block (in milliseconds) */
  timestamp?: number;
}

export interface HeatmapRow {
  /** Label for this row (e.g., target name, spell name) */
  label?: string;
  /** Optional secondary label (e.g., total value for the row) */
  secondaryLabel?: string;
  /** Array of block values for this row */
  blocks: HeatmapBlock[];
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
  /** Custom tooltip format function. Receives block value and returns tooltip content */
  tooltipFormat?: (block: HeatmapBlock, rowLabel?: string) => React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Heatmap component for visualizing time-series intensity data.
 *
 * @param rows - Array of rows to display in the heatmap
 * @param colorThresholds - Color thresholds for gradient (lowest to highest)
 * @param emptyColor - Default color for zero/empty buckets (default: dark gray #1f2937)
 * @param tooltipFormat - Custom tooltip format function
 * @param className - Optional CSS class name
 */
export default function Heatmap({
  rows,
  colorThresholds,
  emptyColor = '#1f2937',
  tooltipFormat,
  className,
}: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(20);

  const blockCount = rows[0]?.blocks.length || 60;
  const cellGap = 2;
  const rowGap = 16;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const totalGapWidth = (blockCount - 1) * cellGap;
        const availableForCells = containerWidth - totalGapWidth;
        const calculatedSize = Math.floor(availableForCells / blockCount);

        // Clamp between reasonable min/max values
        const size = Math.max(8, Math.min(24, calculatedSize));

        setCellSize(size);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [blockCount, cellGap]);

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

  const defaultTooltip = (block: HeatmapBlock, rowLabel?: string) => (
    <>
      {rowLabel && (
        <>
          <strong>{rowLabel}</strong>
          <br />
        </>
      )}
      <strong>Value:</strong> {formatNumber(block.value)}
      {block.timestamp !== undefined && (
        <>
          <br />
          <strong>Time:</strong> {(block.timestamp / 1000).toFixed(1)}s
        </>
      )}
    </>
  );

  const getTooltipContent = tooltipFormat || defaultTooltip;

  return (
    <Container $rowGap={rowGap} className={className} ref={containerRef}>
      {rows.map((row, rowIdx) => (
        <Row key={rowIdx}>
          {row.label && (
            <RowLabel>
              {row.label}
              {row.secondaryLabel && <SecondaryLabel>{row.secondaryLabel}</SecondaryLabel>}
            </RowLabel>
          )}

          <CellsContainer $gap={cellGap}>
            {row.blocks.map((block, blockIdx) => (
              <Tooltip key={blockIdx} content={getTooltipContent(block, row.label)}>
                <Cell $color={getColor(block.value)} $size={cellSize} />
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
  width: 100%;
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
`;

const Cell = styled.div<{ $color: string; $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex-shrink: 0;
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
