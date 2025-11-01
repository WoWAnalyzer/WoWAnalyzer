import styled from '@emotion/styled';
import { Tooltip } from 'interface';
import { qualitativePerformanceToColor, PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState, useMemo, useCallback } from 'react';
import { TipBox } from './TipBox';
import {
  StatsRow,
  StatValue,
  StatLabel,
  HelperText,
  HelperTextRow,
  NavigationButtons,
  NavButton,
  NavCounter,
  StatsGrid,
  StatItem,
  StatItemValue,
  StatItemLabel,
} from './GuideDivs';
import GuideDataWrapper from './GuideDataWrapper';

export interface PerCastStat {
  value: string;
  label: string;
  tooltip: React.ReactNode;
  performance?: QualitativePerformance;
}

export interface PerCastData {
  performance: QualitativePerformance;
  stats: PerCastStat[];
  tooltip?: React.ReactNode;
  timestamp: string;
  details?: React.ReactNode;
}

interface CastDetailProps {
  title: string;
  casts: PerCastData[];
  description?: string;
  fontSize?: string;
}

/**
 * Displays per-cast statistics in a grid with performance-based colored boxes.
 * Each box represents one cast with its stats and overall performance.
 * Includes navigation controls and performance filtering.
 */
export default function CastDetail({
  title,
  casts,
  description,
  fontSize = '16px',
}: CastDetailProps) {
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

  // Filter casts based on performance
  const filteredCasts = useMemo(() => {
    return casts.filter((cast) => performanceFilter.has(cast.performance));
  }, [casts, performanceFilter]);

  // Calculate overall performance summary
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

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCasts.length - 1));
  }, [filteredCasts.length]);
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < filteredCasts.length - 1 ? prev + 1 : 0));
  }, [filteredCasts.length]);

  const togglePerformanceFilter = (performance: QualitativePerformance) => {
    setPerformanceFilter((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(performance)) {
        newSet.delete(performance);
      } else {
        newSet.add(performance);
      }
      // Reset index if current cast is filtered out
      if (currentIndex >= filteredCasts.length) {
        setCurrentIndex(0);
      }
      return newSet;
    });
  };

  // Ensure current index is valid
  const validIndex = Math.min(currentIndex, filteredCount - 1);
  const currentCast = filteredCount > 0 ? filteredCasts[validIndex] : null;
  const currentCastColor = currentCast
    ? qualitativePerformanceToColor(currentCast.performance)
    : 'rgba(255, 255, 255, 0.3)';

  const statsContent = (
    <StatsRow>
      {performanceCounts[QualitativePerformance.Perfect] > 0 && (
        <Tooltip
          content={`Perfect casts - ${performanceCounts[QualitativePerformance.Perfect]} / ${totalCasts}`}
        >
          <FilterStatCard
            color={qualitativePerformanceToColor(QualitativePerformance.Perfect)}
            active={performanceFilter.has(QualitativePerformance.Perfect)}
            onClick={() => togglePerformanceFilter(QualitativePerformance.Perfect)}
          >
            <StatValue>{performanceCounts[QualitativePerformance.Perfect]}</StatValue>
            <StatLabel>Perfect</StatLabel>
          </FilterStatCard>
        </Tooltip>
      )}
      {performanceCounts[QualitativePerformance.Good] > 0 && (
        <Tooltip
          content={`Good casts - ${performanceCounts[QualitativePerformance.Good]} / ${totalCasts}`}
        >
          <FilterStatCard
            color={qualitativePerformanceToColor(QualitativePerformance.Good)}
            active={performanceFilter.has(QualitativePerformance.Good)}
            onClick={() => togglePerformanceFilter(QualitativePerformance.Good)}
          >
            <StatValue>{performanceCounts[QualitativePerformance.Good]}</StatValue>
            <StatLabel>Good</StatLabel>
          </FilterStatCard>
        </Tooltip>
      )}
      {performanceCounts[QualitativePerformance.Ok] > 0 && (
        <Tooltip
          content={`Ok casts - ${performanceCounts[QualitativePerformance.Ok]} / ${totalCasts}`}
        >
          <FilterStatCard
            color={qualitativePerformanceToColor(QualitativePerformance.Ok)}
            active={performanceFilter.has(QualitativePerformance.Ok)}
            onClick={() => togglePerformanceFilter(QualitativePerformance.Ok)}
          >
            <StatValue>{performanceCounts[QualitativePerformance.Ok]}</StatValue>
            <StatLabel>Ok</StatLabel>
          </FilterStatCard>
        </Tooltip>
      )}
      {performanceCounts[QualitativePerformance.Fail] > 0 && (
        <Tooltip
          content={`Failed casts - ${performanceCounts[QualitativePerformance.Fail]} / ${totalCasts}`}
        >
          <FilterStatCard
            color={qualitativePerformanceToColor(QualitativePerformance.Fail)}
            active={performanceFilter.has(QualitativePerformance.Fail)}
            onClick={() => togglePerformanceFilter(QualitativePerformance.Fail)}
          >
            <StatValue>{performanceCounts[QualitativePerformance.Fail]}</StatValue>
            <StatLabel>Bad</StatLabel>
          </FilterStatCard>
        </Tooltip>
      )}
    </StatsRow>
  );

  const statsHelperText = (
    <span style={{ textAlign: 'right' }}>Click performance boxes to toggle filters</span>
  );

  const headerDescription = description ? (
    <HelperTextRow>
      <HelperText>{description}</HelperText>
    </HelperTextRow>
  ) : undefined;

  return (
    <GuideDataWrapper
      title={title}
      subtitle="Cast Details"
      stats={statsContent}
      statsHelperText={statsHelperText}
      helperText={headerDescription}
    >
      {filteredCount === 0 ? (
        <NoResultsMessage>
          <NoResultsTitle>No casts match the current filter</NoResultsTitle>
          <NoResultsHint>Click the performance boxes above to toggle filters</NoResultsHint>
        </NoResultsMessage>
      ) : (
        <PerformanceContainer color={currentCastColor}>
          <CastHeader>
            <CastTitle>
              Cast #{casts.indexOf(currentCast!) + 1} ({currentCast!.timestamp}) -{' '}
              {currentCast!.performance}
            </CastTitle>
            <NavigationButtons>
              <NavButton onClick={handlePrevious} disabled={filteredCount <= 1}>
                ‹
              </NavButton>
              <NavCounter>
                {validIndex + 1} / {filteredCount}
              </NavCounter>
              <NavButton onClick={handleNext} disabled={filteredCount <= 1}>
                ›
              </NavButton>
            </NavigationButtons>
          </CastHeader>

          <StatsGrid>
            {currentCast!.stats.map((stat, statIdx) => {
              const color = stat.performance
                ? qualitativePerformanceToColor(stat.performance)
                : 'rgba(255, 255, 255, 0.3)';
              return (
                <Tooltip key={statIdx} content={stat.tooltip}>
                  <StatItem color={color}>
                    <StatItemValue fontSize={fontSize}>{stat.value}</StatItemValue>
                    <StatItemLabel>{stat.label}</StatItemLabel>
                  </StatItem>
                </Tooltip>
              );
            })}
          </StatsGrid>

          {currentCast!.details && (
            <TipBox icon={<PerformanceMark perf={currentCast!.performance} />}>
              {currentCast!.details}
            </TipBox>
          )}
        </PerformanceContainer>
      )}
    </GuideDataWrapper>
  );
}

const FilterStatCard = styled.div<{ color: string; active: boolean }>`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  min-width: 70px;
  border-left: 3px solid ${(props) => props.color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  cursor: pointer;
  opacity: ${(props) => (props.active ? 1 : 0.4)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    opacity: 1;
  }

  &:active {
    transform: translateY(0);
  }
`;

const PerformanceContainer = styled.div<{ color: string }>`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 12px;
  border-left: 4px solid ${(props) => props.color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NoResultsMessage = styled.div`
  padding: 30px 20px;
  text-align: center;
  color: #999;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  margin-top: 8px;
`;

const NoResultsTitle = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: bold;
`;

const NoResultsHint = styled.div`
  font-size: 12px;
`;

const CastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const CastTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fab700;
`;
