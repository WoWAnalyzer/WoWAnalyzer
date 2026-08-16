import { Fragment, useMemo, type JSX } from 'react';
import { formatDuration, formatDurationMillisMinSec, formatPercentage } from 'common/format';
import { Tooltip } from 'interface';
import styles from './ManaBracketHeatmap.module.scss';

interface ManaUpdate {
  timestamp: number;
  current: number;
  max: number;
}

/** A group of cast timestamps to mark along the heatmap's time axis (e.g. Arcane Surge casts) */
export interface MarkerGroup {
  label: string;
  color: string;
  timestamps: number[];
}

interface ManaBracketHeatmapProps {
  manaUpdates: ManaUpdate[];
  startTime: number;
  endTime: number;
  /** Number of equal-width time columns to split the fight into. Default: 10 */
  bucketCount?: number;
  markerGroups?: MarkerGroup[];
}

interface ManaBracket {
  label: string;
  /** Inclusive lower bound (percent) for this bracket */
  min: number;
  color: string;
}

const MANA_BRACKETS: ManaBracket[] = [
  { label: '81–100%', min: 80, color: '#4CAF50' },
  { label: '61–79%', min: 60, color: '#8BC34A' },
  { label: '41–59%', min: 40, color: '#FFC107' },
  { label: '21–39%', min: 20, color: '#FF9800' },
  { label: '<20%', min: 0, color: '#F44336' },
];

/** Show an axis label roughly every 30 real seconds, regardless of bucket count */
const AXIS_TICK_INTERVAL_MS = 30000;

/** Width of the row-label/totals columns, used to offset the legend to line up with the first bucket */
const LABEL_COLUMN_WIDTH = 130;
const GRID_GAP = 3;

