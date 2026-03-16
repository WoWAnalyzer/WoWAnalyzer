import { Tooltip } from 'interface';
import { qualitativePerformanceToColor, PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState, useMemo, useCallback, useRef, type CSSProperties } from 'react';
import { TipBox } from './TipBox';
import styles from './CastDetail.module.scss';
import GuideDataWrapper, {
  HelperText,
  HelperTextRow,
  FilterBadge,
  PerfBadgeCount,
  PerfBadgeDivider,
  PerfBadgeGrid,
  PerfBadgeLabel,
  StatCard,
  StatCardDivider,
  StatCardLabel,
  StatCardValue,
  StatsGrid,
} from './GuideDataWrapper';

/** A single statistic about a cast (e.g., damage dealt, targets hit) */
export interface PerCastStat {
  /** The stat value to display — string or any ReactNode (e.g. a SpellIcon) */
  value: React.ReactNode;
  /** Label describing what this stat represents */
  label: string;
  /** Detailed tooltip content for this stat */
  tooltip: React.ReactNode;
  /** Optional performance rating for color-coding this specific stat */
  performance?: QualitativePerformance;
}

export interface AdditionalContent {
  title?: string;
  content: React.ReactNode;
}

/** Complete data for displaying a single cast */
export interface PerCastData {
  /** Overall performance rating for this cast */
  performance: QualitativePerformance;
  /** Array of stats to display for this cast */
  stats: PerCastStat[];
  /** Optional tooltip content for the entire cast */
  tooltip?: React.ReactNode;
  /** Formatted timestamp string (e.g., "1:23") */
  timestamp: string;
  /** Optional additional details to show below the cast */
  details?: React.ReactNode;
  /** Optional icon override for the details box. Set to null to suppress the default icon. */
  detailsIcon?: React.ReactNode | null;
  additionalContent?: AdditionalContent;
}

interface CastDetailProps {
  /** Title for the cast detail section */
  title: string;
  /** Array of per-cast data to display */
  casts: PerCastData[];
  /** Optional description text shown below the title */
  description?: string;
}

const PERF_LEVELS = [
  { perf: QualitativePerformance.Perfect, label: 'Perfect' },
  { perf: QualitativePerformance.Good, label: 'Good' },
  { perf: QualitativePerformance.Ok, label: 'Ok' },
  { perf: QualitativePerformance.Fail, label: 'Bad' },
] as const;

/**
 * Displays per-cast statistics in a grid with performance-based colored boxes.
 * Each box represents one cast with its stats and overall performance.
 * Includes navigation controls and performance filtering.
 *
 * @param title - Title for the cast detail section
 * @param casts - Array of per-cast data to display
 * @param description - Optional description text shown below the title
 */
