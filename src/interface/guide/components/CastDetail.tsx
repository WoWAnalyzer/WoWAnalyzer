import cssComponent from 'interface/utils/css-component';
import styles from './CastDetail.module.scss';
import { Tooltip } from 'interface';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState, useMemo, useCallback, useRef } from 'react';
import { PerformanceTipBox } from './TipBox';
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
import clsx from 'clsx';

/** A single statistic about a cast (e.g., damage dealt, targets hit) */
export interface PerCastStat {
  /** The stat value to display — string or any ReactNode (e.g. a SpellIcon) */
  value: React.ReactNode;
  /** Label describing what this stat represents */
  label: string;
  /** Detailed tooltip content for this stat */
  tooltip?: React.ReactNode | null;
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
  const rectWidthPct = Math.max(100 / Math.max(filteredCount, 5), 100 / 20);

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
        <NoResultsMessage>
          <NoResultsTitle>No casts match the current filter</NoResultsTitle>
          <NoResultsHint>Click the performance badges above to toggle filters</NoResultsHint>
        </NoResultsMessage>
      ) : (
        <CardContainer
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <TimelineRow>
            <TimelineRectContainer>
              {filteredCasts.map((cast, idx) => {
                const index = casts.indexOf(cast) + 1;
                const content = cast.tooltip
                  ? cast.tooltip
                  : `Cast #${index} · ${cast.timestamp} · ${cast.performance}`;
                return (
                  <Tooltip key={idx} content={content}>
                    <TimelineRect
                      style={{ width: `calc(${rectWidthPct}% - 3px)` }}
                      color={qualitativePerformanceToColor(cast.performance)}
                      onClick={() => setCurrentIndex(idx)}
                      className={clsx({ [styles.active]: idx === currentIndex })}
                    />
                  </Tooltip>
                );
              })}
            </TimelineRectContainer>
          </TimelineRow>

          {/* key=validIndex forces remount on navigation, replaying the fade-in animation */}
          <CastCard key={validIndex} color={castColor}>
            <CardHeader>
              <HeaderNavBtn onClick={handlePrevious} disabled={validIndex === 0}>
                <span className="nav-chevron">&#8249;</span>
                <span className="nav-divider" />
                <span className="nav-label">Prev</span>
              </HeaderNavBtn>
              <CastMeta>
                <HeaderPerfBadge color={castColor}>{currentCast!.performance}</HeaderPerfBadge>
                <CastLabel>
                  Cast {originalIndex + 1} / {filteredCount} · {currentCast!.timestamp}
                </CastLabel>
              </CastMeta>
              <HeaderNavBtn onClick={handleNext} disabled={validIndex === filteredCount - 1}>
                <span className="nav-label">Next</span>
                <span className="nav-divider" />
                <span className="nav-chevron">&#8250;</span>
              </HeaderNavBtn>
            </CardHeader>

            {currentCast!.stats.length > 0 && (
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
            )}

            {currentCast!.additionalContent && (
              <AdditionalContentContainer>
                {currentCast!.additionalContent.title && (
                  <AdditionalContentHeading>
                    {currentCast!.additionalContent.title}
                  </AdditionalContentHeading>
                )}
                {currentCast!.additionalContent.content}
              </AdditionalContentContainer>
            )}

            {currentCast!.details && (
              <PerformanceTipBox
                performance={currentCast!.performance}
                icon={currentCast!.detailsIcon ?? undefined}
                hideIcon={currentCast!.detailsIcon === null}
              >
                {currentCast!.details}
              </PerformanceTipBox>
            )}

            <CardAccentBar color={castColor} />
          </CastCard>
        </CardContainer>
      )}
    </GuideDataWrapper>
  );
}

/** Row containing the cast timeline rectangles */
const TimelineRow = cssComponent('div', styles.TimelineRow, [] as const);

/** Flex-wrap container for timeline rectangles */
const TimelineRectContainer = cssComponent('div', styles.TimelineRectContainer, [] as const);

/** Clickable colored rectangle representing one cast */
const TimelineRect = cssComponent('button', styles.TimelineRect, ['color'] as const);

/** Stat-card-style nav button: chevron + divider + label */
const HeaderNavBtn = cssComponent('button', styles.HeaderNavBtn, [] as const);

/** Focusable container; captures keyboard and touch events for navigation */
const CardContainer = cssComponent('div', styles.CardContainer, [] as const);

/** Single cast card — animates in on each navigation */
const CastCard = cssComponent('div', styles.CastCard, ['color'] as const);

const CardHeader = cssComponent('div', styles.CardHeader, [] as const);

const CastMeta = cssComponent('div', styles.CastMeta, [] as const);

const HeaderPerfBadge = cssComponent('div', styles.HeaderPerfBadge, ['color'] as const);

const CastLabel = cssComponent('span', styles.CastLabel, [] as const);

/** Bottom gradient accent bar in the card's performance color */
const CardAccentBar = cssComponent('div', styles.CardAccentBar, ['color'] as const);

const NoResultsMessage = cssComponent('div', styles.NoResultsMessage, [] as const);

const NoResultsTitle = cssComponent('div', styles.NoResultsTitle, [] as const);

const NoResultsHint = cssComponent('div', styles.NoResultsHint, [] as const);

const AdditionalContentContainer = cssComponent(
  'div',
  styles.AdditionalContentContainer,
  [] as const,
);

const AdditionalContentHeading = cssComponent('div', styles.AdditionalContentHeading, [] as const);

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