function getBracketIndex(percent: number): number {
  for (let i = 0; i < MANA_BRACKETS.length; i += 1) {
    if (percent >= MANA_BRACKETS[i].min) {
      return i;
    }
  }
  return MANA_BRACKETS.length - 1;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = parseInt(hex.replace('#', ''), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Builds [bracket][bucket] -> milliseconds spent, by distributing each mana state's
 * duration across the fight-time buckets it overlaps. */
function computeBracketMatrix(
  manaUpdates: ManaUpdate[],
  startTime: number,
  endTime: number,
  bucketCount: number,
): number[][] {
  const matrix = MANA_BRACKETS.map(() => new Array(bucketCount).fill(0) as number[]);
  const fightDuration = endTime - startTime;
  if (!manaUpdates || manaUpdates.length === 0 || fightDuration <= 0) {
    return matrix;
  }
  const bucketSize = fightDuration / bucketCount;

  const intervals: Array<{ start: number; end: number; percent: number }> = [];
  const first = manaUpdates[0];
  const firstStart = Math.min(Math.max(first.timestamp, startTime), endTime);
  if (firstStart > startTime) {
    intervals.push({
      start: startTime,
      end: firstStart,
      percent: (first.current / first.max) * 100,
    });
  }
  manaUpdates.forEach((update, i) => {
    const nextTimestamp = i + 1 < manaUpdates.length ? manaUpdates[i + 1].timestamp : endTime;
    const start = Math.min(Math.max(update.timestamp, startTime), endTime);
    const end = Math.min(Math.max(nextTimestamp, startTime), endTime);
    if (end > start) {
      intervals.push({ start, end, percent: (update.current / update.max) * 100 });
    }
  });

  intervals.forEach(({ start, end, percent }) => {
    const bracketIdx = getBracketIndex(percent);
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

function interpolateHex(hexA: string, hexB: string, ratio: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * ratio);
  const g = Math.round(a.g + (b.g - a.g) * ratio);
  const bl = Math.round(a.b + (b.b - a.b) * ratio);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Maps a mana percent (0-100) to a color interpolated between the same bracket colors
 * used by the heatmap cells, so the strip reads as a continuous version of the same scale. */
function getBracketColorAt(percent: number): string {
  const anchors = [...MANA_BRACKETS].reverse(); // ascending by min: 0, 20, 40, 60, 80
  const clamped = Math.max(0, Math.min(100, percent));
  for (let i = 0; i < anchors.length - 1; i += 1) {
    const lower = anchors[i];
    const upper = anchors[i + 1];
    if (clamped <= upper.min) {
      const span = upper.min - lower.min;
      const ratio = span === 0 ? 0 : (clamped - lower.min) / span;
      return interpolateHex(lower.color, upper.color, ratio);
    }
  }
  return anchors[anchors.length - 1].color;
}

/** Builds CSS linear-gradient color stops directly from raw mana update events, so the
 * strip reflects true continuous mana rather than the bucketed bracket averages. */
function buildManaGradientStops(
  manaUpdates: ManaUpdate[],
  startTime: number,
  endTime: number,
): string {
  const fightDuration = endTime - startTime;
  if (!manaUpdates || manaUpdates.length === 0 || fightDuration <= 0) {
    return `${getBracketColorAt(100)} 0%, ${getBracketColorAt(100)} 100%`;
  }

  const points = manaUpdates
    .map((update) => ({
      pct: ((update.timestamp - startTime) / fightDuration) * 100,
      percent: (update.current / update.max) * 100,
    }))
    .filter((point) => point.pct >= 0 && point.pct <= 100)
    .sort((a, b) => a.pct - b.pct);

  if (points.length === 0) {
    const color = getBracketColorAt((manaUpdates[0].current / manaUpdates[0].max) * 100);
    return `${color} 0%, ${color} 100%`;
  }

  const stops: string[] = [];
  if (points[0].pct > 0) {
    stops.push(`${getBracketColorAt(points[0].percent)} 0%`);
  }
  points.forEach((point) => {
    stops.push(`${getBracketColorAt(point.percent)} ${point.pct}%`);
  });
  if (points[points.length - 1].pct < 100) {
    stops.push(`${getBracketColorAt(points[points.length - 1].percent)} 100%`);
  }
  return stops.join(', ');
}

/**
 * Heatmap grid showing how much time was spent in each mana bracket, broken down by
 * portion of the fight. Rows are mana brackets, columns are equal-width fight-time
 * buckets, and cell color intensity reflects how much of that bucket was spent in that
 * bracket. An optional marker timeline overlays cast events (e.g. Arcane Surge,
 * Evocation) along the same time axis. The final column totals time and percentage of
 * the whole fight per bracket.
 */
export default function ManaBracketHeatmap({
  manaUpdates,
  startTime,
  endTime,
  bucketCount = 10,
  markerGroups = [],
}: ManaBracketHeatmapProps): JSX.Element | null {
  const fightDuration = endTime - startTime;
  const matrix = useMemo(
    () => computeBracketMatrix(manaUpdates, startTime, endTime, bucketCount),
    [manaUpdates, startTime, endTime, bucketCount],
  );

  if (fightDuration <= 0) {
    return null;
  }

  const bucketSize = fightDuration / bucketCount;
  const bracketTotals = matrix.map((row) => row.reduce((sum, ms) => sum + ms, 0));
  const hasMarkers = markerGroups.some((group) => group.timestamps.length > 0);
  const axisTicks = getAxisTicks(fightDuration);
  const manaGradientStops = buildManaGradientStops(manaUpdates, startTime, endTime);

  return (
    <div className={styles.Container}>
      <div
        className={styles.Grid}
        style={{
          gridTemplateColumns: `${LABEL_COLUMN_WIDTH}px repeat(${bucketCount}, 1fr) ${LABEL_COLUMN_WIDTH}px`,
          gridTemplateRows: `28px ${hasMarkers ? '20px ' : ''}22px repeat(${MANA_BRACKETS.length}, 38px)`,
        }}
      >
        <div className={styles.CornerCell} />
        <div className={styles.TimeAxis} style={{ gridColumn: `2 / span ${bucketCount}` }}>
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
        <div className={styles.TotalHeader}>Total</div>

        {hasMarkers && (
          <>
            <div className={styles.CornerCell} />
            <div className={styles.MarkerTrack} style={{ gridColumn: `2 / span ${bucketCount}` }}>
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
            <div className={styles.CornerCell} />
          </>
        )}

        <div className={styles.CornerCell} />
        <div
          className={styles.GradientTrack}
          style={{
            gridColumn: `2 / span ${bucketCount}`,
            background: `linear-gradient(to right, ${manaGradientStops})`,
          }}
        />
        <div className={styles.CornerCell} />

        {MANA_BRACKETS.map((bracket, i) => (
          <Fragment key={bracket.label}>
            <div className={styles.RowLabel} style={{ borderColor: bracket.color }}>
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
                      <strong>{bracket.label} Mana</strong>
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
                  <div className={styles.Cell} style={{ backgroundColor: cellColor }} />
                </Tooltip>
              );
            })}
            <div className={styles.TotalCell} style={{ borderColor: bracket.color }}>
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