export default function CastDetail({ title, casts, description }: CastDetailProps) {
  type ColorStyle = CSSProperties & {
    '--cast-color'?: string;
    '--card-accent-end'?: string;
    '--card-accent-start'?: string;
    '--header-perf-bg'?: string;
    '--header-perf-border'?: string;
    '--rect-color'?: string;
    '--rect-color-hover'?: string;
    '--rect-color-inactive'?: string;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [performanceFilter, setPerformanceFilter] = useState<Set<QualitativePerformance>>(
    () =>
      new Set([
        QualitativePerformance.Perfect,
        QualitativePerformance.Good,
        QualitativePerformance.Ok,
        QualitativePerformance.Fail,
      ]),
  );

  const filteredCasts = useMemo(() => {
    return casts.filter((cast) => performanceFilter.has(cast.performance));
  }, [casts, performanceFilter]);

  const performanceCounts = {
    [QualitativePerformance.Perfect]: 0,
    [QualitativePerformance.Good]: 0,
    [QualitativePerformance.Ok]: 0,
    [QualitativePerformance.Fail]: 0,
  };
  casts.forEach((cast) => {
    performanceCounts[cast.performance]++;
  });

  const totalCasts = casts.length;
  const filteredCount = filteredCasts.length;
  const validIndex = Math.min(currentIndex, Math.max(0, filteredCount - 1));
  const currentCast = filteredCount > 0 ? filteredCasts[validIndex] : null;
  const originalIndex = currentCast ? casts.indexOf(currentCast) : -1;
  const castColor = currentCast
    ? qualitativePerformanceToColor(currentCast.performance)
    : 'rgba(255,255,255,0.3)';

  // Width % for timeline rectangles:
  // ≤5 casts → 20% each (max), scales down to 5% at 20, wraps after 20
  const rectWidthPct = Math.max(100 / Math.max(filteredCount, 5), 100 / 30);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCasts.length - 1));
  }, [filteredCasts.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < filteredCasts.length - 1 ? prev + 1 : 0));
  }, [filteredCasts.length]);

  // Keyboard navigation (arrow keys when container is focused)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch swipe navigation
  const touchStartXRef = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? handleNext() : handlePrevious();
    }
  };

  const togglePerformanceFilter = (performance: QualitativePerformance) => {
    setPerformanceFilter((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(performance)) {
        newSet.delete(performance);
      } else {
        newSet.add(performance);
      }
      if (currentIndex >= filteredCasts.length) {
        setCurrentIndex(0);
      }
      return newSet;
    });
  };

  const statsContent = (
    <PerfBadgeGrid>
      {PERF_LEVELS.map(({ perf, label }) => {
        const count = performanceCounts[perf] ?? 0;
        const disabled = count === 0;
        const color = disabled ? '#c8c8c8' : qualitativePerformanceToColor(perf);
        const badge = (
          <FilterBadge
            key={label}
            color={color}
            active={!disabled && performanceFilter.has(perf)}
            disabled={disabled}
            onClick={!disabled ? () => togglePerformanceFilter(perf) : undefined}
          >
            <PerfBadgeCount color={color}>{count}</PerfBadgeCount>
            <PerfBadgeDivider color={color} />
            <PerfBadgeLabel>{label}</PerfBadgeLabel>
          </FilterBadge>
        );
        if (disabled) return badge;
        return (
          <Tooltip key={label} content={`${label} casts — ${count} / ${totalCasts}`}>
            {badge}
          </Tooltip>
        );
      })}
    </PerfBadgeGrid>
  );

  const headerDescription = description ? (
    <HelperTextRow>
      <HelperText>{description}</HelperText>
    </HelperTextRow>
  ) : undefined;

  return (
    <GuideDataWrapper
      bare
      title={title}
      subtitle="Cast Details"
      stats={statsContent}
      statsHelperText="Click a filter to show only those casts"
      helperText={headerDescription}
    >
      {filteredCount === 0 ? (
        <div className={styles.noResultsMessage}>
          <div className={styles.noResultsTitle}>No casts match the current filter</div>
          <div className={styles.noResultsHint}>
            Click the performance badges above to toggle filters
          </div>
        </div>
      ) : (
        <div
          className={styles.cardContainer}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.timelineRow}>
            <div className={styles.timelineRectContainer}>
              {filteredCasts.map((cast, idx) => (
                <Tooltip
                  key={idx}
                  content={`Cast #${casts.indexOf(cast) + 1} · ${cast.timestamp} · ${cast.performance}`}
                >
                  <button
                    className={`${styles.timelineRect} ${idx === validIndex ? styles.timelineRectActive : ''}`.trim()}
                    style={
                      {
                        width: `calc(${rectWidthPct}% - 3px)`,
                        '--rect-color': qualitativePerformanceToColor(cast.performance),
                        '--rect-color-hover': `${qualitativePerformanceToColor(cast.performance)}cc`,
                        '--rect-color-inactive': `${qualitativePerformanceToColor(cast.performance)}55`,
                      } as ColorStyle
                    }
                    onClick={() => setCurrentIndex(idx)}
                  />
                </Tooltip>
              ))}
            </div>
          </div>

          {/* key=validIndex forces remount on navigation, replaying the fade-in animation */}
          <div
            className={styles.castCard}
            style={
              {
                '--cast-color': castColor,
                '--card-accent-end': `${castColor}20`,
                '--card-accent-start': `${castColor}90`,
                '--header-perf-bg': `${castColor}12`,
                '--header-perf-border': `${castColor}45`,
              } as ColorStyle
            }
            key={validIndex}
          >
            <div className={styles.cardHeader}>
              <button
                className={styles.headerNavBtn}
                onClick={handlePrevious}
                disabled={validIndex === 0}
              >
                <span className={styles.navChevron}>&#8249;</span>
                <span className={styles.navDivider} />
                <span className={styles.navLabel}>Prev</span>
              </button>
              <div className={styles.castMeta}>
                <div className={styles.headerPerfBadge}>{currentCast!.performance}</div>
                <span className={styles.castLabel}>
                  Cast {originalIndex + 1} / {filteredCount} · {currentCast!.timestamp}
                </span>
              </div>
              <button
                className={styles.headerNavBtn}
                onClick={handleNext}
                disabled={validIndex === filteredCount - 1}
              >
                <span className={styles.navLabel}>Next</span>
                <span className={styles.navDivider} />
                <span className={styles.navChevron}>&#8250;</span>
              </button>
            </div>

            <StatsGrid style={{ marginBottom: '10px' }}>
              {currentCast!.stats.map((stat, statIdx) => {
                const statColor = stat.performance
                  ? qualitativePerformanceToColor(stat.performance)
                  : castColor;
                return (
                  <Tooltip key={statIdx} content={stat.tooltip}>
                    <StatCard color={statColor}>
                      <StatCardValue color={statColor}>{stat.value}</StatCardValue>
                      <StatCardDivider color={statColor} />
                      <StatCardLabel>{stat.label}</StatCardLabel>
                    </StatCard>
                  </Tooltip>
                );
              })}
            </StatsGrid>

            {currentCast!.additionalContent && (
              <div className={styles.additionalContentContainer}>
                {currentCast!.additionalContent.title && (
                  <div className={styles.additionalContentHeading}>
                    {currentCast!.additionalContent.title}
                  </div>
                )}
                {currentCast!.additionalContent.content}
              </div>
            )}

            {currentCast!.details && (
              <TipBox
                icon={
                  currentCast!.detailsIcon === undefined ? (
                    <PerformanceMark perf={currentCast!.performance} />
                  ) : (
                    currentCast!.detailsIcon
                  )
                }
              >
                {currentCast!.details}
              </TipBox>
            )}

            <div className={styles.cardAccentBar} />
          </div>
        </div>
      )}
    </GuideDataWrapper>
  );
}

// HelperTextRow, StatCard, StatsGrid, PerfBadge*, FilterBadge are defined in GuideDataWrapper and re-exported from there.
export {
  HelperTextRow,
  StatCard,
  StatCardValue,
  StatCardDivider,
  StatCardLabel,
  StatsGrid,
  PerfBadgeGrid,
  PerfBadgeCount,
  PerfBadgeDivider,
  PerfBadgeLabel,
  FilterBadge,
} from './GuideDataWrapper';
