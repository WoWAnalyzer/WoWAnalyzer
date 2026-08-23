import { Fragment, useMemo, type JSX } from 'react';
import { formatDuration, formatDurationMillisMinSec, formatPercentage } from 'common/format';
import { Tooltip } from 'interface';
import styles from './TimelineHeatmapGrid.module.scss';

interface TimelineDataPoint {
  timestamp: number;
  /** Value on the same scale as the bracket boundaries below (e.g. 0-100 for a percentage,
   * or a raw count such as Arcane Charge stacks) */
  value: number;
}

/** A group of cast timestamps to mark along the heatmap's time axis (e.g. Arcane Surge casts) */
export interface MarkerGroup {
  label: string;
  color: string;
  timestamps: number[];
}

/** A single row of the heatmap. Consumers define however many brackets they need and
 * whatever boundaries make sense for their data (e.g. mana percent ranges, or Arcane
 * Charge stack counts of 1/2/3/4). */
export interface TimelineHeatmapBracket {
  label: string;
  /** Inclusive lower bound for this bracket, on the same scale as the data points' values */
  min: number;
  color: string;
}

interface TimelineHeatmapGridProps {
  dataPoints: TimelineDataPoint[];
  /** Rows of the heatmap, ordered highest bracket first. Their count and boundaries are
   * entirely up to the consumer. */
  brackets: TimelineHeatmapBracket[];
  /** Label used in cell tooltips alongside the bracket, e.g. "Mana", "Energy", "Arcane Charges" */
  valueLabel: string;
  startTime: number;
  endTime: number;
  /** Number of equal-width time columns to split the fight into. Default: 10 */
  bucketCount?: number;
  markerGroups?: MarkerGroup[];
}

/** Show an axis label roughly every 30 real seconds, regardless of bucket count */
const AXIS_TICK_INTERVAL_MS = 30000;

/** Width of the row-label column, used to offset the legend to line up with the first bucket */
const LABEL_COLUMN_WIDTH = 80;
/** Width of the totals column */
const TOTAL_COLUMN_WIDTH = 120;
const GRID_GAP = 3;

/** Negative margins (relative to the default GRID_GAP) that tighten specific row transitions
 * below the graph: a slight gap above the axis bar, then progressively closer spacing down
 * through the time labels and marker ticks. */
const AXIS_BAR_MARGIN_TOP = 1; // ~2px gap between the graph and the axis bar/Total border
const AXIS_LABELS_MARGIN_TOP = -15; // ~6px gap between the axis bar and the time labels
const MARKER_TRACK_MARGIN_TOP = -15; // ~3px gap between the time labels and the cast ticks

function getBracketIndex(brackets: TimelineHeatmapBracket[], value: number): number {
  for (let i = 0; i < brackets.length; i += 1) {
    if (value >= brackets[i].min) {
      return i;
    }
  }
  return brackets.length - 1;
}

