import styled from '@emotion/styled';
import { Tooltip } from 'interface';
import { qualitativePerformanceToColor, PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState, useMemo, useCallback, useRef } from 'react';
import { TipBox } from './TipBox';
import GuideDataWrapper, {
  HelperText,
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
            <NavButton onClick={handlePrevious} disabled={filteredCount <= 1}>
              &#8249;
            </NavButton>
            <TimelineRectContainer>
              {filteredCasts.map((cast, idx) => (
                <Tooltip
                  key={idx}
                  content={`Cast #${casts.indexOf(cast) + 1} · ${cast.timestamp} · ${cast.performance}`}
                >
                  <TimelineRect
                    style={{ width: `calc(${rectWidthPct}% - 3px)` }}
                    color={qualitativePerformanceToColor(cast.performance)}
                    active={idx === validIndex}
                    onClick={() => setCurrentIndex(idx)}
                  />
                </Tooltip>
              ))}
            </TimelineRectContainer>
            <NavButton onClick={handleNext} disabled={filteredCount <= 1}>
              &#8250;
            </NavButton>
            <TimelineCounter>
              {validIndex + 1}&thinsp;/&thinsp;{filteredCount}
            </TimelineCounter>
          </TimelineRow>

          {/* key=validIndex forces remount on navigation, replaying the fade-in animation */}
          <CastCard key={validIndex} color={castColor}>
            <CardHeader>
              <CastMeta>
                Cast <CastNum>#{originalIndex + 1}</CastNum>
                <MetaSep>·</MetaSep>
                {currentCast!.timestamp}
              </CastMeta>
              <PerfLabel color={castColor}>{currentCast!.performance}</PerfLabel>
            </CardHeader>

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
              <TipBox icon={<PerformanceMark perf={currentCast!.performance} />}>
                {currentCast!.details}
              </TipBox>
            )}

            <CardAccentBar color={castColor} />
          </CastCard>
        </CardContainer>
      )}
    </GuideDataWrapper>
  );
}

/** Row containing timeline rects + nav buttons + counter */
const TimelineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding: 5px 6px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 6px;
`;

/** Flex-wrap container for timeline rectangles */
const TimelineRectContainer = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
  padding: 3px 0;
`;

/** Clickable colored rectangle representing one cast */
const TimelineRect = styled.button<{ color: string; active: boolean }>`
  height: 16px;
  min-width: 8px;
  flex-shrink: 0;
  border-radius: 2px;
  background: ${(props) => (props.active ? props.color : props.color + '55')};
  border: 2px solid ${(props) => (props.active ? props.color : 'transparent')};
  outline: ${(props) => (props.active ? `2px solid rgba(255,255,255,0.6)` : 'none')};
  outline-offset: 1px;
  cursor: pointer;
  padding: 0;
  transition:
    background 0.12s ease,
    outline 0.12s ease;

  &:hover {
    background: ${(props) => props.color + 'cc'};
  }
`;

/** Cast counter shown in the timeline row */
const TimelineCounter = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 28px;
  text-align: right;
`;

/** Focusable container; captures keyboard and touch events for navigation */
const CardContainer = styled.div`
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(250, 183, 0, 0.4);
    border-radius: 8px;
  }
`;

/** Single cast card — animates in on each navigation */
const CastCard = styled.div<{ color: string }>`
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 14px 14px;
  overflow: hidden;
  animation: castFadeIn 0.18s ease;

  @keyframes castFadeIn {
    from {
      opacity: 0.3;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

const CastMeta = styled.div`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CastNum = styled.span`
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
`;

const MetaSep = styled.span`
  color: rgba(255, 255, 255, 0.2);
`;

/** Performance label — colored text, no box */
const PerfLabel = styled.div<{ color: string }>`
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${(props) => props.color};
`;

/** Bottom gradient accent bar in the card's performance color */
const CardAccentBar = styled.div<{ color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    to right,
    ${(props) => props.color}90 0%,
    ${(props) => props.color}20 100%
  );
`;

const NoResultsMessage = styled.div`
  padding: 16px 12px;
  text-align: center;
  border-radius: 4px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
`;

const NoResultsTitle = styled.div`
  font-size: 1.2rem;
  margin-bottom: 3px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
`;

const NoResultsHint = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.27);
`;

const AdditionalContentContainer = styled.div`
  margin-top: 8px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

const AdditionalContentHeading = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ── Shared primitives (exported for use by CastSummary, CastOverview, BuffUptimeBar, CastSequence) ──

export const HelperTextRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

export const NavButton = styled.button<{ disabled?: boolean }>`
  min-width: 32px;
  height: 32px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, ${(props) => (props.disabled ? '0.04' : '0.1')});
  border-radius: 6px;
  color: ${(props) => (props.disabled ? 'rgba(255,255,255,0.15)' : '#fab700')};
  font-size: 1.8rem;
  font-weight: 400;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  line-height: 1;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background: rgba(250, 183, 0, 0.12);
    border-color: rgba(250, 183, 0, 0.35);
  }

  &:active:not(:disabled) {
    transform: scale(0.9);
    background: rgba(250, 183, 0, 0.18);
  }
`;

// StatCard, StatsGrid, PerfBadge*, FilterBadge are defined in GuideDataWrapper and re-exported from there.
export {
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