function hexToRgba(hex: string, alpha: number): string {
  const value = parseInt(hex.replace('#', ''), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Builds [bracket][bucket] -> milliseconds spent, by distributing each data point's
 * duration across the fight-time buckets it overlaps. */
function computeBracketMatrix(
  dataPoints: TimelineDataPoint[],
  brackets: TimelineHeatmapBracket[],
  startTime: number,
  endTime: number,
  bucketCount: number,
): number[][] {
  const matrix = brackets.map(() => new Array(bucketCount).fill(0) as number[]);
  const fightDuration = endTime - startTime;
  if (!dataPoints || dataPoints.length === 0 || fightDuration <= 0) {
    return matrix;
  }
  const bucketSize = fightDuration / bucketCount;

  const intervals: Array<{ start: number; end: number; value: number }> = [];
  const first = dataPoints[0];
  const firstStart = Math.min(Math.max(first.timestamp, startTime), endTime);
  if (firstStart > startTime) {
    intervals.push({ start: startTime, end: firstStart, value: first.value });
  }
  dataPoints.forEach((point, i) => {
    const nextTimestamp = i + 1 < dataPoints.length ? dataPoints[i + 1].timestamp : endTime;
    const start = Math.min(Math.max(point.timestamp, startTime), endTime);
    const end = Math.min(Math.max(nextTimestamp, startTime), endTime);
    if (end > start) {
      intervals.push({ start, end, value: point.value });
    }
  });

  intervals.forEach(({ start, end, value }) => {
    const bracketIdx = getBracketIndex(brackets, value);
    const firstBucket = Math.max(
      0,
      Math.min(bucketCount - 1, Math.floor((start - startTime) / bucketSize)),
    );
    const lastBucket = Math.max(
      0,
      Math.min(bucketCount - 1, Math.ceil((end - startTime) / bucketSize) - 1),
    );
    for (let b = firstBucket; b <= lastBucket; b += 1) {
      const bucketStart = startTime + b * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const overlap = Math.max(0, Math.min(end, bucketEnd) - Math.max(start, bucketStart));
      matrix[bracketIdx][b] += overlap;
    }
  });

  return matrix;
}

/** Tick timestamps (relative to fight start) placed every 30s, for a proportionally even axis */
function getAxisTicks(fightDuration: number): number[] {
  const ticks: number[] = [];
  for (let tickTime = 0; tickTime <= fightDuration; tickTime += AXIS_TICK_INTERVAL_MS) {
    ticks.push(tickTime);
  }
  return ticks;
}

/**
 * Heatmap grid showing how much time was spent in each of the consumer-defined brackets,
 * broken down by portion of the fight. Rows are brackets (e.g. mana percent ranges, Arcane
 * Charge stack counts), columns are equal-width fight-time buckets, and cell color intensity
 * reflects how much of that bucket was spent in that bracket. A time axis (with an optional
 * marker timeline overlaying cast events, e.g. Arcane Surge, Evocation) runs below the grid.
 * The final column totals time and percentage of the whole fight per bracket.
 */
export default function TimelineHeatmapGrid({
  dataPoints,
  brackets,
  valueLabel,
  startTime,
  endTime,
  bucketCount = 10,
  markerGroups = [],
}: TimelineHeatmapGridProps): JSX.Element | null {
  const fightDuration = endTime - startTime;
  const matrix = useMemo(
    () => computeBracketMatrix(dataPoints, brackets, startTime, endTime, bucketCount),
    [dataPoints, brackets, startTime, endTime, bucketCount],
  );

  if (fightDuration <= 0) {
    return null;
  }

  const bucketSize = fightDuration / bucketCount;
  const bracketTotals = matrix.map((row) => row.reduce((sum, ms) => sum + ms, 0));
  const hasMarkers = markerGroups.some((group) => group.timestamps.length > 0);
  const axisTicks = getAxisTicks(fightDuration);

  const totalCol = bucketCount + 2;
  const axisBarRow = brackets.length + 1;
  const axisLabelsRow = brackets.length + 2;
  const markerRow = hasMarkers ? brackets.length + 3 : undefined;
  const rowSizes = [`repeat(${brackets.length}, 38px)`, '20px', '18px'];
  if (hasMarkers) {
    rowSizes.push('20px');
  }

  return (
    <div className={styles.Container}>
      <div
        className={styles.Grid}
        style={{
          gridTemplateColumns: `${LABEL_COLUMN_WIDTH}px repeat(${bucketCount}, 1fr) ${TOTAL_COLUMN_WIDTH}px`,
          gridTemplateRows: rowSizes.join(' '),
        }}
      >
        {brackets.map((bracket, i) => (
          <Fragment key={bracket.label}>
            <div
              className={styles.RowLabel}
              style={{ gridRow: i + 1, gridColumn: 1, borderColor: bracket.color }}
            >
              {bracket.label}
            </div>
            {matrix[i].map((ms, b) => {
              const bucketFraction = bucketSize > 0 ? ms / bucketSize : 0;
              const bucketStart = b * bucketSize;
              const bucketEnd = bucketStart + bucketSize;
              const cellColor =
                bucketFraction === 0
                  ? 'rgba(255, 255, 255, 0.04)'
                  : hexToRgba(bracket.color, 0.25 + bucketFraction * 0.7);
              return (
                <Tooltip
                  key={b}
                  content={
                    <>
                      <strong>
                        {bracket.label} {valueLabel}
                      </strong>
                      <div>
                        {formatDuration(bucketStart)} – {formatDuration(bucketEnd)}
                      </div>
                      <div>
                        {formatDurationMillisMinSec(ms)} ({formatPercentage(bucketFraction, 0)}% of
                        segment)
                      </div>
                    </>
                  }
                >
                  <div
                    className={styles.Cell}
                    style={{ gridRow: i + 1, gridColumn: b + 2, backgroundColor: cellColor }}
                  />
                </Tooltip>
              );
            })}
            <div
              className={styles.TotalCell}
              style={{ gridRow: i + 1, gridColumn: totalCol, borderColor: bracket.color }}
            >
              <div className={styles.TotalValueRow}>
                <span className={styles.TotalPercent}>
                  {formatPercentage(bracketTotals[i] / fightDuration, 0)}%
                </span>
                <span className={styles.TotalTime}>
                  {formatDurationMillisMinSec(bracketTotals[i])}
                </span>
              </div>
              <div className={styles.TotalBarTrack}>
                <div
                  className={styles.TotalBarFill}
                  style={{
                    width: `${(bracketTotals[i] / fightDuration) * 100}%`,
                    backgroundColor: bracket.color,
                  }}
                />
              </div>
            </div>
          </Fragment>
        ))}

        <div
          className={styles.AxisBarLine}
          style={{
            gridRow: axisBarRow,
            gridColumn: `2 / span ${bucketCount}`,
            marginTop: AXIS_BAR_MARGIN_TOP,
          }}
        />
        <div
          className={styles.TotalHeader}
          style={{ gridRow: axisBarRow, gridColumn: totalCol, marginTop: AXIS_BAR_MARGIN_TOP }}
        >
          Total
        </div>

        <div
          className={styles.AxisLabels}
          style={{
            gridRow: axisLabelsRow,
            gridColumn: `2 / span ${bucketCount}`,
            marginTop: AXIS_LABELS_MARGIN_TOP,
          }}
        >
          {axisTicks.map((tick) => (
            <div
              key={tick}
              className={styles.TimeAxisTick}
              style={{ left: `${(tick / fightDuration) * 100}%` }}
            >
              {formatDuration(tick)}
            </div>
          ))}
        </div>

        {hasMarkers && (
          <div
            className={styles.MarkerTrack}
            style={{
              gridRow: markerRow,
              gridColumn: `2 / span ${bucketCount}`,
              marginTop: MARKER_TRACK_MARGIN_TOP,
            }}
          >
            {markerGroups.flatMap((group) =>
              group.timestamps.map((timestamp, idx) => {
                const pct = ((timestamp - startTime) / fightDuration) * 100;
                if (pct < 0 || pct > 100) {
                  return null;
                }
                return (
                  <Tooltip
                    key={`${group.label}-${idx}`}
                    content={
                      <>
                        <strong>{group.label}</strong>
                        <div>{formatDuration(timestamp - startTime)}</div>
                      </>
                    }
                  >
                    <div
                      className={styles.Marker}
                      style={{ left: `${pct}%`, backgroundColor: group.color }}
                    />
                  </Tooltip>
                );
              }),
            )}
          </div>
        )}
      </div>

      {hasMarkers && (
        <div className={styles.Legend} style={{ marginLeft: `${LABEL_COLUMN_WIDTH + GRID_GAP}px` }}>
          {markerGroups.map((group) => (
            <div key={group.label} className={styles.LegendItem}>
              <div className={styles.LegendSwatch} style={{ backgroundColor: group.color }} />
              {group.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
